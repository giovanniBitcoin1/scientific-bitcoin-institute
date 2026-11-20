# Newsroom — status

Resume with: "Read docs/newsroom/status.md and continue." The brief is
`01-newsroom-prompt.md.local` in the repo root (not committed); the plan is
`docs/newsroom/plan.md`.

Rules that stay in force: branch `newsroom` only, no push, no merge, never touch
`network-lab`; one commit per phase (`Newsroom: <phase>`); the build passes at
every commit; no new runtime dependency; nothing bash-only.

## Phase

Phase 4 (email hand-off to Buttondown) — done.

## Done

- Phase 0: survey, `docs/newsroom/plan.md`.
- Phase 1: `src/lib/newsroom-core.js` (pure model), `src/lib/newsroom.js`
  (site loader), `src/lib/newsroomMarkdown.js` (renderer), `src/lib/site.js`
  (canonical URLs, SEO model, copy), templates in `src/content/dispatch` and
  `src/content/lens`, `scripts/newsroom/validate.mjs` with `--self-test`
  (`fixtures/valid` + `fixtures/cases.json`), `npm run validate`,
  `npm run dev:drafts`, draft exclusion in `vite.config.js`.
  `npm run build` = validate, then `vite build`.

- Phase 2: hub `/insights`, `/insights/dispatch[/:slug]`, `/insights/lens[/:slug]`,
  `/insights/on-the-record` (route only while a claim exists), `/subscribe`,
  router redirects for the old newsletter URLs, `LatestInsights` on the home
  page, runtime SEO from `src/lib/site.js` (`RouteCanonical` in `App.jsx`).
  Issue 1 migrated from the JSX page; issue 2 imported from the Buttondown
  archive (fetched on 2026-11-20) with its chart. Old newsletter pages removed.

- Phase 3: `scripts/newsroom/postbuild.mjs` (static page per route, head tags,
  readable fallback from `src/lib/staticFallback.js`, redirect stubs, Atom feed,
  sitemap), `scripts/newsroom/check-dist.mjs` (+ `--self-test`),
  `scripts/newsroom/browser-checks/` (`check-routes.mjs`, own `package.json`),
  `public/og/default.png` + `make-og-default.mjs`, `public/robots.txt`, default
  OG tags in `index.html`. `npm run build` = validate, vite build, postbuild.
  Dispatch and Lens files now reach the app through `virtual:newsroom-content`
  (published files only), not `import.meta.glob`.

- Phase 4: `scripts/newsroom/build-email.mjs`, `send-email.mjs`,
  `test-email.mjs` (`npm run test:email`, fake API, fixture in
  `fixtures/email/`), `.github/workflows/dispatch-email.yml`. The real API was
  never called.

## Next

- Phase 5: data collector. Phase 6: docs and report.

## Open questions

None yet. Notes for the final report are collected in the section below.

## Notes for the report

- Baseline `dist/` on `main` (c63d572): 311 files, 816,567,222 bytes.
- `nav.json` is not changed: the "Newsletter" target is in `Header.jsx`.
- Fixtures are one valid tree plus one-change cases (`cases.json`).
- Extra validator rules beyond the brief: raw HTML other than `<sub>`/`<sup>`
  (error), unknown header field (warning), a published piece may not
  cross-reference a draft (error).
- Browser checks: own folder with `puppeteer-core`, as on `network-lab`.
- "No tracking" removed from the signup block: not verifiable.
- Issue 1 summary shortened to fit 200 characters (last sentence dropped).
- Issue 2: Buttondown's own utm parameters stripped from links; the title "The
  founding letter" is taken from the letter's first line; the chart shows
  $64,814 / −1.06σ while the text says ~$63,000 / −1.09σ; stray ". " and
  unbalanced ")" in "What we're building" kept as sent; "(coming soon)" and
  "(opening soon)" are the letter's own words.
- Old name "Dispatches" still in `History.jsx` (prose) — not a "monthly" claim, left.
- "monthly" replaced in: 11 education/event pages (same sentence), `FAQs.jsx`,
  `Membership.jsx`, `InsightArticle.jsx`, `NewsletterSignup.jsx`.
- `/news`: eyebrow "Dispatches" -> "Institute", heading -> "Announcements"; the
  section id `dispatches` is unchanged.
- Drafts: proven with three temporary draft files (build + check:dist pass;
  with the plugin disabled check:dist fails). A draft Explainer's text is
  excluded but its file name stays a glob key in the bundle (`insights.js`).
- `insights.js`: YAML dates rebuilt from UTC parts (day shift west of UTC);
  `InsightArticle.jsx`: `break-words` on links (page scrolled sideways at 375 px).
- Explainer `og:image` width/height are in the static HTML only (unknown at runtime).
- deploy.yml not changed; suggest adding `npm run check:dist` after the build.
- Buttondown API (read 2026-11-20, docs + OpenAPI spec github.com/buttondown/openapi):
  POST https://api.buttondown.com/v1/emails, "Authorization: Token", header
  X-API-Version: 2026-04-01; fields subject, body, status, publish_date,
  canonical_url, slug, secondary_id, description, image, metadata. Default
  status is about_to_send, so the script always sets draft or scheduled.
  Idempotency by GET /emails?subject= (contains) + exact match, plus X-Idempotency-Key.
