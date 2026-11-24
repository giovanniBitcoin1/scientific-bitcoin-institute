# Network Lab — scheda di revisione

Per Adriano, che deve leggere tutto il Lab prima della pubblicazione. Scritta
alla fine del passaggio di chiusura (prompt 15, 24 novembre 2026), sul ramo
`network-lab`, dopo il commit «Network Lab: closing pass». Si regge da sola: non
servono i quattordici report. Dove una cosa viene da un report lo dico; dove
nessun documento la registra, lo dico.

Le frasi tra «…» sono citate come stanno oggi sulle pagine italiane.

## 1. Che cosa c'è

Quattordici moduli, tutti con stato `ready`, in quattro parti (Descrivere
01–04, Crescere 05–07, Organizzarsi 08–10, Diffondere 11–14). Ogni modulo ha
la lezione in inglese e in italiano, due figure vive, tre pannelli con il loro
«Che cosa osservare» e sei esercizi con soluzione.

| N. | Titolo | Indirizzo | Parole EN | Parole IT | Figure e pannelli | Riquadri | Commit |
|---|---|---|---|---|---|---|---|
| 01 | Leggere una rete | `/network-lab/reading-a-network` | 1.800 | 1.876 | 2 figure, 3 pannelli | 2: «Un sistema, più reti» (Bitcoin), «Collegamenti potenziali e collegamenti reali» (Metcalfe) | 9267674 |
| 02 | Che cosa stiamo misurando? | `/network-lab/what-are-we-measuring` | 1.630 | 1.752 | 2 e 3 | no | 545d949 (correzioni: c3cf222) |
| 03 | Centralità | `/network-lab/centrality` | 1.568 | 1.639 | 2 e 3 | no | 40b2fcb |
| 04 | Triangoli, legami deboli e motivi | `/network-lab/triangles-weak-ties-motifs` | 1.538 | 1.551 | 2 e 3 | no | 96f6d3b (correzioni: 87f598e) |
| 05 | Code pesanti, fatte bene | `/network-lab/heavy-tails-done-right` | 1.628 | 1.669 | 2 e 3 | 1: «Due cose chiamate legge di potenza» | 279490b (correzioni: e8356a0) |
| 06 | Meccanismi di crescita | `/network-lab/growth-mechanisms` | 1.729 | 1.756 | 2 e 3 | no | b5bacaa |
| 07 | Fitness e competizione | `/network-lab/fitness-and-competition` | 1.698 | 1.700 | 2 e 3 | no | ccb4e32 (correzioni: 81230c9) |
| 08 | Chi si collega a chi | `/network-lab/who-connects-to-whom` | 1.546 | 1.634 | 2 e 3 | no | d684664 |
| 09 | Comunità | `/network-lab/communities` | 1.679 | 1.697 | 2 e 3 | no | 1fcea87 |
| 10 | Pesi, flussi e navigazione | `/network-lab/weights-flows-navigation` | 1.498 | 1.574 | 2 e 3 | 1: «Lightning: una rete di canali» | 54e3607 (correzioni: d405929) |
| 11 | Robustezza e cascate | `/network-lab/robustness-and-cascades` | 1.628 | 1.671 | 2 e 3 | 1: «Le reti di Bitcoin sotto attacco» | 1b58219 |
| 12 | Epidemie su reti | `/network-lab/epidemics-on-networks` | 1.480 | 1.503 | 2 e 3 | 1: «L'adozione è un'epidemia?» | f5c7834 |
| 13 | Contagio sociale ed effetti di rete | `/network-lab/social-contagion-network-effects` | 1.626 | 1.697 | 2 e 3 | 1: «La moneta come bene di rete» | d91da04 |
| 14 | Capstone: una rete reale dall'inizio alla fine | `/network-lab/capstone-a-real-network` | 1.424 | 1.471 | 2 e 3 | 1: «Le stesse domande per Bitcoin» | 12666eb |

Le parole sono contate come le contano gli script di controllo: tutto ciò che
precede le «Letture consigliate», marcatori compresi. L'obiettivo era
1.400–1.700: ne escono i moduli 01 (entrambe le lingue), 02 (italiano) e 06
(entrambe).

Tutte le modifiche del passaggio di chiusura sono nel commit c8b5856
(«Network Lab: closing pass»). Altri commit: 84e4f41 (motore per più lab),
9efa518 (file di stato e controlli nel browser), e2ad0e3 (voce «Labs» e pagina
`/labs`), dcc8949 (la frase sul limite di connessioni nel Complexity Lab 04).

## 2. Come vederlo

1. Nella cartella del sito, sul ramo `network-lab`: `npm run dev`. Vite stampa
   l'indirizzo, di solito `http://localhost:5173`.
2. Il Lab è bloccato (`locked: true`), quindi le lezioni non si vedono. Apri
   `http://localhost:5173/network-lab?admin`: sotto l'intestazione compare il
   campo per la passphrase di amministrazione. Dopo averla inserita, quel
   browser vede sbloccati tutti i lab, con la barra «Admin preview» in alto e
   il pulsante «Lock again». La passphrase non è scritta in nessun file.
3. L'indice è `/network-lab`, la pagina di tutti i lab è `/labs`. La lingua si
   cambia con il selettore EN/IT in alto nelle pagine del Lab.
4. Le istantanee delle pagine fatte dai controlli stanno in
   `scripts/lab/browser-checks/screenshots/` (cartella ignorata da git, sta
   solo su questo PC): per ogni modulo le due figure e i tre pannelli, a
   1280 px in inglese e a 375 px in italiano (`el-<slug>-…png`), più l'indice,
   `/labs` e il menu. `node shots.mjs network <slug>`, da
   `scripts/lab/browser-checks/` e dopo `npx vite build`, le rifà per un modulo.

## 3. Modulo per modulo

Per ogni modulo: (a) le frasi attenuate, o la cui fonte è stata letta solo
nell'abstract, in una fonte secondaria o per niente; (b) i risultati delle
nostre simulazioni che si scostano dalla letteratura o dall'attesa e che il
testo dichiara; (c) le scelte lasciate a te.

### 01 — Leggere una rete

Di questo modulo non esiste un report salvato (la regola di salvare i report
è del 20 novembre, dopo il modulo 01). Quello che segue viene dalle pagine e
dal file di stato.

- (a) Nessuna verifica delle fonti è registrata per la lezione e per le nove
  voci delle letture. Va letto con questo in mente, in particolare la tabella
  delle reti reali (C. elegans, rete elettrica, club di karate) e il secondo
  riquadro: «Briscoe, Odlyzko e Tilly hanno sostenuto che N log N è più
  vicino al vero». Del primo riquadro è stata verificata in seguito (prompt
  11) solo la frase sulle connessioni di Bitcoin Core: vedi la sezione 4.
- (b) Niente di registrato.
- (c) Nessuna scelta aperta registrata. Le due lezioni superano le 1.700
  parole (1.800 e 1.876).

### 02 — Che cosa stiamo misurando?

- (a) Le tredici voci bibliografiche sono state confrontate con Crossref e
  PubMed (dati bibliografici, non il contenuto). Letta nell'abstract: «Tra
  gli amici l'epidemia era in anticipo di circa due settimane (13,9 giorni)»
  (Christakis e Fowler 2010: 13,9 giorni, intervallo 9,9–16,6). Non
  confermato sul sito dell'editore: il numero d'articolo 21 di Achlioptas e
  colleghi (2009), che viene solo da Semantic Scholar. La lezione dice che
  quel risultato è del 2005, «in forma completa nel 2009»; in bibliografia c'è
  solo la versione del 2009. I capitoli dei libri sono pertinenti solo in
  parte (Barabási cap. 4 è «The scale-free property»).
- (b) Il pannello A e l'esercizio 4 riportano la media su 30 campioni della
  componente più grande e dicono quanto oscilla un campione solo (correzione
  c3cf222). I numeri sul club di karate non coincidono del tutto tra lezione,
  pannello e modulo 14: vedi la sezione 7.
- (c) Il pannello A disegna una rete di 150 nodi dello stesso tipo e calcola
  su quella intera di 600. Nel pannello C il gruppo sul club di karate ha 9
  membri. La lezione italiana ha 1.752 parole.

### 03 — Centralità

- (a) Attenuata, perché non confermata su Padgett e Ansell (1993): «Le
  famiglie del campo avverso erano più antiche, e alcune di loro, tra cui gli
  Strozzi, sono di solito descritte come almeno altrettanto ricche e
  altrettanto presenti nei consigli della città.» Le sedici voci delle letture
  sono come le hai date nel prompt; gli articoli non sono stati aperti. La
  rete «aquilone» di Krackhardt è scritta dalla descrizione corrente della
  figura e controllata sui valori pubblicati.
- (b) Niente che contraddica la letteratura. Nel club di karate il membro 34
  è primo per grado, autovettore e PageRank, il membro 1 per vicinanza e
  intermediazione: il testo lo dice.
- (c) Il pannello A è in SVG e ascolta solo i clic. La vicinanza in una rete
  in più pezzi usa la scala di Wasserman e Faust. Nel pannello C i pari merito
  tra i primi dieci sono sciolti a caso.

### 04 — Triangoli, legami deboli e motivi

- (a) Le quattordici voci sono state confermate (volume e pagine). Due frasi
  sono formulate in termini generali e non sono state verificate
  sull'articolo: «Burt (2004) studiò i dirigenti di una grande azienda: quelli
  i cui contatti univano gruppi separati, che stavano nei vuoti tra un gruppo
  e l'altro, proponevano le idee giudicate migliori dai loro superiori»; e,
  su Onnela e colleghi (2007), «Primo, la sovrapposizione cresce con la forza
  per la grande maggioranza dei collegamenti.» Il conteggio «40 contro 7 ± 3»
  dei feed-forward loop è quello della Tabella 1 di Milo e colleghi (2002);
  Shen-Orr e colleghi (2002) ne elencano 34 coerenti e 6 incoerenti.
- (b) Nel pannello B, con l'interruttore spento, le tre curve (prima i più
  deboli, prima i più forti, a caso) restano entro 0,05 l'una dall'altra, con
  il seme della pagina e con altri dieci.
- (c) I termini italiani (chiusura triadica, ponte locale, sovrapposizione,
  legame debole, motivo; «feed-forward loop» resta in inglese; i tredici
  disegni sono «schemi»). Il pannello A non ha un disegno della rete. Nel
  pannello B la forza è la sovrapposizione più un numero a caso tra 0 e 0,1.
  Il pannello C disegna le reti senza punte di freccia.

### 05 — Code pesanti, fatte bene

- (a) Attenuata: «Applicata a ventiquattro insiemi di dati che erano stati
  descritti come leggi di potenza, la ricetta ne trovò alcuni compatibili con
  una legge di potenza e per altri la escluse; e dove la legge passava, spesso
  non si poteva escludere una rivale come la lognormale.» La prima metà è
  nell'abstract di Clauset, Shalizi e Newman (2009); la seconda non è stata
  confermata parola per parola (il PDF non si apriva) e non dà un conteggio.
  Letti nell'abstract: Broido e Clauset (2019), Voitalov e colleghi (2019).
  Nessun'altra voce delle letture è stata confrontata con la rivista. Le due
  voci Zenodo del riquadro sono state usate come date: vedi la sezione 4.
- (b) Il numero atteso di collegamenti ripetuti nel modello di configurazione
  è ((⟨k²⟩ − ⟨k⟩)/⟨k⟩)²/4, non /2 come nel prompt (3,85 misurati su 200 reti
  contro 4 previsti): l'hai già confermato. La ricetta lascia passare gli
  impostori, e il testo lo dice: 2.000 valori lognormali superano il test.
  L'esercizio 6 non ha una risposta netta per la lognormale: esclusa con 300
  valori (p = 0,03), non esclusa con 30.000 (p = 0,21). La stima con k_min
  basso sulle reti cresciute dà esponenti sotto il 3 della teoria.
- (c) Già confermate da te nel prompt 5b: la regola «meno di un fattore dieci
  in k» nel verdetto e l'esercizio 6 senza risposta netta. Restano come sono:
  il bootstrap parte da un pulsante; l'esperimento del pannello A prende la
  mediana di 10 reti per dimensione; i semi 2600 e 1900 sono stati scelti
  perché i campioni iniziali fossero tipici.

### 06 — Meccanismi di crescita

- (a) Lette nelle fonti: Price (1965, 1976), Dorogovtsev e colleghi,
  Krapivsky e colleghi, Jeong e colleghi (2003), Newman (2001, 2009),
  MusicLab. Riformulata rispetto al prompt, che parlava solo di distribuzione
  «ampia»: «Berger e colleghi (2003) guardarono meglio: in quel regime quasi
  tutti i nodi sono foglie con un solo collegamento, molti hub si dividono la
  cima, e una legge di potenza può valere, al massimo, per una frazione
  evanescente dei nodi.» Per Newman (2001) la lezione non dà la barra
  d'errore di 0,89 (il testo su arXiv stampa «± 0,98», probabile refuso).
  MusicLab: «circa 14.000» (sono 14.341). Solo da registri bibliografici:
  Vázquez e colleghi (2003, ComPlexUs) e Pastor-Satorras, Smith e Solé (2003).
  Il titolo di Kumar e colleghi (2000) circola in due forme; è rimasta la tua.
  D'Souza e colleghi (2007) è nelle letture ma la lezione non ne parla.
- (b) L'ottimizzazione misura un kernel sopra 1, e la passeggiata di un solo
  passo dà 1,25–1,28, sopra il lineare. Nel modello FKP la stella dura fino a
  δ ≈ √2, non solo fino a 1/√2, perché la radice è al centro del quadrato: la
  lezione lo dice. Su 20 corse l'hub più grande è tra i primi dieci nodi in
  18, ma quale cambia da una corsa all'altra.
- (c) La passeggiata riparte da un nodo a caso per ogni collegamento (la
  versione più semplice). Il pannello C mostra due stime cumulative accanto
  alla massima verosimiglianza. Per la copia il kernel è misurato sul grado
  totale. Le due lezioni superano le 1.700 parole (1.729 e 1.756).

### 07 — Fitness e competizione

- (a) È il modulo con le fonti lette più a fondo (testi completi su arXiv,
  libro di Barabási). Tre punti prudenti. Microsoft è detto «un esempio
  possibile» di condensazione. La sezione sulla condensazione dice solo ciò
  che Borgs e colleghi (2007) e Dereich, Mailler e Mörters (2017) dimostrano:
  per alberi con fitness continua fino al massimo nessun nodo tiene una
  frazione positiva. L'affermazione che un nodo tiene una quota fissa quando
  sta staccato da tutti gli altri poggia sul campo medio e sul pannello B: non
  è stato trovato un teorema, e la lezione non ne rivendica. Non c'è l'anno di
  fondazione di Google, che il libro non dà.
- (b) Dichiarati nel testo: su 20 corse il leader finale non è mai il nodo
  più adatto; il pannello B converge lentamente e dall'alto (con b = 0,9 a
  20.000 nodi mostra ancora 0,135); nel modello a crescita accelerata «Le
  distanze però non si accorciano», crescono più piano; la ricetta dà esponenti
  sotto quelli previsti per invecchiamento e crescita accelerata (correzione
  81230c9: la teoria dà 3 a ν = 0 e la ricetta legge basso, quindi i quattro
  valori si confrontano tra loro).
- (c) I sei nodi seguiti nel pannello A; le pendenze su nove dimensioni da N/2
  a N; la figura F2 mette una particella per collegamento, come i diagrammi di
  Bianconi e Barabási; l'invecchiamento è esatto fino a 20.000 nodi.

### 08 — Chi si collega a chi

- (a) Attenuate: «Per Internet al livello dei sistemi autonomi,
  Pastor-Satorras, Vázquez e Vespignani (2001) hanno trovato k_nn ∼ k^(−ν) con
  ν ≃ 0,5» (l'articolo lo dice per la sola mappa del 1998). «Litvak e van der
  Hofstad (2013) hanno dato un argomento analitico…» (l'articolo dà un
  argomento semplice, le dimostrazioni sono in un preprint collegato).
  McPherson e colleghi (2001): l'omofilia è «notevolmente robusta tra tipi
  diversi di relazione» (parole dell'articolo; il prompt diceva «tra i fatti
  più robusti»). Non si dice «lievito» per Maslov e Sneppen, perché non è
  stato confermato. Irrisolto: le pagine di Boguñá e colleghi (2004), 205–209
  nella lista e 205–210 secondo Colizza e colleghi. Non confermati: i
  capitoli di Newman (2018) per il mescolamento («Cap. 7 e 10» viene
  dall'indice).
- (b) Dichiarati nel testo: r si avvicina a zero con N sull'aggancio
  preferenziale (−0,095, −0,048, −0,023 a 1.000, 10.000, 100.000 nodi) mentre
  ρ resta a −0,31; la ricablatura assortativa massima arriva a ρ = 0,96 ma r
  solo a 0,36; contro un attacco il cablaggio assortativo è di gran lunga il
  più robusto, ma con la rimozione a caso è il più debole: «tolto un quinto
  dei nodi, la gigante assortativa ne tiene il 56%, contro il 77% e il 78%».
  Il prompt chiedeva di dire che le reti assortative tengono più a lungo
  anche a caso: i nostri numeri non lo mostrano e la lezione non lo dice. A
  parità di omofilia una minoranza tiene dentro una quota minore dei suoi
  collegamenti.
- (c) Il pannello B toglie i nodi secondo i gradi della rete intatta. L'indice
  di Coleman va da −1 a 1. L'illusione della maggioranza usa la rete a due
  gruppi del pannello.

### 09 — Comunità

- (a) Attenuate, perché la dimostrazione di ottimalità di Brandes e colleghi
  (2008) non è stata trovata: «la partizione migliore che si conosca ha
  quattro gruppi e Q = 0,4198», e nell'esercizio 4 «è il valore riportato in
  letteratura come massimo». Solo da un riassunto (la pagina non si leggeva):
  «per q gruppi uguali la condizione diventa c_in − c_out > q √c̄» (Decelle e
  colleghi 2011). A memoria, non ricontrollato: «Dal 1970 al 1972
  l'antropologo Wayne Zachary seguì un club universitario di karate…».
  Confermate: «con un solo membro classificato male» (Girvan e Newman) e i
  numeri di Traag e colleghi (2019).
- (b) Dichiarati nel testo: su reti casuali Louvain trova Q = 0,52, 0,32,
  0,23 senza che ci siano gruppi; sull'anello di cricche si ferma a 0,8871,
  poco sotto lo 0,8879 delle coppie; su 1 rete casuale su 20 la propagazione
  delle etichette supera Louvain (0,492 contro 0,490). A 1,2 volte la soglia
  la sovrapposizione spettrale è 0,46, contro lo 0,18 dei tuoi conti con
  scipy: vicino alla soglia oscilla molto.
- (c) Il club di karate è la versione di NetworkX (78 collegamenti, 17 e 17).
  Il pannello C usa la convenzione di Decelle (c_in = N p_in, quindi c_in/2
  collegamenti interni per nodo): il prompt è stato corretto nei testi. La
  bisezione spettrale si ferma dopo 4.000 iterazioni e allora dice «non
  assestata».

### 10 — Pesi, flussi e navigazione

- (a) Lette negli articoli: Barrat e colleghi, Serrano e colleghi, Travers e
  Milgram, Dodds e colleghi, Liben-Nowell e colleghi. Riformulata sul testo
  di Kleinberg (2000): «Solo con α = 2, la dimensione del reticolo, arriva in
  un numero di passi che cresce come (log N)². Per ogni altro α, nessuna
  regola che usi solo conoscenza locale può evitare un numero di passi che
  cresce come una potenza della dimensione.» Boguñá, Krioukov e claffy (2009)
  sono citati solo in termini generali, senza esponente. I capitoli di Newman
  vengono da un catalogo di biblioteca. I dati bibliografici di Lin e colleghi
  (2020) dal riferimento su arXiv. Il riquadro è nella sezione 4.
- (b) Dichiarati nel testo: dividere alla cieca un pagamento «aggiunge al
  massimo 1,4 punti percentuali di successo», mentre conoscere i saldi sposta
  il punto di metà successo dal 7% al 71% del saldo del mittente. Il miglior α
  per l'instradamento greedy è 1, 1,25, 1,5, 1,5 a L = 50, 100, 200, 400, e
  1,5 batte ancora 2 a L = 800: il 2 di Kleinberg è un limite per reticoli
  grandi. Con i pesi rimescolati la dorsale al livello 0,05 si disfa (la
  componente più grande ha l'1,3% dei nodi).
- (c) I percorsi e le due betweenness del pannello A vengono da 200 sorgenti a
  caso. Nel pannello B le capacità sono lognormali e i saldi uniformi. Il
  riquadro è più lungo del previsto (circa 200 parole). Se la lezione del
  pannello B sulla divisione alla cieca è quella che vuoi lì.

### 11 — Robustezza e cascate

- (a) Attenuate: «Cohen, Erez, ben-Avraham e Havlin (2001) mostrarono che una
  rete a coda pesante si rompe allora dopo una frazione modesta, qualche punto
  percentuale nelle loro figure» (il testo dell'articolo non dà una
  percentuale). Holme e colleghi (2002) trovarono le versioni ricalcolate
  «spesso più dannose» (parola loro: c'è un'eccezione). Per Rohrer e colleghi
  (2019) il prompt diceva che pochi nodi frammentano il grafo: non è stato
  confermato, e la frase è nel riquadro (sezione 4). Di Schneider e colleghi
  (2011) è citata solo la coppia di numeri al 5% dei collegamenti. Nessun
  capitolo per Latora, Nicosia e Russo. Le pagine di Nature e PNAS non si
  aprivano: letti da arXiv o da copie universitarie.
- (b) Dichiarati nel testo: gli scambi alzano R sotto attacco da 0,097 a
  0,221, ma «Il guadagno ha un prezzo: sotto rimozione casuale R scende da
  0,416 a 0,386». La betweenness ricalcolata è l'ordine più dannoso (R 0,082).
  Con 400 nodi e α = 0,2 togliere il nodo più carico lascia 0,070, uno a caso
  0,996. La coppia accoppiata salta tra p = 0,61 (niente) e 0,62 (0,365). Due
  reti a legge di potenza hanno bisogno di p = 0,68 dove due reti casuali
  dello stesso grado medio ne avrebbero 0,558.
- (c) Il pannello A parte da 1.000 nodi e, invece di un disegno, mostra due
  tabelle di chi si collega a chi per classe di grado. Il carico del pannello
  B comprende i cammini che finiscono nel nodo. L'ottimizzazione prova 20.000
  scambi e si ferma senza essere arrivata a convergenza.

### 12 — Epidemie su reti

Hai già rivisto questo modulo (prompt 13): nessuna correzione.

- (a) Lette nell'articolo o nell'abstract: Pastor-Satorras e Vespignani
  (2001), Lloyd-Smith e colleghi (2005), Barthélemy e colleghi (2004), Viboud
  e colleghi (2016). Riformulata sull'abstract: «Castellano e Pastor-Satorras
  (2010) mostrarono poi che la legge di potenza non serve: l'hub più grande
  basta a tenere viva un'infezione SIS…». La frase su Colgate e colleghi
  (1989), «proposero un modello che dà il cubo: una popolazione divisa per
  comportamento a rischio…», poggiava sul titolo e sul preprint dell'Istituto:
  l'hai controllata tu sull'abstract ed è giusta. Citati a memoria dei
  risultati classici, senza aprire la fonte: Kermack e McKendrick (1927),
  Newman (2002), Pastor-Satorras e Vespignani (2002), Cohen, Havlin e
  ben-Avraham (2003), la rassegna del 2015, e i capitoli di Barabási (10) e di
  Easley e Kleinberg (21). Nessun capitolo per Latora, Nicosia e Russo.
- (b) Dichiarati nel testo: con T = 0,5 la rete a coda pesante ha un grande
  focolaio un po' più piccolo di quella casuale (0,776 contro 0,796): gli hub
  abbassano la soglia, non la dimensione. La T_c di una sola rete per
  dimensione non scende in ordine (0,026, 0,035, 0,011); la media su 20 reti
  sì. Con T = 0,344 l'aggancio preferenziale ha meno grandi focolai della rete
  casuale (7 contro 13 su 20), perché quasi tutti i semi hanno due
  collegamenti. Una corsa sola sul reticolo 100 × 100 ha pendenza tra 1,99 e
  2,24.
- (c) Già decise da te: restano il grado medio 4,35 della rete a legge di
  potenza, il limite del reticolo e l'altezza della figura F1.

### 13 — Contagio sociale ed effetti di rete

- (a) Lette negli articoli: Salganik e colleghi, Granovetter (1978), Easley e
  Kleinberg cap. 19, Watts (2002), Watts e Dodds (2007), Centola (2010),
  Centola e Macy (2007, manoscritto), Ugander e colleghi (abstract). Solo da
  fonti secondarie: «Una meta-analisi di 213 applicazioni (Sultan, Farley e
  Lehmann 1990) è di solito citata per medie vicine a p = 0,03 e q = 0,38
  all'anno». La condizione sui gruppi coesi è attribuita a Easley e Kleinberg,
  perché Morris (2000) la enuncia in altra forma. Di Newman (2018) cap. 16 è
  stato letto solo l'indice. Solo da cataloghi: Katz e Shapiro (1985), Ryan e
  Gross (1943); il «7(2)» di Peterson (2018) da una citazione secondaria.
- (b) Dichiarati nel testo, e contrari all'attesa: con p = 0,01 il contagio
  semplice è 29 volte più veloce e quello complesso risparmia l'8% dei passi;
  con p = 0,5 il contagio complesso non si diffonde quasi mai (4 reti su 220),
  con p = 1 mai. Con q = 0,5 il secondo gruppo cade in 15 reti su 20 a
  k_out = 4, dove la quota media esterna è 0,286: i nodi che fanno entrare la
  cascata hanno 6,81 collegamenti esterni contro 4,01 in media. Cento persone
  sfumano il salto di Granovetter. Due tuoi valori non sono riprodotti:
  contagio semplice a p = 0,001 (119 contro 96–115) e complesso a p = 0,3
  (45 contro 37–43); sono medie su poche reti molto diverse.
- (c) La figura F2 viene prima di F1 nella lezione. Le soglie sono numeri
  reali. Il passo del grado medio nel pannello B è 0,05. Il riquadro ha circa
  180 parole contro le 160 previste. Sultan e Alabi: tenere la formulazione
  prudente o toglierli.

### 14 — Capstone: una rete reale dall'inizio alla fine

Hai già rivisto questo modulo (prompt 15): nessuna correzione; titolo, nomi
nel file dei dati, Winnipeg come quinta etichetta, «nove delle dieci
esecuzioni», altezze delle figure e frase su Brockmann e Helbing vanno bene.

- (a) Lette nel testo completo: Guimerà e colleghi (2005), Barrat e colleghi
  (2004). Nell'abstract: Peel e colleghi (2017). Attenuata sulle parole
  dell'articolo: «Colizza e colleghi (2006) trovarono un rich club moderato
  nel trasporto aereo con la stessa normalizzazione.» Solo dall'abstract, e
  quindi senza formula: «Brockmann e Helbing (2013) mostrarono su epidemie
  reali che una distanza efficace costruita dal traffico prevede i tempi di
  arrivo dove la distanza geografica non ci riesce.»
- (b) Dichiarati nel testo: Louvain fa dell'Alaska un gruppo di 131 aeroporti
  in nove esecuzioni su dieci, e nella prima la divide e mette Anchorage con
  Atlanta. La betweenness è l'ordine di rimozione più dannoso fino al 5%, il
  grado dal 10%. Lo z di r contro le ricablature è 18,7 qui e tra 10,7 e 29,8
  con altri dieci semi, quindi la lezione dice «di più di dieci deviazioni
  standard». Il rapporto di rich club è 1,20 e 1,35 con il seme della pagina
  (1,18–1,20 e 1,24–1,34 con altri dieci): la lezione dice «circa 1,2» e
  «circa 1,3». L'esponente stimato sale con il taglio inferiore (1,71, 1,80,
  1,90…): non è una legge di potenza. La forza cresce come il grado alla 1,12,
  contro l'1,5 di Barrat e colleghi, che pesavano i posti e non le compagnie.
- (c) Nessuna aperta.

## 4. I riquadri su Bitcoin

Il prompt ne conta sette; sulle pagine sono otto, perché il modulo 01 ne ha
due. Testo italiano completo, poi le fonti e come sono state verificate.

### Modulo 01 — «Un sistema, più reti»

> Bitcoin è almeno cinque reti. La **rete peer-to-peer**: i computer e le
> connessioni tra loro (per impostazione predefinita Bitcoin Core apre 8
> connessioni in uscita complete e 2 riservate ai soli blocchi). Il **grafo
> delle transazioni**: le transazioni, con un collegamento orientato ogni
> volta che un output dell'una viene speso come input di un'altra; nulla può
> essere speso prima di esistere, quindi non ha cicli. Il **grafo degli
> indirizzi**: gli indirizzi, uniti da pagamenti orientati e pesati. Il
> **grafo delle entità**: gli indirizzi raggruppati con euristiche in presunti
> proprietari, il che ne fa un'inferenza, non un'osservazione. La **Lightning
> Network**: nodi uniti da canali di pagamento, con le capacità come pesi.
> Un'affermazione sulla «rete Bitcoin» dice poco finché non sappiamo di quale
> si parla.

Fonti e verifica. Le 8 + 2 connessioni: costanti
`MAX_OUTBOUND_FULL_RELAY_CONNECTIONS = 8` e `MAX_BLOCK_RELAY_ONLY_CONNECTIONS
= 2` in `src/net.h` di Bitcoin Core (verificato nel prompt 11, versione 32.1);
uno script controlla che i moduli 01 e 11 dicano la stessa cosa. Il resto è
descrizione corrente dei cinque grafi: nessuna verifica registrata.

### Modulo 01 — «Collegamenti potenziali e collegamenti reali»

> La legge di Metcalfe valuta una rete in base ai collegamenti che potrebbe
> avere, N(N − 1)/2, che crescono come N². I collegamenti che una rete reale
> ha davvero crescono all'incirca come N. Questo scarto è una delle ragioni
> per cui N² viene di solito letto come un limite superiore al valore di una
> rete e non come una sua stima; Briscoe, Odlyzko e Tilly hanno sostenuto che
> N log N è più vicino al vero.

Fonte: Briscoe, Odlyzko e Tilly (2006), IEEE Spectrum, nelle letture.
Verifica: nessuna registrata. Non nomina Bitcoin.

### Modulo 05 — «Due cose chiamate legge di potenza»

> Una **distribuzione** dice quanto spesso compaiono valori di ciascuna
> grandezza: i gradi, le dimensioni delle città, i saldi degli indirizzi
> Bitcoin, i gradi dei nodi Lightning. La ricetta di questo modulo vale per le
> distribuzioni.
>
> Una **relazione di scala** dice che una quantità è una potenza di un'altra,
> `y ∝ x^β`: il metabolismo rispetto alla massa corporea, il prezzo di Bitcoin
> rispetto al tempo trascorso dal blocco genesi ([modulo 13 del Complexity
> Lab](/lab/bitcoin-complex-system)). Lì i dati sono un'unica curva, ordinata
> e correlata nel tempo, e la ricetta non si trasferisce così com'è. Un test
> nello stesso spirito è stato costruito per una legge di potenza nel tempo
> (Santostasi e Perrenod 2026), e la precisione di un esponente stimato
> dipende da come si modellano le fluttuazioni attorno alla tendenza (Pecere
> 2026). Entrambi gli articoli sono elencati più sotto, in «Letture
> consigliate», e altri lavori dell'Istituto sono nella nostra [pagina delle
> pubblicazioni](/research/publications).

Fonti: Santostasi e Perrenod (2026), «A Clauset-in-spirit goodness-of-fit
test for a power law in time», Zenodo 10.5281/zenodo.23105856; Pecere (2026),
Zenodo 10.5281/zenodo.23933138. Verifica: le due voci sono state usate come
le hai date (report 05); nessuno dei due articoli è stato aperto per questo
modulo. Il record di Pecere (2026) è stato aperto più tardi, per i moduli 12
e 13, ma solo per la sezione S2 del supplemento. Le due frasi che li
descrivono vanno quindi confermate da te e da Giovanni. In questo passaggio
«Istituto» ha preso la maiuscola, come nel modulo 12.

### Modulo 10 — «Lightning: una rete di canali»

> La Lightning Network di Bitcoin ([modulo 01](/network-lab/reading-a-network))
> è una rete di canali di pagamento. La capacità di un canale è pubblica; la
> sua divisione tra i due estremi è privata e cambia a ogni pagamento. Un
> pagamento ha bisogno di un percorso su cui ogni canale possa inoltrare
> l'importo nella direzione giusta: un problema di flusso in condizioni di
> incertezza, in cui il mittente scopre i saldi provando. Il teorema del
> flusso massimo e del taglio minimo mostra che più percorsi insieme possono
> portare molto più di uno solo, ed è ciò che sfruttano i pagamenti in più
> parti (*multi-part payments*); ma dividere alla cieca fa guadagnare poco,
> perché i percorsi in più sono più stretti e i saldi restano ignoti. Il
> guadagno viene da ciò che il mittente sa o impara. Pickhardt e Richter
> (2021) trattano ogni saldo come incerto e cercano il flusso con la maggiore
> probabilità di riuscire; Core Lightning ha distribuito per la prima volta un
> plugin sperimentale costruito sul loro metodo nella versione 23.08 (agosto
> 2023). Gli studi del grafo pubblico hanno trovato gradi a coda pesante
> (Seres et al. 2020, un'istantanea di gennaio 2019) e fondi concentrati in
> pochi nodi: tra gennaio 2018 e luglio 2019, in media, il 10% dei nodi
> deteneva l'80% dei bitcoin (Lin et al. 2020). Nella seconda simulazione, una
> rete sintetica, non dati di Lightning, un solo percorso scelto alla cieca
> fallisce una volta su due al 7% del saldo del mittente, e dividere alla
> cieca aggiunge al massimo 1,4 punti percentuali di successo; con tutti i
> saldi noti, metà dei pagamenti riesce ancora al 71%. Vedi anche il [modulo
> 13 del Complexity Lab](/lab/bitcoin-complex-system).

Fonti e verifica (report 10 e correzione d405929):

- Capacità pubblica, saldo privato, pagamenti in più parti: specifiche BOLT
  #7 e #4.
- Pickhardt e Richter (2021), arXiv:2107.05322: titolo, autori e metodo
  confermati.
- Core Lightning 23.08: il changelog della versione (23 agosto 2023) elenca
  «renepay: an experimental pay plugin implementing Pickhardt payments».
  Da sapere: renepay è oggi indicato come deprecato a favore di askrene/xpay
  (dalla 24.11); la frase resta vera perché dice «per la prima volta».
- Lin e colleghi (2020): confermato; dati dal 12 gennaio 2018 al 17 luglio
  2019; il «10% dei nodi con l'80% dei bitcoin» è la loro media sul periodo.
- Seres e colleghi (2020): confermato; istantanea del 3 gennaio 2019.
- Poon e Dryja: bozza 0.5.9.2 del 14 gennaio 2016, confermata.
- I tre numeri della simulazione (7%, 1,4 punti, 71%) sono nostri e sono
  fissati da `check-network-10.mjs`.

### Modulo 11 — «Le reti di Bitcoin sotto attacco»

> La rete peer-to-peer che trasporta le transazioni e i blocchi di Bitcoin è
> costruita pensando agli attacchi di questo modulo. Un nodo non accetta i
> vicini che gli vengono dati: per impostazione predefinita Bitcoin Core apre
> 8 connessioni in uscita full-relay e 2 block-relay-only ([modulo
> 01](/network-lab/reading-a-network)) verso indirizzi che sceglie dalle
> proprie tabelle. Un nodo le cui connessioni portassero tutte a un solo
> attaccante vedrebbe soltanto ciò che l'attaccante gli mostra: un'**eclissi**
> (*eclipse attack*). Heilman, Kendler, Zohar e Goldberg (2015) mostrarono
> come riempire quelle tabelle con gli indirizzi dell'attaccante; Bitcoin Core
> adottò tre delle loro contromisure nella versione 0.10.1, e in seguito le
> connessioni *feeler* (0.13.1) e il *test-before-evict* (0.17.0). Apostolaki,
> Zohar e Vanbever (2017) studiarono gli attacchi dal basso, al livello
> dell'instradamento di Internet: nel novembre 2015, 13 sistemi autonomi
> ospitavano il 30% dei nodi. Su un'istantanea di Lightning del 1 febbraio
> 2019, Rohrer, Malliaris e Tschorsch (2019) trovarono che togliere i nodi
> meglio connessi riduceva nettamente la quota di pagamenti che trovavano un
> percorso, mentre i guasti casuali staccavano poco. L'esercizio 4 fa i conti
> di un'eclissi.

Fonti e verifica (report 11, novembre 2026):

- 8 + 2 connessioni: `src/net.h` di Bitcoin Core, versione 32.1.
- Il limite totale di connessioni non è nel riquadro, di proposito: dalla
  versione 32.0 è 200, prima era 125 (note di rilascio, PR #28463).
- Le tre contromisure nella 0.10.1: lo dice l'articolo di Heilman e colleghi
  e lo confermano le note di rilascio. Connessioni feeler: 0.13.1 (PR #8282,
  controllato nel sorgente: assenti nella 0.13.0). Test-before-evict: 0.17.0
  (PR #9037).
- Apostolaki e colleghi: «13 ASes host 30% of the entire network», dieci
  giorni di dati dal 5 novembre 2015.
- Rohrer e colleghi: sull'istantanea del 1 febbraio 2019 (2.400 nodi, 13.884
  canali) la rimozione per grado o per betweenness fa scendere i pagamenti
  riusciti da 675 su 1.000 a circa il 10%. La frase non dà numeri e non dice
  che «pochi nodi frammentano il grafo», che non è stato confermato.

### Modulo 12 — «L'adozione è un'epidemia?»

> L'adozione è spesso disegnata come una curva a S: un'epidemia che parte in
> modo esponenziale e satura. Il numero di indirizzi Bitcoin con saldo non
> nullo non è cresciuto così. È vicino a una legge di potenza del tempo,
> N ∝ t^3,046 (Santostasi e Perrenod 2026, il preprint dell'Istituto; vedi il
> [modulo 13 del Complexity Lab](/lab/bitcoin-complex-system) e la nostra
> [pagina delle pubblicazioni](/research/publications#preprint)). Gli autori
> collegano la legge cubica alla diffusione epidemica su una rete eterogenea,
> citando l'onda di saturazione di Colgate e colleghi; la sezione qui sopra e
> l'esercizio 5 mostrano come può nascere una potenza del tempo.
>
> Due cautele. Un indirizzo non è un utente: una persona può averne molti, e
> un exchange ne tiene uno per molte persone (il grafo delle entità del
> [modulo 01](/network-lab/reading-a-network)). E l'esponente non è stato
> costante: stimato per sottoperiodo valeva 3,37 (2011–15), 3,00 (2016–19),
> 1,93 (2020–22) e 1,01 (2023–26) (Pecere 2026, supplemento, sezione S2). Se
> sia una pausa, un rallentamento o un conteggio che non vede più i nuovi
> arrivati è una questione aperta.

Fonti e verifica (report 12):

- Santostasi e Perrenod (2026), Zenodo 19387099 (v2, 2 aprile 2026):
  descrizione e PDF danno N(t) ∼ t^β con β = 3,046 ± 0,012, «a cubic scaling
  consistent with epidemic spreading on a heterogeneous scale-free network
  (Colgate et al., 1989; Bacchetti & Koch, 1989)»; la sezione 4.1 descrive
  l'onda di saturazione. Il rimando a Colgate è quindi degli autori. Lo script
  controlla che esponente e DOI siano quelli del modulo 13 del Complexity Lab.
- Pecere (2026), supplemento, sezione S2: record Zenodo aperto e supplemento
  letto; i quattro numeri (3,37 / 3,00 / 1,93 / 1,01; OLS, senza errori HAC)
  sono confermati.
- Colgate e colleghi (1989): l'articolo non si apriva; l'hai controllato tu
  sull'abstract (prompt 13).

### Modulo 13 — «La moneta come bene di rete»

> La moneta è il bene di rete più puro: un mezzo di scambio vale la pena di
> tenerlo perché gli altri lo accettano (Menger 1892). Massa critica, punto di
> svolta e lock-in valgono per essa come per una rete telefonica.
>
> La versione misurata è una legge di Metcalfe generalizzata, valore ∝ n^k
> ([modulo 13 del Complexity Lab](/lab/bitcoin-complex-system)). Per Bitcoin è
> stata stimata più volte: Alabi (2017) e Peterson (2018) con leggi di tipo
> Metcalfe; Wheatley e colleghi (2019), capitalizzazione di mercato contro
> indirizzi attivi, k = 1,69; Santostasi e Perrenod (2026), prezzo contro
> indirizzi con saldo non nullo, k = 1,838 (vedi la nostra [pagina delle
> pubblicazioni](/research/publications#preprint)).
>
> Due cautele. Un indirizzo non è un utente (il riquadro del modulo 12). E due
> grandezze che crescono entrambe nel tempo sono correlate qualunque cosa le
> leghi: la stima da sola non mostra che siano gli utenti a fare il valore.
> L'esponente inoltre dipende dal periodo: per sottoperiodo valeva 1,59, 2,64,
> 3,28 e 6,83 (Pecere 2026, supplemento, sezione S2).
>
> I modelli di questo modulo dicono quando un bene di rete decolla o fallisce.
> Non dicono quanto vale.

Fonti e verifica (report 13):

- Wheatley e colleghi (2019): letto; «a slope β = 1.69 (standard error
  0.0076)», 2.782 valori giornalieri da luglio 2010 a febbraio 2018.
- Peterson (2018): letto; adatta il prezzo a un valore di Metcalfe costruito
  sul numero di portafogli, non sugli indirizzi attivi. Per questo il riquadro
  dice solo «leggi di tipo Metcalfe».
- Alabi (2017): citazione confermata, contenuto no (l'abstract non si apriva;
  i riassunti parlano di Bitcoin, Ethereum e Dash contro gli indirizzi unici
  giornalieri). Da togliere, se preferisci non citare ciò che non è stato
  letto.
- Santostasi e Perrenod (2026): k = 1,838 come lo cita il modulo 13 del
  Complexity Lab (fissato dallo script contro quel file).
- Pecere (2026), supplemento, sezione S2: scaricato e letto; «the elasticity
  of the price to addresses 1.59 / 2.64 / 3.28 / 6.83» per 2011–15, 2016–19,
  2020–22, 2023–26.
- Menger (1892): citazione confermata; la frase è la lettura corrente
  dell'articolo, non una citazione.

### Modulo 14 — «Le stesse domande per Bitcoin»

> Bitcoin è più reti insieme ([modulo 01](/network-lab/reading-a-network)):
> transazioni e indirizzi, la rete peer-to-peer, i canali di pagamento, e le
> persone che lo possiedono. Il corso ha incontrato ciascuna con uno
> strumento: le code pesanti e il loro test
> ([05](/network-lab/heavy-tails-done-right)), i flussi nei canali
> ([10](/network-lab/weights-flows-navigation)), eclissi e robustezza
> ([11](/network-lab/robustness-and-cascades)), l'adozione
> ([12](/network-lab/epidemics-on-networks)), valore e utenti
> ([13](/network-lab/social-contagion-network-effects), e il [modulo 13 del
> Complexity Lab](/lab/bitcoin-complex-system)).
>
> Il metodo di questo modulo vale per tutte, e la sua prima riga conta più
> delle altre. Un indirizzo non è un utente. Un canale pubblico non mostra il
> suo saldo. Un crawler vede solo i nodi che accettano connessioni.
>
> Il banco di lavoro qui sotto accetta la tua rete: per esempio il grafo dei
> canali come lo vede il tuo nodo Lightning, l'output di `lncli
> describegraph`. Nulla esce dal browser.

Fonti e verifica (report 14): nessun dato esterno nuovo. Il formato di `lncli
describegraph` è stato letto in `lnrpc/lightning.proto` di LND (`nodes` con
`pub_key` e `alias`, `edges` con `node1_pub`, `node2_pub`, `capacity`), e il
controllo nel browser incolla un JSON di quel tipo. «Nulla esce dal browser»:
il banco di lavoro non fa richieste di rete.

### Le frasi che citano il tuo preprint o il lavoro di Santostasi e Perrenod

Non le hai ancora confermate una per una. Sono tutte qui.

Modulo 05, riquadro:

1. «Un test nello stesso spirito è stato costruito per una legge di potenza
   nel tempo (Santostasi e Perrenod 2026)»
2. «la precisione di un esponente stimato dipende da come si modellano le
   fluttuazioni attorno alla tendenza (Pecere 2026).»

Modulo 12, riquadro:

3. «È vicino a una legge di potenza del tempo, N ∝ t^3,046 (Santostasi e
   Perrenod 2026, il preprint dell'Istituto…)»
4. «Gli autori collegano la legge cubica alla diffusione epidemica su una
   rete eterogenea, citando l'onda di saturazione di Colgate e colleghi»
5. «E l'esponente non è stato costante: stimato per sottoperiodo valeva 3,37
   (2011–15), 3,00 (2016–19), 1,93 (2020–22) e 1,01 (2023–26) (Pecere 2026,
   supplemento, sezione S2).»

Modulo 13, riquadro:

6. «Santostasi e Perrenod (2026), prezzo contro indirizzi con saldo non
   nullo, k = 1,838»
7. «L'esponente inoltre dipende dal periodo: per sottoperiodo valeva 1,59,
   2,64, 3,28 e 6,83 (Pecere 2026, supplemento, sezione S2).»

Letture consigliate: modulo 05 (Santostasi e Perrenod, il test; Pecere);
moduli 12 e 13 (Santostasi e Perrenod, la derivazione meccanicistica;
Pecere). Le voci di Pecere (2026) sono identiche nei tre moduli. Nessun
pannello, figura o esercizio cita questi lavori.

Un'ambiguità: «Santostasi e Perrenod (2026)» indica due articoli diversi, il
test (modulo 05, zenodo.23105856) e la derivazione (moduli 12 e 13,
zenodo.19387099). Ogni modulo ha in bibliografia quello giusto, ma chi legge
il corso di seguito trova la stessa sigla per due lavori.

I due esponenti 3,046 e 1,838 coincidono con quelli del modulo 13 del
Complexity Lab, che dà anche il loro prodotto (≈ 5,60).

## 5. Dati e licenze

Tre insiemi di dati di terzi, tutti in `src/data/lab/networks/`, descritti in
`networks.meta.json`.

| Dati | File | Fonte | Licenza registrata | Che cosa chiede |
|---|---|---|---|---|
| Club di karate di Zachary (34 membri, 78 collegamenti) | `karate-club.json` | NetworkX, `networkx/generators/social.py`, commit e33fa19, scaricato il 19 novembre 2026. Citazione: Zachary (1977) | BSD a 3 clausole | Conservare l'avviso di copyright e il testo della licenza nelle ridistribuzioni; non usare i nomi degli autori per promuovere prodotti derivati |
| Famiglie fiorentine (15 famiglie, 20 matrimoni) | `florentine-families.json` | Come sopra. Citazione: Padgett e Ansell (1993); elenco dei collegamenti come in Breiger e Pattison (1986) | BSD a 3 clausole | Come sopra |
| Aeroporti e rotte (3.214 aeroporti, 18.858 collegamenti, rotte al giugno 2014) | `airports-2014.json` (429.103 byte) | OpenFlights, `airports.dat` e `routes.dat`, scaricati il 24 novembre 2026; gli hash SHA-256 dei due file sono nel file meta | Open Database License 1.0 (i singoli contenuti: Database Contents License 1.0) | Attribuzione visibile; il database derivato va distribuito con la stessa licenza; l'avviso va conservato |

Come è soddisfatto oggi. Per NetworkX il copyright («Copyright (c) 2004-2026,
NetworkX Developers…») e il link alla licenza sono in `networks.meta.json`; il
testo completo della licenza BSD non è nel repository, c'è solo il link: è un
punto da decidere (aggiungere il testo costa un file). Per OpenFlights
l'avviso è in `airports-2014.NOTICE.txt` accanto ai dati, il file derivato è
dichiarato sotto la stessa licenza, e la riga di credito è mostrata sotto la
prima figura del modulo 14. I due file grezzi stanno nella cartella ignorata
`scripts/lab/network-14-cache.local/` e non sono nel repository. I dati non
sono corretti: una scheda (id 5613) è sbagliata all'origine e la lezione la
usa.

Derivati dai dati, calcolati dal nostro codice:
`src/data/lab/precomputed/network-14-airports.json` (dagli aeroporti) e
`network-05-giant.json` (solo simulazioni nostre).

Il file dei prezzi del Complexity Lab (Coin Metrics, CC BY-NC 4.0). Nessuna
pagina del Network Lab lo carica. Nel sorgente lo importa un solo file,
`src/components/lab/sims/BitcoinComplexSystem.jsx`, che è la simulazione del
modulo 13 del Complexity Lab; nel sito costruito il pezzo
`bitcoin-price-….js` è richiamato solo dal pezzo `complexity-….js`; negli
elenchi dei file richiesti dalle pagine dei moduli 01–07, stampati dai
controlli di questa sessione, non compare, e nessun file della cartella
`src/components/lab/network/` importa una simulazione del Complexity Lab.

Nessun PDF di libri e nessun materiale di corsi di terzi è nel repository.

## 6. Che cosa cambia fuori dal Network Lab

Rispetto al punto in cui il ramo è partito da main (c63d572) cambiano 270
file. Fuori dalle cartelle del Lab sono sei:

- `src/data/nav.json`: la voce «Complexity Lab» (`/lab`) diventa «Labs»
  (`/labs`, con `"labs": true`), nello stesso posto tra Education e Academy.
- `src/components/Header.jsx`: la voce «Labs» ha un menu a tendina costruito
  dal registro dei lab (Complexity Lab, Network Lab), su desktop e nel menu
  mobile, ed è segnata come sezione corrente su `/labs` e su ogni pagina dei
  lab.
- `src/App.jsx`: le rotte dei lab vengono dal registro dei percorsi; si
  aggiungono `/labs`, `/network-lab` e `/network-lab/:slug`. `/lab` e
  `/lab/:slug` restano dove sono.
- `CLAUDE.md`: le sezioni che descrivono il motore dei lab, il Network Lab e
  la pagina `/labs`.
- `src/content/lab/scale-free.en.md` e `.it.md`: una frase, quella
  autorizzata nel prompt 12 (commit dcc8949). Prima: «(125 per impostazione
  predefinita)». Ora: «(200 per impostazione predefinita dalla versione 32.0;
  prima 125)». È l'unica differenza nei testi delle lezioni del Complexity
  Lab.

Dentro le cartelle dei lab, ma condiviso con il Complexity Lab:

- Il motore: `LabIndex.jsx`, `LabChapter.jsx` e `LabLecture.jsx` ricevono un
  `labId` e disegnano qualunque lab del registro; nuovi `LabsHub.jsx`,
  `loaders.js`, `LabMarkdown.jsx`, `Exercises.jsx`, `registry.js`, `paths.js`.
- `graphUtils.js` ha ricevuto il disegno a forze che prima stava in
  `sims/RandomNetwork.jsx` (spostato, non cambiato).
- `LockedZone.jsx`: il testo del blocco nomina il lab in cui ci si trova
  («Sblocca le lezioni e le simulazioni interattive del Network Lab»).
- L'indice `/lab` ha in più il link «Tutti i lab».

Che cosa non cambia: `src/data/lab/config.json` (blocco e hash) è identico a
main; `package.json` e `package-lock.json` sono identici al punto di partenza;
`public/accademia` non è toccata.

Il confronto pagina per pagina con main, su cinque pagine del Complexity Lab,
dà 144 controlli e 7 differenze, tutte su `/lab/scale-free` e tutte dovute a
quella frase (il testo, e l'altezza della pagina che cresce di 26 px). Le
altre quattro pagine sono identiche, pixel dei canvas compresi.

Chi visita la home scarica 14,0 kB di JavaScript in più (5,1 kB compressi) e
5,1 kB di CSS in più (0,9 kB compressi). Il JavaScript in più è il registro
dei lab (titoli e riassunti dei 13 + 14 moduli, testi degli indici), che ora
serve al menu, più il menu e le rotte. Il CSS in più sono le classi usate dai
componenti del Network Lab, perché il sito ha un solo foglio di stile. Nessun
codice del Network Lab (lezioni, pannelli, dati) è nel pacchetto principale.

Attenzione: `origin/main` è andato avanti di 10 commit dopo la partenza del
ramo (il Newsroom, 113 file, e una pagina People). Lì `package.json` è
cambiato. Git dice che il ramo si fonde in `origin/main` senza conflitti, ma
il sito fuso non è stato né costruito né controllato.

## 7. Incoerenze trovate

Cose viste nel passaggio di chiusura e non corrette, perché toccano un numero,
un'affermazione o una scelta tra due forme entrambe in uso.

### Numeri

1. **Club di karate, assortatività con gli stessi gradi.** Il modulo 02 dice
   nella lezione «una rete cablata a caso ha assortatività −0,30», nel
   pannello «con gli stessi gradi è circa −0,31» e «circa 3,6 deviazioni
   standard più in basso», nella soluzione dell'esercizio 6 «media nulla
   circa −0,30, deviazione standard circa 0,05, z circa −3,6». Il modulo 14
   dice «r = −0,476 contro −0,271, z = −4,3» (pannello A, punto 7, ed
   esercizio 6). Il valore osservato coincide (−0,476); la media nulla e z no.
   I due moduli usano modelli nulli calcolati in modo diverso (istogramma di
   molte randomizzazioni nel 02, dieci ricablature nel 14). File:
   `what-are-we-measuring.*.md`, `what-are-we-measuring/texts.js`,
   `capstone-a-real-network/texts.js`.
2. **Club di karate, triangoli.** Modulo 02, lezione: la transitività «non ha
   più nulla di notevole: la media nulla è 0,22 e z vale circa 1,2»; pannello:
   «z scende a circa 1,3». Modulo 14: «Clustering 0,571 contro 0,366,
   z = 3,5». Sono due misure diverse (transitività 0,256 nel 02, clustering
   medio 0,571 nel 14) e portano a due conclusioni diverse sulla stessa rete;
   nessuno dei due testi lo fa notare. In più, 1,2 e 1,3 nello stesso modulo.
3. **Lunghezza delle lezioni** fuori dall'intervallo 1.400–1.700: moduli 01,
   02 (italiano) e 06. Vedi la tabella della sezione 1.

### Termini italiani con due forme in uso

4. **Betweenness e closeness.** Il modulo 03 le traduce: «intermediazione
   (betweenness)» e «vicinanza (closeness)», poi usa sempre l'italiano (27 e
   30 volte), e così «centralità di autovettore». I moduli 09, 10, 11 e 14
   scrivono «betweenness» in italiano (lezioni, pannelli ed esercizi).
5. **Random walk.** Modulo 02: «cammino casuale» (lezione, pannello, e
   «camminatore casuale» nell'esercizio 3); così anche il Complexity Lab.
   Modulo 06: «passeggiata aleatoria», che è la forma nell'elenco dei termini.
   «Cammino» è anche la traduzione di path.
6. **Self-link.** Modulo 02: «auto-collegamento» (3 volte). Modulo 05:
   «cappio» (4 volte), la forma dell'elenco.
7. **Cut-off.** Il riassunto del modulo 05 sull'indice dice «Hub, tagli e
   mondi ultra-piccoli»; la lezione dice «cutoff naturale» (e il modulo 08
   «cutoff strutturale»), mentre «taglio» è riservato alla «legge di potenza
   con taglio».
8. **Run.** «corsa» nei moduli 06 e 07, «esecuzione» nel 14, «prova» nel 02 e
   in un punto del 14.
9. **Small world.** «small-world» resta in inglese dappertutto; il modulo 14
   ha il titolo «È un piccolo mondo?» e la frase «Quindi è un piccolo mondo».
10. **Le connessioni di Bitcoin Core.** Stesso fatto, due forme: modulo 01 «8
    connessioni in uscita complete e 2 riservate ai soli blocchi»; modulo 11
    «8 connessioni in uscita full-relay e 2 block-relay-only». In inglese le
    due frasi sono uguali.

### Bibliografie

11. **Iniziali.** «Kleinberg, J. M.» (moduli 03, 06 e la nota su Nature nel
    10) e «Kleinberg, J.» (l'articolo STOC nel modulo 10 e il libro con
    Easley); «Granovetter, M. S.» (1973, modulo 04) e «Granovetter, M.» (1978,
    modulo 13); «Price, D. J. de S.» (1965) e «Price, D. de S.» (1976). Sono
    articoli diversi e ogni forma può essere quella stampata: non toccate.
12. **Fascicoli.** Alcune riviste hanno il numero di fascicolo (IEEE Spectrum
    43(7), Computer Communication Review 29(4), Journal of the ACM 56(4),
    Alternative Investment Analyst Review 7(2)) e le altre no. Per PLoS ONE le
    due voci sono state rese uguali; le altre servono a trovare l'articolo e
    sono rimaste.
13. **Santostasi e Perrenod (2026)** indica due articoli: vedi la fine della
    sezione 4.

### Fatti controllati e trovati coerenti

Le connessioni di Bitcoin Core (moduli 01 e 11, Complexity Lab 04, 02, 07 e
10); gli esponenti 3,046 e 1,838 (moduli 12 e 13, Complexity Lab 13); le
citazioni di Pecere 2026 (moduli 05, 12, 13); Q = 0,358 e 0,4198 e NMI 0,490
del club di karate (moduli 09 e 14); l'esponente 1,5 ± 0,1 di Barrat (moduli
10 e 14); le frazioni critiche 0,75 e 0,958 (moduli 11 e 12). Tutti i rimandi
a moduli, esercizi, passi, pannelli e figure puntano a ciò che dicono, in
inglese e in italiano. I numeri delle due lingue coincidono riga per riga, e
nei testi italiani non ho trovato punti decimali o virgole delle migliaia.

## 8. Decisioni in attesa

Nessun documento del ramo assegna decisioni a Giovanni. La divisione qui sotto
è una mia proposta: a Giovanni ciò che riguarda i suoi articoli e l'Istituto,
a te il resto.

### Adriano

1. Leggere le ventotto lezioni e togliere i marcatori DRAFT.
2. Le frasi attenuate della sezione 3: tenerle così, rafforzarle dopo aver
   visto la fonte, o toglierle. Le prime da guardare: gli Strozzi (03), Burt e
   Onnela (04), la seconda metà della frase su Clauset, Shalizi e Newman (05),
   la partizione «migliore che si conosca» e le date di Zachary (09), Sultan e
   Alabi (13).
3. Il modulo 01: nessuna verifica delle fonti è registrata.
4. Le frasi 2, 5 e 7 della sezione 4, che citano il tuo preprint.
5. I numeri del club di karate (sezione 7, punti 1 e 2): allineare i due
   moduli, o dire in uno dei due perché differiscono.
6. I termini italiani con due forme (sezione 7, punti 4–10).
7. Le tre lezioni fuori lunghezza (01, 02, 06): accorciare o accettare.
8. La frase su Core Lightning (10): va bene «per la prima volta», ora che
   renepay è deprecato?
9. I due valori del modulo 13 che non riproducono i tuoi (p = 0,001 e
   p = 0,3).
10. Il testo della licenza BSD di NetworkX: aggiungerlo al repository o
    lasciare il link.
11. Se «Santostasi e Perrenod (2026)» debba diventare 2026a e 2026b.

### Giovanni

1. Le frasi 1, 3, 4 e 6 della sezione 4: descrivono il suo lavoro con
   Perrenod (il test «nello spirito di Clauset»; N ∝ t^3,046; il legame con
   Colgate; k = 1,838).
2. Le due cautele dei riquadri 12 e 13, che mettono accanto ai suoi esponenti
   quelli per sottoperiodo del tuo supplemento.
3. Il blocco: il Network Lab esce bloccato come il Complexity Lab, o aperto?
   Oggi un solo interruttore vale per tutti i lab.
4. L'indirizzo `/network-lab`, che è provvisorio, e il nome «Network Lab».
5. La voce «Labs» nel menu al posto di «Complexity Lab», e la pagina `/labs`.
6. Quando pubblicare.

## 9. Prima di pubblicare

Nessuno di questi passi è stato fatto. Il ramo `network-lab` è solo su questo
PC, tranne il primo commit del modulo 01 (9267674), che è già su
`origin/network-lab`: il ramo locale è avanti di 36 commit, più questo file
e il report del prompt 15.

- [ ] **Leggere le lezioni e togliere i marcatori DRAFT** (Adriano). La prima
  riga di ognuna delle 28 lezioni è `<!-- DRAFT: to be reviewed by Adriano
  -->`. Sulle pagine non si vede; nel repository pubblico sì.
- [ ] **Chiudere le decisioni della sezione 8** (Adriano e Giovanni). Ogni
  correzione a un testo che cita un numero va fatta insieme al suo controllo
  «quoted on the page».
- [ ] **Decidere il blocco** (Giovanni, con Adriano). Per aprire:
  `"locked": false` in `src/data/lab/config.json`. Il blocco è solo visivo: il
  repository e il sito sono pubblici, quindi lezioni e simulazioni sono
  leggibili da chi le cerca appena il ramo viene pubblicato o fuso.
- [ ] **Decidere dove vanno i documenti di lavoro** (Adriano):
  `docs/reports/` (quindici report), `docs/network-lab-status.md` e questo
  file vanno su main o restano sul ramo? Su main diventano pubblici.
- [ ] **Rifare i controlli sul ramo finale** (assistente, su tua richiesta):
  `npx vite build`, i quattordici `check-network-NN.mjs`, e i controlli nel
  browser uno alla volta, come nel README di `scripts/lab/browser-checks/`.
- [ ] **Pubblicare il ramo** (Adriano, o l'assistente su ordine esplicito):
  `git push origin network-lab`. Da quel momento i testi sono pubblici.
- [ ] **Fondere in main** (Adriano). `origin/main` è avanti di 10 commit (il
  Newsroom): la fusione non ha conflitti di testo, ma il sito fuso va
  costruito e controllato prima di pubblicarlo, soprattutto il menu, dove
  entrambe le parti hanno lavorato, e `package.json`, che su main è cambiato.
- [ ] **Dopo la fusione** (assistente): `npx vite build`, i controlli degli
  indici e dei link, e una nuova base per il confronto con main.
- [ ] **Aggiornare il file di stato** (assistente): togliere «nessun push» e
  segnare il Lab come pubblicato.
