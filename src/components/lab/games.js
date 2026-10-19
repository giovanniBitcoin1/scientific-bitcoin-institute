// Game theory for Module 11: the Prisoner's Dilemma and its iterated version,
// round-robin tournaments between strategies, discrete replicator dynamics,
// the Nowak–May spatial game and the volunteer's dilemma.
//
// Moves are C = 0 (cooperate) and D = 1 (defect). Payoffs follow the usual
// letters: T temptation, R reward, P punishment, S sucker's payoff.

import { mulberry32 } from './rng.js'

export const C = 0
export const D = 1

export const DEFAULT_PAYOFFS = { T: 5, R: 3, P: 1, S: 0 }

// The two Prisoner's Dilemma conditions: T > R > P > S, and 2R > T + S (so
// taking turns at exploiting each other pays less than cooperating).
export function checkPayoffs({ T, R, P, S }) {
  const order = T > R && R > P && P > S
  const alternation = 2 * R > T + S
  return { order, alternation, ok: order && alternation }
}

// table[my move][their move] = my payoff.
export function payoffTable({ T, R, P, S }) {
  return [
    [R, S],
    [T, P],
  ]
}

// ---------------------------------------------------------------- strategies

// A strategy picks its intended move from what it has seen so far:
//   h.t        the round, from 0
//   h.my1      its own actual move last round
//   h.opp1     the opponent's actual move last round
//   h.opp2     the opponent's actual move two rounds back
//   h.oppEverD whether the opponent has ever defected
// `nice` strategies never defect first (without noise).
export const STRATEGIES = [
  { id: 'allc', nice: true, move: () => C },
  { id: 'alld', nice: false, move: () => D },
  { id: 'tft', nice: true, move: (h) => (h.t === 0 ? C : h.opp1) },
  // Generous Tit for Tat: after a defection, forgives with probability `generosity`.
  { id: 'gtft', nice: true, move: (h, random, o) => (h.t === 0 || h.opp1 === C || random() < o.generosity ? C : D) },
  { id: 'tf2t', nice: true, move: (h) => (h.t >= 2 && h.opp1 === D && h.opp2 === D ? D : C) },
  { id: 'grim', nice: true, move: (h) => (h.oppEverD ? D : C) },
  // Win-Stay, Lose-Shift: repeat the last move after T or R, switch after P or S;
  // that is, cooperate exactly when both players made the same move last round.
  { id: 'wsls', nice: true, move: (h) => (h.t === 0 || h.my1 === h.opp1 ? C : D) },
  { id: 'random', nice: false, move: (h, random) => (random() < 0.5 ? C : D) },
  { id: 'stft', nice: false, move: (h) => (h.t === 0 ? D : h.opp1) },
  // Joss: Tit for Tat that, when it would cooperate, defects with probability `sneak`.
  { id: 'joss', nice: false, move: (h, random, o) => (h.t > 0 && h.opp1 === D ? D : random() < o.sneak ? D : C) },
]

export const STRATEGY_IDS = STRATEGIES.map((s) => s.id)
const byId = Object.fromEntries(STRATEGIES.map((s, k) => [s.id, { ...s, index: k }]))

export const DEFAULT_OPTIONS = {
  payoffs: DEFAULT_PAYOFFS,
  rounds: 200, // fixed match length, used when w = 0
  w: 0, // continuation probability: if > 0, match lengths are random with mean 1 / (1 − w)
  noise: 0, // probability ε that an intended move is flipped
  generosity: 1 / 3,
  sneak: 0.1,
  reps: 5,
  seed: 1,
}

const MAX_ROUNDS = 20000

// A random match length: after each round the game goes on with probability w.
export function matchLength(w, random) {
  if (!(w > 0)) return 0
  const n = 1 + Math.floor(Math.log(1 - random()) / Math.log(w))
  return Math.min(MAX_ROUNDS, n)
}

const newSeen = () => ({ t: 0, my1: C, opp1: C, opp2: C, oppEverD: false })

function see(h, mine, theirs) {
  h.opp2 = h.opp1
  h.opp1 = theirs
  h.my1 = mine
  if (theirs === D) h.oppEverD = true
  h.t++
}

// One match of `rounds` rounds between strategies a and b (ids). Each
// intended move is flipped with probability o.noise; both players see the
// moves actually made. With `record`, the moves are returned too.
export function playMatch(a, b, rounds, o, random, record = false) {
  const sa = byId[a]
  const sb = byId[b]
  const table = payoffTable(o.payoffs)
  const ha = newSeen()
  const hb = newSeen()
  const movesA = record ? new Uint8Array(rounds) : null
  const movesB = record ? new Uint8Array(rounds) : null
  let scoreA = 0
  let scoreB = 0
  for (let t = 0; t < rounds; t++) {
    let ma = sa.move(ha, random, o)
    let mb = sb.move(hb, random, o)
    if (o.noise > 0) {
      if (random() < o.noise) ma = 1 - ma
      if (random() < o.noise) mb = 1 - mb
    }
    scoreA += table[ma][mb]
    scoreB += table[mb][ma]
    see(ha, ma, mb)
    see(hb, mb, ma)
    if (record) {
      movesA[t] = ma
      movesB[t] = mb
    }
  }
  return { scoreA, scoreB, rounds, movesA, movesB }
}

// Seed of one match, from the tournament seed, the repetition and the two
// strategies' places in the full library: adding or removing an entrant
// leaves every other match unchanged.
function matchSeed(seed, rep, i, j) {
  return (Math.imul(seed, 0x9e3779b1) ^ Math.imul(rep + 1, 0x85ebca6b) ^ Math.imul(i * 64 + j + 1, 0xc2b2ae35)) >>> 0
}

// Length of every match in repetition `rep`: o.rounds, or drawn at random
// (the same for all matches of that repetition) when o.w > 0.
export function repLength(o, rep) {
  return o.w > 0 ? matchLength(o.w, mulberry32(matchSeed(o.seed, rep, 63, 63))) : o.rounds
}

// The match between a and b in repetition `rep`, exactly as the tournament plays it.
export function tournamentMatch(a, b, o, rep = 0, record = false) {
  const random = mulberry32(matchSeed(o.seed, rep, byId[a].index, byId[b].index))
  return playMatch(a, b, repLength(o, rep), o, random, record)
}

// Round robin among `ids`: every pair plays, and every strategy also plays
// a copy of itself (its score there is the mean of the two copies). Repeated
// o.reps times. Returns
//   matrix[i][j]  mean payoff per round to ids[i] against ids[j];
//   scores[i]     mean payoff per round over all its matches, self-play included;
//   ranking       indices into ids, best first.
export function runTournament(ids, o) {
  const n = ids.length
  const matrix = Array.from({ length: n }, () => new Array(n).fill(0))
  for (let rep = 0; rep < o.reps; rep++) {
    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        const m = tournamentMatch(ids[i], ids[j], o, rep)
        if (i === j) matrix[i][i] += (m.scoreA + m.scoreB) / (2 * m.rounds)
        else {
          matrix[i][j] += m.scoreA / m.rounds
          matrix[j][i] += m.scoreB / m.rounds
        }
      }
    }
  }
  for (const row of matrix) for (let j = 0; j < n; j++) row[j] /= o.reps
  const scores = matrix.map((row) => row.reduce((s, v) => s + v, 0) / n)
  const ranking = scores.map((_, i) => i).sort((a, b) => scores[b] - scores[a] || a - b)
  return { ids: ids.slice(), matrix, scores, ranking }
}

// ---------------------------------------------------------------- replicator dynamics

// One generation of the discrete replicator equation x_i ← x_i f_i / f̄,
// with f_i = Σ_j A_ij x_j the mean payoff of strategy i against the population.
export function replicatorStep(x, A) {
  const n = x.length
  const f = new Array(n).fill(0)
  let mean = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) f[i] += A[i][j] * x[j]
    mean += x[i] * f[i]
  }
  if (!(mean > 0)) return x.slice()
  return x.map((xi, i) => (xi * f[i]) / mean)
}

// ---------------------------------------------------------------- Nowak–May spatial game

// An n × n torus of cooperators and defectors. Each cell plays the
// one-shot game with the 9 cells of its Moore neighbourhood, itself
// included, with R = 1, T = b, P = S = 0: a cooperator earns the number of
// cooperators around it, a defector b times that number. Then, all at once,
// every cell copies the strategy of the highest scorer among those 9 cells.
// Ties: a cell that is among the top scorers keeps its strategy; otherwise
// it takes the top scorers' strategy, cooperation if they disagree.
export function createSpatial(n, start, coopShare, random) {
  const g = {
    n,
    s: new Uint8Array(n * n),
    prev: new Uint8Array(n * n),
    pay: new Float64Array(n * n),
    next: new Uint8Array(n * n),
    t: 0,
  }
  if (start === 'defector') g.s[((n - 1) >> 1) * n + ((n - 1) >> 1)] = D
  else for (let k = 0; k < n * n; k++) g.s[k] = random() < coopShare ? C : D
  g.prev.set(g.s)
  return g
}

export function spatialStep(g, b) {
  const { n, s, pay, next } = g
  const nb = new Int32Array(9)
  const fill = (x, y) => {
    let q = 0
    for (let dy = -1; dy <= 1; dy++) {
      const row = ((y + dy + n) % n) * n
      for (let dx = -1; dx <= 1; dx++) nb[q++] = row + ((x + dx + n) % n)
    }
  }
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      fill(x, y)
      let c = 0
      for (let q = 0; q < 9; q++) if (s[nb[q]] === C) c++
      const k = y * n + x
      pay[k] = s[k] === C ? c : b * c
    }
  }
  const eps = 1e-9
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      fill(x, y)
      let best = -Infinity
      for (let q = 0; q < 9; q++) if (pay[nb[q]] > best) best = pay[nb[q]]
      const k = y * n + x
      if (pay[k] >= best - eps) {
        next[k] = s[k]
        continue
      }
      let anyC = false
      for (let q = 0; q < 9; q++) if (pay[nb[q]] >= best - eps && s[nb[q]] === C) anyC = true
      next[k] = anyC ? C : D
    }
  }
  g.prev.set(s)
  s.set(next)
  g.t++
}

export function coopShare(g) {
  let c = 0
  for (let k = 0; k < g.s.length; k++) if (g.s[k] === C) c++
  return c / g.s.length
}

// ---------------------------------------------------------------- volunteer's dilemma

// N players; each may volunteer at cost c. If nobody does, everyone loses a
// (c < a). In the symmetric mixed equilibrium a player must be indifferent:
// −c = −a q^(N−1), where q is each player's probability of not volunteering,
// so q = (c / a)^(1 / (N − 1)) and nobody volunteers with probability
// q^N = (c / a)^(N / (N − 1)).
export function volunteerEquilibrium(c, a, N) {
  if (!(c < a)) return { q: 1, none: 1 }
  const q = (c / a) ** (1 / (N - 1))
  return { q, none: q ** N }
}

// Monte Carlo check: `trials` groups in which every player independently
// stays out with probability q. Returns the share of groups where nobody
// volunteered, and the share where none of players 2 … N did (so player 1,
// staying out, lost a): the free rider's expected payoff is −a times it.
export function volunteerMonteCarlo(q, N, trials, random) {
  let none = 0
  let othersNone = 0
  for (let r = 0; r < trials; r++) {
    let others = true
    for (let i = 1; i < N && others; i++) if (random() >= q) others = false
    if (others) {
      othersNone++
      if (random() < q) none++
    }
  }
  return { none: none / trials, othersNone: othersNone / trials }
}
