// Network Lab module 13, "Social contagion and network effects": information
// cascades, Granovetter's thresholds, a market with a network effect, the
// Bass curve, threshold cascades on a network (Watts) and the cascade
// condition. Plain functions on CSR graphs and on lists of numbers, shared by
// the page and by scripts/lab/check-network-13.mjs.

// ---------------------------------------------------------------- Information cascades

// People decide in turn between two options, one of them right. Each has a
// private signal that is right with probability q and sees the choices made
// before. While the choices so far differ by less than two, a choice reveals
// its signal, and each person does what the revealed signals and their own
// favour (their own signal when these are level). Once the choices differ by
// two the own signal can no longer tip the balance: everyone follows, and
// the choices reveal nothing more. `start` is the first person in the cascade
// (−1: none), `right` whether the cascade chose the right option.
export function cascadeSequence(n, q, random) {
  const signals = new Uint8Array(n)
  const choices = new Uint8Array(n)
  let diff = 0
  let start = -1
  for (let i = 0; i < n; i++) {
    const s = random() < q ? 1 : 0
    signals[i] = s
    if (diff >= 2 || diff <= -2) {
      if (start < 0) start = i
      choices[i] = diff > 0 ? 1 : 0
    } else {
      choices[i] = s
      diff += s ? 1 : -1
    }
  }
  return { signals, choices, start, right: start >= 0 ? diff > 0 : null }
}

// A cascade, once started, is wrong with probability (1 − q)² / (q² + (1 − q)²).
export const wrongCascade = (q) => ((1 - q) * (1 - q)) / (q * q + (1 - q) * (1 - q))

// No cascade yet after n people: every pair so far has split, (2q(1 − q))^⌊n/2⌋.
export const noCascadeAfter = (n, q) => (2 * q * (1 - q)) ** Math.floor(n / 2)

// n people deciding independently, each right with probability q: the chance
// that the majority is right (an even split counts as a coin toss).
export function majorityRight(n, q) {
  let p = (1 - q) ** n // P(0 right)
  let sum = 0
  for (let k = 0; k <= n; k++) {
    if (2 * k > n) sum += p
    else if (2 * k === n) sum += p / 2
    p *= ((n - k) / (k + 1)) * (q / (1 - q))
  }
  return sum
}

// `runs` sequences of n people: how many ended in a cascade, how many of
// those cascades were wrong, and how often the majority of the same n
// signals was right (`majority2` counts it twice, and an even split once, so
// that every field is a whole number: with decimal fields, Node 24 was seen
// to alter an object returned earlier when this function ran again, once it
// had been optimised). wrongShareOf and majorityOf give the two shares.
export function cascadeStats(n, q, runs, random) {
  let cascades = 0
  let wrong = 0
  let majority2 = 0
  for (let r = 0; r < runs; r++) {
    const s = cascadeSequence(n, q, random)
    if (s.start >= 0) {
      cascades++
      if (!s.right) wrong++
    }
    let ones = 0
    for (let i = 0; i < n; i++) ones += s.signals[i]
    majority2 += 2 * ones > n ? 2 : 2 * ones === n ? 1 : 0
  }
  return { runs, cascades, wrong, majority2 }
}

export const wrongShareOf = (stats) => (stats.cascades ? stats.wrong / stats.cascades : NaN)
export const majorityOf = (stats) => stats.majority2 / (2 * stats.runs)

// ---------------------------------------------------------------- Thresholds

// Granovetter (1978): a person joins once the number already in reaches their
// threshold. Starting from nobody, r → #{thresholds ≤ r} until it stops.
export function riot(thresholds) {
  const sorted = Float64Array.from(thresholds).sort()
  let r = 0
  // with the thresholds sorted, r people are in when the first r thresholds are all ≤ the count so far
  while (r < sorted.length && sorted[r] <= r) r++
  return r
}

// The same by plain iteration of r → #{thresholds ≤ r}: the staircase.
export function riotStaircase(thresholds) {
  const steps = [0]
  let r = 0
  for (;;) {
    let next = 0
    for (let i = 0; i < thresholds.length; i++) if (thresholds[i] <= r) next++
    if (next === r) return steps
    r = next
    steps.push(r)
  }
}

// The order in which people join, one at a time: among those whose threshold
// is met, the one with the lowest threshold (then the lowest index).
export function riotOrder(thresholds) {
  const n = thresholds.length
  const inRiot = new Uint8Array(n)
  const order = []
  for (;;) {
    let best = -1
    for (let i = 0; i < n; i++) {
      if (inRiot[i] || thresholds[i] > order.length) continue
      if (best < 0 || thresholds[i] < thresholds[best]) best = i
    }
    if (best < 0) return order
    inRiot[best] = 1
    order.push(best)
  }
}

// Φ, the standard normal distribution function (Marsaglia's series; full
// double precision in the range used here).
export function normalCdf(x) {
  if (x < -8) return 0
  if (x > 8) return 1
  let s = x
  let t = 0
  let b = x
  const q = x * x
  let i = 1
  while (s !== t) {
    t = s
    i += 2
    b *= q / i
    s = t + b
  }
  return 0.5 + s * Math.exp(-0.5 * q - 0.9189385332046727)
}

// N F(r) for thresholds normally distributed (a negative threshold counts as zero).
export const crowdCurve = (N, mean, sd, r) => N * normalCdf((r - mean) / sd)

// The outcome of the smooth curve: the first fixed point of r = N F(r) met
// when climbing from r = 0.
export function smoothOutcome(N, mean, sd) {
  let r = 0
  for (let i = 0; i < 2000000; i++) {
    const next = crowdCurve(N, mean, sd, r)
    if (next - r < 1e-11) return next
    r = next
  }
  return r
}

// The standard deviation at which the smooth outcome jumps (bisection between
// lo, where it is below half the crowd, and hi, where it is above).
export function jumpSd(N, mean, lo = 5, hi = 20) {
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (smoothOutcome(N, mean, mid) > N / 2) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}

// A crowd: N thresholds drawn from a normal distribution, negatives set to 0.
export function sampleCrowd(N, mean, sd, normal) {
  const t = new Float64Array(N)
  for (let i = 0; i < N; i++) t[i] = Math.max(0, mean + sd * normal())
  return t
}

// ---------------------------------------------------------------- A market with a network effect

// Person x in [0, 1] values the good r(x) f(z) = (1 − x) z when a share z uses
// it. At price p the shares at which nobody wants to change solve
// p = z (1 − z): none besides zero when p > 1/4.
export const MAX_PRICE = 0.25
export function marketEquilibria(p) {
  if (p > MAX_PRICE) return null
  const d = Math.sqrt(1 - 4 * p)
  return { tipping: (1 - d) / 2, high: (1 + d) / 2 }
}

// If a share z is expected to use the good, those with (1 − x) z ≥ p buy.
export const marketStep = (z, p) => (z > 0 ? Math.max(0, 1 - p / z) : 0)

export function marketPath(z0, p, steps = 60) {
  const path = [z0]
  for (let i = 0; i < steps; i++) path.push(marketStep(path[i], p))
  return path
}

// ---------------------------------------------------------------- Bass

// dF/dt = (p + q F)(1 − F), F(0) = 0.
export function bassF(t, p, q) {
  const e = Math.exp(-(p + q) * t)
  return (1 - e) / (1 + (q / p) * e)
}

export const bassRate = (t, p, q) => {
  const F = bassF(t, p, q)
  return (p + q * F) * (1 - F)
}

// Adoption is fastest at t* = ln(q/p)/(p + q), when F = 1/2 − p/(2q) and the
// rate is (p + q)²/(4q); at the start when q ≤ p.
export function bassPeak(p, q) {
  if (!(q > p)) return { t: 0, F: 0, rate: p }
  return { t: Math.log(q / p) / (p + q), F: 0.5 - p / (2 * q), rate: ((p + q) * (p + q)) / (4 * q) }
}

// The same equation by fourth-order Runge–Kutta, for the self-check.
export function bassNumerical(t, p, q, steps = 2000) {
  const f = (F) => (p + q * F) * (1 - F)
  const h = t / steps
  let F = 0
  for (let i = 0; i < steps; i++) {
    const k1 = f(F)
    const k2 = f(F + (h * k1) / 2)
    const k3 = f(F + (h * k2) / 2)
    const k4 = f(F + h * k3)
    F += (h * (k1 + 2 * k2 + 2 * k3 + k4)) / 6
  }
  return F
}

// ---------------------------------------------------------------- Threshold cascades on a network

const degreeOf = (g, v) => g.offsets[v + 1] - g.offsets[v]

// How many adopting neighbours each node needs when it adopts once a share
// phi of its neighbours has: ⌈phi k⌉, at least one. A node without links
// never adopts (it needs more neighbours than there are nodes).
export function needByShare(g, phi) {
  const need = new Int32Array(g.n)
  for (let v = 0; v < g.n; v++) {
    const k = degreeOf(g, v)
    need[v] = k ? Math.max(1, Math.ceil(phi * k - 1e-9)) : g.n + 1
  }
  return need
}

// The same number of adopting neighbours for everyone: 1 is simple contagion,
// 2 the complex contagion of Centola and Macy.
export function needByCount(g, count) {
  const need = new Int32Array(g.n)
  for (let v = 0; v < g.n; v++) need[v] = degreeOf(g, v) ? count : g.n + 1
  return need
}

// A cascade from a set of seeds: a node adopts, for good, once need[v] of its
// neighbours have. Each node keeps a counter of adopting neighbours and
// adopters wait in a queue, so the cost is that of the links touched. The
// queue is in order of adoption, and round[v] is the synchronous step at
// which v adopted (seeds: 0), so the same pass gives the outcome and its
// timing. Returns the number of adopters and the last step; ws keeps
// `queue` and `round` for whoever needs them.
export function cascade(g, seeds, need, ws = {}) {
  if (!ws.count || ws.count.length !== g.n) {
    ws.count = new Int32Array(g.n)
    ws.mark = new Int32Array(g.n)
    ws.done = new Int32Array(g.n)
    ws.round = new Int32Array(g.n)
    ws.queue = new Int32Array(g.n)
    ws.stamp = 0
  }
  const { count, mark, done, round, queue } = ws
  const stamp = ++ws.stamp
  let tail = 0
  for (const s of seeds) {
    if (done[s] === stamp) continue
    done[s] = stamp
    round[s] = 0
    queue[tail++] = s
  }
  for (let h = 0; h < tail; h++) {
    const u = queue[h]
    for (let i = g.offsets[u], end = g.offsets[u + 1]; i < end; i++) {
      const v = g.neighbors[i]
      if (done[v] === stamp) continue
      if (mark[v] !== stamp) {
        mark[v] = stamp
        count[v] = 0
      }
      if (++count[v] >= need[v]) {
        done[v] = stamp
        round[v] = round[u] + 1
        queue[tail++] = v
      }
    }
  }
  ws.size = tail
  return { size: tail, steps: tail ? round[queue[tail - 1]] : 0 }
}

// After a cascade: the step at which the number of adopters reached `target`
// (NaN: it never did).
export function stepsTo(ws, target) {
  const t = Math.ceil(target)
  return t <= ws.size ? ws.round[ws.queue[t - 1]] : NaN
}

// The same outcome by brute force, for the self-check: synchronous sweeps
// over all nodes until nothing changes.
export function cascadeBrute(g, seeds, need) {
  const when = new Int32Array(g.n).fill(-1)
  for (const s of seeds) when[s] = 0
  for (let t = 1; ; t++) {
    const fresh = []
    for (let v = 0; v < g.n; v++) {
      if (when[v] >= 0) continue
      let c = 0
      for (let i = g.offsets[v], end = g.offsets[v + 1]; i < end; i++) if (when[g.neighbors[i]] >= 0) c++
      if (c >= need[v]) fresh.push(v)
    }
    if (!fresh.length) return { when, size: when.filter((x) => x >= 0).length, steps: t - 1 }
    for (const v of fresh) when[v] = t
  }
}

// The smallest share of links that a member of a set has inside the set (a
// member without links counts as 1). A set in which this is more than 1 − q
// cannot be entered by a cascade with threshold q.
export function clusterDensity(g, member) {
  let least = 1
  for (let v = 0; v < g.n; v++) {
    if (!member[v]) continue
    const k = degreeOf(g, v)
    if (!k) continue
    let inside = 0
    for (let i = g.offsets[v], end = g.offsets[v + 1]; i < end; i++) if (member[g.neighbors[i]]) inside++
    if (inside / k < least) least = inside / k
  }
  return least
}

// ---------------------------------------------------------------- The cascade condition

// Watts (2002): a node with k links falls to a single neighbour when k ≤ 1/φ.
export const vulnerableUpTo = (phi) => Math.floor(1 / phi + 1e-9)

// Σ_{k ≤ 1/φ} k (k − 1) p_k / z for a random network of mean degree z (Poisson
// degrees): above 1 the vulnerable nodes form a giant component.
export function cascadeCondition(z, phi) {
  const K = vulnerableUpTo(phi)
  let p = Math.exp(-z) * z // p_1
  let sum = 0
  for (let k = 2; k <= K; k++) {
    p *= z / k
    sum += k * (k - 1) * p
  }
  return sum / z
}

// The same sum over the degrees of one network.
export function cascadeConditionOf(k, phi) {
  const K = vulnerableUpTo(phi)
  let sum = 0
  let total = 0
  for (let i = 0; i < k.length; i++) {
    total += k[i]
    if (k[i] <= K) sum += k[i] * (k[i] - 1)
  }
  return total ? sum / total : 0
}

// The window of mean degrees in which the condition holds: [lower, upper], or
// null when it never does.
export function cascadeWindow(phi, zMax = 60) {
  let best = 0
  let at = 0
  for (let z = 0.01; z <= zMax; z += 0.01) {
    const c = cascadeCondition(z, phi)
    if (c > best) {
      best = c
      at = z
    }
  }
  if (!(best > 1)) return null
  const root = (inside, outside) => {
    for (let i = 0; i < 60; i++) {
      const mid = (inside + outside) / 2
      if (cascadeCondition(mid, phi) > 1) inside = mid
      else outside = mid
    }
    return (inside + outside) / 2
  }
  return [root(at, 1e-6), root(at, zMax)]
}
