// Panel C, "The best deviation": the attacker's problem as the Markov
// decision process of Sapirshtein, Sompolinsky and Zohar (2016). Pure
// functions; the page reads a table precomputed with them
// (scripts/lab/gen-game-theory-13-optimal.mjs), and the self-check reruns
// some cells.
//
// A state is (a, h, fork): a blocks on her private branch, h on the public
// branch since the last common block, and the fork label of the last block
// mined:
//   irrelevant  her block was last (or the honest block cannot be matched),
//   relevant    an honest block was last: she could match it now,
//   active      she has matched: two branches of equal length race.
// Each step one block is mined, by her with probability α. The actions:
//   adopt      give up her branch (reward h to the others), restart from
//              (1, 0, irrelevant) or (0, 1, irrelevant)
//   override   publish h + 1 of her blocks (a > h): h + 1 to her
//   match      publish h blocks to tie (fork relevant, a ≥ h ≥ 1)
//   wait       keep mining in private
// Truncation: when a or h reaches T, only adopt and override are allowed.
//
// The objective, her share of the chain r_A/(r_A + r_H), is a ratio. For a
// given ρ the average reward (1 − ρ)·r_A − ρ·r_H has a best gain g(ρ),
// decreasing in ρ, and the optimal share is the ρ where g(ρ) = 0: bisection
// on ρ, each step solved by relative value iteration with the aperiodicity
// transform P → τP + (1 − τ)I.

export const ACTIONS = ['adopt', 'override', 'match', 'wait']
export const FORKS = ['irrelevant', 'relevant', 'active']
const IRR = 0
const REL = 1
const ACT = 2

// The transitions of every (state, action): flat arrays, built once for
// (α, γ, T). For each state, `start[s]..start[s + 1]` indexes its actions;
// each action has 1 to 3 outcomes (next state, probability, r_A, r_H).
export function buildModel(alpha, gamma, T) {
  const a1 = alpha
  const b1 = 1 - alpha
  const N = (T + 1) * (T + 1) * 3
  const id = (a, h, f) => (a * (T + 1) + h) * 3 + f
  const actStart = [0] // per state, into the action arrays
  const actKind = []
  const outStart = [0] // per action, into the outcome arrays
  const nx = []
  const pr = []
  const ra = []
  const rh = []
  const out = (s, p, A, H) => {
    if (p <= 0) return
    nx.push(s)
    pr.push(p)
    ra.push(A)
    rh.push(H)
  }
  const close = (k) => {
    actKind.push(k)
    outStart.push(nx.length)
  }
  for (let a = 0; a <= T; a++)
    for (let h = 0; h <= T; h++)
      for (let f = 0; f < 3; f++) {
        const edge = a === T || h === T
        // adopt
        out(id(1, 0, IRR), a1, 0, h)
        out(id(0, 1, IRR), b1, 0, h) // irrelevant, as in their Table 1
        close(0)
        // override
        if (a > h) {
          out(id(a - h, 0, IRR), a1, h + 1, 0)
          out(id(a - h - 1, 1, REL), b1, h + 1, 0)
          close(1)
        }
        if (!edge) {
          // match
          if (f === REL && a >= h && h >= 1) {
            out(id(a + 1, h, ACT), a1, 0, 0)
            out(id(a - h, 1, REL), gamma * b1, h, 0)
            out(id(a, h + 1, REL), (1 - gamma) * b1, 0, 0)
            close(2)
          }
          // wait
          if (f !== ACT) {
            out(id(a + 1, h, IRR), a1, 0, 0)
            out(id(a, h + 1, REL), b1, 0, 0)
          } else {
            out(id(a + 1, h, ACT), a1, 0, 0)
            out(id(a - h, 1, REL), gamma * b1, h, 0)
            out(id(a, h + 1, REL), (1 - gamma) * b1, 0, 0)
          }
          close(3)
        }
        actStart.push(actKind.length)
      }
  return {
    alpha,
    gamma,
    T,
    N,
    id,
    actStart: Int32Array.from(actStart),
    actKind: Int8Array.from(actKind),
    outStart: Int32Array.from(outStart),
    nx: Int32Array.from(nx),
    pr: Float64Array.from(pr),
    ra: Float64Array.from(ra),
    rh: Float64Array.from(rh),
  }
}

// Relative value iteration for reward (1 − ρ)·r_A − ρ·r_H. Returns bounds on
// the best gain; stops as soon as its sign is certain, or when the bounds are
// within `eps`. V is reused (warm start) and updated in place.
export function solveGain(M, rho, V, { tau = 0.95, eps = 1e-11, maxIter = 200000, signOnly = true } = {}) {
  const { N, actStart, outStart, nx, pr, ra, rh } = M
  const W = new Float64Array(N)
  const ref = M.id(1, 0, IRR)
  let lo = -Infinity
  let hi = Infinity
  let it = 0
  for (; it < maxIter; it++) {
    lo = Infinity
    hi = -Infinity
    for (let s = 0; s < N; s++) {
      let best = -Infinity
      for (let k = actStart[s]; k < actStart[s + 1]; k++) {
        let q = 0
        for (let o = outStart[k]; o < outStart[k + 1]; o++) q += pr[o] * ((1 - rho) * ra[o] - rho * rh[o] + V[nx[o]])
        if (q > best) best = q
      }
      const w = tau * best + (1 - tau) * V[s]
      const d = w - V[s]
      if (d < lo) lo = d
      if (d > hi) hi = d
      W[s] = w
    }
    const c = W[ref]
    for (let s = 0; s < N; s++) V[s] = W[s] - c
    if (signOnly && (lo > 0 || hi < 0)) break
    if (hi - lo < eps) break
  }
  // The transformed gain is τ·g.
  return { lo: lo / tau, hi: hi / tau, iterations: it + 1 }
}

// The greedy policy for ρ from V: the best action in each state. Ties (within
// 1e-9) go to the action of `prefer` (by default SM1's), so the map differs
// from Eyal and Sirer's strategy only where a deviation is strictly better;
// other ties go to the first action in ACTIONS order.
export function greedy(M, rho, V, prefer = sm1Policy(M)) {
  const { N, actStart, actKind, outStart, nx, pr, ra, rh } = M
  const pol = new Int8Array(N)
  for (let s = 0; s < N; s++) {
    let best = -Infinity
    let arg = -1
    let qPref = -Infinity
    for (let k = actStart[s]; k < actStart[s + 1]; k++) {
      let q = 0
      for (let o = outStart[k]; o < outStart[k + 1]; o++) q += pr[o] * ((1 - rho) * ra[o] - rho * rh[o] + V[nx[o]])
      if (actKind[k] === prefer[s]) qPref = q
      if (q > best + 1e-9) {
        best = q
        arg = actKind[k]
      }
    }
    pol[s] = qPref >= best - 1e-9 ? prefer[s] : arg
  }
  return pol
}

// The states a policy reaches from the start, (1, 0, irrelevant) and
// (0, 1, irrelevant), as after an adopt.
export function reachable(M, pol) {
  const { N, actStart, actKind, outStart, nx, pr } = M
  const seen = new Uint8Array(N)
  const stack = [M.id(1, 0, IRR), M.id(0, 1, IRR)]
  for (const s of stack) seen[s] = 1
  while (stack.length) {
    const s = stack.pop()
    for (let k = actStart[s]; k < actStart[s + 1]; k++) {
      if (actKind[k] !== pol[s]) continue
      for (let o = outStart[k]; o < outStart[k + 1]; o++)
        if (pr[o] > 0 && !seen[nx[o]]) {
          seen[nx[o]] = 1
          stack.push(nx[o])
        }
    }
  }
  return seen
}

// The optimal share by bisection on ρ in [α, 1]: honest mining reaches α.
export function optimalShare(alpha, gamma, { T = 40, tol = 1e-6, tau = 0.95 } = {}) {
  const M = buildModel(alpha, gamma, T)
  const V = new Float64Array(M.N)
  let lo = alpha
  let hi = 1
  let iterations = 0
  let steps = 0
  // Is honest mining already optimal? g(α) ≤ 0 (within the solver's eps).
  const g0 = solveGain(M, alpha, V, { tau })
  iterations += g0.iterations
  if (g0.hi <= 1e-9) {
    return { share: alpha, honest: true, lo: alpha, hi: alpha, iterations, steps, rho: alpha, model: M, V }
  }
  while (hi - lo > tol) {
    const mid = (lo + hi) / 2
    const g = solveGain(M, mid, V, { tau })
    iterations += g.iterations
    steps++
    if (g.lo > 0) lo = mid
    else if (g.hi < 0) hi = mid
    else {
      // Bounds straddle 0 within eps: mid is the root to the solver's precision.
      lo = mid
      hi = mid
    }
  }
  const rho = (lo + hi) / 2
  solveGain(M, rho, V, { tau, signOnly: false, eps: 1e-10 })
  return { share: rho, honest: false, lo, hi, iterations, steps, rho, model: M, V }
}

// SM1 (Eyal and Sirer) written as a policy of this MDP.
export function sm1Action(a, h, f, T) {
  const edge = a === T || h === T
  if (h > a) return 'adopt'
  if (edge) return a > h ? 'override' : 'adopt'
  if (f === REL) {
    if (a === h) return h >= 1 ? 'match' : 'wait'
    if (a === h + 1 && h >= 1) return 'override'
    return 'wait'
  }
  // A race she has joined: her next block wins it at once.
  if (f === ACT && a > h) return 'override'
  return 'wait'
}

// Her share under a fixed policy (an array of action indices, one per state):
// the stationary distribution by power iteration (with the same transform),
// started from (1, 0, irrelevant) and (0, 1, irrelevant) as after an adopt.
export function policyShare(M, pol, { iters = 200000, tol = 1e-14 } = {}) {
  const { N, actStart, actKind, outStart, nx, pr, ra, rh } = M
  const pick = new Int32Array(N)
  for (let s = 0; s < N; s++) {
    pick[s] = -1
    for (let k = actStart[s]; k < actStart[s + 1]; k++) if (actKind[k] === pol[s]) pick[s] = k
    if (pick[s] < 0) throw new Error(`action ${ACTIONS[pol[s]]} not allowed in state ${s}`)
  }
  let p = new Float64Array(N)
  p[M.id(1, 0, IRR)] = M.alpha
  p[M.id(0, 1, IRR)] = 1 - M.alpha
  for (let it = 0; it < iters; it++) {
    const q = new Float64Array(N)
    for (let s = 0; s < N; s++) {
      if (p[s] === 0) continue
      const k = pick[s]
      for (let o = outStart[k]; o < outStart[k + 1]; o++) q[nx[o]] += 0.5 * p[s] * pr[o]
      q[s] += 0.5 * p[s]
    }
    let d = 0
    for (let s = 0; s < N; s++) d += Math.abs(q[s] - p[s])
    p = q
    if (d < tol) break
  }
  let A = 0
  let H = 0
  for (let s = 0; s < N; s++) {
    const k = pick[s]
    for (let o = outStart[k]; o < outStart[k + 1]; o++) {
      A += p[s] * pr[o] * ra[o]
      H += p[s] * pr[o] * rh[o]
    }
  }
  return { share: A / (A + H), rA: A, rH: H }
}

export function sm1Policy(M) {
  const pol = new Int8Array(M.N)
  for (let a = 0; a <= M.T; a++)
    for (let h = 0; h <= M.T; h++)
      for (let f = 0; f < 3; f++) pol[M.id(a, h, f)] = ACTIONS.indexOf(sm1Action(a, h, f, M.T))
  return pol
}

// The policy map for a, h ≤ n: one row of letters per (fork, a), as stored in
// the precomputed table (A adopt, O override, M match, W wait; a dot for a
// state the policy never reaches).
export const LETTER = { adopt: 'A', override: 'O', match: 'M', wait: 'W' }
export function policyMap(M, pol, n = 8) {
  const seen = reachable(M, pol)
  const map = {}
  for (let f = 0; f < 3; f++) {
    const rows = []
    for (let a = 0; a <= n; a++) {
      let row = ''
      for (let h = 0; h <= n; h++) row += seen[M.id(a, h, f)] ? LETTER[ACTIONS[pol[M.id(a, h, f)]]] : '.'
      rows.push(row)
    }
    map[FORKS[f]] = rows
  }
  return map
}

// Is honest mining optimal at α? (the threshold search uses this test).
export function pays(alpha, gamma, { T = 40, tau = 0.95 } = {}) {
  const M = buildModel(alpha, gamma, T)
  const V = new Float64Array(M.N)
  const g = solveGain(M, alpha, V, { tau })
  return g.hi > 1e-9
}

// The threshold: the smallest α in [lo, hi] at which some deviation pays.
export function optimalThreshold(gamma, { lo = 0, hi = 0.5, tol = 1e-5, T = 40 } = {}) {
  while (hi - lo > tol) {
    const mid = (lo + hi) / 2
    if (pays(mid, gamma, { T })) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}
