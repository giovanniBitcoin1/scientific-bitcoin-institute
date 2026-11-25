import en from '../../../../content/game-theory-lab/incomplete-information-signalling.en.md?raw'
import it from '../../../../content/game-theory-lab/incomplete-information-signalling.it.md?raw'
import LemonsPanel from './LemonsPanel.jsx'
import SignalPanel from './SignalPanel.jsx'
import CheapTalkPanel from './CheapTalkPanel.jsx'
import FigureTypes from './FigureTypes.jsx'
import FigureGlobal from './FigureGlobal.jsx'
import { observe, exercises } from './texts.js'

// Game Theory Lab, module 05 "Incomplete information and signals": the
// content object that src/pages/lab/loaders.js hands to LabLecture. This
// folder is one chunk; GameTree.jsx and PayoffTable.jsx sit next to the
// module folders, shared by the lab.
export default {
  lectures: { en, it },
  figures: {
    types: {
      Component: FigureTypes,
      caption: {
        en: 'Who is the incumbent? Nature draws its type; the newcomer, who cannot see it, enters only if a tough incumbent is unlikely enough.',
        it: 'Chi è l’incumbent? La Natura ne estrae il tipo; l’entrante, che non lo vede, entra solo se un incumbent duro è abbastanza improbabile.',
      },
    },
    doubt: {
      Component: FigureGlobal,
      caption: {
        en: 'A little doubt: deleting what nobody would choose shrinks the open band from both ends to the single point 1/2.',
        it: 'Un po’ di dubbio: eliminando ciò che nessuno sceglierebbe, la fascia aperta si restringe dai due lati fino al solo punto 1/2.',
      },
    },
  },
  panels: [
    {
      id: 'lemons',
      title: { en: 'The market that empties', it: 'Il mercato che si svuota' },
      Component: LemonsPanel,
      observe: observe.lemons,
    },
    {
      id: 'signal',
      title: { en: 'Separate or pool?', it: 'Separarsi o confondersi?' },
      Component: SignalPanel,
      observe: observe.signal,
    },
    {
      id: 'talk',
      title: { en: 'Words that cost nothing', it: 'Parole che non costano nulla' },
      Component: CheapTalkPanel,
      observe: observe.talk,
    },
  ],
  exercises,
}
