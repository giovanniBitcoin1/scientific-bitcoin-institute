import { randInt } from './rng.js'

// The Bak–Tang–Wiesenfeld sandpile on an L × L grid with open boundaries.
//
// Each site holds h grains (an Int32Array, row-major). A site with h ≥ 4 is
// unstable and topples: it loses 4 grains and gives one to each of its four
// neighbours; a grain sent across the edge of the grid is lost. A grain added
// to a stable pile can set off an avalanche of topplings, measured three ways:
// size (topplings), area (distinct sites that toppled) and duration (waves of
// the parallel dynamics, in which every unstable site topples once per wave).

export const Z_C = 4 // toppling threshold
export const MEAN_HEIGHT = 17 / 8 // stationary mean height on an infinite grid (conjectured from Priezzhev, 1994; proved in 2011)

// A pile of side L. `start` is 'empty' (no grains), 'random' (0–3 grains per
// site, uniformly) or 'overloaded' (4–7 grains per site: every site unstable,
// so the first relaxation is one huge avalanche).
export function createSandpile(L, start = 'empty', random = null) {
  const N = L * L
  const h = new Int32Array(N)
  let mass = 0
  if (start !== 'empty') {
    const base = start === 'overloaded' ? Z_C : 0
    for (let i = 0; i < N; i++) {
      h[i] = base + randInt(random, Z_C)
      mass += h[i]
    }
  }
  const st = {
    L,
    N,
    h,
    mass, // grains on the pile
    grains: 0, // grains added
    lost: 0, // grains fallen off the edge
    // Unstable sites of the current wave, and the list being built for the next.
    active: new Int32Array(N),
    nActive: 0,
    next: new Int32Array(N),
    mark: new Int32Array(N), // wave stamp: a site is listed at most once per wave
    stamp: 0,
    // Sites toppled in the current avalanche, in the order they first toppled.
    hit: new Int32Array(N), // avalanche stamp
    avId: 0,
    sites: new Int32Array(N),
    nSites: 0,
    size: 0,
    duration: 0,
  }
  for (let i = 0; i < N; i++) if (h[i] >= Z_C) st.active[st.nActive++] = i
  return st
}

// Drops one grain on site i. The avalanche it may start is relaxed separately.
export function addGrain(st, i) {
  st.h[i]++
  st.mass++
  st.grains++
  if (st.h[i] === Z_C) st.active[st.nActive++] = i
}

export const randomSite = (st, random) => randInt(random, st.N)
export const centreSite = (st) => (st.L >> 1) * st.L + (st.L >> 1)

// Starts counting a new avalanche.
export function beginAvalanche(st) {
  st.avId++
  st.nSites = 0
  st.size = 0
  st.duration = 0
}

export const isRelaxing = (st) => st.nActive > 0

// One wave of the parallel dynamics: every site that is unstable at the start
// of the wave topples once. Returns the number of topplings. Sites listed for
// the wave may have become stable since they were listed; they are skipped.
export function wave(st) {
  const { L, h, mark, hit, sites } = st
  const { active, next } = st
  let n = 0
  for (let k = 0; k < st.nActive; k++) if (h[active[k]] >= Z_C) active[n++] = active[k]
  if (!n) {
    st.nActive = 0
    return 0
  }
  const s = ++st.stamp
  let m = 0
  let lost = 0
  const push = (j) => {
    if (h[j] >= Z_C && mark[j] !== s) {
      mark[j] = s
      next[m++] = j
    }
  }
  for (let k = 0; k < n; k++) {
    const i = active[k]
    h[i] -= Z_C
    if (hit[i] !== st.avId) {
      hit[i] = st.avId
      sites[st.nSites++] = i
    }
    const x = i % L
    if (x > 0) {
      h[i - 1]++
      push(i - 1)
    } else lost++
    if (x < L - 1) {
      h[i + 1]++
      push(i + 1)
    } else lost++
    if (i >= L) {
      h[i - L]++
      push(i - L)
    } else lost++
    if (i < st.N - L) {
      h[i + L]++
      push(i + L)
    } else lost++
    push(i) // still unstable if it held 8 or more
  }
  st.lost += lost
  st.mass -= lost
  st.active = next
  st.next = active
  st.nActive = m
  st.size += n
  st.duration++
  return n
}

// Relaxes the pile completely, wave by wave, and returns the avalanche:
// { size, area, duration }. Call beginAvalanche() first.
export function relax(st) {
  while (st.nActive) wave(st)
  return { size: st.size, area: st.nSites, duration: st.duration }
}

// Adds a grain on site i and relaxes the avalanche it triggers.
export function dropGrain(st, i) {
  beginAvalanche(st)
  addGrain(st, i)
  return relax(st)
}

// The same relaxation, one wave per step, for animation: yields the number of
// topplings of each wave and returns the avalanche when the pile is stable.
export function* relaxSteps(st) {
  while (st.nActive) {
    const n = wave(st)
    if (n) yield n
  }
  return { size: st.size, area: st.nSites, duration: st.duration }
}

// Relaxation in a different order, for testing the abelian property: a single
// last-in-first-out stack, each popped site toppling once and going back on
// the stack if it is still unstable. Works on its own copy of the heights and
// returns them with the number of topplings of every site.
export function relaxStackOrder(L, heights) {
  const N = L * L
  const h = Int32Array.from(heights)
  const topples = new Int32Array(N)
  const stack = new Int32Array(N)
  const onStack = new Uint8Array(N)
  let top = 0
  for (let i = 0; i < N; i++) {
    if (h[i] >= Z_C) {
      stack[top++] = i
      onStack[i] = 1
    }
  }
  const push = (j) => {
    if (h[j] >= Z_C && !onStack[j]) {
      onStack[j] = 1
      stack[top++] = j
    }
  }
  while (top) {
    const i = stack[--top]
    onStack[i] = 0
    h[i] -= Z_C
    topples[i]++
    const x = i % L
    if (x > 0) {
      h[i - 1]++
      push(i - 1)
    }
    if (x < L - 1) {
      h[i + 1]++
      push(i + 1)
    }
    if (i >= L) {
      h[i - L]++
      push(i - L)
    }
    if (i < N - L) {
      h[i + L]++
      push(i + L)
    }
    push(i)
  }
  return { h, topples }
}

export function meanHeight(st) {
  return st.mass / st.N
}

// ---------------------------------------------------------------- Continuous drive

// The pile driven without waiting for avalanches to end: at every time step a
// grain is added at a random site with probability `rate`, then one wave of
// topplings runs. Returns the topplings of that step, a time series of
// activity in which avalanches may overlap when the drive is fast.
export function driveStep(st, random, rate) {
  if (!st.nActive) beginAvalanche(st)
  if (random() < rate) addGrain(st, randInt(random, st.N))
  return wave(st)
}

// Topplings per time step over `steps` steps of continuous drive.
export function activitySeries(st, random, rate, steps) {
  const out = new Float64Array(steps)
  for (let t = 0; t < steps; t++) out[t] = driveStep(st, random, rate)
  return out
}
