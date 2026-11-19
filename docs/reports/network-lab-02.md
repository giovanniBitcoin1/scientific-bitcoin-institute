# Network Lab, prompt 2 — final report

Housekeeping (Stage 1), the "Labs" section (step 1d) and Module 02, "What are
we measuring?" (Stage 2). Written on 2026-11-20.

Stage 1, step 1d and Module 02 are done and committed locally on
`network-lab`; nothing was pushed. Every check in the list finished with 0
failures on the final build.

## Commits

| Hash | Message |
|---|---|
| `9efa518` | Network Lab: status file, browser checks, regression |
| `e2ad0e3` | Labs: nav section and hub page |
| `545d949` | Network Lab 02: What are we measuring? (two WIP commits squashed) |

## What differs from the spec

- **Regression gap (1c):** `/lab/random-networks` and `/lab/small-worlds` show
  no difference from main in any of the 8 combinations, including canvas
  pixels. Nothing needed fixing.
- **Worktree and junction:** `build-main.mjs` puts the temporary worktree
  inside the checks folder, so Node finds the repo's `node_modules` by walking
  up. No junction is created at all. The scratch `main-wt` folder from the
  last session was already empty.
- **Regression compare after 1d:** it now compares the text inside `<main>`
  and drops `/lab` from its default list, because the nav and the lab index
  differ from main on purpose. It also loads one page first as a warm-up:
  without it, the first page's canvas was drawn before the web font was cached
  and gave 4 false failures.
- **Nav dropdown:** `Header.jsx` now imports the lab registry, so the registry
  (module titles and summaries) is in the main bundle. A `tagline` field per
  lab was added for the hub card's title line.
- **Panel A drawing:** it draws a 150-node network of the same kind and
  computes every number on the full 600-node one. The panel says so under the
  drawings.
- **Panel A bias curves:** the 30 realisations are pooled (all triangles over
  all triples), not averaged sample by sample. Averaging counted small samples
  with no triples as "transitivity 0" and pulled the curve below the exact
  line.
- **Panel A "New sample":** changing truth or observation goes back to the
  first sample, so the quoted numbers can always be found again.
- **Panel C:** group size is 9 on the karate club (100 is impossible with 34
  nodes). The spread uses a fixed infection probability of 0.05 per step.
  Degree distributions are shown as "share with degree ≥ k" on log axes for
  the scale-free presets.
- **Lecture:** the text cites Achlioptas et al. as "first in 2005, in full in
  2009"; the reference list has the 2009 journal version as given in the
  prompt. The Italian lecture is about 1,730 words counting markup; English is
  about 1,610.
- **Extras:** `shots.mjs` (element screenshots), a functional browser check
  for module 02, and "quoted on the page" checks in `check-network-02.mjs`
  that pin every number in the texts to what the panels compute.

## Exercise answers

Exercises 1, 2, 3 and 5 match the prompt's, and the scale-free part of 4 does
too (lower than the random one). The other parts:

- **Exercise 4, random preset:** theory is 0.169 from the actual moments
  (1/6 = 0.167). In the simulation the largest component holds 71%, 53%, 28%
  and 15% of the sample at f = 0.3, 0.25, 0.2 and 0.15.
- **Exercise 4, scale-free preset:** p_c = 5.98 / (88.2 − 5.98) = 0.073. On
  600 nodes the curve only agrees in direction (38% at f = 0.2 against 28%); a
  threshold at 0.07 cannot be seen, and the solution says so.
- **Exercise 6:** transitivity is surprising against same N and L (z about 4)
  and not against same degrees (z about 1.2). Assortativity is only partly
  explained by the degrees: the null mean is −0.30, but the observed −0.476 is
  still about 3.6 standard deviations lower. The solution and the lecture say
  this rather than "forced by the degrees".

## Self-check numbers

`node scripts/lab/check-network-02.mjs`: all checks passed.

| Check | Result |
|---|---|
| Random nodes, p = 0.3, mean observed ⟨k⟩ | 2.396 |
| Transitivity ratio, random nodes at 0.3 | 0.998 (true T 0.544) |
| Transitivity ratio, random links at 0.3 | 0.302 |
| Random walk, plain average over ⟨k²⟩/⟨k⟩ | 0.9965 (16.13 against 16.19) |
| Random walk, harmonic over ⟨k⟩ | 1.0000 |
| One-source tree, connected network N = 600 | 599 links |
| Largest component, N = 20,000, nodes at 0.5 | 0.796 |
| Poisson(8) thinned at 0.25 against Poisson(2) | largest difference 5 × 10⁻¹⁶ |
| Thinned sums and means | errors below 4 × 10⁻¹⁴ |
| Spurious links, merged nodes | exact counts, no self-links or duplicates |
| 10,000 swaps (karate, scale-free) | degrees unchanged, networks simple |
| Karate, same N and L, 2,000 samples | mean T 0.1360; (L−2)/(M−2) = 0.1360 |
| Karate observed | T 0.2557, assortativity −0.4756 |
| Karate, same degrees, transitivity | mean 0.224, sd 0.025, z 1.24 |
| Karate, same degrees, assortativity | mean −0.300, sd 0.048, z −3.64 |
| Friend mean degree, karate | 7.7692 = 1212/156, confirmed |
| Friend mean degree, ring lattice | 6, equal to ⟨k⟩ |
| Friend mean degree, random N = 20,000 | 6.9975 |
| Early warning, scale-free | friends lead in 96.0% of 200 runs, average lead 1.93 steps |

The early-warning check passes at 96.0% against a bar of 95%, so it is close.

## Numbers behind "What to observe"

**Panel A**
- Small-world, f = 0.3: random nodes give ⟨k⟩ 1.67 and T 0.481 (true 0.494);
  random links give T 0.138.
- Random truth, largest component: 94%, 81%, 55%, 15% at f = 0.5, 0.3, 0.2,
  0.15.
- Dense truth, one source: 599 links, ⟨k⟩ 2.00, no triangles; ten sources:
  3,984 links.
- Scale-free, walk at 0.3: plain 14.37, weighted 6.15 (true 14.75 and 5.98).
  Snowball finds degree 71 of 75; random nodes at most 27.
- Small-world distance 6.73: 6.00 with 2% spurious, 4.74 with 10%, 7.25 with
  10% missing.
- Small-world, 5% merged: largest degree 8 → 18, distance 5.53.

**Panel B** (200 samples unless noted)
- Karate transitivity: z 4.27 (same N and L), 1.34 (same degrees, 9.5% as
  extreme); 3.98 with 2,000 samples.
- Karate average clustering: z 12.6 and 4.0.
- Karate assortativity: null means −0.060 and −0.307, z −3.61 with same
  degrees.
- Small-world preset: transitivity z 28.8; distance 4.94 against 3.40, z 26.9.
- Random preset: every z between −1.36 and 0.68.
- Scale-free preset distance: z −7.3 (same N and L), −2.15 (same degrees).
- Florentine families: largest |z| is 1.31.

**Panel C**
- Scale-free: 5.99 against 15.13; 903 of 1,000 below their friends' average;
  2.4% of nodes and 17% of friends have 20 or more links.
- Random: 6.00 against 6.97; 66.1%.
- Ring: 6 and 6; nobody.
- Karate: 4.59 against 7.77; 29 of 34.
- Early warning, scale-free: half infected at steps 22.1 and 24.1, friends
  ahead in 96%.
- Early warning, random: lead 0.66 steps, ahead in 71%.
- Early warning, ring: ahead in 47.5% (noise).
- Early warning, karate: ahead in 71%.

## References

All 13 papers were confirmed against Crossref and PubMed. Christakis and
Fowler's abstract does say 13.9 days (95% CI 9.9–16.6), for a flu outbreak at
Harvard College in late 2009; the lecture says "about two weeks (13.9 days)".

- **Not confirmed on the publisher's page:** the article number 21 for
  Achlioptas et al. (2009); it comes from Semantic Scholar only.
- **Worth a look:** Barabási's chapter 4 is "The scale-free property", which
  is only loosely about this module. Newman's chapter 9 is "Network statistics
  and measurement error" and chapter 12 "The configuration model"; Latora's
  chapter 5 is "Generalised random graphs". The list was kept as given.

## Check results (final build)

| Check | Result |
|---|---|
| `npx vite build` | passes |
| `check-network-01.mjs`, `check-network-02.mjs` | all checks passed |
| `check-index.mjs network` / `complexity` | 0 of 72 / 0 of 64 failures |
| `check-links.mjs` (hub, dropdown, mobile menu, active state) | 0 of 80 |
| `check-module.mjs` module 01 / module 02 | 0 of 62 / 0 of 62 |
| Functional checks, module 01 / module 02 | 0 of 25 / 0 of 29 |
| `compare-main.mjs` | 0 of 144 |

## Git

State when the report was first given (before the commit that adds this file):

```
$ git status
On branch network-lab
Your branch is ahead of 'origin/network-lab' by 3 commits.
nothing to commit, working tree clean

$ git log --oneline -6
545d949 Network Lab 02: What are we measuring?
e2ad0e3 Labs: nav section and hub page
9efa518 Network Lab: status file, browser checks, regression
9267674 Network Lab 01: Reading a network
84e4f41 Labs: multi-lab engine, Network Lab skeleton (locked, unlinked)
c63d572 Merge Complexity Lab (locked, admin preview)
```

To pick up later, start from `docs/network-lab-status.md`; the next module is
03, Centrality.
