// Module 04 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/game-theory-lab/sequential-games-commitment.<lang>.md.
// Every number quoted here is pinned by scripts/lab/check-game-theory-04.mjs.

export const observe = {
  tree: {
    en: `
1. The simulation opens on the **entry game**. Press **Solve**: the firm's node is solved first (share, 2 against 0), then the newcomer's (enter, 2 against 0), and the path ends at (2, 2). The table has two Nash equilibria; (O, F), stay out and fight, is not subgame perfect, and the line under it names the threat: "fight" after entry gets the firm 0 where sharing gives 2.
2. **Entry with commitment (k = 1)**: the firm moves first, commits, and the newcomer stays out: (0, 3), written (newcomer, firm) as everywhere in the entry game. The table of plans is 4 × 4 and has 5 Nash equilibria, only one of them subgame perfect.
3. **Battle of the sexes in turn**: the first mover gets its favourite event, (2, 1); three Nash equilibria, and (M, MM) rests on the threat to go to the match even after the concert. **Matching pennies in turn**: the second mover wins whatever the first does; the first mover is indifferent, and there are two subgame perfect equilibria, one for each of its moves.
4. **Centipede**: by backward induction the first player takes at once, (1, 0), though (5, 3) is better for both. The table has 4 Nash equilibria, and every one of them ends at the first move.
5. Set G to 20,000 and press **Survey**. The table of plans has one, two or three Nash equilibria in 0.248, 0.502 and 0.249 of the trees; 0.751 have one that is not subgame perfect, 0.331 one that changes the outcome, and in 0.502 of these the second player is better off in it. Moving first is better for the first player in 0.145 of the games, worse in 0.123, the same in 0.731. Of the 0.125 with no pure equilibrium when played at once, both players prefer to move second in 0.651. The leader does strictly better than the best simultaneous equilibrium in 0.048 of the games that have one, and worse in none.
`,
    it: `
1. La simulazione si apre sul **gioco dell'entrata**. Premi **Risolvi**: prima viene risolto il nodo dell'incumbent (dividi, 2 contro 0), poi quello dell'entrante (entra, 2 contro 0), e il cammino finisce in (2, 2). La tabella ha due equilibri di Nash; (F, C), resta fuori e combatti, non è perfetto nei sottogiochi, e la riga sotto indica la minaccia: «combatti» dopo l'entrata dà all'incumbent 0, mentre dividere dà 2.
2. **Entrata con impegno (k = 1)**: l'incumbent muove per primo, si impegna, e l'entrante resta fuori: (0, 3), con i payoff nell'ordine (entrante, incumbent) come ovunque nel gioco dell'entrata. La tabella dei piani è 4 × 4 e ha 5 equilibri di Nash, uno solo perfetto nei sottogiochi.
3. **Battaglia dei sessi a turno**: chi muove per primo ottiene l'evento che preferisce, (2, 1); tre equilibri di Nash, e (P, PP) si regge sulla minaccia di andare alla partita anche dopo il concerto. **Pari o dispari a turno**: chi muove per secondo vince qualunque cosa faccia il primo; il primo è indifferente, e ci sono due equilibri perfetti nei sottogiochi, uno per ciascuna delle sue mosse.
4. **Millepiedi**: secondo l'induzione a ritroso il primo giocatore prende subito, (1, 0), anche se (5, 3) è meglio per entrambi. La tabella ha 4 equilibri di Nash, e tutti finiscono alla prima mossa.
5. Porta G a 20.000 e premi **Rassegna**. La tabella dei piani ha uno, due o tre equilibri di Nash in quote di alberi pari a 0,248; 0,502 e 0,249; lo 0,751 ne ha uno non perfetto nei sottogiochi, lo 0,331 uno che cambia l'esito, e nello 0,502 di questi il secondo giocatore vi ottiene di più. Muovere per primo è meglio per il primo giocatore nello 0,145 dei giochi, peggio nello 0,123, uguale nello 0,731. Nello 0,125 dei giochi non ci sono equilibri puri con mosse simultanee; fra questi, entrambi preferiscono muovere per secondi nello 0,651. Il leader fa strettamente meglio del miglior equilibrio simultaneo nello 0,048 dei giochi che ne hanno uno, e peggio in nessuno.
`,
  },
  leader: {
    en: `
1. With the default costs the two columns are module 02's market, 3, 3, price 4, profits 9 and 9, and the leader's, 4.5 and 2.25, price 3.25, profits 10.125 and 5.0625. The leader's best response to 2.25 would be 3.375. On the chart the peak of the leader's curve is to the right of the Cournot mark.
2. Raise F. Up to 0.40 the leader still shares. At 0.45 it switches: the limit quantity is 7.658 and pays 10.275, more than the 10.125 of sharing. The switch is at F = 0.4343.
3. At F = 1 the limit quantity is 7 and the leader earns 14. As F grows the limit quantity falls; from F = 5.10 on the slider the follower stays out even against the monopoly quantity 4.5, and the leader earns 20.25.
4. Lower c1 to 0.5: the leader produces 5 and earns 12.5, against 11.11 when both choose at the same time. Raise c2 to 2.5 with c1 = 1: 5.25 and 1.125, and the follower's profit falls to 1.27.
`,
    it: `
1. Con i costi preimpostati le due colonne sono il mercato del modulo 02, 3, 3, prezzo 4, profitti 9 e 9, e quello del leader, 4,5 e 2,25, prezzo 3,25, profitti 10,125 e 5,0625. La miglior risposta del leader a 2,25 sarebbe 3,375. Nel grafico il picco della curva del leader sta a destra della linea «Cournot».
2. Alza F. Fino a 0,40 il leader divide ancora. A 0,45 cambia: la quantità limite è 7,658 e rende 10,275, più del 10,125 della divisione. La soglia è F = 0,4343.
3. Con F = 1 la quantità limite è 7 e il leader guadagna 14. Al crescere di F la quantità limite scende; da F = 5,10 sul cursore il follower resta fuori anche contro la quantità di monopolio 4,5, e il leader guadagna 20,25.
4. Abbassa c1 a 0,5: il leader produce 5 e guadagna 12,5, contro 11,11 con scelte simultanee. Alza c2 a 2,5 con c1 = 1: 5,25 e 1,125, e il profitto del follower scende a 1,27.
`,
  },
  ultimatum: {
    en: `
1. With N = 1,000 and m = 0.4 the best offer against this population is 0.394, worth 0.602; the closed form says 0.4 and 0.6. An offer of 0.1 is accepted by 23.9% and earns 0.215, against 0.225 with thresholds exactly uniform.
2. Press **Play**. The offer with the highest mean payoff is 0.40, with 0.600. But only 144 of the 1,000 proposers found it from their own hundred tries: five tries per offer are too few to tell 0.35 from 0.40.
3. Set m to 0.2: the best offer is 0.200, worth 0.800, and after **Play** 628 proposers find it alone, because now low offers are clearly worse. At m = 0 nobody refuses anything and the best offer is 0.
4. With N = 5,000 the population's curve lies almost on the dashed one: the best offer is 0.400 and an offer of 0.1 earns 0.231.
`,
    it: `
1. Con N = 1.000 e m = 0,4 l'offerta migliore contro questa popolazione è 0,394, che vale 0,602; la formula dà 0,4 e 0,6. Un'offerta di 0,1 viene accettata dal 23,9% e rende 0,215, contro 0,225 con soglie esattamente uniformi.
2. Premi **Gioca**. L'offerta con il payoff medio più alto è 0,40, con 0,600. Ma solo 144 dei 1.000 proponenti l'hanno trovata con i propri cento tentativi: cinque tentativi per offerta sono troppo pochi per distinguere 0,35 da 0,40.
3. Porta m a 0,2: l'offerta migliore è 0,200, che vale 0,800, e dopo **Gioca** 628 proponenti la trovano da soli, perché ora le offerte basse sono chiaramente peggiori. Con m = 0 nessuno rifiuta nulla e l'offerta migliore è 0.
4. Con N = 5.000 la curva della popolazione sta quasi su quella tratteggiata: l'offerta migliore è 0,400 e un'offerta di 0,1 rende 0,231.
`,
  },
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: 'The entry game of Figure F1 with f = 0: stay out (0, 4); enter and share (2, 2); enter and fight (−1, 0), payoffs (newcomer, firm). Solve it from the end. Write it as a table and find both Nash equilibria. Which one rests on an empty threat? For which f is the threat credible? With the commitment move, for which k does the firm commit?',
      it: "Il gioco dell'entrata della Figura F1 con f = 0: resta fuori (0, 4); entra e dividi (2, 2); entra e combatti (−1, 0), payoff (entrante, incumbent). Risolvilo dalla fine. Scrivilo come tabella e trova i due equilibri di Nash. Quale si regge su una minaccia non credibile? Per quali f la minaccia è credibile? Con la mossa dell'impegno, per quali k l'incumbent si impegna?",
    },
    solution: {
      en: 'After entry the firm prefers 2 to 0 and shares, so the newcomer enters: 2 and 2. The table (rows stay out, enter; columns share, fight) has two equilibria, (enter, share) and (stay out, fight). The second needs the firm to choose 0 over 2 after entry: an empty threat, never tested because nobody enters. The threat is credible when f > 2. With the commitment move the newcomer stays out after a commitment (0 against −1), so the firm compares 4 − k with the 2 of sharing and commits when k < 2.',
      it: "Dopo l'entrata l'incumbent preferisce 2 a 0 e divide, quindi l'entrante entra: 2 e 2. La tabella (righe resta fuori, entra; colonne dividi, combatti) ha due equilibri, (entra, dividi) e (resta fuori, combatti). Il secondo richiede che l'incumbent scelga 0 invece di 2 dopo l'entrata: una minaccia non credibile, mai messa alla prova perché nessuno entra. La minaccia è credibile quando f > 2. Con la mossa dell'impegno l'entrante, dopo l'impegno, resta fuori (0 contro −1), quindi l'incumbent confronta 4 − k con il 2 della divisione e si impegna quando k < 2.",
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Play the battle of the sexes of module 01, (2, 1) (0, 0) / (0, 0) (1, 2), in turn, the row player first; then matching pennies in turn. Who gains from moving first? How many plans has the second player, and how many Nash equilibria has the table of the first game? Then check it in Simulation A.',
      it: 'Gioca a turno la battaglia dei sessi del modulo 01, (2, 1) (0, 0) / (0, 0) (1, 2), prima il giocatore di riga; poi il pari o dispari a turno. Chi ci guadagna a muovere per primo? Quanti piani ha il secondo giocatore, e quanti equilibri di Nash ha la tabella del primo gioco? Poi verificalo nella Simulazione A.',
    },
    solution: {
      en: 'Battle of the sexes: the second player follows whatever the first chose, so the first mover picks its favourite event and gets 2, the other 1. Matching pennies: the second mover sees the coin and wins every time. The second player has four plans (a move after each of the two first moves). The table of the battle of the sexes has three equilibria: the row player\'s favourite with "always follow", the same outcome with "always choose the first event", and the column player\'s favourite with "always choose the second event", which rests on an empty threat (to go to the second event even after the first was chosen).',
      it: "Battaglia dei sessi: il secondo giocatore segue la scelta del primo, quindi chi muove per primo sceglie l'evento che preferisce e ottiene 2, l'altro 1. Pari o dispari: chi muove per secondo vede le dita dell'altro e vince sempre. Il secondo giocatore ha quattro piani (una mossa dopo ciascuna delle due prime mosse). La tabella della battaglia dei sessi ha tre equilibri: il preferito del giocatore di riga con «segui sempre», lo stesso esito con «scegli sempre il primo evento», e il preferito del giocatore di colonna con «scegli sempre il secondo evento», che si regge su una minaccia non credibile (andare al secondo evento anche dopo che è stato scelto il primo).",
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Cournot with a = 10, c = 1 and firm 1 moving first. Quantities, price, profits. Is the leader\'s quantity a best response to the follower\'s? The follower now has a fixed cost F = 1: which quantity keeps it out, and is it worth it? Above which F is it worth it? Then check it in Simulation B.',
      it: "Cournot con a = 10, c = 1 e l'impresa 1 che muove per prima. Quantità, prezzo, profitti. La quantità del leader è una miglior risposta a quella del follower? Il follower ha ora un costo fisso F = 1: quale quantità lo tiene fuori, e conviene? Sopra quale F conviene? Poi verificalo nella Simulazione B.",
    },
    solution: {
      en: 'The follower answers (9 − q1)/2; the leader maximizes q1 (9 − q1)/2: 4.5 and 2.25, price 3.25, profits 10.125 and 5.0625. No: the best response to 2.25 is 3.375. With F = 1 the follower earns ((9 − q1)/2)², which is at most 1 from q1 = 7; the leader then earns 7 × 2 = 14, more than 10.125. Keeping out with q1 = 9 − 2√F pays when (2√F)(9 − 2√F) > 10.125, that is when F is above 0.434; from F = 5.0625 the follower stays out even against the monopoly quantity 4.5.',
      it: "Il follower risponde (9 − q1)/2; il leader massimizza q1 (9 − q1)/2: 4,5 e 2,25, prezzo 3,25, profitti 10,125 e 5,0625. No: la miglior risposta a 2,25 è 3,375. Con F = 1 il follower guadagna ((9 − q1)/2)², che non supera 1 da q1 = 7; il leader guadagna allora 7 × 2 = 14, più di 10,125. Tenere fuori il follower con q1 = 9 − 2√F conviene quando (2√F)(9 − 2√F) > 10,125, cioè quando F supera 0,434; da F = 5,0625 il follower resta fuori anche contro la quantità di monopolio 4,5.",
    },
  },
  {
    type: 'both',
    statement: {
      en: 'A pie of 1, δ = 0.9. What does the first proposer get with one, two and three rounds? And with no last round? And if the first proposer has δ₁ = 0.9 and the other δ₂ = 0.8, or the reverse? Then check it in Figure F2.',
      it: "Una torta di 1, δ = 0,9. Che cosa ottiene il primo proponente con uno, due e tre turni? E senza un ultimo turno? E se il primo proponente ha δ₁ = 0,9 e l'altro δ₂ = 0,8, o il contrario? Poi verificalo nella Figura F2.",
    },
    solution: {
      en: 'One round: 1. Two: the other would get the whole pie next round, worth 0.9 now, so the proposer keeps 0.1. Three: the other would get 0.1 of the next round, worth 0.09, so the proposer keeps 0.91. With no last round the share x is the same at every round, so x = 1 − δx: 1/(1 + δ) = 0.526. With δ₁ = 0.9 and δ₂ = 0.8, (1 − δ₂)/(1 − δ₁δ₂) = 0.2/0.28 = 0.714; the reverse gives 0.1/0.28 = 0.357.',
      it: "Un turno: 1. Due: l'altro otterrebbe tutta la torta al turno dopo, che vale 0,9 oggi, quindi chi propone tiene 0,1. Tre: l'altro otterrebbe 0,1 del turno dopo, che vale 0,09, quindi chi propone tiene 0,91. Senza un ultimo turno la quota x è la stessa a ogni turno, quindi x = 1 − δx: 1/(1 + δ) = 0,526. Con δ₁ = 0,9 e δ₂ = 0,8, (1 − δ₂)/(1 − δ₁δ₂) = 0,2/0,28 = 0,714; il contrario dà 0,1/0,28 = 0,357.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'The box. A miner has α = 0.2. With what chance does a feather fork that gives up after one confirmation succeed? Above which fee, as a fraction of the block\'s value, does another miner still include the transaction? What does one attempt cost the attacker on average? Repeat for α = 0.3.',
      it: "Il riquadro. Un miner ha α = 0,2. Con quale probabilità riesce un feather fork che rinuncia dopo una conferma? Sopra quale commissione, come frazione del valore del blocco, un altro miner include ancora la transazione? Quanto costa in media un tentativo all'attaccante? Ripeti per α = 0,3.",
    },
    solution: {
      en: 'The attacker must find the next two blocks: 0.2² = 0.04. Another miner compares the fee, kept with chance 1 − α², with the block, lost with chance α²: it includes the transaction if the fee is above α²/(1 − α²) = 0.0417 of the block. Over the next two blocks the attacker expects α × α × 2 (it wins the race) + (1 − α) × α (it gives up and mines normally) = α(1 + α) blocks, instead of 2α: a loss of α(1 − α) = 0.16 of a block. With α = 0.3: 0.09, 0.0989, 0.21.',
      it: "L'attaccante deve trovare i due blocchi successivi: 0,2² = 0,04. Un altro miner confronta la commissione, che tiene con probabilità 1 − α², con il blocco, che perde con probabilità α²: include la transazione se la commissione supera α²/(1 − α²) = 0,0417 del blocco. Sui due blocchi successivi l'attaccante si aspetta α × α × 2 (vince la gara) + (1 − α) × α (rinuncia e torna a minare normalmente) = α(1 + α) blocchi, invece di 2α: una perdita di α(1 − α) = 0,16 di blocco. Con α = 0,3: 0,09; 0,0989; 0,21.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In the simulations. Simulation A, "Survey" with G = 20,000: the shares of trees with one, two and three Nash equilibria; with an empty-threat equilibrium that changes the outcome; of games where moving first is better and worse for the first player. Simulation C: the best offer and the proposer\'s money with m = 0.4 and m = 0.2; what an offer of 0.1 earns when m = 0.4.',
      it: 'Nelle simulazioni. Simulazione A, «Rassegna» con G = 20.000: le quote di alberi con uno, due e tre equilibri di Nash; con un equilibrio basato su una minaccia non credibile che cambia l\'esito; di giochi in cui muovere per primo è meglio e peggio per il primo giocatore. Simulazione C: l\'offerta migliore e il denaro del proponente con m = 0,4 e m = 0,2; che cosa rende un\'offerta di 0,1 quando m = 0,4.',
    },
    solution: {
      en: '0.248, 0.502 and 0.249 (exactly 1/4, 1/2, 1/4 in theory); 0.331 (1/3); 0.145 and 0.123. Simulation C, closed form: offers 0.4 and 0.2, money 0.6 and 0.8; an offer of 0.1 earns 0.225. Against the page\'s population of 1,000: 0.394 worth 0.602, 0.200 worth 0.800, and 0.215.',
      it: "0,248; 0,502 e 0,249 (in teoria esattamente 1/4, 1/2, 1/4); 0,331 (1/3); 0,145 e 0,123. Simulazione C, con la formula: offerte 0,4 e 0,2, denaro 0,6 e 0,8; un'offerta di 0,1 rende 0,225. Contro la popolazione di 1.000 della pagina: 0,394 che vale 0,602; 0,200 che vale 0,800; infine 0,215.",
    },
  },
]
