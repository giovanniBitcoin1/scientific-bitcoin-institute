// Module 11 texts outside the lecture: "What to observe" for each panel and
// the exercises. Every number is pinned by scripts/lab/check-game-theory-11.mjs
// ("quoted on the page"); the simulated ones are those of run no. 1.

export const observe = {
  revenue: {
    en: `
1. The panel opens on two bidders, first price, no reserve, 10,000 auctions: the average revenue is 33.26 ± 0.12 against the exact 33.33, with a standard deviation of 11.81 (exact 11.79). The table runs the same draws under the other formats: 33.12 in the second price and 33.17 in the all-pay, with standard deviations 23.55 and 21.11 (exact 23.57 and 21.08).
2. Compare the histograms. The first price never raises more than 50 with two bidders (half the highest value); the second price spreads from 0 to 100, most often low, since it is the lower of two values.
3. Set the reserve to **50**: the average rises to 41.46 in the first price and 41.44 in the second (exact 41.67), and a share 0.2538 of the auctions ends without a sale (exact 0.25, one in four). The bidders' payoff falls from about 33 to about 16.6.
4. Back to no reserve, and three bidders: 49.74 in the first price, 49.94 in the second (exact 50). One more bidder beats the best reserve.
5. Ten bidders: the exact mean is 81.82 in every format, but the standard deviation is 7.47 in the first price, 11.13 in the second and 56.46 in the all-pay, whose histogram runs past 100.
6. Press **Run again**: the averages move by about one standard error. At 100,000 auctions, two bidders and the first price give 33.33 ± 0.04.
`,
    it: `
1. Il pannello si apre su due offerenti, primo prezzo, nessuna riserva, 10.000 aste: il ricavo medio è 33,26 ± 0,12 contro il valore esatto 33,33, con una deviazione standard di 11,81 (esatta 11,79). La tabella usa le stesse estrazioni negli altri formati: 33,12 al secondo prezzo e 33,17 nell'all-pay, con deviazioni standard 23,55 e 21,11 (esatte 23,57 e 21,08).
2. Confronta gli istogrammi. Con due offerenti il primo prezzo non raccoglie mai più di 50 (metà del valore più alto); il secondo prezzo si allarga da 0 a 100, più spesso in basso, perché è il più basso di due valori.
3. Porta la riserva a **50**: la media sale a 41,46 al primo prezzo e 41,44 al secondo (esatto 41,67), e una quota 0,2538 delle aste finisce senza vendita (esatta 0,25, una su quattro). Il payoff degli offerenti scende da circa 33 a circa 16,6.
4. Di nuovo senza riserva, con tre offerenti: 49,74 al primo prezzo, 49,94 al secondo (esatto 50). Un offerente in più batte la riserva migliore.
5. Dieci offerenti: la media esatta è 81,82 in ogni formato, ma la deviazione standard è 7,47 al primo prezzo, 11,13 al secondo e 56,46 nell'all-pay, il cui istogramma va oltre 100.
6. Premi **Nuova prova**: le medie si spostano di circa un errore standard. Con 100.000 aste, due offerenti e il primo prezzo danno 33,33 ± 0,04.
`,
  },
  curse: {
    en: `
1. The panel opens on five bidders, errors within ±10, first price, everyone bidding her estimate: the winner earns −6.64 ± 0.03 on average (exact −6.67) and loses money in a share 0.9691 of the auctions (exact 0.9688). Her estimate was too high in the same share: it is the highest of five.
2. Press **Break even**: the discount 6.67 brings the average profit to 0, yet the winner still loses money in a share 0.5913 of the auctions (exact 0.5981).
3. Press **Equilibrium**: with the discount 10 the winner earns 3.36 on average (exact 3.33) and never loses money, while the seller still gets 147.11 (exact 146.67).
4. Choose **Second price**: bidding the estimate now costs the winner 3.30 on average (exact 3.33), since she pays the second estimate. The equilibrium discount is 6, and there the seller gets 147.77 (exact 147.33): more than in the first price, as Milgrom and Weber predict.
5. Move n. With two bidders the first-price winner loses 3.31 (exact 3.33); with twelve, 8.45 (exact 8.46): the more bidders, the deeper the curse, and the larger the discount a careful bidder needs.
`,
    it: `
1. Il pannello si apre su cinque offerenti, errori entro ±10, primo prezzo, ognuno che offre la propria stima: il vincitore guadagna in media −6,64 ± 0,03 (esatto −6,67) e ci perde in una quota 0,9691 delle aste (esatta 0,9688). La sua stima era troppo alta nella stessa quota: è la più alta di cinque.
2. Premi **Pareggio**: lo sconto 6,67 porta il profitto medio a 0, eppure il vincitore ci perde ancora in una quota 0,5913 delle aste (esatta 0,5981).
3. Premi **Equilibrio**: con lo sconto 10 il vincitore guadagna in media 3,36 (esatto 3,33) e non ci perde mai, mentre il venditore riceve ancora 147,11 (esatto 146,67).
4. Scegli **Secondo prezzo**: offrire la stima ora costa al vincitore in media 3,30 (esatto 3,33), perché paga la seconda stima. Lo sconto di equilibrio è 6, e lì il venditore riceve 147,77 (esatto 147,33): più che al primo prezzo, come prevedono Milgrom e Weber.
5. Muovi n. Con due offerenti chi vince al primo prezzo perde 3,31 (esatto 3,33); con dodici, 8,45 (esatto 8,46): più offerenti, più profonda la maledizione, e più grande lo sconto che serve a un'offerente prudente.
`,
  },
  block: {
    en: `
1. The panel opens on 20 users and 10 slots. Pay your bid raises 476.15 ± 0.21 and the uniform price 475.21 ± 1.07 (exact 476.19 for both); their standard deviations are 20.77 and 106.56 (exact for the uniform price 106.48). The monopolistic price raises 546.62, serving 9.22 users on average.
2. Look at the bid chart: no user bids more than 50, the expected 10th highest of the other 19 values; a user with a value of 80 bids 49.95.
3. Set k to **20**: room for everyone, and pay your bid and the uniform price raise nothing. The monopolistic price still raises 578.47, serving 11.06 users and leaving the others out.
4. The revenue chart: pay your bid and the uniform price peak at k = 10, half of n, and fall to 0 at k = 20; the monopolistic price rises with k and stops at about 578.
5. Set k to **1**: one slot, a first-price auction; users bid 95% of their value and pay your bid raises 90.47 (exact 90.48).
`,
    it: `
1. Il pannello si apre su 20 utenti e 10 posti. «Paghi la tua offerta» raccoglie 476,15 ± 0,21 e il prezzo uniforme 475,21 ± 1,07 (esatto 476,19 per entrambi); le loro deviazioni standard sono 20,77 e 106,56 (esatta per il prezzo uniforme 106,48). Il prezzo monopolistico raccoglie 546,62, servendo in media 9,22 utenti.
2. Guarda il grafico delle offerte: nessun utente offre più di 50, il 10° valore più alto atteso degli altri 19; un utente con valore 80 offre 49,95.
3. Porta k a **20**: c'è posto per tutti, e «paghi la tua offerta» e il prezzo uniforme non raccolgono nulla. Il prezzo monopolistico raccoglie ancora 578,47, servendo 11,06 utenti e lasciando fuori gli altri.
4. Il grafico dei ricavi: «paghi la tua offerta» e il prezzo uniforme hanno il massimo a k = 10, metà di n, e scendono a 0 con k = 20; il prezzo monopolistico sale con k e si ferma a circa 578.
5. Porta k a **1**: un solo posto, un'asta al primo prezzo; gli utenti offrono il 95% del loro valore e «paghi la tua offerta» raccoglie 90,47 (esatto 90,48).
`,
  },
}

export const exercises = [
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Figure F1. Second price, value 60. The highest other bid is 70: what happens if you bid 80? It is 50: what happens if you bid 40?',
      it: 'Su carta, poi nella Figura F1. Secondo prezzo, valore 60. L\'offerta più alta degli altri è 70: che cosa succede se offri 80? È 50: che cosa succede se offri 40?',
    },
    solution: {
      en: 'Bidding 80 against 70, you win and pay 70: a loss of 10. Bidding 40 against 50, you lose a win worth 10 (60 − 50). Bidding 60 gives 0 in the first case and 10 in the second: it is never worse.',
      it: 'Offrendo 80 contro 70 vinci e paghi 70: una perdita di 10. Offrendo 40 contro 50 perdi una vittoria che valeva 10 (60 − 50). Offrire 60 dà 0 nel primo caso e 10 nel secondo: non è mai peggio.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Figure F2. First price, two bidders, values uniform 0–100, the other bids half her value. Your value is 80: find your best bid, the chance of winning and the expected payoff.',
      it: 'Su carta, poi nella Figura F2. Primo prezzo, due offerenti, valori uniformi tra 0 e 100, l\'altra offre metà del suo valore. Il tuo valore è 80: trova l\'offerta migliore, la probabilità di vincere e il payoff atteso.',
    },
    solution: {
      en: 'With a bid b you win when her value is below 2b, with probability 2b/100; the expected payoff (80 − b) · 2b/100 is largest at b = 40. The chance of winning is 0.8 and the expected payoff 0.8 × 40 = 32.',
      it: 'Con un\'offerta b vinci quando il suo valore è sotto 2b, con probabilità 2b/100; il payoff atteso (80 − b) · 2b/100 è massimo per b = 40. La probabilità di vincere è 0,8 e il payoff atteso 0,8 × 40 = 32.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Panel A. Two bidders: find the expected revenue of the second-price auction (the expected lower value) and of the first price (half the expected higher value). And with five bidders?',
      it: 'Su carta, poi nel Pannello A. Due offerenti: trova il ricavo atteso dell\'asta al secondo prezzo (il valore più basso atteso) e di quella al primo prezzo (metà del valore più alto atteso). E con cinque offerenti?',
    },
    solution: {
      en: 'The lower of two uniform values is 100/3 on average and the higher 200/3: 33.33 for the second price and (200/3)/2 = 33.33 for the first. With five bidders the second-highest value is 100 × 4/6 = 66.67 on average; the highest is 100 × 5/6, and the winner bids 4/5 of it: 66.67 again.',
      it: 'Il più basso di due valori uniformi vale in media 100/3 e il più alto 200/3: 33,33 per il secondo prezzo e (200/3)/2 = 33,33 per il primo. Con cinque offerenti il secondo valore più alto vale in media 100 × 4/6 = 66,67; il più alto 100 × 5/6, e chi vince ne offre i 4/5: di nuovo 66,67.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Panel A. Two bidders and a reserve of 50: find the expected revenue and the chance of no sale. And three bidders with no reserve?',
      it: 'Su carta, poi nel Pannello A. Due offerenti e una riserva di 50: trova il ricavo atteso e la probabilità che non ci sia vendita. E tre offerenti senza riserva?',
    },
    solution: {
      en: 'No sale when both values are below 50: 1/4. With x = v/100 and ρ = 1/2 the formula (n − 1)/(n + 1) + ρ^n − 2n ρ^(n + 1)/(n + 1) gives 1/3 + 1/4 − 1/6 = 5/12: 41.67. Three bidders and no reserve: 100 × 2/4 = 50.',
      it: 'Nessuna vendita quando entrambi i valori sono sotto 50: 1/4. Con x = v/100 e ρ = 1/2 la formula (n − 1)/(n + 1) + ρ^n − 2n ρ^(n + 1)/(n + 1) dà 1/3 + 1/4 − 1/6 = 5/12: 41,67. Tre offerenti senza riserva: 100 × 2/4 = 50.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Panel B. Errors within ±10; everyone bids her estimate in a first-price auction. Find the winner\'s average profit with 2, 5 and 10 bidders.',
      it: 'Su carta, poi nel Pannello B. Errori entro ±10; ognuno offre la propria stima in un\'asta al primo prezzo. Trova il profitto medio del vincitore con 2, 5 e 10 offerenti.',
    },
    solution: {
      en: 'The winner pays the value plus the highest of n errors, which is −10 + 20n/(n + 1) = 10(n − 1)/(n + 1) on average. Her profit is minus that: −3.33, −6.67 and −8.18.',
      it: 'Il vincitore paga il valore più il massimo di n errori, che in media è −10 + 20n/(n + 1) = 10(n − 1)/(n + 1). Il suo profitto è l\'opposto: −3,33, −6,67 e −8,18.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'On paper, then in Panel C. 20 users, 10 slots, values uniform 0–100: find the expected revenue of the uniform price and of pay your bid. And with 20 slots?',
      it: 'Su carta, poi nel Pannello C. 20 utenti, 10 posti, valori uniformi tra 0 e 100: trova il ricavo atteso del prezzo uniforme e di «paghi la tua offerta». E con 20 posti?',
    },
    solution: {
      en: 'Each winner pays the 11th highest value under the uniform price, 100 × 10/21 = 47.62 on average, so 10 × (10/21) × 100 = 476.19; revenue equivalence gives pay your bid the same. With 20 slots nobody is left out: 0 for both.',
      it: 'Con il prezzo uniforme ogni vincitore paga l\'11° valore più alto, in media 100 × 10/21 = 47,62, quindi 10 × (10/21) × 100 = 476,19; l\'equivalenza del ricavo dà lo stesso a «paghi la tua offerta». Con 20 posti nessuno resta fuori: 0 per entrambi.',
    },
  },
]
