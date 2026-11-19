// Wealth and inequality for Module 12: inequality measures (Gini coefficient,
// Lorenz curve, top shares); Sugarscape, agents harvesting sugar on a
// landscape; kinetic exchange models, where every trade is a collision
// between two agents; and the Bouchaud–Mézard model of multiplicative growth
// with exchange.
//
// Every model takes a seed and draws all of its randomness from it.

import { mulberry32, randInt, randNormal } from './rng.js'
import { topShare } from './distributions.js'

export { topShare }

// ---------------------------------------------------------------- measures

// An ascending copy of a sample, as a Float64Array (numeric sort).
export function sortedCopy(values) {
  return Float64Array.from(values).sort()
}

// Gini coefficient of a sorted (ascending) sample of non-negative values:
// G = Σ (2i − n − 1) x_i / (n Σ x), with i = 1 … n. This is the mean absolute
// difference between two members divided by twice the mean, and equals twice
// the area between the Lorenz curve and the diagonal. 0 when all hold the
// same, (n − 1)/n when one member holds everything.
export function giniSorted(sorted) {
  const n = sorted.length
  let sum = 0
  let weighted = 0
  for (let i = 0; i < n; i++) {
    sum += sorted[i]
    weighted += (2 * (i + 1) - n - 1) * sorted[i]
  }
  return n && sum > 0 ? weighted / (n * sum) : NaN
}

export const gini = (values) => giniSorted(sortedCopy(values))

export function median(sorted) {
  const n = sorted.length
  if (!n) return NaN
  const h = n >> 1
  return n % 2 ? sorted[h] : (sorted[h - 1] + sorted[h]) / 2
}

export function mean(values) {
  let s = 0
  for (let i = 0; i < values.length; i++) s += values[i]
  return values.length ? s / values.length : NaN
}

// Lorenz curve of a sorted sample: points { p, L }, where L is the share of
// the total held by the poorest fraction p of the members, from (0, 0) to
// (1, 1). Thinned to about `maxPoints` points evenly spaced in p.
export function lorenzSorted(sorted, maxPoints = 101) {
  const n = sorted.length
  let total = 0
  for (let i = 0; i < n; i++) total += sorted[i]
  const out = [{ p: 0, L: 0 }]
  if (!n || !(total > 0)) return out
  const every = Math.max(1, Math.round(n / (maxPoints - 1)))
  let cum = 0
  for (let i = 0; i < n; i++) {
    cum += sorted[i]
    if ((i + 1) % every === 0 || i === n - 1) out.push({ p: (i + 1) / n, L: cum / total })
  }
  return out
}

// Histogram of `values` in `bins` equal bins on [lo, hi], normalised as a
// density: count / (N · bin width). `above` counts the values beyond hi.
export function histogram(values, lo, hi, bins) {
  const count = new Float64Array(bins)
  const width = (hi - lo) / bins
  let above = 0
  for (let i = 0; i < values.length; i++) {
    const v = values[i]
    if (v >= hi) above++
    else if (v >= lo) count[Math.floor((v - lo) / width)]++
  }
  const N = values.length
  const out = []
  for (let b = 0; b < bins; b++) out.push({ x: lo + (b + 0.5) * width, density: count[b] / (N * width), count: count[b] })
  return { bins: out, above, width }
}

// Gini coefficient of a gamma distribution with shape k: Γ(k + ½) / (√π Γ(k + 1)).
// k = 1 is the exponential, with G = ½.
export function gammaGini(k) {
  // Γ(k + ½) / Γ(k + 1) through the log-gamma function (Lanczos, g = 7).
  const lg = (z) => {
    const c = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
      12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
    ]
    z -= 1
    let x = c[0]
    for (let i = 1; i < 9; i++) x += c[i] / (z + i)
    const t = z + 7.5
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
  }
  return Math.exp(lg(k + 0.5) - lg(k + 1)) / Math.sqrt(Math.PI)
}

// ---------------------------------------------------------------- Sugarscape

export const SUGAR_SIDE = 50
export const SUGAR_MAX = 4
// Two peaks on opposite quadrants, as in Epstein and Axtell's landscape.
const PEAKS = [
  [15, 35],
  [35, 15],
]
const PLATEAU = 5 // capacity drops by one unit every PLATEAU cells from a peak

export const SUGAR_DEFAULTS = {
  agents: 400,
  regrowth: 1,
  visionMax: 6,
  metabolismMax: 4,
  endowMin: 5,
  endowMax: 25,
  lifespan: false,
  ageMin: 60,
  ageMax: 100,
  seed: 1,
}

// Capacity of each cell, 0–4, row-major: concentric terraces around two peaks
// on the torus.
export function sugarCapacity(n = SUGAR_SIDE) {
  const cap = new Uint8Array(n * n)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let d = Infinity
      for (const [px, py] of PEAKS) {
        const dx = Math.min(Math.abs(x - px), n - Math.abs(x - px))
        const dy = Math.min(Math.abs(y - py), n - Math.abs(y - py))
        d = Math.min(d, Math.hypot(dx, dy))
      }
      cap[y * n + x] = Math.max(0, SUGAR_MAX - Math.floor(d / PLATEAU))
    }
  }
  return cap
}

// A fresh agent on a random empty cell. Vision and metabolism are drawn
// uniformly from 1 … max, the endowment uniformly from [endowMin, endowMax],
// and, with finite lifespans, the maximum age uniformly from [ageMin, ageMax].
function spawn(s, age) {
  const { o, random, n } = s
  let k
  do k = randInt(random, n * n)
  while (s.occ[k] >= 0)
  const maxAge = o.lifespan ? o.ageMin + randInt(random, o.ageMax - o.ageMin + 1) : Infinity
  const a = {
    x: k % n,
    y: (k / n) | 0,
    vision: 1 + randInt(random, o.visionMax),
    metabolism: 1 + randInt(random, o.metabolismMax),
    wealth: o.endowMin + random() * (o.endowMax - o.endowMin),
    age: age === 'random' && o.lifespan ? randInt(random, maxAge) : 0,
    maxAge,
  }
  s.occ[k] = s.agents.length
  s.agents.push(a)
}

// Initial state: every cell full, agents scattered at random. With finite
// lifespans the first agents start at random ages, so they do not all die
// together.
export function createSugarscape(options = {}) {
  const o = { ...SUGAR_DEFAULTS, ...options }
  const n = SUGAR_SIDE
  const cap = sugarCapacity(n)
  const s = {
    o,
    n,
    cap,
    sugar: Float64Array.from(cap),
    occ: new Int32Array(n * n).fill(-1),
    agents: [],
    random: mulberry32(o.seed),
    t: 0,
    births: 0,
    starved: 0,
    aged: 0,
  }
  for (let i = 0; i < Math.min(o.agents, n * n); i++) spawn(s, 'random')
  return s
}

// The cell agent `a` moves to: looking along the four lattice directions up
// to its vision (its own cell included), the unoccupied cell with the most
// sugar; ties go to the nearest, then to a random one.
function bestCell(s, a) {
  const { n, sugar, occ, random } = s
  let best = a.y * n + a.x
  let bestSugar = sugar[best]
  for (let d = 1; d <= a.vision; d++) {
    let ties = 0
    let pick = -1
    let pickSugar = -1
    for (let dir = 0; dir < 4; dir++) {
      const x = (a.x + (dir === 0 ? d : dir === 1 ? -d : 0) + n) % n
      const y = (a.y + (dir === 2 ? d : dir === 3 ? -d : 0) + n) % n
      const k = y * n + x
      if (occ[k] >= 0) continue
      const v = sugar[k]
      if (v > pickSugar) {
        pick = k
        pickSugar = v
        ties = 1
      } else if (v === pickSugar && random() * ++ties < 1) {
        pick = k
      }
    }
    if (pick >= 0 && pickSugar > bestSugar) {
      best = pick
      bestSugar = pickSugar
    }
  }
  return best
}

// One step: in a random order each agent moves, harvests its cell, eats its
// metabolism and dies if its sugar falls below zero (or, with finite
// lifespans, when it reaches its maximum age). With finite lifespans every
// dead agent is replaced by a newcomer, so the population stays constant.
// Then every cell regrows by `regrowth`, up to its capacity.
export function sugarscapeStep(s) {
  const { agents, occ, sugar, cap, n, random, o } = s
  // Fisher–Yates on the current agents.
  const order = Array.from(agents.keys())
  for (let i = order.length - 1; i > 0; i--) {
    const j = randInt(random, i + 1)
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  const dead = []
  for (const i of order) {
    const a = agents[i]
    const from = a.y * n + a.x
    const to = bestCell(s, a)
    occ[from] = -1
    occ[to] = i
    a.x = to % n
    a.y = (to / n) | 0
    a.wealth += sugar[to] - a.metabolism
    sugar[to] = 0
    a.age++
    if (a.wealth < 0) {
      s.starved++
      dead.push(i)
    } else if (a.age >= a.maxAge) {
      s.aged++
      dead.push(i)
    }
  }
  // Remove the dead from the highest index down, filling each gap with the
  // last agent so the array stays dense.
  dead.sort((p, q) => q - p)
  for (const i of dead) {
    const a = agents[i]
    occ[a.y * n + a.x] = -1
    const last = agents.pop()
    if (i < agents.length) {
      agents[i] = last
      occ[last.y * n + last.x] = i
    }
  }
  if (o.lifespan) {
    for (let k = 0; k < dead.length; k++) spawn(s, 0)
    s.births += dead.length
  }
  for (let k = 0; k < sugar.length; k++) sugar[k] = Math.min(cap[k], sugar[k] + o.regrowth)
  s.t++
}

export const sugarWealth = (s) => Float64Array.from(s.agents, (a) => a.wealth)

// ---------------------------------------------------------------- exchange

// Kinetic exchange models. N agents start with one unit each and trade in
// random pairs i ≠ j; money is conserved and nobody goes into debt.
//   random       the pair pools its money and splits it at a uniform random
//                point (Drăgulescu–Yakovenko): the exponential, G = ½
//   saving       each keeps a fraction λ and the rest is split at random
//                (Chakraborti–Chakrabarti)
//   yardsale     a fair coin decides who wins f times the poorer one's wealth
//   redistribute the yard sale, plus after every N trades each agent's
//                wealth moves a fraction χ of the way to the mean (Boghosian)
export const EXCHANGE_MODELS = ['random', 'saving', 'yardsale', 'redistribute']

export const EXCHANGE_DEFAULTS = { N: 1000, model: 'random', lambda: 0.5, f: 0.1, chi: 0.01, seed: 1 }

export function createExchange(options = {}) {
  const o = { ...EXCHANGE_DEFAULTS, ...options }
  return { o, w: new Float64Array(o.N).fill(1), trades: 0, random: mulberry32(o.seed) }
}

// `count` trades. Time is counted in sweeps: N trades, about two per agent.
export function exchangeTrades(m, count) {
  const { w, random, o } = m
  const N = w.length
  const { model, lambda, f, chi } = o
  for (let k = 0; k < count; k++) {
    const i = randInt(random, N)
    let j = randInt(random, N - 1)
    if (j >= i) j++
    if (model === 'random') {
      const s = w[i] + w[j]
      w[i] = random() * s
      w[j] = s - w[i]
    } else if (model === 'saving') {
      const s = (1 - lambda) * (w[i] + w[j])
      const e = random()
      w[i] = lambda * w[i] + e * s
      w[j] = lambda * w[j] + (1 - e) * s
    } else {
      const d = f * Math.min(w[i], w[j])
      if (random() < 0.5) {
        w[i] += d
        w[j] -= d
      } else {
        w[i] -= d
        w[j] += d
      }
    }
    m.trades++
    // Every agent started with 1, so the mean stays 1.
    if (model === 'redistribute' && m.trades % N === 0) for (let a = 0; a < N; a++) w[a] += chi * (1 - w[a])
  }
}

export const sweeps = (m) => m.trades / m.w.length

// ---------------------------------------------------------------- growth

// Bouchaud–Mézard in discrete time. Each step every fortune is multiplied by
// (1 + r)·exp(√2·σ·ξ − σ²), with ξ a standard normal: a lognormal factor with
// mean 1 + r, whose logarithm has variance 2σ², as in the authors' convention.
// Then each agent receives J times the gap between the mean and its own
// wealth (exchange with everyone else, which conserves the total). In the
// continuous-time mean-field limit, wealth relative to the mean settles on
// P(w) ∝ w^−(2+J/σ²) e^−(J/σ²)/w: a Pareto tail with exponent α = 1 + J/σ².
// With J = 0 the fortunes evolve independently: the mean grows like (1 + r)^t
// while the median follows the typical growth rate ln(1 + r) − σ².
export const GROWTH_DEFAULTS = { N: 2000, sigma: 0.1, J: 0.01, r: 0.005, seed: 1 }

export const growthAlpha = (sigma, J) => 1 + J / (sigma * sigma)

export function createGrowth(options = {}) {
  const o = { ...GROWTH_DEFAULTS, ...options }
  return { o, W: new Float64Array(o.N).fill(1), t: 0, random: mulberry32(o.seed) }
}

export function growthStep(g) {
  const { W, random, o } = g
  const N = W.length
  const { sigma, J, r } = o
  const avg = mean(W)
  const a = Math.SQRT2 * sigma
  const drift = Math.log(1 + r) - sigma * sigma
  for (let i = 0; i < N; i++) W[i] = W[i] * Math.exp(drift + a * randNormal(random)) + J * (avg - W[i])
  g.t++
}
