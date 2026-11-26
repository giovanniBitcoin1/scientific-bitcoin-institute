// Self-checks for Game Theory Lab module 14, "Capstone: the price of
// security". They run the same code as the page (budish.js, schedule.js,
// fees.js, defaults.js, money.js) and compare it with Budish's Table II, with
// the numbers of the prompt, with independent computations (a Monte Carlo of
// the attack race, integer satoshis in BigInt, many seeded runs) and with
// the numbers the texts quote.
//
//   node scripts/lab/check-game-theory-14.mjs
//
// Exits with code 1 if any check fails. Lines starting with INFO report
// numbers that are not checked (timings, simulated values).
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { attackDuration, bestA, requiredShare, securityBudget, BLOCKS_PER_YEAR } from '../../src/components/lab/game-theory/capstone-the-price-of-security/budish.js'
import { subsidySat, subsidyBTC, totals, subsidyAfterHalvingIn, feesNeeded, heightToYear, yearToHeight, TARGET } from '../../src/components/lab/game-theory/capstone-the-price-of-security/schedule.js'
import { exact, simulate } from '../../src/components/lab/game-theory/capstone-the-price-of-security/fees.js'
import { DATED, TEST, SOURCES } from '../../src/components/lab/game-theory/capstone-the-price-of-security/defaults.js'
import { money } from '../../src/components/lab/game-theory/capstone-the-price-of-security/money.js'
import { mulberry32 } from '../../src/components/lab/rng.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (rel) => readFileSync(resolve(root, rel), 'utf8')
const dir = 'src/components/lab/game-theory/capstone-the-price-of-security'

let failures = 0
function check(name, cond, detail = '') {
  if (!cond) failures++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`)
}
const info = (text) => console.log(`INFO  ${text}`)
const T0 = performance.now()
const f = (v, d = 4) => (Object.is(Math.round(v * 10 ** d) / 10 ** d, -0) ? 0 : v).toFixed(d)
const int = (x) => Math.round(x).toLocaleString('en-US')
const NS = [6, 12, 144, 1008]

// ------------------------------------------------------------------ Budish

console.log('— t(A) and the best attack')
{
  const table2 = {
    1.05: ['42.43', '56.59', '229.61', '1074.55'],
    1.1: ['22.88', '31.73', '167.31', '1010.90'],
    1.2: ['13.24', '19.69', '146.79', '1008.00'],
    1.33: ['9.60', '15.35', '144.18', '1008.00'],
    1.5: ['7.84', '13.43', '144.00', '1008.00'],
    2: ['6.45', '12.20', '144.00', '1008.00'],
  }
  for (const [A, vals] of Object.entries(table2)) {
    const got = NS.map((n) => f(attackDuration(Number(A), n), 2))
    check(`Budish's Table II, A = ${A} (k + e = 6, 12, 144, 1,008): ${vals.join(', ')}`, got.join() === vals.join(), got.join(', '))
  }
  // Table II's gross cost A·t (units of N*c), as the paper prints it for k + e = 12.
  const gross = [[1.05, '59.42'], [1.1, '34.90'], [1.2, '23.63'], [1.33, '20.41'], [1.5, '20.14'], [2, '24.39']]
  check('Table II\'s gross cost A·t(A) at k + e = 12: 59.42, 34.90, 23.63, 20.41, 20.14, 24.39', gross.every(([A, v]) => f(A * attackDuration(A, 12), 2) === v), gross.map(([A]) => f(A * attackDuration(A, 12), 2)).join(', '))
  check('t(A) → k + e as A grows (A = 50: within 0.05 for every column) and → ∞ as A → 1', NS.every((n) => attackDuration(50, n) - n < 0.05 && attackDuration(50, n) >= n) && attackDuration(1.0001, 12) > 1e4)
  // The probabilities of the attacker's blocks sum to 1 (m from 0 to a large bound).
  {
    let worst = 0
    for (const n of [1, 12, 1008]) for (const A of [1.05, 1.43, 3]) {
      const lp = Math.log(A / (1 + A))
      const lq = Math.log(1 / (1 + A))
      let logC = 0
      let s = 0
      for (let m = 0; m < 200000; m++) {
        if (m > 0) logC += Math.log(n - 1 + m) - Math.log(m)
        s += Math.exp(logC + m * lp + n * lq)
      }
      worst = Math.max(worst, Math.abs(s - 1))
    }
    check('the negative binomial P(m) = C(n − 1 + m, m) p^m q^n sums to 1 (n = 1, 12, 1,008; A = 1.05, 1.43, 3)', worst < 1e-9, worst.toExponential(1))
  }
  // An independent Monte Carlo of the race: honest blocks at rate 1, hers at rate A.
  {
    const t = performance.now()
    const race = (A, n, runs, seed) => {
      const rnd = mulberry32(seed)
      const exp = (rate) => -Math.log(1 - rnd()) / rate
      let sum = 0
      let sum2 = 0
      for (let r = 0; r < runs; r++) {
        // The time of the n-th honest block and her blocks by then; then the race until she leads by one.
        let time = 0
        for (let i = 0; i < n; i++) time += exp(1)
        let tA = exp(A)
        let m = 0
        while (tA <= time) {
          m++
          tA += exp(A)
        }
        let gap = n - m
        let tH = time + exp(1)
        let now = time
        while (gap >= 0) {
          if (tA < tH) {
            gap--
            now = tA
            tA += exp(A)
          } else {
            gap++
            now = tH
            tH += exp(1)
          }
        }
        const dur = m > n ? time : now
        sum += dur
        sum2 += dur * dur
      }
      const mean = sum / runs
      return { mean, se: Math.sqrt((sum2 / runs - mean * mean) / runs) }
    }
    const cases = [[2, 12], [1.43, 12], [1.2, 6], [1.5, 144]]
    const zs = cases.map(([A, n], i) => {
      const mc = race(A, n, 40000, 100 + i)
      return { A, n, mc, z: Math.abs(mc.mean - attackDuration(A, n)) / mc.se }
    })
    check('a Monte Carlo of the race (40,000 runs each, seeds 100–103) agrees with t(A) within 4 standard errors', zs.every((x) => x.z < 4), zs.map((x) => `A ${x.A} n ${x.n}: ${f(x.mc.mean, 2)} ± ${f(x.mc.se, 2)} vs ${f(attackDuration(x.A, x.n), 2)}`).join('; '))
    info(`Monte Carlo of the race: ${((performance.now() - t) / 1000).toFixed(2)} s`)
  }
  const best = {
    6: ['1.5669', '11.7025', '0.6104'],
    12: ['1.4293', '19.9999', '0.5884'],
    144: ['1.1613', '174.4397', '0.5373'],
    1008: ['1.0739', '1099.0175', '0.5178'],
  }
  for (const n of NS) {
    const b = bestA(n)
    const got = [f(b.A, 4), f(b.At, 4), f(b.share, 4)]
    check(`k + e = ${n}: A* ${best[n][0]}, A*·t(A*) ${best[n][1]}, share ${best[n][2]}`, got.join() === best[n].join(), got.join(', '))
    check(`k + e = ${n}: A·t(A) is larger at A* ± 0.001`, b.A * attackDuration(b.A, n) < (b.A - 0.001) * attackDuration(b.A - 0.001, n) && b.A * attackDuration(b.A, n) < (b.A + 0.001) * attackDuration(b.A + 0.001, n))
  }
  check('k + e = 12: t(A*) = 13.9928', f(bestA(12).t, 4) === '13.9928', f(bestA(12).t, 4))
  const rs = NS.map(requiredShare)
  const want = [['8.545', '1230.5', '449135'], ['5.000', '720.0', '262801'], ['0.573', '82.55', '30131'], ['0.091', '13.10', '4782']]
  const got = rs.map((r, i) => [f(100 * r.perBlock, 3), f(100 * r.perDay, i < 2 ? 1 : 2), f(100 * r.perYear, 0)])
  check('payment per block, per day and per year as a share of V_attack: 8.545% 1,230.5% 449,135%; 5.000% 720.0% 262,801%; 0.573% 82.55% 30,131%; 0.091% 13.10% 4,782%', JSON.stringify(got) === JSON.stringify(want), JSON.stringify(got))
}

// ------------------------------------------------------------------ Panel A

console.log('— Panel A: the cost of an attack')
const tv = (n) => securityBudget({ ...TEST, n })
{
  check('test values: p_block = 65,000 × 3.145 = 204,425', tv(12).pBlock === 204425)
  const rows = {
    maxDeterred: ['2,392,283', '4,088,481', '35,659,843', '224,666,656'],
    needed: ['85,451,838', '50,000,232', '5,732,639', '909,904'],
  }
  for (const [k, vals] of Object.entries(rows)) {
    const g = NS.map((n) => int(tv(n)[k]))
    check(`${k === 'needed' ? 'p_block needed for $1 billion' : 'largest attack deterred'} (k + e = 6, 12, 144, 1,008): ${vals.join(', ')}`, g.join() === vals.join(), g.join(', '))
  }
  const y = NS.map((n) => f(tv(n).neededYear / 1e12, 3))
  check('per year: 4.491, 2.628, 0.301, 0.048 trillion', y.join() === '4.491,2.628,0.301,0.048', y.join(', '))
  const hw = NS.map((n) => f(tv(n).hardware / 1e9, 3))
  check('hardware: 23.503, 21.440, 17.420, 16.109 billion', hw.join() === '23.503,21.440,17.420,16.109', hw.join(', '))
  const gwh = NS.map((n) => f(tv(n).attackGWh, 2))
  check('attack energy: 33.16, 56.67, 494.25, 3,113.88 GWh', gwh.join() === '33.16,56.67,494.25,3113.88', gwh.join(', '))
  const usd = NS.map((n) => f(tv(n).attackEnergyCost / 1e6, 3))
  check('attack energy cost: 1.658, 2.833, 24.712, 155.694 million', usd.join() === '1.658,2.833,24.712,155.694', usd.join(', '))
  const z = tv(12)
  check('zero-profit check: honest energy 141,667 a block, 69.3% of p_block, 62,758 left, 3.299 billion a year, 22.0% of 15 billion', int(z.honestEnergy) === '141,667' && f(z.energyShare, 3) === '0.693' && int(z.leftPerBlock) === '62,758' && f(z.leftPerYear / 1e9, 3) === '3.299' && f(z.capitalCost, 3) === '0.220' && z.honestHardware === 15e9)
  const d = securityBudget(DATED)
  check('the attack\'s energy over the flow cost equals the honest energy over p_block (dated and test values)', Math.abs(d.attackEnergyCost / d.flowCost - d.energyShare) < 1e-12 && Math.abs(z.attackEnergyCost / z.flowCost - z.energyShare) < 1e-12)
  check('the dated defaults are the values the lecture quotes: $60,374, 3.125, 0.0201, 1,019 EH/s, $18.28, 13.5 J, $0.05, 0.87%', DATED.price === 60374 && DATED.subsidy === 3.125 && DATED.fees === 0.0201 && DATED.hashrate === 1019 && DATED.hwPrice === 18.28 && DATED.eff === 13.5 && DATED.elec === 0.05 && DATED.rentShare === 0.0087)
  check('every dated default has a source in both languages, none of them Coin Metrics; the round ones say "assumption"', Object.keys(DATED).filter((k) => k !== 'collapse').every((k) => SOURCES[k] && SOURCES[k].en && SOURCES[k].it) && !/coin ?metrics/i.test(JSON.stringify(SOURCES)) && ['elec', 'V', 'loss'].every((k) => SOURCES[k].en.startsWith('assumption') && SOURCES[k].it.startsWith('ipotesi')))
  const c = securityBudget({ ...DATED, collapse: true, loss: 0.5 })
  check('collapse switch: the stock lost is the share of her hardware; off, nothing', Math.abs(c.stockLost - 0.5 * c.hardware) < 1e-3 && securityBudget(DATED).stockLost === 0 && c.deterredWithStock && !c.deterred)
  check('rent: the rentable share covers A* only at a share ≥ A*', !securityBudget({ ...DATED, rentShare: 0.03 }).rentCovers && securityBudget({ ...DATED, rentShare: 1.43 }).rentCovers)
  info(`dated defaults: p_block ${int(d.pBlock)}, deterred up to ${int(d.maxDeterred)}, hardware ${f(d.hardware / 1e9, 2)} billion, energy ${f(d.attackGWh, 2)} GWh ${int(d.attackEnergyCost)}`)
}

// ------------------------------------------------------------------ F2

console.log('— F2: the halving clock')
{
  check('subsidy: 50 BTC at height 0, 25 at 210,000, 3.125 at 840,000, 1.5625 at 1,050,000; 50 at 209,999', subsidyBTC(0) === 50 && subsidyBTC(210000) === 25 && subsidyBTC(840000) === 3.125 && subsidyBTC(1050000) === 1.5625 && subsidyBTC(209999) === 50)
  const tot = totals()
  check('33 halvings to 0; total 2,099,999,997,690,000 satoshis (20,999,999.9769 BTC)', tot.halvings === 33 && tot.totalSat === 2099999997690000 && subsidySat(33 * 210000 - 1) === 1 && subsidySat(33 * 210000) === 0, `${tot.halvings}, ${tot.totalSat}`)
  {
    let s = 0n
    for (let k = 0n; k < 64n; k++) s += 210000n * (5000000000n >> k)
    check('the total in BigInt with 50 BTC >> halvings agrees', s === 2099999997690000n, String(s))
  }
  const ys = [2028, 2032, 2036, 2040].map((yr) => subsidyAfterHalvingIn(yr))
  const fees = ys.map((s) => feesNeeded(s.subsidy))
  check('fees needed to keep 3.145: 1.5825, 2.36375, 2.754375, 2.9496875', fees.every((x, i) => Math.abs(x.fees - [1.5825, 2.36375, 2.754375, 2.9496875][i]) < 1e-12), fees.map((x) => x.fees).join(', '))
  check('multiples of 0.02: 79.125, 118.1875, 137.71875, 147.484375', fees.every((x, i) => Math.abs(x.multiple - [79.125, 118.1875, 137.71875, 147.484375][i]) < 1e-9), fees.map((x) => x.multiple).join(', '))
  check('the halvings of 2028–2040 are heights 1,050,000 … 1,680,000, each in April', ys.every((s, i) => s.height === (5 + i) * 210000 && s.date % 1 > 0.25 && s.date % 1 < 0.34), ys.map((s) => f(s.date, 3)).join(', '))
  check('the target 3.145 is today\'s subsidy plus 0.02', Math.abs(TARGET - 3.145) < 1e-15)
  let bad = 0
  for (let h = 0; h < 7000000; h += 9973) if (Math.abs(yearToHeight(heightToYear(h)) - h) > 1) bad++
  check('heights and years invert each other (within a block)', bad === 0, `${bad}`)
  check('the subsidy ends in 2140', Math.floor(heightToYear(33 * 210000)) === 2140, f(heightToYear(33 * 210000), 2))
}

// ------------------------------------------------------------------ Panel B

console.log('— Panel B: when only fees pay')
{
  const a = exact(3.125, 0.02)
  check('S = 3.125, f = 0.02: mean 3.145, CV 0.00636, both shares below 1e-60', Math.abs(a.mean - 3.145) < 1e-12 && f(a.cv, 5) === '0.00636' && a.over2 < 1e-60 && a.over3 < 1e-60)
  const b = exact(1.5625, 0.5)
  check('S = 1.5625, f = 0.5: CV 0.24242, 0.00595 and 0.00010', f(b.cv, 5) === '0.24242' && f(b.over2, 5) === '0.00595' && f(b.over3, 5) === '0.00010')
  check('S = 0: CV 1, 0.13534 and 0.04979 for every f', [0.01, 0.02, 0.5, 5].every((x) => { const e = exact(0, x); return e.cv === 1 && f(e.over2, 5) === '0.13534' && f(e.over3, 5) === '0.04979' }))
  const t = performance.now()
  const cases = [[0, 0.02], [0, 5], [1.5625, 0.5], [0.78125, 2.36], [0.5, 1]]
  let worst = 0
  const out = []
  for (const [S, fe] of cases) for (const seed of [1, 2, 3]) {
    const s = simulate({ S, f: fe, blocks: 100000, seed })
    const e = exact(S, fe)
    const z2 = Math.abs(s.over2 - e.over2) / Math.sqrt((e.over2 * (1 - e.over2)) / 100000)
    const z3 = Math.abs(s.over3 - e.over3) / Math.sqrt((e.over3 * (1 - e.over3)) / 100000)
    worst = Math.max(worst, z2, z3)
    if (seed === 1) out.push(`S ${S} f ${fe}: ${f(s.over2, 5)}, ${f(s.over3, 5)}`)
  }
  check('simulated shares within 4 standard errors at 100,000 blocks (five settings, seeds 1–3)', worst < 4, `largest ${f(worst, 2)}; ${out.join('; ')}`)
  const s = simulate({ S: 0, f: 1, blocks: 100000, seed: 1 })
  check('the simulated mean and CV are near the exact (S = 0, f = 1: within 2%)', Math.abs(s.mean - 1) < 0.02 && Math.abs(s.cv - 1) < 0.02, `${f(s.mean, 4)}, ${f(s.cv, 4)}`)
  check('the last 100 rewards are kept', s.last.length === 100 && simulate({ S: 1, f: 1, blocks: 1000, seed: 1 }).last.length === 100)
  info(`Panel B: 15 runs of 100,000 blocks in ${((performance.now() - t) / 1000).toFixed(2)} s`)
}

// ------------------------------------------------------------------ Quoted on the page

const textsFile = resolve(root, `${dir}/texts.js`)
const lectureFile = (l) => `src/content/game-theory-lab/capstone-the-price-of-security.${l}.md`
if (existsSync(textsFile) && existsSync(resolve(root, lectureFile('en'))) && existsSync(resolve(root, lectureFile('it')))) {
  console.log('— Quoted on the page')
  const { observe, exercises } = await import(pathToFileURL(textsFile).href)
  const lecture = { en: read(lectureFile('en')).replace(/\r/g, ''), it: read(lectureFile('it')).replace(/\r/g, '') }
  // Thousands and decimals the Italian way: 1,234,567.89 → 1.234.567,89.
  const itn = (s) => s.replace(/(\d),(?=\d{3}\b)/g, '$1#').replace(/(\d)\.(\d)/g, '$1,$2').replace(/#/g, '.')
  const quoted = (name, text, phrases) => {
    for (const lang of ['en', 'it']) {
      const missing = phrases.map((p) => (Array.isArray(p) ? p[lang === 'en' ? 0 : 1] : lang === 'en' ? p : itn(p))).filter((p) => !text[lang].includes(p))
      check(`${name} (${lang}) quotes ${phrases.length} values from the code`, missing.length === 0, missing.length ? `missing: ${missing.join(' | ')}` : '')
    }
  }
  const pc = (x, d = 2) => `${f(100 * x, d)}%`
  const mEn = (v, d = 2) => money(v, 'en', d)
  const mIt = (v, d = 2) => money(v, 'it', d)
  const both = (v, d = 2) => [mEn(v, d), mIt(v, d)]
  const body = { en: lecture.en.split(/<!--\s*simulation\s*-->/)[0], it: lecture.it.split(/<!--\s*simulation\s*-->/)[0] }
  const reading = { en: lecture.en.split('## Further reading')[1] || '', it: lecture.it.split('## Letture consigliate')[1] || '' }
  const b12 = bestA(12)
  const b1008 = bestA(1008)
  const r12 = requiredShare(12)
  const d12 = securityBudget(DATED)
  const d1008 = securityBudget({ ...DATED, n: 1008 })
  const millionsIt = (v) => `${f(v / 1e6, 2).replace('.', ',')} milioni di dollari`
  // ---- The lecture
  quoted('lecture: the three equations', body, [
    'N*·c = p_block', 'A·N*·c·t(A) > V_attack', 'p_block > V_attack / (A*·t(A*))',
    ['Theorem 2', 'Teorema 2'], 'k + e = 12',
    [`A* = ${f(b12.A, 2)}, a ${f(100 * b12.share, 0)}% share`, `A* = ${itn(f(b12.A, 2))}, una quota del ${f(100 * b12.share, 0)}%`],
    [`t(A*) = ${f(b12.t, 2)} blocks`, `t(A*) = ${itn(f(b12.t, 2))} blocchi`],
    [`about ${pc(r12.perBlock)} of the value at stake, ${f(100 * r12.perDay, 0)}% of it a day`, `circa il ${itn(pc(r12.perBlock))} del valore in gioco, il ${f(100 * r12.perDay, 0)}% al giorno`],
    [`about ${mEn((1e9 / b12.At) * BLOCKS_PER_YEAR)} a year`, `circa ${f(((1e9 / b12.At) * BLOCKS_PER_YEAR) / 1e12, 2).replace('.', ',')} mila miliardi di dollari all'anno`],
  ])
  check('lecture: 59% is A*/(1 + A*) rounded, 5.00% is 1/A*·t(A*), $2.63 trillion is 52,560 blocks of $50.0 million', f(100 * b12.share, 0) === '59' && pc(r12.perBlock) === '5.00%' && mEn((1e9 / b12.At) * BLOCKS_PER_YEAR) === '$2.63 trillion')
  quoted('lecture: today\'s numbers (dated defaults)', body, [
    ['3.125 BTC a block', '3,125 BTC'], ['0.0201 BTC a block in the week to 23 November 2026', '0,0201 BTC per blocco nella settimana al 23 novembre 2026'],
    [`${pc(DATED.fees / (DATED.subsidy + DATED.fees))} of what miners earned`, `lo ${itn(pc(DATED.fees / (DATED.subsidy + DATED.fees)))} di ciò che i miner`],
    [`At $${int(DATED.price)}, CoinGecko's close of 25 November 2026`, `A ${itn(int(DATED.price))} dollari, la chiusura di CoinGecko del 25 novembre 2026`],
    [`p_block = $${int(d12.pBlock)}`, `p_block = ${itn(int(d12.pBlock))} dollari`],
    [`A*·t(A*) is ${f(b12.At, 1)}`, `A*·t(A*) vale ${itn(f(b12.At, 1))}`],
    [mEn(d12.maxDeterred), millionsIt(d12.maxDeterred)],
    [`the multiple would be ${int(b1008.At)}`, `il multiplo sarebbe ${itn(int(b1008.At))}`],
    [`up to ${mEn(d1008.maxDeterred)} would be deterred`, `fino a ${millionsIt(d1008.maxDeterred)}`],
  ])
  check('lecture: fees are under 1% of the reward; the dated p_block deters "about 20 times" itself', DATED.fees / (DATED.subsidy + DATED.fees) < 0.01 && Math.abs(b12.At - 20) < 0.01)
  quoted('lecture: the objections', body, [
    ['NiceHash offered 8.85 EH/s', 'NiceHash offriva 8,85 EH/s'], [`${pc(DATED.rentShare)} of a network of ${int(DATED.hashrate)} EH/s`, `lo ${itn(pc(DATED.rentShare))} di una rete di ${itn(int(DATED.hashrate))} EH/s`],
    [`${f(100 * b12.A, 0)}% of the network`, `il ${f(100 * b12.A, 0)}% della rete`],
    [`At ${f(b12.A, 2)} times the network and $${DATED.hwPrice} per TH/s`, `A ${itn(f(b12.A, 2))} volte la rete e ${itn(String(DATED.hwPrice))} dollari per TH/s`],
    [`that is ${mEn(d12.hardware)} of hardware`, `sono ${f(d12.hardware / 1e9, 2).replace('.', ',')} miliardi di dollari di hardware`],
    [`${f(d12.attackGWh, 2)} GWh of energy`, `${itn(f(d12.attackGWh, 2))} GWh di energia`],
    [`${mEn(d12.attackEnergyCost)} at ${DATED.eff} J per TH and $${f(DATED.elec, 2)} per kWh`, `${millionsIt(d12.attackEnergyCost)} a ${itn(String(DATED.eff))} J per TH e ${itn(f(DATED.elec, 2))} dollari per kWh`],
    ['a factor of about 2,500', 'un fattore di circa 2.500'],
    [`from ${f(b12.At, 1)} to ${int(b1008.At)}`, `da ${itn(f(b12.At, 1))} a ${itn(int(b1008.At))}`],
    ['war of attrition', 'guerra di logoramento'], ['subgame perfect equilibrium', 'equilibrio perfetto nei sottogiochi'],
  ])
  check('lecture: the rentable share 0.87% is NiceHash\'s 8.85 EH/s over 1,019 EH/s', f((100 * 8.85) / 1019, 2) === f(100 * DATED.rentShare, 2))
  const tot = totals()
  const fe = [2028, 2032].map((yr) => feesNeeded(subsidyAfterHalvingIn(yr).subsidy))
  const supply = (tot.totalSat / 1e8).toLocaleString('en-US', { minimumFractionDigits: 4 })
  quoted('lecture: when the subsidy falls', body, [
    ['every 210,000 blocks', 'ogni 210.000 blocchi'], ['3.125 BTC since April 2024, 1.5625 in 2028', '3,125 BTC dall\'aprile 2024, 1,5625 nel 2028'],
    [`After ${tot.halvings} halvings`, `Dopo ${tot.halvings} *halving*`], `${supply} BTC`,
    ['3.145 BTC per block', '3,145 BTC per blocco'], ['plus 0.02 of fees', 'più 0,02 di commissioni'],
    [`${f(fe[0].multiple, 0)} times today's in 2028 and ${f(fe[1].multiple, 0)} times in 2032`, `${f(fe[0].multiple, 0)} volte quelle di oggi nel 2028 e ${f(fe[1].multiple, 0)} volte nel 2032`],
  ])
  check('lecture: 79 and 118 are 79.125 and 118.1875 rounded; the total is 20,999,999.9769', f(fe[0].multiple, 0) === '79' && f(fe[1].multiple, 0) === '118' && supply === '20,999,999.9769')
  // ---- What to observe, Panel A
  {
    const c50 = securityBudget({ ...DATED, collapse: true, loss: 0.5 })
    const c1 = securityBudget({ ...DATED, collapse: true, loss: 0.01 })
    const t12 = tv(12)
    quoted('observe, Panel A', observe.attack, [
      [`p_block = ${mEn(d12.pBlock)}`, `p_block = ${mIt(d12.pBlock)}`], [`A* = ${f(d12.A, 2)} (${f(100 * d12.share, 1)}%`, `A* = ${itn(f(d12.A, 2))} (il ${itn(f(100 * d12.share, 1))}%`], [`t(A*) = ${f(d12.t, 2)} blocks`, `t(A*) = ${itn(f(d12.t, 2))} blocchi`],
      both(d12.maxDeterred), [`${pc(DATED.rentShare)} of the network`, `${itn(pc(DATED.rentShare))} della rete`], [`${f(100 * d12.A, 0)}% she needs`, `${f(100 * d12.A, 0)}% che serve`], both(d12.hardware),
      [`${f(d12.attackGWh, 2)} GWh or ${mEn(d12.attackEnergyCost)}`, `${itn(f(d12.attackGWh, 2))} GWh ovvero ${mIt(d12.attackEnergyCost)}`], [`is ${pc(d12.energyShare, 1)} of the flow cost`, `è il ${itn(pc(d12.energyShare, 1))} del costo di flusso`],
      both(c50.stockLost), both(c50.totalWithStock), both(c1.stockLost), both(c1.totalWithStock),
      [`A* falls to ${f(d1008.A, 2)}`, `A* scende a ${itn(f(d1008.A, 2))}`], both(d1008.maxDeterred),
      both(d12.honestEnergy), [`${pc(d12.energyShare, 1)} of p_block`, `il ${itn(pc(d12.energyShare, 1))} di p_block`], both(d12.leftPerBlock), both(d12.leftPerYear), [`${pc(d12.capitalCost, 1)} a year on ${mEn(d12.honestHardware)}`, `il ${itn(pc(d12.capitalCost, 1))} annuo su ${mIt(d12.honestHardware)}`],
      [`${pc(t12.energyShare, 1)} and ${pc(t12.capitalCost, 1)}`, `${itn(pc(t12.energyShare, 1))} e ${itn(pc(t12.capitalCost, 1))}`], both(t12.pBlock), both(t12.maxDeterred),
    ])
    check('observe, Panel A: with 50% lost the attack is deterred, with 1% not; 3% for rent does not cover A*', c50.deterredWithStock && !c1.deterredWithStock && !securityBudget({ ...DATED, rentShare: 0.03 }).rentCovers)
  }
  // ---- What to observe, Panel B (run no. 1)
  {
    const sh = (p) => `${f(100 * p, 2)}%`
    const a = exact(3.125, 0.02)
    const z = simulate({ S: 0, f: 0.02, blocks: 100000, seed: 1 })
    const z1 = simulate({ S: 0, f: 0.02, blocks: 1000, seed: 1 })
    const z5 = simulate({ S: 0, f: 5, blocks: 100000, seed: 1 })
    const e0 = exact(0, 0.02)
    const b = exact(1.5625, 0.5)
    const bs = simulate({ S: 1.5625, f: 0.5, blocks: 100000, seed: 1 })
    quoted('observe, Panel B', observe.fees, [
      ['100,000 blocks', '100.000 blocchi'], f(a.cv, 5), ['(exact 1.9 × 10^-69)', '(esatto 1,9 × 10^-69)'],
      [`${sh(e0.over2)} of blocks`, `il ${itn(sh(e0.over2))} dei blocchi`], [`${sh(e0.over3)} more than three times`, `il ${itn(sh(e0.over3))} più del triplo`],
      `${sh(z.over2)} ± ${sh(z.over2Se)}`, `${sh(z.over3)} ± ${sh(z.over3Se)}`, `${sh(z1.over2)} ± ${sh(z1.over2Se)}`, `${sh(z1.over3)} ± ${sh(z1.over3Se)}`,
      f(b.cv, 5), [`${sh(b.over2)} of blocks`, `lo ${itn(sh(b.over2))} dei blocchi`], `${sh(bs.over2)} ± ${sh(bs.over2Se)}`,
    ])
    check('observe, Panel B: 1.9 × 10^-69 is the exact share; with S = 0 run 1 gives the same shares for f = 0.02 and f = 5; 1,000 blocks has about ten times the error', a.over2.toExponential(1) === '1.9e-69' && z.over2 === z5.over2 && z.over3 === z5.over3 && z1.over2Se / z.over2Se > 8 && z1.over2Se / z.over2Se < 12)
  }
  // ---- What to observe, Panel C
  quoted('observe, Panel C', observe.estimate, [
    [`an attack worth ${mEn(1e9)} is not deterred`, `un attacco che vale ${mIt(1e9)} non è scoraggiato`], 'k + e = 12',
    [`The flow of ${mEn(d12.pBlock)} a block covers attacks up to ${mEn(d12.maxDeterred)}`, `Il flusso di ${mIt(d12.pBlock)} per blocco copre attacchi fino a ${mIt(d12.maxDeterred)}`],
  ])
  check('observe, Panel C: $3 million is deterred under the dated defaults, $1 billion is not', securityBudget({ ...DATED, V: 3e6 }).deterred && !d12.deterred)
  // ---- Exercises
  const sol = (i) => ({ en: exercises[i].solution.en, it: exercises[i].solution.it })
  const t12 = tv(12)
  const t1008 = tv(1008)
  const at1008 = f(b1008.At, 4) // 1099.0175
  quoted('exercise 1', sol(0), [`A* = ${f(b12.A, 2)}`, `${f(b12.A, 2)}/${f(1 + b12.A, 2)} = ${f(100 * b12.share, 0)}%`, `t(A*) = ${f(b12.t, 2)}`, `A*·t(A*) = ${f(b12.At, 1)}`, `1/${f(b12.At, 1)} = ${pc(r12.perBlock)}`, `(${f(100 * r12.perDay, 0)}%`])
  quoted('exercise 2', sol(1), [
    [`65,000 × 3.145 = $${int(t12.pBlock)}`, `65.000 × 3,145 = ${itn(int(t12.pBlock))} $`],
    `A*·t(A*) = ${f(b12.At, 4)}`,
    [`about ${mEn(t12.maxDeterred)} ($${int(t12.maxDeterred)})`, `circa ${mIt(t12.maxDeterred)} (${itn(int(t12.maxDeterred))} $)`],
    [`A*·t(A*) = ${int(Math.floor(b1008.At))}.${at1008.split('.')[1]}`, `A*·t(A*) = ${itn(int(Math.floor(b1008.At)))},${at1008.split('.')[1]}`],
    [`about ${mEn(t1008.maxDeterred, 1)} ($${int(t1008.maxDeterred)})`, `circa ${mIt(t1008.maxDeterred, 1)} (${itn(int(t1008.maxDeterred))} $)`],
  ])
  quoted('exercise 3', sol(2), [
    `1,000,000,000/${f(b12.At, 4)}`,
    [`about ${mEn(t12.needed, 1)} a block ($${int(t12.needed)})`, `circa ${mIt(t12.needed, 1)} per blocco (${itn(int(t12.needed))} $)`],
    f(t12.neededMultiple, 1), ['× 52,560 blocks', '× 52.560 blocchi'], [`about ${mEn(t12.neededYear)}`, `circa ${mIt(t12.neededYear)}`],
  ])
  quoted('exercise 4', sol(3), [`${f(b12.A, 4)} × 10⁹ TH/s`, both(t12.hardware), `${f(b12.A * 17, 1)} GW`, `t(A*) = ${f(b12.t, 2)}`, `${f(t12.attackGWh, 2)} GWh`, both(t12.attackEnergyCost)])
  const fe4 = [2028, 2032].map((yr) => feesNeeded(subsidyAfterHalvingIn(yr).subsidy))
  quoted('exercise 5', sol(4), [
    `3.145 − 1.5625 = ${fe4[0].fees} BTC`, [`${f(fe4[0].multiple, 0)} times 0.02`, `${f(fe4[0].multiple, 0)} volte 0,02`], `(${fe4[0].multiple})`,
    `3.145 − 0.78125 = ${f(fe4[1].fees, 4)} BTC`, [`${f(fe4[1].multiple, 0)} times`, `${f(fe4[1].multiple, 0)} volte`], `(${fe4[1].multiple})`,
  ])
  const e0 = exact(0, 1)
  const eb = exact(1.5625, 0.5)
  quoted('exercise 6', sol(5), [`e^−2 = ${f(100 * e0.over2, 1)}%`, `e^−3 = ${f(100 * e0.over3, 1)}%`, `exp(−${f(2 + 1.5625 / 0.5, 3)}) = ${f(100 * eb.over2, 2)}%`])
  check('exercise answers agree with the prompt: 1.43, 59%, 13.99, 20.0, 5.00%; $204,425, $4.09 M, $224.7 M; $50.0 M, 244.6, $2.63 T; $21.44 B, 56.67 GWh, $2.83 M; 1.5825, 2.3638; 13.5%, 5.0%, 0.59%',
    f(b12.A, 2) === '1.43' && f(100 * b12.share, 0) === '59' && f(b12.t, 2) === '13.99' && f(b12.At, 1) === '20.0' && pc(r12.perBlock) === '5.00%'
    && t12.pBlock === 204425 && mEn(t12.maxDeterred) === '$4.09 million' && mEn(t1008.maxDeterred, 1) === '$224.7 million'
    && mEn(t12.needed, 1) === '$50.0 million' && f(t12.neededMultiple, 1) === '244.6' && mEn(t12.neededYear) === '$2.63 trillion'
    && mEn(t12.hardware) === '$21.44 billion' && f(t12.attackGWh, 2) === '56.67' && mEn(t12.attackEnergyCost) === '$2.83 million'
    && fe4[0].fees === 1.5825 && f(fe4[1].fees, 4) === '2.3638' && f(100 * e0.over2, 1) === '13.5' && f(100 * e0.over3, 1) === '5.0' && f(100 * eb.over2, 2) === '0.59')
  check('six exercises, each with a statement and a solution in both languages', exercises.length === 6 && exercises.every((x) => x.statement.en && x.statement.it && x.solution.en && x.solution.it && ['paper', 'sim', 'both'].includes(x.type)))
  // ---- Words and structure
  const words = (s) => s.trim().split(/\s+/).length
  check('lecture words: between 1,500 and 1,800 in each language (no box), with no DRAFT marker (removed after the review)', ['en', 'it'].every((l) => words(body[l]) >= 1500 && words(body[l]) <= 1800 && !lecture[l].includes('<!-- DRAFT')), ['en', 'it'].map((l) => `${l} ${words(body[l])}`).join('; '))
  check('the lecture places F1 and F2, has no box, and links modules 02, 04, 06, 10, 11, 12 and 13', ['en', 'it'].every((l) => /```figure\nflow\n```/.test(body[l]) && /```figure\nclock\n```/.test(body[l]) && !body[l].includes('```box') && ['nash-equilibrium', 'sequential-games-commitment', 'repeated-games-reputation', 'coalitions-sharing', 'auctions', 'mechanism-design', 'mining-as-a-game'].every((s) => body[l].includes(`(/game-theory-lab/${s})`))))
  check('seven sections, in the prompt\'s order', ['en', 'it'].every((l) => (body[l].match(/^## /gm) || []).length === 7))
  const allText = (l) => lecture[l] + Object.values(observe).map((o) => o[l]).join('') + exercises.map((x) => x.statement[l] + x.solution[l]).join('')
  const noFreeRide = (s) => s.replace(/free rider|free-rides?/gi, '')
  check('the texts never call the course free, never say peer-reviewed, never cite Coin Metrics', ['en', 'it'].every((l) => !/\bfree\b|gratuit|gratis/i.test(noFreeRide(allText(l))) && !/peer.reviewed/i.test(allText(l)) && !/coin ?metrics/i.test(allText(l))))
  check('the theses are hypotheses: "not a conclusion to sell", "never a verdict on Bitcoin"', body.en.includes('not a conclusion to sell') && body.it.includes('non una conclusione da vendere') && body.en.includes('It is never a verdict on Bitcoin') && body.it.includes('Non è mai un verdetto su Bitcoin'))
  check('the Italian lecture uses the chosen terms', ['**condizione di profitti nulli**', '**vincolo di compatibilità degli incentivi**', '**flusso**', '**stock**', '**attacco del 51%**', 'doppia spesa', '*escrow*', '**capitale specifico**', '**noleggio di potenza di calcolo**', '**sabotaggio**', '**attacco *Goldfinger***', '**corruzione**, *bribery*', '**contrattacco**', '**guerra di logoramento**', '**sussidio del blocco**', '*halving*', '*undercutting*', '*mining gap*', '*free rider*', 'conferme', 'equilibrio perfetto nei sottogiochi', '*hash rate*', '*miner*', '*mining*', '*pool*', '*selfish mining*'].every((t) => lecture.it.includes(t)) && !/capitale specializzato|guerra d.attrito/i.test(allText('it')))
  check('the Italian texts make the miner masculine (no "lei", no "una miner")', !/\blei\b|una miner/i.test(allText('it')))
  check('the reading list has every source cited, with sections and chapters (Budish III–V, Nakamoto 6 and 11, Narayanan 2.3 and 5.5)', ['Sections III (', 'IV (', 'V (', 'Sections 6 (', '11 (', 'Ch. 2 (2.3', 'ch. 5 (5.5'].every((t) => reading.en.includes(t)) && ['Budish', 'Carlsten', 'Kroll', 'Bonneau', 'Moroz', 'Auer', 'Huberman', 'Nakamoto', 'Narayanan', 'NBER Working Paper 24717', 'LNCS 9604, 19–26', '154–167', '88(6), 3011–3040', '140(1), 1–62', 'Cryptoeconomic Systems 2020'].every((t) => reading.en.includes(t) && reading.it.includes(t)))
} else {
  info('texts.js or the lectures are not there yet: the "quoted on the page" checks are skipped')
}

info(`total time ${((performance.now() - T0) / 1000).toFixed(1)} s`)
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed')
process.exit(failures ? 1 : 0)
