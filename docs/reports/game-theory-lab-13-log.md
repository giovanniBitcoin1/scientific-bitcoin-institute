# Game Theory Lab 13 — working log

Prompt: `prompts.local/game-theory-lab-13.md` (module 13, `mining-as-a-game`;
stage 0: nothing to fix from module 12).

## Start

- 2026-11-26. Branch `game-theory-lab`, tree clean, HEAD cd67675 "Game Theory
  Lab 12: report". Status file: module 12 done, nothing in progress; report 12
  committed. Preconditions hold.
- Stage 0: nothing to do (the prompt's answers to report 12 accept what was
  built).
- Sources and Italian terms: looked up by two helper agents (web), results
  below under "Sources" and "Italian terms".

## Module 13: logic

- `selfish.js` (the chain, R, the closed-form stationary distribution and a
  numerical one, orphans), `race.js` (Panel A), `difficulty.js` (Panel B),
  `mdp.js` (Panel C), generator `scripts/lab/gen-game-theory-13-optimal.mjs`,
  self-check `scripts/lab/check-game-theory-13.mjs`.
- Every number of the prompt for the chain agrees with the code: R at the 18
  (α, γ) cells, the thresholds, p0 9/17, p0′ 2/17, p1 3/17, p2 3/34, G (0.82,
  0.788184, 13/17, 0.751783, 43/61, 0.634318), orphans (7.843/15.686,
  5.902/23.607, 3.723/21.098, 0/21.182), Panel B's six rows (before, after,
  first adjustment, break-even).
- My bug, found by the first test: Panel B's simulated path multiplied the
  rate of blocks found by 14/(days taken) after an adjustment instead of
  (days taken)/14. Fixed (run 1 ends at 3741 against 3771 expected, α 0.4,
  60 days).
- My bug: SM1 written as an MDP policy waited in the active state where she
  wins the race. Fixed (override when a > h, active). SM1 evaluated in the
  MDP then gives R up to truncation: 0.483233 at T = 40, 0.483685 at T = 80,
  against 0.483721 (a forced override at a = T publishes one block more than
  the lead needs).
- The MDP: the first version sent adopt's (1 − α) branch to (0, 1,
  relevant); Sapirshtein et al.'s Table 1 says irrelevant (helper agent,
  below). Changed, and all five γ regenerated; no value changed (match needs
  a ≥ h, impossible at (0, 1)). Match kept as "relevant and a ≥ h ≥ 1"
  (prompt); the paper says a ≥ h, the same, since a relevant state has
  h ≥ 1.
- Ties in the greedy policy go to SM1's action, and states the policy never
  reaches are dots in the maps: the first maps outlined exact ties (match and
  wait are equivalent at γ = 0) and unreachable states.
- Generator, one γ per command (final runs, after the change above):
  γ = 0 2.8 s, 1/4 3.8 s, 1/2 3.8 s, 3/4 5.6 s, 1 5.9 s. Each solve 0.04–1.1 s,
  20 bisection steps, 800–2,400 RVI iterations (τ = 0.95).
- Panel C against the prompt: every value agrees to the fifth decimal
  (γ = 0: 0.33705, 0.37075, 0.42590, 0.48824; γ = 1/2: 0.43018, 0.57251;
  γ = 3/4 at 0.3: 0.37942; γ = 1 at 0.3: 0.42857); honest optimal at 0.2 for
  γ ≤ 1/2 and at 0.3 for γ = 1/4; thresholds 0.3294 (γ = 0), 0.3192 (0.1),
  0.3 (1/4), 0.25 (1/2), 1/6 (3/4), 0 (1). γ = 1: α/(1 − α) within 3.4e-7 up
  to α = 0.4; 1.1e-6 below at 0.425 and 5.6e-5 below at 0.45 (truncation).
- Self-check, first full run (logic only): three FAILs, all my own limits:
  α = 0.49 with a lead cap of 400 is truncated by 1e-8 (now checked with
  1,500; the prompt's grid stops at 0.45); "γ = 1 within 1e-6 up to 0.425"
  too tight (now 0.4, and never above α/(1 − α)); the honest policy's map
  reaches (0, 1, relevant) through override's (1 − α) branch, as in the
  paper, which my test had not counted. Then 61 PASS, 11.4 s.
- Panel A, 1,000,000 blocks, run 1, ten (α, γ) pairs: largest deviation 2.05
  standard errors. α 0.4, γ 0: share 0.4843 ± 0.0013, orphans 5.89 and
  23.65, chain 70.46 (exact 0.4837, 5.90, 23.61, 70.49).
- Policy maps: at α = 0.35, γ = 0 the differences from SM1 are: wait instead
  of adopt one or two blocks behind (relevant (1,2), (2,3), (3,4), (4,5),
  (4,6), …; irrelevant (5,6), …) and, in the states reached only by that
  catching up, override at a lead of one with her block last (irrelevant
  (3,2), (4,3), …), where SM1 would wait. At α = 0.4, γ = 1/2 also: match
  where SM1 overrides or waits when an honest block arrives with her ahead
  (relevant (2,1), (3,1), (3,2), …), and wait in the active state where SM1
  publishes on winning the race.

## Sources

Looked up on 26 November 2026 by a helper agent (primary PDFs: arXiv,
Wayback copies where servers failed, Crossref, Bitcoin Core source).

- Narayanan et al., draft of 9 February 2016 (bitcoinbook.cs.princeton.edu):
  ch. 5 "Bitcoin Mining", 5.5 "Mining incentives and strategies". The four
  decisions and their defaults confirmed verbatim ("include any transaction
  which includes a transaction fee higher than some minimum"; "extend the
  longest known valid chain"; "the block that they heard about first";
  "announce it immediately"), "employed by the Bitcoin reference client".
- Kroll, Davey, Felten, WEIS 2013 (Washington, 11–12 June 2013): abstract
  "there is a Nash equilibrium in which all players behave consistently with
  Bitcoin's reference implementation, along with infinitely many equilibria
  in which they behave otherwise". Their model does not include withholding
  (Sapirshtein et al.: "a (weak, non-unique) Nash equilibrium, albeit under a
  simpler model that does not account for block withholding").
- Eyal and Sirer, FC 2014, LNCS 8437, 436–454: formula (8), threshold
  (Observation 1; "with γ = 1/2 the threshold is at 1/4"), "not
  incentive-compatible", states 0 and 0′. Confirmed (arXiv 1311.0243v5).
- Felten 2013: CORRECTED. The post is "Bitcoin isn't so broken after all",
  Freedom to Tinker, 7 November 2013 (no post "Game theory and Bitcoin"). Its
  argument: a coalition of selfish miners is not stable, since members gain
  by "fair-weather mining" ("ES-miners can't agree to cheat, because it's too
  easy for them to cheat on that agreement"). Not the dominance argument the
  prompt gives; the lecture gives Felten's argument, and the remark that a
  profitable deviation for a large miner is not a dominant strategy is ours.
- Grunspan and Pérez-Marco, arXiv:1805.08281 (v3 January 2019): no journal
  version found (a summary "On profitability of block withholding
  strategies", SIGMETRICS PER 46(3), 2019). Abstract: "no strategy is more
  profitable than the honest strategy before a difficulty adjustment. So
  selfish mining can only become profitable afterwards, thus it is an attack
  on the difficulty adjustment algorithm." Confirmed; cited as the preprint.
- Difficulty: Bitcoin Core `nPowTargetTimespan` two weeks, spacing 10 min,
  2016 blocks; factor clamped between 1/4 and 4. Nakamoto 2008: §4
  Proof-of-Work ("moving average targeting an average number of blocks per
  hour"), §6 Incentive, §11 Calculations. Confirmed.
- Sapirshtein, Sompolinsky, Zohar, FC 2016, LNCS 9603 (2017), 515–532:
  Table 1 transcribed (adopt to (0, 1, irrelevant); override a > h; match
  relevant, a ≥ h; wait); ratio objective by w_ρ = (1 − ρ)x − ρy and binary
  search on ρ (Algorithm 1), relative value iteration. Table 2 (γ = 0 only,
  T = 95, ε = 1e-5), optimum (upper bound): 1/3 0.33705 (0.33707), 0.35
  0.37077 (0.37079), 0.375 0.42600 (0.42604), 0.4 0.48866 (0.48904), 0.425
  0.56808 (0.57226), 0.45 0.66891 (0.70109), 0.475 0.80172 (0.90476).
  Figure 2 (thresholds, γ from 0 to about 0.24): about 0.329 at γ = 0, read
  from the plot; the curves merge near γ ≈ 0.2, caption: "Thresholds at
  higher γ values match that of SM1"; §5.4 gives 0.25 at γ = 1/2. So our
  equal thresholds at 1/4 and 1/2 agree with the paper. Delays: "the profit
  threshold vanishes, and even small attackers have incentive to occasionally
  deviate" (Claim 7, a proof sketch). Footnote 3 (on SM1's threshold): "This
  can partly explain why selfish mining attacks have not been observed". The
  optimal policies "counter the claim that the longest-chain rule forms a
  Nash equilibrium".
- Nayak, Kumar, Miller, Shi, IEEE EuroS&P 2016, 305–320: confirmed.
- Stale blocks: Gervais et al., CCS 2016, Table 1: Bitcoin stale rate 0.41%
  over the last 10,000 blocks of a crawl of February 2016. Decker and
  Wattenhofer, IEEE P2P 2013: fork rate 1.69% over blocks 180,000–190,000
  (2012).

## Italian terms

Looked up on 26 November 2026 by a helper agent.

- *selfish mining*: kept (UniBo thesis "Simulazione di attacchi di sicurezza
  su tecnologie blockchain", §6.1 "Selfish mining"); "mining egoistico" only
  on Spanish pages.
- implementazione di riferimento: no Italian source; kept (transparent).
- catena più lunga: Italian whitepaper (bitcoin.org, bitcoin_it.pdf).
- blocco orfano: it.wikipedia "Bitcoin" ("I blocchi orfani"), CoinDesk Italia;
  the UniBo thesis keeps "stale block". Kept "blocco orfano", as module 04,
  with *stale* once.
- vantaggio privato: no source; UniBo thesis "in vantaggio di due blocchi
  rispetto alla catena principale". Chosen: "catena privata" and "vantaggio"
  (di k blocchi).
- gara: Italian whitepaper ("La gara tra la catena onesta e la catena di un
  utente malintenzionato").
- catena di Markov, distribuzione stazionaria: it.wikipedia "Catena di Markov".
- quota dei blocchi: no source for any form; chosen as the most transparent.
- soglia di profittabilità or di redditività: no source for either as a
  term; Treccani marks "profittabilità" as modelled on the English,
  "redditività" is the established word. Chosen: "soglia di redditività".
- aggiustamento della difficoltà: Bitcoin.com IT ("aggiustamento"), Bitpanda
  ("adeguamento"), "regolazione" in a machine-translated title. Kept
  "aggiustamento", as module 02.
- processo decisionale di Markov: it.wikipedia, PoliMi thesis (Petretti
  2013). politica ottima: Petretti, UniMi slides ("politica ottimale" also
  found). *value iteration*: Italian sources keep the English (Petretti
  §2.3.1, UniMi slides); "iterazione dei valori" not found: kept in English.
  troncamento: ordinary Italian.
- adopt, override, match, wait: no Italian source translates them; kept in
  English with glosses.
- The Italian *miner* is masculine in modules 02–12 ("il miner", "un pool"):
  the first Italian draft had "una miner" and "lei"; changed to the masculine.

## Module 13: page

- Lectures: EN 1,752 words, IT 1,748 (before `<!-- simulation -->`; no box).
- Felten's argument (coalition instability, "fair-weather mining") replaces
  the prompt's dominance wording; the remark that a profitable deviation is
  not a dominant strategy is ours. Grunspan and Pérez-Marco: my draft said
  "proved", changed to "showed" (their abstract: "we discover"). The "why
  not seen" section quotes Gervais et al.'s
  0.41% (February 2016).
- `check-game-theory-13.mjs` with the "quoted on the page" part, first run:
  2 FAILs, both mine: the helper `itn` turns "0,705" back into "0.705" (it
  reads three decimals as thousands), so that phrase is written out; exercise
  3's Italian phrase needed "e" for "and". Then all PASS.
- `npx vite build`: OK. `check-module.mjs game-theory mining-as-a-game`:
  0 failures of 56; figure heights 390 and 368 px at 1280 (EN), 390 and 388
  (IT); at 375 px 673 and 509 (EN), 673 and 525 (IT).
- Screenshots (`shots.mjs`): F1's "α = 1/3" button read "A = 1/3" (the pills
  are uppercased, and a capital alpha looks like A): `normal-case` added.
  Panel C's chart on 0–1 squeezed the curves: y from 0.1 to the column's
  top; the 0.45 tick label was clipped: ticks to 0.4.
- Functional check `modules/game-theory-mining-as-a-game.mjs`: 0 failures
  of 32 at the first run.

## Checks (final code, before the squash)

All in the foreground, one command at a time.

- `npx vite build`: OK; module chunk 75.0 kB (25.0 kB gzip).
- Generator, one γ per command: 0 3.1 s, 1/4 4.0 s, 1/2 4.2 s, 3/4 6.4 s,
  1 6.3 s; `optimal.json` unchanged (git status clean).
- `check-game-theory-01` … `13`: all passed. Times: 01 15.5 s, 02 25.0 s,
  03 77.5 s, 04 7.7 s, 05 2.4 s, 06 0.9 s, 07 0.9 s, 08 1.3 s, 09 0.4 s,
  10 0.9 s, 11 17.2 s, 12 25.1 s, 13 12.2 s (106 PASS).
- `check-index.mjs game-theory` 0 of 80; `network` 0 of 76; `complexity` 0
  of 72; `check-links.mjs` 0 of 131.
- `check-module.mjs game-theory <slug>` and the functional check, one module
  per command: what-is-a-game 0/56, 0/32; nash-equilibrium 0/56, 0/49;
  mixed-strategies-zero-sum 0/56, 0/39; sequential-games-commitment 0/56,
  0/45; incomplete-information-signalling 0/56, 0/39;
  repeated-games-reputation 0/60, 0/41; evolution-and-learning 0/68, 0/41;
  congestion-price-of-anarchy 0/56, 0/43; games-on-networks 0/60, 0/42;
  coalitions-sharing 0/60, 0/36; auctions 0/60, 0/29; mechanism-design
  0/56, 0/29; mining-as-a-game 0/56, 0/32.
- Timings of module 13 in headless Chrome (to the updated DOM; second
  frame): Panel A 1,000,000 blocks 69 ms (73); a change of α at 1,000,000
  64 ms (69); "Run again" 62 ms (66); Panel B, 90 days, a change of α 7 ms
  (13); "Another path" 4 ms (15); Panel C, a change of γ 4 ms (12).
- `build-main.mjs` then `compare-main.mjs`: 0 failures of 144.
- `npm run build`: OK (validate, vite build, post-build: 9 static pages, 3
  redirect stubs, feed, sitemap). `npm run check:dist`: 0 failures of 108.
