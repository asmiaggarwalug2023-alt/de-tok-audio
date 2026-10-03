"""Optional authenticated downloader for public reels; no account cookies accepted."""
import asyncio, base64, hmac, io, os, shutil, subprocess, tempfile, wave
from urllib.request import Request, urlopen
from urllib.parse import urlparse
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
import yt_dlp

app = FastAPI()
slots = asyncio.Semaphore(1)
class Payload(BaseModel):
    url: str

def extract(url):
    options = {"quiet":True,"no_warnings":True,"noplaylist":True,"socket_timeout":15,"retries":0,"extractor_retries":0,"skip_download":True}
    with yt_dlp.YoutubeDL(options) as ydl:
        info = ydl.extract_info(url, download=False)
    if info.get("_type") == "playlist":
        raise ValueError("Share one reel, not a playlist.")
    if (info.get("duration") or 0) > 180:
        raise ValueError("Use a clip of 3 minutes or less.")
    formats = [f for f in info.get("formats",[]) if f.get("url") and f.get("vcodec") == "none"]
    if not formats:
        formats = [f for f in info.get("formats",[]) if f.get("url") and f.get("ext") == "mp4" and f.get("acodec") != "none"]
    if not formats:
        raise ValueError("No public audio track was available.")
    f = formats[0]
    media = urlparse(f["url"])
    # Restrict ffmpeg's network destination to known platform-owned media domains.
    allowed = (".cdninstagram.com", ".fbcdn.net", ".tiktokcdn.com", ".tiktokcdn-us.com", ".byteoversea.com", ".ibytedtos.com", ".tiktokv.com")
    if media.scheme != "https" or not media.hostname or not media.hostname.endswith(allowed) or media.port not in (None,443):
        raise ValueError("The platform returned an unsupported media host.")
    # Fetch with Python, then decode a local temporary file. FFmpeg never makes network requests.
    with tempfile.TemporaryDirectory(prefix="detok-") as directory:
        path = os.path.join(directory,"source.media")
        req = Request(f["url"],headers={"Referer":"https://www.instagram.com/"})
        with urlopen(req,timeout=25) as response, open(path,"wb") as output:
            final = urlparse(response.url)
            if final.scheme!="https" or not final.hostname or not final.hostname.endswith(allowed):
                raise ValueError("Unsupported media redirect.")
            count = 0
            while chunk := response.read(65536):
                count += len(chunk)
                if count > 30*1024*1024:
                    raise ValueError("Media exceeds 30 MB.")
                output.write(chunk)
        binary=shutil.which("ffmpeg")
        if not binary:
            import imageio_ffmpeg
            binary=imageio_ffmpeg.get_ffmpeg_exe()
        command = [binary,"-nostdin","-hide_banner","-loglevel","error","-protocol_whitelist","file,pipe","-i",path,"-t","181","-vn","-ac","1","-ar","16000","-f","wav","pipe:1"]
        done = subprocess.run(command,capture_output=True,timeout=60)
    if done.returncode or not done.stdout:
        raise ValueError("The platform refused the audio download. Upload the file instead.")
    if len(done.stdout) > 6_000_000:
        raise ValueError("The audio exceeds the clip limit.")
    # A streaming WAV's declared length can be unknown; compute duration from decoded samples.
    with wave.open(io.BytesIO(done.stdout),"rb") as audio:
        pcm = audio.readframes(3_000_000)
        seconds = len(pcm) / (audio.getframerate()*audio.getnchannels()*audio.getsampwidth())
    if seconds > 180:
        raise ValueError("Use a clip of 3 minutes or less.")
    return {"audioBase64":base64.b64encode(done.stdout).decode(),"caption":str(info.get("description") or "")[:4000],"kind":"audio","duration":seconds}

@app.get('/health')
def health():
    return {"ok":True}

@app.post('/extract')
async def endpoint(payload:Payload, authorization:str=Header(default='')):
    token=os.environ.get('EXTRACTOR_TOKEN','')
    if not token or not hmac.compare_digest(authorization,'Bearer '+token):
        raise HTTPException(401,'Authentication required')
    parsed=urlparse(payload.url)
    if len(payload.url)>2000 or parsed.scheme!='https' or parsed.hostname not in ('www.instagram.com','instagram.com','www.tiktok.com','tiktok.com','vm.tiktok.com','vt.tiktok.com') or parsed.username or parsed.password:
        raise HTTPException(400,'Use a public Instagram or TikTok link')
    if slots.locked():
        raise HTTPException(429,'Another clip is processing. Try again shortly.')
    async with slots:
        try:return await asyncio.to_thread(extract,payload.url)
        except Exception as e:
            detail=str(e) if isinstance(e,ValueError) else 'The platform refused retrieval or processing timed out. Upload the clip instead.'
            raise HTTPException(422,detail)
