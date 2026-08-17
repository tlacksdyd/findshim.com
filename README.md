# KORE — findshim.com

Marketing site for **KORE**, the app that helps people find public toilets
anywhere in Korea, in their own language.

Static HTML/CSS — no build step. Deployed via **GitHub Pages**.

## Structure

Korean is the default locale and lives at the root; English mirrors it under
`/en/`.

```
.
├── index.html            # / — Korean landing page
├── privacy/index.html    # /privacy — Privacy Policy (App Store / AdMob compliance)
├── support/index.html    # /support — Support & FAQ
├── contact/index.html    # /contact — Contact
├── en/                   # English mirror: /en/, /en/privacy/, /en/support/, /en/contact/
├── ko/                   # Legacy /ko/ URLs — noindex redirects to the root pages
├── 404.html              # Custom not-found page (absolute paths — served from the domain root)
├── assets/
│   ├── styles.css        # Single shared stylesheet (design system)
│   ├── site.js           # Only script: sticky-header hairline + scroll reveal
│   ├── shots/            # App screenshots (홈 · 지도 · 상세 · 게임, ko + en)
│   ├── favicon.png       # Browser favicon / brand mark
│   ├── app-icon.png      # App icon (apple-touch-icon)
│   ├── logo-mark.png     # Transparent app mark (used inside the screenshots)
│   ├── og-image.png      # Social card — Korean pages
│   └── og-image-en.png   # Social card — English pages
├── tools/screenshots/    # Regenerates assets/shots from the sibling app checkout
├── CNAME                 # Custom domain: findshim.com
├── app-ads.txt           # AdMob verification
├── robots.txt
├── sitemap.xml
└── .nojekyll             # Serve files as-is (skip Jekyll processing)
```

## Editing copy

- **Two locales:** every page exists twice (root = Korean, `/en/` = English).
  Edit both, keep the header `.lang-switch` links pointing at each page's own
  counterpart, and list new pages in `sitemap.xml`.
- **Store links:** live in `index.html` and `en/index.html` only, as two pairs
  of `.store-btn` anchors (hero + CTA). Keep them in sync if a URL changes.
- **Privacy page:** derived from the app's `PRIVACY_POLICY.md` — update the
  Korean and English pages together when the app's policy changes.

## Screenshots

The phones on the landing pages are real captures of the app's screens, one set
per locale, in `assets/shots/`. They are generated, not hand-shot:

```bash
node tools/screenshots/build.js
```

The script rebuilds 홈 · 지도 · 상세 시트 · 게임 from the sibling `../app`
checkout — its theme tokens, its Ionicons font, its `ko`/`en` strings — and
captures each at 390×844 @2x with headless Chrome. It needs that checkout with
`node_modules` installed, and Chrome (or `CHROME_BIN`). **When a screen changes
in the app, change it in `build.js` and re-run**; the pages themselves only
point at the PNGs.

## Local preview

```bash
python -m http.server 8000   # then open http://localhost:8000
```

