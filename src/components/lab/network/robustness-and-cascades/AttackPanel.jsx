import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, SLATE, MUTED, MONO, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { panelA, valueAt, thin, betweennessJob, robustJob, wiring, paM, A_DEFAULT, A_SIZES, A_RUNS, A_SMALL, A_ATTEMPTS, A_KMIN } from './experiments.js'
import { collapsePoint, layerMatrix } from './robust.js'

// Panel A, "Failures, attacks and onions": one network, nodes removed at
// random or by three kinds of attack, and the largest component as they go;
// then swaps that keep every degree and raise the robustness R.

const BLUE = '#0284c7'

const T = {
  en: {
    sources: { poisson: 'Random network', pa: 'Preferential attachment', power: 'Power law' },
    N: 'Nodes, N',
    meanK: 'Mean degree',
    gamma: 'Exponent γ',
    net: (n, l, k, k2) => `${n} nodes, ${l} links, ⟨k⟩ = ${k}, ⟨k²⟩ = ${k2}`,
    powerNote: `Configuration model with p(k) ∝ k^(−γ) from k = ${A_KMIN}; its mean degree follows from γ.`,
    f: 'Fraction removed, f',
    orders: { random: `At random (mean of ${A_RUNS} orders)`, degree: 'Highest degree, intact network', recomputed: 'Highest degree, recomputed', between: 'Highest betweenness' },
    how: 'Order of removal',
    at: (f) => `largest component at f = ${f}`,
    fc: 'falls below 1% of N at',
    R: 'R',
    formula: 'f_c from the formula',
    formulaNote: 'f_c = 1 − 1/(⟨k²⟩/⟨k⟩ − 1), for random removal, from the degrees of this network. "Falls below 1% of N" is the fraction removed at which the largest component first holds fewer than N/100 nodes. R is the mean of the largest component (as a share of N) over the whole removal.',
    addBetween: 'Add the attack by betweenness',
    betweenNote: `Betweenness is recomputed before every removal up to ${A_SMALL.toLocaleString('en-US')} nodes (some ten seconds); in larger networks the betweenness of the intact network ranks the nodes once.`,
    betweenKind: { true: 'recomputed', false: 'intact network' },
    running: 'Computing…',
    removed: 'fraction removed',
    chart: 'Largest component (share of N) against the fraction removed',
    giant: 'largest component',
    robust: 'Make it robust',
    robustNote: `Two links a–b and c–d are picked at random and replaced by a–d and c–b, so every node keeps its degree; the swap is kept only if R under the attack by recomputed degree rises. ${A_ATTEMPTS.toLocaleString('en-US')} swaps are tried. Up to ${A_SMALL.toLocaleString('en-US')} nodes.`,
    tooBig: `Available up to ${A_SMALL.toLocaleString('en-US')} nodes.`,
    start: 'Make it robust',
    stop: 'Stop',
    tried: (a, b, c) => `${a} of ${b} swaps tried, ${c} kept`,
    before: 'before',
    after: 'after',
    Rattack: 'R under attack (recomputed degree)',
    collapse: 'Below 1% of N at',
    r: 'Assortativity r',
    rho: 'Spearman ρ',
    layered: 'Links between degrees at most 1 apart',
    drawNote: 'Who links to whom, by degree. Each row is a class of nodes by degree; each cell is the percentage of the link ends of that class whose other end is in the class of the column (rows add up to 100). The diagonal, outlined, is a class linked to itself.',
    degree: 'degree',
    ariaChart: 'Share of nodes in the largest component against the fraction of nodes removed, for each order of removal',
    ariaOpt: 'Largest component under attack by recomputed degree, before and after the swaps',
    ariaDraw: (w) => `Share of links between classes of degree, ${w} the swaps`,
    locale: 'en-US',
  },
  it: {
    sources: { poisson: 'Rete casuale', pa: 'Aggancio preferenziale', power: 'Legge di potenza' },
    N: 'Nodi, N',
    meanK: 'Grado medio',
    gamma: 'Esponente γ',
    net: (n, l, k, k2) => `${n} nodi, ${l} collegamenti, ⟨k⟩ = ${k}, ⟨k²⟩ = ${k2}`,
    powerNote: `Modello di configurazione con p(k) ∝ k^(−γ) da k = ${A_KMIN}; il suo grado medio segue da γ.`,
    f: 'Frazione rimossa, f',
    orders: { random: `A caso (media di ${A_RUNS} ordini)`, degree: 'Grado più alto, rete intatta', recomputed: 'Grado più alto, ricalcolato', between: 'Betweenness più alta' },
    how: 'Ordine di rimozione',
    at: (f) => `componente più grande a f = ${f}`,
    fc: "scende sotto l'1% di N a",
    R: 'R',
    formula: 'f_c dalla formula',
    formulaNote: "f_c = 1 − 1/(⟨k²⟩/⟨k⟩ − 1), per la rimozione casuale, dai gradi di questa rete. «Scende sotto l'1% di N» è la frazione rimossa a cui la componente più grande ha per la prima volta meno di N/100 nodi. R è la media della componente più grande (come quota di N) lungo tutta la rimozione.",
    addBetween: "Aggiungi l'attacco per betweenness",
    betweenNote: `La betweenness è ricalcolata prima di ogni rimozione fino a ${A_SMALL.toLocaleString('it-IT')} nodi (una decina di secondi); nelle reti più grandi la betweenness della rete intatta ordina i nodi una volta sola.`,
    betweenKind: { true: 'ricalcolata', false: 'rete intatta' },
    running: 'Calcolo in corso…',
    removed: 'frazione rimossa',
    chart: 'Componente più grande (quota di N) al variare della frazione rimossa',
    giant: 'componente più grande',
    robust: 'Rendila robusta',
    robustNote: `Due collegamenti a–b e c–d sono scelti a caso e sostituiti da a–d e c–b, così ogni nodo conserva il suo grado; lo scambio è tenuto solo se R sotto l'attacco per grado ricalcolato sale. Si provano ${A_ATTEMPTS.toLocaleString('it-IT')} scambi. Fino a ${A_SMALL.toLocaleString('it-IT')} nodi.`,
    tooBig: `Disponibile fino a ${A_SMALL.toLocaleString('it-IT')} nodi.`,
    start: 'Rendila robusta',
    stop: 'Ferma',
    tried: (a, b, c) => `${a} scambi provati su ${b}, ${c} tenuti`,
    before: 'prima',
    after: 'dopo',
    Rattack: 'R sotto attacco (grado ricalcolato)',
    collapse: "Sotto l'1% di N a",
    r: 'Assortatività r',
    rho: 'ρ di Spearman',
    layered: 'Collegamenti tra gradi distanti al più 1',
    drawNote: 'Chi si collega a chi, per grado. Ogni riga è una classe di nodi per grado; ogni cella è la percentuale degli estremi di collegamento di quella classe il cui altro estremo è nella classe della colonna (le righe sommano a 100). La diagonale, bordata, è una classe collegata a sé stessa.',
    degree: 'grado',
    ariaChart: 'Quota di nodi nella componente più grande al variare della frazione di nodi rimossi, per ogni ordine di rimozione',
    ariaOpt: "Componente più grande sotto l'attacco per grado ricalcolato, prima e dopo gli scambi",
    ariaDraw: (w) => `Quota di collegamenti tra classi di grado, ${w} gli scambi`,
    locale: 'it-IT',
  },
}

const COLORS = { random: SLATE, degree: INK, recomputed: ORANGE_DARK, between: BLUE }
const ORDER_IDS = ['random', 'degree', 'recomputed', 'between']

// Who links to whom by degree class: one row per class, each cell the share of
// that class's link ends whose other end is in the column's class.
function Mixing({ m, title, rowLabel, aria, fmt }) {
  const n = m.names.length
  const C = 30
  const L = 34
  const T = 26
  return (
    <div className="min-w-0">
      <p className="font-mono text-xs text-slate-500 mb-1">{title}</p>
      <svg viewBox={`0 0 ${L + n * C + 4} ${T + n * C + 4}`} className="w-full h-auto bg-white border border-slate-200 rounded" style={{ maxWidth: 1.4 * (L + n * C + 4) }} role="img" aria-label={aria}>
        <text x={2} y={10} fontSize="7" fontFamily={MONO} fill={SLATE}>
          {rowLabel}
        </text>
        {m.names.map((name, j) => (
          <text key={`c${j}`} x={L + j * C + C / 2} y={T - 5} textAnchor="middle" fontSize="8" fontFamily={MONO} fill={SLATE}>
            {name}
          </text>
        ))}
        {m.names.map((name, i) => (
          <g key={`r${i}`}>
            <text x={L - 4} y={T + i * C + C / 2 + 3} textAnchor="end" fontSize="8" fontFamily={MONO} fill={SLATE}>
              {name}
            </text>
            {m.share[i].map((v, j) => (
              <g key={j}>
                <rect x={L + j * C} y={T + i * C} width={C - 1} height={C - 1} fill={ORANGE_DARK} opacity={Math.min(1, 0.04 + 1.6 * v)} stroke={i === j ? INK : 'none'} strokeWidth="1" />
                <text x={L + j * C + C / 2} y={T + i * C + C / 2 + 3} textAnchor="middle" fontSize="8" fontFamily={MONO} fill={v > 0.4 ? '#ffffff' : INK}>
                  {fmt(v)}
                </text>
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  )
}

export default function AttackPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const [source, setSource] = useState(A_DEFAULT.source)
  const [sizeIdx, setSizeIdx] = useState(A_SIZES.indexOf(A_DEFAULT.N))
  const [meanKRaw, setMeanK] = useState(A_DEFAULT.meanK)
  const [gamma, setGamma] = useState(A_DEFAULT.gamma)
  const [f, setF] = useState(A_DEFAULT.f)
  const N = A_SIZES[sizeIdx]
  const meanK = source === 'pa' ? 2 * paM(meanKRaw) : meanKRaw
  const key = `${source}-${N}-${source === 'power' ? gamma : meanK}`
  const a = useMemo(() => panelA({ source, N, meanK, gamma }), [source, N, meanK, gamma])

  const bExp = useExperiment()
  const [bKey, setBKey] = useState('')
  const between = bKey === key && bExp.data && bExp.data.done ? bExp.data : null
  const oExp = useExperiment()
  const [oKey, setOKey] = useState('')
  const o = oKey === key ? oExp.data : null
  const w0 = useMemo(() => wiring(a.net), [a])
  const w1 = useMemo(() => (o && o.accepted ? wiring(o.net) : null), [o])
  const m0 = useMemo(() => (o ? layerMatrix(a.net, a.k) : null), [!!o, a]) // eslint-disable-line react-hooks/exhaustive-deps
  const m1 = useMemo(() => (o && !oExp.running ? layerMatrix(o.net, a.k) : null), [o, a, oExp.running])

  const rows = { random: a.random, degree: a.degree, recomputed: a.recomputed, between }
  const shownIds = ORDER_IDS.filter((id) => rows[id])

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {['poisson', 'pa', 'power'].map((id) => (
          <Pill key={id} active={source === id} onClick={() => setSource(id)} data-source={id}>
            {t.sources[id]}
          </Pill>
        ))}
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 max-w-2xl">
        <Slider label={t.N} min={0} max={A_SIZES.length - 1} step={1} value={sizeIdx} onChange={(v) => setSizeIdx(Math.round(v))} format={(v) => A_SIZES[Math.round(v)].toLocaleString(t.locale)} />
        {source === 'power' ? (
          <Slider label={t.gamma} min={2.1} max={3.5} step={0.1} value={gamma} onChange={(v) => setGamma(Math.round(v * 10) / 10)} format={(v) => num(v, 1)} />
        ) : (
          <Slider label={t.meanK} min={2} max={8} step={source === 'pa' ? 2 : 1} value={meanK} onChange={(v) => setMeanK(Math.round(v))} format={(v) => String(Math.round(v))} />
        )}
        <Slider label={t.f} min={0} max={1} step={0.01} value={f} onChange={(v) => setF(Math.round(v * 100) / 100)} format={(v) => num(v, 2)} />
      </div>
      <p className="mt-2 font-mono text-xs text-slate-600" data-readout="network" data-n={N} data-links={a.links} data-mean={a.mean.toFixed(3)} data-mean2={a.mean2.toFixed(2)} data-fc={a.fcTheory.toFixed(3)}>
        {t.net(N.toLocaleString(t.locale), a.links.toLocaleString(t.locale), num(a.mean, 2), num(a.mean2, 1))}
        {source === 'power' ? ` · ${t.powerNote}` : ''}
      </p>

      <div className="mt-4 max-w-xl">
        <Eyebrow>{t.chart}</Eyebrow>
        <Chart
          x={{ min: 0, max: 1, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], label: t.removed, format: (v) => num(v, 1) }}
          y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => num(v, 2) }}
          height={190}
          aria={t.ariaChart}
          marks={[
            { x: a.fcTheory, color: SLATE, label: `f_c ${num(a.fcTheory, 2)}` },
            { x: f, color: MUTED, dashed: true },
          ]}
          series={shownIds.map((id) => ({ points: thin(rows[id].curve), color: COLORS[id], width: 1.7, dashed: id === 'random' }))}
        />
        <Legend items={shownIds.map((id) => ({ label: t.orders[id], color: COLORS[id], dashed: id === 'random' }))} />
      </div>

      <div className="mt-3 overflow-x-auto" data-readout="orders" data-f={f} data-between={between ? '1' : '0'}>
        <table className="w-full text-sm font-mono tabular-nums">
          <thead>
            <tr className="text-xs text-slate-500 text-left">
              <th className="py-1 pr-2 font-normal">{t.how}</th>
              <th className="py-1 pr-2 font-normal">{t.at(num(f, 2))}</th>
              <th className="py-1 pr-2 font-normal">{t.fc}</th>
              <th className="py-1 pr-2 font-normal">{t.R}</th>
            </tr>
          </thead>
          <tbody>
            {shownIds.map((id) => (
              <tr key={id} className="border-t border-slate-200" data-order={id} data-at={valueAt(rows[id].curve, f).toFixed(3)} data-fc={rows[id].fc.toFixed(3)} data-r={rows[id].R.toFixed(3)}>
                <td className="py-1 pr-2 font-sans">
                  <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: COLORS[id] }} />
                  {t.orders[id]}
                  {id === 'between' ? ` (${t.betweenKind[String(between.recompute)]})` : ''}
                </td>
                <td className="py-1 pr-2">{num(valueAt(rows[id].curve, f), 3)}</td>
                <td className="py-1 pr-2">{num(rows[id].fc, 3)}</td>
                <td className="py-1 pr-2">{num(rows[id].R, 3)}</td>
              </tr>
            ))}
            <tr className="border-t border-slate-200 text-slate-500">
              <td className="py-1 pr-2 font-sans">{t.formula}</td>
              <td className="py-1 pr-2" />
              <td className="py-1 pr-2">{num(a.fcTheory, 3)}</td>
              <td className="py-1 pr-2" />
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.formulaNote}</p>
      <div className="mt-3 flex flex-wrap gap-2 items-center">
        <Pill
          primary
          disabled={bExp.running || !!between}
          onClick={() => {
            setBKey(key)
            bExp.run(betweennessJob(a.net))
          }}
          data-action="betweenness"
        >
          {t.addBetween}
        </Pill>
        {bExp.running && bKey === key && <span className="font-mono text-xs text-slate-500">{`${t.running} ${Math.round(bExp.progress * 100)}%`}</span>}
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.betweenNote}</p>

      <div className="mt-6">
        <Eyebrow>{t.robust}</Eyebrow>
        <p className="mt-1 text-xs text-slate-500 leading-snug">{t.robustNote}</p>
        <div className="mt-2 flex flex-wrap gap-2 items-center">
          <Pill
            primary
            disabled={N > A_SMALL || oExp.running}
            onClick={() => {
              setOKey(key)
              oExp.run(robustJob(a.net))
            }}
            data-action="robust"
          >
            {t.start}
          </Pill>
          <Pill disabled={!oExp.running} onClick={() => oExp.cancel()} data-action="stop">
            {t.stop}
          </Pill>
          {N > A_SMALL && <span className="text-xs text-slate-500">{t.tooBig}</span>}
          {o && <span className="font-mono text-xs text-slate-500">{t.tried(o.tried.toLocaleString(t.locale), o.attempts.toLocaleString(t.locale), o.accepted.toLocaleString(t.locale))}</span>}
        </div>
        {o && (
          <div
            className="mt-3"
            data-readout="robust"
            data-done={o.done && !oExp.running ? '1' : '0'}
            data-stopped={!oExp.running ? '1' : '0'}
            data-tried={o.tried}
            data-accepted={o.accepted}
            data-r0={o.R0.toFixed(3)}
            data-r1={o.R.toFixed(3)}
            data-assort={w1 ? `${w0.r.toFixed(3)} ${w1.r.toFixed(3)}` : ''}
            data-rho={w1 ? `${w0.rho.toFixed(3)} ${w1.rho.toFixed(3)}` : ''}
            data-layered={w1 ? `${w0.layered.toFixed(3)} ${w1.layered.toFixed(3)}` : ''}
          >
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              <Stat label={t.Rattack}>
                {num(o.R0, 3)} → <span style={{ color: ORANGE_DARK }}>{num(o.R, 3)}</span>
              </Stat>
              <Stat label={t.collapse}>{`${num(collapsePoint(o.curve0), 3)} → ${num(collapsePoint(o.curve), 3)}`}</Stat>
              <Stat label={t.r}>{`${num(w0.r, 2)} → ${w1 ? num(w1.r, 2) : '–'}`}</Stat>
              <Stat label={t.rho}>{`${num(w0.rho, 2)} → ${w1 ? num(w1.rho, 2) : '–'}`}</Stat>
              <Stat label={t.layered}>{`${num(100 * w0.layered, 1)}% → ${w1 ? `${num(100 * w1.layered, 1)}%` : '–'}`}</Stat>
            </div>
            <div className="mt-4 max-w-xl">
              <Chart
                x={{ min: 0, max: 0.6, ticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6], label: t.removed, format: (v) => num(v, 1) }}
                y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1], format: (v) => num(v, 2) }}
                height={170}
                aria={t.ariaOpt}
                series={[
                  { points: thin(o.curve0, 500), color: INK, width: 1.6 },
                  { points: thin(o.curve, 500), color: ORANGE_DARK, width: 1.8 },
                ]}
              />
              <Legend items={[{ label: t.before, color: INK }, { label: t.after, color: ORANGE_DARK }]} />
            </div>
            {m0 && m1 && (
              <div className="mt-4" data-readout="mixing" data-names={m1.names.join(' ')} data-diag0={m0.share.map((r, i) => r[i].toFixed(3)).join(' ')} data-diag1={m1.share.map((r, i) => r[i].toFixed(3)).join(' ')}>
                <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
                  <Mixing m={m0} title={t.before} rowLabel={t.degree} aria={t.ariaDraw(t.before)} fmt={(v) => String(Math.round(100 * v))} />
                  <Mixing m={m1} title={t.after} rowLabel={t.degree} aria={t.ariaDraw(t.after)} fmt={(v) => String(Math.round(100 * v))} />
                </div>
                <p className="mt-2 text-xs text-slate-500 leading-snug">{t.drawNote}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
