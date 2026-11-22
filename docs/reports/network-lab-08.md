# Network Lab, prompt 8 — one fix to Module 07, then Module 08 "Who connects to whom"

Branch `network-lab`, local commits only, nothing pushed. The prompt is
`prompts.local/network-lab-08.md` (git-ignored, not edited). Before starting:
the status file showed modules 01–07 done and nothing in progress, and
`docs/reports/network-lab-07.md` was committed.

## Commits

- `81230c9` Network Lab 07: fixes
- `d684664` Network Lab 08: Who connects to whom (two WIP checkpoints squashed; status file updated)
- this report, in its own commit: "Network Lab 08: report"

## Stage 0 — what changed in Module 07

- **Lecture, "Age and cost", EN and IT.** After "… 4.60 at ν = 0.8, against
  2.73 at ν = 0" the lecture now says ", where the theory gives exactly 3. At
  this size the recipe reads low, so the four are best compared with one
  another."
- **Panel C, item 1 of "What to observe", EN and IT.** It now reads "short
  of the 3 of the theory for the reason of module 05 … The recipe reads low
  at every ν, so compare the values of γ below with this one rather than
  with the theory."
- **Word limit.** The addition took both lectures over 1,700 words (1,725 /
  1,729), so I trimmed elsewhere:
  - the Microsoft sentence is shorter;
  - "and falls only slowly" after the 0.135 is gone;
  - in the accelerating paragraph, ": the tail is cut before it settles" is
    gone;
  - the Italian lecture lost two small phrases on top of these.

  The lectures now have 1,698 EN and 1,700 IT words.
- **Checks.** Both new sentences are pinned in `check-network-07.mjs`, and
  the Italian one is pinned in its own check. The script gives 0 failures,
  81 checks passing. The module 07 browser checks pass 58 of 58 (generic)
  and 26 of 26 (functional).

## What was built (Module 08)

Folder `src/components/lab/network/who-connects-to-whom/`:

- `mixing.js` holds the pure logic:
  - Newman's r over link ends;
  - Spearman's ρ on the same pairs, with average ranks for ties;
  - k_nn(k), exact up to k = 10 and then in classes a tenth of a decade wide,
    with a weighted log–log slope;
  - the structural cutoff;
  - the rich club φ(k), and its normalised version as a job against 20
    states of module 02's swap chain (10 attempts per link apart);
  - the Xulvi-Brunet–Sokolov rewirer, which keeps every degree and refuses
    self-links and repeated links;
  - `giantCurve`, the largest component after every number of removed
    nodes, in one backward union–find pass;
  - random and attack orders;
  - growth with two groups and a homophily h;
  - the mixing matrix, attribute assortativity and Coleman's index;
  - the majority illusion.
- `experiments.js` holds the panel jobs; `figures.js` holds F1, F2 and
  Havel–Hakimi.
- Live figures: `FigureWirings.jsx` (F1) and `FigureIllusion.jsx` (F2,
  plain SVG).
- Panels: `HubsPanel.jsx` (A), `RobustPanel.jsx` (B), `GroupsPanel.jsx` (C).
- `texts.js` and `index.js`.

Other files:

- **Lecture:** `src/content/network-lab/who-connects-to-whom.en.md` /
  `.it.md`, with 1,546 and 1,634 words, the DRAFT marker and no Bitcoin box.
- **Checks:** `scripts/lab/check-network-08.mjs` and
  `scripts/lab/browser-checks/modules/network-who-connects-to-whom.mjs`.
- **Wiring:** `expect.json` has the new entry, and `network-modules.json`
  marks module 08 `"ready"`.

Reuse and chunks:

- **Reused unchanged:** module 02's `swapper` (the rich-club null model);
  module 05's `configurationModel`, `powerDegrees` and `powerLawSampler`;
  graphUtils' `barabasiAlbert` (preferential attachment, m + 1 nodes all
  linked to start), `erdosRenyiGnm`, `buildCSR` and `forceLayout`.
- **Cross-checked, not reused:** module 02's `assortativity` and module 03's
  `spearman` serve only as references in the self-check.
- **Not used:** module 03's `fragility.js` is about rankings (missing and
  spurious links), not node removal, so it did not fit Panel B.
- **Chunks:** no shared code changed. Vite now emits `nullmodels.js` (9.7 kB)
  and `configmodel.js` (3.0 kB) as chunks of their own, shared with modules
  02 and 05. They load only when the lab is unlocked. The regression compare
  against main passes.

## Differences from the spec

- **Preferential attachment** starts from m + 1 = 3 nodes all linked (the
  site's `barabasiAlbert`), where networkx starts from a star. At every size
  the numbers match yours within the stated tolerance (see below).
- **Rich-club randomisations** are 20 successive states of one swap chain,
  with 10 swap attempts per link between states and before the first, as
  module 02 does with 20. Ten keeps the page-load work at about 1.7 s.
- **Panel A, "Grow N"** applies no rewiring. It is the source as built, three
  seeds per size, and the panel says so.
- **Panel B:**
  - The attack removes the highest degrees of the intact network, *not
    recomputed*; ties are broken at random and the panel says so.
  - There are 20 orders for each wiring.
  - The power-law source is fixed at γ = 2.5, k_min = 2.
  - Each wiring gets 10 rewiring steps per link with p = 1, or p = 0 for the
    neutral one.
- **Panel C:**
  - The network has 2,000 nodes and m = 2.
  - A newcomer is in the minority with probability q.
  - Each link stays in its group with probability h and goes to a node of
    that group chosen ∝ degree; while the group has no links yet, the node
    is chosen uniformly.
  - The majority illusion runs on the panel's own network.
- **Coleman's index** is (H − w)/(1 − w) when H ≥ w, as in exercise 3, and
  (H − w)/w when H < w, so it runs from −1 to 1. Without the second branch
  the index went down to −8 when h = 0.
- **F1** draws degrees from p_k ∝ k^(−2.3), 1 ≤ k ≤ 12, for 30 nodes, and
  draws again until the sequence is graphical. It builds the network with
  Havel–Hakimi and rewires it 60 steps per link with p = 1 each way.
- **F2** uses a fixed sequence: 8, 7, 6, 3 and sixteen 2s, 28 links. It is
  wired towards disassortative, and the switch re-pairs it at random.
- **Figure heights at 375 px** are 389 and 491 px, including captions and
  controls. That is above the "about 340 px" guideline, like module 07
  (537, 456).
- **The lecture's links to later modules** go to `/network-lab/communities`
  and `/network-lab/robustness-and-cascades`. Both modules are coming-soon,
  so for now those links show the friendly "not available" page. The link
  check passes.

## "Check" figures in the lecture

Checked against the papers, mostly the arXiv full texts:

- **Maslov and Sneppen (2002), confirmed.** Links between highly connected
  proteins are "systematically suppressed", and links between hubs and
  poorly connected proteins are favoured, in protein interaction and gene
  regulatory networks compared with degree-preserving rewiring. "Yeast" is
  not said, because it could not be confirmed.
- **Newman (2002), confirmed.** Social networks are often assortative,
  technological and biological ones disassortative. The values quoted come
  from PRL Table I:
  - physics coauthorship 0.363, film actors 0.208, company directors 0.276;
  - Internet −0.189, protein interactions −0.156, freshwater food web (Little
    Rock Lake) −0.276.

  The power grid is not cited: in the 2003 paper its −0.003 is called a null
  result. The two papers differ on the WWW and the neural network, so I used
  one table only.
- **Pastor-Satorras, Vázquez and Vespignani (2001), softened.** The paper
  writes ν ≃ 0.5, for the 1998 AS map only, and the lecture says "≃ 0.5" for
  the Internet at the level of autonomous systems.
- **Litvak and van der Hofstad (2013), softened.** Their exponent convention
  is shifted: their γ ∈ (1, 3) is the usual γ ∈ (2, 4), where the third
  moment diverges. The lecture says they "gave an analytical argument" that
  the most negative r on a given degree sequence goes to 0 with size: the
  PRE presents a simple argument, and the formal proofs are in a companion
  preprint. Their Web crawls are quoted as found: r −0.65 and −0.08, ρ −0.57
  and −0.56.
- **Boguñá, Pastor-Satorras and Vespignani (2004), confirmed.** k_s ∼
  (⟨k⟩N)^(1/2); for γ < 3 the natural cutoff exceeds it, and forbidding
  multiple links produces disassortative correlations. One detail is
  unresolved: arXiv gives only the first page, 205, and Colizza et al. cite
  205–210. I kept your 205–209.
- **Colizza et al. (2006), confirmed.** Collaborations show a strong rich
  club and air transport a mild one; the Internet ("contrary to previous
  claims") and the protein network show none. Air transport was added to the
  lecture.
- **Zhou and Mondragón (2004), confirmed.** They claimed a rich club in the
  AS graph with the unnormalised φ.
- **Robustness (Newman 2002, 2003), confirmed and worded as found.**
  Assortative networks "percolate more easily" and are "more robust to
  removal of their highest degree vertices". The prompt's "keep it longer
  when nodes are removed at random" is not what our numbers show, and the
  lecture does not say it (see Panel B below).
- **McPherson, Smith-Lovin and Cook (2001), softened.** The order race and
  ethnicity, age, religion, education, occupation, gender is theirs.
  "Remarkably robust across kinds of relation" replaces "among the most
  robust facts": the paper's own words are "remarkably robust" and
  "law-like".
- **Shalizi and Thomas (2011), confirmed.** Homophily, contagion and the
  effects of unmeasured covariates are generically confounded; separating
  them needs strong assumptions.
- **Aral, Muchnik and Sundararajan (2009), confirmed.** An instant-messaging
  network of 27.4 million users and the adoption of a mobile service
  (Yahoo! Go): homophily explains more than half of the perceived contagion,
  and standard methods overestimate influence by 300–700%.
- **Lerman, Yan and Wu (2016), confirmed.** With 5% active in heavy-tailed
  networks (α = 2.1), 60–80% of nodes see an active majority. The effect is
  strongest with heterogeneous degrees, active hubs and disassortative
  wiring.
- **Xulvi-Brunet and Sokolov (2004), confirmed.** The algorithm is as in the
  prompt. The disassortative variant is given in their conclusions.
- **Schelling.** The model is in Complexity Lab module 09,
  `/lab/agent-based-models`, and the lecture links to it.
- **Further reading.** Every chapter matches the sources (Barabási ch. 7,
  Latora et al. ch. 7, Easley–Kleinberg ch. 4), except Newman (2018), whose
  second-edition chapter for assortative mixing I could not confirm. The
  table of contents has ch. 7 "Measures and metrics" and ch. 10 "The
  structure of real-world networks", so the list says "Ch. 7 and 10".

## The "expected" values

The self-check uses the panel's own seeds. Following the working rule on
seeds, each limit is either yours or set from ten or more other seeds, as
stated.

- **Pearson r, preferential attachment, m = 2, three seeds:**

  | Nodes | r (three seeds) | Mean | Your expected |
  |---|---|---|---|
  | 1,000 | −0.097, −0.078, −0.109 | −0.095 | −0.09 |
  | 10,000 | −0.053, −0.045, −0.044 | −0.048 | −0.04 |
  | 100,000 | −0.025, −0.023, −0.020 | −0.023 | −0.02 |

  All are within your ±0.03. Ten other seeds at 100,000 give −0.028 to
  −0.016.
- **Spearman ρ, same networks:**

  | Nodes | ρ (three seeds) | Mean |
  |---|---|---|
  | 1,000 | −0.291, −0.295, −0.335 | −0.307 |
  | 10,000 | −0.299, −0.301, −0.305 | −0.301 |
  | 100,000 | −0.306, −0.305, −0.309 | −0.307 |

  **One value differs from your expected:** at 1,000 nodes, −0.335 is
  outside ±0.03 of −0.30. Twelve other seeds give −0.329 to −0.261, so the
  limit at 1,000 nodes is ±0.04. At 10,000 and 100,000 it stays ±0.03.
- **Erased configuration model, γ = 2.2, three seeds:**

  | Nodes | r (three seeds) | Mean r | ρ (three seeds) | Mean ρ |
  |---|---|---|---|---|
  | 1,000 | −0.103, −0.187, −0.148 | −0.146 | −0.076, −0.208, −0.155 | −0.146 |
  | 10,000 | −0.132, −0.090, −0.112 | −0.111 | −0.202, −0.176, −0.106 | −0.161 |
  | 100,000 | −0.114, −0.092, −0.108 | −0.105 | −0.116, −0.149, −0.193 | −0.153 |

  The check asks for the three-seed means at 10,000 to be below −0.1 (your
  expected −0.13 and −0.14). They are −0.111 and −0.161.

  Single seeds swing a lot. In ten other seeds at 10,000, r runs from −0.14
  to −0.09 and ρ from −0.21 to −0.06, so "every seed below −0.1" would not
  hold. The check therefore uses means, and over those ten seeds every r and
  ρ is negative, with means −0.113 and −0.132.

  **These differ from your exercise-5 numbers.** You had r −0.23, −0.13,
  −0.07 and ρ −0.25, −0.14, −0.12. At 1,000 nodes ours are weaker, and at
  100,000 r does not fade as fast. The likely cause is how the degrees are
  drawn: ours are an exact discrete power law capped at N − 1 (module 05),
  then erased.
- **Erased model, γ = 3, 10,000 nodes:** r is −0.012, −0.013, −0.020, so
  |r| < 0.05 for each seed.
- **Rich club on configuration-model networks: this expected value does not
  hold.** The normalised coefficient is 1 within 3 sd wherever at least 20
  nodes are above k for three networks: Poisson (largest z 2.02), the erased
  model at γ = 3 (1.98), and the γ = 2.5 erased network after 40 swaps per
  link (1.27).

  It is not 1 for the erased model at γ = 2.5 itself. The ratio climbs
  steadily to 1.16 for the top 21 nodes (z 3.84), with 10 or with 40 swaps
  per link. Erasing the repeated links of a configuration model is not the
  uniform null model of the swaps: with a heavy tail it leaves the hubs more
  tightly linked. The check reports this, and Panel A's observe item 6
  states it with the panel's own number (1.20 for the top 20 nodes at the
  default seed).
- **Panel B:** see the table below. The three wirings keep the degrees and
  stay simple.
  - Preferential attachment: r has the expected sign (0.304 assortative,
    −0.150 disassortative).
  - Power law at γ = 2.5: **the assortative wiring does not reach a positive
    r**. It gives −0.014, while ρ is 0.912, because the hubs are above k_s.
    For this source the sign is checked on ρ, and r is checked for order
    only (−0.014 > −0.064 > −0.104).
- **Exercises 1–4:** the exact values hold.
- **Other checks:**
  - r agrees with a brute-force Pearson on 20 random networks (to 3·10⁻¹⁵)
    and with module 02's `assortativity`.
  - ρ agrees with ranks computed by sorting (3·10⁻¹⁶) and with module 03's
    `spearman`.
  - Rewiring keeps the degrees and makes no self-link or repeated link after
    each of 3,000 steps, in four modes.
  - On preferential attachment with 10,000 nodes, r and ρ rise steadily with
    p towards assortative and fall steadily with p towards disassortative:

    | p | Assortative r | Assortative ρ | Disassortative r | Disassortative ρ |
    |---|---|---|---|---|
    | 0 | −0.010 | 0.003 | −0.010 | 0.003 |
    | 0.25 | 0.028 | 0.143 | −0.033 | −0.096 |
    | 0.5 | 0.078 | 0.310 | −0.081 | −0.265 |
    | 0.75 | 0.163 | 0.532 | −0.117 | −0.478 |
    | 1 | 0.380 | 0.965 | −0.171 | −0.959 |

## Exercise answers

All four paper answers agree with yours:

1. r = −1 for the star and −0.5 for the path.
2. k_s = 2,000. The natural cutoff is 20,000 at γ = 2.5 and 2,000 at γ = 3.
   The exponents to compare are 1/(γ − 1) and 1/2.
3. e_AA = 0.64, e_BB = 0.24, e_AB = e_BA = 0.06; r = 0.30/0.42 = 0.714;
   91.4%; Coleman 0.714 for both groups.
4. 1/6 coloured and 5/6 see a coloured majority; K2,4 for the second part.

The simulation answers:

5. Preferential attachment: r −0.095, −0.048, −0.023 and ρ −0.307, −0.301,
   −0.307. Erased model at γ = 2.2: r −0.146, −0.111, −0.105 and ρ −0.146,
   −0.161, −0.153. These differ from yours, as described above.
6. Panel B with preferential attachment, share of nodes in the largest
   component:

   | Wiring | Random 20% | Random 50% | Random 80% | Attack 2% | Attack 5% | Attack 10% |
   |---|---|---|---|---|---|---|
   | Assortative | 0.56 | 0.19 | 0.02 | 0.98 | 0.95 | 0.90 |
   | Neutral | 0.77 | 0.36 | 0.04 | 0.95 | 0.86 | 0.65 |
   | Disassortative | 0.78 | 0.41 | 0.02 | 0.76 | 0.52 | 0.35 |

   - Random removal: the disassortative wiring does best, just ahead of the
     neutral one until between 65% and 70% removed. The assortative one is
     weakest until 78%.
   - Attack: the assortative wiring is by far the most robust.

## Numbers behind each "What to observe"

All numbers are at the default seeds and pinned in
`check-network-08.mjs`, section "page".

**Panel A, "Do hubs link to hubs?"** Preferential attachment, 10,000 nodes:

- **As built:** r −0.056 and ρ −0.307. The k_nn slope from k = 3 is −0.23,
  k_s is 200 and the largest degree 190.
- **Grow N:** see exercise 5.
- **Power law, γ = 2.2:** r −0.096 and ρ −0.126; k_s is 257 and the largest
  degree 2,220.
- **Power law, γ = 3:** largest degree 171 against k_s 177; r −0.010.
- **Poisson:** r 0.005.
- **Rich-club ratio:** 0.73, 0.63, 0.64 and 0.72 at k = 5, 10, 20 and 40.
  After assortative rewiring with p = 1 it is 3.74, 6.13 and 6.20 at k = 10,
  20 and 40; after disassortative rewiring it is 0 at those three.
- **Rewiring with p = 1:** towards assortative, r 0.355, ρ 0.963 and k_nn
  slope 1.23; towards disassortative, r −0.166, ρ −0.957 and slope −0.74.
- **Power law, γ = 2.5:** the rich-club ratio reaches 1.20 for the top 20
  nodes.

**Panel B, "Mixing and robustness."** Preferential attachment, 10,000
nodes:

- r reaches 0.30, −0.02 and −0.15 for the three wirings, and ρ 0.96, −0.01
  and −0.96. The table is in exercise 6.
- The assortative curve passes the disassortative one only beyond 78%
  removed.
- Power law, γ = 2.5: the assortative wiring has r −0.014 and ρ 0.912. Under
  attack the three wirings keep:

  | Wiring | 2% | 5% | 10% |
  |---|---|---|---|
  | Assortative | 0.979 | 0.949 | 0.899 |
  | Neutral | 0.903 | 0.766 | 0.451 |
  | Disassortative | 0.525 | 0.342 | 0.180 |

**Panel C, "Birds of a feather."** 2,000 nodes:

- **Defaults, q = 0.2 and h = 0.8:** the minority is 19.2% of the nodes and
  the attribute assortativity 0.458. 86.2% of the majority's links stay
  inside against 59.6% of the minority's; Coleman's index is 0.282 and 0.500.
- **q = 0.5:** assortativity −0.013 at h = 0.5, and 0.569 at h = 0.8, with
  78.5% and 78.4% of the links inside.
- **h = 0:** assortativity −0.999.
- **q = 0.05, h = 0.8:** the minority keeps 28.1% inside, Coleman 0.245; the
  majority's Coleman is −0.068.
- **Majority illusion, top 5%, 10% and 20% of degrees coloured:** 13.7%,
  26.2% and 46.3% of the nodes see a coloured majority. Coloured at random:
  0.1%, 1.1% and 4.4%. Top degrees coloured after disassortative rewiring:
  46.6%, 66.1% and 78.3%.

**Figures.**

- **F1, first deal:** r 0.12 and ρ 0.79 assortative; r −0.43 and ρ −0.82
  disassortative. In ten deals the assortative r ranges from −0.23 to 1.00,
  and r and ρ are always higher than in the disassortative wiring. With 30
  nodes, r can even come out negative for the assortative wiring.
- **F2:** in the disassortative wiring, 6 of 20 nodes see a coloured
  majority (r −0.625); with neutral mixing, 2 of 20 (r −0.168).

## Italian terms

| English | Italian |
|---|---|
| assortative, disassortative | assortativa, disassortativa (assortatività) |
| average neighbour degree | grado medio dei vicini |
| structural cutoff | cutoff strutturale (as "cutoff naturale" in module 05) |
| rich club | rich club (coefficiente di rich club), kept in English as in `network-modules.json` |
| homophily | omofilia |
| mixing matrix | matrice di mescolamento |
| majority illusion | illusione della maggioranza |

Also used: assortatività per attributo, ricablatura, cablaggio, randomizzazione.

## Check results

All run on a fresh `npx vite build`. Prompt 8 asks for the browser checks
one at a time, and they were run that way, in the foreground. A first,
background run of the full set was stopped by Claude Code for low memory
after `check-network-07`. Every check below comes from the second run,
except the build and the module 07 browser checks of Stage 0, which were
run earlier.

| Check | Result |
|---|---|
| `npx vite build` | built, no errors |
| `check-network-01` to `-04` | all checks passed |
| `check-network-05` to `-08` | 0 failures each |
| `check-index.mjs network` | 0 of 72 failed |
| `check-index.mjs complexity` | 0 of 64 failed |
| `check-links.mjs` | 0 of 80 failed |
| `check-module.mjs network …` 01 to 08 | 0 failures each (62, 62, 56, 60, 58, 60, 58, 60 checks) |
| functional `modules/network-*.mjs` 01 to 08 | 0 failures each (25, 29, 40, 50, 58, 26, 26, 24 checks) |
| `build-main.mjs` + `compare-main.mjs` | 0 of 144 failed |

Timings in headless Chrome (module 08):

- **Page-load work:** Panel A's readouts and 20 rich-club randomisations
  finish 1.7 s after the panel appears, and Panel B 1.0 s after; both run
  across animation frames.
- **"Grow N":** 0.2 s.
- **Rewiring plus the rich club after a click:** 2.2 s.
