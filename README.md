# romantapps.github.io

Source for **[https://romantapps.github.io/](https://romantapps.github.io/)** — the marketing site for
**RomanT Apps**, a family of six free, offline-first self-development reading apps for Android by
[Roman Tsisyk](https://roman-tsisyk.com).

Static site, no build step, no framework — plain HTML/CSS/JS (only Google Fonts is loaded externally).

## Pages

| File | Purpose |
|---|---|
| `index.html` | Landing page — the six apps, features, languages, about the author |
| `support.html` | Support & FAQ (with `FAQPage` structured data) |
| `privacy.html` | Privacy Policy |
| `terms.html` | Terms of Use |
| `404.html` | Not-found page |

Assets live in `assets/` (`css/`, `js/`, `img/`, `screens/`).

## SEO & AI

- JSON-LD: `WebSite`, `Person`, `ItemList`, `BreadcrumbList`, `FAQPage`
- `sitemap.xml`, `robots.txt`, per-page canonical + Open Graph/Twitter + author meta
- `llms.txt` ([llmstxt.org](https://llmstxt.org)) and AI-crawler allowances in `robots.txt`

## Deploy

Served by GitHub Pages from the default branch at the repo root. `.nojekyll` disables Jekyll processing.
No custom domain (no `CNAME`) — the site lives at `https://romantapps.github.io/`.

## Local preview

```bash
python3 -m http.server 4599
# open http://localhost:4599/
```

All page copy, screenshots and app metadata are sourced from the live Google Play listings — no placeholder data.
