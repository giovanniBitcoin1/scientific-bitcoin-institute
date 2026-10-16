<!-- DRAFT: to be reviewed by Adriano -->

## Tipico e atipico

Metti in fila mille adulti in ordine di altezza. Nessuno sarà dieci volte più alto di un altro, e l'altezza media dice più o meno che cosa aspettarsi dalla prossima persona che incontrerai.

Ora mettili in fila in ordine di ricchezza. Alcuni non possiedono quasi nulla, e uno o due possono possedere più di tutti gli altri messi insieme. Lo stesso accade con le popolazioni delle città, l'energia dei terremoti, le citazioni degli articoli scientifici e i link che puntano alle pagine web. Per grandezze di questo tipo la persona, la città o l'articolo "medio" non dice quasi nulla: una manciata di giganti trascina la media lontano dal caso tipico.

## Curve a campana e code pesanti

L'altezza segue qualcosa di simile a una gaussiana, la curva a campana, la cui coda decresce come `exp(−x²)`: ogni deviazione standard in più rende un'osservazione enormemente più rara. La distribuzione esponenziale, per esempio dei tempi di attesa tra eventi casuali indipendenti, decresce più lentamente, come `exp(−x)`, ma comunque abbastanza in fretta da rendere praticamente impossibili i valori enormi.

Una legge di potenza è diversa. Scriviamone la coda come probabilità di superare x:

```math
P(X > x) = (x / x_min)^(−α),   x ≥ x_min
```

Se si riscala x di un fattore λ qualsiasi, la legge di potenza viene solo moltiplicata per `λ^(−α)`: la forma della curva non cambia. Non c'è una dimensione caratteristica, un punto in cui comincia il "grande", ed è per questo che queste distribuzioni si dicono **a invarianza di scala** (*scale-free*). Su assi logaritmici una legge di potenza diventa una retta di pendenza −α.

Ne seguono tre conseguenze. I valori estremi non sono anomalie da scartare: fanno parte della distribuzione. Le medie possono non esistere: per α ≤ 2 la varianza è infinita, per α ≤ 1 anche la media, e la media del campione non si stabilizza mai perché ogni nuovo gigante la spinge di nuovo in alto. E una piccola frazione della popolazione detiene una grande frazione del totale. Vilfredo Pareto trovò, in lavori pubblicati a partire dal 1896, che redditi e proprietà erano distribuiti in questo modo; la versione citata di solito è che circa il 20% degli italiani possedeva circa l'80% della terra. Una coda a legge di potenza con α vicino a 1,16 produce esattamente questa ripartizione 80/20.

## La legge di Zipf

Negli anni Trenta e Quaranta il linguista George Kingsley Zipf ordinò le parole di lunghi testi per frequenza. La frequenza della r-esima parola più comune decresceva circa come `r^(−s)`, con s vicino a 1: la seconda parola compare circa la metà delle volte della prima, la terza circa un terzo.

La classifica di Zipf e la coda di Pareto sono la stessa cosa vista da due lati. Prendiamo N valori da una legge di potenza. Il valore di rango r, chiamiamolo x_r, è superato da circa r di essi, quindi r ≈ N · P(X > x_r) = N (x_r / x_min)^(−α). Risolvendo per x_r:

```math
x_r ≈ x_min · (r / N)^(−1/α)
```

dunque l'esponente di rango è s = 1/α. Lo s ≈ 1 di Zipf corrisponde ad α ≈ 1, proprio al limite oltre il quale la media smette di esistere.

## Come riconoscere onestamente una legge di potenza

Una retta su un grafico log–log è necessaria ma non sufficiente: molte curve sembrano rette su due o tre decadi. E l'istogramma ordinario è il posto peggiore dove guardare, perché nella coda la maggior parte delle classi contiene zero o una osservazione e il grafico si dissolve nel rumore proprio dove conta. Usa classi che crescono in progressione geometrica (classi logaritmiche) o, meglio, la **distribuzione cumulativa complementare** (CCDF), la frazione di osservazioni grandi almeno quanto x: non richiede classi, e per una legge di potenza è una retta di pendenza −α.

Non stimare l'esponente adattando una retta a un istogramma, che dà risultati distorti. Con x_min noto, la stima di massima verosimiglianza è

```math
α̂ = N / Σ ln(x_i / x_min)
```

La densità di questa distribuzione decresce come `x^(−(α+1))`; scritta per quell'esponente, la stessa stima diventa 1 + N / Σ ln(x_i / x_min), la forma usata da Aaron Clauset, Cosma Shalizi e Mark Newman (2009). Gli autori insistono anche sul confronto con le alternative: una lognormale, il cui logaritmo è gaussiano, può sembrare una retta su parecchie decadi.

## Reti con hub

Nel Modulo 02 i gradi di un grafo casuale seguivano una distribuzione di Poisson: un nodo con dieci volte il grado medio è praticamente impossibile. Nel 1999 Albert-László Barabási e Réka Albert misurarono le distribuzioni dei gradi del World Wide Web, degli attori cinematografici collegati dall'aver recitato insieme e di altre reti, e trovarono invece code pesanti, circa `P(k) ∝ k^(−γ)`. Pochi **hub** avevano molti più collegamenti del nodo tipico.

Il loro modello ha due ingredienti. **Crescita**: i nodi arrivano uno alla volta. **Aggancio preferenziale**: ogni nuovo arrivato porta m collegamenti e si aggancia a un nodo esistente i con probabilità proporzionale al suo grado k_i. Chi è ricco si arricchisce. Il risultato è una distribuzione dei gradi con γ = 3, la cui CCDF ha pendenza −2. Togli uno dei due ingredienti e la legge di potenza scompare: con la crescita ma con aggancio uniforme, la coda diventa esponenziale.

Il meccanismo è più antico del nome: Udny Yule lo usò nel 1925 per le dimensioni dei generi biologici, Herbert Simon lo generalizzò nel 1955, Derek de Solla Price lo chiamò "vantaggio cumulativo" (*cumulative advantage*) per le citazioni nel 1976, e Robert Merton ne aveva battezzato una versione "effetto San Matteo" nel 1968.

## Le conseguenze degli hub

Gli hub cambiano il comportamento di una rete. I cammini diventano brevissimi, perché quasi ogni nodo è vicino a un hub. Albert, Hawoong Jeong e Barabási mostrarono nel 2000 che le reti a invarianza di scala sono **robuste ai guasti casuali**, perché un nodo scelto a caso è quasi sempre secondario, ma **fragili agli attacchi mirati**: rimuovi i pochi hub più grandi e la rete va in pezzi. E tutto ciò che si diffonde, dalle voci ai virus, si diffonde in fretta, perché gli hub lo raccolgono presto e lo ritrasmettono ovunque.

Abbiamo quindi due spiegazioni del piccolo mondo del Modulo 03: gruppi locali più legami deboli, oppure hub. La scienza sceglie tra di esse non chiedendosi quale storia suoni meglio, ma ricavando previsioni che differiscono. Le reti di Watts e Strogatz hanno una distribuzione dei gradi stretta e nessun hub; le reti a invarianza di scala hanno hub e una risposta molto diversa agli attacchi. È la misura a decidere quale meccanismo prevale in una data rete.

## Un sano scetticismo

All'entusiasmo seguì una verifica. Nel 2019 Anna Broido e Aaron Clauset applicarono test statistici rigorosi a quasi mille reti reali e trovarono prove forti di una distribuzione dei gradi a legge di potenza in senso stretto solo in una piccola minoranza. Molte sono descritte meglio da una coda pesante con un taglio, o da una lognormale. L'idea di coda pesante resta centrale; l'esponente esatto, e perfino l'etichetta "a invarianza di scala", vanno guadagnati con i dati.

## Un collegamento con Bitcoin

Bitcoin incontra queste idee due volte. La prima è una scelta di progetto. Gli hub offrono a un attaccante bersagli ovvi, quindi la rete dei peer di Bitcoin li evita di proposito: Bitcoin Core limita il numero di connessioni che un nodo mantiene (125 per impostazione predefinita) e sceglie i peer in uscita a caso tra gli indirizzi che conosce. Nessun nodo raccoglie una quota di collegamenti la cui perdita, o cattura, spezzerebbe la rete.

La seconda è la ricerca. Il prezzo di Bitcoin, in funzione del tempo trascorso dal blocco genesi, segue una legge di potenza con esponente β = 5,69 ± 0,05 (R² = 0,961 su 5.696 osservazioni giornaliere). Si tratta di una relazione a legge di potenza tra due grandezze e non di una distribuzione, ma vale la stessa disciplina: una retta su assi log–log è il punto in cui l'argomento comincia, non quello in cui finisce. Il preprint dell'Istituto fa il passo successivo e ricava la legge in modo meccanicistico, dalla dinamica di adozione della rete e da una legge di Metcalfe generalizzata per il valore della rete. Leggilo sulla nostra [pagina delle Pubblicazioni](/research/publications#preprint).

<!-- simulation -->

## Che cosa osservare

1. Fai crescere una rete con aggancio preferenziale (n = 400, m = 2), poi passa all'aggancio uniforme con lo stesso seme. Che cosa succede all'hub più grande, e alla quota di estremi dei collegamenti detenuta dall'1% più connesso?
2. Premi Avvia e osserva gli hub arancioni mentre la rete cresce. Gli hub più grandi sono i nodi più vecchi o i più nuovi? Perché?
3. Confronta le due CCDF dei gradi nel pannello A. Su quante decadi si estende ciascuna, e quale piega bruscamente verso il basso? Ora alza k_min: come si muove γ̂, e che cosa ti dice sulla scelta di k_min?
4. Nel pannello B, estrai 100 e poi 100.000 valori da una Pareto con α = 1,5: la media del campione si stabilizza? Ripeti con α = 3, poi con la gaussiana.
5. Scegli la lognormale e guarda la sua CCDF. Su quale intervallo potresti scambiarla per una retta?
6. Nell'esperimento di robustezza, quale rete resiste meglio ai guasti casuali, e quale crolla per prima sotto un attacco mirato? A quale frazione f, più o meno, la rete BA va in pezzi quando i suoi hub vengono colpiti?

## Letture consigliate

- V. Pareto, *Cours d'économie politique* (Losanna, 1896–1897).
- G. K. Zipf, *Human Behavior and the Principle of Least Effort* (Addison-Wesley, 1949).
- H. A. Simon, "On a class of skew distribution functions", *Biometrika* 42 (1955) 425–440.
- D. de S. Price, "A general theory of bibliometric and other cumulative advantage processes", *Journal of the American Society for Information Science* 27 (1976) 292–306.
- A.-L. Barabási e R. Albert, "Emergence of scaling in random networks", *Science* 286 (1999) 509–512.
- R. Albert, H. Jeong e A.-L. Barabási, "Error and attack tolerance of complex networks", *Nature* 406 (2000) 378–382.
- M. E. J. Newman, "Power laws, Pareto distributions and Zipf's law", *Contemporary Physics* 46 (2005) 323–351.
- A. Clauset, C. R. Shalizi e M. E. J. Newman, "Power-law distributions in empirical data", *SIAM Review* 51 (2009) 661–703.
- A. D. Broido e A. Clauset, "Scale-free networks are rare", *Nature Communications* 10 (2019) 1017.
- Scientific Bitcoin Institute, preprint sulla legge di potenza di Bitcoin, sulla nostra [pagina delle Pubblicazioni](/research/publications#preprint).
