<!-- DRAFT: to be reviewed by Adriano -->

## Regole che premiano la sconfitta

Il 31 luglio 2012, alle Olimpiadi di Londra, il pubblico fischiò due partite del doppio femminile di badminton. I servizi finivano in rete e i colpi facili uscivano dal campo, perché tutte e quattro le coppie in gara stavano cercando di perdere. Erano già qualificate per la fase a eliminazione diretta, e una sconfitta nell'ultima partita del girone avrebbe dato loro un tabellone più facile. Il giorno dopo furono squalificate otto giocatrici: una coppia cinese, due sudcoreane e una indonesiana.

La colpa fu data alle giocatrici, ma avevano fatto ciò che le regole premiavano. Che cosa convenisse a ciascuna coppia dipendeva da che cosa facevano le altre, e gli organizzatori non ci avevano pensato fino in fondo.

Di questo parla il corso. Un **gioco** è qualunque situazione in cui ciò che è meglio per me dipende da quello che fai tu: un calcio di rigore, una guerra dei prezzi, un'asta, una corsa agli armamenti, una coda all'uscita dell'autostrada.

## Tre ingredienti

Un gioco è descritto da tre cose. I **giocatori**. Le **strategie**: ciò che ogni giocatore può scegliere. I ***payoff***: un numero per ogni giocatore, per ogni combinazione di scelte.

Con due giocatori e poche strategie ciascuno, tutto questo sta in una tabella, la **forma normale** del gioco. Un giocatore sceglie una riga, l'altro una colonna; ogni cella contiene due numeri, per primo il payoff del giocatore di riga.

| | L | R |
|---|---|---|
| **U** | 2, 1 | 0, 0 |
| **D** | 3, 0 | 1, 2 |

Due avvertenze sulle parole. Un payoff non è denaro. Mette in ordine gli esiti per un giocatore e contiene già tutto ciò che a quel giocatore importa: il denaro, il rischio, l'equità, il piacere di veder perdere un rivale. Perciò **razionale** vuol dire coerente, non avido: un giocatore razionale sceglie ciò che per lui sta più in alto, qualunque cosa sia. E **simultaneo** non vuol dire che gli orologi coincidono. Vuol dire che nessuno dei due conosce la scelta dell'altro quando fa la propria.

Il primo teorema della materia fu dimostrato da John von Neumann nel 1928. Nel 1944, con l'economista Oskar Morgenstern, pubblicò *Theory of Games and Economic Behavior*, il libro che ne fece una disciplina.

## Strategie che non giocheresti mai

Guarda la tabella qui sopra dal punto di vista del giocatore di riga. Se l'altro sceglie L, D dà 3 e U dà 2. Se l'altro sceglie R, D dà 1 e U dà 0. D è meglio in entrambi i casi.

Una strategia è **strettamente dominata** quando un'altra strategia dello stesso giocatore dà di più contro ogni scelta dell'altro. Una strategia che batte in questo modo tutte le altre è una **strategia dominante**, e non richiede alcun ragionamento sull'altro giocatore.

Il gioco più famoso ne ha una per ciascun giocatore.

| | C | D |
|---|---|---|
| **C** | 3, 3 | 0, 5 |
| **D** | 5, 0 | 1, 1 |

D domina C per entrambi, quindi entrambi giocano D e ottengono 1, mentre giocando entrambi C avrebbero ottenuto 3. È il dilemma del prigioniero. La sua storia, e che cosa gli succede quando lo si ripete, sono nel [modulo 11 del Complexity Lab](/lab/cooperation); qui è una tabella fra tante.

Quante? Se ogni giocatore si limita a ordinare le quattro celle dalla peggiore alla migliore, i giochi due per due diversi sono 144 (li conta la Simulazione A). In un quarto di essi entrambi i giocatori hanno una strategia dominante, e di solito nessuno rimpiange il risultato. Il dilemma del prigioniero è l'unico dei 144 in cui entrambi hanno una strategia dominante ed entrambi finiscono peggio che in un'altra cella.

## Cancella, poi guarda di nuovo

Nella prima tabella il giocatore di colonna non ha strategie dominate: L è meglio contro U, R contro D. Ma il giocatore di colonna può vedere che l'altro non sceglierà mai U. Cancellata quella riga, R batte L, 2 contro 0. Il gioco è risolto: (D, R).

È l'**eliminazione iterata**: si cancella ciò che è strettamente dominato, si guarda la tabella più piccola, si cancella di nuovo.

```figure
eliminate
```

Ogni passo chiede di più. Per cancellare U basta che il giocatore di riga sia razionale. Per cancellare poi L, il giocatore di colonna deve sapere che l'altro è razionale. Un terzo passo richiede che il giocatore di riga sappia che l'altro lo sa, e così via. L'ipotesi che regge l'intero procedimento è la **conoscenza comune della razionalità**: tutti sono razionali, tutti lo sanno, tutti sanno che tutti lo sanno, senza fine.

Un fatto rassicurante: con la dominanza stretta l'ordine delle cancellazioni non conta. Qualunque strategia dominata esca per prima, alla fine restano le stesse strategie.

## Indovina i due terzi della media

Ognuno, in una sala, scrive un numero da 0 a 100. Vince chi si avvicina di più ai due terzi della media.

La media non può superare 100, quindi i suoi due terzi non possono superare 66,7. Un numero sopra 66,7 non è mai meglio di 66,7 stesso, e a volte è peggio (questa è la dominanza debole: mai meglio, da qualche parte peggio). Dunque nessuno di buon senso va oltre 66,7. Ma allora la media è al massimo 66,7 e il bersaglio al massimo 44,4. Ripetendo l'argomento il limite scende a 29,6, 19,8, 13,2… Sopravvive solo lo 0.

Le persone non giocano 0. Nell'esperimento di Rosemarie Nagel del 1995 la media dei primi numeri fu circa 37. Quando tre giornali proposero il gioco ai lettori, 7.900 in tutto, le medie furono tra 19 e 25, con i numeri addensati vicino a 33 e a 22.

Quei due numeri suggeriscono un modello a **livelli di ragionamento**. Un giocatore di livello 0 sceglie a caso, in media 50. Uno di livello 1 si aspetta una folla di livello 0 e risponde 33,3. Uno di livello 2 si aspetta il livello 1 e dice 22,2. Il livello k dice

```math
50 × (2/3)^k
```

Quasi tutti si fermano dopo uno o due passi. Nella Simulazione B una folla di mille persone, in gran parte di livello 1 e 2, ha al primo turno una media di 29,4. Il bersaglio è 19,6, e vince un giocatore di livello 2; su mille partite il livello 2 vince 917 volte. Chi dice 0 è il più avanti di tutti e quasi il più lontano dal premio. Il vincitore è un passo avanti alla folla, non dieci.

John Maynard Keynes disse la stessa cosa nel 1936 a proposito di un concorso su un giornale in cui i lettori dovevano scegliere i volti che la maggior parte degli altri lettori avrebbe scelto, e il gioco dei numeri si chiama ancora di solito concorso di bellezza (*beauty contest*).

## Quando non c'è nulla da cancellare

La maggior parte dei giochi non ha strategie dominate, e allora l'eliminazione non ha nulla da dire. Un'idea più debole funziona ancora. Una **miglior risposta** a una scelta dell'altro giocatore è una strategia che dà almeno quanto ogni altra contro quella scelta. Una strategia dominante è una miglior risposta a tutto; di solito la miglior risposta cambia con ciò che fa l'altro.

Segna in ogni colonna la miglior risposta del giocatore di riga, e in ogni riga quella del giocatore di colonna. Una cella in cui i due segni si incontrano è una **cella stabile**: ciascuno sta facendo il meglio che può data la scelta dell'altro, quindi nessuno vuole spostarsi da solo.

## Un piccolo atlante

Prendi un gioco in cui i due giocatori sono nella stessa posizione. Ognuno può cooperare (C) o defezionare (D). Fissa il payoff della cooperazione reciproca a R = 1 e quello della defezione reciproca a P = 0, con le lettere del modulo 11 del Complexity Lab. Restano due numeri: la tentazione T, per chi defeziona contro un cooperatore, e il payoff del babbeo S, per chi coopera contro chi defeziona.

```figure
atlas
```

Il piano di T e S ha quattro regioni.

- **Dilemma del prigioniero** (T > 1, S < 0). Defezionare è meglio qualunque cosa faccia l'altro. La tensione è la tentazione.
- **Caccia al cervo** (T < 1, S < 0). Cooperare è la scelta migliore se l'altro coopera e la peggiore se non lo fa. Due celle stabili, e la tensione è la fiducia.
- **Gioco del pollo**, detto anche cumulo di neve (*snowdrift*) o falco–colomba (T > 1, S > 0). Ognuno vuole fare il contrario dell'altro. Due celle stabili, e la domanda è chi cede.
- **Armonia** (T < 1, S > 0). Cooperare è dominante e nessuno se ne pente.

Due classici non sono su questa mappa. Nella **battaglia dei sessi** i due giocatori vogliono ritrovarsi insieme, ma ciascuno preferisce un posto diverso: coordinamento con dentro un conflitto. Nel **pari o dispari** (*matching pennies*) un giocatore vince se due monete mostrano la stessa faccia e l'altro se mostrano facce diverse: conflitto puro, e nessuna cella stabile.

Il conteggio di 144 risale ad Anatol Rapoport e Melvin Guyer, che nel 1966 elencarono 78 giochi, perché consideravano uguali anche due giochi in cui i giocatori si scambiano i ruoli. Dei 144, tre quarti sono risolti dalla dominanza e hanno una cella stabile; un ottavo ha due celle stabili, e un ottavo non ne ha nessuna.

## Fin dove arriva la dominanza?

I giochi due per due lusingano la dominanza. La Simulazione C estrae giochi a caso, con ogni payoff un numero indipendente tra 0 e 1, e cancella tutto ciò che può. Su 20.000 giochi per dimensione, l'eliminazione risolve il 75% dei giochi due per due, il 44% dei tre per tre, l'8% dei cinque per cinque e circa uno su mille degli otto per otto. Le celle stabili non scompaiono con lei: a otto per otto due giochi su tre ne hanno ancora almeno una.

Ci serve dunque un'idea che funzioni anche quando non c'è nulla da cancellare. L'abbiamo già incontrata. È la cella stabile, e ha un nome: **equilibrio di Nash**. Il modulo 02 spiega che cosa significa, perché un gioco può averne diversi e quale si gioca davvero.

<!-- simulation -->

## Letture consigliate

- Osborne, M. J. (2004). *An Introduction to Game Theory*. Oxford University Press. Cap. 2 e 12.
- Tadelis, S. (2013). *Game Theory: An Introduction*. Princeton University Press. Cap. 3 e 4.
- Shoham, Y. e Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Cap. 3.
- Roughgarden, T. (2016). *Twenty Lectures on Algorithmic Game Theory*. Cambridge University Press. Lezione 1.
- von Neumann, J. e Morgenstern, O. (1944). *Theory of Games and Economic Behavior*. Princeton University Press.
- Rapoport, A. e Guyer, M. (1966). A taxonomy of 2 × 2 games. *General Systems* 11, 203–214.
- Robinson, D. e Goforth, D. (2005). *The Topology of the 2×2 Games: A New Periodic Table*. Routledge.
- Bernheim, B. D. (1984). Rationalizable strategic behavior. *Econometrica* 52, 1007–1028.
- Pearce, D. G. (1984). Rationalizable strategic behavior and the problem of perfection. *Econometrica* 52, 1029–1050.
- Nagel, R. (1995). Unraveling in guessing games: an experimental study. *American Economic Review* 85, 1313–1326.
- Bosch-Domènech, A., Montalvo, J. G., Nagel, R. e Satorra, A. (2002). One, two, (three), infinity, …: newspaper and lab beauty-contest experiments. *American Economic Review* 92, 1687–1701.
- Camerer, C. F., Ho, T.-H. e Chong, J.-K. (2004). A cognitive hierarchy model of games. *Quarterly Journal of Economics* 119, 861–898.
- Keynes, J. M. (1936). *The General Theory of Employment, Interest and Money*. Macmillan. Cap. 12.
