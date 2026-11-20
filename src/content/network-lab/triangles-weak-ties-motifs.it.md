<!-- DRAFT: to be reviewed by Adriano -->

## Come si trova un lavoro

Intorno al 1970 Mark Granovetter intervistò, in un sobborgo di Boston, persone che avevano cambiato lavoro da poco: professionisti, tecnici, dirigenti. Molti avevano saputo del nuovo posto da un conoscente, e a questi chiese quanto spesso vedessero quella persona in quel periodo. Spesso, cioè almeno due volte alla settimana: 16,7%. Ogni tanto: 55,6%. Di rado, cioè una volta all'anno o meno: 27,8% (Granovetter 1973). Cinque su sei avevano avuto la notizia da qualcuno che non vedevano spesso: un vecchio collega, un ex compagno di studi.

Sembra il contrario di ciò che ci si aspetta. Le persone più vicine sono le più disposte ad aiutare. Ma frequentano gli stessi ambienti, leggono gli stessi annunci e sentono le stesse voci: quello che sanno loro, in gran parte lo sai già. Le notizie arrivano da più lontano. Per capire perché «più lontano» e «debole» vadano insieme bisogna guardare che cosa c'è intorno a un collegamento, e la cosa più piccola che può esserci intorno a un collegamento è un triangolo.

## I triangoli si chiudono

Se A conosce B e A conosce C, è più probabile che B e C si incontrino di quanto lo sia per due estranei. Rapoport (1953) inserì questa tendenza in un modello di diffusione dell'informazione, e dietro ci sono tre ragioni semplici. B e C hanno un'occasione: entrambi passano del tempo con A. Hanno un motivo per fidarsi l'uno dell'altro: A garantisce per entrambi. E spesso tutti e tre condividono un contesto, una scuola o un ufficio, che li avrebbe fatti incontrare comunque.

L'effetto si può osservare. Kossinets e Watts (2006) seguirono per un anno la posta elettronica di circa 43.000 studenti e dipendenti di un'università. Due persone che non si erano mai scritte avevano tanta più probabilità di cominciare quanti più corrispondenti avevano in comune.

Si chiama **chiusura triadica**: una tripla aperta, due collegamenti che si incontrano in un nodo, tende a diventare un triangolo. Il coefficiente di clustering e la transitività del modulo 01 sono l'impronta che lascia. Nella prima simulazione metà dei nuovi collegamenti chiude un triangolo, e la transitività arriva a 0,167, cinque volte quella di una rete casuale con gli stessi nodi e collegamenti (0,033).

## Ponti

Ora il contrario di un triangolo. Un **ponte** è un collegamento la cui rimozione divide la rete in due. I veri ponti sono rari, perché in una rete grande c'è quasi sempre un'altra strada. È più utile una nozione più debole: un **ponte locale** è un collegamento i cui due estremi non hanno alcun vicino in comune. Tolto quello, i suoi estremi distano almeno tre passi.

Tra «nessun vicino in comune» e «tutti i vicini in comune» c'è una scala. La **sovrapposizione dei vicinati** di un collegamento è il numero di vicini che i suoi due estremi condividono, diviso per il numero di nodi che sono vicini di almeno uno dei due (esclusi i due estremi):

```math
O_ij = n_ij / (k_i − 1 + k_j − 1 − n_ij)
```

Qui `n_ij` è il numero di vicini in comune e `k_i`, `k_j` sono i due gradi. La sovrapposizione vale 0 su un ponte locale e 1 quando i due estremi hanno esattamente gli stessi amici.

```figure
overlap
```

Nella figura b e c condividono a e d, e tra tutti e due hanno un solo altro vicino, e: sovrapposizione 2/3. Il collegamento f–g ha sovrapposizione 0, e così h–j e i–k, che sono ponti locali senza essere ponti.

L'argomento di Granovetter richiede un'ipotesi. Chiamiamo un legame forte o debole, e supponiamo che due legami forti della stessa persona siano sempre accompagnati da un legame, forte o debole, tra le altre due: se sei molto vicino a due persone, quelle almeno si conoscono. Prendiamo ora un ponte locale A–B, dove A ha un altro legame forte, con C. Se anche A–B fosse forte, B e C dovrebbero conoscersi, e C sarebbe un vicino comune di A e B. Un ponte locale non ne ha. Quindi un ponte locale è un legame debole.

L'ipotesi è troppo rigida per essere vera alla lettera, ma la conclusione regge in una forma più morbida: i collegamenti che portano fuori dalla propria cerchia sono, per lo più, deboli. E i collegamenti che portano fuori sono quelli da cui arrivano le notizie che non hai ancora sentito.

## Una verifica su milioni di persone

Per trent'anni l'argomento si poté verificare solo su campioni piccoli. Onnela e colleghi (2007) ebbero le chiamate di un operatore di telefonia mobile per 18 settimane: circa 4,6 milioni di persone e 7 milioni di collegamenti, dove un collegamento unisce due persone che si sono chiamate a vicenda e la sua forza è il tempo passato a parlare. Due risultati spiccano.

Primo, la sovrapposizione cresce con la forza per la grande maggioranza dei collegamenti. Le persone con cui parli di più sono quelle i cui amici sono i tuoi amici.

Secondo, smontarono la rete. Togliendo per primi i legami più deboli, la rete va in pezzi tutta insieme, quando è sparita una certa quota dei collegamenti. Togliendo per primi i più forti si restringe soltanto, senza crollare. I legami forti stanno dentro i gruppi, dove i cammini alternativi abbondano; i legami deboli sono ciò che unisce i gruppi tra loro. La seconda simulazione ripete l'esperimento su otto gruppi di 25. Togliendo per primi i collegamenti più deboli, il pezzo più grande scende sotto la metà della rete quando è sparito il 6% dei collegamenti; togliendo per primi i più forti resiste fino al 90%.

Due studi successivi seguono l'idea fino alle conseguenze. Burt (2004) studiò i dirigenti di una grande azienda: quelli i cui contatti univano gruppi separati, che stavano nei vuoti tra un gruppo e l'altro, proponevano le idee giudicate migliori dai loro superiori. E Rajkumar e colleghi (2022) riferiscono di un esperimento randomizzato su più di 20 milioni di iscritti a LinkedIn, in cui i suggerimenti di nuovi contatti furono variati a caso per cinque anni. I legami deboli aiutavano davvero a cambiare lavoro più di quelli forti. Misurando la forza con il numero di contatti condivisi, i più utili erano i legami moderatamente deboli, non i più deboli in assoluto.

## Dai triangoli ai motivi

Finora i collegamenti non avevano verso. Dandogliene uno, tre nodi si possono unire in molti più modi. Contando solo gli schemi in cui i tre nodi stanno insieme, e considerando uguali quelli che differiscono solo per i nomi dei nodi, sono tredici.

```figure
patterns
```

Quali usa una rete? Milo e colleghi (2002) proposero un procedimento. Si conta quante volte compare ciascuno schema. Poi si costruiscono molte versioni randomizzate della rete in cui ogni nodo conserva il suo numero di collegamenti in entrata, in uscita e reciproci, e nient'altro: il modello nullo del modulo 02, adattato ai versi. Si conta di nuovo in ciascuna. Un **motivo** è uno schema che compare nella rete reale molto più spesso che in quelle randomizzate, e la distanza si misura come prima:

```math
z = (N_reale − ⟨N_casuale⟩) / σ_casuale
```

L'esempio più noto è la rete con cui i geni del batterio *E. coli* si accendono e si spengono a vicenda, nella quale Shen-Orr e colleghi (2002) avevano individuato lo schema per primi. X regola Y, ed entrambi regolano Z: il **feed-forward loop**, un anello in cui il segnale va solo in avanti. Compare 40 volte, contro 7 ± 3 nelle reti randomizzate.

Ha anche un compito. Nella sua forma più comune Z ha bisogno sia di X sia di Y, e Y impiega tempo ad accumularsi. Un breve impulso di X finisce prima che Y sia pronto, e non succede nulla; un segnale duraturo passa, con un ritardo. Il circuito ignora i segnali brevi e risponde a quelli che durano (Mangan e Alon 2003).

Reti di tipo diverso preferiscono schemi diversi. La maggior parte delle reti alimentari ha la catena e pochi feed-forward loop; una famiglia di circuiti elettronici ha il ciclo di tre nodi. Milo e colleghi (2004) confrontarono l'intero profilo dei punteggi z in molte reti e trovarono che queste si raggruppano in poche famiglie.

Nella terza simulazione una rete in cui i feed-forward loop sono costruiti apposta ne mostra 39, contro 15,8 ± 3,3 nelle sue versioni randomizzate: z = 7,0.

## Un'avvertenza

Viene la tentazione di leggere ogni motivo come uno scopo. Artzy-Randrup e colleghi (2004) sparsero dei nodi su una griglia e li collegarono con una probabilità che diminuisce con la distanza, senza alcuna selezione. Il feed-forward loop risultò un motivo lo stesso, come tra i neuroni di un verme, semplicemente perché i vicini prossimi di uno stesso nodo sono vicini tra loro. Di uno schema che batte il modello nullo non si è dimostrato che serva a qualcosa. Si è dimostrato che questo modello nullo non lo spiega.

Torna quindi la lezione del modulo 02. Il modello nullo è una scelta, e la risposta dipende da quella scelta. Geometria, crescita e gradi possono ciascuno produrre «motivi». La funzione va dimostrata a parte, come fecero Mangan e Alon, calcolando che cosa fa il circuito.

## Che cosa viene dopo

Triangoli e motivi sono struttura locale. Il modulo 05 torna ai gradi, e a un'affermazione fatta troppo spesso: le code pesanti, trattate come si deve.

<!-- simulation -->

## Letture consigliate

- Easley, D. e Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Cap. 3.
- Latora, V., Nicosia, V. e Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Cap. 8.
- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press. Cap. 7.
- Granovetter, M. S. (1973). The strength of weak ties. *American Journal of Sociology* 78, 1360–1380.
- Rapoport, A. (1953). Spread of information through a population with socio-structural bias: I. Assumption of transitivity. *Bulletin of Mathematical Biophysics* 15, 523–533.
- Kossinets, G. e Watts, D. J. (2006). Empirical analysis of an evolving social network. *Science* 311, 88–90.
- Onnela, J.-P. et al. (2007). Structure and tie strengths in mobile communication networks. *PNAS* 104, 7332–7336.
- Burt, R. S. (2004). Structural holes and good ideas. *American Journal of Sociology* 110, 349–399.
- Rajkumar, K. et al. (2022). A causal test of the strength of weak ties. *Science* 377, 1304–1310.
- Milo, R. et al. (2002). Network motifs: simple building blocks of complex networks. *Science* 298, 824–827.
- Shen-Orr, S. S., Milo, R., Mangan, S. e Alon, U. (2002). Network motifs in the transcriptional regulation network of *Escherichia coli*. *Nature Genetics* 31, 64–68.
- Mangan, S. e Alon, U. (2003). Structure and function of the feed-forward loop network motif. *PNAS* 100, 11980–11985.
- Milo, R. et al. (2004). Superfamilies of evolved and designed networks. *Science* 303, 1538–1542.
- Artzy-Randrup, Y., Fleishman, S. J., Ben-Tal, N. e Stone, L. (2004). Comment on "Network motifs: simple building blocks of complex networks" and "Superfamilies of evolved and designed networks". *Science* 305, 1107.
