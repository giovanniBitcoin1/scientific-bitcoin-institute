import en from '../../../../content/network-lab/communities.en.md?raw'
import it from '../../../../content/network-lab/communities.it.md?raw'
import FindPanel from './FindPanel.jsx'
import ResolutionPanel from './ResolutionPanel.jsx'
import DetectPanel from './DetectPanel.jsx'
import FigureSplit from './FigureSplit.jsx'
import FigureRing from './FigureRing.jsx'
import { observe, exercises } from './texts.js'

// Network Lab module 09 "Communities": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk; it
// imports only shared lab code (rng.js, graphUtils.js, Slider, useExperiment,
// the network ui, charts and NetCanvas) and the karate club data of module 03.
export default {
  lectures: { en, it },
  figures: {
    split: {
      Component: FigureSplit,
      caption: {
        en: 'Score a split: tap a node to move it to the other group, and watch the two terms of Q.',
        it: 'Dai un voto a una divisione: tocca un nodo per spostarlo nell\'altro gruppo, e guarda i due termini di Q.',
      },
    },
    ring: {
      Component: FigureRing,
      caption: {
        en: 'Ring of cliques: each clique a group, or neighbouring cliques in pairs; past n = 22 the pairs score higher.',
        it: 'Anello di cricche: ogni cricca un gruppo, o cricche vicine a coppie; oltre n = 22 le coppie hanno un punteggio più alto.',
      },
    },
  },
  panels: [
    { id: 'find', title: { en: 'Find the groups', it: 'Trova i gruppi' }, Component: FindPanel, observe: observe.find },
    { id: 'resolution', title: { en: 'The resolution limit', it: 'Il limite di risoluzione' }, Component: ResolutionPanel, observe: observe.resolution },
    { id: 'detect', title: { en: 'Can they be found at all?', it: 'Si possono trovare?' }, Component: DetectPanel, observe: observe.detect },
  ],
  exercises,
}
