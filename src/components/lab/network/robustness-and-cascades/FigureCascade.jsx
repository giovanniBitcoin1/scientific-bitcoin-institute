import { useMemo, useState } from 'react'
import { ORANGE_DARK, INK, SLATE, MUTED, GRID, MONO, Pill } from '../ui.jsx'
import { F2_A, F2_B, F2_N, F2_START, dependenceCascade } from './figures.js'

// Live figure F2, "The cascade": two networks of 15 nodes; node i of A and
// node i of B depend on each other (dashed lines). Removing a node starts a
// cascade shown one round at a time. Plain SVG; nodes and buttons listen to
// clicks only, so a swipe over the drawing scrolls.

const T = {
  en: {
    next: 'Next round',
    reset: 'Start again',
    hint: (name) => `Node ${name} is about to fail. Press "Next round", or click another node to start from there.`,
    first: (name, cut) => `Round 1, network ${name[0]}: node ${name} fails${cut ? ` and ${cut} more ${cut === 1 ? 'is' : 'are'} cut off from the largest component` : ''}.`,
    round: (r, side, partner, cut) =>
      `Round ${r}, network ${side}: ${partner} ${partner === 1 ? 'node loses its partner' : 'nodes lose their partner'}${cut ? `, and ${cut} more ${cut === 1 ? 'is' : 'are'} cut off from the largest component` : ''}.`,
    end: (left) => ` Nothing else fails: ${left} of ${F2_N} pairs still work.`,
    soFar: (dead) => ` ${dead} of ${F2_N} pairs are broken so far.`,
    aria: 'Two networks of 15 nodes, A above and B below, with a dashed line between each node and its partner',
  },
  it: {
    next: 'Turno successivo',
    reset: 'Ricomincia',
    hint: (name) => `Il nodo ${name} sta per guastarsi. Premi «Turno successivo», o clicca un altro nodo per partire da lì.`,
    first: (name, cut) => `Turno 1, rete ${name[0]}: il nodo ${name} si guasta${cut ? ` e ${cut === 1 ? 'un altro resta tagliato' : `altri ${cut} restano tagliati`} fuori dalla componente più grande` : ''}.`,
    round: (r, side, partner, cut) =>
      `Turno ${r}, rete ${side}: ${partner === 1 ? 'un nodo perde il suo partner' : `${partner} nodi perdono il loro partner`}${cut ? `, e ${cut === 1 ? 'un altro resta tagliato' : `altri ${cut} restano tagliati`} fuori dalla componente più grande` : ''}.`,
    end: (left) => ` Non si guasta altro: ${left} coppie su ${F2_N} funzionano ancora.`,
    soFar: (dead) => ` Finora ${dead} coppie su ${F2_N} sono rotte.`,
    aria: 'Due reti di 15 nodi, A sopra e B sotto, con una linea tratteggiata tra ogni nodo e il suo partner',
  },
}

const W = 320
const H = 186
const R = 7
const X = (i) => 22 + (i * (W - 36)) / (F2_N - 1)
const Y = [(i) => (i % 2 ? 60 : 34), (i) => (i % 2 ? 126 : 152)]
const LINKS = [F2_A, F2_B]

export default function FigureCascade({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [start, setStart] = useState(F2_START)
  const [shown, setShown] = useState(0)
  const c = useMemo(() => dependenceCascade(start.side, start.node), [start])
  const total = c.rounds.length
  const name = `${'AB'[start.side]}${start.node + 1}`
  const isDead = (side, v) => c.dead[side][v] > 0 && c.dead[side][v] <= shown
  const justDied = (side, v) => shown > 0 && c.dead[side][v] === shown
  let broken = 0
  for (let v = 0; v < F2_N; v++) if (isDead(0, v) || isDead(1, v)) broken++
  const cur = shown > 0 ? c.rounds[shown - 1] : null
  const text =
    shown === 0
      ? t.hint(name)
      : (shown === 1 ? t.first(name, cur.cut.length) : t.round(shown, 'AB'[cur.side], cur.partner.length, cur.cut.length)) + (shown === total ? t.end(c.left) : t.soFar(broken))

  const pick = (side, node) => {
    setStart({ side, node })
    setShown(1)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Pill primary onClick={() => setShown((s) => Math.min(total, s + 1))} disabled={shown >= total} data-action="next">
          {t.next}
        </Pill>
        <Pill
          onClick={() => {
            setStart(F2_START)
            setShown(0)
          }}
          data-action="reset"
        >
          {t.reset}
        </Pill>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full h-auto max-w-md bg-white border border-slate-200 rounded" role="img" aria-label={t.aria}>
        {Array.from({ length: F2_N }, (_, v) => {
          const a = isDead(0, v)
          const b = isDead(1, v)
          const pending = a !== b
          return <line key={`d${v}`} x1={X(v)} y1={Y[0](v) + R} x2={X(v)} y2={Y[1](v) - R} stroke={pending ? ORANGE_DARK : a ? GRID : MUTED} strokeWidth={pending ? 1.4 : 0.9} strokeDasharray="3 3" />
        })}
        {LINKS.map((links, side) =>
          links.map(([a, b], e) => {
            const gone = isDead(side, a) || isDead(side, b)
            const span = Math.abs(a - b)
            const bow = (side === 0 ? -1 : 1) * (span > 1 ? 9 * span : 0)
            const mx = (X(a) + X(b)) / 2
            const my = (Y[side](a) + Y[side](b)) / 2 + bow
            return (
              <path key={`${side}-${e}`} d={`M ${X(a)} ${Y[side](a)} Q ${mx} ${my} ${X(b)} ${Y[side](b)}`} fill="none" stroke={gone ? GRID : SLATE} strokeWidth={gone ? 0.8 : 1.3} />
            )
          }),
        )}
        {[0, 1].map((side) =>
          Array.from({ length: F2_N }, (_, v) => {
            const dead = isDead(side, v)
            const hot = justDied(side, v)
            const first = shown === 0 && side === start.side && v === start.node
            return (
              <g key={`${side}-${v}`} onClick={() => pick(side, v)} style={{ cursor: 'pointer' }} data-node={`${'AB'[side]}${v + 1}`}>
                <circle cx={X(v)} cy={Y[side](v)} r={R} fill={hot ? ORANGE_DARK : dead ? '#ffffff' : INK} stroke={first ? ORANGE_DARK : dead && !hot ? MUTED : '#ffffff'} strokeWidth={first ? 2.4 : 1} />
                <text x={X(v)} y={Y[side](v) + 3} textAnchor="middle" fontSize="7.5" fontFamily={MONO} fill={dead && !hot ? MUTED : '#ffffff'}>
                  {v + 1}
                </text>
              </g>
            )
          }),
        )}
        <text x="4" y="14" fontSize="10" fontFamily={MONO} fill={SLATE}>
          A
        </text>
        <text x="4" y={H - 6} fontSize="10" fontFamily={MONO} fill={SLATE}>
          B
        </text>
      </svg>
      <p className="mt-2 text-sm text-slate-700 leading-snug" data-readout="cascade" data-start={name} data-round={shown} data-rounds={total} data-broken={broken} data-left={c.left}>
        {text}
      </p>
    </div>
  )
}
