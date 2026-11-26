
## Due strade

La Parte III tratta di molti giocatori che condividono qualcosa: qui, le strade. Ogni automobilista sceglie il percorso più veloce per sé, e così rallenta tutti gli altri che lo percorrono. Nessuno è malintenzionato o confuso: il guaio è che nessuno paga il ritardo che impone agli altri. Di quanto il risultato è peggiore di quello che sceglierebbe un pianificatore?

Arthur Pigou (1920) propose l'esempio con cui l'argomento si apre ancora oggi. Un'unità di traffico va da A a B. La strada in alto è larga e lunga: richiede sempre 1 ora. La strada in basso è corta e stretta: richiede x ore, dove x è la quota degli automobilisti che la percorrono. Per nessuno la strada in basso richiede più di 1 ora, quindi gli automobilisti egoisti la prendono tutti e ognuno impiega 1 ora.

Un pianificatore che divide a metà gli automobilisti fa meglio. Chi va in alto impiega 1 ora, chi va in basso mezz'ora, e la media è 3/4. Chi è mandato in alto ci rimette, ma la media scende di un quarto.

Il rapporto tra il costo dell'esito egoistico e quello migliore, qui 4/3, è il **prezzo dell'anarchia**. Elias Koutsoupias e Christos Papadimitriou (1999) introdussero questo modo di misurare un equilibrio rispetto all'ottimo, chiamandolo *coordination ratio*; il nome attuale arrivò poco dopo (Papadimitriou 2001). Se la strada in basso richiede x^p ore, gli egoisti la prendono ancora tutti, mentre al crescere di p il pianificatore ne tiene lontani sempre di più. Il rapporto cresce senza limite: 1,626 per p = 2, 2,151 per p = 4, 3,512 per p = 10.

```figure
tworoads
```

## Costi uguali e un obiettivo nascosto

Che aspetto ha un equilibrio quando gli automobilisti sono un continuo e ciascuno è una goccia nel **flusso**? John Wardrop (1952) lo enunciò come principio: tutti i percorsi usati costano lo stesso e nessun percorso inutilizzato costa meno. È l'**equilibrio di Wardrop**.

Martin Beckmann, Bart McGuire e Christopher Winsten (1956) trovarono l'obiettivo che gli automobilisti egoisti minimizzano senza saperlo. Indichiamo con f_e il flusso sulla strada e, con c_e il suo costo. L'equilibrio è il flusso che minimizza

```math
Φ(f) = Σ_e ∫_0^{f_e} c_e(x) dx
```

mentre il pianificatore minimizza il costo totale

```math
C(f) = Σ_e f_e c_e(f_e)
```

Φ è un **potenziale**: spostare un po' di traffico da un percorso a un altro cambia Φ di quella quantità moltiplicata per la differenza tra i costi dei due percorsi. I due problemi hanno la stessa forma. L'ottimo è l'equilibrio calcolato con i **costi marginali** c_e(x) + x c_e'(x), perché la derivata di x c_e(x) è il costo che un automobilista sostiene più il ritardo che aggiunge a tutti gli altri.

Quindi un **pedaggio** pari a x c_e'(x), il ritardo che un automobilista impone agli altri, porta gli egoisti a scegliere l'ottimo. È l'idea di Pigou di un'imposta su un'**esternalità**, l'**imposta pigouviana**. Nel suo esempio, con la ripartizione del pianificatore, il pedaggio sulla strada in basso è 1/2: lì tempo più pedaggio fa 1/2 + 1/2 = 1, quanto la strada in alto. Gli automobilisti si dividono quindi come vuole il pianificatore. Ognuno paga ancora 1, in tempo o in tempo più pedaggio, e l'1/4 risparmiato diventa incasso del pedaggio.

## Il paradosso di Braess

Dietrich Braess (1968) trovò qualcosa di più strano. Un'unità di traffico va da s a t. La strada s → v richiede x ore e v → t ne richiede 1; s → w richiede 1 e w → t richiede x, dove x è la quota su quella strada. Metà degli automobilisti va da una parte e metà dall'altra, e ognuno impiega 1,5 ore.

Ora aggiungiamo una strada v → w che non costa nulla. Chi è sul percorso in alto può fare s → v → w → t: x + 0 + x ore, mai più di 2 e, con la vecchia ripartizione, solo 1. Tutti passano allo zigzag, le due strade x si riempiono e ognuno impiega 2 ore. Nessuno ha interesse a cambiare: anche gli altri due percorsi costano 2. La strada nuova ha rallentato tutti.

Con una scorciatoia che costa c ore, l'equilibrio manda 1 − 2c sullo zigzag e c su ciascuno degli altri due percorsi, e ogni percorso costa 2 − c finché c < 1/2. Ogni scorciatoia più veloce di mezz'ora peggiora le cose, mentre il pianificatore non la usa mai: tiene la vecchia ripartizione a 1,5 ore.

```figure
braess
```

Il **paradosso di Braess** non riguarda solo il traffico. Joel Cohen e Paul Horowitz (1991) lo riprodussero con molle e fili: un peso è appeso a due catene di molle e fili unite da un filo corto, e tagliando quel filo il peso sale.

## Quanto può andar male?

L'esempio di Pigou con x^p mostra già che in generale il prezzo dell'anarchia non ha limite. Tim Roughgarden ed Éva Tardos (2002) mostrarono che un limite c'è quando i costi sono affini, a x + b: allora il prezzo dell'anarchia vale al più 4/3, in ogni rete e per ogni domanda. Le due strade di Pigou sono il caso peggiore.

Roughgarden (2003) mostrò poi che, per una classe di costi, il caso peggiore è sempre una rete alla Pigou di due strade parallele, una con costo costante; la topologia della rete non conta. Il limite per costi polinomiali di grado p è quindi il rapporto di Pigou della prima sezione: 1,626 per p = 2, 1,896 per p = 3, 2,151 per p = 4.

Senza alcun limite sui costi resta una garanzia di altro tipo (Roughgarden e Tardos 2002): l'equilibrio non costa più di quanto costerebbe l'ottimo con il doppio del traffico. Le reti casuali di solito vanno molto meglio del caso peggiore: la Simulazione A mostra di quanto.

## Automobilisti che contano

Finora ogni automobilista era una goccia nel flusso: il gioco era **non atomico**. Con un numero finito di automobilisti, ciascuno una parte apprezzabile del traffico, il gioco è **atomico**: quando uno cambia percorso, cambiano anche i costi che sostiene lui stesso. Robert Rosenthal (1973) mostrò che questi **giochi di congestione** hanno ancora un potenziale. Sia n_e il numero di automobilisti sulla strada e, e sia

```math
Φ = Σ_e (c_e(1) + c_e(2) + ... + c_e(n_e))
```

Quando un automobilista cambia percorso, Φ varia esattamente quanto il suo costo: sulle strade che lascia sparisce l'ultimo termine, su quelle in cui entra se ne aggiunge uno, e quei termini sono ciò che pagava e ciò che paga ora. Quindi ogni cambio che conviene a chi lo fa abbassa Φ, e la **dinamica di miglior risposta** non può entrare in un ciclo. Poiché Φ assume un numero finito di valori, i cambi finiscono in un equilibrio puro. Dov Monderer e Lloyd Shapley (1996) chiamarono **giochi potenziali** questi giochi, e Φ la loro **funzione potenziale**.

Ora equilibri diversi possono avere costi diversi. Prendiamo la rete di Braess con 10 automobilisti, le due strade x che costano k/10 quando le percorrono k automobilisti, e una scorciatoia senza costo. Partendo da tutti sul percorso in alto, nove cambi portano a 1, 1 e 8 automobilisti sui percorsi in alto, in basso e a zigzag: 1,82 ore in media, contro le 1,5 del pianificatore. Anche lo stato con tutti sullo zigzag è un equilibrio, a 2. La Simulazione B esegue i cambi uno per uno e verifica che ogni guadagno sia il calo di Φ.

Con costi affini il caso peggiore per gli automobilisti che contano è 5/2 (Awerbuch, Azar ed Epstein 2005; Christodoulou e Koutsoupias 2005), peggio del 4/3 del gioco non atomico. La Simulazione B ha una rete di quattro automobilisti che lo raggiunge. Nei giochi grandi, poi, trovare un equilibrio puro di un gioco di congestione è difficile quanto qualsiasi problema di ricerca locale della sua classe, e le migliori risposte possono richiedere un numero esponenziale di passi (Fabrikant, Papadimitriou e Talwar 2004).

## L'equilibrio migliore

Quando gli equilibri differiscono, ci si può interrogare sul migliore anziché sul peggiore. Il **prezzo della stabilità** confronta l'equilibrio migliore con l'ottimo.

Nei **giochi di condivisione dei costi** su una rete, ogni strada ha un costo fisso, diviso in parti uguali tra i giocatori che la usano (Anshelevich, Dasgupta, Kleinberg, Tardos, Wexler e Roughgarden 2004). Qui più utenti rendono una strada più economica per ciascuno. Il gioco è ancora un gioco di congestione, e il suo potenziale è

```math
Φ = Σ_e c_e (1 + 1/2 + ... + 1/n_e)
```

Φ non è mai inferiore al costo totale né superiore a H_k volte tale costo, dove H_k = 1 + 1/2 + ... + 1/k è il **numero armonico** e k il numero dei giocatori. Facciamo partire la dinamica dall'ottimo: Φ può solo scendere, quindi l'equilibrio raggiunto costa al più Φ(ottimo) ≤ H_k volte l'ottimo, e l'equilibrio migliore non costa di più: al più 2,93 volte l'ottimo per 10 giocatori.

Il limite non si può migliorare. Nell'*hub* della Simulazione C, il giocatore i può prendere la sua strada verso la destinazione, che costa 1/i, oppure una strada senza costo verso un hub e poi la strada dell'hub, che costa 1 + ε, da dividere. Con tutti all'hub il costo è 1 + ε, l'ottimo. Ma lì l'ultimo giocatore paga (1 + ε)/k, più dell'1/k della sua strada, e se ne va; allora il successivo ha un motivo per andarsene, e così via. Nell'unico equilibrio ognuno è sulla propria strada: costo H_k. L'estremo opposto mostra il prezzo dell'anarchia: due strade, una che costa k e una 1 + ε. Tutti sulla strada economica: un equilibrio, ed è l'ottimo. Tutti su quella cara: ancora un equilibrio, perché ognuno paga 1 e, da solo sull'altra, pagherebbe 1 + ε. L'equilibrio peggiore costa k/(1 + ε) volte l'ottimo, mentre il migliore è l'ottimo stesso.

## Il prossimo modulo

[Modulo 09, Giochi su reti](/game-theory-lab/games-on-networks): giochi su una rete, in cui ogni giocatore bada solo ai suoi vicini, e reti che i giocatori costruiscono da sé; con un riquadro sulla Lightning Network di Bitcoin. Per i cammini minimi e i flussi in quanto tali, si veda il [modulo 10](/network-lab/weights-flows-navigation) del Network Lab.

<!-- simulation -->

## Letture consigliate

- Roughgarden, T. (2016). *Twenty Lectures on Algorithmic Game Theory*. Cambridge University Press. Lezioni 11, 12, 13, 15 e 16.
- Nisan, N., Roughgarden, T., Tardos, É. e Vazirani, V. (a cura di) (2007). *Algorithmic Game Theory*. Cambridge University Press. Cap. 17 (l'inefficienza degli equilibri), 18 (giochi di instradamento) e 19 (giochi di formazione di reti e il metodo della funzione potenziale).
- Shoham, Y. e Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Sezione 6.4 (giochi di congestione).
- Pigou, A. C. (1920). *The Economics of Welfare*. Macmillan.
- Wardrop, J. G. (1952). Some theoretical aspects of road traffic research. *Proceedings of the Institution of Civil Engineers, Part II* 1, 325–362.
- Beckmann, M., McGuire, C. B. e Winsten, C. B. (1956). *Studies in the Economics of Transportation*. Yale University Press.
- Braess, D. (1968). Über ein Paradoxon aus der Verkehrsplanung. *Unternehmensforschung* 12, 258–268.
- Cohen, J. E. e Horowitz, P. (1991). Paradoxical behaviour of mechanical and electrical networks. *Nature* 352, 699–701.
- Koutsoupias, E. e Papadimitriou, C. (1999). Worst-case equilibria. *STACS 1999*.
- Papadimitriou, C. (2001). Algorithms, games, and the Internet. *STOC 2001*.
- Roughgarden, T. e Tardos, É. (2002). How bad is selfish routing? *Journal of the ACM* 49, 236–259.
- Roughgarden, T. (2003). The price of anarchy is independent of the network topology. *Journal of Computer and System Sciences* 67, 341–364.
- Rosenthal, R. W. (1973). A class of games possessing pure-strategy Nash equilibria. *International Journal of Game Theory* 2, 65–67.
- Monderer, D. e Shapley, L. S. (1996). Potential games. *Games and Economic Behavior* 14, 124–143.
- Awerbuch, B., Azar, Y. e Epstein, A. (2005). The price of routing unsplittable flow. *STOC 2005*.
- Christodoulou, G. e Koutsoupias, E. (2005). The price of anarchy of finite congestion games. *STOC 2005*.
- Fabrikant, A., Papadimitriou, C. e Talwar, K. (2004). The complexity of pure Nash equilibria. *STOC 2004*.
- Anshelevich, E., Dasgupta, A., Kleinberg, J., Tardos, É., Wexler, T. e Roughgarden, T. (2004). The price of stability for network design with fair cost allocation. *FOCS 2004* (versione su rivista: *SIAM Journal on Computing* 38, 2008).
- Il Network Lab, [modulo 10](/network-lab/weights-flows-navigation).
