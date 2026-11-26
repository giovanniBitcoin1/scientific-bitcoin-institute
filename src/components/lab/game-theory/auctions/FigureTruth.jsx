import { useRef, useState } from 'react'
import Slider from '../../Slider.jsx'
import DrawToggle, { canEdit, drawCanvasClass } from '../../DrawToggle.jsx'
import { Pill, INK, SLATE, ORANGE_DARK } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import { payoffF1 } from './auctions.js'
import { num } from './fmt.js'

// Live figure F1, "Why the truth is safe": your payoff against your bid b
// (0 to 100) for your value v and the highest of the other bids h, under the
// second price (you pay h) or the first price (you pay b). A tie is a point
// at half. h moves with its slider, by dragging on the chart (mouse, or touch
// with "Move" on: the DrawToggle rule) or with the arrow keys (1).

const SKY = '#0369a1'
const W = 320
const PADL = 38
const PADR = 8
const clamp = (v) => Math.min(100, Math.max(0, v))

const T = {
  en: {
    v: 'v, your value',
    h: 'h, the highest other bid',
    b: 'b, your bid',
    second: 'Second price',
    first: 'First price',
    move: 'Move h',
    payoff: 'payoff',
    bidAxis: 'your bid b',
    legend: ['your payoff', 'b = v', 'b = h', 'your bid'],
    atBid: 'At your bid',
    atTruth: 'At b = v',
    best: 'Best bid',
    win: (pay, p) => `you win and pay ${pay}: payoff ${p}`,
    lose: 'you lose: payoff 0',
    tie: (p) => `a tie, won half the time: payoff ${p}`,
    bestSecondAbove: (h, g) => `b = v is a best bid whatever h is: here every bid above ${h} gives ${g}.`,
    bestSecondBelow: (h) => `b = v is a best bid whatever h is: here every bid below ${h} gives 0, and winning would cost more than the object is worth.`,
    bestSecondEqual: 'b = v is a best bid whatever h is: here every bid gives 0.',
    bestFirstAbove: (h) => `The best bid is just above h = ${h}, which you cannot see: bid more and you pay more, bid less and you lose.`,
    bestFirstBelow: 'No bid gives more than 0: any bid that wins costs at least the object’s worth.',
    hint: 'Drag on the chart to move h, or select it and use the arrow keys.',
    aria: (r) => `Your payoff against your bid in the ${r} auction, with marks at your value and at the highest other bid`,
  },
  it: {
    v: 'v, il tuo valore',
    h: 'h, l’offerta più alta degli altri',
    b: 'b, la tua offerta',
    second: 'Secondo prezzo',
    first: 'Primo prezzo',
    move: 'Sposta h',
    payoff: 'payoff',
    bidAxis: 'la tua offerta b',
    legend: ['il tuo payoff', 'b = v', 'b = h', 'la tua offerta'],
    atBid: 'Con la tua offerta',
    atTruth: 'Con b = v',
    best: 'Offerta migliore',
    win: (pay, p) => `vinci e paghi ${pay}: payoff ${p}`,
    lose: 'perdi: payoff 0',
    tie: (p) => `un pareggio, vinto metà delle volte: payoff ${p}`,
    bestSecondAbove: (h, g) => `b = v è un’offerta migliore qualunque sia h: qui ogni offerta sopra ${h} dà ${g}.`,
    bestSecondBelow: (h) => `b = v è un’offerta migliore qualunque sia h: qui ogni offerta sotto ${h} dà 0, e vincere costerebbe più di quanto l’oggetto vale.`,
    bestSecondEqual: 'b = v è un’offerta migliore qualunque sia h: qui ogni offerta dà 0.',
    bestFirstAbove: (h) => `L’offerta migliore è appena sopra h = ${h}, che non puoi vedere: offri di più e paghi di più, offri di meno e perdi.`,
    bestFirstBelow: 'Nessuna offerta dà più di 0: ogni offerta che vince costa almeno quanto vale l’oggetto.',
    hint: 'Trascina sul grafico per spostare h, oppure selezionalo e usa i tasti freccia.',
    aria: (r) => `Il tuo payoff in funzione della tua offerta nell’asta al ${r}, con i segni al tuo valore e all’offerta più alta degli altri`,
  },
}

export default function FigureTruth({ lang = 'en' }) {
  const L = T[lang] || T.en
  const n0 = (v) => num(v, lang, 0)
  const [rule, setRule] = useState('second')
  const [v, setV] = useState(60)
  const [h, setH] = useState(50)
  const [b, setB] = useState(60)
  const [moveOn, setMoveOn] = useState(false)
  const [dragging, setDragging] = useState(false)
  const box = useRef(null)

  const pay = (x) => payoffF1(rule, v, h, x)
  const winAt = (x) => (rule === 'second' ? v - h : v - x)
  const series = [
    { points: [[0, 0], [h, 0]], color: INK, width: 2 },
    { points: [[h, winAt(h)], [100, winAt(100)]], color: INK, width: 2 },
  ]
  const describe = (x) => {
    const p = pay(x)
    if (x < h) return L.lose
    if (x === h) return L.tie(n0(p))
    return L.win(n0(rule === 'second' ? h : x), n0(p))
  }
  const best =
    rule === 'second'
      ? v > h ? L.bestSecondAbove(n0(h), n0(v - h)) : v < h ? L.bestSecondBelow(n0(h)) : L.bestSecondEqual
      : v > h ? L.bestFirstAbove(n0(h)) : L.bestFirstBelow

  const toBid = (e) => {
    const svg = box.current.querySelector('svg')
    const r = svg.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    return clamp(Math.round(((px - PADL) / (W - PADL - PADR)) * 100))
  }
  const onPointerDown = (e) => {
    if (!canEdit(moveOn, e)) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDragging(true)
    setH(toBid(e))
  }
  const onPointerMove = (e) => {
    if (!dragging || !canEdit(moveOn, e)) return
    setH(toBid(e))
  }
  const stop = () => setDragging(false)
  const onKeyDown = (e) => {
    const d = { ArrowLeft: -1, ArrowRight: 1, ArrowDown: -1, ArrowUp: 1 }[e.key]
    if (!d) return
    e.preventDefault()
    setH((x) => clamp(x + d))
  }

  return (
    <div>
      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 items-start max-w-3xl">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2" data-role="truth-rule">
            <Pill active={rule === 'second'} onClick={() => setRule('second')} data-rule="second">{L.second}</Pill>
            <Pill active={rule === 'first'} onClick={() => setRule('first')} data-rule="first">{L.first}</Pill>
            <DrawToggle on={moveOn} onChange={(on) => { setMoveOn(on); setDragging(false) }} label={L.move} />
          </div>
          <Slider label={L.v} min={0} max={100} step={1} value={v} onChange={setV} />
          <Slider label={L.h} min={0} max={100} step={1} value={h} onChange={setH} />
          <Slider label={L.b} min={0} max={100} step={1} value={b} onChange={setB} />
        </div>
        <div className="min-w-0">
          <div
            ref={box}
            className={`outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded ${drawCanvasClass(moveOn)}`}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={stop}
            onPointerCancel={stop}
            data-role="truth-chart"
            data-draw-surface
            style={{ cursor: 'ew-resize' }}
          >
            <Chart
              height={180}
              x={{ min: 0, max: 100, ticks: [0, 25, 50, 75, 100], label: L.bidAxis }}
              y={{ min: -100, max: 100, ticks: [-100, -50, 0, 50, 100], label: L.payoff, labelSide: 'left', format: (y) => n0(y) }}
              series={series}
              marks={[{ x: v, color: ORANGE_DARK }, { x: h, color: SLATE, dashed: true }]}
              aria={L.aria(rule === 'second' ? (lang === 'it' ? 'secondo prezzo' : 'second-price') : lang === 'it' ? 'primo prezzo' : 'first-price')}
            >
              {({ sx, sy }) => (
                <g>
                  <circle cx={sx(h)} cy={sy(0)} r="3" fill="white" stroke={INK} strokeWidth="1.5" />
                  <circle cx={sx(h)} cy={sy(winAt(h))} r="3" fill="white" stroke={INK} strokeWidth="1.5" />
                  <circle cx={sx(h)} cy={sy(winAt(h) / 2)} r="3" fill={INK} data-role="truth-tie" />
                  <circle cx={sx(b)} cy={sy(pay(b))} r="4.5" fill={SKY} stroke="white" strokeWidth="1.5" data-role="truth-bid" />
                </g>
              )}
            </Chart>
          </div>
          <Legend items={[{ label: L.legend[0], color: INK }, { label: L.legend[1], color: ORANGE_DARK }, { label: L.legend[2], color: SLATE, dashed: true }, { label: L.legend[3], color: SKY }]} />
        </div>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2 text-sm max-w-3xl" data-role="truth-readout">
        <div className="min-w-0">
          <dt className="text-xs text-slate-500">{L.atBid} (b = {n0(b)})</dt>
          <dd className="font-mono tabular-nums text-slate-900" data-value="bid">{describe(b)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-slate-500">{L.atTruth} = {n0(v)}</dt>
          <dd className="font-mono tabular-nums text-slate-900" data-value="truth">{describe(v)}</dd>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <dt className="text-xs text-slate-500">{L.best}</dt>
          <dd className="text-slate-900 leading-snug" data-value="best">{best}</dd>
        </div>
      </dl>
      <p className="mt-1 text-xs text-slate-500">{L.hint}</p>
    </div>
  )
}
