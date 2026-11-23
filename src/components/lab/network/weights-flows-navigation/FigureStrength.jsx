import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, INK, SLATE, MONO, Pill, Stat } from '../ui.jsx'
import { nodeReport } from './weights.js'
import { F1_START, F1_MAX, F1_LEVEL } from './figures.js'

// Live figure F1, "Strength and disparity": one node with six links and a
// slider for each weight. Readouts: s, k, Y, 1/k and, for every link, the
// disparity filter's p-value, marked when it is below 0.05. Plain SVG with no
// pointer handlers, so a swipe over it scrolls the page.

const T = {
  en: {
    link: (j) => `w${'₁₂₃₄₅₆'[j]}`,
    s: 'Strength s',
    k: 'Degree k',
    Y: 'Disparity Y',
    even: '1/k (even split)',
    note: 'w₁ … w₆ are the weights of links 1 to 6. After each weight, the p-value α of that link, (1 − w/s)^(k − 1). A star and an orange line mark the links below 0.05, the ones the disparity filter keeps.',
    reset: 'Start again',
    equal: 'All equal',
    aria: 'A node with six links, each as thick as its weight',
    locale: 'en-US',
  },
  it: {
    link: (j) => `w${'₁₂₃₄₅₆'[j]}`,
    s: 'Forza s',
    k: 'Grado k',
    Y: 'Disparità Y',
    even: '1/k (ripartizione uniforme)',
    note: 'w₁ … w₆ sono i pesi dei collegamenti da 1 a 6. Dopo ogni peso, il p-value α di quel collegamento, (1 − w/s)^(k − 1). Una stella e una linea arancione segnano i collegamenti sotto 0,05, quelli che il filtro di disparità tiene.',
    reset: 'Ricomincia',
    equal: 'Tutti uguali',
    aria: 'Un nodo con sei collegamenti, ciascuno spesso quanto il suo peso',
    locale: 'it-IT',
  },
}

const W = 220
const H = 200

export default function FigureStrength({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [w, setW] = useState(F1_START)
  const r = nodeReport(w)
  const num = (v, d) => v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d })
  const cx = W / 2
  const cy = H / 2
  const R = 78

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[2fr_3fr] items-start">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-h-44 bg-white border border-slate-200 rounded" role="img" aria-label={t.aria}>
          {w.map((x, j) => {
            const a = (-Math.PI / 2) + (j * Math.PI) / 3
            const px = cx + R * Math.cos(a)
            const py = cy + R * Math.sin(a)
            const keep = r.alpha[j] < F1_LEVEL
            return (
              <g key={j}>
                <line x1={cx} y1={cy} x2={px} y2={py} stroke={keep ? ORANGE_DARK : SLATE} strokeWidth={0.8 + (x / F1_MAX) * 11} strokeLinecap="round" opacity={keep ? 1 : 0.7} />
                <circle cx={px} cy={py} r={9} fill="#ffffff" stroke={SLATE} strokeWidth="1.2" />
                <text x={px} y={py + 3} textAnchor="middle" fontSize="9" fontFamily={MONO} fill={INK}>
                  {j + 1}
                </text>
              </g>
            )
          })}
          <circle cx={cx} cy={cy} r={11} fill={INK} />
        </svg>
        <div className="min-w-0">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {w.map((x, j) => (
              <Slider
                key={j}
                label={t.link(j)}
                min={1}
                max={F1_MAX}
                step={1}
                value={x}
                onChange={(v) => setW((old) => old.map((o, i) => (i === j ? Math.round(v) : o)))}
                format={(v) => `${v} · α ${num(r.alpha[j], 3)}${r.alpha[j] < F1_LEVEL ? ' ★' : ''}`}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill onClick={() => setW(F1_START)} data-action="reset">
              {t.reset}
            </Pill>
            <Pill onClick={() => setW(F1_START.map(() => 3))} data-action="equal">
              {t.equal}
            </Pill>
          </div>
        </div>
      </div>
      <div
        className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2"
        data-readout="strength"
        data-s={r.s}
        data-k={r.k}
        data-y={r.Y.toFixed(4)}
        data-even={r.even.toFixed(4)}
        data-alpha={r.alpha.map((a) => a.toFixed(4)).join(' ')}
        data-kept={r.alpha.filter((a) => a < F1_LEVEL).length}
      >
        <Stat label={t.s}>{r.s}</Stat>
        <Stat label={t.k}>{r.k}</Stat>
        <Stat label={t.Y}>
          <span style={{ color: ORANGE_DARK }}>{num(r.Y, 3)}</span>
        </Stat>
        <Stat label={t.even}>{num(r.even, 3)}</Stat>
      </div>
      <p className="mt-1 text-xs text-slate-500 leading-snug">{t.note}</p>
    </div>
  )
}
