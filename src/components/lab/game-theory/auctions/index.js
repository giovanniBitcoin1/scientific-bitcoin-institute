import en from '../../../../content/game-theory-lab/auctions.en.md?raw'
import it from '../../../../content/game-theory-lab/auctions.it.md?raw'
import FigureTruth from './FigureTruth.jsx'
import FigureShading from './FigureShading.jsx'
import RevenuePanel from './RevenuePanel.jsx'
import CursePanel from './CursePanel.jsx'
import BlockPanel from './BlockPanel.jsx'
import { observe, exercises } from './texts.js'

// Game Theory Lab, module 11 "Auctions": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk.
export default {
  lectures: { en, it },
  figures: {
    truth: {
      Component: FigureTruth,
      caption: {
        en: 'Why the truth is safe: your payoff against your bid for your value v and the highest other bid h; drag on the chart to move h.',
        it: 'Perché la verità non rischia: il tuo payoff in funzione della tua offerta, dati il tuo valore v e l’offerta più alta degli altri h; trascina sul grafico per spostare h.',
      },
    },
    shading: {
      Component: FigureShading,
      caption: {
        en: 'How much to shade: your expected payoff in the first-price auction against your bid, when the others bid (n − 1)/n of their values.',
        it: 'Quanto abbassare l’offerta: il tuo payoff atteso nell’asta al primo prezzo in funzione della tua offerta, quando gli altri offrono (n − 1)/n dei loro valori.',
      },
    },
  },
  panels: [
    {
      id: 'revenue',
      title: { en: 'Same revenue, different risk', it: 'Stesso ricavo, rischio diverso' },
      Component: RevenuePanel,
      observe: observe.revenue,
    },
    {
      id: 'curse',
      title: { en: 'The winner’s curse', it: 'La maledizione del vincitore' },
      Component: CursePanel,
      observe: observe.curse,
    },
    {
      id: 'block',
      title: { en: 'A block for sale', it: 'Un blocco all’asta' },
      Component: BlockPanel,
      observe: observe.block,
    },
  ],
  exercises,
}
