// The bridges of Königsberg as a multigraph on four land masses. Pure logic,
// shared by the panel and by scripts/lab/check-network-01.mjs.

export const LANDS = ['N', 'S', 'K', 'L'] // north bank, south bank, Kneiphof, Lomse

// Every place where a bridge can stand. `y1736` and `today` mark the two
// presets; the others are extra slots, off by default. Each pair of land
// masses has exactly one extra slot.
export const SLOTS = [
  { id: 'NK1', a: 'N', b: 'K', y1736: true, today: true },
  { id: 'NK2', a: 'N', b: 'K', y1736: true },
  { id: 'SK1', a: 'S', b: 'K', y1736: true, today: true },
  { id: 'SK2', a: 'S', b: 'K', y1736: true },
  { id: 'NL1', a: 'N', b: 'L', y1736: true, today: true },
  { id: 'SL1', a: 'S', b: 'L', y1736: true, today: true },
  { id: 'KL1', a: 'K', b: 'L', y1736: true, today: true },
  { id: 'NL2', a: 'N', b: 'L' },
  { id: 'SL2', a: 'S', b: 'L' },
  { id: 'NS1', a: 'N', b: 'S' },
  { id: 'NK3', a: 'N', b: 'K' },
  { id: 'SK3', a: 'S', b: 'K' },
  { id: 'KL2', a: 'K', b: 'L' },
]

export const SLOT_BY_ID = Object.fromEntries(SLOTS.map((s) => [s.id, s]))

export const preset = (name) => SLOTS.filter((s) => s[name]).map((s) => s.id)

export const otherEnd = (slot, land) => (slot.a === land ? slot.b : slot.a)

const slotsOf = (active) => SLOTS.filter((s) => active.includes(s.id))

// Number of bridges touching each land mass.
export function degrees(active) {
  const k = { N: 0, S: 0, K: 0, L: 0 }
  for (const s of slotsOf(active)) {
    k[s.a]++
    k[s.b]++
  }
  return k
}

// True when every bridge can be reached from every other one.
function inOnePiece(active) {
  const slots = slotsOf(active)
  if (!slots.length) return true
  const seen = new Set([slots[0].a])
  let grew = true
  while (grew) {
    grew = false
    for (const s of slots) {
      if (seen.has(s.a) !== seen.has(s.b)) {
        seen.add(s.a)
        seen.add(s.b)
        grew = true
      }
    }
  }
  return slots.every((s) => seen.has(s.a))
}

// Euler's verdict. kind is
//   "empty"    no bridges
//   "split"    the bridges are not all in one piece
//   "circuit"  no odd land mass: a closed tour exists, from anywhere
//   "trail"    two odd land masses: a walk exists, between those two
//   "none"     four odd land masses: no walk crosses every bridge once
export function verdict(active) {
  const k = degrees(active)
  const odd = LANDS.filter((v) => k[v] % 2 === 1)
  let kind = 'none'
  if (!active.length) kind = 'empty'
  else if (!inOnePiece(active)) kind = 'split'
  else if (odd.length === 0) kind = 'circuit'
  else if (odd.length === 2) kind = 'trail'
  return { kind, odd, degrees: k }
}

// Hierholzer's algorithm: a walk over every bridge exactly once, as
// { start, steps: [slot id, …] }, or null when Euler's condition fails.
export function eulerRoute(active) {
  const v = verdict(active)
  if (v.kind !== 'circuit' && v.kind !== 'trail') return null
  const slots = slotsOf(active)
  const start = v.kind === 'trail' ? v.odd[0] : slots[0].a
  const used = new Set()
  const stack = [{ land: start, via: null }]
  const out = []
  while (stack.length) {
    const top = stack[stack.length - 1]
    const next = slots.find((s) => !used.has(s.id) && (s.a === top.land || s.b === top.land))
    if (next) {
      used.add(next.id)
      stack.push({ land: otherEnd(next, top.land), via: next.id })
    } else {
      out.push(stack.pop())
    }
  }
  out.reverse()
  return { start, steps: out.slice(1).map((x) => x.via) }
}

// The longest walk that repeats no bridge, by exhaustive search over every
// (land mass, set of bridges already crossed) pair.
export function longestWalk(active) {
  const slots = slotsOf(active)
  const memo = new Map()
  const best = (land, mask) => {
    const key = `${land}${mask}`
    if (memo.has(key)) return memo.get(key)
    let len = 0
    let via = -1
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i]
      if (mask & (1 << i) || (s.a !== land && s.b !== land)) continue
      const l = 1 + best(otherEnd(s, land), mask | (1 << i)).len
      if (l > len) {
        len = l
        via = i
      }
    }
    const r = { len, via }
    memo.set(key, r)
    return r
  }
  let start = LANDS[0]
  for (const v of LANDS) if (best(v, 0).len > best(start, 0).len) start = v
  const steps = []
  let land = start
  let mask = 0
  for (let r = best(land, mask); r.via >= 0; r = best(land, mask)) {
    steps.push(slots[r.via].id)
    land = otherEnd(slots[r.via], land)
    mask |= 1 << r.via
  }
  return { start, steps }
}

// Where a walk stands: the current land mass, the bridges still free, and the
// ones that can be crossed next. Returns null if the steps are not a legal walk.
export function walkState(active, start, steps) {
  let land = start
  const crossed = new Set()
  for (const id of steps) {
    const s = SLOT_BY_ID[id]
    if (!s || !active.includes(id) || crossed.has(id) || (s.a !== land && s.b !== land)) return null
    crossed.add(id)
    land = otherEnd(s, land)
  }
  const left = active.filter((id) => !crossed.has(id))
  const moves = left.filter((id) => SLOT_BY_ID[id].a === land || SLOT_BY_ID[id].b === land)
  return { land, left, moves, done: left.length === 0, stuck: left.length > 0 && moves.length === 0 }
}
