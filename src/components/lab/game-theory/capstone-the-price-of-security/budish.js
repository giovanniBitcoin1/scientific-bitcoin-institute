// Budish's model of the cost of a majority attack (Budish 2025, section on
// the three equations and the double-spending attack). Pure functions, used
// by the page and by scripts/lab/check-game-theory-14.mjs.
//
//   (1) zero profit           N*·c = p_block
//   (2) incentive compat.     A·N*·c·t(A) > V_attack
//   (3) together              p_block > V_attack / (A·t(A))
//
// Time is counted in honest blocks: the honest network finds blocks at rate
// 1, the attacker, with A times its computing power, at rate A. The attacker
// starts mining in private when the transaction is sent; the merchant waits
// for n = k + e honest blocks (k confirmations, e of escrow).

export const BLOCKS_PER_DAY = 144
export const BLOCKS_PER_YEAR = 144 * 365
export const SECONDS_PER_BLOCK = 600

// t(A): the expected duration of the attack in blocks. When the honest chain
// has n blocks, the attacker has m with the negative binomial probability
// P(m) = C(n − 1 + m, m) p^m q^n, p = A/(1 + A), q = 1/(1 + A). If she is
// i = n − m ≥ 0 blocks short, she needs (i + 1)/(A − 1) more time on average
// to get one block ahead; otherwise she is already ahead. Logarithms of the
// binomials keep n = 1,008 exact.
export function attackDuration(A, n) {
  if (!(A > 1)) return Infinity
  const lp = Math.log(A / (1 + A))
  const lq = Math.log(1 / (1 + A))
  let logC = 0 // log C(n − 1 + m, m), m = 0
  let extra = 0
  for (let m = 0; m <= n; m++) {
    if (m > 0) logC += Math.log(n - 1 + m) - Math.log(m)
    const P = Math.exp(logC + m * lp + n * lq)
    extra += ((n - m + 1) / (A - 1)) * P
  }
  return n + extra
}

// A·t(A), the gross cost of the attack in units of p_block.
export const costMultiple = (A, n) => A * attackDuration(A, n)

// A*: the multiple that minimizes A·t(A). A coarse scan, then golden-section
// search on the bracket around the best point.
export function bestA(n, { lo = 1.0005, hi = 6, tol = 1e-9 } = {}) {
  const N = 400
  let best = lo
  let bv = Infinity
  for (let i = 0; i <= N; i++) {
    const A = lo * (hi / lo) ** (i / N)
    const v = costMultiple(A, n)
    if (v < bv) {
      bv = v
      best = i
    }
  }
  let a = lo * (hi / lo) ** (Math.max(0, best - 1) / N)
  let b = lo * (hi / lo) ** (Math.min(N, best + 1) / N)
  const g = (Math.sqrt(5) - 1) / 2
  let c = b - g * (b - a)
  let d = a + g * (b - a)
  let fc = costMultiple(c, n)
  let fd = costMultiple(d, n)
  while (b - a > tol) {
    if (fc < fd) {
      b = d
      d = c
      fd = fc
      c = b - g * (b - a)
      fc = costMultiple(c, n)
    } else {
      a = c
      c = d
      fc = fd
      d = a + g * (b - a)
      fd = costMultiple(d, n)
    }
  }
  const A = (a + b) / 2
  const t = attackDuration(A, n)
  return { A, t, At: A * t, share: A / (1 + A) }
}

// The flow side of equation (3): what one block must pay, per block, per day
// and per year, as a multiple of V_attack, against the best attack.
export function requiredShare(n) {
  const { At } = bestA(n)
  const perBlock = 1 / At
  return { perBlock, perDay: perBlock * BLOCKS_PER_DAY, perYear: perBlock * BLOCKS_PER_YEAR }
}

// Everything Panel A and Panel C show, from their inputs.
//   price ($/BTC), subsidy and fees (BTC per block), hashrate (EH/s),
//   hwPrice ($ per TH/s), eff (J per TH), elec ($ per kWh), n = k + e,
//   V ($), rentShare (share of the network's hash rate for rent, 0–1),
//   collapse (bool), loss (fraction of the hardware's value lost, 0–1)
export function securityBudget(x) {
  const pBlock = x.price * (x.subsidy + x.fees)
  const best = bestA(x.n)
  const flowCost = best.At * pBlock // A*·t(A*)·p_block
  const maxDeterred = flowCost // the largest V the flow deters
  const needed = x.V / best.At // p_block needed for this V
  const TH = x.hashrate * 1e6 // EH/s → TH/s
  const attackerTH = best.A * TH
  const hardware = attackerTH * x.hwPrice
  const attackSeconds = best.t * SECONDS_PER_BLOCK
  const attackJ = attackerTH * x.eff * attackSeconds
  const attackGWh = attackJ / 3.6e12
  const attackEnergyCost = (attackJ / 3.6e6) * x.elec
  const honestJ = TH * x.eff * SECONDS_PER_BLOCK
  const honestEnergy = (honestJ / 3.6e6) * x.elec // $ per block
  const leftPerBlock = pBlock - honestEnergy
  const leftPerYear = leftPerBlock * BLOCKS_PER_YEAR
  const honestHardware = TH * x.hwPrice
  const stockLost = x.collapse ? x.loss * hardware : 0
  const rentableTH = x.rentShare * TH
  return {
    pBlock,
    A: best.A,
    t: best.t,
    At: best.At,
    share: best.share,
    flowCost,
    maxDeterred,
    deterred: flowCost > x.V,
    needed,
    neededDay: needed * BLOCKS_PER_DAY,
    neededYear: needed * BLOCKS_PER_YEAR,
    neededMultiple: needed / pBlock,
    rentableTH,
    rentCovers: rentableTH >= attackerTH,
    rentCoverage: rentableTH / attackerTH,
    hardware,
    attackGWh,
    attackEnergyCost,
    honestEnergy,
    energyShare: honestEnergy / pBlock,
    leftPerBlock,
    leftPerYear,
    honestHardware,
    capitalCost: leftPerYear / honestHardware,
    stockLost,
    totalWithStock: flowCost + stockLost,
    deterredWithStock: flowCost + stockLost > x.V,
  }
}
