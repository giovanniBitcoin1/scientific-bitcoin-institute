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
