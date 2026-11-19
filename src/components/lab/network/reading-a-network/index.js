import en from '../../../../content/network-lab/reading-a-network.en.md?raw'
import it from '../../../../content/network-lab/reading-a-network.it.md?raw'
import BridgesPanel from './BridgesPanel.jsx'
import MicroscopePanel from './MicroscopePanel.jsx'
import ProjectionPanel from './ProjectionPanel.jsx'
import FigureThreeWays from './FigureThreeWays.jsx'
import FigureSparse from './FigureSparse.jsx'
import { observe, exercises } from './texts.js'

// Network Lab, module 01 "Reading a network": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk.
export default {
  lectures: { en, it },
  // Live figures, placed in the lecture by a ```figure block holding the id.
  figures: {
    'three-ways': {
      Component: FigureThreeWays,
      caption: {
        en: 'Three ways to write a network: the same six nodes as a drawing, a matrix and a list.',
        it: 'Tre modi di scrivere una rete: gli stessi sei nodi come disegno, matrice e lista.',
      },
    },
    sparse: {
      Component: FigureSparse,
      caption: {
        en: 'Sparse or dense? Actual and possible links on a log scale, and the five networks of the table.',
        it: 'Sparsa o densa? Collegamenti reali e possibili in scala logaritmica, e le cinque reti della tabella.',
      },
    },
  },
  panels: [
    {
      id: 'bridges',
      title: { en: 'The bridges of Königsberg', it: 'I ponti di Königsberg' },
      Component: BridgesPanel,
      observe: observe.bridges,
    },
    {
      id: 'microscope',
      title: { en: 'Network microscope', it: 'Microscopio di rete' },
      Component: MicroscopePanel,
      observe: observe.microscope,
    },
    {
      id: 'projection',
      title: { en: 'One system, two projections', it: 'Un sistema, due proiezioni' },
      Component: ProjectionPanel,
      observe: observe.projection,
    },
  ],
  exercises,
}
