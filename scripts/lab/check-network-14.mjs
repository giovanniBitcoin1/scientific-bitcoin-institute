// Self-checks for Network Lab module 14, "Capstone: a real network". They run
// the same code as the page (capstone.js, loader.js, precompute.js) on the
// data file, compare it with direct recomputation and with the values
// expected in the prompt (computed there with networkx), and pin every number
// quoted in the lecture, the "what to observe" lists and the exercises.
//
//   node scripts/lab/check-network-14.mjs [section]
//
// Sections: build, precomputed, measures, null, communities, stress, spread,
// loader, small, page. Exits with code 1 if any check fails. Lines starting
// with INFO report the numbers; checks starting "quoted on the page" pin them.
// Run it whole: the section "page" uses the numbers of the others. It takes
// about a minute and a half (the null model with ten other seeds).
import { readFileSync, existsSync } from 'node:fs'
import * as C from '../../src/components/lab/network/capstone-a-real-network/capstone.js'
import { precompute, serialisePre, LOUVAIN_RUNS } from '../../src/components/lab/network/capstone-a-real-network/precompute.js'
import { parseEdgeList, parseLnd, readNetwork } from '../../src/components/lab/network/capstone-a-real-network/loader.js'
import { observe, exercises } from '../../src/components/lab/network/capstone-a-real-network/texts.js'
import { buildData, serialise, rawFiles, RAW_FILES } from './build-network-14.mjs'
import { betweenness as brandes03, undirected, closeness as closeness03 } from '../../src/components/lab/network/centrality/centrality.js'
import { averagePathLength, buildCSR } from '../../src/components/lab/graphUtils.js'
import { modularity } from '../../src/components/lab/network/communities/community.js'

const only = process.argv[2]
const section = (name) => !only || only === name
let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const info = (text) => console.log(`INFO  ${text}`)
const f2 = (x) => x.toFixed(2)
const f3 = (x) => x.toFixed(3)
const f4 = (x) => x.toFixed(4)
const near = (v, want, tol) => Math.abs(v - want) <= tol
const root = new URL('../../', import.meta.url)
const read = (p) => readFileSync(new URL(p, root), 'utf8')
const lf = (s) => s.replace(/\r\n/g, '\n')
const en = (v, d) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) // as the page formats

const dataText = read('src/data/lab/networks/airports-2014.json')
const data = JSON.parse(dataText)
const preText = read('src/data/lab/precomputed/network-14-airports.json')
const pre = JSON.parse(preText)
const whole = C.airportsNet(data)
const G = C.giantOf(whole)
const at = (code) => G.names.indexOf(code)
const name = (v) => G.names[v]
const R = {} // numbers kept for the section "page"

// ---------------------------------------------------------------- build

if (section('build')) {
  const c = data.counts
  check('data file: 3,214 airports and 18,858 links, 810 of them flown in one direction only', whole.n === 3214 && whole.A.length === 18858 && c.oneWay === 810, `${whole.n} ${whole.A.length} ${c.oneWay}`)
  check('data file: 892 of 67,663 route rows dropped; 19 airports named by their ICAO code; 29 without a region', c.droppedRows === 892 && c.routeRows === 67663 && c.icaoCodes === 19 && c.noRegion === 29 && data.nodes.region.filter((r) => r < 0).length === 29, JSON.stringify(c))
  check('data file: nine regions, the ones of the prompt', [...data.regions].sort().join(' ') === 'Africa America Arctic Asia Atlantic Australia Europe Indian Pacific')
  check('data file: 7 components of 3,188, 10, 4, 4, 4, 2 and 2 airports; the largest has 18,833 links', G.whole.sizes.join(' ') === '3188 10 4 4 4 2 2' && G.A.length === 18833, G.whole.sizes.join(' '))
  const seen = new Set()
  let simple = true
  for (let e = 0; e < whole.A.length; e++) {
    const a = whole.A[e]
    const b = whole.B[e]
    if (a === b || seen.has(a * 4000 + b) || seen.has(b * 4000 + a)) simple = false
    seen.add(a * 4000 + b)
  }
  check('data file: no self-link, no repeated link, weights whole numbers of at least 1, coordinates with two decimals', simple && whole.w.every((w) => w >= 1 && Number.isInteger(w)) && data.nodes.lat.every((x) => Math.abs(x * 100 - Math.round(x * 100)) < 1e-6))
  const k5613 = data.nodes.id.indexOf(5613)
  check('data file: airport 5613 is kept as it is — code KSLI, name of Los Alamitos, city Solwesi, Zambia, in America/…', data.nodes.code[k5613] === 'KSLI' && data.nodes.name[k5613] === 'Los Alamitos Army Air Field' && data.nodes.city[k5613] === 'Solwesi' && data.countries[data.nodes.country[k5613]] === 'Zambia' && data.regions[data.nodes.region[k5613]] === 'America')
  check('data file: Istanbul\'s old airport appears as ISL', data.nodes.city[data.nodes.code.indexOf('ISL')] === 'Istanbul')
  check('data file: the notice and the two hashes of the prompt', data.notice === 'Contains information from the OpenFlights Airports and Routes Databases, which are made available under the Open Database License (ODbL) v1.0 (https://opendatacommons.org/licenses/odbl/1-0/). This derived file is made available under the same licence.' && data.sha256['airports.dat'] === '9387cdb38df5bd664da823f8ccb69fdd9b33a1888f5b7cca09c34a3cd9ff59f9' && data.sha256['routes.dat'] === 'bd373706238134f619c624c606dccc74c05c2582a977c489c81de501735f2390')
  check('notice file beside the data, with the same sentence', lf(read('src/data/lab/networks/airports-2014.NOTICE.txt')).includes(data.notice))
  const meta = JSON.parse(read('src/data/lab/networks/networks.meta.json')).files['airports-2014.json']
  check('networks.meta.json: source, URL, date of download, hashes, licence and build rules', !!meta && meta.url === 'https://openflights.org/data' && meta.retrieved === '2026-11-24' && meta.sha256['routes.dat'] === data.sha256['routes.dat'] && /Open Database License/.test(meta.licence) && meta.build.length > 200)
  info(`size of the data file: ${(Buffer.byteLength(dataText) / 1024).toFixed(0)} kB; of the precomputed file: ${(Buffer.byteLength(preText) / 1024).toFixed(0)} kB`)
  const raw = await rawFiles({ download: false })
  if (raw) {
    for (const f of RAW_FILES) info(`${f}: sha256 ${raw[f].sha256}, ${raw[f].lines} lines`)
    check('raw files in the cache: the hashes and line counts of the prompt (7,698 and 67,663 lines)', raw['airports.dat'].sha256 === data.sha256['airports.dat'] && raw['routes.dat'].sha256 === data.sha256['routes.dat'] && raw['airports.dat'].lines === 7698 && raw['routes.dat'].lines === 67663)
    const built = buildData(raw['airports.dat'].text, raw['routes.dat'].text)
    check('the build, run again on the raw files, gives the data file byte for byte (line ends aside)', serialise(built, raw) === lf(dataText))
  } else info('raw files not in scripts/lab/network-14-cache.local/: the build was not repeated (run node scripts/lab/build-network-14.mjs data)')
  check('the raw files are not in the repository (the cache folder is git-ignored by *.local)', !existsSync(new URL('src/data/lab/networks/airports.dat', root)) && !existsSync(new URL('src/data/lab/networks/routes.dat', root)))
}

// ---------------------------------------------------------------- precomputed

let fresh = null
if (section('precomputed') || section('page')) {
  const t0 = performance.now()
  fresh = precompute(data)
  info(`precompute: ${((performance.now() - t0) / 1000).toFixed(1)} s`)
  check('the precomputed file is what the code gives now (same text, line ends aside)', serialisePre(fresh) === lf(preText))
}

// ---------------------------------------------------------------- measures

if (section('measures') || section('page')) {
  const d = C.drain(C.degreeJob(G))
  R.degrees = d
  info(`degrees: ⟨k⟩ ${d.mean.toFixed(3)}, ⟨k²⟩ ${f2(d.mean2)}, median ${d.median}, ${f3(d.ones)} with one route, maximum ${d.max}`)
  check('degrees: ⟨k⟩ 11.815, ⟨k²⟩ 770.41, median 3, 22.1% with one route (expected: the same)', near(d.mean, 11.815, 0.0005) && near(d.mean2, 770.41, 0.005) && d.median === 3 && near(d.ones, 0.221, 0.0005))
  info(`tail: α ${d.at.map((x) => `${x.alpha.toFixed(3)} at k_min ${x.kMin}`).join(', ')}; recipe: k_min ${d.fit.kMin}, α ${d.fit.alpha.toFixed(3)}, tail ${d.fit.tail}; bootstrap p ${d.p} over ${d.sets} sets; lognormal R ${d.compare.lognormal.R.toFixed(1)} (p ${d.compare.lognormal.p.toExponential(1)}), cut-off R ${d.compare.cutoff.R.toFixed(1)} (p ${d.compare.cutoff.p.toExponential(1)}), exponential R ${d.compare.exponential.R.toFixed(1)}; verdict ${d.verdict}`)
  check('tail: α 1.711, 1.797, 1.896, 2.136, 2.400 at k_min 2, 5, 10, 20, 30 (expected: the same)', d.at.map((x) => x.alpha.toFixed(3)).join(' ') === '1.711 1.797 1.896 2.136 2.400')
  check('tail: the bootstrap rules the power law out (no synthetic set of 200 fits worse) and the lognormal and the cut-off fit significantly better', d.p === 0 && d.sets === 200 && d.verdict === 'ruledOut' && d.compare.lognormal.R < 0 && d.compare.lognormal.p < 0.01 && d.compare.cutoff.R < 0 && d.compare.cutoff.p < 0.01)
  const scanAt = (kMin) => d.scan.find((x) => x[0] === kMin)[1]
  info(`tail, the scan: α ${[2, 10, 20, 30, 40, 50, 60].map((q) => `${f2(scanAt(q))} at ${q}`).join(', ')}`)
  check('tail: α keeps rising with k_min (2, 10, 20, 30, 40, 50, 60)', [2, 10, 20, 30, 40, 50, 60].every((q, i, a) => i === 0 || scanAt(q) > scanAt(a[i - 1])))

  const c = C.drain(C.centralityJob(G))
  R.centrality = c
  info(`degree, first ten: ${c.top.degree.map((v) => `${name(v)} ${c.degree[v]}`).join(', ')}`)
  info(`betweenness, first ten: ${c.top.betweenness.map((v) => `${name(v)} ${f4(c.betweenness[v])}`).join(', ')}`)
  info(`closeness, first five: ${c.top.closeness.slice(0, 5).map((v) => `${name(v)} ${f3(c.closeness[v])}`).join(', ')}; PageRank, first five: ${c.top.pagerank.slice(0, 5).map((v) => name(v)).join(', ')}`)
  check('degrees, the first five: AMS 248, FRA 244, CDG 240, ISL 233, ATL 217 (expected: the same)', c.top.degree.slice(0, 5).map((v) => `${name(v)} ${c.degree[v]}`).join(', ') === 'AMS 248, FRA 244, CDG 240, ISL 233, ATL 217')
  check('betweenness (normalised): CDG 0.0646, LAX 0.0615, ANC 0.0594, DXB 0.0563, FRA 0.0533 (expected: the same)', c.top.betweenness.slice(0, 5).map((v) => `${name(v)} ${f4(c.betweenness[v])}`).join(', ') === 'CDG 0.0646, LAX 0.0615, ANC 0.0594, DXB 0.0563, FRA 0.0533')
  const more = Array.from(c.degree).filter((x) => x > 34).length
  const same = Array.from(c.degree).filter((x) => x === 34).length
  info(`Anchorage: degree ${c.degree[at('ANC')]}; ${more} airports have more routes and ${same} have 34, so it is between the ${more + 1}th and the ${more + same}th by degree (expected: 287th)`)
  check('Anchorage: 34 routes, 283 airports with more (places 284 to 291: the prompt\'s 287th is inside), third by betweenness', c.degree[at('ANC')] === 34 && more === 283 && more + same >= 287 && C.placeOf(c.betweenness, at('ANC')) === 3)
  info(`rank correlation of degree and betweenness ${f3(c.rho)}; ${f3(c.zeroShare)} of the airports with betweenness 0`)
  check('rank correlation of degree and betweenness 0.822; 45.8% of the airports with zero (expected: the same)', near(c.rho, 0.822, 0.0005) && near(c.zeroShare, 0.458, 0.0005))
  // against module 03's own betweenness and closeness, on a part small enough for them
  const sub = C.giantOf({ ...whole, n: whole.n, A: whole.A.filter((_, e) => whole.w[e] >= 4), B: whole.B.filter((_, e) => whole.w[e] >= 4), w: whole.w.filter((w) => w >= 4) })
  const cs = C.drain(C.centralityJob(sub))
  const b03 = brandes03(undirected(sub))
  const c03 = closeness03(undirected(sub))
  const norm = ((sub.n - 1) * (sub.n - 2)) / 2
  check(`centrality: on the ${sub.n} airports joined by links with four airlines or more, betweenness and closeness are module 03's`, Array.from(cs.betweenness).every((x, v) => near(x, b03[v] / norm, 1e-9)) && Array.from(cs.closeness).every((x, v) => near(x, c03[v], 1e-9)))
  const out = C.outliers(c.degree, c.betweenness).map(name).join(' ')
  info(`Figure F2 labels the airports among the ${C.OUT_TOP} of highest betweenness with fewer than ${C.OUT_DEGREE} routes: ${out} (the prompt: Anchorage, Papeete, Port Moresby, Bethel)`)
  check('Figure F2: Anchorage, Papeete, Port Moresby and Bethel are labelled (and Winnipeg)', out === 'ANC PPT POM BET YWG')

  const w = C.weightsReport(G)
  R.weights = w
  info(`weights: ${f3(w.ones)} of the links with one airline, largest ${w.max} (${name(w.maxLink[0])}–${name(w.maxLink[1])}), mean ${f2(w.mean)}, strength ∝ k^${f3(w.beta)} on the class means of module 10 (expected 1.10); backbone at 0.05: ${w.backbone.links} links (${f3(w.backbone.linkShare)}), ${w.backbone.nodes} nodes`)
  check('weights: 55.6% of the links with one airline; the largest 20 (Chicago–Atlanta); mean 1.82 (expected: the same)', near(w.ones, 0.556, 0.0005) && w.max === 20 && [name(w.maxLink[0]), name(w.maxLink[1])].sort().join(' ') === 'ATL ORD' && near(w.mean, 1.82, 0.005))
  check('weights: strength grows as k^1.12 (expected 1.10, another fit: within 0.03)', near(w.beta, 1.1, 0.03))

  const km = C.linkLengths(whole)
  const ls = C.lengthSummary(km)
  const longest = C.longestLinks(whole, 10, km)
  R.geo = { ls, longest }
  info(`geography: median link ${ls.median.toFixed(1)} km, ${f3(ls.under1000)} under 1,000 km, ${f3(ls.over5000)} over 5,000 km; longest ${longest.map((l) => `${whole.names[whole.A[l.e]]}–${whole.names[whole.B[l.e]]} ${Math.round(l.km)}`).join(', ')}`)
  check('geography: median link 1,155 km (expected 1,156, from unrounded coordinates), 44.2% under 1,000 km, 7.0% over 5,000 km (expected 7.1%)', near(ls.median, 1156, 1.5) && near(ls.under1000, 0.442, 0.001) && near(ls.over5000, 0.071, 0.001))
  check('geography: the three longest are Lusaka–KSLI 16,082 km, Ndola–KSLI 15,937 km and Sydney–Dallas 13,808 km (expected: the same)', longest.slice(0, 3).map((l) => `${[whole.names[whole.A[l.e]], whole.names[whole.B[l.e]]].sort().join('-')} ${Math.round(l.km)}`).join(', ') === 'KSLI-LUN 16082, KSLI-NLA 15937, DFW-SYD 13808' && whole.w[longest[0].e] === 1 && whole.w[longest[1].e] === 1)
  check('great-circle distance: a quarter of a meridian is 10,007.5 km, and a degree of longitude at 60° N half of one at the equator', near(C.greatCircle(0, 0, 90, 0), (Math.PI / 2) * 6371, 1e-6) && near(C.greatCircle(60, 0, 60, 1) / C.greatCircle(0, 0, 0, 1), 0.5, 1e-4))
}

// ---------------------------------------------------------------- null model

if (section('null') || section('page')) {
  const s = C.drain(C.shapeJob(G))
  R.shape = s
  info(`shape: mean distance ${f4(s.distance)}, diameter ${s.diameter}, mean clustering ${f4(s.clustering)}, transitivity ${f4(s.transitivity)}, r ${f4(s.r)}`)
  check('mean distance 3.9585, diameter 12; mean local clustering 0.4928, transitivity 0.2497; r = −0.0181 (expected: the same)', near(s.distance, 3.9585, 0.00005) && s.diameter === 12 && near(s.clustering, 0.4928, 0.00005) && near(s.transitivity, 0.2497, 0.00005) && near(s.r, -0.0181, 0.00005))
  const apl = averagePathLength(buildCSR(G.n, G.A, G.B))
  check('mean distance: the same number from graphUtils.averagePathLength', near(apl.average ?? apl.mean ?? apl.L, s.distance, 1e-9), JSON.stringify(Object.keys(apl)))
  const z = s.null
  info(`null model, 10 rewirings: clustering ${f3(z.clustering.mean)} ± ${f3(z.clustering.sd)}, mean distance ${f3(z.distance.mean)} ± ${f3(z.distance.sd)}, r ${f3(z.r.mean)} ± ${f3(z.r.sd)} (z ${z.r.z.toFixed(1)})`)
  check('null model, 10 rewirings: clustering 0.092 (expected 0.090), mean distance 3.24 (3.25), r = −0.103 (−0.099), z +18.7 (about +19)', near(z.clustering.mean, 0.09, 0.005) && near(z.distance.mean, 3.25, 0.02) && near(z.r.mean, -0.099, 0.008) && near(z.r.z, 19, 3))
  const m = C.drain(C.mixingJob(G))
  R.mixing = m
  check('the mixing card rewires along the same chain as the first card: the same r in the rewirings', near(m.null.mean, z.r.mean, 1e-12) && near(m.r, s.r, 1e-12))
  const ks = [20, 50, 100, 150, 180]
  info(`rich-club ratio above k = ${ks.join(', ')}: ${ks.map((k) => f3(C.richAt(m.rich, k))).join(', ')} (expected 1.05, 1.07, 1.19, 1.12, 1.08); largest ${f3(Math.max(...m.rich.map((x) => x.ratio).filter(Number.isFinite)))} at k = ${m.rich.reduce((a, x) => (x.ratio > a.ratio ? x : a)).k} (${m.rich.reduce((a, x) => (x.ratio > a.ratio ? x : a)).nodes} airports)`)
  check('rich-club ratio: 1.05, 1.07, 1.20 above k = 20, 50, 100 (expected 1.05, 1.07, 1.19)', near(C.richAt(m.rich, 20), 1.05, 0.01) && near(C.richAt(m.rich, 50), 1.07, 0.01) && near(C.richAt(m.rich, 100), 1.19, 0.02))
  // Above 150 the club has 20 airports or fewer and the ratio of ten rewirings
  // moves with the seed: the working rule on seeds, with ten other seeds.
  if (!only || only === 'null') {
    const others = Array.from({ length: 10 }, (_, j) => 990000 + 137 * j).map((seed) => C.drain(C.mixingJob(G, { seed })))
    const span = (k) => `${f2(Math.min(...others.map((o) => C.richAt(o.rich, k))))} to ${f2(Math.max(...others.map((o) => C.richAt(o.rich, k))))}`
    info(`rich-club ratio over ten other seeds of ten rewirings each: above 100 ${span(100)}, above 150 ${span(150)}, above 180 ${span(180)}; r in the rewirings ${f3(Math.min(...others.map((o) => o.null.mean)))} to ${f3(Math.max(...others.map((o) => o.null.mean)))}, z ${Math.min(...others.map((o) => o.null.z)).toFixed(1)} to ${Math.max(...others.map((o) => o.null.z)).toFixed(1)}`)
    check('rich-club ratio above 150 and 180: 1.18 and 1.17 here against 1.12 and 1.08 expected; over ten other seeds both stay between 1.0 and 1.35, and the expected values are inside or within 0.05 of that range', others.every((o) => C.richAt(o.rich, 150) > 1 && C.richAt(o.rich, 150) < 1.35 && C.richAt(o.rich, 180) > 1 && C.richAt(o.rich, 180) < 1.35) && Math.min(...others.map((o) => C.richAt(o.rich, 150))) <= 1.17 && Math.min(...others.map((o) => C.richAt(o.rich, 180))) <= 1.13)
    // z divides by the spread of ten rewirings, which is itself uncertain: 10.7 to 29.8 over the ten seeds. The lecture says "more than ten".
    const tops = others.map((o) => Math.max(...o.rich.map((x) => x.ratio).filter(Number.isFinite)))
    R.richOthers = [Math.min(...tops), Math.max(...tops)]
    info(`largest rich-club ratio over the ten other seeds: ${f2(R.richOthers[0])} to ${f2(R.richOthers[1])} (here 1.35, among the eight largest airports)`)
    check('the largest rich-club ratio is 1.35 here and 1.24 to 1.34 over ten other seeds: the lecture says "about 1.3", and "about 1.2" above 100 routes (1.18 to 1.20)', R.richOthers[0] > 1.2 && R.richOthers[1] < 1.36 && others.every((o) => near(C.richAt(o.rich, 100), 1.19, 0.02)))
    check('over ten other seeds the rewirings always give r between −0.11 and −0.09 and a z above 10 (the prompt asked "about +19"; here 18.7, and 10.7 to 29.8 over the seeds), and the ratio above 100 stays between 1.15 and 1.25', others.every((o) => o.null.mean > -0.11 && o.null.mean < -0.09 && o.null.z > 10 && near(C.richAt(o.rich, 100), 1.2, 0.05)) && z.r.z > 10)
  }
}

// ---------------------------------------------------------------- communities

if (section('communities') || section('page')) {
  const runs = Array.from({ length: LOUVAIN_RUNS }, (_, j) => C.communities(G, j))
  const lab = runs.map((r) => C.againstLabels(G, r.partition))
  const anc = runs.map((r) => r.groups.find((g) => g.hub === at('ANC')) || null)
  R.communities = { runs, lab, anc }
  info(`Louvain, ten runs: Q ${runs.map((r) => f4(r.Q)).join(' ')}; groups ${runs.map((r) => r.count).join(' ')}; NMI with the regions ${lab.map((l) => f3(l.nmi)).join(' ')}; Q of the regions ${f4(lab[0].Q)}; group with Anchorage as hub: ${anc.map((g) => (g ? g.size : '–')).join(' ')}`)
  check('communities: Q between 0.65 and 0.66 over ten runs (expected: the same)', runs.every((r) => r.Q > 0.65 && r.Q < 0.66))
  check('communities: 18 to 25 groups (expected 16 to 26), agreement with the regions 0.62 to 0.66 (expected 0.59 to 0.66), Q of the regions 0.567', Math.min(...runs.map((r) => r.count)) === 18 && Math.max(...runs.map((r) => r.count)) === 25 && lab.every((l) => l.nmi >= 0.59 && l.nmi <= 0.66) && near(Math.min(...lab.map((l) => l.nmi)), 0.622, 0.0005) && near(Math.max(...lab.map((l) => l.nmi)), 0.656, 0.0005) && near(lab[0].Q, 0.567, 0.0005))
  check('communities: the Q of a run is module 09\'s modularity of its partition', runs.every((r) => near(r.Q, modularity(G, r.partition), 1e-12)))
  const usOnly = (r, g) => Array.from({ length: G.n }, (_, v) => v).filter((v) => r.partition[v] === g.id).every((v) => data.countries[data.nodes.country[G.orig[v]]] === 'United States')
  check('communities: in nine of the ten runs a group of 131 airports, all in the United States, has Anchorage as its largest hub (expected: about 131)', anc.filter(Boolean).length === 9 && anc.every((g, j) => !g || (g.size === 131 && usOnly(runs[j], g))))
  check('communities: in the first run (the tenth of the "nine of ten" of the lecture) Anchorage is in the group whose hub is Atlanta, and Alaska is in several small groups (hubs BET, FAI, OME, JNU)', ['BET', 'FAI', 'OME', 'JNU'].every((h) => runs[0].groups.some((g) => name(g.hub) === h && g.size < 40)) && name(runs[0].groups.find((g) => g.id === runs[0].partition[at('ANC')]).hub) === 'ATL' && anc[0] === null)
  check('communities: the partition stored for Figure F1 is the run of highest Q, and it has the Alaska group', pre.community.best === runs.reduce((b, r, j) => (r.Q > runs[b].Q + 1e-12 ? j : b), 0) && pre.community.groups.some((g) => g.hub === at('ANC') && g.size === 131))
  info(`agreement of each run with the one before: ${runs.slice(1).map((r, j) => f3(C.agreement(r.partition, runs[j].partition))).join(' ')}`)
}

// ---------------------------------------------------------------- stress tests

if (section('stress') || section('page')) {
  const bc = pre.centrality.betweenness
  const rc = C.removalCurves(G, { betweenness: bc })
  R.removal = rc
  const F = [0.01, 0.02, 0.05, 0.1, 0.15, 0.2, 0.3, 0.5]
  const row = (id, f = F) => f.map((x) => f2(C.curveAt(rc[id], x))).join(' ')
  for (const id of ['random', 'degree', 'recomputed', 'betweenness']) info(`removal, ${id}: ${row(id)}`)
  const within = (id, want, tol, f = F) => f.every((x, i) => near(C.curveAt(rc[id], x), want[i], tol))
  check('removal at random (10 orders): 0.99 0.97 0.93 0.86 0.79 0.73 0.60 0.37 (expected 0.99 0.97 0.92 0.86 0.80 0.73 0.60 0.37: within 0.015)', within('random', [0.99, 0.97, 0.92, 0.86, 0.8, 0.73, 0.6, 0.37], 0.015))
  check('removal by degree, fixed order: 0.95 0.91 0.77 0.14 0.07 0.03 0.01 0.00 (expected the same but 0.06 at 15%: ties in degree; within 0.015)', within('degree', [0.95, 0.91, 0.77, 0.14, 0.06, 0.03, 0.01, 0], 0.015))
  check('removal by degree, recomputed, up to 20%: 0.95 0.91 0.74 0.29 0.05 0.00 (expected 0.28 at 10%: ties; within 0.015)', within('recomputed', [0.95, 0.91, 0.74, 0.28, 0.05, 0], 0.015, F.slice(0, 6)))
  check('removal by betweenness, fixed order: 0.90 0.83 0.59 0.27 0.13 0.08 0.00 0.00 (expected 0.01 at 30%; within 0.015)', within('betweenness', [0.9, 0.83, 0.59, 0.27, 0.13, 0.08, 0.01, 0], 0.015))
  const cut = (code) => C.closure(G, [at(code)]).cut.length
  R.cut = { ANC: cut('ANC'), PPT: cut('PPT'), ATL: cut('ATL'), AMS: cut('AMS') }
  const tenK = C.closure(G, C.topBy(pre.centrality.degree, 10)).left
  const tenB = C.closure(G, C.topBy(bc, 10)).left
  R.ten = { tenK, tenB }
  info(`closing one airport cuts off: Anchorage ${R.cut.ANC}, Papeete ${R.cut.PPT}, Atlanta ${R.cut.ATL}, Amsterdam ${R.cut.AMS}; the ten with most routes leave ${f3(tenK)}, the ten of highest betweenness ${f3(tenB)}`)
  check('closing one airport cuts off: Anchorage 87, Papeete 26, Atlanta 11, Amsterdam 0; the ten with most routes leave 0.981, the ten of highest betweenness 0.962 (expected: the same)', R.cut.ANC === 87 && R.cut.PPT === 26 && R.cut.ATL === 11 && R.cut.AMS === 0 && near(tenK, 0.981, 0.0005) && near(tenB, 0.962, 0.0005))
  check('closing Anchorage: the 87 airports cut off are all in the United States, and Papeete has 30 routes', C.closure(G, [at('ANC')]).cut.every((v) => data.countries[data.nodes.country[G.orig[v]]] === 'United States') && pre.centrality.degree[at('PPT')] === 30)
  const th = C.thresholds(G)
  R.th = th
  info(`germ: T_c ${f4(th.Tc)}, f_c ${f3(th.fc)}, R0 at T = 0.1 ${f2(th.r0(0.1))}`)
  check('germ: T_c 0.0156, f_c 0.984 (expected: the same); R0 = 6.42 at T = 0.1; with 12 routes each 0.091, 0.909 and 1.1 (exercise 2)', near(th.Tc, 0.0156, 0.00005) && near(th.fc, 0.984, 0.0005) && near(th.r0(0.1), 6.42, 0.005) && near(12 / (144 - 12), 0.091, 0.0005) && near(1 - 12 / 132, 0.909, 0.0005) && near((0.1 * 132) / 12, 1.1, 1e-9) && near(th.mean2 - th.mean, 758.595, 0.002))
  const pc = C.percolationCurve(G)
  R.perc = pc
  const pAt = (T) => pc.find((p) => p[0] === T)[1]
  info(`largest cluster, 10 runs per point: ${pc.map((p) => `${p[0]}: ${f3(p[1])}`).join(', ')}`)
  check('germ: largest cluster 0.01 0.04 0.19 0.33 0.48 0.60 0.78 at T = 0.01, 0.02, 0.05, 0.1, 0.2, 0.3, 0.5 (expected 0.00 0.06 0.19 0.32 0.48 0.60 0.77: within 0.015, T = 0.02 aside)', [0.01, 0.05, 0.1, 0.2, 0.3, 0.5].every((T, i) => near(pAt(T), [0, 0.19, 0.32, 0.48, 0.6, 0.77][i], 0.015)))
  // just above the threshold ten runs are few: the working rule on seeds
  const at002 = Array.from({ length: 10 }, (_, j) => C.percolationCurve(G, { Ts: [0.02], seed: 990000 + 137 * j })[0][1])
  info(`largest cluster at T = 0.02 over ten other seeds of ten runs each: ${f3(Math.min(...at002))} to ${f3(Math.max(...at002))} (here ${f3(pAt(0.02))}, expected 0.06)`)
  check('germ, T = 0.02, just above the threshold: 0.04 here against 0.06 expected; over ten other seeds between 0.02 and 0.08', at002.every((x) => x > 0.02 && x < 0.08) && pAt(0.02) > 0.02 && pAt(0.02) < 0.08)
  const cs = [0.1, 0.18, 0.25].map((phi) => C.cascadeShares(G, phi))
  R.cascades = cs
  info(`fashion: ${cs.map((c) => `φ = ${c.phi}: ${f3(c.all)} of the seeds, ${c.top} of ${c.of} hubs, largest ${f2(c.largest)}`).join('; ')}`)
  check('fashion: 0.300 of single seeds above 10% at φ = 0.1, 0.016 at 0.18, none at 0.25 (largest cascade 0.05); from the 20 with most routes 19, 2 and 0 (expected: the same)', near(cs[0].all, 0.3, 0.0005) && near(cs[1].all, 0.016, 0.0005) && cs[2].all === 0 && near(cs[2].largest, 0.05, 0.005) && cs.map((c) => c.top).join(' ') === '19 2 0')
}

// ---------------------------------------------------------------- spread

if (section('spread') || section('page')) {
  R.spread = {}
  const want = { ATL: [0.71, 0.11, -0.86], FCO: [0.79, 0.3, -0.88], ANC: [0.59, 0.08, -0.88] }
  for (const code of ['ATL', 'FCO', 'ANC']) {
    const a = C.drain(C.arrivalJob(G, at(code)))
    const r = C.arrivalCorrelations(G, at(code), a.mean)
    R.spread[code] = { ...r, mean: a.mean, steps: a.steps }
    info(`spread from ${code}, SI with β = 0.1, 20 runs: rank correlation of the mean arrival time ${f2(r.flights)} with flights, ${f2(r.km)} with kilometres, ${f2(r.degree)} with degree (expected ${want[code].join(', ')}); ${r.reached} airports reached`)
    check(`spread from ${code}: within 0.1 of the expected correlations, and every airport is reached`, near(r.flights, want[code][0], 0.1) && near(r.km, want[code][1], 0.1) && near(r.degree, want[code][2], 0.1) && r.reached === G.n - 1)
  }
  const fl = C.flightsFrom(G, at('ATL'))
  const m = R.spread.ATL.mean
  let late2 = 0
  let early4 = Infinity
  for (let v = 0; v < G.n; v++) {
    if (fl[v] === 2) late2 = Math.max(late2, m[v])
    if (fl[v] === 4) early4 = Math.min(early4, m[v])
  }
  check('spread from Atlanta: some airport 2 flights away is reached, on average, after some airport 4 flights away', late2 > early4, `${late2.toFixed(1)} > ${early4.toFixed(1)}`)
}

// ---------------------------------------------------------------- loader

if (section('loader')) {
  const r = parseEdgeList('# comment\na b\nb,c\nc;d 2\nd\ta\n  a   c   3 \nc a 2\ne e\nd e\n\nf g\njunk\nx y -1\n')
  check('loader: spaces, tabs, commas and semicolons; comments and empty lines ignored; a self-link dropped; a repeated link merged with the weights added; unreadable lines counted', r.ok && r.net.n === 7 && r.net.A.length === 7 && r.report.selfLinks === 1 && r.report.merged === 1 && r.report.skipped === 2 && r.report.lines === 11 && r.net.names.join(' ') === 'a b c d e f g')
  const w = (a, b) => {
    for (let e = 0; e < r.net.A.length; e++) if ([r.net.names[r.net.A[e]], r.net.names[r.net.B[e]]].sort().join('') === [a, b].sort().join('')) return r.net.w[e]
    return null
  }
  check('loader: weights — a–c is 3 + 2 = 5, c–d is 2, a–b is 1; the network is undirected', w('a', 'c') === 5 && w('c', 'd') === 2 && w('a', 'b') === 1 && w('c', 'a') === 5)
  check('loader: an edge list without weights or repeats has no weights', parseEdgeList('1 2\n2 3').net.w === null && parseEdgeList('1 2\n2 1').net.w[0] === 2)
  check('loader: nothing readable is refused as empty', !readNetwork('   ').ok && readNetwork('# only\n').error === 'empty' && readNetwork('a a').error === 'empty')
  const ring = (n) => Array.from({ length: n }, (_, i) => `${i} ${(i + 1) % n}`).join('\n')
  check('loader: 30,000 nodes are read and 30,001 refused', readNetwork(ring(C.MAX_NODES)).ok && readNetwork(ring(C.MAX_NODES + 1)).error === 'nodes')
  const dense = []
  for (let i = 0; i < 600 && dense.length <= C.MAX_LINKS; i++) for (let j = i + 1; j < 600 && dense.length <= C.MAX_LINKS; j++) dense.push(`${i} ${j}`)
  check('loader: 150,000 links are read and 150,001 refused', readNetwork(dense.slice(0, C.MAX_LINKS).join('\n')).ok && readNetwork(dense.join('\n')).error === 'links')
  const lnd = { nodes: [{ pub_key: '02aa', alias: 'alice' }, { pub_key: '03bb', alias: 'bob' }, { pub_key: '02cc', alias: '' }, { pub_key: '02dd', alias: 'alone' }], edges: [{ channel_id: '1', node1_pub: '02aa', node2_pub: '03bb', capacity: '1000' }, { channel_id: '2', node1_pub: '03bb', node2_pub: '02aa', capacity: '500' }, { channel_id: '3', node1_pub: '03bb', node2_pub: '02cc', capacity: '2000' }, { channel_id: '4', node1_pub: '02cc', node2_pub: '02cc', capacity: '1' }, { channel_id: '5', node1_pub: '02cc' }] }
  const l = readNetwork(JSON.stringify(lnd))
  check('loader, describegraph: nodes by pub_key, edges by node1_pub, node2_pub and capacity (a string); one link per pair with the total capacity; a node without channels left out', l.ok && l.report.lnd && l.net.n === 3 && l.net.A.length === 2 && Array.from(l.net.w).sort((a, b) => a - b).join(' ') === '1500 2000' && l.report.merged === 1 && l.report.selfLinks === 1 && l.report.skipped === 1 && l.net.names[0] === 'alice (02aa)' && l.net.names[2] === '02cc')
  check('loader: JSON that is not a channel graph is refused', readNetwork('{"a": 1}').error === 'format' && readNetwork('{broken').error === 'format' && !parseLnd(null).ok)
  check('limits: every source up to 5,000 nodes, 300 sampled sources above, the same ones every time', C.sourcesFor(5000) === null && C.sourcesFor(5001).length === 300 && new Set(C.sourcesFor(5001)).size === 300 && C.sourcesFor(5001).join() === C.sourcesFor(5001).join())
  // the sampled route on a network above the limit, against the exact one
  const big = readNetwork(Array.from({ length: 6000 }, (_, i) => `${i} ${(i + 1) % 6000}\n${i} ${(i * 7 + 13) % 6000}`).join('\n'))
  const bg = C.giantOf(big.net)
  const sampled = C.drain(C.centralityJob(bg))
  const exact = C.drain(C.centralityJob(bg, { sources: null }))
  const ds = C.distances(bg, C.sourcesFor(bg.n))
  const de = C.distances(bg, null)
  info(`a network of ${bg.n} nodes: mean distance ${f3(ds.mean)} from 300 sources against ${f3(de.mean)} exact; diameter ${ds.diameter} against ${de.diameter}; mean betweenness ${(sampled.betweenness.reduce((a, b) => a + b, 0) / bg.n).toExponential(3)} against ${(exact.betweenness.reduce((a, b) => a + b, 0) / bg.n).toExponential(3)}`)
  check('a network above 5,000 nodes takes the sampled route: 300 sources, mean distance within 2% of the exact one, mean betweenness within 2%, a diameter no larger than the exact one', sampled.sampled === 300 && exact.sampled === 0 && near(ds.mean / de.mean, 1, 0.02) && near(sampled.betweenness.reduce((a, b) => a + b, 0) / exact.betweenness.reduce((a, b) => a + b, 0), 1, 0.02) && ds.diameter <= de.diameter)
  check('limits: tooLarge names what is over', C.tooLarge(30001, 10) === 'nodes' && C.tooLarge(10, 150001) === 'links' && C.tooLarge(30000, 150000) === null)
}

// ---------------------------------------------------------------- the small networks

if (section('small') || section('page')) {
  const kd = JSON.parse(read('src/data/lab/networks/karate-club.json'))
  const K = C.giantOf(C.storedNet('karate', kd, { of: Int32Array.from(kd.nodes, (_, i) => (kd.mrHi.includes(i) ? 0 : 1)), names: ['Mr. Hi', 'Officer'] }))
  const s = C.drain(C.shapeJob(K))
  const d = C.drain(C.degreeJob(K))
  const cm = C.communities(K, 0)
  const lab = C.againstLabels(K, cm.partition)
  const rc = C.removalCurves(K)
  const th = C.thresholds(K)
  const cs = C.cascadeShares(K, 0.18)
  R.karate = { s, d, cm, lab, rc, th, cs }
  info(`karate club: clustering ${f3(s.clustering)} against ${f3(s.null.clustering.mean)} (z ${s.null.clustering.z.toFixed(1)}), r ${f3(s.r)} against ${f3(s.null.r.mean)} (z ${s.null.r.z.toFixed(1)}), distance ${f4(s.distance)}, diameter ${s.diameter}; Louvain ${cm.count} groups, Q ${f4(cm.Q)}, NMI with the factions ${f3(lab.nmi)}, Q of the factions ${f3(lab.Q)}; 10% removed: ${f2(C.curveAt(rc.random, 0.1))} at random, ${f2(C.curveAt(rc.degree, 0.1))} by degree; T_c ${f4(th.Tc)}; φ = 0.18: ${f3(cs.all)}; degrees: ${d.verdict}`)
  check('karate club: 34 members, 78 links, the numbers of exercise 6', K.n === 34 && K.A.length === 78 && d.verdict === 'small' && cm.count === 4)
  const fd = JSON.parse(read('src/data/lab/networks/florentine-families.json'))
  const F = C.giantOf(C.storedNet('florentine', fd))
  const fc = C.drain(C.centralityJob(F))
  check('Florentine families: every card runs on 15 nodes, and the Medici lead by betweenness', F.n === 15 && C.drain(C.shapeJob(F)).done && C.drain(C.degreeJob(F)).done && C.drain(C.mixingJob(F)).done && F.names[fc.top.betweenness[0]] === 'Medici' && C.communities(F, 0).count >= 2 && C.weightsReport(F) === null)
  const tiny = C.giantOf(parseEdgeList('a b').net)
  check('a network of one link: nothing crashes', C.drain(C.shapeJob(tiny)).done && C.drain(C.degreeJob(tiny)).done && C.drain(C.centralityJob(tiny)).done && C.drain(C.mixingJob(tiny)).done && C.communities(tiny, 0).count >= 1 && C.removalCurves(tiny).random.length === 101 && Number.isFinite(C.cascadeShares(tiny, 0.18).all))
}

// ---------------------------------------------------------------- page

if (section('page')) {
  if (only) info('run the whole check to pin the texts')
  else {
    const lectureEn = read('src/content/network-lab/capstone-a-real-network.en.md')
    const lectureIt = read('src/content/network-lab/capstone-a-real-network.it.md')
    const body = (text) => text.split('<!-- simulation -->')[0]
    const L = body(lectureEn)
    const quoted = (where, text, list) => {
      const missing = list.filter((x) => !text.includes(x))
      check(`quoted on the page — ${where}`, missing.length === 0, missing.length ? `missing: ${missing.join(' | ')}` : '')
    }
    const { degrees: d, centrality: c, shape: s, mixing: m, weights: w, geo, removal: rc, th, cascades: cs, spread: sp, communities: cm, karate: k, cut, ten, perc } = R
    const rmv = (id, f) => en(C.curveAt(rc[id], f), 2)
    const pAt = (T) => en(perc.find((p) => p[0] === T)[1], 2)
    const km = (i) => en(Math.round(geo.longest[i].km), 0)
    const qs = cm.runs.map((r) => r.Q)
    const nm = cm.lab.map((l) => l.nmi)
    const richMax = Math.max(...m.rich.map((x) => x.ratio).filter(Number.isFinite))
    const richTop = m.rich.reduce((a, x) => (x.ratio > a.ratio ? x : a))
    check('the eight largest airports are the club of the largest ratio', richTop.nodes === 8 && en(richMax, 2) === '1.35')
    quoted('lecture, step 1: the counts and the three longest links', L, ['3,214 airports and 18,858 links, in 7 components: one of 3,188 airports and six islands of 2 to 10', `Sydney–Dallas, ${km(2)} km`, `${km(0)} and ${km(1)} km long`, 'June 2014'])
    quoted('lecture, step 2: distance and clustering against the null model', L, [`${en(s.distance, 2)} flights apart`, `mean clustering is ${en(s.clustering, 2)}`, `clustering falls to ${en(s.null.clustering.mean, 2)}`, `${en(s.null.distance.mean, 2)} flights against ${en(s.distance, 2)}`, `median link being ${en(Math.round(geo.ls.median), 0)} km`])
    quoted('lecture, step 3: the tail', L, [`${d.median} routes, ${en(d.ones * 100, 1)}% have one, and the largest has ${d.max}`, d.at.map((x, i) => (i === 0 ? `${en(x.alpha, 2)} at k_min = ${x.kMin}` : `${en(x.alpha, 2)} at ${x.kMin}`)).join(', '), 'p below 0.005', 'November 2000', 'truncated power law'])
    quoted('lecture, step 4: who is central', L, ['Amsterdam, Frankfurt, Paris', 'Paris, Los Angeles and Anchorage', `Anchorage has ${c.degree[at('ANC')]} routes; ${Array.from(c.degree).filter((x) => x > 34).length} airports have more`, `rank correlation ${en(c.rho, 2)}`, `${en(c.zeroShare * 100, 1)}% of the airports`])
    check('lecture, step 4: the three names are the first three of each list', c.top.degree.slice(0, 3).map(name).join(' ') === 'AMS FRA CDG' && c.top.betweenness.slice(0, 3).map(name).join(' ') === 'CDG LAX ANC')
    quoted('lecture, step 5: mixing and the rich club', L, [`r = ${en(s.r, 2).replace('-', '−')}`, `give ${en(m.null.mean, 2).replace('-', '−')}`, 'by more than ten standard deviations', 'more than 100 routes are about 1.2 times', 'the eight largest about 1.3 times', 'a mild rich club'])
    quoted('lecture, step 6: communities', L, [`near ${en(Math.max(...qs), 2)}`, `between ${Math.min(...cm.runs.map((r) => r.count))} and ${Math.max(...cm.runs.map((r) => r.count))} groups over ten runs`, `between ${en(Math.min(...nm), 2)} and ${en(Math.max(...nm), 2)}`, 'In nine of the ten runs one group is Alaska: 131 airports, all in the United States', `${cut.ANC} airports are cut off`])
    quoted('lecture, step 7: weights', L, [`to the power ${en(w.beta, 2)}`, 'found 1.5 on the airports of 2002', `${en(w.ones * 100, 1)}% of the links have one airline`, `largest weight is ${w.max}`])
    quoted('lecture, step 8: robustness', L, [`with 5% removed, ${Math.round(C.curveAt(rc.betweenness, 0.05) * 100)}% is left, against ${Math.round(C.curveAt(rc.degree, 0.05) * 100)}% by degree`, `Remove 10% of the airports at random and ${Math.round(C.curveAt(rc.random, 0.1) * 100)}% of the network`, `most routes and ${Math.round(C.curveAt(rc.degree, 0.1) * 100)}% is`, `critical fraction of ${en(th.fc, 3)}`])
    quoted('lecture, step 9: germ and fashion', L, [`T_c = ${en(th.Tc, 3)}`, `(rank correlation ${en(sp.ATL.flights, 2)})`, `(${en(sp.ATL.degree, 2).replace('-', '−')})`, `kilometres (${en(sp.ATL.km, 2)})`, 'needs 18% of one\'s neighbours', `only ${en(cs[1].all * 100, 1)}% of the airports`, `${cs[1].top} of the 20 largest hubs`])
    quoted('workbench, what to observe', observe.workbench.en, ['3,188 of the 3,214', `Mean distance ${en(s.distance, 2)} and diameter ${s.diameter}`, `clustering ${en(s.clustering, 3)} against ${en(s.null.clustering.mean, 3)}`, `distance ${en(s.distance, 2)} against ${en(s.null.distance.mean, 2)}`, `median is ${d.median} and the maximum ${d.max}`, `k_min = ${d.fit.kMin} and α = ${en(d.fit.alpha, 2)}`, `none of the ${d.sets} synthetic sets`, `from ${en(d.at[0].alpha, 2)} to ${en(d.at[4].alpha, 2)}`, `${en(c.zeroShare, 3)} of the airports have betweenness 0`, `r = ${en(m.r, 3).replace('-', '−')} and the rewirings give ${en(m.null.mean, 3).replace('-', '−')} ± ${en(m.null.sd, 3)}: z = ${en(m.null.z, 1)}`, `is ${en(C.richAt(m.rich, 100), 2)} above 100 and reaches ${en(richMax, 2)} among the eight largest`, `give ${en(R.richOthers[0], 2)} to ${en(R.richOthers[1], 2)} for that last number`, `${cm.runs[0].count} groups with Q = ${en(qs[0], 3)}`, `${cm.runs[1].count} groups, Q = ${en(qs[1], 3)}, and the two partitions agree at ${en(C.agreement(cm.runs[1].partition, cm.runs[0].partition), 3)}`, 'a group of 131 has Anchorage as its hub', `regions is ${en(nm[0], 3)}, then ${en(nm[1], 3)}`, `Q = ${en(cm.lab[0].Q, 3)}`, `β = ${en(w.beta, 2)}; ${en(w.ones, 3)} of the links have weight 1; the largest weight is ${w.max}`, `keeps ${w.backbone.links} links`, `Clustering ${en(k.s.clustering, 3)} against ${en(k.s.null.clustering.mean, 3)}, z = ${en(k.s.null.clustering.z, 1)}`, `r = ${en(k.s.r, 3).replace('-', '−')} against ${en(k.s.null.r.mean, 3).replace('-', '−')}, z = ${en(k.s.null.r.z, 1).replace('-', '−')}`])
    check('workbench, what to observe: Anchorage is in the first ten by betweenness only; Atlanta leads PageRank and is fifth by degree; the rich-club ratio is within 0.08 of 1 up to 50 routes', ['degree', 'closeness', 'pagerank'].every((id) => !c.top[id].includes(at('ANC'))) && c.top.betweenness[2] === at('ANC') && c.top.pagerank[0] === at('ATL') && c.top.degree[4] === at('ATL') && m.rich.filter((x) => x.k >= 1 && x.k <= 50).every((x) => near(x.ratio, 1, 0.08)))
    quoted('stress tests, what to observe', observe.stress.en, [`${rmv('random', 0.1)} at random, ${rmv('degree', 0.1)} by degree, ${rmv('recomputed', 0.1)} by degree recomputed, ${rmv('betweenness', 0.1)} by betweenness`, `${rmv('random', 0.05)}, ${rmv('degree', 0.05)}, ${rmv('recomputed', 0.05)} and ${rmv('betweenness', 0.05)}`, `${rmv('random', 0.3)} with 30% removed, ${rmv('random', 0.5)} with 50%`, `f_c = ${en(th.fc, 3)}`, `T_c = ${en(th.Tc, 4)} and R0 = ${en(th.r0(0.1), 2)}`, `${pAt(0.05)} of the network at T = 0.05, ${pAt(0.2)} at 0.2 and ${pAt(0.5)} at 0.5`, `${en(d.ones * 100, 1)}% of airports with one route`, `${en(cs[1].all, 3)} of the seeds start a global cascade, and ${cs[1].top} of the 20`, `${en(cs[0].all, 3)} and ${cs[0].top} of 20`, `stops at ${en(cs[2].largest, 2)} of the network`, `T_c = ${en(k.th.Tc, 4)}`, `${en(k.cs.all, 3)} of the seeds go global`])
    check('stress tests, what to observe: the karate club\'s threshold is about ten times the airports\'', near(k.th.Tc / th.Tc, 10, 1))
    quoted('the map and the spread, what to observe', observe.spread.en, [`${en(sp.ATL.flights, 2)} with the flights, ${en(sp.ATL.km, 2)} with the kilometres, ${en(sp.ATL.degree, 2).replace('-', '−')} with the degree`, `from Fiumicino ${en(sp.FCO.flights, 2)}, ${en(sp.FCO.km, 2)} and ${en(sp.FCO.degree, 2).replace('-', '−')}`, `${en(sp.ANC.flights, 2)}, ${en(sp.ANC.km, 2)} and ${en(sp.ANC.degree, 2).replace('-', '−')}`, `${cut.ANC} airports are cut off`, `**ATL**: ${cut.ATL}`, `30 routes): ${cut.PPT}`, `${en(ten.tenK, 3)} of the network`, `betweenness: ${en(ten.tenB, 3)}`])
    check('the map and the spread, what to observe: ten airports are 0.3% of the network, and the ten of highest betweenness cost twelve times that', en((10 / G.n) * 100, 1) === '0.3' && Math.round((1 - ten.tenB) / (10 / G.n)) === 12 && cut.AMS === 0)
    const ex = exercises.map((e) => `${e.statement.en} ${e.solution.en}`)
    quoted('exercise 1', ex[0], [`${km(0)} and ${km(1)} km`, `Sydney–Dallas, ${km(2)} km`])
    quoted('exercise 2', ex[1], [`⟨k⟩ = ${d.mean.toFixed(3)} and ⟨k²⟩ = ${f2(d.mean2)}`, `= ${en(th.Tc, 4)}`, `f_c = 1 − T_c = ${en(th.fc, 3)}`, `= ${en(th.r0(0.1), 2)}`, 'T_c = 12/132 = 0.091, f_c = 0.909, R0 = 1.1'])
    quoted('exercise 3', ex[2], ['34 routes and is third by betweenness', '131 airports', `cuts off ${cut.ANC} airports`, 'with 248 routes, cuts off none', `Atlanta: ${cut.ATL}`, `with 30 routes: ${cut.PPT}`])
    quoted('exercise 4', ex[3], [d.at.map((x) => en(x.alpha, 2)).join(', '), 'below 0.005'])
    quoted('exercise 5', ex[4], [`${pAt(0.05)} of the network at T = 0.05`, `${en(cs[1].all, 3)} of the seeds, and ${cs[1].top} of the 20 hubs`, 'needs 36 adopting neighbours'])
    quoted('exercise 6 (karate club)', ex[5], [`${en(k.s.clustering, 3)} against ${en(k.s.null.clustering.mean, 3)} in the rewirings (z = ${en(k.s.null.clustering.z, 1)})`, `r = ${en(k.s.r, 3).replace('-', '−')} against ${en(k.s.null.r.mean, 3).replace('-', '−')} (z = ${en(k.s.null.r.z, 1).replace('-', '−')})`, `${k.cm.count} groups with Q = ${en(k.cm.Q, 3)}`, `Q = ${en(k.lab.Q, 3)} and agree with it at ${en(k.lab.nmi, 3)}`, `${en(C.curveAt(k.rc.random, 0.1), 2)} at random and ${en(C.curveAt(k.rc.degree, 0.1), 2)} by degree`, `T_c = ${en(k.th.Tc, 3)} against ${en(th.Tc, 4)}`])
    check('exercise 5: T = 0.05 is about three times the threshold', near(0.05 / th.Tc, 3.2, 0.1))

    // structure of the lectures and of the texts
    const numbers = (text) => (text.match(/\d[\d.,]*\d|\d/g) || []).map((x) => x.replace(/[.,]/g, '')).sort().join(' ')
    check('quoted on the page — the two lectures carry the same numbers', numbers(body(lectureEn)) === numbers(body(lectureIt)))
    const diff = []
    const pairs = [...Object.entries(observe), ...exercises.flatMap((e, i) => [[`exercise ${i + 1} statement`, e.statement], [`exercise ${i + 1} solution`, e.solution]])]
    for (const [where, v] of pairs) if (numbers(v.en) !== numbers(v.it)) diff.push(where)
    check('quoted on the page — the Italian "what to observe" lists and exercises carry the same numbers as the English ones', diff.length === 0, diff.join(', '))
    const words = (text) => (body(text).match(/\S+/g) || []).length
    info(`lecture words (with markup, up to the simulation marker): EN ${words(lectureEn)}, IT ${words(lectureIt)}`)
    check('lectures: 1,400–1,700 words each', [lectureEn, lectureIt].every((x) => words(x) >= 1400 && words(x) <= 1700), `${words(lectureEn)} / ${words(lectureIt)}`)
    check('lectures: the DRAFT marker is the first line', [lectureEn, lectureIt].every((x) => x.startsWith('<!-- DRAFT: to be reviewed by Adriano -->')))
    const box = (x) => (x.match(/```box\r?\n([\s\S]*?)```/) || [])[1] || ''
    info(`Bitcoin box words: EN ${(box(lectureEn).match(/\S+/g) || []).length}, IT ${(box(lectureIt).match(/\S+/g) || []).length}`)
    check('lectures: one box, on Bitcoin, in each language, and the two live figures', [lectureEn, lectureIt].every((x) => (x.match(/```box/g) || []).length === 1 && box(x).includes('Bitcoin') && x.includes('```figure\nmap\n```'.replace(/\n/g, x.includes('\r\n') ? '\r\n' : '\n')) && (x.match(/```figure/g) || []).length === 2))
    check('lectures: the box gives no number, price or forecast (digits only in the module numbers of its links)', [lectureEn, lectureIt].every((x) => !/\$|USD|€|forecast|prevision/i.test(box(x)) && !/\d/.test(box(x).replace(/\[[^\]]*\]\([^)]*\)/g, ''))))
    const links = ['reading-a-network', 'what-are-we-measuring', 'centrality', 'heavy-tails-done-right', 'growth-mechanisms', 'fitness-and-competition', 'who-connects-to-whom', 'communities', 'weights-flows-navigation', 'robustness-and-cascades', 'epidemics-on-networks', 'social-contagion-network-effects'].map((x) => `(/network-lab/${x})`)
    check('lectures: links to modules 01, 02, 03, 05, 06, 07, 08, 09, 10, 11, 12 and 13, to the index of the Network Lab, to the Complexity Lab and to its module 13', [lectureEn, lectureIt].every((x) => [...links, '(/network-lab)', '(/lab)', '(/lab/bitcoin-complex-system)'].every((l) => x.includes(l))))
    check('lectures: ten numbered steps and a list of ten questions', [lectureEn, lectureIt].every((x) => Array.from({ length: 10 }, (_, i) => `## ${i + 1}. `).every((h) => x.includes(h)) && (body(x).match(/^\d+\. .*\?/gm) || []).length >= 10))
    check('lectures and texts never call the course free', ![body(lectureEn), body(lectureIt), JSON.stringify(observe), JSON.stringify(exercises)].some((x) => /\bfree\b|gratuit|gratis/i.test(x.replace(/scale-free/gi, ''))))
    const refs = (x) => x.split('<!-- simulation -->')[1].split(/\r?\n/).filter((l) => l.startsWith('- '))
    check('lectures: the same eleven references in both languages, OpenFlights first, the four books without chapters', refs(lectureEn).length === 11 && refs(lectureIt).length === 11 && refs(lectureEn)[0].includes('https://openflights.org/data') && refs(lectureEn).slice(7).every((l) => !/Ch\./.test(l)) && refs(lectureIt).slice(7).every((l) => !/Cap\./.test(l)))
    const m01 = read('src/content/network-lab/reading-a-network.en.md')
    check('lectures: the four books are cited as in module 01 (chapters aside)', refs(lectureEn).slice(7).every((l) => m01.includes(l.replace(/\.$/, ''))))
    check('exercises: six — one on paper, three in the page, two both', exercises.length === 6 && exercises.filter((e) => e.type === 'paper').length === 1 && exercises.filter((e) => e.type === 'sim').length === 3 && exercises.filter((e) => e.type === 'both').length === 2)
  }
}

console.log(`\n${failures} failure${failures === 1 ? '' : 's'}`)
process.exit(failures ? 1 : 0)
