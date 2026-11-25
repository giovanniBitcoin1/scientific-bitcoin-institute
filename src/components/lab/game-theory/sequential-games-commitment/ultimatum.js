import { mulberry32 } from '../../rng.js'

// The ultimatum game against a population of responders. Pure logic, shared
// by Panel C and scripts/lab/check-game-theory-04.mjs.

// ------------------------------------------------------------------ Ultimatum game

export const POP_SEED = 5200
export const PLAY_SEED = 5300
export const DEFAULT_N = 1000
export const DEFAULT_M = 0.4
export const PROPOSERS = 1000
export const TRIES = 100 // offers each proposer tries
export const OFFER_STEP = 0.05
export const OFFERS = Array.from({ length: 21 }, (_, k) => Math.round(k * OFFER_STEP * 100) / 100)

// N responders, each refusing any offer below its threshold, the thresholds
// uniform between 0 and m. Sorted, so acceptance is a binary search.
export function population(N = DEFAULT_N, m = DEFAULT_M, seed = POP_SEED) {
  const random = mulberry32(seed + N)
  const t = Array.from({ length: N }, () => random() * m)
  return t.sort((x, y) => x - y)
}

// Share of the population that accepts x (threshold â‰¤ x).
export function acceptShare(pop, x) {
  let lo = 0
  let hi = pop.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (pop[mid] <= x) lo = mid + 1
    else hi = mid
  }
  return lo / pop.length
}

export const expectedMoney = (pop, x) => (1 - x) * acceptShare(pop, x)

// The closed form for thresholds uniform on 0â€“m: accepted with chance
// min(1, x/m), so the proposer expects (1 âˆ’ x) min(1, x/m); the best offer
// is m when m â‰¤ 1/2 (and 1/2 otherwise), worth 1 âˆ’ m.
export const closedMoney = (x, m) => (m <= 0 ? 1 - x : (1 - x) * Math.min(1, x / m))
export const closedBest = (m) => (m <= 0.5 ? { offer: m, money: 1 - m } : { offer: 0.5, money: 0.25 / m })

// The best offer against the population itself: always one of the
// thresholds (just enough to win that responder over), or 0.
export function bestOffer(pop) {
  let best = { offer: 0, money: expectedMoney(pop, 0) }
  pop.forEach((x, i) => {
    const v = (1 - x) * ((i + 1) / pop.length)
    if (v > best.money) best = { offer: x, money: v }
  })
  return best
}

// "Play": PROPOSERS proposers each try TRIES offers chosen at random on the
// grid of OFFERS, each against a responder drawn at random from the
// population; the mean payoff of each offer over all the tries.
export function playJob({ pop, proposers = PROPOSERS, tries = TRIES, seed = PLAY_SEED }) {
  const random = mulberry32(seed)
  const sum = new Array(OFFERS.length).fill(0)
  const count = new Array(OFFERS.length).fill(0)
  const own = new Array(OFFERS.length).fill(0) // proposers whose own best offer is this one
  let done = 0
  function* iter() {
    for (let p = 0; p < proposers; p++) {
      const s = new Array(OFFERS.length).fill(0)
      const c = new Array(OFFERS.length).fill(0)
      for (let k = 0; k < tries; k++) {
        const i = Math.floor(random() * OFFERS.length)
        const r = pop[Math.floor(random() * pop.length)]
        const pay = OFFERS[i] >= r ? 1 - OFFERS[i] : 0
        s[i] += pay
        c[i]++
      }
      let bi = 0
      for (let i = 0; i < OFFERS.length; i++) {
        sum[i] += s[i]
        count[i] += c[i]
        if (c[i] && (!c[bi] || s[i] / c[i] > s[bi] / c[bi])) bi = i
      }
      own[bi]++
      done++
      if (done % 25 === 0) yield done / proposers
    }
  }
  const snapshot = () => {
    const mean = sum.map((v, i) => (count[i] ? v / count[i] : 0))
    let best = 0
    mean.forEach((v, i) => {
      if (v > mean[best]) best = i
    })
    return { done, mean, count: count.slice(), own: own.slice(), best: OFFERS[best], bestMoney: mean[best] }
  }
  return { iter: iter(), snapshot }
}

export function playAll(cfg) {
  const job = playJob(cfg)
  for (const _ of job.iter); // eslint-disable-line no-unused-vars, no-empty
  return job.snapshot()
}
