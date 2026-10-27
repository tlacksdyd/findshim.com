# KORE — findshim.com

Marketing site for **KORE**, the worldwide toilet app made together —
800,000+ toilets in 230+ countries on one map, in five languages, plus KORE,
the toilet mascot you raise.

Static HTML/CSS — no build step. Deployed via **GitHub Pages**.

## Structure

English is the default locale and lives at the root; Korean mirrors it under
`/ko/`. Korean browsers are sent to `/ko/` once, unless the visitor picked a
language (see CLAUDE.md).

```
.
├── index.html            # / — English landing page (the default)
├── privacy/index.html    # /privacy — Privacy Policy (App Store / AdMob compliance)
├── support/index.html    # /support — Support & FAQ
├── contact/index.html    # /contact — Contact
├── terms/index.html      # /terms — Terms for paid services (coins, crystals, subscriptions)
├── press/index.html      # /press — English press kit (uses the 2.1.0 PNG shots)
├── ko/                   # Korean mirror: /ko/, /ko/support/, /ko/privacy/, /ko/contact/, /ko/terms/
├── en/                   # Legacy /en/ URLs — noindex redirects to the root pages
├── favicon.ico           # 48px favicon for browsers and Google
├── 404.html              # Custom not-found page (absolute paths — served from the domain root)
├── assets/
│   ├── styles.css        # Single shared stylesheet (design system)
│   ├── site.js           # Only script: sticky-header hairline + scroll reveal
│   ├── shots/            # App 2.2.0 screenshots (webp, ko + en) — tools/screenshots/crop.py
│   ├── kore/             # Mascot poses, toilet levels, coin/crystal art (from ../kore/assets)
│   ├── favicon.png       # Browser favicon (the app icon)
│   ├── app-icon.png      # App icon (apple-touch-icon); app-icon-512.png for JSON-LD
│   ├── logo-mark.png     # Transparent app mark
│   ├── og-image.png      # Social card — Korean pages
│   └── og-image-en.png   # Social card — English pages
├── tools/screenshots/    # crop.py (shots), og.py (social cards), build.js (old 2.0 generator)
├── CNAME                 # Custom domain: findshim.com
├── app-ads.txt           # AdMob verification
├── robots.txt
├── sitemap.xml
└── .nojekyll             # Serve files as-is (skip Jekyll processing)
```

## Editing copy

- **Two locales:** every page exists twice (root = English, `/ko/` = Korean).
  Edit both, keep the header `.lang-switch` links pointing at each page's own
  counterpart, and list new pages in `sitemap.xml`.
- **Store links:** live in `index.html` and `ko/index.html` only, as two pairs
  of `.store-btn` anchors (hero + CTA). Keep them in sync if a URL changes.
- **Privacy page:** derived from the app's `PRIVACY_POLICY.md` — update the
  Korean and English pages together when the app's policy changes.

## Screenshots

The phones on the landing pages are real iPhone captures of app 2.2.0, one set per
locale, in `assets/shots/`. `python tools/screenshots/crop.py` makes them from
`../data/pic,video/261023/` — test ad banner cut out, 780x1552 webp.
`python tools/screenshots/og.py` rebuilds the social cards.

## Local preview

```bash
python -m http.server 8000   # then open http://localhost:8000
```

