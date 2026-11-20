import { useMemo, useState } from 'react'
import { INK, SLATE, MONO, ORANGE_DARK, Pill, fmt } from '../ui.jsx'
import { undirected, degree, closeness, betweenness, places, pairsOfOthers } from './centrality.js'
import { KITE } from './networks.js'

// Live figure F1, "Three winners": Krackhardt's kite and three questions.
// Each button sizes the nodes by one measure and lights up whoever comes
// first. Buttons only, so the figure never captures a swipe.

const T = {
  en: {
    measures: { degree: 'Degree', closeness: 'Closeness', betweenness: 'Betweenness' },
    ask: {
      degree: 'How many links?',
      closeness: 'How near to everyone?',
      betweenness: 'How often in between?',
    },
    first: 'First',
    value: {
      degree: (v) => `${v} links`,
      closeness: (v) => `${fmt(v, 3)} (9 others at a total distance of 14)`,
      betweenness: (v) => `${fmt(v, 0)} of the ${pairsOfOthers(10)} pairs of others = ${fmt(v / pairsOfOthers(10), 3)}`,
    },
    and: 'and',
    aria: (m, who) => `Krackhardt's kite, ten people; nodes sized by ${m}; first: ${who}`,
  },
  it: {
    measures: { degree: 'Grado', closeness: 'Vicinanza', betweenness: 'Intermediazione' },
    ask: {
      degree: 'Quanti collegamenti?',
      closeness: 'Quanto vicino a tutti?',
      betweenness: 'Quanto spesso in mezzo?',
    },
    first: 'In testa',
    value: {
      degree: (v) => `${v} collegamenti`,
      closeness: (v) => `${fmt(v, 3)} (9 altri a una distanza totale di 14)`,
      betweenness: (v) => `${fmt(v, 0)} delle ${pairsOfOthers(10)} coppie di altri = ${fmt(v / pairsOfOthers(10), 3)}`,
    },
    and: 'e',
    aria: (m, who) => `L'aquilone di Krackhardt, dieci persone; nodi dimensionati secondo ${m}; in testa: ${who}`,
  },
}

const IDS = ['degree', 'closeness', 'betweenness']
const X = (v) => 28 + KITE.pos[2 * v] * 264
const Y = (v) => 30 + KITE.pos[2 * v + 1] * 130
// Where each name goes relative to its node.
const LABEL = { Andre: [0, -1], Beverly: [0, 1], Carol: [0, -1], Diane: [0, 1], Ed: [0, 1], Fernando: [0, -1], Garth: [0, 1], Heather: [0, -1], Ike: [0, 1], Jane: [0, -1] }

export default function FigureKite({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [id, setId] = useState('degree')
  const all = useMemo(() => {
    const G = undirected(KITE)
    return { degree: degree(G), closeness: closeness(G), betweenness: betweenness(G) }
  }, [])
  const values = all[id]
  const max = Math.max(...values)
  const { place } = places(values)
  const winners = KITE.names.filter((_, v) => place[v] === 1)
  const who = winners.join(` ${t.and} `)
  const best = values[KITE.names.indexOf(winners[0])]

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {IDS.map((m) => (
          <Pill key={m} active={m === id} onClick={() => setId(m)}>
            {t.measures[m]}
          </Pill>
        ))}
      </div>
      <svg viewBox="0 0 320 190" className="mt-2 w-full h-auto max-h-[250px]" role="img" aria-label={t.aria(t.measures[id], who)}>
        {Array.from(KITE.A, (a, e) => (
          <line key={e} x1={X(a)} y1={Y(a)} x2={X(KITE.B[e])} y2={Y(KITE.B[e])} stroke={SLATE} strokeOpacity="0.55" strokeWidth="1.2" />
        ))}
        {KITE.names.map((name, v) => {
          const win = place[v] === 1
          const r = 4 + 8 * Math.sqrt(max > 0 ? values[v] / max : 0)
          const [, dy] = LABEL[name]
          return (
            <g key={name}>
              <circle cx={X(v)} cy={Y(v)} r={r} fill={win ? ORANGE_DARK : '#fff'} stroke={win ? ORANGE_DARK : INK} strokeWidth="1.5" />
              <text
                x={X(v)}
                y={Y(v) + dy * (r + 9) + (dy > 0 ? 2 : 0)}
                textAnchor="middle"
                fontSize="9.5"
                fontFamily={MONO}
                fontWeight={win ? 700 : 400}
                fill={win ? ORANGE_DARK : SLATE}
              >
                {name}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="mt-1 text-sm text-slate-700 leading-snug" aria-live="polite">
        <span className="text-slate-500">{t.ask[id]}</span>{' '}
        <span className="font-semibold text-orange-700">
          {t.first}: {who}
        </span>
        <span className="font-mono text-[13px] text-slate-900"> · {t.value[id](best)}</span>
      </p>
    </div>
  )
}
