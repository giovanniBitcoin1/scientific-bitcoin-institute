<!-- DRAFT: to be reviewed by Adriano -->

## Nessuno al comando

In una sera d'inverno, migliaia di storni volteggiano sopra una città come un'unica sagoma scura che si allunga, si ripiega e si divide, senza mai scontrarsi con se stessa. In autostrada il traffico rallenta fin quasi a fermarsi e poi si scioglie, e nel punto critico non c'è nulla: nessun incidente, solo un'onda di frenate che risale all'indietro. Una borsa perde il dieci per cento in pochi minuti senza alcuna notizia che lo spieghi. E circa ogni dieci minuti migliaia di computer indipendenti si accordano sul prossimo blocco del registro di Bitcoin.

Ogni scena mostra un comportamento coordinato su larga scala, e in nessuna c'è qualcuno che lo coordini. Nessuno storno vede lo stormo; nessun automobilista pianifica l'ingorgo; nessun server fa funzionare Bitcoin. L'ordine nasce dal basso.

## Che cosa rende complesso un sistema

Non esiste una definizione unica e condivisa, ma i sistemi complessi tendono ad avere in comune alcuni ingredienti:

- **Molti componenti:** uccelli, automobilisti, operatori, nodi.
- **Interazioni locali:** ogni componente reagisce soprattutto ai vicini, non al tutto.
- **Anelli di retroazione:** gli effetti agiscono sulle loro cause. Un prezzo che scende scatena vendite che lo spingono ancora più giù.
- **Non linearità:** le risposte non sono proporzionali alle cause. Raddoppiare l'ingresso può non cambiare nulla, oppure tutto.
- **Adattamento:** i componenti imparano, si imitano o evolvono, e così cambiano le regole stesse.

Insieme producono l'**emergenza**: il tutto ha proprietà che nessuna delle parti possiede. Una molecola d'acqua non è bagnata, un neurone non pensa e una formica non ha idea che la sua colonia coltivi funghi.

*Complesso* non vuol dire *complicato*. Un motore a reazione è complicato: molti pezzi, ciascuno con un ruolo progettato, e un ingegnere può smontarlo e capirne ogni componente. Una colonia di formiche o un'economia sono complesse: parti semplici le cui interazioni producono comportamenti che nessun progetto descrive, e smontarle distrugge proprio ciò che si voleva studiare.

## Un modo diverso di fare scienza

La fisica classica ha trionfato con sistemi di poche parti ed equazioni risolvibili. Un pianeta e la sua stella seguono orbite che si possono scrivere esattamente: ellissi, valide per sempre. Basta aggiungere un terzo corpo e tutto cambia. Alla fine dell'Ottocento Henri Poincaré dimostrò che il problema dei tre corpi, in generale, non ammette una soluzione in forma chiusa di questo tipo, e studiandolo intravide per primo ciò che oggi chiamiamo caos.

La scienza della complessità parte da questa lezione. Invece di cercare una formula risolutiva, costruisce **modelli semplici** (passi temporali discreti, griglie di celle, reti, agenti che seguono poche regole, un po' di casualità) e li fa girare al computer. Quando non esistono scorciatoie, l'unico modo di sapere che cosa fa un sistema è farlo girare e osservarlo. Qui la simulazione non sostituisce la teoria: è l'esperimento.

## Non linearità e limiti della previsione

Consideriamo animali che si riproducono una volta l'anno e misuriamo la popolazione come frazione x (tra 0 e 1) del massimo che l'ambiente può sostenere. La popolazione dell'anno successivo cresce in proporzione a quella attuale, ma viene frenata man mano che si avvicina al limite:

```math
x(n+1) = r · x(n) · (1 − x(n))
```

È la **mappa logistica**, che l'ecologo Robert May presentò nel 1976 come avvertimento: anche i modelli non lineari più semplici possono comportarsi in modi sorprendenti. L'unico parametro r fissa il tasso di crescita. Ecco che cosa succede aumentandolo:

- **r < 1:** ogni generazione è più piccola della precedente e la popolazione si estingue.
- **1 < r < 3:** la popolazione si assesta su un valore stabile, il punto fisso `x* = 1 − 1/r`. Il punto fisso è stabile finché la pendenza della mappa in quel punto, `f′(x*) = 2 − r`, è minore di 1 in valore assoluto, che è esattamente la condizione 1 < r < 3.
- **r = 3:** l'equilibrio perde stabilità e la popolazione comincia ad alternarsi tra due valori, un ciclo di periodo 2. Vicino a r ≈ 3,449 ogni ramo si divide di nuovo, dando periodo 4, poi 8, 16 e così via.
- **I raddoppi accelerano.** Ogni nuova biforcazione arriva prima della precedente, e il rapporto tra intervalli successivi tende a un numero fisso, la costante di Feigenbaum δ ≈ 4,669, che risulta la stessa per un'intera famiglia di mappe diverse.
- **r oltre circa 3,5699:** la cascata si è esaurita e il moto diventa **caotico**, senza mai ripetersi. Il caos è interrotto da strette finestre di ordine; la più ampia comincia vicino a r ≈ 3,83, dove compare all'improvviso un ciclo di periodo 3.

In questa regola non c'è casualità: dati x(0) e r, ogni valore futuro è determinato. Eppure, nel regime caotico, due punti di partenza distanti un milionesimo si allontanano finché non hanno più alcuna relazione. È la **dipendenza sensibile dalle condizioni iniziali**, in cui Edward Lorenz si imbatté nel 1963 con un modello meteorologico semplificato, poi soprannominata effetto farfalla. Poiché le misure reali hanno precisione finita, la previsione a lungo termine è impossibile nella pratica, anche se il sistema è perfettamente deterministico.

La velocità di questo allontanamento è misurata dall'**esponente di Lyapunov** λ. Un piccolo errore iniziale cresce all'incirca come

```math
|δx(n)| ≈ |δx(0)| · e^(λ·n)
```

e per la mappa logistica λ è la media a lungo termine di `ln|r · (1 − 2x(n))|`. Quando λ è negativo gli errori si riducono e il moto è prevedibile; quando λ è positivo gli errori crescono in modo esponenziale e il moto è caotico. La simulazione qui sotto permette di esplorare tutto questo direttamente.

## Dove va il corso da qui

**Reti (Moduli 02–04).** Come in una rete casuale compare all'improvviso un gigantesco cluster, perché poche scorciatoie rendono piccolo il mondo e come l'aggancio preferenziale produce hub e leggi di potenza.

**Automi cellulari e strutture (Moduli 05–07).** Griglie di celle con regole locali generano ordine, casualità e strutture quasi viventi; frattali e percolazione mostrano come anche la geometria possa diventare critica.

**Criticità e leggi di potenza (Modulo 08).** Sistemi che si portano da soli al limite dell'instabilità, dove avvengono eventi di ogni dimensione.

**Agenti, cooperazione ed economie (Moduli 09–12).** Comportamenti individuali semplici che si sommano in segregazione, ingorghi fantasma, stormi, cooperazione e ricchezza diseguale.

**Bitcoin (Modulo 13).** Il corso si chiude applicando questi strumenti a Bitcoin.

## Perché è importante per SBI

Lo Scientific Bitcoin Institute studia Bitcoin come un sistema complesso adattivo: una rete di agenti che interagiscono (miner, nodi, detentori, mercati), nessuno dei quali ha il controllo, la cui adozione e il cui prezzo mostrano regolarità a legge di potenza. Spiegare perché queste regolarità emergono richiede esattamente le idee di questo corso. Il nostro lavoro attuale è nel [preprint sulla pagina delle Pubblicazioni](/research/publications#preprint).

<!-- simulation -->

## Che cosa osservare

1. Imposta r = 2,8 e sposta x₀. Il valore finale dipende dal punto di partenza? Confrontalo con `1 − 1/r`.
2. Aumenta lentamente r da 2,9 a 3,6 e conta i rami nella serie temporale e nella ragnatela. In quali punti il numero di valori raddoppia?
3. Con r = 3,2 premi Azzera e poi Passo nel diagramma a ragnatela. Come si trasforma la scala in un anello quadrato chiuso?
4. Con r = 3,9 attiva la traiettoria gemella con ε = 10⁻⁶. Dopo quanti passi le due curve non hanno più nulla in comune? Che cosa succede a quel numero se rendi ε cento volte più piccolo?
5. Trova la finestra di periodo 3 nel diagramma di biforcazione (trascina per ingrandire intorno a r ≈ 3,83). Che cosa indica lì il contatore del periodo, e qual è il segno di λ?
6. Osserva l'esponente di Lyapunov mentre fai scorrere r da 3,4 a 4. Dove attraversa lo zero, e come corrispondono quei punti al diagramma di biforcazione?

## Letture consigliate

- R. M. May, "Simple mathematical models with very complicated dynamics", *Nature* 261 (1976).
- E. N. Lorenz, "Deterministic nonperiodic flow", *Journal of the Atmospheric Sciences* 20 (1963).
- M. J. Feigenbaum, "Quantitative universality for a class of nonlinear transformations", *Journal of Statistical Physics* 19 (1978).
- M. Mitchell, *Complexity: A Guided Tour* (Oxford University Press, 2009).
