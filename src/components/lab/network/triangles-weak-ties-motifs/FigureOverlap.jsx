import { useMemo, useState } from 'react'
import { INK, SLATE, MONO, ORANGE_DARK, fmt } from '../ui.jsx'
import { adjacency, commonNeighbours, linkTable, TWO_CLUSTERS as G } from './overlap.js'

// Live figure F1, "Overlap": twelve people in two clusters joined by one
// link. A tap on a link lights up the neighbours its two ends share and shows
// the overlap; local bridges are drawn dashed. Clicks on SVG only, so the
// figure never captures a swipe.

const SKY = '#0284c7'

const T = {
  en: {
    hint: 'Tap a link.',
    link: 'Link',
    shared: (list) => (list.length ? `shared neighbours: ${list.join(', ')}` : 'no shared neighbour'),
    overlap: 'overlap',
    of: (c, o) => `${c} of the ${o} other neighbours of its two ends`,
    localBridge: 'A local bridge: its two ends share nobody.',
    bridge: 'A local bridge, and a bridge: without it the network splits in two.',
    legend: 'Dashed: local bridges. Orange: shared neighbours. Blue ring: neighbours of one end only.',
    aria: (name) => `Twelve nodes in two clusters joined by the link f–g; selected link ${name}`,
    linkAria: (name) => `Link ${name}`,
  },
  it: {
    hint: 'Tocca un collegamento.',
    link: 'Collegamento',
    shared: (list) => (list.length ? `vicini in comune: ${list.join(', ')}` : 'nessun vicino in comune'),
    overlap: 'sovrapposizione',
    of: (c, o) => `${c} degli altri ${o} vicini dei suoi due estremi`,
    localBridge: 'Un ponte locale: i suoi due estremi non hanno vicini in comune.',
    bridge: 'Un ponte locale, e un ponte: senza di lui la rete si divide in due.',
    legend: 'Tratteggiati: i ponti locali. Arancione: i vicini in comune. Anello blu: i vicini di un solo estremo.',
    aria: (name) => `Dodici nodi in due gruppi uniti dal collegamento f–g; collegamento selezionato ${name}`,
    linkAria: (name) => `Collegamento ${name}`,
  },
}

const X = (v) => 22 + G.pos[2 * v] * 296
const Y = (v) => 20 + G.pos[2 * v + 1] * 130
const R = 9.5

export default function FigureOverlap({ lang = 'en' }) {
  const t = T[lang] || T.en
  const adj = useMemo(() => adjacency(G), [])
  const table = useMemo(() => linkTable(G, adj), [adj])
  const [sel, setSel] = useState(2) // b–c
  const row = table[sel]
  const shared = commonNeighbours(adj, row.a, row.b)
  const isShared = (v) => shared.includes(v)
  const isOther = (v) => v !== row.a && v !== row.b && !isShared(v) && (adj[row.a].has(v) || adj[row.b].has(v))
  const name = (r) => `${G.names[r.a]}–${G.names[r.b]}`

  return (
    <div>
      <svg viewBox="0 0 340 170" className="w-full h-auto max-h-[230px]" role="img" aria-label={t.aria(name(row))}>
        {table.map((r, e) => {
          const on = e === sel
          return (
            <line
              key={e}
              x1={X(r.a)}
              y1={Y(r.a)}
              x2={X(r.b)}
              y2={Y(r.b)}
              stroke={on ? ORANGE_DARK : SLATE}
              strokeOpacity={on ? 1 : 0.7}
              strokeWidth={on ? 3 : 1.4}
              strokeDasharray={r.localBridge ? '5 4' : undefined}
            />
          )
        })}
        {G.names.map((label, v) => {
          const end = v === row.a || v === row.b
          const hot = isShared(v)
          return (
            <g key={label}>
              <circle
                cx={X(v)}
                cy={Y(v)}
                r={R}
                fill={hot ? ORANGE_DARK : end ? INK : '#fff'}
                stroke={hot ? ORANGE_DARK : isOther(v) ? SKY : INK}
                strokeWidth={isOther(v) ? 2.4 : 1.4}
              />
              <text x={X(v)} y={Y(v) + 3.6} textAnchor="middle" fontSize="10.5" fontFamily={MONO} fontWeight="700" fill={hot || end ? '#fff' : INK}>
                {label}
              </text>
            </g>
          )
        })}
        {/* Wide invisible targets, so a link is easy to hit with a finger. */}
        {table.map((r, e) => (
          <line
            key={`hit${e}`}
            data-link={`${G.names[r.a]}-${G.names[r.b]}`}
            x1={X(r.a)}
            y1={Y(r.a)}
            x2={X(r.b)}
            y2={Y(r.b)}
            stroke="#000"
            strokeOpacity="0"
            strokeWidth="16"
            strokeLinecap="round"
            role="button"
            tabIndex={0}
            aria-label={t.linkAria(name(r))}
            aria-pressed={e === sel}
            style={{ cursor: 'pointer' }}
            onClick={() => setSel(e)}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault()
                setSel(e)
              }
            }}
          />
        ))}
      </svg>
      <p className="mt-1 text-sm text-slate-700 leading-snug" aria-live="polite" data-readout="overlap">
        <span className="font-semibold text-orange-700">
          {t.link} {name(row)}
        </span>
        : {t.shared(shared.map((v) => G.names[v]))}.{' '}
        <span className="font-mono text-[13px] text-slate-900">
          {t.overlap} = {row.common}/{row.others} = {fmt(row.value, 2)}
        </span>{' '}
        <span className="text-slate-500">({t.of(row.common, row.others)})</span>
        {row.localBridge && <span className="block text-slate-900">{row.bridge ? t.bridge : t.localBridge}</span>}
      </p>
      <p className="mt-1 text-xs text-slate-500 leading-snug">
        {t.hint} {t.legend}
      </p>
    </div>
  )
}
