import { mulberry32, randInt } from './rng.js'
import { runSpaceTime, singleCellRow } from './ca.js'

// Fractal shapes and box counting.
//
// Every shape is a binary image: a Uint8Array of g × g pixels (row-major, 1 =
// occupied) on a grid of side g. Box counting covers the image with boxes of
// side s pixels (ε = s / g of the whole side) and counts the boxes that hold at
// least one occupied pixel.

export const GRID_SIDE = 1024

// ---------------------------------------------------------------- Drawing

// Sets the pixels on the straight line between two pixel positions
// (Bresenham), so a polyline leaves no gaps.
function plotLine(img, g, x0, y0, x1, y1) {
  const dx = Math.abs(x1 - x0)
  const dy = -Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy
  for (;;) {
    if (x0 >= 0 && y0 >= 0 && x0 < g && y0 < g) img[y0 * g + x0] = 1
    if (x0 === x1 && y0 === y1) return
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x0 += sx
    }
    if (e2 <= dx) {
      err += dx
      y0 += sy
    }
  }
}

// Rasterises a polyline given as [x0, y0, x1, y1, …] in unit coordinates.
function rasterise(xy, g) {
  const img = new Uint8Array(g * g)
  const px = (v) => Math.min(g - 1, Math.max(0, Math.floor(v * g)))
  for (let i = 0; i + 3 < xy.length; i += 2) plotLine(img, g, px(xy[i]), px(xy[i + 1]), px(xy[i + 2]), px(xy[i + 3]))
  return img
}

// ---------------------------------------------------------------- Shapes

// Vertices of the Koch curve after n iterations, from (0, 0) to (1, 0) with
// the bumps pointing towards +y: 4ⁿ + 1 points as [x0, y0, x1, y1, …].
export function kochPoints(n) {
  let pts = [0, 0, 1, 0]
  const c = Math.cos(Math.PI / 3)
  const s = Math.sin(Math.PI / 3)
  for (let it = 0; it < n; it++) {
    const next = [pts[0], pts[1]]
    for (let i = 0; i + 3 < pts.length; i += 2) {
      const ax = pts[i]
      const ay = pts[i + 1]
      const dx = (pts[i + 2] - ax) / 3
      const dy = (pts[i + 3] - ay) / 3
      const bx = ax + dx
      const by = ay + dy
      // The peak: the middle third turned by 60°.
      const px = bx + dx * c - dy * s
      const py = by + dx * s + dy * c
      next.push(bx, by, px, py, ax + 2 * dx, ay + 2 * dy, pts[i + 2], pts[i + 3])
    }
    pts = next
  }
  return pts
}

// Diagonal from corner to corner: a line, D = 1.
export function lineImage(g = GRID_SIDE) {
  const img = new Uint8Array(g * g)
  for (let i = 0; i < g; i++) img[i * g + i] = 1
  return img
}

// Every pixel occupied: a filled square, D = 2.
export function squareImage(g = GRID_SIDE) {
  return new Uint8Array(g * g).fill(1)
}

// The Koch curve across the middle of the image (its height is √3/6 of its width).
export function kochImage(n, g = GRID_SIDE) {
  const pts = kochPoints(n)
  const base = 0.5 + Math.sqrt(3) / 12
  for (let i = 1; i < pts.length; i += 2) pts[i] = base - pts[i]
  return rasterise(pts, g)
}

// The Sierpiński triangle as Rule 90 grows it from a single cell (Module 05):
// row t of the space–time diagram becomes image row t, squeezed by two
// horizontally (live cells in a row are always an even distance apart).
export function sierpinskiImage(g = GRID_SIDE) {
  const width = 2 * g + 1
  const { cells } = runSpaceTime(singleCellRow(width), g - 1, 90, false)
  const img = new Uint8Array(g * g)
  const centre = width >> 1
  for (let t = 0; t < g; t++) {
    for (let i = centre - t; i <= centre + t; i += 2) {
      if (cells[t * width + i]) img[t * g + ((i - centre + g) >> 1)] = 1
    }
  }
  return img
}

// The path of a lattice random walk of `steps` steps from the centre, kept
// inside the image by reflecting at the edges. Its trace has D = 2 in the
// limit of infinitely long walks.
export function randomWalkImage(steps, seed, g = GRID_SIDE) {
  const random = mulberry32(seed)
  const img = new Uint8Array(g * g)
  let x = g >> 1
  let y = g >> 1
  img[y * g + x] = 1
  for (let k = 0; k < steps; k++) {
    const d = randInt(random, 4)
    if (d === 0) x = x + 1 < g ? x + 1 : x - 1
    else if (d === 1) x = x > 0 ? x - 1 : x + 1
    else if (d === 2) y = y + 1 < g ? y + 1 : y - 1
    else y = y > 0 ? y - 1 : y + 1
    img[y * g + x] = 1
  }
  return img
}

// ---------------------------------------------------------------- DLA

// Diffusion-limited aggregation on a g × g square lattice. A seed sits in the
// centre; each walker starts on a circle just outside the cluster, wanders
// with nearest-neighbour steps and sticks to the first site it reaches next
// to the cluster. Far from the cluster a walker takes long straight jumps (it
// cannot touch anything within its distance minus the cluster radius), and a
// walker that strays beyond the kill circle is relaunched. Growth stops when
// the cluster comes within `margin` of the edge.
export function createDLA(g, seed, margin = 8) {
  const img = new Uint8Array(g * g)
  const c = g >> 1
  img[c * g + c] = 1
  return {
    g,
    img,
    random: mulberry32(seed),
    count: 1,
    rMax: 0, // largest distance of a particle from the seed
    full: false,
    margin,
    order: [c * g + c], // pixel index of every particle, in order of arrival
  }
}

const touches = (img, g, x, y) =>
  img[y * g + x + 1] || img[y * g + x - 1] || img[(y + 1) * g + x] || img[(y - 1) * g + x]

// Adds one particle; returns false once the cluster has reached the edge.
export function addDLAParticle(st) {
  const { g, img, random } = st
  if (st.full) return false
  const c = g >> 1
  const rLaunch = st.rMax + 5
  const rKill = Math.min(3 * rLaunch + 20, c - 2)
  for (;;) {
    const a = random() * 2 * Math.PI
    let x = Math.round(c + rLaunch * Math.cos(a))
    let y = Math.round(c + rLaunch * Math.sin(a))
    for (;;) {
      const dx = x - c
      const dy = y - c
      const r = Math.sqrt(dx * dx + dy * dy)
      if (r > rKill) break // relaunch
      const gap = r - st.rMax - 3
      if (gap > 2) {
        // Long jump: no cluster site lies within `gap` of the walker.
        const b = random() * 2 * Math.PI
        x = Math.round(x + gap * Math.cos(b))
        y = Math.round(y + gap * Math.sin(b))
        continue
      }
      const d = randInt(random, 4)
      if (d === 0) x++
      else if (d === 1) x--
      else if (d === 2) y++
      else y--
      if (touches(img, g, x, y)) {
        const i = y * g + x
        img[i] = 1
        st.order.push(i)
        st.count++
        const rr = Math.sqrt((x - c) ** 2 + (y - c) ** 2)
        if (rr > st.rMax) st.rMax = rr
        if (st.rMax > c - st.margin) st.full = true
        return true
      }
    }
  }
}

// Generator form, for growing a cluster across animation frames: yields the
// particle count after each new particle, up to `target` particles.
export function* growDLA(st, target) {
  while (st.count < target && addDLAParticle(st)) yield st.count
}

// Radius of gyration of the cluster, in lattice units.
export function radiusOfGyration(st) {
  const { g, order } = st
  let sx = 0
  let sy = 0
  for (const i of order) {
    sx += i % g
    sy += (i / g) | 0
  }
  const mx = sx / order.length
  const my = sy / order.length
  let s2 = 0
  for (const i of order) s2 += (i % g - mx) ** 2 + (((i / g) | 0) - my) ** 2
  return Math.sqrt(s2 / order.length)
}

// Mass–radius estimate of the dimension of a DLA cluster: M(r), the number of
// particles within distance r of the seed, grows like r^D. Radii run from
// `rMin` in steps of √2 up to half the cluster radius, since the outer rim is
// still growing and holds less mass than it eventually will. The slope of the
// least-squares line through log M against log r is the estimate.
export function massRadius(st, rMin = 4) {
  const { g, order } = st
  const c = g >> 1
  const d = new Float64Array(order.length)
  for (let k = 0; k < order.length; k++) d[k] = Math.hypot((order[k] % g) - c, ((order[k] / g) | 0) - c)
  d.sort()
  const rHi = st.rMax / 2
  const points = []
  let n = 0
  for (let r = rMin; r <= rHi * (1 + 1e-9); r *= Math.SQRT2) {
    while (n < d.length && d[n] <= r) n++
    points.push({ r, m: n })
  }
  if (points.length < 3) return { slope: NaN, rMin, rMax: rHi, points: points.length }
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (const { r, m } of points) {
    const x = Math.log(r)
    const y = Math.log(m)
    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
  }
  const N = points.length
  const slope = (N * sxy - sx * sy) / (N * sxx - sx * sx)
  return { slope, rMin, rMax: points[N - 1].r, points: N }
}

// ---------------------------------------------------------------- Box counting

// Box sides from 1 pixel to g/2, about √2 apart.
export function boxSizes(g = GRID_SIDE) {
  const out = []
  for (let k = 0; 2 ** (k / 2) <= g / 2 + 1e-9; k++) {
    const s = Math.round(2 ** (k / 2))
    if (s !== out[out.length - 1]) out.push(s)
  }
  return out
}

// Indices of the occupied pixels of an image.
export function occupied(img) {
  let n = 0
  for (let i = 0; i < img.length; i++) n += img[i]
  const out = new Uint32Array(n)
  for (let i = 0, k = 0; i < img.length; i++) if (img[i]) out[k++] = i
  return out
}

// Number of boxes of side s pixels that hold an occupied pixel, for each s
// in `sizes`. `pixels` comes from occupied(); boxes are aligned to the
// top-left corner and the last row and column of boxes may be partial.
export function boxCount(pixels, g, sizes) {
  const counts = []
  const mark = new Int32Array(g * g) // big enough for s = 1
  for (let k = 0; k < sizes.length; k++) {
    const s = sizes[k]
    const nb = Math.ceil(g / s)
    const stamp = k + 1
    let n = 0
    for (let j = 0; j < pixels.length; j++) {
      const p = pixels[j]
      const b = Math.floor(((p / g) | 0) / s) * nb + Math.floor((p % g) / s)
      if (mark[b] !== stamp) {
        mark[b] = stamp
        n++
      }
    }
    counts.push(n)
  }
  return counts
}

// Box indices (bx, by) occupied at side s, for drawing the overlay.
export function occupiedBoxes(pixels, g, s) {
  const nb = Math.ceil(g / s)
  const seen = new Uint8Array(nb * nb)
  for (let j = 0; j < pixels.length; j++) {
    const p = pixels[j]
    seen[Math.floor(((p / g) | 0) / s) * nb + Math.floor((p % g) / s)] = 1
  }
  return { nb, seen }
}

// Least-squares fit of log N against log(1/ε) for the boxes with index
// lo … hi (inclusive) in `sizes`: the slope is the box-counting dimension.
export function fitDimension(sizes, counts, g, lo, hi) {
  let n = 0
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (let k = lo; k <= hi; k++) {
    if (!(counts[k] > 0)) continue
    const x = Math.log(g / sizes[k])
    const y = Math.log(counts[k])
    n++
    sx += x
    sy += y
    sxx += x * x
    sxy += x * y
  }
  if (n < 2) return { slope: NaN, intercept: NaN, points: n }
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  return { slope, intercept: (sy - slope * sx) / n, points: n }
}
