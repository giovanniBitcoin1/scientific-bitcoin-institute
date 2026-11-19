import en from '../../../../content/network-lab/what-are-we-measuring.en.md?raw'
import it from '../../../../content/network-lab/what-are-we-measuring.it.md?raw'
import ObserverPanel from './ObserverPanel.jsx'
import NullPanel from './NullPanel.jsx'
import FriendsPanel from './FriendsPanel.jsx'
import FigureThreshold from './FigureThreshold.jsx'
import FigureThinning from './FigureThinning.jsx'
import { observe, exercises } from './texts.js'

// Network Lab, module 02 "What are we measuring?": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk.
export default {
  lectures: { en, it },
  // Live figures, placed in the lecture by a ```figure block holding the id.
  figures: {
    threshold: {
      Component: FigureThreshold,
      caption: {
        en: 'Where do you draw the line? The same contacts, a different network at every threshold.',
        it: 'Dove si traccia la linea? Gli stessi contatti, una rete diversa a ogni soglia.',
      },
    },
    thinning: {
      Component: FigureThinning,
      caption: {
        en: 'Thinning: the degree distribution when every node keeps a share p of its links.',
        it: 'Diradamento: la distribuzione dei gradi quando ogni nodo conserva una quota p dei suoi collegamenti.',
      },
    },
  },
  panels: [
    {
      id: 'observer',
      title: { en: 'The observer', it: "L'osservatore" },
      Component: ObserverPanel,
      observe: observe.observer,
    },
    {
      id: 'null',
      title: { en: 'Compared to what?', it: 'Rispetto a che cosa?' },
      Component: NullPanel,
      observe: observe.nullModels,
    },
    {
      id: 'friends',
      title: { en: 'Your friends have more friends', it: 'I tuoi amici hanno più amici' },
      Component: FriendsPanel,
      observe: observe.friends,
    },
  ],
  exercises,
}
