import { randInt } from './rng.js'

// The Nagel–Schreckenberg traffic model on a one-lane ring of L cells.
//
// Each cell is empty or holds one car with an integer speed 0 … v_max (cells
// per step). Cars drive towards increasing cell index and never overtake, so
// car k + 1 is always the next car ahead of car k. In one step every car, in
// parallel:
//   1. accelerates by 1, up to v_max;
//   2. slows down to the gap ahead (the empty cells before the next car);
//   3. with probability p, slows down by 1 more (random braking);
//   4. moves forward by its speed.
// With p = 0 and v_max = 1 this is elementary cellular automaton Rule 184.

// A ring of L cells holding round(density · L) cars at rest, placed at
// random cells (`layout` 'random') or as evenly as possible ('even').
export function createRoad(L, density, random, layout = 'random') {
  const n = Math.min(L, Math.max(1, Math.round(density * L)))
  const pos = new Int32Array(n)
  if (layout === 'even') {
    for (let k = 0; k < n; k++) pos[k] = Math.floor((k * L) / n)
  } else {
    // A random n-subset of the cells, by a partial Fisher–Yates shuffle.
    const cells = new Int32Array(L)
    for (let i = 0; i < L; i++) cells[i] = i
    for (let k = 0; k < n; k++) {
      const j = k + randInt(random, L - k)
      const t = cells[k]
      cells[k] = cells[j]
      cells[j] = t
    }
    pos.set(cells.subarray(0, n))
    pos.sort()
  }
  return { L, n, pos, vel: new Int32Array(n), t: 0 }
}

// One parallel update. Returns the sum of the new speeds, the number of cars
// that crossed any given point of the road in this step summed over all points.
export function trafficStep(road, vmax, p, random) {
  const { L, n, pos, vel } = road
  let sum = 0
  for (let k = 0; k < n; k++) {
    const ahead = k + 1 === n ? 0 : k + 1
    const gap = n === 1 ? L - 1 : (pos[ahead] - pos[k] - 1 + L) % L
    let v = vel[k] + 1
    if (v > vmax) v = vmax
    if (v > gap) v = gap
    if (v > 0 && p > 0 && random() < p) v--
    vel[k] = v
    sum += v
  }
  for (let k = 0; k < n; k++) {
    const x = pos[k] + vel[k]
    pos[k] = x >= L ? x - L : x
  }
  road.t++
  return sum
}

// Flow (cars passing a point per step, i.e. per cell per step averaged over
// the ring), mean speed and share of stopped cars, from the current speeds.
export function roadStats(road) {
  const { L, n, vel } = road
  let sum = 0
  let stopped = 0
  for (let k = 0; k < n; k++) {
    sum += vel[k]
    if (vel[k] === 0) stopped++
  }
  return { flow: sum / L, speed: sum / n, stopped: stopped / n }
}

// The road as a row of cells: −1 for empty, otherwise the car's speed.
export function roadRow(road, out = new Int8Array(road.L)) {
  out.fill(-1)
  for (let k = 0; k < road.n; k++) out[road.pos[k]] = road.vel[k]
  return out
}

// Time-averaged flow after a warm-up, for the fundamental diagram.
export function measureFlow(L, density, vmax, p, random, warm, steps) {
  const road = createRoad(L, density, random)
  for (let t = 0; t < warm; t++) trafficStep(road, vmax, p, random)
  let sum = 0
  for (let t = 0; t < steps; t++) sum += trafficStep(road, vmax, p, random)
  return sum / (steps * L)
}

// The flow of the deterministic model (p = 0) in its stationary state.
export const flowNoBraking = (density, vmax) => Math.min(density * vmax, 1 - density)
