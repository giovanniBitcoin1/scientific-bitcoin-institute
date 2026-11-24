# Newsroom 01 — Insights publishing pipeline

Branch `newsroom`, from `main` at `c63d572`. Eight local commits, nothing
pushed, nothing merged, `network-lab` not touched. Date of the work: 2026-11-20.

State: every phase of the brief is done and every check passes, on this
working tree and on a fresh clone of the branch (`npm ci`, `npm run build`,
`npm run check:dist`, the three self-tests).

## 1. What was built

### Phase 0 — survey and plan (`fba814e`)

New: `docs/newsroom/plan.md` (79 lines).

### Phase 1 — content model, loader, validator (`37f3656`)

- `src/lib/newsroom-core.js`: the content model, with no Vite API and no DOM,
  so the site and the Node scripts read a file identically. Frontmatter is
  parsed with js-yaml's `JSON_SCHEMA`: dates stay the text written in the file,
  so no day can shift and a time keeps the offset it was written with.
- `src/lib/newsroom.js`: the loader used by the pages (sort, getters,
  `getLatest(n)` across the three series, claims).
- `src/lib/newsroomMarkdown.js`: the renderer (GFM, images with caption,
  ```` ```math ```` fences, blockquote as callout). No Lab code is imported.
- `src/lib/site.js`: canonical-URL helper, SEO model, the verbatim copy.
- `scripts/newsroom/validate.mjs` with `--self-test`; `npm run validate`;
  `npm run dev:drafts`; templates `_template.md` in both folders.

New files: `src/lib/newsroom-core.js`, `src/lib/newsroom.js`,
`src/lib/newsroomMarkdown.js`, `src/lib/site.js`,
`src/content/dispatch/_template.md`, `src/content/lens/_template.md`,
`scripts/newsroom/validate.mjs`, `scripts/newsroom/dev-drafts.mjs`,
`scripts/newsroom/lib/content.mjs`, `scripts/newsroom/lib/image-size.mjs`,
`scripts/newsroom/fixtures/README.md`, `fixtures/cases.json`,
`fixtures/valid/**` (5 markdown files, 6 images, `CNAME`),
`docs/newsroom/status.md`.
Changed: `package.json`, `vite.config.js`, `src/lib/insights.js`.

### Phase 2 — pages, routes, migration (`95c76bb`)

- Routes: `/insights` (hub), `/insights/dispatch`, `/insights/dispatch/:slug`,
  `/insights/lens`, `/insights/lens/:slug`, `/insights/on-the-record` (only
  while a claim exists; none does today, so the route and its link are absent),
  `/subscribe`. `/insights/:slug` is unchanged. Router redirects for
  `/news/newsletter`, `/newsletter` and `/news/newsletter/issue-01`.
- Issue 1 migrated from `NewsletterIssue01.jsx`; issue 2 imported from the
  Buttondown archive (fetched on 2026-11-20) with its chart.
- `LatestInsights` on the home page, right after the hero.

New: `src/pages/DispatchArchive.jsx`, `DispatchIssue.jsx`, `LensArchive.jsx`,
`LensArticle.jsx`, `OnTheRecord.jsx`, `Subscribe.jsx`,
`src/components/newsroom/parts.jsx`, `src/components/LatestInsights.jsx`,
`src/content/dispatch/001-the-power-law-lands.md`,
`src/content/dispatch/002-the-founding-letter.md`,
`public/insights-media/dispatch/002-the-founding-letter/power-law-corridor-2026-07-20.png`.
Changed: `src/App.jsx`, `src/components/Header.jsx`,
`src/components/NewsletterSignup.jsx`, `src/lib/seo.js`, `src/pages/Insights.jsx`,
`Home.jsx`, `News.jsx`, `Contact.jsx`, `InsightArticle.jsx`, `FAQs.jsx`,
`Membership.jsx`, and the eleven pages listed in section 2.6.
Removed: `src/pages/NewsletterIndex.jsx`, `src/pages/NewsletterIssue01.jsx`,
`src/data/newsletterIssues.json`.

### Phase 3 — static HTML, previews, feed, sitemap (`cdc3078`)

- `scripts/newsroom/postbuild.mjs`: one `index.html` per static route with its
  own title, description, canonical, Open Graph, Twitter card, article times,
  JSON-LD and feed link; a readable copy of the page inside `<div id="root">`;
  three redirect stubs; `insights/feed.xml` (Atom); `sitemap.xml`.
- `scripts/newsroom/check-dist.mjs` (`npm run check:dist`, `--self-test`).
- `scripts/newsroom/browser-checks/` (`check-routes.mjs`).
- `public/og/default.png` and the script that renders it;
  `public/robots.txt`; default sharing tags in `index.html`.

Today the build writes 9 static pages (`/`, `/insights`, `/insights/dispatch`,
`/insights/lens`, `/subscribe`, two issues, one Explainer, and `/news`), 3
stubs, a feed with 3 entries and a sitemap with 7 addresses (`/insights/lens`
is left out while it has no piece).

New: `scripts/newsroom/postbuild.mjs`, `check-dist.mjs`, `lib/routes.mjs`,
`browser-checks/` (`lib.mjs`, `check-routes.mjs`, `shots.mjs`,
`make-og-default.mjs`, `README.md`, `package.json`, `package-lock.json`,
`.gitignore`), `src/lib/staticFallback.js`, `public/og/default.png`,
`public/robots.txt`.
Changed: `index.html`, `package.json`, `vite.config.js`, `src/lib/newsroom.js`,
`src/lib/newsroomMarkdown.js`, `src/lib/insights.js`, `src/pages/InsightArticle.jsx`.

### Phase 4 — email hand-off (`2aff266`)

New: `scripts/newsroom/build-email.mjs`, `send-email.mjs`, `test-email.mjs`
(`npm run test:email`), `fixtures/email/007-fixture-email-issue.md`,
`fixtures/email/expected.json`, `.github/workflows/dispatch-email.yml`.
Changed: `package.json`.

Buttondown API relied on, read on 2026-11-20 from
`https://docs.buttondown.com/api-emails-create`, `…/api-versioning` and the
OpenAPI specification at `github.com/buttondown/openapi`:

| | |
|---|---|
| Create | `POST https://api.buttondown.com/v1/emails` |
| List (idempotency) | `GET https://api.buttondown.com/v1/emails?subject=<text>` — "subject contains"; the exact match is confirmed in the script |
| Headers | `Authorization: Token <key>`, `X-API-Version: 2026-04-01` (pinned), `X-Idempotency-Key` |
| Fields sent | `subject`, `body`, `status`, `publish_date` (when scheduled), `canonical_url`, `slug`, `secondary_id` (the issue number), `description`, `image` (when the issue has a share image), `metadata` |

Two facts from the documentation shaped the code. The API's default `status`
is `about_to_send` (send now), so the script always states `draft` or
`scheduled` and refuses anything else. And a body that starts with `---` is
rejected (`body_contains_frontmatter`), which the first line (the editor-mode
comment, then the link to the web version) avoids.

The real API was never called.

### Phase 5 — public data collector (`5643f74`)

New: `scripts/data/collect.mjs`, `scripts/data/self-test.mjs`
(`npm run test:data`), `scripts/data/fixtures/` (13 recorded answers),
`scripts/data/README.md`, `.github/workflows/data-collector.yml`.
Changed: `package.json`.

| File | Source (checked live on 2026-11-20) |
|---|---|
| `btc-daily.json` | Bitstamp, from 2011-08-18; Kraken as cross-check |
| `btc-hourly.json` | Bitstamp |
| `fear-greed.json` | alternative.me |
| `wiki-pageviews.json` | Wikimedia REST pageviews API |
| `news-volume.json` | GDELT DOC API, `timelinevol` |
| `mining.json` | mempool.space |
| `network-activity.json` | blockchain.info charts (transactions), mempool.space (mempool, fee) |

Live run into a temporary folder (first run, then a second run in the same
folder, which changed no existing `btc-daily` row):

```
btc-daily.json · rows: 5573 rows, first {"date":"2011-08-18","open":10.9,"high":10.9,"low":10.9,"close":10.9,"source":"b
   {"date":"2026-11-17","open":64835.13,"high":65377.82,"low":63269.17,"close":64877.24,"source":"bitstamp","check_source":"kraken","check_close":64877,"check_diff_pct":0}
   {"date":"2026-11-18","open":64877.23,"high":64936.34,"low":61995,"close":62976.18,"source":"bitstamp","check_source":"kraken","check_close":62984.6,"check_diff_pct":0.013}
   {"date":"2026-11-19","open":62977.77,"high":64014.05,"low":61365,"close":61914.05,"source":"bitstamp","check_source":"kraken","check_close":61913.5,"check_diff_pct":0.001}
btc-hourly.json · rows: 1440 rows, first {"time":"2026-09-21T01:00:00Z","close":80984.11}
   {"time":"2026-11-19T22:00:00Z","close":62100.85}
   {"time":"2026-11-19T23:00:00Z","close":61914.05}
   {"time":"2026-11-20T00:00:00Z","close":62063.15}
fear-greed.json · rows: 3211 rows, first {"date":"2018-02-01","value":30,"classification":"Fear"}
   {"date":"2026-11-18","value":11,"classification":"Extreme Fear"}
   {"date":"2026-11-19","value":10,"classification":"Extreme Fear"}
   {"date":"2026-11-20","value":12,"classification":"Extreme Fear"}
mining.json · adjustments: 470 rows, first {"time":"2009-01-03T18:15:05Z","height":0,"difficulty":1,"change":0}
   {"time":"2026-10-16T12:37:31Z","height":971712,"difficulty":140577680051919.6,"change":1.05924}
   {"time":"2026-10-29T19:14:58Z","height":973728,"difficulty":148364561003867.4,"change":1.05539}
   {"time":"2026-11-14T05:02:50Z","height":975744,"difficulty":134823837323272.7,"change":0.908733}
mining.json · hashrate: 6530 rows, first {"date":"2009-01-03","hashrate_hs":9273.324192503673}
   {"date":"2026-11-17","hashrate_hs":1.10230448392204e+21}
   {"date":"2026-11-18","hashrate_hs":1.009829456101236e+21}
   {"date":"2026-11-19","hashrate_hs":1.051070335988507e+21}
network-activity.json · daily: 6512 rows, first {"date":"2009-01-17","tx_count":109}
   {"date":"2026-11-16","tx_count":810857}
   {"date":"2026-11-17","tx_count":652280}
   {"date":"2026-11-18","tx_count":674354}
network-activity.json · snapshots: 2 rows, first {"at":"2026-11-20T01:41:49Z","mempool_tx":63688,"mempool_vbytes":31183441,"media
   {"at":"2026-11-20T01:41:49Z","mempool_tx":63688,"mempool_vbytes":31183441,"median_fee_sat_vb":1.305}
   {"at":"2026-11-20T01:45:14Z","mempool_tx":64115,"mempool_vbytes":31291521,"median_fee_sat_vb":2.007}
news-volume.json · rows: 332 rows, first {"date":"2025-11-26","intensity":0.1483}
   {"date":"2026-11-16","intensity":0.1316}
   {"date":"2026-11-18","intensity":0.0649}
   {"date":"2026-11-19","intensity":0.0503}
wiki-pageviews.json · rows: 4159 rows, first {"date":"2015-07-01","views":12957}
   {"date":"2026-11-16","views":4096}
   {"date":"2026-11-17","views":3969}
   {"date":"2026-11-18","views":4450}
```

`btc-daily`: 720 rows carry the Kraken cross-check; none differs by more than
1.5%.

### Phase 6 — documentation (`8a86d82`) and this report

New: `docs/newsroom/authoring.md`. Changed: `CLAUDE.md` (sections "Build" and
"Insights"), `README.md`, `docs/newsroom/status.md`.

## 2. Decisions and deviations

1. **`nav.json` is not changed.** The target of "Newsletter" lives in the
   `submenuHrefs` map of `Header.jsx`; that one line changed.
2. **Validator fixtures are one valid tree plus one-change cases**
   (`fixtures/cases.json`), not one folder per rule. Each case names the exact
   set of error codes it must produce, and the self-test fails while any error
   code has no case. This proves each rule in isolation with less to maintain.
3. **Three validator rules beyond the brief**: HTML other than `<sub>`/`<sup>`
   is an error (the renderer would print it as text); a header field the series
   does not use is a warning (catches typos such as `share_img`); a published
   piece may not cross-reference a draft (the link would be dead).
4. **Explainers keep their format.** The existing Explainer has no `status`
   and a 215-character summary. The validator applies to Explainers only the
   rules that concern them: reserved names, unique addresses, title and date,
   images, leftover markers.
5. **Explainers have no archive route**, so the hub's Explainers section is
   their archive: three latest, and an "All Explainers (N)" button that shows
   the rest in place once there are more than three.
6. **"monthly" → "every other Thursday"**, each change:
   - `NewsletterSignup.jsx`: whole block replaced by the given copy.
   - `AdvancedCryptography`, `CommunityEvents`, `ComplexityScience`,
     `Conferences`, `EconomicModels`, `GameTheory`, `NetworkScience`,
     `OnlineCourses`, `Seminars`, `SummerSchool`, `Workshops`: "Subscribe to the
     Institute's monthly dispatch to be notified…" → "Subscribe to SBI
     Dispatch, sent every other Thursday, to be notified…".
   - `FAQs.jsx`: "publishes a monthly newsletter — *Dispatches from the
     Scientific Bitcoin Institute* —" → "publishes a newsletter every other
     Thursday — *SBI Dispatch* —".
   - `Membership.jsx`: "plus the monthly Dispatches newsletter" → "plus the SBI
     Dispatch newsletter, sent every other Thursday".
   - `InsightArticle.jsx`: "The Institute's monthly dispatch covers…" → "SBI
     Dispatch, sent every other Thursday, covers…".
   - Left alone (not about the newsletter): "rate adjusts monthly" in the
     Explainer, the "Recurring monthly giving" comment in `Donate.jsx`.
7. **`/news`**: heading "Institute Dispatches" → "Announcements"; the eyebrow
   above it said "Dispatches" and now says "Institute". The section id
   `dispatches` and the data file are unchanged.
8. **`/news` also gets a static page.** The stubs create `dist/news/`, and
   every folder created must have an `index.html`.
9. **Drafts reach no bundle, by construction.** Dispatch and Lens files are
   not loaded with `import.meta.glob` (as `insights.js` does) but through a
   module the build generates from published files only. The first version
   used a glob and kept draft text out, but `check:dist` showed the draft file
   names still in the bundle as glob keys; this replaced it.
10. **The home page file needs a guard.** `dist/index.html` is also what any
    route without a static file receives, through `404.html`. A one-line
    script after `<div id="root">` removes the home copy and the home canonical
    when the address is not `/`. `public/404.html` and the redirect script in
    `index.html` are unchanged. At runtime a `RouteCanonical` component gives
    every route the canonical link of its own address.
11. **Explainer `og:image`**: the hashed hero is found in `dist/assets` by
    comparing bytes with the source; no build manifest is published.
12. **Browser checks follow `network-lab`**: their own folder and
    `package.json` with `puppeteer-core`, driving the installed Chrome. The
    site's `package.json` has no new dependency of any kind, so there is no
    dev-dependency to justify.
13. **Two small fixes outside the brief**, both found by the checks:
    `insights.js` built an Explainer's date in a way that showed the previous
    day to readers west of Greenwich; `InsightArticle.jsx` scrolled sideways at
    375 px because of long reference URLs (`break-words` added to its links).
14. **Issue 1**: the summary was 224 characters; its last sentence ("A
    foundation laid; a research program announced.") was dropped to fit 200.
    The page's closing "Subscribe" line is kept as the last paragraph.
15. **Issue 2**: title "The founding letter" (from the letter's own first
    line), `authors: "Giovanni Santostasi"` (it is signed), the original
    subject kept in `subject`. The `utm_…` parameters Buttondown had added to
    the links were removed; nothing else was altered.
16. **Email**: a manual run can lower the mode to draft but cannot schedule a
    file the rules make a draft. A `send_at` in the past also falls back to
    draft. The workflow validates the content before it emails anything.
17. **Data**: Kraken is the cross-check (one request; about the last 720 days
    at the first run, every day from then on) rather than Coinbase. News volume
    is GDELT's daily "volume intensity" (share of all monitored articles), the
    one daily series that could be verified live; it reaches back about twelve
    months. The mempool snapshot is kept as a 60-day log, one row per run.
18. **`deploy.yml` is not changed.** It already runs `npm run build`.

## 3. Output of the checks

`npm run validate -- --self-test`

```
PASS  leftover marker TK in a published file: must fail with E_LEFTOVER
PASS  leftover marker [CHECK] in a published file: must fail with E_LEFTOVER
PASS  leftover marker lorem in a published file: must fail with E_LEFTOVER
PASS  leftover marker XXX in a published file's header: must fail with E_LEFTOVER
PASS  leftover marker in a published Explainer: must fail with E_LEFTOVER
PASS  lens cross-reference to a piece that does not exist: must fail with E_XREF_LENS
PASS  dispatch cross-reference to an issue that does not exist: must fail with E_XREF_DISPATCH
PASS  published Lens piece naming a draft issue: must fail with E_XREF_DISPATCH
PASS  raw HTML in the text: must fail with E_RAW_HTML
PASS  every rule has a failing fixture (28 codes)

0 failures of 49 checks
```

`npm run build`

```
> scientific-bitcoin-institute@0.1.0 build
> npm run validate && vite build && node scripts/newsroom/postbuild.mjs
> scientific-bitcoin-institute@0.1.0 validate
> node scripts/newsroom/validate.mjs
Content check passed: 3 files, 0 warnings.
✓ 1277 modules transformed.
dist/assets/index-BZkkLY9k.css                   43.32 kB │ gzip:   8.17 kB
dist/assets/index-CWFOkDM0.js                   883.22 kB │ gzip: 253.22 kB
✓ built in 8.54s
Post-build: 9 static pages, 3 redirect stubs, feed (3 entries) and sitemap written to dist.
```

`npm run check:dist`

```
PASS  feed lists every article (30 at most)
PASS  sitemap exists
PASS  sitemap is well-formed XML
PASS  sitemap lists exactly the static routes (empty archives left out)
PASS  sitemap: every address has a lastmod
PASS  feed and sitemap list the same article URLs
PASS  robots.txt allows everything and names the sitemap
PASS  no draft and no fixture text in dist (0 drafts looked for)

0 failures of 108 checks
```

`npm run check:dist -- --self-test`

```

PASS  static page missing: the check "file exists…" fails
PASS  two titles: the check "exactly one title…" fails
PASS  no canonical: the check "exactly one title…" fails
PASS  og:image twice: the check "exactly one title…" fails
PASS  canonical without the trailing slash: the check "canonical ends with…" fails
PASS  og:url differs from the canonical: the check "og:url equals…" fails
PASS  og:image points to a missing file: the check "og:image file exists…" fails
PASS  JSON-LD does not parse: the check "JSON-LD parses…" fails
PASS  fallback emptied: the check "fallback has the title…" fails
PASS  fallback image not absolute: the check "fallback images are absolute…" fails
PASS  stub without refresh: the check "immediate refresh…" fails
PASS  feed not well-formed: the check "feed is well-formed…" fails
PASS  feed with an unescaped ampersand: the check "feed is well-formed…" fails
PASS  feed missing an article: the check "feed lists every article…" fails
PASS  sitemap missing an article: the check "sitemap lists exactly…" fails
PASS  sitemap not well-formed: the check "sitemap is well-formed…" fails
PASS  robots.txt without the sitemap: the check "robots.txt…" fails
PASS  fixture text in a script: the check "no draft and no fixture text…" fails
PASS  draft text in a page: the check "no draft and no fixture text…" fails
PASS  draft address in the sitemap: the check "no draft and no fixture text…" fails
PASS  untouched build with a draft to look for: passes

0 failures of 21 checks
```

Browser checks (`node scripts/newsroom/browser-checks/check-routes.mjs`)

```
PASS  [375] /news: no console error
PASS  [375] without JavaScript: the article is readable and styled
PASS  [375] the heading does not jump when the app takes over (static 172px, app 172px)
PASS  [375] /news/newsletter/: static stub points to https://scientificbitcoininstitute.org/insights/dispatch/
PASS  [375] /news/newsletter: static stub points to https://scientificbitcoininstitute.org/insights/dispatch/
PASS  [375] /news/newsletter inside the app leads to /insights/dispatch
PASS  [375] /news/newsletter/issue-01/: static stub points to https://scientificbitcoininstitute.org/insights/dispatch/001-the-power-law-lands/
PASS  [375] /news/newsletter/issue-01: static stub points to https://scientificbitcoininstitute.org/insights/dispatch/001-the-power-law-lands/
PASS  [375] /news/newsletter/issue-01 inside the app leads to /insights/dispatch/001-the-power-law-lands
PASS  [375] /newsletter/: static stub points to https://scientificbitcoininstitute.org/insights/dispatch/
PASS  [375] /newsletter: static stub points to https://scientificbitcoininstitute.org/insights/dispatch/
PASS  [375] /newsletter inside the app leads to /insights/dispatch
PASS  [375] /about/contact (no static file) still opens through 404.html
PASS  [375] /about/contact: the home page's copy is not shown and the canonical is its own
PASS  [375] /insights/dispatch/no-such-issue: "Issue not found"
PASS  [375] /insights/lens/no-such-piece: "Piece not found"
PASS  [375] /insights/no-such-article: "Article not found"
PASS  [375] hub with no Lens piece: no Lens section, no link to its archive
PASS  [375] /insights/lens with no piece: intro and subscribe block only
PASS  [375] home with no Lens piece: no card labelled The Lens

0 failures of 276 checks
```

Collector self-test (`node scripts/data/collect.mjs --self-test`)

```
PASS  run: transaction counts and one mempool snapshot
PASS  run: deterministic — same input, same bytes
PASS  run: stable formatting — one row per line, parses back
PASS  incremental: a close older than three days is not rewritten
PASS  incremental: new days are added
PASS  cross-check in a run: 3.3% apart — flagged, both closes kept
PASS  incremental: the mempool log grows by one snapshot per run
PASS  incremental: only the recent days are asked for again
PASS  failure: the previous file is kept unchanged
PASS  failure: status.json records the error and the last good update
PASS  failure: the other series are still updated
PASS  failure on a first run: no file is invented
PASS  failure of the cross-check source only: prices still written, with a warning
PASS  --only with an unknown series is an error
PASS  fetch: HTTP 429 and a non-JSON body are both refused
PASS  fetch: sends a descriptive User-Agent

0 failures of 39 checks
```

Email tests (`npm run test:email`)

```
PASS  run: a subject that only contains ours does not count as existing
PASS  run: no API key — no call, a clear notice, no error
PASS  run: dry run prints the request body and calls nothing
PASS  run: a Lens file never produces a call
PASS  run: no added file — nothing to do
PASS  run: an API refusal is an error, not a silent pass

0 failures of 43 checks
```

Each of the four test suites was also run against deliberately broken code
(a length limit raised, the two-source rule relaxed, the merge and the 1.5%
threshold changed, the "both must say scheduled" rule removed, the draft plugin
disabled): each time the matching checks failed.

Drafts were proven end to end with three temporary draft files (an issue, a
Lens piece, an Explainer): build and `check:dist` passed with none of their
text in `dist/`; `npm run dev:drafts` showed the issue with its ribbon and
`npm run dev` showed "Issue not found". The files were then removed.

## 4. Hunks in shared files

`src/data/nav.json`: no change.

```diff
diff --git a/package.json b/package.json
index 3f04e3a..1506eb0 100644
--- a/package.json
+++ b/package.json
@@ -5,7 +5,12 @@
   "type": "module",
   "scripts": {
     "dev": "vite",
-    "build": "vite build",
+    "dev:drafts": "node scripts/newsroom/dev-drafts.mjs",
+    "validate": "node scripts/newsroom/validate.mjs",
+    "build": "npm run validate && vite build && node scripts/newsroom/postbuild.mjs",
+    "check:dist": "node scripts/newsroom/check-dist.mjs",
+    "test:email": "node scripts/newsroom/test-email.mjs",
+    "test:data": "node scripts/data/collect.mjs --self-test",
     "preview": "vite preview",
     "fetch:newhedge": "node scripts/fetch-newhedge.js"
   },
diff --git a/src/App.jsx b/src/App.jsx
index 8d27064..55cfba5 100644
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -19,8 +19,14 @@ import Conferences from './pages/Conferences.jsx'
 import Seminars from './pages/Seminars.jsx'
 import Workshops from './pages/Workshops.jsx'
 import CommunityEvents from './pages/CommunityEvents.jsx'
-import NewsletterIndex from './pages/NewsletterIndex.jsx'
-import NewsletterIssue01 from './pages/NewsletterIssue01.jsx'
+import DispatchArchive from './pages/DispatchArchive.jsx'
+import DispatchIssue from './pages/DispatchIssue.jsx'
+import LensArchive from './pages/LensArchive.jsx'
+import LensArticle from './pages/LensArticle.jsx'
+import OnTheRecord from './pages/OnTheRecord.jsx'
+import Subscribe from './pages/Subscribe.jsx'
+import { RouteCanonical } from './lib/seo.js'
+import { getClaims } from './lib/newsroom.js'
 import JournalIndex from './pages/JournalIndex.jsx'
 import JournalPost from './pages/JournalPost.jsx'
 import Education from './pages/Education.jsx'
@@ -64,6 +70,7 @@ function LabFallback() {
 export default function App() {
   return (
     <BrowserRouter>
+      <RouteCanonical />
       <Routes>
         <Route path="/" element={<Home />} />
         <Route path="/manifesto" element={<Manifesto />} />
@@ -78,14 +85,22 @@ export default function App() {
         <Route path="/research/sponsored-research" element={<SponsoredResearch />} />
         <Route path="/research/open-problems" element={<OpenProblems />} />
         <Route path="/insights" element={<Insights />} />
+        <Route path="/insights/dispatch" element={<DispatchArchive />} />
+        <Route path="/insights/dispatch/:slug" element={<DispatchIssue />} />
+        <Route path="/insights/lens" element={<LensArchive />} />
+        <Route path="/insights/lens/:slug" element={<LensArticle />} />
+        {/* On the record exists only while at least one claim does. */}
+        {getClaims().length > 0 && <Route path="/insights/on-the-record" element={<OnTheRecord />} />}
         <Route path="/insights/:slug" element={<InsightArticle />} />
+        <Route path="/subscribe" element={<Subscribe />} />
         <Route path="/news" element={<News />} />
         <Route path="/news/conferences" element={<Conferences />} />
         <Route path="/news/seminars" element={<Seminars />} />
         <Route path="/news/workshops" element={<Workshops />} />
         <Route path="/news/community-events" element={<CommunityEvents />} />
-        <Route path="/news/newsletter" element={<NewsletterIndex />} />
-        <Route path="/news/newsletter/issue-01" element={<NewsletterIssue01 />} />
+        <Route path="/news/newsletter" element={<Navigate to="/insights/dispatch" replace />} />
+        <Route path="/news/newsletter/issue-01" element={<Navigate to="/insights/dispatch/001-the-power-law-lands" replace />} />
+        <Route path="/newsletter" element={<Navigate to="/insights/dispatch" replace />} />
         <Route path="/news/journal" element={<JournalIndex />} />
         <Route path="/news/journal/:slug" element={<JournalPost />} />
         <Route path="/education" element={<Education />} />
diff --git a/src/components/Header.jsx b/src/components/Header.jsx
index b057503..ba2b81e 100644
--- a/src/components/Header.jsx
+++ b/src/components/Header.jsx
@@ -22,7 +22,7 @@ const submenuHrefs = {
   'Seminars': '/news/seminars',
   'Workshops': '/news/workshops',
   'Community Events': '/news/community-events',
-  'Newsletter': '/news/newsletter',
+  'Newsletter': '/insights/dispatch',
   'Event Journal': '/news/journal',
   'Academic Day': '/events/academic-day',
   'Bitcoin Fundamentals': '/education/bitcoin-fundamentals',
```

## 5. Open items for a person

1. **GitHub configuration** (nothing works by email until this is done):
   secret `BUTTONDOWN_API_KEY`, variable `DISPATCH_EMAIL_MODE`. The first real
   call to Buttondown has never been made: do the first one as a manual run
   with "dry run", then once in `draft` mode, before trusting `scheduled`.
2. **Licences of the data sources.** alternative.me and GDELT state their
   terms and both allow this use with attribution (quoted in each file).
   Bitstamp, Kraken, mempool.space and Blockchain.com state no open licence
   for their data: someone should confirm that republishing it on a public
   branch is acceptable. Wikimedia's CC0 statement for pageview data is written
   in the file from memory of their documentation; I could not find the
   sentence on the page I fetched.
3. **GDELT is fragile.** It allows one request every five seconds and answered
   429 or dropped the connection on most attempts from this machine; it
   answered on the third run. From GitHub's shared addresses it may fail often.
   The file is then kept as it was and `status.json` says so.
4. **"peer-reviewed" on the site** (none changed, except the hub intro, which
   was replaced):
   - `src/pages/InsightArticle.jsx:260` "Explainer · Accessible analysis, not
     peer-reviewed research", and `:266` "See the Institute's peer-reviewed
     Publications →".
   - `src/content/insights/the-strategy-machine.md:8` (summary: "the
     peer-reviewed Bitcoin power law") and `:399` ("the Institute's own
     peer-reviewed research, cited first", where the first reference is a
     Zenodo preprint). The summary is data, so it now also appears on the hub
     card, in the home block, in the feed and in the page's description.
   - `src/pages/FAQs.jsx:71-72` ("Is the Institute's research peer-reviewed?").
   - `src/pages/Collaborate.jsx:41`, `src/pages/SponsoredResearch.jsx:56, 62`.
   - `src/pages/BitcoinScienceLibrary.jsx:40, 86, 229, 316` (about other
     authors' literature).
   - `src/data/journal/bitcoin-asia-hong-kong.json:17, 18, 20, 26`.
5. **Two DOIs for the same preprint** (neither changed):
   `10.5281/zenodo.19387099` in issue 1 (as in the old page),
   `FeaturedResearch.jsx`, `Publications.jsx`, `BitcoinScienceLibrary.jsx`;
   `10.5281/zenodo.19386895` in `src/content/insights/_template.md` and in
   `the-strategy-machine.md` (lines 236 and 404).
6. **"No tracking"** was removed from the signup block. I could not verify it:
   Buttondown can track opens and clicks depending on the account's settings,
   and the email now carries `utm_` parameters on the Institute's own links.
7. **Things in the two migrated issues that read oddly today:**
   - Issue 1 calls itself "the inaugural issue of *Dispatches from the
     Scientific Bitcoin Institute*" and says "This month we announce…".
   - Issue 2 was sent as "#1" and is No. 2 here (the italic first line says
     so). It opens "If you're receiving this, you successfully signed up as a
     member…", which is addressed to email recipients.
   - Its chart shows $64,814 and −1.06σ, floor $50,024, falsification $16,845;
     the text says about $63,000, −1.09σ, $49,800 and $16,700.
   - In "What we're building" the Journal entry reads "**The Journal.** . The
     Journal chronicles… audience.scientificbitcoininstitute.org/news/journal)."
     (a stray full stop, a missing space, an unmatched bracket; the Manifesto
     entry has the same bracket). Kept as sent.
   - "The Observatory (coming soon)", "The Supporter tier (opening soon)",
     "Coming this month", the Fed meeting of July 28-29 and the market figures
     are all dated to July 2026. They are the letter's own words, not
     placeholders.
   - It says the dashboard has 16 currencies; `Membership.jsx` says 15.
8. **Old name still in prose**: `src/pages/History.jsx:121` ("*Dispatches*
   newsletter"). It makes no claim about frequency, so it was left.
9. **The footer links** (`Footer.jsx`, "Newsletter" among them) all point to
   `#`, as before. Out of scope; the header's "Newsletter" works.
10. **Suggestion**: add `npm run check:dist` as a step after "Build" in
    `deploy.yml`, so a broken static page stops a deploy. Not done here.
11. **Merge with `network-lab`**: that branch rewrites the nav and the lab
    routes; the hunks in section 4 touch other lines of `App.jsx` and one line
    of `Header.jsx`, so the merge should be mechanical. `package.json` differs
    only in `scripts`. `CLAUDE.md` gains two sections between "Design system"
    and "Event Journal".

## 6. Known limits

- **Scheduled workflows on GitHub**: a `schedule` run can start many minutes
  late or be skipped under load; it runs only from the default branch; and
  GitHub disables scheduled workflows after 60 days without repository
  activity. The collector's "minute 17" is a request, not a promise.
- **`data` branch**: one force-pushed commit, so there is no history to go back
  to; a failed source keeps its previous file, but a wrong value published by
  a source is published by us too (older than three days, it is then frozen).
- **Email is triggered by an added file only.** Publishing an issue by editing
  a draft already in the repository from `draft` to `published` does not create
  an email: use the manual run for that file. The email links to the web page,
  which exists only once the deploy has finished.
- **Idempotency is by subject.** Changing the subject after the email exists
  would create a second one on a manual run.
- **Static pages cover Insights only.** Every other route still opens through
  `404.html` (HTTP 404, then the app), exactly as before.
- **Explainer share images** are whatever size the hero is (the current one is
  not 1200x630); `og:image:width/height` for Explainers are in the static HTML
  but are dropped by the runtime, which does not know them.
- **A draft Explainer** keeps its text out of the build, but its file name is
  still a key in the bundle. Dispatch and Lens drafts leave no trace.
- **The repository is public**: a committed draft is readable there, whatever
  the build does.
- **Leftover markers** are matched as whole words, `TODO`, `TK` and `XXX` in
  capitals only.
- **The header** shows white navigation text on these light pages until the
  page is scrolled, as on every other light page of the site. Not changed.

Size of `dist/`:

| | Files | Bytes |
|---|---|---|
| Before (`main`, `c63d572`, `vite build`) | 311 | 816,567,222 |
| After (`npm run build`) | 327 | 816,980,263 |
| Difference | +16 | +413,041 |

The 16 files: 11 `index.html` (8 pages besides the home page, 3 stubs),
`feed.xml`, `sitemap.xml`, `robots.txt`, `og/default.png`, and the chart of
issue 2.
