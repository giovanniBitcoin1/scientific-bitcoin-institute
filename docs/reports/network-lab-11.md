# Network Lab — report on prompt 11

One fix to module 10, then module 11 "Robustness and cascades"
(`/network-lab/robustness-and-cascades`). Branch `network-lab`, nothing pushed.

## Commits

| Commit | What |
|---|---|
| `d405929` | Network Lab 10: fixes |
| `1b58219` | Network Lab 11: Robustness and cascades (two WIP checkpoints squashed; status file updated) |
| this commit | Network Lab 11: report |

Preconditions held at the start: clean tree, modules 01–10 done, nothing in
progress, `docs/reports/network-lab-10.md` committed.

## Stage 0 — what changed in module 10

Only the Lightning box, EN and IT, and its checks.

- The sentence "Splitting a payment over several routes (multi-part payments)
  helps, as max-flow min-cut suggests" is gone. The box now says: max-flow
  min-cut shows that several routes together can carry far more than any single
  one, which is what multi-part payments exploit; but splitting blindly gains
  little, because the extra routes are narrower and the balances are still
  unknown; the gain comes from what the sender knows or learns.
- The panel's largest gain is quoted in the box's last sentence: splitting
  blind "adds at most 1.4 percentage points of success" (0.0140, at 2% of the
  sender's balance: 0.816 against 0.802).
- "has shipped … since version 23.08" became "Core Lightning first shipped an
  experimental plugin built on their method in version 23.08 (August 2023)".
- `check-network-10.mjs`: three new "page" checks pin the 1.4 (computed from
  the panel's rows, EN and IT) and the new wording. 0 failures; lecture words
  1,498 EN / 1,574 IT.
- **Length:** the box grew from about 208 to 244 words in English (IT 280).
  The two things asked for did not fit in the old length without dropping one
  of the cited results; tell me if you want it trimmed and what to drop.
- Browser checks of module 10: `check-module` 0 failures of 56,
  functional check 0 of 36.

## Module 11 — what was built

Folder `src/components/lab/network/robustness-and-cascades/`:
`robust.js` (pure logic), `experiments.js`, `figures.js`, `FigureFail.jsx`,
`FigureCascade.jsx`, `AttackPanel.jsx`, `OverloadPanel.jsx`,
`CoupledPanel.jsx`, `texts.js`, `index.js`; the two lectures;
`scripts/lab/check-network-11.mjs`;
`scripts/lab/browser-checks/modules/network-robustness-and-cascades.mjs`;
`expect.json`; `status: "ready"`.

Reuse: module 08's `giantCurve`, `randomOrder`, `attackOrder`, `makeSource`,
`pearsonR`, `spearmanRho` (and through it module 05's configuration model and
module 02's swap), imported without change. **No shared code changed**, so no
regression compare was run. Module 10's Brandes was not reused: it runs
Dijkstra with a heap on a fixed network, and module 11 needs unit lengths and a
mask of working nodes recomputed thousands of times. Module 11 has its own
breadth-first version, and the self-check verifies that it gives the same
betweenness as module 10's.

Lecture: 1,628 words EN, 1,671 IT (with markup), DRAFT marker, two live
figures, one box. Bitcoin box: 177 words EN, 185 IT (the prompt said about
150; the verified version numbers took the extra).

## What differs from the spec

1. **Panel A, the "drawing" of the optimised network.** I first drew the
   network before and after (nodes by degree, same-layer links in orange) and
   wrote that the links "form rings". The picture showed nothing of the kind:
   two indistinguishable orange discs. I removed it and the sentence. The
   panel now shows two small tables of who links to whom by degree class
   (≤2, 3, 4, 5–6, 7–10, 11–20, 21+), before and after, each cell the
   percentage of that class's link ends that lead to the column's class. The
   onion is plain there: before, no node of degree 2 is linked to another and
   the hubs send 36% of their links to degree-2 nodes and 8% to one another;
   after, 20%, 13% and 19%. If you want a node-link drawing as well, it needs a
   much smaller network than the one being optimised.
2. **Panel A defaults to N = 1,000**, not 10,000, so that "Make it robust" and
   the recomputed betweenness are available on the default network. Exercise 5
   asks the reader to set 10,000.
3. **Power-law source:** k_min = 2 and the mean degree follows from γ; the
   mean-degree slider is replaced by the γ slider for that source.
   Preferential attachment takes even mean degrees only.
4. **Betweenness and the optimisation run on buttons** (8.5 s and 7.2 s in
   headless Chrome at 1,000 nodes). Above 1,000 nodes the betweenness of the
   intact network is used once, and the panel says so; that takes about 13 s at
   10,000 nodes in Node.
5. **The optimiser stops after 20,000 attempted swaps**, or on "Stop". It has
   not converged by then: R is 0.126 after 1,000 attempts, 0.171 after 5,000,
   0.197 after 10,000, 0.221 after 20,000.
6. **Panel B, definition of load:** shortest paths through the node *plus* the
   paths that end at it. With betweenness alone a node that lies between no
   pair has capacity 0 and fails at the first rerouting, whatever α. The panel
   states the definition; the lecture says "passing through it".
7. **Panel B's sweep** uses α = 0, 0.1, …, 1 (the slider moves in steps of
   0.05): 5.6 s at 400 nodes in the browser, about half a minute at 1,000.
8. **Panel C:** the cascade counter is called "steps" (one turn of A or B that
   removed something), since "round" is used for Motter–Lai in Panel B. The
   whole sweep over p runs at page load (0.3–0.4 s, across animation frames).
   The power-law pair is fixed at γ = 2.5, k_min = 2, and is shown against the
   theory of two random networks with its mean degree.
9. **"Zero" for the mutual giant component** means below 1% of N. The cascade
   always ends on something connected in both networks, if only one node, so
   the measured value below the threshold is 0.0001–0.0002, not 0.
10. **F2** uses two hand-picked networks (15 nodes, 18 links each); I searched
    seeds for a pair in which one removal gives a long cascade and most others
    a short one. This is a choice of illustration, not of a check.
11. Figure heights: 361 and 364 px at 1280 px (the guide says about 340);
    F1 is 632 px at 375 px, where the drawing and the chart stack.

## Exercises — answers recomputed

| Ex. | Yours | Mine | |
|---|---|---|---|
| 1 | 0.75; 0.958 | 0.75; 0.9583 | same |
| 2 | 0.614; 0.314; 0.25 from zero | 0.6139; 0.3141; 0.25 from zero | same |
| 3 | 5/36 = 0.139; 15/36 = 0.417 | same | same |
| 4 | 0.0039, 0.168; 0.00098, 0.107 | 0.00391, 0.1678; 0.000977, 0.1074 | same |
| 5 random network | 0.40, 0.10, 0.005 / 0.97, 0.92, 0.85, 0.68 | 0.399, 0.095, 0.004 / 0.970, 0.921, 0.854, 0.687 | same within noise |
| 5 pref. attachment | 0.40, 0.14, 0.05 / 0.97, 0.83, 0.57, 0.004 | 0.389, 0.130, 0.038 / 0.975, 0.835, 0.563, 0.006 | same within noise |
| 6 | 0, 0.38 (0.36–0.40), 0.45, 0.55, 0.71 | 0.000, 0.365, 0.461, 0.555, 0.707 (ten other pairs at 0.62: 0.362–0.393) | same |

None differs.

## Self-checks (`check-network-11.mjs`, 74 checks, 0 failures, about 2 min)

"Expected" values: none differed, and no limit had to be changed.

- Exercises 1–4 exactly. Constant by golden-section search:
  2.4554074823 at y = 1.2564312040.
- Removal curves: union–find against a direct search of the components at
  every step, 20 small networks × 5 orders (random, initial degree, recomputed
  degree, betweenness, recomputed betweenness): 100 of 100 identical. Recomputed
  degree: every removed node has the highest degree left, at every step.
- Loads: Brandes against a brute count over all pairs, 12 networks, whole and
  with nodes missing, with and without endpoints: largest difference 4.5e-13;
  against module 10's betweenness: 5.7e-14.
- Random removal, random networks ⟨k⟩ = 4, N = 10,000, 10 networks: below 1% of
  N at 0.742–0.793, **mean 0.767** (limits 0.72–0.80, theory 0.75). At 50%
  removed 0.399 against the theory's 0.398.
- Attack by initial degree, preferential attachment m = 2, N = 10,000, 10
  networks: below 1% of N at 0.160–0.186, **mean 0.172** (expected about 0.17;
  limit 0.25).
- Coupled networks, 10 pairs: mean 0.462, 0.559, 0.709 at p = 0.65, 0.70, 0.80
  (theory 0.460, 0.558, 0.709; expected 0.45, 0.55, 0.71); the worst single run
  is 0.015 from the theory (limit 0.03). At p = 0.58: below 1% of N in **10 of
  10**. The cascade also matches a slow direct version on 10 pairs of 200
  nodes.
- Motter–Lai: with α = 100 only the trigger fails (two networks, six triggers
  each). A cascade replayed with the brute-force loads fails the same nodes in
  the same rounds. G against α, 400 nodes, mean degree 4:

  | α | pref. att., top | pref. att., random | random net, top | random net, random |
  |---|---|---|---|---|
  | 0 | 0.008 (1 round) | 0.256 | 0.085 | 0.208 |
  | 0.1 | 0.048 (1) | 0.991 | 0.058 (7) | 0.895 |
  | 0.2 | 0.070 (2) | 0.996 | 0.930 | 0.980 |
  | 0.3 | 0.155 (4) | 0.997 | 0.943 | 0.980 |
  | 0.4 | 0.508 (8) | 0.997 | 0.945 | 0.980 |
  | 0.5 | 0.758 (6) | 0.998 | 0.950 | 0.980 |
  | 0.6 | 0.898 (5) | 0.998 | 0.950 | 0.980 |
  | 0.7 | 0.953 (2) | 0.998 | 0.953 | 0.980 |
  | 0.8 | 0.958 (2) | 0.998 | 0.953 | 0.980 |
  | 0.9 | 0.968 (2) | 0.998 | 0.955 | 0.980 |
  | 1.0 | 0.993 (1) | 0.998 | 0.955 | 0.980 |

- Robustness optimisation on the default network (preferential attachment,
  1,000 nodes, 1,997 links): 1,793 of 20,000 swaps accepted; degrees unchanged
  and the network simple after every one; R rises at every one;
  **R 0.097 → 0.221**; collapse 0.207 → 0.368; r −0.097 → 0.096; ρ −0.317 →
  0.307. Two things it was not optimised for: R under attack by *initial*
  degree with ties at random rises too, 0.102 → 0.194 (so the gain is not an
  artefact of my tie rule); R under random removal **falls**, 0.416 → 0.386.
  The lecture and the panel's notes say so.

## The numbers behind each "What to observe"

**Panel A.** Default (pref. attachment, 1,000 nodes): ⟨k⟩ 3.99, ⟨k²⟩ 45.85,
formula 0.905; random 0.881 / R 0.416; initial degree 0.272 / 0.101; recomputed
degree 0.207 / 0.097; recomputed betweenness 0.158 / 0.082, and at f = 0.10 it
leaves 0.172 against 0.539. Random network: formula 0.748; random 0.831 (0.766
at 10,000 nodes); 0.491 / 0.244; 0.325 / 0.204. Power law γ = 2.5: ⟨k²⟩ 120.3,
formula 0.961, recomputed degree leaves 0.150 at f = 0.10. At 10,000 nodes the
formula gives 0.932 for preferential attachment. One thing worth knowing: at
1,000 nodes the measured point for the random network (0.831) is well above the
formula (0.748), because 1% of N is ten nodes; the text says so.

**Panel B.** Default: top node of degree 55, load 25,793, mean load 939;
2 rounds, 161 nodes fail, G = 0.070. Random node: 1.25 nodes fail on average,
G = 0.996. Sweep as in the table above; longest cascade 8 rounds at α = 0.4.
Random network: highest load 3,704, mean 1,057.

**Panel C.** Default (10,000 nodes, ⟨k⟩ = 4): p = 0.70 gives 0.555 (theory
0.558) in 7 steps, single 0.647; 0.65 → 0.461; 0.62 → 0.365 in 15 steps;
0.61 → nothing in 31 steps (single 0.539); formula 0.614; most steps 31 at
0.61. ⟨k⟩ = 6: from p = 0.41 (formula 0.409). Power-law pair: ⟨k⟩ 4.40, mutual
giant from 0.68 (two random networks would need 0.558), single from 0.13
(1/⟨k⟩ = 0.227).

**Figures.** F1: 60 nodes, 117 links, highest degree 18; after 10 removals the
attack leaves 9 and random removal 45. F2: removing A4 gives 7 rounds and
leaves 7 of 15 pairs.

## "Check" items: confirmed and softened

Checked by a sub-agent against the papers (arXiv or publisher PDFs), Bitcoin
Core's source and release notes, and the Task Force report, in November 2026.

**Confirmed and used as written**

- Albert, Jeong, Barabási (2000): model networks of 10,000 nodes and 20,000
  links; 5% random failures leave the average distance unchanged and 5% taken
  from the top double it; f_c ≈ 0.28 (random network), ≈ 0.18 (scale-free under
  attack), ≈ 0.03 (Internet, 6,209 nodes), 0.067 (WWW sample, 325,729 nodes).
  Their "diameter" is the average distance, which is what the lecture says.
  The 5% figures are for the model, and the lecture attributes them to it.
- Cohen et al. (2000): κ = ⟨k²⟩/⟨k⟩, 1 − p_c = 1/(κ₀ − 1), and "over 99%" for
  the Internet.
- Schneider et al. (2011): R = (1/N) Σ s(Q) with 1/N; range 1/N (star) to 0.5
  (complete); degrees recalculated during the attack; swaps accepted when R
  rises; the "onion-like" description; +45% (EU power grid) and +55% (Internet
  at point-of-presence level) with about 5% of the links changed. The preprint
  is inconsistent on the figures for 2% of links, so only the 5% pair is
  quoted.
- Motter and Lai (2002): C = (1 + α)L, load = shortest paths through the node,
  G = N′/N; scale-free networks of about 5,000 nodes lose more than 20% at
  α = 1 from one removal; a homogeneous network does not cascade at α = 0.05.
- Blackout of 14 August 2003: an area with an estimated 50 million people;
  began in Ohio (Task Force final report, April 2004, now in the reading list).
- Buldyrev et al. (2010): the Italian blackout of 28 September 2003;
  p_c = 2.4554/⟨k⟩; first-order transition; size 1.2564/⟨k⟩ at the threshold;
  broader distributions are more vulnerable when coupled.
- Callaway et al. (2000), Holme et al. (2002), Heilman et al. (2015, pp.
  129–144), Apostolaki et al. (2017, pp. 375–392), Rohrer et al. (2019, pp.
  347–356), Newman 2nd ed. ch. 15, Barabási ch. 8: titles, pages, chapters.

**Softened or changed**

- Cohen et al. (2001): the text has no "x% suffices"; the numbers are only in
  the figures (p_c up to about 0.06–0.07). The lecture says "a modest fraction,
  a few per cent in their figures".
- Holme et al. (2002): recalculated orders are "often" more harmful, not
  always (their own word; they report an exception for small-world networks).
  The lecture says "often".
- Rohrer et al. (2019): **not confirmed** that removing "a few" central nodes
  fragments the channel graph. They report, on the snapshot of 1 February 2019
  (2,400 nodes, 13,884 channels), that removal by degree or betweenness cuts
  the success of payments steeply (from 675 of 1,000 to around 10%), while
  random failures split off mostly single nodes or pairs. The box says:
  "removing the best-connected nodes sharply cut the share of payments that
  found a route, while random failures split off little", with no number.
- Latora, Nicosia and Russo (2017): no chapter is titled robustness or
  percolation, and I could not establish where the topic sits. Cited as a book,
  without a chapter.
- Nature and PNAS pages could not be opened; the Nature paper of Buldyrev et
  al. was read from a university copy of the PDF, Schneider et al. and Albert
  et al. from arXiv.

**The box: what was verified, and from where**

- *8 full-relay and 2 block-relay-only outbound connections*: constants
  `MAX_OUTBOUND_FULL_RELAY_CONNECTIONS = 8` and
  `MAX_BLOCK_RELAY_ONLY_CONNECTIONS = 2` in `src/net.h` on master, latest
  release Bitcoin Core 32.1 (28 October 2026). Same wording as module 01, and a
  check compares the two files.
- **Something you may not expect:** the default limit of connections is no
  longer 125. Version 32.0 raised `-maxconnections` to 200 (release notes,
  PR #28463); 31.x and earlier have 125. The box quotes neither number. If
  module 01 or any other text says 125, it is now out of date; I found no such
  sentence in module 01.
- *Countermeasures of Heilman et al.*: the paper itself says versions 0.10.1
  deployed three of them (deterministic random eviction, random selection, more
  buckets), and the 0.10.1 release notes agree. Feeler connections first
  shipped in **0.13.1** (PR #8282; checked in the source: absent in 0.13.0),
  not 0.14.0 as I had remembered. Test-before-evict: 0.17.0 (PR #9037). The box
  gives these three versions. Not in the box: block-relay-only connections came
  in 0.19.0.1 and are kept across restarts since 0.21.0.
- *Apostolaki et al.*: "13 ASes host 30% of the entire network", from ten days
  of data starting 5 November 2015. Quoted with that date.
- No live statistic is quoted.

## References that could not be confirmed

Only the two above: a chapter for Latora, Nicosia and Russo, and the "few
nodes" claim for Rohrer et al.; both are handled in the text.

## Italian terms chosen

robustness = robustezza; random failure = guasto casuale; targeted attack =
attacco mirato (attacco agli hub in the figure); critical fraction = frazione
critica; onion structure = struttura a cipolla ("a cipolla"); overload =
sovraccarico; tolerance = tolleranza; cascade = cascata; interdependent
networks = reti interdipendenti (the panel and lecture say reti accoppiate,
"reti che dipendono da reti"); mutual giant component = componente gigante
mutua; eclipse attack = attacco di eclissi (eclissi, with *eclipse attack* in
italics at first use). Also: load = carico, round = turno, trigger = innesco,
step = passo.

## Checks run (each as its own foreground command, on the final build)

| Check | Result |
|---|---|
| `npx vite build` | built |
| `check-network-01` … `04` | all checks passed |
| `check-network-05` … `10` | 0 failures each |
| `check-network-11` | 0 failures (74 checks) |
| `check-index network` | 0 failures of 72 |
| `check-index complexity` | 0 failures of 64 |
| `check-links` | 0 failures of 80 |
| `check-module network <slug>`, modules 01–11 | 0 failures each (62, 62, 56, 60, 58, 60, 58, 60, 62, 56, 58 checks) |
| functional checks, modules 01–11 | 0 failures each (25, 29, 40, 50, 58, 26, 26, 24, 29, 36, 36 checks) |
| regression compare against main | not run: no shared code changed |

Module 11 in the browser: no console errors, no horizontal scroll at 375 px,
one canvas (Panel B's drawing, which takes no touch).

## Open points for you

1. Module 10's box is about 36 words longer than before.
2. Panel A shows class tables instead of a drawing (point 1 above).
3. The definition of load in Panel B includes the paths that end at the node.
4. The lecture carries the DRAFT marker.
5. `scripts/lab/browser-checks/README.md` still lists the run commands only up
   to module 07; I did not touch it.
