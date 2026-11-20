# Newsroom — plan
Branch `newsroom`, one commit per phase, nothing pushed. Progress is tracked in
`docs/newsroom/status.md`.

## Shared design
- **One pure core, two loaders.** `src/lib/newsroom-core.js` (no Vite API, no
  DOM) parses and normalises a piece. The site reads files through
  `src/lib/newsroom.js` (`import.meta.glob`); Node scripts read them from disk
  through `scripts/newsroom/lib/content.mjs`. Both call the same core, so the
  validator, the post-build and the pages cannot interpret a file differently.
- **Dates stay strings.** Frontmatter is parsed with js-yaml's `JSON_SCHEMA`,
  which does not turn timestamps into `Date`. Days and times are formatted from
  the written text, so there is no day shift and the offset is shown as written.
- **One SEO model.** `src/lib/site.js` builds title, description, canonical,
  Open Graph, Twitter and JSON-LD for a route. The runtime (`src/lib/seo.js`)
  applies it to the DOM, the post-build prints it into HTML. The origin comes
  from `public/CNAME` in both (a Vite `define` at build time).
- **One markdown renderer.** `src/lib/newsroomMarkdown.js` (plain
  `createElement`, no JSX) is used by the pages and, through
  `react-dom/server`, by the static fallback, the feed and the validator.
- **Drafts never enter a bundle.** A small plugin in `vite.config.js` empties
  non-published files at load time. Only `npm run dev:drafts` lets them through.

## Phase 1 — content model, loader, validator
Add: `src/lib/newsroom-core.js`, `src/lib/newsroom.js`,
`src/lib/newsroomMarkdown.js`, `src/content/dispatch/_template.md`,
`src/content/lens/_template.md`, `scripts/newsroom/validate.mjs`,
`scripts/newsroom/lib/*.mjs`, `scripts/newsroom/fixtures/**`,
`scripts/newsroom/dev-drafts.mjs`, `scripts/newsroom/build.mjs`.
Change: `package.json` (scripts only), `vite.config.js` (draft plugin, origin).

## Phase 2 — pages, routes, migration
Add: `src/pages/DispatchArchive.jsx`, `DispatchIssue.jsx`, `LensArchive.jsx`,
`LensArticle.jsx`, `OnTheRecord.jsx`, `Subscribe.jsx`,
`src/components/newsroom/*`, `src/components/LatestInsights.jsx`,
`src/content/dispatch/001-the-power-law-lands.md`, `002-…md` (from Buttondown).
Change: `src/pages/Insights.jsx` (hub), `src/App.jsx` (routes, redirects),
`src/components/Header.jsx` (one href), `NewsletterSignup.jsx`, `Home.jsx`,
`News.jsx`, `Contact.jsx`, `src/lib/seo.js`, and the pages that say "monthly".
Remove: `NewsletterIndex.jsx`, `NewsletterIssue01.jsx`, `newsletterIssues.json`.

## Phase 3 — static HTML, previews, feed, sitemap
Add: `scripts/newsroom/postbuild.mjs`, `scripts/newsroom/check-dist.mjs`,
`scripts/newsroom/browser-checks/**`, `public/og/default.png`,
`public/robots.txt`. Change: `index.html` (default OG/Twitter tags).

## Phase 4 — email hand-off
Add: `scripts/newsroom/build-email.mjs`, `scripts/newsroom/send-email.mjs`,
their tests and fixture, `.github/workflows/dispatch-email.yml`.

## Phase 5 — data collector
Add: `scripts/data/collect.mjs`, `scripts/data/fixtures/**`,
`.github/workflows/data-collector.yml`.

## Phase 6 — documentation and report
Add: `docs/newsroom/authoring.md`, `docs/reports/newsroom-01.md`.
Change: `CLAUDE.md`, `README.md`.

## Open points and how they are resolved
1. **`nav.json` needs no change.** The "Newsletter" target lives in the
   `submenuHrefs` map of `Header.jsx`; only that line changes.
2. **Browser checks follow `network-lab`**: a self-contained folder with its own
   `package.json` and `puppeteer-core`, driving the installed Chrome. The site's
   `package.json` gains no dependency.
3. **Validator fixtures.** One valid tree of real files plus `cases.json`: each
   case is one named change to that tree and the one error code it must
   produce. The self-test also requires that the untouched tree passes.
4. **Explainers keep their format** (no `status`, summary longer than 200
   characters). The validator applies to them only the rules that concern them:
   reserved names, unique slugs, images, leftover markers.
5. **No archive route for Explainers** is asked for, so the hub's Explainers
   section is their archive: three latest, and the rest shown in place.
6. **`/news` gets a static page too**, because the redirect stubs create
   `dist/news/` and every directory created must have an `index.html`.
7. **Explainer `og:image`**: the hashed hero is found in `dist/assets` by
   comparing bytes with the source file; no build manifest is published.
8. **Subscripts in issue 1** (`β<sub>A</sub>`): the renderer accepts `<sub>` and
   `<sup>` only; any other raw HTML is a validation error.
9. **`deploy.yml` is left alone**: it already calls `npm run build`, now the whole pipeline.
