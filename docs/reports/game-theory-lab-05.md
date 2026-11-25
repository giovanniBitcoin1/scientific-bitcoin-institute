# Game Theory Lab — report of prompt 5

Prompt 5: one fix to module 04 (stage 0), then module 05 "Incomplete
information and signals" (`incomplete-information-signalling`). Branch
`game-theory-lab`, local commits only, nothing pushed. The working log, with
every check run and every source looked up, is
`docs/reports/game-theory-lab-05-log.md`.

## Commits

- 1fa2004 "Game Theory Lab 04: fixes" (stage 0).
- e0c460e "Game Theory Lab 05: Incomplete information and signals" (two WIP
  commits, 5cdfe8c and 1a86f18, squashed; status file updated, module 05
  "ready").
- "Game Theory Lab 05: report": this file and the working log.

## Stage 0: one payoff order for the entry game

The change was small, so the new order was kept. In Panel A the
commitment preset is now `entryTree({ f: 0, k: 1, commit: true })`, the
very tree of F1: the newcomer is player 0 (rows of the table, payoff
written first, in the first player's colour) and the firm, player 1, moves
at the root. `PLAYERS.commit` is (Newcomer, Firm). Two texts of the panel
had to change, because "first player" was wrong once the firm moves first:

- the note under the table now names the players: "Rows: the plans of the
  newcomer, whose payoff is written first; columns: those of the firm"
  (Italian with "del nuovo arrivato", "dell'impresa");
- the legend under the tree adds the order, for every preset: "payoffs
  (newcomer, firm), the first on top".

Observe item 2 now reads "(0, 3), as everywhere in the entry game
(newcomer, firm)". Read again after the change: backward induction gives
(0, 3) and the firm commits. The table is 4 × 4 with 5 Nash equilibria, one
subgame perfect, and it is the backward-induction cell. The four empty
threats are named for the right player: three are the firm's ("Fight"
after Wait, Enter: 0 where sharing gives 2), one is the newcomer's ("Enter"
after Commit: −1 where staying out gives 0).

New checks:

- in `check-game-theory-04.mjs`: the newcomer is player 0 and the firm is
  at the root; the tree is F1's; with k = 1 the outcome is (0, 3) as
  (newcomer, firm); each non-perfect equilibrium has its threat;
- in the functional check: the threats, the legend, "F" at the root, the
  rows note, and "payoffs 0 and 3".

Also found and fixed: `presets.js` held the Italian name of "Down" (random
trees) double-encoded, so the Italian page showed "GiÃƒÂ¹" instead of
"Giù". Comments in `presets.js`, `bargaining.js`, `forks.js` and
`ultimatum.js` were garbled the same way and are fixed too.

Results after stage 0:

- `check-game-theory-04.mjs`: all PASS.
- `npx vite build`: OK.
- Module 04 functional check: 0 failures of 45.
- `check-module.mjs` on module 04: 0 failures of 56.

They were run again at the end, after the `GameTree.jsx` change: same
results.

## What was added to GameTree.jsx

Optional props; module 04 passes none of them and sees no change.

- **Chance nodes.** A node with `chance: true` and moves `{ name, prob,
  child }` is drawn as a grey circle (slate-500 on slate-100) marked
  `chanceLabel` (default N). Its moves are labelled with the name and the
  probability (`probFormat`, default `format`), always in full.
- **Information sets.** `infoSets` takes lists of node ids; each list is
  joined by a dashed line drawn under the edges. The tree of F1 gives both
  newcomer nodes the same move labels.

F1's tree is built in the module's own `types.js`. `trees.js` was not
generalised: each type of incumbent is solved with module 04's
`backwardInduction` on its own branch, then the newcomer's expected payoff
is taken.

## Module 05 as built

**Lecture**, EN and IT, with the DRAFT marker. EN has 1,696 words, IT
1,694. It follows the prompt's seven sections and has no box and no
Bitcoin. Akerlof's rejections take one sentence in the text, not a box.
"Panel A/B/C" is written "Simulation A/B/C", as in module 04.

**Live figures**

- **F1 "Who is the incumbent?"**
  - The tree: a chance node, an information set, six leaves.
  - Sliders t (0–1, step 0.01) and w (−3 to 0, step 0.5).
  - Shown: what each type does, 2(1 − t) + t w with the numbers, t* =
    2/(2 − w), the choice, and each type's payoff.
- **F2 "A little doubt"**
  - A line of signals from −0.25 to 1.25 in three bands, with ticks for
    the earlier cutoffs.
  - Log slider σ (0.02–1).
  - Buttons "Next step", "To the end" (until both cutoffs are within 1e-6
    of 1/2) and "Reset".
  - Readouts: step, k_n, l_n, width; the line about θ known exactly.

**Panels**

- **A "The market that empties"**
  - Sliders q_min, b, N; "New sample" (sample n uses seed n).
  - Opens on sample no. 1; "Run" replays its rounds, 70 ms each.
  - Two charts by round: price, and share still on offer. Each shows the
    exact path dashed, and the end point.
  - Two result lines: the sample, and the exact model.
  - "Survey": two charts against b, with the four exact curves and 40
    sample dots each.
- **B "Separate or pool?"**
  - The separating and pooling ranges.
  - A candidate: "Separating at e" / "Pooling at e", with slider e (0–4,
    step 0.01). Shown: the verdict with who deviates and where, the
    payoffs, the cost wasted per worker, and Cho–Kreps with the breaking
    interval.
  - A chart against λ, with the crossing at 1 − c_H/c_L marked.
- **C "Words that cost nothing"**
  - Slider b; one button per N, from 1 to the largest.
  - The partition drawn, with the actions.
  - Readouts: the boundaries, both losses, no talk, delegation.
  - "Simulate 10,000 cases".
  - "Survey": the loss, b² and 1/12 against b, plus the list of b where N
    drops.

**Exercises**: six, as in the prompt.

**Φ**: erf by its Taylor series below 3 and by Laplace's continued
fraction for erfc (60 terms, evaluated backwards) above. Against ten
tabulated values of Φ the largest error is 3.3e-15. erf + erfc = 1 to
1e-14, and Φ is continuous where the two methods meet.

## Sources: which "check" figures were confirmed, which softened

All were looked up in November 2026 (Crossref, IDEAS/RePEc,
nobelprize.org, publisher and author pages); details are in the log.

- **Harsanyi 1967–68**: confirmed. Volume 14; pages 159–182, 320–334 and
  486–502. The abstract describes Nature's lottery with a distribution
  known to every player.
- **Akerlof 1970 and the journals**: confirmed in his own essay on
  nobelprize.org. The American Economic Review and the Review of Economic
  Studies rejected it as too trivial. The Journal of Political Economy
  rejected it because "if this paper was correct, economics would be
  different". The QJE accepted it. The lecture's sentence does not name
  the journals.
- **2001 prize**: confirmed. Akerlof, Spence and Stiglitz, "for their
  analyses of markets with asymmetric information".
- **Spence 1973**: confirmed.
- **Rothschild and Stiglitz 1976**: confirmed.
- **Cho and Kreps 1987**: the citation is confirmed. That the name
  "intuitive criterion" comes from this paper rests on secondary sources,
  so the text says "often called the intuitive criterion".
- **Zahavi 1975**: confirmed.
- **Grafen 1990**: the citation is confirmed. "Firm footing" is
  **softened**: Penn and Számadó (2020) argue his models do not support the
  handicap principle. The lecture says he "is widely taken to have given it
  a formal footing, a reading that has since been debated".
- **Crawford and Sobel 1982**: confirmed, pages 1431–1451.
- **Dessein 2002**: the citation and the general result are confirmed (his
  abstract: delegation beats communication "as long as the incentive
  conflict is not too large"). The 0.29 of the uniform–quadratic case was
  **not** read in the paper, so the lecture presents it as computed in this
  model ("in this model it does so whenever b is below about 0.29"). It is
  1/√12 = 0.2887, and the self-check pins it.
- **Carlsson and van Damme 1993**: confirmed. The abstract: as the noise
  vanishes, iterated dominance selects risk dominance.
- **Morris and Shin 1998**: confirmed. Bank runs are mentioned only as
  "has since been applied".
- **Books**:
  - Osborne ch. 9 "Bayesian Games" and ch. 10 "Extensive Games with
    Imperfect Information": confirmed.
  - Tadelis ch. 12, 15, 16 and 18: confirmed.
  - Shoham and Leyton-Brown ch. 6 (Bayesian games) and ch. 8
    ("Communication": cheap talk, signalling): confirmed.

No reading was dropped.

## "Expected" values that differed

Everything else matched exactly, or within the given tolerance: t*, the
lemons exact values, education, Cournot, cheap talk (N, boundaries, losses,
simulation 0.03070 / 0.04061 over 200,000 draws), and the global-game
cutoffs and step counts (3, 4, 8, 13, 24, 56 and 5, 7, 12, 21, 38, 89).
What differed:

- **Lemons, 10,000 cars, (0.2, 1.5), seeds 1–10.**

  | | Mine | Expected |
  |---|---|---|
  | End price | 0.576–0.617 | 0.579–0.619 |
  | Cars traded | 0.472–0.522 | 0.476–0.529 |
  | Gains | 0.304–0.357 | 0.308–0.364 |
  | Rounds | 24–27 | 21–25 |

  Your checks (within 0.03 of 0.6, within 0.035 of 1/2 and 1/3) pass on
  every seed. Rounds are very sensitive to the sample: 18–41 over seeds
  1–40. The rule was checked on a five-car example worked by hand: prices
  0.75, 0.6, 0.45, 0.3, four rounds. The limit was then set from the 40
  seeds: rounds between 15 and 45.
- **1,000 cars**: 0.529–0.667 (yours 0.53–0.64). Reported, not checked.
- **The survey of Panel A.** I added a check that each sample dot lies
  near the exact curve. On ten other seeds this found the point q_min = 0,
  b = 2, which is a knife edge of the exact model: p_{t+1} = min(p_t, 1),
  so any price below 1 stays where it is. A sample there ends anywhere
  between 0.366 and 1. That dot is left out of the check, and the observe
  list explains it. Everywhere else the dots are within 0.1 of the curves
  (largest 0.093; 0.040 on the page's seed, at q_min = 0, b = 1.9).

## Exercise answers that differ from yours

None, except for the simulated parts of exercise 6. With b = 1.5 the
sample of 10,000 cars (no. 1) trades 0.001, 0.228, 0.493 and 1.000 of the
cars for q_min = 0, 0.1, 0.2 and 0.4 (exact: 0, 0.222, 1/2, 1). Its end
price at q_min = 0.2 is 0.594. The solution gives both the exact and the
sample values.

## The numbers behind each "What to observe"

All are pinned by the self-check ("quoted on the page") and most by the
functional check.

- **A**
  - Sample no. 1 (10,000 cars): first price 0.898, end at 0.594 after 27
    rounds; cars 0.493, gains 0.326; the exact path is within 0.001 of its
    end at round 20.
  - q_min = 0: price 0.001, 8 cars sold.
  - q_min = 0.4: first price 1.048, one round.
  - b = 1.65: 32 rounds, 0.904 of the cars. b = 1.70: one round.
  - N = 1,000: 0.580 after 16 rounds.
  - Seeds 1–10: 0.576–0.617 (10,000 cars), 0.529–0.667 (1,000 cars).
  - Survey: 0.040 at (0, 1.9); 1.000 at (0, 2) on this seed, 0.366–1 on
    others.
- **B**
  - Separation 1–2, pooling 0–0.3.
  - Separating at 1: 1.5 and 1, wasted 0.15, passes the test.
  - Separating at 1.5: fails the test on 1–1.5.
  - Separating at 2: the high type gets 1.
  - Pooling at 0: 1.3 each, broken by 0.7–1.4.
  - Pooling at 0.3: 1 and 1.15, wasted 0.255.
  - λ = 0.8: 1.8 against 1.5; crossing at 0.5.
  - c_H = c_L: separation only at e = 1. c_H > c_L: none.
- **C**
  - b = 0.1: boundary 0.3, actions 0.15 and 0.65. Losses 0.03083 and
    0.04083; no talk 0.08333; delegation 0.01000. Simulated: 0.03080 and
    0.04085.
  - Fewer intervals are worse for both (checked for every b on a 0.005
    grid).
  - b = 0.05: 0.1333 and 0.4667, loss 0.01593 (0.02333 with N = 2).
  - b = 0.02: lengths 0.04 to 0.36.
  - b = 0.25: one interval, delegation 0.0625.
  - Survey: N = 10 at 0.005, then 7, 6, 5, 4 by 0.025, 3 at 0.045, 2 at
    0.085, 1 at 0.25. The loss is above b² up to b = 0.285, below from
    0.290.

## Choices to review

**F1 and Panel B**

- In F1 the newcomer's initial is **E** ("entrant"; IT "chi entra") and
  the incumbent's is I, because N marks Nature. "Incumbent" in Italian is
  "l'impresa che c'è già".
- At t = t* the newcomer stays out (a tie goes to staying out), and the
  page says so.
- In Panel B, "separating at 0" is shown as pooling at 0, with a line
  saying why. Levels nobody chooses are read as low. The Cho–Kreps line
  appears only when the candidate is an equilibrium.

**Panel A**

- It shows sample no. 1 at once; "Run" replays it. The prompt's "Run"
  would otherwise have left the panel empty on arrival.
- The survey runs b = 1.1, 1.2, …, 2.0, each dot with its own seed
  (5100 + 100 i + j).

**Panel C**

- With b = 0 the buttons stop at 12, and a line explains it.
- "Survey" is computed at once, with no job (0.3 ms). The prompt's
  per-N labels inside the chart overlapped at small b, so the drops are
  listed in a line under the chart.

**Texts and checks**

- The lecture has no "box" at all.
- The "never free" check matches any "free", so the lecture says
  "costless and unverifiable" for cheap talk.
- The quoted checks live in `check-game-theory-05.mjs` itself, as in
  module 04.

## Timings in the browser (headless Chrome, 1280 px)

| Action | Time |
|---|---|
| Panel A, 10,000 cars | instant (1–2 ms in Node); "Run" replays 27 rounds in 2.0 s by design |
| Panel A "Survey" (40 samples of 10,000 cars) | 49 ms (78 ms click to chart) |
| Panel C "Simulate" | 3 ms |
| Panel C "Survey" | 2 ms |
| F2 "To the end" at σ = 0.02 (190 steps) | 4 ms |

Nothing slow runs at page load.

## Figure heights

| | 1280 px EN | 1280 px IT | 375 px EN | 375 px IT |
|---|---|---|---|---|
| F1 | 423 | 404 | 622 | 638 |
| F2 | 310 | 330 | 340 | 414 |

F1 is above the ~340 px guide at 1280 because of its text column: what
each type does, the expected payoff with the numbers, the threshold and
the choice, all of which the prompt asks for. The tree itself is about
260 px.

## Chunk sizes

- The module 05 chunk is 76.1 kB (28.3 kB gzip), loaded only when
  unlocked.
- Module 04's `trees.js`, with module 01's `games.js`, is now in a shared
  chunk `trees-….js` of 9.5 kB (4.0 kB gzip), used by modules 04 and 05.

## Checks (all on the final code, one at a time)

| Command | Result |
|---|---|
| `npx vite build` | OK |
| `check-game-theory-01` to `-05` | all passed |
| `check-index.mjs game-theory` | 0 failures of 80 |
| `check-index.mjs network` | 0 of 76 |
| `check-index.mjs complexity` | 0 of 72 |
| `check-links.mjs` | 0 of 131 |
| `check-module.mjs`, the five modules | 0 of 56 each |
| Functional checks | 32, 49, 39, 45 and 39 checks, 0 failures each |
| `build-main.mjs` + `compare-main.mjs` | 0 of 144 |
| `npm run build` | OK |
| `npm run check:dist` | 0 of 108 |

## Italian terms (also in the status file)

| English | Italian |
|---|---|
| type | tipo |
| chance move (Nature) | mossa del caso (la Natura) |
| common prior | distribuzione a priori comune |
| belief | credenza |
| Bayesian game | gioco bayesiano |
| Bayesian Nash equilibrium | equilibrio di Nash bayesiano |
| information set | insieme di informazione |
| asymmetric information | informazione asimmetrica |
| adverse selection | selezione avversa |
| lemon | bidone |
| signal | segnale |
| signalling game | gioco di segnalazione |
| separating equilibrium | equilibrio separante |
| pooling equilibrium | equilibrio di confusione (*pooling*) |
| off the equilibrium path | fuori dal cammino di equilibrio |
| single crossing | singolo incrocio (*single crossing*) |
| the Cho–Kreps test (intuitive criterion) | test di Cho e Kreps (criterio intuitivo) |
| handicap principle | principio dell'handicap |
| cheap talk | *cheap talk* (kept; "parole che non costano nulla") |
| expert | esperto |
| decision maker | chi decide |
| bias | distorsione |
| partition | partizione |
| delegation | delega |
| global game | gioco globale |
| private signal | segnale privato |
| noise | rumore |
| tough, weak | duro, debole |

"Chi guida" and "chi segue" stay, under "Open items" in the status file.
The DRAFT markers stay.
