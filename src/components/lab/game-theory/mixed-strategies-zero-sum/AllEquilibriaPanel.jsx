import { useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { Pill, Eyebrow, fmt } from '../../network/ui.jsx'
import PayoffTable, { TableLegend, ROW_COLOR, COL_COLOR } from '../PayoffTable.jsx'
import { bestResponses } from '../what-is-a-game/games.js'
import { classic, rps, SHAPLEY, penaltyGame, exercise5 } from './mixed.js'
import { equilibria, tableOf, showNumber, surveyJob, DEFAULT_GAMES, DEFAULT_TABLE_SIZE, SURVEY_SIZES } from './support.js'

// Panel A: all the equilibria of a table, pure and mixed, by support
// enumeration. A random table from 2 × 2 to 4 × 4 with whole payoffs 0–9
// (degenerate ones redrawn), or a preset. "Survey" counts the equilibria of
// random games with payoffs uniform on 0–1, the games of module 01.

export const PRESET_IDS = ['pd', 'stag', 'chicken', 'battle', 'pennies', 'coordination', 'rps', 'rps2', 'penalty', 'shapley', 'exercise5']

const T = {
  en: {
    presets: {
      pd: "Prisoner's Dilemma",
      stag: 'Stag hunt',
      chicken: 'Chicken',
      battle: 'Battle of the sexes',
      pennies: 'Matching pennies',
      coordination: 'Pure coordination',
      rps: 'Rock-paper-scissors',
      rps2: 'Rock beats scissors by 2',
      penalty: 'Penalty kick',
      shapley: "Shapley's game",
      exercise5: 'Exercise 5',
    },
    names: {
      pd: ['C', 'D'],
      stag: ['Stag', 'Hare'],
      chicken: ['Swerve', 'Straight'],
      battle: ['Concert', 'Match'],
      pennies: ['Heads', 'Tails'],
      coordination: ['Left', 'Right'],
      rps: ['Rock', 'Paper', 'Scissors'],
      penalty: ['L', 'R'],
    },
    size: 'Size m × m',
    newGame: 'New game',
    table: (n) => `Random table no. ${n}`,
    preset: 'A preset',
    eq: (n) => (n === 1 ? 'One equilibrium' : `${n} equilibria`),
    row: 'row player',
    col: 'column player',
    pays: (u, v) => `expected payoffs ${u} and ${v}`,
    plays: (s) => `plays ${s}`,
    withP: (s, p) => `${s} with ${p}`,
    pure: 'pure',
    mixed: 'mixed',
    rings: 'Ringed cells: the pure equilibria. Mixed ones are listed only.',
    games: 'Games G per size',
    survey: 'Survey',
    stop: 'Stop',
    computing: 'Computing…',
    surveyTitle: (g) => `Random games, payoffs uniform on 0–1 (the games of module 01): ${g.toLocaleString('en-US')} of each size`,
    cols: ['m', 'Equilibria, mean', 'One', 'Three', 'Five', 'Seven or more', 'Even number', 'No pure one'],
    aria: 'Payoff table of the game',
  },
  it: {
    presets: {
      pd: 'Dilemma del prigioniero',
      stag: 'Caccia al cervo',
      chicken: 'Gioco del pollo',
      battle: 'Battaglia dei sessi',
      pennies: 'Pari o dispari',
      coordination: 'Coordinamento puro',
      rps: 'Sasso-carta-forbici',
      rps2: 'Il sasso batte le forbici per 2',
      penalty: 'Calcio di rigore',
      shapley: 'Il gioco di Shapley',
      exercise5: 'Esercizio 5',
    },
    names: {
      pd: ['C', 'D'],
      stag: ['Cervo', 'Lepre'],
      chicken: ['Sterza', 'Dritto'],
      battle: ['Concerto', 'Partita'],
      pennies: ['Testa', 'Croce'],
      coordination: ['Sinistra', 'Destra'],
      rps: ['Sasso', 'Carta', 'Forbici'],
      penalty: ['S', 'D'],
    },
    size: 'Dimensione m × m',
    newGame: 'Nuovo gioco',
    table: (n) => `Tabella casuale n. ${n}`,
    preset: 'Un gioco preimpostato',
    eq: (n) => (n === 1 ? 'Un equilibrio' : `${n} equilibri`),
    row: 'giocatore di riga',
    col: 'giocatore di colonna',
    pays: (u, v) => `payoff attesi ${u} e ${v}`,
    plays: (s) => `gioca ${s}`,
    withP: (s, p) => `${s} con ${p}`,
    pure: 'puro',
    mixed: 'misto',
    rings: 'Celle cerchiate: gli equilibri puri. Quelli misti sono solo elencati.',
    games: 'Giochi G per dimensione',
    survey: 'Rassegna',
    stop: 'Ferma',
    computing: 'Calcolo in corso…',
    surveyTitle: (g) => `Giochi casuali, payoff uniformi tra 0 e 1 (i giochi del modulo 01): ${g.toLocaleString('it-IT')} per dimensione`,
    cols: ['m', 'Equilibri, media', 'Uno', 'Tre', 'Cinque', 'Sette o più', 'Numero pari', 'Nessuno puro'],
    aria: 'Tabella dei payoff del gioco',
  },
}

export function presetGame(id, lang = 'en') {
  const t = T[lang] || T.en
  if (id === 'rps') return rps(1, t.names.rps)
  if (id === 'rps2') return rps(2, t.names.rps)
  if (id === 'penalty') return penaltyGame(undefined, t.names.penalty, t.names.penalty)
  if (id === 'shapley') return SHAPLEY
  if (id === 'exercise5') return exercise5()
  return classic(id, t.names[id])
}

export default function AllEquilibriaPanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [m, setM] = useState(DEFAULT_TABLE_SIZE)
  const [index, setIndex] = useState(0)
  const [preset, setPreset] = useState(null)
  const [games, setGames] = useState(DEFAULT_GAMES)
  const [surveyKey, setSurveyKey] = useState(null)
  const exp = useExperiment()

  const game = useMemo(() => (preset ? presetGame(preset, lang) : tableOf(m, index)), [preset, m, index, lang])
  const list = useMemo(() => equilibria(game), [game])
  const marks = useMemo(() => bestResponses(game), [game])
  const pure = list.filter((e) => e.rows.length === 1).map((e) => [e.rows[0], e.cols[0]])
  const digits = preset === 'penalty' ? 2 : 3
  const mix = (v, names) => {
    const used = v.map((p, k) => [p, k]).filter(([p]) => p > 1e-12)
    if (used.length === 1) return t.plays(names[used[0][1]])
    return used.map(([p, k]) => t.withP(names[k], showNumber(p, 3, lang))).join(', ')
  }

  const showSurvey = exp.data && surveyKey === games
  const rows = showSurvey ? SURVEY_SIZES.filter((k) => exp.data[k] && exp.data[k].games > 0) : []

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {PRESET_IDS.map((id) => (
          <Pill key={id} active={preset === id} onClick={() => setPreset(id)}>
            {t.presets[id]}
          </Pill>
        ))}
      </div>
      <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl items-end">
        <Slider
          label={t.size}
          min={2}
          max={4}
          step={1}
          value={m}
          onChange={(v) => {
            setM(v)
            setIndex(0)
            setPreset(null)
          }}
          format={(v) => `${v} × ${v}`}
        />
        <div>
          <Pill
            primary
            onClick={() => {
              if (preset) setPreset(null)
              else setIndex(index + 1)
            }}
          >
            {t.newGame}
          </Pill>
        </div>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2 items-start">
        <div className="min-w-0">
          <Eyebrow>{preset ? t.preset : t.table(index + 1)}</Eyebrow>
          <div className="mt-2 max-w-sm">
            <PayoffTable game={game} marks={marks} stable={pure} compact={game.a.length > 3 || game.a[0].length > 3} aria={t.aria} />
          </div>
          <TableLegend lang={lang} />
          <p className="mt-1 text-xs text-slate-500 leading-snug">{t.rings}</p>
        </div>
        <div className="min-w-0" data-role="all-eq">
          <Eyebrow>{t.eq(list.length)}</Eyebrow>
          <ol className="mt-2 space-y-2 text-sm text-slate-700">
            {list.map((e, k) => (
              <li key={k} className="rounded-lg border border-slate-200 bg-white px-3 py-2 leading-snug">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  {k + 1}. {e.rows.length === 1 ? t.pure : t.mixed}
                </span>
                <div className="font-mono text-xs tabular-nums">
                  <span style={{ color: ROW_COLOR }}>{t.row}: {mix(e.x, game.rows)}</span>
                  <br />
                  <span style={{ color: COL_COLOR }}>{t.col}: {mix(e.y, game.cols)}</span>
                  <br />
                  <span className="text-slate-600">{t.pays(showNumber(e.u, digits, lang), showNumber(e.v, digits, lang))}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl items-end">
        <Slider label={t.games} min={500} max={20000} step={500} value={games} onChange={setGames} format={(v) => v.toLocaleString(lang === 'it' ? 'it-IT' : 'en-US')} />
        <div className="flex flex-wrap items-center gap-2">
          {exp.running ? (
            <Pill onClick={exp.cancel}>{t.stop}</Pill>
          ) : (
            <Pill
              primary
              onClick={() => {
                setSurveyKey(games)
                exp.run(surveyJob({ games }))
              }}
            >
              {t.survey}
            </Pill>
          )}
          {exp.running && <span className="text-xs text-slate-500">{t.computing}</span>}
        </div>
      </div>

      {showSurvey && rows.length > 0 && (
        <div className="mt-4" data-role="all-eq-survey">
          <Eyebrow>{t.surveyTitle(games)}</Eyebrow>
          <div className="mt-2 max-w-3xl overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  {t.cols.map((h) => (
                    <th key={h} className="bg-slate-50 border-b border-slate-200 px-2 py-1.5 text-left align-bottom font-mono text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums text-slate-900">
                {rows.map((k) => {
                  const d = exp.data[k]
                  return (
                    <tr key={k}>
                      <td className="border-b border-slate-100 px-2 py-1.5">{k}</td>
                      <td className="border-b border-slate-100 px-2 py-1.5">{fmt(d.mean, 3)}</td>
                      {['one', 'three', 'five', 'sevenUp'].map((f) => (
                        <td key={f} className="border-b border-slate-100 px-2 py-1.5">
                          {fmt(d[f], 3)}
                        </td>
                      ))}
                      <td className="border-b border-slate-100 px-2 py-1.5">{d.even}</td>
                      <td className="border-b border-slate-100 px-2 py-1.5">{fmt(d.noPure, 3)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
