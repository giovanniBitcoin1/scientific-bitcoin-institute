# Game Theory Lab — report on prompt 6

Prompt 6: stage 0, the Italian terms of modules 01–05; stage 1, module 06
"Repeated games and reputation" (`repeated-games-reputation`). Branch
`game-theory-lab`, nothing pushed. The working log is
`docs/reports/game-theory-lab-06-log.md`.

## Commits

- 8601885 "Game Theory Lab: Italian terms" (stage 0)
- 8b2f491 "Game Theory Lab 06: Repeated games and reputation" (three WIP
  commits squashed: e78727b, 3aaf707, 7a4bfa2)
- "Game Theory Lab 06: report" (this file and the log)

## Stage 0 — Italian terms

### The working rule

Added to "Working rules" in `docs/game-theory-lab-status.md`, as written in
the prompt. The "Italian terms" section is now one table (English, Italian,
module), headed "Revised in prompt 6 to the textbook terms."

### The (verify) items, with their sources

Sources were looked up by a helper agent, which downloaded about 35 Italian
PDFs (lecture notes, theses, Treccani) and searched their text; full list
in the log.

| English | Proposal | Chosen | Source |
|---|---|---|---|
| payoff dominant | Pareto-dominante | **Pareto-dominante** | "l'equilibrio (C,C) Pareto-domina…" (Festa–Cevolani, Univ. Trieste; Unimi thesis); "payoff-dominant (ottimo paretiano)" (Unifi). Nothing for "dominante nei payoff". |
| risk dominant | dominante in termini di rischio | **rischio-dominante** | No source for the proposal. Unisi (cap. 1, "Interazioni sociali e schema istituzionale"): "dominanza di rischio", "equilibrio rischio dominante"; Unifi keeps "risk-dominant". |
| tipping point | soglia critica | ***tipping point*** (kept in English) | No Italian source for soglia critica, punto di svolta or punto critico; Italian authors keep "tipping point" (Kollmann, Marsiglio, Suardi, Tolotti 2021). |
| contest | gara unless sources prefer *contest* | **gara** (kept) | No Italian source either way. |
| off the equilibrium path | fuori dal sentiero di equilibrio | **fuori dal sentiero di equilibrio** | LUISS thesis (De Angelis), Gibbons' requirement 4: "fuori dal sentiero di equilibrio"; LUISS (Guerrini). "Cammino" appears once (Unimore). |
| bias | distorsione unless sources prefer *bias* | **distorsione** (kept) | No Italian treatment of Crawford–Sobel found. |

The other terms of the table were applied as given. Found in sources:
funzione/curva di reazione, minaccia non credibile (Treccani, Battigalli:
"minacce e promesse non credibili"), vantaggio della prima mossa,
incumbent, deterrenza, insieme informativo (Chieti; Patrone writes "insieme
di informazione"), decisore (Patrone), pooling, pari o dispari (Patrone),
maxmin. Not found, but applied because the prompt decided them: libera
entrata, criterio intuitivo, payoff del babbeo, payoff di sicurezza.

### Changes per module (lines of Italian text changed)

| Module | Lines | Main changes |
|---|---|---|
| 01 | 14 | miglior risposta; payoff del babbeo; cumulo di neve (*snowdrift*); pari o dispari (*matching pennies* at first use); "strategie miste" in Panel C's note; PayoffTable legend; the module list |
| 02 | 37 | miglior risposta; funzione di reazione, retta di reazione (F2 legend); Pareto-dominante; rischio-dominante; *tipping point*; libera entrata; pari o dispari |
| 03 | 34 | strategia mista (for "miscela"); strategia di maxmin, payoff di sicurezza; *fictitious play*; "(la morra cinese)" at the first sasso-carta-forbici; pari o dispari; *tipping point* |
| 04 | 63 | entrante, *incumbent* (l'incumbent, masculine); gioco dell'entrata, deterrenza all'entrata; minaccia non credibile; *leader*, *follower* (Panel B and the lecture section are now "Leader e follower"); vantaggio della prima mossa; *punitive forking*; the note on "piano" at its first use; F1's newcomer initial E |
| 05 | 49 | entrante, incumbent (duro, debole); insieme informativo; equilibrio *pooling* (Panel B's "Pooling a e"); condizione di *single crossing*; criterio intuitivo; decisore; fuori dal sentiero di equilibrio; rischio-dominante |

English words kept in Italian are in italics at their first use in each
lecture (payoff, incumbent, leader, follower, pooling, single crossing,
fictitious play, punitive forking, feather fork, miner, hash rate, pool,
tipping point). Ordinary Italian left alone: "le coppie in gara", "chi
propone", "chi risponde", "chi muove per primo/secondo", "il cammino" of a
walk or a tree.

Three Italian lectures went just over 1,700 words with the new terms
(02 1,710, 03 1,714, 04 1,701); I shortened glosses and phrases (now 1,692,
1,697, 1,698). Three Italian phrases quoted by `check-game-theory-04.mjs`
were updated ("l'incumbent tiene 4", "(entrante, incumbent)", "il leader
guadagna 14").

### Other literal translations found (proposals; not changed)

No Italian source was found for these, so nothing was changed:

- "defezionatore" (module 01, "chi coopera contro un defezionatore"):
  proposal "contro chi defeziona".
- "cella stabile" is the course's own term (module 01), not a textbook one;
  it is defined as the equilibrium, so it can stay.
- "passata" (a sweep of the population, module 02): a coined term, fine as
  plain Italian.
- "sequenza" for a run of fictitious play (module 03): textbooks rarely name
  it; it can stay.

### Double-encoded text

None found (Ã, Â, â€, U+FFFD) in the folders the prompt lists.

### Checks after stage 0

check-game-theory-01 … 05 all passed (after the word-count fixes and the
three phrases in check-04). Browser: indexes 0/80, 0/76, 0/72; links
0/131; check-module 0/56 for each of the five modules; functional checks
0/32, 0/49, 0/39, 0/45, 0/39; regression compare 0/144; `npm run build`;
`check:dist` 0/108.

## Stage 1 — Module 06

### What was built

- Pure logic: `repeated.js` (F1 and F2), `collusion.js` (Panel A),
  `greenporter.js` (Panel B; Φ from module 05's `globalgame.js`, now a
  0.85 kB shared chunk), `chainstore.js` (Panel C), `minersdilemma.js` (the
  box). Self-check `scripts/lab/check-game-theory-06.mjs` (about 2 s).
- Figures: F1 `patience` (FigurePatience.jsx), F2 `folk` (FigureFolk.jsx).
- Panels: A CartelPanel, B WarsPanel, C ReputationPanel.
- Lectures EN 1,634 words and IT 1,686 (box not counted; boxes 275 and
  308), DRAFT marker, link to `/lab/cooperation`, the Bitcoin box after
  section 5.
- `texts.js` (three observe lists, six exercises), `index.js`, status
  "ready", `expect.json`, the functional check
  `browser-checks/modules/game-theory-repeated-games-reputation.mjs`.

### Differences from the spec

- **F2's Draw toggle.** F2 captures touch, so it follows the DrawToggle rule:
  mouse always, arrow keys when the plane has focus, touch only with "Move"
  on. `check-module.mjs` only tested canvases, so it now also tests elements
  marked `data-draw-surface` (no other module has one; the Network Lab
  module with a Draw toggle was rechecked, 0/62).
- **Blackwell (1965)** added to the reading list, as the source of the
  one-shot deviation principle.
- **Panel A's chart** spans the punishment-to-cartel band on its y axis
  instead of starting at 0; its table of thresholds has n in rows (it fits
  375 px without scrolling).
- **Panel C** opens on a weak incumbent (the prompt gave no default type).
  "New history" n uses seed n; "10,000 chains" uses seed 1.
- **Italian:** *one-shot deviation principle* and *trigger price* stay in
  English (no Italian name found; "il prezzo soglia" follows as a gloss).

### The "check" items

| Item | Result |
|---|---|
| One-shot deviation principle from dynamic programming | Confirmed (D. Ray, NYU notes: "originally formulated by David Blackwell (1965) in the context of dynamic programming"; needs continuity at infinity, which discounting gives). |
| Name of the folk theorem | Confirmed: known in the 1950s, unpublished (Sorin, Revue économique 2023; Wikipedia). Fudenberg–Maskin only call it "celebrated". No coiner is attested, and the text names none. |
| Friedman (1971) | Confirmed: RES 38(1), 1–12. Nash reversion confirmed through Fudenberg–Maskin (1986, p. 533). |
| Fudenberg and Maskin (1986) | Confirmed: Econometrica 54(3), 533–554. |
| Green and Porter (1984) | Confirmed from the paper's own words: unobserved output, demand shocks, "trigger price", reversions "without any firm defecting", "price wars". |
| Porter (1983) and the JEC | Citation and the 1880–1886 regime switches confirmed (IDEAS abstract). Grain from Chicago to New York confirmed through a secondary source (Mariuzzo and Walsh 2013), not Porter's text. "East coast" kept. |
| Selten (1978) | Citation confirmed. The 20 towns come from Wikipedia, not from Selten's text. |
| Kreps and Wilson; Milgrom and Roberts (1982) | Citations confirmed. |
| Kreps, Milgrom, Roberts and Wilson (1982) | Citation confirmed. The Tit for Tat type and "until near the end" come from secondary descriptions (Fudenberg–Maskin; Tadelis §17.1), not the paper. Softened: "if a player might be one who simply plays Tit for Tat". |
| Eyal and his reading of rare attacks | Confirmed from arXiv:1411.7099v2. The paper calls the game "an instance of the iterative prisoner's dilemma". On detection, a pool "might not be able to detect which of its registered miners are the perpetrators". On rare attacks: "such attacks are rarely reported … may indicate that the active pools have reached an implicit or explicit agreement not to attack one another". The box says "suggested … an unspoken agreement" and presents it as a hypothesis. The IEEE pages (89–103) were not checked. The paper gives no table for two pools of 0.25; the helper recomputed our numbers from Eyal's equations and they match. |
| Osborne | Confirmed: ch. 14 and 15 are the repeated games; the chain-store game is in ch. 7. |
| Tadelis | Confirmed, with one correction: ch. 10 is titled "Repeated Games" (§10.4 tacit collusion, §10.6 folk theorem); ch. 17 is "Building a Reputation". |

### Exercises: every answer recomputed

All six answers agree with yours. The self-check pins every number:

- Ex 1: 1/2, 2/3, 10, and 0 instead of 1.
- Ex 2: 9/17, 4/7, 1/2, 2/3; 2.586 = 22.5/8.7 and 9.899.
- Ex 3: the quadrilateral, area 20/3; 0.5, 0.4, 0.5.
- Ex 4: 0.0228, 0.5987; margin 0.938; 0.102; L = 3 (0.232; L = 2 gives
  −0.199).
- Ex 5: the first 13; 0.547; 0.0878; 66 against 40.
- Ex 6: 10; 43 and 186 against 100; 6.17.

### "Expected" values

All the prompt's expected values were reproduced. The simulation ranges
fell inside the prompt's limits. Where a few differ in the last digit:

- 100,000 rounds at Panel B's defaults, seeds 1–10: quiet share
  0.8943–0.9011 (prompt 0.894–0.903). Every seed is within 0.01 of 0.8979.
- 10,000 chains against a weak incumbent, seeds 1–10: entries
  6.1621–6.1856 (prompt 6.161–6.188), fights 0.8144–0.8379 (prompt
  0.812–0.839). The weak payoff is exactly 66 in every one of the 100,000
  chains.
- "Best rule": at the defaults p̄ = 3.85, L = 19, value 10.1208. At σ = 0.25
  it finds your rule, p̄ = 4.1, L = 25 (value 10.125000). At σ = 1 it finds
  p̄ = 3.45, L = 26, value 9.9616.
- The closed form q(δ) agrees with a bisection on the condition to
  2.1e-8, not 1e-12. Near δ = 0 the two roots of the condition meet (a
  double root at the Cournot output), so a bisection only reaches about √ε
  there. The check uses 1e-6 and says why.

### Self-check numbers (summary)

- F1: δ* = 1/3, 1/2, 2/3, 7/9.
- F2: the δ needed at the ten points as you gave them; weights as given; the
  sustainable shares on a 1,500 × 1,500 grid are 0.0000, 0.0232, 0.0752,
  0.3113, 0.6446, 0.8790, 0.9880, and the polygons the figure draws give
  the same shares.
- Panel A: all Cournot rows, held outputs and profits as given.
- Panel B: all margins, values and peace shares as given; the least δ is
  0.5294, 0.5294, 0.5384, 0.6405, 0.7505, 0.8335, 0.8934, 0.9389; a
  value-iteration check agrees with the closed forms.
- Panel C: all eleven cases as given; with N = 1 it is module 05's game.
- Box: all values as given; Eyal's closed form equals the fixed point of the
  payment equations; every block is paid to someone.

### Numbers behind "What to observe"

- Panel A: n = 2, δ = 0.5 gives 2.2941, 10.1211, share 0.997; δ = 0.3 gives
  2.5862, 9.8989, 0.799; with prices, 5.5 and 10.125 at 0.5 and nothing at
  0.49; n = 10 gives 0.6352, 1.6819, 0.747; and the table.
- Panel B: the defaults; samples no. 1, 2 and 4 have 3, 2 and 8 wars
  (quiet shares 0.925, 0.950, 0.800); the margins at L = 2 and 3; the best
  rule at σ = 0.5 and at σ = 1; at δ = 0.6 no rule works (least δ 0.6405).
- Panel C: D = 13, payoff 66, entries 6.1735, fights 0.8265. History no. 1
  shares at market 14; the tough incumbent fights at 14, 16, 18 and 20.
  10,000 chains give 6.1697 and 0.8303. Also t = 0 and 0.5, N = 5 and 50,
  w = −2 and −0.5.

### Timings in the browser (functional check, 1280 px)

- Panel A chart and readouts after a change of n: 5 ms.
- Panel B "New sample": 6 ms; "Best rule": 8 ms. Chart 2 is computed once
  when the chunk loads: 12 ms in Node.
- Panel C "10,000 chains": 7 ms.

### Figure heights

- F1: 383 px at 1280 EN, 403 IT; 445 at 375 px. Your guide was about 340 px.
  F1 was 442 before its SVG was narrowed; the rest is the two sliders, the
  readouts and the line about credibility.
- F2: 391 px at 1280 EN, 407 IT; 627 at 375 px, where the plane and the
  readouts stack.

### Chunk sizes

- Module 06: 78.9 kB.
- Shared `globalgame-….js`: 0.85 kB.
- The module also loads the shared `Slider`, `ui`, `charts` and
  `DrawToggle` chunks.

### Italian terms chosen for module 06 (in the status file's table)

- gioco ripetuto
- **gioco costituente** for the stage game (Treccani, Battigalli; Patrone;
  Chieti after Gibbons). It is better attested than "gioco componente".
- payoff medio
- *grim trigger*, strategia *trigger*
- soglia di pazienza
- *one-shot deviation principle*, kept in English (no Italian name found)
- *folk theorem*, kept in English (Patrone, Torre)
- ammissibile, individualmente razionale; payoff di minmax (Torre)
- lotteria pubblica
- collusione tacita; guerra dei prezzi (Unipd thesis, Patrone)
- monitoraggio imperfetto (one thesis heading; weak support)
- *trigger price*, glossed "il prezzo soglia" (no source for "prezzo soglia")
- falso allarme
- paradosso del *chain store*, glossed "della catena di negozi" (no Italian
  source found)
- reputazione; duro, debole
- *block withholding*; infiltrazione; il dilemma dei miner
- imbrogliare, chi imbroglia

## Checks on the final code (all 0 failures)

- check-game-theory-01 … 06: all passed.
- `npx vite build`.
- check-index: game-theory 0/80, network 0/76, complexity 0/72.
- check-links: 0/131.
- check-module, game-theory: 0/56 for modules 01–05, 0/60 for module 06.
- check-module, network reading-a-network: 0/62.
- Functional checks: 0/32, 0/49, 0/39, 0/45, 0/39, 0/41.
- Regression compare: 0/144.
- `npm run build`; `npm run check:dist`: 0/108.

## Open for Adriano

- Review the Italian of all six modules (the DRAFT markers stay).
- The proposals above: "defezionatore", and *one-shot deviation principle*
  and *trigger price* kept in English.
- F1 at 383 px is above the 340 px guide.
