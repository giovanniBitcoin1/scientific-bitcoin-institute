// The connections model of Jackson and Wolinsky (F2 and Panel C). Each link
// costs c to each end; a player gets δ^d from every player at distance d.
// Networks of up to 12 players are arrays of neighbour bitmasks. Plain
// JavaScript, checked by check-game-theory-09.mjs.
import { mulberry32 } from '../../rng.js'

export const STRICT = 1e-12 // "gains strictly": by more than this
export const MAX_STEPS = 20000

const bit = (i) => 1 << i
export const popcount = (m) => {
  let c = 0
  while (m) {
    m &= m - 1
    c++
  }
  return c
}

// ------------------------------------------------------------------ closed forms (F2)

export const thresholds = (n, delta) => ({ low: delta - delta * delta, mid: delta, high: delta + ((n - 2) * delta * delta) / 2 })

export const totals = (n, delta, c) => ({
  complete: n * (n - 1) * (delta - c),
  star: 2 * (n - 1) * (delta - c) + (n - 1) * (n - 2) * delta * delta,
  empty: 0,
})

// Which network is efficient (Jackson and Wolinsky's three regions).
export function efficientKind(n, delta, c) {
  const t = thresholds(n, delta)
  return c < t.low ? 'complete' : c < t.high ? 'star' : 'empty'
}

// F2's four regions: complete efficient and the only stable network; star
// efficient and stable; star efficient but not stable; empty efficient.
export function region(n, delta, c) {
  const t = thresholds(n, delta)
  if (c < t.low) return 'complete'
  if (c <= t.mid) return 'star-stable'
  if (c < t.high) return 'star-unstable'
  return 'empty'
}

// ------------------------------------------------------------------ networks as bitmasks

export const empty = (n) => new Array(n).fill(0)
export const complete = (n) => Array.from({ length: n }, (_, i) => ((1 << n) - 1) & ~bit(i))
export const starNet = (n, hub = 0) => Array.from({ length: n }, (_, i) => (i === hub ? ((1 << n) - 1) & ~bit(hub) : bit(hub)))
export function randomNet(n, p, rnd) {
  const nb = empty(n)
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (rnd() < p) {
        nb[i] |= bit(j)
        nb[j] |= bit(i)
      }
  return nb
}
export const linked = (nb, i, j) => ((nb[i] >> j) & 1) === 1
export const links = (nb) => nb.reduce((s, m) => s + popcount(m), 0) / 2
export const degrees = (nb) => nb.map(popcount)
export function toggle(nb, i, j) {
  const out = nb.slice()
  out[i] ^= bit(j)
  out[j] ^= bit(i)
  return out
}

// Player i's utility: Σ over the players she reaches of δ^distance, minus c
// per link.
export function utility(nb, i, delta, c) {
  let seen = bit(i)
  let front = bit(i)
  let w = 1
  let u = 0
  while (front) {
    w *= delta
    let next = 0
    for (let m = front; m; m &= m - 1) next |= nb[31 - Math.clz32(m & -m)]
    next &= ~seen
    u += w * popcount(next)
    seen |= next
    front = next
  }
  return u - c * popcount(nb[i])
}

export const totalUtility = (nb, delta, c) => nb.reduce((s, _, i) => s + utility(nb, i, delta, c), 0)

// What each end gains from having the link ij rather than not having it.
export function linkGains(nb, i, j, delta, c) {
  const withL = linked(nb, i, j) ? nb : toggle(nb, i, j)
  const without = linked(nb, i, j) ? toggle(nb, i, j) : nb
  return [utility(withL, i, delta, c) - utility(without, i, delta, c), utility(withL, j, delta, c) - utility(without, j, delta, c)]
}

// Does the pair ij want to change? 'cut' if linked and either end gains
// strictly by cutting; 'add' if not linked, neither loses and one gains
// strictly; otherwise null.
export function wants(nb, i, j, delta, c) {
  const [gi, gj] = linkGains(nb, i, j, delta, c)
  if (linked(nb, i, j)) return gi < -STRICT || gj < -STRICT ? 'cut' : null
  return gi >= -STRICT && gj >= -STRICT && (gi > STRICT || gj > STRICT) ? 'add' : null
}

export function pairwiseStable(nb, delta, c) {
  const n = nb.length
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (wants(nb, i, j, delta, c)) return false
  return true
}

// ------------------------------------------------------------------ the dynamics (Panel C)

// Run n: one generator from seed n draws the random start (if any), then
// the pairs of the steps.
export function startRun(n, start, seed) {
  const rnd = mulberry32(seed)
  const nb = start === 'complete' ? complete(n) : start === 'random' ? randomNet(n, 0.3, rnd) : empty(n)
  return { n, nb, rnd, steps: 0, changes: 0, adds: 0, cuts: 0, stable: null, capped: false, last: null }
}

// One step: a pair at random; cut or add as `wants` says. After a change
// (and at the first step) every pair is checked: the run ends when none
// wants to change, or after 20,000 steps.
export function step(run, delta, c) {
  if (run.stable || run.capped) return run
  const n = run.n
  if (run.stable === null && pairwiseStable(run.nb, delta, c)) return { ...run, stable: true }
  const pairs = (n * (n - 1)) / 2
  let k = Math.floor(run.rnd() * pairs)
  let i = 0
  while (k >= n - 1 - i) {
    k -= n - 1 - i
    i++
  }
  const j = i + 1 + k
  const w = wants(run.nb, i, j, delta, c)
  const next = { ...run, steps: run.steps + 1, last: { i, j, w } }
  if (w) {
    next.nb = toggle(run.nb, i, j)
    next.changes++
    if (w === 'add') next.adds++
    else next.cuts++
    next.stable = pairwiseStable(next.nb, delta, c) || false
  } else next.stable = false
  if (!next.stable && next.steps >= MAX_STEPS) next.capped = true
  return next
}

export function toTheEnd(run, delta, c) {
  let r = run
  while (!r.stable && !r.capped) r = step(r, delta, c)
  return r
}

// A whole run from its settings, and its summary.
export function runToEnd(n, delta, c, start, seed) {
  return summary(toTheEnd(startRun(n, start, seed), delta, c), delta, c)
}

export function summary(run, delta, c) {
  const n = run.n
  const deg = degrees(run.nb)
  const isStar = links(run.nb) === n - 1 && deg.filter((d) => d === n - 1).length === 1
  return {
    ...run,
    links: links(run.nb),
    degrees: deg.slice().sort((a, b) => b - a),
    total: totalUtility(run.nb, delta, c),
    efficient: Math.max(...Object.values(totals(n, delta, c))),
    isStar,
    isComplete: links(run.nb) === (n * (n - 1)) / 2,
    isEmpty: links(run.nb) === 0,
    oneLink: deg.some((d) => d === 1),
  }
}

// ------------------------------------------------------------------ brute force (the self-check)

// Every network on n ≤ 6 players: the largest total utility.
export function bruteEfficient(n, delta, c) {
  const pairs = []
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([i, j])
  let best = -Infinity
  for (let s = 0; s < 1 << pairs.length; s++) {
    const nb = empty(n)
    pairs.forEach(([i, j], k) => {
      if ((s >> k) & 1) {
        nb[i] |= bit(j)
        nb[j] |= bit(i)
      }
    })
    best = Math.max(best, totalUtility(nb, delta, c))
  }
  return best
}
