// Module 04 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/network-lab/triangles-weak-ties-motifs.<lang>.md.
//
// Every number below is one the page shows with its default seeds;
// scripts/lab/check-network-04.mjs prints them (lines starting with INFO) and
// pins them ("quoted on the page"). Rerun it, and update these texts, if the
// presets or the seeds change.

export const observe = {
  closure: {
    en: `
1. Before pressing anything, read the start: 200 nodes and 200 links placed at random. There is no triangle, every link is a local bridge, the largest piece holds 0.815 of the nodes and the average distance inside it is 6.22.
2. Set **p = 0** and press **Run to the end**. The orange curve lies exactly on the dashed one: with no closure the two networks are the same. At 800 links the transitivity is 0.033, close to the density, 0.040: in a random network a triangle closes only by accident. Local bridges are still 0.76 of the links.
3. Set **p = 0.5** and run again. Of the 600 new links, 288 close a triangle. Transitivity 0.167 and average clustering 0.235, against 0.033 and 0.030; local bridges down to 0.18. The average distance hardly notices: 2.88 against 2.76.
4. Set **p = 1**. Transitivity 0.339, clustering 0.455, and almost no local bridge left (0.01). But the largest piece is still 0.815 of the nodes, as at the start: a link that closes a triangle joins two nodes that were already two steps apart, so it never joins two pieces.
5. Go back to **p = 0.75**: transitivity 0.245, and the largest piece reaches 0.95. Closing triangles builds clustering; it takes random links to build reach. Real networks have both.
6. Press **Reset**, then **Step** a few times at p = 0.5 and read the line under the buttons: which two nodes were linked, and through whom.
`,
    it: `
1. Prima di premere qualcosa, leggi la situazione di partenza: 200 nodi e 200 collegamenti disposti a caso. Non c'è nessun triangolo, ogni collegamento è un ponte locale, il pezzo più grande contiene lo 0,815 dei nodi e la distanza media al suo interno è 6,22.
2. Imposta **p = 0** e premi **Vai alla fine**. La curva arancione sta esattamente su quella tratteggiata: senza chiusura le due reti sono la stessa. A 800 collegamenti la transitività è 0,033, vicina alla densità, 0,040: in una rete casuale un triangolo si chiude solo per caso. I ponti locali sono ancora lo 0,76 dei collegamenti.
3. Imposta **p = 0,5** e ripeti. Dei 600 nuovi collegamenti, 288 chiudono un triangolo. Transitività 0,167 e clustering medio 0,235, contro 0,033 e 0,030; i ponti locali scendono a 0,18. La distanza media quasi non se ne accorge: 2,88 contro 2,76.
4. Imposta **p = 1**. Transitività 0,339, clustering 0,455, e quasi nessun ponte locale rimasto (0,01). Ma il pezzo più grande è ancora lo 0,815 dei nodi, come all'inizio: un collegamento che chiude un triangolo unisce due nodi che erano già a due passi di distanza, quindi non unisce mai due pezzi.
5. Torna a **p = 0,75**: transitività 0,245, e il pezzo più grande arriva a 0,95. Chiudere triangoli costruisce clustering; per arrivare lontano servono collegamenti casuali. Le reti reali hanno entrambe le cose.
6. Premi **Azzera**, poi **Passo** qualche volta con p = 0,5 e leggi la riga sotto i pulsanti: quali due nodi sono stati collegati, e attraverso chi.
`,
  },
  weak: {
    en: `
1. The drawing is the first of the 300 networks: 1,264 links, of which only 73 (6%) join two groups. With the switch **on** and **Weakest first**, move the slider slowly and read the table. The largest piece is 0.998 of the network at f = 0.03, then 0.974 at 0.04, 0.779 at 0.05, 0.413 at 0.06 and 0.145 at 0.08. At f = 0.1 it is 0.129: little more than one group out of eight (0.125). In the drawing the dark links between groups go first.
2. **Strongest first**: 0.996 at f = 0.5, 0.848 at 0.8, 0.455 at 0.9. Nodes drop off one at a time, and the other pieces never average two nodes. The network wears down; it does not break.
3. **At random**: 0.822 at f = 0.8, and below one half from f = 0.86. Strongest first is not kinder all the way. Up to f = 0.78 it keeps slightly fewer nodes than random removal (0.948 against 0.975 at f = 0.7), because it strips the dense insides of the groups, where nodes lose their last links. The two curves cross between f = 0.78 and 0.79; after that strongest first holds on longer, 0.848 against 0.822 at f = 0.8, and reaches one half only at 0.90: it spares the few links that join the groups until the very end.
4. **Lowest overlap first** breaks the network a little sooner than weakest first: 0.578 at f = 0.05 and 0.229 at 0.06. Strength is overlap plus noise, so the weakest links are nearly, not exactly, the ones between groups.
5. Look at the second chart with weakest first or lowest overlap first: around f = 0.06 the other pieces average about 26 nodes. They are whole groups (now and then two groups that are still joined).
6. Now turn the switch **off**. The network is the same; only the strengths have been dealt out again. Three curves do not move at all: **at random**, **lowest overlap first** and **highest overlap first** ignore strength, and they are the same, point by point, with the switch on and off (lowest overlap first is still 0.229 at f = 0.06). Weakest first and strongest first fall onto the curve of random removal: at f = 0.8 they are at 0.812 and 0.823, and random removal at 0.822; the three are never more than 0.035 apart. What holds the network together is the position of a link. Strength matters only as far as it tells you the position.
7. The small chart says the same in one line: with the switch on, the average overlap rises from 0.05 in the weakest tenth of the links to 0.48 in the strongest; with the switch off it stays between 0.26 and 0.29.
`,
    it: `
1. Il disegno è la prima delle 300 reti: 1.264 collegamenti, di cui solo 73 (il 6%) uniscono due gruppi. Con l'interruttore su **sì** e **Prima i più deboli**, sposta lentamente il cursore e leggi la tabella. Il pezzo più grande è lo 0,998 della rete con f = 0,03, poi 0,974 con 0,04, 0,779 con 0,05, 0,413 con 0,06 e 0,145 con 0,08. Con f = 0,1 è 0,129: poco più di un gruppo su otto (0,125). Nel disegno i collegamenti scuri tra i gruppi spariscono per primi.
2. **Prima i più forti**: 0,996 con f = 0,5, 0,848 con 0,8, 0,455 con 0,9. I nodi si staccano uno alla volta, e gli altri pezzi non arrivano mai a due nodi in media. La rete si consuma; non si rompe.
3. **A caso**: 0,822 con f = 0,8, e sotto la metà da f = 0,86. Togliere per primi i più forti non è più clemente fino in fondo. Fino a f = 0,78 tiene un po' meno nodi della rimozione a caso (0,948 contro 0,975 con f = 0,7), perché svuota l'interno fitto dei gruppi, dove i nodi perdono i loro ultimi collegamenti. Le due curve si incrociano tra f = 0,78 e 0,79; da lì in poi «prima i più forti» resiste più a lungo, 0,848 contro 0,822 con f = 0,8, e arriva alla metà solo a 0,90: risparmia fino all'ultimo i pochi collegamenti che uniscono i gruppi.
4. **Prima la sovrapposizione più bassa** rompe la rete un po' prima di «prima i più deboli»: 0,578 con f = 0,05 e 0,229 con 0,06. La forza è la sovrapposizione più un rumore, quindi i collegamenti più deboli sono quasi, non esattamente, quelli tra i gruppi.
5. Guarda il secondo grafico con «prima i più deboli» o «prima la sovrapposizione più bassa»: intorno a f = 0,06 gli altri pezzi hanno in media circa 26 nodi. Sono gruppi interi (ogni tanto due gruppi ancora uniti).
6. Ora metti l'interruttore su **no**. La rete è la stessa; sono state solo ridistribuite le forze. Tre curve non si muovono affatto: **a caso**, **prima la sovrapposizione più bassa** e **prima la sovrapposizione più alta** non guardano la forza, e sono identiche, punto per punto, con l'interruttore su sì e su no («prima la sovrapposizione più bassa» è ancora 0,229 con f = 0,06). «Prima i più deboli» e «prima i più forti» cadono sulla curva della rimozione a caso: con f = 0,8 valgono 0,812 e 0,823, e la rimozione a caso 0,822; le tre non distano mai più di 0,035. Ciò che tiene insieme la rete è la posizione di un collegamento. La forza conta solo nella misura in cui rivela la posizione.
7. Il grafico piccolo dice la stessa cosa in una riga: con l'interruttore su sì la sovrapposizione media sale da 0,05 nel decimo più debole dei collegamenti a 0,48 nel più forte; su no resta tra 0,26 e 0,29.
`,
  },
  motifs: {
    en: `
1. **Regulation-like** network, 200 randomised networks. The feed-forward loop occurs 39 times against 15.8 ± 3.3: z = 7.0. It is the only bar on the right.
2. Three bars point the other way: fan-out 401 against 424.2, fan-in 72 against 95.2, chain 72 against 94.6, with z = −7.0, −7.0 and −6.5. These are not three more discoveries. The randomised networks keep every node's links, and so the number of pairs of links that meet at a node; each of the 23 extra feed-forward loops uses up one fan-out, one fan-in and one chain. One fact, four bars: z-scores of different patterns are not independent.
3. Move the slider to **1,000**. The null mean and standard deviation settle at 15.7 ± 3.5 and z at 6.7. More randomised networks make z more precise; they do not make it larger.
4. **Layered like a food web.** No feed-forward loop against 14.8 ± 3.9 expected, z = −3.8, and no cycle against 2.3; the chain is over-represented, 461 against 439.2, z = 3.7, but that is the same fact once more, as in point 2: each missing feed-forward loop leaves one chain open and each missing cycle three, and 14.8 + 3 × 2.3 ≈ 21.8. A pattern that is missing is information too.
5. **Random.** The feed-forward loop occurs 6 times against 4.1 ± 2.1, z = 0.9, and no bar reaches 1. Press **New network** a few times: among the first twenty random networks none has any |z| above 3 (the largest is 2.3, in network 7), while every one of the first twenty regulation-like networks has z above 5 for the feed-forward loop.
6. Still on the random network, look at the patterns with a mutual link. There is one mutual link in the whole network, so their counts are tiny, and a z computed from a null mean of 0.1 means little. A dash marks the patterns that never occur at all. Before trusting a z, look at the counts behind it.
`,
    it: `
1. Rete **simile a una rete di regolazione**, 200 reti randomizzate. Il feed-forward loop compare 39 volte contro 15,8 ± 3,3: z = 7,0. È l'unica barra a destra.
2. Tre barre vanno dall'altra parte: ventaglio in uscita 401 contro 424,2, ventaglio in entrata 72 contro 95,2, catena 72 contro 94,6, con z = −7,0, −7,0 e −6,5. Non sono altre tre scoperte. Le reti randomizzate conservano i collegamenti di ogni nodo, e quindi il numero di coppie di collegamenti che si incontrano in un nodo; ciascuno dei 23 feed-forward loop in più consuma un ventaglio in uscita, un ventaglio in entrata e una catena. Un fatto, quattro barre: i punteggi z di schemi diversi non sono indipendenti.
3. Porta il cursore a **1.000**. La media nulla e la deviazione standard si assestano a 15,7 ± 3,5 e z a 6,7. Più reti randomizzate rendono z più preciso; non lo fanno crescere.
4. **A livelli, come una rete alimentare.** Nessun feed-forward loop contro 14,8 ± 3,9 attesi, z = −3,8, e nessun ciclo contro 2,3; la catena è sovrarappresentata, 461 contro 439,2, z = 3,7, ma è di nuovo lo stesso fatto, come al punto 2: ogni feed-forward loop che manca lascia aperta una catena e ogni ciclo che manca tre, e 14,8 + 3 × 2,3 ≈ 21,8. Anche uno schema che manca è un'informazione.
5. **Casuale.** Il feed-forward loop compare 6 volte contro 4,1 ± 2,1, z = 0,9, e nessuna barra arriva a 1. Premi **Nuova rete** qualche volta: tra le prime venti reti casuali nessuna ha un |z| sopra 3 (il più grande è 2,3, nella rete 7), mentre ognuna delle prime venti reti simili a una rete di regolazione ha z sopra 5 per il feed-forward loop.
6. Sempre nella rete casuale, guarda gli schemi con un collegamento reciproco. In tutta la rete c'è un solo collegamento reciproco, quindi i loro conteggi sono minuscoli, e uno z calcolato su una media nulla di 0,1 significa poco. Un trattino segna gli schemi che non compaiono mai. Prima di fidarti di uno z, guarda i conteggi che ci stanno dietro.
`,
  },
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: 'Seven people and nine links: a–b, a–c, b–c, b–d, c–d, d–e, e–f, e–g, f–g. What is the neighbourhood overlap of b–c, of a–b and of d–e? Which link is a bridge?',
      it: 'Sette persone e nove collegamenti: a–b, a–c, b–c, b–d, c–d, d–e, e–f, e–g, f–g. Quanto vale la sovrapposizione dei vicinati di b–c, di a–b e di d–e? Quale collegamento è un ponte?',
    },
    solution: {
      en: 'b–c: apart from each other, b has neighbours a and d, and c has neighbours a and d. They share both, and there is nobody else: 2/2 = 1. a–b: a has only c; b has c and d. They share c, out of c and d: 1/2 = 0.5. d–e: d has b and c, e has f and g. Nothing in common, out of four: 0. The link d–e is a local bridge, and also a bridge: remove it and {a, b, c, d} and {e, f, g} are separate pieces. It is the only one; every other link lies on a triangle (e–f and e–g have overlap 0.5, f–g has 1). The link with the lowest overlap is the one that holds the network together.',
      it: "b–c: a parte l'uno l'altro, b ha come vicini a e d, e c ha come vicini a e d. Li condividono entrambi, e non c'è nessun altro: 2/2 = 1. a–b: a ha solo c; b ha c e d. Condividono c, su c e d: 1/2 = 0,5. d–e: d ha b e c, e ha f e g. Nulla in comune, su quattro: 0. Il collegamento d–e è un ponte locale, e anche un ponte: togliendolo, {a, b, c, d} ed {e, f, g} sono pezzi separati. È l'unico; ogni altro collegamento sta su un triangolo (e–f ed e–g hanno sovrapposizione 0,5, f–g ha 1). Il collegamento con la sovrapposizione più bassa è quello che tiene insieme la rete.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'A has strong ties to B and to C, and a weak tie to D. Assume that two strong ties from the same person always come with a tie (strong or weak) between the other two. Show that a local bridge at A cannot be a strong tie.',
      it: "A ha legami forti con B e con C, e un legame debole con D. Supponi che due legami forti della stessa persona siano sempre accompagnati da un legame (forte o debole) tra le altre due. Dimostra che un ponte locale che parte da A non può essere un legame forte.",
    },
    solution: {
      en: 'Suppose a strong tie of A were a local bridge: say A–B. A has another strong tie, A–C. By the assumption, two strong ties from A force a tie between B and C. Then C is a neighbour of both A and B, so A and B have a neighbour in common, and A–B is not a local bridge: a contradiction. The same holds for A–C, with B in the place of C. So if A has a local bridge at all, it can only be the weak tie A–D. And A–D can be one: nothing forces a tie between D and B or C, because A–D is not strong. The argument needs A to have at least two strong ties; a person with a single strong tie escapes it.',
      it: "Supponiamo che un legame forte di A sia un ponte locale: per esempio A–B. A ha un altro legame forte, A–C. Per l'ipotesi, due legami forti di A impongono un legame tra B e C. Allora C è vicino sia di A sia di B, quindi A e B hanno un vicino in comune, e A–B non è un ponte locale: contraddizione. Lo stesso vale per A–C, con B al posto di C. Quindi, se A ha un ponte locale, può essere solo il legame debole A–D. E A–D può esserlo: nulla impone un legame tra D e B o C, perché A–D non è forte. L'argomento richiede che A abbia almeno due legami forti; una persona con un solo legame forte gli sfugge.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'A hub linked to four leaves, and no other link: what is the transitivity? Now link leaf 1 to leaf 2 and leaf 3 to leaf 4: what are the transitivity and the average clustering?',
      it: 'Un hub collegato a quattro foglie, e nessun altro collegamento: quanto vale la transitività? Ora collega la foglia 1 alla foglia 2 e la foglia 3 alla foglia 4: quanto valgono la transitività e il clustering medio?',
    },
    solution: {
      en: 'The star has no triangle, so its transitivity is 0 (it has 4 × 3/2 = 6 connected triples, all centred on the hub, all open). With the two new links there are 2 triangles. Connected triples: the hub still has 6; each leaf now has two neighbours, hence one triple: 6 + 4 = 10. Transitivity = 3 × 2/10 = 0.6. Clustering: each leaf has two neighbours, linked to each other: 1. The hub has six pairs of neighbours, two of them linked: 2/6 = 1/3. Average = (4 × 1 + 1/3)/5 = 0.867. The two numbers differ for the reason seen in module 01: the average gives the four leaves four votes out of five, the transitivity gives the hub six triples out of ten.',
      it: "La stella non ha triangoli, quindi la sua transitività è 0 (ha 4 × 3/2 = 6 triple connesse, tutte centrate sull'hub, tutte aperte). Con i due nuovi collegamenti i triangoli sono 2. Triple connesse: l'hub ne ha ancora 6; ogni foglia ha ora due vicini, quindi una tripla: 6 + 4 = 10. Transitività = 3 × 2/10 = 0,6. Clustering: ogni foglia ha due vicini, collegati tra loro: 1. L'hub ha sei coppie di vicini, due delle quali collegate: 2/6 = 1/3. Media = (4 × 1 + 1/3)/5 = 0,867. I due numeri differiscono per la ragione vista nel modulo 01: la media dà alle quattro foglie quattro voti su cinque, la transitività dà all'hub sei triple su dieci.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Four nodes and five directed links: X → Y, Y → Z, X → Z, Z → W, W → X. Which three-node patterns occur, and how many times each?',
      it: 'Quattro nodi e cinque collegamenti orientati: X → Y, Y → Z, X → Z, Z → W, W → X. Quali schemi di tre nodi compaiono, e quante volte ciascuno?',
    },
    solution: {
      en: 'Four nodes give four sets of three. {X, Y, Z}: X → Y, Y → Z, X → Z, a feed-forward loop. {X, Z, W}: X → Z, Z → W, W → X, a three-node cycle. {X, Y, W}: W → X and X → Y, with no link between W and Y: a chain. {Y, Z, W}: Y → Z and Z → W, with no link between Y and W: a chain. So one feed-forward loop, one cycle and two chains. Note what is not counted: X → Y → Z is not a chain, because X and Z are linked too. A set of three nodes is counted once, under the pattern formed by all the links among them.',
      it: 'Quattro nodi danno quattro terne. {X, Y, Z}: X → Y, Y → Z, X → Z, un feed-forward loop. {X, Z, W}: X → Z, Z → W, W → X, un ciclo di tre nodi. {X, Y, W}: W → X e X → Y, senza collegamento tra W e Y: una catena. {Y, Z, W}: Y → Z e Z → W, senza collegamento tra Y e W: una catena. Quindi un feed-forward loop, un ciclo e due catene. Nota che cosa non si conta: X → Y → Z non è una catena, perché anche X e Z sono collegati. Una terna di nodi si conta una volta sola, secondo lo schema formato da tutti i collegamenti tra i tre.',
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "Weak ties hold it together", with the switch on: at what fraction removed does the network break with weakest first, and with strongest first? What changes when you turn "Strength follows overlap" off?',
      it: 'In «I legami deboli tengono insieme», con l\'interruttore su sì: a quale quota rimossa la rete si rompe con «prima i più deboli», e con «prima i più forti»? Che cosa cambia mettendo «La forza segue la sovrapposizione» su no?',
    },
    solution: {
      en: 'Switch on, weakest first: the largest piece is still nearly the whole network at f = 0.04 (0.974), falls below one half at f = 0.06 (0.413) and is down to 0.129, little more than one group out of eight, at f = 0.1. The break comes when the links between groups are gone, and they are about 6% of the links. Strongest first: 0.996 at f = 0.5, 0.848 at 0.8, and below one half only at f = 0.90; there is no break, only nodes that drop off one by one. Switch off: the two orders become indistinguishable from each other and from random removal. Both are at 0.999 at f = 0.5 and at 0.812 and 0.823 at f = 0.8 (random removal 0.822), and fall below one half at f = 0.85 and 0.86; the two curves are never more than 0.026 apart. That gap is what is left of chance in an average over 300 networks: ten other sets of 300 networks give between 0.010 and 0.022. Lowest overlap first, however, still breaks the network at f = 0.06 (0.229). So the weak ties are not fragile points because they are weak. They are the links between groups, and in a network where strength follows overlap the two things go together.',
      it: "Interruttore su sì, prima i più deboli: il pezzo più grande è ancora quasi tutta la rete con f = 0,04 (0,974), scende sotto la metà con f = 0,06 (0,413) e si riduce a 0,129, poco più di un gruppo su otto, con f = 0,1. La rottura arriva quando i collegamenti tra i gruppi sono spariti, e sono circa il 6% dei collegamenti. Prima i più forti: 0,996 con f = 0,5, 0,848 con 0,8, e sotto la metà solo con f = 0,90; non c'è rottura, solo nodi che si staccano uno alla volta. Interruttore su no: i due ordini diventano indistinguibili tra loro e dalla rimozione a caso. Entrambi valgono 0,999 con f = 0,5 e 0,812 e 0,823 con f = 0,8 (la rimozione a caso 0,822), e scendono sotto la metà con f = 0,85 e 0,86; le due curve non distano mai più di 0,026. Quella distanza è ciò che resta del caso in una media su 300 reti: altre dieci serie di 300 reti danno tra 0,010 e 0,022. «Prima la sovrapposizione più bassa», invece, rompe ancora la rete con f = 0,06 (0,229). Quindi i legami deboli non sono punti fragili perché sono deboli. Sono i collegamenti tra i gruppi, e in una rete in cui la forza segue la sovrapposizione le due cose vanno insieme.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "Motif counter", with the regulation-like network and 200 randomised networks: which pattern has the largest z, and how many times does it occur against the null mean? Then choose the random network: does any pattern have |z| above 3?',
      it: 'In «Conta-motivi», con la rete simile a una rete di regolazione e 200 reti randomizzate: quale schema ha lo z più grande, e quante volte compare rispetto alla media nulla? Poi scegli la rete casuale: qualche schema ha |z| sopra 3?',
    },
    solution: {
      en: 'The feed-forward loop: 39 occurrences against a null mean of 15.8, with a standard deviation of 3.3, so z = (39 − 15.8)/3.3 = 7.0. Fan-out, fan-in and chain have z of the same size with a minus sign (−7.0, −7.0, −6.5), but they are the same fact seen from the other side: each extra feed-forward loop is a fan-out, a fan-in and a chain that got closed. In the random network no pattern has |z| above 3; the largest is below 1 (the feed-forward loop, 6 against 4.1 ± 2.1, z = 0.9). That is what a null result looks like, and it is worth seeing once: thirteen bars, all short.',
      it: "Il feed-forward loop: 39 occorrenze contro una media nulla di 15,8, con deviazione standard 3,3, quindi z = (39 − 15,8)/3,3 = 7,0. Ventaglio in uscita, ventaglio in entrata e catena hanno z della stessa grandezza con il segno meno (−7,0, −7,0, −6,5), ma sono lo stesso fatto visto dall'altra parte: ogni feed-forward loop in più è un ventaglio in uscita, un ventaglio in entrata e una catena che sono stati chiusi. Nella rete casuale nessuno schema ha |z| sopra 3; il più grande è sotto 1 (il feed-forward loop, 6 contro 4,1 ± 2,1, z = 0,9). È così che appare un risultato nullo, e vale la pena vederlo una volta: tredici barre, tutte corte.",
    },
  },
]
