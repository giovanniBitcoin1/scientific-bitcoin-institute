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
| 01 | I | `what-is-a-game` | done | the commit "Game Theory Lab 01: What is a game?" | A Game explorer; B Guess two thirds of the average; C How far does dominance go? | `eliminate`, `atlas` |
| 02 | I | `nash-equilibrium` | done | the commit "Game Theory Lab 02: Nash equilibrium" | A Find the equilibria; B Which convention?; C A contest for a prize | `staghunt`, `cournot` |
| 03 | I | `mixed-strategies-zero-sum` | done | the commit "Game Theory Lab 03: Mixed strategies and zero-sum games" | A All the equilibria; B Learning to mix; C Can you be read? | `square`, `minimax` |
| 04 | I | `sequential-games-commitment` | done | the commit "Game Theory Lab 04: Games in time and credible commitment" | A Solve the tree; B Leader and follower; C Dividing a pie | `entry`, `pie` |
| 05 | II | `incomplete-information-signalling` | done | the commit "Game Theory Lab 05: Incomplete information and signals" | A The market that empties; B Separate or pool?; C Words that cost nothing | `types`, `doubt` |
| 06 | II | `repeated-games-reputation` | done | the commit "Game Theory Lab 06: Repeated games and reputation" | A Can the cartel hold?; B Price wars without cheating; C A reputation for toughness | `patience`, `folk` |
| 07 | II | `evolution-and-learning` | done | the commit "Game Theory Lab 07: Evolution and learning" | A Rock, paper, scissors in a population; B One mutant; C Learning by regret | `fates`, `traffic` |
| 08 | III | `congestion-price-of-anarchy` | done | the commit "Game Theory Lab 08: Congestion and the price of anarchy" | A How bad can it get?; B Drivers who count; C Sharing the cost of a road | `tworoads`, `braess` |
| 09 | III | `games-on-networks` | done | the commit "Game Theory Lab 09: Games on networks" | A Who does the work?; B The key player; C Building the network | `star`, `formation` |
| 10 | III | `coalitions-sharing` | done | the commit "Game Theory Lab 10: Coalitions and sharing" | A Who gets what?; B Who decides?; C An estate that cannot pay | `core`, `votes` |
| 11 | IV | `auctions` | done | the commit "Game Theory Lab 11: Auctions" | A Same revenue, different risk; B The winner's curse; C A block for sale | `truth`, `shading` |
| 12 | IV | `mechanism-design` | done | the commit "Game Theory Lab 12: Designing the rules" | A Lying does not pay; B Pay for the harm you do; C Who runs the auction? | `area`, `trade` |
| 13 | IV | `mining-as-a-game` | planned | | | |
| 14 | IV | `capstone-the-price-of-security` | planned | | | |

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

- The path `/game-theory-lab` is provisional (`src/data/lab/paths.js`).
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
| matching pennies | pari o dispari | 01 |
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
| heads, tails | testa, croce | 03 |
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
| rest point | punto di equilibrio (not "punto di riposo": no source) | 07 |
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
| Katz–Bonacich centrality | centralità di Katz–Bonacich (no Italian source; Italian authors write it in English) | 09 |
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
| least core | *least core* (kept: no Italian term found) | 10 |
| weighted voting game; quota | gioco a maggioranza pesata; quota | 10 |
| Shapley–Shubik index, Banzhaf index | indice (di potere) di Shapley–Shubik, indice di Banzhaf | 10 |
| pivot (Shapley–Shubik); decisive (Banzhaf) | pivotale (il *pivot*); cruciale (Bernardi, Pavia 2019) | 10 |
| minimal winning coalition | coalizione vincente minimale | 10 |
| bankruptcy problem | problema di bancarotta (Fragnelli; "fallimento" not found) | 10 |
| proportional rule; constrained equal awards, losses | regola proporzionale; CEA, CEL (English kept, as Fragnelli; "somme uguali", "perdite uguali" as glosses) | 10 |
| airport game; glove market | gioco dell'aeroporto; gioco dei guanti ("mercato dei guanti" not found) | 10 |
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
| Myerson's lemma; allocation rule; monotone | lemma di Myerson; regola di allocazione; monotona (no Italian source: calques) | 12 |
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

## Work in progress

Module 12, `mechanism-design` (prompt 12): built and committed as "Game
Theory Lab 12: Designing the rules" (two WIP commits squashed). The whole
CHECKS list ran on the final code before the squash: 0 failures everywhere.
Remains: the report `docs/reports/game-theory-lab-12.md`, committed with the
working log `docs/reports/game-theory-lab-12-log.md` as "Game Theory Lab 12:
report".

## Next

Module 13, `mining-as-a-game`, when its prompt is there.

## Open items

- Module 12, things a later module may reuse, all in `mechanism-design/`:
  `myerson.js` (allocation rules: one object, reserve, two slots, lottery,
  "win only in the middle"; exact areas, Myerson's payment with the
  lottery's closed form, pay your bid, the generalized second price; the
  scan of reports every 0.1 with the best reports as intervals; the GSP
  threshold; the curve as a polyline), `vcg.js` (VCG for two objects and 2
  to 4 bidders over all (n + 1)² assignments, fixed tie order, payments as
  externalities, the revenue without each bidder, two names as one person,
  the presets), `bilateral.js` (efficient trade, posted price, split the
  difference: exact chance, gains and budget, a midpoint grid, the linear
  equilibrium's best replies), `cheat.js` (module 11's draws with a miner
  who adds fakes: the search over h high fakes and the place of one more,
  O(k) per block, checked against every place and against a brute force over
  multisets of fakes; exact honest, one-fake and users' values). Module 13 can
  start from `cheat.js` and `vcg.js`.
- Module 12, choices to review: ties with a rival bid are a coin toss
  (x is the average of the two sides), so the best pay-your-bid report is
  "just above" h, 60.1 on the 0.1 grid; "win only in the middle" is
  [40, 60) as written. F1 has its own b slider and the three presets; F2
  calls the split rule "truthful" because its linear equilibrium is, through
  the revelation principle, a truthful equilibrium of a direct mechanism.
  Panel B: bids and values are whole numbers 0–99; AB is raised to the larger
  single bid; "Two names" has the sub-pills "As one person" (2 bidders) and
  "As two names" (3 bidders, merged, the person's values in bidder 2's row,
  bidder 3's payoff shown as ·); "Bids = true values" copies the values. Panel
  C shows pay your bid and the monopolistic price "cheating" through the same
  search (pay your bid) or as honest (monopolistic: no fake can raise what
  real users pay; the brute force is in the self-check); "Run again" n uses
  seed n, the same draws as module 11's Panel C. At k = n the single fake
  below the n-th bid gives 100n/(n + 1) (95.24 at n = 20), where the prompt
  said "none"; "none" only for k > n. Figure heights 355 and 408 px at 1280
  (EN and IT; guide about 380, up to 420); at 375 IT 656 and 803.
- Module 12, findings and sources (November 2026, details in the log):
  every number of the prompt agrees with the code, except the single fake at
  k = 20 (above); my Panel C values at 2,000,000 blocks are within 1% of the
  prompt's. Roughgarden's three properties are DSIC, MMIC and OCA-proofness
  (the prompt's "UIC" is Chung and Shi's term); the second price is DSIC only
  "almost" for a block, so the box says the uniform price "comes close to the
  first"; the revelation principle credited "among others" (Myerson's Nobel
  lecture lists Holmström, Harris–Townsend, Rosenthal too); Roughgarden's
  lecture 7 is "Multi-Parameter Mechanism Design"; the optimality of 14.06
  from the abstract and secondary sources.
- Module 12 texts quote numbers pinned by `check-game-theory-12.mjs` (about
  25 s, of which 22 s are five runs of 2,000,000 blocks) and by
  `browser-checks/modules/game-theory-mechanism-design.mjs`. Module chunk
  79.0 kB; module 11's `block.js` is now a 2.3 kB shared chunk (module 11's
  chunk 71.9 kB).

- Module 11, things a later module may reuse, all in `auctions/`:
  `auctions.js` (F1's payoff, F2's expected payoff and best bid; equilibrium
  bids of the first price with a reserve, second price, all-pay; exact mean
  with a reserve, closed-form standard deviations, the moments with a reserve
  by Simpson's rule; the bidders' payoff; the best reserve on a grid),
  `montecarlo.js` (the three formats on the same seeded draws, histograms),
  `commonvalue.js` (the jar of coins: exact profit, losing share, revenue,
  break-even and equilibrium discounts, one bidder's payoff when she moves
  her bid, by integration split at the kinks; the simulation),
  `block.js` (binomial tails summed from the largest term, the pay-your-bid
  bid, its 16,385-point table, exact means and the uniform price's standard
  deviation; pay your bid, uniform and monopolistic price on seeded blocks;
  the monopolistic revenue for every k in one pass). Module 12 can start from
  `block.js` (the miner as auctioneer) and `auctions.js` (Myerson's reserve).
- Module 11, choices to review: F1 also has a slider for your bid b (for
  exercise 1); h moves by slider, by mouse on the chart, by touch with "Move
  h" on, or by arrow keys (1). F2 shows "you bid X% of your value" rounded
  to whole percent. Panel A runs the three formats on the same draws (the
  table shows all three, the stats the chosen one); the reserve slider is
  greyed for the all-pay; the histogram spans 0–100 for two bidders and
  0–200 otherwise (last bin "everything above"); the y scale steps by 0.1.
  Panel B's k presets "Bid the estimate", "Break even" and
  "Equilibrium" set exact values (6.67, 3.33…) off the slider's 0.5 grid;
  the chart's simulated points use the same draws at every k, so they lie on
  a line parallel to the exact one. Panel C reads the pay-your-bid bid from
  a table (within 3e-7 of the formula on the 0–100 scale); "price per
  included user" is total revenue over total users served; the revenue chart
  draws pay your bid and the uniform price as one exact line (they
  coincide). Every "Run again" n uses seed n; changing a setting keeps the
  run number. Figure heights at 1280 px 420 and 420 (EN and IT; guide about
  380); at 375 IT 728 and 541.
- Module 11, findings the texts state: every number of the prompt agrees
  with the code; my simulated Panel C values at 2,000,000 blocks are within
  1% of the prompt's (details in the log and the report). The lecture quotes
  Bazerman and Samuelson's $8, $5.13 and $10.01 and cites Kagel, Levin and
  Harstad 1995 for the second-price discount, Riley and Samuelson with
  Myerson for the reserve of 50; Roughgarden's lecture 2 is "Mechanism
  Design Basics".
- Module 11 texts quote numbers pinned by `check-game-theory-11.mjs` (about
  15 s, of which 12.5 s are seven runs of 2,000,000 blocks) and by
  `browser-checks/modules/game-theory-auctions.mjs`, which times the panels
  to the updated DOM and, separately, to the second frame (headless Chrome's
  frame scheduling makes the latter vary: 433 ms once for a 63 ms update).
  Module chunk 74.0 kB.

- Module 10, things a later module may reuse, all in `coalitions-sharing/`:
  `simplex.js` (a dense two-phase simplex on exact fractions with Bland's
  rule: free or nonnegative variables, ≥ ≤ = rows, infeasible and unbounded,
  redundant rows dropped), `coalitions.js` (TU games by bitmask; the Shapley
  value by formula and by all n! orders; superadditive, convex; the core test
  LP; the least core; objections; savings games of cost games; three-player
  core corners in exact fractions; the nucleolus by sequential LPs over the
  imputations; the presets), `voting.js` (Shapley–Shubik and Banzhaf by
  dynamic programming over integer weights, exact up to 30 players;
  enumeration; "split the largest"; the 1958 Council and the illustrative
  pools), `bankruptcy.js` (proportional, CEA, CEL, Talmud, Shapley of the
  estate game, random arrival, the award curves), `CoreTriangle.jsx`,
  `PowerBars.jsx`. Modules 12 and 13 can start from `simplex.js` and
  `voting.js`.
- Module 10, choices to review: F1's division moves in whole numbers; → and ←
  move 1 between A and B, ↑ moves 1 to C from the larger of A and B (ties A),
  ↓ 1 from C to the smaller (ties B); a pair objects only if it would get
  strictly more. Panel A's "core point" is the least-core LP's solution (a
  vertex chosen by Bland's rule), not the nucleolus; cells take whole numbers
  from −999 to 9999; a cost game's tests run on its savings game and the core
  point is also shown as costs. Panel B's weights sit behind a closed
  "Weights" list; its table hides the share column below 640 px and shortens
  its headers (S–S, abs.); bars are unlabelled above 8 players; "Split the
  largest" splits the first of the largest. Panel C's chart steps E by 5; the
  Talmud's three estates are dashed marks. F1 407 px at 1280 (guide about
  380), F2 346 (382 IT); at 375 IT 836 and 624.
- Module 10, findings and sources (November 2026, details in the log): every
  number of the prompt agrees with the code; the nucleolus equals the Talmud
  on 411 problems. The core credited to Gillies and Shapley (1952–53),
  published by Gillies 1959; Shapley's four properties "in modern form" (the
  1953 paper has three axioms); the 1958 quota of 12 applies to acts on a
  Commission proposal (with the other rule Luxembourg could be pivotal, Mayer
  2018); "Ketubot" as Sefaria spells it (the prompt had "Kethubot"); the hash
  rate quoted is Hashrate Index's 30-day average of 1,019 EH/s on 23 November
  2026; the three-player core condition has no citable source (derived;
  checked on 1,731 games). Bondareva and O'Neill from secondary sources.
- Module 10 texts quote numbers pinned by `check-game-theory-10.mjs` (under
  1 s) and by `browser-checks/modules/game-theory-coalitions-sharing.mjs`.
  Module chunk 83.8 kB (30.4 kB gzip); module 08's `frac.js` is now a 0.8 kB
  chunk shared by modules 08 and 10.
- check-game-theory-03 since prompt 10 (stage 0): the zero-sum grid is walked
  with loops instead of arrays (identical values on 124 games); 437 s → about
  80 s.

- Module 09, things a later module may reuse, all in `games-on-networks/`:
  `netgames.js` (small networks from link lists, the presets with fixed
  layouts, eigenvalues by cyclic Jacobi rotations, inverse by Gauss–Jordan,
  the linear game x_i = max(0, 1 + δ Σ g x) by best responses in turn, the
  star's closed form), `publicgoods.js` (maximal independent sets by
  bitmask, stability of order 2, the seeded runs), `keyplayer.js`
  (Katz–Bonacich efforts, intercentralities, removal, the slider's end
  below 1/λ_max, crossings by bisection), `connections.js` (networks of
  up to 31 players as neighbour bitmasks, the connections model's
  utilities by BFS, pairwise stability pair by pair, the Jackson–Watts
  dynamics, brute force over all networks of n ≤ 6), `NetDraw.jsx` (an SVG
  network with sizes, colours and clickable nodes). Module 10 can start from
  `connections.js` (the value of links) and module 14 from `keyplayer.js`.
- Module 09, choices to review: F1 stops at ±0.45 and its chart marks ±0.5
  as the limits; at δ = −0.25 exactly the regime reads "the hub does
  nothing"; F2's point snaps to 0.01 within δ 0.01–0.99, c 0.01–2, and the
  readout explains why the star is not stable (a hub's cut above δ, two
  leaves' link below δ − δ²); at the two thresholds the star counts as
  pairwise stable (a gain of exactly 0 is not strict; gains within 1e-12
  count as 0). Panel A's "Best responses" shows the end at once, with the
  start and the turns; changing the network goes back to run no. 1. Panel
  B's ties (the ring) go to the lower number; a removal can also be made
  from the table. Panel C's run n draws its random start and its pairs from
  one generator seeded n; the end is checked after every change (and before
  the first step), so the step count is the number of draws until the
  network is stable; any change of setting goes back to the start of the
  same run. Figure heights: F1 443 px at 1280 (EN and IT; the prompt's guide
  was about 380), F2 445 (462 IT); at 375 px 608 and 746.
- Module 09, findings the texts state: everything as the prompt expected,
  except the "expected" values of the lab's generator: Panel A runs 1–20,
  line {1, 3, 5} 19 and not specialized 1, ring 9 and 11, grid {1, 3, 5, 7,
  9} 17, not specialized 3, never {2, 4, 6, 8}; Panel C (8, 0.5, 0.4) from
  empty, runs 1–20: 8–10 links, 9.60–10.50 (9.55 only from the random start;
  runs 1–200 from empty 7–10 links, 9.55–10.65); F1's leaf at δ = 0.3 is
  2.03125, shown 2.0313.
- Module 09, sources (November 2026, details in the log): the author of the
  two public-goods papers is Rachel Kranton (the prompt had "Kranz");
  Bramoullé–Kranton's stability theorem (order 2) from secondary sources
  quoting it; the uniqueness condition |λ_min| δ < 1 is sufficient (the
  lecture says "unique when"); Ballester et al.'s crime networks are in the
  working paper's title, not the article's motivation (softened); Jackson
  2008 ch. 9 is "Decisions, Behavior, and Games on Networks"; Avarikioti
  2019 has no price-of-anarchy result (the box gives that to 2020 only).
- Module 09 texts quote numbers pinned by `check-game-theory-09.mjs` (under
  1 s) and by `browser-checks/modules/game-theory-games-on-networks.mjs`.
  Module chunk 76.8 kB (27.5 kB gzip).
- Module 08 since prompt 9 (stage 0): the potential sentence of "Equal
  costs, and a hidden objective" rewritten; the Italian lecture trimmed by
  16 words elsewhere in its first section to stay within 1,700 words.

- Module 08, things a later module may reuse, all in
  `congestion-price-of-anarchy/`: `frac.js` (exact fractions on BigInt,
  slider decimals, H_k), `atomic.js` (any atomic congestion game: loads,
  player costs, Rosenthal's Φ, the best strictly cheaper switch with ties to
  the lowest strategy, best-response dynamics with the turn order and the
  end after a quiet turn, enumeration of profiles; Braess's network with n
  drivers and its survey by counts; the four drivers), `costsharing.js`
  (fair cost sharing as cost(k) = C_e/k in the same engine; the hub and two
  roads; every equilibrium of the hub by the structure of its conditions,
  checked against brute force), `parallel.js` (parallel roads a x^d + b,
  equilibrium and optimum by bisection on the level, roads of constant cost,
  the doubled-demand check, the seeded survey), `pigou.js`, `braess.js`.
  Module 09 (network formation) can start from `costsharing.js` and
  `atomic.js`; module 10 from `frac.js`.
- Module 08, choices to review: F2's chart draws the closed level and the
  planner's together (both 1.5); Panel A's "New instance" n uses seed n,
  "Pigou" sets r = 1 and moving n goes back to random instance no. 1;
  "1,000 instances" uses seed 1 and is hidden when n, d or r change; costs
  in Panel A are total travel time; Panel B's "half upper, half lower" puts
  the odd driver on the upper route; "random" draws start no. 1 and
  choosing it again draws the next; any change of setting goes back to the
  start; Panel B shows costs per driver for Braess and totals for the four
  drivers; both logs keep the last 12 switches; Panel C's starts are
  "everyone on the shared road" (hub or A) and "everyone on the other". The
  English cells of module 07's F2 are SS, ST, TS, TT ("T = straight", since
  S is swerve). Figure heights: F1 346 px at 1280 (EN and IT), F2 426 (442
  IT); at 375 447 and 633 px.
- Module 08, findings the texts state: everything as the prompt expected,
  except the survey values of the lab's generator (n = 3, r = 1, seed 1:
  d = 1 mean 1.036, largest 1.289, above 1.05 0.27; d = 2 1.102, 1.588,
  0.55; d = 4 1.245, 2.110, 0.72; the prompt's values are inside the ranges
  of seeds 1–10) and the four drivers' random starts (seeds 1–9 end at all
  direct, seed 10 draws all detours, an equilibrium, and stays).
- Module 08, sources (November 2026, details in the log): all citations
  confirmed through Crossref and the papers' abstracts; Wardrop's pages are
  325–362 (the prompt's 325–378 includes the discussion); the 1999 term was
  "coordination ratio", the name "price of anarchy" from Papadimitriou 2001
  (added to the reading); Beckmann–McGuire–Winsten from secondary sources;
  no real road case in a peer-reviewed study (Youn, Gastner and Jeong 2008
  is a simulation), so the lecture gives none.
- Module 08 texts quote numbers pinned by `check-game-theory-08.mjs` (about
  3 s) and by `browser-checks/modules/game-theory-congestion-price-of-anarchy.mjs`.
  Module chunk 86.2 kB (29.1 kB gzip); it shares nothing with the earlier
  modules of this lab except the Network Lab's `ui.jsx` and `charts.jsx`.

- The lectures of modules 01 to 07 carry the DRAFT marker: to be reviewed
  by Adriano (the markers stay until then).
- Module 07, things a later module may reuse, all in
  `evolution-and-learning/`: `ess.js` (exact ESS of symmetric 2 × 2 games,
  symmetric Nash equilibria, a numerical ESS test by random mutants for any
  n), `replicator.js` (the (T, S) phase line, rest points and fates, RK4 for
  numbers or vectors, the three-strategy replicator, RPS, module 06's
  repeated-dilemma matrix played out and its two thresholds, eigenvalues at
  the centre by formula and numerical Jacobian, period and time average,
  simplex coordinates), `moran.js` (fitness with a game, ρ_A and ρ_B,
  constant fitness and its closed form, x* and the one-third test, N·ρ
  curves, the jump chain and the full Moran step), `correlated.js`
  (obedience constraints of any 2 × 2 game, vertex enumeration with a small
  Gaussian solver, convex hull and area, chicken with a crash payoff d, the
  violation of a frequency table), `hedge.js` (two Hedge learners on module
  01's classics with scaled payoffs, the bound with any start, tuned η, the
  equilibria of the square). Module 08 can start from `replicator.js`
  (best-response and potential dynamics) and module 12 from
  `correlated.js`.
- Module 07, choices to review: Panel C's bound is ln(1/min(π, 1 − π))/(ηt)
  + η/8 for a start (π, 1 − π), the prompt's ln 2/(ηt) + η/8 at the default
  start (ln 2 holds only for the uniform start); the panel title in Italian
  is "Imparare dal regret" (not "dal rimpianto": Italian sources keep
  *regret*); English "matching pennies" (as modules 01–03), Italian "pari o
  dispari"; chicken's moves are "swerve, straight" in English, as in module 01 ("go"
  until prompt 8), and "sterza, dritto" in Italian; F1's point snaps to 0.01;
  Panel A's trajectories are computed at once and drawn 0.8 time units per
  frame; a preset goes back to the start (0.5, 0.3, 0.2); Panel B's w is a
  log slider rounded to two significant digits; "Run 10,000 mutants" n uses
  seed n, "Watch one" seed 1001 + the runs so far, one event per frame;
  Panel C's game pills go back to run no. 1 and the start (0.5, 0.5); the
  first heading is "A population of strategies" (the prompt's "Strategies
  that spread" is also the module summary, which the locked page shows, so
  check-module could not tell them apart). Figure heights: F1 384 px at
  1280 EN (400 IT), F2 403; at 375 671/705 and 716 px.
- Module 07, findings the texts state: everything as the prompt expected,
  except the "expected" ranges of the runs (seeds 1–10: neutral
  0.0969–0.1029, r = 1.1 0.1434–0.1504, hare 0.0162–0.0199; all within 4
  standard errors, largest |z| 1.65), the largest regret ratio (0.971 over
  all t, 0.917 at the last round; prompt 0.898) and pari o dispari's mean
  distances over seeds 1–50 (0.569 and 0.323; prompt 0.590 and 0.332).
- Module 07, sources (November 2026, details in the log): all citations
  confirmed through Crossref; Young's end page and his risk-dominant result
  from secondary sources; the lizards' period softened to "a few years" (the
  abstract's six years of observation, later estimates 4–5); the one-third
  rule and its risk-dominance part credited to Nowak et al. 2004 by Ohtsuki,
  Bordalo and Nowak 2007; Roughgarden's lecture 13 is "Equilibria:
  Definitions, Examples, and Existence"; Nowak 2006 ch. 6 "Finite
  Populations", ch. 7 "Games in Finite Populations"; Selten's 20 towns still
  from secondary sources only.
- Module 07 texts quote numbers pinned by `check-game-theory-07.mjs` (about
  2 s) and by `browser-checks/modules/game-theory-evolution-and-learning.mjs`.
  Module chunk 87.9 kB (32.1 kB gzip).
- The entry game has one payoff order everywhere: (newcomer, incumbent),
  the newcomer as player 0 in the first player's colour, even when the
  firm moves first (stage 0 of prompt 5). Module 06 keeps it.
- Module 06, things a later module may reuse, all in
  `repeated-games-reputation/`: `repeated.js` (grim trigger's threshold and
  averages; the plane of average payoffs: feasible set, individually
  rational set, lottery weights, the patience a point needs, the sustainable
  polygons by half-plane clipping), `collusion.js` (the n-firm cartel with
  Cournot or Bertrand punishment, the closed-form held output and its
  bisection), `greenporter.js` (Green–Porter with normal noise: alarms,
  margin, value, best rule, least δ; samples with the lab's Box–Muller; Φ from
  module 05's `globalgame.js`, now a 0.85 kB shared chunk), `chainstore.js`
  (Kreps–Wilson: deterred markets, the mixing probability, exact expectations
  by memoized recursion, histories, simulations), `minersdilemma.js` (Eyal's
  revenues, best responses by grid and golden section, equilibrium by
  alternating best responses). Module 07 can start from `repeated.js`; modules
  10 and 13 from `minersdilemma.js`.
- Module 06, choices to review: F2's point moves by mouse, by arrow keys
  (0.05) and by touch only with "Move" on (DrawToggle rule); clicks snap to
  0.01; check-module.mjs now treats an SVG marked `data-draw-surface` as a
  canvas (prompt 6). Panel A's y axis spans punishment to cartel with a
  margin (from 0 with Bertrand); its table of thresholds is n by rows.
  Panel B's "New sample" n uses seed n; "Best rule" breaks ties to the lowest
  p̄; chart 2 is computed once when the chunk loads. Panel C opens on a weak
  incumbent; "New history" n uses seed n (for "drawn" the first draw picks
  the type); "10,000 chains" uses seed 1 and is hidden when t, N or w
  change. The Italian keeps *one-shot deviation principle* and *trigger
  price* in English (no Italian source found). Figure heights: F1 383 px at
  1280 EN (403 IT), F2 391 (407); at 375 445 and 627 px.
- Module 06, findings the texts state: everything as the prompt expected;
  100,000 rounds at Panel B's defaults give quiet shares 0.8943–0.9011 over
  seeds 1–10; 10,000 chains give 6.1621–6.1856 entries and 0.8144–0.8379
  fights over seeds 1–10, and the weak payoff 66 in every chain.
- Module 06, sources (November 2026, details in the log): all citations
  confirmed; Blackwell (1965) added for the one-shot deviation principle;
  Selten's 20 towns, KMRW's Tit for Tat type and Porter's Chicago–New York
  grain from secondary sources; Eyal's reading of the rare attacks quoted
  from arXiv v2; Tadelis ch. 10 is "Repeated Games".
- Module 06 texts quote numbers pinned by `check-game-theory-06.mjs` (about
  2 s) and by `browser-checks/modules/game-theory-repeated-games-reputation.mjs`.
  Module chunk 78.9 kB.
- Shared by the lab since module 01: `src/components/lab/game-theory/PayoffTable.jsx`
  (the payoff table of a two-player game of any size: marks for best
  responses, greyed strategies, ringed stable cells, a compact mode, optional
  − / + steppers; also `TableLegend`; since module 02 also `onCell`, for
  cells that can be clicked, `selected` and `trail`). The modules import the Network Lab's
  `network/ui.jsx` and `network/charts.jsx` without changing them; Vite keeps
  each in a small chunk of its own (2.3 kB and 3.1 kB), loaded only when
  unlocked.
- Module 01, things a later module may reuse, all in `what-is-a-game/`:
  `games.js` (games as `{ rows, cols, a, b }`; best responses with ties,
  stable cells, strict dominance by one strategy, iterated elimination with a
  choice of order, dominant strategies, cells not beaten for both; the 576
  ordinal tables and their classes under renaming and swapping; the (T, S)
  map), `guessing.js` (the level-k crowd, one round, sequences, the
  1,000-play job, the whole-number variant), `randomgames.js` (random m × m
  games and their survey as a job), `EliminationSteps.jsx` (a game with its
  elimination, one step per press). Module 02 can start from `stableCells`
  and from `classifyTS`.
- Module 01, choices to review: "cells that no other cell beats for both
  players" means no other cell is strictly better for both; elimination
  deletes one strategy per step, rows before columns; the strategy names of
  Panel A change with the preset (C/D, Stag/Hare, Swerve/Straight,
  Concert/Match, Heads/Tails, Left/Right) and stay when a payoff is edited;
  the reader's own guess in Panel B is ranked among the others but does not
  move the mean; the slider of p moves through 0.10, 0.15, …, 0.95 and 2/3;
  shares move in steps of 0.05 and are normalised; any change of setting
  goes back to the first round of the page's seed; besides "Play again"
  there is "10 more rounds"; Panel C opens on 3 × 3 and surveys the chosen
  size again at every change (through `useExperiment`); its sample game
  shows payoffs in hundredths while the logic uses the full numbers;
  exercises 3 and 4 end with a check in the page ("on paper, then in the
  simulation"). F1 is 371 px tall at 1280 px in English (409 px in Italian,
  where the explanation takes one more line) and F2 367 px; at 375 px they
  are 401 and 604 px.
- Module 01, findings the texts state: in "Play again" the noise shrinks with
  the reference point (standard deviation σ × ref / 50; fixed in prompt 2,
  the constant noise of the first version put a floor a little above 1 under
  the mean). With σ = 2 the mean falls below 1 in round 8, as 50 f^t says (22
  with p = 0.9, 6 with p = 1/2, 4 for the deep thinkers); over 40 other seeds
  the rounds are the same, except round 21 once with p = 0.9 (50 f^21 = 1.02).
  In "Half at equilibrium" level 0 wins 615 times of 1,000 (565 to 616 over
  ten other seeds). With p = 0.9 levels 2 and 3 share the wins almost evenly
  (468 and 474; over ten other seeds 455–502 and 439–484).
- Module 01, sources (checked in November 2026, details in
  `docs/reports/game-theory-lab-01.md`): read in the papers — Nagel (1995:
  first-period mean 36.73 and median 33 at p = 2/3; numbers above 100p are
  weakly dominated) and Bosch-Domènech et al. (working-paper version: 7,900
  participants, means 18.91, 22.08 and 25.47, peaks at the steps of
  reasoning). From news reports and reference pages: the badminton
  disqualifications of 1 August 2012, von Neumann (1928), von Neumann and
  Morgenstern (1944), Keynes (1936, ch. 12), Rapoport and Guyer (1966: 78
  games).
- Module 01 texts and lecture quote numbers produced with fixed seeds, pinned
  by the "quoted on the page" checks in
  `scripts/lab/check-game-theory-01.mjs` (about 15 s; run it whole) and by
  `scripts/lab/browser-checks/modules/game-theory-what-is-a-game.mjs`. The
  page formats with `toFixed`: the checks format the same way.
- Scroll position (prompt 2, the commit "Labs: open lab pages at the top"):
  the site does not reset the scroll position when the route changes. The
  lab pages now do it themselves: `LabIndex.jsx` scrolls to the top when it
  mounts or its lab changes, `LabChapter.jsx` when it mounts or its lab or
  slug changes; the language toggle and everything else inside the page
  leave it where it is. `check-links.mjs` checks all of this for every lab
  (block "Lab pages open at the top") and no longer scrolls by itself. The
  hub `/labs` and the pages outside the labs are as they were: still for
  Adriano to decide.
- Module 02, things a later module may reuse, all in `nash-equilibrium/`:
  `equilibria.js` (the walk of alternating best responses with its end,
  equilibrium or cycle; random tables with whole payoffs and no ties that
  matter; the survey of random games with equilibria counted 0/1/2/3+ and
  the share of walks that reach one — it draws the same games as module
  01's `randomgames.js`, same seeds, so the two pages agree to the last
  digit), `conventions.js` (q* of the stag hunt, risk dominance, the
  population with the sampled rule, its tipping point, the scan as a job),
  `cournot.js` (best responses, equilibrium with two costs, n equal firms,
  the cartel, the path of alternating answers), `contest.js` (the Tullock
  contest in closed form with unequal costs, who stays in, best responses
  one at a time and all at once, `percent`). Module 03 can start from
  `walk` (matching pennies cycles) and from `analyzeWalks`; modules 13 and
  14 from `contest.js`.
- Where Vite puts the code the two modules share: `games.js`,
  `randomgames.js` and `PayoffTable.jsx` go into one chunk of their own
  (`randomgames-….js`, 9.8 kB, 4.0 kB gzip), loaded by both module chunks
  (module 01 72.7 kB, module 02 82.7 kB) and only when unlocked.
- Module 02, choices to review: the survey of Panel A uses module 01's games
  (so the share with no equilibrium at m = 8 is the 0.322 that module 01
  quotes; ten other seeds give 0.314–0.321); the survey gets its walks from
  the starting column only, since the row player moves first (checked
  against the walk itself); in the walk a player who is already at a best
  response stays, and otherwise goes to the first best response; Panel A
  opens on random table no. 1 of size 3, which has no equilibrium; "New
  game" after a classic goes back to the random table; Panel B samples the
  k others without repeats (k is cut to N − 1 when N is small) and shows
  the run of the page's seed at once, "Run" draws the next one; any change
  of setting goes back to run 1; the scan uses its own seed per starting
  share; Panel C has a slider for the prize (50 to 200), which the prompt
  did not ask for, so that exercise 5 can be checked on the page; players
  with the same cost share one line of its table; when every other player
  is out, the best response of the panel is 0 (the formula of the prompt),
  although any tiny effort would win: with "All at once" and n ≥ 6 everyone
  leaves by the fifth round and never comes back, and the observe list says
  so; Figure F2 starts from the point (1, 8) and draws one move every 0.38
  s. F1 is 323 px tall at 1280 px and F2 363 px (383 px in Italian); at
  375 px they are 535 and 616 px (555 and 633 in Italian).
- Module 02, findings the texts state: at two by two exactly 1/8 of the
  games have no equilibrium, 1/8 have two and 7/8 of the walks end at one;
  at eight by eight 32% have none, 26% two or more, and 52% of the walks
  end at one (77% in the games that have one). Tipping point of the sampled
  rule 0.732 with the default payoffs and k = 10 (0.869, 0.734, 0.704 for
  k = 5, 20, 50), 0.361 with a = 6. With 200 runs the chance of ending on
  the stag is 0.140 from x0 = 0.70 and 0.830 from 0.75 (N = 200); 0.005
  and 0.920 with N = 1,000. "All at once" settles for n = 2 and 3, swings
  between about 82 and 67 at n = 4 and blows up from n = 5; with the
  miners' costs it settles, but only in 165 rounds, against 8 for "One at a
  time".
- Module 02, sources (checked in November 2026, details in
  `docs/reports/game-theory-lab-02.md`): Nash's thesis has 27 pages
  according to Princeton (Wikipedia says 28); Schelling's New York question
  (the information booth of Grand Central Station, noon) is confirmed, the
  counts of his heads-or-tails question are not, so the text says "a large
  majority"; Van Huyck, Battalio and Beil's groups of 14 to 16, the choices
  1 to 7 and the minimum at 1 in every group after the third period come
  from Weber (2006), not from the 1990 paper itself; the pages of Tullock's
  chapter are given as 97–112 by most and 91–112 by one source, so the
  citation has no pages.
- Module 02 texts and lecture quote numbers produced with fixed seeds, pinned
  by the "quoted on the page" checks in
  `scripts/lab/check-game-theory-02.mjs` (about 20 s; run it whole) and by
  `scripts/lab/browser-checks/modules/game-theory-nash-equilibrium.mjs`.
  Shares in per cent are written by `percent` in `contest.js` (the page and
  the check use the same function).
- Module 03, things a later module may reuse, all in
  `mixed-strategies-zero-sum/`: `support.js` (every equilibrium of a
  two-player game by support enumeration, with a small linear solver; a
  degeneracy flag; whole-payoff random tables redrawn until nondegenerate;
  `showNumber` writes simple fractions; the survey of module 01's games),
  `mixed.js` (two-by-two indifference formulas, the best-response step
  lines of the square, the penalty kick and its best worst cases,
  rock-paper-scissors with a weight, Shapley's game, dominance by a
  mixture), `fictitious.js` (fictitious play with marks, runs and gaps),
  `reader.js` (the pattern-reading machine and simulated players). Module
  07 can start from `fictitious.js`.
- Module 03, choices to review: the sides of the penalty kick follow
  Palacios-Huerta (R = the kicker's natural side), not the prompt (which had
  L = natural); the four rates are presented as "of the size he measured"
  (one of them, 69.92, differs from a secondary reproduction of his table);
  F1 has one stag hunt (the classic of module 01 is the game of module 02);
  F1 uses a select, not pills, to stay short; F2's sliders have two
  decimals; the lecture's indifference "surprise" uses exercise 1 with
  (U, L) raised to 5 (only the column player's mix moves), because in the
  penalty kick both mixes move (constant-sum); exercise 5 in Panel A gives
  the column player 4 minus the row payoff; the survey uses the same G for
  all three sizes (the lecture quotes G = 20,000); Panel B rounds snap to
  two significant digits; Panel C's coin uses its own seed per press; in
  fictitious play the first run is round 1 alone (so 1, 2, 3… rather than
  the prompt's 2, 3, 4…). F1 is 310 px tall at 1280 px in English (325 in
  Italian) and F2 309 px (347 in Italian); at 375 px 599/572 (614/610).
- Module 03, sources (November 2026, details in the log
  `docs/reports/game-theory-lab-03-log.md` and in report 03): Palacios-Huerta
  2003 (1,417 kicks, 1995–2000, equal scoring rates and no serial pattern:
  from the abstract; the paper itself not reached), Walker and Wooders 2001
  (author PDF), Brown, Robinson, Shapley, von Neumann, Nash, Wilson,
  Harsanyi 1973, Chiappori et al. confirmed through publisher, Crossref or
  scans; Wagenaar 1972 not read, Falk and Konold 1997 added for "alternate
  too much".
- Module 03 texts quote numbers pinned by `check-game-theory-03.mjs`
  (about 30 s; run it whole) and by
  `browser-checks/modules/game-theory-mixed-strategies-zero-sum.mjs`.
  Module chunk 72.3 kB (26.2 gzip); it shares the `randomgames-…` chunk.

- Shared by the lab since module 04: `src/components/lab/game-theory/GameTree.jsx`
  (a game tree with perfect information in SVG: nodes with the mover's
  initial, labelled moves, payoffs at the leaves, solved nodes with their
  chosen move dark and the others grey and dashed, a highlighted path, values
  beside solved nodes; short move labels when the leaves are many; fits
  375 px). Modules 05 and 06 can start from it.
- Module 04, things a later module may reuse, all in
  `sequential-games-commitment/`: `trees.js` (trees as nodes and leaves,
  `prepare`, backward induction with ties to the first move and a solving
  order, plans and the table of plans, pure Nash equilibria, subgame
  perfection by brute force, the deepest profitable one-move deviation of a
  profile (`emptyThreat`), two- and three-stage random trees, the survey as a
  job), `presets.js` (the entry game with f, k and commitment; the centipede),
  `stackelberg.js` (leader and follower with two costs and a fixed cost,
  imports module 02's `cournot.js`), `bargaining.js` (alternating offers with
  one or two discount factors, Rubinstein's limit), `ultimatum.js` (a
  population of thresholds, the closed form, "Play" as a job), `forks.js` (the
  box: α², α²/(1 − α²), α(1 − α), two-block races). Module 06 can start from
  `bargaining.js` and `trees.js`; module 13 from `forks.js`.
- Module 04, choices to review: "Wait" is listed before "Commit" in both
  commitment trees, so that an indifferent firm (k = 2) does not commit; ties
  in backward induction go to the first move and the page says so (f = 2 in
  F1, the first mover of matching pennies in turn); an indifferent follower
  stays out (so the limit quantity a − c2 − 2√F keeps it out); in Panel A
  every tree has player 0 at the root and payoffs (first, second), so in the
  commitment preset they are (firm, newcomer), while F1 keeps (newcomer,
  firm); a plan is written as the short labels of its moves in depth-first
  order; "Solve" solves one node every 0.55 s, deepest first; the "same time"
  column of Panel B has no fixed cost; Panel C draws the thresholds at random
  (seed per N) and shows the closed form as a dashed line beside the
  population's curve, plus an offer slider the prompt did not ask for; "Play"
  is 1,000 proposers × 100 random offers on the 0.05 grid, each against a
  random responder, and also counts how many proposers find the best offer
  from their own tries; F2 opens on T = 10.
- Module 04, findings the texts state: in the random two-move trees the table
  of plans has 1, 2, 3 Nash equilibria with chances exactly 1/4, 1/2, 1/4,
  one not subgame perfect 3/4, one with a different outcome 1/3, the second
  player better off in it 1/2 (proof in report 04); moving first is better
  for the first player in 0.145 of 20,000 games, worse in 0.123 (4,000,000
  games: 0.146, 0.125); with no pure equilibrium both prefer second in 0.651
  on the page's seed (4,000,000 games: 0.666; ten seeds 0.643–0.683); in
  "Play" only 144 of 1,000 proposers find 0.40 by themselves (628 at m = 0.2).
- Module 04, sources (November 2026, details in the log
  `docs/reports/game-theory-lab-04-log.md` and in report 04): Zermelo softened
  after Schwalbe and Walker (not backward induction); Selten 1965, the name
  "subgame perfect" from 1975; McKelvey and Palfrey 7% read in the paper;
  the ultimatum figures from Henrich et al. 2001 (added to the reading);
  Narayanan et al. §5.5 read in the free draft, and the box does not call
  the forks "theoretical" (the book says that of selfish mining).
- Module 04 texts quote numbers pinned by `check-game-theory-04.mjs` (about
  10 s; run it whole) and by
  `browser-checks/modules/game-theory-sequential-games-commitment.mjs`.
- Module 04 since prompt 5 (stage 0): Panel A's commitment preset is F1's
  tree (`entryTree({ f: 0, k: 1, commit: true })`), so its outcome is
  (0, 3) as (newcomer, firm); the note under the table names the players
  ("Rows: the plans of the newcomer, whose payoff is written first") and
  the legend says the payoff order. The garbled Italian "Giù" in
  `presets.js` (shown on the page) and garbled comments were fixed.

- `GameTree.jsx` since module 05: optional chance nodes (`chance: true`,
  moves with `prob`; grey circle marked `chanceLabel`, default N; move
  labels with name and probability, `probFormat`) and `infoSets` (lists of
  node ids joined by a dashed line). Module 04 passes neither and sees no
  change (its checks pass unchanged). Module 06 can start from it.
- Module 05, things a later module may reuse, all in
  `incomplete-information-signalling/`: `types.js` (the entry game with a
  tough or weak incumbent, each type solved with module 04's
  `backwardInduction` on its own branch; the F1 tree with a chance node and
  an information set; Cournot with a hidden cost), `lemons.js` (the exact
  price path and end point, samples, the rounds, the survey as a job),
  `signalling.js` (separating and pooling ranges, a candidate with its
  deviations, the Cho–Kreps interval, a brute force on a grid),
  `cheaptalk.js` (largest N, partitions, losses, indifference, simulation,
  survey), `globalgame.js` (Φ from erf: Taylor series below 3, Laplace's
  continued fraction of erfc above, error below 1e-14; the cutoffs by
  bisection; steps and "To the end"). Module 06 can start from `types.js`;
  modules 11 and 12 from `signalling.js` and `cheaptalk.js`.
- Module 05, choices to review: the newcomer's initial in F1 is E
  ("entrant"; IT "chi entra"), the incumbent's I, because N marks Nature;
  at t = t* the newcomer stays out (ties to staying out); "separating at 0"
  is shown as pooling at 0; levels nobody chooses are read as low; Panel A
  shows sample no. 1 at once and "Run" replays the rounds (70 ms each);
  "New sample" n uses seed n; the survey uses its own seeds (5100 + 100 i
  + j); Panel C caps the buttons at 12 when b = 0 and its "Survey" is
  computed at once (0.3 ms, no job); F2's "To the end" runs until both
  cutoffs are within 1e-6 of 1/2. Figure heights: F1 423 px at 1280 EN
  (404 IT), 622/638 at 375; F2 310/330 at 1280, 340/414 at 375.
- Module 05, findings the texts state: the lemons sample (10,000 cars,
  0.2, 1.5) ends at 0.576–0.617 over seeds 1–10 (prompt expected
  0.579–0.619) in 24–27 rounds (prompt 21–25; 18–41 over seeds 1–40);
  1,000 cars 0.529–0.667; at q_min = 0, b = 2 the exact model is a knife
  edge and a sample ends anywhere between 0.366 and 1 (left out of the
  survey's check, reported in the observe list). Everything else as the
  prompt expected.
- Module 05, sources (November 2026, details in the log): all citations
  confirmed through Crossref, IDEAS or nobelprize.org; Akerlof's three
  rejections (AER, RES, JPE) from his own essay on nobelprize.org; the name
  "intuitive criterion" from secondary sources; Grafen's footing softened
  ("widely taken to … a reading since debated"); Dessein's general result
  from his abstract, the threshold 0.29 presented as computed in this
  model.
- Module 05 texts quote numbers pinned by `check-game-theory-05.mjs` (about
  5 s) and by
  `browser-checks/modules/game-theory-incomplete-information-signalling.mjs`.
  Module chunk 76.1 kB (28.3 kB gzip); module 04's `trees.js` with module
  01's `games.js` now sit in a shared chunk `trees-….js`, 9.5 kB.
