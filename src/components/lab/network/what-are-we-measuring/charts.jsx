import { GRID, SLATE, MONO, sup } from '../ui.jsx'

// A small SVG line chart for the panels and figures of this module: linear or
// logarithmic axes, a few series drawn as lines, dots or steps. Plain SVG, so
// it scales with its container and never captures a swipe.
//
//   x, y      { min, max, log, ticks: [values], label, format }
//             (y.labelSide: 'right' by default, or 'left')
//   series    [{ points: [[x, y]], color, width, dashed, dots, line, opacity }]
//   marks     [{ x, color, label }]  vertical lines

const W = 320
const PAD = { left: 38, right: 8, top: 10, bottom: 26 }

export function scale({ min, max, log }, lo, hi) {
  if (log) {
    const a = Math.log10(min)
    const b = Math.log10(max)
    return (v) => lo + ((Math.log10(Math.max(v, min * 1e-6)) - a) / (b - a)) * (hi - lo)
  }
  return (v) => lo + ((v - min) / (max - min || 1)) * (hi - lo)
}

export const powerLabel = (v) => {
  const e = Math.round(Math.log10(v))
  return e === 0 ? '1' : e === 1 ? '10' : `10${sup(e)}`
}

export default function Chart({ x, y, series, marks = [], height = 170, aria, children }) {
  const H = height
  const sx = scale(x, PAD.left, W - PAD.right)
  const sy = scale(y, H - PAD.bottom, PAD.top)
  const inX = (v) => v >= x.min - 1e-12 && v <= x.max + 1e-12
  const fx = x.format || (x.log ? powerLabel : String)
  const fy = y.format || (y.log ? powerLabel : String)
  const clampY = (v) => Math.min(H - PAD.bottom, Math.max(PAD.top, sy(v)))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={aria}>
      {y.ticks.map((v) => (
        <g key={`y${v}`}>
          <line x1={PAD.left} x2={W - PAD.right} y1={sy(v)} y2={sy(v)} stroke={GRID} strokeWidth="1" />
          <text x={PAD.left - 4} y={sy(v) + 3} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>
            {fy(v)}
          </text>
        </g>
      ))}
      {x.ticks.map((v) => (
        <g key={`x${v}`}>
          <line x1={sx(v)} x2={sx(v)} y1={H - PAD.bottom} y2={H - PAD.bottom + 3} stroke={SLATE} strokeWidth="1" />
          <text x={sx(v)} y={H - PAD.bottom + 12} textAnchor="middle" fontSize="9" fontFamily={MONO} fill={SLATE}>
            {fx(v)}
          </text>
        </g>
      ))}
      <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke={SLATE} strokeWidth="1" />
      {x.label && (
        <text x={W - PAD.right} y={H - 2} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>
          {x.label}
        </text>
      )}
      {y.label && (
        <text
          x={y.labelSide === 'left' ? PAD.left + 4 : W - PAD.right}
          y={PAD.top + 7}
          textAnchor={y.labelSide === 'left' ? 'start' : 'end'}
          fontSize="9"
          fontFamily={MONO}
          fill={SLATE}
        >
          {y.label}
        </text>
      )}
      {marks.map((m, i) =>
        inX(m.x) ? (
          <g key={`m${i}`}>
            <line x1={sx(m.x)} x2={sx(m.x)} y1={PAD.top} y2={H - PAD.bottom} stroke={m.color} strokeWidth="1.5" strokeDasharray={m.dashed ? '3 3' : undefined} />
            {m.label && (
              <text
                x={sx(m.x) + (sx(m.x) > W * 0.7 ? -4 : 4)}
                y={PAD.top + (m.row ? 18 : 8)}
                textAnchor={sx(m.x) > W * 0.7 ? 'end' : 'start'}
                fontSize="9"
                fontFamily={MONO}
                fill={m.color}
              >
                {m.label}
              </text>
            )}
          </g>
        ) : null,
      )}
      {series.map((s, i) => {
        const pts = s.points.filter((p) => inX(p[0]) && Number.isFinite(p[1]) && (!y.log || p[1] >= y.min))
        return (
          <g key={i} opacity={s.opacity ?? 1}>
            {s.line !== false && pts.length > 1 && (
              <polyline
                points={pts.map((p) => `${sx(p[0]).toFixed(1)},${clampY(p[1]).toFixed(1)}`).join(' ')}
                fill="none"
                stroke={s.color}
                strokeWidth={s.width ?? 1.75}
                strokeDasharray={s.dashed ? '4 3' : undefined}
                strokeLinejoin="round"
              />
            )}
            {s.dots &&
              pts.map((p, j) => <circle key={j} cx={sx(p[0])} cy={clampY(p[1])} r={s.dots === true ? 2.2 : s.dots} fill={s.color} />)}
          </g>
        )
      })}
      {children && children({ sx, sy, W, H, PAD })}
    </svg>
  )
}

// Line-and-label legend under a chart.
export function Legend({ items }) {
  return (
    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <svg width="18" height="8" aria-hidden="true">
            {it.bar ? (
              <rect x="2" y="0" width="14" height="8" fill={it.color} opacity={it.opacity ?? 1} />
            ) : (
              <line x1="0" x2="18" y1="4" y2="4" stroke={it.color} strokeWidth="2" strokeDasharray={it.dashed ? '4 3' : undefined} />
            )}
          </svg>
          {it.label}
        </span>
      ))}
    </div>
  )
}

// P(K ≥ k) from a distribution P[k]: one point per k with P[k] > 0, k ≥ from.
export function ccdfPoints(P, from = 1) {
  const out = []
  let above = 0
  for (let k = P.length - 1; k >= from; k--) {
    above += P[k]
    if (P[k] > 0) out.push([k, above])
  }
  return out.reverse()
}
