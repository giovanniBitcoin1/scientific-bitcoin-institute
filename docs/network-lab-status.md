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
- **A check that fails is information.** Never choose a seed or a preset in
  order to make a check pass. If a limit given in a prompt turns out to be
  too tight, first make sure that the code is right; then set the limit from
  what ten or more seeds show, and say so in the report, with the numbers.
  (Adriano, prompt 5b.)

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
| 06 | `growth-mechanisms` | done | the commit "Network Lab 06: Growth mechanisms" | A Rerun history; B Who needs to know the degrees?; C Measure the attachment rule | `rich`, `snapshots` |
| 07 | `fitness-and-competition` | done | the commit "Network Lab 07: Fitness and competition" | A The fit get rich; B One node above the rest; C Age and density | `race`, `energy` |
| 08 | `who-connects-to-whom` | done | the commit "Network Lab 08: Who connects to whom" | A Do hubs link to hubs?; B Mixing and robustness; C Birds of a feather | `wirings`, `illusion` |
| 09 | `communities` | done | the commit "Network Lab 09: Communities" | A Find the groups; B The resolution limit; C Can they be found at all? | `split`, `ring` |
| 10 | `weights-flows-navigation` | done | the commit "Network Lab 10: Weights, flows and navigation" | A Weights matter; B How much can flow?; C Find your way | `strength`, `flow` |
| 11 | `robustness-and-cascades` | done | the commit "Network Lab 11: Robustness and cascades" | A Failures, attacks and onions; B Overload; C Coupled networks | `fail`, `cascade` |
| 12 | `epidemics-on-networks` | done | the commit "Network Lab 12: Epidemics on networks" | A Threshold or no threshold; B Hubs first; C Whom to vaccinate | `seed`, `growth` |
| 13 | `social-contagion-network-effects` | done | the commit "Network Lab 13: Social contagion and network effects" | A Tipping points; B The cascade window; C Clusters and long ties | `cascade`, `riot` |
| 14 | `capstone-a-real-network` | done | the commit "Network Lab 14: Capstone, a real network" | A The workbench; B Stress tests; C The map and the spread | `map`, `outliers` |

Other commits: 84e4f41 (multi-lab engine, Network Lab skeleton); 9efa518
(status file, browser checks, regression); e2ad0e3 (Labs: nav section and hub
page); c3cf222 (Network Lab 02: fixes — Panel A and Exercise 4 now both quote
the 30-sample averages of the largest component and say how far one sample
swings; Barabási reference); the commits "Network Lab 04: fixes" and "Network Lab 05: fixes" (prompt 5b); "Network Lab 07: fixes" (prompt 8, stage 0: "Age and cost" now says the theory gives 3 at ν = 0 and that the recipe reads low, so the four values are compared with one another; same remark in Panel C's observe list); "Network Lab 10: fixes" (prompt 11, stage 0: the Lightning box now says that max-flow min-cut shows what several routes can carry together but that splitting blindly adds at most 1.4 percentage points of success, and that Core Lightning first shipped the plugin in 23.08; both pinned in `check-network-10.mjs`); "Complexity Lab 04: default connection limit" (prompt 12, stage 0: the one authorised change to a Complexity Lab lecture — `scale-free.en.md` / `.it.md` now say that Bitcoin Core's default limit of connections is 200 since version 32.0 and was 125 before; confirmed in the 32.0 release notes, PR #28463).

## Planned content (may change)

- **01 Reading a network:** done.
- **02 What are we measuring?:** done.
- **03 Centrality:** done.
- **04 Triangles, weak ties and motifs:** done.
- **05 Heavy tails, done right:** done.
- **06 Growth mechanisms:** done.
- **07 Fitness and competition:** done.
- **08 Who connects to whom:** done.
- **09 Communities:** done.
- **10 Weights, flows and navigation:** done.
- **11 Robustness and cascades:** done.
- **12 Epidemics on networks:** done.
- **13 Social contagion and network effects:** done.
- **14 Capstone:** done.

Short optional Bitcoin or power-law boxes only in 01, 05, 10, 11, 12, 13 and
14.

## Work in progress

Nothing in progress. The fourteen modules are done and the closing pass
(prompt 15) is finished: commits "Network Lab: closing pass", "Network Lab:
review file" and "Network Lab 15: report".

## Next

The Lab is complete, checked and waiting for Adriano's review. Nothing is to
be pushed or merged: the branch `network-lab` stays local until he says so.

- What he reads: `docs/network-lab-review.it.md` (in Italian, stands on its
  own): the modules, the softened sentences, the Bitcoin boxes with their
  sources, data and licences, what changes outside the Network Lab, the
  inconsistencies found and not corrected, the pending decisions, and the
  steps before publishing.
- The numbers of the last verification are in `docs/reports/network-lab-15.md`.
- `origin/main` moved on after the branch started (10 commits: the Newsroom).
  The branch merges into it without conflicts (`git merge-tree`), but the
  merged site has not been built or checked. The regression compare builds
  the local `main` (c63d572, the branch's starting point) and now reports 7
  differences, all on `/lab/scale-free`, all from the authorised sentence of
  commit dcc8949.
- After any change to a text: the module's self-check and its two browser
  checks, one command at a time.

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

- Lectures of modules 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13 and 14 carry the DRAFT marker:
  to be reviewed by Adriano.
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
- Module 04, Panel B (prompt 5b, "Network Lab 04: fixes"): the removal orders
  draw from a generator of their own (`orderRandom`), so at random, lowest and
  highest overlap first are identical with the switch on and off;
  `WEAK_RUNS` = 300 (2.1 s in the headless browser), and switched off the three
  curves weakest, strongest, random stay within 0.05 for `WEAK_SEED` and ten
  other seeds (0.011 to 0.035).
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
  and check use /4. Confirmed by Adriano (prompt 5b): self-links are close to
  a Poisson variable with mean λ/2 and double links to one with mean λ²/4,
  λ = (⟨k²⟩ − ⟨k⟩)/⟨k⟩.
- Module 05, kept after review (prompt 5b): the verdict rule "less than a
  factor of ten in k", and Exercise 6 with no clean answer for the lognormal.
- Module 05, choices to review: the
  bootstrap runs on a button; the experiment of Panel A takes the median of 10
  networks per size (about 8 s in the browser) and keeps N = 10⁵; candidate
  k_min need at least 10 values above them; lognormal source μ = 1, σ = 1.2;
  the lognormal candidate is not allowed to start more than 8σ above μ. Seeds
  were chosen so that the default samples are typical ones (`DIAL_SEED` 2600,
  `SAMPLE_SEED` 1900).
- Module 05 fixes (prompt 5b, "Network Lab 05: fixes"): the box "Two things
  called a power law" points to "Further reading" and to the Publications
  page; Exercise 6 states the range of sample 1's tail (10 to 8,713, an
  outlier; next 3,275 and 2,276); a bootstrap with no synthetic set worse shows
  p < 1/sets (and the verdict says so), a small non-zero p three decimals, and
  a likelihood-ratio p below 0.005 "< 0.01"; the natural-cutoff check uses
  1,000 maxima drawn directly from F(k)^N and holds for the default seed and
  ten others at γ = 2.5 and 3 (largest gaps 0.025 and 0.024).
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
- Module 06, things a later module may reuse, all in `growth-mechanisms/`:
  `growth.js` (a Fenwick tree for drawing ∝ weights in O(log N); growth with
  kernel (k + A)^α and leader tracking; link selection; copying, directed;
  random walk; FKP optimisation; exact distributions of the offset, uniform
  and Price models), `kernel.js` (two snapshots, Π(k), cumulative fit,
  conditional maximum likelihood of the kernel exponent), `experiments.js`.
  Module 07 (fitness) can add a fitness factor to the weights of
  `growKernel`. Module 06 imports module 05's `fit.js` (the tail of the
  copying model); Vite puts the shared code in a chunk of its own, loaded
  only when unlocked.
- Module 06, choices to review: the FKP root sits at the centre of the square
  (so the star lasts up to δ ≈ √2, not only 1/√2: the lecture says so); the
  random walk restarts from a random node for every link (simplest version;
  Saramäki–Kaski keep walking until m endpoints are marked, Vázquez links to
  the nodes along the walk); Panel C shows two cumulative fits (up to the
  largest degree held by 10 nodes, and every class) beside maximum
  likelihood; for copying the kernel is measured on total degree q + m, and
  "share linked" counts distinct nodes; F2 groups the degree classes 2, 3,
  4–5, 6–9, 10+; Panel A's mean-field line is (m + A)(t/t_i)^(1/(2 + A/m)) − A
  (the prompt's m (t/t_i)^β when A = 0).
- Module 06, Italian terms: aggancio preferenziale, attrattività iniziale,
  kernel di aggancio, campo medio, vantaggio del primo arrivato, il vincitore
  prende tutto, esponenziale stirata, selezione di un collegamento, modello di
  copia (copia), passeggiata aleatoria, istantanea.
- Module 06 texts and lecture quote numbers produced with fixed seeds, pinned
  by the "quoted on the page" checks in `scripts/lab/check-network-06.mjs`
  (`node scripts/lab/check-network-06.mjs page` runs that section; the whole
  check takes about 10 s) and by
  `scripts/lab/browser-checks/modules/network-growth-mechanisms.mjs`.
- Module 06 lecture: the DRAFT marker is on; the measured kernels of Jeong et
  al. (2003) and Newman (2001), Newman (2009), FKP and Berger et al. (2003),
  and MusicLab were checked against the papers (prompt 6 report).
- Module 07, things a later module may reuse, all in
  `fitness-and-competition/`: `fitness.js` (fitness distributions and their
  samplers; C from ∫ρη/(C − η) = 1 by bisection, closed forms where they
  exist; growth with attachment ∝ η k on module 06's Fenwick sampler, with
  tracked-node histories, lead changes and the second-half slopes; one node
  above the rest; ageing; accelerating growth; adjacency in birth order and
  average distance of the network at any earlier size), `experiments.js`,
  `figures.js`. It imports module 06's `growth.js` (the Fenwick sampler) and
  module 05's `fit.js` without changing them; Vite puts `growth.js` in a chunk
  of its own, loaded only when unlocked. No shared code changed.
- Module 07, choices to review: the six tracked nodes of Panel A are the three
  oldest, the fittest, and the fittest born in steps 10–99 and 100–999; the
  slopes use nine sizes from N/2 to N, for nodes born in the first half with
  degree ≥ 2m at N/2 (the prompt's "at least doubled"); "the leader has the
  highest fitness" counts runs where no node is fitter (with two values, any
  node of fitness 1); F2 boosts the 4th node (fitness 1, the others halved,
  same draws), grows 12 → 30 nodes and shows one particle per link on the
  level of its older end, as Bianconi–Barabási's own diagrams do (their
  mapping puts a second particle on the newcomer's level, and the lecture
  says so); ageing is exact, every weight recomputed at every step from a
  table of τ^(−ν), O(N²), up to 20,000 nodes (0.5–0.6 s in headless Chrome);
  Panel C draws a 300-node network of the same ν beside the numbers.
- Module 07, findings the texts state: the leader of Panel A is never the
  fittest node (0 of 20); Panel B converges slowly, from above, and b = 0.9
  still shows 0.135 at 20,000 nodes; distances in the accelerating model do
  not shrink (they grow more slowly); the recipe's γ falls short of the
  predicted exponents in ageing and accelerating growth.
- Module 07, Italian terms: fitness (la fitness), i più adatti si
  arricchiscono, condensazione, livello di energia, cambio di leader,
  invecchiamento, densificazione, crescita accelerata; latecomer = ultimo
  arrivato, incumbent = veterano.
- Module 07 texts and lecture quote numbers produced with fixed seeds, pinned
  by the "quoted on the page" checks in `scripts/lab/check-network-07.mjs`
  (about 15 s; sections C, equal, slopes, leader, condensation, ageing,
  accel, exercises, figures, page — run it whole, since page uses the numbers
  of slopes and condensation) and by
  `scripts/lab/browser-checks/modules/network-fitness-and-competition.mjs`.
- Module 08, things a later module may reuse, all in `who-connects-to-whom/`:
  `mixing.js` (Newman's r and Spearman's ρ over link ends with average ranks
  for ties; k_nn(k) in classes and its slope; structural cutoff; rich club
  φ(k) and its normalised version as a job against module 02's swap chain;
  the Xulvi-Brunet–Sokolov rewirer towards assortative or disassortative,
  refusing self-links and repeated links; `giantCurve`, the largest component
  after every number of removed nodes in one union–find pass, with random and
  attack orders; growth with two groups and a homophily h; the mixing matrix,
  attribute assortativity and Coleman's index; the majority illusion),
  `experiments.js`, `figures.js` (Havel–Hakimi). Module 11 (robustness) can
  start from `giantCurve`, and module 09 from the two-group growth. It imports
  module 02's `nullmodels.js` (the swap) and module 05's `configmodel.js` and
  `zeta.js` without changing them; Vite now puts `nullmodels.js` and
  `configmodel.js` in small chunks of their own, loaded only when unlocked.
  Module 03's fragility code is about rankings and did not fit Panel B.
- Module 08, choices to review: Panel B removes nodes by the degrees of the
  intact network (not recomputed), mean of 20 orders, and the power-law
  source of Panel B is fixed at γ = 2.5; Coleman's index is (H − w)/(1 − w)
  when H ≥ w and (H − w)/w otherwise, so it runs from −1 to 1; Panel C's
  majority illusion uses the panel's two-group network (2,000 nodes), whatever
  the groups; the two-group growth starts from m + 1 linked nodes and picks a
  node of the chosen group ∝ degree (uniformly while the group has no links);
  F1 builds each degree sequence with Havel–Hakimi and rewires it 60 times per
  link with p = 1; F2 has a fixed degree sequence (8, 7, 6, 3 and sixteen 2s);
  rich-club randomisations are 20 states of one swap chain, 10 attempts per
  link apart; k_nn is exact up to k = 10, then in classes of a tenth of a
  decade, and its slope is fitted from k = 3.
- Module 08, findings the texts state: r shrinks with N on preferential
  attachment while ρ stays at −0.31; maximal assortative rewiring reaches
  ρ = 0.96 but r only 0.36, and on a γ = 2.5 sequence r stays at −0.01; the
  erased configuration model with γ = 2.5 is not the swap null (its top hubs
  are linked up to 1.2 times as densely); against attack the assortative
  wiring is by far the most robust, under random removal the weakest until
  78% of the nodes are gone; with the same h, a minority keeps a smaller
  share of its links inside.
- Module 08, Italian terms: assortativa / disassortativa, grado medio dei
  vicini, cutoff strutturale, rich club (coefficiente di rich club), omofilia,
  matrice di mescolamento, illusione della maggioranza, assortatività per
  attributo, ricablatura, cablaggio.
- Module 08 texts and lecture quote numbers produced with fixed seeds, pinned
  by the "quoted on the page" checks in `scripts/lab/check-network-08.mjs`
  (about a minute; run it whole, since "page" uses the numbers of the other
  sections) and by
  `scripts/lab/browser-checks/modules/network-who-connects-to-whom.mjs`.
- Module 09, things a later module may reuse, all in `communities/`:
  `community.js` (modularity and Q_γ with its two terms, the direct sum over
  pairs; Louvain with a resolution and a per-move hook; label propagation;
  NMI after Danon et al.; the Girvan–Newman benchmark and any dense block
  model; G(n, M); a sparse two-group block model in time proportional to the
  links; overlap; the ring of cliques with closed forms, the γ range and a
  clique report; spectral bisection of the modularity matrix by power
  iteration as a job), `experiments.js`, `figures.js` (exhaustive best
  two-group split). It imports only shared lab code and the karate data of
  module 03, which Vite now puts in a small chunk of its own
  (`karate-club-*.js`), loaded only when unlocked. No shared code changed.
- Module 09, choices to review: the karate club is the repository's NetworkX
  version (78 links, unweighted, "club" labels, 17 and 17) and its factions
  give Q = 0.3582; the best Q, 0.4198, is said to be "the best partition
  known" and "reported in the literature as the maximum" (the optimality proof
  of Brandes et al. 2008 could not be confirmed against the paper); Panel C
  uses Decelle's convention c_in = N p_in, so a node has c_in/2 links inside
  (the prompt's "c_in links per node inside" was corrected in the texts); the
  multiple of the threshold is clamped at √c̄ where c_out = 0; spectral
  bisection stops after 4,000 power iterations (below the threshold it rarely
  settles; the panel says "not settled"); ring sizes are even only (n step 2);
  F1 starts with two nodes on the wrong side; γ is on a log slider 0.1–100.
- Module 09, findings the texts state: on 1 of 20 random networks label
  propagation scores higher than Louvain (0.492 against 0.490: reported, the
  check asks only that Louvain is never more than 0.01 below); Louvain on the
  ring n = 30, s = 5 stops at 0.8871 with 14 pairs and 2 single cliques, just
  below the pairing's 0.8879; at 1.2 times the threshold the spectral overlap
  is 0.46 here against 0.18 in Adriano's scipy runs (a sweep of 3 networks;
  near the threshold it swings).
- Module 09, Italian terms: comunità, modularità, limite di risoluzione,
  modello a blocchi stocastico, soglia di rilevabilità, benchmark, propagazione
  delle etichette, informazione mutua normalizzata (NMI), cricca,
  sovrapposizione (overlap), partizione, gruppi impiantati.
- Module 09 texts and lecture quote numbers produced with fixed seeds, pinned
  by the "quoted on the page" checks in `scripts/lab/check-network-09.mjs`
  (about a minute; run it whole) and by
  `scripts/lab/browser-checks/modules/network-communities.mjs`.
- Browser checks on this PC: several `check-module.mjs` runs chained in one
  shell crashed Node from module 05 on (low memory); each passes when run on
  its own. Run them one per command, in the foreground (the README of the
  browser checks now lists every command and says so). Even alone, a run can
  crash once: `modules/network-robustness-and-cascades.mjs` did during the
  checks of module 12 and passed when repeated.
- Module 10, things a later module may reuse, all in
  `weights-flows-navigation/`: `weights.js` (a CSR with link ids; strength,
  disparity and the disparity filter with its backbone; a binary heap;
  Dijkstra; Floyd–Warshall for checks; Brandes betweenness with costs, one
  source at a time, with the fewest links among the cheapest routes; Spearman
  with ties; degree classes and a power-law fit), `flow.js` (flow networks as
  pairs of arcs, Dinic's maximum flow with the minimum cut and the source
  side, flow decomposition into routes, widest route = largest bottleneck then
  fewest arcs, brute-force versions for checks; the synthetic payment network,
  disjoint routes, the uncertainty model), `kleinberg.js` (offset table,
  lattice, greedy routing), `experiments.js`, `figures.js`. Module 11 can
  start from `maxFlow`/`widestRoute` for overload cascades and from the
  weighted betweenness for attacks. It imports only shared lab code
  (`graphUtils.js` for preferential attachment, `rng.js`, `Slider`,
  `useExperiment`, `ui.jsx`, `charts.jsx`): no code of another module, no
  shared code changed, no canvas (everything is SVG).
- Module 10, choices to review: Panel A uses m = 3 links per new node, fits β
  on the means of degree classes (every degree up to 10, then a tenth of a
  decade), and takes routes and both betweenness rankings from the same 200
  random sources (one random target each), not from all pairs; a pair
  "differs" when its cheapest route (cost 1/w) has more links than its
  shortest one. Panel B: m = 3 channels, capacities lognormal with median
  1,000,000 and σ = 1, whole numbers, balance uniform on 0…c; "the widest
  single route" in the pair readout is by the balances (what one route can
  really carry), while the blind strategies use the public capacity; the
  blind single route is the widest by capacity and, among those, the one
  with the fewest channels; "up to four routes" are found one after the other
  sharing no channel, and the number of parts (1–4) is the one the
  uncertainty model rates most likely; the amount is a fraction of the
  sender's outgoing balance, at least 1. Panel C: α in steps of 0.25, the
  readout uses 200 pairs and the sweeps 2,000 pairs on one lattice per
  (L, α); "Sweep L" uses L = 25 … 400. F1 weights are whole numbers 1–20;
  F2's second network has its minimum cut in the middle. The offsets check
  uses a chi-square test and 4 standard errors on r = 1, 2, 3 (the prompt's
  "within 1%" is tighter than the sampling error at α = 0 with 400,000
  draws). F1 is about 630–660 px tall at 375 px (six sliders).
- Module 10, findings the texts state: blind splitting into equal parts adds
  at most 0.014 to the success of one blind route, while knowing every balance
  moves the half-success point from 7% to 71% of the sender's balance; the
  best α for greedy routing is 1, 1.25, 1.5, 1.5 at L = 50, 100, 200, 400 and
  α = 1.5 still beats 2 at L = 800; with the weights shuffled the backbone at
  0.05 falls apart (largest component 1.3% of the nodes).
- Module 10, Italian terms: peso, forza, disparità, dorsale (*backbone*),
  filtro di disparità, flusso massimo, taglio minimo, cammino più largo
  (percorso for "route"), capacità, strozzatura, canale di pagamento,
  pagamento in più parti (*multi-part payment*), saldo, instradamento greedy,
  navigabile / navigabilità, contatto a lungo raggio, reticolo, toro.
- Module 10 texts and lecture quote numbers produced with fixed seeds, pinned
  by the "quoted on the page" checks in `scripts/lab/check-network-10.mjs`
  (about 15 s; run it whole, since "page" uses the numbers of the other
  sections) and by
  `scripts/lab/browser-checks/modules/network-weights-flows-navigation.mjs`.
- Module 11, things a later module may reuse, all in
  `robustness-and-cascades/`: `robust.js` (critical fraction from the degree
  moments; removal by recomputed degree in O(N + L); Brandes loads by plain
  breadth-first search with a mask of working nodes, with or without the paths
  that end at the node, and a brute count for checks; removal by betweenness,
  intact or recomputed, as a job; the robustness R and the collapse point;
  the swap optimiser of Schneider et al. as a job; a table of who links to
  whom by degree class; Motter–Lai cascades as a generator; `largestComponent`
  with a mask; the cascade between two coupled networks; the theory curves
  x = p(1 − e^(−kx))² and x = p(1 − e^(−kx)) and the constant 2.4554),
  `experiments.js`, `figures.js`. Module 12 (epidemics, immunisation) can
  start from the removal orders and from `largestComponent`. It imports
  module 08's `mixing.js` (`giantCurve`, `randomOrder`, `attackOrder`,
  `makeSource`, `pearsonR`, `spearmanRho`) without changing it, and through it
  modules 05 and 02; no shared code changed, so no regression compare was run.
  Module 10's Brandes (Dijkstra with a heap, no mask) did not fit: module 11
  has its own breadth-first version, checked against module 10's.
- Module 11, choices to review: Panel A defaults to 1,000 nodes (so that the
  optimisation is at hand; exercise 5 asks for 10,000); sizes are 200, 500,
  1,000, 2,000, 5,000, 10,000; the power-law source has k_min = 2 and its mean
  degree follows from γ (no mean-degree slider for it); preferential
  attachment takes even mean degrees only; "falls below 1% of N" is the first
  fraction at which the largest component has fewer than N/100 nodes, and for
  random removal it is the mean of the 20 orders; ties in the attack by
  recomputed degree are broken by a fixed rule (the node whose degree changed
  last), so the same network always gives the same R; the attack by
  betweenness and "Make it robust" run on buttons (about 8 s and 7 s in
  headless Chrome at 1,000 nodes); beyond 1,000 nodes betweenness is that of
  the intact network; the optimiser tries 20,000 swaps and stops (it has not
  converged: R is still rising); instead of a drawing of the network before
  and after, the panel shows two tables of who links to whom by degree class
  (a node-link drawing of 1,000 nodes showed nothing). Panel B: load = shortest
  paths through the node plus the paths that end at it (so that no node has
  capacity 0), mean degree 4, sizes 200–1,000, default 400, α in steps of
  0.05, the sweep uses α = 0, 0.1, …, 1 and 20 random triggers (about 5 s at
  400 nodes, half a minute at 1,000). Panel C: node i of A depends on node i
  of B (the two networks are wired independently, so this is a random
  matching); one random order of the nodes, p in steps of 0.01, the whole
  sweep runs when the page loads (0.3 s at 10,000 nodes, across frames);
  "steps" count the turns of A or B that removed something; the power-law
  pair has γ = 2.5, k_min = 2 and is compared with the theory of two random
  networks of its mean degree. F1: 60 nodes, preferential attachment m = 2,
  the attack takes the highest current degree. F2: two hand-picked networks of
  15 nodes and 18 links each, start node A4 (7 rounds, 7 pairs left); any node
  can be clicked. Both figures are about 360 px tall at 1280 px, and F1 630 px
  at 375 px.
- Module 11, findings the texts state: on the default network the swaps raise
  R under attack from 0.097 to 0.221 but lower R under random removal from
  0.416 to 0.386; recomputed betweenness is the most damaging order (R 0.082);
  with 400 nodes and α = 0.2 removing the most loaded node leaves 0.070 and a
  random node 0.996; the coupled pair jumps between p = 0.61 (nothing, after
  31 steps) and 0.62 (0.365); two power-law networks need p = 0.68 where two
  random networks of the same mean degree would need 0.558.
- Module 11, sources (checked in November 2026, details in
  `docs/reports/network-lab-11.md`): Bitcoin Core's default limit of
  connections went from 125 to 200 in version 32.0, so the box quotes only the
  8 + 2 outbound connections; feeler connections shipped in 0.13.1 and
  test-before-evict in 0.17.0; Rohrer et al. (2019) give no "a few nodes
  fragment the graph" figure and the sentence was softened; no chapter number
  is given for Latora, Nicosia and Russo.
- Module 11, Italian terms: robustezza, guasto casuale, attacco mirato,
  frazione critica, struttura a cipolla, sovraccarico, tolleranza, carico,
  cascata, turno (round), reti interdipendenti / accoppiate, componente
  gigante mutua, attacco di eclissi (eclissi, *eclipse attack*), innesco
  (trigger).
- Module 11 texts and lecture quote numbers produced with fixed seeds, pinned
  by the "quoted on the page" checks in `scripts/lab/check-network-11.mjs`
  (about two minutes; run it whole, since "page" uses the numbers of the other
  sections) and by
  `scripts/lab/browser-checks/modules/network-robustness-and-cascades.mjs`.
  The page formats with `toLocaleString` (0.0075 shows as 0.008): the checks
  format the same way.
- Module 12, things a later module may reuse, all in `epidemics-on-networks/`:
  `epidemic.js` (T_c, R0 and g_c from the degree moments; S = 1 − e^(−RS);
  the generating functions of any list of degrees as a family for module 05's
  solver; u, w and 1 − G0(w) at a transmissibility T; bond percolation by
  union–find with an optional mask of immune nodes; one SIR outbreak from a
  seed; SI/SIR in discrete steps with d infectious steps; SIS in discrete
  steps as a generator; a square lattice with open edges; log-log slope;
  acquaintance immunisation), `experiments.js`, `figures.js` (the ladder of
  groups). Module 13 (thresholds, complex contagion) can start from `spread`
  and from `outbreakFrom`. It imports module 05's `genfun.js` (`solveU`),
  module 08's `mixing.js` (`makeSource`, `randomOrder`, `attackOrder`,
  `degreesOf`), module 11's `robust.js` (`seedOf`, `moments`,
  `largestComponent`, `drain`) and module 02's `friends.js` (`spreadSI`)
  without changing them; Vite now puts `genfun.js`, `friends.js`, `robust.js`
  and `mixing.js` in small chunks of their own, loaded only when unlocked. No
  shared code changed, so no regression compare was run. Module 08's
  `giantCurve` removes nodes, not links, and did not fit the percolation of
  links: module 12 has its own union–find over the links.
- Module 12, choices to review: the power-law network of Panel A is the
  configuration model with k_min = 2, so its mean degree follows from γ and
  from the network drawn (4.35 at γ = 2.5 and 10,000 nodes), not 4 like the
  other two; the theory curve is drawn for the random network and the power
  law (configuration models), from the generating functions of the network's
  own degrees, and not for preferential attachment; an outbreak is "large"
  above 1% of N; the 1,000 seeds are drawn at random, so degrees with few
  seeds are noisy (a degree is shown from 10 seeds, up to k = 20); SIS has
  μ = 0.2, everyone infected at the start, 400 steps with the last 150
  averaged, β/μ from 0 to 0.5 in steps of 0.02, and runs on a button (3 to 5 s
  at 10,000 nodes); Panel B has β from 0.05 to 0.5 and d from 1 to 10, default
  β = 0.2 and d = 4, the lattice has open edges and starts from its centre,
  seeds on the two networks are random nodes of the largest component, and for
  SIR only the runs above 1% of N are averaged; the mean degree of the newly
  infected is shown for steps with at least 20 nodes over the 20 runs; Panel C
  uses 5 runs per point (the prompt's numbers were means of 3), g up to 0.9 in
  steps of 0.01, and "below 1% of N from g =" for each strategy. F1: 80 nodes
  grown with one or two links per newcomer (126 links, 14 nodes with one
  link, a hub of 19), T = 0.5, classes of 8 nodes; it is 380 px tall at
  1280 px and about 600 px at 375 px. F2: the groups of the ladder fill as
  S-curves in the logarithm of time, m/(1 + (t_k/t)^12) (a logistic in plain
  time leaves a tail that the later, larger groups turn into the whole sum);
  sliders a 2–10, b 1.5–4.
- Module 12, findings the texts state: at T = 0.5 the heavy-tailed network
  has a slightly smaller large outbreak than the random one (0.776 against
  0.796): hubs lower the threshold, not the size; T_c of one heavy-tailed
  network per size does not fall in order (0.026, 0.035, 0.011 for the power
  law at 1,000, 10,000 and 20,000 nodes), the mean of 20 networks does; with
  T = 0.344 preferential attachment has fewer large runs than the random
  network (7 against 13 of 20) although its threshold is lower, because most
  seeds have two links; one lattice run on 100 × 100 has log-log slope 1.99
  to 2.24 (the prompt asked 2.0 ± 0.15: kept for the mean of 20 runs and for
  300 × 300, ±0.25 for one run on 100 × 100).
- Module 12, sources (checked in November 2026, details in
  `docs/reports/network-lab-12.md`): read in the papers or their abstracts —
  Pastor-Satorras and Vespignani (2001), Castellano and Pastor-Satorras
  (2010, abstract: the largest hub, not "a hub and its neighbours"),
  Lloyd-Smith et al. (2005), Barthélemy et al. (2004, the formula of τ),
  Viboud et al. (2016), Newman's chapter 16, the two Zenodo preprints
  (including the four sub-period exponents in section S2 of the supplement).
  Colgate et al. (1989) could not be opened: the sentence rests on its title
  and on the account of it in the Institute's preprint, and says "proposed a
  model". No chapter number is given for Latora, Nicosia and Russo.
- Module 12, Italian terms: focolaio (outbreak; grande focolaio), epidemia,
  soglia, trasmissibilità, superdiffusore, dimensione finale, prevalenza,
  immunizzazione, immunizzazione dei conoscenti (label "Conoscenti"), seme,
  onda di saturazione, crescita più lenta dell'esponenziale (sub-esponenziale),
  scala di gruppi, semilogaritmico.
- Module 12 texts and lecture quote numbers produced with fixed seeds, pinned
  by the "quoted on the page" checks in `scripts/lab/check-network-12.mjs`
  (about a minute and a half; run it whole, since "page" uses the numbers of
  the other sections) and by
  `scripts/lab/browser-checks/modules/network-epidemics-on-networks.mjs`.
  The page formats with `toLocaleString` (12.95 shows as 13.0): the checks
  format the same way.
- Module 12, review by Adriano (prompt 13): no fixes needed. The mean degree
  4.35 of the power-law network, the lattice limit and the height of F1 stay
  as they are, and the sentence on Colgate et al. (1989) is right: Adriano
  read the abstract (cumulative cases grew as the cube of time, not
  exponentially, in a risk-behaviour model with biased mixing that gives a
  saturation wave from high- to low-risk groups). That check is done.
- Module 13, things a later module may reuse, all in
  `social-contagion-network-effects/`: `contagion.js` (information cascades
  as sequences and as batches; Granovetter's outcome three ways, the normal
  distribution function, the smooth fixed point and the standard deviation at
  which it jumps; the market p = z(1 − z) and its path; the Bass closed form,
  peak and a Runge–Kutta check; `cascade`, a threshold cascade with a counter
  per node and a queue that also gives the synchronous step of every adoption,
  with `needByShare` and `needByCount`; a brute-force version; the density
  of a cluster; Watts's cascade condition and window), `experiments.js`,
  `figures.js`. It imports module 08's `mixing.js` (`makeSource`,
  `degreesOf`), module 09's `community.js` (`twoGroupSBM`), module 11's
  `robust.js` (`seedOf`, `moments`, `drain`) and `wattsStrogatz` from the
  shared `graphUtils.js` (the Complexity Lab's small-world generator, not
  moved) without changing them; Vite now puts `community.js` in a small chunk
  of its own, loaded only when unlocked. No shared code changed, so no
  regression compare was run. Module 12's `spread` takes one seed and module
  05's generating functions were not needed (the cascade condition is a short
  sum): the self-check uses `spread` with β = 1 to confirm the cascade code.
- Module 13, a quirk of Node 24.22 met while writing the self-check: once
  `cascadeStats` had been optimised, an object it had returned earlier had
  its two decimal fields overwritten by the next call (the whole-number
  fields were not). The function now returns whole numbers only
  (`majority2`), with `wrongShareOf` and `majorityOf` for the shares, and a
  check pins that an earlier batch is unchanged. Not seen anywhere else; worth
  remembering if a quoted number ever changes for no reason.
- Module 13, choices to review: F2 comes first in the lecture (section 2) and
  F1 second; in F2 an even split of the thirty signals counts as half; the
  slider of the standard deviation moves in steps of 0.1 and the sweep in
  steps of 1; the crowd on show is not one of the 200 of the histogram; a
  threshold is a real number and a person joins when the count reaches it;
  Panel B's mean degree moves in steps of 0.05 (so that exercise 6 can ask
  for 5.8 and 6.2) and its sweep in steps of 0.25; under preferential
  attachment the mean degree is the nearest even number and the sweep has
  z = 2, 4, 6, 8; the panel at one z and the long-ties and cluster sweeps run
  when the page loads (1.6 s to 3.1 s in headless Chrome for the whole page),
  the two heavier sweeps on buttons; long ties use the points p = 0, 0.001,
  0.003, 0.01, 0.03, 0.1, 0.2, 0.3, 0.5, 1 and one random start node per
  network; the cluster panel has q from 0.1 to 0.6 in steps of 0.05 and counts
  a network as "fallen" when more than half of the second group adopts. F1 is
  376 px tall at 1280 px and 499 px at 375 px.
- Module 13, findings the texts state: both of Adriano's unexpected findings
  hold. At p = 0.01 simple contagion is 29 times faster and complex contagion
  saves 8% of its steps (1.11 to 1.32 times faster over eleven sets of 20
  networks); at p = 0.5 complex contagion almost never spreads (4 networks of
  220), at p = 1 never. With q = 0.5 the second group falls in 15 networks of
  20 at k_out = 4, where the average outside share is 0.286; the nodes that
  let the cascade in have 6.81 outside links against 4.01 on average. A
  hundred people blur Granovetter's jump: the share of crowds ending above 50
  climbs from 0.04 to 0.85 between standard deviations 11 and 15.
- Module 13, sources (checked in November 2026, details in
  `docs/reports/network-lab-13.md`): read in the papers — Salganik et al.
  (2006), Granovetter (1978, both examples), Easley and Kleinberg ch. 19 (the
  cluster claim, "density greater than 1 − q"), Morris (2000, who states it as
  p-cohesive groups: the lecture attributes the form to Easley and Kleinberg),
  Watts (2002), Watts and Dodds (2007), Centola (2010), Centola and Macy
  (2007, manuscript), Ugander et al. (2012, abstract), Peterson (2018),
  Wheatley et al. (2019, β = 1.69), the Zenodo supplement (section S2: 1.59,
  2.64, 3.28, 6.83), Barabási ch. 10. Only through secondary sources: the
  averages p = 0.03 and q = 0.38 of Sultan et al. (1990) (the lecture says
  "is usually quoted for") and what Alabi (2017) fitted (the box says only
  "Metcalfe-type laws"). Newman's chapter 16 has sections on complex
  contagion (publisher's chapter page; the text was not read).
- Module 13, Italian terms: cascata informativa (information cascade), effetto
  gregge (herding), soglia, punto di svolta (tipping point), massa critica,
  effetto di rete, lock-in (kept), cascata globale, nodo vulnerabile, finestra
  delle cascate, contagio complesso / semplice, legame lungo, gli influenti
  (influentials), bene di rete, gruppo coeso / gruppo (cluster), ricablatura.
- Module 13 texts and lecture quote numbers produced with fixed seeds, pinned
  by the "quoted on the page" checks in `scripts/lab/check-network-13.mjs`
  (about a minute; run it whole, since "page" uses the numbers of the other
  sections) and by
  `scripts/lab/browser-checks/modules/network-social-contagion-network-effects.mjs`.
  The page formats with `toLocaleString` (0.365 shows as 0.37, 0.355 as
  0.36): the texts follow the page.
- Module 14, data: `src/data/lab/networks/airports-2014.json` (419 kB) is
  built from the OpenFlights files airports.dat and routes.dat (Open Database
  License 1.0, checked on openflights.org/data and in the LICENSE file beside
  the data; hashes as in prompt 14) by `node scripts/lab/build-network-14.mjs`,
  which keeps the raw files in the git-ignored
  `scripts/lab/network-14-cache.local/` and also writes
  `src/data/lab/precomputed/network-14-airports.json` (129 kB). Notice in
  `airports-2014.NOTICE.txt`, entry in `networks.meta.json`, credit line under
  Figure F1. The data are not corrected (airport id 5613, code KSLI, is wrong
  on purpose). `check-network-14.mjs` repeats the build from the cache when
  the raw files are there, and always recomputes the precomputed file.
- Module 14, code, all in `capstone-a-real-network/`: `capstone.js` (the six
  cards as jobs, the stress tests, the spread, the closures, great-circle
  distances; imports of modules 02, 03, 05, 08, 09, 10, 11, 12 and 13, none of
  them changed, so no regression compare was run), `loader.js` (edge lists
  and the JSON of `lncli describegraph`), `precompute.js`, `store.js` (the
  networks and the choice shared by the three panels), `MapCanvas.jsx`,
  `NetworkPicker.jsx`, `useBetweenness.js`. Module 01's `netstats.js` is
  written for networks of up to 60 nodes with their own format and was not
  used: components and distances come from `graphUtils.js`, which module 01
  itself uses. Vite now puts `centrality.js`, `fit.js`, `weights.js`,
  `epidemic.js` and `contagion.js` in small chunks of their own, loaded only
  when unlocked. The module's chunk is 651 kB (220 kB gzipped), of which
  548 kB are the two JSON files.
- Module 14, choices to review: the title already in `network-modules.json`
  was kept ("Capstone: a real network from start to finish" / "Capstone: una
  rete reale dall'inizio alla fine"); the data file also holds each airport's
  name and OpenFlights id (the tap in F1 shows the name), which brings it to
  419 kB; a tap on the map takes the largest airport within 7 px, otherwise the
  nearest within 18 px, and a box finds an airport by code or city; F2 labels
  the airports among the 60 of highest betweenness with fewer than 40 routes
  (Anchorage, Papeete, Port Moresby, Bethel and Winnipeg); F1 is coloured by
  the best of ten runs of Louvain, while card 5 runs Louvain itself (run 1,
  2, …); cards 5 and 6 and the cascades are computed when the page loads
  (1.8 s to the last panel in headless Chrome), cards 1 to 4 show the
  precomputed values with "Compute again" (3.8 s for centrality, 11 s for the
  ten rewirings); above 5,000 nodes the cascades start from the 300 sampled
  nodes; a network without coordinates is drawn up to 1,500 nodes; the
  figures are 472 and 395 px tall at 1280 px.
- Module 14, findings the texts state: Louvain makes Alaska one group of 131
  airports in nine runs of ten, and in the first run splits it and puts
  Anchorage with Atlanta; betweenness is the most damaging order of removal up
  to 5% and plain degree from 10%; z of r against the rewirings is 18.7 here
  and 10.7 to 29.8 over ten other seeds, so the lecture says "more than ten";
  the rich-club ratio is 1.20 above 100 routes and 1.35 among the eight
  largest airports with the page's seed, 1.18 to 1.20 and 1.24 to 1.34 over ten
  other seeds, so the lecture says "about 1.2" and "about 1.3".
- Module 14, sources (checked in November 2026, details in
  `docs/reports/network-lab-14.md`): the licence on openflights.org; Guimerà
  et al. (2005: truncated power law, a network of cities, Anchorage named);
  Barrat et al. (2004: seats, β = 1.5 ± 0.1); Colizza et al. (2006: a "mild"
  rich club); Peel et al. (2017); LND's ChannelGraph fields. Brockmann and
  Helbing (2013) only through the abstract: the lecture gives no formula.
- Module 14, Italian terms: banco di lavoro (workbench), prova di carico
  (stress test), dati grezzi (raw data), istantanea (snapshot), scheda (card,
  and the record of an airport), ammasso (cluster of percolation), porta
  d'accesso (gateway); "Capstone" stays in the title.
- Module 14 texts and lecture quote numbers produced with fixed seeds, pinned
  by the "quoted on the page" checks in `scripts/lab/check-network-14.mjs`
  (about a minute and a half; run it whole, since "page" uses the numbers of
  the other sections) and by
  `scripts/lab/browser-checks/modules/network-capstone-a-real-network.mjs`.
