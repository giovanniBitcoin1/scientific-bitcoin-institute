<!-- DRAFT: to be reviewed by Adriano -->

## Una catena di conoscenze

Quante strette di mano ti separano da un pescatore in Cile? L'idea che la risposta sia sorprendentemente piccola è più vecchia di internet. Nel 1929 lo scrittore ungherese Frigyes Karinthy pubblicò un racconto, "Catene", in cui un personaggio scommette di poter raggiungere qualsiasi persona sulla Terra attraverso al massimo cinque conoscenti.

Negli anni Sessanta lo psicologo Stanley Milgram trasformò la scommessa in un esperimento. Consegnò delle lettere a volontari del Nebraska e chiese loro di farle arrivare a un agente di borsa nei pressi di Boston che non avevano mai incontrato. Ogni lettera poteva passare soltanto a qualcuno a cui il mittente dava del tu e che sembrava un passo più vicino al destinatario. Nelle catene che arrivarono a destinazione, il numero tipico di intermediari era di circa cinque o sei. L'espressione "sei gradi di separazione" venne dopo, ma il numero nacque qui.

Il risultato va preso con cautela. La maggior parte delle lettere non arrivò mai, e in seguito alcuni critici si chiesero quanto potesse essere generale una conclusione basata su poche decine di catene completate. Eppure, quando Peter Dodds, Roby Muhamad e Duncan Watts ripeterono l'esperimento via e-mail nel 2003, con decine di migliaia di mittenti e destinatari in molti paesi, le catene che arrivarono furono di nuovo brevi, da cinque a sette passi circa.

## Il rompicapo

Perché dovrebbe sorprenderci? Perché il nostro mondo sociale è locale. La maggior parte dei nostri amici vive o lavora vicino a noi, e molti di loro si conoscono tra loro. Se ognuno conosce solo il proprio quartiere, un messaggio deve attraversare il mondo un quartiere alla volta, e la catena dovrebbe essere lunghissima. Invece non lo è.

Due numeri rendono preciso il rompicapo.

- Il **coefficiente di clustering** C. Per un nodo, si considerano tutte le coppie dei suoi vicini e si conta la frazione di coppie che sono a loro volta collegate; in una rete di amicizie, è la probabilità che due tuoi amici si conoscano. C è la media su tutti i nodi.
- La **lunghezza media dei cammini** L: il numero di passi lungo il cammino più breve tra due nodi, in media su tutte le coppie.

## Due estremi

Partiamo da un **reticolo ad anello**: n nodi su un cerchio, ciascuno collegato ai suoi k vicini più prossimi, k/2 per lato. I vicini di un nodo sono vicini anche tra loro, quindi il clustering è alto:

```math
C = 3(k − 2) / (4(k − 1))
```

che tende a 3/4 al crescere di k. Le distanze però sono lunghe: per raggiungere il lato opposto dell'anello si avanza al massimo di k/2 posti a ogni passo, quindi L ≈ n/(2k). Con mille nodi e dieci collegamenti ciascuno, sono circa cinquanta passi.

All'estremo opposto c'è un **grafo casuale** con gli stessi n e k (Modulo 02). Il numero di nodi entro d passi si moltiplica all'incirca per k a ogni passo, quindi tutti vengono raggiunti dopo circa

```math
L ≈ ln n / ln k
```

passi: tre per i nostri mille nodi. Ma due vicini di un nodo sono collegati solo per caso, quindi C ≈ k/n, quasi nulla.

Le reti sociali reali hanno sia un C alto, come il reticolo, sia un L piccolo, come il grafo casuale. Nessuno dei due modelli le descrive.

## Watts e Strogatz: poche scorciatoie

Nel 1998 Duncan Watts e Steven Strogatz proposero un ponte tra i due. Si parte dal reticolo ad anello. Si visita un arco alla volta e, con probabilità p, se ne stacca l'estremo lontano per riattaccarlo a un nodo scelto a caso. Con p = 0 non cambia nulla; con p = 1 quasi ogni arco è casuale.

La sorpresa sta in mezzo. Con appena l'uno per cento circa degli archi ricollegati, L è già sceso quasi al valore del grafo casuale, mentre C è ancora vicino a quello del reticolo. In un ampio intervallo di p si ottengono **reti *small-world*** (letteralmente «mondo piccolo»): raggruppate come un reticolo e corte come un grafo casuale.

La ragione è un'asimmetria. Una sola scorciatoia che unisce due parti lontane dell'anello accorcia in un colpo i cammini di moltissime coppie: chiunque si trovi vicino a un estremo è ora vicino a chiunque si trovi vicino all'altro. Il suo effetto è globale. Il danno al clustering invece è locale: toglie un arco a un vicinato molto unito e scompaiono solo pochi triangoli. Così L crolla molto prima che C se ne accorga.

Trovarono la stessa firma in tre reti reali molto diverse: gli attori cinematografici, collegati quando compaiono nello stesso film, la rete elettrica degli Stati Uniti occidentali e la rete neurale del verme *C. elegans*.

## Misurare i cammini

Come si calcola L? In una rete senza pesi basta la ricerca in ampiezza del Modulo 02: avviata da un nodo, raggiunge gli altri ad anelli di distanza crescente, e l'anello in cui un nodo compare per la prima volta è la sua distanza. Eseguendo la BFS da ogni nodo si ottengono tutti i cammini minimi. Quando gli archi hanno una lunghezza, come i chilometri di una strada, l'algoritmo di Edsger Dijkstra del 1959 generalizza l'idea espandendo sempre il nodo più vicino non ancora sistemato.

Il costo della BFS da tutti i nodi cresce all'incirca come n × (n + numero di archi). Irrilevante per qualche centinaio di nodi, pesante per milioni: le reti grandi si misurano di solito avviando la ricerca da un campione casuale di nodi e facendo la media.

## Che tipo di spiegazione è questa?

Le amicizie di nessuno formano un anello ricollegato. Il modello è volutamente irrealistico, ed è proprio questa la sua forza: isola l'unico ingrediente necessario per avere cammini brevi in un mondo raggruppato. Servono una struttura locale e pochi legami a lungo raggio, nient'altro. Il sociologo Mark Granovetter aveva espresso un'idea affine nel 1973 in "La forza dei legami deboli": i conoscenti occasionali, che frequentano ambienti diversi dai nostri, sono i ponti attraverso cui viaggiano notizie e offerte di lavoro.

C'è una sottigliezza. Che i cammini brevi *esistano* non significa che le persone sappiano *trovarli*. I mittenti di Milgram conoscevano solo i propri contatti. Nel 2000 Jon Kleinberg dimostrò che una ricerca decentralizzata di questo tipo funziona in modo efficiente solo se i legami a lungo raggio seguono una particolare distribuzione delle distanze, né troppo locale né troppo uniforme. Le reti sociali sembrano organizzate più o meno così; un anello ricollegato a caso no.

## Un collegamento con Bitcoin

La rete dei peer di Bitcoin è costruita di proposito per somigliare più a un grafo casuale che a una rete sociale. Quando un nodo sceglie i peer in uscita, li distribuisce su parti diverse dello spazio degli indirizzi IP ed evita di avere più peer in uscita nello stesso gruppo di rete. Lo scopo è la sicurezza: un attaccante che controllasse tutte le connessioni di un nodo potrebbe fornirgli una visione falsa della blockchain. Questo "attacco di eclissi" (*eclipse attack*) è stato descritto da Ethan Heilman, Alison Kendler, Aviv Zohar e Sharon Goldberg nel 2015. Il basso clustering non costa quasi nulla alla rete, perché per diffondere transazioni e blocchi contano i cammini brevi. Con migliaia di nodi e una decina di collegamenti casuali ciascuno, ln n / ln k dà solo una manciata di passaggi tra due nodi qualsiasi, ed è per questo che un nuovo blocco può attraversare l'intera rete in pochi secondi.

<!-- simulation -->

## Che cosa osservare

1. Con p = 0, clicca un nodo e poi quello opposto sull'anello. Quanti passi li separano? Ora imposta p = 0,01 e ripeti con gli stessi due nodi.
2. Nell'esperimento di Watts e Strogatz, trova l'intervallo di p in cui C/C₀ è ancora sopra 0,8 ma L/L₀ è già sotto 0,3. Quante decadi di p copre?
3. Passa a "Ricollega uno alla volta" e premi Avvia. Nel piccolo grafico, scende più in fretta L o C?
4. Perché la prima scorciatoia conta più della centesima? Procedi passo passo nei primi ricollegamenti e guarda L/L₀ dopo ciascuno.
5. Confronta L con p = 1 con il riferimento del grafo casuale ln n / ln k, e C con k/n. Quanto sono vicini, e come cambia l'accordo con n?
6. Guarda il grafico dei "gradi di separazione" con p = 0 e con p = 0,05. Come cambia la forma della distribuzione, e non solo la sua media?

## Letture consigliate

- S. Milgram, "The small world problem", *Psychology Today* 1 (1967) 61–67.
- J. Travers e S. Milgram, "An experimental study of the small world problem", *Sociometry* 32 (1969) 425–443.
- M. Granovetter, "The strength of weak ties", *American Journal of Sociology* 78 (1973) 1360–1380.
- D. J. Watts e S. H. Strogatz, "Collective dynamics of 'small-world' networks", *Nature* 393 (1998) 440–442.
- J. Kleinberg, "Navigation in a small world", *Nature* 406 (2000) 845.
- P. S. Dodds, R. Muhamad e D. J. Watts, "An experimental study of search in global social networks", *Science* 301 (2003) 827–829.
- E. Heilman, A. Kendler, A. Zohar e S. Goldberg, "Eclipse attacks on Bitcoin's peer-to-peer network", *USENIX Security Symposium* (2015).
