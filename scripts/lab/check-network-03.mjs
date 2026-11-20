// Self-checks for Network Lab module 03, "Centrality". They run the same code
// as the page (centrality.js, networks.js, fragility.js) and compare it with
// known values, with theory and with a brute-force count.
//
//   node scripts/lab/check-network-03.mjs
//
// Exits with code 1 if any check fails. Rerun it whenever those files, the
// presets or the stored networks change. Lines starting with INFO report the
// numbers quoted in the lecture, the "what to observe" lists and the exercises.
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mulberry32 } from '../../src/components/lab/rng.js'
import { erdosRenyiGnm } from '../../src/components/lab/graphUtils.js'
import {
  undirected, directed, degree, inDegree, closeness, harmonic, betweenness, betweennessBrute, normalized, pairsOfOthers,
  shortestPaths, neighbourStep, eigenvector, katz, katzFraction, pagerank, surf, hits, toSum, ranks, places, spearman,
  allMeasures, correlationMatrix, pieces, MEASURE_IDS,
} from '../../src/components/lab/network/centrality/centrality.js'
import { fromData, KITE, GROUPS, SIX, WEB, FRAGILE } from '../../src/components/lab/network/centrality/networks.js'
import {
  FRAGILE_MEASURES, FRACTIONS, fragilityJob, dropLinks, addLinks,
} from '../../src/components/lab/network/centrality/fragility.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const data = (name) => JSON.parse(readFileSync(resolve(root, 'src/data/lab/networks', name), 'utf8'))
const FLORENCE = fromData(data('florentine-families.json'))
const KARATE = fromData(data('karate-club.json'))

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
const net = (names, pairs) => ({ n: names.length, A: Int32Array.from(pairs, (p) => p[0]), B: Int32Array.from(pairs, (p) => p[1]), names: [...names] })
const drain = (job) => {
  for (const _ of job.iter);
  return job.snapshot()
}
const first = (values) => {
  const { order, place } = places(values)
  return order.filter((v) => place[v] === 1)
}
const named = (g, list) => list.map((v) => g.names[v]).join(' = ')
const top = (g, values, k = 5, d = 3) => {
  const { order } = places(values)
  return order.slice(0, k).map((v) => `${g.names[v]} ${values[v].toFixed(d)}`).join(', ')
}
const id = (g, name) => g.names.indexOf(name)

// ---------------------------------------------------------------- Krackhardt's kite

{
  const G = undirected(KITE)
  const k = degree(G)
  const c = closeness(G)
  const b = betweenness(G)
  const e = eigenvector(G).vector
  const v = (name) => id(KITE, name)
  check('kite: N = 10, L = 18', KITE.n === 10 && KITE.A.length === 18)
  check('kite: Diane has the most links, 6', named(KITE, first(k)) === 'Diane' && k[v('Diane')] === 6, `degrees ${Array.from(k).join(' ')}`)
  check('kite: Fernando and Garth are nearest to everyone, closeness 9/14 = 0.643', named(KITE, first(c)) === 'Fernando = Garth' && near(c[v('Fernando')], 9 / 14, 1e-12), top(KITE, c))
  check('kite: betweenness Heather 14, Fernando = Garth = 8.33, Ike 8, Diane 3.67', near(b[v('Heather')], 14, 1e-9) && near(b[v('Fernando')], 25 / 3, 1e-9) && near(b[v('Garth')], 25 / 3, 1e-9) && near(b[v('Ike')], 8, 1e-9) && near(b[v('Diane')], 11 / 3, 1e-9), top(KITE, b, 10, 2))
  check('kite: eigenvector centrality puts Diane first', named(KITE, first(e)) === 'Diane', top(KITE, e))
  info(`kite, normalised betweenness: ${top(KITE, normalized(b, 10), 5)}; closeness: ${top(KITE, c, 10)}; harmonic: ${top(KITE, harmonic(G), 4)}`)
  const m = allMeasures(KITE)
  info(`kite, first under each measure: ${MEASURE_IDS.map((mid) => `${mid} ${named(KITE, first(m[mid]))}`).join('; ')}`)
  info(`kite, PageRank 0.85: ${top(KITE, m.pagerank, 4)}; Katz 0.5: ${top(KITE, m.katz, 4)}; λ = ${f4(m.lambda)}`)
  const corr = correlationMatrix(m)
  info(`kite, Spearman: degree–betweenness ${f2(corr[0][3])}, degree–eigenvector ${f2(corr[0][4])}, closeness–betweenness ${f2(corr[1][3])}, betweenness–eigenvector ${f2(corr[3][4])}, lowest ${f2(Math.min(...corr.flat()))}`)
  const sp = shortestPaths(G, v('Andre'), v('Jane'))
  info(`kite, Andre to Jane: ${sp.count} shortest path(s) of length ${sp.length}; through Heather ${sp.paths.filter((p) => p.includes(v('Heather'))).length}, through Fernando ${sp.paths.filter((p) => p.includes(v('Fernando'))).length}`)
  const sp2 = shortestPaths(G, v('Carol'), v('Ed'))
  info(`kite, Carol to Ed: ${sp2.count} shortest path(s) of length ${sp2.length}: ${sp2.paths.map((p) => p.map((x) => KITE.names[x]).join('–')).join('; ')}`)
}

// ---------------------------------------------------------------- Florentine families

{
  const g = FLORENCE
  const G = undirected(g)
  const m = allMeasures(g)
  const v = (name) => id(g, name)
  check('Florentine families: N = 15, L = 20', g.n === 15 && g.A.length === 20)
  check('Florentine families: normalised betweenness Medici 0.522, Guadagni 0.255, Strozzi 0.103', near(m.betweenness[v('Medici')], 0.522, 0.0005) && near(m.betweenness[v('Guadagni')], 0.255, 0.0005) && near(m.betweenness[v('Strozzi')], 0.103, 0.0005), top(g, m.betweenness, 6))
  check('Florentine families: closeness of the Medici 0.560', near(m.closeness[v('Medici')], 0.56, 0.0005), top(g, m.closeness))
  check('Florentine families: eigenvector centrality puts the Medici first', named(g, first(m.eigenvector)) === 'Medici', top(g, m.eigenvector))
  check('Florentine families: the Medici are first under every measure', MEASURE_IDS.every((mid) => named(g, first(m[mid])) === 'Medici'))
  info(`Florentine families: degree ${top(g, m.degree, 5, 0)}; harmonic ${top(g, m.harmonic, 3)}; Katz 0.5 ${top(g, m.katz, 3)}; PageRank 0.85 ${top(g, m.pagerank, 3)}; λ = ${f4(m.lambda)}`)
  info(`Florentine families: Medici betweenness ${f2(m.betweenness[v('Medici')] * pairsOfOthers(15))} of ${pairsOfOthers(15)} pairs; Strozzi degree ${m.degree[v('Strozzi')]}, closeness ${f3(m.closeness[v('Strozzi')])}, eigenvector ${f3(m.eigenvector[v('Strozzi')])}`)
  const corr = correlationMatrix(m)
  info(`Florentine families, Spearman: lowest ${f2(Math.min(...corr.flat()))}; degree–betweenness ${f2(corr[0][3])}; closeness–eigenvector ${f2(corr[1][4])}; degree–PageRank ${f2(corr[0][6])}`)

  // Exercise 4: remove the Medici.
  const keep = g.names.map((_, i) => i).filter((i) => i !== v('Medici'))
  const map = new Map(keep.map((old, i) => [old, i]))
  const pairs = []
  for (let e = 0; e < g.A.length; e++) if (map.has(g.A[e]) && map.has(g.B[e])) pairs.push([map.get(g.A[e]), map.get(g.B[e])])
  const g2 = net(keep.map((i) => g.names[i]), pairs)
  const G2 = undirected(g2)
  const p = pieces(G2)
  const m2 = allMeasures(g2)
  check('Exercise 4: without the Medici the network falls into three pieces of 11, 2 and 1', p.count === 3 && p.sizes.join(' ') === '11 2 1', `sizes ${p.sizes.join(', ')}; alone: ${g2.names.filter((_, i) => G2.out[i].length === 0).join(', ')}`)
  check('Exercise 4: the Guadagni are then the main go-between', named(g2, first(m2.betweenness)) === 'Guadagni', `${top(g2, m2.betweenness, 4)}; in pairs: ${top(g2, betweenness(G2), 4, 2)} of ${pairsOfOthers(14)}`)
  info(`Exercise 4, without the Medici, first under each measure: ${MEASURE_IDS.map((mid) => `${mid} ${named(g2, first(m2[mid]))}`).join('; ')}`)
  info(`Exercise 4, links removed with the Medici: ${g.A.length - g2.A.length}; pieces: ${[...new Set(p.label)].map((l) => g2.names.filter((_, i) => p.label[i] === l).join('+')).join(' | ')}`)
  void G
}

// ---------------------------------------------------------------- Karate club

{
  const g = KARATE
  const m = allMeasures(g)
  check('karate club: N = 34, L = 78', g.n === 34 && g.A.length === 78)
  check('karate club: normalised betweenness member 1 0.438, member 34 0.304', near(m.betweenness[0], 0.438, 0.0005) && near(m.betweenness[33], 0.304, 0.0005), top(g, m.betweenness, 5))
  check('karate club: eigenvector centrality member 34 first, member 1 second', places(m.eigenvector).order[0] === 33 && places(m.eigenvector).order[1] === 0, top(g, m.eigenvector, 4))
  check('karate club: PageRank at 0.85 member 34 0.101, member 1 0.097', near(m.pagerank[33], 0.101, 0.0005) && near(m.pagerank[0], 0.097, 0.0005), top(g, m.pagerank, 4, 4))
  info(`karate club: degree ${top(g, m.degree, 4, 0)}; closeness ${top(g, m.closeness, 4)}; λ = ${f4(m.lambda)}`)
  info(`karate club, first under each measure: ${MEASURE_IDS.map((mid) => `${mid} ${named(g, first(m[mid]))}`).join('; ')}`)
  const corr = correlationMatrix(m)
  info(`karate club, Spearman: lowest ${f2(Math.min(...corr.flat()))}; degree–betweenness ${f2(corr[0][3])}; degree–eigenvector ${f2(corr[0][4])}; closeness–betweenness ${f2(corr[1][3])}`)

  // Katz between degree and eigenvector centrality.
  const G = undirected(g)
  const lambda = eigenvector(G).value
  const low = spearman(katzFraction(G, 0.001, lambda), m.degree)
  const high = spearman(katzFraction(G, 0.999, lambda), m.eigenvector)
  // Degree has many ties (eleven members have two links) and Katz, however
  // small α is, breaks them by the degrees of the neighbours: the rank
  // correlation stops at 0.979 and cannot reach 1. What does hold exactly is
  // that Katz never reverses two members with different degrees.
  const kz = katzFraction(G, 0.001, lambda)
  let reversed = 0
  for (let a = 0; a < g.n; a++) for (let b = 0; b < g.n; b++) if (m.degree[a] > m.degree[b] && kz[a] <= kz[b]) reversed++
  check('karate club: Katz at 0.001 of the limit ranks like degree (Spearman > 0.97, and no two members with different degrees are reversed)', low > 0.97 && reversed === 0, `${f4(low)}; reversed pairs ${reversed}`)
  check('karate club: Katz at 0.999 of the limit ranks like eigenvector centrality (Spearman > 0.999)', high > 0.999, f4(high))
  info(`karate club: Spearman Katz–degree and Katz–eigenvector at 0.1: ${f3(spearman(katzFraction(G, 0.1, lambda), m.degree))}, ${f3(spearman(katzFraction(G, 0.1, lambda), m.eigenvector))}; at 0.5: ${f3(spearman(katzFraction(G, 0.5, lambda), m.degree))}, ${f3(spearman(katzFraction(G, 0.5, lambda), m.eigenvector))}; at 0.9: ${f3(spearman(katzFraction(G, 0.9, lambda), m.degree))}, ${f3(spearman(katzFraction(G, 0.9, lambda), m.eigenvector))}; degree–eigenvector ${f3(spearman(m.degree, m.eigenvector))}`)
  // Katz really solves x = α A x + 1.
  const a = 0.5 / lambda
  const x = katz(G, a).raw
  let worst = 0
  for (let v = 0; v < g.n; v++) worst = Math.max(worst, Math.abs(x[v] - (1 + a * G.inn[v].reduce((s, u) => s + x[u], 0))))
  check('karate club: Katz scores satisfy x = αAx + 1 to 1e-9', worst < 1e-9, worst.toExponential(2))
}

// ---------------------------------------------------------------- Two groups and a bridge

{
  const g = GROUPS
  const m = allMeasures(g)
  const [a, b] = g.bridge
  const p = pieces(undirected(g))
  check('two groups: 20 nodes, 41 links, one piece', g.n === 20 && g.A.length === 41 && p.count === 1)
  const firstB = first(m.betweenness)
  const twoB = places(m.betweenness).order.slice(0, 2).sort((x, y) => x - y)
  check('two groups: the two ends of the bridge have the highest betweenness, and neither has the most links', twoB.join() === [a, b].sort((x, y) => x - y).join() && !first(m.degree).includes(a) && !first(m.degree).includes(b), `bridge ${g.names[a]}–${g.names[b]}: betweenness ${f3(m.betweenness[a])}, ${f3(m.betweenness[b])}; degrees ${m.degree[a]}, ${m.degree[b]}; most links: ${named(g, first(m.degree))} (${Math.max(...m.degree)})`)
  info(`two groups, first under each measure: ${MEASURE_IDS.map((mid) => `${mid} ${named(g, first(m[mid]))}`).join('; ')}`)
  info(`two groups: betweenness ${top(g, m.betweenness, 4)}; eigenvector ${top(g, m.eigenvector, 4)}; closeness ${top(g, m.closeness, 4)}; eigenvector of the bridge ends ${f3(m.eigenvector[a])}, ${f3(m.eigenvector[b])}; share of eigenvector score in the left group ${f3(Array.from(m.eigenvector).slice(0, 10).reduce((s, v) => s + v, 0) / m.eigenvector.reduce((s, v) => s + v, 0))}`)
  const corr = correlationMatrix(m)
  info(`two groups, Spearman: lowest ${f2(Math.min(...corr.flat()))}; degree–betweenness ${f2(corr[0][3])}; betweenness–eigenvector ${f2(corr[3][4])}; closeness–eigenvector ${f2(corr[1][4])}; degree–PageRank ${f2(corr[0][6])}`)
  void firstB
}

// ---------------------------------------------------------------- Exercises on paper

{
  // Exercise 1: a star with five leaves.
  const star = net('cabdef', [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5]])
  const G = undirected(star)
  const k = degree(G)
  const c = closeness(G)
  const b = normalized(betweenness(G), 6)
  check('Exercise 1: star with five leaves: centre 5, 1, 1; leaf 1, 5/9, 0', k[0] === 5 && near(c[0], 1, 1e-12) && near(b[0], 1, 1e-12) && k[1] === 1 && near(c[1], 5 / 9, 1e-12) && b[1] === 0, `centre ${k[0]}, ${f3(c[0])}, ${f3(b[0])}; leaf ${k[1]}, ${f3(c[1])}, ${f3(b[1])}`)
  const e = eigenvector(G)
  info(`star: eigenvector centre 1, leaf ${f4(e.vector[1])} (1/√5 = ${f4(1 / Math.sqrt(5))}), λ = ${f4(e.value)}; harmonic of a leaf ${f3(harmonic(G)[1])}`)
  check('star: the eigenvector iteration settles on a bipartite network (leaf score 1/√5, λ = √5)', e.converged && near(e.vector[1], 1 / Math.sqrt(5), 1e-9) && near(e.value, Math.sqrt(5), 1e-9))
}

{
  // Exercise 2: a path a–b–c–d–e.
  const path = net('abcde', [[0, 1], [1, 2], [2, 3], [3, 4]])
  const G = undirected(path)
  const b = betweenness(G)
  const c = closeness(G)
  check('Exercise 2: path of five: betweenness 0, 3, 4, 3, 0; closeness of c 2/3 and of a 0.4', Array.from(b).join(' ') === '0 3 4 3 0' && near(c[2], 2 / 3, 1e-12) && near(c[0], 0.4, 1e-12), `${Array.from(b).join(', ')}; ${f3(c[2])}, ${f3(c[0])}; normalised ${Array.from(normalized(b, 5)).map(f2).join(', ')}`)
}

{
  // Exercise 3: three pages. A → B, A → C, B → C, C → A.
  const three = net('ABC', [[0, 1], [0, 2], [1, 2], [2, 0]])
  const G = directed(three)
  const p1 = pagerank(G, 1).vector
  const p85 = pagerank(G, 0.85).vector
  check('Exercise 3: without jumps 0.4, 0.2, 0.4', near(p1[0], 0.4, 1e-9) && near(p1[1], 0.2, 1e-9) && near(p1[2], 0.4, 1e-9), Array.from(p1).map(f4).join(', '))
  check('Exercise 3: with α = 0.85: 0.388, 0.215, 0.397', near(p85[0], 0.388, 0.0005) && near(p85[1], 0.215, 0.0005) && near(p85[2], 0.397, 0.0005), Array.from(p85).map(f4).join(', '))
}

// ---------------------------------------------------------------- PageRank

{
  let ok = true
  let worst = 0
  const sums = []
  const presets = { kite: KITE, florence: FLORENCE, karate: KARATE, groups: GROUPS, six: SIX, 'web two-way': WEB, 'scale-free': FRAGILE.scaleFree(), 'small-world': FRAGILE.smallWorld() }
  for (const [name, g] of Object.entries(presets)) {
    const G = undirected(g)
    const p = pagerank(G, 1).vector
    const k = degree(G)
    for (let v = 0; v < g.n; v++) worst = Math.max(worst, Math.abs(p[v] - k[v] / (2 * g.A.length)))
    for (const alpha of [0, 0.3, 0.85, 1]) {
      const s = pagerank(G, alpha).vector.reduce((x, y) => x + y, 0)
      sums.push(s)
      if (Math.abs(s - 1) > 1e-9) ok = false
    }
    void name
  }
  for (const alpha of [0, 0.5, 0.85, 0.99, 1]) {
    const s = pagerank(directed(WEB), alpha).vector.reduce((x, y) => x + y, 0)
    sums.push(s)
    if (Math.abs(s - 1) > 1e-9) ok = false
  }
  check('undirected presets with α = 1: PageRank equals degree / 2L (to 1e-9)', worst < 1e-9, `largest gap ${worst.toExponential(2)} over ${Object.keys(presets).length} networks`)
  check('PageRank always sums to 1 (every preset, several α, directed and undirected)', ok, `${sums.length} cases, largest gap ${Math.max(...sums.map((s) => Math.abs(s - 1))).toExponential(2)}`)
}

// ---------------------------------------------------------------- The web of Panel B

{
  const g = WEB
  const G = directed(g)
  const v = (name) => id(g, name)
  const kin = inDegree(G)
  const { source, dangling, loop } = g.roles
  const loopOk = loop.every((x) => G.out[x].length === 1 && loop.includes(G.out[x][0]))
  const twoWay = new Set(Array.from(g.A, (a, e) => `${Math.min(a, g.B[e])}-${Math.max(a, g.B[e])}`)).size === g.A.length
  check('web: 12 pages, 21 links, a page nobody links to (F), a page with no outgoing links (H), a closed loop J → K → L → J, no pair linked both ways', g.n === 12 && g.A.length === 21 && kin[source] === 0 && G.out[dangling].length === 0 && loopOk && twoWay && g.names[source] === 'F' && g.names[dangling] === 'H')

  const p1 = pagerank(G, 1).vector
  const p85 = pagerank(G, 0.85).vector
  const outside = g.names.map((_, i) => i).filter((i) => !loop.includes(i))
  check('web, α = 1: the surfer ends up in the loop, a third on each page, and every page outside has PageRank 0', loop.every((x) => near(p1[x], 1 / 3, 1e-6)) && outside.every((x) => p1[x] < 1e-6), Array.from(p1).map((x, i) => `${g.names[i]} ${f3(x)}`).join(' '))
  info(`web, PageRank at 0.85: ${places(p85).order.map((x) => `${g.names[x]} ${f3(p85[x])}`).join(', ')}; loop total ${f3(loop.reduce((s, x) => s + p85[x], 0))}`)
  for (const alpha of [0, 0.5, 0.95, 0.99]) {
    const p = pagerank(G, alpha).vector
    info(`web, PageRank at ${alpha}: first ${top(g, p, 3)}; loop total ${f3(loop.reduce((s, x) => s + p[x], 0))}; F ${f4(p[source])}; H ${f4(p[dangling])}`)
  }
  info(`web, incoming links: ${g.names.map((name, i) => `${name} ${kin[i]}`).join(' ')}`)

  // The surfer.
  for (const alpha of [0.85, 0.5]) {
    const random = mulberry32(2024)
    const visits = new Float64Array(g.n)
    let at = 0
    const steps = 1e6
    for (let s = 0; s < steps; s++) {
      at = surf(G, at, alpha, random).next
      visits[at]++
    }
    const p = pagerank(G, alpha).vector
    let worst = 0
    for (let x = 0; x < g.n; x++) worst = Math.max(worst, Math.abs(visits[x] / steps - p[x]))
    check(`surfer, α = ${alpha}: after one million steps every visit share is within 0.005 of PageRank`, worst < 0.005, `largest gap ${worst.toFixed(5)}`)
  }
  {
    const random = mulberry32(7)
    const visits = new Float64Array(g.n)
    let at = 0
    let entered = -1
    for (let s = 0; s < 100000; s++) {
      at = surf(G, at, 1, random).next
      visits[at]++
      if (entered < 0 && loop.includes(at)) entered = s + 1
    }
    info(`surfer, α = 1, seed 7, from A: enters the loop at step ${entered}; share of 100,000 steps in the loop ${f4(loop.reduce((s, x) => s + visits[x], 0) / 100000)}`)
    let total = 0
    const R = 2000
    const rnd = mulberry32(11)
    for (let r = 0; r < R; r++) {
      let x = Math.floor(rnd() * g.n)
      let s = 0
      while (!loop.includes(x)) {
        x = surf(G, x, 1, rnd).next
        s++
      }
      total += s
    }
    info(`surfer, α = 1: steps before entering the loop from a random page, mean of ${R} runs: ${f2(total / R)}`)
  }

  // Hubs and authorities.
  const h = hits(G)
  const AtA = (x) => {
    const hub = Float64Array.from(G.out, (list) => list.reduce((s, y) => s + x[y], 0))
    return Float64Array.from(G.inn, (list) => list.reduce((s, y) => s + hub[y], 0))
  }
  const AAt = (x) => {
    const auth = Float64Array.from(G.inn, (list) => list.reduce((s, y) => s + x[y], 0))
    return Float64Array.from(G.out, (list) => list.reduce((s, y) => s + auth[y], 0))
  }
  const res = (M, x) => {
    const y = M(x)
    let worst = 0
    for (let i = 0; i < x.length; i++) worst = Math.max(worst, Math.abs(y[i] - h.value * x[i]))
    return worst
  }
  check('web: authority scores satisfy AᵀA a = λa and hub scores AAᵀ h = λh to 1e-9', h.converged && res(AtA, h.authority) < 1e-9 && res(AAt, h.hub) < 1e-9, `λ = ${f4(h.value)}, residuals ${res(AtA, h.authority).toExponential(2)}, ${res(AAt, h.hub).toExponential(2)}, ${h.iterations} rounds`)
  info(`web, authority: ${top(g, h.authority, 5)}; hub: ${top(g, h.hub, 5)}; hub of H ${f3(h.hub[dangling])}, authority of F ${f3(h.authority[source])}`)

  const e = eigenvector(G)
  const ev = toSum(e.vector)
  let worst = 0
  for (let x = 0; x < g.n; x++) worst = Math.max(worst, Math.abs(e.value * e.vector[x] - G.inn[x].reduce((s, u) => s + e.vector[u], 0)))
  check('web: eigenvector centrality satisfies Aᵀx = λx to 1e-9; F and G (reached only from F) score zero', e.converged && worst < 1e-9 && ev[source] < 1e-9 && ev[v('G')] < 1e-9, `λ = ${f4(e.value)}, ${e.iterations} rounds, residual ${worst.toExponential(2)}`)
  info(`web, eigenvector (sum 1): ${places(ev).order.map((x) => `${g.names[x]} ${f3(ev[x])}`).join(', ')}`)
  const kz = toSum(katzFraction(G, 0.5, e.value))
  info(`web, Katz at half the limit (sum 1): ${places(kz).order.map((x) => `${g.names[x]} ${f3(kz[x])}`).join(', ')}`)

  // Every link two-way.
  const U = undirected(g)
  const pu = pagerank(U, 1).vector
  const ku = degree(U)
  let gap = 0
  for (let x = 0; x < g.n; x++) gap = Math.max(gap, Math.abs(pu[x] - ku[x] / 42))
  check('web, every link two-way, α = 1: PageRank equals degree / 2L = degree / 42', gap < 1e-9, `largest gap ${gap.toExponential(2)}; first ${top(g, pu, 3, 4)}`)
  const pu85 = pagerank(U, 0.85).vector
  info(`web two-way: degrees ${g.names.map((name, i) => `${name} ${ku[i]}`).join(' ')}; PageRank at 0.85 first ${top(g, pu85, 3, 4)}, against degree/42 ${f4(ku[places(pu85).order[0]] / 42)}; Spearman with degree ${f3(spearman(pu85, ku))}`)
}

// ---------------------------------------------------------------- Figure "Scores from neighbours"

{
  const G = undirected(SIX)
  const target = eigenvector(G).vector
  let x = new Float64Array(6).fill(1)
  let settled = -1
  const trace = []
  for (let s = 1; s <= 200; s++) {
    x = neighbourStep(G, x)
    let gap = 0
    for (let v = 0; v < 6; v++) gap = Math.max(gap, Math.abs(x[v] - target[v]))
    if (s <= 3) trace.push(Array.from(x).map(f2).join(' '))
    if (settled < 0 && gap < 0.005) settled = s
  }
  let gap = 0
  for (let v = 0; v < 6; v++) gap = Math.max(gap, Math.abs(x[v] - target[v]))
  check('figure F2: on the six nodes the repeated sums settle on the eigenvector centrality', gap < 1e-9, `within 0.005 after ${settled} steps; limit ${Array.from(target).map(f3).join(' ')}; first steps ${trace.join(' | ')}`)
  info(`figure F2: degrees ${Array.from(degree(G)).join(' ')}; first under eigenvector ${named(SIX, first(target))}, λ = ${f4(eigenvector(G).value)}`)
}

// ---------------------------------------------------------------- Betweenness, two ways

{
  let worst = 0
  let disconnected = 0
  for (let i = 0; i < 50; i++) {
    const M = 25 + ((i * 7) % 60)
    const { A, B } = erdosRenyiGnm(30, M, 500 + i)
    const G = undirected({ n: 30, A, B })
    if (pieces(G).count > 1) disconnected++
    const fast = betweenness(G)
    const slow = betweennessBrute(G)
    for (let v = 0; v < 30; v++) worst = Math.max(worst, Math.abs(fast[v] - slow[v]))
  }
  check('betweenness: Brandes and the brute-force count agree to 1e-9 on 50 random networks of 30 nodes', worst < 1e-9, `largest gap ${worst.toExponential(2)}; ${disconnected} of the 50 in several pieces`)
}

// ---------------------------------------------------------------- Rankings

{
  const r = ranks([5, 3, 3, 1])
  const p = places([5, 3, 3, 1])
  check('ranks: ties share the average place (1, 2.5, 2.5, 4) and the written place (1, 2, 2, 4)', Array.from(r).join(' ') === '1 2.5 2.5 4' && Array.from(p.place).join(' ') === '1 2 2 4' && Array.from(p.tied).join('') === '0110')
  check('Spearman: 1 for the same order, −1 for the reverse, NaN when one list is all ties', near(spearman([1, 2, 3, 4], [10, 20, 30, 40]), 1, 1e-12) && near(spearman([1, 2, 3, 4], [4, 3, 2, 1]), -1, 1e-12) && Number.isNaN(spearman([1, 1, 1], [1, 2, 3])))
}

// ---------------------------------------------------------------- Panel C

{
  const sf = FRAGILE.scaleFree()
  const sw = FRAGILE.smallWorld()
  check('Panel C presets: scale-free N = 300 with 597 links, small-world N = 300 with 900 links, both in one piece', sf.A.length === 597 && sw.A.length === 900 && pieces(undirected(sf)).count === 1 && pieces(undirected(sw)).count === 1)
  const random = mulberry32(5)
  const d = dropLinks(sf, 0.2, random)
  const a = addLinks(sf, 0.2, random)
  const keys = new Set(Array.from(a.A, (x, e) => `${Math.min(x, a.B[e])}-${Math.max(x, a.B[e])}`))
  check('Panel C errors: 20% missing leaves 478 links, 20% spurious gives 716 distinct links', d.A.length === 597 - 119 && a.A.length === 597 + 119 && keys.size === a.A.length, `${d.A.length}, ${a.A.length}`)

  const table = (snap, key) => FRAGILE_MEASURES.map((mid) => `${mid} ${[0.05, 0.1, 0.2, 0.3, 0.5].map((x) => f2(snap.points.find((p) => near(p.x, x, 1e-9))[key][mid])).join(' ')}`).join(' | ')
  const results = {}
  for (const [name, g] of [['scale-free', sf], ['small-world', sw], ['karate', KARATE]]) {
    for (const errorId of ['missing', 'spurious']) {
      const snap = drain(fragilityJob(g, errorId))
      results[`${name}/${errorId}`] = snap
      info(`fragility, ${name}, ${errorId}, at 0.05 0.1 0.2 0.3 0.5 — Spearman: ${table(snap, 'spearman')}`)
      info(`fragility, ${name}, ${errorId}, at 0.05 0.1 0.2 0.3 0.5 — top-ten overlap: ${table(snap, 'overlap')}`)
      info(`fragility, ${name}, ${errorId}, at 0 — overlap: ${FRAGILE_MEASURES.map((mid) => `${mid} ${f2(snap.points[0].overlap[mid])}`).join(' ')}`)
    }
  }
  const zero = results['scale-free/missing'].points[0]
  check('Panel C: with no error every Spearman correlation is 1', FRAGILE_MEASURES.every((mid) => near(zero.spearman[mid], 1, 1e-9)) && FRACTIONS[0] === 0)

  // ---- Numbers quoted on the page (lecture, "what to observe", exercises).
  // Compared as the panel prints them, to two decimals.
  const at = (key, x, field, mid) => f2(results[key].points.find((p) => near(p.x, x, 1e-9))[field][mid])
  const row = (key, x, field) => FRAGILE_MEASURES.map((mid) => at(key, x, field, mid)).join(' ')
  const q = (name, got, want) => check(`quoted on the page — ${name}`, got === want, got)
  // Order: degree closeness betweenness eigenvector pagerank.
  q('fragility 1, lecture, Exercise 6: scale-free, missing, 0.2: Spearman', row('scale-free/missing', 0.2, 'spearman'), '0.84 0.78 0.78 0.77 0.85')
  q('fragility 1, lecture, Exercise 6: scale-free, missing, 0.2: top ten', row('scale-free/missing', 0.2, 'overlap'), '0.93 0.82 0.92 0.81 0.93')
  q('fragility 2: scale-free, spurious, 0.2: Spearman', row('scale-free/spurious', 0.2, 'spearman'), '0.82 0.93 0.85 0.94 0.82')
  q('fragility 2: scale-free, spurious, 0.2: betweenness keeps 0.99 of its top ten', at('scale-free/spurious', 0.2, 'overlap', 'betweenness'), '0.99')
  q('fragility 3, lecture: small-world, missing, 0.2: Spearman', row('small-world/missing', 0.2, 'spearman'), '0.48 0.72 0.74 0.36 0.46')
  q('fragility 3, lecture: small-world, missing, 0.2: top ten', row('small-world/missing', 0.2, 'overlap'), '0.41 0.46 0.49 0.17 0.36')
  q('fragility 4: small-world, no error: top ten by degree agrees with itself at 0.82', at('small-world/missing', 0, 'overlap', 'degree'), '0.82')
  q('fragility 5: small-world, closeness at 0.1: 0.55 with spurious links, 0.84 with missing links', `${at('small-world/spurious', 0.1, 'spearman', 'closeness')} ${at('small-world/missing', 0.1, 'spearman', 'closeness')}`, '0.55 0.84')
  q('fragility 6: karate, missing: degree, PageRank, eigenvector at 0.2 and at 0.5', ['degree', 'pagerank', 'eigenvector'].map((mid) => `${at('karate/missing', 0.2, 'spearman', mid)} ${at('karate/missing', 0.5, 'spearman', mid)}`).join(' | '), '0.90 0.75 | 0.90 0.76 | 0.83 0.62')
}

// ---------------------------------------------------------------- More numbers quoted on the page

{
  const q = (name, cond, detail = '') => check(`quoted on the page — ${name}`, cond, detail)
  const place = (g, values, name) => {
    const p = places(values)
    const v = id(g, name)
    return `${p.place[v]}${p.tied[v] ? '=' : ''}`
  }
  const without = (g, names, cut = []) => {
    const keep = g.names.map((_, i) => i).filter((i) => !names.includes(g.names[i]))
    const map = new Map(keep.map((old, i) => [old, i]))
    const pairs = []
    for (let e = 0; e < g.A.length; e++) {
      const a = g.names[g.A[e]]
      const b = g.names[g.B[e]]
      if (cut.some(([x, y]) => (a === x && b === y) || (a === y && b === x))) continue
      if (map.has(g.A[e]) && map.has(g.B[e])) pairs.push([map.get(g.A[e]), map.get(g.B[e])])
    }
    return net(keep.map((i) => g.names[i]), pairs)
  }

  // Rankings 1 and 2: Florence.
  let m = allMeasures(FLORENCE)
  const second = (mid) => FLORENCE.names[places(m[mid]).order[1]]
  q('rankings 1: Florence: second are the Guadagni (betweenness 0.255), the Ridolfi (closeness), the Strozzi (eigenvector); Strozzi 2= for degree, 2 for eigenvector, 7 for betweenness', second('betweenness') === 'Guadagni' && second('closeness') === 'Ridolfi' && second('eigenvector') === 'Strozzi' && place(FLORENCE, m.degree, 'Strozzi') === '2=' && place(FLORENCE, m.eigenvector, 'Strozzi') === '2' && place(FLORENCE, m.betweenness, 'Strozzi') === '7')
  const GF = undirected(FLORENCE)
  const sp = shortestPaths(GF, id(FLORENCE, 'Albizzi'), id(FLORENCE, 'Tornabuoni'))
  const via = (name) => sp.paths.filter((p) => p.includes(id(FLORENCE, name))).length
  let all = true
  for (let v = 0; v < FLORENCE.n; v++) {
    if (v === id(FLORENCE, 'Acciaiuoli') || v === id(FLORENCE, 'Medici')) continue
    const s = shortestPaths(GF, id(FLORENCE, 'Acciaiuoli'), v)
    if (!s.paths.every((p) => p.includes(id(FLORENCE, 'Medici')))) all = false
  }
  q('rankings 2: Albizzi to Tornabuoni: two shortest paths, one through the Medici and one through the Guadagni; every path from the Acciaiuoli passes through the Medici; 91 pairs', sp.count === 2 && via('Medici') === 1 && via('Guadagni') === 1 && all && pairsOfOthers(15) === 91)
  q('lecture and Exercise 4: Medici degree 6, Strozzi and Guadagni 4; closeness 0.560, harmonic 0.679, betweenness 0.522, PageRank 0.146; Guadagni 25%, Strozzi 10%', m.degree[id(FLORENCE, 'Medici')] === 6 && m.degree[id(FLORENCE, 'Strozzi')] === 4 && m.degree[id(FLORENCE, 'Guadagni')] === 4 && f3(m.harmonic[id(FLORENCE, 'Medici')]) === '0.679' && f3(m.pagerank[id(FLORENCE, 'Medici')]) === '0.146' && f2(m.betweenness[id(FLORENCE, 'Guadagni')]) === '0.25' && f2(m.betweenness[id(FLORENCE, 'Strozzi')]) === '0.10')
  const m1 = allMeasures(FLORENCE, { damping: 1 })
  q('rankings 7: Florence, PageRank slider at 1: Medici 0.150 = 6/40, correlation with degree 1.00', f3(m1.pagerank[id(FLORENCE, 'Medici')]) === '0.150' && near(spearman(m1.pagerank, m1.degree), 1, 1e-9))
  const noMedici = without(FLORENCE, ['Medici'])
  const m2 = allMeasures(noMedici)
  const firstOf = (g, values) => named(g, first(values))
  q('Exercise 4: without the Medici: six links gone; betweenness Guadagni 0.314, Bischeri 0.212, Strozzi 0.147; degree Guadagni = Strozzi (4); closeness Bischeri = Guadagni; PageRank and harmonic Guadagni; eigenvector and Katz Strozzi; eigenvector 0 for Acciaiuoli, Pazzi, Salviati', FLORENCE.A.length - noMedici.A.length === 6 && f3(m2.betweenness[id(noMedici, 'Guadagni')]) === '0.314' && f3(m2.betweenness[id(noMedici, 'Bischeri')]) === '0.212' && f3(m2.betweenness[id(noMedici, 'Strozzi')]) === '0.147' && firstOf(noMedici, m2.degree) === 'Guadagni = Strozzi' && firstOf(noMedici, m2.closeness) === 'Bischeri = Guadagni' && firstOf(noMedici, m2.pagerank) === 'Guadagni' && firstOf(noMedici, m2.harmonic) === 'Guadagni' && firstOf(noMedici, m2.eigenvector) === 'Strozzi' && firstOf(noMedici, m2.katz) === 'Strozzi' && ['Acciaiuoli', 'Pazzi', 'Salviati'].every((x) => m2.eigenvector[id(noMedici, x)] < 1e-9))

  // Rankings 3: the kite.
  m = allMeasures(KITE)
  let corr = correlationMatrix(m)
  q('rankings 3: kite: Heather 6= for degree and 8 for eigenvector; Spearman betweenness–eigenvector 0.31, degree–eigenvector 0.99', place(KITE, m.degree, 'Heather') === '6=' && place(KITE, m.eigenvector, 'Heather') === '8' && f2(corr[3][4]) === '0.31' && f2(corr[0][4]) === '0.99')

  // Rankings 4 and 5: karate club.
  m = allMeasures(KARATE)
  q('rankings 4: karate: member 34 has 17 links and member 1 has 16; 34 leads eigenvector and PageRank, 1 leads closeness and betweenness', m.degree[33] === 17 && m.degree[0] === 16 && firstOf(KARATE, m.eigenvector) === '34' && firstOf(KARATE, m.pagerank) === '34' && firstOf(KARATE, m.closeness) === '1' && firstOf(KARATE, m.betweenness) === '1')
  const lo = allMeasures(KARATE, { katzFrac: 0.01 })
  const hi = allMeasures(KARATE, { katzFrac: 0.99 })
  const pair = (mm) => `${f2(spearman(mm.katz, mm.degree))} ${f2(spearman(mm.katz, mm.eigenvector))}`
  q('rankings 5: karate, Katz at 0.01: 0.98 with degree, 0.84 with eigenvector; at 0.99: 0.78 and 1.00; third place goes from member 33 to member 3', pair(lo) === '0.98 0.84' && pair(hi) === '0.78 1.00' && KARATE.names[places(lo.katz).order[2]] === '33' && KARATE.names[places(hi.katz).order[2]] === '3', `${pair(lo)} | ${pair(hi)}`)

  // Rankings 6: two groups.
  m = allMeasures(GROUPS)
  const share = Array.from(m.eigenvector).slice(0, 10).reduce((s, v) => s + v, 0) / m.eigenvector.reduce((s, v) => s + v, 0)
  const cut = allMeasures(without(GROUPS, [], [['b', 'l']]))
  q('rankings 6: two groups: bridge b–l, betweenness 0.53 for both, first for closeness, 2 and 4 links, b 19= for degree; left group has 94% of the eigenvector score; without the bridge the right group has 0', GROUPS.names[GROUPS.bridge[0]] === 'b' && GROUPS.names[GROUPS.bridge[1]] === 'l' && f2(m.betweenness[id(GROUPS, 'b')]) === '0.53' && f2(m.betweenness[id(GROUPS, 'l')]) === '0.53' && firstOf(GROUPS, m.closeness) === 'b = l' && m.degree[id(GROUPS, 'b')] === 2 && m.degree[id(GROUPS, 'l')] === 4 && place(GROUPS, m.degree, 'b') === '19=' && f2(share) === '0.94' && Array.from(cut.eigenvector).slice(10).every((v) => v < 1e-9), f3(share))

  // The surfer, exactly as the panel runs it: seed 2024, from page A.
  const run = (G, alpha, steps) => {
    const random = mulberry32(2024)
    const visits = new Float64Array(WEB.n)
    let at = 0
    let entered = -1
    const marks = {}
    for (let s = 1; s <= steps; s++) {
      at = surf(G, at, alpha, random).next
      visits[at]++
      if (entered < 0 && WEB.roles.loop.includes(at)) entered = s
      if (s === 1000 || s === 100000) marks[s] = WEB.roles.loop.reduce((x, v) => x + visits[v], 0) / s
    }
    return { entered, marks }
  }
  const D = directed(WEB)
  const r85 = run(D, 0.85, 100000)
  const r1 = run(D, 1, 1000)
  const p85 = pagerank(D, 0.85).vector
  const loopTotal = WEB.roles.loop.reduce((s, v) => s + p85[v], 0)
  q('surfer 1: α = 0.85: the loop has 39% of the visits after 1,000 steps and 44.1% after 100,000; exact 0.441', f2(r85.marks[1000]) === '0.39' && f3(r85.marks[100000]) === '0.441' && f3(loopTotal) === '0.441', `${f3(r85.marks[1000])}, ${f3(r85.marks[100000])}, ${f3(loopTotal)}`)
  q('surfer 2 and Exercise 5: α = 0.85: J 0.154, K 0.147, L 0.141, then D 0.093; A, B and D have three incoming links, J two, K and L one', places(p85).order.slice(0, 4).map((v) => `${WEB.names[v]} ${f3(p85[v])}`).join(', ') === 'J 0.154, K 0.147, L 0.141, D 0.093' && ['A', 'B', 'D'].every((x) => D.inn[id(WEB, x)].length === 3) && D.inn[id(WEB, 'J')].length === 2 && D.inn[id(WEB, 'K')].length === 1 && D.inn[id(WEB, 'L')].length === 1)
  q('surfer 3 and Exercise 5: α = 1: the surfer enters the loop at step 93; the only way in is from I', r1.entered === 93 && WEB.roles.loop.flatMap((v) => D.inn[v]).filter((u) => !WEB.roles.loop.includes(u)).map((u) => WEB.names[u]).join() === 'I', `step ${r1.entered}`)
  q('surfer 4: α = 0: every page 1/12', Array.from(pagerank(D, 0).vector).every((v) => near(v, 1 / 12, 1e-12)))
  const h = hits(D)
  const ev = toSum(eigenvector(D).vector)
  const kz = toSum(katzFraction(D, 0.5))
  const firstTwoAuth = places(h.authority).order.slice(0, 2).map((v) => WEB.names[v]).join()
  q('surfer 5: F has the lowest PageRank (0.016), eigenvector 0 like G, and the best hub score (0.201); A and B are the best authorities; H has hub 0 and authority 0.115; Katz gives nobody zero', WEB.names[places(p85).order[11]] === 'F' && f3(p85[id(WEB, 'F')]) === '0.016' && ev[id(WEB, 'F')] < 1e-9 && ev[id(WEB, 'G')] < 1e-9 && firstOf(WEB, h.hub) === 'F' && f3(h.hub[id(WEB, 'F')]) === '0.201' && firstTwoAuth === 'A,B' && h.hub[id(WEB, 'H')] === 0 && f3(h.authority[id(WEB, 'H')]) === '0.115' && Math.min(...kz) > 0.04)
  const U = undirected(WEB)
  const pu = pagerank(U, 1).vector
  q('surfer 6: two-way, α = 1: 0.119 for A, B, D and E with five links each; the loop has 7 of the 42 link ends', ['A', 'B', 'D', 'E'].every((x) => f3(pu[id(WEB, x)]) === '0.119' && U.out[id(WEB, x)].length === 5) && WEB.roles.loop.reduce((s, v) => s + U.out[v].length, 0) === 7)
  q('lecture: six-node figure and Katz claims are covered above; a jump every six or seven steps at α = 0.85', near(1 / 0.15, 6.67, 0.01))
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
