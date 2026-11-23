// Module 10 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/network-lab/weights-flows-navigation.<lang>.md.
//
// Every number below is one the page shows with its default seeds;
// scripts/lab/check-network-10.mjs prints them (lines starting with INFO) and
// pins them ("quoted on the page"). Rerun it, and update these texts, if the
// presets or the seeds change.

export const observe = {
  weights: {
    en: `
1. **Default**, 2,000 nodes, θ = 0.5, noise 0.5: strength grows faster than degree, β = 1.45, as in the airport network. A hub's links are also its heaviest. The disparity lies above the line 1/k at every degree: 0.417 against 0.333 at k = 3, and 0.156 against 0.100 at k = 10.
2. **Shuffle the weights**: β falls to 1.01. Strength becomes proportional to degree as soon as the weights stop following the structure, although not one weight has changed.
3. **The backbone.** At α = 0.05 the filter keeps 4.6% of the links, which carry 19.5% of the weight and reach 14.1% of the nodes. Raise α to 0.2: 22.9% of the links, 51.9% of the weight, 60.1% of the nodes, and a largest component of 54.6%. With θ = 1 the weight is far more concentrated: at α = 0.05, 15.2% of the links hold 69.0% of it. With the weights shuffled the backbone at 0.05 is in pieces: its largest component holds 1.3% of the nodes.
4. **Routes.** With the default weights the cheapest route has more links than the shortest for 67.5% of the pairs (4.80 links on average against 3.71), and betweenness with and without weights agree only in part, ρ = 0.660. Set θ and the noise to 0: every weight is 1, no pair differs, ρ = 1, and the filter keeps nothing, because no link stands out.
`,
    it: `
1. **Valori iniziali**, 2.000 nodi, θ = 0,5, rumore 0,5: la forza cresce più in fretta del grado, β = 1,45, come nella rete degli aeroporti. I collegamenti di un hub sono anche i suoi più pesanti. La disparità sta sopra la retta 1/k a ogni grado: 0,417 contro 0,333 a k = 3, e 0,156 contro 0,100 a k = 10.
2. **Rimescola i pesi**: β scende a 1,01. La forza diventa proporzionale al grado appena i pesi smettono di seguire la struttura, anche se nessun peso è cambiato.
3. **La dorsale.** Con α = 0,05 il filtro tiene il 4,6% dei collegamenti, che portano il 19,5% del peso e raggiungono il 14,1% dei nodi. Alza α a 0,2: 22,9% dei collegamenti, 51,9% del peso, 60,1% dei nodi, e una componente più grande del 54,6%. Con θ = 1 il peso è molto più concentrato: con α = 0,05, il 15,2% dei collegamenti ne tiene il 69,0%. Con i pesi rimescolati la dorsale a 0,05 è in pezzi: la sua componente più grande ha l'1,3% dei nodi.
4. **Percorsi.** Con i pesi iniziali il percorso meno costoso ha più collegamenti del più corto per il 67,5% delle coppie (4,80 collegamenti in media contro 3,71), e la betweenness con e senza pesi concorda solo in parte, ρ = 0,660. Porta θ e il rumore a 0: ogni peso vale 1, nessuna coppia differisce, ρ = 1, e il filtro non tiene nulla, perché nessun collegamento spicca.
`,
  },
  payments: {
    en: `
1. **Two random nodes**, the first pair: the sender has 3,922,500 on its side of its channels. The best single route carries 827,166 and crosses 8 channels; the maximum flow is 3,922,500, all the sender has. The minimum cut is the sender's own 3 channels: the network could carry more than this node can send.
2. **Two small nodes**: the maximum flow is 945,059 and the cut is at the receiver, whose channels cannot take in more. **The two largest hubs**: 55,670,642 can flow, against 3,510,243 on the best single route, and the minimum cut has 111 channels, not all at one end.
3. **Payments.** At 1% of the sender's balance one blind route succeeds 91.6% of the time; at 5%, 60.0%; at 10%, 38.6%; at 20%, 21.0%. It falls below one half at about 7%. With every balance known the same payments succeed 100.0%, 99.4%, 95.2% and 89.4% of the time, and half still succeed at 71% of the balance. The money is there; the sender does not know where.
4. **Splitting blind helps little**: 92.2%, 60.2%, 39.0% and 22.2% at the same four amounts. The later routes are narrower and longer, every extra channel is one more unknown, and the model itself seldom advises more than one part (1.49 on average at 20%). Splitting pays when the parts are sized on what is known about each channel, which is what flow-based methods do.
5. **The model is honest.** At 20% it gives a single route 19.5% on average and 21.0% succeed: (c + 1 − a)/(c + 1) per channel is all a sender can say without knowing the balances, and it is about right.
`,
    it: `
1. **Due nodi a caso**, la prima coppia: il mittente ha 3.922.500 dal suo lato dei canali. Il miglior percorso singolo porta 827.166 e attraversa 8 canali; il flusso massimo è 3.922.500, tutto ciò che il mittente ha. Il taglio minimo sono i 3 canali del mittente stesso: la rete potrebbe portare più di quanto questo nodo può inviare.
2. **Due nodi piccoli**: il flusso massimo è 945.059 e il taglio è dal destinatario, i cui canali non possono ricevere di più. **I due hub più grandi**: possono passare 55.670.642, contro 3.510.243 sul miglior percorso singolo, e il taglio minimo ha 111 canali, non tutti a un estremo.
3. **Pagamenti.** All'1% del saldo del mittente un percorso alla cieca riesce il 91,6% delle volte; al 5%, il 60,0%; al 10%, il 38,6%; al 20%, il 21,0%. Scende sotto la metà a circa il 7%. Con tutti i saldi noti gli stessi pagamenti riescono il 100,0%, il 99,4%, il 95,2% e l'89,4% delle volte, e metà riesce ancora al 71% del saldo. I soldi ci sono; il mittente non sa dove.
4. **Dividere alla cieca aiuta poco**: 92,2%, 60,2%, 39,0% e 22,2% agli stessi quattro importi. I percorsi successivi sono più stretti e più lunghi, ogni canale in più è un'incognita in più, e il modello stesso consiglia di rado più di una parte (1,49 in media al 20%). Dividere conviene quando le parti sono dimensionate su ciò che si sa di ogni canale, che è quello che fanno i metodi basati sui flussi.
5. **Il modello è onesto.** Al 20% dà a un percorso singolo il 19,5% in media e riesce il 21,0%: (c + 1 − a)/(c + 1) per canale è tutto ciò che un mittente può dire senza conoscere i saldi, ed è più o meno giusto.
`,
  },
  navigate: {
    en: `
1. **Default**, L = 100 and α = 2: 23.6 steps on average (median 23) between nodes that are 50.6 steps apart on the grid alone. One long-range contact per node more than halves the journey, with nobody knowing more than five contacts.
2. **L = 40** shows a route: 14 steps for a distance of 20, of which 3 along long-range links, all within the first 5 steps; the last 9 are on the grid. Long jumps are useful while the target is far; near the end the message walks.
3. Press **Sweep α** at L = 100: 21.3 steps at α = 0, a minimum of 19.4 at α = 1.25, 22.8 at α = 2, and 46.9 at α = 4, where the long links are hardly longer than the local ones. At this size the best exponent is below 2. Repeat at L = 400: the minimum moves to α = 1.5.
4. Press **Sweep L**. On log axes the slopes are 0.70 for α = 0, 0.54 for α = 1.5, 0.58 for α = 2 and 0.74 for α = 2.5. Uniform shortcuts and short-sighted ones both lose ground as the lattice grows; α = 2 starts behind α = 0 (14.7 against 13.3 steps at L = 50) and is well ahead at L = 400 (45.2 against 54.9). Kleinberg's result is about these slopes, not about which curve is lowest on a lattice one can draw.
`,
    it: `
1. **Valori iniziali**, L = 100 e α = 2: 23,6 passi in media (mediana 23) tra nodi che distano 50,6 passi sulla sola griglia. Un contatto a lungo raggio per nodo più che dimezza il viaggio, senza che nessuno conosca più di cinque contatti.
2. **L = 40** mostra un percorso: 14 passi per una distanza di 20, di cui 3 lungo collegamenti a lungo raggio, tutti entro i primi 5 passi; gli ultimi 9 sono sulla griglia. I salti lunghi servono finché il bersaglio è lontano; verso la fine il messaggio cammina.
3. Premi **Scorri α** con L = 100: 21,3 passi ad α = 0, un minimo di 19,4 ad α = 1,25, 22,8 ad α = 2, e 46,9 ad α = 4, dove i collegamenti lunghi sono appena più lunghi di quelli locali. A questa dimensione l'esponente migliore è sotto 2. Ripeti con L = 400: il minimo si sposta ad α = 1,5.
4. Premi **Scorri L**. Su assi logaritmici le pendenze sono 0,70 per α = 0, 0,54 per α = 1,5, 0,58 per α = 2 e 0,74 per α = 2,5. Le scorciatoie uniformi e quelle miopi perdono entrambe terreno man mano che il reticolo cresce; α = 2 parte dietro ad α = 0 (14,7 contro 13,3 passi a L = 50) ed è ben avanti a L = 400 (45,2 contro 54,9). Il risultato di Kleinberg riguarda queste pendenze, non quale curva sia la più bassa su un reticolo che si può disegnare.
`,
  },
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: 'A node has six links with weights 5, 1, 1, 1, 1, 1. Find its strength, its degree, its disparity Y and 1/k. What is the disparity filter\'s α for the link of weight 5? Is it significant at 0.05? And a link of weight 1?',
      it: 'Un nodo ha sei collegamenti con pesi 5, 1, 1, 1, 1, 1. Trova la sua forza, il suo grado, la sua disparità Y e 1/k. Quanto vale l\'α del filtro di disparità per il collegamento di peso 5? È significativo a 0,05? E un collegamento di peso 1?',
    },
    solution: {
      en: 's = 5 + 5 · 1 = 10 and k = 6. Y = (5/10)² + 5 (1/10)² = 0.25 + 0.05 = 0.30, almost twice the 1/k = 0.167 of an even split. The heavy link is a share p = 0.5 of the strength, so α = (1 − 0.5)^5 = 0.031 < 0.05: significant, the filter keeps it. A link of weight 1 has p = 0.1 and α = 0.9^5 = 0.590: nothing unusual, unless its other end says otherwise. The figure "Strength and disparity" starts from these weights.',
      it: 's = 5 + 5 · 1 = 10 e k = 6. Y = (5/10)² + 5 (1/10)² = 0,25 + 0,05 = 0,30, quasi il doppio di 1/k = 0,167 della ripartizione uniforme. Il collegamento pesante è una quota p = 0,5 della forza, quindi α = (1 − 0,5)^5 = 0,031 < 0,05: significativo, il filtro lo tiene. Un collegamento di peso 1 ha p = 0,1 e α = 0,9^5 = 0,590: nulla di insolito, a meno che il suo altro estremo dica altrimenti. La figura «Forza e disparità» parte da questi pesi.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Five links with costs: A–B 4, A–C 1, C–B 2, B–D 1, C–D 5. Find the cheapest route from A to D and its cost. Which routes have the fewest links, and what do they cost?',
      it: 'Cinque collegamenti con i loro costi: A–B 4, A–C 1, C–B 2, B–D 1, C–D 5. Trova il percorso meno costoso da A a D e il suo costo. Quali percorsi hanno meno collegamenti, e quanto costano?',
    },
    solution: {
      en: 'Dijkstra from A: A is settled at 0; C at 1; then B at 1 + 2 = 3, cheaper than the direct link of cost 4; then D at 3 + 1 = 4, cheaper than the 1 + 5 = 6 through C. The cheapest route is A–C–B–D, cost 4, with three links. Two routes have two links: A–B–D, cost 5, and A–C–D, cost 6. The route with the fewest links is not the cheapest.',
      it: 'Dijkstra da A: A è sistemato a 0; C a 1; poi B a 1 + 2 = 3, meno del collegamento diretto di costo 4; poi D a 3 + 1 = 4, meno dell\'1 + 5 = 6 passando per C. Il percorso meno costoso è A–C–B–D, costo 4, con tre collegamenti. Due percorsi hanno due collegamenti: A–B–D, costo 5, e A–C–D, costo 6. Il percorso con meno collegamenti non è il meno costoso.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Directed links with capacities: s→a 3, s→b 2, a→b 1, a→t 2, b→t 3. Find the widest single route from s to t, the maximum flow and a minimum cut.',
      it: 'Collegamenti orientati con capacità: s→a 3, s→b 2, a→b 1, a→t 2, b→t 3. Trova il singolo percorso più largo da s a t, il flusso massimo e un taglio minimo.',
    },
    solution: {
      en: 'Single routes: s–a–t carries min(3, 2) = 2, s–b–t min(2, 3) = 2, s–a–b–t min(3, 1, 3) = 1. The widest carries 2. Together they carry more: 2 along s–a–t, 2 along s–b–t and 1 along s–a–b–t, which fills s→a (3), s→b (2), a→b (1), a→t (2) and b→t (3): a flow of 5. No more can leave s, because the cut {s→a, s→b} has capacity 3 + 2 = 5. The cut {a→t, b→t} also has capacity 5: here a minimum cut is not unique. The figure "One route or several" shows all of this.',
      it: 'Percorsi singoli: s–a–t porta min(3, 2) = 2, s–b–t min(2, 3) = 2, s–a–b–t min(3, 1, 3) = 1. Il più largo porta 2. Insieme portano di più: 2 lungo s–a–t, 2 lungo s–b–t e 1 lungo s–a–b–t, che riempie s→a (3), s→b (2), a→b (1), a→t (2) e b→t (3): un flusso di 5. Da s non può uscire di più, perché il taglio {s→a, s→b} ha capacità 3 + 2 = 5. Anche il taglio {a→t, b→t} ha capacità 5: qui il taglio minimo non è unico. La figura «Una strada o più» mostra tutto questo.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Channels of capacity c = 1,000,000 satoshi, each balance equally likely to be any whole number from 0 to c. A payment of 500,000 goes along a route of three channels: what is the probability that it succeeds? And the same amount as two parts of 250,000 on two separate routes of three channels each, or as four parts of 125,000 on four?',
      it: 'Canali di capacità c = 1.000.000 di satoshi, con ogni saldo ugualmente probabile tra tutti i numeri interi da 0 a c. Un pagamento di 500.000 percorre tre canali: qual è la probabilità che riesca? E lo stesso importo in due parti da 250.000 su due percorsi separati di tre canali ciascuno, o in quattro parti da 125.000 su quattro?',
    },
    solution: {
      en: 'A channel forwards a with probability (c + 1 − a)/(c + 1), here very nearly 1 − a/c. One route: 0.5³ = 0.125. Two parts: each route succeeds with 0.75³ = 0.422, and both with 0.422² = 0.178. Four parts: 0.875³ = 0.670 per route and 0.670⁴ = 0.201 for all four. Splitting helps, but slowly: with n parts the probability is (1 − 1/(2n))^(3n), which tends to e^(−1.5) = 0.223 however many routes there are. The gain is real only when the routes exist and are as wide as the first, and in "How much can flow?" they are not.',
      it: 'Un canale inoltra a con probabilità (c + 1 − a)/(c + 1), qui quasi esattamente 1 − a/c. Un percorso: 0,5³ = 0,125. Due parti: ogni percorso riesce con 0,75³ = 0,422, ed entrambi con 0,422² = 0,178. Quattro parti: 0,875³ = 0,670 per percorso e 0,670⁴ = 0,201 per tutti e quattro. Dividere aiuta, ma lentamente: con n parti la probabilità è (1 − 1/(2n))^(3n), che tende a e^(−1,5) = 0,223 per quanti percorsi ci siano. Il guadagno è reale solo se i percorsi esistono e sono larghi quanto il primo, e in «Quanto può passare?» non lo sono.',
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "Find your way", press Sweep α at L = 50, 100 and 200 (the means are listed under the chart). How many steps at α = 0, 1, 1.5, 2, 2.5 and 3? Where is the minimum? How does the ratio of α = 2 to α = 0 change with L?',
      it: 'In «Trova la strada», premi Scorri α con L = 50, 100 e 200 (le medie sono elencate sotto il grafico). Quanti passi ad α = 0, 1, 1,5, 2, 2,5 e 3? Dov\'è il minimo? Come cambia con L il rapporto tra α = 2 e α = 0?',
    },
    solution: {
      en: 'Means of 2,000 pairs. L = 50: 13.3, 12.5, 13.4, 14.7, 17.2, 20.0, lowest at α = 1. L = 100: 21.3, 19.5, 19.6, 22.8, 29.6, 38.2, lowest at α = 1.25. L = 200: 34.6, 28.6, 27.9, 32.7, 48.8, 70.6, lowest at α = 1.5. The curve is flat near its minimum, so the exact place moves with the lattice drawn; what is steady is the drift towards larger α. The ratio of α = 2 to α = 0 is 1.10, 1.07, 0.95: α = 2 is behind on small lattices and overtakes between L = 100 and L = 200. The self-check carries on to L = 800, where the ratio is 0.70 and α = 1.5 is still ahead of 2.',
      it: 'Medie su 2.000 coppie. L = 50: 13,3, 12,5, 13,4, 14,7, 17,2, 20,0, minimo ad α = 1. L = 100: 21,3, 19,5, 19,6, 22,8, 29,6, 38,2, minimo ad α = 1,25. L = 200: 34,6, 28,6, 27,9, 32,7, 48,8, 70,6, minimo ad α = 1,5. La curva è piatta vicino al minimo, quindi il punto esatto cambia con il reticolo estratto; ciò che è regolare è lo spostamento verso α più grandi. Il rapporto tra α = 2 e α = 0 è 1,10, 1,07, 0,95: α = 2 è dietro sui reticoli piccoli e sorpassa tra L = 100 e L = 200. Lo script di controllo prosegue fino a L = 800, dove il rapporto è 0,70 e α = 1,5 è ancora davanti a 2.',
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "How much can flow?", with 1,000 nodes, read the three curves of success against the amount. At what amount does a single route fall below one half? And the other two strategies?',
      it: 'In «Quanto può passare?», con 1.000 nodi, leggi le tre curve di successo al variare dell\'importo. A quale importo un percorso singolo scende sotto la metà? E le altre due strategie?',
    },
    solution: {
      en: 'A single route, the widest by capacity: 60.0% at 5% of the sender\'s outgoing balance and 38.6% at 10%, so it crosses one half at about 7%. Up to four routes with equal parts: 60.2% and 39.0%, the same crossing. With every balance known: 71.8% at 40%, 63.6% at 50%, 50.8% at 70% and 44.6% at 80%, crossing one half at about 71%. A tenfold gap, and none of it is a lack of funds: what the blind sender lacks is knowledge of where the balances are. At the full outgoing balance, 33.2% of the payments would still be possible.',
      it: 'Un percorso singolo, il più largo per capacità: 60,0% al 5% del saldo in uscita del mittente e 38,6% al 10%, quindi attraversa la metà a circa il 7%. Fino a quattro percorsi con parti uguali: 60,2% e 39,0%, lo stesso punto. Con tutti i saldi noti: 71,8% al 40%, 63,6% al 50%, 50,8% al 70% e 44,6% all\'80%, e attraversa la metà a circa il 71%. Un divario di dieci volte, e non per mancanza di fondi: ciò che manca al mittente alla cieca è sapere dove sono i saldi. All\'intero saldo in uscita, il 33,2% dei pagamenti sarebbe ancora possibile.',
    },
  },
]
