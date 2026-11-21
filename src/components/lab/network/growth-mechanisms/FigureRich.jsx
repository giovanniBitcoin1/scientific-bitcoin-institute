import { useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, MUTED } from '../ui.jsx'
import Chart from '../charts.jsx'
import { hubShare, RICH_OTHERS, RICH_K } from './figures.js'

// Live figure F1, "How fast do the rich get richer?": one hub with K links
// and 1,000 nodes with 2 links each. With Π(k) ∝ k^α, the share of the next
// link that goes to the hub; beside it, Π(k) on log axes against the line of
// α = 1.

const T = {
  en: {
    K: 'Links of the hub, K',
    alpha: 'Exponent of the kernel, α',
    share: (pct) => `Share of the next link that goes to the hub: ${pct}`,
    note: (others, k) => `The other ${others.toLocaleString('en-US')} nodes have ${k} links each.`,
    chart: 'Π(k) ∝ k^α, with Π(1) = 1; dashed: α = 1',
    aria: 'Attachment kernel against degree on logarithmic axes, with the linear kernel dashed',
    locale: 'en-US',
  },
  it: {
    K: "Collegamenti dell'hub, K",
    alpha: 'Esponente del kernel, α',
    share: (pct) => `Quota del prossimo collegamento che va all'hub: ${pct}`,
    note: (others, k) => `Gli altri ${others.toLocaleString('it-IT')} nodi hanno ${k} collegamenti ciascuno.`,
    chart: 'Π(k) ∝ k^α, con Π(1) = 1; tratteggiata: α = 1',
    aria: 'Kernel di aggancio al variare del grado su assi logaritmici, con il kernel lineare tratteggiato',
    locale: 'it-IT',
  },
}

const KS = Array.from({ length: 31 }, (_, i) => 10 ** (i / 10))

export default function FigureRich({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [K, setK] = useState(100)
  const [alpha, setAlpha] = useState(1)
  const s = hubShare(K, alpha)
  const pct = (100 * s).toLocaleString(t.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
  const num = (v, d) => v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d })
  return (
    <div className="grid gap-4 sm:grid-cols-2 items-start">
      <div className="min-w-0 space-y-3">
        <Slider label={t.K} min={10} max={1000} log value={K} onChange={(v) => setK(Math.round(v))} format={(v) => Math.round(v).toLocaleString(t.locale)} />
        <Slider label={t.alpha} min={0} max={2.5} step={0.05} value={alpha} onChange={setAlpha} format={(v) => num(v, 2)} />
        <p className="font-mono text-sm text-slate-900 tabular-nums" data-readout="rich" data-share={s.toFixed(4)}>
          {t.share(pct)}
        </p>
        <div className="h-2 rounded bg-slate-200 overflow-hidden" aria-hidden="true">
          <div className="h-full bg-orange-500" style={{ width: `${100 * s}%` }} />
        </div>
        <p className="text-xs text-slate-500 leading-snug">{t.note(RICH_OTHERS, RICH_K)}</p>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 font-mono">{t.chart}</p>
        <Chart
          x={{ min: 1, max: 1000, log: true, ticks: [1, 10, 100, 1000], label: 'k' }}
          y={{ min: 1, max: 1e7, log: true, ticks: [1, 1e2, 1e4, 1e6] }}
          height={150}
          aria={t.aria}
          series={[
            { points: KS.map((k) => [k, k]), color: MUTED, dashed: true, width: 1.3 },
            { points: KS.map((k) => [k, Math.max(1, k ** alpha)]), color: ORANGE_DARK, width: 2 },
          ]}
          marks={[{ x: K, color: '#94a3b8', dashed: true }]}
        />
      </div>
    </div>
  )
}
