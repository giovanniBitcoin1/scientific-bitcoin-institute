import { useMemo, useState } from 'react'
import { ORANGE_DARK, INK, MONO, SLATE, GRID, Pill } from '../ui.jsx'
import { modularityTerms } from './community.js'
import { F1_NET, F1_START, F1_POS, bestSplit } from './figures.js'
import { GROUP_COLORS } from './palette.js'

// Live figure F1, "Score a split": 16 nodes in two dense groups joined by
// three links. Tapping a node moves it to the other group; Q is shown with its
// two terms, links inside and links expected inside, as bars. Plain SVG; the
// nodes listen to clicks and keys only, so a swipe over the figure scrolls.

const T = {
  en: {
    inside: 'Share of links inside the groups',
    expected: 'Share expected inside, same degrees at random',
    q: 'Q = inside − expected',
    best: 'Show the best split',
    reset: 'Start again',
    note: 'Tap a node to move it to the other group. The best split is found by trying all 32,768 ways of cutting the 16 nodes in two.',
    aria: 'Sixteen nodes in two coloured groups; tap a node to move it to the other group',
    node: (v, g) => `Node ${v + 1}, group ${g + 1}: move it to the other group`,
    locale: 'en-US',
  },
  it: {
    inside: 'Quota di collegamenti dentro i gruppi',
    expected: 'Quota attesa dentro, stessi gradi a caso',
    q: 'Q = dentro − atteso',
    best: 'Mostra la divisione migliore',
    reset: 'Ricomincia',
    note: 'Tocca un nodo per spostarlo nell\'altro gruppo. La divisione migliore si trova provando tutti i 32.768 modi di tagliare i 16 nodi in due.',
    aria: 'Sedici nodi in due gruppi colorati; tocca un nodo per spostarlo nell\'altro gruppo',
    node: (v, g) => `Nodo ${v + 1}, gruppo ${g + 1}: spostalo nell'altro gruppo`,
    locale: 'it-IT',
  },
}

const W = 320
const H = 200
const PAD = 14

function Bar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{label}</span>
      </div>
      <svg viewBox="0 0 200 12" className="w-full h-3 mt-0.5" aria-hidden="true">
        <rect x="0" y="0" width="200" height="12" fill={GRID} rx="2" />
        <rect x="0" y="0" width={Math.max(0, Math.min(1, value)) * 200} height="12" fill={color} rx="2" />
      </svg>
    </div>
  )
}

export default function FigureSplit({ lang = 'en' }) {
  const t = T[lang] || T.en
  const g = F1_NET
  const [part, setPart] = useState(() => Int32Array.from(F1_START))
  const best = useMemo(() => bestSplit(g), [g])
  const terms = modularityTerms(g, part)
  const Q = terms.inside - terms.expected
  const num = (v) => v.toLocaleString(t.locale, { minimumFractionDigits: 3, maximumFractionDigits: 3 })
  const x = (v) => PAD + F1_POS[2 * v] * (W - 2 * PAD)
  const y = (v) => PAD + F1_POS[2 * v + 1] * (H - 2 * PAD)
  const flip = (v) =>
    setPart((p) => {
      const q = Int32Array.from(p)
      q[v] = 1 - q[v]
      return q
    })
  const isBest = Math.abs(Q - best.Q) < 1e-12

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-[3fr_2fr] items-start">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto bg-white border border-slate-200 rounded" role="group" aria-label={t.aria}>
          {Array.from(g.A, (a, e) => {
            const b = g.B[e]
            const same = part[a] === part[b]
            return <line key={e} x1={x(a)} y1={y(a)} x2={x(b)} y2={y(b)} stroke={same ? 'rgba(100, 116, 139, 0.6)' : ORANGE_DARK} strokeWidth={same ? 1 : 1.6} strokeDasharray={same ? undefined : '3 2'} />
          })}
          {Array.from({ length: g.n }, (_, v) => (
            <g
              key={v}
              role="button"
              tabIndex={0}
              aria-label={t.node(v, part[v])}
              data-node={v}
              onClick={() => flip(v)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  ev.preventDefault()
                  flip(v)
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={x(v)} cy={y(v)} r={14} fill="transparent" />
              <circle cx={x(v)} cy={y(v)} r={8} fill={GROUP_COLORS[part[v]]} stroke="#ffffff" strokeWidth="1.5" />
              <text x={x(v)} y={y(v) + 3} textAnchor="middle" fontSize="8" fontFamily={MONO} fill="#ffffff" pointerEvents="none">
                {v + 1}
              </text>
            </g>
          ))}
        </svg>
        <div className="space-y-3 min-w-0" data-readout="split" data-q={Q.toFixed(4)} data-inside={terms.inside.toFixed(4)} data-expected={terms.expected.toFixed(4)} data-best={isBest ? '1' : '0'}>
          <Bar label={`${t.inside}: ${num(terms.inside)}`} value={terms.inside} color={INK} />
          <Bar label={`${t.expected}: ${num(terms.expected)}`} value={terms.expected} color={SLATE} />
          <p className="font-mono text-sm text-slate-900 tabular-nums">
            {t.q} = <span style={{ color: ORANGE_DARK }}>{num(Q)}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Pill primary onClick={() => setPart(Int32Array.from(best.partition, (v) => (best.partition[0] === part[0] ? v : 1 - v)))} data-action="best">
              {t.best}
            </Pill>
            <Pill onClick={() => setPart(Int32Array.from(F1_START))} data-action="reset">
              {t.reset}
            </Pill>
          </div>
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-500 leading-snug">{t.note}</p>
    </div>
  )
}
