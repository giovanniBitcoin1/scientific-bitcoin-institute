// Module 11 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/network-lab/robustness-and-cascades.<lang>.md.
//
// Every number below is one the page shows with its default seeds;
// scripts/lab/check-network-11.mjs prints them (lines starting with INFO) and
// pins them ("quoted on the page"). Rerun it, and update these texts, if the
// presets or the seeds change.

export const observe = {
  attack: {
    en: `
1. **Default**, preferential attachment, 1,000 nodes, mean degree 4. The formula gives f_c = 0.905 and the random curve agrees: the largest component falls below 1% of N at 0.881, with R = 0.416. By the degrees of the intact network the same happens at 0.272 (R = 0.101), and with the degrees recomputed at 0.207 (R = 0.097). One network, two verdicts.
2. **Random network**: the formula gives 0.748, and the attacks hurt far less: 0.491 by initial degree (R = 0.244) and 0.325 recomputed (R = 0.204). The random curve reaches 1% only at 0.831, later than the formula says, because 1% of 1,000 is ten nodes and small pieces last; with 10,000 nodes it is 0.766.
3. Back to preferential attachment, press **Add the attack by betweenness**: recomputed before every removal it is the most damaging order, 0.158 and R = 0.082. Set f = 0.10: it leaves 0.172 of the nodes connected, where the recomputed degree leaves 0.539.
4. **Power law**, γ = 2.5: ⟨k²⟩ is 120.3, the formula gives 0.961, and the attack by recomputed degree leaves 0.150 at f = 0.10. The heavier the tail, the wider the gap between the two verdicts.
5. Preferential attachment again, press **Make it robust**. R under attack rises from 0.097 to 0.221 and the collapse moves from 0.207 to 0.368, with every degree unchanged. Spearman's ρ goes from −0.32 to 0.31, and the links between nodes whose degrees differ by at most one from 16.8% to 31.1%. The two tables show the onion. Before, no node of degree 2 is linked to another, and the hubs (21 links or more) send 36% of their links to nodes of degree 2 and 8% to one another. After, 20% of the links of the nodes of degree 2 stay among themselves, and the hubs send 13% to them and 19% to one another. The self-check also measures what was not asked for: under random removal R falls from 0.416 to 0.386.
`,
    it: `
1. **Valori iniziali**, aggancio preferenziale, 1.000 nodi, grado medio 4. La formula dà f_c = 0,905 e la curva casuale è d'accordo: la componente più grande scende sotto l'1% di N a 0,881, con R = 0,416. Con i gradi della rete intatta lo stesso accade a 0,272 (R = 0,101), e con i gradi ricalcolati a 0,207 (R = 0,097). Una rete, due verdetti.
2. **Rete casuale**: la formula dà 0,748, e gli attacchi fanno molto meno male: 0,491 per grado iniziale (R = 0,244) e 0,325 ricalcolato (R = 0,204). La curva casuale arriva all'1% solo a 0,831, più tardi di quanto dice la formula, perché l'1% di 1.000 sono dieci nodi e i pezzi piccoli durano; con 10.000 nodi è 0,766.
3. Torna all'aggancio preferenziale e premi **Aggiungi l'attacco per betweenness**: ricalcolata prima di ogni rimozione è l'ordine più dannoso, 0,158 e R = 0,082. Porta f a 0,10: lascia connessi 0,172 dei nodi, dove il grado ricalcolato ne lascia 0,539.
4. **Legge di potenza**, γ = 2,5: ⟨k²⟩ vale 120,3, la formula dà 0,961, e l'attacco per grado ricalcolato lascia 0,150 a f = 0,10. Più pesante è la coda, più larga è la distanza tra i due verdetti.
5. Di nuovo aggancio preferenziale, premi **Rendila robusta**. R sotto attacco sale da 0,097 a 0,221 e il crollo si sposta da 0,207 a 0,368, con ogni grado invariato. Il ρ di Spearman passa da −0,32 a 0,31, e i collegamenti tra nodi i cui gradi differiscono al più di uno dal 16,8% al 31,1%. Le due tabelle mostrano la cipolla. Prima, nessun nodo di grado 2 è collegato a un altro, e gli hub (21 collegamenti o più) mandano il 36% dei loro collegamenti a nodi di grado 2 e l'8% l'uno all'altro. Dopo, il 20% dei collegamenti dei nodi di grado 2 resta tra loro, e gli hub ne mandano il 13% a loro e il 19% l'uno all'altro. Lo script di controllo misura anche ciò che non era stato chiesto: sotto rimozione casuale R scende da 0,416 a 0,386.
`,
  },
  overload: {
    en: `
1. **Default**, preferential attachment, 400 nodes, α = 0.2. The most loaded node has degree 55 and a load of 25,793, against a mean of 939. Removing it starts a cascade of 2 rounds in which 161 nodes fail, and the largest component left holds 0.070 of the nodes: far more is lost than failed, because what fails is what held the rest together.
2. **Remove a random node**: on average 1.25 nodes fail, the trigger included, and G = 0.996. A margin of 20% is ample against accidents and useless against the one node that matters.
3. Press **Sweep α**. With the most loaded node removed G is 0.008 at α = 0, 0.155 at 0.3, 0.508 at 0.4, 0.758 at 0.5 and 0.993 at 1. The cascade is longest, 8 rounds, at α = 0.4, where it is neither stopped at once nor over at once. For a random node G is 0.256 at α = 0 and already 0.991 at 0.1.
4. **Random network**: no node stands out (the highest load is 3,704, the mean 1,057), and the two triggers differ much less. Removing the most loaded node leaves 0.058 at α = 0.1, after 7 rounds, and 0.930 at 0.2; a random node leaves 0.895 and 0.980, which is all the largest component of this network holds to begin with.
`,
    it: `
1. **Valori iniziali**, aggancio preferenziale, 400 nodi, α = 0,2. Il nodo più carico ha grado 55 e un carico di 25.793, contro una media di 939. Toglierlo avvia una cascata di 2 turni in cui si guastano 161 nodi, e la componente più grande rimasta ha 0,070 dei nodi: si perde molto più di ciò che si guasta, perché si guasta proprio ciò che teneva insieme il resto.
2. **Togli un nodo a caso**: in media si guastano 1,25 nodi, innesco compreso, e G = 0,996. Un margine del 20% è abbondante contro gli incidenti e inutile contro l'unico nodo che conta.
3. Premi **Scorri α**. Tolto il nodo più carico, G vale 0,008 con α = 0, 0,155 con 0,3, 0,508 con 0,4, 0,758 con 0,5 e 0,993 con 1. La cascata più lunga, 8 turni, è ad α = 0,4, dove non viene fermata subito e non finisce subito. Per un nodo a caso G vale 0,256 con α = 0 e già 0,991 con 0,1.
4. **Rete casuale**: nessun nodo spicca (il carico più alto è 3.704, la media 1.057), e i due inneschi differiscono molto meno. Togliere il nodo più carico lascia 0,058 con α = 0,1, dopo 7 turni, e 0,930 con 0,2; un nodo a caso lascia 0,895 e 0,980, che è tutto ciò che la componente più grande di questa rete contiene in partenza.
`,
  },
  coupled: {
    en: `
1. **Default**, two random networks of 10,000 nodes, mean degree 4, p = 0.70: the mutual giant component holds 0.555 of the nodes (theory 0.558) after 7 steps, while a single network would keep 0.647.
2. Lower p. At 0.65 the pair keeps 0.461; at 0.62, 0.365 after 15 steps; at 0.61, nothing, after 31 steps. The formula puts the threshold at 2.4554/4 = 0.614. The single network at 0.61 still holds 0.539 and does not notice.
3. The second chart counts the steps: a few far from the threshold on either side, and a peak of 31 at p = 0.61. Near the threshold each step removes little, so the cascade is long.
4. **Mean degree 6**: the mutual giant component appears at p = 0.41 (formula 0.409). More links help, but the jump stays.
5. **Two power-law networks**, mean degree 4.40: the mutual giant component appears only at p = 0.68, where two random networks of that mean degree would need 0.558. Alone, the same network is the more robust of the two: its largest component passes 1% at p = 0.13, against 1/⟨k⟩ = 0.227.
`,
    it: `
1. **Valori iniziali**, due reti casuali di 10.000 nodi, grado medio 4, p = 0,70: la componente gigante mutua ha 0,555 dei nodi (teoria 0,558) dopo 7 passi, mentre una rete singola ne terrebbe 0,647.
2. Abbassa p. A 0,65 la coppia tiene 0,461; a 0,62, 0,365 dopo 15 passi; a 0,61, nulla, dopo 31 passi. La formula mette la soglia a 2,4554/4 = 0,614. La rete singola a 0,61 ha ancora 0,539 e non se ne accorge.
3. Il secondo grafico conta i passi: pochi lontano dalla soglia da entrambe le parti, e un picco di 31 a p = 0,61. Vicino alla soglia ogni passo toglie poco, quindi la cascata è lunga.
4. **Grado medio 6**: la componente gigante mutua compare a p = 0,41 (formula 0,409). Più collegamenti aiutano, ma il salto resta.
5. **Due reti a legge di potenza**, grado medio 4,40: la componente gigante mutua compare solo a p = 0,68, dove a due reti casuali con quel grado medio basterebbe 0,558. Da sola, la stessa rete è la più robusta delle due: la sua componente più grande supera l'1% a p = 0,13, contro 1/⟨k⟩ = 0,227.
`,
  },
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: 'Nodes are removed at random. Find the critical fraction f_c for a random network with ⟨k⟩ = 4, and for a network with ⟨k⟩ = 4 and ⟨k²⟩ = 100.',
      it: 'I nodi sono rimossi a caso. Trova la frazione critica f_c per una rete casuale con ⟨k⟩ = 4, e per una rete con ⟨k⟩ = 4 e ⟨k²⟩ = 100.',
    },
    solution: {
      en: 'For a random network the degrees are Poisson, so ⟨k²⟩ = ⟨k⟩² + ⟨k⟩ = 20 and ⟨k²⟩/⟨k⟩ = 5: f_c = 1 − 1/(5 − 1) = 0.75, which is 1 − 1/⟨k⟩. In the second network ⟨k²⟩/⟨k⟩ = 25 and f_c = 1 − 1/24 = 0.958. The mean degree is the same; only the spread of the degrees has changed, and it moves the threshold from three quarters of the nodes to nearly all of them.',
      it: 'Per una rete casuale i gradi sono di Poisson, quindi ⟨k²⟩ = ⟨k⟩² + ⟨k⟩ = 20 e ⟨k²⟩/⟨k⟩ = 5: f_c = 1 − 1/(5 − 1) = 0,75, cioè 1 − 1/⟨k⟩. Nella seconda rete ⟨k²⟩/⟨k⟩ = 25 e f_c = 1 − 1/24 = 0,958. Il grado medio è lo stesso; è cambiata solo la dispersione dei gradi, e sposta la soglia da tre quarti dei nodi a quasi tutti.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Two random networks with ⟨k⟩ = 4 depend on each other node by node. Below which surviving fraction p does the mutual giant component vanish, and how large is it just above? Compare with a single network of the same kind.',
      it: 'Due reti casuali con ⟨k⟩ = 4 dipendono l\'una dall\'altra nodo per nodo. Sotto quale frazione sopravvissuta p scompare la componente gigante mutua, e quanto è grande appena sopra? Confronta con una rete singola dello stesso tipo.',
    },
    solution: {
      en: 'Write y = ⟨k⟩x in x = p (1 − e^(−⟨k⟩x))²: then p⟨k⟩ = y/(1 − e^(−y))², and the smallest p with a solution is at the minimum of the right-hand side, 2.4554 at y = 1.2564. So p_c = 2.4554/4 = 0.614, and there x = y/⟨k⟩ = 1.2564/4 = 0.314: the mutual giant component holds about 31% of the nodes, or nothing. A single network needs p > 1/⟨k⟩ = 0.25, and its giant component grows from zero. The pair needs almost two and a half times as many working nodes, and gives no warning in its size.',
      it: 'Poni y = ⟨k⟩x in x = p (1 − e^(−⟨k⟩x))²: allora p⟨k⟩ = y/(1 − e^(−y))², e il più piccolo p con una soluzione è al minimo del secondo membro, 2,4554 in y = 1,2564. Quindi p_c = 2,4554/4 = 0,614, e lì x = y/⟨k⟩ = 1,2564/4 = 0,314: la componente gigante mutua ha circa il 31% dei nodi, oppure nulla. A una rete singola basta p > 1/⟨k⟩ = 0,25, e la sua componente gigante cresce da zero. Alla coppia servono quasi due volte e mezza i nodi in funzione, e la sua dimensione non dà alcun preavviso.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'The robustness is R = (1/N) Σ s(Q), summed over Q = 1 … N, where s(Q) is the share of the nodes in the largest component after Q removals, highest degree first. Compute it for a star with five leaves and for a complete network of six nodes.',
      it: 'La robustezza è R = (1/N) Σ s(Q), sommata su Q = 1 … N, dove s(Q) è la quota di nodi nella componente più grande dopo Q rimozioni, dal grado più alto. Calcolala per una stella con cinque foglie e per una rete completa di sei nodi.',
    },
    solution: {
      en: 'Both have N = 6. Star: the centre goes first and leaves five separate nodes, so s(1) = 1/6; then s stays 1/6 while any leaf is left, and s(6) = 0. R = (1/6)(5 × 1/6) = 5/36 = 0.139. Complete network: whatever is left is still complete, so s = 5/6, 4/6, 3/6, 2/6, 1/6, 0 and R = (1/6)(15/6) = 15/36 = 0.417. For large N the star tends to 1/N and the complete network to 0.5, the two ends of the scale.',
      it: 'Entrambe hanno N = 6. Stella: il centro va via per primo e lascia cinque nodi separati, quindi s(1) = 1/6; poi s resta 1/6 finché c\'è una foglia, e s(6) = 0. R = (1/6)(5 × 1/6) = 5/36 = 0,139. Rete completa: ciò che resta è ancora completo, quindi s = 5/6, 4/6, 3/6, 2/6, 1/6, 0 e R = (1/6)(15/6) = 15/36 = 0,417. Per N grande la stella tende a 1/N e la rete completa a 0,5, i due estremi della scala.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'A node chooses 8 outgoing peers, and each is controlled by an attacker with probability f, independently. What is the probability that all 8 are the attacker\'s, for f = 0.5 and for f = 0.8? And with 10 peers?',
      it: 'Un nodo sceglie 8 peer in uscita, e ciascuno è controllato da un attaccante con probabilità f, in modo indipendente. Qual è la probabilità che tutti e 8 siano dell\'attaccante, per f = 0,5 e per f = 0,8? E con 10 peer?',
    },
    solution: {
      en: 'f⁸: 0.5⁸ = 0.0039 and 0.8⁸ = 0.168. With 10 peers, f¹⁰: 0.00098 and 0.107. Two more connections help a little; what matters is f. And f is not the attacker\'s share of the network: the node draws its peers from its own address tables, so f is the attacker\'s share of those tables, and addresses are cheap. That is why real eclipse attacks work on the tables, filling them and waiting for the node to restart and choose again, instead of relying on chance, and why the defences make the tables hard to fill and slow to forget good addresses.',
      it: 'f⁸: 0,5⁸ = 0,0039 e 0,8⁸ = 0,168. Con 10 peer, f¹⁰: 0,00098 e 0,107. Due connessioni in più aiutano poco; ciò che conta è f. E f non è la quota della rete in mano all\'attaccante: il nodo estrae i suoi peer dalle proprie tabelle di indirizzi, quindi f è la quota di quelle tabelle in mano all\'attaccante, e gli indirizzi costano poco. Ecco perché i veri attacchi di eclissi lavorano sulle tabelle, riempiendole e aspettando che il nodo si riavvii e scelga di nuovo, invece di affidarsi al caso, e perché le difese rendono le tabelle difficili da riempire e lente a dimenticare gli indirizzi buoni.',
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "Failures, attacks and onions", set N = 10,000 and mean degree 4. With the slider f, read the largest component at 50%, 70% and 80% removed at random, and at 1%, 5%, 10% and 20% removed by the degrees of the intact network, for the random network and for preferential attachment.',
      it: 'In «Guasti, attacchi e cipolle», poni N = 10.000 e grado medio 4. Con il cursore f, leggi la componente più grande al 50%, 70% e 80% di nodi rimossi a caso, e all\'1%, 5%, 10% e 20% rimossi secondo i gradi della rete intatta, per la rete casuale e per l\'aggancio preferenziale.',
    },
    solution: {
      en: 'Random network, at random: 0.399, 0.095, 0.004; by degree: 0.970, 0.921, 0.854, 0.687. Preferential attachment, at random: 0.389, 0.130, 0.038; by degree: 0.975, 0.835, 0.563, 0.006. At random the two are alike up to half the nodes, and beyond that the heavy-tailed network holds on longer: at 80% it still has a component about ten times as large. Under attack it is the other way round, and by a much wider margin: one fifth of the nodes is enough to destroy it, while the random network keeps two thirds of its nodes together.',
      it: 'Rete casuale, a caso: 0,399, 0,095, 0,004; per grado: 0,970, 0,921, 0,854, 0,687. Aggancio preferenziale, a caso: 0,389, 0,130, 0,038; per grado: 0,975, 0,835, 0,563, 0,006. A caso le due si somigliano fino a metà dei nodi, e oltre la rete a coda pesante resiste più a lungo: all\'80% ha ancora una componente circa dieci volte più grande. Sotto attacco è il contrario, e con un margine molto più largo: un quinto dei nodi basta a distruggerla, mentre la rete casuale tiene insieme due terzi dei suoi nodi.',
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "Coupled networks", with two random networks of 10,000 nodes and mean degree 4, read the mutual giant component at p = 0.60, 0.62, 0.65, 0.70 and 0.80. Where is the jump?',
      it: 'In «Reti accoppiate», con due reti casuali di 10.000 nodi e grado medio 4, leggi la componente gigante mutua a p = 0,60, 0,62, 0,65, 0,70 e 0,80. Dov\'è il salto?',
    },
    solution: {
      en: '0.000, 0.365, 0.461, 0.555 and 0.707; the theory gives 0, 0.369, 0.460, 0.558 and 0.709. The jump is between 0.61 and 0.62, where the formula puts it (0.614): from nothing to more than a third of the nodes. Just above the threshold the value depends on the networks drawn: ten other pairs in the self-check give between 0.362 and 0.393 at p = 0.62. Further up they all agree with the theory to within 0.015.',
      it: '0,000, 0,365, 0,461, 0,555 e 0,707; la teoria dà 0, 0,369, 0,460, 0,558 e 0,709. Il salto è tra 0,61 e 0,62, dove lo mette la formula (0,614): dal nulla a più di un terzo dei nodi. Appena sopra la soglia il valore dipende dalle reti estratte: altre dieci coppie nello script di controllo danno tra 0,362 e 0,393 a p = 0,62. Più in alto concordano tutte con la teoria entro 0,015.',
    },
  },
]
