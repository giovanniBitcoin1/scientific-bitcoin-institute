// Flocking on a square torus of side L: Reynolds' boids and the Vicsek model.
//
// Boids. Each boid has a position and a velocity. At every step, all boids
// at once look at their neighbours and steer by three weighted rules:
//   separation  away from neighbours closer than SEP_DIST;
//   alignment   towards the neighbours' average heading;
//   cohesion    towards the neighbours' average position;
// then turn by a random angle (noise) and move. Neighbours are either all
// boids within the perception radius ('metric') or the k nearest whatever
// their distance ('topological'), in both cases only those inside the field
// of view. An optional predator chases the nearest boid; boids within
// FLEE_DIST of it steer away.
//
// Vicsek. Particles move at constant speed v0. Each takes the average heading
// of all particles within radius r (itself included), plus a random angle
// uniform in [−η/2, η/2], then moves.

import { mulberry32 } from './rng.js'

export const SEP_DIST = 4 // personal space, world units
export const FLEE_DIST = 18
const FLEE_WEIGHT = 4
const MAX_FORCE = 0.06 // steering per step, as a fraction of max speed
const MIN_SPEED = 0.6 // as a fraction of max speed
const PRED_SPEED = 1.15 // as a fraction of max speed
const PRED_FORCE = 0.08
const TOPO_CELL = 6 // grid cell for topological searches, world units

// ---------------------------------------------------------------- grid

// A uniform grid of G × G cells on the torus; boids are bucketed by a
// counting sort, so cell c holds items[start[c] … start[c + 1] − 1].
function createGrid(L, cell, n) {
  const G = Math.max(1, Math.floor(L / cell))
  return { G, size: L / G, start: new Int32Array(G * G + 1), items: new Int32Array(n), cellOf: new Int32Array(n) }
}

function fillGrid(grid, x, y, n) {
  const { G, size, start, items, cellOf } = grid
  start.fill(0)
  for (let i = 0; i < n; i++) {
    const cx = Math.min(G - 1, Math.floor(x[i] / size))
    const cy = Math.min(G - 1, Math.floor(y[i] / size))
    const c = cy * G + cx
    cellOf[i] = c
    start[c + 1]++
  }
  for (let c = 0; c < G * G; c++) start[c + 1] += start[c]
  const fill = start.slice(0, G * G)
  for (let i = 0; i < n; i++) items[fill[cellOf[i]]++] = i
}

// Calls fn(j) for every item in the cells at Chebyshev distance exactly m
// from cell (cx, cy). Returns false when the ring would wrap onto itself
// (2m + 1 > G), in which case nothing is visited.
function visitRing(grid, cx, cy, m, fn) {
  const { G, start, items } = grid
  if (2 * m + 1 > G) return false
  const visit = (dx, dy) => {
    const c = ((cy + dy + G) % G) * G + ((cx + dx + G) % G)
    for (let q = start[c]; q < start[c + 1]; q++) fn(items[q])
  }
  if (m === 0) {
    visit(0, 0)
    return true
  }
  for (let d = -m; d <= m; d++) {
    visit(d, -m)
    visit(d, m)
  }
  for (let d = -m + 1; d <= m - 1; d++) {
    visit(-m, d)
    visit(m, d)
  }
  return true
}

// Shortest displacement on a torus of side L.
const wrapD = (d, L) => (d > L / 2 ? d - L : d < -L / 2 ? d + L : d)

// ---------------------------------------------------------------- boids

export function createFlock(N, L, vmax, random) {
  const f = {
    N,
    L,
    x: new Float64Array(N),
    y: new Float64Array(N),
    vx: new Float64Array(N),
    vy: new Float64Array(N),
    nvx: new Float64Array(N),
    nvy: new Float64Array(N),
    nbr: new Int32Array(N),
    nbrD: new Float64Array(N),
    predator: { x: L / 2, y: L / 2, vx: 0, vy: 0 },
    grid: null,
    gridCell: 0,
    t: 0,
  }
  for (let i = 0; i < N; i++) {
    f.x[i] = random() * L
    f.y[i] = random() * L
    const a = random() * 2 * Math.PI
    const s = vmax * (MIN_SPEED + (1 - MIN_SPEED) * random())
    f.vx[i] = s * Math.cos(a)
    f.vy[i] = s * Math.sin(a)
  }
  // The predator starts at a random point, heading nowhere in particular.
  f.predator.x = random() * L
  f.predator.y = random() * L
  return f
}

function ensureGrid(f, cell) {
  if (!f.grid || f.gridCell !== cell) {
    f.grid = createGrid(f.L, cell, f.N)
    f.gridCell = cell
  }
  fillGrid(f.grid, f.x, f.y, f.N)
  return f.grid
}

// True if the displacement (dx, dy) lies inside boid i's field of view,
// a cone of total angle fov (radians) centred on its velocity.
function inView(f, i, dx, dy, cosHalf) {
  if (cosHalf <= -1) return true
  const v = Math.hypot(f.vx[i], f.vy[i])
  const d = Math.hypot(dx, dy)
  if (v === 0 || d === 0) return true
  return (f.vx[i] * dx + f.vy[i] * dy) / (v * d) >= cosHalf
}

// Fills f.nbr / f.nbrD with boid i's neighbours and returns how many.
// Metric: everyone within `radius`. Topological: the k nearest. Both only
// inside the field of view. The grid must be filled already.
export function findNeighbours(f, i, p) {
  const { L, x, y, nbr, nbrD, grid } = f
  const cosHalf = p.fov >= 2 * Math.PI - 1e-9 ? -1 : Math.cos(p.fov / 2)
  const cx = Math.min(grid.G - 1, Math.floor(x[i] / grid.size))
  const cy = Math.min(grid.G - 1, Math.floor(y[i] / grid.size))
  let count = 0

  if (p.mode === 'metric') {
    const r2 = p.radius * p.radius
    const consider = (j) => {
      if (j === i) return
      const dx = wrapD(x[j] - x[i], L)
      const dy = wrapD(y[j] - y[i], L)
      const d2 = dx * dx + dy * dy
      if (d2 > r2 || !inView(f, i, dx, dy, cosHalf)) return
      nbr[count] = j
      nbrD[count++] = Math.sqrt(d2)
    }
    const rings = Math.ceil(p.radius / grid.size)
    if (2 * rings + 1 > grid.G) for (let j = 0; j < f.N; j++) consider(j)
    else for (let m = 0; m <= rings; m++) visitRing(grid, cx, cy, m, consider)
    return count
  }

  // Topological: keep the k nearest in a sorted list, searching outwards
  // ring by ring. Every boid beyond ring m is at least m · cell away.
  const k = Math.min(p.k, f.N - 1)
  if (k <= 0) return 0
  const consider = (j) => {
    if (j === i) return
    const dx = wrapD(x[j] - x[i], L)
    const dy = wrapD(y[j] - y[i], L)
    const d = Math.hypot(dx, dy)
    if (count === k && d >= nbrD[k - 1]) return
    if (!inView(f, i, dx, dy, cosHalf)) return
    let q = count < k ? count++ : k - 1
    while (q > 0 && nbrD[q - 1] > d) {
      nbrD[q] = nbrD[q - 1]
      nbr[q] = nbr[q - 1]
      q--
    }
    nbrD[q] = d
    nbr[q] = j
  }
  for (let m = 0; ; m++) {
    if (!visitRing(grid, cx, cy, m, consider)) {
      // The rings now wrap the torus: finish with a plain scan.
      count = 0
      for (let j = 0; j < f.N; j++) consider(j)
      break
    }
    if (count === k && nbrD[k - 1] <= m * grid.size) break
  }
  return count
}

// Adds w × (a steering force towards direction (dx, dy) at full speed) to acc.
function steer(acc, f, i, dx, dy, w, vmax, force) {
  const d = Math.hypot(dx, dy)
  if (d === 0 || w === 0) return
  let sx = (dx / d) * vmax - f.vx[i]
  let sy = (dy / d) * vmax - f.vy[i]
  const s = Math.hypot(sx, sy)
  if (s > force) {
    sx *= force / s
    sy *= force / s
  }
  acc[0] += w * sx
  acc[1] += w * sy
}

// One synchronous step. p = { sep, ali, coh, radius, fov (radians), vmax,
// noise (radians: turns are uniform in ±noise/2), mode, k, predator }.
export function flockStep(f, p, random) {
  const { N, L, x, y, vx, vy, nvx, nvy, nbr, nbrD } = f
  const grid = ensureGrid(f, p.mode === 'metric' ? Math.max(p.radius, 1) : TOPO_CELL)
  const force = MAX_FORCE * p.vmax
  const pred = f.predator
  const acc = [0, 0]
  for (let i = 0; i < N; i++) {
    const n = findNeighbours(f, i, p)
    acc[0] = 0
    acc[1] = 0
    if (n > 0) {
      let sx = 0
      let sy = 0
      let ax = 0
      let ay = 0
      let cx = 0
      let cy = 0
      for (let q = 0; q < n; q++) {
        const j = nbr[q]
        const dx = wrapD(x[j] - x[i], L)
        const dy = wrapD(y[j] - y[i], L)
        const d = nbrD[q]
        if (d < SEP_DIST && d > 0) {
          sx -= dx / (d * d)
          sy -= dy / (d * d)
        }
        const v = Math.hypot(vx[j], vy[j]) || 1
        ax += vx[j] / v
        ay += vy[j] / v
        cx += dx
        cy += dy
      }
      steer(acc, f, i, sx, sy, p.sep, p.vmax, force)
      steer(acc, f, i, ax, ay, p.ali, p.vmax, force)
      steer(acc, f, i, cx / n, cy / n, p.coh, p.vmax, force)
    }
    if (p.predator) {
      const dx = wrapD(x[i] - pred.x, L)
      const dy = wrapD(y[i] - pred.y, L)
      if (dx * dx + dy * dy < FLEE_DIST * FLEE_DIST) steer(acc, f, i, dx, dy, FLEE_WEIGHT, p.vmax, force)
    }
    let ux = vx[i] + acc[0]
    let uy = vy[i] + acc[1]
    if (p.noise > 0) {
      const a = (random() - 0.5) * p.noise
      const c = Math.cos(a)
      const s = Math.sin(a)
      const t = ux * c - uy * s
      uy = ux * s + uy * c
      ux = t
    }
    const sp = Math.hypot(ux, uy)
    const target = Math.min(p.vmax, Math.max(MIN_SPEED * p.vmax, sp))
    if (sp > 0) {
      ux *= target / sp
      uy *= target / sp
    } else {
      ux = target
    }
    nvx[i] = ux
    nvy[i] = uy
  }
  for (let i = 0; i < N; i++) {
    vx[i] = nvx[i]
    vy[i] = nvy[i]
    x[i] = (((x[i] + vx[i]) % L) + L) % L
    y[i] = (((y[i] + vy[i]) % L) + L) % L
  }
  if (p.predator) movePredator(f, p)
  f.t++
}

// The predator steers towards the nearest boid, a little faster than them.
function movePredator(f, p) {
  const { L, x, y, N } = f
  const pred = f.predator
  let best = Infinity
  let tx = 0
  let ty = 0
  for (let i = 0; i < N; i++) {
    const dx = wrapD(x[i] - pred.x, L)
    const dy = wrapD(y[i] - pred.y, L)
    const d = dx * dx + dy * dy
    if (d < best) {
      best = d
      tx = dx
      ty = dy
    }
  }
  const speed = PRED_SPEED * p.vmax
  const d = Math.hypot(tx, ty)
  if (d > 0) {
    let sx = (tx / d) * speed - pred.vx
    let sy = (ty / d) * speed - pred.vy
    const s = Math.hypot(sx, sy)
    const force = PRED_FORCE * speed
    if (s > force) {
      sx *= force / s
      sy *= force / s
    }
    pred.vx += sx
    pred.vy += sy
  }
  const v = Math.hypot(pred.vx, pred.vy)
  if (v > speed) {
    pred.vx *= speed / v
    pred.vy *= speed / v
  }
  pred.x = (((pred.x + pred.vx) % L) + L) % L
  pred.y = (((pred.y + pred.vy) % L) + L) % L
}

// Neighbours of boid i under the current rules, without stepping (for
// drawing before the first step).
export function neighboursOf(f, i, p) {
  ensureGrid(f, p.mode === 'metric' ? Math.max(p.radius, 1) : TOPO_CELL)
  const n = findNeighbours(f, i, p)
  return Array.from(f.nbr.subarray(0, n))
}

// Order parameter: the length of the mean unit heading, 0 … 1.
export function flockOrder(f) {
  let sx = 0
  let sy = 0
  for (let i = 0; i < f.N; i++) {
    const v = Math.hypot(f.vx[i], f.vy[i]) || 1
    sx += f.vx[i] / v
    sy += f.vy[i] / v
  }
  return Math.hypot(sx, sy) / f.N
}

// Groups: connected components when boids closer than `link` are joined.
// Returns the number of groups and the share of boids in the largest.
export function flockGroups(f, link) {
  const { N, L, x, y } = f
  const grid = createGrid(L, link, N)
  fillGrid(grid, x, y, N)
  const parent = new Int32Array(N)
  for (let i = 0; i < N; i++) parent[i] = i
  const find = (i) => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]]
      i = parent[i]
    }
    return i
  }
  const l2 = link * link
  for (let i = 0; i < N; i++) {
    const cx = Math.min(grid.G - 1, Math.floor(x[i] / grid.size))
    const cy = Math.min(grid.G - 1, Math.floor(y[i] / grid.size))
    const join = (j) => {
      if (j <= i) return
      const dx = wrapD(x[j] - x[i], L)
      const dy = wrapD(y[j] - y[i], L)
      if (dx * dx + dy * dy <= l2) {
        const a = find(i)
        const b = find(j)
        if (a !== b) parent[a] = b
      }
    }
    if (grid.G < 3) for (let j = 0; j < N; j++) join(j)
    else for (let m = 0; m <= 1; m++) visitRing(grid, cx, cy, m, join)
  }
  const size = new Int32Array(N)
  let groups = 0
  let largest = 0
  for (let i = 0; i < N; i++) {
    const r = find(i)
    if (size[r]++ === 0) groups++
    if (size[r] > largest) largest = size[r]
  }
  return { groups, largest: largest / N }
}

// Mean distance from each boid to its nearest neighbour.
export function meanNearest(f) {
  if (f.N < 2) return 0
  const p = { mode: 'topological', k: 1, fov: 2 * Math.PI }
  ensureGrid(f, TOPO_CELL)
  let s = 0
  for (let i = 0; i < f.N; i++) {
    findNeighbours(f, i, p)
    s += f.nbrD[0]
  }
  return s / f.N
}

// ---------------------------------------------------------------- Vicsek

// N particles at density `density` (particles per unit area, with the
// interaction radius as unit), so the box side is √(N / density). Random
// positions; random headings, or all heading the same way if `aligned`.
export function createVicsek(N, density, random, aligned = false) {
  const L = Math.sqrt(N / density)
  const s = {
    N,
    L,
    x: new Float64Array(N),
    y: new Float64Array(N),
    th: new Float64Array(N),
    nth: new Float64Array(N),
    cs: new Float64Array(N),
    sn: new Float64Array(N),
    grid: createGrid(L, 1, N),
  }
  for (let i = 0; i < N; i++) {
    s.x[i] = random() * L
    s.y[i] = random() * L
    s.th[i] = aligned ? 0 : random() * 2 * Math.PI - Math.PI
  }
  return s
}

// One step with interaction radius 1, speed v0 and noise eta. The 3 × 3
// block of cells around each particle is scanned inline: this is the inner
// loop of the experiment, so it avoids closures.
export function vicsekStep(s, eta, v0, random) {
  const { N, L, x, y, th, nth, cs, sn, grid } = s
  fillGrid(grid, x, y, N)
  const { G, size, start, items } = grid
  const half = L / 2
  for (let i = 0; i < N; i++) {
    cs[i] = Math.cos(th[i])
    sn[i] = Math.sin(th[i])
  }
  for (let i = 0; i < N; i++) {
    const xi = x[i]
    const yi = y[i]
    let c = 0
    let sm = 0
    if (G < 3) {
      for (let j = 0; j < N; j++) {
        const dx = wrapD(x[j] - xi, L)
        const dy = wrapD(y[j] - yi, L)
        if (dx * dx + dy * dy <= 1) {
          c += cs[j]
          sm += sn[j]
        }
      }
    } else {
      const cx = Math.min(G - 1, Math.floor(xi / size))
      const cy = Math.min(G - 1, Math.floor(yi / size))
      for (let oy = -1; oy <= 1; oy++) {
        const row = ((cy + oy + G) % G) * G
        for (let ox = -1; ox <= 1; ox++) {
          const cell = row + ((cx + ox + G) % G)
          for (let q = start[cell], e = start[cell + 1]; q < e; q++) {
            const j = items[q]
            let dx = x[j] - xi
            let dy = y[j] - yi
            if (dx > half) dx -= L
            else if (dx < -half) dx += L
            if (dy > half) dy -= L
            else if (dy < -half) dy += L
            if (dx * dx + dy * dy <= 1) {
              c += cs[j]
              sm += sn[j]
            }
          }
        }
      }
    }
    nth[i] = Math.atan2(sm, c) + eta * (random() - 0.5)
  }
  for (let i = 0; i < N; i++) {
    th[i] = nth[i]
    x[i] = (((x[i] + v0 * Math.cos(th[i])) % L) + L) % L
    y[i] = (((y[i] + v0 * Math.sin(th[i])) % L) + L) % L
  }
}

export function vicsekOrder(s) {
  let c = 0
  let sn = 0
  for (let i = 0; i < s.N; i++) {
    c += Math.cos(s.th[i])
    sn += Math.sin(s.th[i])
  }
  return Math.hypot(c, sn) / s.N
}

// The order-against-noise experiment of Module 10, Panel B. Shared by the
// panel and by scripts/lab/precompute-vicsek.mjs, which stores its default
// run in src/data/lab/precomputed/vicsek.json.
export const VICSEK_EXPERIMENT = {
  density: 2,
  v0: 0.3,
  warm: 200, // steps to forget the aligned start
  measure: 100, // steps over which φ is averaged
  sample: 5, // steps between measurements of φ
  sizes: [100, 400, 1000],
  etas: Array.from({ length: 25 }, (_, k) => (k * 2 * Math.PI) / 24),
  runs: 3, // default R
}

// Generator: for every size N and noise η, R runs from an aligned start with
// fixed seeds; pushes { x: η, y: mean φ } into series[N] and yields progress.
export function* vicsekSweep(R, series, e = VICSEK_EXPERIMENT) {
  const steps = e.warm + e.measure
  const total = R * e.etas.length * e.sizes.reduce((a, n) => a + n, 0) * steps
  let done = 0
  for (const N of e.sizes) {
    for (let k = 0; k < e.etas.length; k++) {
      const eta = e.etas[k]
      let sum = 0
      for (let r = 0; r < R; r++) {
        const random = mulberry32(100003 * (r + 1) + 1009 * k + N)
        const s = createVicsek(N, e.density, random, true)
        let phi = 0
        let m = 0
        for (let t = 0; t < steps; t++) {
          vicsekStep(s, eta, e.v0, random)
          if (t >= e.warm && (t - e.warm) % e.sample === 0) {
            phi += vicsekOrder(s)
            m++
          }
          done += N
          if (t % 10 === 9) yield done / total
        }
        sum += phi / m
      }
      series[N].push({ x: eta, y: sum / R })
    }
  }
}
