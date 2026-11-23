<!-- DRAFT: to be reviewed by Adriano -->

## Un solo numero

Supponiamo che tutti incontrino tutti, e che ogni persona infetta trasmetta l'infezione in media a R0 altre prima di guarire. Sotto R0 = 1 ogni generazione di casi è più piccola della precedente e il focolaio si spegne; sopra, cresce, all'inizio in modo esponenziale. Kermack e McKendrick (1927) ne ricavarono le conseguenze. Nel modello **SIR** le persone sono suscettibili, poi infette, poi guarite e immuni, e l'epidemia finisce da sola prima di aver raggiunto tutti. La quota S di chi è stato infettato risolve

```math
S = 1 − e^(−R0 S)
```

che dà l'80% per R0 = 2 (esercizio 2). Nel modello **SIS** la guarigione non dà immunità, e sopra la soglia l'infezione si assesta su un livello stabile invece di finire. In entrambi i casi decide un solo numero, ed è una media. Su una rete una media è la cosa sbagliata da guardare.

## Su una rete

Un nodo infetto trasmetta l'infezione lungo ciascuno dei suoi collegamenti con probabilità T, la **trasmissibilità**. Un nodo raggiunto lungo un collegamento non è un nodo tipico. Lo si trova in proporzione al suo grado, e ha in media (⟨k²⟩ − ⟨k⟩)/⟨k⟩ altri collegamenti lungo cui trasmettere a sua volta: il grado in eccesso del [modulo 05](/network-lab/heavy-tails-done-right). Quindi

```math
R0 = T (⟨k²⟩ − ⟨k⟩) / ⟨k⟩
```

e un focolaio può crescere quando T supera T_c = ⟨k⟩/(⟨k²⟩ − ⟨k⟩) (Newman 2002). È la formula del [modulo 11](/network-lab/robustness-and-cascades) letta al contrario (esercizio 1), e non per caso. Segna ogni collegamento come uno che trasmetterebbe, con probabilità T: i nodi raggiunti da un focolaio sono la componente del suo seme tra i collegamenti segnati. Un'epidemia SIR è percolazione. Sopra T_c esiste una componente gigante, la sua dimensione è quella di un grande focolaio, e le funzioni generatrici del modulo 05 la danno: se u risolve u = G1(1 − T + Tu) e w = 1 − T + Tu, la dimensione finale è 1 − G0(w).

Nella prima simulazione una rete casuale con ⟨k⟩ = 4 ha T_c = 0,250, e con T = 0,5 la componente più grande contiene lo 0,796 dei suoi 10.000 nodi, dove la formula dice 0,797. Una rete della stessa dimensione e dello stesso grado medio, cresciuta per aggancio preferenziale, ha T_c = 0,075.

## La soglia che svanisce

Con una coda a legge di potenza di esponente γ ≤ 3, ⟨k²⟩ cresce senza limite al crescere della rete, e T_c va a zero: in una rete abbastanza grande un'infezione può diffondersi per quanto debolmente sia trasmessa. Pastor-Satorras e Vespignani (2001) lo trovarono per il modello SIS, la cui soglia nella loro teoria è ⟨k⟩/⟨k²⟩. Partivano da un enigma sui virus informatici. Quelli che riuscivano a diffondersi restavano a lungo su una frazione minuscola delle macchine, cosa che un modello con una soglia spiega solo se ogni virus si trova per caso appena sopra di essa. Senza soglia, una prevalenza bassa e duratura è ciò che ci si aspetta. Castellano e Pastor-Satorras (2010) mostrarono poi che la legge di potenza non serve: l'hub più grande basta a tenere viva un'infezione SIS e a passarla al resto, quindi la soglia svanisce in ogni rete il cui grado massimo cresce con la dimensione.

Una rete finita ha sempre una soglia, solo bassa. In media su 20 reti, la formula dà T_c = 0,100, 0,073 e 0,060 per l'aggancio preferenziale con 1.000, 10.000 e 100.000 nodi, e 0,069, 0,024 e 0,012 per una legge di potenza con γ = 2,5. Per le reti casuali resta a 0,250.

## Il caso e i superdiffusori

Sopra la soglia, non ogni introduzione riesce. I collegamenti intorno al primo caso possono fallire tutti, e il focolaio finisce dopo una manciata di casi. Un seme con k collegamenti avvia un grande focolaio con probabilità 1 − w^k, perché ciascuno dei suoi collegamenti deve fallire per conto proprio (esercizio 3). In una rete casuale con ⟨k⟩ = 4 e T = 0,5 fa 0,40 per un nodo con un collegamento e 0,99 per un nodo con dieci.

```figure
seed
```

La trasmissione reale è altrettanto diseguale. Lloyd-Smith, Schreiber, Kopp e Getz (2005) stimarono per diverse malattie il numero di casi secondari per caso e lo trovarono molto più disperso di quanto una media lasci pensare. Per la SARS a Singapore il parametro di dispersione era circa 0,16: secondo la loro stima dal 73% dei casi ci si attendeva meno di un contagio, e dal 6% più di otto. I focolai di una malattia così di solito si spengono, e quelli che non si spengono sono esplosivi.

## Prima gli hub

Chi viene infettato presto? Chi è facile da raggiungere. In una rete eterogenea l'infezione sale agli hub in pochi passi e poi scende lungo i gradi, raggiungendo per ultimi i nodi con pochi collegamenti (Barthélemy, Barrat, Pastor-Satorras e Vespignani 2004). Lo stesso articolo dà la scala di tempo della crescita iniziale,

```math
τ = ⟨k⟩ / (β (⟨k²⟩ − ⟨k⟩))
```

con β il tasso di infezione lungo un collegamento: a dare il ritmo è la dispersione dei gradi, non la loro media. Nella seconda simulazione i nodi infettati al primo passo in una rete ad aggancio preferenziale hanno in media 11,7 collegamenti, contro un grado medio di 4, e metà della rete è infetta dopo 13,0 passi. Alla rete casuale con lo stesso numero di collegamenti ne servono 20,0. Anche lì i primi casi hanno circa 5 collegamenti, non 4: sono gli amici del [modulo 02](/network-lab/what-are-we-measuring).

## Chi vaccinare

Se tutti si mescolano, immunizzare una quota 1 − 1/R0 della popolazione porta ogni caso sotto un successore. Su una rete, immunizza a caso una quota g e l'argomento della percolazione acquista un fattore, 1 − g. Il focolaio è fermato sopra

```math
g_c = 1 − T_c / T
```

che è vicino a tutti quando T_c è vicino a zero (esercizio 4). La vaccinazione casuale spende quasi tutte le dosi su nodi che contano poco. Immunizzare gli hub funziona con poche dosi (Pastor-Satorras e Vespignani 2002), ma suppone che i gradi siano noti. Cohen, Havlin e ben-Avraham (2003) tolsero questa condizione: chiedi a persone scelte a caso di indicare un conoscente, e immunizza il conoscente. Per il paradosso dell'amicizia del modulo 02, la persona indicata ha più collegamenti di quella interpellata.

Nella terza simulazione, con T = 0,5 sull'aggancio preferenziale, un grande focolaio scende sotto l'1% della rete quando si immunizza il 74% dei nodi a caso, il 24% tra i conoscenti e l'8% per grado. Sulla rete casuale le tre cifre sono 54%, 44% e 22%: dove non ci sono hub c'è meno da guadagnare.

## Non sempre esponenziale

La crescita esponenziale richiede che ogni caso trovi contatti nuovi allo stesso ritmo. Dove i contatti sono locali non può durare: un'infezione che avanza a velocità costante su una superficie ha raggiunto l'area dentro il suo fronte, che cresce come t². E dove i gruppi sono raggiunti uno dopo l'altro, una potenza del tempo può sostituire del tutto l'esponenziale. I casi cumulati di AIDS negli Stati Uniti crebbero come t³, e Colgate, Stanley, Hyman, Layne e Qualls (1989) proposero un modello che dà il cubo: una popolazione divisa per comportamento a rischio, in cui l'infezione satura prima il piccolo gruppo a rischio più alto e poi gruppi sempre più grandi a rischio più basso, ciascuno più tardi del precedente (esercizio 5).

```figure
growth
```

Viboud, Simonsen e Chowell (2016) analizzarono la fase iniziale di 20 epidemie e conclusero che una crescita più lenta dell'esponenziale è comune, soprattutto per le infezioni che non si trasmettono per via aerea.

```box
L'adozione è un'epidemia?
L'adozione è spesso disegnata come una curva a S: un'epidemia che parte in modo esponenziale e satura. Il numero di indirizzi Bitcoin con saldo non nullo non è cresciuto così. È vicino a una legge di potenza del tempo, N ∝ t^3,046 (Santostasi e Perrenod 2026, il preprint dell'Istituto; vedi il [modulo 13 del Complexity Lab](/lab/bitcoin-complex-system) e la nostra [pagina delle pubblicazioni](/research/publications#preprint)). Gli autori collegano la legge cubica alla diffusione epidemica su una rete eterogenea, citando l'onda di saturazione di Colgate e colleghi; la sezione qui sopra e l'esercizio 5 mostrano come può nascere una potenza del tempo.

Due cautele. Un indirizzo non è un utente: una persona può averne molti, e un exchange ne tiene uno per molte persone (il grafo delle entità del [modulo 01](/network-lab/reading-a-network)). E l'esponente non è stato costante: stimato per sottoperiodo valeva 3,37 (2011–15), 3,00 (2016–19), 1,93 (2020–22) e 1,01 (2023–26) (Pecere 2026, supplemento, sezione S2). Se sia una pausa, un rallentamento o un conteggio che non vede più i nuovi arrivati è una questione aperta.
```

## Prossimo modulo

A un'infezione basta un contatto. A molto di ciò che si diffonde tra le persone ne servono di più: un'abitudine, uno strumento o una convinzione vengono spesso adottati solo quando abbastanza vicini li hanno già. Il [modulo 13](/network-lab/social-contagion-network-effects) passa al contagio sociale e agli effetti di rete.

<!-- simulation -->

## Letture consigliate

- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Cap. 10.
- Newman, M. E. J. (2018). *Networks*, 2ª ed. Oxford University Press. Cap. 16.
- Latora, V., Nicosia, V. e Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press.
- Easley, D. e Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Cap. 21.
- Kermack, W. O. e McKendrick, A. G. (1927). A contribution to the mathematical theory of epidemics. *Proceedings of the Royal Society A* 115, 700–721.
- Newman, M. E. J. (2002). Spread of epidemic disease on networks. *Physical Review E* 66, 016128.
- Pastor-Satorras, R. e Vespignani, A. (2001). Epidemic spreading in scale-free networks. *Physical Review Letters* 86, 3200–3203.
- Pastor-Satorras, R. e Vespignani, A. (2002). Immunization of complex networks. *Physical Review E* 65, 036104.
- Castellano, C. e Pastor-Satorras, R. (2010). Thresholds for epidemic spreading in networks. *Physical Review Letters* 105, 218701.
- Lloyd-Smith, J. O., Schreiber, S. J., Kopp, P. E. e Getz, W. M. (2005). Superspreading and the effect of individual variation on disease emergence. *Nature* 438, 355–359.
- Barthélemy, M., Barrat, A., Pastor-Satorras, R. e Vespignani, A. (2004). Velocity and hierarchical spread of epidemic outbreaks in scale-free networks. *Physical Review Letters* 92, 178701.
- Cohen, R., Havlin, S. e ben-Avraham, D. (2003). Efficient immunization strategies for computer networks and populations. *Physical Review Letters* 91, 247901.
- Colgate, S. A., Stanley, E. A., Hyman, J. M., Layne, S. P. e Qualls, C. (1989). Risk behavior-based model of the cubic growth of acquired immunodeficiency syndrome in the United States. *PNAS* 86, 4793–4797.
- Viboud, C., Simonsen, L. e Chowell, G. (2016). A generalized-growth model to characterize the early ascending phase of infectious disease outbreaks. *Epidemics* 15, 27–37.
- Pastor-Satorras, R., Castellano, C., Van Mieghem, P. e Vespignani, A. (2015). Epidemic processes in complex networks. *Reviews of Modern Physics* 87, 925–979.
- Santostasi, G. e Perrenod, S. (2026). A Mechanistic Derivation of the Bitcoin Price Power Law: Network Adoption Dynamics and Generalised Metcalfe Scaling. Zenodo. [doi.org/10.5281/zenodo.19387099](https://doi.org/10.5281/zenodo.19387099)
- Pecere, A. (2026). Bitcoin's power-law trend: what the regression identifies, and the four-year oscillation around it. Zenodo. [doi.org/10.5281/zenodo.23933138](https://doi.org/10.5281/zenodo.23933138)
