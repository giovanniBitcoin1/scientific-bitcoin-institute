# Game Theory Lab 10 — working log

Prompt: `prompts.local/game-theory-lab-10.md` (module 10, `coalitions-sharing`,
plus stage 0 on check-game-theory-03).

## Start

- 2026-11-25. Branch `game-theory-lab`, tree clean, HEAD 3ce4dfe "Game Theory
  Lab 09: report". Status file: module 09 done, nothing in progress; report 09
  committed (`git ls-files` lists it). Preconditions hold.

## Stage 0

- `node timed.mjs scripts/lab/check-game-theory-03.mjs` (a scratch wrapper
  that stamps each output line; 600 s timeout, foreground): exit 0 after
  437.4 s. Parts: two-by-two and "every equilibrium" 5.8 s; **zero-sum grid
  check 376.3 s**; survey 6.4 s plus ten other seeds 21.6 s; fictitious play
  0.8 s; machine 6 s; quoted on the page 20 s; timings 6 s.
- Profiled the zero-sum block (scratch script, deleted): the 2 × 3 and 3 × 2
  cases build the 3-strategy grid at K = 4000 (8,006,001 points, one array
  each) for every one of 60 games: grids 83.9 s + 82.5 s, maxmin/minmax
  87.5 s + 90.2 s; 2 × 2 and 3 × 3 under 1 s together. Equilibria 22 ms.
- Fix: the grid is walked point by point with plain loops (same points, same
  order of the sums, same tolerances). Old and new values compared on 124
  games (60 2 × 2, 2 + 2 at K = 4000, 60 3 × 3): identical (===) in 124 of
  124.
- Rerun, same wrapper: exit 0 after 78.7 s, every check PASS; the zero-sum
  block 25.9 s.

## Module 10: logic

- `node scripts/lab/check-game-theory-10.mjs` (logic only, no texts yet):
  all PASS, 0.7 s. Every number of the prompt's self-check list agrees
  (F1 Shapley and cores; Panel A presets; Council at quotas 9–17; Banzhaf at
  12; pools at 26, 34, 51, 67; split at 51; Panel C at E = 100 … 500). The
  nucleolus by sequential LPs equals the Talmud on 411 problems (291 ms).
  Timings in Node: one 5-player analysis 4 ms; 30 players 8 ms; Panel C
  chart (five rules, D = 1500) 8 ms.
- Added a hand-solved nucleolus: the partners (52.5, 32.5, 15).

## Sources

Looked up on 25–26 November 2026 by a helper agent (Crossref, publisher and
IDEAS pages, arXiv, Sefaria, authors' PDFs, Italian course notes).

- Gillies 1959, Contributions IV (AM-40) ch. 3, 47–85 (De Gruyter prints
  47–86), DOI 10.1515/9781400882168-005. Credit: Aumann 1961 ("first
  explicitly defined by Gillies"); Walker's chronology: core developed by
  Shapley (RAND RM-817, 1952) and Gillies (thesis 1953). Who coined the word
  not found. Lecture: "introduced by Gillies and by Shapley in 1952–53 and
  published by Gillies (1959)".
- Bondareva 1963, Problemy Kibernetiki 10, 119–139: secondary sources only
  (no Crossref record).
- Shapley 1967, NRLQ 14(4) 453–460, DOI 10.1002/nav.3800140404: confirmed;
  theorem "nonempty core iff balanced" (Airiau's notes).
- Three-player condition: no citable statement found; derived from the
  minimal balanced collections of n = 3 (checked by the self-check on 1,331
  + 400 games). arXiv 1506.01242 has it with "<", wrong at equality.
- Shapley 1953, Contributions II (AM-28) ch. 17, 307–317, DOI
  10.1515/9781400881970-018: the original has three axioms (symmetry, carrier,
  additivity); four properties are the modern form. Lecture: "In its modern
  form".
- Shapley 1971, IJGT 1(1) 11–26: RAND P-4620 abstract, the value is the centre
  of gravity of the core's extreme points.
- Littlechild and Owen 1973, Management Science 20(3) 370–372: confirmed;
  equal sharing of each segment (Fragnelli's slides).
- Shapley and Shubik 1954, APSR 48(3) 787–792: confirmed.
- Banzhaf 1965, Rutgers Law Review 19(2) 317–343; Penrose 1946, JRSS 109(1)
  53–57: confirmed; Penrose's measure is half of Banzhaf's non-normalised one
  (Felsenthal and Machover).
- EEC Council, Treaty of Rome art. 148: 4, 4, 4, 2, 2, 1; 12 of 17 on a
  Commission proposal; otherwise 12 votes and at least four members, under
  which Luxembourg can be pivotal (Mayer 2018, Games 9(2) 29). Lecture: "an
  act proposed by the Commission needed 12 of the 17. Under that rule …".
- Talmud, Ketubot 93a (Sefaria): 100 equally; 200 as 50, 75, 75; 300 as 50,
  100, 150. Bava Metzia 2a, second case of the mishna: "all" against "half",
  3/4 and 1/4. Spelling "Ketubot" (Sefaria) instead of the prompt's
  "Kethubot".
- Aumann and Maschler 1985, JET 36(2) 195–213: abstract, the Talmud's
  divisions are the nucleoli; equal division of the contested amount gives
  a unique rule, the nucleolus (CG-consistency).
- Schmeidler 1969, SIAM J. Appl. Math. 17(6) 1163–1170; O'Neill 1982, MSS 2(4)
  345–371 (random arrival = Shapley, from secondary sources): confirmed.
- Rosenfeld 2011, arXiv:1112.4980: §2.1 proportional, §2.2 PPS, §3.3 PPLNS,
  §6.1 pool hopping; shares early in a round worth more.
- Lewenberg et al. 2015, AAMAS 919–927: abstract, "especially under high
  transaction loads … impossible to distribute rewards in a stable way".
- Can, Hougaard, Pourpouneh 2022, GEB 136 274–298: two fairness criteria; a
  new characterisation of the proportional scheme.
- Hash rate: Hashrate Index roundup of 23 November 2026: 7-day SMA 959 → 1,033
  EH/s, 30-day SMA 1,019 EH/s. First above 1 ZH/s in 2025 (daily estimate
  April, 7-day average September). The box quotes 1,019 EH/s and computes at
  1 ZH/s (19 years; at 1,019 EH/s 19.4).
- Chapters: Osborne ch. 8 "Coalitional Games and the Core"; Shoham and
  Leyton-Brown ch. 12 "Teams of Selfish Agents: An Introduction to Coalitional
  Game Theory"; Jackson ch. 12 "Allocation Rules, Networks, and Cooperative
  Games".
- Italian terms (Fragnelli UPO slides 2019/20; Torre and Bernardi, Pavia
  2019; Lucchetti; Barbarino 2020): gioco cooperativo (in forma
  coalizionale); funzione caratteristica; gioco TU; coalizione; superadditivo;
  convesso; nucleo (*core*); valore di Shapley; contributo marginale;
  giocatore nullo; gioco bilanciato, collezione bilanciata; teorema di
  Bondareva–Shapley; nucleolo; *least core* (no Italian term found); giochi a
  maggioranza pesata; quota; indice di Shapley–Shubik, indice di Banzhaf;
  pivotale (Shapley–Shubik), cruciale (Banzhaf); coalizione vincente
  minimale; problema di bancarotta ("fallimento" not found); proporzionale;
  CEA and CEL kept in English (Fragnelli); gioco dell'aeroporto; gioco dei
  guanti ("mercato dei guanti" not found); imputazione. Patrone's book not
  readable (encrypted PDF, site 403).


## Module 10: build and fixes

- Lecture word counts (box not counted): EN 1,550 (box 335), IT 1,607 (box
  342).
- check-game-theory-10 with the quoted checks, first run: 2 FAIL. (1) My
  hand-solved nucleolus of the partners, (52.5, 32.5, 15), was wrong: the
  coupling x_A = 100 − x_B − x_C caps the third pair's satisfaction at
  30 − 2t, so the level is 10 and the nucleolus is (50, 30, 20), what the code
  gave. (2) An Italian pattern broken by decimal commas. Fixed both; then all
  PASS.
- `check-module game-theory coalitions-sharing`, first run: 1 FAIL, Panel B's
  table stuck out at 375 px in English. Headers shortened (S–S, abs.), the
  share column hidden below 640 px. Then 0 failures.
- Screenshots (shots.mjs): Panel A's inputs too narrow, the triangle's pair
  labels overlapping, Panel C's chart labels colliding: fixed. F1's triangle
  from 18 to 16 rem (figure 436 → 407 px at 1280).
- Functional check, first runs: crashes in the check itself (SVG focus, a
  button inside a closed <details>), then 2 FAIL, both wrong expectations in
  the check (↑ takes from the larger of A and B, here B: (32, 34, 34); v(N) = 2
  in the unanimity game gives 7/10, 7/10, 1/5 ×3). Fixed the check.

## Checks (final code, one at a time, foreground)

- `npx vite build`: built.
- check-game-theory-01: pass, 15.1 s; -02: 24.4 s; -03: 81.5 s; -04: 7.2 s;
  -05: 2.0 s; -06: 0.8 s; -07: 0.8 s; -08: 1.2 s; -09: 0.4 s; -10: 133 PASS,
  0.7 s.
- check-index game-theory 0/80; network 0/76; complexity 0/72; check-links
  0/131.
- check-module, ten modules: 0 failures each (56, 56, 56, 56, 56, 60, 68, 56,
  60, 60).
- Functional checks: 0 failures each (32, 49, 39, 45, 39, 41, 41, 43, 42, 36).
  Module 10 timings: Panel A edit at 5 players 5 ms; split 25 → 26 16 ms;
  quota change at 29 players 37 ms; split 29 → 30 38 ms; Panel C three claim
  moves 55 ms in all. Figure heights 407, 346 at 1280 EN; 407, 382 IT; 836,
  624 at 375 IT (check-module, figure body only: 361, 300 at 1280 EN; 751, 539
  at 375 EN).
- build-main + compare-main: 0/144.
- `npm run build`: passed. `npm run check:dist`: 0/108.
- Module chunk 83.8 kB (30.4 kB gzip); frac.js is now a 0.8 kB chunk shared by
  modules 08 and 10.
