import { useState } from 'react'
import { Pill } from '../../network/ui.jsx'
import EliminationSteps from './EliminationSteps.jsx'
import { F1_PRESETS } from './games.js'

// Live figure F1: iterated elimination of strictly dominated strategies on
// three three-by-three games. Buttons only, so it never captures a swipe.

const T = {
  en: {
    presets: { four: 'Four steps', halfway: 'Stops half-way', nothing: 'Nothing to delete' },
    aria: 'Payoff table of a three-by-three game; deleted strategies are greyed out',
  },
  it: {
    presets: { four: 'Quattro passi', halfway: 'Si ferma a metà', nothing: 'Niente da cancellare' },
    aria: 'Tabella dei payoff di un gioco tre per tre; le strategie cancellate sono in grigio',
  },
}

export default function FigureEliminate({ lang = 'en' }) {
  const t = T[lang] || T.en
  const [preset, setPreset] = useState('four')
  return (
    <div className="max-w-md mx-auto">
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.keys(F1_PRESETS).map((id) => (
          <Pill key={id} active={preset === id} onClick={() => setPreset(id)}>
            {t.presets[id]}
          </Pill>
        ))}
      </div>
      <EliminationSteps key={preset} game={F1_PRESETS[preset]} lang={lang} aria={t.aria} />
    </div>
  )
}
