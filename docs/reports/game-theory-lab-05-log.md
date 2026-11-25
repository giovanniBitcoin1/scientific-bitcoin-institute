# Game Theory Lab 05 — working log

Prompt 5 (stage 0: one fix to module 04; stage 1: module 05 "Incomplete
information and signals"). One line per check run to its end (command,
result) and one line per source looked up (what, where, what it says). A
session that picks up this prompt reads this file first.

## Session 1 (25 November 2026)

- Start: branch `game-theory-lab`, tree clean, last commit 4aca4b8 "Game
  Theory Lab 04: report". Status file: module 04 done, nothing in progress;
  `docs/reports/game-theory-lab-04.md` committed. Preconditions met.
- Found while reading module 04: `presets.js` holds the Italian name of the
  move "Down" of the random tree double-encoded (`GiÃƒÂ¹` instead of `Giù`),
  shown as such on the Italian page; two comments in `presets.js`, one in
  `bargaining.js` and three in `forks.js` are garbled the same way. Fixed in
  stage 0.

### Stage 0

- Change: `presetTree('commit')` is now `entryTree({ f: 0, k: 1, commit:
  true })` (newcomer player 0, firm player 1 at the root, the very tree of
  F1); `PLAYERS.commit` = (Newcomer, Firm). Panel A's note under the table
  now names the players ("Rows: the plans of the newcomer, whose payoff is
  written first; columns: those of the firm"), since "first player" was
  wrong once the firm moves first; the legend under the tree adds "payoffs
  (newcomer, firm), the first on top" (for every preset, with its own
  names). Observe item 2 now reads (0, 3) as (newcomer, firm). A small
  change, so the new order was kept.
- `node scripts/lab/check-game-theory-04.mjs`: all PASS, "All checks
  passed" (new: newcomer player 0 and firm at the root; k = 1 commits to
  (0, 3); 4 non-perfect equilibria each with a threat: three of the firm
  at [Wait > Enter] 0 → 2, one of the newcomer at [Commit] −1 → 0).
- `npx vite build`: built in 14.4 s.
- `node modules/game-theory-sequential-games-commitment.mjs`: 0 failures
  of 45 (new: threats named for the right player, legend, root "F", rows
  note, solved "payoffs 0 and 3").
- `node check-module.mjs game-theory sequential-games-commitment`: 0
  failures of 56.
- Committed: 1fa2004 "Game Theory Lab 04: fixes".

### Stage 1: sources (looked up by a helper agent, read in the sources named)

- Harsanyi, Management Science 14: Crossref 10.1287/mnsc.14.3.159 (I, "The
  Basic Model", pp. 159–182, Nov 1967), 10.1287/mnsc.14.5.320 (II, pp.
  320–334, Jan 1968), 10.1287/mnsc.14.7.486 (III, pp. 486–502, Mar 1968).
  The abstract: with consistent beliefs, "nature first conducts a lottery in
  accordance with the basic probability distribution", known to every
  player. Confirmed (consistency is the assumption "in most of the paper").
- Akerlof 1970, QJE 84(3), 488–500: Crossref 10.2307/1879431, IDEAS (last
  page 500). Rejections: Akerlof's essay on nobelprize.org
  (/prizes/economic-sciences/2001/akerlof/article/): AER ("did not publish
  papers on subjects of such triviality"), Review of Economic Studies (same
  grounds), JPE (two referee reports: "if this paper was correct, economics
  would be different"), then accepted by the QJE. Confirmed.
- 2001 prize: nobelprize.org summary, Akerlof, Spence and Stiglitz "for
  their analyses of markets with asymmetric information". Confirmed.
- Spence 1973, QJE 87(3), 355–374: Crossref 10.2307/1882010, IDEAS. Confirmed.
- Rothschild and Stiglitz 1976, QJE 90(4), 629–649: Crossref 10.2307/1885326,
  IDEAS. Confirmed.
- Cho and Kreps 1987, QJE 102(2), 179–221: Crossref 10.2307/1885060, IDEAS.
  The name "intuitive criterion" for their test: standard attribution
  (secondary sources), not read in the paper. Text says "the test of Cho and
  Kreps (1987), often called the intuitive criterion".
- Zahavi 1975, J. Theor. Biol. 53(1), 205–214: Crossref
  10.1016/0022-5193(75)90111-3. Confirmed.
- Grafen 1990, J. Theor. Biol. 144(4), 517–546: Crossref
  10.1016/S0022-5193(05)80088-8. "Firm footing" is the standard view but
  contested (Penn and Számadó 2020, Biological Reviews, abstract via Europe
  PMC). Softened: "widely taken to have given it a formal footing, though
  that reading is now debated".
- Crawford and Sobel 1982, Econometrica 50(6), 1431–1451: Crossref
  10.2307/1913390, IDEAS. Confirmed.
- Dessein 2002, RES 69(4), 811–838: Crossref 10.1111/1467-937X.00227. The
  IDEAS abstract: delegation beats communication "as long as the incentive
  conflict is not too large relative to the principal's uncertainty". The
  uniform-quadratic threshold 1/√12 ≈ 0.289 not read in the paper: the
  lecture presents it as computed in this model, after Dessein's general
  result.
- Carlsson and van Damme 1993, Econometrica 61(5), 989–1018: Crossref
  10.2307/2951491, IDEAS abstract: "when the noise vanishes, iterated
  elimination of dominated strategies in the global game forces the players
  to conform to ... risk dominance". Confirmed.
- Morris and Shin 1998, AER 88(3), 587–597: IDEAS. Confirmed.
- Osborne 2004 (author's table of contents): ch. 9 "Bayesian Games", ch. 10
  "Extensive Games with Imperfect Information" (signalling, education,
  strategic information transmission). Tadelis (Princeton UP page): ch. 12
  "Bayesian Games", 15 "Sequential Rationality with Incomplete Information",
  16 "Signaling Games", 18 "Information Transmission and Cheap Talk".
  Shoham and Leyton-Brown (masfoundations.org): ch. 6 "Richer
  Representations" (6.3 Bayesian games), ch. 8 "Communication" (cheap talk,
  signalling games). All confirmed.

### Stage 1: checks

- Probe (scratchpad, not a check): every value of the prompt reproduced
  except the lemons samples: seeds 1–10 give price 0.576–0.617, cars
  0.472–0.522, gains 0.304–0.357, rounds 24–27 (prompt 0.579–0.619,
  0.476–0.529, 0.308–0.364, 21–25); 1,000 cars 0.529–0.667 (prompt
  0.53–0.64). The prompt's limits (0.03, 0.035, 0.035) hold.
- `node scripts/lab/check-game-theory-05.mjs` (logic only, first run): 9
  FAIL. Two were errors of the check: the brute force built its grid as
  k × 0.001, the candidate test as k/1000 (floats differ, `includes` missed
  them), and pooling at 0.5 with λ = 0.3 was expected to make both types
  deviate (only the low type does: λ/c_H = 0.6). The cutoffs were expected
  to move at every step even after converging to the last bit. Rounds over
  seeds 1–40 are 18–41 (not 20–30): limit set from these 40 seeds to
  15–45. The survey's sample dots are up to 0.040 from the exact share (at
  q_min = 0, b = 1.9: near b = 2 the drift is weak and a sample stops
  early): limit first set to 0.05, but ten other seeds gave up to 0.634.
  All the large gaps are at q_min = 0, b = 2, a knife edge of the exact
  model (p_{t+1} = min(p_t, 1): any price below 1 stays), where a sample
  ends anywhere between 0.366 and 1. Check now: every other dot within 0.1
  on the page's seed and ten others (largest 0.093); the knife edge is
  reported, not checked.
- `node scripts/lab/check-game-theory-05.mjs` (logic only): all PASS, "All
  checks passed". Node timings: 10,000 cars 1.5 ms, lemons survey 65 ms,
  simulate 1.4 ms, cheap-talk survey 0.3 ms, "To the end" at σ = 0.02 1.9 ms.
- WIP commit 5cdfe8c (logic, self-check, GameTree props).
- Lecture word counts: first draft EN 1,789 (cut to 1,696); IT 1,727 (cut
  to 1,694). "free" (cheap talk, "free and unverifiable") and "gratuito"
  removed: the "never call the course free" check matches any use.
- `npx vite build`: built in 8.1 s; module 05 chunk 75.6 kB; module 04's
  `trees.js` (with `games.js`) now in a shared chunk `trees-….js`, 9.5 kB.
- `node check-module.mjs game-theory incomplete-information-signalling`:
  0 failures of 56. Figure heights 1280 EN 423 and 356 px, IT 404 and 376;
  375 EN 622 and 340, IT 638 and 414.
- `node shots.mjs game-theory incomplete-information-signalling`: looked at
  all ten shots. Fixed: F2's tick "0" was missing (a trailing-zero regex
  ate it) and its text was oversized (line now at most 512 px wide), its
  readouts always four decimals; Panel A was empty until "Run": it now
  shows sample no. 1 at once and "Run" replays the rounds (70 ms each).
- `node scripts/lab/check-game-theory-05.mjs` with the texts: 2 FAIL — the
  observe list said the price "falls from 0.900", the sample's first price
  is 0.898 (the exact model's 0.9). Text fixed; then all PASS.
- WIP commit 1a86f18 (figures, panels, lectures, texts).
- `node modules/game-theory-incomplete-information-signalling.mjs` (new):
  0 failures of 39. It showed "1 rounds" for a one-round market: plural
  fixed, check tightened.
- `node shots.mjs game-theory incomplete-information-signalling` after the
  fixes: F2 and Panel A looked at again, nothing more to change.

### Stage 1: the CHECKS list on the final code (one at a time)

- `npx vite build`: built in 7.7 s.
- `node scripts/lab/check-game-theory-01.mjs` … `-05.mjs`: all five "All
  checks passed", no FAIL line.
- `node check-index.mjs game-theory`: 0 failures of 80; `network`: 0 of
  76; `complexity`: 0 of 72.
- `node check-links.mjs`: 0 failures of 131.
- `node check-module.mjs game-theory <slug>` for the five modules: 0
  failures of 56 each.
- Functional checks: what-is-a-game 0 of 32, nash-equilibrium 0 of 49,
  mixed-strategies-zero-sum 0 of 39, sequential-games-commitment 0 of 45
  (after the `GameTree.jsx` change), incomplete-information-signalling 0 of
  39. Timings in the browser: Panel A "Run" replay 2.0 s (27 rounds at 70
  ms; the computation is instant), Panel A "Survey" 49 ms, Panel C
  "Simulate" 3 ms, Panel C "Survey" 2 ms, F2 "To the end" at σ = 0.02 4 ms.
- Module 05 figure heights (final): 1280 EN 423 and 310 px, IT 404 and
  330; 375 EN 622 and 340, IT 638 and 414.
- `node build-main.mjs && node compare-main.mjs`: 0 failures of 144.
- `npm run build`: built in 10.1 s; post-build 9 static pages, 3 redirect
  stubs, feed, sitemap.
- `npm run check:dist`: 0 failures of 108.
- Chunks: module 05 76.1 kB (28.3 kB gzip); shared `trees-….js` 9.5 kB
  (4.0 kB gzip).
- Squash: `git reset --soft 1fa2004`, one commit e0c460e "Game Theory Lab
  05: Incomplete information and signals".
- Report written to `docs/reports/game-theory-lab-05.md`; status file set
  to "prompt finished" in the same commit as the report.

