// Module 05 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/game-theory-lab/incomplete-information-signalling.<lang>.md.
// Every number quoted here is pinned by scripts/lab/check-game-theory-05.mjs.

export const observe = {
  lemons: {
    en: `
1. Press **Run** at the defaults (q_min = 0.2, b = 1.5, 10,000 cars, sample no. 1). The price falls from 0.898 (0.9 in the exact model) round after round and stops at 0.594 after 27 rounds; 0.493 of the cars are traded and 0.326 of the gains are made, against 0.6, 1/2 and 1/3 in the exact model. The sample keeps going after the exact path is within 0.001 of its end (round 20): it stops only when not a single car leaves.
2. Set **q_min = 0**: the price slides down to 0.001 and only 8 of the 10,000 cars are sold, although every one of them is worth half as much again to a buyer. Set **q_min = 0.4**: now the first price, 1.048, is above every quality, nobody withdraws, and the whole market trades in one round.
3. Back at q_min = 0.2, move **b** up: at 1.65 the price still unravels, slowly (32 rounds, 0.904 of the cars); at 1.70, above 5/3, the whole market trades at once.
4. With **N = 1,000** the end of a sample is much less certain: sample no. 1 stops at 0.580 after 16 rounds. Over seeds 1 to 10, 10,000 cars end between 0.576 and 0.617, 1,000 cars between 0.529 and 0.667.
5. Press **Survey**. The exact curves of cars traded and gains realised jump to 1 where b(1 + q_min)/2 reaches 1, and the gains curve always lies below the cars curve: the cars that stay unsold are the best. The dots of the samples sit on the curves, except near b = 2 with q_min = 0: at b = 1.9 the sample stops with 0.040 of the cars where the exact model sells none, because the price falls by only 5% per round and a sample soon finds a round where no car leaves. At b = 2 itself the exact model is on a knife edge (any price below 1 would stay where it is); on this seed the dot is 1.000, on other seeds it ends anywhere from 0.366 to 1.
`,
    it: `
1. Premi **Avvia** con i valori iniziali (q_min = 0,2, b = 1,5, 10.000 auto, campione n. 1). Il prezzo scende da 0,898 (0,9 nel modello esatto) turno dopo turno e si ferma a 0,594 dopo 27 turni; passa di mano lo 0,493 delle auto e si realizza lo 0,326 dei guadagni, contro 0,6, 1/2 e 1/3 nel modello esatto. Il campione va avanti anche dopo che il cammino esatto è a meno di 0,001 dalla fine (turno 20): si ferma solo quando non esce nemmeno un'auto.
2. Porta **q_min = 0**: il prezzo scivola fino a 0,001 e si vendono solo 8 delle 10.000 auto, anche se ciascuna vale per un compratore la metà in più. Porta **q_min = 0,4**: ora il primo prezzo, 1,048, è sopra ogni qualità, nessuno si ritira e passa di mano tutto il mercato in un turno.
3. Di nuovo con q_min = 0,2, alza **b**: a 1,65 il prezzo crolla ancora, lentamente (32 turni, lo 0,904 delle auto); a 1,70, sopra 5/3, passa di mano subito tutto il mercato.
4. Con **N = 1.000** la fine di un campione è molto meno certa: il campione n. 1 si ferma a 0,580 dopo 16 turni. Sui semi da 1 a 10, 10.000 auto finiscono tra 0,576 e 0,617, 1.000 auto tra 0,529 e 0,667.
5. Premi **Rassegna**. Le curve esatte delle auto vendute e dei guadagni realizzati saltano a 1 dove b(1 + q_min)/2 arriva a 1, e la curva dei guadagni sta sempre sotto quella delle auto: le auto che restano invendute sono le migliori. I punti dei campioni stanno sulle curve, tranne vicino a b = 2 con q_min = 0: a b = 1,9 il campione si ferma con lo 0,040 delle auto dove il modello esatto non ne vende nessuna, perché il prezzo scende solo del 5% a turno e un campione trova presto un turno in cui non esce nessuna auto. A b = 2 il modello esatto è in bilico (qualunque prezzo sotto 1 resterebbe dov'è); con questo seme il punto è 1,000, con altri semi finisce ovunque tra 0,366 e 1.
`,
  },
  signal: {
    en: `
1. At the defaults (λ = 0.3, c_L = 1, c_H = 0.5) separation works for every e* from 1 to 2 and pooling for every e from 0 to 0.3. **Separating at 1** is an equilibrium and passes the test of Cho and Kreps: the high type gets 1.5, the low type 1, and the signal wastes 0.15 per worker.
2. Move e to **1.5**: still an equilibrium, but it fails the test: any level between 1 and 1.5 would be taken only by a high type. At **2** the high type gets 1, no more than without education; above 2 it would rather take no education at all.
3. Choose **Pooling at e** with e = 0: both types get 1.3, nothing is wasted, and yet the test breaks it with any level between 0.7 and 1.4. At e = 0.3 pooling still holds, but the low type is down to 1, the high type to 1.15, and 0.255 is wasted per worker.
4. Move **λ** to 0.8: pooling at 0 would pay everyone 1.8, more than the 1.5 the high type keeps in the cheapest separation. The chart shows the crossing at λ = 1 − c_H/c_L = 0.5. The equilibrium that survives the test is the one that makes everyone poorer.
5. Set **c_H = c_L = 1**: separation is left only at e = 1, where both types are indifferent, and the chart drops the separating lines. Push c_H above c_L: no separation at all, the single-crossing condition fails.
`,
    it: `
1. Con i valori iniziali (λ = 0,3, c_L = 1, c_H = 0,5) la separazione funziona per ogni e* da 1 a 2 e il pooling per ogni e da 0 a 0,3. **Separazione a 1** è un equilibrio e supera il criterio intuitivo: il tipo alto ottiene 1,5, il tipo basso 1, e il segnale spreca 0,15 per lavoratore.
2. Porta e a **1,5**: ancora un equilibrio, ma non supera il criterio: qualunque livello tra 1 e 1,5 lo prenderebbe solo un tipo alto. A **2** il tipo alto ottiene 1, non più che senza istruzione; sopra 2 preferirebbe non istruirsi affatto.
3. Scegli **Pooling a e** con e = 0: entrambi i tipi ottengono 1,3, non si spreca nulla, eppure il criterio lo rompe con qualunque livello tra 0,7 e 1,4. Con e = 0,3 il pooling regge ancora, ma il tipo basso scende a 1, il tipo alto a 1,15, e si sprecano 0,255 per lavoratore.
4. Porta **λ** a 0,8: il pooling a 0 pagherebbe tutti 1,8, più dell'1,5 che il tipo alto tiene nella separazione più economica. Il grafico mostra l'incrocio a λ = 1 − c_H/c_L = 0,5. L'equilibrio che supera il criterio è quello che impoverisce tutti.
5. Porta **c_H = c_L = 1**: la separazione resta solo a e = 1, dove entrambi i tipi sono indifferenti, e il grafico toglie le linee della separazione. Porta c_H sopra c_L: nessuna separazione, la condizione di single crossing non vale.
`,
  },
  talk: {
    en: `
1. At **b = 0.1** two intervals at most: the boundary is at 0.3, the actions at 0.15 and 0.65. The decision maker loses 0.03083 on average, the expert 0.04083; no talk would cost 0.08333, delegation only 0.01000. **Simulate 10,000 cases** gives 0.03080 and 0.04085.
2. Press **1**: one interval, the message says nothing, and the loss is 1/12. Every equilibrium with fewer intervals than the largest is worse for both.
3. Move b to **0.05**: three intervals, boundaries 0.1333 and 0.4667, each 0.2 longer than the last; the loss is 0.01593 (0.02333 with two). At **0.02** there are five, from 0.04 to 0.36 long.
4. Move b to **0.25**: one interval only. Delegation still costs b², 0.0625, less than 1/12; above about 0.289 it costs more, and the line under the readout changes.
5. Press **Survey**. The largest N falls from 10 at b = 0.005 to 7, 6, 5, 4 by b = 0.025, to 3 at 0.045, 2 at 0.085 and 1 at 0.25. The decision maker's loss climbs in steps towards 1/12; it stays above b² up to b = 0.285 and falls below it from 0.290, the last three points of the survey.
`,
    it: `
1. Con **b = 0,1** al più due intervalli: il confine è a 0,3, le azioni a 0,15 e 0,65. Il decisore perde in media 0,03083, l'esperto 0,04083; senza parole si perderebbe 0,08333, con la delega solo 0,01000. **Simula 10.000 casi** dà 0,03080 e 0,04085.
2. Premi **1**: un solo intervallo, il messaggio non dice nulla, e la perdita è 1/12. Ogni equilibrio con meno intervalli del massimo è peggiore per entrambi.
3. Porta b a **0,05**: tre intervalli, confini 0,1333 e 0,4667, ognuno più lungo di 0,2 del precedente; la perdita è 0,01593 (0,02333 con due). A **0,02** sono cinque, lunghi da 0,04 a 0,36.
4. Porta b a **0,25**: un solo intervallo. La delega costa ancora b², 0,0625, meno di 1/12; sopra circa 0,289 costa di più, e la riga sotto i valori cambia.
5. Premi **Rassegna**. L'N più grande scende da 10 a b = 0,005 a 7, 6, 5, 4 entro b = 0,025, a 3 a 0,045, 2 a 0,085 e 1 a 0,25. La perdita del decisore sale a gradini verso 1/12; resta sopra b² fino a b = 0,285 e scende sotto da 0,290, gli ultimi tre punti della rassegna.
`,
  },
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: 'The entry game of Figure F1 with w = −1. For which t does the newcomer enter? And with w = −2? With t = 0.5 and with t = 0.7, what does the newcomer expect, and what does each type of incumbent get? Why would the weak incumbent like to be taken for tough?',
      it: "Il gioco dell'entrata della figura F1 con w = −1. Per quali t l'entrante entra? E con w = −2? Con t = 0,5 e con t = 0,7, che cosa si aspetta l'entrante, e che cosa ottiene ciascun tipo di incumbent? Perché all'incumbent debole piacerebbe essere preso per duro?",
    },
    solution: {
      en: 'The tough type fights (3 > 2), the weak one shares (2 > 0). The newcomer enters when 2(1 − t) − t > 0, that is t < 2/3; with w = −2, when 2(1 − t) − 2t > 0, t < 1/2. With t = 0.5 it enters and expects 2 − 1.5 = 0.5; the tough incumbent fights and gets 3, the weak one shares and gets 2. With t = 0.7 entering would give −0.1: it stays out, and both types get 4. Being believed tough often enough is worth 4 − 2 = 2 to the weak type, without ever having to fight.',
      it: "Il tipo duro combatte (3 > 2), quello debole divide (2 > 0). L'entrante entra quando 2(1 − t) − t > 0, cioè t < 2/3; con w = −2, quando 2(1 − t) − 2t > 0, t < 1/2. Con t = 0,5 entra e si aspetta 2 − 1,5 = 0,5; l'incumbent duro combatte e ottiene 3, quello debole divide e ottiene 2. Con t = 0,7 entrare darebbe −0,1: resta fuori, ed entrambi i tipi ottengono 4. Essere creduto duro abbastanza spesso vale 4 − 2 = 2 per il tipo debole, senza mai dover combattere.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Cars with qualities spread evenly on 0–1, b = 1.5. Show that no price above 0 can last. Then q_min = 0.2: the first three prices, the end point, the share of cars traded and of the gains. From which b does the whole market trade when q_min = 0.2?',
      it: "Auto con qualità uniformi su 0–1, b = 1,5. Mostra che nessun prezzo sopra 0 può durare. Poi q_min = 0,2: i primi tre prezzi, il punto d'arrivo, la quota di auto vendute e dei guadagni. Da quale b passa di mano tutto il mercato quando q_min = 0,2?",
    },
    solution: {
      en: 'At price p the cars up to p are offered; their average is p/2, worth 0.75p to a buyer, less than p: the price must fall, whatever it is. With q_min = 0.2: 1.5 × 0.6 = 0.9, then 1.5 × (0.2 + 0.9)/2 = 0.825, then 0.769. The end point solves p = 1.5(0.2 + p)/2: p = 0.6. Cars (0.6 − 0.2)/0.8 = 1/2; gains (0.36 − 0.04)/(1 − 0.04) = 1/3. The whole market trades when the first price reaches the best car, b(1 + 0.2)/2 ≥ 1: b ≥ 5/3.',
      it: "Al prezzo p si offrono le auto fino a p; la loro media è p/2, che per un compratore vale 0,75p, meno di p: il prezzo deve scendere, qualunque sia. Con q_min = 0,2: 1,5 × 0,6 = 0,9, poi 1,5 × (0,2 + 0,9)/2 = 0,825, poi 0,769. Il punto d'arrivo risolve p = 1,5(0,2 + p)/2: p = 0,6. Auto (0,6 − 0,2)/0,8 = 1/2; guadagni (0,36 − 0,04)/(1 − 0,04) = 1/3. Passa di mano tutto il mercato quando il primo prezzo arriva all'auto migliore, b(1 + 0,2)/2 ≥ 1: b ≥ 5/3.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Education with c_L = 1, c_H = 1/2, λ = 0.3. Which levels support separation, which pooling? Payoffs in the cheapest of each. Which survive the Cho–Kreps test, and why not pooling at 0? Above which λ would the high type rather nobody signalled?',
      it: "Istruzione con c_L = 1, c_H = 1/2, λ = 0,3. Quali livelli reggono la separazione, quali il pooling? I payoff nel più economico di ciascuno. Quali superano il criterio intuitivo, e perché non il pooling a 0? Sopra quale λ il tipo alto preferirebbe che nessuno segnalasse?",
    },
    solution: {
      en: 'Separation for e* from 1 to 2 (the low type must not copy, 2 − e* ≤ 1; the high type must want to pay, 2 − e*/2 ≥ 1); pooling for e from 0 to 0.3 (1.3 − e ≥ 1). Separation at 1: high 1.5, low 1; pooling at 0: 1.3 each. Only e* = 1 survives. Against pooling at 0, any level between 0.7 and 1.4 is one that a low type would never choose even if paid 2 (2 − e < 1.3) and a high type would choose if paid 2 (2 − e/2 > 1.3); read as high, it lures the high type away. The high type prefers pooling at 0 when 1 + λ > 1.5: λ above 1/2.',
      it: "Separazione per e* da 1 a 2 (il tipo basso non deve copiare, 2 − e* ≤ 1; il tipo alto deve voler pagare, 2 − e*/2 ≥ 1); pooling per e da 0 a 0,3 (1,3 − e ≥ 1). Separazione a 1: alto 1,5, basso 1; pooling a 0: 1,3 ciascuno. Sopravvive solo e* = 1. Contro il pooling a 0, qualunque livello tra 0,7 e 1,4 è uno che un tipo basso non sceglierebbe mai nemmeno pagato 2 (2 − e < 1,3) e che un tipo alto sceglierebbe se pagato 2 (2 − e/2 > 1,3); letto come alto, attira via il tipo alto. Il tipo alto preferisce il pooling a 0 quando 1 + λ > 1,5: λ sopra 1/2.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Cournot as in module 02 with a = 10: firm 1’s cost is 1; firm 2’s cost is 0 or 2 with equal chances, and only firm 2 knows it. Find the equilibrium (a quantity for firm 1, one for each type of firm 2), prices and profits. Compare with the case where firm 1 knows the cost. Which type of firm 2 would like to prove its cost?',
      it: "Cournot come nel modulo 02 con a = 10: il costo dell'impresa 1 è 1; il costo dell'impresa 2 è 0 o 2 con uguale probabilità, e lo conosce solo l'impresa 2. Trova l'equilibrio (una quantità per l'impresa 1, una per ciascun tipo dell'impresa 2), i prezzi e i profitti. Confronta con il caso in cui l'impresa 1 conosce il costo. Quale tipo dell'impresa 2 vorrebbe dimostrare il suo costo?",
    },
    solution: {
      en: 'Each type answers q1 with (10 − c − q1)/2, so on average firm 1 faces (9 − q1)/2; its best response (9 − E q2)/2 then gives q1 = 3. Firm 2 produces 3.5 (cost 0) or 2.5 (cost 2); prices 3.5 and 4.5. Profits: firm 1 7.5 or 10.5, mean 9; firm 2 12.25 or 6.25. With the cost known (module 02): firm 1 7.11 or 11.11, mean 9.11; firm 2 13.44 or 5.44. The low-cost type loses by being hidden and would like to prove it; the high-cost type gains from the doubt: a reason to signal, and a reason to fake.',
      it: "Ogni tipo risponde a q1 con (10 − c − q1)/2, quindi in media l'impresa 1 si trova davanti (9 − q1)/2; la sua miglior risposta (9 − E q2)/2 dà allora q1 = 3. L'impresa 2 produce 3,5 (costo 0) o 2,5 (costo 2); prezzi 3,5 e 4,5. Profitti: impresa 1 7,5 o 10,5, media 9; impresa 2 12,25 o 6,25. Con il costo noto (modulo 02): impresa 1 7,11 o 11,11, media 9,11; impresa 2 13,44 o 5,44. Il tipo a basso costo perde a restare nascosto e vorrebbe dimostrarlo; il tipo ad alto costo guadagna dal dubbio: una ragione per segnalare, e una per fingere.",
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Cheap talk with b = 0.1 and b = 0.05: the most informative partition, the decision maker’s loss, and the comparison with no talk and with letting the expert decide. Why is each interval 4b longer than the one before? Check your numbers in Simulation C.',
      it: "Cheap talk con b = 0,1 e b = 0,05: la partizione più informativa, la perdita del decisore, e il confronto con il silenzio e con il lasciar decidere l'esperto. Perché ogni intervallo è più lungo di 4b del precedente? Controlla i numeri nella simulazione C.",
    },
    solution: {
      en: 'b = 0.1: 0–0.3 and 0.3–1; loss (0.3³ + 0.7³)/12 = 0.0308; no talk 0.0833; delegation 0.01. b = 0.05: 0–0.133, 0.133–0.467, 0.467–1; loss 0.0159; delegation 0.0025. An expert who sees exactly a boundary a must be indifferent between the two neighbouring actions, so a + b lies halfway between the two midpoints. If the intervals have lengths L and L′, the midpoints are a − L/2 and a + L′/2, and a + b = a + (L′ − L)/4: L′ = L + 4b.',
      it: "b = 0,1: 0–0,3 e 0,3–1; perdita (0,3³ + 0,7³)/12 = 0,0308; senza parole 0,0833; delega 0,01. b = 0,05: 0–0,133, 0,133–0,467, 0,467–1; perdita 0,0159; delega 0,0025. Un esperto che vede esattamente un confine a deve essere indifferente tra le due azioni vicine, quindi a + b sta a metà tra i due punti medi. Se gli intervalli sono lunghi L e L′, i punti medi sono a − L/2 e a + L′/2, e a + b = a + (L′ − L)/4: L′ = L + 4b.",
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in the simulation. Show that 1/2 is the threshold of the global game: what does a hunter with signal 1/2 believe about the other’s signal? Then: in F2, the steps until the open band is narrower than 0.02 for σ = 0.2, 0.1, 0.05 and 0.02; in Simulation A, the share of cars traded with b = 1.5 for q_min = 0, 0.1, 0.2 and 0.4, and the end price of a sample of 10,000 cars; in Simulation C, the largest N for b = 0.2, 0.1, 0.05 and 0.02.',
      it: "Su carta, poi nella simulazione. Mostra che 1/2 è la soglia del gioco globale: che cosa crede un cacciatore con segnale 1/2 sul segnale dell'altro? Poi: in F2, i passi finché la fascia aperta è più stretta di 0,02 per σ = 0,2, 0,1, 0,05 e 0,02; nella simulazione A, la quota di auto vendute con b = 1,5 per q_min = 0, 0,1, 0,2 e 0,4, e il prezzo finale di un campione di 10.000 auto; nella simulazione C, l'N più grande per b = 0,2, 0,1, 0,05 e 0,02.",
    },
    solution: {
      en: 'Given its signal, a hunter believes the other’s signal is centred on its own: with signal 1/2 it is above or below 1/2 with equal chances. If the other hunts the stag above 1/2, the stag pays 1/2 − 1 × 1/2 = 0, the same as the hare: indifference, so 1/2 is the cutoff. F2: 8, 13, 24 and 56 steps. Simulation A, exact: 0, 0.222, 1/2 and 1; sample no. 1 of 10,000 cars: 0.001, 0.228, 0.493 and 1.000, end price 0.594 at q_min = 0.2. Simulation C: 2, 2, 3, 5.',
      it: "Dato il suo segnale, un cacciatore crede che il segnale dell'altro sia centrato sul proprio: con segnale 1/2 è sopra o sotto 1/2 con uguale probabilità. Se l'altro caccia il cervo sopra 1/2, il cervo rende 1/2 − 1 × 1/2 = 0, quanto la lepre: indifferenza, quindi 1/2 è la soglia. F2: 8, 13, 24 e 56 passi. Simulazione A, esatto: 0, 0,222, 1/2 e 1; campione n. 1 di 10.000 auto: 0,001, 0,228, 0,493 e 1,000, prezzo finale 0,594 con q_min = 0,2. Simulazione C: 2, 2, 3, 5.",
    },
  },
]
