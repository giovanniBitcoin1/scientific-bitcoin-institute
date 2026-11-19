// Precomputes the default run of the Vicsek experiment (Module 10, Panel B)
// with the same code and seeds as the page, so the panel can show its curves
// without running for several seconds on load.
//
//   node scripts/lab/precompute-vicsek.mjs
//
// Rerun it whenever vicsekSweep / vicsekStep or VICSEK_EXPERIMENT in
// src/components/lab/flocking.js change.
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { VICSEK_EXPERIMENT, vicsekSweep } from '../../src/components/lab/flocking.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const out = resolve(root, 'src/data/lab/precomputed/vicsek.json')

const R = VICSEK_EXPERIMENT.runs
const series = Object.fromEntries(VICSEK_EXPERIMENT.sizes.map((n) => [n, []]))
const t0 = Date.now()
for (const _ of vicsekSweep(R, series));
const round = (v) => Math.round(v * 1e4) / 1e4
for (const n of Object.keys(series)) series[n] = series[n].map((p) => ({ x: p.x, y: round(p.y) }))

mkdirSync(dirname(out), { recursive: true })
const json = JSON.stringify({ R, series })
writeFileSync(out, json + '\n')
console.log(`wrote ${out} (${json.length + 1} bytes) in ${((Date.now() - t0) / 1000).toFixed(1)} s`)
