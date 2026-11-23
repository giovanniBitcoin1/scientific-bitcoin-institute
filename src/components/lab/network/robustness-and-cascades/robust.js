import { buildCSR } from '../../graphUtils.js'
import { mulberry32 } from '../../rng.js'
import { giantCurve, degreesOf } from '../who-connects-to-whom/mixing.js'

// Network Lab module 11, "Robustness and cascades": removal of nodes in
// several orders, the robustness R and its optimisation by swaps, cascades of
// overload (Motter and Lai) and cascades between two networks that depend on
// each other (Buldyrev et al.). Plain functions on networks { n, A, B }
// (simple, undirected), shared by the page and by
// scripts/lab/check-network-11.mjs.

// A seed for the j-th item of a family.
export const seedOf = (seed, j) => (Math.imul(seed ^ 0x9e3779b9, 2654435761) + Math.imul(j + 1, 40503)) >>> 0

export function drain(job) {
  for (const _ of job.iter);
  return job.snapshot()
}

// ---------------------------------------------------------------- Random failure

// ⟨k⟩ and ⟨k²⟩ of a list of degrees.
export function moments(k) {
  let s1 = 0
  let s2 = 0
  for (let i = 0; i < k.length; i++) {
    s1 += k[i]
    s2 += k[i] * k[i]
  }
  return { mean: s1 / k.length, mean2: s2 / k.length }
}

// The critical fraction for random removal, f_c = 1 − 1/(⟨k²⟩/⟨k⟩ − 1): 0 when
// the intact network has no giant component to begin with.
export function criticalFraction(mean, mean2) {
  const kappa = mean2 / mean
  return kappa > 2 ? 1 - 1 / (kappa - 1) : 0
}

// ---------------------------------------------------------------- Orders of removal

// Highest degree first, the degrees recomputed after every removal. Among
// nodes of the same current degree the one whose degree changed last goes
// first (at the start, the lowest index): a fixed rule, so that the same
// network always gives the same order. O(N + L).
export function recomputedDegreeOrder(net) {
  const n = net.n
  const g = buildCSR(n, net.A, net.B)
  const deg = new Int32Array(n)
  let maxDeg = 0
  for (let v = 0; v < n; v++) {
    deg[v] = g.offsets[v + 1] - g.offsets[v]
    if (deg[v] > maxDeg) maxDeg = deg[v]
  }
  const head = new Int32Array(maxDeg + 1).fill(-1)
  const node = new Int32Array(n + 2 * g.m)
  const next = new Int32Array(n + 2 * g.m)
  let entries = 0
  const push = (v) => {
    node[entries] = v
    next[entries] = head[deg[v]]
    head[deg[v]] = entries++
  }
  for (let v = n - 1; v >= 0; v--) push(v)
  const removed = new Uint8Array(n)
  const order = new Int32Array(n)
  let count = 0
  let d = maxDeg
  while (count < n) {
    while (head[d] < 0) d--
    const e = head[d]
    head[d] = next[e]
    const v = node[e]
    if (removed[v] || deg[v] !== d) continue
    removed[v] = 1
    order[count++] = v
    for (let i = g.offsets[v]; i < g.offsets[v + 1]; i++) {
      const u = g.neighbors[i]
      if (removed[u]) continue
      deg[u]--
      push(u)
    }
  }
  return order
}

// The order that a slow, direct method gives: at every step scan all the nodes
// left for the highest current degree. Only for checks (ties: any).
export function recomputedDegreesAlong(net, order) {
  const n = net.n
  const g = buildCSR(n, net.A, net.B)
  const deg = new Int32Array(n)
  for (let v = 0; v < n; v++) deg[v] = g.offsets[v + 1] - g.offsets[v]
  const removed = new Uint8Array(n)
  const out = []
  for (let j = 0; j < n; j++) {
    let best = -1
    for (let v = 0; v < n; v++) if (!removed[v] && deg[v] > best) best = deg[v]
    const v = order[j]
    out.push({ degree: deg[v], highest: best })
    removed[v] = 1
    for (let i = g.offsets[v]; i < g.offsets[v + 1]; i++) if (!removed[g.neighbors[i]]) deg[g.neighbors[i]]--
  }
  return out
}

// ---------------------------------------------------------------- Loads (betweenness)

// Shortest paths through every node, among the nodes still `alive` (Brandes'
// algorithm, every link of length 1). out[v] = number of pairs {s, t}, both
// different from v, weighted by the share of their shortest paths that pass
// through v. With `endpoints`, v is also counted on the paths that start or end
// at it: one more for every node it can reach. `from`/`to` restrict the
// sources, so that a long computation can be spread over animation frames;
// call it with the same `out` and `ws` until every source is done, then halve
// (see `loads`).
export function loadsFrom(g, alive, endpoints, out, ws, from = 0, to = g.n) {
  const n = g.n
  if (!ws.sigma) {
    ws.sigma = new Float64Array(n)
    ws.delta = new Float64Array(n)
    ws.dist = new Int32Array(n)
    ws.queue = new Int32Array(n)
  }
  const { sigma, delta, dist, queue } = ws
  const { offsets, neighbors } = g
  for (let s = from; s < to; s++) {
    if (alive && !alive[s]) continue
    dist.fill(-1)
    dist[s] = 0
    sigma[s] = 1
    queue[0] = s
    let tail = 1
    for (let h = 0; h < tail; h++) {
      const v = queue[h]
      const dv = dist[v] + 1
      for (let i = offsets[v], end = offsets[v + 1]; i < end; i++) {
        const u = neighbors[i]
        if (alive && !alive[u]) continue
        if (dist[u] < 0) {
          dist[u] = dv
          sigma[u] = 0
          delta[u] = 0
          queue[tail++] = u
        }
        if (dist[u] === dv) sigma[u] += sigma[v]
      }
    }
    delta[s] = 0
    for (let h = tail - 1; h > 0; h--) {
      const v = queue[h]
      const f = (1 + delta[v]) / sigma[v]
      const dv = dist[v] - 1
      for (let i = offsets[v], end = offsets[v + 1]; i < end; i++) {
        const u = neighbors[i]
        if (dist[u] === dv && (!alive || alive[u])) delta[u] += sigma[u] * f
      }
      out[v] += delta[v] + (endpoints ? 1 : 0)
    }
    if (endpoints) out[s] += tail - 1
  }
  return out
}

// The loads of every node at once (each unordered pair counted once).
export function loads(g, alive = null, endpoints = false, ws = {}) {
  const out = loadsFrom(g, alive, endpoints, new Float64Array(g.n), ws)
  for (let v = 0; v < g.n; v++) out[v] /= 2
  return out
}

// The same numbers by a direct count over all pairs, for checks: the share of
// the shortest paths from s to t that pass through v is σ_sv σ_vt / σ_st when
// d(s, v) + d(v, t) = d(s, t).
export function loadsBrute(g, alive = null, endpoints = false) {
  const n = g.n
  const ok = (v) => !alive || alive[v]
  const D = []
  const S = []
  for (let s = 0; s < n; s++) {
    const dist = new Int32Array(n).fill(-1)
    const sigma = new Float64Array(n)
    if (ok(s)) {
      dist[s] = 0
      sigma[s] = 1
      const queue = [s]
      for (let h = 0; h < queue.length; h++) {
        const v = queue[h]
        for (let i = g.offsets[v]; i < g.offsets[v + 1]; i++) {
          const u = g.neighbors[i]
          if (!ok(u)) continue
          if (dist[u] < 0) {
            dist[u] = dist[v] + 1
            queue.push(u)
          }
          if (dist[u] === dist[v] + 1) sigma[u] += sigma[v]
        }
      }
    }
    D.push(dist)
    S.push(sigma)
  }
  const out = new Float64Array(n)
  for (let s = 0; s < n; s++)
    for (let t = s + 1; t < n; t++) {
      if (D[s][t] < 0) continue
      if (endpoints) {
        out[s]++
        out[t]++
      }
      for (let v = 0; v < n; v++) if (v !== s && v !== t && D[s][v] >= 0 && D[s][v] + D[v][t] === D[s][t]) out[v] += (S[s][v] * S[t][v]) / S[s][t]
    }
  return out
}

// Removal by betweenness, as a job. Without `recompute` the betweenness of the
// intact network ranks the nodes once. With it, the betweenness of what is
// left is computed again before every removal (N² L operations: for small
// networks only); once no node lies between two others, the rest go by
// current degree. Ties: the lowest index first.
export function betweennessOrderJob(net, { recompute = false } = {}) {
  const n = net.n
  const g = buildCSR(n, net.A, net.B)
  const order = new Int32Array(n)
  let count = 0
  const CHUNK = 20
  function* iter() {
    const ws = {}
    if (!recompute) {
      const bc = new Float64Array(n)
      for (let s = 0; s < n; s += CHUNK) {
        loadsFrom(g, null, false, bc, ws, s, Math.min(n, s + CHUNK))
        yield Math.min(1, (s + CHUNK) / n)
      }
      const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => bc[b] - bc[a] || a - b)
      order.set(idx)
      count = n
      return
    }
    const alive = new Uint8Array(n).fill(1)
    const deg = new Int32Array(n)
    for (let v = 0; v < n; v++) deg[v] = g.offsets[v + 1] - g.offsets[v]
    const bc = new Float64Array(n)
    const remove = (v) => {
      alive[v] = 0
      order[count++] = v
      for (let i = g.offsets[v]; i < g.offsets[v + 1]; i++) if (alive[g.neighbors[i]]) deg[g.neighbors[i]]--
    }
    let flat = false // true once every betweenness is zero
    while (count < n) {
      let best = -1
      if (!flat) {
        bc.fill(0)
        for (let s = 0; s < n; s += CHUNK) {
          loadsFrom(g, alive, false, bc, ws, s, Math.min(n, s + CHUNK))
          if ((s / CHUNK) % 8 === 7) yield count / n
        }
        let top = 1e-9
        for (let v = 0; v < n; v++)
          if (alive[v] && bc[v] > top) {
            top = bc[v]
            best = v
          }
        if (best < 0) flat = true
      }
      if (best < 0) {
        let top = -1
        for (let v = 0; v < n; v++)
          if (alive[v] && deg[v] > top) {
            top = deg[v]
            best = v
          }
      }
      remove(best)
      yield count / n
    }
  }
  return { iter: iter(), snapshot: () => ({ order, count, done: count === n }) }
}

// ---------------------------------------------------------------- Robustness R

// R = (1/N) Σ_{Q=1..N} s(Q), with s(Q) the share of the nodes in the largest
// component after Q removals (Schneider et al. 2011). `curve` is giantCurve's.
export function robustness(curve) {
  const n = curve.length - 1
  let sum = 0
  for (let q = 1; q <= n; q++) sum += curve[q]
  return sum / n
}

// The fraction removed at which the largest component first holds less than
// `share` of the N nodes.
export function collapsePoint(curve, share = 0.01) {
  const n = curve.length - 1
  for (let q = 0; q <= n; q++) if (curve[q] < share) return q / n
  return 1
}

// The largest component for every number of removed nodes, by a direct search
// of the components at every step: for checks.
export function giantCurveBrute(net, order) {
  const n = net.n
  const g = buildCSR(n, net.A, net.B)
  const alive = new Uint8Array(n).fill(1)
  const curve = new Float64Array(n + 1)
  for (let q = 0; q <= n; q++) {
    if (q > 0) alive[order[q - 1]] = 0
    curve[q] = largestComponent(g, alive).size / n
  }
  return curve
}

// The largest component among the nodes still alive: its size and its nodes
// (the one found first when two are equally large).
export function largestComponent(g, alive, ws = {}) {
  const n = g.n
  if (!ws.label) {
    ws.label = new Int32Array(n)
    ws.queue = new Int32Array(n)
  }
  const { label, queue } = ws
  label.fill(-1)
  let best = 0
  let bestLabel = -1
  for (let s = 0; s < n; s++) {
    if ((alive && !alive[s]) || label[s] >= 0) continue
    label[s] = s
    queue[0] = s
    let tail = 1
    for (let h = 0; h < tail; h++) {
      const v = queue[h]
      for (let i = g.offsets[v], end = g.offsets[v + 1]; i < end; i++) {
        const u = g.neighbors[i]
        if ((alive && !alive[u]) || label[u] >= 0) continue
        label[u] = s
        queue[tail++] = u
      }
    }
    if (tail > best) {
      best = tail
      bestLabel = s
    }
  }
  return { size: best, label, id: bestLabel }
}

// R of a network under the attack by recomputed degree.
export function attackRobustness(net) {
  return robustness(giantCurve(net, recomputedDegreeOrder(net)))
}

const keyOf = (n, a, b) => (a < b ? a * n + b : b * n + a)

// "Make it robust": swaps that keep every degree, accepted only when R under
// the attack by recomputed degree rises (Schneider et al. 2011). One step
// takes two links a–b and c–d at random and proposes a–d and c–b; a swap that
// would make a self-link or a repeated link is not tried. `onAccept(net)` is
// for checks.
export function onionJob(net, seed, { attempts = 20000, onAccept = null } = {}) {
  const n = net.n
  const A = Int32Array.from(net.A)
  const B = Int32Array.from(net.B)
  const L = A.length
  const work = { n, A, B }
  const random = mulberry32(seed)
  const keys = new Set()
  for (let e = 0; e < L; e++) keys.add(keyOf(n, A[e], B[e]))
  const curve0 = giantCurve(work, recomputedDegreeOrder(work))
  const R0 = robustness(curve0)
  let R = R0
  let curve = curve0
  let tried = 0
  let accepted = 0
  const history = [[0, R0]]
  function* iter() {
    while (tried < attempts) {
      tried++
      const e1 = Math.floor(random() * L)
      const e2 = Math.floor(random() * L)
      let a = A[e1]
      let b = B[e1]
      let c = A[e2]
      let d = B[e2]
      if (random() < 0.5) [c, d] = [d, c]
      if (e1 !== e2 && a !== c && a !== d && b !== c && b !== d) {
        const k1 = keyOf(n, a, d)
        const k2 = keyOf(n, c, b)
        if (!keys.has(k1) && !keys.has(k2)) {
          A[e1] = a
          B[e1] = d
          A[e2] = c
          B[e2] = b
          const next = giantCurve(work, recomputedDegreeOrder(work))
          const Rn = robustness(next)
          if (Rn > R) {
            keys.delete(keyOf(n, a, b))
            keys.delete(keyOf(n, c, d))
            keys.add(k1)
            keys.add(k2)
            R = Rn
            curve = next
            accepted++
            history.push([tried, R])
            if (onAccept) onAccept(work, R)
          } else {
            A[e1] = a
            B[e1] = b
            A[e2] = c
            B[e2] = d
          }
        }
      }
      if (tried % 8 === 0) yield tried / attempts
    }
  }
  return {
    iter: iter(),
    snapshot: () => ({ n, tried, attempts, accepted, R0, R, curve0, curve, history: history.slice(), net: { n, A: Int32Array.from(A), B: Int32Array.from(B) }, done: tried >= attempts }),
  }
}

// The share of the links that join two nodes whose degrees differ by at most
// one: a plain measure of how layered a wiring is.
export function sameLayerShare(net, k = degreesOf(net)) {
  let same = 0
  for (let e = 0; e < net.A.length; e++) if (Math.abs(k[net.A[e]] - k[net.B[e]]) <= 1) same++
  return net.A.length ? same / net.A.length : 0
}

// Who links to whom, by degree class. share[i][j] is, of all the link ends of
// the nodes in class i, the fraction whose other end is in class j (rows sum to
// 1); classes with no node are left out.
export const LAYERS = [[0, 2], [3, 3], [4, 4], [5, 6], [7, 10], [11, 20], [21, Infinity]]
export const layerName = ([lo, hi]) => (hi === Infinity ? `${lo}+` : lo === hi ? String(lo) : lo === 0 ? `≤${hi}` : `${lo}–${hi}`)
export function layerMatrix(net, k = degreesOf(net)) {
  const cls = (d) => LAYERS.findIndex(([lo, hi]) => d >= lo && d <= hi)
  const m = LAYERS.length
  const count = Array.from({ length: m }, () => new Float64Array(m))
  const nodes = new Int32Array(m)
  for (let v = 0; v < net.n; v++) nodes[cls(k[v])]++
  for (let e = 0; e < net.A.length; e++) {
    const i = cls(k[net.A[e]])
    const j = cls(k[net.B[e]])
    count[i][j]++
    count[j][i]++
  }
  const used = [...Array(m).keys()].filter((i) => nodes[i] > 0)
  return {
    names: used.map((i) => layerName(LAYERS[i])),
    nodes: used.map((i) => nodes[i]),
    share: used.map((i) => {
      const total = used.reduce((t, j) => t + count[i][j], 0)
      return used.map((j) => (total ? count[i][j] / total : 0))
    }),
  }
}

// ---------------------------------------------------------------- Overload (Motter and Lai)

export const EPS = 1e-9

// A cascade of overload. Every node can carry (1 + α) times the load it has in
// the intact network (`load0`, shortest paths through it, its own included).
// The trigger is removed; the loads of what is left are computed again, every
// node above its capacity fails at once, and so on until none does.
// failedRound[v]: −1 still working, 0 the trigger, r ≥ 1 failed in round r.
// As a generator, so that the page can spread it over animation frames.
export function* cascadeSteps(g, load0, alpha, trigger, state) {
  const n = g.n
  const alive = new Uint8Array(n).fill(1)
  const failedRound = new Int32Array(n).fill(-1)
  alive[trigger] = 0
  failedRound[trigger] = 0
  state.failedRound = failedRound
  state.alive = alive
  state.rounds = 0
  state.failed = 1
  const ws = {}
  const now = new Float64Array(n)
  const CHUNK = 25
  for (;;) {
    now.fill(0)
    for (let s = 0; s < n; s += CHUNK) {
      loadsFrom(g, alive, true, now, ws, s, Math.min(n, s + CHUNK))
      yield
    }
    let over = 0
    for (let v = 0; v < n; v++)
      if (alive[v] && now[v] / 2 > (1 + alpha) * load0[v] * (1 + EPS)) {
        failedRound[v] = state.rounds + 1
        over++
      }
    if (!over) break
    for (let v = 0; v < n; v++) if (failedRound[v] === state.rounds + 1) alive[v] = 0
    state.rounds++
    state.failed += over
  }
  const big = largestComponent(g, alive)
  state.G = big.size / n
  state.inGiant = Uint8Array.from({ length: n }, (_, v) => (alive[v] && big.label[v] === big.id ? 1 : 0))
  state.done = true
}

export function cascade(g, load0, alpha, trigger) {
  const state = {}
  for (const _ of cascadeSteps(g, load0, alpha, trigger, state));
  return state
}

// ---------------------------------------------------------------- Coupled networks

// One step of the cascade between two networks: keep only the largest
// component of `g` among the nodes alive. Returns its size and how many nodes
// were lost.
export function keepGiant(g, alive, ws) {
  const big = largestComponent(g, alive, ws)
  let lost = 0
  for (let v = 0; v < g.n; v++)
    if (alive[v] && big.label[v] !== big.id) {
      alive[v] = 0
      lost++
    }
  return { size: big.size, lost }
}

// Two networks A and B on the same N labels: node i of A depends on node i of
// B and the other way round, so a node works only if its partner does. Start
// from the nodes of A in `alive`; then, in turn, A keeps only its largest
// component, B loses the partners of the nodes A lost and keeps only its
// largest component, and so on until a step removes nothing. Returns the size
// of the mutual giant component, the largest component of A alone after the
// first removal, and the number of steps that removed something.
export function mutualGiant(a, b, alive, ws = {}) {
  let rounds = 0
  let single = 0
  let size = 0
  for (let step = 0; ; step++) {
    const r = keepGiant(step % 2 === 0 ? a : b, alive, ws)
    if (step === 0) single = r.size
    size = r.size
    if (r.lost) rounds++
    else if (step > 0) break
    if (size === 0) break
  }
  return { size, single, rounds }
}

// Theory for two coupled random networks of mean degree k when a fraction p of
// the nodes is kept: the mutual giant component holds a share x of all the
// nodes, the largest solution of x = p (1 − e^(−k x))². Found by iterating
// from x = p, which comes down onto it.
export function mutualTheory(p, k) {
  let x = p
  for (let i = 0; i < 200000; i++) {
    const y = p * (1 - Math.exp(-k * x)) ** 2
    if (Math.abs(y - x) < 1e-13) return y < 1e-9 ? 0 : y
    x = y
  }
  return x < 1e-6 ? 0 : x
}

// A single random network: x = p (1 − e^(−k x)).
export function singleTheory(p, k) {
  let x = p
  for (let i = 0; i < 200000; i++) {
    const y = p * (1 - Math.exp(-k * x))
    if (Math.abs(y - x) < 1e-13) return y < 1e-9 ? 0 : y
    x = y
  }
  return x < 1e-6 ? 0 : x
}

// p_c ⟨k⟩ for coupled random networks: the minimum over y of y/(1 − e^(−y))²,
// by golden-section search. Returns the minimum and where it is.
export function coupledConstant() {
  const f = (y) => y / (1 - Math.exp(-y)) ** 2
  const phi = (Math.sqrt(5) - 1) / 2
  let lo = 0.1
  let hi = 5
  let c = hi - phi * (hi - lo)
  let d = lo + phi * (hi - lo)
  while (hi - lo > 1e-10) {
    if (f(c) < f(d)) hi = d
    else lo = c
    c = hi - phi * (hi - lo)
    d = lo + phi * (hi - lo)
  }
  const y = (lo + hi) / 2
  return { value: f(y), y }
}
