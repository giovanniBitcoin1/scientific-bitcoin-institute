# Game Theory Lab — review of the 28 lectures: report

Prompt: `prompts.local/game-theory-lab-review.md`, run on 26 November 2026
on the branch `game-theory-lab`. This was an editor's pass over the 28
lectures, the 14 `texts.js` files, the panel and figure strings and the
lab's index. Structure, sections, figures, panels and every number were
kept, except where a text was wrong. Adriano asked for the review to be done
in his place. The working log, with every check run and every source looked
up, is `docs/reports/game-theory-lab-review-log.md`.

**Method.** One helper agent per module read EN, IT, `texts.js` and the UI
strings against a common brief (the prompt's checks 1–8). The agents edited
text only and ran nothing. I ran every check and made each module's commit
on its own. For stage 2, one agent was the only editor of the lab. Stage 3
used one more agent for the web search. The agents' reports are summarized
in the log, module by module.

## Preconditions and stage 0

- The tree was clean on `game-theory-lab` at HEAD dcf9554. The status file
  showed fourteen modules "ready" and done, nothing in progress, and report
  14 committed.
- `paths.js`: "provisional" was dropped from the game-theory line only. The
  status file now records the path as a decision, confirmed by Adriano on
  26 November 2026, and the open item is gone.
- Module 14, Panel A, the source line under k + e: "an hour of
  confirmations and an hour of escrow" became "the attacker's transactions
  in k = 6 blocks, then e = 6 blocks of escrow (an hour each)", in both
  languages.
- Module 14, EN, section 5: "so she free-rides on them" became "so she
  leaves that cost to them". No check pinned that sentence. The IT keeps
  *free rider* (the table's term).

## Conventions chosen

- **Italian quotation marks: « ».** Before the review there were 4 in the
  IT lectures and 25 in `texts.js`, and no “ ” at all. English titles in the
  reading lists keep their own quotes.
- **English spelling: British, with -ize endings (Oxford).** The EN
  lectures had neighbour ×19, centre ×5, colour, analyse, signalling, and
  about 14 -ize forms against 6 -ise forms. Published titles keep their own
  spelling ("Games and Economic Behavior", "Job market signaling").
- **Italian lists of bare decimals:** separated by semicolons,
  «(0,5; 0,3; 0,2)».
- **Panels are named as the page names them:** "Simulation A" /
  "Simulazione A" (the eyebrow in `LabLecture.jsx`).
- **Closing section:** "## Next" / «## Il prossimo modulo».
- **Gender in Italian:** the miner, the players, the bidders and the
  attacker are masculine.

## Per module

Counts are changes by kind: It(alian), En(glish), Par(ity), Fa(cts),
Qu(otations), Cl(arity), Li(nks), Pa(nel texts). Most are approximate,
taken from the agents' reports. Words are counted as each self-check counts
them, on the final text without the marker. Limits are 1,400–1,700 for
01–12 and 1,500–1,800 for 13–14. Stage 2 changes are listed further below.

| No. | It | En | Par | Fa | Qu | Cl | Li | Pa | Words EN | Words IT |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | 26 | 3 | 2 | 0 | 0 | 2 | 0 | 11 | 1,626 | 1,689 |
| 02 | 36 | 7 | 2 | 1 | 0 | 3 | 1 | 4 | 1,679 | 1,689 |
| 03 | 24 | 4 | 1 | 0 | 0 | 5 | 1 | 14 | 1,641 | 1,683 |
| 04 | 40 | 8 | 4 | 0 | 0 | 9 | 0 | 11 | 1,690 | 1,691 |
| 05 | 53 | 10 | 3 | 1 | 0 | 4 | 0 | 12 | 1,687 | 1,689 |
| 06 | 30 | 8 | 6 | 0 | 0 | 6 | 0 | 14 | 1,668 | 1,690 |
| 07 | 24 | 6 | 14 | 0 | 0 | 8 | 0 | 22 | 1,628 | 1,683 |
| 08 | 34 | 6 | 8 | 1 | 0 | 6 | 1 | 13 | 1,685 | 1,687 |
| 09 | 22 | 4 | 4 | 1 | 0 | 2 | 3 | 10 | 1,543 | 1,613 |
| 10 | 34 | 4 | 5 | 0 | 0 | 7 | 0 | 6 | 1,585 | 1,645 |
| 11 | 40 | 3 | 5 | 0 | 0 | 8 | 0 | 12 | 1,600 | 1,646 |
| 12 | 54 | 10 | 10 | 0 | 0 | 12 | 1 | 22 | 1,572 | 1,648 |
| 13 | 38 | 4 | 2 | 0 | 0 | 7 | 0 | 20 | 1,768 | 1,787 |
| 14 | 24 | 7 | 8 | 1 | 1 | 8 | 0 | 12 | 1,733 | 1,787 |

Boxes in modules 06 and 09–12 are not counted. The box limit of 150–200
words in modules 02 and 04 holds: 198/200 and 198/198.

**01 What is a game?**
- IT: «I giochi due per due lusingano la dominanza» → «Nei giochi due per
  due la dominanza fa bella figura».
- IT: «La tensione è la tentazione» → «Il nodo è la tentazione».
- The 45-word Keynes sentence is split in both languages.
- The garbled observe A item 5 is rewritten ("Counting as one game the
  tables that differ only in the names of the strategies, there are 144
  games").
- "Each round" → "step" in the elimination section, so it no longer clashes
  with the guessing game's rounds.
- *For Adriano:* «pari o dispari» (the table's term) names a finger game,
  but the text describes two coins. Exercise 5's "A crowd that is random as
  a whole never wins on average" is loose.

**02 Nash equilibrium**
- Van Huyck: "from the fourth round on, the lowest effort was 1" → "within a
  few rounds the lowest effort had fallen to 1". Report 02 traces the round
  detail to Weber (2006), so the new claim is weaker than either source.
- "a cell nobody wants to leave alone" → "no player wants to leave on their
  own".
- The EN now names the reaction function.
- IT «Dominante nei payoff» → «Pareto-dominante».
- Box: "none can do it alone" → "none gains by doing it alone".
- *For Adriano:* restore "from the fourth round" if the 1990 paper confirms
  it. «salienza» has no row in the table.

**03 Mixed strategies and zero-sum games**
- The dangling "Solving the two conditions, the kicker shoots…" is
  rewritten in both languages.
- Matching pennies, "the smallest one with no equilibrium" (which
  contradicts Nash's theorem) → "with no stable cell".
- The EN now names the security level.
- Panel A's G slider printed en-US numbers on the Italian page; it now uses
  it-IT. This is a display fix, the one code change.
- *For Adriano:* the register of «sembrano paradossali» and «traslati»;
  report 03's open points (the rate 69.92, the Shoham–Leyton-Brown year).

**04 Games in time and credible commitment**
- "both its moves are perfect" → "two subgame perfect equilibria, one for
  each of its moves".
- "shares close to 1/4, 1/2 and 1/4, which are exact" → "in about 1/4, 1/2
  and 1/4 of the trees; in theory these shares are exact".
- Rubinstein: "a fraction δ of x" → "the same share x, worth δx today". δ₁
  and δ₂ are now named.
- The EN now defines leader and follower and names entry deterrence.
- IT: «chi propone / chi risponde» → «il proponente / il rispondente».
- *For Adriano:* both lectures are within 10 words of the limit.

**05 Incomplete information and signals**
- Cho–Kreps rewritten in IT. The test is "often called the intuitive
  criterion", in both languages, as report 05 softens it.
- IT single crossing, which was ungrammatical, is fixed in the lecture and
  in the panel.
- Dessein: "whenever the conflict is not too large" → "as long as", his
  abstract's wording.
- IT «cammino esatto» → «traiettoria esatta», because «cammino» is the
  network term.
- One pin is now in « ».
- *For Adriano:* Panel B's IT title «Separarsi o confondersi?» echoes the
  old term «equilibrio di confusione».

**06 Repeated games and reputation**
- Box: "a pool can tell it is being attacked, but not by whom" → "may
  notice … but not which of its miners are the infiltrators". This is
  Eyal's point as report 06 quotes it.
- IT «come senza dubbio» (which reads as "undoubtedly") → «come senza il
  dubbio».
- w is defined before it is used. The chain-store payoffs are written
  (newcomer, chain).
- The trigger rule is rewritten in both languages.
- *For Adriano:* «domanda rumorosa»; «le autorità antitrust li tengono
  d'occhio».

**07 Evolution and learning**
- The second ESS condition was imprecise. It now reads "a resident must
  earn more against a mutant than a mutant does".
- 14 parity fixes in terms, both ways.
- IT «spiraleggia» → «va a spirale».
- *Cuts.* To stay under the IT limit, the agent cut five EN-only sentences,
  "with bats and hawks" and the closing line in both languages, and the
  co-authors' first names in two citations (the reading list keeps them).
- *For Adriano:* the cuts above can be restored, with other cuts to pay for
  them. «η è…» opens a sentence with a symbol.

**08 Congestion and the price of anarchy**
- The EN gains the IT's textbook terms: Wardrop equilibrium, Pigouvian tax,
  nonatomic/atomic, potential function, best-response dynamics.
- "The bound is reached" → "cannot be improved": with ε > 0, H_k is
  approached, not reached.
- IT «Chi il pianificatore manda in alto…» → «Chi è mandato in alto ci
  rimette».
- *For Adriano:* "For a class of costs" (Roughgarden 2003) is vague.

**09 Games on networks**
- The Network Lab's `growth-mechanisms` was called "module 05". It is module
  06, fixed in four places, and the self-check's name for the link check is
  corrected too.
- «il primo modello di formazione strategica delle reti» had no source for
  "first" → «uno dei modelli fondativi», in both languages.
- The IT pairwise-stability definition is rewritten.
- "best reply" → "best response".
- *For Adriano:* «uno dei modelli fondativi» is our wording.

**10 Coalitions: how to share the pie**
- IT garment: «la seconda cede all'altra metà» → «concede alla prima la
  metà che non reclama».
- IT nucleolus rewritten («migliora il più possibile la coalizione più
  svantaggiata»).
- Characteristic function, marginal contribution, balanced game with
  Bondareva–Shapley, and bankruptcy problem are now in both languages.
- Stage 2: the box's h → α.
- *For Adriano:* «obiettare» against «contestare»; "enforced, by a court or
  by a contract"; «Torna al preset».

**11 Auctions**
- The bidder is masculine throughout the IT (it was mixed).
- The 45-word revenue-equivalence sentence is split. "to the highest value"
  → "to the bidder with the highest value".
- The all-pay link now says "the contest of module 02 with one change, that
  the highest effort always wins". Module 02 uses Tullock's share rule.
- The EN gains the ascending/descending glosses, Vickrey auction and bid
  shading.
- Two IT pins changed.
- *For Adriano:* the box's "resists manipulation by the miner"
  (Lavi–Sattath–Zohar) is strong. IT «per urgenza» stands against EN "in
  patience".

**12 Designing the rules**
- The EN now names the nine terms the IT already had in bold (incentive
  compatibility … double auction).
- Revelation principle: "Gibbard (1973) stated it for dominant strategies;
  building on his work, several authors found it independently…".
- "exceeds the cost by 25" → "by 25 or more"; "three" → "at most three".
- Box: "One reading of Bitcoin's choice: …", a hypothesis, as the Bitcoin
  rule asks.
- Observe C3 no longer implies 476.15 for the monopolistic price.
- `FigureTrade.jsx` printed "v = c dashed." in English on the IT page; it
  now has an IT string.
- *For Adriano:* F2's caption "Two out of three" against "at most three".
  The box is 339/377 words, over report 12's aim of 250–300.

**13 Mining as a game**
- IT «le fa pubblicare» (feminine miner) → «gli fa pubblicare».
- "There is a second point" → "A further point is ours, not Felten's".
  Report 13 says the remark is ours.
- r_A, r_H, R = r_A/(r_A + r_H) and T₁ are defined before they are used.
- IT Panel C: «bordate» → «con il bordo»; «politica migliore» → «politica
  ottima».
- *For Adriano:* «Di default» (or «per impostazione predefinita»).
  «vantaggio» names both the lead and Felten's «in vantaggio».

**14 Capstone: the price of security**
- IT section 3 now also says that F1 "draws the cost against A". «Il suo
  caso base» → «Il caso base di Budish».
- Parity both ways: «Rivuole i suoi soldi», Bonneau's question, the list of
  assumptions; the EN gains "specific capital".
- The race is rewritten: "the number m of blocks on her private branch
  follows a negative binomial distribution".
- IT «senza crollo del prezzo» → «senza un calo del prezzo», as the EN and
  Budish's Theorem 2.
- Budish's sentence is attributed ("he writes").
- IT panel verdicts: «il 0,87%» and «le serve» fixed.
- *For Adriano:* «una tantum»; the translated Bonneau title. `money.js`
  prints «1,00 miliardi di $» (plural with 1,00). That is code, pinned by
  two checks, and left.

## Across the lab (stage 2)

- **Terms unified:**
  - "best reply" → "best response" (04, 06, and 09 in stage 1).
  - "prisoner's dilemma" → "Prisoner's Dilemma" (06).
  - "private chain" → "private branch" (14 EN, as 13).
  - "Rock, paper, scissors" / «Sasso, carta, forbici» → "Rock-paper-scissors"
    / «Sasso-carta-forbici» (07, including Panel A's title, as 03).
  - «guidatore» → «automobilista» (07).
  - «attacco di maggioranza» → «attacco del 51%» (10, a UI string).
  - «round» → «turno» (14, stage 1).
  - «catena segreta» → «catena privata» (14, stage 1).
  - «politica migliore» → «politica ottima» (13, stage 1).
- **Panel names:** "Panel A" / «Pannello A» → "Simulation A" / «Simulazione
  A» in 06–14 and in several `texts.js`, about 103 changes per language,
  with the Italian gender fixed.
- **Closing sections:** modules 02 and 13 now use "## Next" / «## Il
  prossimo modulo».
- **Notation:** module 10's h for the hash-rate share → α. These clashes
  come from the panels and are left:
  - δ: the discount factor in 04 and 06, the spillover in 09.
  - b: four uses (05, 06, 11–12).
  - ρ: 07 and 13 mean different things.
  - v(S) against v.
  - k: several uses.
  - 14 uses Budish's A, a multiple of the honest hash rate, where 13 uses
    α, a share.
- **Reading lists:**
  - "(eds.)"; "91(2)"; «Cap.» (not «Capp.»).
  - Ausubel and Hannan entries put in the common format.
  - 14 IT: "and" → «e» between authors.
- **Italian:** about 55 decimal lists now use semicolons; curly “ ” → « » in
  four panels; module 07's «giocatrice … lei» → «giocatore … lui».
- **Index:** the 14 titles were kept and 9 summaries edited. 13 no longer
  repeats 12's "the best strategy" ("…when following the protocol does not
  pay"). Other edits: IT 12 «Regole per cui dire la verità è la strategia
  migliore», «scelte egoistiche», «chi siano gli altri», «mantenere sicuro»,
  no serial comma in 10 EN, and no comma before «e» between two plain
  members.
- **Not unified:** apostrophes. The lectures and `texts.js` use straight ',
  the UI strings and captions curly ’. Each file type is consistent.

## The Italian terms (stage 3)

One more search per term, through Italian university sources. Downloaded
PDFs were read in full text; snippets were not counted.

- **Found, term kept** (each now cited in the status table):

  | Term | Source |
  |---|---|
  | condizione di profitti nulli | Battistini, UniSi; Tor Vergata also «condizione di profitto nullo» |
  | centralità di Katz–Bonacich | Bordoli, Padova thesis |
  | gioco dei guanti | Torre, Pavia slides 2019 |
  | regola di allocazione | Bosco, UniMiB (who mostly writes «regola di assegnazione») |
  | vantaggio (di k blocchi) | Serena, UniBo thesis |
  | punto di equilibrio | Ghezzo, Padova thesis, which also writes «punti fissi» |

- **Still our choice, for Adriano**, because no Italian source was found:
  - 06: the one-shot deviation principle.
  - 07: the lizard's Italian name.
  - 08: Wardrop's principle, best-response dynamics.
  - 09: specialized equilibrium, key player, intercentrality, pairwise
    stability, connections model.
  - 10: least core (a Pisa thesis keeps the English).
  - 11: monopolistic price, unit demand.
  - 12: Myerson's lemma, virtual value, optimal auction, budget balance,
    bilateral trade, false-name bids, base fee.
  - 13: reference implementation, relative revenue, profitability
    threshold, the MDP actions.
  - 14: specialized capital (the source says «investimenti specifici»),
    sabotage, counterattack, Goldfinger attack, bribery, block subsidy,
    undercutting, mining gap.
- Balanced collection and bankruptcy problem left the open list: their
  rows already cite Fragnelli.
- No lecture changed in stage 3.

## Facts and numbers

- **No number was wrong; none was changed.**
- **Wording made weaker or more exact, from the sources in the module
  reports:**
  - 02 Van Huyck.
  - 05 Dessein.
  - 06 Eyal.
  - 08 "cannot be improved".
  - 09 "one of the founding models".
  - 12 the revelation principle's credits.
  - 13 our remark marked as ours.
  - 14 «calo», not «crollo».
- **Self-check pins changed, wording only, never a value:**
  - 05: one pin, to « ».
  - 07: one pin, IT semicolons.
  - 11: two pins.
  - 12: one pin.
  - 13: two pins.
  - Stage 2: semicolon lists in 01–06, 09 and 10.
  - 09: the name of the link check.
  - Stage 4: the marker test in all 14 checks.

## Stage 4 and the checks

- Commit 6f737bb removed the 28 first lines and nothing else in the
  lectures. The 14 checks now require that no DRAFT marker remains (they
  required it on the first line). Reverting 6f737bb puts both back.
- **Last run, on 6f737bb, one command each:**
  - `check-game-theory-01` … `14`: all passed (times in the log; the
    longest is 03, 68 s).
  - `npx vite build`: ok.
  - `check-index`: game-theory 0 failures of 76, network 0/76, complexity
    0/72.
  - `check-links`: 0/131.
  - check-module and the functional check for all 14 modules: 0 failures
    each.
  - `compare-main`: 0/144.
  - `npm run build`: exit 0.
  - `npm run check:dist`: 0/108.
- **Two slips, recorded in the log.** I twice sent several browser checks in
  one batch, against the "one at a time" rule:
  - In stage 2, the index and link checks collided: two exited 1 and two
    hung.
  - In the final run, the first eight module checks went out together and
    passed.
  - Both batches were rerun one command each, and only those runs count.
    Nothing was left running.

## Commits and git facts

- **Commits of this prompt (local only):**
  - 141e6be stage 0.
  - 25b4284, 81a25ec, 6b75eae, 9b01df1, 82519c2, 84971f4, ef11041, 6d21f47,
    38f381f, 12dd28d, ba7c26d, 97ec672, 65bc2e3, d52920e: modules 01–14.
  - 9d1a6ce across modules.
  - 5682dc3 Italian terms.
  - 6f737bb markers removed.
  - Then "Game Theory Lab review: report", with this file and the log.
- Nothing is squashed, merged or pushed, and `main` is unchanged at
  ddfed85. With the report commit, `game-theory-lab` has 54 commits that are
  not on `main`, and is missing none of main's.
- **Files changed in this prompt (dcf9554..6f737bb), by folder:**
  - `src/components/lab/game-theory/`: 63
  - `src/content/game-theory-lab/`: 28
  - `scripts/lab/`: 14 (only `check-game-theory-NN.mjs`)
  - `src/data/lab/`: 2 (`paths.js`, `game-theory-modules.json`)
  - `docs/`: 2 (the status file and the review log)
  - Nothing outside these paths. The Complexity Lab, the Network Lab,
    `config.json`, `package.json` and the nav are untouched.

## What remains for Adriano

- **The merge and the push.** Both are his decisions.
- **`CLAUDE.md` still calls `/game-theory-lab` provisional** (Labs engine
  section). It is outside this prompt's paths, so it is unchanged here.
- **The "For Adriano" points under each module above.** The main ones:
  - «pari o dispari» against a coin.
  - The first names and sentences cut in 07.
  - The F2 caption in 12.
  - The length of the box in 12.
  - The strength of the Lavi–Sattath–Zohar claim in 11.
  - The Van Huyck detail in 02.
  - Register choices: «Di default», «una tantum», «per estremizzare».
- **The notation clashes that come from the panels**, listed under stage 2.
- **The Italian terms still "our choice"**, listed under stage 3.
- **Lectures to reread first.** He can read any lecture before trusting it;
  reverting 6f737bb puts the DRAFT markers back on all 28.
