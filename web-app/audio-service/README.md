---
title: De-Tok Audio Service
sdk: docker
app_port: 7860
---

Optional downloader backend for public Instagram and TikTok clips. It runs yt-dlp and FFmpeg, which the main app's Worker host cannot execute. It never accepts Instagram login cookies. Retrieval remains subject to platform restrictions.

Deploy this directory as a Docker service (for example, a Render Free web service; check its current limits). Set a randomly generated `EXTRACTOR_TOKEN` secret in the backend. In the De-Tok Site environment set `REEL_EXTRACTOR_URL` to the service's HTTPS origin and `REEL_EXTRACTOR_TOKEN` to the same secret. Keep the token server-side.

The main app calls `/extract` with an authenticated POST; the service returns 16 kHz mono WAV as base64. No files or transcripts are retained. One clip at a time, up to 180 seconds. The service can idle and cold start; requests may need retrying. No hosting account or backend URL has been configured yet.

Manual verification before enabling: POST the user's sample URL with the secret bearer token, confirm a valid audioBase64 response, then verify the app can decode and transcribe it. Test restricted/private links fail cleanly. The Docker deployment itself has not been tested in this workspace.

### Native Python service on Render

The service also works without Docker. Use the Free plan and these settings:

- Build: `pip install -r audio-service/requirements.txt`
- Start: `uvicorn server:app --app-dir audio-service --host 0.0.0.0 --port $PORT`
- Health check: `/health`
- Secret: `EXTRACTOR_TOKEN` (a random private token shared with the De-Tok server)

`imageio-ffmpeg` supplies a Linux FFmpeg binary when the host has none. Downloads and decoded audio are temporary. The service accepts only supported public platform links; it does not use login cookies. Instagram can still refuse some public media.
