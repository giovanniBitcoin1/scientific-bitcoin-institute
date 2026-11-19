// Module 01 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/network-lab/reading-a-network.<lang>.md.

export const observe = {
  bridges: {
    en: `
1. Load **1736** and try to cross all seven bridges. Then press **Best possible**: the longest walk that repeats no bridge crosses six of them.
2. Load **Today**. All five bridges can be crossed, but only from one island to the other. Start on a bank instead and see where you get stuck.
3. Back in 1736, switch to **Edit** and add any one bridge. The verdict becomes "a walk exists", never "a closed tour exists". Why can one bridge not do more?
4. Now find two extra bridges that allow a closed tour. Which land masses must they join?
5. Watch the graph while you edit: every bridge changes the number in exactly two nodes. Can you ever make exactly one node orange?
`,
    it: `
1. Carica **1736** e prova ad attraversare tutti e sette i ponti. Poi premi **Il meglio possibile**: la passeggiata più lunga che non ripete alcun ponte ne attraversa sei.
2. Carica **Oggi**. I cinque ponti si possono attraversare tutti, ma solo da un'isola all'altra. Parti invece da una riva e guarda dove resti bloccato.
3. Torna al 1736, passa a **Modifica** e aggiungi un ponte qualsiasi. Il verdetto diventa «una passeggiata esiste», mai «esiste un giro chiuso». Perché un solo ponte non può fare di più?
4. Ora trova due ponti in più che permettano un giro chiuso. Quali zone devono unire?
5. Osserva il grafo mentre modifichi: ogni ponte cambia il numero in esattamente due nodi. Riesci ad avere un solo nodo arancione?
`,
  },
  microscope: {
    en: `
1. Load the **windmill**. Average clustering is 0.95 and transitivity 0.14: the same network, two verdicts. Tap the hub and then an outer node and compare their clustering.
2. The **ring lattice** has clustering 0.5. The **random** network, with a similar ⟨k⟩, has almost none (about 0.07). Compare their diameters too.
3. In the **karate club**, turn Draw on, choose Delete and remove the two best-connected members (the largest circles). The network breaks apart: how many components are left?
4. Load **two separate groups** and press "Group by component" in the matrix: the links gather into two blocks, with nothing outside them. Tap a node: the wavefront never leaves its group.
5. In the **path**, the diameter is 9. With Draw on, add one link between its two ends and watch the diameter and the average distance.
6. Start from the **complete** network and delete links one at a time. Which falls faster, density or clustering?
`,
    it: `
1. Carica la **girandola**. Il clustering medio è 0,95 e la transitività 0,14: la stessa rete, due verdetti. Tocca l'hub e poi un nodo esterno e confronta il loro clustering.
2. Il **reticolo ad anello** ha clustering 0,5. La rete **casuale**, con un ⟨k⟩ simile, non ne ha quasi (circa 0,07). Confronta anche i diametri.
3. Nel **club di karate**, attiva Disegna, scegli Elimina e togli i due membri con più collegamenti (i cerchi più grandi). La rete si spezza: quante componenti restano?
4. Carica i **due gruppi separati** e premi «Raggruppa per componente» nella matrice: i collegamenti si raccolgono in due blocchi, senza nulla al di fuori. Tocca un nodo: il fronte non esce mai dal suo gruppo.
5. Nella **catena** il diametro è 9. Con Disegna attivo, aggiungi un collegamento tra i due estremi e osserva il diametro e la distanza media.
6. Parti dalla rete **completa** ed elimina un collegamento alla volta. Scende più in fretta la densità o il clustering?
`,
  },
  projection: {
    en: `
1. Load **One big paper**: one paper with 8 authors gives 28 links among them, d(d − 1)/2. Remove the authors one at a time and watch the count: 21, 15, 10…
2. Clear the grid and enter three two-author papers, {a, b}, {b, c} and {a, c}. Note the author projection. Clear again and enter one paper {a, b, c}: the author projection is the same triangle. Different bipartite networks, same projection.
3. Give two authors two papers in common: the link between them thickens and shows its weight.
4. Change the theme. Only the labels change: the mathematics does not know what the nodes stand for.
`,
    it: `
1. Carica **Un grande articolo**: un articolo con 8 autori dà 28 collegamenti tra loro, d(d − 1)/2. Togli gli autori uno alla volta e osserva il conteggio: 21, 15, 10…
2. Svuota la griglia e inserisci tre articoli a due autori, {a, b}, {b, c} e {a, c}. Guarda la proiezione sugli autori. Svuota di nuovo e inserisci un solo articolo {a, b, c}: la proiezione sugli autori è lo stesso triangolo. Reti bipartite diverse, stessa proiezione.
3. Dai a due autori due articoli in comune: il collegamento tra loro si ispessisce e mostra il suo peso.
4. Cambia il tema. Cambiano solo le etichette: la matematica non sa che cosa rappresentano i nodi.
`,
  },
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: 'Nine people are at a meetup. Can each of them have shaken hands with exactly three others? And if there are ten people?',
      it: 'A un incontro ci sono nove persone. È possibile che ciascuna abbia stretto la mano esattamente ad altre tre? E se le persone sono dieci?',
    },
    solution: {
      en: 'With nine people, no. The handshakes are the links of a network and the degrees must sum to 2L, an even number; nine degrees of 3 sum to 27, which is odd. With ten people it is possible: the degrees sum to 30, so there are L = 15 handshakes. One way: put the ten people in a circle, let each shake hands with the two beside them and with the person directly opposite.',
      it: 'Con nove persone, no. Le strette di mano sono i collegamenti di una rete e i gradi devono sommare a 2L, un numero pari; nove gradi uguali a 3 sommano a 27, che è dispari. Con dieci persone è possibile: i gradi sommano a 30, quindi ci sono L = 15 strette di mano. Un modo: si mettono le dieci persone in cerchio, e ognuna stringe la mano alle due accanto e a quella esattamente di fronte.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'A network has N = 10,000 nodes and average degree ⟨k⟩ = 12. How many links does it have? What is its density? What happens to the density if N doubles while ⟨k⟩ stays the same?',
      it: 'Una rete ha N = 10.000 nodi e grado medio ⟨k⟩ = 12. Quanti collegamenti ha? Qual è la sua densità? Che cosa succede alla densità se N raddoppia e ⟨k⟩ resta lo stesso?',
    },
    solution: {
      en: 'L = N⟨k⟩/2 = 60,000. Density = ⟨k⟩/(N − 1) = 12/9,999 ≈ 0.0012. With N = 20,000 it becomes 12/19,999 ≈ 0.0006: it halves, because the links grow like N while the possible pairs grow like N².',
      it: 'L = N⟨k⟩/2 = 60.000. Densità = ⟨k⟩/(N − 1) = 12/9.999 ≈ 0,0012. Con N = 20.000 diventa 12/19.999 ≈ 0,0006: si dimezza, perché i collegamenti crescono come N mentre le coppie possibili crescono come N².',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'A windmill is made of n = 10 triangles that share one central node. Compute its average clustering ⟨C⟩ and its transitivity T. What do they tend to when n is large? Then check your numbers with the windmill preset of the network microscope.',
      it: 'Una girandola è formata da n = 10 triangoli che condividono un nodo centrale. Calcola il clustering medio ⟨C⟩ e la transitività T. A che cosa tendono per n grande? Poi verifica i tuoi numeri con la girandola del microscopio di rete.',
    },
    solution: {
      en: 'The 20 outer nodes have two neighbours, linked to each other: C = 1. The hub has 20 neighbours, 190 pairs of them, and 10 linked pairs: C = 10/190 = 1/19. So ⟨C⟩ = (20 + 1/19)/21 ≈ 0.955. For T: there are 10 triangles; the hub is the centre of 190 triples and each outer node of one, 210 in all; T = 3 × 10/210 = 1/7 ≈ 0.143. In general ⟨C⟩ = (2n + 1/(2n − 1))/(2n + 1) → 1 and T = 3/(2n + 1) → 0. The preset shows 0.955 and 0.143.',
      it: "I 20 nodi esterni hanno due vicini, collegati tra loro: C = 1. L'hub ha 20 vicini, 190 coppie di vicini e 10 coppie collegate: C = 10/190 = 1/19. Quindi ⟨C⟩ = (20 + 1/19)/21 ≈ 0,955. Per T: i triangoli sono 10; l'hub è al centro di 190 triple e ogni nodo esterno di una, 210 in tutto; T = 3 × 10/210 = 1/7 ≈ 0,143. In generale ⟨C⟩ = (2n + 1/(2n − 1))/(2n + 1) → 1 e T = 3/(2n + 1) → 0. La girandola del microscopio mostra 0,955 e 0,143.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In the bridges panel, load 1736. There are six pairs of land masses: for how many of them does one extra bridge between the pair make the walk possible? What is the smallest number of extra bridges that allows a closed tour? Then load Today: where must the walk start?',
      it: 'Nel pannello dei ponti, carica 1736. Le coppie di zone sono sei: per quante di esse un ponte in più tra le due rende possibile la passeggiata? Qual è il minimo numero di ponti in più che permette un giro chiuso? Poi carica Oggi: da dove deve partire la passeggiata?',
    },
    solution: {
      en: 'All six. In 1736 all four land masses are odd; a new bridge makes its two ends even and leaves the other two odd, which is exactly the condition for a walk (in Edit mode each pair has one dashed slot to try). A closed tour needs no odd land mass at all, and one bridge can fix only two of the four, so the minimum is two bridges that between them touch all four land masses: for example north bank–south bank together with Kneiphof–Lomse. Today the two islands are the odd ones (three bridges each), so the walk must start on an island and it ends on the other.',
      it: "Tutte e sei. Nel 1736 tutte e quattro le zone sono dispari; un nuovo ponte rende pari i suoi due estremi e lascia dispari le altre due, che è esattamente la condizione per una passeggiata (in modalità Modifica ogni coppia ha una sede tratteggiata da provare). Un giro chiuso richiede che nessuna zona sia dispari, e un ponte può sistemarne solo due su quattro: il minimo è quindi due ponti che insieme tocchino tutte e quattro le zone, per esempio riva nord–riva sud insieme a Kneiphof–Lomse. Oggi le dispari sono le due isole (tre ponti ciascuna), quindi la passeggiata deve partire da un'isola e finisce sull'altra.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: "In the network microscope, load Zachary's karate club. Which two members have the most links, and how many? Remove both (Draw on, Delete). How many pieces are left, and how big are they?",
      it: 'Nel microscopio di rete, carica il club di karate di Zachary. Quali due membri hanno più collegamenti, e quanti? Eliminali entrambi (Disegna attivo, Elimina). Quanti pezzi restano, e di che dimensioni?',
    },
    solution: {
      en: 'Member 34 has 17 links and member 1 has 16 (tap a node to read its degree; the next, member 33, has 12). Without them the network has 32 nodes in three components: one of 26 members, one of 5 (members 5, 6, 7, 11 and 17, who were tied to the rest only through member 1) and member 12 alone, whose only link was to member 1.',
      it: 'Il membro 34 ha 17 collegamenti e il membro 1 ne ha 16 (tocca un nodo per leggerne il grado; il successivo, il membro 33, ne ha 12). Senza di loro la rete ha 32 nodi in tre componenti: una di 26 membri, una di 5 (i membri 5, 6, 7, 11 e 17, legati al resto solo attraverso il membro 1) e il membro 12 da solo, il cui unico collegamento era con il membro 1.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Four papers have these authors: P1 {a, b, c}, P2 {c, d}, P3 {d, e, f}, P4 {a, f}. How many links has the projection onto the authors? And the projection onto the papers? Could the four papers be rebuilt from the author projection alone? Check with the "Exercise 6" preset of the projections panel.',
      it: 'Quattro articoli hanno questi autori: P1 {a, b, c}, P2 {c, d}, P3 {d, e, f}, P4 {a, f}. Quanti collegamenti ha la proiezione sugli autori? E la proiezione sugli articoli? Si potrebbero ricostruire i quattro articoli dalla sola proiezione sugli autori? Verifica con «Esercizio 6» nel pannello delle proiezioni.',
    },
    solution: {
      en: 'Authors: P1 gives a–b, a–c, b–c; P2 gives c–d; P3 gives d–e, d–f, e–f; P4 gives a–f. Eight links, all of weight 1. Papers: P1–P2 share c, P2–P3 share d, P3–P4 share f, P4–P1 share a, and no other pair shares an author: four links, forming a ring. The original cannot be rebuilt: the triangle a–b–c, for instance, could just as well come from three papers {a, b}, {a, c} and {b, c}, which give exactly the same author projection.',
      it: "Autori: P1 dà a–b, a–c, b–c; P2 dà c–d; P3 dà d–e, d–f, e–f; P4 dà a–f. Otto collegamenti, tutti di peso 1. Articoli: P1–P2 hanno in comune c, P2–P3 hanno d, P3–P4 hanno f, P4–P1 hanno a, e nessun'altra coppia ha un autore in comune: quattro collegamenti, che formano un anello. L'originale non si può ricostruire: il triangolo a–b–c, per esempio, potrebbe venire altrettanto bene da tre articoli {a, b}, {a, c} e {b, c}, che danno esattamente la stessa proiezione sugli autori.",
    },
  },
]
