// Braess's network with a continuum of drivers (F2, lecture section 3,
// exercise 2). One unit of traffic from s to t. s → v takes x (the share on
// it), v → t takes 1, s → w takes 1, w → t takes x; the shortcut v → w takes
// c hours, or is closed. Routes: upper s-v-t, lower s-w-t, zigzag s-v-w-t.

export const ROUTES = ['upper', 'lower', 'zigzag']

// Road loads and route costs for the shares (u, l, z).
export function routeCosts({ u, l, z }, c) {
  const sv = u + z
  const wt = l + z
  return { sv, wt, upper: sv + 1, lower: 1 + wt, zigzag: sv + c + wt }
}

// The equilibrium by formula: zigzag max(0, 1 − 2c), upper and lower each
// min(c, 1/2); every route in use costs 2 − c for c < 1/2, 1.5 from c = 1/2
// on. Closed: half on each of upper and lower, 1.5.
export function equilibrium(c, open = true) {
  const shares = !open ? { u: 0.5, l: 0.5, z: 0 } : { u: Math.min(c, 0.5), l: Math.min(c, 0.5), z: Math.max(0, 1 - 2 * c) }
  const costs = routeCosts(shares, c)
  const cost = !open || c >= 0.5 ? 1.5 : 2 - c
  // The average over drivers, from the route costs themselves.
  const average = shares.u * costs.upper + shares.l * costs.lower + shares.z * (open ? costs.zigzag : 0)
  return { shares, costs, cost, average }
}

// Wardrop's conditions checked directly: every route in use costs the same,
// and no unused route costs less (tolerance tol).
export function isWardrop(shares, c, open = true, tol = 1e-12) {
  const k = routeCosts(shares, c)
  const used = [['upper', shares.u], ['lower', shares.l], ['zigzag', shares.z]].filter(([r, s]) => s > tol && (open || r !== 'zigzag'))
  const avail = open ? ROUTES : ['upper', 'lower']
  if (!used.length) return false
  const L = k[used[0][0]]
  return used.every(([r]) => Math.abs(k[r] - L) <= tol) && avail.every((r) => k[r] >= L - tol)
}

// The planner's cost: half on upper and lower, 1.5, whatever c ≥ 0 (the
// marginal cost of the zigzag at that point, 2 + c, is never below the 2 of
// the other routes). Checked against a grid search in the self-check.
export const PLANNER = 1.5
export function totalCost({ u, l, z }, c) {
  const k = routeCosts({ u, l, z }, c)
  return u * k.upper + l * k.lower + z * k.zigzag
}

// The curve of F2's small chart: the equilibrium cost against c.
export function curve(steps = 100) {
  const out = []
  for (let i = 0; i <= steps; i++) {
    const c = i / steps
    out.push([c, equilibrium(c).cost])
  }
  return out
}
