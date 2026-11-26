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

