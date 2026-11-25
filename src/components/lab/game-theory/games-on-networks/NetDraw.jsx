import { INK, MUTED, MONO } from '../../network/ui.jsx'

// A small network in SVG for the figures and panels of module 09: fixed
// positions, links as lines, players as circles numbered from 1. Sizes and
// colours come from the caller; a player can be clicked (and reached by Tab,
// Enter or Space) when `onNode` is given. Plain SVG, so it never captures a
// swipe.

export default function NetDraw({ layout, edges, radius, fill, stroke, text, onNode, removed = [], W = 300, H = 170, aria, role, nodeData, nodeLabel }) {
  const gone = new Set(removed)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={aria} data-role={role}>
      {edges.map(([i, j]) => {
        const off = gone.has(i) || gone.has(j)
        return (
          <line
            key={`${i}-${j}`}
            x1={layout[i][0]}
            y1={layout[i][1]}
            x2={layout[j][0]}
            y2={layout[j][1]}
            stroke={off ? '#e2e8f0' : MUTED}
            strokeWidth="1.4"
            strokeDasharray={off ? '3 3' : undefined}
          />
        )
      })}
      {layout.map(([x, y], i) => {
        const r = radius(i)
        const off = gone.has(i)
        const click = onNode
          ? {
              onClick: () => onNode(i),
              onKeyDown: (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onNode(i)
                }
              },
              tabIndex: 0,
              role: 'button',
              'aria-label': nodeLabel ? nodeLabel(i) : `${i + 1}`,
              style: { cursor: 'pointer' },
            }
          : {}
        return (
          <g key={i} data-player={i + 1} {...(nodeData ? nodeData(i) : {})} {...click} className={onNode ? 'outline-none focus-visible:opacity-70' : undefined}>
            <circle cx={x} cy={y} r={r} fill={off ? 'white' : fill(i)} stroke={off ? '#cbd5e1' : stroke ? stroke(i) : INK} strokeWidth="1.5" strokeDasharray={off ? '2 2' : undefined} />
            <text x={x} y={y + 3.5} fontSize="10" fontFamily={MONO} fill={off ? '#cbd5e1' : text ? text(i) : INK} textAnchor="middle" pointerEvents="none">
              {i + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
