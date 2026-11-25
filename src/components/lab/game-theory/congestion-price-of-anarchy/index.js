import en from '../../../../content/game-theory-lab/congestion-price-of-anarchy.en.md?raw'
import it from '../../../../content/game-theory-lab/congestion-price-of-anarchy.it.md?raw'
import FigureTwoRoads from './FigureTwoRoads.jsx'
import FigureBraess from './FigureBraess.jsx'
import ParallelPanel from './ParallelPanel.jsx'
import AtomicPanel from './AtomicPanel.jsx'
import CostSharingPanel from './CostSharingPanel.jsx'
import { observe, exercises } from './texts.js'

// Game Theory Lab, module 08 "Congestion and the price of anarchy": the
// content object that src/pages/lab/loaders.js hands to LabLecture. This
// folder is one chunk.
export default {
  lectures: { en, it },
  figures: {
    tworoads: {
      Component: FigureTwoRoads,
      caption: {
        en: 'Two roads: Pigou’s example, the cost of each road and the average against the share on the lower road, with and without a toll.',
        it: 'Due strade: l’esempio di Pigou, il costo di ciascuna strada e la media in funzione della quota sulla strada in basso, con e senza pedaggio.',
      },
    },
    braess: {
      Component: FigureBraess,
      caption: {
        en: 'Braess’s paradox: open the shortcut, set its cost, and the widths show where the drivers go.',
        it: 'Il paradosso di Braess: apri la scorciatoia, scegline il costo, e gli spessori mostrano dove vanno gli automobilisti.',
      },
    },
  },
  panels: [
    {
      id: 'parallel',
      title: { en: 'How bad can it get?', it: 'Quanto può andar male?' },
      Component: ParallelPanel,
      observe: observe.parallel,
    },
    {
      id: 'atomic',
      title: { en: 'Drivers who count', it: 'Automobilisti che contano' },
      Component: AtomicPanel,
      observe: observe.atomic,
    },
    {
      id: 'sharing',
      title: { en: 'Sharing the cost of a road', it: 'Dividere il costo di una strada' },
      Component: CostSharingPanel,
      observe: observe.sharing,
    },
  ],
  exercises,
}
