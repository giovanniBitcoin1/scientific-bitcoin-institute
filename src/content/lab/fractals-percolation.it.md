<!-- DRAFT: to be reviewed by Adriano -->

## Quanto è lunga una costa?

Fai camminare un compasso a punte fisse lungo la costa della Gran Bretagna su una carta, contando i passi. Dimezza l'apertura e ricomincia: il totale viene più lungo, perché il righello più corto segue baie e promontori che prima scavalcava. Il fisico inglese Lewis Fry Richardson raccolse misure di questo tipo per coste e confini e trovò che la lunghezza misurata continua a crescere quando il righello si accorcia, come una potenza della lunghezza del righello. Il suo studio uscì dopo la sua morte, nel 1961.

Nel 1967 Benoît Mandelbrot riprese i dati di Richardson in un breve articolo su *Science*: "Quanto è lunga la costa della Gran Bretagna?". La domanda, rispose, non ha un'unica risposta. La lunghezza dipende dal righello; ciò che resta fisso è quanto in fretta cambia al variare del righello, e quel ritmo misura qualcosa di reale della forma: una dimensione che non deve per forza essere un numero intero.

## La dimensione come legge di scala

Copri una forma con una griglia di scatole quadrate di lato ε e conta N(ε), le scatole che ne contengono una parte. Per un segmento, dimezzare ε raddoppia il conteggio: N cresce come 1/ε. Per un quadrato pieno, dimezzare ε lo quadruplica: N cresce come 1/ε². In generale

```math
N(ε) ∝ ε^(−D)
```

e l'esponente D è la **dimensione di box-counting** (o di conteggio a scatole):

```math
D = lim (ε → 0) log N(ε) / log(1/ε)
```

In pratica si riporta log N contro log(1/ε) e se ne misura la pendenza. Niente la obbliga a essere un numero intero.

La **curva di Koch** è l'esempio classico. Taglia un segmento in tre parti e sostituisci il terzo centrale con due lati di un triangolo equilatero; ripeti su ciascuno dei quattro nuovi segmenti, all'infinito. La curva è fatta di quattro copie di sé stessa, ognuna grande un terzo. Rimpicciolire le scatole di tre volte moltiplica il conteggio per quattro, quindi D = log 4 / log 3 ≈ 1,262: più di una linea, meno di una superficie. Il **triangolo di Sierpiński** è fatto di tre copie di sé grandi la metà, quindi D = log 3 / log 2 ≈ 1,585. Lo hai già incontrato: è la figura che la Regola 90 fa crescere da una sola cella nel Modulo 05.

Entrambe le forme sono **autosimili**: un pezzo, ingrandito, somiglia al tutto. Nei frattali matematici le copie sono esatte a ogni scala. In natura la somiglianza è statistica, un pezzo ingrandito *somiglia* al tutto senza esserne una copia, e vale solo in un intervallo limitato di scale. Felci, reti fluviali, le vie aeree dei polmoni e i fulmini la mostrano tutti. Mandelbrot raccolse questi esempi in *The Fractal Geometry of Nature* (1982).

## Far crescere un frattale

I frattali possono anche crescere. Nel 1981 Thomas Witten e Leonard Sander proposero l'**aggregazione limitata dalla diffusione** (DLA, *diffusion-limited aggregation*). Fissa una particella al centro. Liberane un'altra lontano, lasciala vagare a caso finché non tocca la prima e bloccala lì. Ripeti: ogni nuova particella vaga finché non urta l'aggregato in crescita e ci resta attaccata.

Il risultato non è un grumo compatto ma un albero ramificato. Il motivo è lo **schermaggio**: una particella che vaga ha molte più probabilità di urtare la punta di un ramo che di infilarsi in un fiordo stretto tra due rami. Le punte crescono, quindi catturano ancora di più, e l'interno resta vuoto. In due dimensioni gli aggregati DLA hanno D ≈ 1,71, e somigliano in modo sorprendente alle dendriti minerali, ai metalli depositati da una corrente elettrica e ai fulmini.

## La percolazione

Ora una domanda diversa. Prendi una griglia quadrata e rendi ogni sito **aperto** con probabilità p e chiuso altrimenti, in modo indipendente. I siti aperti che si toccano lungo un lato formano dei **cluster**. Esiste un cluster aperto che collega il bordo superiore a quello inferiore? Questa è la **percolazione**, introdotta da Simon Broadbent e John Hammersley nel 1957 per descrivere un fluido che filtra in un mezzo casuale.

Per p piccolo i siti aperti formano piccole isole e niente attraversa la griglia; per p grande quasi tutto è connesso. In mezzo c'è un cambiamento netto a una **probabilità critica** p_c. Per la percolazione di sito sul reticolo quadrato p_c ≈ 0,5927; il valore esatto non è noto, è solo calcolato numericamente con molte cifre. Per la percolazione di legame, in cui sono aperti i collegamenti tra i siti anziché i siti, la soglia del reticolo quadrato è esattamente 1/2, un risultato dimostrato da Harry Kesten nel 1980.

Su una griglia finita il cambiamento è graduale, ma diventa più ripido man mano che la griglia cresce; su una griglia infinita sarebbe un salto. Lo hai visto nel Modulo 02, dove una componente gigante compariva quando il grado medio di un grafo casuale superava 1 e la transizione si faceva più netta al crescere del numero di nodi. Quella componente gigante *è* percolazione, su una rete invece che su una griglia.

## Al punto critico

A p_c il cluster che attraversa la griglia è a sua volta un frattale, pieno di buchi a ogni scala, con D = 91/48 ≈ 1,896 in due dimensioni: la sua massa cresce come L^1,896 su una griglia di lato L. Convivono cluster di tutte le dimensioni, e la loro distribuzione è una legge di potenza, il segno di un sistema senza una scala caratteristica.

Gli esponenti che descrivono questo comportamento sono **universali**. Cambia il reticolo da quadrato a triangolare, o fai percolare i legami anziché i siti, e p_c cambia, ma gli esponenti no: dipendono dalla dimensione dello spazio, non dai dettagli del modello. È una delle idee più profonde della fisica statistica, e porta agli stati critici del Modulo 08.

## Contare con il caso

Come sappiamo che p_c ≈ 0,5927? Con una simulazione **Monte Carlo**: si generano molte griglie casuali e si conta quante volte vengono attraversate. Fatto in modo ingenuo, ogni valore di p richiede griglie nuove. Nel 2000 Mark Newman e Robert Ziff descrissero un metodo migliore: aprire i siti uno alla volta in ordine casuale e seguire i cluster mentre si fondono, con una struttura **union–find** che unisce due cluster in un tempo quasi costante. Una sola esecuzione passa così per tutti i valori di p da 0 a 1. Il Pannello B lo fa passo per passo; il Pannello C lo ripete molte volte per diverse dimensioni della griglia.

## Ovunque guardi

La percolazione descrive petrolio e acqua che si muovono nella roccia porosa, e il caffè che passa attraverso la polvere macinata. Descrive un'epidemia che si diffonde in una popolazione, o un incendio in un bosco (il modello dell'incendio boschivo torna nel Modulo 08), e la conducibilità di una miscela di grani conduttori e isolanti. E descrive la robustezza delle reti: l'esperimento del Modulo 04 sui guasti casuali e sugli attacchi mirati è percolazione su un grafo, togliendo nodi invece di aprirli, come mostrarono Reuven Cohen, Keren Erez, Daniel ben-Avraham e Shlomo Havlin nel 2000.

## Un collegamento con Bitcoin

Quanti nodi di una rete peer-to-peer possono guastarsi a caso prima che si frammenti? Considera una rete idealizzata, un grafo casuale con gradi di Poisson e grado medio ⟨k⟩. Se sopravvive una frazione q dei nodi, scelti a caso, una componente connessa gigante resta finché

```math
q · ⟨k⟩ > 1
```

Ogni nodo Bitcoin mantiene diverse connessioni in uscita, e molti accettano anche connessioni in entrata, quindi il grado medio è intorno a dieci o più. Nel modello idealizzato la rete resta allora unita finché non si sono guastati a caso circa nove nodi su dieci.

Le reti reali però non sono grafi di Poisson, e i guasti reali raramente sono indipendenti. Un data center che si spegne, un paese che taglia le connessioni o un'interruzione di un fornitore cloud tolgono molti nodi in un colpo solo, e questi guasti correlati sono molto più pericolosi di quelli casuali, un po' come l'attacco mirato del Modulo 04. Per questo la diversità dei nodi, tra luoghi, fornitori e operatori, conta quanto il loro numero.

<!-- simulation -->

## Che cosa osservare

1. Misura la curva di Koch all'iterazione 6. Quanto si avvicina la tua stima a 1,262? Che cosa succede se fai il fit solo con le scatole più grandi, o solo con le più piccole?
2. Misura il segmento e il quadrato pieno per controllare che il metodo funzioni, poi il triangolo di Sierpiński. Perché le stime non sono esattamente 1, 2 e 1,585?
3. Fai crescere un aggregato DLA di 10.000 particelle. Perché il centro resta vuoto? Confronta la D̂ del conteggio a scatole e la D̂ della relazione massa–raggio tra loro e con 1,71. Perché due metodi onesti possono dare risposte diverse sullo stesso aggregato finito, e che cosa ti dice questo su qualunque dimensione frattale ricavata dai dati?
4. Misura un cammino casuale di 10³ passi e poi di 10⁶ passi. Come cambia D̂, e perché?
5. Imposta L = 200 e sposta p lentamente attraverso 0,59. Che cosa succede al cluster più grande? Versa dall'alto appena sotto e appena sopra p_c, e confronta fin dove arriva il fluido.
6. Nell'esperimento, dove si incrociano le curve di percolazione per diversi L? Confronta l'incrocio con p_c ≈ 0,5927, e guarda come le curve del cluster più grande si fanno più nette al crescere di L.

## Letture consigliate

- L. F. Richardson, "The problem of contiguity", *General Systems Yearbook* 6 (1961) 139–187.
- B. Mandelbrot, "How long is the coast of Britain? Statistical self-similarity and fractional dimension", *Science* 156 (1967) 636–638.
- B. Mandelbrot, *The Fractal Geometry of Nature* (W. H. Freeman, 1982).
- S. R. Broadbent e J. M. Hammersley, "Percolation processes I", *Proceedings of the Cambridge Philosophical Society* 53 (1957) 629–641.
- H. Kesten, "The critical probability of bond percolation on the square lattice equals 1/2", *Communications in Mathematical Physics* 74 (1980) 41–59.
- T. A. Witten e L. M. Sander, "Diffusion-limited aggregation, a kinetic critical phenomenon", *Physical Review Letters* 47 (1981) 1400–1403.
- D. Stauffer e A. Aharony, *Introduction to Percolation Theory*, 2ª ed. (Taylor & Francis, 1994).
- M. E. J. Newman e R. M. Ziff, "Efficient Monte Carlo algorithm and high-precision results for percolation", *Physical Review Letters* 85 (2000) 4104–4107.
- R. Cohen, K. Erez, D. ben-Avraham e S. Havlin, "Resilience of the Internet to random breakdowns", *Physical Review Letters* 85 (2000) 4626–4628.
