// Module 02 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/game-theory-lab/nash-equilibrium.<lang>.md.
// Every number quoted here is pinned by scripts/lab/check-game-theory-02.mjs.

export const observe = {
  equilibria: {
    en: `
1. The panel opens on a 3 × 3 table with no equilibrium. Click the cell (1, A) and press **Walk**: the players make six moves and the last four are a cycle, (3, B), (2, B), (2, C), (3, C) and round again. From every cell of this table the walk ends in that cycle.
2. Press **New game**. Table no. 2 has one equilibrium, (1, A), and iterated elimination leaves that cell alone. From every cell the walk ends there, in at most 3 moves.
3. Load the **stag hunt**. It has two equilibria. A walk that starts in the first column ends at (Stag, Stag), one that starts in the second at (Hare, Hare): the row player moves first, so the starting column decides. Then load **matching pennies**: no equilibrium, and from every cell a cycle through all four.
4. Set G to 20,000 and press **Survey**. The mean number of equilibria stays within 0.01 of 1 at every size. The share of games with none rises from 0.125 at m = 2 to 0.322 at m = 8, where 0.053 of the games have three or more.
5. Read the last two columns. The share of walks that end at an equilibrium falls from 0.875 to 0.523. Even among the games that have an equilibrium, at m = 8 only 0.771 of the walks find one: an equilibrium can be there and still be missed.
6. At 4 × 4, press **New game** a few times and compare the equilibria with what elimination leaves. Every equilibrium is inside it, and when one cell is left, that cell is the only equilibrium.
`,
    it: `
1. Il pannello si apre su una tabella 3 × 3 senza equilibri. Clicca la cella (1, A) e premi **Cammina**: i giocatori fanno sei mosse e le ultime quattro sono un ciclo, (3, B), (2, B), (2, C), (3, C) e poi da capo. Da ogni cella di questa tabella il cammino finisce in quel ciclo.
2. Premi **Nuovo gioco**. La tabella n. 2 ha un solo equilibrio, (1, A), e l'eliminazione iterata lascia soltanto quella cella. Da ogni cella il cammino finisce lì, in non più di 3 mosse.
3. Carica la **caccia al cervo**. Ha due equilibri. Un cammino che parte dalla prima colonna finisce in (Cervo, Cervo), uno che parte dalla seconda in (Lepre, Lepre): il giocatore di riga muove per primo, quindi decide la colonna di partenza. Poi carica **matching pennies**: nessun equilibrio, e da ogni cella un ciclo che passa per tutte e quattro.
4. Porta G a 20.000 e premi **Rassegna**. Il numero medio di equilibri resta entro 0,01 da 1 a ogni dimensione. La quota dei giochi senza equilibri sale da 0,125 per m = 2 a 0,322 per m = 8, dove 0,053 dei giochi ne hanno tre o più.
5. Leggi le ultime due colonne. La quota dei cammini che finiscono in un equilibrio scende da 0,875 a 0,523. Anche tra i giochi che hanno un equilibrio, per m = 8 solo 0,771 dei cammini ne trovano uno: un equilibrio può esserci e non essere trovato.
6. Con 4 × 4, premi qualche volta **Nuovo gioco** e confronta gli equilibri con ciò che lascia l'eliminazione. Ogni equilibrio sta lì dentro, e quando resta una sola cella, quella cella è l'unico equilibrio.
`,
  },
  conventions: {
    en: `
1. The run on the page starts with 0.70 of the population hunting the stag, which is above q* = 0.667, and yet after 9 sweeps everyone hunts hare. The tipping point of the rule is 0.732: a player who looks at ten others needs to see seven stag hunters, not six and two thirds.
2. Press **Scan the starting share**. The chance of ending with everyone hunting the stag is 0 up to x₀ = 0.60, then 0.140 at 0.70, 0.830 at 0.75 and 1 from 0.80. The population tips between 0.70 and 0.75, where the tipping point is.
3. Raise a to 6. Now q* = 0.400 and the stag is risk dominant. The tipping point is 0.361, below q*, because a sample with exactly 4 stag hunters in 10 is a tie and the player stays put. Scan again: 0.295 at x₀ = 0.35 and 0.980 at 0.40. The run from 0.70 that was lost before now ends with everyone hunting the stag.
4. Back at a = 4, change the sample size. With k = 50 the tipping point is 0.704, closer to q*. With k = 5 it is 0.869: four in five is the least that exceeds two thirds. The less people see of each other, the more the safe convention is favoured.
5. Set N to 1,000, with k = 10, and scan: the step is sharper, 0.005 at x₀ = 0.70 and 0.920 at 0.75. In a large population luck counts for less, and the side of the tipping point on which it starts decides.
`,
    it: `
1. La prova sulla pagina parte con 0,70 della popolazione che caccia il cervo, cioè sopra q* = 0,667, eppure dopo 9 passate tutti cacciano la lepre. Il punto di svolta della regola è 0,732: chi guarda altri dieci deve vedere sette cacciatori di cervo, non sei e due terzi.
2. Premi **Esplora la quota iniziale**. La probabilità di finire con tutti al cervo è 0 fino a x₀ = 0,60, poi 0,140 per 0,70, 0,830 per 0,75 e 1 da 0,80 in su. La popolazione si ribalta tra 0,70 e 0,75, dove sta il punto di svolta.
3. Alza a fino a 6. Ora q* = 0,400 e il cervo è dominante nel rischio. Il punto di svolta è 0,361, sotto q*, perché un campione con esattamente 4 cacciatori di cervo su 10 è un pareggio e il giocatore non cambia. Esplora di nuovo: 0,295 per x₀ = 0,35 e 0,980 per 0,40. La prova da 0,70 che prima era persa ora finisce con tutti al cervo.
4. Torna ad a = 4 e cambia l'ampiezza del campione. Con k = 50 il punto di svolta è 0,704, più vicino a q*. Con k = 5 è 0,869: quattro su cinque è il minimo che supera i due terzi. Meno le persone vedono le une delle altre, più è favorita la convenzione sicura.
5. Porta N a 1.000, con k = 10, ed esplora: il gradino è più netto, 0,005 per x₀ = 0,70 e 0,920 per 0,75. In una popolazione grande la fortuna conta meno, e decide il lato del punto di svolta da cui si parte.
`,
  },
  contest: {
    en: `
1. With **Equal costs**, move n. The total effort is 50.00, 80.00 and 90.00 for n = 2, 5 and 10, out of a prize of 100, and each player's profit falls from 25.00 to 4.00 and to 1.00. More rivals, more of the prize spent.
2. At n = 10 press **One at a time**. The total falls from 99.0 to 88.9 in the first round, and after 30 rounds it is within a millionth of 90: the players find the equilibrium by themselves.
3. Now press **All at once**. With n = 2 and n = 3 it settles as well. With n = 4 the total keeps swinging between about 82 and 67 (82.5, 67.1, 82.4, 67.2…). With n = 5 the swings grow until the total jumps between less than 10 and more than 115. With n = 10 the second round overshoots to 213.8 and then everyone's best response is to stay out (99.0, 52.9, 213.8, 0.0). They never come back: when nobody else is in, the rule of the panel says 0, although any tiny effort would win the prize.
4. Load **Miners**. Four stay in, with shares of 37.5%, 31.3%, 25.0% and 6.3%; the total effort is 62.50 and 69.53 of the prize is spent. The player with cost 2.0 stays out. A cost one half higher than the cheapest leaves a share six times smaller.
5. Still with the miners, compare the two buttons: "One at a time" has settled by the fifth round, "All at once" is still swinging after 30. Then move the prize to 50: every effort halves and no share changes.
6. Load **One 10% cheaper** with n = 10. The cheaper player has 18.2% of the chances and each of the others 9.1%: a cost one tenth lower gives twice the share. The total effort is 90.91.
`,
    it: `
1. Con **Costi uguali**, muovi n. Lo sforzo totale è 50,00, 80,00 e 90,00 per n = 2, 5 e 10, su un premio di 100, e il profitto di ciascuno scende da 25,00 a 4,00 e a 1,00. Più rivali, più premio speso.
2. Con n = 10 premi **Uno alla volta**. Il totale scende da 99,0 a 88,9 al primo turno, e dopo 30 turni è entro un milionesimo da 90: i giocatori trovano l'equilibrio da soli.
3. Ora premi **Tutti insieme**. Con n = 2 e n = 3 si assesta anche così. Con n = 4 il totale continua a oscillare tra circa 82 e 67 (82,5, 67,1, 82,4, 67,2…). Con n = 5 le oscillazioni crescono finché il totale salta tra meno di 10 e più di 115. Con n = 10 il secondo turno schizza a 213,8 e a quel punto la risposta migliore di tutti è restare fuori (99,0, 52,9, 213,8, 0,0). Non rientrano più: quando nessun altro è in gara la regola del pannello dice 0, anche se uno sforzo minimo basterebbe a vincere il premio.
4. Carica **Miner**. Restano in quattro, con quote del 37,5%, 31,3%, 25,0% e 6,3%; lo sforzo totale è 62,50 e si spende 69,53 del premio. Il giocatore con costo 2,0 resta fuori. Un costo più alto della metà rispetto al meno caro lascia una quota sei volte più piccola.
5. Sempre con i miner, confronta i due pulsanti: «Uno alla volta» si è assestato al quinto turno, «Tutti insieme» oscilla ancora dopo 30. Poi porta il premio a 50: ogni sforzo si dimezza e nessuna quota cambia.
6. Carica **Uno costa il 10% in meno** con n = 10. Il giocatore meno caro ha il 18,2% delle probabilità e ciascuno degli altri il 9,1%: un costo più basso di un decimo dà una quota doppia. Lo sforzo totale è 90,91.
`,
  },
}

const EX1_TABLE = `
| | L | C | R |
|---|---|---|---|
| **U** | 0, 7 | 8, 8 | 8, 3 |
| **M** | 7, 4 | 3, 2 | 3, 1 |
| **D** | 2, 0 | 9, 2 | 9, 8 |
`

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: `The row player chooses U, M or D and the column player L, C or R; each cell gives the row player's payoff first.
${EX1_TABLE}
Delete what is strictly dominated. Find every equilibrium by checking each cell that is left. Where does the walk of Simulation A end if it starts at (U, L), and at (U, C)? Which equilibrium is better for both?`,
      it: `Il giocatore di riga sceglie U, M o D e quello di colonna L, C o R; in ogni cella il primo numero è il payoff del giocatore di riga.
${EX1_TABLE}
Cancella ciò che è strettamente dominato. Trova tutti gli equilibri controllando ogni cella rimasta. Dove finisce il cammino della Simulazione A se parte da (U, L), e da (U, C)? Quale equilibrio è migliore per entrambi?`,
    },
    solution: {
      en: 'Only U goes: D beats it in every column (2 > 0, 9 > 8, 9 > 8). After that nothing is dominated. Of the six cells left, two are equilibria: (M, L), with payoffs 7 and 4, and (D, R), with payoffs 9 and 8. In (M, C) and (M, R) the column player would move to L; in (D, L) the row player would move to M; in (D, C) the column player would move to R. From (U, L) the row player moves to M and the walk stops at (M, L). From (U, C) the row player moves to D, the walk is at (D, C), then the column player moves to R and it stops at (D, R). (D, R) is better for both, 9 and 8 against 7 and 4: where the players end up depends on where they start, not on what is best.',
      it: 'Esce solo U: D la batte in ogni colonna (2 > 0, 9 > 8, 9 > 8). Dopo, nulla è dominato. Delle sei celle rimaste, due sono equilibri: (M, L), con payoff 7 e 4, e (D, R), con payoff 9 e 8. In (M, C) e (M, R) il giocatore di colonna passerebbe a L; in (D, L) il giocatore di riga passerebbe a M; in (D, C) il giocatore di colonna passerebbe a R. Da (U, L) il giocatore di riga passa a M e il cammino si ferma in (M, L). Da (U, C) il giocatore di riga passa a D, il cammino è in (D, C), poi il giocatore di colonna passa a R e ci si ferma in (D, R). (D, R) è migliore per entrambi, 9 e 8 contro 7 e 4: dove i giocatori finiscono dipende da dove partono, non da che cosa è meglio.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Derive q* for the stag hunt with payoffs a (both stag), b (stag alone), c (hare while the other hunts the stag) and d (both hare). With b = 0, c = 3 and d = 2, what is q* for a = 4, 5 and 6? For which values of a is hunting the stag risk dominant?',
      it: "Ricava q* per la caccia al cervo con payoff a (entrambi al cervo), b (al cervo da soli), c (alla lepre mentre l'altro caccia il cervo) e d (entrambi alla lepre). Con b = 0, c = 3 e d = 2, quanto vale q* per a = 4, 5 e 6? Per quali valori di a cacciare il cervo è dominante nel rischio?",
    },
    solution: {
      en: 'If the other hunts the stag with probability q, the stag pays a q + b (1 − q) and the hare c q + d (1 − q). They are equal when q (a − c) = (1 − q)(d − b), that is at q* = (d − b)/((a − c) + (d − b)); above q* the stag pays more. With b = 0, c = 3, d = 2: q* = 2/(a − 1), so 2/3, 1/2 and 2/5 for a = 4, 5 and 6. The stag is risk dominant when it needs less confidence than the hare, q* < 1/2, which means a − c > d − b: here, a above 5. At a = 5 neither is.',
      it: "Se l'altro caccia il cervo con probabilità q, il cervo dà a q + b (1 − q) e la lepre c q + d (1 − q). Sono uguali quando q (a − c) = (1 − q)(d − b), cioè per q* = (d − b)/((a − c) + (d − b)); sopra q* il cervo dà di più. Con b = 0, c = 3, d = 2: q* = 2/(a − 1), quindi 2/3, 1/2 e 2/5 per a = 4, 5 e 6. Il cervo è dominante nel rischio quando richiede meno fiducia della lepre, q* < 1/2, cioè a − c > d − b: qui, a sopra 5. Per a = 5 non lo è nessuno dei due.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: "Cournot's two firms with a = 10 and c = 1. Find the best response, the equilibrium quantities, the price and the profits. The two firms agree to share the monopoly output: quantities, price, profit of each. What is one firm's best response to that, and what does each earn then? Finally, the price with n = 1, 2, 5, 10 and 100 firms.",
      it: "Le due imprese di Cournot con a = 10 e c = 1. Trova la risposta migliore, le quantità di equilibrio, il prezzo e i profitti. Le due imprese si accordano per dividersi la produzione di monopolio: quantità, prezzo, profitto di ciascuna. Qual è la risposta migliore di un'impresa a questo accordo, e quanto guadagna allora ciascuna? Infine, il prezzo con n = 1, 2, 5, 10 e 100 imprese.",
    },
    solution: {
      en: 'Firm i earns (10 − q_i − q_j − 1) q_i, largest at q_i = (9 − q_j)/2. The two lines cross at 3 each: price 4, profit (4 − 1) × 3 = 9 each. A monopolist would produce 4.5; shared, that is 2.25 each, price 5.5 and profit 10.125 each, more than 9. But the best response to 2.25 is (9 − 2.25)/2 = 3.375: the price falls to 4.375, the firm that breaks the agreement earns 11.39 and the one that keeps it 7.59. The cartel is not an equilibrium, and the equilibrium is worse for both firms than the cartel: a Prisoner\'s Dilemma between sellers. With n firms the price is (10 + n)/(n + 1): 5.5, 4, 2.5, 1.82 and 1.09.',
      it: "L'impresa i guadagna (10 − q_i − q_j − 1) q_i, massimo per q_i = (9 − q_j)/2. Le due rette si incrociano a 3 ciascuna: prezzo 4, profitto (4 − 1) × 3 = 9 ciascuna. Un monopolista produrrebbe 4,5; diviso in due fa 2,25 ciascuna, prezzo 5,5 e profitto 10,125 ciascuna, più di 9. Ma la risposta migliore a 2,25 è (9 − 2,25)/2 = 3,375: il prezzo scende a 4,375, l'impresa che rompe l'accordo guadagna 11,39 e quella che lo rispetta 7,59. Il cartello non è un equilibrio, e l'equilibrio è peggiore del cartello per entrambe le imprese: un dilemma del prigioniero tra venditori. Con n imprese il prezzo è (10 + n)/(n + 1): 5,5, 4, 2,5, 1,82 e 1,09.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: "Bertrand's two firms: each unit costs c, any price is allowed, the buyers go to the cheaper firm and split evenly when the prices are equal. Show that both charging c is an equilibrium, and that no other pair of prices is.",
      it: "Le due imprese di Bertrand: ogni unità costa c, qualunque prezzo è ammesso, i compratori vanno dall'impresa meno cara e si dividono a metà quando i prezzi sono uguali. Mostra che entrambe al prezzo c è un equilibrio, e che nessun'altra coppia di prezzi lo è.",
    },
    solution: {
      en: 'Both at c: each earns nothing, and neither can do better alone, because a higher price sells nothing and a lower one sells at a loss. Now any other pair. If the lower price is below c, that firm sells at a loss and would rather raise its price. If both prices are above c, the firm with the higher price (either firm, if they are equal) gains by going just below the other: it takes the whole market at almost the same margin. If one price is exactly c and the other is above, the firm at c earns nothing and gains by raising its price a little, staying below its rival. Every case has a firm that wants to move, so (c, c) is the only equilibrium. The argument needs prices that can be changed by as little as one likes: with whole cents, both charging a cent or two above the cost is an equilibrium too.',
      it: "Entrambe a c: ciascuna non guadagna nulla, e nessuna può fare meglio da sola, perché un prezzo più alto non vende nulla e uno più basso vende in perdita. Ora qualunque altra coppia. Se il prezzo più basso è sotto c, quell'impresa vende in perdita e preferirebbe alzarlo. Se entrambi i prezzi sono sopra c, l'impresa con il prezzo più alto (una qualsiasi, se sono uguali) ci guadagna a scendere appena sotto l'altra: prende tutto il mercato con quasi lo stesso margine. Se un prezzo è esattamente c e l'altro è più alto, l'impresa a c non guadagna nulla e ci guadagna ad alzare un po' il prezzo, restando sotto la rivale. In ogni caso c'è un'impresa che vuole spostarsi, quindi (c, c) è l'unico equilibrio. L'argomento richiede prezzi che si possano cambiare di quanto poco si vuole: con i centesimi interi, è un equilibrio anche che entrambe chiedano uno o due centesimi più del costo.",
    },
  },
  {
    type: 'both',
    statement: {
      en: 'A contest with n equal players and a cost of 1 per unit of effort. A player who spends x against a total Y of the others expects V x/(x + Y) − x. From the condition that x maximises it, with Y = (n − 1) x in a symmetric equilibrium, find the effort, the total and each player\'s profit; give the values for V = 100 and n = 2, 5 and 10. Then load the "Miners" preset of Simulation C: check the shares with the formula of the lecture. What cost would let the fifth miner in? What happens to efforts and shares if the prize halves?',
      it: "Una gara con n giocatori uguali e un costo di 1 per unità di sforzo. Un giocatore che spende x contro un totale Y degli altri si aspetta V x/(x + Y) − x. Dalla condizione che x lo renda massimo, con Y = (n − 1) x in un equilibrio simmetrico, trova lo sforzo, il totale e il profitto di ciascuno; calcola i valori per V = 100 e n = 2, 5 e 10. Poi carica il preset «Miner» della Simulazione C: verifica le quote con la formula della lezione. Quale costo farebbe entrare il quinto miner? Che cosa succede a sforzi e quote se il premio si dimezza?",
    },
    solution: {
      en: 'The derivative of V x/(x + Y) − x is V Y/(x + Y)² − 1. Setting it to zero with Y = (n − 1) x and x + Y = n x gives V (n − 1)/(n² x) = 1, so x = V (n − 1)/n². The total is V (n − 1)/n: 50, 80 and 90. Each wins with probability 1/n, so the profit is V/n − x = V/n²: 25, 4 and 1. Miners: the four cheapest costs add up to 4.8, so the shares are 1 − c × 3/4.8: 0.375, 0.3125, 0.25 and 0.0625, which sum to 1. The total effort is 100 × 3/4.8 = 62.5, and 69.5 of the prize is spent, 100 × (1 − 0.3047). The fifth miner, with cost 2.0, would have a negative share with five in (1 − 2 × 4/6.8), so it stays out. It enters when its cost is below (4.8 + c)/4, that is below 1.6. With a prize of 50 the total effort is 31.25: every effort halves and the shares, which do not contain V, stay the same.',
      it: "La derivata di V x/(x + Y) − x è V Y/(x + Y)² − 1. Posta uguale a zero con Y = (n − 1) x e x + Y = n x dà V (n − 1)/(n² x) = 1, quindi x = V (n − 1)/n². Il totale è V (n − 1)/n: 50, 80 e 90. Ciascuno vince con probabilità 1/n, quindi il profitto è V/n − x = V/n²: 25, 4 e 1. Miner: i quattro costi più bassi sommano 4,8, quindi le quote sono 1 − c × 3/4,8: 0,375, 0,3125, 0,25 e 0,0625, che sommano 1. Lo sforzo totale è 100 × 3/4,8 = 62,5, e si spende 69,5 del premio, 100 × (1 − 0,3047). Il quinto miner, con costo 2,0, avrebbe una quota negativa con cinque in gara (1 − 2 × 4/6,8), quindi resta fuori. Entra quando il suo costo è sotto (4,8 + c)/4, cioè sotto 1,6. Con un premio di 50 lo sforzo totale è 31,25: ogni sforzo si dimezza e le quote, che non contengono V, restano uguali.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'Simulation A, "Survey" with 20,000 games: what is the mean number of equilibria at each size, what share of games has none at m = 2 and at m = 8, and what share of walks ends at an equilibrium? Simulation B, "Scan the starting share": where is the tipping point with the default payoffs and with a = 6, and why is it not exactly q*? Simulation C: for which n does "All at once" settle?',
      it: 'Simulazione A, «Rassegna» con 20.000 giochi: qual è il numero medio di equilibri a ogni dimensione, quale quota dei giochi non ne ha per m = 2 e per m = 8, e quale quota dei cammini finisce in un equilibrio? Simulazione B, «Esplora la quota iniziale»: dov\'è il punto di svolta con i payoff predefiniti e con a = 6, e perché non è esattamente q*? Simulazione C: per quali n «Tutti insieme» si assesta?',
    },
    solution: {
      en: 'A: the mean is within 0.01 of 1 at every size, as the argument of the lecture says. The share with no equilibrium is 0.125 at m = 2 and 0.322 at m = 8. The share of walks that end at an equilibrium is 0.875 at m = 2 and 0.523 at m = 8; at m = 2 it is exactly the share of games that have one. Other samples of 20,000 games give values within about 0.01 of these. B: the tipping points are 0.732 and 0.361, against q* of 0.667 and 0.4. A sample of ten cannot show 0.667: the player needs 7 in 10, which pushes the tipping point up. At a = 6 a sample with exactly 4 in 10 is a tie and the player keeps doing the same, which pulls it down. C: with equal costs "All at once" settles for n = 2 and n = 3, keeps swinging at n = 4 and blows up from n = 5 on. Near the equilibrium each round multiplies the distance from it by (2 − n)/2: 0, −1/2, −1, −3/2…',
      it: "A: la media è entro 0,01 da 1 a ogni dimensione, come dice l'argomento della lezione. La quota senza equilibri è 0,125 per m = 2 e 0,322 per m = 8. La quota dei cammini che finiscono in un equilibrio è 0,875 per m = 2 e 0,523 per m = 8; per m = 2 è esattamente la quota dei giochi che ne hanno uno. Altri campioni di 20.000 giochi danno valori entro circa 0,01 da questi. B: i punti di svolta sono 0,732 e 0,361, contro q* di 0,667 e 0,4. Un campione di dieci non può mostrare 0,667: al giocatore servono 7 su 10, e questo spinge in alto il punto di svolta. Con a = 6 un campione con esattamente 4 su 10 è un pareggio e il giocatore continua a fare lo stesso, e questo lo tira in basso. C: con costi uguali «Tutti insieme» si assesta per n = 2 e n = 3, continua a oscillare per n = 4 e diverge da n = 5 in poi. Vicino all'equilibrio ogni turno moltiplica la distanza dall'equilibrio per (2 − n)/2: 0, −1/2, −1, −3/2…",
    },
  },
]
