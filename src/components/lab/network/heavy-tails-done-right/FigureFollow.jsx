import { useMemo, useState } from 'react'
import { ORANGE_DARK, INK, SLATE, GRID, MONO, Pill } from '../ui.jsx'
import { Legend } from '../charts.jsx'
import { followDistributions } from './genfun.js'

// Live figure F2, "Follow a link": for three degree distributions, the links
// of a random node (p_k) beside the other links of the node at the end of a
// random link (q_k). Bars for k = 0 … 11, and one for everything beyond.

const LAST = 12 // the bar "12 or more"
const IDS = ['poisson', 'power', 'onesFours']

const T = {
  en: {
    choose: 'Degree distribution',
    names: { poisson: 'Poisson, mean 3', power: 'Power law, γ = 2.5', onesFours: 'Ones and fours' },
    notes: {
      poisson: 'For a Poisson distribution the two sets of bars are the same: following a link changes nothing.',
      power: (cut) => `Power law from k = 1, stopped at ${cut}, the natural cutoff for 10,000 nodes. A random node almost never has 12 links or more; the node at the end of a link often has.`,
      onesFours: 'A quarter of the nodes have four links, the rest have one. Follow a link, and four times out of seven you reach a node with four.',
    },
    p: 'A random node: its links, p',
    q: 'The end of a random link: its other links, q',
    mean: 'Mean number of links, ⟨k⟩',
    excess: 'Mean number of other links, (⟨k²⟩ − ⟨k⟩) / ⟨k⟩',
    axis: 'links',
    aria: (name) => `Two sets of bars for ${name}: links of a random node, and other links of the node at the end of a random link`,
    locale: 'en-US',
  },
  it: {
    choose: 'Distribuzione dei gradi',
    names: { poisson: 'Poisson, media 3', power: 'Legge di potenza, γ = 2,5', onesFours: 'Uno e quattro' },
    notes: {
      poisson: 'Per una distribuzione di Poisson le due serie di barre coincidono: seguire un collegamento non cambia nulla.',
      power: (cut) => `Legge di potenza da k = 1, fermata a ${cut}, il cutoff naturale per 10.000 nodi. Un nodo a caso non ha quasi mai 12 collegamenti o più; il nodo in fondo a un collegamento li ha spesso.`,
      onesFours: 'Un quarto dei nodi ha quattro collegamenti, gli altri ne hanno uno. Segui un collegamento, e quattro volte su sette arrivi a un nodo che ne ha quattro.',
    },
    p: 'Un nodo a caso: i suoi collegamenti, p',
    q: 'In fondo a un collegamento a caso: gli altri collegamenti, q',
    mean: 'Numero medio di collegamenti, ⟨k⟩',
    excess: 'Numero medio di altri collegamenti, (⟨k²⟩ − ⟨k⟩) / ⟨k⟩',
    axis: 'collegamenti',
    aria: (name) => `Due serie di barre per ${name}: collegamenti di un nodo a caso, e altri collegamenti del nodo in fondo a un collegamento a caso`,
    locale: 'it-IT',
  },
}

const W = 340
const H = 150
const PAD = { left: 30, right: 6, top: 8, bottom: 24 }

function bars(D) {
  const out = []
  for (let k = 0; k < LAST; k++) out.push(D[k] || 0)
  let rest = 0
  for (let k = LAST; k < D.length; k++) rest += D[k]
  out.push(rest)
  return out
}

export default function FigureFollow({ lang = 'en' }) {
  const t = T[lang] || T.en
  const all = useMemo(() => followDistributions(), [])
  const [id, setId] = useState('power')
  const d = all[id]
  const P = bars(d.P)
  const Q = bars(d.Q)
  const top = Math.max(0.5, Math.ceil(Math.max(...P, ...Q) * 10) / 10)
  const slot = (W - PAD.left - PAD.right) / (LAST + 1)
  const y = (v) => H - PAD.bottom - (v / top) * (H - PAD.top - PAD.bottom)
  const dec = (v, d2 = 2) => v.toLocaleString(t.locale, { minimumFractionDigits: d2, maximumFractionDigits: d2 })
  const ticks = [0, top / 2, top]

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t.choose}>
        {IDS.map((k) => (
          <Pill key={k} active={k === id} onClick={() => setId(k)} data-dist={k} className="!px-2.5 !py-1 !normal-case !tracking-normal">
            {t.names[k]}
          </Pill>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full h-auto max-h-[230px]" role="img" aria-label={t.aria(t.names[id])}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke={GRID} strokeWidth="1" />
            <text x={PAD.left - 4} y={y(v) + 3} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>
              {dec(v)}
            </text>
          </g>
        ))}
        {P.map((p, k) => {
          const x0 = PAD.left + k * slot
          return (
            <g key={k}>
              <rect x={x0 + slot * 0.12} y={y(p)} width={slot * 0.36} height={Math.max(0, y(0) - y(p))} fill={INK} />
              <rect x={x0 + slot * 0.52} y={y(Q[k])} width={slot * 0.36} height={Math.max(0, y(0) - y(Q[k]))} fill={ORANGE_DARK} />
              <text x={x0 + slot / 2} y={H - PAD.bottom + 11} textAnchor="middle" fontSize="9" fontFamily={MONO} fill={SLATE}>
                {k === LAST ? `${LAST}+` : k}
              </text>
            </g>
          )
        })}
        <line x1={PAD.left} x2={W - PAD.right} y1={y(0)} y2={y(0)} stroke={SLATE} strokeWidth="1" />
        <text x={W - PAD.right} y={H - 1} textAnchor="end" fontSize="9" fontFamily={MONO} fill={SLATE}>
          {t.axis}
        </text>
      </svg>
      <Legend items={[{ label: t.p, color: INK, bar: true }, { label: t.q, color: ORANGE_DARK, bar: true }]} />
      <p className="mt-2 font-mono text-[13px] text-slate-900 tabular-nums leading-snug" data-readout="follow">
        <span className="font-sans text-sm text-slate-600">{t.mean}:</span> {dec(d.mean)}
        <span className="mx-2 text-slate-300">·</span>
        <span className="font-sans text-sm text-slate-600">{t.excess}:</span> {dec(d.excess)}
      </p>
      <p className="mt-1 text-xs text-slate-500 leading-snug">{id === 'power' ? t.notes.power(d.cut) : t.notes[id]}</p>
    </div>
  )
}
