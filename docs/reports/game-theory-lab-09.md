# Game Theory Lab, prompt 9: report

Module 09, `games-on-networks` ("Games on networks" / "Giochi su reti"), plus
stage 0 on module 08. Branch `game-theory-lab`, local commits only:

- d34fc3e "Game Theory Lab 09: Games on networks" (five WIP commits
  squashed; stage 0, module, status file, module 09 "ready").
- "Game Theory Lab 09: report" (this file and the working log
  `docs/reports/game-theory-lab-09-log.md`).

## Stage 0

- Module 08, "Equal costs, and a hidden objective": the sentence is now
  "Φ is a potential: moving a little traffic from one route to another
  changes Φ by that amount times the difference between the two routes'
  costs." Italian: "Φ è un potenziale: spostare un po' di traffico da un
  percorso a un altro cambia Φ di quella quantità moltiplicata per la
  differenza tra i costi dei due percorsi."
- No check quoted the old sentence. But the longer sentence took the
  Italian lecture to 1,715 words, over the 1,700 limit that
  check-game-theory-08 enforces. I trimmed 16 words elsewhere in the first
  section, without changing any number or claim; it is now 1,699 words:
  - "gli egoisti la prendono tutti, e ognuno impiega 1 ora";
  - "Un pianificatore che divide gli automobilisti a metà";
  - "Chi va in alto … chi va in basso";
  - "apre ancora l'argomento";
  - "molto meglio" without "del caso peggiore".

## Differences from the prompt

- **Kranton, not Kranz.** The author of both public-goods papers is Rachel
  Kranton (Crossref, the JET and AER pages). The lecture, the reading list
  and the Italian use "Kranton", and the self-check fails if "Kranz"
  appears.
- **Ballester et al. and crime.** The prompt had "Ballester and coauthors
  had crime networks in mind". In the published article crime networks
  appear only once, among the applications; the working paper (CEPR DP
  4421, 2004) was titled "Who's Who in Crime Networks". The lecture now
  says: "The working paper behind the article spoke of crime networks: if
  the police can remove one person, whom should they pick?"
- **Kearns, Littman and Singh.** The paper says "graphical models"; the name
  "graphical games" came into use after it. The lecture says they "proposed
  the model now called graphical games".
- **Bala and Goyal.** The lecture says "a star, with the hub paying for every
  link, comes back as an equilibrium". This is the centre-sponsored star of
  the two-way flow model, from secondary sources, rather than "stars come
  back".
- **Jackson and Wolinsky's term.** Their term is "strongly efficient"
  (largest total). The lecture says "efficient network" and defines it as
  "the largest total".
- **Lin et al.** The box gives the period as "from January 2018 to July 2019"
  (the abstract: 12 January 2018 to 17 July 2019). The 10%/80% split is "on
  average over the period", as the abstract says.
- **Avarikioti et al. 2019** has no price-of-anarchy result. The box gives
  the bounds on the price of anarchy and of stability to the 2020 paper
  only, as the prompt did. The first author is printed "Georgia" on the 2019
  paper and "Zeta" on the 2020 one; the box follows the papers.
- **F1.**
  - The regime readout says "the hub does nothing" at δ = −0.25 exactly
    (both formulas give hub 0, leaf 1 there).
  - The slider stops at ±0.45, and the chart marks ±0.5 as the limits,
    labelled once ("limit ±0.5"), on the right.
  - The leaf at δ = 0.3 is 1.3/0.64 = 2.03125, which `toFixed(4)` shows as
    2.0313 (the prompt has 2.0312).
- **F2.**
  - The readout also says why the star is not stable: "the hub gains by
    cutting a link" above δ, "two leaves gain by linking" below δ − δ².
  - The point snaps to 0.01, inside δ 0.01–0.99 and c 0.01–2.
  - At the two thresholds themselves the star counts as pairwise stable: a
    gain of exactly 0 is not strict. Gains within 1e-12 are taken as 0.
- **Panel A.**
  - "Best responses" shows the end at once, with the start and the number of
    turns. Run n uses seed n, and changing the network goes back to run 1.
  - The list sits behind "Specialized equilibria" ("Hide the list" to close
    it).
- **Panel B.**
  - A player can also be removed from the table (clicking again restores
    them).
  - Ties in the rankings, as on the ring, go to the lower number. Without
    that, float noise of 1e-15 reordered the ring's six equal
    intercentralities; the browser check caught it.
- **Panel C.**
  - Run n draws its random start and its pairs from one generator seeded n.
  - The end is checked before the first step and after every change, so the
    step count is the number of draws up to a stable network.
  - Any change of setting goes back to the start of the same run.
- **Stability check.** The self-check's perturbation test asks for an exact
  return (1e-9) to a stable set. Next to {1, 4} on the line there is a
  continuum of equilibria, (1 − a, a, 0, 1 − b, b) with b ≤ a, so after a
  push the profile only lands near the set.

## Exercise answers

All six of your answers agree with the recomputed ones.

1. 8/3 and 5/3 at δ = 0.25; 0 and 1 at δ = −0.25.
2. Line {1, 3, 5} (stable), {1, 4}, {2, 4}, {2, 5}; star {1} (total 1) and
   {2, …, 6} (total 5, stable).
3. Ring: {1, 3, 5} and {2, 4, 6} stable; {1, 4}, {2, 5}, {3, 6} not.
4. At 0.1 player 4 is both (1.4013; drop 1.9038 against 1.8784). At 0.3
   player 1 is most active (4.1655 against 4.1241), and the drops are
   11.3988 against 10.9163. The crossing is at 0.2696 (bisection:
   0.26959…). Exercise 4 is marked "sim" (only in Panel B), the others
   "both".
5. Thresholds 0.25, 0.5, 1. Complete 9 against 8; star 6 against 3; star 3,
   not stable; empty, with the star at −2.
6. As your answers.

## Self-check numbers (check-game-theory-09: 104 PASS, under 1 s)

- **Linear algebra.**
  - Jacobi eigenvalues against the closed forms: ring, line, star of 6.
  - On every preset the trace is 0 and the sum of squares is 2 × links.
  - λ_max agrees with power iteration.
  - (I − 0.3G) times its Gauss–Jordan inverse is I, to 1e-12.
- **F1.**
  - Every value you gave agrees: δ = −0.45 to −0.25 give (0, 1, 4); −0.2
    (0.2381, 0.9524, 4.0476); … 0.45 (14.7368, 7.6316, 45.2632); 0.3 is
    (3.4375, 2.0313, 11.5625).
  - At every δ of the slider, best responses from zero agree with the
    formulas to 1e-9; so do 20 random starts at four values of δ.
  - Star eigenvalues −2, 0, 0, 0, 2.
- **Panel A: the sets.**
  - Counts, sizes and stable sets exactly as yours.
  - Every maximal independent set is an equilibrium and no other 0/1
    profile is (all 2^n profiles checked).
  - Stability by definition agrees with the perturbation test.
- **Panel A: the runs.** Runs 1–20 all end at an equilibrium within 1e-9.

  | Network | Your "expected" (runs 1–20) | Lab's generator, runs 1–20 | Runs 1–200 |
  |---|---|---|---|
  | Star | always {2, …, 6} | the same | — |
  | Ring | always a stable set | the same: {1, 3, 5} 9, {2, 4, 6} 11 | 69 / 131 |
  | Line | {1, 3, 5} 17, not specialized 3 | **{1, 3, 5} 19, not specialized 1** | 181 / 19 |
  | Grid | {1, 3, 5, 7, 9} 13, {2, 4, 6, 8} 2, not specialized 5 | **{1, 3, 5, 7, 9} 17, {2, 4, 6, 8} 0, not specialized 3** | 149 / 22 / 29 |

  The bold cells are the "expected" values that differ. The working rule on
  seeds does not apply, since these are counts rather than a limit; the
  texts quote the generator's values.
- **Panel B.**
  - Bridge: λ_max 2.3475 and 1/λ_max 0.4260, both as yours; the slider ends
    at 0.42.
  - All efforts at 0.1, 0.2 and 0.3, the totals 11.3454, 15.7243 and
    26.8779, and the intercentralities at 0.3: as yours.
  - Every removal on four networks at every δ of each slider: the drop
    equals b_i²/m_ii (1e-9).
  - Equilibrium = best responses from zero = the sum Σ δ^k G^k 1.
  - The key player is 4 everywhere on the slider; the most active is 4 up
    to 0.26 and 1 from 0.27.
  - Line, star and ring at δ = 0.3: as yours. Slider ends: 0.57, 0.44, 0.49.
- **F2 and Panel C.**
  - The three totals equal the model's utilities (n = 3–12).
  - Brute force over all networks for n = 4 and n = 5 (200 points of
    (δ, c)) finds exactly the efficient network the thresholds name.
  - On all 1,024 networks of n = 5:
    - the complete network is the only pairwise stable one below δ − δ²;
    - the star is stable between δ − δ² and δ (not always alone);
    - above δ no stable network has a degree-1 player, and the empty one is
      stable.
  - The star is stable exactly when δ − δ² < c < δ (n = 6, 8).
  - n = 8, δ = 0.5: thresholds 0.25, 0.5, 1.25; totals 16.8, 11.9 and 9.1.
- **Panel C runs.**
  - 45 settings × 3 starts × 10 runs all end pairwise stable, none at the
    cap.
  - (0.5, 0.2): always complete. (0.5, 0.6): the empty start stays, and no
    end has a one-link player. (0.5, 1.5): always empty.
  - Your "expected" values at (8, 0.5, 0.4) from empty, runs 1–20: 8 to 10
    links ✓, never the star ✓, total 9.55 to 10.5. Here the totals are
    **9.60 to 10.50**: 9.55 appears from the random start, and from empty
    over runs 1–200 (7–10 links, 9.55–10.65).

## Numbers behind "What to observe"

**Panel A**

1. Line list: {1, 3, 5} total 3, the only stable one; {1, 4}, {2, 4}, {2, 5}
   total 2.
2. Line runs:
   - runs 1–4 end at {1, 3, 5};
   - run 5 ends at 0.4470, 0.5530, 0, 0.9149, 0.0851 (total 2);
   - over runs 1–20, 19 end at {1, 3, 5}.
3. Star runs: every run ends at {2, …, 6}, total 5, in 2 turns (run 13 in
   3).
4. Ring runs: {1, 3, 5} 9 times and {2, 4, 6} 11 times, never an opposite
   pair.
5. Grid run 5 is not specialized, total 3:
   - player 2 works 1;
   - players 4 and 7 work 0.5427 and 0.4573;
   - players 6 and 9 work 0.0786 and 0.9214.

   Over runs 1–20 the grid ends at {1, 3, 5, 7, 9} 17 times and never at
   {2, 4, 6, 8}.

**Panel B**

1. Bridge, δ = 0.3:
   - total 26.8779;
   - most active player 1 (4.1655); key player 4 (11.3988);
   - by effort 1, 4, 5, 2, 3, 6, 7, 8, 9; by intercentrality 4, 1, 5, 2, 3,
     6, 7, 8, 9.
2. Removals: without 4 the total is 15.4791 (drop 11.3988); without 1 it is
   15.9616 (drop 10.9163).
3. At δ = 0.1 player 4 is both (1.4013, 1.9038). The crossing is at 0.2696.
4. At δ = 0.42 the total is 517.6051.
5. Other networks at δ = 0.3:
   - line: key player 3 (4.2994);
   - star: hub 4.5455, leaves 2.3636, intercentrality 11.3636;
   - ring: 2.5 each and 4.9863.

**Panel C**

1. Defaults, run 1: 31 steps, 13 changes (11 links added, 2 cut), 9 links,
   degrees 3, 3, 3, 2, 2, 2, 2, 1; total 9.80 against 11.90.
2. Runs 2–5: 10.50, 9.80, 10.50, 9.60.
3. c = 0.2: every start ends complete, 28 links, 16.80.
4. c = 0.6:
   - from empty, 0 steps (the star would give 9.10);
   - from complete, run 1 cuts all 28 links in 155 steps.
5. c = 1.5: every start ends empty.
6. n = 12, run 1: 359 steps, 20 links, 26.25 against 29.70.

## References: confirmed and softened

All looked up on 25 November 2026; details and URLs are in the log.

**Confirmed in the paper itself (PDF, or the abstract where it settles the
point):**

- **Ballester, Calvó-Armengol and Zenou 2006.** Efforts proportional to
  Bonacich centrality; uniqueness iff 1 > δλ_1 in our normalization
  (Theorem 1); intercentrality b_i²/m_ii (Definition 2); the key player has
  the highest intercentrality (Theorem 3).
- **Jackson and Wolinsky 1996.**
  - Proposition 1 gives all three efficiency thresholds.
  - Proposition 2 (ii) and (iii): the complete network is the unique stable
    one, and the star is stable but not necessarily unique.
  - Proposition 2 (iv): above δ every player in a nonempty stable network
    has at least two links.
  - "Pairwise stable" and "connections model" are their own terms.
- **Lin et al. 2020.** Every number from the NJP abstract: 18 months, 12
  January 2018 to 17 July 2019; 8,216 users; 122,517 active channels; 10% of
  the nodes hold 80% of the bitcoins at stake (on average); "more and more
  compatible with a core-periphery structure"; "removing hubs leads to the
  collapse of the network into many components". The 2021 corrigendum does
  not touch these.
- **Avarikioti, Scheuner and Wattenhofer 2019** (abstract): "the star is a
  Nash equilibrium when each channel party can freely decide the channel
  fee". The box says "may set its fee as they wish".
- **Avarikioti, Heimbach, Wang and Wattenhofer 2020** (arXiv): betweenness
  as the measure of the fees received; price of anarchy O(1) or O(n) by
  parameter region; price of stability O(1), and 1 where the star is optimal
  and an equilibrium.
- **Kearns, Littman and Singh 2001:** payoffs depend only on the neighbours.

**Confirmed through Crossref, IDEAS or publisher pages:**

- Morris 2000; Jackson and Watts 2002 (improving paths, one link at a time);
  Bala and Goyal 2000 (the initiator pays); all volumes and pages as cited.
- Jackson 2008: ch. 6 "Strategic Network Formation", ch. 9 "Decisions,
  Behavior, and Games on Networks", ch. 11 "Game-Theoretic Modeling of
  Network Formation". The reading list gives these titles.
- Nisan et al.: ch. 19 "Network Formation Games and the Potential Function
  Method", ch. 24 "Cascading Behavior in Networks: Algorithmic and Economic
  Issues".

**Softened, or from secondary sources:**

- Kranton for "Kranz" (see "Differences").
- Bramoullé–Kranton's stability theorem (Theorem 2, "maximal independent set
  of order 2"): from papers that quote it; the original was not opened.
  Maximal independent sets as specialized equilibria: from Kranton's
  handbook chapter.
- Bramoullé–Kranton–D'Amours: "unique if δ|λ_min| < 1" is a sufficient
  condition (handbook chapter, Proposition 1), necessary only in special
  cases. The lecture says "unique when", never "only when".
- Ballester et al. and crime networks: softened, as above.
- Bala and Goyal's centre-sponsored star: from secondary sources.

## Timings in the browser (1280 px, Chrome, functional check)

- Panel A "Best responses" on the grid: 3–6 ms per run (runs 1–5).
- Panel B removal of player 4: 3 ms.
- Panel C "To the end" at n = 12: 4–5 ms (359 steps).
- Nothing on page load takes noticeable time.

## Figure heights and chunk size

- **Figure heights.** Two measurements:
  - with caption (functional check): F1 443 px and F2 445 at 1280 EN (IT 443
    and 462); 608 and 746 at 375 IT;
  - figure body only (check-module): 396 and 399 at 1280 EN; 542 and 696 at
    375 EN.

  F1 is above the "about 380" guide. Its readouts were moved beside the
  drawing and shortened (it was 483 px), and I stopped there.
- **Chunk size.** The module chunk is 76.8 kB (27.5 kB gzip). It imports
  only the shared Slider, DrawToggle, network/ui and network/charts chunks:
  no recharts, nothing from earlier modules. It fits 375 px with no
  horizontal scroll (checked in both languages).

## Italian terms for module 09 (added to the status file)

**Found in Italian sources:**

- giochi su reti; reti efficienti (Fagnani, Politecnico di Torino);
- complementi / sostituti strategici (course slides; Tor Vergata syllabus);
- insieme indipendente massimale (it.wikipedia);
- canale di pagamento (PoliTo and UniBo theses);
- commissione di instradamento (Italian Lightning explainers);
- formazione di reti (Padova theses).

**Not found, chosen as the natural term, with the English kept at first
use:**

- equilibrio specializzato;
- giocatore chiave (*key player*);
- intercentralità;
- centralità di Katz–Bonacich (Italian authors write it in English);
- stabilità a coppie / stabile a coppie (*pairwise stability*);
- modello delle connessioni (*connections model*);
- beni pubblici locali, the public-finance term, with "lungo i collegamenti
  della rete".

**Also used:**

- stella, rete completa, rete vuota;
- rete a ponte; linea; anello; griglia;
- centralità di intermediazione (*betweenness*); centro–periferia;
- prova, giro, passo (run, turn, step).

## Checks (final code, before the squash; one at a time, in the foreground)

**Problem during the run.** check-game-theory-03 ran past the tool's 300 s
limit and was moved to the background. The tool started -04 to -09 while
it was still running, which breaks the one-at-a-time rule. After -03
finished (passed), I reran -04 to -09 alone, one at a time.

**Self-checks:** check-game-theory-01 to 09 all passed.

**Builds:**

- `npx vite build`: built.
- `npm run build`: passed (validate, vite build, post-build).
- `npm run check:dist`: 0 failures of 108.

**Browser checks** (all on a build of the final code):

| Check | Failures |
|---|---|
| check-index game-theory | 0 of 80 |
| check-index network | 0 of 76 |
| check-index complexity | 0 of 72 |
| check-links | 0 of 131 |
| check-module, the nine modules | 0 each (56, 56, 56, 56, 56, 60, 68, 56, 60) |
| the nine functional checks | 0 each (32, 49, 39, 45, 39, 41, 41, 43, 42) |
| build-main + compare-main | 0 of 144 |

**Failures fixed before the final run** (details in the log):

- the star's "2 turns" text (run 13 takes 3);
- the ring's tie ranking;
- two errors in the new browser check itself.
