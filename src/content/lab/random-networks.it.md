<!-- DRAFT: to be reviewed by Adriano -->

## Chi è collegato a chi

Una voce attraversa una scuola in un pomeriggio; un virus attraversa un continente o si esaurisce in un villaggio; un nuovo blocco di transazioni Bitcoin raggiunge migliaia di computer in pochi secondi. In ogni caso l'esito dipende meno dai singoli che dalla trama dei contatti tra loro: chi è collegato a chi. Per ragionarci serve un linguaggio, e quel linguaggio è la teoria delle reti.

## Grafi: lo scheletro di una rete

I matematici chiamano una rete **grafo**. La parola non ha nulla a che vedere con un grafico di dati: un grafo è semplicemente un insieme di **nodi** (detti anche vertici) uniti da **archi** (detti anche collegamenti o lati). I nodi possono essere persone, computer, città o proteine; un arco registra che due di essi interagiscono.

Gli archi possono essere **non orientati**, come un'amicizia, oppure **orientati**, come una strada a senso unico o "A segue B". Possono anche essere **pesati**, cioè portare un numero come una distanza o un costo.

Alcune parole torneranno per tutto il corso:

- Il **grado** di un nodo è il numero di archi che lo toccano.
- Un **cammino** è una sequenza di nodi, ciascuno collegato al successivo; un **ciclo** è un cammino che torna al punto di partenza.
- Un grafo è **connesso** se esiste un cammino tra ogni coppia di nodi. Altrimenti si spezza in **componenti connesse**: gruppi massimali di nodi che possono raggiungersi tutti a vicenda.
- In un **grafo completo** ogni coppia di nodi è collegata, quindi ciascuno degli n nodi ha grado n − 1.

## La potenza dell'astrazione

Una volta ridotto un problema a nodi e archi, domande molto diverse si rivelano la stessa domanda. Trovare il percorso più breve in auto tra due paesi è un problema di cammino minimo: i paesi sono nodi, le strade sono archi pesati con la loro lunghezza.

Ora prendiamo una catena di eventi, in cui ogni passaggio da uno stato al successivo avviene con una certa probabilità p. Quale catena da A a B è la più probabile? Assegniamo a ogni arco la lunghezza −log p. Poiché il logaritmo trasforma i prodotti in somme, sommare le lunghezze lungo un cammino equivale a moltiplicare le probabilità, e il cammino più corto è esattamente la catena più probabile. Un solo algoritmo, due mondi.

## La rete casuale più semplice

Che aspetto ha una rete "tipica", quando nulla di particolare ne determina la forma? La risposta più pulita è il **modello di Erdős–Rényi**, indicato con G(n, p). Prendiamo n nodi. Le coppie possibili sono n(n − 1)/2; per ciascuna lanciamo una moneta truccata e tracciamo l'arco con probabilità p, indipendentemente da tutte le altre.

Ogni nodo ha n − 1 partner possibili, quindi il suo numero medio di collegamenti è

```math
⟨k⟩ = p · (n − 1)
```

Per n grande e ⟨k⟩ moderato, il grado di un nodo segue approssimativamente una **distribuzione di Poisson** centrata su ⟨k⟩. È una distribuzione stretta: quasi tutti i nodi hanno all'incirca il numero medio di collegamenti, e nodi con molte volte la media sono così rari da non comparire praticamente mai. Un grafo casuale è democratico: non ha **hub**.

> **Erdős e Rényi.** Paul Erdős (1913–1996) era un matematico ungherese che viveva con una valigia, spostandosi da un collega all'altro e scrivendo articoli con più di 500 coautori; i matematici citano ancora il proprio "numero di Erdős", la distanza da lui in termini di coautori. Con Alfréd Rényi fondò la teoria dei grafi casuali in articoli del 1959 e del 1960. (A rigore loro fissavano il numero di archi; la versione con la moneta si deve a Edgar Gilbert, sempre nel 1959. Per n grande le due coincidono.)

## Esplorare un grafo: la ricerca in ampiezza

Quali nodi può raggiungere un dato nodo? Lo strumento classico è la **ricerca in ampiezza** (BFS, *breadth-first search*). Si mette il nodo di partenza in una coda e lo si marca. Poi, ripetutamente, si prende il nodo in testa alla coda e si accodano i suoi vicini non marcati, marcandoli. La ricerca si allarga ad anelli (i vicini, poi i vicini dei vicini) finché la coda è vuota.

Ogni nodo entra nella coda una volta e ogni arco viene esaminato al massimo due volte, quindi il costo è proporzionale a nodi più archi. I nodi marcati sono esattamente la componente connessa del punto di partenza; ripartendo da un nodo non marcato si trova la componente successiva, fino a trovarle tutte.

## Due transizioni di fase

Immaginiamo ora di aggiungere archi uno alla volta, a caso, in modo che ⟨k⟩ cresca lentamente da zero. La rete non cambia gradualmente: attraversa due transizioni brusche.

**1. La componente gigante.** Finché ⟨k⟩ < 1 il grafo è una polvere di piccoli frammenti: nodi isolati, coppie, brevi catene, piccoli alberi. Il pezzo più grande è minuscolo rispetto a n. A ⟨k⟩ = 1 accade qualcosa di qualitativamente nuovo: compare una **componente gigante**, e per ⟨k⟩ > 1 contiene una frazione finita S di tutti i nodi. Questa frazione risolve

```math
S = 1 − e^(−⟨k⟩·S)
```

L'equazione ha una lettura semplice: un nodo resta fuori dalla componente gigante solo se nessuno dei suoi vicini vi appartiene, e con gradi poissoniani questa probabilità vale `e^(−⟨k⟩·S)`. Sotto ⟨k⟩ = 1 l'unica soluzione è S = 0; sopra compare una soluzione positiva, che cresce rapidamente verso 1.

**2. La connessione completa.** Una componente gigante non è l'intera rete. Anche quando S è vicino a 1 restano alcuni nodi isolati, perché nessuno dei loro lanci di moneta è andato a buon fine. Gli ultimi scompaiono solo quando ⟨k⟩ si avvicina a ln n, cioè quando

```math
p* ≈ ln(n) / n
```

Questa transizione diventa più netta al crescere di n. Se p = (ln n + c)/n, la probabilità che l'intero grafo sia connesso tende, per n grande, a `exp(−e^(−c))`: quasi zero per c negativo, quasi uno per c positivo, con una finestra di larghezza dell'ordine di 1/n in p.

Sono **transizioni di fase**, cugine matematiche dell'acqua che gela o di un magnete che si magnetizza raffreddandosi: una piccola variazione di un solo parametro cambia qualitativamente l'intero sistema. L'idea tornerà come percolazione nel Modulo 07 e come criticità nel Modulo 08.

## Dove il modello non basta

G(n, p) è un termine di paragone, non un ritratto. Le reti sociali e tecnologiche reali sono molto più **raggruppate** (*clustered*: due tuoi amici hanno molte più probabilità di conoscersi di due persone prese a caso) e molte contengono **hub**, nodi con enormemente più collegamenti della media, che una distribuzione di Poisson esclude. I Moduli 03 e 04 affrontano queste caratteristiche.

## Un collegamento con Bitcoin

I nodi Bitcoin formano una rete peer-to-peer in cui ogni nodo apre un piccolo numero di connessioni in uscita, dell'ordine di dieci, verso peer scelti in gran parte a caso. La teoria dei grafi casuali offre un metro di paragone: con decine di migliaia di nodi ln n vale circa 10, quindi un grado medio intorno a dieci è il punto in cui una rete casuale diventa connessa. La rete dei peer si colloca comodamente sopra questa soglia e, poiché ogni nodo apre da sé le proprie connessioni, nessuno parte isolato: viene così rimosso proprio l'ultimo ostacolo alla connessione. È uno dei motivi per cui un nuovo blocco può raggiungere l'intera rete in pochi secondi. La rete reale non è un grafo di Erdős–Rényi, ma il modello mostra perché bastano pochi collegamenti casuali per nodo.

<!-- simulation -->

## Che cosa osservare

1. Imposta n = 200 e aumenta lentamente ⟨k⟩ da 0,5 a 1,5. Che cosa succede al cluster arancione, e alla frazione S della "componente più grande", quando attraversi ⟨k⟩ = 1?
2. Passa ad "Aggiungi archi gradualmente" e premi Avvia. Osserva come cresce la componente gigante: soprattutto inghiottendo piccoli frammenti, o aggiungendo un nodo alla volta?
3. Confronta le curve simulate della componente gigante con quella teorica. Dove non coincidono, e perché la differenza si riduce per n più grande?
4. Con n = 100 e ⟨k⟩ = 3, conta i nodi isolati. Perché i nodi isolati sono l'ultimo ostacolo alla connessione, anche quando la componente gigante contiene già quasi tutto?
5. Osserva l'esperimento sulla connessione per n = 20, 100 e 500. Quale curva è la più ripida, e dove si colloca ciascuna rispetto alla propria linea ln n?
6. Clicca un nodo fuori dalla componente gigante e avvia la BFS, poi fai lo stesso da un nodo al suo interno. Come si confronta il numero di livelli con il numero di nodi raggiunti?

## Letture consigliate

- P. Erdős e A. Rényi, "On random graphs I", *Publicationes Mathematicae Debrecen* 6 (1959) 290–297.
- P. Erdős e A. Rényi, "On the evolution of random graphs", *Publications of the Mathematical Institute of the Hungarian Academy of Sciences* 5 (1960) 17–61.
- A.-L. Barabási, *Network Science* (Cambridge University Press, 2016), capitolo 3, gratuito online su [networksciencebook.com](http://networksciencebook.com/).
- M. E. J. Newman, *Networks* (Oxford University Press, 2ª ed., 2018).
