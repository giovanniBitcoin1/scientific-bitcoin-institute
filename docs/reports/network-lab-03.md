# Network Lab, prompt 3 — final report

Two fixes to Module 02 (Stage 0) and Module 03, "Centrality" (Stage 1).
Written on 2026-11-20.

Both stages are done and committed locally on `network-lab`; nothing was
pushed. Every check in the list finished with 0 failures on the final build.

## Commits

| Hash | Message |
|---|---|
| `c3cf222` | Network Lab 02: fixes |
| `40b2fcb` | Network Lab 03: Centrality (two WIP commits squashed) |
| (this file) | Network Lab 03: report |

## Stage 0: what I found in 0a

The two sets of numbers measured different things, and neither text said so.

- **Panel A, "What to observe" 2** (94%, 81%, 55%, 15%) read the **Observed
  column**: one sample, the first one the panel draws at each f.
- **Exercise 4** (71%, 53%, 28%, 15%) read the **blue bias curve**: the average
  of 30 samples.

The averages agree with theory; the single samples were simply lucky draws.
Largest component of the random truth (N = 600, ⟨k⟩ = 6), as a share of the
sample:

| f | first sample | 30-sample curve | 2,000 samples: mean | 5th–95th percentile | theory, infinite network |
|---|---|---|---|---|---|
| 0.5 | 0.940 | 0.952 | 0.944 | 0.91–0.97 | 0.940 |
| 0.3 | 0.809 | 0.705 | 0.721 | 0.56–0.84 | 0.732 |
| 0.25 | 0.634 | 0.529 | 0.544 | 0.25–0.74 | 0.583 |
| 0.2 | 0.547 | 0.279 | 0.306 | 0.10–0.59 | 0.314 |
| 0.15 | 0.146 | 0.146 | 0.165 | 0.07–0.36 | 0 |

At f = 0.2 the first six samples (the first, then five presses of "New
sample") give 55%, 19%, 25%, 10%, 8%, 33%.

What changed:

- "What to observe" 2 now quotes the curve (95%, 71%, 28%, 15%), gives the
  theory (94%, 73%, 31%, nothing), says that the Observed column is one
  sample, and shows the swing at f = 0.2 with those six samples.
- Exercise 4 says its numbers are averages of 30 samples, adds the theory
  values, and adds one sentence: at f = 0.2 nine samples in ten fall between
  10% and 59%.
- `check-network-02.mjs` pins all of it (the curve, the six samples, the
  theory, the percentiles) in place of the old single-sample check.

0b: the Barabási entry is now "Ch. 4, section 4.8" / "Cap. 4, sezione 4.8".

## What differs from the spec

- **The Strozzi claim is softened.** I could not confirm against Padgett and
  Ansell that the Strozzi had more wealth and more council seats than the
  Medici; a web search found the claim only in secondary teaching material.
  The lecture says the rival families, the Strozzi among them, "are usually
  described as at least as rich and as well represented in the city's
  councils". Please check the paper if you want the stronger wording.
- **Panel A draws with SVG, not canvas**, and listens to clicks only. There
  is no Draw toggle because nothing is dragged: a swipe always scrolls.
- **Panel A, tap modes.** Three modes chosen with pills: inspect a node, pick
  the two ends of a path, remove a node or a link. The paths passing through
  "the tapped node" are those through the node chosen in inspect mode.
- **Closeness in a network in several pieces** (after removals) is computed
  over the nodes that can be reached and scaled by the share reached
  (Wasserman–Faust). In a connected network this is exactly (N − 1)/Σd.
- **Eigenvector centrality in a network in several pieces** is zero outside
  the piece with the largest eigenvalue. This is what the measure does, and
  two "What to observe" items use it.
- **Two groups and a bridge:** each group is a random network of 10 nodes and
  20 links; in each, the bridge end is the member with fewest links, so the
  go-between is not the best connected.
- **Panel B, Katz** is shown at a fixed α, half its limit (no slider there).
  All columns except incoming links are rescaled to sum to 1.
- **Panel B, α = 1** uses a "lazy" iteration (each round averaged with the
  previous one): the plain iteration circles for ever on a closed loop of
  three pages. The resting distribution is the same.
- **Panel C, top-ten overlap:** ties are broken at random, separately for the
  true and the observed ranking. Otherwise a measure with many equal scores
  (degree on a small-world network) would be credited with a top ten it
  cannot define. Consequence: at f = 0 that overlap is 0.82, not 1, and item 4
  of "What to observe" makes the point.
- **Panel C has a slider "Read the curves at f"** and a table of the ten
  numbers at that f, so the exercise can be answered exactly.
- **Shared files:** `charts.jsx` and `NetCanvas.jsx` moved from the module 02
  folder to `src/components/lab/network/`, as the status file planned.
- **Lecture length:** EN 1,551 words, IT 1,584, counting markup and excluding
  further reading.
- **Figure order in the lecture:** "Scores from neighbours" comes first
  (section 3) and the kite second (section 6), as in the outline; the spec
  numbers them F2 and F1.
- **Scores figure height at 375 px:** 358 px (the guideline is about 340).

## Italian terms chosen

| English | Italian |
|---|---|
| centrality | centralità |
| closeness | vicinanza (closeness given once in brackets) |
| harmonic closeness | vicinanza armonica |
| betweenness | intermediazione (betweenness given once in brackets) |
| eigenvector centrality | centralità di autovettore |
| damping (factor) | (fattore di) smorzamento |
| hub and authority | hub e autorità |
| random surfer | navigatore casuale |
| ranking | classifica |
| rank correlation | correlazione di rango |
| go-between | intermediario |
| tie (shared place) | pari merito |

Web links are "collegamenti", like every other link in the lab.

## "Expected" values: which differed

All of them hold except one.

| Expected | Result |
|---|---|
| Kite: N 10, L 18; degree Diane 6 | as expected |
| Kite: closeness Fernando = Garth = 9/14 = 0.643 | as expected |
| Kite: betweenness Heather 14, Fernando = Garth = 8.33, Ike 8, Diane 3.67 | as expected |
| Kite: eigenvector Diane first | as expected (Diane 1, Fernando = Garth 0.827) |
| Florence: betweenness Medici 0.522, Guadagni 0.255, Strozzi 0.103 | as expected |
| Florence: closeness Medici 0.560; eigenvector Medici first | as expected |
| Karate: betweenness member 1 0.438, member 34 0.304 | as expected |
| Karate: eigenvector 34 first, 1 second | as expected (1 at 0.952) |
| Karate: PageRank at 0.85: 34 0.101, 1 0.097 | as expected (0.1009, 0.0970) |
| **Katz on karate, 0.001 of the limit: Spearman with degree above 0.98** | **differs: 0.979** |
| Katz on karate, 0.999 of the limit: Spearman with eigenvector above 0.999 | as expected (1.0000) |

The Katz difference is not an error in either number. Degree has many ties
(eleven members have two links), and Katz breaks them by the neighbours'
degrees however small α is, so the correlation stops at 0.979 and does not
approach 1. What holds exactly is that Katz at 0.001 of the limit never
reverses two members with different degrees; the check now tests that, with
the threshold at 0.97. The lecture states the claim in that form.

One detail worth knowing in Florence: the Strozzi are third in your list of
betweenness values but seventh in rank (Albizzi 0.212, Salviati 0.143, Ridolfi
0.114 and Bischeri 0.104 come before their 0.103).

## Exercise answers

All six of yours are confirmed.

1. Star: centre 5, 1, 1; leaf 1, 5/9 = 0.556, 0. As given.
2. Path: 0, 3, 4, 3, 0; closeness of c 0.667, of a 0.4. As given.
3. Three pages: 0.4, 0.2, 0.4; then 0.3878, 0.2148, 0.3974. As given.
4. Florence: the Medici are first under all seven measures. Without them: six
   links gone, three pieces of 11, 2 (Pazzi and Salviati) and 1 (Acciaiuoli),
   and the Guadagni lead betweenness with 0.314 (24.5 of 78 pairs), ahead of
   the Bischeri (0.212) and the Strozzi (0.147). As you expected.
5. Panel B, α = 1: the surfer ends in the loop J → K → L → J (step 93 in the
   panel's run); PageRank is 1/3 on each loop page and 0 on the nine outside.
   At 0.85 the first page is J (0.154), then K (0.147) and L (0.141); the
   loop holds 44% in total and the best page outside is D (0.093).
6. Panel C, scale-free, 20% missing: degree and PageRank keep their top ten
   best (0.93 each, betweenness 0.92); eigenvector centrality worst (0.81,
   closeness 0.82).

## Self-check numbers (`check-network-03.mjs`, 67 checks, all pass)

- Kite, Florence, karate: the table above.
- Star, path, three pages: exact, as in Exercises 1–3.
- Undirected networks, α = 1: PageRank equals degree/2L on eight networks,
  largest gap 7.9e-14. PageRank sums to 1 in 37 cases, largest gap 3.9e-15.
- Katz on karate: 0.9789 with degree at 0.001; 1.0000 with eigenvector at
  0.999; the scores satisfy x = αAx + 1 to 8.9e-16.
- Betweenness: Brandes and brute force agree to 7.1e-14 on 50 random networks
  of 30 nodes (26 of them in several pieces).
- Surfer, one million steps: largest gap from PageRank 0.00049 at α = 0.85
  and 0.00046 at α = 0.5.
- Hubs and authorities: residuals 8.9e-16 and 5.6e-16 (λ of AᵀA = 5.512).
- Directed eigenvector centrality on the web: residual 1.9e-13, λ = 1.900; F
  and G score zero.
- Scores figure: within 0.005 of the eigenvector centrality after 19 steps.
- The web: 12 pages, 21 links, F with no incoming link, H with no outgoing
  link, the loop J, K, L closed, no pair linked both ways.

## The numbers behind each "What to observe"

**Panel A.** Florence: Medici first everywhere; second are the Guadagni
(betweenness 0.255), Ridolfi (closeness 0.500), Strozzi (eigenvector 0.827);
Strozzi 2= for degree, 7th for betweenness. Albizzi–Tornabuoni: two shortest
paths, one through the Medici. Kite: Heather 6= for degree, 8th for
eigenvector; Spearman betweenness–eigenvector 0.31, degree–eigenvector 0.99.
Karate: member 34 has 17 links and member 1 has 16; Katz against degree and
eigenvector 0.98 and 0.84 at 0.01 of the limit, 0.78 and 1.00 at 0.99. Two
groups: bridge b–l, betweenness 0.526 and 0.531, degrees 2 and 4, b 19= for
degree; 94% of the eigenvector score in the left group, and exactly 0 in the
right group once the bridge is removed. PageRank slider at 1 in Florence:
Medici 0.150 = 6/40.

**Panel B.** At 0.85: J 0.154, K 0.147, L 0.141, D 0.093, …, F 0.016; loop
share of visits 39% after 1,000 steps and 44.1% after 100,000. At 1: the loop
is entered at step 93; 0.333 each. At 0: 0.083 everywhere. F: eigenvector 0,
hub 0.201 (best); A and B the best authorities (0.215, 0.172); H hub 0,
authority 0.115. Two-way at α = 1: 0.119 = 5/42 for A, B, D, E.

**Panel C** (Spearman, then top-ten overlap; degree, closeness, betweenness,
eigenvector, PageRank):

| Network, error, f | Spearman | Top ten |
|---|---|---|
| Scale-free, missing, 0.2 | 0.84 0.78 0.78 0.77 0.85 | 0.93 0.82 0.92 0.81 0.93 |
| Scale-free, spurious, 0.2 | 0.82 0.93 0.85 0.94 0.82 | 0.96 0.88 0.99 0.89 0.96 |
| Small-world, missing, 0.2 | 0.48 0.72 0.74 0.36 0.46 | 0.41 0.46 0.49 0.17 0.36 |
| Small-world, spurious, 0.2 | 0.55 0.42 0.48 0.44 0.52 | 0.23 0.19 0.23 0.16 0.24 |
| Karate, missing, 0.2 | 0.90 0.84 0.86 0.83 0.90 | 0.84 0.82 0.79 0.83 0.81 |
| Karate, missing, 0.5 | 0.75 0.63 0.68 0.62 0.76 | 0.77 0.73 0.70 0.68 0.75 |

What Panel C actually shows, and the lecture says: which measure is robust
depends on the kind of error and on the network. With missing links on a
scale-free network, degree and PageRank hold best; with spurious links the
order turns over and eigenvector centrality and closeness hold best. On a
small-world network, where no node stands out, every ranking is fragile.

Two quoted numbers were wrong by 0.01 in my first draft (0.85 for 0.84, twice)
and were caught by the pinned checks before the commit.

## References

All sixteen entries are as you gave them; they match what I know of each. I
did not open the papers. Not confirmed against the source: the Strozzi claim
(above), and the page ranges, which I took from your list. Web sources used
for the Strozzi and kite searches:

- https://bookdown.org/markhoff/social_network_analysis/centrality.html
- https://chatox.github.io/networks-science-course/theory/pdf/tt08-casestudy.pdf
- https://arxiv.org/pdf/cond-mat/0309045
- https://networkx.org/documentation/networkx-2.2/reference/generated/networkx.generators.small.krackhardt_kite_graph.html
- https://graph-tool.skewed.de/static/doc/autosummary/graph_tool.collection.krackhardt_kite_graph.html

The kite's edge list is written from the standard description of Krackhardt's
figure and checked against the published values above. It lives in
`centrality/networks.js`, not in `src/data/lab/networks/`.

## Checks on the final build

| Check | Result |
|---|---|
| `npx vite build` | built |
| `check-network-01.mjs`, `02`, `03` | all pass |
| `check-index.mjs network` | 0 failures of 72 |
| `check-index.mjs complexity` | 0 failures of 64 |
| `check-links.mjs` | 0 failures of 80 |
| `check-module.mjs network reading-a-network` | 0 failures of 62 |
| `check-module.mjs network what-are-we-measuring` | 0 failures of 62 |
| `check-module.mjs network centrality` | 0 failures of 56 |
| `modules/network-reading-a-network.mjs` | 0 failures of 25 |
| `modules/network-what-are-we-measuring.mjs` | 0 failures of 29 |
| `modules/network-centrality.mjs` (new) | 0 failures of 40 |
| `build-main.mjs` + `compare-main.mjs` | 0 failures of 144 |

`check-links.mjs` crashed once in a batch run (a Node error, output not
kept) and passed when run again on the same build, as it had before. I did
not find the cause.

## Open

- The three lectures carry the DRAFT marker.
- The Strozzi sentence, if you can check the paper.
- `check-network-03.mjs` takes about half a minute, because it runs the six
  fragility experiments to pin the numbers on the page.
