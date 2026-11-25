# Game Theory Lab, prompt 7: report

Module 07 "Evolution and learning" (`evolution-and-learning`) is built and
ready, with stage 0. Branch `game-theory-lab`; nothing pushed.

- b3b686f "Game Theory Lab 07: Evolution and learning" (stage 0 and module;
  three WIP commits squashed: 2cc7991, 25b26c9 and the final state).
- "Game Theory Lab 07: report": this file and the working log
  `docs/reports/game-theory-lab-07-log.md`.

## Stage 0

The search found "defezionator" once in the lab's Italian texts. It is in
module 01's lecture (`what-is-a-game.it.md`, the paragraph on the (T, S)
map). "per chi coopera contro un defezionatore" now reads "per chi coopera
contro chi defeziona". No check quotes the phrase, and check-game-theory-01
still passes (102/102).

Selten's 20 towns: I could not reach the paper; Springer and the Bielefeld
working paper both refused access. Wikipedia's article on the paradox says
"branches in 20 towns" and cites Selten 1978, so the source is secondary
only. As you asked, module 06 is unchanged.

## Differences from the prompt

- **Panel C's bound with a start away from the centre.** ln 2/(ηt) + η/8
  holds only for the uniform start. For a start (π, 1 − π), Hedge's bound is
  ln(1/min(π, 1 − π))/(ηt) + η/8 (the prior enters the log term). The page
  draws this general bound, which is the prompt's at the default start.
  Checked from (0.8, 0.2), 5 games × seeds 1–20: largest ratio 0.969.
- **First heading.** The prompt's first heading, "Strategies that spread" /
  "Strategie che si diffondono", is now "A population of strategies" / "Una
  popolazione di strategie". The old heading is also the opening words of
  the module summary, which the locked page shows. check-module uses the
  first heading to check that no lecture text appears while locked, so it
  failed at all four sizes.
- **Italian title of Panel C.** "Imparare dal regret", not "Imparare dal
  rimpianto". Italian technical sources keep *regret*; the lecture glosses
  it once as "il rimpianto".
- **English names.** "Matching pennies" in English, as in modules 01–03,
  and "pari o dispari" in Italian. Chicken's moves are "swerve" and "go", as
  the prompt says, although module 01's table says "Straight"; in Italian
  they are "sterza" and "dritto", as in module 01.
- **Panel resets.**
  - A preset in Panel A starts again from (0.5, 0.3, 0.2).
  - A game pill in Panel C goes back to run no. 1 and the start (0.5, 0.5).
  - Without these resets the observe lists, which quote the defaults, could
    not be followed in order.
- **Panel A drawing.** Each trajectory is computed at once with RK4 (10,000
  steps, about 17 ms in Node) and drawn progressively, 0.8 time units per
  frame. Play replays the newest trajectory.
- **Panel B sliders and seeds.**
  - w is a log slider from 0.001 to 0.9, rounded to two significant digits.
  - The neutral line on the chart is N·ρ = 1.
  - "Run 10,000 mutants" n uses seed n.
  - "Watch one" uses seed 1001 + the number of runs so far, one event per
    frame. It marks the parent with a ring and the replaced individual with
    a thicker ring.

## Exercise answers

I recomputed all six; none differs from yours:

1. Doves are invaded by hawks (4 > 3) and hawks by doves (1 > 0); the ESS
   is half hawks.
2. (4/3, 1/3): x* = 1/2, stable. (1/2, −1): x* = 2/3, unstable. (2, −1/2):
   no interior point, D takes over.
3. a > b: the population spirals in. a = b: V is constant at 0.03. a < b:
   the population spirals out.
4. 1/17, and x > 4/9 (from 14 + 36x > 30).
5. 0.148, 0.059 and 0.1; the hare hunter takes over more often, 0.0184
   against 0.0013.
6. 8/3 against 2; ln 2/200 + 0.0125 = 0.0160.

## Self-check numbers (check-game-theory-07: 139 PASS, about 2 s)

These matched your values:

- **ESS.** As you stated.
- **F1.** All fates and x* values, and every RK4 value: chicken 0.3779,
  0.4762, 0.4998 (from 0.9: 0.6221, 0.5238, 0.5002); stag hunt 0.0043 and
  0.9558; dilemma 0.4992 and 0.0472. Halving the step changes nothing at 4
  decimals.
- **Panel A.**
  - At a = b, |V − 0.03| < 1e-9 up to t = 100.
  - The period is 11.3983, and the average over one period is (0.3332,
    0.3334, 0.3334).
  - Every V value agrees with yours to six digits. Your 0.037035 is a
    half-way case at four digits: the code gives 0.037035004 and
    0.037035021. My first comparison failed on it, and the check now allows
    half a unit of the last digit kept.
  - Eigenvalues: the formula and the numerical Jacobian agree to 1e-7.
  - The matrix played out is [[30, 0, 30], [50, 10, 14], [30, 9, 30]], and
    the thresholds are exactly 1/17 and 4/9. All seven end states agree.
- **Panel B.** All fixation probabilities agree, and so does a direct solve
  of the chain's equations. Swapping roles swaps ρ_A and ρ_B. A full-process
  test agrees too: 4,000 runs of "Watch one" at N = 10.
- **F2.** Five vertices at d = 0. At every d the best, worst and mixed
  payoffs and the areas agree with yours, and with the closed forms at all
  40 slider values (largest gap 4.4e-16). A brute-force grid of 45,000
  lotteries confirms best 8/3 and worst 5/3.
- **Panel C.** The bound values; the end points of chicken, the dilemma,
  the stag hunt from both starts and the battle of the sexes in every run;
  in pari o dispari, the frequencies within 0.04, the payoff within 0.03,
  and the distance above 0.4 and above its value at t = 200. The violation
  falls with T (0.0290, 0.0191, 0.0080).

**"Expected" values that differ.** I did not change any check or seed for
these; the checks are the ones you asked for.

| Quantity | Yours | Mine |
|---|---|---|
| Runs, neutral, N = 10 (seeds 1–10) | 0.098–0.105 | 0.0969–0.1029 |
| Runs, r = 1.1, N = 10 | 0.144–0.155 | 0.1434–0.1504 |
| Runs, hare, N = 50, w = 0.1 | 0.0167–0.0213 | 0.0162–0.0199 |
| Largest regret / bound | 0.898 | 0.971 (any round t); 0.917 (last round only) |
| Pari o dispari, mean distance, end / t = 200 (seeds 1–50) | 0.590 / 0.332 | 0.569 / 0.323 |
| Same, seeds 1–10 | | 0.594 / 0.316 |

- **Runs.** All are within 4 standard errors; the largest |z| is 1.65.
- **Regret ratio.** Your 0.898 was probably taken at the last round only.

## Numbers behind "What to observe"

All pinned by the self-check and by the browser check.

- **A.**
  - a = b: V = 0.03; one turn takes about 11.4; at t = 100 the point is
    (0.4179, 0.1774, 0.4047) and the average (0.329, 0.336, 0.334).
  - Win more: −0.08333 ± 0.72169i, the point (0.3333, 0.3334, 0.3334),
    V = 0.03704.
  - Lose more: +0.08333 ± 0.72169i, the point (1, 0, 0), V = 1.99e-17.
  - Repeated dilemma: from (0.5, 0.3, 0.2) the end is (0.0230, 0, 0.9770);
    from (0.1, 0.85, 0.05) always defect takes over.
- **B.**
  - r = 1.1, N = 10: ρ = 0.147950; run 1 measures 0.1504 (0.1434–0.1574).
  - r = 0.9: 0.059482. At N = 100: 0.090916 for r = 1.1 and 0.000003 for
    r = 0.9.
  - Stag hunt: stag 0.001284, hare 0.018412, ratio 14.34; stag at N = 10
    0.057358.
  - Coordination at w = 0.01: 0.020207 at x* = 0.3 (yes; yes) and 0.019455
    at 0.4 (no; no).
  - Dilemma: 0.000161 and 0.143350. Hawk and dove: 0.037537 and 0.040252.
- **C.**
  - Chicken, run 1: ends at (0, 1), cell 0.875, payoffs 3.674 and 1.147,
    regret 0.0036, bound 0.0160; run 2 ends at (1, 0).
  - Pennies: ends at (0.0998, 0.0014), frequencies 0.516 and 0.494, payoffs
    0.499 and 0.501.
  - T = 10,000 with η = 0.0235: bound 0.0059, regrets 0.0028 and 0.0026,
    violation 0.0031.
  - Dilemma (D, D) 0.972; stag hunt from (0.8, 0.8) ends at stag; battle
    (Concert, Concert) 0.970.

## References: confirmed and softened

Details are in the log. Most citations were checked through Crossref.

- **Confirmed:**
  - Maynard Smith and Price 1973 (Nature 246, 15–18).
  - Taylor and Jonker 1978. The title really is "Evolutionary stable
    strategies…".
  - Hofbauer, Schuster and Sigmund 1979 (J. Theor. Biol. 81, 609–612),
    added to the reading list.
  - Sinervo and Lively 1996, Moran 1958, Nowak, Sasaki, Taylor and
    Fudenberg 2004.
  - Kandori, Mailath and Rob 1993: the abstract says the risk-dominant
    equilibrium is selected.
  - Littlestone and Warmuth 1994, Freund and Schapire 1997 and 1999,
    Aumann 1974.
  - Hart and Mas-Colell 2000: the abstract says play converges to the set
    of correlated equilibria.
  - Bailey and Piliouras 2018, EC '18, pp. 321–338. The abstract says play
    moves away from the equilibrium, towards the boundary.
  - Osborne ch. 13 "Evolutionary Equilibrium"; Shoham and Leyton-Brown
    ch. 7 "Learning and Teaching"; Nisan et al. ch. 4 (Blum and Mansour).
  - Nowak 2006: ch. 4 "Evolutionary Games", ch. 6 "Finite Populations",
    ch. 7 "Games in Finite Populations". Your chapters stand; the list
    comes from a bookseller's table of contents.
- **Confirmed through secondary sources or standard results** (book or
  paper not opened):
  - ESS ⇒ asymptotically stable, the converse with two strategies, and its
    failure with three (Hofbauer and Sigmund 1998).
  - The time average on closed orbits.
  - Hannan as the first no-regret rule. The pages are usually given as
    97–139; De Gruyter's reprint has 97–140 (1958). I kept 97–139.
  - The bound ln n/η + ηT/8 with constant 1/8 (Cesa-Bianchi and Lugosi
    2006, Thm 2.2, via a secondary restatement).
  - The Freund–Schapire 1999 claim, from the Blum–Mansour chapter.
  - CE = CCE with two actions each (a Lancaster working paper, arXiv
    1308.6025).
  - Young 1993: the end page 84 and the risk-dominant result.
- **Softened:**
  - The lizards' cycle is "a few years". The abstract's snippets speak of
    oscillation over six years of observation, later papers of a period of
    about 4–5 years.
  - Roughgarden's lecture 13 is "Equilibria: Definitions, Examples, and
    Existence". The hierarchy is in it, but it is not the title, so the
    text says "(Roughgarden, lecture 13)" with no title.
  - The one-third rule is credited to Nowak et al. 2004, risk-dominance
    part included. Ohtsuki, Bordalo and Nowak (2007) credit both parts to
    that paper and call it "the one-third law".

## Timings in the browser (1280 px, Chrome)

| Action | Time |
|---|---|
| F2, one slider move | 5 ms (22 ms from the call to the readout) |
| Panel A, trajectory from the click to t = 100 | 889 ms to draw (computed at once) |
| Panel B, 10,000 mutants | 6 ms (r = 1.1, N = 10); 5 ms (hare, N = 50) |
| Panel B, "Watch one" at N = 10 | 43 ms; that mutant died out in 5 steps (a fixation takes many more frames) |
| Panel C, run at T = 10,000 | 8 ms |

Nothing slow runs when the page loads.

## Figure heights and chunk size

| Figure | 1280 px EN | 1280 px IT | 375 px EN | 375 px IT |
|---|---|---|---|---|
| F1 | 384 px | 400 px | 671 px | 705 px |
| F2 | 403 px | 403 px | 716 px | 716 px |

At 375 px the readouts stack under the figures. There is no horizontal
scroll at either width.

The module chunk is 87.9 kB (32.1 kB gzip). Module 01's `games.js` comes
from the existing shared chunk, and the module uses no recharts.

## Italian terms for module 07

Recorded in the status file's table; the sources are in the log.

**Attested in Italian sources:**
- teoria evolutiva dei giochi (more usual than "teoria dei giochi
  evolutiva")
- strategia evolutivamente stabile (ESS)
- dinamica del replicatore. "equazione del replicatore" is used for the
  equation itself; it is a plain calque, no source has it.
- coesistenza, bistabilità
- punto di equilibrio for a rest point. "punto di riposo" has no source.
- asintoticamente stabile
- probabilità di fissazione, mutante
- equilibrio correlato
- equilibrio correlato *coarse*. "grossolano" was not found; a polimi
  thesis writes "Coarse-Correlati".
- tasso di apprendimento

**Kept in English, as Italian sources do:** *regret* (glossed once as "il
rimpianto"), *no-regret*, *swap regret*, *regret matching*, *Hedge*.

**Plain Italian with no source found:** processo di Moran (one source says
"modello di Moran"), deriva neutrale, intensità della selezione, regola di un
terzo (*one-third rule*), pesi moltiplicativi.

**Other choices:**
- The lizard is "la lucertola *Uta stansburiana*"; I found no Italian
  common name.
- In F1, "retta delle fasi" for the phase line; "il semaforo" for F2.
- rischio-dominante, as already decided.

## Checks (final code, before the squash; all in the foreground)

| Check | Result |
|---|---|
| `npx vite build` | built |
| check-game-theory-01 … 07 | 102, 124, 119, 121, 136, 136, 139 PASS; 0 FAIL |
| check-index game-theory / network / complexity | 0/80, 0/76, 0/72 |
| check-links | 0/131 |
| check-module, modules 01–05 | 0/56 each |
| check-module, module 06 | 0/60 |
| check-module, module 07 | 0/68 |
| modules/game-theory-* (01–07) | 0/32, 0/49, 0/39, 0/45, 0/39, 0/41, 0/41 |
| build-main + compare-main | 0/144 |
| `npm run build` | exit 0 |
| `npm run check:dist` | 0/108 |
