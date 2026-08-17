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
│   ├── favicon.png       # Browser favicon / brand mark
│   ├── app-icon.png      # App icon (apple-touch-icon)
│   ├── og-image.png      # Social card — Korean pages
│   └── og-image-en.png   # Social card — English pages
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

## Local preview

```bash
python -m http.server 8000   # then open http://localhost:8000
```

