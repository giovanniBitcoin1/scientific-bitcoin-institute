<!-- DRAFT: to be reviewed by Adriano -->

## Una mappa fatta chiedendo indicazioni

Alla fine degli anni Novanta nessuno aveva una mappa di Internet, e i ricercatori ne disegnarono una chiedendo indicazioni. Uno strumento chiamato traceroute elenca i router che un pacchetto attraversa per arrivare a destinazione. Lo si lancia da pochi computer verso molte destinazioni, si uniscono i percorsi, e compare una rete. La sua distribuzione dei gradi aveva una coda pesante, con pochi router che tenevano una grossa quota dei collegamenti (Faloutsos, Faloutsos e Faloutsos 1999).

Il risultato era reale; che cosa significasse era meno chiaro. Lakhina e colleghi (2003) applicarono lo stesso procedimento a una rete casuale generata al computer, che di hub non ne ha affatto, e la mappa ottenuta sembrava a coda pesante. Achlioptas e colleghi (una prima volta nel 2005, in forma completa nel 2009) dimostrarono perché. Un insieme di percorsi da una sola sorgente è un albero di cammini minimi, e un albero mostra quasi tutti i collegamenti vicini alla sorgente e pochissimi altrove. I nodi vicini alla sorgente compaiono con quasi tutti i loro collegamenti, quelli lontani con uno o due.

Può ben darsi che Internet abbia una coda pesante. Quella misura, da sola, non poteva stabilirlo. Un insieme di dati su una rete è una misura, e il modo in cui è stata fatta lascia il segno su ogni numero che se ne ricava.

## Tre decisioni prima del primo numero

Il modulo 01 cominciava con una scelta: che cosa rappresentano i nodi e i collegamenti. Per trasformare quella scelta in dati servono altre tre decisioni.

- **Che cosa conta come nodo.** Una persona o una famiglia, un router o un intero provider, un indirizzo o il suo proprietario.
- **Che cosa conta come collegamento.** Due persone che si sono telefonate una volta, o almeno cinque? In una settimana, o in un anno? Quasi sempre un collegamento è una soglia posta su un'intensità, dentro una finestra di tempo.
- **Dove finisce la rete.** Una scuola, una città, una piattaforma. Ogni collegamento che attraversa il confine viene tagliato.

Nessuna di queste domande ha una risposta giusta, ma ciascuna cambia il risultato. Basta spostare la soglia perché gli stessi contatti diano una rete diversa.

```figure
threshold
```

## Quattro modi di sbagliare

Fissate le definizioni, i dati possono ancora allontanarsene in quattro modi.

- **Collegamenti mancanti.** Un'amicizia che nessuno ha menzionato, un'interazione che nessun esperimento ha messo alla prova.
- **Collegamenti spuri.** Un falso positivo in laboratorio, una telefonata a un numero sbagliato.
- **Nodi divisi.** Un autore il cui nome è scritto in due modi diventa due nodi, ciascuno con una parte dei collegamenti.
- **Nodi fusi.** Due persone diverse che si chiamano «M. Rossi» diventano un solo nodo con i collegamenti di entrambe.

Il grafo delle entità del modulo 01, costruito ipotizzando quali indirizzi abbiano lo stesso proprietario, è una rete fatta interamente di decisioni di fusione.

Una coppia che nessuno ha misurato non è una coppia di cui si sa che non è collegata. Quasi tutti i dati registrano i collegamenti trovati e, senza dirlo, trattano tutto il resto come assente.

Gli errori non sono simmetrici. Nella rete small-world della prima simulazione la distanza media è di 6,7 passi. Con un 2% di collegamenti spuri tra coppie a caso scende a 6,0: ognuno è una scorciatoia, come quelle del [modulo 03 del Complexity Lab](/lab/small-worlds). Togliendo invece il 2% dei collegamenti veri sale appena a 6,8. I nodi fusi fanno di peggio: creano hub che non esistono, e ponti tra regioni che non hanno nulla a che fare l'una con l'altra.

Oggi si tende a non trattare più i dati come se fossero la rete. Si scrive un modello della misura, con un tasso di falsi positivi e un tasso di falsi negativi, e a partire da osservazioni ripetute o indipendenti si stima la rete insieme a quei tassi (Butts 2003; Newman 2018). Il risultato è una probabilità per ogni collegamento, non un sì o un no.

## Il campionamento cambia la risposta

Anche senza errori, è raro vedere una rete intera. L'effetto di un campione su un numero dipende da come il campione è stato preso.

**Si conserva ogni nodo con probabilità p, con i collegamenti tra i nodi conservati.** Un collegamento sopravvive solo se sopravvivono entrambi i suoi estremi, quindi il grado medio diventa p⟨k⟩. Un triangolo ha bisogno di tre nodi sopravvissuti, e così una tripla connessa: entrambi si riducono di un fattore p³, e la transitività, che è il loro rapporto, resta in media invariata.

**Si conservano tutti i nodi, e ogni collegamento con probabilità q.** Il grado medio diventa q⟨k⟩. Ma ora una tripla ha due collegamenti e sopravvive con probabilità q², mentre un triangolo ne ha tre e sopravvive con probabilità q³:

```math
T_osservata = q × T_vera
```

Stessa quota conservata, risposta diversa. Un campione con metà dei nodi restituisce la transitività vera; un campione con metà dei collegamenti ne restituisce la metà.

**Campionare è una percolazione.** Togliendo nodi a caso, la grande componente connessa si restringe e poi va in pezzi. Per una rete con una data distribuzione dei gradi questo accade a

```math
p_c = ⟨k⟩ / (⟨k²⟩ − ⟨k⟩)
```

che per una rete casuale vale 1/⟨k⟩. Sotto `p_c` un campione è una polvere di piccoli frammenti, da cui non si può leggere nulla sulle distanze. Gli hub rendono grande ⟨k²⟩ e piccolo `p_c`: una rete con hub resta unita anche con un campionamento più rado.

**La distribuzione dei gradi viene diradata.** Se ogni nodo conserva ciascuno dei suoi collegamenti con probabilità p, a un nodo di grado k ne resta un numero binomiale. Una distribuzione di Poisson resta una Poisson, con media p⟨k⟩: il campione sembra una copia in piccolo della verità. Una legge di potenza no. La coda conserva il suo esponente, ma i gradi piccoli si piegano: con esponente 2,5 e p = 0,2, la pendenza tra i gradi 1 e 2 risulta 3,2. Un campione di una rete a invarianza di scala non ha la stessa forma della rete (Stumpf, Wiuf e May 2005).

```figure
thinning
```

## Seguendo i collegamenti si trovano gli hub

Si scelga un collegamento a caso e si guardi il nodo a uno dei suoi estremi. Un nodo di grado k sta all'estremo di k collegamenti, quindi ha k volte la probabilità di essere trovato in questo modo rispetto a un nodo di grado 1. Il grado medio all'estremo di un collegamento a caso è perciò

```math
⟨k²⟩ / ⟨k⟩ = ⟨k⟩ + varianza / ⟨k⟩
```

che non è mai minore di ⟨k⟩, ed è uguale solo quando tutti i gradi coincidono. I tuoi amici hanno, in media, più amici di te (Feld 1991). Non c'è niente che non va in te: le persone popolari compaiono, per definizione, in molti elenchi di amici.

Quindi ogni metodo che raggiunge i nodi seguendo i collegamenti sovrarappresenta gli hub. Un campione a valanga parte da un seme e ne prende i vicini, poi i vicini dei vicini. Un cammino casuale passa da un nodo a un vicino scelto a caso, e alla lunga visita ogni nodo in proporzione al suo grado. La media semplice dei gradi che incontra converge a ⟨k²⟩/⟨k⟩, non a ⟨k⟩.

Poiché la distorsione è nota, la si può correggere. Pesando ogni visita con 1/k, cioè prendendo la media armonica dei gradi incontrati, la stima converge a ⟨k⟩. È l'idea alla base del respondent-driven sampling, usato per studiare popolazioni di cui non esiste un elenco da cui estrarre (Heckathorn 1997).

La distorsione è anche uno strumento. Christakis e Fowler (2010) seguirono due gruppi di studenti durante un'epidemia di influenza allo Harvard College alla fine del 2009: studenti scelti a caso, e amici indicati da loro. Tra gli amici l'epidemia era in anticipo di circa due settimane (13,9 giorni). E vaccinare un amico a caso di una persona a caso protegge una rete molto meglio che vaccinare la persona a caso (Cohen, Havlin e ben-Avraham 2003): se ne occupa il modulo 12.

## Rispetto a che cosa?

Il club di karate ha transitività 0,26. È tanto? Un numero significa qualcosa solo rispetto a un termine di paragone, e un **modello nullo** è un modo di produrne uno: una famiglia di reti casuali che condividono alcune caratteristiche di quella reale e per il resto sono arbitrarie.

**Modello nullo 1: stessi N e L.** I collegamenti vengono disposti su coppie a caso. La sua transitività è circa la densità, 0,14 per il club di karate: il valore reale è quasi il doppio.

**Modello nullo 2: stessi gradi.** Ogni nodo conserva il suo grado e si randomizza solo il modo in cui i collegamenti sono disposti. Si prendono due collegamenti, a–b e c–d, e se ne scambiano gli estremi per ottenere a–d e c–b; si rifiuta lo scambio se creerebbe un auto-collegamento o un collegamento doppio; si ripete molte volte (Maslov e Sneppen 2002). Un parente stretto, il **modello di configurazione**, taglia in due ogni collegamento e ne ricongiunge gli estremi a caso, ammettendo auto-collegamenti e collegamenti ripetuti (Molloy e Reed 1995).

La distanza tra osservazione e termine di paragone si misura in deviazioni standard del modello nullo:

```math
z = (osservato − media nulla) / deviazione standard nulla
```

Rispetto al secondo modello nullo, la transitività del club di karate non ha più nulla di notevole: la media nulla è 0,22 e z vale circa 1,2. I suoi gradi, i due hub soprattutto, rendono già conto di quasi tutti i suoi triangoli. I gradi da soli spiegano molto. Una rete piccola con pochi hub è perfino costretta a essere disassortativa, perché gli hub non hanno quasi nessuno a cui collegarsi se non nodi di grado basso: con i gradi del club di karate, una rete cablata a caso ha assortatività −0,30.

Anche il modello nullo è una scelta, e con o senza auto-collegamenti, con estremi dei collegamenti etichettati o no, dà termini di paragone diversi (Fosdick et al. 2018). Il modulo 04 lo usa per trovare i motivi.

## Quattro domande

Vanno poste a qualsiasi numero su una rete.

1. Come sono stati definiti i nodi e i collegamenti?
2. Che cosa potrebbe mancare, e che cosa potrebbe essere spurio?
3. Come è stata campionata la rete?
4. Rispetto a che cosa?

## Che cosa viene dopo

Con numeri di cui ci si può fidare, si può porre la prima vera domanda su una rete: chi vi conta. Il modulo 03 è dedicato alla centralità.

<!-- simulation -->

## Letture consigliate

- Newman, M. E. J. (2018). *Networks*, 2ª ed. Oxford University Press. Cap. 9 e 12.
- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Cap. 4.
- Latora, V., Nicosia, V. e Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Cap. 5.
- Faloutsos, M., Faloutsos, P. e Faloutsos, C. (1999). On power-law relationships of the Internet topology. *Computer Communication Review* 29(4), 251–262.
- Lakhina, A., Byers, J. W., Crovella, M. e Xie, P. (2003). Sampling biases in IP topology measurements. *IEEE INFOCOM 2003*, 332–341.
- Achlioptas, D., Clauset, A., Kempe, D. e Moore, C. (2009). On the bias of traceroute sampling. *Journal of the ACM* 56(4), 21.
- Stumpf, M. P. H., Wiuf, C. e May, R. M. (2005). Subnets of scale-free networks are not scale-free. *PNAS* 102, 4221–4224.
- Feld, S. L. (1991). Why your friends have more friends than you do. *American Journal of Sociology* 96, 1464–1477.
- Heckathorn, D. D. (1997). Respondent-driven sampling. *Social Problems* 44, 174–199.
- Christakis, N. A. e Fowler, J. H. (2010). Social network sensors for early detection of contagious outbreaks. *PLoS ONE* 5(9), e12948.
- Cohen, R., Havlin, S. e ben-Avraham, D. (2003). Efficient immunization strategies for computer networks and populations. *Physical Review Letters* 91, 247901.
- Maslov, S. e Sneppen, K. (2002). Specificity and stability in topology of protein networks. *Science* 296, 910–913.
- Molloy, M. e Reed, B. (1995). A critical point for random graphs with a given degree sequence. *Random Structures and Algorithms* 6, 161–180.
- Fosdick, B. K., Larremore, D. B., Nishimura, J. e Ugander, J. (2018). Configuring random graph models with fixed degree sequences. *SIAM Review* 60, 315–355.
- Newman, M. E. J. (2018). Network structure from rich but noisy data. *Nature Physics* 14, 542–545.
- Butts, C. T. (2003). Network inference, error, and informant (in)accuracy. *Social Networks* 25, 103–140.
