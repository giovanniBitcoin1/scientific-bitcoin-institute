// Module 10 texts outside the lecture: "What to observe" for each panel and
// the exercises. Every number is pinned by scripts/lab/check-game-theory-10.mjs
// ("quoted on the page").

export const observe = {
  coalitions: {
    en: `
1. The simulation opens on **the partners**. The Shapley value, averaged over the 6 orders, is 125/3, 95/3 and 80/3. The game is superadditive but not convex: C adds 40 to B alone and only 30 to A and B together. The linear programme's minimum is 85, below v(N) = 100, so the core is nonempty; the core point it finds is (50, 30, 20), and the Shapley value is in the core too.
2. Choose **Partners, v(AB) = 90**: the Shapley value becomes 45, 35 and 20, and the simulation says A and B would get 10 more on their own. The core is still nonempty (minimum 95), but the Shapley value is outside it.
3. Choose **Majority** with 3, 4 and 5 players: everyone gets 1/3, 1/4, 1/5, and the core is empty each time (minimum 3/2, 4/3, 5/3, all above 1). The least core needs ε = 1/3, 1/4 and 2/5: with five players the best one can do still leaves some three players 2/5 short.
4. Choose **Gloves L L R**: 1/6, 1/6 and 2/3, while the only core point is (0, 0, 1); in the triangle the core is the corner of player 3. With **Gloves L L R R R** the scarce side is now the left: 13/20 for each left glove, 7/30 for each right one, and the core point is (1, 1, 0, 0, 0).
5. Choose **Airport**: the Shapley cost shares are 10/3, 35/6 and 125/6, the savings game (v(N) = 25) is convex, and the Shapley division is in the core: no group of planes pays more than it would alone.
6. Choose **Unanimity of 1 and 2** with 3, 4 or 5 players: 1/2 for 1 and 2, and 0 for everyone else, who are null players. Edit any cell to make your own game: the tests run again at every change.
`,
    it: `
1. La simulazione si apre sui **soci**. Il valore di Shapley, come media sui 6 ordini, è 125/3, 95/3 e 80/3. Il gioco è superadditivo ma non convesso: C aggiunge 40 al solo B e solo 30 ad A e B insieme. Il minimo del programma lineare è 85, sotto v(N) = 100, quindi il nucleo è non vuoto; il punto del nucleo che il programma trova è (50, 30, 20), e anche il valore di Shapley è nel nucleo.
2. Scegli **Soci, v(AB) = 90**: il valore di Shapley diventa 45, 35 e 20, e la simulazione dice che A e B avrebbero 10 in più da soli. Il nucleo è ancora non vuoto (minimo 95), ma il valore di Shapley ne resta fuori.
3. Scegli **Maggioranza** con 3, 4 e 5 giocatori: ognuno riceve 1/3, 1/4, 1/5, e il nucleo è vuoto ogni volta (minimo 3/2, 4/3, 5/3, tutti sopra 1). Il *least core* richiede ε = 1/3, 1/4 e 2/5: con cinque giocatori il meglio che si può fare lascia comunque una coalizione di tre giocatori 2/5 sotto il suo valore.
4. Scegli **Guanti S S D**: 1/6, 1/6 e 2/3, mentre l'unico punto del nucleo è (0, 0, 1); nel triangolo il nucleo è il vertice del giocatore 3. Con **Guanti S S D D D** il lato scarso è ora quello sinistro: 13/20 a ogni guanto sinistro, 7/30 a ogni destro, e il punto del nucleo è (1, 1, 0, 0, 0).
5. Scegli **Aeroporto**: le quote di costo di Shapley sono 10/3, 35/6 e 125/6, il gioco dei risparmi (v(N) = 25) è convesso, e la divisione di Shapley è nel nucleo: nessun gruppo di aerei paga più di quanto pagherebbe da solo.
6. Scegli **Unanimità di 1 e 2** con 3, 4 o 5 giocatori: 1/2 a 1 e 2, e 0 a tutti gli altri, che sono giocatori nulli. Modifica una cella qualsiasi per costruire un tuo gioco: i test ripartono a ogni modifica.
`,
  },
  voting: {
    en: `
1. The simulation opens on the **1958 Council** at quota 12: Shapley–Shubik 0.2333 for each large member, 0.1500 for Belgium and the Netherlands, 0.0000 for Luxembourg; Banzhaf 0.2381, 0.1429 and 0; absolute Banzhaf 0.3125, 0.1875 and 0. Three of the largest members reach the quota, and there are 42 swings in all.
2. Choose **49–49–2**: 0.3333 for each party on both indices, with 49%, 49% and 2% of the seats.
3. Choose **Pools (illustrative)** at quota 51: the 26% pool has 0.3030 (Shapley–Shubik) and 0.3322 (Banzhaf); each 19% pool 0.2031 and 0.2209; each 8% pool 0.0584 and 0.0579; each 1% pool 0.0087 and 0.0055. Three of the largest pools reach the quota.
4. Try the other quotas. At **26** the largest pool wins alone and has 0.3673; at **34** and **67** the indices are the same (0.2820, 0.1743, 0.0895, 0.0095), because the two games are dual: a coalition wins at 67 exactly when the others do not reach 34. It takes 1, 2, 3 and 4 of the largest pools at 26, 34, 51 and 67.
5. Back at 51, press **Split the largest**: the 26% pool becomes two of 13%, with 0.1293 each, 0.2586 together, against 0.3030 before. The 19% pools rise to 0.2047.
`,
    it: `
1. La simulazione si apre sul **Consiglio del 1958** con quota 12: Shapley–Shubik 0,2333 per ogni membro grande, 0,1500 per Belgio e Paesi Bassi, 0,0000 per il Lussemburgo; Banzhaf 0,2381; 0,1429 e 0; Banzhaf assoluto 0,3125; 0,1875 e 0. Tre dei membri più grandi raggiungono la quota, e gli swing sono 42 in tutto.
2. Scegli **49–49–2**: 0,3333 per ogni partito con entrambi gli indici, con il 49%, il 49% e il 2% dei seggi.
3. Scegli **Pool (illustrativi)** con quota 51: il pool del 26% ha 0,3030 (Shapley–Shubik) e 0,3322 (Banzhaf); ogni pool del 19% 0,2031 e 0,2209; ogni pool dell'8% 0,0584 e 0,0579; ogni pool dell'1% 0,0087 e 0,0055. Tre dei pool più grandi raggiungono la quota.
4. Prova le altre quote. Con **26** il pool più grande vince da solo e ha 0,3673; con **34** e **67** gli indici sono gli stessi (0,2820; 0,1743; 0,0895; 0,0095), perché i due giochi sono duali: una coalizione vince con 67 esattamente quando i giocatori esclusi non arrivano a 34. Servono 1, 2, 3 e 4 dei pool più grandi con 26, 34, 51 e 67.
5. Di nuovo a quota 51, premi **Dividi il più grande**: il pool del 26% diventa due pool del 13%, con 0,1293 ciascuno, 0,2586 insieme, contro 0,3030 prima. I pool del 19% salgono a 0,2047.
`,
  },
  estate: {
    en: `
1. The simulation opens on claims 100, 200 and 300 and an estate of 200. The Talmud gives 50, 75, 75; proportional division 33.33, 66.67, 100.00; equal awards 66.67 each; equal losses 0.00, 50.00, 150.00; Shapley 33.33, 83.33, 83.33.
2. Press the estates **100** and **300**: the Talmud gives 33.33 each, then 50, 100, 150. At 100 it agrees with equal awards, at 300 with proportional division and with Shapley.
3. With the Talmud's rule chosen, move E from 0 to 600 and watch the first creditor: her award stops at 50, half her claim, from E = 150 to E = 450, while the others go on; only past 450 does it rise again, to 100 at 600.
4. At **E = 450** the Talmud gives 50, 150, 250, the same as equal losses, and Shapley 66.67, 141.67, 241.67. Above half of the total the Talmud's rule is equal losses on the half-claims; below, equal awards on them.
5. Choose **Proportional**: three straight lines. Choose **Equal awards**: everyone rises together until the smallest claim is paid in full. No rule but the Talmud's treats every pair of creditors as the contested garment does.
`,
    it: `
1. La simulazione si apre sui crediti 100, 200 e 300 con un'eredità di 200. Il Talmud dà 50, 75, 75; la divisione proporzionale (33,33; 66,67; 100,00); CEA 66,67 ciascuno; CEL (0,00; 50,00; 150,00); Shapley (33,33; 83,33; 83,33).
2. Premi le eredità **100** e **300**: il Talmud dà 33,33 ciascuno, poi 50, 100, 150. Con 100 coincide con CEA, con 300 con la divisione proporzionale e con Shapley.
3. Scelta la regola del Talmud, porta E da 0 a 600 e guarda il primo creditore: la sua somma si ferma a 50, metà del suo credito, da E = 150 a E = 450, mentre gli altri continuano; solo oltre 450 risale, fino a 100 con 600.
4. Con **E = 450** il Talmud dà 50, 150, 250, come CEL, e Shapley 66,67; 141,67; 241,67. Sopra la metà del totale la regola del Talmud è CEL sui mezzi crediti; sotto, CEA su di essi.
5. Scegli **Proporzionale**: tre rette. Scegli **CEA**: tutti salgono insieme finché il credito più piccolo non è pagato per intero. Nessuna regola tranne quella del Talmud tratta ogni coppia di creditori come fa il mantello conteso.
`,
  },
}

export const exercises = [
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Figure F1. The partners (v(AB) = 70, v(AC) = 60, v(BC) = 40, v(N) = 100): find the corners of the core and the Shapley value.',
      it: 'Su carta, poi nella Figura F1. I soci (v(AB) = 70, v(AC) = 60, v(BC) = 40, v(N) = 100): trova i vertici del nucleo e il valore di Shapley.',
    },
    solution: {
      en: 'The pair conditions cap the third partner: x_C ≤ 30, x_B ≤ 40, x_A ≤ 60. With x ≥ 0 and the shares adding to 100, the corners are (60, 40, 0), (60, 10, 30) and (30, 40, 30). The Shapley value is (200 + 70 + 60 − 80)/6 = 125/3 for A, (200 + 70 + 40 − 120)/6 = 95/3 for B and (200 + 60 + 40 − 140)/6 = 80/3 for C: 41.67, 31.67, 26.67, inside the core.',
      it: 'Le condizioni delle coppie pongono un tetto al terzo socio: x_C ≤ 30, x_B ≤ 40, x_A ≤ 60. Con x ≥ 0 e le quote di somma 100, i vertici sono (60, 40, 0), (60, 10, 30) e (30, 40, 30). Il valore di Shapley è (200 + 70 + 60 − 80)/6 = 125/3 per A, (200 + 70 + 40 − 120)/6 = 95/3 per B e (200 + 60 + 40 − 140)/6 = 80/3 per C: 41,67; 31,67; 26,67, dentro il nucleo.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Figure F1. Now v(AB) = 90: find the corners of the core, the Shapley value, and the coalition that objects to it.',
      it: 'Su carta, poi nella Figura F1. Ora v(AB) = 90: trova i vertici del nucleo, il valore di Shapley e la coalizione che lo contesta.',
    },
    solution: {
      en: 'Now x_C ≤ 10, x_B ≤ 40, x_A ≤ 60: the corners are (60, 40, 0), (60, 30, 10) and (50, 40, 10). The Shapley value is 45, 35 and 20. A and B object: together they get 80 and could make 90 on their own.',
      it: 'Ora x_C ≤ 10, x_B ≤ 40, x_A ≤ 60: i vertici sono (60, 40, 0), (60, 30, 10) e (50, 40, 10). Il valore di Shapley è 45, 35 e 20. A e B obiettano: insieme ricevono 80 e da soli potrebbero fare 90.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Suppose any two partners could make 100 without the third. Show that the core is empty. What if every pair makes 80? And 60?',
      it: 'Supponi che due soci qualsiasi possano fare 100 senza il terzo. Mostra che il nucleo è vuoto. E se ogni coppia fa 80? E 60?',
    },
    solution: {
      en: 'Adding the three pair conditions gives 2(x_A + x_B + x_C) ≥ 300, that is 200 ≥ 300: impossible. With 80, 200 ≥ 240: still impossible. With 60, 200 ≥ 180, and the core is the triangle with corners (40, 40, 20), (40, 20, 40) and (20, 40, 40).',
      it: 'Sommando le tre condizioni delle coppie si ottiene 2(x_A + x_B + x_C) ≥ 300, cioè 200 ≥ 300: impossibile. Con 80, 200 ≥ 240: ancora impossibile. Con 60, 200 ≥ 180, e il nucleo è il triangolo con vertici (40, 40, 20), (40, 20, 40) e (20, 40, 40).',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Simulation A. The glove market (players 1 and 2 own a left glove, player 3 a right one; a pair is worth 1): find the Shapley value and the core.',
      it: 'Su carta, poi nella Simulazione A. Il gioco dei guanti (i giocatori 1 e 2 hanno un guanto sinistro, il 3 uno destro; un paio vale 1): trova il valore di Shapley e il nucleo.',
    },
    solution: {
      en: 'Player 3 adds 1 whenever she arrives after at least one left glove: in 4 of the 6 orders, so 2/3. Players 1 and 2 split the rest, 1/6 each. In the core, x_1 + x_3 ≥ 1 and x_2 + x_3 ≥ 1 with x_1 + x_2 + x_3 = 1 give x_2 ≤ 0 and x_1 ≤ 0: the only division is (0, 0, 1).',
      it: 'Il giocatore 3 aggiunge 1 ogni volta che arriva dopo almeno un guanto sinistro: in 4 dei 6 ordini, quindi 2/3. I giocatori 1 e 2 si dividono il resto, 1/6 ciascuno. Nel nucleo, x_1 + x_3 ≥ 1 e x_2 + x_3 ≥ 1 con x_1 + x_2 + x_3 = 1 danno x_2 ≤ 0 e x_1 ≤ 0: l\'unica divisione è (0, 0, 1).',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Figure F2. The 1958 Council (4, 4, 4, 2, 2, 1, quota 12): find the Shapley–Shubik indices and explain why Luxembourg\'s is 0. What changes at quota 13?',
      it: 'Su carta, poi nella Figura F2. Il Consiglio del 1958 (4, 4, 4, 2, 2, 1, quota 12): trova gli indici di Shapley–Shubik e spiega perché quello del Lussemburgo è 0. Che cosa cambia con la quota 13?',
    },
    solution: {
      en: 'At 12: 7/30 for each large member, 3/20 for each 2-vote member, 0 for Luxembourg. Every other weight and the quota are even, so a group without Luxembourg has an even total, and adding 1 never turns a losing total into a winning one: she is never the pivot. At 13 she is: 13/60 for each large member and 7/60 for each small one, Luxembourg included.',
      it: 'Con 12: 7/30 per ogni membro grande, 3/20 per ogni membro con 2 voti, 0 per il Lussemburgo. Tutti gli altri pesi e la quota sono pari, quindi un gruppo senza il Lussemburgo ha un totale pari, e aggiungere 1 non trasforma mai un totale perdente in uno vincente: non è mai il pivot. Con 13 lo è: 13/60 per ogni membro grande e 7/60 per ogni membro piccolo, Lussemburgo compreso.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Simulation C. Claims 100, 200 and 300, estate 200: find the Talmud\'s division, proportional division, constrained equal awards and the Shapley value.',
      it: 'Su carta, poi nella Simulazione C. Crediti 100, 200 e 300, eredità 200: trova la divisione del Talmud, la divisione proporzionale, la regola CEA (constrained equal awards) e il valore di Shapley.',
    },
    solution: {
      en: 'The estate is below half the total (300), so the Talmud divides equal awards on the half-claims 50, 100, 150: 50, 75, 75. Proportional: 200/600 of each claim, 33.33, 66.67, 100. Equal awards: 66.67 each, below every claim. Shapley: in the six orders the first creditor gets 100 twice and 0 four times, the others 200, 200, 100, 0, 0, 0: 33.33, 83.33, 83.33.',
      it: 'L\'eredità è sotto la metà del totale (300), quindi il Talmud applica CEA ai mezzi crediti 50, 100, 150: 50, 75, 75. Proporzionale: 200/600 di ogni credito, 33,33; 66,67; 100. CEA: 66,67 ciascuno, sotto ogni credito. Shapley: nei sei ordini il primo creditore riceve 100 due volte e 0 quattro volte, gli altri 200, 200, 100, 0, 0, 0: 33,33; 83,33; 83,33.',
    },
  },
]
