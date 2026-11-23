# Network Lab, prompt 10 — Module 10 "Weights, flows and navigation"

Branch `network-lab`, local commits only, nothing pushed. The prompt is
`prompts.local/network-lab-10.md` (git-ignored, not edited). Before starting:
the tree was clean, the status file showed modules 01–09 done and nothing in
progress, and `docs/reports/network-lab-09.md` was committed.

## Commits

- `54e3607` Network Lab 10: Weights, flows and navigation (two WIP checkpoints squashed; status file updated)
- this report, in its own commit: "Network Lab 10: report"

## What was built

Folder `src/components/lab/network/weights-flows-navigation/`:

- `weights.js` — strength, disparity, the disparity filter and its backbone;
  a binary heap; Dijkstra; Floyd–Warshall (for checks); Brandes betweenness
  with costs; Spearman with ties; the weighted network of Panel A.
- `flow.js` — flow networks as pairs of arcs (a channel is a pair holding the
  two balances); maximum flow by Dinic with the minimum cut; decomposition of
  a flow into routes; widest route by a bottleneck Dijkstra; brute-force
  versions for the checks; the synthetic payment network, disjoint routes and
  the uncertainty model.
- `kleinberg.js` — the offset table (once per α), the lattice, greedy routing.
- `experiments.js`, `figures.js` — panel jobs and the two presets of F2.
- `FigureStrength.jsx` (F1), `FigureFlow.jsx` (F2), `WeightsPanel.jsx` (A),
  `PaymentsPanel.jsx` (B), `NavigationPanel.jsx` (C), `texts.js`, `index.js`.

Lectures `src/content/network-lab/weights-flows-navigation.en.md` / `.it.md`
(1,452 and 1,517 words with markup, DRAFT marker, one Lightning box). Module
set to `ready`; `expect.json` has the module; functional browser check
`scripts/lab/browser-checks/modules/network-weights-flows-navigation.mjs`;
self-check `scripts/lab/check-network-10.mjs` (79 checks, about 15 s).

The module imports only shared lab code. No code of another module is used
and no shared code changed, so the regression compare was not needed.
Everything is drawn in SVG: no canvas, nothing captures touch.

## Differences from the spec

1. **Panel A, routes and betweenness.** Not "200 random pairs" plus a separate
   betweenness: 200 random sources, one random target each, and both
   betweenness rankings estimated from those same 200 sources (one Brandes
   pass per source, with and without weights). All-pairs betweenness on 5,000
   nodes would not fit the page. A pair "differs" when its cheapest route
   (cost 1/w) has more links than its shortest one: with many equally short
   routes, "a different route" has no other clean meaning.
2. **Panel A, the fit of β** is on the means of degree classes (each degree up
   to 10, then a tenth of a decade), m = 3 links per new node.
3. **Panel B, "the widest single route" of the pair readout** is by the
   balances: the most one route can really carry, to set beside the maximum
   flow. The *blind* single route of the payments is the widest by public
   capacity, as the spec says, and among those the one with the fewest
   channels (otherwise the widest route can wander anywhere).
4. **Panel B, "up to four routes".** The routes share no channel (widest by
   capacity, then the widest of what is left, …). The number of parts, 1 to 4,
   is the one the uncertainty model rates most likely, so the split strategy
   is never rated below the single route. Parts are whole numbers as equal as
   possible.
5. **Panel B, parameters stated on the page:** m = 3 channels per new node,
   capacities lognormal with median 1,000,000 and σ = 1 (natural log), whole
   numbers; the balance of one side uniform on 0 … c. Minimum cut is given as
   a number of channels, with where it falls (sender, receiver, or not all at
   one end).
6. **Panel C.** α moves in steps of 0.25. The readout uses 200 pairs as
   asked; the two sweeps use 2,000 pairs per point (one lattice per L and α),
   because with 200 or 400 pairs the minimum of a flat curve jumps about.
   "Sweep L" uses L = 25, 50, 100, 200, 400. The means are also listed under
   the "Sweep α" chart, so exercise 5 can be read off.
7. **Self-check, offsets.** The chi-square test passes for every case. "Within
   1% on the first distances" was too tight for the sampling error at α = 0
   (P(r = 1) = 4/899, so 400,000 draws give a 2.4% standard error): code
   checked (chi-square 34.6 on 29 d.o.f.), then the limit set at 4 standard
   errors on r = 1, 2, 3. Largest gaps: 1.96, 2.35, 0.81, 0.78, 1.25 standard
   errors in the five cases (the α = 2 cases are within 0.4%).
8. **Lecture section 7** quotes this code's numbers, not yours (see "expected
   values"): 85.5 and 60.1 at L = 800, not 87.2 and 61.6.
9. **The box** is 198 words in English with markup and link targets (about
   165 words of text), above the 150 asked: the two dated findings and the
   simulation's numbers each need their clause.
10. **F1 on a phone** is about 630–660 px tall (six sliders); on desktop both
    figures are about 345 px.

## "Check" figures: confirmed or softened

Checked online by a research pass against the papers (PMC, arXiv, author
copies) and official documentation.

- **Barrat et al. 2004** — confirmed: airports β = 1.5 ± 0.1; collaborations
  fitted by s = ⟨w⟩k, i.e. linear (no β with an error is quoted there, so the
  lecture says "proportional to degree").
- **Serrano et al. 2009** — confirmed for the US airport network at α = 0.05:
  17% of the links, 66% of the nodes, 83% of the weight in Table 1 and "more
  than 80%" in the text; the lecture says "more than 80%". The paper prints
  the p-value as an integral; (1 − p)^(k−1) is its closed form. Kept "for at
  least one of the two ends": confirmed.
- **Travers and Milgram 1969** — confirmed: 296 starters, 217 sent on, 64
  arrived, mean 5.2 intermediaries.
- **Dodds et al. 2003** — confirmed: 18 targets in 13 countries, 24,163
  chains, 384 completed, median estimated at five to seven steps after
  attrition. I did not use "median 4": 4.05 is the *mean* of completed chains.
- **Kleinberg 2000** — worded as the papers state it: (log N)² at α = 2 for
  greedy routing; for α ≠ 2 a *lower* bound that is a power of the size, for
  any decentralised rule.
- **Boguñá, Krioukov, claffy 2009** — confirmed in general terms
  (heterogeneous degrees and strong clustering, hidden metric space). No
  exponent quoted: 2.6 is not a universal cut-off in the paper.
- **Liben-Nowell et al. 2005** — confirmed: 495,836 US users ("about
  500,000"), friendship ∝ 1/rank. The "two thirds geographic" figure is not
  in the lecture.
- **Lightning box.**
  - Capacity public, balance private; multi-part payments: BOLT #7 and BOLT
    #4 ("Basic multi-part payments").
  - Pickhardt and Richter 2021, arXiv:2107.05322: title, authors, uniform
    prior, most probable flow — confirmed.
  - Used by implementations: confirmed for Core Lightning, whose changelog
    for v23.08 (23 August 2023) lists "renepay: an experimental pay plugin
    implementing Pickhardt payments". The box says exactly that, with the
    date. Not said in the box: LDK's scorer uses the paper's probability
    formula (not a flow solver); LND has its own estimators; renepay is now
    marked deprecated in favour of askrene/xpay (v24.11), also flow-based.
    You may prefer "has shipped … since 23.08" reworded if renepay goes away.
  - Lin et al. 2020 (NJP 22, 083022): confirmed, data 12 January 2018 – 17
    July 2019; "10% of the nodes hold 80% of the bitcoins" is their average
    over the period, and the box says "on average" with the dates.
    Bibliographic details from the arXiv journal reference (the IOP page was
    not reachable).
  - Seres et al. 2020: confirmed (Springer Proceedings in Business and
    Economics, pp. 1–12; snapshot of 3 January 2019; power-law fit plausible).
    The box says "heavy-tailed degrees" with the snapshot date. "Increasingly
    centralised" is not asserted as such: the box gives Lin's dated number.
  - No live statistic is quoted.
- **Poon and Dryja** — confirmed: draft version 0.5.9.2, 14 January 2016.
- **Books** — Newman 2nd ed.: Ch. 6 (6.3 weighted networks, 6.13 cut sets)
  and Ch. 8 (8.5–8.7 shortest paths, maximum flow), from a library catalogue,
  not the book itself. Latora et al. Ch. 10 "Weighted networks": confirmed.
  Easley and Kleinberg Ch. 20: confirmed. Barabási: only Ch. 3 (small worlds)
  is cited; the book has no chapter on weighted networks, so Ch. 4 was
  dropped.

## The "expected" values

Kleinberg lattice, mean steps (this code: one lattice per L and α, 2,000
pairs; yours in brackets):

| L | α = 0 | α = 1 | α = 1.5 | α = 2 | α = 2.5 | α = 3 |
|---|---|---|---|---|---|---|
| 50 | 13.3 (12.9) | 12.5 (12.4) | 13.4 (12.7) | 14.7 (14.5) | 17.2 (16.8) | 20.0 (20.5) |
| 100 | 21.3 (21.0) | 19.5 (19.1) | 19.6 (20.0) | 22.8 (23.0) | 29.6 (29.4) | 38.2 (37.9) |
| 200 | 34.6 (33.9) | 28.6 (28.6) | 27.9 (28.0) | 32.7 (32.8) | 48.8 (49.3) | 70.6 (69.8) |
| 400 | 54.9 (55.1) | | 38.4 (37.7) | 45.2 (45.0) | | |
| 800 | 85.5 (87.2) | | 50.9 (53.1) | 60.1 (61.6) | | |

All within 15% (the largest gap is 5.5%, α = 1.5 at L = 50). L = 400 and 800
ran in 0.1 s and 0.3 s. Ratio of α = 2 to α = 0: 1.10, 1.07, 0.95, 0.82, 0.70
at L = 50 … 800 (yours: 1.12, 1.10, 0.97, 0.82, 0.71). Minimum of the sweep:
α = 1, 1.25, 1.5, 1.5 at L = 50, 100, 200, 400; at L = 800, α = 1.5 still
beats 2. This agrees with your finding that the best α is about 1.5.

Other self-check numbers:

- Dijkstra against Floyd–Warshall on 20 networks, every pair: difference 0.
  Betweenness with costs against a direct count on 10 networks: 0 mismatches.
- Maximum flow = brute-force minimum cut on 50 directed networks and on 20
  networks of channels: difference 0. Widest route against brute force: 0
  mismatches.
- Disparity: Y = 1/k for equal weights (error 3 × 10⁻¹⁷); the p-value against
  200,000 random splits in 5 cases: largest gap 0.001.
- Strength: θ = 0, no noise: β = 1.0000. θ = 0.5, no noise, ten seeds:
  β from 1.44 to 1.46 (below 1 + θ because hubs link mostly to small nodes).
- Payments: (c + 1 − a)/(c + 1) against 100,000 uniform balances, 10 cases:
  largest gap 0.0017. On whole routes: predicted 0.539, observed 0.534.
- Greedy routing: 2,000 routes all arrive; every step is a contact and gets
  closer.

## Exercise answers

1. As yours: 10, 6, 0.30, 0.167; α = 0.5⁵ = 0.031, significant. Added: a link
   of weight 1 has α = 0.9⁵ = 0.590.
2. As yours: A–C–B–D costs 4; A–B–D 5 and A–C–D 6.
3. As yours: 2; 5 by s–a–t 2, s–b–t 2, s–a–b–t 1; cut {s→a, s→b} = 5. Added:
   {a→t, b→t} is also a minimum cut of capacity 5.
4. As yours: 0.125; 0.422 and 0.178; 0.670 and 0.201. Added: with n parts the
   probability is (1 − 1/(2n))^(3n), which tends to e^(−1.5) = 0.223.
5. The table above; minimum at α = 1, 1.25, 1.5; ratio 1.10, 1.07, 0.95.
6. A single blind route: 60.0% at 5% of the outgoing balance, 38.6% at 10%,
   below one half at about 7%. Up to four routes: 60.2% and 39.0%, the same
   crossing. Every balance known: below one half at about 71%.

No answer differs from yours.

## Numbers behind each "What to observe"

**Panel A** (2,000 nodes, θ = 0.5, noise 0.5): β = 1.45; mean Y 0.417 at
k = 3 and 0.156 at k = 10 (1/k: 0.333, 0.100). Shuffled: β = 1.01. Backbone
at 0.05: 4.6% of the links, 19.5% of the weight, 14.1% of the nodes, largest
component 11.2%; at 0.2: 22.9%, 51.9%, 60.1%, 54.6%. θ = 1 at 0.05: 15.2% of
the links, 69.0% of the weight. Shuffled at 0.05: largest component 1.3%.
Routes: 67.5% of the pairs differ, 3.71 → 4.80 links, Spearman 0.660. θ = 0
and no noise: nothing differs, ρ = 1, the filter keeps nothing.

This synthetic network does not reproduce the airports' "17% of links, 80%
of weight": with θ = 0.5 the weight is much less concentrated. θ = 1 comes
closer.

**Panel B** (1,000 nodes, 2,994 channels). Random pair: outgoing 3,922,500;
best single route 827,166 over 8 channels; maximum flow 3,922,500; cut = the
sender's 3 channels. Small nodes: maximum flow 945,059, cut at the receiver.
Hubs: 55,670,642 against 3,510,243 on one route; cut of 111 channels.
Success, single / split / full knowledge:

| amount | 1% | 5% | 10% | 20% | 50% | 100% |
|---|---|---|---|---|---|---|
| one route | 0.916 | 0.600 | 0.386 | 0.210 | 0.044 | 0.000 |
| up to four | 0.922 | 0.602 | 0.390 | 0.222 | 0.052 | 0.000 |
| all known | 1.000 | 0.994 | 0.952 | 0.894 | 0.636 | 0.332 |

Model for one route at 20%: 0.195 against 0.210 observed. The model slightly
underrates small payments and overrates the largest ones, because the amount
is tied to the sender's own balances; within 0.05 up to half the balance.

The finding worth your attention: **blind equal splitting adds almost
nothing** (at most 0.014). The later routes are narrower and longer, and the
model itself advises 1.3 to 1.5 parts on average. This is what the code
gives, not what the box's "splitting helps" might lead a reader to expect;
observation 4 and exercise 4 say why, and that sizing parts on what is known
is where the gain is. If you would rather see splitting help visibly, the
panel would need a strategy that learns from failed attempts, which is
beyond this spec.

**Panel C**: L = 100, α = 2: mean 23.6, median 23, grid distance 50.6. L = 40:
a route of 14 steps for a distance of 20, 3 long jumps in the first 5 steps.
Sweep α at L = 100: 21.3, minimum 19.4 at 1.25, 22.8 at 2, 46.9 at 4. Sweep
L slopes: 0.70, 0.54, 0.58, 0.74 for α = 0, 1.5, 2, 2.5.

Timings in headless Chrome: on page load Panel A 0.6 s and Panel B 1.3 s,
across animation frames; "Sweep α" 0.2 s; "Sweep L" 0.3 s. Panel B at 2,000
nodes takes about 3 s in Node (after moving the slider, with a progress
line).

## Italian terms

weight = peso; strength = forza; disparity = disparità; backbone = dorsale
(*backbone* given once); disparity filter = filtro di disparità; maximum flow
= flusso massimo; minimum cut = taglio minimo; widest path = cammino più
largo (route = percorso); payment channel = canale di pagamento; multi-part
payment = pagamento in più parti (*multi-part payments* given once); greedy
routing = instradamento greedy; navigability = navigabilità ("rendono
navigabile una rete"). Also: capacità, strozzatura (bottleneck), saldo
(balance), contatto a lungo raggio, reticolo, toro. Titles as you gave them:
"Forza e disparità", "Una strada o più", "I pesi contano", "Quanto può
passare?", "Trova la strada".

## Check results

All run in the foreground, one command at a time.

- `npx vite build`: built.
- `check-network-01` … `04`: all checks passed; `05` … `09`: 0 failures;
  `check-network-10`: 0 failures of 79.
- `check-index.mjs network`: 0 of 72; `complexity`: 0 of 64.
- `check-links.mjs`: 0 of 80.
- `check-module.mjs network <slug>`, modules 01–10: 0 failures (62, 62, 56,
  60, 58, 60, 58, 60, 62, 56 checks).
- Functional checks `modules/network-*.mjs`, modules 01–10: 0 failures (25,
  29, 40, 50, 58, 26, 26, 24, 29, 36 checks).
- Regression compare: not run, no shared code changed.

## Open points for you

- The DRAFT lecture, above all the box's sentence on Core Lightning and the
  wording of Kleinberg's result.
- Whether Panel B's result on blind splitting is the lesson you want there.
- Whether the box may stay at about 165 words.
