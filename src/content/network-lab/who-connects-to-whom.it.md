<!-- DRAFT: to be reviewed by Adriano -->

## Stessi gradi, cablaggio diverso

Una sequenza di gradi dice quanti collegamenti ha ogni nodo, non dove vanno. Prendi trenta nodi con gradi dati: gli hub possono essere collegati tra loro, lasciando i nodi piccoli ad accoppiarsi fra loro, oppure ogni hub può stare al centro di un suo gruppo di nodi piccoli. Le due reti qui sotto hanno esattamente gli stessi gradi.

```figure
wirings
```

Maslov e Sneppen (2002) si sono chiesti a quale delle due immagini somiglino le reti reali. Hanno preso reti di interazione tra proteine e di regolazione genica e le hanno confrontate con versioni ricablate con gli scambi del [modulo 02](/network-lab/what-are-we-measuring), che conservano ogni grado. Nelle reti reali i collegamenti tra proteine molto connesse erano sistematicamente più rari che in quelle ricablate, e i collegamenti tra hub e proteine poco connesse più frequenti. Newman (2002) ha misurato molte reti e ha trovato uno schema: le reti sociali tendono a essere **assortative**, hub legati a hub, mentre quelle tecnologiche e biologiche tendono a essere **disassortative**. Il suo coefficiente r, definito più sotto, valeva 0,363 per le coautorie in fisica, 0,208 per gli attori del cinema e 0,276 per i consiglieri d'amministrazione, ma −0,189 per Internet, −0,156 per le interazioni tra proteine e −0,276 per una rete alimentare d'acqua dolce.

## Come misurarlo

L'immagine più diretta è il **grado medio dei vicini** di un nodo, k_nn(k), mediato sui nodi di grado k. Senza correlazioni l'estremo di un collegamento cade su un nodo in proporzione al suo grado, qualunque sia il grado all'altro estremo, e

```math
k_nn(k) = ⟨k²⟩ / ⟨k⟩
```

per ogni k. Un k_nn(k) che sale è assortativo, uno che scende disassortativo. Per Internet al livello dei sistemi autonomi, Pastor-Satorras, Vázquez e Vespignani (2001) hanno trovato k_nn ∼ k^(−ν) con ν ≃ 0,5.

Newman ha condensato la curva in un numero: r, la correlazione di Pearson tra i gradi ai due estremi di un collegamento, contando ogni collegamento nei due versi. Va da −1 a 1; una stella dà −1 (esercizio 1). Il suo punto debole è la coda pesante. Una correlazione di Pearson è dominata dai valori più grandi, e quando il momento terzo della distribuzione dei gradi diverge, cosa che per p_k ∝ k^(−γ) accade con γ < 4, r viene spinto verso 0 man mano che la rete cresce. Litvak e van der Hofstad (2013) hanno dato un argomento analitico per cui il valore più negativo che r può assumere su una data sequenza di gradi va allora a 0 con la dimensione della rete, così che nel limite r non può essere negativo, per quanto disassortativo sia il cablaggio. In due esplorazioni del Web britannico r era −0,65 con 100.000 pagine e −0,08 con un milione, mentre una correlazione di rango, il ρ di Spearman, era −0,57 e −0,56. Hanno proposto ρ: la stessa formula di Pearson applicata ai ranghi dei gradi invece che ai gradi.

La rete che cresce del [modulo 06](/network-lab/growth-mechanisms) mostra il problema. Nella prima simulazione l'aggancio preferenziale con m = 2 dà un r medio di −0,095, −0,048 e −0,023 a 1.000, 10.000 e 100.000 nodi, mentre ρ resta a −0,31, −0,30 e −0,31. La rete è disassortativa a ogni dimensione: i vecchi hub raccolgono i collegamenti dei nuovi arrivati, che arrivano con grado m. r lo nasconde.

## Gli hub restano senza hub

In una rete semplice due nodi di gradi k e k′ possono condividere al più un collegamento. Senza correlazioni ne condividerebbero in media k k′/(⟨k⟩N), e quel numero supera 1 quando entrambi i gradi superano

```math
k_s ≈ (⟨k⟩ N)^(1/2)
```

il **cutoff strutturale** (Boguñá, Pastor-Satorras e Vespignani 2004). Sopra k_s gli hub non hanno abbastanza altri hub a cui collegarsi, e parte dei loro collegamenti deve andare a nodi più piccoli. Il cutoff naturale del [modulo 05](/network-lab/heavy-tails-done-right) cresce come N^(1/(γ−1)), più in fretta di k_s esattamente quando γ < 3 (esercizio 2). Così un modello di configurazione con γ < 3 che vieta i collegamenti ripetuti diventa disassortativo da solo. Nella prima simulazione, con γ = 2,2 e 10.000 nodi, k_s è 257 e il grado massimo 2.220; r è −0,096 e ρ −0,126. Con γ = 3 il grado massimo, 171, resta sotto k_s e r è −0,010.

Un r negativo, quindi, da solo dice poco. Significa qualcosa solo se confrontato con un modello nullo che conserva i gradi e vieta i collegamenti ripetuti, come nel modulo 02.

## Un rich club?

I nodi meglio collegati formano un club? Il coefficiente di **rich club** φ(k) è la densità dei collegamenti tra i nodi di grado maggiore di k: i collegamenti tra loro divisi per le coppie. Cresce con k anche nelle reti casuali, semplicemente perché i nodi con molti collegamenti hanno più occasioni di incontrarsi. Zhou e Mondragón (2004) hanno visto φ crescere in Internet e hanno parlato di rich club. Colizza, Flammini, Serrano e Vespignani (2006) hanno diviso φ per la sua media in randomizzazioni che conservano i gradi. Con quel rapporto le collaborazioni scientifiche mostravano un rich club forte e il trasporto aereo uno lieve, mentre Internet, contro quanto affermato prima, e la rete di interazione tra proteine non ne mostravano alcuno: i loro hub si collegano tra loro meno di quanto farebbe il caso. Nella prima simulazione la rete che cresce del modulo 06 dà un rapporto di 0,73, 0,63, 0,64 e 0,72 per k = 5, 10, 20 e 40: nessun club.

## Il cablaggio cambia il comportamento

Xulvi-Brunet e Sokolov (2004) hanno dato un modo di cambiare le correlazioni conservando ogni grado. Si prendono due collegamenti a caso; con probabilità p si ordinano i loro quattro estremi per grado e si uniscono i due più grandi e i due più piccoli, altrimenti si riaccoppiano a caso. Unire il più grande con il più piccolo rende invece la rete disassortativa. Applicata fino in fondo alla rete che cresce di 10.000 nodi, la ricablatura arriva a ρ = 0,963 in un verso e −0,957 nell'altro, mentre r arriva solo a 0,355 e −0,166.

Newman (2002, 2003) ha trovato che le reti assortative percolano più facilmente, con una componente gigante che compare a una densità di collegamenti più bassa, e sono più robuste alla rimozione dei nodi di grado più alto: gli hub si sostengono a vicenda. Le reti disassortative distribuiscono gli hub, e ognuno tiene insieme un suo pezzo. Nella seconda simulazione, con 10.000 nodi, togliere il 10% dei gradi più alti lascia nella componente più grande il 90% dei nodi nel cablaggio assortativo, il 65% in quello neutro e il 35% in quello disassortativo. Con la rimozione a caso l'ordine si inverte per gran parte del percorso: tolto un quinto dei nodi, la gigante assortativa ne tiene il 56%, contro il 77% e il 78%, perché i suoi hub sono stretti in un unico nucleo e i suoi nodi piccoli formano catene fragili. Il [modulo 11](/network-lab/robustness-and-cascades) torna sulla robustezza.

## Il simile si lega al simile

Il grado è un tratto; le persone ne hanno molti altri. L'**omofilia**, la tendenza delle persone simili a essere collegate, vale per etnia, età, religione, istruzione, professione e genere, e McPherson, Smith-Lovin e Cook (2001) l'hanno trovata notevolmente robusta tra tipi diversi di relazione, dal matrimonio all'amicizia al lavoro. Per un tratto a categorie, la **matrice di mescolamento** e_ij dà la quota di estremi dei collegamenti che uniscono un nodo della categoria i a uno della categoria j, e Newman (2003) ha definito

```math
r = (Σ_i e_ii − Σ_i a_i²) / (1 − Σ_i a_i²)
```

con a_i = Σ_j e_ij: 1 quando ogni collegamento resta nella sua categoria, 0 quando i collegamenti cadono come vorrebbe il caso, negativo quando preferiscono attraversare. La terza simulazione fa crescere una rete con due gruppi, dove ogni collegamento resta nel suo gruppo con probabilità h. Con una minoranza di circa un quinto e h = 0,8, i collegamenti della minoranza restano dentro solo nel 59,6% dei casi, contro l'86,2% della maggioranza: i nuovi arrivati della maggioranza continuano a mandare dall'altra parte un quinto dei loro collegamenti.

L'omofilia ha due origini che un'istantanea non sa separare: le persone scelgono persone simili a sé, e le persone diventano simili a quelle che conoscono. Shalizi e Thomas (2011) hanno mostrato che nei dati osservativi le due, insieme all'effetto di tratti che nessuno ha misurato, sono genericamente confuse: separarle richiede ipotesi forti. Aral, Muchnik e Sundararajan (2009) hanno seguito l'adozione di un servizio per cellulari in una rete di messaggistica istantanea di 27,4 milioni di utenti e hanno stimato che l'omofilia spiegava più di metà di ciò che sembrava contagio, e che i metodi abituali sovrastimavano l'influenza dal 300% al 700%. Il [modulo 09 del Complexity Lab](/lab/agent-based-models) mostra, con il modello di Schelling, come una preferenza lieve possa produrre un insieme fortemente diviso.

## L'illusione della maggioranza

Ciò che vedi dipende da chi conosci. Se gli hub condividono un tratto raro nel complesso, molti nodi possono trovarlo nella maggior parte dei loro vicini. Lerman, Yan e Wu (2016) l'hanno chiamata **illusione della maggioranza**: in reti a coda pesante con il 5% dei nodi attivi, hanno trovato che dal 60% all'80% dei nodi poteva vedere intorno a sé una maggioranza attiva. L'illusione richiede gradi eterogenei e nodi attivi tra gli hub, ed è più forte nelle reti disassortative, dove ogni hub serve molti nodi piccoli. È il paradosso dell'amicizia del [modulo 02](/network-lab/what-are-we-measuring), applicato alle opinioni.

```figure
illusion
```

Nella terza simulazione, colorare il 10% dei gradi più alti nella rete che cresce mostra una maggioranza colorata al 26,2% dei nodi; ricablata verso disassortativa con gli stessi gradi, al 66,1%.

## Prossimo modulo

Assortatività e omofilia sono mescolamento per tratto. Il [modulo 09](/network-lab/communities) cerca il mescolamento per gruppi quando nessun tratto è dato: le comunità.

<!-- simulation -->

## Letture consigliate

- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Cap. 7.
- Newman, M. E. J. (2018). *Networks*, 2ª ed. Oxford University Press. Capp. 7 e 10.
- Latora, V., Nicosia, V. e Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Cap. 7.
- Easley, D. e Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Cap. 4.
- Maslov, S. e Sneppen, K. (2002). Specificity and stability in topology of protein networks. *Science* 296, 910–913.
- Newman, M. E. J. (2002). Assortative mixing in networks. *Physical Review Letters* 89, 208701.
- Newman, M. E. J. (2003). Mixing patterns in networks. *Physical Review E* 67, 026126.
- Pastor-Satorras, R., Vázquez, A. e Vespignani, A. (2001). Dynamical and correlation properties of the Internet. *Physical Review Letters* 87, 258701.
- Boguñá, M., Pastor-Satorras, R. e Vespignani, A. (2004). Cut-offs and finite size effects in scale-free networks. *European Physical Journal B* 38, 205–209.
- Litvak, N. e van der Hofstad, R. (2013). Uncovering disassortativity in large scale-free networks. *Physical Review E* 87, 022801.
- Xulvi-Brunet, R. e Sokolov, I. M. (2004). Reshuffling scale-free networks: from random to assortative. *Physical Review E* 70, 066102.
- Zhou, S. e Mondragón, R. J. (2004). The rich-club phenomenon in the Internet topology. *IEEE Communications Letters* 8, 180–182.
- Colizza, V., Flammini, A., Serrano, M. A. e Vespignani, A. (2006). Detecting rich-club ordering in complex networks. *Nature Physics* 2, 110–115.
- McPherson, M., Smith-Lovin, L. e Cook, J. M. (2001). Birds of a feather: homophily in social networks. *Annual Review of Sociology* 27, 415–444.
- Shalizi, C. R. e Thomas, A. C. (2011). Homophily and contagion are generically confounded in observational social network studies. *Sociological Methods and Research* 40, 211–239.
- Aral, S., Muchnik, L. e Sundararajan, A. (2009). Distinguishing influence-based contagion from homophily-driven diffusion in dynamic networks. *PNAS* 106, 21544–21549.
- Lerman, K., Yan, X. e Wu, X.-Z. (2016). The "majority illusion" in social networks. *PLoS ONE* 11, e0147617.
