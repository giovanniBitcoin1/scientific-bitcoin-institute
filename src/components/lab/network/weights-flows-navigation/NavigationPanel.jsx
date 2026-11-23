import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, SLATE, MUTED, GRID, Eyebrow, Pill, Stat } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { panelC, sweepAlphaJob, sweepLJob, C_DEFAULT, C_PAIRS, C_SWEEP_PAIRS, C_SIZES, C_DRAW_MAX } from './experiments.js'

// Panel C, "Find your way": Kleinberg's lattice. An L × L torus, four lattice
// neighbours and one long-range contact per node, drawn with probability
// ∝ r^(−α). Greedy routing over 200 random pairs, the drawing of one route for
// L ≤ 40, and two sweeps on buttons. Plain SVG, no pointer handlers.

const T = {
  en: {
    L: 'Side of the lattice, L',
    alpha: 'Exponent α of the long-range links',
    model: (n) => `${n} nodes on a torus. Every node knows its four neighbours on the grid and one long-range contact, at distance r with probability ∝ r^(−α). The holder of the message passes it to whichever of its five contacts is closest to the target.`,
    mean: `Mean steps, ${C_PAIRS} random pairs`,
    median: 'Median steps',
    lattice: 'Mean distance on the grid alone',
    route: (steps, d, jumps) => `One route: ${steps} steps for a distance of ${d} on the grid; ${jumps} of them along long-range links (orange).`,
    noRoute: `The drawing of a route appears for L up to ${C_DRAW_MAX}.`,
    sweepA: 'Sweep α',
    sweepANote: (L) => `α from 0 to 4 at L = ${L}, ${C_SWEEP_PAIRS.toLocaleString('en-US')} pairs per value.`,
    sweepL: 'Sweep L',
    sweepLNote: `L = ${C_SIZES.join(', ')} for α = 0, 1.5, 2 and 2.5, ${C_SWEEP_PAIRS.toLocaleString('en-US')} pairs per point; the slope is fitted on log axes.`,
    chartA: (L) => `Mean steps against α, L = ${L}`,
    chartL: 'Mean steps against L',
    best: (a) => `lowest at α = ${a}`,
    slope: (a, s) => `α = ${a}: slope ${s}`,
    running: 'Computing…',
    ariaRoute: 'The lattice with one greedy route from the start to the target',
    ariaA: 'Mean number of steps of greedy routing against the exponent α',
    ariaL: 'Mean number of steps against the side of the lattice on logarithmic axes, for four exponents',
    locale: 'en-US',
  },
  it: {
    L: 'Lato del reticolo, L',
    alpha: 'Esponente α dei collegamenti a lungo raggio',
    model: (n) => `${n} nodi su un toro. Ogni nodo conosce i suoi quattro vicini sulla griglia e un contatto a lungo raggio, a distanza r con probabilità ∝ r^(−α). Chi ha il messaggio lo passa a quello dei suoi cinque contatti che è più vicino al bersaglio.`,
    mean: `Passi in media, ${C_PAIRS} coppie a caso`,
    median: 'Mediana dei passi',
    lattice: 'Distanza media sulla sola griglia',
    route: (steps, d, jumps) => `Un percorso: ${steps} passi per una distanza di ${d} sulla griglia; ${jumps} lungo collegamenti a lungo raggio (arancione).`,
    noRoute: `Il disegno di un percorso compare per L fino a ${C_DRAW_MAX}.`,
    sweepA: 'Scorri α',
    sweepANote: (L) => `α da 0 a 4 con L = ${L}, ${C_SWEEP_PAIRS.toLocaleString('it-IT')} coppie per valore.`,
    sweepL: 'Scorri L',
    sweepLNote: `L = ${C_SIZES.join(', ')} per α = 0, 1,5, 2 e 2,5, ${C_SWEEP_PAIRS.toLocaleString('it-IT')} coppie per punto; la pendenza è adattata su assi logaritmici.`,
    chartA: (L) => `Passi in media al variare di α, L = ${L}`,
    chartL: 'Passi in media al variare di L',
    best: (a) => `minimo ad α = ${a}`,
    slope: (a, s) => `α = ${a}: pendenza ${s}`,
    running: 'Calcolo in corso…',
    ariaRoute: 'Il reticolo con un percorso greedy dalla partenza al bersaglio',
    ariaA: "Numero medio di passi dell'instradamento greedy al variare dell'esponente α",
    ariaL: 'Numero medio di passi al variare del lato del reticolo su assi logaritmici, per quattro esponenti',
    locale: 'it-IT',
  },
}

const CURVE_COLORS = [SLATE, ORANGE_DARK, INK, '#0284c7']
const SIZE = 300

function RouteDrawing({ L, route, aria }) {
  const u = SIZE / L
  const cx = (i) => ((i % L) + 0.5) * u
  const cy = (i) => (Math.floor(i / L) + 0.5) * u
  const short = (d) => (d > L / 2 ? d - L : d < -L / 2 ? d + L : d)
  const segs = []
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1]
    const b = route[i]
    const dx = short((b % L) - (a % L)) * u
    const dy = short(Math.floor(b / L) - Math.floor(a / L)) * u
    const long = Math.abs(dx) + Math.abs(dy) > u * 1.01
    // drawn from both ends, so a step across the edge of the torus shows on both sides
    segs.push({ x1: cx(a), y1: cy(a), x2: cx(a) + dx, y2: cy(a) + dy, long })
    if (Math.abs(cx(a) + dx - cx(b)) > 0.01 || Math.abs(cy(a) + dy - cy(b)) > 0.01) segs.push({ x1: cx(b) - dx, y1: cy(b) - dy, x2: cx(b), y2: cy(b), long })
  }
  const lines = Array.from({ length: L + 1 }, (_, i) => i * u)
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto max-w-xs bg-white border border-slate-200 rounded" role="img" aria-label={aria}>
      {L <= 40 && lines.map((p) => <line key={`v${p}`} x1={p} x2={p} y1={0} y2={SIZE} stroke={GRID} strokeWidth="0.5" />)}
      {L <= 40 && lines.map((p) => <line key={`h${p}`} y1={p} y2={p} x1={0} x2={SIZE} stroke={GRID} strokeWidth="0.5" />)}
      {segs.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={s.long ? ORANGE_DARK : INK} strokeWidth={s.long ? 1.6 : 2.2} strokeLinecap="round" strokeDasharray={s.long ? '4 3' : undefined} />
      ))}
      <circle cx={cx(route[0])} cy={cy(route[0])} r={5} fill={INK} />
      <circle cx={cx(route[route.length - 1])} cy={cy(route[route.length - 1])} r={5} fill="#ffffff" stroke={ORANGE_DARK} strokeWidth="2.5" />
    </svg>
  )
}

export default function NavigationPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => (Number.isFinite(v) ? v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d }) : '–')
  const [L, setL] = useState(C_DEFAULT.L)
  const [alpha, setAlpha] = useState(C_DEFAULT.alpha)
  const r = useMemo(() => panelC({ L, alpha }), [L, alpha])
  const sa = useExperiment()
  const sl = useExperiment()
  const A = sa.data
  const S = sl.data
  const aMax = A && A.rows.length ? Math.max(...A.rows.map((x) => x.mean)) : 1
  const aTop = Math.ceil(aMax / 10) * 10
  const sTop = S ? Math.max(100, ...S.curves.flatMap((c) => c.points.map((p) => p[1]))) : 100

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label={t.L} min={20} max={400} step={20} value={L} onChange={(v) => setL(Math.round(v / 20) * 20)} format={(v) => String(v)} />
        <Slider label={t.alpha} min={0} max={4} step={0.25} value={alpha} onChange={(v) => setAlpha(Math.round(v * 4) / 4)} format={(v) => num(v, 2)} />
      </div>
      <p className="mt-1 text-xs text-slate-500 leading-snug">{t.model((L * L).toLocaleString(t.locale))}</p>

      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0 grid grid-cols-2 gap-2 content-start" data-readout="navigate" data-mean={r.mean.toFixed(1)} data-median={r.median} data-lattice={r.lattice.toFixed(1)} data-route={r.route.length ? `${r.route.length - 1} ${r.routeLattice} ${r.jumps}` : ''}>
          <Stat label={t.mean}>
            <span style={{ color: ORANGE_DARK }}>{num(r.mean, 1)}</span>
          </Stat>
          <Stat label={t.median}>{num(r.median, r.median % 1 ? 1 : 0)}</Stat>
          <Stat label={t.lattice} wide>
            {num(r.lattice, 1)}
          </Stat>
        </div>
        <div className="min-w-0">
          {r.route.length ? (
            <>
              <RouteDrawing L={L} route={r.route} aria={t.ariaRoute} />
              <p className="mt-1 text-xs text-slate-500 leading-snug">{t.route(r.route.length - 1, r.routeLattice, r.jumps)}</p>
            </>
          ) : (
            <p className="text-xs text-slate-500 leading-snug">{t.noRoute}</p>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Pill primary onClick={() => sa.run(sweepAlphaJob(L))} disabled={sa.running} data-action="sweep-alpha" className="normal-case">
              {sa.running ? `${t.running} ${Math.round(sa.progress * 100)}%` : t.sweepA}
            </Pill>
            <p className="text-xs text-slate-500 leading-snug">{t.sweepANote(L)}</p>
          </div>
          {A && A.rows.length > 0 && (
            <div className="mt-2" data-readout="sweep-alpha" data-done={A.done && !sa.running ? '1' : '0'} data-l={A.L} data-best={A.best} data-means={A.rows.map((x) => x.mean.toFixed(1)).join(' ')}>
              <Eyebrow>{t.chartA(A.L)}</Eyebrow>
              <Chart
                x={{ min: 0, max: 4, ticks: [0, 1, 2, 3, 4], label: 'α' }}
                y={{ min: 0, max: aTop, ticks: [0, aTop / 2, aTop], labelSide: 'left' }}
                height={170}
                aria={t.ariaA}
                marks={A.done ? [{ x: A.best, color: MUTED, dashed: true, label: t.best(num(A.best, 2)) }] : []}
                series={[{ points: A.rows.map((x) => [x.alpha, x.mean]), color: ORANGE_DARK, dots: 2, width: 1.8 }]}
              />
              <p className="mt-1 font-mono text-xs text-slate-600 leading-relaxed tabular-nums">
                {A.rows.map((x) => `α ${num(x.alpha, 2)}: ${num(x.mean, 1)}`).join(' · ')}
              </p>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Pill primary onClick={() => sl.run(sweepLJob())} disabled={sl.running} data-action="sweep-l" className="normal-case">
              {sl.running ? `${t.running} ${Math.round(sl.progress * 100)}%` : t.sweepL}
            </Pill>
            <p className="text-xs text-slate-500 leading-snug">{t.sweepLNote}</p>
          </div>
          {S && S.curves[0].points.length > 0 && (
            <div className="mt-2" data-readout="sweep-l" data-done={S.done && !sl.running ? '1' : '0'} data-slopes={S.curves.map((c) => (Number.isFinite(c.slope) ? c.slope.toFixed(2) : '')).join(' ')}>
              <Eyebrow>{t.chartL}</Eyebrow>
              <Chart
                x={{ min: 10, max: 1000, log: true, ticks: [10, 100, 1000], label: 'L' }}
                y={{ min: 1, max: sTop > 100 ? 1000 : 100, log: true, ticks: sTop > 100 ? [1, 10, 100, 1000] : [1, 10, 100], labelSide: 'left' }}
                height={170}
                aria={t.ariaL}
                series={S.curves.map((c, i) => ({ points: c.points, color: CURVE_COLORS[i], dots: 2, width: 1.6, dashed: i === 0 }))}
              />
              <Legend items={S.curves.map((c, i) => ({ label: t.slope(num(c.alpha, c.alpha % 1 ? 1 : 0), num(c.slope, 2)), color: CURVE_COLORS[i], dashed: i === 0 }))} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

