// The double bridge: a nest and a food source joined by two branches, a
// short one (index 0) and a long one (index 1).
//
// Ants leave the nest at a steady rate. At the nest each picks a branch,
// walks one unit per step to the food, picks a branch again for the way
// back, and is done once home. The choice follows Deneubourg's function
//   P_i = (k + C_i)^n / Σ_j (k + C_j)^n,
// where C_i is the pheromone concentration on branch i. Walking ants lay
// pheromone as they go, the same amount per unit length, so one crossing
// raises a branch's concentration by DEPOSIT whatever its length; the short
// branch is simply crossed more often. Every step all pheromone decays by a
// factor (1 − ρ). The short branch may be closed until step `openAt`.

export const SHORT_LEN = 20 // steps to cross the short branch
export const DEPOSIT = 1
export const WINDOW = 100 // choices over which the share is measured

export function createBridge(ratio, openAt = 0) {
  return {
    len: [SHORT_LEN, Math.round(SHORT_LEN * ratio)],
    openAt,
    C: [0, 0],
    ants: [], // { branch, pos (0 … len), back }
    emit: 0,
    t: 0,
    recent: new Uint8Array(WINDOW), // 1 = short, ring buffer of choices
    nRecent: 0,
    shortRecent: 0,
    choices: [0, 0],
  }
}

export const shortOpen = (b) => b.t >= b.openAt

export function chooseShortProb(b, k, n) {
  if (!shortOpen(b)) return 0
  const a = Math.pow(k + b.C[0], n)
  const c = Math.pow(k + b.C[1], n)
  return a / (a + c)
}

function choose(b, p, random) {
  const branch = random() < chooseShortProb(b, p.k, p.n) ? 0 : 1
  const slot = (b.choices[0] + b.choices[1]) % WINDOW
  if (b.nRecent === WINDOW) b.shortRecent -= b.recent[slot]
  else b.nRecent++
  b.recent[slot] = branch === 0 ? 1 : 0
  b.shortRecent += b.recent[slot]
  b.choices[branch]++
  return branch
}

// One step. p = { rate (ants per step), rho, n, k }.
export function bridgeStep(b, p, random) {
  b.C[0] *= 1 - p.rho
  b.C[1] *= 1 - p.rho
  b.emit += p.rate
  while (b.emit >= 1) {
    b.emit -= 1
    b.ants.push({ branch: choose(b, p, random), pos: 0, back: false })
  }
  let w = 0
  for (const ant of b.ants) {
    const L = b.len[ant.branch]
    ant.pos += 1
    b.C[ant.branch] += DEPOSIT / L
    if (ant.pos >= L) {
      if (ant.back) continue // home: the ant leaves the simulation
      ant.back = true
      ant.pos = 0
      ant.branch = choose(b, p, random)
    }
    b.ants[w++] = ant
  }
  b.ants.length = w
  b.t++
}

// Share of the last WINDOW choices that went to the short branch.
export const shortShare = (b) => (b.nRecent ? b.shortRecent / b.nRecent : 0)

// Runs `steps` steps from scratch and reports where the colony ended.
export function runBridge(ratio, openAt, p, steps, random) {
  const b = createBridge(ratio, openAt)
  for (let t = 0; t < steps; t++) bridgeStep(b, p, random)
  return { share: shortShare(b), C: b.C.slice() }
}
