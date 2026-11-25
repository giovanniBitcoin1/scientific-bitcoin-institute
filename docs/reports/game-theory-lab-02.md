# Game Theory Lab 02 — report

Prompt 2: two fixes to module 01 and the shared lab pages (stage 0), then
module 02, "Nash equilibrium". 25 November 2026, branch `game-theory-lab`,
local commits only, nothing pushed.

## Read this first: the prompt was done in two sessions

The first session built everything and stopped during the list of checks.
It left the status file saying "Prompt 2 is finished … with the report in
`docs/reports/game-theory-lab-02.md`", which was not true. The second
session (this report) found:

- **Commits:** the two stage 0 commits existed. Module 02 was in two WIP
  commits, **not squashed** (589095d "logic and self-check", a3e9dab
  "figures, panels, lectures, texts"). No module commit, no report.
- **Uncommitted:** the status file (already claiming "done"), the README of
  the browser checks, and the new functional check
  `modules/game-theory-nash-equilibrium.mjs` (untracked).
- **Checks:** no output of any check was kept. From file times the first
  session had built with `npx vite build` (03:25), run the index check of
  the Game Theory Lab and was in, or just past, the index check of the
  Network Lab (last screenshot 03:29). Nothing shows that the Complexity
  index, `check-links`, the module checks on the final build, the
  functional checks, the regression compare, `npm run build` or
  `check:dist` were run on the final state. I treated every check as not
  run.

What the second session did: put the true state in the status file and
committed it as a third WIP commit (76a67d6); ran the whole CHECKS list from
the first line, one command at a time in the foreground, each to its last
line; corrected the status file (done, chunk sizes); squashed the three WIP
commits; wrote this report.

**What this means for the report.** The numbers below come from the runs of
the second session. One thing rests on the first session's notes in the
status file, because its working notes were not kept: the sources ("Check"
figures and references, below). It is marked where it appears.
No code, text or check was changed in the second session, apart from the
status file.

## Commits

| Hash | Message |
|---|---|
| 4b49860 | Game Theory Lab 01: fixes |
| 9d1a32d | Labs: open lab pages at the top |
| c35c609 | Game Theory Lab 02: Nash equilibrium |
| (this file) | Game Theory Lab 02: report |

Three WIP checkpoints (589095d, a3e9dab, 76a67d6) were squashed into
c35c609: 20 files, 3,042 lines added.

## Before starting

From the reflog: the first session started on `game-theory-lab`, straight
after "Game Theory Lab 01: report" (dae6d59); no branch switch was needed.
Module 01 was "done" in the status file and report 01 was committed.

## Stage 0

**0a, "Play again" (4b49860).** In `guessing.js` the standard deviation of
the noise is now σ × (reference point) / 50, so it is σ in the first round
and shrinks with the guesses afterwards. The panel line and the observe item
that explained the floor were rewritten; the self-check and the functional
check follow. "10 more rounds" is kept. From `check-game-theory-01.mjs`,
run in the second session (102 checks, 0 failures):

- σ = 2, page seed: the mean falls below 1 in round 8 (default), 22
  (p = 0.9), 6 (p = 1/2), 4 (deep thinkers). Means of rounds 1 to 10:
  29.37, 17.51, 10.45, 6.26, 3.73, 2.23, 1.33, 0.79, 0.47, 0.28 (yours:
  about 29.5, 17.6, 10.5, 6.3, 3.7, 2.2, 1.3, 0.8).
- 40 other seeds: round 8, 6 and 4 in all 40; with p = 0.9 round 22 in 39
  and round 21 in 1 (you had 2 of 40).
- The first round does not move: the checks of the 1,000 plays pass with
  the numbers they had before (level 2 wins more than 850 times with the
  default shares; ten other seeds 894–924).

**0b, scroll position (9d1a32d).** `LabIndex.jsx` scrolls to the top in an
effect that depends on `labId` only, `LabChapter.jsx` in one that depends on
`labId` and `slug`. The language toggle and everything else inside the page
leave the position alone. No page outside the labs was changed; the hub
`/labs` was not changed either.

`check-links.mjs`: the scroll-to-top added in prompt 1 was **taken out**,
and the check passes without it. In its place the check now asserts that a
lab index opened from the hub starts at the top, and a new block, "Lab pages
open at the top", checks for every lab: a module opened from the bottom of
the index starts at 0; the language toggle leaves a module page and an index
at 300 px; the index opened from the bottom of a module starts at 0; "Next
module" from the bottom of a module opens the next one at 0.

Regression compare: no page was added to its list. The five Complexity Lab
pages on it are all rendered by `LabChapter.jsx`, which is one of the two
files changed; `LabIndex.jsx` is not on the list on purpose (the index
differs from main since the "All labs" link), and the new behaviour of both
is checked in `check-links.mjs` for all three labs. If you want Network Lab
pages on the compare list as well, say so.

The first session's check results after stage 0 were not kept. The results
on the final state are in "Checks" below; they cover everything 0b asked
for.

## What differs from the spec (module 02)

- **Survey of Panel A.** It draws the same games as module 01's
  `randomgames.js` (same seeds), so the two pages agree to the last digit.
  The walks are counted from the starting column only, since the row player
  moves first and the starting row does not matter (checked against the
  walk itself on 1,500 games).
- **The walk.** A player already at a best response stays; otherwise the
  player goes to the first best response. With the "no ties that matter"
  tables there is only one.
- **Panel A opens** on random table no. 1 of size 3 × 3, which has no
  equilibrium (a cycle of four cells). "New game" after a classic goes back
  to the random table.
- **Panel B.** The k others are sampled without repeats (k is cut to N − 1
  when N is small). The run of the page's seed is shown at once; "Run"
  draws the next one; any change of setting goes back to run 1. The scan
  uses its own seed for each starting share.
- **Panel C has a slider for the prize** (50 to 200), which you did not ask
  for: exercise 5 asks what happens when the prize halves, and this lets the
  reader see it.
- **Panel C, players out.** When every other player is out, the best
  response is 0, as your formula says, although any tiny effort would win.
  So with "All at once" and many players everyone leaves and never comes
  back; the observe list says so in plain words. Players with the same cost
  share one line of the table.
- **Figure F2** starts from the point (1, 8) and draws one move every
  0.38 s.
- **Exercise 4** ends with a remark you did not ask for: with whole cents,
  both charging one or two cents above the cost is an equilibrium too (the
  self-check finds exactly these on a grid).
- **Tullock's chapter is cited without pages** (see "Check" figures).
- `PayoffTable.jsx` (shared by the lab) gained `onCell`, `selected` and
  `trail`. Module 01 does not use them; its checks pass unchanged.
- **Figure heights** are above 340 px in three cases of four; see "Timings
  and sizes".

## Checks (second session, final state, one at a time, in this order)

| Check | Result |
|---|---|
| `npx vite build` | built, 1,503 modules |
| `node scripts/lab/check-game-theory-01.mjs` | 102 checks, all passed |
| `node scripts/lab/check-game-theory-02.mjs` | 123 checks, all passed |
| `node check-index.mjs game-theory` | 0 failures of 80 |
| `node check-index.mjs network` | 0 failures of 76 |
| `node check-index.mjs complexity` | 0 failures of 72 |
| `node check-links.mjs` | 0 failures of 131 |
| `node check-module.mjs game-theory what-is-a-game` | 0 failures of 56 |
| `node check-module.mjs game-theory nash-equilibrium` | 0 failures of 56 |
| `node modules/game-theory-what-is-a-game.mjs` | 0 failures of 32 |
| `node modules/game-theory-nash-equilibrium.mjs` | 0 failures of 49 |
| `node check-module.mjs complexity scale-free` | 0 failures of 38 |
| `node check-module.mjs network reading-a-network` | 0 failures of 62 |
| `node build-main.mjs`, then `node compare-main.mjs` | 0 failures of 144 |
| `npm run build` | validate passed (3 files, 0 warnings); built; post-build: 9 static pages, 3 redirect stubs, feed, sitemap |
| `npm run check:dist` | 0 failures of 108 |

The only change after these runs is the text of the status file. The module
commit c35c609 holds exactly the code that was checked.

`expect.json` has the line for module 02 (2 figures, 3 panels, 6
exercises); the README of the browser checks lists the two new commands.

## Self-check numbers (`check-game-theory-02.mjs`)

**Equilibria and walks.** On 2,000 random games of mixed sizes the
equilibria equal a brute-force search, every equilibrium survives iterated
elimination, and the 543 games solved by elimination have exactly one
equilibrium, the cell that is left. Every walk from every cell ends as an
independent version says. The six classics of module 01 have 1, 2, 2, 2, 0
and 2 equilibria.

**Random games, 20,000 per size, m = 2 to 8.**

| | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|
| mean | 1.000 | 1.005 | 1.009 | 0.999 | 1.003 | 0.996 | 0.995 |
| none | 0.125 | 0.212 | 0.253 | 0.283 | 0.294 | 0.314 | 0.322 |
| one | 0.750 | 0.579 | 0.511 | 0.472 | 0.454 | 0.430 | 0.419 |
| two | 0.125 | 0.200 | 0.210 | 0.212 | 0.210 | 0.207 | 0.206 |
| three or more | 0.000 | 0.009 | 0.026 | 0.034 | 0.042 | 0.048 | 0.053 |
| walks ending at one | 0.875 | 0.773 | 0.700 | 0.637 | 0.600 | 0.553 | 0.523 |
| … in games that have one | 1.000 | 0.981 | 0.936 | 0.889 | 0.850 | 0.807 | 0.771 |

At m = 2 the walks end at an equilibrium exactly in the games that have one
(0.8749 and 0.8749). None, one and two-or-more are the numbers of
`check-game-theory-01`, exactly (same games). Ten other seeds: at m = 2
none 0.122–0.132, walks 0.868–0.878; at m = 8 none 0.314–0.321, one
0.422–0.427, walks 0.526–0.534, among games with one 0.773–0.779.

**Stag hunt.** q* = 2/3, 1/2, 2/5, 2/7 for a = 4, 5, 6, 8; stag risk
dominant exactly when a > 5, neither at a = 5.

**Tipping point of the sampled rule** (k = 5, 10, 20, 50): default payoffs
0.8689, 0.7317, 0.7344, 0.7036; a = 6: 0.3471, 0.3611, 0.3721, 0.3823;
a = 5: 0.5 for every k. Larger samples, default payoffs: 0.687 at k = 100,
0.683 at k = 200 (q* = 0.667).

**Population, N = 200, k = 10, 400 runs per point** (mine / yours):

- default: 0.65 → 0.005 / 0.005; 0.70 → 0.125 / 0.155; 0.75 → 0.785 /
  0.775; 0.80 → 1.000 / 1.0.
- a = 6: 0.30 → 0 / 0; 0.35 → 0.273 / 0.225; 0.40 → 0.955 / 0.953; 0.45 →
  1.000 / 1.0.
- a = 5: 0.4 → 0 / 0; 0.5 → 0.472 / 0.52; 0.6 → 1.000 / 1.0.
- k = 50, default: 0.70 → 0.573 / 0.54; 0.75 → 1.000 / 1.0.
- Sweeps to settle, x0 from 0.5 to 0.9: 5.9, 6.1, 6.4, 7.0, 6.4, 5.1, 4.1.
- Ten other seeds: default 0.70 → 0.122–0.168, 0.75 → 0.795–0.830; a = 6,
  0.35 → 0.260–0.360; a = 5, 0.5 → 0.465–0.540; k = 50, 0.70 →
  0.512–0.585.

**Cournot.** a = 10, c = 1: 3 and 3, price 4, profit 9. Prices for n = 1,
2, 3, 5, 10, 100: 5.500, 4.000, 3.250, 2.500, 1.818, 1.089. Costs 1 and
2.5: 3.5 and 2, price 4.5. Taking turns from (0, 0): 4.5, 2.25, 3.375,
2.8125, 3.09375, 2.953125, …; 14 moves on the page. Every pair of slider
costs gives two firms that both produce.

**Contest, equal costs, V = 100.** Totals 50, 66.67, 75, 80, 90, 95 and
profits 25, 11.11, 6.25, 4, 1, 0.25 for n = 2, 3, 4, 5, 10, 20. "One at a
time" from the panel's start (10% above) is within 1e-6 of the equilibrium
total after 2, 6, 9, 11, 30 and 102 rounds. "All at once", gap from the
equilibrium total: n = 2 and 3 shrink (n = 3: −0.054, 0.026, −0.003,
0.0001 after 1, 2, 5, 10 rounds); n = 4: 0.105, 0.099, 0.103, 0.095, your
numbers exactly; n = 5: −0.156, 0.217, −0.353, 0.434, −0.748, 0.502;
n = 10 and 20: everyone out from the third round. Measured multiplier near
the equilibrium: −0.000, −0.500, −1.000, −1.501, −4.001, −9.002 against
(2 − n)/2.

**Contest, unequal costs.** "Miners": four stay in; total 62.5; shares
0.375, 0.3125, 0.25, 0.0625, 0; efforts 23.44, 19.53, 15.63, 3.91, 0;
profits 14.06, 9.77, 6.25, 0.39, 0; 69.53 spent; Σ s² = 0.3047; the fifth
enters below 1.6 (1.59 in, 1.6 and 1.61 out); V = 50: total 31.25, same
shares. "One 10% cheaper", n = 10: total 90.91, shares 0.1818 and 0.0909,
spent 0.8926. One 20% cheaper among five: 1/3 and 1/6, total 83.33. In all
39 lists of costs the presets can show, the closed form is a fixed point of
the best responses (also for those who stay out), the shares sum to 1, and
Arnosti and Weinberg's bound holds. "Miners": "One at a time" settles in 8
rounds, "All at once" in 165.

**Quoted on the page.** 48 checks: every number of the lecture, the box, the
three observe lists and the exercises, in both languages, against the code,
plus the word counts, the place of the box and of the figures.

Timings in Node: survey of all sizes with 20,000 games 0.8 s; scan with
N = 1,000 5.9 s.

## "Expected" values that differ from mine

No limit of the prompt had to be changed, and no seed was chosen: the seeds
are those of module 01 and the page.

- **Random games.** All 49 values are within your 0.015. The largest gaps:
  none at m = 8, 0.322 against your 0.312 (ten other seeds: 0.314–0.321, so
  the page's sample is at the high end, as report 01 already said of the
  same games); one at m = 4, 0.511 against 0.502, and at m = 8, 0.419
  against 0.428; walks at m = 4, 0.700 against 0.692, and at m = 3, 0.773
  against 0.766.
- **Population.** Within your limits. Largest gaps: a = 6 at 0.35, 0.273
  against 0.225; a = 5 at 0.5, 0.472 against 0.52; default at 0.70, 0.125
  against 0.155.
- **"One at a time", rounds to 1e-6.** From a random start: 3, 8, 14, 19,
  54, 177 against your 4, 10, 14, 19, 47, 163 (the start differs; nothing
  is checked against these). From the panel's start: 2, 6, 9, 11, 30, 102.
- Everything else (q*, tipping points, Cournot, contests, the n = 4 gaps)
  is equal to yours to the digits you gave.

## Exercise answers that differ from yours

- Exercises 1, 2, 3 and 5: the same as yours, recomputed by the self-check.
- Exercise 4: the same argument, plus the remark on whole cents.
- Exercise 6 (from my numbers): none 0.125 and 0.322 (yours 0.124 and
  0.312); walks 0.875 and 0.523 (yours 0.876 and 0.529); mean within 0.01
  of 1 at every size (the largest gap is 0.009, at m = 4); tipping points
  0.732 and 0.361 (yours 0.73 and 0.36); "All at once" settles for n = 2
  and 3, keeps swinging at n = 4, blows up from n = 5: as yours.

## The numbers behind each "What to observe"

**Panel A.** Table no. 1 (3 × 3; rows 4 2 7 / 7 9 3 / 8 1 9 and 2 0 6 /
4 5 9 / 6 9 3) has no equilibrium and elimination deletes nothing; from
(1, A) the walk is (1, A) (3, A) (3, B) (2, B) (2, C) (3, C) (3, B): six
moves, the last four a cycle, and every walk of the table ends in it. Table
no. 2 has one equilibrium, (1, A), which elimination leaves alone; every
walk gets there in at most 3 moves. Survey with 20,000 games: the table
above (0.125 → 0.322 with none, 0.053 with three or more at m = 8, walks
0.875 → 0.523, 0.771 among the games that have one). In the first 200
tables of size 4 every equilibrium is inside what elimination leaves. With
the default 2,000 games the survey gives means of 0.993 to 1.034, which is
why the observe list asks for 20,000.

**Panel B.** The run on the page: 0.700, 0.680, 0.590, 0.240, 0.070, 0.030,
0.020, 0.010, 0.005, 0: everyone on the hare after 9 sweeps, from a start
above q*. Scan (200 runs per point): default 0 up to 0.60, 0.005 at 0.65,
0.140 at 0.70, 0.830 at 0.75, 1 from 0.80; a = 6: 0 up to 0.30, 0.295 at
0.35, 0.980 at 0.40, 1 from 0.45; with a = 6 the run from 0.70 ends on the
stag. Tipping points 0.732 (k = 10), 0.704 (k = 50), 0.869 (k = 5), 0.361
(a = 6). N = 1,000: 0.005 at 0.70 and 0.920 at 0.75. The lecture's "14
times in 100" and "83 times in 100" are the 0.140 and 0.830 of the page's
scan, with 200 runs; the 400-run check gives 0.125 and 0.785, and ten other
seeds 0.122–0.168 and 0.795–0.830.

**Panel C.** Equal costs: totals 50.00, 80.00, 90.00 and profits 25.00,
4.00, 1.00 for n = 2, 5, 10. n = 10, "One at a time": 99.0 then 88.9, and
within a millionth of 90 after 30 rounds. "All at once": n = 4 swings 82.5,
67.1, 82.4, 67.2… for all 30 rounds; n = 5 goes below 10 and above 115
(totals 88.0, 67.5, 97.4, 51.8, 114.7, 20.2, 120.2, 9.6, …); n = 10: 99.0,
52.9, 213.8, 0.0 and stays at 0. "Miners": shares 37.5%, 31.3%, 25.0%,
6.3%, total 62.50, 69.53 spent, cost 2.0 out; "One at a time" within 0.01
by round 5 (62.5016), "All at once" between 61.67 and 63.27 after 30
rounds. "One 10% cheaper", n = 10: 18.2% and 9.1%, total 90.91.

## "Check" figures: confirmed and softened

This section is the first session's record, as it wrote it in the status
file. Its search notes were not kept and I did not repeat the searches, so
read "confirmed" as "the first session reported it confirmed".

- **Nash's note and thesis.** The note is two pages (PNAS 36, 48–49). The
  thesis has 27 pages according to Princeton; Wikipedia says 28. The text
  says twenty-seven.
- **Schelling.** The New York question is confirmed as to the answers: the
  information booth of Grand Central Station, and noon. The lecture says
  "more than half" chose the booth and "nearly all" noon. The counts of the
  heads-or-tails question were not confirmed, so the text says "a large
  majority said heads" and gives no number.
- **Rousseau, 1755** (the Discourse on Inequality): kept as written. No
  note of a separate check survives.
- **Van Huyck, Battalio and Beil (1990).** Groups of 14 to 16, choices 1
  to 7, pay set by the lowest choice, and the minimum at 1 in every group
  from the fourth period on: taken **from Weber (2006), not from the 1990
  paper itself**, which was not read. The lecture states it as fact ("from
  the fourth round on, the lowest effort was 1 in every group"). This is
  the sentence I would look at first: either check it in the paper or
  soften it.
- **Cournot 1838, Bertrand 1883:** kept as written; the Bertrand citation
  is the one you gave (Journal des Savants, 499–508). No note of a separate
  check survives.
- **Tullock 1980.** The year and the volume are confirmed. The pages are
  97–112 in most sources and 91–112 in one, so the citation has **no
  pages**.

## References I could not confirm

- Tullock's page range (above): dropped from the citation.
- For the other entries of "Further reading" no problem was recorded by the
  first session, and all of your list is in the lecture. I have no record
  of which ones it looked up one by one (Dimitri and Arnosti–Weinberg you
  had confirmed yourself). If the list matters entry by entry, it needs one
  more pass.

## Timings and sizes

- In the browser: "Survey" with 2,000 games 0.1 s, with 20,000 games
  0.7 s. "Scan the starting share" 1.1 s at N = 200 and **7.3 s at
  N = 1,000**. Both run through `useExperiment`, on a button, never when
  the page loads.
- Figure heights. F1: 323 px at 1280 px (both languages); 535 px at 375 px
  in English, 555 in Italian. F2: 363 px at 1280 px in English, 383 in
  Italian; 616 and 633 px at 375 px. So F1 is under 340 px on a wide
  screen and F2 is 23 to 43 px over.
- Chunks: module 02 82.71 kB (29.54 kB gzip); module 01 72.73 kB (26.26).
  The code the two modules share (`games.js`, `randomgames.js`,
  `PayoffTable.jsx`) is in one chunk of its own, `randomgames-….js`,
  9.84 kB (4.00 gzip), requested by both module pages and only when
  unlocked. Also loaded: `ui` 2.30 kB and `charts` 3.14 kB (the Network
  Lab's helpers, unchanged), `Slider`, `useExperiment`. No recharts. The
  locked page requests no lecture, content or sim chunk.
- Lecture: 1,684 words in English, 1,691 in Italian, markup and box
  included. Box: 197 words in English, 196 in Italian, title included.
- No canvas in the module: figures and charts are SVG.

## Italian terms

Nash equilibrium = equilibrio di Nash; focal point = punto focale;
convention = convenzione; coordination game = gioco di coordinamento;
payoff dominant = dominante nei payoff; risk dominant = dominante nel
rischio; tipping point = punto di svolta; best-response curve (line) =
curva (retta) di risposta migliore; quantity competition = concorrenza
sulle quantità; price competition = concorrenza sui prezzi; cartel =
cartello; contest = gara; prize = premio; effort = sforzo; hash rate =
hash rate (kept; "l'hash rate"); block reward = ricompensa del blocco.

Also chosen: share = quota; miner, mining, pool kept in English; difficulty
adjustment = aggiustamento della difficoltà; free entry = libero ingresso;
walk = cammino; cycle = ciclo; sweep = passata; run = prova; sample =
campione; to settle = assestarsi; to swing = oscillare. Buttons: Walk =
Cammina, Survey = Rassegna, Scan the starting share = Esplora la quota
iniziale, One at a time = Uno alla volta, All at once = Tutti insieme. All
recorded in the status file.

## For you to decide

1. The Van Huyck sentence: check it in the 1990 paper or soften it.
2. Whether the sources need a second pass, given that the first session's
   notes were lost.
3. The lecture quotes 14 and 83 in 100 from the page's 200-run scan; a
   400-run sample gives 12.5 and 78.5. The text is true to what the page
   shows. If you prefer rounder wording ("about one time in seven", "about
   four in five"), it is one line in each language and in the check.
4. The share with no equilibrium at m = 8 is 0.322 on the page (the lecture
   says 32%); other samples give 0.314–0.321 and your run 0.312. "About a
   third" in the last section is safe either way.
5. Panel C's prize slider, and the rule that a player facing nobody spends
   0.
6. F2 is 363 px tall (383 in Italian), over the 340 px you asked for "if
   you can".
7. Network Lab pages on the regression compare list (stage 0b).
8. The hub `/labs` and the pages outside the labs still keep the scroll
   position of the page before; untouched, as you asked.
9. Both lectures of the lab stay DRAFT for Adriano.
