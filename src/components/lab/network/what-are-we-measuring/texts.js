// Module 02 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/network-lab/what-are-we-measuring.<lang>.md.
//
// Every number below is one the page shows with its default seeds;
// scripts/lab/check-network-02.mjs prints them (lines starting with INFO).
// Rerun it, and update these texts, if the presets or the seeds change.

export const observe = {
  observer: {
    en: `
1. Choose the **small-world** truth and **random nodes** at f = 0.3. The average degree falls from 6 to about 1.7, but the transitivity stays where it was (0.49 against 0.48). Now switch to **random links** at the same f: the transitivity drops to 0.14, about 0.3 times the truth. In the bias curves the orange line is flat in one case and a diagonal in the other.
2. **Random** truth, random nodes. Slide f down and watch the largest component: it holds 94% of the sample at f = 0.5, 81% at 0.3, 55% at 0.2 and 15% at 0.15. The blue curve collapses near 1/⟨k⟩ = 0.17.
3. **Dense random** truth, **directions from a source**, one source: 6,000 links become 599 and ⟨k⟩ = 20 becomes 2.00, with no triangle left. With ten sources the map still shows only 3,984 links. Compare the two degree distributions.
4. **Scale-free** truth, **random walk** at f = 0.3. The plain average of the degrees met is 14.4, close to ⟨k²⟩/⟨k⟩ = 14.8; weighted by 1/k it is 6.2, close to ⟨k⟩ = 6.0. Then try **snowball** at f = 0.3: with 30% of the nodes it has already found a node of degree 71 (the largest is 75). Random nodes at the same f see no degree above 27.
5. **Small-world** truth, **spurious links**. At 0.02 the average distance falls from 6.7 to 6.0, at 0.10 to 4.7. For comparison, random links at f = 0.9 (10% missing) raise it only to 7.3.
6. Small-world truth, **merged nodes** at 0.05: the largest degree jumps from 8 to 18 and the average distance falls from 6.7 to 5.5. A merged node is a hub and a shortcut at once.
7. Press **New sample** a few times: the observed numbers move, the bias curves (30 samples pooled) do not. One sample is one draw.
`,
    it: `
1. Scegli la verità **small-world** e **nodi a caso** con f = 0,3. Il grado medio scende da 6 a circa 1,7, ma la transitività resta dov'era (0,49 contro 0,48). Passa ora a **collegamenti a caso** con la stessa f: la transitività scende a 0,14, circa 0,3 volte quella vera. Nelle curve di distorsione la linea arancione è piatta in un caso e una diagonale nell'altro.
2. Verità **casuale**, nodi a caso. Abbassa f e osserva la componente più grande: contiene il 94% del campione con f = 0,5, l'81% con 0,3, il 55% con 0,2 e il 15% con 0,15. La curva blu crolla vicino a 1/⟨k⟩ = 0,17.
3. Verità **casuale densa**, **indicazioni da una sorgente**, una sola sorgente: 6.000 collegamenti diventano 599 e ⟨k⟩ = 20 diventa 2,00, senza più alcun triangolo. Con dieci sorgenti la mappa mostra ancora solo 3.984 collegamenti. Confronta le due distribuzioni dei gradi.
4. Verità **a invarianza di scala**, **cammino casuale** con f = 0,3. La media semplice dei gradi incontrati è 14,4, vicina a ⟨k²⟩/⟨k⟩ = 14,8; pesata con 1/k è 6,2, vicina a ⟨k⟩ = 6,0. Prova poi **a valanga** con f = 0,3: con il 30% dei nodi ha già trovato un nodo di grado 71 (il massimo è 75). I nodi a caso, con la stessa f, non vedono gradi sopra 27.
5. Verità **small-world**, **collegamenti spuri**. A 0,02 la distanza media scende da 6,7 a 6,0, a 0,10 scende a 4,7. Per confronto, i collegamenti a caso con f = 0,9 (il 10% mancante) la fanno salire solo a 7,3.
6. Verità small-world, **nodi fusi** a 0,05: il grado massimo balza da 8 a 18 e la distanza media scende da 6,7 a 5,5. Un nodo fuso è insieme un hub e una scorciatoia.
7. Premi **Nuovo campione** qualche volta: i numeri osservati si spostano, le curve di distorsione (30 campioni messi insieme) no. Un campione è una sola estrazione.
`,
  },
  nullModels: {
    en: `
1. **Karate club**, transitivity, **same N and L**: the observed 0.256 sits far to the right of the histogram (null mean about 0.135, z about 4.3). Switch to **same degrees**: the null mean rises to 0.22, z falls to about 1.3, and roughly one sample in ten is at least as extreme. Most of the surprise was the degrees.
2. Same network, **average clustering**: z is about 12.6 against the first null model and still about 4 against the second. The two clustering coefficients of module 01 disagree here too.
3. Karate club, **assortativity**: observed −0.48. With the same N and L the null mean is about −0.06; with the same degrees it is about −0.31. The degrees alone push it most of the way, and the observed value is still about 3.6 standard deviations lower.
4. **Small-world** preset: transitivity z is about 29, and the average distance (4.9 against 3.4) is about 27 standard deviations too long. **Random** preset: every z stays between −1.4 and 0.7. That is what "nothing to explain" looks like.
5. **Scale-free** preset, average distance: 3.0 against 3.4 with the same N and L (z about −7), but against the same degrees z is only about −2. The hubs are what shortens it.
6. **Florentine families**: no statistic reaches |z| = 1.5. Fifteen nodes cannot say much.
7. Press **Watch a swap** a few times, then **Swap 100 times**: the circles keep their sizes (the degrees) while the wiring dissolves, and the transitivity of the drawing drifts towards the null mean.
8. Raise the randomisations to 2,000: the histogram smooths and z settles (4.3 becomes 4.0 for the karate club's transitivity).
`,
    it: `
1. **Club di karate**, transitività, **stessi N e L**: il valore osservato, 0,256, sta molto a destra dell'istogramma (media nulla circa 0,135, z circa 4,3). Passa a **stessi gradi**: la media nulla sale a 0,22, z scende a circa 1,3, e circa un campione su dieci è almeno altrettanto estremo. Quasi tutta la sorpresa erano i gradi.
2. Stessa rete, **clustering medio**: z vale circa 12,6 rispetto al primo modello nullo e ancora circa 4 rispetto al secondo. I due coefficienti di clustering del modulo 01 non sono d'accordo nemmeno qui.
3. Club di karate, **assortatività**: osservata −0,48. Con gli stessi N e L la media nulla è circa −0,06; con gli stessi gradi è circa −0,31. I gradi da soli la spingono per gran parte della strada, e il valore osservato resta comunque circa 3,6 deviazioni standard più in basso.
4. Rete **small-world**: lo z della transitività è circa 29, e la distanza media (4,9 contro 3,4) è troppo lunga di circa 27 deviazioni standard. Rete **casuale**: ogni z resta tra −1,4 e 0,7. Così appare una rete in cui non c'è «niente da spiegare».
5. Rete **a invarianza di scala**, distanza media: 3,0 contro 3,4 con gli stessi N e L (z circa −7), ma rispetto agli stessi gradi z è solo circa −2. Ad accorciarla sono gli hub.
6. **Famiglie fiorentine**: nessuna statistica arriva a |z| = 1,5. Quindici nodi non possono dire molto.
7. Premi **Guarda uno scambio** qualche volta, poi **Scambia 100 volte**: i cerchi conservano le loro dimensioni (i gradi) mentre la trama si dissolve, e la transitività del disegno scivola verso la media nulla.
8. Porta le randomizzazioni a 2.000: l'istogramma si fa più liscio e z si assesta (per la transitività del club di karate, 4,3 diventa 4,0).
`,
  },
  friends: {
    en: `
1. **Scale-free** network: a random node has 6.0 links on average, a random friend 15.1. The orange curve runs far above the black one: 2.4% of the nodes have 20 links or more, but 17% of the friends do. 903 nodes out of 1,000 have fewer links than their friends do on average.
2. **Random** network: 6.0 against 7.0. For a Poisson distribution the variance equals the mean, so the friend has exactly one link more: ⟨k⟩ + 1. Still, 66% of the nodes are below their friends' average.
3. **Ring lattice**: 6 and 6, and nobody is below their friends. With no variance there is no paradox, and in the early-warning experiment the friends are ahead in about half of the runs: no lead beyond noise.
4. **Karate club**: 4.6 against 7.8, and 29 of the 34 members have fewer links than their friends on average.
5. Early warning on the **scale-free** network: the friends are half infected at step 22.1, the random group at 24.1. The lead is 1.9 steps, and the friends are ahead in 96% of the runs. On the **random** network the lead shrinks to 0.7 steps, with the friends ahead in 71% of the runs: less variance, less warning.
6. On the karate club the groups have 9 members and the friends are ahead in only 71% of the runs. A sensor group needs to be large to be reliable.
`,
    it: `
1. Rete **a invarianza di scala**: un nodo a caso ha in media 6,0 collegamenti, un amico a caso 15,1. La curva arancione corre molto sopra quella nera: il 2,4% dei nodi ha 20 collegamenti o più, ma tra gli amici è il 17%. 903 nodi su 1.000 hanno meno collegamenti di quanti ne hanno in media i loro amici.
2. Rete **casuale**: 6,0 contro 7,0. In una distribuzione di Poisson la varianza è uguale alla media, quindi l'amico ha esattamente un collegamento in più: ⟨k⟩ + 1. Eppure il 66% dei nodi è sotto la media dei propri amici.
3. **Reticolo ad anello**: 6 e 6, e nessuno è sotto i propri amici. Senza varianza non c'è paradosso, e nell'esperimento di allarme precoce gli amici sono in anticipo in circa metà delle prove: nessun anticipo oltre il rumore.
4. **Club di karate**: 4,6 contro 7,8, e 29 dei 34 membri hanno meno collegamenti di quanti ne hanno in media i loro amici.
5. Allarme precoce sulla rete **a invarianza di scala**: gli amici sono infetti per metà al passo 22,1, il gruppo a caso al passo 24,1. L'anticipo è di 1,9 passi, e gli amici sono in anticipo nel 96% delle prove. Sulla rete **casuale** l'anticipo si riduce a 0,7 passi, con gli amici in anticipo nel 71% delle prove: meno varianza, meno preavviso.
6. Nel club di karate i gruppi hanno 9 membri e gli amici sono in anticipo solo nel 71% delle prove. Un gruppo sentinella deve essere grande per essere affidabile.
`,
  },
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: 'A network has ⟨k⟩ = 8 and transitivity 0.30. What do you expect to measure from (a) a random quarter of the nodes with the links among them, (b) all the nodes and a random quarter of the links?',
      it: 'Una rete ha ⟨k⟩ = 8 e transitività 0,30. Che cosa ti aspetti di misurare (a) su un quarto dei nodi, scelti a caso, con i collegamenti tra loro, (b) su tutti i nodi e un quarto dei collegamenti, scelti a caso?',
    },
    solution: {
      en: '(a) A link survives only if the node at its other end was kept, so ⟨k⟩ = 8 × 0.25 = 2. Triangles and connected triples both need three kept nodes and shrink by the same factor 0.25³, so the transitivity is still 0.30. (b) Each link survives with probability 0.25, so again ⟨k⟩ = 2. A triple keeps both its links with probability 0.25², a triangle all three with 0.25³: the transitivity becomes 0.25 × 0.30 = 0.075. The two samples report the same average degree and transitivities that differ by a factor of four.',
      it: "(a) Un collegamento sopravvive solo se è stato conservato il nodo all'altro estremo, quindi ⟨k⟩ = 8 × 0,25 = 2. Triangoli e triple connesse richiedono entrambi tre nodi conservati e si riducono dello stesso fattore 0,25³: la transitività resta 0,30. (b) Ogni collegamento sopravvive con probabilità 0,25, quindi di nuovo ⟨k⟩ = 2. Una tripla conserva entrambi i suoi collegamenti con probabilità 0,25², un triangolo tutti e tre con 0,25³: la transitività diventa 0,25 × 0,30 = 0,075. I due campioni danno lo stesso grado medio e transitività che differiscono di un fattore quattro.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'A hub A is linked to B, C, d and e; B is also linked to f; C is also linked to g. What is the mean degree? What is the mean degree at the end of a random link? How many of the seven nodes have fewer links than their neighbours have on average?',
      it: "Un hub A è collegato a B, C, d ed e; B è collegato anche a f; C è collegato anche a g. Qual è il grado medio? Qual è il grado medio all'estremo di un collegamento scelto a caso? Quanti dei sette nodi hanno meno collegamenti di quanti ne hanno in media i loro vicini?",
    },
    solution: {
      en: 'The degrees are 4 (A), 2 (B), 2 (C) and 1 for d, e, f and g: they sum to 12, so L = 6 and ⟨k⟩ = 12/7 ≈ 1.71. The squares sum to 16 + 4 + 4 + 4 = 28, so the mean degree at the end of a random link is ⟨k²⟩/⟨k⟩ = 28/12 ≈ 2.33. Neighbour averages: A has neighbours of degree 2, 2, 1, 1, average 1.5, less than its own 4. B and C have neighbours of degree 4 and 1, average 2.5, more than 2. d and e see only A (4); f and g see a node of degree 2. So six of the seven, all but A, have fewer links than their neighbours on average.',
      it: "I gradi sono 4 (A), 2 (B), 2 (C) e 1 per d, e, f e g: sommano a 12, quindi L = 6 e ⟨k⟩ = 12/7 ≈ 1,71. I quadrati sommano a 16 + 4 + 4 + 4 = 28, quindi il grado medio all'estremo di un collegamento a caso è ⟨k²⟩/⟨k⟩ = 28/12 ≈ 2,33. Medie dei vicini: A ha vicini di grado 2, 2, 1, 1, media 1,5, meno del suo 4. B e C hanno vicini di grado 4 e 1, media 2,5, più di 2. d ed e vedono solo A (4); f e g vedono un nodo di grado 2. Quindi sei su sette, tutti tranne A, hanno meno collegamenti della media dei loro vicini.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'A random walker reports the degree of every node it visits. The plain average of the reports is 20; their harmonic mean is 8. What is ⟨k⟩, and what does the 20 estimate?',
      it: 'Un camminatore casuale comunica il grado di ogni nodo che visita. La media semplice dei valori è 20; la loro media armonica è 8. Quanto vale ⟨k⟩, e che cosa stima il 20?',
    },
    solution: {
      en: 'The walker visits a node in proportion to its degree, so high degrees are over-counted. Weighting each visit by 1/k cancels this exactly, and the weighted average is the harmonic mean: ⟨k⟩ is about 8. The plain average estimates the mean degree at the end of a random link, ⟨k²⟩/⟨k⟩ = 20. The two together give more: ⟨k²⟩ ≈ 160, so the variance of the degrees is about 160 − 64 = 96 and their standard deviation is close to 10, larger than the mean. This network has hubs.',
      it: "Il camminatore visita un nodo in proporzione al suo grado, quindi i gradi alti sono contati troppe volte. Pesare ogni visita con 1/k annulla esattamente questo effetto, e la media pesata è la media armonica: ⟨k⟩ vale circa 8. La media semplice stima il grado medio all'estremo di un collegamento a caso, ⟨k²⟩/⟨k⟩ = 20. Insieme dicono di più: ⟨k²⟩ ≈ 160, quindi la varianza dei gradi è circa 160 − 64 = 96 e la deviazione standard è vicina a 10, più grande della media. Questa rete ha degli hub.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "The observer", choose the random truth and random nodes. From the blue bias curve, below what fraction does the largest component fall apart? What does theory say? Then do the same with the scale-free truth: compute its threshold from ⟨k⟩ = 5.98 and ⟨k²⟩ = 88.2.',
      it: 'In «L\'osservatore», scegli la verità casuale e i nodi a caso. Guardando la curva blu di distorsione, sotto quale quota la componente più grande va in pezzi? Che cosa dice la teoria? Poi ripeti con la verità a invarianza di scala: calcola la sua soglia da ⟨k⟩ = 5,98 e ⟨k²⟩ = 88,2.',
    },
    solution: {
      en: 'Random truth: the largest component holds about 71% of the sample at f = 0.3, 53% at 0.25, 28% at 0.2 and 15% at 0.15: it falls apart between 0.25 and 0.15. Theory gives p_c = 1/⟨k⟩ = 1/6 ≈ 0.17 (0.169 from the actual moments of this network). The transition is not sharp because the network is small: at f = 0.17 the sample has about a hundred nodes. Scale-free truth: p_c = 5.98/(88.2 − 5.98) ≈ 0.073, less than half the value of the random network with the same ⟨k⟩. The curve agrees in direction, with 38% of the sample at f = 0.2 and 26% at 0.15 where the random network has 28% and 15%, but on 600 nodes it cannot show a threshold at 0.07: there the sample has about forty nodes.',
      it: "Verità casuale: la componente più grande contiene circa il 71% del campione con f = 0,3, il 53% con 0,25, il 28% con 0,2 e il 15% con 0,15: va in pezzi tra 0,25 e 0,15. La teoria dà p_c = 1/⟨k⟩ = 1/6 ≈ 0,17 (0,169 con i momenti effettivi di questa rete). La transizione non è netta perché la rete è piccola: con f = 0,17 il campione ha un centinaio di nodi. Verità a invarianza di scala: p_c = 5,98/(88,2 − 5,98) ≈ 0,073, meno della metà del valore della rete casuale con lo stesso ⟨k⟩. La curva va nella stessa direzione, con il 38% del campione a f = 0,2 e il 26% a 0,15 dove la rete casuale ha il 28% e il 15%, ma su 600 nodi non può mostrare una soglia a 0,07: lì il campione ha una quarantina di nodi.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "The observer", choose the dense random truth and directions from a source, with one source. What average degree is observed? Why would it be about 2 for any network?',
      it: 'In «L\'osservatore», scegli la verità casuale densa e le indicazioni da una sorgente, con una sola sorgente. Quale grado medio si osserva? Perché sarebbe circa 2 per qualsiasi rete?',
    },
    solution: {
      en: 'The panel shows ⟨k⟩ = 2.00 where the truth is 20, and 599 links where there are 6,000. The routes from one source form a tree: every node other than the source is reached through exactly one link, the last step of its route. A tree on N nodes has N − 1 links, so ⟨k⟩ = 2(N − 1)/N = 2 × 599/600 ≈ 1.997, whatever the network. Nine links in ten are invisible and there is not a single triangle. The source appears with all 21 of its links and a few nodes next to it with up to 26, while 497 of the 600 nodes appear with a single link. In the truth every degree is close to 20; on the map the degrees run from 1 to 26, a skewed distribution that the measurement made.',
      it: "Il pannello mostra ⟨k⟩ = 2,00 dove il valore vero è 20, e 599 collegamenti dove ce ne sono 6.000. I percorsi da una sola sorgente formano un albero: ogni nodo diverso dalla sorgente è raggiunto attraverso un solo collegamento, l'ultimo passo del suo percorso. Un albero su N nodi ha N − 1 collegamenti, quindi ⟨k⟩ = 2(N − 1)/N = 2 × 599/600 ≈ 1,997, qualunque sia la rete. Nove collegamenti su dieci sono invisibili e non c'è un solo triangolo. La sorgente compare con tutti i suoi 21 collegamenti e alcuni nodi accanto a lei con un numero che arriva a 26, mentre 497 dei 600 nodi compaiono con un solo collegamento. Nella verità ogni grado è vicino a 20; sulla mappa i gradi vanno da 1 a 26, una distribuzione asimmetrica prodotta dalla misura.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "Compared to what?", load the karate club. Is its transitivity (0.256) surprising against each of the two null models? And its assortativity (−0.476), given its degrees?',
      it: 'In «Rispetto a che cosa?», carica il club di karate. La sua transitività (0,256) è sorprendente rispetto a ciascuno dei due modelli nulli? E la sua assortatività (−0,476), dati i suoi gradi?',
    },
    solution: {
      en: 'Transitivity. Same N and L: null mean about 0.136 (the density, more exactly (L − 2)/(M − 2) with M = 561 pairs), standard deviation about 0.03, z about 4, and no sample out of 2,000 as high: surprising. Same degrees: null mean about 0.224, standard deviation about 0.026, z about 1.2, and about 13% of the samples at least as high: not surprising. The degrees of the club explain its transitivity. Assortativity. Same degrees: null mean about −0.30, standard deviation about 0.05, z about −3.6. The degrees force a clearly negative value, so most of the −0.476 needs no further explanation; but the club is still more disassortative than its degrees require, and that remainder is a real feature of how it is wired.',
      it: "Transitività. Stessi N e L: media nulla circa 0,136 (la densità, più esattamente (L − 2)/(M − 2) con M = 561 coppie), deviazione standard circa 0,03, z circa 4, e nessun campione su 2.000 altrettanto alto: sorprendente. Stessi gradi: media nulla circa 0,224, deviazione standard circa 0,026, z circa 1,2, e circa il 13% dei campioni almeno altrettanto alto: non sorprendente. I gradi del club ne spiegano la transitività. Assortatività. Stessi gradi: media nulla circa −0,30, deviazione standard circa 0,05, z circa −3,6. I gradi impongono un valore nettamente negativo, quindi gran parte del −0,476 non richiede altre spiegazioni; ma il club è comunque più disassortativo di quanto i suoi gradi richiedano, e questo scarto è una caratteristica reale di come è collegato.",
    },
  },
]
