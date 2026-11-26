// Module 12 texts outside the lecture: "What to observe" for each panel and
// the exercises. Every number is pinned by scripts/lab/check-game-theory-12.mjs
// ("quoted on the page"); the simulated ones are those of run no. 1.

export const observe = {
  truth: {
    en: `
1. The panel opens on one object, rival bid h = 60, Myerson's payment and a true value of 80: the truth pays 60 and keeps 20, and every report above 60 keeps the same 20 (the green segment). The truth is a best report, not the only one.
2. Choose **Pay your bid**: the truth now keeps 0, and the best report is 60.1, just above h, keeping 19.90. Where the best report lies depends on h, which the bidder does not see.
3. Choose **Two ad slots** and set v to **100**. With Myerson's payment the truth takes the top slot and keeps 64. With the generalized second price the truth keeps 40, while any report from 30.1 to 59.9 takes the second slot and keeps 56. The readout gives the threshold 0.5714 (4/7): set α2 to **0.5** and the truth is best again, 40 against 35.
4. Choose **A lottery**, value 80: with Myerson's payment the only best report is 80, keeping 32.22. With pay your bid the best report is 30.6, keeping 18.75: a bidder who pays her bid shades it.
5. Choose **Win only in the middle**, value 70: Myerson's formula pays you 20 for losing, so the truth keeps 20, while any report from 40 to 59.9 keeps 30. The rule is not monotone, and no payment can make it truthful.
6. Choose **With a reserve**, value 40: the truth keeps 0, and so does every report up to 49.9; winning would cost the reserve, 50, more than the object is worth.
`,
    it: `
1. Il pannello si apre su un oggetto, offerta rivale h = 60, il pagamento di Myerson e un valore vero di 80: la verità paga 60 e tiene 20, e ogni dichiarazione sopra 60 tiene gli stessi 20 (il tratto verde). La verità è una delle dichiarazioni migliori, non l'unica.
2. Scegli **Paghi la tua offerta**: ora la verità tiene 0, e la dichiarazione migliore è 60,1, appena sopra h, che tiene 19,90. Dove stia la dichiarazione migliore dipende da h, che l'offerente non vede.
3. Scegli **Due spazi pubblicitari** e porta v a **100**. Con il pagamento di Myerson la verità prende lo spazio in alto e tiene 64. Con il secondo prezzo generalizzato la verità tiene 40, mentre ogni dichiarazione da 30,1 a 59,9 prende il secondo spazio e tiene 56. Il pannello indica la soglia 0,5714 (4/7): porta α2 a **0,5** e la verità torna migliore, 40 contro 35.
4. Scegli **Una lotteria**, valore 80: con il pagamento di Myerson l'unica dichiarazione migliore è 80, che tiene 32,22. Con «paghi la tua offerta» la dichiarazione migliore è 30,6, che tiene 18,75: chi paga la propria offerta la abbassa.
5. Scegli **Vinci solo nel mezzo**, valore 70: la formula di Myerson ti paga 20 per perdere, quindi la verità tiene 20, mentre ogni dichiarazione da 40 a 59,9 tiene 30. La regola non è monotona, e nessun pagamento può renderla veritiera.
6. Scegli **Con riserva**, valore 40: la verità tiene 0, come ogni dichiarazione fino a 49,9; vincere costerebbe la riserva, 50, più di quanto vale l'oggetto.
`,
  },
  vcg: {
    en: `
1. The panel opens on **Two items, three bidders**: A goes to bidder 1 and B to bidder 2 (total 14); they pay 5 and 4, bidder 3 pays 0, and the seller gets 9. Without bidder 3 the revenue is 7: bidder 2 pays 2 instead of 4, since bidder 3, who wanted B, is gone.
2. **The lonely auction**: A to bidder 2, B to bidder 3, nobody pays, revenue 0. Without bidder 3 the revenue is 4: one bidder more, 4 less for the seller.
3. **Two names**, **As one person**: the bidder who values AB at 6 wins it, pays 4 and keeps 2. **As two names**, bidding A 4 and B 4: she wins both for 0 and keeps 6, and the seller gets nothing.
4. **Losers collude**: bidders 2 and 3, who value A and B at 1 each, bid 10; they win, pay 0 and keep 1 each. Press **Bids = true values**: bidder 1 wins AB, pays 2 and keeps 2.
5. Change one bidder's bids away from her true values and watch her payoff: it never rises. Her bid moves only the allocation, never the price of a given allocation.
`,
    it: `
1. Il pannello si apre su **Due oggetti, tre offerenti**: A va all'offerente 1 e B all'offerente 2 (totale 14); pagano 5 e 4, l'offerente 3 paga 0, e il venditore riceve 9. Senza l'offerente 3 il ricavo è 7: l'offerente 2 paga 2 invece di 4, perché l'offerente 3, che voleva B, non c'è più.
2. **L'asta solitaria**: A all'offerente 2, B all'offerente 3, nessuno paga, ricavo 0. Senza l'offerente 3 il ricavo è 4: un offerente in più, 4 in meno per il venditore.
3. **Due nomi**, **Come una persona**: l'offerente che valuta AB 6 lo vince, paga 4 e tiene 2. **Con due nomi**, offrendo A 4 e B 4: vince entrambi per 0 e tiene 6, e il venditore non riceve nulla.
4. **I perdenti colludono**: gli offerenti 2 e 3, che valutano A e B 1 ciascuno, offrono 10; vincono, pagano 0 e tengono 1 ciascuno. Premi **Offerte = valori veri**: l'offerente 1 vince AB, paga 2 e tiene 2.
5. Modifica le offerte di un offerente rispetto ai suoi valori veri e osserva il suo payoff: non sale mai. La sua offerta cambia solo l'allocazione, mai il prezzo di un'allocazione data.
`,
  },
  cheat: {
    en: `
1. The panel opens on 20 users, 10 slots, 10,000 blocks. Under the uniform price the honest miner earns 475.21 ± 1.07 (exact 476.19); the cheating miner earns 546.62 ± 0.93, exactly the monopolistic price's 546.62, in all 10,000 blocks. It serves 9.22 users on average instead of 10, and the users' total payoff falls from 262.51 to 153.77.
2. The single fake bid just below the tenth bid: 523.81 instead of 476.19, a gain of 47.62. The rest of the gain comes from also leaving real users out.
3. Pay your bid: 476.15, both honest and cheating. The monopolistic price, too, earns the same either way: under these two rules no fake helps.
4. Set k to **20**: room for all, and the honest uniform price earns 0, while the cheating miner earns 578.47, serving 11.06 users; the users' payoff falls from 999.23 to 211.75.
5. Set k to **1**: one slot, the second-price auction. The cheating miner puts a fake just below the top bid and earns 95.23 instead of 90.45; the winner keeps 0.00.
`,
    it: `
1. Il pannello si apre su 20 utenti, 10 posti, 10.000 blocchi. Con il prezzo uniforme il miner onesto incassa 475,21 ± 1,07 (esatto 476,19); quello che imbroglia incassa 546,62 ± 0,93, esattamente i 546,62 del prezzo monopolistico, in tutti i 10.000 blocchi. Serve in media 9,22 utenti invece di 10, e il payoff totale degli utenti scende da 262,51 a 153,77.
2. Una sola offerta falsa appena sotto la decima: 523,81 invece di 476,19, un guadagno di 47,62. Il resto del guadagno viene dal lasciare fuori anche utenti veri.
3. «Paghi la tua offerta»: 476,15, sia da onesto sia imbrogliando. Anche il prezzo monopolistico rende lo stesso nei due casi: con queste due regole nessuna transazione falsa aiuta.
4. Porta k a **20**: c'è posto per tutti, e il prezzo uniforme onesto rende 0, mentre il miner che imbroglia incassa 578,47, servendo 11,06 utenti; il payoff degli utenti scende da 999,23 a 211,75.
5. Porta k a **1**: un solo posto, l'asta al secondo prezzo. Il miner che imbroglia mette un'offerta falsa appena sotto quella più alta e incassa 95,23 invece di 90,45; chi vince tiene 0,00.
`,
  },
}

export const exercises = [
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Figure F1. One object, highest rival bid 60, your value 80: what do you pay and what do you keep?',
      it: 'Su carta, poi nella Figura F1. Un oggetto, offerta rivale più alta 60, il tuo valore 80: quanto paghi e quanto tieni?',
    },
    solution: {
      en: 'x is 0 up to 60 and 1 above. You pay 80 × 1 minus the area under the curve, 20: you pay 60, the area to the left of the step, and keep 20, the area under it.',
      it: 'x vale 0 fino a 60 e 1 sopra. Paghi 80 × 1 meno l\'area sotto la curva, 20: paghi 60, l\'area a sinistra del gradino, e tieni 20, l\'area sotto il gradino.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Panel A. Two ad slots, click rates 1 and 0.8, rival bids 60 and 30, your value 100. Find your payoff from the top slot and from the second, under the generalized second price and then under Myerson\'s payments.',
      it: 'Su carta, poi nel Pannello A. Due spazi pubblicitari, clic 1 e 0,8, offerte rivali 60 e 30, il tuo valore 100. Trova il tuo payoff con lo spazio in alto e con il secondo, con il secondo prezzo generalizzato e poi con i pagamenti di Myerson.',
    },
    solution: {
      en: 'Generalized second price: the top slot costs 60, so 100 − 60 = 40; the second costs 30 per click, so 0.8 × (100 − 30) = 56. The truth does not pay. Myerson: the top slot costs 0.8 × 30 + 0.2 × 60 = 36, so 64; the second costs 0.8 × 30 = 24, so 80 − 24 = 56. The truth pays. The generalized second price makes the truth best here only if α2 ≤ 4/7: 100 − 60 ≥ α2(100 − 30).',
      it: 'Secondo prezzo generalizzato: lo spazio in alto costa 60, quindi 100 − 60 = 40; il secondo costa 30 per clic, quindi 0,8 × (100 − 30) = 56. La verità non conviene. Myerson: lo spazio in alto costa 0,8 × 30 + 0,2 × 60 = 36, quindi 64; il secondo costa 0,8 × 30 = 24, quindi 80 − 24 = 56. La verità conviene. Qui il secondo prezzo generalizzato rende la verità la scelta migliore solo se α2 ≤ 4/7: 100 − 60 ≥ α2(100 − 30).',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Panel A. "Win only in the middle", with Myerson\'s formula as payment, your value 70: find the payoff of the truth and of bidding 50.',
      it: 'Su carta, poi nel Pannello A. «Vinci solo nel mezzo», con la formula di Myerson come pagamento, il tuo valore 70: trova il payoff della verità e quello di un\'offerta di 50.',
    },
    solution: {
      en: 'Bidding 70 you lose, and the formula pays 70 × 0 − 20 = −20: it pays you 20 for losing, so the truth gives 20. Bidding 50 you win and pay 50 − 10 = 40, keeping 30. No payment rule can fix a rule that is not monotone.',
      it: 'Offrendo 70 perdi, e la formula paga 70 × 0 − 20 = −20: ti paga 20 per perdere, quindi la verità dà 20. Offrendo 50 vinci e paghi 50 − 10 = 40, e tieni 30. Nessuna regola di pagamento può correggere una regola che non è monotona.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Panel B. "The lonely auction" (bidder 1: AB 4; bidder 2: A 4; bidder 3: B 4): find the allocation, the payments and the revenue; then the same without bidder 3.',
      it: 'Su carta, poi nel Pannello B. «L\'asta solitaria» (offerente 1: AB 4; offerente 2: A 4; offerente 3: B 4): trova l\'allocazione, i pagamenti e il ricavo; poi lo stesso senza l\'offerente 3.',
    },
    solution: {
      en: 'A to 2 and B to 3, total 8. Without bidder 2 the others could reach 4 (AB to 1 or B to 3), and with her they have 4: she pays 0, and so does bidder 3. Revenue 0. Without bidder 3 the best total is 4, and the winner pays 4: revenue 4.',
      it: 'A a 2 e B a 3, totale 8. Senza l\'offerente 2 gli altri arriverebbero a 4 (AB a 1 o B a 3), e con lui hanno 4: paga 0, come l\'offerente 3. Ricavo 0. Senza l\'offerente 3 il totale migliore è 4, e chi vince paga 4: ricavo 4.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Panel B. "Two names": against bidder 1 (AB 4), a bidder who values AB at 6 bids as one person, then as two names, A 4 and B 4. What does she win, pay and keep?',
      it: 'Su carta, poi nel Pannello B. «Due nomi»: contro l\'offerente 1 (AB 4), un offerente che valuta AB 6 offre come una persona, poi con due nomi, A 4 e B 4. Che cosa vince, paga e tiene?',
    },
    solution: {
      en: 'As one person she wins AB, pays 4 (what bidder 1 loses) and keeps 2. As two names each name wins one object and pays 4 − 4 = 0, since without it the others still reach 4: she wins both for 0 and keeps 6, and the seller gets nothing.',
      it: 'Come una persona vince AB, paga 4 (ciò che perde l\'offerente 1) e tiene 2. Con due nomi ogni nome vince un oggetto e paga 4 − 4 = 0, perché senza di esso gli altri arrivano comunque a 4: vince entrambi per 0 e tiene 6, e il venditore non riceve nulla.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Figure F2. Values and costs uniform 0–100: find the expected gains from trade and the chance of trade when trading whenever v ≥ c, with a posted price of 50, and when splitting the difference (trade when v ≥ c + 25).',
      it: 'Su carta, poi nella Figura F2. Valori e costi uniformi tra 0 e 100: trova i guadagni attesi dallo scambio e la probabilità di scambio quando si scambia ogni volta che v ≥ c, con un prezzo fisso di 50, e dividendo la differenza (scambio quando v ≥ c + 25).',
    },
    solution: {
      en: 'v ≥ c: half the square, chance 1/2; the gap v − c averages 100/3 there, so the gains are 100/6 = 16.67, and the designer pays 16.67. Posted price 50: chance 1/2 × 1/2 = 1/4, and the gap averages 75 − 25 = 50, so 12.5. Splitting the difference: a triangle of side 75, chance 75²/2 over 100² = 9/32, gains 14.06 (9/64 of 100).',
      it: 'v ≥ c: metà del quadrato, probabilità 1/2; lì la differenza v − c vale in media 100/3, quindi i guadagni sono 100/6 = 16,67, e il progettista paga 16,67. Prezzo fisso 50: probabilità 1/2 × 1/2 = 1/4, e la differenza vale in media 75 − 25 = 50, quindi 12,5. Dividendo la differenza: un triangolo di lato 75, probabilità 75²/2 su 100² = 9/32, guadagni 14,06 (9/64 di 100).',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Panel C. 20 users, 10 slots, uniform price: find the miner\'s expected revenue when honest and with one fake bid just below the tenth bid.',
      it: 'Su carta, poi nel Pannello C. 20 utenti, 10 posti, prezzo uniforme: trova il ricavo atteso del miner onesto e con una sola offerta falsa appena sotto la decima.',
    },
    solution: {
      en: 'Honest: the ten winners pay the 11th highest value, 100 × 10/21 on average: 476.19. With the fake they pay about the 10th highest value, 100 × 11/21: 10 × 100 × 11/21 = 523.81. The best cheating, about 547, needs the panel.',
      it: 'Da onesto: i dieci vincitori pagano l\'undicesimo valore più alto, in media 100 × 10/21: 476,19. Con l\'offerta falsa pagano circa il decimo valore più alto, 100 × 11/21: 10 × 100 × 11/21 = 523,81. L\'imbroglio migliore, circa 547, richiede il pannello.',
    },
  },
]
