// Exact fractions on BigInt, for the atomic games of Panels B and C: costs
// such as k/n, c = m/20 and (1 + ε)/n_e are rational, and the dynamics must
// tell "strictly cheaper" from "equal" without rounding. Immutable values
// { n, d } with d > 0 and gcd(n, d) = 1.

const big = (v) => (typeof v === 'bigint' ? v : BigInt(v))
const gcd = (a, b) => {
  a = a < 0n ? -a : a
  b = b < 0n ? -b : b
  while (b) [a, b] = [b, a % b]
  return a
}

export function frac(n, d = 1) {
  n = big(n)
  d = big(d)
  if (d === 0n) throw new Error('zero denominator')
  if (d < 0n) {
    n = -n
    d = -d
  }
  const g = gcd(n, d) || 1n
  return { n: n / g, d: d / g }
}

// A decimal written with up to `places` digits (a slider value such as 0.05
// or 0.1) as an exact fraction.
export function fromDecimal(x, places = 6) {
  const s = 10 ** places
  return frac(Math.round(x * s), s)
}

export const ZERO = frac(0)
export const ONE = frac(1)
export const add = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d)
export const sub = (a, b) => frac(a.n * b.d - b.n * a.d, a.d * b.d)
export const mul = (a, b) => frac(a.n * b.n, a.d * b.d)
export const div = (a, b) => frac(a.n * b.d, a.d * b.n)
export const cmp = (a, b) => {
  const x = a.n * b.d - b.n * a.d
  return x < 0n ? -1 : x > 0n ? 1 : 0
}
export const eq = (a, b) => a.n === b.n && a.d === b.d
export const lt = (a, b) => cmp(a, b) < 0
export const sum = (xs) => xs.reduce(add, ZERO)
export const toNumber = (a) => Number(a.n) / Number(a.d)
export const show = (a) => (a.d === 1n ? `${a.n}` : `${a.n}/${a.d}`)

// H_k = 1 + 1/2 + ... + 1/k, exactly.
export function harmonic(k) {
  let h = ZERO
  for (let i = 1; i <= k; i++) h = add(h, frac(1, i))
  return h
}
