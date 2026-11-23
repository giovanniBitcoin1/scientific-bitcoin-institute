import en from '../../../../content/network-lab/epidemics-on-networks.en.md?raw'
import it from '../../../../content/network-lab/epidemics-on-networks.it.md?raw'
import ThresholdPanel from './ThresholdPanel.jsx'
import HubsFirstPanel from './HubsFirstPanel.jsx'
import VaccinatePanel from './VaccinatePanel.jsx'
import FigureSeed from './FigureSeed.jsx'
import FigureGrowth from './FigureGrowth.jsx'
import { observe, exercises } from './texts.js'

// Network Lab module 12 "Epidemics on networks": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk; it
// imports module 05's generating functions (genfun.js), module 08's sources
// and removal orders (mixing.js), module 11's seeds, moments and largest
// component (robust.js), module 02's SI spread (friends.js) and shared lab
// code. No shared code changed.
export default {
  lectures: { en, it },
  figures: {
    seed: {
      Component: FigureSeed,
      caption: {
        en: 'One seed, many futures: the same infection from the same node, 200 times.',
        it: 'Un seme, molti destini: la stessa infezione dallo stesso nodo, 200 volte.',
      },
    },
    growth: {
      Component: FigureGrowth,
      caption: {
        en: 'Exponential or power law? Three ways of spreading, on semi-log and on log-log axes.',
        it: 'Esponenziale o legge di potenza? Tre modi di diffondersi, su assi semilogaritmici e log-log.',
      },
    },
  },
  panels: [
    { id: 'threshold', title: { en: 'Threshold or no threshold', it: 'Soglia o niente soglia' }, Component: ThresholdPanel, observe: observe.threshold },
    { id: 'hubs', title: { en: 'Hubs first', it: 'Prima gli hub' }, Component: HubsFirstPanel, observe: observe.hubs },
    { id: 'vaccinate', title: { en: 'Whom to vaccinate', it: 'Chi vaccinare' }, Component: VaccinatePanel, observe: observe.vaccinate },
  ],
  exercises,
}
