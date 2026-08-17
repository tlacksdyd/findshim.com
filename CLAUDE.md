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

Plain HTML + a single shared stylesheet + one small script. There is no bundler,
framework, or package manager — open the files directly. Preview locally with:

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
- **Design language:** bold type, heavy whitespace, and the app's coral
  `--brand: #ff385c` (the `:root` block also mirrors the app's map-pin palette
  from `mapHtml.ts` as `--pin-*`). The hero device mockup is pure CSS
  (`.device` / `.screen` / the `.m-*` classes), not a screenshot — the app
  ships most changes over OTA, so a captured PNG goes stale silently while
  this does not.
- **One optional script.** `assets/site.js` is the only JS: a header hairline
  on scroll and an `IntersectionObserver` reveal for `[data-reveal]` elements.
  It is pure progressive enhancement — the `js` class that arms the reveal is
  set by a one-liner in each page's `<head>`, so a page whose script fails to
  load shows all its content instead of none. Keep that property.
- **Korean is the default locale and lives at the root** (`/`, `/privacy/`,
  `/support/`, `/contact/`); English mirrors it under `/en/` with the same
  design and file layout. The two copies are written for their own readers, not
  translated line-for-line — keep it that way when editing. English pages are
  one level deeper, so their asset/stylesheet paths use `../assets/…` (and
  `../../assets/…` for `/en/<page>/`).
- **`/ko/` is a legacy forwarder tree.** The old Korean URLs still exist as
  tiny `noindex, follow` pages that `location.replace()` to their new root
  counterpart. Don't delete them (old links and store listings point there) and
  don't add new pages under `/ko/`.
- **Language switch.** Every real page's header carries a `.lang-switch` pill
  (한국어 / EN) — two plain links, no JS. Each link must point at *that page's*
  own counterpart (e.g. `/support/` ↔ `/en/support/`), and the current locale
  gets `class="ls-opt is-active"` plus `aria-current`. Pages also declare
  `<link rel="alternate" hreflang>` for `ko`, `en`, and `x-default` (Korean).
  When adding a page, add it in both trees, wire the switch both ways, and list
  it in `sitemap.xml`.
- **Social cards** are per-locale: `assets/og-image.png` for Korean pages,
  `assets/og-image-en.png` for `/en/`.

## Copy that must stay in sync

- **Store links** live in `index.html` and `en/index.html` only, as two pairs
  of `.store-btn` anchors (hero + CTA). Keep all four in sync per page if a
  store URL changes.
- **Privacy** — `privacy/index.html` (and its `/en/` twin) is derived from the
  app's `PRIVACY_POLICY.md`; if the app's policy changes, update both pages.

Contact email used across the site: `cyshim0715@gmail.com`.
