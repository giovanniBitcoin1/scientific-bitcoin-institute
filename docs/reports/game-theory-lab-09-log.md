# Game Theory Lab 09 — working log

Prompt: `prompts.local/game-theory-lab-09.md` (module 09, `games-on-networks`,
plus stage 0 on module 08).

## Start

- 2026-11-25. Branch `game-theory-lab`, tree clean, HEAD f1ce455 "Game Theory
  Lab 08: report". Status file: module 08 done, nothing in progress; report 08
  committed. Preconditions hold.

## Stage 0

- Module 08, section "Equal costs, and a hidden objective": "Φ is a
  potential: it changes as a single driver's cost would." → "Φ is a
  potential: moving a little traffic from one route to another changes Φ by
  that amount times the difference between the two routes' costs." Italian:
  "Φ è un potenziale: spostare un po' di traffico da un percorso a un altro
  cambia Φ di quella quantità moltiplicata per la differenza tra i costi dei
  due percorsi." No check quoted the old sentence (grep of scripts/ and the
  browser checks).

## Sources

Looked up on 25 November 2026 (by a helper agent; Crossref API, arXiv,
publisher abstracts, authors' PDFs).

- Kearns, Littman, Singh 2001, UAI: confirmed (arXiv 1301.2281): payoffs depend
  only on one's own and the neighbours' actions; the name "graphical games" is
  the later usage (AGT ch. 7), the paper says "graphical models".
- Bramoullé and Kranton 2007, JET 135(1) 478–494: the author is Rachel
  KRANTON, not "Kranz" (the prompt's spelling). Maximal independent sets give
  the specialized equilibria (Kranton's handbook chapter, Duke site).
  Theorem 2: stable iff specialized and every non-specialist has at least two
  specialist neighbours ("maximal independent set of order 2"); from
  secondary sources quoting it (Pandit and Kulkarni, arXiv 1607.02037), the
  paper itself not opened. Stability = return after small perturbations under
  best-response dynamics.
- Bramoullé, Kranton, D'Amours 2014, AER 104(3) 898–930: Kranton again.
  "There is a unique Nash equilibrium if |λmin(δG)| < 1" (Bramoullé–Kranton
  handbook chapter, Proposition 1): sufficient; necessary only in special
  cases (regular graphs). The lecture says "is unique when", not "only when".
- Ballester, Calvó-Armengol, Zenou 2006, Econometrica 74(5) 1403–1417: read in
  the paper. Efforts proportional to Bonacich centrality; uniqueness iff β > λ
  λ1(G) (Theorem 1); intercentrality b_i²/m_ii (Definition 2), key player
  Theorem 3. Crime networks: only one mention in the published paper; the
  working paper (CEPR DP 4421, 2004) was "Who's Who in Crime Networks".
  Lecture softened accordingly.
- Morris 2000, RES 67(1) 57–78: confirmed (Crossref).
- Jackson and Wolinsky 1996, JET 71(1) 44–74: read in the paper. Proposition 1
  (unique strongly efficient network: complete, star, empty with the
  prompt's thresholds); Proposition 2 (ii) complete unique pairwise stable for
  c < δ − δ²; (iii) star pairwise stable, not necessarily unique, for
  δ − δ² < c < δ; (iv) c > δ: every player of a nonempty pairwise stable
  network has at least two links. "Pairwise stable" and "connections model"
  are their terms.
- Jackson and Watts 2002, JET 106(2) 265–295: confirmed (IDEAS); improving
  paths, one link at a time, plus small random errors.
- Bala and Goyal 2000, Econometrica 68(5) 1181–1229: confirmed; the one who
  initiates a link pays; in the two-way flow model the centre-sponsored star
  is the unique nonempty strict Nash network (secondary).
- Avarikioti G., Scheuner, Wattenhofer 2019, CBT 2019 (LNCS, pp. 195–210),
  arXiv 1908.00436: abstract: "the star is a Nash equilibrium when each
  channel party can freely decide the channel fee" (the box says "set its fee
  as they wish"). No price-of-anarchy result in this paper. The author is
  Georgia on this paper, Zeta on the 2020 one.
- Avarikioti Z., Heimbach, Wang, Wattenhofer 2020, FC 2020, 264–283, arXiv
  1912.04797: betweenness centrality as the measure of the fees a node
  receives; price of anarchy O(1) or O(n) by parameter region, price of
  stability O(1), 1 where the star is optimal and an equilibrium.
- Lin, Primicerio, Squartini, Decker, Tessone 2020, NJP 22 083022: abstract:
  18 months from 12 January 2018 to 17 July 2019; 8,216 users and 122,517
  active channels at the end (2,732.5 BTC transacted); 10% (50%) of nodes hold
  80% (99%) of the bitcoins at stake, on average over the period;
  increasingly core–periphery; removing hubs collapses it into many
  components. Corrigendum NJP 23 079501 (2021), not about these figures.
- Jackson 2008: ch. 6 "Strategic Network Formation"; ch. 9 "Decisions,
  Behavior, and Games on Networks"; ch. 11 "Game-Theoretic Modeling of Network
  Formation" (author's TOC).
- Nisan et al. 2007: ch. 19 "Network Formation Games and the Potential Function
  Method"; ch. 24 "Cascading Behavior in Networks: Algorithmic and Economic
  Issues" (Crossref).
- Italian terms: "giochi su reti" and "reti efficienti" (Fagnani, PoliTo
  slides); "complementi/sostituti strategici" (IPIM slides; Tor Vergata
  syllabus); "insieme indipendente massimale" (it.wikipedia); "canale di
  pagamento" (PoliTo and UniBo theses); "commissione di instradamento"
  (Italian Lightning explainers); "formazione di reti" (Padova theses).
  Not found in Italian, kept with the English at first use: equilibrio
  specializzato, giocatore chiave (*key player*), intercentralità, centralità
  di Katz–Bonacich, stabilità a coppie (*pairwise stability*), modello delle
  connessioni (*connections model*), bene pubblico locale (the public-finance
  term "beni pubblici locali" exists).

## Checks run
- `node scripts/lab/check-game-theory-09.mjs` (logic only, texts not yet
  written): first run 2 failures, both in the check itself: the line's
  middle eigenvalue printed as "−0.0000"; the perturbation test asked for a
  return "near" the set, but next to {1, 4} on the line lies a continuum of
  equilibria, so a push lands on a nearby equilibrium: stability means coming
  back to the same point, the test now asks for an exact return (1e-9).
  Then all checks passed (0.3 s). Every number the prompt fixed agrees.
  "Expected" values that differ (the lab's generator): runs 1–20 of Panel A,
  line {1, 3, 5} 19 and not specialized 1 (prompt 17 and 3), ring {1, 3, 5}
  9 and {2, 4, 6} 11, grid {1, 3, 5, 7, 9} 17 and not specialized 3, never
  {2, 4, 6, 8} (prompt 13, 2, 5); over runs 1–200: line 181/19, ring 69/131,
  grid 149 / 22 / 29. Panel C (8, 0.5, 0.4) from empty, runs 1–20: 8–10
  links, totals 9.60–10.50 (prompt 9.55–10.5; 9.55 from the random start,
  and from empty over runs 1–200: 7–10 links, 9.55–10.65), never the star.
  F1 at δ = 0.3: the leaf is 2.03125 exactly, written 2.0313 by toFixed
  (prompt 2.0312). Timings in Node: 100 grid runs 1.5 ms; nine removals
  0.2 ms; n = 12 "To the end" 0.1 ms.
- `node scripts/lab/check-game-theory-09.mjs` with the quoted checks: first
  run 1 failure: observe A said every star run takes 2 turns, run 13 takes 3;
  the text now says so and the check pins it. Then all checks passed.
- `npx vite build`: passed. Module chunk 76.8 kB (27.5 kB gzip), imports the
  shared Slider, DrawToggle, network/ui and network/charts chunks only.
- `node modules/game-theory-games-on-networks.mjs`: first two runs stopped
  on errors of the check itself (page.focus refuses an SVG; a removal loop
  that started with player 1 already removed). Third run 1 failure of 42:
  the ring's six equal intercentralities were ranked by float noise; ties
  within 1e-9 now go to the lower number (keyplayer.js) and the self-check
  pins it on the ring at every δ. F1 was 442 px tall at 1280 px: readouts
  moved beside the drawing and shortened (483, then 443 px).
- Screenshots (`node shots.mjs game-theory games-on-networks`) looked at:
  F1's chart labels overlapped ("limit" on the left axis) and the tick 0.50
  was clipped; F2's tick 1.00 clipped; fixed.
- `node modules/game-theory-games-on-networks.mjs` after the fixes and a
  rebuild: 0 failures of 42. Timings: Panel A "Best responses" on the grid
  3–6 ms; Panel B removal 3 ms; Panel C "To the end" at n = 12 4–5 ms.
  Figure heights: 1280 EN 443, 445; 1280 IT 443, 462; 375 IT 608, 746.
- CHECKS list: check-game-theory-01 passed; -02 passed; -03 went past the
  tool's 300 s limit and was moved to the background, so -04 to -09 ran
  while it was still running (against the one-at-a-time rule; they are
  rerun after -03 ends). In that pass -04 to -07 and -09 passed, -08 had 1
  failure: stage 0's longer sentence brought module 08's Italian lecture to
  1,715 words (limit 1,700). Trimmed elsewhere in the Italian (first section:
  "gli egoisti … ognuno impiega 1 ora", "divide gli automobilisti a metà",
  "chi va in alto … chi va in basso", "ancora l'argomento"; "molto meglio"
  without "del caso peggiore"): 1,699 words, -08 passed.
- Rerun alone, one at a time, after -03 ended: check-game-theory-03 all
  passed (background run, exit 0); -04, -05, -06, -07, -08 (after the trim),
  -09: all checks passed.

Final CHECKS list on the final code (status file updated; one at a time):

- `npx vite build`: built.
- `node check-index.mjs game-theory`: 0 failures of 80.
- `node check-index.mjs network`: 0 failures of 76.
- `node check-index.mjs complexity`: 0 failures of 72.
- `node check-links.mjs`: 0 failures of 131.
- `node check-module.mjs game-theory games-on-networks`: 0 failures of 60
  (its figure heights, figure body without caption: 396, 399 px at 1280 EN;
  396, 415 IT; 542, 696 at 375 EN; 542, 680 IT).
- `node check-module.mjs game-theory` what-is-a-game 0/56,
  nash-equilibrium 0/56, mixed-strategies-zero-sum 0/56,
  sequential-games-commitment 0/56, incomplete-information-signalling 0/56,
  repeated-games-reputation 0/60, evolution-and-learning 0/68,
  congestion-price-of-anarchy 0/56.
- Functional checks: games-on-networks 0/42, congestion-price-of-anarchy
  0/43, evolution-and-learning 0/41, repeated-games-reputation 0/41,
  incomplete-information-signalling 0/39, sequential-games-commitment 0/45,
  mixed-strategies-zero-sum 0/39, nash-equilibrium 0/49, what-is-a-game
  0/32.
- `node build-main.mjs` then `node compare-main.mjs`: 0 failures of 144.
- `npm run build` (validate, vite build, post-build: 9 static pages, 3
  redirect stubs, feed, sitemap): passed.
- `npm run check:dist`: 0 failures of 108.
