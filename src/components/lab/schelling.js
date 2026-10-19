import { randInt } from './rng.js'

// Schelling's model of residential segregation on an n × n torus.
//
// Each cell is empty or holds an agent of group A or B. An agent looks at its
// Moore neighbourhood (the eight surrounding cells, wrapping around the edges)
// and is content if the share of its own group among the occupied neighbours
// is at least `lo`, and, when the upper threshold is on, at most `hi`. An agent
// with no neighbours at all is content. Unhappy agents move: to a random empty
// cell, or to the nearest empty cell where they would be content (Schelling's
// own rule; an agent with no such cell stays put).
//
// Time is counted in sweeps. A sweep lists the agents unhappy at its start,
// in random order, and lets each one move in turn if it is still unhappy when
// its turn comes. The city has settled when a sweep moves nobody.

export const EMPTY = 0
export const GROUP_A = 1
export const GROUP_B = 2

// A city of side n with a share `vacancy` of empty cells and a share `shareA`
// of the agents in group A, all placed at random.
export function createCity(n, vacancy, shareA, random) {
  const N = n * n
  const nEmpty = Math.min(N - 2, Math.max(1, Math.round(N * vacancy)))
  const nAgents = N - nEmpty
  const nA = Math.round(nAgents * shareA)
  const g = new Uint8Array(N)
  for (let i = 0; i < N; i++) g[i] = i < nA ? GROUP_A : i < nAgents ? GROUP_B : EMPTY
  for (let i = N - 1; i > 0; i--) {
    const j = randInt(random, i + 1)
    const t = g[i]
    g[i] = g[j]
    g[j] = t
  }
  // The eight neighbours of every cell, on the torus.
  const nb = new Int32Array(8 * N)
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let k = 8 * (y * n + x)
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx || dy) nb[k++] = ((y + dy + n) % n) * n + ((x + dx + n) % n)
        }
      }
    }
  }
  // Empty cells as a list, with each cell's position in it, for O(1) moves.
  const empties = new Int32Array(nEmpty)
  const where = new Int32Array(N).fill(-1)
  let k = 0
  for (let i = 0; i < N; i++) {
    if (g[i] === EMPTY) {
      where[i] = k
      empties[k++] = i
    }
  }
  return {
    n,
    N,
    g,
    nb,
    empties,
    where,
    nEmpty,
    nAgents,
    sweeps: 0, // sweeps that moved at least one agent
    moves: 0,
    settled: false,
    // The sweep in progress.
    queue: new Int32Array(N),
    qLen: 0,
    qPos: 0,
    moved: 0,
    open: false,
  }
}

function content(same, occ, opt) {
  if (occ === 0) return true
  if (same < opt.lo * occ - 1e-9) return false
  return opt.hi == null || same <= opt.hi * occ + 1e-9
}

// Would an agent of group a be content at cell j? Cell `skip` (the cell the
// agent would leave) is not counted as a neighbour.
function contentAt(city, j, a, skip, opt) {
  const { g, nb } = city
  let same = 0
  let occ = 0
  for (let k = 8 * j, end = k + 8; k < end; k++) {
    const c = nb[k]
    if (c === skip || g[c] === EMPTY) continue
    occ++
    if (g[c] === a) same++
  }
  return content(same, occ, opt)
}

export const isUnhappy = (city, i, opt) => city.g[i] !== EMPTY && !contentAt(city, i, city.g[i], -1, opt)

// The nearest empty cell (Euclidean distance on the torus) where the agent at
// i would be content, or −1 if there is none. Ties go to the first one listed.
function nearestContent(city, i, opt) {
  const { n, empties, nEmpty, g } = city
  const a = g[i]
  const xi = i % n
  const yi = (i / n) | 0
  let best = -1
  let bestD = Infinity
  for (let k = 0; k < nEmpty; k++) {
    const j = empties[k]
    let dx = Math.abs((j % n) - xi)
    let dy = Math.abs(((j / n) | 0) - yi)
    if (dx > n - dx) dx = n - dx
    if (dy > n - dy) dy = n - dy
    const d = dx * dx + dy * dy
    if (d < bestD && contentAt(city, j, a, i, opt)) {
      bestD = d
      best = j
    }
  }
  return best
}

function move(city, i, j) {
  const { g, empties, where } = city
  g[j] = g[i]
  g[i] = EMPTY
  empties[where[j]] = i
  where[i] = where[j]
  where[j] = -1
  city.moves++
  city.moved++
}

function beginSweep(city, opt, random) {
  const { N, queue } = city
  let m = 0
  for (let i = 0; i < N; i++) if (isUnhappy(city, i, opt)) queue[m++] = i
  for (let k = m - 1; k > 0; k--) {
    const j = randInt(random, k + 1)
    const t = queue[k]
    queue[k] = queue[j]
    queue[j] = t
  }
  city.qLen = m
  city.qPos = 0
  city.moved = 0
  city.open = true
}

// Advances the current sweep by up to `budget` agents, starting a new sweep
// if none is open. Returns true when the sweep has finished.
// opt = { lo, hi (null when off), rule: 'random' | 'nearest' }.
export function advance(city, opt, random, budget = Infinity) {
  if (!city.open) beginSweep(city, opt, random)
  const { queue } = city
  while (city.qPos < city.qLen && budget-- > 0) {
    const i = queue[city.qPos++]
    // The agent first listed here may have moved away, or another moved in;
    // whoever is here now moves only if unhappy now.
    if (!isUnhappy(city, i, opt)) continue
    const j = opt.rule === 'nearest' ? nearestContent(city, i, opt) : city.empties[randInt(random, city.nEmpty)]
    if (j >= 0) move(city, i, j)
  }
  if (city.qPos < city.qLen) return false
  city.open = false
  if (city.moved) {
    city.sweeps++
    city.settled = false
  } else city.settled = true
  return true
}

// One full sweep.
export function sweep(city, opt, random) {
  while (!advance(city, opt, random)) {
    // keep going
  }
}

// Segregation index: the mean, over agents with at least one occupied
// neighbour, of the share of those neighbours that belong to the agent's own
// group. With the share of unhappy agents, for opt's thresholds.
export function cityStats(city, opt) {
  const { N, g, nb } = city
  let sum = 0
  let counted = 0
  let unhappy = 0
  for (let i = 0; i < N; i++) {
    const a = g[i]
    if (a === EMPTY) continue
    let same = 0
    let occ = 0
    for (let k = 8 * i, end = k + 8; k < end; k++) {
      const c = g[nb[k]]
      if (c === EMPTY) continue
      occ++
      if (c === a) same++
    }
    if (occ) {
      sum += same / occ
      counted++
    }
    if (!content(same, occ, opt)) unhappy++
  }
  return { segregation: counted ? sum / counted : NaN, unhappy: unhappy / city.nAgents }
}
