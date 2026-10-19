<!-- DRAFT: to be reviewed by Adriano -->

## Monete su una scacchiera

Alla fine degli anni Sessanta l'economista Thomas Schelling voleva capire come i quartieri si dividono per gruppi. Usò una scacchiera e due tipi di monete, lasciò vuote alcune caselle e spostò a mano ogni moneta scontenta dei suoi vicini. Il suo articolo "Dynamic models of segregation" uscì nel 1971. Nel 2005 condivise il premio Nobel per l'economia per lavori che hanno approfondito la comprensione del conflitto e della cooperazione.

La scacchiera mostrò che persone che starebbero bene in un quartiere misto possono comunque finire, tutte insieme, in uno nettamente diviso.

## Che cos'è un modello ad agenti

Un **modello ad agenti** (ABM, dall'inglese *agent-based model*) è fatto di tanti agenti autonomi. Possono essere diversi tra loro, ognuno segue regole semplici, ognuno vede solo ciò che ha vicino e interagisce solo con i suoi vicini. Nessuno scrive un'equazione per l'insieme. Lo schema su grande scala viene *calcolato*: lasci agire gli agenti e guardi che cosa compare.

Molti modelli economici seguono la strada opposta: sostituiscono un'intera popolazione con un solo **agente rappresentativo**, una famiglia o un'impresa media, e ne calcolano il comportamento migliore. Funziona quando la media racconta la storia, e nasconde ciò che succede quando le interazioni contano più degli agenti stessi, come nelle code e nelle strade segregate di questo modulo.

Il modellista Joshua Epstein ha riassunto l'approccio come **scienza sociale generativa**: per spiegare uno schema, mostra come può crescere dal basso. Se non riesci a farlo crescere da comportamenti individuali plausibili, non l'hai ancora spiegato.

## Il modello di Schelling

Prendi una griglia quadrata con due gruppi di agenti, A e B, e alcune celle vuote. Ogni agente guarda le otto celle attorno a sé. È **contento** se almeno una frazione T dei suoi vicini occupati appartiene al suo gruppo. Altrimenti si sposta in una cella vuota. Gli agenti si muovono uno dopo l'altro, e il processo si ripete finché nessuno vuole più spostarsi.

La sorpresa è quanto poca preferenza basti. Con T attorno a un terzo, un agente accetta volentieri di essere in minoranza: due vicini simili su sei gli bastano. Parti da una città casuale, in cui circa metà dei vicini di ciascuno sono simili. Quando si stabilizza, i simili sono circa tre quarti. Ogni spostamento rende contento un agente ma cambia due quartieri: un agente B che lascia una zona A lascia gli altri B più isolati, e saranno loro a spostarsi dopo. Schelling lo diceva così: i **micromotivi** non si sommano in **macrocomportamenti** in modo semplice.

Alza T e la città diventa ancora più segregata, finché si arriva a una soglia oltre la quale non si stabilizza quasi più. A quel punto i due gruppi sono quasi del tutto separati. Restano scontenti solo gli agenti sui confini, e una città in quiete avrebbe bisogno di confini fiancheggiati da celle vuote. Gli spostamenti casuali trovano una disposizione così lentamente o per niente, e gli agenti continuano a muoversi. Una variante cambia di nuovo la storia: gli agenti non amano nemmeno un quartiere *troppo* omogeneo. Con un limite superiore oltre a quello inferiore, la separazione forte viene frenata, al prezzo di più agenti in movimento.

È importante essere chiari su che cosa il modello mostra e che cosa no. Mostra un **meccanismo** possibile: una segregazione forte non richiede pregiudizi forti. Non ci dice le cause reali della segregazione in nessuna città vera, dove contano la discriminazione, il reddito, le politiche abitative, le regole del credito e la storia, spesso molto più delle preferenze individuali. Ciò che può fare è avvertirci che uno schema può essere molto più estremo degli atteggiamenti che lo producono.

## Una lettura da fisico

Guarda la simulazione e a un fisico sembrerà familiare. Piccoli gruppi compaiono, si fondono e crescono, e i loro confini si raddrizzano, come quando olio e acqua si separano o una lega si divide in due fasi. Nel 2006 Dejan Vinković e Alan Kirman hanno reso precisa l'analogia. Hanno tradotto la dinamica di Schelling in quella di particelle che preferiscono vicini simili, con i confini tra gruppi che si comportano come superfici in tensione. La lenta crescita dei domini è il **coarsening** (ingrossamento), un processo studiato da decenni nei materiali. Come nel Modulo 07, contano i cluster. Come nel Modulo 08, i dettagli degli agenti contano meno della classe di dinamica a cui appartengono.

## Il traffico

Ogni automobilista conosce la **coda fantasma**: il traffico si ferma e poi riparte, senza un incidente, un cantiere o una strettoia che lo spieghi. Nel 1992 Kai Nagel e Michael Schreckenberg costruirono un automa cellulare che produce code di questo tipo. Le auto stanno su un anello a una corsia diviso in celle, al massimo una per cella, ciascuna con una velocità da 0 a v_max celle per passo. A ogni passo, tutte le auto insieme:

1. **accelerano** di 1, fino a v_max;
2. **rallentano** se serve, per non tamponare l'auto davanti;
3. con probabilità p, **rallentano di 1** in più, a caso;
4. **avanzano** della loro velocità.

Togli il passo casuale e metti v_max = 1, e ottieni la Regola 184 del Modulo 05: un'auto avanza se la cella davanti è vuota.

Il grafico chiave è il **diagramma fondamentale**, il flusso contro la densità, dove il flusso è il numero di auto che passano da un punto a ogni passo. A bassa densità le auto vanno alla velocità massima e il flusso cresce in proporzione al loro numero. Oltre una densità critica non c'è più spazio perché tutti vadano a v_max, le code prendono il sopravvento e il flusso cala. Senza frenate casuali il picco è netto, alla densità 1/(v_max + 1). Con le frenate, il picco è più basso e arriva prima. Le code compaiono anche spontaneamente, senza altra causa che un guidatore che frena un po' troppo. E **scivolano all'indietro**, contro il traffico: le auto lasciano la testa della coda mentre altre si aggiungono in fondo.

Nel 2008 Yuki Sugiyama e colleghi lo hanno verificato direttamente. Misero 22 auto su una pista circolare lunga circa 230 metri e chiesero ai guidatori di tenere una velocità costante. Per un po' ci riuscirono; poi piccole fluttuazioni crebbero fino a un'onda di stop-and-go che girava all'indietro lungo l'anello, senza alcuna strettoia.

## Usare gli ABM con responsabilità

Gli ABM sono facili da costruire e facili da sopravvalutare. Quelli realistici hanno molti parametri, quindi sono essenziali la **calibrazione** (scegliere i loro valori dai dati), la **validazione** (confrontare le previsioni con dati non usati per costruire il modello) e i controlli di **robustezza** (il risultato sopravvive a piccoli cambiamenti delle regole?). ABM semplici come questi due spiegano meccanismi; quelli dettagliati puntano a previsioni, di un'epidemia o di un'autostrada reale. Entrambi richiedono umiltà su ciò che è stato lasciato fuori.

## Un collegamento con Bitcoin

Bitcoin è un soggetto naturale per i modelli ad agenti. Miner, detentori, trader e gestori di nodi seguono ciascuno le proprie regole locali, e l'aggregato (hash rate, commissioni, adozione) emerge da ciò che fanno. Un'analogia è con il traffico. Lo spazio nei blocchi ha una capacità fissa: un limite di peso di 4 milioni di unità di peso per blocco (BIP 141), con un blocco circa ogni dieci minuti. Quando la domanda resta sotto la capacità, la coda delle transazioni in attesa, la **mempool**, si svuota. Quando la domanda supera la capacità per un po', la coda cresce e le commissioni salgono bruscamente, come il flusso che si satura e le code che si formano oltre la densità critica. È un'analogia, non un modello, ma suggerisce perché i picchi delle commissioni possano comparire all'improvviso quando la domanda cresce di poco.

<!-- simulation -->

## Che cosa osservare

1. Metti T = 0,3 e avvia la città. Quanto diventa segregata, rispetto alla partenza casuale indicata sotto l'indice?
2. Nel pannello B, segui T verso l'alto partendo da 0. Dove salta la segregazione finale, e sopra quale T la città smette di stabilizzarsi entro il limite?
3. Attiva la soglia superiore ("scontento se più di U simili") con U attorno a 0,8. Che cosa succede all'indice di segregazione e alla quota di agenti scontenti?
4. Passa alla regola "nella cella più vicina che li soddisfa" e alza T sopra 0,65. Perché la città si ferma quasi subito, e perché allora è *meno* segregata?
5. Nel modello del traffico, a densità 0,15, metti p = 0 e poi p = 0,2. Da dove vengono le code, e in che direzione si muovono nel diagramma spazio–tempo?
6. Nel pannello D, trova la densità con il flusso più alto. Come si sposta se cambi v_max nel pannello C, e come la cambiano le frenate casuali?

## Letture consigliate

- T. C. Schelling, "Dynamic models of segregation", *Journal of Mathematical Sociology* 1 (1971) 143–186.
- T. C. Schelling, *Micromotives and Macrobehavior* (Norton, 1978).
- K. Nagel & M. Schreckenberg, "A cellular automaton model for freeway traffic", *Journal de Physique I France* 2 (1992) 2221–2229.
- J. M. Epstein & R. Axtell, *Growing Artificial Societies: Social Science from the Bottom Up* (MIT Press, 1996).
- J. M. Epstein, "Agent-based computational models and generative social science", *Complexity* 4(5) (1999) 41–60.
- D. Helbing, "Traffic and related self-driven many-particle systems", *Reviews of Modern Physics* 73 (2001) 1067–1141.
- D. Vinković & A. Kirman, "A physical analogue of the Schelling model", *Proceedings of the National Academy of Sciences* 103 (2006) 19261–19265.
- Y. Sugiyama et al., "Traffic jams without bottlenecks — experimental evidence for the physical mechanism of the formation of a jam", *New Journal of Physics* 10 (2008) 033001.
