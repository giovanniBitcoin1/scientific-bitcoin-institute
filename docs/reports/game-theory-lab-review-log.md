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

