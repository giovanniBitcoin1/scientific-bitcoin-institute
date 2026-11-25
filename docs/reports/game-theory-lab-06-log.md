# Game Theory Lab 06 — working log

Prompt 6 (stage 0: Italian terms in modules 01–05; stage 1: module 06
"Repeated games and reputation"). One line per check run to its end
(command, result) and one line per source looked up (what, where, what it
says). A session that picks up this prompt reads this file first.

## Session 1 (25 November 2026)

- Start: branch `game-theory-lab`, tree clean, last commit 4793aec "Game
  Theory Lab 05: report". Status file: module 05 done, nothing in progress;
  `docs/reports/game-theory-lab-05.md` committed. Preconditions met.

### Stage 0

- Applied the prompt's table to the Italian texts of modules 01–05 (lectures,
  `it` strings of texts.js, Italian labels in components and presets, the
  module list), sentence by sentence; English untouched. First use of each
  English word kept (payoff, incumbent, leader, follower, pooling, single
  crossing, fictitious play, punitive forking, feather fork, miner, hash
  rate, pool, tipping point) in italics in each lecture. Module 04's F1 now
  marks the newcomer E (entrante), like module 05's F1; the Panel A tree
  takes the initials from the player names (E, I). Panel B of module 04 is
  "Leader e follower" (was "Chi muove per primo"), as is the lecture section.
  Ordinary Italian left alone: "le coppie in gara" (module 01), "chi propone",
  "chi risponde", "chi muove per primo/secondo", "il cammino" of a walk or a
  tree.
- Sources for the (verify) items and the module 06 terms (looked up by a
  helper agent, which downloaded about 35 Italian PDFs and searched their
  text; short names as in the report):
  - Patrone, *Decisori (razionali) interagenti* (book PDF, Univ. Pavia,
    mate.unipv.it/atorre/borromeo2019/patrone.pdf); Torre (Univ. Pavia),
    slides "Giochi ripetuti" (mate.unipv.it/atorre/borromeo2019/ripetuti.pdf);
    Univ. Chieti-Pescara CLEII "Teoria dei giochi" notes and exams after
    Gibbons (cleii.unich.it/download.php?id=300, 389, 393); Battigalli,
    "Giochi, teoria dei", Treccani *Enciclopedia del Novecento* (2004);
    Unisi, "Interazioni sociali e schema istituzionale" cap. 1
    (deps.unisi.it/sites/st02/files/allegati/22-07-2013/cap1.pdf); Unipd
    thesis "Collusione tacita nel mercato elettrico italiano"; LUISS theses
    (De Angelis 2016, Guerrini); Unimore thesis (Demaio); Unifi
    giochidieconomia modulo 3; Unibo IPIM slides; Moretto slides (Unipd).
  - payoff dominant: "Pareto-domina" (Festa–Cevolani, Units draft; Unimi
    thesis), "payoff-dominant (ottimo paretiano)" (Unifi). Chosen
    **Pareto-dominante**.
  - risk dominant: "dominanza di rischio", "equilibrio rischio dominante"
    (Unisi); Unifi keeps "risk-dominant". No source for "dominante in termini
    di rischio" (the proposal) nor for "dominante nel rischio". Chosen
    **rischio-dominante**.
  - tipping point: no Italian source for "soglia critica", "punto di svolta"
    or "punto critico"; Italian authors keep "tipping point" (Kollmann,
    Marsiglio, Suardi, Tolotti 2021, arpi.unipi.it). Chosen ***tipping
    point***, kept in English.
  - contest: no Italian source either way: **gara** kept, as the prompt says.
  - off the equilibrium path: "fuori dal sentiero di equilibrio" (LUISS De
    Angelis, Gibbons' requirement 4; LUISS Guerrini); "fuori dal cammino di
    equilibrio" also once (Unimore). Chosen **sentiero**.
  - bias: no Italian treatment of Crawford–Sobel found: **distorsione** kept.
  - Others of the table, one source each: "funzioni di reazione" (Unipd
    thesis), "curva di reazione" (Pavia Cournot notes), "minaccia non
    credibile" (Moretto; Treccani "minacce e promesse non credibili"),
    "vantaggio della prima mossa" (Unipd thesis), "incumbent" and deterrenza
    (Moretto, Unibo), "insieme informativo" (Chieti, LUISS; Patrone has
    "insieme di informazione"), "decisore" (Patrone), "pooling" (Chieti),
    "pari o dispari" (Patrone), "soluzione di maxmin" (Treccani). Not found
    (kept as the prompt decided): libera entrata, criterio intuitivo, payoff
    del babbeo, payoff di sicurezza.
- Double-encoded text (Ã, Â, â€, U+FFFD) in src/components/lab/game-theory,
  src/content/game-theory-lab, scripts/lab/check-game-theory-*,
  scripts/lab/browser-checks/modules/game-theory-*, the status file and the
  module list: none found.
- `node scripts/lab/check-game-theory-01.mjs` … `-05.mjs` (first run): 01
  and 05 pass; 02 FAIL (IT lecture 1,710 words), 03 FAIL (1,714), 04 FAIL
  (IT 1,701 words, and three quoted Italian phrases that had changed:
  "l'impresa tiene 4", "(nuovo arrivato, impresa)", "chi guida guadagna
  14"). Lectures trimmed (glosses shortened), the three phrases in
  check-game-theory-04.mjs updated. Rerun: all five "All checks passed" (IT
  words 1,695, 1,692, 1,697, 1,698, 1,682).
- `npx vite build`: built in 14.1 s.
- `node check-index.mjs game-theory`: 0 failures of 80; `network`: 0 of 76;
  `complexity`: 0 of 72. `node check-links.mjs`: 0 of 131.
- `node check-module.mjs game-theory <slug>`, modules 01–05: 0 of 56 each.
  Functional checks: what-is-a-game 0 of 32, nash-equilibrium 0 of 49,
  mixed-strategies-zero-sum 0 of 39, sequential-games-commitment 0 of 45,
  incomplete-information-signalling 0 of 39.
- `node build-main.mjs && node compare-main.mjs`: 0 failures of 144.
- `npm run build`: built in 12.8 s; 9 static pages, 3 redirect stubs, feed,
  sitemap. `npm run check:dist`: 0 failures of 108.
- Lines changed per module (Italian text only): 01 14 (with the shared
  PayoffTable legend), 02 37, 03 34, 04 63, 05 49; status file rewritten
  (one table); check-game-theory-04.mjs 3.

### Stage 1: logic

- Module 06 pure logic written before the stage 0 commit (kept out of it):
  repeated.js, collusion.js, greenporter.js, chainstore.js,
  minersdilemma.js, scripts/lab/check-game-theory-06.mjs.
- `node scripts/lab/check-game-theory-06.mjs` (first run): 2 FAIL, both of
  the check or of a helper: the clipped individually rational polygon had
  repeated corners (fixed in `clip`); the bisection for q(δ) differs from the
  closed form by 2.1e-8 near δ = 0, where the two roots meet (a double root:
  the bisection only reaches about √ε there), so the tolerance is 1e-6 and
  the check says why. Rerun: all PASS. Every value the prompt expected is
  reproduced. Other numbers: F2 grid shares 0.0000 0.0232 0.0752 0.3113
  0.6446 0.8790 0.9880; 100,000 rounds, seeds 1–10, quiet share
  0.8943–0.9011 (prompt 0.894–0.903); 10,000 chains, seeds 1–10, entries
  6.1621–6.1856 (prompt 6.161–6.188), fights 0.8144–0.8379 (prompt
  0.812–0.839), the weak payoff 66 in every chain; "Best rule" at σ = 0.25 is
  p̄ = 4.1, L = 25 (the prompt's). Node timings: chart 2 12 ms, "Best rule"
  0.3 ms, 10 × 10,000 chains 43 ms, Eyal equilibrium 2 ms (7 rounds).
