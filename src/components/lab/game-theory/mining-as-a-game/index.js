import en from '../../../../content/game-theory-lab/mining-as-a-game.en.md?raw'
import it from '../../../../content/game-theory-lab/mining-as-a-game.it.md?raw'
import FigureChain from './FigureChain.jsx'
import FigureThreshold from './FigureThreshold.jsx'
import RacePanel from './RacePanel.jsx'
import DifficultyPanel from './DifficultyPanel.jsx'
import BestPanel from './BestPanel.jsx'
import { observe, exercises } from './texts.js'

// Game Theory Lab, module 13 "Mining as a game": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk.
export default {
  lectures: { en, it },
  figures: {
    chain: {
      Component: FigureChain,
      caption: {
        en: 'Hide and release: the states of her private lead under Eyal and Sirer’s strategy, with the probability of each move and each state’s long-run share.',
        it: 'Nascondere e rivelare: gli stati del suo vantaggio privato con la strategia di Eyal e Sirer, con la probabilità di ogni passaggio e la quota di lungo periodo di ogni stato.',
      },
    },
    threshold: {
      Component: FigureThreshold,
      caption: {
        en: 'When does it pay? Her share of the chain R against her share of the hash rate α; above the line R = α, selfish mining pays.',
        it: 'Quando conviene? La sua quota della catena R in funzione della sua quota dell’hash rate α; sopra la retta R = α il selfish mining conviene.',
      },
    },
  },
  panels: [
    { id: 'race', title: { en: 'Race the network', it: 'Gara con la rete' }, Component: RacePanel, observe: observe.race },
    { id: 'difficulty', title: { en: 'The difficulty catches up', it: 'La difficoltà si adegua' }, Component: DifficultyPanel, observe: observe.difficulty },
    { id: 'best', title: { en: 'The best deviation', it: 'La deviazione migliore' }, Component: BestPanel, observe: observe.best },
  ],
  exercises,
}
