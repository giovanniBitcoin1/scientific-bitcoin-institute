import { useMemo, useRef, useState } from 'react'
import { ORANGE_DARK, INK, MUTED, MONO } from '../ui.jsx'
import Chart from '../charts.jsx'
import { giantOf, placeOf, outliers, OUT_TOP, OUT_DEGREE } from './capstone.js'
import { AIRPORTS, PRE, describeAirport } from './store.js'

// Figure F2, "Out of line": degree against betweenness on logarithmic axes,
// one dot per airport of the largest component. Labelled: the airports that
// are among the OUT_TOP of highest betweenness with fewer than OUT_DEGREE
// routes (capstone.js).

const GIANT = giantOf(AIRPORTS)
const K = PRE.centrality.degree
const B = PRE.centrality.betweenness

const T = {
  en: {
    x: 'routes (degree)',
    y: 'betweenness',
    hint: 'Tap a dot for its name.',
    zero: (s) => `${s} of the airports lie between no two others (betweenness 0) and are not drawn.`,
    picked: (name, k, b, pk, pb) => `${name} · ${k} routes (place ${pk}) · betweenness ${b} (place ${pb})`,
    aria: 'Betweenness against number of routes for every airport, on logarithmic axes, with the airports far above the trend labelled',
    locale: 'en-US',
  },
  it: {
    x: 'rotte (grado)',
    y: 'betweenness',
    hint: 'Tocca un punto per vederne il nome.',
    zero: (s) => `Il ${s} degli aeroporti non sta tra altri due (betweenness 0) e non è disegnato.`,
    picked: (name, k, b, pk, pb) => `${name} · ${k} rotte (posto ${pk}) · betweenness ${b} (posto ${pb})`,
    aria: 'Betweenness rispetto al numero di rotte per ogni aeroporto, su assi logaritmici, con le etichette degli aeroporti molto sopra la tendenza',
    locale: 'it-IT',
  },
}

const X = { min: 1, max: 400, log: true, ticks: [1, 10, 100] }
const Y = { min: 1e-9, max: 0.2, log: true, ticks: [1e-8, 1e-6, 1e-4, 1e-2] }

export default function FigureOutliers({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [sel, setSel] = useState(-1)
  const maps = useRef(null)
  const shown = useMemo(() => Array.from({ length: GIANT.n }, (_, v) => v).filter((v) => B[v] >= Y.min), [])
  const labelled = useMemo(() => outliers(K, B), [])
  const points = useMemo(() => shown.map((v) => [K[v], B[v]]), [shown])
  const num = (v, d) => v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d })

  const click = (e) => {
    if (!maps.current) return
    const { sx, sy, W, H } = maps.current
    const box = e.currentTarget.ownerSVGElement.getBoundingClientRect()
    const px = ((e.clientX - box.left) / box.width) * W
    const py = ((e.clientY - box.top) / box.height) * H
    let best = -1
    let bestD = 12 * 12
    for (const v of shown) {
      const d = (sx(K[v]) - px) ** 2 + (sy(B[v]) - py) ** 2
      if (d < bestD) {
        bestD = d
        best = v
      }
    }
    setSel(best)
  }

  return (
    <div data-figure="outliers" data-shown={shown.length} data-labelled={labelled.map((v) => GIANT.names[v]).join(' ')} data-selected={sel >= 0 ? GIANT.names[sel] : ''}>
      <div className="max-w-md">
        <Chart x={{ ...X, label: t.x }} y={{ ...Y, label: t.y, labelSide: 'left' }} height={230} aria={t.aria} series={[{ points, color: MUTED, line: false, dots: 1.3, opacity: 0.75 }]}>
          {(m) => {
            maps.current = m
            return (
              <g>
                {labelled.map((v) => (
                  <g key={v}>
                    <circle cx={m.sx(K[v])} cy={m.sy(B[v])} r="2.6" fill={ORANGE_DARK} />
                    <text x={m.sx(K[v]) - 4} y={m.sy(B[v]) - 3} textAnchor="end" fontSize="8" fontFamily={MONO} fill={ORANGE_DARK}>
                      {AIRPORTS.nodes.city[GIANT.orig[v]]}
                    </text>
                  </g>
                ))}
                {sel >= 0 && <circle cx={m.sx(K[sel])} cy={m.sy(B[sel])} r="4" fill="none" stroke={INK} strokeWidth="1.5" />}
                <rect x="0" y="0" width={m.W} height={m.H} fill="transparent" onClick={click} style={{ cursor: 'pointer' }} data-plot="outliers" />
              </g>
            )
          }}
        </Chart>
      </div>
      <p className="mt-1 text-xs text-slate-600 leading-snug" data-outlier="result">
        {sel >= 0 ? t.picked(describeAirport(GIANT.orig[sel]), K[sel], num(B[sel], 4), placeOf(K, sel), placeOf(B, sel)) : t.hint}
      </p>
      <p className="mt-0.5 text-xs text-slate-500 leading-snug">{t.zero(num(PRE.centrality.zeroShare, 3))}</p>
    </div>
  )
}
