<!-- DRAFT: to be reviewed by Adriano -->

## Quattro modi di vendere un oggetto

Le parti I–III davano per date le regole di un gioco e si chiedevano come giocarlo. La parte IV rovescia la domanda: qualcuno sceglie le regole, e anche questa scelta si può studiare. Le aste sono i più antichi tra i giochi progettati. Un venditore che ha un solo oggetto e più compratori interessati può venderlo in modi diversi, e ciascun modo è un gioco diverso.

Nell'**asta inglese** (asta ascendente) il prezzo sale, annunciato dal banditore o dagli offerenti, finché non resta un solo offerente, che si aggiudica l'oggetto all'ultimo prezzo. Nell'**asta olandese** (asta discendente) un orologio parte da un prezzo alto e scende; il primo offerente che si fa avanti lo ferma e compra a quel prezzo. In un'**asta in busta chiusa** ogni offerente scrive un'offerta senza vedere quelle degli altri; vince chi ha fatto l'offerta più alta, e paga la propria offerta (**primo prezzo**) oppure la seconda offerta più alta (**secondo prezzo**). L'asta al secondo prezzo fu studiata da William Vickrey (1961) e per questo si chiama spesso asta di Vickrey.

Supponiamo **valori privati**: ogni offerente sa quanto vale per sé l'oggetto, mentre degli altri sa soltanto come sono distribuiti i loro valori. Un'asta è allora un gioco a informazione incompleta, un gioco bayesiano nel senso del [modulo 05](/game-theory-lab/incomplete-information-signalling): una strategia indica quanto offrire per ciascun valore possibile. Nell'esempio guida ci sono due offerenti con valori indipendenti e uniformi tra 0 e 100.

Due dei quattro formati sono gli altri due sotto mentite spoglie. Nell'asta olandese un offerente decide soltanto il prezzo a cui fermerebbe l'orologio se nessuno lo avesse fermato prima. Se è il primo, paga quel prezzo: è un'offerta in busta chiusa al primo prezzo, scritta su un orologio. Nell'asta inglese con valori privati un offerente resta in gara finché il prezzo è sotto il suo valore e si ritira quando lo raggiunge. L'asta finisce quando si ritira l'ultimo rivale, al valore di quel rivale: il secondo valore più alto, cioè proprio ciò che fa pagare un'asta al secondo prezzo quando ognuno offre il proprio valore.

## Dire la verità

Nell'asta al secondo prezzo offrire il proprio valore è una strategia debolmente dominante. Il motivo è che la tua offerta decide se vinci, mai quanto paghi: il prezzo è h, la più alta tra le offerte altrui. Sia v il tuo valore. Se offri più di v, l'aggiunta cambia l'esito solo quando h è compreso tra v e la tua offerta: allora vinci e paghi h, più di quanto l'oggetto valga per te. Se offri meno di v, la differenza conta solo quando h è compreso tra la tua offerta e v: allora perdi una vittoria che ti avrebbe reso v − h. Qualunque cosa facciano gli altri, offrire v non è mai peggio di un'altra offerta. La Figura F1 mostra il tuo *payoff* in funzione della tua offerta; al primo prezzo il quadro cambia, perché ora vincere ti costa proprio la tua offerta.

```figure
truth
```

Per offrire bene non serve sapere nulla degli altri, cosa rara nella teoria dei giochi. I siti di aste online che ti fanno indicare un importo massimo e poi rilanciano per te, un passo alla volta fino a quel massimo, funzionano come un'asta al secondo prezzo. Chi vince paga all'incirca il secondo massimo più alto (David Lucking-Reiley 2000).

## Abbassare l'offerta

Nell'asta al primo prezzo offrire il proprio valore garantisce un payoff di 0: quando vinci, paghi tutto ciò che l'oggetto vale per te. Conviene quindi offrire meno, cioè praticare il *bid shading* (l'autoriduzione dell'offerta); la domanda è di quanto. Un'offerta più bassa ti lascia di più quando vince, ma vince meno spesso.

Prendiamo n offerenti con valori uniformi tra 0 e 100. In equilibrio ognuno offre (n − 1)/n del proprio valore: la metà con due offerenti. Con due offerenti e un valore di 80 offri 40. L'altro offre metà del suo valore: vinci quindi quando il suo valore è sotto 80, con probabilità 0,8, e il tuo payoff atteso è 0,8 × 40 = 32. La Figura F2 mostra il payoff atteso di ogni offerta quando gli altri seguono la strategia di equilibrio.

```figure
shading
```

Dietro la formula c'è una regola generale. In equilibrio un offerente offre il valore atteso del più alto tra i valori altrui, sapendo che è inferiore al proprio. Così, ogni volta che vince, paga in media quanto gli avrebbe fatto pagare un'asta al secondo prezzo. Più offerenti ci sono, più è probabile che il rivale più forte sia vicino e meno spazio resta per abbassare l'offerta: con dieci offerenti l'offerta è il 90% del valore.

## Lo stesso ricavo in media

Ora la domanda del venditore: quale formato rende di più? Con due offerenti il secondo prezzo rende il valore più basso atteso, 33,33. Il primo prezzo rende metà del valore più alto atteso, 66,67/2 = 33,33. Esattamente lo stesso.

Non è un caso. L'**equivalenza del ricavo** (Vickrey 1961 in casi particolari; Roger Myerson 1981; John Riley e William Samuelson 1981) riguarda valori privati indipendenti e offerenti a cui interessa solo il payoff atteso. Afferma che ogni asta che assegna l'oggetto all'offerente con il valore più alto, e non lascia nulla a un offerente con il valore più basso possibile, rende in media lo stesso. Con n offerenti e valori uniformi il ricavo medio è 100(n − 1)/(n + 1). Rientra nel teorema anche l'**asta *all-pay***, in cui tutti pagano la propria offerta e vince la più alta: è la gara del [modulo 02](/game-theory-lab/nash-equilibrium) con una sola differenza, cioè che vince sempre lo sforzo più alto, e rende lo stesso.

Le medie coincidono; i rischi no. Con due offerenti la deviazione standard del ricavo è 23,57 nell'asta al secondo prezzo, 11,79 in quella al primo prezzo e 21,08 nell'asta all-pay. Il secondo prezzo dipende solo dal valore più basso, che può cadere ovunque tra 0 e 100; il primo prezzo dipende da metà del valore più alto, che varia meno.

Un **prezzo di riserva**, sotto il quale il venditore si tiene l'oggetto, alza la media: si perdono le vendite sotto la riserva, ma chi vince paga almeno la riserva anche quando il secondo valore è più basso. Con valori uniformi il prezzo di riserva migliore è 50, qualunque sia il numero di offerenti (Myerson 1981; Riley e Samuelson 1981). Con due offerenti rende 41,67 invece di 33,33, ma l'oggetto resta invenduto una volta su quattro, quando entrambi i valori sono sotto 50. Eppure un offerente in più vale più della riserva migliore (Jeremy Bulow e Paul Klemperer 1996): tre offerenti senza riserva rendono 50. La Simulazione A simula migliaia di aste in ciascun formato.

## La maledizione del vincitore

Cambiamo oggetto. Un giacimento di petrolio contiene lo stesso petrolio chiunque lo trivelli: il suo valore è **comune**, lo stesso per tutti, ma nessuno lo conosce e ogni offerente ne ha una propria stima. Edward Capen, Robert Clapp e William Campbell (1971), ingegneri del settore petrolifero, attribuirono gli scarsi rendimenti delle concessioni petrolifere in mare a quella che chiamarono la **maledizione del vincitore**. Max Bazerman e William Samuelson (1983) la mostrarono mettendo all'asta barattoli di monete tra studenti di un MBA: ogni barattolo conteneva 8 dollari, la stima media era 5,13 dollari, eppure l'offerta vincente era in media 10,01 dollari.

Un modello. Ogni stima è il valore più un errore uniforme entro ±a. Se ognuno offre la propria stima in un'asta al primo prezzo, vince l'offerente con la stima più alta, cioè quello che ha sovrastimato di più. In media paga un sovrapprezzo di a(n − 1)/(n + 1): con a = 10, di 3,33 con due offerenti, 6,67 con cinque, 8,18 con dieci. Più sono gli offerenti, peggio va.

Un offerente prudente offre come se la sua stima fosse la più alta, perché è l'unico caso in cui la sua offerta conta. Lontano dagli estremi dell'intervallo dei valori, l'offerta di equilibrio è la stima meno a nell'asta al primo prezzo (John Kagel e Dan Levin 1986) e la stima meno a(n − 2)/n in quella al secondo prezzo (Kagel, Levin e Ronald Harstad 1995). Con valore comune i formati non rendono più lo stesso: il secondo prezzo rende più del primo. L'asta inglese, in cui si vedono gli altri ritirarsi e se ne trae informazione, rende almeno quanto il secondo prezzo (Paul Milgrom e Robert Weber 1982). La Simulazione B mette all'asta il barattolo di monete.

## Molte unità

Ora il venditore ha k unità identiche e n offerenti che ne vogliono una ciascuno. In un'**asta discriminatoria** (*pay-your-bid*, «paghi la tua offerta») vincono le k offerte più alte e ogni vincitore paga la propria offerta. In un'**asta a prezzo uniforme** tutti i vincitori pagano lo stesso prezzo, la più alta delle offerte escluse. Con un'unità a testa il prezzo uniforme è di nuovo l'asta di Vickrey: la tua offerta decide se vinci, quelle degli altri decidono il prezzo, e offrire il proprio valore è dominante. Nell'asta discriminatoria gli offerenti abbassano l'offerta, come al primo prezzo. In media entrambe rendono 100 k(n − k)/(n + 1), ancora una volta l'equivalenza del ricavo, ma l'asta discriminatoria è molto meno rischiosa.

Quando gli offerenti vogliono più unità, il prezzo uniforme perde il suo pregio: l'offerta per una seconda unità può fissare il prezzo pagato per la prima, e a un offerente conviene chiedere meno unità di quante ne voglia (**riduzione della domanda**; Vijay Krishna, cap. 13). La questione è concreta: nel 1998 il Tesoro degli Stati Uniti è passato, per le aste dei suoi titoli di Stato, dall'asta discriminatoria al prezzo uniforme. La Simulazione C mette in vendita i posti di un blocco.

```box
Lo spazio nel blocco: un'asta ogni dieci minuti
**Che cosa si vende.** Lo spazio nel prossimo blocco: da SegWit (2017), al massimo 4 milioni di unità di peso. Ogni transazione offre una commissione, e i *miner* riempiono il blocco con le transazioni che offrono la commissione per unità di peso più alta. Bitcoin vende lo spazio nel blocco con un'asta discriminatoria, molte unità alla volta, all'incirca ogni dieci minuti. I *wallet* stimano le commissioni cercando di prevedere le offerte altrui, e chi ha offerto troppo poco può alzare l'offerta sostituendo la transazione (*replace-by-fee*).

**Le commissioni come una coda.** Gur Huberman, Jacob Leshno e Ciamac Moallemi (2021) descrivono le commissioni come il prezzo della priorità in una coda: chi sopporta meno l'attesa paga di più. Quando nei blocchi c'è posto, le commissioni scendono verso la commissione minima che i nodi accettano di inoltrare. Un miner che chiedesse di più perderebbe le transazioni a favore degli altri miner, e l'entrata è libera: le commissioni nascono dalla congestione, non dalla scelta di un singolo miner.

**Un'altra regola.** Ron Lavi, Or Sattath e Aviv Zohar (2019) mostrano che con l'asta discriminatoria un blocco più grande può ridurre il ricavo dei miner. Propongono il prezzo monopolistico: ogni transazione inclusa paga la commissione inclusa più bassa, e il miner sceglie quante transazioni includere. Questa regola mantiene il ricavo quando il blocco cresce, resiste alle manipolazioni del miner e rende meno utile abbassare l'offerta al crescere del numero di utenti (Andrew Chi-Chih Yao 2020).

**Nella Simulazione C.** Con 20 utenti e 10 posti, l'asta discriminatoria e il prezzo uniforme raccolgono entrambi 476,19 in media; con posto per tutti e 20, nulla. Il prezzo monopolistico raccoglie circa 547 con 10 posti e circa 579 con 20, servendo circa 11 utenti e lasciandone fuori 9.

**Un'ipotesi, non una descrizione.** Qui ogni utente vuole un posto e i valori sono uniformi; le transazioni reali differiscono per dimensione e per urgenza, e possono aspettare il blocco successivo. Se ci si possa fidare del miner, che conduce l'asta, è la domanda del modulo 12.
```

## Il prossimo modulo

[Modulo 12](/game-theory-lab/mechanism-design): progettare le regole, dal principio di rivelazione al lemma di Myerson e al meccanismo VCG, e capire se ci si possa fidare di un banditore che conduce l'asta nel proprio interesse, come un miner.

<!-- simulation -->

## Letture consigliate

- Krishna, V. (2010). *Auction Theory*, 2ª ed. Academic Press. Cap. 2–3 (valori privati, equivalenza del ricavo), cap. 6 (valori interdipendenti), cap. 12–13 (molte unità).
- Tadelis, S. (2013). *Game Theory: An Introduction*. Princeton University Press. Cap. 13 (aste e offerte competitive).
- Shoham, Y. e Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Cap. 11 (aste).
- Roughgarden, T. (2016). *Twenty Lectures on Algorithmic Game Theory*. Cambridge University Press. Lezione 2 (basi della progettazione dei meccanismi: aste di un solo oggetto).
- Vickrey, W. (1961). Counterspeculation, auctions, and competitive sealed tenders. *Journal of Finance* 16, 8–37.
- Myerson, R. B. (1981). Optimal auction design. *Mathematics of Operations Research* 6, 58–73.
- Riley, J. G. e Samuelson, W. F. (1981). Optimal auctions. *American Economic Review* 71, 381–392.
- Milgrom, P. R. e Weber, R. J. (1982). A theory of auctions and competitive bidding. *Econometrica* 50, 1089–1122.
- Bulow, J. e Klemperer, P. (1996). Auctions versus negotiations. *American Economic Review* 86, 180–194.
- Capen, E. C., Clapp, R. V. e Campbell, W. M. (1971). Competitive bidding in high-risk situations. *Journal of Petroleum Technology* 23, 641–653.
- Bazerman, M. H. e Samuelson, W. F. (1983). I won the auction but don't want the prize. *Journal of Conflict Resolution* 27, 618–634.
- Kagel, J. H. e Levin, D. (1986). The winner's curse and public information in common value auctions. *American Economic Review* 76, 894–920.
- Kagel, J. H., Levin, D. e Harstad, R. M. (1995). Comparative static effects of number of bidders and public information on behavior in second-price common value auctions. *International Journal of Game Theory* 24, 293–319.
- Lucking-Reiley, D. (2000). Vickrey auctions in practice: from nineteenth-century philately to twenty-first-century e-commerce. *Journal of Economic Perspectives* 14, 183–192.
- Huberman, G., Leshno, J. D. e Moallemi, C. (2021). Monopoly without a monopolist: an economic analysis of the Bitcoin payment system. *Review of Economic Studies* 88, 3011–3040.
- Lavi, R., Sattath, O. e Zohar, A. (2019). Redesigning Bitcoin's fee market. *The Web Conference (WWW 2019)*, 2950–2956.
- Yao, A. C.-C. (2020). An incentive analysis of some Bitcoin fee designs. *ICALP 2020*, LIPIcs 168, 1:1–1:12.
