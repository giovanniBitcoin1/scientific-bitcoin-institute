// Module 14 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/network-lab/capstone-a-real-network.<lang>.md.
//
// Every number below is one the page shows with its fixed seeds;
// scripts/lab/check-network-14.mjs prints them (lines starting with INFO) and
// pins them ("quoted on the page"). Rerun it, and update these texts, if the
// data, the presets or the seeds change.

export const observe = {
  workbench: {
    en: `
1. **Card 1**, airports. The largest component has 3,188 of the 3,214 airports. Mean distance 3.96 and diameter 12; clustering 0.493 against 0.092 in the rewirings, distance 3.96 against 3.24. Both differences are far outside what the rewirings do among themselves: read the z column before the bars.
2. **Card 2**. The median is 3 and the maximum 248. The recipe picks k_min = 2 and α = 1.71, then rejects its own fit: none of the 200 synthetic sets fits worse than the data. The row of α at fixed k_min climbs from 1.71 to 2.40, and the right-hand chart shows the climb never stops.
3. **Card 3**. Four rankings, four lists. Anchorage is third by betweenness and absent from the other three columns; Atlanta leads PageRank and is fifth by degree. 0.458 of the airports have betweenness 0.
4. **Card 4**. r = −0.018 and the rewirings give −0.103 ± 0.005: z = 18.7. The rich-club ratio stays near 1 up to 50 routes, is 1.20 above 100 and reaches 1.35 among the eight largest. Ten other sets of rewirings give 1.24 to 1.34 for that last number: a club of eight is a rough measure.
5. **Card 5**. The first run finds 25 groups with Q = 0.656. Press **Run again**: 21 groups, Q = 0.657, and the two partitions agree at 0.920. In this second run a group of 131 has Anchorage as its hub; in the first, Anchorage sits in the group of Atlanta. The agreement with the regions is 0.622, then 0.644; the regions themselves have Q = 0.567, lower than what Louvain finds.
6. **Card 6**. β = 1.12; 0.556 of the links have weight 1; the largest weight is 20, Atlanta–Chicago. The backbone at 0.05 keeps 325 links: with weights this flat, few links stand out.
7. Choose the **Karate club** and run the cards. Clustering 0.571 against 0.366, z = 3.5; r = −0.476 against −0.271, z = −4.3: here the network is more disassortative than its degrees explain, the opposite of the airports. Card 2 says only "tail too small to say": 34 nodes cannot settle a tail.
`,
    it: `
1. **Scheda 1**, aeroporti. La componente più grande ha 3.188 dei 3.214 aeroporti. Distanza media 3,96 e diametro 12; clustering 0,493 contro 0,092 nelle ricablature, distanza 3,96 contro 3,24. Entrambe le differenze sono molto oltre ciò che le ricablature fanno tra loro: leggi la colonna z prima delle barre.
2. **Scheda 2**. La mediana è 3 e il massimo 248. La ricetta sceglie k_min = 2 e α = 1,71, poi respinge il proprio adattamento: nessuno dei 200 insiemi sintetici si adatta peggio dei dati. La riga di α con k_min fissato sale da 1,71 a 2,40, e il grafico a destra mostra che la salita non si ferma mai.
3. **Scheda 3**. Quattro classifiche, quattro elenchi. Anchorage è terza per betweenness e assente dalle altre tre colonne; Atlanta guida il PageRank ed è quinta per grado. Lo 0,458 degli aeroporti ha betweenness 0.
4. **Scheda 4**. r = −0,018 e le ricablature danno −0,103 ± 0,005: z = 18,7. Il rapporto di rich club resta vicino a 1 fino a 50 rotte, vale 1,20 sopra 100 e arriva a 1,35 tra gli otto più grandi. Altri dieci insiemi di ricablature danno da 1,24 a 1,34 per quest'ultimo numero: un club di otto è una misura grossolana.
5. **Scheda 5**. La prima esecuzione trova 25 gruppi con Q = 0,656. Premi **Esegui di nuovo**: 21 gruppi, Q = 0,657, e le due partizioni concordano a 0,920. In questa seconda esecuzione un gruppo di 131 ha Anchorage come hub; nella prima, Anchorage sta nel gruppo di Atlanta. L'accordo con le regioni è 0,622, poi 0,644; le regioni stesse hanno Q = 0,567, meno di ciò che trova Louvain.
6. **Scheda 6**. β = 1,12; lo 0,556 dei collegamenti ha peso 1; il peso massimo è 20, Atlanta–Chicago. La dorsale a 0,05 tiene 325 collegamenti: con pesi così piatti, pochi collegamenti spiccano.
7. Scegli il **Club di karate** ed esegui le schede. Clustering 0,571 contro 0,366, z = 3,5; r = −0,476 contro −0,271, z = −4,3: qui la rete è più disassortativa di quanto i gradi spieghino, il contrario degli aeroporti. La scheda 2 dice solo «coda troppo piccola per dirlo»: 34 nodi non possono decidere una coda.
`,
  },
  stress: {
    en: `
1. **Removal**, airports. With 10% removed: 0.86 at random, 0.14 by degree, 0.29 by degree recomputed, 0.27 by betweenness. At 5% the order is another: 0.93, 0.77, 0.74 and 0.59. Betweenness does the most damage early, because it takes the gateways first; by 10% the plain degree order has overtaken it.
2. At random the curve falls almost as a straight line: 0.60 with 30% removed, 0.37 with 50%. The network loses what is removed and little else, as f_c = 0.984 says.
3. **A germ**. T_c = 0.0156 and R0 = 6.42 at T = 0.1. The largest cluster is 0.19 of the network at T = 0.05, 0.48 at 0.2 and 0.78 at 0.5: above the threshold the outbreak is possible, but it is far from everything. The 22.1% of airports with one route are reached only if that one link passes it.
4. **A fashion**, φ = 0.18: 0.016 of the seeds start a global cascade, and 2 of the 20 airports with most routes. At φ = 0.10: 0.300 and 19 of 20. At φ = 0.25: none, and the largest cascade stops at 0.05 of the network.
5. Choose the **Karate club**: T_c = 0.1477, about ten times that of the airports, and at φ = 0.18 0.529 of the seeds go global. A small dense network is harder for a germ and easier for a fashion.
`,
    it: `
1. **Rimozione**, aeroporti. Con il 10% rimosso: 0,86 a caso, 0,14 per grado, 0,29 per grado ricalcolato, 0,27 per betweenness. Al 5% l'ordine è un altro: 0,93, 0,77, 0,74 e 0,59. La betweenness fa più danno all'inizio, perché toglie per prime le porte d'accesso; al 10% il semplice ordine per grado l'ha superata.
2. A caso la curva scende quasi come una retta: 0,60 con il 30% rimosso, 0,37 con il 50%. La rete perde ciò che viene tolto e poco altro, come dice f_c = 0,984.
3. **Un germe**. T_c = 0,0156 e R0 = 6,42 con T = 0,1. L'ammasso più grande è lo 0,19 della rete con T = 0,05, lo 0,48 con 0,2 e lo 0,78 con 0,5: sopra la soglia il focolaio è possibile, ma è lontano dal prendere tutto. Il 22,1% di aeroporti con una sola rotta è raggiunto solo se quell'unico collegamento lo trasmette.
4. **Una moda**, φ = 0,18: lo 0,016 dei semi avvia una cascata globale, e 2 dei 20 aeroporti con più rotte. Con φ = 0,10: 0,300 e 19 su 20. Con φ = 0,25: nessuno, e la cascata più grande si ferma allo 0,05 della rete.
5. Scegli il **Club di karate**: T_c = 0,1477, circa dieci volte quella degli aeroporti, e con φ = 0,18 lo 0,529 dei semi diventa globale. Una rete piccola e densa è più difficile per un germe e più facile per una moda.
`,
  },
  spread: {
    en: `
1. Type **ATL** and press Find. The map fills in from the hubs outwards, not from Atlanta outwards: Europe and East Asia light up while small airports of the United States are still grey. Over 20 runs the rank correlation of the arrival time is 0.71 with the flights, 0.09 with the kilometres, −0.87 with the degree.
2. Tap Rome: from Fiumicino 0.78, 0.29 and −0.88. From **ANC**: 0.59, 0.08 and −0.88. The seed changes the first two; the third hardly moves. A large airport is reached early wherever the spread starts.
3. In the left chart each distance in flights is a column of dots, and the columns overlap: an airport 2 flights away can be reached after one 4 flights away. Distance in flights is a better clock than kilometres, and still a poor one.
4. **Close an airport**. Close **ANC**: 87 airports are cut off, all the orange dots in Alaska. Reopen, close **AMS**: none, although it has the most routes. **ATL**: 11. **PPT** (Papeete, 30 routes): 26.
5. Close the first 10 by degree: 0.981 of the network is left in one piece. The first 10 by betweenness: 0.962. Ten airports are 0.3% of the network; the second list costs twelve times its own size.
`,
    it: `
1. Scrivi **ATL** e premi Trova. La mappa si riempie dagli hub verso l'esterno, non da Atlanta verso l'esterno: Europa e Asia orientale si accendono quando piccoli aeroporti degli Stati Uniti sono ancora grigi. Su 20 prove la correlazione di rango del tempo di arrivo è 0,71 con i voli, 0,09 con i chilometri, −0,87 con il grado.
2. Tocca Roma: da Fiumicino 0,78, 0,29 e −0,88. Da **ANC**: 0,59, 0,08 e −0,88. Il seme cambia le prime due; la terza quasi non si muove. Un grande aeroporto è raggiunto presto ovunque parta il contagio.
3. Nel grafico a sinistra ogni distanza in voli è una colonna di punti, e le colonne si sovrappongono: un aeroporto a 2 voli può essere raggiunto dopo uno a 4 voli. La distanza in voli è un orologio migliore dei chilometri, e resta un orologio scadente.
4. **Chiudi un aeroporto**. Chiudi **ANC**: 87 aeroporti sono tagliati fuori, tutti i punti arancioni in Alaska. Riapri, chiudi **AMS**: nessuno, benché abbia più rotte di tutti. **ATL**: 11. **PPT** (Papeete, 30 rotte): 26.
5. Chiudi i primi 10 per grado: resta in un pezzo solo lo 0,981 della rete. I primi 10 per betweenness: 0,962. Dieci aeroporti sono lo 0,3% della rete; il secondo elenco costa dodici volte la propria dimensione.
`,
  },
}

export const exercises = [
  {
    type: 'sim',
    statement: {
      en: 'In Figure F1 show the ten longest links. Which two are wrong, and how can you tell without knowing the airports? What would you do with them: delete, correct, keep?',
      it: 'Nella Figura F1 mostra i dieci collegamenti più lunghi. Quali due sono sbagliati, e come puoi capirlo senza conoscere gli aeroporti? Che cosa ne faresti: cancellare, correggere, tenere?',
    },
    solution: {
      en: 'The two from Lusaka (LUN) and Ndola (NLA) to the record KSLI, 16,082 and 15,937 km: longer than the longest real link of the file (Sydney–Dallas, 13,808 km), between small airports, each with one airline. Find KSLI: its name is an airfield in California, its city Solwesi, Zambia. The record of the airport is wrong, not the routes. Any of the three choices is defensible, provided it is written down: here the record is kept, and only the kilometres are affected.',
      it: 'I due da Lusaka (LUN) e Ndola (NLA) alla scheda KSLI, 16.082 e 15.937 km: più lunghi del più lungo collegamento vero del file (Sydney–Dallas, 13.808 km), tra aeroporti piccoli, ciascuno con una sola compagnia. Cerca KSLI: il nome è un campo d\'aviazione in California, la città Solwesi, Zambia. È sbagliata la scheda dell\'aeroporto, non le rotte. Ognuna delle tre scelte è difendibile, purché sia scritta: qui la scheda è tenuta, e ne risentono solo i chilometri.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'The largest component has ⟨k⟩ = 11.815 and ⟨k²⟩ = 770.41. Find T_c, the critical fraction for random failures, and R0 at T = 0.1. Then do the same for a network in which every airport has 12 routes.',
      it: 'La componente più grande ha ⟨k⟩ = 11,815 e ⟨k²⟩ = 770,41. Trova T_c, la frazione critica per i guasti casuali, e R0 con T = 0,1. Poi fai lo stesso per una rete in cui ogni aeroporto ha 12 rotte.',
    },
    solution: {
      en: 'T_c = ⟨k⟩/(⟨k²⟩ − ⟨k⟩) = 11.815/758.595 = 0.0156. f_c = 1 − T_c = 0.984. R0 = T/T_c = 0.1 × 758.595/11.815 = 6.42. With 12 routes each, ⟨k²⟩ = 144: T_c = 12/132 = 0.091, f_c = 0.909, R0 = 1.1. The mean degree is almost the same; the hubs, through ⟨k²⟩, make the difference.',
      it: 'T_c = ⟨k⟩/(⟨k²⟩ − ⟨k⟩) = 11,815/758,595 = 0,0156. f_c = 1 − T_c = 0,984. R0 = T/T_c = 0,1 × 758,595/11,815 = 6,42. Con 12 rotte ciascuno, ⟨k²⟩ = 144: T_c = 12/132 = 0,091, f_c = 0,909, R0 = 1,1. Il grado medio è quasi lo stesso; la differenza la fanno gli hub, attraverso ⟨k²⟩.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Anchorage has 34 routes and is third by betweenness. Explain it with step 6 of the lecture, predict what closing it does, and check in Panel C. Compare with Amsterdam, Atlanta and Papeete.',
      it: 'Anchorage ha 34 rotte ed è terza per betweenness. Spiegalo con il passo 6 della lezione, prevedi che cosa succede chiudendola, e verifica nel Pannello C. Confronta con Amsterdam, Atlanta e Papeete.',
    },
    solution: {
      en: 'Anchorage joins the group of Alaska, 131 airports, to the rest: every shortest path between that group and the world passes through it or through a few others. Closing it cuts off 87 airports. Closing Amsterdam, with 248 routes, cuts off none: its neighbours have other routes. Atlanta: 11. Papeete, with 30 routes: 26. What an airport holds together is not its number of routes.',
      it: 'Anchorage unisce il gruppo dell\'Alaska, 131 aeroporti, al resto: ogni cammino minimo tra quel gruppo e il mondo passa da lì o da pochi altri. Chiuderla taglia fuori 87 aeroporti. Chiudere Amsterdam, con 248 rotte, non ne taglia fuori nessuno: i suoi vicini hanno altre rotte. Atlanta: 11. Papeete, con 30 rotte: 26. Ciò che un aeroporto tiene insieme non è il suo numero di rotte.',
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In the workbench, read on card 2 the exponent fitted with k_min = 2, 5, 10, 20, 30. What does the drift of α mean? What does the test of module 05 say?',
      it: 'Nel banco di lavoro, leggi sulla scheda 2 l\'esponente stimato con k_min = 2, 5, 10, 20, 30. Che cosa significa la deriva di α? Che cosa dice il test del modulo 05?',
    },
    solution: {
      en: '1.71, 1.80, 1.90, 2.14, 2.40. A power law would give the same exponent from any cut-off inside its tail; an exponent that keeps rising says the tail bends downwards, faster than any power law. The test agrees: with 200 synthetic sets the p-value is below 0.005, so the power law is ruled out, and both the lognormal and the power law with a cut-off fit significantly better.',
      it: '1,71, 1,80, 1,90, 2,14, 2,40. Una legge di potenza darebbe lo stesso esponente da qualsiasi taglio dentro la sua coda; un esponente che continua a salire dice che la coda si piega verso il basso, più in fretta di qualsiasi legge di potenza. Il test concorda: con 200 insiemi sintetici il p-value è sotto 0,005, quindi la legge di potenza è esclusa, e sia la lognormale sia la legge di potenza con taglio si adattano significativamente meglio.',
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In Panel B. At T = 0.05, how much of the network does the largest cluster take? At φ = 0.18, what share of single seeds starts a global cascade, and how many of the 20 largest hubs? Why the difference between germ and fashion?',
      it: 'Nel Pannello B. Con T = 0,05, quanta parte della rete prende l\'ammasso più grande? Con φ = 0,18, quale quota di semi singoli avvia una cascata globale, e quanti dei 20 hub più grandi? Perché la differenza tra germe e moda?',
    },
    solution: {
      en: '0.19 of the network at T = 0.05, three times the threshold. 0.016 of the seeds, and 2 of the 20 hubs. One contact is enough for the germ, so hubs help it: they are reached early and pass it to many. The fashion needs 18% of the neighbours: an airport with one route adopts at once, but a hub with 200 routes needs 36 adopting neighbours, and its many small neighbours wait for it in turn.',
      it: 'Lo 0,19 della rete con T = 0,05, tre volte la soglia. Lo 0,016 dei semi, e 2 dei 20 hub. Al germe basta un contatto, quindi gli hub lo aiutano: sono raggiunti presto e lo passano a molti. La moda richiede il 18% dei vicini: un aeroporto con una sola rotta adotta subito, ma a un hub con 200 rotte servono 36 vicini che hanno adottato, e i suoi tanti piccoli vicini aspettano a loro volta lui.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Take your own network, or the karate club. Go through the ten questions of the method and write five sentences, each with a number and what it is compared with.',
      it: 'Prendi la tua rete, oppure il club di karate. Percorri le dieci domande del metodo e scrivi cinque frasi, ciascuna con un numero e ciò con cui è confrontato.',
    },
    solution: {
      en: 'For the karate club, for example. (1) Clustering is 0.571 against 0.366 in the rewirings (z = 3.5): more triangles than the degrees explain. (2) r = −0.476 against −0.271 (z = −4.3): the two leaders link to members with few ties, beyond what their degrees force. (3) Louvain finds 4 groups with Q = 0.419, while the two factions have Q = 0.358 and agree with it at 0.490: the split that happened is not the partition of highest modularity. (4) Removing 10% of the nodes leaves 0.91 at random and 0.59 by degree. (5) T_c = 0.148 against 0.0156 for the airports; and with 34 nodes the tail of the degrees cannot be tested at all.',
      it: 'Per il club di karate, per esempio. (1) Il clustering è 0,571 contro 0,366 nelle ricablature (z = 3,5): più triangoli di quanti i gradi ne spieghino. (2) r = −0,476 contro −0,271 (z = −4,3): i due capi si collegano a membri con pochi legami, oltre ciò che i gradi impongono. (3) Louvain trova 4 gruppi con Q = 0,419, mentre le due fazioni hanno Q = 0,358 e concordano con esso a 0,490: la divisione avvenuta non è la partizione di modularità massima. (4) Togliere il 10% dei nodi lascia 0,91 a caso e 0,59 per grado. (5) T_c = 0,148 contro 0,0156 per gli aeroporti; e con 34 nodi la coda dei gradi non può essere verificata affatto.',
    },
  },
]
