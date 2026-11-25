import en from '../../../../content/game-theory-lab/evolution-and-learning.en.md?raw'
import it from '../../../../content/game-theory-lab/evolution-and-learning.it.md?raw'
import SimplexPanel from './SimplexPanel.jsx'
import MoranPanel from './MoranPanel.jsx'
import HedgePanel from './HedgePanel.jsx'
import FigureFates from './FigureFates.jsx'
import FigureTraffic from './FigureTraffic.jsx'
import { observe, exercises } from './texts.js'

// Game Theory Lab, module 07 "Evolution and learning": the content object
// that src/pages/lab/loaders.js hands to LabLecture. This folder is one
// chunk; module 01's games.js comes from a shared chunk.
export default {
  lectures: { en, it },
  figures: {
    fates: {
      Component: FigureFates,
      caption: {
        en: 'Four fates: move the point on module 01’s map, and the phase line shows where the share of C goes.',
        it: 'Quattro destini: sposta il punto sulla mappa del modulo 01, e la retta delle fasi mostra dove va la quota di C.',
      },
    },
    traffic: {
      Component: FigureTraffic,
      caption: {
        en: 'The traffic light: the payoffs of chicken’s correlated equilibria, beyond the Nash equilibria and the coins.',
        it: 'Il semaforo: i payoff degli equilibri correlati del gioco del pollo, oltre gli equilibri di Nash e le monete.',
      },
    },
  },
  panels: [
    {
      id: 'rps',
      title: { en: 'Rock, paper, scissors in a population', it: 'Sasso, carta, forbici in una popolazione' },
      Component: SimplexPanel,
      observe: observe.rps,
    },
    {
      id: 'moran',
      title: { en: 'One mutant', it: 'Un mutante' },
      Component: MoranPanel,
      observe: observe.moran,
    },
    {
      id: 'hedge',
      title: { en: 'Learning by regret', it: 'Imparare dal regret' },
      Component: HedgePanel,
      observe: observe.hedge,
    },
  ],
  exercises,
}
