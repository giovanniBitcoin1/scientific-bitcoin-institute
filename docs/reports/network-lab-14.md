# Network Lab — report on prompt 14

Module 14 "Capstone: a real network" (`/network-lab/capstone-a-real-network`),
the last module. Branch `network-lab`, nothing pushed. Preconditions held:
modules 01–13 done, nothing in progress, `docs/reports/network-lab-13.md`
committed, clean tree. There was no Stage 0.

## Commits

| Commit | What |
|---|---|
| `12666eb` | Network Lab 14: Capstone, a real network (two WIP checkpoints squashed; data file, notice, build script, precomputed file, status file, `expect.json`, README of the browser checks and `CLAUDE.md` included) |
| this file | Network Lab 14: report |

## Stage 1 — the data

**Licence, as found.** On https://openflights.org/data.php: "The OpenFlights
Airport, Airline, Plane and Route Databases are made available under the Open
Database License. Any rights in individual contents of the database are
licensed under the Database Contents License." and "The third-party that
OpenFlights uses for route data ceased providing updates in June 2014. The
current data is of historical value only." The `LICENSE` file beside the data
on GitHub is the text of the ODC Open Database License. It is what you said.

**Hashes** (downloaded 24 November 2026): identical to yours.

- `airports.dat` `9387cdb38df5bd664da823f8ccb69fdd9b33a1888f5b7cca09c34a3cd9ff59f9`, 7,698 lines
- `routes.dat` `bd373706238134f619c624c606dccc74c05c2582a977c489c81de501735f2390`, 67,663 lines

**Build** (`scripts/lab/build-network-14.mjs`): every count is yours — 892
rows dropped, 3,214 airports, 18,858 links, 810 one-way, 19 ICAO codes, 29
without a region, 7 components of 3,188, 10, 4, 4, 4, 2 and 2, 18,833 links in
the largest. One route row goes from an airport to itself. The raw files stay
in the git-ignored `scripts/lab/network-14-cache.local/`.

**Files.** `src/data/lab/networks/airports-2014.json` (419 kB),
`airports-2014.NOTICE.txt` with your sentence, an entry in
`networks.meta.json` (source, URL, date, hashes, licence, build rules), the
first sentence under Figure F1 with a link to the licence, the dataset first in
the reading list. `src/data/lab/precomputed/network-14-airports.json` (129 kB).

Nothing in the data is corrected. Airport 5613 is in the file as KSLI, "Los
Alamitos Army Air Field", Solwesi, Zambia; ISL is Istanbul.

## What was built

- **Pure logic**, `capstone-a-real-network/capstone.js`: mostly imports.
  Module 02's swap and triangles, 03's PageRank and Spearman, 05's whole
  recipe, 08's r, ρ, k_nn, rich club and `giantCurve`, 09's Louvain, modularity
  and NMI, 10's strengths, exponent and backbone, 11's moments, removal orders,
  Brandes with a mask and `largestComponent`, 12's thresholds, percolation and
  `spread`, 13's `cascade`. New code: the jobs that put them in order, the
  great-circle distance, the closures, the sampled route. `loader.js` reads
  edge lists and the JSON of `lncli describegraph`. `precompute.js` is the page's
  own jobs, drained.
- **No shared function changed**, so no regression compare was run. Every
  function worked on 3,188 nodes as it was.
- **Figures.** F1 `map`: 3,214 dots, sized by degree, coloured by community or
  region; the 300 links with most airlines; the ten longest (two in red); tap or
  search an airport. F2 `outliers`: degree against betweenness, five airports
  labelled, tap a dot.
- **Panels.** A "The workbench" (six cards); B "Stress tests" (removal, germ,
  fashion); C "The map and the spread" (SI from a tapped seed; close an
  airport). One selector for the three: airports, karate club, Florentine
  families, your own network.
- **Lectures** EN 1,424 and IT 1,471 words, DRAFT marker, ten steps, the box
  (126 and 137 words), a closing section in place of "Next".
- **Checks.** `scripts/lab/check-network-14.mjs` (107 checks) and
  `scripts/lab/browser-checks/modules/network-capstone-a-real-network.mjs`
  (54 checks).

**Sizes.** Data file 419 kB; precomputed file 129 kB; the module's chunk
651 kB (220 kB gzipped), of which 548 kB are those two files. Vite also moved
`centrality.js`, `fit.js`, `weights.js`, `epidemic.js` and `contagion.js` into
small chunks of their own, loaded only when unlocked.

**Timings** (headless Chrome): 1.8 s from navigation to the last panel.
"Compute again": 3.8 s for centrality, 11 s for the ten rewirings with
distances, both in slices. Precompute in Node: 10 s.

## What differs from the spec

1. **Title.** The one in `network-modules.json` is not a placeholder
   ("Capstone: a real network from start to finish" / "Capstone: una rete reale
   dall'inizio alla fine"), so it was kept, as you said.
2. **The data file has two more fields**, the airport's name and its
   OpenFlights id. F1 must show the name on a tap, and the name is what makes
   record 5613 visible. This is why the file is 419 kB, not about 400.
3. **F2 labels five airports**, not four. The rule: among the 60 of highest
   betweenness, those with fewer than 40 routes. It gives Anchorage, Papeete,
   Port Moresby, Bethel and Winnipeg. No simple rule gave exactly your four.
4. **F1's colours** are the best of ten runs of Louvain (module 09's
   practice). Card 5 runs Louvain itself, run 1, 2, … See point 8.
5. **A tap on the map** takes the largest airport within 7 px, otherwise the
   nearest within 18 px; a box finds an airport by code or city. Without it
   Amsterdam could not be told from Rotterdam at this scale.
6. **Module 01's statistics were not imported.** `netstats.js` is written for
   60 nodes in its own format. Components and distances come from
   `graphUtils.js`, which module 01 itself uses.
7. **Cards 5 and 6 run at once on the airports** (Louvain and the weights take
   milliseconds); cards 1–4 show precomputed values with "Compute again".
8. **Step 6 of the lecture says "nine of the ten runs".** In the first run
   Louvain puts Anchorage with Atlanta and splits Alaska into small groups; in
   the other nine Alaska is one group of 131. I kept the seed and wrote it into
   the lecture as an example of "no single answer".
9. **Above 5,000 nodes the cascades also start from the 300 sampled nodes**,
   not from every node. A network without coordinates is drawn up to 1,500
   nodes.
10. **Figure heights** at 1280 px: 472 and 395 px, above the usual 340 (the
    map with its switches and credit line).
11. **Removal by betweenness** on your own network above 600 nodes runs on a
    button; below that, and on the airports, it is there at once.

## "Expected" values that differ

Everything not listed here is identical to yours to the digits you gave.

| Quantity | Yours | Mine | Why |
|---|---|---|---|
| Anchorage's place by degree | 287th | 283 airports have more, 8 have 34 | ties: places 284 to 291. The lecture says "283 airports have more" |
| Null model: clustering, distance, r | 0.090, 3.25, −0.099 | 0.092, 3.24, −0.103 | ten rewirings, another generator |
| z of r | about +19 | 18.7; 10.7 to 29.8 over ten other seeds | the spread of ten rewirings is itself uncertain. The lecture says "more than ten" |
| Rich club above 150, 180 | 1.12, 1.08 | 1.18, 1.17 | my seed is high here: ten other seeds give 1.13–1.15 and 1.06–1.13, which agree with yours. Not quoted in the texts |
| Rich club, "up to about 1.2" | — | 1.20 above 100; largest 1.35 (eight airports) | the largest is 1.24–1.34 over ten other seeds: the lecture says "about 1.2" and "about 1.3" |
| Strength exponent | 1.10 | 1.12 | module 10 fits the class means |
| Median link | 1,156 km | 1,155 km | coordinates rounded to two decimals |
| Links over 5,000 km | 7.1% | 7.0% | the same |
| Communities | 16–26 groups, NMI 0.59–0.66 | 18–25, 0.62–0.66 | ten runs |
| Removal, degree fixed, 15% | 0.06 | 0.07 | ties in degree |
| Removal, recomputed, 10% | 0.28 | 0.29 | ties |
| Removal, betweenness, 30% | 0.01 | 0.00 | — |
| Removal, random, 5% and 15% | 0.92, 0.80 | 0.93, 0.79 | ten orders |
| Largest cluster, T = 0.01, 0.02, 0.1, 0.5 | 0.00, 0.06, 0.32, 0.77 | 0.01, 0.04, 0.33, 0.78 | ten runs. At 0.02: 0.03–0.05 over ten other seeds, always below your 0.06 |
| Spread, Atlanta | 0.71, 0.11, −0.86 | 0.71, 0.09, −0.87 | within ±0.1 |
| Spread, Fiumicino | 0.79, 0.30, −0.88 | 0.78, 0.29, −0.88 | |
| Spread, Anchorage | 0.59, 0.08, −0.88 | 0.59, 0.08, −0.88 | |

Working rule on seeds: applied three times (z of r, rich club above 150, T =
0.02), each with ten other seeds, numbers above. No seed was chosen.

## Exercises — answers recomputed

1. As yours: 16,082 and 15,937 km, Sydney–Dallas 13,808.
2. As yours: 0.0156; 0.984; 6.42; 0.091; 0.909; 1.1.
3. As yours: 87; Amsterdam 0; Atlanta 11; Papeete 26.
4. As yours: 1.71, 1.80, 1.90, 2.14, 2.40. The test: k_min = 2 chosen, none of
   200 synthetic sets fits worse (p < 0.005), power law ruled out; lognormal
   (R = −53.6) and cut-off (R = −79.2) both significantly better.
5. As yours: 0.19; 0.016; 2 of 20.
6. Karate club: clustering 0.571 against 0.366 (z 3.5); r −0.476 against −0.271
   (z −4.3); Louvain 4 groups, Q 0.419, factions Q 0.358, NMI 0.490; 10%
   removed leaves 0.91 at random, 0.59 by degree; T_c 0.148; tail too small.

Types: one on paper (2), three in the page (1, 4, 5), two both (3, 6).

## "Check" statements

**Confirmed**

- Guimerà et al. (2005): a truncated power law for the cumulative degree
  distribution; data of November 2000; a network of cities, not airports (the
  lecture says "counted by cities"); Anchorage named among cities of small
  degree and high betweenness, explained by Alaska's few links outward. Read in
  the PMC full text.
- Barrat et al. (2004): weights are available seats, airports of 2002,
  β = 1.5 ± 0.1. PMC full text.
- Peel et al. (2017): "metadata are not the same as ground truth". Abstract.
- LND: `ChannelGraph` has `nodes` (`pub_key`, `alias`) and `edges`
  (`node1_pub`, `node2_pub`, `capacity`, a string in JSON). Read in
  `lnrpc/lightning.proto`. The loader accepts it.
- Citation details of all seven papers.

**Softened**

- Colizza et al. (2006): they report a "mild" rich club in air transport. The
  lecture says "a mild rich club".
- Brockmann and Helbing (2013): only the abstract could be read ("effective
  distance reliably predicts disease arrival times"). The lecture gives no
  formula and says only that effective distance predicts arrival times where
  geographic distance does not.
- "Geography has a cost": stated with the median link, 1,155 km, not with a
  claim about small airports that I did not measure.

The four books are cited without chapters, as in module 01.

## The numbers behind each "What to observe"

- **Workbench.** 3,188 of 3,214; distance 3.96, diameter 12; clustering 0.493
  against 0.092; distance against 3.24; median 3, maximum 248; k_min 2, α 1.71;
  0 of 200 sets; 0.458 with betweenness 0; r −0.018 against −0.103 ± 0.005,
  z 18.7; rich club 1.20 and 1.35 (1.24–1.34 over other seeds); run 1: 25
  groups, Q 0.656; run 2: 21, 0.657, NMI 0.920; regions 0.622 then 0.644,
  Q 0.567; β 1.12, 0.556 with weight 1, largest 20 (Atlanta–Chicago), backbone
  325 links.
- **Stress tests.** At 10%: 0.86, 0.14, 0.29, 0.27. At 5%: 0.93, 0.77, 0.74,
  0.59. Random: 0.60 at 30%, 0.37 at 50%. T_c 0.0156, R0 6.42; cluster 0.19,
  0.48, 0.78 at T = 0.05, 0.2, 0.5. Fashion: 0.016 and 2 of 20; 0.300 and 19;
  none, largest 0.05. Karate: T_c 0.1477, 0.529.
- **Map and spread.** Atlanta 0.71, 0.09, −0.87; Fiumicino 0.78, 0.29, −0.88;
  Anchorage 0.59, 0.08, −0.88. Closures 87, 0, 11, 26. Ten by degree 0.981, ten
  by betweenness 0.962.

One finding not in the prompt: betweenness is the most damaging order only at
first (0.59 against 0.77 at 5%); from 10% the plain degree order has overtaken
it (0.14 against 0.27). Step 8 and Panel B say so.

## Italian terms

| English | Italian |
|---|---|
| capstone | "Capstone", kept in the title as it was |
| workbench | banco di lavoro |
| stress test | prova di carico |
| raw data | dati grezzi |
| snapshot | istantanea (as in module 06) |
| great-circle distance | not used on the page: the Italian texts say "distanza in chilometri" |
| edge list | not used as a term: "un collegamento per riga" |
| card | scheda (also for the record of an airport) |
| percolation cluster | ammasso |
| gateway | porta d'accesso |

## Checks run (each as its own foreground command)

- `npx vite build`: built.
- `check-network-01` … `13`: all pass. `check-network-14`: 0 failures of 107.
- `check-index.mjs network`: 0 of 68. `check-index.mjs complexity`: 0 of 64.
  `check-links.mjs`: 0 of 80.
- `check-module.mjs network <slug>`, modules 01–14: 0 failures each (module 14:
  0 of 60, locked and admin, EN and IT, 1280 and 375 px).
- Functional checks `modules/network-*.mjs`, modules 01–14: 0 failures each.
  Module 14 (54 checks) includes the map drawn, an airport tapped, an edge
  list and a describegraph JSON pasted, cards run on them, 6,000 nodes on the
  sampled route, 30,001 nodes refused.
- Regression compare: not run, no shared code changed.

After the last wording change (rich club) I rebuilt and reran
`check-network-14` and the two module-14 browser checks. The other thirteen
modules' browser checks ran on the build just before it; that change touched
only module 14's texts.

## Open points for you

1. The title: keep the existing one, or "Capstone: a real network" / "Prova
   finale: una rete vera"?
2. The airport names in the data file (419 kB instead of about 400).
3. Winnipeg as a fifth label in F2.
4. "Nine of the ten runs" in step 6, with the first run as the exception.
5. The figure heights (472 and 395 px).
6. Brockmann and Helbing: if you have the paper, the sentence could say more.

The status file marks the fourteen modules as done and says, under "Next",
that the Lab is complete and waits for your review: nothing is to be pushed or
merged.
