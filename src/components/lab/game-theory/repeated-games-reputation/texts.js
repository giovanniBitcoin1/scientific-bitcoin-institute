// Module 06 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/game-theory-lab/repeated-games-reputation.<lang>.md.
// Every number quoted here is pinned by scripts/lab/check-game-theory-06.mjs.

export const observe = {
  cartel: {
    en: `
1. The panel opens with two firms at δ = 0.5, just below the threshold 9/17 = 0.5294. The cartel's 2.25 each cannot hold, but 2.2941 can, with a profit of 10.1211: 0.997 of the cartel's extra profit over Cournot. From δ = 0.53 the whole cartel holds, 2.25 and 10.125.
2. Lower δ to **0.3**: the most that holds is 2.5862, profit 9.8989, 0.799 of the extra profit. At δ = 0 only Cournot is left, 3 and 9. The curve on the chart falls smoothly towards the punishment line.
3. Switch to **prices**: with two firms the cartel price 5.5 holds from δ = 0.5 on, profit 10.125; at 0.49 nothing holds and the profit is 0. All or nothing: the curve is a step.
4. Set n = **10** with quantities, δ = 0.5: the threshold is 0.7516, and the most that holds is 0.6352 each, profit 1.6819, 0.747 of the extra profit. With prices at δ = 0.75 ten firms hold nothing: they need 0.9.
5. Read the table: the thresholds rise with n in both columns. With two firms prices need a little less patience than quantities (0.500 against 0.529); from three firms on they need more (0.667 against 0.571, and 0.900 against 0.752 at n = 10).
`,
    it: `
1. Il pannello si apre con due imprese e δ = 0,5, appena sotto la soglia 9/17 = 0,5294. Il 2,25 a testa del cartello non regge, ma 2,2941 sì, con un profitto di 10,1211: lo 0,997 del profitto in più del cartello rispetto a Cournot. Da δ = 0,53 regge tutto il cartello, 2,25 e 10,125.
2. Abbassa δ a **0,3**: il massimo che regge è 2,5862, profitto 9,8989, lo 0,799 del profitto in più. Con δ = 0 resta solo Cournot, 3 e 9. Nel grafico la curva scende dolcemente verso la linea della punizione.
3. Passa ai **prezzi**: con due imprese il prezzo di cartello 5,5 regge da δ = 0,5 in su, profitto 10,125; a 0,49 non regge nulla e il profitto è 0. Tutto o niente: la curva è un gradino.
4. Porta n a **10** con le quantità, δ = 0,5: la soglia è 0,7516, e il massimo che regge è 0,6352 a testa, profitto 1,6819, lo 0,747 del profitto in più. Con i prezzi e δ = 0,75 dieci imprese non sostengono nulla: servirebbe 0,9.
5. Leggi la tabella: le soglie crescono con n in entrambe le colonne. Con due imprese i prezzi richiedono un po' meno pazienza delle quantità (0,500 contro 0,529); da tre imprese in su ne richiedono di più (0,667 contro 0,571, e 0,900 contro 0,752 con n = 10).
`,
  },
  wars: {
    en: `
1. At the defaults (σ = 0.5, p̄ = 4.5, L = 5, δ = 0.9) a false alarm has chance 0.0228 and a cheat is caught with 0.5987. The margin is 0.9377: cheating does not pay. The value per round is 10.0380, the long-run share of peace 0.8979 and the long-run profit 10.0101. Sample no. 1 has 3 wars and a quiet share of 0.925, although nobody cheats.
2. Press **New sample** a few times: 200 rounds are few, and the quiet share moves (0.950 with 2 wars in sample no. 2, 0.800 with 8 wars in sample no. 4). Over 100,000 rounds it settles near 0.898.
3. Set **L = 2**: the margin falls to −0.1991 and cheating pays, because a short war is a small threat. L = 3 is the shortest war that works (margin 0.2316).
4. Press **Best rule**: p̄ = 3.85 and L = 19, value 10.1208. A low trigger almost never fires by accident (p0 = 0.0005, peace 0.9909) and a long war makes the rare catch (p1 = 0.1469) enough. Sample no. 1 under this rule has no war at all.
5. Raise σ to **1** with the default rule: the margin is −0.2424 and cheating pays. **Best rule** finds p̄ = 3.45 and L = 26, value 9.9616, with peace only 0.656 of the time. Then set σ back to 0.5 and δ to 0.6: no rule on the grid works, as the small chart says (the least δ at σ = 0.5 is 0.6405).
`,
    it: `
1. Con i valori iniziali (σ = 0,5, p̄ = 4,5, L = 5, δ = 0,9) un falso allarme ha probabilità 0,0228 e un imbroglio viene scoperto con probabilità 0,5987. Il margine è 0,9377: imbrogliare non conviene. Il valore per turno è 10,0380, la quota di pace nel lungo periodo 0,8979 e il profitto di lungo periodo 10,0101. Il campione n. 1 ha 3 guerre e una quota di turni tranquilli di 0,925, anche se nessuno imbroglia.
2. Premi qualche volta **Nuovo campione**: 200 turni sono pochi, e la quota di turni tranquilli si sposta (0,950 con 2 guerre nel campione n. 2, 0,800 con 8 guerre nel campione n. 4). Su 100.000 turni si assesta vicino a 0,898.
3. Imposta **L = 2**: il margine scende a −0,1991 e imbrogliare conviene, perché una guerra corta è una minaccia piccola. L = 3 è la guerra più corta che funziona (margine 0,2316).
4. Premi **Regola migliore**: p̄ = 3,85 e L = 19, valore 10,1208. Una soglia bassa non scatta quasi mai per caso (p0 = 0,0005, pace 0,9909) e con una guerra lunga basta anche una scoperta rara (p1 = 0,1469). Il campione n. 1 con questa regola non ha nessuna guerra.
5. Alza σ a **1** con la regola iniziale: il margine è −0,2424 e imbrogliare conviene. **Regola migliore** trova p̄ = 3,45 e L = 26, valore 9,9616, con la pace solo per lo 0,656 del tempo. Poi riporta σ a 0,5 e δ a 0,6: nessuna regola della griglia funziona, come mostra il grafico piccolo (il δ più piccolo con σ = 0,5 è 0,6405).
`,
  },
  reputation: {
    en: `
1. At the defaults (t = 0.05, N = 20, w = −1, a weak incumbent) the first D = 13 newcomers stay out: the belief 0.05 is above b^k for every k ≥ 8. The weak incumbent earns 66, against 40 without the doubt; against it the expected entries are 6.1735 and the expected fights 0.8265. In history no. 1 it shares at market 14, the belief drops to 0, and the last six newcomers all enter.
2. Choose **Tough**: it fights at markets 14, 16, 18 and 20, and the newcomers at 15, 17 and 19 stay out at the tie, each time the belief climbs onto the step line. It earns 76 with 4 entries.
3. Press **10,000 chains**: 6.1697 entries and 0.8303 fights on average, close to the exact values, and the weak incumbent's payoff is 66 in every one of the chains: wherever it mixes, it is indifferent.
4. Set **t = 0**: nobody is deterred, every newcomer enters, the weak incumbent shares all 20 times (40) and a tough one fights all 20 (60). At **t = 0.5**, 19 newcomers are deterred and the weak incumbent earns 78.
5. Set **N = 5**: nobody is deterred from the start, since (2/3)^5 = 0.1317 is above 0.05, and the weak incumbent earns 10, as without the doubt. At **N = 50**, 43 are deterred and it earns 186; the expected entries are 6.1735 again, as for every N ≥ 7.
6. Move **w**: at w = −2 (b = 0.5) 16 newcomers are deterred and the weak incumbent earns 72; at w = −0.5 (b = 0.8) only 7, and it earns 54. The harder a fight hits the newcomers, the less reputation is needed.
`,
    it: `
1. Con i valori iniziali (t = 0,05, N = 20, w = −1, un incumbent debole) i primi D = 13 entranti restano fuori: la credenza 0,05 è sopra b^k per ogni k ≥ 8. L'incumbent debole guadagna 66, contro 40 senza il dubbio; contro di lui le entrate attese sono 6,1735 e le lotte attese 0,8265. Nella storia n. 1 divide al mercato 14, la credenza crolla a 0 e gli ultimi sei entranti entrano tutti.
2. Scegli **Duro**: combatte ai mercati 14, 16, 18 e 20, e gli entranti ai mercati 15, 17 e 19 restano fuori a parità di payoff, ogni volta che la credenza sale sulla linea a gradini. Guadagna 76 con 4 entrate.
3. Premi **10.000 catene**: in media 6,1697 entrate e 0,8303 lotte, vicine ai valori esatti, e il payoff dell'incumbent debole è 66 in ognuna delle catene: dove gioca una strategia mista, è indifferente.
4. Imposta **t = 0**: nessuno è scoraggiato, ogni entrante entra, l'incumbent debole divide tutte e 20 le volte (40) e uno duro combatte tutte e 20 (60). Con **t = 0,5** sono scoraggiati 19 entranti e l'incumbent debole guadagna 78.
5. Imposta **N = 5**: nessuno è scoraggiato fin dall'inizio, perché (2/3)^5 = 0,1317 è sopra 0,05, e l'incumbent debole guadagna 10, come senza il dubbio. Con **N = 50** ne sono scoraggiati 43 e guadagna 186; le entrate attese sono di nuovo 6,1735, come per ogni N ≥ 7.
6. Muovi **w**: con w = −2 (b = 0,5) sono scoraggiati 16 entranti e l'incumbent debole guadagna 72; con w = −0,5 (b = 0,8) solo 7, e guadagna 54. Quanto più una lotta danneggia gli entranti, tanto meno reputazione serve.
`,
  },
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: 'Module 01\'s prisoner\'s dilemma, (3, 3), (0, 5), (5, 0), (1, 1), with grim trigger. For which δ does cooperation hold? And if the temptation is 7 instead of 5? If δ is the probability of another round, how many rounds does a pair expect at δ = 0.9? Show that in the punishment phase nobody gains by cooperating once.',
      it: 'Il dilemma del prigioniero del modulo 01, (3, 3), (0, 5), (5, 0), (1, 1), con la strategia grim trigger. Per quali δ regge la cooperazione? E se la tentazione è 7 invece di 5? Se δ è la probabilità di un altro turno, quanti turni si aspetta una coppia con δ = 0,9? Mostra che nella fase di punizione nessuno ha da guadagnare cooperando una volta.',
    },
    solution: {
      en: 'Cooperating gives 3 on average, defecting today (1 − δ)5 + δ·1: cooperation holds when 3 ≥ 5 − 4δ, that is δ ≥ 1/2. With T = 7: 3 ≥ 7 − 6δ, δ ≥ 2/3. The number of rounds is 1 + δ + δ² + … = 1/(1 − δ) = 10. In the punishment phase the other defects for ever whatever happens: cooperating once gives 0 instead of 1 and the punishment goes on, so it only loses.',
      it: 'Cooperare dà 3 in media, defezionare oggi (1 − δ)5 + δ·1: la cooperazione regge quando 3 ≥ 5 − 4δ, cioè δ ≥ 1/2. Con T = 7: 3 ≥ 7 − 6δ, δ ≥ 2/3. Il numero di turni è 1 + δ + δ² + … = 1/(1 − δ) = 10. Nella fase di punizione l\'altro defeziona per sempre qualunque cosa accada: cooperare una volta dà 0 invece di 1 e la punizione continua: si ha solo da perdere.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Module 02\'s cartel. Show that two firms can hold it with a return to Cournot when δ ≥ 9/17, three when δ ≥ 4/7; with prices, 1/2 and 2/3. With two firms and δ = 0.3, what is the most restrictive output that holds, and its profit? Then check it in Panel A.',
      it: 'Il cartello del modulo 02. Mostra che due imprese lo sostengono con il ritorno a Cournot quando δ ≥ 9/17, tre quando δ ≥ 4/7; con i prezzi, 1/2 e 2/3. Con due imprese e δ = 0,3, qual è la quantità più bassa che regge, e il suo profitto? Poi verificalo nel Pannello A.',
    },
    solution: {
      en: 'Two firms: cartel 10.125, cheat 3.375 earning 11.390625, Cournot 9; δ* = (11.390625 − 10.125)/(11.390625 − 9) = 1.265625/2.390625 = 9/17. Three firms: cartel 1.5 each earning 6.75, a cheat (9 − 3)/2 = 3 earning 9, Cournot 5.0625; δ* = 2.25/3.9375 = 4/7. Prices: (1 − δ)·20.25 ≤ 20.25/n, so δ ≥ (n − 1)/n: 1/2 and 2/3. At δ = 0.3 an output q holds when (9 − 2q)q ≥ 0.7((9 − q)/2)² + 0.3·9; the smallest such q is (27 − 4.5)/(9 − 0.3) = 22.5/8.7 = 2.586, with profit (9 − 5.172)·2.586 = 9.899.',
      it: 'Due imprese: cartello 10,125, chi imbroglia produce 3,375 e guadagna 11,390625, Cournot 9; δ* = (11,390625 − 10,125)/(11,390625 − 9) = 1,265625/2,390625 = 9/17. Tre imprese: cartello 1,5 a testa con 6,75, chi imbroglia (9 − 3)/2 = 3 con 9, Cournot 5,0625; δ* = 2,25/3,9375 = 4/7. Prezzi: (1 − δ)·20,25 ≤ 20,25/n, quindi δ ≥ (n − 1)/n: 1/2 e 2/3. Con δ = 0,3 una quantità q regge quando (9 − 2q)q ≥ 0,7((9 − q)/2)² + 0,3·9; la più piccola è (27 − 4,5)/(9 − 0,3) = 22,5/8,7 = 2,586, con profitto (9 − 5,172)·2,586 = 9,899.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Which average payoffs are feasible and individually rational in module 01\'s dilemma? With the public lottery and grim trigger, how much patience do (3, 3), (2.5, 2.5) and (2, 2) need, and with which lotteries? Why does (2.5, 2.5) need less than (3, 3)? Then check it in Figure F2.',
      it: 'Quali payoff medi sono ammissibili e individualmente razionali nel dilemma del modulo 01? Con la lotteria pubblica e la strategia grim trigger, quanta pazienza serve a (3, 3), (2,5, 2,5) e (2, 2), e con quali lotterie? Perché (2,5, 2,5) richiede meno di (3, 3)? Poi verificalo nella Figura F2.',
    },
    solution: {
      en: 'Feasible: the quadrilateral with corners DD (1, 1), DC (5, 0), CC (3, 3) and CD (0, 5). Individually rational (both at least the minmax 1): the quadrilateral (1, 1), (1, 13/3), (3, 3), (13/3, 1), of area 20/3. (3, 3) is CC always: the constraint 3 ≥ (1 − δ)5 + δ gives 0.5. (2.5, 2.5) is CD and DC, half each: the player exploited this round obeys when (1 − δ)·0 + δ·2.5 ≥ (1 − δ)·1 + δ·1, so δ ≥ 0.4. (2, 2) is CD, DC and DD, a third each: δ·2 ≥ 1, 0.5. The exploited player gives up 1 by obeying, a cooperator facing a cooperator gives up 2.',
      it: 'Ammissibili: il quadrilatero con vertici DD (1, 1), DC (5, 0), CC (3, 3) e CD (0, 5). Individualmente razionali (entrambi almeno il minmax 1): il quadrilatero (1, 1), (1, 13/3), (3, 3), (13/3, 1), di area 20/3. (3, 3) è sempre CC: il vincolo 3 ≥ (1 − δ)5 + δ dà 0,5. (2,5, 2,5) è CD e DC, metà ciascuna: chi è sfruttato in questo turno obbedisce quando (1 − δ)·0 + δ·2,5 ≥ (1 − δ)·1 + δ·1, quindi δ ≥ 0,4. (2, 2) è CD, DC e DD, un terzo ciascuna: δ·2 ≥ 1, 0,5. Chi è sfruttato rinuncia a 1 obbedendo, un cooperatore davanti a un cooperatore rinuncia a 2.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Panel B with σ = 0.5, p̄ = 4.5, δ = 0.9. What are the chances of a false alarm and of catching a cheat? With L = 5, does cheating pay? Which share of the rounds are wars in the long run? What is the shortest war that stops cheating? Then check it in Panel B.',
      it: 'Il Pannello B con σ = 0,5, p̄ = 4,5, δ = 0,9. Quali sono le probabilità di un falso allarme e di scoprire un imbroglio? Con L = 5, imbrogliare conviene? Quale quota dei turni è di guerra nel lungo periodo? Qual è la guerra più corta che ferma gli imbrogli? Poi verificalo nel Pannello B.',
    },
    solution: {
      en: 'p0 = Φ((4.5 − 5.5)/0.5) = Φ(−2) = 0.0228 and p1 = Φ((4.5 − 4.375)/0.5) = Φ(0.25) = 0.5987. With L = 5, x = 1.125/(0.1 + 0.9·0.0228·(1 − 0.9⁵)) and the margin is 0.938: cheating does not pay. Peace 1/(1 + 0.0228·5) = 0.898, so 0.102 of the rounds are wars. L = 3 is the shortest (margin 0.232; L = 2 gives −0.199).',
      it: 'p0 = Φ((4,5 − 5,5)/0,5) = Φ(−2) = 0,0228 e p1 = Φ((4,5 − 4,375)/0,5) = Φ(0,25) = 0,5987. Con L = 5, x = 1,125/(0,1 + 0,9·0,0228·(1 − 0,9⁵)) e il margine è 0,938: imbrogliare non conviene. Pace 1/(1 + 0,0228·5) = 0,898, quindi lo 0,102 dei turni è di guerra. La più corta è L = 3 (margine 0,232; L = 2 dà −0,199).',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'The chain-store game with t = 0.05, w = −1, 20 markets. Which newcomers stay out whatever happened before them? In the first market where entry can happen, with which probability does a weak incumbent fight, and what do the newcomers believe after a fight? What does the weak incumbent earn?',
      it: 'Il gioco del chain store con t = 0,05, w = −1, 20 mercati. Quali entranti restano fuori qualunque cosa sia successa prima? Nel primo mercato in cui l\'entrata può avvenire, con quale probabilità combatte un incumbent debole, e che cosa credono gli entranti dopo una lotta? Quanto guadagna l\'incumbent debole?',
    },
    solution: {
      en: 'b = 2/3. The newcomer with k markets to go stays out when 0.05 ≥ (2/3)^k: k ≥ 8, since (2/3)^8 = 0.039 and (2/3)^7 = 0.0585. So the first 13 stay out. In market 14 (k = 7) the weak incumbent fights with probability β = 0.05(1 − (2/3)^6)/(0.95·(2/3)^6) = 0.547, and after a fight the belief is (2/3)^6 = 0.0878, so the next newcomer stays out at the tie. The weak incumbent is indifferent wherever it mixes, so it earns as if it shared at the first entry: 13 × 4 + 7 × 2 = 66, against 40 without the doubt.',
      it: 'b = 2/3. L\'entrante con k mercati da giocare resta fuori quando 0,05 ≥ (2/3)^k: k ≥ 8, perché (2/3)^8 = 0,039 e (2/3)^7 = 0,0585. Quindi i primi 13 restano fuori. Al mercato 14 (k = 7) l\'incumbent debole combatte con probabilità β = 0,05(1 − (2/3)^6)/(0,95·(2/3)^6) = 0,547, e dopo una lotta la credenza è (2/3)^6 = 0,0878, quindi l\'entrante successivo resta fuori a parità di payoff. L\'incumbent debole è indifferente dove gioca una strategia mista, quindi guadagna come se dividesse alla prima entrata: 13 × 4 + 7 × 2 = 66, contro 40 senza il dubbio.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'The same exercise with 5 markets, then with 50. Why does a reputation need a long horizon? Then check it in Panel C.',
      it: 'Lo stesso esercizio con 5 mercati, poi con 50. Perché una reputazione ha bisogno di un orizzonte lungo? Poi verificalo nel Pannello C.',
    },
    solution: {
      en: 'With 5 markets nobody is deterred from the start, since (2/3)^5 = 0.132 > 0.05, and the weak incumbent earns 10, as without the doubt. With 50, the 43 newcomers with k ≥ 8 are deterred and it earns 43 × 4 + 7 × 2 = 186, against 100. The expected entries against a weak incumbent are 6.17 whenever N ≥ 7: the last 7 markets are the same game whatever comes before. A reputation is worth something only if there are many markets left to protect.',
      it: 'Con 5 mercati nessuno è scoraggiato fin dall\'inizio, perché (2/3)^5 = 0,132 > 0,05, e l\'incumbent debole guadagna 10, come senza il dubbio. Con 50, i 43 entranti con k ≥ 8 sono scoraggiati e guadagna 43 × 4 + 7 × 2 = 186, contro 100. Le entrate attese contro un incumbent debole sono 6,17 ogni volta che N ≥ 7: gli ultimi 7 mercati sono lo stesso gioco qualunque cosa venga prima. Una reputazione vale qualcosa solo se restano molti mercati da proteggere.',
    },
  },
]
