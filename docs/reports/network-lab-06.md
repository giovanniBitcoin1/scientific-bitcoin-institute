# Network Lab, prompt 6 — Module 06 "Growth mechanisms"

Branch `network-lab`, local commits only, nothing pushed. Preconditions held at
the start: modules 01–05 done, nothing in progress, and
`docs/reports/network-lab-05b.md` committed. Module 06 was built in five WIP
checkpoints, then squashed into one commit.

## Commits

- `b5bacaa` Network Lab 06: Growth mechanisms
- this report: Network Lab 06: report

## What was built

- `src/components/lab/network/growth-mechanisms/`:
  - `growth.js`: a Fenwick sampler; growth with kernel (k + A)^α that tracks
    the leader; link selection; copying, directed; random walk; FKP
    optimisation; the exact distributions of the offset, uniform and Price
    models.
  - `kernel.js`: two snapshots, Π(k), two cumulative fits, and maximum
    likelihood conditional on the first snapshot.
  - `experiments.js`: the jobs of the three panels.
  - `figures.js`: the logic of F1 and F2.
  - Components: F1 `FigureRich.jsx`, F2 `FigureSnapshots.jsx`; panel A
    `HistoryPanel.jsx`, panel B `MechanismPanel.jsx`, panel C
    `KernelPanel.jsx`.
  - `texts.js` and `index.js`.
- Lectures in `src/content/network-lab/growth-mechanisms.{en,it}.md`: 1,690
  and 1,699 words, counted with markup up to `<!-- simulation -->`. The
  DRAFT marker is on, and there is no Bitcoin box.
- `scripts/lab/check-network-06.mjs`. It runs in about 10 s and has ten
  sections: sampler, exact, meanfield, nonlinear, copying, local,
  optimisation, kernel, exercises, page.
- Functional browser check
  `scripts/lab/browser-checks/modules/network-growth-mechanisms.mjs`.
- Other files touched: the `expect.json` entry, the README, `status: "ready"`
  in `network-modules.json`, and the status file.
- Chunks: module 06 imports module 05's `fit.js` for the tail of the copying
  model. Vite puts the shared code in a chunk of its own, loaded only when the
  lab is unlocked. Nothing touches the Complexity Lab chunk. I reran every
  check of module 05 and the regression compare against main; all pass.

## Differences from the spec

- **Optimisation.** The root sits at the centre of the square: I read "the
  first node is the centre" that way, and it reproduces your ~700 links at
  δ = 4. A root at a random point gave 242. With the root at the centre the
  star lasts up to δ ≈ √2, since every node is within √2/2 of it. FKP's
  1/√2 is the bound for any root, and the lecture says so.
- **Random walk.** A fresh walk starts from a random node for every link, as
  the implementation notes ask. Saramäki and Kaski keep walking until m
  endpoints are marked, and Vázquez links to the nodes along the walk. The
  lecture says the panel uses the simplest version.
- **Copying.**
  - The kernel is measured on total degree q + m. At p = 0.5, a = m, so the
    rate q + a is exactly linear in that degree.
  - "Share linked" counts distinct nodes: repeated links could push it above
    100%.
  - At p = 0 the model is degenerate: no new node is ever linked, and the
    recipe gives no fit. The panel shows "–".
- **Panel A's mean-field line** is (m + A)(t/t_i)^(1/(2 + A/m)) − A. It equals
  the prompt's m (t/t_i)^β when A = 0, and with an offset it is the correct
  line.
- **Panel C shows two cumulative fits beside maximum likelihood:**
  - from the smallest degree up to the largest degree held by at least 10
    nodes;
  - over every class.

  The note under the readouts explains why they differ.
- **No estimate.** When nearly every link goes to one hub (the FKP star,
  α = 2), the likelihood has no maximum. The estimate is then "–", and the
  20-network table counts only the networks that have one.
- **F2** groups the degree classes as 2, 3, 4–5, 6–9 and 10+, to keep the
  figure under 340 px.
- **Uppercase.** Eyebrows and pills are uppercase, which turned "P(K ≥ k)" into
  "P(K ≥ K)" and δ into Δ. The math now sits in y-axis labels, and Panel C's
  source pills are not uppercased.

## "Check" figures in the lecture

A research agent read the primary sources (arXiv, author PDFs) where it could.

- **Confirmed and quoted:**
  - Price (1965): "the number of papers cited appears to decrease as n^−2.5
    or n^−3". The lecture says he gave the two without choosing.
  - Price (1976): the citations + constant model and the exponent.
  - Dorogovtsev–Mendes–Samukhin: γ = 2 + A(0)/m in their directed notation,
    which is 3 + A/m in ours.
  - Krapivsky–Redner–Leyvraz: below 1, a stretched exponential. Above 1, one
    site linked to almost every other. Above 2, all but a finite number of
    sites link to it.
  - Jeong–Néda–Barabási (2003): citations 0.95, Internet 1.05, actors 0.81,
    neuroscience co-authorship 0.79. There is no Medline value in that
    paper.
  - Newman (2001): Medline 1.04 ± 0.04, physics 0.89. The arXiv text prints
    "± 0.98", probably a typo, so the lecture gives no error bar.
  - Newman (2009): 2,407 papers; 101 citations on average for the first tenth,
    26 for the second, 0.08 for the most recent; "very similar to that
    predicted by the model".
  - MusicLab: 14,341 participants, 48 songs, eight influence worlds plus one
    independent world. The lecture says "about 14,000".
- **Softened or reworded:**
  - FKP: they proved the star below 1/√2 and an exponential tail for δ of
    order √N. In between they proved only a heavy-tail lower bound and called
    it a power law. Berger et al. (2003) showed that in that regime almost
    all nodes are leaves, many hubs share the top, and a power law can hold
    at best for a vanishing fraction of the nodes. The lecture says this; the
    prompt's "broad degree distribution" alone would have been misleading.
  - "Collaboration networks somewhat sublinear" became the measured numbers,
    with Newman's 1.04 for biomedicine shown as near-linear.
- **References.**
  - Latora et al. ch. 6 is "Models of growing graphs": correct.
  - Kumar et al. (2000): the FOCS title appears both as "Stochastic models
    for the Web graph" and as "Random graph models for the web graph". The
    prompt's title is kept.
  - Vázquez et al. (2003) ComPlexUs and Pastor-Satorras et al. (2003) were
    confirmed only from bibliographic records.
  - D'Souza et al. (2007): bibliography and abstract confirmed. It is listed
    in Further reading but not described in the lecture.

## The "expected" values

The values below come from my runs. Where they differ from yours, the reason
is given.

| Check | Expected | Obtained | |
|---|---|---|---|
| Sampler, 10⁶ draws | within 1% | largest deviation 0.71% | holds |
| Offset A = 0, 2, −1: p_2…p_5 | your values ± 0.005 | exact values agree to 4 decimals; N = 50,000 largest gap 0.0025 (A = 0, k = 3) | holds |
| Uniform p_2…p_4 | 0.3333 0.2222 0.1481 | 0.3332 0.2216 0.1489 | holds |
| Mean field, node 100 | 22.0, sd ≈ 13 | **19.07, sd 11.98** | differs, within noise (see below) |
| Mean field, nodes 1,000 and 5,000 | 6.0, 2.7 | 6.32, 2.93 (against 6.32, 2.83) | holds |
| Nonlinear, α = 0.5 | < 0.5% | largest 0.35% | holds |
| Nonlinear, α = 1 median | 1–3% | 2.03% | holds |
| Nonlinear, α = 1.5 median | > 90% | 97.2% | holds |
| Nonlinear, α = 2 | ≥ 99% in 9 of 10 | 10 of 10 | holds |
| Copying p = 0.5, q = 0…3 | 0.5 0.2 0.1 0.0571 | 0.5003 0.2004 0.0999 0.0567; largest gap over q = 0…7 is 0.0005 | holds |
| Copying p = 0.8 | 0.3846 0.2198 0.1319 0.0824 | 0.3852 0.2190 0.1312 0.0828; largest gap 0.0008 | holds |
| Link selection, kernel | within 0.05 of 1 | 1.006 ± 0.010 | holds |
| FKP star at δ = 0.5, 0.7 | exact | exact | holds |
| FKP δ = 4, root degree | ≈ 700 | 759 | close |
| FKP δ = 10, largest | ≈ 140 | **166** | differs a little |
| FKP δ = 1,000, largest | ≈ 11 | **15** | differs a little |
| ML, α = 1 and 1.5 (20 networks) | within 0.03 | 1.003 and 1.473 | holds |
| ML bias at α = 0.5 | ≈ −0.02 | **−0.012** | smaller |
| Cumulative slope at α = 1 | ≈ 0.9 | **0.989** up to the last class of 10 nodes; **0.617** over every class | differs: depends on the range |

- **Mean field, node 100.** The node's mean over 100 networks has a standard
  error of about 1.2. Nine other sets of 100 networks give means of 18.13 to
  22.83, so your 22.0 and my 19.07 are both draws from that spread. The
  15% check passes for the panel's seed set; the lecture says "about 19" and
  "about 12", and pins them.
- **FKP.** Positions are random, so the largest degree varies from map to map.
  The check only requires the star and a falling largest degree from δ = 4 to
  1,000: 759 ≥ 166 ≥ 18 ≥ 15.
- **Cumulative slope.** Neither of my ranges gives your 0.90 at α = 1. A cap at
  k = 50 gives 0.92, so I believe your fit stopped somewhere in between. As
  the prompt says, the lecture states that the bias depends on where the sum
  starts and on the range fitted, and gives the two numbers. It does not
  claim the published measurements are wrong.

## Exercise answers

Your answers are confirmed exactly for exercises 1 to 3:

- Ex. 1: 20; 250,000 nodes; 1%, the first hundred.
- Ex. 2: 0.0545 and 0.000594; mean field 0.04 and 0.0004, low by 1.36 and 1.49,
  tending to 1.5; A = −1 and A = 2.
- Ex. 3: 0.007, 0.048, 0.26, 0.71.

The rest:

- **Ex. 4.** Theory gives 2.25, 3 and 6, as yours does. Maximum likelihood
  above q = 10 on 100,000 nodes gives 2.68 at p = 0.5 and 3.80 at p = 0.8,
  against your 2.66 and 3.75. In the panel (20,000 nodes) the module-05
  recipe gives 2.65 ± 0.05 from q = 8 and 3.89 ± 0.13 from q = 11. The
  solution explains the gap: the local slope is about α q/(q + a).
- **Ex. 5**, from Panel A over 20 runs:
  - α = 1: biggest hub among the first ten in 18 runs; median share 3.6%
    (2.3–5.3%).
  - α = 1.5: 20 runs; 83.6% (61.1–91.5%).
  - α = 0.5: 19 runs; 0.8% (0.6–1.0%).
- **Ex. 6**, with N1 = 5,000, ΔN = 2,000 and 20 networks (you used five):
  - Maximum likelihood: 0.49, 1.00 and 1.47; yours 0.48, 1.00, 1.49.
  - Cumulative up to the last class of 10 nodes: 0.60, 0.99 and 1.33 (spread
    0.33). Over every class: 0.48, 0.62 and 0.44. Yours: 0.46, 0.90, 0.92.
  - A standard error of 0.05 at α = 1 needs about 170 new nodes. The mean
    standard error is 0.066 at ΔN = 100 and 0.051 at ΔN = 170 (checked).

## Numbers behind each "What to observe"

All are from the default seeds and pinned by `check-network-06.mjs`.

**Panel A** (α = 1, m = 2, N = 5,000)
1. Run 1: the hub is node 1, with 210 links, 4.2% of the network.
2. The leader is fixed from a size of 75 nodes.
3. Twenty runs:
   - biggest hub among the first ten in 18 of 20; median the 2nd node; range
     1st to 12th;
   - share 3.6% (2.3–5.3%);
   - the leader at N/10 is the final leader in 16 of 20.
4. N = 20,000: median share 1.8%, and still 18 of 20.
5. α = 1.5: 83.6% (61.1–91.5%), 20 of 20, same leader 20 of 20.
6. α = 0.5:
   - median share 0.8%; largest degree 38 in run 1;
   - 19 of 20 hubs among the first ten;
   - run 1's leader is settled only at 4,500 nodes;
   - same leader 14 of 20.
7. A = 3: largest degree 82; slope −3.5.

**Panel B** (N = 20,000; optimisation 5,000)
1. Preferential attachment: largest degree 347, ⟨k²⟩/⟨k⟩ 14.9, kernel
   1.00 ± 0.01. Uniform: 28, 5.5, 0.03 ± 0.02.
2. Link selection: 405, 15.7, 1.01 ± 0.01.
3. Copying:
   - p = 0.5: kernel 1.02 ± 0.01; the recipe gives 2.65 ± 0.05 from q = 8.
   - p = 0.8: 3.89 ± 0.13 from q = 11.
   - p = 0.2: 2.18 against 2.25; the hub is linked from 18.0% of the nodes.
4. Random walk:
   - ℓ = 1: kernel 1.25; the hub is linked to 25.3% of the network (5,052
     links).
   - ℓ = 2, 3 and 6: 0.85, 1.08 and 0.96.
   - ℓ = 0: largest degree 29.
5. Optimisation:
   - δ = 1: a star.
   - δ = 2: the root takes 82% of the nodes.
   - δ = 4: 21.8% (1,092 links).
   - δ = 10: largest degree 211.
   - δ = 100: 19. δ = 1,000: 11, with ⟨k²⟩/⟨k⟩ 2.99.
6. Kernel exponents: one-step walk 1.25, optimisation at δ = 10 1.38.

**Panel C** (α = 1, N1 = 5,000, ΔN = 1,000)
1. 1,919 links from new nodes to old ones.
2. Cumulative 0.97 (up to k = 21); every class 0.58 (up to 210); maximum
   likelihood 0.99 ± 0.02.
3. Twenty networks: cumulative 0.99 ± 0.04; every class 0.62 ± 0.05; maximum
   likelihood 1.01 ± 0.02 (0.97 … 1.04).
4. α = 0.5: maximum likelihood 0.51 ± 0.04, cumulative 0.61 ± 0.03. α = 0:
   cumulative 0.27, maximum likelihood 0.01.
5. α = 1.5: maximum likelihood 1.46 ± 0.02; cumulative 1.35 ± 0.46.
6. Maximum likelihood by source: link selection 1.00 ± 0.02, copying
   0.99 ± 0.02, walk 1.28 ± 0.02, optimisation 1.40 ± 0.02. Standard error
   0.07, 0.02 and 0.01 with ΔN = 100, 1,000 and 5,000.

**Lecture:** figure shares 4.8%, 26% and 71%; 84% at α = 1.5; cumulative 0.99
and 0.62; maximum likelihood 1.01 ± 0.02; one-step walk 1.25 and "a quarter";
18 and 16 of 20; node 100 about 19 ± 12.

**Findings worth noting:**
- A one-step random walk is superlinear. It reaches nodes through their
  neighbours, and a hub surrounded by low-degree nodes is over-visited.
- The optimisation model measures an effective kernel above 1.

## Timings in the browser (headless Chrome, 1280 px)

- "Rerun 20 times" at N = 20,000: 0.3–0.4 s.
- Panel B's optimisation model at N = 5,000: 0.12 s from click to readout.
- On page load: Panel A (5,000 nodes), Panel B (linear, 20,000) and Panel C
  (6,000). Each is well under 2 s; the functional check sees all three
  readouts at load.

## Italian terms

| English | Italian |
|---|---|
| preferential attachment | aggancio preferenziale (as module 05) |
| initial attractiveness | attrattività iniziale |
| attachment kernel | kernel di aggancio |
| mean field | campo medio |
| first-mover advantage | vantaggio del primo arrivato |
| winner takes all | il vincitore prende tutto |
| stretched exponential | esponenziale stirata |
| link selection | selezione di un collegamento |
| copying model | modello di copia ("copia" in the panel) |
| random walk | passeggiata aleatoria |
| snapshot | istantanea |

## Check results

All on the final tree:

- `npx vite build`: succeeds.
- `check-network-01` to `-06`: all pass.
- Browser checks, each 0 failures:

  | Check | Passed |
  |---|---|
  | `check-index network` | 72 |
  | `check-index complexity` | 64 |
  | `check-links` | 80 |
  | `check-module`, modules 01 / 02 / 03 / 04 / 05 / 06 | 62 / 62 / 56 / 60 / 58 / 60 |
  | module scripts 01 / 02 / 03 / 04 / 05 / 06 | 25 / 29 / 40 / 50 / 58 / 26 |
  | `build-main` + `compare-main` | 144 |

- The first full browser run was stopped by Claude Code for low system memory,
  not by a failure. The remaining checks were then run one at a time.
