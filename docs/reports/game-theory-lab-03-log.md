# Game Theory Lab 03 — working log

Prompt 3 (fixes to module 02, then module 03 "Mixed strategies and
zero-sum games"). One line per check run to its end (command, result) and
one line per source looked up (what, where, what it says). A session that
picks up this prompt reads this file first.

## Session 1 (25 November 2026)

- Start: branch `game-theory-lab`, tree clean, last commit ffca014 "Game
  Theory Lab 02: report". Status file: module 02 done, nothing in
  progress; `docs/reports/game-theory-lab-02.md` committed. Preconditions
  met.

### Checks

- Stage 0a. `node scripts/lab/check-game-theory-02.mjs` (after the new
  wording and its check): 124 PASS, 0 FAIL, "All checks passed". The new
  check: 400-run chances 0.125 (from 0.70) and 0.785 (from 0.75), within
  0.03 of 1/7 and 4/5.

- Module 03. `node scripts/lab/check-game-theory-03.mjs` (first run): stopped
  at the zero-sum grid test, "Maximum call stack size exceeded" (spread of a
  29,000-element array); fixed with reduce.
- `node scripts/lab/check-game-theory-03.mjs`: 70 PASS, 1 FAIL ("average
  payoff is the value 0" also applied to matching pennies, whose value is
  1/2). Expected values: all within the prompt's limits except the machine
  at s = 0.7 over 100 rounds, 0.655 against 0.644 (ten other seeds
  0.642–0.657, 20,000 players 0.6496): limit set from the seeds.
- 
ode scripts/lab/check-game-theory-03.mjs (logic only, texts not yet
  written): 71 PASS, 0 FAIL, "All checks passed".
- `node scripts/lab/check-game-theory-03.mjs` with the texts: 118 PASS, 1 FAIL
  (Shapley's run ratios included the last run, cut by the end of the play);
  last run left out.
- `node scripts/lab/check-game-theory-03.mjs`: 119 PASS, 0 FAIL, "All checks
  passed". Lecture 1,634 words EN, 1,685 IT.
- `npx vite build`: built in 12.3 s (chunk-size warning for the old large
  chunks only).
- `node check-module.mjs game-theory mixed-strategies-zero-sum` (first
  build): 0 failures of 56. Figure heights 310/309 px at 1280 EN, 325/347
  IT; 599/572 at 375 EN, 614/610 IT.
- `node shots.mjs game-theory mixed-strategies-zero-sum`: looked at the
  figures and panels. Changed: F2 sliders in one column with two decimals
  (94.97 showed as 95.0), F1 ticks "0.5" instead of "½", Panel A mixes
  written "plays C" / "1 with 3/7", Panel B rounds snapped to two
  significant digits (the log slider could not reach 1,000 or 10,000).
- `npx vite build` (twice, after those changes): built.
- `node modules/game-theory-mixed-strategies-zero-sum.mjs` (new): 0
  failures of 39. Timings: "New game" 4 × 4 54 ms; Survey (m = 2, 3, 4)
  2,000 games 0.9 s, 10,000 3.4 s, 20,000 6.4 s; fictitious play 100,000
  rounds 117 ms; 400 simulated players 0.2 s.
Final CHECKS list, on the state of "WIP Game Theory Lab 03: functional
check", one command at a time in the foreground, each to its last line:

- `npx vite build`: 1,516 modules, built in 12.3 s.
- `node scripts/lab/check-game-theory-01.mjs`: 102 PASS, 0 FAIL.
- `node scripts/lab/check-game-theory-02.mjs`: 124 PASS, 0 FAIL.
- `node scripts/lab/check-game-theory-03.mjs`: 119 PASS, 0 FAIL (Node:
  survey m = 4, 10,000 games 2.9 s; fictitious play 100,000 rounds 71 ms;
  400 players 94 ms; 40 tables of size 4 3.4 s).
- `node check-index.mjs game-theory`: 0 failures of 80.
- `node check-index.mjs network`: 0 failures of 76.
- `node check-index.mjs complexity`: 0 failures of 72.
- `node check-links.mjs`: 0 failures of 131.
- `node check-module.mjs game-theory what-is-a-game`: 0 failures of 56.
- `node check-module.mjs game-theory nash-equilibrium`: 0 failures of 56.
- `node check-module.mjs game-theory mixed-strategies-zero-sum`: 0
  failures of 56.
- `node modules/game-theory-what-is-a-game.mjs`: 0 failures of 32.
- `node modules/game-theory-nash-equilibrium.mjs`: 0 failures of 49.
- `node modules/game-theory-mixed-strategies-zero-sum.mjs`: 0 failures of
  39 (Survey 0.9 / 3.2 / 6.1 s for 2,000 / 10,000 / 20,000 games;
  fictitious play 100,000 rounds 114 ms; 400 players 0.1 s).
- `node build-main.mjs`: built main into `.main-dist`.
- `node compare-main.mjs`: 0 failures of 144.
- `npm run build`: content check passed (3 files, 0 warnings); built in
  14.5 s; post-build 9 static pages, 3 redirect stubs, feed (3 entries),
  sitemap.
- `npm run check:dist`: 0 failures of 108.
- Chunks: module 03 72.34 kB (26.17 gzip); module 01 73.03 (26.26);
  module 02 83.36 (29.56); shared `randomgames-…` 9.86 (4.01).
### Sources

Stage 0b, the sources of module 02 (one pass, web, 25 November 2026):

- Rousseau, *Discours sur l'origine et les fondements de l'inégalité* —
  fr.wikisource.org, Seconde partie; rousseauonline.ch — the stag passage is
  in Part Two («S'agissait-il de prendre un cerf, chacun sentait bien qu'il
  devait pour cela garder fidèlement son poste ; mais si un lièvre…»); first
  edition Amsterdam, Rey, 1755 (written 1754). Confirmed; text unchanged.
- Cournot 1838 — Magnan de Bornier, HOPE 24:3 (1992), references: "Paris:
  L. Hachette". Confirmed.
- Bertrand 1883 — same HOPE article and Schumpeter (1954): *Journal des
  Savants*, September 1883, 499–508. Confirmed; "September" added to the
  citation.
- Nash 1951 — JSTOR record 1969529 (through search results; direct fetch
  refused), MIT Libraries: Annals of Mathematics 54 (2), September 1951,
  286–295. Confirmed.
- Nash 1950 — PubMed Central PMC1063129: PNAS 36 (1), January 1950, 48–49.
  Confirmed.
- Harsanyi and Selten 1988 — EconPapers record: MIT Press, 1988. That the
  terms "payoff dominance" and "risk dominance" are theirs: Wikipedia ("Risk
  dominance", "Equilibrium selection") and general usage only. Kept.
- Lewis 1969 — Texas A&M catalogue: Harvard University Press, 1969. Confirmed.
- Theocharis 1960 — RePEc/IDEAS v27y1960i2p133-134: vol. 27 (2), 133–134,
  title as cited. Confirmed.
- Goldberg, Goldman and Newman 1968 — NIST PDF jresv72Bn2p93_A1b: J. Res.
  NBS 72B (2), 93–101; the probability of a pure equilibrium in a random
  m × n game, limit 1 − 1/e. Confirmed.
- Schelling's New York answers — book text not reachable (archive.org
  lending only). Secondary: Zambrano, MPRA paper 23474 (table: "absolute
  majority meet at Grand Central", "virtually all at 12 noon"; quotes "36
  persons concerted on heads … and only 6 chose tails", Schelling 1960
  p. 57); Bardsley et al., "focal_points_3" (heads 36, tails 6). "More than
  half" and "nearly all" kept; "the information booth" is not in either
  source, so the sentence now says "Grand Central Station"; "a large
  majority said heads" becomes "36 of 42 said heads" (from two secondary
  sources quoting the book).

Module 03 (web, 25 November 2026):

- Palacios-Huerta 2003 — LSE record researchonline.lse.ac.uk/id/eprint/26561
  (abstract: "winning probabilities are statistically identical across
  players' strategies, and players' choices are serially independent");
  Palacios-Huerta and Volij, Econometrica 2008 ("the 1,417 penalties studied
  in Palacios-Huerta (2003)"); Tuyls et al. 2020, arXiv 2011.09192 (1,417
  kicks of 1995–2000; its Table 2a: N/N 0.670, N/NN 0.929, NN/N 0.950,
  NN/NN 0.583); slides after Palacios-Huerta's 2014 book ("shooting Right
  means shooting in the player's 'natural' direction"); mikeshor.com course
  page (kicker left 39% predicted, goalie left 42%). The paper itself was
  not reachable. Result: the naming of the prompt is WRONG — R is the
  natural side, L the other; 58.30 is both on the kicker's non-natural side.
  Three of the four rates (58.30, 92.91, 94.97) agree with Tuyls's table;
  69.92 does not (0.670 there), but it gives the 38.5% that the course page
  rounds to 39% (0.670 would give 41%). So the lecture names the sides
  from the natural side and presents the four rates as realistic numbers
  of the size measured, not as the paper's table.
- Walker and Wooders 2001 — author PDF (math.stonybrook.edu): win rates
  "consistent with the minimax hypothesis" (rejected in 1 of 40 point games
  at 5%); "even the best tennis players tend to switch from one action to
  another too often". AER 91 (5), 1521–1538. Confirmed.
- Wagenaar 1972 — Crossref DOI 10.1037/h0032060, Psychological Bulletin
  77 (1), 65–72; the text was not reached. Cited by Walker and Wooders for
  "switch too often". Falk and Konold 1997, Psychological Review 104 (2),
  301–318 (abstract: "People attempting to generate random sequences
  usually produce more alternations than expected by chance"): added as the
  direct source.
- von Neumann 1928 — Crossref DOI 10.1007/BF01448847: Math. Ann. 100,
  295–320. Confirmed (contents: standard, text not opened).
- Nash 1950 — PMC1063129: 36 (1), 48–49; Gale suggested Kakutani's
  theorem. Confirmed.
- Brown 1951 — Cowles Foundation page of Monograph 13: Wiley, 1951,
  chapter at 374, next one at 377. Confirmed (374–376).
- Robinson 1951 — JSTOR scan: Annals 54 (2), 296–301; Brown's procedure
  in finite two-person zero-sum games, the values converge to v. Confirmed;
  the lecture says the frequencies approach the equilibrium "in the sense
  that what they guarantee approaches the value".
- Shapley 1964 — chapter scan, pp. 1–28; §5 "Fictitious play in
  non-zero-sum games", a 3 × 3 bimatrix game where play goes round "in a
  never-ending cycle". Confirmed.
- Wilson 1971 — Crossref DOI 10.1137/0121011, SIAM J. Appl. Math. 21 (1),
  80–87; the oddness theorem credited to it by secondary sources only.
  Harsanyi 1973, "Oddness of the number of equilibrium points: a new
  proof", IJGT 2, 235–250 (Crossref). Both kept, the lecture says "almost
  every game" without a proof.
- Chiappori, Levitt and Groseclose 2002 — Crossref DOI
  10.1257/00028280260344678: AER 92 (4), 1138–1151. Confirmed.
- Osborne 2004 — author's table of contents: ch. 4 "Mixed Strategy
  Equilibrium", ch. 11 "Strictly Competitive Games and Maxminimization".
  Confirmed. Tadelis 2013 — Princeton UP page: ch. 6 "Mixed Strategies".
  Confirmed. Shoham and Leyton-Brown — Cambridge pages: ch. 3 and 4 as
  cited; the print year is 2008 (often cited 2009, as module 02 does): kept
  as 2009 for consistency, noted in the report. Roughgarden 2016 —
  publisher and bookseller listings: Lecture 18 "Swap Regret and the
  Minimax Theorem". Confirmed.