import en from '../../../../content/network-lab/heavy-tails-done-right.en.md?raw'
import it from '../../../../content/network-lab/heavy-tails-done-right.it.md?raw'
import DialPanel from './DialPanel.jsx'
import GiantPanel from './GiantPanel.jsx'
import RecipePanel from './RecipePanel.jsx'
import FigureHub from './FigureHub.jsx'
import FigureFollow from './FigureFollow.jsx'
import { observe, exercises } from './texts.js'

// Network Lab, module 05 "Heavy tails, done right": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk.
export default {
  lectures: { en, it },
  // Live figures, placed in the lecture by a ```figure block holding the id.
  figures: {
    hub: {
      Component: FigureHub,
      caption: {
        en: 'The biggest hub: the largest degree to expect, for a random network and for a power law.',
        it: "L'hub più grande: il grado massimo da aspettarsi, per una rete casuale e per una legge di potenza.",
      },
    },
    follow: {
      Component: FigureFollow,
      caption: {
        en: 'Follow a link: the node at the end of a link has more links than a node picked at random.',
        it: 'Segui un collegamento: il nodo in fondo a un collegamento ha più collegamenti di un nodo scelto a caso.',
      },
    },
  },
  panels: [
    {
      id: 'dial',
      title: { en: 'A dial for the exponent', it: "Una manopola per l'esponente" },
      Component: DialPanel,
      observe: observe.dial,
    },
    {
      id: 'giant',
      title: { en: 'The giant component, by bookkeeping', it: 'La componente gigante, a conti fatti' },
      Component: GiantPanel,
      observe: observe.giant,
    },
    {
      id: 'recipe',
      title: { en: 'Is it a power law?', it: 'È una legge di potenza?' },
      Component: RecipePanel,
      observe: observe.recipe,
    },
  ],
  exercises,
}
