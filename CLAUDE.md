# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The marketing/legal site for **KORE** (`findshim.com`) — a static HTML/CSS site
introducing the KORE app and hosting the `/privacy` and `/support` pages that
App Store and AdMob review require. The KORE app source itself lives in the
sibling `../kore` folder (an Expo React Native app — since 2.2.0 a worldwide
toilet app: 230+ countries, 800K+ toilets, 5 languages, plus the KORE toilet
mascot you raise); read `../kore/CLAUDE.md` and `../kore/scripts/changelog.json`
when site copy needs to stay in sync with the app. The headline numbers
(230+ · 80만+/800K+ · 5) are the owner-confirmed figures in
`../data/pic,video/스토어 소개이미지_261023/업로드_가이드.txt`.

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
- **Design language (2.2.0 renewal, 2026-10-27):** the app's launch screen and
  icon — a sky-blue → violet gradient (`--grad`) with the white KORE mascot —
  carries the hero and CTA; the KORE section (`.kore-section`) uses the warm
  wood of the Grow workshop (`--wood-*`); the map's coral pin (`--pink`) is the
  one accent for actions. Bold Pretendard (variable, dynamic subset), lots of
  white. The phones are a CSS bezel (`.device`) around a real screenshot
  (`.shot`, 780x1552), one set per locale. Mascot poses, toilet levels, coin
  and crystal art in `assets/kore/` are copied from `../kore/assets/kore` and
  `../kore/assets/kore-remote/v4` (resized webp).
- **Flags:** Windows draws flag emoji as two letters, so `styles.css` loads the
  `Twemoji Country Flags` font (country-flag-emoji-polyfill on jsDelivr) for the
  regional-indicator range only — keep it first in `--font`.
- **Copy the owner removed from the store stays off the landing pages:**
  since 2026-10-24 nothing about "깨끗한 화장실" (clean toilets) is advertised —
  the map filter (funnel) ended in 2.2.0. Support may still explain the button.
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

## Screenshots

`assets/shots/{map,world,tokyo,nearby,detail,grow,room}-{ko,en}.webp` are
**real iPhone captures** of app 2.2.0 from `../data/pic,video/261023/`
(1179x2556), made by **`python tools/screenshots/crop.py`**: it cuts the AdMob
*test* banner out (found by its blue OPEN button), blacks out the Dynamic
Island (the capture tool's icon sits in it), and evens every shot to 780x1552.
`abroad-{ko,en}.webp` and `ranking-en.webp` are sheet cut-outs floated next to
a phone (`.ui-card`). Re-run the script after replacing a capture and look at
the output — a new layout can need a different `fix` band.

The four PNGs `{home,map,detail,kore}-en.png` are the older 2.1.0 simulator
captures; only `/press/` uses them (the press kit's wording is the owner's, from
`../kore/press/presskit.md`). Replace them there before deleting them.

`python tools/screenshots/og.py` rebuilds the social cards (`og-image.png`,
`og-image-en.png`, 1200x630) from the world shot, the mascot and Pretendard
Bold in `../kore/assets/fonts`.

`tools/screenshots/build.js` is the older generator that rebuilt the 2.0 screens
as HTML; it does not know the current app and is kept only for reference.

## Copy that must stay in sync

- **Store links** live in `index.html` and `en/index.html` only, as two pairs
  of `.store-btn` anchors (hero + CTA), plus the JSON-LD `downloadUrl` in each
  page's head. The Korean page links the `kr` App Store; the English page the
  storefront-neutral `apps.apple.com/app/id6774883751`.
- **Privacy** — `privacy/index.html` (and its `/en/` twin) is the policy itself,
  revised for 2.2.0 (commit 50499cd); `terms/` is the paid-services terms. Both
  are legal text the owner approves — do not rewrite them unasked. When the app
  adds something that touches personal data (ads, subscriptions, push, crash
  reports, ...), update both locales and the effective date. The support page's
  deletion section is kept word-for-word in step with privacy section 5.
- **No 모두의 게임 (modoogame).** The owner dropped it on 2026-10-27; its pages,
  icon and sitemap entries are gone. Don't bring any of it back.
- **Button and tab names** quoted in the copy are the app's own labels, from
  `../kore/src/i18n/locales/{ko,en}.json` — e.g. 도보 길 찾기 / "Walking
  directions", 정보가 틀렸나요? 수정·삭제 요청하기 / "Something wrong? Suggest an
  edit or removal". Since 2.1.1 the tabs are **지도 · KORE · 전체 / Map · KORE ·
  All** (one bottom sheet over an always-visible map; 홈 and 게임 are gone, and
  the map's search bar is gone since 2.2.0). The app supports **5 languages**
  (ko · en · ja · zh-CN · zh-TW). Check the locale file before naming a control
  in prose. KORE Premium's benefits are `premiumBenefit*` / `benefitNotice2Line3`
  there — do not list a benefit the app no longer gives.

Contact email used across the site: `findshim@gmail.com`.
