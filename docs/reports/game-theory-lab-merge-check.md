# Game Theory Lab — final touches and merge check: report

Prompt `prompts.local/game-theory-lab-merge-check.md`, 26 November 2026.
Working log: `docs/reports/game-theory-lab-merge-check-log.md`.

At the start the tree was clean on `game-theory-lab`, and
`docs/reports/game-theory-lab-review.md` was committed (e4d142a). Nothing was
in progress.

## Stage 0 — final touches (commit 772f0d4)

File by file:

- **`CLAUDE.md`**: in the Game Theory Lab subsection, "provisional path
  `/game-theory-lab`" now reads "path `/game-theory-lab` (`paths.js`;
  confirmed by Adriano on 26 November 2026)". No other line called this lab's
  path provisional: the list in the Labs engine section names only
  `complexity` and `network`. The Network Lab's "provisional path" line is
  unchanged, and so is the rest of the file.
- **Module 12, F2, "Three out of four" / «Tre su quattro»**:
  `mechanism-design/index.js` (the caption, EN and IT), and the comments at
  the top of `mechanism-design/bilateral.js` and `FigureTrade.jsx`. The
  lecture and `texts.js` never named the figure's title. They already say
  "of the four properties, a rule can have at most three", so they did not
  change. No check pinned the title: a grep over `src/`, `scripts/` and the
  status file finds no other "Two out of three" / «Due su tre».
- **Pari o dispari** (Italian only; the English keeps the coins):
  - `what-is-a-game.it.md`: «ogni giocatore mostra uno o due dita: uno vince
    se la somma è pari, l'altro se è dispari».
  - `mixed-strategies-zero-sum.it.md`: the opening describes the finger game
    («il giocatore di riga vince se la somma è pari, cioè se i due mostrano lo
    stesso numero»). «mostra testa metà delle volte» becomes «mostra un dito
    metà delle volte». In the Simulation C paragraph, «cambia lato» becomes
    «cambia mossa», «sceglie testa» becomes «mostra un dito», and «contro chi
    lascia decidere a una moneta onesta» stays: there the coin is only the
    random device.
  - `sequential-games-commitment.it.md` and `sequential-games-commitment/texts.js`:
    «vede la moneta» becomes «vede le dita dell'altro».
  - Italian move labels: «Testa»/«Croce» become «Un dito»/«Due dita» in
    `what-is-a-game/GameExplorerPanel.jsx`,
    `nash-equilibrium/EquilibriaPanel.jsx`,
    `mixed-strategies-zero-sum/FigureSquare.jsx`, `AllEquilibriaPanel.jsx`,
    `LearningPanel.jsx` and `ReaderPanel.jsx`, and
    `evolution-and-learning/HedgePanel.jsx`. In
    `sequential-games-commitment/presets.js` the tree labels become «Un dito»
    (1) and «Due dita» (2). In module 03's Panel C (`ReaderPanel.jsx`), the
    short labels are 1 and 2, the sliders read «Probabilità s di cambiare
    mossa» and «Probabilità h di un dito», and the players are «Preferisce un
    dito» and «Una moneta onesta» (kept: a coin that decides for you). In
    `mixed-strategies-zero-sum/texts.js`, the observe item 4 now names
    «Preferisce un dito».
  - The payoffs are unchanged: the row player wins when both show the same
    number, which makes the sum even, as with two matching coins.
  - `docs/game-theory-lab-status.md`, Italian terms: the rows "matching
    pennies" and "heads, tails" now say this.
- **Module 11, the box** (`auctions.en.md`, `auctions.it.md`): "They propose
  the monopolistic price, which they show resists manipulation by the
  miner: …" / «Propongono il prezzo monopolistico, che a quanto mostrano
  resiste alle manipolazioni del miner: …». The rest of the sentence ("keeps
  the revenue as the block grows and makes shading less useful…", Yao 2020)
  is as it was.
- **«Di default»**: it appeared only in `mining-as-a-game.it.md`, four times
  in the list of a miner's decisions, and each now reads «Per impostazione
  predefinita». No other Italian text of the lab had it.

Stage 0 checks, after `npx vite build`, all passed: the self-checks of
modules 01, 02, 03, 04, 07, 11, 12 and 13 (the modules touched);
`check-module` and the functional check of the same eight modules, 0
failures each; and `check-links` (0 of 131). **One slip:** the self-checks of
11, 12 and 13 were sent as one batch of three commands. Each ran to its end
and passed. Every other check, here and in stage 1, ran alone.

## Stage 1 — merge check

- **Fetch:** `git fetch origin` succeeded and asked for no credentials. Only
  `origin/data` moved (the data collector's force-pushed orphan branch). The
  git configuration was not touched.
- **Hashes:** `main` = `origin/main` =
  ddfed85b06c58b04af8ca951ff17e73b0adf37b7. Both are ancestors of
  `game-theory-lab`. `git log main..origin/main` is empty.
- **Merge:** none needed, so there is no merge commit and no conflict.
- **Unchanged since ddfed85:** `src/data/lab/config.json` (`locked: true`,
  `adminHash` as it was), `package.json`, `src/data/nav.json`,
  `src/components/Header.jsx` and `public/accademia`.
- **Checks of the last run** (branch tip 772f0d4; one command each; every
  one ran to its last line):

| Check | Result |
|---|---|
| `npx vite build` | built |
| `check-game-theory-01` … `-14` | all checks passed (14 of 14) |
| `check-index` game-theory / network / complexity | 0 of 76 / 0 of 76 / 0 of 72 |
| `check-links` | 0 of 131 |
| `check-module` + functional, 01–14 | 0 failures in all 28 runs (counts in the log) |
| `build-main` + `compare-main` | main built; 0 of 144 |
| `npm run build` | exit 0: content check 3 files, 0 warnings; post-build 9 static pages, 3 redirect stubs, feed, sitemap |
| `npm run check:dist` | 0 of 108 |

  The first `npm run build` printed npm's "new version" notice as its last
  lines, so I ran it again with the output saved to see the real result
  (above).
- **Ancestry:** `origin/main` is an ancestor of the branch tip, so `main`
  can be fast-forwarded to it.
- **Commits over origin/main:** 55 at 772f0d4. With this report's commit,
  "Game Theory Lab: merge check and report", there are 56.
- I did not check out `main`, merge into it, or push anything.

## What the push will publish

The Game Theory Lab goes live like the other two labs, behind the same lock.
`config.json` is unchanged, so `locked` is still `true`.

- **`/labs`:** three cards: Complexity Lab, Network Lab, Game Theory Lab.
  Each shows its name, tagline and "N of M modules ready", with an "Open"
  link. The Game Theory Lab card reads "14 of 14 modules ready" («14 moduli
  pronti su 14»). The cards sit two and one. The page is public and never
  locked.
- **The "Labs" dropdown** in the nav gets a third link, "Game Theory Lab".
  It comes from the registry; the nav files did not change.
- **`/game-theory-lab` while locked:** the hero (the lab's name and index
  text, the EN/IT toggle and the "All labs" link), then the module grid,
  blurred under the lock overlay: "Members area" + PRO, 🔒 "Content reserved
  for subscribers", "Subscribe & unlock" → `/support/membership`.
- **`/game-theory-lab/<slug>` while locked:** the module's number, title and
  summary, a blurred stand-in under the same overlay, and a link back. No
  lecture or simulation chunk is fetched.
- **Admin preview:** `/game-theory-lab?admin` (or `/lab?admin`) shows the
  passphrase form. With the right passphrase, that browser alone sees every
  lab unlocked: all 14 modules with lectures, live figures, panels and
  exercises, under the slate bar "Admin preview — visitors see the locked
  Lab" with "Lock again".
- **The limit, as in `CLAUDE.md`:** the lock is visual. The module chunks
  are in `dist/` and readable by anyone who requests them directly.
- **The deploy:** a push to `main` starts `.github/workflows/deploy.yml`.
  On Ubuntu with Node 20 it runs `npm ci`, then `npm run build` (validate,
  `vite build`, the newsroom post-build), then `npm run check:dist`, and
  then publishes `dist/` to GitHub Pages. The Dispatch email workflow runs
  on a push only when `src/content/dispatch/*.md` changes, and this branch
  changes none of those files. The data collector and NewHedge workflows run
  on schedules, not on a push.

## Commands for Adriano (PowerShell, from the repository folder)

```powershell
git status                          # must say: nothing to commit, working tree clean
git switch main
git pull --ff-only origin main      # main is ddfed85 = origin/main; nothing should come in
git merge --ff-only game-theory-lab
git log --oneline -3                # top line: "Game Theory Lab: merge check and report"
git push origin main
```

If `git pull --ff-only` brings in new commits, `git merge --ff-only` may then
refuse. In that case, stop and run the merge check again on the branch.

Once the deploy has finished (Actions tab, "Deploy to GitHub Pages", green),
look at these on the live site:

1. `/labs`: three cards; Game Theory Lab "14 of 14 modules ready".
2. The nav's "Labs" dropdown: the third link opens `/game-theory-lab`.
3. `/game-theory-lab`: the hero, the blurred grid, the overlay; the button
   leads to `/support/membership`. Switch to IT.
4. One module, e.g. `/game-theory-lab/what-is-a-game`: title and summary,
   blurred stand-in, link back.
5. `/game-theory-lab?admin`, the passphrase, then a module or two: lecture,
   panels and figures work; in IT, module 03's Panel C shows «Un dito» /
   «Due dita». Then "Lock again".
6. `/lab` and `/network-lab`: unchanged, still locked.
