import { mulberry32 } from '../../rng.js'

// Panel A, "Race the network": Eyal and Sirer's strategy (SM1) simulated block
// by block. Each step one block is mined, by her with probability α. The
// accounting is the chain's (selfish.js): a block counts as hers or theirs,
// in the chain or orphaned, at the moment its fate is decided.
//
// Event codes of the strip (the last 40 blocks mined):
//   hide      she finds a block from lead 0 and keeps it (lead 1)
//   extend    she finds a block with a lead of 1 or more (lead + 1)
//   chain     they find a block at lead 0: it joins the chain
//   race      they find a block at lead 1: she publishes hers, a tie
//   win       in a race she finds the next block: her two blocks win
//   split     in a race they build on her block: one each
//   lose      in a race they build on their own block: theirs win
//   publish2  they find a block at lead 2: she publishes both and wins
//   publish1  they find a block at lead 3 or more: she publishes one

export const STRIP = 40
const BATCHES = 100

export function runRace({ alpha, gamma, blocks, seed = 1 }) {
  const rnd = mulberry32(seed)
  const a = alpha
  let lead = 0
  let tie = false
  let cA = 0
  let cH = 0
  let oA = 0
  let oH = 0
  let maxLead = 0
  const per = Math.floor(blocks / BATCHES)
  const bA = new Float64Array(BATCHES)
  const bC = new Float64Array(BATCHES)
  const bOA = new Float64Array(BATCHES)
  const bOH = new Float64Array(BATCHES)
  const strip = []
  const from = blocks - STRIP
  for (let i = 0; i < blocks; i++) {
    const mine = rnd() < a
    const A0 = cA
    const H0 = cH
    const OA0 = oA
    const OH0 = oH
    let what
    if (tie) {
      tie = false
      if (mine) {
        cA += 2
        oH += 1
        what = 'win'
      } else if (rnd() < gamma) {
        cA += 1
        cH += 1
        oH += 1
        what = 'split'
      } else {
        cH += 2
        oA += 1
        what = 'lose'
      }
    } else if (mine) {
      what = lead === 0 ? 'hide' : 'extend'
      lead++
      if (lead > maxLead) maxLead = lead
    } else if (lead === 0) {
      cH += 1
      what = 'chain'
    } else if (lead === 1) {
      lead = 0
      tie = true
      what = 'race'
    } else if (lead === 2) {
      lead = 0
      cA += 2
      oH += 1
      what = 'publish2'
    } else {
      lead--
      cA += 1
      oH += 1
      what = 'publish1'
    }
    const k = Math.min(BATCHES - 1, Math.floor(i / per))
    bA[k] += cA - A0
    bC[k] += cA - A0 + cH - H0
    bOA[k] += oA - OA0
    bOH[k] += oH - OH0
    if (i >= from) strip.push({ who: mine ? 'A' : 'H', what, lead: tie ? '0′' : String(lead) })
  }
  // Her share of the chain, a ratio: its standard error from the batches.
  const chain = cA + cH
  const share = cA / chain
  let s2 = 0
  for (let k = 0; k < BATCHES; k++) s2 += (bA[k] - share * bC[k]) ** 2
  const meanC = chain / BATCHES
  const shareSe = Math.sqrt(s2 / (BATCHES * (BATCHES - 1))) / meanC
  // Orphans per 100 mined: means and standard errors over the batches.
  const ms = (arr, n) => {
    const xs = Array.from(arr, (x, k) => (100 * x) / (k === BATCHES - 1 ? blocks - per * (BATCHES - 1) : n))
    const m = xs.reduce((s, x) => s + x, 0) / BATCHES
    const v = xs.reduce((s, x) => s + (x - m) ** 2, 0) / (BATCHES - 1)
    return Math.sqrt(v / BATCHES)
  }
  return {
    blocks,
    share,
    shareSe,
    oA: (100 * oA) / blocks,
    oASe: ms(bOA, per),
    oH: (100 * oH) / blocks,
    oHSe: ms(bOH, per),
    chain: (100 * chain) / blocks,
    maxLead,
    strip,
    // Blocks still undecided at the end (her private lead, a pending race).
    pending: lead + (tie ? 2 : 0),
  }
}
