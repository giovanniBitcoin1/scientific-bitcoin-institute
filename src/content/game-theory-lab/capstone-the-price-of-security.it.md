<!-- DRAFT: to be reviewed by Adriano -->

## Che cosa compra la sicurezza

Una *blockchain* è sicura finché riscriverla costa più di quanto renda. Nulla nel protocollo vieta di riscriverla: chi produce la catena più lunga decide la storia, e il [modulo 13](/game-theory-lab/mining-as-a-game) ha mostrato che le regole reggono solo finché seguirle conviene. Questo modulo si chiede quanto costi far sì che convenga, e chi ne sostenga il costo.

Ci sono tre tipi di attaccante.

- **Chi fa una doppia spesa** paga un commerciante, aspetta che questi consegni la merce, poi pubblica una catena più lunga in cui il pagamento non è mai avvenuto (Narayanan e coautori 2016, sezione 2.3). Attacca solo se l'attacco rende.
- **Il sabotatore** vuole che Bitcoin fallisca, a qualunque costo: un concorrente, un governo, chi ha scommesso al ribasso sulla moneta. Joshua Kroll, Ian Davey ed Edward Felten (2013) l'hanno chiamato **attacco *Goldfinger***, dal cattivo che voleva rendere senza valore l'oro di Fort Knox invece di rubarlo. Il profitto non è il suo obiettivo, quindi un modello costruito sul profitto non lo frena.
- **Chi noleggia** non compra affatto le macchine. Per Joseph Bonneau (2016) l'*hash rate* si può prendere a nolo su un mercato (il **noleggio di potenza di calcolo**), oppure si possono pagare i *miner* perché lavorino sulla catena dell'attaccante (la **corruzione**, *bribery*), persino attraverso un *pool* di *mining* che paga più di quanto incassa.

Le deviazioni del modulo 13 piegavano le regole: chi fa *selfish mining* costruisce comunque blocchi validi e sceglie solo quando mostrarli. Questo modulo parla di infrangerle.

## Tre equazioni

Eric Budish (2025; prima versione 2018) ha ridotto la domanda a tre equazioni. Sia N* la potenza di calcolo onesta (*trust support*, nelle sue parole), c il suo costo per blocco per ogni unità, e p_block ciò che i miner ricevono per un blocco, il sussidio più le commissioni.

**Profitti nulli.** Il *mining* è aperto a tutti, quindi i miner onesti entrano finché spendono ciò che guadagnano: è la **condizione di profitti nulli**.

```math
N*·c = p_block                         (1)
```

**Compatibilità degli incentivi.** Un attaccante con A volte la potenza di calcolo onesta deve continuare a minare in media per t(A) blocchi prima che la sua catena segreta superi quella onesta. L'attacco deve costargli più del V_attack che gli rende: è il **vincolo di compatibilità degli incentivi**.

```math
A·N*·c·t(A) > V_attack                 (2)
```

Questo è il costo **lordo**. L'attaccante incassa anche le ricompense dei blocchi della sua nuova catena, che qui restano fuori; il Teorema 2 di Budish mostra che, senza attriti, senza cambi di difficoltà e senza crollo del prezzo, quelle ricompense lo ripagano esattamente, e il costo netto è zero.

**Insieme.** Si mette la (1) nella (2), con l'attaccante che sceglie l'A che rende minimo A·t(A), cioè A*:

```math
p_block > V_attack / (A*·t(A*))         (3)
```

A sinistra c'è un **flusso**, pagato in ogni blocco finché la catena esiste. A destra c'è uno **stock**, un guadagno una volta sola. L'equazione (3) dice che il flusso deve essere grande rispetto allo stock, e che cresce in proporzione a esso: proteggere il doppio del valore costa il doppio, per sempre.

Quanto dura un attacco? Budish fa attendere al commerciante e blocchi di *escrow* (un deposito in garanzia) dopo che la transazione dell'attaccante è entrata in un blocco, e k conta i blocchi in cui l'attaccante colloca le sue transazioni. Quando la catena onesta ha n = k + e blocchi, la catena privata dell'attaccante ne ha m con una probabilità binomiale negativa; se è indietro, il suo vantaggio cresce in media di A − 1 per ogni blocco onesto, quindi colmare uno svantaggio di i blocchi e passare avanti di uno richiede (i + 1)/(A − 1) blocchi in più. Il suo caso base è un'ora di ciascuno, k + e = 12: allora A* = 1,43, una quota del 59% di tutta la potenza di calcolo (un **attacco del 51%**, o attacco di maggioranza, con margine), e t(A*) = 13,99 blocchi. Ogni blocco deve quindi pagare circa il 5,00% del valore in gioco, il 720% al giorno. Scoraggiare così un attacco da 1 miliardo di dollari costerebbe circa 2,63 mila miliardi di dollari all'anno. La Figura F1 ricalcola la sua tabella di t(A).

```figure
flow
```

## I numeri di oggi

Il **sussidio del blocco** è di 3,125 BTC. Le commissioni sono state in media di 0,0201 BTC per blocco nella settimana al 23 novembre 2026, lo 0,64% di ciò che i miner hanno incassato (Hashrate Index). A 60.374 dollari, la chiusura di CoinGecko del 25 novembre 2026, un blocco paga p_block = 189.882 dollari. Con k + e = 12, A*·t(A*) vale 20,0, quindi il flusso scoraggia attacchi che valgono fino a circa 20 volte p_block: 3,80 milioni di dollari. Se tutti attendessero una settimana, k + e = 1.008, il multiplo sarebbe 1.099, e sarebbero scoraggiati attacchi fino a 208,68 milioni di dollari.

È questo il punto di Budish. Bitcoin muove ogni giorno somme molto più grandi, quindi se il suo modello descrivesse il mondo qualcuno avrebbe già attaccato. Il Pannello A parte da questi valori datati, ciascuno con la sua fonte.

## Le obiezioni

Ogni obiezione è un gioco già incontrato nel corso.

- **L'*hash rate* non si noleggia su questa scala.** Il 25–26 novembre 2026 NiceHash offriva 8,85 EH/s per SHA-256, lo 0,87% di una rete di 1.019 EH/s (media di 30 giorni, Hashrate Index, 23 novembre). Un attaccante a cui serve il 143% della rete deve possedere le macchine: un **capitale specifico**, che fuori dal *mining* non vale quasi nulla. A 1,43 volte la rete e 18,28 dollari per TH/s (l'indice dei prezzi di Luxor per le macchine sotto 14 J per TH, 24 novembre 2026; il valore non si muove da agosto e potrebbe non essere aggiornato), sono 26,62 miliardi di dollari di hardware, contro 45,85 GWh di energia per l'attacco in sé, 2,29 milioni di dollari a 13,5 J per TH e 0,05 dollari per kWh. Solo l'hardware è un ostacolo serio.
- **L'attacco distrugge ciò che l'attaccante possiede.** Se un attacco visibile fa crollare il prezzo di Bitcoin, le sue macchine, buone solo a questo, e le sue monete perdono valore: paga uno stock oltre al flusso. Budish calcola che il pagamento necessario scende allora di un fattore di circa 2.500. La sua risposta è che questa protezione poggia sulla possibilità del crollo, e che il crollo invita al **sabotaggio**: chi vuole il danno in sé non ne è scoraggiato. Il rischio di crollo, scrive, non sembra un fondamento plausibile per un nuovo sistema economico. È la logica del [modulo 04](/game-theory-lab/sequential-games-commitment): una minaccia vale ciò che costa a chi la esegue.
- **La vittima reagisce.** Daniel Moroz, Daniel Aronoff, Neha Narula e David Parkes (2020) permettono alla vittima di una doppia spesa un **contrattacco**, riscrivendo di nuovo la catena per annullare l'attacco. I due combattono allora una **guerra di logoramento**, in cui ciascuno paga per restare in gara, e la sua minaccia porta a un equilibrio perfetto nei sottogiochi in cui nessuno attacca. Come nel [modulo 06](/game-theory-lab/repeated-games-reputation), una punizione credibile non ha bisogno di essere usata; il loro risultato presuppone che ogni nuovo round costi di più e che alla vittima importi la propria reputazione.
- **I commercianti possono aspettare.** Più conferme alzano k + e, e con esso A*·t(A*): da 20,0 a 1.099 nei numeri qui sopra. Aspettare compra sicurezza, ma lentamente, e solo per chi aspetta.
- **Gli utenti possono rifiutare una catena d'attacco.** Exchange, commercianti e nodi potrebbero decidere che una catena che cancella ore di storia non è Bitcoin: un gioco di coordinamento fuori da ogni modello qui, il più difficile da tradurre in numeri.

## Quando il sussidio scende

Il sussidio si dimezza ogni 210.000 blocchi, circa quattro anni (l'*halving*, il dimezzamento): 3,125 BTC dall'aprile 2024, 1,5625 nel 2028. Dopo 33 *halving*, l'ultimo dei quali lo azzera, il totale emesso sarà di 20.999.999,9769 BTC. Per mantenere gli attuali 3,145 BTC per blocco (il sussidio più 0,02 di commissioni), le commissioni dovrebbero essere 79 volte quelle di oggi nel 2028 e 118 volte nel 2032. La Figura F2 mostra l'orologio.

```figure
clock
```

Le commissioni possono prendere il posto del sussidio? Raphael Auer (2019) sostiene di no, da sole: ogni utente paga la propria transazione, ma beneficia della sicurezza che comprano le commissioni di tutti gli altri, quindi si comporta da *free rider*, e le commissioni offerte restano al di sotto di ciò che la sicurezza richiede.

Miles Carlsten, Harry Kalodner, Matthew Weinberg e Arvind Narayanan (2016) hanno mostrato che cosa cambia quando le commissioni sono l'intera ricompensa. Con blocchi trovati in tempi casuali e commissioni che affluiscono a ritmo costante, la ricompensa di un blocco dipende da quanto tempo è passato dal precedente, quindi le ricompense variano quanto gli intervalli. Un blocco per caso ricco conviene biforcarlo, per prenderne le commissioni (*undercutting*). Il *selfish mining* conviene a un miner di qualunque dimensione. E subito dopo un blocco, quando le commissioni in attesa sono poche, può convenire spegnere le macchine finché non si riaccumulano: un *mining gap*. Il Pannello B disegna queste ricompense. Gur Huberman, Jacob Leshno e Ciamac Moallemi (2021) collegano a questa domanda il mercato delle commissioni del [modulo 11](/game-theory-lab/auctions): le commissioni sono alte solo quando i blocchi sono pieni, quindi è la disponibilità degli utenti ad aspettare a fissare il ricavo dei miner.

## Fai il conto tu

Ogni numero di questo modulo dipende da ipotesi. Il Pannello C è un foglio di lavoro. Ogni valore ha un campo per la sua fonte e la sua data, e il risultato è una frase della forma «con queste ipotesi un attacco che vale V è, o non è, scoraggiato». Non è mai un verdetto su Bitcoin, solo su un modello con dentro i tuoi numeri.

## Che cosa ha mostrato il corso

Quattordici moduli hanno costruito una sola cassetta degli attrezzi. L'equilibrio ([modulo 02](/game-theory-lab/nash-equilibrium)) chiede se qualcuno vuole deviare. Le minacce credibili (modulo 04) chiedono se una punizione verrebbe eseguita. Il gioco ripetuto (modulo 06) mostra come l'ombra del futuro tenga insieme un cartello, o una catena. Le coalizioni ([modulo 10](/game-theory-lab/coalitions-sharing)) chiedono chi si unisce a chi, e le aste e i meccanismi (modulo 11 e [modulo 12](/game-theory-lab/mechanism-design)) come le regole plasmino ciò che le persone dichiarano e pagano. Il *mining* (modulo 13) li ha messi insieme.

Bitcoin è un gioco che deve restare un equilibrio, blocco dopo blocco, senza nessuno al comando. Le equazioni di Budish sono un modo di dargli un prezzo, e le obiezioni sono ragioni per pensare che il prezzo possa essere più basso, o pagato in altri modi. Quale di esse regga è aperto: un insieme di ipotesi da mettere alla prova con i numeri, non una conclusione da vendere.

<!-- simulation -->

## Letture consigliate

- Budish, E. (2025). Trust at scale: the economic limits of cryptocurrencies and blockchains. *Quarterly Journal of Economics* 140(1), 1–62. Sezioni III (le tre equazioni, Teoremi 1 e 2), IV (l'attacco di doppia spesa, Proposizione 3, Tabelle II e III) e V (capitale specifico e crollo). Prima versione: The economic limits of Bitcoin and the blockchain, NBER Working Paper 24717 (2018).
- Carlsten, M., Kalodner, H., Weinberg, S. M. and Narayanan, A. (2016). On the instability of Bitcoin without the block reward. *ACM CCS 2016*, 154–167.
- Kroll, J. A., Davey, I. C. and Felten, E. W. (2013). The economics of Bitcoin mining, or Bitcoin in the presence of adversaries. *Workshop on the Economics of Information Security (WEIS 2013)*.
- Bonneau, J. (2016). Why buy when you can rent? Bribery attacks on Bitcoin-style consensus. *Financial Cryptography 2016 Workshops*, LNCS 9604, 19–26.
- Moroz, D. J., Aronoff, D. J., Narula, N. and Parkes, D. C. (2020). Double-spend counterattacks: threat of retaliation in proof-of-work systems. *Cryptoeconomic Systems 2020*; arXiv:2002.10736.
- Auer, R. (2019). Beyond the doomsday economics of "proof-of-work" in cryptocurrencies. BIS Working Paper 765.
- Huberman, G., Leshno, J. D. and Moallemi, C. (2021). Monopoly without a monopolist: an economic analysis of the Bitcoin payment system. *Review of Economic Studies* 88(6), 3011–3040.
- Nakamoto, S. (2008). Bitcoin: a peer-to-peer electronic cash system. Sezioni 6 (incentivo) e 11 (calcoli).
- Narayanan, A., Bonneau, J., Felten, E., Miller, A. and Goldfeder, S. (2016). *Bitcoin and Cryptocurrency Technologies*. Princeton University Press. Cap. 2 (2.3, consenso senza identità: la doppia spesa) e cap. 5 (5.5, incentivi e strategie del *mining*: corruzione, *Goldfinger*).
