# Game Theory Lab 03 — report

Prompt 3: fixes to module 02 (stage 0), then module 03, "Mixed strategies
and zero-sum games". 25 November 2026, branch `game-theory-lab`, one
session, local commits only, nothing pushed. The working log, with one
line per check run and per source looked up, is
`docs/reports/game-theory-lab-03-log.md`.

## Commits

| Hash | Message |
|---|---|
| 7f31ff4 | Game Theory Lab 02: fixes |
| 8af0dc4 | Game Theory Lab 03: Mixed strategies and zero-sum games |
| (this file) | Game Theory Lab 03: report |

Three WIP checkpoints (c8b323a logic and self-check, 529957e figures,
panels, texts, 4d76354 functional check) were squashed into 8af0dc4: 20
files, 2,850 lines added. The status file in 8af0dc4 says "four WIP
commits"; it was three, corrected in the report commit.

## Before starting

Branch `game-theory-lab`, tree clean, last commit ffca014 "Game Theory Lab
02: report". The status file showed module 02 done and nothing in
progress; report 02 was committed. The two new working rules (the status
file says only what is true now; the working log) are in the status file,
under "Working rules", since the stage 0 commit.

## Stage 0 (7f31ff4)

**0a.** "Safe or sorry", EN and IT: "14 times in 100" → "about one time in
seven", "83 times in 100" → "about four times in five" ("circa una volta su
sette", "circa quattro volte su cinque"). The self-check now pins the words
to the 400-run chances of the check, 0.125 and 0.785, within 0.03 of 1/7
and 4/5 (not to the page's 200-run scan). `check-game-theory-02.mjs`: 124
checks, 0 failures.

**0b. Source pass, entry by entry** (details and URLs in the log):

| Entry | Result | Change |
|---|---|---|
| Rousseau 1755, the stag hunt | Confirmed: Part Two of the *Discours*, first edition Amsterdam (Rey) 1755, written 1754; the passage read on Wikisource | none |
| Cournot 1838 | Confirmed: Paris, L. Hachette | none |
| Bertrand 1883 | Confirmed: *Journal des Savants*, September 1883, 499–508 (Magnan de Bornier 1992; Schumpeter) | "September" added |
| Nash 1951 | Confirmed: Annals 54 (2), 286–295 | none |
| Nash 1950 | Confirmed: PNAS 36 (1), 48–49 | none |
| Harsanyi and Selten 1988 | Book confirmed (MIT Press); that the two terms are theirs: Wikipedia and general usage only | none |
| Lewis 1969 | Confirmed: Harvard UP | none |
| Theocharis 1960 | Confirmed: RES 27 (2), 133–134, title as cited | none |
| Goldberg, Goldman and Newman 1968 | Confirmed from the NIST PDF: 72B (2), 93–101, limit 1 − 1/e | none |
| Schelling, New York | Book not reachable. Two secondary sources: "absolute majority" at Grand Central, "virtually all" at noon; heads 36, tails 6 of 42 | "the information booth of Grand Central Station" → "Grand Central Station" (the booth is in neither source); "a large majority said heads" → "36 of 42 said heads" |

## What differs from the spec (module 03)

- **The naming of the penalty kick sides was wrong in the prompt.** In
  Palacios-Huerta's notation R is the kicker's *natural* side (left for a
  right-footer) and L the other, so 58.30 is both on the kicker's
  non-natural side. The lecture, F2, the panels and exercise 3 say so. See
  "Check figures".
- **Section 3, "the surprise".** The prompt says that when the kicker gets
  better on one side "it is mostly the keeper's mix that moves". The
  numbers do not show it: with R/R at 80 the kicker's L share falls 12.5
  points (38.5 → 26.0) and the keeper's 11.8 (42.0 → 30.2). The penalty kick
  is constant-sum, so a change of the kicker's payoff is also a change of
  the keeper's, and both mixes move. The lecture shows the surprise
  ("my mix depends on your payoffs") with exercise 1 instead: raise the row
  player's payoff at (U, L) from 3 to 5 and the row player's mix stays 3/4
  while the column player's goes from 1/2 to 1/3 (checked). Then it says
  why both move in the penalty kick.
- **F1 presets:** the classic stag hunt of module 01 is the game of module
  02 (a = 4, b = 0, c = 3, d = 2, checked), so it appears once, as "Stag hunt
  (modules 01 and 02)": eight presets. A select instead of pills, to keep the
  figure short. Default: battle of the sexes.
- **F2:** sliders show two decimals (with one, 94.97 read 95.0); a link
  "Back to the lecture's numbers" appears when a rate is changed.
- **Panel A:** the table of exercise 5 is 3 × 2 and needs column payoffs;
  the column player gets 4 minus the row player's (constant-sum). Random
  whole-payoff tables are redrawn when degenerate: a pure strategy with two
  best replies, a singular system, or a tie outside a support. At 4 × 4
  this throws away about 1,700 tables per kept one, about 90 ms per "New
  game" (54 ms measured in the browser). The survey uses the same G for all
  three sizes (the prompt's check used 10,000 at m = 4; both are reported).
- **Panel B:** the rounds slider snaps to two significant digits, otherwise
  a log slider of 1,000 steps cannot return to 1,000 or 10,000. A toggle
  shows the column player's frequencies. The chart samples 160 log-spaced
  rounds.
- **Panel C:** "Let a coin play" uses seed 8200 + press number, so each
  press differs and the page is reproducible. Simulated-player sliders go
  0.5–0.9 as asked (s = 0.3 is in the self-check only).
- **Runs** count round 1 as a run of its own, so matching pennies gives
  1, 2, 3, 4… and rock-paper-scissors 1, 3, 5, 7… (yours: 2, 3, 4… and
  3, 5, 7…, i.e. from the second run on). Shapley's game agrees with yours
  from the first run.
- **Further reading:** Harsanyi (1973) and Falk and Konold (1997) added
  (see "Check figures"). Shoham and Leyton-Brown kept as 2009, as module 02
  cites it; the print year is 2008.

## Checks (final state, one at a time, in this order)

| Check | Result |
|---|---|
| `npx vite build` | built, 1,516 modules |
| `node scripts/lab/check-game-theory-01.mjs` | 102 checks, all passed |
| `node scripts/lab/check-game-theory-02.mjs` | 124 checks, all passed |
| `node scripts/lab/check-game-theory-03.mjs` | 119 checks, all passed |
| `node check-index.mjs game-theory` | 0 failures of 80 |
| `node check-index.mjs network` | 0 failures of 76 |
| `node check-index.mjs complexity` | 0 failures of 72 |
| `node check-links.mjs` | 0 failures of 131 |
| `node check-module.mjs game-theory what-is-a-game` | 0 failures of 56 |
| `node check-module.mjs game-theory nash-equilibrium` | 0 failures of 56 |
| `node check-module.mjs game-theory mixed-strategies-zero-sum` | 0 failures of 56 |
| `node modules/game-theory-what-is-a-game.mjs` | 0 failures of 32 |
| `node modules/game-theory-nash-equilibrium.mjs` | 0 failures of 49 |
| `node modules/game-theory-mixed-strategies-zero-sum.mjs` (new) | 0 failures of 39 |
| `node build-main.mjs`, then `node compare-main.mjs` | 0 failures of 144 |
| `npm run build` | validate passed (3 files, 0 warnings); built; post-build 9 static pages, 3 redirect stubs, feed, sitemap |
| `npm run check:dist` | 0 failures of 108 |

The squash changed nothing but the status file and the log after these
runs. Earlier runs during the work (including two failures, both fixed:
a stack overflow in the grid test, and a check that applied value 0 to
matching pennies, whose value is 1/2; and the Shapley ratio check, which
included the last run cut by the end of the play) are in the log. No
Network Lab page was added to the regression compare.

## Self-check numbers (`check-game-theory-03.mjs`)

- **Formulas against enumeration:** on module 01's first 2,000 two-by-two
  games the closed formulas and the support enumeration give the same
  equilibria (475 with a mixed one); every equilibrium lies on both
  best-response lines; a mixed equilibrium exists exactly when there are 0
  or 2 pure ones.
- **Every equilibrium found is one:** 2,718 equilibria in 1,500 random games
  (m = 2, 3, 4) and 120 whole-payoff tables; largest gain from a deviation
  3.3e-16.
- **Zero-sum:** in 240 random zero-sum games (2 × 2, 2 × 3, 3 × 2, 3 × 3)
  every equilibrium payoff lies between the two best worst cases found on a
  grid, which are at most 1e-3 apart (1e-2 on the 3 × 3 grid).
- **Presets:** all as you listed: PD (0, 0); stag hunt (1, 1), (0, 0),
  (2/3, 2/3) with 8/3; chicken (1, 0), (0, 1), (1/2, 1/2) with 2; battle
  (1, 1), (0, 0), (2/3, 1/3) with 2/3; matching pennies one, pure
  coordination three; exercise 1 (3/4, 1/2) with 1.5.
- **Penalty kick:** 0.38535, 0.41988, 79.573; 58.30 and 69.92; trained
  0.26039, 0.30194, 83.898. Your numbers to the last digit.
- **RPS:** 1/3 each, value 0; a = 2: 1/4, 1/2, 1/4; a = 3: 1/5, 3/5, 1/5
  (also a = 1.5 and 5). Shapley: one equilibrium, 1/3 each. Exercise 5:
  dominated exactly for 1/4 < w < 3/4 on a grid of 1,001 weights, never
  with (2, 2).
- **Survey** (20,000 games at m = 2 and 3, 10,000 at m = 4): every count
  odd, no degenerate game.

| m | one | three | five | seven+ | mean | no pure |
|---|---|---|---|---|---|---|
| 2 | 0.875 | 0.125 | 0 | 0 | 1.251 | 0.125 |
| 3 | 0.707 | 0.276 | 0.013 | 0.004 | 1.627 | 0.212 |
| 4 (10,000) | 0.538 | 0.377 | 0.067 | 0.018 | 2.133 | 0.252 |
| 4 (20,000, the page) | 0.536 | 0.380 | 0.068 | 0.016 | 2.130 | 0.253 |

  The "no pure" column equals module 01's for the same games. Largest
  counts seen: 11 at 10,000 games, 15 at 20,000. Ten other seeds: m = 3 one
  0.703–0.717, mean 1.601–1.637; m = 4 one 0.525–0.550, mean 2.072–2.163.
- **Fictitious play,** largest gap after 100, 1,000, 10,000, 100,000:
  pennies 0.0500, 0.0170, 0.0065, 0.0016; RPS 0.0667, 0.0133, 0.0067,
  0.0016; rock worth 2 0.0400, 0.0160, 0.0056, 0.0018; penalty 0.0601,
  0.0134, 0.0048, 0.0016 with average scoring 79.99, 79.58, 79.51, 79.60;
  Shapley 0.2167, 0.2547, 0.2554, 0.2508. Shapley's runs 1, 1, 2, 4, 6, 9,
  14, 21, 31, 46, 68, 100, 147, 216, …, 28 in 100,000 rounds; ratio of
  successive runs 1.47–1.48 from the tenth on; row frequencies (0.271,
  0.141, 0.588) at 1,000 and (0.272, 0.144, 0.584) at 100,000. **Smallest
  gap from round 100 on: 0.1727, at round 78,765** (above your 0.1).
- **Machine,** 400 players: s = 0.5 0.500, s = 0.6 0.595, s = 0.7 0.698,
  s = 0.3 0.697, h = 0.6 0.597, coin 0.500, spreads 0.010–0.012; 100
  rounds: s = 0.6 0.546, s = 0.7 0.655. Scripted: always heads wins every
  round; always tails from round 4; strict alternation from round 5; a
  period of three every round once each pair has been seen.
- **Quoted on the page:** every number of the lecture, the three observe
  lists and the six exercises in both languages, against the code; word
  counts; no box and no Bitcoin; the two figures and the links to modules
  01 and 02.

## "Expected" values that differ from mine

- **Machine, s = 0.7 over 100 rounds: 0.655 against your 0.644,** outside
  your 0.01. The code is right as far as I can see (2,000-round values all
  match yours). Ten other seeds give 0.642–0.657 and 20,000 players give
  0.650, so the page's seed sits at the high end and yours at the low end;
  following the rule on seeds, the limit is 0.640–0.660, set from the ten
  seeds, and no seed was changed.
- **First runs:** 1, 2, 3, … and 1, 3, 5, … (round 1 counted), see above.
- **Survey:** all within your 0.015 and 0.04. At m = 2 mine is exactly the
  module 01 sample (0.875 / 0.125, yours 0.874 / 0.126); m = 3 five 0.013
  (yours 0.014), seven 0.004 (0.003); m = 4 five 0.067 (0.071), seven+
  0.018 (0.017), mean 2.133 (2.14).
- **Shapley's gap at 100 rounds** is 0.217 (you gave no number there).
- Everything else equals yours to the digits you gave.

## Exercise answers that differ from yours

- 1, 2, 4, 5: the same results. Exercise 4's explanation is written from
  the indifference conditions (against (r, p, s), rock pays 2s − p and
  scissors p − 2r, so p = 2s = 2r).
- 3: the same numbers, with the sides named as in the paper (L = the
  kicker's non-natural side); the solution shows the two equations (y =
  25.05 / 59.66, x = 22.99 / 59.66).
- 6 (from my numbers, with G = 20,000 on the page): m = 2 0.875 and 0.125;
  m = 3 0.707, 0.276 and 0.017; m = 4 0.536, 0.380 and 0.084; never even.
  Pennies 0.050, 0.017, 0.0065, 0.0016; Shapley 0.217, 0.255, 0.255, 0.251.
  Machine 0.595, 0.597, 0.500. (Yours at m = 4: 0.536, 0.377, 0.087, with
  10,000 games.)

## The numbers behind each "What to observe"

**Panel A.** Opens on random table no. 1, 3 × 3 (rows 5 0 9 / 1 1 3 / 3 7 8
and 6 5 9 / 1 7 8 / 6 9 6): pure (1, C) and (3, B), mixed 1 with 3/7 and 3
with 4/7 against B 1/8 and C 7/8, payoffs 63/8 and 51/7. RPS 1/3 each;
rock worth 2 1/4, 1/2, 1/4; penalty 0.385, 0.420, 79.57; Shapley a third
each; exercise 5 U and D 1/2, value 2. Survey at 20,000: the table above
(page row). With the default 2,000: m = 2 0.885 / 0.115, m = 4 0.532,
0.376, 0.072, 0.020 — so the list asks for 20,000.

**Panel B.** Matching pennies, 10,000 rounds: runs 1, 2, 3…, 141 runs, gap
0.0065, average 0.503; at 100,000 0.0016. RPS runs 1, 3, 5, 7; rock worth
2 frequencies 0.256, 0.496, 0.248. Penalty average 79.99 after 100 and
79.51 after 10,000 (value 79.57). Shapley at 10,000: 22 runs, gap 0.255,
smallest from round 100 0.173 (round 7,929), row frequencies 0.274, 0.138,
0.589; 28 runs at 100,000.

**Panel C.** The first three coin presses: the machine wins 55, 60 and 51
of 100 (64, 53, 47 heads). Simulated: s = 0.6 0.595 (spread 0.012), s = 0.7
0.698, s = 0.5 0.500, h = 0.6 0.597, coin 0.500. In the browser: 20 heads
→ 20 machine wins; strict alternation → 18 of 20.

## "Check" figures: confirmed and softened

- **Palacios-Huerta (2003).** Confirmed: 1,417 penalties, 1995–2000 (in
  three countries: Spain, Italy, England from a secondary source), equal
  scoring rates across sides and no serial dependence (the abstract). The
  paper itself was not reachable. **Naming: corrected** (R = natural side).
  **The four rates:** 58.30, 92.91 and 94.97 agree with a secondary
  reproduction of his table (Tuyls et al. 2020: 0.583, 0.929, 0.950);
  69.92 does not (0.670 there). 69.92 gives the 38.5% that a course page
  quotes as the predicted 39%, while 0.670 would give 41%, so I believe
  69.92 is right, but I could not see it in the paper. **Softened:** the
  lecture calls them "scoring rates of the size he measured" and does not
  call the table his. The observed mixes (about 40% and 42%) are not
  quoted.
- **Walker and Wooders (2001).** Confirmed from the authors' PDF: win rates
  consistent with minimax, players switch too often.
- **"People alternate too much."** Wagenaar (1972) confirmed as a citation
  (Psych. Bulletin 77 (1), 65–72) and cited for this by Walker and Wooders;
  not read. Falk and Konold (1997), whose abstract says it directly, is
  added to the citation and to the reading list.
- **von Neumann 1928** (Math. Ann. 100, 295–320): confirmed through
  Crossref. **Nash 1950** confirmed; the Kakutani remark is in the note.
- **Brown 1951** (374–376, Wiley): confirmed from the Cowles page.
  **Robinson 1951** confirmed from the scan, but what she proves is that the
  values converge; so the lecture says "what the frequencies guarantee
  approaches the value", not that the frequencies converge.
- **Shapley 1964** (pp. 1–28): confirmed; his example is a non-zero-sum
  3 × 3 game where play cycles for ever. The game of the prompt has that
  shape; I did not compare it entry by entry with his.
- **Wilson 1971:** citation confirmed; the oddness theorem is credited to
  it by secondary sources only. Harsanyi 1973 (the other proof) added. The
  lecture says "almost always odd" and gives no proof.

**Further reading, entry by entry:** Osborne ch. 4 and 11, Tadelis ch. 6,
Shoham and Leyton-Brown ch. 3 and 4 (print year 2008, kept 2009),
Roughgarden lecture 18 ("Swap Regret and the Minimax Theorem"), von
Neumann, Nash, Brown, Robinson, Shapley, Wilson, Palacios-Huerta,
Chiappori–Levitt–Groseclose, Walker–Wooders, Wagenaar: all confirmed as
cited. Added: Harsanyi 1973, Falk and Konold 1997. None dropped.

## Timings and sizes

- In the browser (functional check, 1280 px): "Survey" (m = 2, 3, 4 at
  once) 0.9 s with 2,000 games, **3.2–3.4 s with 10,000**, 6.1–6.4 s with
  20,000, through `useExperiment`, on a button. **Fictitious play with
  100,000 rounds:** 114–117 ms from the slider to the readout. **Simulated
  players** (400 × 2,000 rounds): 0.1–0.2 s. "New game" at 4 × 4: 54 ms.
  Nothing heavy runs when the page loads (the default play of Panel B is
  10,000 rounds, a few ms).
- Figure heights: F1 310 px at 1280 px in English, 325 in Italian; F2 309
  and 347. At 375 px: F1 599 (614 IT), F2 572 (610 IT). F2 in Italian is 7
  px over 340.
- Chunks: module 03 72.34 kB (26.17 gzip); module 01 73.03 (26.26),
  module 02 83.36 (29.56); the shared `randomgames-…` chunk (games.js,
  randomgames.js, PayoffTable.jsx) 9.86 (4.01), now loaded by all three.
  No recharts, no canvas. The locked page requests no lecture or content
  chunk (module check).
- Lecture: 1,634 words in English, 1,685 in Italian.

## Italian terms

mixed strategy = strategia mista; pure strategy = strategia pura; expected
payoff = payoff atteso; indifference = indifferenza; zero-sum game = gioco a
somma zero; constant-sum game = gioco a somma costante; value of the game =
valore del gioco; best worst case (maxmin) = miglior caso peggiore
(maxmin); minimax theorem = teorema del minimax; support = supporto;
fictitious play = gioco fittizio (*fictitious play*); run = sequenza
(module 02's "prova" is a simulation run, a different thing); penalty kick
= calcio di rigore; kicker = rigorista; keeper = portiere; heads and tails
= testa e croce. Also: mix = miscela; natural side = lato naturale; L, R =
S, D; rock-paper-scissors = sasso-carta-forbici; win rate = quota di
vittorie; spread = dispersione; fixed-point theorem = teorema di punto
fisso. All in the status file.

## For you to decide

1. The naming of the sides and the presentation of the four rates as
   "of the size he measured", given that 69.92 is not confirmed in the
   paper itself (one secondary table has 0.670).
2. The section-3 "surprise" told with exercise 1 instead of the penalty
   kick, where both mixes move by about 12 points.
3. Whether runs should be counted from round 2 (your 2, 3, 4…).
4. The machine at s = 0.7 over 100 rounds: limit set from ten seeds.
5. Shoham and Leyton-Brown: 2008 or 2009 (modules 02 and 03 say 2009).
6. Both lectures of the lab carry the DRAFT marker for Adriano.
