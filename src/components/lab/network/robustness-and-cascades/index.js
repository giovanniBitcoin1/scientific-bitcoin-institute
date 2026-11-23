import en from '../../../../content/network-lab/robustness-and-cascades.en.md?raw'
import it from '../../../../content/network-lab/robustness-and-cascades.it.md?raw'
import AttackPanel from './AttackPanel.jsx'
import OverloadPanel from './OverloadPanel.jsx'
import CoupledPanel from './CoupledPanel.jsx'
import FigureFail from './FigureFail.jsx'
import FigureCascade from './FigureCascade.jsx'
import { observe, exercises } from './texts.js'

// Network Lab module 11 "Robustness and cascades": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk; it
// imports module 08's removal curves, sources and correlations (mixing.js,
// which brings module 05's configuration model and module 02's swap) and
// shared lab code. No shared code changed.
export default {
  lectures: { en, it },
  figures: {
    fail: {
      Component: FigureFail,
      caption: {
        en: 'Fail or target: remove nodes at random or hubs first, and watch the largest component (orange).',
        it: 'Guasto o bersaglio: togli i nodi a caso o dagli hub, e guarda la componente più grande (arancione).',
      },
    },
    cascade: {
      Component: FigureCascade,
      caption: {
        en: 'The cascade: two networks that depend on each other, one round at a time.',
        it: "La cascata: due reti che dipendono l'una dall'altra, un turno alla volta.",
      },
    },
  },
  panels: [
    { id: 'attack', title: { en: 'Failures, attacks and onions', it: 'Guasti, attacchi e cipolle' }, Component: AttackPanel, observe: observe.attack },
    { id: 'overload', title: { en: 'Overload', it: 'Sovraccarico' }, Component: OverloadPanel, observe: observe.overload },
    { id: 'coupled', title: { en: 'Coupled networks', it: 'Reti accoppiate' }, Component: CoupledPanel, observe: observe.coupled },
  ],
  exercises,
}
