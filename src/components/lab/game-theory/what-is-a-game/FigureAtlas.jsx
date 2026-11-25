import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, INK, SLATE, MONO } from '../../network/ui.jsx'
import PayoffTable, { TableLegend } from '../PayoffTable.jsx'
import { classifyTS, bestResponses } from './games.js'

// Live figure F2: the map of the symmetric two-by-two games. With R = 1 for
// mutual cooperation and P = 0 for mutual defection, the temptation T and the
// sucker's payoff S place a game in one of four regions. The point is moved
// with two sliders or with a click on the map (a click, not a drag: the map
// never captures a swipe).

const REGION_FILL = { pd: '#fee2e2', stag: '#e0f2fe', chicken: '#fef3c7', harmony: '#dcfce7' }

const T = {
  en: {
    T: 'Temptation T',
    S: "Sucker's payoff S",
    names: { pd: "Prisoner's Dilemma", stag: 'Stag hunt', chicken: 'Chicken', harmony: 'Harmony' },
    short: { pd: ["Prisoner's", 'Dilemma'], stag: ['Stag', 'hunt'], chicken: ['Chicken'], harmony: ['Harmony'] },
    border: 'On the border',
    game: 'Game',
    dominant: 'Dominant strategy',
    none: 'none',
    stable: 'Stable cells',
    aria: 'Map of the symmetric two-by-two games: temptation T on the horizontal axis, sucker’s payoff S on the vertical axis, four regions',
    tableAria: 'Payoff table of the game at the chosen point',
  },
  it: {
    T: 'Tentazione T',
    S: "Payoff dell'ingenuo S",
    names: { pd: 'Dilemma del prigioniero', stag: 'Caccia al cervo', chicken: 'Gioco del pollo', harmony: 'Armonia' },
    short: { pd: ['Dilemma del', 'prigioniero'], stag: ['Caccia', 'al cervo'], chicken: ['Gioco', 'del pollo'], harmony: ['Armonia'] },
    border: 'Sul confine',
    game: 'Gioco',
    dominant: 'Strategia dominante',
    none: 'nessuna',
    stable: 'Celle stabili',
    aria: "Mappa dei giochi due per due simmetrici: tentazione T sull'asse orizzontale, payoff dell'ingenuo S sull'asse verticale, quattro regioni",
    tableAria: 'Tabella dei payoff del gioco nel punto scelto',
  },
}

// Plot area in viewBox units: T from 0 to 2, S from −1 to 1.
const W = 300
const H = 232
const X0 = 30
const X1 = 292
const Y0 = 8
const Y1 = 208
const px = (t) => X0 + (t / 2) * (X1 - X0)
const py = (s) => Y0 + ((1 - s) / 2) * (Y1 - Y0)
const snap = (v) => Math.round(v * 20) / 20
const show = (v) => (Object.is(v, -0) ? 0 : v).toFixed(2).replace('-', '−')

const REGIONS = [
  { id: 'harmony', x: 0, y: 1, cx: 0.5, cy: 0.5 },
  { id: 'chicken', x: 1, y: 1, cx: 1.5, cy: 0.5 },
  { id: 'stag', x: 0, y: 0, cx: 0.5, cy: -0.5 },
  { id: 'pd', x: 1, y: 0, cx: 1.5, cy: -0.5 },
]

export default function FigureAtlas({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [point, setPoint] = useState({ T: 1.5, S: -0.5 })
  const c = classifyTS(point.T, point.S)
  const marks = bestResponses(c.game)
  const stable = c.game.rows.flatMap((_, i) => c.game.cols.map((__, j) => [i, j])).filter(([i, j]) => marks.row[i][j] && marks.col[i][j])

  const onMap = (e) => {
    const svg = e.currentTarget
    const r = svg.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * W
    const y = ((e.clientY - r.top) / r.height) * H
    const T_ = Math.min(2, Math.max(0, snap(((x - X0) / (X1 - X0)) * 2)))
    const S_ = Math.min(1, Math.max(-1, snap(1 - ((y - Y0) / (Y1 - Y0)) * 2)))
    setPoint({ T: T_, S: S_ })
  }

  return (
    <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto cursor-pointer" role="img" aria-label={t.aria} onClick={onMap}>
        {REGIONS.map((r) => (
          <g key={r.id}>
            <rect x={px(r.x)} y={py(r.y)} width={px(1) - px(0)} height={py(0) - py(1)} fill={REGION_FILL[r.id]} />
            {t.short[r.id].map((word, k, all) => (
              <text
                key={word}
                x={px(r.cx)}
                y={py(r.cy + 0.22) + 4 + (k - (all.length - 1) / 2) * 12}
                textAnchor="middle"
                fontSize="10"
                fontFamily={MONO}
                fill={INK}
                opacity={c.region === r.id ? 1 : 0.55}
                fontWeight={c.region === r.id ? 700 : 400}
              >
                {word}
              </text>
            ))}
          </g>
        ))}
        <rect x={X0} y={Y0} width={X1 - X0} height={Y1 - Y0} fill="none" stroke={SLATE} strokeWidth="1" />
        <line x1={px(1)} x2={px(1)} y1={Y0} y2={Y1} stroke={SLATE} strokeWidth="1" />
        <line x1={X0} x2={X1} y1={py(0)} y2={py(0)} stroke={SLATE} strokeWidth="1" />
        {[0, 0.5, 1, 1.5, 2].map((v) => (
          <text key={v} x={px(v)} y={Y1 + 11} textAnchor="middle" fontSize="9" fontFamily={MONO} fill={SLATE}>
            {v}
          </text>
        ))}
        {[-1, -0.5, 0, 0.5, 1].map((v) => (
          <text key={v} x={X0 - 4} y={py(v) + 3} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>
            {String(v).replace('-', '−')}
          </text>
        ))}
        <text x={X1} y={H - 2} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>
          T
        </text>
        <text x={X0 + 4} y={Y0 + 10} fontSize="9" fontFamily={MONO} fill={SLATE}>
          S
        </text>
        <circle cx={px(point.T)} cy={py(point.S)} r="5.5" fill={ORANGE_DARK} stroke="#fff" strokeWidth="2" />
      </svg>

      <div className="space-y-2 min-w-0">
        <Slider label={t.T} min={0} max={2} step={0.05} value={point.T} onChange={(v) => setPoint((p) => ({ ...p, T: snap(v) }))} format={show} />
        <Slider label={t.S} min={-1} max={1} step={0.05} value={point.S} onChange={(v) => setPoint((p) => ({ ...p, S: snap(v) }))} format={show} />
        <div className="max-w-[16rem]">
          <PayoffTable game={c.game} marks={marks} stable={stable} format={show} aria={t.tableAria} />
        </div>
        <TableLegend lang={lang} />
        <p className="text-sm text-slate-700 leading-snug" data-role="atlas-readout">
          {t.game}: <strong className="text-slate-900">{c.border ? t.border : t.names[c.region]}</strong>
          <br />
          {t.dominant}: <span className="font-mono text-slate-900">{c.dominant || t.none}</span>
          <br />
          {t.stable}:{' '}
          <span className="font-mono text-slate-900">{c.stable.length ? c.stable.map(([r, k]) => `(${r}, ${k})`).join(' ') : t.none}</span>
        </p>
      </div>
    </div>
  )
}
