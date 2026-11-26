import { useMemo, useState } from 'react'
import { Pill } from '../../network/ui.jsx'
import { frac, sub, toNumber } from '../congestion-price-of-anarchy/frac.js'
import CoreTriangle from './CoreTriangle.jsx'
import { presetGame, PRESETS, PRESET_IDS, analyse, properCoalitions, full, members, makeGame } from './coalitions.js'
import { both, fracText } from './fmt.js'

// Panel A, "Who gets what?": a coalitional game of 3, 4 or 5 players given by
// a table of v(S) (editable; v(∅) = 0). Outputs: the Shapley value as exact
// fractions from all n! orders; superadditive? convex? the core test by a
// linear programme (minimise Σ x_i subject to x(S) ≥ v(S) for every proper
// coalition: nonempty iff the minimum is at most v(N)); one core point and
// whether the Shapley value is in the core; if the core is empty, the least
// core. A cost game (the airport) is entered as costs: the panel shows the
// Shapley cost shares and runs the tests on the savings game
// v(S) = Σ c({i}) − c(S). For three players, F1's triangle.

const MIN = -999
const MAX = 9999

const T = {
  en: {
    presets: { partners: 'The partners', partners90: 'Partners, v(AB) = 90', majority: 'Majority', gloves3: 'Gloves L L R', gloves5: 'Gloves L L R R R', airport: 'Airport', unanimity: 'Unanimity of 1 and 2' },
    size: 'Players',
    notes: {
      partners: 'A, B and C: alone each makes 0, all three together 100.',
      partners90: 'The partners, with A and B worth 90 together.',
      majority: (n) => `v(S) = 1 if S has more than half of the ${n} players.`,
      gloves3: 'Players 1 and 2 own a left glove, player 3 a right one; a pair sells for 1.',
      gloves5: 'Players 1 and 2 own a left glove, 3, 4 and 5 a right one; a pair sells for 1.',
      airport: 'A cost game: three planes need runways costing 10, 15 and 30; a coalition pays for the longest runway it needs.',
      unanimity: 'v(S) = 1 if S contains both 1 and 2.',
      edited: 'Edited by you.',
    },
    worth: 'v(S)',
    cost: 'c(S)',
    shapley: 'Shapley value (average over all orders)',
    shares: 'Shapley cost shares',
    orders: (k) => `${k} orders`,
    superadditive: 'Superadditive',
    convex: 'Convex',
    tests: (cost) => (cost ? 'Tests on the savings game v(S) = Σ c({i}) − c(S)' : 'Tests'),
    yes: 'yes',
    no: 'no',
    lp: 'Core test: min Σ x_i with x(S) ≥ v(S)',
    lpLine: (m, vN, ok) => `minimum ${m}, v(N) = ${vN}: the core is ${ok ? 'nonempty' : 'empty'}`,
    point: 'A core point (least-core programme)',
    costPoint: 'As costs',
    shapleyIn: 'Shapley value in the core?',
    objects: (s, by) => `no: ${s} would get ${by} more on its own`,
    least: 'Least core: the smallest ε',
    leastLine: (e) => `ε = ${e}: some division gives every coalition at least v(S) − ε`,
    costNote: 'A cost division is in the core when no coalition pays more than it would alone.',
    table: 'Edit any cell; v(∅) = 0.',
    aria: 'The triangle of divisions with the core and the Shapley value',
  },
  it: {
    presets: { partners: 'I soci', partners90: 'Soci, v(AB) = 90', majority: 'Maggioranza', gloves3: 'Guanti S S D', gloves5: 'Guanti S S D D D', airport: 'Aeroporto', unanimity: 'Unanimità di 1 e 2' },
    size: 'Giocatori',
    notes: {
      partners: 'A, B e C: da soli fanno 0, tutti e tre insieme 100.',
      partners90: 'I soci, con A e B che insieme valgono 90.',
      majority: (n) => `v(S) = 1 se S ha più della metà dei ${n} giocatori.`,
      gloves3: 'I giocatori 1 e 2 hanno un guanto sinistro, il 3 uno destro; un paio si vende a 1.',
      gloves5: 'I giocatori 1 e 2 hanno un guanto sinistro, il 3, il 4 e il 5 uno destro; un paio si vende a 1.',
      airport: 'Un gioco di costo: tre aerei hanno bisogno di piste da 10, 15 e 30; una coalizione paga la pista più lunga che le serve.',
      unanimity: 'v(S) = 1 se S contiene sia 1 sia 2.',
      edited: 'Modificato da te.',
    },
    worth: 'v(S)',
    cost: 'c(S)',
    shapley: 'Valore di Shapley (media su tutti gli ordini)',
    shares: 'Quote di costo di Shapley',
    orders: (k) => `${k} ordini`,
    superadditive: 'Superadditivo',
    convex: 'Convesso',
    tests: (cost) => (cost ? 'Test sul gioco dei risparmi v(S) = Σ c({i}) − c(S)' : 'Test'),
    yes: 'sì',
    no: 'no',
    lp: 'Test del nucleo: min Σ x_i con x(S) ≥ v(S)',
    lpLine: (m, vN, ok) => `minimo ${m}, v(N) = ${vN}: il nucleo è ${ok ? 'non vuoto' : 'vuoto'}`,
    point: 'Un punto del nucleo (programma del least core)',
    costPoint: 'Come costi',
    shapleyIn: 'Il valore di Shapley è nel nucleo?',
    objects: (s, by) => `no: ${s} avrebbe ${by} in più da sola`,
    least: 'Least core: l’ε più piccolo',
    leastLine: (e) => `ε = ${e}: una divisione dà a ogni coalizione almeno v(S) − ε`,
    costNote: 'Una divisione dei costi è nel nucleo quando nessuna coalizione paga più di quanto pagherebbe da sola.',
    table: 'Modifica una cella qualsiasi; v(∅) = 0.',
    aria: 'Il triangolo delle divisioni con il nucleo e il valore di Shapley',
  },
}

const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1))

export default function CoalitionPanel({ lang = 'en' }) {
  const L = T[lang] || T.en
  const [preset, setPreset] = useState('partners')
  const [size, setSize] = useState(3)
  const [game, setGame] = useState(() => presetGame('partners'))
  const [edited, setEdited] = useState(false)
  const a = useMemo(() => analyse(game), [game])
  const { n } = game
  const cost = a.kind === 'cost'
  const sep = lang === 'it' ? '; ' : ', '
  const name = (m) => {
    const ms = members(m, n).map((i) => game.names[i])
    return /^[A-Z]$/.test(game.names[0]) ? ms.join('') : `{${ms.join(',')}}`
  }
  const choose = (id, s = size) => {
    setPreset(id)
    if (s != null) setSize(s)
    setGame(presetGame(id, s ?? size))
    setEdited(false)
  }
  const edit = (m, raw) => {
    const v = Math.max(MIN, Math.min(MAX, Math.round(Number(raw))))
    if (!Number.isFinite(v)) return
    const vs = game.v.map((x, k) => (k === m ? frac(v) : x))
    setGame({ ...makeGame(n, (k) => vs[k], game.names), kind: game.kind })
    setEdited(true)
  }
  const sized = PRESETS[preset].sizes
  const note = L.notes[preset]
  const coalitions = [...properCoalitions(n), full(n)]
  const showList = (xs) => xs.map((f) => both(f, lang)).join(sep)
  const firstObj = a.shapleyObjections[0]

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" data-role="ca-presets">
        {PRESET_IDS.map((id) => (
          <Pill key={id} active={preset === id} onClick={() => choose(id, PRESETS[id].sizes ? size : undefined)} data-preset={id}>{L.presets[id]}</Pill>
        ))}
      </div>
      {sized && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500" data-role="ca-sizes">
          <span>{L.size}</span>
          {sized.map((s) => (
            <Pill key={s} active={n === s} onClick={() => choose(preset, s)} data-size={s}>{s}</Pill>
          ))}
        </div>
      )}
      <p className="mt-2 text-sm text-slate-600" data-role="ca-note">{typeof note === 'function' ? note(n) : note} {edited && L.notes.edited}</p>

      <div className="mt-3 grid gap-x-6 gap-y-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start max-w-3xl">
        <div className="min-w-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5" data-role="ca-table">
            {coalitions.map((m) => (
              <label key={m} className="flex items-center gap-1 min-w-0 text-xs font-mono">
                <span className="text-slate-500 shrink-0 w-14 truncate text-right" title={name(m)}>{name(m)}</span>
                <input
                  type="number"
                  step="1"
                  min={MIN}
                  max={MAX}
                  value={toNumber(game.v[m])}
                  onChange={(e) => edit(m, e.target.value)}
                  className="w-full min-w-0 rounded border border-slate-200 px-1 py-0.5 tabular-nums"
                  aria-label={`${cost ? L.cost : L.worth} ${name(m)}`}
                  data-mask={m}
                />
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-500">{cost ? L.cost : L.worth} · {L.table}</p>
          {n === 3 && (
            <div className="mt-2 max-w-[16rem]">
              <CoreTriangle game={a.value} phi={a.phiValue} aria={L.aria} role="ca-triangle" />
            </div>
          )}
        </div>
        <dl className="min-w-0 grid gap-y-1.5 text-sm" data-role="ca-readout">
          <div>
            <dt className="text-xs text-slate-500">{cost ? L.shares : L.shapley} · {L.orders(fact(n))}</dt>
            <dd className="font-mono tabular-nums text-slate-900 break-words" data-value="shapley">{showList(a.phi)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">{L.tests(cost)}</dt>
            <dd className="font-mono text-slate-900" data-value="tests" data-superadditive={a.superadditive ? 'yes' : 'no'} data-convex={a.convex ? 'yes' : 'no'}>
              {L.superadditive}: {a.superadditive ? L.yes : L.no} · {L.convex}: {a.convex ? L.yes : L.no}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">{L.lp}</dt>
            <dd className="font-mono tabular-nums text-slate-900 break-words" data-value="core" data-nonempty={a.core.nonempty ? 'yes' : 'no'}>
              {L.lpLine(fracText(a.core.min), fracText(a.value.v[full(n)]), a.core.nonempty)}
            </dd>
          </div>
          {a.core.nonempty ? (
            <>
              <div>
                <dt className="text-xs text-slate-500">{L.point}</dt>
                <dd className="font-mono tabular-nums text-slate-900 break-words" data-value="point">{showList(a.least.x)}</dd>
                {cost && <dd className="font-mono tabular-nums text-slate-600 text-xs break-words" data-value="costPoint">{L.costPoint}: {showList(a.least.x.map((x, i) => sub(game.v[1 << i], x)))}</dd>}
              </div>
              <div>
                <dt className="text-xs text-slate-500">{L.shapleyIn}</dt>
                <dd className="font-mono text-slate-900 break-words" data-value="shapleyIn" data-in={a.shapleyIn ? 'yes' : 'no'}>
                  {a.shapleyIn ? L.yes : L.objects(name(firstObj.mask), fracText(firstObj.by))}
                </dd>
              </div>
            </>
          ) : (
            <div>
              <dt className="text-xs text-slate-500">{L.least}</dt>
              <dd className="font-mono tabular-nums text-slate-900 break-words" data-value="least">{L.leastLine(both(a.least.eps, lang))}</dd>
              <dd className="font-mono tabular-nums text-slate-600 text-xs break-words" data-value="leastPoint">x = {showList(a.least.x)}</dd>
            </div>
          )}
          {cost && <p className="text-xs text-slate-500 leading-snug">{L.costNote}</p>}
        </dl>
      </div>
    </div>
  )
}
