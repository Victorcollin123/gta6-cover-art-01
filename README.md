# Vice Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Victorcollin123/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Victorcollin123/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Vice Cover Studio turns your photos into a neon-drenched poster cover in the spirit of GTA 6 key art. Pick a multi-panel layout, drop a photo into each frame, grade it like a Miami sunset, set the headline, and download a print-ready PNG. Everything runs in the browser — your photos never leave your machine.

## What you can do

- **Fill every panel your way** — each panel takes its own upload, or starts with a painted sample scene (a boulevard sunset, a neon pier, a palm-lined dusk). Drag a photo to reposition it, zoom with the slider or scroll wheel, flip it, or swap the scene.
- **Three poster layouts** — hero plus two stacked panels, an even three-way split, or one full-bleed photo.
- **Four canvas grades** — Vice Sunset, Neon Nights, Palm Noir and Pastel Vice. Each one re-lights the poster with its own wash, top light and caption accent.
- **Print texture** — halftone dots that follow the poster's own shadows, film grain and a vignette, each with its own strength.
- **Headline typography** — an editable title, tagline and place line in condensed display type (Oswald and Archivo Black, bundled under the SIL Open Font License), with an outline, a sunset gradient fill and a drop shadow.
- **Three export sizes** — 1080 × 1350 portrait, 1080 × 1080 square and 1920 × 1080 landscape, rendered at full resolution and saved as PNG.

## Run it

No build step and no server is required. Open `app/index.html` in any modern browser, or serve the folder if you prefer:

```sh
cd app && python3 -m http.server 8080
```

then open http://localhost:8080.

## How it is put together

- `app/index.html` — the whole editor page: poster stage on the left, control rail on the right.
- `app/css/vice.css` — the studio chrome: dark glass panels, neon accents.
- `app/js/state.js` — the poster model: layouts, export sizes and panel state.
- `app/js/samples.js` — the three sample scenes, each painted in code on a canvas.
- `app/js/grades.js` — the four colour grades and how each one re-lights a poster.
- `app/js/render.js` — the poster painter: panels, captions, grade, halftone, grain, vignette.
- `app/js/ui.js` — the rail wiring: uploads, drag-to-pan, wheel zoom, shuffle and reset.
- `app/js/export.js` — full-resolution PNG export.
- `app/js/main.js` — startup: fonts, first paint, and the `?cover=` mode used for screenshots.
- `app/fonts/` — Oswald and Archivo Black (SIL OFL), loaded locally so the app works offline.
- `screenshots/` — the submission screenshots.
- `main.ts` — the hand-in program: copies `app/` and `screenshots/` to the output folder and writes `dossier.json` with the kit's vendored library (`vendor/makefun-app.ts`). Run it with `MAKEFUN_OUTPUT_DIR=out node main.ts`.

Every image in this repo is drawn in code or supplied by you. No Rockstar logo, artwork, wordmark or font is used anywhere.

---

Entered on [make.fun](https://make.fun/?ref=qp17c3xn&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards
