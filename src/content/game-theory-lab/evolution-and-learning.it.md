<!-- DRAFT: to be reviewed by Adriano -->

## Una popolazione di strategie

Nei moduli da 01 a 06 i giocatori ragionano, alcuni moltissimo. Qui no. Nella prima metà del modulo una strategia si diffonde in una popolazione perché rende; nella seconda i giocatori si aggiustano per tentativi ed errori, senza nemmeno conoscere il gioco. Dove arrivano questi processi ciechi?

Immagina una grande popolazione i cui membri, ciascuno con una strategia fissa, si incontrano a caso a coppie e giocano un gioco simmetrico. Il *payoff* è ora un numero di discendenti, o la probabilità di essere imitati. Il [modulo 11](/lab/cooperation) del Complexity Lab l'ha raccontato a parole; qui riceve le formule.

John Maynard Smith e George Price (1973) si chiesero quando una popolazione è al sicuro da un'invasione, e Maynard Smith (1982) ne fece una teoria, la teoria evolutiva dei giochi. Scriviamo u(x, y) per ciò che la strategia x guadagna contro y. Una strategia x è **evolutivamente stabile** (una **ESS**, *evolutionarily stable strategy*) se, per ogni strategia mutante y ≠ x,

```math
u(x, x) > u(y, x),   oppure   u(x, x) = u(y, x) e u(x, y) > u(y, y)
```

I mutanti sono rari e incontrano quasi sempre i residenti: lì non devono fare meglio, e se pareggiano devono essere i residenti a fare meglio negli incontri tra mutanti. La prima condizione rende ogni ESS un equilibrio di Nash simmetrico. Il contrario non vale: nella caccia al cervo del [modulo 02](/game-theory-lab/nash-equilibrium) l'equilibrio misto non è una ESS: un mutante che pende un poco da una parte fa meglio dei residenti contro i suoi simili.

Prendi il gioco del pollo del modulo 01 letto come falco e colomba: (3, 3), (1, 4), (4, 1), (0, 0), con D il falco. Le colombe sono invase dai falchi, perché 4 > 3; i falchi dalle colombe, perché 1 > 0. Nessuna delle due strategie pure è stabile; la ESS è metà falchi e metà colombe.

## L'equazione del replicatore

Se xᵢ è la quota della strategia i, fᵢ il suo payoff medio nella popolazione attuale e f̄ la media della popolazione, l'**equazione del replicatore** (Taylor e Jonker 1978) dice

```math
ẋᵢ = xᵢ (fᵢ − f̄)
```

Una strategia cresce in proporzione a quanto il suo payoff supera la media. Per due strategie sulla mappa (T, S) del modulo 01, con R = 1, P = 0 e x la quota di C, diventa una sola equazione:

```math
ẋ = x(1 − x) [(1 − T)x + S(1 − x)]
```

Le quattro regioni della mappa del modulo 01 sono quattro destini. Nell'armonia C prende il sopravvento; nel dilemma lo prende D. Nel gioco del pollo la parentesi cambia segno in x* = S/(S + T − 1), che vale 1/2 con i numeri del modulo 01: lì le due strategie **coesistono**, da qualunque punto si parta. Nella caccia al cervo lo stesso punto, 2/3, è il *tipping point* q* del modulo 02: sopra, tutti finiscono a cacciare il cervo; sotto, la lepre. È la **bistabilità**.

```figure
fates
```

Ogni ESS è un punto di equilibrio asintoticamente stabile dell'equazione del replicatore (Taylor e Jonker 1978; Hofbauer, Schuster e Sigmund 1979). Con due strategie vale anche il contrario; con tre o più no: un punto di equilibrio può attirare la popolazione senza essere una ESS.

## Sasso, carta, forbici

Con tre strategie ognuna batte la successiva in cerchio, come nella morra cinese del [modulo 03](/game-theory-lab/mixed-strategies-zero-sum): una vittoria paga a, una sconfitta costa b, un pareggio dà 0. L'unico punto di equilibrio interno al triangolo è il centro (1/3, 1/3, 1/3), e il prodotto V = x_S x_C x_F dice dove va la popolazione:

```math
V̇ = V (a − b) [1 − 3(x_S x_C + x_C x_F + x_F x_S)]
```

La parentesi non è mai negativa, ed è nulla solo nel centro. Quando a > b, V cresce: la popolazione spiraleggia verso il centro, che è una ESS. Quando a = b, V è costante: le orbite sono cicli chiusi, e lungo ciascuno la media nel tempo delle quote è esattamente il centro (Hofbauer e Sigmund 1998). Quando a < b, V decresce: la popolazione spiraleggia verso i bordi, dove una strategia dopo l'altra quasi vince e poi crolla.

Barry Sinervo e Curtis Lively (1996) descrissero i maschi della lucertola *Uta stansburiana*, che hanno tre colori della gola e tre tattiche di accoppiamento, ognuna delle quali batte una delle altre; le frequenze dei tre colori seguono un ciclo di pochi anni.

L'ultima scelta del Pannello A riprende il modulo 06. Le tre strategie sono coopera sempre, defeziona sempre e *Tit for Tat*, in 10 turni del dilemma del modulo 01. Sul lato tra defeziona sempre e Tit for Tat, Tit for Tat prende il sopravvento appena supera 1/17 ≈ 0,059. Sul lato tra coopera sempre e Tit for Tat non si muove nulla. Ma dove coopera sempre è più dei 4/9 di quel miscuglio, defeziona sempre può invadere. La cooperazione ingenua apre la porta a chi defeziona.

## Un mutante in una popolazione finita

Nelle popolazioni finite conta il caso. Patrick Moran (1958) propose il modello più semplice, il **processo di Moran**: N individui; a ogni passo uno viene scelto per riprodursi, con probabilità proporzionale alla sua fitness, e il suo discendente sostituisce uno scelto a caso. Un mutante solo o prende il sopravvento, la **fissazione**, o si estingue. Se è neutrale, con la stessa fitness di tutti gli altri, la sua probabilità di fissazione è 1/N: la **deriva neutrale**. Con una fitness relativa costante r è

```math
ρ = (1 − 1/r) / (1 − 1/r^N)
```

cioè 0,148 per r = 1,1 e N = 10, e ancora 0,059 per un mutante dannoso con r = 0,9.

Con i giochi la fitness dipende da chi si incontra: 1 − w + w × (payoff medio), dove w è l'**intensità della selezione**. Martin Nowak, Akira Sasaki, Christine Taylor e Drew Fudenberg (2004) trovarono una regola semplice per i giochi di coordinamento con selezione debole e popolazione grande. Un mutante A solo arriva alla fissazione più spesso di uno neutrale quando il punto instabile x* è sotto 1/3: la **regola di un terzo** (*one-third rule*). E A sostituisce B più facilmente di quanto B sostituisca A proprio quando A è rischio-dominante (x* < 1/2), la nozione del modulo 02.

La caccia al cervo del modulo 02 ha x* = 2/3 per il cervo. Con N = 50 e w = 0,1, un cacciatore di lepri solo prende il sopravvento con probabilità 0,0184, un cacciatore di cervi solo con 0,0013, 14 volte meno. Michihiro Kandori, George Mailath e Rafael Rob (1993) e Peyton Young (1993), con un altro modello e rari errori casuali, arrivarono allo stesso verdetto: nel lungo periodo una popolazione passa quasi tutto il suo tempo nella convenzione rischio-dominante.

## Imparare senza conoscere il gioco

Ora una sola giocatrice ripete un gioco e vede solo i propri payoff.

Il suo ***regret*** (il rimpianto) dopo T turni è quanto avrebbe guadagnato in più la migliore azione singola, contro ciò che gli altri hanno fatto davvero, rispetto a ciò che lei ha guadagnato. Una regola è ***no-regret*** se il *regret* medio va a zero qualunque cosa facciano gli altri. James Hannan (1957) trovò la prima regola di questo tipo. Una regola semplice è quella dei **pesi moltiplicativi**, o ***Hedge*** (Littlestone e Warmuth 1994; Freund e Schapire 1997): a ogni turno il peso di ogni azione viene moltiplicato per e^(η·payoff), e lei gioca ogni azione con probabilità proporzionale al suo peso. η è il **tasso di apprendimento**.

Con i payoff riportati in [0, 1] e n azioni, il suo regret medio, misurato con le sue stesse probabilità, è al più

```math
ln n / (ηT) + η/8
```

qualunque cosa facciano gli altri. Con η scelto in base a T è al più √(ln n/(2T)): 0,0186 con T = 1.000 e due azioni. Il *fictitious play* del [modulo 03](/game-theory-lab/mixed-strategies-zero-sum) è l'altra regola di apprendimento del corso: risponde al meglio alle frequenze delle azioni passate degli altri, mentre Hedge ripesa solo le proprie. In un gioco a somma zero la giocata media di due giocatori così dà il valore del modulo 03 (Freund e Schapire 1999).

## Dove arriva l'apprendimento

Robert Aumann (1974) definì un equilibrio con un mediatore. Un mediatore estrae una cella della tabella con probabilità note e dice a ogni giocatore solo la sua parte; è un **equilibrio correlato** se nessuno guadagna a disobbedire.

Nel gioco del pollo del modulo 01, il mediatore sceglie (sterza, sterza), (sterza, dritto) e (dritto, sterza), ciascuna con probabilità 1/3. Se gli dice di sterzare, un guidatore pensa che l'altro sterzi con probabilità 1/2, ed è indifferente: 3·½ + 1·½ = 4·½ + 0·½. Se gli dice di andare dritto, sa che l'altro sterza. Ciascuno ottiene 8/3 ≈ 2,67, più dell'equilibrio misto (2) e più di una moneta che sceglie solo chi va dritto (2,5). È un semaforo che dice a ogni guidatore qualcosa di privato.

```figure
traffic
```

Quando il regret di ognuno svanisce, le frequenze del gioco tendono all'insieme degli **equilibri correlati *coarse***, in cui nessuno avrebbe preferito impegnarsi in anticipo su una sola azione. Con una nozione più forte di regret, lo ***swap regret***, che chiede se sarebbe convenuto sostituire un'azione con un'altra ogni volta che è stata giocata (il *regret matching* di Hart e Mas-Colell 2000 non ne ha), tendono agli equilibri correlati. Ogni equilibrio di Nash è correlato, e ogni equilibrio correlato è correlato coarse (Roughgarden, lezione 13); con due azioni ciascuno gli ultimi due insiemi coincidono.

Il Pannello C mette due giocatori Hedge sui giochi del modulo 01. Nel gioco del pollo si fermano su uno dei due equilibri puri. In pari o dispari non si fermano mai: le loro strategie miste spiraleggiano verso gli angoli (Bailey e Piliouras 2018), eppure la loro giocata media è 1/2 e 1/2 e il loro payoff è il valore.

## Il prossimo modulo

Parte III, convivere. Nel modulo 08 molti automobilisti condividono una rete stradale, ciascuno sceglie il percorso per sé, e ci chiediamo quanto costa il loro egoismo: il prezzo dell'anarchia.

<!-- simulation -->

## Letture consigliate

- Nowak, M. A. (2006). *Evolutionary Dynamics: Exploring the Equations of Life*. Harvard University Press. Cap. 4 (giochi evolutivi), 6 e 7 (popolazioni finite).
- Osborne, M. J. (2004). *An Introduction to Game Theory*. Oxford University Press. Cap. 13 (equilibrio evolutivo).
- Shoham, Y. e Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Cap. 7 (apprendimento).
- Nisan, N., Roughgarden, T., Tardos, É. e Vazirani, V. (a cura di) (2007). *Algorithmic Game Theory*. Cambridge University Press. Cap. 4 (apprendimento, minimizzazione del regret ed equilibri).
- Roughgarden, T. (2016). *Twenty Lectures on Algorithmic Game Theory*. Cambridge University Press. Lezioni 13, 17 e 18.
- Hofbauer, J. e Sigmund, K. (1998). *Evolutionary Games and Population Dynamics*. Cambridge University Press.
- Maynard Smith, J. e Price, G. R. (1973). The logic of animal conflict. *Nature* 246, 15–18.
- Maynard Smith, J. (1982). *Evolution and the Theory of Games*. Cambridge University Press.
- Taylor, P. D. e Jonker, L. B. (1978). Evolutionary stable strategies and game dynamics. *Mathematical Biosciences* 40, 145–156.
- Hofbauer, J., Schuster, P. e Sigmund, K. (1979). A note on evolutionary stable strategies and game dynamics. *Journal of Theoretical Biology* 81, 609–612.
- Sinervo, B. e Lively, C. M. (1996). The rock–paper–scissors game and the evolution of alternative male strategies. *Nature* 380, 240–243.
- Moran, P. A. P. (1958). Random processes in genetics. *Mathematical Proceedings of the Cambridge Philosophical Society* 54, 60–71.
- Nowak, M. A., Sasaki, A., Taylor, C. e Fudenberg, D. (2004). Emergence of cooperation and evolutionary stability in finite populations. *Nature* 428, 646–650.
- Kandori, M., Mailath, G. J. e Rob, R. (1993). Learning, mutation, and long run equilibria in games. *Econometrica* 61, 29–56.
- Young, H. P. (1993). The evolution of conventions. *Econometrica* 61, 57–84.
- Hannan, J. (1957). Approximation to Bayes risk in repeated play. *Contributions to the Theory of Games III*, 97–139.
- Littlestone, N. e Warmuth, M. K. (1994). The weighted majority algorithm. *Information and Computation* 108, 212–261.
- Freund, Y. e Schapire, R. E. (1997). A decision-theoretic generalization of on-line learning and an application to boosting. *Journal of Computer and System Sciences* 55, 119–139.
- Freund, Y. e Schapire, R. E. (1999). Adaptive game playing using multiplicative weights. *Games and Economic Behavior* 29, 79–103.
- Aumann, R. J. (1974). Subjectivity and correlation in randomized strategies. *Journal of Mathematical Economics* 1, 67–96.
- Hart, S. e Mas-Colell, A. (2000). A simple adaptive procedure leading to correlated equilibrium. *Econometrica* 68, 1127–1150.
- Bailey, J. P. e Piliouras, G. (2018). Multiplicative weights update in zero-sum games. *ACM Conference on Economics and Computation*, 321–338.
- Il [modulo 11](/lab/cooperation) del Complexity Lab, e i moduli [02](/game-theory-lab/nash-equilibrium) e [03](/game-theory-lab/mixed-strategies-zero-sum) di questo lab.
