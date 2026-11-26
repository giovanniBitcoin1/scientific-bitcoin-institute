// Self-checks for Game Theory Lab module 09, "Games on networks". They run
// the same code as the page (netgames.js, publicgoods.js, keyplayer.js,
// connections.js) and compare it with closed forms, independent
// computations (best responses against formulas, removals against
// intercentralities, brute force over every network) and the numbers the
// texts quote.
//
//   node scripts/lab/check-game-theory-09.mjs
//
// Exits with code 1 if any check fails. Rerun it whenever those files, the
// defaults, the seeds or the texts change. Lines starting with INFO report
// numbers that are not checked (other seeds, timings).
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const M = '../../src/components/lab/game-theory/games-on-networks/'
const G = await import(M + 'netgames.js')
const P = await import(M + 'publicgoods.js')
const K = await import(M + 'keyplayer.js')
const C = await import(M + 'connections.js')

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (rel) => readFileSync(resolve(root, rel), 'utf8')

let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const info = (text) => console.log(`INFO  ${text}`)
const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol
const f2 = (x) => x.toFixed(2)
const f4 = (x) => x.toFixed(4)
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const time = (fn) => {
  const t0 = performance.now()
  const r = fn()
  return [r, performance.now() - t0]
}
const net = (k) => G.NETWORKS[k].make()
const plus1 = (s) => s.map((i) => i + 1)

// ------------------------------------------------------------------ linear algebra

console.log('— Linear algebra')
{
  const ring = (n) => Array.from({ length: n }, (_, k) => 2 * Math.cos((2 * Math.PI * k) / n)).sort((a, b) => a - b)
  check('Jacobi: the ring of 6 has eigenvalues 2 cos(2πk/6)', G.eigenvalues(net('ring6').adj).every((v, i) => close(v, ring(6)[i], 1e-10)))
  check('Jacobi: the line of 5 has eigenvalues 2 cos(kπ/6), k = 1..5', same(G.eigenvalues(net('line5').adj).map((v) => f4(Math.abs(v) < 1e-12 ? 0 : v)), [5, 4, 3, 2, 1].map((k) => f4(k === 3 ? 0 : 2 * Math.cos((k * Math.PI) / 6)))))
  check('Jacobi: the star of 6 has ±√5 and four zeros', same(G.eigenvalues(net('star6').adj).map((v) => f4(Math.abs(v) < 1e-12 ? 0 : v)), [f4(-Math.sqrt(5)), '0.0000', '0.0000', '0.0000', '0.0000', f4(Math.sqrt(5))]))
  check('Jacobi: the eigenvalues of every preset sum to 0 (the trace) and their squares to twice the links', Object.keys(G.NETWORKS).every((k) => {
    const g = net(k)
    const ev = G.eigenvalues(g.adj)
    return close(ev.reduce((s, v) => s + v, 0), 0, 1e-10) && close(ev.reduce((s, v) => s + v * v, 0), 2 * g.edges.length, 1e-9)
  }))
  check('λ_max by power iteration agrees with Jacobi on every preset', Object.keys(G.NETWORKS).every((k) => {
    const g = net(k)
    let v = new Array(g.n).fill(1)
    let lam = 0
    for (let t = 0; t < 5000; t++) {
      // A + I, so that bipartite networks (±λ) do not oscillate
      const w = g.adj.map((r, i) => r.reduce((s, a, j) => s + a * v[j], 0) + v[i])
      const nrm = Math.hypot(...w)
      v = w.map((x) => x / nrm)
      lam = nrm
    }
    return close(lam - 1, G.lambdaMax(g), 1e-8)
  }))
  check('Gauss–Jordan: (I − 0.3 G) times its inverse is the identity on the bridge network (1e-12)', (() => {
    const g = G.bridge()
    const A = g.adj.map((r, i) => r.map((v, j) => (i === j ? 1 : 0) - 0.3 * v))
    const Mi = G.inverse(A)
    return A.every((r, i) => r.every((_, j) => close(r.reduce((s, a, k) => s + a * Mi[k][j], 0), i === j ? 1 : 0, 1e-12)))
  })())
}

// ------------------------------------------------------------------ F1

console.log('— F1: complements and substitutes on a star')
const star5 = net('star5')
{
  const want = {
    '-0.45': [0, 1, 4], '-0.4': [0, 1, 4], '-0.3': [0, 1, 4], '-0.25': [0, 1, 4],
    '-0.2': [0.2381, 0.9524, 4.0476], '-0.1': [0.625, 0.9375, 4.375], 0: [1, 1, 5], 0.1: [1.4583, 1.1458, 6.0417],
    0.2: [2.1429, 1.4286, 7.8571], 0.25: [2.6667, 1.6667, 9.3333], 0.3: [3.4375, 2.0313, 11.5625], 0.4: [7.2222, 3.8889, 22.7778], 0.45: [14.7368, 7.6316, 45.2632],
  }
  const got = Object.keys(want).map((d) => {
    const f = G.starFormula(Number(d))
    return [f.hub, f.leaf, f.total].map(f4).join(' ')
  })
  check('hub, leaf, total at δ = −0.45, −0.4, −0.3, −0.25, −0.2, −0.1, 0, 0.1, 0.2, 0.25, 0.3, 0.4, 0.45', same(got, Object.values(want).map((v) => v.map(f4).join(' '))), got.join(' | '))
  info('δ = 0.3: the leaf works 1.3/0.64 = 2.03125 exactly; toFixed(4) writes 2.0313 (the prompt wrote 2.0312)')
  check('every δ from −0.45 to 0.45 on the slider (step 0.01): best responses in turn from zero agree with the formulas to 1e-9', (() => {
    for (let k = -45; k <= 45; k++) {
      const d = k / 100
      const f = G.starFormula(d)
      const br = G.bestResponses(star5, d)
      if (!br.ended || !close(br.x[0], f.hub) || br.x.slice(1).some((v) => !close(v, f.leaf))) return false
      if (G.equilibriumGap(star5, d, [f.hub, f.leaf, f.leaf, f.leaf, f.leaf]) > 1e-9) return false
    }
    return true
  })())
  check('  and from random starts (seeds 1–20, efforts uniform on [0, 3]) at δ = −0.4, −0.2, 0.25, 0.45', [-0.4, -0.2, 0.25, 0.45].every((d) => {
    const f = G.starFormula(d)
    for (let s = 1; s <= 20; s++) {
      const x0 = P.randomStart(star5, s).map((v) => 3 * v)
      const br = G.bestResponses(star5, d, x0)
      if (!close(br.x[0], f.hub) || br.x.slice(1).some((v) => !close(v, f.leaf))) return false
    }
    return true
  }))
  check('the regimes: complements above 0, none at 0, substitutes from −0.24 to −0.01, the hub stops from −0.25 down', G.starFormula(0.25).regime === 'complements' && G.starFormula(0).regime === 'none' && G.starFormula(-0.24).regime === 'substitutes' && G.starFormula(-0.01).regime === 'substitutes' && [-0.25, -0.3, -0.45].every((d) => G.starFormula(d).regime === 'hubstops'))
  check('the star\'s eigenvalues are −2, 0, 0, 0, 2 (so ±0.5 are the limits)', same(G.eigenvalues(star5.adj).map((v) => (Math.abs(v) < 1e-12 ? 0 : v)).map(f4), ['-2.0000', '0.0000', '0.0000', '0.0000', '2.0000']))
  check('with complements the hub works more than a leaf, with substitutes less (δ ≠ 0 on the slider)', (() => {
    for (let k = -45; k <= 45; k++) {
      if (k === 0) continue
      const f = G.starFormula(k / 100)
      if (k > 0 ? !(f.hub > f.leaf) : !(f.hub < f.leaf)) return false
    }
    return true
  })())
  check('exercise 1: 8/3 and 5/3 at δ = 0.25; 0 and 1 at δ = −0.25', close(G.starFormula(0.25).hub, 8 / 3) && close(G.starFormula(0.25).leaf, 5 / 3) && G.starFormula(-0.25).hub === 0 && G.starFormula(-0.25).leaf === 1)
}

// ------------------------------------------------------------------ Panel A

console.log('— Panel A: who does the work?')
{
  const sets = (k) => P.specializedEquilibria(net(k))
  const show = (k) => sets(k).map((e) => `${P.setKey(e.set)}${e.stable ? '*' : ''}`).join(' ')
  const line = sets('line5')
  const st = sets('star6')
  const ring = sets('ring6')
  const gr = sets('grid3')
  check('line of 5: 4 sets, sizes 3, 2, 2, 2; stable {1, 3, 5}', line.length === 4 && same(line.map((e) => e.total), [3, 2, 2, 2]) && same(line.filter((e) => e.stable).map((e) => plus1(e.set)), [[1, 3, 5]]), show('line5'))
  check('  they are {1, 3, 5}, {1, 4}, {2, 4}, {2, 5} (exercise 2)', same(line.map((e) => plus1(e.set)), [[1, 3, 5], [1, 4], [2, 4], [2, 5]]))
  check('star of 6: 2 sets, sizes 5 and 1; stable {2, …, 6}', st.length === 2 && same(st.map((e) => e.total), [5, 1]) && same(st.filter((e) => e.stable).map((e) => plus1(e.set)), [[2, 3, 4, 5, 6]]), show('star6'))
  check('ring of 6: 5 sets, sizes 3, 3, 2, 2, 2; stable {1, 3, 5} and {2, 4, 6}; the opposite pairs are not', ring.length === 5 && same(ring.map((e) => e.total), [3, 3, 2, 2, 2]) && same(ring.filter((e) => e.stable).map((e) => plus1(e.set)), [[1, 3, 5], [2, 4, 6]]) && same(ring.filter((e) => !e.stable).map((e) => plus1(e.set)), [[1, 4], [2, 5], [3, 6]]), show('ring6'))
  check('grid: 10 sets, one of 5, one of 4, eight of 3; stable {1, 3, 5, 7, 9} and {2, 4, 6, 8}', gr.length === 10 && same(gr.map((e) => e.total), [5, 4, 3, 3, 3, 3, 3, 3, 3, 3]) && same(gr.filter((e) => e.stable).map((e) => plus1(e.set)), [[1, 3, 5, 7, 9], [2, 4, 6, 8]]), show('grid3'))
  check('every maximal independent set is an equilibrium of x_i = max(0, 1 − Σ x_j), and no other 0/1 profile is (all 2^n profiles)', ['line5', 'star6', 'ring6', 'grid3'].every((k) => {
    const g = net(k)
    const keys = new Set(sets(k).map((e) => e.set.join(',')))
    for (let s = 0; s < 1 << g.n; s++) {
      const x = Array.from({ length: g.n }, (_, i) => (s >> i) & 1)
      const isEq = G.equilibriumGap(g, -1, x) <= 1e-12
      const set = x.map((v, i) => (v ? i : -1)).filter((i) => i >= 0).join(',')
      if (isEq !== keys.has(set)) return false
    }
    return true
  }))
  check('stability by its definition (every non-worker has two working neighbours) agrees with a perturbation test: after a small push (±0.01 on every effort, 50 seeded pushes) best responses come back exactly (1e-9) to a stable set, and not always to an unstable one', ['line5', 'star6', 'ring6', 'grid3'].every((k) => {
    const g = net(k)
    return sets(k).every((e) => {
      let back = true
      for (let s = 1; s <= 50; s++) {
        const rnd = P.randomStart(g, 1000 + s)
        const x0 = P.effortsOf(g, e.set).map((v, i) => Math.max(0, v + 0.02 * (rnd[i] - 0.5)))
        const br = G.bestResponses(g, -1, x0, 1e-13)
        if (G.equilibriumGap(g, -1, br.x) > 1e-9) return false
        const dist = Math.max(...br.x.map((v, i) => Math.abs(v - P.effortsOf(g, e.set)[i])))
        if (dist > 1e-9) back = false
      }
      return back === e.stable
    })
  }))
  const tally = (k, runs = 20) => {
    const g = net(k)
    const t = {}
    let allEq = true
    let maxTurns = 0
    for (let r = 1; r <= runs; r++) {
      const run = P.bestResponseRun(g, r)
      if (!run.equilibrium) allEq = false
      maxTurns = Math.max(maxTurns, run.turns)
      const key = P.setKey(run.workers)
      t[key] = (t[key] || 0) + 1
    }
    return { t, allEq, maxTurns }
  }
  const T = Object.fromEntries(['line5', 'star6', 'ring6', 'grid3'].map((k) => [k, tally(k)]))
  check('every "Best responses" run (1 to 20, four networks) ends at an equilibrium within 1e-9', Object.values(T).every((x) => x.allEq))
  check('runs 1 to 20: the star always ends at {2, 3, 4, 5, 6}', same(T.star6.t, { '{2, 3, 4, 5, 6}': 20 }), JSON.stringify(T.star6.t))
  check('runs 1 to 20: the ring always at one of its two stable sets (9 and 11 times)', same(T.ring6.t, { '{1, 3, 5}': 9, '{2, 4, 6}': 11 }), JSON.stringify(T.ring6.t))
  check('runs 1 to 20: the line at {1, 3, 5} 19 times, once not specialized', same(T.line5.t, { '{1, 3, 5}': 19, 'not specialized': 1 }), JSON.stringify(T.line5.t))
  check('runs 1 to 20: the grid at {1, 3, 5, 7, 9} 17 times, 3 times not specialized', same(T.grid3.t, { '{1, 3, 5, 7, 9}': 17, 'not specialized': 3 }), JSON.stringify(T.grid3.t))
  info(`the prompt expected the line 17 + 3 and the grid 13 / 2 / 5: different generator. Turns needed at most: ${Object.entries(T).map(([k, v]) => `${k} ${v.maxTurns}`).join(', ')}`)
  for (const k of ['line5', 'ring6', 'grid3']) {
    const x = tally(k, 200)
    info(`runs 1 to 200, ${k}: ${JSON.stringify(x.t)}; all equilibria: ${x.allEq}`)
  }
  {
    const g = net('line5')
    const r = [...Array(20)].map((_, i) => P.bestResponseRun(g, i + 1)).find((x) => !x.specialized)
    info(`the line's first non-specialized end: ${r.x.map((v) => v.toFixed(4)).join(', ')} (total ${r.total.toFixed(4)})`)
  }
  check('a non-specialized end is never marked stable', ['line5', 'grid3'].every((k) => [...Array(20)].every((_, i) => {
    const r = P.bestResponseRun(net(k), i + 1)
    return r.specialized || !r.stable
  })))
  const [, ms] = time(() => {
    for (let r = 1; r <= 100; r++) P.bestResponseRun(net('grid3'), r)
  })
  info(`Panel A: 100 runs of "Best responses" on the grid in ${ms.toFixed(1)} ms`)
}

// ------------------------------------------------------------------ Panel B

console.log('— Panel B: the key player')
{
  const b = G.bridge()
  check('bridge: λ_max 2.3475, 1/λ_max 0.4260, the slider ends at 0.42', f4(G.lambdaMax(b)) === '2.3475' && f4(1 / G.lambdaMax(b)) === '0.4260' && K.sliderMax(b) === 0.42)
  const eff = {
    0.1: ['1.3933, 1.2659, 1.2659, 1.4013, 1.3675, 1.2527, 1.1367, 1.1367, 1.1253', '11.3454'],
    0.2: ['2.1486, 1.7872, 1.7872, 2.1687, 1.9932, 1.7018, 1.3986, 1.3986, 1.3404', '15.7243'],
    0.3: ['4.1655, 3.2138, 3.2138, 4.1241, 3.4600, 2.7882, 2.0380, 2.0380, 1.8365', '26.8779'],
  }
  for (const [d, [e, t]] of Object.entries(eff)) {
    const a = K.analyse(b, Number(d))
    check(`bridge, δ = ${d}: efforts and total`, a.b.map(f4).join(', ') === e && f4(a.total) === t, `${a.b.map(f4).join(', ')}; ${f4(a.total)}`)
  }
  const a3 = K.analyse(b, 0.3)
  const a1 = K.analyse(b, 0.1)
  check('bridge, δ = 0.3: intercentralities 10.9163, 7.4260, 7.4260, 11.3988, 8.4355, 6.1645, 3.6831, 3.6831, 3.0288', a3.inter.map(f4).join(', ') === '10.9163, 7.4260, 7.4260, 11.3988, 8.4355, 6.1645, 3.6831, 3.6831, 3.0288', a3.inter.map(f4).join(', '))
  check('bridge, δ = 0.3: player 1 most active, player 4 the key player; δ = 0.1: player 4 both (1.9038 against 1.8784 for player 1)', a3.mostActive === 0 && a3.key === 3 && a1.mostActive === 3 && a1.key === 3 && f4(a1.inter[3]) === '1.9038' && f4(a1.inter[0]) === '1.8784')
  check('every removal on every preset at every δ of its slider: the drop equals b_i²/m_ii (1e-9)', ['bridge', 'line5', 'star6', 'ring6'].every((k) => {
    const g = net(k)
    for (let s = 1; s <= Math.round(K.sliderMax(g) * 100); s++) {
      const d = s / 100
      const a = K.analyse(g, d)
      for (let i = 0; i < g.n; i++) if (!close(a.total - K.totalWithout(g, d, i), a.inter[i])) return false
    }
    return true
  }))
  check('the equilibrium x = (I − δG)⁻¹ 1 is the end of best responses from zero (bridge, every δ of the slider, 1e-9)', (() => {
    for (let s = 1; s <= 42; s++) {
      const d = s / 100
      const br = G.bestResponses(b, d)
      if (br.x.some((v, i) => !close(v, K.analyse(b, d).b[i]))) return false
    }
    return true
  })())
  check('the efforts equal Σ_k δ^k (G^k 1), the Katz–Bonacich sum, to 1e-9 (bridge, δ = 0.3)', (() => {
    let walk = new Array(9).fill(1)
    const sum = walk.slice()
    for (let k = 1; k < 2000; k++) {
      walk = b.adj.map((r) => 0.3 * r.reduce((s, v, j) => s + v * walk[j], 0))
      walk.forEach((v, i) => (sum[i] += v))
    }
    return sum.every((v, i) => close(v, a3.b[i]))
  })())
  const keys = new Set()
  const most = []
  for (let s = 1; s <= 42; s++) {
    const a = K.analyse(b, s / 100)
    keys.add(a.key + 1)
    most.push(a.mostActive + 1)
  }
  const cross = K.crossing(b, 0, 3, 0.1, 0.3)
  check('the key player is player 4 at every δ on the slider; the most active is 4 up to 0.26 and 1 from 0.27; they cross at δ = 0.2696', same([...keys], [4]) && most.slice(0, 26).every((x) => x === 4) && most.slice(26).every((x) => x === 1) && f4(cross) === '0.2696', `cross ${cross}`)
  {
    const g = net('line5')
    const a = K.analyse(g, 0.3)
    check('line of 5: λ_max 1.7321; δ = 0.3: 1.6575, 2.1918, 2.3151, 2.1918, 1.6575 (10.0137); key player 3 (4.2994)', f4(G.lambdaMax(g)) === '1.7321' && a.b.map(f4).join(', ') === '1.6575, 2.1918, 2.3151, 2.1918, 1.6575' && f4(a.total) === '10.0137' && a.key === 2 && f4(a.inter[2]) === '4.2994')
  }
  {
    const g = net('star6')
    const a = K.analyse(g, 0.3)
    check('star of 6: λ_max 2.2361; δ = 0.3: hub 4.5455, leaves 2.3636 (16.3636); key player the hub (11.3636)', f4(G.lambdaMax(g)) === '2.2361' && f4(a.b[0]) === '4.5455' && a.b.slice(1).every((v) => f4(v) === '2.3636') && f4(a.total) === '16.3636' && a.key === 0 && f4(a.inter[0]) === '11.3636')
  }
  {
    const g = net('ring6')
    const a = K.analyse(g, 0.3)
    check('ring of 6: λ_max 2; δ = 0.3: 2.5 each (15), intercentrality 4.9863 each; ties ranked by number, 1 to 6, at every δ of the slider', f4(G.lambdaMax(g)) === '2.0000' && a.b.every((v) => close(v, 2.5)) && close(a.total, 15) && a.inter.every((v) => f4(v) === '4.9863') && [...Array(49)].every((_, k) => { const x = K.analyse(g, (k + 1) / 100); return same(x.byInter, [0, 1, 2, 3, 4, 5]) && same(x.byEffort, [0, 1, 2, 3, 4, 5]) && x.key === 0 }))
  }
  check('slider ends: line 0.57, star of 6 0.44, ring 0.49 (strictly below 1/λ_max = 0.5)', K.sliderMax(net('line5')) === 0.57 && K.sliderMax(net('star6')) === 0.44 && K.sliderMax(net('ring6')) === 0.49)
  const [, ms] = time(() => {
    for (let i = 0; i < 9; i++) K.totalWithout(b, 0.3, i)
  })
  info(`Panel B: nine removals of the bridge in ${ms.toFixed(2)} ms`)
}

// ------------------------------------------------------------------ F2 and Panel C

console.log('— F2 and Panel C: the connections model')
{
  const grid = []
  for (let a = 1; a <= 19; a += 2) for (let k = 1; k <= 39; k += 2) grid.push([a / 20, k / 20])
  const away = (n, d, c) => {
    const t = C.thresholds(n, d)
    return [t.low, t.mid, t.high].every((v) => Math.abs(c - v) > 1e-6)
  }
  check('the three totals are the code\'s utilities: complete n(n − 1)(δ − c), star 2(n − 1)(δ − c) + (n − 1)(n − 2)δ², empty 0 (n = 3–12, the grid)', [3, 4, 6, 8, 12].every((n) => grid.every(([d, c]) => {
    const t = C.totals(n, d, c)
    return close(C.totalUtility(C.complete(n), d, c), t.complete) && close(C.totalUtility(C.starNet(n), d, c), t.star) && close(C.totalUtility(C.empty(n), d, c), 0)
  })))
  for (const n of [4, 5]) {
    const [okEff, ms] = time(() => grid.filter(([d, c]) => away(n, d, c)).every(([d, c]) => {
      const t = C.totals(n, d, c)
      const want = t[C.efficientKind(n, d, c)]
      return close(C.bruteEfficient(n, d, c), want) && Object.values(t).every((v) => v <= want + 1e-9)
    }))
    check(`n = ${n}: the best of all ${2 ** ((n * (n - 1)) / 2)} networks has the total of the network the thresholds name (${grid.length} points of (δ, c))`, okEff, `${ms.toFixed(0)} ms`)
  }
  {
    // Brute force on n = 5: which networks are pairwise stable.
    const n = 5
    const all = []
    const pairs = []
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) pairs.push([i, j])
    for (let s = 0; s < 1 << pairs.length; s++) {
      const nb = C.empty(n)
      pairs.forEach(([i, j], k) => {
        if ((s >> k) & 1) {
          nb[i] |= 1 << j
          nb[j] |= 1 << i
        }
      })
      all.push(nb)
    }
    const pts = grid.filter(([d, c]) => away(n, d, c))
    check('n = 5, all 1,024 networks: when c < δ − δ² the complete network is the only pairwise stable one', pts.filter(([d, c]) => c < d - d * d).every(([d, c]) => {
      const st = all.filter((nb) => C.pairwiseStable(nb, d, c))
      return st.length === 1 && C.links(st[0]) === 10
    }))
    check('n = 5: when δ − δ² < c < δ the star is pairwise stable (and not always the only one)', (() => {
      const pp = pts.filter(([d, c]) => c > d - d * d && c < d)
      const notOnly = pp.some(([d, c]) => all.filter((nb) => C.pairwiseStable(nb, d, c)).length > 5)
      return pp.length > 0 && pp.every(([d, c]) => C.pairwiseStable(C.starNet(n), d, c)) && notOnly
    })())
    check('n = 5: when c > δ no pairwise stable network has a player with one link, and the empty one is stable', pts.filter(([d, c]) => c > d).every(([d, c]) => all.filter((nb) => C.pairwiseStable(nb, d, c)).every((nb) => !C.degrees(nb).includes(1)) && C.pairwiseStable(C.empty(n), d, c)))
  }
  check('the star is pairwise stable exactly when δ − δ² < c < δ (n = 6, 8, the grid away from the thresholds)', [6, 8].every((n) => grid.filter(([d, c]) => away(n, d, c)).every(([d, c]) => C.pairwiseStable(C.starNet(n), d, c) === (c > d - d * d && c < d))))
  info('at the two ends (c = δ − δ², c = δ) the star is pairwise stable too: a gain of exactly 0 is not strict')
  check('the regions of F2 follow the thresholds; at n = 6, δ = 0.5: 0.25, 0.5, 1 (exercise 5)', same(Object.values(C.thresholds(6, 0.5)), [0.25, 0.5, 1]) && C.region(6, 0.5, 0.2) === 'complete' && C.region(6, 0.5, 0.4) === 'star-stable' && C.region(6, 0.5, 0.7) === 'star-unstable' && C.region(6, 0.5, 1.2) === 'empty')
  {
    const t = (c) => C.totals(6, 0.5, c)
    check('exercise 5: complete 9 against star 8 at c = 0.2; star 6 against 3 at 0.4; star 3 at 0.7, not stable; empty at 1.2, the star −2', close(t(0.2).complete, 9) && close(t(0.2).star, 8) && close(t(0.4).star, 6) && close(t(0.4).complete, 3) && close(t(0.7).star, 3) && !C.pairwiseStable(C.starNet(6), 0.5, 0.7) && close(t(1.2).star, -2) && C.efficientKind(6, 0.5, 1.2) === 'empty')
  }
  {
    const t = C.thresholds(8, 0.5)
    check('n = 8, δ = 0.5: thresholds 0.25, 0.5, 1.25; efficient totals at c = 0.2, 0.4, 0.6: complete 16.8, star 11.9, star 9.1', same([t.low, t.mid, t.high], [0.25, 0.5, 1.25]) && close(C.totals(8, 0.5, 0.2).complete, 16.8) && C.efficientKind(8, 0.5, 0.4) === 'star' && close(C.totals(8, 0.5, 0.4).star, 11.9) && C.efficientKind(8, 0.5, 0.6) === 'star' && close(C.totals(8, 0.5, 0.6).star, 9.1))
  }
  check('F2 default (n = 6, δ = 0.5, c = 0.4): complete 3, star 6, empty 0; the star efficient and pairwise stable', (() => {
    const t = C.totals(6, 0.5, 0.4)
    return close(t.complete, 3) && close(t.star, 6) && C.efficientKind(6, 0.5, 0.4) === 'star' && C.pairwiseStable(C.starNet(6), 0.5, 0.4)
  })())

  // Panel C's runs.
  const runs = (n, d, c, start, k = 20) => Array.from({ length: k }, (_, i) => C.runToEnd(n, d, c, start, i + 1))
  const starts = ['empty', 'complete', 'random']
  const settings = []
  for (const n of [4, 8, 12]) for (const d of [0.2, 0.5, 0.8]) for (const c of [0.1, 0.4, 0.6, 1, 1.5]) settings.push([n, d, c])
  check(`every run of Panel C ends pairwise stable, none at the 20,000-step cap (${settings.length} settings × 3 starts × runs 1–10)`, settings.every(([n, d, c]) => starts.every((s) => runs(n, d, c, s, 10).every((r) => r.stable && !r.capped && C.pairwiseStable(r.nb, d, c)))))
  check('at (0.5, 0.2) every start ends at the complete network (n = 8, runs 1–20)', starts.every((s) => runs(8, 0.5, 0.2, s).every((r) => r.isComplete)))
  check('at (0.5, 0.6) the empty start stays empty, and no final network has a player with one link (n = 8, runs 1–20)', runs(8, 0.5, 0.6, 'empty').every((r) => r.isEmpty && r.steps === 0) && starts.every((s) => runs(8, 0.5, 0.6, s).every((r) => !r.oneLink)))
  check('at (0.5, 1.5) every start ends empty (n = 8, runs 1–20)', starts.every((s) => runs(8, 0.5, 1.5, s).every((r) => r.isEmpty)))
  {
    const R = runs(8, 0.5, 0.4, 'empty')
    const L = R.map((r) => r.links)
    const U = R.map((r) => r.total)
    check('(8, 0.5, 0.4), runs 1 to 20 from empty: 8 to 10 links, total 9.60 to 10.50 against 11.90, never the star', Math.min(...L) === 8 && Math.max(...L) === 10 && f2(Math.min(...U)) === '9.60' && f2(Math.max(...U)) === '10.50' && f2(R[0].efficient) === '11.90' && R.every((r) => !r.isStar), `links ${L.join(' ')}; totals ${U.map(f2).join(' ')}`)
    info('the prompt expected totals 9.55 to 10.5 from empty; here 9.55 appears only from the random start')
    const RR = runs(8, 0.5, 0.4, 'empty', 200)
    info(`(8, 0.5, 0.4) from empty, runs 1–200: links ${Math.min(...RR.map((r) => r.links))}–${Math.max(...RR.map((r) => r.links))}, totals ${f2(Math.min(...RR.map((r) => r.total)))}–${f2(Math.max(...RR.map((r) => r.total)))}, stars ${RR.filter((r) => r.isStar).length}, steps ${Math.min(...RR.map((r) => r.steps))}–${Math.max(...RR.map((r) => r.steps))}`)
  }
  check('exercise 6: with c > δ the partner of a one-link player gains only δ − c from that link; an isolated pair gains δ − c each', (() => {
    const d = 0.5
    const c = 0.6
    const nb = C.toggle(C.toggle(C.empty(5), 0, 1), 1, 2) // 0 has one link, to 1
    const [g0, g1] = C.linkGains(nb, 0, 1, d, c)
    const [e0, e1] = C.linkGains(C.empty(5), 0, 1, d, c)
    return close(g1, d - c) && g0 > g1 && close(e0, d - c) && close(e1, d - c)
  })())
  const [r12, ms] = time(() => C.runToEnd(12, 0.5, 0.4, 'complete', 1))
  const [, ms2] = time(() => {
    for (let s = 1; s <= 20; s++) for (const st of starts) C.runToEnd(12, 0.5, 0.4, st, s)
  })
  info(`Panel C: n = 12 "To the end" from complete in ${ms.toFixed(1)} ms (${r12.steps} steps); 60 runs at n = 12 in ${ms2.toFixed(0)} ms`)
}

// ------------------------------------------------------------------ Quoted on the page

const textsPath = resolve(root, 'src/components/lab/game-theory/games-on-networks/texts.js')
const lecturePath = (l) => `src/content/game-theory-lab/games-on-networks.${l}.md`
if (existsSync(textsPath) && existsSync(resolve(root, lecturePath('en'))) && existsSync(resolve(root, lecturePath('it')))) {
  console.log('— Quoted on the page')
  const { observe, exercises } = await import(pathToFileURL(textsPath).href)
  const lecture = { en: read(lecturePath('en')).replace(/\r/g, ''), it: read(lecturePath('it')).replace(/\r/g, '') }
  const itn = (s) => s.replace(/(\d)\.(\d)/g, '$1,$2') // decimals written the Italian way
  const quoted = (name, text, phrases) => {
    for (const lang of ['en', 'it']) {
      const missing = phrases.map((p) => (Array.isArray(p) ? p[lang === 'en' ? 0 : 1] : lang === 'en' ? p : itn(p))).filter((p) => !text[lang].includes(p))
      check(`${name} (${lang}) quotes ${phrases.length} values from the code`, missing.length === 0, missing.length ? `missing: ${missing.join(' | ')}` : '')
    }
  }
  const body = { en: lecture.en.split('<!-- simulation -->')[0], it: lecture.it.split('<!-- simulation -->')[0] }
  const box = (l) => (body[l].match(/```box[\s\S]*?```/) || [''])[0]
  const noBox = { en: body.en.replace(/```box[\s\S]*?```/, ''), it: body.it.replace(/```box[\s\S]*?```/, '') }
  const boxText = { en: box('en'), it: box('it') }
  const sep = (xs, d = 4) => [xs.map((v) => v.toFixed(d)).join(', '), xs.map((v) => itn(v.toFixed(d))).join('; ')]
  const star5 = net('star5')
  const b = G.bridge()
  const a3 = K.analyse(b, 0.3)
  const a1 = K.analyse(b, 0.1)

  // ---- The lecture
  check('lecture numbers are the code\'s: 8/3 and 5/3 at 0.25; the hub stops at −0.25, leaves 1; ±0.5 the limits; star of 6 totals 1 and 5 (the stable one); λ_min −2; 4.1655, 11.3988, 10.9163 at 0.3; the thresholds',
    close(G.starFormula(0.25).hub, 8 / 3) && close(G.starFormula(0.25).leaf, 5 / 3) && G.starFormula(-0.25).hub === 0 && G.starFormula(-0.25).leaf === 1
    && close(1 / G.lambdaMax(star5), 0.5) && same(P.specializedEquilibria(net('star6')).map((e) => [e.total, e.stable]), [[5, true], [1, false]]) && close(G.lambdaMin(star5), -2)
    && f4(a3.b[0]) === '4.1655' && a3.mostActive === 0 && a3.key === 3 && f4(a3.inter[3]) === '11.3988' && f4(a3.inter[0]) === '10.9163')
  quoted('lecture: who you are next to', noBox, [['Singh (2001)', 'Singh (2001)'], 'u_i = x_i − x_i²/2 + δ x_i Σ_j g_ij x_j', 'x_i = max(0, 1 + δ Σ_j g_ij x_j)', 'δ > 0', 'δ < 0', '(1 + 4δ)/(1 − 4δ²)', '(1 + δ)/(1 − 4δ²)', 'δ = 0.25', '8/3', '5/3', 'δ = −0.25', 'δ = ±0.5'])
  quoted('lecture: who does the work', noBox, ['δ = −1', 'x_i = max(0, 1 − Σ_j g_ij x_j)', ['Kranton 2007', 'Kranton 2007'], ['at least two working neighbours', 'almeno due vicini che lavorano'], ['a total of 1', 'un totale di 1'], ['a total of 5', 'un totale di 5'], ['D\'Amours (2014)', 'D\'Amours (2014)'], '1/|λ_min|', 'λ_min = −2'])
  quoted('lecture: the key player', noBox, [['Zenou (2006)', 'Zenou (2006)'], '1/λ_max', 'x = (I − δG)^(−1) 1', '1 + δG + δ²G² + …', 'δ^k', '/network-lab/centrality', 'b_i² / m_ii', 'δ = 0.3', '4.1655', '11.3988', '10.9163', ['player 4', 'il 4']])
  quoted('lecture: coordination', noBox, ['Morris (2000)', '/network-lab/social-contagion-network-effects'])
  quoted('lecture: building the network', noBox, [['Wolinsky (1996)', 'Wolinsky (1996)'], 'δ^d', '0 < δ < 1', 'δ²', 'c < δ − δ²', 'δ − δ² < c < δ + (n − 2)δ²/2', 'δ − δ² < c < δ', 'c > δ', 'δ + (n − 2)δ²/2', ['Watts (2002)', 'Watts (2002)'], ['Goyal (2000)', 'Goyal (2000)'], '/network-lab/growth-mechanisms'])
  check('lecture: the thresholds quoted are the code\'s (complete below δ − δ², star up to δ + (n − 2)δ²/2, star stable up to δ)', [0.3, 0.5, 0.8].every((d) => {
    const t = C.thresholds(6, d)
    return close(t.low, d - d * d) && close(t.mid, d) && close(t.high, d + 2 * d * d) && C.region(6, d, t.low - 0.01) === 'complete' && C.region(6, d, t.mid - 0.01) === 'star-stable' && C.region(6, d, t.high - 0.01) === 'star-unstable' && C.region(6, d, t.high + 0.01) === 'empty'
  }))

  // ---- The box (numbers from the papers, not from the code)
  quoted('the box', boxText, [['Wattenhofer (2019)', 'Wattenhofer (2019)'], ['Wattenhofer (2020)', 'Wattenhofer (2020)'], ['Tessone (2020)', 'Tessone (2020)'], '18', ['January 2018 to July 2019', 'gennaio 2018 a luglio 2019'], ['8,216', '8.216'], ['122,517', '122.517'], '10%', '80%', ['betweenness', '*betweenness*'], ['price of anarchy and of stability', 'prezzo dell\'anarchia e della stabilità'], ['core–periphery', 'centro–periferia'], ['hypothesis, not a description', 'ipotesi, non una descrizione']])
  check('the box never uses the word "free" (the fees are set "as they wish")', ['en', 'it'].every((l) => !/\bfree\b|gratuit|gratis|liberamente/i.test(boxText[l])) && boxText.en.includes('as they wish') && boxText.it.includes('a piacere'))
  check('the box names Georgia Avarikioti for 2019 and Zeta Avarikioti for 2020, as the papers print them', ['en', 'it'].every((l) => boxText[l].includes('Georgia Avarikioti') && boxText[l].includes('Zeta Avarikioti')))

  // ---- What to observe
  {
    const line = net('line5')
    const r = (g, k) => P.bestResponseRun(g, k)
    const l5 = r(line, 5)
    const gr5 = r(net('grid3'), 5)
    check('observe A: line runs 1–4 end at {1, 3, 5}, run 5 not specialized at total 2; star runs 1–20 end at {2, …, 6} in 2 turns, run 13 in 3; ring runs at {1, 3, 5} or {2, 4, 6}; grid run 5 not specialized at total 3, player 2 at 1',
      [1, 2, 3, 4].every((k) => P.setKey(r(line, k).workers) === '{1, 3, 5}') && !l5.specialized && l5.equilibrium && close(l5.total, 2)
      && [...Array(20)].every((_, k) => { const x = r(net('star6'), k + 1); return P.setKey(x.workers) === '{2, 3, 4, 5, 6}' && x.turns === (k + 1 === 13 ? 3 : 2) })
      && !gr5.specialized && gr5.equilibrium && close(gr5.total, 3) && close(gr5.x[1], 1))
    quoted('observe, Panel A', observe.publicgoods, [
      ['{1, 3, 5} with total 3', '{1, 3, 5} con totale 3'], ['total 2', 'totale 2'], sep(l5.x), ['19 times', '19 volte'], ['a total of 5, in 2 turns (3 in run 13)', 'un totale di 5, in 2 giri (3 nella prova 13)'], ['{1}, total 1', '{1}, totale 1'],
      ['(9 and 11 times', '(9 e 11 volte'], ['total 3', 'totale 3'], [`share ${f4(gr5.x[3])} and ${f4(gr5.x[6])}`, `si dividono ${itn(f4(gr5.x[3]))} e ${itn(f4(gr5.x[6]))}`], [`${f4(gr5.x[5])} and ${f4(gr5.x[8])}`, `${itn(f4(gr5.x[5]))} e ${itn(f4(gr5.x[8]))}`], ['17 times', '17 volte'],
    ])
  }
  {
    const a42 = K.analyse(b, 0.42)
    const rank = (o) => o.map((i) => i + 1).join(', ')
    const ln = K.analyse(net('line5'), 0.3)
    const st = K.analyse(net('star6'), 0.3)
    const rg = K.analyse(net('ring6'), 0.3)
    check('observe B: the rankings by effort and by intercentrality; the totals after removing 4 and 1', rank(a3.byEffort) === '1, 4, 5, 2, 3, 6, 7, 8, 9' && rank(a3.byInter) === '4, 1, 5, 2, 3, 6, 7, 8, 9' && close(K.totalWithout(b, 0.3, 3), a3.total - a3.inter[3]) && K.sliderMax(b) === 0.42)
    quoted('observe, Panel B', observe.keyplayer, [
      f4(G.lambdaMax(b)), f4(1 / G.lambdaMax(b)), f4(a3.total), f4(a3.b[0]), f4(a3.inter[3]), rank(a3.byEffort), rank(a3.byInter),
      f4(K.totalWithout(b, 0.3, 3)), f4(K.totalWithout(b, 0.3, 0)), f4(a3.inter[0]), ['δ to **0.1**', 'δ a **0,1**'], f4(a1.b[3]), f4(a1.inter[3]), ['between 0.26 and 0.27 (at δ = 0.2696)', 'tra 0,26 e 0,27 (in δ = 0,2696)'],
      ['**0.42**', '**0,42**'], f4(a42.total), f4(ln.inter[2]), f4(st.b[0]), f4(st.b[1]), f4(st.inter[0]), ['2.5 each and ' + f4(rg.inter[0]), '2,5 ciascuno e ' + itn(f4(rg.inter[0]))],
    ])
    check('observe B: line key player 3, star key the hub, ring all equal', ln.key === 2 && st.key === 0 && rg.inter.every((v) => close(v, rg.inter[0])))
  }
  {
    const R = (n, d, c, s, k = 1) => C.runToEnd(n, d, c, s, k)
    const r1 = R(8, 0.5, 0.4, 'empty')
    const r25 = [2, 3, 4, 5].map((k) => R(8, 0.5, 0.4, 'empty', k))
    const c6 = R(8, 0.5, 0.6, 'complete')
    const n12 = R(12, 0.5, 0.4, 'empty')
    check('observe C: run 1 ends stable, not the star; c = 0.2 complete from every start; c = 0.6 empty stays (0 steps), complete run 1 cuts all 28 and ends empty; c = 1.5 all empty',
      r1.stable && !r1.isStar && ['empty', 'complete', 'random'].every((s) => R(8, 0.5, 0.2, s).isComplete) && R(8, 0.5, 0.6, 'empty').steps === 0 && c6.isEmpty && c6.cuts === 28
      && ['empty', 'complete', 'random'].every((s) => R(8, 0.5, 1.5, s).isEmpty) && C.efficientKind(8, 0.5, 1.5) === 'empty')
    quoted('observe, Panel C', observe.formation, [
      [`${r1.steps} steps and ${r1.changes} changes (${r1.adds} links added, ${r1.cuts} cut)`, `${r1.steps} passi e ${r1.changes} cambi (${r1.adds} collegamenti aggiunti, ${r1.cuts} tagliati)`],
      [`${r1.links} links, degrees ${r1.degrees.join(', ')}`, `${r1.links} collegamenti, gradi ${r1.degrees.join('; ')}`], f2(r1.total), f2(r1.efficient),
      [r25.map((r) => f2(r.total)).slice(0, 3).join(', ') + ' and ' + f2(r25[3].total), r25.map((r) => itn(f2(r.total))).slice(0, 3).join(', ') + ' e ' + itn(f2(r25[3].total))],
      ['8 to 10 links', 'da 8 a 10 collegamenti'], ['from 9.60 to 10.50', 'tra 9,60 e 10,50'],
      ['c = **0.2**', 'c a **0,2**'], ['28 links and 16.80', '28 collegamenti e 16,80'], ['c = **0.6**', 'c a **0,6**'], ['0 steps', '0 passi'], f2(C.totals(8, 0.5, 0.6).star), [`all 28 links in ${c6.steps} steps`, `tutti i 28 collegamenti in ${c6.steps} passi`],
      ['c = **1.5**', 'c a **1,5**'], ['n = **12**', 'n a **12**'], [`${n12.steps} steps`, `${n12.steps} passi`], [`${n12.links} links and a total of ${f2(n12.total)}`, `${n12.links} collegamenti e un totale di ${itn(f2(n12.total))}`], f2(n12.efficient),
    ])
    check('observe C: the star is pairwise stable at (8, 0.5, 0.4) and 28 = all pairs of 8', C.pairwiseStable(C.starNet(8), 0.5, 0.4) && c6.cuts === 28)
  }

  // ---- The exercises
  {
    const sol = (i) => ({ en: exercises[i].solution.en, it: exercises[i].solution.it })
    quoted('exercise 1', sol(0), ['h = max(0, 1 + 4δl)', 'l = max(0, 1 + δh)', 'h = (1 + 4δ)/(1 − 4δ²)', '(1 + δ)/(1 − 4δ²)', 'h = 2/0.75 = 8/3', 'l = 1.25/0.75 = 5/3', 'δ = −0.25', 'max(0, 1 − 4 × 0.25) = 0'])
    quoted('exercise 2', sol(1), ['{1, 3, 5}, {1, 4}, {2, 4}, {2, 5}', ['(total 1)', '(totale 1)'], ['(total 5)', '(totale 5)'], '{2, 3, 4, 5, 6}'])
    quoted('exercise 3', sol(2), ['{1, 3, 5}, {2, 4, 6}', '{1, 4}, {2, 5}, {3, 6}'])
    check('exercise 3 numbers are the code\'s: five sets, two stable, three opposite pairs not', same(P.specializedEquilibria(net('ring6')).map((e) => [plus1(e.set).join(','), e.stable]), [['1,3,5', true], ['2,4,6', true], ['1,4', false], ['2,5', false], ['3,6', false]]))
    quoted('exercise 4', sol(3), ['δ = 0.1', f4(a1.b[3]), f4(a1.inter[3]), f4(a1.inter[0]), 'δ = 0.3', [`${f4(a3.b[0])} against ${f4(a3.b[3])}`, itn(`${f4(a3.b[0])} contro ${f4(a3.b[3])}`)], f4(a3.inter[3]), f4(a3.inter[0]), 'δ ≈ 0.2696'])
    check('exercise 4 numbers are the code\'s: at 0.1 player 4 most active and key; at 0.3 player 1 most active, player 4 key; the crossing 0.2696', a1.mostActive === 3 && a1.key === 3 && a3.mostActive === 0 && a3.key === 3 && f4(K.crossing(b, 0, 3, 0.1, 0.3)) === '0.2696')
    quoted('exercise 5', sol(4), ['0.5 − 0.25 = 0.25', '0.5 + 4 × 0.25/2 = 1', '30(0.5 − c)', '10(0.5 − c) + 20 × 0.25 = 10(0.5 − c) + 5', ['9 against 8', '9 contro 8'], ['6 against 3', '6 contro 3'], ['star, 3', 'stella, 3'], '−2'])
    check('exercise 5 numbers are the code\'s (n = 6, δ = 0.5)', close(C.totals(6, 0.5, 0.2).complete, 9) && close(C.totals(6, 0.5, 0.2).star, 8) && close(C.totals(6, 0.5, 0.4).star, 6) && close(C.totals(6, 0.5, 0.4).complete, 3) && close(C.totals(6, 0.5, 0.7).star, 3) && close(C.totals(6, 0.5, 1.2).star, -2))
    quoted('exercise 6', sol(5), ['c > δ', 'δ − c < 0'])
  }

  // ---- The rules of the lab
  const words = (s) => s.trim().split(/\s+/).length
  check('lecture words: between 1,400 and 1,700 in each language (the box not counted), with the DRAFT marker on the first line',
    ['en', 'it'].every((l) => words(noBox[l]) >= 1400 && words(noBox[l]) <= 1700 && lecture[l].startsWith('<!-- DRAFT: to be reviewed by Adriano -->')), ['en', 'it'].map((l) => `${l} ${words(noBox[l])}`).join(', '))
  const allText = (l) => lecture[l] + observe.publicgoods[l] + observe.keyplayer[l] + observe.formation[l] + exercises.map((x) => x.statement[l] + x.solution[l]).join(' ')
  check('the texts never call the course free', ['en', 'it'].every((l) => !/\bfree\b|gratuit|gratis/i.test(allText(l))))
  check('the lecture has one Bitcoin box, after the section on building the network, and names Bitcoin outside it only in "Next"', ['en', 'it'].every((l) => {
    const boxes = (lecture[l].match(/```box/g) || []).length
    const afterFormation = body[l].indexOf('```box') > body[l].indexOf('```figure\nformation')
    return boxes === 1 && afterFormation && (noBox[l].match(/bitcoin/gi) || []).length === 1
  }))
  check('the lecture links to the Network Lab\'s modules 03, 06 and 13', ['en', 'it'].every((l) => ['/network-lab/centrality', '/network-lab/growth-mechanisms', '/network-lab/social-contagion-network-effects'].every((u) => lecture[l].includes(`(${u})`))))
  check('the authors are spelled as the papers print them: Kranton (not "Kranz"), never peer-reviewed', ['en', 'it'].every((l) => !/Kranz\b/.test(lecture[l]) && lecture[l].includes('Kranton') && !/peer.reviewed/i.test(allText(l))))
} else {
  info('texts.js or the lecture is not there yet: the "quoted on the page" checks are skipped')
}

console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
if (failures) process.exitCode = 1
