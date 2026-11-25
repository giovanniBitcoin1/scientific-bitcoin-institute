import { mulberry32 } from '../../rng.js'

// The market for lemons, a simple version (not Akerlof's own): qualities
// spread evenly on q_min–1; an owner values a car at its quality q, a buyer at
// b q; buyers see only the average quality of the cars on offer. Pure logic,
// shared by Panel A and scripts/lab/check-game-theory-05.mjs.

export const DEFAULTS = { qmin: 0.2, b: 1.5, N: 10000 }
export const SURVEY_QMIN = [0, 0.1, 0.2, 0.4]
export const SURVEY_B = Array.from({ length: 10 }, (_, k) => Math.round((1.1 + 0.1 * k) * 10) / 10) // 1.1 … 2.0
export const SURVEY_N = 10000
export const SURVEY_SEED = 5100

// ------------------------------------------------------------------ The continuous model, exact

// The price path: p_0 = b(q_min + 1)/2, then p_{t+1} = b(q_min + min(p_t, 1))/2.
export function pricePath(qmin, b, rounds = 40) {
  const out = [(b * (qmin + 1)) / 2]
  for (let t = 1; t < rounds; t++) out.push((b * (qmin + Math.min(out[t - 1], 1))) / 2)
  return out
}

// Where the price ends: the whole market when b(1 + q_min)/2 ≥ 1, otherwise
// the fixed point b q_min/(2 − b) (0 when q_min = 0).
export const wholeMarket = (qmin, b) => (b * (1 + qmin)) / 2 >= 1 - 1e-12

export function endPoint(qmin, b) {
  if (wholeMarket(qmin, b)) return { price: (b * (1 + qmin)) / 2, cars: 1, gains: 1, whole: true }
  const p = (b * qmin) / (2 - b)
  const top = Math.max(qmin, p)
  return {
    price: p,
    cars: (top - qmin) / (1 - qmin),
    gains: (top * top - qmin * qmin) / (1 - qmin * qmin),
    whole: false,
  }
}

// The first round whose price is within tol of the end point.
export function roundsTo(qmin, b, tol = 0.001) {
  const end = endPoint(qmin, b)
  const path = pricePath(qmin, b, 400)
  const k = path.findIndex((p) => (end.whole ? Math.min(p, end.price) >= end.price - tol : Math.abs(p - end.price) <= tol))
  return k
}

// ------------------------------------------------------------------ A sample of N cars

export function sample(N, qmin, seed) {
  const random = mulberry32(seed)
  const q = new Float64Array(N)
  for (let i = 0; i < N; i++) q[i] = qmin + (1 - qmin) * random()
  q.sort()
  return q
}

// The rounds of the market on a sorted sample. Round 0: every car on offer,
// price b × the mean quality. Then a car stays only if its quality is at most
// the last price; the new price is b × the mean quality of the cars still on
// offer. Stops when no car leaves. Returns the prices and the counts on offer
// by round (rounds = prices computed, round 0 included), and at the end the
// price, the share of cars traded and the share of the gains realised (every
// car is worth (b − 1) q more to a buyer, so this is the sum of the qualities
// traded over the sum of all qualities).
export function runMarket(q, b) {
  const N = q.length
  const prefix = new Float64Array(N + 1)
  for (let i = 0; i < N; i++) prefix[i + 1] = prefix[i] + q[i]
  let m = N
  const prices = []
  const counts = []
  for (;;) {
    const p = (b * prefix[m]) / m
    prices.push(p)
    counts.push(m)
    // Cars with quality ≤ p among the first m (the sample is sorted).
    let lo = 0
    let hi = m
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (q[mid] <= p) lo = mid + 1
      else hi = mid
    }
    if (lo === m || lo === 0) {
      if (lo === 0) {
        // Nobody would sell at this price: the market closes.
        return { prices, counts, rounds: prices.length, price: p, cars: 0, gains: 0, traded: 0 }
      }
      break
    }
    m = lo
  }
  return { prices, counts, rounds: prices.length, price: prices.at(-1), cars: m / N, gains: prefix[m] / prefix[N], traded: m }
}

export const market = ({ qmin = DEFAULTS.qmin, b = DEFAULTS.b, N = DEFAULTS.N, seed = 1 } = {}) => runMarket(sample(N, qmin, seed), b)

// ------------------------------------------------------------------ The survey

// Exact curves of cars traded and gains realised against b, one per q_min.
export function exactCurves(qmin, from = 1.05, to = 2, steps = 190) {
  const cars = []
  const gains = []
  for (let k = 0; k <= steps; k++) {
    const b = from + ((to - from) * k) / steps
    const e = endPoint(qmin, b)
    cars.push([b, e.cars])
    gains.push([b, e.gains])
  }
  return { cars, gains }
}

// One sample of 10,000 cars at each b of SURVEY_B, for each q_min, as a job.
export function surveyJob({ N = SURVEY_N, seed = SURVEY_SEED } = {}) {
  const dots = SURVEY_QMIN.map(() => [])
  function* iter() {
    let k = 0
    const total = SURVEY_QMIN.length * SURVEY_B.length
    for (let i = 0; i < SURVEY_QMIN.length; i++) {
      for (let j = 0; j < SURVEY_B.length; j++) {
        const r = runMarket(sample(N, SURVEY_QMIN[i], seed + 100 * i + j), SURVEY_B[j])
        dots[i].push({ b: SURVEY_B[j], cars: r.cars, gains: r.gains, price: r.price })
        k++
        yield k / total
      }
    }
  }
  return { iter: iter(), snapshot: () => ({ dots: dots.map((d) => d.slice()) }) }
}

export function survey(cfg) {
  const job = surveyJob(cfg)
  for (const _ of job.iter); // eslint-disable-line no-unused-vars, no-empty
  return job.snapshot()
}
