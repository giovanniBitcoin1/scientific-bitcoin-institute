# Game Theory Lab 12 — report

Prompt `prompts.local/game-theory-lab-12.md`: stage 0 and module 12, "Designing
the rules" (`mechanism-design`). Branch `game-theory-lab`, local commits only,
nothing pushed. Working log: `docs/reports/game-theory-lab-12-log.md`.

## Commits

- 34a9392 "Game Theory Lab 12: Designing the rules": the module, stage 0, the
  status file (module 12 "ready" and "done"). Two WIP commits squashed (7486ef4,
  67aa71e).
- "Game Theory Lab 12: report": this report and the working log.

## Stage 0

The "Long checks" rule in the status file now says: browser checks run one
module per command (`check-module.mjs` and the functional check of one
module, then the next), never in a loop over modules; the same for any batch
that could pass the tool's limit. This prompt's checks ran that way.

## What was built

- Logic in `src/components/lab/game-theory/mechanism-design/`: `myerson.js`
  (F1 and Panel A), `vcg.js` (Panel B), `bilateral.js` (F2), `cheat.js`
  (Panel C, on top of `auctions/block.js`).
- F1 `area`, "The price is an area": three presets (one object with h,
  default 60; two slots with α2, default 0.8, rival bids 60 and 30; lottery
  with H, default 50), a bid slider (default 80). The payoff area is shaded
  orange, the payment blue; readouts x(b), p(b), the payoff.
- F2 `trade`, "Two out of three": the square c × v, the three rules, the
  trade region shaded, chance, gains, the designer's budget and the four
  marks.
- Panel A "Lying does not pay": five allocation rules, three payment rules
  (the generalized second price only for the slots), the payoff of every
  report every 0.1, the truth marked and the best reports drawn in green;
  the GSP threshold readout for the slots.
- Panel B "Pay for the harm you do": 2–4 bidders, bids and true values for A,
  B and AB, VCG over all (n + 1)² assignments with a fixed tie order (stated
  in the panel), payments, payoffs, revenue, revenue without each bidder, the
  "bidders 2 and 3 are one person" switch, "Bids = true values", the four
  presets.
- Panel C "Who runs the auction?": module 11's draws, honest against cheating
  for the three rules (revenue ± standard error, users served, users'
  payoff), the exact single-fake readout, the count of blocks in which the
  cheating uniform price equals the monopolistic price, and the sentence
  that this equality is our computation.
- Lectures EN and IT with the DRAFT marker, the box after section 5, seven
  exercises, `texts.js`, `index.js`, `scripts/lab/check-game-theory-12.mjs`,
  `browser-checks/modules/game-theory-mechanism-design.mjs`, `expect.json`
  (2 figures, 3 panels, 7 exercises).

## Differences from the spec

- **Panel C at k = 20 (n = 20), one fake: the prompt says "none".** A fake just
  below the 20th bid is the 21st bid, the highest losing one, so the price
  becomes v_(20): 100k(n + 1 − k)/(n + 1) = 95.24 instead of 0. The panel
  shows 95.24 at k = n, and "no k-th bid" only for k > n.
- **Roughgarden's property names.** His paper calls the first property DSIC
  (incentive compatibility for users in dominant strategies). "UIC" is Chung
  and Shi's term. He finds the second price DSIC only "almost" for a block.
  The box therefore says the uniform price "comes close to the first but fails
  the second", not "passes the first". It names the three as incentive
  compatibility for users, myopic miner incentive compatibility and
  OCA-proofness.
- **Revelation principle credits.** Myerson's Nobel lecture names Holmström
  1977, Harris and Townsend 1981 and Rosenthal 1978 alongside Myerson and
  Dasgupta–Hammond–Maskin, all "building on ideas of Gibbard (1973)". The
  lecture says "found independently by several authors … among them" the two
  the prompt names.
- **Roughgarden lecture 7** is titled "Multi-Parameter Mechanism Design".
  "And the VCG Mechanism" is in the 2013 notes only. The reading list says "7
  (multi-parameter mechanism design: VCG)".
- **Ties.** In the auction rules a bid equal to a rival's is a coin toss, with
  x the average of the two sides. So under pay your bid the best report is
  "just above" h, 60.1 on the 0.1 grid. "Win only in the middle" is [40, 60)
  as written.
- **Panel C "cheating" for the other two rules.** Pay your bid is computed by
  the same search, over h high fakes and one more. The monopolistic price is
  shown equal to honest: no fake raises what real users pay, and the
  self-check proves it by brute force.
- **Panel C search.** The search the prompt describes, over j and where the
  fakes go, took 380 ms in Node at n = 40, k = 60, so it was reduced. For each
  number h of high fakes, the n + 1 places of one more fake give only three
  outcomes, and the page evaluates those three. The check compares this with
  the full search (12,000 blocks, same best and same j) and with a brute
  force over every multiset of up to k + 1 fakes on small blocks (200
  blocks).
- **Box length.** The box is 315 words in English and 347 in Italian, counting
  its title and the fence line; the target was about 250–300. It carries
  everything the prompt lists.
- **F2's "truthful" mark for split the difference.** The rule is marked
  truthful because its linear equilibrium is a truthful equilibrium of the
  direct mechanism, through the revelation principle. That is the prompt's
  "dominant or in equilibrium".

## Exercises (every answer recomputed)

All seven agree with the prompt.

1. You pay 60 and keep 20.
2. GSP gives 40 and 56; Myerson gives 64 and 56; the threshold is α2 ≤ 4/7.
3. The truth gives 20 (the formula pays −20) and bidding 50 gives 30.
4. Payments are 0, 0, 0 and revenue 0; without bidder 3, revenue 4.
5. As one person she pays 4 and keeps 2; with two names she pays 0 and keeps 6.
6. The three rules give 16.67 with chance 1/2 (the designer pays 16.67), 12.5
   with chance 1/4, and 14.06 with chance 9/32.
7. 476.19 and 523.81; the best cheating, about 547, needs the panel.

## Self-check numbers (`check-game-theory-12.mjs`, 111 PASS, 25 s)

- **F1, one object:** h = 60, b = 80 gives x 1, p 60, payoff 20.
- **F1, two slots (α2 = 0.8):** b = 100 gives 1, 36, 64; b = 45 gives 0.8, 24,
  12. The top slot costs α2·h2 + (1 − α2)·h1 for five values of α2.
- **F1, lottery (H = 50):** b = 25 gives 1/3, 3.6066, 4.7267; b = 50 gives 0.5,
  9.6574, 15.3426; b = 100 gives 2/3, 21.5973, 45.0694 (= 100 − 50 ln 3).
  Simpson's rule (2,000 intervals) matches the closed form within 1.7e-9; the
  tolerance is set at 1e-8.
- **Panel A, Myerson and monotone rules:** the truth is a best report for
  every v = 0 … 100 in 8 settings (808 of 808).
- **Panel A, reserve 50:** v = 80 pays 50 and keeps 30; v = 40 keeps 0 and
  would lose 10 by winning.
- **Panel A, slots at v = 100:** α2 = 0.8 gives Myerson 64/56 and GSP 40/56;
  α2 = 0.5 gives 55/35 and 40/35. The threshold is 4/7, and it matches the
  scan on 441 (v, α2) pairs.
- **Panel A, pay your bid (h = 60, v = 80):** the best report is 60.1 (19.90),
  and the truth gives 0.
- **Panel A, "Win only in the middle":** p is 40 inside and −20 above 60.
  v = 70 gives truth 20, best 30; v = 50 gives 10, 20; v = 30 gives 0, 20. No
  constant payments inside and outside (−100 … 100) make it truthful.
- **Panel B presets:**
  - "Two items, three bidders": A to 1, B to 2, payments 5, 4, 0, revenue 9.
    Without bidder 3 the payments are 5 and 2 and revenue is 7. Without each
    bidder in turn: 7, 5, 7.
  - "The lonely auction": revenue 0; without bidder 3, 4 for each of the four
    tied assignments.
  - "Two names": 4 and 2 as one person, 0 and 6 as two names.
  - "Losers collude": 0 and 1 each with the inflated bids; honest bids give
    bidder 1 AB, paying 2 and keeping 2.
- **Panel B, random tables:** 300 of them. The allocation is the best total
  and the payments equal the externality, checked by a separate brute force.
  The truth is dominant against 200 other reports per table.
- **F2:** efficient trade gives 1/2, 16.6667, −16.6667. Posted price 50 gives
  1/4 and 12.5; 30 and 70 give 0.21 and 10.5. Split the difference gives 9/32
  and 14.0625. An 800 × 800 grid agrees.
- **F2, linear equilibrium best replies:** the buyer bids 35, 48.333, 68.333
  at v = 40, 60, 90, and the seller asks 31.667, 45, 65 at c = 10, 30, 60.
  The expected payoffs agree with Simpson's rule. The best posted price is
  50.
- **Panel C, exact values:** honest, one fake and users' payoff (honest) are
  357.14, 380.95, 71.43 at k = 5; 476.19, 523.81, 261.90 at k = 10; 357.14,
  428.57, 571.43 at k = 15. At k = 20 they are 0, 95.24, 1,000. At n = 10,
  k = 5 they are 227.27, 272.73, 136.36. One fake simulated over 200,000
  blocks gives 523.66.

### Panel C at 2,000,000 blocks (seed 1)

Mine against the prompt's (best cheating; users served; users' payoff when
cheating):

| n, k | best cheating | served | users' payoff |
|---|---|---|---|
| 20, 5 | 381.42 (381.5) | 4.970 (4.97) | 45.30 (45.3) |
| 20, 10 | 546.61 (546.8) | 9.209 (9.21) | 153.55 (153.5) |
| 20, 15 | 578.00 (578.0) | 10.978 (10.97) | 209.22 (209.1) |
| 20, 20 | 578.85 (578.8) | 11.079 (11.07) | 212.40 (212.3) |
| 10, 5 | 284.41 (284.6) | 4.599 (4.60) | 61.87 (61.9) |

- All values are within 1%.
- The cheating uniform price equals the monopolistic price in every one of
  the 10,000,000 blocks.
- Pay your bid and the monopolistic price: cheating equals honest in every
  run, and the brute force finds no gain in 200 of 200 blocks.

## The numbers behind "What to observe" (run no. 1, 10,000 blocks)

**Panel A**
1. One object, h = 60, Myerson, v = 80: pays 60, keeps 20, best reports
   60.1–100.
2. Pay your bid: truth 0, best 19.90 at 60.1.
3. Slots at v = 100: Myerson 64; GSP 40 against 56 for reports 30.1–59.9;
   threshold 0.5714. At α2 = 0.5, 40 against 35.
4. Lottery at v = 80: Myerson 32.22 at 80 only; pay your bid 18.75 at 30.6.
5. "Win only in the middle" at v = 70: truth 20, reports 40–59.9 keep 30.
6. Reserve at v = 40: 0 for reports up to 49.9.

**Panel B:** the preset values listed above, and the total of 14 in "Two
items, three bidders".

**Panel C**
1. Uniform price: 475.21 ± 1.07 honest and 546.62 ± 0.93 cheating, equal to
   the monopolistic price in 10,000 of 10,000 blocks. Users served 9.22;
   users' payoff 262.51 against 153.77.
2. One fake: 523.81 against 476.19, a gain of 47.62.
3. Pay your bid: 476.15 honest and cheating.
4. k = 20: honest 0, cheating 578.47, served 11.06; users' payoff 999.23
   against 211.75.
5. k = 1: 95.23 against 90.45; the winner keeps 0.00.

## The "check" items

| Item | Verdict |
|---|---|
| The revelation principle and its three sources | Confirmed; credits widened to "among others" |
| Myerson's lemma and the optimal auction (Myerson 1981) | Confirmed |
| Edelman–Ostrovsky–Schwarz and Varian | Confirmed |
| Vickrey–Clarke–Groves | Confirmed |
| Ausubel–Milgrom | Confirmed |
| Yokoo–Sakurai–Matsubara | Confirmed |
| Myerson–Satterthwaite and the optimality of 14.06 | Confirmed; 14.06 only through secondary sources |
| Chatterjee–Samuelson | Confirmed; formulas not re-read in the paper |
| Babaioff et al. | Confirmed |
| Roughgarden's three properties | Corrected |
| Roughgarden: pay your bid | Confirmed |
| Roughgarden: uniform price | Softened |
| Roughgarden: EIP-1559 and 5 August 2021 | Confirmed |
| Chung–Shi | Confirmed |
| Chapters cited | Confirmed; Roughgarden lecture 7 retitled |

- **Revelation principle.** Bibliographic data checked by DOI on Crossref.
  The credits were widened after Myerson's Nobel lecture (see above).
- **Myerson 1981.** Roughgarden calls the characterisation "Myerson's Lemma".
- **Edelman–Ostrovsky–Schwarz 2007 and Varian 2007.** The bibliographic data
  were checked; the agent gave the abstract's wording from memory, not
  re-fetched.
- **Ausubel–Milgrom 2006.** Chapter 1, pp. 17–40. Section 4 lists zero
  revenue, non-monotonicity, collusion by losers and multiple identities.
- **Yokoo–Sakurai–Matsubara 2004.** Bibliographic data confirmed.
- **Myerson–Satterthwaite 1983.** The impossibility is confirmed. The
  optimality of the Chatterjee–Samuelson linear equilibrium (14.06) rests on
  the abstract as quoted in a search summary and on two secondary sources
  (Satterthwaite–Shneyerov; Crawford's notes). The paper itself was not read.
- **Chatterjee–Samuelson 1983.** The formulas were not re-read in the paper,
  but my check shows they form an equilibrium.
- **Babaioff et al. 2012.** The abstract's own words: "iterated elimination
  of dominated strategies"; no scheme makes propagation and no self-cloning
  dominant.
- **Roughgarden: the three properties.** Corrected: DSIC, MMIC,
  OCA-proofness.
- **Roughgarden: the rules.** Pay your bid is MMIC and OCA-proof but not
  DSIC. The uniform price is softened as described above. EIP-1559 is
  confirmed: all three except "a sudden demand spike". The journal version is
  J. ACM 71(4), 2024.
- **EIP-1559.** 5 August 2021, confirmed (4 August in US time).
- **Chung–Shi 2023.** SODA, pp. 3856–3899: "no … non-trivial … TFM" is both
  UIC and 1-SCP with a finite block. "Non-trivial" is kept.
- **Chapters.** Roughgarden lectures 3, 4 (contains the revelation
  principle), 5 and 7 (retitled as above). Nisan et al. ch. 9, Krishna ch. 5
  (5.3.1 VCG, 5.3.3 bilateral trade), Tadelis ch. 14, and Shoham and
  Leyton-Brown ch. 10 with 10.4.5 "Drawbacks of VCG" are all confirmed.

## Timings, heights, chunks

**Browser timings** (headless Chrome, to the updated DOM; second frame in
brackets):
- Panel A, a change of v: 3–5 ms (12–19).
- Panel C, n from 20 to 40: 92 ms (95).
- Panel C, n = 40, k = 60: 64 ms (66).
- Panel C, n = 40, k = 39: 69 ms (74).
- Panel C, "Run again": 67 ms (74).

Panel B is instant. Nothing slow runs on page load.

**Node timings:** Panel C, 10,000 blocks: 73 ms at n = 40, k = 60; 28 ms at
n = 20, k = 10.

**Figure heights:** F1 355 px and F2 408 px at 1280 px, EN and IT (guide about
380, up to 420). At 375 px in Italian, 656 and 803 px.

**Chunks:** the module chunk is 79.0 kB. `auctions/block.js` is now a 2.3 kB
chunk shared with module 11, whose chunk fell from 74.0 to 71.9 kB.

## Italian terms (added to the status file's table)

| English | Italian | Source / note |
|---|---|---|
| mechanism design | progettazione dei meccanismi (*mechanism design*) | Li Calzi, Ca' Foscari; "disegno dei meccanismi" not found |
| revelation principle | principio di rivelazione | |
| direct mechanism | meccanismo diretto | |
| incentive compatibility | compatibilità degli incentivi | PoliMi, Teramo; "con gli incentivi" not found |
| dominant strategy | strategia dominante | |
| Myerson's lemma | lemma di Myerson | |
| allocation rule; monotone | regola di allocazione; monotona | calques, no source |
| virtual value | valore virtuale | calque, no source |
| optimal auction | asta ottima | calque, no source |
| VCG mechanism | meccanismo VCG (Vickrey–Clarke–Groves) | |
| externality | esternalità | |
| individual rationality | razionalità individuale | "volontario" in F2 |
| budget balance | pareggio di bilancio | no source in this sense; "in pareggio" in F2 |
| bilateral trade | scambio bilaterale | no source |
| double auction | asta doppia | it.wikipedia |
| generalized second price | asta generalizzata al secondo prezzo (*generalized second price*, GSP) | |
| false-name bids | offerte sotto falso nome (*false-name bids*) | no source |
| Sybil attack | attacco Sybil | |
| collusion | collusione, colludere | |
| transaction fee mechanism | meccanismo delle commissioni (*transaction fee mechanism*) | |
| base fee | commissione base (*base fee*) | |
| MMIC, OCA-proofness | kept in English | |
| designer; report | progettista; dichiarazione | |
| posted price; split the difference | prezzo fisso; dividere la differenza | |

"Teorema di Myerson–Satterthwaite" is not used as a name: the text says
"Myerson e Satterthwaite hanno mostrato".

## Check results (final code, one at a time, details in the log)

All runs: 0 failures.

- `npx vite build`: OK.
- check-game-theory-01 … 12, all PASS:

  | Check | Time | PASS |
  |---|---|---|
  | 01 | 15 s | 102 |
  | 02 | 24 s | 124 |
  | 03 | 81 s | 119 |
  | 04 | 8 s | 121 |
  | 05 | 2 s | 136 |
  | 06 | 1 s | 136 |
  | 07 | 1 s | 139 |
  | 08 | 1 s | 124 |
  | 09 | 1 s | 104 |
  | 10 | 1 s | 133 |
  | 11 | 16 s | 119 |
  | 12 | 25 s | 111 |

- `check-index.mjs`: game-theory 80, network 76, complexity 72 checks.
- `check-links.mjs`: 131 checks.
- `check-module.mjs` and the functional check, one module per command:

  | Module | check-module | functional |
  |---|---|---|
  | 01 | 56 | 32 |
  | 02 | 56 | 49 |
  | 03 | 56 | 39 |
  | 04 | 56 | 45 |
  | 05 | 56 | 39 |
  | 06 | 60 | 41 |
  | 07 | 68 | 41 |
  | 08 | 56 | 43 |
  | 09 | 60 | 42 |
  | 10 | 60 | 36 |
  | 11 | 60 | 29 |
  | 12 | 56 | 29 |

- `build-main.mjs` and `compare-main.mjs`: 144 checks.
- `npm run build`: OK. `npm run check:dist`: 108 checks.

## For Adriano to decide

- The single fake at k = n: the panel shows 95.24, against the prompt's
  "none".
- The box is a little over 300 words.
- The Italian calques with no source: valore virtuale, asta ottima, scambio
  bilaterale, offerte sotto falso nome, meccanismo delle commissioni.
- The lectures carry the DRAFT marker.
