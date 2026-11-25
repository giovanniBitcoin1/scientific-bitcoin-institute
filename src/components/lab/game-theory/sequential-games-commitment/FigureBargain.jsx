import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, INK, SLATE, GRID, MONO } from '../../network/ui.jsx'
import { ROW_COLOR, COL_COLOR } from '../PayoffTable.jsx'
import { shares, rubinstein, DEFAULT_DELTA, DEFAULT_ROUNDS } from './bargaining.js'

// Live figure F2: bargaining by alternating offers over a pie that shrinks
// by δ at every round. One bar per number of rounds T = 1, 2, …: the first
// proposer's share; a dashed line at the share with no last round,
// 1/(1 + δ), or (1 − δ2)/(1 − δ1 δ2) with two discount factors. Sliders,
// a pill and SVG: nothing captures a swipe.

const T = {
  en: {
    delta: 'δ, the pie kept at each round',
    delta1: 'δ₁, the first proposer’s',
    delta2: 'δ₂, the other player’s',
    rounds: 'Rounds T at most',
    two: 'Different patience',
    axis: 'rounds',
    limit: 'no last round',
    odd: 'odd T: the first proposer makes the last offer',
    even: 'even T: the other does',
    readout: (T, s, l, two) =>
      `With ${T} round${T === 1 ? '' : 's'} at most the first proposer gets ${s}. With no last round it gets ${l} = ${two ? '(1 − δ₂)/(1 − δ₁δ₂)' : '1/(1 + δ)'}, and the first offer is accepted.`,
    aria: 'Bars of the first proposer’s share for each number of rounds, with a line at the share when there is no last round',
  },
  it: {
    delta: 'δ, la torta che resta a ogni turno',
    delta1: 'δ₁, del primo proponente',
    delta2: 'δ₂, dell’altro giocatore',
    rounds: 'Turni T al massimo',
    two: 'Pazienza diversa',
    axis: 'turni',
    limit: 'nessun ultimo turno',
    odd: 'T dispari: l’ultima offerta è del primo proponente',
    even: 'T pari: è dell’altro',
    readout: (T, s, l, two) =>
      `Con ${T === 1 ? 'un turno' : `${T} turni`} al massimo il primo proponente ottiene ${s}. Senza un ultimo turno ottiene ${l} = ${two ? '(1 − δ₂)/(1 − δ₁δ₂)' : '1/(1 + δ)'}, e la prima offerta viene accettata.`,
    aria: 'Barre della quota del primo proponente per ogni numero di turni, con una linea alla quota quando non c’è un ultimo turno',
  },
}

const W = 320
const H = 170
const PAD = { left: 30, right: 8, top: 10, bottom: 26 }

export default function FigureBargain({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [d1, setD1] = useState(DEFAULT_DELTA)
  const [d2, setD2] = useState(DEFAULT_DELTA)
  const [rounds, setRounds] = useState(DEFAULT_ROUNDS)
  const [two, setTwo] = useState(false)
  const other = two ? d2 : d1
  const s = shares(rounds, d1, other)
  const limit = rubinstein(d1, other)
  const loc = (v, d = 4) => (lang === 'it' ? v.toFixed(d).replace('.', ',') : v.toFixed(d))
  const bw = (W - PAD.left - PAD.right) / rounds
  const Y = (v) => PAD.top + (1 - v) * (H - PAD.top - PAD.bottom)

  return (
    <div className="grid gap-x-6 gap-y-3 md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] items-start">
      <div className="min-w-0 max-w-md">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={t.aria} data-role="pie">
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <g key={v}>
              <line x1={PAD.left} x2={W - PAD.right} y1={Y(v)} y2={Y(v)} stroke={GRID} />
              <text x={PAD.left - 4} y={Y(v) + 3} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>
                {lang === 'it' ? String(v).replace('.', ',') : v}
              </text>
            </g>
          ))}
          {s.map((v, k) => (
            <g key={k}>
              <rect
                x={PAD.left + k * bw + bw * 0.15}
                y={Y(v)}
                width={bw * 0.7}
                height={Y(0) - Y(v)}
                fill={k % 2 === 0 ? ROW_COLOR : COL_COLOR}
                opacity="0.85"
                data-bar={k + 1}
              />
              {(rounds <= 10 || k % 2 === 0 || k === rounds - 1) && (
                <text x={PAD.left + (k + 0.5) * bw} y={H - PAD.bottom + 12} textAnchor="middle" fontSize="9" fontFamily={MONO} fill={SLATE}>
                  {k + 1}
                </text>
              )}
            </g>
          ))}
          <line x1={PAD.left} x2={W - PAD.right} y1={Y(limit)} y2={Y(limit)} stroke={INK} strokeWidth="1.5" strokeDasharray="5 3" />
          <text x={W - PAD.right} y={Y(limit) - 4} textAnchor="end" fontSize="9" fontFamily={MONO} fill={INK}>
            {t.limit} {loc(limit, 3)}
          </text>
          <line x1={PAD.left} x2={W - PAD.right} y1={Y(0)} y2={Y(0)} stroke={SLATE} />
          <text x={W - PAD.right} y={H - 2} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>
            T, {t.axis} →
          </text>
        </svg>
        <div className="mt-1 space-y-0.5 text-[11px] text-slate-600 leading-snug">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: ROW_COLOR }} />
            {t.odd}
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ background: COL_COLOR }} />
            {t.even}
          </div>
        </div>
      </div>
      <div className="min-w-0 space-y-3">
        <Slider label={two ? t.delta1 : t.delta} min={0.5} max={0.99} step={0.01} value={d1} onChange={setD1} format={(v) => loc(v, 2)} />
        <Slider label={t.rounds} min={1} max={20} step={1} value={rounds} onChange={setRounds} />
        <div>
          <Pill active={two} onClick={() => setTwo(!two)}>
            {t.two}
          </Pill>
        </div>
        {two && <Slider label={t.delta2} min={0.5} max={0.99} step={0.01} value={d2} onChange={setD2} format={(v) => loc(v, 2)} />}
        <p className="text-sm text-slate-700 leading-snug" data-role="pie-readout">
          {t.readout(rounds, loc(s[rounds - 1]), loc(limit), two)}
        </p>
      </div>
    </div>
  )
}
