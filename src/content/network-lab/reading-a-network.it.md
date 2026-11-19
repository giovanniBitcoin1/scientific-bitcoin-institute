<!-- DRAFT: to be reviewed by Adriano -->

## Sette ponti

Nel 1736 Königsberg, in Prussia, si estendeva su quattro zone di terra: le due rive del fiume Pregel e due isole, unite da sette ponti. Esisteva una passeggiata per la città che attraversasse ogni ponte esattamente una volta? Nessuno l'aveva trovata, e nessuno sapeva dire perché.

Leonhard Euler risolse la questione buttando via quasi tutto. La lunghezza dei ponti, la forma delle isole, il percorso sulla terraferma: niente di tutto questo conta, solo quali zone unisce ciascun ponte. Si disegna un punto per ogni zona e una linea per ogni ponte, e la città diventa quattro punti e sette linee.

Una passeggiata che passa per una zona usa due ponti, uno per arrivare e uno per ripartire. Quindi ogni zona deve toccare un numero pari di ponti, tranne al più le due in cui la passeggiata comincia e finisce: la passeggiata esiste solo se la rete è in un unico pezzo e ha zero o due punti con un numero dispari di linee. Königsberg ne aveva quattro, con 5, 3, 3 e 3 ponti. La passeggiata è impossibile.

Oggi la città si chiama Kaliningrad, e sui vecchi siti restano cinque ponti. I conteggi sono 2, 2, 3 e 3: due dispari, quindi oggi la passeggiata esiste, ma deve partire da un'isola e finire sull'altra. Una domanda su una città era diventata una domanda su un grafo.

## Nodi e collegamenti sono una scelta

Una **rete**, o grafo, è un insieme di **nodi** uniti da **collegamenti**. Indichiamo con N il numero di nodi e con L il numero di collegamenti. I collegamenti possono essere **non orientati**, come un ponte o una stretta di mano, oppure **orientati**, come un link ipertestuale o un pagamento.

Il primo passo di Euler è quello che si nota di meno: scelse che cosa fossero i nodi e che cosa i collegamenti. Il sistema non impone mai questa scelta: si può disegnare come più reti, che rispondono a domande diverse. Prima di leggere un numero su una rete, conviene chiedersi che cosa rappresentano i suoi nodi e i suoi collegamenti.

```box
Un sistema, più reti
Bitcoin è almeno cinque reti. La **rete peer-to-peer**: i computer e le connessioni tra loro (per impostazione predefinita Bitcoin Core apre 8 connessioni in uscita complete e 2 riservate ai soli blocchi). Il **grafo delle transazioni**: le transazioni, con un collegamento orientato ogni volta che un output dell'una viene speso come input di un'altra; nulla può essere speso prima di esistere, quindi non ha cicli. Il **grafo degli indirizzi**: gli indirizzi, uniti da pagamenti orientati e pesati. Il **grafo delle entità**: gli indirizzi raggruppati con euristiche in presunti proprietari, il che ne fa un'inferenza, non un'osservazione. La **Lightning Network**: nodi uniti da canali di pagamento, con le capacità come pesi. Un'affermazione sulla «rete Bitcoin» dice poco finché non sappiamo di quale si parla.
```

## Il grado

Il **grado** `k_i` del nodo i è il numero dei suoi collegamenti. Ogni collegamento ha due estremi, quindi sommando tutti i gradi ogni collegamento viene contato due volte:

```math
k_1 + k_2 + … + k_N = 2L      quindi      ⟨k⟩ = 2L / N
```

dove ⟨k⟩ è il **grado medio**. Una conseguenza è immediata: la somma dei gradi è pari, quindi il numero di nodi di grado dispari è sempre pari. Il conteggio di Euler poteva dare zero, due o quattro zone dispari, mai una o tre.

In una rete orientata ogni nodo ha un **grado entrante** `k_in`, i collegamenti in arrivo, e un **grado uscente** `k_out`, quelli in partenza. Ogni collegamento parte da un nodo e arriva a un nodo, quindi le due medie coincidono: `⟨k_in⟩ = ⟨k_out⟩ = L/N`.

La media nasconde quasi tutta la storia: la **distribuzione dei gradi** `p_k`, la frazione di nodi che hanno grado k, può essere stretta o avere una lunga coda di hub.

## Tre modi di scrivere una rete

Un disegno va bene per l'occhio ed è inutile per un computer. Ci sono tre modi standard di memorizzare una rete.

- La **matrice di adiacenza** A è una tabella N × N con `A_ij = 1` se i e j sono collegati e 0 altrimenti. Per una rete non orientata è simmetrica, e la riga i ha somma `k_i`. Comoda per la matematica, ma quasi tutti i suoi N² elementi sono nulli.
- La **lista dei collegamenti** è l'elenco delle L coppie collegate: la forma compatta in cui di solito vengono pubblicati i dati.
- La **lista di adiacenza** dà, per ogni nodo, l'elenco dei suoi vicini: è quella che usano gli algoritmi, perché i vicini di i si trovano senza dover cercare.

```figure
three-ways
```

## Sparse

Con N nodi, il massimo numero possibile di collegamenti è uno per ogni coppia:

```math
L_max = N(N − 1) / 2
```

La **densità** di una rete è la frazione di essi che esiste davvero:

```math
densità = L / L_max = ⟨k⟩ / (N − 1)
```

Le reti reali sono **sparse**: hanno una frazione minuscola dei collegamenti che potrebbero avere.

| Rete | N | L | ⟨k⟩ | Densità |
|---|---|---|---|---|
| Famiglie fiorentine (matrimoni) | 15 | 20 | 2,67 | 0,19 |
| Club di karate di Zachary | 34 | 78 | 4,59 | 0,14 |
| Rete neurale di *C. elegans* | 282 | ≈ 1.970 | 14 | 0,050 |
| Rete elettrica degli USA occidentali | 4.941 | ≈ 6.600 | 2,67 | 5,4 × 10⁻⁴ |
| Attori cinematografici | 225.226 | ≈ 6,87 milioni | 61 | 2,7 × 10⁻⁴ |

*Per le ultime tre, N e ⟨k⟩ sono quelli riportati da Watts e Strogatz (1998), e L è N⟨k⟩/2.*

Il motivo è che il grado è limitato da qualcosa di locale: il tempo che una persona ha per gli amici, il costo di una linea elettrica. Quando una rete cresce, ⟨k⟩ resta più o meno dov'era e la densità scende come 1/N. Le famiglie fiorentine e la rete elettrica hanno lo stesso grado medio, 2,67, eppure le loro densità differiscono di un fattore 350 circa. La densità misura soprattutto la dimensione. Per confrontare reti di dimensioni diverse si confronta ⟨k⟩.

```box
Collegamenti potenziali e collegamenti reali
La legge di Metcalfe valuta una rete in base ai collegamenti che potrebbe avere, N(N − 1)/2, che crescono come N². I collegamenti che una rete reale ha davvero crescono all'incirca come N. Questo scarto è una delle ragioni per cui N² viene di solito letto come un limite superiore al valore di una rete e non come una sua stima; Briscoe, Odlyzko e Tilly hanno sostenuto che N log N è più vicino al vero.
```

```figure
sparse
```

## Cammini e distanza

Un **cammino** è una sequenza di nodi in cui ciascuno è collegato al successivo; la sua lunghezza è il numero di collegamenti che usa. Un **cammino minimo** tra due nodi è un cammino della minima lunghezza possibile, e quella lunghezza è la loro **distanza** d.

Le distanze si trovano con la **ricerca in ampiezza**: si marcano i vicini di un nodo di partenza con distanza 1, i loro vicini non ancora marcati con distanza 2, e così via. La ricerca si allarga come un fronte d'onda, e il passo in cui il fronte raggiunge un nodo è la sua distanza.

Due numeri riassumono le distanze di un'intera rete: il **diametro**, cioè la massima distanza tra due nodi, e la **distanza media** ⟨d⟩ su tutte le coppie. Il fatto che ⟨d⟩ sia sorprendentemente piccola nella maggior parte delle reti reali è la proprietà *small-world*, argomento del [modulo 03 del Complexity Lab](/lab/small-worlds).

Il fronte può fermarsi prima di aver raggiunto tutti. I nodi che raggiunge formano la **componente** del nodo di partenza, e una rete con una sola componente è **connessa**. Due nodi in componenti diverse non hanno alcun cammino che li unisca e la loro distanza è infinita: per questo diametro e distanza media si riportano di norma per la **componente più grande**.

In una rete orientata un cammino deve seguire le frecce, quindi un cammino da i a j può esistere anche quando nessuno riporta indietro. Un insieme di nodi è **fortemente connesso** se ogni nodo può raggiungere ogni altro seguendo le frecce, e **debolmente connesso** se questo è vero solo ignorando le direzioni.

## Triangoli

Se due tuoi amici sono amici tra loro, voi tre formate un triangolo. Il **coefficiente di clustering locale** misura quanto spesso questo accade intorno a un nodo. Se il nodo i ha `k_i` vicini, le coppie di vicini sono `k_i(k_i − 1)/2`; se `e_i` di queste coppie sono collegate,

```math
C_i = 2 e_i / (k_i (k_i − 1))
```

Va da 0 a 1. Ci sono due modi di ricavarne un solo numero per l'intera rete. Il **clustering medio** ⟨C⟩ è la media di `C_i` sui nodi. La **transitività** conta invece sull'intera rete in una volta:

```math
T = 3 × (numero di triangoli) / (numero di triple connesse)
```

dove una tripla connessa è un nodo insieme a due dei suoi vicini. Il fattore 3 c'è perché ogni triangolo contiene tre triple.

Le due misure rispondono a domande diverse. ⟨C⟩ dà un voto a ogni nodo; T dà un voto a ogni tripla, e la maggior parte delle triple appartiene agli hub. Prendiamo una «girandola»: n triangoli che condividono un nodo centrale. Ciascuno dei 2n nodi esterni ha due vicini, collegati tra loro, quindi il suo `C_i` vale 1. L'hub ha 2n vicini e soltanto n collegamenti tra di essi. Allora

```math
⟨C⟩ = (2n + 1/(2n − 1)) / (2n + 1) → 1          T = 3 / (2n + 1) → 0
```

La stessa rete ha un clustering quasi perfetto secondo una misura e quasi nullo secondo l'altra. Quando un articolo riporta «il coefficiente di clustering», conviene controllare di quale si tratta.

## Pesi e due tipi di nodi

Spesso i collegamenti non sono tutti uguali: una strada ha una lunghezza, un'amicizia una frequenza di contatti. In una rete **pesata** ogni collegamento porta un numero `w_ij`, e la **forza** di un nodo è la somma dei pesi dei suoi collegamenti, `s_i = Σ_j w_ij`.

Molte reti hanno due tipi di nodi, con collegamenti solo tra un tipo e l'altro: gli articoli e i loro autori, i film e i loro attori, le transazioni e gli indirizzi che coinvolgono. Sono reti **bipartite**. Spesso al loro posto si studia una **proiezione**: si tiene un solo tipo di nodi e se ne collegano due ogni volta che hanno in comune un vicino dell'altro tipo, con un peso pari al numero di vicini in comune.

Le proiezioni sono comode, e perdono informazione. Un articolo con d autori diventa d(d − 1)/2 collegamenti: cento autori ne producono 4.950. E una proiezione non si può invertire: un triangolo di tre autori può essere un articolo scritto da tutti e tre, oppure tre articoli scritti a coppie.

## Che cosa viene dopo

Questi numeri sono l'alfabeto della scienza delle reti, e il resto del corso è scritto con queste lettere. Ma un numero calcolato su una rete è una misura, e le misure possono ingannare. Il Modulo 02 si chiede quando ci si può fidare.

<!-- simulation -->

## Letture consigliate

- Euler, L. (1741). Solutio problematis ad geometriam situs pertinentis. *Commentarii Academiae Scientiarum Petropolitanae* 8, 128–140.
- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Cap. 2.
- Newman, M. E. J. (2018). *Networks*, 2ª ed. Oxford University Press. Cap. 6.
- Latora, V., Nicosia, V. e Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Cap. 1.
- Easley, D. e Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Cap. 2.
- Watts, D. J. e Strogatz, S. H. (1998). Collective dynamics of "small-world" networks. *Nature* 393, 440–442.
- Zachary, W. W. (1977). An information flow model for conflict and fission in small groups. *Journal of Anthropological Research* 33, 452–473.
- Padgett, J. F. e Ansell, C. K. (1993). Robust action and the rise of the Medici, 1400–1434. *American Journal of Sociology* 98, 1259–1319.
- Briscoe, B., Odlyzko, A. e Tilly, B. (2006). Metcalfe's law is wrong. *IEEE Spectrum* 43(7), 34–39.
