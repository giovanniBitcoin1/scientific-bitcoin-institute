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

## Modules

| No. | Slug | Status | Commit | Panels | Live figures |
|---|---|---|---|---|---|
| 01 | `reading-a-network` | done | 9267674 | A The bridges of Königsberg; B Network microscope; C One system, two projections | `three-ways`, `sparse` |
| 02 | `what-are-we-measuring` | done | the commit "Network Lab 02: What are we measuring?" | A The observer; B Compared to what?; C Your friends have more friends | `threshold`, `thinning` |
| 03 | `centrality` | next | – | – | – |
| 04 | `triangles-weak-ties-motifs` | planned | – | – | – |
| 05 | `heavy-tails-done-right` | planned | – | – | – |
| 06 | `growth-mechanisms` | planned | – | – | – |
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
page).

## Planned content (may change)

- **01 Reading a network:** done.
- **02 What are we measuring?:** done.
- **03 Centrality:** degree, closeness, betweenness, eigenvector, Katz,
  PageRank, hubs and authorities. Rankings compared on the Florentine
  families; random surfer.
- **04 Triangles, weak ties and motifs:** triadic closure, strength of weak
  ties, motifs against a null model.
- **05 Heavy tails, done right:** natural cutoff, ultra-small worlds,
  generating functions, honest power-law testing.
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

Nothing in progress. Next: module 03, `centrality`.

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

- Lectures of modules 01 and 02 carry the DRAFT marker: to be reviewed by
  Adriano.
- Module 02, things a later module may reuse: `charts.jsx` (SVG line chart
  with linear or log axes) and `NetCanvas.jsx` (static network drawing) live
  in the module 02 folder; move them to `src/components/lab/network/` when a
  second module needs them (a shared file ends up in a shared chunk).
  `nullmodels.js` has the degree-preserving swap that module 04 needs for
  motifs, and `friends.js` an SI spread that module 12 can start from.
- Module 02 texts quote numbers produced with fixed seeds. They are pinned
  by the "quoted on the page" checks in `scripts/lab/check-network-02.mjs`:
  if a preset or a seed changes, those checks fail and `texts.js` must be
  updated.
- Module 02, choices to review: Panel A draws a 150-node network of the same
  kind and computes on the full 600-node one; the Italian lecture is about
  1,730 words counting markup (the target was 1,400–1,700).
