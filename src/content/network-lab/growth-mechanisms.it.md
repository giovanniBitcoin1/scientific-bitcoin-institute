<!-- DRAFT: to be reviewed by Adriano -->

## Una rete che cresce soltanto

Una coda pesante ha bisogno di una causa. Il [modulo 04 del Complexity Lab](/lab/scale-free) ne ha data una: una rete che cresce, in cui ogni nuovo arrivato si collega ai nodi esistenti in proporzione al loro grado, finisce con p_k ∝ k^(−3), mentre la stessa crescita con scelte uniformi dà una coda esponenziale. Lì c'era anche la storia, da Yule e Simon fino a Merton. Qui ci chiediamo quanto sia generale quel risultato, come si misuri la regola, come possa nascere quando nessuno conta i collegamenti, e che cosa decida. Le code si misurano con la ricetta del [modulo 05](/network-lab/heavy-tails-done-right).

Le citazioni furono la prima rete studiata così. Nel 1965 Derek de Solla Price esaminò gli articoli che si citano a vicenda e trovò che, per n grande, il numero di articoli citati n volte cala come una potenza inversa di n: come n^(−2,5) o n^(−3), scrisse, senza scegliere tra le due. Nel 1976 propose un meccanismo. Ogni nuovo articolo cita c articoli precedenti, e un articolo precedente viene scelto con probabilità proporzionale a q + a, dove q è il numero di citazioni che ha già. La costante a dà a un articolo una possibilità prima della sua prima citazione. La distribuzione dei gradi in entrata ha allora una coda a legge di potenza con esponente

```math
α = 2 + a / c
```

Se si ignora il verso dei collegamenti, il modello non orientato di Barabási–Albert compare come il caso a = c = m (esercizio 2). Uno scostamento si può aggiungere anche al modello non orientato: con un tasso di aggancio Π(k) ∝ k + A, dove A si chiama **attrattività iniziale**, l'esponente dei gradi diventa

```math
γ = 3 + A / m
```

(Dorogovtsev, Mendes e Samukhin 2000). A va da poco sopra −m in su, quindi γ può valere qualunque cosa da 2 in su. «Crescita più aggancio preferenziale» non prevede γ = 3. Prevede una famiglia, e 3 ne è un membro.

## L'età è destino, in media

Nel modello lineare, tratta il grado di un nodo come una quantità continua che cresce al tasso medio: è l'approssimazione di **campo medio**. Al tempo t ci sono circa 2mt estremi di collegamento, quindi il nodo i riceve collegamenti al tasso m k_i / (2mt) = k_i / (2t), e partendo da m al suo tempo di nascita t_i,

```math
k_i(t) = m (t / t_i)^(1/2)
```

I nodi più vecchi sono i più grandi, e la sola dispersione dei tempi di nascita produce la coda: i nodi nati prima di t (m/k)² hanno più di k collegamenti, il che dà P(K > k) = (m/k)² e p_k ≈ 2m²/k³ (esercizio 1). Il modello di Price fa la stessa previsione per gli articoli, e Newman (2009) l'ha trovata nei dati delle citazioni: nei campi nati a una data nota, i primi articoli hanno raccolto molte più citazioni dei successivi, più o meno quanto dice il modello. Su 2.407 articoli di scienza delle reti, il primo decimo a uscire aveva raccolto in media 101 citazioni ciascuno, il decimo successivo 26 e il decimo più recente 0,08. Lo chiamò **vantaggio del primo arrivato**.

Ma «in media» conta. Su 100 reti di 10.000 nodi con m = 2, il nodo nato al passo 100 finisce con circa 19 collegamenti in media, vicino ai 20 del campo medio, con una deviazione standard di circa 12. Nascere presto dà un vantaggio, non una garanzia.

## Quanto in fretta si arricchiscono i ricchi?

Perché lineare? Sostituisci k con k^α, un **kernel di aggancio** con un esponente (Krapivsky, Redner e Leyvraz 2000). Sotto α = 1 non ci sono hub: la distribuzione dei gradi è un'**esponenziale stirata**, e il grado massimo cresce solo come una potenza di ln t. Con α = 1 è una legge di potenza. Sopra α = 1 il vantaggio si alimenta da sé: al limite di una rete grande un nodo finisce collegato a quasi tutti gli altri, e sopra α = 2 tutti i nodi tranne un numero finito si collegano a lui. **Il vincitore prende tutto**. Con α = 1,5 e 5.000 nodi, l'hub più grande della prima simulazione è collegato all'84% di essi. Una legge di potenza pura richiede un kernel esattamente lineare, un filo di rasoio tra due mondi molto diversi.

```figure
rich
```

Un hub con 100 collegamenti tra 1.000 nodi con 2 collegamenti ciascuno prende il 4,8% del prossimo collegamento con α = 1, la sua giusta parte. Con α = 1,5 ne prende il 26%, con α = 2 il 71%, e il distacco cresce a ogni collegamento che guadagna.

## Misurare il kernel

Il kernel si può misurare da due **istantanee** di una rete che cresce. Per ogni grado k nella prima istantanea, conta i collegamenti che i nodi vecchi di grado k hanno ricevuto nel frattempo e dividi per il numero di quei nodi. Il risultato, collegamenti ricevuti per nodo, stima Π(k) a meno di una costante (Jeong, Néda e Barabási 2003; Newman 2001).

```figure
snapshots
```

Π(k) è rumoroso, perché pochi nodi condividono un grado grande. Di solito lo si somma, κ(k) = Σ_(k′ ≤ k) Π(k′), e si adatta κ su assi logaritmici: se Π ∝ k^α la pendenza di κ è α + 1. Misurando così, Jeong e colleghi trovarono α vicino a 1 per le citazioni (0,95) e per Internet (1,05), e più basso per le collaborazioni tra attori (0,81) e tra neuroscienziati (0,79); Newman trovò 1,04 per le coautorie in biomedicina e 0,89 in fisica.

La terza simulazione aggiunge una cautela dalle nostre reti, cresciute con α = 1 esatto. Adattata dal grado più piccolo fino al grado più grande che abbiano almeno dieci nodi, la pendenza cumulativa dà α = 0,99 in media su 20 reti; adattata su tutti i gradi che compaiono, 0,62. Dove la maggior parte dei gradi non compare affatto, κ smette di crescere tra i pochi che compaiono. L'entità della distorsione dipende da dove parte la somma e dall'intervallo adattato. La massima verosimiglianza evita le somme: ogni nuovo collegamento ha scelto la sua destinazione tra i nodi vecchi con probabilità k^α / Σ_j k_j^α, con i gradi della prima istantanea, e l'α più probabile dà 1,01 ± 0,02 sulle stesse reti.

## Aggancio preferenziale senza un piano

Nessuna pagina web, autore o proteina calcola gradi. Eppure regole locali producono Π ∝ k.

- **Selezione di un collegamento.** Scegli un collegamento a caso e attaccati a uno dei suoi due estremi. Un nodo con k collegamenti sta all'estremo di k di essi: viene raggiunto in proporzione al suo grado, che è di nuovo il «segui un collegamento» del modulo 05.
- **Copia** (Kleinberg et al. 1999; Kumar et al. 2000). Una nuova pagina web sceglie a caso una pagina esistente; con probabilità p si collega a quella pagina, altrimenti copia uno dei suoi collegamenti. Una pagina con q collegamenti in entrata ne riceve uno nuovo con un tasso proporzionale a q + mp/(1 − p): il modello di Price, con esponente (2 − p)/(1 − p) (esercizio 4).
- **Passeggiate aleatorie.** Parti da un nodo a caso, fai ℓ passi lungo i collegamenti, attaccati dove la passeggiata finisce (Saramäki e Kaski 2004; in una regola precedente di Vázquez 2003 il nuovo arrivato si collega ai nodi lungo la passeggiata). Un camminatore che ha vagato abbastanza si trova su un nodo in proporzione al suo grado. La seconda simulazione usa la versione più semplice, una passeggiata nuova per ogni collegamento, e dopo un solo passo il camminatore non ci è ancora arrivato: una passeggiata di un passo misura un kernel di 1,25, sopra il lineare, e costruisce un hub collegato a un quarto della rete.
- **Duplicazione genica.** Un gene duplicato eredita i partner proteici dell'originale: di nuovo una copia (Pastor-Satorras, Smith e Solé 2003; Vázquez et al. 2003).

## Oppure con un piano

Fabrikant, Koutsoupias e Papadimitriou (2002) diedero agli hub un'origine diversa. I nodi arrivano uno alla volta in punti a caso di un quadrato. Ciascuno si collega all'unico nodo esistente j che rende minimo δ × d + h_j, dove d è la distanza tra i due e h_j il numero di passi da j al primo nodo, la radice. Quando δ è piccolo la distanza conta poco e ogni nodo si collega alla radice: dimostrarono che sotto δ = 1/√2 la rete è una stella, ovunque stia la radice (la nostra sta al centro del quadrato, e la stella dura un po' di più). Quando δ è dell'ordine di √N o più, ogni nodo si collega a un nodo vicino e i gradi calano in modo esponenziale. Nel mezzo dimostrarono che la coda è pesante, e la chiamarono legge di potenza. Berger e colleghi (2003) guardarono meglio: in quel regime quasi tutti i nodi sono foglie con un solo collegamento, molti hub si dividono la cima, e una legge di potenza può valere, al massimo, per una frazione evanescente dei nodi.

Il caso e l'ottimizzazione possono entrambi produrre aggancio preferenziale, e nella seconda simulazione l'ottimizzazione misura perfino un kernel sopra 1. Una coda pesante non dice quale dei due sia all'opera.

## Rifai la storia

La prima simulazione rifà lo stesso modello venti volte, con α = 1 e 5.000 nodi. Le venti distribuzioni dei gradi stanno una sopra l'altra. L'hub più grande è uno dei primi dieci nodi in 18 corse su 20, ma quale cambia da una corsa all'altra, e il nodo in testa quando la rete ha 500 nodi è ancora il leader alla fine in 16 corse. La legge fissa la forma e dà ai vecchi un vantaggio di partenza; non fa il nome del vincitore.

Salganik, Dodds e Watts (2006) fecero questo esperimento con le persone. In MusicLab circa 14.000 partecipanti potevano scaricare 48 canzoni di gruppi sconosciuti. Furono divisi in nove «mondi» che non si incontravano mai: in otto si vedeva quante volte ogni canzone era stata scaricata dagli altri del proprio mondo, nel nono non si vedeva nessun conteggio. L'influenza sociale rese il successo più diseguale, e meno prevedibile: la stessa canzone poteva andare benissimo in un mondo e male in un altro. La forma è una legge; i nomi sono storia.

## Che cosa viene dopo

Qui ogni nodo era uguale agli altri, e solo la data di nascita e la fortuna lo distinguevano. Il modulo 07 dà ai nodi una qualità propria, e lascia vincere un ultimo arrivato.

<!-- simulation -->

## Letture consigliate

- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Cap. 5.
- Newman, M. E. J. (2018). *Networks*, 2ª ed. Oxford University Press. Cap. 13.
- Latora, V., Nicosia, V. e Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Cap. 6.
- Easley, D. e Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Cap. 18.
- Price, D. J. de S. (1965). Networks of scientific papers. *Science* 149, 510–515.
- Price, D. de S. (1976). A general theory of bibliometric and other cumulative advantage processes. *Journal of the American Society for Information Science* 27, 292–306.
- Dorogovtsev, S. N., Mendes, J. F. F. e Samukhin, A. N. (2000). Structure of growing networks with preferential linking. *Physical Review Letters* 85, 4633–4636.
- Krapivsky, P. L., Redner, S. e Leyvraz, F. (2000). Connectivity of growing random networks. *Physical Review Letters* 85, 4629–4632.
- Jeong, H., Néda, Z. e Barabási, A.-L. (2003). Measuring preferential attachment in evolving networks. *Europhysics Letters* 61, 567–572.
- Newman, M. E. J. (2001). Clustering and preferential attachment in growing networks. *Physical Review E* 64, 025102.
- Kleinberg, J. M., Kumar, R., Raghavan, P., Rajagopalan, S. e Tomkins, A. S. (1999). The Web as a graph: measurements, models, and methods. *Computing and Combinatorics (COCOON 1999)*, Lecture Notes in Computer Science 1627, 1–17.
- Kumar, R., Raghavan, P., Rajagopalan, S., Sivakumar, D., Tomkins, A. e Upfal, E. (2000). Stochastic models for the Web graph. *Proceedings of the 41st IEEE Symposium on Foundations of Computer Science*, 57–65.
- Vázquez, A. (2003). Growing network with local rules: preferential attachment, clustering hierarchy, and degree correlations. *Physical Review E* 67, 056104.
- Saramäki, J. e Kaski, K. (2004). Scale-free networks generated by random walkers. *Physica A* 341, 80–86.
- Pastor-Satorras, R., Smith, E. e Solé, R. V. (2003). Evolving protein interaction networks through gene duplication. *Journal of Theoretical Biology* 222, 199–210.
- Vázquez, A., Flammini, A., Maritan, A. e Vespignani, A. (2003). Modeling of protein interaction networks. *ComPlexUs* 1, 38–44.
- Fabrikant, A., Koutsoupias, E. e Papadimitriou, C. H. (2002). Heuristically optimized trade-offs: a new paradigm for power laws in the Internet. *Automata, Languages and Programming (ICALP 2002)*, Lecture Notes in Computer Science 2380, 110–122.
- Berger, N., Bollobás, B., Borgs, C., Chayes, J. e Riordan, O. (2003). Degree distribution of the FKP network model. *Automata, Languages and Programming (ICALP 2003)*, Lecture Notes in Computer Science 2719, 725–738.
- D'Souza, R. M., Borgs, C., Chayes, J. T., Berger, N. e Kleinberg, R. D. (2007). Emergence of tempered preferential attachment from optimization. *PNAS* 104, 6112–6117.
- Newman, M. E. J. (2009). The first-mover advantage in scientific publication. *Europhysics Letters* 86, 68001.
- Salganik, M. J., Dodds, P. S. e Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. *Science* 311, 854–856.
