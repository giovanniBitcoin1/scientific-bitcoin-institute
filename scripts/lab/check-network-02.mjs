// Self-checks for Network Lab module 02, "What are we measuring?". They run
// the same code as the page (sampling.js, thinning.js, nullmodels.js,
// friends.js, weights.js) and compare it with theory and with known values.
//
//   node scripts/lab/check-network-02.mjs
//
// Exits with code 1 if any check fails. Rerun it whenever those files, the
// presets or the stored networks change. Lines starting with INFO report the
// numbers quoted in the lecture, the "what to observe" lists and the exercises.
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mulberry32 } from '../../src/components/lab/rng.js'
import { buildCSR, connectedComponents, erdosRenyiGnm, barabasiAlbert, wattsStrogatz, degrees } from '../../src/components/lab/graphUtils.js'
import {
  TRUTHS, METHODS, csr, quickStats, fullStats, moments, triangleCounts, observeNodes, observeLinks, observeSnowball,
  observeWalk, walkEstimates, observeTrees, observeSpurious, observeMerged, biasJob, panelSample, BIAS_SEED,
} from '../../src/components/lab/network/what-are-we-measuring/sampling.js'
import { poisson, powerLaw, thin, total, mean, localExponent } from '../../src/components/lab/network/what-are-we-measuring/thinning.js'
import {
  MODEL_NETWORKS, STATISTICS, SWAPS_PER_LINK, NULL_SEED, fromData, assortativity, swapper, nullJob, summarize,
} from '../../src/components/lab/network/what-are-we-measuring/nullmodels.js'
import {
  FRIEND_NETWORKS, BETA, SENSOR_SEED, friendStats, meanDegreeAtLinkEnds, sensorJob, groupSize,
} from '../../src/components/lab/network/what-are-we-measuring/friends.js'
import { PAIRS, LABELS, atThreshold } from '../../src/components/lab/network/what-are-we-measuring/weights.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const data = (name) => JSON.parse(readFileSync(resolve(root, 'src/data/lab/networks', name), 'utf8'))

let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const info = (text) => console.log(`INFO  ${text}`)
const f2 = (x) => x.toFixed(2)
const f3 = (x) => x.toFixed(3)
const f4 = (x) => x.toFixed(4)
const net = (n, { A, B }) => ({ n, A, B })
const drain = (job) => {
  for (const _ of job.iter);
  return job.snapshot()
}
const simple = (g) => {
  const keys = new Set()
  for (let e = 0; e < g.A.length; e++) {
    if (g.A[e] === g.B[e]) return false
    const k = Math.min(g.A[e], g.B[e]) * g.n + Math.max(g.A[e], g.B[e])
    if (keys.has(k)) return false
    keys.add(k)
  }
  return true
}

// ---------------------------------------------------------------- Sampling

{
  // Random nodes at p = 0.3 on a random network: ⟨k⟩ becomes p⟨k⟩.
  const truth = net(2000, erdosRenyiGnm(2000, 8000, 11))
  const random = mulberry32(101)
  let sum = 0
  for (let s = 0; s < 200; s++) sum += quickStats(observeNodes(truth, 0.3, random)).meanDegree
  check('random nodes, p = 0.3, random network N = 2,000, ⟨k⟩ = 8, 200 samples: mean observed ⟨k⟩ = 2.4 ± 0.05', Math.abs(sum / 200 - 2.4) <= 0.05, f4(sum / 200))
}

{
  // Transitivity: unchanged by node sampling, multiplied by q by link sampling.
  const truth = net(2000, wattsStrogatz(2000, 8, 0.05, 12))
  const T = quickStats(truth).transitivity
  const random = mulberry32(102)
  let tn = 0
  let tl = 0
  const S = 200
  for (let s = 0; s < S; s++) {
    tn += quickStats(observeNodes(truth, 0.3, random)).transitivity / T
    tl += quickStats(observeLinks(truth, 0.3, random)).transitivity / T
  }
  check('small-world N = 2,000, k = 8, rewiring 0.05: transitivity ratio under random nodes at 0.3 is 1 ± 0.03', Math.abs(tn / S - 1) <= 0.03, `${f4(tn / S)}, true T ${f4(T)}`)
  check('same network: transitivity ratio under random links at 0.3 is 0.3 ± 0.02', Math.abs(tl / S - 0.3) <= 0.02, f4(tl / S))
}

{
  // Random walk: the plain average estimates ⟨k²⟩/⟨k⟩, the harmonic one ⟨k⟩.
  const truth = net(2000, barabasiAlbert(2000, 3, 13))
  const m = moments(truth)
  const w = walkEstimates(truth, 200000, mulberry32(103))
  check('random walk, 200,000 steps, scale-free N = 2,000, m = 3: plain average / (⟨k²⟩/⟨k⟩) = 1 ± 0.03', Math.abs(w.plain / m.friend - 1) <= 0.03, `${f3(w.plain)} against ${f3(m.friend)}, ratio ${f4(w.plain / m.friend)}`)
  check('same walk: harmonic estimate / ⟨k⟩ = 1 ± 0.03', Math.abs(w.harmonic / m.k1 - 1) <= 0.03, `${f3(w.harmonic)} against ${f3(m.k1)}, ratio ${f4(w.harmonic / m.k1)}`)
}

{
  // One-source tree on a connected network: exactly N − 1 links.
  let ok = true
  const seen = []
  for (const [id, make] of Object.entries(TRUTHS)) {
    const truth = make(1)
    const comp = connectedComponents(csr(truth))
    const tree = observeTrees(truth, 1, mulberry32(104))
    // In a network that is not connected, the tree spans the source's component.
    const want = tree.n - 1
    if (tree.A.length !== want || !simple(tree) || connectedComponents(csr(tree)).count !== 1) ok = false
    seen.push(`${id}: ${tree.n} nodes, ${tree.A.length} links${comp.count > 1 ? ` (${comp.count} components in the truth)` : ''}`)
  }
  const connected = net(600, barabasiAlbert(600, 3, 5))
  const tree = observeTrees(connected, 1, mulberry32(105))
  check('one-source tree on a connected network (scale-free, N = 600): exactly N − 1 = 599 links', connectedComponents(csr(connected)).count === 1 && tree.n === 600 && tree.A.length === 599)
  check('one-source tree on every preset: a tree on the nodes it reaches', ok, seen.join('; '))
  const ten = observeTrees(connected, 10, mulberry32(106))
  check('ten sources: a union of trees, more links than one tree and no more than the truth', ten.A.length > 599 && ten.A.length <= connected.A.length && simple(ten), `${ten.A.length} of ${connected.A.length} links`)
}

{
  // Sampling is percolation: giant component of a random network at p = 0.5.
  const truth = net(20000, erdosRenyiGnm(20000, 40000, 14))
  const random = mulberry32(107)
  let sum = 0
  const S = 5
  for (let s = 0; s < S; s++) sum += quickStats(observeNodes(truth, 0.5, random)).giant
  check('random network N = 20,000, ⟨k⟩ = 4, random nodes at 0.5: largest component holds 0.797 ± 0.02 of the sample', Math.abs(sum / S - 0.797) <= 0.02, f4(sum / S))
}

{
  // Spurious links and merged nodes do exactly what they say.
  let ok = true
  let okMerge = true
  const random = mulberry32(108)
  for (const make of Object.values(TRUTHS)) {
    const truth = make(2)
    for (const f of [0, 0.02, 0.1, 0.5]) {
      const o = observeSpurious(truth, f, random)
      const want = Math.round(f * truth.A.length)
      if (o.added !== want || o.A.length !== truth.A.length + want || !simple(o) || o.n !== truth.n) ok = false
    }
    for (const f of [0, 0.01, 0.05, 0.1]) {
      const o = observeMerged(truth, f, random)
      const m = Math.round(f * truth.n)
      if (o.merges !== m || o.n !== truth.n - m || !simple(o) || o.sizeOf.reduce((a, b) => a + b, 0) !== truth.n) okMerge = false
      if (o.A.length > truth.A.length) okMerge = false
    }
  }
  check('spurious links: exactly the requested number added, no self-links, no duplicates', ok)
  check('merged nodes: merging m pairs leaves N − m nodes, no self-links, no duplicates', okMerge)
}

{
  // Snowball and walk reach their quota; induced subgraphs are simple.
  const truth = TRUTHS.scaleFree(1)
  const random = mulberry32(109)
  const sb = observeSnowball(truth, 0.3, random)
  const wk = observeWalk(truth, 0.3, random)
  check('snowball and random walk at f = 0.3 on N = 600: 180 nodes each, simple subgraphs', sb.n === 180 && wk.n === 180 && simple(sb) && simple(wk), `snowball ${sb.waves} waves; walk ${wk.steps} steps`)
  const all = observeNodes(truth, 1, random)
  check('random nodes at f = 1 returns the whole network', all.n === truth.n && all.A.length === truth.A.length)
}

// ---------------------------------------------------------------- Thinning

{
  const P = poisson(8)
  const Q = thin(P, 0.25)
  const R = poisson(2)
  let worst = 0
  for (let k = 0; k < R.length; k++) worst = Math.max(worst, Math.abs(Q[k] - R[k]))
  check('thinning: Poisson(8) at p = 0.25 equals Poisson(2) to 1e-12', worst < 1e-12, `largest difference ${worst.toExponential(2)}`)

  let ok = true
  let worstSum = 0
  let worstMean = 0
  const PL = powerLaw(2.5)
  for (const [name, D] of [['poisson', P], ['power law', PL]]) {
    for (let p = 0.05; p <= 1.0001; p += 0.05) {
      const T = thin(D, p)
      const ds = Math.abs(total(T) - 1)
      const dm = Math.abs(mean(T) - p * mean(D))
      worstSum = Math.max(worstSum, ds)
      worstMean = Math.max(worstMean, dm)
      if (ds > 1e-9 || dm > 1e-9) ok = false
    }
    void name
  }
  check('thinning: every thinned distribution sums to 1 and has mean p × the true mean', ok, `worst sum error ${worstSum.toExponential(1)}, worst mean error ${worstMean.toExponential(1)}`)
  info(`power law γ = 2.5, k = 1…1,000: true mean ${f3(mean(PL))}; Poisson mean ${f3(mean(P))}`)
  for (const p of [0.5, 0.2]) {
    const T = thin(PL, p)
    info(`power law thinned at p = ${p}: mean ${f3(mean(T))}, share with no links ${f3(T[0])}, local exponent between k = 1 and 2: ${f2(localExponent(T, 1, 2))}, between 20 and 40: ${f2(localExponent(T, 20, 40))} (true: ${f2(localExponent(PL, 1, 2))} and ${f2(localExponent(PL, 20, 40))})`)
  }
}

// ---------------------------------------------------------------- Null models

const karate = fromData(data('karate-club.json'))
const florentine = fromData(data('florentine-families.json'))

{
  // Swaps keep every degree and never create a self-link or a double link.
  for (const [name, start] of [['karate club', karate], ['scale-free N = 100', MODEL_NETWORKS.scaleFree(3)]]) {
    const k0 = degrees(start.n, start.A, start.B)
    const sw = swapper(start, mulberry32(110))
    let ok = true
    let done = 0
    while (done < 10000) {
      if (!sw.attempt()) continue
      done++
      const k = degrees(sw.net.n, sw.net.A, sw.net.B)
      for (let v = 0; v < start.n; v++) if (k[v] !== k0[v]) ok = false
      if (!simple(sw.net)) ok = false
    }
    check(`swaps on the ${name}: after each of 10,000 swaps every degree is unchanged, no self-links, no double links`, ok, `${sw.attempts} attempts for 10,000 swaps (${f2((100 * 10000) / sw.attempts)}% accepted)`)
  }
}

{
  const T = STATISTICS.transitivity(karate)
  const r = assortativity(karate)
  check('karate club observed: transitivity 0.2557, assortativity −0.4756', Math.abs(T - 0.2557) < 5e-5 && Math.abs(r + 0.4756) < 5e-5, `${f4(T)}, ${f4(r)}`)
  info(`karate club: average clustering ${f4(STATISTICS.clustering(karate))}, triangles ${STATISTICS.triangles(karate)}, average distance ${f4(STATISTICS.distance(karate))}, density ${f4(78 / 561)}`)
  info(`Florentine families: transitivity ${f4(STATISTICS.transitivity(florentine))}, average clustering ${f4(STATISTICS.clustering(florentine))}, assortativity ${f4(assortativity(florentine))}, triangles ${STATISTICS.triangles(florentine)}, average distance ${f4(STATISTICS.distance(florentine))}`)

  const M = (34 * 33) / 2
  const gnm = drain(nullJob(karate, 'transitivity', 'gnm', 2000, 201))
  check('same-N-and-L null on the karate club, 2,000 samples: mean transitivity 0.136 ± 0.005, that is (L − 2)/(M − 2) with M = 561', M === 561 && Math.abs(gnm.mean - 0.136) <= 0.005 && Math.abs((78 - 2) / (M - 2) - 0.136) < 5e-4, `mean ${f4(gnm.mean)}, sd ${f4(gnm.sd)}, z ${f2(gnm.z)}, at least as extreme ${f4(gnm.extreme)}; (L − 2)/(M − 2) = ${f4(76 / 559)}`)

  for (const [statId, label] of [['transitivity', 'transitivity'], ['assortativity', 'assortativity'], ['clustering', 'average clustering'], ['distance', 'average distance'], ['triangles', 'triangles']]) {
    for (const nullId of ['gnm', 'degrees']) {
      const s = drain(nullJob(karate, statId, nullId, 2000, 202))
      info(`karate club, ${label}, ${nullId === 'gnm' ? 'same N and L' : 'same degrees'} (2,000 samples): observed ${f4(s.observed)}, null mean ${f4(s.mean)}, sd ${f4(s.sd)}, z ${f2(s.z)}, at least as extreme ${f4(s.extreme)}${nullId === 'degrees' ? `, swaps accepted ${f2((100 * s.accepted) / s.attempted)}%` : ''}`)
    }
  }
  const deg = drain(nullJob(karate, 'transitivity', 'degrees', 2000, 202))
  const degA = drain(nullJob(karate, 'assortativity', 'degrees', 2000, 202))
  check('same-degrees null on the karate club: 2,000 samples, 20 L attempted swaps each', deg.samples === 2000 && deg.attempted === 2000 * SWAPS_PER_LINK * 78 && Number.isFinite(deg.z) && Number.isFinite(degA.z), `transitivity mean ${f4(deg.mean)}, sd ${f4(deg.sd)}, z ${f2(deg.z)}; assortativity mean ${f4(degA.mean)}, sd ${f4(degA.sd)}, z ${f2(degA.z)}`)
  check('summarize: z-score and tail share on a known sample', (() => {
    const s = summarize([1, 2, 3, 4, 5], 5)
    return Math.abs(s.mean - 3) < 1e-12 && Math.abs(s.sd - Math.sqrt(2.5)) < 1e-12 && Math.abs(s.z - 2 / Math.sqrt(2.5)) < 1e-12 && s.extreme === 0.2
  })())

  for (const [id, make] of Object.entries(MODEL_NETWORKS)) {
    const g = make(1)
    const line = []
    for (const statId of ['transitivity', 'assortativity', 'distance']) {
      for (const nullId of ['gnm', 'degrees']) {
        const s = drain(nullJob(g, statId, nullId, 200, 203))
        line.push(`${statId}/${nullId}: obs ${f3(s.observed)}, null ${f3(s.mean)} ± ${f3(s.sd)}, z ${f2(s.z)}`)
      }
    }
    info(`panel B preset ${id} (N = ${g.n}, L = ${g.A.length}, 200 samples): ${line.join('; ')}`)
  }
  for (const statId of ['transitivity', 'assortativity', 'distance', 'triangles']) {
    const line = []
    for (const nullId of ['gnm', 'degrees']) {
      const s = drain(nullJob(florentine, statId, nullId, 2000, 204))
      line.push(`${nullId}: null ${f3(s.mean)} ± ${f3(s.sd)}, z ${f2(s.z)}, extreme ${f3(s.extreme)}`)
    }
    info(`Florentine families, ${statId} (observed ${f4(STATISTICS[statId](florentine))}): ${line.join('; ')}`)
  }
}

// ---------------------------------------------------------------- Friendship paradox

{
  const nets = {
    'random N = 1,000': FRIEND_NETWORKS.random(1),
    'scale-free N = 1,000': FRIEND_NETWORKS.scaleFree(1),
    'ring lattice': FRIEND_NETWORKS.ring(),
    'karate club': karate,
    'observer: random': TRUTHS.random(1),
    'observer: scale-free': TRUTHS.scaleFree(1),
    'observer: small-world': TRUTHS.smallWorld(1),
    'observer: dense': TRUTHS.dense(1),
  }
  let ok = true
  for (const [name, g] of Object.entries(nets)) {
    const s = friendStats(g)
    const direct = meanDegreeAtLinkEnds(g)
    let viaDist = 0
    for (let k = 0; k < s.friendDist.length; k++) viaDist += k * s.friendDist[k]
    if (Math.abs(direct - s.friendMean) > 1e-9 || Math.abs(viaDist - s.friendMean) > 1e-9 || s.friendMean < s.meanDegree - 1e-12) ok = false
    info(`${name}: ⟨k⟩ ${f3(s.meanDegree)}, ⟨k²⟩/⟨k⟩ ${f3(s.friendMean)}, largest degree ${s.maxDegree}, fewer links than their friends' average: ${s.fewer} of ${s.n} (${f3(s.fewerShare)}), more: ${s.more}; p_c = ${f3(moments(g).pc)}`)
  }
  check('mean degree at the end of a random link equals ⟨k²⟩/⟨k⟩ on every preset', ok)
  const k = friendStats(karate)
  check('karate club: mean degree at the end of a random link 7.769 = 1212/156', Math.abs(k.friendMean - 1212 / 156) < 1e-9 && Math.abs(k.friendMean - 7.769) < 5e-4, f4(k.friendMean))
  const ring = friendStats(FRIEND_NETWORKS.ring())
  check('ring lattice: mean degree at the end of a random link equals ⟨k⟩ = 6, nobody has fewer links than their friends', ring.friendMean === 6 && ring.meanDegree === 6 && ring.fewer === 0)
  const big = net(20000, erdosRenyiGnm(20000, 60000, 15))
  check('random network N = 20,000, ⟨k⟩ = 6: mean degree at the end of a random link 7 ± 0.05', Math.abs(meanDegreeAtLinkEnds(big) - 7) <= 0.05, f4(meanDegreeAtLinkEnds(big)))

  // Exercise 2: hub A linked to B, C, d, e; B–f; C–g.
  const ex = { n: 7, A: Int32Array.from([0, 0, 0, 0, 1, 2]), B: Int32Array.from([1, 2, 3, 4, 5, 6]) }
  const e = friendStats(ex)
  check('Exercise 2: ⟨k⟩ = 12/7, friend mean 28/12, six of seven have fewer links than their neighbours on average', Math.abs(e.meanDegree - 12 / 7) < 1e-12 && Math.abs(e.friendMean - 28 / 12) < 1e-12 && e.fewer === 6, `${f2(e.meanDegree)}, ${f2(e.friendMean)}, ${e.fewer}`)
}

{
  // Early warning: friends of random nodes are infected earlier.
  for (const [name, g, must] of [
    ['scale-free preset', FRIEND_NETWORKS.scaleFree(1), true],
    ['random preset', FRIEND_NETWORKS.random(1), false],
    ['ring lattice', FRIEND_NETWORKS.ring(), false],
    ['karate club', karate, false],
  ]) {
    const s = drain(sensorJob(g, 301))
    const text = `groups of ${s.size}, β = ${BETA}, ${s.runs} runs: friends ahead in ${f3(s.aheadShare)}, behind in ${f3(s.behindShare)}; average lead ${f2(s.meanLead)} steps (from the average curves ${f2(s.curveLead)}); random group reaches 50% at step ${f2(s.meanLead + 0) === 'NaN' ? '–' : ''}${f2(crossingOf(s.randoms))}, everyone at 50% at ${f2(crossingOf(s.all))}`
    if (must) check(`early warning on the ${name}: the friends lead in at least 95% of 200 runs`, s.aheadShare >= 0.95, text)
    else info(`early warning on the ${name}: ${text}`)
  }
  check('group size: 100 on the large presets, smaller on the karate club', groupSize(1000) === 100 && groupSize(34) === 9, `karate ${groupSize(34)}`)
}

function crossingOf(curve) {
  for (let t = 1; t < curve.length; t++) if (curve[t] >= 0.5) return t - 1 + (0.5 - curve[t - 1]) / (curve[t] - curve[t - 1])
  return NaN
}

// ---------------------------------------------------------------- Observer presets and exercises

{
  for (const [id, make] of Object.entries(TRUTHS)) {
    const s = fullStats(make(1))
    const m = moments(make(1))
    info(`observer truth ${id}: N ${s.n}, L ${s.L}, ⟨k⟩ ${f2(s.meanDegree)}, transitivity ${f4(s.transitivity)}, largest component ${f3(s.giant)}, average distance ${f3(s.avgDistance)}, largest degree ${s.maxDegree}, ⟨k²⟩ ${f2(m.k2)}, p_c ${f3(m.pc)}`)
  }
  // Exercise 4: where the largest component falls apart under random nodes.
  for (const id of ['random', 'scaleFree']) {
    const b = drain(biasJob(TRUTHS[id](1), 'nodes', 401))
    info(`bias curve, ${id}, random nodes, largest-component share of the sample (30 runs): ${b.points.map((p) => `${p.x}: ${f2(p.giant * b.truth.giant)}`).join(', ')}`)
  }
  // Exercise 5: dense preset, directions from one source.
  const dense = TRUTHS.dense(1)
  const t1 = fullStats(observeTrees(dense, 1, mulberry32(402)))
  check('Exercise 5: dense preset, one source: ⟨k⟩ = 2(N − 1)/N = 1.997', t1.L === 599 && Math.abs(t1.meanDegree - (2 * 599) / 600) < 1e-12, `observed ⟨k⟩ ${f3(t1.meanDegree)}, true 20; largest degree ${t1.maxDegree}`)
  for (const id of Object.keys(TRUTHS)) {
    const b = drain(biasJob(TRUTHS[id](1), 'trees', 403))
    info(`bias curve, ${id}, directions from s sources, observed/true ⟨k⟩: ${b.points.map((p) => `${p.x}: ${f2(p.meanDegree)}`).join(', ')}; transitivity ratio at 1, 5, 10: ${[0, 4, 9].map((i) => f2(b.points[i].transitivity)).join(', ')}`)
  }
  for (const methodId of ['nodes', 'links', 'snowball', 'walk', 'spurious', 'merged']) {
    for (const id of ['random', 'scaleFree', 'smallWorld']) {
      const b = drain(biasJob(TRUTHS[id](1), methodId, 404))
      const at = (x) => b.points.find((p) => Math.abs(p.x - x) < 1e-9)
      const xs = methodId === 'spurious' ? [0.1, 0.5] : methodId === 'merged' ? [0.05, 0.1] : [0.1, 0.3, 0.5]
      info(`bias, ${id}, ${methodId}: ${xs.map((x) => `x = ${x}: ⟨k⟩ ${f2(at(x).meanDegree)}, T ${f2(at(x).transitivity)}, giant ${f2(at(x).giant)}`).join(' | ')}`)
    }
  }
  // Exact lines of the bias curves.
  const b = drain(biasJob(TRUTHS.smallWorld(1), 'nodes', 405))
  const bl = drain(biasJob(TRUTHS.smallWorld(1), 'links', 405))
  // 30 pooled samples of a 600-node network are noisy at small f: the
  // tolerance on the transitivity of a node sample applies from f = 0.2.
  let ok = true
  let worst = [0, 0, 0, 0]
  for (const p of b.points) {
    worst[0] = Math.max(worst[0], Math.abs(p.meanDegree - METHODS.nodes.exact(p.x).meanDegree))
    if (p.x >= 0.2) worst[1] = Math.max(worst[1], Math.abs(p.transitivity - 1))
  }
  for (const p of bl.points) {
    worst[2] = Math.max(worst[2], Math.abs(p.meanDegree - p.x))
    worst[3] = Math.max(worst[3], Math.abs(p.transitivity - p.x))
  }
  if (worst[0] > 0.03 || worst[1] > 0.1 || worst[2] > 0.03 || worst[3] > 0.05) ok = false
  check('bias curves on the small-world preset follow the exact lines (random nodes: f and 1; random links: f and f)', ok, `largest gaps: nodes ⟨k⟩ ${f3(worst[0])}, nodes T (f ≥ 0.2) ${f3(worst[1])}, links ⟨k⟩ ${f3(worst[2])}, links T ${f3(worst[3])}`)

  // Distances: spurious links shorten them sharply, missing links barely lengthen them.
  const sw = TRUTHS.smallWorld(1)
  const d0 = fullStats(sw).avgDistance
  const random = mulberry32(406)
  const extra = fullStats(observeSpurious(sw, 0.02, random))
  const extra10 = fullStats(observeSpurious(sw, 0.1, random))
  const fewer = fullStats(observeLinks(sw, 0.98, random))
  const fewer10 = fullStats(observeLinks(sw, 0.9, random))
  info(`small-world preset: average distance ${f2(d0)}; with 2% spurious links ${f2(extra.avgDistance)} (L ${extra.L}); with 10% ${f2(extra10.avgDistance)}; with 2% of the links missing ${f2(fewer.avgDistance)} (L ${fewer.L}, largest ${fewer.largest}); with 10% missing ${f2(fewer10.avgDistance)} (largest ${fewer10.largest})`)
  check('small-world preset: 2% spurious links shorten distances more than 2% missing links lengthen them', d0 - extra.avgDistance > fewer.avgDistance - d0 && extra.avgDistance < d0)

  // Merged nodes create false hubs.
  const sf = TRUTHS.random(1)
  const mg = fullStats(observeMerged(sf, 0.1, mulberry32(407)))
  info(`random preset, 10% of nodes merged: N ${mg.n}, ⟨k⟩ ${f2(mg.meanDegree)} (true ${f2(fullStats(sf).meanDegree)}), largest degree ${mg.maxDegree} (true ${fullStats(sf).maxDegree}), average distance ${f2(mg.avgDistance)} (true ${f2(fullStats(sf).avgDistance)})`)
}

// ---------------------------------------------------------------- Numbers quoted on the page
// The "what to observe" lists and the exercises (texts.js) quote what the
// panels show with their default seeds. If one of these fails, the texts
// must be updated.

{
  const P = (truthId, methodId, x) => {
    const o = panelSample(truthId, methodId, x)
    return { o, s: fullStats(o) }
  }
  const near = (v, want, tol) => Math.abs(v - want) <= tol
  const quoted = []
  const q = (name, cond, detail) => quoted.push([name, cond, detail])

  let a = P('smallWorld', 'nodes', 0.3).s
  let b = P('smallWorld', 'links', 0.3).s
  q('observer 1: small-world, f = 0.3: nodes ⟨k⟩ 1.7 and T 0.48, links T 0.14', near(a.meanDegree, 1.67, 0.005) && near(a.transitivity, 0.481, 0.001) && near(b.transitivity, 0.138, 0.001), `${f2(a.meanDegree)}, ${f3(a.transitivity)}, ${f3(b.transitivity)}`)
  // Observer 2 quotes the 30-sample averages of the bias curve where the
  // point is the threshold, and single samples (the Observed column, first
  // sample and the next five presses of "New sample") only to show how far
  // one sample can be from the average.
  {
    const bj = drain(biasJob(TRUTHS.random(1), 'nodes', BIAS_SEED))
    const avg = [0.5, 0.3, 0.2, 0.15].map((x) => bj.points.find((p) => Math.abs(p.x - x) < 1e-9).giant * bj.truth.giant)
    q('observer 2: random truth, bias curve (30 samples): largest component 95%, 71%, 28%, 15% at f = 0.5, 0.3, 0.2, 0.15', near(avg[0], 0.95, 0.006) && near(avg[1], 0.71, 0.006) && near(avg[2], 0.28, 0.006) && near(avg[3], 0.15, 0.006), avg.map(f3).join(', '))
    const singles = [0, 1, 2, 3, 4, 5].map((nonce) => fullStats(panelSample('random', 'nodes', 0.2, nonce)).giant)
    const want = [0.55, 0.19, 0.25, 0.1, 0.08, 0.33]
    q('observer 2: random truth, f = 0.2, single samples: 55%, then 19%, 25%, 10%, 8%, 33%', singles.every((v, i) => near(v, want[i], 0.005)), singles.map(f3).join(', '))
    // Theory for an infinite random network: S = 1 − exp(−f⟨k⟩S).
    const theory = (c) => {
      let s = c > 1 ? 0.5 : 0
      for (let i = 0; i < 5000; i++) s = 1 - Math.exp(-c * s)
      return s
    }
    const th = [0.5, 0.3, 0.2, 0.15].map((x) => theory(6 * x))
    q('observer 2 and Exercise 4: theory 94%, 73%, 31% and 0 at f = 0.5, 0.3, 0.2, 0.15', near(th[0], 0.94, 0.005) && near(th[1], 0.73, 0.005) && near(th[2], 0.31, 0.005) && th[3] < 1e-6, th.map(f3).join(', '))
    // Spread of a single sample at f = 0.2: 2,000 samples.
    const random = mulberry32(1199)
    const v = Array.from({ length: 2000 }, () => quickStats(observeNodes(TRUTHS.random(1), 0.2, random)).giant).sort((x, y) => x - y)
    const mean = v.reduce((x, y) => x + y, 0) / v.length
    q('Exercise 4: random truth, f = 0.2, 2,000 single samples: mean close to 0.31, 5th and 95th percentile 10% and 59%', near(mean, 0.31, 0.02) && near(v[100], 0.1, 0.01) && near(v[1900], 0.59, 0.015), `mean ${f3(mean)}, percentiles ${f3(v[100])} and ${f3(v[1900])}, range ${f3(v[0])} to ${f3(v[1999])}`)
  }
  a = P('dense', 'trees', 1).s
  b = P('dense', 'trees', 10).s
  const src = P('dense', 'trees', 1).o.sources[0]
  const trueDeg = fullStats(TRUTHS.dense(1)).degree[src]
  q('observer 3 and Exercise 5: dense truth, one source: 599 links, ⟨k⟩ 2.00, no triangle, the source keeps its 21 links, largest degree 26, 497 nodes with one link; ten sources: 3,984 links', a.L === 599 && a.triangles === 0 && b.L === 3984 && trueDeg === 21 && a.degree[src] === 21 && a.maxDegree === 26 && a.histogram[1] === 497, `${a.L}, ${f2(a.meanDegree)}, ${a.triangles}, source degree ${trueDeg}, largest ${a.maxDegree}; ${b.L}`)
  const w = P('scaleFree', 'walk', 0.3).o
  a = P('scaleFree', 'snowball', 0.3).s
  b = P('scaleFree', 'nodes', 0.3).s
  q('observer 4: scale-free, walk at 0.3: plain 14.4, weighted 6.2; snowball finds degree 71; random nodes at most 27', near(w.plain, 14.37, 0.01) && near(w.harmonic, 6.15, 0.01) && a.maxDegree === 71 && b.maxDegree === 27, `${f2(w.plain)}, ${f2(w.harmonic)}, ${a.maxDegree}, ${b.maxDegree}`)
  const d = [P('smallWorld', 'spurious', 0.02).s.avgDistance, P('smallWorld', 'spurious', 0.1).s.avgDistance, P('smallWorld', 'links', 0.9).s.avgDistance]
  q('observer 5: small-world, distance 6.7 → 6.0 (2% spurious), 4.7 (10%), 7.3 (10% missing)', near(d[0], 6.0, 0.05) && near(d[1], 4.74, 0.05) && near(d[2], 7.25, 0.05), d.map(f2).join(', '))
  a = P('smallWorld', 'merged', 0.05).s
  q('observer 6: small-world, 5% merged: largest degree 18, distance 5.5', a.maxDegree === 18 && near(a.avgDistance, 5.53, 0.05), `${a.maxDegree}, ${f2(a.avgDistance)}`)

  const bias = (id) => drain(biasJob(TRUTHS[id](1), 'nodes', BIAS_SEED))
  const share = (bj, x) => bj.points.find((p) => Math.abs(p.x - x) < 1e-9).giant * bj.truth.giant
  const br = bias('random')
  const bs = bias('scaleFree')
  q('Exercise 4: random truth 71%, 53%, 28%, 15% at f = 0.3, 0.25, 0.2, 0.15; scale-free 38% at 0.2 and 26% at 0.15', near(share(br, 0.3), 0.71, 0.006) && near(share(br, 0.25), 0.53, 0.006) && near(share(br, 0.2), 0.28, 0.006) && near(share(br, 0.15), 0.15, 0.006) && near(share(bs, 0.2), 0.38, 0.006) && near(share(bs, 0.15), 0.26, 0.006), `${[0.3, 0.25, 0.2, 0.15].map((x) => f2(share(br, x))).join(', ')}; ${f2(share(bs, 0.2))}, ${f2(share(bs, 0.15))}`)

  const nj = (net, statId, nullId, m = 200) => drain(nullJob(net, statId, nullId, m, NULL_SEED))
  let n1 = nj(karate, 'transitivity', 'gnm')
  let n2 = nj(karate, 'transitivity', 'degrees')
  q('null 1: karate transitivity, 200 samples: z 4.3 then 1.3, null means 0.135 and 0.22, about one in ten as extreme', near(n1.z, 4.27, 0.05) && near(n2.z, 1.34, 0.05) && near(n1.mean, 0.135, 0.002) && near(n2.mean, 0.222, 0.003) && near(n2.extreme, 0.095, 0.01), `${f2(n1.z)}, ${f2(n2.z)}, ${f3(n1.mean)}, ${f3(n2.mean)}, ${f3(n2.extreme)}`)
  n1 = nj(karate, 'clustering', 'gnm')
  n2 = nj(karate, 'clustering', 'degrees')
  q('null 2: karate average clustering: z about 12.6 and about 4', near(n1.z, 12.6, 0.1) && near(n2.z, 4.0, 0.1), `${f2(n1.z)}, ${f2(n2.z)}`)
  n1 = nj(karate, 'assortativity', 'gnm')
  n2 = nj(karate, 'assortativity', 'degrees')
  q('null 3: karate assortativity: null means −0.06 and −0.31, z −3.6 with the same degrees', near(n1.mean, -0.06, 0.005) && near(n2.mean, -0.307, 0.005) && near(n2.z, -3.6, 0.05), `${f3(n1.mean)}, ${f3(n2.mean)}, ${f2(n2.z)}`)
  const stats5 = ['transitivity', 'clustering', 'assortativity', 'distance', 'triangles']
  const zs = (net) => stats5.flatMap((st) => ['gnm', 'degrees'].map((nu) => nj(net, st, nu).z))
  const sw = MODEL_NETWORKS.smallWorld(1)
  n1 = nj(sw, 'transitivity', 'gnm')
  n2 = nj(sw, 'distance', 'gnm')
  const zr = zs(MODEL_NETWORKS.random(1))
  q('null 4: small-world transitivity z about 29, distance 4.9 against 3.4 (z about 27); random preset: every z between −1.4 and 0.7', near(n1.z, 28.8, 0.5) && near(n2.observed, 4.94, 0.01) && near(n2.mean, 3.4, 0.01) && near(n2.z, 26.9, 0.5) && Math.min(...zr) >= -1.4 && Math.max(...zr) <= 0.7, `${f2(n1.z)}, ${f2(n2.z)}; random z from ${f2(Math.min(...zr))} to ${f2(Math.max(...zr))}`)
  const sf = MODEL_NETWORKS.scaleFree(1)
  n1 = nj(sf, 'distance', 'gnm')
  n2 = nj(sf, 'distance', 'degrees')
  q('null 5: scale-free distance 3.0 against 3.4, z about −7, and about −2 with the same degrees', near(n1.observed, 3.0, 0.01) && near(n1.mean, 3.43, 0.01) && near(n1.z, -7.3, 0.1) && near(n2.z, -2.15, 0.1), `${f2(n1.z)}, ${f2(n2.z)}`)
  const zf = zs(florentine).map(Math.abs)
  q('null 6: Florentine families: no |z| reaches 1.5', Math.max(...zf) < 1.5, `largest ${f2(Math.max(...zf))}`)
  n1 = nj(karate, 'transitivity', 'gnm', 2000)
  n2 = nj(karate, 'transitivity', 'degrees', 2000)
  const n3 = nj(karate, 'assortativity', 'degrees', 2000)
  q('null 8 and Exercise 6: 2,000 samples: z 4.0 (0 samples as high); same degrees mean 0.224, sd 0.026, z 1.2, 13% as high; assortativity mean −0.30, sd 0.05, z −3.6', near(n1.z, 3.98, 0.05) && n1.extreme === 0 && near(n2.mean, 0.224, 0.001) && near(n2.sd, 0.026, 0.001) && near(n2.z, 1.23, 0.05) && near(n2.extreme, 0.128, 0.005) && near(n3.mean, -0.302, 0.003) && near(n3.sd, 0.048, 0.003) && near(n3.z, -3.58, 0.05), `${f2(n1.z)}; ${f3(n2.mean)}, ${f3(n2.sd)}, ${f2(n2.z)}, ${f3(n2.extreme)}; ${f3(n3.mean)}, ${f3(n3.sd)}, ${f2(n3.z)}`)

  const fs = { scaleFree: friendStats(FRIEND_NETWORKS.scaleFree(1)), random: friendStats(FRIEND_NETWORKS.random(1)), karate: friendStats(karate) }
  q('friends 1, 2, 4: 6.0 against 15.1 with 903 of 1,000; 6.0 against 7.0 with 66%; 4.6 against 7.8 with 29 of 34', near(fs.scaleFree.friendMean, 15.13, 0.01) && fs.scaleFree.fewer === 903 && near(fs.random.friendMean, 6.97, 0.01) && near(fs.random.fewerShare, 0.661, 0.001) && near(fs.karate.meanDegree, 4.59, 0.01) && fs.karate.fewer === 29)
  const tail = (D, k0) => Array.from(D).slice(k0).reduce((x, y) => x + y, 0)
  q('friends 1: scale-free: 2.4% of the nodes and 17% of the friends have 20 links or more', near(tail(fs.scaleFree.nodeDist, 20), 0.024, 0.0005) && near(tail(fs.scaleFree.friendDist, 20), 0.17, 0.005), `${f3(tail(fs.scaleFree.nodeDist, 20))}, ${f3(tail(fs.scaleFree.friendDist, 20))}`)
  const sj = (net) => drain(sensorJob(net, SENSOR_SEED))
  const cross = (c) => crossingOf(c)
  const s1 = sj(FRIEND_NETWORKS.scaleFree(1))
  const s2 = sj(FRIEND_NETWORKS.random(1))
  const s3 = sj(FRIEND_NETWORKS.ring())
  const s4 = sj(karate)
  q('friends 5: scale-free: half infected at steps 22.1 and 24.1, lead 1.9, ahead in 96%; random: lead 0.7, ahead in 71%', near(cross(s1.friends), 22.1, 0.05) && near(cross(s1.randoms), 24.1, 0.05) && near(s1.meanLead, 1.93, 0.02) && near(s1.aheadShare, 0.96, 0.005) && near(s2.meanLead, 0.66, 0.02) && near(s2.aheadShare, 0.71, 0.005), `${f2(cross(s1.friends))}, ${f2(cross(s1.randoms))}, ${f2(s1.meanLead)}, ${f3(s1.aheadShare)}; ${f2(s2.meanLead)}, ${f3(s2.aheadShare)}`)
  q('friends 3 and 6: ring lattice: friends ahead in about half of the runs; karate club: groups of 9, ahead in 71%', near(s3.aheadShare, 0.5, 0.05) && s4.size === 9 && near(s4.aheadShare, 0.71, 0.005), `${f3(s3.aheadShare)}; ${f3(s4.aheadShare)}`)

  for (const [name, cond, detail] of quoted) check(`quoted on the page — ${name}`, cond, detail)
}

// ---------------------------------------------------------------- Figure "Where do you draw the line?"

{
  const rows = []
  for (let t = 1; t <= 10; t++) {
    const s = atThreshold(t)
    rows.push(`${t}: L ${s.L}, density ${f2(s.density)}, components ${s.components}`)
  }
  info(`threshold figure: ${rows.join(' | ')}`)
  const keys = new Set(PAIRS.map((p) => `${Math.min(p[0], p[1])}-${Math.max(p[0], p[1])}`))
  check('threshold figure: 10 nodes, 22 weighted pairs, no pair listed twice', LABELS.length === 10 && PAIRS.length === 22 && keys.size === 22 && PAIRS.every((p) => p[0] !== p[1] && p[2] >= 1 && p[2] <= 10))
  check('threshold figure: one component at threshold 1, two groups at 4, links only fall as the threshold rises', atThreshold(1).components === 1 && atThreshold(4).components === 2 && atThreshold(4).largest === 5 && Array.from({ length: 9 }, (_, i) => atThreshold(i + 2).L <= atThreshold(i + 1).L).every(Boolean))
}

// ---------------------------------------------------------------- Exercises on paper

{
  // Exercise 1: ⟨k⟩ = 8, T = 0.30; a quarter of the nodes, a quarter of the links.
  check('Exercise 1: (a) 2 and 0.30, (b) 2 and 0.075', METHODS.nodes.exact(0.25).meanDegree * 8 === 2 && METHODS.nodes.exact(0.25).transitivity * 0.3 === 0.3 && METHODS.links.exact(0.25).meanDegree * 8 === 2 && Math.abs(METHODS.links.exact(0.25).transitivity * 0.3 - 0.075) < 1e-12)
  // Exercise 4: thresholds from the moments.
  const r = moments(TRUTHS.random(1))
  const s = moments(TRUTHS.scaleFree(1))
  check('Exercise 4: p_c of the random preset is close to 1/6, and the scale-free preset has a lower one', Math.abs(r.pc - 1 / 6) < 0.01 && s.pc < r.pc, `random ${f3(r.pc)} (1/⟨k⟩ = ${f3(1 / r.k1)}), scale-free ${f3(s.pc)} with ⟨k⟩ ${f2(s.k1)}, ⟨k²⟩ ${f2(s.k2)}`)
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
