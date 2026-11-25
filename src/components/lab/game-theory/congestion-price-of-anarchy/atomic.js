import { mulberry32 } from '../../rng.js'
import { frac, fromDecimal, add, sub, mul, cmp, lt, eq, sum, ZERO, ONE } from './frac.js'

// Atomic congestion games (Panels B and C). A game is
//   { resources: [{ id, cost(k) }], players: [{ strategies: [[resource indices]] }] }
// where cost(k) is the exact cost (a fraction, frac.js) that EACH user of
// the resource pays when k players use it. A profile is one strategy index
// per player.
//
// Rosenthal's potential Φ = Σ_e (c_e(1) + ... + c_e(n_e)). When one player
// switches, Φ changes by exactly his own change in cost; the self-check
// verifies it at every switch.

const memo = (f) => {
  const m = new Map()
  return (k) => {
    if (!m.has(k)) m.set(k, f(k))
    return m.get(k)
  }
}

export function makeGame(resources, players) {
  return { resources: resources.map((r) => ({ ...r, cost: memo(r.cost) })), players }
}

export function loads(game, profile) {
  const n = new Array(game.resources.length).fill(0)
  profile.forEach((s, i) => {
    for (const e of game.players[i].strategies[s]) n[e]++
  })
  return n
}

// What player i pays now.
export function playerCost(game, profile, i, n = loads(game, profile)) {
  return sum(game.players[i].strategies[profile[i]].map((e) => game.resources[e].cost(n[e])))
}

// What player i would pay on strategy s, the others staying put.
export function costIfSwitch(game, profile, i, s, n = loads(game, profile)) {
  const now = new Set(game.players[i].strategies[profile[i]])
  return sum(game.players[i].strategies[s].map((e) => game.resources[e].cost(n[e] + (now.has(e) ? 0 : 1))))
}

export function totalCost(game, profile, n = loads(game, profile)) {
  let t = ZERO
  n.forEach((k, e) => {
    if (k) t = add(t, mul(frac(k), game.resources[e].cost(k)))
  })
  return t
}

export function potential(game, profile, n = loads(game, profile)) {
  let p = ZERO
  n.forEach((k, e) => {
    for (let j = 1; j <= k; j++) p = add(p, game.resources[e].cost(j))
  })
  return p
}

// Player i's best strictly cheaper strategy, or null. Ties go to the
// lowest strategy index (upper, lower, zigzag in Braess's network).
export function bestSwitch(game, profile, i, n = loads(game, profile)) {
  const cur = playerCost(game, profile, i, n)
  let best = null
  let bestCost = cur
  game.players[i].strategies.forEach((_, s) => {
    if (s === profile[i]) return
    const c = costIfSwitch(game, profile, i, s, n)
    if (lt(c, bestCost)) {
      best = s
      bestCost = c
    }
  })
  return best === null ? null : { to: best, from: profile[i], before: cur, after: bestCost, gain: sub(cur, bestCost) }
}

export const isEquilibrium = (game, profile) => {
  const n = loads(game, profile)
  return game.players.every((_, i) => bestSwitch(game, profile, i, n) === null)
}

// Best-response dynamics, players 1 to n in turn. A state carries the
// profile, the next player to look at and how many in a row have not
// switched; the dynamics end after a full turn with no switch.
export const startState = (profile) => ({ profile: [...profile], next: 0, quiet: 0, done: false, switches: 0 })

export function oneSwitch(game, state) {
  if (state.done) return { state, move: null }
  const m = game.players.length
  let { next, quiet } = state
  const profile = [...state.profile]
  while (quiet < m) {
    const i = next
    next = (next + 1) % m
    const n = loads(game, profile)
    const sw = bestSwitch(game, profile, i, n)
    if (sw) {
      const phiBefore = potential(game, profile, n)
      profile[i] = sw.to
      const phiAfter = potential(game, profile)
      const move = { player: i, ...sw, phiBefore, phiAfter, drop: sub(phiBefore, phiAfter) }
      return { state: { profile, next, quiet: 0, done: false, switches: state.switches + 1 }, move }
    }
    quiet++
  }
  return { state: { profile, next, quiet, done: true, switches: state.switches }, move: null }
}

export function toTheEnd(game, state, limit = 100000) {
  const moves = []
  let s = state
  for (let k = 0; k < limit && !s.done; k++) {
    const r = oneSwitch(game, s)
    s = r.state
    if (r.move) moves.push(r.move)
  }
  return { state: s, moves }
}

// Every profile, for small games (the check and the four drivers).
export function* allProfiles(game) {
  const sizes = game.players.map((p) => p.strategies.length)
  const prof = new Array(sizes.length).fill(0)
  while (true) {
    yield [...prof]
    let i = sizes.length - 1
    while (i >= 0 && ++prof[i] === sizes[i]) prof[i--] = 0
    if (i < 0) return
  }
}

export const randomProfile = (game, seed) => {
  const random = mulberry32(seed)
  return game.players.map((p) => Math.floor(random() * p.strategies.length))
}

// ------------------------------------------------------------ Braess, n drivers

// Resources: 0 s→v (k/n), 1 v→t (1), 2 s→w (1), 3 w→t (k/n), 4 v→w (c).
// Strategies: 0 upper (s-v-t), 1 lower (s-w-t), 2 zigzag (s-v-w-t), the last
// only with the shortcut open. c is a slider value with two decimals.
export const BRAESS_ROADS = ['sv', 'vt', 'sw', 'wt', 'vw']
export const BRAESS_ROUTES = ['upper', 'lower', 'zigzag']

export function braessGame(n, c = 0, open = true) {
  const cf = typeof c === 'object' ? c : fromDecimal(c, 2)
  const resources = [
    { id: 'sv', cost: (k) => frac(k, n) },
    { id: 'vt', cost: () => ONE },
    { id: 'sw', cost: () => ONE },
    { id: 'wt', cost: (k) => frac(k, n) },
    { id: 'vw', cost: () => cf },
  ]
  const routes = open ? [[0, 1], [2, 3], [0, 4, 3]] : [[0, 1], [2, 3]]
  const players = Array.from({ length: n }, () => ({ strategies: routes }))
  return { ...makeGame(resources, players), n, c: cf, open }
}

// A profile with u drivers on upper, l on lower, z on zigzag (drivers in
// that order).
export const fromCounts = (u, l, z) => [...new Array(u).fill(0), ...new Array(l).fill(1), ...new Array(z).fill(2)]
export function counts(profile) {
  const k = [0, 0, 0]
  for (const s of profile) k[s]++
  return k
}

export const BRAESS_STARTS = ['upper', 'half', 'random']
export function braessStart(game, kind, seed = 1) {
  const n = game.n
  if (kind === 'upper') return fromCounts(n, 0, 0)
  if (kind === 'half') return fromCounts(Math.ceil(n / 2), Math.floor(n / 2), 0)
  return randomProfile(game, seed)
}

// The route costs by counts (u, l, z), and what a driver on route r would
// pay on route s: the game is symmetric, so counts are enough.
function braessCostsByCounts(n, cf, [u, l, z]) {
  const sv = frac(u + z, n)
  const wt = frac(l + z, n)
  return [add(sv, ONE), add(ONE, wt), add(add(sv, cf), wt)]
}

// The planner's optimum and every equilibrium, by enumerating the counts on
// the three routes. Costs are per driver (total / n).
export function braessSurvey(n, c = 0, open = true) {
  const cf = typeof c === 'object' ? c : fromDecimal(c, 2)
  const R = open ? 3 : 2
  let opt = null
  const equilibria = []
  for (let u = 0; u <= n; u++) {
    for (let l = 0; l + u <= n; l++) {
      const z = n - u - l
      if (!open && z > 0) continue
      const k = [u, l, z]
      const rc = braessCostsByCounts(n, cf, k)
      let total = ZERO
      for (let r = 0; r < R; r++) if (k[r]) total = add(total, mul(frac(k[r]), rc[r]))
      const avg = mul(total, frac(1, n))
      if (!opt || lt(avg, opt.cost)) opt = { counts: k, cost: avg }
      // Equilibrium: no driver on a used route r gains by moving to s.
      let stable = true
      for (let r = 0; r < R && stable; r++) {
        if (!k[r]) continue
        for (let s = 0; s < R && stable; s++) {
          if (s === r) continue
          const k2 = [...k]
          k2[r]--
          k2[s]++
          if (lt(braessCostsByCounts(n, cf, k2)[s], rc[r])) stable = false
        }
      }
      if (stable) equilibria.push({ counts: k, cost: avg, routeCosts: rc })
    }
  }
  const cmpCost = (a, b) => cmp(a.cost, b.cost)
  const sorted = [...equilibria].sort(cmpCost)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]
  return { opt, equilibria, best, worst, poa: mul(worst.cost, frac(opt.cost.d, opt.cost.n)), pos: mul(best.cost, frac(opt.cost.d, opt.cost.n)) }
}

// ----------------------------------------------- Four drivers, the worst case

// Roads e1 to e4 cost the number of their users; z1 and z2 are costless.
// Each driver takes his own road e_i alone (direct) or a detour: driver 1
// e2 then e3, driver 2 e1 then e4, driver 3 e1 then z1, driver 4 e2 then z2.
export const FOUR_ROADS = ['e1', 'e2', 'e3', 'e4', 'z1', 'z2']
export function fourGame() {
  const resources = [
    ...[0, 1, 2, 3].map((i) => ({ id: `e${i + 1}`, cost: (k) => frac(k) })),
    { id: 'z1', cost: () => ZERO },
    { id: 'z2', cost: () => ZERO },
  ]
  const detours = [[1, 2], [0, 3], [0, 4], [1, 5]]
  const players = [0, 1, 2, 3].map((i) => ({ strategies: [[i], detours[i]] }))
  return makeGame(resources, players)
}
export const FOUR_STARTS = ['direct', 'detours', 'random']
export const fourStart = (kind, seed = 1) => (kind === 'direct' ? [0, 0, 0, 0] : kind === 'detours' ? [1, 1, 1, 1] : randomProfile(fourGame(), seed))

// Every profile of a small game with its total, its Φ and whether it is an
// equilibrium.
export function enumerate(game) {
  const out = []
  for (const p of allProfiles(game)) out.push({ profile: p, total: totalCost(game, p), phi: potential(game, p), eq: isEquilibrium(game, p) })
  return out
}

export { eq as fracEq }
