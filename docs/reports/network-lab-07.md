# Network Lab, prompt 7 — Module 07 "Fitness and competition"

Branch `network-lab`, local commits only, nothing pushed. Preconditions held at
the start: modules 01–06 done, nothing in progress, and
`docs/reports/network-lab-06.md` committed. Module 07 was built in six WIP
checkpoints, then squashed into one commit.

## Commits

- `ccb4e32` Network Lab 07: Fitness and competition
- this report: Network Lab 07: report

## What was built

- `src/components/lab/network/fitness-and-competition/`:
  - `fitness.js`:
    - fitness distributions and their samplers;
    - C from ∫ρη/(C − η) dη = 1 by bisection, with closed forms for equal,
      uniform, two values and "one above the rest", and a substitution
      x = ln(C − η) that keeps the numerical integral smooth near the top
      fitness;
    - growth with attachment ∝ η k on module 06's Fenwick sampler, with
      tracked-node histories, lead changes and the second-half slopes;
    - "one node above the rest";
    - ageing;
    - accelerating growth;
    - distances at any earlier size of the network.
  - `experiments.js`: the jobs of the three panels.
  - `figures.js`: the logic of F1 and F2.
  - Components: F1 `FigureRace.jsx`, F2 `FigureEnergy.jsx`; panel A
    `FitPanel.jsx`, panel B `CondensationPanel.jsx`, panel C
    `AgeDensityPanel.jsx`.
  - `texts.js` and `index.js`.
- Lectures in `src/content/network-lab/fitness-and-competition.{en,it}.md`:
  1,691 and 1,696 words, counted with markup up to `<!-- simulation -->`. The
  DRAFT marker is on, and there is no Bitcoin box.
- `scripts/lab/check-network-07.mjs`. It runs in about 15 s and has ten
  sections: C, equal, slopes, leader, condensation, ageing, accel, exercises,
  figures, page.
- Functional browser check
  `scripts/lab/browser-checks/modules/network-fitness-and-competition.mjs`
  (26 checks).
- Other files touched: the `expect.json` entry, the README, `status: "ready"`
  in `network-modules.json`, and the status file.
- **Chunks.** Module 07 imports module 06's `growth.js` (the Fenwick sampler)
  and module 05's `fit.js`, both unchanged. Vite now puts `growth.js` in a
  small chunk of its own, shared by 06 and 07 and loaded only when the lab is
  unlocked. No shared code was moved or edited, so the chunk rule did not
  require a move. Nothing touches the Complexity Lab chunk.
- **Regression compare.** Since no shared code changed, I did not run it. The
  checks of module 06, Node and browser, all pass.

## Differences from the spec

- **Panel A, tracked nodes.** Besides the three oldest and the fittest, the
  two "latecomers of high fitness" are the fittest node born in steps 10–99
  and the fittest born in steps 100–999. If one of them is the fittest of
  all, the next fittest in its window is taken.
- **Panel A, "nodes whose degree at least doubled".** A doubling within the
  second half alone would select noise: the expected slope is at most
  1/C ≈ 0.8, so the expected growth there is at most 2^0.8 ≈ 1.74. I read the
  phrase as "degree ≥ 2m at N/2". The slope is a regression over nine sizes,
  from N/2 to N. Beside it the panel shows the correlation for the nodes born
  before step 100.
- **Panel A, "the leader is the fittest".** A run counts when no node is
  fitter than the leader. With two values, any node of fitness 1 counts; with
  equal fitness the row shows "–".
- **Panel A, C with an exponential of small scale.** C is above 1 by less than
  10⁻⁹ (scale 0.2), so the readout says "≈ 1 (just above 1)".
- **Panel C, ageing.** It is exact (see "Ageing" below). Instead of drawing
  only when N ≤ 300, the panel always draws a 300-node network grown with the
  same ν beside the numbers for the chosen N, as module 06 does. ν = 0
  ("module 06") and ν = 1 ("no power law beyond") are marked on a scale under
  the slider.
- **Panel C, accelerating growth.** The remainder is carried as
  r ← m₀ n^θ + r − round(m₀ n^θ + r). The sum of links brought stays within 1
  of Σ n^θ (checked). Distances: 20 BFS roots at nine sizes. Adjacency lists
  are kept in birth order, so the network at any earlier size is read by
  stopping at the first newer neighbour.
- **F2.**
  - It starts at 12 nodes and grows to at most 30.
  - The switch gives the 4th node fitness 1 and halves every other fitness
    (the same draws), so the others are uniform on [0, 0.5].
  - Each link is one particle, on the level of the node it points to. This is
    the prompt's version, and it is what Bianconi and Barabási's own diagrams
    show. Their mapping puts a second particle on the newcomer's own level;
    the lecture says so.
- **Panel B, the clique.** For m = 1 the clique is nodes 0 and 1, and node 0
  is in it, as the notes ask. The share is deg(node 0) / (number of links),
  which is 1 − I in the limit (derivation in the exercise).

## "Check" figures in the lecture

Two research agents read the primary sources: arXiv full texts, Crossref,
Project Euclid, and the online edition of Barabási's book.

**Confirmed and quoted:**

- **Latecomer.**
  - Barabási, *Network Science* §6.1: AltaVista and Inktomi dominated in the
    late 1990s; Google, a latecomer, became the leading search engine and "by
    2000 became the biggest hub of the Web". The book gives no founding year,
    so the lecture gives none either.
  - Kong et al. (2008): "talented winners emerge and displace the experienced
    losers in just slightly less than half of all winning cases". The lecture
    says "in slightly less than half of the cases".
  - Bianconi and Barabási (EPL 2001) name no real latecomer (only Web
    documents in general, citing Adamic and Huberman).
- **BB EPL 2001.**
  - Π ∝ η k and k = m(t/t_i)^(η/C).
  - The equation for C.
  - Uniform fitness: C = 1.255 and P(k) ~ k^−(1+C)/ln k (their Fig. 2 is
    labelled k^−2.255/ln k).
  - Equal fitness: C = 2.
- **BB PRL 2001.**
  - ε = −(1/β) ln η.
  - A link is two particles.
  - Condensation when the integral is < 1, with condensate 1 − I.
  - "the fittest node acquiring a finite fraction of the links".
  - Microsoft in operating systems. The lecture calls it "a possible
    example".
- **Kong, Sarshar and Roychowdhury (2008).**
  - 13 monthly crawls, June 2006 to June 2007, each with more than 22 million
    pages.
  - Fitness is estimated from the slope of log in-degree against log time.
  - The fitness distribution is exponential, with "low variability".
  - Growth amplifies small differences.

  "Millions of pages" is safe: about 10 million persistent pages were used.
- **Wang, Song and Barabási (2013).** Relative fitness λ, immediacy μ and
  longevity σ; c∞ = m(e^λ − 1) depends only on λ; m = 30.
- **Dorogovtsev and Mendes (2000).**
  - One link per new site. Their exponent is called α; the lecture keeps ν,
    as in Barabási's book.
  - γ goes from 2 to 3 as ν goes from −∞ to 0; γ → ∞ as ν → 1; exponential
    above 1 ("chain structure").
  - The paper gives no table of γ(ν), only a figure and the small-ν expansion
    γ ≈ 3 + 4(1 − ln 2)ν = 3 + 1.23ν. Panel C's text quotes that expansion.
- **Leskovec, Kleinberg and Faloutsos (2005), KDD pp. 177–187.**
  - a = 1.68 (arXiv HEP-TH), 1.56 (HEP-PH), 1.66 (patents), 1.18 (autonomous
    systems), 1.08–1.15 (affiliation networks).
  - The effective diameter decreases in all datasets.
  - The Forest Fire model gives both. The lecture quotes 1.68, 1.66 and 1.18.
- **γ = 3 + 2θ/(1 − θ)** is Barabási's *Network Science* eq. 6.31. The lecture
  says "as in Barabási's textbook".
- **Dorogovtsev and Mendes (2001)** use a different model: c₀t^a extra links
  between old sites, in-degree, and γ = 1 + 1/(1 + a), between 3/2 and 2. It
  is only in Further reading; the lecture does not attribute the 3 + 2θ/(1 − θ)
  formula to them.
- **Chapters:** Barabási ch. 6 "Evolving Networks"; Newman 2nd ed. ch. 13
  "Models of network formation"; Latora et al. ch. 6 "Models of Growing
  Graphs".
- **Krapivsky and Redner (2002).**
  - Lead changes grow ∝ ln N, "independent of the details of the growth
    mechanism".
  - The first node keeps the lead with finite probability.
  - The mean leader index is about 3.4.
  - The paper has no fitness. The panel's "what to observe" quotes only the
    ln N growth.
  - Its arXiv number is cond-mat/0207370 (not 0207107).

**Section 4 on condensation (softened and reworded):**

- **Borgs, Chayes, Daskalakis and Roch (2007), STOC pp. 135–144 (pages
  confirmed).**
  - Three phases: first-mover advantage, fit-get-richer, and
    innovation-pays-off.
  - In the condensation phase "a constant fraction of the links continuously
    shifting to ever larger fitness values".
  - They leave open how the links are shared among the top fitnesses.
  - The lecture says only this.
- **Dereich, Mailler and Mörters (2017), AAP 27(4), 2539–2568 (confirmed).**
  - In their setting, the preferential-attachment tree (m = 1) with fitness of
    bounded support and a regularly varying tail at the maximum, "no vertex
    attracts a positive fraction of the edges".
  - Condensation "is non-extensive and emerges as a collective effort of
    several families none of which can create a condensate on its own".
  - The paper calls Bianconi and Barabási's "winner takes all" reading
    misleading.

  The lecture says: for trees with one link per newcomer and fitness spread
  continuously up to its maximum, no single node keeps a positive fraction;
  the condensate is a collective effort of ever fitter nodes. "Ever fitter" is
  Borgs et al.'s picture; "no single node" is Dereich et al.'s theorem.
- **The lecture's claim about the gap.** "One node keeping a fixed share is
  what happens when it stands apart from all the others, as in the clean
  case." This is supported by the mean-field calculation and by Panel B. I
  did not find a theorem for the case with a gap, and the lecture claims
  none.
- **BB's own Fig. 2 diagrams.** They show only incoming links "to simplify
  the picture", which is how F2 draws them. The lecture states the
  two-particle mapping.

**Not used:** the Google founding year; any γ(ν) value attributed to
Dorogovtsev and Mendes beyond the expansion.

## The "expected" values

| Check | Expected | Obtained | |
|---|---|---|---|
| C, uniform | 1.255001 | 1.255001 | holds |
| C, equal | 2 | 2 | holds |
| C, ζ = 0.1 / 0.5 / 0.9 | 1.2167 / 1.0942 / 1.0123 | 1.216684 / 1.094216 / 1.012302 | holds |
| Integral at C = 1 | 1/ζ | 1/ζ to 10⁻⁶ (numerical, ζ = 0.5, 1.5, 3) | holds |
| Equal fitness p₂, p₃, p₄, N = 50,000 | 0.5, 0.2, 0.1 ± 0.005 | 0.5005, 0.2011, 0.0977 | holds |
| Slopes, born before step 100, N = 20,000 | report | correlation 0.80 on average over ten networks (0.69–0.88); mean ratio slope/(η/C) 1.00 (0.91–1.09) | — |
| Panel B, b = 0.5, mean at 20,000 | ≈ 0.595, within 0.04 of 0.614 | **0.622** | holds, but from above (see below) |
| Panel B, b = 0.9, 1,000 → 20,000 | ≈ 0.24 → 0.15 | 0.211 → 0.135 | holds |
| Leader the fittest, uniform | almost never | 0 of 20 | holds |
| Ageing, ν = 0 | module 06 | p₁, p₂, p₃ = 0.6694, 0.1666, 0.0645 against 0.6667, 0.1667, 0.0667 (N = 50,000) | holds |
| Ageing, large positive ν | a few links | ν = 2: largest degree 8 (10,000 nodes), 10 (20,000) | holds |
| Ageing, large negative ν | star-like hub | **ν = −2: hub linked to 20.4% (10,000) or 17.6% (20,000)**; γ 2.37 / 2.30 | differs (see below) |
| Densification slope, θ = 0.2 / 0.5 | 1 + θ ± 0.03 | 1.201 / 1.501 | holds |
| γ against 3 + 2θ/(1 − θ) | short | θ = 0.2: 3.21 against 3.50; θ = 0.5: 4.87 against 5.00 (20,000 nodes) | as you expected |

- **Panel B, b = 0.5.** My means approach the limit from above: 0.635, 0.628
  and 0.622 at 1,000, 5,000 and 20,000 nodes, and 0.619 at 50,000. Yours (4
  runs) were 0.576, 0.587 and 0.595, from below. One run has a standard
  deviation of 0.022 at 20,000, but the spread between runs is skewed:
  - Ten other seed sets of ten runs give means of 0.573 to 0.621.
  - One set, 0.573, is 0.041 from 0.614.

  Your 0.04 limit holds for the panel's seeds and for 9 of the 10 other sets.
  Following the rule on seeds, I kept your check on the panel's seeds and
  added a check over the ten other sets at 0.05, the limit those eleven sets
  support. Your 0.595 is plausible as a 4-run mean. Node 0 is also the oldest
  node, which pulls the share up early, so I would expect most runs to come
  from above.
- **Ageing, ν = −2.** It does not give a star. With weight k τ², the oldest
  nodes hardly differ from one another (ages t and t − 1), so the old group
  shares the links. The hub, the 2nd node, holds 20% at 10,000 nodes, and γ
  falls towards 2 (2.37), as Dorogovtsev and Mendes say for ν → −∞. The
  check requires only that the hub is one of the first ten nodes and holds
  more than 10%. The texts say "Not a star".
- **Ageing γ from the recipe.** The paper only gives γ ≈ 3 + 1.23ν near 0:

  | ν | 10,000 nodes (page) | 20,000 nodes (check) | Small-ν expansion |
  |---|---|---|---|
  | −1 | 2.42 | 2.42 | — |
  | −0.5 | 2.44 | 2.44 | 2.39 |
  | 0.5 | 3.98 ± 0.26 | 3.58 ± 0.08 | 3.61 |
  | 0.8 | 4.60 | 5.07 | — |

  The recipe's k_min jumps between sizes at positive ν. The tails are short,
  and the texts say so.

## Exercise answers

All four paper exercises agree with yours exactly:

- **Ex. 1:** C ln(C/(C − 1)) = 2.0001 at C = 1.255; γ = 2.255 with 1/ln k;
  equal fitness C = 2.
- **Ex. 2:** 10⁶ and 10¹⁵; C and m cancel.
- **Ex. 3:** 1/ζ; I(0.5) = 0.386, share 0.614; b ≈ 0.7968.
- **Ex. 4:** 1.2 and 3.5; 1.5 and 5. The solution adds the mean-field
  derivation, and the panel's 3.27 and 4.81 at 10,000 nodes.

**Ex. 5.**

- At 10,000 nodes, over 20 runs:
  - the leader is never the fittest node;
  - it is one of the ten oldest in 17 runs and one of the first 22 nodes in
    all 20;
  - the median number of fitter nodes is 976, from 169 to 2,302;
  - the median number of lead changes is 6 (0–19).
- At 5,000 nodes:
  - never the fittest;
  - 80 to 1,296 fitter;
  - one of the ten oldest in 18 runs;
  - the latest-born leader is the **41st** node.

  So "always among the first 15" does not hold for my seeds.

**Ex. 6**, means of ten runs at 1,000, 5,000 and 20,000 nodes:

| b | Mine | Yours (4 runs) | Limit |
|---|---|---|---|
| 0.5 | 0.635, 0.628, 0.622 | 0.576, 0.587, 0.595 | 0.614 |
| 0.7 | 0.408, 0.377, 0.358 | 0.464, 0.422, 0.392 | 0.280 |
| 0.9 | 0.211, 0.165, 0.135 | 0.239, 0.183, 0.150 | 0 |

At 50,000 nodes: 0.619, 0.346 and 0.118. Only b = 0.5 has (nearly)
converged.

## Numbers behind each "What to observe"

All are from the default seeds and pinned by `check-network-07.mjs`.

**Panel A** (uniform fitness, N = 10,000, m = 2)
1. C = 1.255.
   - Leader: the 6th node, η 0.95, 764 links.
   - Fittest: node 9,696, with 2 links; 488 nodes are fitter than the leader.
   - The lead changed hands 5 times.
2. Tracked nodes:
   - node 2: η 0.83, 555 links;
   - node 1: η 0.57, 194;
   - node 3: η 0.18, 14;
   - node 79: η 1.00, 135.
3. The recipe gives 2.64 ± 0.03 from k = 3, against 2.255.
4. Slope against η/C: correlation 0.48 over 1,152 nodes; 0.70 for those born
   before step 100.
5. Twenty runs:
   - leader never the fittest;
   - one of the ten oldest in 17;
   - one of the first 22 nodes in all;
   - fitter than the leader: 976 (169–2,302);
   - lead changes: 6 (0–19).
6. All equal: C = 2; one of the ten oldest in 20 of 20; lead changes 5.
7. Exponential:
   - scale 0.2: C ≈ 1; one of the ten oldest in 6 of 20; one leader is the
     108th node; 152 fitter;
   - scale 1: one of the ten oldest in 15 of 20.
8. Two values (10% at η = 1, the rest at 0.5): top fitness in 20 of 20; one of
   the ten oldest in 10.

**Panel B** (m = 1, ten runs)
1. b = 0.5:
   - I = 0.386, predicted share 0.614;
   - measured 0.622 at 20,000; runs end between 0.58 and 0.65.
2. Run 1's levels: node 0 holds 63.6%; the band ε 0.8–1.2 holds 17.2%.
3. b = 0.7: limit 0.280; 0.358 at 20,000, 0.346 at 50,000.
4. b = 0.9 and b = 1:
   - b = 0.9: 0.135 at 20,000, 0.118 at 50,000; runs from 0.00 to 0.25;
   - b = 1: 0.091.

**Panel C** (10,000 nodes)
1. Ageing, ν = 0: γ 2.73; largest degree 114.
2. ν < 0:
   - ν = −1: γ 2.42; the 2nd node holds 861 links (8.6%);
   - ν = −2: γ 2.37; hub 20.4%.
3. ν > 0:
   - ν = 0.5: 3.98 ± 0.26 from k = 10; largest degree 36;
   - ν = 0.8: 4.60; largest degree 17;
   - small-ν expansion: 3 + 1.23ν = 3.61 at 0.5.
4. Largest degree 14 at ν = 1 and 8 at ν = 2.
5. Accelerating growth:

   | θ | Links | Slope a | γ, recipe | 3 + 2θ/(1 − θ) |
   |---|---|---|---|---|
   | 0.2 | — | — | 3.27 | 3.50 |
   | 0.3 | 121,907 | 1.301 | 3.60 | 3.86 |
   | 0.5 | — | — | 4.81 | 5.00 |
   | 0.6 | — | 1.601 | 5.86 | 6.00 |

6. Average distance, 100 → 10,000 nodes:

   | θ | Distance |
   |---|---|
   | 0 | 4.53 → 9.04 |
   | 0.2 | 3.14 → 3.71 |
   | 0.3 | 2.48 → 3.03 |
   | 0.6 | 1.79 → 1.97 |

**Lecture:**
- Panel A: 169–2,302 fitter; 17 of 20; the 6th node, 0.95, 764 links; the
  79th node, 1.00, 135.
- Slopes: ratio 1.00, correlation 0.80.
- Panel B: 0.622 and 0.135.
- Ageing: 2.42, 3.98, 4.60 and 2.73.
- Accelerating: 1.301, 3.60 against 3.86, distances 2.48 → 3.03.

**Findings worth noting:**
- **The prompt said the third simulation shows "both"** (densification and
  shrinking distances); it shows only densification. Distances never shrink
  in the accelerating model: they grow more slowly, and at large θ they
  almost stop. The lecture says the shrinking needs another mechanism, and
  names Leskovec et al.'s forest fire model.
- **Panel B's approach is slow**, so finite networks overstate the
  condensate near and above the threshold.
- **The recipe overestimates the uniform-fitness exponent** (2.64 against
  2.255) because of the 1/ln k correction.
- **Lead changes, equal fitness, m = 2** (40 runs each):

  | N | Mean | Median |
  |---|---|---|
  | 10³ | 5.45 | 5 |
  | 10⁴ | 6.65 | 4 |
  | 10⁵ | 10.55 | 5.5 |

  This grows slowly but is skewed. Krapivsky–Redner report about 5.1 at 10⁵
  for their model. I did not chase the difference (m = 2 here, a clique
  start, and the counting of ties), and the texts quote only "grows like
  ln N".

## Ageing: how it was computed, and the largest N

- **Method.** Exact: at every step every weight k_i τ_i^(−ν) is recomputed
  from a table of a^(−ν) (a = 1 … N), summed, and the target found by a
  second linear scan. That is O(N²) in all, run as a generator that yields
  every 100 steps (`useExperiment`), so the page never blocks.
- **Largest N:** 20,000, as in the prompt.
- **Timings:**
  - 20,000 nodes: 0.5–0.6 s in headless Chrome, 0.43 s in Node.
  - 50,000 nodes: 1.4 s in Node, which the self-check uses for ν = 0.
- **On load,** each panel finishes well under 2 s:
  - Panel C: 10,000 nodes (about 0.1 s).
  - Panel A: 10,000 nodes.
  - Panel B: ten runs of 20,000 nodes.
- **Other browser timings:**
  - "Rerun 20 times" at 10,000 nodes: 0.2 s.
  - Panel B at 50,000 nodes: 0.3 s.
  - Accelerating growth, worst case θ = 0.6 at 20,000 nodes (4.8 million
    links): about 0.7 s for the growth plus 0.3 s for the distances, in Node.

## Italian terms

| English | Italian |
|---|---|
| fitness | fitness (la fitness) |
| the fit get rich | i più adatti si arricchiscono |
| condensation | condensazione |
| energy level | livello di energia |
| lead change | cambio di leader |
| ageing | invecchiamento |
| densification | densificazione |
| accelerating growth | crescita accelerata |
| latecomer / incumbent | ultimo arrivato / veterano |
| forest fire model | modello *forest fire* ("incendio boschivo") |

## Check results

All on the final tree:

- `npx vite build`: succeeds.
- `check-network-01` to `-07`: all pass.
- Browser checks, each 0 failures:

  | Check | Passed |
  |---|---|
  | `check-index network` | 72 |
  | `check-index complexity` | 64 |
  | `check-links` | 80 |
  | `check-module`, modules 01 / 02 / 03 / 04 / 05 / 06 / 07 | 62 / 62 / 56 / 60 / 58 / 60 / 58 |
  | module scripts 01 / 02 / 03 / 04 / 05 / 06 / 07 | 25 / 29 / 40 / 50 / 58 / 26 / 26 |

- **Figure heights.** F1 is 313 px and F2 347–363 px at 1280. At 375 px they
  are 537–574 and 456–475 px, with the sliders and controls stacked above the
  drawing.
- **Memory.** Free memory was low (about 0.9 GB), so the browser checks ran
  one at a time. One run of the module 07 script timed out while loading the
  page. It was rerun alone and passed; no headless browsers were left over.
- **Regression compare:** not run, since no shared code changed.
