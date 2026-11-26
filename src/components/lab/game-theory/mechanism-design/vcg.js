// Panel B, "Pay for the harm you do": the VCG mechanism for two objects, A
// and B, and 2 to 4 bidders, each with bids (and true values) for A alone, B
// alone and both (AB, at least the larger single bid). Plain JS.
//
// The allocation is the assignment with the largest total of bids among all
// (n + 1)² ways to give A and B to a bidder or to nobody. Ties go to the first
// assignment in a fixed order: A to bidder 1, 2, …, n, then to nobody; for each
// of these, B in the same order. Each bidder pays the others' best total
// without her minus the others' total in the chosen assignment.

export const ITEMS = ['A', 'B', 'AB']

// AB at least the larger single bid; nothing negative.
export function normalize(t) {
  const A = Math.max(0, t.A)
  const B = Math.max(0, t.B)
  return { A, B, AB: Math.max(t.AB, A, B) }
}

// What a bidder with table t gets from the assignment (a, b): the owners of A
// and B (an index, or −1 for nobody).
export const worth = (t, i, a, b) => (a === i && b === i ? t.AB : a === i ? t.A : b === i ? t.B : 0)

// The best assignment among the bidders in `active` (indices), by the tables
// `tabs`; ties to the first in the fixed order.
export function bestAssignment(tabs, active) {
  const owners = [...active, -1]
  let best = null
  for (const a of owners) for (const b of owners) {
    let total = 0
    for (const i of active) total += worth(tabs[i], i, a, b)
    if (!best || total > best.total) best = { a, b, total }
  }
  return best
}

// VCG on the bids; payoffs on the true values. `merge` = [i, j]: bidders i and
// j are one person, whose true values are bidder i's, applied to everything
// the two names win together.
export function vcg(bids, values = bids, { merge = null } = {}) {
  const n = bids.length
  const all = [...Array(n).keys()]
  const best = bestAssignment(bids, all)
  const rows = all.map((i) => {
    const without = bestAssignment(bids, all.filter((j) => j !== i)).total
    const othersWith = best.total - worth(bids[i], i, best.a, best.b)
    const payment = without - othersWith
    const gets = best.a === i && best.b === i ? 'AB' : best.a === i ? 'A' : best.b === i ? 'B' : ''
    return { gets, without, othersWith, payment, payoff: worth(values[i], i, best.a, best.b) - payment }
  })
  const revenue = rows.reduce((s, r) => s + r.payment, 0)
  let person = null
  if (merge) {
    const [i, j] = merge
    const getsA = best.a === i || best.a === j
    const getsB = best.b === i || best.b === j
    const v = values[i]
    const value = getsA && getsB ? v.AB : getsA ? v.A : getsB ? v.B : 0
    const paid = rows[i].payment + rows[j].payment
    person = { gets: `${getsA ? 'A' : ''}${getsB ? 'B' : ''}`, value, paid, payoff: value - paid }
  }
  return { a: best.a, b: best.b, total: best.total, rows, revenue, person }
}

// The revenue if bidder i leaves, for each i (VCG run again on the others).
export const revenueWithout = (bids) => bids.map((_, i) => vcg(bids.filter((_, j) => j !== i)).revenue)

const T = (A, B, AB) => ({ A, B, AB })

// The presets: bids, true values, and the two-names switch.
export const PRESETS = {
  three: {
    bids: [T(8, 2, 10), T(5, 6, 11), T(3, 4, 7)],
  },
  lonely: {
    bids: [T(0, 0, 4), T(4, 0, 4), T(0, 4, 4)],
  },
  // One person who values AB at 6 (and A or B alone at 0), against bidder 1.
  namesOne: {
    bids: [T(0, 0, 4), T(0, 0, 6)],
  },
  // The same person bidding under two names, A 4 and B 4.
  namesTwo: {
    bids: [T(0, 0, 4), T(4, 0, 4), T(0, 4, 4)],
    values: [T(0, 0, 4), T(0, 0, 6), T(0, 0, 0)],
    merge: true,
  },
  // Bidders 2 and 3 value A and B at 1 each but bid 10.
  collude: {
    bids: [T(0, 0, 4), T(10, 0, 10), T(0, 10, 10)],
    values: [T(0, 0, 4), T(1, 0, 1), T(0, 1, 1)],
  },
}

export function preset(id) {
  const p = PRESETS[id]
  return {
    bids: p.bids.map((t) => ({ ...t })),
    values: (p.values || p.bids).map((t) => ({ ...t })),
    merge: !!p.merge,
  }
}
