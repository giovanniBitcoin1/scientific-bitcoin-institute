import { mulberry32 } from '../../rng.js'
import { makeGame, range } from '../what-is-a-game/games.js'
import { randomGame, seedOf, SURVEY_SEED } from '../what-is-a-game/randomgames.js'
import { stableCells } from '../what-is-a-game/games.js'

// Every equilibrium of a two-player game, pure and mixed, by support
// enumeration: for every pair of supports of equal size, solve the two
// linear systems that make the strategies in each support equally good
// against the other player's mix; keep the pair if every probability is
// positive and no strategy outside the support pays more. In a
// nondegenerate game this finds every equilibrium. Pure logic, shared by
// Panel A, Figure F1 and scripts/lab/check-game-theory-03.mjs.
//
// A game is { rows, cols, a, b } as in module 01. A mixed strategy is an
// array of probabilities, one per strategy.

export const EPS = 1e-9
export const TABLE_SEED = 7100 // the tables drawn by "New game"
export const DEFAULT_TABLE_SIZE = 3
export const SURVEY_SIZES = [2, 3, 4]
export const DEFAULT_GAMES = 2000

// Solve M x = r by Gaussian elimination with partial pivoting; null when
// the matrix is singular (no single solution).
export function solve(M, r) {
  const n = M.length
  const A = M.map((row, i) => [...row, r[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let i = c + 1; i < n; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i
    if (Math.abs(A[p][c]) < 1e-12) return null
    if (p !== c) [A[p], A[c]] = [A[c], A[p]]
    for (let i = c + 1; i < n; i++) {
      const f = A[i][c] / A[c][c]
      if (f === 0) continue
      for (let k = c; k <= n; k++) A[i][k] -= f * A[c][k]
    }
  }
  const x = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let s = A[i][n]
    for (let k = i + 1; k < n; k++) s -= A[i][k] * x[k]
    x[i] = s / A[i][i]
  }
  return x
}

export function subsets(n, k) {
  const out = []
  const pick = (start, acc) => {
    if (acc.length === k) return out.push([...acc])
    for (let i = start; i < n; i++) pick(i + 1, [...acc, i])
  }
  pick(0, [])
  return out
}

// Payoff of each pure strategy of a player against the other's mix.
// M[i][j] is the player's payoff when it plays i and the other j.
const against = (M, y) => M.map((row) => row.reduce((s, v, j) => s + v * y[j], 0))
const transpose = (M) => M[0].map((_, j) => M.map((row) => row[j]))

export const rowPayoffs = (g, y) => against(g.a, y)
export const colPayoffs = (g, x) => against(transpose(g.b), x)
export const expected = (M, x, y) => x.reduce((s, xi, i) => s + xi * M[i].reduce((t, v, j) => t + v * y[j], 0), 0)

// The mix on `support` (of the other player's strategies, n in all) that
// makes the player's strategies in `own` equally good. M is the player's
// payoff matrix (own strategy first). Returns { mix, value } or null.
function indifference(M, own, support, n) {
  const k = own.length
  const A = []
  const r = []
  for (const i of own) {
    A.push([...support.map((j) => M[i][j]), -1])
    r.push(0)
  }
  A.push([...support.map(() => 1), 0])
  r.push(1)
  const s = solve(A, r)
  if (!s) return null
  const mix = new Array(n).fill(0)
  support.forEach((j, t) => (mix[j] = s[t]))
  return { mix, value: s[k] }
}

// All equilibria. Each is { x, y, u, v, rows, cols }: the two mixes, the
// expected payoffs of the row and of the column player, the supports.
// `degenerate` is true when some system had no single solution, or some
// strategy outside a support ties with it at an equilibrium, or a pure
// strategy has two best replies: then the list may be incomplete.
export function allEquilibria(g) {
  const m = g.a.length
  const n = g.a[0].length
  const B = transpose(g.b) // B[j][i]: column player's payoff
  const out = []
  let degenerate = false
  for (let k = 1; k <= Math.min(m, n); k++) {
    for (const S of subsets(m, k)) {
      for (const T of subsets(n, k)) {
        const col = indifference(g.a, S, T, n) // the column mix y that leaves the row player indifferent on S
        const row = indifference(B, T, S, m) // the row mix x that leaves the column player indifferent on T
        if (!col || !row) {
          degenerate = true
          continue
        }
        const { mix: y, value: u } = col
        const { mix: x, value: v } = row
        if (S.some((i) => !(x[i] > EPS)) || T.some((j) => !(y[j] > EPS))) continue
        const pr = rowPayoffs(g, y)
        const pc = colPayoffs(g, x)
        if (pr.some((p) => p > u + EPS) || pc.some((p) => p > v + EPS)) continue
        // Ties outside the support: the game is degenerate.
        if (pr.filter((p) => Math.abs(p - u) <= EPS).length > k || pc.filter((p) => Math.abs(p - v) <= EPS).length > k) degenerate = true
        out.push({ x, y, u, v, rows: S, cols: T })
      }
    }
  }
  if (!degenerate && pureTies(g)) degenerate = true
  return { list: out, degenerate }
}

// A pure strategy with two best replies.
export function pureTies(g) {
  for (const row of g.b) {
    const best = Math.max(...row)
    if (row.filter((p) => p === best).length > 1) return true
  }
  for (let j = 0; j < g.a[0].length; j++) {
    const col = g.a.map((r) => r[j])
    const best = Math.max(...col)
    if (col.filter((p) => p === best).length > 1) return true
  }
  return false
}

export const equilibria = (g) => allEquilibria(g).list

// Is (x, y) an equilibrium? Nobody gains more than tol by a pure deviation.
export function isEquilibrium(g, x, y, tol = 1e-9) {
  const u = expected(g.a, x, y)
  const v = expected(g.b, x, y)
  return Math.max(...rowPayoffs(g, y)) <= u + tol && Math.max(...colPayoffs(g, x)) <= v + tol
}

// ------------------------------------------------------------------ Tables

// A random m × m table with whole payoffs 0–9, redrawn until it is
// nondegenerate. The generator of (m, index) always starts from the same
// seed; `draws` counts the tables thrown away.
export function tableOf(m, index = 0, seed = TABLE_SEED) {
  const random = mulberry32(seed + 1000 * m + index)
  for (let draws = 0; ; draws++) {
    const cells = range(m).map(() => range(m).map(() => [Math.floor(random() * 10), Math.floor(random() * 10)]))
    const g = makeGame(range(m).map((i) => String(i + 1)), range(m).map((j) => String.fromCharCode(65 + j)), cells)
    if (!pureTies(g) && !allEquilibria(g).degenerate) return { ...g, draws }
  }
}

// ------------------------------------------------------------------ Fractions

// p as a simple fraction when it is one (denominator up to 20), else null.
export function fraction(p, maxDen = 20) {
  for (let d = 1; d <= maxDen; d++) {
    const n = Math.round(p * d)
    if (Math.abs(p - n / d) < 1e-9) return { n, d }
  }
  return null
}

// How a probability or a payoff is written on the page.
export function showNumber(p, digits = 3, lang = 'en') {
  const f = fraction(p)
  let s
  if (f) s = f.d === 1 ? String(f.n) : `${f.n}/${f.d}`
  else s = p.toFixed(digits)
  return lang === 'it' ? s.replace('.', ',') : s
}

// ------------------------------------------------------------------ Survey

// Random games with payoffs uniform on 0–1, the same games as module 01's
// survey (randomgames.js, same seeds): how many equilibria they have, and
// how many have no pure one. snapshot() → { [m]: shares }.
function tally() {
  return { games: 0, total: 0, counts: {}, noPure: 0, even: 0, degenerate: 0 }
}

export function shares(t) {
  const n = t.games || 1
  const c = (k) => (t.counts[k] || 0) / n
  const seven = Object.entries(t.counts).reduce((s, [k, v]) => s + (Number(k) >= 7 ? v : 0), 0) / n
  return { games: t.games, mean: t.total / n, one: c(1), three: c(3), five: c(5), sevenUp: seven, fiveUp: c(5) + seven, noPure: t.noPure / n, even: t.even, degenerate: t.degenerate, counts: t.counts }
}

export function surveyJob({ sizes = SURVEY_SIZES, games = DEFAULT_GAMES, seed = SURVEY_SEED }) {
  const tallies = Object.fromEntries(sizes.map((m) => [m, tally()]))
  const total = sizes.length * games
  let done = 0
  function* iter() {
    for (const m of sizes) {
      const random = mulberry32(seedOf(m, seed))
      const t = tallies[m]
      for (let k = 0; k < games; k++) {
        const g = randomGame(random, m)
        const { list, degenerate } = allEquilibria(g)
        const e = list.length
        t.games++
        t.total += e
        t.counts[e] = (t.counts[e] || 0) + 1
        if (e % 2 === 0) t.even++
        if (degenerate) t.degenerate++
        if (stableCells(g).length === 0) t.noPure++
        done++
        if (done % 10 === 0) yield done / total
      }
    }
  }
  return {
    iter: iter(),
    snapshot: () => Object.fromEntries(sizes.map((m) => [m, shares(tallies[m])])),
  }
}

export function survey(cfg) {
  const job = surveyJob(cfg)
  for (const _ of job.iter); // eslint-disable-line no-unused-vars, no-empty
  return job.snapshot()
}
