<!-- DRAFT: to be reviewed by Adriano -->

## Una minaccia

Un'impresa ha un mercato tutto per sé: è l'*incumbent*. Un entrante potenziale pensa di entrare, e l'incumbent lo fa sapere: se entri comincio una guerra dei prezzi che rovina tutti e due. L'entrante deve crederci?

Le tabelle del [modulo 01](/game-theory-lab/what-is-a-game) non sanno rispondere: lì i giocatori scelgono nello stesso momento. Qui l'entrante decide per primo, e l'incumbent dopo aver visto che cosa ha fatto. La risposta sta nell'ordine delle mosse.

## Alberi

Un gioco nel tempo si disegna come un **albero**. Ogni **nodo** è un punto in cui un giocatore deve scegliere; ogni ramo che ne esce è una **mossa**; ogni cammino finisce in una foglia con i *payoff* dei giocatori. Qui ogni giocatore vede tutte le mosse precedenti.

Una strategia ora deve essere un **piano** completo (ciò che i manuali chiamano strategia di un gioco in forma estesa): una mossa per ogni nodo in cui il giocatore potrebbe dover scegliere, anche per i nodi che il piano stesso impedisce di raggiungere. Sembra pedanteria, ma è ciò che fa di una minaccia una strategia. "Se entrano, combatto" è un piano dell'incumbent, e lo è anche se, proprio per questo, nessuno entra mai.

## Risolvere dalla fine

Un albero si risolve dalle foglie: in ogni ultimo nodo chi muove sceglie la mossa che gli rende di più; si sostituisce il nodo con quei payoff e si ripete un livello più su, fino alla radice. È l'**induzione a ritroso**. Ernst Zermelo si chiese nel 1913 se negli scacchi una delle due parti possa forzare la vittoria, e diede la prima trattazione matematica di una domanda del genere; il metodo di risolvere dalla fine, che spesso gli viene attribuito, non è l'argomento che usò.

Prendiamo il gioco dell'entrata con questi payoff, scritti (entrante, incumbent). Se l'entrante resta fuori ottiene 0 e l'incumbent tiene 4. Se entra, l'incumbent può dividere il mercato, 2 ciascuno, o combattere: −1 per l'entrante e 0 per l'incumbent. Partiamo dalla fine. Dopo l'entrata l'incumbent confronta 2 con 0 e divide. Quindi l'entrante confronta lo 0 del restare fuori con il 2 dell'entrare, ed entra.

```figure
entry
```

Alla minaccia non si crede perché, una volta avvenuta l'entrata, eseguirla danneggerebbe l'incumbent. Porta il cursore f, il payoff dell'incumbent se combatte, sopra 2 e tutto cambia: combattere diventa ciò che l'incumbent farebbe comunque, la minaccia è **credibile** e l'entrante resta fuori.

## Un equilibrio che si regge su una minaccia non credibile

Scriviamo lo stesso gioco come tabella. L'entrante ha due piani, restare fuori o entrare; l'incumbent due, dividere o combattere. Gli equilibri di Nash sono due. Uno è (entra, dividi). L'altro è (resta fuori, combatti): se l'incumbent combatterà, all'entrante conviene restare fuori; e se l'entrante resta fuori, il piano dell'incumbent non gli costa nulla, perché non viene mai messo alla prova. Il secondo equilibrio si regge su una **minaccia non credibile**.

Reinhard Selten propose nel 1965 di escludere equilibri del genere; il nome venne dopo. Ogni nodo di un albero a informazione perfetta fa partire un gioco più piccolo, un **sottogioco**. Un equilibrio deve restare un equilibrio in ogni sottogioco, anche in quelli che non vengono mai raggiunti: un **equilibrio perfetto nei sottogiochi**. In un albero finito senza parità l'induzione a ritroso ne trova esattamente uno, ed è l'unico.

Quanto è comune il problema? La Simulazione A estrae alberi casuali in cui ogni giocatore ha due mosse, prima il primo giocatore e poi il secondo. Su 20.000 alberi, il 75% ha un equilibrio di Nash non perfetto nei sottogiochi, e nel 33% quell'equilibrio dà un esito diverso. La tabella ha uno, due o tre equilibri in quote vicine a 1/4, 1/2 e 1/4, che sono esatte.

## Il valore di legarsi le mani

Diamo all'incumbent una mossa prima del gioco. Può rendere impossibile la divisione, a un costo k: una capacità utile solo in una guerra dei prezzi, un contratto che punisce la divisione, una promessa pubblica troppo costosa da rompere. Dopo questo **impegno** l'incumbent può solo combattere. Quindi l'entrante resta fuori, e l'incumbent guadagna 4 − k invece di 2: è la deterrenza all'entrata. Conviene ogni volta che k < 2.

L'incumbent ci guadagna distruggendo la propria miglior risposta. Thomas Schelling ne fece il centro di *The Strategy of Conflict* (1960): il generale che brucia il ponte alle spalle del suo esercito, il negoziatore che non si riesce a raggiungere, la minaccia che lascia qualcosa al caso perché nessuno controlla del tutto che cosa succederà. La deterrenza fra stati segue la stessa logica: truppe schierate dove un attacco le coinvolgerebbe, qualunque cosa il loro governo preferisca poi. Due cose fanno funzionare un impegno. Deve essere visto: un impegno nascosto non cambia nulla. E deve essere impossibile da disfare: un impegno che si può ricomprare torna a essere soltanto una minaccia.

```box
Bitcoin: una minaccia con il 20% dell'hash rate
Un *miner* con una quota α dell'*hash rate* vuole tenere certe transazioni fuori dalla catena. Narayanan et al. (2016, cap. 5) discutono due minacce.

***Punitive forking:*** "non costruirò mai su un blocco che ne contiene una". Sotto metà dell'hash rate non è credibile: il miner si taglierebbe fuori dalla catena più lunga, e le transazioni entrano comunque.

***Feather fork:*** "cercherò di rendere orfano un blocco del genere, e rinuncerò dopo una conferma". Servono i due blocchi successivi: probabilità α², 4% con α = 0,2. Un altro miner rischia allora il suo blocco per una commissione: includere la transazione conviene solo se la commissione supera α²/(1 − α²) del valore del blocco, qui 4,2%. Gli altri possono adeguarsi senza che glielo si chieda.

**È credibile?** Un tentativo costa in media all'attaccante α(1 − α) di un blocco, qui 0,16, quindi a cose fatte non ci proverebbe: su un albero giocato una volta anche questa minaccia non è credibile. Può funzionare con un impegno (un software che fa il fork da solo, annunciato in pubblico) o con una reputazione costruita su molti blocchi (modulo 06). Un'ipotesi sugli incentivi, non un'osservazione della catena.
```

## Leader e follower

Heinrich von Stackelberg (1934) fece scegliere per prima la quantità a un'impresa del mercato di Cournot, l'impresa *leader*; l'altra, l'impresa *follower*, sceglie dopo averla vista. Prendiamo il mercato del [modulo 02](/game-theory-lab/nash-equilibrium), con a = 10 e c = 1. Il follower risponde a ogni quantità q1 con (9 − q1)/2, la sua funzione di reazione, e il leader, sapendolo, sceglie il punto migliore su quella retta. Il leader produce 4,5 e il follower 2,25; il prezzo è 3,25 e i profitti sono 10,125 e 5,06, contro 9 ciascuno quando scelgono insieme.

Il 4,5 del leader non è una miglior risposta al 2,25 del follower: lo sarebbe 3,375. Una volta che il follower ha prodotto, il leader vorrebbe ridurre. La sua quantità conviene solo perché non si può ritirare. Muovere per primi è un impegno sotto un altro nome.

Il vantaggio della prima mossa non è garantito. Nel pari o dispari chi muove per secondo vede la moneta e vince sempre. La Simulazione A gioca giochi due per due casuali nei due ordini: il primo giocatore fa meglio muovendo per primo che per secondo nel 15% dei casi, peggio nel 12%, e uguale negli altri. E quando il gioco simultaneo ha un equilibrio puro, il leader non fa mai peggio che nel migliore di essi: può sempre scegliere quella riga e lasciare che il follower risponda.

## Le persone ragionano a ritroso?

Nel gioco del millepiedi di Robert Rosenthal (1981) due giocatori si alternano davanti a un piatto che cresce a ogni passaggio; ciascuno può prendere la parte più grande o passare. L'induzione a ritroso si srotola dall'ultima mossa: il primo giocatore prende subito, anche se entrambi farebbero meglio passando. Nell'esperimento di Richard McKelvey e Thomas Palfrey (1992), solo il 7% delle partite a quattro mosse finì alla prima mossa.

Il gioco dell'ultimatum di Werner Güth, Rolf Schmittberger e Bernd Schwarze (1982) è ancora più corto. Un giocatore propone come dividere una somma; l'altro accetta, o nessuno dei due riceve nulla. L'induzione a ritroso dice che chi risponde accetta qualunque cifra positiva, e quindi chi propone dovrebbe offrire quasi nulla. I proponenti veri di solito offrono dal 40 al 50%. Nel confronto di Joseph Henrich e colleghi (2001), nelle società industrializzate l'offerta più frequente era la metà, e le offerte sotto il 20% venivano rifiutate dal 40 al 60% delle volte.

Rifiutare denaro non è induzione a ritroso, ma cambia ciò che dovrebbe fare un proponente a cui importa solo del denaro. Nella Simulazione C ogni rispondente rifiuta le offerte sotto una soglia sua, distribuita in modo uniforme tra 0 e m. Il proponente si aspetta allora (1 − x) x/m da un'offerta x, e l'offerta migliore è m stesso: con m = 0,4, un'offerta di 0,4, che vale 0,6, mentre un'offerta di 0,1 rende solo 0,225. Un proponente egoista offre molto.

## Contrattare

Facciamo seguire al rifiuto una controfferta, e facciamo restringere la torta di un **fattore di sconto** δ a ogni turno: il costo del discutere. Con un turno chi propone prende tutto. Con due, chi propone deve lasciare all'altro quanto otterrebbe rifiutando e proponendo a sua volta, δ della torta, e tiene 1 − δ. Con più turni le quote oscillano e si assestano.

```figure
pie
```

Senza alcun ultimo turno, Ariel Rubinstein (1982) dimostrò che c'è un solo equilibrio perfetto nei sottogiochi. Il primo proponente offre all'altro esattamente quanto otterrebbe come proponente successivo, una frazione δ della quota x del proponente stesso, quindi x = 1 − δx:

```math
x = 1 / (1 + δ)
```

Con δ = 0,9 fa 0,526, poco più della metà. L'offerta viene accettata subito, quindi nulla va sprecato, eppure la divisione è decisa da turni che non si giocano mai. Quando i due giocatori hanno fattori di sconto diversi δ₁ e δ₂, il primo proponente ottiene (1 − δ₂)/(1 − δ₁δ₂): 0,714 se è il più paziente, con 0,9 contro 0,8, e 0,357 se è il meno paziente. La pazienza è potere contrattuale.

Qui i giocatori sapevano sempre con chi avevano a che fare. Nel [modulo 05](/game-theory-lab/incomplete-information-signalling) un giocatore non conosce i payoff dell'altro e deve leggerli in ciò che l'altro fa.

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
- Henrich, J., Boyd, R., Bowles, S., Camerer, C., Fehr, E., Gintis, H. e McElreath, R. (2001). In search of Homo economicus: behavioral experiments in 15 small-scale societies. *American Economic Review* 91 (2), 73–78.
- Rubinstein, A. (1982). Perfect equilibrium in a bargaining model. *Econometrica* 50, 97–109.
- Narayanan, A., Bonneau, J., Felten, E., Miller, A. e Goldfeder, S. (2016). *Bitcoin and Cryptocurrency Technologies*. Princeton University Press. Cap. 5.
