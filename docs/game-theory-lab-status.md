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
- **Lecture conventions:** EN and IT, about 1,400–1,700 words each; a new
  lecture starts with the first line `<!-- DRAFT: to be reviewed by Adriano -->`
  until it is reviewed, and the marker comes off in a commit of its own;
  display equations in
  ```` ```math ````, live figures in ```` ```figure ````, optional boxes in
  ```` ```box ````, `<!-- simulation -->` before "Further reading". Never call
  the course free. Italian terms as listed below.
- **Every number quoted in the texts is pinned by the self-check** ("quoted on
  the page" checks in `scripts/lab/check-game-theory-NN.mjs`).
- **Bitcoin rule:** this is a general course on game theory and incentives.
  Short optional Bitcoin boxes only in modules 02, 04, 06, 09, 10, 11 and 12
  (none in 05, decided in prompt 5). Modules 13 and 14 are entirely about Bitcoin. A thesis
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
- **The status file says only what is true now.** Write "done" for a step
  after its commit exists, and "prompt finished" only after the report is
  committed (added in prompt 3: prompt 2 stopped half-way with this file
  saying "finished").
- **Keep a working log**, `docs/reports/game-theory-lab-NN-log.md`, from the
  first step of every prompt: one line per check run to its end (command,
  result) and one line per source looked up (what, where, what it says).
  Commit it with the WIP commits and leave it in the repo next to the
  report. A session that picks up a prompt reads the log first.
- **Italian terms:** the Italian texts use the terms of Italian
  textbooks and university courses of game theory and economics, not
  literal translations of the English. Where Italian courses keep the
  English word (payoff, leader, follower, incumbent, pooling, single
  crossing, cheap talk, fictitious play, folk theorem, trigger...),
  keep it, in italics at its first use in each lecture. A plain
  gloss may follow it once, in parentheses, but never replaces it.
  When unsure, look the term up in Italian sources (lecture notes on
  university sites, Italian editions of textbooks, Treccani) and
  write the source in the working log. Decided by Adriano in prompt 6.
- **This PC has little free memory.** Builds and checks run in the
  foreground, one at a time, as separate commands; no background shells. An
  old `vite preview` server that locks files may be stopped.
- **Long checks:** a check that may pass the tool's time limit is run with a
  longer timeout (up to 600 s), never moved to the background; if even that
  is not enough, stop and say so. Added in prompt 10 (check-game-theory-03
  took 437 s in prompt 9; now about 80 s). Browser checks run one module per
  command: `check-module.mjs` and the functional check of one module, then
  the next module; never in a loop over modules. The same for any batch that
  could pass the tool's limit. Added in prompt 12 (prompt 11 ran the 22
  browser checks in one loop).

### Checks to run before a module commit

```
npx vite build
node scripts/lab/check-game-theory-01.mjs
node scripts/lab/check-game-theory-02.mjs      # one per module
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

- Lab id `game-theory`; base path `/game-theory-lab` (confirmed,
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
| 01 | I | `what-is-a-game` | done | the commit "Game Theory Lab 01: What is a game?" | A Game explorer; B Guess two thirds of the average; C How far does dominance go? | `eliminate`, `atlas` |
| 02 | I | `nash-equilibrium` | done | the commit "Game Theory Lab 02: Nash equilibrium" | A Find the equilibria; B Which convention?; C A contest for a prize | `staghunt`, `cournot` |
| 03 | I | `mixed-strategies-zero-sum` | done | the commit "Game Theory Lab 03: Mixed strategies and zero-sum games" | A All the equilibria; B Learning to mix; C Can you be read? | `square`, `minimax` |
| 04 | I | `sequential-games-commitment` | done | the commit "Game Theory Lab 04: Games in time and credible commitment" | A Solve the tree; B Leader and follower; C Dividing a pie | `entry`, `pie` |
| 05 | II | `incomplete-information-signalling` | done | the commit "Game Theory Lab 05: Incomplete information and signals" | A The market that empties; B Separate or pool?; C Words that cost nothing | `types`, `doubt` |
| 06 | II | `repeated-games-reputation` | done | the commit "Game Theory Lab 06: Repeated games and reputation" | A Can the cartel hold?; B Price wars without cheating; C A reputation for toughness | `patience`, `folk` |
| 07 | II | `evolution-and-learning` | done | the commit "Game Theory Lab 07: Evolution and learning" | A Rock-paper-scissors in a population; B One mutant; C Learning by regret | `fates`, `traffic` |
| 08 | III | `congestion-price-of-anarchy` | done | the commit "Game Theory Lab 08: Congestion and the price of anarchy" | A How bad can it get?; B Drivers who count; C Sharing the cost of a road | `tworoads`, `braess` |
| 09 | III | `games-on-networks` | done | the commit "Game Theory Lab 09: Games on networks" | A Who does the work?; B The key player; C Building the network | `star`, `formation` |
| 10 | III | `coalitions-sharing` | done | the commit "Game Theory Lab 10: Coalitions and sharing" | A Who gets what?; B Who decides?; C An estate that cannot pay | `core`, `votes` |
| 11 | IV | `auctions` | done | the commit "Game Theory Lab 11: Auctions" | A Same revenue, different risk; B The winner's curse; C A block for sale | `truth`, `shading` |
| 12 | IV | `mechanism-design` | done | the commit "Game Theory Lab 12: Designing the rules" | A Lying does not pay; B Pay for the harm you do; C Who runs the auction? | `area`, `trade` |
| 13 | IV | `mining-as-a-game` | done | the commit "Game Theory Lab 13: Mining as a game" | A Race the network; B The difficulty catches up; C The best deviation | `chain`, `threshold` |
| 14 | IV | `capstone-the-price-of-security` | done | the commit "Game Theory Lab 14: The price of security" | A The cost of an attack; B When only fees pay; C Your own estimate | `flow`, `clock` |

Parts: I Reasoning / Ragionare; II Learning / Imparare; III Living together /
Convivere; IV Designing / Progettare.

Other commits: 479e821, "Game Theory Lab: skeleton" (prompt 1, stage 1: registry entry,
path, module list, loader, browser checks, this file, the subsection in
`CLAUDE.md`). From prompt 2, stage 0: "Game Theory Lab 01: fixes" (the noise
of "Play again" in module 01) and "Labs: open lab pages at the top" (shared
lab pages).

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
  names). Bitcoin box "Who runs the auction?": incentives to pass transactions on, the miner as auctioneer (fake bids), the three properties of a fee rule.
- **13 Mining as a game:** a miner's four decisions, whether following the
  protocol is an equilibrium, selfish mining as a Markov chain, the optimal
  strategy, the difficulty adjustment.
- **14 Capstone:** who would attack and why, Budish's three equations, the
  fee-only regime, the objections; the reader redoes the sums.

## Decisions

- The path `/game-theory-lab` is a decision, confirmed by Adriano on 26
  November 2026 (`src/data/lab/paths.js`, one line).
- The lab id has a hyphen, so it is a quoted key (`LAB_PATHS['game-theory']`,
  `loaders['game-theory']`) and the command-line argument of the browser
  checks is `game-theory`.
- The hub page `/labs` was left as it is: its grid has two columns, so the
  three cards sit two and one.

## Italian terms

Revised in prompt 6 to the textbook terms. English words kept in Italian
are in italics at their first use in each lecture (working rule above).
Sources of the revised terms: the log `docs/reports/game-theory-lab-06-log.md`.

| English | Italian | Module |
|---|---|---|
| game | gioco | 01 |
| player | giocatore (giocatore di riga, giocatore di colonna) | 01 |
| strategy | strategia | 01 |
| payoff | *payoff* (kept; plural "i payoff") | 01 |
| normal form | forma normale | 01 |
| strictly dominated | strettamente dominata | 01 |
| weak dominance | dominanza debole | 01 |
| dominant strategy | strategia dominante | 01 |
| iterated elimination | eliminazione iterata | 01 |
| best response | miglior risposta (le migliori risposte) | 01 |
| common knowledge (of rationality) | conoscenza comune (della razionalità) | 01 |
| level of reasoning | livello di ragionamento (livello 0, livello 1…) | 01 |
| stable cell | cella stabile | 01 |
| Prisoner's Dilemma | dilemma del prigioniero | 01 |
| stag hunt | caccia al cervo | 01 |
| chicken | gioco del pollo | 01 |
| snowdrift | cumulo di neve (*snowdrift*) | 01 |
| hawk–dove | falco–colomba | 01 |
| harmony | armonia | 01 |
| battle of the sexes | battaglia dei sessi | 01 |
| matching pennies | pari o dispari (the finger game: one or two fingers, even or odd sum; the payoffs of the two coins) | 01 |
| pure coordination | coordinamento puro | 01 |
| zero-sum | a somma zero | 01 |
| temptation, sucker's payoff | tentazione, payoff del babbeo | 01 |
| to cooperate, to defect | cooperare, defezionare | 01 |
| target (of the guessing game) | bersaglio | 01 |
| round | turno | 01 |
| beauty contest | concorso di bellezza (*beauty contest*) | 01 |
| Nash equilibrium | equilibrio di Nash | 01 |
| focal point | punto focale | 02 |
| convention | convenzione | 02 |
| coordination game | gioco di coordinamento | 02 |
| payoff dominant | Pareto-dominante | 02 |
| risk dominant | rischio-dominante | 02 |
| tipping point | *tipping point* (kept) | 02 |
| best-response function, curve (line) (Cournot) | funzione di reazione; curva (retta) di reazione | 02 |
| quantity competition | concorrenza sulle quantità | 02 |
| price competition | concorrenza sui prezzi | 02 |
| cartel | cartello | 02 |
| contest | gara | 02 |
| prize | premio | 02 |
| effort | sforzo | 02 |
| share (of the chances, of the hash rate) | quota | 02 |
| hash rate | *hash rate* (kept; masculine, "l'hash rate") | 02 |
| block reward | ricompensa del blocco | 02 |
| miner, mining, pool | *miner*, *mining*, *pool* (kept) | 02 |
| difficulty adjustment | aggiustamento della difficoltà | 02 |
| free entry | libera entrata | 02 |
| walk (of best responses), cycle | cammino, ciclo | 02 |
| sweep, run, sample | passata, prova, campione | 02 |
| to settle, to swing | assestarsi, oscillare | 02 |
| mixed strategy | strategia mista | 03 |
| pure strategy | strategia pura | 03 |
| mix (noun) | strategia mista; for the weights, "le probabilità della strategia mista" | 03 |
| expected payoff | payoff atteso | 03 |
| indifference | indifferenza | 03 |
| zero-sum game | gioco a somma zero | 03 |
| constant-sum game | gioco a somma costante | 03 |
| value of the game | valore del gioco | 03 |
| best worst case (maxmin) | strategia di maxmin; payoff di sicurezza | 03 |
| minimax theorem | teorema del minimax | 03 |
| support | supporto | 03 |
| fictitious play | *fictitious play* (kept) | 03 |
| run (rounds in the same cell) | sequenza | 03 |
| fixed-point theorem | teorema di punto fisso | 03 |
| penalty kick | calcio di rigore | 03 |
| kicker | rigorista | 03 |
| keeper | portiere | 03 |
| natural side | lato naturale | 03 |
| L, R (sides) | S, D | 03 |
| heads, tails (matching pennies) | un dito, due dita (the English keeps the coins) | 03 |
| rock-paper-scissors | sasso-carta-forbici ("la morra cinese" at its first use) | 03 |
| win rate (of the machine) | quota di vittorie | 03 |
| spread (standard deviation) | dispersione (deviazione standard) | 03 |
| game tree | albero (del gioco) | 04 |
| node | nodo | 04 |
| move | mossa | 04 |
| plan (strategy as a complete plan) | piano (at its first use: what the textbooks call a strategy of the extensive form) | 04 |
| backward induction | induzione a ritroso | 04 |
| subgame | sottogioco | 04 |
| subgame perfect equilibrium | equilibrio perfetto nei sottogiochi | 04 |
| empty threat | minaccia non credibile | 04 |
| credible | credibile | 04 |
| commitment, to commit | impegno, impegnarsi | 04 |
| leader, follower | *leader*, *follower* (l'impresa leader, l'impresa follower) | 04 |
| first-mover advantage | vantaggio della prima mossa | 04 |
| entry game; entry deterrence | gioco dell'entrata; deterrenza all'entrata | 04 |
| incumbent | *incumbent* (l'incumbent, masculine; l'impresa incumbent) | 04 |
| newcomer | entrante (entrante potenziale) | 04 |
| fixed cost | costo fisso | 04 |
| limit quantity | quantità limite | 04 |
| ultimatum game | gioco dell'ultimatum | 04 |
| centipede game | gioco del millepiedi | 04 |
| proposer, responder | proponente, rispondente | 04 |
| offer | offerta | 04 |
| threshold | soglia | 04 |
| discount factor | fattore di sconto | 04 |
| patience | pazienza | 04 |
| bargaining power | potere contrattuale | 04 |
| punitive forking | *punitive forking* (kept) | 04 |
| feather forking | *feather fork* (kept) | 04 |
| orphaned block, to orphan | blocco orfano, rendere orfano | 04 |
| confirmation | conferma | 04 |
| type | tipo | 05 |
| chance move (Nature) | mossa del caso (la Natura) | 05 |
| common prior | distribuzione a priori comune | 05 |
| belief | credenza | 05 |
| Bayesian game | gioco bayesiano | 05 |
| Bayesian Nash equilibrium | equilibrio di Nash bayesiano | 05 |
| information set | insieme informativo | 05 |
| asymmetric information | informazione asimmetrica | 05 |
| adverse selection | selezione avversa | 05 |
| lemon | bidone | 05 |
| signal | segnale | 05 |
| signalling game | gioco di segnalazione | 05 |
| separating equilibrium | equilibrio separante | 05 |
| pooling equilibrium | equilibrio *pooling* | 05 |
| off the equilibrium path | fuori dal sentiero di equilibrio | 05 |
| single crossing | condizione di *single crossing* | 05 |
| the Cho–Kreps test | criterio intuitivo (di Cho e Kreps) | 05 |
| handicap principle | principio dell'handicap | 05 |
| cheap talk | *cheap talk* (kept; "parole che non costano nulla") | 05 |
| expert | esperto | 05 |
| decision maker | decisore | 05 |
| bias | distorsione | 05 |
| partition | partizione | 05 |
| delegation | delega | 05 |
| global game | gioco globale | 05 |
| private signal | segnale privato | 05 |
| noise | rumore | 05 |
| tough, weak (incumbent) | duro, debole (un incumbent duro, debole) | 05 |
| no talk | senza parole | 05 |
| repeated game | gioco ripetuto | 06 |
| stage game | gioco costituente | 06 |
| average payoff | payoff medio | 06 |
| grim trigger, trigger strategy | *grim trigger*, strategia *trigger* | 06 |
| patience threshold | soglia di pazienza | 06 |
| one-shot deviation principle | *one-shot deviation principle* (kept: no Italian name found) | 06 |
| folk theorem | *folk theorem* (kept) | 06 |
| feasible, individually rational | ammissibile, individualmente razionale | 06 |
| minmax payoff | payoff di minmax | 06 |
| public lottery | lotteria pubblica | 06 |
| tacit collusion | collusione tacita | 06 |
| price war | guerra dei prezzi | 06 |
| imperfect monitoring | monitoraggio imperfetto | 06 |
| trigger price | *trigger price* (gloss: il prezzo soglia) | 06 |
| false alarm | falso allarme | 06 |
| chain-store paradox | paradosso del *chain store* (gloss: della catena di negozi) | 06 |
| reputation | reputazione | 06 |
| block withholding | *block withholding* (kept); infiltrazione | 06 |
| the miner's dilemma | il dilemma dei miner | 06 |
| to cheat (in a cartel), a cheat | imbrogliare, chi imbroglia | 06 |
| evolutionary game theory | teoria evolutiva dei giochi | 07 |
| evolutionarily stable strategy (ESS) | strategia evolutivamente stabile (una ESS) | 07 |
| replicator equation, replicator dynamics | equazione del replicatore, dinamica del replicatore | 07 |
| rest point | punto di equilibrio (Ghezzo, Padova thesis 2023-24, which also writes "punti fissi"; "punto di riposo" not used) | 07 |
| asymptotically stable | asintoticamente stabile | 07 |
| coexistence, bistability | coesistenza, bistabilità | 07 |
| phase line | retta delle fasi | 07 |
| Moran process | processo di Moran | 07 |
| fixation, fixation probability | fissazione, probabilità di fissazione | 07 |
| neutral drift | deriva neutrale | 07 |
| intensity of selection | intensità della selezione | 07 |
| mutant, resident | mutante, residente | 07 |
| the one-third rule | la regola di un terzo (*one-third rule*) | 07 |
| regret, no-regret | *regret* (gloss: il rimpianto), apprendimento *no-regret* | 07 |
| multiplicative weights (Hedge) | pesi moltiplicativi (*Hedge*) | 07 |
| learning rate | tasso di apprendimento | 07 |
| correlated equilibrium | equilibrio correlato | 07 |
| coarse correlated equilibrium | equilibrio correlato *coarse* | 07 |
| swap regret, regret matching | *swap regret*, *regret matching* (kept) | 07 |
| the traffic light (F2) | il semaforo | 07 |
| swerve, straight (chicken; module 07 said "go" until prompt 8) | sterza, dritto | 07 |
| side-blotched lizard | la lucertola *Uta stansburiana* (no Italian common name found) | 07 |
| price of anarchy | prezzo dell'anarchia | 08 |
| price of stability | prezzo della stabilità | 08 |
| Wardrop equilibrium (Wardrop's principle) | equilibrio di Wardrop ("principio di Wardrop" not found in a source) | 08 |
| Pigou's example | l'esempio di Pigou | 08 |
| Braess's paradox | paradosso di Braess | 08 |
| selfish routing | instradamento egoistico | 08 |
| flow | flusso | 08 |
| marginal cost | costo marginale | 08 |
| toll; Pigouvian tax | pedaggio; imposta pigouviana (it.wikipedia's title; "tassa pigouviana" also found) | 08 |
| externality | esternalità | 08 |
| congestion game | gioco di congestione | 08 |
| potential game | gioco potenziale (giochi potenziali; not "gioco di potenziale") | 08 |
| potential function | funzione potenziale | 08 |
| best-response dynamics | dinamica di miglior risposta (as module 02; not found verbatim) | 08 |
| atomic, nonatomic (game) | (gioco) atomico, non atomico | 08 |
| cost-sharing game | gioco di condivisione dei costi | 08 |
| harmonic number | numero armonico | 08 |
| hub | *hub* (kept, as in the Network Lab; l'hub) | 08 |
| shortcut; upper, lower, zigzag route | scorciatoia; percorso in alto, in basso, a zigzag | 08 |
| driver; planner | automobilista; pianificatore | 08 |
| games on networks; graphical games | giochi su reti; giochi grafici | 09 |
| neighbour | vicino | 09 |
| strategic complements, substitutes | complementi strategici, sostituti strategici | 09 |
| local public good | bene pubblico locale (beni pubblici locali, the public-finance term, "lungo i collegamenti della rete" at first use) | 09 |
| specialized equilibrium | equilibrio specializzato (no Italian source; the calque) | 09 |
| maximal independent set | insieme indipendente massimale (it.wikipedia) | 09 |
| key player | giocatore chiave (*key player* at first use; no Italian source) | 09 |
| intercentrality | intercentralità (no Italian source) | 09 |
| Katz–Bonacich centrality | centralità di Katz–Bonacich (Bordoli, Padova thesis, Dip. Scienze Economiche) | 09 |
| (strategic) network formation | formazione (strategica) delle reti (Padova theses: "formazione di reti") | 09 |
| pairwise stable, pairwise stability | stabile a coppie, stabilità a coppie (*pairwise stability* at first use; no Italian source) | 09 |
| efficient network | rete efficiente (Fagnani, PoliTo) | 09 |
| connections model | modello delle connessioni (*connections model* at first use; no Italian source) | 09 |
| star, complete network, empty network | stella, rete completa, rete vuota | 09 |
| bridge (network); line; ring; grid | rete a ponte ("Ponte" on the pill); linea; anello; griglia | 09 |
| payment channel | canale di pagamento (PoliTo and UniBo theses) | 09 |
| routing fee | commissione di instradamento (Italian Lightning explainers) | 09 |
| betweenness centrality | centralità di intermediazione (*betweenness*) | 09 |
| core–periphery | centro–periferia | 09 |
| run (of best responses, of the dynamics); turn; step | prova; giro; passo | 09 |
| coalitional game | gioco cooperativo (in forma coalizionale at first use) | 10 |
| characteristic function; worth v(S) | funzione caratteristica; valore (della coalizione) | 10 |
| transferable utility (TU game) | utilità trasferibile (gioco TU) | 10 |
| coalition | coalizione | 10 |
| superadditive; convex (game) | (gioco) superadditivo; convesso | 10 |
| core | nucleo (*core* at first use) | 10 |
| Shapley value; marginal contribution | valore di Shapley; contributo marginale | 10 |
| null player | giocatore nullo | 10 |
| balanced (game); balancedness | (gioco) bilanciato; bilanciamento ("collezione bilanciata" in Fragnelli; "famiglia bilanciata" not found) | 10 |
| Bondareva–Shapley theorem | teorema di Bondareva–Shapley | 10 |
| nucleolus | nucleolo | 10 |
| least core | *least core* (kept: no Italian term found; a Pisa thesis, 2024, keeps "Least Core") | 10 |
| weighted voting game; quota | gioco a maggioranza pesata; quota | 10 |
| Shapley–Shubik index, Banzhaf index | indice (di potere) di Shapley–Shubik, indice di Banzhaf | 10 |
| pivot (Shapley–Shubik); decisive (Banzhaf) | pivotale (il *pivot*); cruciale (Bernardi, Pavia 2019) | 10 |
| minimal winning coalition | coalizione vincente minimale | 10 |
| bankruptcy problem | problema di bancarotta (Fragnelli; "fallimento" not found) | 10 |
| proportional rule; constrained equal awards, losses | regola proporzionale; CEA, CEL (English kept, as Fragnelli; "somme uguali", "perdite uguali" as glosses) | 10 |
| airport game; glove market | gioco dell'aeroporto; gioco dei guanti (Torre, Pavia, slides 2019; "mercato dei guanti" not found) | 10 |
| contested garment | il mantello conteso | 10 |
| share (of a pool) | *share* (kept, feminine: "le share") | 10 |
| swing | *swing* (kept) | 10 |
| English auction; Dutch auction | asta inglese (asta ascendente); asta olandese (asta discendente) | 11 |
| sealed-bid, first-price, second-price auction | asta in busta chiusa; al primo prezzo, al secondo prezzo; asta di Vickrey | 11 |
| bidder; bid | offerente; offerta | 11 |
| (independent) private values; common value | valori privati (indipendenti); valore comune | 11 |
| bid shading | *bid shading* (kept; gloss "l'autoriduzione dell'offerta", Bosco UniMiB) | 11 |
| revenue equivalence | equivalenza del ricavo (not "dei ricavi": Bosco 24 to 2, and the module list) | 11 |
| reserve price | prezzo di riserva | 11 |
| all-pay auction | asta *all-pay* (kept) | 11 |
| winner's curse | maledizione del vincitore | 11 |
| multi-unit auctions | aste multi-unità | 11 |
| pay-your-bid (discriminatory) auction | asta discriminatoria (*pay-your-bid*: paghi la tua offerta; "paghi la tua offerta" in Panel C) | 11 |
| uniform-price auction | asta a prezzo uniforme (the Italian Treasury's "asta competitiva" / "asta marginale" not used) | 11 |
| demand reduction | riduzione della domanda | 11 |
| fee; fee rate | commissione; commissione per unità di peso ("tasso di commissione" not attested) | 11 |
| block weight; weight unit | peso del blocco; unità di peso | 11 |
| wallet; replace-by-fee | *wallet*, *replace-by-fee* (kept) | 11 |
| monopolistic price (Lavi–Sattath–Zohar) | prezzo monopolistico (no Italian source: our translation) | 11 |
| unit demand | not used ("domanda unitaria" not attested) | 11 |
| mechanism design | progettazione dei meccanismi (*mechanism design* at first use; Li Calzi, Ca' Foscari; "disegno dei meccanismi" not found) | 12 |
| mechanism; direct mechanism; designer; report | meccanismo; meccanismo diretto; progettista; dichiarazione | 12 |
| revelation principle | principio di rivelazione | 12 |
| incentive compatibility | compatibilità degli incentivi (PoliMi, Teramo; "compatibilità con gli incentivi" not found) | 12 |
| Myerson's lemma; allocation rule; monotone | lemma di Myerson; regola di allocazione; monotona (regola di allocazione: Bosco, UniMiB, who mostly writes "regola di assegnazione"; lemma di Myerson, monotona: no Italian source) | 12 |
| virtual value; optimal auction | valore virtuale; asta ottima (no Italian source: calques) | 12 |
| VCG mechanism; externality | meccanismo VCG (Vickrey–Clarke–Groves); esternalità (as module 08) | 12 |
| individual rationality (voluntary) | razionalità individuale; "volontario" in F2 ("vincolo di partecipazione" found, not used) | 12 |
| budget balance | pareggio di bilancio; "in pareggio" in F2 (no source in this sense; it.wikipedia's VCG page says "conti equilibrati") | 12 |
| bilateral trade; double auction | scambio bilaterale (no source); asta doppia (it.wikipedia) | 12 |
| posted price; split the difference | prezzo fisso; dividere la differenza | 12 |
| generalized second price (GSP) | asta generalizzata al secondo prezzo (*generalized second price*, GSP; Italian sources keep GSP); "Secondo prezzo generalizzato" in Panel A | 12 |
| false-name bids | offerte sotto falso nome (*false-name bids*; no Italian source) | 12 |
| Sybil attack; Sybil-proof | attacco Sybil (it.wikipedia "Bitcoin"); a prova di attacco Sybil | 12 |
| collusion, to collude | collusione, colludere ("I perdenti colludono") | 12 |
| transaction fee mechanism; base fee | meccanismo delle commissioni (*transaction fee mechanism*); commissione base (*base fee*; no Italian source, it.wikipedia keeps English) | 12 |
| MMIC, OCA-proofness | *myopic miner incentive compatibility*, *OCA-proofness* (kept) | 12 |
| fake transaction; honest, cheating (miner) | transazione falsa; onesto, imbroglio (as module 06's imbrogliare) | 12 |
| selfish mining | *selfish mining* (kept; UniBo thesis; "mining egoistico" only in Spanish) | 13 |
| reference implementation | implementazione di riferimento (no Italian source; transparent) | 13 |
| longest chain | catena più lunga (Italian whitepaper) | 13 |
| orphan (stale) block | blocco orfano, as module 04 (it.wikipedia; *stale* once) | 13 |
| private branch; (private) lead | catena privata; vantaggio (di k blocchi) ("in vantaggio di due blocchi": Serena, UniBo thesis 2018/19; "vantaggio privato" not found) | 13 |
| race | gara (Italian whitepaper) | 13 |
| Markov chain; stationary distribution | catena di Markov; distribuzione stazionaria (it.wikipedia) | 13 |
| relative revenue (her share of the chain) | quota dei blocchi (della catena) (no source for any form) | 13 |
| profitability threshold | soglia di redditività (no source for either; Treccani marks "profittabilità" as modelled on English) | 13 |
| difficulty adjustment | aggiustamento della difficoltà, as module 02 ("adeguamento", "regolazione" also found) | 13 |
| Markov decision process; optimal policy | processo decisionale di Markov; politica ottima (it.wikipedia; PoliMi thesis; "ottimale" also found) | 13 |
| (relative) value iteration | *value iteration* (kept: Italian sources keep it; "iterazione dei valori" not found) | 13 |
| truncation | troncamento | 13 |
| adopt, override, match, wait; irrelevant, relevant, active | kept in English, in italics, with glosses (no Italian source) | 13 |
| fair-weather mining | *fair-weather mining* (kept) | 13 |
| miner (gender) | masculine, as modules 02–12 ("il miner", "un pool") | 13 |
| zero-profit condition | condizione di profitti nulli (Battistini, UniSi; "profitti economici nulli", Unife; Tor Vergata also "condizione di profitto nullo") | 14 |
| incentive compatibility constraint | vincolo di compatibilità degli incentivi (Unife) | 14 |
| flow and stock | flusso e stock (grandezze di flusso, di stock: Teramo) | 14 |
| majority (51%) attack | attacco del 51% (Bitcoin.com IT, UniBo thesis); "attacco di maggioranza" as a gloss | 14 |
| double spend | doppia spesa (ethereum.org IT) | 14 |
| escrow | *escrow* (kept, as in legal Italian; gloss "deposito in garanzia") | 14 |
| specialized capital | capitale specifico (transaction-cost literature; Battistini, UniSi, writes "investimenti specifici"; "capitale specifico" itself not seen; "capitale specializzato" not found) | 14 |
| renting hash rate | noleggio di potenza di calcolo (Bitpanda "noleggiare") | 14 |
| sabotage; counterattack; Goldfinger attack | sabotaggio; contrattacco; attacco *Goldfinger* (no Italian source: plain forms) | 14 |
| bribery | corruzione (*bribery*) (no source; ethereum.org IT "tangenti") | 14 |
| war of attrition | guerra di logoramento (UniBo thesis; "guerra d'attrito" also found) | 14 |
| block subsidy | sussidio del blocco (only a search summary; distinct from "ricompensa del blocco", subsidy plus fees) | 14 |
| halving | *halving* (kept, masculine; gloss dimezzamento: Sky TG24) | 14 |
| undercutting; mining gap | *undercutting*, *mining gap* (kept: no Italian source) | 14 |
| free rider; confirmation | *free rider* (kept, it.wikipedia); conferme | 14 |

## Work in progress

**The review of the lectures** (`prompts.local/game-theory-lab-review.md`)
is finished: the 28 lectures, the 14 `texts.js` and the index were
reviewed on 26 November 2026 (by Claude, at Adriano's request), and the
DRAFT markers came off in the commit "Game Theory Lab: lectures reviewed,
DRAFT markers removed" (revert it to put them back). The report
`docs/reports/game-theory-lab-review.md` and the working log
`docs/reports/game-theory-lab-review-log.md` are in "Game Theory Lab
review: report"; the points left for Adriano are in the report.

Nothing in progress. All fourteen modules are "ready" and done (table
above); the lab was closed in the commit "Game Theory Lab: close" (prompt
14, stage 2). Prompt 14 is finished: its report
`docs/reports/game-theory-lab-14.md` and working log
`docs/reports/game-theory-lab-14-log.md` are in "Game Theory Lab 14:
report".

## Next

The lab is complete. What is left is under "Open items": decisions and
rereading for Adriano, nothing to build. A later prompt that changes a
module follows the working rules above (WIP commits, log, checks, report).

## Open items

Only what is still open. The per-module notes this section used to hold
(code to reuse, choices to review, findings and sources, timings, chunk
sizes, figure heights) are in each module's report,
`docs/reports/game-theory-lab-NN.md`, and its working log
`docs/reports/game-theory-lab-NN-log.md` (from module 03), and in this
file's git history (the commit "Game Theory Lab 14: The price of security"
has the last full version).

- **Italian terms without a source.** In the table above, the rows whose
  Italian column says "no source", "not found" or "no Italian … found" are
  our choices, to be confirmed by Adriano (searched once more in the review of 26 November 2026, log `docs/reports/game-theory-lab-review-log.md`, "Stage 3"): the lizard's
  name (07), Wardrop's principle and best-response dynamics (08),
  specialized equilibrium, key player, intercentrality, pairwise
  stability, connections model (09), least core (10), monopolistic
  price, unit demand (11), Myerson's lemma, virtual
  value and optimal auction, budget balance, bilateral trade, false-name
  bids, base fee (12), reference implementation, relative
  revenue, profitability threshold, the four MDP actions and three fork
  labels (13), specialized capital, sabotage,
  counterattack, Goldfinger attack, bribery, block subsidy, undercutting,
  mining gap (14); and the one-shot deviation principle (06).
- **The push.** Nothing has been pushed. The branch `game-theory-lab` is
  ahead of `main` (ddfed85, unchanged since 25 November 2026), with no
  commit of `main` missing; merging and pushing are Adriano's decisions.
- **Module 14's dated defaults age.** Panel A's defaults and the numbers
  of the lecture's sections 3 and 4 are those of 23–26 November 2026
  (sources in `capstone-the-price-of-security/defaults.js` and in
  `docs/reports/game-theory-lab-14-log.md`). Refreshing them means changing
  `defaults.js` and the lecture together; `check-game-theory-14.mjs` pins
  the quoted numbers to the defaults, so it fails until both agree. The
  hardware price ($18.28 per TH/s) may already be stale.
