# Newsroom — status

Resume with: "Read docs/newsroom/status.md and continue." The brief is
`01-newsroom-prompt.md.local` in the repo root (not committed); the plan is
`docs/newsroom/plan.md`.

Rules that stay in force: branch `newsroom` only, no push, no merge, never touch
`network-lab`; one commit per phase (`Newsroom: <phase>`); the build passes at
every commit; no new runtime dependency; nothing bash-only.

## Phase

Phase 2 (pages, routes, migration) — done.

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

## Next

- Phase 3: `postbuild.mjs`, `check-dist.mjs`, browser checks, default share image.
- Phase 4: email hand-off. Phase 5: data collector. Phase 6: docs and report.

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
