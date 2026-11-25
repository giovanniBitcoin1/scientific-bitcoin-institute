import { CLASSICS, twoByTwo } from '../what-is-a-game/games.js'
import { penaltyGame, rps, SHAPLEY } from './mixed.js'
import { equilibria } from './support.js'

// Fictitious play (Brown 1951). Round 1 is a fixed starting cell. From round
// 2 on each player plays a best response to the counts of the other's past
// moves, both at the same time; ties go to the first strategy. Pure logic,
// shared by Panel B and scripts/lab/check-game-theory-03.mjs.

export const FP_GAMES = {
  pennies: { game: twoByTwo(CLASSICS.pennies, ['H', 'T'], ['H', 'T']), start: [0, 0], zeroSum: true },
  penalty: { game: penaltyGame(), start: [0, 0], zeroSum: true },
  rps: { game: rps(1), start: [0, 0], zeroSum: true },
  rps2: { game: rps(2), start: [0, 0], zeroSum: true },
  shapley: { game: SHAPLEY, start: [0, 1], zeroSum: false },
}
export const FP_IDS = ['pennies', 'penalty', 'rps', 'rps2', 'shapley']
export const MARKS = [100, 1000, 10000, 100000]
export const DEFAULT_ROUNDS = 10000

// The one equilibrium of each game (all five have exactly one).
export function equilibriumOf(id) {
  const [e] = equilibria(FP_GAMES[id].game)
  return e
}

const argmax = (v) => {
  let k = 0
  for (let i = 1; i < v.length; i++) if (v[i] > v[k]) k = i
  return k
}

// Play `rounds` rounds. Returns the frequencies at log-spaced rounds (for
// the chart) and at the marks, the largest gap from the equilibrium at the
// marks and the smallest from round `from` on, the lengths of the runs (how
// long the play stays in one cell), and the row player's average payoff.
export function play(id, rounds = DEFAULT_ROUNDS, { samples = 160, from = 100 } = {}) {
  const { game, start } = FP_GAMES[id]
  const { a, b } = game
  const m = a.length
  const n = a[0].length
  const eq = equilibriumOf(id)
  const rowCount = new Array(m).fill(0)
  const colCount = new Array(n).fill(0)
  // Payoff of each strategy against the other's counts so far.
  const rowScore = new Array(m).fill(0)
  const colScore = new Array(n).fill(0)
  const sampleAt = new Set()
  for (let s = 0; s <= samples; s++) sampleAt.add(Math.max(1, Math.round(10 ** ((s / samples) * Math.log10(rounds)))))
  const series = []
  const atMarks = {}
  const runs = []
  let runLength = 0
  let last = null
  let total = 0
  let minGap = Infinity
  let minGapAt = 0
  let i = start[0]
  let j = start[1]
  for (let t = 1; t <= rounds; t++) {
    if (t > 1) {
      i = argmax(rowScore)
      j = argmax(colScore)
    }
    rowCount[i]++
    colCount[j]++
    for (let k = 0; k < m; k++) rowScore[k] += a[k][j]
    for (let k = 0; k < n; k++) colScore[k] += b[i][k]
    total += a[i][j]
    const cell = i * n + j
    if (cell === last) runLength++
    else {
      if (last != null) runs.push(runLength)
      runLength = 1
      last = cell
    }
    const need = sampleAt.has(t) || MARKS_SET.has(t) || t >= from
    if (need) {
      const x = rowCount.map((c) => c / t)
      const y = colCount.map((c) => c / t)
      const gap = Math.max(...x.map((v, k) => Math.abs(v - eq.x[k])), ...y.map((v, k) => Math.abs(v - eq.y[k])))
      if (t >= from && gap < minGap) {
        minGap = gap
        minGapAt = t
      }
      if (sampleAt.has(t)) series.push({ t, x, y, gap })
      if (MARKS_SET.has(t)) atMarks[t] = { x, y, gap, average: total / t }
    }
  }
  runs.push(runLength)
  return {
    eq,
    series,
    atMarks,
    runs,
    final: { x: rowCount.map((c) => c / rounds), y: colCount.map((c) => c / rounds), average: total / rounds },
    minGap: rounds >= from ? minGap : null,
    minGapAt,
    value: eq.u,
  }
}
const MARKS_SET = new Set(MARKS)

