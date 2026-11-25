# Game Theory Lab, prompt 8: report

Module 08, "Congestion and the price of anarchy"
(`congestion-price-of-anarchy`), plus stage 0 on module 07. Module commit
6af4fff "Game Theory Lab 08: Congestion and the price of anarchy" (two WIP
commits squashed, stage 0 included, status file updated, module "ready").
This report and the working log `docs/reports/game-theory-lab-08-log.md`
are in "Game Theory Lab 08: report". Nothing pushed.

## Stage 0

Module 07, English only: chicken's moves are now "swerve" and "straight".

- Lecture: "(swerve, straight) and (straight, swerve)", "Told to go
  straight", "going straight is best", "a coin that only picks who goes
  straight".
- F2: the slider label is "d, the payoff of a crash (straight, straight)"
  and the coin is "between (straight, swerve) and (swerve, straight)". The
  cells are SS, ST, TS, TT, with the note "S = swerve, T = straight": S was
  taken, so straight is T. This is the one choice to review.
- Panel C: the action names are Swerve and Straight.
- Exercise 6: statement and solution. Observe 1 of Panel C: "goes
  straight".
- A comment in `correlated.js`.
- Checks: `check-game-theory-07.mjs` (two check names) and the module 07
  browser check (F2 slider label, cells, Panel C check name) updated. Both
  pass: 0 failures of 41 in the browser.
- The Italian (sterza, dritto) is unchanged.

## Differences from the prompt

- **Wardrop's pages:** the reading list says 325–362. That is the paper;
  325–378 includes the printed discussion.
- **The origin of the name:** the lecture says Koutsoupias and
  Papadimitriou introduced the idea "as the coordination ratio" and that
  the name came with Papadimitriou (2001). That paper (STOC 2001) is added
  to the reading list.
- **No real road case.** The only peer-reviewed candidate, Youn, Gastner
  and Jeong (PRL 2008), is a simulation on real road graphs. It calls the
  real cases anecdotes. So, as the prompt asked, none is given.
- **Italian terms changed after the sources:** "equilibrio di Wardrop"
  (not "principio"), "giochi potenziali" (not "di potenziale"), "imposta
  pigouviana", and the game called atomic or non atomic (not the players).
  "Hub" stays in Italian, as in the Network Lab.
- **Lecture headings:** six of seven are the prompt's in English. The last
  is "Next" in English and "Il prossimo modulo" in Italian, as module 07.
- **Panel B display:** costs are per driver for Braess and totals for the
  four drivers, so both cases read naturally. The four drivers' state is
  shown as d/D (direct/detour) for drivers 1–4.
- **Panel A display:** costs are total travel time; for r = 1, as in the
  exercises, total and average coincide.
- **Panel C "all equilibria" for the hub:** computed from the structure of
  the conditions (m players at the hub: who must be in, who may be). The
  self-check compares it with a brute force over all 2^k profiles for
  k = 2–10 at four values of ε, so k = 20 needs no enumeration of a
  million profiles.
- **Exact arithmetic:** Panels B and C run on exact fractions (BigInt,
  `frac.js`), so "strictly cheaper" never depends on rounding (the four
  drivers' ties are exact). Panel A and the figures use floats with
  tolerance 1e-12.

## Exercise answers

All six of the prompt's answers recomputed and confirmed, none differs:

1. 1/√3 = 0.577; 1 − 2/(3√3) = 0.615; 1.626; toll 2x² = 2/3.
2. 0.25, 0.25, 0.5; 1.75.
3. (0.75, 0.25), 0.75; (0.625, 0.375), 0.71875; 1.0435; tolls 0.625 and
   0.375. With them, both roads cost 1.25.
4. 1.9, 1.9, 1.8 (1.82); Φ 15.5 and 11, a drop of 4.5.
5. 4, 3, 2, 1; 25/12 ≈ 2.083 against 1.1; 1.894.
6. All direct 4 and all detours 10 are both equilibria; the switches leave
   3, 3, 2, 2 unchanged; 5/2.

## Self-check numbers (check-game-theory-08: 124 PASS, about 1.5 s)

**F1.** p = 1, 1.5, 2, 3, 4, 5, 6, 8, 10:

| | values |
|---|---|
| x* | 0.5000, 0.5429, 0.5774, 0.6300, 0.6687, 0.6988, 0.7230, 0.7598, 0.7868 |
| cost | 0.7500, 0.6743, 0.6151, 0.5275, 0.4650, 0.4176, 0.3803, 0.3246, 0.2847 |
| price of anarchy | 4/3, 1.4831, 1.6258, 1.8956, 2.1505, 2.3944, 2.6297, 3.0808, 3.5121 |
| toll | p/(p + 1) |

- All as the prompt.
- A grid search confirms the optimum.
- At p = 1 the averages are 0.8125, 0.75, 0.8125, 1. With the toll, time
  plus toll is 1 and the revenue 0.25.

**F2.**

| c | shares | cost |
|---|---|---|
| 0 | (0, 0, 1) | 2 |
| 0.25 | (0.25, 0.25, 0.5) | 1.75 |
| ≥ 0.5 | (0.5, 0.5, 0) | 1.5 |
| closed | (0.5, 0.5, 0) | 1.5 |

- A direct check of Wardrop's conditions agrees at every c of the slider,
  open and closed.
- A grid search finds no other split that satisfies them.
- The planner's cost is 1.5 at every c (grid search, step 0.005).

**Panel A.**
- "Pigou" gives 4/3, 1.6258, 1.8956, 2.1505, equal to F1's ratio at p = d.
- The three exact cases (a = (1, 2, 0.5) at r = 1 and 2; a = (1, 1) at
  d = 1 and 2) match the prompt to four digits. At r = 1 the exact
  fractions are 5/6, 1/6 and 17/28, 5/28, 3/14.
- 300 random instances satisfy Wardrop's conditions within 1e-9, and the
  optimum is locally optimal.
- In all 36 × 1,000 instances the ratio never exceeds the bound (largest
  margin −0.037) and the doubled-demand check held.

**Panel B.**
- Everything as the prompt: n = 10 at c = 0, 1/4 and 1/2; the dynamics
  from both starts; n = 2, 3, 4, 20; n = 20 at c = 1/4; even n without the
  shortcut; the four drivers.
- Every switch's gain equals the drop of Φ at every c of the slider, open
  and closed, from every start and seeds 1–10.
- The equilibria by counts equal the engine's over all 729 profiles at
  n = 6.

**Panel C.**
- H_k, the hub's orders for k = 3, 4, 5, 10, 20, the ratios, ε = 0.01 and
  the two-road equilibria: as the prompt.
- Φ = Σ c_e H(n_e) equals Rosenthal's sum.
- The H_k bound on the best equilibrium is verified by brute force for
  k = 2–12.

**"Expected" values that differ (the lab's generator, seed 1):**
- The 1,000-instance surveys, n = 3, r = 1:

  | d | mean | largest | above 1.05 | prompt |
  |---|---|---|---|---|
  | 1 | 1.036 | 1.289 | 0.27 | 1.038, 1.250, 0.29 |
  | 2 | 1.102 | 1.588 | 0.55 | 1.097, 1.536, 0.54 |
  | 4 | 1.245 | 2.110 | 0.72 | 1.236, 2.091, 0.70 |

  Over seeds 1–10:

  | d | mean | largest | above 1.05 |
  |---|---|---|---|
  | 1 | 1.033–1.040 | 1.241–1.289 | 0.25–0.30 |
  | 2 | 1.092–1.109 | 1.493–1.588 | 0.52–0.58 |
  | 4 | 1.223–1.261 | 2.028–2.129 | 0.70–0.74 |

  The prompt's values all lie inside these ranges. Seed 1 is kept, as the
  working rule on seeds says.
- The four drivers' random starts, seeds 1–10: nine end at all direct.
  Seed 10 draws all detours (1111), an equilibrium, so nothing moves. The
  self-check asserts only that every random start ends at an equilibrium.

## Numbers behind "What to observe"

**Panel A:**
- Instance no. 1 (n = 3, d = 1, r = 1): (0.7814, 0, 0.2186) at 0.4928, and
  (0.6942, 0, 0.3058) at 0.4806. Ratio 1.0253; with demand 2 the optimum
  costs 1.6170.
- Pigou: 1.3333 (d = 1), 2.1505 (d = 4).
- Surveys:

  | setting | mean | largest | above 1.05 |
  |---|---|---|---|
  | d = 1 | 1.036 | 1.289 | 0.27 |
  | d = 4 | 1.245 | 2.110 | 0.72 |
  | d = 4, r = 0.1 | 1.000 | | |
  | d = 4, r = 5 | 1.007 | 1.382 | 0.02 |
  | n = 10, d = 1 | 1.046 | 1.212 | |

**Panel B:**

| setting | switches | end | cost per driver |
|---|---|---|---|
| c = 0, from all upper | 9 (gains 0.9 … 0.1 = drops of Φ; Φ 15.5 → 11) | (1, 1, 8) | 1.82 |
| c = 0.25 | 7 | (3, 3, 4) | 1.68 (both prices 1.12) |
| c = 0.5 | | | 1.5 |
| closed | 5 | (5, 5, 0) | 1.5 |
| n = 40 | 39 | (1, 1, 38) | 1.9512 (price of stability 1.3008) |

- At c = 0, n = 10: optimum 1.5, best 1.82, worst 2; prices 1.3333 and
  1.2133.
- Four drivers: 10 against 4 (2.5). Random start no. 1 (1011, total 11):
  drivers 1, 3, 4 switch, ending at all direct, 4.

**Panel C:**
- Hub, k = 10, ε = 0.1: order 10 … 1, first gain 0.0100, Φ 3.2219 →
  2.9290, cost H_10 = 2.9290, ratio 2.6627.
- ε = 0.01: 2.9000.
- k = 20: 19, 20, 17, 18, … ratio 3.2707.
- ε = 0.5: order 7, 8, 9, 10, 5, 6, 3, 4, 2, 1; ratio 1.9526.
- Two roads, k = 10: equilibria 1.1 and 10, worst/optimum 9.0909.

## References: confirmed and softened

Checked in November 2026 through Crossref, the papers' abstracts and the
publishers' pages; details in the log.

- **Pigou (1920):** confirmed. The two-road model is in the first edition
  (McDonald, JHET 2013).
- **The name "price of anarchy":** softened. Koutsoupias and Papadimitriou
  (1999) called the ratio the "coordination ratio". Their 2009 journal
  version credits the name to Papadimitriou (STOC 2001), now cited.
- **Wardrop (1952):** confirmed; pages corrected to 325–362. "Equilibrio di
  Wardrop" is used in Italian.
- **Beckmann, McGuire and Winsten (1956), the potential and the
  marginal-cost toll:** confirmed from secondary sources only (Nagurney;
  Boyce and Nagurney). The book itself was not seen.
- **Braess (1968):** confirmed, Unternehmensforschung 12, 258–268.
- **Cohen and Horowitz (1991):** confirmed, Nature 352, 699–701.
- **Real case:** none found in a peer-reviewed study; left out.
- **Roughgarden and Tardos (2002):** confirmed from the abstract: 4/3 for
  linear latencies, and the doubled-traffic bound.
- **Roughgarden (2003):** confirmed, the worst case on two nodes and two
  links. The values come from the closed form, computed by the check.
- **Rosenthal (1973)** and **Monderer and Shapley (1996), the name
  "potential games":** confirmed.
- **The 5/2 bound:** confirmed in both abstracts (Awerbuch, Azar and
  Epstein, "exactly 2.5 for unweighted demand"; Christodoulou and
  Koutsoupias, "5/2").
- **Fabrikant, Papadimitriou and Talwar (2004):** confirmed (PLS-complete;
  exponentially long improvement paths). The lecture says best responses
  "can need" exponentially many steps.
- **Anshelevich et al. (2004/2008):** confirmed. The H(k) bound is tight
  for directed graphs, and the price of anarchy is Θ(k).
- **Chapters and lectures:** confirmed.
  - Roughgarden: lectures 11 "Selfish Routing and the Price of Anarchy",
    12 "Over-Provisioning and Atomic Selfish Routing", 13 "Equilibria:
    Definitions, Examples, and Existence", 15 "Best-Case and Strong Nash
    Equilibria", 16 "Best-Response Dynamics".
  - Nisan et al.: chapters 17–19, titles as cited.
  - Shoham and Leyton-Brown: section 6.4 "Congestion games".

## Timings in the browser (1280 px, Chrome)

| action | time |
|---|---|
| F2 slider move to readout | 6 ms |
| Panel A, 1,000 instances (click to histogram) | 7–8 ms (32 ms call to result) |
| Panel B, "To the end" at n = 40 (39 switches) | 12 ms |
| Panel C, "To the end" at k = 20 | 9 ms |

Nothing heavy runs when the page loads.

## Figure heights and chunk size

- F1: 346 px at 1280 (EN and IT); 447 px at 375. Its chart was lowered
  after the screenshots; first version 432.
- F2: 426 px at 1280 (442 IT); 633 px at 375.
- Module chunk: 86.2 kB (29.1 kB gzip). It shares only the Network Lab's
  `ui.jsx` and `charts.jsx` chunks.

## Italian terms for module 08

Recorded in the status file's table, with sources in the log:

- prezzo dell'anarchia; prezzo della stabilità
- equilibrio di Wardrop; l'esempio di Pigou; paradosso di Braess
- instradamento egoistico
- flusso; costo marginale
- pedaggio; imposta pigouviana; esternalità
- gioco di congestione; gioco potenziale; funzione potenziale
- dinamica di miglior risposta, as in module 02 (not found verbatim)
- gioco atomico / non atomico
- gioco di condivisione dei costi
- numero armonico
- *hub*, kept
- scorciatoia; percorso in alto / in basso / a zigzag; automobilista;
  pianificatore

## Checks (final code, before the squash; all in the foreground)

| check | result |
|---|---|
| `npx vite build` | built |
| `check-game-theory-01` … `08` | all checks passed |
| `check-index` game-theory | 0 failures of 80 |
| `check-index` network | 0 of 76 |
| `check-index` complexity | 0 of 72 |
| `check-links` | 0 of 131 |
| `check-module`, modules 01–05 | 0 of 56 each |
| `check-module`, module 06 | 0 of 60 |
| `check-module`, module 07 | 0 of 68 |
| `check-module`, module 08 | 0 of 56 |
| `modules/game-theory-congestion-price-of-anarchy.mjs` | 0 of 43 |
| `modules/game-theory-evolution-and-learning.mjs` | 0 of 41 |
| regression compare against main | 0 of 144 |
| `npm run build` | built |
| `npm run check:dist` | 0 of 108 |
