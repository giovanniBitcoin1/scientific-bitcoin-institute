# Lab browser checks

Headless-Chrome checks for the labs (`/lab`, `/network-lab`). They open the
built site like a visitor would, locked and in the admin preview, in English
and Italian, at 1280 and 375 px, and report what is wrong.

This folder is self-contained: it has its own `package.json`
(`puppeteer-core` only) and is not part of the site's dependencies. The site's
`package.json` is never touched. `node_modules/`, `screenshots/`, `.main-wt/`
and `.main-dist/` are git-ignored.

## What it needs

- Node 20 or later.
- Google Chrome (or Edge/Chromium). `puppeteer-core` does not download a
  browser. The usual install paths are tried; otherwise pass
  `--chrome "<path to chrome>"` or set the `CHROME_PATH` environment variable.
- A build of the site: `npx vite build` in the repo root. The scripts serve
  `dist/` themselves on a free local port. Rebuild after every change.

## Install

```
cd scripts/lab/browser-checks
npm install
```

## Run

From this folder, after `npx vite build` in the repo root:

```
node check-index.mjs network
node check-index.mjs complexity
node check-links.mjs
node check-module.mjs network reading-a-network
node check-module.mjs network what-are-we-measuring
node check-module.mjs network centrality
node check-module.mjs network triangles-weak-ties-motifs
node check-module.mjs network heavy-tails-done-right
node check-module.mjs network growth-mechanisms
node modules/network-reading-a-network.mjs
node modules/network-what-are-we-measuring.mjs
node modules/network-centrality.mjs
node modules/network-triangles-weak-ties-motifs.mjs
node modules/network-heavy-tails-done-right.mjs
node modules/network-growth-mechanisms.mjs
```

Every script prints one `PASS`/`FAIL` line per check, then
`N failures of M checks`, and exits with code 1 if anything failed.

Options common to all scripts:

| Option | Meaning |
|---|---|
| `--quiet` | print only failures and notes |
| `--dist <dir>` | serve this build instead of the repo's `dist/` |
| `--base <url>` | use a server you started yourself (e.g. `npx vite preview`) |
| `--chrome <path>` | the browser to drive |

### `check-index.mjs <labId>`

`labId` is a key of `src/data/lab/paths.js` (`complexity`, `network`).
Locked: the lock overlay names the lab, all module cards are under it, no
module links, no admin bar; a module that is not ready and an unknown slug
show "Module not available"; `?admin` shows the form and a wrong passphrase
leaves the lab locked. Admin: every card, links only to the ready modules,
part headings, the other labs unlocked by the same flag, "Lock again" locks
them all. No console errors, no horizontal scroll.

### `check-module.mjs <labId> <slug>`

Locked: title and lock overlay, no lecture text, and no lecture, content or
sim chunk requested. Admin: the lecture is there; counts of live figures,
panels, exercises and canvases; every solution opens; nothing sticks out of
the viewport; no console errors. At 375 px, with a touch screen: a swipe over
every canvas scrolls the page while Draw is off, and with each Draw toggle on
the swipe over its canvas does not scroll (the DrawToggle rule).

The expected counts are in `expect.json` under `"<labId>/<slug>"`; add a line
for each new module. `--figures n --panels n --exercises n` override it.
Without either, the counts are only reported.

### `check-links.mjs`

The "Labs" section. The hub page `/labs` at 1280 and 375 px, EN and IT:
public, one card per lab with its name, its "ready of total" count and a
working link, and each lab index links back with "All labs". The nav: "Labs"
sits between Education and Academy and links to `/labs`; on desktop hovering
it opens a dropdown with one link per lab, and in the mobile menu the same
links are listed; all of them work. "Labs" is marked as the current section
on `/labs` and on every lab page, and nowhere else.

### `modules/<lab>-<slug>.mjs`

Functional checks of one module: the panels are driven and the numbers they
show are compared with the lecture and the exercises. One file per module.

### `shots.mjs <labId> <slug>`

Not a check: it saves a screenshot of every live figure and every panel of a
module (1280 px in English, 375 px in Italian) as
`screenshots/el-<slug>-fig<N>-<width>.png` and `…-panel<N>-<width>.png`, to
look at the result.

### Regression compare against main

```
node build-main.mjs            # builds main into .main-dist/
node compare-main.mjs          # the default list of Complexity Lab pages
node compare-main.mjs lab/random-networks lab/small-worlds
```

For each page, on main's build and on this branch's build: same visible text
inside `<main>` (the site header is left out: its nav differs from main since
the "Labs" entry), title, meta description, links, number of canvases, page height (±2 px) and
the same pixels on every canvas (the sims are seeded). Write the paths
without the leading slash: Git Bash on Windows rewrites `/lab/…` into a file
path. `--no-pixels` skips the canvas comparison; `--old-dist <dir>` compares
against another build; `node build-main.mjs --ref <branch>` builds another
branch.

When shared lab code changes (`graphUtils.js`, `LabMarkdown.jsx`,
`LabLecture.jsx`, a shared hook or component), add the pages that use it to
`DEFAULT_URLS` in `compare-main.mjs`.

`build-main.mjs` makes a temporary git worktree in `.main-wt/`, inside this
folder, so Node finds the repo's `node_modules` by walking up: no junction or
symlink to `node_modules` is created. If you ever build a worktree somewhere
else through a junction to `node_modules`, remove the junction itself first
and only then the worktree. Never delete recursively through it.

## Admin preview

The checks enter the admin preview by copying the public `adminHash` from
`src/data/lab/config.json` into the browser's localStorage. The passphrase is
never needed. Neither the passphrase nor the hash is printed or written to
any file by these scripts; keep it that way.

## Screenshots

Saved in `screenshots/` (git-ignored): `index-<lab>-<locked|admin>-<width>-<lang>.png`
and `module-<lab>-<slug>-<locked|admin>-<width>-<lang>.png`.
