// Module 03 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/game-theory-lab/mixed-strategies-zero-sum.<lang>.md.
// Every number quoted here is pinned by scripts/lab/check-game-theory-03.mjs.

export const observe = {
  all: {
    en: `
1. The panel opens on random table no. 1, 3 × 3. It has two pure equilibria, (1, C) and (3, B), ringed in the table, and a third, mixed one: the row player plays 1 with probability 3/7 and 3 with 4/7, the column player B with 1/8 and C with 7/8. Three in all.
2. Load **Rock-paper-scissors**: one equilibrium, 1/3 each, value 0. Then **Rock beats scissors by 2**: still one, but now 1/4, 1/2, 1/4. The move that gained is not the one played most: paper is.
3. Load the **penalty kick**: one equilibrium, L with 0.385 for the kicker and 0.420 for the keeper, scoring 79.57. **Shapley's game** has one too, a third for each strategy. In **Exercise 5** the row player mixes U and D half and half and never plays M; the value is 2.
4. Set G to 20,000 and press **Survey**. The column "Even number" is 0 at every size. At m = 2, 0.875 of the games have one equilibrium and 0.125 three; at m = 4, 0.536 one, 0.380 three, 0.068 five and 0.016 seven or more. The mean grows from 1.251 to 2.130.
5. The last column, games with no pure equilibrium (0.125, 0.212, 0.253), repeats module 01's numbers for the same games: every one of them still has an equilibrium, a mixed one.
`,
    it: `
1. Il pannello si apre sulla tabella casuale n. 1, 3 × 3. Ha due equilibri puri, (1, C) e (3, B), cerchiati nella tabella, e un terzo, misto: il giocatore di riga gioca 1 con probabilità 3/7 e 3 con 4/7, quello di colonna B con 1/8 e C con 7/8. Tre in tutto.
2. Carica **Sasso-carta-forbici**: un equilibrio, 1/3 ciascuno, valore 0. Poi **Il sasso batte le forbici per 2**: ancora uno, ma ora 1/4, 1/2, 1/4. La mossa che ci ha guadagnato non è la più giocata: lo è la carta.
3. Carica il **calcio di rigore**: un equilibrio, S con 0,385 per il rigorista e 0,420 per il portiere, realizzazione 79,57. Anche **il gioco di Shapley** ne ha uno, un terzo per ogni strategia. Nell'**Esercizio 5** il giocatore di riga mescola U e D metà e metà e non gioca mai M; il valore è 2.
4. Porta G a 20.000 e premi **Rassegna**. La colonna "Numero pari" è 0 a ogni dimensione. Per m = 2, 0,875 dei giochi hanno un equilibrio e 0,125 tre; per m = 4, 0,536 uno, 0,380 tre, 0,068 cinque e 0,016 sette o più. La media cresce da 1,251 a 2,130.
5. L'ultima colonna, i giochi senza equilibri puri (0,125, 0,212, 0,253), ripete i numeri del modulo 01 per gli stessi giochi: ognuno di loro ha comunque un equilibrio, misto.
`,
  },
  learning: {
    en: `
1. The panel opens on matching pennies with 10,000 rounds. The first runs are 1, 2, 3, 4, 5…: each one round longer than the last, so there are only 141 runs. The frequencies still approach 1/2: the largest gap is 0.0065.
2. Move the slider to 100,000 rounds. The largest gap was 0.050 after 100 rounds, 0.017 after 1,000, and is 0.0016 now. The play never settles in a cell, but the frequencies settle on the equilibrium.
3. In **Rock-paper-scissors** the runs are 1, 3, 5, 7…, and the average payoff is the value, 0. With **Rock worth 2** the frequencies after 10,000 rounds are 0.256, 0.496 and 0.248, close to 1/4, 1/2, 1/4.
4. In the **penalty kick** the kicker's average scoring rate is 79.99 after 100 rounds and 79.51 after 10,000, against a value of 79.57.
5. **Shapley's game** is different. The runs are 1, 1, 2, 4, 6, 9, 14, 21… and keep growing by about half, so there are 22 runs in 10,000 rounds and 28 in 100,000. The largest gap stays near 0.25 (0.255 at 10,000 rounds), and from round 100 on it never falls below 0.173. The row player's frequencies, 0.274, 0.138 and 0.589, are nowhere near a third each.
`,
    it: `
1. Il pannello si apre su *matching pennies* con 10.000 turni. Le prime sequenze sono 1, 2, 3, 4, 5…: ognuna è lunga un turno più della precedente, e quindi le sequenze sono solo 141. Le frequenze si avvicinano comunque a 1/2: lo scarto massimo è 0,0065.
2. Porta il cursore a 100.000 turni. Lo scarto massimo era 0,050 dopo 100 turni, 0,017 dopo 1.000, ed è 0,0016 ora. Il gioco non si ferma mai in una cella, ma le frequenze si fermano sull'equilibrio.
3. In **Sasso-carta-forbici** le sequenze sono 1, 3, 5, 7…, e il payoff medio è il valore, 0. Con **Sasso che vale 2** le frequenze dopo 10.000 turni sono 0,256, 0,496 e 0,248, vicine a 1/4, 1/2, 1/4.
4. Nel **calcio di rigore** la percentuale media di realizzazione del rigorista è 79,99 dopo 100 turni e 79,51 dopo 10.000, contro un valore di 79,57.
5. **Il gioco di Shapley** è diverso. Le sequenze sono 1, 1, 2, 4, 6, 9, 14, 21… e continuano a crescere di circa la metà, così ce ne sono 22 in 10.000 turni e 28 in 100.000. Lo scarto massimo resta vicino a 0,25 (0,255 a 10.000 turni), e dal turno 100 in poi non scende mai sotto 0,173. Le frequenze del giocatore di riga, 0,274, 0,138 e 0,589, sono lontanissime da un terzo ciascuna.
`,
  },
  reader: {
    en: `
1. Play 40 rounds trying to be unpredictable, then look at the machine's win rate. If it is well above 0.5, you have a pattern: most people switch too often.
2. Press **Let a coin play 100 rounds for me**. The first three presses give the machine 55, 60 and 51 wins in 100: around half, with the noise that 100 rounds carry.
3. Under **Simulated players**, press **Play** with "Switches too often" at s = 0.6: over 2,000 rounds the machine wins 0.595 on average, with a spread of 0.012 from player to player. At s = 0.7 it wins 0.698, at s = 0.5 it wins 0.500.
4. "Favours heads" at h = 0.6 gives the machine 0.597; "A fair coin", 0.500. Against these players the machine gets close to the best possible, s or h: it needs no more than a count of what followed each pair of moves.
`,
    it: `
1. Gioca 40 turni cercando di essere imprevedibile, poi guarda la quota di vittorie della macchina. Se è ben sopra 0,5, hai uno schema: la maggior parte delle persone cambia troppo spesso.
2. Premi **Fai giocare 100 turni a una moneta per me**. Le prime tre volte la macchina vince 55, 60 e 51 turni su 100: intorno alla metà, con il rumore che hanno 100 turni.
3. In **Giocatori simulati**, premi **Gioca** con "Cambia troppo spesso" e s = 0,6: su 2.000 turni la macchina vince in media 0,595, con una dispersione di 0,012 da un giocatore all'altro. Con s = 0,7 vince 0,698, con s = 0,5 vince 0,500.
4. "Preferisce testa" con h = 0,6 dà alla macchina 0,597; "Una moneta onesta", 0,500. Contro questi giocatori la macchina arriva vicino al meglio possibile, s o h: le basta contare che cosa è seguito a ogni coppia di mosse.
`,
  },
}

const EX1 = {
  en: `
| | L | R |
|---|---|---|
| U | 3, 1 | 0, 2 |
| D | 1, 3 | 2, 0 |
`,
  it: `
| | L | R |
|---|---|---|
| U | 3, 1 | 0, 2 |
| D | 1, 3 | 2, 0 |
`,
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: `Rows U, D; columns L, R; each cell gives the row player's payoff first.
${EX1.en}
Show that there is no stable cell. Find the mixed equilibrium and each player's expected payoff.`,
      it: `Righe U, D; colonne L, R; ogni cella dà prima il payoff del giocatore di riga.
${EX1.it}
Mostra che non c'è una cella stabile. Trova l'equilibrio misto e il payoff atteso di ciascun giocatore.`,
    },
    solution: {
      en: 'At (U, L) the column player moves to R, at (U, R) the row player moves to D, at (D, R) the column player moves to L, at (D, L) the row player moves to U: no cell is stable. The row player plays U with probability 3/4, which makes L and R pay the column player 1.5 each (3/4 × 1 + 1/4 × 3 and 3/4 × 2). The column player plays L with probability 1/2, which makes U and D pay the row player 1.5 each. Both expect 1.5.',
      it: "In (U, L) il giocatore di colonna passa a R, in (U, R) quello di riga passa a D, in (D, R) quello di colonna passa a L, in (D, L) quello di riga passa a U: nessuna cella è stabile. Il giocatore di riga gioca U con probabilità 3/4, il che fa rendere L e R 1,5 ciascuna al giocatore di colonna (3/4 × 1 + 1/4 × 3 e 3/4 × 2). Il giocatore di colonna gioca L con probabilità 1/2, il che fa rendere U e D 1,5 ciascuna al giocatore di riga. Entrambi si aspettano 1,5.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Find the mixed equilibria of the battle of the sexes, (2, 1) (0, 0) / (0, 0) (1, 2), and of chicken, (3, 3) (1, 4) / (4, 1) (0, 0), as in module 01. How often do the two meet in the first game, and crash (both go straight) in the second? What does each player expect?',
      it: "Trova gli equilibri misti della battaglia dei sessi, (2, 1) (0, 0) / (0, 0) (1, 2), e del gioco del pollo, (3, 3) (1, 4) / (4, 1) (0, 0), come nel modulo 01. Quanto spesso i due si incontrano nel primo gioco, e si scontrano (entrambi dritto) nel secondo? Che cosa si aspetta ciascun giocatore?",
    },
    solution: {
      en: 'Battle of the sexes: the row player chooses the first row with probability 2/3, the column player the first column with 1/3, each going to the event they prefer with probability 2/3. They meet with probability 2/3 × 1/3 + 1/3 × 2/3 = 4/9 and each expects 2/3, less than in either pure equilibrium. Chicken: each swerves with probability 1/2; both go straight one time in four; each expects 2.',
      it: "Battaglia dei sessi: il giocatore di riga sceglie la prima riga con probabilità 2/3, quello di colonna la prima colonna con 1/3, e ciascuno va all'evento che preferisce con probabilità 2/3. Si incontrano con probabilità 2/3 × 1/3 + 1/3 × 2/3 = 4/9 e ciascuno si aspetta 2/3, meno che in ciascuno dei due equilibri puri. Gioco del pollo: ciascuno sterza con probabilità 1/2; entrambi vanno dritto una volta su quattro; ciascuno si aspetta 2.",
    },
  },
  {
    type: 'both',
    statement: {
      en: 'The penalty kick with scoring rates 58.30, 94.97 / 92.91, 69.92 (rows: kicker L, R; columns: keeper L, R; R is the kicker\'s natural side). Find both mixes and the value. What do "always L" and "always R" guarantee the kicker? The kicker trains and the R/R rate rises to 80: what changes? Then check it in Figure F2.',
      it: 'Il calcio di rigore con percentuali di realizzazione 58,30, 94,97 / 92,91, 69,92 (righe: rigorista S, D; colonne: portiere S, D; D è il lato naturale del rigorista). Trova le due miscele e il valore. Che cosa garantiscono al rigorista "sempre a S" e "sempre a D"? Il rigorista si allena e la percentuale D/D sale a 80: che cosa cambia? Poi verificalo nella Figura F2.',
    },
    solution: {
      en: 'The keeper\'s mix y (on L) makes the kicker indifferent: 58.30 y + 94.97 (1 − y) = 92.91 y + 69.92 (1 − y), so y = 25.05 / 59.66 = 42.0%. The kicker\'s mix x (on L) makes the keeper indifferent: 58.30 x + 92.91 (1 − x) = 94.97 x + 69.92 (1 − x), so x = 22.99 / 59.66 = 38.5%. The value is 79.57%. Always L guarantees 58.3 (the keeper goes L), always R 69.92. After training: kicker L 26.0%, keeper L 30.2%, value 83.90%. The kicker uses the better side more, the keeper covers it more: in a constant-sum game a change in the kicker\'s payoffs is a change in the keeper\'s too.',
      it: "La miscela del portiere y (su S) rende indifferente il rigorista: 58,30 y + 94,97 (1 − y) = 92,91 y + 69,92 (1 − y), quindi y = 25,05 / 59,66 = 42,0%. La miscela del rigorista x (su S) rende indifferente il portiere: 58,30 x + 92,91 (1 − x) = 94,97 x + 69,92 (1 − x), quindi x = 22,99 / 59,66 = 38,5%. Il valore è 79,57%. Sempre a S garantisce 58,3 (il portiere va a S), sempre a D 69,92. Dopo l'allenamento: rigorista a S 26,0%, portiere a S 30,2%, valore 83,90%. Il rigorista usa di più il lato migliore, il portiere lo copre di più: in un gioco a somma costante un cambiamento dei payoff del rigorista è anche un cambiamento di quelli del portiere.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Rock-paper-scissors in which rock beating scissors is worth a instead of 1, for the winner and the loser alike (+a and −a). Find the equilibrium. Which move is played most when a = 2, and why is it not rock?',
      it: 'Sasso-carta-forbici in cui il sasso che batte le forbici vale a invece di 1, sia per chi vince sia per chi perde (+a e −a). Trova l\'equilibrio. Quale mossa è la più giocata quando a = 2, e perché non è il sasso?',
    },
    solution: {
      en: 'Each plays rock and scissors with probability 1/(2 + a) and paper with a/(2 + a): 1/4, 1/2, 1/4 when a = 2; the value is 0. Each player\'s mix is set by what keeps the other indifferent. Against a mix (r, p, s), rock pays 2s − p and scissors pays p − 2r; for both to pay the same as paper (r − s), which is 0 at the equilibrium, p must be twice s and twice r. Rock gained, so the other player must hold it back: with more paper, which beats rock, and with less scissors, which rock now beats by more.',
      it: "Ciascuno gioca sasso e forbici con probabilità 1/(2 + a) e carta con a/(2 + a): 1/4, 1/2, 1/4 quando a = 2; il valore è 0. La miscela di ciascun giocatore è quella che tiene indifferente l'altro. Contro una miscela (r, p, s), il sasso rende 2s − p e le forbici p − 2r; perché rendano quanto la carta (r − s), che all'equilibrio è 0, p deve essere il doppio di s e il doppio di r. Il sasso ci ha guadagnato, quindi l'altro giocatore deve tenerlo a freno: con più carta, che batte il sasso, e con meno forbici, che il sasso ora batte di più.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'The row player\'s payoffs against the columns L and R are U (4, 0), M (1, 1), D (0, 4). Show that neither U nor D dominates M, and that a mix of U and D does. Which mixes? What if M paid (2, 2)?',
      it: 'I payoff del giocatore di riga contro le colonne L e R sono U (4, 0), M (1, 1), D (0, 4). Mostra che né U né D domina M, e che una miscela di U e D sì. Quali miscele? E se M rendesse (2, 2)?',
    },
    solution: {
      en: 'U loses to M against R (0 < 1), D against L (0 < 1). The mix with weight w on U pays 4w against L and 4(1 − w) against R, both above 1 exactly when 1/4 < w < 3/4. With (2, 2) no mix does it: 4w > 2 and 4(1 − w) > 2 cannot both hold, the half-and-half mix only ties, and M is a best response when the column player mixes half and half.',
      it: "U perde contro M quando la colonna è R (0 < 1), D quando è L (0 < 1). La miscela con peso w su U rende 4w contro L e 4(1 − w) contro R, entrambi sopra 1 esattamente quando 1/4 < w < 3/4. Con (2, 2) nessuna miscela ci riesce: 4w > 2 e 4(1 − w) > 2 non possono valere insieme, la miscela metà e metà pareggia soltanto, e M è una risposta migliore quando il giocatore di colonna mescola metà e metà.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In the simulation. Panel A, "Survey" with G = 20,000: what share of the random games have 1, 3, and 5 or more equilibria at each size; is the number ever even? Panel B: the largest gap after 100, 1,000, 10,000 and 100,000 rounds in matching pennies and in Shapley\'s game. Panel C: the machine\'s win rate against the simulated players with s = 0.6 and with h = 0.6, and against the coin.',
      it: 'Nella simulazione. Pannello A, "Rassegna" con G = 20.000: che quota dei giochi casuali ha 1, 3, e 5 o più equilibri a ogni dimensione; il numero è mai pari? Pannello B: lo scarto massimo dopo 100, 1.000, 10.000 e 100.000 turni in matching pennies e nel gioco di Shapley. Pannello C: la quota di vittorie della macchina contro i giocatori simulati con s = 0,6 e con h = 0,6, e contro la moneta.',
    },
    solution: {
      en: 'At m = 2: 0.875 and 0.125; at m = 3: 0.707, 0.276 and 0.017; at m = 4: 0.536, 0.380 and 0.084; never even. Matching pennies: 0.050, 0.017, 0.0065, 0.0016. Shapley\'s game: 0.217, 0.255, 0.255, 0.251, about 0.25 from 1,000 rounds on. The machine: 0.595, 0.597 and 0.500.',
      it: 'Per m = 2: 0,875 e 0,125; per m = 3: 0,707, 0,276 e 0,017; per m = 4: 0,536, 0,380 e 0,084; mai pari. Matching pennies: 0,050, 0,017, 0,0065, 0,0016. Gioco di Shapley: 0,217, 0,255, 0,255, 0,251, circa 0,25 da 1.000 turni in poi. La macchina: 0,595, 0,597 e 0,500.',
    },
  },
]
