<!-- DRAFT: to be reviewed by Adriano -->

## Che cosa compra la sicurezza

Una *blockchain* è sicura finché riscriverla costa più di quanto renda. Nulla nel protocollo vieta di riscriverla: chi produce la catena più lunga decide la storia, e il [modulo 13](/game-theory-lab/mining-as-a-game) ha mostrato che le regole reggono solo finché seguirle conviene. Questo modulo si chiede quanto costi mantenerle convenienti e chi paghi.

Ci sono tre tipi di attaccante.

- **Chi fa una doppia spesa** paga un commerciante, aspetta che questi consegni la merce, poi pubblica una catena più lunga in cui il pagamento non è mai avvenuto (Narayanan e coautori 2016, sezione 2.3). Rivuole i suoi soldi: attacca solo se gli conviene.
- **Il sabotatore** (un concorrente, un governo, chi ha scommesso al ribasso sulla moneta) vuole che Bitcoin fallisca, a qualunque costo. Joshua Kroll, Ian Davey ed Edward Felten (2013) l'hanno chiamato **attacco *Goldfinger***, dal cattivo che voleva rendere senza valore l'oro di Fort Knox anziché rubarlo. Non cerca il profitto, quindi un modello basato sul profitto non lo frena.
- **Chi noleggia** non compra le macchine. Joseph Bonneau (2016) si è chiesto «perché comprare, se si può noleggiare?»: l'*hash rate* si prende a nolo su un mercato (il **noleggio di potenza di calcolo**), oppure si pagano i *miner* perché lavorino sulla catena dell'attaccante (la **corruzione**, *bribery*), persino attraverso un *pool* di *mining* che paga più di quanto incassa.

Le deviazioni del modulo 13 piegavano le regole: chi fa *selfish mining* costruisce comunque blocchi validi e sceglie solo quando mostrarli. Questo modulo parla di infrangerle.

## Tre equazioni

Eric Budish (2025; prima versione 2018) ha ridotto la domanda a tre equazioni. Siano N* la potenza di calcolo onesta (*trust support*, nei suoi termini), c il suo costo per blocco per ogni unità e p_block ciò che i miner ricevono per un blocco, il sussidio più le commissioni.

**Profitti nulli.** Il mining è aperto a tutti, quindi i miner onesti entrano finché spendono ciò che guadagnano: è la **condizione di profitti nulli**.

```math
N*·c = p_block                         (1)
```

**Compatibilità degli incentivi.** Un attaccante con A volte la potenza di calcolo onesta deve minare in media per t(A) blocchi prima che la sua catena privata superi quella onesta. L'attacco deve costargli più del V_attack che gli rende: è il **vincolo di compatibilità degli incentivi**.

```math
A·N*·c·t(A) > V_attack                 (2)
```

Questo è il costo **lordo**: lascia fuori le ricompense dei blocchi della nuova catena, che l'attaccante pure incassa. Il Teorema 2 di Budish mostra che, senza attriti, senza variazioni della difficoltà e senza un calo del prezzo, quelle ricompense lo ripagano esattamente: il costo netto è zero.

**Insieme.** Si sostituisce la (1) nella (2); l'attaccante sceglie l'A che rende minimo A·t(A), cioè A*:

```math
p_block > V_attack / (A*·t(A*))         (3)
```

A sinistra c'è un **flusso**, pagato in ogni blocco finché la catena esiste. A destra c'è uno **stock**, un guadagno *una tantum*. L'equazione (3) dice che il flusso deve essere grande rispetto allo stock e crescere in proporzione a esso: proteggere il doppio del valore costa il doppio, per sempre.

Quanto dura un attacco? Budish fa attendere il commerciante per e blocchi di *escrow* (deposito in garanzia) dopo che la transazione dell'attaccante è entrata in un blocco; k conta i blocchi in cui l'attaccante colloca le sue transazioni. Quando la catena onesta ha n = k + e blocchi, il numero m di blocchi della catena privata segue una distribuzione binomiale negativa. Se l'attaccante è indietro, recupera in media A − 1 blocchi per ogni blocco onesto, quindi colmare uno svantaggio di i blocchi e passare avanti di uno richiede (i + 1)/(A − 1) blocchi in più. Il caso base di Budish è un'ora per ciascuno, k + e = 12: allora A* = 1,43, una quota del 59% di tutta la potenza di calcolo (un **attacco del 51%**, o attacco di maggioranza, con margine), e t(A*) = 13,99 blocchi. Ogni blocco deve quindi pagare circa il 5,00% del valore in gioco, il 720% al giorno. Scoraggiare così un attacco da 1 miliardo di dollari costerebbe circa 2,63 mila miliardi di dollari all'anno. La Figura F1 ricalcola la tabella di t(A) di Budish e disegna il costo in funzione di A.

```figure
flow
```

## I numeri di oggi

Il **sussidio del blocco** è di 3,125 BTC. Le commissioni sono state in media di 0,0201 BTC per blocco nella settimana al 23 novembre 2026, lo 0,64% di ciò che i miner hanno incassato (Hashrate Index). A 60.374 dollari, la chiusura di CoinGecko del 25 novembre 2026, un blocco paga p_block = 189.882 dollari. Con k + e = 12, A*·t(A*) vale 20,0, quindi il flusso scoraggia attacchi fino a circa 20 volte p_block: 3,80 milioni di dollari. Se tutti attendessero una settimana (k + e = 1.008), il multiplo sarebbe 1.099 e sarebbero scoraggiati attacchi fino a 208,68 milioni di dollari.

È questo il punto di Budish. Bitcoin muove ogni giorno somme molto più grandi, quindi se il suo modello descrivesse il mondo qualcuno avrebbe già attaccato. Il Pannello A parte da questi valori datati, ciascuno con la sua fonte sotto il campo.

## Le obiezioni

Ogni obiezione è un gioco già incontrato.

- **L'hash rate non si noleggia su questa scala.** Il 25–26 novembre 2026 NiceHash offriva 8,85 EH/s per SHA-256, lo 0,87% di una rete di 1.019 EH/s (media a 30 giorni, Hashrate Index, 23 novembre). Un attaccante a cui serve il 143% della rete deve possedere le macchine: un **capitale specifico**, che fuori dal mining non vale quasi nulla. A 1,43 volte la rete e 18,28 dollari per TH/s (indice dei prezzi di Luxor, macchine sotto 14 J per TH, 24 novembre 2026; fermo da agosto, potrebbe non essere aggiornato), sono 26,62 miliardi di dollari di hardware. L'attacco in sé richiede 45,85 GWh di energia, 2,29 milioni di dollari a 13,5 J per TH e 0,05 dollari per kWh. Solo l'hardware è un ostacolo serio.
- **L'attacco distrugge ciò che l'attaccante possiede.** Se un attacco visibile fa crollare il prezzo di Bitcoin, le sue macchine, buone solo a questo, e le sue monete perdono valore: paga uno stock oltre al flusso. Budish calcola che il pagamento necessario scende allora di un fattore di circa 2.500. Risponde che questa protezione poggia sulla possibilità del crollo, che invita al **sabotaggio**: chi vuole il danno in sé non ne è scoraggiato. Il rischio di crollo, scrive, non sembra un fondamento plausibile per un nuovo sistema economico. È la logica del [modulo 04](/game-theory-lab/sequential-games-commitment): una minaccia vale ciò che costa a chi la esegue.
- **La vittima reagisce.** Daniel Moroz, Daniel Aronoff, Neha Narula e David Parkes (2020) concedono alla vittima di una doppia spesa un **contrattacco**: riscrivere a sua volta la catena per annullare l'attacco. I due si affrontano allora in una **guerra di logoramento**, in cui ciascuno paga per restare in gara, e la sola minaccia porta a un equilibrio perfetto nei sottogiochi in cui nessuno attacca. Come nel [modulo 06](/game-theory-lab/repeated-games-reputation), una punizione credibile non ha bisogno di essere usata; il loro risultato presuppone che ogni nuovo turno costi di più e che alla vittima importi la propria reputazione.
- **I commercianti possono aspettare.** Più conferme alzano k + e, e con esso A*·t(A*): da 20,0 a 1.099 nei numeri qui sopra. Aspettare compra sicurezza, ma lentamente, e solo per chi aspetta.
- **Gli utenti possono rifiutare una catena d'attacco.** *Exchange*, commercianti e gestori di nodi potrebbero decidere che una catena che cancella ore di storia non è Bitcoin: un gioco di coordinamento estraneo ai modelli visti qui, e il più difficile da tradurre in numeri.

## Quando il sussidio scende

Il sussidio si dimezza ogni 210.000 blocchi, circa quattro anni: 3,125 BTC dall'aprile 2024, 1,5625 nel 2028. Dopo 33 *halving* (dimezzamenti), l'ultimo dei quali lo azzera, il totale emesso sarà di 20.999.999,9769 BTC. Per mantenere gli attuali 3,145 BTC per blocco (il sussidio più 0,02 di commissioni), le commissioni dovrebbero essere 79 volte quelle di oggi nel 2028 e 118 volte nel 2032. La Figura F2 mostra l'orologio e quanto dovrebbero crescere le commissioni.

```figure
clock
```

Le commissioni possono sostituire il sussidio? Raphael Auer (2019) sostiene che da sole non possano. Ogni utente paga la propria transazione ma beneficia della sicurezza che comprano le commissioni altrui, quindi si comporta da *free rider*; le commissioni offerte restano allora sotto ciò che la sicurezza richiede.

Miles Carlsten, Harry Kalodner, Matthew Weinberg e Arvind Narayanan (2016) hanno mostrato che cosa cambia quando le commissioni sono l'intera ricompensa. Con blocchi trovati in tempi casuali e commissioni che affluiscono a ritmo costante, la ricompensa di un blocco dipende da quanto tempo è passato dal precedente, quindi le ricompense variano quanto gli intervalli. Se un blocco è per caso ricco, conviene biforcare la catena per prenderne le commissioni (*undercutting*). Il *selfish mining* conviene a un miner di qualunque dimensione. E subito dopo un blocco, quando le commissioni in attesa sono poche, può convenire spegnere le macchine finché non si riaccumulano: un *mining gap*. Il Pannello B disegna queste ricompense. Gur Huberman, Jacob Leshno e Ciamac Moallemi (2021) collegano a questa domanda il mercato delle commissioni del [modulo 11](/game-theory-lab/auctions): le commissioni sono alte solo quando i blocchi sono pieni, quindi è la disponibilità degli utenti ad aspettare a fissare il ricavo dei miner.

## Fai il conto tu

Ogni numero di questo modulo dipende da ipotesi: un prezzo, un hash rate, il costo dell'hardware, l'attesa del commerciante, gli scopi dell'attaccante. Il Pannello C è un foglio di lavoro. Ogni valore ha un campo per la fonte e uno per la data, e il risultato è una frase della forma «con queste ipotesi un attacco che vale V è, o non è, scoraggiato». Non è mai un verdetto su Bitcoin, solo su un modello con dentro i tuoi numeri.

## Che cosa ha mostrato il corso

Quattordici moduli hanno costruito una sola cassetta degli attrezzi. L'equilibrio ([modulo 02](/game-theory-lab/nash-equilibrium)) chiede se qualcuno vuole deviare. Le minacce credibili (modulo 04) chiedono se una punizione verrebbe eseguita. Il gioco ripetuto (modulo 06) mostra come l'ombra del futuro tenga insieme un cartello, o una catena. Le coalizioni ([modulo 10](/game-theory-lab/coalitions-sharing)) chiedono chi si unisce a chi, e le aste e i meccanismi (modulo 11 e [modulo 12](/game-theory-lab/mechanism-design)) come le regole plasmino ciò che le persone dichiarano e pagano. Il mining (modulo 13) li ha messi insieme.

Bitcoin è un gioco che deve restare un equilibrio, blocco dopo blocco, senza nessuno al comando. Le equazioni di Budish sono un modo di attribuirgli un prezzo, e le obiezioni suggeriscono che il prezzo possa essere più basso, o pagato in altri modi. Quale di esse regga resta aperto: è un insieme di ipotesi da mettere alla prova con i numeri, non una conclusione da vendere.

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
