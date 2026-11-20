// Names and one-line descriptions of the thirteen patterns (ids as in
// motifs.js), and where three of them turn up (Milo et al. 2002).

export const PATTERN_TEXT = {
  en: {
    fanOut: { name: 'Fan-out', what: 'One node points to two others.' },
    fanIn: { name: 'Fan-in', what: 'Two nodes point to the same one.' },
    chain: {
      name: 'Chain',
      what: 'A points to B, and B points to C.',
      where: 'Food webs: a plant, the animal that eats it, and the animal that eats that one. More frequent than chance in five of the seven food webs of Milo et al. (2002).',
    },
    mutualOut: { name: 'Mutual link and a link out', what: 'Two nodes point to each other, and one of them points to a third.' },
    mutualIn: { name: 'Mutual link and a link in', what: 'Two nodes point to each other, and a third points to one of them.' },
    twoMutual: { name: 'Two mutual links', what: 'One node exchanges links with two others.' },
    feedForward: {
      name: 'Feed-forward loop',
      what: 'A points to B and to C, and B points to C: two routes from A to C.',
      where: 'Gene regulation in a bacterium and in yeast, the wiring of the neurons of the worm C. elegans, and some electronic circuits.',
    },
    cycle: {
      name: 'Three-node cycle',
      what: 'A points to B, B to C, and C back to A.',
      where: 'A feedback loop. More frequent than chance in one family of electronic circuits (Milo et al. 2002).',
    },
    pairOut: { name: 'Mutual pair pointing to a third', what: 'Two nodes point to each other, and both point to a third.' },
    pairIn: { name: 'Mutual pair pointed to by a third', what: 'Two nodes point to each other, and a third points to both.' },
    cycleMutual: { name: 'Cycle with one link returned', what: 'A three-node cycle in which one link also runs the other way.' },
    twoMutualOne: { name: 'Two mutual links and a single one', what: 'One node exchanges links with two others, and one of those points to the other.' },
    allMutual: { name: 'All mutual', what: 'Every node points to the other two.' },
  },
  it: {
    fanOut: { name: 'Ventaglio in uscita', what: 'Un nodo punta ad altri due.' },
    fanIn: { name: 'Ventaglio in entrata', what: 'Due nodi puntano allo stesso nodo.' },
    chain: {
      name: 'Catena',
      what: 'A punta a B, e B punta a C.',
      where: "Reti alimentari: una pianta, l'animale che la mangia e l'animale che mangia quest'ultimo. Più frequente del caso in cinque delle sette reti alimentari di Milo et al. (2002).",
    },
    mutualOut: { name: 'Collegamento reciproco e uno in uscita', what: "Due nodi puntano l'uno all'altro, e uno dei due punta a un terzo." },
    mutualIn: { name: 'Collegamento reciproco e uno in entrata', what: "Due nodi puntano l'uno all'altro, e un terzo punta a uno dei due." },
    twoMutual: { name: 'Due collegamenti reciproci', what: 'Un nodo scambia collegamenti con altri due.' },
    feedForward: {
      name: 'Feed-forward loop',
      what: 'A punta a B e a C, e B punta a C: due vie da A a C.',
      where: 'La regolazione dei geni in un batterio e nel lievito, i collegamenti tra i neuroni del verme C. elegans e alcuni circuiti elettronici.',
    },
    cycle: {
      name: 'Ciclo di tre nodi',
      what: 'A punta a B, B a C, e C di nuovo ad A.',
      where: 'Un anello di retroazione. Più frequente del caso in una famiglia di circuiti elettronici (Milo et al. 2002).',
    },
    pairOut: { name: 'Coppia reciproca che punta a un terzo', what: "Due nodi puntano l'uno all'altro, ed entrambi puntano a un terzo." },
    pairIn: { name: 'Coppia reciproca a cui punta un terzo', what: "Due nodi puntano l'uno all'altro, e un terzo punta a entrambi." },
    cycleMutual: { name: 'Ciclo con un collegamento ricambiato', what: 'Un ciclo di tre nodi in cui un collegamento va anche nel verso opposto.' },
    twoMutualOne: { name: 'Due collegamenti reciproci e uno semplice', what: "Un nodo scambia collegamenti con altri due, e uno di questi punta all'altro." },
    allMutual: { name: 'Tutti reciproci', what: 'Ogni nodo punta agli altri due.' },
  },
}
