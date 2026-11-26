import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill } from '../../network/ui.jsx'
import { runRace } from './race.js'
import { relativeRevenue, per100 } from './selfish.js'
import { num, int } from '../auctions/fmt.js'

// Panel A, "Race the network": Eyal and Sirer's strategy simulated block by
// block (race.js). Her share of the chain with its standard error against R,
// the orphaned blocks per 100 mined against the exact values, the chain blocks
// per 100 mined, the longest private lead, and the last 40 events.

export const COUNTS = [10000, 100000, 1000000]
const CODE = { hide: 'h', extend: '+', chain: '·', race: 'r', win: 'W', split: 'S', lose: 'L', publish2: '2', publish1: '1' }

const T = {
  en: {
    alpha: 'α, her share of the hash rate',
    gamma: 'γ, the others who build on her block in a race',
    blocks: 'Blocks mined:',
    again: 'Run again',
    run: (s) => `Run no. ${s} (seed ${s})`,
    head: ['', 'simulated', 'exact'],
    rows: { share: 'her share of the chain', oA: 'her orphaned blocks per 100 mined', oH: 'the others’ orphaned blocks per 100 mined', chain: 'chain blocks per 100 mined' },
    lead: 'longest private lead',
    pending: 'undecided at the end (her private blocks, a race)',
    strip: 'The last 40 blocks mined (orange: hers; grey: the others’), with what happened:',
    codes: {
      hide: 'h she keeps a new block secret (lead 0 → 1)',
      extend: '+ she adds to her secret lead',
      chain: '· their block joins the chain',
      race: 'r they catch up from lead 1: she publishes, a race',
      win: 'W she wins the race with her next block',
      split: 'S they build on her block: one each',
      lose: 'L they build on their own: her block is orphaned',
      publish2: '2 at lead 2 she publishes both: theirs is orphaned',
      publish1: '1 at lead 3 or more she publishes one',
    },
    aria: 'The last 40 blocks mined',
  },
  it: {
    alpha: 'α, la sua quota dell’hash rate',
    gamma: 'γ, gli altri che costruiscono sul suo blocco in una gara',
    blocks: 'Blocchi trovati:',
    again: 'Nuova prova',
    run: (s) => `Prova n. ${s} (seme ${s})`,
    head: ['', 'simulato', 'esatto'],
    rows: { share: 'la sua quota della catena', oA: 'suoi blocchi orfani ogni 100 trovati', oH: 'blocchi orfani degli altri ogni 100 trovati', chain: 'blocchi della catena ogni 100 trovati' },
    lead: 'vantaggio massimo della catena privata',
    pending: 'non decisi alla fine (i suoi blocchi privati, una gara)',
    strip: 'Gli ultimi 40 blocchi trovati (arancione: i suoi; grigio: degli altri), con ciò che è accaduto:',
    codes: {
      hide: 'h tiene segreto un nuovo blocco (vantaggio 0 → 1)',
      extend: '+ aumenta il suo vantaggio segreto',
      chain: '· il loro blocco entra nella catena',
      race: 'r la raggiungono dal vantaggio 1: pubblica, una gara',
      win: 'W vince la gara con il blocco successivo',
      split: 'S costruiscono sul suo blocco: uno ciascuno',
      lose: 'L costruiscono sul proprio: il suo blocco è orfano',
      publish2: '2 con vantaggio 2 li pubblica entrambi: il loro è orfano',
      publish1: '1 con vantaggio 3 o più ne pubblica uno',
    },
    aria: 'Gli ultimi 40 blocchi trovati',
  },
}

export default function RacePanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [a, setA] = useState(0.4)
  const [g, setG] = useState(0)
  const [blocks, setBlocks] = useState(100000)
  const [seed, setSeed] = useState(1)
  const sim = useMemo(() => runRace({ alpha: a, gamma: g, blocks, seed }), [a, g, blocks, seed])
  const ex = per100(a, g)
  const R = relativeRevenue(a, g)
  const d = (x, k = 2) => num(x, lang, k)
  const rows = [
    ['share', `${d(sim.share, 4)} ± ${d(sim.shareSe, 4)}`, d(R, 4)],
    ['oA', `${d(sim.oA)} ± ${d(sim.oASe)}`, d(ex.oA)],
    ['oH', `${d(sim.oH)} ± ${d(sim.oHSe)}`, d(ex.oH)],
    ['chain', d(sim.chain), d(ex.chain)],
  ]
  return (
    <div>
      <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2 max-w-3xl">
        <Slider label={L.alpha} min={0} max={0.49} step={0.01} value={a} onChange={(x) => setA(Math.round(x * 100) / 100)} format={(x) => d(x)} />
        <Slider label={L.gamma} min={0} max={1} step={0.05} value={g} onChange={(x) => setG(Math.round(x * 100) / 100)} format={(x) => d(x)} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500" data-role="ra-counts">
        <span>{L.blocks}</span>
        {COUNTS.map((c) => (
          <Pill key={c} active={blocks === c} onClick={() => setBlocks(c)} data-count={c}>{int(c, lang)}</Pill>
        ))}
        <Pill primary onClick={() => setSeed(seed + 1)} data-role="ra-again">{L.again}</Pill>
        <span className="font-mono" data-role="ra-seed">{L.run(seed)}</span>
      </div>
      <table className="mt-3 w-full max-w-xl text-xs sm:text-sm tabular-nums" data-role="ra-table">
        <thead>
          <tr className="text-left text-slate-500">
            {L.head.map((h, i) => <th key={i} className={`font-normal pb-1 ${i ? 'text-right pl-2' : ''}`}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(([k, s, e]) => (
            <tr key={k} className="border-t border-slate-100" data-row={k}>
              <td className="py-0.5 text-slate-700">{L.rows[k]}</td>
              <td className="py-0.5 pl-2 text-right font-mono whitespace-nowrap" data-value="sim">{s}</td>
              <td className="py-0.5 pl-2 text-right font-mono" data-value="exact">{e}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-2 grid gap-1 text-sm max-w-xl">
        <div className="flex justify-between gap-3"><dt className="text-slate-600">{L.lead}</dt><dd className="font-mono" data-value="lead">{sim.maxLead}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-slate-600 text-xs">{L.pending}</dt><dd className="font-mono text-xs" data-value="pending">{sim.pending}</dd></div>
      </dl>
      <p className="mt-3 text-xs text-slate-600">{L.strip}</p>
      <div className="mt-1 grid grid-cols-[repeat(20,minmax(0,1fr))] gap-0.5 max-w-xl" role="img" aria-label={L.aria} data-role="ra-strip">
        {sim.strip.map((e, i) => (
          <span
            key={i}
            title={L.codes[e.what]}
            data-who={e.who}
            data-what={e.what}
            className={`flex items-center justify-center h-5 rounded-sm font-mono text-[10px] font-semibold ${e.who === 'A' ? 'bg-orange-200 text-orange-900' : 'bg-slate-200 text-slate-700'}`}
          >
            {CODE[e.what]}
          </span>
        ))}
      </div>
      <ul className="mt-2 grid gap-x-4 sm:grid-cols-2 text-[11px] text-slate-500 leading-snug max-w-3xl">
        {Object.keys(CODE).map((k) => <li key={k} className="font-mono">{L.codes[k]}</li>)}
      </ul>
    </div>
  )
}
