import { INK, SLATE, MUTED, GRID, MONO } from '../network/ui.jsx'
import { ROW_COLOR, COL_COLOR } from './PayoffTable.jsx'

// A game tree with perfect information, shared by the modules of the Game
// Theory Lab (module 04 on; next to PayoffTable.jsx). Decision nodes are
// circles with the mover's initial, moves are labelled edges, leaves show
// the payoffs, player 0's above player 1's, in the players' colours. Plain
// SVG: it scales to its container (fits 375 px) and never captures a swipe.
//
//   tree      a prepared tree (trees.js: prepare)
//   initials  [s0, s1] letters inside the nodes
//   colors    [c0, c1] the players' colours (default: row orange, column blue)
//   choice    Map node id → move index: the moves chosen at solved nodes
//   solved    Set of solved node ids: their chosen move is drawn dark, the
//             others grey and dashed
//   path      Set of node ids on the highlighted path (drawn thick, orange)
//   values    Map node id → payoffs, written beside solved nodes
//   format    how a payoff is written
//   short     true: edges carry the short labels (auto when leaves are many)
//
// Optional, since module 05 (module 04 passes none of them and sees no change):
//   chance nodes  a node with `chance: true` and moves { name, prob, child }:
//             a move of Nature, drawn as a grey circle marked `chanceLabel`,
//             its moves labelled with their names and probabilities (full
//             names always)
//   chanceLabel   the letter in a chance node (default 'N')
//   probFormat    how a probability is written (default: format)
//   infoSets  [[node ids]]: nodes the mover cannot tell apart, joined by a
//             dashed line (their moves carry the same labels)

const PATH = '#f97316' // orange-500
const NATURE = '#64748b' // slate-500, neutral
const ROW_H = 64
const TOP = 26
const minus = (v) => String(v).replace('-', '−')

export default function GameTree({
  tree,
  initials = ['1', '2'],
  colors = [ROW_COLOR, COL_COLOR],
  choice = new Map(),
  solved = new Set(),
  path = new Set(),
  values = new Map(),
  format = minus,
  short = null,
  chanceLabel = 'N',
  probFormat = null,
  infoSets = [],
  aria,
}) {
  const leaves = tree.leaves.length
  const W = Math.max(300, leaves * 62)
  const slot = W / leaves
  const useShort = short ?? slot < 70
  const pos = new Map()
  let k = 0
  const place = (n) => {
    if (n.payoffs) {
      const p = { x: (k + 0.5) * slot, y: TOP + n.depth * ROW_H }
      k++
      pos.set(n.id, p)
      return p
    }
    const ps = n.moves.map((m) => place(m.child))
    const p = { x: (ps[0].x + ps[ps.length - 1].x) / 2, y: TOP + n.depth * ROW_H }
    pos.set(n.id, p)
    return p
  }
  place(tree.root)
  const H = TOP + tree.depth * ROW_H + 34
  // A leaf is greyed when a solved node above it chose another way.
  const dim = new Set()
  const markDim = (n, off) => {
    if (off) dim.add(n.id)
    if (n.payoffs) return
    n.moves.forEach((m, j) => markDim(m.child, off || (solved.has(n.id) && choice.get(n.id) !== j)))
  }
  markDim(tree.root, false)

  const edges = []
  const labels = []
  for (const n of tree.nodes) {
    if (n.payoffs) continue
    const a = pos.get(n.id)
    n.moves.forEach((m, j) => {
      const b = pos.get(m.child.id)
      const isSolved = solved.has(n.id)
      const chosen = isSolved && choice.get(n.id) === j
      const onPath = path.has(n.id) && path.has(m.child.id)
      const off = dim.has(n.id) || (isSolved && !chosen)
      edges.push(
        <line
          key={`e${n.id}-${j}`}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke={onPath ? PATH : chosen ? INK : off ? MUTED : SLATE}
          strokeWidth={onPath ? 4 : chosen ? 2.5 : 1.5}
          strokeDasharray={off && !chosen ? '4 3' : undefined}
          strokeOpacity={off && !chosen ? 0.7 : 1}
          strokeLinecap="round"
          data-chosen={chosen || undefined}
          data-path={onPath || undefined}
        />,
      )
      const mx = (a.x + b.x) / 2
      const my = (a.y + b.y) / 2
      const side = b.x < a.x - 1 ? -1 : b.x > a.x + 1 ? 1 : 0
      labels.push(
        <text
          key={`l${n.id}-${j}`}
          x={mx + side * 6}
          y={my + (side === 0 ? 0 : -2)}
          dx={side === 0 ? 6 : 0}
          textAnchor={side < 0 ? 'end' : 'start'}
          fontSize="10"
          fontFamily={MONO}
          fill={off && !chosen ? MUTED : INK}
          fontWeight={chosen || onPath ? 600 : 400}
        >
          {n.chance ? `${m.name} ${(probFormat || format)(m.prob)}` : useShort ? m.short : m.name}
        </text>,
      )
    })
  }
  // Information sets: a dashed line through their nodes, left to right.
  const sets = infoSets.map((ids, s) => {
    const ps = ids.map((id) => pos.get(id)).sort((a, b) => a.x - b.x)
    return (
      <polyline
        key={`i${s}`}
        points={ps.map((p) => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke={SLATE}
        strokeWidth="1.5"
        strokeDasharray="5 4"
        data-infoset={s}
      />
    )
  })

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={aria} data-role="tree">
      {sets}
      {edges}
      {labels}
      {tree.nodes.map((n) => {
        const p = pos.get(n.id)
        if (n.payoffs) {
          const faded = dim.has(n.id)
          return (
            <g key={n.id} opacity={faded ? 0.35 : 1} data-leaf={n.id} data-path={path.has(n.id) || undefined}>
              <rect x={p.x - 3} y={p.y - 3} width="6" height="6" fill={path.has(n.id) ? PATH : INK} />
              <text x={p.x} y={p.y + 15} textAnchor="middle" fontSize="11" fontFamily={MONO} fill={colors[0]} fontWeight="600">
                {format(n.payoffs[0])}
              </text>
              <text x={p.x} y={p.y + 28} textAnchor="middle" fontSize="11" fontFamily={MONO} fill={colors[1]} fontWeight="600">
                {format(n.payoffs[1])}
              </text>
            </g>
          )
        }
        if (n.chance) {
          return (
            <g key={n.id} data-node={n.id} data-chance="true">
              <circle cx={p.x} cy={p.y} r="11" fill="#f1f5f9" stroke={NATURE} strokeWidth="2" />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fontFamily={MONO} fill={NATURE} fontWeight="700">
                {chanceLabel}
              </text>
            </g>
          )
        }
        const v = values.get(n.id)
        return (
          <g key={n.id} data-node={n.id} data-solved={solved.has(n.id) || undefined}>
            <circle cx={p.x} cy={p.y} r="11" fill="white" stroke={colors[n.player]} strokeWidth="2.25" />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fontFamily={MONO} fill={colors[n.player]} fontWeight="700">
              {initials[n.player]}
            </text>
            {v && solved.has(n.id) && (
              <g fontSize="10" fontFamily={MONO} fontWeight="600">
                <rect x={p.x + 13} y={p.y - 20} width={v.map(format).join(', ').length * 6.2 + 8} height="14" rx="3" fill="white" stroke={GRID} />
                <text x={p.x + 17} y={p.y - 10}>
                  <tspan fill={colors[0]}>{format(v[0])}</tspan>
                  <tspan fill={SLATE}>, </tspan>
                  <tspan fill={colors[1]}>{format(v[1])}</tspan>
                </text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}
