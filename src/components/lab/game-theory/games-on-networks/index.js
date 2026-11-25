import en from '../../../../content/game-theory-lab/games-on-networks.en.md?raw'
import it from '../../../../content/game-theory-lab/games-on-networks.it.md?raw'
import FigureStar from './FigureStar.jsx'
import FigureFormation from './FigureFormation.jsx'
import PublicGoodsPanel from './PublicGoodsPanel.jsx'
import KeyPlayerPanel from './KeyPlayerPanel.jsx'
import FormationPanel from './FormationPanel.jsx'
import { observe, exercises } from './texts.js'

// Game Theory Lab, module 09 "Games on networks": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk.
export default {
  lectures: { en, it },
  figures: {
    star: {
      Component: FigureStar,
      caption: {
        en: 'Complements and substitutes: a star with a hub and four leaves; node sizes show the equilibrium efforts at the chosen δ.',
        it: 'Complementi e sostituti: una stella con un hub e quattro foglie; la dimensione dei nodi mostra gli sforzi di equilibrio al δ scelto.',
      },
    },
    formation: {
      Component: FigureFormation,
      caption: {
        en: 'Stable or efficient? The connections model’s (δ, c) plane for n players: where the efficient network is also pairwise stable, and where it is not.',
        it: 'Stabile o efficiente? Il piano (δ, c) del modello delle connessioni per n giocatori: dove la rete efficiente è anche stabile a coppie, e dove no.',
      },
    },
  },
  panels: [
    {
      id: 'publicgoods',
      title: { en: 'Who does the work?', it: 'Chi fa il lavoro?' },
      Component: PublicGoodsPanel,
      observe: observe.publicgoods,
    },
    {
      id: 'keyplayer',
      title: { en: 'The key player', it: 'Il giocatore chiave' },
      Component: KeyPlayerPanel,
      observe: observe.keyplayer,
    },
    {
      id: 'formation',
      title: { en: 'Building the network', it: 'Costruire la rete' },
      Component: FormationPanel,
      observe: observe.formation,
    },
  ],
  exercises,
}
