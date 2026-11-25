<!-- DRAFT: to be reviewed by Adriano -->

## Un gioco senza cella stabile

Nel **pari o dispari** (*matching pennies*) ogni giocatore mostra una moneta. Il giocatore di riga vince se le due facce coincidono, quello di colonna se sono diverse. Prendete una cella qualsiasi della tabella: uno dei due giocatori preferirebbe trovarsi altrove. Il [modulo 02](/game-theory-lab/nash-equilibrium) si è chiuso su questo gioco, il più piccolo senza equilibrio.

Un calcio di rigore ha la stessa forma. Il rigorista tira da una parte, il portiere si tuffa da una parte, e il pallone è troppo veloce perché il portiere possa aspettare e vedere. Se il rigorista scegliesse sempre lo stesso lato, il portiere andrebbe lì; se il portiere si tuffasse sempre dalla stessa parte, il rigorista mirerebbe all'altra. Qualunque scelta fissa faccia uno dei due, l'altro ha una risposta pronta. In un gioco così l'errore non è una scelta cattiva, ma prevedibile.

## Mescolare

Una **strategia mista** è una probabilità per ciascuna strategia: tirare a sinistra con probabilità 0,4 e a destra con 0,6, per esempio. Una strategia scelta con certezza si chiama ora **pura**. Quando i giocatori mescolano, il *payoff* di ciascuno diventa una media, il **payoff atteso**: il payoff di ogni cella pesato per quanto spesso quella cella si presenta.

Una cosa cambia. Nel [modulo 01](/game-theory-lab/what-is-a-game) contava solo l'ordine dei payoff: una miglior risposta resta tale se tutti i payoff vengono raddoppiati o spostati. Con le strategie miste contano anche le grandezze, perché una media confronta un payoff sicuro con una scommessa.

## La regola dell'indifferenza

Supponete che in un equilibrio io mescoli fra due strategie. Allora entrambe devono rendermi lo stesso contro ciò che fate voi. Se una rendesse di più, la giocherei ogni volta e lascerei l'altra. Un equilibrio misto si regge quindi sull'**indifferenza**: la vostra strategia mista è quella che mi lascia indifferente fra le mie strategie, e la mia è quella che lascia voi indifferenti fra le vostre.

Ne segue una cosa strana. Le mie probabilità sono fissate dai vostri payoff, non dai miei. Nel pari o dispari la risposta è facile: il giocatore di riga è indifferente solo se quello di colonna mostra testa metà delle volte, e viceversa. Ciascuno gioca 1/2.

Nel gioco dell'esercizio 1 il giocatore di riga mescola 3/4 e 1/4, quello di colonna 1/2 e 1/2. Ora alzate da 3 a 5 il payoff del giocatore di riga nella cella in alto a sinistra. La strategia mista del giocatore di riga non si muove: resta 3/4, perché la fissano i payoff del giocatore di colonna. È il giocatore di colonna a cambiare, a 1/3 sulla prima colonna, per tenere indifferente quello di riga.

Ora il calcio di rigore con numeri realistici. Ignacio Palacios-Huerta (2003) ha studiato 1.417 rigori del calcio professionistico, dal 1995 al 2000, e ha chiamato i lati per convenzione dal punto di vista del rigorista: D è il lato naturale del rigorista (la sinistra per chi calcia di destro), S l'altro. Percentuali di realizzazione della grandezza che ha misurato sono:

| | portiere S | portiere D |
|---|---|---|
| rigorista S | 58,30 | 94,97 |
| rigorista D | 92,91 | 69,92 |

Il portiere deve rendere il rigorista indifferente fra S e D, e il rigorista deve fare lo stesso con il portiere. Risolvendo le due condizioni, il rigorista tira a S il 38,5% delle volte e il portiere si tuffa a S il 42,0% delle volte, e allora il rigore va a segno il 79,6% delle volte qualunque cosa faccia uno dei due da solo.

```figure
square
```

Se il rigorista si allena e la percentuale D/D sale a 80, si muovono entrambe le strategie miste: il rigorista tira a S solo il 26,0% delle volte e il portiere si tuffa a S il 30,2%. Qui la regola non isola un giocatore, perché questo è un gioco di puro conflitto: ciò che il rigorista guadagna in una cella, il portiere lo perde nella stessa cella, e quindi un cambiamento dei payoff del rigorista è anche un cambiamento di quelli del portiere (esercizio 3).

## Puro conflitto

In un **gioco a somma zero** il guadagno di un giocatore è esattamente la perdita dell'altro; in un **gioco a somma costante** i due payoff danno sempre la stessa somma, come la percentuale di realizzazione e il suo complemento nel calcio di rigore. Cooperare non porta nulla, e quindi c'è un secondo modo, prudente, di scegliere: prendere la strategia mista il cui caso peggiore è il migliore: la **strategia di maxmin**. Ciò che garantisce è il **payoff di sicurezza**.

John von Neumann dimostrò nel 1928 che in questi giochi le due risposte prudenti si incontrano. Il meglio che il rigorista può garantirsi contro qualunque portiere e il minimo che il portiere può concedere contro qualunque rigorista sono lo stesso numero, il **valore del gioco**. È il **teorema del minimax**.

```figure
minimax
```

Tirare sempre a S garantisce al rigorista il 58,3%, sempre a D il 69,9%, la strategia mista giusta il 79,6%. Le conseguenze suonano strane. Chi usa la strategia mista giusta non perde nulla ad annunciarla, perché l'altro contro di essa non può fare meglio del valore. Nessuna spia aiuta l'avversario. E se un gioco di puro conflitto ha più equilibri, danno tutti lo stesso valore.

## Le persone giocano così?

I professionisti ci vanno sorprendentemente vicino. Nei dati di Palacios-Huerta le percentuali di realizzazione dei tiri ai due lati sono statisticamente uguali, come chiede l'indifferenza, e le scelte non mostrano alcuno schema da un rigore al successivo. Mark Walker e John Wooders (2001) hanno esaminato i servizi dei grandi tennisti a Wimbledon: i punti vinti servendo a sinistra e a destra erano uguali anche lì, ma i giocatori cambiavano lato un po' troppo spesso per essere davvero casuali.

Le persone comuni, invitate a scrivere una sequenza casuale, fanno molto peggio. Evitano le serie lunghe e alternano più di quanto faccia il caso (Wagenaar 1972 ha passato in rassegna i primi studi; Falk e Konold 1997). A un programma semplice basta uno schema prevedibile. La macchina della Simulazione C ricorda che cosa avete fatto dopo ogni coppia di mosse e scommette che lo rifarete. Contro un giocatore che cambia lato il 60% delle volte vince il 59,5% di 2.000 turni; contro uno che dice testa il 60% delle volte, il 59,7%; contro una moneta onesta, il 50,0%. Una moneta non si lascia leggere.

## Mescolare fuori dal puro conflitto

Gli equilibri misti non sono solo per i giochi di conflitto. Ogni gioco due per due con due celle stabili ha un terzo equilibrio, misto. Nella caccia al cervo del modulo 02 è esattamente q* = 2/3: ciascuno caccia il cervo con probabilità 2/3 e si aspetta 8/3, meno del 4 dell'equilibrio del cervo. Il *tipping point* è un equilibrio, ma instabile: un po' più di fiducia e tutti vanno al cervo, un po' meno e tutti vanno alla lepre.

Nella battaglia dei sessi l'equilibrio misto è peggiore per entrambi di ciascuno dei due puri. Ciascuno va all'evento che preferisce con probabilità 2/3, così si incontrano solo 4 volte su 9 e ciascuno si aspetta 2/3, contro 1 o 2 negli equilibri puri.

La Simulazione A trova tutti gli equilibri di una tabella, puri e misti. Nei giochi casuali il loro numero è quasi sempre dispari: 1, 3, 5… Nei due per due, sette giochi su otto ne hanno uno e uno su otto ne ha tre; nei quattro per quattro, il 54% ne ha uno, il 38% tre e l'8% cinque o più. Esistono giochi con un numero pari, ma solo dove i payoff sono esattamente uguali; una tabella casuale non ne mostra mai uno.

## Dominata da una strategia mista

Le strategie miste rendono più tagliente anche l'eliminazione del modulo 01. Siano questi i payoff del giocatore di riga contro le colonne L e R:

| | L | R |
|---|---|---|
| U | 4 | 0 |
| M | 1 | 1 |
| D | 0 | 4 |

Né U né D domina M: U rende meno contro R, D contro L. Ma metà U e metà D rende 2 contro entrambe le colonne, più dell'1 di M. M è dominata da una strategia mista, e un giocatore razionale non la gioca mai. Va bene qualunque peso su U fra 1/4 e 3/4 (esercizio 5).

## Il teorema di Nash e l'apprendimento

John Nash dimostrò nel 1950 che, quando si può mescolare, ogni gioco con un numero finito di giocatori e di strategie ha almeno un equilibrio. Nel quadrato della Figura F1 se ne vede la ragione. La linea di miglior risposta del giocatore di riga va da un lato all'altro del quadrato, e così quella del giocatore di colonna, di traverso: due linee così devono incrociarsi, e un incrocio è un equilibrio. In generale l'argomento è un **teorema di punto fisso**, quello di Kakutani: la mappa che manda ogni coppia di strategie miste nelle migliori risposte a essa deve lasciare ferma qualche coppia, e quella coppia è un equilibrio.

Come troverebbero la strategia mista dei giocatori che non risolvono equazioni? George Brown propose nel 1951 il ***fictitious play***: ogni giocatore guarda quanto spesso l'altro ha giocato finora ciascuna strategia e gioca la miglior risposta a quelle frequenze. Julia Robinson dimostrò lo stesso anno che nei giochi di puro conflitto alla lunga funziona: ciò che le frequenze garantiscono si avvicina al valore. Eppure il gioco in sé non si assesta mai; continua a passare da una cella all'altra in **sequenze** sempre più lunghe. Nella Simulazione B lo scarto massimo fra le frequenze e l'equilibrio del pari o dispari è 0,05 dopo 100 turni e 0,0016 dopo 100.000.

Fuori dal puro conflitto non c'è una promessa simile. Lloyd Shapley (1964) costruì un gioco tre per tre il cui unico equilibrio è un terzo per ogni strategia, ma in cui il fictitious play gira in tondo: ogni sequenza è lunga circa una volta e mezza la precedente, ci sono solo 28 sequenze in 100.000 turni, e lo scarto resta vicino a 0,25 per sempre. Il modulo 07 tornerà sull'apprendimento. Il modulo 04 fa muovere i giocatori uno dopo l'altro.

<!-- simulation -->

## Letture consigliate

- Osborne, M. J. (2004). *An Introduction to Game Theory*. Oxford University Press. Cap. 4 e 11.
- Tadelis, S. (2013). *Game Theory: An Introduction*. Princeton University Press. Cap. 6.
- Shoham, Y. e Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Cap. 3 e 4.
- Roughgarden, T. (2016). *Twenty Lectures on Algorithmic Game Theory*. Cambridge University Press. Lezione 18.
- von Neumann, J. (1928). Zur Theorie der Gesellschaftsspiele. *Mathematische Annalen* 100, 295–320.
- Nash, J. F. (1950). Equilibrium points in n-person games. *Proceedings of the National Academy of Sciences* 36, 48–49.
- Brown, G. W. (1951). Iterative solution of games by fictitious play. In Koopmans, T. C. (a cura di), *Activity Analysis of Production and Allocation*. Wiley, 374–376.
- Robinson, J. (1951). An iterative method of solving a game. *Annals of Mathematics* 54, 296–301.
- Shapley, L. S. (1964). Some topics in two-person games. In Dresher, M., Shapley, L. S. e Tucker, A. W. (a cura di), *Advances in Game Theory*. Princeton University Press, 1–28.
- Wilson, R. (1971). Computing equilibria of N-person games. *SIAM Journal on Applied Mathematics* 21, 80–87.
- Harsanyi, J. C. (1973). Oddness of the number of equilibrium points: a new proof. *International Journal of Game Theory* 2, 235–250.
- Palacios-Huerta, I. (2003). Professionals play minimax. *Review of Economic Studies* 70, 395–415.
- Chiappori, P.-A., Levitt, S. e Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. *American Economic Review* 92, 1138–1151.
- Walker, M. e Wooders, J. (2001). Minimax play at Wimbledon. *American Economic Review* 91, 1521–1538.
- Wagenaar, W. A. (1972). Generation of random sequences by human subjects: a critical survey of literature. *Psychological Bulletin* 77, 65–72.
- Falk, R. e Konold, C. (1997). Making sense of randomness: implicit encoding as a basis for judgment. *Psychological Review* 104, 301–318.
