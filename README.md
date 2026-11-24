# Scientific Bitcoin Institute — Website

Production: [scientificbitcoininstitute.org](https://scientificbitcoininstitute.org)

Built with **Vite + React + Tailwind CSS**, deployed to **GitHub Pages** via GitHub Actions.

---

## Local development

```bash
npm install    # first time only
npm run dev    # starts dev server at http://localhost:5173
npm run build  # content check, vite build, static pages — produces /dist
```

Other commands:

| Command | What it does |
|---|---|
| `npm run dev:drafts` | dev server with Insights drafts visible (DRAFT ribbon) |
| `npm run validate` | checks the Insights content; `-- --self-test` tests the checker |
| `npm run check:dist` | checks the finished build in `dist/` |
| `npm run test:email` | tests the SBI Dispatch email hand-off (no network) |
| `npm run test:data` | tests the public data collector (no network) |

`npm run build` stops at the first content error, so a malformed article is
never published.

## How the site is organized

```
public/             static assets served at the URL root
├── assets/         images, logo
├── data/           JSON written daily by the newhedge.io workflow
└── CNAME           tells GitHub Pages to serve on the custom domain

src/
├── content/        markdown: Insights (dispatch/, lens/, insights/), lab lectures
├── components/     React components (Header, Hero, Footer, …)
│   └── charts/     chart components (read /data/*.json at runtime)
├── data/           static content: nav, hero slides, testimonials, research areas
│                   edit these JSON files to change site content
├── lib/            content loaders, SEO model, markdown renderer
├── pages/          page compositions
└── main.jsx        entry point

scripts/
├── fetch-newhedge.js   runs daily, pulls from Newhedge, writes public/data/*.json
├── newsroom/           Insights pipeline: validator, post-build, checks, email
├── data/               public data collector (publishes to the `data` branch)
└── lab/                Complexity Lab helpers

.github/workflows/
├── deploy.yml                 build + deploy on every push to main
├── fetch-newhedge-daily.yml   cron job, 06:00 UTC daily
├── dispatch-email.yml         hands a new SBI Dispatch issue to Buttondown (draft or scheduled)
└── data-collector.yml         hourly, refreshes the public series on the `data` branch
```

## Adding new content

**Publish in Insights** (an SBI Dispatch issue, a Lens piece, an Explainer):
add one markdown file. Step by step: [docs/newsroom/authoring.md](docs/newsroom/authoring.md).

**Add a research area card:** edit `src/data/researchAreas.json`.

**Add a hero slide:** edit `src/data/heroSlides.json`.

**Add a nav item / dropdown entry:** edit `src/data/nav.json`.

**Add a new page:** create `src/pages/YourPage.jsx`, then wire it up in `App.jsx` (you'll want to add a router like `react-router-dom` once you have more than a handful of pages).

**Add a new chart:** create a new component under `src/components/charts/`, have it fetch from a new `public/data/<name>.json`, and add a corresponding fetch step in `scripts/fetch-newhedge.js`.

## Secrets

The newhedge.io API key lives as a GitHub Actions Secret named `NEWHEDGE_API_KEY`. Set it at: **repo → Settings → Secrets and variables → Actions → New repository secret**. Never commit it to the repo.

The newsletter hand-off uses the secret `BUTTONDOWN_API_KEY` and the repository
variable `DISPATCH_EMAIL_MODE` (`draft` or `scheduled`); see
[docs/newsroom/authoring.md](docs/newsroom/authoring.md). This repository is
public: commit only what is meant to be published.
