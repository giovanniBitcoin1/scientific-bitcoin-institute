# Game Theory Lab 04 — report

Prompt 4: module 04 "Games in time and credible commitment"
(`sequential-games-commitment`). No stage 0. Working log:
`docs/reports/game-theory-lab-04-log.md`.

## Commits

- e4af701 "Game Theory Lab 04: Games in time and credible commitment" (three
  WIP commits squashed: ba8855a logic and self-check, fe4cb1e figures,
  panels, lecture and texts, ec583cc functional check and status file).
- "Game Theory Lab 04: report": this file and the log, and the status file
  set to "prompt finished".

Nothing pushed.

## Before starting

Branch `game-theory-lab`, tree clean, last commit 1565518 "Game Theory Lab
03: report". The status file showed module 03 done and nothing in progress,
and `docs/reports/game-theory-lab-03.md` was committed.

## What differs from the spec

- **Ties.** Backward induction gives a tie to the first move listed. In the
  commitment trees "Wait" is listed before "Commit", so that at k = 2 the
  indifferent firm does not commit; the self-check found this (it committed
  at k = 2 in the first version). At f = 2 in F1 the firm is indifferent and
  the text says so ("here it shares"). In matching pennies in turn the first
  mover is indifferent at the root, and both of its moves are subgame
  perfect: the panel says so.
- **The follower at the limit quantity.** "The follower stays out when its
  profit would be below F" is implemented as "not above F": an indifferent
  follower stays out. Without that, the limit quantity a − c − 2√F of the
  prompt would not keep it out.
- **Payoff order in Panel A.** Every Panel A tree has the first mover as
  player 0 and payoffs (first, second), as the prompt asks for the centipede.
  So the commitment preset reads (firm, newcomer), while F1 keeps (newcomer,
  firm). The legend under each tree names the two players.
- **Panel A extras.** "Solve" solves one node every 0.55 s, deepest first,
  and writes each node's value beside it; "Clear" undoes it. The tree's
  backward-induction profile is framed in the table, and the Nash
  equilibria are ringed. A plan is written as the short labels of its moves
  in depth-first order (e.g. CM = Concert after Concert, Match after Match),
  and a line under the table says so.
- **Panel B.** The "at the same time" column has no fixed cost (module 02's
  market); a note says so. Cost sliders move in steps of 0.1.
- **Panel C.** The thresholds are drawn at random, so the population's curve
  differs a little from (1 − x) x/m. Both are drawn (the closed form
  dashed). I added an offer slider the prompt did not ask for, so that
  exercise 6 ("what an offer of 0.1 earns") can be read on the page. "Play"
  is 1,000 proposers × 100 offers each, drawn at random from the 21 offers
  0, 0.05, …, 1, each against a responder drawn at random from the
  population. It also counts how many proposers find the best offer from
  their own tries: only 144 of 1,000 at m = 0.4, which the observe list
  uses.
- **F2** opens on T = 10. Its bars alternate colour (odd T: the first
  proposer makes the last offer).
- **Logic files** as suggested (`trees.js`, `stackelberg.js`,
  `bargaining.js`, `ultimatum.js`) plus `presets.js` and `forks.js` (the
  box). **GameTree.jsx** sits next to `PayoffTable.jsx`.
- **Further reading.** Added: Schwalbe and Walker 2001 (the source for
  what Zermelo did) and Henrich et al. 2001 (the source for the ultimatum
  figures). Osborne's chapters are "5, 6, 7 and 16": bargaining is his
  ch. 16.

## Checks (final state, one at a time, in this order)

All on ec583cc, the code of the module commit:

| Check | Result |
|---|---|
| `npx vite build` | built (1,531 modules, 13.3 s) |
| `check-game-theory-01.mjs` | 102 PASS, 0 FAIL |
| `check-game-theory-02.mjs` | 124 PASS, 0 FAIL |
| `check-game-theory-03.mjs` | 119 PASS, 0 FAIL |
| `check-game-theory-04.mjs` | 118 PASS, 0 FAIL |
| `check-index.mjs game-theory` / `network` / `complexity` | 0 of 80 / 0 of 76 / 0 of 72 |
| `check-links.mjs` | 0 failures of 131 |
| `check-module.mjs game-theory` × 4 modules | 0 failures of 56 each |
| `modules/game-theory-what-is-a-game.mjs` | 0 of 32 |
| `modules/game-theory-nash-equilibrium.mjs` | 0 of 49 |
| `modules/game-theory-mixed-strategies-zero-sum.mjs` | 0 of 39 |
| `modules/game-theory-sequential-games-commitment.mjs` (new) | 0 of 43 |
| `build-main.mjs` + `compare-main.mjs` | 0 failures of 144 |
| `npm run build` | content check passed; 9 static pages, 3 stubs, feed, sitemap |
| `npm run check:dist` | 0 failures of 108 |

Failures found and fixed along the way, all in the log:
- the tie at k = 2;
- six "quoted on the page" failures: my texts had 0.249 / 0.752 / 0.732
  where the page, which writes with `toFixed(3)`, shows 0.248 / 0.751 /
  0.731;
- one phrase the lecture does not use;
- a missing space before "not subgame perfect" (the functional check read
  "…0 and 4NOT…").

## Self-check numbers (`check-game-theory-04.mjs`)

- **Backward induction against brute force.** On 1,000 random two-stage
  trees (2 × 4 tables) and 1,000 three-stage trees (first, second, first
  again; 32 × 4 tables), the backward-induction profile is a Nash
  equilibrium of the table. It is also the only one that passes the
  subgame-perfection test, which tries every alternative plan in every
  subgame and never calls backward induction. In both sets: 1,000 of 1,000.
- **Presets** as the prompt says:
  - the entry game gives (enter, share) and two equilibria, one subgame
    perfect;
  - the threat is credible exactly for f > 2 (every slider value);
  - with commitment the firm commits exactly for k < 2 when f < 2, and
    never needs to when f > 2;
  - battle of the sexes in turn: (2, 1), three equilibria;
  - matching pennies in turn: the second mover wins;
  - centipede: (1, 0); all 4 of its Nash equilibria end at the first move.
- **Survey, 20,000 trees** (page seed 4400): see the next section. Never
  more than 3 equilibria; backward induction gives the one subgame perfect
  equilibrium in all 20,000; the leader is never below the best
  simultaneous equilibrium.
- **Stackelberg.** 4.5, 2.25, 3.25, 10.125, 5.0625; Cournot 3, 3, 4, 9, 9
  from module 02's `cournot.js`. Limit quantities 8, 7.586, 7, 6.172, 5 for
  F = 0.25 … 4, with profits 8, 10.728, 14, 17.456, 20. The switch is at
  F = 0.4343 (L = 7.682), and the follower stays out by itself from 5.0625.
  The leader's choice also beats a grid search (step 0.0005) in all 192
  settings of c1, c2 and F.
- **Bargaining.**
  - δ = 0.9: 1, 0.1, 0.91, 0.181, 0.8371, 0.2466, 0.7781, 0.2998, 0.7302,
    0.3428; limit 0.5263.
  - δ = 0.5: 1, 0.5, 0.75, 0.625; limit 0.6667.
  - Two discount factors: 0.7143, 0.3571, 0.9524.
  - The recursion reaches the formula to 1e-6 by 4,000 rounds, and agrees
    with a separate solution written out offer by offer.
- **Ultimatum.**
  - Best offer m, money 1 − m, for m = 0.1 … 0.5.
  - With m = 0.4: 0.225, 0.4, 0.525 for offers of 0.1, 0.2, 0.3.
  - The page's population (N = 1,000) gives 0.394 worth 0.602.
  - "Play": largest gap from (1 − x) x/m is 0.0164; best grid offer 0.4.
- **Box.**
  - α² = 0.01, 0.04, 0.09, 0.16; fee threshold 0.0101, 0.0417, 0.0989,
    0.1905; cost 0.09, 0.16, 0.21, 0.24.
  - 200,000 races with α = 0.2: success 0.0397, cost 0.1608 (both within
    0.003).
- **Exercises 1–5**: every answer of the prompt reproduced exactly.
- **Quoted on the page**: every number in the lecture, the box, the three
  observe lists and the six solutions.
- **Words**: lecture 1,690 EN, 1,682 IT; box 198 EN, 196 IT. One box,
  after the commitment section; Bitcoin appears nowhere else.

## "Expected" values that differ from mine

Each share within 0.015, 20,000 trees, page seed:

| Value | Expected | Mine |
|---|---|---|
| Nash 1 / 2 / 3 | 0.253 / 0.495 / 0.252 | 0.248 / 0.502 / 0.249 |
| not subgame perfect | 0.747 | 0.751 |
| different outcome | 0.332 | 0.331 |
| second player better off | 0.495 | 0.502 |
| first: better / worse / same | 0.144 / 0.128 / 0.728 | 0.145 / 0.123 / 0.731 |
| both first / both second | 0.104 / 0.084 | 0.105 / 0.082 |
| no pure equilibrium | 0.126 | 0.125 |
| leader strictly above | 0.047 | 0.048 |
| **of those with no pure equilibrium, both prefer second** | **0.671** | **0.651** |

All are within 0.015 except the last.

- **"Both prefer second" (0.651 against 0.671).** The code is right: a
  separate computation on 4,000,000 random 2 × 2 games (not using
  `trees.js`) gives 0.6664, very likely 2/3 exactly. Your 0.671 is also
  within noise. The share rests on only about 2,500 games (1/8 of 20,000),
  and ten other seeds give 0.643–0.683. Following the seeds rule, the check
  is "within 0.025 of 2/3".
- The other shares from 4,000,000 games: better 0.1461, worse 0.1250, no
  pure 0.1249, leader above 0.0477. So "worse" is about 1/8, not 0.128.
- **"Play" in Panel C.** The prompt's limit (within 0.02 of (1 − x) x/m)
  passes on the page's seeds (0.0164). On ten other seeds it is
  0.015–0.033, above 0.02 three times. The cause is the 1,000 randomly
  drawn thresholds, not the play: measured against the population's own
  curve, the gap is 0.005–0.012. I kept your check and added that second
  one.
- **Stackelberg, bargaining, ultimatum and box values**: all as expected.
  The 200,000 races give 0.0397 and 0.1608.

### The shares 1/4, 1/2, 1/4 are exact

Call the first player's payoffs a and a′ after U, and c and c′ after D:
- a is the leaf the second player would choose after U, a′ the other leaf;
- c is the leaf it would choose after D, c′ the other leaf.

The second player's choices depend only on its own payoffs, so a, a′, c, c′
are four independent uniform numbers.

In a Nash equilibrium of the 2 × 4 table, the second player must play its
best move at the node actually reached, and is free at the other node. So:
- with U there are [a > c] + [a > c′] equilibria;
- with D there are [c > a] + [c > a′].

Exactly one of a > c and c > a holds. So the count is

    N = 1 + [a > c′] + [c > a′].

The two brackets involve disjoint pairs of independent uniforms. They are
therefore independent, each true with chance 1/2. So N − 1 is binomial
(2, 1/2): 1/4, 1/2, 1/4 exactly.

The same argument gives three more exact values:
- **Not subgame perfect: 3/4.** Some equilibrium other than backward
  induction exists whenever N > 1.
- **Different outcome: 1/3.** If a > c, a different outcome needs
  a′ < c < a, which has chance 1/6; the case c > a is symmetric.
- **Second player better off in it: 1/2.** It compares the maxima of its
  two pairs of payoffs.

The self-check holds the survey within 0.01 of these four values.

## Exercise answers that differ from yours

None. All six were recomputed. Exercise 6 depends on the seed:
- my survey gives 0.248, 0.502, 0.249; 0.331; 0.145 and 0.123 (yours:
  0.253, 0.495, 0.252; 0.332; 0.144 and 0.128);
- Panel C's closed form gives 0.4 and 0.6, 0.2 and 0.8, and 0.225;
- the solution also gives the page's population values: 0.394 worth 0.602,
  0.200 worth 0.800, and 0.215.

## The numbers behind each "What to observe"

**Panel A.**
- Entry game: the firm's node is solved first, then the newcomer's; result
  (2, 2). Two equilibria; (O, F) is not perfect: 0 instead of 2.
- Commitment preset: (3, 0); 5 equilibria, 1 perfect.
- Battle of the sexes: (2, 1), 3 equilibria. The empty threat is (M, MM),
  "Match" after Concert.
- Pennies: (0, 1), a tie at the root, 2 perfect equilibria.
- Centipede: (1, 0), 4 equilibria, all ending at the first move.
- Survey of 20,000: 0.248 / 0.502 / 0.249; 0.751; 0.331; 0.502; 0.145 /
  0.123 / 0.731; no pure 0.125, both second 0.651; leader above 0.048,
  below 0.

**Panel B.**
- Defaults: 3, 3, 4, 9, 9 against 4.5, 2.25, 3.25, 10.125, 5.0625; best
  response 3.375.
- F = 0.40 shares; F = 0.45: limit 7.658, profit 10.275; switch at 0.4343.
- F = 1: 7 and 14. F = 5.05: limit 4.506. F = 5.10: monopoly, 20.25.
- c1 = 0.5: 5 and 12.5, against 11.11. c2 = 2.5: 5.25, 1.125, follower
  profit 1.27.

**Panel C.**
- N = 1,000, m = 0.4: 0.394 worth 0.602; an offer of 0.1 is accepted by
  23.9% and earns 0.215 (0.225 in the closed form).
- "Play": 0.40 with 0.600; 144 of 1,000 proposers found it alone.
- m = 0.2: 0.200 worth 0.800; 628 found it alone.
- N = 5,000: 0.400, and an offer of 0.1 earns 0.231.

The lecture quotes 75% and 33% from the survey, and 15% better / 12% worse
(0.1452 and 0.1233).

## "Check" figures: confirmed and softened

Sources were looked up on 25 November 2026; details and URLs are in the
log.

- **Zermelo 1913: softened.** The citation is confirmed. Schwalbe and
  Walker (2001) show that Zermelo did not use backward induction. He
  defined a winning position in chess-like games and bounded the moves
  needed to force a win. The lecture says only that he asked whether one
  side can force a win in chess, and gave the first mathematical treatment
  of such a question; it also says the method often credited to him is not
  the argument he used.
- **Selten 1965: confirmed, with a nuance.** The citation is confirmed, and
  so is his introduction of the concept. The name "subgame perfect" dates
  from Selten 1975, where the older "perfect" was renamed; I saw the
  abstract via search results only. The lecture says "the name came later".
- **Stackelberg 1934: confirmed.** Springer, Wien und Berlin.
- **McKelvey and Palfrey 1992: confirmed and quoted.** Read in the paper:
  Table IIA, four-move game, N = 281, f1 = .071. Page 808: "In only 7% of
  the four move games … does the first mover choose TAKE on the first
  round." The lecture says 7%.
- **Güth et al. 1982: citation confirmed.** Their own figures were not
  reached (the publisher site returned 403).
  - "Usually offer 40 to 50%" is kept as the usual range, from a
    secondary quote of Camerer and Thaler 1995.
  - Henrich et al. 2001, read in full: in industrialised societies "modal
    offers are consistently 50 percent", and "offers below 20 percent are
    rejected with probability 0.40 to 0.60". The lecture quotes this, and
    the paper is added to the reading.
- **Rubinstein 1982: confirmed.** The end page is 109 in most lists and 110
  on the Econometric Society's page; I kept 97–109. The formula is a
  standard result, here also computed by the self-check.
- **Narayanan et al. 2016, ch. 5 (§5.5): checked against the free draft,
  wording kept.**
  - Punitive forking "doesn't appear to work without a majority", and the
    transactions "will still make it into the longest chain".
  - Feather forking gives up after k confirmations; with one confirmation
    the chance is α², "only a 4% chance" at 20%.
  - Other miners "may rationally decide to join you".
  - **The prompt says the book describes both attacks as theoretical. It
    does not.** The book's words "just a theoretical attack" refer to
    selfish mining. Of mining strategy in general it says: "in practice
    we've seen very little behavior of anything other than the default
    strategy".
  - So the box does not call the forks theoretical. It ends with "A
    hypothesis about incentives, not an observation of the chain".
  - The printed edition may differ slightly from the draft.
- **Further reading: all confirmed.**
  - Osborne (ch. 5–7, plus 16 for bargaining), Tadelis (ch. 7, 8, 11),
    Shoham and Leyton-Brown (ch. 5, kept 2009).
  - Schelling (ch. 8 is "The Threat That Leaves Something to Chance"; ch. 2
    has "to burn bridges behind one"), Dixit 1980, Rosenthal 1981.

## Timings and sizes

- **Browser (functional check, 1280 px):**
  - "Survey" with 2,000 trees: 0.2 s; with 20,000: 0.8–1.1 s.
  - "Play" in Panel C: 0.08–0.10 s.
- **Node:** the 20,000-tree survey takes 0.7 s.
- **Page load:** nothing heavy runs when the page loads.
- **Figure heights:**
  - 1280 px: F1 313 px, F2 277 px (EN and IT);
  - 375 px EN: 421 and 454 px;
  - 375 px IT: 440 and 473 px.
- **Chunks (raw / gzip):**
  - module 04: 83.61 / 30.01 kB, including GameTree.jsx, its only user so
    far;
  - modules 01, 02, 03: 73.06 / 26.27, 82.88 / 29.32, 72.37 / 26.18.
- **Shared chunks.** Vite re-split the shared code now that module 04 also
  imports games.js and PayoffTable.jsx:
  - `games-…`: 8.50 / 3.46 kB;
  - `randomgames-…`: 1.40 / 0.75 kB (it was 9.86 kB holding everything).
  - Everything still loads only when unlocked: the locked checks found no
    content chunk requested.

## Italian terms

The full table is also in the status file.

| English | Italian |
|---|---|
| game tree | albero (del gioco) |
| node | nodo |
| move | mossa |
| plan (strategy as a complete plan) | piano |
| backward induction | induzione a ritroso |
| subgame | sottogioco |
| subgame perfect equilibrium | equilibrio perfetto nei sottogiochi |
| empty threat | minaccia vuota |
| credible | credibile |
| commitment | impegno (impegnarsi) |
| leader, follower | chi guida, chi segue |
| first-mover advantage | vantaggio di chi muove per primo |
| entry | ingresso (gioco dell'ingresso) |
| incumbent | impresa (già sul mercato) |
| newcomer | nuovo arrivato |
| fixed cost | costo fisso |
| ultimatum game | gioco dell'ultimatum |
| centipede game | gioco del millepiedi |
| proposer, responder | proponente, rispondente |
| offer | offerta |
| discount factor | fattore di sconto |
| patience | pazienza |
| punitive forking | fork punitivo |
| feather forking | *feather fork* (kept in English) |
| orphaned block | blocco orfano (rendere orfano) |
| confirmation | conferma |

Also: limit quantity = quantità limite, threshold = soglia, bargaining power
= potere contrattuale.

## For you to decide

- **The box's last sentence.** The prompt asked for the attacks to be
  described "as theoretical" (per the book), but the book does not say that
  of these two forks. The box now says what the book says about practice in
  general. Please confirm the wording.
- **Payoff order.** Panel A's commitment preset writes (firm, newcomer)
  while F1 writes (newcomer, firm). One order everywhere would need either
  the firm as "second player" at the root, or F1 changed.
- **"Leader" / "follower" in Italian.** I used "chi guida" and "chi segue"
  to avoid "leader" and "follower" in Italian text. "Capofila" or keeping
  the English terms are alternatives.
- **The lecture's DRAFT marker** stays until you review it.
