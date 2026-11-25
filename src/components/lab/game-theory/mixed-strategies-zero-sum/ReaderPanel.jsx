import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { Pill, Eyebrow, Stat } from '../../network/ui.jsx'
import { playSequence, coinMoves, simulateJob, ROUNDS, DEFAULT_S, DEFAULT_H } from './reader.js'

// Panel C: can you be read? Matching pennies against a machine that has fixed
// its guess before the reader clicks, from what the reader did after the same
// last two moves earlier in the game. Then simulated players, through
// useExperiment.

const T = {
  en: {
    heads: 'Heads',
    tails: 'Tails',
    H: 'H',
    T: 'T',
    coin: 'Let a coin play 100 rounds for me',
    again: 'Start again',
    intro: 'The machine wins a round when it guesses your move. It has already chosen its guess when you click.',
    you: 'You',
    machine: 'Machine',
    rate: 'Machine’s win rate',
    fromTwenty: 'shown from round 20',
    last: 'Last rounds (yours / its guess)',
    none: 'Click Heads or Tails to start.',
    simTitle: 'Simulated players',
    kinds: { switch: 'Switches too often', heads: 'Favours heads', coin: 'A fair coin' },
    s: 'Chance s of changing side',
    h: 'Chance h of heads',
    run: 'Play',
    stop: 'Stop',
    computing: 'Computing…',
    result: (n, r) => `${n} players, ${r.toLocaleString('en-US')} rounds each`,
    mean: 'Machine’s mean win rate',
    sd: 'Spread (standard deviation)',
  },
  it: {
    heads: 'Testa',
    tails: 'Croce',
    H: 'T',
    T: 'C',
    coin: 'Fai giocare 100 turni a una moneta per me',
    again: 'Ricomincia',
    intro: 'La macchina vince un turno quando indovina la tua mossa. Quando clicchi ha già scelto la sua ipotesi.',
    you: 'Tu',
    machine: 'Macchina',
    rate: 'Quota di vittorie della macchina',
    fromTwenty: 'mostrata dal turno 20',
    last: 'Ultimi turni (tuo / sua ipotesi)',
    none: 'Clicca Testa o Croce per cominciare.',
    simTitle: 'Giocatori simulati',
    kinds: { switch: 'Cambia troppo spesso', heads: 'Preferisce testa', coin: 'Una moneta onesta' },
    s: 'Probabilità s di cambiare lato',
    h: 'Probabilità h di testa',
    run: 'Gioca',
    stop: 'Ferma',
    computing: 'Calcolo in corso…',
    result: (n, r) => `${n} giocatori, ${r.toLocaleString('it-IT')} turni ciascuno`,
    mean: 'Quota media di vittorie della macchina',
    sd: 'Dispersione (deviazione standard)',
  },
}

export default function ReaderPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [moves, setMoves] = useState([])
  const [presses, setPresses] = useState(0)
  const [kind, setKind] = useState('switch')
  const [s, setS] = useState(DEFAULT_S)
  const [h, setH] = useState(DEFAULT_H)
  const [simKey, setSimKey] = useState(null)
  const exp = useExperiment()
  const game = useMemo(() => playSequence(moves), [moves])
  const dec = (v, d) => (lang === 'it' ? v.toFixed(d).replace('.', ',') : v.toFixed(d))
  const n = moves.length
  const param = kind === 'switch' ? s : kind === 'heads' ? h : 0.5
  const key = `${kind}${param}`
  const show = (m) => t[m]

  return (
    <div>
      <p className="text-sm text-slate-700 leading-snug max-w-2xl">{t.intro}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Pill primary onClick={() => setMoves((m) => [...m, 'H'])}>
          {t.heads}
        </Pill>
        <Pill primary onClick={() => setMoves((m) => [...m, 'T'])}>
          {t.tails}
        </Pill>
        <Pill
          onClick={() => {
            setMoves((m) => [...m, ...coinMoves(presses)])
            setPresses((p) => p + 1)
          }}
        >
          {t.coin}
        </Pill>
        {n > 0 && <Pill onClick={() => setMoves([])}>{t.again}</Pill>}
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl" data-role="reader-score">
        <Stat label={t.you}>{n - game.machine}</Stat>
        <Stat label={t.machine}>{game.machine}</Stat>
        <Stat label={t.rate}>{n >= 20 ? dec(game.machine / n, 3) : <span className="font-sans text-xs text-slate-500">{t.fromTwenty}</span>}</Stat>
        <Stat label={t.last}>
          {n === 0 ? (
            <span className="font-sans text-xs text-slate-500">{t.none}</span>
          ) : (
            <span className="text-xs">
              {moves
                .slice(-6)
                .map((m, k) => `${show(m)}/${show(game.guesses[n - Math.min(6, n) + k])}`)
                .join(' ')}
            </span>
          )}
        </Stat>
      </div>

      <div className="mt-8">
        <Eyebrow>{t.simTitle}</Eyebrow>
        <div className="mt-2 flex flex-wrap gap-2">
          {['switch', 'heads', 'coin'].map((k) => (
            <Pill key={k} active={kind === k} onClick={() => setKind(k)}>
              {t.kinds[k]}
            </Pill>
          ))}
        </div>
        <div className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl items-end">
          {kind === 'switch' && <Slider label={t.s} min={0.5} max={0.9} step={0.05} value={s} onChange={(v) => setS(Math.round(v * 100) / 100)} format={(v) => dec(v, 2)} />}
          {kind === 'heads' && <Slider label={t.h} min={0.5} max={0.9} step={0.05} value={h} onChange={(v) => setH(Math.round(v * 100) / 100)} format={(v) => dec(v, 2)} />}
          {kind === 'coin' && <div />}
          <div className="flex flex-wrap items-center gap-2">
            {exp.running ? (
              <Pill onClick={exp.cancel}>{t.stop}</Pill>
            ) : (
              <Pill
                primary
                onClick={() => {
                  setSimKey(key)
                  exp.run(simulateJob({ kind, param }))
                }}
              >
                {t.run}
              </Pill>
            )}
            {exp.running && <span className="text-xs text-slate-500">{t.computing}</span>}
          </div>
        </div>
        {exp.data && simKey === key && exp.data.players > 0 && (
          <div className="mt-3 max-w-3xl" data-role="reader-sim">
            <p className="text-xs text-slate-500">{t.result(exp.data.players, ROUNDS)}</p>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <Stat label={t.mean}>{dec(exp.data.mean, 3)}</Stat>
              <Stat label={t.sd}>{dec(exp.data.sd, 3)}</Stat>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

