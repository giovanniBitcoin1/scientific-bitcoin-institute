<!-- DRAFT: to be reviewed by Adriano -->

## Giocare di nuovo

Il dilemma del prigioniero del [modulo 01](/game-theory-lab/what-is-a-game) ha un solo equilibrio, ed è cattivo per entrambi i giocatori. Ma due imprese sullo stesso mercato, due vicini di casa, due *pool* di mining non si incontrano una volta sola. Si incontrano ogni giorno, e ciò che ciascuno fa oggi viene visto e ricordato domani. Questo modulo si chiede che cosa può fare il futuro al presente.

Lo stesso gioco, che ora si chiama **gioco costituente**, viene giocato turno dopo turno. I *payoff* di un giocatore formano una successione u₀, u₁, u₂, …, e un payoff fra t turni viene pesato con δᵗ. Il numero δ, tra 0 e 1, è il **fattore di sconto**: la **pazienza**. Si può anche leggere come la probabilità che ci sia un altro turno: allora il numero atteso di turni è 1/(1 − δ), cioè 10 con δ = 0,9. Per riportare una successione alla scala di un solo turno si usa il suo **payoff medio**:

```math
(1 − δ)(u₀ + δ u₁ + δ² u₂ + …)
```

Tre a ogni turno ha media 3. Una strategia è ora molto più grande che nel modulo 01: dice che cosa fare dopo ogni possibile storia del gioco.

## La soglia di pazienza

Prendiamo il dilemma del modulo 01, con R = 3 per la cooperazione reciproca, S = 0 per il babbeo, T = 5 per la tentazione e P = 1 per la defezione reciproca. Consideriamo la strategia ***grim trigger***: coopera finché nessuno ha defezionato; appena qualcuno l'ha fatto, defeziona per sempre.

Se entrambi la seguono, ciascuno ottiene in media 3. Chi defeziona oggi ottiene 5 subito e 1 in ogni turno successivo, in media (1 − δ)5 + δ. La cooperazione regge quando 3 è almeno altrettanto, cioè quando

```math
δ ≥ (T − R) / (T − P) = 1/2
```

```figure
patience
```

La punizione è credibile. Una volta cominciata, entrambi giocano per sempre l'equilibrio del gioco costituente, e contro chi defeziona defezionare è la miglior risposta: cooperare una volta darebbe 0 invece di 1 e non fermerebbe la punizione. Il profilo è quindi perfetto nei sottogiochi, nel senso del [modulo 04](/game-theory-lab/sequential-games-commitment).

Come essere sicuri che non convenga una deviazione più astuta, per esempio defezionare due volte e poi chiedere scusa? Il ***one-shot deviation principle***, che viene dalla programmazione dinamica (Blackwell 1965), dice che con lo sconto basta controllare le deviazioni in un solo turno seguite da un ritorno alla strategia. Se nessuna di queste conviene, non conviene nemmeno una più lunga. È il conto che sta dietro all'"ombra del futuro" del [modulo 11](/lab/cooperation) del Complexity Lab, che ha raccontato i tornei di Axelrod e Tit for Tat.

## Quasi tutto può durare

La pazienza non tiene insieme solo la cooperazione. Una coppia di payoff medi è **ammissibile** se i giocatori la possono ottenere lasciando che una lotteria pubblica scelga a ogni turno una delle quattro celle, con pesi fissi. Nessun giocatore può essere spinto sotto 1: defezionando a ogni turno ottiene almeno tanto, qualunque cosa faccia l'altro. Quell'1 è il suo **payoff di minmax**, e una coppia ammissibile che dà a ciascuno più del suo minmax è **individualmente razionale**.

Il ***folk theorem*** dice che ogni coppia ammissibile e individualmente razionale è il payoff medio di qualche equilibrio perfetto nei sottogiochi quando δ è abbastanza vicino a 1. Il nome ricorda che il risultato era noto ai teorici dei giochi negli anni Cinquanta, trasmesso a voce, prima che qualcuno lo pubblicasse. James Friedman (1971) ne dimostrò una versione in cui le deviazioni sono punite con il ritorno a un equilibrio del gioco costituente; Drew Fudenberg ed Eric Maskin (1986) lo dimostrarono in generale.

```figure
folk
```

La Figura F2 mostra quanta pazienza serve a ogni punto con lo schema più semplice: la lotteria sceglie una cella, entrambi la giocano, e chi disobbedisce è punito con la defezione per sempre. Un risultato sorprende. Fare a turno gli sfruttati, (2,5, 2,5), richiede solo δ ≥ 0,4, meno della cooperazione reciproca, che richiede 0,5. Chi in questo turno è sfruttato rinuncia a 1 obbedendo (potrebbe avere 1 invece di 0); un cooperatore davanti a un cooperatore rinuncia a 2 (5 invece di 3).

Il folk theorem dice come la cooperazione può durare, non quale dei molti equilibri verrà giocato. Il problema della scelta del modulo 02 ritorna, più grande di prima.

## Collusione senza contratto

Torniamo al mercato del modulo 02, a = 10, c = 1. Due imprese che producono 2,25 ciascuna, metà della quantità di monopolio, guadagnano 10,125 ciascuna contro il 9 di Cournot. Un'impresa che imbroglia una volta produce 3,375, la sua miglior risposta, e guadagna 11,390625. Se all'imbroglio si risponde con Cournot per sempre, il cartello regge quando δ ≥ 9/17 ≈ 0,529.

Più imprese lo rendono più difficile. Con n imprese la soglia è

```math
δ* = (n + 1)² / (n² + 6n + 1)
```

che dà 0,571 con 3 imprese, 0,643 con 5 e 0,752 con 10. Con i prezzi invece delle quantità (Bertrand, beni identici) chi imbroglia scende di un soffio sotto gli altri e prende tutto il mercato, e la soglia è (n − 1)/n: 0,5, 0,667, 0,8 e 0,9.

Sotto la soglia un cartello alla Cournot non è perduto del tutto. Può ancora sostenere una riduzione più piccola della produzione: con due imprese il massimo che regge è

```math
q(δ) = (27 − 15δ) / (9 − δ)
```

cioè 2,586, con un profitto di 9,899, per δ = 0,3. Con i prezzi è tutto o niente.

È la **collusione tacita**: non serve un accordo, basta aspettarsi la reazione degli altri. Poche imprese, incontri frequenti e prezzi che tutti vedono la rendono più facile, ed è per questo che le autorità della concorrenza li guardano. I cartelli espliciti, naturalmente, sono illegali.

```box
Bitcoin: il dilemma dei miner
I pool pagano i loro membri per le prove di lavoro parziali. Un pool può mandare alcuni dei suoi *miner* in un altro pool, dove consegnano le prove parziali ma buttano via ogni blocco completo che trovano: il ***block withholding***. L'attaccante prende una parte delle ricompense della vittima e non vi aggiunge nulla. Ittay Eyal (2015) ha studiato pool che si attaccano a vicenda con questa infiltrazione.

**Il modello.** Due pool, il resto della rete che mina onestamente; il pool i ha potenza mᵢ e ne manda xᵢ nell'altro. I miner del pool i guadagnano rᵢ per unità di potenza, 1 se nessuno attacca, e ogni pool sceglie xᵢ per massimizzare il proprio rᵢ. Con due pool del 25%, un pool che attacca da solo manda il 15,8% della sua potenza: i suoi miner guadagnano l'1,9% in più, quelli della vittima il 10,1% in meno, tutti gli altri il 4,1% in più. In equilibrio attaccano entrambi, con il 14,9% ciascuno, ed entrambi guadagnano l'8,1% in meno, mentre tutti gli altri guadagnano l'8,1% in più. Come gioco due per due i payoff sono (1, 1), (1,019, 0,904), (0,904, 1,019) e (0,919, 0,919): un dilemma del prigioniero.

**Il problema non è la pazienza.** La strategia grim trigger richiede solo δ ≥ 0,19, e i pool possono reagire ogni giorno. Il problema è vedere: Eyal osserva che un pool può accorgersi di essere attaccato, ma non da chi. Con molti pool l'attaccante è anonimo, ed è il problema della prossima sezione.

**Un'ipotesi.** Eyal notò che attacchi del genere vengono segnalati di rado, e suggerì che i pool possano avere un accordo non detto di non attaccarsi, fragile perché ogni pool può attaccare senza essere visto. Sono numeri di un modello, non misure; commissioni, schemi di pagamento e il numero reale dei pool restano fuori.
```

## Guerre dei prezzi senza imbrogli

Edward Green e Robert Porter (1984) si chiesero che cosa succede quando le imprese vedono il prezzo ma non la produzione delle altre, e la domanda è rumorosa: un **monitoraggio imperfetto**. Un prezzo basso può voler dire che qualcuno ha imbrogliato, o solo sfortuna. Le imprese non possono distinguere, e si accordano su una regola: quando il prezzo scende sotto un ***trigger price*** p̄, il prezzo soglia, una guerra dei prezzi, cioè Cournot, per L turni, poi di nuovo il cartello.

In equilibrio nessuno imbroglia, eppure le guerre scoppiano, per sola sfortuna. Il Pannello B usa una versione semplificata: chi imbroglia produce 3,375, la miglior risposta a 2,25 (in Green e Porter le imprese possono scegliere qualunque quantità, e un piccolo imbroglio è ancora più difficile da vedere). Con un rumore di dispersione σ = 0,5, p̄ = 4,5, L = 5 e δ = 0,9, un falso allarme capita nel 2,3% dei turni tranquilli e un imbroglio viene scoperto il 60% delle volte. Imbrogliare non conviene, e nel lungo periodo circa un turno su dieci è di guerra (la quota di pace è 0,898). Con guerre di soli L = 2 turni, imbrogliare conviene.

Più il prezzo è rumoroso, più pazienza serve a un cartello. Il δ più piccolo per cui qualche soglia funziona sale da 9/17 ≈ 0,53 senza rumore a 0,54 con σ = 0,25, 0,64 con 0,5, 0,75 con 0,75 e 0,83 con 1. Robert Porter (1983) trovò guerre di questo tipo nel Joint Executive Committee, il cartello ferroviario che fissava le tariffe per il grano spedito da Chicago alla costa orientale nel 1880–1886.

## Quando si conosce la fine

Tutto questo ha bisogno di un futuro. Con un ultimo turno noto il dilemma si sfalda: all'ultimo turno nessuno ha motivo di cooperare, quindi nemmeno al penultimo, e così via fino al primo. È l'induzione a ritroso del modulo 04.

Reinhard Selten (1978) ne trovò una versione più netta, il **paradosso del *chain store*** (della catena di negozi). Una catena è presente in 20 città e incontra un entrante per città, uno alla volta, con i payoff del modulo 04: restare fuori (0, 4), entrare e dividere (2, 2), entrare e combattere (−1, 0). L'induzione a ritroso dice che ogni entrante entra e la catena divide tutte e 20 le volte. Eppure "combatti i primi per spaventare gli altri" suona proprio come ciò che farebbe una catena vera. Selten chiamò questo scarto un paradosso.

## Una reputazione è una credenza

David Kreps e Robert Wilson (1982), e Paul Milgrom e John Roberts (1982), lo risolsero con i tipi del modulo 05. Con probabilità t l'*incumbent* è **duro**: preferisce combattere, 3 contro 2. Gli entranti guardano che cosa fa. Un incumbent **debole** ha ora un motivo per combattere presto: sembrare duro.

L'equilibrio ha una forma chiara. Sia b = 2/(2 − w), la soglia del modulo 05 (2/3 con w = −1), sia k il numero di mercati ancora da giocare, questo compreso, e sia p la credenza degli entranti che l'incumbent sia duro. L'entrante resta fuori se p ≥ bᵏ ed entra se p < bᵏ. Dopo un'entrata un incumbent debole combatte di sicuro se p ≥ bᵏ⁻¹; altrimenti combatte proprio con la probabilità che porta la credenza dopo una lotta a bᵏ⁻¹. Nell'ultimo mercato divide.

Con t = 0,05 e 20 mercati, i primi 13 entranti restano fuori. L'entrata può avvenire solo negli ultimi 7 mercati, e quel 7 non dipende da quanti mercati ci sono. L'incumbent debole guadagna 66, contro 40 senza il dubbio. Bastano un po' di dubbio e un orizzonte lungo. Kreps, Milgrom, Roberts e Wilson (1982) mostrarono che la stessa logica tiene in piedi la cooperazione in un dilemma del prigioniero ripetuto un numero finito di volte fino a poco prima della fine, se un giocatore potrebbe essere uno che gioca semplicemente Tit for Tat.

Il modulo 05 si era chiuso con la promessa che una reputazione è un tipo che gli altri imparano a conoscere. Eccola: una reputazione è una credenza, e vale la pena pagarla.

## Il prossimo modulo

Nel modulo 07 i giocatori smettono di calcolare. Le strategie si diffondono perché funzionano, e i giocatori imparano il gioco giocandolo.

<!-- simulation -->

## Letture consigliate

- Osborne, M. J. (2004). *An Introduction to Game Theory*. Oxford University Press. Cap. 14 e 15 (giochi ripetuti), e il gioco del chain store nel cap. 7.
- Tadelis, S. (2013). *Game Theory: An Introduction*. Princeton University Press. Cap. 10 (giochi ripetuti, collusione tacita, folk theorem) e cap. 17 (costruirsi una reputazione).
- Mailath, G. J. e Samuelson, L. (2006). *Repeated Games and Reputations: Long-Run Relationships*. Oxford University Press.
- Blackwell, D. (1965). Discounted dynamic programming. *Annals of Mathematical Statistics* 36, 226–235.
- Friedman, J. W. (1971). A non-cooperative equilibrium for supergames. *Review of Economic Studies* 38, 1–12.
- Fudenberg, D. e Maskin, E. (1986). The folk theorem in repeated games with discounting or with incomplete information. *Econometrica* 54, 533–554.
- Green, E. J. e Porter, R. H. (1984). Noncooperative collusion under imperfect price information. *Econometrica* 52, 87–100.
- Porter, R. H. (1983). A study of cartel stability: the Joint Executive Committee, 1880–1886. *Bell Journal of Economics* 14, 301–314.
- Selten, R. (1978). The chain store paradox. *Theory and Decision* 9, 127–159.
- Kreps, D. M. e Wilson, R. (1982). Reputation and imperfect information. *Journal of Economic Theory* 27, 253–279.
- Milgrom, P. e Roberts, J. (1982). Predation, reputation, and entry deterrence. *Journal of Economic Theory* 27, 280–312.
- Kreps, D. M., Milgrom, P., Roberts, J. e Wilson, R. (1982). Rational cooperation in the finitely repeated prisoners' dilemma. *Journal of Economic Theory* 27, 245–252.
- Eyal, I. (2015). The miner's dilemma. *IEEE Symposium on Security and Privacy*, 89–103 (arXiv:1411.7099).
- Il Complexity Lab, [modulo 11](/lab/cooperation).
