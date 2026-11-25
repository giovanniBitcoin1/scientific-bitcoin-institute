// Pigou's two roads (F1, lecture section 1, exercise 1). One unit of
// traffic from A to B. The upper road always takes 1 hour; the lower road
// takes x^p hours, x the share of the drivers on it.

// Average cost per driver when a share x takes the lower road.
export const average = (x, p) => x ** (p + 1) + (1 - x)

// The planner's share on the lower road: (p + 1)x^p = 1.
export const optimumShare = (p) => (p + 1) ** (-1 / p)

// Its cost, 1 − p(p + 1)^(−(p+1)/p).
export const optimumCost = (p) => 1 - p * (p + 1) ** (-(p + 1) / p)

// Selfish drivers all take the lower road (x^p ≤ 1): everyone pays 1.
export const EQ_SHARE = 1
export const EQ_COST = 1

export const priceOfAnarchy = (p) => EQ_COST / optimumCost(p)

// The toll x·c'(x) = p·x^p on the lower road; time plus toll is (1 + p)x^p.
export const toll = (x, p) => p * x ** p
export const timePlusToll = (x, p) => (1 + p) * x ** p

// With the toll, drivers stop where time plus toll equals the upper road's
// 1: at the planner's share. Each driver pays 1 (time plus toll) and the
// toll revenue is x*·p·x*^p = x*·p/(p + 1).
export function withToll(p) {
  const x = optimumShare(p)
  const t = toll(x, p)
  return { share: x, toll: t, paid: x ** p + t, revenue: x * t, time: average(x, p) }
}

// Everything F1 shows for one p and the reader's x.
export function pigou(p, x) {
  const xs = optimumShare(p)
  return {
    p,
    x,
    upper: 1,
    lower: x ** p,
    average: average(x, p),
    eqShare: EQ_SHARE,
    eqCost: EQ_COST,
    optShare: xs,
    optCost: optimumCost(p),
    poa: priceOfAnarchy(p),
    tolled: withToll(p),
  }
}
