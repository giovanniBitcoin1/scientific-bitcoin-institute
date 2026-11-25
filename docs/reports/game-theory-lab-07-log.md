# Game Theory Lab, prompt 7 — working log

One line per check run to its end (command, result) and one line per source
looked up (what, where, what it says). Newest at the bottom.

## Start

- 2026-11-25. `git status`: clean, branch `game-theory-lab`, HEAD 08e9469
  "Game Theory Lab 06: report". Status file: module 06 done, nothing in
  progress; `docs/reports/game-theory-lab-06.md` committed (08e9469).

## Stage 0

- Searched every file of the repo (no node_modules) for "defezionator": one
  hit, `src/content/game-theory-lab/what-is-a-game.it.md` line 83. "chi
  coopera contro un defezionatore" → "chi coopera contro chi defeziona". No
  check script quotes the phrase.

## Step 1: pure logic and self-check (WIP commit 2cc7991)

- `node scripts/lab/check-game-theory-07.mjs` (logic only, texts not there
  yet): first run 2 FAIL, both in my comparison (the prompt's 0.037035 is a
  half-way case at 4 significant digits; the code gives 0.037035004 and
  0.037035021); the comparison now uses half a unit of the last digit kept.
  Rerun: all checks passed.
- Values that differ from the prompt's "expected" (no check changed for
  them; the checks are the prompt's "within 4 standard errors"):
  - 10,000 mutants, seeds 1–10: neutral N = 10 0.0969–0.1029 (prompt
    0.098–0.105); r = 1.1 0.1434–0.1504 (0.144–0.155); hare among stag
    hunters 0.0162–0.0199 (0.0167–0.0213). Largest |z| 1.65.
  - Regret over bound: largest ratio 0.971 over all rounds t, 0.917 at the
    last round only (prompt 0.898).
  - Pari o dispari over seeds 1–50: mean distance from the centre 0.569 at
    the end, 0.323 at t = 200 (prompt 0.590 and 0.332); seeds 1–10 0.594
    and 0.316.
- Everything else matched: ESS, F1 RK4 values, Panel A V values to 6
  digits, period 11.3983, eigenvalues, the repeated preset's matrix, ends
  and thresholds, every Moran number, F2's vertices, best, worst, mixed and
  areas at every d, the bounds and the end points of the learners.
- Panel C, start away from the centre: the bound ln 2/(ηt) + η/8 holds for
  the uniform start only; with a start (π, 1 − π) it is ln(1/min(π, 1 −
  π))/(ηt) + η/8 (Hedge with a prior). The page draws that one; at the
  default start it is the prompt's. Checked from (0.8, 0.2): largest ratio
  0.969.

## Sources: Italian terms (subagent search, 25 November 2026)

- "teoria evolutiva dei giochi": it.wikipedia.org/wiki/Teoria_evolutiva_dei_giochi
  (title); unimore thesis (Demaio) 8 times against 2 for "teoria dei giochi
  evolutiva"; unicam thesis 12 times. Chosen.
- "strategia evolutivamente stabile": mate.unipv.it/atorre/borromeo2019/evol.pdf
  ("una strategia evolutivamente stabile è una strategia che non può essere
  rimpiazzata da una strategia rara (mutante)"). Also "mutante".
- "dinamica del replicatore": unimore thesis, section "2.3 Dinamica del
  replicatore (replicator dynamics)". "equazione del replicatore" not found
  as such (used as the plain name of the equation of that dynamics).
- "coesistenza", "bistabilità": unimore ("bistabilità, coesistenza
  stabile"); unibo thesis Agostini ("o sono coesistenti o sono bistabili").
- Rest point: "punto di riposo" 0 hits; "punto di equilibrio" 48 hits in the
  unicam thesis (Alessandrelli, "punto di equilibrio asintoticamente
  stabile"); "punto fisso" in unipd (Ghezzo). Chosen: punto di equilibrio.
- Moran: "modello di Moran" (unipd, Polato, 24 hits); unimore keeps
  "Moran process". Chosen: processo di Moran (plain Italian).
- "probabilità di fissazione": unimore. "deriva neutrale" and "intensità della
  selezione" not found; "deriva genetica" standard, unimore "intensità
  selettiva". Chosen: deriva neutrale, intensità della selezione (plain).
- Regret: polimi thesis keeps "regret" ("minimizzazione del regret");
  "rimpianto" only in the economics sense. Chosen: *regret*, *no-regret*.
- "equilibrio correlato": cleii.unich.it notes "Cenni sull'Equilibrio
  Correlato di Aumann". Coarse: polimi "equilibri Coarse-Correlati";
  "grossolano" not found. Chosen: equilibrio correlato *coarse*.
- "swap regret", "one-third rule", "multiplicative weights": no Italian
  source. "asintoticamente stabile", "tasso di apprendimento" standard.
- Side-blotched lizard: no Italian common name; use *Uta stansburiana*.

## Sources: references (subagent search, 25 November 2026)

Crossref API unless noted.
- Maynard Smith and Price 1973: Nature 246, 15–18, doi 10.1038/246015a0. Confirmed.
- Maynard Smith 1982, CUP; Hofbauer and Sigmund 1998, CUP: standard data, not looked up.
- Taylor and Jonker 1978: Math. Biosci. 40, 145–156, doi 10.1016/0025-5564(78)90077-9; title "Evolutionary stable strategies and game dynamics" (sic). Confirmed.
- Hofbauer, Schuster and Sigmund 1979: J. Theor. Biol. 81, 609–612, doi 10.1016/0022-5193(79)90058-4. Confirmed.
- Sinervo and Lively 1996: Nature 380, 240–243, doi 10.1038/380240a0 (title with en dashes). Snippets of the abstract (ProQuest record; Nature blocked): the three male morphs "oscillate over a six-year period". Later papers (PMC) give a period of about 4–5 years. Text softened: "cycle over a few years" (as the prompt), no number.
- Moran 1958: Math. Proc. Camb. Phil. Soc. 54, 60–71, doi 10.1017/S0305004100033193. Confirmed.
- Nowak, Sasaki, Taylor, Fudenberg 2004: Nature 428, 646–650, doi 10.1038/nature02414. Confirmed. Ohtsuki, Bordalo and Nowak 2007, J. Theor. Biol. 249, 289–295 (PMC2430062), credit the 2004 paper with both parts (x* < 1/3; risk dominance ⇔ ρA > ρB under weak selection, large N) and call it "the one-third law".
- Kandori, Mailath, Rob 1993: Econometrica 61, 29–56 (IDEAS; abstract: "the risk dominant equilibrium is selected"). Confirmed.
- Young 1993: Econometrica 61, 57 (end page 84 from the usual citation). Risk-dominant selection from secondary sources only.
- Hannan 1957: Contributions to the Theory of Games III, 97–139 as usually cited (De Gruyter reprint: 97–140, 1958). Kept 97–139.
- Littlestone and Warmuth 1994: Inf. Comput. 108, 212–261. Confirmed.
- Freund and Schapire 1997: JCSS 55, 119–139. 1999: GEB 29, 79–103. Confirmed (1999 abstract not read; the claim from the Blum–Mansour chapter).
- Aumann 1974: J. Math. Econ. 1, 67–96. Confirmed.
- Hart and Mas-Colell 2000: Econometrica 68, 1127–1150; abstract (Semantic Scholar): "the empirical distributions of play converge to the set of correlated equilibria". Confirmed.
- Bailey and Piliouras 2018: Proc. ACM EC 2018, 321–338, doi 10.1145/3219166.3219235; abstract: KL divergence from equilibrium bounded below and growing, "movement away from equilibria and towards the boundary". Time averages: from Freund and Schapire. Confirmed.
- Regret bound ln n/η + ηT/8: Cesa-Bianchi and Lugosi 2006, Thm 2.2 (secondary restatement, arXiv 1011.5668). Confirmed in substance.
- CE = CCE with two actions each: Lancaster WP 2017-003 and arXiv 1308.6025 ("binary-action games"). Confirmed.
- Nowak 2006 chapters (bookseller listing): 4 Evolutionary Games, 6 Finite Populations, 7 Games in Finite Populations. The prompt's ch. 4, 6 and 7 stand.
- Osborne 2004 ch. 13 "Evolutionary Equilibrium" (economics.utoronto.ca/osborne/igt/toc.html). Confirmed.
- Shoham and Leyton-Brown 2009 ch. 7 "Learning and Teaching" (masfoundations.org). Confirmed.
- Nisan et al. 2007 ch. 4 "Learning, Regret Minimization, and Equilibria" (Blum and Mansour). Confirmed.
- Roughgarden 2016: lecture 13 "Equilibria: Definitions, Examples, and Existence" (the hierarchy is its content), 17 "No-Regret Dynamics", 18 "Swap Regret and the Minimax Theorem". Confirmed with that title.
- ESS ⇒ asymptotically stable, converse for two strategies, failure with three: standard (Hofbauer and Sigmund 1998), book not opened. Time average on closed orbits: same.
- Selten 1978, 20 towns: Theory and Decision 9, 127–159 confirmed; "20 towns" only in secondary sources (Wikipedia, citing the paper). Paper not reached: module 06 left as it is.

## Step 2: figures, panels, lectures, texts (WIP commit 25b26c9)

- `npx vite build`: built; module 07 chunk 87.8 kB.
- Word counts (before "<!-- simulation -->"): EN 1,745 → trimmed to 1,688;
  IT 1,801 → trimmed to 1,688.
- `node scripts/lab/check-game-theory-07.mjs` with the "quoted on the page"
  checks: 139 PASS, 0 FAIL.
- Changes found while writing the browser check: Panel C's game pills go
  back to run no. 1 and the start (0.5, 0.5); Panel A's presets go back to
  the start (0.5, 0.3, 0.2); observe C item 4 now says to set T back to
  2,000 and η to 0.1 (its numbers are at the defaults).
- `node modules/game-theory-evolution-and-learning.mjs` (first run): 0
  failures of 41.
- `node check-module.mjs game-theory evolution-and-learning` (first run): 4
  FAIL, "locked: no lecture text on the page" at all four sizes: the first
  heading "Strategies that spread" / "Strategie che si diffondono" is also
  the start of the module's summary, which the locked page shows. Heading
  renamed "A population of strategies" / "Una popolazione di strategie".

## CHECKS on the final code (25 November 2026)

- `npx vite build`: built in 12.35 s.
- check-game-theory-01 … 07: 102, 124, 119, 121, 136, 136, 139 PASS; 0 FAIL
  each, "All checks passed".
- check-index game-theory 0/80, network 0/76, complexity 0/72;
  check-links 0/131.
- check-module game-theory: what-is-a-game 0/56, nash-equilibrium 0/56,
  mixed-strategies-zero-sum 0/56, sequential-games-commitment 0/56,
  incomplete-information-signalling 0/56, repeated-games-reputation 0/60,
  evolution-and-learning 0/68 (figure heights 384/403 px at 1280 EN, 400/403
  IT; 671/716 at 375 EN, 705/716 IT; three draw surfaces, swipes and Draw
  toggles pass).
- modules/game-theory-*.mjs: 01 0/32, 02 0/49, 03 0/39, 04 0/45, 05 0/39,
  06 0/41, 07 0/41. Timings (07): F2 slider move 5 ms; Panel A trajectory
  from the click to t = 100 drawn in 889 ms (computed at once, ~17 ms in
  Node); 10,000 mutants 6 ms (r = 1.1, N = 10) and 5 ms (hare, N = 50);
  "Watch one" at N = 10 ended in 43 ms (died out after 5 steps); Panel C at
  T = 10,000 8 ms.
- build-main + compare-main: 0/144.
- `npm run build`: validate, vite build, post-build (9 static pages, 3
  stubs, feed, sitemap); exit 0. `npm run check:dist`: 0/108.
- Module 07 chunk 87.9 kB (32.1 kB gzip).

## Commits

- b3b686f "Game Theory Lab 07: Evolution and learning" (2cc7991, 25b26c9 and the final state squashed with `git reset --soft 08e9469`).
- "Game Theory Lab 07: report": the report, this log, the status file (prompt finished).
