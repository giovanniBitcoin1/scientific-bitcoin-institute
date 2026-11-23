<!-- DRAFT: to be reviewed by Adriano -->

## Due verdetti

Una rete con gli hub è robusta o fragile? Tutte e due le cose, e la risposta dipende da chi lo chiede. Albert, Jeong e Barabási (2000) presero due reti modello di 10.000 nodi e 20.000 collegamenti, una casuale e una cresciuta per aggancio preferenziale, e tolsero i nodi in due modi: a caso, come si guastano i componenti, e dal più connesso, come farebbe un attaccante. Nella rete a coda pesante il 5% di guasti casuali lasciava invariata la distanza media tra i nodi rimasti; lo stesso 5% tolto dalla cima la raddoppiava. Andando avanti, la rete casuale andava in pezzi a circa il 28% di nodi rimossi, quasi allo stesso modo per guasti e attacco. Quella a coda pesante cedeva a circa il 18% sotto attacco, e le mappe di Internet (6.209 sistemi autonomi) e di un campione del Web (325.729 pagine) a circa il 3% e il 7%.

```figure
fail
```

La stessa coda che protegge dagli incidenti espone la rete a chi agisce di proposito. Il resto del modulo chiede quanto, se si può rimediare, e che cosa cambia quando un guasto sposta il carico su altri nodi o su un'altra rete.

## Il guasto casuale è percolazione

Togli a caso una frazione f dei nodi. Un nodo che sopravvive conserva ciascun collegamento con probabilità 1 − f, quindi il criterio del [modulo 05](/network-lab/heavy-tails-done-right) per la componente gigante vale con un fattore in più: essa sopravvive finché (1 − f)(⟨k²⟩/⟨k⟩ − 1) > 1. La **frazione critica** è

```math
f_c = 1 − 1 / (⟨k²⟩/⟨k⟩ − 1)
```

(Cohen, Erez, ben-Avraham e Havlin 2000; Callaway, Newman, Strogatz e Watts 2000). Per una rete casuale ⟨k²⟩/⟨k⟩ = ⟨k⟩ + 1 e f_c = 1 − 1/⟨k⟩: con quattro collegamenti per nodo devono sparire tre quarti dei nodi (esercizio 1). Con una coda a legge di potenza di esponente γ < 3 il secondo momento cresce senza limite al crescere della rete, e f_c tende a 1: bisogna togliere quasi tutti i nodi prima che la componente gigante scompaia. Cohen e colleghi stimarono che dovrebbe guastarsi più del 99% dei nodi di Internet.

In una rete finita il cutoff naturale del modulo 05 tiene ⟨k²⟩ finito e f_c sotto 1. Nella prima simulazione la formula dà 0,905 per 1.000 nodi cresciuti per aggancio preferenziale e 0,932 per 10.000, contro 0,75 per una rete casuale con gli stessi collegamenti. Prima della soglia la componente gigante si riduce con regolarità in entrambe; f_c dice quando è finita, non quanto ne resta lungo la strada.

## L'attacco

Ora togli prima gli hub. Ogni rimozione porta via molti collegamenti, e ciò che resta è una rete con la coda tagliata e i collegamenti diradati: Cohen, Erez, ben-Avraham e Havlin (2001) mostrarono che una rete a coda pesante si rompe allora dopo una frazione modesta, qualche punto percentuale nelle loro figure. Nella prima simulazione, con 10.000 nodi e in media quattro collegamenti per nodo, togliere a caso metà dei nodi lascia una componente più grande di 0,399 dei nodi nella rete casuale e di 0,389 con l'aggancio preferenziale. Toglierne un quinto, dal grado più alto, lascia 0,687 nella rete casuale e 0,006 con l'aggancio preferenziale.

Un attaccante può fare meglio di una lista compilata in anticipo. Holme, Kim, Yoon e Han (2002) confrontarono la rimozione per grado e per betweenness, calcolati una volta sulla rete intatta oppure di nuovo dopo ogni rimozione, e trovarono le versioni ricalcolate spesso più dannose: tolto un hub, cambia chi è l'hub successivo. E i gradi non sono tutto. Il [modulo 08](/network-lab/who-connects-to-whom) ha mostrato che una stessa sequenza di gradi, cablata in modi diversi, resiste all'attacco in modo molto diverso.

## Si può rendere robusta una rete?

Schneider, Moreira, Andrade, Havlin e Herrmann (2011) fecero di quell'osservazione un metodo di progetto. Il punto in cui la rete crolla dice poco del danno lungo la strada, quindi misurarono l'intera curva:

```math
R = (1/N) Σ_{Q=1..N} s(Q)
```

dove s(Q) è la quota di nodi nella componente più grande dopo Q rimozioni, con i gradi ricalcolati man mano che l'attacco procede. R va da 1/N per una stella a 0,5 per una rete completa (esercizio 3). Poi scambiarono coppie di collegamenti, cosa che conserva ogni grado, tenendo uno scambio solo quando R saliva. Per la rete elettrica europea e per una mappa di Internet riportano guadagni del 45% e del 55% cambiando circa il 5% dei collegamenti. Le reti che ne escono hanno una forma riconoscibile, che chiamarono **a cipolla**: gli hub uniti tra loro in un nucleo, circondato da strati di nodi di grado decrescente, ogni strato collegato al proprio interno. Tolto il nucleo, gli strati tengono ancora.

La prima simulazione lo ripete. Sulla rete iniziale 20.000 scambi tentati portano R da 0,097 a 0,221, e il ρ di Spearman del modulo 08 da −0,32 a 0,31. Il guadagno ha un prezzo: sotto rimozione casuale R scende da 0,416 a 0,386.

## Cascate di sovraccarico

Finora un nodo rimosso portava con sé solo i propri collegamenti. In una rete che trasporta qualcosa ([modulo 10](/network-lab/weights-flows-navigation)), ciò che trasportava deve passare altrove. Motter e Lai (2002) ne diedero il modello più semplice. Il **carico** di un nodo è il numero di cammini minimi che lo attraversano. La sua capacità è il carico nella rete intatta moltiplicato per 1 + α, dove la **tolleranza** α è il margine di riserva pagato da chi ha costruito la rete. Togli un nodo: i cammini cambiano strada, i carichi cambiano, ogni nodo ora sopra la sua capacità si guasta, e i carichi si ricalcolano, finché nulla è più sovraccarico. In reti a coda pesante di circa 5.000 nodi la rimozione del solo nodo più carico riduceva ancora la componente più grande di oltre il 20% con α = 1, mentre le rimozioni casuali non facevano quasi nulla; una rete in cui ogni nodo aveva lo stesso grado non andava in cascata nemmeno con α = 0,05.

La seconda simulazione mostra lo stesso: con 400 nodi e α = 0,2, togliere il nodo più carico di una rete ad aggancio preferenziale lascia una componente più grande di 0,070 dei nodi; toglierne uno a caso lascia 0,996. In una rete casuale con altrettanti collegamenti il nodo più carico fa cadere molto meno: resta 0,930. I blackout reali hanno questo carattere a domino: il 14 agosto 2003 la perdita di poche linee in Ohio si estese, quello stesso pomeriggio, a un'area con circa 50 milioni di persone tra Stati Uniti e Canada (U.S.–Canada Power System Outage Task Force 2004).

## Reti che dipendono da reti

Le centrali elettriche hanno bisogno dei computer che le controllano, e i computer della corrente. Buldyrev, Parshani, Paul, Stanley e Havlin (2010) partirono dal blackout italiano del 28 settembre 2003, in cui lo spegnimento delle centrali fece cadere nodi della rete di comunicazione, che a loro volta fecero cadere altre centrali. Il loro modello ha due reti, A e B, in cui ogni nodo dell'una dipende da un partner nell'altra. Togli alcuni nodi di A. I loro partner in B si fermano; B si spezza, e funziona ancora solo la sua componente più grande; i partner di ciò che B ha perso si fermano in A; e così via, avanti e indietro.

```figure
cascade
```

Ciò che sopravvive è la **componente gigante mutua**: un insieme di nodi connesso in entrambe le reti insieme. Per due reti casuali di grado medio ⟨k⟩, tenendo una frazione p dei nodi, la sua quota x dei nodi risolve

```math
x = p (1 − e^(−⟨k⟩x))²
```

e una soluzione diversa da zero esiste solo per p > 2,4554/⟨k⟩. In quel punto x non parte da zero: salta a 1,2564/⟨k⟩, circa il 31% dei nodi quando ⟨k⟩ = 4 (esercizio 2). A una rete singola basta p > 1/⟨k⟩, e cresce dal nulla. Una sfuma; la coppia funziona, e poi non funziona più. Nella terza simulazione (10.000 nodi, ⟨k⟩ = 4) tenere il 62% dei nodi lascia una componente gigante mutua di 0,365; tenerne il 61% non lascia nulla, dopo 31 passi della cascata. La cascata lunga è il segnale d'allarme: vicino alla soglia ogni passo toglie poco, e il crollo impiega molti passi ad arrivare.

Qui la prima lezione del modulo si rovescia. Una distribuzione dei gradi più larga, che protegge una rete singola dai guasti casuali, rende più fragile una coppia accoppiata: un hub in una rete può dipendere da un nodo con un solo collegamento nell'altra. Due reti a legge di potenza nella terza simulazione, di grado medio 4,40, richiedono p = 0,68, dove a due reti casuali con quel grado medio basterebbe 0,558.

```box
Le reti di Bitcoin sotto attacco
La rete peer-to-peer che trasporta le transazioni e i blocchi di Bitcoin è costruita pensando agli attacchi di questo modulo. Un nodo non accetta i vicini che gli vengono dati: per impostazione predefinita Bitcoin Core apre 8 connessioni in uscita full-relay e 2 block-relay-only ([modulo 01](/network-lab/reading-a-network)) verso indirizzi che sceglie dalle proprie tabelle. Un nodo le cui connessioni portassero tutte a un solo attaccante vedrebbe soltanto ciò che l'attaccante gli mostra: un'**eclissi** (*eclipse attack*). Heilman, Kendler, Zohar e Goldberg (2015) mostrarono come riempire quelle tabelle con gli indirizzi dell'attaccante; Bitcoin Core adottò tre delle loro contromisure nella versione 0.10.1, e in seguito le connessioni *feeler* (0.13.1) e il *test-before-evict* (0.17.0). Apostolaki, Zohar e Vanbever (2017) studiarono gli attacchi dal basso, al livello dell'instradamento di Internet: nel novembre 2015, 13 sistemi autonomi ospitavano il 30% dei nodi. Su un'istantanea di Lightning del 1 febbraio 2019, Rohrer, Malliaris e Tschorsch (2019) trovarono che togliere i nodi meglio connessi riduceva nettamente la quota di pagamenti che trovavano un percorso, mentre i guasti casuali staccavano poco. L'esercizio 4 fa i conti di un'eclissi.
```

## Prossimo modulo

Un guasto che si propaga è una forma di contagio. Il [modulo 12](/network-lab/epidemics-on-networks) affronta il contagio vero e proprio: le epidemie sulle reti, e perché gli hub cancellano la soglia.

<!-- simulation -->

## Letture consigliate

- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Cap. 8.
- Newman, M. E. J. (2018). *Networks*, 2ª ed. Oxford University Press. Cap. 15.
- Latora, V., Nicosia, V. e Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press.
- Albert, R., Jeong, H. e Barabási, A.-L. (2000). Error and attack tolerance of complex networks. *Nature* 406, 378–382.
- Callaway, D. S., Newman, M. E. J., Strogatz, S. H. e Watts, D. J. (2000). Network robustness and fragility: percolation on random graphs. *Physical Review Letters* 85, 5468–5471.
- Cohen, R., Erez, K., ben-Avraham, D. e Havlin, S. (2000). Resilience of the Internet to random breakdowns. *Physical Review Letters* 85, 4626–4628.
- Cohen, R., Erez, K., ben-Avraham, D. e Havlin, S. (2001). Breakdown of the Internet under intentional attack. *Physical Review Letters* 86, 3682–3685.
- Holme, P., Kim, B. J., Yoon, C. N. e Han, S. K. (2002). Attack vulnerability of complex networks. *Physical Review E* 65, 056109.
- Schneider, C. M., Moreira, A. A., Andrade, J. S., Havlin, S. e Herrmann, H. J. (2011). Mitigation of malicious attacks on networks. *PNAS* 108, 3838–3841.
- Motter, A. E. e Lai, Y.-C. (2002). Cascade-based attacks on complex networks. *Physical Review E* 66, 065102.
- U.S.–Canada Power System Outage Task Force (2004). *Final Report on the August 14, 2003 Blackout in the United States and Canada: Causes and Recommendations*.
- Buldyrev, S. V., Parshani, R., Paul, G., Stanley, H. E. e Havlin, S. (2010). Catastrophic cascade of failures in interdependent networks. *Nature* 464, 1025–1028.
- Heilman, E., Kendler, A., Zohar, A. e Goldberg, S. (2015). Eclipse attacks on Bitcoin's peer-to-peer network. *24th USENIX Security Symposium*, 129–144.
- Apostolaki, M., Zohar, A. e Vanbever, L. (2017). Hijacking Bitcoin: routing attacks on cryptocurrencies. *IEEE Symposium on Security and Privacy*, 375–392.
- Rohrer, E., Malliaris, J. e Tschorsch, F. (2019). Discharged payment channels: quantifying the Lightning Network's resilience to topology-based attacks. *IEEE European Symposium on Security and Privacy Workshops*, 347–356.
