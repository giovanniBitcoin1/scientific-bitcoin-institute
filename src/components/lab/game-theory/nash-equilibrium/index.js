import en from '../../../../content/game-theory-lab/nash-equilibrium.en.md?raw'
import it from '../../../../content/game-theory-lab/nash-equilibrium.it.md?raw'
import EquilibriaPanel from './EquilibriaPanel.jsx'
import ConventionsPanel from './ConventionsPanel.jsx'
import ContestPanel from './ContestPanel.jsx'
import FigureStagHunt from './FigureStagHunt.jsx'
import FigureCournot from './FigureCournot.jsx'
import { observe, exercises } from './texts.js'

// Game Theory Lab, module 02 "Nash equilibrium": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk; the
// logic it imports from module 01 (games.js, randomgames.js) goes into a
// chunk the two modules share.
export default {
  lectures: { en, it },
  // Live figures, placed in the lecture by a ```figure block holding the id.
  figures: {
    staghunt: {
      Component: FigureStagHunt,
      caption: {
        en: 'How sure must you be? The stag pays more only when the other hunts it with probability above q*.',
        it: "Quanto devi essere sicuro? Il cervo rende di più solo se l'altro lo caccia con probabilità superiore a q*.",
      },
    },
    cournot: {
      Component: FigureCournot,
      caption: {
        en: 'Where the best responses cross: two firms choose quantities, and the price is 10 minus the total.',
        it: 'Dove si incrociano le risposte migliori: due imprese scelgono le quantità, e il prezzo è 10 meno il totale.',
      },
    },
  },
  panels: [
    {
      id: 'equilibria',
      title: { en: 'Find the equilibria', it: 'Trova gli equilibri' },
      Component: EquilibriaPanel,
      observe: observe.equilibria,
    },
    {
      id: 'conventions',
      title: { en: 'Which convention?', it: 'Quale convenzione?' },
      Component: ConventionsPanel,
      observe: observe.conventions,
    },
    {
      id: 'contest',
      title: { en: 'A contest for a prize', it: 'Una gara per un premio' },
      Component: ContestPanel,
      observe: observe.contest,
    },
  ],
  exercises,
}
