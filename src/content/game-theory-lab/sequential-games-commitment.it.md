
## Una minaccia

Un'impresa ha un mercato tutto per sé: è l'*incumbent*. Un entrante potenziale valuta se entrare, e l'incumbent avverte: se entri, scateno una guerra dei prezzi che rovinerà tutti e due. L'entrante deve crederci?

Le tabelle del [modulo 01](/game-theory-lab/what-is-a-game) non bastano a rispondere: lì i giocatori scelgono nello stesso momento. Qui l'entrante decide per primo e l'incumbent dopo aver visto la sua mossa. La risposta sta nell'ordine delle mosse.

## Alberi

Un gioco nel tempo si rappresenta con un **albero**. Ogni **nodo** è un punto in cui un giocatore deve scegliere; ogni ramo che ne esce è una **mossa**; ogni cammino finisce in una foglia con i *payoff* dei giocatori. Qui ogni giocatore vede tutte le mosse precedenti: il gioco è a informazione perfetta.

Ora una strategia deve essere un **piano** completo (ciò che i manuali chiamano strategia di un gioco in forma estesa): una mossa per ogni nodo in cui il giocatore potrebbe dover scegliere, anche per i nodi che il piano stesso impedisce di raggiungere. Sembra pedanteria, ma è ciò che fa di una minaccia una strategia. «Se entrano, combatto» è un piano dell'incumbent anche se, proprio per questo, nessuno entra mai.

## Risolvere dalla fine

Un albero si risolve dalle foglie: in ogni ultimo nodo chi muove sceglie la mossa che gli rende di più; si sostituisce il nodo con quei payoff e si risale di un livello, fino alla radice. È l'**induzione a ritroso**. Ernst Zermelo si chiese nel 1913 se negli scacchi una delle due parti potesse forzare la vittoria, e diede la prima trattazione matematica di una domanda del genere. Il procedimento a ritroso, che spesso gli viene attribuito, non è però l'argomento che usò.

Prendiamo il gioco dell'entrata con questi payoff, nell'ordine (entrante, incumbent). Se l'entrante resta fuori ottiene 0 e l'incumbent tiene 4. Se entra, l'incumbent può dividere il mercato, 2 ciascuno, o combattere: −1 per l'entrante e 0 per l'incumbent. Dopo l'entrata l'incumbent confronta 2 con 0 e divide. Quindi l'entrante confronta lo 0 del restare fuori con il 2 dell'entrare, ed entra.

```figure
entry
```

Alla minaccia non si crede perché, una volta avvenuta l'entrata, eseguirla danneggerebbe l'incumbent. Porta il cursore f, il payoff dell'incumbent se combatte, sopra 2 e tutto cambia: combattere diventa ciò che l'incumbent farebbe comunque, la minaccia è **credibile** e l'entrante resta fuori.

## Un equilibrio che si regge su una minaccia non credibile

Scriviamo lo stesso gioco come tabella. L'entrante ha due piani, restare fuori o entrare; l'incumbent due, dividere o combattere. Gli equilibri di Nash sono due. Uno è (entra, dividi). L'altro è (resta fuori, combatti): se l'incumbent combatterà, all'entrante conviene restare fuori; e se l'entrante resta fuori, il piano dell'incumbent non gli costa nulla, perché non viene mai messo alla prova. Il secondo equilibrio si regge su una **minaccia non credibile**.

Reinhard Selten propose nel 1965 di escludere equilibri del genere. In un albero a informazione perfetta ogni nodo è la radice di un gioco più piccolo, un **sottogioco**. Un equilibrio deve restare tale in ogni sottogioco, anche in quelli mai raggiunti: è un **equilibrio perfetto nei sottogiochi** (il nome venne più tardi). In un albero finito senza indifferenze l'induzione a ritroso ne trova uno, e non ce ne sono altri.

Quanto è comune il problema? La Simulazione A estrae alberi casuali in cui muove prima il primo giocatore e poi il secondo, ciascuno con due mosse. Su 20.000 alberi, il 75% ha un equilibrio di Nash non perfetto nei sottogiochi, e nel 33% quell'equilibrio porta a un esito diverso. La tabella ha uno, due o tre equilibri in circa 1/4, 1/2 e 1/4 degli alberi, e in teoria queste quote sono esatte.

## Il valore di legarsi le mani

Diamo all'incumbent una mossa prima del gioco. Può rendere impossibile la divisione, a un costo k: capacità produttiva utile solo in una guerra dei prezzi, un contratto che punisce la divisione, una promessa pubblica troppo costosa da infrangere. Dopo questo **impegno** l'incumbent può solo combattere. Quindi l'entrante resta fuori e l'incumbent guadagna 4 − k invece di 2: è la deterrenza all'entrata. Conviene quando k < 2.

L'incumbent guadagna eliminando la propria miglior risposta. Thomas Schelling ne fece il fulcro di *The Strategy of Conflict* (1960): il generale che brucia il ponte alle spalle dell'esercito, il negoziatore che si rende irreperibile, la minaccia che lascia qualcosa al caso perché nessuno controlla del tutto che cosa succederà. La deterrenza fra stati segue la stessa logica: truppe schierate dove un attacco le coinvolgerebbe, qualunque cosa preferisca poi il loro governo. Perché un impegno funzioni servono due condizioni. Deve essere visibile: un impegno nascosto non cambia nulla. E deve essere irrevocabile: un impegno da cui ci si può liberare pagando torna a essere soltanto una minaccia.

```box
Bitcoin: una minaccia con il 20% dell'hash rate
Un *miner* con una quota α dell'*hash rate* vuole tenere certe transazioni fuori dalla catena. Narayanan et al. (2016, cap. 5) discutono due minacce.

***Punitive forking:*** «non costruirò mai su un blocco che ne contenga una». Sotto la metà dell'hash rate non è credibile: il miner si taglierebbe fuori dalla catena più lunga, e le transazioni entrerebbero comunque.

***Feather fork:*** «cercherò di rendere orfano un blocco del genere, ma rinuncerò dopo una conferma». Servono i due blocchi successivi: probabilità α², 4% con α = 0,2. Un altro miner rischia allora il proprio blocco per una commissione: includere la transazione conviene solo se la commissione supera α²/(1 − α²) del valore del blocco, qui il 4,2%. Gli altri possono adeguarsi di loro iniziativa.

**È credibile?** Un tentativo costa in media all'attaccante α(1 − α) di un blocco, qui 0,16, quindi a cose fatte non ci proverebbe: su un albero giocato una sola volta anche questa minaccia non è credibile. Può funzionare con un impegno (un software che avvia il fork in automatico, annunciato pubblicamente) o con una reputazione costruita su molti blocchi (modulo 06). Un'ipotesi sugli incentivi, non un'osservazione della catena.
```

## Leader e follower

Nel modello di Heinrich von Stackelberg (1934) un'impresa del mercato di Cournot, l'impresa *leader*, sceglie per prima la quantità; l'altra, l'impresa *follower*, decide dopo averla vista. Prendiamo il mercato del [modulo 02](/game-theory-lab/nash-equilibrium), con a = 10 e c = 1. Il follower risponde a ogni quantità q1 con (9 − q1)/2, e il leader, sapendolo, sceglie il punto migliore su quella retta. Il leader produce 4,5 e il follower 2,25; il prezzo è 3,25 e i profitti sono 10,125 e 5,06, contro 9 ciascuno quando scelgono contemporaneamente.

Il 4,5 del leader non è una miglior risposta al 2,25 del follower: lo sarebbe 3,375. Una volta che il follower ha prodotto, il leader vorrebbe produrre meno. La sua quantità conviene solo perché non si può più cambiare. Muovere per primi è una forma di impegno.

Il vantaggio della prima mossa non è garantito. Nel pari o dispari chi muove per secondo vede la moneta e vince sempre. La Simulazione A gioca giochi casuali due per due in entrambi gli ordini: il primo giocatore fa meglio muovendo per primo che per secondo nel 15% dei casi, peggio nel 12%, e lo stesso negli altri. E quando il gioco simultaneo ha equilibri puri, il leader non fa mai peggio che in quello che preferisce: può sempre scegliere quella riga e lasciare che il follower risponda.

## Le persone ragionano a ritroso?

Nel gioco del millepiedi di Robert Rosenthal (1981) due giocatori si alternano davanti a un piatto che cresce a ogni passaggio; ciascuno può prendere la parte più grande o passare. L'induzione a ritroso procede a catena dall'ultima mossa: il primo giocatore prende subito, anche se entrambi farebbero meglio passando. Nell'esperimento di Richard McKelvey e Thomas Palfrey (1992) solo il 7% delle partite a quattro mosse si concluse alla prima mossa.

Il gioco dell'ultimatum di Werner Güth, Rolf Schmittberger e Bernd Schwarze (1982) è ancora più breve. Il proponente indica come dividere una somma; il rispondente accetta, altrimenti nessuno dei due riceve nulla. Secondo l'induzione a ritroso il rispondente accetta qualunque somma positiva, quindi il proponente dovrebbe offrire quasi nulla. I proponenti reali offrono di solito dal 40 al 50%. Nel confronto di Joseph Henrich e colleghi (2001), nelle società industrializzate l'offerta più frequente era la metà, e le offerte sotto il 20% venivano rifiutate dal 40 al 60% delle volte.

Rifiutare denaro contraddice l'induzione a ritroso, ma cambia ciò che conviene fare a un proponente interessato solo al denaro. Nella Simulazione C ogni rispondente rifiuta le offerte sotto una propria soglia, distribuita in modo uniforme tra 0 e m. Il proponente si aspetta allora (1 − x) x/m da un'offerta x, e l'offerta migliore è m stesso: con m = 0,4, un'offerta di 0,4, che vale 0,6, mentre un'offerta di 0,1 rende solo 0,225. Un proponente egoista offre molto.

## Contrattare

Supponiamo che a un rifiuto segua una controfferta e che a ogni turno la torta si riduca di un **fattore di sconto** δ: è il costo della trattativa. Con un solo turno il proponente prende tutto. Con due, il proponente deve lasciare all'altro quanto otterrebbe rifiutando e proponendo a sua volta, δ della torta, e tiene 1 − δ. Con più turni le quote oscillano e si assestano.

```figure
pie
```

Senza un ultimo turno, Ariel Rubinstein (1982) dimostrò che esiste un solo equilibrio perfetto nei sottogiochi. Il primo proponente offre all'altro quanto questi otterrebbe come proponente successivo: la stessa quota x, che oggi vale δx. Quindi x = 1 − δx:

```math
x = 1 / (1 + δ)
```

Con δ = 0,9 fa 0,526, poco più della metà. L'offerta viene accettata subito, quindi nulla va sprecato, eppure la divisione è decisa da turni che non si giocano mai. Con fattori di sconto diversi, δ₁ per il primo proponente e δ₂ per l'altro, il primo ottiene (1 − δ₂)/(1 − δ₁δ₂). Con 0,9 contro 0,8 fa 0,714 se è lui il più paziente, e 0,357 se è il meno paziente. La pazienza è potere contrattuale.

Qui i giocatori sapevano sempre con chi avevano a che fare. Nel [modulo 05](/game-theory-lab/incomplete-information-signalling) un giocatore non conosce i payoff dell'altro e deve dedurli da ciò che l'altro fa.

<!-- simulation -->

## Letture consigliate

- Osborne, M. J. (2004). *An Introduction to Game Theory*. Oxford University Press. Cap. 5, 6, 7 e 16.
- Tadelis, S. (2013). *Game Theory: An Introduction*. Princeton University Press. Cap. 7, 8 e 11.
- Shoham, Y. e Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Cap. 5.
- Schelling, T. C. (1960). *The Strategy of Conflict*. Harvard University Press.
- Zermelo, E. (1913). Über eine Anwendung der Mengenlehre auf die Theorie des Schachspiels. *Proceedings of the Fifth International Congress of Mathematicians*, vol. 2, 501–504.
- Schwalbe, U. e Walker, P. (2001). Zermelo and the early history of game theory. *Games and Economic Behavior* 34, 123–137.
- Selten, R. (1965). Spieltheoretische Behandlung eines Oligopolmodells mit Nachfrageträgheit. *Zeitschrift für die gesamte Staatswissenschaft* 121, 301–324 e 667–689.
- von Stackelberg, H. (1934). *Marktform und Gleichgewicht*. Springer.
- Dixit, A. (1980). The role of investment in entry-deterrence. *Economic Journal* 90, 95–106.
- Rosenthal, R. W. (1981). Games of perfect information, predatory pricing and the chain-store paradox. *Journal of Economic Theory* 25, 92–100.
- McKelvey, R. D. e Palfrey, T. R. (1992). An experimental study of the centipede game. *Econometrica* 60, 803–836.
- Güth, W., Schmittberger, R. e Schwarze, B. (1982). An experimental analysis of ultimatum bargaining. *Journal of Economic Behavior and Organization* 3, 367–388.
- Henrich, J., Boyd, R., Bowles, S., Camerer, C., Fehr, E., Gintis, H. e McElreath, R. (2001). In search of Homo economicus: behavioral experiments in 15 small-scale societies. *American Economic Review* 91(2), 73–78.
- Rubinstein, A. (1982). Perfect equilibrium in a bargaining model. *Econometrica* 50, 97–109.
- Narayanan, A., Bonneau, J., Felten, E., Miller, A. e Goldfeder, S. (2016). *Bitcoin and Cryptocurrency Technologies*. Princeton University Press. Cap. 5.
