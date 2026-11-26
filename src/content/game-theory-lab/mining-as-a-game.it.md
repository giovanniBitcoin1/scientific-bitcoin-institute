
## Le quattro scelte di un miner

Il [modulo 12](/game-theory-lab/mechanism-design) chiedeva come scrivere regole che i giocatori vogliano seguire. Il protocollo di Bitcoin è un insieme di regole di questo tipo, con una particolarità: nessuno lo gestisce. Non c'è un banditore che raccolga le dichiarazioni e imponga l'esito. Ogni *miner* decide da solo, con le proprie macchine, che cosa fare, e le regole reggono solo finché seguirle gli conviene. Nel linguaggio del modulo 12, il protocollo è un meccanismo senza un progettista ai comandi.

Narayanan e coautori (2016, sezione 5.5) elencano le quattro decisioni che ogni miner prende e, per ciascuna, la scelta predefinita dell'**implementazione di riferimento**:

1. **Quali transazioni includere.** Di default, ogni transazione che paga una commissione sopra un minimo.
2. **Su quale blocco costruire.** Di default, sull'ultimo blocco della **catena più lunga** tra quelle valide.
3. **Quale seguire tra due blocchi della stessa altezza.** Di default, quello ricevuto per primo.
4. **Quando annunciare un blocco trovato.** Di default, subito.

Ogni scelta predefinita si cambia con poche righe di codice, e ogni cambiamento è un'altra strategia. La prima decisione è il mercato delle commissioni del [modulo 11](/game-theory-lab/auctions) e del riquadro del modulo 12. Nella seconda entrano il *punitive forking* e il *feather fork*: minacce di rifiutare una catena che contiene certe transazioni, esaminate nel riquadro del [modulo 04](/game-theory-lab/sequential-games-commitment). Questo modulo riguarda la terza e la quarta: che cosa succede quando un miner tiene un blocco per sé.

## Seguire il protocollo è un equilibrio?

Joshua Kroll, Ian Davey ed Edward Felten (2013) hanno modellato il *mining* come un gioco in cui ogni miner sceglie quale blocco estendere. Hanno mostrato che esiste un equilibrio di Nash in cui ogni miner si comporta come prevede l'implementazione di riferimento, e anche infiniti altri in cui i miner si comportano diversamente. Se tutti gli altri estendono la catena più lunga, estenderla è una miglior risposta; ma se tutti seguissero un'altra regola, anche seguire quella sarebbe una miglior risposta. Spiegano la catena più lunga come il punto focale, nel senso del [modulo 02](/game-theory-lab/nash-equilibrium), di un problema di coordinamento che nessuno negozia.

Qui contano due limiti di questo risultato. Nel loro modello un blocco non si può tenere segreto: trattenerlo non è tra le strategie. Inoltre un equilibrio di Nash riguarda un giocatore alla volta. Dice che nessuno guadagna deviando da solo, se gli altri seguono il protocollo. Non dice che ogni miner sia troppo piccolo per guadagnare. Un miner con un terzo dell'*hash rate* è un solo giocatore, ma grande, e la domanda diventa se anche per lui la miglior risposta a una rete onesta sia comportarsi onestamente.

## Nascondere e rivelare

Ittay Eyal ed Emin Gün Sirer (2014) hanno trovato una deviazione che conviene a un miner grande e l'hanno chiamata *selfish mining*. Un miner con una quota α dell'hash rate tiene segreti i blocchi che trova e costruisce una **catena privata**. Finché è in vantaggio, gli altri lavorano su una catena che lui sta per sostituire. Quando stanno per raggiungerlo, pubblica quanto basta della sua catena per vincere. I miner onesti sprecano lavoro su blocchi che finiscono **orfani**, e la quota del miner nella catena che sopravvive può superare la sua quota del lavoro.

La strategia, che autori successivi chiamano SM1, ha quattro regole:

- Se non ha vantaggio, il blocco che trova resta segreto: il suo **vantaggio** diventa 1.
- Se gli altri trovano un blocco mentre lui è avanti di 1, pubblica il suo e due blocchi della stessa altezza entrano in competizione: è una **gara**. Una quota γ dei miner onesti costruisce sul suo blocco, gli altri sul proprio; decide il blocco successivo.
- Se gli altri trovano un blocco mentre lui è avanti di 2, li pubblica entrambi e vince: il loro blocco diventa orfano.
- Con un vantaggio maggiore, ogni blocco degli altri gli fa pubblicare uno dei suoi; il vantaggio scende di uno e il loro blocco diventerà orfano quando lui vincerà.

Contiamo un passo per ogni blocco trovato, suo con probabilità α. Il suo vantaggio è allora una **catena di Markov** sugli stati 0, 0′ (una gara in corso), 1, 2, 3 e così via, disegnata nella Figura F1. La sua **distribuzione stazionaria**, cioè la frazione di un lungo periodo passata in ciascuno stato, ha una forma chiusa. Da essa si ricavano r_A e r_H, i blocchi suoi e degli altri che finiscono nella catena per ogni blocco trovato, e la sua **quota dei blocchi** della catena, R = r_A/(r_A + r_H):

```math
R(α, γ) = [α(1 − α)²(4α + γ(1 − 2α)) − α³] / [1 − α(1 + (2 − α)α)]
```

```figure
chain
```

## Quando conviene?

R supera α esattamente quando

```math
α > (1 − γ) / (3 − 2γ)
```

La **soglia di redditività** è un terzo se il miner perde ogni gara (γ = 0), un quarto se ne vince metà (γ = 1/2) e zero se le vince tutte (γ = 1): allora guadagna un miner di qualunque dimensione. La Figura F2 disegna R in funzione di α per vari γ. Con α = 0,4 e γ = 0 la sua quota è 0,4837, e 29,5 blocchi ogni 100 trovati diventano orfani, 23,6 dei quali degli altri. Anche lui perde blocchi, 5,9 ogni 100, ma gli altri ne perdono quattro volte tanti.

```figure
threshold
```

Eyal e Sirer ne hanno concluso che il protocollo di Bitcoin non soddisfa la compatibilità degli incentivi. Felten ha risposto in pochi giorni (7 novembre 2013) con un'obiezione di teoria dei giochi: una coalizione di miner che mettesse in comune il proprio hash rate per il selfish mining non resterebbe unita. Ogni membro guadagnerebbe imbrogliando gli altri: minando con il gruppo quando è in vantaggio e onestamente altrimenti (*fair-weather mining*). È la logica del cartello del [modulo 06](/game-theory-lab/repeated-games-reputation). Un'osservazione nostra, non di Felten: una quota superiore ad α fa del selfish mining una deviazione che conviene a un miner grande contro una rete onesta, ma non ne fa una strategia dominante, cioè migliore qualunque cosa facciano gli altri. Il riquadro del modulo 06 trattava un'altra forma di *block withholding*, rivolta contro un *pool* rivale anziché contro la catena.

## La difficoltà si adegua

R è una quota, non un reddito. Il selfish mining rende orfani alcuni blocchi, quindi la catena cresce solo di G = r_A + r_H blocchi per ogni blocco trovato: 43/61, circa 0,705, con α = 0,4 e γ = 0. Bitcoin esegue un **aggiustamento della difficoltà** ogni 2016 blocchi, circa due settimane, perché arrivi in media un blocco ogni dieci minuti (Nakamoto 2008, sezione 4). Fino all'aggiustamento successivo i blocchi si trovano ancora al ritmo di uno ogni dieci minuti. Il miner incassa r_A ogni dieci minuti, dove il mining onesto renderebbe α: con α = 0,4 e γ = 0, l'85,25% del reddito onesto, per 14/G = 19,86 giorni. Poi la difficoltà scende per adattarsi alla catena più lenta, la catena torna a crescere di un blocco ogni dieci minuti e il suo reddito diventa R ogni dieci minuti: il 120,93% di quello onesto. Recupera la perdita il giorno 33,86, quando le due ricompense cumulate si incontrano (T₁ = 14/G è il giorno del primo aggiustamento):

```math
T_pari = T₁ · (R − r_A) / (R − α)
```

Cyril Grunspan e Ricardo Pérez-Marco (2018) hanno mostrato di più: nessuna strategia rende più del mining onesto prima di un aggiustamento della difficoltà, quindi il selfish mining è un attacco alla regola di aggiustamento e il guadagno arriva solo dopo l'aggiustamento. La Simulazione B disegna le due ricompense attese e un percorso simulato.

## La deviazione migliore

SM1 è una strategia tra tante: chi attacca potrebbe pubblicare meno, aspettare di più, arrendersi più tardi. Ayelet Sapirshtein, Yonatan Sompolinsky e Aviv Zohar (2016) hanno formulato il problema dell'attaccante come un **processo decisionale di Markov**. Lo stato è (a, h, fork): a blocchi sulla sua catena privata e h su quella pubblica dalla separazione. L'etichetta fork dice se l'ultimo blocco era suo (*irrelevant*) o un blocco onesto che può pareggiare subito (*relevant*), oppure se è in corso una gara (*active*). Le azioni sono quattro: *adopt* (abbandona la sua catena e mina su quella degli altri), *override* (pubblica h + 1 blocchi e vince, possibile se a > h), *match* (pubblica h blocchi e apre una gara) e *wait* (continua a minare in privato). Il suo obiettivo, la quota della catena, è un rapporto. Lo riconducono a una famiglia di problemi ordinari a ricompensa media: per un valore di prova ρ, si massimizza (1 − ρ)·r_A − ρ·r_H. Il valore ottimo è zero esattamente quando ρ è la quota migliore, trovata poi con una ricerca su ρ.

La **politica ottima** rende più di SM1. Con γ = 0 la loro tabella dà 0,37077 con α = 0,35, contro lo 0,3665 di SM1, e conviene da circa α = 0,329 anziché da un terzo (nostro calcolo, con un **troncamento** a 40 blocchi: 0,3294). L'attaccante ottimale non si arrende appena resta indietro di un blocco: indietro di uno o due blocchi, continua a minare in privato per recuperare. Se vince qualche gara, pareggia un blocco onesto dove SM1 pubblicherebbe tutto. Da γ di circa 0,2 in su le due soglie coincidono (un quarto con γ = 1/2), anche se oltre la soglia la politica ottima rende di più. Con ritardi nella rete, sostengono gli autori, la soglia scompare del tutto: anche ai miner piccoli conviene deviare ogni tanto.

## Perché non si è visto?

Non ci sono prove pubbliche di selfish mining su Bitcoin. Le ragioni qui sotto sono ipotesi, non risultati.

- **Dimensione.** Con γ vicino a 0 non conviene sotto circa un terzo dell'hash rate. Sapirshtein e coautori suggeriscono che questo possa spiegare in parte perché non sia stato osservato.
- **Costo.** Le prime settimane hanno un costo. Con α = 0,4 chi attacca incassa l'85,25% del reddito onesto per quasi 20 giorni prima di guadagnare, e deve confidare che nel frattempo nulla cambi.
- **Visibilità.** Un'impennata dei blocchi orfani non passerebbe inosservata. I tassi misurati sono stati piccoli: lo 0,41% dei blocchi era orfano (*stale*) nel febbraio 2016 (Gervais e coautori, 2016), mentre SM1 con α = 0,4 renderebbe orfani 29,5 blocchi ogni 100 trovati.
- **Pool e prezzi.** Un pool che lo facesse potrebbe perdere i suoi miner, che scelgono a quale pool unirsi ([modulo 10](/game-theory-lab/coalitions-sharing)), e si troverebbe con monete il cui valore l'attacco mette a rischio (modulo 14).

Nessuna di queste chiude la questione: ciascuna dice solo che i *payoff* del modello potrebbero non essere quelli di un miner reale.

## Il prossimo modulo

Il [modulo 14](/game-theory-lab/capstone-the-price-of-security), il *capstone*: quanto costa la sicurezza e chi la paga quando la ricompensa del blocco scende.

<!-- simulation -->

## Letture consigliate

- Narayanan, A., Bonneau, J., Felten, E., Miller, A. e Goldfeder, S. (2016). *Bitcoin and Cryptocurrency Technologies*. Princeton University Press. Cap. 5 (il mining di Bitcoin; 5.5, incentivi e strategie del mining).
- Nakamoto, S. (2008). Bitcoin: a peer-to-peer electronic cash system. Sezioni 4 (proof-of-work), 6 (incentivi) e 11 (calcoli).
- Kroll, J. A., Davey, I. C. e Felten, E. W. (2013). The economics of Bitcoin mining, or Bitcoin in the presence of adversaries. *Workshop on the Economics of Information Security (WEIS 2013)*.
- Eyal, I. e Sirer, E. G. (2014). Majority is not enough: Bitcoin mining is vulnerable. *Financial Cryptography 2014*, LNCS 8437, 436–454.
- Felten, E. W. (2013). Bitcoin isn't so broken after all. *Freedom to Tinker* (CITP, Princeton), 7 novembre 2013.
- Sapirshtein, A., Sompolinsky, Y. e Zohar, A. (2016). Optimal selfish mining strategies in Bitcoin. *Financial Cryptography 2016*, LNCS 9603 (2017), 515–532; arXiv:1507.06183.
- Grunspan, C. e Pérez-Marco, R. (2018). On profitability of selfish mining. arXiv:1805.08281 (preprint).
- Nayak, K., Kumar, S., Miller, A. e Shi, E. (2016). Stubborn mining: generalizing selfish mining and combining with an eclipse attack. *IEEE European Symposium on Security and Privacy (EuroS&P 2016)*, 305–320.
- Gervais, A., Karame, G. O., Wüst, K., Glykantzis, V., Ritzdorf, H. e Capkun, S. (2016). On the security and performance of proof of work blockchains. *ACM CCS 2016*, 3–16.
