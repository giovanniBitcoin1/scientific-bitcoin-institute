import { mulberry32 } from '../../rng.js'

// The stag hunt as a choice between two conventions, and a population that
// settles on one of them by copying what it sees. Payoffs: a when both hunt
// the stag, b for hunting it alone, c for hunting hare while the other hunts
// the stag, d when both hunt hare (a > c ≥ d > b). Pure logic, shared by
// Figure F1, Panel B and scripts/lab/check-game-theory-02.mjs.

export const STAG = { a: 4, b: 0, c: 3, d: 2 }
export const DEFAULTS = { N: 200, k: 10, x0: 0.7, runs: 200, maxSweeps: 300 }
export const RUN_SEED = 6200
export const SCAN_SEED = 6300
export const X0_VALUES = Array.from({ length: 21 }, (_, i) => i / 20)
const EPS = 1e-9

// Expected payoffs when the other hunts the stag with probability q.
export const stagPayoff = ({ a, b }, q) => a * q + b * (1 - q)
export const harePayoff = ({ c, d }, q) => c * q + d * (1 - q)

// Stag is a best response when q is above q*.
export const qStar = ({ a, b, c, d }) => (d - b) / (a - c + (d - b))

// 'stag' when the stag equilibrium needs less confidence (q* < 1/2), 'hare'
// when the hare equilibrium does, 'neither' on the line.
export function riskDominant(p) {
  const q = qStar(p)
  return Math.abs(q - 0.5) < EPS ? 'neither' : q < 0.5 ? 'stag' : 'hare'
}

// Keeps a > c ≥ d > 0 after one of the three sliders has moved (step 0.5).
export function clampPayoffs(p, key, value) {
  const out = { ...p }
  if (key === 'a') out.a = Math.max(value, p.c + 0.5)
  if (key === 'c') out.c = Math.min(Math.max(value, p.d), p.a - 0.5)
  if (key === 'd') out.d = Math.min(Math.max(value, 0.5), p.c)
  return out
}

// ------------------------------------------------------- The sampled rule

function binomial(k, x) {
  const out = new Array(k + 1)
  let coef = 1
  for (let s = 0; s <= k; s++) {
    out[s] = coef * x ** s * (1 - x) ** (k - s)
    coef = (coef * (k - s)) / (s + 1)
  }
  return out
}

// The chance that a player who sees k others, each a stag hunter with
// probability x, hunts the stag afterwards: above q* k stag, below it hare, and
// exactly at q* k the player keeps doing the same (stag with probability x).
export function stagAfter(x, q, k) {
  const pmf = binomial(k, x)
  const t = q * k
  let p = 0
  for (let s = 0; s <= k; s++) {
    if (Math.abs(s - t) < EPS) p += x * pmf[s]
    else if (s > t) p += pmf[s]
  }
  return p
}

// The tipping point of the sampled rule: the share x strictly between 0 and 1
// at which the population stays where it is on average, x = stagAfter(x).
// Below it the share of stag hunters falls, above it it rises.
export function tippingPoint(q, k) {
  let lo = 1e-6
  let hi = 1 - 1e-6
  const h = (x) => stagAfter(x, q, k) - x
  if (!(h(lo) < 0) || !(h(hi) > 0)) return null
  for (let n = 0; n < 60; n++) {
    const mid = (lo + hi) / 2
    if (h(mid) < 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// --------------------------------------------------------- The population

// One revision: a player chosen at random looks at k of the N − 1 others,
// chosen at random without repeats, and counts the stag hunters. `stags` is
// the number of stag hunters and t = q* k; returns the new number.
export function revise(random, stags, N, k, t) {
  const isStag = random() * N < stags
  let left = stags - (isStag ? 1 : 0)
  let pool = N - 1
  let seen = 0
  for (let n = 0; n < k; n++) {
    if (random() * pool < left) {
      seen++
      left--
    }
    pool--
  }
  let next = isStag
  if (Math.abs(seen - t) >= EPS) next = seen > t
  return stags + (next ? 1 : 0) - (isStag ? 1 : 0)
}

// One run: sweeps of N revisions until everyone does the same, or maxSweeps.
// Returns the share of stag hunters after each sweep (the first entry is the
// start), and how it ended: 'stag', 'hare' or 'open'.
export function runPopulation(random, { payoffs = STAG, N = DEFAULTS.N, k = DEFAULTS.k, x0 = DEFAULTS.x0, maxSweeps = DEFAULTS.maxSweeps }) {
  const kk = Math.min(k, N - 1)
  const t = qStar(payoffs) * kk
  let stags = Math.round(x0 * N)
  const series = [stags / N]
  let sweeps = 0
  while (stags > 0 && stags < N && sweeps < maxSweeps) {
    for (let n = 0; n < N && stags > 0 && stags < N; n++) stags = revise(random, stags, N, kk, t)
    sweeps++
    series.push(stags / N)
  }
  return { series, sweeps, end: stags === N ? 'stag' : stags === 0 ? 'hare' : 'open' }
}

export const runOnce = (cfg, seed = RUN_SEED) => runPopulation(mulberry32(seed), cfg)

// The seed of the runs that start from the i-th value of x0: each starting
// share has its own generator, so a point does not depend on the others.
const seedAt = (seed, i) => seed + 1000 * i

// Many runs from one starting share.
export function manyRuns(cfg, runs, seed) {
  const random = mulberry32(seed)
  let stag = 0
  let hare = 0
  let sweeps = 0
  for (let r = 0; r < runs; r++) {
    const out = runPopulation(random, cfg)
    if (out.end === 'stag') stag++
    else if (out.end === 'hare') hare++
    sweeps += out.sweeps
  }
  return { runs, stag: stag / runs, hare: hare / runs, sweeps: sweeps / runs }
}

// "Scan the starting share" as a job for useExperiment: for each x0 from 0 to
// 1 in steps of 0.05, the chance of ending with everyone hunting the stag.
// snapshot() → [{ x0, runs, stag, hare, sweeps }] for the points done so far.
export function scanJob({ payoffs = STAG, N = DEFAULTS.N, k = DEFAULTS.k, runs = DEFAULTS.runs, seed = SCAN_SEED }) {
  const points = X0_VALUES.map((x0) => ({ x0, runs: 0, stag: 0, hare: 0, sweeps: 0 }))
  const total = points.length * runs
  let done = 0
  function* iter() {
    for (let i = 0; i < points.length; i++) {
      const random = mulberry32(seedAt(seed, i))
      const pt = points[i]
      for (let r = 0; r < runs; r++) {
        const out = runPopulation(random, { payoffs, N, k, x0: pt.x0 })
        if (out.end === 'stag') pt.stag++
        else if (out.end === 'hare') pt.hare++
        pt.sweeps += out.sweeps
        pt.runs++
        done++
        yield done / total
      }
    }
  }
  return {
    iter: iter(),
    snapshot: () =>
      points.filter((pt) => pt.runs > 0).map((pt) => ({ x0: pt.x0, runs: pt.runs, stag: pt.stag / pt.runs, hare: pt.hare / pt.runs, sweeps: pt.sweeps / pt.runs })),
  }
}

export function scan(cfg) {
  const job = scanJob(cfg)
  for (const _ of job.iter); // eslint-disable-line no-unused-vars, no-empty
  return job.snapshot()
}

// The chance of ending at "everyone hunts the stag" from one starting share,
// with the seed the scan uses for that share.
export function chanceAt(cfg, x0, runs = DEFAULTS.runs, seed = SCAN_SEED) {
  const i = Math.round(x0 * 20)
  return manyRuns({ ...cfg, x0 }, runs, seedAt(seed, i))
}
