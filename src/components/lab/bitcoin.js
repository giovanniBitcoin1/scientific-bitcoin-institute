// Bitcoin as a complex adaptive system: least-squares power-law fits over a
// date window, toy models of adoption and network value, the difficulty
// adjustment as a feedback loop, and the issuance schedule. Everything random
// takes a seed.
import { mulberry32, randNormal } from './rng.js'

const DAY_MS = 86400000
export const GENESIS_DATE = '2009-01-03' // the genesis block
const GENESIS_MS = Date.parse(GENESIS_DATE)

// Time is counted in days since the genesis block: day 0 is 3 January 2009.
export const daysSinceGenesis = (iso) => (Date.parse(iso) - GENESIS_MS) / DAY_MS
export const dateFromDays = (d) => new Date(GENESIS_MS + Math.round(d) * DAY_MS).toISOString().slice(0, 10)
export const yearFromDays = (d) => 2009 + (d + 2) / 365.25 // 3 January is day 2 of the year

// The window of SBI's published fit (β = 5.69 ± 0.05, R² = 0.961): from the
// first price in July 2010 to the end of February 2026. With this time origin
// and OLS of log10 price on log10 t it reproduces the published β and R².
export const SBI_WINDOW = { start: '2010-07-01', end: '2026-02-28' }

// ---------------------------------------------------------------- price series

// Rows { date: "YYYY-MM-DD", price } → a series sorted by date, one point per
// day, keeping only positive prices after the genesis day. x = log10 t and
// y = log10 price, with t in days since genesis.
export function prepareSeries(rows) {
  const byDate = new Map()
  for (const r of rows || []) {
    if (!r || typeof r.date !== 'string') continue
    const p = Number(r.price)
    const t = daysSinceGenesis(r.date.slice(0, 10))
    if (Number.isFinite(p) && p > 0 && Number.isFinite(t) && t > 0) byDate.set(r.date.slice(0, 10), { t, p })
  }
  const dates = [...byDate.keys()].sort()
  const n = dates.length
  const t = new Float64Array(n)
  const x = new Float64Array(n)
  const y = new Float64Array(n)
  dates.forEach((d, i) => {
    const r = byDate.get(d)
    t[i] = r.t
    x[i] = Math.log10(r.t)
    y[i] = Math.log10(r.p)
  })
  return { n, dates, t, x, y, prefix: prefixSums(t, x, y) }
}

// Running sums, so that a least-squares fit over any window costs O(1).
function prefixSums(t, x, y) {
  const n = t.length
  const s = {}
  for (const k of ['x', 'y', 'xx', 'xy', 'yy', 't', 'tt', 'ty']) s[k] = new Float64Array(n + 1)
  for (let i = 0; i < n; i++) {
    s.x[i + 1] = s.x[i] + x[i]
    s.y[i + 1] = s.y[i] + y[i]
    s.xx[i + 1] = s.xx[i] + x[i] * x[i]
    s.xy[i + 1] = s.xy[i] + x[i] * y[i]
    s.yy[i + 1] = s.yy[i] + y[i] * y[i]
    s.t[i + 1] = s.t[i] + t[i]
    s.tt[i + 1] = s.tt[i] + t[i] * t[i]
    s.ty[i + 1] = s.ty[i] + t[i] * y[i]
  }
  return s
}

// Ordinary least squares y = a + b·x from sums over n points: slope, intercept,
// R² and the textbook standard error of the slope, which assumes independent
// residuals.
function olsFromSums(n, sx, sy, sxx, sxy, syy) {
  const cxx = sxx - (sx * sx) / n
  const cxy = sxy - (sx * sy) / n
  const cyy = syy - (sy * sy) / n
  const b = cxy / cxx
  const a = (sy - b * sx) / n
  const ssr = Math.max(0, cyy - b * cxy)
  return { a, b, r2: cyy > 0 ? 1 - ssr / cyy : NaN, se: n > 2 ? Math.sqrt(ssr / (n - 2) / cxx) : NaN }
}

// The index of the first point with t ≥ day.
export function indexAtDay(series, day) {
  let lo = 0
  let hi = series.n
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (series.t[mid] < day) lo = mid + 1
    else hi = mid
  }
  return lo
}

function windowSums(s, i0, i1, keys) {
  return keys.map((k) => s[k][i1] - s[k][i0])
}

// Power law log10 p = a + β·log10 t on the points [i0, i1).
export function powerFitIdx(series, i0, i1) {
  const n = i1 - i0
  if (n < 3) return null
  const [sx, sy, sxx, sxy, syy] = windowSums(series.prefix, i0, i1, ['x', 'y', 'xx', 'xy', 'yy'])
  return olsFromSums(n, sx, sy, sxx, sxy, syy)
}

// Exponential log10 p = a + b·t on the same points: a straight line on semi-log axes.
export function exponentialFitIdx(series, i0, i1) {
  const n = i1 - i0
  if (n < 3) return null
  const [st, sy, stt, sty, syy] = windowSums(series.prefix, i0, i1, ['t', 'y', 'tt', 'ty', 'yy'])
  return olsFromSums(n, st, sy, stt, sty, syy)
}

// The full analysis of a window [startDay, endDay]: both fits, the residuals
// of the power law (in dex, i.e. powers of ten) and their diagnostics.
export function analyseWindow(series, startDay, endDay) {
  const i0 = indexAtDay(series, startDay)
  const i1 = indexAtDay(series, endDay + 0.5)
  const power = powerFitIdx(series, i0, i1)
  if (!power) return null
  const exp = exponentialFitIdx(series, i0, i1)
  const n = i1 - i0
  const res = new Float64Array(n)
  let ss = 0
  for (let i = 0; i < n; i++) {
    res[i] = series.y[i0 + i] - (power.a + power.b * series.x[i0 + i])
    ss += res[i] * res[i]
  }
  const sd = Math.sqrt(ss / n)
  const rho = lag1(res)
  const nwLag = neweyWestLag(n)
  // Day-to-day changes of the residual, for gaps of exactly one day.
  const diffs = []
  for (let i = 1; i < n; i++) {
    if (series.t[i0 + i] - series.t[i0 + i - 1] === 1) diffs.push(res[i] - res[i - 1])
  }
  return {
    i0,
    i1,
    n,
    power,
    exp,
    nwLag,
    seRobust: neweyWestSlopeSE(series.x, i0, res, nwLag),
    residuals: res,
    sd,
    rho,
    kurtosis: excessKurtosis(diffs),
    nDiffs: diffs.length,
  }
}

// The usual rule-of-thumb lag for Newey–West: ⌊4 (n/100)^(2/9)⌋, 9 for ~5,700 days.
export const neweyWestLag = (n) => Math.max(1, Math.floor(4 * (n / 100) ** (2 / 9)))

// Newey–West (Bartlett kernel) standard error of the OLS slope: it allows the
// residuals res (of the points x[i0 …]) to be correlated up to `lag` steps
// apart, instead of assuming them independent.
export function neweyWestSlopeSE(x, i0, res, lag) {
  const n = res.length
  let mx = 0
  for (let i = 0; i < n; i++) mx += x[i0 + i]
  mx /= n
  const u = new Float64Array(n)
  let sxx = 0
  for (let i = 0; i < n; i++) {
    const d = x[i0 + i] - mx
    sxx += d * d
    u[i] = d * res[i]
  }
  let s = 0
  for (let i = 0; i < n; i++) s += u[i] * u[i]
  for (let l = 1; l <= lag; l++) {
    let g = 0
    for (let i = l; i < n; i++) g += u[i] * u[i - l]
    s += 2 * (1 - l / (lag + 1)) * g
  }
  return Math.sqrt(Math.max(0, s)) / sxx
}

// Lag-1 autocorrelation.
export function lag1(v) {
  const n = v.length
  if (n < 3) return NaN
  let m = 0
  for (let i = 0; i < n; i++) m += v[i]
  m /= n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    const d = v[i] - m
    den += d * d
    if (i > 0) num += d * (v[i - 1] - m)
  }
  return den > 0 ? num / den : NaN
}

// Excess kurtosis: 0 for a Gaussian, positive for heavier tails.
export function excessKurtosis(v) {
  const n = v.length
  if (n < 4) return NaN
  let m = 0
  for (const a of v) m += a
  m /= n
  let m2 = 0
  let m4 = 0
  for (const a of v) {
    const d = (a - m) * (a - m)
    m2 += d
    m4 += d * d
  }
  m2 /= n
  m4 /= n
  return m2 > 0 ? m4 / (m2 * m2) - 3 : NaN
}

// β̂ as the start of the window moves, with the end fixed: `count` starts from
// the first point up to `minSpan` days before the end.
export function exponentStability(series, endDay, { count = 40, minSpan = 730 } = {}) {
  if (!series.n) return []
  const i1 = indexAtDay(series, endDay + 0.5)
  const first = series.t[0]
  const last = endDay - minSpan
  const out = []
  if (last <= first) return out
  for (let k = 0; k < count; k++) {
    const day = first + ((last - first) * k) / (count - 1)
    const fit = powerFitIdx(series, indexAtDay(series, day), i1)
    if (fit) out.push({ day, beta: fit.b, se: fit.se })
  }
  return out
}

// A synthetic test series: log10 p = β (log10 t − 3) + noise, one point per
// day, so that p = 1 on day 1000 (arbitrary units). The noise is AR(1) in dex
// with stationary standard deviation `sigma` and persistence `phi`; `tails`
// draws its innovations from a Student t with 4 degrees of freedom instead of a
// Gaussian. phi = 0 and tails = false give independent lognormal noise.
export function syntheticSeries({ beta = 5.69, sigma = 0.25, phi = 0.995, tails = true, seed = 1, from = '2010-07-18', to = '2026-02-28' } = {}) {
  const random = mulberry32(seed)
  const t0 = Math.round(daysSinceGenesis(from))
  const t1 = Math.round(daysSinceGenesis(to))
  const kick = sigma * Math.sqrt(1 - phi * phi)
  const draw = () => {
    if (!tails) return randNormal(random)
    let chi = 0
    for (let j = 0; j < 4; j++) chi += randNormal(random) ** 2
    // A t(4) variate has variance 2: divide by √2 to keep unit variance.
    return randNormal(random) / Math.sqrt(chi / 4) / Math.SQRT2
  }
  let e = sigma * randNormal(random)
  const rows = []
  for (let t = t0; t <= t1; t++) {
    rows.push({ date: dateFromDays(t), price: 10 ** (beta * (Math.log10(t) - 3) + e) })
    e = phi * e + kick * draw()
  }
  return rows
}

// ---------------------------------------------------------------- adoption toy models

export const ADOPTION_MODELS = ['power', 'logistic', 'bass']
export const ADOPTION_DEFAULTS = {
  a: 2, // power law n = 1000 · t^a
  K: 1e8, // logistic ceiling
  tm: 15, // logistic midpoint, years
  r: 0.5, // logistic rate, per year
  m: 1e8, // Bass market size
  p: 0.003, // Bass innovation coefficient, per year
  q: 0.4, // Bass imitation coefficient, per year
}

// Users n(t), with t in years.
export function adoption(model, o, t) {
  if (model === 'power') return 1000 * t ** o.a
  if (model === 'logistic') return o.K / (1 + Math.exp(-o.r * (t - o.tm)))
  // Bass (1969): F(t) = (1 − e^(−(p+q)t)) / (1 + (q/p) e^(−(p+q)t)), the adopted fraction of m.
  const e = Math.exp(-(o.p + o.q) * t)
  return (o.m * (1 - e)) / (1 + (o.q / o.p) * e)
}

// n(t) and V(t) = n^k on a logarithmic grid of `points` times in [tMin, tMax],
// with the local slopes d ln n / d ln t and d ln V / d ln t = k · d ln n / d ln t.
export function adoptionCurve(model, o, k, tMin, tMax, points = 160) {
  const out = []
  const lo = Math.log(tMin)
  const hi = Math.log(tMax)
  const h = 1e-4
  for (let i = 0; i < points; i++) {
    const lt = lo + ((hi - lo) * i) / (points - 1)
    const t = Math.exp(lt)
    const n = adoption(model, o, t)
    const slope = (Math.log(adoption(model, o, Math.exp(lt + h))) - Math.log(adoption(model, o, Math.exp(lt - h)))) / (2 * h)
    out.push({ t, n, V: n ** k, slopeN: slope, slopeV: k * slope })
  }
  return out
}

// ---------------------------------------------------------------- difficulty adjustment

export const RETARGET_BLOCKS = 2016
export const TARGET_SECONDS = 600
export const MAX_FACTOR = 4
const YEAR_S = 365.25 * 86400
const ROLL = 144 // blocks in the rolling mean of the block interval, about a day

export const DIFFICULTY_DEFAULTS = {
  growth: 0.5, // hash-rate growth per year (0.5 = +50% a year)
  shockDay: 200, // day of the shock
  shock: 0.5, // fraction of hash rate that goes offline
  recovery: false, // whether it comes back
  halfLife: 60, // days for half of the lost hash rate to return
  seed: 1,
}

// Hash rate in units of the initial hash rate, at time ts seconds.
export function hashRateAt(o, ts) {
  let h = (1 + o.growth) ** (ts / YEAR_S)
  const shockAt = o.shockDay * 86400
  if (o.shock > 0 && ts >= shockAt) {
    const lost = o.recovery ? o.shock * 2 ** (-(ts - shockAt) / (o.halfLife * 86400)) : o.shock
    h *= 1 - lost
  }
  return h
}

// Difficulty is expressed as the expected work per block, in hash-rate units ×
// seconds, so that the expected interval is difficulty / hash rate. It starts
// matched to the initial hash rate, at 600 s per block.
export function createDifficultySim(o) {
  return {
    o,
    random: mulberry32(o.seed),
    t: 0, // seconds
    height: 0,
    difficulty: TARGET_SECONDS * hashRateAt(o, 0),
    periodStart: 0, // time of the last retarget
    lastAdjust: null, // factor of the last retarget − 1
    retargets: [], // { day, height, difficulty, adjust, clamped }
    ring: new Float64Array(ROLL),
    ringSum: 0,
    history: [{ day: 0, hash: 1, diff: 1, interval: TARGET_SECONDS / 60 }],
  }
}

// One block. Blocks are a Poisson process with rate hash rate / difficulty.
// The rate is read when the search for a block starts, which is exact for the
// step at the shock (handled below) and a good approximation for the slow
// changes from growth and recovery.
export function mineBlock(s) {
  const { o } = s
  const work = -Math.log(1 - s.random()) // unit exponential: work needed, in units of the difficulty
  const h = hashRateAt(o, s.t)
  let dt = (work * s.difficulty) / h
  const shockAt = o.shockDay * 86400
  if (o.shock > 0 && s.t < shockAt && s.t + dt > shockAt) {
    // Spend part of the work at the old rate up to the shock, the rest at the new one.
    const done = ((shockAt - s.t) * h) / s.difficulty
    dt = shockAt - s.t + ((work - done) * s.difficulty) / hashRateAt(o, shockAt)
  }
  s.t += dt
  s.height++
  const slot = s.height % ROLL
  s.ringSum += dt - s.ring[slot]
  s.ring[slot] = dt
  if (s.height % RETARGET_BLOCKS === 0) {
    // The protocol compares the time the last 2016 blocks took with two weeks
    // and rescales the difficulty, by at most a factor of four either way.
    // (Bitcoin Core measures that span over 2015 intervals, a historical
    // off-by-one that this idealised version leaves out.)
    const actual = s.t - s.periodStart
    const raw = (RETARGET_BLOCKS * TARGET_SECONDS) / actual
    const factor = Math.min(MAX_FACTOR, Math.max(1 / MAX_FACTOR, raw))
    s.difficulty *= factor
    s.periodStart = s.t
    s.lastAdjust = factor - 1
    s.retargets.push({ day: s.t / 86400, height: s.height, difficulty: s.difficulty, adjust: factor - 1, clamped: factor !== raw })
  }
  if (s.height % 36 === 0) {
    const n = Math.min(s.height, ROLL)
    s.history.push({
      day: s.t / 86400,
      hash: hashRateAt(o, s.t),
      diff: s.difficulty / TARGET_SECONDS,
      interval: s.ringSum / n / 60,
    })
  }
}

// Mines until the simulated clock passes `day`, or the time budget (ms) runs out.
export function mineUntil(s, day, budgetMs = Infinity) {
  const end = day * 86400
  const begin = budgetMs < Infinity ? performance.now() : 0
  let k = 0
  while (s.t < end) {
    mineBlock(s)
    if (budgetMs < Infinity && ++k % 256 === 0 && performance.now() - begin > budgetMs) break
  }
}

// Blocks mined since the last retarget, and the mean interval over them.
export function currentPeriod(s) {
  const blocks = s.height % RETARGET_BLOCKS
  return {
    index: Math.floor(s.height / RETARGET_BLOCKS) + 1,
    blocks,
    left: RETARGET_BLOCKS - blocks,
    meanInterval: blocks > 0 ? (s.t - s.periodStart) / blocks : NaN,
  }
}

// ---------------------------------------------------------------- issuance

export const HALVING_BLOCKS = 210000
export const SAT_PER_BTC = 1e8
const INITIAL_SUBSIDY_SAT = 50 * SAT_PER_BTC

// The block subsidy at a height, in satoshi: 50 BTC shifted right once per
// 210,000 blocks, in whole satoshi, as in the protocol.
export function subsidySat(height) {
  const k = Math.floor(height / HALVING_BLOCKS)
  return k >= 64 ? 0 : Math.floor(INITIAL_SUBSIDY_SAT / 2 ** k)
}

// The number of halving eras with a non-zero subsidy: 33 (eras 0 … 32).
export const SUBSIDY_ERAS = (() => {
  let k = 0
  while (subsidySat(k * HALVING_BLOCKS) > 0) k++
  return k
})()
export const LAST_SUBSIDY_HEIGHT = SUBSIDY_ERAS * HALVING_BLOCKS - 1

// Total subsidy of the blocks at heights 0 … height − 1, in satoshi (the
// genesis block's 50 BTC, which can never be spent, is counted as usual).
export function supplySat(height) {
  let total = 0
  for (let k = 0; k < SUBSIDY_ERAS; k++) {
    const start = k * HALVING_BLOCKS
    if (height <= start) break
    total += Math.min(height - start, HALVING_BLOCKS) * subsidySat(start)
  }
  return total
}

export const MAX_SUPPLY_SAT = supplySat(LAST_SUBSIDY_HEIGHT + 1)

// Approximate dates. The genesis block and the first four halvings sit at
// their actual dates; in between, blocks are spread evenly; after the last
// anchor, one block every ten minutes.
const ANCHORS = [
  [0, '2009-01-03'],
  [210000, '2012-11-28'],
  [420000, '2016-07-09'],
  [630000, '2020-05-11'],
  [840000, '2024-04-20'],
].map(([h, d]) => [h, Date.parse(d)])

export function heightToMs(height) {
  for (let i = 1; i < ANCHORS.length; i++) {
    const [h1, m1] = ANCHORS[i]
    if (height <= h1) {
      const [h0, m0] = ANCHORS[i - 1]
      return m0 + ((height - h0) / (h1 - h0)) * (m1 - m0)
    }
  }
  const [hl, ml] = ANCHORS[ANCHORS.length - 1]
  return ml + (height - hl) * TARGET_SECONDS * 1000
}

export function msToHeight(ms) {
  for (let i = 1; i < ANCHORS.length; i++) {
    const [h1, m1] = ANCHORS[i]
    if (ms <= m1) {
      const [h0, m0] = ANCHORS[i - 1]
      return Math.max(0, Math.floor(h0 + ((ms - m0) / (m1 - m0)) * (h1 - h0)))
    }
  }
  const [hl, ml] = ANCHORS[ANCHORS.length - 1]
  return Math.floor(hl + (ms - ml) / (TARGET_SECONDS * 1000))
}

export const heightToYear = (height) => {
  const d = new Date(heightToMs(height))
  return d.getUTCFullYear() + (d.getUTCMonth() + d.getUTCDate() / 31) / 12
}

const BLOCKS_PER_YEAR = YEAR_S / TARGET_SECONDS // 52,596

// New supply over the next year at the current subsidy, as a fraction of the
// supply already issued.
export function annualIssuanceRate(height) {
  const s = supplySat(height)
  return s > 0 ? (subsidySat(height) * BLOCKS_PER_YEAR) / s : Infinity
}

// Points for the issuance charts up to maxHeight: `perEra` per era plus the
// two sides of every halving, so that the steps are drawn sharply.
export function issuanceCurve(maxHeight, perEra = 12) {
  const out = []
  const push = (h) => {
    const sub = subsidySat(h)
    out.push({
      h,
      supply: supplySat(h) / SAT_PER_BTC,
      subsidy: sub > 0 ? sub / SAT_PER_BTC : null,
      rate: h > 0 && sub > 0 ? annualIssuanceRate(h) : null,
    })
  }
  for (let k = 0; k * HALVING_BLOCKS < maxHeight; k++) {
    const start = k * HALVING_BLOCKS
    for (let j = 0; j < perEra; j++) push(start + Math.round((HALVING_BLOCKS * j) / perEra))
    push(Math.min(start + HALVING_BLOCKS - 1, maxHeight))
  }
  push(maxHeight)
  return out
}
