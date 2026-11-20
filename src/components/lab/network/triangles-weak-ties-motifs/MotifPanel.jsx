import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, SLATE, MUTED, GRID, MONO, Eyebrow, Pill, fmt } from '../ui.jsx'
import NetCanvas from '../NetCanvas.jsx'
import { PatternGlyph } from './PatternIcon.jsx'
import PatternIcon from './PatternIcon.jsx'
import { PATTERN_TEXT } from './names.js'
import {
  PATTERN_IDS, MOTIF_NETWORKS, MOTIF_NETWORK_IDS, NETWORK_SEED, NULL_DEFAULT, NULL_MAX, SWAPS_PER_LINK, REG, WEB_LEVELS, RANDOM_DIRECTED,
  motifJob, mutualLinks,
} from './motifs.js'

// Panel C, "Motif counter": a directed network, the count of each of the
// thirteen patterns in it, and the same counts in randomised networks in
// which every node keeps its incoming, outgoing and mutual links.

const SKY = '#0284c7'

const T = {
  en: {
    network: 'Network',
    nets: { regulation: 'Regulation-like', foodWeb: 'Layered like a food web', random: 'Random' },
    how: {
      regulation: `${REG.masters} master regulators (top row), ${REG.regulators} regulators and ${REG.targets} targets. ${REG.loops} times a master X, a regulator Y and a target Z are drawn and linked X → Y, Y → Z, X → Z; then ${REG.extra} more links to targets. Links point downwards.`,
      foodWeb: `Four levels of ${WEB_LEVELS.join(', ')} species, the first at the bottom. Every species above the first level feeds on two to five species of the level just below. A link points from the eaten to the eater: upwards.`,
      random: `${RANDOM_DIRECTED.n} nodes and ${RANDOM_DIRECTED.links} links, each from a random node to another. Directions are not drawn.`,
    },
    again: 'New network',
    samples: 'Randomised networks',
    size: (n, L, m, k) => `Network ${k}: ${n} nodes, ${L} links, ${m} mutual`,
    bars: 'z-score of each pattern',
    barsNote: 'z = (count − mean of the randomised networks) / their standard deviation. The dashed lines are at z = ±3. A dash means that the pattern never occurs, here or in the randomised networks.',
    table: 'Counts',
    cols: { pattern: 'Pattern', observed: 'Count', mean: 'Null mean', sd: 'Std. dev.', z: 'z' },
    nullNote: (s, swaps) => `${s} randomised networks, ${swaps} attempted swaps per link between one and the next. Every node keeps its incoming, outgoing and mutual links.`,
    computing: 'Computing…',
    ariaNet: (name) => `Drawing of the network: ${name}`,
    ariaBars: 'z-score of each of the thirteen patterns',
  },
  it: {
    network: 'Rete',
    nets: { regulation: 'Simile a una rete di regolazione', foodWeb: 'A livelli, come una rete alimentare', random: 'Casuale' },
    how: {
      regulation: `${REG.masters} regolatori principali (riga in alto), ${REG.regulators} regolatori e ${REG.targets} bersagli. Per ${REG.loops} volte si estraggono un regolatore principale X, un regolatore Y e un bersaglio Z e si collegano X → Y, Y → Z, X → Z; poi altri ${REG.extra} collegamenti verso i bersagli. I collegamenti puntano verso il basso.`,
      foodWeb: `Quattro livelli di ${WEB_LEVELS.join(', ')} specie, il primo in basso. Ogni specie sopra il primo livello si nutre di due-cinque specie del livello subito sotto. Un collegamento va da chi è mangiato a chi mangia: verso l'alto.`,
      random: `${RANDOM_DIRECTED.n} nodi e ${RANDOM_DIRECTED.links} collegamenti, ciascuno da un nodo a caso a un altro. I versi non sono disegnati.`,
    },
    again: 'Nuova rete',
    samples: 'Reti randomizzate',
    size: (n, L, m, k) => `Rete ${k}: ${n} nodi, ${L} collegamenti, ${m} reciproci`,
    bars: 'Punteggio z di ogni schema',
    barsNote: 'z = (conteggio − media delle reti randomizzate) / la loro deviazione standard. Le linee tratteggiate sono a z = ±3. Un trattino indica che lo schema non compare mai, né qui né nelle reti randomizzate.',
    table: 'Conteggi',
    cols: { pattern: 'Schema', observed: 'Conteggio', mean: 'Media nulla', sd: 'Dev. std.', z: 'z' },
    nullNote: (s, swaps) => `${s} reti randomizzate, ${swaps} scambi tentati per collegamento tra l'una e l'altra. Ogni nodo conserva i suoi collegamenti in entrata, in uscita e reciproci.`,
    computing: 'Calcolo in corso…',
    ariaNet: (name) => `Disegno della rete: ${name}`,
    ariaBars: 'Punteggio z di ciascuno dei tredici schemi',
  },
}

const ROW = 21
const BAR = { left: 40, right: 276, width: 320 }

export default function MotifPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const names = PATTERN_TEXT[lang] || PATTERN_TEXT.en
  const [netId, setNetId] = useState('regulation')
  const [seed, setSeed] = useState(NETWORK_SEED)
  const [samples, setSamples] = useState(NULL_DEFAULT)
  const exp = useExperiment()
  const net = useMemo(() => MOTIF_NETWORKS[netId](seed), [netId, seed])
  const key = `${netId}/${seed}/${samples}`

  useEffect(() => {
    const job = motifJob(net, samples)
    const snapshot = job.snapshot
    job.snapshot = () => ({ ...snapshot(), key })
    exp.run(job)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [net, samples])
  const data = exp.data && exp.data.key === key ? exp.data : null
  const done = !!data && data.samples === data.wanted && !exp.running

  const drawing = useMemo(
    () => ({
      nodes: Array.from({ length: net.n }, (_, v) => ({ i: v, r: 2.4, fill: net.layers && v < net.layers[0] && netId === 'regulation' ? ORANGE_DARK : INK })),
      links: net.links.map(([a, b]) => ({ a, b, color: 'rgba(100, 116, 139, 0.38)', width: 0.8 })),
    }),
    [net, netId],
  )

  const z = data ? data.z : []
  const finite = z.filter((v) => Number.isFinite(v)).map(Math.abs)
  const span = Math.max(8, Math.ceil(Math.max(0, ...finite)))
  const mid = (BAR.left + BAR.right) / 2
  const zx = (v) => mid + (Math.max(-span, Math.min(span, v)) / span) * ((BAR.right - BAR.left) / 2)
  const num = (v, d = 1) => (Number.isFinite(v) ? fmt(v, d).replace('-', '−') : '–')
  const select = 'min-w-0 max-w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500'

  return (
    <div>
      <div className="grid gap-x-6 gap-y-3 md:grid-cols-2 items-end">
        <div className="flex flex-wrap items-end gap-2 min-w-0">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700 min-w-0">
            {t.network}
            <select
              value={netId}
              onChange={(e) => {
                setNetId(e.target.value)
                setSeed(NETWORK_SEED)
              }}
              className={select}
            >
              {MOTIF_NETWORK_IDS.map((id) => (
                <option key={id} value={id}>
                  {t.nets[id]}
                </option>
              ))}
            </select>
          </label>
          <Pill onClick={() => setSeed((s) => s + 1)}>{t.again}</Pill>
        </div>
        <Slider label={t.samples} min={NULL_DEFAULT} max={NULL_MAX} step={100} value={samples} onChange={setSamples} format={(v) => v.toLocaleString(lang === 'it' ? 'it-IT' : 'en-US')} />
      </div>
      <p className="mt-3 text-sm text-slate-600 leading-snug">{t.how[netId]}</p>
      <p className="mt-1 h-4 font-mono text-xs text-slate-500" aria-live="polite">
        {exp.running ? `${t.computing} ${Math.round(exp.progress * 100)}%` : ''}
      </p>

      <div className="mt-2 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.size(net.n, net.links.length, mutualLinks(net), seed)}</Eyebrow>
          <div className="mt-2">
            <NetCanvas pos={net.pos} nodes={drawing.nodes} links={drawing.links} aria={t.ariaNet(t.nets[netId])} maxHeight={netId === 'random' ? 260 : 220} ratio={netId === 'random' ? 0.8 : 0.62} />
          </div>
          <div className="mt-5">
            <Eyebrow>{t.bars}</Eyebrow>
            <svg viewBox={`0 0 ${BAR.width} ${PATTERN_IDS.length * ROW + 22}`} className="mt-2 w-full h-auto" role="img" aria-label={t.ariaBars}>
              {[-span, -span / 2, 0, span / 2, span].map((v) => (
                <g key={v}>
                  <line x1={zx(v)} x2={zx(v)} y1="0" y2={PATTERN_IDS.length * ROW + 2} stroke={v === 0 ? SLATE : GRID} strokeWidth="1" />
                  <text x={zx(v)} y={PATTERN_IDS.length * ROW + 14} textAnchor="middle" fontSize="9" fontFamily={MONO} fill={SLATE}>
                    {String(v).replace('-', '−')}
                  </text>
                </g>
              ))}
              {[-3, 3].map((v) => (
                <line key={v} x1={zx(v)} x2={zx(v)} y1="0" y2={PATTERN_IDS.length * ROW + 2} stroke={MUTED} strokeWidth="1" strokeDasharray="3 3" />
              ))}
              {PATTERN_IDS.map((id, k) => {
                const v = z[k]
                const ok = Number.isFinite(v)
                const strong = ok && Math.abs(v) > 3
                return (
                  <g key={id} transform={`translate(0, ${k * ROW + 1})`}>
                    <PatternGlyph id={id} x={4} y={0.5} scale={0.72} color={strong ? ORANGE_DARK : INK} />
                    {ok && <rect x={Math.min(zx(0), zx(v))} y="4" width={Math.max(0.8, Math.abs(zx(v) - zx(0)))} height="11" fill={strong ? ORANGE_DARK : v >= 0 ? SLATE : SKY} fillOpacity={strong ? 0.9 : 0.6} />}
                    <text x={BAR.width - 2} y="13.5" textAnchor="end" fontSize="9.5" fontFamily={MONO} fill={strong ? ORANGE_DARK : INK} fontWeight={strong ? 700 : 400}>
                      {data ? num(v) : ''}
                    </text>
                  </g>
                )
              })}
            </svg>
            <p className="mt-1 text-xs text-slate-500 leading-snug">{t.barsNote}</p>
          </div>
        </div>

        <div className="min-w-0">
          <Eyebrow>{t.table}</Eyebrow>
          <table className="mt-2 w-full text-xs sm:text-sm" data-readout="motifs" data-done={done ? '1' : '0'}>
            <thead>
              <tr>
                <th scope="col" className="pb-1 pr-1 text-left font-mono text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  {t.cols.pattern}
                </th>
                {['observed', 'mean', 'sd', 'z'].map((c) => (
                  <th key={c} scope="col" className="pb-1 px-1 text-right font-mono text-[10px] sm:text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    {t.cols[c]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PATTERN_IDS.map((id, k) => {
                const strong = data && Number.isFinite(z[k]) && Math.abs(z[k]) > 3
                return (
                  <tr key={id} data-pattern={id} className="border-t border-slate-100">
                    <th scope="row" className="py-1 pr-1 text-left font-normal text-slate-700">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <PatternIcon id={id} size={20} className="shrink-0" />
                        <span className="hidden sm:inline leading-tight">{names[id].name}</span>
                        <span className="sr-only sm:hidden">{names[id].name}</span>
                      </span>
                    </th>
                    <td className="py-1 px-1 text-right font-mono tabular-nums text-slate-900">{data ? data.observed[k] : '–'}</td>
                    <td className="py-1 px-1 text-right font-mono tabular-nums text-slate-900">{data ? num(data.mean[k]) : '–'}</td>
                    <td className="py-1 px-1 text-right font-mono tabular-nums text-slate-900">{data ? num(data.sd[k]) : '–'}</td>
                    <td className={`py-1 pl-1 text-right font-mono tabular-nums ${strong ? 'text-orange-700 font-semibold' : 'text-slate-900'}`}>{data ? num(z[k]) : '–'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-500 leading-snug">{t.nullNote(data ? data.samples.toLocaleString(lang === 'it' ? 'it-IT' : 'en-US') : '–', SWAPS_PER_LINK)}</p>
        </div>
      </div>
    </div>
  )
}
