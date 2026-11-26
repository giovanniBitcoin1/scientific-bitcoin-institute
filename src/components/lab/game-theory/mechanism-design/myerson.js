// Myerson's lemma for one bidder with one number, her value per unit of what
// she gets (F1 and Panel A). An allocation rule x(z) says how much the bidder
// gets when she bids z (a chance of winning, or clicks); a payment rule says
// what she pays. Myerson's payment is p(b) = b·x(b) − ∫₀ᵇ x(z) dz, so that a
// bidder whose value is b keeps the area under the curve. Plain JS.
//
// Rules:
//   single   one object, highest rival bid h: x = 1 above h
//   reserve  one object, rival bid h, reserve price r: x = 1 above max(h, r)
//   slots    two ad slots with click rates 1 and α, rival bids h1 > h2:
//            x = α between h2 and h1, 1 above h1
//   lottery  x = z/(z + H)
//   middle   x = 1 for 40 ≤ z < 60, else 0 (not monotone)
// In the auctions (single, reserve, slots) a bid equal to a rival's bid is a
// tie broken by a coin: x is the average of the two sides. The middle rule is
// as written, closed on the left and open on the right.

export const ALLOC = ['single', 'reserve', 'slots', 'lottery', 'middle']
export const PAYS = ['myerson', 'bid', 'gsp']
export const SLOT_BIDS = [60, 30] // the rivals' bids h1 > h2 in the slot rule
export const RESERVE_H = 30 // the rival bid in the reserve rule

// A rule object: { id, steps: [[t, level], ...] ascending, tie } or a lottery.
export function makeRule(id, { h = 60, alpha = 0.8, H = 50, reserve = 50 } = {}) {
  switch (id) {
    case 'single':
      return { id, steps: [[h, 1]], tie: true }
    case 'reserve':
      return { id, steps: [[Math.max(RESERVE_H, reserve), 1]], tie: true, reserve, h: RESERVE_H }
    case 'slots':
      return { id, steps: [[SLOT_BIDS[1], alpha], [SLOT_BIDS[0], 1]], tie: true, alpha }
    case 'lottery':
      return { id, H }
    case 'middle':
      return { id, steps: [[40, 1], [60, 0]], tie: false }
    default:
      throw new Error(`unknown rule ${id}`)
  }
}

export const monotone = (rule) => rule.id !== 'middle'

// x(z)
export function alloc(rule, z) {
  if (rule.id === 'lottery') return z <= 0 ? 0 : z / (z + rule.H)
  let level = 0
  for (const [t, l] of rule.steps) {
    if (z > t) level = l
    else if (z === t) return rule.tie ? (level + l) / 2 : l
    else break
  }
  return level
}

// ∫₀ᵇ x(z) dz, exact.
export function area(rule, b) {
  if (b <= 0) return 0
  if (rule.id === 'lottery') return b - rule.H * Math.log1p(b / rule.H)
  let s = 0
  let level = 0
  let from = 0
  for (const [t, l] of rule.steps) {
    if (b <= t) break
    s += level * (t - from)
    from = t
    level = l
  }
  return s + level * (b - from)
}

// Myerson's payment b·x(b) − ∫₀ᵇ x; for the lottery the closed form
// −bH/(b + H) + H ln(1 + b/H).
export function myersonPay(rule, b) {
  if (rule.id === 'lottery') return b <= 0 ? 0 : (-b * rule.H) / (b + rule.H) + rule.H * Math.log1p(b / rule.H)
  return b * alloc(rule, b) - area(rule, b)
}

// The generalized second price for the two slots: each slot pays the next bid
// per click, so the top slot pays h1 = 60 per click (1 click) and the second
// h2 = 30 per click (α clicks). A tie is a coin.
export function gspPay(rule, b) {
  const [h1, h2] = SLOT_BIDS
  const a = rule.alpha
  const top = h1
  const second = h2 * a
  if (b > h1) return top
  if (b === h1) return (top + second) / 2
  if (b > h2) return second
  if (b === h2) return second / 2
  return 0
}

// What a bidder pays for a report r under a payment rule.
export function pay(rule, payRule, r) {
  if (payRule === 'myerson') return myersonPay(rule, r)
  if (payRule === 'bid') return r * alloc(rule, r) // the winner pays her bid (per click for the slots)
  if (payRule === 'gsp') {
    if (rule.id !== 'slots') throw new Error('the generalized second price is for the slots only')
    return gspPay(rule, r)
  }
  throw new Error(`unknown payment rule ${payRule}`)
}

export const payoff = (rule, payRule, v, r) => v * alloc(rule, r) - pay(rule, payRule, r)

// The curve x(z) from `from` to `to` as a polyline: the steps drawn as
// vertical jumps, the lottery sampled every 0.5.
export function curve(rule, from = 0, to = 100) {
  if (to <= from) return [[from, alloc(rule, from)]]
  if (rule.id === 'lottery') {
    const pts = []
    for (let z = from; z < to; z += 0.5) pts.push([z, alloc(rule, z)])
    pts.push([to, alloc(rule, to)])
    return pts
  }
  const left = (z) => {
    let level = 0
    for (const [t, l] of rule.steps) {
      if (z > t) level = l
      else break
    }
    return level
  }
  const pts = [[from, left(from + 1e-9)]]
  let level = pts[0][1]
  for (const [t, l] of rule.steps) {
    if (t <= from || t >= to) continue
    pts.push([t, level], [t, l])
    level = l
  }
  pts.push([to, level])
  return pts
}

// F1's readouts for a bid b: x(b), Myerson's p(b), and the payoff when b is
// the value (the area under the curve).
export const f1Readout = (rule, b) => ({ x: alloc(rule, b), p: myersonPay(rule, b), payoff: area(rule, b) })

// Panel A: the payoff of every report r from 0 to 100 in steps of `step`, the
// truth's payoff, the best payoff, the best reports as intervals, and whether
// the truth is a best report (within 1e-9).
export function scanReports(rule, payRule, v, step = 0.1) {
  const m = Math.round(100 / step)
  const pts = new Array(m + 1)
  let best = -Infinity
  for (let i = 0; i <= m; i++) {
    const r = Math.round(i * step * 1e6) / 1e6
    const u = payoff(rule, payRule, v, r)
    pts[i] = [r, u]
    if (u > best) best = u
  }
  const truth = payoff(rule, payRule, v, v)
  const tol = 1e-9
  const ranges = []
  for (let i = 0; i <= m; i++) {
    if (pts[i][1] < best - tol) continue
    const last = ranges[ranges.length - 1]
    if (last && last.i1 === i - 1) {
      last.i1 = i
      last.to = pts[i][0]
    } else ranges.push({ i0: i, i1: i, from: pts[i][0], to: pts[i][0] })
  }
  return { pts, truth, best: Math.max(best, truth), ranges, truthBest: truth >= best - tol }
}

// The α below which the generalized second price happens to make the truth a
// best report for a value v (the rivals bid 60 and 30): above 60 the truth wins
// the top slot, v − 60, against α(v − 30) for the second; at 60 a tie gives
// half of each; below 60 the truth is always best (null).
export function gspThreshold(v) {
  const [h1, h2] = SLOT_BIDS
  if (v < h1) return null
  return (v - h1) / (v - h2)
}
