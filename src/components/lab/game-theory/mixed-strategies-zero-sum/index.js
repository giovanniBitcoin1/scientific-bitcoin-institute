import en from '../../../../content/game-theory-lab/mixed-strategies-zero-sum.en.md?raw'
import it from '../../../../content/game-theory-lab/mixed-strategies-zero-sum.it.md?raw'
import AllEquilibriaPanel from './AllEquilibriaPanel.jsx'
import LearningPanel from './LearningPanel.jsx'
import ReaderPanel from './ReaderPanel.jsx'
import FigureSquare from './FigureSquare.jsx'
import FigureMinimax from './FigureMinimax.jsx'
import { observe, exercises } from './texts.js'

// Game Theory Lab, module 03 "Mixed strategies and zero-sum games": the
// content object that src/pages/lab/loaders.js hands to LabLecture. This
// folder is one chunk; the logic it imports from module 01 (games.js,
// randomgames.js) goes into the chunk the modules share.
export default {
  lectures: { en, it },
  // Live figures, placed in the lecture by a ```figure block holding the id.
  figures: {
    square: {
      Component: FigureSquare,
      caption: {
        en: 'Two best responses in a square: where the two lines cross, neither player wants to change mix.',
        it: 'Due risposte migliori in un quadrato: dove le due linee si incrociano, nessuno dei due vuole cambiare miscela.',
      },
    },
    minimax: {
      Component: FigureMinimax,
      caption: {
        en: 'The best worst case: the kicker picks the peak of the lower line, the keeper the bottom of the higher one, and they meet.',
        it: 'Il miglior caso peggiore: il rigorista sceglie il picco della linea più bassa, il portiere il fondo di quella più alta, e si incontrano.',
      },
    },
  },
  panels: [
    {
      id: 'all-equilibria',
      title: { en: 'All the equilibria', it: 'Tutti gli equilibri' },
      Component: AllEquilibriaPanel,
      observe: observe.all,
    },
    {
      id: 'learning',
      title: { en: 'Learning to mix', it: 'Imparare a mescolare' },
      Component: LearningPanel,
      observe: observe.learning,
    },
    {
      id: 'reader',
      title: { en: 'Can you be read?', it: 'Ti si può leggere?' },
      Component: ReaderPanel,
      observe: observe.reader,
    },
  ],
  exercises,
}
