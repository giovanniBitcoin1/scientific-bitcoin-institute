# Network Lab — report on prompt 12

One correction to the Complexity Lab, then module 12 "Epidemics on networks"
(`/network-lab/epidemics-on-networks`). Branch `network-lab`, nothing pushed.

## Commits

| Commit | What |
|---|---|
| `dcc8949` | Complexity Lab 04: default connection limit |
| `f5c7834` | Network Lab 12: Epidemics on networks (three WIP checkpoints squashed; status file and README of the browser checks updated) |
| this commit | Network Lab 12: report |

Preconditions held at the start: clean tree, modules 01–11 done, nothing in
progress, `docs/reports/network-lab-11.md` committed.

## Stage 0 — the connection limit

- **Confirmed in the release notes of 32.0** (`doc/release-notes.md` at the tag
  `v32.0`, section "P2P and network changes"): the default maximum number of
  automatic peer connections (`-maxconnections`) "has increased from 125 to
  200", PR #28463; the number of outbound connections is unchanged. The source
  agrees: `DEFAULT_MAX_PEER_CONNECTIONS` is 125 in `net.h` at `v31.0` and 200
  at `v32.0`. (The page `bitcoincore.org/en/releases/32.0/` answered 404; the
  notes were read from the repository.)
- **Changed**, only these words, in `src/content/lab/scale-free.en.md` and
  `scale-free.it.md`: "(125 by default)" → "(200 by default since version
  32.0; 125 before)"; "(125 per impostazione predefinita)" → "(200 per
  impostazione predefinita dalla versione 32.0; prima 125)".
- **Where else the statement appeared: nowhere.** I searched the lectures of
  both labs, the `texts.js` files, the sims and `public/accademia` for 125,
  for "maxconnections" and for every sentence with "connections" /
  "connessioni" and a number. The other texts quote only the 8 + 2 outbound
  connections (Complexity Lab 05, Network Lab 01 and 11), which are still
  right. `public/accademia` does not mention the limit.
- **Checks:** `npx vite build`; `node check-module.mjs complexity scale-free`
  (0 failures of 38); `node check-index.mjs complexity` later, with the rest
  (0 of 64). No regression compare: against main that page now differs by
  exactly this sentence, on purpose.

## Module 12 — what was built

`src/components/lab/network/epidemics-on-networks/`:

- `epidemic.js` — T_c, R0, g_c and the SIS line from the degree moments;
  S = 1 − e^(−RS); the generating functions of any list of degrees, as a
  family for module 05's `solveU`; u, w, 1 − w^k and 1 − G0(w) at a
  transmissibility T; bond percolation by union–find, with an optional mask of
  immune nodes; one SIR outbreak from a seed; SI/SIR in discrete steps with d
  infectious steps; SIS in discrete steps; a square lattice; the log-log
  slope; acquaintance immunisation.
- `experiments.js` — the jobs of the three panels. `figures.js` — the network
  of F1 and the three curves of F2.
- `FigureSeed.jsx` (F1), `FigureGrowth.jsx` (F2), `ThresholdPanel.jsx` (A),
  `HubsFirstPanel.jsx` (B), `VaccinatePanel.jsx` (C), `texts.js`, `index.js`.
- `src/content/network-lab/epidemics-on-networks.en.md` / `.it.md`: 1,480 and
  1,503 words (with markup, up to the simulation marker), DRAFT marker, one
  box (168 and 174 words), two live figures, 17 references.
- `scripts/lab/check-network-12.mjs` (115 checks) and
  `scripts/lab/browser-checks/modules/network-epidemics-on-networks.mjs`
  (37 checks); `expect.json`; `status: "ready"` in `network-modules.json`.
- `scripts/lab/browser-checks/README.md`: the run commands for every module
  (index, links, twelve page checks, twelve functional checks) and the rule
  "one command at a time, in the foreground", with the reason.

Reused, unchanged: module 05's `solveU` (generating functions), module 08's
`makeSource`, `randomOrder`, `attackOrder` (sources and removal orders),
module 11's `seedOf`, `moments`, `largestComponent`, module 02's `spreadSI`
(the SI runs of Panel B and of F2 are that function; the module's own
`spread`, which adds recovery, is checked to be identical to it, node for
node, when there is no recovery). No shared code changed, so no regression
compare. No recharts; everything is SVG. Vite puts `genfun.js`, `friends.js`,
`robust.js` and `mixing.js` in small chunks of their own, fetched only when
unlocked (the locked page check confirms that nothing is requested).

## What differs from the spec

1. **Panel A, "the same mean degree".** The random network and preferential
   attachment have ⟨k⟩ = 4. The power-law configuration model starts at
   k_min = 2 (as in module 11), so its mean degree follows from γ and from the
   network drawn: 4.35 at γ = 2.5 with 10,000 nodes. The panel says so.
2. **Panel A, theory.** The curve from the generating functions is drawn for
   the random network and the power law, from the degrees of the network
   itself (not from the ideal Poisson or power law). For preferential
   attachment there is the T_c of the formula but no curve and no 1 − w^k
   line: it is not a configuration model.
3. **Panel A, T_c against N.** One network per size does not show the
   threshold falling: the power law of the panel gives 0.026, 0.035, 0.011 at
   1,000, 10,000 and 20,000 nodes, because ⟨k²⟩ of one heavy-tailed network
   depends on its largest hub. The lecture therefore quotes means over 20
   networks (below), and the "What to observe" says why the panel's own three
   values are out of order.
4. **Panel A, SIS** runs on a button (3 to 5 s at 10,000 nodes), with μ = 0.2,
   everyone infected at the start, 400 steps of which the last 150 are
   averaged, β/μ = 0 … 0.5 in steps of 0.02. The note under it says what a
   finite network can show (a threshold lower with hubs, close to ⟨k⟩/⟨k²⟩)
   and what it cannot (a threshold of zero; and that extinction is final).
5. **Panel B.** SI or SIR chosen with a switch; β from 0.05 to 0.5, d from 1
   to 10, defaults 0.2 and 4. Seeds on the two networks are random nodes of
   the largest component; on the lattice every run starts from the centre.
   For SIR only the runs that pass 1% of N are averaged, and the panel says
   how many they were. The mean degree of the newly infected is shown for the
   steps with at least 20 newly infected nodes over the 20 runs.
6. **Panel C** averages 5 runs per point (your numbers were means of 3), each
   run with its own choice of whom to immunise; g goes from 0 to 0.9.
   Acquaintance immunisation is capped at 400 draws per node (it reaches the
   90% asked of it).
7. **F2, the ladder.** Each group fills as an S-curve in the logarithm of
   time, m/(1 + (t_k/t)^12). My first version used a logistic in plain time
   with a width proportional to t_k: its tail at early times does not vanish,
   and since later groups are a^k times larger they swamped the sum (fitted
   slope 0). With the S-curve in log time the fitted slope is ln a/ln b to
   0.001.
8. **F1** is 380 px tall at 1280 px (the guideline is about 340) and about
   600 px at 375 px, where drawing and histogram stack.
9. **Lattice slope.** You asked 2.0 ± 0.15. On 100 × 100 a single run gives
   1.99 to 2.24 over eleven seeds (mean 2.14): the front takes some steps to
   form, so the curve is (t − t₀)², steeper than t² on log-log axes. Applying
   the rule on limits: the code is right (on 300 × 300 the mean is 2.075 and
   all ten runs are within 0.15), so the check holds one run on 100 × 100 to
   ±0.25, and keeps ±0.15 for the mean of the panel's 20 runs (2.130), for
   F2's lattice (2.143) and for every run on 300 × 300. The panel's text says
   "a little above 2, because the front takes some steps to form".
10. **Exercise types:** three on paper (1, 2, 4), two on paper and in the
    page (3, 5), one in the simulation (6).

## Exercises — answers recomputed

All agree with yours.

| | Yours | Recomputed |
|---|---|---|
| 1 | 0.25 and 1.2; 0.0417 and 7.2 | 0.25, 1.2; 0.0417, 7.2 |
| 2 | 0.314, 0.797, 0.940 | 0.3137, 0.7968, 0.9405 |
| 3 | u = 0.2032, w = 0.6016; 0.398, 0.869, 0.994 | 0.2032, 0.6016; 0.3984, 0.8690, 0.9938 |
| 4 | 0.667; 0.5; 0.917 | 0.6667, 0.5000, 0.9167 |
| 5 | 3; 2; the area inside the front | 3 and 2 (fitted on the ladder: 2.999 and 1.999) |
| 6 | see below | see below |

Exercise 6, T = 0.5, N = 10,000, g = 5, 10, 20, 30, 50% (mine: mean of 5 runs;
yours in brackets):

| | At random | By degree | Acquaintance |
|---|---|---|---|
| Random network | 0.728, 0.655, 0.511, 0.346, 0.023 (0.73, 0.66, 0.52, 0.36, 0.02) | 0.644, 0.444, 0.012, 0.003, 0.001 (0.64, 0.46, 0.01, 0.00, 0.00) | 0.705, 0.623, 0.435, 0.204, 0.004 (0.72, 0.62, 0.43, 0.20, 0.00) |
| Preferential attachment | 0.711, 0.638, 0.500, 0.377, 0.149 (0.71, 0.64, 0.51, 0.38, 0.17) | 0.074, 0.004, 0.001, 0.000, 0.000 (0.05, 0.00, …) | 0.574, 0.388, 0.023, 0.004, 0.001 (0.58, 0.39, 0.03, 0.00, 0.00) |

Every value is within 0.05 of yours (the largest differences: 0.024 for
preferential attachment by degree at 5%, 0.021 at random at 50%). Where you
have 0.00 I have 0.001 to 0.004: with nothing large left, the largest
component is a few dozen nodes, not zero.

Exercise 3 in the panel: with 1,000 random seeds only 64 have one link, and
16 of them (0.25) started a large outbreak, against 0.398 from the formula;
201 have four links (0.86 against 0.869); 5 have ten. The solution says so,
and quotes the self-check with 1,000 seeds per degree (0.394 and 0.863).

## Self-checks (`check-network-12.mjs`, 115 checks, 0 failures, about 1.5 min)

"Expected" values: all met, except the lattice limit for a single run (point
9 above).

- **Percolation SIR, random network, N = 10,000, mean of 3 runs**, T = 0.25,
  0.3, 0.4, 0.5: 0.040, 0.307, 0.642, 0.792 (yours 0.04, 0.30, 0.64, 0.79);
  1 − G0(w) = 0, 0.314, 0.642, 0.797. Ten other networks: largest gap from the
  theory 0.046, 0.009, 0.007 at T = 0.3, 0.4, 0.5 (limits 0.05, 0.03, 0.03
  hold); at the threshold, T = 0.25, the share runs from 0.022 to 0.073.
- **Preferential attachment, m = 2:** ⟨k²⟩ = 57.03, T_c = 0.0754 (yours about
  0.07; ten other networks 0.057 to 0.084). T = 0.15 … 0.5: 0.070, 0.192,
  0.311, 0.430, 0.633, 0.770 (yours 0.08, 0.18, 0.31, 0.44, 0.63, 0.77).
- **Power law γ = 2.5, k_min = 2:** ⟨k⟩ = 4.345, ⟨k²⟩ = 127.6, T_c = 0.0352;
  measured 0.174, 0.272, 0.365, 0.456, 0.610, 0.738 against 0.175, 0.269,
  0.362, 0.450, 0.607, 0.736 from its own generating functions.
- **Union–find against a direct search** of the kept links, with and without
  immune nodes, on 30 small networks: identical.
- **Seeds, k = 1 … 8, 1,000 trials each, "large" = more than 1% of N:**
  0.394, 0.611, 0.793, 0.863, 0.935, 0.951, 0.973, 0.979 against 1 − w^k =
  0.398, 0.638, 0.782, 0.869, 0.921, 0.953, 0.971, 0.983; largest gap 0.027,
  and 0.026 over ten other networks (limit 0.05).
- **Time-stepped SIR against percolation**, β = 0.2, d = 4, T = 0.5904, 2,000
  outbreaks each from the same seeds: share of large outbreaks 0.887
  time-stepped and 0.869 by percolation (the standard error of the difference
  is about 0.011; limit set at three of them, 0.035); mean size of the large
  ones 0.871 and 0.871; theory 0.873 for both. Ten other networks, 1,000
  outbreaks each: largest difference 0.022 in the share, 0.000 in the size.
- **Immunisation at T = 0.5:** the table above; g_c = 0.499 from the moments
  of the network (0.5 exactly from ⟨k⟩ = 4, ⟨k²⟩ = 20). Ten other networks,
  3 runs each: every value within 0.05 of yours **except near a threshold**:
  preferential attachment by degree at g = 5% runs from 0.041 to 0.102
  (yours 0.05). Next widest: acquaintance at 20% on preferential attachment,
  0.019 to 0.063 (yours 0.03). The first 500 nodes immunised by acquaintance
  on the random network have mean degree 4.86, against ⟨k²⟩/⟨k⟩ = 4.99.
- **Lattice SI:** point 9 above.
- **T_c against N, mean of 20 networks** (N = 1,000, 10,000, 100,000):
  preferential attachment 0.100, 0.073, 0.060; power law γ = 2.5 0.069,
  0.024, 0.012 (single networks from 0.002 to 0.153); random 0.251, 0.250,
  0.250.
- **Exercise 5:** fitted slope of the ladder over 20 rungs within 0.02 of
  ln a/ln b for six settings, including the extremes of the sliders.
- **Page:** 27 "quoted on the page" checks pin every number of the lecture,
  the three lists and the exercises; the two languages carry the same
  numbers; word counts; one box; no word on the price in the box; the course
  is never called free (tested on everything before the reading list, which
  holds two paper titles with "scale-free").

## The numbers behind each "What to observe"

**Panel A** (10,000 nodes, default T = 0.5)

- Random network: ⟨k²⟩ 19.98, T_c 0.250; largest component 0.008 at T = 0.2,
  0.319 at 0.3 (theory 0.313), 0.796 at 0.5 (0.797).
- Preferential attachment: ⟨k²⟩ 57.03, T_c 0.075; 0.188 at T = 0.2, 0.776 at
  0.5.
- Power law: ⟨k²⟩ 127.62, T_c 0.035; 0.086 at T = 0.1 (theory 0.086); T_c at
  1,000 / 10,000 / 20,000 nodes 0.026 / 0.035 / 0.011.
- 1,000 seeds, random network: 0.801 large (theory 0.797), mean size 0.796;
  the others 1.68 nodes on average, at most 10. By degree: 0.25 (64 seeds),
  0.68 (132), 0.80 (212), 0.86 (201), 0.91 (155), 0.96 (108), 1.00 from 7.
- SIS, prevalence above 1% from β/μ = 0.24 / 0.10 / 0.06 on random /
  preferential attachment / power law; ⟨k⟩/⟨k²⟩ = 0.200 / 0.070 / 0.034.

**Panel B** (β = 0.2)

- SI, steps to 1%, 10%, 50%: preferential attachment 7.3, 9.8, 13.0; random
  10.3, 15.5, 20.0; lattice 19.3, 54.8, 116.3. Lattice slope 2.13.
- Mean degree of the newly infected, preferential attachment: 11.7, 14.0,
  7.6, 4.8, 2.7 at steps 1, 2, 5, 10, 20. Random network: 4.6 to 5.0 over the
  first ten steps (⟨k²⟩/⟨k⟩ = 5.00), 4.3 at step 20. Lattice: 4.0 until the
  edge is reached.
- SIR, d = 4, T = 0.590: 17, 18, 19 large runs of 20; 50% after 21.4, 13.9,
  136.4 steps.
- SIR, β = 0.10, T = 0.344: 13, 7 and 0 large runs.

**Panel C** (T = 0.5)

- Random network: 0.800 with nobody immune; at g = 0.20, 0.511 / 0.435 /
  0.012 at random / acquaintance / degree, mean degree of the immunised 4.02
  / 4.89 / 6.99; g_c 0.499; below 1% of N from 0.54 / 0.44 / 0.22.
- Preferential attachment: g_c 0.846; at g = 0.20, 0.500 / 0.023 / 0.001,
  mean degrees 4.07 / 7.83 / 9.96; below 1% from 0.74 / 0.24 / 0.08; at
  g = 0.05 mean degrees 4.16 / 11.70 / 21.01 and outbreaks 0.711 / 0.574 /
  0.074.
- T = 1: random network g_c 0.749, below 1% from 0.75 / 0.62 / 0.42;
  preferential attachment g_c 0.923, from 0.84 / 0.40 / 0.18.

**Figures.** F1: 80 nodes, 126 links, 14 nodes with one link, hub of 19; at
T = 0.5, 199 of 200 outbreaks from the hub pass a quarter of the nodes and 97
of 200 from the default seed (node 5, one link); over the 14 nodes with one
link the share runs from 0.23 to 0.51. F2: lattice 151 × 151, edge reached at
step 147, slope 2.14; ladder a = 8, b = 2: exponent 3.

Two things I did not expect, both stated in the texts: at T = 0.5 the large
outbreak is slightly *smaller* with hubs (0.776 against 0.796); and at
T = 0.344 preferential attachment has fewer large runs than the random
network (7 against 13) although its threshold is three times lower, because
most seeds have two links.

## "Check" items: confirmed and softened

Confirmed in the source (abstract or full text read):

- **Pastor-Satorras and Vespignani (2001)**, arXiv cond-mat/0010317: SIS
  model; absence of an epidemic threshold; data on computer viruses, which
  "saturate to a very low level of persistence, affecting just a tiny
  fraction" of computers. PRL 86, 3200 (end page 3203 not seen on arXiv).
- **Castellano and Pastor-Satorras (2010)**, arXiv 1010.1646: the SIS
  threshold "vanishes in the large size limit on any network whose maximum
  degree k_max diverges". **Reworded:** the abstract speaks of "the largest
  hub … playing the role of a self-sustained source", so the lecture says
  "the largest hub is enough to keep an SIS infection alive", not "a hub and
  its neighbours".
- **Lloyd-Smith et al. (2005)**, full text: for Singapore k̂ = 0.16 (90%
  interval 0.11–0.64); 73% of the cases had ν < 1 and 6% had ν > 8. The
  lecture gives these three numbers. The authors discuss the "20/80 rule" and
  conclude that "no general rule emerges", so the lecture does not use it.
- **Barthélemy et al. (2004)**, arXiv cond-mat/0311501, eq. (7):
  τ = ⟨k⟩/(λ(⟨k²⟩ − ⟨k⟩)); "once the highly connected hubs are reached, the
  infection pervades the network in a progressive cascade across smaller
  degree classes". (The lecture writes β for their λ.)
- **Viboud, Simonsen and Chowell (2016)**, abstract: 20 outbreaks;
  "sub-exponential growth is a common phenomenon, especially for pathogens
  that are not airborne".
- **Newman (2018), ch. 16** is "Epidemics on networks" (OUP contents).

Softened:

- **Colgate et al. (1989).** I could not open the paper or its abstract (the
  PubMed page is behind a cookie wall, and the number I tried was another
  paper's). What I have is the title ("Risk behavior-based model of the cubic
  growth of acquired immunodeficiency syndrome in the United States") and the
  account in the Institute's preprint, section 4.1. The lecture says they
  "proposed a model that gives the cube: a population divided by risk
  behaviour, in which the infection saturates the small group at highest risk
  first and then ever larger groups at lower risk". Please check this
  sentence against the paper.

Not given: a chapter number for **Latora, Nicosia and Russo** (the
publisher's pages refused the request), as in module 11.

Not checked against the sources, cited from memory of the standard results:
Kermack and McKendrick (1927), Newman (2002), Pastor-Satorras and Vespignani
(2002), Cohen, Havlin and ben-Avraham (2003), the review of 2015, and the
chapter numbers of Barabási (10) and Easley and Kleinberg (21).

## What I could verify of the box

- **Santostasi and Perrenod (2026)**, Zenodo 19387099 (v2, 2 April 2026): the
  description and the PDF give N(t) ∼ t^β_A with β_A = 3.046 ± 0.012, "a cubic
  scaling consistent with epidemic spreading on a heterogeneous scale-free
  network (Colgate et al., 1989; Bacchetti & Koch, 1989)", and section 4.1
  describes the saturation wave. **So the reference to Colgate et al. is
  theirs**, and the box says "citing the saturation wave of Colgate and
  colleagues". Cited as Complexity Lab module 13 does (same DOI, link to that
  module and to `/research/publications#preprint`); the self-check verifies
  that module 13 has the same exponent and DOI.
- **Pecere (2026), supplement, section S2**: I could open the Zenodo record
  and read the supplement. It says: "By sub-period 2011-15 / 2016-19 /
  2020-22 / 2023-26 (OLS, no HAC errors) the time exponent of addresses with
  balance is 3.37 / 3.00 / 1.93 / 1.01". **The four numbers are confirmed.**
  The reference is the same line as in module 05 (checked by the script).
- The box says nothing about the price, quotes no current statistics and
  leaves the last question open.

## Italian terms chosen

| English | Italian |
|---|---|
| outbreak | focolaio (large outbreak: grande focolaio; "epidemia" for epidemic) |
| threshold | soglia |
| transmissibility | trasmissibilità |
| superspreader | superdiffusore |
| final size | dimensione finale |
| prevalence | prevalenza |
| immunisation | immunizzazione |
| acquaintance immunisation | immunizzazione dei conoscenti (panel label "Conoscenti") |
| saturation wave | onda di saturazione |
| sub-exponential growth | crescita più lenta dell'esponenziale (the lecture avoids "sub-esponenziale") |

Also: seme (seed), scala di gruppi (ladder of groups), semilogaritmico,
paradosso dell'amicizia, grado in eccesso (as in module 05).

## Checks run (each as its own foreground command, on the final build)

- `npx vite build`: built.
- `node scripts/lab/check-network-01.mjs` … `12.mjs`: all pass (12: 115
  checks, 0 failures).
- `check-index.mjs network` 0 of 72; `check-index.mjs complexity` 0 of 64;
  `check-links.mjs` 0 of 80.
- `check-module.mjs network <slug>` for the twelve modules: 0 failures each
  (module 12: 0 of 56, locked and admin, EN and IT, 1280 and 375 px).
- `modules/network-<slug>.mjs` for the twelve modules: 0 failures each
  (module 12: 0 of 37). **One crash:** `modules/network-robustness-and-cascades.mjs`
  ended the first time with Node crashing and no result; run again, alone, it
  passed (0 of 36). Nothing of module 11 changed; this is the low-memory
  crash already noted in the status file.
- `check-module.mjs complexity scale-free` after Stage 0: 0 of 38.
- Regression compare: not run (no shared code changed).

Timings in headless Chrome: Panel A's sweep on load 1.3 s across frames, Panel
B under 0.3 s (three pieces of about 0.1 s each), Panel C 1.2 s; "Run 1,000 seeds" 1.1 s; the SIS sweep 2.6 s (random),
3.6 s (preferential attachment), 5.0 s (power law).

## Open points for you

1. The sentence on Colgate et al. (above): the only "check" I could not make.
2. The power-law network of Panel A has mean degree 4.35, not 4. If you want
   exactly the same mean degree, the simplest way is to thin its links at
   random down to 2N; say if you prefer that.
3. The lattice limit: ±0.25 for one run on 100 × 100 instead of ±0.15.
4. F1 is 40 px taller than the guideline.
5. Lectures EN and IT carry the DRAFT marker.
