// Bargaining by alternating offers over a pie of 1 that shrinks while the
// players argue, solved from the last round. Pure logic, shared by Figure F2
// and scripts/lab/check-game-theory-04.mjs.

// ------------------------------------------------------------------ Alternating offers

export const DEFAULT_DELTA = 0.9
export const DEFAULT_ROUNDS = 10

// The first proposer's share of the pie (as it is when the first offer is
// made) with T rounds at most. Player 1 proposes in odd rounds, player 2 in
// even ones; a responder accepts any offer worth at least what it would get
// by refusing, its own share of the next round discounted by its δ. With
// one δ for both, d2 = d1.
export function firstShare(T, d1, d2 = d1) {
  // s[i]: the share of whoever proposes when i rounds are left.
  let mine = 1 // one round left: the proposer takes all
  let proposer = T % 2 === 1 ? 1 : 2 // who proposes in the last round
  for (let left = 2; left <= T; left++) {
    // The proposer of this round is the other one; the responder is the
    // proposer of the next round and must be left δ_responder × its share.
    const responderDelta = proposer === 1 ? d1 : d2
    mine = 1 - responderDelta * mine
    proposer = proposer === 1 ? 2 : 1
  }
  return mine
}

export const shares = (T, d1, d2 = d1) => Array.from({ length: T }, (_, k) => firstShare(k + 1, d1, d2))

// With no last round (Rubinstein 1982): (1 − δ2)/(1 − δ1 δ2), which is
// 1/(1 + δ) when both have the same δ.
export const rubinstein = (d1, d2 = d1) => (1 - d2) / (1 - d1 * d2)
