# Network Lab, prompt 9 — Module 09 "Communities"

Branch `network-lab`, local commits only, nothing pushed. The prompt is
`prompts.local/network-lab-09.md` (git-ignored, not edited). Before starting:
the tree was clean, the status file showed modules 01–08 done and nothing in
progress, and `docs/reports/network-lab-08.md` was committed.

## Commits

- `1fcea87` Network Lab 09: Communities (three WIP checkpoints squashed; status file updated)
- this report, in its own commit: "Network Lab 09: report"

## What was built

- `src/components/lab/network/communities/`
  - `community.js` — pure logic: Q and Q_γ with the two terms (inside,
    expected), the direct sum over pairs (A_ij − k_i k_j/2L) for checks;
    Louvain (random order from the seed, moves while Q_γ rises, aggregation
    into weighted nodes with self-loop weights, repeated; returns the
    top-level partition; an `onMove` hook for the checks); label propagation
    (random order, random tie-breaks, stops when every node holds a most
    frequent label around it); NMI as in Danon et al. (2005); the
    Girvan–Newman benchmark (pair by pair); G(n, M); a sparse two-group block
    model whose cost is proportional to the links; overlap; the ring of
    cliques with closed forms, the γ range and a clique report; spectral
    bisection by power iteration on B + cI, with B x = A x − k(k·x)/2L, never
    a dense matrix, as a progressive job.
  - `experiments.js` (panels and checks), `figures.js` (F1 network, exhaustive
    best two-group split, F2 curve, ring drawing), `palette.js`.
  - `FigureSplit.jsx` (F1), `FigureRing.jsx` (F2), `FindPanel.jsx` (A),
    `ResolutionPanel.jsx` (B), `DetectPanel.jsx` (C), `texts.js`, `index.js`.
- `src/content/network-lab/communities.en.md` / `.it.md` — DRAFT marker,
  EN 1,679 words, IT 1,700 (with markup, up to the simulation marker). No
  Bitcoin box. Links to modules 02, 03, 05 and 10.
- `scripts/lab/check-network-09.mjs` — 71 checks, 0 failures (about a minute).
- `scripts/lab/browser-checks/modules/network-communities.mjs` — 29 checks,
  0 failures; `expect.json` has module 09 (2 figures, 3 panels, 6 exercises).
- `network-modules.json`: `communities` is `ready`.

Karate data: `src/data/lab/networks/karate-club.json`, the file module 03
uses (NetworkX, unweighted, 78 links). Member assignment: `mrHi` in that
file, which is NetworkX's "club" attribute: 17 members with Mr. Hi (members
1–9, 11–14, 17, 18, 20, 22) and 17 with the officer. The panel imports the
JSON, Node reads it; both go through `karateFrom` in `experiments.js`. Since
modules 03 and 09 now share it, Vite puts it in a small chunk of its own
(`karate-club-*.js`), loaded only when unlocked. No shared lab code changed,
so the regression compare against main was not needed.

Timings in headless Chrome: Panel C's page-load network (4,000 nodes,
spectral and Louvain) 0.4 s; "Sweep k_out" 0.3 s; "Random networks" 0.2 s;
Panel C "Sweep" 15.2 s (on a button, with progress). The heaviest slider
setting of Panel C (N = 10,000, c̄ = 20) takes about 1.3 s in Node, run as a
progressive job.

## Differences from the spec

- **Panel C convention.** The prompt says "c_in links per node inside and
  c_out across" and then c̄ = 3 with c_in = 4.5, c_out = 1.5. Those numbers
  only fit Decelle et al.'s convention c_in = N p_in, where a node has
  c_in/2 links inside and c_out/2 across, and c̄ = (c_in + c_out)/2. The
  lecture, panel and Exercise 3 use that convention and say so (a node has
  2.25 links inside and 0.75 across; 75% inside).
- **The Brandes optimum** was softened (see "check" figures).
- **Louvain against label propagation**: not "at least" on every network.
  On 1 of 20 random networks label propagation scores 0.492 against
  Louvain's 0.490. Reported; the check now asks that Louvain is never more
  than 0.01 below (largest shortfall 0.0021), and prints the count.
- **Ring of cliques, even n only** (F2 6–40 step 2, Panel B 4–60 step 2), so
  that "pairs" is always a full pairing.
- **γ range** in Panel B: the analytic range in which "each clique a group"
  beats merging any run of neighbouring cliques (γ > 2L/d²) and splitting one
  clique in two (minimum over splits, checked against a brute force over every
  subset of one clique). It is not a proof that the clique partition is the
  global optimum of Q_γ inside it; the panel says so and also shows what
  Louvain finds.
- **Panel C multiple** is clamped at √c̄ (where c_out = 0); at c̄ = 3 that is
  1.73, and the panel says so.
- **Spectral bisection** stops after 4,000 power iterations. Below the
  threshold it rarely settles (the panel shows "not settled"); I checked at
  1.0 and 1.2 times the threshold that 4,000 and 20,000 iterations give
  overlaps within 0.03 of each other on all six networks.
- **Panel A**, random source: the "planted" partition is the four blocks of
  32, labelled as meaningless there; it shows Q −0.011 against Louvain's
  0.204.
- **F1** opens with two nodes on the wrong side (Q 0.235); "Show the best
  split" gives 0.411 (exhaustive over the 32,768 two-group splits).

## "Check" figures in the lecture

- **Girvan–Newman on the karate club, all but one member** — confirmed
  (arXiv cond-mat/0112110: "Only one node, node 3, is classified
  incorrectly"). The lecture says "with a single member misclassified".
- **Brandes et al. (2008), four groups with Q = 0.4198, proved optimal** —
  not confirmed: the arXiv version (physics/0608255) proves NP-completeness
  and does not mention the karate club; the TKDE version could not be read.
  Softened: the lecture says "the best partition known has four groups and
  Q = 0.4198", and Exercise 4 "the value reported in the literature as the
  maximum". Brandes et al. are cited only for NP-hardness. Our Louvain
  reaches 0.4198 on 18 of 100 seeds and never more.
- **Leiden repairs disconnected groups (Traag et al. 2019)** — confirmed,
  with numbers: "up to 25% of the communities are badly connected and up to
  16% are disconnected". The lecture quotes them as shares of the groups.
- **Decelle et al., the form for q groups** — partly confirmed: the mean
  degree c = (c_in + (q − 1)c_out)/q is in the paper; the condition
  |c_in − c_out| > q√c (their Eq. 44) came from a summary of the part of the
  page that could not be read verbatim. The lecture states "for q equal
  groups the condition reads c_in − c_out > q√c̄" and does not go into the
  hard region for q ≥ 5.
- **Zachary 1970–1972** (opening sentence) — from memory of the paper's
  period of observation, not re-checked. Worth a look in review.

## The "expected" values

| Check | Expected (yours) | Got |
|---|---|---|
| Exercise 1 | 5/14, 0, −34/196 | exact |
| Karate best over 100 seeds | 0.4198 | 0.4198 (18 seeds; mean 0.4163, worst 0.3920) |
| Karate factions | 0.3582 | 0.3582 |
| Ring n = 30, s = 5 | 0.8758, 0.8879 | same |
| Ring n = 20 | 0.8591 vs 0.8545 | same |
| Ring n = 24 | 0.8712 vs 0.8674 | same |
| Benchmark Louvain NMI at k_out 2, 4, 6 | 1.00, 1.00, 0.96 | 1.00, 1.00, **0.98** |
| Benchmark at k_out 7, 8, 9 | 0.80, 0.49, 0.21 | **0.79, 0.45, 0.22** |
| Random networks Louvain Q, ⟨k⟩ 4, 8, 16 | 0.52, 0.32, 0.22 | 0.522, 0.325, **0.226** (mean of 5) |
| Spectral 0.6× / 2× | 0.02 / 0.93 | 0.023 / 0.928 |
| Spectral sweep 0.6–2.0 | 0.02, 0.07, 0.14, 0.18, 0.72, 0.93 | 0.02, **0.01, 0.12, 0.46**, 0.71, 0.93 |
| c̄ = 3, N = 10,000, Louvain | ~600 groups, Q ≈ 0.65, NMI < 0.1 | 556–576 groups, Q 0.64–0.65, NMI 0.02, 0.02, 0.10 |

The largest difference is at 1.2 times the threshold, 0.46 against your 0.18.
On three further networks at 1.2× the overlaps were 0.46, 0.45 and 0.47 after
20,000 iterations, so with this generator it is not an iteration artefact;
near the threshold the result depends on the network and on how the method
competes with eigenvectors localised on high-degree nodes. The texts quote my
numbers and say the sharp limit is blurred. All seeds are the defaults
(sequential); none was chosen to make a check pass.

## Exercise answers

1. 5/14 ≈ 0.357; 0; −34/196 ≈ −0.173. Same as yours.
2. Derivation as in your hint; pairs win iff n > s(s − 1) + 2; n = 30, s = 5:
   0.8758 and 0.8879. Same.
3. 2√3 ≈ 3.46; c_in − c_out = 3, not detectable; 75% inside; c̄ = 10:
   c_in > 13.16. Same, with the convention made explicit.
4. Factions 0.3582 (NetworkX "club", unweighted); best 0.4198 with groups of
   12, 11, 6 and 5. The answer notes that published faction values differ
   with the version of the data (weighted matrix, one member placed
   differently) without quoting a number I could not check.
5. Louvain NMI 0.98, 0.79, 0.45, 0.22 at k_out = 6–9; below 0.5 at k_out = 8
   (μ = 0.5). Label propagation below 0.5 already at k_out = 6 (μ = 0.375,
   0.43), one label from k_out = 7. Random Q 0.52, 0.32, 0.23 — differs from
   your 0.22 in the last digit.
6. 0.02, 0.01, 0.12, 0.46, 0.71, 0.93 at 0.6–2.0×; differs from yours at
   0.8, 1.0 and 1.2 (see above). Louvain at c̄ = 3: 550–580 groups, Q ≈ 0.65,
   NMI ≤ 0.10.

## Numbers behind each "What to observe"

- **A, Find the groups**: default (benchmark, k_out = 6, Louvain seed 1)
  planted Q 0.389, found 0.391, 4 groups, NMI 0.925. Sweep (20 networks):
  Louvain 1.000 to k_out 4, 0.996, 0.975, 0.793, 0.448, 0.217, 0.132, 0.074,
  0.049; label propagation 1.000, 1.000, 1.000, 0.993, 0.920, 0.768, 0.427,
  then 0.000–0.007. Random networks Q 0.522, 0.325, 0.226 with 38.6, 14.6, 9.0
  groups. Panel's random network: Louvain 0.204 in 7 groups, blocks −0.011,
  label propagation one group. Karate: factions 0.358, Louvain seed 1 4
  groups Q 0.419 NMI 0.490; label propagation over 100 seeds mean 0.334, best
  0.416, one group in 5 runs.
- **B, The resolution limit**: n = 30, s = 5: 0.8758 / 0.8879; Louvain 16
  groups (14 pairs, 2 alone), Q 0.8871; γ range 1.36–31.1; Louvain merges at
  γ = 0.5–1.2, 30 cliques at 1.5–20, 90 groups (all split) at 40; for every
  even n ≤ 22 one group per clique. n = 60, s = 3: 0.7333 / 0.8417, Louvain
  0.8678 with 14 groups.
- **C, Can they be found?**: default c_in 14.74, c_out 5.26, 73.7% inside,
  overlap 0.725 (1,098 iterations), Louvain 12 groups Q 0.281 NMI 0.021.
  Sweep (c̄ = 10, N = 4,000, 3 networks): 0.015, 0.014, 0.016, 0.023, 0.013,
  0.120, 0.463, 0.710, 0.928, 0.987, 1.000 at 0–3×. c̄ = 3, N = 10,000 at
  0.6, 1, 1.5×: 576, 556, 574 groups, Q 0.637, 0.651, 0.654, NMI 0.018,
  0.021, 0.099.

## Italian terms

community = comunità; modularity = modularità; resolution limit = limite di
risoluzione; stochastic block model = modello a blocchi stocastico;
detectability threshold = soglia di rilevabilità; benchmark = benchmark;
label propagation = propagazione delle etichette; normalised mutual
information = informazione mutua normalizzata (NMI). Also: clique = cricca,
overlap = sovrapposizione, planted groups = gruppi impiantati, degree-corrected
= corretta per il grado, resolution parameter = parametro di risoluzione.

## Check results

- `npx vite build`: built, no errors (the usual chunk-size warning for the
  site bundle and the Complexity Lab chunk).
- `check-network-01` … `09`: all 0 failures (01–04 "All checks passed").
- `check-index.mjs network`: 0 of 72; `check-index.mjs complexity`: 0 of 64.
- `check-links.mjs`: the first run ended with a Node crash trace; rerun alone:
  0 failures of 80.
- `check-module.mjs network <slug>`, all nine modules: 0 failures (62, 62, 56,
  60, 58, 60, 58, 60, 62 checks). A chained run of all nine in one command
  passed 01–04 and then crashed Node on 05–09 (low memory on this PC); it
  also overran the 10-minute limit and was moved to the background by the
  harness, against the rule of the prompt. Each was then rerun alone in the
  foreground and passed. Modules 06–09 were rerun as four separate commands
  issued together, which may have run at the same time; they all passed.
- Functional checks `modules/network-*.mjs`, 01–09, each alone: 0 failures
  (25, 29, 40, 50, 58, 26, 26, 24, 29 checks).
- Module 09 figure heights at 375 px: 430/468 (F1, EN/IT) and 552 px (F2,
  reduced from 610); module 08's were 389 and 491.
- Regression compare: not run, no shared code changed.
