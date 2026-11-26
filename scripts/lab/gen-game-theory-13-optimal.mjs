// Precomputes Panel C of Game Theory Lab module 13, "The best deviation":
// the optimal share of the chain (Sapirshtein, Sompolinsky and Zohar's
// Markov decision process, truncated at T = 40, bisection tolerance 1e-6)
// for α = 0.20, 0.225, …, 0.45 and 1/3, the threshold above which some
// deviation pays, and the optimal policies (a, h ≤ 8) for α = 0.30, 0.35,
// 0.40 when γ is 0, 1/2 or 1. One γ per command, so that no run is long:
//
//   node scripts/lab/gen-game-theory-13-optimal.mjs 0
//   node scripts/lab/gen-game-theory-13-optimal.mjs 1/4
//   node scripts/lab/gen-game-theory-13-optimal.mjs 1/2
//   node scripts/lab/gen-game-theory-13-optimal.mjs 3/4
//   node scripts/lab/gen-game-theory-13-optimal.mjs 1
//
// Each run rewrites its γ's rows in
// src/components/lab/game-theory/mining-as-a-game/optimal.json and keeps the
// others. Rerun every γ when mdp.js, T or the tolerance change;
// check-game-theory-13.mjs recomputes some cells and fails if they differ.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { optimalShare, greedy, policyMap, optimalThreshold } from '../../src/components/lab/game-theory/mining-as-a-game/mdp.js'
import { relativeRevenue, threshold } from '../../src/components/lab/game-theory/mining-as-a-game/selfish.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const file = resolve(root, 'src/components/lab/game-theory/mining-as-a-game/optimal.json')
const GAMMAS = { 0: 0, '1/4': 0.25, '1/2': 0.5, '3/4': 0.75, 1: 1 }
const arg = process.argv[2]
if (!(arg in GAMMAS)) {
  console.error(`usage: node scripts/lab/gen-game-theory-13-optimal.mjs <γ>, γ one of ${Object.keys(GAMMAS).join(', ')}`)
  process.exit(2)
}
const gamma = GAMMAS[arg]
const T = 40
const TOL = 1e-6
const ALPHAS = [...Array.from({ length: 11 }, (_, i) => Math.round((0.2 + 0.025 * i) * 1000) / 1000), 1 / 3].sort((x, y) => x - y)
const POLICY_ALPHAS = [0.3, 0.35, 0.4]
const POLICY_GAMMAS = [0, 0.5, 1]

const t0 = performance.now()
const cells = []
const policies = []
for (const alpha of ALPHAS) {
  const t = performance.now()
  const r = optimalShare(alpha, gamma, { T, tol: TOL })
  const cell = { alpha, gamma, opt: Number(r.share.toFixed(7)), sm1: Number(relativeRevenue(alpha, gamma).toFixed(7)), honest: r.honest, steps: r.steps, iterations: r.iterations }
  cells.push(cell)
  if (POLICY_GAMMAS.includes(gamma) && POLICY_ALPHAS.some((x) => Math.abs(x - alpha) < 1e-12)) {
    const pol = greedy(r.model, r.rho, r.V)
    policies.push({ alpha, gamma, map: policyMap(r.model, pol, 8) })
  }
  console.log(`α = ${alpha.toFixed(4)}  optimal ${r.share.toFixed(5)}  SM1 ${relativeRevenue(alpha, gamma).toFixed(5)}${r.honest ? '  (honest is optimal)' : ''}  ${r.steps} bisection steps, ${r.iterations} iterations, ${((performance.now() - t) / 1000).toFixed(2)} s`)
}
const t1 = performance.now()
const thr = optimalThreshold(gamma, { lo: 0, hi: 0.5, tol: 1e-5, T })
console.log(`threshold: optimal ${thr.toFixed(4)}, SM1 ${threshold(gamma).toFixed(4)} (${((performance.now() - t1) / 1000).toFixed(2)} s)`)

const old = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { cells: [], policies: [], thresholds: [] }
const keep = (xs) => xs.filter((c) => Math.abs(c.gamma - gamma) > 1e-9)
const byAG = (x, y) => x.gamma - y.gamma || x.alpha - y.alpha
const out = {
  about: 'Game Theory Lab module 13, Panel C: optimal selfish-mining shares (Sapirshtein, Sompolinsky and Zohar\'s MDP), written by scripts/lab/gen-game-theory-13-optimal.mjs. Policy maps: one string per a = 0..8, one letter per h = 0..8 (A adopt, O override, M match, W wait).',
  T,
  tol: TOL,
  cells: [...keep(old.cells), ...cells].sort(byAG),
  thresholds: [...keep(old.thresholds), { gamma, opt: Number(thr.toFixed(5)), sm1: Number(threshold(gamma).toFixed(5)) }].sort((x, y) => x.gamma - y.gamma),
  policies: [...keep(old.policies), ...policies].sort(byAG),
}
writeFileSync(file, JSON.stringify(out, null, 1) + '\n')
console.log(`γ = ${arg}: ${cells.length} cells, ${policies.length} policies written to optimal.json in ${((performance.now() - t0) / 1000).toFixed(1)} s`)
