import en from '../../../../content/game-theory-lab/repeated-games-reputation.en.md?raw'
import it from '../../../../content/game-theory-lab/repeated-games-reputation.it.md?raw'
import CartelPanel from './CartelPanel.jsx'
import WarsPanel from './WarsPanel.jsx'
import ReputationPanel from './ReputationPanel.jsx'
import FigurePatience from './FigurePatience.jsx'
import FigureFolk from './FigureFolk.jsx'
import { observe, exercises } from './texts.js'

// Game Theory Lab, module 06 "Repeated games and reputation": the content
// object that src/pages/lab/loaders.js hands to LabLecture. This folder is
// one chunk; Φ comes from module 05's globalgame.js (a shared chunk).
export default {
  lectures: { en, it },
  figures: {
    patience: {
      Component: FigurePatience,
      caption: {
        en: 'How much patience? Each bar is a round’s payoff at its discounted height over its full height: defecting wins only while the future weighs little.',
        it: 'Quanta pazienza? Ogni barra è il payoff di un turno alla sua altezza scontata sopra quella piena: defezionare vince solo finché il futuro pesa poco.',
      },
    },
    folk: {
      Component: FigureFolk,
      caption: {
        en: 'Almost anything: the average payoffs a public lottery can reach, and the part that grim trigger sustains at the chosen δ.',
        it: 'Quasi tutto: i payoff medi che una lotteria pubblica può raggiungere, e la parte che la strategia grim trigger sostiene con il δ scelto.',
      },
    },
  },
  panels: [
    {
      id: 'cartel',
      title: { en: 'Can the cartel hold?', it: 'Il cartello regge?' },
      Component: CartelPanel,
      observe: observe.cartel,
    },
    {
      id: 'wars',
      title: { en: 'Price wars without cheating', it: 'Guerre dei prezzi senza imbrogli' },
      Component: WarsPanel,
      observe: observe.wars,
    },
    {
      id: 'reputation',
      title: { en: 'A reputation for toughness', it: 'Una reputazione da duro' },
      Component: ReputationPanel,
      observe: observe.reputation,
    },
  ],
  exercises,
}
