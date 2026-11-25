// Local public goods (Panel A): own effort and the neighbours' are perfect
// substitutes, δ = −1, so the best reply is x_i = max(0, 1 − Σ_j g_ij x_j).
// Specialized equilibria (some work 1, the others 0) are exactly the maximal
// independent sets; one is stable when every non-worker has at least two
// working neighbours. Plain JavaScript, checked by check-game-theory-09.mjs.
import { mulberry32 } from '../../rng.js'
import { reply } from './netgames.js'

export const DELTA = -1
export const TOL_MOVE = 1e-12 // "Best responses" stop when no effort moves by more
export const TOL_EQ = 1e-9 // a state is an equilibrium within this

const popcount = (m) => {
  let c = 0
  while (m) {
    m &= m - 1
    c++
  }
  return c
}
const members = (mask, n) => Array.from({ length: n }, (_, i) => i).filter((i) => (mask >> i) & 1)

// Every maximal independent set, as sorted lists of players (0-based), by
// size from the largest, then lexicographically.
export function maximalIndependentSets(g) {
  const nb = g.nbrs.map((l) => l.reduce((m, j) => m | (1 << j), 0))
  const out = []
  for (let s = 1; s < 1 << g.n; s++) {
    let ok = true
    for (let i = 0; i < g.n && ok; i++) if ((s >> i) & 1 && nb[i] & s) ok = false
    if (!ok) continue
    for (let i = 0; i < g.n && ok; i++) if (!((s >> i) & 1) && !(nb[i] & s)) ok = false // could be added
    if (ok) out.push(members(s, g.n))
  }
  return out.sort((a, b) => b.length - a.length || a.join(',').localeCompare(b.join(','), 'en', { numeric: true }))
}

// Stable: every player outside the set has at least two neighbours in it.
export function isStableSet(g, set) {
  const inS = new Set(set)
  return g.nbrs.every((l, i) => inS.has(i) || l.filter((j) => inS.has(j)).length >= 2)
}

export const effortsOf = (g, set) => Array.from({ length: g.n }, (_, i) => (set.includes(i) ? 1 : 0))

// The list of Panel A: each set with its total effort and its mark.
export function specializedEquilibria(g) {
  return maximalIndependentSets(g).map((s) => ({ set: s, total: s.length, stable: isStableSet(g, s) }))
}

// What the readouts say about a state x.
export function classify(g, x) {
  const specialized = x.every((v) => Math.abs(v) <= TOL_EQ || Math.abs(v - 1) <= TOL_EQ)
  const gap = Math.max(...x.map((v, i) => Math.abs(v - reply(g, DELTA, x, i))))
  const equilibrium = gap <= TOL_EQ
  const workers = x.map((v, i) => (v > 0.5 ? i : -1)).filter((i) => i >= 0)
  const stable = specialized && equilibrium && isStableSet(g, workers)
  return { total: x.reduce((s, v) => s + v, 0), specialized, equilibrium, stable, gap, workers: specialized ? workers : null }
}

// Run n of "Best responses": efforts uniform on [0, 1] from seed n, then
// players 1 to n in turn until no effort moves by more than 1e-12.
export function randomStart(g, seed) {
  const rnd = mulberry32(seed)
  return Array.from({ length: g.n }, () => rnd())
}

export function bestResponseRun(g, seed, maxTurns = 1000000) {
  const x = randomStart(g, seed)
  const x0 = x.slice()
  let turns = 0
  let updates = 0
  for (;;) {
    turns++
    let moved = 0
    for (let i = 0; i < g.n; i++) {
      const v = reply(g, DELTA, x, i)
      const d = Math.abs(v - x[i])
      if (d > 0) updates++
      moved = Math.max(moved, d)
      x[i] = v
    }
    if (moved <= TOL_MOVE || turns >= maxTurns) break
  }
  return { x0, x, turns, updates, ...classify(g, x) }
}

// Same key for the same set of workers (used to tally the runs).
export const setKey = (set) => (set ? `{${set.map((i) => i + 1).join(', ')}}` : 'not specialized')

export { popcount }
