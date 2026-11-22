import { mulberry32 } from '../../rng.js'
import { powerLawSampler } from '../heavy-tails-done-right/zeta.js'
import { rewire, pearsonR, spearmanRho, degreesOf, colourNodes, illusion, seedOf } from './mixing.js'

// Network Lab module 08: the logic of the two live figures, plain functions
// shared with scripts/lab/check-network-08.mjs.

// A simple network with exactly the degrees given (Havel–Hakimi: the node
// with most stubs left is joined to the next ones), or null when the sequence
// is not graphical.
export function havelHakimi(deg) {
  const n = deg.length
  const left = Array.from(deg)
  const A = []
  const B = []
  for (;;) {
    const order = [...left.keys()].filter((v) => left[v] > 0).sort((a, b) => left[b] - left[a] || a - b)
    if (!order.length) break
    const v = order[0]
    const d = left[v]
    if (d > order.length - 1) return null
    for (let i = 1; i <= d; i++) {
      const u = order[i]
      A.push(v)
      B.push(u)
      left[u]--
    }
    left[v] = 0
  }
  return { n, A: Int32Array.from(A), B: Int32Array.from(B) }
}

// ---------------------------------------------------------------- F1

export const F1_N = 30
export const F1_GAMMA = 2.3
export const F1_KMIN = 1
export const F1_KMAX = 12
export const F1_SWAPS = 60 // rewiring steps per link
export const F1_SEED = 808

// The j-th deal: a degree sequence from p_k ∝ k^(−γ), 1 ≤ k ≤ 12, drawn
// again until it is graphical, built by Havel–Hakimi and then rewired fully
// towards assortative and towards disassortative (p = 1).
export function twoWirings(j, seed = F1_SEED) {
  const random = mulberry32(seedOf(seed, j))
  const draw = powerLawSampler(F1_GAMMA, F1_KMIN, F1_KMAX)
  let base = null
  let deg = null
  for (let tries = 0; !base && tries < 1000; tries++) {
    deg = Array.from({ length: F1_N }, () => draw(random))
    if (deg.reduce((s, x) => s + x, 0) % 2) continue
    base = havelHakimi(deg)
  }
  const s = random() * 2 ** 32
  const out = {}
  for (const mode of ['assortative', 'disassortative']) {
    const net = rewire(base, { mode, p: 1, swaps: F1_SWAPS, seed: (s + (mode === 'assortative' ? 1 : 2)) >>> 0 })
    out[mode] = { net, r: pearsonR(net), rho: spearmanRho(net) }
  }
  return { deg: degreesOf(base), ...out }
}

// ---------------------------------------------------------------- F2

// Three hubs and seventeen nodes of degree 2 or 3: 28 links.
export const F2_DEGREES = [8, 7, 6, 3, ...Array(16).fill(2)]
export const F2_SWAPS = 60
export const F2_SEED = 2016

// The figure's network wired towards disassortative (p = 1) and, with the
// switch, the same degrees re-paired at random. The three hubs are coloured.
export function illusionFigure(seed = F2_SEED) {
  const base = havelHakimi(F2_DEGREES)
  const dis = rewire(base, { mode: 'disassortative', p: 1, swaps: F2_SWAPS, seed: seedOf(seed, 0) })
  const neutral = rewire(dis, { mode: 'random', p: 0, swaps: F2_SWAPS, seed: seedOf(seed, 1) })
  const k = degreesOf(base)
  const coloured = colourNodes(k, 3 / k.length, 'top', mulberry32(seed))
  const state = (net) => ({ net, ...illusion(net, coloured), r: pearsonR(net) })
  return { k, coloured, disassortative: state(dis), neutral: state(neutral) }
}
