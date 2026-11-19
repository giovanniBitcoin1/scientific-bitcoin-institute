import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { INK, SLATE, MONO, fmt } from '../ui.jsx'
import { LABELS, PAIRS, POSITIONS, MAX_WEIGHT, atThreshold } from './weights.js'

// Live figure F1, "Where do you draw the line?": ten people and how often
// each pair was in contact. Only pairs at or above the threshold count as
// links. The only control is a slider, so the figure never captures a swipe.

const T = {
  en: {
    threshold: 'A link is a pair with at least this many contacts',
    links: 'Links L',
    density: 'Density',
    components: 'Components',
    note: 'Line thickness shows the number of contacts.',
    aria: (l, c) => `Ten nodes in two groups; at this threshold ${l} links are drawn, in ${c} components`,
  },
  it: {
    threshold: 'Un collegamento è una coppia con almeno tanti contatti',
    links: 'Collegamenti L',
    density: 'Densità',
    components: 'Componenti',
    note: 'Lo spessore della linea indica il numero di contatti.',
    aria: (l, c) => `Dieci nodi in due gruppi; a questa soglia sono disegnati ${l} collegamenti, in ${c} componenti`,
  },
}

function Readout({ label, children }) {
  return (
    <div className="min-w-0">
      <span className="block text-xs text-slate-500">{label}</span>
      <span className="block font-mono text-sm text-slate-900 tabular-nums">{children}</span>
    </div>
  )
}

export default function FigureThreshold({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [threshold, setThreshold] = useState(1)
  const s = atThreshold(threshold)

  return (
    <div className="grid gap-x-6 gap-y-3 sm:grid-cols-[3fr_2fr] items-center">
      <svg viewBox="0 0 320 200" className="w-full h-auto max-h-[230px]" role="img" aria-label={t.aria(s.L, s.components)}>
        {s.kept.map(([a, b, w]) => (
          <line
            key={`${a}-${b}`}
            x1={POSITIONS[a][0]}
            y1={POSITIONS[a][1]}
            x2={POSITIONS[b][0]}
            y2={POSITIONS[b][1]}
            stroke={SLATE}
            strokeOpacity={0.35 + 0.5 * (w / MAX_WEIGHT)}
            strokeWidth={0.6 + 0.45 * w}
            strokeLinecap="round"
          />
        ))}
        {LABELS.map((label, i) => (
          <g key={label}>
            <circle cx={POSITIONS[i][0]} cy={POSITIONS[i][1]} r="11" fill="#fff" stroke={INK} strokeWidth="1.5" />
            <text x={POSITIONS[i][0]} y={POSITIONS[i][1] + 3.5} textAnchor="middle" fontSize="11" fontFamily={MONO} fill={INK}>
              {label}
            </text>
          </g>
        ))}
      </svg>

      <div className="space-y-3 min-w-0">
        <Slider label={t.threshold} min={1} max={MAX_WEIGHT} step={1} value={threshold} onChange={setThreshold} />
        <div className="grid grid-cols-3 gap-3">
          <Readout label={t.links}>{s.L}</Readout>
          <Readout label={t.density}>{fmt(s.density, 2)}</Readout>
          <Readout label={t.components}>{s.components}</Readout>
        </div>
        <p className="text-xs text-slate-500 leading-snug">{t.note}</p>
      </div>
    </div>
  )
}
