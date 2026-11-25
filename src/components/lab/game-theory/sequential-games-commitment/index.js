import en from '../../../../content/game-theory-lab/sequential-games-commitment.en.md?raw'
import it from '../../../../content/game-theory-lab/sequential-games-commitment.it.md?raw'
import TreePanel from './TreePanel.jsx'
import LeaderPanel from './LeaderPanel.jsx'
import UltimatumPanel from './UltimatumPanel.jsx'
import FigureEntry from './FigureEntry.jsx'
import FigureBargain from './FigureBargain.jsx'
import { observe, exercises } from './texts.js'

// Game Theory Lab, module 04 "Games in time and credible commitment": the
// content object that src/pages/lab/loaders.js hands to LabLecture. This
// folder is one chunk; GameTree.jsx and PayoffTable.jsx sit next to the
// module folders, shared by the lab.
export default {
  lectures: { en, it },
  figures: {
    entry: {
      Component: FigureEntry,
      caption: {
        en: 'A threat on a tree: solved from the end, a threat the firm would not carry out does not keep the newcomer away.',
        it: 'Una minaccia su un albero: risolvendo dalla fine, una minaccia che l’impresa non eseguirebbe non tiene lontano il nuovo arrivato.',
      },
    },
    pie: {
      Component: FigureBargain,
      caption: {
        en: 'The shrinking pie: with a last round the shares swing; with none, the first proposer gets 1/(1 + δ) at once.',
        it: 'La torta che si restringe: con un ultimo turno le quote oscillano; senza, il primo proponente ottiene subito 1/(1 + δ).',
      },
    },
  },
  panels: [
    {
      id: 'tree',
      title: { en: 'Solve the tree', it: 'Risolvi l’albero' },
      Component: TreePanel,
      observe: observe.tree,
    },
    {
      id: 'leader',
      title: { en: 'Leader and follower', it: 'Chi muove per primo' },
      Component: LeaderPanel,
      observe: observe.leader,
    },
    {
      id: 'ultimatum',
      title: { en: 'Dividing a pie', it: 'Dividere una torta' },
      Component: UltimatumPanel,
      observe: observe.ultimatum,
    },
  ],
  exercises,
}
