# Game Theory Lab 12 — working log

Prompt: `prompts.local/game-theory-lab-12.md` (module 12, `mechanism-design`;
stage 0: the "Long checks" rule gets the one-module-per-command rule for the
browser checks).

## Start

- 2026-11-26. Branch `game-theory-lab`, tree clean, HEAD ccf4bf2 "Game Theory
  Lab 11: report". Status file: module 11 done, nothing in progress; report 11
  committed. Preconditions hold.
- Stage 0: the "Long checks" rule in the status file now says that browser
  checks run one module per command (check-module, then the functional check
  of that module, then the next module), never in a loop over modules, and the
  same for any batch that could pass the tool's limit.
- Sources: looked up by a helper agent (web), results below under "Sources".

## Module 12: logic

- First run of `check-game-theory-12.mjs` (logic only): 1 FAIL, my own
  tolerance: Simpson's rule (2,000 intervals) for the lottery payment is
  within 1.7e-9 of the closed form at H = 5; tolerance set to 1e-8. Everything
  else as the prompt says. Panel C's search over h high fakes × every place of
  the extra fake took 380 ms in Node at n = 40, k = 60 (10,000 blocks): too
  slow. For each h the n + 1 places give only three outcomes; the page now
  takes those three (O(k) per block), and the check compares it with the
  search over every place (12,000 random blocks) and with a brute force over
  multisets of fakes (200 blocks).
- My simulated Panel C values at 2,000,000 blocks (seed 1) against the
  prompt's: best cheating 381.42, 546.61, 578.00, 578.85, n = 10: 284.41
  (381.5, 546.8, 578.0, 578.8, 284.6); served 4.970, 9.209, 10.978, 11.079,
  4.599 (4.97, 9.21, 10.97, 11.07, 4.60); users' payoff 45.30, 153.55,
  209.22, 212.40, 61.87 (45.3, 153.5, 209.1, 212.3, 61.9). All within 1%. The
  cheating uniform price equals the monopolistic price in every one of the
  10,000,000 blocks.
- Difference from the prompt: at k = n = 20 the prompt says "one fake: none".
  A fake just below the 20th bid is the 21st bid, the highest losing one, so
  the price becomes v_(20): 100k(n + 1 − k)/(n + 1) = 95.24 instead of 0. The
  panel shows 95.24; "none" only for k > n (no k-th bid).

## Sources

Looked up on 26 November 2026 by a helper agent (Crossref by DOI, arXiv,
nobelprize.org, authors' and course pages, Cambridge Core and other tables of
contents, Italian theses and course slides).

- Gibbard 1973 Econometrica 41(4) 587–601; Myerson 1979 Econometrica 47(1)
  61–73; Dasgupta–Hammond–Maskin 1979 RES 46(2) 185–216: confirmed. Myerson's
  Nobel lecture: the revelation principle found independently by Dasgupta,
  Hammond and Maskin 1979, Harris and Townsend 1981, Holmström 1977, Myerson
  1979, Rosenthal 1978, "building on ideas of Gibbard (1973)". Lecture:
  "among others".
- Myerson 1981 MOR 6(1) 58–73: confirmed; Roughgarden calls the
  characterisation "Myerson's Lemma" (lecture 3).
- Edelman–Ostrovsky–Schwarz 2007 AER 97(1) 242–259; Varian 2007 IJIO 25(6)
  1163–1178: confirmed (GSP: truth-telling not dominant). Abstract wording
  from the agent's memory, not re-fetched.
- Vickrey 1961, Clarke 1971 Public Choice 11(1) 17–33, Groves 1973
  Econometrica 41(4) 617–631: confirmed.
- Ausubel–Milgrom 2006, ch. 1 pp. 17–40: section 4 lists "low (or zero)
  seller revenues; non-monotonicity of the seller's revenues in the set of
  bidders…; vulnerability to collusion by a coalition of losing bidders; and
  … multiple bidding identities". Confirmed.
- Yokoo–Sakurai–Matsubara 2004 GEB 46(1) 174–188: confirmed.
- Myerson–Satterthwaite 1983 JET 29(2) 265–281: impossibility confirmed; the
  optimality of the Chatterjee–Samuelson linear equilibrium under uniform
  priors confirmed through the abstract (as quoted in a search summary) and
  two secondary sources (Satterthwaite–Shneyerov; Crawford's notes).
- Chatterjee–Samuelson 1983 OR 31(5) 835–851: confirmed; the linear
  strategies are the standard ones (not re-read in the paper; my own check
  confirms they are an equilibrium).
- Babaioff–Dobzinski–Oren–Zohar EC 2012 56–73: abstract (arXiv 1111.2626):
  the protocol gives "an incentive to nodes to not broadcast transactions";
  the scheme is Sybil-proof with a small payment overhead, "achieved with
  iterated elimination of dominated strategies"; "there are no reward schemes
  in which information propagation and no self-cloning is a dominant
  strategy". Confirmed.
- Roughgarden 2021: EC 2021; journal version J. ACM 71(4), 2024 (doi
  10.1145/3674143). CORRECTED names: DSIC (not "UIC", which is Chung–Shi's
  term), MMIC (myopic miner incentive compatibility), OCA-proofness
  (off-chain agreements). His table: first price MMIC and OCA-proof, not
  DSIC; second price not MMIC (fake transactions), DSIC and OCA-proof only
  "almost" for a block; EIP-1559 MMIC and OCA-proof, DSIC "except when there
  is a sudden demand spike". The box follows this.
- EIP-1559 with London, 5 August 2021 (block 12,965,000; 4 August in US
  time); the base fee is burned. Confirmed.
- Chung–Shi SODA 2023 pp. 3856–3899: "no single-parameter, non-trivial,
  possibly randomized TFM can simultaneously satisfy UIC and 1-SCP" with
  finite block size. Confirmed ("non-trivial" kept).
- Chapters: Roughgarden lectures 3 "Myerson's Lemma", 4 "Algorithmic
  Mechanism Design" (contains the revelation principle), 5
  "Revenue-Maximizing Auctions", 7 "Multi-Parameter Mechanism Design"
  (CORRECTED: "and the VCG Mechanism" is the 2013 notes' title); Nisan et al.
  ch. 9 "Introduction to Mechanism Design (for Computer Scientists)"; Krishna
  ch. 5 "Mechanism Design" (5.3.1 VCG, 5.3.3 bilateral trade); Tadelis ch. 14
  "Mechanism Design"; Shoham–Leyton-Brown ch. 10 "Protocols for Strategic
  Agents: Mechanism Design", 10.4.5 "Drawbacks of VCG". All confirmed.
- Italian terms: "progettazione dei meccanismi" (Li Calzi, Ca' Foscari, on
  the 2007 Nobel; PoliMi thesis "Teoria dei Meccanismi Economici"; it.wikipedia
  keeps "mechanism design"); no source for "disegno dei meccanismi".
  "principio di rivelazione" (common use, no authoritative page);
  "meccanismo diretto" ("a rivelazione diretta" at PoliMi); "compatibilità
  degli incentivi" (PoliMi; Teramo slides "vincolo di compatibilità degli
  incentivi"; no source for "con gli incentivi"); "razionalità individuale"
  (PoliMi), "vincolo di partecipazione" (Teramo; Padova thesis);
  "esternalità" (it.wikipedia); "asta doppia" (it.wikipedia "Asta
  (compravendita)"); "attacco Sybil" (it.wikipedia "Bitcoin"; also "attacco
  di Sybil"). No Italian source for: pareggio di bilancio in this sense
  (it.wikipedia's VCG page: "conti equilibrati"), valore virtuale, asta
  ottima, scambio bilaterale, GSP (kept in English), false-name bids,
  transaction fee mechanism, base fee (kept in English on it.wikipedia).

## Module 12: page

- `check-game-theory-12.mjs` with the "quoted on the page" part: all PASS at
  the first run, 24.6 s. Lecture words EN 1,503 (box 315 with its title), IT
  1,583 (box 347).
- `npx vite build`: OK. Module chunk 79.0 kB; `auctions/block.js` is now a
  2.3 kB chunk shared with module 11 (module 11's chunk 71.9 kB, was 74.0).
- `check-module.mjs game-theory mechanism-design`: 0 failures of 56.
- `modules/game-theory-mechanism-design.mjs`, first run: 1 FAIL, Panel B's
  table 19 px wider than its box at 375 px (Italian); inputs narrowed to w-8
  on small screens. Rebuilt; rerun 0 failures of 29. Timings (to the updated
  DOM): Panel A 3–5 ms; Panel C n 20 → 40 92 ms, n = 40 k = 60 64 ms, k = 39
  69 ms, "Run again" 67 ms. Figure heights 1280 px: 355 and 408 (EN and IT);
  375 px IT: 656 and 803.

## CHECKS (final code, one at a time)

- `npx vite build`: OK (13.2 s).
- check-game-theory-01 … 12, all PASS: 01 15 s (102), 02 24 s (124), 03 81 s
  (119), 04 8 s (121), 05 2 s (136), 06 1 s (136), 07 1 s (139), 08 1 s
  (124), 09 1 s (104), 10 1 s (133), 11 16 s (119), 12 25 s (111).
- `check-index.mjs`: game-theory 0 of 80, network 0 of 76, complexity 0 of 72.
- `check-links.mjs`: 0 of 131.
- One module per command, check-module | functional: 01 0/56 | 0/32; 02
  0/56 | 0/49; 03 0/56 | 0/39; 04 0/56 | 0/45; 05 0/56 | 0/39; 06 0/60 |
  0/41; 07 0/68 | 0/41; 08 0/56 | 0/43; 09 0/60 | 0/42; 10 0/60 | 0/36; 11
  0/60 | 0/29; 12 0/56 | 0/29.
- `build-main.mjs` then `compare-main.mjs`: 0 of 144.
- `npm run build`: OK (validate, vite build, postbuild). `npm run check:dist`:
  0 of 108.
