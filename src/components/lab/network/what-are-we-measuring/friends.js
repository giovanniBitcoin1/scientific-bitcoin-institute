import { buildCSR, erdosRenyiGnm, barabasiAlbert, ringLattice } from '../../graphUtils.js'
import { mulberry32 } from '../../rng.js'

// Panel C, "Your friends have more friends": the degree of a random node
// against the degree of a random friend, and what that bias is good for:
// friends of random people catch a spreading infection earlier.
// A network is { n, A, B } as in sampling.js. Pure logic, shared by the panel
// and by scripts/lab/check-network-02.mjs.

const pick = ({ A, B }) => ({ A, B })

export const FRIEND_NETWORKS = {
  random: (seed) => ({ n: 1000, ...pick(erdosRenyiGnm(1000, 3000, seed)) }),
  scaleFree: (seed) => ({ n: 1000, ...pick(barabasiAlbert(1000, 3, seed)) }),
  ring: () => ({ n: 1000, ...pick(ringLattice(1000, 6)) }),
}

// ---------------------------------------------------------------- The paradox

// nodeDist[k]: share of nodes with degree k (the degree of a random node).
// friendDist[k]: share of link ends attached to a node of degree k, that is
// k · nodeDist[k] / ⟨k⟩ (the degree of the node at the end of a random link).
export function friendStats(net) {
  const g = buildCSR(net.n, net.A, net.B)
  const n = net.n
  const degree = new Int32Array(n)
  let maxDegree = 0
  let s1 = 0
  let s2 = 0
  for (let v = 0; v < n; v++) {
    const k = g.offsets[v + 1] - g.offsets[v]
    degree[v] = k
    s1 += k
    s2 += k * k
    if (k > maxDegree) maxDegree = k
  }
  const nodeDist = new Float64Array(maxDegree + 1)
  const friendDist = new Float64Array(maxDegree + 1)
  for (let v = 0; v < n; v++) {
    nodeDist[degree[v]] += 1 / n
    if (s1) friendDist[degree[v]] += degree[v] / s1
  }
  // Nodes with fewer links than the average of their neighbours, and the
  // average over the nodes of that neighbour average.
  let fewer = 0
  let more = 0
  let sumNeighbourMean = 0
  let withLinks = 0
  for (let v = 0; v < n; v++) {
    if (!degree[v]) continue
    let sum = 0
    for (let i = g.offsets[v], end = g.offsets[v + 1]; i < end; i++) sum += degree[g.neighbors[i]]
    const mean = sum / degree[v]
    sumNeighbourMean += mean
    withLinks++
    if (degree[v] < mean - 1e-9) fewer++
    else if (degree[v] > mean + 1e-9) more++
  }
  return {
    g,
    n,
    L: net.A.length,
    degree,
    maxDegree,
    nodeDist,
    friendDist,
    meanDegree: s1 / n,
    // ⟨k²⟩/⟨k⟩: the mean degree at the end of a random link.
    friendMean: s1 ? s2 / s1 : 0,
    variance: s2 / n - (s1 / n) ** 2,
    fewer,
    more,
    fewerShare: fewer / n,
    neighbourMean: withLinks ? sumNeighbourMean / withLinks : 0,
  }
}

// Mean degree at the end of a random link, measured directly: both ends of
// every link, averaged. Used by the self-check against ⟨k²⟩/⟨k⟩.
export function meanDegreeAtLinkEnds(net) {
  const k = new Int32Array(net.n)
  for (let e = 0; e < net.A.length; e++) {
    k[net.A[e]]++
    k[net.B[e]]++
  }
  let sum = 0
  for (let e = 0; e < net.A.length; e++) sum += k[net.A[e]] + k[net.B[e]]
  return sum / (2 * net.A.length)
}

// ---------------------------------------------------------------- Early warning

export const BETA = 0.05 // chance per step that an infected node infects a given neighbour
export const SENSOR_RUNS = 200
export const SENSOR_SEED = 301 // the panel's first run

export const groupSize = (n) => Math.min(100, Math.max(5, Math.round(n / 4)))

// `size` distinct random nodes.
export function randomGroup(g, size, random) {
  const inGroup = new Uint8Array(g.n)
  const group = []
  while (group.length < size) {
    const v = Math.floor(random() * g.n)
    if (!inGroup[v]) {
      inGroup[v] = 1
      group.push(v)
    }
  }
  return group
}

// `size` distinct friends: pick a random node (with at least one link), then
// one of its neighbours at random; repeat until `size` different friends
// have been named.
export function friendGroup(g, size, random) {
  const inGroup = new Uint8Array(g.n)
  const group = []
  let guard = 0
  while (group.length < size && guard++ < 1000 * size) {
    const u = Math.floor(random() * g.n)
    const k = g.offsets[u + 1] - g.offsets[u]
    if (!k) continue
    const v = g.neighbors[g.offsets[u] + Math.floor(random() * k)]
    if (!inGroup[v]) {
      inGroup[v] = 1
      group.push(v)
    }
  }
  return group
}

// SI spread in discrete steps from one seed: at every step each infected node
// infects each susceptible neighbour with probability beta. Returns the step
// at which every node was infected (−1: never reached) and the last step.
export function spreadSI(g, seed, beta, random, maxSteps = 100000) {
  const when = new Int32Array(g.n).fill(-1)
  when[seed] = 0
  // Infected nodes that still have a susceptible neighbour.
  let active = [seed]
  let t = 0
  while (active.length && t < maxSteps) {
    t++
    const fresh = []
    const still = []
    for (const u of active) {
      let open = false
      for (let i = g.offsets[u], end = g.offsets[u + 1]; i < end; i++) {
        const v = g.neighbors[i]
        if (when[v] >= 0 && when[v] < t) continue
        if (when[v] === t) continue // infected earlier in this step
        if (random() < beta) {
          when[v] = t
          fresh.push(v)
        } else open = true
      }
      if (open) still.push(u)
    }
    active = still.concat(fresh)
  }
  return { when, steps: t }
}

// Cumulative share of a group infected at steps 0 … steps.
export function groupCurve(when, group, steps) {
  const curve = new Float64Array(steps + 1)
  for (const v of group) if (when[v] >= 0) curve[when[v]] += 1 / group.length
  for (let t = 1; t <= steps; t++) curve[t] += curve[t - 1]
  return curve
}

// The (interpolated) step at which a cumulative curve crosses `level`.
export function crossing(curve, level = 0.5) {
  for (let t = 0; t < curve.length; t++) {
    if (curve[t] >= level) {
      if (t === 0) return 0
      return t - 1 + (level - curve[t - 1]) / (curve[t] - curve[t - 1])
    }
  }
  return NaN
}

// One run: a random seed, a fresh group of random nodes and a fresh group of
// random friends, one spread. `lead` is how many steps earlier the friends
// reach 50% infected.
export function sensorRun(g, random, beta = BETA, size = groupSize(g.n)) {
  let seed
  do seed = Math.floor(random() * g.n)
  while (g.offsets[seed + 1] === g.offsets[seed])
  const randoms = randomGroup(g, size, random)
  const friends = friendGroup(g, size, random)
  const { when, steps } = spreadSI(g, seed, beta, random)
  const all = new Float64Array(steps + 1)
  for (let v = 0; v < g.n; v++) if (when[v] >= 0) all[when[v]] += 1 / g.n
  for (let t = 1; t <= steps; t++) all[t] += all[t - 1]
  const cr = groupCurve(when, randoms, steps)
  const cf = groupCurve(when, friends, steps)
  const tr = crossing(cr)
  const tf = crossing(cf)
  return { steps, all, randoms: cr, friends: cf, tRandom: tr, tFriends: tf, lead: tr - tf }
}

// A job for useExperiment: `runs` runs, the average curves (a run that has
// ended keeps its last value) and the lead of the friends at 50%.
export function sensorJob(net, seed, runs = SENSOR_RUNS, beta = BETA) {
  const g = buildCSR(net.n, net.A, net.B)
  const size = groupSize(net.n)
  const results = []
  function* iter() {
    for (let r = 0; r < runs; r++) {
      results.push(sensorRun(g, mulberry32((seed + Math.imul(r + 1, 0x9e3779b1)) >>> 0), beta, size))
      yield (r + 1) / runs
    }
  }
  const snapshot = () => {
    const m = results.length
    const T = results.reduce((a, r) => Math.max(a, r.steps), 0)
    const avg = (name) => {
      const out = new Float64Array(T + 1)
      for (const r of results) {
        const c = r[name]
        for (let t = 0; t <= T; t++) out[t] += c[Math.min(t, c.length - 1)] / m
      }
      return out
    }
    let leadSum = 0
    let counted = 0
    let ahead = 0
    let behind = 0
    for (const r of results) {
      if (!Number.isFinite(r.lead)) continue
      counted++
      leadSum += r.lead
      if (r.lead > 0) ahead++
      else if (r.lead < 0) behind++
    }
    const randoms = m ? avg('randoms') : new Float64Array(1)
    const friends = m ? avg('friends') : new Float64Array(1)
    return {
      runs: m,
      size,
      beta,
      steps: T,
      all: m ? avg('all') : new Float64Array(1),
      randoms,
      friends,
      // lead averaged over the runs, and read off the two average curves
      meanLead: counted ? leadSum / counted : NaN,
      curveLead: m ? crossing(randoms) - crossing(friends) : NaN,
      aheadShare: counted ? ahead / counted : NaN,
      behindShare: counted ? behind / counted : NaN,
    }
  }
  return { iter: iter(), snapshot }
}
