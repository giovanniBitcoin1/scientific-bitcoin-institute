# Insights browser checks

Headless-Chrome checks for the Insights pages and the static files written by
`scripts/newsroom/postbuild.mjs`. Same approach as the lab checks on the
`network-lab` branch.

This folder is self-contained: it has its own `package.json` (`puppeteer-core`
only) and is not part of the site's dependencies. `node_modules/` and
`screenshots/` are git-ignored.

## What it needs

- Node 20 or later.
- Google Chrome (or Edge/Chromium). `puppeteer-core` does not download a
  browser. The usual install paths are tried; otherwise pass
  `--chrome "<path>"` or set the `CHROME_PATH` environment variable.
- A build of the site: `npm run build` in the repo root. Rebuild after every
  change.

## Install and run

```
cd scripts/newsroom/browser-checks
npm install
node check-routes.mjs
```

The script prints one `PASS`/`FAIL` line per check, then
`N failures of M checks`, and exits with code 1 if anything failed.

| Option | Meaning |
|---|---|
| `--quiet` | print only failures and notes |
| `--dist <dir>` | serve this build instead of the repo's `dist/` |
| `--base <url>` | use a server you started yourself |
| `--chrome <path>` | the browser to drive |

## The server

`lib.mjs` serves `dist/` the way GitHub Pages does: a file as it is; a folder
with an `index.html` answers 200 on `/folder/` and 301 on `/folder`; anything
else answers 404 with `404.html`. There is no fallback to `index.html`, so a
route without a static file goes through `404.html` exactly as in production.

## `check-routes.mjs`

At 1280 and 375 px, for every static route (the list comes from
`scripts/newsroom/lib/routes.mjs`), with and without the trailing slash: the
right status, the static copy in the HTML, the app replacing it, exactly one
`<h1>` with the expected text, one canonical link with the route's own address,
no horizontal scroll, no console error. Then: the article is readable and
styled with JavaScript off and its heading does not jump when the app takes
over; the old newsletter addresses lead to the new ones; a route without a
static file still opens; unknown slugs show "not found"; and, while no Lens
piece is published, no page shows an empty Lens section.

## `shots.mjs`

Not a check: `node shots.mjs insights insights/dispatch --width 375` saves
full-page screenshots in `screenshots/`. Write paths without the leading slash
(Git Bash on Windows rewrites `/insights` into a file path); `home` is `/`.

## `make-og-default.mjs`

Renders `public/og/default.png` (1200x630), the share image of every page that
has none of its own. It stops without writing if the fonts do not load.
