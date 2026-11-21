import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, INK, MUTED, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import NetCanvas from '../NetCanvas.jsx'
import { MECHANISMS, offsetDistribution, priceDistribution } from './growth.js'
import { mechanism, MECH_DEFAULT } from './experiments.js'

// Panel B, "Who needs to know the degrees?": six ways to grow a network, of
// which only the first computes degrees. For each, the degree CCDF against
// the linear model, the biggest hub, ⟨k²⟩/⟨k⟩ and the kernel exponent measured
// as in Panel C over the last fifth of the growth.

const T = {
  en: {
    names: {
      linear: 'Preferential attachment',
      uniform: 'Uniform attachment',
      linkSelection: 'Link selection',
      copying: 'Copying',
      walk: 'Random walk',
      optimisation: 'Optimisation',
    },
    how: {
      linear: 'Reference: each new node links to m nodes chosen in proportion to their degree.',
      uniform: 'Each new node links to m nodes chosen at random, whatever their degree.',
      linkSelection: 'Pick a link at random and attach to one of its two ends. Nobody looks at a degree.',
      copying: 'Directed. Pick a node at random; with probability p link to it, otherwise link to one of the nodes it links to. Degrees shown: links received.',
      walk: 'Start at a random node and take ℓ steps along the links; attach where the walk stops. ℓ = 0 is uniform attachment.',
      optimisation: 'Each new node, at a random point of the square, links to the node that minimises δ × distance + hops to the root (m = 1).',
    },
    N: 'Nodes, N',
    p: 'Copying: probability p of linking to the node picked',
    steps: 'Steps of the walk, ℓ',
    delta: 'Weight of distance, δ',
    optCap: (n) => `The optimisation model grows ${n} nodes: every new node is compared with all the others.`,
    ccdf: (copy) => (copy ? 'In-degrees, CCDF' : 'Degrees, CCDF'),
    ref: 'linear model, same m',
    price: "Price's model, a = mp/(1 − p)",
    max: 'Largest degree',
    share: 'Share of nodes linked to it',
    ratio: '⟨k²⟩/⟨k⟩',
    kernel: 'Kernel exponent, last fifth',
    theory: 'Exponent in theory, (2 − p)/(1 − p)',
    measured: (k) => `Module 05 recipe (from q = ${k})`,
    whyLow: (a) =>
      `Why they differ: the rate is proportional to q + a with a = mp/(1 − p) = ${a}. The power law holds only for q much larger than a; at moderate q the offset bends the curve, and the recipe fits what it sees.`,
    map: 'The map: nodes at their positions, the root dark',
    ariaCcdf: 'Degree distribution of the chosen mechanism against the linear model, on logarithmic axes',
    ariaMap: 'The optimisation network drawn on the unit square',
    locale: 'en-US',
  },
  it: {
    names: {
      linear: 'Aggancio preferenziale',
      uniform: 'Aggancio uniforme',
      linkSelection: 'Selezione di un collegamento',
      copying: 'Copia',
      walk: 'Passeggiata aleatoria',
      optimisation: 'Ottimizzazione',
    },
    how: {
      linear: 'Riferimento: ogni nodo nuovo si collega a m nodi scelti in proporzione al loro grado.',
      uniform: 'Ogni nodo nuovo si collega a m nodi scelti a caso, qualunque sia il loro grado.',
      linkSelection: 'Scegli un collegamento a caso e attaccati a uno dei suoi due estremi. Nessuno guarda un grado.',
      copying: 'Orientata. Scegli un nodo a caso; con probabilità p collegati a lui, altrimenti a uno dei nodi a cui lui è collegato. Gradi mostrati: collegamenti ricevuti.',
      walk: 'Parti da un nodo a caso e fai ℓ passi lungo i collegamenti; attaccati dove la passeggiata si ferma. ℓ = 0 è l\'aggancio uniforme.',
      optimisation: 'Ogni nodo nuovo, in un punto a caso del quadrato, si collega al nodo che rende minimo δ × distanza + passi fino alla radice (m = 1).',
    },
    N: 'Nodi, N',
    p: 'Copia: probabilità p di collegarsi al nodo scelto',
    steps: 'Passi della passeggiata, ℓ',
    delta: 'Peso della distanza, δ',
    optCap: (n) => `Il modello di ottimizzazione fa crescere ${n} nodi: ogni nodo nuovo viene confrontato con tutti gli altri.`,
    ccdf: (copy) => (copy ? 'Gradi in entrata, CCDF' : 'Gradi, CCDF'),
    ref: 'modello lineare, stesso m',
    price: 'modello di Price, a = mp/(1 − p)',
    max: 'Grado massimo',
    share: 'Quota di nodi collegati a lui',
    ratio: '⟨k²⟩/⟨k⟩',
    kernel: "Esponente del kernel, ultimo quinto",
    theory: 'Esponente in teoria, (2 − p)/(1 − p)',
    measured: (k) => `Ricetta del modulo 05 (da q = ${k})`,
    whyLow: (a) =>
      `Perché differiscono: il tasso è proporzionale a q + a con a = mp/(1 − p) = ${a}. La legge di potenza vale solo per q molto più grande di a; per q moderati lo scostamento piega la curva, e la ricetta adatta ciò che vede.`,
    map: 'La mappa: i nodi nelle loro posizioni, la radice scura',
    ariaCcdf: 'Distribuzione dei gradi del meccanismo scelto confrontata con il modello lineare, su assi logaritmici',
    ariaMap: 'La rete di ottimizzazione disegnata sul quadrato unitario',
    locale: 'it-IT',
  },
}

const decadeTicks = (max) => {
  const out = []
  for (let v = 1; v <= max * 1.0001; v *= 10) out.push(v)
  return out
}
const ccdfOf = (P, from) => {
  const out = []
  let above = 0
  for (let k = P.length - 1; k >= from; k--) {
    above += P[k]
    out.push([k, above])
  }
  return out.reverse()
}

export default function MechanismPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [id, setId] = useState('linear')
  const [N, setN] = useState(MECH_DEFAULT.N)
  const [p, setP] = useState(MECH_DEFAULT.p)
  const [steps, setSteps] = useState(MECH_DEFAULT.steps)
  const [delta, setDelta] = useState(MECH_DEFAULT.delta)
  const int = (v) => Math.round(v).toLocaleString(t.locale)
  const dec = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')

  const optN = Math.min(N, MECH_DEFAULT.optN)
  const r = useMemo(() => mechanism(id, { N, p, steps, delta, optN }), [id, N, p, steps, delta, optN])
  const copy = id === 'copying'
  const m = id === 'optimisation' ? 1 : MECH_DEFAULT.m
  const kMax = 10 ** Math.ceil(Math.log10(Math.max(10, r.max)))
  const yMin = 10 ** -Math.ceil(Math.log10(r.N))
  const ref = useMemo(() => {
    // the linear model's degree CCDF (shifted to in-degrees for copying: q = k − m)
    const P = offsetDistribution(m, 0, 40000)
    const pts = ccdfOf(P, m).filter((x) => x[1] > 1e-7)
    if (!copy) return pts
    const shifted = pts.map(([k, v]) => [k - m, v]).filter((x) => x[0] >= 1)
    return shifted.map(([q, v]) => [q, v / shifted[0][1]])
  }, [m, copy])
  const price = useMemo(() => {
    if (!copy || p === 0) return []
    const Pq = priceDistribution(m, (m * p) / (1 - p), 40000)
    return ccdfOf(Pq, 1)
      .map(([q, v]) => [q, v / (1 - Pq[0])])
      .filter((x) => x[1] > 1e-7)
  }, [copy, p, m])
  // copying: the CCDF of in-degrees ≥ 1, so that it starts at 1 like the curves above
  const shown = copy ? r.ccdf.map(([q, v]) => [q, v / r.ccdf[0][1]]) : r.ccdf
  const map = useMemo(() => {
    if (id !== 'optimisation') return null
    const pos = new Float64Array(2 * r.N)
    for (let v = 0; v < r.N; v++) {
      pos[2 * v] = r.net.x[v]
      pos[2 * v + 1] = r.net.y[v]
    }
    const links = Array.from(r.net.A, (a, e) => ({ a, b: r.net.B[e], color: 'rgba(100, 116, 139, 0.35)', width: 0.7 }))
    const nodes = [{ i: 0, r: 4, fill: INK }]
    return { pos, links, nodes }
  }, [id, r])

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {MECHANISMS.map((x) => (
          <Pill key={x} active={x === id} onClick={() => setId(x)} data-mechanism={x}>
            {t.names[x]}
          </Pill>
        ))}
      </div>
      <p className="mt-2 text-sm text-slate-600 leading-snug">{t.how[id]}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <Slider label={t.N} min={1000} max={20000} log value={N} onChange={(v) => setN(Math.round(v / 500) * 500)} format={(v) => int(v)} />
        {id === 'copying' && <Slider label={t.p} min={0} max={0.95} step={0.05} value={p} onChange={(v) => setP(Math.round(v * 100) / 100)} format={(v) => dec(v, 2)} />}
        {id === 'walk' && <Slider label={t.steps} min={0} max={6} step={1} value={steps} onChange={setSteps} />}
        {id === 'optimisation' && <Slider label={t.delta} min={0.1} max={1000} log value={delta} onChange={(v) => setDelta(Number(v.toPrecision(2)))} format={(v) => dec(v, v < 1 ? 2 : v < 10 ? 1 : 0)} />}
      </div>
      {id === 'optimisation' && N > MECH_DEFAULT.optN && <p className="mt-1 text-xs text-slate-500">{t.optCap(int(MECH_DEFAULT.optN))}</p>}

      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.ccdf(copy)}</Eyebrow>
          <Chart
            x={{ min: 1, max: kMax, log: true, ticks: decadeTicks(kMax), label: copy ? 'q' : 'k' }}
            y={{ min: yMin, max: 1, log: true, ticks: decadeTicks(1 / yMin).map((v) => 1 / v).reverse(), label: copy ? 'P(Q ≥ q)' : 'P(K ≥ k)', labelSide: 'left' }}
            height={180}
            aria={t.ariaCcdf}
            series={[
              { points: ref, color: MUTED, dashed: true, width: 1.3 },
              ...(price.length ? [{ points: price, color: INK, dashed: true, width: 1.2 }] : []),
              { points: shown, color: ORANGE_DARK, dots: 1.7, line: false },
            ]}
          />
          <Legend items={[{ label: t.ref, color: MUTED, dashed: true }, ...(price.length ? [{ label: t.price, color: INK, dashed: true }] : []), { label: t.names[id], color: ORANGE_DARK }]} />
          {map && (
            <div className="mt-4">
              <Eyebrow>{t.map}</Eyebrow>
              <div className="mt-2">
                <NetCanvas pos={map.pos} nodes={map.nodes} links={map.links} aria={t.ariaMap} maxHeight={300} ratio={1} />
              </div>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="grid grid-cols-2 gap-2" data-readout="mechanism" data-id={id} data-max={r.max} data-share={r.share.toFixed(4)} data-ratio={r.ratio.toFixed(2)} data-kernel={r.kernel.alpha.toFixed(3)}>
            <Stat label={t.max}>{int(r.max)}</Stat>
            <Stat label={t.share}>{dec(100 * r.share, 1)}%</Stat>
            <Stat label={t.ratio}>{dec(r.ratio, 1)}</Stat>
            <Stat label={t.kernel}>
              {Number.isFinite(r.kernel.alpha) ? `${dec(r.kernel.alpha, 2)} ± ${dec(r.kernel.se, 2)}` : '–'}
            </Stat>
            {r.tail && (
              <>
                <Stat label={t.theory}>{r.tail.theory > 50 ? '–' : dec(r.tail.theory, 2)}</Stat>
                <Stat label={t.measured(r.tail.fit ? r.tail.fit.kMin : '–')}>{r.tail.fit ? `${dec(r.tail.fit.gamma, 2)} ± ${dec(r.tail.fit.se, 2)}` : '–'}</Stat>
              </>
            )}
          </div>
          {r.tail && <p className="mt-2 text-xs text-slate-500 leading-snug">{t.whyLow(dec(r.tail.a, 2))}</p>}
        </div>
      </div>
    </div>
  )
}
