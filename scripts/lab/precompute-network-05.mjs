// Precomputes the right-hand chart of Panel B of Network Lab module 05 ("The
// giant component, by bookkeeping"): for each family of degree distributions,
// the curve S(parameter) from the generating functions, and the share of the
// largest component in configuration-model networks of 20,000 nodes (mean and
// standard deviation of 5 networks at each grid value). Same code and seeds as
// the page, which only reads the file.
//
//   node scripts/lab/precompute-network-05.mjs
//
// Rerun it whenever genfun.js, configmodel.js, zeta.js or the constants NET_*
// change. scripts/lab/check-network-05.mjs checks the file against the code.
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FAMILY_IDS, NET_GRID, NET_N, NET_RUNS, theoryCurve, networkGiantMean } from '../../src/components/lab/network/heavy-tails-done-right/genfun.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const out = resolve(root, 'src/data/lab/precomputed/network-05-giant.json')
const round = (v) => Math.round(v * 1e5) / 1e5
const t0 = Date.now()
const data = { n: NET_N, runs: NET_RUNS }
for (const id of FAMILY_IDS) {
  data[id] = {
    theory: theoryCurve(id).map(([x, s]) => [round(x), round(s)]),
    dots: NET_GRID[id].map((x) => {
      const r = networkGiantMean(id, x)
      return [x, round(r.mean), round(r.sd)]
    }),
  }
}
mkdirSync(dirname(out), { recursive: true })
const json = JSON.stringify(data)
writeFileSync(out, json + '\n')
console.log(`wrote ${out} (${json.length + 1} bytes) in ${((Date.now() - t0) / 1000).toFixed(1)} s`)
