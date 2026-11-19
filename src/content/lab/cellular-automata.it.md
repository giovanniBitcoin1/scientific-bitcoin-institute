<!-- DRAFT: to be reviewed by Adriano -->

## Una conchiglia e una riga di codice

Il cono tessile, *Conus textile*, porta sulla conchiglia un fitto disegno di triangoli bruni e bianchi, piccoli e grandi, ammassati senza mai ripetersi del tutto. Esegui al computer una regola di una riga, partendo da un solo punto scuro, e compare un'immagine sorprendentemente simile. Coincidenza, o regole locali semplici possono davvero generare tanta complessità?

## Righe di celle

Gli automi cellulari furono inventati negli anni Quaranta da John von Neumann e Stanisław Ulam. Von Neumann voleva sapere se una macchina potesse costruire una copia di sé stessa, e Ulam gli suggerì di porre la domanda in un universo semplificato fatto di celle su una griglia.

Un **automa cellulare** (CA, dall'inglese *cellular automaton*) è una riga, o una griglia, di celle, ognuna in uno di un numero finito di stati. Il tempo avanza a passi discreti e a ogni passo tutte le celle vengono aggiornate nello stesso istante dalla stessa regola, che guarda solo un piccolo intorno della cella. Non c'è un controllo centrale: tutto ciò che accade è la somma di decisioni locali.

## Automi elementari e i loro numeri

Il caso interessante più semplice ha una dimensione e due stati, 0 e 1, e l'intorno di una cella è la cella stessa con le sue due vicine. Tre celle a due stati danno 2³ = 8 intorni possibili; una regola dice in che cosa si trasforma ciascuno, e otto scelte sì-o-no danno 2⁸ = 256 regole, gli **automi cellulari elementari**.

Stephen Wolfram propose un modo compatto per dar loro un nome. Elenca gli intorni nell'ordine 111, 110, …, 000, scrivi sotto ciascuno lo stato che produce e leggi gli otto risultati come un numero binario. Per la regola "la nuova cella è l'OR esclusivo (XOR) delle sue due vicine":

```math
111 110 101 100 011 010 001 000
 0   1   0   1   1   0   1   0     →  01011010₂ = 90
```

È la Regola 90.

Disegna ogni riga sotto la precedente e ottieni un **diagramma spazio–tempo**, con lo spazio in orizzontale e il tempo che scorre verso il basso. Poiché una cella riceve notizie solo dalle vicine, l'informazione viaggia al massimo di una cella per passo: ciò che accade in un punto può influenzare, dopo t passi, solo le celle entro distanza t. Ogni cella ha un **cono di luce**, come in relatività, con una cella per passo nel ruolo della velocità della luce.

## Quattro tipi di comportamento

Nel 1983–84 Wolfram fece evolvere tutte le 256 regole a partire da righe casuali e ordinò ciò che vedeva in quattro classi.

- **Classe I**: tutto si spegne o diventa uniforme.
- **Classe II**: strutture stabili o periodiche, blocchi separati che restano fermi o lampeggiano.
- **Classe III**: configurazioni in apparenza casuali. La Regola 30 da una sola cella fa crescere un triangolo con strisce regolari sul lato sinistro e, all'interno, una dispersione disordinata di triangoli di ogni dimensione: l'immagine che somiglia alla conchiglia.
- **Classe IV**: strutture localizzate che si muovono su uno sfondo regolare e interagiscono quando si scontrano, come nella Regola 110.

Tra ripetizione e casualità c'è anche l'**annidamento**. La Regola 90 da una sola cella disegna il **triangolo di Sierpiński**, triangoli dentro triangoli; le sue righe sono il triangolo di Tartaglia con i numeri dispari in scuro. Un frattale da una regola che non è altro che uno XOR. Partendo da una riga casuale, però, la Regola 90 appare disordinata, e Wolfram la collocò nella classe III: le classi descrivono le partenze tipiche, non quelle speciali. Sono una descrizione, non un teorema, e alcune regole stanno a metà tra due classi.

## Casualità dal determinismo

La Regola 30 è del tutto deterministica, eppure la colonna di celle sotto il punto di partenza supera molti test statistici di casualità; *Mathematica* la usò come generatore di numeri casuali.

Ogni **generatore pseudo-casuale** funziona così: una macchina deterministica con uno stato finito, che prima o poi deve tornare in uno stato già visitato e ripetersi. Uno buono ha un ciclo lunghissimo e un'uscita che nessun test pratico distingue da lanci di moneta. Uno cattivo nasconde regolarità che il test giusto, o il grafico giusto, porta allo scoperto. La simulazione confronta la Regola 30 con un generatore ben collaudato e con uno volutamente debole.

## Macchine che calcolano

Nel 1936 Alan Turing descrisse una macchina astratta che legge e scrive simboli su un nastro seguendo una tabella finita di istruzioni, e mostrò che una macchina **universale** può imitarne qualunque altra se riceve in ingresso la sua tabella. La **tesi di Church–Turing** afferma che tutto ciò che si può calcolare con una procedura passo dopo passo si può calcolare con una macchina di Turing.

Wolfram congetturò che la Regola 110 fosse universale in questo senso, e Matthew Cook lo dimostrò in un articolo pubblicato nel 2004. In linea di principio la Regola 110 può calcolare tutto ciò che calcola un qualsiasi computer, se la riga iniziale è preparata con grande cura: strutture in movimento, gli **alianti** (*glider*), trasportano segnali e le loro collisioni fanno da porte logiche. La costruzione è lentissima; il punto è quanto poco basti per l'universalità.

## Il margine del caos

Nel 1990 Christopher Langton caratterizzò le regole con un parametro λ, la frazione di intorni mandati in uno stato non quiescente; per gli automi elementari, la quota degli otto bit di uscita uguali a 1. Le regole con λ piccolo tendono a congelarsi, quelle vicine a 1/2 tendono a sembrare caotiche, e Langton sostenne che il comportamento complesso, capace di calcolare, si trova vicino alla transizione tra ordine e caos: il **margine del caos** (*edge of chaos*).

L'idea ha avuto grande influenza ed è ancora discussa. Nel 1993 Melanie Mitchell, Peter Hraber e James Crutchfield riesaminarono un esperimento che sembrava confermarla e non riuscirono a riprodurne il risultato; inoltre λ è un riassunto grossolano che mette insieme regole molto diverse.

## Deterministico, eppure imprevedibile

La prima riga di un CA fissa tutto ciò che segue. Eppure per molte regole nessuno conosce una scorciatoia: per conoscere la riga un milione della Regola 30 sembra necessario calcolare tutte quelle precedenti. Wolfram la chiama **irriducibilità computazionale**. È parente del caos del Modulo 01: lì piccolissimi errori nella condizione iniziale crescevano in modo esponenziale; qui, anche con una partenza esatta, l'unica via per la risposta può essere far girare il sistema.

## Una strada fatta di celle

La Regola 184 si legge come traffico: 1 è un'auto, 0 strada libera, e un'auto avanza di una cella se quella davanti è vuota. Le auto non vengono mai create né distrutte; sotto metà occupazione il traffico scorre, sopra si formano ingorghi che arretrano. Il Modulo 09 tornerà sul traffico.

## Di che cosa è un modello?

Alcuni CA sono veri modelli fisici. Hans Meinhardt spiegò la pigmentazione delle conchiglie con sistemi attivatore–inibitore, parenti continui dei CA con la stessa struttura essenziale: una fila di celle sul bordo in crescita della conchiglia che deposita una nuova riga a ogni passo. Altri esempi sono le regole del traffico e i gas reticolari di particelle che saltano e si urtano, usati per simulare i fluidi. Molte regole invece non modellano nulla in particolare: sono oggetti matematici, preziosi perché mostrano che cosa sanno fare le regole semplici. Un modello semplice spiega mostrando quali pochi ingredienti sono **sufficienti** per un comportamento: se otto bit disegnano i triangoli di una conchiglia, la lumaca non ha bisogno di codificare ogni triangolo.

## Un collegamento con Bitcoin

La proof of work di Bitcoin si basa su SHA-256, una funzione deterministica costruita con addizioni e semplici operazioni bit a bit su parole di 32 bit. La sua uscita sembra casuale, e invertire un solo bit d'ingresso cambia circa metà dei bit d'uscita: l'**effetto valanga**, lo stesso fenomeno che puoi osservare con "inverti una cella" in un automa di classe III.

Ma sembrare casuale non significa essere sicuro. Nel 1985 Wolfram propose la Regola 30 come cifrario a flusso, e nel 1991 Willi Meier e Othmar Staffelbach mostrarono come romperlo ricavando la chiave dall'uscita. La crittografia richiede molto più della casualità statistica: deve resistere a un avversario che sa esattamente come funziona la funzione e cerca qualsiasi struttura da sfruttare.

<!-- simulation -->

## Che cosa osservare

1. Carica la Regola 90 da una sola cella: quale frattale compare? Ora parti da una riga casuale. Che cosa resta dei triangoli?
2. Fai partire la Regola 30 e poi la Regola 110 da una riga casuale e attiva "Inverti una cella". In quale la differenza si propaga, e a che velocità si muove il suo bordo? Può mai superare una cella per passo?
3. Nella galleria, trova tre regole per ciascuna delle quattro classi di Wolfram. Poi filtra per λ: dove si trovano quasi tutte le regole di classe III, e ci sono eccezioni?
4. Carica la Regola 184 con una riga casuale e bordo periodico. Porta la densità da 0,3 a 0,7: quando compaiono gli ingorghi, e in che direzione si muovono?
5. Guarda il grafico a dispersione del generatore debole: quale schema lo tradisce? Trova il più piccolo N per cui lo smascherano anche i semplici conteggi.
6. Partendo dalla Regola 30, inverti un bit di uscita alla volta con le icone degli intorni. Quanto spesso un solo bit porta la regola in un'altra classe?

## Letture consigliate

- J. von Neumann, *Theory of Self-Reproducing Automata*, a cura di A. W. Burks, che lo completò (University of Illinois Press, 1966).
- S. Wolfram, "Statistical mechanics of cellular automata", *Reviews of Modern Physics* 55 (1983) 601–644.
- S. Wolfram, "Universality and complexity in cellular automata", *Physica D* 10 (1984) 1–35.
- C. G. Langton, "Computation at the edge of chaos: phase transitions and emergent computation", *Physica D* 42 (1990) 12–37.
- M. Cook, "Universality in elementary cellular automata", *Complex Systems* 15 (2004) 1–40.
- H. Meinhardt, *The Algorithmic Beauty of Sea Shells* (Springer, 1995).
- S. Wolfram, *A New Kind of Science* (Wolfram Media, 2002).
