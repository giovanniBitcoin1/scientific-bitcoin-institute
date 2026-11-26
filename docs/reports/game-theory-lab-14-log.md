# Game Theory Lab 14 — working log

Prompt: `prompts.local/game-theory-lab-14.md` (module 14,
`capstone-the-price-of-security`; stage 0: the "Next" links of modules 12
and 13; stage 2: the close of the lab).

## Start

- 2026-11-26. Branch `game-theory-lab`, tree clean, HEAD 3e8969f "Game Theory
  Lab 13: report". Status file: module 13 done, nothing in progress; report 13
  committed (`git ls-files` lists it). Preconditions hold.
- Sources, dated figures and Italian terms: looked up by three helper agents
  (web), results below under "Sources", "Dated defaults" and "Italian terms".

## Stage 0: the "Next" links

- None of the "Next" (or "What comes next", "Il prossimo modulo") sections
  of modules 01–13 links its successor in the text: they name it ("Module 03
  shows…"). The working link is the engine's "Next module →" /
  "Modulo successivo →" under every lecture (`LabLecture.jsx`), a `<Link>`
  when the next module is "ready", plain text otherwise; so module 13's is
  plain text until module 14 is ready. Done for stage 0: the text names of
  the successor in modules 01–13 become links (EN and IT), so the text
  agrees with the button; checked by check-links.mjs.

## Module 14: logic

- `budish.js` (t(A) as Proposition 3 with log-binomials, A* by scan and
  golden section, the required payment, Panel A's outputs), `schedule.js`
  (integer satoshis, real dates of halvings 1–4, then ten minutes a block),
  `fees.js` (Panel B, exact and seeded), `defaults.js` (dated defaults and
  test values), `money.js`.
- First probe (Node, 145 ms for all of it): every number of the prompt's
  self-check list agrees. Table 2 (24 values) to two decimals; best A and
  A·t(A): 1.5669 11.7025 (0.6104), 1.4293 19.9999 (0.5884, t 13.9928),
  1.1613 174.4397 (0.5373), 1.0739 1,099.0175 (0.5178); per block 8.545%,
  5.000%, 0.573%, 0.091%; per day 1,230.51%, 720.00%, 82.55%, 13.10%; per
  year 449,135%, 262,801%, 30,131%, 4,782%. Panel A test values: p_block
  204,425; deterred up to 2,392,283, 4,088,481, 35,659,843, 224,666,656;
  needed for $1 billion 85,451,838, 50,000,232, 5,732,639, 909,904 (4.491,
  2.628, 0.301, 0.048 trillion a year); hardware 23.503, 21.440, 17.420,
  16.109 billion; energy 33.16, 56.67, 494.25, 3,113.88 GWh = 1.658, 2.833,
  24.712, 155.694 million; honest energy 141,667 a block (69.3%), 62,758
  left, 3.299 billion a year, 22.0% of 15 billion. Schedule: 33 halvings,
  2,099,999,997,690,000 sat; 2028 1.5825 (79.125×), 2032 2.36375
  (118.1875×), 2036 2.754375 (137.71875×), 2040 2.9496875 (147.484375×).
  Panel B: CV 0.00636, 0.24242, 1; shares 1.9e-69 and 9.6e-138, 0.00595 and
  9.6e-5, 0.13534 and 0.04979.
- My slip, not the code's: the first probe command hung (a stray `cat >`
  waiting on stdin in Git Bash); stopped and rerun from a script file.
- Dated defaults in Panel A (below): p_block $189,882; k + e = 12 deters up
  to $3,797,630, k + e = 1,008 up to $208.68 million; hardware $26.62
  billion; attack energy 45.85 GWh, $2.29 million; honest energy $114,638 a
  block (60.4%), $75,245 left, $3.95 billion a year, 21.2% of $18.63
  billion; fees 0.64% of the reward.

## Module 14: texts and self-check

- Lectures: EN 1,727 words, IT 1,865 at first (over 1,800), trimmed to 1,791
  (shorter sentences in the users' bullet, Panel A and C pointers, the
  sabotage sentence). Seven sections, no box, DRAFT marker.
- Panel B: f's log slider cannot land on 0.5 exactly (0.499), so exercise
  6 needs presets: "Today" (3.125, 0.02), "2028: S 1.5625, f 0.5", "Fees only"
  (0, 0.02).
- `scripts/lab/check-game-theory-14.mjs`, first run: four FAILs, all in the
  script (a regex hit a code comment; the Italian thousands rule handled one
  group only; one phrase needed its Italian form). Fixing them, a node
  one-liner corrupted the file (`$`` in a replacement string inserts the text
  before the match); the file was deleted and written again in full. Then
  `node scripts/lab/check-game-theory-14.mjs`: 91 PASS, 0 FAIL, 1.5 s (Monte
  Carlo of the race 0.79 s; Panel B 15 runs of 100,000 blocks 0.10 s).
- Independent checks: Table II's gross cost column at k + e = 12 (59.42 …
  24.39) agrees too; a Monte Carlo of the race (40,000 runs, four cases)
  within 4 standard errors of t(A); the negative binomial sums to 1; the
  supply in BigInt with `>>`.
- Exercise answers recomputed: all six agree with the prompt (1.43, 59%,
  13.99, 20.0, 5.00%; $204,425, $4.09 million, $224.7 million; $50.0
  million, 244.6, $2.63 trillion; $21.44 billion, 56.67 GWh, $2.83 million;
  1.5825 (79×), 2.3638 (118×); 13.5%, 5.0%, 0.59%).
- "What to observe" numbers: Panel A dated defaults as above; collapse 50%:
  $13.31 billion lost, $13.32 billion in all, deterred; 1%: $266.24 million,
  $270.04 million, not deterred; k + e = 1,008: A* 1.07, $208.68 million.
  Panel B run 1: S = 0, 100,000 blocks: 13.42% ± 0.11%, 4.91% ± 0.07% (exact
  13.53%, 4.98%), the same for f = 0.02 and 5 (same gaps); 1,000 blocks
  13.30% ± 1.07%, 5.70% ± 0.73%; S 1.5625, f 0.5: 0.58% ± 0.02% (exact
  0.59%).

## Module 14: browser

- Stage 0 done: 26 phrases linked (13 modules × EN, IT), each found exactly
  once by a script.
- `modules/game-theory-capstone-the-price-of-security.mjs`, first run: 1 FAIL
  of 39, my check (Panel B prints "0 ± 0", not "0%"); and two real problems:
  a Panel A change at k + e = 10,000 took 348 ms (the field now stops at
  1,008, as F1 and Budish's table do: 54–58 ms); F1 was 526 px (EN) and 586
  (IT) at 1280 against a guide of about 380, up to 420.
- F1 made shorter: readout in text-xs, chart height 170 (F2 too), shorter
  slider labels; measured with a throwaway script: in Italian the A label
  wrapped next to the "A migliore" pill and the legend wrapped. Then F1 408
  (EN) and 408 (IT), F2 408 and 388; at 375 px (IT) 763 and 552.
- Final run of the functional check: 0 failures of 39. Timings to the updated
  DOM (second frame): F1 k + e at 1,008 19 ms (25); Panel A 58 ms (60);
  Panel B "Run again" at 100,000 blocks 6 ms (11), a change of S 9 ms (15);
  Panel C 32 ms (38).
- Number inputs show the browser's locale (a decimal comma on this Italian
  Windows, also on the English page): the browser's choice, not ours.

## CHECKS (final code, before the squash; one at a time, foreground)

- `npx vite build`: built in 12.5 s. Module 14 chunk 68.0 kB (24.8 kB gzip).
- Self-checks (PASS, FAIL, time): 01 102/0 15.4 s; 02 124/0 23.8 s; 03
  119/0 75.2 s; 04 121/0 10.1 s; 05 136/0 4.0 s; 06 136/0 1.6 s; 07 139/0
  1.5 s; 08 124/0 2.2 s; 09 104/0 0.7 s; 10 133/0 1.3 s; 11 119/0 18.5 s;
  12 111/0 24.2 s; 13 106/0 16.5 s; 14 91/0 0.9 s. (Timed by a small Node
  runner in the scratchpad; Git Bash has no `bc`.)
- `check-index.mjs game-theory` 0 failures of 76 (99.0 s); `network` 0 of
  76 (98.9 s); `complexity` 0 of 72 (99.6 s).
- `check-links.mjs`: 0 failures of 131 (160.7 s).
- check-module and functional check, one module per command (failures of
  checks): 01 0/56, 0/32; 02 0/56, 0/49; 03 0/56, 0/39; 04 0/56, 0/45; 05
  0/56, 0/39; 06 0/60, 0/41; 07 0/68, 0/41; 08 0/56, 0/43; 09 0/60, 0/42; 10
  0/60, 0/36; 11 0/60, 0/29; 12 0/56, 0/29; 13 0/56, 0/32; 14 0/56, 0/39.
- `node build-main.mjs` (main into `.main-dist/`, temporary worktree removed:
  `git worktree list` shows only the three usual ones), `node
  compare-main.mjs`: 0 failures of 144 (370.9 s).
- `npm run build`: exit 0 (validate, vite build, post-build: 9 static
  pages, 3 redirect stubs, feed with 3 entries, sitemap). Run twice, the
  second time only to read the exit code.
- `npm run check:dist`: 0 failures of 108.

## Sources (helper agent, 26 November 2026)

- Budish (2025), QJE 140(1), 1–62, doi 10.1093/qje/qjae033 (online 17
  October 2024); NBER WP 24717, June 2018, "The Economic Limits of Bitcoin and
  the Blockchain". QJE wording: "trust support" (not computing power), c the
  cost per unit time of one unit of trust support. (1) N*c = p_block
  (Proposition 1); (2) A*·N*·c·t(A*) > V_attack (Definition 2, III.B), the
  attacker choosing A to minimize A·t(A); (3) p_block > V_attack/(A*·t(A*))
  (Theorem 1, III.C). "The core of the argument is three simple equations."
  Flow and stock: the NBER abstract ("flow" payments against "stock"
  benefits). III.B: "the left side of condition (2) is the gross cost of
  attack"; Theorem 2 "Zero Net Attack Cost Theorem" (III.D): with no cost
  friction, no difficulty adjustment and no fall in price, the net cost is
  zero (exactly). IV.B: e the escrow period, k "the number of blocks in which
  the attacker places transactions" (not literally confirmations); base
  case e = 6, k = 6. Proposition 3 (eq. 6) gives t. Table II (columns 1, 6,
  12, 36, 144, 1,008; rows to A = 5): our 24 values agree. "A* = 1.43 (or
  59%)", t 13.99; "5% per block … 720% … per day"; Table III 262,801% a
  year; a $1 billion attack "requires $2.63 trillion of annual security
  expense" (IV.C). Section V "Specific Capital and Collapse": with the
  capital lost, p_block > (r/μ)·V_attack, about 2,500 times cheaper; V.B.1
  collapse makes possible "a sabotage attack" (credits Rosenfeld 2014);
  "Collapse risk does not seem like a plausible foundation for a novel
  economic system"; conclusion: "security rests on the possibility of
  outright collapse".
- Kroll, Davey and Felten (WEIS 2013): the PDF returned HTTP 500; a search
  snippet of it: "We consider a new class of attack: the Goldfinger attack,
  in which the attacker's motivation is…"; Narayanan et al. 5.5: "This has
  been referred to as a Goldfinger attack". The lecture paraphrases, no
  quotation.
- Bonneau (2016), FC 2016 Workshops (BITCOIN), LNCS 9604, 19–26, doi
  10.1007/978-3-662-53357-4_2: renting capacity (out-of-band payment, a
  negative-fee mining pool, in-band payment via forking), bribery,
  counter-bribing.
- Moroz, Aronoff, Narula and Parkes (2020): arXiv:2002.10736 (25 February
  2020), "Appearing in Cryptoeconomic Systems 2020"; abstract: a
  counterattack "leads to a variation on the classic game-theoretic War of
  Attrition model … induces a subgame perfect equilibrium in which no attack
  occurs in the first place" (Theorem 3.1, under rising costs of successive
  attacks and a reputation cost to the victim).
- Auer (2019), BIS WP 765, 21 January 2019: users "free-ride on the fees of
  other transactions in a block and in the subsequent blockchain". "Public
  good" is not his word: the lecture says free-ride.
- Carlsten, Kalodner, Weinberg and Narayanan (2016), ACM CCS, 154–167, doi
  10.1145/2976749.2978408: high variance "due to the exponentially
  distributed block arrival time"; forking a "wealthy" block (undercutting,
  §5); selfish mining profitable with "arbitrarily low hash power share";
  §3.2 "The mining gap"; fees arrive "at a constant rate" and miners
  "always have space to include all available transactions". Four claims
  confirmed.
- Huberman, Leshno and Moallemi (2021), RES 88(6), 3011–3040, doi
  10.1093/restud/rdab014.
- Narayanan et al. (2016): 5.5 "Mining incentives and strategies" (forking
  attacks, bribery, punitive and feather forking, Goldfinger); the
  double-spend attack is in ch. 2, 2.3 "Consensus without identity using a
  block chain". The lecture cites 2.3 for double spending and 5.5 for
  Goldfinger and bribery (the prompt had 5.5 for the double spender).
- Nakamoto (2008): 6 "Incentive", 11 "Calculations".
- Subsidy: Bitcoin Core `nSubsidyHalvingInterval = 210000`, `50*COIN >>
  halvings`; Bitcoin Wiki "Controlled supply": 3.125 from block 840,000 on
  2024-04-20, 1.5625 from 1,050,000; total 20,999,999.9769 BTC. Subsidy
  positive in 33 eras; the 33rd halving (block 6,930,000) sets it to 0.
  Next halving estimated 17–21 April 2028 (CoinWarz); our ten-minute clock
  gives mid-April 2028.

## Dated defaults (helper agent, 26 November 2026; no Coin Metrics)

- Price $60,374: CoinGecko daily point 26 November 2026 00:00 UTC (the
  close of 25 November); cross-check Fortune $58,564 on 25 November. (A
  press figure of fees year-to-date came from Coin Metrics: not used.)
- Fees 0.0201 BTC a block, about 0.64% of rewards: Hashrate Index weekly
  roundup, week to 23 November 2026; mempool.space, last 144 blocks to 26
  November: 0.0170 BTC, 0.54%. Under 1%: confirmed.
- Hash rate 1,019 EH/s: Hashrate Index 30-day average, 23 November 2026
  (7-day 1,033); mempool.space 7-day mean about 1,044.
- Hardware $18.28 per TH/s, under 14 J/TH: Luxor/Hashrate Index ASIC price
  index on The Block, 24 November 2026 (the same value as on 9 August:
  possibly stale; 14–19 J/TH $6.03). Labelled with its source; the lecture
  says it may be stale.
- Efficiency 13.5 J/TH: Antminer S21 XP, maker's specification (no source
  for the network's average; public miners' fleets 15–25 J/TH, CoinShares
  Q4 2025).
- Electricity $0.05 per kWh: assumption (CBECI's constant; CoinShares Q1
  2026 uses it; Bitdeer $46/MWh in Q4 2025).
- Rentable share 0.87%: NiceHash SHA256AsicBoost 8.85 EH/s, 25–26 November
  2026, against 1,019 EH/s (peak above 31 EH/s, about 3%, on 4 September
  2026; crypto51.app shows 0% NiceHash-able).

## Italian terms (helper agent)

- zero-profit condition: "profitti economici nulli" (Unife, Zanni),
  "profitto nullo" (Sapienza); "condizione di profitto nullo" not found →
  condizione di profitti nulli.
- vincolo di compatibilità degli incentivi: Unife, Economia del lavoro.
- flusso e stock: "grandezza di flusso / di stock" (Teramo).
- attacco del 51%: Bitcoin.com IT, UniBo thesis (Bitpanda "attacco al
  51%"); "attacco di maggioranza" only in a search summary → gloss.
- doppia spesa: ethereum.org IT.
- escrow: kept in legal Italian (ecnews.it: deposito in garanzia, conto
  vincolato) → *escrow*, gloss "deposito in garanzia".
- capitale specializzato: not found; "capitale specifico", "investimenti
  specifici" in the transaction-cost literature → capitale specifico.
- noleggio: Bitpanda "noleggiare un'attrezzatura di mining" → noleggio di
  potenza di calcolo.
- sabotaggio, contrattacco, attacco *Goldfinger*: no Italian source; plain
  forms.
- bribery: no source; ethereum.org IT "tangenti" → corruzione (*bribery*).
- guerra di logoramento: UniBo thesis (Agostini); "guerra d'attrito" in
  Gregori (Trieste).
- sussidio del blocco: only a search summary (Plisio "sussidio per
  blocco"); CoinDesk IT "ricompensa del blocco" for the whole reward →
  sussidio del blocco, distinct from module 02's ricompensa del blocco.
- *halving* kept, gloss dimezzamento (Sky TG24, 19 April 2024).
- *undercutting*, *mining gap*: no source, kept.
- conferme (Bitcoin.com IT); *free rider* kept, bene pubblico
  (it.wikipedia); equilibrio perfetto nei sottogiochi (Padova).

