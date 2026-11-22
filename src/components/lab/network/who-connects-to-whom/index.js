import en from '../../../../content/network-lab/who-connects-to-whom.en.md?raw'
import it from '../../../../content/network-lab/who-connects-to-whom.it.md?raw'
import HubsPanel from './HubsPanel.jsx'
import RobustPanel from './RobustPanel.jsx'
import GroupsPanel from './GroupsPanel.jsx'
import FigureWirings from './FigureWirings.jsx'
import FigureIllusion from './FigureIllusion.jsx'
import { observe, exercises } from './texts.js'

// Network Lab module 08 "Who connects to whom": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk; it
// imports module 02's degree-preserving swap (nullmodels.js) and module 05's
// configuration model (configmodel.js, zeta.js) without changing them, which
// Vite puts in chunks of their own, loaded only when the lab is unlocked.
export default {
  lectures: { en, it },
  figures: {
    wirings: {
      Component: FigureWirings,
      caption: {
        en: 'Same degrees, two wirings: one degree sequence rewired towards assortative and towards disassortative.',
        it: 'Stessi gradi, due cablaggi: una sequenza di gradi ricablata verso assortativa e verso disassortativa.',
      },
    },
    illusion: {
      Component: FigureIllusion,
      caption: {
        en: 'What your friends show you: three coloured hubs, and the share of each node\'s neighbours that are coloured.',
        it: 'Che cosa ti mostrano gli amici: tre hub colorati, e la quota dei vicini di ogni nodo che sono colorati.',
      },
    },
  },
  panels: [
    { id: 'hubs', title: { en: 'Do hubs link to hubs?', it: 'Gli hub si legano agli hub?' }, Component: HubsPanel, observe: observe.hubs },
    { id: 'robust', title: { en: 'Mixing and robustness', it: 'Mescolamento e robustezza' }, Component: RobustPanel, observe: observe.robust },
    { id: 'groups', title: { en: 'Birds of a feather', it: 'Chi si somiglia si piglia' }, Component: GroupsPanel, observe: observe.groups },
  ],
  exercises,
}
