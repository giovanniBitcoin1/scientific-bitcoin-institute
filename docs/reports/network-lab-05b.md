# Network Lab, prompt 5b — fixes to modules 04 and 05

Branch `network-lab`, local commits only, nothing pushed. Before starting the
status file showed module 05 as done with nothing in progress, the last commit
was "Network Lab 05: report", and the working tree was clean.

## Commits

- `87f598e` Network Lab 04: fixes
- `e8356a0` Network Lab 05: fixes
- this report: Network Lab 05b: report

The new working rule ("a check that fails is information …") is in "Working
rules" in `docs/network-lab-status.md`.

## Stage A — module 04

### A1. A generator of its own for the removal orders

`weakties.js` has a new `orderRandom(seed, orderId)`: a mulberry32 seeded from
the network's seed and the order's index, and nothing else. `weakSample` gives
each order its own one. The generator of the strengths
(`mulberry32(seed ^ 0x7f4a7c15)`) is untouched and is now used only by
`strengths()`. Weakest first and strongest first sort by strength, which is
continuous, so the tie-breaking shuffle cannot change them: their curves are
the same as before (all of your expected values for them came out exactly).
At random, lowest overlap first and highest overlap first are now identical,
point by point, with the switch on and off, in both quantities (largest piece
and other pieces), and so are their removal orders in the drawn network, link
for link. Both are self-checks.

### A2. 300 networks

`WEAK_RUNS` = 300, `WEAK_SEED` = 2026. The run is still progressive
(`useExperiment`, 12 ms of work per frame). In headless Chrome, at 1280 px:
first curves 0.4 s after the start of navigation, all 300 networks done at
2.1 s; after turning the switch off, the new run of 300 takes about 1.5 s. In
Node, the two runs (on and off) take 1.4 s together.

### A3. Your expected values

All of them hold, none differs:

| | expected | obtained |
|---|---|---|
| on, weakest first, f = 0.03 / 0.04 / 0.05 / 0.06 / 0.08 / 0.1 | 0.998 0.974 0.779 0.413 0.145 0.129 | 0.998 0.974 0.779 0.413 0.145 0.129 |
| on, weakest first, below one half from | 0.06 | 0.06 |
| on, strongest first, f = 0.5 / 0.8 / 0.9 | 0.996 0.848 0.455 | 0.996 0.848 0.455 |
| on, strongest first, below one half from | 0.90 | 0.90 |
| at the share of between-group links, weakest / strongest | 0.600 1.000 | 0.600 1.000 |
| off, weakest first, f = 0.8 / 0.85 / 0.9 | 0.812 0.486 0.148 | 0.812 0.486 0.148 |
| off, strongest first, f = 0.8 / 0.85 / 0.9 | 0.823 0.508 0.151 | 0.823 0.508 0.151 |
| off, largest gap weakest–strongest, seed 2026 | 0.026 | 0.026 |
| off, same gap, ten other seeds | 0.010 to 0.022 | 0.010 to 0.022 |

The two new checks:

- Switch off, the largest gap at any fraction among weakest first, strongest
  first and at random (the eleven gaps; the gap between weakest and strongest
  alone in brackets):

  | seed | three curves | weakest–strongest |
  |---|---|---|
  | 2026 (the panel's) | 0.035 (at f = 0.84) | 0.026 |
  | 2027 | 0.016 (0.89) | 0.016 |
  | 2028 | 0.021 (0.87) | 0.021 |
  | 2029 | 0.017 (0.78) | 0.017 |
  | 2030 | 0.017 (0.82) | 0.015 |
  | 2031 | 0.011 (0.82) | 0.011 |
  | 2032 | 0.023 (0.84) | 0.022 |
  | 2033 | 0.020 (0.82) | 0.017 |
  | 2034 | 0.029 (0.85) | 0.010 |
  | 2035 | 0.019 (0.79) | 0.019 |
  | 2036 | 0.029 (0.82) | 0.014 |

  All within 0.05; the limit was not changed.
- At random, lowest overlap first, highest overlap first: the same with the
  switch on and off, point by point. Pass.

The old checks on the gap (30 and 120 networks) are gone.

### A4. The numbers behind the seven points of Panel B

1. First network: 1,264 links, 73 between groups (6%). Switch on, weakest
   first: 0.998, 0.974, 0.779, 0.413, 0.145 at f = 0.03, 0.04, 0.05, 0.06,
   0.08, and 0.129 at f = 0.1: a little more than one group out of eight
   (0.125). The old text said "still 1.00 at f = 0.04". That is no longer
   true (0.974).
2. Strongest first: 0.996 at f = 0.5, 0.848 at 0.8, 0.455 at 0.9. The other
   pieces never average two nodes (at most 1.57).
3. At random: 0.822 at f = 0.8, below one half from f = 0.86. Strongest first
   against at random: below it up to f = 0.78, at most 0.028 below (f = 0.71;
   0.948 against 0.975 at f = 0.7). The curves cross between 0.78 and 0.79
   (−0.008, then +0.006). After that strongest first is ahead: 0.848 against
   0.822 at 0.8, 0.339 ahead at f = 0.88, and one half at 0.90 against 0.86.
   The text now says so and no longer calls strongest first "kinder" without
   qualification. Two tiny exceptions, both pinned in a comment of the check:
   at f = 0.28 strongest first is ahead by 1/60,000 (one node in one of the 300
   networks), and at f = 0.99 at random is ahead again by 0.0008. Neither shows
   in the table's three decimals. The check therefore reads "below to three
   decimals up to 0.78, above from 0.79 to 0.95".
4. Lowest overlap first: 0.578 at f = 0.05, 0.229 at 0.06.
5. Other pieces at their peak: 25.7 nodes (weakest first, f = 0.07) and 26.0
   (lowest overlap first, f = 0.06). "About 26" still holds.
6. Switch off: at random, lowest overlap first and highest overlap first do not
   move at all (lowest overlap first still 0.229 at f = 0.06). Weakest first
   and strongest first fall onto random removal: 0.812, 0.823 and 0.822 at
   f = 0.8. The largest gap among the three is 0.035 (at f = 0.84).
7. Overlap by tenth of strength: 0.05 to 0.48 on; 0.26 to 0.29 off
   (unchanged, because the strengths did not change). Correlation 0.973.

Exercise 5 (EN and IT) was rewritten from these numbers. "The noise of an
average over 30 networks" became: the two curves are never more than 0.026
apart, which is what is left of chance in an average over 300 networks, and
ten other sets of 300 give 0.010 to 0.022. The lecture sentence ("below half
when 6% of the links are gone … holds until 90%") still holds and was not
changed. All the Panel B figures in texts.js now use three decimals, as in the
panel's table. The panel's comment says 300 networks; the table heading reads
`WEAK_RUNS` and needed no change.

The "quoted on the page" checks for Panel B were rewritten to match, and so was
the browser check of the module. It now reads the new values (on: 0.974,
0.413, 0.229, 0.129, 0.455, 0.160, 0.848 against 0.822; off: 0.812, 0.823,
0.822, 0.486, 0.508, 0.229). It also compares the rows of the three unmoved
orders at six fractions with the switch on and off, and prints the timing.

### A5. Panel C, point 5

Among random networks 1 to 20 no |z| is above 3. The largest is 2.33, in
network 7. Point 5 (EN and IT) now says "none has any |z| above 3 (the largest
is 2.3, in network 7)", and that is pinned.

### A6. Panel C, point 4

Added after the chain figures (EN and IT): "but that is the same fact once
more, as in point 2: each missing feed-forward loop leaves one chain open and
each missing cycle three, and 14.8 + 3 × 2.3 ≈ 21.8". Pinned: the excess of
chains, 461 − 439.2 = 21.81, equals the missing loops plus three times the
missing cycles to 1e-9 (21.80 is the same number rounded the other way). This
follows from the invariant the check already tests (chains + feed-forward
loops + 3 × cycles is fixed by the degrees when there are no mutual links).

## Stage B — module 05

For the report, as you asked: for the configuration model the number of
self-links is close to a Poisson variable with mean λ/2 and the number of
double links close to one with mean λ²/4, where λ = (⟨k²⟩ − ⟨k⟩)/⟨k⟩. /4 is
kept everywhere.

The verdict rule (less than a factor of ten in k) and Exercise 6 for the
lognormal were kept as they are. The status file records both as kept after
review.

### B1. The box "Two things called a power law"

EN: "Both papers are listed under "Further reading" below, and more of the
institute's work is on our [Publications page](/research/publications)." IT:
"Entrambi gli articoli sono elencati più sotto, in «Letture consigliate», e
altri lavori dell'istituto sono nella nostra [pagina delle
pubblicazioni](/research/publications)." The Italian heading of the section is
«Letture consigliate», so the sentence uses it. `Publications.jsx` was not
touched.

### B2. Exercise 6, sample 1

The tail (k ≥ 10, 1,968 values) runs from 10 to 8,713. That is 2.94 decades,
so "nearly three decades" was literally true for this sample, but only because
of its largest value. The next largest are 3,275 and 2,276, and
10 × 1,968^(1/1.6) = 1,145. Without the top value the span is 2.52 decades.
The solution now says (EN and IT): "The tail runs from 10 to 8,713, nearly
three decades, but only because of its largest value: the next are 3,275 and
2,276, and the largest of so many values is typically near
10 × 1,968^(1/1.6) ≈ 1,100, two decades from the start." Pinned: the three
values, the 1,100, and a check that the span is above 2.9 decades with the
largest value and below 2.6 without it. The old check ("spans nearly three
decades") was replaced by this one.

### B3. p = 0.00

- Panel C, step 3 readout: when no synthetic set fitted worse, it shows
  "p-value: < 0.005 (none of the 200 synthetic sets fitted worse)". The limit
  is 1/sets, so 1,000 sets give "< 0.001". IT: "< 0,005 (nessuno dei 200
  insiemi sintetici si adatta peggio)".
- The verdict line: "Power law ruled out (p < 0.005: none of the 200
  synthetic sets fitted worse than the data)." The verdict templates now take
  the whole p clause, so the other verdicts still read "(p = 0.73)" and so on.
- A non-zero p below 0.01 gets three decimals. With 500 or 1,000 sets, one
  worse set (0.002, 0.001) used to round to 0.00.
- Exercise 6, sample 3 (EN and IT): "p < 0.005: none of the 200 synthetic sets
  fitted worse than the data. Ruled out, …". Pinned, together with
  `worse === 0`.
- One more change, beyond what you asked: the step 4 table showed the
  likelihood-ratio p as 0.00 for many samples (exponential at almost every
  size, all three for the cut-off source). It now shows "< 0.01" when that p is
  below 0.005. That p comes from a normal approximation, not a count of sets,
  so "none fitted worse" does not apply to it. No text quotes those values.
- The browser check of module 05 reads the new readout and verdict for
  mystery 3, and checks that no "0.00" is left in its step 4 table.

### B4. Natural cutoff

The check now uses 1,000 samples per size (N = 10³, 10⁴, 10⁵) for the default
seed and ten others, at γ = 2.5 and 3. Drawing 10⁵ values 1,000 times for 22
runs would mean about 2.4 × 10⁹ draws, so the largest value is drawn
directly. The sampler inverts the distribution function, k = F⁻¹(r), so the
largest of N draws is F⁻¹(u^(1/N)) for a single uniform u (computed as
1 + expm1(ln u / N), which is accurate near 1). A new check compares this with
brute force at N = 1,000, 1,000 samples each. The two-sample KS distance is
0.043 (γ = 2.5) and 0.040 (γ = 3), both below the 1% critical value of 0.073.
The section takes well under a second.

The eleven slopes (target 2/3 and 1/2, limit 0.05, unchanged):

- γ = 2.5, seeds 126 (default) to 136: 0.665, 0.664, 0.679, 0.659, 0.664,
  0.669, 0.691, 0.649, 0.669, 0.662, 0.675. Largest gap 0.025.
- γ = 3, seeds 131 (default) to 141: 0.502, 0.524, 0.489, 0.501, 0.495,
  0.504, 0.503, 0.504, 0.496, 0.506, 0.497. Largest gap 0.024.

All 22 are within 0.05. The status file's note ("does not hold for any seed")
was replaced with this result.

## Checks

All run on the final tree (after `npx vite build`, which succeeds):

- `check-network-01.mjs` to `check-network-05.mjs`: all pass (05: 0 failures).
- Browser checks: `check-index.mjs network` 0/72, `check-index.mjs complexity`
  0/64, `check-links.mjs` 0/80; `check-module.mjs` for the five ready modules
  0/62, 0/62, 0/56, 0/60, 0/58; module scripts 01–05 0/25, 0/29, 0/40, 0/50,
  0/58.
- One failure along the way: the first run of the module 05 browser check
  failed on its own new test, "no 0.00 in the p readout", because "< 0.005"
  contains the characters "0.00". The page was right; the test now looks for
  0.00 not followed by a digit, and passes.
- Timing of Panel B of module 04 in the final run: 300 networks in 2.0 s from
  the start of navigation (first curves at 0.4 s), 1.2 s after the switch.
- `compare-main.mjs` was not run: no shared lab code changed.

Next: `prompts.local/network-lab-06.md` exists and is carried out after this
report.
