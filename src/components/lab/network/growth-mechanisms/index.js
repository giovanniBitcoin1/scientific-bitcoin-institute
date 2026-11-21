import en from '../../../../content/network-lab/growth-mechanisms.en.md?raw'
import it from '../../../../content/network-lab/growth-mechanisms.it.md?raw'
import HistoryPanel from './HistoryPanel.jsx'
import MechanismPanel from './MechanismPanel.jsx'
import KernelPanel from './KernelPanel.jsx'
import FigureRich from './FigureRich.jsx'
import FigureSnapshots from './FigureSnapshots.jsx'
import { observe, exercises } from './texts.js'

// Network Lab, module 06 "Growth mechanisms": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk
// (it shares module 05's fit.js for the tail of the copying model).
export default {
  lectures: { en, it },
  figures: {
    rich: {
      Component: FigureRich,
      caption: {
        en: 'How fast do the rich get richer? The share of the next link that goes to one hub, for a kernel k^α.',
        it: "Quanto in fretta si arricchiscono i ricchi? La quota del prossimo collegamento che va a un hub, con un kernel k^α.",
      },
    },
    snapshots: {
      Component: FigureSnapshots,
      caption: {
        en: 'Two snapshots: count the links the old nodes gained, by the degree they had at the first.',
        it: 'Due istantanee: conta i collegamenti ricevuti dai nodi vecchi, secondo il grado che avevano nella prima.',
      },
    },
  },
  panels: [
    { id: 'history', title: { en: 'Rerun history', it: 'Rifai la storia' }, Component: HistoryPanel, observe: observe.history },
    { id: 'mechanisms', title: { en: 'Who needs to know the degrees?', it: 'Chi deve conoscere i gradi?' }, Component: MechanismPanel, observe: observe.mechanisms },
    { id: 'kernel', title: { en: 'Measure the attachment rule', it: 'Misura la regola di aggancio' }, Component: KernelPanel, observe: observe.kernel },
  ],
  exercises,
}
