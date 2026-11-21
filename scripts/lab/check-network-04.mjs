// Self-checks for Network Lab module 04, "Triangles, weak ties and motifs".
// They run the same code as the page (overlap.js, closure.js, weakties.js,
// motifs.js) and compare it with values worked out by hand, with theory and
// with a brute-force count.
//
//   node scripts/lab/check-network-04.mjs
//
// Exits with code 1 if any check fails. Rerun it whenever those files, the
// presets or the seeds change. Lines starting with INFO report the numbers
// quoted in the lecture, the "what to observe" lists and the exercises.
import { mulberry32 } from '../../src/components/lab/rng.js'
import {
  adjacency, overlap, linkTable, triangleStats, distanceStats, TWO_CLUSTERS,
} from '../../src/components/lab/network/triangles-weak-ties-motifs/overlap.js'
import {
  closureRun, closureStats, closureCurve, CLOSURE_N, START_LINKS, END_LINKS, CLOSURE_SEED,
} from '../../src/components/lab/network/triangles-weak-ties-motifs/closure.js'
import {
  weakExperiment, weakSample, giantAtBetweenShare, overlapByStrength, correlation, removalCurve, piecesAfter,
  ORDER_IDS, STEPS, WEAK_SEED, WEAK_RUNS, GROUPS, GROUP_SIZE,
} from '../../src/components/lab/network/triangles-weak-ties-motifs/weakties.js'
import {
  PATTERNS, PATTERN_IDS, CLASS, indexOfPattern, matrix, countPatterns, countNet, countBrute, profile, randomiser, motifJob,
  MOTIF_NETWORKS, NETWORK_SEED, NULL_DEFAULT, NULL_MAX, mutualLinks, REG, WEB_LEVELS,
} from '../../src/components/lab/network/triangles-weak-ties-motifs/motifs.js'

let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const info = (text) => console.log(`INFO  ${text}`)
const f1 = (x) => x.toFixed(1)
const f2 = (x) => x.toFixed(2)
const f3 = (x) => x.toFixed(3)
const near = (v, want, tol) => Math.abs(v - want) <= tol
const q = (name, cond, detail = '') => check(`quoted on the page — ${name}`, cond, detail)
const drain = (job) => {
  for (const _ of job.iter);
  return job.snapshot()
}
// A network from a string of links such as 'a-b a-c b-c'.
function named(text) {
  const names = []
  const id = (x) => (names.includes(x) ? names.indexOf(x) : names.push(x) - 1)
  const pairs = text.split(/\s+/).map((l) => l.split('-').map(id))
  return { n: names.length, A: Int32Array.from(pairs, (p) => p[0]), B: Int32Array.from(pairs, (p) => p[1]), names }
}
const link = (g, table, text) => {
  const [a, b] = text.split('-').map((x) => g.names.indexOf(x))
  return table.find((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a))
}
const linkName = (g, r) => `${g.names[r.a]}-${g.names[r.b]}`

// ---------------------------------------------------------------- Overlap

{
  const pairs = []
  for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) pairs.push(`${a}-${b}`)
  const K5 = named(pairs.join(' '))
  check('overlap: 1 for every link of a clique of five', linkTable(K5).every((r) => r.value === 1 && !r.localBridge))

  const two = named('a-b a-c b-c c-d d-e d-f e-f')
  const t2 = linkTable(two)
  const cd = link(two, t2, 'c-d')
  check('overlap: 0 for a bridge (two triangles joined by c-d), and it is the only bridge', cd.value === 0 && cd.bridge && t2.filter((r) => r.bridge).length === 1)

  // Exercise 1
  const ex1 = named('a-b a-c b-c b-d c-d d-e e-f e-g f-g')
  const t1 = linkTable(ex1)
  const o = (x) => link(ex1, t1, x)
  check('Exercise 1: overlap of b-c is 1, of a-b 0.5, of d-e 0', o('b-c').value === 1 && o('a-b').value === 0.5 && o('d-e').value === 0, `${o('b-c').value}, ${o('a-b').value}, ${o('d-e').value}`)
  check('Exercise 1: d-e is the only bridge, and the only local bridge', t1.filter((r) => r.bridge).map((r) => linkName(ex1, r)).join() === 'd-e' && t1.filter((r) => r.localBridge).length === 1)
  info(`Exercise 1: b-c shares ${o('b-c').common} of ${o('b-c').others} other neighbours, a-b ${o('a-b').common} of ${o('a-b').others}, d-e ${o('d-e').common} of ${o('d-e').others}`)
  q('Exercise 1 solution: 2 of 2, 1 of 2, 0 of 4; e-f, e-g and f-g have overlap 0.5, 0.5 and 1', o('b-c').common === 2 && o('b-c').others === 2 && o('a-b').common === 1 && o('a-b').others === 2 && o('d-e').common === 0 && o('d-e').others === 4 && o('e-f').value === 0.5 && o('e-g').value === 0.5 && o('f-g').value === 1)

  // A local bridge that is not a bridge: a ring of four.
  const ring = named('a-b b-c c-d d-a')
  check('a ring of four: every link is a local bridge and none is a bridge', linkTable(ring).every((r) => r.localBridge && !r.bridge))
  // A link with no other neighbour at either end.
  check('an isolated link has overlap 0 (nothing to share)', overlap(adjacency(named('a-b')), 0, 1).value === 0)
}

// ---------------------------------------------------------------- Figure "Overlap"

{
  const g = TWO_CLUSTERS
  const t = linkTable(g)
  const local = t.filter((r) => r.localBridge).map((r) => linkName(g, r)).join(' ')
  const bridges = t.filter((r) => r.bridge).map((r) => linkName(g, r)).join(' ')
  check('figure: twelve nodes, eighteen links, one piece', g.n === 12 && g.A.length === 18 && distanceStats(adjacency(g)).pieces === 1)
  q('figure: three local bridges, f-g, h-j and i-k; only f-g is a bridge', local === 'f-g h-j i-k' && bridges === 'f-g', `local ${local}; bridges ${bridges}`)
  q('figure and lecture: b-c shares a and d out of a, d, e: overlap 2/3', link(g, t, 'b-c').common === 2 && link(g, t, 'b-c').others === 3)
  info(`figure: overlaps ${t.map((r) => `${linkName(g, r)} ${r.common}/${r.others}`).join(', ')}`)
}

// ---------------------------------------------------------------- Exercise 3

{
  const star = named('h-1 h-2 h-3 h-4')
  const s = triangleStats(adjacency(star))
  check('Exercise 3: a hub with four leaves has transitivity 0', s.transitivity === 0 && s.triples === 6)
  const closed = named('h-1 h-2 h-3 h-4 1-2 3-4')
  const c = triangleStats(adjacency(closed))
  check('Exercise 3: with 1-2 and 3-4, transitivity 0.6 and average clustering 0.867', near(c.transitivity, 0.6, 1e-12) && f3(c.avgClustering) === '0.867', `${c.transitivity}, ${f3(c.avgClustering)}`)
  q('Exercise 3 solution: 2 triangles, 10 connected triples, hub 1/3, leaves 1', c.triangles === 2 && c.triples === 10 && near(c.local[0], 1 / 3, 1e-12) && [1, 2, 3, 4].every((v) => c.local[v] === 1))
}

// ---------------------------------------------------------------- Thirteen patterns

const P = (id) => indexOfPattern(id)
{
  check('thirteen patterns', PATTERNS.length === 13 && new Set(PATTERN_IDS).size === 13)
  const classes = new Set(Array.from(CLASS).filter((c) => c >= 0))
  check('the 64 ways of linking three nodes fall into 13 connected classes, all of them listed', classes.size === 13 && !Array.from(CLASS).includes(-2))
  let alone = true
  PATTERNS.forEach((p, k) => {
    const c = countNet({ n: 3, links: p.links })
    if (c[k] !== 1 || c.reduce((s, v) => s + v, 0) !== 1) alone = false
    // The same pattern with its nodes renamed, inside a larger empty network.
    const c2 = countNet({ n: 5, links: p.links.map(([a, b]) => [[4, 2, 0][a], [4, 2, 0][b]]) })
    if (c2[k] !== 1 || c2.reduce((s, v) => s + v, 0) !== 1) alone = false
  })
  check('each of the thirteen patterns alone is counted once, in its own class', alone)
  const linkCounts = PATTERNS.map((p) => p.links.length).join(' ')
  check('patterns have 2, 2, 2, 3, 3, 4, 3, 3, 4, 4, 4, 5 and 6 links', linkCounts === '2 2 2 3 3 4 3 3 4 4 4 5 6', linkCounts)

  // Exercise 4: X→Y, Y→Z, X→Z, Z→W, W→X  (X 0, Y 1, Z 2, W 3)
  const ex4 = countNet({ n: 4, links: [[0, 1], [1, 2], [0, 2], [2, 3], [3, 0]] })
  check('Exercise 4: one feed-forward loop, one cycle, two chains, nothing else', ex4[P('feedForward')] === 1 && ex4[P('cycle')] === 1 && ex4[P('chain')] === 2 && ex4.reduce((s, v) => s + v, 0) === 4, Array.from(ex4).join(' '))

  let agree = true
  let triples = 0
  let withMutual = 0
  for (let s = 0; s < 50; s++) {
    const random = mulberry32(900 + s)
    const n = 30
    const has = new Set()
    const links = []
    while (links.length < 120) {
      const a = Math.floor(random() * n)
      const b = Math.floor(random() * n)
      if (a === b || has.has(a * n + b)) continue
      has.add(a * n + b)
      links.push([a, b])
    }
    const net = { n, links }
    const fast = countNet(net)
    const brute = countBrute(net)
    if (fast.reduce((x, v) => x + v, 0) !== brute.connected || fast.some((v, k) => v !== brute.counts[k])) agree = false
    triples += brute.connected
    withMutual += mutualLinks(net)
  }
  check('50 random directed networks of 30 nodes: the thirteen counts add up to the brute-force number of connected triples, class by class', agree, `${triples} triples, ${withMutual} mutual links in all`)
}

// ---------------------------------------------------------------- Randomisation

{
  const sameProfile = (a, b) => ['inn', 'out', 'mutual'].every((key) => a[key].every((v, i) => v === b[key][i]))
  const clean = (n, has, L) => {
    let ones = 0
    for (let i = 0; i < n * n; i++) ones += has[i]
    for (let v = 0; v < n; v++) if (has[v * n + v]) return false
    return ones === L
  }
  // A network with many mutual links: 40 nodes, 150 links, 30 of them made mutual.
  const random = mulberry32(77)
  const n = 40
  const seen = new Set()
  const links = []
  const add = (a, b) => {
    if (a === b || seen.has(a * n + b)) return false
    seen.add(a * n + b)
    links.push([a, b])
    return true
  }
  while (links.length < 150) add(Math.floor(random() * n), Math.floor(random() * n))
  for (let i = 0; i < 30; i++) add(links[i][1], links[i][0])
  for (const [label, net] of [['40 nodes with mutual links', { n, links }], ['the regulation-like network', MOTIF_NETWORKS.regulation(NETWORK_SEED)]]) {
    const before = profile(net.n, matrix(net))
    const start = matrix(net)
    const sw = randomiser(net, mulberry32(5))
    let ok = true
    let swaps = 0
    while (swaps < 10000 && sw.attempts < 1e6) {
      if (!sw.attempt()) continue
      swaps++
      if (!sameProfile(before, profile(net.n, sw.has)) || !clean(net.n, sw.has, net.links.length)) ok = false
    }
    let moved = 0
    for (let i = 0; i < start.length; i++) if (start[i] && !sw.has[i]) moved++
    check(`randomisation, ${label}: after each of 10,000 swaps every node keeps its incoming, outgoing and mutual links; no self-link, no duplicate`, ok && swaps === 10000, `${mutualLinks(net)} mutual links; ${sw.attempts} attempts; ${moved} of ${net.links.length} links are elsewhere at the end`)
  }
}

// ---------------------------------------------------------------- Panel A: close the triangle

{
  const finalOf = (p, seed) => {
    const run = closureRun(p, seed)
    while (run.step());
    return closureStats(run)
  }
  const density = (2 * END_LINKS) / (CLOSURE_N * (CLOSURE_N - 1))
  let sum = 0
  let within = 0
  let worst = 0
  for (let s = 0; s < 50; s++) {
    const t = finalOf(0, 100 + s).transitivity
    sum += t
    if (Math.abs(t - density) <= 0.01) within++
    worst = Math.max(worst, Math.abs(t - density))
  }
  check('Panel A: at p = 0 the transitivity is within 0.01 of the density (mean of 50 runs, and at least 45 single runs)', near(sum / 50, density, 0.01) && within >= 45, `density ${density.toFixed(4)}, mean transitivity ${(sum / 50).toFixed(4)}, ${within} of 50 runs within 0.01, largest gap ${worst.toFixed(4)}`)

  const ps = [0, 0.25, 0.5, 0.75, 1]
  const mean = ps.map((p) => {
    let t = 0
    for (let s = 0; s < 20; s++) t += finalOf(p, 200 + s).transitivity / 20
    return t
  })
  check('Panel A: the transitivity, averaged over 20 runs, rises with p over 0, 0.25, 0.5, 0.75, 1', mean.every((v, i) => i === 0 || v > mean[i - 1]), mean.map(f3).join(' < '))

  const a = closureRun(0, CLOSURE_SEED)
  const b = closureRun(0, CLOSURE_SEED)
  while (a.step());
  while (b.step());
  check('Panel A: a run is reproducible, and ends at 800 links from 200', a.links === END_LINKS && a.A.every((v, e) => v === b.A[e] && a.B[e] === b.B[e]) && START_LINKS === 200)
  const one = closureRun(1, CLOSURE_SEED)
  const before = distanceStats(one.adj)
  while (one.step());
  const after = distanceStats(one.adj)
  check('Panel A: at p = 1 every link closes a triangle, so the pieces never merge', one.closed === END_LINKS - START_LINKS && before.pieces === after.pieces && before.largest === after.largest, `${one.closed} closures, ${after.pieces} pieces, largest ${after.largest}`)

  // The panel's own run, for the texts.
  const rows = {}
  for (const p of ps) {
    const { points, final, run } = closureCurve(p)
    rows[p] = { final, at500: points.find((x) => x.links === 500), start: points[0], closed: run.closed }
    info(`Panel A, p = ${p}: at 800 links transitivity ${f3(final.transitivity)}, clustering ${f3(final.clustering)}, distance ${f2(final.distance)}, largest piece ${f3(final.giant)}, local bridges ${f3(final.localBridges)}, closures ${run.closed}`)
  }
  const s0 = rows[0].start
  info(`Panel A, start: ${s0.links} links, transitivity ${f3(s0.transitivity)}, distance ${f2(s0.distance)}, largest piece ${f3(s0.giant)} (${s0.pieces} pieces), local bridges ${f3(s0.localBridges)}`)
  const r = (p) => rows[p].final
  q('Panel A, start: 200 links, no triangle, every link a local bridge, largest piece 0.815, distance 6.22', s0.triangles === 0 && s0.localBridges === 1 && f3(s0.giant) === '0.815' && f2(s0.distance) === '6.22')
  q('Panel A, p = 0 at 800 links: transitivity 0.033 (density 0.040), clustering 0.030, distance 2.76, local bridges 0.76', f3(r(0).transitivity) === '0.033' && f3(r(0).density) === '0.040' && f3(r(0).clustering) === '0.030' && f2(r(0).distance) === '2.76' && f2(r(0).localBridges) === '0.76')
  q('Panel A, p = 0.5 at 800 links: transitivity 0.167, clustering 0.235, distance 2.88, local bridges 0.18, 288 closures', f3(r(0.5).transitivity) === '0.167' && f3(r(0.5).clustering) === '0.235' && f2(r(0.5).distance) === '2.88' && f2(r(0.5).localBridges) === '0.18' && rows[0.5].closed === 288)
  q('Panel A, p = 1 at 800 links: transitivity 0.339, clustering 0.455, local bridges 0.01, largest piece still 0.815, distance 2.76', f3(r(1).transitivity) === '0.339' && f3(r(1).clustering) === '0.455' && f2(r(1).localBridges) === '0.01' && f3(r(1).giant) === '0.815' && f2(r(1).distance) === '2.76')
  q('Panel A, p = 0.75 at 800 links: transitivity 0.245, largest piece 0.95', f3(r(0.75).transitivity) === '0.245' && f2(r(0.75).giant) === '0.95')
}

// ---------------------------------------------------------------- Panel B: weak ties hold it together

{
  const on = weakExperiment(true)
  const off = weakExperiment(false)
  const first = on.first
  check('Panel B: eight groups of 25; every network of the 300 starts in one piece', GROUPS === 8 && GROUP_SIZE === 25 && ORDER_IDS.every((id) => near(on.mean[id].giant[0], 1, 1e-12)) && WEAK_RUNS === 300 && on.runs === 300)
  const weak = giantAtBetweenShare(true, 'weakest')
  const strong = giantAtBetweenShare(true, 'strongest')
  const low = giantAtBetweenShare(true, 'lowOverlap')
  check('Panel B, switch on: with a fraction removed equal to the share of between-group links, weakest first and strongest first differ clearly', strong - weak > 0.3, `largest piece ${f3(weak)} weakest first, ${f3(strong)} strongest first, ${f3(low)} lowest overlap first; average share ${f3(on.betweenShare)}`)
  // The orders that ignore strength have a generator of their own: the switch
  // must not move them at all, point by point, in either quantity.
  const unmoved = ['random', 'lowOverlap', 'highOverlap'].filter((id) => ['giant', 'others'].every((key) => on.mean[id][key].every((v, i) => v === off.mean[id][key][i])))
  check('Panel B: at random, lowest overlap first and highest overlap first are the same, point by point, with the switch on and off', unmoved.length === 3, unmoved.join(', '))
  const sameOrders = ['random', 'lowOverlap', 'highOverlap'].every((id) => on.first.orders[id].every((e, i) => e === off.first.orders[id][i]))
  check('Panel B: in the drawn network those three removal orders are the same link for link', sameOrders)
  // Switch off: weakest first, strongest first and at random, largest gap
  // among the three at any fraction, for the panel's seed and ten others.
  const gap3 = (ex) => {
    let m = 0
    let at = 0
    for (let i = 0; i <= STEPS; i++) {
      const v = ['weakest', 'strongest', 'random'].map((id) => ex.mean[id].giant[i])
      if (Math.max(...v) - Math.min(...v) > m) {
        m = Math.max(...v) - Math.min(...v)
        at = i / STEPS
      }
    }
    return { m, at }
  }
  const gap2 = (ex) => {
    let m = 0
    for (let i = 0; i <= STEPS; i++) m = Math.max(m, Math.abs(ex.mean.weakest.giant[i] - ex.mean.strongest.giant[i]))
    return m
  }
  const gap = gap2(off)
  const seedGaps = [{ seed: WEAK_SEED, three: gap3(off), two: gap }]
  for (let s = 1; s <= 10; s++) {
    const ex = weakExperiment(false, WEAK_SEED + s)
    seedGaps.push({ seed: WEAK_SEED + s, three: gap3(ex), two: gap2(ex) })
  }
  for (const r of seedGaps) info(`Panel B, switch off, seed ${r.seed}, ${WEAK_RUNS} networks: largest gap among weakest first, strongest first and at random ${f3(r.three.m)} (at f = ${f2(r.three.at)}); between weakest and strongest first ${f3(r.two)}`)
  check('Panel B, switch off, the panel\'s seed and WEAK_SEED + 1 to + 10: weakest first, strongest first and at random stay within 0.05 of one another at every fraction', seedGaps.every((r) => r.three.m <= 0.05), seedGaps.map((r) => f3(r.three.m)).join(' '))
  const c =removalCurve(first.net, first.orders.lowOverlap)
  const k = Math.round(0.5 * first.net.A.length)
  check('Panel B: the curve and the drawing agree on the largest piece', near(c.giant[k], piecesAfter(first.net, first.orders.lowOverlap, k).largest / first.net.n, 1e-12))
  check('Panel B, switch off: the same strengths, dealt out again', Array.from(off.first.strength).sort().join() === Array.from(on.first.strength).sort().join() && off.first.net.A.length === first.net.A.length)

  const g = (ex, id, f) => ex.mean[id].giant[Math.round(f * STEPS)]
  const o = (ex, id, f) => ex.mean[id].others[Math.round(f * STEPS)]
  const half = (ex, id) => {
    for (let i = 0; i <= STEPS; i++) if (ex.mean[id].giant[i] < 0.5) return i / STEPS
    return 1
  }
  const peak = (ex, id) => {
    let best = 0
    for (let i = 0; i <= STEPS; i++) if (ex.mean[id].others[i] > ex.mean[id].others[best]) best = i
    return { f: best / STEPS, value: ex.mean[id].others[best] }
  }
  info(`Panel B, first network: ${first.net.A.length} links, ${first.betweenLinks} between groups (${f3(first.betweenShare)}); correlation of strength and overlap ${f3(correlation(first.strength, first.overlap))} on, ${f3(correlation(off.first.strength, off.first.overlap))} off`)
  for (const [label, ex] of [['on', on], ['off', off]]) {
    for (const id of ORDER_IDS) {
      const pk = peak(ex, id)
      info(`Panel B, ${label}, ${id}: largest piece ${[0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.1, 0.5, 0.8, 0.85, 0.9, 0.95].map((f) => `${f}: ${f3(g(ex, id, f))}`).join(', ')}; below one half from f = ${f2(half(ex, id))}; other pieces peak at ${f1(pk.value)} (f = ${f2(pk.f)})`)
    }
    info(`Panel B, ${label}: overlap by tenth of strength ${overlapByStrength(ex.first.strength, ex.first.overlap).map((b) => f2(b.overlap)).join(' ')}`)
  }
  const tenthsOn = overlapByStrength(first.strength, first.overlap)
  const tenthsOff = overlapByStrength(off.first.strength, off.first.overlap)
  // Where strongest first and at random cross (switch on).
  const diff = (i) => on.mean.strongest.giant[i] - on.mean.random.giant[i]
  let cross = -1
  for (let i = 1; i <= STEPS; i++) if (diff(i - 1) <= 0 && diff(i) > 0) cross = i
  info(`Panel B, on: strongest first minus at random, ${[0.5, 0.6, 0.7, 0.71, 0.75, 0.78, 0.79, 0.8, 0.85, 0.88, 0.9].map((f) => `${f}: ${f3(diff(Math.round(f * STEPS)))}`).join(', ')}; first above at f = ${f2(cross / STEPS)}`)
  const lowest = Math.min(...Array.from({ length: STEPS + 1 }, (_, i) => diff(i)))
  q('Panel B: the drawn network has 1,264 links, 73 of them between groups (6%)', first.net.A.length === 1264 && first.betweenLinks === 73 && f2(first.betweenShare) === '0.06')
  q('Panel B, on: weakest first 0.998 at f = 0.03, 0.974 at 0.04, 0.779 at 0.05, 0.413 at 0.06, 0.145 at 0.08, 0.129 at 0.1; below one half from f = 0.06', f3(g(on, 'weakest', 0.03)) === '0.998' && f3(g(on, 'weakest', 0.04)) === '0.974' && f3(g(on, 'weakest', 0.05)) === '0.779' && f3(g(on, 'weakest', 0.06)) === '0.413' && f3(g(on, 'weakest', 0.08)) === '0.145' && f3(g(on, 'weakest', 0.1)) === '0.129' && half(on, 'weakest') === 0.06)
  q('Panel B, on: strongest first 0.996 at f = 0.5, 0.848 at 0.8, 0.455 at 0.9; below one half from f = 0.90', f3(g(on, 'strongest', 0.5)) === '0.996' && f3(g(on, 'strongest', 0.8)) === '0.848' && f3(g(on, 'strongest', 0.9)) === '0.455' && half(on, 'strongest') === 0.9)
  q('Panel B, on: at random 0.822 at f = 0.8, below one half from f = 0.86; strongest first 0.948 against 0.975 at f = 0.7', f3(g(on, 'random', 0.8)) === '0.822' && half(on, 'random') === 0.86 && f3(g(on, 'strongest', 0.7)) === '0.948' && f3(g(on, 'random', 0.7)) === '0.975')
  // (At f = 0.28 strongest first is ahead by 1/60,000, one node in one of the
  // 300 networks; at f = 0.99, with a handful of nodes left, at random is ahead
  // again by less than 0.001. The text, like the table, reads three decimals.)
  q('Panel B, on: strongest first stays below at random (to three decimals) up to f = 0.78, and above it from 0.79 to 0.95', cross === 79 && Array.from({ length: 79 }, (_, i) => diff(i)).every((d) => d < 1e-4) && Array.from({ length: 17 }, (_, j) => diff(79 + j)).every((d) => d > 0), `first above at ${cross / STEPS}; lowest difference ${f3(lowest)}`)
  q('Panel B, on: at the share of between-group links, 0.600 weakest first against 1.000 strongest first', f3(weak) === '0.600' && f3(strong) === '1.000')
  q('Panel B, on: lowest overlap first 0.578 at f = 0.05 and 0.229 at 0.06', f3(g(on, 'lowOverlap', 0.05)) === '0.578' && f3(g(on, 'lowOverlap', 0.06)) === '0.229')
  q('Panel B, on: the other pieces average about 26 nodes at their peak, weakest first (f = 0.07) and lowest overlap first (f = 0.06)', Math.round(peak(on, 'weakest').value) === 26 && near(peak(on, 'weakest').f, 0.07, 1e-9) && Math.round(peak(on, 'lowOverlap').value) === 26 && near(peak(on, 'lowOverlap').f, 0.06, 1e-9), `${f2(peak(on, 'weakest').value)} at ${peak(on, 'weakest').f}; ${f2(peak(on, 'lowOverlap').value)} at ${peak(on, 'lowOverlap').f}`)
  q('Panel B, on: strongest first, the other pieces never average 2 nodes; at random never 3', Math.max(...on.mean.strongest.others) < 2 && Math.max(...on.mean.random.others) < 3, `${f2(Math.max(...on.mean.strongest.others))}, random ${f2(Math.max(...on.mean.random.others))}`)
  q('Panel B, on, at f = 0.1: 0.129 weakest first, 1.000 strongest first', f3(g(on, 'weakest', 0.1)) === '0.129' && f3(g(on, 'strongest', 0.1)) === '1.000')
  q('Panel B, off: weakest first and strongest first 0.999 at f = 0.5; 0.812, 0.486, 0.148 and 0.823, 0.508, 0.151 at f = 0.8, 0.85, 0.9; below one half from f = 0.85 and 0.86; largest gap between the two 0.026', f3(g(off, 'weakest', 0.5)) === '0.999' && f3(g(off, 'strongest', 0.5)) === '0.999' && f3(g(off, 'weakest', 0.8)) === '0.812' && f3(g(off, 'weakest', 0.85)) === '0.486' && f3(g(off, 'weakest', 0.9)) === '0.148' && f3(g(off, 'strongest', 0.8)) === '0.823' && f3(g(off, 'strongest', 0.85)) === '0.508' && f3(g(off, 'strongest', 0.9)) === '0.151' && half(off, 'weakest') === 0.85 && half(off, 'strongest') === 0.86 && f3(gap) === '0.026')
  q('Panel B, off: at random 0.822 at f = 0.8; the three curves never more than 0.035 apart; ten other seeds give a gap between weakest and strongest first of 0.010 to 0.022', f3(g(off, 'random', 0.8)) === '0.822' && f3(seedGaps[0].three.m) === '0.035' && f3(Math.min(...seedGaps.slice(1).map((r) => r.two))) === '0.010' && f3(Math.max(...seedGaps.slice(1).map((r) => r.two))) === '0.022')
  q('Panel B, off: lowest overlap first still 0.229 at f = 0.06', f3(g(off, 'lowOverlap', 0.06)) === '0.229')
  q('Panel B: overlap by tenth of strength runs from 0.05 to 0.48 on, and stays between 0.26 and 0.29 off; correlation 0.97 on', f2(tenthsOn[0].overlap) === '0.05' && f2(tenthsOn[9].overlap) === '0.48' && tenthsOff.every((x) => x.overlap >= 0.255 && x.overlap < 0.295) && f2(correlation(first.strength, first.overlap)) === '0.97', `${f3(tenthsOn[0].overlap)} … ${f3(tenthsOn[9].overlap)}; off ${tenthsOff.map((x) => f3(x.overlap)).join(' ')}`)
}

// ---------------------------------------------------------------- Panel C: motif counter

{
  const run = (id, samples = NULL_DEFAULT) => {
    const net = MOTIF_NETWORKS[id](NETWORK_SEED)
    return { net, ...drain(motifJob(net, samples)) }
  }
  const line = (s) => PATTERN_IDS.map((p, k) => (s.observed[k] || s.mean[k] > 0 ? `${p} ${s.observed[k]} against ${f1(s.mean[k])} ± ${f1(s.sd[k])}, z ${Number.isFinite(s.z[k]) ? f1(s.z[k]) : '–'}` : null)).filter(Boolean).join('; ')
  const big = (s) => s.z.filter((z) => Number.isFinite(z) && Math.abs(z) > 3).length

  const rnd = run('random')
  check('Panel C, random network: at most one |z| above 3', big(rnd) <= 1, `${big(rnd)} above 3; largest |z| ${f1(Math.max(...rnd.z.filter(Number.isFinite).map(Math.abs)))}`)
  const reg = run('regulation')
  const ffl = P('feedForward')
  check('Panel C, regulation-like network: z of the feed-forward loop above 5', reg.z[ffl] > 5, `z = ${f1(reg.z[ffl])}`)
  const web = run('foodWeb')
  check('Panel C, food web: no feed-forward loop, no cycle, no mutual link', web.observed[ffl] === 0 && web.observed[P('cycle')] === 0 && mutualLinks(web.net) === 0 && web.observed.reduce((s, v) => s + v, 0) === web.observed[P('chain')] + web.observed[P('fanIn')] + web.observed[P('fanOut')])
  check('Panel C: the null networks keep the number of connected pairs of links, so the open and closed counts move together', (() => {
    // With no mutual links: chains + 2 × feed-forward + 3 × cycles is fixed by the degrees.
    const fixed = (c) => c[P('chain')] + c[P('feedForward')] + 3 * c[P('cycle')]
    const sw = randomiser(reg.net, mulberry32(3))
    const want = fixed(countNet(reg.net))
    for (let i = 0; i < 50; i++) {
      sw.mix(500)
      if (fixed(countPatterns(reg.net.n, sw.has)) !== want) return false
    }
    return true
  })())
  let above3 = 0
  let zMax = 0
  let zMaxAt = 0
  let fflMin = Infinity
  for (let seed = 1; seed <= 20; seed++) {
    const r = drain(motifJob(MOTIF_NETWORKS.random(seed), NULL_DEFAULT))
    above3 += big(r)
    const m = Math.max(...r.z.filter(Number.isFinite).map(Math.abs))
    if (m > zMax) {
      zMax = m
      zMaxAt = seed
    }
    fflMin = Math.min(fflMin, drain(motifJob(MOTIF_NETWORKS.regulation(seed), NULL_DEFAULT)).z[ffl])
  }
  info(`Panel C, networks 1 to 20 ("New network"): ${above3} |z| above 3 among the random networks, the largest |z| ${f2(zMax)} (network ${zMaxAt}); the smallest z of the feed-forward loop among the regulation-like ones is ${f1(fflMin)}`)
  q('Panel C: among networks 1 to 20, no random network has any |z| above 3 (the largest is 2.3, in network 7), and every regulation-like one has z above 5 for the feed-forward loop', above3 === 0 && f1(zMax) === '2.3' && zMaxAt === 7 && fflMin > 5, `${above3} above 3; largest ${f2(zMax)} in network ${zMaxAt}; smallest z ${f1(fflMin)}`)
  q('Panel C: 23 more feed-forward loops than the null mean; in the random network the patterns with a mutual pair and a third link have null means of 0.1 or less', Math.round(reg.observed[ffl] - reg.mean[ffl]) === 23 && ['pairOut', 'pairIn', 'cycleMutual'].every((id) => rnd.mean[P(id)] < 0.15 && rnd.observed[P(id)] === 0))
  for (const [id, s] of [['regulation', reg], ['foodWeb', web], ['random', rnd]]) {
    info(`Panel C, ${id}: ${s.net.n} nodes, ${s.net.links.length} links, ${mutualLinks(s.net)} mutual; ${s.samples} randomisations, ${f2(s.accepted / s.attempted)} of the swaps accepted`)
    info(`Panel C, ${id}: ${line(s)}`)
  }
  const reg1000 = run('regulation', NULL_MAX)
  info(`Panel C, regulation, ${NULL_MAX} randomisations: ${line(reg1000)}`)

  const row = (s, id) => `${s.observed[P(id)]} ${f1(s.mean[P(id)])} ${f1(s.sd[P(id)])} ${f1(s.z[P(id)])}`
  q('Panel C: regulation-like: 6 + 14 + 80 nodes, 116 links; food web: 239 links; random: 150 links, 1 mutual', REG.masters + REG.regulators + REG.targets === 100 && reg.net.links.length === 116 && web.net.links.length === 239 && WEB_LEVELS.join() === '30,30,25,15' && rnd.net.links.length === 150 && mutualLinks(rnd.net) === 1)
  q('Panel C, regulation-like, 200 randomisations: feed-forward loop 39 against 15.8 ± 3.3, z = 7.0', row(reg, 'feedForward') === '39 15.8 3.3 7.0', row(reg, 'feedForward'))
  q('Panel C, regulation-like: fan-out 401 against 424.2, fan-in 72 against 95.2, chain 72 against 94.6; z −7.0, −7.0, −6.5; no cycle', row(reg, 'fanOut') === '401 424.2 3.3 -7.0' && row(reg, 'fanIn') === '72 95.2 3.3 -7.0' && row(reg, 'chain') === '72 94.6 3.5 -6.5' && reg.observed[P('cycle')] === 0, `${row(reg, 'fanOut')} | ${row(reg, 'fanIn')} | ${row(reg, 'chain')}`)
  q('Panel C, regulation-like, 1,000 randomisations: feed-forward loop 39 against 15.7 ± 3.5, z = 6.7', row(reg1000, 'feedForward') === '39 15.7 3.5 6.7', `${row(reg1000, 'feedForward')}`)
  q('Panel C, food web: feed-forward loop 0 against 14.8 ± 3.9, z = −3.8; chain 461 against 439.2, z = 3.7; cycle 0 against 2.3', row(web, 'feedForward') === '0 14.8 3.9 -3.8' && row(web, 'chain') === '461 439.2 5.8 3.7' && f1(web.mean[P('cycle')]) === '2.3', `${row(web, 'feedForward')} | ${row(web, 'chain')}`)
  // Point 4: the excess of chains in the food web is the missing loops and cycles.
  const chainExcess = web.observed[P('chain')] - web.mean[P('chain')]
  const fromMissing = web.mean[ffl] - web.observed[ffl] + 3 * (web.mean[P('cycle')] - web.observed[P('cycle')])
  info(`Panel C, food web: excess of chains ${f2(chainExcess)}; missing feed-forward loops + 3 × missing cycles ${f2(fromMissing)}`)
  q('Panel C, food web: 461 − 439.2 equals 14.8 + 3 × 2.3 ≈ 21.8 (the same fact as the missing loops and cycles)', f1(chainExcess) === '21.8' && near(chainExcess, fromMissing, 1e-9), `${f2(chainExcess)} and ${f2(fromMissing)}`)
  q('Panel C, random: feed-forward loop 6 against 4.1 ± 2.1, z = 0.9; no |z| above 1', row(rnd, 'feedForward') === '6 4.1 2.1 0.9' && rnd.z.filter(Number.isFinite).every((z) => Math.abs(z) < 1), `${row(rnd, 'feedForward')}; largest ${f2(Math.max(...rnd.z.filter(Number.isFinite).map(Math.abs)))}`)
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
