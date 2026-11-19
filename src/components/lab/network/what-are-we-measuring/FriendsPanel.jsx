import { useEffect, useMemo, useState } from 'react'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, MUTED, Pill, Eyebrow, Stat, fmt } from '../ui.jsx'
import Chart, { Legend, ccdfPoints } from './charts.jsx'
import { FRIEND_NETWORKS, BETA, SENSOR_RUNS, SENSOR_SEED, friendStats, sensorJob, crossing } from './friends.js'
import { fromData } from './nullmodels.js'
import karateData from '../../../../data/lab/networks/karate-club.json'

// Panel C, "Your friends have more friends": the degree of a random node
// against the degree of a random friend, and an early-warning experiment in
// which a group of random friends catches a spreading infection before a
// group of random nodes. Charts only: nothing here captures a swipe.

const NETWORK_IDS = ['scaleFree', 'random', 'ring', 'karate']

const T = {
  en: {
    network: 'Network',
    networks: {
      scaleFree: 'Scale-free, N = 1,000, m = 3',
      random: 'Random, N = 1,000, ⟨k⟩ = 6',
      ring: 'Ring lattice, N = 1,000, k = 6',
      karate: "Zachary's karate club",
    },
    dist: 'Two ways to pick a node',
    node: 'a random node',
    friend: 'a random friend',
    k: 'degree k',
    share: 'share',
    shareAbove: 'share with degree ≥ k',
    mean: 'Average degree ⟨k⟩',
    friendMean: 'Average degree of a friend ⟨k²⟩/⟨k⟩',
    fewer: 'Fewer links than their friends have on average',
    fewerValue: (c, n, pct) => `${c} of ${n} (${pct}%)`,
    sensor: 'Early warning',
    sensorHow: (size, beta) =>
      `An infection starts from one random node; at each step an infected node infects each susceptible neighbour with probability ${beta}. Two groups of ${size} are watched: random nodes, and random friends of random nodes.`,
    all: 'everyone',
    randoms: 'random nodes',
    friends: 'random friends',
    step: 'step',
    infected: 'share infected',
    lead: 'Lead of the friends at 50%',
    leadValue: (v) => `${v} steps`,
    ahead: 'Runs in which the friends are ahead',
    half: 'Random group half infected at step',
    runs: (m) => `Average of ${m} runs, each with a new seed and new groups.`,
    again: 'Run again',
    computing: 'Computing…',
    ariaDist: 'Degree distribution of a random node and of a random friend',
    ariaSensor: 'Share infected over time: everyone, a group of random nodes and a group of random friends',
  },
  it: {
    network: 'Rete',
    networks: {
      scaleFree: 'A invarianza di scala, N = 1.000, m = 3',
      random: 'Casuale, N = 1.000, ⟨k⟩ = 6',
      ring: 'Reticolo ad anello, N = 1.000, k = 6',
      karate: 'Club di karate di Zachary',
    },
    dist: 'Due modi di scegliere un nodo',
    node: 'un nodo a caso',
    friend: 'un amico a caso',
    k: 'grado k',
    share: 'quota',
    shareAbove: 'quota con grado ≥ k',
    mean: 'Grado medio ⟨k⟩',
    friendMean: 'Grado medio di un amico ⟨k²⟩/⟨k⟩',
    fewer: 'Meno collegamenti di quanti ne hanno in media i loro amici',
    fewerValue: (c, n, pct) => `${c} su ${n} (${pct}%)`,
    sensor: 'Allarme precoce',
    sensorHow: (size, beta) =>
      `Un'infezione parte da un nodo a caso; a ogni passo un nodo infetto infetta ciascun vicino suscettibile con probabilità ${beta}. Si osservano due gruppi di ${size}: nodi a caso, e amici a caso di nodi a caso.`,
    all: 'tutti',
    randoms: 'nodi a caso',
    friends: 'amici a caso',
    step: 'passo',
    infected: 'quota di infetti',
    lead: 'Anticipo degli amici al 50%',
    leadValue: (v) => `${v} passi`,
    ahead: 'Prove in cui gli amici sono in anticipo',
    half: 'Gruppo a caso infetto per metà al passo',
    runs: (m) => `Media di ${m} prove, ciascuna con un nuovo seme e nuovi gruppi.`,
    again: 'Ripeti',
    computing: 'Calcolo in corso…',
    ariaDist: 'Distribuzione dei gradi di un nodo a caso e di un amico a caso',
    ariaSensor: 'Quota di infetti nel tempo: tutti, un gruppo di nodi a caso e un gruppo di amici a caso',
  },
}

const niceTicks = (max, parts = 4) => {
  const raw = max / parts
  const pow = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw)
  const out = []
  for (let v = 0; v <= max + 1e-9; v += step) out.push(Number(v.toFixed(6)))
  return out
}

export default function FriendsPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [networkId, setNetworkId] = useState('scaleFree')
  const [round, setRound] = useState(0)
  const exp = useExperiment()

  const net = useMemo(() => (networkId === 'karate' ? fromData(karateData) : FRIEND_NETWORKS[networkId](1)), [networkId])
  const s = useMemo(() => friendStats(net), [net])

  useEffect(() => {
    exp.run(sensorJob(net, SENSOR_SEED + 1000 * round))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [net, round])
  const data = exp.data

  // ---- Degree distributions
  const logAxes = networkId === 'scaleFree'
  // With a heavy tail, the share with degree k or more (smooth on log axes).
  const points = (D) => (logAxes ? ccdfPoints(D) : Array.from(D, (p, k) => [k, p]))
  const yTop = Math.max(...s.nodeDist, ...s.friendDist)
  const top = Math.min(1, Math.ceil(yTop * 10) / 10)
  const distX = logAxes
    ? { min: 1, max: 100, log: true, ticks: [1, 10, 100], label: t.k }
    : { min: 0, max: Math.max(s.maxDegree + 1, 8), ticks: niceTicks(Math.max(s.maxDegree + 1, 8)), label: t.k }
  const distY = logAxes
    ? { min: 5e-4, max: 1, log: true, ticks: [1, 0.1, 0.01, 0.001], label: t.shareAbove, format: (v) => String(v) }
    : { min: 0, max: top, ticks: [0, top / 2, top], label: t.share, format: (v) => fmt(v, 2) }

  // ---- Early warning: cut the time axis where nearly everyone is infected.
  let tMax = 10
  if (data && data.runs) {
    tMax = data.all.length - 1
    for (let i = 0; i < data.all.length; i++) {
      if (data.all[i] >= 0.99 * data.all[data.all.length - 1]) {
        tMax = Math.max(10, i)
        break
      }
    }
  }
  const curve = (c) => {
    const out = []
    const stride = Math.max(1, Math.floor(tMax / 300))
    for (let i = 0; i <= tMax && i < c.length; i += stride) out.push([i, c[i]])
    return out
  }
  const xTicks = niceTicks(tMax)

  return (
    <div>
      <label className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700 min-w-0">
        {t.network}
        <select
          value={networkId}
          onChange={(e) => setNetworkId(e.target.value)}
          className="min-w-0 max-w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500"
        >
          {NETWORK_IDS.map((id) => (
            <option key={id} value={id}>
              {t.networks[id]}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 grid gap-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{t.dist}</Eyebrow>
          <Chart
            x={distX}
            y={distY}
            aria={t.ariaDist}
            height={180}
            series={[
              { points: points(s.nodeDist), color: INK, width: 1.5, dots: logAxes ? false : 2 },
              { points: points(s.friendDist), color: ORANGE_DARK, width: 1.75, dots: logAxes ? false : 2.3 },
            ]}
            marks={
              logAxes
                ? []
                : [
                    { x: s.meanDegree, color: INK, dashed: true },
                    { x: s.friendMean, color: ORANGE_DARK, dashed: true },
                  ]
            }
          />
          <Legend items={[{ label: t.node, color: INK }, { label: t.friend, color: ORANGE_DARK }]} />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat label={t.mean}>{fmt(s.meanDegree, 2)}</Stat>
            <Stat label={t.friendMean}>{fmt(s.friendMean, 2)}</Stat>
            <Stat label={t.fewer} wide>
              {t.fewerValue(s.fewer, s.n, fmt(100 * s.fewerShare, 1))}
            </Stat>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Eyebrow>{t.sensor}</Eyebrow>
            <span className="font-mono text-xs text-slate-500" aria-live="polite">
              {exp.running ? `${t.computing} ${Math.round(exp.progress * 100)}%` : ''}
            </span>
          </div>
          <Chart
            x={{ min: 0, max: xTicks[xTicks.length - 1] >= tMax ? xTicks[xTicks.length - 1] : tMax, ticks: xTicks, label: t.step }}
            y={{ min: 0, max: 1, ticks: [0, 0.5, 1], label: t.infected, labelSide: 'left', format: (v) => String(v) }}
            aria={t.ariaSensor}
            height={180}
            series={
              data && data.runs
                ? [
                    { points: curve(data.all), color: MUTED, width: 1.25, dashed: true },
                    { points: curve(data.randoms), color: INK, width: 1.75 },
                    { points: curve(data.friends), color: ORANGE_DARK, width: 2 },
                  ]
                : []
            }
          />
          <Legend
            items={[
              { label: t.friends, color: ORANGE_DARK },
              { label: t.randoms, color: INK },
              { label: t.all, color: MUTED, dashed: true },
            ]}
          />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat label={t.lead}>{data && data.runs ? t.leadValue(fmt(data.meanLead, 2)) : '–'}</Stat>
            <Stat label={t.ahead}>{data && data.runs ? `${fmt(100 * data.aheadShare, 0)}%` : '–'}</Stat>
            <Stat label={t.half} wide>
              {data && data.runs ? fmt(crossing(data.randoms), 1) : '–'}
            </Stat>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Pill onClick={() => setRound((r) => r + 1)} disabled={exp.running}>
              {t.again}
            </Pill>
            <span className="text-xs text-slate-500">{t.runs(data ? data.runs : SENSOR_RUNS)}</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-600 leading-snug">{t.sensorHow(data ? data.size : 100, BETA)}</p>
    </div>
  )
}
