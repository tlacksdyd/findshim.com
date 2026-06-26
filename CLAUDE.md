# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The marketing/legal site for **KORE** (`findshim.com`) — a static HTML/CSS site
introducing the KORE app and hosting the `/privacy` and `/support` pages that
App Store and AdMob review require. The KORE app source itself lives in the
sibling `../app` folder (an Expo React Native app for finding public toilets in
Korea); read `../app/CLAUDE.md` and `../app/PRIVACY_POLICY.md` when site copy
needs to stay in sync with the app.

## No build step

Plain HTML + a single shared stylesheet. There is no bundler, framework, or
package manager — open the files directly. Preview locally with:

```bash
python -m http.server 8000   # http://localhost:8000
```

## Deployment

- Hosted on **GitHub Pages**, repo `tlacksdyd/findshim.com`, built from the
  `main` branch root (`/`). **Pushing to `main` redeploys automatically** —
  there is no Actions workflow; Pages serves the branch as-is.
- `CNAME` pins the custom domain `findshim.com`; `.nojekyll` disables Jekyll so
  files are served verbatim. Don't delete either.
- `.deploy/` holds a local-only helper (`enforce-https.sh`, gitignored) that
  polls DNS + GitHub's TLS cert and enables "Enforce HTTPS" once the cert is
  approved. It is not part of the published site.

## Architecture & conventions

- **Clean URLs via folders:** each subpage is `<name>/index.html` (e.g.
  `privacy/index.html` serves `/privacy/`). Add new pages the same way.
- **Relative links only.** Pages link with `../` and `name/` (never root-relative
  `/name/`) so the site works both on the custom domain root and at the
  `tlacksdyd.github.io/findshim.com/` project path. Keep this when adding links.
  (`404.html` is the exception — GitHub serves it from the domain root, so it
  uses absolute `/` paths.)
- **One stylesheet, one design system.** All styling lives in
  `assets/styles.css`, driven by CSS custom properties under `:root` (palette,
  type, layout tokens). The header/footer markup is duplicated across pages by
  hand (no includes) — change all pages together when editing shared chrome.
- **Toss-inspired** visual language: bold type, heavy whitespace, the
  `--brand` blue. The hero phone mockup is pure CSS (`.phone`), not an image.

## Editable placeholders (intentional, leave discoverable)

Copy the owner fills in later is marked, not hard-coded:

- **Store links** — in `index.html`, the App Store / Play Store anchors use
  `href="#"` with `data-placeholder="app-store-url"` / `"play-store-url"`.
  Replace the `href` when the app ships; keep both occurrences (hero + CTA) in
  sync.
- **Support copy** — `support/index.html` uses `<div class="placeholder">`
  blocks (FAQ answers, troubleshooting) for the owner to paste real text.
- **Privacy** — `privacy/index.html` is pre-filled from the app's
  `PRIVACY_POLICY.md`; if the app's policy changes, update this page to match.

Contact email used across the site: `cyshim0715@gmail.com`.
