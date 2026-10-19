<!-- DRAFT: to be reviewed by Adriano -->

## Un sistema senza nessuno al comando

Bitcoin non ha un amministratore delegato, una sede o una banca centrale. Da quando il suo primo blocco è stato estratto, il 3 gennaio 2009, lo tengono in funzione decine di migliaia di nodi indipendenti, i miner che competono per ogni nuovo blocco e milioni di utenti, nessuno dei quali può dare ordini agli altri. Ognuno segue poche regole locali: controllare che una transazione sia valida, inoltrarla, costruire sulla catena con più lavoro. Da queste regole nascono un registro condiviso, un prezzo e un mercato dello spazio nei blocchi.

Questo corso ha studiato, uno alla volta, reti, automi cellulari, criticità, agenti, stormi, giochi e disuguaglianza. In Bitcoin compaiono tutti insieme. Quest'ultimo modulo lo guarda con la cassetta degli attrezzi che abbiamo costruito.

## Che cosa fa di Bitcoin un sistema complesso adattivo

Ricorda gli ingredienti del Modulo 01. Ci sono **molti agenti eterogenei**: utenti, risparmiatori, trader, miner, gestori di nodi, sviluppatori ed exchange, con obiettivi, orizzonti temporali e risorse molto diversi.

Interagiscono attraverso **regole locali**, il protocollo, che ogni nodo fa rispettare per conto proprio. Non c'è **alcun controllo centrale**: nessun partecipante può cambiare le regole per gli altri, e un nodo che le viola viene semplicemente ignorato.

Le grandezze interessanti sono **aggregati emergenti** che nessuno stabilisce: il prezzo, l'hash rate totale, il livello delle commissioni, il grado di decentralizzazione. Sono collegate da **anelli di retroazione**. Un prezzo più alto aumenta i ricavi del mining, che attirano più hash rate; più hash rate rende un attacco più costoso, il che può far crescere la fiducia, l'adozione e, a sua volta, il prezzo. Questo anello è positivo e, come ogni anello positivo, può anche girare al contrario. Altri anelli sono negativi e stabilizzano il sistema, come vedremo tra poco.

Infine, il sistema **si adatta**. Il software cambia con aggiornamenti che la rete adotta o rifiuta, come SegWit (2017) e Taproot (2021); i miner si spostano dove l'elettricità costa meno; gli utenti cambiano abitudini quando le commissioni salgono e scendono.

## La retroazione negativa nel protocollo

L'anello di retroazione più chiaro è scritto nel codice. Ogni 2016 blocchi, ogni nodo confronta il tempo impiegato da quei blocchi con le due settimane previste, un blocco ogni dieci minuti, e riscala di conseguenza la **difficoltà** del problema. Se i blocchi sono arrivati troppo in fretta, estrarre diventa più difficile; se troppo lentamente, più facile. Per evitare oscillazioni violente, la variazione a ogni aggiustamento è limitata a un fattore quattro in un senso o nell'altro.

È una retroazione negativa come quella di un termostato, con una particolarità importante: agisce solo una volta per periodo, sulla media delle due settimane precedenti. A metà 2021, quando una grossa parte dell'hash rate mondiale si spense perché il mining era stato vietato in Cina, i blocchi rallentarono vistosamente. Gli aggiustamenti successivi abbassarono la difficoltà a grandi passi, il più grande un calo di circa il 28%, finché non tornò il ritmo di dieci minuti. Il pannello C ti permette di rivivere uno shock di questo tipo e di vedere perché il recupero richiede più di un periodo.

## Il calendario di emissione

I nuovi bitcoin entrano in circolazione come **sussidio di blocco** pagato a chi estrae ciascun blocco. Era di 50 BTC all'inizio e si dimezza ogni 210.000 blocchi, circa ogni quattro anni; da aprile 2024 è di 3,125 BTC. Poiché il sussidio è una serie geometrica, l'offerta totale si avvicina a 21 milioni senza mai superarli; dato che gli importi si contano in satoshi interi (un centomilionesimo di bitcoin), si ferma appena prima.

È una regola fissa, non una decisione: nessuno vota l'emissione dell'anno prossimo. Man mano che il sussidio si riduce verso zero, i miner sono pagati sempre di più dalle commissioni sulle transazioni.

## Come crescono le reti

Le nuove tecnologie tendono a diffondersi in modo riconoscibile. Nel 1962 il sociologo Everett Rogers descrisse come le innovazioni passino dagli innovatori ai primi adottanti, poi alla maggioranza e infine ai ritardatari, così che il numero cumulato di adottanti segue una **curva a S**. Nel 1969 Frank Bass ne fece un modello con due forze: alcune persone adottano da sole, con un tasso p, mentre altre imitano chi lo ha già fatto, con un tasso q proporzionale a quanti sono. La crescita iniziale accelera, poi rallenta quando il mercato si satura.

Quanto vale una rete? Negli anni Ottanta Robert Metcalfe, tra gli inventori di Ethernet, sostenne che il valore di una rete di comunicazione cresce come il numero di connessioni possibili tra i suoi utenti, circa n². Questa **legge di Metcalfe** è stata poi criticata come troppo ottimista: non tutte le connessioni valgono allo stesso modo. Nel 2006 Bob Briscoe, Andrew Odlyzko e Benjamin Tilly proposero che il valore cresca piuttosto come n log n. Un compromesso diffuso è una legge generalizzata, valore ∝ n^k, con k da misurare.

Metti insieme le due idee. Se l'adozione cresce come una potenza del tempo, n ∝ t^a, e il valore come una potenza degli utenti, V ∝ n^k, allora

```math
V ∝ (t^a)^k = t^(a·k)
```

e il valore è una retta di pendenza a·k sugli assi log–log. È la logica generale dietro l'espressione "dinamica di adozione della rete e scaling di Metcalfe generalizzato". Il pannello B ti permette di giocarci e di vedere che cosa succede quando invece l'adozione si satura.

Il preprint dell'Istituto, *A Mechanistic Derivation of the Bitcoin Price Power Law: Network Adoption Dynamics and Generalised Metcalfe Scaling* (Santostasi & Perrenod), segue questa strada con esponenti misurati. Come riassunto sulla nostra [pagina delle pubblicazioni](/research/publications#preprint), il numero di indirizzi Bitcoin con saldo non nullo cresce come N(t) ∝ t^3,046, una legge cubica che gli autori collegano alla diffusione epidemica su reti eterogenee a invarianza di scala (Modulo 04), e il prezzo scala con quel numero come P ∝ N^1,838. La loro composizione, 3,046 × 1,838 ≈ 5,60, cade entro l'1,6% dell'esponente misurato direttamente sul prezzo. Per la derivazione vera e propria, leggi l'articolo.

## La legge di potenza nei dati

Disegna il prezzo di Bitcoin contro il tempo trascorso dal blocco genesi, con assi logaritmici su entrambi, e l'andamento di lungo periodo è vicino a una retta: una legge di potenza nel tempo, prezzo ∝ t^β. L'analisi dell'Istituto dà **β = 5,69 ± 0,05**, con **R² = 0,961** su **5.696 osservazioni giornaliere** da luglio 2010 a febbraio 2026. <!-- Reproduced with Coin Metrics daily PriceUSD: t = days since 2009-01-03 (genesis = day 0), OLS of log10 price on log10 t, 18 Jul 2010 – 28 Feb 2026 → β = 5.690, R² = 0.9613, N = 5,705 (published N 5,696). --> La convenzione è la più semplice: il tempo t si conta in giorni dal blocco genesi del 3 gennaio 2009, che è il giorno 0, e la retta è un adattamento ai minimi quadrati ordinari del logaritmo del prezzo contro il logaritmo di t. Nel pannello A puoi adattare tu stesso una retta del genere, sui prezzi giornalieri reali, partendo dalla stessa finestra.

Questo è materiale didattico, non una consulenza finanziaria. Un buon adattamento ai dati passati non garantisce i prezzi futuri.

## Come leggere onestamente un adattamento del genere

Il Modulo 04 ha insegnato che una retta sugli assi log–log è il punto in cui il ragionamento comincia, non quello in cui finisce. Ecco le domande da porsi.

**Che tipo di legge di potenza è?** Una legge di potenza in una serie temporale, il prezzo in funzione del tempo, non è una distribuzione a legge di potenza come le distribuzioni dei gradi del Modulo 04. Servono strumenti diversi.

**Quanto è stabile l'esponente?** Sposta l'inizio o la fine della finestra di adattamento e ripeti il calcolo. Un esponente che si muove molto ti dice che la retta non è così dritta come sembra, o che i primi dati pesano molto.

**Come sono fatti i residui?** Gli scostamenti del prezzo dalla retta sono grandi, spesso un fattore due o più, e **correlati nel tempo**: se oggi il prezzo è sopra la tendenza, quasi certamente lo era anche ieri. Questo conta, perché l'errore standard da manuale di un adattamento ai minimi quadrati presuppone residui indipendenti, e cinquemila giorni correlati contengono molta meno informazione di cinquemila giorni indipendenti. Anche le variazioni da un giorno all'altro hanno **code pesanti**, uno dei "fatti stilizzati" del Modulo 08. Nota inoltre che un R² alto è facile da ottenere per qualunque serie che cresce di ordini di grandezza; da solo non indica una legge di potenza.

**Prevede?** Adatta la retta sui dati fino a una certa data e guarda che cosa succede dopo. Un test fuori campione è molto più difficile da superare di un adattamento dentro il campione.

**Rispetto a quale alternativa?** Confronta la legge di potenza con altri modelli di crescita sugli stessi dati: un esponenziale, che è una retta sugli assi semi-logaritmici, o una curva che si satura come la logistica. Il pannello A mostra l'R² di un adattamento esponenziale sulla stessa finestra.

La forza di un modello **meccanicistico** è che non si limita ad adattarsi ai dati. Spiega perché l'esponente ha il valore che ha e fa previsioni che potrebbero fallire: qui, che gli esponenti dell'adozione e del valore, misurati separatamente, moltiplicati diano l'esponente del prezzo.

## Domande aperte

Sono il tipo di domande che SBI studia.

Le fluttuazioni attorno alla tendenza si comportano come **valanghe in un sistema critico auto-organizzato** (Modulo 08), con scoppi di tutte le dimensioni e nessuna scala caratteristica, o sono descritte meglio in un altro modo?

Quanto è **eterogeneo** e quanto è **concentrato** il possesso reale, una volta raggruppati gli indirizzi nelle entità che li controllano (Modulo 12)?

Quanto sono robusti la rete dei peer e l'ecosistema del mining rispetto a **guasti correlati**, una regione che si scollega o un grande fornitore che cade, invece che casuali (Moduli 04 e 07)?

## Il corso, una frase per filone

Retroazione e non linearità (Modulo 01) sono il motivo per cui piccole cause possono avere grandi effetti e la previsione ha dei limiti. Grafi casuali, piccoli mondi e reti a invarianza di scala (Moduli 02–04) spiegano come pochi collegamenti casuali per nodo connettano una rete globale, e perché gli hub sono una vulnerabilità da evitare. Automi cellulari e Gioco della Vita (Moduli 05–06) mostrano comportamenti complessi, e un'identità che persiste, che emergono da regole deterministiche semplici. Frattali, percolazione e criticità (Moduli 07–08) descrivono soglie, robustezza e code pesanti. Modelli ad agenti, stormi e giochi (Moduli 09–11) mostrano come aggregati, coordinamento e cooperazione nascano da decisioni e incentivi locali. La disuguaglianza (Modulo 12) ci ricorda di chiederci che cosa si sta contando.

La complessità non è una teoria sola. È una cassetta degli attrezzi per i sistemi in cui il tutto si comporta diversamente dalle sue parti, e Bitcoin, aperto, globale, interamente registrato fin dal primo giorno, è un laboratorio straordinario in cui usarla.

<!-- simulation -->

## Che cosa osservare

1. Nel pannello A, sposta in avanti di qualche anno l'inizio della finestra di adattamento. Di quanto si muove β̂? Confronta la variazione con la barra d'errore da manuale e con quella robusta nella nota sotto i numeri.
2. Guarda i residui nel tempo. Sono indipendenti da un giorno all'altro? Che cosa ti dice l'autocorrelazione a un giorno sull'errore standard da manuale?
3. Passa il pannello A agli assi semi-logaritmici. Perché l'adattamento esponenziale, qui una retta, manca i dati a entrambe le estremità? Confronta i due valori di R².
4. Nel pannello B, passa l'adozione da una legge di potenza a una curva a S. Che cosa succede alla retta, e alla pendenza locale, quando ci si avvicina al tetto? Riesci a scegliere parametri per cui la curva a S sembra dritta per un ordine di grandezza?
5. Nel pannello C, togli metà dell'hash rate senza recupero. Quanti periodi di aggiustamento passano prima che i blocchi tornino a dieci minuti, e perché non succede subito? Poi prova un calo dell'80%: che cosa fa il limite ×4?
6. Nel pannello D, trova il sussidio attuale e la quota dei 21 milioni già emessa. Più o meno quando sarà stato emesso il 99%?

## Il corso in una tabella

| Modulo | Idea | Dove si vede in Bitcoin |
|---|---|---|
| 01 Sistemi complessi | retroazione, non linearità, nessuno al comando | prezzo, hash rate e sicurezza si influenzano a vicenda |
| 02 Reti casuali | soglia di connessione ln n / n | ~10 peer in uscita tengono connessa la rete dei peer |
| 03 Piccoli mondi | cammini brevi senza clustering | peer distribuiti su gruppi di rete diversi; i blocchi attraversano la rete in pochi secondi |
| 04 Reti a invarianza di scala | hub, leggi di potenza, adattamenti onesti | niente hub per progetto; la legge di potenza del prezzo, verificata con cura |
| 05 Automi cellulari | casualità da regole deterministiche | SHA-256 e l'effetto valanga |
| 06 Gioco della Vita | strutture che persistono | il registro e le sue regole sopravvivono a ogni macchina e partecipante |
| 07 Frattali e percolazione | soglia di percolazione, q⟨k⟩ > 1 | resilienza a guasti casuali e a guasti correlati dei nodi |
| 08 Criticità auto-organizzata | code pesanti, nessuna causa speciale | rendimenti a coda pesante e volatilità a grappoli |
| 09 Modelli ad agenti | ingorghi da regole locali | congestione della mempool e impennate improvvise delle commissioni |
| 10 Comportamento collettivo | stigmergia | i miner estendono la catena con più lavoro |
| 11 Cooperazione | progettazione degli incentivi | il mining onesto come equilibrio, il selfish mining come limite |
| 12 Ricchezza e disuguaglianza | che cosa si sta contando | indirizzi contro entità |

## Letture consigliate

- S. Nakamoto, "Bitcoin: A Peer-to-Peer Electronic Cash System" (2008).
- E. M. Rogers, *Diffusion of Innovations* (Free Press, New York, 1962).
- F. M. Bass, "A new product growth for model consumer durables", *Management Science* 15 (1969) 215–227.
- B. Briscoe, A. Odlyzko & B. Tilly, "Metcalfe's law is wrong", *IEEE Spectrum* 43(7) (2006) 34–39.
- R. Cont, "Empirical properties of asset returns: stylized facts and statistical issues", *Quantitative Finance* 1 (2001) 223–236.
- A. Narayanan, J. Bonneau, E. Felten, A. Miller & S. Goldfeder, *Bitcoin and Cryptocurrency Technologies* (Princeton University Press, 2016).
- G. Santostasi & S. Perrenod, "A Mechanistic Derivation of the Bitcoin Price Power Law: Network Adoption Dynamics and Generalised Metcalfe Scaling", preprint dello Scientific Bitcoin Institute (2026), DOI [10.5281/zenodo.19387099](https://doi.org/10.5281/zenodo.19387099); vedi la nostra [pagina delle pubblicazioni](/research/publications#preprint).
