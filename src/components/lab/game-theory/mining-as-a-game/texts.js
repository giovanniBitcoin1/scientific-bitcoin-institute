// Module 13 texts outside the lecture: "What to observe" for each panel and
// the exercises. Every number is pinned by scripts/lab/check-game-theory-13.mjs
// ("quoted on the page"); the simulated ones are those of run no. 1.

export const observe = {
  race: {
    en: `
1. The panel opens on α = 0.4, γ = 0 and 100,000 blocks mined. Her share of the chain is 0.4903 ± 0.0046 against R = 0.4837; per 100 blocks mined, 5.84 ± 0.10 of hers and 24.01 ± 0.29 of the others' are orphaned (exact 5.90 and 23.61), and 70.14 end in the chain (exact 70.49). Her longest private lead was 27 blocks.
2. Choose **1,000,000**: 0.4843 ± 0.0013, orphans 5.89 and 23.65, chain 70.46. Ten times the blocks, about a third of the error.
3. Back to 100,000, set γ to **1**: she loses no race and no block (0.00), and her share rises to 0.5736 ± 0.0038 (exact 0.5674). The chain blocks per 100 stay at 70.14: the same blocks are found, and γ only decides whose blocks fill the chain.
4. Set α to **0.3**, γ to **0**: her share is 0.2733 ± 0.0027, below her 0.3 of the work (exact 0.2731). Below the threshold, hiding blocks costs her more than it costs the others.
5. Read the strip from left to right: runs of **+** are her lead growing, runs of **1** her lead being spent, one block for each of theirs; an **r** is a race, settled by the next letter.
`,
    it: `
1. Il pannello si apre con α = 0,4, γ = 0 e 100.000 blocchi trovati. La sua quota della catena è 0,4903 ± 0,0046 contro R = 0,4837; ogni 100 blocchi trovati, 5,84 ± 0,10 dei suoi e 24,01 ± 0,29 degli altri diventano orfani (esatti 5,90 e 23,61), e 70,14 finiscono nella catena (esatto 70,49). Il vantaggio massimo della sua catena privata è stato di 27 blocchi.
2. Scegli **1.000.000**: 0,4843 ± 0,0013, orfani 5,89 e 23,65, catena 70,46. Dieci volte i blocchi, circa un terzo dell'errore.
3. Torna a 100.000 e porta γ a **1**: il miner non perde nessuna gara e nessun blocco (0,00), e la sua quota sale a 0,5736 ± 0,0038 (esatto 0,5674). I blocchi della catena ogni 100 restano 70,14: si trovano gli stessi blocchi, e γ decide solo di chi sono i blocchi che riempiono la catena.
4. Porta α a **0,3** e γ a **0**: la sua quota è 0,2733 ± 0,0027, sotto il suo 0,3 del lavoro (esatto 0,2731). Sotto la soglia, nascondere i blocchi costa più a lui che agli altri.
5. Leggi la striscia da sinistra a destra: le sequenze di **+** sono il suo vantaggio che cresce, quelle di **1** il vantaggio che si consuma, un blocco per ciascuno dei loro; una **r** è una gara, decisa dalla lettera successiva.
`,
  },
  difficulty: {
    en: `
1. The panel opens on α = 0.4, γ = 0 and 60 days: 85.25% of the honest income until the first adjustment, on day 19.86, then 120.93%. She breaks even on day 33.86, which here happens to be the day of the second adjustment as well (19.86 + 14). On day 60 she expects 3,771 blocks against 3,456 for honest mining; path no. 1 ends at 3,741.
2. Set α to **0.35** and the horizon to **90**: after the adjustment she earns only 104.72% of the honest income, and breaks even on day 102.62, beyond the horizon. On day 90 she is still behind, 4,506 blocks expected against 4,536.
3. Set α to **0.33**: below the threshold the income after the adjustment, 99.08%, never makes up for the first weeks.
4. Set α to **0.35** and γ to **0.5**: 89.36% before, 118.87% after, break-even on day 29.12.
5. Press **Another path** a few times: the simulated path wanders around the expected line, and its adjustments move by a day or so, since the 2016 chain blocks take a random time.
`,
    it: `
1. Il pannello si apre con α = 0,4, γ = 0 e 60 giorni: l'85,25% del reddito onesto fino al primo aggiustamento, il giorno 19,86, poi il 120,93%. Va in pari il giorno 33,86, che qui coincide anche con il secondo aggiustamento (19,86 + 14). Il giorno 60 si aspetta 3.771 blocchi contro i 3.456 del mining onesto; il percorso n. 1 finisce a 3.741.
2. Porta α a **0,35** e l'orizzonte a **90**: dopo l'aggiustamento incassa solo il 104,72% del reddito onesto, e va in pari il giorno 102,62, oltre l'orizzonte. Il giorno 90 è ancora indietro, 4.506 blocchi attesi contro 4.536.
3. Porta α a **0,33**: sotto la soglia il reddito dopo l'aggiustamento, il 99,08%, non recupera mai le prime settimane.
4. Porta α a **0,35** e γ a **0,5**: 89,36% prima, 118,87% dopo, in pari il giorno 29,12.
5. Premi **Un altro percorso** qualche volta: il percorso simulato oscilla attorno alla linea attesa, e i suoi aggiustamenti si spostano di un giorno o giù di lì, perché i 2016 blocchi della catena richiedono un tempo casuale.
`,
  },
  best: {
    en: `
1. The panel opens on γ = 0. Honest mining is the best policy up to α = 0.325; at 1/3 the best policy earns 0.3370 where SM1 earns exactly 1/3, and at 0.35 it earns 0.3708 against 0.3665. The best deviation pays from α = 0.3294, SM1 from 1/3.
2. The map of the cell α = 0.35: 19 reached cells differ from SM1. One or two blocks behind she waits instead of adopting; having caught up that way, she overrides at once when one block ahead with her own block last.
3. Choose α = **0.30**: honest mining. Only two states are ever reached, (1, 0), where she publishes her block at once, and (0, 1), where she adopts theirs.
4. Choose γ = **1/2**: both thresholds are 0.25, but above it the best policy pulls away, 0.5725 against 0.5256 at α = 0.4. In that cell's map (68 cells differ) she matches an honest block one block ahead, at (2, 1), where SM1 overrides, and keeps mining in private after winning a race.
5. Choose γ = **1**: the best share is α/(1 − α), 0.4286 at α = 0.3 against SM1's 0.3806.
6. Choose γ = **1/4** and compare the columns near α = 0.325: the best deviation earns 0.3439, SM1 0.3436. Above the threshold the two strategies start almost together.
`,
    it: `
1. Il pannello si apre con γ = 0. Il mining onesto è la politica ottima fino ad α = 0,325; con 1/3 la politica ottima rende 0,3370 dove SM1 rende esattamente 1/3, e con 0,35 rende 0,3708 contro 0,3665. La deviazione migliore conviene da α = 0,3294, SM1 da 1/3.
2. La mappa della cella α = 0,35: 19 celle raggiunte differiscono da SM1. Indietro di uno o due blocchi il miner fa wait invece di adopt; recuperato così lo svantaggio, fa subito override quando è avanti di un blocco e l'ultimo blocco è suo.
3. Scegli α = **0,30**: mining onesto. Si raggiungono solo due stati, (1, 0), dove pubblica subito il suo blocco, e (0, 1), dove adotta il loro.
4. Scegli γ = **1/2**: entrambe le soglie sono 0,25, ma sopra di esse la politica ottima si stacca, 0,5725 contro 0,5256 con α = 0,4. Nella mappa di quella cella (68 celle differiscono) il miner pareggia un blocco onesto quando è avanti di uno, in (2, 1), dove SM1 fa override, e continua a minare in privato dopo aver vinto una gara.
5. Scegli γ = **1**: la quota migliore è α/(1 − α), 0,4286 con α = 0,3 contro lo 0,3806 di SM1.
6. Scegli γ = **1/4** e confronta le colonne vicino ad α = 0,325: la deviazione migliore rende 0,3439, SM1 0,3436. Sopra la soglia le due strategie partono quasi insieme.
`,
  },
}

export const exercises = [
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Figure F1. α = 1/3, γ = 0: find the stationary probabilities p0 = (1 − 2α)/(2α³ − 4α² + 1), p1 = αp0 and p0′ = α(1 − α)p0, and R.',
      it: 'Su carta, poi nella Figura F1. α = 1/3, γ = 0: trova le probabilità stazionarie p0 = (1 − 2α)/(2α³ − 4α² + 1), p1 = αp0 e p0′ = α(1 − α)p0, e R.',
    },
    solution: {
      en: 'The denominator is 2/27 − 4/9 + 1 = 17/27, so p0 = (1/3)/(17/27) = 9/17; p1 = 3/17; p0′ = (1/3)(2/3)(9/17) = 2/17. R = 1/3: exactly the threshold, where selfish mining neither gains nor loses.',
      it: 'Il denominatore è 2/27 − 4/9 + 1 = 17/27, quindi p0 = (1/3)/(17/27) = 9/17; p1 = 3/17; p0′ = (1/3)(2/3)(9/17) = 2/17. R = 1/3: esattamente la soglia, dove il selfish mining né guadagna né perde.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Figure F2. Find the threshold (1 − γ)/(3 − 2γ) for γ = 0, 1/4, 1/2 and 1.',
      it: 'Su carta, poi nella Figura F2. Trova la soglia (1 − γ)/(3 − 2γ) per γ = 0, 1/4, 1/2 e 1.',
    },
    solution: {
      en: 'γ = 0: 1/3. γ = 1/4: (3/4)/(5/2) = 0.3. γ = 1/2: (1/2)/2 = 1/4. γ = 1: 0, so a miner of any size gains.',
      it: 'γ = 0: 1/3. γ = 1/4: (3/4)/(5/2) = 0,3. γ = 1/2: (1/2)/2 = 1/4. γ = 1: 0, quindi guadagna un miner di qualunque dimensione.',
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In Panel A. α = 0.4, γ = 0, 1,000,000 blocks: her share, the orphaned blocks per 100 mined, the chain blocks per 100 mined.',
      it: 'Nel Pannello A. α = 0,4, γ = 0, 1.000.000 blocchi: la sua quota, i blocchi orfani ogni 100 trovati, i blocchi della catena ogni 100 trovati.',
    },
    solution: {
      en: 'Exact: 0.4837; 5.90 of hers and 23.61 of the others\'; 70.49. Run no. 1 shows 0.4843 ± 0.0013, 5.89 and 23.65, 70.46: within the errors.',
      it: 'Esatti: 0,4837; 5,90 dei suoi e 23,61 degli altri; 70,49. La prova n. 1 mostra 0,4843 ± 0,0013, 5,89 e 23,65, 70,46: entro gli errori.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Panel B. α = 0.4, γ = 0: her income before and after the first adjustment as a share of the honest income, the day of the adjustment, the break-even day.',
      it: 'Su carta, poi nel Pannello B. α = 0,4, γ = 0: il suo reddito prima e dopo il primo aggiustamento rispetto al reddito onesto, il giorno dell\'aggiustamento, il giorno in cui va in pari.',
    },
    solution: {
      en: 'G = 43/61, so r_A = R·G = 0.3410: before, r_A/α = 85.25%; after, R/α = 120.93%. The first 2016 chain blocks take 14/G = 19.86 days. Break-even: T₁(R − r_A)/(R − α) = 33.86 days.',
      it: 'G = 43/61, quindi r_A = R·G = 0,3410: prima, r_A/α = 85,25%; dopo, R/α = 120,93%. I primi 2016 blocchi della catena richiedono 14/G = 19,86 giorni. In pari: T₁(R − r_A)/(R − α) = 33,86 giorni.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Panel B. α = 0.3, γ = 1: why does she break even on the very day of the first adjustment?',
      it: 'Su carta, poi nel Pannello B. α = 0,3, γ = 1: perché va in pari proprio il giorno del primo aggiustamento?',
    },
    solution: {
      en: 'With γ = 1 she wins every race, so she never loses a block: r_A = α, and before the adjustment she earns exactly the honest income (100.00%). After it she earns R/α = 1.2687 times as much, so from that day on (17.76) she is ahead.',
      it: 'Con γ = 1 vince ogni gara, quindi non perde mai un blocco: r_A = α, e prima dell\'aggiustamento incassa esattamente il reddito onesto (100,00%). Dopo incassa R/α = 1,2687 volte tanto, quindi da quel giorno (17,76) è avanti.',
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In Panel C. γ = 0, α = 0.35: the share of Eyal and Sirer\'s strategy and of the best one, and the threshold.',
      it: 'Nel Pannello C. γ = 0, α = 0,35: la quota della strategia di Eyal e Sirer e di quella migliore, e la soglia.',
    },
    solution: {
      en: 'SM1: 0.3665. The best policy: 0.3708 (0.37077 in Sapirshtein et al., who truncate at 95 blocks instead of 40). The best deviation pays from α = 0.3294.',
      it: 'SM1: 0,3665. La politica ottima: 0,3708 (0,37077 in Sapirshtein e coautori, che troncano a 95 blocchi invece di 40). La deviazione migliore conviene da α = 0,3294.',
    },
  },
]
