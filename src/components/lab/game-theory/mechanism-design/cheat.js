// Panel C, "Who runs the auction?": module 11's block (auctions/block.js) with
// a miner who may add fake transactions of its own. A fake bid takes part in
// the rule like any other; if it wins, what it pays comes back to the miner.
// The users are not told: their bids stay as in module 11 (pay your bid: the
// equilibrium bids; uniform and monopolistic price: the values). Plain JS,
// seeded with the lab's mulberry32, the same draws as module 11's runBlocks.
//
// The cheating miner's best move is found by a search, block by block, over
// h high fakes (above every real bid, h = 0 … k) and at most one more fake
// just below the i-th highest real bid (i = 1 … n; a tie goes against the
// fake), with the rule then applied as written:
//   uniform price  the k highest bids win and pay the highest losing bid. The
//                  best: k − j high fakes and one just below the j-th real bid,
//                  which becomes the highest losing bid: max over j of j·v_(j);
//   pay your bid   fakes only push real users out: no gain;
//   monopolistic   every included user pays the lowest included bid, so the
//                  real users pay at most j·v_(j) for j of them, which the
//                  honest rule already takes: no gain (the self-check searches
//                  it by brute force).
import { mulberry32 } from '../../rng.js'
import { bidTable } from '../auctions/block.js'

export const BLOCK_COUNTS = [1000, 10000]
export const RULES = ['pyb', 'uniform', 'monopolistic']

// The uniform price with h high fakes and an extra fake just below the i-th
// real bid (i = 0: none). `at(t)` is the t-th highest real bid (t = 1 … n).
// Returns the real winners j and the price.
export function uniformWith(at, n, k, h, i) {
  const room = k - h // slots left for the reals and the extra fake
  if (i > 0 && i < room) {
    // The extra fake wins: one slot less for the reals.
    const j = Math.min(n, room - 1)
    return { j, price: j < n ? at(j + 1) : 0 }
  }
  if (i > 0 && i === room && i <= n) return { j: i, price: at(i) } // the highest losing bid
  const j = Math.min(n, room)
  return { j, price: j < n ? at(j + 1) : 0 }
}

// The search for one block: the best revenue j·price and its j (ties to the
// first found: h from 0, i from 0).
// For each h the n + 1 places of the extra fake give only three outcomes (the
// cases of uniformWith): no extra fake or one below the highest losing bid;
// one inside the block (i < k − h); one just below the (k − h)-th real bid,
// where it becomes the highest losing bid. The search takes them in this
// order, so the first best found is the same as over every i (the self-check
// compares the two, and both with a brute force over sets of fakes).
export function bestUniformCheat(at, n, k) {
  let best = -1
  let bestJ = 0
  const consider = (j, price) => {
    const rev = j * price
    if (rev > best + 1e-15) {
      best = rev
      bestJ = j
    }
  }
  for (let h = 0; h <= k; h++) {
    const room = k - h
    const j0 = Math.min(n, room)
    consider(j0, j0 < n ? at(j0 + 1) : 0) // no extra fake, or one below the price
    if (room >= 2 && n >= 1) {
      const j1 = Math.min(n, room - 1)
      consider(j1, j1 < n ? at(j1 + 1) : 0) // the extra fake wins a slot
    }
    if (room >= 1 && room <= n) consider(room, at(room)) // just below the room-th bid
  }
  return { revenue: best, j: bestJ }
}

// The search over every place i = 0 … n of the extra fake, with uniformWith
// (for the self-check).
export function bestUniformCheatFull(at, n, k) {
  let best = -1
  let bestJ = 0
  for (let h = 0; h <= k; h++) for (let i = 0; i <= n; i++) {
    const { j, price } = uniformWith(at, n, k, h, i)
    if (j * price > best + 1e-15) {
      best = j * price
      bestJ = j
    }
  }
  return { revenue: best, j: bestJ }
}

// One run of `blocks` blocks. For each rule, honest and cheating: the miner's
// revenue (mean, standard error), the users served and the users' total
// payoff, on the 0–100 scale. `sameAsMonopolistic` counts the blocks in which
// the cheating uniform price earns exactly what the monopolistic price earns.
export function runCheat({ n, k, blocks = 10000, seed = 1, bidFn }) {
  const random = mulberry32(seed)
  const bidOf = bidFn || (k < n ? bidTable(n, k, 1 << 14) : () => 0)
  const keys = []
  for (const r of RULES) keys.push(`${r}:honest`, `${r}:cheat`)
  const acc = Object.fromEntries(keys.map((x) => [x, { s: 0, s2: 0, served: 0, users: 0 }]))
  const add = (key, rev, served, users) => {
    const a = acc[key]
    a.s += rev
    a.s2 += rev * rev
    a.served += served
    a.users += users
  }
  const v = new Float64Array(n)
  const at = (j) => v[n - j]
  const slots = Math.min(k, n)
  const prefix = new Float64Array(n + 1) // sums of the top values
  const prefixBid = new Float64Array(n + 1)
  let same = 0
  for (let t = 0; t < blocks; t++) {
    for (let i = 0; i < n; i++) v[i] = random()
    v.sort()
    for (let j = 1; j <= n; j++) {
      prefix[j] = prefix[j - 1] + at(j)
      prefixBid[j] = prefixBid[j - 1] + (k < n && j <= slots ? bidOf(at(j)) : 0)
    }
    // Pay your bid: honest, then the search over h high fakes (the extra fake
    // only takes one more slot from the reals).
    add('pyb:honest', 100 * prefixBid[slots], slots, 100 * (prefix[slots] - prefixBid[slots]))
    {
      let best = -1
      let bj = 0
      for (let h = 0; h <= k; h++) for (const extra of [0, 1]) {
        const j = Math.max(0, Math.min(n, k - h - extra))
        if (prefixBid[j] > best + 1e-15) {
          best = prefixBid[j]
          bj = j
        }
      }
      add('pyb:cheat', 100 * best, bj, 100 * (prefix[bj] - best))
    }
    // Uniform price.
    const uni = k < n ? k * at(k + 1) : 0
    add('uniform:honest', 100 * uni, slots, 100 * (prefix[slots] - uni))
    const ch = bestUniformCheat(at, n, k)
    add('uniform:cheat', 100 * ch.revenue, ch.j, 100 * (prefix[ch.j] - ch.revenue))
    // Monopolistic price (as module 11): the best j·v_(j) over j ≤ k.
    let best = -1
    let bestJ = 0
    for (let j = 1; j <= slots; j++) {
      if (j * at(j) > best) {
        best = j * at(j)
        bestJ = j
      }
    }
    add('monopolistic:honest', 100 * best, bestJ, 100 * (prefix[bestJ] - best))
    add('monopolistic:cheat', 100 * best, bestJ, 100 * (prefix[bestJ] - best))
    if (Math.abs(ch.revenue - best) < 1e-12) same++
  }
  const out = { sameAsMonopolistic: same, blocks }
  for (const key of keys) {
    const a = acc[key]
    const mean = a.s / blocks
    const sd = Math.sqrt(Math.max(0, a.s2 / blocks - mean * mean) * (blocks / (blocks - 1)))
    const [r, mode] = key.split(':')
    out[r] = out[r] || {}
    out[r][mode] = { mean, sd, se: sd / Math.sqrt(blocks), served: a.served / blocks, users: a.users / blocks }
  }
  return out
}

// Exact values under the uniform price (0–100 scale): honest k(n − k)/(n + 1);
// one fake just below the k-th bid k(n + 1 − k)/(n + 1) (k ≤ n; with k > n
// there is no k-th bid); the honest users' payoff k(k + 1)/(2(n + 1)) for
// k ≤ n (with room for all, everyone keeps her value: n/2).
export const honestUniform = (n, k) => (k >= n ? 0 : (100 * k * (n - k)) / (n + 1))
export const oneFake = (n, k) => (k > n ? null : (100 * k * (n + 1 - k)) / (n + 1))
export const honestUsers = (n, k) => (k >= n ? (100 * n) / 2 : (100 * k * (k + 1)) / (2 * (n + 1)))
