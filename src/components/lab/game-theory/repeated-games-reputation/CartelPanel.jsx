import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { Pill, Stat, INK, SLATE, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { levels, held, curve, thresholdTable } from './collusion.js'
import { num } from './FigurePatience.jsx'

// Panel A, "Can the cartel hold?": module 02's market (price 10 − Q, cost 1)
// played again and again by n firms, with quantities (Cournot) or prices
// (Bertrand). The punishment is the stage equilibrium for ever. Below the
// threshold a Cournot cartel can still hold a smaller cut in output; with
// prices it is all or nothing. Sliders, pills and SVG only.

const SKY = '#0369a1'

const T = {
  en: {
    n: 'n, the number of firms',
    delta: 'δ, patience',
    cournot: 'Quantities (Cournot)',
    bertrand: 'Prices (Bertrand)',
    punish: 'Punishment, per firm',
    cartel: 'Cartel, per firm',
    cheat: 'Cheating once',
    thr: 'Threshold δ*',
    heldQ: 'Output held, per firm',
    heldP: 'Price held',
    heldProfit: 'Profit held, per firm',
    share: 'Share of the cartel’s extra profit',
    chartTitle: 'Profit per firm and round that can be held',
    axis: 'δ →',
    legend: ['held', 'cartel', 'punishment'],
    table: 'Thresholds',
    firms: 'n',
    aria: 'The profit per firm and round that can be held against δ, with the cartel and punishment levels and the current δ',
  },
  it: {
    n: 'n, il numero di imprese',
    delta: 'δ, la pazienza',
    cournot: 'Quantità (Cournot)',
    bertrand: 'Prezzi (Bertrand)',
    punish: 'Punizione, per impresa',
    cartel: 'Cartello, per impresa',
    cheat: 'Imbrogliare una volta',
    thr: 'Soglia δ*',
    heldQ: 'Quantità sostenuta, per impresa',
    heldP: 'Prezzo sostenuto',
    heldProfit: 'Profitto sostenuto, per impresa',
    share: 'Quota del profitto in più del cartello',
    chartTitle: 'Il profitto per impresa e per turno che si può sostenere',
    axis: 'δ →',
    legend: ['sostenuto', 'cartello', 'punizione'],
    table: 'Soglie',
    firms: 'n',
    aria: 'Il profitto per impresa e per turno che si può sostenere in funzione di δ, con i livelli del cartello e della punizione e il δ attuale',
  },
}

export default function CartelPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [n, setN] = useState(2)
  const [delta, setDelta] = useState(0.5)
  const [mode, setMode] = useState('cournot')
  const f = (v, d = 4) => num(v, lang, d)
  const L = levels(n, mode)
  const h = held(delta, n, mode)
  const pts = useMemo(() => curve(n, mode), [n, mode])
  // The y axis spans the band between punishment and cartel, with a margin.
  const gap = L.cartel - L.punishment
  const bottom = Math.max(0, L.punishment - 0.25 * gap)
  const top = L.cartel + 0.25 * gap
  const yTicks = [0, 1, 2, 3, 4].map((i) => bottom + ((top - bottom) * i) / 4)
  const yDigits = top - bottom < 1 ? 2 : top - bottom < 10 ? 1 : 0
  const rows = thresholdTable()

  return (
    <div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl">
        <Slider label={t.n} min={2} max={10} step={1} value={n} onChange={setN} />
        <Slider label={t.delta} min={0} max={0.99} step={0.01} value={delta} onChange={setDelta} format={(v) => f(v, 2)} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2" data-role="cartel-mode">
        <Pill active={mode === 'cournot'} onClick={() => setMode('cournot')}>
          {t.cournot}
        </Pill>
        <Pill active={mode === 'bertrand'} onClick={() => setMode('bertrand')}>
          {t.bertrand}
        </Pill>
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-3xl" data-role="cartel-readout">
        <Stat label={t.punish}>
          <span data-value="punish">{f(L.punishment)}</span>
        </Stat>
        <Stat label={t.cartel}>
          <span data-value="cartel">{f(L.cartel)}</span>
        </Stat>
        <Stat label={t.cheat}>
          <span data-value="cheat">{f(L.cheat)}</span>
        </Stat>
        <Stat label={t.thr}>
          <span data-value="threshold">{f(L.threshold)}</span>
        </Stat>
        <Stat label={mode === 'bertrand' ? t.heldP : t.heldQ}>
          <span data-value="held">{mode === 'bertrand' ? f(h.price, 2) : f(h.q)}</span>
        </Stat>
        <Stat label={t.heldProfit}>
          <span data-value="heldProfit">{f(h.profit)}</span>
        </Stat>
        <Stat label={t.share} wide>
          <span data-value="share">{f(h.share, 3)}</span>
        </Stat>
      </div>
      <div className="mt-4 max-w-xl" data-role="cartel-chart">
        <p className="text-sm font-medium text-slate-700">{t.chartTitle}</p>
        <Chart
          x={{ min: 0, max: 1, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], label: t.axis, format: (v) => f(v, 1) }}
          y={{ min: bottom, max: top, ticks: yTicks, format: (v) => f(v, yDigits) }}
          series={[
            { points: [[0, L.cartel], [1, L.cartel]], color: ORANGE_DARK, width: 1, dashed: true, opacity: 0.6 },
            { points: [[0, L.punishment], [1, L.punishment]], color: SLATE, width: 1, dashed: true, opacity: 0.6 },
            { points: pts, color: INK, width: 2 },
          ]}
          marks={[{ x: delta, color: SKY, label: 'δ' }]}
          height={180}
          aria={t.aria}
        />
        <Legend
          items={[
            { label: t.legend[0], color: INK },
            { label: t.legend[1], color: ORANGE_DARK, dashed: true },
            { label: t.legend[2], color: SLATE, dashed: true },
          ]}
        />
      </div>
      <div className="mt-4 max-w-xs">
        <table className="w-full text-xs font-mono tabular-nums text-slate-700" data-role="cartel-table">
          <caption className="text-left text-xs text-slate-500 font-sans pb-1">{t.table}</caption>
          <thead>
            <tr className="text-slate-500 font-sans">
              <th className="text-left font-medium">{t.firms}</th>
              <th className="text-right font-medium">Cournot</th>
              <th className="text-right font-medium">Bertrand</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.n} className={r.n === n ? 'text-orange-700 font-semibold' : ''} data-n={r.n}>
                <td>{r.n}</td>
                <td className="text-right">{f(r.cournot, 3)}</td>
                <td className="text-right">{f(r.bertrand, 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

