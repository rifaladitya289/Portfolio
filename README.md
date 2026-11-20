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

## Other HTML files

- `home-preview.html` — separate preview page.
- `portfolio-legacy.html` — legacy/redirect page; inspect before changing.

## Maintenance safety

1. Make changes on a dedicated branch, not directly on `main`.
2. Keep a known-good backup branch before cleanup.
3. Check every file reference before moving or deleting an asset.
4. Change one small area at a time and review the diff.
5. Run syntax and page checks after each code change.
6. Do not delete `style.css` or media files solely because they appear unused; verify all references and intended archive use first.

## Current audit notes

- `index.html` currently references `studio.css`, `intro.css`, `fit.js`, `intro.js`, `main.js`, and `motion.js`.
- `style.css` is not directly referenced by the current `index.html`; its removal has not been approved.
- Contact comments are stored in the visitor's browser storage. The message form currently validates input but is not connected to an email service.
- Some optional image paths mentioned by page scripts/styles are not present in the repository yet. Verify whether each is actually required before adding or removing anything.

This document is maintenance documentation only; it does not change website behavior.
