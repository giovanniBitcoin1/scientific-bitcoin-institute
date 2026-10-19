<!-- DRAFT: to be reviewed by Adriano -->

## Storni sopra Roma

Nelle sere d'inverno, prima di posarsi per la notte, stormi di decine di migliaia di storni volteggiano sopra Roma. La nuvola si addensa, si assottiglia, si ripiega su se stessa e cambia direzione in una frazione di secondo, e nessun uccello la guida.

Negli anni Duemila un gruppo di fisici romani guidato da Giorgio Parisi, con Andrea Cavagna e Irene Giardina, decise di misurarla. Nel progetto STARFLAG piazzarono telecamere sincronizzate sul tetto di Palazzo Massimo, una delle sedi del Museo Nazionale Romano vicino alla stazione Termini, a due passi da uno dei grandi dormitori di storni della città, e filmarono gli stormi in stereo, poi ricostruirono la posizione di ogni uccello in tre dimensioni, migliaia alla volta. Nel 2021 Parisi ha ricevuto il premio Nobel per la fisica per i suoi studi su come disordine e fluttuazioni plasmano i sistemi fisici complessi.

## Che cosa hanno mostrato gli storni

Due risultati spiccano. Il primo riguarda *chi* segue uno storno. In uno stormo che si fa più denso o più rado, un uccello non tiene d'occhio tutti quelli entro una distanza fissa. Segue un numero fisso di vicini più prossimi, circa sei o sette, a qualunque distanza si trovino (Ballerini e colleghi, 2008). I fisici la chiamano interazione **topologica**, in contrapposizione a una **metrica**. Conta per la coesione: quando lo stormo si allunga, una regola metrica lascerebbe gli uccelli ai bordi senza nessuno a portata, mentre una regola topologica tiene ogni uccello legato al gruppo.

Il secondo riguarda fin dove viaggia l'informazione. Guarda di quanto la velocità di ogni uccello si discosta dalla media dello stormo: queste fluttuazioni risultano correlate attraverso tutto lo stormo, qualunque sia la sua dimensione (Cavagna e colleghi, 2010). Queste **correlazioni a invarianza di scala** sono il segno di un sistema che si trova vicino a un punto critico, il tema del Modulo 08. Sono ciò che permette a una virata iniziata da pochi uccelli di propagarsi a migliaia quasi all'istante, come quando attacca un falco.

## I boid

Nel 1987 il ricercatore di grafica computerizzata Craig Reynolds voleva animare degli stormi senza programmare ogni singolo uccello. I suoi "boid" seguono tre regole locali:

1. **separazione**: non affollare i vicini;
2. **allineamento**: orientati verso la loro direzione media;
3. **coesione**: dirigiti verso la loro posizione media.

Ogni boid vede solo i boid vicini, non c'è un capo né un piano globale, eppure il risultato sembra sorprendentemente vivo: gli stormi si formano, si dividono attorno agli ostacoli e si ricompongono. I boid sono diventati il capostipite delle animazioni di folle e sciami usate nei film e nei videogiochi.

## Il modello minimo del fisico

Le regole di Reynolds erano pensate per sembrare giuste. Nel 1995 Tamás Vicsek e colleghi si posero una domanda da fisici: qual è il minimo indispensabile per un moto collettivo? La loro risposta tenne solo l'allineamento e aggiunse rumore. Le particelle si muovono a velocità costante. A ogni passo ognuna adotta la direzione media delle particelle entro un raggio r, poi vira di un angolo casuale preso in un intervallo di ampiezza η.

Per misurare l'ordine usarono il **parametro d'ordine**

```math
φ = |velocità media| / velocità
```

Se tutti volano nella stessa direzione, φ = 1. Se le direzioni sono casuali, φ è vicino a 0; per N particelle vale circa 1/√N, l'ampiezza di una fluttuazione casuale. Quando il rumore cala o la densità cresce, φ sale da quasi 0 a quasi 1. È una **transizione di fase**, come un magnete che si ordina raffreddandosi, ma in un sistema sempre in movimento e alimentato di continuo con energia, lontano dall'equilibrio.

La differenza si è rivelata profonda. John Toner e Yuhai Tu hanno mostrato nel 1995 che questa "materia attiva" può avere un vero ordine a lungo raggio in due dimensioni. Un sistema piano all'equilibrio, fatto di spin che possono puntare in qualunque direzione, non può: le fluttuazioni termiche distruggono sempre l'ordine sulle grandi distanze. Le particelle autopropulse sfuggono a questo limite perché muovendosi trasportano informazione attraverso il gruppo. Muoversi cambia le regole.

## Banchi di pesci e decisioni

I banchi di pesci aggiungono altra struttura. Iain Couzin e colleghi hanno modellato ogni pesce con tre zone concentriche: repulsione da vicino, orientamento più in là, attrazione oltre (2002). Cambiando le dimensioni delle zone, il gruppo passa da uno **sciame** disordinato a un **mulinello** che ruota attorno a un centro vuoto, fino al moto **parallelo**: gli stessi tre schemi che mostrano i banchi veri. Il gruppo può anche conservare una "memoria" della sua forma recente.

Nel 2005 Couzin e colleghi si sono chiesti come un gruppo in movimento decide dove andare. Una piccola minoranza di individui informati, ognuno con una direzione preferita, può guidare tutto il gruppo, e più il gruppo è grande, minore è la quota di informati che gli serve. Nessuno deve sapere chi sono gli informati, e nessuno deve segnalare nulla: l'influenza si propaga attraverso il normale allineamento.

## Formiche e stigmergia

Le formiche si coordinano attraverso ciò che lasciano dietro di sé. Nel 1959 lo zoologo francese Pierre-Paul Grassé, studiando come le termiti ricostruiscono il nido, coniò la parola **stigmergia** per la coordinazione attraverso tracce lasciate in un ambiente condiviso invece che attraverso una comunicazione diretta. Una termite risponde alla struttura costruita fin lì, e il suo lavoro cambia la struttura che troverà la termite successiva.

Le piste di feromone sono l'esempio classico. Nel 1989 Simon Goss, Jean-Louis Deneubourg e colleghi offrirono a formiche argentine due ponti di lunghezza diversa tra il nido e una fonte di cibo. Le colonie convergevano presto su quello più corto. Nessuna formica confronta le lunghezze. Le formiche che per caso prendono il percorso corto tornano prima, così lì il feromone si accumula più in fretta, e altre formiche lo scelgono: **retroazione positiva**. L'evaporazione fa da **retroazione negativa**, cancellando lentamente le piste che non vengono più usate. Quando il ponte corto veniva offerto solo dopo che la colonia si era stabilita su quello lungo, le formiche per lo più restavano dov'erano: la pista era diventata un'abitudine.

Marco Dorigo, al Politecnico di Milano all'inizio degli anni Novanta, ne ha tratto l'**ottimizzazione a colonia di formiche**: formiche artificiali depongono feromone artificiale sui lati di un grafo, e i percorsi buoni emergono, per problemi come quello del commesso viaggiatore o l'instradamento del traffico nelle reti.

## Che cosa hanno in comune

Storni, boid, pesci e formiche hanno gli stessi ingredienti: molti agenti semplici; solo informazione locale; retroazione, positiva per amplificare un piccolo vantaggio e negativa per mantenere la stabilità; e nessun capo. Quest'ultimo punto è un punto di forza. Uno stormo con un capo fallisce quando il capo sbaglia. Uno stormo in cui ogni uccello segue i suoi vicini continua a funzionare quando ne perde qualcuno, e si adatta all'istante, perché la decisione viene presa ovunque nello stesso momento.

## Un collegamento con Bitcoin

Per analogia, i miner di Bitcoin si coordinano in modo stigmergico. Non trattano tra loro su quale storia sia quella giusta. Ognuno estende semplicemente la catena valida con più lavoro accumulato, una traccia condivisa che ogni nuovo blocco rafforza. I blocchi sui rami che perdono la corsa vengono abbandonati, come una pista che nessuno percorre più ed evapora.

Anche la rete ha un lato topologico. Uno storno segue un numero fisso di vicini a qualunque distanza; un nodo Bitcoin mantiene un numero fisso e piccolo di peer in uscita, ovunque si trovino sul pianeta (Modulo 02). In Bitcoin Core sono otto connessioni che inoltrano transazioni e blocchi più due che inoltrano solo blocchi. La rete è organizzata dai collegamenti, non dalla geografia.

<!-- simulation -->

## Che cosa osservare

1. Nel pannello A, metti a zero l'allineamento. Che cosa succede al parametro d'ordine φ e al numero di gruppi?
2. Attiva il predatore con vicini metrici, poi passa a quelli topologici. Quale stormo resta unito quando il predatore lo allunga, e che cosa dice il numero di gruppi?
3. Con vicini topologici, abbassa k a 1 o 2. Lo stormo resta ancora unito?
4. Nell'esperimento di Vicsek, dove cala φ, e il calo diventa più netto con più particelle? A η = 2π, confronta φ con la linea tratteggiata.
5. Nel doppio ponte, metti il rapporto di lunghezza a 1. Le formiche scelgono ancora un ramo, e quale? Ora mettilo a 2 e fai evolvere molte colonie.
6. Abbassa l'evaporazione a zero e apri tardi il ramo corto. Le formiche lo trovano? Alza l'evaporazione a 0,05 e riprova.

## Letture consigliate

- C. W. Reynolds, "Flocks, herds and schools: a distributed behavioral model", *Computer Graphics* 21(4) (1987) 25–34.
- P.-P. Grassé, "La reconstruction du nid et les coordinations interindividuelles chez *Bellicositermes natalensis* et *Cubitermes* sp.", *Insectes Sociaux* 6 (1959) 41–80.
- S. Goss, S. Aron, J.-L. Deneubourg & J. M. Pasteels, "Self-organized shortcuts in the Argentine ant", *Naturwissenschaften* 76 (1989) 579–581.
- T. Vicsek et al., "Novel type of phase transition in a system of self-driven particles", *Physical Review Letters* 75 (1995) 1226–1229.
- J. Toner & Y. Tu, "Long-range order in a two-dimensional dynamical XY model: how birds fly together", *Physical Review Letters* 75 (1995) 4326–4329.
- M. Dorigo, V. Maniezzo & A. Colorni, "Ant system: optimization by a colony of cooperating agents", *IEEE Transactions on Systems, Man, and Cybernetics B* 26 (1996) 29–41.
- I. D. Couzin et al., "Collective memory and spatial sorting in animal groups", *Journal of Theoretical Biology* 218 (2002) 1–11.
- I. D. Couzin et al., "Effective leadership and decision-making in animal groups on the move", *Nature* 433 (2005) 513–516.
- M. Ballerini et al., "Interaction ruling animal collective behavior depends on topological rather than metric distance", *Proceedings of the National Academy of Sciences* 105 (2008) 1232–1237.
- A. Cavagna et al., "Scale-free correlations in starling flocks", *Proceedings of the National Academy of Sciences* 107 (2010) 11865–11870.
- T. Vicsek & A. Zafeiris, "Collective motion", *Physics Reports* 517 (2012) 71–140.
