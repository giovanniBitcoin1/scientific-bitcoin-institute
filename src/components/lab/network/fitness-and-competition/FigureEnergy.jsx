import { useMemo, useState } from 'react'
import { ORANGE_DARK, INK, SLATE, MUTED, GRID, MONO, Pill } from '../ui.jsx'
import { energyNetwork, energyState, ENERGY_START, ENERGY_MAX, ENERGY_BOOSTED } from './figures.js'

// Live figure F2, "Fitness as energy": every node is an energy level
// ε = −ln η (the fitter, the lower), every link a particle on the level of
// the node it points to. "Add a node" grows the network one step; the switch
// gives the fourth node fitness 1 and halves every other fitness.

const T = {
  en: {
    add: 'Add a node',
    reset: 'Reset',
    boost: 'One node far fitter',
    state: (n, p) => `${n} nodes, ${p} particles (links).`,
    lowest: (k, pct) => `The lowest level holds ${k} of them (${pct}).`,
    levels: 'Levels by energy, lowest (fittest) at the top',
    node: (v) => `node ${v}`,
    aria: 'Energy levels of the nodes, sorted by energy, with one dot per link pointing to each node',
    locale: 'en-US',
  },
  it: {
    add: 'Aggiungi un nodo',
    reset: 'Ricomincia',
    boost: 'Un nodo molto più adatto',
    state: (n, p) => `${n} nodi, ${p} particelle (collegamenti).`,
    lowest: (k, pct) => `Il livello più basso ne ospita ${k} (${pct}).`,
    levels: 'Livelli per energia, il più basso (il più adatto) in alto',
    node: (v) => `nodo ${v}`,
    aria: 'Livelli di energia dei nodi, ordinati per energia, con un punto per ogni collegamento che punta a ciascun nodo',
    locale: 'it-IT',
  },
}

const W = 320
const LABEL = 92
const ROW = 9
const DOT = 6.2

export default function FigureEnergy({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [boosted, setBoosted] = useState(false)
  const [size, setSize] = useState(ENERGY_START)
  const net = useMemo(() => energyNetwork(boosted), [boosted])
  const { levels, links } = useMemo(() => energyState(net, size), [net, size])
  const num = (v, d) => v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d })
  const top = levels[0]
  const pct = `${num((100 * top.particles) / links, 0)}%`
  const H = 14 + ROW * ENERGY_MAX

  return (
    <div className="grid gap-4 sm:grid-cols-2 items-start">
      <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <Pill primary onClick={() => setSize((s) => Math.min(ENERGY_MAX, s + 1))} disabled={size >= ENERGY_MAX} data-action="add">
          {t.add}
        </Pill>
        <Pill onClick={() => setSize(ENERGY_START)} data-action="reset">
          {t.reset}
        </Pill>
        <Pill
          active={boosted}
          onClick={() => {
            setBoosted((b) => !b)
            setSize(ENERGY_START)
          }}
          data-action="boost"
        >
          {t.boost}
        </Pill>
      </div>
      <p className="mt-2 font-mono text-sm text-slate-900 leading-snug" data-readout="energy" data-size={size} data-top={top.v} data-top-particles={top.particles}>
        {t.state(size, links)} {t.lowest(top.particles, pct)}
      </p>
      </div>
      <div className="min-w-0 mx-auto w-full max-w-[340px]">
      <p className="text-xs text-slate-500 font-mono">{t.levels}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={t.aria}>
        {levels.map((l, row) => {
          const y = 10 + row * ROW
          const boostedLevel = boosted && l.v === ENERGY_BOOSTED
          const color = boostedLevel ? ORANGE_DARK : row === 0 ? INK : SLATE
          return (
            <g key={l.v}>
              <text x={2} y={y + 3} fontSize="7.5" fontFamily={MONO} fill={boostedLevel ? ORANGE_DARK : SLATE}>
                {`ε ${num(Math.min(l.eps, 9.99), 2)}`}
              </text>
              <text x={LABEL - 6} y={y + 3} fontSize="7" fontFamily={MONO} fill={MUTED} textAnchor="end">
                {t.node(l.v + 1)}
              </text>
              <line x1={LABEL} x2={W - 2} y1={y} y2={y} stroke={row === 0 || boostedLevel ? color : GRID} strokeWidth={row === 0 || boostedLevel ? 1.2 : 1} />
              {Array.from({ length: l.particles }, (_, j) => (
                <circle key={j} cx={LABEL + 4 + j * DOT} cy={y - 0.2} r={2.5} fill={boostedLevel ? ORANGE_DARK : INK} />
              ))}
            </g>
          )
        })}
      </svg>
      </div>
    </div>
  )
}
