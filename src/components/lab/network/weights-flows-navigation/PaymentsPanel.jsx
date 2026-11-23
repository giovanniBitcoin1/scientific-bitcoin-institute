import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, SLATE, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { payNet, pickPair, pairReadout, pairsJob, successAt, successCurves, B_DEFAULT, B_PAIRS } from './experiments.js'
import { PAY_M, MAX_PARTS } from './flow.js'

// Panel B, "How much can flow?": a synthetic payment network (not Lightning
// data). One sender and one receiver with the widest single route, the maximum
// flow and the minimum cut; then payments between 500 random pairs by three
// strategies, as the amount grows.

const T = {
  en: {
    synthetic: `A synthetic network, not Lightning data. Preferential attachment, ${PAY_M} channels per new node. Capacities are lognormal with median 1,000,000 (think of satoshi) and σ = 1 on the natural logarithm; each channel's capacity is split between its two ends at random, every split equally likely.`,
    N: 'Nodes, N',
    picks: { random: 'Two random nodes', hubs: 'The two largest hubs', small: 'Two small nodes' },
    next: 'Next pair',
    pair: (s, t, ks, kt) => `Node ${s} (${ks} channels) pays node ${t} (${kt} channels)`,
    out: "Sender's outgoing balance",
    incoming: "Receiver's incoming balance",
    widest: 'Most a single route can carry',
    hops: (h) => `${h} channel${h === 1 ? '' : 's'}`,
    maxFlow: 'Maximum flow',
    cut: 'Minimum cut',
    cutSize: (c) => `${c} channel${c === 1 ? '' : 's'}`,
    where: { sender: "the sender's own channels", receiver: "the receiver's own channels", middle: 'not all at one end' },
    payments: `Payments between ${B_PAIRS} random pairs`,
    fraction: "Amount, as a fraction of the sender's outgoing balance",
    single: 'One route, the widest by capacity',
    split: `Up to ${MAX_PARTS} routes, equal parts`,
    full: 'Every balance known',
    success: 'succeed',
    model: (p) => `model: ${p}`,
    parts: (k) => `${k} parts on average`,
    strategies: `One route: the widest by public capacity, the shortest among those. Several: up to ${MAX_PARTS} routes sharing no channel, found the same way one after the other, the amount in equal parts; the number of parts is the one the uncertainty model rates most likely. Every balance known: the payment succeeds when the amount is at most the maximum flow. "Model" is the mean probability the sender computes without knowing the balances: (c + 1 − a)/(c + 1) for each channel of capacity c, multiplied along the routes.`,
    chart: 'Share of payments that succeed against the amount',
    running: 'Computing…',
    ariaChart: 'Success rate of the three strategies against the amount as a fraction of the outgoing balance',
    locale: 'en-US',
  },
  it: {
    synthetic: `Una rete sintetica, non dati di Lightning. Aggancio preferenziale, ${PAY_M} canali per ogni nuovo nodo. Le capacità sono lognormali con mediana 1.000.000 (pensa ai satoshi) e σ = 1 sul logaritmo naturale; la capacità di ogni canale è divisa a caso tra i due estremi, ogni divisione con la stessa probabilità.`,
    N: 'Nodi, N',
    picks: { random: 'Due nodi a caso', hubs: 'I due hub più grandi', small: 'Due nodi piccoli' },
    next: 'Coppia successiva',
    pair: (s, t, ks, kt) => `Il nodo ${s} (${ks} canali) paga il nodo ${t} (${kt} canali)`,
    out: 'Saldo in uscita del mittente',
    incoming: 'Saldo in entrata del destinatario',
    widest: 'Il massimo che un solo percorso può portare',
    hops: (h) => `${h} ${h === 1 ? 'canale' : 'canali'}`,
    maxFlow: 'Flusso massimo',
    cut: 'Taglio minimo',
    cutSize: (c) => `${c} ${c === 1 ? 'canale' : 'canali'}`,
    where: { sender: 'i canali del mittente', receiver: 'i canali del destinatario', middle: 'non tutto a un estremo' },
    payments: `Pagamenti tra ${B_PAIRS} coppie a caso`,
    fraction: 'Importo, come frazione del saldo in uscita del mittente',
    single: 'Un percorso, il più largo per capacità',
    split: `Fino a ${MAX_PARTS} percorsi, parti uguali`,
    full: 'Tutti i saldi noti',
    success: 'riescono',
    model: (p) => `modello: ${p}`,
    parts: (k) => `${k} parti in media`,
    strategies: `Un percorso: il più largo per capacità pubblica, il più corto tra quelli. Più percorsi: fino a ${MAX_PARTS} percorsi senza canali in comune, trovati allo stesso modo uno dopo l'altro, l'importo in parti uguali; il numero di parti è quello che il modello di incertezza giudica più probabile. Tutti i saldi noti: il pagamento riesce quando l'importo è al più il flusso massimo. «Modello» è la probabilità media che il mittente calcola senza conoscere i saldi: (c + 1 − a)/(c + 1) per ogni canale di capacità c, moltiplicata lungo i percorsi.`,
    chart: "Quota di pagamenti riusciti al variare dell'importo",
    running: 'Calcolo in corso…',
    ariaChart: "Tasso di successo delle tre strategie al variare dell'importo come frazione del saldo in uscita",
    locale: 'it-IT',
  },
}

export default function PaymentsPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const pct = (v) => `${num(100 * v, 1)}%`
  const [N, setN] = useState(B_DEFAULT.N)
  const [pick, setPick] = useState(B_DEFAULT.pick)
  const [j, setJ] = useState(B_DEFAULT.pair)
  const [fraction, setFraction] = useState(B_DEFAULT.fraction)
  const pn = useMemo(() => payNet(N), [N])
  const r = useMemo(() => {
    const [s, tt] = pickPair(pn, pick, j)
    return pairReadout(pn, s, tt)
  }, [pn, pick, j])
  const exp = useExperiment()
  useEffect(() => {
    exp.run(pairsJob(pn))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pn])
  const d = exp.data
  const ready = d && d.done && d.n === N && !exp.running
  const rows = useMemo(() => (ready ? successCurves(d.pairs) : null), [ready, d])
  const now = useMemo(() => (ready ? successAt(d.pairs, fraction) : null), [ready, d, fraction])
  const where = r.cutAtSender ? t.where.sender : r.cutAtReceiver ? t.where.receiver : t.where.middle

  return (
    <div>
      <p className="text-xs text-slate-600 leading-snug border-l-2 border-orange-400 pl-3">{t.synthetic}</p>
      <div className="mt-4 max-w-md">
        <Slider label={t.N} min={200} max={2000} step={200} value={N} onChange={(v) => setN(Math.round(v / 200) * 200)} format={(v) => Math.round(v).toLocaleString(t.locale)} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 items-center">
        {['random', 'hubs', 'small'].map((id) => (
          <Pill key={id} active={pick === id} onClick={() => setPick(id)} data-pick={id}>
            {t.picks[id]}
          </Pill>
        ))}
        {pick !== 'hubs' && (
          <Pill onClick={() => setJ((x) => x + 1)} data-action="next">
            {t.next}
          </Pill>
        )}
      </div>
      <p className="mt-2 font-mono text-xs text-slate-600">{t.pair(r.s, r.t, r.degS, r.degT)}</p>
      <div
        className="mt-2 grid grid-cols-2 lg:grid-cols-3 gap-2"
        data-readout="pair"
        data-out={r.out}
        data-widest={r.widest}
        data-maxflow={r.maxFlow}
        data-cut={r.cutSize}
      >
        <Stat label={t.out}>{r.out.toLocaleString(t.locale)}</Stat>
        <Stat label={t.incoming}>{r.incoming.toLocaleString(t.locale)}</Stat>
        <Stat label={t.widest}>{`${r.widest.toLocaleString(t.locale)} (${t.hops(r.widestHops)})`}</Stat>
        <Stat label={t.maxFlow}>
          <span style={{ color: ORANGE_DARK }}>{r.maxFlow.toLocaleString(t.locale)}</span>
        </Stat>
        <Stat label={t.cut} wide>{`${t.cutSize(r.cutSize)}: ${where}`}</Stat>
      </div>

      <div className="mt-6">
        <Eyebrow>{t.payments}</Eyebrow>
        {exp.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(exp.progress * 100)}%`}</p>}
        <div className="mt-2 max-w-md">
          <Slider label={t.fraction} min={0.01} max={1} step={0.01} value={fraction} onChange={(v) => setFraction(Math.round(v * 100) / 100)} format={(v) => num(v, 2)} />
        </div>
        <div
          className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2"
          data-readout="payments"
          data-done={ready ? '1' : '0'}
          data-single={now ? now.single.toFixed(3) : ''}
          data-split={now ? now.split.toFixed(3) : ''}
          data-full={now ? now.full.toFixed(3) : ''}
          data-psingle={now ? now.pSingle.toFixed(3) : ''}
          data-psplit={now ? now.pSplit.toFixed(3) : ''}
          data-curve-single={rows ? rows.map((x) => x.single.toFixed(3)).join(' ') : ''}
          data-curve-split={rows ? rows.map((x) => x.split.toFixed(3)).join(' ') : ''}
          data-curve-full={rows ? rows.map((x) => x.full.toFixed(3)).join(' ') : ''}
        >
          <Stat label={t.single}>{now ? `${pct(now.single)} ${t.success} · ${t.model(pct(now.pSingle))}` : '–'}</Stat>
          <Stat label={t.split}>{now ? `${pct(now.split)} ${t.success} · ${t.model(pct(now.pSplit))} · ${t.parts(num(now.parts, 2))}` : '–'}</Stat>
          <Stat label={t.full}>
            <span style={{ color: ORANGE_DARK }}>{now ? `${pct(now.full)} ${t.success}` : '–'}</span>
          </Stat>
        </div>
        {rows && (
          <div className="mt-4 max-w-xl">
            <Eyebrow>{t.chart}</Eyebrow>
            <Chart
              x={{ min: 0, max: 1, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], label: 'a', format: (v) => num(v, 1) }}
              y={{ min: 0, max: 1, ticks: [0, 0.5, 1], format: (v) => num(v, 1) }}
              height={180}
              aria={t.ariaChart}
              marks={[{ x: fraction, color: MUTED, dashed: true }]}
              series={[
                { points: rows.map((x) => [x.fraction, x.full]), color: ORANGE_DARK, dots: 2, width: 1.8 },
                { points: rows.map((x) => [x.fraction, x.split]), color: INK, dots: 2, width: 1.6 },
                { points: rows.map((x) => [x.fraction, x.single]), color: SLATE, dots: 2, width: 1.6, dashed: true },
              ]}
            />
            <Legend items={[{ label: t.full, color: ORANGE_DARK }, { label: t.split, color: INK }, { label: t.single, color: SLATE, dashed: true }]} />
          </div>
        )}
        <p className="mt-2 text-xs text-slate-500 leading-snug">{t.strategies}</p>
      </div>
    </div>
  )
}
