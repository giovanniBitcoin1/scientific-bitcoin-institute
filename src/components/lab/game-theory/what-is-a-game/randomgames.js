import { mulberry32 } from '../../rng.js'
import { eliminate, stableCells, dominated } from './games.js'

// Random m × m games with payoffs independent and uniform on 0–1: how often
// something is strictly dominated, how often iterated elimination solves the
// game, and how many stable cells there are. Only dominance by a single other
// strategy is used. Pure logic, shared by Panel C and
// scripts/lab/check-game-theory-01.mjs.

export const SIZES = [2, 3, 4, 5, 6, 7, 8]
export const DEFAULT_SIZE = 3
export const DEFAULT_GAMES = 2000
export const SURVEY_SEED = 5100
export const SAMPLE_SEED = 5200

const names = (m, first) => Array.from({ length: m }, (_, i) => String.fromCharCode(first + i))

export function randomGame(random, m) {
  const a = []
  const b = []
  for (let i = 0; i < m; i++) {
    const ra = new Array(m)
    const rb = new Array(m)
    for (let j = 0; j < m; j++) {
      ra[j] = random()
      rb[j] = random()
    }
    a.push(ra)
    b.push(rb)
  }
  // Rows are numbered, columns lettered.
  return { rows: Array.from({ length: m }, (_, i) => String(i + 1)), cols: names(m, 65), a, b }
}

export function analyze(g) {
  const out = eliminate(g)
  return {
    dominatedAtStart: dominated(g).length > 0,
    cellsLeft: out.rows.length * out.cols.length,
    solved: out.rows.length === 1 && out.cols.length === 1,
    stable: stableCells(g).length,
  }
}

// The generator of size m always starts from the same seed, so the first G
// games are the same whether one size or all of them are surveyed.
export const seedOf = (m, seed = SURVEY_SEED) => seed + 1000 * m

function tally() {
  return { games: 0, dominated: 0, solved: 0, cells: 0, none: 0, one: 0, more: 0 }
}

function add(t, r) {
  t.games++
  if (r.dominatedAtStart) t.dominated++
  if (r.solved) t.solved++
  t.cells += r.cellsLeft
  if (r.stable === 0) t.none++
  else if (r.stable === 1) t.one++
  else t.more++
}

export function shares(t) {
  const n = t.games || 1
  return {
    games: t.games,
    dominated: t.dominated / n,
    solved: t.solved / n,
    cells: t.cells / n,
    none: t.none / n,
    one: t.one / n,
    more: t.more / n,
  }
}

// The survey of one or more sizes, as a job for useExperiment.
// snapshot() → { [m]: shares }.
export function surveyJob({ sizes, games, seed = SURVEY_SEED }) {
  const tallies = Object.fromEntries(sizes.map((m) => [m, tally()]))
  const total = sizes.length * games
  let done = 0
  function* iter() {
    for (const m of sizes) {
      const random = mulberry32(seedOf(m, seed))
      for (let k = 0; k < games; k++) {
        add(tallies[m], analyze(randomGame(random, m)))
        done++
        if (done % 20 === 0) yield done / total
      }
    }
  }
  return {
    iter: iter(),
    snapshot: () => Object.fromEntries(sizes.map((m) => [m, shares(tallies[m])])),
  }
}

export function survey(cfg) {
  const job = surveyJob(cfg)
  for (const _ of job.iter); // eslint-disable-line no-unused-vars, no-empty
  return job.snapshot()
}

// The sample game drawn in the panel: number `index` of size m.
export const sampleGame = (m, index = 0, seed = SAMPLE_SEED) => randomGame(mulberry32(seed + 1000 * m + index), m)
