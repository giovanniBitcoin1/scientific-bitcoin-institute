import { useEffect, useMemo, useRef, useState } from 'react'
import { ORANGE_DARK, INK, SLATE, GRID, MONO, Pill } from '../ui.jsx'
import { riotThresholds, riotRun, RIOT_N, RIOT_SIDE } from './figures.js'

// Live figure F1, "The riot that almost happened": a hundred people with
// thresholds 0 to 99. Start lets them join one by one; a tap on a person
// raises or lowers their threshold by one. Plain SVG; only clicks are
// listened to, so a swipe over the drawing scrolls the page.

const T = {
  en: {
    start: 'Start',
    reset: 'Reset',
    up: 'Tap: +1',
    down: 'Tap: −1',
    hint: 'Each square is a person; the number is how many others must be in before they join. Press Start, or tap a person first to change their threshold by one.',
    running: (n) => `${n} in…`,
    all: 'All 100 have joined: each one was the last push the next one needed.',
    stopped: (n, t) => (n === 0 ? 'Nobody moves: there is no one with threshold 0 to begin.' : `The riot stops at ${n} ${n === 1 ? 'person' : 'people'}: nobody left has a threshold of ${t} or less.`),
    changed: (n) => `${n} ${n === 1 ? 'threshold differs' : 'thresholds differ'} from 0, 1, 2, … 99.`,
    aria: 'A hundred people in a ten by ten grid, each with a threshold; those who have joined are highlighted',
  },
  it: {
    start: 'Avvia',
    reset: 'Azzera',
    up: 'Tocco: +1',
    down: 'Tocco: −1',
    hint: 'Ogni quadrato è una persona; il numero dice quanti altri devono esserci prima che si unisca. Premi Avvia, oppure tocca prima una persona per cambiare di uno la sua soglia.',
    running: (n) => `${n} dentro…`,
    all: "Tutti e 100 si sono uniti: ognuno è stato l'ultima spinta che serviva al successivo.",
    stopped: (n, t) => (n === 0 ? "Nessuno si muove: non c'è nessuno con soglia 0 per cominciare." : `La rivolta si ferma a ${n} ${n === 1 ? 'persona' : 'persone'}: nessuno dei rimasti ha una soglia di ${t} o meno.`),
    changed: (n) => `${n} ${n === 1 ? 'soglia diversa' : 'soglie diverse'} da 0, 1, 2, … 99.`,
    aria: 'Cento persone in una griglia dieci per dieci, ciascuna con una soglia; chi si è unito è evidenziato',
  },
}

const CELL = 30
const SIZE = CELL * RIOT_SIDE
const TICK = 28 // ms per person

export default function FigureRiot({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [thresholds, setThresholds] = useState(riotThresholds)
  const [delta, setDelta] = useState(1)
  const [joined, setJoined] = useState(0)
  const [state, setState] = useState('idle') // idle | running | done
  const timer = useRef(0)
  const order = useMemo(() => riotRun(thresholds), [thresholds])
  const rank = useMemo(() => {
    const r = new Int32Array(RIOT_N).fill(-1)
    order.forEach((v, i) => (r[v] = i))
    return r
  }, [order])

  const stop = () => clearInterval(timer.current)
  useEffect(() => stop, [])

  const start = () => {
    stop()
    setJoined(0)
    setState('running')
    let n = 0
    timer.current = setInterval(() => {
      if (n >= order.length) {
        stop()
        setState('done')
        return
      }
      n++
      setJoined(n)
    }, TICK)
  }
  const clear = () => {
    stop()
    setJoined(0)
    setState('idle')
  }
  const reset = () => {
    clear()
    setThresholds(riotThresholds())
  }
  const tap = (i) => {
    clear()
    setThresholds((th) => th.map((v, j) => (j === i ? Math.max(0, v + delta) : v)))
  }
  const changed = thresholds.filter((v, i) => v !== i).length
  const text = state === 'idle' ? t.hint : state === 'running' ? t.running(joined) : order.length === RIOT_N ? t.all : t.stopped(order.length, order.length)

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Pill primary onClick={start} disabled={state === 'running'} data-action="start">
          {t.start}
        </Pill>
        <Pill onClick={reset} data-action="reset">
          {t.reset}
        </Pill>
        <Pill active={delta === 1} onClick={() => setDelta(1)} data-action="up">
          {t.up}
        </Pill>
        <Pill active={delta === -1} onClick={() => setDelta(-1)} data-action="down">
          {t.down}
        </Pill>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-[minmax(0,300px)_1fr] items-start">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto max-w-[300px] bg-white border border-slate-200 rounded" role="img" aria-label={t.aria}>
          {thresholds.map((v, i) => {
            const x = (i % RIOT_SIDE) * CELL
            const y = Math.floor(i / RIOT_SIDE) * CELL
            const isIn = rank[i] >= 0 && rank[i] < joined
            const moved = v !== i
            return (
              <g key={i} onClick={() => tap(i)} style={{ cursor: 'pointer' }} data-person={i} data-threshold={v} data-in={isIn ? '1' : '0'}>
                <rect x={x + 1.5} y={y + 1.5} width={CELL - 3} height={CELL - 3} rx="4" fill={isIn ? ORANGE_DARK : '#ffffff'} stroke={moved ? INK : GRID} strokeWidth={moved ? 1.6 : 1} />
                <text x={x + CELL / 2} y={y + CELL / 2 + 3.5} textAnchor="middle" fontSize="10" fontFamily={MONO} fill={isIn ? '#ffffff' : SLATE} style={{ pointerEvents: 'none' }}>
                  {v}
                </text>
              </g>
            )
          })}
        </svg>
        <div className="min-w-0">
          <p className="text-sm text-slate-700 leading-snug" data-readout="riot" data-state={state} data-joined={joined} data-outcome={order.length} data-changed={changed}>
            {text}
          </p>
          {changed > 0 && <p className="mt-2 text-xs text-slate-500 leading-snug">{t.changed(changed)}</p>}
        </div>
      </div>
    </div>
  )
}
