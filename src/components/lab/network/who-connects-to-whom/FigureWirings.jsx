import { useMemo, useState } from 'react'
import { ORANGE_DARK, INK, Pill } from '../ui.jsx'
import NetCanvas, { fitUnit } from '../NetCanvas.jsx'
import { forceLayout } from '../../graphUtils.js'
import { mulberry32 } from '../../rng.js'
import { twoWirings, F1_N } from './figures.js'

// Live figure F1, "Same degrees, two wirings": one degree sequence of 30
// nodes, rewired fully towards assortative and towards disassortative
// (Xulvi-Brunet–Sokolov, p = 1). Node size follows the degree.

const T = {
  en: {
    assortative: 'Towards assortative',
    disassortative: 'Towards disassortative',
    deal: 'Deal new degrees',
    same: (k) => `Both networks: ${F1_N} nodes, degrees ${k}.`,
    aria: (w) => `A network of ${F1_N} nodes wired ${w}`,
    locale: 'en-US',
  },
  it: {
    assortative: 'Verso assortativa',
    disassortative: 'Verso disassortativa',
    deal: 'Nuovi gradi',
    same: (k) => `Entrambe le reti: ${F1_N} nodi, gradi ${k}.`,
    aria: (w) => `Una rete di ${F1_N} nodi cablata ${w}`,
    locale: 'it-IT',
  },
}

function drawing(net, k, color) {
  const n = net.n
  const random = mulberry32(29)
  const start = Float64Array.from({ length: 2 * n }, () => random())
  const pos = fitUnit(forceLayout(n, net.A, net.B, net.A.length, start, 0.1, 250), n)
  let big = 1
  for (const d of k) if (d > big) big = d
  const links = Array.from(net.A, (a, e) => ({ a, b: net.B[e], color: 'rgba(100, 116, 139, 0.55)', width: 1 }))
  const nodes = Array.from({ length: n }, (_, v) => ({ i: v, r: 2.5 + 6 * Math.sqrt(k[v] / big), fill: color, stroke: '#ffffff', lineWidth: 1 }))
  return { pos, links, nodes }
}

export default function FigureWirings({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [deal, setDeal] = useState(0)
  const w = useMemo(() => twoWirings(deal), [deal])
  const pics = useMemo(
    () => ({ assortative: drawing(w.assortative.net, w.deg, ORANGE_DARK), disassortative: drawing(w.disassortative.net, w.deg, INK) }),
    [w],
  )
  const num = (v) => v.toLocaleString(t.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const sorted = [...w.deg].sort((a, b) => b - a).join(' ')

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {['assortative', 'disassortative'].map((id) => (
          <div key={id} className="min-w-0" data-readout={`wiring-${id}`} data-r={w[id].r.toFixed(3)} data-rho={w[id].rho.toFixed(3)}>
            <p className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">{t[id]}</p>
            <NetCanvas pos={pics[id].pos} nodes={pics[id].nodes} links={pics[id].links} aria={t.aria(t[id].toLowerCase())} maxHeight={200} ratio={1} />
            <p className="mt-1 font-mono text-sm text-slate-900 tabular-nums">
              r = {num(w[id].r)} · ρ = {num(w[id].rho)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Pill onClick={() => setDeal((d) => d + 1)} data-action="deal">
          {t.deal}
        </Pill>
        <p className="text-xs text-slate-500 leading-snug min-w-0 break-words">{t.same(sorted)}</p>
      </div>
    </div>
  )
}
