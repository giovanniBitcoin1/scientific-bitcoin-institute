// Module 06, Panel C "A reputation for toughness": the chain store with a
// little doubt, after Kreps and Wilson (1982). A chain present in N markets
// meets one newcomer per market, in turn. Payoffs of modules 04 and 05,
// written (newcomer, incumbent): stay out (0, 4); enter and share (2, 2);
// enter and fight (w, 3) if the incumbent is tough, (w, 0) if weak.
// With probability t the incumbent is tough; the newcomers watch.
// Pure logic, shared by the panel and scripts/lab/check-game-theory-06.mjs.
import { mulberry32 } from '../../rng.js'

export const DEFAULTS = { t: 0.05, N: 20, w: -1 }
export const PAY = { out: [0, 4], share: [2, 2], fightTough: 3, fightWeak: 0 }
export const TIE = 1e-12

// b = 2/(2 − w): module 05's threshold t*, 2/3 at w = −1.
export function base(w) {
  return 2 / (2 - w)
}

// The equilibrium of Kreps and Wilson, with k the markets left (this one
// included) and p the newcomers' belief that the incumbent is tough.
//   The newcomer stays out if p ≥ b^k and enters if p < b^k. At p = b^k
//   exactly it is indifferent and stays out: in Kreps and Wilson's model the
//   newcomer's payoffs are written with a parameter a, and with these
//   payoffs a = 1, which puts the tie on the side of staying out. Ties
//   within 1e-12 count as staying out (as in module 05).
//   After entry the tough incumbent fights; a weak one shares if k = 1,
//   fights if p ≥ b^(k−1), and otherwise fights with the probability
//   β = p(1 − b^(k−1))/((1 − p) b^(k−1)), which makes the belief after a
//   fight exactly b^(k−1).
//   After a fight the belief becomes max(p, b^(k−1)) (k > 1); after a share
//   it becomes 0; after "stay out" it does not change; a belief of 0 stays 0
//   whatever happens.
export function staysOut(p, k, b) {
  return p >= b ** k - TIE
}

export function fightProb(p, k, b) {
  if (k <= 1 || p <= 0) return 0
  const bk1 = b ** (k - 1)
  if (p >= bk1 - TIE) return 1
  return (p * (1 - bk1)) / ((1 - p) * bk1)
}

export function afterFight(p, k, b) {
  if (p <= 0) return 0
  if (k <= 1) return p
  return Math.max(p, b ** (k - 1))
}

// D: the markets where entry is deterred from the start, the k with
// t ≥ b^k (ties counted as staying out), among k = 1 … N.
export function deterred(t, N, b) {
  let D = 0
  for (let k = 1; k <= N; k++) if (t > 0 && staysOut(t, k, b)) D++
  return D
}

// The exact expected entries and fights against a weak incumbent, by
// recursion over (p, k), the belief rounded to 1e-12 for memoization.
export function expectWeak(t, N, w) {
  const b = base(w)
  const memo = new Map()
  const go = (p, k) => {
    if (k === 0) return { entries: 0, fights: 0 }
    const key = `${Math.round(p * 1e12)}|${k}`
    const hit = memo.get(key)
    if (hit) return hit
    let r
    if (p > 0 && staysOut(p, k, b)) {
      r = go(p, k - 1)
    } else {
      const f = fightProb(p, k, b)
      const shared = go(0, k - 1)
      if (f > 0) {
        const fought = go(afterFight(p, k, b), k - 1)
        r = {
          entries: 1 + f * fought.entries + (1 - f) * shared.entries,
          fights: f * (1 + fought.fights) + (1 - f) * shared.fights,
        }
      } else {
        r = { entries: 1 + shared.entries, fights: shared.fights }
      }
    }
    memo.set(key, r)
    return r
  }
  return go(t, N)
}

// The payoffs. The weak incumbent is indifferent wherever it mixes, so its
// payoff is the same in every chain: 4 in each deterred market and 2 in each
// other, 4D + 2(N − D), against 2N without doubt. The tough incumbent always
// fights; its path is fixed: computed by playing it.
export function weakPayoff(t, N, w) {
  const D = deterred(t, N, base(w))
  return 4 * D + 2 * (N - D)
}

export function toughPath(t, N, w) {
  const b = base(w)
  let p = t
  let pay = 0
  let entries = 0
  const moves = []
  for (let k = N; k >= 1; k--) {
    if (p > 0 && staysOut(p, k, b)) {
      pay += PAY.out[1]
      moves.push('out')
    } else {
      entries++
      pay += PAY.fightTough
      moves.push('fight')
      p = afterFight(p, k, b)
    }
  }
  return { pay, entries, moves }
}

// One history. `type` is 'weak', 'tough' or 'drawn' (tough with
// probability t). Returns the moves, the belief before each market, the
// threshold b^k of each market, the incumbent's payoff and the type.
export function history({ t, N, w }, type = 'drawn', seed = 1) {
  const random = mulberry32(seed)
  const b = base(w)
  const tough = type === 'tough' || (type === 'drawn' && random() < t)
  let p = t
  const markets = []
  let pay = 0
  for (let k = N; k >= 1; k--) {
    const before = p
    const bk = b ** k
    let move
    if (p > 0 && staysOut(p, k, b)) {
      move = 'out'
      pay += PAY.out[1]
    } else if (tough) {
      move = 'fight'
      pay += PAY.fightTough
      p = afterFight(p, k, b)
    } else {
      const f = fightProb(p, k, b)
      if (f > 0 && (f >= 1 || random() < f)) {
        move = 'fight'
        pay += PAY.fightWeak
        p = afterFight(p, k, b)
      } else {
        move = 'share'
        pay += PAY.share[1]
        p = 0
      }
    }
    markets.push({ k, belief: before, threshold: bk, move })
  }
  return { markets, pay, tough }
}

// Many chains against a weak incumbent: average entries and fights, and the
// smallest and largest payoff (equal, since the weak incumbent is indifferent
// wherever it mixes).
export function simulateWeak({ t, N, w }, chains = 10000, seed = 1) {
  const random = mulberry32(seed)
  const b = base(w)
  let entries = 0
  let fights = 0
  let minPay = Infinity
  let maxPay = -Infinity
  for (let c = 0; c < chains; c++) {
    let p = t
    let pay = 0
    for (let k = N; k >= 1; k--) {
      if (p > 0 && staysOut(p, k, b)) {
        pay += PAY.out[1]
        continue
      }
      entries++
      const f = fightProb(p, k, b)
      if (f > 0 && (f >= 1 || random() < f)) {
        fights++
        pay += PAY.fightWeak
        p = afterFight(p, k, b)
      } else {
        pay += PAY.share[1]
        p = 0
      }
    }
    if (pay < minPay) minPay = pay
    if (pay > maxPay) maxPay = pay
  }
  return { entries: entries / chains, fights: fights / chains, minPay, maxPay }
}
