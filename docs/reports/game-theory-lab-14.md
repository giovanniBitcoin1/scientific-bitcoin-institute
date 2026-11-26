# Game Theory Lab 14 — report

Prompt `prompts.local/game-theory-lab-14.md`: module 14 "Capstone: the
price of security" (`capstone-the-price-of-security`), stage 0 (the "Next"
links), stage 2 (the close of the lab). Working log:
`docs/reports/game-theory-lab-14-log.md`. Nothing pushed, `main` untouched.

## Commits (local, branch `game-theory-lab`)

1. 200c0c6 "Game Theory Lab 14: The price of security" (WIP a55eec8,
   e8b91b9, fe2e357 squashed; stage 0 included; status file updated; module
   14 "ready").
2. 96efdc5 "Game Theory Lab: close" (stage 2: the status file).
3. "Game Theory Lab 14: report" (this file and the working log).

## Stage 0: the "Next" links

The prompt's premise did not hold: no lecture of modules 01–13 linked its
successor in the text. The "Next" sections only named the next module
("Module 03 shows…"). The working link was the engine's "Next module →"
button under each lecture (`LabLecture.jsx`), and for module 13 it was plain
text while module 14 was not ready. I linked the successor's name in the
text of all 13 modules, EN and IT (26 phrases, each found exactly once by a
script), so the text and the button agree. Module 14 is ready, so module
13's button is now a link too. check-links.mjs: 0 failures of 131.

## Module 14: what was built

- **Lecture**, EN 1,727 words and IT 1,791 (limit 1,500–1,800; the Italian
  was 1,865 at first and I trimmed it). Seven sections in the prompt's
  order, no box, DRAFT marker on the first line, links to modules 02, 04, 06,
  10, 11, 12 and 13.
- **F1 "Flow against stock"**: k + e on a log slider from 1 to 1,008
  (default 12), A from 1.01 to 3 with a "Best A" pill (it opens on A*
  exactly), V_attack on a log slider from $1 million to $100 billion
  (default $1 billion), p_block on a log slider (default $204,425). The chart
  draws A·t(A)·p_block against A on a log y axis, with A* marked, the current
  A as a dot, and V_attack as a line. Readouts: t(A), A·t(A), the share A/(1
  + A), A* and A*·t(A*), the gross cost, the p_block needed (per block with
  its share of V, per day, per year, and as a multiple of p_block), and the
  verdict.
- **F2 "The halving clock"**: the subsidy from 2009 to 2140 as a step line
  on a log scale. Halvings 1–4 are at their real dates, then ten minutes a
  block. The chart shows today's 0.02 BTC of fees, the 3.145 BTC line, and
  a fee-growth slider (0–20% a year) that draws subsidy plus fees. A table
  for 2028, 2032, 2036 and 2040 gives the subsidy, the fees needed, the
  multiple of today's, and the budget with the chosen growth.
- **Panel A "The cost of an attack"**: eleven number fields, each with its
  dated source shown under it, plus the collapse switch. A "Test values
  (exercises)" pill loads the round test values. Outputs: p_block; A* with
  her share; t(A*); the gross flow cost; her hardware; the attack's energy in
  GWh and $; the stock lost when collapse is on; and the zero-profit check
  (honest energy per block and its share of p_block, what is left per block
  and per year, and the yearly return on the network's hardware). There is
  one verdict line per objection: flow, rent, collapse, energy,
  confirmations, users.
- **Panel B "When only fees pay"**: S from 0 to 3.125, f on a log slider
  from 0.01 to 5, presets "Today", "2028: S 1.5625, f 0.5" and "Fees only",
  and 1,000 or 100,000 blocks with a run number. Bars show the last 100
  rewards (orange above twice the average). A table gives the mean, CV, and
  the shares above 2× and 3×, exact against simulated with standard errors.
  The panel says plainly that it uses Carlsten et al.'s simplification.
- **Panel C "Your own estimate"**: Panel A's fields, each with a source
  field (pre-filled with the dated source) and a date field, and the same
  outputs. It ends with the sentence "Under these assumptions, an attack
  worth V is / is not deterred …" and a plain-text summary with a Copy
  button. Nothing is stored; the functional check confirms there is no
  localStorage key of its own.
- **Code**: `budish.js`, `schedule.js`, `fees.js`, `defaults.js`,
  `money.js`, `attack.jsx` (shared by A and C), two figures, three panels,
  `texts.js`, `index.js`. Self-check `scripts/lab/check-game-theory-14.mjs`;
  functional check
  `scripts/lab/browser-checks/modules/game-theory-capstone-the-price-of-security.mjs`;
  `expect.json` gained module 14.

## What differs from the spec

- **Sections 3 and 4 quote the dated defaults**, as the prompt asked where
  they differ from the test values:
  - p_block is $189,882 (prompt: about $200,000).
  - With k + e = 12 the flow deters up to $3.80 million (prompt: about $4
    million); with k + e = 1,008, up to $208.68 million (prompt: about $225
    million).
  - The hardware is $26.62 billion (prompt: about $21 billion), at 1.43 ×
    1,019 EH/s × $18.28 per TH/s.
  - The attack's energy is 45.85 GWh, $2.29 million (prompt: about $2.8
    million), at 13.5 J/TH and $0.05 per kWh.
  - The test values ($204,425, $4.09 million, $224.7 million, $21.44
    billion, $2.83 million) appear in the exercises, in observe item 7, and
    behind Panel A's "Test values" pill.
- **The double spender is cited to Narayanan et al. section 2.3, not 5.5.**
  Section 5.5 holds Goldfinger, bribery and the forking attacks; the
  double-spend attack itself is in 2.3. The reading list gives both.
- **k + e is capped at 1,008 in Panel A's field.** The prompt gave no bound.
  At 10,000 an update took 348 ms; F1 and Budish's table already stop at
  1,008, and at 1,008 an update takes 54–58 ms.
- **Panel B has three presets.** f's log slider cannot land on 0.5 exactly
  (it gives 0.499), and exercise 6 needs exactly 0.5. The block counts are
  1,000 and 100,000.
- **F1 opens on A* exactly**, not on a rounded slider value. The A slider
  moves by 0.01.
- **One efficiency figure serves both the attack and the zero-profit
  check.** The dated 13.5 J/TH is a current machine's specification, so the
  honest network's energy is understated. The source line under the field
  says so: "the network's average is higher".
- **Equation (2) is written with A, as the prompt has it.** Budish's QJE
  text writes (2) with A*, the attacker's best choice; the lecture says she
  chooses A* before writing (3).
- **The source line under Panel A's k + e field** says "an hour of
  confirmations and an hour of escrow". Budish's k is "the number of blocks
  in which the attacker places transactions" (k = 6, e = 6). The lecture
  uses his definition; the label is a loose paraphrase you may want reworded.
- **Number inputs follow the browser's locale.** On this Italian Windows
  they show a decimal comma on the English page too. That is the browser's
  behaviour, not ours.

## Exercise answers

All six agree with the prompt, recomputed by the code and pinned by the
self-check:

1. 1.43; 59%; 13.99; 20.0; 5.00% (720% a day).
2. $204,425; about $4.09 million ($4,088,481); about $224.7 million
   ($224,666,656).
3. About $50.0 million ($50,000,232); 244.6 times; about $2.63 trillion.
4. $21.44 billion; 56.67 GWh, $2.83 million.
5. 1.5825 BTC (79.125 times 0.02); 2.3638 BTC (118.1875 times).
6. 13.5%; 5.0%; 0.59%.

## Self-check numbers (`check-game-theory-14.mjs`: 91 PASS, 0 FAIL, about 1 s)

Every number in the prompt's self-check list agrees with the code:

- **Table II**: all 24 values. The paper's gross-cost column at k + e = 12
  (59.42, 34.90, 23.63, 20.41, 20.14, 24.39) agrees too.
- **Best A and A·t(A)**:

  | k + e | A* | A*·t(A*) | Share | Note |
  |---|---|---|---|---|
  | 6 | 1.5669 | 11.7025 | 0.6104 | |
  | 12 | 1.4293 | 19.9999 | 0.5884 | t(A*) = 13.9928 |
  | 144 | 1.1613 | 174.4397 | 0.5373 | |
  | 1,008 | 1.0739 | 1,099.0175 | 0.5178 | |

- **Payment as a share of V_attack** (k + e = 6, 12, 144, 1,008):
  - per block: 8.545%, 5.000%, 0.573%, 0.091%;
  - per day: 1,230.5%, 720.0%, 82.55%, 13.10%;
  - per year: 449,135%, 262,801%, 30,131%, 4,782%.
- **Panel A, test values** (k + e = 6, 12, 144, 1,008):
  - p_block 204,425.
  - Largest attack deterred: 2,392,283; 4,088,481; 35,659,843; 224,666,656.
  - p_block needed for $1 billion: 85,451,838; 50,000,232; 5,732,639;
    909,904 (4.491, 2.628, 0.301 and 0.048 trillion a year).
  - Hardware: 23.503, 21.440, 17.420, 16.109 billion.
  - Attack energy: 33.16, 56.67, 494.25, 3,113.88 GWh, that is 1.658,
    2.833, 24.712, 155.694 million dollars.
  - Zero-profit check: 141,667 a block (69.3% of p_block), 62,758 left,
    3.299 billion a year, 22.0% of 15 billion.
- **Panel B, exact**:
  - S = 3.125, f = 0.02: CV 0.00636, both shares below 1e-60.
  - S = 1.5625, f = 0.5: CV 0.24242, shares 0.00595 and 0.00010.
  - S = 0: CV 1, shares 0.13534 and 0.04979 for every f.
  - Simulated shares at 100,000 blocks are within 4 standard errors (five
    settings × seeds 1–3).
- **F2**:
  - Subsidy 50 / 25 / 3.125 / 1.5625 BTC at heights 0, 210,000, 840,000
    and 1,050,000.
  - 33 halvings to 0. Total 2,099,999,997,690,000 sat in integer arithmetic,
    also in BigInt with `>>`.
  - Fees needed: 1.5825, 2.36375, 2.754375, 2.9496875 BTC; multiples
    79.125, 118.1875, 137.71875, 147.484375.
- **Independent checks**:
  - A Monte Carlo of the attack race (40,000 runs, four cases) is within 4
    standard errors of t(A).
  - The negative binomial sums to 1.
  - Heights and years invert each other.
  - The attack's energy over the flow cost equals the honest energy over
    p_block, exactly.
- **Quoted on the page**: every number of the lecture, of the three
  "What to observe" lists and of the exercises, in both languages.

## Numbers behind "What to observe"

Panel A, dated defaults (k + e = 12 unless stated):

| Item | Values |
|---|---|
| Basics | p_block $189,882; A* 1.43 (58.8%); t(A*) 13.99; deters up to $3.80 million |
| Rent | 0.87% for rent against the 143% she needs |
| Hardware | $26.62 billion |
| Attack energy | 45.85 GWh, $2.29 million; 60.4% of the flow cost |
| Collapse, 50% | $13.31 billion lost, $13.32 billion in all: deterred |
| Collapse, 1% | $266.24 million lost, $270.04 million in all: not deterred |
| k + e = 1,008 | A* 1.07, deters up to $208.68 million |
| Zero-profit check | $114,638 a block (60.4%), $75,245 left, $3.95 billion a year, 21.2% on $18.63 billion |
| Test values | 69.3% and 22.0%; $204,425; $4.09 million |

Panel B, run no. 1:

| Setting | Values |
|---|---|
| Today | CV 0.00636; exact share above twice 1.9 × 10^-69 |
| Fees only, 100,000 blocks | exact 13.53% and 4.98%; simulated 13.42% ± 0.11% and 4.91% ± 0.07%, the same for f = 0.02 and 5 |
| Fees only, 1,000 blocks | 13.30% ± 1.07% and 5.70% ± 0.73% |
| 2028 | CV 0.24242; 0.59% exact; 0.58% ± 0.02% simulated |

Panel C: under the dated defaults, $1 billion is not deterred and $3
million is.

## The "check" items

Confirmed:

- **Budish (2025)**: QJE 140(1), 1–62, and NBER WP 24717 (2018).
- **The three equations**: Proposition 1, Definition 2, Theorem 1. His text
  says "trust support" (the lecture mentions the term once), and (2)–(3) use
  A*.
- **The gross cost and Theorem 2** ("Zero Net Attack Cost"): with no
  frictions, no difficulty change and no fall in price, the net cost is
  exactly zero.
- **The base case**: e = 6, k = 6, A* = 1.43 (59%), t = 13.99, 5% a block,
  720% a day, 262,801% a year, $2.63 trillion for $1 billion.
- **Table II**: all 24 values reproduced.
- **The stock term and sabotage**: Section V, "Specific Capital and
  Collapse". This includes the factor of about 2,500 and the sentence "Collapse
  risk does not seem like a plausible foundation…", which the EN lecture
  quotes and the IT lecture paraphrases.
- **Bonneau 2016**: LNCS 9604, 19–26. It covers renting, a negative-fee
  mining pool, and bribery.
- **Moroz et al.**: a war of attrition with a subgame-perfect no-attack
  equilibrium (Theorem 3.1). Published at Cryptoeconomic Systems 2020,
  according to the arXiv comment.
- **Auer**: BIS WP 765, 21 January 2019.
- **Carlsten et al.**: CCS 2016, 154–167. All four claims are confirmed,
  and so is the simplification (a constant fee rate, all pending fees in the
  next block).
- **Huberman et al.**: RES 88(6), 3011–3040.
- **The subsidy schedule**: Bitcoin Core's 210,000 and `>>`, the Bitcoin
  Wiki, the next halving expected around April 2028.
- **Nakamoto**: sections 6 and 11.

Softened or corrected:

- **Narayanan 5.5** is cited for Goldfinger and bribery; the double spend is
  cited to 2.3.
- **Goldfinger** (Kroll, Davey and Felten 2013): the PDF returned HTTP 500.
  The name is confirmed by a search snippet of the paper and by Narayanan
  5.5, and the lecture paraphrases without quoting.
- **Budish's symbols**: k is "the number of blocks in which the attacker
  places transactions", not confirmations; the lecture says so.
- **Auer's argument**: he writes "free-ride", not "public good", and the
  lecture says free-ride.
- **Moroz et al.**: "Cryptoeconomic Systems 2020" is from the arXiv comment;
  I did not see the proceedings.

Panel A's dated defaults (looked up on 26 November 2026; no Coin Metrics):

| Input | Value | Source and date |
|---|---|---|
| Price | $60,374 | CoinGecko, close of 25 November 2026 |
| Subsidy | 3.125 BTC | the protocol, since 20 April 2024 |
| Fees | 0.0201 BTC a block (0.64% of revenue) | Hashrate Index, week to 23 November 2026 |
| Hash rate | 1,019 EH/s | Hashrate Index, 30-day average, 23 November 2026 |
| Hardware | $18.28 per TH/s | Luxor's ASIC price index for machines under 14 J/TH, via The Block, 24 November 2026 |
| Efficiency | 13.5 J/TH | Antminer S21 XP maker's specification |
| Electricity | $0.05 per kWh | assumption (CBECI's constant) |
| k + e | 12 | Budish's base case |
| V_attack | $1 billion | assumption |
| Rentable share | 0.87% | NiceHash, 8.85 EH/s, 25–26 November 2026 |
| Collapse loss | 50% | assumption |

The hardware price has been unchanged since August and may be stale; the
lecture says so. A fee figure in the press that came from Coin Metrics was
not used.

Chapters cited:

- Budish: sections III, IV and V.
- Narayanan et al.: ch. 2 (2.3) and ch. 5 (5.5).
- Nakamoto: sections 6 and 11.

## Italian terms chosen for module 14

All are added to the status file's table:

| Term | Source |
|---|---|
| condizione di profitti nulli | "condizione di profitto nullo" not found |
| vincolo di compatibilità degli incentivi | Unife |
| flusso e stock | Teramo |
| attacco del 51% ("attacco di maggioranza" as a gloss) | |
| doppia spesa | |
| *escrow* (gloss "deposito in garanzia") | |
| capitale specifico | "capitale specializzato" not found |
| noleggio di potenza di calcolo | |
| sabotaggio, contrattacco, attacco *Goldfinger* | no source |
| corruzione (*bribery*) | |
| guerra di logoramento | UniBo |
| sussidio del blocco | weak source |
| *halving* (gloss dimezzamento) | |
| *undercutting*, *mining gap* | kept |
| *free rider* | |
| conferme | |

## Browser: timings, figure heights, chunk

**Timings**, to the updated DOM (second frame in brackets):

| Change | Time |
|---|---|
| F1, a change of k + e at 1,008 | 19 ms (25) |
| Panel A, k + e | 58 ms (60) |
| Panel B, "Run again" at 100,000 blocks | 6 ms (11) |
| Panel B, a change of S | 9 ms (15) |
| Panel C, a change of price | 32 ms (38) |

Nothing slow runs on load.

**Figure heights**: 408 and 408 px at 1280 (EN), 408 and 388 (IT), against a
guide of about 380, up to 420. At 375 px (IT) they are 763 and 552. The first
build gave F1 526 (EN) and 586 (IT); I shortened the readout, the chart
height and the labels.

**Chunk**: module 14 is 68.0 kB (24.8 kB gzip).

## Checks of the last run (final code, before the squash)

- **Build**: `npx vite build` passed.
- **Self-checks**, PASS count and time (0 FAIL in each):

  | Module | PASS | Time |
  |---|---|---|
  | 01 | 102 | 15.4 s |
  | 02 | 124 | 23.8 s |
  | 03 | 119 | 75.2 s |
  | 04 | 121 | 10.1 s |
  | 05 | 136 | 4.0 s |
  | 06 | 136 | 1.6 s |
  | 07 | 139 | 1.5 s |
  | 08 | 124 | 2.2 s |
  | 09 | 104 | 0.7 s |
  | 10 | 133 | 1.3 s |
  | 11 | 119 | 18.5 s |
  | 12 | 111 | 24.2 s |
  | 13 | 106 | 16.5 s |
  | 14 | 91 | 0.9 s |

- **check-index**: game-theory 0 failures of 76, network 0/76, complexity
  0/72.
- **check-links**: 0/131.
- **check-module and the functional check**, one module per command (0
  failures in every run):

  | Module | check-module | Functional check |
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
  | 13 | 56 | 32 |
  | 14 | 56 | 39 |

- **Regression compare** against a build of main: 0/144.
- **`npm run build`**: exit 0.
- **`npm run check:dist`**: 0/108.

Along the way:

- The first run of check-game-theory-14 had 4 FAILs, all in the script.
- The first run of the functional check had 1 FAIL, in the check, plus the
  two real problems above (timing and heights), both fixed.
- A node one-liner corrupted the self-check file during a fix (`$`` in a
  replacement). I deleted the file and wrote it again in full; that is in
  the log.

## The whole lab

| No. | Module | Commit |
|---|---|---|
| 01 | What is a game? | 7641e52 (fixes 4b49860) |
| 02 | Nash equilibrium | c35c609 (fixes 7f31ff4) |
| 03 | Mixed strategies and zero-sum games | 8af0dc4 |
| 04 | Games in time and credible commitment | e4af701 (fixes 1fa2004) |
| 05 | Incomplete information and signals | e0c460e |
| 06 | Repeated games and reputation | 8b2f491 |
| 07 | Evolution and learning | b3b686f |
| 08 | Congestion and the price of anarchy | 6af4fff |
| 09 | Games on networks | d34fc3e |
| 10 | Coalitions and sharing | 054b3b8 |
| 11 | Auctions | 930565b |
| 12 | Designing the rules | 34a9392 |
| 13 | Mining as a game | 23b9018 |
| 14 | Capstone: the price of security | 200c0c6 |

Other commits:

- 479e821 skeleton;
- 9d1a32d "Labs: open lab pages at the top";
- 8601885 "Game Theory Lab: Italian terms";
- 96efdc5 close;
- one report commit per prompt.

**Read-only git facts** (no branch changed):

- `main` is ddfed85, an ancestor of `game-theory-lab`, with no commit
  missing from the branch.
- 34 commits on `game-theory-lab` are not on `main` (35 with this report).
- Against `main`: 270 files, 46,725 insertions, 12 deletions. By folder:

  | Folder | Files |
  |---|---|
  | `CLAUDE.md` | 1 |
  | `docs/game-theory-lab-status.md` | 1 |
  | `docs/reports` | 25 (27 with this report and its log) |
  | `scripts/lab` | 14 checks + 1 generator |
  | `scripts/lab/browser-checks` | 5 shared files + `expect.json` + 14 module checks |
  | `src/App.jsx` | 1 |
  | `src/components/lab/game-theory` | 173 |
  | `src/content/game-theory-lab` | 28 |
  | `src/data/lab` | 3 (module list, paths, registry) |
  | `src/pages/lab` | 3 (LabChapter, LabIndex, loaders) |

- **Nothing outside the allowed paths**: no file of the Complexity or
  Network Lab, no menu (`Header.jsx`, `nav.json`), nothing in
  `public/accademia`, no `package.json`, no `src/data/lab/config.json`.
  The engine files touched date from the skeleton and from "open lab pages
  at the top".

**DRAFT markers**: all 28 lecture files (14 × EN, IT) still start with
`<!-- DRAFT: to be reviewed by Adriano -->`.

**The index**: 14 modules, titles and summaries, no "In preparation"
badge, checked in EN and IT, locked and admin.

## Decisions left to Adriano

1. **Rereading** the 28 DRAFT lectures and removing the marker from each
   one approved.
2. **The Italian terms without a source** (listed in the status file's open
   items, modules 06–14).
3. **The path `/game-theory-lab`**, with Giovanni (one line in `paths.js`).
4. **Merging and pushing** `game-theory-lab`; nothing has been pushed.
5. **When to refresh** module 14's dated defaults (the hardware price may
   already be stale). Change `defaults.js` and the lecture together;
   `check-game-theory-14.mjs` pins them to each other.
6. **The k + e source label in Panel A** ("an hour of confirmations and an
   hour of escrow"), if you want it closer to Budish's definition of k.
