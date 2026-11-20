# Network Lab — status

The one file a new session needs to pick up the Network Lab (`/network-lab`)
with no memory of the previous ones. Keep it current: update it at every
checkpoint and in every module commit. How the labs engine works is in
`CLAUDE.md` ("Labs engine and Network Lab"); this file says where the work is.

## Working rules

- **Branch:** `network-lab`. If you are on another branch, or the working
  tree is not clean when a session starts, stop and ask.
- **No push**, to any branch, until the whole lab is finished. Commit locally
  only.
- **One commit per module**, named `Network Lab NN: <title>`. While a module
  is being built, commit a checkpoint after each step with a message starting
  `WIP Network Lab NN:` and update "Work in progress" below; when the module
  is complete, squash the WIP commits into the one module commit
  (`git reset --soft <commit before the first WIP>` then one commit). The
  status file is updated in the same commit.
- **Do not touch:** git config; `npm audit fix`; the site's `package.json`
  (no new dependency); the admin passphrase (never print or write it);
  `adminHash` and `locked` in `src/data/lab/config.json`; `public/accademia`;
  the Complexity Lab lecture texts; the site nav (the one exception, the
  "Labs" entry, is recorded under "Decisions" below).
- **Originality:** everything is written from scratch: text, figures, tables,
  exercises. Nothing copied or closely paraphrased from any textbook. No book
  PDFs or third-party course material in the repo.
- **Module 01 is the template** for structure, tone, panel style, exercises
  and self-checks: `src/components/lab/network/reading-a-network/`,
  `src/content/network-lab/reading-a-network.*.md`,
  `scripts/lab/check-network-01.mjs`.
- **Lecture conventions:** EN and IT, about 1,400–1,700 words each, first line
  `<!-- DRAFT: to be reviewed by Adriano -->`, display equations in
  ```` ```math ````, live figures in ```` ```figure ````, optional boxes in
  ```` ```box ````, `<!-- simulation -->` before "Further reading". Never call
  the course free. Italian terms as listed in `CLAUDE.md`.
- **Bitcoin:** this is a general course on network science. Short optional
  Bitcoin or power-law boxes only in modules 01, 05, 10, 11, 12, 13 and 14.

### Checks to run before a module commit

```
npx vite build
node scripts/lab/check-network-01.mjs          # and check-network-02.mjs, …
cd scripts/lab/browser-checks                  # see its README; npm install once
node check-index.mjs network
node check-index.mjs complexity
node check-links.mjs
node check-module.mjs network <slug>           # every ready module
node modules/network-<slug>.mjs                # where one exists
node build-main.mjs && node compare-main.mjs   # when shared lab code changed
```

All of them must report 0 failures. Add the new module's expected counts to
`scripts/lab/browser-checks/expect.json`. When shared code changes
(`graphUtils.js`, `LabMarkdown.jsx`, `LabLecture.jsx`, shared hooks or
components), add the Complexity Lab pages that use it to `DEFAULT_URLS` in
`compare-main.mjs`: commit 9267674 moved the force layout out of
`RandomNetwork.jsx` without those pages being on the list (checked
afterwards: no difference).

## How to resume

1. `git status` and `git log --oneline -8` on `network-lab`. The tree must be
   clean.
2. Read "Work in progress" below. If it names a module, the last
   `WIP Network Lab NN:` commit is the state it describes: continue from the
   first item under "Remains".
3. If nothing is in progress, the next module is the first one in the table
   whose status is not `done`. Read its line in "Planned content", then the
   module 01 folder, then build in this order, committing a WIP checkpoint
   after each step: pure logic (`.js`) and `scripts/lab/check-network-NN.mjs`
   → live figures → panels → lecture EN → lecture IT → `texts.js` (what to
   observe, written from the numbers actually obtained; exercises, every
   answer recomputed) → `index.js`, `status: "ready"` in
   `network-modules.json`, `expect.json` → checks → squash.
4. Save every final report, in full, to `docs/reports/network-lab-NN.md` (NN
   = the prompt's number) and commit it locally on its own, as
   "Network Lab NN: report". Standing instruction from Adriano (2026-11-20).
5. End each session with a report: what differs from the spec, exercise
   answers that differ, self-check numbers, the numbers behind each "What to
   observe", references that could not be confirmed, check results, commit
   hashes.
6. The prompts are in `prompts.local/` (git-ignored by the rule `*.local`:
   never commit it, never edit it). The spec of a module in progress is
   `prompts.local/network-lab-NN.md`.
7. The reports are read from `docs/reports/`, and this file from where it is:
   Adriano's assistant reads both straight from the folder, so anything that
   must be known has to be written in one of them.

## Modules

| No. | Slug | Status | Commit | Panels | Live figures |
|---|---|---|---|---|---|
| 01 | `reading-a-network` | done | 9267674 | A The bridges of Königsberg; B Network microscope; C One system, two projections | `three-ways`, `sparse` |
| 02 | `what-are-we-measuring` | done | the commit "Network Lab 02: What are we measuring?" | A The observer; B Compared to what?; C Your friends have more friends | `threshold`, `thinning` |
| 03 | `centrality` | done | the commit "Network Lab 03: Centrality" | A Rankings compared; B The random surfer; C How fragile is a ranking? | `scores`, `kite` |
| 04 | `triangles-weak-ties-motifs` | done | the commit "Network Lab 04: Triangles, weak ties and motifs" | A Close the triangle; B Weak ties hold it together; C Motif counter | `overlap`, `patterns` |
| 05 | `heavy-tails-done-right` | done | the commit "Network Lab 05: Heavy tails, done right" | A A dial for the exponent; B The giant component, by bookkeeping; C Is it a power law? | `hub`, `follow` |
| 06 | `growth-mechanisms` | next | – | – | – |
| 07 | `fitness-and-competition` | planned | – | – | – |
| 08 | `who-connects-to-whom` | planned | – | – | – |
| 09 | `communities` | planned | – | – | – |
| 10 | `weights-flows-navigation` | planned | – | – | – |
| 11 | `robustness-and-cascades` | planned | – | – | – |
| 12 | `epidemics-on-networks` | planned | – | – | – |
| 13 | `social-contagion-network-effects` | planned | – | – | – |
| 14 | `capstone-a-real-network` | planned | – | – | – |

Other commits: 84e4f41 (multi-lab engine, Network Lab skeleton); 9efa518
(status file, browser checks, regression); e2ad0e3 (Labs: nav section and hub
page); c3cf222 (Network Lab 02: fixes — Panel A and Exercise 4 now both quote
the 30-sample averages of the largest component and say how far one sample
swings; Barabási reference).

## Planned content (may change)

- **01 Reading a network:** done.
- **02 What are we measuring?:** done.
- **03 Centrality:** done.
- **04 Triangles, weak ties and motifs:** done.
- **05 Heavy tails, done right:** done.
- **06 Growth mechanisms:** Price model, nonlinear preferential attachment,
  copying, optimisation; rerun history 20 times.
- **07 Fitness and competition:** fitness model, condensation, ageing,
  densification.
- **08 Who connects to whom:** assortativity, homophily, structural cutoff,
  rich club.
- **09 Communities:** modularity, Louvain, resolution limit, detectability
  threshold; karate club; planted communities.
- **10 Weights, flows and navigation:** Dijkstra, maximum flow and minimum
  cut, decentralised search on a Kleinberg lattice.
- **11 Robustness and cascades:** percolation on networks, attacks, overload
  cascades, interdependent networks.
- **12 Epidemics on networks:** branching processes, SI/SIS/SIR, vanishing
  threshold, immunisation, exponential versus power-law growth.
- **13 Social contagion and network effects:** information cascades, critical
  mass, thresholds, complex contagion, Bass model.
- **14 Capstone:** the whole toolkit on one real network.

Short optional Bitcoin or power-law boxes only in 01, 05, 10, 11, 12, 13 and
14.

## Work in progress

Nothing in progress. Next: module 06, `growth-mechanisms`.

## Decisions

- The Network Lab path `/network-lab` is provisional (`src/data/lab/paths.js`).
- **"Labs" section (prompt 2, step 1d).** This overrode two earlier rules,
  for this purpose only: the nav was changed, and the Network Lab is now
  linked. The top-level nav entry "Complexity Lab" became "Labs" (same place,
  between Education and Academy), linking to the hub page `/labs` and with a
  dropdown built from the lab registry (Complexity Lab → `/lab`, Network Lab →
  `/network-lab`), on desktop and in the mobile menu. "Labs" is marked as the
  current section on `/labs`, `/lab/*` and `/network-lab/*`. The hub
  (`src/pages/lab/LabsHub.jsx`, path `LABS_HUB` in `paths.js`) is public and
  never locked: one card per lab with name, tagline (`tagline` in
  `registry.js`), modules ready out of the total and an "Open" link. Each lab
  index has an "All labs" / "Tutti i lab" link back to it. `/lab` and
  `/network-lab` keep their URLs and behaviour; the lock stays on their
  content. Apart from this, the nav is still not to be touched.
- Since the header's nav and the lab index differ from main on purpose,
  `compare-main.mjs` compares the text inside `<main>` and leaves `/lab` out
  of its default list.

## Open items

- Lectures of modules 01, 02, 03, 04 and 05 carry the DRAFT marker: to be
  reviewed by Adriano.
- Shared since module 03: `src/components/lab/network/charts.jsx` (SVG line
  chart with linear or log axes) and `NetCanvas.jsx` (static network drawing,
  `fitUnit`), moved out of the module 02 folder.
- Module 02, things a later module may reuse: `nullmodels.js` has the degree-preserving swap that module 04 needs for
  motifs, and `friends.js` an SI spread that module 12 can start from.
- Module 02 texts quote numbers produced with fixed seeds. They are pinned
  by the "quoted on the page" checks in `scripts/lab/check-network-02.mjs`:
  if a preset or a seed changes, those checks fail and `texts.js` must be
  updated.
- Module 02, choices to review: Panel A draws a 150-node network of the same
  kind and computes on the full 600-node one; the Italian lecture is about
  1,730 words counting markup (the target was 1,400–1,700).
- Module 03, things a later module may reuse: `centrality/centrality.js` has
  every measure as a plain function (Brandes betweenness, eigenvector by
  shifted power iteration, exact Katz, PageRank with dangling nodes, HITS,
  Spearman with ties, `places`, `pieces`) on `{ n, out, inn }` lists, for
  directed and undirected networks; `networks.js` has Krackhardt's kite and
  the 12-page web; `fragility.js` has `dropLinks` / `addLinks`. Module 11
  (attacks by degree or betweenness) can start from these.
- Module 03, choices to review: Panel A draws with SVG and listens to clicks
  only (no canvas, no Draw toggle); closeness in a network in several pieces
  uses the Wasserman–Faust scaling; ties in a top ten are broken at random in
  Panel C; the claim that the Strozzi had more wealth and council seats than
  the Medici was not confirmed against Padgett and Ansell and is worded
  cautiously in the lecture.
- Module 03 texts quote numbers produced with fixed seeds, pinned by the
  "quoted on the page" checks in `scripts/lab/check-network-03.mjs` (it takes
  about half a minute: it runs the six fragility experiments).
- Prompt 4, stage 0 (fixes to module 03): the two English sentences already
  said what the Italian says, so nothing was changed and there is no
  "Network Lab 03: fixes" commit. `check-links.mjs` did not crash again.
- Module 04, things a later module may reuse:
  `triangles-weak-ties-motifs/overlap.js` (neighbourhood overlap, bridges,
  local bridges, transitivity and distances on adjacency sets), `weakties.js`
  (`removalCurve`: the largest piece for every number of links removed, in one
  backward pass; module 11 can start from it), `motifs.js` (the thirteen
  patterns, a count checked against brute force, and a randomiser that keeps
  incoming, outgoing and mutual links), `PatternIcon.jsx`.
- Module 04, choices to review: Italian terms chiusura triadica, ponte locale,
  sovrapposizione (dei vicinati), legame debole, motivo; "feed-forward loop"
  stays in English, and the lecture calls the thirteen patterns "schemi".
  Panel A has no drawing of the network (readouts and four charts). Panel B:
  strength = overlap + a random number between 0 and 0.1; "average size of the
  other pieces" is the plain mean of their sizes. Panel C draws the networks
  without arrowheads. The lecture gives the count "40 against 7 ± 3" as it is
  in Milo et al. (2002), Table 1; Shen-Orr et al. (2002) list 34 coherent and
  6 incoherent loops separately.
- Module 04, Panel B, switch off: with 30 networks the gap between "weakest
  first" and "strongest first" is chance, and it is largest where the network
  collapses (f ≈ 0.85). `WEAK_SEED` = 2026 gives 0.03; ten other seeds give
  0.04 to 0.11, so the prompt's limit of 0.05 holds for this seed, not for any
  seed. With 120 networks the gap is 0.04 (checked). To make it hold for any
  seed, raise `WEAK_RUNS`.
- Module 04 texts quote numbers produced with fixed seeds, pinned by the
  "quoted on the page" checks in `scripts/lab/check-network-04.mjs` and by
  `scripts/lab/browser-checks/modules/network-triangles-weak-ties-motifs.mjs`.
- Module 05, things a later module may reuse, all in
  `heavy-tails-done-right/`: `zeta.js` (Hurwitz zeta, exact discrete power
  law and its sampler, polylogarithm, natural cutoff), `configmodel.js`
  (configuration model with any degree sequence, cleaning of self-links and
  repeated links, `networkStats`), `genfun.js` (u = G1(u), S = 1 − G0(u) for a
  family of distributions; module 11 can add an occupation probability to it),
  `fit.js` (the whole Clauset–Shalizi–Newman recipe for whole numbers: KS scan
  of k_min, exact maximum likelihood, bootstrap as a job, Vuong test against a
  lognormal, an exponential and a power law with cut-off, Hill plot),
  `sources.js` (seven samplers). Module 06 can run its degree sequences
  through `fit.js`.
- Module 05, precomputed: `src/data/lab/precomputed/network-05-giant.json`
  (curves and dots of Panel B) is written by
  `node scripts/lab/precompute-network-05.mjs`; `check-network-05.mjs` fails if
  the file is not what the code gives. The check takes about a minute and a
  half; `node scripts/lab/check-network-05.mjs <section>` runs one section
  (`zeta`, `cutoff`, `config`, `genfun`, `fit`, `page`).
- Module 05, a formula that differs from the prompt: the expected number of
  repeated links in the configuration model is ((⟨k²⟩ − ⟨k⟩)/⟨k⟩)²/4, not /2
  (Poisson ⟨k⟩ = 4: 4, not 8; measured 3.85 over 200 networks). Lecture, panel
  and check use /4. To be confirmed by Adriano.
- Module 05, choices to review: the verdict of Panel C also refuses when the
  tail covers less than a factor of ten in k (not only below 50 values); the
  bootstrap runs on a button; the experiment of Panel A takes the median of 10
  networks per size (about 8 s in the browser) and keeps N = 10⁵; candidate
  k_min need at least 10 values above them; lognormal source μ = 1, σ = 1.2;
  the lognormal candidate is not allowed to start more than 8σ above μ. Seeds
  were chosen so that the default samples are typical ones (`DIAL_SEED` 2600,
  `SAMPLE_SEED` 1900), and the natural-cutoff check does not hold for any seed: at
  γ = 2.5 two of the nine seeds tried gave a slope more than 0.05 from 2/3
  (200 samples give the slope to about ±0.024).
- Module 05, Italian terms: cutoff naturale, mondi ultra-piccoli
  (*ultra-small worlds*), modello di configurazione, cappio, collegamento
  ripetuto, funzione generatrice, componente gigante, bontà dell'adattamento,
  rapporto di verosimiglianza, coda pesante; mezzo collegamento for half-link,
  taglio for cut-off, classi for bins.
- Module 05 texts quote numbers produced with fixed seeds, pinned by the
  "quoted on the page" checks in `scripts/lab/check-network-05.mjs` and by
  `scripts/lab/browser-checks/modules/network-heavy-tails-done-right.mjs`.
  The page formats numbers with `toLocaleString`, which rounds 0.855 to 0.86
  where `toFixed` gives 0.85: the checks format the same way as the page.
