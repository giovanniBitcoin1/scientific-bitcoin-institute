
## Non sapere chi c'è dall'altra parte del tavolo

Finora ogni giocatore conosceva tutti i *payoff*. Un compratore guarda un'auto usata e non sa se il motore è sano. Un datore di lavoro non vede quanto vale davvero un candidato. L'entrante del [modulo 04](/game-theory-lab/sequential-games-commitment) sente la minaccia dell'*incumbent* e non sa se una guerra dei prezzi lo danneggerebbe o gli converrebbe. In ciascun caso i payoff dipendono da qualcosa che una sola parte conosce.

## La Natura muove per prima

John Harsanyi, in tre articoli del 1967–68, ricondusse questi giochi agli strumenti che abbiamo. Una mossa del caso, giocata dalla **Natura**, apre il gioco ed estrae il **tipo** di ogni giocatore: ciò che soltanto lui sa dei propri payoff. Ognuno vede il proprio tipo e non quello degli altri. Le probabilità dell'estrazione sono note a tutti: è la **distribuzione a priori comune**. L'ignoranza sugli altri diventa incertezza su una mossa del caso, che si tratta con i payoff attesi.

Cambiano due cose. Una strategia è ora un piano per ogni tipo: che cosa faccio se sono duro e che cosa faccio se sono debole, anche se si verificherà uno solo dei due casi. E un **equilibrio di Nash bayesiano** richiede che ogni tipo di ogni giocatore scelga una miglior risposta, date le sue **credenze** sui tipi degli altri e sui piani di ciascun tipo.

Prendiamo il gioco dell'entrata del modulo 04 con gli stessi numeri, scritti (entrante, incumbent): restare fuori dà (0, 4), entrare e dividere (2, 2). Ora l'incumbent è **duro** con probabilità t, e a un incumbent duro la lotta conviene: combattere gli rende 3, più del 2 della divisione. Uno **debole** ottiene 0 combattendo. Un entrante combattuto ottiene −1 in entrambi i casi.

```figure
types
```

Si risolve ogni ramo dalla fine, come nel modulo 04. Il tipo duro combatte, il tipo debole divide. L'entrante non sa su quale ramo si trova: i suoi due nodi, uniti da una linea tratteggiata, formano un solo **insieme informativo**, e deve scegliere la stessa mossa in entrambi. Entrare gli rende 2 con probabilità 1 − t e −1 con probabilità t, in media 2 − 3t: entra quindi solo se t è sotto 2/3. Se un entrante combattuto ottiene w, la soglia è 2/(2 − w).

Guardiamo l'incumbent debole. Quando t è abbastanza alto nessuno lo mette alla prova, e tiene 4 invece di 2 soltanto perché potrebbe essere duro. Gli converrebbe essere preso per duro. Un incumbent debole che continua a combattere, mercato dopo mercato, per sembrare duro si sta costruendo una **reputazione**: è il tema del modulo 06.

## Quando l'altra parte sa di più

George Akerlof (1970) mostrò che cosa fa questa ignoranza a un mercato. Una versione semplice, non la sua: le auto usate hanno qualità distribuite uniformemente tra q_min e 1. Per un proprietario un'auto vale quanto la sua qualità, per un compratore 1,5 volte tanto: ogni vendita gioverebbe a entrambi. Ma i compratori non vedono la qualità: vedono solo la media di ciò che è in vendita, ed è quella che pagano.

Con q_min = 0,2 la media è 0,6 e il prezzo parte da 0,9. I proprietari di auto migliori di 0,9 lo rifiutano e si ritirano. Le auto rimaste sono peggiori, il prezzo scende e altri si ritirano, turno dopo turno, fino a 0,6. Passa di mano metà delle auto, ma si ottiene solo un terzo dei guadagni, perché le auto che escono sono le migliori. Con q_min = 0 il prezzo scende fino in fondo: non si vende mai nulla, anche se ogni auto vale di più per un compratore che per il proprietario. È la **selezione avversa**: il prezzo stesso seleziona le auto che nessuno vuole, i **bidoni**. Akerlof ricordò poi che due riviste rifiutarono l'articolo perché troppo banale e una terza perché, se fosse stato giusto, l'economia sarebbe stata diversa.

La Simulazione A riproduce questo mercato con migliaia di auto. Aiutano le ispezioni, le garanzie, i commercianti con un buon nome da perdere e i segnali. Il premio Nobel per l'economia del 2001 andò ad Akerlof, Michael Spence e Joseph Stiglitz per le loro analisi dei mercati con **informazione asimmetrica**.

## Segnali che costano

Spence (1973) si chiese come la parte che sa di più potesse dimostrarlo. I lavoratori hanno produttività bassa, 1, o alta, 2; una quota λ ha produttività alta. I datori di lavoro, in concorrenza, pagano a ogni lavoratore quanto si aspettano che produca, dato ciò che vedono: l'istruzione. Supponiamo, per estremizzare, che l'istruzione non aggiunga nulla alla produttività: costa e basta. Ogni unità costa 1 a un tipo basso e 1/2 a un tipo alto.

In un **equilibrio separante** i tipi alti scelgono e* unità e sono pagati 2; i tipi bassi non ne scelgono nessuna e sono pagati 1. Lo sostengono due condizioni. Il tipo basso non deve voler imitare: 2 − e* è al più 1, quindi e* è almeno 1. Il tipo alto deve voler pagare: 2 − e*/2 è almeno 1, quindi e* è al più 2. Funziona ogni e* da 1 a 2. In un **equilibrio** ***pooling*** tutti scelgono lo stesso livello e, e sono pagati la media, 1 + λ; nessuno vuole scendere a 0 se e è al più λ. Funziona ogni e da 0 a λ.

Entrambi si reggono su ciò che i datori di lavoro credono dei livelli che nessuno sceglie, **fuori dal sentiero di equilibrio**: qui, che chi li presenta sia di tipo basso. Il segnale funziona perché costa meno al tipo che rivela: è la **condizione di** ***single crossing***. Altrimenti, tutto ciò che il tipo alto può permettersi può permetterselo anche il tipo basso.

Cho e Kreps (1987) proposero un test, spesso chiamato **criterio intuitivo**, che elimina gran parte di questi equilibri. Se da un certo livello il tipo basso non può mai guadagnare, nemmeno se pagato 2, mentre il tipo alto sì, un datore di lavoro che lo vede dovrebbe concludere che il lavoratore è di tipo alto. Applicato il criterio, sopravvive solo la separazione più economica, e* = 1.

E quanto costa? Con λ = 0,8 il tipo alto ottiene 2 − 1/2 = 1,5 in questo equilibrio. Se nessuno segnalasse, tutti sarebbero pagati la media, 1,8. Il tipo basso ottiene 1 invece di 1,8. Il segnale impoverisce tutti, eppure nessuno può smettere da solo. La Simulazione B prova altri costi e altre quote. In biologia Amotz Zahavi (1975) propose che la coda del pavone funzionasse allo stesso modo, secondo un **principio dell'handicap**: un ornamento è credibile perché portarlo costa. Alan Grafen (1990) gli avrebbe dato una base formale: una lettura diffusa, ma poi discussa.

## Parole che non costano nulla

Un segnale senza costo può informare? Crawford e Sobel (1982) studiarono un **esperto** che conosce un numero θ, distribuito uniformemente tra 0 e 1, e manda un messaggio a un **decisore**, che poi sceglie un'azione. Il decisore vuole che l'azione sia uguale a θ. L'esperto vuole θ + b: condivide lo scopo, con una **distorsione** b. Le parole non costano nulla e non si possono verificare (***cheap talk***): un messaggio è creduto solo quando l'esperto non ha motivo di mentire.

In equilibrio l'esperto può solo indicare un intervallo di una **partizione** di 0–1, e il decisore ne sceglie il punto medio. Con b = 0,1 si distinguono solo due messaggi, «sotto 0,3» e «sopra 0,3». Con b = 0,05 sono tre. Da b = 1/4 in su, nessuno: nulla di ciò che l'esperto dice può essere creduto. Un esperto il cui valore cade esattamente su un confine deve essere indifferente tra le due azioni vicine. Questo rende ogni intervallo più lungo di 4b del precedente: un esperto che vuole spingere l'azione in alto è preciso sui valori bassi e vago su quelli alti.

La perdita attesa del decisore, misurata dal quadrato della distanza tra l'azione e θ, è 1/12 ≈ 0,083 senza parole e 0,031 con b = 0,1. Lasciar decidere l'esperto (la **delega**) costa al decisore solo b² = 0,01, perché l'esperto sceglie allora θ + b. Wessel Dessein (2002) mostrò che la delega è preferibile al consiglio purché il conflitto non sia troppo grande; in questo modello lo è quando b è sotto circa 0,29, come mostra la Simulazione C.

## Un po' di dubbio sceglie un equilibrio

Prendiamo una caccia al cervo in cui cacciare il cervo rende θ se anche l'altro lo caccia e θ − 1 altrimenti, mentre cacciare la lepre rende 0. Se θ è noto ed è tra 0 e 1, esistono i due equilibri del [modulo 02](/game-theory-lab/nash-equilibrium): entrambi cacciano il cervo, o entrambi la lepre.

Ora ogni cacciatore osserva θ con un piccolo errore privato: il suo **segnale privato**, θ più un **rumore** di dispersione σ. È un **gioco globale** (Hans Carlsson ed Eric van Damme, 1993). Con un segnale sopra 1 un cacciatore preferisce il cervo qualunque cosa faccia l'altro; sotto 0, la lepre. Si elimina allora, passo dopo passo, ciò che nessuno sceglierebbe, come nel [modulo 01](/game-theory-lab/what-is-a-game). Un cacciatore appena sotto 1 sa che il segnale dell'altro è probabilmente sopra 1, quindi il cervo è sicuro anche un po' più in basso; dal basso, la lepre diventa certa un po' più in alto. La fascia di segnali in cui la scelta è ancora aperta si restringe dai due lati fino a un solo punto, 1/2.

```figure
doubt
```

Resta un solo equilibrio: caccia il cervo se il tuo segnale è sopra 1/2. È esattamente il punto in cui il cervo diventa rischio-dominante. Più piccolo è l'errore, più lunga è la catena di ragionamenti: la fascia aperta diventa più stretta di 0,02 dopo 13 passi con σ = 0,1 e dopo 56 con σ = 0,02. Ma arriva sempre allo stesso punto. Stephen Morris e Hyun Song Shin (1998) usarono lo stesso argomento per gli attacchi speculativi alle valute; da allora è stato applicato anche alle corse agli sportelli. Con un dubbio privato, sono i fondamentali a decidere se tutti corrono.

## Il prossimo modulo

Nel [modulo 06](/game-theory-lab/repeated-games-reputation) lo stesso gioco si ripete molte volte. Una reputazione è allora un tipo che gli altri imparano a conoscere da ciò che fai.

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
