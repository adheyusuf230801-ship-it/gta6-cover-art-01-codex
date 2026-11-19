# Neon Coast Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/adheyusuf230801-ship-it/gta6-cover-art-01-codex/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/adheyusuf230801-ship-it/gta6-cover-art-01-codex/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Make your own coastal cover story from photographs and a caption. Neon Coast is an offline poster studio for the [$250 make.fun bounty](https://make.fun/bounty/gta6-cover-art-01), with original compositions, sunset and neon washes, bold condensed system lettering, and a halftone title band.

## Start without a connection

Open `app/index.html` in desktop Chrome. There is no installation or build step, and the app makes no external requests. Photos are processed locally. Alternatively, with Node 22 or newer, run `node serve.ts` and open `http://127.0.0.1:8080`. Change the port with `node serve.ts --port 8090`.

## Compose a cover

Choose Hero, Grid, Single, or Strip. Try the included Pier or Boulevard photograph, or load a photo from your device. With “To all panels” checked, one image fills the composition. Uncheck it and select a numbered panel to give that frame its own photo. Click a frame in the proof or its thumbnail, drag to position the image, and adjust Zoom. Arrow keys move the crop; Shift moves it farther. Reset restores centered framing.

Choose Vice sunset, Neon, Gold, or Noir, then write a caption and subtitle. Download a PNG at 1080 × 1080, 1080 × 1350, or 1920 × 1080. Preview and download use the same renderer. No official artwork, game logos, character assets, or proprietary fonts are included. The two sample JPEGs and MIT license are unchanged kit assets.

## Build the dossier

Run `node main.ts` to copy the static app and screenshots into `/output` and build `/output/dossier.json` with the unchanged kit library. For a writable local test location, use `MAKEFUN_OUTPUT_DIR=/tmp/neon-coast-check node main.ts`. Both command-line programs use only Node's standard library.

The four URLs and viewports in `shots.json` are deterministic. `?shot=editor` presents the controls, while `?shot=cover` presents only the finished cover. Both honor `photo`, `caption`, `layout`, and `size`; `window.__shotReady` becomes true after the images, fonts, and rendering are ready.

Fresh screenshots are pending a separate recorded capture session. Existing screenshot files are retained from the previous round and do not verify this rebuild. Replace them with the real captures before producing the final submission dossier.

Rebuild checks passed for syntax, local asset paths, export options, shot parameters, and dossier packaging to `/tmp`. This recording environment denies HTTP listening and browser startup, so a served-page request check and actual browser rendering remain unverified. Its filesystem also denies the default `/output` destination; use the override above for local packaging tests.

make.fun referral: https://make.fun/r/pe031vr5
