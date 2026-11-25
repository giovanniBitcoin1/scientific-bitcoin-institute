<!-- DRAFT: to be reviewed by Adriano -->

## Chi hai accanto

Nei giochi dei moduli dall'01 all'08 tutti incontravano tutti, o almeno condividevano le stesse strade. Quasi nessuno vive così. Una ricercatrice lavora con pochi coautori, un agricoltore si fa prestare gli attrezzi dalle cascine vicine, un negozio guarda i negozi della sua via. Ogni giocatore incontra solo i suoi **vicini**, e la forma della rete decide molto di ciò che succede.

Michael Kearns, Michael Littman e Satinder Singh (2001) proposero il modello che oggi si chiama dei **giochi grafici**: i giocatori stanno sui nodi di una rete e il *payoff* di ciascuno dipende solo dalla sua scelta e da quelle dei suoi vicini. Sono i **giochi su reti**, e la rete non è un ornamento: dice chi può influire su chi.

Ecco la versione più semplice, che il modulo usa dall'inizio alla fine. Ogni giocatore i sceglie uno sforzo x_i ≥ 0. Sia g_ij = 1 se i e j sono vicini e 0 altrimenti. Il suo payoff è

```math
u_i = x_i − x_i²/2 + δ x_i Σ_j g_ij x_j
```

I primi due termini sono ciò che ricava dal proprio sforzo: un rendimento di 1 per unità, a un costo che cresce con il quadrato. L'ultimo è l'interazione. Annullando la derivata, e ricordando che lo sforzo non può essere negativo, si ottiene la sua miglior risposta:

```math
x_i = max(0, 1 + δ Σ_j g_ij x_j)
```

Con δ > 0 gli sforzi sono **complementi strategici**: più fanno i miei vicini, più voglio fare io, come quando si studia con amici che studiano. Con δ < 0 sono **sostituti strategici**: più fanno i miei vicini, meno serve che faccia io, come quando il cane del vicino fa già la guardia alla strada.

Prendiamo una stella: un *hub* con quattro foglie. Con i complementi l'hub ha quattro vicini che lo spingono in su e ogni foglia uno solo, quindi l'hub lavora più di tutti. Risolvendo le due migliori risposte, l'hub lavora (1 + 4δ)/(1 − 4δ²) e ogni foglia (1 + δ)/(1 − 4δ²): con δ = 0,25, 8/3 contro 5/3. Con i sostituti l'ordine si rovescia. L'hub sente gli sforzi di quattro vicini e riduce il suo più di tutti; da δ = −0,25 in giù non fa nulla, e ogni foglia, senza il suo aiuto, lavora 1. È la posizione, non il talento o i gusti, a decidere chi lavora. La Figura F1 permette di muovere δ e di guardare gli sforzi cambiare; vicino a δ = ±0,5 le formule esplodono, e la figura si ferma poco prima.

```figure
star
```

## Chi fa il lavoro?

Portiamo i sostituti al limite, δ = −1: il proprio sforzo e quello dei vicini sono sostituti perfetti:

```math
x_i = max(0, 1 − Σ_j g_ij x_j)
```

È un modello di **beni pubblici locali** lungo i collegamenti della rete (Yann Bramoullé e Rachel Kranton 2007): l'informazione raccolta da uno è condivisa con chi gli sta accanto, un attrezzo comprato da uno è prestato ai vicini. Un giocatore è soddisfatto appena lo sforzo totale nel suo vicinato, il suo compreso, arriva a 1.

Tra gli equilibri, i più semplici sono **specializzati**: alcuni giocatori lavorano 1 e gli altri nulla. Perché sia un equilibrio, due che lavorano non possono essere vicini (ciascuno vorrebbe smettere), e chi non lavora deve avere un vicino che lavora (altrimenti vorrebbe cominciare). Nel linguaggio della teoria dei grafi, chi lavora forma un **insieme indipendente massimale**: nessuna coppia collegata, e nessun altro può entrare senza rompere questa proprietà. Di solito una rete ha molti insiemi così, e quindi molti equilibri, con totali molto diversi.

Non tutti resistono a una piccola scossa. Bramoullé e Kranton mostrano che un equilibrio specializzato è stabile quando ogni giocatore che non lavora ha almeno due vicini che lavorano. La ragione è semplice: se lo sforzo di chi lavora cala un poco, chi non lavora e ha solo quel vicino che lavora ha un motivo per cominciare, e il profilo si allontana; con due, l'altro lo copre ancora. Su una stella di sei l'hub che lavora da solo, per un totale di 1, è un equilibrio, ma ogni foglia conta solo su di lui. Quello stabile ha le cinque foglie che lavorano e l'hub che si appoggia a loro: un totale di 5. Il Pannello A elenca tutti gli equilibri specializzati di quattro piccole reti e fa partire le migliori risposte da punti casuali.

Con sostituti più deboli l'equilibrio può essere uno solo. Bramoullé, Kranton e Martin D'Amours (2014) mostrarono che è unico quando |δ| è minore di 1/|λ_min|, dove λ_min è l'autovalore più piccolo della matrice di adiacenza della rete. La stella di F1 ha λ_min = −2: per questo il suo equilibrio è unico su tutto il cursore.

## Il giocatore chiave

Ora i complementi. Coralio Ballester, Antoni Calvó-Armengol e Yves Zenou (2006) mostrarono che quando δ è minore di 1/λ_max, λ_max l'autovalore più grande, l'equilibrio è unico e

```math
x = (I − δG)^(−1) 1
```

Sviluppiamo l'inversa come 1 + δG + δ²G² + …: G^k conta i cammini di lunghezza k, quindi lo sforzo di ogni giocatore conta i cammini che partono da lui, quelli di lunghezza k pesati con δ^k. È la sua **centralità di Katz–Bonacich**, la centralità di Katz che il Network Lab ha misurato nel suo [modulo 03](/network-lab/centrality). In questo gioco la centralità non è solo una descrizione: è quanto si lavora.

Quale giocatore, tolto, farebbe calare di più lo sforzo totale? Togliere il giocatore i porta via il suo sforzo e quello che stimolava negli altri. Ballester e coautori trovarono la risposta esatta: lo sforzo totale cala di

```math
b_i² / m_ii
```

dove b_i è la sua centralità e m_ii l'i-esimo elemento della diagonale di (I − δG)^(−1); la chiamarono la sua **intercentralità**. Il **giocatore chiave** (*key player*), quello con l'intercentralità più alta, non è per forza il più attivo. Nella rete a ponte del Pannello B, con δ = 0,3, il più attivo è il giocatore 1 nel triangolo, con 4,1655; ma il giocatore chiave è il 4, il ponte tra il triangolo e il resto, la cui uscita fa calare lo sforzo totale di 11,3988 contro 10,9163 per il giocatore 1. Lo sforzo del giocatore 1 è gonfiato dai cammini del triangolo che tornano a lui; il giocatore 4 tiene insieme la rete. Il *working paper* da cui nacque l'articolo parlava di reti criminali: se la polizia può togliere una sola persona, chi dovrebbe scegliere?

## Coordinarsi su una rete

Quando ogni collegamento è un gioco di coordinamento, la domanda cambia: non quanto fare, ma quale opzione usare. Stephen Morris (2000) mostrò che una nuova opzione si diffonde in tutta la rete solo se, a ogni passo, chi non è ancora passato ha abbastanza vicini che lo hanno già fatto. Il [modulo 13](/network-lab/social-contagion-network-effects) del Network Lab fa girare queste cascate; qui non le ripetiamo.

## Costruire la rete

Finora la rete era data. Chi la costruirebbe? Matthew Jackson e Asher Wolinsky (1996) proposero il **modello delle connessioni** (*connections model*), il primo modello di **formazione strategica delle reti**. Ogni collegamento costa c a ciascuno dei suoi due estremi. Un giocatore riceve δ^d da ogni altro giocatore a distanza d, con 0 < δ < 1: gli amici valgono δ, gli amici degli amici δ², e così via. La rete è **stabile a coppie** (*pairwise stability*) se nessun giocatore guadagna tagliando uno dei suoi collegamenti, e nessuna coppia di giocatori guadagnerebbe, entrambi e almeno uno strettamente, aggiungendo un collegamento tra loro.

Quale rete ha il totale più grande? La **rete efficiente** è quella completa quando c < δ − δ²: un collegamento diretto vale più della distanza 2 che sostituisce. È la stella quando δ − δ² < c < δ + (n − 2)δ²/2: la stella collega tutti a distanza al più 2 con il minor numero di collegamenti. Sopra, è quella vuota.

Quali reti sono stabili a coppie? Quando c < δ − δ² la rete completa è l'unica: due giocatori non collegati guadagnerebbero collegandosi. Quando δ − δ² < c < δ la stella è stabile, ma non è l'unica rete stabile. Quando c > δ nessuna rete stabile ha un giocatore con un solo collegamento: il suo partner da quel collegamento riceve solo δ e paga c. La rete vuota è allora stabile.

Quindi tra δ e δ + (n − 2)δ²/2 la rete efficiente, la stella, non è stabile. Il suo hub paga c per ogni foglia e riceve in cambio solo δ, il valore di quella foglia; il guadagno della foglia, che attraverso l'hub raggiunge tutti, è molto più grande, ma in questo modello non può pagare l'hub perché tenga il collegamento. La Figura F2 disegna le quattro regioni.

```figure
formation
```

Jackson e Alison Watts (2002) fecero aggiungere e tagliare i collegamenti una coppia alla volta, scelta a caso, e si chiesero dove finisce il processo: il Pannello C lo fa girare. Venkatesh Bala e Sanjeev Goyal (2000) lasciarono che un solo giocatore pagasse un collegamento da sé, come una telefonata che paga una sola delle due parti; nel loro modello una stella, con l'hub che paga ogni collegamento, torna a essere un equilibrio. Il [modulo 05](/network-lab/growth-mechanisms) del Network Lab ha mostrato un altro modo in cui nascono gli hub: la crescita.

```box
Lightning: chi apre i canali?
Un canale Lightning è un collegamento tra due nodi. Aprirne uno blocca dei fondi e costa una commissione *on-chain*; porta raggiungibilità e, ai nodi che stanno in mezzo a molti percorsi, **commissioni di instradamento**.

**I modelli.** Georgia Avarikioti, Rolf Scheuner e Roger Wattenhofer (2019) modellarono le reti di **canali di pagamento** come giochi di creazione di reti e trovarono che la stella è un equilibrio di Nash quando i titolari di ogni canale possono fissarne la commissione a piacere. Zeta Avarikioti, Lioba Heimbach, Yuyi Wang e Wattenhofer (2020) usarono la centralità di intermediazione (*betweenness*) come misura delle commissioni che un nodo può aspettarsi e diedero dei limiti al prezzo dell'anarchia e della stabilità.

**I dati.** Jian-Hong Lin, Kevin Primicerio, Tiziano Squartini, Christian Decker e Claudio Tessone (2020) seguirono la rete per 18 mesi, da gennaio 2018 a luglio 2019, quando aveva 8.216 utenti e 122.517 canali attivi. In media sul periodo, il 10% dei nodi deteneva l'80% dei bitcoin in gioco, la struttura diventava sempre più di tipo centro–periferia, e togliere gli hub la spezzava in molti pezzi.

**Una lettura.** Nel modello delle connessioni le stelle sono efficienti quando i collegamenti costano qualcosa ma non troppo, e un hub tiene i suoi collegamenti solo se ognuno vale per lui quanto costa: le commissioni di instradamento sono un modo di pagarlo. Poiché è una sola parte ad aprire e finanziare un canale, i collegamenti unilaterali di Bala e Goyal si adattano meglio di quelli di Jackson e Wolinsky. È un'ipotesi, non una descrizione: i canali reali hanno capacità diverse, le commissioni cambiano, e la rete è cresciuta e cambiata dal 2019.
```

## Il prossimo modulo

Modulo 10: quando i giocatori possono firmare accordi vincolanti, quali coalizioni si formano e come dividono ciò che producono insieme; con un riquadro Bitcoin sui *pool* di *mining*.

<!-- simulation -->

## Letture consigliate

- Jackson, M. O. (2008). *Social and Economic Networks*. Princeton University Press. Cap. 6 (formazione strategica delle reti), 9 (decisioni, comportamenti e giochi su reti) e 11 (modelli di teoria dei giochi della formazione delle reti).
- Nisan, N., Roughgarden, T., Tardos, É. e Vazirani, V. (a cura di) (2007). *Algorithmic Game Theory*. Cambridge University Press. Cap. 19 (giochi di formazione di reti e il metodo della funzione potenziale) e 24 (comportamenti a cascata nelle reti).
- Kearns, M., Littman, M. L. e Singh, S. (2001). Graphical models for game theory. *UAI 2001*.
- Bramoullé, Y. e Kranton, R. (2007). Public goods in networks. *Journal of Economic Theory* 135, 478–494.
- Bramoullé, Y., Kranton, R. e D'Amours, M. (2014). Strategic interaction and networks. *American Economic Review* 104, 898–930.
- Ballester, C., Calvó-Armengol, A. e Zenou, Y. (2006). Who's who in networks. Wanted: the key player. *Econometrica* 74, 1403–1417.
- Morris, S. (2000). Contagion. *Review of Economic Studies* 67, 57–78.
- Jackson, M. O. e Wolinsky, A. (1996). A strategic model of social and economic networks. *Journal of Economic Theory* 71, 44–74.
- Jackson, M. O. e Watts, A. (2002). The evolution of social and economic networks. *Journal of Economic Theory* 106, 265–295.
- Bala, V. e Goyal, S. (2000). A noncooperative model of network formation. *Econometrica* 68, 1181–1229.
- Avarikioti, G., Scheuner, R. e Wattenhofer, R. (2019). Payment networks as creation games. *CBT 2019* (arXiv:1908.00436).
- Avarikioti, Z., Heimbach, L., Wang, Y. e Wattenhofer, R. (2020). Ride the Lightning: the game theory of payment channels. *Financial Cryptography 2020*, 264–283 (arXiv:1912.04797).
- Lin, J.-H., Primicerio, K., Squartini, T., Decker, C. e Tessone, C. J. (2020). Lightning Network: a second path towards centralisation of the Bitcoin economy. *New Journal of Physics* 22, 083022.
- Il Network Lab, [modulo 03](/network-lab/centrality), [modulo 05](/network-lab/growth-mechanisms) e [modulo 13](/network-lab/social-contagion-network-effects).
