import en from '../../../../content/game-theory-lab/capstone-the-price-of-security.en.md?raw'
import it from '../../../../content/game-theory-lab/capstone-the-price-of-security.it.md?raw'
import FigureFlow from './FigureFlow.jsx'
import FigureClock from './FigureClock.jsx'
import AttackPanel from './AttackPanel.jsx'
import FeesPanel from './FeesPanel.jsx'
import EstimatePanel from './EstimatePanel.jsx'
import { observe, exercises } from './texts.js'

// Game Theory Lab, module 14 "Capstone: the price of security": the content
// object that src/pages/lab/loaders.js hands to LabLecture. This folder is
// one chunk.
export default {
  lectures: { en, it },
  figures: {
    flow: {
      Component: FigureFlow,
      caption: {
        en: 'Flow against stock: the gross cost of an attack, A·t(A)·p_block, against the attacker’s multiple A, and the value at stake V_attack.',
        it: 'Flusso contro stock: il costo lordo di un attacco, A·t(A)·p_block, in funzione del multiplo A dell’attaccante, e il valore in gioco V_attack.',
      },
    },
    clock: {
      Component: FigureClock,
      caption: {
        en: 'The halving clock: the subsidy per block from 2009 to 2140 on a log scale, and the fees that would keep 3.145 BTC per block.',
        it: 'L’orologio degli halving: il sussidio per blocco dal 2009 al 2140 in scala logaritmica, e le commissioni che manterrebbero 3,145 BTC per blocco.',
      },
    },
  },
  panels: [
    { id: 'attack', title: { en: 'The cost of an attack', it: 'Il costo di un attacco' }, Component: AttackPanel, observe: observe.attack },
    { id: 'fees', title: { en: 'When only fees pay', it: 'Quando pagano solo le commissioni' }, Component: FeesPanel, observe: observe.fees },
    { id: 'estimate', title: { en: 'Your own estimate', it: 'La tua stima' }, Component: EstimatePanel, observe: observe.estimate },
  ],
  exercises,
}
