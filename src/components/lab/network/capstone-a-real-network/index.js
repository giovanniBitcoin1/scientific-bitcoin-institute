import en from '../../../../content/network-lab/capstone-a-real-network.en.md?raw'
import it from '../../../../content/network-lab/capstone-a-real-network.it.md?raw'
import WorkbenchPanel from './WorkbenchPanel.jsx'
import StressPanel from './StressPanel.jsx'
import SpreadPanel from './SpreadPanel.jsx'
import FigureMap from './FigureMap.jsx'
import FigureOutliers from './FigureOutliers.jsx'
import { observe, exercises } from './texts.js'

// Network Lab module 14 "Capstone: a real network": the content object that
// src/pages/lab/loaders.js hands to LabLecture. This folder is one chunk. It
// adds no method of its own: capstone.js calls the functions of modules 02,
// 03, 05, 08, 09, 10, 11, 12 and 13 on the airports of OpenFlights
// (src/data/lab/networks/airports-2014.json, loaded with this chunk only),
// on the karate club, on the Florentine families or on the reader's network.
export default {
  lectures: { en, it },
  figures: {
    map: {
      Component: FigureMap,
      caption: {
        en: '3,214 airports: every airport of the file at its longitude and latitude, sized by its routes.',
        it: '3.214 aeroporti: ogni aeroporto del file alla sua longitudine e latitudine, grande quanto le sue rotte.',
      },
    },
    outliers: {
      Component: FigureOutliers,
      caption: {
        en: 'Out of line: routes against betweenness, one dot per airport.',
        it: 'Fuori riga: rotte e betweenness, un punto per aeroporto.',
      },
    },
  },
  panels: [
    { id: 'workbench', title: { en: 'The workbench', it: 'Il banco di lavoro' }, Component: WorkbenchPanel, observe: observe.workbench },
    { id: 'stress', title: { en: 'Stress tests', it: 'Prove di carico' }, Component: StressPanel, observe: observe.stress },
    { id: 'spread', title: { en: 'The map and the spread', it: 'La mappa e il contagio' }, Component: SpreadPanel, observe: observe.spread },
  ],
  exercises,
}
