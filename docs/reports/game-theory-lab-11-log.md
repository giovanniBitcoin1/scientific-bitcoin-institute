# Game Theory Lab 11 — working log

Prompt: `prompts.local/game-theory-lab-11.md` (module 11, `auctions`; stage 0
empty: nothing to fix from module 10).

## Start

- 2026-11-26. Branch `game-theory-lab`, tree clean, HEAD 36eaee7 "Game Theory
  Lab 10: report". Status file: module 10 done, nothing in progress; report 10
  committed (`git ls-files` lists it). Preconditions hold.
- Seeded generator: `mulberry32` from `src/components/lab/rng.js` (the lab's
  generator since module 01).

## Module 11: logic

- `node scripts/lab/check-game-theory-11.mjs` (logic only, first run): 1 FAIL,
  my own expectation: the second-price seller's revenue at a = 10, n = 5,
  k = 0 is 150 + 10·2/6 = 153.33, not 146.67 (code and simulation agree on
  153.33). Fixed the check.
- Panel C at n = 40, k = 39 took 181 ms in Node with the bid formula per
  winner. Scratch test of a table of the bid with linear interpolation: 1,025
  points 7.6e-5, 4,097 points 4.7e-6, 16,385 points 3.0e-7 (worst error on the
  0–100 scale over six (n, k)); the run drops to about 30 ms. The page uses
  the 16,385-point table; the check pins its error (< 1e-6) and compares
  20,000 blocks with the table and with the formula (means equal to 1e-6).
- Rerun: all PASS, 14.6 s (seven runs of 2,000,000 blocks: 12.5 s). Every
  number of the prompt's self-check list agrees. My simulated values at
  2,000,000 blocks (seed 1) against the prompt's: pay-your-bid sd 16.05,
  20.93, 15.08 (16.03, 20.89, 15.06); monopolistic 381.4, 546.6, 578.0, 578.8,
  578.8 at 40 (381.5, 546.8, 578.0, 579.0); served 4.97, 9.21, 10.98, 11.08
  (same); value served 700.2 / 737.9 and 791.3 / 999.8 (700.2 / 738.1, 791.3 /
  1,000.0); n = 10: 284.4 served 4.60, 311.2 served 5.85 (284.6, 4.60; 311.4,
  5.85). All within 1%.
- Timings in Node: Panel A at n = 10 and 100,000 auctions 55 ms; Panel B
  10,000 auctions about 2 ms; Panel C n = 40, 10,000 blocks 38 ms; Panel C's
  revenue chart (k = 1 … 80, 10,000 blocks, one sort per block) 29 ms.

## Sources

Looked up on 26 November 2026 by a helper agent (Crossref, full texts on
course sites and authors' pages, Federal Register, Treasury, BIPs, Bitcoin
Core release notes and source, Italian course notes and explainers).

- Vickrey 1961, J. Finance 16(1) 8–37: p. 20, second-price award, bidding the
  full value optimal (no "dominant" wording); first-price tender "isomorphic
  with the Dutch auction", second price "logically isomorphic to the
  progressive auction"; equal average price (N − 1)/(N + 1) only in the
  uniform ("homogeneous rectangular") case; the English price variance larger
  by 2N/(N − 1) (as the self-check's ratio). Lecture: "Vickrey 1961 in
  special cases".
- Lucking-Reiley 2000, JEP 14(3) 183–192: "proxy bidding looks like a
  sealed-bid, second-price Vickrey auction". Confirmed.
- Myerson 1981, MOR 6(1) 58–73: worked example with values uniform on
  [0, 100], reserve 50, no sale with probability (1/2)^n. "Whatever n" stated
  in words by Riley and Samuelson 1981 (AER 71(3) 381–392: "independent of
  the number of buyers"): both cited for the reserve.
- Bulow and Klemperer 1996, AER 86(1) 180–194: N + 1 bidders without reserve
  beat the optimal mechanism with N; their uniform example 5/12 against 1/3
  and 1/2. Confirmed.
- Capen, Clapp and Campbell 1971, JPT 23(6) 641–653: bibliographic data
  confirmed; content (ARCO engineers, low returns on offshore lease sales)
  from Kagel's survey only. Lecture: "engineers in the oil industry …
  offshore oil leases".
- Bazerman and Samuelson 1983, JCR 27(4) 618–634, full text: Boston
  University MBA students, jars worth $8.00, mean estimate $5.13, mean
  winning bid $10.01. The lecture now quotes these three figures (the draft
  said "the average bid was below the value": the paper reports the average
  estimate).
- Kagel and Levin 1986, AER 76(5) 894–920: first-price RNNE x − ε + h(x), h
  dying out (from Kagel's survey). Confirmed as "estimate minus a away from
  the ends".
- Second-price x − ε(n − 2)/n: Kagel, Levin and Harstad 1995, IJGT 24(3)
  293–319 (via Crawford and Iriberri 2007; also derived). Added to the
  lecture and the reading list.
- Milgrom and Weber 1982, Econometrica 50(5) 1089–1122: Theorems 11 and 15,
  English ≥ second ≥ first with affiliated values. Confirmed.
- Krishna 2010: ch. 2 "Private Value Auctions: A First Look", ch. 3 "The
  Revenue Equivalence Principle", ch. 6 "Auctions with Interdependent
  Values", ch. 12 "An Introduction to Multiple-Object Auctions", ch. 13
  "Equilibrium and Efficiency with Private Values" (demand reduction in
  §13.4.1, seen in the first edition's contents).
- Tadelis ch. 13 "Auctions and Competitive Bidding" (unofficial copy);
  Shoham and Leyton-Brown ch. 11 "Protocols for Multiagent Resource
  Allocation: Auctions"; Roughgarden lecture 2 "Mechanism Design Basics"
  (reading list now says so).
- US Treasury: uniform price for all marketable securities from 2 November
  1998 (Federal Register 64(15), 25 January 1999); experiment with 2- and
  5-year notes from September 1992. Confirmed.
- SegWit: BIP 141, weight ≤ 4,000,000; activated at block 481,824 on 24
  August 2017. RBF: BIP 125 (Core 0.12, 2016); full RBF default in Core 28.0
  (2024), option removed in 29.0. Minimum relay fee: 0.1 sat/vB since Core
  29.1 (September 2025), still the default; the box does not quote a number.
- Huberman, Leshno and Moallemi 2021, RES 88(6) 3011–3040; Lavi, Sattath and
  Zohar 2019, WWW 2950–2956 (abstract: revenue may fall with block size under
  pay-your-bid; monopolistic auction keeps revenue, resists the miner, shading
  gains vanish: their conjecture); Yao 2020, LIPIcs 168 1:1–1:12 (proves it).
  All confirmed.
- Italian terms: asta inglese / olandese (it.wikipedia "Teoria delle aste";
  Bosco, UniMiB; Padova thesis "ascendente", "discendente"); busta chiusa al
  primo / secondo prezzo, asta di Vickrey (it.wikipedia); valori privati
  indipendenti, valore comune, prezzo di riserva, maledizione del vincitore
  (Bosco; it.wikipedia; UniTo; UniVR); *bid shading* kept, Bosco glosses it
  "autoriduzione" (used as the gloss); "equivalenza del ricavo" (Bosco 24
  hits against 2, and the module list): chosen over "dei ricavi"; asta
  *all-pay* kept in English; aste multi-unità; asta discriminatoria
  ("pay-your-bid", Bosco), asta a prezzo uniforme, riduzione della domanda
  (Bosco); the Italian Treasury says "asta competitiva" for BOT and "asta
  marginale" for the others, not used here; commissione (Bitpanda IT,
  Bitcoin.com IT); peso del blocco, unità di peso (Bitcoin.com IT); "prezzo
  monopolistico" has no Italian source (our translation); "domanda unitaria"
  and "tasso di commissione" not attested, not used.

## Module 11: build and fixes

- Lecture words (box not counted): EN 1,582 (box 309), IT 1,601 (box 333).
- check-game-theory-11 with the quoted checks, first run: 1 FAIL, my Italian
  pattern ("0.8" for "0,8"). Fixed; 118 PASS.
- check-module game-theory auctions: 0 failures of 60 at once.
- Screenshots: Panel A's histogram tick 0.075 printed as "0.07"; the scale now
  steps by 0.1. Nothing else.
- Functional check, first run: 1 FAIL in the check (the chart was off-screen,
  so the mouse click missed: scrolled into view). Timing: Panel A at n = 10
  and 100,000 auctions took 215–1,114 ms to the second frame. Made the inner
  loop cheaper (powers by repeated products: Node 55 → 31 ms; pinned against
  bid() by a new self-check), but the browser time stayed. A trace showed
  about 50 ms of script; the rest is headless Chrome's frame scheduling (the
  same click in a separate page: 39–47 ms). The check now reports the time to
  the updated DOM and, separately, to the second frame: Panel A 63 ms (second
  frame 433) and "Run again" 40 ms; Panel B 9 ms; Panel C n 20 → 40 with the
  chart 81 ms, k at n = 40 48 ms, "Run again" 48 ms.

## Checks (final code, one at a time, foreground)

- `npx vite build`: built.
- check-game-theory-01: exit 0, 102 PASS, 13.7 s; -02: 124, 21.5 s; -03: 119,
  79.5 s; -04: 121, 7.6 s; -05: 136, 2.2 s; -06: 136, 0.9 s; -07: 139, 0.8 s;
  -08: 124, 1.2 s; -09: 104, 0.4 s; -10: 133, 0.7 s; -11: 119, 15.7 s. No FAIL.
- check-index game-theory 0/80; network 0/76; complexity 0/72; check-links
  0/131.
- check-module and functional check, eleven modules: 0 failures each (module
  56, 56, 56, 56, 56, 60, 68, 56, 60, 60, 60; functional 32, 49, 39, 45, 39,
  41, 41, 43, 42, 36, 29). I ran the eleven pairs as one loop: it passed the
  tool's 600 s limit after module 08 and the tool moved it to the
  background, against the "Long checks" rule (nothing else ran meanwhile; it
  ended with exit 0). Next time: one module per command.
- build-main 18 s; compare-main: 0/144, 369 s.
- `npm run build`: passed (validate, vite build, postbuild). `npm run
  check:dist`: 0/108.
- Module chunk 74.0 kB (24.8 kB gzip); it loads the lab's shared Slider,
  DrawToggle, ui, charts and rng chunks, nothing from other modules.

## Commits

- 930565b "Game Theory Lab 11: Auctions" (three WIP commits squashed with
  `git reset --soft 36eaee7`).
- "Game Theory Lab 11: report": the report, this log, the status file's
  "Work in progress".
