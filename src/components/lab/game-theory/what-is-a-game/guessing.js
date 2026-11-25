import { mulberry32, randNormal } from '../../rng.js'

// "Guess p times the average": N players each name a number from 0 to 100 and
// the closest to p × the mean wins. Five kinds of player: level 0 guesses at
// random, level k answers level k − 1, and the "equilibrium" kind always says
// 0. Pure logic, shared by Panel B and scripts/lab/check-game-theory-01.mjs.

export const KINDS = ['l0', 'l1', 'l2', 'l3', 'eq']

export const SHARE_PRESETS = {
  default: [0.2, 0.35, 0.3, 0.1, 0.05],
  random: [1, 0, 0, 0, 0],
  deep: [0, 0, 0.5, 0.3, 0.2],
  half: [0.1, 0.1, 0.2, 0.1, 0.5],
}

export const DEFAULTS = { N: 1000, p: 2 / 3, sigma: 2, runs: 1000 }
export const ROUND_SEED = 4100 // the round shown when the page loads
export const MANY_SEED = 4200 // "Play 1,000 times"

// The values the slider of p moves through: 0.10, 0.15, …, 0.95 and 2/3.
export const P_VALUES = [
  0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 2 / 3, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95,
]

export function normalise(shares) {
  const sum = shares.reduce((x, y) => x + y, 0)
  return sum > 0 ? shares.map((s) => s / sum) : [1, 0, 0, 0, 0]
}

// How many players of each kind: share × N rounded for levels 1 to 3 and for
// the equilibrium kind, the remainder to level 0.
export function countsOf(N, shares) {
  const s = normalise(shares)
  const c = s.map((x) => Math.round(x * N))
  c[0] = 0
  let rest = N - c.reduce((x, y) => x + y, 0)
  // Rounding can hand out one or two players too many: take them back from
  // the largest group.
  while (rest < 0) {
    c[c.indexOf(Math.max(...c))]--
    rest++
  }
  c[0] = rest
  return c
}

// f = Σ s_k p^k over levels 0 to 3: the expected mean is ref × f, where ref
// is 50 in the first round (the noise and the clipping at 0 and 100 are left
// out). The equilibrium kind adds nothing.
export function factor(shares, p) {
  const s = normalise(shares)
  return s[0] + s[1] * p + s[2] * p * p + s[3] * p * p * p
}

export function expected(shares, p, ref = 50) {
  const mean = ref * factor(shares, p)
  return { mean, target: p * mean }
}

// What level k says when the reference point is ref.
export const levelGuess = (k, p, ref = 50) => ref * p ** k

// The first level whose guess is below `limit`.
export function firstLevelBelow(p, limit = 1, ref = 50) {
  let k = 0
  while (levelGuess(k, p, ref) >= limit) k++
  return k
}

// The first round t in which ref × f^t is below `limit` (round 1 is the first).
export function roundBelow(f, limit = 1, ref = 50) {
  if (!(f < 1)) return null
  let t = 1
  let mean = ref * f
  while (mean >= limit) {
    mean *= f
    t++
  }
  return t
}

const clip = (x) => (x < 0 ? 0 : x > 100 ? 100 : x)

// One round. `counts` from countsOf; players are stored kind by kind. In the
// first round level 0 is uniform on 0–100 and the others start from 50; later
// (`ref` = the mean of the previous round) level 0 says ref plus noise and
// level k says ref × p^k plus noise. Returns the guesses, their mean, the
// target p × mean, the winner (the closest guess; the first one in a tie) and
// each kind's mean distance from the target.
export function playRound(random, { counts, p, sigma, ref = 50, first = true }) {
  const N = counts.reduce((x, y) => x + y, 0)
  const guesses = new Float64Array(N)
  let n = 0
  let sum = 0
  for (let kind = 0; kind < 5; kind++) {
    const centre = kind === 4 ? 0 : ref * p ** kind
    for (let c = 0; c < counts[kind]; c++) {
      let g
      if (kind === 4) g = 0
      else if (kind === 0 && first) g = 100 * random()
      else g = clip(centre + (sigma > 0 ? sigma * randNormal(random) : 0))
      guesses[n++] = g
      sum += g
    }
  }
  const mean = sum / N
  const target = p * mean
  const dist = [0, 0, 0, 0, 0]
  let winner = 0
  let best = Infinity
  n = 0
  for (let kind = 0; kind < 5; kind++) {
    let total = 0
    for (let c = 0; c < counts[kind]; c++) {
      const d = Math.abs(guesses[n] - target)
      total += d
      if (d < best) {
        best = d
        winner = n
      }
      n++
    }
    dist[kind] = counts[kind] ? total / counts[kind] : null
  }
  return { guesses, counts, mean, target, winner, winnerGuess: guesses[winner], winnerKind: kindOf(counts, winner), dist }
}

export function kindOf(counts, index) {
  let upto = 0
  for (let kind = 0; kind < 5; kind++) {
    upto += counts[kind]
    if (index < upto) return kind
  }
  return 4
}

// Where a guess of the reader's would have come among the N others: 1 = the
// closest to the target. The reader's guess does not move the mean.
export function rankOf(round, guess) {
  const d = Math.abs(guess - round.target)
  let closer = 0
  for (const g of round.guesses) if (Math.abs(g - round.target) < d) closer++
  return closer + 1
}

// The guesses in `bins` classes of equal width, one row of counts per kind.
export function histogram(round, bins = 50) {
  const h = Array.from({ length: 5 }, () => new Array(bins).fill(0))
  let n = 0
  for (let kind = 0; kind < 5; kind++) {
    for (let c = 0; c < round.counts[kind]; c++) {
      h[kind][Math.min(bins - 1, Math.floor((round.guesses[n++] / 100) * bins))]++
    }
  }
  return h
}

// The first round with a given seed.
export function firstRound({ N, shares, p, sigma, seed = ROUND_SEED }) {
  return playRound(mulberry32(seed), { counts: countsOf(N, shares), p, sigma })
}

// A sequence of rounds: the first one, then "Play again" as often as asked.
// Each later round takes the mean of the one before as its reference point.
export function playSequence({ N, shares, p, sigma, rounds, seed = ROUND_SEED }) {
  const random = mulberry32(seed)
  const counts = countsOf(N, shares)
  const out = [playRound(random, { counts, p, sigma })]
  while (out.length < rounds) {
    out.push(playRound(random, { counts, p, sigma, ref: out[out.length - 1].mean, first: false }))
  }
  return out
}

// The first round of a sequence whose mean is below `limit`, or null if none
// within `max` rounds.
export function sequenceBelow(cfg, limit = 1, max = 200) {
  const seq = playSequence({ ...cfg, rounds: max })
  const i = seq.findIndex((r) => r.mean < limit)
  return i < 0 ? null : i + 1
}

// "Play 1,000 times": many independent first rounds, as a job for
// useExperiment. The snapshot gives, per kind, the number of wins and the
// mean distance from the target, with the means of mean and target.
export function manyJob({ N, shares, p, sigma, runs = DEFAULTS.runs, seed = MANY_SEED }) {
  const random = mulberry32(seed)
  const counts = countsOf(N, shares)
  const wins = [0, 0, 0, 0, 0]
  const dist = [0, 0, 0, 0, 0]
  let sumMean = 0
  let sumTarget = 0
  let done = 0
  function* iter() {
    while (done < runs) {
      const r = playRound(random, { counts, p, sigma })
      wins[r.winnerKind]++
      for (let k = 0; k < 5; k++) if (r.dist[k] != null) dist[k] += r.dist[k]
      sumMean += r.mean
      sumTarget += r.target
      done++
      yield done / runs
    }
  }
  return {
    iter: iter(),
    snapshot: () => ({
      done,
      runs,
      counts,
      wins: [...wins],
      dist: dist.map((d, k) => (counts[k] && done ? d / done : null)),
      mean: done ? sumMean / done : null,
      target: done ? sumTarget / done : null,
    }),
  }
}

export function playMany(cfg) {
  const job = manyJob(cfg)
  for (const _ of job.iter); // eslint-disable-line no-unused-vars, no-empty
  return job.snapshot()
}

// -------------------------------------------------- Whole numbers only

// Everyone says 1 except one player, who says k. Whole numbers, and the
// closest guesses share a prize of 1. Returns what the mover gets: 1 alone,
// 1/N when every guess is equally close, 0 otherwise.
export function moverPayoff(N, k, p = 2 / 3) {
  if (k === 1) return 1 / N
  const target = (p * (N - 1 + k)) / N
  const mine = Math.abs(k - target)
  const theirs = Math.abs(1 - target)
  if (Math.abs(mine - theirs) < 1e-12) return 1 / N
  return mine < theirs ? 1 : 0
}

// 'stable' when no move to another whole number from 0 to 100 pays more than
// staying, 'tie' when some move pays exactly the same and none pays more,
// 'unstable' when some move pays more.
export function allSayOne(N, p = 2 / 3) {
  let tie = false
  for (let k = 0; k <= 100; k++) {
    if (k === 1) continue
    const pay = moverPayoff(N, k, p)
    if (pay > 1 / N + 1e-12) return 'unstable'
    if (Math.abs(pay - 1 / N) < 1e-12) tie = true
  }
  return tie ? 'tie' : 'stable'
}
