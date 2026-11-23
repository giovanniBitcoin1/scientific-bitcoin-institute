// Module 13 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/network-lab/social-contagion-network-effects.<lang>.md.
//
// Every number below is one the page shows with its default seeds;
// scripts/lab/check-network-13.mjs prints them (lines starting with INFO) and
// pins them ("quoted on the page"). Rerun it, and update these texts, if the
// presets or the seeds change.

export const observe = {
  tipping: {
    en: `
1. **A crowd**, default: mean threshold 25, standard deviation 12. Two people in this crowd have threshold 0, the next lowest threshold is 3.8, and the staircase stops at once: 2 people, where the smooth curve says 4.0. Press **200 crowds**: 0.170 of them end above 50, and the average outcome is 19.1, a number that almost no crowd shows. The histogram has two heaps, near 0 and near 100, and almost nothing between.
2. Move the standard deviation. At 10 this crowd ends at 0 and none of the 200 passes 50. At 15 it ends at 100, as the smooth curve does, and 0.850 of the 200 pass 50. The mean threshold has not moved: only how much people differ.
3. Press **Sweep the standard deviation**. The smooth curve jumps between 12 and 13, from 4.0 people to 100.0. The crowds do not jump: the share ending above 50 is 0.04 at 11, 0.17 at 12, 0.37 at 13, 0.65 at 14, 0.85 at 15 and 1.00 at 20. A hundred people are too few to follow the curve: near the jump, who happens to be in the crowd decides. Beyond the jump the outcome declines again, to 90.5 at 50: too many thresholds are now out of reach.
4. **A market**, default: price 0.16, tipping point 0.200, stable share 0.800. From z₀ = 0.25 the share climbs, 0.360, 0.556, 0.712, and settles at 0.800. Set z₀ = 0.15: it is 0.000 at the first step. Raise the price above 0.25 and no starting share survives.
5. **Bass curve**, default: adoption is fastest after 6.19 years, when 0.461 have adopted, at 0.1106 a year. Set q = 0: the rate is highest at the start and only falls. The S needs imitation.
`,
    it: `
1. **Una folla**, valori iniziali: soglia media 25, deviazione standard 12. Due persone in questa folla hanno soglia 0, la soglia successiva è 3,8, e la scala si ferma subito: 2 persone, dove la curva liscia dice 4,0. Premi **200 folle**: lo 0,170 finisce sopra 50, e l'esito medio è 19,1, un numero che quasi nessuna folla mostra. L'istogramma ha due mucchi, vicino a 0 e vicino a 100, e quasi nulla in mezzo.
2. Sposta la deviazione standard. A 10 questa folla finisce a 0 e nessuna delle 200 supera 50. A 15 finisce a 100, come la curva liscia, e lo 0,850 delle 200 supera 50. La soglia media non si è mossa: solo quanto le persone differiscono.
3. Premi **Scansione della deviazione standard**. La curva liscia salta tra 12 e 13, da 4,0 persone a 100,0. Le folle non saltano: la quota che finisce sopra 50 è 0,04 a 11, 0,17 a 12, 0,37 a 13, 0,65 a 14, 0,85 a 15 e 1,00 a 20. Cento persone sono troppo poche per seguire la curva: vicino al salto decide chi si trova per caso nella folla. Oltre il salto l'esito scende di nuovo, fino a 90,5 a 50: ormai troppe soglie sono fuori portata.
4. **Un mercato**, valori iniziali: prezzo 0,16, punto di svolta 0,200, quota stabile 0,800. Da z₀ = 0,25 la quota sale, 0,360, 0,556, 0,712, e si assesta a 0,800. Poni z₀ = 0,15: è 0,000 al primo passo. Alza il prezzo sopra 0,25 e nessuna quota di partenza sopravvive.
5. **Curva di Bass**, valori iniziali: l'adozione è più rapida dopo 6,19 anni, quando ha adottato lo 0,461, a 0,1106 all'anno. Poni q = 0: il ritmo è massimo all'inizio e poi solo scende. La S ha bisogno dell'imitazione.
`,
  },
  window: {
    en: `
1. **Default**, random network, z = 4, φ = 0.18: 0.765 of the nodes are vulnerable (k ≤ 5) and the cascade condition is 1.75, above 1. Of 200 random seeds 0.875 start a global cascade, and a global cascade takes 0.979 of the nodes. The histogram has two bars and nothing between them.
2. Press **Sweep the mean degree**. Nothing up to z = 1; 0.36 at 1.25; 0.89 at 3.75; 0.72 at 5; 0.39 at 5.5; 0.18 at 5.75; 0.01 at 6. The grey lines are the window from the condition, 1.02 and 5.76. The black curve is the size of the global cascades: 0.366 at z = 1.25, 0.801 at 2, 0.979 at 4, 0.997 at 5.75. At the lower edge cascades are frequent and small, limited by what is connected; at the upper edge they are rare and take everything.
3. Set z = 6: the condition is 0.90 and still 0.010 of the seeds, 2 of 200, bring the whole network down. The condition is for a network without end; in a finite one the edge is blurred, and a rare seed finds the last patch of vulnerable nodes.
4. Back at z = 4, choose **Preferential attachment**. More nodes are vulnerable, 0.860, and yet only 0.285 of the seeds start a global cascade: the vulnerable nodes hang from hubs, the 20 largest of which have at least 57 links, and no single neighbour moves those. Now seed **one of the 20 largest hubs**: 1.000, in this network and in the random one. A hub is a good place to start and a bad place to arrive. It does not open a closed window, though: on the random network at z = 7 no hub starts anything.
5. Move φ at z = 4. At 0.10 the window runs from 1.00 to 13.66 and 0.975 of the seeds succeed. At 0.25 it runs from 1.11 to 3.86, z = 4 is just outside, and 0.020 succeed. At 0.30 there is no window at all, and no seed succeeds.
`,
    it: `
1. **Valori iniziali**, rete casuale, z = 4, φ = 0,18: lo 0,765 dei nodi è vulnerabile (k ≤ 5) e la condizione di cascata vale 1,75, sopra 1. Su 200 semi a caso lo 0,875 avvia una cascata globale, e una cascata globale prende lo 0,979 dei nodi. L'istogramma ha due barre e nulla in mezzo.
2. Premi **Scansione del grado medio**. Nulla fino a z = 1; 0,36 a 1,25; 0,89 a 3,75; 0,72 a 5; 0,39 a 5,5; 0,18 a 5,75; 0,01 a 6. Le linee grigie sono la finestra data dalla condizione, 1,02 e 5,76. La curva nera è la dimensione delle cascate globali: 0,366 con z = 1,25, 0,801 con 2, 0,979 con 4, 0,997 con 5,75. Al bordo inferiore le cascate sono frequenti e piccole, limitate da ciò che è connesso; al bordo superiore sono rare e prendono tutto.
3. Poni z = 6: la condizione vale 0,90 e ancora lo 0,010 dei semi, 2 su 200, fa cadere l'intera rete. La condizione vale per una rete senza fine; in una finita il bordo è sfumato, e un seme raro trova l'ultima chiazza di nodi vulnerabili.
4. Torna a z = 4 e scegli **Aggancio preferenziale**. I nodi vulnerabili sono di più, lo 0,860, eppure solo lo 0,285 dei semi avvia una cascata globale: i nodi vulnerabili sono appesi agli hub, i 20 più grandi dei quali hanno almeno 57 collegamenti, e un solo vicino non li smuove. Ora scegli come seme **uno dei 20 hub più grandi**: 1,000, in questa rete e in quella casuale. Un hub è un buon punto di partenza e un cattivo punto di arrivo. Non apre però una finestra chiusa: nella rete casuale con z = 7 nessun hub avvia nulla.
5. Sposta φ con z = 4. A 0,10 la finestra va da 1,00 a 13,66 e lo 0,975 dei semi riesce. A 0,25 va da 1,11 a 3,86, z = 4 è appena fuori, e riesce lo 0,020. A 0,30 non c'è alcuna finestra, e nessun seme riesce.
`,
  },
  ties: {
    en: `
1. **Long ties**, the first row of the table: on the ring (p = 0) simple contagion needs 562 steps to reach 90% of the nodes and complex contagion 749. Both are exact: 4 nodes a step on each side when one adopting neighbour is enough, 3 when two are needed.
2. Rewire one link in a thousand: simple contagion takes 91.1 steps, complex 748.4. One in a hundred: 19.4 and 685.9. The few long ties that make the world small, 29 times smaller for a disease, do almost nothing for a behaviour, because a long tie brings one adopting neighbour and two are needed.
3. Keep rewiring and complex contagion does speed up: 252.9 steps at p = 0.03, 76 at 0.1, 49.5 at 0.2. With many long ties two of them sometimes land on the same node. But the same rewiring is taking apart the triangles it travels on. At p = 0.3 it reaches 90% in 8 networks of 10; at 0.5 it reaches 0.005 of the nodes, and at 1 it reaches 0.002, little more than the seeds. Simple contagion by then needs about 4 steps.
4. **Clusters**, default: q = 0.5 and k_out = 4. A node of the second group has on average 0.286 of its links to the first, far below q, and yet the group falls in 15 networks of 20 (0.780 of its nodes on average). The curve is a step: 0.044 at k_out = 3, 0.090 at 3.5, 1.000 at 4.5. The grey line, where the average outside share reaches q, is at k_out = 10.
5. The cascade does not wait for the average node. It enters through the nodes that happen to have the most outside links, and each of them raises the share its neighbours see. The condition that protects a cluster is about every one of its nodes. Lower q to 0.4: the step is between k_out = 2 and 2.5 (the line is at 6.67). At 0.3 the group falls in 11 networks of 20 with k_out = 1 (the line is at 4.29).
`,
    it: `
1. **Legami lunghi**, la prima riga della tabella: sull'anello (p = 0) al contagio semplice servono 562 passi per raggiungere il 90% dei nodi e a quello complesso 749. Sono entrambi esatti: 4 nodi a passo per lato quando basta un vicino che ha adottato, 3 quando ne servono due.
2. Ricabla un collegamento su mille: il contagio semplice impiega 91,1 passi, quello complesso 748,4. Uno su cento: 19,4 e 685,9. I pochi legami lunghi che rendono piccolo il mondo, 29 volte più piccolo per una malattia, non fanno quasi nulla per un comportamento, perché un legame lungo porta un solo vicino che ha adottato e ne servono due.
3. Continua a ricablare e anche il contagio complesso accelera: 252,9 passi con p = 0,03, 76 con 0,1, 49,5 con 0,2. Con molti legami lunghi due di essi a volte finiscono sullo stesso nodo. Ma la stessa ricablatura sta smontando i triangoli su cui viaggia. Con p = 0,3 raggiunge il 90% in 8 reti su 10; con 0,5 raggiunge lo 0,005 dei nodi, e con 1 lo 0,002, poco più dei semi. Al contagio semplice a quel punto bastano circa 4 passi.
4. **Gruppi**, valori iniziali: q = 0,5 e k_out = 4. Un nodo del secondo gruppo ha in media lo 0,286 dei suoi collegamenti verso il primo, molto sotto q, eppure il gruppo cede in 15 reti su 20 (in media lo 0,780 dei suoi nodi). La curva è un gradino: 0,044 con k_out = 3, 0,090 con 3,5, 1,000 con 4,5. La linea grigia, dove la quota esterna media raggiunge q, è a k_out = 10.
5. La cascata non aspetta il nodo medio. Entra dai nodi che per caso hanno più collegamenti esterni, e ciascuno di essi alza la quota vista dai suoi vicini. La condizione che protegge un gruppo riguarda ognuno dei suoi nodi. Abbassa q a 0,4: il gradino è tra k_out = 2 e 2,5 (la linea è a 6,67). Con 0,3 il gruppo cede in 11 reti su 20 con k_out = 1 (la linea è a 4,29).
`,
  },
}

export const exercises = [
  {
    type: 'both',
    statement: {
      en: 'A hundred people have thresholds 0, 1, 2, … 99. How many join? And if the person with threshold 1 has threshold 2 instead? And if the person with threshold 0 stays at home? What can a reporter who sees only the outcome say about the two crowds? Then try it in the figure "The riot that almost happened".',
      it: 'Cento persone hanno soglie 0, 1, 2, … 99. Quante si uniscono? E se la persona con soglia 1 ha invece soglia 2? E se la persona con soglia 0 resta a casa? Che cosa può dire delle due folle un cronista che vede solo l\'esito? Poi prova nella figura «La rivolta mancata».',
    },
    solution: {
      en: 'All 100: the person with threshold 0 starts, and each one who joins is exactly what the next one was waiting for. With the 1 turned into a 2, the first person starts and nobody has a threshold of 1 or less: the riot is 1 person. With the instigator at home nobody moves: 0. The reporter will write of a violent crowd in the first case and of an isolated troublemaker in the second, and will be wrong to: the two crowds differ in one person, by one unit of one threshold. An outcome is a property of the whole distribution, and says nothing about what the typical member was disposed to do. In the figure, raising any single threshold by one stops the riot at that person; lowering one changes nothing.',
      it: 'Tutte e 100: la persona con soglia 0 comincia, e ciascuna che si unisce è esattamente ciò che la successiva stava aspettando. Con l\'1 trasformato in un 2, la prima persona comincia e nessuno ha una soglia di 1 o meno: la rivolta è 1 persona. Con l\'istigatore a casa nessuno si muove: 0. Il cronista scriverà di una folla violenta nel primo caso e di un facinoroso isolato nel secondo, e sbaglierà: le due folle differiscono per una persona, di una unità di una soglia. Un esito è una proprietà dell\'intera distribuzione, e non dice nulla su che cosa era disposto a fare il membro tipico. Nella figura, alzare di uno una qualsiasi soglia ferma la rivolta a quella persona; abbassarne una non cambia nulla.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Signals are right with probability q. Show that a cascade, once started, is wrong with probability (1 − q)²/(q² + (1 − q)²), and compute it for q = 0.6 and 0.7. With q = 0.6, what is the chance that no cascade has started after ten people? And that the majority of 25 people deciding independently is right? Then run the figure "Wrong together" 1,000 times.',
      it: 'I segnali sono giusti con probabilità q. Mostra che una cascata, una volta avviata, è sbagliata con probabilità (1 − q)²/(q² + (1 − q)²), e calcolala per q = 0,6 e 0,7. Con q = 0,6, qual è la probabilità che dopo dieci persone non sia partita alcuna cascata? E che la maggioranza di 25 persone che decidono in modo indipendente abbia ragione? Poi lancia 1.000 volte la figura «Sbagliare insieme».',
    },
    solution: {
      en: 'Before a cascade every choice is a signal. Take the people two at a time. A pair agrees on the right option with probability q², on the wrong one with (1 − q)², and splits with 2q(1 − q), which leaves things as they were. So the first pair that agrees decides, and it is wrong with probability (1 − q)²/(q² + (1 − q)²): 0.16/0.52 = 0.308 for q = 0.6 and 0.09/0.58 = 0.155 for q = 0.7. No cascade after ten people means five pairs that all split: 0.48⁵ = 0.025. The majority of 25 independent choices is right when at least 13 are: a binomial sum, 0.846. The cascade throws away almost all the information the group has, since after the first few people nobody\'s signal is used. In the figure, the first batch at q = 0.6 gives 316 wrong cascades in 1,000 (0.316), and the majority of the thirty signals is right 0.846 of the time (0.864 expected for thirty).',
      it: 'Prima di una cascata ogni scelta è un segnale. Prendi le persone a due a due. Una coppia concorda sull\'opzione giusta con probabilità q², su quella sbagliata con (1 − q)², e si divide con 2q(1 − q), il che lascia le cose com\'erano. Quindi decide la prima coppia che concorda, ed è sbagliata con probabilità (1 − q)²/(q² + (1 − q)²): 0,16/0,52 = 0,308 per q = 0,6 e 0,09/0,58 = 0,155 per q = 0,7. Nessuna cascata dopo dieci persone significa cinque coppie che si dividono tutte: 0,48⁵ = 0,025. La maggioranza di 25 scelte indipendenti ha ragione quando almeno 13 sono giuste: una somma binomiale, 0,846. La cascata butta via quasi tutta l\'informazione che il gruppo possiede, perché dopo le prime poche persone il segnale di nessuno viene usato. Nella figura, la prima serie con q = 0,6 dà 316 cascate sbagliate su 1.000 (0,316), e la maggioranza dei trenta segnali è giusta lo 0,846 delle volte (0,864 attesi per trenta).',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Person x in [0, 1] values a good (1 − x) z when a share z uses it, and its price is 0.16. Find the equilibria and say which are stable. What is the highest price at which the good can exist at all? The good is given away to the first 15% and then sold at 0.16: what happens? And with 25%?',
      it: 'La persona x in [0, 1] attribuisce a un bene il valore (1 − x) z quando lo usa una quota z, e il suo prezzo è 0,16. Trova gli equilibri e di\' quali sono stabili. Qual è il prezzo più alto a cui il bene può esistere? Il bene viene regalato al primo 15% e poi venduto a 0,16: che cosa succede? E con il 25%?',
    },
    solution: {
      en: 'At share z the buyers are those with (1 − x) z ≥ 0.16, that is x ≤ 1 − 0.16/z, so the share is in equilibrium when z = 1 − 0.16/z, or z (1 − z) = 0.16: z = 0.2 and z = 0.8, besides z = 0. A little above 0.2 the rule gives more buyers than there are and the share grows; a little below it gives fewer and the share shrinks: 0.2 is unstable, the tipping point. Around 0.8 the opposite happens, so 0.8 is stable, and so is 0. Since z (1 − z) is at most 1/4, above a price of 0.25 only zero is left. With 15% the good is worth at most 0.15 to anyone, less than its price: nobody pays, and the share is back to zero at the first step. With 25% the share goes 0.360, 0.556, 0.712, 0.775 and on to 0.8. The two giveaways differ by a tenth of the population and end with nothing and with four fifths of it.',
      it: 'Alla quota z comprano coloro per cui (1 − x) z ≥ 0,16, cioè x ≤ 1 − 0,16/z, quindi la quota è in equilibrio quando z = 1 − 0,16/z, ovvero z (1 − z) = 0,16: z = 0,2 e z = 0,8, oltre a z = 0. Poco sopra 0,2 la regola dà più compratori di quanti ce ne sono e la quota cresce; poco sotto ne dà meno e la quota cala: 0,2 è instabile, il punto di svolta. Attorno a 0,8 accade il contrario, quindi 0,8 è stabile, e lo è anche 0. Poiché z (1 − z) vale al massimo 1/4, sopra un prezzo di 0,25 resta solo lo zero. Con il 15% il bene vale al massimo 0,15 per chiunque, meno del suo prezzo: nessuno paga, e la quota torna a zero al primo passo. Con il 25% la quota fa 0,360, 0,556, 0,712, 0,775 e prosegue fino a 0,8. I due omaggi differiscono per un decimo della popolazione e finiscono con niente e con i quattro quinti.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Bass with p = 0.03 and q = 0.38 a year: when is adoption fastest, and what share has adopted by then? What is the share after 5 and after 10 years? And after 10 years with no imitation, q = 0?',
      it: 'Bass con p = 0,03 e q = 0,38 all\'anno: quando l\'adozione è più rapida, e quale quota ha adottato a quel punto? Qual è la quota dopo 5 e dopo 10 anni? E dopo 10 anni senza imitazione, q = 0?',
    },
    solution: {
      en: 'The solution with F(0) = 0 is F(t) = (1 − e^(−(p+q)t))/(1 + (q/p) e^(−(p+q)t)). The rate (p + qF)(1 − F) is largest where its derivative in F vanishes, q(1 − F) = p + qF, so F = 1/2 − p/(2q) = 0.46, reached at t* = ln(q/p)/(p + q) = ln(12.67)/0.41 = 6.19 years. After 5 years F = 0.331 and after 10 years 0.813: almost half of all adoption happens in those five years. With q = 0 the equation is dF/dt = p(1 − F), F = 1 − e^(−pt), and after 10 years 1 − e^(−0.3) = 0.259. Without imitation a quarter of the market in ten years; with it, four fifths.',
      it: 'La soluzione con F(0) = 0 è F(t) = (1 − e^(−(p+q)t))/(1 + (q/p) e^(−(p+q)t)). Il ritmo (p + qF)(1 − F) è massimo dove si annulla la sua derivata in F, q(1 − F) = p + qF, quindi F = 1/2 − p/(2q) = 0,46, raggiunta a t* = ln(q/p)/(p + q) = ln(12,67)/0,41 = 6,19 anni. Dopo 5 anni F = 0,331 e dopo 10 anni 0,813: quasi metà di tutta l\'adozione avviene in quei cinque anni. Con q = 0 l\'equazione è dF/dt = p(1 − F), F = 1 − e^(−pt), e dopo 10 anni 1 − e^(−0,3) = 0,259. Senza imitazione un quarto del mercato in dieci anni; con l\'imitazione, i quattro quinti.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'The new option pays a per neighbour who shares it, the old one b. (a) In a group everyone has three quarters of their links inside. How much better must the new option be to enter it? (b) With φ = 0.18, which nodes fall to a single neighbour? (c) Why can a hub be the best seed and the worst target?',
      it: 'La nuova opzione rende a per ogni vicino che la condivide, la vecchia b. (a) In un gruppo tutti hanno tre quarti dei propri collegamenti all\'interno. Di quanto deve essere migliore la nuova opzione per entrarvi? (b) Con φ = 0,18, quali nodi cedono a un solo vicino? (c) Perché un hub può essere il seme migliore e il bersaglio peggiore?',
    },
    solution: {
      en: '(a) A member sees at most one quarter of its neighbours outside. It switches when that share reaches q = b/(a + b), so the group can be entered only if q ≤ 1/4, that is a ≥ 3b: the new option must be three times as good. With more than three quarters inside, not even that is enough. (b) A node with k links sees a share 1/k when one neighbour adopts, and 1/k ≥ 0.18 means k ≤ 5: the nodes with five links or fewer (1/5 = 0.2, 1/6 = 0.167). (c) As a seed a hub shows the new option to all its neighbours at once, and many of them have few links and fall. As a target it needs a share φ of a large number: with 57 links and φ = 0.18, 11 adopting neighbours. In the second simulation a cascade starts from 0.285 of random seeds under preferential attachment and from every one of the 20 largest hubs.',
      it: '(a) Un membro vede al più un quarto dei suoi vicini all\'esterno. Cambia quando quella quota raggiunge q = b/(a + b), quindi nel gruppo si può entrare solo se q ≤ 1/4, cioè a ≥ 3b: la nuova opzione deve essere tre volte migliore. Con più di tre quarti all\'interno, non basta nemmeno questo. (b) Un nodo con k collegamenti vede una quota 1/k quando un vicino adotta, e 1/k ≥ 0,18 significa k ≤ 5: i nodi con cinque collegamenti o meno (1/5 = 0,2, 1/6 = 0,167). (c) Come seme un hub mostra la nuova opzione a tutti i suoi vicini insieme, e molti di loro hanno pochi collegamenti e cedono. Come bersaglio gli serve una quota φ di un numero grande: con 57 collegamenti e φ = 0,18, 11 vicini che hanno adottato. Nella seconda simulazione una cascata parte dallo 0,285 dei semi a caso con l\'aggancio preferenziale e da ognuno dei 20 hub più grandi.',
    },
  },
  {
    type: 'sim',
    statement: {
      en: '(a) In "Clusters and long ties", read the steps to reach 90% with simple and with complex contagion at p = 0, 0.01, 0.1 and 0.5. (b) In "The cascade window", with φ = 0.18, read the share of seeds that start a global cascade at z = 3, 5, 5.8 and 6.2.',
      it: '(a) In «Gruppi e legami lunghi», leggi i passi per raggiungere il 90% con il contagio semplice e con quello complesso per p = 0, 0,01, 0,1 e 0,5. (b) In «La finestra delle cascate», con φ = 0,18, leggi la quota di semi che avviano una cascata globale per z = 3, 5, 5,8 e 6,2.',
    },
    solution: {
      en: '(a) Simple: 562, 19.4, 6.8 and 4.1 steps. Complex: 749, 685.9 and 76, and at p = 0.5 it does not spread (0.005 of the nodes). One rewired link in a hundred makes simple contagion 29 times faster and saves complex contagion 8% of its steps; ten in a hundred make complex contagion about ten times faster; fifty stop it. Other sets of networks in the self-check give 569 to 677 steps at p = 0.01, and at p = 0.5 complex contagion did spread in 4 networks of 220: rare, not impossible. (b) 0.850, 0.720, 0.225 and 0.005. The window from the condition ends at z = 5.76, and the share does not fall to zero there: it slides from 0.72 to almost nothing between z = 5 and 6.2. Near that edge one network differs from the next: over eleven pairs of networks the self-check finds 0.10 to 0.25 at z = 5.8.',
      it: '(a) Semplice: 562, 19,4, 6,8 e 4,1 passi. Complesso: 749, 685,9 e 76, e con p = 0,5 non si diffonde (lo 0,005 dei nodi). Un collegamento ricablato su cento rende il contagio semplice 29 volte più veloce e fa risparmiare a quello complesso l\'8% dei passi; dieci su cento rendono il contagio complesso circa dieci volte più veloce; cinquanta lo fermano. Altri insiemi di reti nello script di controllo danno da 569 a 677 passi con p = 0,01, e con p = 0,5 il contagio complesso si è diffuso in 4 reti su 220: raro, non impossibile. (b) 0,850, 0,720, 0,225 e 0,005. La finestra data dalla condizione finisce a z = 5,76, e lì la quota non scende a zero: scivola da 0,72 a quasi nulla tra z = 5 e 6,2. Vicino a quel bordo una rete differisce dall\'altra: su undici coppie di reti lo script di controllo trova da 0,10 a 0,25 con z = 5,8.',
    },
  },
]
