import en from '../../../../content/network-lab/fitness-and-competition.en.md?raw'
import it from '../../../../content/network-lab/fitness-and-competition.it.md?raw'
import FitPanel from './FitPanel.jsx'
import CondensationPanel from './CondensationPanel.jsx'
import AgeDensityPanel from './AgeDensityPanel.jsx'
import FigureRace from './FigureRace.jsx'
import FigureEnergy from './FigureEnergy.jsx'
import { observe, exercises } from './texts.js'

// Network Lab, module 07 "Fitness and competition": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk; it
// shares module 06's Fenwick sampler (growth.js) and module 05's fit.js, which
// Vite puts in chunks of their own, loaded only when the lab is unlocked.
export default {
  lectures: { en, it },
  figures: {
    race: {
      Component: FigureRace,
      caption: {
        en: 'The race: when does a fitter latecomer overtake an incumbent? Mean-field curves on log axes.',
        it: "La gara: quando un ultimo arrivato più adatto sorpassa un veterano? Curve di campo medio su assi logaritmici.",
      },
    },
    energy: {
      Component: FigureEnergy,
      caption: {
        en: 'Fitness as energy: each node a level ε = −ln η, each link a particle on the level of the node it points to.',
        it: 'La fitness come energia: ogni nodo un livello ε = −ln η, ogni collegamento una particella sul livello del nodo a cui punta.',
      },
    },
  },
  panels: [
    { id: 'fit', title: { en: 'The fit get rich', it: 'I più adatti si arricchiscono' }, Component: FitPanel, observe: observe.fit },
    { id: 'condensation', title: { en: 'One node above the rest', it: 'Un nodo sopra tutti' }, Component: CondensationPanel, observe: observe.condensation },
    { id: 'age', title: { en: 'Age and density', it: 'Età e densità' }, Component: AgeDensityPanel, observe: observe.age },
  ],
  exercises,
}
