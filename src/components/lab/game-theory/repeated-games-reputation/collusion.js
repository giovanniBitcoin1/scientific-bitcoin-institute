// Module 06, Panel A "Can the cartel hold?": module 02's market, price
// 10 − Q, cost 1 (so a − c = 9), played again and again by n firms. The
// punishment is a return to the stage equilibrium for ever (Cournot, or
// price = cost with Bertrand). Pure logic, shared by the panel and by
// scripts/lab/check-game-theory-06.mjs.

export const A = 9 // a − c

// ------------------------------------------------------------------ Cournot

export function cournotProfit(n) {
  return (A / (n + 1)) ** 2
}

export function cartelOutput(n) {
  return A / 2 / n
}

export function cartelProfit(n) {
  return (A / 2) ** 2 / n
}

// A firm's profit when it produces q and the n − 1 others produce qo each.
export function profit(q, qo, n) {
  return Math.max(0, A - q - (n - 1) * qo) * q
}

// The best reply to n − 1 firms producing q each.
export function cheatOutput(q, n) {
  return Math.max(0, (A - (n - 1) * q) / 2)
}

export function cheatProfit(q, n) {
  return cheatOutput(q, n) ** 2
}

// The least δ for which the cartel holds with a return to Cournot for ever:
// (π_D − π_C)/(π_D − π_N) = (n + 1)²/(n² + 6n + 1).
export function cournotThreshold(n) {
  return (n + 1) ** 2 / (n * n + 6 * n + 1)
}

// Below the threshold, the most restrictive symmetric output that holds: the
// root other than the Cournot output of
// (9 − nq)q = (1 − δ)((9 − (n − 1)q)/2)² + δ(9/(n + 1))².
export function heldOutputClosed(delta, n) {
  const k = (1 - delta) * (n + 1) ** 2 + 4 * delta
  return (A * k) / ((n + 1) * (4 * n + (1 - delta) * (n - 1) ** 2))
}

// The condition itself: holding q pays at least cheating once and being
// punished for ever (positive when q holds).
export function holdMargin(q, delta, n) {
  return profit(q, q, n) - (1 - delta) * cheatProfit(q, n) - delta * cournotProfit(n)
}

// The same root by bisection on the condition, between the cartel output
// (where the condition fails below the threshold) and the Cournot output.
export function heldOutputBisect(delta, n, iters = 200) {
  let lo = cartelOutput(n)
  let hi = A / (n + 1)
  if (holdMargin(lo, delta, n) >= 0) return lo
  for (let i = 0; i < iters; i++) {
    const mid = (lo + hi) / 2
    if (mid === lo || mid === hi) break
    // Just below the Cournot output the condition holds (the margin is a
    // concave function of q that vanishes at the Cournot output).
    if (holdMargin(mid, delta, n) >= 0) hi = mid
    else lo = mid
  }
  return hi
}

// What can be held at δ: the output (never below the cartel's) and the
// profit per firm and round.
export function heldCournot(delta, n) {
  const q = delta >= cournotThreshold(n) - 1e-12 ? cartelOutput(n) : Math.max(cartelOutput(n), heldOutputClosed(delta, n))
  return { q, profit: profit(q, q, n) }
}

// ------------------------------------------------------------------ Bertrand

// Identical goods: the cartel asks 5.5 (the monopoly price), each firm
// earns 20.25/n; a cheat undercuts by a hair and takes 20.25; punishment:
// price = cost for ever, profit 0. The threshold is (n − 1)/n whatever the
// price above cost: all or nothing.
export const CARTEL_PRICE = 5.5
export const COST = 1

export function bertrandThreshold(n) {
  return (n - 1) / n
}

export function bertrand(n) {
  return { punishment: 0, cartel: (A / 2) ** 2 / n, cheat: (A / 2) ** 2 }
}

export function heldBertrand(delta, n) {
  const ok = delta >= bertrandThreshold(n) - 1e-12
  return { price: ok ? CARTEL_PRICE : COST, profit: ok ? (A / 2) ** 2 / n : 0 }
}

// ------------------------------------------------------------------ Panel

export function levels(n, mode) {
  if (mode === 'bertrand') return { ...bertrand(n), threshold: bertrandThreshold(n) }
  return { punishment: cournotProfit(n), cartel: cartelProfit(n), cheat: cheatProfit(cartelOutput(n), n), threshold: cournotThreshold(n) }
}

export function held(delta, n, mode) {
  const L = levels(n, mode)
  const h = mode === 'bertrand' ? heldBertrand(delta, n) : heldCournot(delta, n)
  const share = (h.profit - L.punishment) / (L.cartel - L.punishment)
  return { ...h, share }
}

// The chart: profit held against δ from 0 to 1 (points steps apart).
export function curve(n, mode, steps = 200) {
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const d = Math.min(i / steps, 0.999999)
    pts.push([i / steps, held(d, n, mode).profit])
  }
  return pts
}

export function thresholdTable() {
  const rows = []
  for (let n = 2; n <= 10; n++) rows.push({ n, cournot: cournotThreshold(n), bertrand: bertrandThreshold(n) })
  return rows
}
