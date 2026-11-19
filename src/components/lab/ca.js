import { mulberry32 } from './rng.js'

// Elementary cellular automata and simple randomness statistics.
//
// A row is a Uint8Array of 0/1 cells. A rule number 0 … 255 is read in
// Wolfram's convention: the neighbourhood (left, centre, right) is the 3-bit
// number n = 4·left + 2·centre + right, and the new state is bit n of the rule.
// So rule 90 = 01011010 in binary sends 111 → 0, 110 → 1, … , 000 → 0.

// ---------------------------------------------------------------- Rules

export function ruleTable(rule) {
  const table = new Uint8Array(8)
  for (let n = 0; n < 8; n++) table[n] = (rule >> n) & 1
  return table
}

export function ruleFromTable(table) {
  let rule = 0
  for (let n = 0; n < 8; n++) if (table[n]) rule |= 1 << n
  return rule
}

// Langton's λ for two states with 0 quiescent: the share of the eight
// neighbourhoods that the rule sends to 1.
export function langtonLambda(rule) {
  let ones = 0
  for (let n = 0; n < 8; n++) ones += (rule >> n) & 1
  return ones / 8
}

// ---------------------------------------------------------------- Evolution

// Writes the next row of `src` into `dst`. With `periodic` the row wraps
// around; otherwise the cells beyond both ends are fixed at 0.
export function stepRow(src, dst, table, periodic = true) {
  const w = src.length
  if (w === 0) return dst
  if (w === 1) {
    const c = src[0]
    dst[0] = table[periodic ? 7 * c : 2 * c]
    return dst
  }
  const first = periodic ? src[w - 1] : 0
  const last = periodic ? src[0] : 0
  dst[0] = table[(first << 2) | (src[0] << 1) | src[1]]
  for (let i = 1; i < w - 1; i++) dst[i] = table[(src[i - 1] << 2) | (src[i] << 1) | src[i + 1]]
  dst[w - 1] = table[(src[w - 2] << 2) | (src[w - 1] << 1) | last]
  return dst
}

// The full space–time diagram: `steps` updates of `initial`, returned as
// steps + 1 rows of `width` cells laid end to end (row t starts at t·width).
export function runSpaceTime(initial, steps, rule, periodic = true) {
  const width = initial.length
  const table = ruleTable(rule)
  const cells = new Uint8Array(width * (steps + 1))
  cells.set(initial, 0)
  for (let t = 0; t < steps; t++) {
    stepRow(cells.subarray(t * width, (t + 1) * width), cells.subarray((t + 1) * width, (t + 2) * width), table, periodic)
  }
  return { width, rows: steps + 1, cells }
}

// Number of cells that differ between two space–time diagrams, row by row.
export function diffCounts(a, b) {
  const counts = new Int32Array(a.rows)
  for (let t = 0; t < a.rows; t++) {
    let d = 0
    for (let i = t * a.width, end = i + a.width; i < end; i++) d += a.cells[i] ^ b.cells[i]
    counts[t] = d
  }
  return counts
}

// ---------------------------------------------------------------- Initial rows

export function singleCellRow(width) {
  const row = new Uint8Array(width)
  row[width >> 1] = 1
  return row
}

export function randomRow(width, density, seed) {
  const random = mulberry32(seed)
  const row = new Uint8Array(width)
  for (let i = 0; i < width; i++) row[i] = random() < density ? 1 : 0
  return row
}

// ---------------------------------------------------------------- Centre column

// The centre column of a rule grown from a single 1 on an infinite row of 0s
// (the rule must send 000 to 0, as rule 30 does): bit t is the centre cell at
// time t. Cells are packed 32 per word and updated word by word, and only the
// cells that can still reach the centre are computed: at time t that is the
// band within min(t, n − 1 − t) of the centre. A generator, so the ~n²/64 word
// updates of a long column can be spread over animation frames; it yields
// progress in [0, 1] and fills `out` (a Uint8Array of length n).
export function* centreColumnSteps(rule, n, out) {
  const table = ruleTable(rule)
  if (table[0]) throw new Error('centreColumn needs a rule that sends 000 to 0')
  const minterms = []
  for (let k = 0; k < 8; k++) if (table[k]) minterms.push(k)

  const size = 2 * n + 64 // cells; the centre sits at index c with a margin of zeros on both sides
  const words = (size >> 5) + 2
  const c = n + 32
  let cur = new Int32Array(words)
  let nxt = new Int32Array(words)
  cur[c >> 5] = 1 << (c & 31)
  out[0] = 1

  for (let t = 0; t < n - 1; t++) {
    // Row t + 1 is needed within distance d of the centre.
    const d = Math.min(t + 1, n - 2 - t)
    const w0 = (c - d) >> 5
    const w1 = (c + d) >> 5
    for (let w = w0; w <= w1; w++) {
      const C = cur[w]
      // Bit j of L holds the left neighbour of cell 32w + j, bit j of R the right one.
      const L = (C << 1) | (cur[w - 1] >>> 31)
      const R = (C >>> 1) | (cur[w + 1] << 31)
      let v = 0
      for (let m = 0; m < minterms.length; m++) {
        const k = minterms[m]
        v |= (k & 4 ? L : ~L) & (k & 2 ? C : ~C) & (k & 1 ? R : ~R)
      }
      nxt[w] = v
    }
    // While the band grows, the words outside it were never written and hold
    // the 0s of the empty row. Once it shrinks, the words outside it go stale,
    // but they only feed cells that can no longer reach the centre.
    const tmp = cur
    cur = nxt
    nxt = tmp
    out[t + 1] = (cur[c >> 5] >>> (c & 31)) & 1
    if ((t & 255) === 0) yield t / n
  }
  return out
}

export function centreColumn(rule, n) {
  const out = new Uint8Array(n)
  const it = centreColumnSteps(rule, n, out)
  while (!it.next().done);
  return out
}

// ---------------------------------------------------------------- Bit sources

// 32 bits per call of mulberry32, most significant bit first.
export function mulberryBits(n, seed) {
  const random = mulberry32(seed)
  const out = new Uint8Array(n)
  let word = 0
  for (let i = 0; i < n; i++) {
    if ((i & 31) === 0) word = Math.floor(random() * 4294967296) >>> 0
    out[i] = (word >>> (31 - (i & 31))) & 1
  }
  return out
}

// A deliberately weak linear congruential generator, x → (a·x + c) mod 256,
// whose whole state, one byte, is the output: 8 bits per step, most
// significant first. With a = 5, c = 3 it visits all 256 bytes before
// repeating, so it has a period of 2048 bits.
export const WEAK_LCG = { a: 5, c: 3, m: 256 }

export function lcgBits(n, seed, { a, c, m } = WEAK_LCG) {
  const out = new Uint8Array(n)
  let x = seed % m
  for (let i = 0; i < n; i += 8) {
    x = (a * x + c) % m
    for (let b = 0; b < 8 && i + b < n; b++) out[i + b] = (x >> (7 - b)) & 1
  }
  return out
}

// Consecutive 8-bit chunks of a bit string, most significant bit first.
export function bytesFromBits(bits) {
  const out = new Uint8Array(bits.length >> 3)
  for (let k = 0; k < out.length; k++) {
    let v = 0
    for (let b = 0; b < 8; b++) v = (v << 1) | bits[8 * k + b]
    out[k] = v
  }
  return out
}

// ---------------------------------------------------------------- Statistics

// Simple checks of a bit string, each with the value expected of a fair coin
// and the size of its ordinary random fluctuation (one standard deviation):
// share of ones, number of runs (maximal blocks of equal bits), correlation
// between bits `lag` apart for lags 1 … maxLag, and the frequencies of the
// overlapping 2- and 3-bit blocks.
export function bitStats(bits, maxLag = 8) {
  const n = bits.length
  let ones = 0
  for (let i = 0; i < n; i++) ones += bits[i]
  const p = ones / n
  const zeros = n - ones

  let runs = n ? 1 : 0
  for (let i = 1; i < n; i++) if (bits[i] !== bits[i - 1]) runs++
  // Wald–Wolfowitz: mean and variance of the number of runs given the counts.
  const runsExpected = n ? 1 + (2 * ones * zeros) / n : 0
  const runsVar = n > 1 ? (2 * ones * zeros * (2 * ones * zeros - n)) / (n * n * (n - 1)) : 0

  const autocorr = []
  const q = 1 - p
  for (let k = 1; k <= maxLag; k++) {
    let both = 0
    for (let i = 0; i + k < n; i++) both += bits[i] & bits[i + k]
    const m = n - k
    // Pearson correlation of bits[i] and bits[i + k] (sample proportions from the whole string).
    autocorr.push(p > 0 && q > 0 ? (both / m - p * p) / (p * q) : NaN)
  }

  const blocks = (len) => {
    const counts = new Float64Array(1 << len)
    const total = n - len + 1
    if (total <= 0) return { freq: Array.from(counts), total: 0 }
    let v = 0
    for (let i = 0; i < len - 1; i++) v = (v << 1) | bits[i]
    const mask = (1 << len) - 1
    for (let i = len - 1; i < n; i++) {
      v = ((v << 1) | bits[i]) & mask
      counts[v]++
    }
    return { freq: Array.from(counts, (c) => c / total), total }
  }

  return {
    n,
    ones,
    fracOnes: p,
    fracSd: 0.5 / Math.sqrt(n),
    runs,
    runsExpected,
    runsSd: Math.sqrt(Math.max(runsVar, 0)),
    autocorr,
    autocorrSd: 1 / Math.sqrt(n),
    blocks2: blocks(2),
    blocks3: blocks(3),
  }
}

// Smallest p ≤ maxPeriod with bits[i] = bits[i + p] for every i, or 0 if
// there is none. Random strings reject each candidate within a few bits, so
// this costs little more than one pass.
export function findPeriod(bits, maxPeriod = bits.length >> 1) {
  const n = bits.length
  for (let p = 1; p <= maxPeriod; p++) {
    let i = 0
    while (i + p < n && bits[i] === bits[i + p]) i++
    if (i + p >= n) return p
  }
  return 0
}
