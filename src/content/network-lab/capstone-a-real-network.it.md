<!-- DRAFT: to be reviewed by Adriano -->

## Una rete, tutte le domande

Questo modulo non aggiunge teoria. Prende una rete vera, gli aeroporti del mondo e le rotte che li uniscono, e le rivolge le domande di tutto il corso, in ordine, con il codice dei moduli da 01 a 13. Ogni passo nomina il suo strumento, dà un numero e dice che cosa quel numero non mostra.

## 1. Che rete è?

I dati vengono dai database di OpenFlights: un elenco di aeroporti e un elenco di rotte com'erano nel giugno 2014, quando il file delle rotte ha smesso di essere aggiornato. È un'istantanea, e vecchia. Tracciamo un collegamento tra due aeroporti quando almeno una compagnia vola tra i due, in un verso o nell'altro; il peso del collegamento è il numero di compagnie che lo fanno. Il peso conta le compagnie: non i voli, non i posti, non i passeggeri. Sono le scelte del [modulo 01](/network-lab/reading-a-network), e metà le ha fatte qualcun altro: chi ha compilato il file ha deciso che cos'è una rotta ([modulo 02](/network-lab/what-are-we-measuring)).

Il risultato ha 3.214 aeroporti e 18.858 collegamenti, in 7 componenti: una di 3.188 aeroporti e sei isole da 2 a 10. Tutto ciò che segue è misurato su quella grande.

```figure
map
```

Guarda i dati grezzi prima di calcolare qualsiasi cosa. Mostra i dieci collegamenti più lunghi: il terzo è Sydney–Dallas, 13.808 km. I primi due sono lunghi 16.082 e 15.937 km, tra aeroporti piccoli, con una sola compagnia. Una scheda del file degli aeroporti porta il nome e le coordinate di un campo d'aviazione in California con la città e il paese di Solwezi, in Zambia. Le sue due rotte, per Lusaka e Ndola, sono vere e brevi; la mappa le disegna attraverso un oceano. Lasciamo la scheda com'è.

## 2. È un piccolo mondo?

Due aeroporti distano in media 3,96 voli, e il clustering medio è 0,49. Rispetto a che cosa? Il modello nullo del modulo 02 conserva il numero di rotte di ogni aeroporto e le ricabla a caso: su dieci ricablature il clustering scende a 0,09. Quindi è un piccolo mondo, con molti più triangoli di quanti i gradi ne spieghino.

Ma le reti ricablate sono ancora più piccole: 3,24 voli contro 3,96. La geografia ha un costo. La maggior parte delle rotte è breve, con un collegamento mediano di 1.155 km, e una ricablatura casuale non paga quel costo. L'abitudine da tenere è il confronto stesso: un numero dice poco finché un modello nullo non dice che cosa darebbe il caso da solo.

## 3. È a invarianza di scala?

La coda è pesante: l'aeroporto mediano ha 3 rotte, il 22,1% ne ha una sola, e il più grande ne ha 248. Se sia una legge di potenza lo decide la ricetta del [modulo 05](/network-lab/heavy-tails-done-right), e la risposta è no. L'esponente stimato si sposta con il taglio inferiore: 1,71 con k_min = 2, 1,80 con 5, 1,90 con 10, 2,14 con 20, 2,40 con 30. Una legge di potenza ha un solo esponente; una deriva così è il segno di una coda che si piega. Il test respinge l'adattamento (p sotto 0,005), e una lognormale e una legge di potenza con taglio si adattano entrambe meglio. Guimerà e colleghi (2005) arrivarono allo stesso verdetto sulla rete aerea del novembre 2000, contata per città: una legge di potenza troncata.

Ciò che un'istantanea non può mostrare è come la rete è cresciuta ([moduli 06](/network-lab/growth-mechanisms) e [07](/network-lab/fitness-and-competition)).

## 4. Chi è centrale?

Per numero di rotte: Amsterdam, Francoforte, Parigi. Per betweenness ([modulo 03](/network-lab/centrality)): Parigi, Los Angeles e Anchorage. Anchorage ha 34 rotte; 283 aeroporti ne hanno di più.

```figure
outliers
```

Grado e betweenness nel complesso concordano (correlazione di rango 0,82), e il 45,8% degli aeroporti non sta tra altri due. Gli aeroporti interessanti sono quelli fuori riga. Guimerà e colleghi trovarono la stessa anomalia nei loro dati, e nominarono Anchorage. Perché sia lì è una domanda per il passo 6.

## 5. Chi si collega a chi?

L'assortatività del [modulo 08](/network-lab/who-connects-to-whom) è r = −0,02, che sembra nessuno schema. Ma le reti ricablate danno −0,10: con hub così grandi, il caso da solo collega gli hub agli aeroporti piccoli. Rispetto a quel riferimento la rete vera è più assortativa del previsto, di più di dieci deviazioni standard. I suoi hub formano un rich club: gli aeroporti con più di 100 rotte sono collegati tra loro circa 1,2 volte più densamente che nelle ricablature, e gli otto più grandi circa 1,3 volte. Colizza e colleghi (2006) trovarono un rich club moderato nel trasporto aereo con la stessa normalizzazione. Un solo numero, r, nascondeva tutto questo.

## 6. Comunità

Louvain ([modulo 09](/network-lab/communities)) dà una modularità vicina a 0,66, e tra 18 e 25 gruppi su dieci esecuzioni: non c'è una risposta sola. I gruppi sono regioni del mondo, e concordano solo in parte con le regioni dei fusi orari del file, con un'informazione mutua normalizzata tra 0,62 e 0,66. Le etichette non sono la verità sui gruppi, e i gruppi non sono la verità sulle etichette (Peel e colleghi 2017).

In nove delle dieci esecuzioni un gruppo è l'Alaska: 131 aeroporti, tutti negli Stati Uniti, con Anchorage come hub. Questo spiega il passo 4. Anchorage non è un grande aeroporto; è l'uscita di una regione. Nella decima esecuzione l'Alaska si divide in più gruppi piccoli, e Anchorage va con Atlanta: lo stesso metodo, un'altra risposta. Chiudi solo quello, e 87 aeroporti restano tagliati fuori dal resto.

## 7. Pesi

La forza di un aeroporto, la somma dei suoi pesi, cresce come il grado elevato a 1,12 ([modulo 10](/network-lab/weights-flows-navigation)). Barrat e colleghi (2004) trovarono 1,5 sugli aeroporti del 2002, con pesi uguali ai posti offerti. Il nostro peso misura peggio il traffico: il 55,6% dei collegamenti ha una sola compagnia, e il peso massimo è 20. Prima di chiedere che cosa dicono i pesi, chiedi che cosa è stato pesato.

## 8. Robusta o fragile?

Togli a caso il 10% degli aeroporti e l'86% della rete è ancora in un pezzo solo ([modulo 11](/network-lab/robustness-and-cascades)). Togli il 10% con più rotte e lo è il 14%. All'inizio la betweenness è l'ordine più tagliente: con il 5% rimosso resta il 59%, contro il 77% per grado. La formula dà una frazione critica di 0,984 per i guasti casuali. Robusta rispetto a che cosa, allora? Agli incidenti, non a un piano.

## 9. Che cosa si diffonde?

Per un germe ([modulo 12](/network-lab/epidemics-on-networks)) la soglia è T_c = 0,016: quasi ogni malattia trasmissibile può viaggiare su questa rete. In una simulazione da Atlanta, il tempo di arrivo in un aeroporto segue la sua distanza in voli (correlazione di rango 0,71) e la sua dimensione (−0,87), e quasi per nulla la distanza in chilometri (0,09). Brockmann e Helbing (2013) mostrarono su epidemie reali che una distanza efficace costruita dal traffico prevede i tempi di arrivo dove la distanza geografica non ci riesce.

Per una moda ([modulo 13](/network-lab/social-contagion-network-effects)) che richiede il 18% dei propri vicini, solo l'1,6% degli aeroporti può avviare una cascata globale, e 2 dei 20 hub più grandi. La stessa rete è aperta a un germe e chiusa a una moda.

## 10. Il metodo

Dieci domande da fare a qualsiasi rete, una per passo.

1. Che cos'è un nodo, che cos'è un collegamento, e chi li ha registrati?
2. Hai guardato i dati grezzi?
3. Rispetto a quale modello nullo?
4. Qual è la distribuzione, prima della media?
5. A quale domanda risponde questa centralità?
6. Che cosa nasconde un solo numero sul mescolamento?
7. Quale metodo ha dato queste comunità, e che cosa darebbe un altro?
8. Che cosa misurano i pesi, e per chi cambiano le cose?
9. Robusta rispetto a che cosa?
10. Quale processo ci gira sopra? Conta quanto la rete.

```box
Le stesse domande per Bitcoin
Bitcoin è più reti insieme ([modulo 01](/network-lab/reading-a-network)): transazioni e indirizzi, la rete peer-to-peer, i canali di pagamento, e le persone che lo possiedono. Il corso ha incontrato ciascuna con uno strumento: le code pesanti e il loro test ([05](/network-lab/heavy-tails-done-right)), i flussi nei canali ([10](/network-lab/weights-flows-navigation)), eclissi e robustezza ([11](/network-lab/robustness-and-cascades)), l'adozione ([12](/network-lab/epidemics-on-networks)), valore e utenti ([13](/network-lab/social-contagion-network-effects), e il [modulo 13 del Complexity Lab](/lab/bitcoin-complex-system)).

Il metodo di questo modulo vale per tutte, e la sua prima riga conta più delle altre. Un indirizzo non è un utente. Un canale pubblico non mostra il suo saldo. Un crawler vede solo i nodi che accettano connessioni.

Il banco di lavoro qui sotto accetta la tua rete: per esempio il grafo dei canali come lo vede il tuo nodo Lightning, l'output di `lncli describegraph`. Nulla esce dal browser.
```

## La fine del corso

Il corso finisce qui. I quattordici moduli sono nell'[indice del Network Lab](/network-lab); il [Complexity Lab](/lab) porta le stesse idee verso la dinamica.

<!-- simulation -->

## Letture consigliate

- OpenFlights. Airport and route databases. https://openflights.org/data (rotte al giugno 2014; Open Database License).
- Guimerà, R., Mossa, S., Turtschi, A. e Amaral, L. A. N. (2005). The worldwide air transportation network: anomalous centrality, community structure, and cities' global roles. *Proceedings of the National Academy of Sciences* 102, 7794–7799.
- Barrat, A., Barthélemy, M., Pastor-Satorras, R. e Vespignani, A. (2004). The architecture of complex weighted networks. *Proceedings of the National Academy of Sciences* 101, 3747–3752.
- Colizza, V., Flammini, A., Serrano, M. Á. e Vespignani, A. (2006). Detecting rich-club ordering in complex networks. *Nature Physics* 2, 110–115.
- Colizza, V., Barrat, A., Barthélemy, M. e Vespignani, A. (2006). The role of the airline transportation network in the prediction and predictability of global epidemics. *Proceedings of the National Academy of Sciences* 103, 2015–2020.
- Brockmann, D. e Helbing, D. (2013). The hidden geometry of complex, network-driven contagion phenomena. *Science* 342, 1337–1342.
- Peel, L., Larremore, D. B. e Clauset, A. (2017). The ground truth about metadata and community detection in networks. *Science Advances* 3, e1602548.
- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press.
- Newman, M. E. J. (2018). *Networks*, 2ª ed. Oxford University Press.
- Latora, V., Nicosia, V. e Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press.
- Easley, D. e Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press.
