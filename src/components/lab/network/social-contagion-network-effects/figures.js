import { mulberry32 } from '../../rng.js'
import { seedOf } from '../robustness-and-cascades/robust.js'
import { cascadeSequence, cascadeStats, riotOrder } from './contagion.js'

// Network Lab module 13: what the two live figures compute, shared with
// scripts/lab/check-network-13.mjs.

// ---------------------------------------------------------------- F1, the riot

export const RIOT_N = 100
export const RIOT_SIDE = 10

// Thresholds 0, 1, 2, … 99: person i needs i others.
export const riotThresholds = () => Array.from({ length: RIOT_N }, (_, i) => i)

// The riot of a list of thresholds: who joins, in order.
export const riotRun = (thresholds) => riotOrder(thresholds)

// ---------------------------------------------------------------- F2, wrong together

export const F2_SEED = 13005
export const F2_N = 30
export const F2_RUNS = 1000
export const F2_DEFAULT_Q = 0.6
export const F2_QS = { min: 0.55, max: 0.9, step: 0.05 }

const rngAt = (q, j, salt) => mulberry32(seedOf(F2_SEED, Math.round(q * 100) + 1000 * j + salt))

// Sequence number j at this q: thirty signals, thirty choices, where the
// cascade starts and whether it is right.
export const sequenceAt = (q, j = 0) => cascadeSequence(F2_N, q, rngAt(q, j, 0))

// Batch number j of 1,000 sequences at this q.
export const batchAt = (q, j = 0) => cascadeStats(F2_N, q, F2_RUNS, rngAt(q, j, 500000))
