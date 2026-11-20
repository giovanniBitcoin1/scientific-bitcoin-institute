# Network Lab, prompt 5 — final report

Module 05, "Heavy tails, done right" (slug `heavy-tails-done-right`). Written
on 2026-11-20.

The module is done and committed locally on `network-lab`; nothing was pushed.
Every check in the list finished with 0 failures on the final build. Before
starting, the status file showed module 04 as done and nothing in progress,
and the tree was clean.

## Commits

| Hash | Message |
|---|---|
| `279490b` | Network Lab 05: Heavy tails, done right (two WIP commits squashed) |
| (this file) | Network Lab 05: report |

## Decisions that need you

1. **The formula for repeated links differs from the prompt.** The prompt
   gives ((⟨k²⟩ − ⟨k⟩)/⟨k⟩)²/2 and expects 8 repeated links for Poisson
   degrees with ⟨k⟩ = 4. The simulation gives 3.85 on average over 200
   networks of 10,000 nodes (self-links: 1.93, as expected). The count that
   matches is the square over **4**: two nodes are joined twice with
   probability k_i(k_i − 1)k_j(k_j − 1)/(2(2L)²) (two half-links chosen at
   each end, two ways of pairing them), and the sum over pairs of nodes gives
   r²/4 with r = (⟨k²⟩ − ⟨k⟩)/⟨k⟩. The lecture, Panel A and the self-check use
   /4. If you want /2 as printed in some textbooks, say so; the simulation
   will not agree with it.
2. **The recipe lets impostors through, and the texts say so.** Lognormal and
   exponential samples often "pass" the bootstrap test, because the recipe
   moves k_min far out and tests a short tail (numbers below). As the prompt
   asked, the lecture has a paragraph on this ("The recipe has a blind spot")
   and so have the "What to observe" of Panel C and the solution of exercise 6.
   I also added one rule to the verdict line that the prompt did not ask for:
   besides "fewer than 50 values in the tail", it says that nothing can be
   concluded when **the tail covers less than a factor of ten in k**. Without
   it the exponential source got the verdict "not ruled out" with
   "γ = 5.65 ± 0.49".
3. **Exercise 6 has no clean answer for the lognormal.** With 300 values the
   panel's sample is ruled out (p = 0.03), but only 16 samples of 50 of that
   size are. With 30,000 values it is *not* ruled out (p = 0.21, on 1,229
   values); only the comparison notices something (cut-off law favoured,
   p = 0.02). At 50,000, p = 0.10. The solution says this as it is. If you
   prefer a lognormal that is clearly caught at 30,000, the source needs a
   smaller σ, and even then it depends on the sample (I tried μ, σ = (1, 1.2),
   (2, 1), (3, 1), (2, 0.8), (1, 1.5): none is caught in every sample).

## What differs from the spec

1. Repeated links: /4 instead of /2 (above).
2. Verdict of Panel C: the extra "less than a factor of ten in k" rule (above).
3. **Panel A, experiment.** Each point is the **median of 10 networks**, not a
   mean of R runs: the largest degree of a heavy-tailed sample swings so much
   (94 to 1,180 among the first twenty default networks) that a mean of five
   was unreadable. k_min is fixed at 2 in the experiment. N = 10⁵ is kept;
   the experiment takes about 8 s in the browser (6.6 s in Node), with a
   progress figure and a Stop button. A table under the charts gives the
   numbers at the largest size reached.
4. **Panel A, drawing.** Above 250 nodes the drawing is a network of the same
   kind with 250 nodes (same γ, k_min, seed), and the page says so. Degrees
   are drawn from the power law cut at N − 1 (a larger draw is drawn again).
   When the total of the degrees is odd, the last node is drawn again.
   Readout "largest degree · as drawn · natural cutoff" shows the degree
   before and after the cleaning.
5. **Panel B, right-hand chart: precomputed**, curve and dots (see
   "Precomputed"). It would in fact take under a second in the browser, but
   the page then loads with the chart already there. The γ slider goes down
   to 2, where the page shows the limit u = 0, S = 1 (the mean is infinite).
   The power-law networks are cut at N − 1.
6. **Panel C, bootstrap: on a button** ("Run the test"), 200 sets by default,
   100 to 1,000 by a slider, with a progress bar. It is fast (see "Timing"),
   but a button keeps the four steps in order and nothing runs while a slider
   is dragged. Changing the data drops the old result.
7. **Panel C, candidate k_min:** every observed value that has at least 10
   values at or above it. The lognormal candidate is the lognormal rounded to
   whole numbers and cut at k_min; its fit is not allowed to start more than
   eight standard deviations above μ (beyond that it is a power law in all
   but name and the likelihood is flat). **The cut-off power law is
   included** in step 4: since it contains the power law, its p-value comes
   from a chi-square with one degree of freedom, not from Vuong's test.
8. **Panel C, sources.** Tail with a different body: 40% of the values in the
   power-law tail from k = 10, the rest uniform on 1…9. Lognormal: μ = 1,
   σ = 1.2, rounded. Exponential: mean 8, rounded up. Cut-off: k^(−2)
   e^(−k/60). Sampled network: γ = 2.5 from k = 1, each link kept with
   probability 0.3, nodes left with no link dropped (simulated directly, not
   through module 02's `thin`, which is an exact formula for distributions,
   not a sampler). Mysteries: 1 = tail with body, γ = 2.6, n = 5,000;
   2 = lognormal, n = 3,000; 3 = cut-off, n = 10,000.
9. **"Maximum likelihood with k_min = 1"** in the table of four ways is
   maximum likelihood from the smallest value in the data (2 for the
   preferential-attachment source).
10. **Hill plot** is drawn as a degree exponent (1 + the Hill estimate), so it
    can be read against the γ of the recipe.
11. Nothing from the Complexity Lab was imported except `graphUtils.js` and
    `rng.js`; `powerLawMLEDiscrete` in `graphUtils.js` (the shortcut) was not
    reused: `fit.js` has its own shortcut next to the exact estimate.
12. Italian lecture: the last heading is "Letture consigliate", as in
    modules 01–04.

## The "check" figures

| Claim | Result |
|---|---|
| Broido and Clauset: nearly a thousand networks; 4% strongest evidence, 52% weakest | **Confirmed**, in the abstract (arXiv:1801.03400): "nearly 1000 network data sets", "only 4% exhibiting the strongest-possible evidence of scale-free structure and 52% exhibiting the weakest-possible evidence" |
| Voitalov et al.: under a broader definition (a power-law tail, whatever the rest does) they are not rare | **Confirmed**, in the abstract (arXiv:1811.02071): definition "equivalent to the definition of regularly varying distributions"; scale-free networks "definitely not as rare as one would conclude…" |
| Clauset, Shalizi and Newman: twenty-four data sets; some pass, others ruled out; for most a lognormal or a cut-off cannot be excluded | "Twenty-four" and "in some cases … consistent with the data while in others the power law is ruled out": **confirmed** (abstract). "For most could not exclude a lognormal or a cut-off": **not confirmed word for word** (I could read only part of the body; the PDF could not be opened here). **Softened** to: "where it passed, a rival such as the lognormal often could not be excluded." No count is given. |
| Complexity Lab module 04 on the preferential-attachment estimate | **Checked on the page**: "with k_min = m it comes out well below 3, because at small k the model's degree distribution bends away from a straight line". The lecture says "the estimate with k_min = m comes out well below 3". |

The Hill sentence says that estimators "of this kind" are the ones Voitalov
and colleagues use (their abstract speaks of three estimators from extreme
value theory, without naming them).

References: all are printed as given in the prompt. **None was looked up
against its journal in this session**, apart from the three arXiv abstracts
above (Broido and Clauset; Voitalov et al.; Clauset, Shalizi and Newman).
Nothing in them looked wrong to me, but that is memory, not a check. The two
Zenodo entries are used as given.

## "Expected" values: which differ

| Expected | Got | |
|---|---|---|
| ζ(2.5, 1) = 1.341487, ζ(2.5, 2) = 0.341487, ζ(3, 1) = 1.202057 | 1.3414872573, 0.3414872573, 1.2020569032 | same |
| p_1 = 0.7454, p_2 = 0.1318, mean 1.9474 | 0.7454, 0.1318, 1.9474 | same |
| Poisson ⟨k⟩ = 4: 2 self-links, **8 repeated links** | 1.93 and **3.85** | **differs: 4, not 8** |
| S = 0.5828, 0.7968, 0.9405 (Poisson 1.5, 2, 3) | the same | same |
| ones and fours: u = 0.5, S = 0.6094, threshold 1/9 | the same | same |
| root of ζ(γ − 2) = 2ζ(γ − 1): 3.4788 | 3.478751 | same |
| S = 0.862, 0.614, 0.201, 0.008 (γ = 2.2, 2.5, 3, 3.4) | 0.8622, 0.6136, 0.2014, 0.0082 | same |
| maximum likelihood: spread about 0.017 | 0.0148 measured on 100 samples; 0.0169 from the curvature; 0.0150 rule of thumb | same within the scatter |

## Exercises: every answer recomputed

All six agree with yours.

1. 20,000; 2,000; 200. One million; 31,623 ("about 32,000").
2. ⟨k⟩ = 6; ⟨k²⟩ = 1,188; ⟨k²⟩/⟨k⟩ = 198 with ⟨k⟩ = 6 (200.0 with the mean of
   the truncated law); factor 4.68; 100^(1/3) = 4.64. Whole numbers: the
   exact mean is 4.72; the panel's networks have 4.35 (N = 2,000) and 4.62
   (N = 20,000), a little lower because of the cut at N − 1 and the cleaning.
   The statement sends the reader to the panel's readouts at γ = 2.5,
   k_min = 2 (the experiment has no γ = 2.5 curve).
3. 1.75; q_0 = 3/7, q_3 = 4/7; u = 1/2; S = 39/64 = 0.609; more than 1/9.
4. 2.297 ± 0.410, so 2.30 ± 0.41; 673 ("about 670"). Exact maximum
   likelihood on the same ten values: 2.300.
5. 3.4788; 0.6136 and 0.2014. Networks of 20,000 nodes: 0.610 and 0.206;
   0.019 at γ = 3.4 (theory 0.0082) and 0.009 at γ = 3.6 (theory 0).
6. See "Decisions" point 3 and the numbers below.

## Self-check numbers (`node scripts/lab/check-network-05.mjs`)

91 checks, 0 failures, about a minute and a half.

- **Hurwitz zeta:** agrees with a two-million-term sum to 3 × 10⁻¹² on six
  awkward arguments; ζ(2) and ζ(4) to 10⁻¹².
- **Sampler, 10⁶ draws:** p_1 = 0.7458, p_2 = 0.1320 (exact 0.7454, 0.1318).
- **Natural cutoff,** median largest degree over 200 samples at N = 10³, 10⁴,
  10⁵: slope 0.680 for γ = 2.5 (0.667) and 0.484 for γ = 3 (0.5). **This holds
  for the seed used, not for any seed:** with 200 samples the slope is known
  to about ±0.024, and at γ = 2.5 two of nine seeds gave 0.723 and 0.724.
  With 1,000 samples it would hold for any seed.
- **Configuration model:** degrees exact before cleaning; Poisson ⟨k⟩ = 4:
  1.93 self-links, 3.85 repeated links.
- **Formulas against counts, k_min = 2, mean of 20 networks** (self-links
  count · formula; repeated count · formula):
  γ = 3.5, N = 2,000: 1.5 · 1.9; 3.4 · 5.4. N = 20,000: 1.8 · 1.9; 3.7 · 3.8.
  γ = 2.5, N = 2,000: 32.5 · 31.7; 204 · 2,213. N = 20,000: 188 · 187;
  1,443 · 155,397. γ = 2.2, N = 20,000: 545 · 546; 10,644 · 466,268.
  The self-link formula holds everywhere; the repeated-link formula holds
  when ⟨k²⟩ is finite and overshoots by orders of magnitude below γ = 3
  (it assumes repeated links are rare). The biggest hub loses on average 178
  links at γ = 2.5, N = 2,000 and 4,567 at γ = 2.2, N = 20,000.
- **Networks of 20,000 nodes (5 each):** Poisson ⟨k⟩ = 2: 0.7935 ± 0.0027
  (theory 0.7968); ones and fours: 0.6095 ± 0.0057 (0.6094). Pure power law:
  γ = 2.2: 0.848 ± 0.022 (0.862); 2.5: 0.610 ± 0.017 (0.614); 3: 0.206 ±
  0.022 (0.201); 3.4: 0.019 ± 0.012 (0.008); 3.6: 0.009 ± 0.003 (0).
- **Exact maximum likelihood,** 100 samples of 10,000, γ = 2.5: mean 2.4996,
  spread 0.0148. **The shortcut** on the same samples: 2.018 at k_min = 1,
  2.373 at 2, 2.487 at 5, 2.526 at 10 (exact estimate at 2, 5, 10 on the first
  20 samples: 2.505, 2.520, 2.570).
- **k_min by KS,** tail above 10 with another body, n = 10,000: between 7 and
  15 in 89 samples of 100; median 10; exactly 10 in 41; median γ 2.502.
- **p-values,** 100 pure power-law samples, n = 2,000: p ≤ 0.1 in 14; median
  p 0.49.
- **Lognormal source, power law ruled out:** n = 300: 16 of 50 samples
  (median n_tail 82.5, median k_min 7; tail below 50 values in 7, narrower
  than a decade in 13 more). n = 10,000: 7 of 20 (median n_tail 392, k_min
  24.5; narrower than a decade in 7). n = 30,000: 8 of 20 (median n_tail
  798.5, k_min 30).
- **Exponential source:** n = 300: 12 of 50 (median n_tail 47.5; tail below
  50 values in 27, narrower than a decade in the other 23). n = 10,000: 9 of
  20 (median n_tail 211, k_min 32; below 50 or narrower than a decade in all
  20). n = 30,000: 13 of 20 (narrower than a decade in all 20).
  So yes: such data pass because the recipe keeps a short far tail. For the
  exponential the new verdict rule catches every case; for the lognormal it
  catches about a third, and the rest are tails of several hundred values
  over one decade or a little more, which the test really cannot tell from a
  power law.
- **Likelihood ratio,** k_min at the smallest value, n = 1,000: exponential
  data favour the exponential in 100 of 100; power-law data favour the power
  law in 100 of 100. Power-law data against a lognormal: no decision in 91
  of 100.
- **Preferential attachment, N = 100,000, m = 2:** largest gap from
  2m(m+1)/(k(k+1)(k+2)) for k = 2…10: 0.0008. The recipe gives γ = 2.899 ±
  0.023 with k_min = 9 (6,749 values). At k_min = 2 the shortcut gives 2.398
  and exact maximum likelihood 2.533.
- **Hill,** 10,000 Pareto values with exponent 1.5, j = 1,000, 20 samples:
  mean 1.494.
- **Also checked:** erfc; the normalising sum of the cut-off law against a
  plain sum (10⁻⁷); the precomputed file against the code; that the Italian
  observe lists, exercises and lecture carry the same numbers as the English.

## The numbers behind each "What to observe"

**Panel A** (default γ = 2.5, k_min = 2, N = 2,000, network 1): L = 4,351,
⟨k⟩ = 4.35, ⟨k²⟩ = 107.8, ratio 24.8; largest degree 243, dealt 315, cutoff
317; self-links 14 (formula 15.8); repeated 130 (formula 250.9); largest
component 1.000; distance 4.20. First twenty networks: largest dealt degree
94 to 1,180. γ = 4: L = 2,440, largest 23 (cutoff 25), 2 and 0, ratio 3.1,
distance 11.16. γ = 2.1: dealt 1,548, kept 673, 127 and 1,529, ratio 83.3,
distance 3.03. N = 20,000 at γ = 2.5: ⟨k⟩ 4.62, ⟨k²⟩ 285.6, largest 1,278,
distance 4.20; at γ = 4: ⟨k²⟩ 7.8, distance 13.87.
Experiment, median of 10, largest degree / ⟨k²⟩/⟨k⟩ / distance:

| N | γ = 2.2 | γ = 2.6 | γ = 3 | γ = 4 | random |
|---|---|---|---|---|---|
| 100 | 36 / 9.8 / 2.98 | 29 / 7.0 / 3.45 | 15 / 4.7 / 4.05 | 7 / 2.8 / 6.59 | 9 / 4.3 / 3.73 |
| 1,000 | 224 / 33.9 / 3.17 | 98 / 14.1 / 4.09 | 59 / 6.3 / 5.35 | 17 / 3.0 / 9.90 | 11 / 4.9 / 5.16 |
| 10,000 | 2,671 / 191.7 / 3.24 | 409 / 21.6 / 4.71 | 189 / 8.4 / 6.40 | 32 / 3.1 / 12.76 | 14 / 5.1 / 6.73 |
| 100,000 | 10,994 / 721.9 / 3.54 | 1,448 / 38.1 / 5.16 | 1,170 / 13.8 / 7.50 | 63 / 3.1 / 15.77 | 15 / 5.2 / 8.19 |

The curves are not smooth (γ = 2.6 has 1,338 at N = 31,623 and 1,448 at
100,000; γ = 4 has 72 and then 63): the texts say so.

**Panel B.** Poisson 1.5: u = 0.4172, S = 0.5828, 26 steps. 0.9: u = 1,
S = 0, G1′(1) = 0.9, excess −0.09. 1.1: u = 0.8239, S = 0.1761, 98 steps.
Ones and fours 0.25: 0.5 and 0.6094; 0.10: none (excess −0.1); 0.12:
S = 0.0748. Power law: 2.5 → 0.6136; 3 → 0.2014; 3.4 → 0.0082; 3.45 →
0.0012; 3.5 → 0, G1′(1) = 0.947; 2 → u = 0, S = 1. Dots as in the self-check
(Poisson ⟨k⟩ = 2 shows 0.794).

**Panel C** (k_min · γ · n_tail · p with 200 sets · verdict):

| Data | k_min | γ | n_tail | p | Verdict |
|---|---|---|---|---|---|
| Pure power law, 2,000 | 1 | 2.48 ± 0.03 | 2,000 | 0.73 | not ruled out; lognormal and cut-off open |
| Tail, different body, 20,000 | 10 | 2.52 ± 0.02 | 7,988 | 0.51 | not ruled out |
| Lognormal, 2,000 | 14 | 2.81 ± 0.13 | 202 (14…223) | 0.86 | not ruled out; lognormal open |
| Exponential, 2,000 | 27 | 5.65 ± 0.49 | 89 (27…72) | 0.45 | nothing can be concluded (range) |
| Cut-off, 2,000 | 1 | 2.14 ± 0.03 | 2,000 | 0.02 | ruled out (cut-off ratio −12.6) |
| Pref. attachment, 2,000 | 2 | 2.52 ± 0.03 | 2,000 | 0.01 | ruled out |
| Pref. attachment, 50,000 | 8 | 2.83 ± 0.03 | 4,146 | 0.20 | not ruled out |
| Sampled network, 2,000 | 1 | 2.93 ± 0.04 | 2,000 | 0.73 | not ruled out, **wrong exponent** (tail 2.5) |
| Sampled network, 20,000 | 3 | 2.61 ± 0.04 | 1,468 | 0.89 | not ruled out |
| Mystery 1 (tail, γ = 2.6) | 10 | 2.63 ± 0.04 | 1,968 of 5,000 | 0.76 | not ruled out |
| Mystery 2 (lognormal) | 15 | 2.96 ± 0.13 | 244 of 3,000 | 0.70 | not ruled out; lognormal open |
| Mystery 3 (cut-off) | 1 | 2.13 ± 0.01 | 10,000 | 0.00 | ruled out (ratio −46.3) |
| Lognormal, 300 | 4 | 2.09 ± 0.10 | 124 | 0.03 | ruled out |
| Lognormal, 30,000 | 24 | 3.08 ± 0.06 | 1,229 | 0.21 | a better candidate: cut-off (−2.7, p 0.02) |
| Lognormal, 50,000 | 24 | 3.10 ± 0.05 | 2,030 | 0.10 | ruled out |

Four ways to get it wrong, pure power law γ = 2.5, n = 2,000: 1.49 (equal
bins), 2.36 (logarithmic bins), 2.46 (CCDF), 2.48 (maximum likelihood).
Tail with a different body: maximum likelihood from k_min = 1 gives 1.39.
The "sampled network" row is worth a look: at n = 2,000 the recipe keeps
k_min = 1 and is confidently wrong, because the KS minimum prefers a slightly
wrong law on 2,000 values to the right one on a hundred. The text says that
a standard error measures scatter, not whether the model is right. Hill plot
of the 20,000 sampled values: between 2.3 and 2.7 from j = 30 to 200.

A detail: the page formats with `toLocaleString`, which shows 0.855 as 0.86
where `toFixed` gives 0.85. The texts quote what the page shows, and the
checks format the same way.

## Precomputed

| File | Size | Written by |
|---|---|---|
| `src/data/lab/precomputed/network-05-giant.json` | 4,681 bytes | `node scripts/lab/precompute-network-05.mjs` (0.7 s) |

It holds, for each of the three families of Panel B, the curve S(parameter)
from the generating functions (81 points) and the dots (mean and standard
deviation of 5 networks of 20,000 nodes at 16, 20 and 21 values of the
parameter). The self-check fails if the file is not what the code gives now.
Nothing else is precomputed: the experiment of Panel A and the bootstrap of
Panel C run in the browser, on a button.

## Timing in the browser (headless Chrome on this machine, 200 sets)

- Bootstrap of Panel C at n = 2,000: under 0.3 s (finished before the first
  poll; 0.05 s in Node).
- Bootstrap of Panel C at n = 50,000: about 1 s (0.7 s measured after a 0.25 s
  wait; 0.4 s in Node). With 1,000 sets, five times that.
- Experiment of Panel A: 8.1 s.
- Nothing slower than a few tens of milliseconds runs when the page loads.

## Italian terms

| English | Italian |
|---|---|
| natural cutoff | cutoff naturale |
| ultra-small world | mondi ultra-piccoli, with *ultra-small worlds* in brackets once (small-world stays in English) |
| configuration model | modello di configurazione |
| self-link | cappio ("collegamento di un nodo con sé stesso" at first use) |
| repeated link | collegamento ripetuto |
| generating function | funzione generatrice |
| giant component | componente gigante |
| goodness of fit | bontà dell'adattamento |
| likelihood ratio | rapporto di verosimiglianza |
| heavy tail | coda pesante |

Also: half-link = mezzo collegamento; cut-off (of a distribution) = taglio,
as in Complexity Lab module 04; bins = classi; to fit = adattare; "ones and
fours" = uno e quattro.

## Lecture

EN 1,574 words and IT 1,593 before "Further reading" (markup included), DRAFT
marker on both. It follows the nine points of the outline, with two live
figures and the optional box (about 120 words). Section 2 gives 12 as the
largest degree of a random network of 10⁶ nodes with the mean degree of the
γ = 2.5 law (1.95): computed, N·P(K ≥ 12) ≥ 1 > N·P(K ≥ 13). The box says
nothing about the two papers beyond the prompt's wording and links to module
13 and to /research/publications; both DOIs are in "Further reading".

## Checks

| Check | Result |
|---|---|
| `npx vite build` | built; module 05 is its own chunk, about 105 kB (39 kB gzip) |
| `check-network-01` … `04` | all passed |
| `check-network-05` | 0 failures of 91 |
| `check-index.mjs network` / `complexity` | 0 of 72 / 0 of 64 |
| `check-links.mjs` | 0 of 80 |
| `check-module.mjs network` × 5 modules | 0 of 62, 62, 56, 60, 58 |
| `modules/network-*.mjs` for 01–04 | 0 of 25, 0 of 29, 0 of 40, 0 of 45 |
| `modules/network-heavy-tails-done-right.mjs` (new) | 0 of 56 |
| `compare-main.mjs` | not run: no shared lab file was changed |

`expect.json` and the README of the browser checks have module 05. The status
file has the two new lines under "How to resume", module 05 as done, module
06 as next, and the notes for later modules. `CLAUDE.md` mentions the
precompute script. `prompts.local/` is ignored by git and was not touched.
