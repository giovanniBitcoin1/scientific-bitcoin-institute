// Learning by regret, for Panel C: two players run multiplicative weights
// (Hedge) in one of module 01's two-by-two games, seeing only their own
// payoffs and the other's actions. Pure logic, shared by the page and
// scripts/lab/check-game-theory-07.mjs.
import { mulberry32 } from '../../rng.js'
import { CLASSICS, twoByTwo } from '../what-is-a-game/games.js'
import { violation } from './correlated.js'

export const HEDGE_GAMES = ['chicken', 'pennies', 'pd', 'stag', 'battle']

// The game's own payoffs as matrices a (row) and b (column), and each
// player's payoffs scaled to [0, 1]: minus his lowest, divided by his range.
export function hedgeGame(key) {
  const g = twoByTwo(CLASSICS[key])
  const scale = (m) => {
    const all = m.flat()
    const lo = Math.min(...all)
    const range = Math.max(...all) - lo
    return m.map((row) => row.map((v) => (v - lo) / range))
  }
  return { key, a: g.a, b: g.b, sa: scale(g.a), sb: scale(g.b) }
}

// The regret bound per round after t rounds for a learner who starts with
// probabilities (π, 1 − π): ln(1/min(π, 1 − π))/(ηt) + η/8. With the uniform
// start it is ln 2/(ηt) + η/8.
export const bound = (t, eta, pi = 0.5) => Math.log(1 / Math.min(pi, 1 - pi)) / (eta * t) + eta / 8
export const tunedEta = (T, n = 2) => Math.sqrt((8 * Math.log(n)) / T)
export const tunedBound = (T, n = 2) => Math.sqrt(Math.log(n) / (2 * T))

// One run of T rounds. p_t, q_t are the probabilities of each player's first
// action, from the weights. Both actions are drawn; each player multiplies
// the weight of each of his own actions by e^(η × its scaled payoff against
// the other's action). Regret after t rounds: the best single action's total
// against the other's actual actions, minus the sum of the player's expected
// payoffs under p_s (or q_s).
export function run(key, { T = 2000, eta = 0.1, p0 = 0.5, q0 = 0.5, seed = 1 } = {}) {
  const g = hedgeGame(key)
  const random = mulberry32(seed)
  const P = new Float64Array(T + 1)
  const Q = new Float64Array(T + 1)
  const regR = new Float64Array(T + 1) // average regret after t rounds
  const regC = new Float64Array(T + 1)
  let LR = [Math.log(p0), Math.log(1 - p0)] // log-weights
  let LC = [Math.log(q0), Math.log(1 - q0)]
  const cumR = [0, 0]
  const cumC = [0, 0]
  let expR = 0
  let expC = 0
  let realR = 0
  let realC = 0
  let scaledR = 0
  const counts = [[0, 0], [0, 0]]
  const prob = (L) => 1 / (1 + Math.exp(L[1] - L[0]))
  P[0] = p0
  Q[0] = q0
  for (let t = 1; t <= T; t++) {
    const p = prob(LR)
    const q = prob(LC)
    const i = random() < p ? 0 : 1
    const j = random() < q ? 0 : 1
    counts[i][j]++
    // What each own action would have earned against the other's action.
    const uR = [g.sa[0][j], g.sa[1][j]]
    const uC = [g.sb[i][0], g.sb[i][1]]
    cumR[0] += uR[0]
    cumR[1] += uR[1]
    cumC[0] += uC[0]
    cumC[1] += uC[1]
    expR += p * uR[0] + (1 - p) * uR[1]
    expC += q * uC[0] + (1 - q) * uC[1]
    realR += g.a[i][j]
    realC += g.b[i][j]
    scaledR += g.sa[i][j]
    LR = [LR[0] + eta * uR[0], LR[1] + eta * uR[1]]
    LC = [LC[0] + eta * uC[0], LC[1] + eta * uC[1]]
    regR[t] = (Math.max(cumR[0], cumR[1]) - expR) / t
    regC[t] = (Math.max(cumC[0], cumC[1]) - expC) / t
    P[t] = prob(LR)
    Q[t] = prob(LC)
  }
  const freq = counts.map((row) => row.map((c) => c / T))
  return {
    key,
    T,
    eta,
    p0,
    q0,
    seed,
    P,
    Q,
    regR,
    regC,
    counts,
    freq,
    final: [P[T], Q[T]],
    firstShare: [(counts[0][0] + counts[0][1]) / T, (counts[0][0] + counts[1][0]) / T],
    average: [realR / T, realC / T],
    averageScaledRow: scaledR / T,
    violation: violation(g.a, g.b, freq),
    bound: [bound(T, eta, p0), bound(T, eta, q0)],
  }
}

// The pure equilibria of the game, as corners (p, q) of the unit square, and
// the mixed one when there is one, from the game's own payoffs.
export function equilibria(key) {
  const { a, b } = hedgeGame(key)
  const pure = []
  for (const i of [0, 1]) for (const j of [0, 1]) if (a[i][j] >= a[1 - i][j] && b[i][j] >= b[i][1 - j]) pure.push([i === 0 ? 1 : 0, j === 0 ? 1 : 0])
  // Mixed: q makes the row player indifferent, p the column player.
  const dq = a[0][0] - a[1][0] - a[0][1] + a[1][1]
  const dp = b[0][0] - b[0][1] - b[1][0] + b[1][1]
  let mixed = null
  if (Math.abs(dq) > 1e-12 && Math.abs(dp) > 1e-12) {
    const q = (a[1][1] - a[0][1]) / dq
    const p = (b[1][1] - b[1][0]) / dp
    if (p > 0 && p < 1 && q > 0 && q < 1) mixed = [p, q]
  }
  return { pure, mixed }
}

// Distance of a point of the unit square from its centre.
export const fromCentre = ([p, q]) => Math.hypot(p - 0.5, q - 0.5)

// The nearest pure equilibrium to (p, q) and the distance to it.
export function nearestPure(key, pq) {
  const { pure } = equilibria(key)
  let best = null
  for (const e of pure) {
    const dist = Math.max(Math.abs(e[0] - pq[0]), Math.abs(e[1] - pq[1]))
    if (!best || dist < best.dist) best = { eq: e, dist }
  }
  return best
}
