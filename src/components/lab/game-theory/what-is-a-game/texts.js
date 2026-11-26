// Module 01 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/game-theory-lab/what-is-a-game.<lang>.md.
// Every number quoted here is pinned by scripts/lab/check-game-theory-01.mjs.

export const observe = {
  explorer: {
    en: `
1. Load the **Prisoner's Dilemma**. C is strictly dominated for both players and elimination leaves (D, D). Now read the last box: (D, D) is the only cell that some other cell beats for both players.
2. Load the **stag hunt**, then **chicken**. Nothing is dominated and each has two stable cells: on the diagonal in the stag hunt, off it in chicken.
3. Load **matching pennies** and follow the underlined payoffs round the table: from every cell one of the two players wants to move. No stable cell.
4. Back in the Prisoner's Dilemma, raise the row player's payoff in (C, C) from 3 to 6. The row player no longer has a dominated strategy, yet the game is still solved at (D, D), in two steps: the column player's C goes first.
5. Press **Survey all games**. Of the 576 tables, 432 are solved by elimination and 72 have no stable cell. Counting as one game the tables that differ only in the names of the strategies, there are 144 games, and 78 if the players may also be swapped. Only 4 tables, which are one and the same game, are like the Prisoner's Dilemma.
`,
    it: `
1. Carica il **dilemma del prigioniero**. C è strettamente dominata per entrambi e l'eliminazione lascia (D, D). Ora leggi l'ultimo riquadro: (D, D) è l'unica cella che un'altra cella batte per entrambi i giocatori.
2. Carica la **caccia al cervo**, poi il **gioco del pollo**. Nulla è dominato e ciascuno ha due celle stabili: sulla diagonale nella caccia al cervo, fuori dalla diagonale nel gioco del pollo.
3. Carica il **pari o dispari** e segui i payoff sottolineati intorno alla tabella: da ogni cella uno dei due giocatori vuole spostarsi. Nessuna cella stabile.
4. Torna al dilemma del prigioniero e alza da 3 a 6 il payoff del giocatore di riga in (C, C). Il giocatore di riga non ha più una strategia dominata, eppure il gioco è ancora risolto in (D, D), in due passi: esce per prima la C del giocatore di colonna.
5. Premi **Passa in rassegna tutti i giochi**. Delle 576 tabelle, 432 sono risolte dall'eliminazione e 72 non hanno celle stabili. Contando come un solo gioco le tabelle che differiscono solo per i nomi delle strategie, i giochi sono 144, e 78 se si possono scambiare anche i giocatori. Solo 4 tabelle, che sono un unico gioco, sono come il dilemma del prigioniero.
`,
  },
  guessing: {
    en: `
1. The round on the page has mean 29.37 and target 19.58, and a level 2 player wins. Press **Play 1,000 times**: level 2 wins 917 times, level 0 57 times and level 3 26 times. Level 1 and the equilibrium players never win.
2. Read the last column. The players who say 0 are on average 19.9 away from the target, further than level 1 (13.5). Only the random guessers do worse (34.1).
3. Load **Deep thinkers**: the expected mean is 15.56 and the target 10.37. Level 3, which says about 9.9, wins every one of the 1,000 plays.
4. Load **Half at equilibrium**: the target is about 9.5 and no group stands near it. Level 0 wins 615 times and level 3 385 times.
5. Back to the default, press **10 more rounds**. Every round multiplies the mean by about 0.6 (29.4, 17.5, 10.4, 6.3, 3.7, 2.2, 1.3, 0.8) and it falls below 1 in round 8, with the noise or without it: from the second round the noise shrinks in proportion to the mean, so it never holds the fall back. With p = 0.90 the same fall takes 22 rounds, with p = 1/2 only 6, and the deep thinkers need 4.
6. With the default shares, set p to 0.90 and play 1,000 times: the target is close to 37 and levels 2 and 3 share the wins almost evenly, 468 and 474. With p = 1/2 level 2 wins 960 times.
`,
    it: `
1. Il turno sulla pagina ha media 29,37 e bersaglio 19,58, e vince un giocatore di livello 2. Premi **Gioca 1.000 volte**: il livello 2 vince 917 volte, il livello 0 57 volte e il livello 3 26 volte. Il livello 1 e i giocatori di equilibrio non vincono mai.
2. Leggi l'ultima colonna. Chi dice 0 è in media a 19,9 dal bersaglio, più lontano del livello 1 (13,5). Fa peggio solo chi sceglie a caso (34,1).
3. Carica **Pensatori profondi**: la media attesa è 15,56 e il bersaglio 10,37. Il livello 3, che dice circa 9,9, vince tutte le 1.000 partite.
4. Carica **Metà all'equilibrio**: il bersaglio è circa 9,5 e nessun gruppo gli sta vicino. Il livello 0 vince 615 volte e il livello 3 385 volte.
5. Torna ai valori predefiniti e premi **Altri 10 turni**. Ogni turno moltiplica la media per circa 0,6 (29,4; 17,5; 10,4; 6,3; 3,7; 2,2; 1,3; 0,8) e la media scende sotto 1 al turno 8, con il rumore o senza: dal secondo turno il rumore si riduce in proporzione alla media, quindi non frena mai la discesa. Con p = 0,90 la stessa discesa richiede 22 turni, con p = 1/2 solo 6, e ai pensatori profondi ne bastano 4.
6. Con le quote predefinite, porta p a 0,90 e gioca 1.000 volte: il bersaglio è vicino a 37 e i livelli 2 e 3 si dividono le vittorie quasi alla pari, 468 e 474. Con p = 1/2 il livello 2 vince 960 volte.
`,
  },
  dominance: {
    en: `
1. The simulation opens on 2,000 games of size 3 × 3: 0.788 have at least one dominated strategy, but only 0.430 are solved. Deleting something is common; deleting everything is not.
2. Set G to 20,000 and press **All sizes**. The share solved falls from 0.750 at m = 2 to 0.438, 0.207, 0.077, 0.021, 0.004 and 0.001 at m = 8.
3. On the same chart, the share with no stable cell rises from 0.125 to 0.322, and the share with exactly one falls from 0.750 to 0.419. At every size about two games in three, or more, have at least one stable cell.
4. At m = 8 elimination leaves on average 60.2 of the 64 cells: it hardly starts.
5. Step through the sample game, then press **Another game** a few times at m = 3. When the elimination stops half-way, count the stable cells of what is left.
`,
    it: `
1. La simulazione si apre su 2.000 giochi di dimensione 3 × 3: 0,788 hanno almeno una strategia dominata, ma solo 0,430 sono risolti. Cancellare qualcosa è frequente; cancellare tutto no.
2. Porta G a 20.000 e premi **Tutte le dimensioni**. La quota dei giochi risolti scende da 0,750 per m = 2 a 0,438; 0,207; 0,077; 0,021; 0,004 e 0,001 per m = 8.
3. Nello stesso grafico, la quota senza celle stabili sale da 0,125 a 0,322, e quella con esattamente una scende da 0,750 a 0,419. A ogni dimensione circa due giochi su tre, o più, hanno almeno una cella stabile.
4. Per m = 8 l'eliminazione lascia in media 60,2 delle 64 celle: quasi non comincia.
5. Percorri passo per passo il gioco di esempio, poi premi qualche volta **Un altro gioco** con m = 3. Quando l'eliminazione si ferma a metà, conta le celle stabili di ciò che resta.
`,
  },
}

const EX1_TABLE = `
| | L | C | R |
|---|---|---|---|
| **U** | 3, 2 | 1, 4 | 6, 1 |
| **M** | 5, 3 | 3, 5 | 2, 2 |
| **D** | 4, 6 | 2, 1 | 1, 4 |
`

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: `In this game the row player chooses U, M or D and the column player L, C or R; each cell gives the row player's payoff first.
${EX1_TABLE}
Which strategies are strictly dominated before anything is deleted? Carry the elimination to the end. Does the order of the deletions matter?`,
      it: `In questo gioco il giocatore di riga sceglie U, M o D e quello di colonna L, C o R; in ogni cella il primo numero è il payoff del giocatore di riga.
${EX1_TABLE}
Quali strategie sono strettamente dominate prima di qualunque cancellazione? Porta l'eliminazione fino in fondo. L'ordine delle cancellazioni conta?`,
    },
    solution: {
      en: 'Two: D, which M beats in every column (5 > 4, 3 > 2, 2 > 1), and R, which L beats in every row (2 > 1, 3 > 2, 6 > 4). Once D is gone, C beats L (4 > 2 and 5 > 3). Once R is gone, M beats U (5 > 3 and 3 > 1). What is left is the single cell (M, C), with payoffs 3 and 5. The order does not matter: start with D or with R, and the same cell is left.',
      it: 'Due: D, che M batte in ogni colonna (5 > 4, 3 > 2, 2 > 1), e R, che L batte in ogni riga (2 > 1, 3 > 2, 6 > 4). Tolta D, C batte L (4 > 2 e 5 > 3). Tolta R, M batte U (5 > 3 e 3 > 1). Resta la sola cella (M, C), con payoff 3 e 5. L\'ordine non conta: che si cominci da D o da R, resta la stessa cella.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Guess two thirds of the average. (a) What do levels 1 to 4 say? Which is the first level whose guess is below 1? And with p = 1/2 and with p = 0.9? (b) Now only whole numbers are allowed and the closest guesses share the prize. Show that "everyone says 1" is stable when there are at least five players: nobody gains by moving to 0 alone. What happens with four players, and with three?',
      it: 'Indovina i due terzi della media. (a) Che cosa dicono i livelli da 1 a 4? Qual è il primo livello che dice meno di 1? E con p = 1/2 e con p = 0,9? (b) Ora sono ammessi solo numeri interi e i più vicini si dividono il premio. Mostra che «tutti dicono 1» è stabile quando i giocatori sono almeno cinque: nessuno ci guadagna a passare a 0 da solo. Che cosa succede con quattro giocatori, e con tre?',
    },
    solution: {
      en: '(a) 50 × (2/3)^k gives 33.3, 22.2, 14.8 and 9.9. The first guess below 1 is that of level 10 (0.87; level 9 says 1.30). With p = 1/2 it is level 6 (0.78), and with p = 0.9 level 38 (0.91). (b) If one of N players moves to 0, the average is (N − 1)/N and the target (2/3)(N − 1)/N. The mover wins only if the target is nearer to 0 than to 1, that is below 1/2, which means N < 4. With N ≥ 5 the target is above 1/2: the others are closer and the mover gets nothing instead of a share of the prize. With N = 4 the target is exactly 1/2, everyone is equally close and the mover gets the same quarter as before: a tie. With N = 3 the target is 4/9, the mover is the closest and takes the whole prize: not stable. Moving up does not help either: whoever says 2 or more is always further from the target than the players who say 1.',
      it: '(a) 50 × (2/3)^k dà 33,3; 22,2; 14,8 e 9,9. Il primo numero sotto 1 è quello del livello 10 (0,87; il livello 9 dice 1,30). Con p = 1/2 è il livello 6 (0,78), e con p = 0,9 il livello 38 (0,91). (b) Se uno degli N giocatori passa a 0, la media è (N − 1)/N e il bersaglio (2/3)(N − 1)/N. Chi si sposta vince solo se il bersaglio è più vicino a 0 che a 1, cioè sotto 1/2, il che significa N < 4. Con N ≥ 5 il bersaglio è sopra 1/2: gli altri sono più vicini e chi si sposta non prende nulla, anziché una parte del premio. Con N = 4 il bersaglio è esattamente 1/2, tutti sono alla stessa distanza e chi si sposta prende lo stesso quarto di prima: un pareggio. Con N = 3 il bersaglio è 4/9, chi si sposta è il più vicino e prende tutto il premio: non è stabile. Nemmeno salire aiuta: chi dice 2 o più è sempre più lontano dal bersaglio di chi dice 1.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'With R = 1 and P = 0, name the game, say whether a strategy is dominant and list the stable cells for (T, S) = (1.5, −0.5), (0.5, −0.5), (1.5, 0.5) and (0.5, 0.5). Then check with the map of two-by-two games in the lecture.',
      it: 'Con R = 1 e P = 0, dai un nome al gioco, di\' se c\'è una strategia dominante ed elenca le celle stabili per (T, S) = (1,5; −0,5), (0,5; −0,5), (1,5; 0,5) e (0,5; 0,5). Poi verifica con la mappa dei giochi due per due nella lezione.',
    },
    solution: {
      en: "Against C a player gets 1 with C and T with D; against D, S with C and 0 with D. (1.5, −0.5): Prisoner's Dilemma; D is dominant (1.5 > 1 and 0 > −0.5); stable cell (D, D). (0.5, −0.5): stag hunt; no dominant strategy (C is the best response to C, D to D); stable cells (C, C) and (D, D). (1.5, 0.5): chicken; no dominant strategy (D is the best response to C, C to D); stable cells (C, D) and (D, C). (0.5, 0.5): harmony; C is dominant (1 > 0.5 and 0.5 > 0); stable cell (C, C).",
      it: 'Contro C un giocatore ottiene 1 con C e T con D; contro D, S con C e 0 con D. (1,5; −0,5): dilemma del prigioniero; D è dominante (1,5 > 1 e 0 > −0,5); cella stabile (D, D). (0,5; −0,5): caccia al cervo; nessuna strategia dominante (C è la miglior risposta a C, D a D); celle stabili (C, C) e (D, D). (1,5; 0,5): gioco del pollo; nessuna strategia dominante (D è la miglior risposta a C, C a D); celle stabili (C, D) e (D, C). (0,5; 0,5): armonia; C è dominante (1 > 0,5 e 0,5 > 0); cella stabile (C, C).',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Each player ranks the four cells of a two-by-two table from 1 to 4, with no ties. How many tables are there? Show that exactly half of one player\'s 24 rankings give that player a dominant strategy. In how many tables do both players have one, and in how many at least one of them? Why does a game in which neither has one have either two stable cells or none? Check the counts with "Survey all games" in Simulation A.',
      it: 'Ogni giocatore ordina le quattro celle di una tabella due per due da 1 a 4, senza pareggi. Quante sono le tabelle? Mostra che esattamente metà dei 24 ordinamenti di un giocatore gli dà una strategia dominante. In quante tabelle ne hanno una entrambi i giocatori, e in quante almeno uno dei due? Perché un gioco in cui nessuno ne ha una ha due celle stabili oppure nessuna? Verifica i conteggi con «Passa in rassegna tutti i giochi» nella Simulazione A.',
    },
    solution: {
      en: '24 × 24 = 576. The row player compares the two rows once in each column. A dominant strategy needs the same row to win both comparisons. By symmetry (swap the two rows in one column only) the two comparisons agree in exactly half of the 24 rankings: 12. So both players have a dominant strategy in 12 × 12 = 144 tables, neither in 144, and at least one in 576 − 144 = 432. Without a dominant strategy, each player\'s best response changes with the other\'s choice. Either both players want to match, or both to differ, in a suitable naming of the strategies: then the two cells of one diagonal are stable. Or one wants to match and the other to differ: then the best responses chase each other round the table and no cell is stable. The two cases split the 144 tables evenly, 72 and 72, and the survey shows 72 tables with two stable cells and 72 with none.',
      it: "24 × 24 = 576. Il giocatore di riga confronta le due righe una volta in ogni colonna. Una strategia dominante richiede che la stessa riga vinca entrambi i confronti. Per simmetria (si scambiano le due righe in una sola colonna) i due confronti danno lo stesso esito in esattamente metà dei 24 ordinamenti: 12. Quindi entrambi i giocatori hanno una strategia dominante in 12 × 12 = 144 tabelle, nessuno in 144, e almeno uno in 576 − 144 = 432. Senza strategia dominante, la miglior risposta di ciascuno cambia con la scelta dell'altro. O entrambi vogliono fare la stessa cosa dell'altro, o entrambi il contrario, con un'opportuna scelta dei nomi delle strategie: allora sono stabili le due celle di una diagonale. Oppure uno vuole fare la stessa cosa e l'altro il contrario: allora le migliori risposte si rincorrono intorno alla tabella e nessuna cella è stabile. I due casi si dividono le 144 tabelle a metà, 72 e 72, e la rassegna mostra 72 tabelle con due celle stabili e 72 senza.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In Simulation B, with the default shares (N = 1,000, p = 2/3, σ = 2): what are the mean and the target, and which kind wins most often over 1,000 plays? Then load "Deep thinkers" and "Half at equilibrium": who wins? Why can players who guess at random win so often in the last one?',
      it: 'Nella Simulazione B, con le quote predefinite (N = 1.000, p = 2/3, σ = 2): quali sono la media e il bersaglio, e quale tipo vince più spesso su 1.000 partite? Poi carica «Pensatori profondi» e «Metà all\'equilibrio»: chi vince? Perché nell\'ultimo caso vince così spesso chi sceglie a caso?',
    },
    solution: {
      en: 'Default: the expected mean is 29.81 and the target 19.88 (the 1,000 plays average 29.82 and 19.88). Level 2, which says about 22.2, wins 917 times, level 0 57 times and level 3 26 times. Deep thinkers: mean 15.56, target 10.37, and level 3 (about 9.9) wins all 1,000 plays. Half at equilibrium: mean 14.26, target 9.51; level 0 wins 615 times and level 3 385 times. No group stands close to that target: the 100 players of level 3 are spread around 14.8, about 5 away, and the 500 who say 0 are 9.5 away. Among 100 random guesses spread over 0 to 100, one often falls nearer to 9.5 than the best of level 3. A crowd that is random as a whole never wins on average, but one of its members often does.',
      it: "Valori predefiniti: la media attesa è 29,81 e il bersaglio 19,88 (le 1.000 partite danno in media 29,82 e 19,88). Il livello 2, che dice circa 22,2, vince 917 volte, il livello 0 57 volte e il livello 3 26 volte. Pensatori profondi: media 15,56, bersaglio 10,37, e il livello 3 (circa 9,9) vince tutte le 1.000 partite. Metà all'equilibrio: media 14,26, bersaglio 9,51; il livello 0 vince 615 volte e il livello 3 385 volte. Nessun gruppo sta vicino a quel bersaglio: i 100 giocatori di livello 3 sono sparsi intorno a 14,8, a circa 5 di distanza, e i 500 che dicono 0 sono a 9,5. Fra 100 numeri a caso sparsi tra 0 e 100, spesso uno cade più vicino a 9,5 del migliore del livello 3. Una folla che sceglie a caso non vince mai in media, ma spesso vince uno dei suoi membri.",
    },
  },
  {
    type: 'both',
    statement: {
      en: 'In Simulation C, with 20,000 games: what share of random games is solved by elimination for m = 2, 3, 4 and 6? Compare the value for m = 2 with exercise 4. And what share has no stable cell at m = 2 and at m = 8?',
      it: "Nella Simulazione C, con 20.000 giochi: quale quota dei giochi casuali è risolta dall'eliminazione per m = 2, 3, 4 e 6? Confronta il valore per m = 2 con l'esercizio 4. E quale quota non ha celle stabili per m = 2 e per m = 8?",
    },
    solution: {
      en: 'Solved: 0.750, 0.438, 0.207 and 0.021. At m = 2 the exact value is 3/4. With payoffs drawn at random there are no ties, each of the 576 pairs of rankings of exercise 4 is equally likely, and 432 of the 576 tables are solved. No stable cell: 0.125 at m = 2, which is 72/576 = 1/8, and 0.322 at m = 8. Other samples of 20,000 games give values within about 0.01 of these.',
      it: "Risolti: 0,750; 0,438; 0,207 e 0,021. Per m = 2 il valore esatto è 3/4. Con payoff estratti a caso non ci sono pareggi, ognuna delle 576 coppie di ordinamenti dell'esercizio 4 è ugualmente probabile, e 432 tabelle su 576 sono risolte. Senza celle stabili: 0,125 per m = 2, cioè 72/576 = 1/8, e 0,322 per m = 8. Altri campioni di 20.000 giochi danno valori entro circa 0,01 da questi.",
    },
  },
]
