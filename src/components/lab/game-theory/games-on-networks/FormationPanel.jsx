import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, INK, MUTED, MONO, ORANGE_DARK } from '../../network/ui.jsx'
import { startRun, step, toTheEnd, summary, linked, degrees, totals, efficientKind, MAX_STEPS } from './connections.js'
import { num } from './fmt.js'

// Panel C, "Building the network": pairs add and cut links one at a time
// (Jackson and Watts). A step picks a pair at random; a linked pair is cut
// if either end gains strictly by cutting, an unlinked pair is linked if
// neither loses and one gains strictly. The run ends when no pair wants to
// change, or after 20,000 steps. Run n draws its random start (if any) and
// its pairs from seed n; any change of setting goes back to the start of the
// same run.

const SKY = '#0369a1'
const W = 300
const H = 230

const T = {
  en: {
    n: 'n, the players',
    delta: 'δ, the value of a player at distance 1',
    c: 'c, the cost of a link to each end',
    start: 'Start',
    starts: { empty: 'empty', complete: 'complete', random: 'random (p = 0.3)' },
    one: 'One step',
    end: 'To the end',
    again: 'New run',
    run: (k) => `Run no. ${k} (seed ${k}).`,
    steps: (s, ch, a, cut) => `${s} steps, ${ch} changes (${a} links added, ${cut} cut).`,
    last: (i, j, w) => `Last step: the pair ${i}–${j} ${w === 'add' ? 'added its link' : w === 'cut' ? 'cut its link' : 'did not change'}.`,
    stable: 'Ended: no pair wants to change. The network is pairwise stable.',
    capped: `Stopped after ${MAX_STEPS.toLocaleString('en-US')} steps: the network is not yet pairwise stable.`,
    total: 'Total utility',
    efficient: (k) => `Efficient network (${k})`,
    kinds: { complete: 'complete', star: 'star', empty: 'empty' },
    links: 'Links',
    degrees: 'Degree sequence',
    stableQ: 'Pairwise stable',
    yes: 'yes',
    notYet: 'not yet',
    aria: 'The players on a circle and their links',
  },
  it: {
    n: 'n, i giocatori',
    delta: 'δ, il valore di un giocatore a distanza 1',
    c: 'c, il costo di un collegamento per ciascun estremo',
    start: 'Partenza',
    starts: { empty: 'vuota', complete: 'completa', random: 'casuale (p = 0,3)' },
    one: 'Un passo',
    end: 'Fino alla fine',
    again: 'Nuova prova',
    run: (k) => `Prova n. ${k} (seme ${k}).`,
    steps: (s, ch, a, cut) => `${s} passi, ${ch} cambi (${a} collegamenti aggiunti, ${cut} tagliati).`,
    last: (i, j, w) => `Ultimo passo: la coppia ${i}–${j} ${w === 'add' ? 'ha aggiunto il collegamento' : w === 'cut' ? 'ha tagliato il collegamento' : 'non è cambiata'}.`,
    stable: 'Finito: nessuna coppia vuole cambiare. La rete è stabile a coppie.',
    capped: `Fermato dopo ${MAX_STEPS.toLocaleString('it-IT')} passi: la rete non è ancora stabile a coppie.`,
    total: 'Utilità totale',
    efficient: (k) => `Rete efficiente (${k})`,
    kinds: { complete: 'completa', star: 'stella', empty: 'vuota' },
    links: 'Collegamenti',
    degrees: 'Sequenza dei gradi',
    stableQ: 'Stabile a coppie',
    yes: 'sì',
    notYet: 'non ancora',
    aria: 'I giocatori su un cerchio e i loro collegamenti',
  },
}

const circle = (n) => Array.from({ length: n }, (_, k) => [W / 2 + 92 * Math.sin((2 * Math.PI * k) / n), H / 2 - 92 * Math.cos((2 * Math.PI * k) / n)])

export default function FormationPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const n2 = (v) => num(v, lang, 2)
  const [n, setN_] = useState(8)
  const [delta, setDelta_] = useState(0.5)
  const [c, setC_] = useState(0.4)
  const [start, setStart_] = useState('empty')
  const [seed, setSeed_] = useState(1)
  const [state, setState] = useState(null)
  // Every change of setting goes back to the start of the run.
  const reset = (set) => (v) => {
    set(v)
    setState(null)
  }
  const setN = reset(setN_)
  const setDelta = reset(setDelta_)
  const setC = reset(setC_)
  const setStart = reset(setStart_)
  const setSeed = reset(setSeed_)
  const key = `${n}|${delta}|${c}|${start}|${seed}`
  // Built again at every render while nothing has been stepped: the steps
  // advance the run's generator in place, so a reset must start from the seed.
  const fresh = state && state.key === key ? null : { key, run: startRun(n, start, seed) }
  const cur = fresh || state
  const run = cur.run
  const done = run.stable || run.capped
  const s = summary(run, delta, c)
  const eff = efficientKind(n, delta, c)
  const effTotal = totals(n, delta, c)[eff]
  const layout = circle(n)
  const deg = degrees(run.nb)

  const doOne = () => setState({ key, run: step(run, delta, c) })
  const doEnd = () => setState({ key, run: toTheEnd(run, delta, c) })
  const again = () => setSeed(seed + 1)

  const lines = []
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (linked(run.nb, i, j)) {
        const isLast = run.last && run.last.w && run.last.i === i && run.last.j === j
        lines.push(<line key={`${i}-${j}`} x1={layout[i][0]} y1={layout[i][1]} x2={layout[j][0]} y2={layout[j][1]} stroke={isLast ? ORANGE_DARK : MUTED} strokeWidth={isLast ? 2.4 : 1.2} />)
      }
  const lastCut = run.last && run.last.w === 'cut' ? run.last : null

  return (
    <div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-3 max-w-3xl">
        <Slider label={L.n} min={4} max={12} step={1} value={n} onChange={setN} />
        <Slider label={L.delta} min={0.05} max={0.95} step={0.05} value={delta} onChange={(v) => setDelta(Math.round(v * 100) / 100)} format={(v) => num(v, lang, 2)} />
        <Slider label={L.c} min={0.05} max={2} step={0.05} value={c} onChange={(v) => setC(Math.round(v * 100) / 100)} format={(v) => num(v, lang, 2)} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700" data-role="nf-starts">
        <span>{L.start}</span>
        {['empty', 'complete', 'random'].map((k) => (
          <Pill key={k} active={start === k} onClick={() => setStart(k)} data-start={k}>{L.starts[k]}</Pill>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Pill primary onClick={doOne} disabled={done} data-role="nf-one">{L.one}</Pill>
        <Pill primary onClick={doEnd} disabled={done} data-role="nf-end">{L.end}</Pill>
        <Pill onClick={again} data-role="nf-again">{L.again}</Pill>
      </div>
      <p className="mt-2 text-xs text-slate-600" data-role="nf-status">
        {L.run(seed)} {L.steps(run.steps, run.changes, run.adds, run.cuts)} {run.last ? L.last(run.last.i + 1, run.last.j + 1, run.last.w) : ''}{' '}
        {run.stable ? L.stable : run.capped ? L.capped : ''}
      </p>

      <div className="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] items-start max-w-3xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-w-[18rem]" role="img" aria-label={L.aria} data-role="nf-net" data-links={s.links}>
          {lastCut && (
            <line x1={layout[lastCut.i][0]} y1={layout[lastCut.i][1]} x2={layout[lastCut.j][0]} y2={layout[lastCut.j][1]} stroke={SKY} strokeWidth="1.6" strokeDasharray="4 3" />
          )}
          {lines}
          {layout.map(([x, y], i) => (
            <g key={i} data-player={i + 1} data-degree={deg[i]}>
              <circle cx={x} cy={y} r={9 + 0.9 * deg[i]} fill={deg[i] ? '#fed7aa' : 'white'} stroke={INK} strokeWidth="1.5" />
              <text x={x} y={y + 3.5} fontSize="10" fontFamily={MONO} fill={INK} textAnchor="middle">{i + 1}</text>
            </g>
          ))}
        </svg>
        <dl className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-1.5 text-sm min-w-0" data-role="nf-readout">
          {[
            [L.total, n2(s.total), 'total'],
            [L.efficient(L.kinds[eff]), n2(effTotal), 'efficient'],
            [L.links, String(s.links), 'links'],
            [L.degrees, s.degrees.join(lang === 'it' ? '; ' : ', '), 'degrees'],
            [L.stableQ, done ? (run.stable ? L.yes : L.notYet) : L.notYet, 'stable'],
          ].map(([label, v, k]) => (
            <div key={k} className="min-w-0">
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="font-mono tabular-nums text-slate-900 break-words" data-value={k}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
