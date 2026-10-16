<!-- DRAFT: to be reviewed by Adriano -->

## Un gioco a cui nessuno gioca

Nell'ottobre del 1970 la rubrica "Mathematical Games" di Martin Gardner su *Scientific American* descrisse uno strano gioco inventato dal matematico di Cambridge John Horton Conway. Non aveva giocatori, né mosse, né vincitori: si disponevano delle pedine su una scacchiera e poi si guardava semplicemente che cosa ne facevano le regole. "Life" di Conway divenne presto uno degli oggetti più studiati della matematica ricreativa e dell'informatica delle origini.

## Le regole

Il Gioco della Vita è un automa cellulare, come quelli del Modulo 05, ma in due dimensioni. La scacchiera è una griglia di celle quadrate, ciascuna **viva** o **morta**. Ogni cella ha otto vicine, le celle che la toccano lungo un lato o in un angolo (l'**intorno di Moore**). Tutte le celle vengono aggiornate insieme, una generazione alla volta:

- una cella morta con esattamente 3 vicine vive prende vita (**nascita**);
- una cella viva con 2 o 3 vicine vive resta in vita (**sopravvivenza**);
- ogni altra cella muore, o resta morta.

Le regole di questa famiglia si scrivono **B3/S23** (dall'inglese *birth* e *survival*): i numeri dopo la B indicano la nascita, quelli dopo la S la sopravvivenza. La regola è **totalistica**: guarda solo quante vicine sono vive, mai quali.

Conway scelse questi numeri con cura. Voleva regole con cui non fosse facile dimostrare che una configurazione cresce per sempre, ma in cui alcune configurazioni semplici facessero cose sorprendenti. Con condizioni di nascita più generose quasi tutto esplode; con condizioni più severe quasi tutto muore. B3/S23 sta in una fascia stretta tra i due estremi.

## Uno zoo di configurazioni

Le **configurazioni stabili** non cambiano mai: ogni cella viva ha due o tre vicine vive e nessuna cella morta ne ha esattamente tre. Il **blocco** (un quadrato 2 × 2), l'**alveare**, la **pagnotta** e la **barca** sono le più comuni.

Gli **oscillatori** tornano alla forma iniziale dopo un numero fisso di generazioni, il periodo. Il **lampeggiatore**, tre celle in fila, passa da orizzontale a verticale con periodo 2, e lo stesso fanno il **rospo** e il **faro**. La **pulsar** ha periodo 3 e il **pentadecathlon** periodo 15.

Le **navicelle** tornano alla loro forma in una nuova posizione. L'**aliante** (*glider*), cinque celle, si sposta di una cella in diagonale ogni 4 generazioni; la **navicella leggera** si sposta di due celle di lato nello stesso tempo.

Poi ci sono i **matusalemme**: configurazioni minuscole che impiegano moltissimo a stabilizzarsi. L'**R-pentomino**, cinque celle, ribolle per 1103 generazioni prima di calmarsi in configurazioni stabili sparse, oscillatori e alianti in fuga. La **ghianda** (*acorn*), sette celle, ne richiede 5206.

## Cinquanta dollari e un cannone

Conway si chiese se una configurazione finita possa crescere senza limite, e offrì 50 dollari per una risposta. Sospettava di no. Nel novembre 1970 un gruppo del MIT guidato da Bill Gosper gli diede torto con il **cannone di alianti**: una configurazione che ogni 30 generazioni si ricostruisce e spara un nuovo aliante, per sempre. La sua popolazione sale di cinque celle a ogni periodo. Seguirono presto i **puffer**, treni che si muovono lasciando detriti dietro di sé.

## Un computer fatto di alianti

Un flusso di alianti può trasportare informazione: un aliante è un 1, un vuoto è uno 0. Le collisioni possono distruggere alianti, deviarli o crearne di nuovi, e con le giuste disposizioni si comportano come porte logiche. In *Winning Ways* (1982) Elwyn Berlekamp, Conway e Richard Guy mostrarono che il Gioco della Vita può calcolare tutto ciò che può calcolare un computer: è **universale**, come la Regola 110 del Modulo 05. Nel 2000 Paul Rendell costruì una macchina di Turing esplicita dentro il Gioco della Vita, e nel 2006 il "metapixel OTCA" permise di simulare il Gioco della Vita al suo stesso interno, con ogni grande blocco di celle nel ruolo di una singola cella.

## Un aliante è reale?

Nessuna delle celle di un aliante sopravvive a lungo: quattro generazioni dopo è fatto di celle del tutto diverse. Eppure si muove, si scontra, trasporta un segnale. È una cosa, o soltanto un modo di guardare la griglia?

Il filosofo Daniel Dennett usò il Gioco della Vita per proporre una risposta nel saggio "Real Patterns" (1991). Chi segue ogni cella può prevedere la griglia perfettamente, ma lentamente. Chi dice "un aliante va verso nord-est e colpirà quel blocco" prevede gli stessi eventi con molta meno fatica, e quasi sempre correttamente. Secondo Dennett una configurazione è reale nella misura in cui descrivere il mondo nei suoi termini dà questo tipo di potere predittivo. È lo stesso motivo per cui parliamo di uragani, onde, specie e persone invece che di molecole. È una posizione influente tra altre, e il Gioco della Vita ne è l'illustrazione classica.

## Oltre B3/S23

Qualsiasi scelta dei numeri di nascita e sopravvivenza dà una regola "simile a Life". **HighLife** (B36/S23) si comporta in gran parte come Life ma ha anche un piccolo **replicatore**, una configurazione che crea copie di sé stessa. **Seeds** (B2/S) non prevede alcuna sopravvivenza: ogni cella vive una sola generazione, e quasi tutte le configurazioni esplodono. **Day & Night** (B3678/S34678) tratta in modo simmetrico celle vive e morte, così un'isola scura in un mare vivo si comporta come un'isola viva in un mare morto. **Life without Death** (B3/S012345678) non uccide mai nulla e fa crescere strutture simili a cristalli.

Prova qualche regola a caso e scoprirai che quasi tutte sono noiose: si congelano, si estinguono o ribollono in un rumore senza forma. Regole ricche come Life sono rare, un'eco del margine del caos di Langton visto nel Modulo 05.

## La formica di Langton

Nel 1986 Christopher Langton studiò un mondo ancora più semplice: una sola **formica** che si muove su una griglia di celle bianche e nere. Su una cella bianca svolta a destra, su una nera svolta a sinistra; poi inverte il colore della cella e avanza di un passo. Partendo da una griglia vuota la formica disegna prima piccole figure simmetriche, poi vaga in modo caotico per circa 10.000 passi. Poi, all'improvviso, comincia a costruire un'**autostrada**: un ciclo di 104 passi che la sposta di due celle in diagonale, ripetuto per sempre.

È stato dimostrato che il cammino della formica è sempre illimitato, ma nessuno ha dimostrato che finisca sempre per costruire un'autostrada a partire da ogni configurazione iniziale finita. Dando alle celle più colori, ciascuno con la sua svolta, si ottengono i **turmiti**: alcuni disegnano figure simmetriche, altri restano caotici, altri ancora costruiscono autostrade proprie.

## Ordine nella cenere

Riempi una griglia a caso e lascia girare il Gioco della Vita. Le prime generazioni ribollono; poi l'attività si spegne, e ciò che resta è una manciata sparsa di blocchi, alveari, lampeggiatori e altri piccoli pezzi che i giocatori chiamano **cenere** (*ash*). Nell'esperimento del Pannello C la densità della cenere dipende solo debolmente dalla densità iniziale, in un ampio intervallo. Questa regolarità non è scritta nelle regole: compare a un livello superiore.

Nel 1989 Per Bak, Kan Chen e Michael Creutz si spinsero oltre e suggerirono che il Gioco della Vita si trovi vicino a uno stato critico, con perturbazioni che si spengono dopo valanghe di attività di ogni dimensione. Lavori successivi hanno messo in dubbio quanto ci sia davvero vicino, ma l'idea porta dritto al Modulo 08.

## Un legame con Bitcoin

Un aliante è una configurazione persistente, non un insieme fisso di celle. Anche Bitcoin è così. Le macchine che lo eseguono vanno e vengono, il software viene riscritto di versione in versione, le persone che vi partecipano cambiano; eppure il registro e le sue regole persistono, tenuti in vita da interazioni locali tra molti nodi indipendenti, senza nessuno al comando. Chiedersi "che cos'è davvero Bitcoin?" è una versione della domanda di Dennett.

<!-- simulation -->

## Che cosa osservare

1. Stampa un aliante e premi Passo: quante generazioni gli servono per tornare alla sua forma, e dove si è spostato? Ruotalo e stampa quattro alianti diretti in direzioni diverse.
2. Carica il cannone di Gosper, imposta il bordo su Finito e guarda il grafico della popolazione. Che forma ha? Ora prova il toro: che cosa succede quando gli alianti tornano indietro dopo aver fatto il giro?
3. Carica l'R-pentomino e poi la ghianda su una griglia finita, e annota la generazione in cui lo stato segnala un ciclo. Perché può essere più tardi delle 1103 e 5206 citate nella lezione?
4. Passa a HighLife e carica il replicatore. Poi fai evolvere la stessa configurazione con Life: che cosa cambia?
5. Fai girare la formica di Langton alla massima velocità: a quale passo comincia l'autostrada? Poi prova LLRR e LRRRRRLLR.
6. Nell'esperimento delle zuppe, la densità finale dipende da quella iniziale? In quale intervallo conta poco, e che cosa succede agli estremi?

## Letture consigliate

- M. Gardner, "Mathematical Games: The fantastic combinations of John Conway's new solitaire game 'life'", *Scientific American* 223 (ottobre 1970) 120–123.
- E. R. Berlekamp, J. H. Conway & R. K. Guy, *Winning Ways for your Mathematical Plays*, vol. 2 (Academic Press, 1982).
- C. G. Langton, "Studying artificial life with cellular automata", *Physica D* 22 (1986) 120–149.
- P. Bak, K. Chen & M. Creutz, "Self-organized criticality in the 'Game of Life'", *Nature* 342 (1989) 780–782.
- D. C. Dennett, "Real Patterns", *Journal of Philosophy* 88 (1991) 27–51.
- A. Gajardo, A. Moreira & E. Goles, "Complexity of Langton's ant", *Discrete Applied Mathematics* 117 (2002) 41–50.
