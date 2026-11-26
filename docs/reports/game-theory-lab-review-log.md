# Game Theory Lab review — working log

Prompt: `prompts.local/game-theory-lab-review.md` (editor's pass over the 28
lectures, the 14 `texts.js` and the index texts; stage 0 fixes; across the
lab; Italian terms; DRAFT markers off).

## Start

- 2026-11-26. Branch `game-theory-lab`, tree clean, HEAD dcf9554 "Game
  Theory Lab 14: report". Status file: fourteen modules "ready" and done,
  nothing in progress; `docs/reports/game-theory-lab-14.md` committed
  (`git log` lists it in dcf9554). Preconditions hold.

## Stage 0

- `src/data/lab/paths.js`: "// provisional" dropped from the game-theory
  line only (the Network Lab's line unchanged).
- Status file: the path is a decision confirmed by Adriano on 26 November
  2026 ("Decisions", "Where things are"); the "provisional path" open item
  removed. `CLAUDE.md` still calls the path provisional: not in this
  prompt's scope, left for Adriano.
- Module 14, Panel A, source line under k + e (`defaults.js`):
  "Budish's base case: an hour of confirmations and an hour of escrow" →
  "Budish's base case: the attacker's transactions in k = 6 blocks, then
  e = 6 blocks of escrow (an hour each)"; IT likewise ("le transazioni
  dell'attaccante in k = 6 blocchi, poi e = 6 blocchi di escrow (un'ora
  ciascuno)"). Matches the lecture's section 3 ("k counts the blocks in
  which the attacker places her transactions").
- Module 14, EN, section 5: "so she free-rides on them" → "so she leaves
  that cost to them". The IT keeps *free rider* (status file table). The
  self-check does not pin that sentence (its "free" test strips
  free rider / free-ride before testing, which still holds).
- `node scripts/lab/check-game-theory-14.mjs`: all checks passed (1 s).
- `npx vite build`: built (16 s).
- `node check-module.mjs game-theory capstone-the-price-of-security`: 0 failures of 56 checks (50 s).
- `node modules/game-theory-capstone-the-price-of-security.mjs`: 0 failures of 39 checks (12 s).
- Commit 141e6be "Game Theory Lab review: stage 0".

## Conventions (chosen before stage 1)

- Italian quotation marks: « » (guillemets). Counted with a Node script:
  4 « in the IT lectures and 25 in the texts.js files, against 0 curly “ ”;
  the 20 straight quotes in the IT lectures are mostly in English titles of
  the reading lists, which keep their own quotes.
- English spelling: British with -ize endings (Oxford). Counted in the EN
  lectures: neighbour 19, centre 5, colour 2, analyse 2, signalling 3 (no
  neighbor, center, color, analyze in running text); -ize forms in running
  text about 14 (maximize, randomized, specialized, generalized,
  minimization, generalization) against 6 -ise (characterise, minimise ×3,
  industrialised, apologising). Every "behavior", "signaling", "modeling",
  "program" is in a published title and stays.
- Method: one helper agent per module reads EN, IT, texts.js and the panel
  strings against a common brief (checks 1–8 of the prompt); the agents edit
  text only and run nothing; the lead runs every check, one per command,
  and commits each module on its own.
- Note for stage 4: every check-game-theory-NN.mjs requires the DRAFT
  marker on the first line; removing the markers means updating those 14
  checks too.

## Stage 1

### Module 01 `what-is-a-game`

- Files: the two lectures, `texts.js`, `DominancePanel.jsx` and
  `EliminationSteps.jsx` (UI strings only).
- Changes: Italian 26, English 3, parity 2, facts 0, quotations 0
  (none in the module), clarity 2, links 0 (`/lab/cooperation` and
  `/game-theory-lab/nash-equilibrium` exist; the next module is named
  right), panel texts 11.
- Most significant:
  - IT: "I giochi due per due lusingano la dominanza." → "Nei giochi due
    per due la dominanza fa bella figura."
  - IT atlas: "La tensione è la tentazione / … la fiducia" → "Il nodo è…";
    "coordinamento con dentro un conflitto" → "coordinamento e conflitto
    insieme".
  - EN and IT: the 45-word Keynes sentence split in two, the same way in
    both languages.
  - Observe, Panel A item 5, EN and IT: the garbled "Counted once when the
    strategies are renamed they are 144 games" → "Counting as one game the
    tables that differ only in the names of the strategies, there are 144
    games, and 78 if…" (IT likewise).
  - EN: the elimination section's "Each round / A third round" → "step"
    (no clash with the guessing game's rounds; IT already "passo"); "best
    reply" → "best response" in the solutions of exercises 3 and 4;
    "organisers" → "organizers".
- Facts and pins: none changed.
- Words (self-check's count, text before `<!-- simulation -->`): EN 1,634,
  IT 1,697 (limits 1,400–1,700; IT now at the top).
- For Adriano: "pari o dispari" (status-file term) names a finger game,
  while the text describes two coins; confirm or reword. Exercise 5's "A
  crowd that is random as a whole never wins on average" is a little loose.
  Panel A header "Anche giocatori scambiati" kept short for 375 px.
- Cross-module: `games.js` comments say "best reply" (comments only, left).
  Report 01's terms table is historical and differs from the status file;
  left. The IT reading list writes "Cap." and "e" between authors: to be
  compared across modules in stage 2.
- `node scripts/lab/check-game-theory-01.mjs`: all checks passed (15 s).
- `npx vite build`: built (16 s).
- `node check-module.mjs game-theory what-is-a-game`: 0 failures of 56 (52 s).
- `node modules/game-theory-what-is-a-game.mjs`: 0 failures of 32 (14 s).
- Commit 25b4284 "Game Theory Lab review: module 01".

### Module 02 `nash-equilibrium`

- Files: the two lectures, `texts.js`; UI strings in `FigureStagHunt.jsx`,
  `EquilibriaPanel.jsx`, `ContestPanel.jsx`. Self-check unchanged.
- Changes: Italian about 36 (26 lecture, 10 texts.js and UI), English 7,
  parity 2, facts 1 (a softening), quotations 0 (none in the module),
  clarity 3, links 1, panel texts 4.
- Most significant:
  - Van Huyck: "from the fourth round on, the lowest effort was 1 in every
    group" → "within a few rounds the lowest effort had fallen to 1 in every
    group" (IT "in pochi turni…"). Report 02 says the round detail came
    from Weber (2006), not from the 1990 paper; the new wording is weaker
    than either source. No pin.
  - IT stag hunt: "Entrambi al cervo è un equilibrio, e lo è anche entrambi
    alla lepre" → "Sono equilibri sia la coppia di scelte (cervo, cervo) sia
    (lepre, lepre)".
  - EN/IT: "a cell … that nobody wants to leave alone" (misreadable as "not
    disturb") → "no player wants to leave on their own" / "da cui nessuno
    vuole spostarsi da solo".
  - Parity: the EN now names the **reaction function**, as the IT did.
  - IT UI: FigureStagHunt "Dominante nei payoff" → "Pareto-dominante" (the
    table's term); IT "evidenza" (salience) → "salienza"; Bertrand "chiedano
    il costo" → "vendano al costo".
  - Box: "none can do it alone" → "none gains by doing it alone" (any miner
    can halve its hash rate; it does not pay).
  - Links: "the badminton hall of module 01" → "the badminton matches"
    (module 01 speaks of matches).
- Facts and pins: no number changed; no pin changed.
- Words: lecture EN 1,689, IT 1,698 (limits 1,400–1,700); box EN 198,
  IT 200 (150–200).
- For Adriano: Van Huyck's "from the fourth round on" can return if the
  1990 paper confirms it; "salienza" has no row in the terms table; IT
  ContestPanel headers "Sforzo, ciascuno" etc. are clipped but kept for
  width; exercise 5 keeps «Miner» as the preset's name.
- Cross-module: report 02's terms list is stale (the status table rules).
  Lectures say "Simulation A", several texts.js say "Panel A": stage 2.
- `node scripts/lab/check-game-theory-02.mjs`: all checks passed (22 s).
- `npx vite build`: built (16 s).
- `node check-module.mjs game-theory nash-equilibrium`: 0 failures of 56 (48 s).
- `node modules/game-theory-nash-equilibrium.mjs`: 0 failures of 49 (33 s).
- Commit 81a25ec "Game Theory Lab review: module 02" (the status file's
  progress line missed that commit, a path slip; it is in module 03's).

### Module 03 `mixed-strategies-zero-sum`

- Files: the two lectures, `texts.js`; `FigureSquare.jsx` (one IT label),
  `AllEquilibriaPanel.jsx` (number format of the G slider, see below).
- Changes: Italian 24 (lecture), English 4, parity 1, facts 0, quotations
  0 (none in the module), clarity 5 per language, links 1 per language,
  panel texts 14 (12 texts.js, 2 UI).
- Most significant:
  - EN/IT: the dangling "Solving the two conditions, the kicker shoots…" /
    «Risolvendo le due condizioni, il rigorista tira…» → "Solving the two
    conditions gives the mixes: … The kick then scores…" / «Dalle due
    condizioni si ricava che il rigorista tira a S … Il rigore va allora a
    segno nel 79,6% dei casi».
  - Clarity: matching pennies "the smallest one with no equilibrium" (which
    contradicts Nash's theorem later in the module) → "…with no stable
    cell" / «…senza cella stabile».
  - Parity: the EN now names the **security level** as the IT's «payoff di
    sicurezza» (status table).
  - Calque: "Here the rule does not isolate one player" → "Unlike in
    exercise 1, neither mix stays put"; the 45-word sentence after it split.
  - Links: "Module 07" is now a link to `/game-theory-lab/evolution-and-learning`.
  - texts.js IT: quoted labels in « »; «le frequenze si fermano» →
    «si assestano» (the table's "settle").
  - Panel A's G slider printed en-US numbers on the Italian page ("20,000"
    against the observe text's «20.000»); it now formats with it-IT, as
    Panel B already does. Display only, the one code touch.
- Facts and pins: none changed.
- Words: EN 1,649, IT 1,691 (limits 1,400–1,700).
- For Adriano: register of «Le conseguenze sembrano paradossali» (was
  «suonano strane») and of «traslati»; the lecture addresses the reader as
  «voi», texts.js as «tu» (kept); report 03's open points stay open (the
  rate 69.92 not confirmed in the paper; Shoham and Leyton-Brown 2008 or
  2009).
- Cross-module: "Panel" against "Simulation" (stage 2); report 03's terms
  list is stale.
- `node scripts/lab/check-game-theory-03.mjs`: all checks passed (69 s).
- `node check-module.mjs game-theory mixed-strategies-zero-sum`: 0 failures
  of 56 (48 s), on the build made for module 02 (after module 03's edits).
- `node modules/game-theory-mixed-strategies-zero-sum.mjs`: 0 failures of
  39 (22 s).
- Commit 6b75eae "Game Theory Lab review: module 03".

### Module 04 `sequential-games-commitment`

- Files: the two lectures, `texts.js`; UI strings in `TreePanel.jsx`,
  `LeaderPanel.jsx`, `FigureEntry.jsx`, `UltimatumPanel.jsx`.
- Changes: Italian about 40 (28 lecture, 10 texts.js, 7 UI), English about
  8, parity 4, facts 0, quotations 0, clarity 9, links 0 (all slugs
  checked), panel texts 11 (also counted above).
- Most significant:
  - IT: straight quotes → « » in the lecture (the strategy example, both
    threats of the box), in exercises 2 and 6 and in Panel B's «insieme».
  - Parity and order of definitions: EN and IT say the game has perfect
    information before "subgame" relies on it; the EN now defines
    **leader** and **follower** (only the IT did) and says "this is entry
    deterrence", as the IT.
  - Wrong or unclear: "has a pure equilibrium … the best of them" → "has
    pure equilibria … the one it likes best"; "in shares close to 1/4, 1/2
    and 1/4, which are exact" → "in about 1/4, 1/2 and 1/4 of the trees,
    and in theory these shares are exact"; Rubinstein "a fraction δ of the
    proposer's own share x" → "the same share x, worth δx today"; δ₁ and δ₂
    named, the long sentence split.
  - texts.js EN/IT: "both its moves are perfect" (moves are not perfect,
    equilibria are) → "there are two subgame perfect equilibria, one for
    each of its moves".
  - IT calques: «si srotola» → «procede a catena»; «Rifiutare denaro non è
    induzione a ritroso» → «contraddice l'induzione a ritroso»; «chi
    risponde / chi propone» → «il rispondente / il proponente» (table).
  - EN: "industrialised" → "industrialized", "maximises" → "maximizes".
- Facts and pins: none changed. The browser check pins the EN "credible
  without help" in `FigureEntry.jsx`: kept; only the IT changed («senza
  aiuti» → «anche senza impegno»).
- Words: lecture EN 1,698, IT 1,699 (limits 1,400–1,700; additions offset
  by cuts); box EN 198, IT 198 (150–200).
- For Adriano: both lectures sit at the top of the limit; the IT box keeps
  «Servono i due blocchi successivi» without a subject (word limit) and
  "Feather fork" (table); "Nel confronto di Henrich e colleghi (2001)"
  kept (their summary of earlier studies).
- Cross-module: "Panel" against "Simulation"; index.js captions and UI
  strings use the curly ’, the lectures and texts.js the straight ': stage
  2. Report 04's terms table is stale.
- `node scripts/lab/check-game-theory-04.mjs`: all checks passed (9 s).
- `npx vite build`: built (16 s).
- `node check-module.mjs game-theory sequential-games-commitment`: 0
  failures of 56 (50 s).
- `node modules/game-theory-sequential-games-commitment.mjs`: 0 failures
  of 45 (19 s).
- Commit 9b01df1 "Game Theory Lab review: module 04".

### Module 05 `incomplete-information-signalling`

- Files: the two lectures, `texts.js`; UI strings in `LemonsPanel.jsx` and
  `SignalPanel.jsx`; `scripts/lab/check-game-theory-05.mjs` (one pin).
- Changes: Italian about 53 (38 lecture, 15 texts.js and UI), English 10
  (4 × "realised" → "realized"), parity 3, facts 1 (a softening),
  quotations 0 (Akerlof and Dessein are paraphrased), clarity 4, links 0,
  panel texts about 12 (within the counts above).
- Most significant:
  - Cho–Kreps, IT: «Se un livello è tale che il tipo basso non potrebbe
    mai guadagnarci, nemmeno pagato 2…» → «Se da un certo livello il tipo
    basso non può mai guadagnare, nemmeno se pagato 2, mentre il tipo alto
    sì, …»; «noto come» → «spesso chiamato **criterio intuitivo**» (report
    05's softening); EN's misplaced "these equilibria, often called the
    intuitive criterion" → "a test, often called the **intuitive
    criterion**, that removes…".
  - Single crossing, IT (lecture and `SignalPanel.jsx`): «Senza, ciò che
    il tipo alto può permettersi se lo può permettere anche il basso.» →
    «Altrimenti, tutto ciò che il tipo alto può permettersi può
    permetterselo anche il tipo basso.»
  - Parity: the IT had lost "to make the point sharp" («Supponiamo, per
    estremizzare, che…»); «chi li presenta sia basso» (can read "short") →
    «sia di tipo basso».
  - Grafen, IT: «si attribuisce di solito di avergli dato una base
    formale» → «Alan Grafen (1990) gli avrebbe dato una base formale: una
    lettura diffusa, ma poi discussa» (softening kept).
  - Fact (softening): Dessein, EN "delegation beats advice whenever the
    conflict is not too large" → "as long as the conflict is not too
    large", his abstract's wording as recorded in report 05; IT «purché».
  - IT: «cammino esatto» (price path) → «traiettoria esatta» («cammino» is
    the network term); «figura F1» → «Figura F1»; «il confronto con il
    silenzio» → «con il caso senza parole» (table).
- Pin changed: check "lecture: cheap talk", IT `"sotto 0,3" e "sopra 0,3"`
  → `«sotto 0,3» e «sopra 0,3»` (the « » convention).
- Words: EN 1,695, IT 1,697 (limits 1,400–1,700).
- For Adriano: «per estremizzare»; Panel B's IT title «Separarsi o
  confondersi?» echoes the old «equilibrio di confusione» (table now
  «equilibrio *pooling*»), kept for width; exercise 6 keeps the pinned
  «Simulazione A, esatto».
- Cross-module: the IT heading «Il prossimo modulo» against EN "Next"; EN
  running text uses straight quotes (pinned); comments in `lemons.js`,
  `types.js` say "realised" (comments, left).
- `node scripts/lab/check-game-theory-05.mjs`: all checks passed (2 s).
- `npx vite build`: built (15 s).
- `node check-module.mjs game-theory incomplete-information-signalling`: 0
  failures of 56 (48 s).
- `node modules/game-theory-incomplete-information-signalling.mjs`: 0
  failures of 39 (9 s).

- Commit 82519c2 "Game Theory Lab review: module 05".

### Module 06 `repeated-games-reputation`

- Files: the two lectures, `texts.js`; `ReputationPanel.jsx` (one string,
  EN and IT), `WarsPanel.jsx` (one IT string).
- Changes: Italian about 30, English 8, parity 6, facts 0 numbers (one
  claim of the box softened), quotations 0, clarity 6, links 0, panel
  texts 14.
- Most significant:
  - Box, EN and IT: "a pool can tell it is being attacked, but not by whom"
    → "a pool may notice that it is being attacked, but not which of its
    miners are the infiltrators" (as report 06 quotes Eyal: "which of its
    registered miners are the perpetrators"); "an unspoken agreement" →
    "an agreement, perhaps unspoken" (Eyal: "implicit or explicit").
  - IT ambiguity: «come senza dubbio» (reads as "undoubtedly") → «come
    senza il dubbio» in observe C, exercise 6 and Panel C's readout; EN
    "without the doubt".
  - Clarity: w defined before use ("Let w be a fought newcomer's payoff
    (−1 here) and b = 2/(2 − w)…"); chain-store payoffs "written
    (newcomer, chain)", as module 05.
  - Trigger rule rewritten: "…a price war (Cournot play) breaks out for L
    rounds, and then the cartel resumes" / «scatta per L turni una guerra
    dei prezzi alla Cournot, poi si torna al cartello».
  - Parity, added to the EN: "discount factor", **imperfect monitoring**,
    **chain-store paradox**, bold **weak**.
  - IT: «è cattivo per entrambi» → «svantaggioso per entrambi»; «dove
    mescola» → «dove gioca una strategia mista»; «per il pareggio» → «a
    parità di payoff»; decimal lists separated by semicolons.
  - EN: "apologising" → "apologizing", "maximise" → "maximize".
- Facts and pins: no number changed; no pin changed.
- Words (box not counted): EN 1,676, IT 1,698 (limits 1,400–1,700); boxes
  EN 282, IT 324 (not limited).
- For Adriano: «domanda rumorosa» kept (the lab's «rumore»); register of
  «le autorità antitrust li tengono d'occhio»; Tit for Tat roman in IT (a
  strategy's name).
- Cross-module: the EN box mixes tenses (Eyal "notes"/"observed"); decimal
  lists with plain commas in other IT modules; "senza dubbio" elsewhere; a
  comment in `minersdilemma.js` says "maximise" (code comment, left).
- `node scripts/lab/check-game-theory-06.mjs`: all checks passed (1 s).
- `npx vite build`: the build made for module 05 (after module 06's edits).
- `node check-module.mjs game-theory repeated-games-reputation`: 0 failures of 60 (57 s).
- `node modules/game-theory-repeated-games-reputation.mjs`: 0 failures of 41 (8 s).
- Commit 84971f4 "Game Theory Lab review: module 06".

### Module 07 `evolution-and-learning`

- Files: the two lectures, `texts.js`; UI strings in `SimplexPanel.jsx`
  (2 IT), `MoranPanel.jsx` (the rhoB label EN/IT, an IT note),
  `HedgePanel.jsx` (2 IT), `FigureTraffic.jsx` (an IT note);
  `scripts/lab/check-game-theory-07.mjs` (one pin).
- Changes (approximate): Italian 24, English 6, parity 14, facts 0,
  quotations 0 (none in the module), clarity 8, links 0, panel texts 22.
- Most significant:
  - The second ESS condition was imprecise: "the residents must do better
    in the rare meetings between mutants" → "a resident must earn more
    against a mutant than a mutant does" (IT «contro un mutante un
    residente deve guadagnare più di un mutante»).
  - Parity of terms: the EN now has bistability, Moran process, neutral
    drift, evolutionary game theory and *Uta stansburiana*, as the IT; the
    IT gained «come mostra la figura», «non quelli degli altri», «e andare
    dritto gli conviene», as the EN.
  - IT: «spiraleggia» → «va a spirale / si allontana a spirale» (lecture,
    observe, Panel A readouts); «un mutante solo / una C sola» → «un
    singolo mutante / un singolo C»; «Scriviamo u(x, y) per ciò che…» →
    «Indichiamo con u(x, y) il payoff che…»; Panel B observe «chi viene
    sostituito cerchiato più spesso» (ambiguous) → «un anello più marcato».
  - Long sentences split in both languages (Moran model, Hedge's rule, the
    lizard, Kandori et al., swap regret).
  - IT number triples with semicolons: «(0,5; 0,3; 0,2)» (three times),
    «(0,1; 0,85; 0,05)».
  - Cut for the IT word limit: EN-only sentences ("Now let the shares
    move", "The rest points … closely related", "Three strategies are
    enough for something new", "Chance can carry a worse strategy to the
    top", "nor whether they are learning too"); in both languages "with
    bats and hawks" and the closing "Blind processes land on…"; the
    co-authors' first names of Nowak, Sasaki, Taylor and Fudenberg and of
    Kandori, Mailath, Rob and Young (full names stay in the reading list).
- Pin changed: observe Panel A `'(0.1, 0.85, 0.05)'` →
  `['(0.1, 0.85, 0.05)', '(0,1; 0,85; 0,05)']` (EN unchanged).
- Facts: none changed.
- Words: EN 1,638, IT 1,693 (limits 1,400–1,700).
- For Adriano: the IT learner is «una sola giocatrice … lei» (the only
  lecture with «giocatrice»; kept); the first names dropped for the word
  limit can return with other cuts; «η è il tasso di apprendimento» opens
  a sentence with a symbol; «pari o dispari» (as module 01).
- Cross-module: panels write x₁x₂x₃ while the lecture writes x_R x_P x_S
  (IT x_S x_C x_F), bridged in observe item 1 (the browser check tests the
  readouts); «Il prossimo modulo» against "Next".
- `node scripts/lab/check-game-theory-07.mjs`: all checks passed (1 s).
- `npx vite build`: the build made for module 05 (after module 07's edits).
- `node check-module.mjs game-theory evolution-and-learning`: 0 failures
  of 68 (71 s).
- `node modules/game-theory-evolution-and-learning.mjs`: 0 failures of 41 (11 s).
- Commit ef11041 "Game Theory Lab review: module 07".

### Module 08 `congestion-price-of-anarchy`

- Files: the two lectures, `texts.js`; `ParallelPanel.jsx` (one IT label).
- Changes: Italian about 34 (24 lecture, 10 texts.js), English 6, parity
  8, facts 1 (a precision, no number changed), quotations 0, clarity 6,
  links 1, panel texts 13.
- Most significant:
  - Parity, EN brought up to the IT's textbook terms: "This is the
    **Wardrop equilibrium**", "the **Pigouvian tax**", **nonatomic** /
    **atomic**, Φ the **potential function**, **best-response dynamics**;
    flow, toll, harmonic number in bold as in the IT. IT «vanno molto
    meglio» → «vanno molto meglio del caso peggiore», as the EN.
  - Precision: "The bound is reached" / «Il limite viene raggiunto» → "The
    bound cannot be improved" / «Il limite non si può migliorare» (with
    ε > 0 the hub's ratio is H_k/(1 + ε): approached, not reached).
  - IT: «Chi il pianificatore manda in alto sta peggio degli egoisti» →
    «Chi è mandato in alto ci rimette»; «Sia f_e il flusso sulla strada e
    e c_e» → «Indichiamo con f_e il flusso sulla strada e, con c_e»; «non
    può girare in tondo» → «non può entrare in un ciclo»; «chiamarono
    questi giochi giochi potenziali» → «chiamarono **giochi potenziali**
    questi giochi».
  - Clarity: "costs of degree p" → "polynomial costs of degree p"; "the
    4/3 of the drop-sized drivers" / «degli automobilisti grandi come
    gocce» → "of the nonatomic game" / «del gioco non atomico» (lecture and
    observe B 5); long sentences split.
  - Next: "[Module 09, Games on networks]" / «[Modulo 09, Giochi su
    reti]»; "her neighbours" → "his neighbours" (the lecture uses he/his).
    Cut for the word limit: "Selfishness costs no more than doubling the
    demand." (EN and IT).
  - IT label: «Rapporto più grande trovato» → «Rapporto massimo trovato»
    (shorter).
- Facts and pins: no number changed; no pin changed.
- Words: EN 1,693, IT 1,695 (limits 1,400–1,700).
- For Adriano: "For a class of costs" (Roughgarden 2003) is vague (the
  paper's condition, unchecked, is a class containing the constants);
  «Chi è mandato in alto ci rimette» shorter than the EN; «Nessuno è
  malintenzionato o confuso».
- Cross-module: the IT reading list uses «Cap.», «Lezioni», «(a cura di)»,
  «versione su rivista»; the "Next" line with a title differs from module
  01's "[Module 02]".
- `node scripts/lab/check-game-theory-08.mjs`: all checks passed (1 s).
- `npx vite build`: the build made for module 05 (after module 08's edits).
- `node check-module.mjs game-theory congestion-price-of-anarchy`: 0 failures of 56 (50 s).
- `node modules/game-theory-congestion-price-of-anarchy.mjs`: 0 failures of 43 (12 s).
- Commit 6d21f47 "Game Theory Lab review: module 08".

### Module 09 `games-on-networks`

- Files: the two lectures, `texts.js`; UI strings in `FigureStar.jsx`,
  `PublicGoodsPanel.jsx`, `KeyPlayerPanel.jsx`, `FormationPanel.jsx`;
  `scripts/lab/check-game-theory-09.mjs` (the name of one check, by the
  lead, see below).
- Changes: Italian about 22, English 4, parity 4, facts 1 (a softening),
  quotations 0, clarity 2, links 3 per language, panel texts 10.
- Most significant:
  - Links: the Network Lab's `/network-lab/growth-mechanisms` was called
    "module 05"; `network-modules.json` numbers it 06 (05 is
    heavy-tails-done-right). Fixed in four places (lecture and reading
    list, EN and IT); the URL was right. The lead renamed the self-check's
    link check accordingly ("modules 03, 05 and 13" → "03, 06 and 13"; a
    name, not a pin).
  - Fact (softening): «il primo modello di formazione strategica delle
    reti» (no source for "first" in report 09) → «uno dei modelli fondativi
    della formazione strategica delle reti», EN likewise.
  - IT pairwise stability: «nessuna coppia di giocatori guadagnerebbe,
    entrambi e almeno uno strettamente, aggiungendo…» → «se nessuna coppia
    di giocatori ha interesse ad aggiungerne uno tra loro, cioè a farlo
    senza che nessuno dei due ci perda e con almeno uno che guadagna
    strettamente».
  - EN "best reply/replies" → "best response(s)" in the lecture and
    exercise 1 (the module's and the table's term).
  - IT calques: «guarda i negozi» → «tiene d'occhio»; «le formule
    esplodono» → «divergono»; possessives dropped («nel suo modulo 03»);
    «λ_max l'autovalore» → «dove λ_max è».
  - Parity: the EN now names **games on networks**, **strategic network
    formation**, "payment channels" and bold "routing fees", as the IT.
  - texts.js: "The more active player is the smaller loss." → "Removing
    the more active player costs less." (IT likewise).
- Facts and pins: no number changed; no pin changed.
- Words (box not counted): EN 1,551, IT 1,621 (limits 1,400–1,700).
- For Adriano: «uno dei modelli fondativi» is our wording; «partner» in
  roman in the IT.
- Cross-module: grep other modules for Network Lab numbers; «Il prossimo
  modulo» against "Next"; curly “ ” in IT UI strings elsewhere.
- `node scripts/lab/check-game-theory-09.mjs`: all checks passed (1 s).
- `npx vite build`: built (15 s).
- `node check-module.mjs game-theory games-on-networks`: 0 failures of 60 (55 s).
- `node modules/game-theory-games-on-networks.mjs`: 0 failures of 42 (17 s).
- Commit 38f381f "Game Theory Lab review: module 09".

### Module 10 `coalitions-sharing`

- Files: the two lectures, `texts.js`, `index.js` (IT caption of F1); UI
  strings in `CoalitionPanel.jsx`, `EstatePanel.jsx`, `VotingPanel.jsx`.
  Self-check unchanged.
- Changes (approximate): Italian 34 (19 lecture, 11 texts.js, 4 UI),
  English 4, parity 5, facts 0, quotations 0, clarity 7, links 0, panel
  texts 6 (within the counts above).
- Most significant:
  - IT garment: «la seconda cede all'altra metà» (ambiguous) → «la seconda
    concede alla prima la metà che non reclama»; EN "concedes the other
    half to the first" → "concedes to the first the half she does not
    claim".
  - IT nucleolus: «rende la coalizione trattata peggio il meglio possibile,
    poi la seconda peggiore» → «migliora il più possibile la coalizione più
    svantaggiata, poi la seconda più svantaggiata».
  - Parity: characteristic function, marginal contribution, balanced game
    with the Bondareva–Shapley theorem and bankruptcy problem were only in
    the IT: now in both. Balancedness: the core is nonempty exactly when
    the game is **balanced**, then a separate sentence defines it. The
    bankruptcy problem moves to the Aumann–Maschler sentence in both.
  - IT calques: «sottoquotare» → «praticare … un prezzo più basso»;
    «passarsi uno a uno» → «trasferirsi l'un l'altro alla pari»; «caso da
    manuale» → «caso di scuola»; «la quota degli ordini» → «la frazione
    degli ordini» (quota is the voting quota); «un pool non è i suoi
    miner» → «non coincide con i suoi miner»; «uguali somme / perdite» →
    «somme uguali / perdite uguali» (Panel C's labels).
  - EN: "characterise" → "characterize"; "normalised" → "normalized" (two
    VotingPanel strings); "weighted vote" → "weighted voting game"
    (table); "Lloyd Shapley" named in full at first mention.
- Facts and pins: none changed; report 10's softenings kept.
- Words (box not counted): EN 1,593, IT 1,653 (limits 1,400–1,700); box
  EN 335, IT 346 (not limited).
- For Adriano: «obiettare» (F1, exercise 2's solution) against
  «contestare» (lecture, exercise 2's statement): choose one; "enforced,
  by a court or by a contract" (a contract does not enforce); «Torna al
  preset» keeps "preset"; "glove market" in the EN lecture against the
  buttons' "Gloves".
- Cross-module: -ise spellings in code comments only (left).
- `node scripts/lab/check-game-theory-10.mjs`: all checks passed (1 s).
- `npx vite build`: the build made for module 09 (after module 10's edits).
- `node check-module.mjs game-theory coalitions-sharing`: 0 failures of 60 (59 s).
- `node modules/game-theory-coalitions-sharing.mjs`: 0 failures of 36 (14 s).
- Commit 12dd28d "Game Theory Lab review: module 10".

### Module 11 `auctions`

- Files: the two lectures, `texts.js`, `index.js` (one IT caption); UI
  strings in `BlockPanel.jsx`, `CursePanel.jsx`, `FigureTruth.jsx`;
  `scripts/lab/check-game-theory-11.mjs` (two pins).
- Changes (approximate): Italian 40, English 3, parity 5, facts 0,
  quotations 0 (none in the module), clarity 8, links 0 (05, 02, 12
  correct), panel texts 12.
- Most significant:
  - IT gender of the bidder, mixed before, now masculine throughout
    («un'offerente» → «un offerente», «per lei» → «per sé», «l'ultima
    rivale» → «l'ultimo rivale», «L'altra offre» → «L'altro offre»; the
    same in observe B 5 and exercise 2).
  - IT calques: «prendevano le regole di un gioco come date» → «davano per
    date le regole di un gioco»; «sono gli altri travestiti» → «sono gli
    altri due sotto mentite spoglie»; «il primo offerente che chiama» → «che
    si fa avanti»; «vince l'offerta più alta, che paga il proprio importo»
    → «vince chi ha fatto l'offerta più alta, e paga la propria offerta».
  - Revenue equivalence: the 45-word sentence split in both languages;
    "to the highest value" → "to the bidder with the highest value".
  - Parity: EN gains the "(an ascending / descending auction)" glosses,
    "often called the Vickrey auction" and "which is called **bid
    shading**", as the IT. Both: the all-pay link now reads "the contest of
    module 02 with one change, that the highest effort always wins"
    (module 02's contest is Tullock's share rule; the old wording misled).
  - Panels: BlockPanel IT “paghi la tua offerta” → «paghi la tua offerta»;
    FigureTruth IT «b = v è un'offerta migliore» → «è tra le offerte
    migliori» (three strings); EN "maximise" → "maximize".
- Pins changed: IT lecture `'nessuna vendita una volta su quattro'` →
  `'resta invenduto una volta su quattro'`; exercise 5's IT expectation now
  "−3,33; −6,67 e −8,18" (semicolons). EN pins unchanged.
- Facts: none changed.
- Words (box not counted): EN 1,608, IT 1,654 (limits 1,400–1,700); box
  EN 315, IT 344. No sentence or first name dropped.
- For Adriano: «Nell'esempio guida»; the box's "resists manipulation by
  the miner" (Lavi–Sattath–Zohar) is strong, worth a look against the
  paper; «orologio» kept for the Dutch clock; IT «per dimensione e per
  urgenza» against EN "in patience".
- Cross-module: module 13's IT heading «## Prossimo modulo» against «## Il
  prossimo modulo» elsewhere; decimals alternating with words keep commas.
- `node scripts/lab/check-game-theory-11.mjs`: all checks passed (15 s).
- `npx vite build`: the build made for module 09 (after module 11's edits).
- `node check-module.mjs game-theory auctions`: 0 failures of 60 (54 s).
- `node modules/game-theory-auctions.mjs`: 0 failures of 29 (15 s).
- Commit ba7c26d "Game Theory Lab review: module 11".

### Module 12 `mechanism-design`

- Files: the two lectures (the IT reworked sentence by sentence throughout,
  structure, figures, box and markers kept), `texts.js`; UI strings in
  `TruthPanel.jsx`, `FigureArea.jsx`, `FigureTrade.jsx`, `VcgPanel.jsx`,
  `CheatPanel.jsx`; `scripts/lab/check-game-theory-12.mjs` (one pin).
- Changes (approximate): Italian 54 (38 lecture, 8 texts.js, 8 UI),
  English 10, parity 10, facts 0, quotations 0, clarity 12, links 1, panel
  texts 22 (within the counts above).
- Most significant:
  - Parity of terms: the EN now names incentive compatibility, dominant
    strategy, GSP, optimal auction, false-name bids, bilateral trade,
    individual rationality, budget balance and double auction, as the IT.
  - Revelation principle, both languages: "Gibbard (1973) stated it for
    dominant strategies; building on his work, several authors found it
    independently at the end of the 1970s for Bayesian equilibrium, among
    them…" (report 12's softening kept).
  - Accuracy: optimal auction "values drawn independently", "when φ rises
    with v"; "as module 11 found by computation" → "the best reserve
    already met in module 11" (module 11 states it, citing Myerson);
    "exceeds the cost by 25" → "by 25 or more" (trade when v ≥ c + 25); "a
    rule can have three" → "at most three"; "the area to the right of h" →
    "the area under the step, b − h"; long sentences split (GSP,
    Myerson–Satterthwaite, Babaioff, Panel C's numbers).
  - IT: «La Figura F2 mette i numeri» → «lo traduce in numeri»;
    «esattamente quando» → «se e solo se»; «Passare le transazioni» →
    «Inoltrare»; the bidder masculine throughout (Panel B's «senza di
    lei/con lei» → «lui», exercise 4, exercise 5 «un'offerente» → «un
    offerente»).
  - Box: "Bitcoin keeps pay your bid…" → "One reading of Bitcoin's choice:
    …" (a hypothesis, as the Bitcoin rule asks); EIP-1559 passes the three
    "in Roughgarden's analysis". Observe C3 no longer suggests 476.15 for
    the monopolistic price too.
  - UI: `FigureTrade.jsx` had "v = c dashed." hard-coded in English on the
    IT page; a `diag` string added («in tratteggio v = c»), the one JSX
    change beyond editing a string. "H, the lottery's weight of the
    others" → "H, the others' weight in the lottery".
  - Next names module 13 with its title.
- Pin changed (the box sentence split): `'with room for all 20, 0 against
  about 579'` → `'room for all 20 users the honest miner earns 0, and the
  cheating one about 579'` (IT likewise).
- Facts: none changed.
- Words (box not counted): EN 1,580, IT 1,656 (limits 1,400–1,700); box
  EN 341, IT 379 (not limited; report 12 aimed at 250–300).
- For Adriano: F2's caption "Two out of three" / «Due su tre» against "at
  most three" (kept); the box's length; passato remoto and prossimo side
  by side; «orologi d'asta», «pacchetto di oggetti» (no source); the
  table's open calques of module 12.
- Cross-module: «lei» for the bidder in other modules' panels; the next
  module's title in quotes here.
- `node scripts/lab/check-game-theory-12.mjs`: all checks passed (24 s).
- `npx vite build`: built (15 s).
- `node check-module.mjs game-theory mechanism-design`: 0 failures of 56 (48 s).
- `node modules/game-theory-mechanism-design.mjs`: 0 failures of 29 (12 s).
- Commit 97ec672 "Game Theory Lab review: module 12".

### Module 13 `mining-as-a-game`

- Files: the two lectures, `texts.js`, `index.js` (IT caption of F1); UI
  strings in `BestPanel.jsx`, `FigureChain.jsx`, `RacePanel.jsx`,
  `DifficultyPanel.jsx`; `scripts/lab/check-game-theory-13.mjs` (two pins).
- Changes (approximate): Italian 38, English 4, parity 2, facts 0,
  quotations 0, clarity 7, links 0 (all slugs valid), panel texts 20 (14
  texts.js, 6 UI).
- Most significant:
  - IT gender, SM1's fourth rule: «ogni blocco degli altri le fa
    pubblicare» → «gli fa pubblicare» (the miner is masculine).
  - Our remark marked as ours: "There is a second point. A share above α
    makes…" → "A further point is ours, not Felten's: a share above α
    makes…" (IT «Un'osservazione nostra, non di Felten: …»); report 13
    says the remark is ours.
  - Terms defined before use: r_A, r_H and R = r_A/(r_A + r_H) given in
    the text (as `selfish.js`, R = rA/G); T₁ defined before the T_even
    formula ("T₁ = 14/G is the day of the first adjustment").
  - IT calques: «dato che gli altri seguono il protocollo» → «se gli altri
    seguono il protocollo»; «sulla fine della catena più lunga valida» →
    «sull'ultimo blocco della **catena più lunga** tra quelle valide».
  - Panel C IT labels: «bordate» (also "broadsides") → «con il bordo»;
    «politica migliore» → «politica ottima» (the lecture's term); «adopt:
    abbandona il suo ramo» → «abbandona la sua catena».
  - IT «Prossimo modulo»: «Il [modulo 14](…), il *capstone*» (was «il
    progetto finale»); «Per default» → «Di default» (four times).
- Pins changed: IT lecture "the chain and the threshold": «…(γ = 1/2), e
  zero…» → «…(γ = 1/2) e zero…» (comma before «e» removed); exercise 3's
  IT template with semicolons: «0,4843 ± 0,0013; 5,89 e 23,65; 70,46».
- Facts: none changed.
- Words: EN 1,776, IT 1,794 (limits 1,500–1,800). Clarity additions paid
  by short cuts («estenderla a propria volta» → «estenderla», «sopra un
  certo minimo» → «sopra un minimo»…); no sentence or first name dropped.
- For Adriano: «Di default» (or «per impostazione predefinita»); module 14
  called *capstone*; «vantaggio» both the private lead and Felten's «in
  vantaggio»; observe lists write wait / adopt / override in roman.
- Cross-module: closing headings differ ("Next", "What comes next",
  «Il prossimo modulo», «Prossimo modulo»): stage 2.
- `node scripts/lab/check-game-theory-13.mjs`: all checks passed (16 s).
- `npx vite build`: the build made for module 12 (after module 13's edits).
- `node check-module.mjs game-theory mining-as-a-game`: 0 failures of 56 (48 s).
- `node modules/game-theory-mining-as-a-game.mjs`: 0 failures of 32 (10 s).
- Commit 65bc2e3 "Game Theory Lab review: module 13".

### Module 14 `capstone-the-price-of-security`

- Files: the two lectures, `texts.js`; UI strings in `attack.jsx`,
  `FigureFlow.jsx`, `FigureClock.jsx`, `FeesPanel.jsx`, `defaults.js`.
  Stage 0's k + e line and Auer sentence kept (the latter split in two).
  Self-check unchanged.
- Changes: Italian 24, English 7, parity 8, facts 1 (a wording fix, no
  number), quotations 1, clarity 8, links 0 (seven slugs, pinned), panel
  texts 12.
- Most significant:
  - Parity, section 3: IT «La Figura F1 ricalcola la sua tabella di t(A).»
    → «…ricalcola la tabella di t(A) di Budish e disegna il costo in
    funzione di A.», as the EN; the ambiguous «Il suo caso base» → «Il caso
    base di Budish» (EN "His" → "Budish's").
  - Parity, sentences one language lacked: now in IT «Rivuole i suoi
    soldi», Bonneau's question («perché comprare, se si può noleggiare?»),
    «sotto il campo», what F2 shows, the list of assumptions in "Fai il
    conto tu"; now in EN the "specific capital" sentence ("must own the
    machines: **specific capital**, worth almost nothing outside mining",
    Budish's term, his Section V).
  - The attack race, both languages: "the attacker's private chain has m
    blocks with a negative binomial probability; if she is short, her lead
    grows…" → "the number m of blocks on her private chain follows a
    negative binomial distribution. If she is behind, she gains on average
    A − 1 blocks for each honest block…"; «catena segreta» → «catena
    privata» (module 13's term).
  - IT: «Sia N* …, c …, e p_block» → «Siano …»; «fa attendere al
    commerciante e blocchi» → «fa attendere il commerciante per e
    blocchi»; «round» → «turno» (table); «Un blocco per caso ricco conviene
    biforcarlo» → «Se un blocco è per caso ricco, conviene biforcare la
    catena…»; italics only at first use.
  - Fact (wording): IT «senza crollo del prezzo» → «senza un calo del
    prezzo», as the EN "no fall in the price" and Budish's Theorem 2.
  - Quotation: Budish's 14-word sentence in the EN now ends ", he writes"
    (attributed); the IT keeps its paraphrase.
  - Panels: the IT rent verdict printed «il 0,87%» and «le serve» (the IT
    attacker is masculine) → «la quota della rete a noleggio, 0,87%, è
    inferiore al 143% che gli serve»; the IT energy verdict's article
    fixed; IT decimal lists with semicolons (preset «2028: S 1,5625; f
    0,5», observe A1, B1); «Verifica del profitto nullo» → «dei profitti
    nulli» (table); sources «on sale» → «on offer», «media di 30 giorni» →
    «media a 30 giorni».
- Pins: none changed.
- Words: EN 1,741, IT 1,795 (limits 1,500–1,800); the IT additions paid by
  short cuts, no sentence or name dropped.
- For Adriano: «un guadagno *una tantum*»; the translated Bonneau title;
  the IT keeps *free rider* (Auer's term; the check allows it);
  `money.js` prints «1,00 miliardi di $» (plural with 1,00; code, pinned
  by both checks, left); "an hour each" in the k + e label.
- Cross-module: the IT reading list writes "and" between authors here;
  «dollari» in the lectures against «… $» in the panels; the IT attacker's
  gender in other panels.
- `node scripts/lab/check-game-theory-14.mjs`: all checks passed (1 s).
- `npx vite build`: built (17 s).
- `node check-module.mjs game-theory capstone-the-price-of-security`: 0 failures of 56 (49 s).
- `node modules/game-theory-capstone-the-price-of-security.mjs`: 0 failures of 39 (11 s).

- Commit d52920e "Game Theory Lab review: module 14".

## Stage 2: across modules

One helper agent went through the 14 modules in order (the only agent
editing them); the lead reviewed the lab's index and ran the checks.

- Terms (every row of the status table searched in the 28 lectures, 14
  texts.js and the UI strings, EN and IT):
  - "best reply" → "best response": 04 (1), 06 (3), EN lectures (only code
    comments keep it).
  - "prisoner's dilemma" → "Prisoner's Dilemma": 06 EN (3).
  - "private chain" → "private branch": 14 EN (2), as module 13 and the
    table (the IT keeps «catena privata»).
  - "Rock, paper, scissors" / «Sasso, carta, forbici» → "Rock-paper-scissors"
    / «Sasso-carta-forbici»: 07 (heading, exercise 1 and, by the lead,
    Panel A's title in `index.js` and the status table), as module 03.
  - «guidatore» → «automobilista»: 07 (lecture, texts.js ×2,
    `FigureTraffic.jsx`), as module 08 and the table.
  - «attacco di maggioranza» → «attacco del 51%»: 10, `VotingPanel.jsx`.
  - *pool* in italics at its first use: 10 IT (the box).
  - Already gone everywhere: «risposta migliore», «catena segreta»,
    «equilibrio di confusione», «round» in IT.
- Panel names: the page labels each panel "Simulation A" / "Simulazione A"
  (`LabLecture.jsx`, the eyebrow over the title). Modules 01–05 already
  said so; 06–14 and several texts.js said "Panel A" / "Pannello A".
  About 103 EN and 103 IT changes, with the Italian gender fixed («nel
  Pannello A» → «nella Simulazione A», «Il pannello si apre» → «La
  simulazione si apre»); modules 03 and 04, last exercise, "In the
  simulation. Panel A…" → "In the simulations. Simulation A…"; module 05's
  lower-case «simulazione A» capitalized (6); `FigureThreshold.jsx`
  "(Panel C)" → "(Simulation C)". No pin contained Panel or Pannello.
- Closing section: 02 "## What comes next" / «## Che cosa viene dopo» →
  "## Next" / «## Il prossimo modulo»; 13 IT «## Prossimo modulo» → «## Il
  prossimo modulo». Every "Next" paragraph (02, 05–13) names and links the
  right module. 01, 03, 04 and 14 have no such section (the engine's "Next
  module" button follows every lecture).
- Notation: module 10's box called the hash-rate share h; now α, as 04
  and 13. Left, because the panels use them (reported for Adriano): δ is
  the discount factor in 04 and 06 but the spillover strength in 09; b is
  the bias and the lemons parameter (05), the threshold 2/(2 − w) (06),
  the bid (11, 12); ρ the fixation probability (07) and the guessed share
  (13); v(S) a coalition's worth (10) against v a value (11, 12); k counts
  different things in 06, 08, 11/12, 14; module 14 uses Budish's A and A*
  (a multiple of the honest hash rate) where 13 uses α (a share), as
  Budish does.
- Titles and cross-lab links: module titles quoted in the text match
  `game-theory-modules.json` (12 → "Mining as a game", 08 → "Games on
  networks"); every `/network-lab/` and `/lab/` link has the right number
  (08 → 10; 09 → 03, 06, 13; Complexity Lab → 11).
- Reading lists, one format: "(eds)" → "(eds.)" (02, 03 EN); "91 (2)" →
  "91(2)" (04, as 14's "140(1)"); «Capp.» → «Cap.» (11 IT); Ausubel ",
  MIT Press, ch. 1." → ". MIT Press. Ch. 1." / «Cap. 1.» (12); Hannan "In
  *Contributions…*" (07, as 10); 14 IT "and" → «e» between authors (5
  entries), Nakamoto «(incentivo)» → «(incentivi)», as 13. Citation
  content unchanged; "Vazirani, V." (07–09) against "V. V." (12) left.
- Italian details: about 55 lists of bare decimals now separated by
  semicolons (01, 02, 03, 04, 05, 06, 07, 09, 10), e.g. «cioè 41,67; 31,67
  e 26,67»; commas that read like a list → colons («0,0013: 14 volte
  meno»); curly “ ” → « » in IT UI strings (`EstatePanel.jsx`,
  `FigureEntry.jsx`, `TreePanel.jsx`, `UltimatumPanel.jsx`); 07 IT «una
  sola giocatrice … lei … lei» → «un solo giocatore … lui … lui» (the
  players masculine, as in every other module; no other feminine
  reference to the miner, players, bidders or attacker; 01's «giocatrici»
  are real badminton players).
- Pins changed (the semicolon lists): 01 (four observe/exercise lists),
  02 (six), 03 (observe A, B; exercise 6), 04 (nash1–3, exercise 5,
  ultimatum «; infine»), 05 (three), 06 ('(2.5, 2.5)' and the box's three
  pairs), 09 (observe C totals), 10 (a helper `and3d` and the Shapley,
  proportional, pools and exercise lists). EN sides unchanged. No browser
  check pins a changed string.
- Words that moved: 02 EN 1,687, IT 1,697; 07 EN 1,636, IT 1,691; 13 IT
  1,795 (limit 1,800); the rest unchanged.
- Left for Adriano: Tit for Tat roman in 06 IT, italic in 07 IT; the
  notation clashes above; 05 IT intervals «0–0,133, 0,133–0,467, 0,467–1»
  kept with commas; 05 IT Panel B title «Separarsi o confondersi?».
- Not unified (reported by several module passes): apostrophes, straight '
  in the lectures and texts.js, curly ’ in the UI strings and captions;
  each file type is consistent and the two render alike in the fonts used.
- The lab's index (`src/data/lab/game-theory-modules.json`), the fourteen
  titles and summaries read as one list (no check pins them; JSON
  validated). Titles unchanged. Summaries, 9 strings:
  - 13 EN "…when following the protocol is not the best strategy." → "…when
    following the protocol does not pay." (module 12's summary already
    says "the best strategy"); IT «…non è la strategia migliore.» → «Le
    scelte di un miner e quando seguire il protocollo non conviene.»
  - 12 IT «Regole che rendono la verità la strategia migliore» → «Regole
    per cui dire la verità è la strategia migliore» (as the EN "telling
    the truth").
  - 10 EN "The core, the Shapley value, and why…" → "The core, the Shapley
    value and why…" (no serial comma, as 01 and 11).
  - IT, comma before «e» dropped where it joins two plain members: 03
    («imprevedibili e che cosa garantisce»), 06 («alla cooperazione e
    quanto vale»), 08; kept after a relative or a «quando» clause (07, 09,
    12) where it guides the reading.
  - 08 IT «le scelte egoiste» → «le scelte egoistiche» (egoista for people,
    egoistico for acts).
  - 05 IT «senza sapere chi sono gli altri» → «chi siano gli altri».
  - 14 IT «quanto costa tenere sicuro Bitcoin» → «mantenere sicuro».
- Checks (one per command, after a build):
  - `node scripts/lab/check-game-theory-01.mjs` … `-14.mjs`: all checks
    passed, each (01 10 s, 02 15 s, 03 45 s, 04 6 s, 05 2 s, 06 1 s, 07
    1 s, 08 2 s, 09 0 s, 10 1 s, 11 10 s, 12 14 s, 13 8 s, 14 1 s).
  - `npx vite build`: built (12 s).
  - A slip: the four browser checks below were first sent in one batch and
    ran at the same time, against the "one at a time" rule; two exited 1
    and two hung past 600 s. Nothing was left running (no node process).
    Rerun one per command:
  - `node check-index.mjs game-theory`: 0 failures of 76 (104 s).
  - `node check-index.mjs network`: 0 failures of 76 (105 s).
  - `node check-index.mjs complexity`: 0 failures of 72 (103 s).
  - `node check-links.mjs`: 0 failures of 131 (164 s).
- Commit 9d1a6ce "Game Theory Lab review: across modules".

## Stage 3: the Italian terms without a source

- One helper agent (web search, one search per term; Italian PDFs
  downloaded and read with pdftotext; the search tool's own Italian
  summaries and snippet-only hits not counted as sources). Its findings,
  as recorded:

FOUND (term seen in the document text):
- zero-profit condition (14): «condizione di profitti nulli» — A. Battistini, "Competizione tra organizzazioni, specificità degli investimenti ed efficienza", UniSi repository (usiena-air.unisi.it); «condizione di profitto nullo» — Univ. Roma Tor Vergata, Esercizi di Microeconomia (concorrenza perfetta nel lungo periodo). Keep ours; now sourced.
- Katz–Bonacich centrality (09): «centralità di Katz-Bonacich» — D. Bordoli, prova finale "Scienza dei nodi per l'economia", Univ. Padova, Dip. Scienze Economiche (thesis.unipd.it). Sourced.
- glove game (10): «gioco dei guanti» — A. Torre, Univ. Pavia, slides on cooperative games, Collegio Borromeo 2019 (mate.unipv.it/atorre/borromeo2019/coop1.pdf). Sourced.
- allocation rule (12): «regola di allocazione» once, mostly «regola di assegnazione» with «regola di pagamento» — B. Bosco, Aste per microeconomia, Univ. Milano-Bicocca 2022/23. Keep ours (attested).
- private lead (13): «in vantaggio di due blocchi», «vantaggio di due unità rispetto alla catena pubblica» — L. Serena, tesi triennale, Univ. Bologna 2018/19 (amslaurea.unibo.it/20600). Sourced; the thesis calls the private chain «catena personale» (ours, «catena privata», kept).
PARTLY FOUND:
- rest point (07): Ghezzo (tesi triennale, Padova, Dip. Matematica, 2023-24) calls the replicator's zeros «equilibrio evolutivo» / «punti fissi» and writes «punto di equilibrio» in the phase-diagram discussion; Demaio (tesi magistrale, Unimore) «punti fissi della dinamica». «punto di riposo» unused. Keep «punto di equilibrio».
- least core (10): a Pisa thesis (N. Sansone, 2024) keeps "Least Core" (English abstract). Weak support for keeping the English.
- balanced (10): Barbarino, Appunti di Teoria dei Giochi (2020): «gioco bilanciato», «vettore bilanciato di pesi»; no «collezione bilanciata» again (Fragnelli stays the source).
- bankruptcy (10): Lucchetti (PoliMi), Bocconi 2011: a firm «dichiarata in bancarotta» in the creditors' example; supports «bancarotta» over «fallimento».
- specialized capital (14): Battistini says «investimenti specifici», «specificità degli investimenti»; not «capitale specifico» verbatim. Keep ours; our choice.
- profitability threshold (13): PoliTo thesis (Guglielmino 2021-22) «profittabilità» of mining, no threshold phrase. Our choice.
SNIPPET ONLY (not counted): «equilibrio di Wardrop» (Univ. Pisa TMO_relazione.pdf, not opened); «commissione di base» (WisdomTree Italia, CoinDesk Italia; not university).
NOT FOUND: one-shot deviation principle (06); the lizard's Italian name (07); Wardrop's principle, best-response dynamics (08); specialized equilibrium, key player, intercentrality, pairwise stability, connections model (09); monopolistic price, unit demand (11); Myerson's lemma, virtual value, optimal auction, budget balance, bilateral trade, false-name bids, base fee (12); reference implementation, relative revenue, the MDP actions (13); sabotage, counterattack, Goldfinger attack, bribery, block subsidy, undercutting, mining gap (14).
Downloaded PDFs and text: scratchpad\dl\.

- Decisions: no lecture text changes. Every term found is the one the
  lectures already use (punto di equilibrio, centralità di Katz–Bonacich,
  gioco dei guanti, regola di allocazione, vantaggio, condizione di
  profitti nulli), so the table records the source and the term stays.
  Specialized capital: the source's «investimenti specifici» is a
  different noun for the same idea; «capitale specifico» kept, still our
  choice. Least core: kept in English (weak support).
- Status file: the eight rows updated with their sources; the open item
  "Italian terms without a source" loses rest point, Katz–Bonacich,
  glove game, allocation rule, private lead and zero-profit condition
  (now sourced), and balanced collection and bankruptcy problem (their
  rows already cite Fragnelli; Barbarino's "gioco bilanciato" and
  Lucchetti's "bancarotta" confirm the words).
- No check run for this stage: only the status file changed.
