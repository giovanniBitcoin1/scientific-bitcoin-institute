import en from '../../../../content/network-lab/triangles-weak-ties-motifs.en.md?raw'
import it from '../../../../content/network-lab/triangles-weak-ties-motifs.it.md?raw'
import ClosurePanel from './ClosurePanel.jsx'
import WeakTiesPanel from './WeakTiesPanel.jsx'
import MotifPanel from './MotifPanel.jsx'
import FigureOverlap from './FigureOverlap.jsx'
import FigurePatterns from './FigurePatterns.jsx'
import { observe, exercises } from './texts.js'

// Network Lab, module 04 "Triangles, weak ties and motifs": the content object
// that src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk.
export default {
  lectures: { en, it },
  // Live figures, placed in the lecture by a ```figure block holding the id.
  figures: {
    overlap: {
      Component: FigureOverlap,
      caption: {
        en: 'Overlap: the neighbours that the two ends of a link share, out of all their other neighbours.',
        it: 'Sovrapposizione: i vicini che i due estremi di un collegamento condividono, su tutti i loro altri vicini.',
      },
    },
    patterns: {
      Component: FigurePatterns,
      caption: {
        en: 'Thirteen patterns: every way of joining three nodes with directed links.',
        it: 'Tredici schemi: tutti i modi di unire tre nodi con collegamenti orientati.',
      },
    },
  },
  panels: [
    {
      id: 'closure',
      title: { en: 'Close the triangle', it: 'Chiudi il triangolo' },
      Component: ClosurePanel,
      observe: observe.closure,
    },
    {
      id: 'weak',
      title: { en: 'Weak ties hold it together', it: 'I legami deboli tengono insieme' },
      Component: WeakTiesPanel,
      observe: observe.weak,
    },
    {
      id: 'motifs',
      title: { en: 'Motif counter', it: 'Conta-motivi' },
      Component: MotifPanel,
      observe: observe.motifs,
    },
  ],
  exercises,
}
