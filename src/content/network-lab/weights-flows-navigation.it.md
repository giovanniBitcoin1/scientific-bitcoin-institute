<!-- DRAFT: to be reviewed by Adriano -->

## Collegamenti che portano qualcosa

Finora un collegamento c'era o non c'era. I collegamenti reali portano quantità diverse: passeggeri tra due aeroporti, telefonate tra due persone, articoli che due scienziati hanno scritto insieme, fondi in un canale di pagamento. E ciò che vi si muove ha bisogno di percorsi, incontra limiti, e spesso deve trovare la strada conoscendo solo ciò che ha vicino. Questo modulo affronta le tre cose una dopo l'altra: pesi, flussi, navigazione.

## I pesi

Diamo a ogni collegamento un **peso** `w_ij`. La **forza** di un nodo è il peso totale dei suoi collegamenti:

```math
s_i = Σ_j w_ij
```

Se i pesi non avessero nulla a che fare con la struttura, la forza sarebbe semplicemente proporzionale al grado. Barrat, Barthélemy, Pastor-Satorras e Vespignani (2004) trovarono che nella rete mondiale degli aeroporti cresce più in fretta, `s ∝ k^β` con β = 1,5 ± 0,1: i grandi aeroporti hanno più rotte, e anche rotte più trafficate. In una rete di collaborazioni scientifiche trovarono invece la forza proporzionale al grado. Nella prima simulazione, pesi che seguono i gradi dei due estremi danno β = 1,45, e rimescolare gli stessi pesi sui collegamenti lo riporta a 1,01.

La forza dice quanto, non come è distribuito. Lo dice la **disparità** di un nodo:

```math
Y_i = Σ_j (w_ij / s_i)²
```

Con il peso ripartito in modo uniforme su k collegamenti, Y = 1/k; quando un solo collegamento ne porta quasi tutto, Y è vicino a 1 (esercizio 1).

```figure
strength
```

## La dorsale

Spesso la maggior parte del peso sta su pochi collegamenti, e un disegno di tutto non mostra nulla. Tenere solo i collegamenti sopra un peso fissato non aiuta: cancella tutti i nodi piccoli, i cui collegamenti sono tutti leggeri sulla scala dell'intera rete. Il **filtro di disparità** di Serrano, Boguñá e Vespignani (2009) pone invece una domanda locale: questo collegamento è una quota della forza del suo nodo più grande di quella che darebbe il caso? Si tagli a caso in k pezzi la forza di un nodo con k collegamenti: un dato pezzo è almeno una quota p del totale con probabilità

```math
α_ij = (1 − p_ij)^(k − 1),   p_ij = w_ij / s_i
```

Un collegamento viene tenuto quando α_ij è sotto un livello scelto per almeno uno dei suoi due estremi. Ciò che resta è la **dorsale** (*backbone*). Sui voli tra aeroporti degli Stati Uniti, al livello 0,05, il filtro tenne il 17% dei collegamenti, il 66% degli aeroporti e più dell'80% dei passeggeri.

## Cammini minimi con i pesi

Nel [modulo 01](/network-lab/reading-a-network) il cammino minimo era quello con meno collegamenti. Quando il peso di un collegamento è un costo (una distanza, un tempo, una commissione), il percorso migliore è quello con la somma più piccola, e può avere più collegamenti (esercizio 2). Dijkstra (1959) mostrò come trovarlo: si sistemano i nodi in ordine di costo dalla sorgente, prendendo ogni volta il meno costoso non ancora sistemato. Nessuna scoperta successiva può migliorarlo, perché i costi non sono mai negativi.

Quando il peso è un'intensità, come il traffico o la fiducia, va prima trasformato in un costo. 1/w è una scelta comune ma non l'unica, e la scelta cambia la risposta. La betweenness, che nel [modulo 03](/network-lab/centrality) contava i cammini minimi, cambia con essa. Nella prima simulazione, con i pesi iniziali, il percorso meno costoso è più lungo del più corto nel 68% delle coppie, e le classifiche dei nodi per betweenness con e senza pesi hanno una correlazione di Spearman di 0,66. Chi è centrale dipende da che cosa portano i collegamenti.

## Quanto può passare

Ora ogni collegamento abbia una **capacità**, il massimo che può portare, e chiediamoci quanto può andare da una sorgente s a un pozzo t. Un solo percorso porta al più quanto il suo collegamento più stretto. Più percorsi insieme portano di più, e il limite è fissato da un **taglio**: un insieme di collegamenti la cui rimozione separa s da t. Tutto deve attraversare il taglio, quindi nessun flusso supera la capacità di alcun taglio. Ford e Fulkerson (1956), e nello stesso anno Elias, Feinstein e Shannon, dimostrarono che il limite viene raggiunto: il **flusso massimo** è uguale alla capacità del **taglio minimo** (esercizio 3).

```figure
flow
```

I metodi che calcolano il flusso massimo lo spingono lungo un percorso dopo l'altro, e lasciano che un percorso successivo disfi in parte uno precedente. Dove cade il taglio minimo si vede dov'è la strozzatura; i collegamenti tra i gruppi del [modulo 09](/network-lab/communities) sono candidati naturali.

```box
Lightning: una rete di canali
La Lightning Network di Bitcoin ([modulo 01](/network-lab/reading-a-network)) è una rete di canali di pagamento. La capacità di un canale è pubblica; la sua divisione tra i due estremi è privata e cambia a ogni pagamento. Un pagamento ha bisogno di un percorso su cui ogni canale possa inoltrare l'importo nella direzione giusta: un problema di flusso in condizioni di incertezza, in cui il mittente scopre i saldi provando. Il teorema del flusso massimo e del taglio minimo mostra che più percorsi insieme possono portare molto più di uno solo, ed è ciò che sfruttano i pagamenti in più parti (*multi-part payments*); ma dividere alla cieca fa guadagnare poco, perché i percorsi in più sono più stretti e i saldi restano ignoti. Il guadagno viene da ciò che il mittente sa o impara. Pickhardt e Richter (2021) trattano ogni saldo come incerto e cercano il flusso con la maggiore probabilità di riuscire; Core Lightning ha distribuito per la prima volta un plugin sperimentale costruito sul loro metodo nella versione 23.08 (agosto 2023). Gli studi del grafo pubblico hanno trovato gradi a coda pesante (Seres et al. 2020, un'istantanea di gennaio 2019) e fondi concentrati in pochi nodi: tra gennaio 2018 e luglio 2019, in media, il 10% dei nodi deteneva l'80% dei bitcoin (Lin et al. 2020). Nella seconda simulazione, una rete sintetica, non dati di Lightning, un solo percorso scelto alla cieca fallisce una volta su due al 7% del saldo del mittente, e dividere alla cieca aggiunge al massimo 1,4 punti percentuali di successo; con tutti i saldi noti, metà dei pagamenti riesce ancora al 71%. Vedi anche il [modulo 13 del Complexity Lab](/lab/bitcoin-complex-system).
```

## Trovare la strada

Travers e Milgram (1969) chiesero a 296 persone in Nebraska e a Boston di far arrivare una cartella a un agente di borsa di Boston, passandola solo a qualcuno che conoscevano di persona. 217 la inoltrarono e 64 cartelle arrivarono, attraverso 5,2 intermediari in media. Dodds, Muhamad e Watts (2003) ripeterono l'esperimento per e-mail con 18 bersagli in 13 paesi: di 24.163 catene ne arrivarono solo 384, e gli autori stimarono una lunghezza tipica da cinque a sette passi una volta tenuto conto delle catene abbandonate. Che i cammini brevi esistano non è più una notizia. La sorpresa è che le persone li trovino, conoscendo ciascuna solo i propri contatti.

Kleinberg (2000) mostrò che i cammini brevi non bastano. Si mettano i nodi su un reticolo quadrato, ciascuno collegato ai suoi vicini, e si dia a ogni nodo un contatto a lungo raggio, a distanza r sul reticolo con probabilità ∝ r^(−α). Un messaggio viene passato in modo **greedy**: chi lo ha lo consegna al contatto più vicino al bersaglio. Solo con α = 2, la dimensione del reticolo, arriva in un numero di passi che cresce come (log N)². Per ogni altro α, nessuna regola che usi solo conoscenza locale può evitare un numero di passi che cresce come una potenza della dimensione. Con α = 0 i collegamenti lunghi sono le scorciatoie casuali del modello small-world ([modulo 03 del Complexity Lab](/lab/small-worlds)): accorciano i cammini, ma non danno alcun senso della direzione. Con un α grande sono troppo corti per servire. Cammini brevi e cammini che si possono trovare sono cose diverse.

## Che cosa mostrano le reti finite

Il teorema riguarda come cresce il numero di passi, e la terza simulazione mostra con quanta lentezza questo si fa sentire. Su un toro di 100 × 100 nodi il numero medio di passi è 21,3 con α = 0 e 22,8 con α = 2, e il più basso, 19,4, è ad α = 1,25. A 400 × 400 il minimo si è spostato ad α = 1,5, e α = 1,5 batte ancora 2 a 800 × 800, una dimensione che esegue solo lo script di controllo: 85,5, 50,9 e 60,1 passi ad α = 0, 1,5 e 2. Ciò che cambia con regolarità è il rapporto tra α = 2 e α = 0: 1,10 a L = 50, 0,95 a L = 200, 0,70 a L = 800. L'ottimo si avvicina a 2 solo man mano che la rete cresce di ordini di grandezza.

Le reti reali non sono reticoli, eppure molte si lasciano navigare. Tra circa 500.000 blogger negli Stati Uniti, Liben-Nowell e colleghi (2005) trovarono che la probabilità di amicizia scende come l'inverso del rango, il numero di persone che vivono più vicino: una forma che mantiene efficiente l'instradamento greedy dove la popolazione non è uniforme. Boguñá, Krioukov e claffy (2009) mostrarono che gradi eterogenei e clustering forte rendono navigabile una rete quando i suoi nodi stanno in uno spazio metrico nascosto.

## Prossimo modulo

Percorsi e flussi danno per scontato che i collegamenti ci siano. Il [modulo 11](/network-lab/robustness-and-cascades) li toglie: guasti, attacchi e cascate.

<!-- simulation -->

## Letture consigliate

- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Cap. 3 (piccoli mondi).
- Newman, M. E. J. (2018). *Networks*, 2ª ed. Oxford University Press. Cap. 6 (reti pesate, insiemi di taglio) e 8 (cammini minimi, flusso massimo).
- Latora, V., Nicosia, V. e Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Cap. 10.
- Easley, D. e Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Cap. 20.
- Barrat, A., Barthélemy, M., Pastor-Satorras, R. e Vespignani, A. (2004). The architecture of complex weighted networks. *PNAS* 101, 3747–3752.
- Serrano, M. Á., Boguñá, M. e Vespignani, A. (2009). Extracting the multiscale backbone of complex weighted networks. *PNAS* 106, 6483–6488.
- Dijkstra, E. W. (1959). A note on two problems in connexion with graphs. *Numerische Mathematik* 1, 269–271.
- Ford, L. R. e Fulkerson, D. R. (1956). Maximal flow through a network. *Canadian Journal of Mathematics* 8, 399–404.
- Elias, P., Feinstein, A. e Shannon, C. E. (1956). A note on the maximum flow through a network. *IRE Transactions on Information Theory* 2, 117–119.
- Travers, J. e Milgram, S. (1969). An experimental study of the small world problem. *Sociometry* 32, 425–443.
- Dodds, P. S., Muhamad, R. e Watts, D. J. (2003). An experimental study of search in global social networks. *Science* 301, 827–829.
- Kleinberg, J. M. (2000). Navigation in a small world. *Nature* 406, 845.
- Kleinberg, J. (2000). The small-world phenomenon: an algorithmic perspective. *Proceedings of the 32nd ACM Symposium on Theory of Computing*, 163–170.
- Boguñá, M., Krioukov, D. e claffy, k. c. (2009). Navigability of complex networks. *Nature Physics* 5, 74–80.
- Liben-Nowell, D., Novak, J., Kumar, R., Raghavan, P. e Tomkins, A. (2005). Geographic routing in social networks. *PNAS* 102, 11623–11628.
- Poon, J. e Dryja, T. (2016). The Bitcoin Lightning Network: scalable off-chain instant payments. White paper, bozza versione 0.5.9.2, 14 gennaio 2016.
- Pickhardt, R. e Richter, S. (2021). Optimally reliable & cheap payment flows on the Lightning Network. arXiv:2107.05322.
- Lin, J.-H., Primicerio, K., Squartini, T., Decker, C. e Tessone, C. J. (2020). Lightning Network: a second path towards centralisation of the Bitcoin economy. *New Journal of Physics* 22, 083022.
- Seres, I. A., Gulyás, L., Nagy, D. A. e Burcsi, P. (2020). Topological analysis of Bitcoin's Lightning Network. In *Mathematical Research for Blockchain Economy*, Springer, 1–12.
