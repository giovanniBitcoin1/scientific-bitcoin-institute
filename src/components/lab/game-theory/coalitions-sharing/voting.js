// Weighted voting, for Figure F2 and Panel B: players with integer weights
// and a quota; a coalition wins if its weights reach the quota. The
// Shapley–Shubik and Banzhaf indices are counted exactly by dynamic
// programming over integer weights: for each player, the number of
// coalitions of the others of each size and total weight. Counts are exact
// in ordinary numbers (at most 2^29 coalitions of 29 others); the indices are
// exact fractions on BigInt (module 08's frac.js).

import { frac, ZERO, add, mul, sum as fsum, toNumber } from '../congestion-price-of-anarchy/frac.js'

const factBig = (() => {
  const f = [1n]
  for (let i = 1; i <= 40; i++) f.push(f[i - 1] * BigInt(i))
  return f
})()

// table[k][w]: subsets of `weights` with k members and total weight w.
function countTable(weights, W) {
  const n = weights.length
  const table = Array.from({ length: n + 1 }, () => new Float64Array(W + 1))
  table[0][0] = 1
  weights.forEach((wi, t) => {
    for (let k = t; k >= 0; k--) {
      const from = table[k]
      const to = table[k + 1]
      for (let w = W - wi; w >= 0; w--) if (from[w]) to[w + wi] += from[w]
    }
  })
  return table
}

// The same table without player i: c'[k][w] = c[k][w] − c'[k − 1][w − w_i].
function without(table, wi, n, W) {
  const out = Array.from({ length: n }, () => new Float64Array(W + 1))
  for (let k = 0; k < n; k++) {
    for (let w = 0; w <= W; w++) {
      let c = table[k][w]
      if (k > 0 && w >= wi) c -= out[k - 1][w - wi]
      out[k][w] = c
    }
  }
  return out
}

// swings[i][k]: coalitions S of the others with |S| = k that lose without i
// and win with i (w(S) < q ≤ w(S) + w_i).
export function swingCounts(weights, quota) {
  const n = weights.length
  const W = weights.reduce((s, w) => s + w, 0)
  const table = countTable(weights, W)
  return weights.map((wi) => {
    const t = without(table, wi, n, W)
    const lo = Math.max(0, quota - wi)
    const hi = Math.min(W, quota - 1)
    return Array.from({ length: n }, (_, k) => {
      let s = 0
      for (let w = lo; w <= hi; w++) s += t[k][w]
      return s
    })
  })
}

export function powerIndices(weights, quota) {
  const n = weights.length
  const W = weights.reduce((s, w) => s + w, 0)
  const sw = swingCounts(weights, quota)
  const nf = factBig[n]
  const ss = sw.map((row) => {
    let num = 0n
    row.forEach((c, k) => {
      if (c) num += BigInt(c) * factBig[k] * factBig[n - 1 - k]
    })
    return frac(num, nf)
  })
  const swings = sw.map((row) => row.reduce((s, c) => s + c, 0))
  const totalSwings = swings.reduce((s, c) => s + c, 0)
  const banzhaf = swings.map((c) => (totalSwings ? frac(c, totalSwings) : ZERO))
  const absolute = swings.map((c) => frac(BigInt(c), 1n << BigInt(n - 1)))
  return { n, W, quota, ss, swings, banzhaf, absolute, totalSwings, needed: largestNeeded(weights, quota) }
}

// How many of the largest players it takes to reach the quota (null if all
// of them together do not).
export function largestNeeded(weights, quota) {
  const sorted = [...weights].sort((a, b) => b - a)
  let s = 0
  for (let k = 0; k < sorted.length; k++) {
    s += sorted[k]
    if (s >= quota) return k + 1
  }
  return null
}

// Split the largest player (the first, if several tie) into two with half
// its weight each, rounded down and up, in its place.
export function splitLargest(players) {
  let at = 0
  players.forEach((p, i) => {
    if (p.weight > players[at].weight) at = i
  })
  const p = players[at]
  const lo = Math.floor(p.weight / 2)
  const hi = p.weight - lo
  return [...players.slice(0, at), { ...p, weight: lo, name: `${p.name}a`, split: true }, { ...p, weight: hi, name: `${p.name}b`, split: true }, ...players.slice(at + 1)]
}

// By enumeration, for the self-check: every coalition of the others.
export function powerByEnumeration(weights, quota) {
  const n = weights.length
  const nf = factBig[n]
  const ss = []
  const swings = []
  for (let i = 0; i < n; i++) {
    let num = 0n
    let c = 0
    for (let m = 0; m < 1 << n; m++) {
      if (m & (1 << i)) continue
      let w = 0
      let k = 0
      for (let j = 0; j < n; j++) {
        if (m & (1 << j)) {
          w += weights[j]
          k++
        }
      }
      if (w < quota && w + weights[i] >= quota) {
        c++
        num += factBig[k] * factBig[n - 1 - k]
      }
    }
    ss.push(frac(num, nf))
    swings.push(c)
  }
  return { ss, swings }
}

// ---- Presets

export const COUNCIL_1958 = [
  { key: 'FR', weight: 4 }, { key: 'DE', weight: 4 }, { key: 'IT', weight: 4 },
  { key: 'BE', weight: 2 }, { key: 'NL', weight: 2 }, { key: 'LU', weight: 1 },
]
export const COUNCIL_NAMES = {
  en: { FR: 'France', DE: 'Germany', IT: 'Italy', BE: 'Belgium', NL: 'Netherlands', LU: 'Luxembourg' },
  it: { FR: 'Francia', DE: 'Germania', IT: 'Italia', BE: 'Belgio', NL: 'Paesi Bassi', LU: 'Lussemburgo' },
}
export const COUNCIL_WEIGHTS = COUNCIL_1958.map((p) => p.weight)
export const POOL_SHARES = [26, 19, 19, 8, 8, ...Array(20).fill(1)]
export const POOL_QUOTAS = [26, 34, 51, 67]

export const VOTING_PRESETS = {
  council: { players: COUNCIL_1958.map((p) => ({ name: p.key, weight: p.weight })), quota: 12 },
  parties: { players: [{ name: 'A', weight: 49 }, { name: 'B', weight: 49 }, { name: 'C', weight: 2 }], quota: 51 },
  pools: { players: POOL_SHARES.map((w, i) => ({ name: `P${i + 1}`, weight: w })), quota: 51 },
}
export const MAX_PLAYERS = 30

export const asNumbers = (xs) => xs.map(toNumber)
export const total = (xs) => fsum(xs)
export { add, mul }
