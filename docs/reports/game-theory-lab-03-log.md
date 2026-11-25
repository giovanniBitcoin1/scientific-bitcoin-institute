# Game Theory Lab 03 — working log

Prompt 3 (fixes to module 02, then module 03 "Mixed strategies and
zero-sum games"). One line per check run to its end (command, result) and
one line per source looked up (what, where, what it says). A session that
picks up this prompt reads this file first.

## Session 1 (25 November 2026)

- Start: branch `game-theory-lab`, tree clean, last commit ffca014 "Game
  Theory Lab 02: report". Status file: module 02 done, nothing in
  progress; `docs/reports/game-theory-lab-02.md` committed. Preconditions
  met.

### Checks

- Stage 0a. `node scripts/lab/check-game-theory-02.mjs` (after the new
  wording and its check): 124 PASS, 0 FAIL, "All checks passed". The new
  check: 400-run chances 0.125 (from 0.70) and 0.785 (from 0.75), within
  0.03 of 1/7 and 4/5.

### Sources

Stage 0b, the sources of module 02 (one pass, web, 25 November 2026):

- Rousseau, *Discours sur l'origine et les fondements de l'inégalité* —
  fr.wikisource.org, Seconde partie; rousseauonline.ch — the stag passage is
  in Part Two («S'agissait-il de prendre un cerf, chacun sentait bien qu'il
  devait pour cela garder fidèlement son poste ; mais si un lièvre…»); first
  edition Amsterdam, Rey, 1755 (written 1754). Confirmed; text unchanged.
- Cournot 1838 — Magnan de Bornier, HOPE 24:3 (1992), references: "Paris:
  L. Hachette". Confirmed.
- Bertrand 1883 — same HOPE article and Schumpeter (1954): *Journal des
  Savants*, September 1883, 499–508. Confirmed; "September" added to the
  citation.
- Nash 1951 — JSTOR record 1969529 (through search results; direct fetch
  refused), MIT Libraries: Annals of Mathematics 54 (2), September 1951,
  286–295. Confirmed.
- Nash 1950 — PubMed Central PMC1063129: PNAS 36 (1), January 1950, 48–49.
  Confirmed.
- Harsanyi and Selten 1988 — EconPapers record: MIT Press, 1988. That the
  terms "payoff dominance" and "risk dominance" are theirs: Wikipedia ("Risk
  dominance", "Equilibrium selection") and general usage only. Kept.
- Lewis 1969 — Texas A&M catalogue: Harvard University Press, 1969. Confirmed.
- Theocharis 1960 — RePEc/IDEAS v27y1960i2p133-134: vol. 27 (2), 133–134,
  title as cited. Confirmed.
- Goldberg, Goldman and Newman 1968 — NIST PDF jresv72Bn2p93_A1b: J. Res.
  NBS 72B (2), 93–101; the probability of a pure equilibrium in a random
  m × n game, limit 1 − 1/e. Confirmed.
- Schelling's New York answers — book text not reachable (archive.org
  lending only). Secondary: Zambrano, MPRA paper 23474 (table: "absolute
  majority meet at Grand Central", "virtually all at 12 noon"; quotes "36
  persons concerted on heads … and only 6 chose tails", Schelling 1960
  p. 57); Bardsley et al., "focal_points_3" (heads 36, tails 6). "More than
  half" and "nearly all" kept; "the information booth" is not in either
  source, so the sentence now says "Grand Central Station"; "a large
  majority said heads" becomes "36 of 42 said heads" (from two secondary
  sources quoting the book).
