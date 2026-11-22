// Module 09 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/network-lab/communities.<lang>.md.
//
// Every number below is one the page shows with its default seeds;
// scripts/lab/check-network-09.mjs prints them (lines starting with INFO) and
// pins them ("quoted on the page"). Rerun it, and update these texts, if the
// presets or the seeds change.

export const observe = {
  find: {
    en: `
1. **Default**, the benchmark with k_out = 6 and Louvain, seed 1: the planted partition gives Q = 0.389, and Louvain finds 4 groups with Q = 0.391 and NMI 0.925. The answer scores a little higher than the truth and still differs from it: a few nodes with many links across sit better, for Q, in another group.
2. Press **Sweep k_out** (20 networks per value). Louvain stays above 0.95 up to k_out = 6 (0.996 and 0.975 at 5 and 6), then falls: 0.793, 0.448, 0.217 at k_out = 7, 8, 9. At k_out = 12, μ = 0.75, three quarters of every node's links go to other groups and nothing is left to find. Label propagation gives way earlier: 0.920, 0.768, 0.427, 0.000 at k_out = 4, 5, 6, 7. From k_out = 7 on, one label takes over the whole network.
3. Press **Random networks**. On random networks of 1,000 nodes Louvain finds Q = 0.522, 0.325, 0.226 at mean degree 4, 8 and 16, with 39, 15, 9 groups: high scores, and no groups at all. On the random network of the panel, Louvain finds Q = 0.204 in 7 groups, against −0.011 for the four blocks of 32; label propagation leaves everything in one group, Q = 0.
4. **Karate club**: the factions give Q = 0.358. Louvain with seed 1 finds 4 groups and Q = 0.419; the NMI with the factions is 0.490, because each faction is cut in two. Step through the seeds: the groups move, the score barely does.
`,
    it: `
1. **Valori iniziali**, il benchmark con k_out = 6 e Louvain, seme 1: la partizione impiantata dà Q = 0,389, e Louvain trova 4 gruppi con Q = 0,391 e NMI 0,925. La risposta ha un punteggio un po' più alto della verità e ne differisce comunque: qualche nodo con molti collegamenti verso fuori sta meglio, per Q, in un altro gruppo.
2. Premi **Scorri k_out** (20 reti per valore). Louvain resta sopra 0,95 fino a k_out = 6 (0,996 e 0,975 a 5 e 6), poi cade: 0,793, 0,448, 0,217 a k_out = 7, 8, 9. A k_out = 12, μ = 0,75, tre quarti dei collegamenti di ogni nodo vanno ad altri gruppi e non resta nulla da trovare. La propagazione delle etichette cede prima: 0,920, 0,768, 0,427, 0,000 a k_out = 4, 5, 6, 7. Da k_out = 7 in poi una sola etichetta si prende tutta la rete.
3. Premi **Reti a caso**. Su reti a caso di 1.000 nodi Louvain trova Q = 0,522, 0,325, 0,226 con grado medio 4, 8 e 16, con 39, 15, 9 gruppi: punteggi alti, e nessun gruppo. Sulla rete a caso del pannello Louvain trova Q = 0,204 in 7 gruppi, contro −0,011 dei quattro blocchi di 32; la propagazione delle etichette lascia tutto in un gruppo, Q = 0.
4. **Club di karate**: le fazioni danno Q = 0,358. Louvain con seme 1 trova 4 gruppi e Q = 0,419; la NMI con le fazioni è 0,490, perché ogni fazione viene tagliata in due. Passa da un seme all'altro: i gruppi si spostano, il punteggio quasi non cambia.
`,
  },
  resolution: {
    en: `
1. **Default**, n = 30 cliques of s = 5: each clique alone gives Q = 0.8758 and pairs 0.8879, since 30 > 22. Louvain finds 16 groups, fourteen pairs and two cliques left alone, with Q = 0.8871: it merges, as the score asks, but stops just short of the best pairing.
2. Move n down to 22 and below: each clique now wins, and Louvain returns one group per clique. At n = 22 the two partitions tie.
3. Raise **γ**. The cliques are recovered for γ between 1.36 and 31.1 at the default size; Louvain keeps merging at γ = 1.2 and returns the 30 cliques from γ = 1.5. Push γ to 40 and it splits every clique: 90 groups.
4. **n = 60 and s = 3**: 0.7333 against 0.8417 for pairs, and Louvain reaches 0.8678 with 14 groups, every one holding several triangles. Small groups in a big network are where modularity loses its sight.
`,
    it: `
1. **Valori iniziali**, n = 30 cricche di s = 5: ogni cricca da sola dà Q = 0,8758 e le coppie 0,8879, perché 30 > 22. Louvain trova 16 gruppi, quattordici coppie e due cricche rimaste sole, con Q = 0,8871: fonde, come chiede il punteggio, ma si ferma appena prima dell'accoppiamento migliore.
2. Porta n a 22 e sotto: ora vince ogni cricca, e Louvain restituisce un gruppo per cricca. Con n = 22 le due partizioni sono pari.
3. Alza **γ**. Le cricche si ritrovano per γ tra 1,36 e 31,1 alla dimensione iniziale; Louvain continua a fondere con γ = 1,2 e restituisce le 30 cricche da γ = 1,5. Spingi γ a 40 e spezza ogni cricca: 90 gruppi.
4. **n = 60 e s = 3**: 0,7333 contro 0,8417 delle coppie, e Louvain arriva a 0,8678 con 14 gruppi, ciascuno con diversi triangoli. I gruppi piccoli in una rete grande sono dove la modularità perde la vista.
`,
  },
  detect: {
    en: `
1. **Default**, N = 4,000, c̄ = 10, 1.5 times the threshold (c_in = 14.74, c_out = 5.26, 73.7% of the links inside): the spectral overlap is 0.73. Louvain splits the same network into 12 groups with Q = 0.281, and its NMI with the two planted groups is 0.021: it finds groups, not these.
2. Press **Sweep**. The overlap at 0, 0.6, 0.8, 1, 1.2, 1.5, 2 and 3 times the threshold is 0.01, 0.02, 0.01, 0.12, 0.46, 0.71, 0.93, 1.00. Below the threshold it is chance; above it, it rises, but not as a step: in 4,000 nodes the sharp limit of the theory is blurred, and this method, which can be misled by the nodes of highest degree in a sparse network, needs some margin above it.
3. **c̄ = 3, N = 10,000**: at 0.6, 1 and 1.5 times the threshold Louvain returns 576, 556, 574 groups with Q of 0.64, 0.65, 0.65 and NMI 0.02, 0.02, 0.10. The score is high and almost the same whether the two groups can be found or not: in a sparse network modularity finds many small groups anyway.
4. At c̄ = 3 the multiple of the threshold stops at √3 ≈ 1.73, where c_out = 0 and the two groups are two separate networks.
`,
    it: `
1. **Valori iniziali**, N = 4.000, c̄ = 10, 1,5 volte la soglia (c_in = 14,74, c_out = 5,26, il 73,7% dei collegamenti dentro): la sovrapposizione spettrale è 0,73. Louvain divide la stessa rete in 12 gruppi con Q = 0,281, e la sua NMI con i due gruppi impiantati è 0,021: trova dei gruppi, non questi.
2. Premi **Scorri**. La sovrapposizione a 0, 0,6, 0,8, 1, 1,2, 1,5, 2 e 3 volte la soglia è 0,01, 0,02, 0,01, 0,12, 0,46, 0,71, 0,93, 1,00. Sotto la soglia è il caso; sopra, sale, ma non a gradino: in 4.000 nodi il limite netto della teoria è sfumato, e questo metodo, che in una rete sparsa può farsi ingannare dai nodi di grado più alto, ha bisogno di un certo margine sopra la soglia.
3. **c̄ = 3, N = 10.000**: a 0,6, 1 e 1,5 volte la soglia Louvain restituisce 576, 556, 574 gruppi con Q di 0,64, 0,65, 0,65 e NMI 0,02, 0,02, 0,10. Il punteggio è alto e quasi uguale che i due gruppi si possano trovare o no: in una rete sparsa la modularità trova comunque molti gruppi piccoli.
4. Con c̄ = 3 il multiplo della soglia si ferma a √3 ≈ 1,73, dove c_out = 0 e i due gruppi sono due reti separate.
`,
  },
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: 'Two triangles joined by one link: 6 nodes, 7 links. Compute Q for the split into the two triangles, for all nodes in one group, and for every node alone.',
      it: 'Due triangoli uniti da un collegamento: 6 nodi, 7 collegamenti. Calcola Q per la divisione nei due triangoli, per tutti i nodi in un gruppo, e per ogni nodo da solo.',
    },
    solution: {
      en: 'L = 7, so 2L = 14. The two nodes on the joining link have degree 3, the other four degree 2. Two triangles: 6 of the 7 links are inside, and each group has degree sum 7, so Q = 6/7 − 2 (7/14)² = 6/7 − 1/2 = 5/14 ≈ 0.357. One group: all 7 links inside and degree sum 14, Q = 1 − 1 = 0. Every node alone: no link inside, and Q = −Σ (k_i/14)² = −(4 · 4 + 2 · 9)/196 = −34/196 ≈ −0.173. A partition into pieces with no links inside scores below zero.',
      it: 'L = 7, quindi 2L = 14. I due nodi sul collegamento di unione hanno grado 3, gli altri quattro grado 2. Due triangoli: 6 dei 7 collegamenti stanno dentro, e ogni gruppo ha somma dei gradi 7, quindi Q = 6/7 − 2 (7/14)² = 6/7 − 1/2 = 5/14 ≈ 0,357. Un gruppo: tutti i 7 collegamenti dentro e somma dei gradi 14, Q = 1 − 1 = 0. Ogni nodo da solo: nessun collegamento dentro, e Q = −Σ (k_i/14)² = −(4 · 4 + 2 · 9)/196 = −34/196 ≈ −0,173. Una partizione in pezzi senza collegamenti interni ha punteggio sotto zero.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'A ring of n cliques of s nodes, each clique joined to the next by one link (n even). Show that putting neighbouring cliques in pairs raises Q exactly when n > s(s − 1) + 2. For n = 30 and s = 5, what are the two values of Q?',
      it: "Un anello di n cricche di s nodi, ogni cricca unita alla successiva da un collegamento (n pari). Mostra che mettere a coppie le cricche vicine alza Q esattamente quando n > s(s − 1) + 2. Per n = 30 e s = 5, quali sono i due valori di Q?",
    },
    solution: {
      en: 'Each clique has s(s − 1)/2 links inside and degree sum d = s(s − 1) + 2 (its inner links count twice, plus two outer link ends). L = n(s(s − 1)/2 + 1). Each clique a group: Q₁ = n[s(s − 1)/(2L) − (d/2L)²]. In pairs, each of the n/2 groups gains the link that joins its two cliques and has degree sum 2d: Q₂ = (n/2)[(s(s − 1) + 1)/L − (2d/2L)²]. The difference is Q₂ − Q₁ = n[1/(2L) − (d/2L)²], positive when 2L > d², that is n(s(s − 1) + 2) > d², that is n > d = s(s − 1) + 2. For s = 5, d = 22: the pairs win from n = 24, and n = 22 is a tie. For n = 30, L = 330: Q₁ = 1 − 30/330 − 30 (22/660)² = 0.8758 and Q₂ = Q₁ + 30 (1/660 − 1/900) = 0.8879.',
      it: "Ogni cricca ha s(s − 1)/2 collegamenti dentro e somma dei gradi d = s(s − 1) + 2 (i collegamenti interni contano due volte, più due estremi di collegamenti esterni). L = n(s(s − 1)/2 + 1). Ogni cricca un gruppo: Q₁ = n[s(s − 1)/(2L) − (d/2L)²]. A coppie, ognuno degli n/2 gruppi guadagna il collegamento che unisce le sue due cricche e ha somma dei gradi 2d: Q₂ = (n/2)[(s(s − 1) + 1)/L − (2d/2L)²]. La differenza è Q₂ − Q₁ = n[1/(2L) − (d/2L)²], positiva quando 2L > d², cioè n(s(s − 1) + 2) > d², cioè n > d = s(s − 1) + 2. Per s = 5, d = 22: le coppie vincono da n = 24, e n = 22 è un pareggio. Per n = 30, L = 330: Q₁ = 1 − 30/330 − 30 (22/660)² = 0,8758 e Q₂ = Q₁ + 30 (1/660 − 1/900) = 0,8879.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Two equal groups with mean degree c̄ = 3, a pair inside a group linked with probability c_in/N and a pair across with c_out/N. What is the smallest c_in − c_out that can be detected? Is c_in = 4.5, c_out = 1.5 detectable, and what share of each node\'s links stays inside? With c̄ = 10, what c_in is needed?',
      it: 'Due gruppi uguali con grado medio c̄ = 3, una coppia nello stesso gruppo collegata con probabilità c_in/N e una coppia tra gruppi con c_out/N. Qual è il più piccolo c_in − c_out che si può rilevare? c_in = 4,5, c_out = 1,5 è rilevabile, e che quota dei collegamenti di ogni nodo resta dentro? Con c̄ = 10, quale c_in serve?',
    },
    solution: {
      en: "The threshold is 2√c̄ = 2√3 ≈ 3.46. With c_in = 4.5 and c_out = 1.5, c̄ = (4.5 + 1.5)/2 = 3 and c_in − c_out = 3 < 3.46: not detectable, although a node has on average c_in/2 = 2.25 links inside and c_out/2 = 0.75 across, so 75% of its links stay inside. With c̄ = 10, c_in + c_out = 20 and c_in − c_out > 2√10 ≈ 6.32, so c_in > 10 + √10 ≈ 13.16, with c_out < 6.84: about two thirds of the links inside are needed. A denser network needs a smaller share inside, because the threshold grows only as √c̄.",
      it: "La soglia è 2√c̄ = 2√3 ≈ 3,46. Con c_in = 4,5 e c_out = 1,5, c̄ = (4,5 + 1,5)/2 = 3 e c_in − c_out = 3 < 3,46: non rilevabile, anche se un nodo ha in media c_in/2 = 2,25 collegamenti dentro e c_out/2 = 0,75 verso l'altro gruppo, così che il 75% dei suoi collegamenti resta dentro. Con c̄ = 10, c_in + c_out = 20 e c_in − c_out > 2√10 ≈ 6,32, quindi c_in > 10 + √10 ≈ 13,16, con c_out < 6,84: servono circa due terzi dei collegamenti dentro. Una rete più densa ha bisogno di una quota interna minore, perché la soglia cresce solo come √c̄.",
    },
  },
  {
    type: 'both',
    statement: {
      en: 'The karate club: compute Q of the two factions, then find Louvain\'s best partition in "Find the groups" by stepping through the seeds.',
      it: 'Il club di karate: calcola Q delle due fazioni, poi trova la partizione migliore di Louvain in «Trova i gruppi» passando da un seme all\'altro.',
    },
    solution: {
      en: "With the repository's data, src/data/lab/networks/karate-club.json (NetworkX's unweighted network, 78 links, NetworkX's \"club\" labels: 17 members with Mr. Hi, 17 with the officer), the factions give Q = 0.3582. Louvain's best over 100 seeds is 0.4198, with four groups of 12, 11, 6 and 5 members, reached by 18 seeds; this is the value reported in the literature as the maximum. Published values for the factions differ because the versions of the data differ: Zachary's matrix of weighted ties, or a member placed in the other faction.",
      it: "Con i dati del repository, src/data/lab/networks/karate-club.json (la rete senza pesi di NetworkX, 78 collegamenti, le etichette \"club\" di NetworkX: 17 membri con Mr. Hi, 17 con il dirigente), le fazioni danno Q = 0,3582. Il migliore di Louvain su 100 semi è 0,4198, con quattro gruppi di 12, 11, 6 e 5 membri, raggiunto da 18 semi; è il valore riportato in letteratura come massimo. I valori pubblicati per le fazioni differiscono perché differiscono le versioni dei dati: la matrice dei legami pesati di Zachary, o un membro messo nell'altra fazione.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "Find the groups", press Sweep k_out: at what μ = k_out/16 does the NMI of each method fall below 0.5? Then press Random networks.',
      it: 'In «Trova i gruppi», premi Scorri k_out: a quale μ = k_out/16 la NMI di ciascun metodo scende sotto 0,5? Poi premi Reti a caso.',
    },
    solution: {
      en: 'Louvain, mean of 20 networks: 0.98, 0.79, 0.45, 0.22 at k_out = 6, 7, 8, 9. It falls below 0.5 at k_out = 8, μ = 0.5, when half of every node\'s links leave its group. Label propagation falls below 0.5 already at k_out = 6, μ = 0.375 (0.43), and from k_out = 7 it returns a single group. Random networks of 1,000 nodes: Louvain finds Q = 0.52, 0.32, 0.23 at mean degree 4, 8, 16, and at mean degree 16 the 0.23 is close to the 0.25 that the planted groups of the benchmark, with the same mean degree, score at k_out = 8. The score alone cannot tell the two cases apart.',
      it: "Louvain, media di 20 reti: 0,98, 0,79, 0,45, 0,22 a k_out = 6, 7, 8, 9. Scende sotto 0,5 a k_out = 8, μ = 0,5, quando metà dei collegamenti di ogni nodo esce dal suo gruppo. La propagazione delle etichette scende sotto 0,5 già a k_out = 6, μ = 0,375 (0,43), e da k_out = 7 restituisce un solo gruppo. Reti a caso di 1.000 nodi: Louvain trova Q = 0,52, 0,32, 0,23 con grado medio 4, 8, 16, e con grado medio 16 lo 0,23 è vicino allo 0,25 che i gruppi impiantati del benchmark, con lo stesso grado medio, ottengono a k_out = 8. Il punteggio da solo non distingue i due casi.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "Can they be found at all?", with c̄ = 10 and N = 4,000, press Sweep and read the overlap against the multiple of the threshold. Then set c̄ = 3 and N = 10,000 and read what Louvain finds below, at and above the threshold.',
      it: 'In «Si possono trovare?», con c̄ = 10 e N = 4.000, premi Scorri e leggi la sovrapposizione al variare del multiplo della soglia. Poi metti c̄ = 3 e N = 10.000 e leggi che cosa trova Louvain sotto, sulla e sopra la soglia.',
    },
    solution: {
      en: 'Mean of three networks: 0.02, 0.01, 0.12, 0.46, 0.71, 0.93 at 0.6, 0.8, 1.0, 1.2, 1.5, 2.0 times the threshold. Below it the spectral split is no better than chance; above it the overlap climbs, but gradually, and reaches 0.9 only at about twice the threshold: a finite network, and a method that is not the best possible near the limit. At c̄ = 3 and N = 10,000 Louvain returns between 550 and 580 groups with Q ≈ 0.65 at 0.6, 1 and 1.5 times the threshold, with NMI at most 0.10: a high score in every case, and nothing to do with whether the two groups can be detected.',
      it: 'Media di tre reti: 0,02, 0,01, 0,12, 0,46, 0,71, 0,93 a 0,6, 0,8, 1,0, 1,2, 1,5, 2,0 volte la soglia. Sotto la soglia la divisione spettrale non fa meglio del caso; sopra, la sovrapposizione sale, ma gradualmente, e arriva a 0,9 solo a circa il doppio della soglia: una rete finita, e un metodo che vicino al limite non è il migliore possibile. Con c̄ = 3 e N = 10.000 Louvain restituisce tra 550 e 580 gruppi con Q ≈ 0,65 a 0,6, 1 e 1,5 volte la soglia, con NMI al massimo 0,10: un punteggio alto in ogni caso, e nessun legame con la possibilità di rilevare i due gruppi.',
    },
  },
]
