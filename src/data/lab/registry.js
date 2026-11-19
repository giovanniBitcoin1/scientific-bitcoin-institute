import { LAB_PATHS } from './paths.js'
import complexityModules from './modules.json'
import networkModules from './network-modules.json'

// The one place that describes every lab. LabIndex and LabChapter render any
// entry of this list, and a future hub page listing all labs can read it too.
//
//   id          key used by paths.js and by the content loaders
//               (src/pages/lab/loaders.js)
//   basePath    where the lab lives; edit it in paths.js
//   name        the lab's name, the same in both languages
//   eyebrow     small line above the title on the index
//   title       the index headline
//   intro       index paragraphs: the first is the lead, the others are muted
//   description meta description of the index (English, like the rest of the site)
//   pending     badge on modules that are not ready yet
//   parts       null, or the headings the index groups the modules under;
//               each module then names its part in its `part` field
//   modules     ordered list: slug, number, status ("ready" | "coming-soon"),
//               title_en/it, summary_en/it
//
// One lock covers all labs: src/data/lab/config.json and useLabAccess.js.
export const labs = [
  {
    id: 'complexity',
    basePath: LAB_PATHS.complexity,
    name: 'Complexity Lab',
    eyebrow: { en: 'Complexity Lab', it: 'Complexity Lab' },
    title: {
      en: 'An advanced course on complex systems',
      it: 'Un corso avanzato sui sistemi complessi',
    },
    intro: {
      en: [
        'Why do starlings turn as one, traffic jam with no accident, and wealth concentrate in a few hands? The Complexity Lab is an advanced course by the Scientific Bitcoin Institute on the science of systems whose collective behaviour cannot be read off their parts. In thirteen modules it moves from nonlinear dynamics and chaos to random, small-world and scale-free networks; from cellular automata, fractals and percolation to self-organized criticality; and from agent-based models, collective motion and game theory to the physics of inequality — ending with Bitcoin as a complex adaptive system. Each module pairs a rigorous lecture, grounded in the primary scientific literature, with interactive simulations you can run, measure and test against theory.',
        'Designed for readers comfortable with some mathematics: logarithms, probability and simple equations.',
      ],
      it: [
        "Perché uno stormo di storni vira all'unisono, un ingorgo si forma senza incidenti e la ricchezza si concentra in poche mani? Il Complexity Lab è un corso avanzato dello Scientific Bitcoin Institute sulla scienza dei sistemi il cui comportamento collettivo non si deduce dalle singole parti. In tredici moduli passa dalla dinamica non lineare e dal caos alle reti casuali, small-world e a invarianza di scala; dagli automi cellulari, dai frattali e dalla percolazione alla criticità auto-organizzata; dai modelli ad agenti, dal moto collettivo e dalla teoria dei giochi alla fisica della disuguaglianza, fino a Bitcoin come sistema complesso adattivo. Ogni modulo unisce una lezione rigorosa, fondata sulla letteratura scientifica originale, a simulazioni interattive da eseguire, misurare e confrontare con la teoria.",
        "Pensato per chi ha familiarità con un po' di matematica: logaritmi, probabilità ed equazioni semplici.",
      ],
    },
    description:
      'An advanced course on complex systems by the Scientific Bitcoin Institute: 13 modules with rigorous lectures and interactive simulations, from chaos and networks to criticality, game theory and Bitcoin.',
    pending: { en: 'Coming soon', it: 'In arrivo' },
    parts: null,
    modules: complexityModules,
  },
  {
    id: 'network',
    basePath: LAB_PATHS.network,
    name: 'Network Lab',
    eyebrow: { en: 'Advanced course', it: 'Corso avanzato' },
    title: { en: 'Network Lab', it: 'Network Lab' },
    intro: {
      en: [
        'An advanced course on network science: how networks are described, how they grow, how they organise themselves, and how things spread on them.',
        'Designed for readers comfortable with some mathematics. It builds on Complexity Lab modules 02-04 but can be followed on its own.',
      ],
      it: [
        'Un corso avanzato di scienza delle reti: come si descrivono, come crescono, come si organizzano e come vi si diffondono le cose.',
        "Pensato per chi ha familiarità con un po' di matematica. Parte dai moduli 02-04 del Complexity Lab, ma si può seguire anche da solo.",
      ],
    },
    description:
      'An advanced course on network science by the Scientific Bitcoin Institute: 14 modules on how networks are described, how they grow, how they organise themselves and how things spread on them.',
    pending: { en: 'In preparation', it: 'In preparazione' },
    parts: [
      { id: 'I', title: { en: 'Describing', it: 'Descrivere' } },
      { id: 'II', title: { en: 'Growing', it: 'Crescere' } },
      { id: 'III', title: { en: 'Organising', it: 'Organizzarsi' } },
      { id: 'IV', title: { en: 'Spreading', it: 'Diffondere' } },
    ],
    modules: networkModules,
  },
]

export const getLab = (id) => labs.find((lab) => lab.id === id)
