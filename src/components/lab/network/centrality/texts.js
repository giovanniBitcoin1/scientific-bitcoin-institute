// Module 03 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/network-lab/centrality.<lang>.md.
//
// Every number below is one the page shows with its default seeds;
// scripts/lab/check-network-03.mjs prints them (lines starting with INFO) and
// pins them ("quoted on the page"). Rerun it, and update these texts, if the
// presets or the seeds change.

export const observe = {
  rankings: {
    en: `
1. **Florentine families.** The Medici are first under all seven measures, so look at who comes second: the Guadagni for betweenness (0.255 against the Medici's 0.522), the Ridolfi for closeness, the Strozzi for eigenvector centrality. Tap the **Strozzi**: second for eigenvector centrality and for degree (shared), seventh for betweenness. Well connected, and seldom in between.
2. Still in Florence, choose **Picks the two ends of a path** and tap the Albizzi and the Tornabuoni: two shortest paths, one through the Medici and one through the Guadagni. Then inspect the Medici and pick the Acciaiuoli and anyone else: every path passes through them. Betweenness adds up shares like these over all 91 pairs.
3. **Krackhardt's kite.** Degree: Diane. Closeness: Fernando and Garth. Betweenness: Heather, who is only sixth for degree and eighth for eigenvector centrality. In the matrix, betweenness and eigenvector centrality correlate at 0.31, degree and eigenvector centrality at 0.99.
4. **Karate club.** Member 34 has the most links (17 against 16) and leads for eigenvector centrality and PageRank; member 1 leads for closeness and betweenness (0.438 against 0.304). The two leaders of the club split the measures between them.
5. Karate club, **Katz** slider. At 0.01 of the limit Katz correlates 0.98 with degree and 0.84 with eigenvector centrality; at 0.99 the numbers are 0.78 and 1.00. Watch members 3 and 33 swap third place on the way.
6. **Two groups and a bridge.** The ends of the bridge, b and l, are first for betweenness (0.53) and for closeness, with 2 and 4 links; b is nineteenth for degree. Now choose eigenvector centrality: the left group takes 94% of the total score and the right group almost disappears. Remove the bridge and the right group drops to exactly zero: the scores settle on one piece only.
7. Back to Florence. Set the PageRank slider to 1: the Medici get 0.150 = 6/40, and PageRank correlates 1.00 with degree. Then remove the Medici (Exercise 4).
`,
    it: `
1. **Famiglie fiorentine.** I Medici sono primi secondo tutte e sette le misure, quindi guarda chi arriva secondo: i Guadagni per l'intermediazione (0,255 contro lo 0,522 dei Medici), i Ridolfi per la vicinanza, gli Strozzi per la centralità di autovettore. Tocca gli **Strozzi**: secondi per la centralità di autovettore e per il grado (a pari merito), settimi per l'intermediazione. Ben collegati, e di rado in mezzo.
2. Sempre a Firenze, scegli **Sceglie i due estremi di un cammino** e tocca gli Albizzi e i Tornabuoni: due cammini minimi, uno attraverso i Medici e uno attraverso i Guadagni. Poi esamina i Medici e scegli gli Acciaiuoli e chiunque altro: ogni cammino passa da loro. L'intermediazione somma quote come queste su tutte le 91 coppie.
3. **L'aquilone di Krackhardt.** Grado: Diane. Vicinanza: Fernando e Garth. Intermediazione: Heather, che è solo sesta per grado e ottava per centralità di autovettore. Nella matrice, intermediazione e centralità di autovettore hanno correlazione 0,31, grado e centralità di autovettore 0,99.
4. **Club di karate.** Il membro 34 ha più collegamenti (17 contro 16) ed è in testa per centralità di autovettore e PageRank; il membro 1 è in testa per vicinanza e intermediazione (0,438 contro 0,304). I due capi del club si dividono le misure.
5. Club di karate, cursore di **Katz**. A 0,01 del limite Katz ha correlazione 0,98 con il grado e 0,84 con la centralità di autovettore; a 0,99 i numeri sono 0,78 e 1,00. Lungo il percorso i membri 3 e 33 si scambiano il terzo posto.
6. **Due gruppi e un ponte.** Gli estremi del ponte, b e l, sono primi per intermediazione (0,53) e per vicinanza, con 2 e 4 collegamenti; b è diciannovesimo per grado. Scegli ora la centralità di autovettore: il gruppo di sinistra prende il 94% del punteggio totale e quello di destra quasi scompare. Rimuovi il ponte e il gruppo di destra scende esattamente a zero: i punteggi si assestano su un pezzo solo.
7. Torna a Firenze. Porta il cursore del PageRank a 1: i Medici ottengono 0,150 = 6/40, e il PageRank ha correlazione 1,00 con il grado. Poi rimuovi i Medici (Esercizio 4).
`,
  },
  surfer: {
    en: `
1. Press **Play** at α = 0.85 and raise the speed. The orange bars grow towards the black marks: after 1,000 steps the loop J, K, L has 39% of the visits, after 100,000 it has 44.1%, its exact PageRank.
2. The ranking is not the ranking of incoming links. A, B and D have three each, yet J, with two, is first (0.154) and K and L, with one each, come next. The loop keeps whatever enters it until the next jump.
3. Set **α = 1** and play. With these settings the surfer wanders for 92 steps and enters the loop at step 93; it never comes out. The exact PageRank is 0.333 for J, K and L and 0 for the other nine pages.
4. Set **α = 0**: the surfer only jumps, and every page gets 1/12 = 0.083. The links no longer count.
5. Read the table at α = 0.85. **F**, which nobody links to, has the lowest PageRank (0.016) and eigenvector score 0, and passes the zero on to G; but it is the best hub (0.201), because it points to A and B, the two best authorities. **H**, with no outgoing links, has hub score 0 and a respectable authority (0.115). Katz gives nobody a zero.
6. Switch on **Every link two-way** with α = 1. The traps are gone, and PageRank is the number of links over 42: 0.119 for A, B, D and E, which have five each. The loop's share of the visits heads for 7/42 = 0.167.
`,
    it: `
1. Premi **Avvia** con α = 0,85 e aumenta la velocità. Le barre arancioni crescono verso i segni neri: dopo 1.000 passi l'anello J, K, L ha il 39% delle visite, dopo 100.000 ha il 44,1%, il suo PageRank esatto.
2. La classifica non è quella dei collegamenti in entrata. A, B e D ne hanno tre ciascuna, eppure J, con due, è prima (0,154) e K e L, con uno ciascuna, vengono subito dopo. L'anello trattiene tutto ciò che vi entra fino al salto successivo.
3. Imposta **α = 1** e avvia. Con queste impostazioni il navigatore vaga per 92 passi ed entra nell'anello al passo 93; non ne esce più. Il PageRank esatto è 0,333 per J, K e L e 0 per le altre nove pagine.
4. Imposta **α = 0**: il navigatore salta soltanto, e ogni pagina ottiene 1/12 = 0,083. I collegamenti non contano più.
5. Leggi la tabella con α = 0,85. **F**, a cui nessuna pagina rimanda, ha il PageRank più basso (0,016) e punteggio di autovettore 0, e trasmette lo zero a G; ma è il miglior hub (0,201), perché punta ad A e B, le due migliori autorità. **H**, senza collegamenti in uscita, ha punteggio di hub 0 e un'autorità rispettabile (0,115). Katz non dà zero a nessuno.
6. Attiva **Ogni collegamento nei due sensi** con α = 1. Le trappole spariscono, e il PageRank è il numero di collegamenti diviso 42: 0,119 per A, B, D ed E, che ne hanno cinque ciascuna. La quota di visite dell'anello tende a 7/42 = 0,167.
`,
  },
  fragility: {
    en: `
1. **Scale-free**, **missing links**, f = 0.2. The rank correlation with the truth is 0.85 for PageRank and 0.84 for degree, and 0.78, 0.78 and 0.77 for closeness, betweenness and eigenvector centrality. The top ten holds better than the ranking as a whole: 0.93 for degree and PageRank, 0.92 for betweenness, 0.82 for closeness and 0.81 for eigenvector centrality. Hubs stay hubs.
2. Same network, **spurious links**, f = 0.2. The order turns over: eigenvector centrality (0.94) and closeness (0.93) are now the steadiest rankings, degree and PageRank the least steady (0.82). Yet betweenness keeps its top ten almost intact (0.99). Which measure is robust depends on the kind of error.
3. **Small-world**, missing links, f = 0.2: correlations of 0.74 for betweenness and 0.72 for closeness, 0.48 for degree and 0.36 for eigenvector centrality; of the top ten, between 0.17 (eigenvector) and 0.49 (betweenness) survives. Nobody stands out in this network, so a small error reshuffles everybody.
4. Small-world, f = 0: the top ten by degree agrees with itself only at 0.82. Many nodes have the same degree, so "the ten best connected" is partly a draw. Before trusting a top ten, check that it is defined.
5. Small-world, spurious links, f = 0.1: closeness falls to 0.55, well below what 10% of missing links do to it (0.84). A spurious link is a shortcut, and closeness is made of distances (module 02 again).
6. **Karate club**, missing links: at f = 0.2 degree and PageRank keep 0.90, eigenvector centrality 0.83; at f = 0.5 they are down to 0.75, 0.76 and 0.62. Small networks are not safer.
`,
    it: `
1. **A invarianza di scala**, **collegamenti mancanti**, f = 0,2. La correlazione di rango con la verità è 0,85 per il PageRank e 0,84 per il grado, e 0,78, 0,78 e 0,77 per vicinanza, intermediazione e centralità di autovettore. I primi dieci tengono meglio della classifica intera: 0,93 per grado e PageRank, 0,92 per l'intermediazione, 0,82 per la vicinanza e 0,81 per la centralità di autovettore. Gli hub restano hub.
2. Stessa rete, **collegamenti spuri**, f = 0,2. L'ordine si rovescia: centralità di autovettore (0,94) e vicinanza (0,93) sono ora le classifiche più stabili, grado e PageRank le meno stabili (0,82). Eppure l'intermediazione conserva i suoi primi dieci quasi intatti (0,99). Quale misura sia robusta dipende dal tipo di errore.
3. **Small-world**, collegamenti mancanti, f = 0,2: correlazioni di 0,74 per l'intermediazione e 0,72 per la vicinanza, 0,48 per il grado e 0,36 per la centralità di autovettore; dei primi dieci sopravvive tra lo 0,17 (autovettore) e lo 0,49 (intermediazione). In questa rete nessuno spicca, quindi un piccolo errore rimescola tutti.
4. Small-world, f = 0: i primi dieci per grado coincidono con sé stessi solo per lo 0,82. Molti nodi hanno lo stesso grado, quindi «i dieci meglio collegati» sono in parte un sorteggio. Prima di fidarti di una lista dei primi dieci, controlla che sia definita.
5. Small-world, collegamenti spuri, f = 0,1: la vicinanza scende a 0,55, molto sotto l'effetto del 10% di collegamenti mancanti (0,84). Un collegamento spurio è una scorciatoia, e la vicinanza è fatta di distanze (di nuovo il modulo 02).
6. **Club di karate**, collegamenti mancanti: con f = 0,2 grado e PageRank conservano 0,90, la centralità di autovettore 0,83; con f = 0,5 sono scesi a 0,75, 0,76 e 0,62. Le reti piccole non sono più sicure.
`,
  },
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: 'A star: one centre linked to five leaves, and no other link. Compute degree, closeness and normalised betweenness of the centre and of a leaf.',
      it: 'Una stella: un centro collegato a cinque foglie, e nessun altro collegamento. Calcola grado, vicinanza e intermediazione normalizzata del centro e di una foglia.',
    },
    solution: {
      en: 'Centre: degree 5. It is one step from each of the five others, so closeness = 5/5 = 1. Every shortest path between two leaves passes through it, and there are 5 × 4/2 = 10 pairs of leaves, which is also the number of pairs of other nodes, (N − 1)(N − 2)/2 = 10: normalised betweenness 10/10 = 1. Leaf: degree 1. It is one step from the centre and two from each of the four other leaves: the distances sum to 1 + 4 × 2 = 9, so closeness = 5/9 ≈ 0.556. No shortest path passes through a leaf: betweenness 0. The star is the most unequal network there is, and betweenness shows it most sharply (1 against 0), closeness least (1 against 0.556).',
      it: "Centro: grado 5. È a un passo da ciascuno degli altri cinque, quindi vicinanza = 5/5 = 1. Ogni cammino minimo tra due foglie passa da lui, e le coppie di foglie sono 5 × 4/2 = 10, che è anche il numero di coppie di altri nodi, (N − 1)(N − 2)/2 = 10: intermediazione normalizzata 10/10 = 1. Foglia: grado 1. È a un passo dal centro e a due da ciascuna delle altre quattro foglie: le distanze sommano a 1 + 4 × 2 = 9, quindi vicinanza = 5/9 ≈ 0,556. Nessun cammino minimo passa da una foglia: intermediazione 0. La stella è la rete più diseguale che ci sia, e l'intermediazione lo mostra nel modo più netto (1 contro 0), la vicinanza nel modo più sfumato (1 contro 0,556).",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'A path of five nodes, a – b – c – d – e. Compute the betweenness of every node (as a number of pairs), and the closeness of c and of a.',
      it: "Un cammino di cinque nodi, a – b – c – d – e. Calcola l'intermediazione di ogni nodo (come numero di coppie), e la vicinanza di c e di a.",
    },
    solution: {
      en: 'Between any two nodes there is one shortest path, so betweenness counts the pairs a node separates. a and e separate nobody: 0. b lies between a and each of c, d, e: 3. c lies between {a, b} and {d, e}: 2 × 2 = 4. By symmetry d has 3. So 0, 3, 4, 3, 0 (divided by the 6 pairs of others: 0, 0.5, 0.67, 0.5, 0). Closeness of c: distances 2, 1, 1, 2, sum 6, so 4/6 ≈ 0.667. Closeness of a: distances 1, 2, 3, 4, sum 10, so 4/10 = 0.4. Every node here has degree 1 or 2: degree barely separates b from c, betweenness and closeness do.',
      it: "Tra due nodi qualsiasi c'è un solo cammino minimo, quindi l'intermediazione conta le coppie che un nodo separa. a ed e non separano nessuno: 0. b sta tra a e ciascuno di c, d, e: 3. c sta tra {a, b} e {d, e}: 2 × 2 = 4. Per simmetria d ha 3. Quindi 0, 3, 4, 3, 0 (dividendo per le 6 coppie di altri: 0, 0,5, 0,67, 0,5, 0). Vicinanza di c: distanze 2, 1, 1, 2, somma 6, quindi 4/6 ≈ 0,667. Vicinanza di a: distanze 1, 2, 3, 4, somma 10, quindi 4/10 = 0,4. Qui ogni nodo ha grado 1 o 2: il grado non distingue b da c, l'intermediazione e la vicinanza sì.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Three pages: A links to B and to C, B links to C, C links to A. Compute the PageRank without jumps (α = 1), then with α = 0.85.',
      it: 'Tre pagine: A rimanda a B e a C, B rimanda a C, C rimanda ad A. Calcola il PageRank senza salti (α = 1), poi con α = 0,85.',
    },
    solution: {
      en: 'Without jumps. A receives all of C: a = c. B receives half of A: b = a/2. C receives half of A and all of B: c = a/2 + b = a. With a + b + c = 1 this gives 2.5a = 1: a = 0.4, b = 0.2, c = 0.4. With α = 0.85 every page also receives 0.15/3 = 0.05: a = 0.05 + 0.85c, b = 0.05 + 0.425a, c = 0.05 + 0.425a + 0.85b. Substituting b into c gives c = 0.0925 + 0.78625a, and then a = 0.05 + 0.85c gives a = 0.128625/0.3316875 ≈ 0.388, b ≈ 0.215, c ≈ 0.397. The jumps take a little from A and give it to B, and C, which has two incoming links, is now alone in first place.',
      it: 'Senza salti. A riceve tutto da C: a = c. B riceve metà di A: b = a/2. C riceve metà di A e tutto B: c = a/2 + b = a. Con a + b + c = 1 si ha 2,5a = 1: a = 0,4, b = 0,2, c = 0,4. Con α = 0,85 ogni pagina riceve anche 0,15/3 = 0,05: a = 0,05 + 0,85c, b = 0,05 + 0,425a, c = 0,05 + 0,425a + 0,85b. Sostituendo b in c si ottiene c = 0,0925 + 0,78625a, e poi a = 0,05 + 0,85c dà a = 0,128625/0,3316875 ≈ 0,388, b ≈ 0,215, c ≈ 0,397. I salti tolgono un poco ad A e lo danno a B, e C, che ha due collegamenti in entrata, è ora da sola al primo posto.',
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "Rankings compared", load the Florentine families. Who is first under each measure? Now remove the Medici: into how many pieces does the network fall, and who is the main go-between?',
      it: 'In «Classifiche a confronto», carica le famiglie fiorentine. Chi è primo secondo ciascuna misura? Ora rimuovi i Medici: in quanti pezzi si divide la rete, e chi è il principale intermediario?',
    },
    solution: {
      en: 'The Medici are first under all seven measures: degree 6, closeness 0.560, harmonic closeness 0.679, betweenness 0.522, and the top score for eigenvector centrality, Katz and PageRank (0.146). Removing them takes six links away and leaves three pieces of 11, 2 and 1 families: the Pazzi and the Salviati are joined only to each other, and the Acciaiuoli to nobody. The main go-between is now the Guadagni family, with a betweenness of 0.314 (24.5 of the 78 pairs), ahead of the Bischeri (0.212) and the Strozzi (0.147). The other measures no longer agree: Guadagni and Strozzi share first place for degree (4), Guadagni and Bischeri for closeness, the Guadagni lead for PageRank and harmonic closeness, the Strozzi for eigenvector centrality and Katz. Note that eigenvector centrality gives exactly zero to the three families outside the large piece.',
      it: "I Medici sono primi secondo tutte e sette le misure: grado 6, vicinanza 0,560, vicinanza armonica 0,679, intermediazione 0,522, e il punteggio più alto per centralità di autovettore, Katz e PageRank (0,146). Rimuoverli toglie sei collegamenti e lascia tre pezzi di 11, 2 e 1 famiglie: i Pazzi e i Salviati sono collegati solo tra loro, e gli Acciaiuoli a nessuno. Il principale intermediario è ora la famiglia Guadagni, con un'intermediazione di 0,314 (24,5 delle 78 coppie), davanti ai Bischeri (0,212) e agli Strozzi (0,147). Le altre misure non sono più d'accordo: Guadagni e Strozzi condividono il primo posto per grado (4), Guadagni e Bischeri per vicinanza, i Guadagni sono in testa per PageRank e vicinanza armonica, gli Strozzi per centralità di autovettore e Katz. Nota che la centralità di autovettore dà esattamente zero alle tre famiglie fuori dal pezzo grande.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "The random surfer", set α = 1 and play. Where does the surfer end up, and what is the PageRank of the pages outside? Then set α = 0.85: which page is first?',
      it: 'In «Il navigatore casuale», imposta α = 1 e avvia. Dove finisce il navigatore, e qual è il PageRank delle pagine fuori? Poi imposta α = 0,85: quale pagina è prima?',
    },
    solution: {
      en: 'With α = 1 the surfer ends up in the loop J → K → L → J: in the run the panel shows it enters at step 93 and never leaves. The only way in is the link from I, and there is no way out. The exact PageRank is 1/3 = 0.333 for each of J, K and L and 0 for all nine pages outside, including A, B and D with their three incoming links each. (H, the page without outgoing links, is not a trap: from there the surfer jumps to a random page.) With α = 0.85 the first page is J, with 0.154, followed by K (0.147) and L (0.141): J receives from I as well as from L. The three pages of the loop hold 44% of the PageRank between them. The best page outside is D, with 0.093. The jumps bring the rest of the web back to life, but the trap still collects far more than its links deserve: this is why link farms were built.',
      it: "Con α = 1 il navigatore finisce nell'anello J → K → L → J: nella prova mostrata dal pannello entra al passo 93 e non esce più. L'unico ingresso è il collegamento da I, e non c'è uscita. Il PageRank esatto è 1/3 = 0,333 per ciascuna tra J, K e L e 0 per tutte le nove pagine fuori, comprese A, B e D con i loro tre collegamenti in entrata ciascuna. (H, la pagina senza collegamenti in uscita, non è una trappola: da lì il navigatore salta su una pagina a caso.) Con α = 0,85 la prima pagina è J, con 0,154, seguita da K (0,147) e L (0,141): J riceve da I oltre che da L. Le tre pagine dell'anello hanno insieme il 44% del PageRank. La migliore pagina fuori è D, con 0,093. I salti riportano in vita il resto della rete, ma la trappola raccoglie comunque molto più di quanto i suoi collegamenti meritino: per questo sono nate le «link farm».",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "How fragile is a ranking?", choose the scale-free network and missing links, and read the curves at f = 0.2. Which measure keeps its top ten best, and which worst?',
      it: 'In «Quanto è fragile una classifica?», scegli la rete a invarianza di scala e i collegamenti mancanti, e leggi le curve a f = 0,2. Quale misura conserva meglio i suoi primi dieci, e quale peggio?',
    },
    solution: {
      en: 'Best: degree and PageRank, which both keep 0.93 of their true top ten, with betweenness just behind at 0.92. Worst: eigenvector centrality, 0.81, with closeness next to it at 0.82. The reason is in what each measure reads. A hub that loses a fifth of its links is still a hub, so a count of links, or a walk that follows them, hardly notices. Closeness and eigenvector centrality depend on the whole network, and their scores are close together: when links go missing, distances stretch unevenly and many nodes change places. Betweenness also reads the whole network, but in a scale-free network it is concentrated on the hubs, which protects its top ten (though not the rest of its ranking: its rank correlation is 0.78, like that of closeness). Do not take this as a general ranking of the measures: with spurious links instead of missing ones, eigenvector centrality and closeness have the steadiest rankings.',
      it: "Meglio: grado e PageRank, che conservano entrambi lo 0,93 dei loro veri primi dieci, con l'intermediazione subito dietro a 0,92. Peggio: la centralità di autovettore, 0,81, con la vicinanza accanto a 0,82. La ragione sta in ciò che ogni misura legge. Un hub che perde un quinto dei suoi collegamenti è ancora un hub, quindi un conteggio dei collegamenti, o un cammino che li segue, quasi non se ne accorge. Vicinanza e centralità di autovettore dipendono dall'intera rete, e i loro punteggi sono vicini tra loro: quando mancano collegamenti le distanze si allungano in modo diseguale e molti nodi cambiano posto. Anche l'intermediazione legge l'intera rete, ma in una rete a invarianza di scala è concentrata sugli hub, e questo protegge i suoi primi dieci (non il resto della classifica: la sua correlazione di rango è 0,78, come quella della vicinanza). Non prenderlo come una classifica generale delle misure: con collegamenti spuri al posto di quelli mancanti, sono la centralità di autovettore e la vicinanza ad avere le classifiche più stabili.",
    },
  },
]
