# Network Lab 16 — merge of origin/main and checks before the push: report

Prompt 16 (`prompts.local/network-lab-16.md`), 24 November 2026, branch
`network-lab`. Nothing pushed, local `main` not touched, nothing fixed.

**Result: `origin/main` is merged into the branch without conflicts and every
check passes on the merged site. The branch is ready for Adriano to push.**
The commands are at the end.

## Commits

| Commit | What |
|---|---|
| 0e246f5 | Merge origin/main into network-lab (Stage 1) |
| the commit "Network Lab 16: merge check and report" | this file and the status file |

Before starting: branch `network-lab`, clean tree, `docs/reports/network-lab-15.md`
committed (2edd747), and the status file said the Lab was complete.

## Four things to know first

1. **`npm ci` failed the first time and I stopped three old preview servers
   to finish it.** The merge changed `package.json`, so `npm ci` ran. It
   stopped half-way because three `vite preview` servers left running since
   19 November (ports 4179, 4180 and 4181) kept
   `node_modules\@esbuild\win32-x64\esbuild.exe` locked, and by then
   `node_modules` was partly deleted. I asked; the answer was to stop them.
   I stopped the three servers and their three `esbuild` helpers (six
   processes), and the second `npm ci` completed. Nothing else on the PC was
   stopped. If one of those previews was yours, it has to be started again.
2. **Main changed how the site is built, so I checked more than the prompt
   listed.** The deploy no longer runs a plain `vite build`: it runs
   `npm run build` (content check, `vite build`, then static pages, feed and
   sitemap) and after it `npm run check:dist`. I ran both, and main's own
   browser check of the Newsroom routes, on the merged branch. All pass.
   `npm run build` gives exactly the same script and style files as
   `npx vite build` (same names, so same contents), so the lab checks made on
   the first build hold for the second.
3. **The regression compare reports 7 differences of 144 checks**, the same
   seven as in prompt 15: all on `/lab/scale-free`, all from the one sentence
   authorised in prompt 12 (commit dcc8949). It was built from `origin/main`
   this time (`build-main.mjs` accepts `--ref`). I did not treat it as a
   failure, as in prompt 15: it is the difference already recorded in the
   status file, and nothing new appears.
4. **One thing seen on main's pages, not caused by the merge and not
   touched:** on `/insights` (and the other Insights pages with a light top)
   the header is transparent until the page is scrolled, so the white logo
   text and nav labels sit on a near-white background and can hardly be read
   at the top of the page. A build of `origin/main` shows exactly the same
   (`header-16-insights-ORIGIN-MAIN-1280.png` beside
   `header-16-insights-1280.png`), so it is already on the live site. The nav
   is there and works; it is a matter of contrast. For Adriano to decide.

## Stage 1 — the merge

- `git fetch origin`: worked, no credentials asked.
- Safety tag `pre-merge-16` on 2edd747 (local only).
- `git merge --no-ff origin/main -m "Merge origin/main into network-lab"`:
  **no conflicts**. Git merged three files that both sides had changed by
  itself: `CLAUDE.md`, `src/App.jsx`, `src/components/Header.jsx`. Merge
  commit 0e246f5; `origin/main` was at a93d2d0 (ten commits: nine of the
  Newsroom and "People: add Gianluca Fioravanti to Research Fellows").
- `src/data/lab/config.json` is unchanged; the DRAFT markers and `docs/` are
  as they were.

### What main brought in

113 files: 78 added, 32 changed, 3 deleted (8,564 lines added, 540 removed).

| Folder | Files | Added / changed / deleted |
|---|---|---|
| `.github/workflows/` | 3 | 2 / 1 / 0 (`data-collector.yml`, `dispatch-email.yml`; `deploy.yml` gains the `check:dist` step) |
| `docs/newsroom/` | 3 | 3 / 0 / 0 |
| `docs/reports/` | 1 | 1 / 0 / 0 (`newsroom-01.md`) |
| `public/` | 4 | 4 / 0 / 0 (a team photo, a chart, `og/default.png`, `robots.txt`) |
| `scripts/data/` | 16 | 16 / 0 / 0 |
| `scripts/newsroom/` | 35 | 35 / 0 / 0 |
| `src/components/` | 4 | 2 / 2 / 0 (`Header.jsx`, `NewsletterSignup.jsx` changed) |
| `src/content/` | 6 | 4 / 2 / 0 |
| `src/data/` | 1 | 0 / 0 / 1 (`newsletterIssues.json`) |
| `src/lib/` | 7 | 5 / 2 / 0 |
| `src/pages/` | 27 | 6 / 19 / 2 (`NewsletterIndex.jsx`, `NewsletterIssue01.jsx` deleted) |
| `src/App.jsx` | 1 | changed |
| root | 5 | `CLAUDE.md`, `README.md`, `index.html`, `package.json`, `vite.config.js` changed |

New routes: `/insights/dispatch`, `/insights/dispatch/:slug`, `/insights/lens`,
`/insights/lens/:slug`, `/subscribe`, and `/insights/on-the-record` (which
exists only while a published piece carries a claim: none does now, so the
route is not there). Old addresses `/news/newsletter`,
`/news/newsletter/issue-01` and `/newsletter` now lead to the Dispatch.
`/insights` and `/people/research-fellows` changed.

The nav: main added **no** entry. `src/data/nav.json` did not change; the one
change in `Header.jsx` is that "Newsletter" under News + Events now leads to
`/insights/dispatch`. "Insights" was already in the nav.

### npm ci

`package.json` changed (new scripts only: `validate`, `build`, `check:dist`,
`dev:drafts`, `test:email`, `test:data`; no dependency changed) and
`package-lock.json` did not. `npm ci` ran: first attempt failed as described
above, second completed. No `npm audit fix`, no `npm install <anything>`.
The site's `package.json` and lock file are untouched by me.

`npm ci` was also run inside `scripts/newsroom/browser-checks/` (its own
`package.json` with `puppeteer-core` only, `node_modules` git-ignored), which
main's browser check needs.

## Stage 2 — the checks

Every command in the foreground, one at a time (see "What went wrong" for the
one slip).

| Check | Result |
|---|---|
| `npx vite build` | built, 11 s |
| `check-network-01.mjs` … `04` | All checks passed (each) |
| `check-network-05.mjs`, `06` | 0 failures (each) |
| `check-network-07.mjs` | 81 pass, 0 failures (see "What went wrong") |
| `check-network-08.mjs` | 82 pass, 0 failures |
| `check-network-09.mjs` | 71 pass, 0 failures |
| `check-network-10.mjs` | 81 pass, 0 failures |
| `check-network-11.mjs` | 74 pass, 0 failures |
| `check-network-12.mjs` | 115 pass, 0 failures |
| `check-network-13.mjs` | 133 pass, 0 failures |
| `check-network-14.mjs` | 107 pass, 0 failures |
| `check-index.mjs network` | 0 failures of 68 checks |
| `check-index.mjs complexity` | 0 failures of 64 checks |
| `check-links.mjs` | 0 failures of 80 checks |
| `check-module.mjs network reading-a-network` (01) | 0 failures of 62 checks |
| `check-module.mjs network heavy-tails-done-right` (05) | 0 failures of 58 checks |
| `check-module.mjs network weights-flows-navigation` (10) | 0 failures of 56 checks |
| `check-module.mjs network capstone-a-real-network` (14) | 0 failures of 60 checks |
| `modules/network-reading-a-network.mjs` | 0 failures of 25 checks |
| `modules/network-capstone-a-real-network.mjs` | 0 failures of 54 checks |
| `check-module.mjs complexity scale-free` | 0 failures of 38 checks |
| `npm run build` (what the deploy runs) | passed: "Content check passed: 3 files, 0 warnings"; "9 static pages, 3 redirect stubs, feed (3 entries) and sitemap written to dist" |
| `npm run check:dist` (what the deploy runs next) | 0 failures of 108 checks |
| `scripts/newsroom/browser-checks/check-routes.mjs` (main's own) | 0 failures of 276 checks |
| Pages from main and the nav, 1280 px | 0 failures of 147 checks |
| Pages from main and the nav, 375 px | 0 failures of 130 checks |
| Regression compare against `origin/main` | 7 differences of 144 checks, all known (point 3 above) |
| Main's own pages, `origin/main` build against the merged build | 46 of 48 the same; the 2 others are an artefact of the comparison (below) |

### The pages that came from main

Checked on the build made by `npm run build`, served the way GitHub Pages
serves it (a page with a static file as it is, any other address through
`404.html`), at 1280 and 375 px:

`/`, `/insights`, `/insights/dispatch`,
`/insights/dispatch/001-the-power-law-lands`,
`/insights/dispatch/002-the-founding-letter`, `/insights/lens`,
`/insights/the-strategy-machine`, `/subscribe`, `/people`,
`/people/research-fellows`, `/news`, `/news/journal`, `/support/membership`,
`/labs`, `/lab`, `/network-lab`, `/network-lab/reading-a-network` (locked).

For each, at each width: the page renders at its own address with a heading
and its text, **no console errors**, no horizontal scroll. The three old
newsletter addresses lead to the Dispatch inside the app and render, with no
console errors. For the addresses that have no static file (the lab pages,
People, the Journal, Membership) the browser logs the 404 status of the
document itself before `404.html` hands over to the app; that line is the
same on the live site today and was not counted as an error of the page.

### The nav

On every one of those seventeen pages:

- **1280 px:** the eleven entries of `nav.json` are all there, in order
  (Research, Insights, News + Events, Education, Labs, Academy, People,
  Collaborate, Support, About, Seed Tool), with "Labs" between Education and
  Academy; they sit on one row, no label wraps, no entry overlaps the next,
  and logo, nav and Donate button stay inside the 1280 px with no overlap.
  Hovering "Labs" opens Complexity Lab → `/lab` and Network Lab →
  `/network-lab`; "Newsletter" under News + Events leads to
  `/insights/dispatch`.
- **375 px:** the header fits, the menu opens and lists all eleven entries,
  with Labs → `/labs`, both labs under it, Insights, and Newsletter →
  `/insights/dispatch`; the open menu does not widen the page.
- "Labs" is marked as the current section on `/labs` and `/network-lab`, and
  not on `/`, `/insights` or `/people/research-fellows`, at both widths.

The two scripts that made these checks were temporary (in the session's
scratch folder) and are not in the repository; what they checked is all
listed here. The lab's `check-links.mjs` and main's `check-routes.mjs` cover
most of it permanently.

### Main's own pages, before and after the merge

Twelve of main's pages (the Insights pages, `/subscribe`, `/people`,
`/people/research-fellows`, `/news`, `/news/journal`, `/support/membership`)
were read on a build of `origin/main` and on the merged build, at both
widths: the text outside the header is identical on all twelve, and so are
title and page height on eleven. On `/news` the title reads "Scientific
Bitcoin Institute" on the first and "Latest News — Scientific Bitcoin
Institute" on the second: `News.jsx` sets no title, so the page keeps the one
of its static file, and the comparison build of `origin/main` is a plain
`vite build` without static files. The live site, built with `npm run build`,
already shows the second. Not a difference between the two sites.

### Screenshots

45 files in `scripts/lab/browser-checks/screenshots/` (git-ignored), all
named `header-16-…`:

- `header-16-<page>-1280.png` and `header-16-<page>-375.png`, the header of
  each of the seventeen pages (`home`, `insights`, `dispatch`, `dispatch-001`,
  `dispatch-002`, `lens`, `explainer`, `subscribe`, `people`,
  `research-fellows`, `news`, `journal`, `membership`, `labs`,
  `complexity-lab`, `network-lab`, `network-lab-module-01`);
- `header-16-home-labs-dropdown-1280.png` and
  `header-16-labs-labs-dropdown-1280.png`: the "Labs" dropdown open;
- `header-16-<page>-menu-top-375.png` and `…-menu-labs-375.png` for `home`,
  `labs`, `insights` and `network-lab`: the mobile menu open, at its top and
  scrolled to "Labs";
- `header-16-insights-ORIGIN-MAIN-1280.png`: the same header on a build of
  `origin/main` (point 4 above).

The lab checks also rewrote their usual `index-…` and `module-…` screenshots.

## What went wrong on the way

- **`npm ci` and the old preview servers:** point 1 above.
- **Seven self-checks started together.** I sent the self-checks of modules
  01 to 07 in one go and they ran at the same time, against the rule "one at
  a time". 01 to 06 passed. From 08 on, and for every browser check, each
  command ran alone.
- **`check-network-07.mjs` did not exit, twice.** In that first batch and
  again when run alone, it printed all its results ("0 failures") and then the
  Node process stayed alive until the time limit; I stopped it. The third run,
  alone, ended normally in 14 seconds: 81 pass, 0 failures, exit code 0. The
  results printed were the same all three times, so the check passes; the
  process not ending looks like the same kind of trouble with Node 24.22 and
  little free memory that the status file already records, not something the
  merge brought (module 07's code and the script did not change in the
  merge). No other script did it.
- **A heavier comparison timed out.** Running `compare-main.mjs` on main's
  twelve pages (eight views each, with pixel fingerprints) did not finish in
  nine minutes and left nothing running; the lighter comparison above
  replaced it.

## State at the end

- Branch `network-lab`: the merge commit 0e246f5 and the commit of this
  report. Clean tree. `origin/main` (a93d2d0) is an ancestor of the branch, so
  `main` can take the branch as a fast-forward.
- Local `main` is still at c63d572, ten commits behind `origin/main`.
- Local tag `pre-merge-16` on 2edd747: `git reset --hard pre-merge-16` would
  undo the merge (not run). Do not push the tag.
- Git-ignored leftovers: `scripts/lab/browser-checks/.main-dist/` (the build
  of `origin/main`), the screenshots, `scripts/newsroom/browser-checks/node_modules/`.
- Pushing `main` starts the deploy. It does not start the "SBI Dispatch
  email" workflow: that one runs only when a push changes a file in
  `src/content/dispatch/`, and the branch changes none compared with
  `origin/main`.

## The commands for Adriano

In PowerShell, in `C:\SBI-work\scientific-bitcoin-institute`, one at a time,
in this order. If any of them answers with an error, stop there.

```
git push origin network-lab
```
a. Pushes the branch to GitHub (the branch only: no tag, nothing to main, no
deploy).

```
git switch main
git pull --ff-only origin main
```
b. Switches to `main` and brings it to `origin/main`, fast-forward only.

```
git merge --ff-only network-lab
```
c. Takes the branch into `main`. It must say "Fast-forward"; if it says
anything else ("Not possible to fast-forward"), stop.

```
npm run build
npm run check:dist
```
d. Builds the site as the deploy will, then checks the build. The first must
end with "Post-build: 9 static pages…", the second with "0 failures of 108
checks".

```
git push origin main
```
e. Pushes `main`: this starts the deploy of the site (a few minutes; it shows
under "Actions" on GitHub).

```
git switch network-lab
```
f. Goes back to the branch `network-lab`.

g. Then open on the live site, once the deploy is green (reload with
Ctrl+F5 if a page looks old):

- https://scientificbitcoininstitute.org/ — the home page; the nav shows
  "Labs" between Education and Academy.
- https://scientificbitcoininstitute.org/labs — two cards, Complexity Lab and
  Network Lab (14 of 14 modules ready).
- https://scientificbitcoininstitute.org/network-lab — the hero, then the
  module grid blurred under "Members area".
- https://scientificbitcoininstitute.org/network-lab/reading-a-network — one
  module, locked: number, title, summary, the lock, no lecture.
- https://scientificbitcoininstitute.org/insights — the Newsroom, with SBI
  Dispatch No. 1 and No. 2.
