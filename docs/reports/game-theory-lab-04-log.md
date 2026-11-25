# Game Theory Lab 04 — working log

Prompt 4 (module 04 "Games in time and credible commitment"; no stage 0).
One line per check run to its end (command, result) and one line per source
looked up (what, where, what it says). A session that picks up this prompt
reads this file first.

## Session 1 (25 November 2026)

- Start: branch `game-theory-lab`, tree clean, last commit 1565518 "Game
  Theory Lab 03: report". Status file: module 03 done, nothing in progress;
  `docs/reports/game-theory-lab-03.md` committed. Preconditions met.

### Checks

- Probe (scratchpad, not a check): survey of 20,000 trees in 0.8 s; every
  value within 0.015 of the prompt's expected except "both prefer second
  among games with no pure equilibrium", 0.651 against 0.671. Independent
  computation (no trees.js) on 4,000,000 random 2 × 2 games: 0.6664
  (better 0.1461, worse 0.1250, no pure 0.1249, leader above 0.0477). Ten
  other seeds of 20,000 trees: 0.643–0.683 (only ~2,500 games have no pure
  equilibrium). Limit set from the seeds: within 0.025 of 2/3.
- `node scripts/lab/check-game-theory-04.mjs` (logic only): 1 FAIL — with
  commitment the firm committed at k = 2 (a tie, given to the first move,
  "Commit"). "Wait" now comes first in both commitment trees, so an
  indifferent firm does not commit. "Play" (Panel C): largest gap from
  (1 − x) x/m 0.0164 on the page's seeds, but 0.015–0.033 over ten other
  seeds (3 of 10 above 0.02): the noise is the 1,000 sampled thresholds
  (gap from the population's own curve 0.005–0.012). Check kept as asked,
  a second one added against the population's own curve.
- `node scripts/lab/check-game-theory-04.mjs` (logic only): all PASS, "All
  checks passed".
- `npx vite build` (figures, panels, lecture, texts in place): built in
  12.9 s; module chunk 83.6 kB.
- `node check-module.mjs game-theory sequential-games-commitment` (first
  build): 0 failures of 56. Figure heights at 375 px IT 440 and 473 px.
- `node shots.mjs game-theory sequential-games-commitment`: looked at both
  figures and the three panels at 1280 EN and 375 IT; nothing to change.
- `node scripts/lab/check-game-theory-04.mjs` with the texts: 6 FAIL — the
  observe list and exercise 6 had 0.249 / 0.752 / 0.732 where the page, which
  writes with toFixed(3), shows 0.248 / 0.751 / 0.731 (0.2485, 0.7515, 0.7315
  exactly); and one phrase, "(0, 4)", that the lecture does not use. Texts
  corrected, phrase replaced by "the firm keeps 4".
- `node scripts/lab/check-game-theory-04.mjs`: all PASS, "All checks
  passed". Lecture 1,690 words EN, 1,682 IT; box 198 EN, 196 IT.
- `node modules/game-theory-sequential-games-commitment.mjs` (new, first
  run): 2 failures of 43 — the label "not subgame perfect" sat against the
  payoffs with no space in the text ("…0 and 4NOT…"). A space added in
  TreePanel.jsx (the check was right).
- `npx vite build`, then the same: 0 failures of 43.

Final CHECKS list, on the state of "WIP Game Theory Lab 04: functional
check and status file" (ec583cc), one command at a time in the foreground,
each to its last line:

- `npx vite build`: 1,531 modules, built in 13.3 s.
- `node scripts/lab/check-game-theory-01.mjs`: 102 PASS, 0 FAIL.
- `node scripts/lab/check-game-theory-02.mjs`: 124 PASS, 0 FAIL.
- `node scripts/lab/check-game-theory-03.mjs`: 119 PASS, 0 FAIL.
- `node scripts/lab/check-game-theory-04.mjs`: 118 PASS, 0 FAIL (Node:
  survey of 20,000 trees 0.7 s; "Play" 4 ms).
- `node check-index.mjs game-theory`: 0 failures of 80.
- `node check-index.mjs network`: 0 failures of 76.
- `node check-index.mjs complexity`: 0 failures of 72.
- `node check-links.mjs`: 0 failures of 131.
- `node check-module.mjs game-theory what-is-a-game`: 0 failures of 56.
- `node check-module.mjs game-theory nash-equilibrium`: 0 failures of 56.
- `node check-module.mjs game-theory mixed-strategies-zero-sum`: 0
  failures of 56.
- `node check-module.mjs game-theory sequential-games-commitment`: 0
  failures of 56. Figure heights: F1 313 px and F2 277 px at 1280 (EN and
  IT); 421 / 454 at 375 EN, 440 / 473 at 375 IT.
- `node modules/game-theory-what-is-a-game.mjs`: 0 failures of 32.
- `node modules/game-theory-nash-equilibrium.mjs`: 0 failures of 49.
- `node modules/game-theory-mixed-strategies-zero-sum.mjs`: 0 failures of
  39.
- `node modules/game-theory-sequential-games-commitment.mjs`: 0 failures of
  43. Timings: "Survey" 2,000 trees 0.2 s, 20,000 trees 1.1 s; "Play" in
  Panel C 0.09 s.
- `node build-main.mjs`: built main into `.main-dist`.
- `node compare-main.mjs`: 0 failures of 144.
- `npm run build`: content check passed (3 files, 0 warnings); built in
  13.9 s; post-build 9 static pages, 3 redirect stubs, feed (3 entries),
  sitemap.
- `npm run check:dist`: 0 failures of 108.
- Chunks (dist, raw / gzip): module 04 83.61 / 30.01 kB (GameTree.jsx inside
  it, its only user so far); module 01 73.06 / 26.27; module 02 82.88 /
  29.32; module 03 72.37 / 26.18. Vite re-split the shared code: `games-…`
  8.50 / 3.46 (games.js and PayoffTable.jsx, now also used by module 04),
  `randomgames-…` 1.40 / 0.75; `ui-…` 2.32, `charts-…` 3.14, `Slider-…`
  1.20, `useExperiment-…` 0.86.

### Sources

Web, 25 November 2026 (one pass by a helper agent, primary records where
reachable; Crossref for volumes and pages):

- Zermelo 1913 — citation confirmed (Eichhorn 2004, LMU PDF: Proc. 5th ICM,
  Cambridge 1912, vol. 2, 501–504). What he proved: Schwalbe and Walker
  (discussion-paper version, ageconsearch 263784; GEB 34 (1), 123–137, 2001,
  DOI 10.1006/game.2000.0794): "only the statement on the determinateness
  of chess comes close to what Zermelo did"; "no use is made of backward
  induction". He defined a winning position and bounded the moves needed to
  force a win. SOFTENED: the lecture says he asked whether one side can force
  a win in chess and gave the first mathematical answer, and that his
  argument was not backward induction.
- Selten 1965 — confirmed, ZgS 121, 301–324 and 667–689 (Bonn lab page,
  Econlib). Selten 1975, IJGT 4, 25–55 (Crossref): the 1965 concept renamed
  "subgame perfect" there (from the abstract via search results; full text
  not reached). Lecture: introduced in 1965, named "subgame perfect" later.
- von Stackelberg 1934 — confirmed, Springer, Wien und Berlin (Springer
  page of the 2011 translation).
- McKelvey and Palfrey 1992 — confirmed, Econometrica 60 (4), 803–836
  (Caltech author PDF). Table IIA, four-move game, N = 281: f1 = .071; p. 808:
  "In only 7% of the four move games … does the first mover choose TAKE on
  the first round." Quoted: 7%.
- Güth, Schmittberger and Schwarze 1982 — confirmed, JEBO 3 (4), 367–388
  (Crossref). Their own figures not reached (ScienceDirect 403). Typical
  findings from Henrich et al. 2001, AER P&P 91 (2), 73–78 (read): "modal
  offers are consistently 50 percent" in industrialized societies, "offers
  below 20 percent are rejected with probability 0.40 to 0.60". Lecture
  quotes these with Henrich et al., added to Further reading; "40 to 50%"
  kept as the usual range (Camerer and Thaler 1995, secondary).
- Rubinstein 1982 — confirmed, Econometrica 50 (1), DOI 10.2307/1912531;
  end page 109 in most lists, 110 on the Society's page: kept 97–109. The
  formula (1 − δ2)/(1 − δ1 δ2) with immediate agreement: standard result,
  secondary sources only; also computed by the self-check.
- Narayanan et al. 2016, §5.5 (free draft, lopp.net PDF, pp. 162–163):
  punitive forking "doesn't appear to work without a majority of the network
  hash power", the blacklisted transactions "will still make it into the
  longest chain", the threat "is not credible"; feather-forking gives up
  after k confirmations, with one confirmation the chance is α², "only a 4%
  chance" at 20%; other miners "may rationally decide to join you"; success
  depends on "how convincing you are … that you're definitely going to
  fork". The words "just a theoretical attack" are about selfish mining, not
  these forks; for the section: "in practice we've seen very little behavior
  of anything other than the default strategy". The box says that, not
  "described as theoretical".
- Osborne 2004 — author's table of contents: ch. 5–7 extensive games with
  perfect information (theory; illustrations incl. ultimatum, Stackelberg;
  extensions incl. entry); bargaining is ch. 16: added.
- Tadelis 2013 — Princeton UP page: ch. 7 Preliminaries, 8 Credibility and
  Sequential Rationality, 11 Strategic Bargaining. Confirmed.
- Shoham and Leyton-Brown — Cambridge page: ch. 5 "Games with Sequential
  Actions". Confirmed (kept 2009, as in every module).
- Schelling 1960 — 1980 edition text: ch. 8 "The Threat That Leaves
  Something to Chance"; ch. 2: "to burn bridges behind one may suffice to
  undo an opponent". Confirmed.
- Dixit 1980 — EJ 90 (357), 95–106 (Crossref). Confirmed.
- Rosenthal 1981 — JET 25 (1), 92–100 (Crossref); McKelvey and Palfrey
  credit him with the centipede (cited there as 1982). Confirmed.
- Squash: ba8855a, fe4cb1e, ec583cc -> e4af701 "Game Theory Lab 04: Games in time and credible commitment". Report written; committed with this log and the status file ("prompt finished").
