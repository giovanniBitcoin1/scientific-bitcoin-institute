import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import GameTree from '../GameTree.jsx'
import { ROW_COLOR, COL_COLOR } from '../PayoffTable.jsx'
import { typesFigure, DEFAULT_T, DEFAULT_W } from './types.js'

// Live figure F1, "Who is the incumbent?": the entry game of module 04 with a
// move of chance first. Nature makes the incumbent tough (probability t) or
// weak; the newcomer does not see which (its two nodes are one information
// set, the dashed line); the incumbent, who knows, shares or fights. Payoffs
// (newcomer, incumbent), the newcomer in the first player's colour. Sliders
// and SVG: nothing captures a swipe.

export const num = (v, lang = 'en', d = 2) => {
  const s = Number.isInteger(v) ? String(v) : v.toFixed(d)
  return (lang === 'it' ? s.replace('.', ',') : s).replace('-', '−')
}

const T = {
  en: {
    t: 't, chance the incumbent is tough',
    w: 'w, the newcomer’s payoff when fought',
    initials: ['E', 'I'],
    legend: ['newcomer (the entrant)', 'incumbent'],
    nature: 'N Nature',
    note: 'payoffs (newcomer, incumbent); dashed: the newcomer cannot tell its two nodes apart; orange: what is played under each type',
    aria: 'The entry game with a tough or a weak incumbent, drawn as a tree with a move of chance and an information set',
    types: 'The tough incumbent fights (3 against the 2 of sharing); the weak one shares (2 against 0).',
    value: (t, w, v) => `Entering pays the newcomer 2(1 − t) + t w = 2 × ${t1(t)} + ${t} × (${w}) = ${v} on average; staying out pays 0.`,
    threshold: (ts) => `It enters only if t is below t* = 2/(2 − w) = ${ts}.`,
    enters: (t, ts) => `Here t = ${t} is below ${ts}: the newcomer enters. The tough incumbent fights and gets 3, the weak one shares and gets 2.`,
    out: (t, ts) => `Here t = ${t} is above ${ts}: the newcomer stays out, and both types of incumbent keep 4.`,
    tie: (t) => `Here t = ${t} is exactly t*: the newcomer is indifferent, and here it stays out. Both types keep 4.`,
  },
  it: {
    t: 't, probabilità che l’impresa sia dura',
    w: 'w, il payoff del nuovo arrivato se viene combattuto',
    initials: ['E', 'I'],
    legend: ['nuovo arrivato (chi entra)', 'impresa che c’è già'],
    nature: 'N Natura',
    note: 'payoff (nuovo arrivato, impresa); tratteggio: il nuovo arrivato non distingue i suoi due nodi; arancione: ciò che si gioca con ciascun tipo',
    aria: 'Il gioco dell’ingresso con un’impresa dura o debole, disegnato come un albero con una mossa del caso e un insieme di informazione',
    types: 'L’impresa dura combatte (3 contro il 2 della divisione); quella debole divide (2 contro 0).',
    value: (t, w, v) => `Entrare rende al nuovo arrivato 2(1 − t) + t w = 2 × ${t1(t)} + ${t} × (${w}) = ${v} in media; restare fuori rende 0.`,
    threshold: (ts) => `Entra solo se t è sotto t* = 2/(2 − w) = ${ts}.`,
    enters: (t, ts) => `Qui t = ${t} è sotto ${ts}: il nuovo arrivato entra. L’impresa dura combatte e ottiene 3, quella debole divide e ottiene 2.`,
    out: (t, ts) => `Qui t = ${t} è sopra ${ts}: il nuovo arrivato resta fuori, ed entrambi i tipi di impresa tengono 4.`,
    tie: (t) => `Qui t = ${t} è esattamente t*: il nuovo arrivato è indifferente, e qui resta fuori. Entrambi i tipi tengono 4.`,
  },
}

// 1 − t written with the same decimals as t (the strings arrive formatted).
function t1(t) {
  const it = t.includes(',')
  const v = 1 - Number(t.replace(',', '.'))
  const s = v.toFixed(2)
  return it ? s.replace('.', ',') : s
}

export default function FigureTypes({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [t, setT] = useState(DEFAULT_T)
  const [w, setW] = useState(DEFAULT_W)
  const { eq, tree, choice, path } = useMemo(() => typesFigure({ t, w }, lang), [t, w, lang])
  const solved = new Set(tree.nodes.filter((n) => !n.payoffs && !n.chance).map((n) => n.id))
  const n = (v, d) => num(v, lang, d)
  const ts = n(eq.threshold, 3)
  const tt = n(t, 2)

  return (
    <div className="grid gap-x-6 gap-y-3 md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] items-start">
      <div className="min-w-0 max-w-lg">
        <GameTree tree={tree} initials={L.initials} choice={choice} solved={solved} path={path} infoSets={tree.infoSets} format={(v) => n(v, 1)} probFormat={(p) => n(p, 2)} aria={L.aria} />
        <p className="mt-1 text-[11px] text-slate-600 leading-snug">
          <span className="font-semibold text-slate-500">{L.nature}</span>
          {' · '}
          <span className="font-semibold" style={{ color: ROW_COLOR }}>
            {L.initials[0]} {L.legend[0]}
          </span>
          {' · '}
          <span className="font-semibold" style={{ color: COL_COLOR }}>
            {L.initials[1]} {L.legend[1]}
          </span>
          {' · '}
          {L.note}
        </p>
      </div>
      <div className="min-w-0 space-y-3">
        <Slider label={L.t} min={0} max={1} step={0.01} value={t} onChange={setT} format={(v) => n(v, 2)} />
        <Slider label={L.w} min={-3} max={0} step={0.5} value={w} onChange={setW} format={(v) => n(v, 1)} />
        <div className="text-sm text-slate-700 leading-snug space-y-1.5" data-role="types-story">
          <p>{L.types}</p>
          <p data-role="types-value">{L.value(tt, n(w, 1), n(eq.value, 2))}</p>
          <p data-role="types-threshold">{L.threshold(ts)}</p>
          <p className="font-medium text-slate-900" data-role="types-choice">
            {eq.tie ? L.tie(tt) : eq.enters ? L.enters(tt, ts) : L.out(tt, ts)}
          </p>
        </div>
      </div>
    </div>
  )
}
