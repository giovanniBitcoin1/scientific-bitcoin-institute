import { INK } from '../ui.jsx'
import { PATTERNS, indexOfPattern } from './motifs.js'

// A small drawing of one of the thirteen patterns: three dots and the arrows
// among them. `PatternGlyph` is a <g> to place inside another SVG (a 28 × 26
// box); `PatternIcon` wraps it in an <svg> of its own. Arrowheads are plain
// polygons, so many icons on one page share no marker ids.

const PTS = [
  [14, 4.5],
  [4.5, 21.5],
  [23.5, 21.5],
]
const PAIRS = [
  [0, 1],
  [0, 2],
  [1, 2],
]
const R = 2.7 // dot
const HEAD = 5.2 // arrowhead length
const HALF = 2.5 // arrowhead half-width

function head(tipX, tipY, ux, uy) {
  const bx = tipX - ux * HEAD
  const by = tipY - uy * HEAD
  return `${tipX.toFixed(2)},${tipY.toFixed(2)} ${(bx - uy * HALF).toFixed(2)},${(by + ux * HALF).toFixed(2)} ${(bx + uy * HALF).toFixed(2)},${(by - ux * HALF).toFixed(2)}`
}

export function PatternGlyph({ id, color = INK, x = 0, y = 0, scale = 1 }) {
  const pattern = PATTERNS[indexOfPattern(id)]
  if (!pattern) return null
  const has = (a, b) => pattern.links.some((l) => l[0] === a && l[1] === b)
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {PAIRS.map(([a, b]) => {
        const ab = has(a, b)
        const ba = has(b, a)
        if (!ab && !ba) return null
        const dx = PTS[b][0] - PTS[a][0]
        const dy = PTS[b][1] - PTS[a][1]
        const d = Math.hypot(dx, dy)
        const ux = dx / d
        const uy = dy / d
        const gap = R + 0.6
        // The tips touch the dots; the line stops at the base of each head.
        const tipA = [PTS[a][0] + ux * gap, PTS[a][1] + uy * gap]
        const tipB = [PTS[b][0] - ux * gap, PTS[b][1] - uy * gap]
        const from = ba ? [tipA[0] + ux * (HEAD - 0.5), tipA[1] + uy * (HEAD - 0.5)] : tipA
        const to = ab ? [tipB[0] - ux * (HEAD - 0.5), tipB[1] - uy * (HEAD - 0.5)] : tipB
        return (
          <g key={`${a}${b}`}>
            <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={color} strokeWidth="1.3" />
            {ab && <polygon points={head(tipB[0], tipB[1], ux, uy)} fill={color} />}
            {ba && <polygon points={head(tipA[0], tipA[1], -ux, -uy)} fill={color} />}
          </g>
        )
      })}
      {PTS.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={R} fill="#fff" stroke={color} strokeWidth="1.3" />
      ))}
    </g>
  )
}

export default function PatternIcon({ id, size = 28, color = INK, className = '' }) {
  return (
    <svg viewBox="0 0 28 26" width={size} height={(size * 26) / 28} className={className} aria-hidden="true" focusable="false">
      <PatternGlyph id={id} color={color} />
    </svg>
  )
}
