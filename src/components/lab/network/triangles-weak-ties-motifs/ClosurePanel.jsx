import { useEffect, useRef, useState } from 'react'
import Slider from '../../Slider.jsx'
import SimControls from '../../SimControls.jsx'
import useAnimationLoop from '../../useAnimationLoop.js'
import { ORANGE_DARK, SLATE, Eyebrow, Pill, Stat, fmt } from '../ui.jsx'
import Chart, { Legend } from '../charts.jsx'
import { closureRun, closureStats, CLOSURE_N, START_LINKS, END_LINKS, RECORD_EVERY } from './closure.js'

// Panel A, "Close the triangle": a sparse random network of 200 nodes grows
// one link at a time. With probability p the new link closes a triangle,
// otherwise it joins two random nodes. A second network, grown from the same
// start with random links only, is the baseline: a random network with the
// same N and L at every moment.

const T = {
  en: {
    p: 'Probability p that a new link closes a triangle',
    play: 'Play',
    pause: 'Pause',
    step: 'Step',
    reset: 'Reset',
    end: 'Run to the end',
    restart: 'Moving the slider starts again from the 200 links.',
    links: 'Links',
    closures: 'Triangles closed on purpose',
    transitivity: 'Transitivity',
    clustering: 'Average clustering',
    distance: 'Average distance',
    giant: 'Largest piece',
    local: 'Local bridges',
    random: 'random',
    last: {
      none: `${CLOSURE_N} nodes, ${START_LINKS} links placed at random.`,
      closed: (a, b, v) => `Last link: ${a}–${b}, two neighbours of node ${v}. A triangle closes.`,
      random: (a, b) => `Last link: ${a}–${b}, two nodes picked at random.`,
      done: `${END_LINKS} links: the run is over.`,
    },
    legend: { model: 'With triangle closure', twin: 'Random network, same N and L' },
    x: 'links',
    note: 'Average distance is measured inside the largest piece. A local bridge is a link whose two ends have no neighbour in common.',
    aria: (what) => `${what} against the number of links, with triangle closure and for a random network`,
  },
  it: {
    p: 'Probabilità p che un nuovo collegamento chiuda un triangolo',
    play: 'Avvia',
    pause: 'Pausa',
    step: 'Passo',
    reset: 'Azzera',
    end: 'Vai alla fine',
    restart: 'Spostando il cursore si riparte dai 200 collegamenti.',
    links: 'Collegamenti',
    closures: 'Triangoli chiusi di proposito',
    transitivity: 'Transitività',
    clustering: 'Clustering medio',
    distance: 'Distanza media',
    giant: 'Pezzo più grande',
    local: 'Ponti locali',
    random: 'casuale',
    last: {
      none: `${CLOSURE_N} nodi, ${START_LINKS} collegamenti disposti a caso.`,
      closed: (a, b, v) => `Ultimo collegamento: ${a}–${b}, due vicini del nodo ${v}. Si chiude un triangolo.`,
      random: (a, b) => `Ultimo collegamento: ${a}–${b}, due nodi scelti a caso.`,
      done: `${END_LINKS} collegamenti: la prova è finita.`,
    },
    legend: { model: 'Con chiusura dei triangoli', twin: 'Rete casuale, stessi N e L' },
    x: 'collegamenti',
    note: 'La distanza media è misurata dentro il pezzo più grande. Un ponte locale è un collegamento i cui due estremi non hanno vicini in comune.',
    aria: (what) => `${what} al variare del numero di collegamenti, con chiusura dei triangoli e per una rete casuale`,
  },
}

const RATE = 150 // links per second while playing

function fresh(p) {
  const run = closureRun(p)
  const twin = closureRun(0)
  return { run, twin, points: [closureStats(run)], twinPoints: [closureStats(twin)] }
}

const CHARTS = [
  { key: 'transitivity', y: { min: 0, max: 0.4, ticks: [0, 0.1, 0.2, 0.3, 0.4] } },
  { key: 'clustering', y: { min: 0, max: 0.5, ticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5] } },
  { key: 'distance', y: { min: 0, max: 7, ticks: [0, 2, 4, 6] } },
  { key: 'localBridges', label: 'local', y: { min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] } },
]

export default function ClosurePanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [p, setP] = useState(0.5)
  const [playing, setPlaying] = useState(false)
  const sim = useRef(null)
  if (!sim.current) sim.current = fresh(p)
  const carry = useRef(0)
  const [, setTick] = useState(0)

  const restart = (value) => {
    sim.current = fresh(value)
    carry.current = 0
    setTick((v) => v + 1)
  }
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setPlaying(false)
    restart(p)
  }, [p])

  const advance = (count) => {
    const s = sim.current
    for (let i = 0; i < count; i++) {
      if (!s.run.step()) break
      s.twin.step()
      if ((s.run.links - START_LINKS) % RECORD_EVERY === 0 || s.run.done) {
        s.points.push(closureStats(s.run))
        s.twinPoints.push(closureStats(s.twin))
      }
    }
    if (s.run.done) setPlaying(false)
    setTick((v) => v + 1)
  }
  useAnimationLoop((dt) => {
    carry.current += (RATE * Math.min(dt, 100)) / 1000
    const count = Math.floor(carry.current)
    if (count > 0) {
      carry.current -= count
      advance(count)
    }
  }, playing)

  const s = sim.current
  const now = closureStats(s.run)
  const twinNow = closureStats(s.twin)
  const last = s.run.last
  const message = s.run.done ? t.last.done : !last ? t.last.none : last.via >= 0 ? t.last.closed(last.a + 1, last.b + 1, last.via + 1) : t.last.random(last.a + 1, last.b + 1)
  const x = { min: START_LINKS, max: END_LINKS, ticks: [200, 400, 600, 800], label: t.x }
  // The curves run up to the present moment, not only to the last recorded point.
  const line = (points, current, key) => [...points.map((q) => [q.links, q[key]]), [current.links, current[key]]]
  const both = (a, b, d = 3) => (
    <>
      {fmt(a, d)} <span className="text-slate-400">· {t.random} {fmt(b, d)}</span>
    </>
  )

  return (
    <div>
      <div className="grid gap-x-6 gap-y-3 md:grid-cols-2 items-end">
        <Slider label={t.p} min={0} max={1} step={0.05} value={p} onChange={setP} format={(v) => fmt(v, 2)} />
        <div className="flex flex-wrap items-center gap-2">
          <SimControls
            playing={playing}
            onPlayPause={() => {
              if (s.run.done) restart(p)
              setPlaying((v) => !v)
            }}
            onStep={() => advance(1)}
            onReset={() => {
              setPlaying(false)
              restart(p)
            }}
            labels={{ play: t.play, pause: t.pause, step: t.step, reset: t.reset }}
          />
          <Pill
            onClick={() => {
              setPlaying(false)
              advance(END_LINKS)
            }}
            disabled={s.run.done}
          >
            {t.end}
          </Pill>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.restart}</p>
      <p className="mt-2 font-mono text-xs text-slate-700 leading-relaxed min-h-[2.5em]" aria-live="off" data-readout="last">
        {message}
      </p>

      <div className="mt-2 grid grid-cols-2 lg:grid-cols-4 gap-2" data-readout="closure" data-done={s.run.done ? '1' : '0'}>
        <Stat label={t.links}>{now.links}</Stat>
        <Stat label={t.closures}>{s.run.closed}</Stat>
        <Stat label={t.giant}>{both(now.giant, twinNow.giant)}</Stat>
        <Stat label={t.transitivity}>{both(now.transitivity, twinNow.transitivity)}</Stat>
        <Stat label={t.clustering}>{both(now.clustering, twinNow.clustering)}</Stat>
        <Stat label={t.distance}>{both(now.distance, twinNow.distance, 2)}</Stat>
        <Stat label={t.local} wide>
          {both(now.localBridges, twinNow.localBridges)}
        </Stat>
      </div>

      <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2 items-start">
        {CHARTS.map((c) => (
          <div key={c.key} className="min-w-0">
            <Eyebrow>{t[c.label || c.key]}</Eyebrow>
            <Chart
              x={x}
              y={{ ...c.y, format: (v) => String(v) }}
              height={150}
              aria={t.aria(t[c.label || c.key])}
              series={[
                { points: line(s.twinPoints, twinNow, c.key), color: SLATE, dashed: true, width: 1.4 },
                { points: line(s.points, now, c.key), color: ORANGE_DARK, width: 2 },
              ]}
            />
          </div>
        ))}
      </div>
      <Legend
        items={[
          { label: t.legend.model, color: ORANGE_DARK },
          { label: t.legend.twin, color: SLATE, dashed: true },
        ]}
      />
      <p className="mt-2 text-xs text-slate-500 leading-snug">{t.note}</p>
    </div>
  )
}
