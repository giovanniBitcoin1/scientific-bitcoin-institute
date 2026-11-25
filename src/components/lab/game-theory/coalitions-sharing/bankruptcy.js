// An estate that cannot pay its debts, for Panel C: claims d_i and an estate
// E ≤ D = Σ d_i, divided by five rules, exactly (fractions from module 08's
// frac.js). The game of the estate, v(S) = max(0, E − Σ_{j∉S} d_j), is what
// S gets once everyone outside it has been paid in full.

import { frac, ZERO, add, sub, mul, div, cmp, toNumber } from '../congestion-price-of-anarchy/frac.js'
import { makeGame, shapley, orders, full, members } from './coalitions.js'

const F = (v) => (typeof v === 'object' && v !== null && 'n' in v ? v : frac(v))
const min = (a, b) => (cmp(a, b) <= 0 ? a : b)
const max = (a, b) => (cmp(a, b) >= 0 ? a : b)
const half = (a) => div(a, frac(2))

export const RULES = ['proportional', 'cea', 'cel', 'talmud', 'shapley']

export function proportional(d, E) {
  const D = d.map(F).reduce(add, ZERO)
  return d.map((x) => (D.n === 0n ? ZERO : div(mul(F(E), F(x)), D)))
}

// Constrained equal awards: the same amount to each, but no one above her
// claim. Claims in increasing order: whoever asks less than an equal share of
// what is left gets her claim in full.
export function cea(d, E) {
  const claims = d.map(F)
  const order = claims.map((_, i) => i).sort((a, b) => cmp(claims[a], claims[b]) || a - b)
  const out = claims.map(() => ZERO)
  let rest = F(E)
  let left = claims.length
  for (const i of order) {
    const share = div(rest, frac(left))
    if (cmp(claims[i], share) <= 0) {
      out[i] = claims[i]
      rest = sub(rest, claims[i])
      left--
    } else {
      for (const j of order.slice(order.indexOf(i))) out[j] = share
      return out
    }
  }
  return out
}

// Constrained equal losses: the same loss for each, but no one below 0. The
// losses are an equal-awards division of D − E.
export function cel(d, E) {
  const D = d.map(F).reduce(add, ZERO)
  const loss = cea(d, sub(D, F(E)))
  return d.map((x, i) => sub(F(x), loss[i]))
}

// The Talmud's rule: below D/2, equal awards on the half-claims; above, each
// first gets half her claim and the rest is divided by equal losses on the
// other halves.
export function talmud(d, E) {
  const halves = d.map((x) => half(F(x)))
  const D = d.map(F).reduce(add, ZERO)
  if (cmp(F(E), half(D)) <= 0) return cea(halves, E)
  const rest = cel(halves, sub(F(E), half(D)))
  return halves.map((h, i) => add(h, rest[i]))
}

export function estateGame(d, E) {
  const n = d.length
  const claims = d.map(F)
  return makeGame(n, (m) => {
    const outside = members(full(n) & ~m, n).reduce((s, j) => add(s, claims[j]), ZERO)
    return max(ZERO, sub(F(E), outside))
  })
}

export const shapleyRule = (d, E) => shapley(estateGame(d, E))

// Random arrival (O'Neill 1982): the creditors arrive in a random order and
// each is paid in full while money remains. Averaged over the n! orders.
export function randomArrival(d, E) {
  const claims = d.map(F)
  const all = orders(d.length)
  const tot = claims.map(() => ZERO)
  for (const o of all) {
    let rest = F(E)
    for (const i of o) {
      const pay = min(claims[i], rest)
      tot[i] = add(tot[i], pay)
      rest = sub(rest, pay)
    }
  }
  return tot.map((t) => div(t, frac(all.length)))
}

export const RULE_FN = { proportional, cea, cel, talmud, shapley: shapleyRule }
export const divide = (rule, d, E) => RULE_FN[rule](d, E)
export const allRules = (d, E) => Object.fromEntries(RULES.map((r) => [r, divide(r, d, E)]))

// The chart: each creditor's award against E, from 0 to D in steps of `step`.
export function curves(rule, d, step = 5) {
  const D = d.reduce((s, x) => s + x, 0)
  const pts = d.map(() => [])
  for (let E = 0; E <= D; E += step) {
    const a = divide(rule, d, E)
    a.forEach((x, i) => pts[i].push([E, toNumber(x)]))
  }
  if (D % step) {
    const a = divide(rule, d, D)
    a.forEach((x, i) => pts[i].push([D, toNumber(x)]))
  }
  return pts
}

export const TALMUD = { claims: [100, 200, 300], estates: [100, 200, 300] }
