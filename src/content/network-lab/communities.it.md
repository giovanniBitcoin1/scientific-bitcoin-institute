<!-- DRAFT: to be reviewed by Adriano -->

## Un club che si divise

Dal 1970 al 1972 l'antropologo Wayne Zachary seguì un club universitario di karate e annotò quali dei suoi 34 membri passavano del tempo insieme fuori dalle lezioni (Zachary 1977). In quel periodo una lite tra l'istruttore e uno dei dirigenti divise il club, che alla fine si spaccò in due. Le amicizie annotate prima della scissione la contenevano già: disegnata su carta, la rete ha due lobi, uno attorno a ciascun capo.

Girvan e Newman (2002) usarono il club per mettere alla prova un metodo. Tolsero, uno alla volta, il collegamento con la betweenness più alta, la misura del [modulo 03](/network-lab/centrality) che conta quanti cammini minimi passano lungo un collegamento. I collegamenti tra gruppi portano molti cammini, perché ogni cammino da un gruppo all'altro deve attraversarli, e così se ne vanno per primi. Quando la rete si spezzò in due, i pezzi coincidevano con le due fazioni della scissione reale, con un solo membro classificato male.

I gruppi più densi al loro interno che tra loro si chiamano **comunità**. Si vedono a occhio e sono sorprendentemente difficili da definire: Fortunato (2010) passa in rassegna decine di definizioni e di metodi. Questo modulo segue quelli più usati, e i modi in cui sbagliano.

## La modularità

Newman e Girvan (2004) proposero un punteggio per una partizione dei nodi in gruppi. Con L collegamenti in tutto, sia L_c il numero di collegamenti dentro il gruppo c e d_c la somma dei gradi dei suoi nodi. Allora

```math
Q = Σ_c [ L_c/L − (d_c/2L)² ]
```

Il primo termine è la quota di collegamenti che cade dentro i gruppi. Il secondo è la quota che vi cadrebbe se gli stessi gradi fossero cablati a caso: un estremo di collegamento finisce nel gruppo c con probabilità d_c/2L, e quindi entrambi gli estremi con probabilità (d_c/2L)². Quel modello nullo è il modello di configurazione del [modulo 05](/network-lab/heavy-tails-done-right), e il confronto è quello voluto dal [modulo 02](/network-lab/what-are-we-measuring): non «molti collegamenti dentro», ma «più di quanti ne darebbe il caso con gli stessi gradi». **Q, la modularità,** vale 0 quando tutto è un solo gruppo, può essere negativa e resta sotto 1.

```figure
split
```

Nel club di karate, con le fazioni come sono registrate nei dati del repository, le fazioni danno Q = 0,358. Se invece si cerca il Q più alto, la partizione migliore che si conosca ha quattro gruppi e Q = 0,4198 (esercizio 4): il punteggio preferisce tagliare in due ciascuna fazione.

## Trovare il massimo

Il numero delle partizioni cresce più che esponenzialmente con il numero dei nodi, e Brandes e colleghi (2008) dimostrarono che trovare la partizione con il Q più alto è NP-difficile: non si conosce un metodo che lo faccia in fretta su ogni rete. I metodi pratici si accontentano di una buona partizione.

Il più usato è il metodo di Blondel, Guillaume, Lambiotte e Lefebvre (2008), chiamato **Louvain** dalla loro università. Ogni nodo parte in un gruppo tutto suo. Visitando i nodi in ordine casuale, sposta ciascuno nel gruppo vicino che alza di più Q, e continua finché una mossa lo alza. Poi fonde ogni gruppo in un solo nodo, tenendo i collegamenti interni come un peso su quel nodo, e ripete le mosse sulla rete più piccola. Si ferma quando un giro non cambia nulla. È veloce e di solito arriva a un Q alto. Ha un difetto: un nodo che tiene insieme un gruppo può esserne spostato fuori, lasciando il resto in due pezzi non più collegati tra loro. Traag, Waltman e van Eck (2019) trovarono che fino a un quarto dei gruppi restituiti da Louvain erano collegati male al loro interno, e fino al 16% non erano collegati affatto; il loro metodo **Leiden** aggiunge un passo che garantisce gruppi connessi.

La **propagazione delle etichette** (Raghavan, Albert e Kumara 2007) è ancora più semplice: ogni nodo parte con un'etichetta sua e prende ripetutamente l'etichetta più comune tra i suoi vicini, finché nessun nodo vuole cambiare. Non usa alcun punteggio, e a volte lascia che una sola etichetta si prenda tutta la rete.

## Tre avvertenze

**Le reti a caso hanno punteggi alti.** Guimerà, Sales-Pardo e Amaral (2004) mostrarono che la modularità può essere grande dove non c'è alcun gruppo: in una rete a caso sparsa si trova sempre una partizione in molti pezzi che mette dentro molti più collegamenti di quanti ne metterebbe il caso, perché la ricerca sceglie la disposizione fortunata. Nella prima simulazione Louvain trova Q = 0,52, 0,32, 0,23 con grado medio 4, 8 e 16 su reti a caso di 1.000 nodi. Un Q alto da solo non prova nulla; va confrontato con ciò che lo stesso metodo trova su versioni randomizzate della rete.

**Il limite di risoluzione.** Fortunato e Barthélemy (2007) mostrarono che la modularità ha una scala sua. Si prenda un anello di n cricche di s nodi, ogni cricca unita alla successiva da un solo collegamento. Ogni cricca è un gruppo evidentissimo. Eppure fondere le cricche vicine a coppie alza Q non appena n > s(s − 1) + 2 (esercizio 2): il termine atteso si misura sulla rete intera, e quando la rete è abbastanza grande due cricche unite da un collegamento sembrano, a Q, più legate di quanto il caso permetta. Gruppi con meno di circa √(2L) collegamenti possono restare invisibili.

```figure
ring
```

Un **parametro di risoluzione** γ (Reichardt e Bornholdt 2006) pesa il termine atteso: Q_γ = Σ_c [L_c/L − γ (d_c/2L)²]. Un γ più grande favorisce gruppi più piccoli. Nella seconda simulazione un intervallo di γ ritrova le cricche, ma γ è una scelta in più, e in una rete reale raramente c'è un solo γ che vada bene per ogni gruppo.

**Una cima piatta.** Good, de Montjoye e Clauset (2010) mostrarono che in molte reti i valori più alti di Q sono raggiunti da un gran numero di partizioni molto diverse, tutte a un soffio dal massimo. Far girare Louvain con semi diversi dà allora risposte diverse con punteggi quasi uguali, e nessuna ha più titolo delle altre a dirsi le comunità della rete.

## Un modello invece di un punteggio

La modularità chiede se una partizione batte il caso. Un altro approccio chiede come potrebbe essere nata una rete con dei gruppi, e poi quali gruppi rendono più probabile la rete osservata. Il **modello a blocchi stocastico** (Holland, Laskey e Leinhardt 1983) fa questo. Ogni nodo appartiene a uno di q gruppi, e due nodi sono collegati con una probabilità che dipende solo dai loro gruppi: una tabella q × q di probabilità. Adattare il modello per massima verosimiglianza trova gruppi di ogni tipo: densi al loro interno, come le comunità, ma anche gruppi che si evitano, o un nucleo e una periferia. Un modello a blocchi semplice metterebbe tutti gli hub in un gruppo solo perché hanno molti collegamenti; la versione corretta per il grado di Karrer e Newman (2011) dà a ogni nodo una sua propensione a formare collegamenti, così che gli hub restino hub senza formare un gruppo a parte. Quanti gruppi usare si può allora decidere per inferenza statistica, pesando un adattamento migliore contro un modello più complicato, invece di massimizzare un punteggio che premia sempre più struttura.

## Quando i gruppi non si possono trovare

Un modello dice anche quando nessun metodo può riuscire. Si prendano due gruppi uguali di N/2 nodi e si colleghino due nodi con probabilità c_in/N se stanno nello stesso gruppo e c_out/N se no. Ogni nodo ha allora in media c_in/2 collegamenti dentro il suo gruppo e c_out/2 verso l'altro, e il grado medio è c̄ = (c_in + c_out)/2. Decelle, Krzakala, Moore e Zdeborová (2011) mostrarono che in reti grandi e sparse di questo tipo nessun metodo può collocare i nodi meglio del caso a meno che

```math
c_in − c_out > 2 √c̄
```

e per q gruppi uguali la condizione diventa c_in − c_out > q √c̄. Sotto questa **soglia di rilevabilità** i gruppi ci sono, scritti nel modo in cui la rete è stata fatta, ma i collegamenti portano troppa poca informazione su di essi. Con c̄ = 3 la soglia è 2√3 ≈ 3,46. Una rete con c_in = 4,5 e c_out = 1,5, in cui il 75% dei collegamenti di ogni nodo resta dentro il suo gruppo, sta sotto la soglia (esercizio 3).

Nella terza simulazione il metodo spettrale divide i nodi secondo i segni dell'autovettore principale della matrice di modularità. Con c̄ = 10 e 4.000 nodi la sua sovrapposizione con i gruppi impiantati, 0 per il caso e 1 per la perfezione, è 0,02 a 0,6 volte la soglia e 0,93 al doppio. In una rete finita il limite netto si sfuma, e questo metodo ha bisogno di un certo margine sopra di esso. Louvain sulle stesse reti sparse trova molti gruppi piccoli con un Q alto, che i gruppi impiantati si possano rilevare o no.

## Verificare una risposta

Un metodo si prova su reti con gruppi noti perché impiantati. Il **benchmark** di Girvan e Newman (2002) ha 128 nodi in quattro gruppi di 32, grado medio 16, e k_out collegamenti per nodo verso gli altri gruppi. Nella prima simulazione Louvain ritrova i gruppi quasi alla perfezione con k_out basso, con NMI 0,98 a k_out = 6 e 0,45 a k_out = 8. Il benchmark LFR (Lancichinetti, Fortunato e Radicchi 2008) dà gradi e dimensioni dei gruppi a coda pesante, più vicini alle reti reali. Due partizioni si confrontano con l'**informazione mutua normalizzata** (NMI, Danon et al. 2005), 1 quando sono uguali a meno dei nomi dei gruppi e vicina a 0 quando una non dice nulla dell'altra.

Una cautela. Gli attributi dei nodi, come le fazioni del club o il reparto di un dipendente, non sono le vere comunità. Peel, Larremore e Clauset (2017) mostrarono che una partizione in disaccordo con essi non è per questo sbagliata: la rete può essere organizzata da qualcos'altro, o da più cose insieme.

## Prossimo modulo

Finora ogni collegamento ha contato uguale. Il [modulo 10](/network-lab/weights-flows-navigation) dà ai collegamenti dei pesi e segue ciò che vi scorre sopra: percorsi, flussi e navigazione.

<!-- simulation -->

## Letture consigliate

- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Cap. 9.
- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press. Cap. 14.
- Latora, V., Nicosia, V. e Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Cap. 9.
- Easley, D. e Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Cap. 3.
- Zachary, W. W. (1977). An information flow model for conflict and fission in small groups. *Journal of Anthropological Research* 33, 452–473.
- Girvan, M. e Newman, M. E. J. (2002). Community structure in social and biological networks. *PNAS* 99, 7821–7826.
- Newman, M. E. J. e Girvan, M. (2004). Finding and evaluating community structure in networks. *Physical Review E* 69, 026113.
- Blondel, V. D., Guillaume, J.-L., Lambiotte, R. e Lefebvre, E. (2008). Fast unfolding of communities in large networks. *Journal of Statistical Mechanics* P10008.
- Traag, V. A., Waltman, L. e van Eck, N. J. (2019). From Louvain to Leiden: guaranteeing well-connected communities. *Scientific Reports* 9, 5233.
- Brandes, U., Delling, D., Gaertler, M., Görke, R., Hoefer, M., Nikoloski, Z. e Wagner, D. (2008). On modularity clustering. *IEEE Transactions on Knowledge and Data Engineering* 20, 172–188.
- Guimerà, R., Sales-Pardo, M. e Amaral, L. A. N. (2004). Modularity from fluctuations in random graphs and complex networks. *Physical Review E* 70, 025101.
- Fortunato, S. e Barthélemy, M. (2007). Resolution limit in community detection. *PNAS* 104, 36–41.
- Reichardt, J. e Bornholdt, S. (2006). Statistical mechanics of community detection. *Physical Review E* 74, 016110.
- Good, B. H., de Montjoye, Y.-A. e Clauset, A. (2010). Performance of modularity maximization in practical contexts. *Physical Review E* 81, 046106.
- Holland, P. W., Laskey, K. B. e Leinhardt, S. (1983). Stochastic blockmodels: first steps. *Social Networks* 5, 109–137.
- Karrer, B. e Newman, M. E. J. (2011). Stochastic blockmodels and community structure in networks. *Physical Review E* 83, 016107.
- Decelle, A., Krzakala, F., Moore, C. e Zdeborová, L. (2011). Asymptotic analysis of the stochastic block model for modular networks and its algorithmic applications. *Physical Review E* 84, 066106.
- Lancichinetti, A., Fortunato, S. e Radicchi, F. (2008). Benchmark graphs for testing community detection algorithms. *Physical Review E* 78, 046110.
- Danon, L., Díaz-Guilera, A., Duch, J. e Arenas, A. (2005). Comparing community structure identification. *Journal of Statistical Mechanics* P09008.
- Raghavan, U. N., Albert, R. e Kumara, S. (2007). Near linear time algorithm to detect community structures in large-scale networks. *Physical Review E* 76, 036106.
- Peel, L., Larremore, D. B. e Clauset, A. (2017). The ground truth about metadata and community detection in networks. *Science Advances* 3, e1602548.
- Fortunato, S. (2010). Community detection in graphs. *Physics Reports* 486, 75–174.
