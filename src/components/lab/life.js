import { mulberry32 } from './rng.js'

// Life-like cellular automata and Langton's ant / turmites.
//
// A grid is a Uint8Array of w·h cells, row by row (cell (x, y) at y·w + x),
// 1 alive and 0 dead. A Life-like rule is "B…/S…": a dead cell is born when
// its number of live neighbours (of the 8 around it, the Moore neighbourhood)
// is listed after B, and a live cell survives when it is listed after S.
// Conway's Life is B3/S23.

// ---------------------------------------------------------------- Rules

// Parses "B3/S23" (case and spaces ignored; "S23/B3" is accepted too).
// Returns { birth, survive, text } with birth/survive as Uint8Array(9) of 0/1,
// or null if the string is not a valid rule.
export function parseRule(str) {
  const s = String(str).replace(/\s+/g, '').toUpperCase()
  const m = s.match(/^B([0-8]*)\/S([0-8]*)$/) || s.match(/^S([0-8]*)\/B([0-8]*)$/)
  if (!m) return null
  const [b, sv] = s[0] === 'B' ? [m[1], m[2]] : [m[2], m[1]]
  const birth = new Uint8Array(9)
  const survive = new Uint8Array(9)
  for (const c of b) birth[+c] = 1
  for (const c of sv) survive[+c] = 1
  return { birth, survive, text: ruleText(birth, survive) }
}

export function ruleText(birth, survive) {
  const digits = (a) => a.reduce((s, v, k) => (v ? s + k : s), '')
  return `B${digits(birth)}/S${digits(survive)}`
}

// Lookup table indexed by 9·state + neighbours.
function ruleTable(rule) {
  const table = new Uint8Array(18)
  for (let k = 0; k <= 8; k++) {
    table[k] = rule.birth[k]
    table[9 + k] = rule.survive[k]
  }
  return table
}

// ---------------------------------------------------------------- Evolution

// Writes the next generation of `src` into `dst` and returns its population.
// With `torus` the grid wraps around; otherwise every cell outside it is dead.
// Neighbour counts come from column sums of three rows: the sum over the 3×3
// block around x is cs[x − 1] + cs[x] + cs[x + 1], minus the cell itself.
export function stepLife(src, dst, w, h, rule, torus = true) {
  const table = rule.table || (rule.table = ruleTable(rule))
  const zero = new Uint8Array(w)
  const cs = new Uint8Array(w)
  let pop = 0
  for (let y = 0; y < h; y++) {
    const row = src.subarray(y * w, y * w + w)
    const up = y > 0 ? src.subarray((y - 1) * w, y * w) : torus ? src.subarray((h - 1) * w, h * w) : zero
    const down = y < h - 1 ? src.subarray((y + 1) * w, (y + 2) * w) : torus ? src.subarray(0, w) : zero
    for (let x = 0; x < w; x++) cs[x] = up[x] + row[x] + down[x]
    const o = y * w
    for (let x = 0; x < w; x++) {
      const left = x > 0 ? cs[x - 1] : torus ? cs[w - 1] : 0
      const right = x < w - 1 ? cs[x + 1] : torus ? cs[0] : 0
      const c = row[x]
      const v = table[9 * c + left + cs[x] + right - c]
      dst[o + x] = v
      pop += v
    }
  }
  return pop
}

// Ages for colouring: 0 for dead cells, 1 for a cell born this generation,
// counting up (to 65535) while it survives.
export function updateAges(ages, grid) {
  for (let i = 0; i < grid.length; i++) ages[i] = grid[i] ? Math.min(ages[i] + 1, 65535) : 0
}

export function population(grid) {
  let p = 0
  for (let i = 0; i < grid.length; i++) p += grid[i]
  return p
}

export function randomFill(grid, density, seed) {
  const random = mulberry32(seed)
  for (let i = 0; i < grid.length; i++) grid[i] = random() < density ? 1 : 0
  return grid
}

// Copies `src` (sw × sh) into a new w × h grid with the centres aligned,
// cropping or padding with dead cells.
export function resizeGrid(src, sw, sh, w, h) {
  const out = new Uint8Array(w * h)
  const dx = (w - sw) >> 1
  const dy = (h - sh) >> 1
  for (let y = 0; y < sh; y++) {
    const ty = y + dy
    if (ty < 0 || ty >= h) continue
    for (let x = 0; x < sw; x++) {
      const tx = x + dx
      if (tx >= 0 && tx < w) out[ty * w + tx] = src[y * sw + x]
    }
  }
  return out
}

// ---------------------------------------------------------------- Cycle detection

// A 53-bit hash of the live cells (two 32-bit multiplicative hashes of their
// indices). Equal grids hash equally; a collision between different grids is
// possible in principle but has odds of about 1 in 2^53 per comparison.
export function hashGrid(grid) {
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < grid.length; i++) {
    if (grid[i]) {
      h1 = Math.imul(h1 ^ i, 0x9e3779b1)
      h1 ^= h1 >>> 15
      h2 = Math.imul(h2 + i, 0x85ebca77)
      h2 ^= h2 >>> 13
    }
  }
  return (h1 >>> 0) * 2097152 + ((h2 >>> 0) & 0x1fffff)
}

// Remembers the hashes of the last `maxPeriod` states (all of them with
// Infinity). `push(hash, generation)` returns null, or { period, since } when
// the state already occurred `period` generations ago, at generation `since`.
export function createCycleDetector(maxPeriod = 30) {
  const seen = new Map()
  const ring = []
  return {
    push(hash, gen) {
      const prev = seen.get(hash)
      const found = prev !== undefined ? { period: gen - prev, since: prev } : null
      seen.set(hash, gen)
      if (Number.isFinite(maxPeriod)) {
        ring.push(hash, gen)
        if (ring.length > 2 * maxPeriod) {
          const oldHash = ring.shift()
          const oldGen = ring.shift()
          if (seen.get(oldHash) === oldGen) seen.delete(oldHash)
        }
      }
      return found
    },
    reset() {
      seen.clear()
      ring.length = 0
    },
  }
}

// ---------------------------------------------------------------- Patterns

// Run-length encoded patterns: b dead, o alive, $ end of row, an optional
// count before each, ! end. Returns live cells as [x, y] pairs.
export function parseRLE(rle) {
  const cells = []
  let x = 0
  let y = 0
  let n = ''
  for (const ch of rle.replace(/\s+/g, '')) {
    if (ch >= '0' && ch <= '9') {
      n += ch
      continue
    }
    const k = n ? Number(n) : 1
    n = ''
    if (ch === 'b' || ch === '.') x += k
    else if (ch === 'o' || ch === '*') {
      for (let j = 0; j < k; j++) cells.push([x + j, y])
      x += k
    } else if (ch === '$') {
      y += k
      x = 0
    } else if (ch === '!') break
  }
  return cells
}

// Pulsar: 13 × 13, built from its four-fold symmetry.
function pulsarCells() {
  const cells = []
  for (const r of [0, 5, 7, 12]) for (const c of [2, 3, 4, 8, 9, 10]) cells.push([c, r], [r, c])
  return cells
}

// `room`: the smallest grid on which "load" places the pattern with space to
// develop; `at`: where it goes ('centre', or fractions of the grid size).
// `rule`: the rule it belongs to, when it is not Life.
export const PATTERNS = [
  { id: 'block', group: 'still', cells: parseRLE('2o$2o!') },
  { id: 'beehive', group: 'still', cells: parseRLE('b2o$o2bo$b2o!') },
  { id: 'loaf', group: 'still', cells: parseRLE('b2o$o2bo$bobo$2bo!') },
  { id: 'boat', group: 'still', cells: parseRLE('2o$obo$bo!') },
  { id: 'blinker', group: 'osc', period: 2, cells: parseRLE('3o!') },
  { id: 'toad', group: 'osc', period: 2, cells: parseRLE('b3o$3o!') },
  { id: 'beacon', group: 'osc', period: 2, cells: parseRLE('2o$2o$2b2o$2b2o!') },
  { id: 'pulsar', group: 'osc', period: 3, cells: pulsarCells() },
  { id: 'pentadecathlon', group: 'osc', period: 15, cells: parseRLE('2bo4bo$2ob4ob2o$2bo4bo!') },
  { id: 'glider', group: 'ship', period: 4, cells: parseRLE('bo$2bo$3o!') },
  { id: 'lwss', group: 'ship', period: 4, cells: parseRLE('bo2bo$o4b$o3bo$4o!') },
  { id: 'rpentomino', group: 'meth', room: 300, cells: parseRLE('b2o$2o$bo!') },
  { id: 'acorn', group: 'meth', room: 400, cells: parseRLE('bo5b$3bo3b$2o2b3o!') },
  { id: 'diehard', group: 'meth', room: 100, cells: parseRLE('6bob$2o6b$bo3b3o!') },
  {
    id: 'gosper',
    group: 'gun',
    period: 30,
    room: 150,
    at: [0.08, 0.08],
    cells: parseRLE(
      '24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!',
    ),
  },
  { id: 'replicator', group: 'high', rule: 'B36/S23', room: 150, cells: parseRLE('2b3o$bo2bo$o3bo$o2bo$3o!') },
]

export function patternById(id) {
  return PATTERNS.find((p) => p.id === id)
}

// The pattern's cells turned by `quarter` quarter-turns clockwise and moved
// so their bounding box starts at (0, 0). Returns { cells, w, h }.
export function orient(cells, quarter = 0) {
  let pts = cells
  for (let q = 0; q < ((quarter % 4) + 4) % 4; q++) pts = pts.map(([x, y]) => [-y, x])
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [x, y] of pts) {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
  return { cells: pts.map(([x, y]) => [x - minX, y - minY]), w: maxX - minX + 1, h: maxY - minY + 1 }
}

// Sets the pattern's cells alive with its top-left corner at (x0, y0).
// On a torus the pattern wraps; otherwise cells outside the grid are dropped.
export function stamp(grid, w, h, cells, x0, y0, torus = true) {
  for (const [dx, dy] of cells) {
    let x = x0 + dx
    let y = y0 + dy
    if (torus) {
      x = ((x % w) + w) % w
      y = ((y % h) + h) % h
    } else if (x < 0 || x >= w || y < 0 || y >= h) continue
    grid[y * w + x] = 1
  }
  return grid
}

// ---------------------------------------------------------------- Langton's ant and turmites

// A turmite rule is a string of turns, one per colour: on a cell of colour c
// the ant turns by rule[c] (R right, L left), changes the cell to colour
// c + 1 (mod the number of colours) and steps forward. "RL" is Langton's ant.
export function parseTurmite(str) {
  const s = String(str).replace(/\s+/g, '').toUpperCase()
  if (!/^[LR]{2,12}$/.test(s)) return null
  return { text: s, turns: Int8Array.from(s, (c) => (c === 'R' ? 1 : -1)) }
}

// Directions 0 up, 1 right, 2 down, 3 left (y grows downwards).
const DX = [0, 1, 0, -1]
const DY = [-1, 0, 1, 0]

// `n` ants near the centre of a w × h torus, all facing up.
export function makeAnts(n, w, h) {
  const cx = w >> 1
  const cy = h >> 1
  const s = Math.max(4, Math.round(Math.min(w, h) / 10))
  const offsets = [
    [0, 0],
    [s, 0],
    [0, s],
    [s, s],
  ]
  if (n > 1) for (const o of offsets) (o[0] -= s >> 1), (o[1] -= s >> 1)
  return offsets.slice(0, n).map(([dx, dy]) => ({ x: cx + dx, y: cy + dy, dir: 0, ux: 0, uy: 0 }))
}

// Moves every ant `steps` times on a torus. `ux`, `uy` track each ant's
// unwrapped displacement; `onStep(ant0)` (optional) is called after each step.
export function stepTurmites(grid, w, h, ants, turmite, steps = 1, onStep) {
  const { turns } = turmite
  const n = turns.length
  for (let s = 0; s < steps; s++) {
    for (let a = 0; a < ants.length; a++) {
      const ant = ants[a]
      const i = ant.y * w + ant.x
      const c = grid[i]
      ant.dir = (ant.dir + turns[c] + 4) & 3
      grid[i] = c + 1 === n ? 0 : c + 1
      const dx = DX[ant.dir]
      const dy = DY[ant.dir]
      ant.ux += dx
      ant.uy += dy
      ant.x += dx
      ant.y += dy
      if (ant.x < 0) ant.x += w
      else if (ant.x >= w) ant.x -= w
      if (ant.y < 0) ant.y += h
      else if (ant.y >= h) ant.y -= h
    }
    if (onStep) onStep(ants[0])
  }
}

export const HIGHWAY_PERIOD = 104

// Watches one ant for Langton's highway: from some step on, every 104 steps
// it moves by the same diagonal (±2, ±2). `push(ant, step)` is called after
// each step; once the displacement over 104 steps has stayed constant for
// `confirm` periods, `start` is the first step of the periodic motion (the
// earliest j with the same displacement from j to j + 104 at every later step),
// `active` says whether the highway is still running, and `first` keeps the
// start of the first highway seen.
export function createHighwayDetector(confirm = 4) {
  const P = HIGHWAY_PERIOD
  const xs = new Int32Array(P + 1)
  const ys = new Int32Array(P + 1)
  let count = 0
  let runFrom = -1
  let lastDx = 0
  let lastDy = 0
  const det = {
    start: null,
    first: null,
    active: false,
    push(ant, step) {
      const k = count % (P + 1)
      xs[k] = ant.ux
      ys[k] = ant.uy
      count++
      if (count <= P) return
      const j = (count - 1 - P) % (P + 1) // the entry from 104 steps ago
      const dx = ant.ux - xs[j]
      const dy = ant.uy - ys[j]
      const diag = Math.abs(dx) === 2 && Math.abs(dy) === 2
      if (diag && runFrom >= 0 && dx === lastDx && dy === lastDy) {
        if (!det.active && step - P - runFrom >= confirm * P) {
          det.active = true
          det.start = runFrom
          if (det.first == null) det.first = runFrom
        }
      } else {
        runFrom = diag ? step - P : -1
        if (det.active) det.active = false
      }
      lastDx = dx
      lastDy = dy
    },
  }
  return det
}
