# Game Theory Lab — merge check: working log

Prompt `prompts.local/game-theory-lab-merge-check.md`, 26 November 2026.
One line per check run to its end (command, result) and per lookup.

## Start

- `git status --short`: clean; branch `game-theory-lab`; last commit e4d142a
  "Game Theory Lab review: report" (the review report is committed). Nothing
  in progress.

## Stage 0 — final touches

Edits (one commit, "Game Theory Lab: final touches"):

- CLAUDE.md, Game Theory Lab subsection: "provisional path" -> "path
  `/game-theory-lab` (`paths.js`; confirmed by Adriano on 26 November
  2026)". That was the only line naming this lab's path as provisional: the
  "Labs engine" list names only `complexity` and `network`, and the
  Network Lab's "provisional path" line was left alone.
- Module 12 F2: "Two out of three" / «Due su tre» -> "Three out of four" /
  «Tre su quattro» in the caption (`mechanism-design/index.js`, EN and IT) and
  in the comments of `bilateral.js` and `FigureTrade.jsx`. Grep over `src/`,
  `scripts/` and the status file: no other occurrence. The lecture and
  `texts.js` do not name the figure's title, and they already say "of the four
  properties, a rule can have at most three". No check pins the title.
- Pari o dispari (Italian only; the English keeps the coins): the lectures of
  01 (line 95), 03 (lines 4, 18, 53) and 04 (line 57, «vede la moneta» -> «vede
  le dita dell'altro»), and `sequential-games-commitment/texts.js` (the same
  phrase in the exercise answer). The Italian move labels Testa/Croce become
  «Un dito»/«Due dita» in the panels and figures of 01 (Game explorer), 02
  (Find the equilibria), 03 (F1, Panels A, B, C), 04 (Panel A trees: short
  labels 1 and 2) and 07 (Panel C). Panel C of module 03: «Preferisce un
  dito», «Probabilità h di un dito», «Probabilità s di cambiare mossa»; «Una
  moneta onesta» kept as the random device. Module 03 texts.js, observe item 4,
  «Preferisce un dito». Status file, Italian terms: two rows updated. The row
  player wins when the two show the same number (an even sum), so the payoffs
  are unchanged.
- Module 11 box: "They propose the monopolistic price, which they show resists
  manipulation by the miner: ..." / «Propongono il prezzo monopolistico, che a
  quanto mostrano resiste alle manipolazioni del miner: ...».
- «Di default» was only in module 13's Italian lecture (four lines of the list
  of decisions) -> «Per impostazione predefinita». Grep: no other occurrence in
  the lab's Italian texts.

Checks (stage 0):

- `npx vite build`: built in 15.54 s.
- `node scripts/lab/check-game-theory-01.mjs`: all checks passed.
- `node scripts/lab/check-game-theory-02.mjs`: all checks passed.
- `node scripts/lab/check-game-theory-03.mjs`: all checks passed.
- `node scripts/lab/check-game-theory-04.mjs`: all checks passed.
- `node scripts/lab/check-game-theory-07.mjs`: all checks passed.
- `node scripts/lab/check-game-theory-11.mjs`: all checks passed.
- `node scripts/lab/check-game-theory-12.mjs`: all checks passed.
- `node scripts/lab/check-game-theory-13.mjs`: all checks passed.
  **Slip:** 11, 12 and 13 were sent in one batch of three parallel commands,
  against the "Long checks" rule. Each ran to its end and passed; every later
  check was run alone.
- `check-module.mjs game-theory what-is-a-game`: 0 failures of 56.
- `modules/game-theory-what-is-a-game.mjs`: 0 failures of 32.
- `check-module.mjs game-theory nash-equilibrium`: 0 failures of 56.
- `modules/game-theory-nash-equilibrium.mjs`: 0 failures of 49.
- `check-module.mjs game-theory mixed-strategies-zero-sum`: 0 failures of 56.
- `modules/game-theory-mixed-strategies-zero-sum.mjs`: 0 failures of 39.
- `check-module.mjs game-theory sequential-games-commitment`: 0 failures of 56.
- `modules/game-theory-sequential-games-commitment.mjs`: 0 failures of 45.
- `check-module.mjs game-theory evolution-and-learning`: 0 failures of 68.
- `modules/game-theory-evolution-and-learning.mjs`: 0 failures of 41.
- `check-module.mjs game-theory auctions`: 0 failures of 60.
- `modules/game-theory-auctions.mjs`: 0 failures of 29.
- `check-module.mjs game-theory mechanism-design`: 0 failures of 56.
- `modules/game-theory-mechanism-design.mjs`: 0 failures of 29.
- `check-module.mjs game-theory mining-as-a-game`: 0 failures of 56.
- `modules/game-theory-mining-as-a-game.mjs`: 0 failures of 32.
- `check-links.mjs`: 0 failures of 131.
- Commit 772f0d4 "Game Theory Lab: final touches".

## Stage 1 — merge check

- `git fetch origin` (with `GIT_TERMINAL_PROMPT=0`, no credential asked):
  exit 0; only `origin/data` moved (forced update 733ebe1...22cbd04, the data
  collector's orphan branch). Git configuration not touched.
- `git rev-parse main origin/main`: both ddfed85b06c58b04af8ca951ff17e73b0adf37b7.
- `git merge-base --is-ancestor main game-theory-lab`: yes.
- `git merge-base --is-ancestor origin/main game-theory-lab`: yes.
- `git log --oneline main..origin/main`: empty. Nothing to merge; no merge
  commit.
- `git rev-list --count origin/main..game-theory-lab`: 55 (at 772f0d4).
- `git diff ddfed85 HEAD --stat` on `src/data/lab/config.json`,
  `package.json`, `src/data/nav.json`, `src/components/Header.jsx`,
  `public/accademia`: empty (unchanged).

Checks on the branch tip 772f0d4, one command each:

- `npx vite build`: built in 17.69 s.
- `check-game-theory-01.mjs` … `check-game-theory-14.mjs`, fourteen
  commands: all checks passed, each.
- `check-index.mjs game-theory`: 0 failures of 76.
- `check-index.mjs network`: 0 failures of 76.
- `check-index.mjs complexity`: 0 failures of 72.
- `check-links.mjs`: 0 failures of 131.
- `check-module.mjs game-theory <slug>` and `modules/game-theory-<slug>.mjs`:
  01 what-is-a-game 0/56, 0/32; 02 nash-equilibrium 0/56, 0/49;
  03 mixed-strategies-zero-sum 0/56, 0/39; 04 sequential-games-commitment
  0/56, 0/45; 05 incomplete-information-signalling 0/56, 0/39;
  06 repeated-games-reputation 0/60, 0/41; 07 evolution-and-learning 0/68,
  0/41; 08 congestion-price-of-anarchy 0/56, 0/43; 09 games-on-networks 0/60,
  0/42; 10 coalitions-sharing 0/60, 0/36; 11 auctions 0/60, 0/29;
  12 mechanism-design 0/56, 0/29; 13 mining-as-a-game 0/56, 0/32;
  14 capstone-the-price-of-security 0/56, 0/39 (failures/checks).
- `build-main.mjs`: main built in 12.13 s into `.main-dist` (temporary
  worktree, removed; `git worktree list` afterwards shows no `.main-wt`).
- `compare-main.mjs`: 0 failures of 144.
- `npm run build`: the first run's last lines shown were only npm's
  "new version" notice, so it was run again with the output saved: exit 0;
  "Content check passed: 3 files, 0 warnings"; built in 14.23 s; "Post-build:
  9 static pages, 3 redirect stubs, feed (3 entries) and sitemap written to
  dist."
- `npm run check:dist`: 0 failures of 108, exit 0.
- `git merge-base --is-ancestor origin/main HEAD`: yes; main can be
  fast-forwarded to the branch tip.
- main not checked out, nothing merged into main, nothing pushed.

## Close

- Report `docs/reports/game-theory-lab-merge-check.md` written; status file
  updated (ready to merge). Committed with this log as "Game Theory Lab:
  merge check and report" (56 commits over origin/main with it).
