# KORE — findshim.com

Marketing site for **KORE**, the app that helps tourists find public toilets
anywhere in Korea, in their own language.

Static HTML/CSS — no build step. Deployed via **GitHub Pages**.

## Structure

```
.
├── index.html          # Landing page (App Store / Play Store placeholders)
├── privacy/index.html  # /privacy — Privacy Policy (App Store / AdMob compliance)
├── support/index.html  # /support — Support & FAQ (editable placeholders)
├── 404.html            # Custom not-found page
├── assets/
│   ├── styles.css      # Single shared stylesheet (design system)
│   ├── favicon.png     # Browser favicon / logo
│   └── app-icon.png    # App icon (OG image / apple-touch-icon)
├── CNAME               # Custom domain: findshim.com
├── robots.txt
├── sitemap.xml
└── .nojekyll           # Serve files as-is (skip Jekyll processing)
```

## Editing copy

- **Store links:** in `index.html`, replace the two `href="#"`
  (`data-placeholder="app-store-url"` / `data-placeholder="play-store-url"`)
  with your real store URLs once the app is published.
- **Support page:** fill in each `<div class="placeholder">` block in
  `support/index.html`.
- **Privacy page:** `privacy/index.html` is pre-filled from the app's
  `PRIVACY_POLICY.md`; edit any section and delete the placeholder note.

## Local preview

```bash
python -m http.server 8000   # then open http://localhost:8000
```

