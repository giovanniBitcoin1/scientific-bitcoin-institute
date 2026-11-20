<!-- DRAFT: to be reviewed by Adriano -->

## Firenze, 1434

Nel 1434 Cosimo de' Medici tornò dall'esilio e prese il controllo di Firenze, e la sua famiglia lo tenne per gran parte dei tre secoli successivi. Secondo i criteri di un contemporaneo, i Medici non erano i vincitori ovvi. Le famiglie del campo avverso erano più antiche, e alcune di loro, tra cui gli Strozzi, sono di solito descritte come almeno altrettanto ricche e altrettanto presenti nei consigli della città.

Padgett e Ansell (1993) guardarono invece chi aveva sposato chi. Nella rete dei matrimoni tra le famiglie principali i Medici hanno sei collegamenti, gli Strozzi e i Guadagni quattro. È un vantaggio, non un dominio. Il numero che colpisce è un altro: si prendano due altre famiglie qualsiasi e si traccino le catene di matrimoni più corte che le uniscono. I Medici stanno su più della metà di quelle catene, il 52%. La famiglia successiva, i Guadagni, è al 25%, gli Strozzi al 10%.

I Medici non erano molto più grandi dei loro rivali. Erano in una posizione diversa: in mezzo a famiglie che non avevano altro modo di raggiungersi. Questo modulo spiega come trasformare la «posizione» in numeri, e perché di numeri ce n'è più d'uno.

## Quattro domande

«Chi conta qui?» non è una domanda sola. Freeman (1979) ne distinse tre, e una quarta era già nella letteratura.

**Quanti collegamenti hai?** Il grado, k. Conta i contatti diretti e nient'altro.

**Quanto sei vicino a tutti?** Si sommano le distanze da un nodo a tutti gli altri. La vicinanza (closeness) è il numero degli altri diviso per quella somma:

```math
C_i = (N − 1) / Σ_j d(i, j)
```

Vale 1 per un nodo a un passo da tutti. Se la rete è in più pezzi alcune distanze sono infinite e la formula non funziona più; la versione armonica fa invece la media di 1/d, contando zero per un nodo irraggiungibile:

```math
H_i = (1 / (N − 1)) × Σ_j 1 / d(i, j)
```

**Quanto spesso sei in mezzo?** Per ogni coppia di altri nodi si prende la quota dei loro cammini minimi che passano da te, e si sommano le quote:

```math
B_i = Σ_(s,t) σ_st(i) / σ_st
```

Qui σ_st è il numero di cammini minimi tra s e t, e σ_st(i) il numero di quelli che passano per i. È l'intermediazione (betweenness). Dividendo per il numero di coppie, (N − 1)(N − 2)/2, si ottiene un valore tra 0 e 1: lo 0,52 dei Medici. Contare i cammini per ogni coppia sembra lento, ma un algoritmo di Brandes (2001) ci riesce con una sola ricerca a partire da ogni nodo.

**Quanto sono ben collegati i tuoi collegamenti?** È la centralità di autovettore, e richiede una sezione a parte.

## Il prestigio viene dai vicini

Supponiamo che un collegamento con un nodo importante valga più di un collegamento con un nodo oscuro. Allora il punteggio di un nodo deve crescere con i punteggi dei suoi vicini:

```math
x_i = (1/λ) × Σ_j A_ij x_j
```

La definizione è circolare, ed è proprio il circolo a risolverla. Si dà a ogni nodo un punteggio di 1. Si sostituisce ogni punteggio con la somma dei punteggi dei vicini, si riscala in modo che il più grande sia 1, e si ripete. I punteggi smettono di muoversi, e il punto in cui si fermano è l'autovettore principale della matrice di adiacenza; λ è il suo autovalore più grande.

```figure
scores
```

La misura ha due punti deboli. In una rete orientata, un nodo verso cui nessuno punta non riceve nulla, quindi il suo punteggio è zero; e chi è raggiunto solo da nodi di questo tipo ottiene zero a sua volta. Intere regioni possono spegnersi. E in una rete con un hub molto grande i punteggi si ammassano sull'hub e sui suoi vicini, lasciando quasi nulla per distinguere gli altri nodi (Martin, Zhang e Newman 2014).

Katz (1953) aveva già proposto un rimedio, molto prima che il problema avesse un nome: dare a ogni nodo un piccolo punteggio in partenza.

```math
x_i = α × Σ_j A_ij x_j + 1
```

La costante α stabilisce quanto contano i vicini, e deve restare sotto 1/λ. Quando α è piccola i punteggi dei vicini differiscono poco da 1, e la classifica è quella del grado. Quando α si avvicina al limite il punteggio di partenza non conta più, e la classifica è quella della centralità di autovettore. Nel club di karate del modulo 01, Katz a un millesimo del limite non inverte mai due membri con gradi diversi, e a 0,999 del limite la sua classifica è quella dell'autovettore. Una sola manopola porta da una misura all'altra (Bonacich 1987 descrive una famiglia di questo tipo).

## Il navigatore casuale

Sul web la centralità di autovettore ha un difetto in più: un collegamento da una pagina che rimanda a tutto non dovrebbe valere molto. Brin e Page (1998) fecero dividere a ogni pagina il proprio punteggio in parti uguali tra le pagine a cui punta. Il loro PageRank ha una seconda lettura. Immaginiamo un navigatore che clicca su un collegamento a caso, pagina dopo pagina, per sempre. Il PageRank di una pagina è la quota di tempo che il navigatore vi trascorre.

Al navigatore possono capitare due guai. Una pagina senza collegamenti in uscita è un vicolo cieco; per convenzione il navigatore salta allora su una pagina scelta a caso. E un gruppo di pagine che rimandano solo l'una all'altra è una trappola: una volta dentro, il navigatore non esce più, e alla lunga ogni pagina fuori ha punteggio zero.

Perciò il navigatore si annoia. A ogni passo segue un collegamento con probabilità α, e altrimenti salta su una pagina a caso:

```math
PR_i = (1 − α)/N + α × Σ_(j → i) PR_j / k_j^out
```

La scelta originale fu α = 0,85, detto fattore di smorzamento: un salto ogni sei o sette passi. Il salto non è un dettaglio: nella rete della seconda simulazione, tre pagine che formano un anello chiuso hanno il 44% del PageRank con α = 0,85, e tutto con α = 1.

In una rete non orientata e senza salti non ci sono trappole, e la risposta è già nota. Il navigatore è il camminatore del modulo 02, che visita ogni nodo in proporzione ai suoi collegamenti: il PageRank è esattamente k/2L. Con α = 1, la nuova misura è il grado.

## Hub e autorità

Kleinberg (1999) notò che sul web ci sono due modi di essere importanti. Alcune pagine meritano di essere lette. Altre meritano di essere consultate perché rimandano alle pagine che meritano di essere lette. Diede a ogni pagina due punteggi: una buona **autorità** è indicata da buoni hub, e un buon **hub** indica buone autorità. Ogni punteggio è definito attraverso l'altro, e le stesse somme ripetute li trovano entrambi. In una rete non orientata i due coincidono con la centralità di autovettore; ci vuole la direzione per separarli. Una pagina a cui nessuno rimanda può essere il miglior hub di tutti.

## Le misure non sono d'accordo

Krackhardt (1990) disegnò dieci persone immaginarie a forma di aquilone per mostrare una cosa sola.

```figure
kite
```

Diane ha più collegamenti di tutti, sei. Fernando e Garth sono i più vicini a tutti, pur avendo meno collegamenti di Diane. Heather ha solo tre collegamenti, e sta in mezzo a più coppie di chiunque altro: ogni percorso verso Ike e Jane passa da lei. Tre domande, tre vincitori.

Nessuno dei tre è quello giusto. Borgatti (2005) la mise così: ogni misura presuppone qualcosa su che cosa scorre nella rete, e come. Un pacco viaggia lungo un cammino minimo e sta in un posto solo alla volta: è il mondo della vicinanza e dell'intermediazione. Una voce, o un'infezione, si diffonde lungo tutti i percorsi insieme e può tornare indietro: è più vicino al mondo della centralità di autovettore, di Katz e del PageRank, che contano percorsi di ogni lunghezza. Prima di scegliere una misura, chiediti che cosa si muove lungo i collegamenti.

Lo stesso ragionamento vale per sistemi che non sono sociali. In una città, l'intermediazione segnala le strade che il traffico di attraversamento non può evitare, e la vicinanza i luoghi vicini a tutto; le stesse misure sono state usate per confrontare le mappe stradali di città reali (Crucitti, Latora e Porta 2006).

## Anche una classifica è una misura

Il modulo 02 si chiudeva con un avvertimento: un insieme di dati su una rete è una misura. Una classifica calcolata su quei dati ne eredita ogni errore. Quanto si sposta dipende dalla misura, dal tipo di errore e dalla rete (Costenbader e Valente 2003; Borgatti, Carley e Krackhardt 2006).

La terza simulazione fa il confronto. Su una rete a invarianza di scala di 300 nodi con il 20% dei collegamenti mancanti, grado e PageRank ritrovano ancora circa nove dei veri primi dieci, vicinanza e centralità di autovettore circa otto; la correlazione di rango con la verità è 0,84 per il grado e 0,77 per la centralità di autovettore. Gli hub sono difficili da perdere. Su una rete small-world della stessa dimensione, dove nessun nodo spicca, lo stesso errore lascia una correlazione di 0,48 per il grado e di 0,36 per la centralità di autovettore, e tra due e cinque dei primi dieci, secondo la misura. Una classifica è stabile solo quanto le differenze che mette in ordine.

In quella tabella non c'è una misura migliore. Il grado è robusto perché è locale; l'intermediazione risponde a una domanda che il grado non sa porre.

## Che cosa viene dopo

La centralità guarda un nodo alla volta. Il modulo 04 ne guarda tre: i triangoli, la forza dei legami deboli e i piccoli schemi di cui sono fatte le reti.

<!-- simulation -->

## Letture consigliate

- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press. Cap. 7.
- Latora, V., Nicosia, V. e Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Cap. 2.
- Easley, D. e Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Cap. 14.
- Freeman, L. C. (1979). Centrality in social networks: conceptual clarification. *Social Networks* 1, 215–239.
- Padgett, J. F. e Ansell, C. K. (1993). Robust action and the rise of the Medici, 1400–1434. *American Journal of Sociology* 98, 1259–1319.
- Krackhardt, D. (1990). Assessing the political landscape: structure, cognition, and power in organizations. *Administrative Science Quarterly* 35, 342–369.
- Katz, L. (1953). A new status index derived from sociometric analysis. *Psychometrika* 18, 39–43.
- Bonacich, P. (1987). Power and centrality: a family of measures. *American Journal of Sociology* 92, 1170–1182.
- Brin, S. e Page, L. (1998). The anatomy of a large-scale hypertextual Web search engine. *Computer Networks and ISDN Systems* 30, 107–117.
- Kleinberg, J. M. (1999). Authoritative sources in a hyperlinked environment. *Journal of the ACM* 46, 604–632.
- Brandes, U. (2001). A faster algorithm for betweenness centrality. *Journal of Mathematical Sociology* 25, 163–177.
- Borgatti, S. P. (2005). Centrality and network flow. *Social Networks* 27, 55–71.
- Martin, T., Zhang, X. e Newman, M. E. J. (2014). Localization and centrality in networks. *Physical Review E* 90, 052808.
- Costenbader, E. e Valente, T. W. (2003). The stability of centrality measures when networks are sampled. *Social Networks* 25, 283–307.
- Borgatti, S. P., Carley, K. M. e Krackhardt, D. (2006). On the robustness of centrality measures under conditions of imperfect data. *Social Networks* 28, 124–136.
- Crucitti, P., Latora, V. e Porta, S. (2006). Centrality measures in spatial networks of urban streets. *Physical Review E* 73, 036125.
