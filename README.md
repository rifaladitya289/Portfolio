# Portfolio

Personal portfolio website published with GitHub Pages.

## Main files

- `index.html` — main page structure and script/style references.
- `studio.css` — active stylesheet referenced by `index.html`.
- `intro.css` — intro presentation styles.
- `main.js` — portfolio sections, interactions, and contact/comment UI.
- `motion.js` — motion and interaction effects.
- `intro.js` — intro sequence.
- `fit.js` — small layout fitting helper.
- `assets/` — images, video, and other static media.
- `archive/legacy/` — retained legacy files that are not loaded by the current website.

## Other HTML files

- `home-preview.html` — separate preview page.
- `portfolio-legacy.html` — legacy/redirect page; inspect before changing.

## Maintenance safety

1. Make changes on a dedicated branch, not directly on `main`.
2. Keep a known-good backup branch before cleanup.
3. Check every file reference before moving or deleting an asset.
4. Change one small area at a time and review the diff.
5. Run syntax and page checks after each code change.
6. Keep unreferenced media until its purpose and visual content have been reviewed.

## Current audit notes

- `index.html` currently references `studio.css`, `intro.css`, `fit.js`, `intro.js`, `main.js`, and `motion.js`.
- The old root `style.css` and inactive `assets/hero-snippet.html` are retained in `archive/legacy/`; they are not loaded by the current pages.
- `assets/hero-video.zip` was removed from this cleanup branch after no references were found.
- Several background videos have no active source-code references and remain under review until their visual contents and intended use are checked.
- Contact comments are stored in the visitor's browser storage. The message form currently validates input but is not connected to an email service.
- Some optional image paths mentioned by page scripts/styles are not present in the repository yet. Verify whether each is actually required before adding or removing anything.

This document is maintenance documentation only; it does not change website behavior.
