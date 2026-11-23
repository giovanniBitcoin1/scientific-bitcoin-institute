# Network Lab — report on prompt 13

Module 13 "Social contagion and network effects"
(`/network-lab/social-contagion-network-effects`). Branch `network-lab`,
nothing pushed. There was no Stage 0: your review of module 12 needed no
fixes, and the status file now records that the Colgate check is done.

## Commits

| Commit | What |
|---|---|
| `d91da04` | Network Lab 13: Social contagion and network effects (three WIP checkpoints squashed; status file, `expect.json` and README of the browser checks updated) |
| this commit | Network Lab 13: report |

Preconditions at the start: branch `network-lab`, clean tree, modules 01–12
done, nothing in progress, `docs/reports/network-lab-12.md` committed.

## What was built

- **Lecture**, EN and IT, DRAFT marker, 1,626 and 1,697 words (with markup,
  up to the simulation marker). Nine sections in the order of your outline,
  one box, two live figures, 27 references.
- **Live figures.** F2 "Wrong together" (first in the text, in section 2):
  thirty people in a row with signal and choice, the start of the cascade
  marked, slider q from 0.55 to 0.9, "New sequence", "Run 1,000 times". F1
  "The riot that almost happened": the 10 × 10 grid with thresholds 0 to 99,
  Start, Reset, and two switches "Tap: +1" / "Tap: −1".
- **Panel A "Tipping points"**, three views: a crowd (curve, staircase,
  outcome, "New crowd", "200 crowds", sweep of the standard deviation), a
  market (z(1 − z) against the price, the three equilibria, the path from
  z₀), the Bass curve (F(t), the rate, time and height of the peak).
- **Panel B "The cascade window"**: random network or preferential
  attachment, seed at random or among the 20 largest hubs, sliders φ and z;
  share of global cascades, their mean size, vulnerable nodes, the cascade
  condition for the network's own degrees, the window from the formula, the
  histogram of sizes; "Sweep the mean degree" on a button.
- **Panel C "Clusters and long ties"**, two views: the small-world ring
  (table and two charts against p, with p = 0 on the logarithmic axis) and
  the two groups (sliders q and k_out, the curve against k_out, the point
  where the average outside share equals q).
- **Six exercises**: 1 and 2 on paper and in the figures, 3 to 5 on paper, 6
  in the simulations.
- **Logic** in `contagion.js`, `experiments.js`, `figures.js`; self-check
  `scripts/lab/check-network-13.mjs` (133 checks); browser check
  `scripts/lab/browser-checks/modules/network-social-contagion-network-effects.mjs`
  (45 checks).

Reused without changes: `wattsStrogatz` from the shared `graphUtils.js` (the
Complexity Lab's small-world generator, imported where it is), module 09's
`twoGroupSBM`, module 08's `makeSource`, module 11's `seedOf`, `moments`,
`drain`. Module 12's `spread` takes a single seed, so the cascades have
their own pass (a counter per node and a queue, as you specified); the
self-check confirms that with one adopting neighbour enough it reproduces
`spread` with β = 1 node for node and step for step. Module 05's generating
functions were not needed: the cascade condition is a short sum. Vite now
puts `community.js` in a small chunk of its own, loaded only when unlocked.
**No shared code changed, so the regression compare was not run.**

## What differs from the spec

1. **Sultan, Farley and Lehmann (softened).** The averages p = 0.03 and
   q = 0.38 could be confirmed only through papers that cite them, not in
   the article itself. The lecture says: "A meta-analysis of 213
   applications (Sultan, Farley and Lehmann 1990) is usually quoted for
   averages near p = 0.03 and q = 0.38 a year".
2. **The cluster theorem is attributed to Easley and Kleinberg.** Morris
   (2000) proves it for infinite populations in terms of "p-cohesive"
   groups and does not use a, b or "density". The statement you gave is,
   word for word, the Claim of Easley and Kleinberg's section 19.3
   ("density greater than 1 − q", strictly). The lecture gives q = b/(a + b)
   with "(Morris 2000)" and then "In the form given by Easley and Kleinberg
   (2010), such clusters are the only obstacle".
3. **Ugander et al.** The abstract speaks of "the probability of contagion"
   and does not mention invitations; the lecture says "the chance of joining
   Facebook was governed by the number of separate groups among a person's
   contacts already there, not by the number of contacts", without "after an
   invitation".
4. **"With half the links or more rewired it does not spread at all"** is
   nearly true, not exactly: over eleven sets of 20 networks, complex
   contagion reached 90% in 4 networks of 220 at p = 0.5, and in none at
   p = 1. The panel's own ten networks give 0.005 of the nodes at p = 0.5.
   Exercise 6 says "rare, not impossible".
5. **Panel B, slider of z in steps of 0.05**, so that exercise 6 can ask for
   z = 5.8 and 6.2; the sweep keeps steps of 0.25 (31 values). Under
   preferential attachment the mean degree is the nearest even number and
   the sweep has z = 2, 4, 6, 8.
6. **What runs when the page loads.** The panel at one z (a network of
   10,000 nodes and 200 cascades), the long-ties table (100 networks) and
   the cluster curve (420 networks) run on load: the whole page was ready
   1.6 s and 3.1 s after navigation in two headless runs, Panel C 0.4–0.7 s
   after it appeared. On buttons: "200 crowds", the sweep of the standard
   deviation (0.3 s), the sweep of z (1.2–2.5 s), "Run 1,000 times".
7. **Long ties: the points** are p = 0, 0.001, 0.003, 0.01, 0.03, 0.1, 0.2,
   0.3, 0.5, 1 (0.2 added), with p = 0 drawn at the left end of the
   logarithmic axis and labelled 0.
8. **F2: an even split** of the thirty signals counts as half a success, in
   the page and in the binomial value shown beside it (0.864 for thirty at
   q = 0.6; exercise 2 asks for 25 people, 0.846).
9. **The box is 178 words in English and 190 in Italian** (you asked for
   about 160): everything on your list is there and I did not cut content
   to shorten it. It contains the word "price" twice ("price against
   addresses"), as your outline has it; no price level, forecast or current
   statistic.
10. **Two references added** to the reading list because the lecture cites
    them: Shalizi and Thomas (2011) and Aral, Muchnik and Sundararajan
    (2009), in the same lines as module 08.
11. **Figure heights**: F2 333 px and F1 376 px at 1280 px (F1 is above the
    340 px guideline, like module 12's); 292–330 px and 499 px at 375 px.

### A quirk of Node 24, not of the model

While pinning the texts, a number changed for no reason: the first batch of
F2 (316 wrong of 1,000, 0.316) read 0.416 later in the same run. The trace
showed that once `cascadeStats` had been optimised by Node 24.22, calling it
again overwrote the two decimal fields of the object it had returned
earlier (the whole-number fields were untouched; the function has no shared
state, and in a short script it does not happen). I made the function
return whole numbers only (`majority2` is twice the count), with
`wrongShareOf` and `majorityOf` for the shares, and added a check that an
earlier batch is unchanged after later ones. The browser check then compares
Chrome's numbers with Node's (316, 0.316, 0.846; 15 and 0.015 for the second
batch at q = 0.9). I did not see it anywhere else, but it is recorded in the
status file in case a quoted number ever moves by itself.

## Exercises — answers recomputed

| | Yours | Mine |
|---|---|---|
| 1 | 100; 1; 0; nothing about dispositions | the same (also: raising any one threshold by one stops the riot at that person) |
| 2 | 0.308 and 0.155; 0.48⁵ = 0.025; 0.846 | 0.3077 and 0.1552; 0.0255; 0.8462 |
| 3 | 0, 0.2 unstable, 0.8 stable; 0.25; back to zero; up to 0.8 | the same; the path from 25% is 0.360, 0.556, 0.712, 0.775 … 0.8 |
| 4 | 6.19 years; 0.46; 0.331 and 0.813; 0.259 | 6.1926; 0.4605; 0.3312 and 0.8128; 0.2592 |
| 5 | q ≤ 1/4, a ≥ 3b; k ≤ 5; reaches many, needs many | the same (with 57 links and φ = 0.18 a hub needs 11 adopting neighbours) |
| 6a simple | 562, 20, 7, 4 | 562, 19.4, 6.8, 4.1 |
| 6a complex | 749, 630, 76, no spread | 749, 685.9, 76, no spread (0.005 of the nodes) |
| 6b | 0.89, 0.72, 0.14, 0.00 | 0.850, 0.720, 0.225, 0.005 |

None of the paper answers differs. In 6 the differences are those of other
networks: complex contagion at p = 0.01 runs from 569 to 677 steps over
eleven sets of 20 networks (the panel has 10 networks per point), and at
z = 5.8 the share runs from 0.10 to 0.25 over eleven pairs of networks.

## Self-checks (`check-network-13.mjs`, 133 checks, 0 failures, about 1 min)

"Other seeds" means ten other sets, as the working rule asks.

- **Information cascades**, 100,000 sequences of 30: wrong cascades 0.3102,
  0.1576, 0.0596, 0.0125 at q = 0.6, 0.7, 0.8, 0.9 (formula 0.3077, 0.1552,
  0.0588, 0.0122; yours 0.308, 0.155, 0.059, 0.012). Largest gap over ten
  other seeds 0.0033. No cascade after ten people: 0.0257 (0.48⁵ = 0.0255).
- **Thresholds, smooth curve**: 0.77, 4.02, 5.48 at 10, 12, 12.2; 100.00 at
  12.3 and 15; 90.49 at 50; 65.86 at 100; the jump at 12.2221. All as
  expected.
- **Sampled crowds**, 2,000 per value: 0.002, 0.162, 0.806, 0.997 at 10,
  12, 15, 20 (yours 0.00, 0.15, 0.79, 1.00; within 0.04). Other seeds:
  0.002–0.004, 0.150–0.168, 0.780–0.806, 0.995–0.999.
- **Market and Bass**: the equilibria and the two paths of exercise 3; the
  closed form against Runge–Kutta to 1e-12 for six settings.
- **Cascade condition**: 1.00–13.66, 1.02–5.76, 1.11–3.86, none. As
  expected.
- **Cascades on the random network**, 1,000 seeds per z over two networks.
  Share of global cascades at z = 1, 1.5, 2, 3, 4, 5, 5.5, 5.8, 6, 6.2,
  6.5:

  | | 1 | 1.5 | 2 | 3 | 4 | 5 | 5.5 | 5.8 | 6 | 6.2 | 6.5 |
  |---|---|---|---|---|---|---|---|---|---|---|---|
  | yours | 0.00 | 0.54 | 0.75 | 0.89 | 0.84 | 0.72 | 0.41 | 0.14 | 0.06 | 0.00 | 0.00 |
  | mine | 0.00 | 0.55 | 0.75 | 0.86 | 0.84 | 0.73 | 0.40 | 0.20 | 0.07 | 0.00 | 0.00 |
  | ten other pairs | 0.00 | 0.54–0.58 | 0.73–0.76 | 0.86–0.89 | 0.84–0.89 | 0.65–0.73 | 0.38–0.46 | 0.10–0.25 | 0.01–0.12 | 0.00–0.05 | 0.00–0.001 |

  Mean size of the global ones: 0.576, 0.800, 0.938, 0.979, 0.994 at
  z = 1.5, 2, 3, 4, 5, and 0.996 to 0.999 beyond (yours 0.58, 0.80, 0.94,
  0.98, 0.99, above 0.99).
  **Limits set from the eleven pairs**: within 0.06 for z = 1.5 to 4, within
  0.08 at z = 5 (one pair gave 0.65), the order only at the upper edge, and
  "at most 5 in 1,000" at z = 6.5 (one pair had one global cascade in
  1,000).
- **Hubs**, z = 4, φ = 0.18, five networks, 400 seeds each: random network
  0.858 (0.835–0.877 by network; yours 0.88), preferential attachment 0.233
  (0.158–0.315; yours 0.25), from the 20 largest hubs 1.000 in both. Ten
  other sets: 0.847–0.871 and 0.217–0.260. Limits ±0.04 and ±0.05.
- **Long ties**, 20 networks per p:

  | p | 0 | 0.001 | 0.003 | 0.01 | 0.03 | 0.1 | 0.3 | 0.5 | 1 |
  |---|---|---|---|---|---|---|---|---|---|
  | simple, yours | 562 | 119 | 42 | 20 | 11 | 7 | 5 | – | 4 |
  | simple, mine | 562 | 100.3 | 42.1 | 19.3 | 10.8 | 6.9 | 5.0 | 4.0 | 4.0 |
  | simple, ten other sets | 562 | 95.7–115.2 | 41.4–45.2 | 18.6–20.1 | 10.6–11.1 | 6.5–6.8 | 5.0 | 4.0–4.2 | 4.0 |
  | complex, yours | 749 | 749 | 741 | 630 | 241 | 76 | 45 | none | none |
  | complex, mine | 749 | 748.3 | 745.6 | 677.0 | 253.5 | 81.0 | 37.3 (14 of 20) | none | none |
  | complex, ten other sets | 749 | 742.1–748.8 | 736.3–747.8 | 568.6–657.0 | 236.4–266.7 | 72.3–81.5 | 38.2–42.9 | – | – |

  The two values at p = 0 are exact. **What differs:** simple at p = 0.001
  is lower than your 119 in all eleven sets (96 to 115): with about 20
  rewired links among 20,000 the mean of 20 networks still moves by tens of
  steps, so I held it to 40%. Complex at p = 0.3 is lower than your 45 in
  all eleven sets (37 to 43), and there only 13 to 19 of the 20 networks
  reach 90% at all, the mean being over those: held to 25%. At p = 0.5 the
  share reached is 0.003 to 0.055 by set (4 networks of 220 spread).
- **Clusters**, 30 networks per point, share of the second group at
  k_out = 1 … 5:

  | q | yours | mine | runs in which it falls |
  |---|---|---|---|
  | 0.5 | 0.00, 0.01, 0.04, 0.74, 1.00 | 0.003, 0.012, 0.037, 0.711, 1.000 | 0, 0, 0, 0.67, 1 |
  | 0.4 | 0.01, 0.16, 1.00, 1.00, 1.00 | 0.007, 0.060, 1.000, 1.000, 1.000 | 0, 0, 1, 1, 1 |
  | 0.3 | 0.53, 1.00, 1.00, 1.00, 1.00 | 0.553, 1.000, 1.000, 1.000, 1.000 | 0.53, 1, 1, 1, 1 |

  Over ten other sets the three all-or-nothing points run 0.62–0.85,
  0.06–0.16 and 0.40–0.62 (held to 0.3); every other point is within 0.06.
  Of 200 networks at q = 0.5 and k_out = 4 the group falls in 141, holds in
  59 (at most 0.270 of it adopting) and none ends in between.
- **A cluster denser than 1 − q is never entered**: eight nodes all linked,
  each with two links to adopters (7 of 9 links inside, 0.778): not entered
  at q = 0.25 or 0.5, entered at q = 0.2. And the converse, on real runs:
  whenever a cascade stops, the nodes left out form a cluster in which
  everyone has more than 1 − q of their links inside (30 block-model
  networks and 12 cascades on random networks).
- **The cascade code**: equal to synchronous sweeps over all nodes on 40
  small networks (adopters, the step of each adoption, the step at which any
  count is reached); a node without links never adopts.
- **Page checks**: 26 "quoted on the page" checks pin every number in the
  lecture, the three observe lists and the exercises; the two lectures, and
  the Italian texts, carry the same numbers as the English ones.

## The numbers behind each "What to observe"

**Panel A.** Default crowd (25, 12): thresholds 0, 0, 3.8, 4.0 …, staircase
0 → 2, smooth curve 4.02. 200 crowds: 0.170 above 50, average 19.1, 143 in
the lowest class and 34 in the highest. At 10: this crowd 0, none of 200
above 50. At 15: this crowd 100, 0.850. Sweep: smooth 4.0 at 12 and 100.0
at 13; share of crowds above 50: 0.04, 0.17, 0.365 (shown as 0.37), 0.65,
0.85 at 11 to 15, 1.00 at 20; smooth 90.5 at 50. Market: 0.200 and 0.800;
0.250 → 0.360 → 0.556 → 0.712 → 0.775 → 0.800; from 0.15 to 0 at once. Bass:
6.19 years, 0.4605, 0.1106 a year.

**Panel B.** Default: 0.765 vulnerable, condition 1.75, 0.875 global, mean
size 0.979. Sweep: 0 up to z = 1; 0.355 (shown as 0.36) at 1.25; 0.89 at
3.75 (the highest); 0.72 at 5; 0.39 at 5.5; 0.18 at 5.75; 0.01 at 6; sizes
0.366, 0.801, 0.979, 0.997 at 1.25, 2, 4, 5.75. z = 6: condition 0.90, 2 of
200 seeds. Preferential attachment: 0.860 vulnerable, condition 1.15, 0.285
global, the 20 largest hubs have at least 57 links; from those hubs 1.000 on
both networks; on the random network from hubs 0.085 at z = 6 and 0.000 at
z = 7. φ = 0.10: 0.975; 0.25: 0.020 (condition 0.95); 0.30: 0.000.

**Panel C.** Ten networks per p: simple 562, 91.1, 42.0, 19.4, 10.6, 6.8,
5.4, 5.0, 4.1, 4.0; complex 749, 748.4, 714.5, 685.9, 252.9, 76.0, 49.5,
36.6 (8 of 10), –, –; share reached by complex contagion 1 up to p = 0.2,
then 0.801, 0.005, 0.002. Clusters, q = 0.5: 0.044 at 3, 0.090 at 3.5,
0.780 at 4 (15 of 20), 1.000 from 4.5; q = 0.4: 0.114 at 2 (1 of 20), 0.956
at 2.5 (19 of 20); q = 0.3: 0.565 at 1 (11 of 20), 1.000 from 1.5. Average
points 10, 6.67, 4.29. At q = 0.5 and k_out = 4, 33.4 nodes of the second
group adopt at the first step, with 6.81 outside links against 4.01 for the
group.

## Your two unexpected findings of Panel C

1. **Holds, with one nuance.** At p = 0.01 simple contagion is 28 to 30
   times faster than on the ring in all eleven sets, while complex contagion
   is 1.11 to 1.32 times faster ("nearly unchanged" is right for some sets
   and generous for others; the panel's own value is 8% fewer steps). More
   rewiring speeds it up too (9 to 10 times faster at p = 0.1), and at
   p = 0.5 it almost never spreads (4 of 220 networks), at p = 1 never.
   Mean clustering of one network: 0.643, 0.475, 0.082, 0.001 at p = 0, 0.1,
   0.5, 1.
2. **Holds.** At q = 0.5 the average outside share reaches q only at
   k_out = 10; the group falls in two thirds to three quarters of the
   networks at k_out = 4 (average outside share 0.286) and always at 5. The
   nodes that adopt at the first step have 1.7 times the outside links of
   the average node.

## "Check" items: confirmed and softened

Read in the source itself unless said otherwise.

| Item | Result |
|---|---|
| Salganik, Dodds, Watts (2006): 14,341 people, 48 songs, eight worlds; the finding | **Confirmed** in the paper. The abstract says "Increasing the strength of social influence increased both inequality and unpredictability of success"; 14,341 is the total over the two experiments. The lecture says "Stronger social influence made success both more unequal and less predictable from one world to the next", and adds the abstract's "best songs rarely did poorly, worst rarely did well". |
| Granovetter (1978): 0…99 and the 1 → 2 example; normal thresholds around 25, about 6 → nearly 100 at 12.2 | **Confirmed** in the article (pp. 1424–1425 and the passage on Fig. 2: "increases gradually to about six. Then after this point, approximately 12.2, the value … jumps to nearly 100"). My computation: 5.48 at 12.2, jump at 12.222. |
| Sultan, Farley, Lehmann (1990): p = 0.03, q = 0.38 | **Softened.** Citation and "213 applications" confirmed; the two averages only through papers that cite them (Van den Bulte and Stremersch). |
| Morris / Easley–Kleinberg: clusters are the only obstacle | **Confirmed in Easley and Kleinberg**, section 19.3, with "greater than 1 − q"; q = b/(a + b) is theirs too. Morris states the result differently, so the sentence names Easley and Kleinberg. |
| Watts (2002): heterogeneous degrees, less vulnerable | **Confirmed**, abstract: "an increasingly heterogeneous degree distribution makes it less vulnerable". "Vulnerable" vertices (k ≤ ⌊1/φ⌋) and "cascade window" are his terms. Panel B shows it: 0.285 against 0.875. |
| Watts and Dodds (2007): wording | **Confirmed**, abstract: "large cascades of influence are driven not by influentials but by a critical mass of easily influenced individuals". |
| Centola (2010): 1,528 people, 54% against 38% | **Confirmed** in the paper: 1528 participants; 53.77% and 38.26%, averages over six trials; diffusion more than four times faster in the clustered networks. |
| Centola and Macy (2007) | **Confirmed** (citation; abstract read in the authors' manuscript). |
| Ugander et al. (2012) | **Confirmed** in the abstract ("tightly controlled by the number of connected components in an individual's contact neighborhood, rather than by the actual size of the neighborhood"); "after an invitation" dropped (see above). |
| Barabási ch. 10 | **Confirmed**: section 10.5 has a subsection "Complex Contagion" (short and qualitative). Chapter given. |
| Newman (2018) | Chapter 16 given: the publisher's chapter page lists 16.1.9 "Complex contagion and the spread of information" and 16.3.5 "Complex contagion". The text itself was not read; no heading mentions thresholds or information cascades. |
| Easley and Kleinberg ch. 16, 17, 19 | **Confirmed** (Information Cascades; Network Effects; Cascading Behavior in Networks). |
| Other citations | Volumes and pages confirmed in Crossref or publisher listings; Katz and Shapiro and Ryan and Gross only through library listings; "7(2)" for Peterson from a secondary citation (the article's own pages read "Quarter 2 • 2018", pp. 9–18). None found wrong. |

## What I could verify of the box

- **Wheatley et al. (2019): confirmed** in the paper. Market capitalisation
  regressed on active addresses, "a slope β = 1.69 (standard error
  0.0076)", 2,782 daily values from July 2010 to February 2018. The box
  says k = 1.69.
- **Peterson (2018): confirmed** in the article. Note that it fits the
  price to a Metcalfe value built on the number of wallets
  (blockchain.info), not on active addresses; the box says only
  "Metcalfe-type laws".
- **Alabi (2017): citation confirmed, content not.** The abstract could not
  be opened; search summaries say Bitcoin, Ethereum and Dash, value against
  daily unique addresses. The box keeps it, again with only "Metcalfe-type
  laws". Drop it if you prefer not to cite what was not read.
- **Santostasi and Perrenod (2026)**: k = 1.838 as Complexity Lab module 13
  cites it (pinned against that file).
- **Pecere (2026), supplement, section S2: confirmed** in the Zenodo record
  (the supplement PDF was downloaded and read): "the elasticity of the
  price to addresses 1.59 / 2.64 / 3.28 / 6.83" for 2011–15, 2016–19,
  2020–22, 2023–26, by OLS, addresses with balance.
- **Menger (1892)**: citation confirmed; the sentence is the standard
  reading of the paper, not a quotation.

## Italian terms chosen

| English | Italian |
|---|---|
| information cascade | cascata informativa |
| herding | effetto gregge (once, beside "cascata informativa"; the module summary already uses it) |
| threshold | soglia |
| tipping point | punto di svolta |
| critical mass | massa critica |
| network effect | effetto di rete (network good: bene di rete) |
| lock-in | lock-in (kept) |
| global cascade | cascata globale |
| vulnerable node | nodo vulnerabile |
| cascade window | finestra delle cascate |
| complex contagion | contagio complesso (simple: contagio semplice) |
| long tie | legame lungo |
| influential | gli influenti |

Also: cluster = gruppo (gruppo coeso in the lecture, where the density
condition is meant), rewiring = ricablatura as in module 08, riot = rivolta,
crowd = folla, staircase = scala.

## Checks run (each as its own foreground command, on the final build)

| Check | Result |
|---|---|
| `npx vite build` | built |
| `check-network-01.mjs` … `04` | All checks passed |
| `check-network-05.mjs` … `12` | 0 failures each |
| `check-network-13.mjs` | 133 passed, 0 failures |
| `check-index.mjs network` / `complexity` | 0 failures of 72 / of 64 |
| `check-links.mjs` | 0 failures of 80 |
| `check-module.mjs network <slug>`, modules 01–13 | 0 failures each (62, 62, 56, 60, 58, 60, 58, 60, 62, 56, 58, 56, 56 checks) |
| `modules/network-<slug>.mjs`, modules 01–13 | 0 failures each (25, 29, 40, 50, 58, 26, 26, 24, 29, 36, 36, 37, 45 checks) |
| regression compare | not run: no shared code changed |

No check crashed this time. Module 13 is in `expect.json` (2 figures, 3
panels, 6 exercises) and its two commands are in the README of the browser
checks.

## Open points for you

1. The lecture carries the DRAFT marker.
2. Sultan's averages and Alabi's content rest on secondary sources (see
   above): keep the softened wording, or drop them.
3. Your values that mine do not reproduce: simple contagion at p = 0.001
   (119 against 96–115) and complex contagion at p = 0.3 (45 against
   37–43). Both are means over few, very different networks; if you have
   the networkx script at hand it would be worth one look at how the seed
   node is chosen and whether networks that do not reach 90% enter the
   mean.
4. The box is 178/190 words against "about 160".
5. Next: module 14, the capstone.
