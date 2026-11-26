import { useMemo, useState } from 'react'
import { INK, SLATE, GRID, MONO } from '../../network/ui.jsx'
import PayoffTable, { ROW_COLOR, COL_COLOR } from '../PayoffTable.jsx'
import { classic, EXERCISE_1, penaltyGame, rowLine, colLine } from './mixed.js'
import { equilibria, showNumber } from './support.js'

// Live figure F1: two best responses in a square. Horizontal: q, the
// probability that the column player plays the first column; vertical: p,
// the probability that the row player plays the first row. The row
// player's best response to every q and the column player's to every p are
// two step lines; where they cross is an equilibrium. A select and plain
// SVG, so it never captures a swipe.

export const SQUARE_PRESETS = ['pd', 'stag', 'chicken', 'battle', 'pennies', 'coordination', 'exercise1', 'penalty']

const T = {
  en: {
    preset: 'Game',
    presets: {
      pd: "Prisoner's Dilemma",
      stag: 'Stag hunt (modules 01 and 02)',
      chicken: 'Chicken',
      battle: 'Battle of the sexes',
      pennies: 'Matching pennies',
      coordination: 'Pure coordination',
      exercise1: 'Exercise 1',
      penalty: 'Penalty kick (kicker in rows)',
    },
    names: {
      pd: ['C', 'D'],
      stag: ['Stag', 'Hare'],
      chicken: ['Swerve', 'Straight'],
      battle: ['Concert', 'Match'],
      pennies: ['Heads', 'Tails'],
      coordination: ['Left', 'Right'],
      penalty: ['L', 'R'],
    },
    rowLine: 'row player’s best response to q',
    colLine: 'column player’s best response to p',
    eq: (n) => (n === 1 ? 'One equilibrium' : `${n} equilibria`),
    item: (p, q, u, v) => `p = ${p}, q = ${q}: payoffs ${u} and ${v}`,
    pure: 'pure',
    mixed: 'mixed',
    q: 'q',
    p: 'p',
    aria: 'The unit square of the two mixes, with the two best-response lines and their crossings, the equilibria',
    tableAria: 'Payoff table of the chosen game',
  },
  it: {
    preset: 'Gioco',
    presets: {
      pd: 'Dilemma del prigioniero',
      stag: 'Caccia al cervo (moduli 01 e 02)',
      chicken: 'Gioco del pollo',
      battle: 'Battaglia dei sessi',
      pennies: 'Pari o dispari',
      coordination: 'Coordinamento puro',
      exercise1: 'Esercizio 1',
      penalty: 'Calcio di rigore (rigorista sulle righe)',
    },
    names: {
      pd: ['C', 'D'],
      stag: ['Cervo', 'Lepre'],
      chicken: ['Sterza', 'Dritto'],
      battle: ['Concerto', 'Partita'],
      pennies: ['Un dito', 'Due dita'],
      coordination: ['Sinistra', 'Destra'],
      penalty: ['S', 'D'],
    },
    rowLine: 'miglior risposta del giocatore di riga a q',
    colLine: 'miglior risposta del giocatore di colonna a p',
    eq: (n) => (n === 1 ? 'Un equilibrio' : `${n} equilibri`),
    item: (p, q, u, v) => `p = ${p}, q = ${q}: payoff ${u} e ${v}`,
    pure: 'puro',
    mixed: 'misto',
    q: 'q',
    p: 'p',
    aria: 'Il quadrato unitario delle due strategie miste, con le due linee di miglior risposta e i loro incroci, gli equilibri',
    tableAria: 'Tabella dei payoff del gioco scelto',
  },
}

export function squareGame(id, lang = 'en') {
  const t = T[lang] || T.en
  if (id === 'exercise1') return EXERCISE_1
  if (id === 'penalty') return penaltyGame(undefined, t.names.penalty, t.names.penalty)
  return classic(id, t.names[id])
}

const S = 200 // side of the square
const PAD = { left: 30, top: 10, right: 10, bottom: 30 }

export default function FigureSquare({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [id, setId] = useState('battle')
  const game = useMemo(() => squareGame(id, lang), [id, lang])
  const list = useMemo(() => equilibria(game), [game])
  const X = (q) => PAD.left + q * S
  const Y = (p) => PAD.top + (1 - p) * S
  const path = (pts) => pts.map(([q, p], k) => `${k ? 'L' : 'M'}${X(q).toFixed(1)},${Y(p).toFixed(1)}`).join(' ')
  const money = (v) => showNumber(v, id === 'penalty' ? 2 : 3, lang)

  return (
    <div className="grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] items-start">
      <div className="min-w-0 max-w-[15rem]">
        <svg viewBox={`0 0 ${S + PAD.left + PAD.right} ${S + PAD.top + PAD.bottom}`} className="w-full h-auto" role="img" aria-label={t.aria} data-role="square">
          <rect x={X(0)} y={Y(1)} width={S} height={S} fill="white" stroke={GRID} />
          {[0.25, 0.5, 0.75].map((v) => (
            <g key={v}>
              <line x1={X(v)} x2={X(v)} y1={Y(0)} y2={Y(1)} stroke={GRID} />
              <line x1={X(0)} x2={X(1)} y1={Y(v)} y2={Y(v)} stroke={GRID} />
            </g>
          ))}
          {[0, 0.5, 1].map((v) => (
            <g key={`t${v}`} fontSize="9" fontFamily={MONO} fill={SLATE}>
              <text x={X(v)} y={Y(0) + 12} textAnchor="middle">{v === 0.5 ? (lang === 'it' ? '0,5' : '0.5') : v}</text>
              <text x={X(0) - 5} y={Y(v) + 3} textAnchor="end">{v === 0.5 ? (lang === 'it' ? '0,5' : '0.5') : v}</text>
            </g>
          ))}
          <text x={X(1)} y={Y(0) + 25} textAnchor="end" fontSize="10" fontFamily={MONO} fill={SLATE}>{t.q} →</text>
          <text x={8} y={Y(1) + 8} fontSize="10" fontFamily={MONO} fill={SLATE}>{t.p}</text>
          <path d={path(rowLine(game))} fill="none" stroke={ROW_COLOR} strokeWidth="4" strokeOpacity="0.8" strokeLinejoin="round" />
          <path d={path(colLine(game))} fill="none" stroke={COL_COLOR} strokeWidth="2.25" strokeDasharray="6 3" strokeLinejoin="round" />
          {list.map((e, k) => (
            <circle key={k} cx={X(e.y[0])} cy={Y(e.x[0])} r="6" fill="white" stroke={INK} strokeWidth="2.25" data-role="crossing" />
          ))}
        </svg>
        <div className="mt-1 space-y-0.5 text-[11px] text-slate-600 leading-snug">
          <div className="flex items-center gap-2">
            <span className="inline-block w-5 h-1 rounded" style={{ background: ROW_COLOR }} />
            {t.rowLine}
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-5 border-t-2 border-dashed" style={{ borderColor: COL_COLOR }} />
            {t.colLine}
          </div>
        </div>
      </div>
      <div className="min-w-0 space-y-3">
        <label className="block text-xs text-slate-600">
          <span className="font-mono uppercase tracking-wider text-[10px] text-slate-500 font-semibold">{t.preset}</span>
          <select
            className="mt-1 block w-full max-w-xs rounded border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900"
            value={id}
            onChange={(e) => setId(e.target.value)}
            data-role="square-preset"
          >
            {SQUARE_PRESETS.map((k) => (
              <option key={k} value={k}>
                {t.presets[k]}
              </option>
            ))}
          </select>
        </label>
        <div className="max-w-xs">
          <PayoffTable game={game} aria={t.tableAria} />
        </div>
        <div className="text-sm text-slate-700 leading-snug" data-role="square-list">
          <div className="font-semibold text-slate-900">{t.eq(list.length)}</div>
          <ul className="mt-1 space-y-0.5 font-mono text-xs tabular-nums">
            {list.map((e, k) => (
              <li key={k}>
                {t.item(showNumber(e.x[0], 3, lang), showNumber(e.y[0], 3, lang), money(e.u), money(e.v))} ({e.rows.length === 1 ? t.pure : t.mixed})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
