import {allowedMedia} from '../reel/extract';
const MAX=30*1024*1024;
export async function GET(request:Request){
 try{
  const raw=new URL(request.url).searchParams.get('src');if(!raw||!allowedMedia(raw)||raw.length>6000)return new Response('Unsupported media URL',{status:400});
  const r=await fetch(raw,{redirect:'error',headers:{Referer:'https://www.instagram.com/'},signal:AbortSignal.timeout(30000)});
  if(!r.ok||!r.body)return new Response('The media link expired or was refused. Retrieve the reel again.',{status:422});
  if(Number(r.headers.get('Content-Length'))>MAX)return new Response('Media is too large. Use a clip under 30 MB.',{status:413});
  const type=r.headers.get('Content-Type')||'';if(!/^(audio|video)\//i.test(type)&&!type.startsWith('application/octet-stream'))return new Response('The response was not an audio or video file.',{status:422});
  let bytes=0;const stream=r.body.pipeThrough(new TransformStream({transform(chunk,controller){bytes+=chunk.byteLength;if(bytes>MAX){controller.error(new Error('Media exceeded 30 MB'));return}controller.enqueue(chunk)}}));
  return new Response(stream,{headers:{'Content-Type':type,'Cache-Control':'no-store'}});
 }catch{return new Response('Media retrieval failed. Try retrieving the reel again or upload the video.',{status:503})}
}
