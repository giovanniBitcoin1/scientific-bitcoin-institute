import { toNumber } from '../congestion-price-of-anarchy/frac.js'
import { INK, SLATE, MONO, ORANGE_DARK } from '../../network/ui.jsx'
import { coreCorners3 } from './coalitions.js'

// The triangle of divisions of a three-player game, drawn in barycentric
// coordinates: corner i is "everything above the others' own worth to i".
// The lines x_k = v(N) − v(ij) of the three pairs, the core shaded (a
// polygon, a segment or a point), the Shapley value as an orange diamond,
// and optionally a division the reader moves (drawn white). Used by Figure
// F1 (with the moving point) and by Panel A for three players.

export const W = 300
export const H = 268
const PAD = 22
const CORNERS = [
  [PAD, H - PAD], // player 0, bottom left
  [W - PAD, H - PAD], // player 1, bottom right
  [W / 2, H - PAD - (W - 2 * PAD) * (Math.sqrt(3) / 2)], // player 2, top
]
export const CORE_FILL = '#fed7aa'
const SKY = '#0369a1'

// Barycentric weights of a division x (numbers) in the imputation triangle.
export function frameOf(game) {
  const lo = [1, 2, 4].map((m) => toNumber(game.v[m]))
  const R = toNumber(game.v[7]) - lo[0] - lo[1] - lo[2]
  return { lo, R }
}
export function toXY(frame, x) {
  const t = x.map((xi, i) => (xi - frame.lo[i]) / frame.R)
  return [0, 1].map((k) => t[0] * CORNERS[0][k] + t[1] * CORNERS[1][k] + t[2] * CORNERS[2][k])
}
// The inverse: a point of the drawing as barycentric weights (they may be
// negative outside the triangle).
export function fromXY(px, py) {
  const [[x1, y1], [x2, y2], [x3, y3]] = CORNERS
  const det = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3)
  const a = ((y2 - y3) * (px - x3) + (x3 - x2) * (py - y3)) / det
  const b = ((y3 - y1) * (px - x3) + (x1 - x3) * (py - y3)) / det
  return [a, b, 1 - a - b]
}

export default function CoreTriangle({ game, phi, point, objecting = [], aria, role, svgRef, svgProps = {}, className = '' }) {
  const frame = frameOf(game)
  if (!(frame.R > 0)) return null
  const vN = toNumber(game.v[7])
  const corners = coreCorners3(game).map((p) => p.map(toNumber))
  const xy = corners.map((p) => toXY(frame, p))
  const pairLines = [
    { mask: 3, k: 2 },
    { mask: 5, k: 1 },
    { mask: 6, k: 0 },
  ].map(({ mask, k }) => {
    // x_k = v(N) − v(S): the weight of corner k is fixed at t.
    const t = (vN - toNumber(game.v[mask]) - frame.lo[k]) / frame.R
    if (!(t > 1e-9 && t < 1 - 1e-9)) return null
    const ends = [0, 1, 2].filter((i) => i !== k).map((i) => {
      const w = [0, 0, 0]
      w[k] = t
      w[i] = 1 - t
      return [0, 1].map((c) => w[0] * CORNERS[0][c] + w[1] * CORNERS[1][c] + w[2] * CORNERS[2][c])
    })
    return { mask, ends }
  }).filter(Boolean)
  const names = game.names
  const pXY = point ? toXY(frame, point) : null
  const sXY = phi ? toXY(frame, phi.map(toNumber)) : null
  const tri = CORNERS.map((c) => c.join(',')).join(' ')

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className={`w-full h-auto ${className}`} role="img" aria-label={aria} data-role={role} {...svgProps}>
      <polygon points={tri} fill="#f8fafc" stroke={INK} strokeWidth="1" />
      {corners.length > 2 && <polygon points={xy.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ')} fill={CORE_FILL} stroke={ORANGE_DARK} strokeWidth="1" data-role="core-area" data-corners={corners.length} />}
      {corners.length === 2 && <line x1={xy[0][0]} y1={xy[0][1]} x2={xy[1][0]} y2={xy[1][1]} stroke={ORANGE_DARK} strokeWidth="4" strokeLinecap="round" data-role="core-area" data-corners="2" />}
      {corners.length === 1 && <circle cx={xy[0][0]} cy={xy[0][1]} r="5" fill={ORANGE_DARK} data-role="core-area" data-corners="1" />}
      {pairLines.map(({ mask, ends }) => {
        const hot = objecting.includes(mask)
        // The label sits near the line's end on the triangle's left or bottom
        // side, a quarter of the way in, so that the three labels stay apart.
        const f = 0.22
        const mid = [ends[0][0] + f * (ends[1][0] - ends[0][0]), ends[0][1] + f * (ends[1][1] - ends[0][1])]
        return (
          <g key={mask} data-pair={mask}>
            <line x1={ends[0][0]} y1={ends[0][1]} x2={ends[1][0]} y2={ends[1][1]} stroke={hot ? '#dc2626' : SLATE} strokeWidth={hot ? 1.8 : 1.1} strokeDasharray="4 3" />
            <text x={mid[0]} y={mid[1] - 3} fontSize="9" fontFamily={MONO} fill={hot ? '#dc2626' : SLATE} textAnchor="middle" stroke="white" strokeWidth="3" paintOrder="stroke">{[0, 1, 2].filter((i) => mask & (1 << i)).map((i) => names[i]).join('')}</text>
          </g>
        )
      })}
      {CORNERS.map((c, i) => (
        <text key={i} x={c[0] + (i === 0 ? -4 : i === 1 ? 4 : 0)} y={c[1] + (i === 2 ? -6 : 14)} fontSize="11" fontFamily={MONO} fontWeight="600" fill={INK} textAnchor={i === 0 ? 'start' : i === 1 ? 'end' : 'middle'}>{names[i]}</text>
      ))}
      {sXY && <path d={`M ${sXY[0]} ${sXY[1] - 6} L ${sXY[0] + 6} ${sXY[1]} L ${sXY[0]} ${sXY[1] + 6} L ${sXY[0] - 6} ${sXY[1]} Z`} fill={ORANGE_DARK} stroke="white" strokeWidth="1.2" data-role="shapley-point" />}
      {pXY && <circle cx={pXY[0]} cy={pXY[1]} r="6" fill="white" stroke={objecting.length ? '#dc2626' : SKY} strokeWidth="2.5" data-role="division-point" style={{ cursor: 'grab' }} />}
    </svg>
  )
}
