# Vice Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Victorcollin123/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Victorcollin123/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Cover Studio is a fully offline poster maker: drop in your own photo, pick a multi-panel layout, write a caption, and it renders GTA 6-style cover art — big condensed lettering, a sunset or neon colour grade, halftone dots, film grain and a vignette — then exports a share-ready PNG.

## What it does

- **Any photo, any panel** — upload one photo or several, from your machine only. Each panel can take its own photo, one photo can fill several panels, and every panel pans by dragging, zooms with a slider or the scroll wheel, and flips.
- **Three layouts** — a large hero panel with two side panels, a three-panel split, or a single full-bleed panel.
- **Four grades, drawn on canvas** — Vice Sunset, Neon Nights, Palm Noir and Pastel Vice, each with its own sun glow, wash and lettering accent, plus halftone, grain and vignette overlays.
- **Live caption** — an editable title, subtitle and place line in condensed display type (Oswald and Archivo Black, shipped under the SIL Open Font License), with an outline, a gradient fill and a drop shadow.
- **Three export sizes** — 1920×1080, 1080×1080 and 1080×1350, rendered at full resolution and downloaded as PNG.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network requests, nothing uploaded.

## How it is built

- `app/index.html` — the editor page: controls on the left, live canvas preview on the right.
- `app/src/cover.js` — the poster engine: layouts, grades, overlays and lettering, all drawn on canvas.
- `app/src/main.js` — the editor wiring: uploads, panel controls, drag-to-pan, wheel zoom and export.
- `app/src/shots.js` — the fixed `?shot=cover` and `?shot=editor` scenes used for the screenshots.
- `app/style.css` — the editor chrome.
- `main.ts` — copies `app/` and `screenshots/` to the output folder and writes `dossier.json`.
- `shots.json` — the screenshot scenes, in step with `shots.js`.

All art in this repo is original. No Rockstar logo, artwork, wordmark or font is used anywhere.

---

Entered on [make.fun](https://make.fun/?ref=qp17c3xn&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards
