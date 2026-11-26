# Game Theory Lab 13 — report

Prompt `prompts.local/game-theory-lab-13.md`: module 13, "Mining as a game"
(`mining-as-a-game`). Branch `game-theory-lab`, local commits only, nothing
pushed. Working log: `docs/reports/game-theory-lab-13-log.md`.

## Commits

- 23b9018 "Game Theory Lab 13: Mining as a game": the module, the generator,
  the self-check, the functional browser check, `expect.json`, the status
  file (module 13 "ready" and "done"). Three WIP commits squashed (301a91c,
  f486fa1, ec3a504).
- "Game Theory Lab 13: report": this report and the working log.

## Stage 0

Nothing to fix from module 12, as the prompt says.

## What was built

- Logic in `src/components/lab/game-theory/mining-as-a-game/`: `selfish.js`
  (the chain, R, orphans, G; the stationary distribution in closed form and
  solved numerically), `race.js` (Panel A), `difficulty.js` (Panel B),
  `mdp.js` (Panel C's solver), `optimal.json` (Panel C's table, written by
  `scripts/lab/gen-game-theory-13-optimal.mjs`, one γ per command).
- F1 `chain`, "Hide and release": states 0, 0′, 1, 2, 3, 4+ with arrows α and
  1 − α, the three ways out of 0′ (α, γ(1 − α), (1 − γ)(1 − α)) with their
  values; node areas proportional to the stationary probabilities. Sliders α
  (0–0.49, default 0.35) and γ (0–1, default 0), and an "α = 1/3" button for
  exercise 1. Readouts p0, p0′, p1, the rest, R, α, orphans per 100 mined
  (hers, the others'), and "R > α: selfish mining pays" or not.
- F2 `threshold`, "When does it pay?": R against α (0–0.5) for γ = 0, 1/2, 1
  and a γ slider (default 1/4), R = α dashed, each threshold marked on it;
  the switch adds the best deviation (dashed) and its threshold for the γ
  values of the table.
- Panel A "Race the network": α, γ, 10,000 / 100,000 / 1,000,000 blocks,
  run number (seed n). Table of simulated (± standard error, 100 batch
  means) against exact: her share, her and the others' orphans per 100,
  chain blocks per 100; longest private lead; blocks undecided at the end;
  a strip of the last 40 events in two rows of 20 with a key.
- Panel B "The difficulty catches up": α (0.01–0.49), γ, horizon 10–90 days
  (default 60), path number. Chart of the expected cumulative reward,
  selfish and honest, the adjustments dashed, one simulated path (Poisson
  times, retarget every 2016 chain blocks from the time the period took).
  Readouts: before (r_A/α), after (R/α), first adjustment, break-even (or
  "never", or "beyond the horizon"), and the day-H totals.
- Panel C "The best deviation": γ pills (0, 1/4, 1/2, 3/4, 1). Chart of the
  best share against α (0.2–0.45) with SM1 and R = α, the two thresholds
  marked; a table of the 12 α (honest, SM1, best); the truncation note. For
  γ = 0, 1/2, 1 the policy maps of α = 0.30, 0.35, 0.40: three 9 × 9 grids
  (irrelevant, relevant, active; rows a, columns h), coloured by action,
  cells differing from SM1 outlined, cells never reached left blank, and
  the count of differing cells.
- Lectures EN 1,752 words, IT 1,748 (no box), DRAFT marker, eight sections
  as in the prompt. Six exercises.

## Differences from the spec

- **Felten 2013.** The post is "Bitcoin isn't so broken after all" (Freedom
  to Tinker, 7 November 2013). There is no post called "Game theory and
  Bitcoin". Its argument is not about dominance: a coalition of selfish
  miners would not be stable, because each member gains by "fair-weather
  mining" (mining with the coalition while it is ahead, honestly otherwise).
  The lecture gives Felten's argument and ties it to module 06's cartel. The
  sentence "a share above α is a deviation that pays for a large miner, not
  a dominant strategy" is kept as our own remark, not attributed to him.
- **Adopt's second branch.** Sapirshtein et al.'s Table 1 sends adopt's
  (1 − α) branch to (0, 1, irrelevant). My first version had relevant. I
  changed it and regenerated; no value moved, since match needs a ≥ h.
  Match is "relevant and a ≥ h ≥ 1" as the prompt says; the paper's "a ≥ h"
  is the same thing, because a relevant state always has h ≥ 1.
- **Policy maps.** Ties go to SM1's action, and states the policy never
  reaches are left blank. The first maps outlined exact ties (match and wait
  are the same action at γ = 0) and unreachable states.
- **The optimum at γ = 1.** At α = 0.45 the T = 40 optimum is 5.6e-5
  below α/(1 − α), and at 0.425 it is 1.1e-6 below. Up to 0.4 the gap is at
  most 3.4e-7. The check "equals α/(1 − α) for every α of the table" passes
  within 1e-4; within 1e-6 it holds up to α = 0.4. The gap is truncation,
  and the optimum is never above α/(1 − α).
- **Grunspan and Pérez-Marco** is a preprint only (arXiv:1805.08281, v3
  January 2019). The reading list says "(preprint)".
- **Section 7's stale rate:** Gervais et al. (CCS 2016), 0.41% of Bitcoin
  blocks stale over 10,000 blocks, crawl of February 2016.
- **Italian:** the miner is masculine, as in modules 02–12. My first draft
  had "una miner" and "lei".
- The "Next" section does not link module 14: it is still "coming soon",
  and module 12 did the same for module 13.
- Panel B's α slider starts at 0.01: at α = 0 the shares r_A/α are 0/0.

## Exercises (every answer recomputed)

All six answers agree with the prompt's.

1. p0 = 9/17, p1 = 3/17, p0′ = 2/17; R = 1/3 (denominator 17/27). F1 with
   "α = 1/3" shows 0.5294, 0.1765, 0.1176, R 0.3333 and "it does not pay".
2. 1/3, 0.3, 1/4, 0.
3. Exact 0.4837; 5.90 and 23.61; 70.49. Panel A, 1,000,000 blocks, run 1:
   0.4843 ± 0.0013, 5.89, 23.65, 70.46.
4. 85.25% and 120.93%; 19.86; 33.86 (G = 43/61, r_A = R·G = 0.3410).
5. With γ = 1, r_A = α exactly, so the income before the adjustment is
   100.00%. After it, R/α = 1.2687. Break-even and first adjustment are both
   on day 17.76.
6. SM1 0.3665; best 0.3708 (ours 0.370754 at T = 40; paper 0.37077 at T = 95);
   threshold 0.3294.

## Self-check numbers (`check-game-theory-13.mjs`, 106 PASS, 12 s)

- **Chain.** The numerical stationary distribution (lead up to 400) gives the
  closed-form R within 1e-9 for α = 0.05 … 0.45 and γ = 0, 1/2, 1. At
  α = 0.49 it takes a lead of 1,500, since (α/(1 − α))^400 ≈ 1e-7 there.
  - All 18 R values of the prompt agree to six decimals.
  - Thresholds: 1/3, 0.3, 1/4, 1/6, 0. R > α holds exactly above the
    threshold, checked on a grid of γ (every 0.05) and α (every 0.005).
- **Stationary probabilities at α = 1/3:** 9/17, 2/17, 3/17, 3/34.
  - G: 0.82, 0.788184, 13/17, 0.751783, 43/61, 0.634318. G is the same for
    every γ.
  - Orphans per 100 mined: 7.843/15.686; 5.902/23.607; 3.723/21.098;
    0.000/21.182.
  - Every block mined ends in the chain or is orphaned, within 1.3e-15.
- **Panel A,** ten (α, γ) pairs at 1,000,000 blocks, run 1: the largest
  deviation from the exact values is 2.05 standard errors (limit 4). With
  γ = 1 she has no orphaned blocks.
- **Panel B:** all six rows of the prompt agree:
  - α 0.4, γ 0: 0.8525; 1.2093; 19.860; 33.860.
  - α 0.35, γ 1/2: 0.8936; 1.1887; 18.622; 29.122.
  - α 0.35, γ 0: 0.7872; 1.0472; 18.622; 102.622.
  - α 0.3, γ 1: 1; 1.2687; 17.762; 17.762.
  - α 1/3, γ 0: 0.7647; 1; 18.308; never.
  - α 0.25, γ 3/4: 0.91; 1.1098; 17.073; 31.073.

  On the break-even day the two expected rewards agree within 2e-16. Path
  no. 1 against 200 other paths (seeds 1001–1200):

  | α, γ, days | path 1 ends | expected | sd (200 paths) |
  |---|---|---|---|
  | 0.4, 0, 60 | 3,741 | 3,771.1 | 89.4 |
  | 0.35, 1/2, 60 | 3,293 | 3,317.6 | 72.4 |
  | 0.3, 1, 90 | 4,734 | 4,726.6 | 75.7 |
  | 0.45, 0, 30 | 2,023 | 2,058.2 | 60.8 |

  All four end well within 3 sd.
- **Panel C:** recomputed cells as the prompt lists. Each agrees with the
  table within 1e-6:
  - γ = 0: 1/3 0.33705, 0.35 0.37075, 0.375 0.42590, 0.4 0.48824.
  - γ = 1/2: 0.35 0.43018, 0.4 0.57251.
  - γ = 3/4, α 0.3: 0.37942. γ = 1, α 0.3: 0.42857.
  - Honest mining is optimal at α 0.2 (γ 0, 1/2) and at α 0.3 (γ 1/4).
  - SM1 written as an MDP policy gives back R: 0.366487 against 0.366509 at
    T = 40 (α 0.35), and 0.483685 against 0.483721 at T = 80 (α 0.4).
  - Thresholds 0.3294 (γ 0) and 0.3192 (γ 0.1, SM1 0.3214).
- **Quoted on the page:** every number of the lecture, the observe lists and
  the exercises, in both languages. Also checked: words, sections, links,
  "never free", the Italian terms, the masculine miner, and the reading
  list.

## Panel C: my MDP against yours and against the paper

| γ | α | mine (T = 40) | yours (T = 40) | paper (T = 95) | SM1 |
|---|---|---|---|---|---|
| 0 | 1/3 | 0.33705 | 0.33705 | 0.33705 | 0.33333 |
| 0 | 0.35 | 0.37075 | 0.37075 | 0.37077 | 0.36651 |
| 0 | 0.375 | 0.42590 | 0.42590 | 0.42600 | 0.42118 |
| 0 | 0.4 | 0.48824 | 0.48824 | 0.48866 | 0.48372 |
| 0 | 0.425 | 0.56629 | – | 0.56808 | 0.55801 |
| 0 | 0.45 | 0.66334 | – | 0.66891 | 0.65177 |
| 1/2 | 0.35 | 0.43018 | 0.43018 | – | 0.41603 |
| 1/2 | 0.4 | 0.57251 | 0.57251 | – | 0.52558 |
| 3/4 | 0.3 | 0.37942 | 0.37942 | – | 0.35375 |
| 1 | 0.3 | 0.42857 | 0.42857 | – | 0.38062 |

Every cell of yours agrees with mine to the fifth decimal. The paper's Table 2
is for γ = 0 only, with T = 95. Its upper bounds are 0.33707, 0.37079,
0.42604, 0.48904, 0.57226 and 0.70109. Ours lies below the paper's value
everywhere, by at most 4.2e-4 up to α = 0.4.

**Thresholds.**

| γ | 0 | 0.1 | 1/4 | 1/2 | 3/4 | 1 |
|---|---|---|---|---|---|---|
| best deviation | 0.3294 | 0.3192 | 0.3000 | 0.2500 | 0.1667 | 0 |
| SM1 | 0.3333 | 0.3214 | 0.3000 | 0.2500 | 0.1667 | 0 |

**Against the paper's figure of thresholds:** it plots γ only from 0 to
about 0.24.
- At γ = 0 it reads about 0.329 (read from the plot; the text gives no
  number).
- The two curves merge near γ ≈ 0.2, and the caption says: "Thresholds at
  higher γ values match that of SM1 (but still, optimal strategies for these
  values earn more than SM1, once above the threshold)".
- Its §5.4 gives 0.25 at γ = 1/2.
- So your finding, and mine, that the thresholds coincide at 1/4 and 1/2
  agrees with the paper.

**Generator run times** (final runs, in the CHECKS list):

| γ | 0 | 1/4 | 1/2 | 3/4 | 1 |
|---|---|---|---|---|---|
| run time | 3.1 s | 4.0 s | 4.2 s | 6.4 s | 6.3 s |

- Each solve takes 0.04–1.1 s: 20 bisection steps and 800–2,400 relative
  value iterations (τ = 0.95).
- An iteration stops as soon as the bounds on the gain certify its sign.
- Rerunning all five reproduced `optimal.json` byte for byte.

## Policy maps

Rows a = 0…8, columns h = 0…8. Letters: A adopt, O override, M match,
W wait; a dot is a state never reached.

**α = 0.35, γ = 0** (19 reached cells differ from SM1):

```
irrelevant        relevant          active
a=0  .A.......    .A.......         .........
a=1  W........    .MWA.....         .........
a=2  W.W......    .O.WA....         .O.......
a=3  W.OW.....    .WO.WA...         .........
a=4  WW.OW....    .WWO.WWA.         .........
a=5  WWW.OWW..    .WWWO.WWA         .........
a=6  WWWW.OWW.    .WWWWO.WW         .........
a=7  WWWWW.OWW    .WWWWWO.W         .........
a=8  WWWWWW.OW    .WWWWWWO.         .........
```

- **Behind.** Where SM1 adopts, one or two blocks behind, she waits:
  relevant (1,2), (2,3), (3,4), (4,5), (4,6), (5,6), (5,7), (6,7), (6,8),
  (7,8), and irrelevant (5,6), (6,7), (7,8). This is your observation.
- **One ahead, her block last.** In states reached only through that
  catching up, she overrides where SM1 waits: irrelevant (3,2), (4,3),
  (5,4), (6,5), (7,6), (8,7).

**α = 0.4, γ = 1/2** (68 reached cells differ):

```
irrelevant        relevant          active
a=0  .A.......    .A.......         .........
a=1  W........    .MA......         .........
a=2  W........    .MMWA....         .W.......
a=3  W..W.....    .MMMWA...         .WW......
a=4  W..OW....    .MMMMWWA.         .WWW.....
a=5  W...OWW..    .MMMMMWWA         .WWWW....
a=6  W....OWW.    .MMMMMMWW         .WWWWW...
a=7  W.....OWW    .MMMMMO.W         .WWWWWO..
a=8  W......OW    .MMMMMMO.         .WWWWW...
```

- **Matching.** When an honest block arrives with her ahead, she matches
  where SM1 overrides (relevant (2,1), (3,2), …, one ahead: your
  observation) or waits (two or more ahead).
- **Active.** After matching she keeps mining in private where SM1 would
  publish on winning the race.
- **Behind.** She also waits one or two behind, as at γ = 0.
- **One exception:** relevant (7,6) is O, not M. That is near the edge of
  the map, and I have not investigated it.

## The numbers behind "What to observe"

All at run no. 1.

**Panel A** (α 0.4, γ 0, 100,000 blocks):

| setting | her share | orphans, hers / others' | chain | longest lead |
|---|---|---|---|---|
| default | 0.4903 ± 0.0046 | 5.84 ± 0.10 / 24.01 ± 0.29 | 70.14 | 27 |
| 1,000,000 blocks | 0.4843 ± 0.0013 | 5.89 / 23.65 | 70.46 | – |
| γ = 1 | 0.5736 ± 0.0038 | 0.00 / – | 70.14 | – |
| α = 0.3 | 0.2733 ± 0.0027 | – | – | – |

- The γ = 1 row has the same chain count as the default: the same draws.
- The 1,000,000-block error is 0.28 times the 100,000-block one.

**Panel B** (60 days):

| α, γ | before | after | first adjustment | break-even |
|---|---|---|---|---|
| 0.4, 0 | 85.25% | 120.93% | 19.86 | 33.86 |
| 0.35, 0 | – | 104.72% | – | 102.62 |
| 0.33, 0 | – | 99.08% | – | never |
| 0.35, 0.5 | 89.36% | 118.87% | – | 29.12 |

- At α = 0.4 the break-even day equals T₁ + 14, within 0.0005 day. It is a
  coincidence of this α: at 0.35 the two are 70 days apart.
- Day 60 at α = 0.4: 3,771 against 3,456, path 3,741.
- Day 90 at α = 0.35: 4,506 against 4,536.

**Panel C:**
- γ 0: honest up to 0.325; 1/3 0.3370; 0.35 0.3708 against 0.3665.
- 19 and 68 differing cells.
- γ 1/2 at α 0.4: 0.5725 against 0.5256.
- γ 1 at α 0.3: 0.4286 against 0.3806.
- γ 1/4 at α 0.325: 0.3439 against 0.3436.

## The "check" items

**Confirmed:**
- **Narayanan et al., ch. 5 "Bitcoin Mining", 5.5 "Mining incentives and
  strategies".** The four decisions and their defaults, "employed by the
  Bitcoin reference client", read in the February 2016 draft.
- **Kroll, Davey and Felten (WEIS 2013).** Their abstract: "a Nash
  equilibrium in which all players behave consistently with Bitcoin's
  reference implementation, along with infinitely many equilibria in which
  they behave otherwise". The lecture adds that their model has no
  withholding, and that they explain the longest chain as a focal point.
- **Eyal and Sirer**, FC 2014, LNCS 8437, 436–454:
  - the formula (their equation 8);
  - the threshold, with "1/4 at γ = 1/2";
  - "not incentive-compatible";
  - the states 0 and 0′.
- **Difficulty:** every 2016 blocks, a two-week target, the factor clamped
  between 1/4 and 4 (Bitcoin Core). Nakamoto §4 "Proof-of-Work" (the moving
  average), §6 "Incentive", §11 "Calculations".
- **Grunspan and Pérez-Marco.** The abstract: "no strategy is more profitable
  than the honest strategy before a difficulty adjustment … an attack on the
  difficulty adjustment algorithm".
- **Sapirshtein et al.**, FC 2016, LNCS 9603 (2017), 515–532:
  - the model (Table 1, transcribed);
  - the ratio objective, solved by binary search on ρ with relative value
    iteration;
  - Table 2 (γ = 0, T = 95, with upper bounds);
  - the thresholds (above);
  - delays: "the profit threshold vanishes, and even small attackers have
    incentive to occasionally deviate" (Claim 7, a proof sketch);
  - footnote 3, on SM1's threshold: "This can partly explain why selfish
    mining attacks have not been observed".
- **Nayak et al.:** IEEE EuroS&P 2016, 305–320.

**Softened or corrected:**
- **Felten 2013:** corrected (see "Differences").
- **Grunspan and Pérez-Marco:** no publication found, cited as a preprint.
  The lecture says "showed", not "proved".
- **Sapirshtein et al.'s threshold of about 0.329** is read from their plot.
  The lecture gives it as "about 0.329" and our 0.3294 as our computation.
- **Delays:** presented as their argument ("they argue").

**The chapters cited:**
- Narayanan ch. 5 (5.5).
- Nakamoto sections 4, 6, 11.
- Papers by venue and pages.

## Timings, heights, chunks

**Browser timings** (headless Chrome, to the updated DOM; the second
frame in brackets):

| change | time |
|---|---|
| Panel A, 1,000,000 blocks | 69 ms (73) |
| Panel A, α at 1,000,000 | 64 ms (69) |
| Panel A, "Run again" | 62 ms (66) |
| Panel B, α at 90 days | 7 ms (13) |
| Panel B, "Another path" | 4 ms (15) |
| Panel C, γ | 4 ms (12) |

- A first run measured 84–101 ms for Panel A.
- Nothing slow runs at page load: Panel A's default is 100,000 blocks.

**Figure heights** (`check-module.mjs`, figure body without the caption):

| width | EN | IT |
|---|---|---|
| 1280 px | 390, 368 | 390, 388 |
| 375 px | 673, 509 | 673, 525 |

The functional check measures the whole figure, caption included: 436 and
434 at 1280.

**Chunks:**
- Module chunk 75.0 kB (25.0 kB gzip), `optimal.json` included.
- No chunk of another module changed.

## Italian terms (added to the status file's table)

- *selfish mining* kept.
- implementazione di riferimento.
- catena più lunga.
- blocco orfano (*stale* once).
- catena privata and vantaggio ("vantaggio privato" not found).
- gara.
- catena di Markov, distribuzione stazionaria.
- quota dei blocchi.
- soglia di redditività: not "profittabilità", which Treccani marks as
  modelled on the English; no source for either as a term.
- aggiustamento della difficoltà, as module 02.
- processo decisionale di Markov, politica ottima.
- *value iteration* kept ("iterazione dei valori" not found).
- troncamento.
- adopt, override, match, wait and the three fork labels kept in English,
  in italics, with glosses.
- *fair-weather mining* kept.
- The miner is masculine.

Sources in the log.

## Check results (final code, one at a time, details in the log)

- `npx vite build`: OK.
- The generator, one γ per command: OK.
- `check-game-theory-01` to `13`: all passed. Times in seconds:

  | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | 13 |
  |---|---|---|---|---|---|---|---|---|---|---|---|---|
  | 15.5 | 25.0 | 77.5 | 7.7 | 2.4 | 0.9 | 0.9 | 1.3 | 0.4 | 0.9 | 17.2 | 25.1 | 12.2 |

- `check-index`: game-theory 0/80, network 0/76, complexity 0/72.
- `check-links`: 0/131.
- `check-module` and the functional check, one module per command:

  | module | check-module | functional |
  |---|---|---|
  | 01 | 0/56 | 0/32 |
  | 02 | 0/56 | 0/49 |
  | 03 | 0/56 | 0/39 |
  | 04 | 0/56 | 0/45 |
  | 05 | 0/56 | 0/39 |
  | 06 | 0/60 | 0/41 |
  | 07 | 0/68 | 0/41 |
  | 08 | 0/56 | 0/43 |
  | 09 | 0/60 | 0/42 |
  | 10 | 0/60 | 0/36 |
  | 11 | 0/60 | 0/29 |
  | 12 | 0/56 | 0/29 |
  | 13 | 0/56 | 0/32 |

- Regression compare: 0/144.
- `npm run build`: OK.
- `npm run check:dist`: 0/108.

## For Adriano to decide

- The Italian terms without a source: quota dei blocchi, soglia di
  redditività, implementazione di riferimento. Also the four actions kept in
  English.
- Whether the lecture should name Felten's post by its title in the text
  (now only in the reading list).
- Whether Panel C should also store policy maps for γ = 1/4 and 3/4 (now
  0, 1/2 and 1, as the prompt asked).
