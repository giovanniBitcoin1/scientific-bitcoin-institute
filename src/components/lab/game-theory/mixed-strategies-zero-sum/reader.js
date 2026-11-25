import { mulberry32 } from '../../rng.js'

// Panel C, "Can you be read?": matching pennies against a machine that
// guesses the reader's next move from what the reader did after the same
// last two moves earlier in the game (ties and no data: heads). The machine
// wins when it guesses right. Moves are 'H' and 'T'. Pure logic, shared by
// Panel C and scripts/lab/check-game-theory-03.mjs.

export const PLAYERS = 400
export const ROUNDS = 2000
export const COIN_ROUNDS = 100
export const SIM_SEED = 8100 // the simulated players
export const COIN_SEED = 8200 // "Let a coin play 100 rounds for me"
export const DEFAULT_S = 0.6
export const DEFAULT_H = 0.6

// The machine's state: counts of H and T after each pair of moves.
export function newMachine() {
  return { counts: { HH: [0, 0], HT: [0, 0], TH: [0, 0], TT: [0, 0] }, prev: '' }
}

// The guess for the next move, fixed before the reader chooses.
export function guess(machine) {
  if (machine.prev.length < 2) return 'H'
  const [h, t] = machine.counts[machine.prev]
  return t > h ? 'T' : 'H'
}

// Record the reader's move; returns true if the machine had guessed it.
export function record(machine, move) {
  const g = guess(machine)
  if (machine.prev.length === 2) machine.counts[machine.prev][move === 'H' ? 0 : 1]++
  machine.prev = (machine.prev + move).slice(-2)
  return g === move
}

// A whole sequence of moves: the machine's guess and the outcome of every
// round, and the machine's wins.
export function playSequence(moves) {
  const m = newMachine()
  const guesses = []
  const wins = []
  for (const mv of moves) {
    guesses.push(guess(m))
    wins.push(record(m, mv))
  }
  return { guesses, wins, machine: wins.filter(Boolean).length, rounds: moves.length }
}

// ------------------------------------------------------------------ Simulated players

// kind: 'switch' (changes side with probability s), 'heads' (heads with
// probability h), 'coin' (a fair coin). The first move of a switcher is a
// fair coin.
export function simulatedMoves(random, kind, rounds, param) {
  const out = []
  for (let t = 0; t < rounds; t++) {
    if (kind === 'switch') {
      if (t === 0) out.push(random() < 0.5 ? 'H' : 'T')
      else {
        const last = out[t - 1]
        out.push(random() < param ? (last === 'H' ? 'T' : 'H') : last)
      }
    } else if (kind === 'heads') out.push(random() < param ? 'H' : 'T')
    else out.push(random() < 0.5 ? 'H' : 'T')
  }
  return out
}

// The machine's win rate against one simulated player.
export function winRate(random, kind, rounds, param) {
  const m = newMachine()
  let wins = 0
  let last = null
  for (let t = 0; t < rounds; t++) {
    let mv
    if (kind === 'switch') mv = t === 0 ? (random() < 0.5 ? 'H' : 'T') : random() < param ? (last === 'H' ? 'T' : 'H') : last
    else if (kind === 'heads') mv = random() < param ? 'H' : 'T'
    else mv = random() < 0.5 ? 'H' : 'T'
    if (record(m, mv)) wins++
    last = mv
  }
  return wins / rounds
}

const SEED_OF = { switch: 0, heads: 1, coin: 2 }

// Many players of one kind, as a job for useExperiment.
// snapshot() → { players, mean, sd }.
export function simulateJob({ kind, param = 0.5, players = PLAYERS, rounds = ROUNDS, seed = SIM_SEED }) {
  const random = mulberry32(seed + 100 * SEED_OF[kind] + Math.round(1000 * param))
  const rates = []
  function* iter() {
    for (let k = 0; k < players; k++) {
      rates.push(winRate(random, kind, rounds, param))
      if (k % 4 === 3) yield (k + 1) / players
    }
  }
  const snapshot = () => {
    const n = rates.length || 1
    const mean = rates.reduce((s, v) => s + v, 0) / n
    const sd = Math.sqrt(rates.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(1, n - 1))
    return { players: rates.length, mean, sd, kind, param, rounds }
  }
  return { iter: iter(), snapshot }
}

export function simulate(cfg) {
  const job = simulateJob(cfg)
  for (const _ of job.iter); // eslint-disable-line no-unused-vars, no-empty
  return job.snapshot()
}

// "Let a coin play 100 rounds for me": press number k (0, 1, 2…) of the page.
export const coinMoves = (k) => simulatedMoves(mulberry32(COIN_SEED + k), 'coin', COIN_ROUNDS)
