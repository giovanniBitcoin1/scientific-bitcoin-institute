<!-- DRAFT: to be reviewed by Adriano -->

## Non è un germe

Nessuno decide di prendersi un raffreddore. Adottare un'abitudine, un prodotto o una convinzione è una decisione, e chi decide guarda che cosa hanno deciso gli altri. Ci sono due buone ragioni per farlo. Gli altri possono sapere qualcosa: un ristorante pieno è un indizio sulla cucina. Oppure la cosa stessa può valere di più quando gli altri ce l'hanno: un telefono, una lingua, un formato di file. In entrambi i casi un solo contatto basta di rado, e le conclusioni del [modulo 12](/network-lab/epidemics-on-networks) cambiano. Gli esiti si ribaltano, i gruppi fermano una cascata dove prima alimentavano un'epidemia, gli hub diventano difficili da convincere e i legami lunghi smettono di aiutare.

## Sbagliare insieme

Le persone scelgono a turno tra due opzioni, una delle quali è giusta. Ciascuna ha un segnale privato che è giusto con probabilità q, e ciascuna vede che cosa hanno scelto le precedenti ma non i loro segnali. Banerjee (1992) e Bikhchandani, Hirshleifer e Welch (1992) lo hanno analizzato. Finché le scelte sono pari o differiscono di una, la scelta di ognuno rivela il suo segnale. Appena un'opzione è stata scelta da due persone in più dell'altra, il segnale di chi viene dopo non può più spostare l'equilibrio: quella persona segue, qualunque cosa sappia in privato. Così fanno tutte le successive, e poiché le loro scelte non rivelano più nulla, non si impara più nulla. È una **cascata informativa**, o effetto gregge. Ognuno agisce in modo sensato, e la folla può sbagliare: con probabilità

```math
(1 − q)² / (q² + (1 − q)²)
```

cioè 0,31 per q = 0,6. Le stesse persone, decidendo da sole e votando, farebbero molto meglio: la maggioranza di 25 scelte indipendenti è giusta l'85% delle volte (esercizio 2).

```figure
cascade
```

Salganik, Dodds e Watts (2006) hanno costruito l'esperimento. In un mercato musicale artificiale 14.341 persone hanno ascoltato 48 canzoni sconosciute e potevano scaricarle, senza vedere che cosa avevano fatto gli altri oppure in uno di otto «mondi» separati che mostravano il numero di download dei partecipanti precedenti. Un'influenza sociale più forte ha reso il successo più diseguale e meno prevedibile da un mondo all'altro: le canzoni migliori raramente andavano male e le peggiori raramente bene, ma tutto il resto poteva accadere.

## Soglie

Granovetter (1978) ha messo il secondo ingrediente in un numero per persona: la **soglia**, quanti altri devono già esserci prima che si unisca. Cento persone stanno in una piazza con soglie 0, 1, 2, … 99. La prima comincia, il che basta alla seconda, e così via fino all'ultima: una rivolta di cento. Ora cambia l'unica soglia 1 in un 2. La prima comincia, nessuno la segue, e la rivolta è una persona (esercizio 1). Due folle quasi identiche finiscono nel modo più diverso possibile, quindi l'esito dice poco su che cosa voleva la folla.

```figure
riot
```

In generale, se F è la distribuzione delle soglie, l'esito è il primo r per cui

```math
r = N F(r)
```

Nell'esempio di Granovetter le soglie hanno una distribuzione normale attorno a 25. Al crescere della loro deviazione standard l'esito sale piano fino a circa 6 persone, e vicino a 12,2 salta a quasi 100. La prima simulazione estrae folle vere da quella distribuzione. Con una deviazione standard di 12, dove la curva liscia si ferma a 4 persone, il 17% di 200 folle finisce con più della metà nella rivolta.

## Vale di più quando gli altri ce l'hanno

Un bene con un **effetto di rete** vale di più per ogni utente quanti più utenti ha (Rohlfs 1974; Katz e Shapiro 1985). La persona x gli attribuisce il valore r(x) f(z) quando lo usa una quota z della popolazione, e il prezzo è p. Le quote a cui nessuno vuole cambiare risolvono

```math
p = r(z) f(z)
```

oltre allo zero, che è sempre una di esse: senza utenti il bene non vale nulla. Di solito ce ne sono altre due. La più bassa è instabile, il **punto di svolta** o **massa critica**: sotto, gli utenti se ne vanno; sopra, si moltiplicano fino alla più alta, stabile (esercizio 3). Un bene di rete che non raggiunge la sua massa critica fallisce per quanto sia buono, e uno che la supera è difficile da scalzare: è il **lock-in**.

Vista da fuori, l'adozione disegna una S. Bass (1969) l'ha scritta in una riga,

```math
dF/dt = (p + qF)(1 − F)
```

con p per chi adotta da solo e q per l'imitazione. Una meta-analisi di 213 applicazioni (Sultan, Farley e Lehmann 1990) è di solito citata per medie vicine a p = 0,03 e q = 0,38 all'anno: quasi tutto il lavoro lo fa l'imitazione (esercizio 4). Il caso classico è il mais ibrido in Iowa, studiato agricoltore per agricoltore da Ryan e Gross (1943) e stato per stato da Griliches (1957). Il [modulo 13 del Complexity Lab](/lab/bitcoin-complex-system) racconta quella storia.

## Su una rete: i gruppi

Ora ognuno guarda solo i propri vicini. Ogni collegamento è un piccolo gioco di coordinamento: la nuova opzione rende a a entrambi i capi se entrambi la usano, la vecchia b. Un nodo con una quota s dei vicini sulla nuova opzione guadagna a cambiare quando s a ≥ (1 − s) b, cioè quando

```math
s ≥ q = b / (a + b)
```

(Morris 2000). Più la nuova opzione è buona, più q è bassa. Una cascata può attraversare un singolo collegamento, il legame debole del [modulo 04](/network-lab/triangles-weak-ties-motifs), solo verso un nodo per il quale un vicino è una quota q di tutti quelli che ha. E un insieme di nodi ciascuno dei quali ha più di 1 − q dei propri collegamenti dentro l'insieme non può essere penetrato affatto: nessun membro vede mai una quota q all'esterno. Nella forma data da Easley e Kleinberg (2010), questi gruppi coesi sono l'unico ostacolo: un insieme di primi adottanti non riesce a convertire tutti esattamente quando il resto della rete ne contiene uno. Le comunità del [modulo 09](/network-lab/communities) sono il luogo in cui le innovazioni si fermano (esercizio 5).

## La finestra delle cascate

Watts (2002) si è chiesto quando un solo adottante può avviare una cascata in una rete casuale di grado medio z in cui ogni nodo ha la stessa soglia φ. Un nodo con k collegamenti cede a un solo vicino soltanto se k ≤ 1/φ: chiamiamolo **vulnerabile**. Una **cascata globale** richiede una componente gigante di nodi vulnerabili, che esiste quando

```math
Σ_{k ≤ 1/φ} k(k − 1) p_k / z > 1
```

Questo vale in una finestra di z. Con troppo pochi collegamenti nulla è connesso; con troppi, nessuno è vulnerabile. Per φ = 0,18 la **finestra delle cascate** va da z = 1,02 a 5,76. Nella seconda simulazione, con z = 4, lo 0,875 di 200 semi a caso avvia una cascata globale. Con z = 5,75 ci riesce solo lo 0,180, e quelle che partono prendono lo 0,997 dei nodi: vicino al bordo superiore le cascate sono rare e totali. Il sistema sembra stabile finché non lo è più.

Gli hub sono difficili da convincere, perché a loro servono molti vicini che hanno adottato. Watts ha trovato che una distribuzione dei gradi più eterogenea rende una rete meno vulnerabile alle cascate. Qui una rete cresciuta per aggancio preferenziale con lo stesso grado medio va in cascata dallo 0,285 dei semi a caso; da uno dei 20 hub più grandi, entrambe le reti vanno in cascata ogni volta. Eppure Watts e Dodds (2007) hanno concluso che le grandi cascate sono guidate non dagli influenti ma da una massa critica di persone facili da influenzare.

## Contagio complesso

Centola e Macy (2007) hanno chiamato **complesso** un contagio in cui per adottare serve più di un vicino che ha adottato. Un singolo legame lungo allora non porta nulla. Le scorciatoie che rendono piccolo il mondo per una malattia ([modulo 03 del Complexity Lab](/lab/small-worlds)) non aiutano un comportamento, e troppa ricablatura distrugge il clustering su cui viaggia. Nella terza simulazione il contagio semplice su un anello attraversa il 90% dei nodi in 562 passi, e in 19,4 quando un collegamento su cento è ricablato; il contagio complesso passa da 749 a 685,9. Con metà dei collegamenti ricablati raggiunge lo 0,005 dei nodi.

Centola (2010) lo ha verificato con 1.528 persone in una comunità online sulla salute: un comportamento ha raggiunto il 54% di chi stava in reti con molto clustering contro il 38% in reti casuali, e si è diffuso più in fretta. Ugander, Backstrom, Marlow e Kleinberg (2012) hanno trovato che la probabilità di iscriversi a Facebook dipendeva dal numero di gruppi separati tra i contatti già presenti, non dal numero di contatti. Una cautela, dal [modulo 08](/network-lab/who-connects-to-whom): amici che si comportano allo stesso modo potevano essere simili già prima (Aral, Muchnik e Sundararajan 2009; Shalizi e Thomas 2011).

```box
La moneta come bene di rete
La moneta è il bene di rete più puro: un mezzo di scambio vale la pena di tenerlo perché gli altri lo accettano (Menger 1892). Massa critica, punto di svolta e lock-in valgono per essa come per una rete telefonica.

La versione misurata è una legge di Metcalfe generalizzata, valore ∝ n^k ([modulo 13 del Complexity Lab](/lab/bitcoin-complex-system)). Per Bitcoin è stata stimata più volte: Alabi (2017) e Peterson (2018) con leggi di tipo Metcalfe; Wheatley e colleghi (2019), capitalizzazione di mercato contro indirizzi attivi, k = 1,69; Santostasi e Perrenod (2026), prezzo contro indirizzi con saldo non nullo, k = 1,838 (vedi la nostra [pagina delle pubblicazioni](/research/publications#preprint)).

Due cautele. Un indirizzo non è un utente (il riquadro del modulo 12). E due grandezze che crescono entrambe nel tempo sono correlate qualunque cosa le leghi: la stima da sola non mostra che siano gli utenti a fare il valore. L'esponente inoltre dipende dal periodo: per sottoperiodo valeva 1,59, 2,64, 3,28 e 6,83 (Pecere 2026, supplemento, sezione S2).

I modelli di questo modulo dicono quando un bene di rete decolla o fallisce. Non dicono quanto vale.
```

## Prossimo modulo

Il [modulo 14](/network-lab/capstone-a-real-network) è il capstone: tutti gli strumenti del corso su una rete reale.

<!-- simulation -->

## Letture consigliate

- Easley, D. e Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Cap. 16, 17 e 19.
- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Cap. 10.
- Newman, M. E. J. (2018). *Networks*, 2ª ed. Oxford University Press. Cap. 16.
- Banerjee, A. V. (1992). A simple model of herd behavior. *Quarterly Journal of Economics* 107, 797–817.
- Bikhchandani, S., Hirshleifer, D. e Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. *Journal of Political Economy* 100, 992–1026.
- Salganik, M. J., Dodds, P. S. e Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. *Science* 311, 854–856.
- Granovetter, M. (1978). Threshold models of collective behavior. *American Journal of Sociology* 83, 1420–1443.
- Rohlfs, J. (1974). A theory of interdependent demand for a communications service. *Bell Journal of Economics and Management Science* 5, 16–37.
- Katz, M. L. e Shapiro, C. (1985). Network externalities, competition, and compatibility. *American Economic Review* 75, 424–440.
- Bass, F. M. (1969). A new product growth for model consumer durables. *Management Science* 15, 215–227.
- Sultan, F., Farley, J. U. e Lehmann, D. R. (1990). A meta-analysis of applications of diffusion models. *Journal of Marketing Research* 27, 70–77.
- Ryan, B. e Gross, N. C. (1943). The diffusion of hybrid seed corn in two Iowa communities. *Rural Sociology* 8, 15–24.
- Griliches, Z. (1957). Hybrid corn: an exploration in the economics of technological change. *Econometrica* 25, 501–522.
- Morris, S. (2000). Contagion. *Review of Economic Studies* 67, 57–78.
- Watts, D. J. (2002). A simple model of global cascades on random networks. *PNAS* 99, 5766–5771.
- Watts, D. J. e Dodds, P. S. (2007). Influentials, networks, and public opinion formation. *Journal of Consumer Research* 34, 441–458.
- Centola, D. e Macy, M. (2007). Complex contagions and the weakness of long ties. *American Journal of Sociology* 113, 702–734.
- Centola, D. (2010). The spread of behavior in an online social network experiment. *Science* 329, 1194–1197.
- Ugander, J., Backstrom, L., Marlow, C. e Kleinberg, J. (2012). Structural diversity in social contagion. *PNAS* 109, 5962–5966.
- Shalizi, C. R. e Thomas, A. C. (2011). Homophily and contagion are generically confounded in observational social network studies. *Sociological Methods and Research* 40, 211–239.
- Aral, S., Muchnik, L. e Sundararajan, A. (2009). Distinguishing influence-based contagion from homophily-driven diffusion in dynamic networks. *PNAS* 106, 21544–21549.
- Menger, K. (1892). On the origin of money. *Economic Journal* 2, 239–255.
- Alabi, K. (2017). Digital blockchain networks appear to be following Metcalfe's Law. *Electronic Commerce Research and Applications* 24, 23–29.
- Peterson, T. (2018). Metcalfe's Law as a model for Bitcoin's value. *Alternative Investment Analyst Review* 7(2), 9–18.
- Wheatley, S., Sornette, D., Huber, T., Reppen, M. e Gantner, R. N. (2019). Are Bitcoin bubbles predictable? Combining a generalized Metcalfe's Law and the Log-Periodic Power Law Singularity model. *Royal Society Open Science* 6, 180538.
- Santostasi, G. e Perrenod, S. (2026). A Mechanistic Derivation of the Bitcoin Price Power Law: Network Adoption Dynamics and Generalised Metcalfe Scaling. Zenodo. [doi.org/10.5281/zenodo.19387099](https://doi.org/10.5281/zenodo.19387099)
- Pecere, A. (2026). Bitcoin's power-law trend: what the regression identifies, and the four-year oscillation around it. Zenodo. [doi.org/10.5281/zenodo.23933138](https://doi.org/10.5281/zenodo.23933138)
