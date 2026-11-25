# Game Theory Lab 05 — working log

Prompt 5 (stage 0: one fix to module 04; stage 1: module 05 "Incomplete
information and signals"). One line per check run to its end (command,
result) and one line per source looked up (what, where, what it says). A
session that picks up this prompt reads this file first.

## Session 1 (25 November 2026)

- Start: branch `game-theory-lab`, tree clean, last commit 4aca4b8 "Game
  Theory Lab 04: report". Status file: module 04 done, nothing in progress;
  `docs/reports/game-theory-lab-04.md` committed. Preconditions met.
- Found while reading module 04: `presets.js` holds the Italian name of the
  move "Down" of the random tree double-encoded (`GiÃƒÂ¹` instead of `Giù`),
  shown as such on the Italian page; two comments in `presets.js`, one in
  `bargaining.js` and three in `forks.js` are garbled the same way. Fixed in
  stage 0.

### Stage 0

- Change: `presetTree('commit')` is now `entryTree({ f: 0, k: 1, commit:
  true })` (newcomer player 0, firm player 1 at the root, the very tree of
  F1); `PLAYERS.commit` = (Newcomer, Firm). Panel A's note under the table
  now names the players ("Rows: the plans of the newcomer, whose payoff is
  written first; columns: those of the firm"), since "first player" was
  wrong once the firm moves first; the legend under the tree adds "payoffs
  (newcomer, firm), the first on top" (for every preset, with its own
  names). Observe item 2 now reads (0, 3) as (newcomer, firm). A small
  change, so the new order was kept.
- `node scripts/lab/check-game-theory-04.mjs`: all PASS, "All checks
  passed" (new: newcomer player 0 and firm at the root; k = 1 commits to
  (0, 3); 4 non-perfect equilibria each with a threat: three of the firm
  at [Wait > Enter] 0 → 2, one of the newcomer at [Commit] −1 → 0).
- `npx vite build`: built in 14.4 s.
- `node modules/game-theory-sequential-games-commitment.mjs`: 0 failures
  of 45 (new: threats named for the right player, legend, root "F", rows
  note, solved "payoffs 0 and 3").
- `node check-module.mjs game-theory sequential-games-commitment`: 0
  failures of 56.

