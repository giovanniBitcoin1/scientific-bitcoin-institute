// Self-checks for Network Lab module 01, "Reading a network". They run the
// same code as the page (bridges.js, netstats.js, bipartite.js) and compare it
// with known values and with independent brute-force computations.
//
//   node scripts/lab/check-network-01.mjs
//
// Exits with code 1 if any check fails. Rerun it whenever those files, the
// presets or the stored networks change.
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mulberry32, randInt } from '../../src/components/lab/rng.js'
import {
  LANDS,
  SLOTS,
  SLOT_BY_ID,
  preset,
  otherEnd,
  degrees,
  verdict,
  eulerRoute,
  longestWalk,
  walkState,
} from '../../src/components/lab/network/reading-a-network/bridges.js'
import {
  PRESETS,
  MAX_NODES,
  analyze,
  addNode,
  addEdge,
  removeEdge,
  removeNode,
  freshLabel,
  orderByComponent,
} from '../../src/components/lab/network/reading-a-network/netstats.js'
import {
  TOPS,
  BOTTOMS,
  PRESET_GRIDS,
  emptyGrid,
  project,
} from '../../src/components/lab/network/reading-a-network/bipartite.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const data = (name) => JSON.parse(readFileSync(resolve(root, 'src/data/lab/networks', name), 'utf8'))

let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const close = (a, b, tol = 5e-5) => Math.abs(a - b) <= tol
const f4 = (x) => x.toFixed(4)

// ---------------------------------------------------------------- Networks

const karate = PRESETS.fromData(data('karate-club.json'))
const florentine = PRESETS.fromData(data('florentine-families.json'))
const nets = {
  path: PRESETS.path(),
  ring: PRESETS.ring(),
  random: PRESETS.random(),
  windmill: PRESETS.windmill(),
  complete: PRESETS.complete(),
  groups: PRESETS.groups(),
  karate,
  florentine,
}

function wellFormed(net) {
  const seen = new Set()
  for (const [a, b] of net.edges) {
    if (a === b || a < 0 || b < 0 || a >= net.labels.length || b >= net.labels.length) return false
    const key = a < b ? `${a}-${b}` : `${b}-${a}`
    if (seen.has(key)) return false
    seen.add(key)
  }
  return true
}
const degreeSum = (s) => s.degree.reduce((x, y) => x + y, 0)

console.log('— Degrees sum to 2L')
for (const [name, net] of Object.entries(nets)) {
  const s = analyze(net)
  check(`${name}: degrees sum to 2L, no loops or repeated links`, degreeSum(s) === 2 * s.L && wellFormed(net), `N ${s.n}, L ${s.L}, sum ${degreeSum(s)}`)
}
{
  const random = mulberry32(2026)
  let net = PRESETS.random()
  let ok = true
  let odd = true
  const counts = { addNode: 0, addEdge: 0, removeEdge: 0, removeNode: 0 }
  for (let i = 0; i < 1000; i++) {
    const n = net.labels.length
    const r = random()
    if (r < 0.2 && n < MAX_NODES) {
      net = addNode(net, freshLabel(net))
      counts.addNode++
    } else if (r < 0.65 && n >= 2) {
      net = addEdge(net, randInt(random, n), randInt(random, n))
      counts.addEdge++
    } else if (r < 0.9 && net.edges.length) {
      const e = net.edges[randInt(random, net.edges.length)]
      net = removeEdge(net, e[0], e[1])
      counts.removeEdge++
    } else if (n > 3) {
      net = removeNode(net, randInt(random, n))
      counts.removeNode++
    }
    const s = analyze(net)
    if (degreeSum(s) !== 2 * s.L || !wellFormed(net) || s.n > MAX_NODES) ok = false
    if (s.degree.filter((k) => k % 2 === 1).length % 2 !== 0) odd = false
    if (s.componentSizes.reduce((x, y) => x + y, 0) !== s.n) ok = false
  }
  check('1,000 random edits: degrees sum to 2L after every one', ok, `ends at N ${net.labels.length}, L ${net.edges.length}; ${JSON.stringify(counts)}`)
  check('1,000 random edits: the number of odd-degree nodes is always even', odd)
}

// ---------------------------------------------------------------- Bridges

// Independent brute force: every walk that repeats no bridge, from every start.
function allWalks(active) {
  const slots = active.map((id) => SLOT_BY_ID[id])
  let longest = 0
  const complete = []
  const walk = (start, land, used, steps) => {
    if (steps.length > longest) longest = steps.length
    if (steps.length === slots.length) complete.push({ start, end: land, steps: [...steps] })
    for (const s of slots) {
      if (used.has(s.id) || (s.a !== land && s.b !== land)) continue
      used.add(s.id)
      steps.push(s.id)
      walk(start, otherEnd(s, land), used, steps)
      steps.pop()
      used.delete(s.id)
    }
  }
  for (const v of LANDS) walk(v, v, new Set(), [])
  return { longest, complete }
}
const validRoute = (active, r) => {
  const w = walkState(active, r.start, r.steps)
  return !!w && w.done
}

console.log('— The bridges of Königsberg')
{
  const a = preset('y1736')
  const k = degrees(a)
  const brute = allWalks(a)
  const best = longestWalk(a)
  check('1736: seven bridges, degrees 5, 3, 3, 3', a.length === 7 && k.K === 5 && k.N === 3 && k.S === 3 && k.L === 3, JSON.stringify(k))
  check('1736: verdict "impossible", four odd land masses', verdict(a).kind === 'none' && verdict(a).odd.length === 4)
  check('1736: exhaustive search finds no walk over all seven', brute.complete.length === 0 && eulerRoute(a) === null, `${brute.complete.length} complete walks`)
  check('1736: the longest walk crosses six', brute.longest === 6 && best.steps.length === 6 && !!walkState(a, best.start, best.steps), `brute force ${brute.longest}, panel ${best.steps.length}`)

  // One extra bridge on any of the six pairs allows a walk but not a closed tour.
  const extras = SLOTS.filter((s) => !s.y1736)
  const pairs = new Set(extras.map((s) => [s.a, s.b].sort().join('')))
  let walkOnly = 0
  for (const s of extras) {
    const v = verdict([...a, s.id])
    const r = eulerRoute([...a, s.id])
    if (v.kind === 'trail' && r && validRoute([...a, s.id], r) && allWalks([...a, s.id]).longest === 8) walkOnly++
  }
  check('1736 + one bridge: all six pairs allow a walk, none a closed tour', pairs.size === 6 && extras.length === 6 && walkOnly === 6, `${walkOnly} of ${extras.length}`)
  let tours = 0
  const tourPairs = []
  for (let i = 0; i < extras.length; i++) {
    for (let j = i + 1; j < extras.length; j++) {
      const act = [...a, extras[i].id, extras[j].id]
      if (verdict(act).kind === 'circuit') {
        const r = eulerRoute(act)
        if (validRoute(act, r) && walkState(act, r.start, r.steps).land === r.start) {
          tours++
          tourPairs.push(`${extras[i].a}–${extras[i].b} + ${extras[j].a}–${extras[j].b}`)
        }
      }
    }
  }
  check('1736 + two bridges: a closed tour for 3 of the 15 pairs of extra bridges', tours === 3, tourPairs.join('; '))
}
{
  const a = preset('today')
  const k = degrees(a)
  const brute = allWalks(a)
  const v = verdict(a)
  const r = eulerRoute(a)
  check('today: five bridges, degrees 2, 2, 3, 3', a.length === 5 && k.N === 2 && k.S === 2 && k.K === 3 && k.L === 3, JSON.stringify(k))
  check('today: verdict "walk possible" between Kneiphof and Lomse', v.kind === 'trail' && v.odd.join('') === 'KL')
  check('today: complete walks exist, and every one starts and ends on the two islands', brute.complete.length > 0 && brute.complete.every((w) => 'KL'.includes(w.start) && 'KL'.includes(w.end) && w.start !== w.end), `${brute.complete.length} complete walks`)
  check('today: Hierholzer route is valid and best possible is five', validRoute(a, r) && longestWalk(a).steps.length === 5)
}
{
  // Hierholzer and the exhaustive search agree on every one of the 2^13 layouts.
  let ok = true
  let euler = 0
  for (let mask = 0; mask < 1 << SLOTS.length; mask++) {
    const act = SLOTS.filter((_, i) => mask & (1 << i)).map((s) => s.id)
    const r = eulerRoute(act)
    const best = longestWalk(act)
    if (!walkState(act, best.start, best.steps)) ok = false
    if (r) {
      euler++
      if (!validRoute(act, r) || best.steps.length !== act.length) ok = false
    } else if (act.length && best.steps.length === act.length) ok = false
  }
  check(`all ${1 << SLOTS.length} layouts: a route is found exactly when the longest walk uses every bridge`, ok, `${euler} layouts with an Euler walk`)
}

// ---------------------------------------------------------------- Microscope

console.log('— Network microscope')
{
  const s = analyze(nets.windmill)
  check('windmill n = 10: <C> = 0.9549, transitivity = 0.1429', close(s.avgClustering, 0.9549) && close(s.transitivity, 0.1429), `<C> ${f4(s.avgClustering)}, T ${f4(s.transitivity)}, N ${s.n}, L ${s.L}, triangles ${s.triangles}`)
  const n = 10
  check('windmill: formulas (2n + 1/(2n−1))/(2n+1) and 3/(2n+1)', close(s.avgClustering, (2 * n + 1 / (2 * n - 1)) / (2 * n + 1), 1e-12) && close(s.transitivity, 3 / (2 * n + 1), 1e-12))
}
{
  const s = analyze(nets.ring)
  check('ring lattice N = 20: clustering 0.5, diameter 5', close(s.avgClustering, 0.5, 1e-12) && s.diameter === 5, `<C> ${f4(s.avgClustering)}, T ${f4(s.transitivity)}, diameter ${s.diameter}, <k> ${s.meanDegree}, <d> ${f4(s.avgDistance)}`)
}
{
  const s = analyze(nets.path)
  check('path of 10: diameter 9, average distance 3.667', s.diameter === 9 && close(s.avgDistance, 11 / 3, 1e-12), `diameter ${s.diameter}, <d> ${s.avgDistance.toFixed(3)}`)
}
{
  const s = analyze(nets.complete)
  check('complete graph of 8: L = 28, density 1, clustering 1', s.L === 28 && s.density === 1 && close(s.avgClustering, 1, 1e-12) && close(s.transitivity, 1, 1e-12), `L ${s.L}, density ${s.density}, <C> ${s.avgClustering}`)
}
{
  const s = analyze(nets.random)
  check('random N = 30: L = 45, <k> = 3', s.n === 30 && s.L === 45 && s.meanDegree === 3, `<C> ${f4(s.avgClustering)}, T ${f4(s.transitivity)}, triangles ${s.triangles}, components ${s.components}, largest ${s.largest}, diameter ${s.diameter}`)
}
{
  const s = analyze(nets.groups)
  const order = orderByComponent(s)
  const blocks = order.map((v) => s.componentLabel[v])
  check('two groups: 2 components, grouped order is contiguous', s.components === 2 && blocks.every((c, i) => i === 0 || c === blocks[i - 1] || !blocks.slice(0, i - 1).includes(c)), `sizes ${s.componentSizes.join(', ')}, L ${s.L}`)
}
{
  const s = analyze(karate)
  check('karate club: N = 34, L = 78, largest degree 17', s.n === 34 && s.L === 78 && s.maxDegree === 17, `N ${s.n}, L ${s.L}, kmax ${s.maxDegree}, <k> ${s.meanDegree.toFixed(3)}, density ${s.density.toFixed(4)}`)
  check('karate club: 45 triangles, <C> = 0.5706, transitivity = 0.2557', s.triangles === 45 && close(s.avgClustering, 0.5706) && close(s.transitivity, 0.2557), `triangles ${s.triangles}, <C> ${f4(s.avgClustering)}, T ${f4(s.transitivity)}`)
  check('karate club: diameter 5, average distance 2.408', s.diameter === 5 && close(s.avgDistance, 2.408, 5e-4), `diameter ${s.diameter}, <d> ${f4(s.avgDistance)}`)
  const ranked = [...s.degree.keys()].sort((a, b) => s.degree[b] - s.degree[a])
  const [first, second] = ranked
  let cut = removeNode(karate, Math.max(first, second))
  cut = removeNode(cut, Math.min(first, second))
  const c = analyze(cut)
  const sizes = [...c.componentSizes].sort((a, b) => b - a)
  check('karate club: members 34 and 1 have 17 and 16 links', karate.labels[first] === '34' && s.degree[first] === 17 && karate.labels[second] === '1' && s.degree[second] === 16, `${karate.labels[first]}: ${s.degree[first]}, ${karate.labels[second]}: ${s.degree[second]}, third: ${karate.labels[ranked[2]]} with ${s.degree[ranked[2]]}`)
  console.log(`INFO  karate club without members 1 and 34: ${c.components} pieces of sizes ${sizes.join(', ')} (N ${c.n}, L ${c.L})`)
  for (let comp = 0; comp < c.components; comp++) {
    const members = cut.labels.filter((_, v) => c.componentLabel[v] === comp)
    if (members.length < 10) console.log(`INFO    piece of ${members.length}: members ${members.join(', ')}`)
  }
}
{
  const s = analyze(florentine)
  const top = [...s.degree.keys()].sort((a, b) => s.degree[b] - s.degree[a])[0]
  check('Florentine families: N = 15, L = 20, largest degree 6 (Medici)', s.n === 15 && s.L === 20 && s.maxDegree === 6 && florentine.labels[top] === 'Medici', `<k> ${s.meanDegree.toFixed(2)}, density ${s.density.toFixed(3)}, <C> ${f4(s.avgClustering)}, T ${f4(s.transitivity)}, triangles ${s.triangles}, diameter ${s.diameter}`)
}

// ---------------------------------------------------------------- Lecture table

console.log('— Table of the lecture')
{
  const rows = [
    ['Florentine families', 15, 20, 2.67, 0.19],
    ["Zachary's karate club", 34, 78, 4.59, 0.14],
    ['C. elegans', 282, (282 * 14) / 2, 14, 0.05],
    ['Western US power grid', 4941, (4941 * 2.67) / 2, 2.67, 5.4e-4],
    ['Film actors', 225226, (225226 * 61) / 2, 61, 2.7e-4],
  ]
  for (const [name, N, L, k, d] of rows) {
    const kk = (2 * L) / N
    const dd = kk / (N - 1)
    check(`${name}: <k> ${k}, density ${d}`, Math.abs(kk - k) < 0.006 && Math.abs(dd - d) / d < 0.03, `L ${Math.round(L)}, <k> ${kk.toFixed(3)}, density ${dd.toExponential(3)}`)
  }
  const ratio = 20 / 105 / (2.67 / 4940)
  check('Florentine families vs power grid: densities about 350 times apart', Math.abs(ratio - 350) < 10, ratio.toFixed(1))
}

// ---------------------------------------------------------------- Projections

// Independent computation: the off-diagonal part of B·Bᵀ (and of Bᵀ·B).
function byMatrixProduct(grid) {
  const B = grid.map((row) => row.map((x) => (x ? 1 : 0)))
  const mult = (X, Y) => X.map((r) => Y[0].map((_, j) => r.reduce((sum, x, k) => sum + x * Y[k][j], 0)))
  const transpose = (X) => X[0].map((_, j) => X.map((r) => r[j]))
  const offDiagonal = (M) => M.map((r, i) => r.map((x, j) => (i === j ? 0 : x)))
  return { top: offDiagonal(mult(B, transpose(B))), bottom: offDiagonal(mult(transpose(B), B)) }
}
const sameMatrix = (X, Y) => X.every((r, i) => r.every((x, j) => x === Y[i][j]))
const agrees = (grid) => {
  const p = project(grid)
  const m = byMatrixProduct(grid)
  return sameMatrix(p.top.weight, m.top) && sameMatrix(p.bottom.weight, m.bottom)
}

console.log('— One system, two projections')
{
  const e6 = project(PRESET_GRIDS.exercise6())
  check('Exercise 6 preset: 10 bipartite links, 8 author links, 4 paper links', e6.links === 10 && e6.bottom.links === 8 && e6.top.links === 4 && agrees(PRESET_GRIDS.exercise6()), `largest weight ${Math.max(e6.top.maxWeight, e6.bottom.maxWeight)}`)
  const w = e6.top.weight
  check('Exercise 6 preset: the papers form a ring P1–P2–P3–P4–P1', w[0][1] === 1 && w[1][2] === 1 && w[2][3] === 1 && w[3][0] === 1 && w[0][2] === 0 && w[1][3] === 0)
  const big = project(PRESET_GRIDS.bigPaper())
  check('One big paper: 8 bipartite links give 28 projected links', big.links === 8 && big.bottom.links === 28 && big.top.links === 0 && agrees(PRESET_GRIDS.bigPaper()))

  // Same author projection as Exercise 6 from a different set of papers.
  const other = emptyGrid()
  ;[[0, 1], [0, 2], [1, 2], [2, 3], [3, 4, 5], [0, 5]].forEach((list, t) => list.forEach((b) => (other[t][b] = true)))
  const o = project(other)
  check('a different set of papers gives the same author projection as Exercise 6', sameMatrix(o.bottom.weight, e6.bottom.weight) && o.links !== e6.links, `${o.links} bipartite links instead of ${e6.links}`)

  const random = mulberry32(99)
  let ok = true
  for (let i = 0; i < 100; i++) {
    const grid = emptyGrid()
    const p = 0.1 + 0.8 * random()
    for (let t = 0; t < TOPS; t++) for (let b = 0; b < BOTTOMS; b++) grid[t][b] = random() < p
    if (!agrees(grid)) ok = false
  }
  check('100 random bipartite networks: weights equal the off-diagonal of B·Bᵀ and Bᵀ·B', ok)
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
