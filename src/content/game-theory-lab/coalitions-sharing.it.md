<!-- DRAFT: to be reviewed by Adriano -->

## Che cosa può fare un gruppo

In tutti i moduli fin qui una promessa valeva solo quanto l'incentivo a mantenerla. Le imprese di un cartello potevano accordarsi su un prezzo, ma nulla impediva a una di loro di sottoquotare le altre il mattino dopo, e ogni equilibrio doveva reggersi da solo. Questo modulo toglie quel vincolo. Ora i giocatori possono firmare accordi vincolanti, fatti rispettare da un tribunale o da un contratto. La domanda non è più che cosa fa ciascuno da solo, ma che cosa possono ottenere i gruppi e come se lo dividono.

Un **gioco cooperativo** in forma coalizionale ha un insieme di giocatori N e, per ogni coalizione S (un gruppo qualsiasi di giocatori), un numero v(S): il suo **valore**, ciò che i membri di S possono ottenere da soli, qualunque cosa facciano gli altri. La funzione v è la **funzione caratteristica**; la coalizione vuota vale 0. Restiamo nei giochi a **utilità trasferibile** (giochi TU): il valore è denaro, o qualcosa di simile, che i membri possono passarsi uno a uno, quindi a una coalizione importa solo il totale.

Un esempio che ci accompagnerà. Tre soci, A, B e C, possono intraprendere dei progetti. Da soli fanno 0. A e B insieme possono guadagnare 70, A e C 60, B e C 40, e tutti e tre 100. Lavoreranno tutti e tre insieme? E se lo fanno, come devono dividersi il 100? La prima domanda qui è facile: i tre insieme fanno più di ogni coppia, e più di ogni coppia sommata al socio escluso. La seconda è l'argomento di questo modulo.

## Divisioni da cui nessuno se ne va

Una divisione x = (x_A, x_B, x_C) del 100 è sicura se nessun gruppo può fare meglio andandosene. A e B se ne andrebbero se insieme ricevessero meno di 70, perché senza C possono fare 70. Quindi una divisione sicura richiede

```math
x_A + x_B ≥ 70,   x_A + x_C ≥ 60,   x_B + x_C ≥ 40,   x_i ≥ 0
```

con x_A + x_B + x_C = 100. Queste divisioni formano il **nucleo** (*core*), introdotto da Donald Gillies e da Shapley nel 1952–53 e pubblicato da Gillies (1959): le divisioni in cui ogni coalizione riceve almeno il suo valore. Poiché le tre quote sommano a 100, la condizione di ogni coppia pone un tetto al socio che ne resta fuori: x_C ≤ 100 − 70 = 30, x_B ≤ 40, x_A ≤ 60. Il nucleo dei soci è il triangolo con vertici (60, 40, 0), (60, 10, 30) e (30, 40, 30).

Il nucleo può essere vuoto. Supponiamo che due soci qualsiasi possano fare 100 senza il terzo. Sommando le condizioni delle tre coppie si ottiene 2(x_A + x_B + x_C) ≥ 300: le coppie chiedono 150 quando c'è 100 da dividere. Qualunque divisione si proponga, una coppia riceve meno di quanto farebbe da sola e ha un motivo per andarsene; il socio rimasto escluso può allora offrire a uno dei due un accordo migliore, e così via, senza un punto di quiete.

Con tre giocatori che da soli valgono 0 il test è breve: il nucleo è non vuoto esattamente quando nessuna coppia vale più di v(N) e i valori delle tre coppie sommano al più a 2v(N). Per i soci la somma è 170, sotto 200. In generale il test è il **bilanciamento**. Olga Bondareva (1963) e Lloyd Shapley (1967) hanno mostrato, in modo indipendente, che il nucleo è non vuoto esattamente quando il gioco è **bilanciato**: nessun modo di ripartire il tempo di ciascun giocatore tra le coalizioni rende in totale più di v(N) (il teorema di Bondareva–Shapley). La Figura F1 disegna il triangolo delle divisioni: sposta i valori delle coppie per vedere il nucleo ridursi a un punto e sparire, e trascina una divisione per vedere quali coppie obiettano.

```figure
core
```

## Una quota equa

Il nucleo dice quali divisioni sono sicure, non quale scegliere, e può contenerne molte o nessuna. Shapley (1953) si pose un'altra domanda: qual è la quota equa di ciascuno? I giocatori arrivano uno alla volta, in un ordine casuale, e ciascuno riceve ciò che aggiunge al gruppo già presente, il suo **contributo marginale**. Se C arriva per primo aggiunge 0; dopo il solo A aggiunge 60; dopo il solo B, 40; per ultimo, 100 − 70 = 30. Il suo **valore di Shapley** è la media su tutti gli ordini.

Nella forma moderna, il risultato di Shapley dice che è l'unica regola con quattro proprietà: distribuisce esattamente v(N); tratta allo stesso modo due giocatori che aggiungono lo stesso a ogni coalizione; dà 0 a un **giocatore nullo**, che non aggiunge nulla a nessuna coalizione; e nella somma di due giochi la quota di ciascuno è la somma delle sue quote. Con tre giocatori che da soli valgono 0 la media diventa

```math
φ_A = (2v(N) + v(AB) + v(AC) − 2v(BC)) / 6
```

I soci ricevono 125/3, 95/3 e 80/3, cioè 41,67, 31,67 e 26,67: un punto dentro il nucleo. Ma equità e stabilità possono separarsi. Se A e B potessero fare 90, il valore di Shapley diventerebbe 45, 35 e 20, fuori dal nucleo: insieme A e B riceverebbero 80, e da soli potrebbero fare 90. Nei giochi **convessi**, dove un giocatore aggiunge di più a un gruppo più grande, le due cose non si separano mai: il valore di Shapley sta sempre nel nucleo (Shapley 1971).

Il Pannello A calcola il valore di Shapley da tutti gli ordini e verifica il nucleo con un programma lineare. Contiene due classici. Nel **gioco dei guanti** due giocatori hanno un guanto sinistro e uno un guanto destro, e si vende solo un paio, a 1. Il valore di Shapley dà 1/6 a ogni guanto sinistro e 2/3 al destro. Il nucleo è più severo: la sua unica divisione è (0, 0, 1), tutto al guanto destro, perché ogni guanto sinistro può essere sostituito dall'altro. Nel **gioco dell'aeroporto** (Stephen Littlechild e Guillermo Owen 1973) aerei di dimensioni diverse condividono una pista, e una coalizione paga la pista più lunga che le serve. Il suo valore di Shapley ha una forma semplice: ogni tratto della pista è pagato in parti uguali dagli aerei che ne hanno bisogno.

## Il potere non è il peso

In un **gioco a maggioranza pesata** ogni giocatore ha un peso, e una coalizione vince se i suoi pesi raggiungono una **quota**; una coalizione vincente vale 1 e una perdente 0. L'**indice di potere di Shapley–Shubik** (Shapley e Martin Shubik 1954) è il valore di Shapley di questo gioco: la quota degli ordini in cui un giocatore è **pivotale** (il *pivot*), quello che trasforma un gruppo perdente in uno vincente. L'**indice di Banzhaf** (John Banzhaf 1965, anticipato da Lionel Penrose 1946) conta invece le coalizioni per cui un giocatore è **cruciale**: vincono con lui e perdono senza.

Il Consiglio delle prime Comunità europee, dal 1958, è il caso da manuale. Francia, Germania e Italia avevano 4 voti ciascuna, Belgio e Paesi Bassi 2, il Lussemburgo 1, e un atto proposto dalla Commissione richiedeva 12 voti su 17. Con questa regola il voto del Lussemburgo non decise mai nulla: tutti gli altri pesi erano pari, e anche la quota, quindi il suo unico voto non trasformava mai un totale perdente in uno vincente. La Figura F2 dà i due indici per ogni quota da 9 a 17: il potere del Lussemburgo è 0 a ogni quota pari.

```figure
votes
```

Il peso può ingannare anche nell'altro senso. Tre partiti con 49, 49 e 2 seggi e una maggioranza di 51: due qualsiasi vincono e nessuno vince da solo, quindi tutti e tre hanno lo stesso potere, 1/3 ciascuno. Il Pannello B calcola i due indici fino a 30 giocatori.

## Un'eredità che non basta

Un uomo muore dovendo alle sue tre mogli, secondo i loro contratti di matrimonio, 100, 200 e 300. Il Talmud babilonese (Ketubot 93a) divide ciò che lascia: un'eredità di 100 in parti uguali; una di 200 come 50, 75 e 75; una di 300 come 50, 100 e 150. La prima e l'ultima somigliano a regole note, parti uguali e parti proporzionali ai crediti. Quella di mezzo ha lasciato perplessi i commentatori per molto tempo.

Robert Aumann e Michael Maschler (1985) risolsero l'enigma. Si prenda il gioco in cui una coalizione vale ciò che le resta dopo che tutti quelli fuori sono stati pagati per intero, o 0 se non resta nulla. Le tre divisioni sono il **nucleolo** di questo gioco (David Schmeidler 1969): la divisione che rende la coalizione trattata peggio il meglio possibile, poi la seconda peggiore, e così via. Mostrarono anche che la stessa regola discende da un altro passo del Talmud (Bava Metzia 2a), su due persone che tengono un mantello. Una lo reclama tutto, l'altra la metà; la seconda cede all'altra metà, la metà contesa si divide in parti uguali, e le quote sono 3/4 e 1/4. Le divisioni del Talmud sono le sole che dividono così ciò che due creditori qualsiasi ricevono insieme.

Altre regole danno altre risposte. Con 200 la divisione proporzionale dà 33,33, 66,67 e 100. Il valore di Shapley dello stesso gioco dà 33,33, 83,33 e 83,33: è la media sugli ordini di arrivo casuali, con ogni creditore pagato per intero finché c'è denaro (Barry O'Neill 1982). Il Pannello C confronta cinque regole per ogni eredità; questo è il **problema di bancarotta**.

```box
I mining pool: a chi va la ricompensa?
**Perché esistono i pool: la varianza.** Un *miner* con una quota h dell'*hash rate* trova in media una frazione h dei blocchi. A fine novembre 2026 la rete andava a circa 1 ZH/s, 10²¹ hash al secondo (una media a 30 giorni di 1.019 EH/s il 23 novembre, secondo Hashrate Index). Con 1 ZH/s un miner con 1 PH/s ha una quota di uno su un milione: con 52.560 blocchi all'anno (uno ogni dieci minuti), ne trova uno ogni 19 anni in media, e può non trovarne nessuno per molto più tempo. Un *pool* paga i suoi membri per prove di lavoro parziali, le *share*, molto più facili da trovare, e trasforma una lotteria in un reddito regolare.

**Come si divide.** In proporzione alle share del turno; a share, a un prezzo fisso (il rischio è del pool); oppure sulle ultime N share. Meni Rosenfeld (2011) descrisse questi schemi e mostrò perché un pool proporzionale si può sfruttare saltando da un pool all'altro: una share all'inizio di un turno vale più di una alla fine. Bahar Can, Jens Leth Hougaard e Mohsen Pourpouneh (2022) studiano la divisione come un problema di allocazione con proprietà di equità, e caratterizzano lo schema proporzionale.

**Il punto di vista cooperativo.** Yoad Lewenberg, Yoram Bachrach, Yonatan Sompolinsky, Aviv Zohar e Jeffrey Rosenschein (2015) modellarono i pool come un gioco cooperativo. Per alcuni parametri della rete, in particolare quando i blocchi portano molte transazioni, una divisione stabile delle ricompense può non esistere, e alcuni miner guadagnano sempre passando a un altro pool.

**Il potere.** Nei pool illustrativi del Pannello B, un pool con il 26% dell'hash rate ha circa il 30% del potere di formare una maggioranza, e dividerlo in due pool del 13% abbassa il loro potere complessivo a circa il 26%. Le quote reali cambiano di settimana in settimana, e un pool non è i suoi miner: possono lasciarlo, e un attacco non è una votazione. Leggere i pool come elettori è un'ipotesi, non una descrizione.
```

## Il prossimo modulo

La Parte IV passa dal giocare i giochi al progettarli. Modulo 11: le aste, con un riquadro su Bitcoin e il mercato delle commissioni.

<!-- simulation -->

## Letture consigliate

- Osborne, M. J. (2004). *An Introduction to Game Theory*. Oxford University Press. Cap. 8 (giochi cooperativi e nucleo).
- Shoham, Y. e Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Cap. 12 (teoria dei giochi cooperativi).
- Jackson, M. O. (2008). *Social and Economic Networks*. Princeton University Press. Cap. 12 (regole di allocazione e giochi cooperativi), per il legame con il [modulo 09](/game-theory-lab/games-on-networks).
- Gillies, D. B. (1959). Solutions to general non-zero-sum games. In *Contributions to the Theory of Games IV*, 47–85.
- Bondareva, O. N. (1963). Some applications of linear programming methods to the theory of cooperative games. *Problemy Kibernetiki* 10, 119–139 (in russo).
- Shapley, L. S. (1967). On balanced sets and cores. *Naval Research Logistics Quarterly* 14, 453–460.
- Shapley, L. S. (1953). A value for n-person games. In *Contributions to the Theory of Games II*, 307–317.
- Shapley, L. S. (1971). Cores of convex games. *International Journal of Game Theory* 1, 11–26.
- Littlechild, S. C. e Owen, G. (1973). A simple expression for the Shapley value in a special case. *Management Science* 20, 370–372.
- Shapley, L. S. e Shubik, M. (1954). A method for evaluating the distribution of power in a committee system. *American Political Science Review* 48, 787–792.
- Banzhaf, J. F. (1965). Weighted voting doesn't work: a mathematical analysis. *Rutgers Law Review* 19, 317–343.
- Penrose, L. S. (1946). The elementary statistics of majority voting. *Journal of the Royal Statistical Society* 109, 53–57.
- Schmeidler, D. (1969). The nucleolus of a characteristic function game. *SIAM Journal on Applied Mathematics* 17, 1163–1170.
- O'Neill, B. (1982). A problem of rights arbitration from the Talmud. *Mathematical Social Sciences* 2, 345–371.
- Aumann, R. J. e Maschler, M. (1985). Game theoretic analysis of a bankruptcy problem from the Talmud. *Journal of Economic Theory* 36, 195–213.
- Rosenfeld, M. (2011). Analysis of Bitcoin pooled mining reward systems. arXiv:1112.4980.
- Lewenberg, Y., Bachrach, Y., Sompolinsky, Y., Zohar, A. e Rosenschein, J. S. (2015). Bitcoin mining pools: a cooperative game theoretic analysis. *AAMAS 2015*, 919–927.
- Can, B., Hougaard, J. L. e Pourpouneh, M. (2022). On reward sharing in blockchain mining pools. *Games and Economic Behavior* 136, 274–298.
