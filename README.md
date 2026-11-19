# Neon Coast Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/adheyusuf230801-ship-it/gta6-cover-art-01-codex/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/adheyusuf230801-ship-it/gta6-cover-art-01-codex/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Turn a camera-roll moment into a neon coastal crime-poster cover. This entry for the [$250 make.fun cover-art bounty](https://make.fun/bounty/gta6-cover-art-01) runs entirely on your device, with no uploads, dependencies, accounts, or build step.

Choose Hero, Grid, Single, or Strip. Load your own image or either included sample. Apply it to all panels, or uncheck “To all panels” and compose a different photograph in each frame. Select panels using their thumbnails or the preview, drag to position, and use the zoom slider. Arrow keys move the selected crop while the preview has focus. Reset restores that panel's framing.

Four grades — Vice sunset, Neon, Gold, and Noir — complement bold system-font lettering and a halftone title block. Edit the title and subtitle, then download a PNG in square (1080 × 1080), portrait (1080 × 1350), or wide (1920 × 1080) format. No official game artwork, logos, or fonts are included.

## Offline use

Open `app/index.html` directly in desktop Chrome, or run `node serve.ts` and visit `http://127.0.0.1:8080`. Use `node serve.ts --port 8090` for a different port. All app resources are local, including both kit sample photos.

## Submission

Run `node main.ts` with Node 22 to assemble `/output/app`, `/output/screenshots`, and the canonical `/output/dossier.json` through the unmodified kit builder. For a local destination, use `MAKEFUN_OUTPUT_DIR=/tmp/neon-coast-output node main.ts`. `shots.json` describes four deterministic browser scenes; each sets `window.__shotReady` after rendering. The cover mode displays only the finished art.

Built for make.fun using referral code `pe031vr5`: https://make.fun/r/pe031vr5

## Capture status for this rebuild

Fresh screenshots are pending: the session's sandbox refused Chrome's headless profile creation. The four existing JPEGs are from the prior round and were left untouched; they do not depict this rebuild. Do not treat them as the new submission's screenshots. In an environment that permits Chrome, run `node shoot.mjs` (Chrome plus Python 3/Pillow required). It captures the actual file-URL scenes and transcodes them to gate-sized JPEGs before replacing all four images. Then rebuild the dossier. The sandbox also refused local HTTP listening with `EPERM`; browser rendering and served request checks remain unverified here.
