import { INK, SLATE, MONO, GRID, ORANGE_DARK } from '../../network/ui.jsx'

// Bars of weight share against a power index, one group per player. Plain
// SVG, scales with its container. Used by Figure F2 and Panel B.
//   groups  [{ label, share, index, second? }]  (numbers in [0, 1])

const SKY = '#0369a1'
export const BAR_COLORS = { share: '#cbd5e1', index: ORANGE_DARK, second: SKY }

export default function PowerBars({ groups, height = 150, aria, role, showLabels = true, max }) {
  const W = 320
  const PAD = { left: 30, right: 4, top: 8, bottom: showLabels ? 20 : 8 }
  const top = max ?? Math.max(0.1, ...groups.flatMap((g) => [g.share, g.index, g.second ?? 0]))
  const ceil = Math.ceil(top * 10) / 10
  const sy = (v) => height - PAD.bottom - (v / ceil) * (height - PAD.top - PAD.bottom)
  const gw = (W - PAD.left - PAD.right) / groups.length
  const bars = groups[0] && groups[0].second != null ? 3 : 2
  const bw = Math.max(1, Math.min(14, (gw * 0.8) / bars))
  const ticks = [0, ceil / 2, ceil]
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full h-auto" role="img" aria-label={aria} data-role={role}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={W - PAD.right} y1={sy(t)} y2={sy(t)} stroke={GRID} />
          <text x={PAD.left - 3} y={sy(t) + 3} fontSize="9" fontFamily={MONO} fill={SLATE} textAnchor="end">{t.toFixed(2).replace(/0$/, '')}</text>
        </g>
      ))}
      {groups.map((g, i) => {
        const x0 = PAD.left + i * gw + (gw - bars * bw) / 2
        const vals = [['share', g.share], ['index', g.index], ...(bars === 3 ? [['second', g.second]] : [])]
        return (
          <g key={i} data-group={i} data-share={g.share.toFixed(4)} data-index={g.index.toFixed(4)}>
            {vals.map(([k, v], j) => (
              <rect key={k} x={x0 + j * bw} y={sy(v)} width={Math.max(0.5, bw - 0.6)} height={Math.max(0, sy(0) - sy(v))} fill={BAR_COLORS[k]} />
            ))}
            {showLabels && (
              <text x={PAD.left + i * gw + gw / 2} y={height - 6} fontSize="9" fontFamily={MONO} fill={INK} textAnchor="middle">{g.label}</text>
            )}
          </g>
        )
      })}
      <line x1={PAD.left} x2={W - PAD.right} y1={sy(0)} y2={sy(0)} stroke={SLATE} />
    </svg>
  )
}
