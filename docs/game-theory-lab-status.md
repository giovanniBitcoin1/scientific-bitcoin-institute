# Game Theory Lab — status

The one file a new session needs to pick up the Game Theory Lab
(`/game-theory-lab`) with no memory of the previous ones. Keep it current:
update it at every checkpoint and in every module commit. How the labs engine
works is in `CLAUDE.md` ("Labs engine and Network Lab"); this file says where
the work is. The Network Lab's own file, `docs/network-lab-status.md`, is the
model for this one and holds the history of the engine.

## Working rules

- **Branch:** `game-theory-lab`, created from `main` (commit ddfed85) on 25
  November 2026. If you are on another branch, or the working tree is not
  clean when a session starts, stop and ask.
- **No push**, of any kind, to any branch. Commit locally only.
- **One commit per module**, named `Game Theory Lab NN: <title>`. While a
  module is being built, commit a checkpoint after each step with a message
  starting `WIP Game Theory Lab NN:` and update "Work in progress" below; when
  the module is complete, squash the WIP commits into the one module commit
  (`git reset --soft <commit before the first WIP>` then one commit). The
  status file is updated in the same commit.
- **Do not touch:** git config; `npm audit fix`; the site's `package.json`
  (no new dependency); the admin passphrase (never print or write it);
  `adminHash` and `locked` in `src/data/lab/config.json`; `public/accademia`;
  the lecture texts and module code of the Complexity Lab and of the Network
  Lab; the site nav (`Header.jsx`, `nav.json`): a lab appears in the "Labs"
  dropdown and on the hub by itself, from the registry.
- **Originality:** everything is written from scratch: text, figures, tables,
  exercises. Nothing copied or closely paraphrased from any textbook. No book
  PDFs or third-party course material in the repo.
- **The template** for structure, tone, panel style, exercises and
  self-checks is the Network Lab's module 01:
  `src/components/lab/network/reading-a-network/`,
  `src/content/network-lab/reading-a-network.*.md`,
  `scripts/lab/check-network-01.mjs`. From module 02 on, this lab's own
  module 01 (`src/components/lab/game-theory/what-is-a-game/`) is the nearer
  example.
- **Lecture conventions:** EN and IT, about 1,400–1,700 words each, first line
  `<!-- DRAFT: to be reviewed by Adriano -->`, display equations in
  ```` ```math ````, live figures in ```` ```figure ````, optional boxes in
  ```` ```box ````, `<!-- simulation -->` before "Further reading". Never call
  the course free. Italian terms as listed below.
- **Every number quoted in the texts is pinned by the self-check** ("quoted on
  the page" checks in `scripts/lab/check-game-theory-NN.mjs`).
- **Bitcoin rule:** this is a general course on game theory and incentives.
  Short optional Bitcoin boxes only in modules 02, 04, 06, 09, 10, 11 and 12
  (05 to be decided). Modules 13 and 14 are entirely about Bitcoin. A thesis
  about Bitcoin is always presented as a hypothesis with its limits, never as
  advertising.
- **Do not repeat the Complexity Lab's module 11**
  (`src/content/lab/cooperation.en.md`): the story of the Prisoner's Dilemma,
  Axelrod's tournaments, Tit for Tat and Pavlov, the spatial game of Nowak and
  May, the five routes to cooperation, the commons and the volunteer's dilemma
  are there. Link to it (`/lab/cooperation`) and go further.
- **A check that fails is information.** Never choose a seed or a preset in
  order to make a check pass. If a limit given in a prompt turns out to be
  too tight, first make sure that the code is right; then set the limit from
  what ten or more seeds show, and say so in the report, with the numbers.
- **This PC has little free memory.** Builds and checks run in the
  foreground, one at a time, as separate commands; no background shells. An
  old `vite preview` server that locks files may be stopped.

### Checks to run before a module commit

```
npx vite build
node scripts/lab/check-game-theory-01.mjs      # and check-game-theory-02.mjs, …
cd scripts/lab/browser-checks                  # see its README; npm install once
node check-index.mjs game-theory
node check-index.mjs network
node check-index.mjs complexity
node check-links.mjs
node check-module.mjs game-theory <slug>       # every ready module
node modules/game-theory-<slug>.mjs            # where one exists
node build-main.mjs && node compare-main.mjs   # when shared lab code changed
cd ../../..
npm run build
npm run check:dist
```

All of them must report 0 failures. Add the new module's expected counts to
`scripts/lab/browser-checks/expect.json`. The `check-network-NN.mjs` scripts
are rerun only when a file they use has changed. When shared code changes
(`LabMarkdown.jsx`, `LabLecture.jsx`, shared hooks or components,
`network/ui.jsx`, `network/charts.jsx`), run every Network Lab check that
uses it and the regression compare.

## How to resume

1. `git status` and `git log --oneline -8` on `game-theory-lab`. The tree must
   be clean.
2. Read "Work in progress" below. If it names a module, the last
   `WIP Game Theory Lab NN:` commit is the state it describes: continue from
   the first item under "Remains".
3. If nothing is in progress, the next module is the first one in the table
   whose status is not `done`. Each module gets its own prompt
   (`prompts.local/game-theory-lab-NN.md`); read it, its line in "Planned
   content", then the module 01 folder, then build in this order, committing a
   WIP checkpoint after each step: pure logic (`.js`) and
   `scripts/lab/check-game-theory-NN.mjs` → live figures → panels → lecture EN
   → lecture IT → `texts.js` (what to observe, written from the numbers
   actually obtained; exercises, every answer recomputed) → `index.js`,
   `status: "ready"` in `game-theory-modules.json`, `expect.json` → checks →
   squash.
4. Save every final report, in full, to `docs/reports/game-theory-lab-NN.md`
   (NN = the prompt's number) and commit it locally on its own, as
   "Game Theory Lab NN: report".
5. End each session with a report: what differs from the spec, exercise
   answers that differ, self-check numbers, the numbers behind each "What to
   observe", references that could not be confirmed, check results, commit
   hashes.
6. The prompts are in `prompts.local/` (git-ignored by the rule `*.local`:
   never commit it, never edit it).

## Where things are

- Lab id `game-theory`; base path `/game-theory-lab` (provisional,
  `src/data/lab/paths.js`); registry entry in `src/data/lab/registry.js`,
  after the Network Lab.
- Module list: `src/data/lab/game-theory-modules.json`.
- Module folders: `src/components/lab/game-theory/<slug>/`, `index.js`
  default-exports the content object; one chunk per module, through the glob
  in `src/pages/lab/loaders.js`.
- Shared by the modules of this lab: `src/components/lab/game-theory/` (files
  next to the module folders).
- Lectures: `src/content/game-theory-lab/<slug>.en.md` and `.it.md`.
- Self-checks: `scripts/lab/check-game-theory-NN.mjs`.
- Browser checks: `scripts/lab/browser-checks/` (`LAB_FILES` in `lib.mjs`
  lists the lab; `expect.json`; `modules/game-theory-<slug>.mjs`).
- Reports: `docs/reports/game-theory-lab-NN.md`.

## Modules

| No. | Part | Slug | Status | Commit | Panels | Live figures |
|---|---|---|---|---|---|---|
| 01 | I | `what-is-a-game` | planned | | | |
| 02 | I | `nash-equilibrium` | planned | | | |
| 03 | I | `mixed-strategies-zero-sum` | planned | | | |
| 04 | I | `sequential-games-commitment` | planned | | | |
| 05 | II | `incomplete-information-signalling` | planned | | | |
| 06 | II | `repeated-games-reputation` | planned | | | |
| 07 | II | `evolution-and-learning` | planned | | | |
| 08 | III | `congestion-price-of-anarchy` | planned | | | |
| 09 | III | `games-on-networks` | planned | | | |
| 10 | III | `coalitions-sharing` | planned | | | |
| 11 | IV | `auctions` | planned | | | |
| 12 | IV | `mechanism-design` | planned | | | |
| 13 | IV | `mining-as-a-game` | planned | | | |
| 14 | IV | `capstone-the-price-of-security` | planned | | | |

Parts: I Reasoning / Ragionare; II Learning / Imparare; III Living together /
Convivere; IV Designing / Progettare.

Other commits: "Game Theory Lab: skeleton" (prompt 1, stage 1: registry entry,
path, module list, loader, browser checks, this file, the subsection in
`CLAUDE.md`).

## Planned content (may change; each module gets its own prompt)

- **01 What is a game?:** players, strategies, payoffs; strict dominance,
  iterated elimination and common knowledge of rationality; the guessing game
  and levels of reasoning; best responses and the stable cell; the map of the
  symmetric two-by-two games. No Bitcoin box.
- **02 Nash equilibrium:** definition and meaning; multiple equilibria, focal
  points, risk versus payoff dominance; continuous strategies (Cournot,
  Bertrand, contests). Bitcoin box: mining as a contest.
- **03 Mixed strategies and zero-sum games:** indifference, maxmin and the
  minimax theorem, existence, penalty kicks, rock-paper-scissors, fictitious
  play.
- **04 Games in time:** extensive form, backward induction, subgame
  perfection, threats that are not credible, Stackelberg, commitment,
  bargaining from the ultimatum game to alternating offers. Bitcoin box:
  punitive forking versus feather forking.
- **05 Incomplete information:** Bayesian games, adverse selection, costly
  signals, separating and pooling, cheap talk. (Bitcoin box to be decided.)
- **06 Repeated games:** discounting, trigger strategies, the patience
  threshold, one-stage deviations, the folk theorem, finite horizons, tacit
  collusion, reputation. Bitcoin box: the miner's dilemma.
- **07 Evolution and learning:** ESS, the replicator equation, finite
  populations (Moran process, fixation, the one-third rule); learning without
  regret and correlated equilibrium.
- **08 Congestion:** Pigou, Braess, equilibrium flows, potential games and
  best-response dynamics, the price of anarchy, the price of stability, tolls.
- **09 Games on networks:** strategic complements and substitutes, local
  public goods, the key player, strategic network formation. Bitcoin box: the
  Lightning Network.
- **10 Coalitions:** cooperative games, the core, the Shapley value, weighted
  voting and power indices. Bitcoin box: mining pools.
- **11 Auctions:** English, Dutch, first and second price, bid shading,
  revenue equivalence, common values and the winner's curse, reserve prices,
  multi-unit auctions. Bitcoin box: the fee market.
- **12 Designing the rules:** the revelation principle, incentive
  compatibility, VCG, Myerson's lemma, the limits (budget balance, false
  names). Bitcoin box: incentives to propagate transactions.
- **13 Mining as a game:** a miner's four decisions, whether following the
  protocol is an equilibrium, selfish mining as a Markov chain, the optimal
  strategy, the difficulty adjustment.
- **14 Capstone:** who would attack and why, Budish's three equations, the
  fee-only regime, the objections; the reader redoes the sums.

## Decisions

- The path `/game-theory-lab` is provisional (`src/data/lab/paths.js`).
- The lab id has a hyphen, so it is a quoted key (`LAB_PATHS['game-theory']`,
  `loaders['game-theory']`) and the command-line argument of the browser
  checks is `game-theory`.
- The hub page `/labs` was left as it is: its grid has two columns, so the
  three cards sit two and one.

## Italian terms

Decided with module 01 (see "Work in progress" until then).

## Work in progress

Stage 1 of prompt 1 (the skeleton) is done. Module 01 has not been started.

## Next

Module 01, `what-is-a-game` (prompt 1, stage 2).

## Open items

None yet.
