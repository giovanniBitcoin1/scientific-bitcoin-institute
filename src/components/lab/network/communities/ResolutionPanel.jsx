import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, Stat } from '../ui.jsx'
import NetCanvas from '../NetCanvas.jsx'
import { panelB, B_DEFAULT } from './experiments.js'
import { ringPositions } from './figures.js'
import { groupColor } from './palette.js'

// Panel B, "The resolution limit": a ring of n cliques of s nodes. Q with
// each clique a group and with pairs, the condition n > s(s − 1) + 2, what
// Louvain finds at a resolution γ, and the range of γ that keeps the cliques.

const T = {
  en: {
    n: 'Cliques in the ring, n',
    s: 'Nodes per clique, s',
    gamma: 'Resolution γ in Q_γ = Σ [L_c/L − γ (d_c/2L)²]',
    qOne: 'Q, each clique a group',
    qPairs: 'Q, pairs of cliques',
    cond: (d) => `Pairs win when n > s(s − 1) + 2 = ${d}`,
    yes: 'yes: the pairs win',
    no: 'no: each clique wins',
    tie: 'equal',
    found: 'Louvain at this γ: groups',
    split: 'Cliques split',
    merged: 'Cliques merged with others',
    qFound: 'Q (γ = 1) of what Louvain finds',
    range: 'γ that keeps each clique a group',
    rangeNote: 'The range in which "each clique a group" scores higher under Q_γ than merging any neighbouring cliques and than splitting one clique in two. Louvain starts from single nodes and may stop short of the best partition.',
    aria: (n, s) => `A ring of ${n} cliques of ${s} nodes coloured by the groups Louvain finds`,
    locale: 'en-US',
  },
  it: {
    n: "Cricche nell'anello, n",
    s: 'Nodi per cricca, s',
    gamma: 'Risoluzione γ in Q_γ = Σ [L_c/L − γ (d_c/2L)²]',
    qOne: 'Q, ogni cricca un gruppo',
    qPairs: 'Q, cricche a coppie',
    cond: (d) => `Le coppie vincono quando n > s(s − 1) + 2 = ${d}`,
    yes: 'sì: vincono le coppie',
    no: 'no: vince ogni cricca',
    tie: 'pari',
    found: 'Louvain con questo γ: gruppi',
    split: 'Cricche spezzate',
    merged: 'Cricche fuse con altre',
    qFound: 'Q (γ = 1) di ciò che trova Louvain',
    range: 'γ che tiene ogni cricca un gruppo',
    rangeNote: "L'intervallo in cui «ogni cricca un gruppo» ha un Q_γ più alto che fondere cricche vicine e che spezzare una cricca in due. Louvain parte dai singoli nodi e può fermarsi prima della partizione migliore.",
    aria: (n, s) => `Un anello di ${n} cricche di ${s} nodi colorato secondo i gruppi trovati da Louvain`,
    locale: 'it-IT',
  },
}

const roundGamma = (g) => (g < 1 ? Math.round(g * 100) / 100 : g < 10 ? Math.round(g * 20) / 20 : Math.round(g * 2) / 2)

export default function ResolutionPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const [n, setN] = useState(B_DEFAULT.n)
  const [s, setS] = useState(B_DEFAULT.s)
  const [gamma, setGamma] = useState(B_DEFAULT.gamma)
  const b = useMemo(() => panelB({ n, s, gamma }), [n, s, gamma])
  const pos = useMemo(() => ringPositions(n, s), [n, s])
  const nodes = Array.from({ length: b.g.n }, (_, v) => ({ i: v, r: b.g.n > 300 ? 1.8 : 2.6, fill: groupColor(b.found[v]), stroke: '#ffffff', lineWidth: 0.4 }))
  const links = Array.from(b.g.A, (a, e) => ({ a, b: b.g.B[e], color: 'rgba(100, 116, 139, 0.45)', width: 0.6 }))
  const verdict = n === b.condition ? t.tie : b.pairsWin ? t.yes : t.no
  const inRange = gamma > b.range.lo && gamma < b.range.hi

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider label={t.n} min={4} max={60} step={2} value={n} onChange={(v) => setN(Math.round(v / 2) * 2)} format={(v) => String(v)} />
        <Slider label={t.s} min={3} max={10} step={1} value={s} onChange={(v) => setS(Math.round(v))} format={(v) => String(v)} />
        <Slider label={t.gamma} min={0.1} max={100} log value={gamma} onChange={(v) => setGamma(roundGamma(v))} format={(v) => num(v, v < 10 ? 2 : 1)} />
      </div>
      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <NetCanvas pos={pos} nodes={nodes} links={links} aria={t.aria(n, s)} maxHeight={300} ratio={1} />
        </div>
        <div
          className="min-w-0 grid grid-cols-2 gap-2 content-start"
          data-readout="resolution"
          data-one={b.qOne.toFixed(4)}
          data-pairs={b.qPairs.toFixed(4)}
          data-groups={b.report.groups}
          data-split={b.report.split}
          data-merged={b.report.merged}
          data-lo={b.range.lo.toFixed(3)}
          data-hi={b.range.hi.toFixed(3)}
          data-gamma={gamma}
        >
          <Stat label={t.qOne}>{num(b.qOne, 4)}</Stat>
          <Stat label={t.qPairs}>{num(b.qPairs, 4)}</Stat>
          <Stat label={t.cond(b.condition)} wide>
            {verdict}
          </Stat>
          <Stat label={t.found}>{b.report.groups}</Stat>
          <Stat label={t.qFound}>{num(b.qFound, 4)}</Stat>
          <Stat label={t.split}>{b.report.split}</Stat>
          <Stat label={t.merged}>{b.report.merged}</Stat>
          <Stat label={t.range} wide>
            <span style={{ color: inRange ? ORANGE_DARK : undefined }}>{`${num(b.range.lo, 2)} < γ < ${num(b.range.hi, 1)}`}</span>
          </Stat>
          <p className="col-span-2 text-xs text-slate-500 leading-snug">{t.rangeNote}</p>
        </div>
      </div>
    </div>
  )
}
