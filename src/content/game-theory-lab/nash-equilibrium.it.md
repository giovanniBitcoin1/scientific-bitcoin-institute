<!-- DRAFT: to be reviewed by Adriano -->

## Una cella stabile con un nome

Il [modulo 01](/game-theory-lab/what-is-a-game) si è chiuso su una cella della tabella che nessuno vuole lasciare da solo. Nel 1950 John Nash, dottorando a Princeton, diede a quell'idea la sua forma generale: prima in una nota di due pagine, poi in una tesi di dottorato di ventisette.

Si prenda un numero qualsiasi di giocatori, e ciascuno scelga una strategia. Le scelte sono un **equilibrio di Nash** se nessun giocatore può ottenere un *payoff* più alto cambiando strategia da solo, mentre tutti gli altri tengono la propria. La cella stabile del modulo 01 è il caso di due giocatori.

L'eliminazione iterata non cancella mai un equilibrio: una strategia giocata in un equilibrio è una miglior risposta a ciò che fanno gli altri, quindi nessun'altra può batterla ovunque. E se l'eliminazione lascia una sola cella, quella cella è l'unico equilibrio del gioco.

## Che cosa un equilibrio non è

Non è necessariamente un bene per i giocatori: nel dilemma del prigioniero l'unico equilibrio è proprio la cella che entrambi cambierebbero volentieri con un'altra. Non è necessariamente unico. E non racconta come i giocatori ci arrivano. La definizione dice che nessuno se ne andrebbe, non che qualcuno ci arriverebbe.

Lo si può leggere in due modi. Il primo: un accordo che si fa rispettare da solo. Se i giocatori si fossero accordati prima, senza contratto e senza giudice, nessuno vorrebbe mancare alla parola. Il secondo: una convenzione in una popolazione. Se tutti sanno che cosa si fa di solito, e ciò che si fa è un equilibrio, allora fare lo stesso è la scelta migliore, e l'abitudine si mantiene da sé.

La Simulazione A misura quanto la definizione lascia aperto. In un gioco casuale con m strategie a testa, una cella è un equilibrio quando il payoff del giocatore di riga è il più grande della sua colonna e quello del giocatore di colonna il più grande della sua riga: una probabilità di 1/m × 1/m. Le celle sono m², quindi un gioco casuale ha in media esattamente un equilibrio, a ogni dimensione. Un gioco due per due su otto non ha equilibri e uno su otto ne ha due; dei giochi otto per otto, il 32% non ne ha e il 26% ne ha due o più. E se i due giocatori si limitano a rispondere a turno nel modo migliore, finiscono in un equilibrio da sette celle di partenza su otto nei giochi due per due, ma solo dal 52% delle celle in quelli otto per otto. Dalle altre girano in un ciclo.

## Più equilibri: quale?

Da che lato della strada si guida? Tutti a sinistra è un equilibrio, e lo è anche tutti a destra. La tabella non può scegliere: sono la stessa cella sotto nomi diversi.

In *The Strategy of Conflict* (1960) Thomas Schelling pose alle persone domande di questo tipo. Domani devi incontrare uno sconosciuto a New York; non avete concordato né luogo né ora, e non potete parlarvi. Dove vai, e quando? Più della metà dei suoi intervistati scelse la Grand Central Station, e quasi tutti mezzogiorno. Invitati a dire testa o croce per coincidere con un compagno invisibile, 36 su 42 dissero testa. Schelling chiamò risposte come queste **punti focali**. Ciò che risolve il problema non sta nella tabella: è l'evidenza, la storia, l'usanza.

## Meglio o più sicuro

Coordinarsi è più difficile quando gli equilibri non sono né ugualmente buoni né ugualmente sicuri. Jean-Jacques Rousseau descrisse il caso nel 1755: cacciatori che possono prendere un cervo solo se ognuno resta al suo posto, e una lepre che passa di corsa e che ciascuno può catturare da solo.

Chiamiamo a il payoff quando entrambi cacciano il cervo, b quello di chi lo caccia da solo, c quello di chi caccia la lepre mentre l'altro aspetta il cervo, e d quando entrambi cacciano la lepre, con a > c ≥ d > b. Entrambi al cervo è un equilibrio, e lo è anche entrambi alla lepre. Se l'altro caccia il cervo con probabilità q, il cervo dà `a q + b (1 − q)` e la lepre `c q + d (1 − q)`. Il cervo è la scelta migliore solo quando q supera

```math
q* = (d − b) / ((a − c) + (d − b))
```

```figure
staghunt
```

Con a = 4, b = 0, c = 3 e d = 2 si ottiene q* = 2/3: bisogna essere piuttosto sicuri dell'altro. L'equilibrio del cervo è **Pareto-dominante**, migliore per entrambi. L'equilibrio della lepre è **rischio-dominante**: è quello che richiede meno fiducia nell'altro giocatore (i termini sono di Harsanyi e Selten 1988). Quando i due criteri non sono d'accordo, gli esperimenti tendono a dare ragione alla sicurezza. In uno di essi (Van Huyck, Battalio e Beil, 1990), gruppi da 14 a 16 persone sceglievano ciascuno uno sforzo da 1 a 7 ed erano pagati in base allo sforzo più basso del gruppo. Tutti a 7 era l'equilibrio migliore; dal quarto turno in poi, lo sforzo più basso fu 1 in ogni gruppo.

Nella Simulazione B un giocatore alla volta guarda altri dieci e caccia il cervo solo se abbastanza di loro lo fanno. La convenzione migliore prende il sopravvento solo dove è già seguita da abbastanza persone. Il *tipping point* è a circa 0,73 della popolazione, poco sopra q*, perché un campione di dieci deve mostrarne sette per superare i due terzi. Partendo dal 70% di cacciatori di cervo, tutti finiscono al cervo circa una volta su sette; partendo dal 75%, circa quattro volte su cinque.

## Quando le strategie sono numeri

Spesso una strategia è un numero: una quantità, un prezzo, uno sforzo. La tabella non serve più, ma la definizione non cambia. Nel 1838 Augustin Cournot studiò due imprese che vendono lo stesso prodotto. Ciascuna sceglie quanto produrre, q₁ e q₂. Il prezzo scende con il totale, `p = a − (q₁ + q₂)`, e ogni unità costa c. L'impresa 1 guadagna `(a − q₁ − q₂ − c) q₁`, che è massimo per

```math
q₁ = (a − c − q₂) / 2
```

Questa è la **funzione di reazione** dell'impresa 1, la sua miglior risposta a ogni q₂: una retta. L'impresa 2 ha la sua. L'equilibrio è il punto in cui le due rette di reazione si incrociano: (a − c)/3 ciascuna.

```figure
cournot
```

Con n imprese ciascuna produce (a − c)/(n + 1). Con a = 10 e c = 1 il prezzo è 5,5 per un monopolio, 4 con due imprese, 2,5 con cinque e 1,82 con dieci, e tende al costo. E le due imprese non possono semplicemente accordarsi per dividersi la produzione di monopolio, perché quel punto non sta su nessuna delle due rette: la miglior risposta di ciascuna al cartello è produrre di più (esercizio 3).

## Stesso mercato, altre regole

Nel 1883 Joseph Bertrand recensì il libro di Cournot e cambiò una cosa sola. Le imprese scelgano i prezzi, non le quantità, e i compratori vadano dall'impresa meno cara. Ora chi scende di un centesimo sotto il rivale prende tutto, e l'unico equilibrio è che entrambe chiedano il costo (esercizio 4). Bastano due imprese per un risultato che Cournot raggiunge solo con moltissime.

Stesse imprese, stessi compratori, stessi costi. È cambiato ciò che i giocatori scelgono, e il prezzo è passato da 4 a 1. Le regole fanno parte del gioco, come nel palazzetto del badminton del modulo 01.

## Le gare

In un terzo tipo di rivalità i giocatori spendono per vincere un premio. Ciascuno sceglie uno sforzo, e la probabilità di vincere un premio che vale V è la propria quota dello sforzo totale. Gordon Tullock propose questa gara nel 1980 come modello dell'attività di lobby; le corse ai brevetti, le cause in tribunale e lo sport hanno la stessa forma. Con n giocatori uguali e un costo di 1 per unità di sforzo, in equilibrio ciascuno spende V (n − 1)/n². Insieme spendono la frazione (n − 1)/n del premio: metà con due giocatori, nove decimi con dieci.

Con costi c_i diversi per unità di sforzo, chi costa meno scaccia chi costa di più. Restano in gara solo gli m giocatori meno cari, e le loro probabilità di vincere sono

```math
s_i = 1 − c_i (m − 1) / (c_1 + … + c_m)
```

La quota del premio che viene spesa è `1 − Σ s_i²`. La Simulazione C lascia che i giocatori cerchino tutto questo per tentativi.

```box
Bitcoin: il mining come gara
Circa ogni dieci minuti un *miner* vince la ricompensa del blocco, con probabilità pari alla sua quota dell'*hash rate* totale. Con l'hash rate come sforzo e il valore della ricompensa come premio, è la gara vista sopra (Dimitri 2017).

**Che cosa dice il modello.** La spesa per il mining segue il valore della ricompensa, non il numero delle transazioni, e con libera entrata i profitti vanno a zero. L'aggiustamento della difficoltà fissa il numero dei blocchi, quindi più hash rate non produce più monete: tutti i miner guadagnerebbero di più se tutti dimezzassero il proprio, e nessuno può farlo da solo. Piccole differenze di costo diventano grandi differenze di quota: costi di 1,0, 1,1, 1,2, 1,5 e 2,0 danno quote del 37,5%, 31,3%, 25%, 6,3% e nulla (Arnosti e Weinberg 2022).

**I limiti.** È un modello a un solo colpo, a costo unitario costante. I miner veri comprano macchine che durano anni e si uniscono in *pool* (modulo 10), e il valore della ricompensa segue il prezzo. Né dice se la spesa sia troppa: dipende da che cosa compra (modulo 14). Un'ipotesi con i suoi limiti, non una descrizione del settore.
```

## Che cosa viene dopo

Non tutti i giochi hanno un equilibrio da trovare. Un gioco due per due su otto non ha nessuna cella stabile, e nemmeno circa un terzo dei grandi giochi casuali della Simulazione A; il pari o dispari è il più piccolo. Il [modulo 03](/game-theory-lab/mixed-strategies-zero-sum) mostra che anche questi giochi hanno un equilibrio, non appena ai giocatori è permesso mescolare a caso le proprie strategie.

<!-- simulation -->

## Letture consigliate

- Osborne, M. J. (2004). *An Introduction to Game Theory*. Oxford University Press. Cap. 2 e 3.
- Tadelis, S. (2013). *Game Theory: An Introduction*. Princeton University Press. Cap. 5.
- Shoham, Y. e Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Cap. 3.
- Nash, J. F. (1950). Equilibrium points in n-person games. *Proceedings of the National Academy of Sciences* 36, 48–49.
- Nash, J. (1951). Non-cooperative games. *Annals of Mathematics* 54, 286–295.
- Schelling, T. C. (1960). *The Strategy of Conflict*. Harvard University Press.
- Lewis, D. (1969). *Convention: A Philosophical Study*. Harvard University Press.
- Harsanyi, J. C. e Selten, R. (1988). *A General Theory of Equilibrium Selection in Games*. MIT Press.
- Van Huyck, J. B., Battalio, R. C. e Beil, R. O. (1990). Tacit coordination games, strategic uncertainty, and coordination failure. *American Economic Review* 80, 234–248.
- Cournot, A. (1838). *Recherches sur les principes mathématiques de la théorie des richesses*. Hachette.
- Bertrand, J. (1883). Recensione delle *Recherches* di Cournot e della *Théorie mathématique de la richesse sociale* di Walras. *Journal des Savants*, settembre, 499–508.
- Tullock, G. (1980). Efficient rent seeking. In Buchanan, J. M., Tollison, R. D. e Tullock, G. (a cura di), *Toward a Theory of the Rent-Seeking Society*. Texas A&M University Press.
- Theocharis, R. D. (1960). On the stability of the Cournot solution on the oligopoly problem. *Review of Economic Studies* 27, 133–134.
- Goldberg, K., Goldman, A. J. e Newman, M. (1968). The probability of an equilibrium point. *Journal of Research of the National Bureau of Standards* 72B, 93–101.
- Dimitri, N. (2017). Bitcoin mining as a contest. *Ledger* 2, 31–37.
- Arnosti, N. e Weinberg, S. M. (2022). Bitcoin: a natural oligopoly. *Management Science* 68, 4755–4771.
- Narayanan, A., Bonneau, J., Felten, E., Miller, A. e Goldfeder, S. (2016). *Bitcoin and Cryptocurrency Technologies*. Princeton University Press. Cap. 5.
- Nakamoto, S. (2008). Bitcoin: a peer-to-peer electronic cash system.
