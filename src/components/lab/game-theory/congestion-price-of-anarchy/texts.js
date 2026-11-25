// Module 08 texts outside the lecture: "What to observe" for each panel and
// the exercises. Every number is pinned by scripts/lab/check-game-theory-08.mjs
// ("quoted on the page").

export const observe = {
  parallel: {
    en: `
1. The panel opens on instance no. 1: three roads, d = 1, r = 1. At equilibrium road 2 is empty and the flows are (0.7814, 0, 0.2186), cost 0.4928; the optimum is (0.6942, 0, 0.3058), cost 0.4806. The ratio is 1.0253, and the equilibrium's 0.4928 is far below the 1.6170 the optimum would cost with demand 2.
2. Press **Pigou**: the ratio is 1.3333, exactly the bound for d = 1. Raise d to 4: 2.1505, again the bound. Nothing in the panel goes above it.
3. Back to random roads with d = 1, press **1,000 instances**: the mean ratio is 1.036, the largest 1.289, and 0.27 of the instances are above 1.05. The doubled-demand check held in every instance.
4. With d = **4** the same press gives a mean of 1.245, a largest ratio of 2.110 (the bound is 2.151) and 0.72 above 1.05: steeper costs, more to lose.
5. Keep d = 4 and move r. At r = **0.1** the mean is 1.000: with light traffic everyone takes the cheapest road and so would the planner. At r = **5** the mean is 1.007, the largest 1.382, and only 0.02 are above 1.05. The losses come at the demands in between.
6. With n = **10** and d = 1 the mean is 1.046, the largest 1.212: more roads, a little more to lose on average, never more than 4/3.
`,
    it: `
1. Il pannello si apre sull'istanza n. 1: tre strade, d = 1, r = 1. In equilibrio la strada 2 è vuota e i flussi sono (0,7814; 0; 0,2186), costo 0,4928; l'ottimo è (0,6942; 0; 0,3058), costo 0,4806. Il rapporto è 1,0253, e lo 0,4928 dell'equilibrio è molto sotto l'1,6170 che costerebbe l'ottimo con domanda 2.
2. Premi **Pigou**: il rapporto è 1,3333, esattamente il limite per d = 1. Porta d a 4: 2,1505, di nuovo il limite. Nel pannello niente va oltre.
3. Torna alle strade casuali con d = 1 e premi **1.000 istanze**: il rapporto medio è 1,036, il più grande 1,289, e lo 0,27 delle istanze supera 1,05. La verifica con domanda doppia vale in ogni istanza.
4. Con d = **4** lo stesso tasto dà una media di 1,245, un rapporto massimo di 2,110 (il limite è 2,151) e lo 0,72 sopra 1,05: costi più ripidi, più da perdere.
5. Tieni d = 4 e muovi r. Con r = **0,1** la media è 1,000: con poco traffico tutti prendono la strada più economica, e lo farebbe anche il pianificatore. Con r = **5** la media è 1,007, il massimo 1,382, e solo lo 0,02 supera 1,05. Le perdite stanno nelle domande intermedie.
6. Con n = **10** e d = 1 la media è 1,046, il massimo 1,212: più strade, un po' più da perdere in media, mai più di 4/3.
`,
  },
  atomic: {
    en: `
1. The panel opens on Braess's network with 10 drivers, a costless shortcut, everyone on the upper route. Press **To the end**: nine switches, driver 1 to the lower route with a gain of 0.9000, then drivers 2 to 9 to the zigzag, with gains from 0.8000 down to 0.1000. Each gain is the drop of Φ beside it; Φ falls from 15.5000 to 11.0000, and the state ends at 1, 1, 8, at 1.8200 per driver.
2. The readouts list the planner's optimum, 1.5000 at (5, 5, 0), the best equilibrium, 1.8200 at (1, 1, 8), and the worst, 2.0000 at (0, 0, 10): a price of anarchy of 1.3333 and of stability of 1.2133.
3. Set c = **0.25**: seven switches reach (3, 3, 4) at 1.6800, the only equilibrium, so both prices are 1.1200. At c = **0.5** the shortcut is not used: 1.5000.
4. Close the shortcut: five switches reach (5, 5, 0), and every driver needs 1.5000.
5. Set n = **40** with a costless shortcut: 39 switches reach (1, 1, 38) at 1.9512; the price of stability is 1.3008. The more drivers, the closer the best equilibrium comes to the 2 hours of the drop-sized drivers.
6. Choose **Four drivers**. From **all detours** nothing moves: the cost is 10.0000 against the optimum's 4.0000, a price of anarchy of 2.5000, the worst case for affine costs. From the **random** start no. 1 (drivers 1, 3, 4 on detours, total 11.0000) three switches lead to all direct, at 4.0000.
`,
    it: `
1. Il pannello si apre sulla rete di Braess con 10 automobilisti, una scorciatoia senza costo, tutti sul percorso in alto. Premi **Fino alla fine**: nove cambi, l'automobilista 1 sul percorso in basso con un guadagno di 0,9000, poi gli automobilisti da 2 a 9 sullo zigzag, con guadagni da 0,8000 giù fino a 0,1000. Ogni guadagno è il calo di Φ accanto; Φ scende da 15,5000 a 11,0000, e lo stato finisce in 1, 1, 8, a 1,8200 per automobilista.
2. I riquadri danno l'ottimo del pianificatore, 1,5000 in (5, 5, 0), l'equilibrio migliore, 1,8200 in (1, 1, 8), e il peggiore, 2,0000 in (0, 0, 10): un prezzo dell'anarchia di 1,3333 e della stabilità di 1,2133.
3. Porta c a **0,25**: sette cambi arrivano a (3, 3, 4) a 1,6800, l'unico equilibrio, quindi i due prezzi valgono 1,1200. Con c = **0,5** la scorciatoia non si usa: 1,5000.
4. Chiudi la scorciatoia: cinque cambi arrivano a (5, 5, 0), e ognuno impiega 1,5000.
5. Porta n a **40** con la scorciatoia senza costo: 39 cambi arrivano a (1, 1, 38) a 1,9512; il prezzo della stabilità è 1,3008. Più automobilisti ci sono, più l'equilibrio migliore si avvicina alle 2 ore degli automobilisti grandi come gocce.
6. Scegli **Quattro automobilisti**. Da **tutti in deviazione** nessuno si muove: il costo è 10,0000 contro il 4,0000 dell'ottimo, un prezzo dell'anarchia di 2,5000, il caso peggiore per costi affini. Dalla partenza **casuale** n. 1 (gli automobilisti 1, 3, 4 in deviazione, totale 11,0000) tre cambi portano a tutti diretti, a 4,0000.
`,
  },
  sharing: {
    en: `
1. The panel opens on the hub with k = 10 and ε = 0.1, everyone at the hub, at the optimum's cost 1.1000. Press **To the end**: ten switches, players 10, 9, ..., 1 in this order; the first gain is 0.0100 (0.1100 at the hub against 0.1000 alone). Φ falls from 3.2219 to 2.9290, and the state ends with everyone on his own road at H_10 = 2.9290: a ratio of 2.6627, for the only equilibrium.
2. Set ε = **0.01**: the same ten switches, and the ratio rises to 2.9000, close to H_10 = 2.9290.
3. Set ε back to 0.1 and k = **20**: the turn order makes players 19, 20, 17, 18, 15, 16, 13, 14, 11, 12 leave in pairs, then 10 down to 1; the ratio is 3.2707.
4. With k = 10 and ε = **0.5** the order is 7, 8, 9, 10, 5, 6, 3, 4, 2, 1 and the ratio 1.9526: a dearer hub is a smaller loss.
5. Choose **Two roads**, k = 10, ε = 0.1. From everyone on road A nothing moves: the cost is 10.0000. The list shows exactly two equilibria, 0 on A at 1.1000 and 10 on A at 10.0000: the worst costs 9.0909 times the optimum, the best 1.0000.
`,
    it: `
1. Il pannello si apre sull'hub con k = 10 ed ε = 0,1, tutti all'hub, al costo dell'ottimo 1,1000. Premi **Fino alla fine**: dieci cambi, i giocatori 10, 9, ..., 1 in quest'ordine; il primo guadagno è 0,0100 (0,1100 all'hub contro 0,1000 da solo). Φ scende da 3,2219 a 2,9290, e lo stato finisce con tutti sulla propria strada a H_10 = 2,9290: un rapporto di 2,6627, per l'unico equilibrio.
2. Porta ε a **0,01**: gli stessi dieci cambi, e il rapporto sale a 2,9000, vicino a H_10 = 2,9290.
3. Riporta ε a 0,1 e k a **20**: l'ordine dei turni fa uscire i giocatori 19, 20, 17, 18, 15, 16, 13, 14, 11, 12 a coppie, poi da 10 giù fino a 1; il rapporto è 3,2707.
4. Con k = 10 ed ε = **0,5** l'ordine è 7, 8, 9, 10, 5, 6, 3, 4, 2, 1 e il rapporto 1,9526: un hub più caro è una perdita minore.
5. Scegli **Due strade**, k = 10, ε = 0,1. Da tutti sulla strada A nessuno si muove: il costo è 10,0000. L'elenco mostra esattamente due equilibri, 0 su A a 1,1000 e 10 su A a 10,0000: il peggiore costa 9,0909 volte l'ottimo, il migliore 1,0000.
`,
  },
}

export const exercises = [
  {
    type: 'both',
    statement: {
      en: 'Pigou\'s example with the lower road taking x² hours. Find the planner\'s share on the lower road, the average cost, the price of anarchy and the toll that brings the drivers there. Then check it in Figure F1.',
      it: 'L\'esempio di Pigou con la strada in basso che richiede x² ore. Trova la quota del pianificatore sulla strada in basso, il costo medio, il prezzo dell\'anarchia e il pedaggio che porta lì gli automobilisti. Poi verificalo nella Figura F1.',
    },
    solution: {
      en: 'The average cost is x³ + 1 − x; its derivative 3x² − 1 vanishes at x* = 1/√3 = 0.577. The cost is x*³ + 1 − x* = 1 − 2/(3√3) = 0.615, and since selfish drivers pay 1, the price of anarchy is 1/0.615 = 1.626. The toll x·c\'(x) = 2x² is 2/3 at the optimum: time plus toll 1/3 + 2/3 = 1, the cost of the upper road.',
      it: 'Il costo medio è x³ + 1 − x; la sua derivata 3x² − 1 si annulla in x* = 1/√3 = 0,577. Il costo è x*³ + 1 − x* = 1 − 2/(3√3) = 0,615, e poiché gli egoisti pagano 1, il prezzo dell\'anarchia è 1/0,615 = 1,626. Il pedaggio x·c\'(x) = 2x² vale 2/3 nell\'ottimo: tempo più pedaggio 1/3 + 2/3 = 1, il costo della strada in alto.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Braess\'s network with a shortcut costing c. Show that for c < 1/2 the equilibrium sends 1 − 2c on the zigzag and costs 2 − c. Give the shares and the cost at c = 0.25. Then check it in Figure F2.',
      it: 'La rete di Braess con una scorciatoia che costa c. Mostra che per c < 1/2 l\'equilibrio manda 1 − 2c sullo zigzag e costa 2 − c. Dai le quote e il costo per c = 0,25. Poi verificalo nella Figura F2.',
    },
    solution: {
      en: 'By symmetry let u = l and z = 1 − 2u. The x roads carry u + z = 1 − u, so the upper route costs (1 − u) + 1 = 2 − u and the zigzag (1 − u) + c + (1 − u) = 2 − 2u + c. Equal costs give u = c, hence z = 1 − 2c ≥ 0 when c ≤ 1/2, and every route costs 2 − c. At c = 0.25: upper 0.25, lower 0.25, zigzag 0.5, each route 1.75.',
      it: 'Per simmetria sia u = l e z = 1 − 2u. Le strade x portano u + z = 1 − u, quindi il percorso in alto costa (1 − u) + 1 = 2 − u e lo zigzag (1 − u) + c + (1 − u) = 2 − 2u + c. Costi uguali danno u = c, quindi z = 1 − 2c ≥ 0 quando c ≤ 1/2, e ogni percorso costa 2 − c. Per c = 0,25: in alto 0,25, in basso 0,25, zigzag 0,5, ogni percorso 1,75.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Two parallel roads, x and 0.5 + x, demand 1. Find the equilibrium, the optimum, the price of anarchy and the tolls that make the equilibrium optimal. Then check it in Panel A (n = 2, d = 1).',
      it: 'Due strade parallele, x e 0,5 + x, domanda 1. Trova l\'equilibrio, l\'ottimo, il prezzo dell\'anarchia e i pedaggi che rendono ottimo l\'equilibrio. Poi verificalo nel Pannello A (n = 2, d = 1).',
    },
    solution: {
      en: 'Equilibrium: x = 0.5 + (1 − x) gives x = 0.75, so (0.75, 0.25), both roads at 0.75, cost 0.75. Optimum: equal marginal costs, 2x = 0.5 + 2(1 − x), give x = 0.625, so (0.625, 0.375), cost 0.625² + 0.375 × 0.875 = 0.71875. The price of anarchy is 0.75/0.71875 = 1.0435. The tolls x·c\'(x) at the optimum are 0.625 and 0.375: the first road then costs 0.625 + 0.625 = 1.25, the second 0.875 + 0.375 = 1.25, so the optimum is an equilibrium.',
      it: 'Equilibrio: x = 0,5 + (1 − x) dà x = 0,75, quindi (0,75; 0,25), entrambe le strade a 0,75, costo 0,75. Ottimo: costi marginali uguali, 2x = 0,5 + 2(1 − x), danno x = 0,625, quindi (0,625; 0,375), costo 0,625² + 0,375 × 0,875 = 0,71875. Il prezzo dell\'anarchia è 0,75/0,71875 = 1,0435. I pedaggi x·c\'(x) nell\'ottimo sono 0,625 e 0,375: la prima strada costa allora 0,625 + 0,625 = 1,25, la seconda 0,875 + 0,375 = 1,25, quindi l\'ottimo è un equilibrio.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Ten drivers on Braess\'s network, costless shortcut. Check that 1, 1 and 8 drivers on the upper, lower and zigzag routes is an equilibrium and compute everyone\'s cost. Compute Φ for everyone on the upper route and for the final state. Then check it in Panel B.',
      it: 'Dieci automobilisti sulla rete di Braess, scorciatoia senza costo. Verifica che 1, 1 e 8 automobilisti sui percorsi in alto, in basso e a zigzag sono un equilibrio e calcola il costo di ciascuno. Calcola Φ con tutti sul percorso in alto e nello stato finale. Poi verificalo nel Pannello B.',
    },
    solution: {
      en: 'The roads s → v and w → t carry 9 drivers each, so they cost 0.9. Upper: 0.9 + 1 = 1.9; lower: 1.9; zigzag: 0.9 + 0 + 0.9 = 1.8. The average is (1.9 + 1.9 + 8 × 1.8)/10 = 1.82. The upper driver would pay 1 + 1.0 = 2 on the lower route and 0.9 + 1.0 = 1.9 on the zigzag: no gain; a zigzag driver would pay 1.9 on either other route: no gain. Φ with everyone on the upper route: (1 + 2 + ... + 10)/10 + 10 = 5.5 + 10 = 15.5. In the final state: 4.5 + 1 + 1 + 4.5 = 11. The drop, 4.5, is the sum of the nine gains, 0.9 + 0.8 + ... + 0.1.',
      it: 'Le strade s → v e w → t portano 9 automobilisti ciascuna, quindi costano 0,9. In alto: 0,9 + 1 = 1,9; in basso: 1,9; zigzag: 0,9 + 0 + 0,9 = 1,8. La media è (1,9 + 1,9 + 8 × 1,8)/10 = 1,82. Chi è in alto pagherebbe 1 + 1,0 = 2 in basso e 0,9 + 1,0 = 1,9 sullo zigzag: nessun guadagno; chi è sullo zigzag pagherebbe 1,9 su ciascuno degli altri percorsi: nessun guadagno. Φ con tutti in alto: (1 + 2 + ... + 10)/10 + 10 = 5,5 + 10 = 15,5. Nello stato finale: 4,5 + 1 + 1 + 4,5 = 11. Il calo, 4,5, è la somma dei nove guadagni, 0,9 + 0,8 + ... + 0,1.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'The hub with k = 4 and ε = 0.1, everyone at the hub. Who leaves the hub first, and in which order do the others follow? What does the equilibrium cost against the optimum? Then check it in Panel C.',
      it: 'L\'hub con k = 4 ed ε = 0,1, tutti all\'hub. Chi lascia l\'hub per primo, e in che ordine seguono gli altri? Quanto costa l\'equilibrio rispetto all\'ottimo? Poi verificalo nel Pannello C.',
    },
    solution: {
      en: 'At the hub each pays 1.1/4 = 0.275; only player 4, whose own road costs 0.25, gains by leaving. Then each of the three pays 1.1/3 ≈ 0.367 and player 3 (1/3 ≈ 0.333) leaves; then 1.1/2 = 0.55 and player 2 (0.5) leaves; then 1.1 alone and player 1 (1) leaves. The order is 4, 3, 2, 1. The equilibrium costs H_4 = 25/12 ≈ 2.083 against the optimum 1.1, a ratio of 1.894.',
      it: 'All\'hub ognuno paga 1,1/4 = 0,275; solo il giocatore 4, la cui strada costa 0,25, guadagna andandosene. Poi ciascuno dei tre paga 1,1/3 ≈ 0,367 e se ne va il giocatore 3 (1/3 ≈ 0,333); poi 1,1/2 = 0,55 e se ne va il giocatore 2 (0,5); poi 1,1 da solo e se ne va il giocatore 1 (1). L\'ordine è 4, 3, 2, 1. L\'equilibrio costa H_4 = 25/12 ≈ 2,083 contro l\'ottimo 1,1, un rapporto di 1,894.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'The four drivers of Panel B: roads e1 to e4 cost the number of their users, z1 and z2 nothing; driver i takes e_i alone or a detour (driver 1 e2 and e3, driver 2 e1 and e4, driver 3 e1 and z1, driver 4 e2 and z2). Show that all direct (cost 4) and all detours (cost 10) are both equilibria. Then check it in Panel B.',
      it: 'I quattro automobilisti del Pannello B: le strade da e1 a e4 costano il numero dei loro utenti, z1 e z2 nulla; l\'automobilista i prende e_i da solo o una deviazione (l\'1 e2 ed e3, il 2 e1 ed e4, il 3 e1 e z1, il 4 e2 e z2). Mostra che tutti diretti (costo 4) e tutti in deviazione (costo 10) sono entrambi equilibri. Poi verificalo nel Pannello B.',
    },
    solution: {
      en: 'All direct: each pays 1; a detour would put him on two roads used by one other driver each (drivers 1 and 2: 2 + 2 = 4) or on one such road (drivers 3 and 4: 2): no gain. All detours: e1 and e2 have two users, e3 and e4 one. Driver 1 pays 2 + 1 = 3 and would pay 3 on e1, where he would join drivers 2 and 3; driver 2 likewise 3 and 3; driver 3 pays 2 and would pay 2 on e3, joining driver 1; driver 4 likewise 2 and 2. Each switch leaves the switcher\'s cost unchanged (3 for drivers 1 and 2, 2 for drivers 3 and 4), so nobody gains strictly. The ratio is 10/4 = 5/2.',
      it: 'Tutti diretti: ognuno paga 1; una deviazione lo metterebbe su due strade usate da un altro ciascuna (automobilisti 1 e 2: 2 + 2 = 4) o su una sola di esse (automobilisti 3 e 4: 2): nessun guadagno. Tutti in deviazione: e1 ed e2 hanno due utenti, e3 ed e4 uno. L\'automobilista 1 paga 2 + 1 = 3 e pagherebbe 3 su e1, dove raggiungerebbe il 2 e il 3; il 2 allo stesso modo 3 e 3; il 3 paga 2 e pagherebbe 2 su e3, raggiungendo l\'1; il 4 allo stesso modo 2 e 2. Ogni cambio lascia invariato il costo di chi cambia (3 per gli automobilisti 1 e 2, 2 per il 3 e il 4), quindi nessuno guadagna strettamente. Il rapporto è 10/4 = 5/2.',
    },
  },
]
