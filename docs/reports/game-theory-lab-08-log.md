# Game Theory Lab 08 — working log

Prompt: `prompts.local/game-theory-lab-08.md` (module 08,
`congestion-price-of-anarchy`, plus stage 0 on module 07).

## Start

- 2026-11-25. Branch `game-theory-lab`, tree clean, HEAD 0581a10 "Game Theory
  Lab 07: report". Status file: module 07 done, nothing in progress; report 07
  committed. Preconditions hold.

## Stage 0

- Module 07, English only: chicken's "go" → "straight" in the lecture
  ("(swerve, straight)", "Told to go straight", "a coin that only picks who
  goes straight"), F2 (slider label "(straight, straight)", cells SS, ST,
  TS, TT with "S = swerve, T = straight": S is taken, so straight is T), the
  coin readout, Panel C's action names (Swerve, Straight), exercise 6, the
  observe list of Panel C ("goes straight"), a comment in correlated.js; the
  browser check and check-game-theory-07 updated where they quote them.
  Italian unchanged.

## Checks run

- `node scripts/lab/check-game-theory-08.mjs` (logic only, texts not yet
  written): all checks passed. Survey n = 3, r = 1, seed 1: d = 1 mean
  1.036, largest 1.289, above 1.05 0.27 (prompt 1.038, 1.250, 0.29); d = 2
  1.102, 1.588, 0.55 (prompt 1.097, 1.536, 0.54); d = 4 1.245, 2.110, 0.72
  (prompt 1.236, 2.091, 0.70). Seeds 1–10: d = 1 means 1.033–1.040, largest
  1.241–1.289, above 0.25–0.30; d = 2 1.092–1.109, 1.493–1.588, 0.52–0.58;
  d = 4 1.223–1.261, 2.028–2.129, 0.70–0.74: the prompt's values sit inside
  these ranges. Four drivers, random starts seeds 1–10: nine end at all
  direct; seed 10 draws all detours (1111), an equilibrium, and stays
  there (prompt: all reach all direct). Timings in Node: 36 surveys of
  1,000 instances 0.42 s; n = 40 "To the end" plus survey 3 ms; k = 20 1 ms.
- `node scripts/lab/check-game-theory-08.mjs` with the quoted checks: first
  run 2 failures, both in the check's own phrase lists ("1 hour" and
  "0.625 and 0.375" had no Italian form); fixed in the check, then all
  checks passed.
- `node modules/game-theory-congestion-price-of-anarchy.mjs` (first
  version): 0 failures of 43. Screenshots (`shots.mjs`) showed F1's x-axis
  label "1.00" clipped and F2's road labels on the strokes: F1's chart
  lowered from 180 to 150 and its end ticks written 0 and 1; F2's labels
  moved off the roads; Panel B's chart labels to the left.

Final CHECKS list, on the code of the module commit, one at a time:

- `npx vite build`: built; module chunk `index-BR3ayEV7.js` 86.2 kB (29.1 kB
  gzip).
- `check-game-theory-01` to `-08`: "All checks passed" each.
- `check-index.mjs game-theory` 0 failures of 80; `network` 0 of 76;
  `complexity` 0 of 72; `check-links.mjs` 0 of 131.
- `check-module.mjs game-theory <slug>`: modules 01–05 0 failures of 56
  each, 06 0 of 60, 07 0 of 68, 08 0 of 56. Module 08 figure heights: 1280
  EN 346 and 426 px, IT 346 and 442; 375 px 447 and 633.
- `modules/game-theory-congestion-price-of-anarchy.mjs` 0 failures of 43
  (timings: F2 slider to readout 6 ms; Panel A 1,000 instances 7–8 ms from
  the click, 32 ms call to result; Panel B "To the end" at n = 40 12 ms;
  Panel C "To the end" at k = 20 9 ms);
  `modules/game-theory-evolution-and-learning.mjs` (stage 0) 0 of 41.
- `build-main.mjs` then `compare-main.mjs`: 0 failures of 144.
- `npm run build`: built, post-build 9 static pages, 3 redirect stubs.
- `npm run check:dist`: 0 failures of 108.

## Sources looked up

(November 2026, by a research subagent; Crossref = api.crossref.org.)

- Pigou 1920: the two-road model is in the first edition (McDonald, JHET
  35(3), 2013, 353–371, IDEAS); later editions dropped it; Knight's critique
  QJE 38(4), 1924 (doi 10.2307/1884592). Confirmed.
- Koutsoupias–Papadimitriou, STACS 1999, LNCS 1563, 404–413 (doi
  10.1007/3-540-49116-3_38). They called the ratio "coordination ratio"; the
  journal version (Computer Science Review 3, 2009) says "price of anarchy"
  was first introduced in Papadimitriou, STOC 2001, 749–753. The lecture
  says so and cites Papadimitriou 2001.
- Wardrop 1952: Proc. ICE Part II 1(3), **325–362** (doi
  10.1680/ipeds.1952.11259); 362–378 is the printed discussion. Corrected
  in the reading list (prompt: 325–378).
- Beckmann–McGuire–Winsten 1956: potential (sum of integrals) and efficient
  tolls confirmed from secondary sources (Nagurney's lecture notes; Boyce
  and Nagurney on Beckmann); the book itself not seen.
- Braess 1968: Unternehmensforschung 12(1), 258–268 (doi
  10.1007/BF01918335); English translation Transportation Science 39(4),
  446–450, 2005. Confirmed.
- Cohen–Horowitz: Nature 352, 699–701 (doi 10.1038/352699a0). Confirmed.
- Real case: Youn, Gastner, Jeong, PRL 101, 128701 (2008) is a simulation
  on the road graphs of Boston, London, New York (no observation; it calls
  the real cases "an anecdote with only sketchy empirical evidence"); Fisk
  and Pallottino, Transportation Research A 15, 1981, found on Crossref but
  not read. No real case given in the lecture.
- Roughgarden–Tardos, JACM 49(2), 236–259 (doi 10.1145/506147.506153):
  4/3 for linear (affine) latencies and "no more than ... routing twice as
  much traffic", from the abstract. Confirmed.
- Roughgarden 2003, JCSS 67(2), 341–364: worst case on two nodes and two
  links (as quoted by Anshelevich et al.). Confirmed; values from the closed
  form, as computed by the check.
- Rosenthal 1973, IJGT 2, 65–67 (doi 10.1007/BF01737559); Monderer–Shapley
  1996, GEB 14, 124–143 (doi 10.1006/game.1996.0044), the name "potential
  games". Confirmed.
- 5/2: Awerbuch–Azar–Epstein STOC 2005, 57–66 (abstract: "exactly 2.5 for
  unweighted demand"); Christodoulou–Koutsoupias STOC 2005, 67–73
  ("the price of anarchy is 5/2" for pure equilibria, linear latencies).
  Confirmed.
- Fabrikant–Papadimitriou–Talwar STOC 2004, 604–612: PLS-complete in
  general; examples with exponentially long improvement paths. Lecture
  words: "best responses can need exponentially many steps".
- Anshelevich et al. FOCS 2004, 295–304; SICOMP 38(4), 2008, 1602–1623: an
  equilibrium of cost at most H(k) times optimal, tight in directed graphs;
  price of anarchy Θ(k). Confirmed.
- Roughgarden, Twenty Lectures: 11 "Selfish Routing and the Price of
  Anarchy", 12 "Over-Provisioning and Atomic Selfish Routing", 13
  "Equilibria: Definitions, Examples, and Existence", 15 "Best-Case and
  Strong Nash Equilibria", 16 "Best-Response Dynamics". Confirmed.
- Nisan et al.: ch. 17 "Introduction to the Inefficiency of Equilibria"
  (Roughgarden, Tardos), 18 "Routing Games" (Roughgarden), 19 "Network
  Formation Games and the Potential Function Method" (Tardos, Wexler).
  Confirmed (Cambridge Core).
- Shoham–Leyton-Brown 6.4 "Congestion games" (6.4.1–6.4.5, including
  potential games, nonatomic games, selfish routing): the book's own table
  of contents. Confirmed.

Italian terms (sources: Padova theses "Instradamento egoistico in reti
multi-salto" and "Network formation games" on thesis.unipd.it; Barbarino,
"Appunti di Teoria dei Giochi", Pisa; a Pisa report on Wardrop equilibria;
it.wikipedia "Paradosso di Braess", "Imposta pigouviana", "Esternalità",
"Numero armonico"; a Politecnico di Torino thesis on transport
externalities):
- prezzo dell'anarchia, prezzo della stabilità, paradosso di Braess, flusso,
  costo marginale, esternalità, funzione potenziale, numero armonico, giochi
  di congestione, giochi di condivisione dei costi: found as proposed.
- equilibrio di Wardrop found; "principio di Wardrop" not found: the
  lecture uses "equilibrio di Wardrop".
- selfish routing: "instradamento egoistico" (Padova thesis title).
- "imposta pigouviana" is the it.wikipedia title, "tassa pigouviana" also
  used: the lecture uses "imposta pigouviana".
- "gioco potenziale / giochi potenziali" in the sources, not "gioco di
  potenziale": the lecture uses "giochi potenziali".
- "gioco non atomico" found; "giocatori atomici" not: the lecture speaks of
  the game as atomic or non atomic.
- "dinamica di miglior risposta": not found verbatim ("miglior risposta" is
  standard); kept as in module 02.
- pedaggio: ordinary usage, no game-theory source specifically.
- hub: kept in Italian, as in the Network Lab's Italian lectures.

## End

- Module commit 6af4fff (WIP eadf849 and ecbbb61 squashed). Report written to
  `docs/reports/game-theory-lab-08.md`, committed with this log and the
  status file as "Game Theory Lab 08: report".
