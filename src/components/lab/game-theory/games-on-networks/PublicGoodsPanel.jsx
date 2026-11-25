import { useMemo, useState } from 'react'
import { Pill, ORANGE_DARK } from '../../network/ui.jsx'
import NetDraw from './NetDraw.jsx'
import { NETWORKS } from './netgames.js'
import { specializedEquilibria, bestResponseRun, classify, effortsOf, setKey } from './publicgoods.js'
import { num } from './fmt.js'

// Panel A, "Who does the work?": local public goods, x_i = max(0, 1 − Σ_j
// g_ij x_j). "Best responses" n starts from efforts uniform on [0, 1] drawn
// with seed n and lets players 1 to n reply in turn until no effort moves by
// more than 1e-12. "Specialized equilibria" lists every maximal independent
// set with its total and a mark if it is stable; clicking one shows it.
// Changing the network goes back to run no. 1 and hides the list.

const KEYS = ['line5', 'star6', 'ring6', 'grid3']

const T = {
  en: {
    nets: { line5: 'Line of 5', star6: 'Star of 6', ring6: 'Ring of 6', grid3: '3 × 3 grid' },
    br: 'Best responses',
    list: 'Specialized equilibria',
    hide: 'Hide the list',
    nothing: 'Press a button: “Best responses” for a run from a random start, or “Specialized equilibria” for the list.',
    run: (k, turns) => `Run no. ${k}: from a random start (seed ${k}), ${turns} turns of best responses.`,
    shown: (s) => `Shown: the specialized profile ${s}.`,
    start: 'Start',
    end: 'End',
    efforts: 'Efforts of players 1, 2, …',
    total: 'Total effort',
    specialized: 'Specialized (everyone 0 or 1)?',
    equilibrium: 'An equilibrium (within 1e-9)?',
    stable: 'Stable?',
    yes: 'yes',
    no: 'no',
    stableMark: 'stable',
    listHead: (k) => `${k} maximal independent sets: the workers, and the total effort`,
    note: 'Workers in orange (effort 1); size and colour show each effort. Stable: every player who does not work has at least two working neighbours.',
    aria: 'The network, each player coloured and sized by its effort',
  },
  it: {
    nets: { line5: 'Linea di 5', star6: 'Stella di 6', ring6: 'Anello di 6', grid3: 'Griglia 3 × 3' },
    br: 'Migliori risposte',
    list: 'Equilibri specializzati',
    hide: 'Nascondi l’elenco',
    nothing: 'Premi un tasto: “Migliori risposte” per una prova da una partenza casuale, o “Equilibri specializzati” per l’elenco.',
    run: (k, turns) => `Prova n. ${k}: da una partenza casuale (seme ${k}), ${turns} giri di migliori risposte.`,
    shown: (s) => `Mostrato: il profilo specializzato ${s}.`,
    start: 'Partenza',
    end: 'Fine',
    efforts: 'Sforzi dei giocatori 1, 2, …',
    total: 'Sforzo totale',
    specialized: 'Specializzato (tutti 0 o 1)?',
    equilibrium: 'Un equilibrio (entro 1e-9)?',
    stable: 'Stabile?',
    yes: 'sì',
    no: 'no',
    stableMark: 'stabile',
    listHead: (k) => `${k} insiemi indipendenti massimali: chi lavora, e lo sforzo totale`,
    note: 'Chi lavora in arancione (sforzo 1); dimensione e colore mostrano ogni sforzo. Stabile: ogni giocatore che non lavora ha almeno due vicini che lavorano.',
    aria: 'La rete, ogni giocatore colorato e dimensionato secondo il suo sforzo',
  },
}

// Effort 0 white, 1 orange, in between a lighter orange.
const shade = (x) => (x <= 1e-9 ? 'white' : x >= 1 - 1e-9 ? ORANGE_DARK : `rgba(234, 88, 12, ${0.15 + 0.6 * x})`)

export default function PublicGoodsPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const n4 = (v) => num(v, lang, 4)
  const [key, setKey_] = useState('line5')
  const [runs, setRuns] = useState(0)
  const [view, setView] = useState(null) // { kind: 'run', run } | { kind: 'set', set }
  const [showList, setShowList] = useState(false)
  const net = NETWORKS[key]
  const g = useMemo(() => net.make(), [net])
  const list = useMemo(() => specializedEquilibria(g), [g])
  const x = view ? (view.kind === 'run' ? view.run.x : effortsOf(g, view.set)) : null
  const cls = x ? classify(g, x) : null

  const choose = (k) => {
    setKey_(k)
    setRuns(0)
    setView(null)
    setShowList(false)
  }
  const doRun = () => {
    const k = runs + 1
    setRuns(k)
    setView({ kind: 'run', k, run: bestResponseRun(g, k) })
  }
  const yn = (b) => (b ? L.yes : L.no)
  const sep = lang === 'it' ? '; ' : ', '

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" data-role="pg-nets">
        {KEYS.map((k) => (
          <Pill key={k} active={key === k} onClick={() => choose(k)} data-net={k}>{L.nets[k]}</Pill>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Pill primary onClick={doRun} data-role="pg-run">{L.br}</Pill>
        <Pill onClick={() => setShowList(!showList)} data-role="pg-list-toggle">{showList ? L.hide : L.list}</Pill>
      </div>
      <p className="mt-2 text-xs text-slate-600" data-role="pg-status">
        {!view ? L.nothing : view.kind === 'run' ? L.run(view.k, view.run.turns) : L.shown(setKey(view.set))}
      </p>

      <div className="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl">
        <div className="min-w-0">
          <NetDraw
            layout={net.layout}
            edges={g.edges}
            radius={(i) => (x ? 8 + 6 * x[i] : 9)}
            fill={(i) => (x ? shade(x[i]) : 'white')}
            text={(i) => (x && x[i] >= 1 - 1e-9 ? 'white' : undefined)}
            aria={L.aria}
            role="pg-net"
            nodeData={(i) => ({ 'data-effort': x ? x[i].toFixed(4) : '' })}
          />
          <p className="text-xs text-slate-500 leading-snug">{L.note}</p>
        </div>
        <div className="min-w-0">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm" data-role="pg-readout">
            {[
              [L.total, cls ? n4(cls.total) : '–', 'total'],
              [L.specialized, cls ? yn(cls.specialized) : '–', 'specialized'],
              [L.equilibrium, cls ? yn(cls.equilibrium) : '–', 'equilibrium'],
              [L.stable, cls ? yn(cls.stable) : '–', 'stable'],
            ].map(([label, v, k]) => (
              <div key={k} className="min-w-0">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="font-mono tabular-nums text-slate-900" data-value={k}>{v}</dd>
              </div>
            ))}
            {view?.kind === 'run' && (
              <div className="col-span-2 min-w-0">
                <dt className="text-xs text-slate-500">{L.start}</dt>
                <dd className="font-mono tabular-nums text-slate-900 text-xs break-words" data-value="start">{view.run.x0.map((v) => num(v, lang, 2)).join(sep)}</dd>
              </div>
            )}
            <div className="col-span-2 min-w-0">
              <dt className="text-xs text-slate-500">{L.efforts}</dt>
              <dd className="font-mono tabular-nums text-slate-900 text-xs break-words" data-value="efforts">{x ? x.map((v) => num(v, lang, 4)).join(sep) : '–'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {showList && (
        <div className="mt-3 max-w-3xl" data-role="pg-list">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-mono">{L.listHead(list.length)}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {list.map((e) => {
              const k = setKey(e.set)
              const on = view?.kind === 'set' && setKey(view.set) === k
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setView({ kind: 'set', set: e.set })}
                  aria-pressed={on}
                  className={`px-2 py-1 rounded border text-xs font-mono tabular-nums ${on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-orange-300'}`}
                  data-set={k}
                  data-stable={e.stable ? 'yes' : 'no'}
                >
                  {k} · {e.total}
                  {e.stable && <span className={on ? 'text-orange-300' : 'text-orange-600'}> · {L.stableMark}</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
