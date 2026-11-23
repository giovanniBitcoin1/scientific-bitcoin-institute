import en from '../../../../content/network-lab/social-contagion-network-effects.en.md?raw'
import it from '../../../../content/network-lab/social-contagion-network-effects.it.md?raw'
import TippingPanel from './TippingPanel.jsx'
import WindowPanel from './WindowPanel.jsx'
import TiesPanel from './TiesPanel.jsx'
import FigureRiot from './FigureRiot.jsx'
import FigureCascade from './FigureCascade.jsx'
import { observe, exercises } from './texts.js'

// Network Lab module 13 "Social contagion and network effects": the content
// object that src/pages/lab/loaders.js hands to LabLecture. This folder is one
// chunk; it imports module 08's sources (mixing.js), module 09's block model
// (community.js), module 11's seeds and moments (robust.js), the small-world
// generator of graphUtils.js and shared lab code. No shared code changed.
export default {
  lectures: { en, it },
  figures: {
    cascade: {
      Component: FigureCascade,
      caption: {
        en: 'Wrong together: thirty people decide in turn, each seeing the choices made before.',
        it: 'Sbagliare insieme: trenta persone decidono a turno, e ognuna vede le scelte fatte prima.',
      },
    },
    riot: {
      Component: FigureRiot,
      caption: {
        en: 'The riot that almost happened: a hundred people, thresholds 0 to 99.',
        it: 'La rivolta mancata: cento persone, soglie da 0 a 99.',
      },
    },
  },
  panels: [
    { id: 'tipping', title: { en: 'Tipping points', it: 'Punti di svolta' }, Component: TippingPanel, observe: observe.tipping },
    { id: 'window', title: { en: 'The cascade window', it: 'La finestra delle cascate' }, Component: WindowPanel, observe: observe.window },
    { id: 'ties', title: { en: 'Clusters and long ties', it: 'Gruppi e legami lunghi' }, Component: TiesPanel, observe: observe.ties },
  ],
  exercises,
}
