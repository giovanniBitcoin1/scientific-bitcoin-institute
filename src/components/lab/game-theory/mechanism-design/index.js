import en from '../../../../content/game-theory-lab/mechanism-design.en.md?raw'
import it from '../../../../content/game-theory-lab/mechanism-design.it.md?raw'
import FigureArea from './FigureArea.jsx'
import FigureTrade from './FigureTrade.jsx'
import TruthPanel from './TruthPanel.jsx'
import VcgPanel from './VcgPanel.jsx'
import CheatPanel from './CheatPanel.jsx'
import { observe, exercises } from './texts.js'

// Game Theory Lab, module 12 "Designing the rules": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk.
export default {
  lectures: { en, it },
  figures: {
    area: {
      Component: FigureArea,
      caption: {
        en: 'The price is an area: what you get against your bid; for a bid b, the area under the curve is your payoff, the rest of b × x(b) your payment.',
        it: 'Il prezzo è un’area: ciò che ottieni in funzione della tua offerta; per un’offerta b, l’area sotto la curva è il tuo payoff, il resto di b × x(b) il tuo pagamento.',
      },
    },
    trade: {
      Component: FigureTrade,
      caption: {
        en: 'Three out of four: the seller’s cost c and the buyer’s value v, uniform on 0–100, and where each rule trades.',
        it: 'Tre su quattro: il costo c del venditore e il valore v del compratore, uniformi tra 0 e 100, e dove scambia ogni regola.',
      },
    },
  },
  panels: [
    { id: 'truth', title: { en: 'Lying does not pay', it: 'Mentire non conviene' }, Component: TruthPanel, observe: observe.truth },
    { id: 'vcg', title: { en: 'Pay for the harm you do', it: 'Paghi il danno che fai' }, Component: VcgPanel, observe: observe.vcg },
    { id: 'cheat', title: { en: 'Who runs the auction?', it: 'Chi gestisce l’asta?' }, Component: CheatPanel, observe: observe.cheat },
  ],
  exercises,
}
