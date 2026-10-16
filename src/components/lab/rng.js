// Seeded pseudo-random number generator (mulberry32). Simulations use it
// instead of Math.random so a run can be reproduced from its seed.
export function mulberry32(seed) {
  let a = seed >>> 0
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Convenience helpers built on a generator returned by mulberry32.
export function randInt(random, n) {
  return Math.floor(random() * n)
}

export function randNormal(random) {
  // Box–Muller transform; 1 - random() avoids log(0).
  const u = 1 - random()
  const v = random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
