import { useEffect, useMemo, useState } from 'react'
import Slider from '../../Slider.jsx'
import useExperiment from '../../useExperiment.js'
import { ORANGE_DARK, INK, SLATE, Pill, Eyebrow, Stat, fmt } from '../../network/ui.jsx'
import Chart, { Legend } from '../../network/charts.jsx'
import EliminationSteps from './EliminationSteps.jsx'
import { SIZES, DEFAULT_SIZE, DEFAULT_GAMES, surveyJob, sampleGame } from './randomgames.js'

// Panel C: random m × m games with payoffs uniform on 0–1. For one size: how
// often a strategy is strictly dominated, how often iterated elimination
// solves the game, how many cells it leaves and how many stable cells there
// are. "All sizes" draws the same shares against m. One sample game is shown
// with its elimination.

const SKY = '#0369a1'
const GREEN = '#16a34a'

const T = {
  en: {
    m: 'Size m × m',
    games: 'Games G',
    note: 'A strategy is deleted only when one other strategy beats it everywhere. Module 03 will add mixtures of strategies, which delete a little more.',
    forSize: (m, g) => `${g.toLocaleString('en-US')} random ${m} × ${m} games`,
    dominated: 'At least one dominated strategy',
    solved: 'Solved by elimination',
    cells: (total) => `Cells left, on average (of ${total})`,
    none: 'No stable cell',
    one: 'Exactly one',
    more: 'Two or more',
    all: 'All sizes',
    stop: 'Stop',
    computing: 'Computing…',
    chart: (g) => `Against the size, ${g.toLocaleString('en-US')} games each`,
    axis: 'm',
    sample: (m) => `One random ${m} × ${m} game`,
    sampleNote: 'Payoffs in hundredths (0 to 99).',
    another: 'Another game',
    aria: 'Shares of random games against their size m',
    tableAria: 'Payoff table of a random game; deleted strategies are greyed out',
  },
  it: {
    m: 'Dimensione m × m',
    games: 'Giochi G',
    note: "Una strategia si cancella solo quando un'altra singola strategia la batte ovunque. Il modulo 03 aggiungerà le strategie miste, che permettono di cancellare un po' di più.",
    forSize: (m, g) => `${g.toLocaleString('it-IT')} giochi casuali ${m} × ${m}`,
    dominated: 'Almeno una strategia dominata',
    solved: "Risolti dall'eliminazione",
    cells: (total) => `Celle rimaste, in media (su ${total})`,
    none: 'Nessuna cella stabile',
    one: 'Esattamente una',
    more: 'Due o più',
    all: 'Tutte le dimensioni',
    stop: 'Ferma',
    computing: 'Calcolo in corso…',
    chart: (g) => `In funzione della dimensione, ${g.toLocaleString('it-IT')} giochi per dimensione`,
    axis: 'm',
    sample: (m) => `Un gioco casuale ${m} × ${m}`,
    sampleNote: 'Payoff in centesimi (da 0 a 99).',
    another: 'Un altro gioco',
    aria: 'Quote di giochi casuali in funzione della dimensione m',
    tableAria: 'Tabella dei payoff di un gioco casuale; le strategie cancellate sono in grigio',
  },
}

const hundredths = (v) => String(Math.floor(v * 100))

export default function DominancePanel({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [m, setM] = useState(DEFAULT_SIZE)
  const [games, setGames] = useState(DEFAULT_GAMES)
  const [sample, setSample] = useState(0)
  const [allKey, setAllKey] = useState(null)
  const one = useExperiment()
  const all = useExperiment()

  // The chosen size is surveyed again whenever m or G changes.
  useEffect(() => {
    one.run(surveyJob({ sizes: [m], games }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m, games])

  const s = one.data && one.data[m]
  const game = useMemo(() => sampleGame(m, sample), [m, sample])
  const showAll = all.data && allKey === games
  const line = (field) => SIZES.filter((k) => all.data[k] && all.data[k].games > 0).map((k) => [k, all.data[k][field]])

  return (
    <div>
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 max-w-3xl">
        <Slider label={t.m} min={2} max={8} step={1} value={m} onChange={(v) => { setM(v); setSample(0) }} format={(v) => `${v} × ${v}`} />
        <Slider label={t.games} min={500} max={20000} step={500} value={games} onChange={setGames} format={(v) => v.toLocaleString('en-US')} />
      </div>
      <p className="mt-2 text-xs text-slate-500 leading-snug max-w-3xl">{t.note}</p>

      <div className="mt-5">
        <Eyebrow>
          {t.forSize(m, s ? s.games : 0)}
          {one.running && <span className="ml-2 normal-case tracking-normal text-slate-500 font-sans font-normal">{t.computing}</span>}
        </Eyebrow>
        <div className="mt-2 grid grid-cols-2 lg:grid-cols-3 gap-3" data-role="size">
          <Stat label={t.dominated}>{fmt(s && s.dominated, 3)}</Stat>
          <Stat label={t.solved}>{fmt(s && s.solved, 3)}</Stat>
          <Stat label={t.cells(m * m)}>{fmt(s && s.cells, 2)}</Stat>
          <Stat label={t.none}>{fmt(s && s.none, 3)}</Stat>
          <Stat label={t.one}>{fmt(s && s.one, 3)}</Stat>
          <Stat label={t.more}>{fmt(s && s.more, 3)}</Stat>
        </div>
      </div>

      <div className="mt-5 grid gap-x-8 gap-y-6 lg:grid-cols-2 items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {all.running ? (
              <Pill onClick={all.cancel}>{t.stop}</Pill>
            ) : (
              <Pill
                primary
                onClick={() => {
                  setAllKey(games)
                  all.run(surveyJob({ sizes: SIZES, games }))
                }}
              >
                {t.all}
              </Pill>
            )}
            {all.running && <span className="text-xs text-slate-500">{t.computing}</span>}
          </div>
          {showAll && (
            <div className="mt-3" data-role="all-sizes">
              <Eyebrow>{t.chart(games)}</Eyebrow>
              <Chart
                aria={t.aria}
                height={190}
                x={{ min: 2, max: 8, ticks: SIZES, label: t.axis }}
                y={{ min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] }}
                series={[
                  { points: line('dominated'), color: SLATE, dots: true },
                  { points: line('solved'), color: ORANGE_DARK, dots: true },
                  { points: line('none'), color: INK, dots: true, dashed: true },
                  { points: line('one'), color: SKY, dots: true },
                  { points: line('more'), color: GREEN, dots: true },
                ]}
              />
              <Legend
                items={[
                  { label: t.dominated, color: SLATE },
                  { label: t.solved, color: ORANGE_DARK },
                  { label: t.none, color: INK, dashed: true },
                  { label: t.one, color: SKY },
                  { label: t.more, color: GREEN },
                ]}
              />
              <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      {[t.axis, t.dominated, t.solved, t.none, t.one, t.more].map((h) => (
                        <th key={h} className="bg-slate-50 border-b border-slate-200 px-2 py-1.5 text-left align-bottom font-mono text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono tabular-nums text-slate-900">
                    {SIZES.filter((k) => all.data[k] && all.data[k].games > 0).map((k) => (
                      <tr key={k}>
                        <td className="border-b border-slate-100 px-2 py-1.5">{k}</td>
                        {['dominated', 'solved', 'none', 'one', 'more'].map((f) => (
                          <td key={f} className="border-b border-slate-100 px-2 py-1.5">
                            {fmt(all.data[k][f], 3)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Eyebrow>{t.sample(m)}</Eyebrow>
            <Pill onClick={() => setSample(sample + 1)}>{t.another}</Pill>
          </div>
          <div className="mt-2">
            <EliminationSteps key={`${m}-${sample}`} game={game} lang={lang} format={hundredths} compact={m > 4} aria={t.tableAria} />
          </div>
          <p className="text-xs text-slate-500">{t.sampleNote}</p>
        </div>
      </div>
    </div>
  )
}
