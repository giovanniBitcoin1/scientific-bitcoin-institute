# Game Theory Lab, prompt 10: report

Module 10, `coalitions-sharing` ("Coalitions: how to share the pie" /
"Coalizioni: come dividere la torta"), plus stage 0 on check-game-theory-03.
Branch `game-theory-lab`, local commits only:

- 054b3b8 "Game Theory Lab 10: Coalitions and sharing" (four WIP commits
  squashed; stage 0, module, status file, module 10 "ready").
- "Game Theory Lab 10: report" (this file and the working log
  `docs/reports/game-theory-lab-10-log.md`).

## Stage 0: check-game-theory-03

- **Before: 437 s.** I timed each part by stamping every output line. One
  part took 376 s: the check that every equilibrium of a random zero-sum game
  pays the value, found on a fine grid of mixes.
- **The cause.** For the 2 × 3 and 3 × 2 games, the grid of three-strategy
  mixes at step 1/4000 has 8,006,001 points. It was built as arrays, afresh
  for each of 60 games:
  - building the grids: 84 s + 82 s;
  - the best-worst-case scans over them: 87 s + 90 s.
- **The fix.** The grid is now walked point by point with plain loops. The
  points, the tolerances and the order of each sum are unchanged, so the
  values are identical:
  - compared on 124 games (60 2 × 2, 2 + 2 at K = 4000, 60 3 × 3), old and
    new values are equal (===) on all 124;
  - nothing is tested less.
- **After: 79–82 s.** The zero-sum block now takes 26 s. Every check passes.
- **New working rule** in the status file ("Long checks"): a check that may
  pass the tool's time limit is run with a longer timeout (up to 600 s),
  never moved to the background. If even that is not enough, stop and say
  so. In this prompt every check ran in the foreground, one at a time.

## Differences from the prompt

- **Ketubot, not Kethubot.** Sefaria spells it Ketubot 93a. Both lectures use
  "Ketubot".
- **The core's origin.** The lecture now says the core was "introduced by
  Donald Gillies and by Shapley in 1952–53 and published by Gillies (1959)".
  - Aumann (1961) says Gillies first defined it explicitly.
  - Walker's chronology credits Shapley (RAND RM-817, 1952) and Gillies (his
    1953 thesis).
  - Who coined the word "core" was not found.
- **Shapley's four properties.** The 1953 paper has three axioms: symmetry,
  "carrier" (efficiency and null player together) and additivity. The
  lecture says "In its modern form, Shapley's result says that it is the only
  rule with four properties".
- **The 1958 Council.** The quota of 12 of 17 applied to acts on a proposal
  from the Commission. Other acts needed 12 votes cast by at least four
  members, and under that rule Luxembourg could be pivotal (Mayer 2018, Games
  9, 29). The lecture says "an act proposed by the Commission needed 12 of the
  17. Under that rule Luxembourg's vote never decided anything".
- **The three-player core condition.** I found no textbook that states it.
  - It follows from the minimal balanced collections of three players.
  - The self-check confirms it on 1,331 grid games and 400 random ones.
  - One arXiv paper (1506.01242) states it with a strict inequality, which is
    wrong at equality.
  - The lecture states it without a citation.
- **The hash rate.** The box quotes "about 1 ZH/s, 10²¹ hashes a second (a
  30-day average of 1,019 EH/s on 23 November, according to Hashrate Index)".
  - The variance sums are done at 1 ZH/s, as in your prompt: one in a
    million, 52,560 blocks, a block every 19 years.
  - At 1,019 EH/s the 19 years become 19.4. The self-check pins both.
- **Lewenberg et al.** Their abstract says "high transaction loads". The box
  says "when blocks carry many transactions".
- **Panel A's "core point"** is the solution of the least-core programme (a
  vertex chosen by Bland's rule), not the nucleolus. When the core is
  nonempty, that point is in the core.
  - For the partners it is (50, 30, 20), which is also their nucleolus.
  - For a cost game the point is also shown as costs.
- **Panel B.**
  - The table's headers are short ("S–S", "abs."), and the share column is
    hidden below 640 px. With the full names the table stuck out at 375 px
    in English.
  - The legend spells out "Shapley–Shubik (S–S)".
  - The 30 weights sit behind a "Weights" list, with "Add a player" and
    "Remove the last".
  - Bars carry labels only up to 8 players.
- **Panel C.**
  - CEA and CEL keep their English names in Italian, as Fragnelli's course
    does: "CEA (somme uguali)", "CEL (perdite uguali)".
  - In English the labels are "Equal awards (CEA)" and "Equal losses (CEL)".
- **F1's keys.**
  - → and ← move 1 between A and B.
  - ↑ moves 1 to C from the larger of A and B (A on a tie).
  - ↓ moves 1 from C to the smaller of A and B (B on a tie).
  - The figure's hint says "↑ ↓ move 1 to and from C".
- **The box** is longer than in modules 02–09: 335 words in English, 342 in
  Italian. It has your four paragraphs. I did not shorten it further.
- **Rule kept:** a coalition objects only if it would get strictly more.
  This applies in F1's readout, in Panel A's "Shapley value in the core?" and
  in `objections()`.

## Exercise answers

All six of your answers agree with the recomputed ones, and the self-check
pins each one.

1. Corners (60, 40, 0), (60, 10, 30), (30, 40, 30); Shapley value 125/3,
   95/3, 80/3.
2. Corners (60, 40, 0), (60, 30, 10), (50, 40, 10); Shapley value 45, 35,
   20; A and B object (80 against 90).
3. 200 ≥ 300 and 200 ≥ 240 are impossible. With 60, the corners are
   (40, 40, 20), (40, 20, 40), (20, 40, 40).
4. 1/6, 1/6, 2/3; the core is only (0, 0, 1).
5. At quota 12: 7/30 ×3, 3/20 ×2, 0. At quota 13: 13/60 ×3, 7/60 ×3.
6. Talmud 50, 75, 75; proportional 33.33, 66.67, 100; equal awards 66.67
   each; Shapley 33.33, 83.33, 83.33.

Types: exercise 3 is "paper"; the others are "both".

## Self-check numbers (check-game-theory-10: 133 PASS, 0.7 s)

Every number in your self-check list agrees with the code.

**The simplex.**

- min x + y with x + 2y ≥ 4 and 3x + y ≥ 6: (8/5, 6/5), value 14/5.
- Chvátal's cycling example: (1, 0, 1, 0), value 1, in 7 pivots.
- Beale's example: (1/25, 0, 1, 0), value −1/20.
- Infeasible, unbounded and redundant-equation cases are handled.
- 150 random LPs agree with brute-force vertex enumeration.

**F1.**

- Shapley values:
  - (70, 60, 40) and (80, 70, 50) both give 125/3, 95/3, 80/3;
  - (90, 60, 40) gives 45, 35, 20;
  - (100, 100, 100) gives 100/3 each.
- The formula, the general formula and the six orders agree on 300 random
  games. The formula and all orders also agree on 40 games of 4 and 5
  players.
- Cores and corners:
  - every core you gave agrees, and so do the corners;
  - (80, 70, 50) is the single point (50, 30, 20);
  - (100, 100, 100) is empty.
- The LP's core test, the three-player rule and the corner search agree on
  all 1,331 grid games. The LP and the rule agree on 400 random games, with
  pairs up to 1.4 v(N).
- The game with v(N) = 72 and pairs 60, 48, 30: Shapley 32, 23, 17, outside
  the core; corners (42, 24, 6), (42, 18, 12), (36, 24, 12).

**Panel A.**

- Gloves (L, L, R): 1/6, 1/6, 2/3; core {(0, 0, 1)}.
- Gloves (L, L, R, R, R): 13/20, 13/20, 7/30 ×3; core {(1, 1, 0, 0, 0)}. For
  each share, the min and the max over the core coincide.
- Majority with 3, 4 and 5 players: 1/n each; the core is empty; least core
  ε = 1/3, 1/4, 2/5.
- Every pair at 100: ε = 100/3. Every pair at 80: ε = 40/3.
- Airport (10, 15, 30): cost shares 10/3, 35/6, 125/6, in the core; the
  savings game is convex. These equal Littlechild–Owen's stretch-by-stretch
  sums.
- Unanimity of players 1 and 2: 1/2, 1/2 and 0 for the rest (n = 3, 4, 5).
- Shapley (1971) holds on 200 random convex games.

**F2 and Panel B.**

- Shapley–Shubik at every quota from 9 to 17: as yours.
- Banzhaf at quota 12:
  - swings 10, 10, 10, 6, 6, 0;
  - normalised 0.2381 and 0.1429;
  - absolute 0.3125 and 0.1875.
- 49–49–2: 1/3 each.
- The pools:
  - every value you gave agrees at 26, 34, 51 and 67, including the twenty
    1% pools' 0.1740 at 51;
  - at 34 and 67 the indices are exactly equal (the games are dual);
  - the largest players needed are 1, 2, 3 and 4;
  - the split at 51 gives 0.1293 ×2 (0.2586), then 0.2047, 0.2047, 0.0745,
    0.0745, 0.0092.
- The indices add up to exactly 1 at every quota from 1 to 100.
- The dynamic programme agrees with enumeration on 60 random games of 2 to
  12 players.

**Panel C.**

- All 35 rows of your table agree (E = 100, 150, 200, 250, 300, 400, 500).
- At each of these the nucleolus (sequential LPs) equals the Talmud's rule.
  So it does on 411 more problems: 36 claim vectors, estates in steps of 50.
- On 786 problems every rule gives out exactly E, within the claims, and
  Shapley equals random arrival.
- The Talmud's rule with two creditors equals the contested garment.

**A check I got wrong.** My first hand-solved nucleolus for the partners,
(52.5, 32.5, 15), was wrong. I forgot that x_A = 100 − x_B − x_C ties the
third pair's satisfaction to the other two. The right answer is (50, 30, 20),
at level 10, which is what the code gave. The check now uses that.

## Numbers behind "What to observe"

**Panel A**

1. The partners:
   - Shapley value 125/3, 95/3, 80/3;
   - superadditive, but not convex (C adds 40 to B alone, 30 to A and B);
   - LP minimum 85; core point (50, 30, 20); the Shapley value is in the
     core.
2. Partners with v(AB) = 90: 45, 35, 20. A and B would get 10 more on their
   own. LP minimum 95.
3. Majority with 3, 4, 5 players: minima 3/2, 4/3, 5/3; ε = 1/3, 1/4, 2/5.
4. Gloves (L, L, R): 1/6, 1/6, 2/3, core (0, 0, 1). Gloves (L, L, R, R, R):
   13/20, 7/30, core (1, 1, 0, 0, 0).
5. Airport: 10/3, 35/6, 125/6; v(N) = 25 for the savings game, which is
   convex; the Shapley division is in the core.
6. Unanimity: 1/2, 1/2, then zeros.

**Panel B**

1. The 1958 Council:
   - Shapley–Shubik 0.2333, 0.1500, 0.0000;
   - Banzhaf 0.2381 and 0.1429; absolute 0.3125 and 0.1875;
   - 3 largest members needed; 42 swings.
2. 49–49–2: 0.3333 each.
3. Pools at 51: 0.3030/0.3322, 0.2031/0.2209, 0.0584/0.0579, 0.0087/0.0055;
   3 largest needed.
4. Pools at 26: 0.3673. At 34 and 67: 0.2820, 0.1743, 0.0895, 0.0095. Largest
   needed: 1, 2, 3, 4.
5. The split: 0.1293 each, 0.2586 together against 0.3030; the 19% pools
   rise to 0.2047.

**Panel C**

1. At E = 200:
   - Talmud 50, 75, 75; proportional 33.33, 66.67, 100.00;
   - CEA 66.67 each; CEL 0, 50, 150; Shapley 33.33, 83.33, 83.33.
2. The Talmud gives 33.33 each at 100 (equal to CEA). At 300 it gives 50,
   100, 150, equal to proportional and Shapley.
3. Under the Talmud's rule the first creditor's award is exactly 50 from
   E = 150 to E = 450 (all 61 steps of 5), and 100 at 600.
4. At E = 450: Talmud = CEL = 50, 150, 250; Shapley 66.67, 141.67, 241.67.

## References: confirmed and softened

All looked up on 25–26 November 2026. Details and URLs are in the log.

**Confirmed (Crossref, publisher pages, abstracts):**

- Gillies 1959: Contributions IV, 47–85 (De Gruyter prints 47–86).
- Shapley 1967: NRLQ 14(4), 453–460. The theorem: nonempty core iff
  balanced.
- Shapley 1953: Contributions II, 307–317 (in modern form; see
  "Differences").
- Shapley 1971: IJGT 1, 11–26. The RAND abstract says the value is the
  centre of gravity of the core's extreme points, so it lies in the core.
- Littlechild and Owen 1973: Management Science 20(3), 370–372.
- Shapley and Shubik 1954: APSR 48(3), 787–792.
- Banzhaf 1965: Rutgers Law Review 19, 317–343.
- Penrose 1946: JRSS 109(1), 53–57. His measure is half of Banzhaf's raw
  measure (Felsenthal and Machover).
- The 1958 Council's weights 4, 4, 4, 2, 2, 1 and the quota 12 of 17, with
  the Commission-proposal caveat (Mayer 2018).
- The Talmud: Ketubot 93a (100 equally; 50, 75, 75; 50, 100, 150) and Bava
  Metzia 2a (the second case: "all" against "half", 3/4 and 1/4), on
  Sefaria.
- Aumann and Maschler 1985: JET 36(2), 195–213. The abstract says the
  nucleoli match, and that the contested-garment principle gives a unique
  rule.
- Schmeidler 1969: SIAM J. Appl. Math. 17(6), 1163–1170.
- Rosenfeld 2011: arXiv:1112.4980; §2.1 proportional, §2.2 PPS, §3.3 PPLNS,
  §6.1 pool hopping.
- Lewenberg et al. 2015: AAMAS 919–927 (abstract).
- Can, Hougaard and Pourpouneh 2022: GEB 136, 274–298 (a new
  characterisation of the proportional scheme).
- The hash rate: Hashrate Index, 23 November 2026.
- Chapters:
  - Osborne, ch. 8 "Coalitional Games and the Core";
  - Shoham and Leyton-Brown, ch. 12 "Teams of Selfish Agents: An
    Introduction to Coalitional Game Theory";
  - Jackson, ch. 12 "Allocation Rules, Networks, and Cooperative Games".

**Softened, or from secondary sources:**

- Gillies and Shapley, and Shapley's axioms: see "Differences".
- Bondareva 1963: from secondary sources (no Crossref record).
- O'Neill 1982: the bibliographic details are confirmed. That random arrival
  equals Shapley is from secondary sources; the paper was not read in full.
- The three-player rule: derived, no citation.
- The full texts of Aumann–Maschler and Shapley 1953 were not read; the
  verdicts rest on their abstracts and on standard sources.

## Timings in the browser (1280 px, Chrome, functional check)

- Panel A, one edit at 5 players (120 orders, two LPs): 4–5 ms.
- Panel B, "Split the largest" from 25 to 26 players: 7–16 ms.
- Panel B, a quota change at 29 players: 37–40 ms.
- Panel B, "Split the largest" from 29 to 30 players: 38–42 ms.
- Panel C, three claims moved to 500 one after the other (D up to 1,500, five
  rules, the chart redrawn each time): 46–55 ms in all.
- Nothing on page load is slow. In Node, Panel A's eleven presets take
  13 ms, and 30 players take 8 ms.

## Figure heights and chunk size

- **Figure heights.** Two measurements:
  - with caption (functional check): F1 407 px and F2 346 at 1280 EN (IT 407
    and 382); 836 and 624 at 375 IT;
  - figure body only (check-module): 361 and 300 at 1280 EN; 751 and 539 at
    375 EN.
- **F1 against the guide.** F1 is above your guide of about 380. The
  triangle was narrowed from 18 to 16 rem (it was 436 px), and I stopped
  there.
- **Chunk size.** The module chunk is 83.8 kB (30.4 kB gzip).
  - It uses only the shared Slider, DrawToggle, network/ui and network/charts
    chunks, plus module 08's `frac.js`.
  - Vite now puts `frac.js` in a 0.8 kB chunk shared by modules 08 and 10.
  - No recharts.
  - No horizontal scroll at 375 px in either language.

## Italian terms for module 10 (added to the status file)

Main sources:

- Fragnelli, Università del Piemonte Orientale, course slides;
- Torre and Bernardi, Pavia 2019;
- Lucchetti;
- Barbarino 2020.

**Found:**

- gioco cooperativo, used "in forma coalizionale" at first use;
- funzione caratteristica; gioco TU (utilità trasferibile); coalizione;
- superadditivo; convesso;
- nucleo, with *core* at first use;
- valore di Shapley; contributo marginale; giocatore nullo;
- gioco bilanciato; teorema di Bondareva–Shapley; nucleolo;
- gioco a maggioranza pesata; quota;
- indice di Shapley–Shubik, indice di Banzhaf;
- pivotale (the *pivot*) and cruciale (Bernardi);
- coalizione vincente minimale;
- problema di bancarotta ("fallimento" not found);
- gioco dell'aeroporto; gioco dei guanti ("mercato dei guanti" not found).

**Kept in English:**

- *least core*: no Italian term found;
- CEA and CEL, as Fragnelli does;
- *share*, *swing*, *pool*, *miner*, *hash rate*.

**Not readable:** Patrone's book (an encrypted PDF; his site returned 403).

## Checks (final code, before the squash; one at a time, in the foreground)

**Self-checks:** check-game-theory-01 to 10 all passed. Times:

| Check | Time |
|---|---|
| 01 | 15.1 s |
| 02 | 24.4 s |
| 03 | 81.5 s |
| 04 | 7.2 s |
| 05 | 2.0 s |
| 06 | 0.8 s |
| 07 | 0.8 s |
| 08 | 1.2 s |
| 09 | 0.4 s |
| 10 | 0.7 s |

**Builds:**

- `npx vite build`: built.
- `npm run build`: passed (validate, vite build, post-build).
- `npm run check:dist`: 0 failures of 108.

**Browser checks** (all on a build of the final code):

| Check | Failures |
|---|---|
| check-index game-theory | 0 of 80 |
| check-index network | 0 of 76 |
| check-index complexity | 0 of 72 |
| check-links | 0 of 131 |
| check-module, the ten modules | 0 each (56, 56, 56, 56, 56, 60, 68, 56, 60, 60) |
| the ten functional checks | 0 each (32, 49, 39, 45, 39, 41, 41, 43, 42, 36) |
| build-main + compare-main | 0 of 144 |

**Failures fixed before the final run** (details in the log):

- in check-10: my wrong hand nucleolus, and an Italian pattern broken by
  decimal commas;
- Panel B's table at 375 px;
- Panel A's narrow inputs and overlapping labels (seen in screenshots);
- two wrong expectations and two crashes in the new functional check itself.
