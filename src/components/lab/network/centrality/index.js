import en from '../../../../content/network-lab/centrality.en.md?raw'
import it from '../../../../content/network-lab/centrality.it.md?raw'
import RankingsPanel from './RankingsPanel.jsx'
import SurferPanel from './SurferPanel.jsx'
import FragilityPanel from './FragilityPanel.jsx'
import FigureKite from './FigureKite.jsx'
import FigureScores from './FigureScores.jsx'
import { observe, exercises } from './texts.js'

// Network Lab, module 03 "Centrality": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk.
export default {
  lectures: { en, it },
  // Live figures, placed in the lecture by a ```figure block holding the id.
  figures: {
    kite: {
      Component: FigureKite,
      caption: {
        en: "Three winners: Krackhardt's kite under three measures of centrality.",
        it: "Tre vincitori: l'aquilone di Krackhardt secondo tre misure di centralità.",
      },
    },
    scores: {
      Component: FigureScores,
      caption: {
        en: 'Scores from neighbours: repeat the sum, and the bars settle on the eigenvector centrality (thin marks).',
        it: 'Punteggi dai vicini: ripetendo la somma, le barre si assestano sulla centralità di autovettore (segni sottili).',
      },
    },
  },
  panels: [
    {
      id: 'rankings',
      title: { en: 'Rankings compared', it: 'Classifiche a confronto' },
      Component: RankingsPanel,
      observe: observe.rankings,
    },
    {
      id: 'surfer',
      title: { en: 'The random surfer', it: 'Il navigatore casuale' },
      Component: SurferPanel,
      observe: observe.surfer,
    },
    {
      id: 'fragility',
      title: { en: 'How fragile is a ranking?', it: 'Quanto è fragile una classifica?' },
      Component: FragilityPanel,
      observe: observe.fragility,
    },
  ],
  exercises,
}
