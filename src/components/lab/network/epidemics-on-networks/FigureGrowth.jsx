import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import { ORANGE_DARK, INK, SLATE, Eyebrow, Pill } from '../ui.jsx'
import Chart from '../charts.jsx'
import { mixingCurve, latticeCurve, ladderCurve, ladderExponent, MIX, LAT, LADDER } from './figures.js'

// Live figure F2, "Exponential or power law?": the cumulative curve of three
// processes, each on semi-log axes (where an exponential is a straight line)
// and on log-log axes (where a power of time is).

const T = {
  en: {
    kinds: { mixing: 'Everyone in contact', lattice: 'Square lattice', ladder: 'Ladder of groups' },
    a: 'Each group is a times larger, a',
    b: 'and is reached b times later, b',
    semi: 'Semi-log: time, log of cases',
    log: 'Log-log: log of time, log of cases',
    time: 'time',
    line: {
      mixing: `SI with everyone in contact, ${MIX.N.toLocaleString('en-US')} people: straight on the semi-log axes until it saturates, so exponential. The dashed line is e^(rt).`,
      lattice: (s) => `SI on a ${LAT.L} × ${LAT.L} lattice from its centre, up to the edge: curved on the semi-log axes, straight on the log-log ones. Fitted slope ${s}; the dashed line has slope 2.`,
      ladder: (e) => `Groups of size a^k reached at times b^k: a power law with a ripple. The dashed line has slope ln a / ln b = ${e}.`,
    },
    ariaSemi: 'Cumulative cases against time, logarithmic vertical axis',
    ariaLog: 'Cumulative cases against time, both axes logarithmic',
    locale: 'en-US',
  },
  it: {
    kinds: { mixing: 'Tutti in contatto', lattice: 'Reticolo quadrato', ladder: 'Scala di gruppi' },
    a: 'Ogni gruppo è a volte più grande, a',
    b: 'ed è raggiunto b volte più tardi, b',
    semi: 'Semilogaritmico: tempo, log dei casi',
    log: 'Log-log: log del tempo, log dei casi',
    time: 'tempo',
    line: {
      mixing: `SI con tutti in contatto, ${MIX.N.toLocaleString('it-IT')} persone: una retta sugli assi semilogaritmici finché non satura, quindi esponenziale. La linea tratteggiata è e^(rt).`,
      lattice: (s) => `SI su un reticolo ${LAT.L} × ${LAT.L} dal centro, fino al bordo: curva sugli assi semilogaritmici, retta su quelli log-log. Pendenza stimata ${s}; la linea tratteggiata ha pendenza 2.`,
      ladder: (e) => `Gruppi di dimensione a^k raggiunti ai tempi b^k: una legge di potenza con un'ondulazione. La linea tratteggiata ha pendenza ln a / ln b = ${e}.`,
    },
    ariaSemi: 'Casi cumulati al variare del tempo, asse verticale logaritmico',
    ariaLog: 'Casi cumulati al variare del tempo, entrambi gli assi logaritmici',
    locale: 'it-IT',
  },
}

// Powers of ten from lo to hi, thinned to at most six.
function decades(lo, hi) {
  const a = Math.ceil(Math.log10(lo) - 1e-9)
  const b = Math.floor(Math.log10(hi) + 1e-9)
  const step = Math.max(1, Math.ceil((b - a + 1) / 6))
  const out = []
  for (let e = a; e <= b; e += step) out.push(10 ** e)
  return out
}

export default function FigureGrowth({ lang = 'en' }) {
  const t = T[lang] || T.en
  const num = (v, d) => v.toLocaleString(t.locale, { minimumFractionDigits: d, maximumFractionDigits: d })
  const [kind, setKind] = useState('mixing')
  const [a, setA] = useState(LADDER.a)
  const [b, setB] = useState(LADDER.b)
  const fixed = useMemo(() => ({ mixing: mixingCurve(), lattice: latticeCurve() }), [])

  const view = useMemo(() => {
    if (kind === 'mixing') {
      const points = fixed.mixing
      return { points, guide: points.filter((p) => Math.exp(MIX.r * p[0]) <= MIX.N * 3).map((p) => [p[0], Math.exp(MIX.r * p[0])]), tMin: 1, tMax: MIX.tMax, yMin: 1, yMax: MIX.N * 3 }
    }
    if (kind === 'lattice') {
      const points = fixed.lattice.points
      const last = points[points.length - 1]
      return { points, guide: points.map((p) => [p[0], last[1] * (p[0] / last[0]) ** 2]), tMin: 1, tMax: last[0], yMin: 1, yMax: last[1] * 2 }
    }
    const points = ladderCurve(a, b)
    const last = points[points.length - 1]
    const e = ladderExponent(a, b)
    return { points, guide: points.map((p) => [p[0], last[1] * (p[0] / last[0]) ** e]), tMin: points[0][0], tMax: last[0], yMin: Math.max(points[0][1], last[1] * 1e-12), yMax: last[1] * 2 }
  }, [kind, a, b, fixed])

  const yMin = 10 ** Math.floor(Math.log10(view.yMin) + 1e-9)
  const yAxis = { min: yMin, max: view.yMax, log: true, ticks: decades(yMin, view.yMax) }
  const linTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * view.tMax)
  const series = [
    { points: view.guide, color: SLATE, width: 1.2, dashed: true },
    { points: view.points, color: kind === 'mixing' ? INK : ORANGE_DARK, width: 1.9 },
  ]
  const e = ladderExponent(a, b)
  const text = kind === 'mixing' ? t.line.mixing : kind === 'lattice' ? t.line.lattice(num(fixed.lattice.slope, 2)) : t.line.ladder(num(e, 2))

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {['mixing', 'lattice', 'ladder'].map((id) => (
          <Pill key={id} active={kind === id} onClick={() => setKind(id)} data-kind={id}>
            {t.kinds[id]}
          </Pill>
        ))}
      </div>
      {kind === 'ladder' && (
        <div className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 max-w-2xl">
          <Slider label={t.a} min={2} max={10} step={0.5} value={a} onChange={(v) => setA(Math.round(v * 2) / 2)} format={(v) => num(v, 1)} />
          <Slider label={t.b} min={1.5} max={4} step={0.1} value={b} onChange={(v) => setB(Math.round(v * 10) / 10)} format={(v) => num(v, 1)} />
        </div>
      )}
      <div className="mt-3 grid gap-4 sm:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.semi}</Eyebrow>
          <Chart x={{ min: 0, max: view.tMax, ticks: linTicks, label: t.time, format: (v) => String(Math.round(v)) }} y={yAxis} height={170} aria={t.ariaSemi} series={series} />
        </div>
        <div className="min-w-0">
          <Eyebrow>{t.log}</Eyebrow>
          <Chart x={{ min: view.tMin, max: view.tMax, log: true, ticks: decades(view.tMin, view.tMax), label: t.time }} y={yAxis} height={170} aria={t.ariaLog} series={series} />
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-700 leading-snug" data-readout="growth" data-kind={kind} data-exponent={e.toFixed(3)} data-slope={fixed.lattice.slope.toFixed(3)} data-edge={fixed.lattice.edge}>
        {text}
      </p>
    </div>
  )
}
