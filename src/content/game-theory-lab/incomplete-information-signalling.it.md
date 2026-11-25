<!-- DRAFT: to be reviewed by Adriano -->

## Non sapere chi c'è dall'altra parte del tavolo

Finora ogni giocatore conosceva tutti i payoff. Un compratore guarda un'auto usata e non sa se il motore è sano. Un datore di lavoro non vede quanto vale davvero un candidato. Il nuovo arrivato del [modulo 04](/game-theory-lab/sequential-games-commitment) sente la minaccia dell'impresa e non sa se una guerra dei prezzi la danneggerebbe o no. In ogni caso i payoff dipendono da qualcosa che una sola parte conosce.

## La Natura muove per prima

John Harsanyi, in tre articoli del 1967–68, riportò questi giochi agli strumenti che abbiamo. Una mossa del caso, giocata dalla **Natura**, viene per prima ed estrae il **tipo** di ogni giocatore: ciò che dei suoi payoff sa soltanto lui. Ognuno vede il proprio tipo e non quello degli altri. Le probabilità dell'estrazione sono note a tutti: una **distribuzione a priori comune**. L'ignoranza sugli altri diventa incertezza su una mossa del caso, che i payoff attesi sanno trattare.

Cambiano due cose. Una strategia è ora un piano per ogni tipo: che cosa faccio se sono duro e che cosa faccio se sono debole, anche se accadrà una sola delle due cose. E un **equilibrio di Nash bayesiano** chiede a ogni tipo di ogni giocatore di dare la risposta migliore, date le sue **credenze** sui tipi degli altri e sui piani di ogni tipo.

Prendiamo il gioco dell'ingresso del modulo 04 con gli stessi numeri, scritti (nuovo arrivato, impresa): restare fuori dà (0, 4), entrare e dividere (2, 2). Ora l'impresa è **dura** con probabilità t, e un'impresa dura ama la lotta: combattere le rende 3, più del 2 della divisione. Una **debole** ottiene 0 combattendo. Un nuovo arrivato combattuto ottiene −1 in entrambi i casi.

```figure
types
```

Si risolve ogni ramo dalla fine, come nel modulo 04. Il tipo duro combatte, il tipo debole divide. Il nuovo arrivato non sa su quale ramo si trova: i suoi due nodi sono uniti da una linea tratteggiata, un solo **insieme di informazione**, e deve scegliere la stessa mossa in entrambi. Entrare gli rende 2 con probabilità 1 − t e −1 con probabilità t, in media 2 − 3t, quindi entra solo se t è sotto 2/3. Se un nuovo arrivato combattuto ottiene w, la soglia è 2/(2 − w).

Guardiamo l'impresa debole. Quando t è abbastanza alto non viene mai messa alla prova, e tiene 4 invece di 2 solo grazie ai tipi duri che potrebbe essere. Le piacerebbe molto essere presa per dura. Un'impresa debole che continua a combattere, mercato dopo mercato, per sembrare dura si sta costruendo una **reputazione**: è il modulo 06.

## Quando l'altra parte sa di più

George Akerlof (1970) mostrò che cosa fa questa ignoranza a un mercato. Una versione semplice, non la sua: le auto usate hanno qualità distribuite uniformemente tra q_min e 1. Un proprietario valuta un'auto quanto la sua qualità; un compratore 1,5 volte tanto, quindi ogni vendita gioverebbe a entrambi. Ma i compratori non vedono la qualità: vedono solo la media di ciò che è in vendita, ed è quella che pagano.

Con q_min = 0,2 la media è 0,6 e il prezzo parte da 0,9. I proprietari di auto migliori di 0,9 lo rifiutano e si ritirano. Le auto rimaste sono peggiori, il prezzo scende, altri si ritirano, turno dopo turno, fino a 0,6. Passa di mano metà delle auto, ma si realizza solo un terzo dei guadagni, perché le auto che escono sono le migliori. Con q_min = 0 il prezzo scende fino in fondo: non si vende mai nulla, anche se ogni auto vale di più per un compratore che per il suo proprietario. È la **selezione avversa**: il prezzo stesso seleziona le auto che nessuno vuole, i **bidoni**. Akerlof ricordò poi che due riviste rifiutarono l'articolo come troppo banale, e una terza perché, se fosse stato giusto, l'economia sarebbe stata diversa.

La simulazione A gioca questo mercato con migliaia di auto. Che cosa aiuta: ispezioni, garanzie, commercianti con un nome da perdere, e segnali. Il premio Nobel per l'economia del 2001 andò ad Akerlof, Michael Spence e Joseph Stiglitz per le loro analisi dei mercati con **informazione asimmetrica**.

## Segnali che costano

Spence (1973) si chiese come la parte che sa di più possa dimostrarlo. I lavoratori hanno produttività bassa, 1, o alta, 2; una quota λ è alta. I datori di lavoro, in concorrenza, pagano ciò che si aspettano che un lavoratore produca, dato ciò che vedono: l'istruzione. Supponiamo che l'istruzione non aggiunga nulla alla produttività: costa e basta. Ogni unità costa 1 a un tipo basso e 1/2 a un tipo alto.

In un **equilibrio separante** i tipi alti prendono e* unità e sono pagati 2, i tipi bassi non ne prendono e sono pagati 1. Lo reggono due condizioni. Il tipo basso non deve voler copiare: 2 − e* è al più 1, quindi e* è almeno 1. Il tipo alto deve voler pagare: 2 − e*/2 è almeno 1, quindi e* è al più 2. Funziona ogni e* da 1 a 2. In un **equilibrio di confusione** (*pooling*) tutti prendono lo stesso e e sono pagati la media, 1 + λ; nessuno vuole scendere a 0 se e è al più λ. Funziona ogni e da 0 a λ.

Entrambi si reggono su ciò che si crede dei livelli che nessuno sceglie, **fuori dal cammino di equilibrio**: qui, che chi li presenta sia basso. Ciò che fa funzionare il segnale è che costa meno al tipo che rivela: il **singolo incrocio** (*single crossing*). Senza, ciò che il tipo alto può permettersi se lo può permettere anche il basso.

Cho e Kreps (1987) proposero un test che elimina gran parte di questi equilibri, spesso chiamato criterio intuitivo. Se un livello è tale che il tipo basso non potrebbe mai guadagnarci, nemmeno pagato 2, mentre il tipo alto sì, allora un datore di lavoro che lo vede dovrebbe concludere che il lavoratore è alto. Applicandolo, sopravvive solo la separazione più economica, e* = 1.

E quanto costa? Con λ = 0,8 il tipo alto ottiene 2 − 1/2 = 1,5 in quell'equilibrio. Se nessuno segnalasse, tutti sarebbero pagati la media, 1,8. Il tipo basso ottiene 1 invece di 1,8. Il segnale impoverisce tutti, eppure nessuno può smettere da solo. La simulazione B prova altri costi e altre quote. In biologia Amotz Zahavi (1975) propose che la coda del pavone funzioni allo stesso modo, un **principio dell'handicap**: un ornamento è creduto perché costa portarlo. Ad Alan Grafen (1990) si attribuisce di solito di avergli dato una base formale, una lettura poi discussa.

## Parole che non costano nulla

Un segnale senza costo può informare? Crawford e Sobel (1982) studiarono un **esperto** che conosce un numero θ, distribuito uniformemente tra 0 e 1, e manda un messaggio a **chi decide**, che poi sceglie un'azione. Chi decide vuole che l'azione sia uguale a θ. L'esperto vuole θ + b: condivide lo scopo, con una **distorsione** b. Poiché parlare non costa nulla e non si può verificare (*cheap talk*), un messaggio è creduto solo finché l'esperto non ha motivo di mentire.

In equilibrio l'esperto può solo nominare un intervallo, di una **partizione** di 0–1, e chi decide agisce nel suo punto medio. Con b = 0,1 si distinguono solo due messaggi, "sotto 0,3" e "sopra 0,3". Con b = 0,05 sono tre. Da b = 1/4 in su, nessuno: nulla di ciò che l'esperto dice può essere creduto. Un esperto il cui valore cade esattamente su un confine deve essere indifferente tra le due azioni vicine, e questo rende ogni intervallo più lungo di 4b del precedente: un esperto che vuole spingere l'azione in alto è preciso sui valori bassi e vago su quelli alti.

La perdita attesa di chi decide, misurata come distanza al quadrato dell'azione da θ, è 1/12 ≈ 0,083 senza parole e 0,031 con b = 0,1. Lasciar decidere l'esperto, la **delega**, costa a chi decide solo b² = 0,01, perché l'esperto sceglie allora θ + b. Wessel Dessein (2002) mostrò che la delega batte il consiglio quando il conflitto non è troppo grande; in questo modello succede quando b è sotto circa 0,29, come mostra la simulazione C.

## Un po' di dubbio sceglie un equilibrio

Prendiamo una caccia al cervo in cui cacciare il cervo rende θ se anche l'altro lo caccia e θ − 1 se no, e cacciare la lepre rende 0. Se θ è noto ed è tra 0 e 1, esistono entrambi gli equilibri del [modulo 02](/game-theory-lab/nash-equilibrium): entrambi cacciano il cervo, o entrambi la lepre.

Ora ogni cacciatore vede θ solo con un piccolo errore privato: il suo **segnale privato**, θ più un **rumore** di dispersione σ. È un **gioco globale** (Hans Carlsson ed Eric van Damme, 1993). Con un segnale sopra 1 un cacciatore preferisce il cervo qualunque cosa faccia l'altro; sotto 0, la lepre. Ora si elimina ciò che nessuno sceglierebbe, passo dopo passo, come nel [modulo 01](/game-theory-lab/what-is-a-game). Un cacciatore appena sotto 1 sa che il segnale dell'altro è probabilmente sopra 1, quindi il cervo è sicuro un po' più in basso; dal basso, la lepre diventa certa un po' più in alto. La fascia di segnali in cui la scelta è ancora aperta si restringe dai due lati fino a un solo punto, 1/2.

```figure
doubt
```

Resta un solo equilibrio: caccia il cervo se il tuo segnale è sopra 1/2. È esattamente il punto in cui il cervo diventa dominante nel rischio. Più piccolo è l'errore, più lunga è la catena di ragionamenti: la fascia aperta diventa più stretta di 0,02 dopo 13 passi con σ = 0,1 e dopo 56 con σ = 0,02. Ma finisce sempre nello stesso punto. Stephen Morris e Hyun Song Shin (1998) usarono lo stesso argomento per gli attacchi speculativi alle valute, e da allora è stato applicato alle corse agli sportelli: con un dubbio privato, sono i fondamentali a decidere se tutti corrono.

## Il prossimo modulo

Nel modulo 06 lo stesso gioco si gioca molte volte. Una reputazione è allora un tipo che gli altri imparano a conoscere da ciò che fai.

<!-- simulation -->

## Letture consigliate

- Osborne, M. J. (2004). *An Introduction to Game Theory*. Oxford University Press. Cap. 9 e 10.
- Tadelis, S. (2013). *Game Theory: An Introduction*. Princeton University Press. Cap. 12, 15, 16 e 18.
- Shoham, Y. e Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Cap. 6 e 8.
- Harsanyi, J. C. (1967–68). Games with incomplete information played by "Bayesian" players, I–III. *Management Science* 14, 159–182, 320–334, 486–502.
- Akerlof, G. A. (1970). The market for "lemons": quality uncertainty and the market mechanism. *Quarterly Journal of Economics* 84, 488–500.
- Spence, M. (1973). Job market signaling. *Quarterly Journal of Economics* 87, 355–374.
- Rothschild, M. e Stiglitz, J. (1976). Equilibrium in competitive insurance markets: an essay on the economics of imperfect information. *Quarterly Journal of Economics* 90, 629–649.
- Cho, I.-K. e Kreps, D. M. (1987). Signaling games and stable equilibria. *Quarterly Journal of Economics* 102, 179–221.
- Zahavi, A. (1975). Mate selection: a selection for a handicap. *Journal of Theoretical Biology* 53, 205–214.
- Grafen, A. (1990). Biological signals as handicaps. *Journal of Theoretical Biology* 144, 517–546.
- Crawford, V. P. e Sobel, J. (1982). Strategic information transmission. *Econometrica* 50, 1431–1451.
- Dessein, W. (2002). Authority and communication in organizations. *Review of Economic Studies* 69, 811–838.
- Carlsson, H. e van Damme, E. (1993). Global games and equilibrium selection. *Econometrica* 61, 989–1018.
- Morris, S. e Shin, H. S. (1998). Unique equilibrium in a model of self-fulfilling currency attacks. *American Economic Review* 88, 587–597.
