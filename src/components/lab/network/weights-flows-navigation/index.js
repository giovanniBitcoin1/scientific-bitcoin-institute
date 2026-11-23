import en from '../../../../content/network-lab/weights-flows-navigation.en.md?raw'
import it from '../../../../content/network-lab/weights-flows-navigation.it.md?raw'
import WeightsPanel from './WeightsPanel.jsx'
import PaymentsPanel from './PaymentsPanel.jsx'
import NavigationPanel from './NavigationPanel.jsx'
import FigureStrength from './FigureStrength.jsx'
import FigureFlow from './FigureFlow.jsx'
import { observe, exercises } from './texts.js'

// Network Lab module 10 "Weights, flows and navigation": the content object
// that src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk;
// it imports only shared lab code (rng.js, graphUtils.js, Slider,
// useExperiment, the network ui and charts).
export default {
  lectures: { en, it },
  figures: {
    strength: {
      Component: FigureStrength,
      caption: {
        en: 'Strength and disparity: move the six weights and watch Y against 1/k, and which links the filter keeps.',
        it: 'Forza e disparità: sposta i sei pesi e guarda Y rispetto a 1/k, e quali collegamenti tiene il filtro.',
      },
    },
    flow: {
      Component: FigureFlow,
      caption: {
        en: 'One route or several: the widest single route, the maximum flow and the minimum cut of a small network.',
        it: 'Una strada o più: il singolo percorso più largo, il flusso massimo e il taglio minimo di una piccola rete.',
      },
    },
  },
  panels: [
    { id: 'weights', title: { en: 'Weights matter', it: 'I pesi contano' }, Component: WeightsPanel, observe: observe.weights },
    { id: 'payments', title: { en: 'How much can flow?', it: 'Quanto può passare?' }, Component: PaymentsPanel, observe: observe.payments },
    { id: 'navigate', title: { en: 'Find your way', it: 'Trova la strada' }, Component: NavigationPanel, observe: observe.navigate },
  ],
  exercises,
}
