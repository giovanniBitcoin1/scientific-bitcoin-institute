import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, Eyebrow, Pill } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { netsB, spreadJob, B_DEFAULT, B_NETS, B_N, B_L, B_RUNS, MEAN_K } from './experiments.js'

// Panel B, "Hubs first": SI or SIR in discrete time on a random network, on
// preferential attachment with the same mean degree and on a square lattice
// of the same size.

const BLUE = '#0284c7'
const COLOR = { poisson: INK, pa: ORANGE_DARK, lattice: BLUE }

const T = {
  en: {
    models: { si: 'SI: no recovery', sir: 'SIR: infectious for d steps' },
    beta: 'Infection probability per link per step, β',
    d: 'Infectious for d steps',
    nets: { poisson: 'Random network', pa: 'Preferential attachment', lattice: 'Square lattice' },
    note: `Three networks of ${B_N.toLocaleString('en-US')} nodes: a random one and one grown by preferential attachment, both with mean degree ${MEAN_K}, and a ${B_L} × ${B_L} lattice. At every step each infectious node infects each susceptible neighbour with probability β. ${B_RUNS} runs on each: from random nodes of the largest component on the two networks, from the centre of the lattice. The curves are the mean share of nodes infected so far.`,
    sirNote: (T, l) => `A node infectious for d steps passes the infection along a link with probability T = 1 − (1 − β)^d = ${T}. Some runs die out early; only the large ones (more than 1% of N) are averaged: ${l}.`,
    largeOf: (id, n) => `${id} ${n} of ${B_RUNS}`,
    running: 'Computing…',
    semi: 'Infected so far: time, log of the share',
    log: 'Infected so far: log of time, log of the share',
    degree: 'Mean degree of the nodes infected at each step',
    time: 'step',
    table: { net: 'Network', t1: 'steps to 1%', t10: 'to 10%', t50: 'to 50%', final: 'final share', kk: '⟨k²⟩/⟨k⟩' },
    slope: (s, e) => `Lattice: log-log slope ${s}, fitted from a quarter of the way to the edge up to the step at which the infection reaches it (${e}).`,
    ariaSemi: 'Share of nodes infected so far against time on a logarithmic vertical axis, for the three networks',
    ariaLog: 'Share of nodes infected so far against time on logarithmic axes, for the three networks',
    ariaDegree: 'Mean degree of the newly infected nodes against time, for the three networks',
    locale: 'en-US',
  },
  it: {
    models: { si: 'SI: nessuna guarigione', sir: 'SIR: contagiosi per d passi' },
    beta: 'Probabilità di infezione per collegamento per passo, β',
    d: 'Contagiosi per d passi',
    nets: { poisson: 'Rete casuale', pa: 'Aggancio preferenziale', lattice: 'Reticolo quadrato' },
    note: `Tre reti di ${B_N.toLocaleString('it-IT')} nodi: una casuale e una cresciuta per aggancio preferenziale, entrambe con grado medio ${MEAN_K}, e un reticolo ${B_L} × ${B_L}. A ogni passo ogni nodo contagioso infetta ciascun vicino suscettibile con probabilità β. ${B_RUNS} simulazioni su ciascuna: da nodi a caso della componente più grande nelle due reti, dal centro del reticolo. Le curve sono la quota media di nodi infettati fino a quel momento.`,
    sirNote: (T, l) => `Un nodo contagioso per d passi trasmette l'infezione lungo un collegamento con probabilità T = 1 − (1 − β)^d = ${T}. Alcune simulazioni si spengono subito; si fa la media solo di quelle grandi (più dell'1% di N): ${l}.`,
    largeOf: (id, n) => `${id} ${n} su ${B_RUNS}`,
    running: 'Calcolo in corso…',
    semi: 'Infettati finora: tempo, log della quota',
    log: 'Infettati finora: log del tempo, log della quota',
    degree: 'Grado medio dei nodi infettati a ogni passo',
    time: 'passo',
    table: { net: 'Rete', t1: "passi fino all'1%", t10: 'al 10%', t50: 'al 50%', final: 'quota finale', kk: '⟨k²⟩/⟨k⟩' },
    slope: (s, e) => `Reticolo: pendenza log-log ${s}, stimata da un quarto del percorso verso il bordo fino al passo in cui l'infezione lo raggiunge (${e}).`,
    ariaSemi: 'Quota di nodi infettati finora al variare del tempo su asse verticale logaritmico, per le tre reti',
    ariaLog: 'Quota di nodi infettati finora al variare del tempo su assi logaritmici, per le tre reti',
    ariaDegree: 'Grado medio dei nodi appena infettati al variare del tempo, per le tre reti',
    locale: 'it-IT',
  },
}

const niceMax = (v) => {
  const step = v > 200 ? 100 : v > 80 ? 40 : v > 40 ? 20 : 10
  return Math.ceil(v / step) * step
}

export default function HubsFirstPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const [model, setModel] = useState(B_DEFAULT.model)
  const [beta, setBeta] = useState(B_DEFAULT.beta)
  const [d, setD] = useState(B_DEFAULT.d)
  const nets = useMemo(() => netsB(), [])
  const exp = useExperiment()
  useEffect(() => {
    exp.run(spreadJob(nets, { model, beta, d }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, beta, d])
  const data = exp.data && exp.data.done && exp.data.model === model && exp.data.beta === beta && (model === 'si' || exp.data.d === d) ? exp.data : null
  const done = data && !exp.running
  const r = data ? data.nets : null
  const ids = r ? B_NETS.filter((id) => r[id].large > 0) : []
  const fast = r ? niceMax(Math.max(10, ...['poisson', 'pa'].map((id) => r[id].steps))) : 10
  const all = r ? Math.max(10, ...ids.map((id) => r[id].steps)) : 10
  const kTop = r ? Math.ceil(Math.max(8, ...ids.flatMap((id) => r[id].newK.map((p) => p[1]))) / 4) * 4 : 8
  const logTicks = [1, 10, 100, 1000].filter((v) => v <= all)
  const curve = (id) => ({ points: r[id].curve.filter((p) => p[1] > 0), color: COLOR[id], width: 1.8 })
  const legend = ids.map((id) => ({ label: t.nets[id], color: COLOR[id] }))
  const yLog = { min: 1 / B_N, max: 1, log: true, ticks: [1e-4, 1e-3, 1e-2, 1e-1, 1] }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {['si', 'sir'].map((id) => (
          <Pill key={id} active={model === id} onClick={() => setModel(id)} data-model={id}>
            {t.models[id]}
          </Pill>
        ))}
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 max-w-2xl">
        <Slider label={t.beta} min={0.05} max={0.5} step={0.05} value={beta} onChange={(v) => setBeta(Math.round(v * 20) / 20)} format={(v) => num(v, 2)} />
        {model === 'sir' && <Slider label={t.d} min={1} max={10} step={1} value={d} onChange={(v) => setD(Math.round(v))} />}
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.note}</p>
      {model === 'sir' && data && <p className="mt-1 text-xs text-slate-500 leading-snug">{t.sirNote(num(data.T, 3), B_NETS.map((id) => t.largeOf(t.nets[id].toLowerCase(), r[id].large)).join(', '))}</p>}
      {exp.running && <p className="mt-1 font-mono text-xs text-slate-500">{`${t.running} ${Math.round(exp.progress * 100)}%`}</p>}

      {r && (
        <>
          <div className="mt-3 overflow-x-auto" data-readout="spread" data-done={done ? '1' : '0'} data-model={model} data-t={data.T.toFixed(4)} data-slope={r.lattice.slope ? r.lattice.slope.toFixed(3) : ''}>
            <table className="w-full text-sm font-mono tabular-nums">
              <thead>
                <tr className="text-xs text-slate-500 text-left">
                  <th className="py-1 pr-2 font-normal">{t.table.net}</th>
                  <th className="py-1 pr-2 font-normal">{t.table.kk}</th>
                  <th className="py-1 pr-2 font-normal">{t.table.t1}</th>
                  <th className="py-1 pr-2 font-normal">{t.table.t10}</th>
                  <th className="py-1 pr-2 font-normal">{t.table.t50}</th>
                  <th className="py-1 pr-2 font-normal">{t.table.final}</th>
                </tr>
              </thead>
              <tbody>
                {B_NETS.map((id) => (
                  <tr key={id} className="border-t border-slate-200" data-net={id} data-large={r[id].large} data-times={r[id].times.map((x) => (Number.isFinite(x) ? x.toFixed(1) : '-')).join(' ')} data-final={r[id].final.toFixed(3)} data-k1={r[id].newK.length ? r[id].newK[0][1].toFixed(1) : ''}>
                    <td className="py-1 pr-2 font-sans">
                      <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ background: COLOR[id] }} />
                      {t.nets[id]}
                    </td>
                    <td className="py-1 pr-2">{num(nets[id].mean2 / nets[id].mean, 2)}</td>
                    {r[id].times.map((x, i) => (
                      <td key={i} className="py-1 pr-2">
                        {num(x, 1)}
                      </td>
                    ))}
                    <td className="py-1 pr-2">{num(r[id].final, 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {r.lattice.slope ? <p className="mt-1 text-xs text-slate-500 leading-snug">{t.slope(num(r.lattice.slope, 2), num(r.lattice.edge, 0))}</p> : null}

          <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
            <div className="min-w-0">
              <Eyebrow>{t.semi}</Eyebrow>
              <Chart x={{ min: 0, max: fast, ticks: [0, fast / 2, fast], label: t.time }} y={yLog} height={190} aria={t.ariaSemi} series={ids.map(curve)} />
              <Legend items={legend} />
            </div>
            <div className="min-w-0">
              <Eyebrow>{t.log}</Eyebrow>
              <Chart x={{ min: 1, max: all, log: true, ticks: logTicks, label: t.time }} y={yLog} height={190} aria={t.ariaLog} series={ids.map(curve)} />
            </div>
            <div className="min-w-0">
              <Eyebrow>{t.degree}</Eyebrow>
              <Chart
                x={{ min: 1, max: all, log: true, ticks: logTicks, label: t.time }}
                y={{ min: 0, max: kTop, ticks: [0, kTop / 2, kTop] }}
                height={190}
                aria={t.ariaDegree}
                series={ids.map((id) => ({ points: r[id].newK, color: COLOR[id], width: 1.6 }))}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
