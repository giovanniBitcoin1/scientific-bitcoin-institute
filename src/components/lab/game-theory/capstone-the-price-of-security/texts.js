// Module 14 texts outside the lecture: "What to observe" for each panel and
// the exercises. Every number is pinned by scripts/lab/check-game-theory-14.mjs
// ("quoted on the page"); the simulated ones are those of run no. 1.

export const observe = {
  attack: {
    en: `
1. The simulation opens on the dated defaults of November 2026: p_block = $189,882, A* = 1.43 (58.8% of all computing power), t(A*) = 13.99 blocks. The flow deters attacks up to $3.80 million; the default attack, worth $1 billion, is not deterred.
2. Read the rent line: 0.87% of the network is for rent, against the 143% she needs. Even September 2026's peak, about 3%, would not change the verdict: she must own the hardware, $26.62 billion of it.
3. The energy of the attack, 45.85 GWh or $2.29 million, is 60.4% of the flow cost, the same share as the honest network's energy in p_block: the flow cost is the honest cost of A*·t(A*) blocks.
4. Tick **Collapse** with the default 50%: she loses $13.31 billion of hardware, flow plus stock $13.32 billion, and the attack is deterred. Set the loss to **1%**: $266.24 million, $270.04 million in all, not deterred.
5. Set k + e to **1,008** (a week): A* falls to 1.07 and the flow deters attacks up to $208.68 million, still far below $1 billion.
6. The zero-profit check: the honest network burns $114,638 of electricity a block, 60.4% of p_block, which leaves $75,245 a block, $3.95 billion a year, 21.2% a year on $18.63 billion of hardware. With the **Test values**, 69.3% and 22.0%.
7. Press **Test values**: p_block $204,425 and the flow deters up to $4.09 million (exercise 2).
`,
    it: `
1. La simulazione si apre sui valori datati del novembre 2026: p_block = 189.882 $; A* = 1,43 (il 58,8% di tutta la potenza di calcolo); t(A*) = 13,99 blocchi. Il flusso scoraggia attacchi fino a 3,80 milioni di $; l'attacco predefinito, da 1 miliardo di dollari, non è scoraggiato.
2. Leggi la riga del noleggio: è a noleggio lo 0,87% della rete, contro il 143% che serve all'attaccante. Nemmeno il picco del settembre 2026, circa il 3%, cambierebbe il verdetto: l'hardware deve possederlo, per 26,62 miliardi di $.
3. L'energia dell'attacco, 45,85 GWh ovvero 2,29 milioni di $, è il 60,4% del costo di flusso, la stessa quota dell'energia della rete onesta in p_block: il costo di flusso è il costo onesto di A*·t(A*) blocchi.
4. Spunta **Crollo** con il 50% predefinito: l'attaccante perde 13,31 miliardi di $ di hardware, flusso più stock 13,32 miliardi di $, e l'attacco è scoraggiato. Porta la perdita all'**1%**: 266,24 milioni di $, 270,04 milioni di $ in tutto, non scoraggiato.
5. Porta k + e a **1.008** (una settimana): A* scende a 1,07 e il flusso scoraggia attacchi fino a 208,68 milioni di $, ancora molto sotto il miliardo.
6. La verifica dei profitti nulli: la rete onesta consuma 114.638 $ di elettricità per blocco, il 60,4% di p_block, e restano 75.245 $ per blocco, 3,95 miliardi di $ all'anno, il 21,2% annuo su 18,63 miliardi di $ di hardware. Con i **Valori di prova**, 69,3% e 22,0%.
7. Premi **Valori di prova**: p_block 204.425 $ e il flusso scoraggia fino a 4,09 milioni di $ (esercizio 2).
`,
  },
  fees: {
    en: `
1. The simulation opens on today: S = 3.125, f = 0.02, 100,000 blocks. The coefficient of variation is 0.00636 and no block is worth twice the average (exact 1.9 × 10^-69): the bars barely move.
2. Press **Fees only**: CV 1, and 13.53% of blocks are worth more than twice the average, 4.98% more than three times. Run no. 1 shows 13.42% ± 0.11% and 4.91% ± 0.07%.
3. Move f: with S = 0 the shares do not change at all, since every reward is f times a gap. Only the scale of the bars moves.
4. Choose **1,000** blocks: 13.30% ± 1.07% and 5.70% ± 0.73%, ten times the error with 100,000 blocks.
5. Press **2028: S 1.5625, f 0.5**: CV 0.24242, and 0.59% of blocks are worth more than twice the average (run no. 1: 0.58% ± 0.02%).
`,
    it: `
1. La simulazione si apre su oggi: S = 3,125; f = 0,02; 100.000 blocchi. Il coefficiente di variazione è 0,00636 e nessun blocco vale il doppio della media (esatto 1,9 × 10^-69): le barre quasi non si muovono.
2. Premi **Solo commissioni**: CV 1, e il 13,53% dei blocchi vale più del doppio della media, il 4,98% più del triplo. La prova n. 1 mostra 13,42% ± 0,11% e 4,91% ± 0,07%.
3. Sposta f: con S = 0 le quote non cambiano affatto, perché ogni ricompensa è f volte un intervallo. Cambia solo la scala delle barre.
4. Scegli **1.000** blocchi: 13,30% ± 1,07% e 5,70% ± 0,73%, dieci volte l'errore con 100.000 blocchi.
5. Premi **2028: S 1,5625; f 0,5**: CV 0,24242, e lo 0,59% dei blocchi vale più del doppio della media (prova n. 1: 0,58% ± 0,02%).
`,
  },
  estimate: {
    en: `
1. The worksheet opens on Simulation A's dated defaults, with their sources already in the source fields and the date fields empty. Fill in the dates, or replace any value with your own and say where it comes from.
2. Read the summary: every assumption with its value, source and date, then every result, the verdicts, and one sentence: "Under these assumptions, an attack worth $1.00 billion is not deterred by the flow of payments to miners, with k + e = 12."
3. Change V_attack to **3** ($3 million): the sentence turns to "is deterred". The flow of $189,882 a block covers attacks up to $3.80 million.
4. Press **Copy** and paste the summary wherever you keep your notes. Nothing you type is stored: leave the page and the worksheet starts again from the defaults.
`,
    it: `
1. Il foglio di lavoro si apre sui valori datati della Simulazione A, con le loro fonti già nei campi della fonte e i campi della data vuoti. Inserisci le date, oppure sostituisci un valore con il tuo e scrivi da dove viene.
2. Leggi il riepilogo: ogni ipotesi con il suo valore, la sua fonte e la sua data, poi ogni risultato, i verdetti e una frase: «Con queste ipotesi, un attacco che vale 1,00 miliardi di $ non è scoraggiato dal flusso dei pagamenti ai miner, con k + e = 12.»
3. Porta V_attack a **3** (3 milioni di $): la frase diventa «è scoraggiato». Il flusso di 189.882 $ per blocco copre attacchi fino a 3,80 milioni di $.
4. Premi **Copia** e incolla il riepilogo dove tieni i tuoi appunti. Nulla di ciò che scrivi viene salvato: lascia la pagina e il foglio riparte dai valori predefiniti.
`,
  },
}

export const exercises = [
  {
    type: 'sim',
    statement: {
      en: 'In Figure F1. Budish\'s base case, k + e = 12: A*, the attacker\'s share, t(A*), A*·t(A*), and the payment per block as a share of V_attack.',
      it: 'Nella Figura F1. Il caso base di Budish, k + e = 12: A*, la quota dell\'attaccante, t(A*), A*·t(A*), e il pagamento per blocco come quota di V_attack.',
    },
    solution: {
      en: 'With "Best A": A* = 1.43, a share of 1.43/2.43 = 59%; t(A*) = 13.99 blocks; A*·t(A*) = 20.0; so every block must pay 1/20.0 = 5.00% of V_attack (720% a day).',
      it: 'Con «A migliore»: A* = 1,43, una quota di 1,43/2,43 = 59%; t(A*) = 13,99 blocchi; A*·t(A*) = 20,0; quindi ogni blocco deve pagare 1/20,0 = 5,00% di V_attack (720% al giorno).',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Simulation A with the test values (price $65,000, subsidy 3.125, fees 0.02 BTC): p_block, and the largest attack the flow deters with k + e = 12 and with k + e = 1,008.',
      it: 'Su carta, poi nella Simulazione A con i valori di prova (prezzo 65.000 $, sussidio 3,125, commissioni 0,02 BTC): p_block, e l\'attacco più grande che il flusso scoraggia con k + e = 12 e con k + e = 1.008.',
    },
    solution: {
      en: 'p_block = 65,000 × 3.145 = $204,425. With k + e = 12, A*·t(A*) = 19.9999, so the flow deters up to about $4.09 million ($4,088,481). With k + e = 1,008, A*·t(A*) = 1,099.0175: about $224.7 million ($224,666,656).',
      it: 'p_block = 65.000 × 3,145 = 204.425 $. Con k + e = 12, A*·t(A*) = 19,9999, quindi il flusso scoraggia fino a circa 4,09 milioni di $ (4.088.481 $). Con k + e = 1.008, A*·t(A*) = 1.099,0175: circa 224,7 milioni di $ (224.666.656 $).',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Figure F1. A $1 billion attack with k + e = 12: the p_block needed, as a multiple of $204,425, and per year.',
      it: 'Su carta, poi nella Figura F1. Un attacco da 1 miliardo di dollari con k + e = 12: il p_block necessario, come multiplo di 204.425 $, e all\'anno.',
    },
    solution: {
      en: '1,000,000,000/19.9999 = about $50.0 million a block ($50,000,232), 244.6 times $204,425. Per year, × 52,560 blocks: about $2.63 trillion.',
      it: '1.000.000.000/19,9999 = circa 50,0 milioni di $ per blocco (50.000.232 $), 244,6 volte 204.425 $. All\'anno, × 52.560 blocchi: circa 2,63 mila miliardi di $.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Simulation A. The attacker\'s hardware at A* = 1.43, a network of 1,000 EH/s and $15 per TH/s; the energy of the attack at 17 J per TH and $0.05 per kWh.',
      it: 'Su carta, poi nella Simulazione A. L\'hardware dell\'attaccante con A* = 1,43, una rete di 1.000 EH/s e 15 $ per TH/s; l\'energia dell\'attacco a 17 J per TH e 0,05 $ per kWh.',
    },
    solution: {
      en: '1.4293 × 10⁹ TH/s × $15 = $21.44 billion. Power 1.4293 × 10⁹ × 17 W = 24.3 GW, for t(A*) = 13.99 blocks of 600 s: 56.67 GWh, which at $0.05 per kWh is $2.83 million.',
      it: '1,4293 × 10⁹ TH/s × 15 $ = 21,44 miliardi di $. Potenza 1,4293 × 10⁹ × 17 W = 24,3 GW, per t(A*) = 13,99 blocchi di 600 s: 56,67 GWh, che a 0,05 $ per kWh fanno 2,83 milioni di $.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Figure F2. The fees per block needed to keep 3.145 BTC per block in 2028 and in 2032.',
      it: 'Su carta, poi nella Figura F2. Le commissioni per blocco necessarie per mantenere 3,145 BTC per blocco nel 2028 e nel 2032.',
    },
    solution: {
      en: '2028: 3.145 − 1.5625 = 1.5825 BTC, 79 times 0.02 (79.125). 2032: 3.145 − 0.78125 = 2.3638 BTC, 118 times (118.1875).',
      it: '2028: 3,145 − 1,5625 = 1,5825 BTC, 79 volte 0,02 (79,125). 2032: 3,145 − 0,78125 = 2,3638 BTC, 118 volte (118,1875).',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Simulation B. Fees only: the share of blocks worth more than twice and three times the average; then with a subsidy of 1.5625 and fees of 0.5 BTC, more than twice.',
      it: 'Su carta, poi nella Simulazione B. Solo commissioni: la quota di blocchi che valgono più del doppio e del triplo della media; poi con un sussidio di 1,5625 e commissioni di 0,5 BTC, più del doppio.',
    },
    solution: {
      en: 'With S = 0 the reward is f times an exponential gap, so P(gap > 2) = e^−2 = 13.5% and P(gap > 3) = e^−3 = 5.0%. With S = 1.5625 and f = 0.5: exp(−2 − S/f) = exp(−5.125) = 0.59%.',
      it: 'Con S = 0 la ricompensa è f volte un intervallo esponenziale, quindi P(intervallo > 2) = e^−2 = 13,5% e P(intervallo > 3) = e^−3 = 5,0%. Con S = 1,5625 e f = 0,5: exp(−2 − S/f) = exp(−5,125) = 0,59%.',
    },
  },
]
