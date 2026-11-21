import { growFitness, overtakeLn, seedOf } from './fitness.js'
import { drawAll } from './experiments.js'

// Network Lab module 07: the logic of the two live figures.

// ---------------------------------------------------------------- F1 "The race"

// Mean-field curves, drawn with m = 1 and C = 1.255 (fitness uniform on
// [0, 1]); neither changes the time of the overtaking.
export const RACE_M = 1
export const RACE_C = 1.255
export const RACE_DEFAULT = { t1: 1, eta1: 0.5, t2: 1000, eta2: 1 }
export const RACE_T_MAX = 1e9

export function race({ t1, eta1, t2, eta2 }) {
  const lnT = overtakeLn(t1, eta1, t2, eta2)
  const k = (t, ti, eta) => (t >= ti ? RACE_M * (t / ti) ** (eta / RACE_C) : NaN)
  return { lnT, log10T: lnT == null ? null : lnT / Math.LN10, k }
}

// ---------------------------------------------------------------- F2 "Fitness as energy"

// A network grown with m = 1 and attachment ∝ η k, shown from ENERGY_START up
// to ENERGY_MAX nodes. Every node is an energy level ε = −ln η; every link is
// a particle on the level of the node it points to (the older end). The
// switch gives the fourth node fitness 1 and halves every other fitness (so
// the others are uniform on [0, 0.5]); the draws are the same either way.
export const ENERGY_START = 12
export const ENERGY_MAX = 30
export const ENERGY_SEED = 7400
export const ENERGY_BOOSTED = 3

export function energyNetwork(boosted) {
  const u = drawAll({ kind: 'uniform' }, ENERGY_MAX, ENERGY_SEED)
  const eta = boosted ? u.map((x, i) => (i === ENERGY_BOOSTED ? 1 : 0.5 * x)) : u
  return growFitness({ N: ENERGY_MAX, m: 1, eta, seed: seedOf(ENERGY_SEED, 1) })
}

// The first `size` nodes: each with its energy and its particles, sorted by
// energy (the lowest level, the fittest node, first).
export function energyState(net, size) {
  const particles = new Int32Array(size)
  for (let e = 0; e < net.A.length; e++) if (net.A[e] < size) particles[net.B[e]]++
  const levels = Array.from({ length: size }, (_, v) => ({ v, eta: net.eta[v], eps: -Math.log(net.eta[v]), particles: particles[v] }))
  levels.sort((a, b) => a.eps - b.eps || a.v - b.v)
  return { levels, links: size - 1 }
}
