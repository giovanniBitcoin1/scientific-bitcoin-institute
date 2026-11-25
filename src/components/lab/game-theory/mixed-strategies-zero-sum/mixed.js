import { makeGame } from '../what-is-a-game/games.js'
import { CLASSICS, twoByTwo } from '../what-is-a-game/games.js'

// Two-by-two games with mixing: the closed formulas of the indifference
// rule, the best-response lines of the square (Figure F1), and the best
// worst case of the penalty kick (Figure F2, exercise 3). Pure logic, shared
// by the figures, the panels and scripts/lab/check-game-theory-03.mjs.
//
// p is the probability that the row player plays the first row, q the
// probability that the column player plays the first column.

// ------------------------------------------------------------------ Games

// The penalty kick: rows the kicker (left, right), columns the keeper (left,
// right); the kicker's payoff is the scoring rate in per cent, the keeper's
// 100 minus it. Sides are named from the kicker's natural side.
export const PENALTY = { LL: 58.3, LR: 94.97, RL: 92.91, RR: 69.92 }
export const TRAINED = { ...PENALTY, RR: 80 }

export const penaltyGame = (r = PENALTY, rows = ['L', 'R'], cols = ['L', 'R']) =>
  makeGame(rows, cols, [
    [[r.LL, round2(100 - r.LL)], [r.LR, round2(100 - r.LR)]],
    [[r.RL, round2(100 - r.RL)], [r.RR, round2(100 - r.RR)]],
  ])
const round2 = (v) => Math.round(v * 100) / 100

export const EXERCISE_1 = makeGame(['U', 'D'], ['L', 'R'], [
  [[3, 1], [0, 2]],
  [[1, 3], [2, 0]],
])

// Rock-paper-scissors with a win of rock over scissors worth w (1 in the
// classic game); zero-sum.
export function rps(w = 1, names = ['R', 'P', 'S']) {
  const a = [
    [0, -1, w],
    [1, 0, -1],
    [-w, 1, 0],
  ]
  return makeGame(names, names, a.map((row) => row.map((v) => [v, v === 0 ? 0 : -v])))
}

// Shapley's game (1964): fictitious play goes round it without settling.
export const SHAPLEY = makeGame(['1', '2', '3'], ['A', 'B', 'C'], [
  [[0, 0], [0, 1], [1, 0]],
  [[1, 0], [0, 0], [0, 1]],
  [[0, 1], [1, 0], [0, 0]],
])

// Exercise 5: the row player's payoffs against L and R are U (4, 0), M (1, 1),
// D (0, 4); the column player gets 4 minus them (a constant-sum game).
export function exercise5(mid = [1, 1]) {
  const rowsA = [[4, 0], mid, [0, 4]]
  return makeGame(['U', 'M', 'D'], ['L', 'R'], rowsA.map((r) => r.map((v) => [v, 4 - v])))
}

export const classic = (id, names) => twoByTwo(CLASSICS[id], names, names)

// Does the mix with weight w on the first row and 1 − w on the last pay
// strictly more than the middle row against every column? Rows are the row
// player's payoffs, e.g. [[4, 0], [1, 1], [0, 4]].
export function mixDominates(rowsA, w) {
  const [top, mid, bottom] = rowsA
  return top.every((_, j) => w * top[j] + (1 - w) * bottom[j] > mid[j])
}

// ------------------------------------------------------------------ Two by two

// The column mix q that leaves the row player indifferent, and the row mix p
// that leaves the column player indifferent (null when there is none).
export function indifferenceQ(g) {
  const [[a00, a01], [a10, a11]] = g.a
  const den = a00 - a10 + (a11 - a01)
  return den === 0 ? null : (a11 - a01) / den
}
export function indifferenceP(g) {
  const [[b00, b01], [b10, b11]] = g.b
  const den = b00 - b01 + (b11 - b10)
  return den === 0 ? null : (b11 - b10) / den
}

// The mixed equilibrium with both probabilities strictly inside (0, 1), or null.
export function mixed2x2(g) {
  const p = indifferenceP(g)
  const q = indifferenceQ(g)
  if (p == null || q == null || !(p > 0 && p < 1 && q > 0 && q < 1)) return null
  const u = q * g.a[0][0] + (1 - q) * g.a[0][1]
  const v = p * g.b[0][0] + (1 - p) * g.b[1][0]
  return { p, q, u, v }
}

// The row player's gain from the first row over the second against q, and
// the column player's gain from the first column over the second against p.
export const rowGain = (g, q) => (g.a[0][0] - g.a[1][0]) * q + (g.a[0][1] - g.a[1][1]) * (1 - q)
export const colGain = (g, p) => (g.b[0][0] - g.b[0][1]) * p + (g.b[1][0] - g.b[1][1]) * (1 - p)

// A best-response line of the square as a polyline in (q, p) coordinates.
// The row player's: p as a function of q; the column player's: q as a
// function of p. A gain of 0 on a whole interval does not happen in the
// presets; if it does the line is drawn at the middle.
function stepLine(gain) {
  const g0 = gain(0)
  const g1 = gain(1)
  const level = (v) => (v > 0 ? 1 : v < 0 ? 0 : 0.5)
  if (g0 === g1 || Math.sign(g0) === Math.sign(g1) || g0 === 0 || g1 === 0) {
    // No switch inside: one level, except a switch exactly at an end.
    if (g0 === 0 && g1 !== 0) return [[0, 0], [0, 1], [0, level(g1)], [1, level(g1)]]
    if (g1 === 0 && g0 !== 0) return [[0, level(g0)], [1, level(g0)], [1, 0], [1, 1]]
    return [[0, level(g0)], [1, level(g0)]]
  }
  const t = g0 / (g0 - g1)
  return [[0, level(g0)], [t, level(g0)], [t, level(g1)], [1, level(g1)]]
}

// Points [q, p].
export const rowLine = (g) => stepLine((q) => rowGain(g, q))
export const colLine = (g) => stepLine((p) => colGain(g, p)).map(([p, q]) => [q, p])

// ------------------------------------------------------------------ Best worst case

// Kicker: x = probability of shooting left. Against the keeper going left the
// scoring rate is x LL + (1 − x) RL, against the keeper going right
// x LR + (1 − x) RR. The kicker's best worst case is the highest point of the
// lower of the two lines. Keeper: y = probability of going left; the kicker
// scores y LL + (1 − y) LR shooting left and y RL + (1 − y) RR shooting
// right; the keeper's best worst case is the lowest point of the higher line.
export const vsKeeperLeft = (r, x) => x * r.LL + (1 - x) * r.RL
export const vsKeeperRight = (r, x) => x * r.LR + (1 - x) * r.RR
export const shootLeft = (r, y) => y * r.LL + (1 - y) * r.LR
export const shootRight = (r, y) => y * r.RL + (1 - y) * r.RR

function bestOf(f1, f2, better) {
  // f1, f2 linear on [0, 1]; better(a, b) true when a is better than b.
  const cands = [0, 1]
  const d0 = f1(0) - f2(0)
  const d1 = f1(1) - f2(1)
  if (d0 !== d1) {
    const t = d0 / (d0 - d1)
    if (t > 0 && t < 1) cands.push(t)
  }
  const worst = (t) => (better(f1(t), f2(t)) ? f2(t) : f1(t))
  let best = cands[0]
  for (const t of cands) if (better(worst(t), worst(best))) best = t
  return { at: best, value: worst(best), inside: best > 0 && best < 1 }
}

export function minimax(r) {
  const kicker = bestOf((x) => vsKeeperLeft(r, x), (x) => vsKeeperRight(r, x), (a, b) => a > b)
  const keeper = bestOf((y) => shootLeft(r, y), (y) => shootRight(r, y), (a, b) => a < b)
  return {
    kickerLeft: kicker.at,
    keeperLeft: keeper.at,
    value: kicker.value,
    keeperValue: keeper.value,
    inside: kicker.inside && keeper.inside,
    alwaysLeft: Math.min(r.LL, r.LR),
    alwaysRight: Math.min(r.RL, r.RR),
  }
}
