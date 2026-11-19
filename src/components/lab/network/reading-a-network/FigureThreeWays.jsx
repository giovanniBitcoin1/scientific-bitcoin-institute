import { useState } from 'react'
import { ORANGE_DARK, INK, MUTED } from '../ui.jsx'

// Live figure F1: one network of six nodes written three ways — drawing,
// adjacency matrix, link list. Tapping a matrix cell toggles that link in all
// three; hovering or tapping a link highlights it in all three. Clicks only,
// so the figure never captures a swipe.

const N = 6
const POS = [
  [30, 26],
  [112, 22],
  [70, 70],
  [118, 104],
  [34, 118],
  [84, 134],
]
const START = [
  [0, 1],
  [0, 2],
  [1, 2],
  [2, 3],
  [2, 4],
  [3, 5],
  [4, 5],
]

const T = {
  en: {
    drawing: 'Drawing',
    matrix: 'Adjacency matrix',
    list: (L) => `Link list · L = ${L}`,
    hint: 'Tap a cell of the matrix to add or remove a link.',
    empty: 'no links',
    aria: 'Network of six numbered nodes',
  },
  it: {
    drawing: 'Disegno',
    matrix: 'Matrice di adiacenza',
    list: (L) => `Lista dei collegamenti · L = ${L}`,
    hint: 'Tocca una cella della matrice per aggiungere o togliere un collegamento.',
    empty: 'nessun collegamento',
    aria: 'Rete di sei nodi numerati',
  },
}

const key = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`)
const label = 'text-[11px] uppercase tracking-wider text-slate-500 font-mono'

export default function FigureThreeWays({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [links, setLinks] = useState(() => new Set(START.map(([a, b]) => key(a, b))))
  const [hl, setHl] = useState(null) // highlighted pair, as a key

  const toggle = (a, b) => {
    const k = key(a, b)
    setLinks((old) => {
      const next = new Set(old)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
    setHl(k)
  }

  const list = [...links].map((k) => k.split('-').map(Number)).sort((x, y) => x[0] - y[0] || x[1] - y[1])
  const hlNodes = hl && links.has(hl) ? hl.split('-').map(Number) : []
  const hover = (k) => ({
    onMouseEnter: () => setHl(k),
    onMouseLeave: () => setHl(null),
    onClick: () => setHl(k),
  })

  return (
    <div>
      <div className="grid grid-cols-[auto_auto] sm:grid-cols-[auto_auto_1fr] gap-x-2 sm:gap-x-6 gap-y-3 justify-between sm:justify-start items-start">
        <div>
          <p className={label}>{t.drawing}</p>
          <svg viewBox="0 0 146 156" className="mt-1 w-[130px] sm:w-[170px] h-auto" role="img" aria-label={t.aria}>
            {list.map(([a, b]) => {
              const k = key(a, b)
              const on = hl === k
              return (
                <g key={k} {...hover(k)} className="cursor-pointer">
                  <line x1={POS[a][0]} y1={POS[a][1]} x2={POS[b][0]} y2={POS[b][1]} stroke="transparent" strokeWidth="14" />
                  <line
                    x1={POS[a][0]}
                    y1={POS[a][1]}
                    x2={POS[b][0]}
                    y2={POS[b][1]}
                    stroke={on ? ORANGE_DARK : MUTED}
                    strokeWidth={on ? 3.5 : 1.75}
                  />
                </g>
              )
            })}
            {POS.map(([x, y], i) => {
              const on = hlNodes.includes(i)
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="11" fill={on ? ORANGE_DARK : '#fff'} stroke={on ? ORANGE_DARK : INK} strokeWidth="1.5" />
                  <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontFamily="IBM Plex Mono, monospace" fill={on ? '#fff' : INK}>
                    {i + 1}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div>
          <p className={label}>{t.matrix}</p>
          <div className="mt-1 inline-grid grid-cols-7 font-mono text-[11px] sm:text-xs" role="grid">
            <span className="w-[18px]" />
            {POS.map((_, j) => (
              <span key={j} className="w-[20px] h-[18px] sm:w-6 text-center text-slate-400">
                {j + 1}
              </span>
            ))}
            {POS.map((_, i) => [
              <span key={`r${i}`} className="w-[18px] h-[20px] sm:h-6 leading-[20px] sm:leading-6 text-slate-400">
                {i + 1}
              </span>,
              ...POS.map((__, j) => {
                if (i === j)
                  return (
                    <span key={j} className="w-[20px] h-[20px] sm:w-6 sm:h-6 leading-[20px] sm:leading-6 text-center text-slate-300 bg-slate-100 border border-white">
                      0
                    </span>
                  )
                const k = key(i, j)
                const on = links.has(k)
                const lit = hl === k
                return (
                  <button
                    key={j}
                    type="button"
                    aria-label={`${i + 1}, ${j + 1}: ${on ? 1 : 0}`}
                    onClick={() => toggle(i, j)}
                    onMouseEnter={() => setHl(k)}
                    onMouseLeave={() => setHl(null)}
                    className={`w-[20px] h-[20px] sm:w-6 sm:h-6 leading-[18px] sm:leading-[22px] text-center border border-white ${
                      lit
                        ? 'bg-orange-500 text-white'
                        : on
                          ? 'bg-slate-800 text-white'
                          : 'bg-white text-slate-400 hover:bg-orange-100'
                    }`}
                  >
                    {on ? 1 : 0}
                  </button>
                )
              }),
            ])}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 min-w-0">
          <p className={label}>{t.list(list.length)}</p>
          <div className="mt-1 flex flex-wrap gap-1 font-mono text-xs">
            {list.length === 0 && <span className="text-slate-400">{t.empty}</span>}
            {list.map(([a, b]) => {
              const k = key(a, b)
              return (
                <button
                  key={k}
                  type="button"
                  {...hover(k)}
                  className={`px-1.5 py-0.5 rounded border ${
                    hl === k ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  ({a + 1}, {b + 1})
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-snug">{t.hint}</p>
        </div>
      </div>
    </div>
  )
}
