import { mulberry32, randNormal } from '../../rng.js'
import { barabasiAlbert, degrees } from '../../graphUtils.js'
import { powerLawSampler } from './zeta.js'

// The data of Panel C, "Is it a power law?": whole numbers, as degrees are.
// Every source is sample(n, random, params) → Int32Array of n values ≥ 1.
// `truth` is the exponent of the tail where there is one.

export const TAIL_START = 10 // "tail with a different body": power law from here
export const TAIL_WEIGHT = 0.4 // share of the values in that tail
export const LOGNORMAL = { mu: 1, sigma: 1.2 }
export const EXPONENTIAL_MEAN = 8
export const CUTOFF = { gamma: 2, scale: 60 } // p_k ∝ k^(−γ) e^(−k / scale)
export const THIN = { gamma: 2.5, keep: 0.3 }
export const PA_M = 2

const fill = (n, draw) => {
  const out = new Int32Array(n)
  for (let i = 0; i < n; i++) out[i] = draw()
  return out
}

export const SOURCES = {
  // Pure power law from k = 1.
  power: {
    gamma: true,
    truth: (p) => p.gamma,
    sample: (n, random, { gamma }) => {
      const draw = powerLawSampler(gamma, 1)
      return fill(n, () => draw(random))
    },
  },
  // Power law from k = 10 for 40% of the values; the others are spread evenly
  // over 1 … 9.
  tailBody: {
    gamma: true,
    truth: (p) => p.gamma,
    sample: (n, random, { gamma }) => {
      const draw = powerLawSampler(gamma, TAIL_START)
      return fill(n, () => (random() < TAIL_WEIGHT ? draw(random) : 1 + Math.floor(random() * (TAIL_START - 1))))
    },
  },
  // A lognormal, rounded to the nearest whole number (values below 1 drawn again).
  lognormal: {
    truth: () => null,
    sample: (n, random) =>
      fill(n, () => {
        let k = 0
        while (k < 1) k = Math.round(Math.exp(LOGNORMAL.mu + LOGNORMAL.sigma * randNormal(random)))
        return k
      }),
  },
  // An exponential, rounded up to a whole number.
  exponential: {
    truth: () => null,
    sample: (n, random) => fill(n, () => 1 + Math.floor(-EXPONENTIAL_MEAN * Math.log(1 - random()))),
  },
  // Power law with an exponential cut-off: a power-law draw is kept with
  // probability e^(−(k − 1) / scale).
  cutoff: {
    truth: () => null,
    sample: (n, random) => {
      const draw = powerLawSampler(CUTOFF.gamma, 1)
      return fill(n, () => {
        for (;;) {
          const k = draw(random)
          if (random() < Math.exp(-(k - 1) / CUTOFF.scale)) return k
        }
      })
    },
  },
  // The degrees of a preferential-attachment network of n nodes, m = 2.
  // Its exact distribution is 2m(m + 1) / (k(k + 1)(k + 2)): exponent 3 for large k.
  attachment: {
    truth: () => 3,
    sample: (n, random) => {
      const N = Math.max(n, PA_M + 2)
      const net = barabasiAlbert(N, PA_M, Math.floor(random() * 2 ** 31))
      return degrees(N, net.A, net.B).slice(0, n)
    },
  },
  // A power-law network seen through sampling: every link of a node is kept
  // with probability 0.3 (the thinning of module 02). Nodes left with no link
  // are not seen at all.
  thinned: {
    truth: () => THIN.gamma,
    sample: (n, random) => {
      const draw = powerLawSampler(THIN.gamma, 1)
      return fill(n, () => {
        for (;;) {
          const k = draw(random)
          let kept = 0
          if (k > 5000) {
            // a hub: the normal approximation of the binomial
            kept = Math.max(0, Math.round(k * THIN.keep + Math.sqrt(k * THIN.keep * (1 - THIN.keep)) * randNormal(random)))
          } else {
            for (let j = 0; j < k; j++) if (random() < THIN.keep) kept++
          }
          if (kept > 0) return kept
        }
      })
    },
  },
}

export const SOURCE_IDS = ['power', 'tailBody', 'lognormal', 'exponential', 'cutoff', 'attachment', 'thinned']

// The exact degree distribution of the preferential-attachment model.
export const attachmentPmf = (k, m = PA_M) => (k < m ? 0 : (2 * m * (m + 1)) / (k * (k + 1) * (k + 2)))

// Three samples with fixed seeds, to be judged before pressing Reveal.
export const MYSTERIES = [
  { id: 'mystery1', source: 'tailBody', n: 5000, seed: 9101, params: { gamma: 2.6 } },
  { id: 'mystery2', source: 'lognormal', n: 3000, seed: 9202, params: {} },
  { id: 'mystery3', source: 'cutoff', n: 10000, seed: 9303, params: {} },
]

export const SAMPLE_SEED = 1900
export const DEFAULT_N = 2000
export const DEFAULT_GAMMA = 2.5

export function drawSample(sourceId, n, params = {}, seed = SAMPLE_SEED) {
  const mystery = MYSTERIES.find((m) => m.id === sourceId)
  if (mystery) return SOURCES[mystery.source].sample(mystery.n, mulberry32(mystery.seed), mystery.params)
  return SOURCES[sourceId].sample(n, mulberry32(seed), { gamma: DEFAULT_GAMMA, ...params })
}
