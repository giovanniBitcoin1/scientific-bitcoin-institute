import en from '../../../../content/game-theory-lab/coalitions-sharing.en.md?raw'
import it from '../../../../content/game-theory-lab/coalitions-sharing.it.md?raw'
import FigureCore from './FigureCore.jsx'
import FigureVotes from './FigureVotes.jsx'
import CoalitionPanel from './CoalitionPanel.jsx'
import VotingPanel from './VotingPanel.jsx'
import EstatePanel from './EstatePanel.jsx'
import { observe, exercises } from './texts.js'

// Game Theory Lab, module 10 "Coalitions: how to share the pie": the content
// object that src/pages/lab/loaders.js hands to LabLecture. This folder is
// one chunk.
export default {
  lectures: { en, it },
  figures: {
    core: {
      Component: FigureCore,
      caption: {
        en: 'The core of three: the divisions of 100 among A, B and C, the pairs’ lines, the core shaded and the Shapley value (orange); drag the white division.',
        it: 'Il nucleo con tre giocatori: le divisioni di 100 tra A, B e C, le rette delle coppie, il nucleo ombreggiato e il valore di Shapley (arancione); trascina la divisione bianca.',
      },
    },
    votes: {
      Component: FigureVotes,
      caption: {
        en: 'Luxembourg’s vote: the six members of the 1958 Council, their share of the 17 votes and their power, at every quota from 9 to 17.',
        it: 'Il voto del Lussemburgo: i sei membri del Consiglio del 1958, la loro quota dei 17 voti e il loro potere, per ogni quota da 9 a 17.',
      },
    },
  },
  panels: [
    {
      id: 'coalitions',
      title: { en: 'Who gets what?', it: 'Chi prende cosa?' },
      Component: CoalitionPanel,
      observe: observe.coalitions,
    },
    {
      id: 'voting',
      title: { en: 'Who decides?', it: 'Chi decide?' },
      Component: VotingPanel,
      observe: observe.voting,
    },
    {
      id: 'estate',
      title: { en: 'An estate that cannot pay', it: 'Un’eredità che non basta' },
      Component: EstatePanel,
      observe: observe.estate,
    },
  ],
  exercises,
}
