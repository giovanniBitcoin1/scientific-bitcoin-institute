import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, SLATE, Eyebrow, Pill, fmt } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import NetCanvas from '../NetCanvas.jsx'
import { weakJob, piecesAfter, overlapByStrength, groupLayout, ORDER_IDS, STEPS, WEAK_RUNS, GROUPS, GROUP_SIZE, NOISE } from './weakties.js'

// Panel B, "Weak ties hold it together": eight groups of 25, a strength on
// every link, and the network that is left when links are removed in a chosen
// order. The curves are averages over WEAK_RUNS (300) networks; the drawing is the first.

const COLORS = { weakest: ORANGE_DARK, strongest: INK, lowOverlap: '#0284c7', highOverlap: '#16a34a', random: '#94a3b8' }

const T = {
  en: {
    follow: 'Strength follows overlap',
    on: 'on',
    off: 'off',
    how: {
      on: `The strength of a link is its overlap plus a random number between 0 and ${NOISE}.`,
      off: 'The same strengths, dealt out again among the links at random.',
    },
    order: 'Links are removed',
    orders: { weakest: 'Weakest first', strongest: 'Strongest first', lowOverlap: 'Lowest overlap first', highOverlap: 'Highest overlap first', random: 'At random' },
    f: 'Fraction of the links removed',
    drawing: (k, L) => `The first network: ${k.toLocaleString('en-US')} of ${L.toLocaleString('en-US')} links removed`,
    drawn: (largest, pieces) => `Largest piece: ${largest} of ${GROUPS * GROUP_SIZE} nodes · pieces: ${pieces}`,
    drawingNote: 'Dark nodes: the largest piece. Orange nodes: the rest. Links between two groups are drawn darker.',
    giant: 'Share of the nodes in the largest piece',
    others: 'Average size of the other pieces',
    scatter: 'Overlap against strength',
    scatterX: 'tenths of the links, weakest → strongest',
    scatterNote: 'The links of the first network, sorted by strength and cut into ten equal lots: the average overlap of each lot.',
    table: (f) => `At f = ${f}, average of ${WEAK_RUNS} networks`,
    colOrder: 'Order',
    colGiant: 'Largest piece',
    colOthers: 'Other pieces',
    x: 'f',
    computing: 'Computing…',
    ariaNet: 'Eight groups of 25 nodes with the links that are left',
    ariaGiant: 'Share of the largest piece against the fraction of links removed, one curve per order',
    ariaOthers: 'Average size of the other pieces against the fraction of links removed, one curve per order',
    ariaScatter: 'Average overlap of the links in each tenth of the strengths',
  },
  it: {
    follow: 'La forza segue la sovrapposizione',
    on: 'sì',
    off: 'no',
    how: {
      on: `La forza di un collegamento è la sua sovrapposizione più un numero a caso tra 0 e ${String(NOISE).replace('.', ',')}.`,
      off: 'Le stesse forze, ridistribuite a caso tra i collegamenti.',
    },
    order: 'I collegamenti vengono rimossi',
    orders: { weakest: 'Prima i più deboli', strongest: 'Prima i più forti', lowOverlap: 'Prima la sovrapposizione più bassa', highOverlap: 'Prima la sovrapposizione più alta', random: 'A caso' },
    f: 'Quota dei collegamenti rimossi',
    drawing: (k, L) => `La prima rete: ${k.toLocaleString('it-IT')} collegamenti rimossi su ${L.toLocaleString('it-IT')}`,
    drawn: (largest, pieces) => `Pezzo più grande: ${largest} nodi su ${GROUPS * GROUP_SIZE} · pezzi: ${pieces}`,
    drawingNote: 'Nodi scuri: il pezzo più grande. Nodi arancioni: il resto. I collegamenti tra due gruppi sono disegnati più scuri.',
    giant: 'Quota dei nodi nel pezzo più grande',
    others: 'Dimensione media degli altri pezzi',
    scatter: 'Sovrapposizione e forza',
    scatterX: 'decimi dei collegamenti, dai più deboli ai più forti',
    scatterNote: 'I collegamenti della prima rete, ordinati per forza e divisi in dieci parti uguali: la sovrapposizione media di ciascuna parte.',
    table: (f) => `Con f = ${f}, media di ${WEAK_RUNS} reti`,
    colOrder: 'Ordine',
    colGiant: 'Pezzo più grande',
    colOthers: 'Altri pezzi',
    x: 'f',
    computing: 'Calcolo in corso…',
    ariaNet: 'Otto gruppi di 25 nodi con i collegamenti rimasti',
    ariaGiant: 'Quota del pezzo più grande al variare della quota di collegamenti rimossi, una curva per ordine',
    ariaOthers: 'Dimensione media degli altri pezzi al variare della quota di collegamenti rimossi, una curva per ordine',
    ariaScatter: 'Sovrapposizione media dei collegamenti in ciascun decimo delle forze',
  },
}

const POS = groupLayout()

export default function WeakTiesPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [follow, setFollow] = useState(true)
  const [orderId, setOrderId] = useState('weakest')
  const [f, setF] = useState(0)
  const exp = useExperiment()

  useEffect(() => {
    exp.run(weakJob(follow))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [follow])
  const data = exp.data && exp.data.follow === follow && exp.data.first ? exp.data : null
  const done = !!data && data.runs === data.wanted && !exp.running
  const first = data ? data.first : null
  const index = Math.round(f * STEPS)

  const drawing = useMemo(() => {
    if (!first) return null
    const { net, orders } = first
    const L = net.A.length
    const k = Math.round(f * L)
    const order = orders[orderId]
    const left = piecesAfter(net, order, k)
    const links = []
    // Links inside the groups first, links between groups on top.
    for (const pass of [0, 1]) {
      for (let i = k; i < L; i++) {
        const e = order[i]
        if (net.between[e] !== pass) continue
        links.push({ a: net.A[e], b: net.B[e], color: pass ? 'rgba(15, 23, 42, 0.75)' : 'rgba(100, 116, 139, 0.16)', width: pass ? 1.1 : 0.7 })
      }
    }
    const nodes = Array.from({ length: net.n }, (_, v) => ({ i: v, r: 2.6, fill: left.label[v] === left.big ? INK : ORANGE_DARK }))
    return { links, nodes, k, L, left }
  }, [first, orderId, f])

  const tenths = useMemo(() => (first ? overlapByStrength(first.strength, first.overlap) : []), [first])
  const series = (field) =>
    data
      ? ORDER_IDS.map((id) => ({
          points: Array.from(data.mean[id][field], (v, i) => [i / STEPS, v]),
          color: COLORS[id],
          width: id === orderId ? 2.6 : 1.3,
          opacity: id === orderId ? 1 : 0.75,
        }))
      : []
  const x = { min: 0, max: 1, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], label: t.x, format: (v) => String(v) }
  const mark = [{ x: f, color: '#94a3b8', dashed: true }]
  const num = (v, d) => (lang === 'it' ? fmt(v, d).replace('.', ',') : fmt(v, d))

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Pill active={follow} onClick={() => setFollow((v) => !v)} data-switch="follow">
          {t.follow}: {follow ? t.on : t.off}
        </Pill>
        <span className="text-sm text-slate-600 leading-snug">{follow ? t.how.on : t.how.off}</span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-700">{t.order}</p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {ORDER_IDS.map((id) => (
          <Pill key={id} active={id === orderId} onClick={() => setOrderId(id)} data-order={id}>
            <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: COLORS[id], outline: id === orderId ? '1px solid #fff' : undefined }} />
            {t.orders[id]}
          </Pill>
        ))}
      </div>
      <div className="mt-4 max-w-xl">
        <Slider label={t.f} min={0} max={1} step={0.01} value={f} onChange={setF} format={(v) => num(v, 2)} />
      </div>
      <p className="mt-1 h-4 font-mono text-xs text-slate-500" aria-live="polite">
        {exp.running ? `${t.computing} ${Math.round(exp.progress * 100)}%` : ''}
      </p>

      <div className="mt-2 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{drawing ? t.drawing(drawing.k, drawing.L) : t.computing}</Eyebrow>
          <div className="mt-2">{drawing && <NetCanvas pos={POS} nodes={drawing.nodes} links={drawing.links} aria={t.ariaNet} maxHeight={340} ratio={0.92} />}</div>
          <p className="mt-2 font-mono text-xs text-slate-700 tabular-nums" data-readout="drawn">
            {drawing ? t.drawn(drawing.left.largest, drawing.left.pieces) : ''}
          </p>
          <p className="mt-1 text-xs text-slate-500 leading-snug">{t.drawingNote}</p>
        </div>

        <div className="min-w-0 space-y-4">
          <div>
            <Eyebrow>{t.giant}</Eyebrow>
            <Chart x={x} y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => String(v) }} height={165} aria={t.ariaGiant} series={series('giant')} marks={mark} />
          </div>
          <div>
            <Eyebrow>{t.others}</Eyebrow>
            <Chart x={x} y={{ min: 0, max: 30, ticks: [0, 10, 20, 30], format: (v) => String(v) }} height={140} aria={t.ariaOthers} series={series('others')} marks={mark} />
          </div>
          <Legend items={ORDER_IDS.map((id) => ({ label: t.orders[id], color: COLORS[id] }))} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.table(num(f, 2))}</Eyebrow>
          <table className="mt-2 w-full text-sm" data-readout="weak" data-done={done ? '1' : '0'}>
            <thead>
              <tr>
                <th scope="col" className="pb-1 pr-2 text-left font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  {t.colOrder}
                </th>
                <th scope="col" className="pb-1 px-2 text-right font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  {t.colGiant}
                </th>
                <th scope="col" className="pb-1 pl-2 text-right font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  {t.colOthers}
                </th>
              </tr>
            </thead>
            <tbody>
              {ORDER_IDS.map((id) => (
                <tr key={id} className={`border-t border-slate-100 ${id === orderId ? 'bg-orange-50/60' : ''}`}>
                  <th scope="row" className="py-1.5 pr-2 text-left font-normal text-slate-700">
                    <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-baseline" style={{ background: COLORS[id] }} />
                    {t.orders[id]}
                  </th>
                  <td className="py-1.5 px-2 text-right font-mono tabular-nums text-slate-900">{data ? fmt(data.mean[id].giant[index], 3) : '–'}</td>
                  <td className="py-1.5 pl-2 text-right font-mono tabular-nums text-slate-900">{data ? fmt(data.mean[id].others[index], 1) : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.scatter}</Eyebrow>
          <Chart
            x={{ min: 1, max: 10, ticks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], label: t.scatterX, format: (v) => String(v) }}
            y={{ min: 0, max: 0.5, ticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5], format: (v) => String(v) }}
            height={150}
            aria={t.ariaScatter}
            series={[{ points: tenths.map((b) => [b.bin + 1, b.overlap]), color: follow ? ORANGE_DARK : SLATE, dots: 2.6, width: 1.6 }]}
          />
          <p className="mt-1 text-xs text-slate-500 leading-snug" data-readout="tenths" data-values={tenths.map((b) => b.overlap.toFixed(2)).join(' ')}>
            {t.scatterNote}
          </p>
        </div>
      </div>
    </div>
  )
}
