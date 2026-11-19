<!-- DRAFT: to be reviewed by Adriano -->

## Tanti piccoli, pochi enormi

La maggior parte dei terremoti è troppo debole per essere avvertita; pochi distruggono città intere. Nel 1944 Beno Gutenberg e Charles Richter contarono i terremoti della California e scoprirono che tutti seguono una regola semplice: ogni gradino di un'unità sulla scala delle magnitudo rende un terremoto circa dieci volte più raro. Poiché ogni unità di magnitudo moltiplica l'energia liberata per circa trenta, si tratta di una legge di potenza nell'energia, senza una dimensione tipica, come nel Modulo 04.

Statistiche simili compaiono nei brillamenti solari, negli incendi boschivi e nelle frane. Nel 2003 John Beggs e Dietmar Plenz registrarono fettine di corteccia di ratto su griglie di elettrodi e videro lampi di attività propagarsi attraverso di esse: **valanghe neuronali**, le cui dimensioni seguivano anch'esse una legge di potenza.

## Un enigma

Anche il Modulo 07 ha prodotto leggi di potenza e frattali, ma solo a p_c. Sposta un poco p e torna una dimensione caratteristica. I punti critici ordinari funzionano allo stesso modo: acqua e vapore diventano indistinguibili a una sola temperatura e pressione, un magnete perde la magnetizzazione esattamente alla temperatura di Curie, e fluttuazioni di ogni dimensione compaiono lì e da nessun'altra parte. Qualcuno deve girare la manopola sul valore giusto.

Nessuno regola la crosta terrestre, il Sole o il cervello. Come può la natura essere critica così spesso, se la criticità richiede una regolazione fine?

## Il mucchio di sabbia

Nel 1987 Per Bak, Chao Tang e Kurt Wiesenfeld proposero una risposta: alcuni sistemi si portano da soli in uno stato critico. La chiamarono **criticità auto-organizzata** e la illustrarono con un modello giocattolo, il mucchio di sabbia.

Prendi una griglia quadrata in cui ogni sito contiene un numero z di granelli, la sua altezza. Aggiungi granelli uno alla volta, ciascuno su un sito scelto a caso. Quando un sito raggiunge z = 4 **crolla**: perde quattro granelli e ne dà uno a ciascuno dei suoi quattro vicini. I granelli spinti oltre il bordo vanno persi. Un crollo può portare un vicino a 4, che crolla a sua volta, e così via: una **valanga**, che finisce quando ogni sito è di nuovo sotto 4. Solo allora si aggiunge il granello successivo.

Contano tre ingredienti: una **forzatura** lenta (ogni valanga finisce prima che arrivi il granello successivo), una **soglia** locale e la **dissipazione** al bordo, l'unico punto da cui la sabbia esce. Da qualunque configurazione iniziale il mucchio si assesta in uno stato stazionario in cui, in media, la sabbia aggiunta è uguale a quella persa, e le dimensioni s delle valanghe, contate in crolli, seguono una legge di potenza

```math
P(s) ∝ s^(−τ)
```

tagliata solo dalla dimensione della griglia. Nulla è stato regolato. Un mucchio con meno sabbia avrebbe valanghe piccole e accumulerebbe granelli; uno con più sabbia la perderebbe in grandi valanghe. Lo stato critico è il punto verso cui la dinamica conduce, e in cui resta.

## Che cosa si può calcolare esattamente

Il mucchio di sabbia sembra un gioco, ma ha una struttura nascosta. Nel 1990 Deepak Dhar dimostrò che è **abeliano**: quando più siti sono instabili, l'ordine in cui crollano non cambia né la configurazione finale né quante volte crolla ciascun sito. Questo ha reso alcune parti del modello risolubili esattamente. Nel 1994 Vyatcheslav Priezzhev calcolò le probabilità delle quattro altezze stabili nello stato stazionario di una griglia quadrata infinita. Con altezze da 0 a 3, come qui, la loro media è 17/8 = 2,125: un valore congetturato a partire dai suoi risultati e dimostrato esatto solo nel 2011. Altre grandezze hanno resistito. L'esponente delle valanghe τ in due dimensioni vale circa 1,2 ed è ancora discusso, perché il modello mostra un sottile multiscaling: valanghe di dimensioni diverse non si riscalano tutte allo stesso modo.

## Il rumore 1/f

L'articolo del 1987 si intitolava "La criticità auto-organizzata: una spiegazione del rumore 1/f". Ogni segnale nel tempo si può scomporre in oscillazioni di frequenze diverse (l'analisi di Fourier; la trasformata di Fourier veloce la rende economica), e il suo spettro di potenza S(f) dice quanta parte della sua varianza si trova alla frequenza f. Il **rumore bianco**, una sequenza di valori indipendenti, ha la stessa potenza a ogni frequenza. Il **rumore marrone** di un cammino casuale, in cui ogni valore è il precedente più un passo casuale, ha S(f) ∝ 1/f²: dominano le lente divagazioni. Tra i due sta il **rumore 1/f**, o rumore rosa, con la stessa potenza in ogni ottava. Compare nei dispositivi elettronici, nelle portate dei fiumi e nel battito cardiaco, e nel 1975 Richard Voss e John Clarke lo trovarono nell'intensità e nell'altezza della musica e del parlato.

Spiegarlo era la motivazione originale: valanghe di ogni dimensione e durata dovrebbero produrre fluttuazioni su ogni scala di tempo. Lavori successivi, a partire da Henrik Jensen, Kim Christensen e Hans Fogedby nel 1989, hanno mostrato che il mucchio di sabbia originale non produce in modo semplice rumore 1/f: quando è forzato lentamente il suo spettro di attività è più vicino a 1/f², e la pendenza misurata cambia con la velocità della forzatura e con la risoluzione temporale. È un esempio onesto di un'idea bella che supera la sua prima giustificazione.

## Altri modelli auto-organizzati

Nel 1992 Barbara Drossel e Franz Schwabl introdussero un **modello di incendi boschivi**. Su una griglia, gli alberi crescono sui siti vuoti con probabilità p a ogni passo, e un fulmine colpisce un albero con una probabilità f molto più piccola, bruciandone l'intero cluster connesso. Le dimensioni degli incendi diventano a coda pesante, anche se lavori successivi hanno trovato correzioni allo scaling semplice. Lo stesso anno Zeev Olami, Hans Jacob Feder e Kim Christensen pubblicarono un modello di terremoti in cui una faglia è una griglia di blocchi uniti da molle. È non conservativo, perché parte dello sforzo liberato a ogni scivolamento va persa, e i suoi eventi mostrano comunque dimensioni a legge di potenza.

I mucchi di sabbia veri si comportano come il modello? Per lo più no: contano l'inerzia e l'attrito. Ma nel 1996 Vidar Frette e colleghi lasciarono accumulare riso tra due lastre di vetro e trovarono valanghe a legge di potenza quando i chicchi erano allungati, così che l'attrito li tenesse al loro posto.

## Perché un giocattolo?

Perché dei granelli su una griglia dovrebbero spiegare i terremoti? La risposta del fisico è l'**universalità**, incontrata nel Modulo 07: vicino a un punto critico, il comportamento a grande scala dipende da poche caratteristiche generali, non dai dettagli microscopici. Qui queste caratteristiche sono una forzatura lenta, soglie locali, trasporto verso i vicini e dissipazione. Un modello è un membro di una classe; se un sistema reale appartiene alla stessa classe, ne condivide le statistiche, di qualunque cosa siano fatti i suoi granelli.

## Previsione

In un sistema critico auto-organizzato il granello che innesca una valanga gigantesca non è diverso da quello che ne innesca una minuscola. Gli eventi grandi non hanno bisogno di una causa speciale; ciò che si può prevedere è la loro statistica, non il momento in cui arrivano. È un messaggio che fa riflettere chiunque speri di prevedere il prossimo grande evento, e uno utile per la gestione del rischio: preparati all'intera distribuzione delle dimensioni, non a una data.

## Un collegamento con Bitcoin

Nel 1963 Benoît Mandelbrot studiò i prezzi del cotone e scoprì che le loro variazioni avevano code molto più pesanti di una gaussiana. Nel 2001 Rama Cont raccolse queste regolarità, ritrovate in un mercato dopo l'altro, come "fatti stilizzati": code pesanti, e una volatilità che si raggruppa a ondate. I rendimenti giornalieri di Bitcoin mostrano queste caratteristiche in modo marcato. La ricerca dell'Istituto trova che l'andamento di lungo periodo del prezzo di Bitcoin segue una legge di potenza nel tempo; leggi il preprint sulla nostra [pagina delle Pubblicazioni](/research/publications#preprint). Se le fluttuazioni attorno a quell'andamento si comportino come valanghe in un sistema critico auto-organizzato è una questione aperta. È esattamente il tipo di domanda che gli strumenti di questo corso servono a verificare, con la cautela del Modulo 04: una retta su assi log–log è il punto in cui l'argomento comincia, non quello in cui finisce.

<!-- simulation -->

## Che cosa osservare

1. Parti da una griglia vuota in modalità "Continua" e guarda il grafico dell'altezza media. Dove si assesta, e quanto è vicina a 2,125? Prova le partenze casuale e sovraccarica: finiscono nello stesso punto?
2. Passa a "Un granello" e lascia cadere i granelli uno alla volta. La maggior parte delle valanghe è piccola? Segui una valanga grande onda dopo onda: il granello che l'ha innescata aveva qualcosa di speciale?
3. Raccogli le statistiche e leggi τ̂ dalla CCDF. Poi cambia il lato L e raccogli di nuovo: che cosa succede alle valanghe più grandi, e alla pendenza nella parte centrale? Sposta s_min e guarda quanto la stima ne dipende.
4. Nel pannello B, ascolta il rumore bianco, rosa e marrone. Quale suona più "naturale"? Confronta le pendenze stimate β̂ con 0, −1 e −2.
5. Seleziona "Attività del mucchio". Il suo spettro è più vicino a 1/f o a 1/f²?
6. Nel modello degli incendi, alza p/f da 100 a 10.000. Che cosa succede alla densità degli alberi, e agli incendi più grandi? Quando gli incendi cominciano a fare il giro dell'intero toro?

## Letture consigliate

- B. Gutenberg & C. F. Richter, "Frequency of earthquakes in California", *Bulletin of the Seismological Society of America* 34 (1944) 185–188.
- B. B. Mandelbrot, "The variation of certain speculative prices", *Journal of Business* 36 (1963) 394–419.
- R. F. Voss & J. Clarke, "'1/f noise' in music and speech", *Nature* 258 (1975) 317–318.
- P. Bak, C. Tang & K. Wiesenfeld, "Self-organized criticality: an explanation of 1/f noise", *Physical Review Letters* 59 (1987) 381–384.
- D. Dhar, "Self-organized critical state of sandpile automaton models", *Physical Review Letters* 64 (1990) 1613–1616.
- Z. Olami, H. J. S. Feder & K. Christensen, "Self-organized criticality in a continuous, nonconservative cellular automaton modeling earthquakes", *Physical Review Letters* 68 (1992) 1244–1247.
- B. Drossel & F. Schwabl, "Self-organized critical forest-fire model", *Physical Review Letters* 69 (1992) 1629–1632.
- V. Frette et al., "Avalanche dynamics in a pile of rice", *Nature* 379 (1996) 49–52.
- P. Bak, *How Nature Works: The Science of Self-Organized Criticality* (Copernicus, 1996).
- R. Cont, "Empirical properties of asset returns: stylized facts and statistical issues", *Quantitative Finance* 1 (2001) 223–236.
- J. M. Beggs & D. Plenz, "Neuronal avalanches in neocortical circuits", *Journal of Neuroscience* 23 (2003) 11167–11177.
- G. Pruessner, *Self-Organised Criticality: Theory, Models and Characterisation* (Cambridge University Press, 2012).
- Scientific Bitcoin Institute, preprint sulla legge di potenza di Bitcoin, sulla nostra [pagina delle Pubblicazioni](/research/publications#preprint).
