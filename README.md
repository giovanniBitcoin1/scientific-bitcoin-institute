# Scientific Bitcoin Institute — Website

Production: [scientificbitcoininstitute.org](https://scientificbitcoininstitute.org)

Built with **Vite + React + Tailwind CSS**, deployed to **GitHub Pages** via GitHub Actions.

---

## Local development

```bash
npm install    # first time only
npm run dev    # starts dev server at http://localhost:5173
npm run build  # produces /dist — the production bundle
```

## How the site is organized

```
public/             static assets served at the URL root
├── assets/         images, logo
├── data/           JSON written daily by the newhedge.io workflow
└── CNAME           tells GitHub Pages to serve on the custom domain

src/
├── components/     React components (Header, Hero, Footer, …)
│   └── charts/     chart components (read /data/*.json at runtime)
├── data/           static content: nav, hero slides, testimonials, research areas
│                   edit these JSON files to change site content
├── pages/          page compositions
└── main.jsx        entry point

scripts/
└── fetch-newhedge.js   runs daily, pulls from Newhedge, writes public/data/*.json

.github/workflows/
├── deploy.yml                 build + deploy on every push to main
└── fetch-newhedge-daily.yml   cron job, 06:00 UTC daily
```

## Adding new content

**Add a research area card:** edit `src/data/researchAreas.json`.

**Add a hero slide:** edit `src/data/heroSlides.json`.

**Add a nav item / dropdown entry:** edit `src/data/nav.json`.

**Add a new page:** create `src/pages/YourPage.jsx`, then wire it up in `App.jsx` (you'll want to add a router like `react-router-dom` once you have more than a handful of pages).

**Add a new chart:** create a new component under `src/components/charts/`, have it fetch from a new `public/data/<name>.json`, and add a corresponding fetch step in `scripts/fetch-newhedge.js`.

## Secrets

The newhedge.io API key lives as a GitHub Actions Secret named `NEWHEDGE_API_KEY`. Set it at: **repo → Settings → Secrets and variables → Actions → New repository secret**. Never commit it to the repo.
