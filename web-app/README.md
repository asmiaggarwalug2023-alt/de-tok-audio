# De-Tok — Evidence, not influence

Live app: https://de-tok-evidence.asmi-aggarwal-ug2023.chatgpt.site/

A consumer health and wellness research companion built by Asmi Aggarwal with Codex. Lavender, EB Garamond, and Sage the little lamb scientist.

## Experiences
- Check a social-media claim, reel link, transcript or uploaded clip. Search terms are extracted from the claim. Public reel audio extraction is best-effort; transcripts are editable.
- De-Tok Time: swipe left through health research, choose subjects, inspect original titles/abstracts and save reads on your device. Crossref with a Europe PMC/PubMed fallback. Refresh is explicit so reading does not jump.
- Products & Treatments: prepared, sourced claim reviews connected to a live PubMed-index research library with cursor pagination.
- Click Sage for sourced facts and research nuggets. New study results are distinguished from established facts.
- Feedback is saved privately in D1; owner-only inbox requires the configured owner identity.
- Installable PWA. Compatible Android browsers support text/link share targets. iPhone uses copy/paste.

## Scientific boundaries
A search result is not a verdict. Prepared reviews are not systematic reviews or independent product testing. Experimental on-device claim analysis may misinterpret abstracts and must be checked against sources. Paper-specific captions rephrase research questions rather than asserting new benefits. Animal and laboratory findings are labelled. This app is for research literacy, not diagnosis or personalised medical advice.

## Development
Node 22+, pnpm (version in package.json). Install using `pnpm install`, run `pnpm dev`, check `pnpm exec tsc --noEmit`, build `pnpm build`. Cloudflare Workers-compatible Vinext application. Deployment configuration is in `.openai/hosting.json`; runtime secrets are configured separately, never committed.

Optional runtime configuration: REEL_EXTRACTOR_URL, REEL_EXTRACTOR_TOKEN, FEEDBACK_OWNER_EMAIL. Audio extraction backend source is in `audio-service/`. Private feedback needs the configured D1 binding and migrations; owner authentication needs the hosting auth configuration.

Whisper small/base, Tesseract OCR and an experimental Qwen browser model download on demand and run on the device. Browser memory and platform support affect availability. Initial downloads need internet. Claims are not saved on our server; user-saved reports and reading lists use browser storage.

## AI tools and sources
Codex helped implement, design, test and deploy the app. Sources include Europe PMC/PubMed, Crossref and the authoritative source links in prepared reviews. Font licenses are in `public/fonts/`. Generated Sage artwork is included in public assets.
