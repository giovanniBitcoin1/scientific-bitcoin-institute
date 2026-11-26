<!-- DRAFT: to be reviewed by Adriano -->

## Ribaltare la domanda

Nei moduli dal 01 all'11 le regole erano date e ci chiedevamo come giocare. Il modulo 11 ha già confrontato delle aste, ma solo formati già esistenti. Qui le regole sono l'incognita. Un progettista vuole un risultato: l'oggetto nelle mani di chi lo valuta di più, il ricavo più alto possibile, oppure uno scambio ogni volta che lo scambio crea valore. Lo ostacola il fatto che i giocatori sanno cose che lui non sa: i loro valori, i loro costi, il loro tipo nel senso del [modulo 05](/game-theory-lab/incomplete-information-signalling).

Un **meccanismo** stabilisce che cosa ogni giocatore può dichiarare e associa alle dichiarazioni un risultato e dei pagamenti. Il progettista sceglie il meccanismo senza conoscere l'informazione privata dei giocatori; poi i giocatori giocano il gioco così definito. Un'asta è un meccanismo; lo sono anche un sistema di imposte, una regola di voto o una procedura per ripartire un costo. La **progettazione dei meccanismi** (*mechanism design*) si chiede quali risultati si possano ottenere come equilibri di un qualche meccanismo, e di quale.

Due obiettivi ricorrono. L'**efficienza**: ogni cosa va a chi la valuta di più, in modo che il valore totale creato sia il massimo possibile. Il **ricavo**: il progettista, per esempio un venditore, vuole incassare il più possibile. I due obiettivi sono spesso in conflitto, e una terza questione, se il progettista possa permettersi di finanziare il meccanismo, si rivelerà decisiva per stabilire che cosa è possibile.

## Il principio di rivelazione

Lo spazio dei meccanismi sembra infinito: offerte, orologi d'asta, turni, menu, messaggi di ogni tipo. Una sola osservazione lo rende trattabile. Supponiamo che un meccanismo abbia un equilibrio con un certo risultato. Costruiamone uno nuovo in cui ogni giocatore si limita a dichiarare il proprio tipo. Per ciascun giocatore, il progettista gioca poi la strategia che quel giocatore, con quel tipo, avrebbe giocato nel vecchio meccanismo. Se le vecchie strategie erano un equilibrio, nel nuovo meccanismo nessuno guadagna mentendo: una dichiarazione falsa porta soltanto il progettista a giocare per lui una strategia che avrebbe potuto scegliere da sé, e che non ha scelto. Un **meccanismo diretto**, in cui dire il vero è un equilibrio, dà dunque lo stesso risultato.

È il **principio di rivelazione**. Allan Gibbard (1973) lo enunciò per le strategie dominanti; sulla base del suo lavoro, alla fine degli anni Settanta diversi autori lo trovarono in modo indipendente per l'equilibrio bayesiano, tra cui Roger Myerson (1979) e Partha Dasgupta, Peter Hammond ed Eric Maskin (1979). Grazie al principio, la ricerca si può limitare ai meccanismi diretti in cui dire il vero conviene: quelli che soddisfano la **compatibilità degli incentivi**. Conteranno due tipi di meccanismi. In alcuni la verità è una **strategia dominante**: la migliore qualunque cosa dichiarino gli altri, come nell'asta al secondo prezzo del modulo 11. In altri è solo un equilibrio del gioco bayesiano: la migliore se gli altri dicono il vero.

Ciò che il principio non dice conta altrettanto. Non dice che il meccanismo diretto sia semplice: dichiarare un tipo intero può essere impraticabile, e i meccanismi reali chiedono meno. Non dice che la verità sia l'unico equilibrio del meccanismo diretto: possono essercene altri, peggiori per il progettista. È uno strumento per capire che cosa è possibile, non una ricetta per costruirlo.

## Il prezzo è un'area

Prendiamo l'informazione privata più semplice: ogni giocatore ha un solo numero, il proprio valore per unità di ciò che ottiene. Ciò che ottiene può essere la probabilità di aggiudicarsi un oggetto, un numero di clic su un annuncio o la probabilità di vincere una lotteria. Una **regola di allocazione** x(b) dice quanto ottiene un giocatore che offre b, fissate le offerte degli altri.

Il **lemma di Myerson** (Myerson 1981) risponde insieme a due domande. Primo, a una regola di allocazione si possono associare pagamenti che rendono la verità dominante se e solo se la regola è **monotona**: offrendo di più non si ottiene mai di meno. Secondo, per una regola monotona il pagamento è allora univocamente determinato, una volta stabilito che un'offerta di 0 paga 0:

```math
p(b) = b·x(b) − ∫₀ᵇ x(z) dz
```

La Figura F1 disegna la regola. Per un offerente con valore b, il rettangolo b × x(b) è ciò che ottiene, misurato al suo valore. L'area sotto la curva da 0 a b è ciò che tiene, il suo *payoff*; il resto del rettangolo, sopra la curva, è ciò che paga.

```figure
area
```

Per un solo oggetto la curva è un gradino in corrispondenza dell'offerta rivale più alta h: il pagamento è il rettangolo, b, meno l'area sotto il gradino, b − h, cioè h. Il secondo prezzo del modulo 11 non è una buona idea tra tante: è l'unico prezzo che rende veritiera quella regola. Per due spazi pubblicitari che ricevono 1 e α2 clic, con offerte rivali h1 > h2, la curva ha due gradini e lo spazio in alto costa α2·h2 + (1 − α2)·h1. L'**asta generalizzata al secondo prezzo** (*generalized second price*, GSP), usata per gli annunci nei motori di ricerca, fa pagare a ogni inserzionista, per clic, l'offerta successiva. Per lo spazio in alto chiede quindi h1, e non è veritiera: un inserzionista può guadagnare offrendo poco e prendendo il secondo spazio (Benjamin Edelman, Michael Ostrovsky e Michael Schwarz 2007; Hal Varian 2007). La Simulazione A lo mostra.

Myerson trovò anche l'asta che rende di più. Se i valori sono estratti in modo indipendente da una distribuzione F con densità f, il pagamento atteso di un offerente è uguale al **valore virtuale** atteso di ciò che ottiene:

```math
φ(v) = v − (1 − F(v))/f(v)
```

Quando φ cresce con v, come nell'esempio che segue, il venditore deve quindi assegnare l'oggetto all'offerente con il valore virtuale più alto, se è positivo, e altrimenti a nessuno: è l'**asta ottima**. Con valori uniformi tra 0 e 100, φ(v) = 2v − 100, positivo sopra 50: l'asta ottima è l'asta al secondo prezzo con una riserva di 50, la riserva migliore già vista nel modulo 11.

## Paghi il danno che fai

Il lemma di Myerson riguarda un solo numero per giocatore. Con più oggetti il tipo di un giocatore è un'intera tabella di valori, uno per ogni pacchetto di oggetti che potrebbe ottenere. William Vickrey (1961), Edward Clarke (1971) e Theodore Groves (1973) hanno proposto un meccanismo in cui la verità resta dominante. Il **meccanismo VCG** (Vickrey–Clarke–Groves) sceglie il risultato con il totale più alto dei valori dichiarati. Ogni giocatore paga poi la perdita che la sua presenza impone agli altri: il miglior totale che gli altri avrebbero avuto senza di lui, meno il totale che hanno con lui. È l'**esternalità** che il giocatore causa, la stessa idea dei pedaggi del [modulo 08](/game-theory-lab/congestion-price-of-anarchy).

La verità è dominante per questa ragione: il payoff di un giocatore è il suo valore più il totale degli altri, meno un termine che non dipende dalla sua dichiarazione. La dichiarazione influisce solo sul risultato, e quando il giocatore dice il vero il meccanismo sceglie già il risultato che massimizza quella somma. La verità è dominante e il risultato è efficiente, per qualunque numero di oggetti e per qualunque valore. Con un solo oggetto è di nuovo l'asta al secondo prezzo: la presenza del vincitore costa agli altri il secondo valore più alto.

La Simulazione B applica il VCG a due oggetti, A e B, con offerte per ciascun oggetto preso da solo e per entrambi.

## Ciò che le regole non possono fare

Il VCG sembrerebbe chiudere la questione. Non è così. Lawrence Ausubel e Paul Milgrom (2006) ne hanno elencato i difetti. Il suo ricavo può essere molto basso, perfino nullo: nell'«asta solitaria» della Simulazione B un offerente vuole entrambi gli oggetti per 4, altri due vogliono un oggetto ciascuno per 4, e il venditore non riceve nulla. Il ricavo può scendere quando entra un offerente: senza il terzo la stessa asta rende 4. Gli offerenti perdenti possono colludere: due offerenti che valutano A e B 1 ciascuno possono offrire entrambi 10, vincere e non pagare nulla. Infine un offerente può guadagnare presentando **offerte sotto falso nome** (*false-name bids*; Makoto Yokoo, Yuko Sakurai e Shigeo Matsubara 2004): chi valuta entrambi gli oggetti 6 paga 4 come una persona sola e nulla con due nomi.

Il limite più profondo riguarda il problema più semplice, lo **scambio bilaterale**. Un venditore ha un oggetto che gli costa c; un compratore lo valuta v; ciascuno conosce solo il proprio numero. Lo scambio crea valore quando v ≥ c. Roger Myerson e Mark Satterthwaite (1983) hanno mostrato che, quando i valori e i costi possibili si sovrappongono, nessuna regola ha insieme quattro proprietà. Non può essere al tempo stesso efficiente, veritiera, volontaria (nessuna delle due parti si aspetta di perdere partecipando: la **razionalità individuale**) e in **pareggio di bilancio** (il progettista non paga né trattiene denaro).

La Figura F2 lo traduce in numeri, con valori e costi uniformi tra 0 e 100. Scambiare ogni volta che v ≥ c crea in media 16,67. Il VCG ci riesce, in modo veritiero e volontario, ma il compratore paga c mentre il venditore riceve v, e il progettista paga la differenza: tutta, in media 16,67. Un prezzo fisso di 50, che ciascuna parte accetta o rifiuta, è veritiero, volontario e in pareggio, ma crea solo 12,5. Dividere la differenza tra le due offerte, un'**asta doppia** (Kalyan Chatterjee e William Samuelson 1983), crea 14,06 nel suo equilibrio lineare, in cui i due scambiano solo quando il valore supera il costo di 25 o più. Myerson e Satterthwaite hanno mostrato che 14,06 è il massimo che una regola in pareggio e volontaria possa creare qui: delle quattro proprietà, una regola può averne al massimo tre.

```figure
trade
```

```box
Chi gestisce l'asta?
**Inoltrare le transazioni.** Un nodo che conosce una transazione è in concorrenza, per la sua commissione, con ogni nodo a cui la comunica. Moshe Babaioff, Shahar Dobzinski, Sigal Oren e Aviv Zohar (2012) hanno osservato che il protocollo, così come era implementato, premiava chi teneva le transazioni per sé. Hanno proposto ricompense per i nodi che le inoltrano, poco costose e resistenti alle identità false (a prova di attacco Sybil): con queste ricompense, inoltrare senza clonarsi è ciò che sopravvive all'eliminazione iterata delle strategie dominate. Hanno anche mostrato che nessuno schema di ricompense ne fa una strategia dominante.

**Il banditore fa offerte.** Il *miner* conduce l'asta delle commissioni e le incassa: può aggiungere transazioni proprie o accordarsi con gli utenti fuori dalla catena. Tim Roughgarden (2021) ha posto tre requisiti a un meccanismo delle commissioni (*transaction fee mechanism*): che agli utenti convenga offrire il proprio valore (compatibilità degli incentivi per gli utenti), che il miner non guadagni nulla scostandosi dalla regola (*myopic miner incentive compatibility*) e che nessun accordo tra il miner e gli utenti renda di più (*OCA-proofness*). «Paghi la tua offerta» soddisfa il secondo e il terzo requisito, non il primo; un prezzo uniforme si avvicina al primo ma non soddisfa il secondo. Nella Simulazione C, con 20 utenti e 10 posti, il prezzo uniforme onesto rende 476,19, un'offerta falsa 523,81 e l'imbroglio migliore circa 547; il payoff totale degli utenti scende da 261,90 a circa 153,5. Con posto per tutti e 20 gli utenti il miner onesto incassa 0, e quello che imbroglia circa 579. EIP-1559, adottato da Ethereum il 5 agosto 2021, brucia una commissione base (*base fee*) e, nell'analisi di Roughgarden, soddisfa tutti e tre i requisiti, salvo in caso di picco improvviso della domanda. Hao Chung ed Elaine Shi (2023) hanno mostrato che con un blocco di capacità finita nessuna regola non banale rende la verità dominante per gli utenti e resiste anche a un accordo tra il miner e un solo utente.

**Un'ipotesi, non una descrizione.** Una lettura della scelta di Bitcoin: mantiene «paghi la tua offerta», che il miner non può aggirare con offerte false, al prezzo di costringere gli utenti a indovinare quanto offrire. È un'affermazione sugli incentivi, non su come si comportano i miner.
```

## Il prossimo modulo

Il [modulo 13](/game-theory-lab/mining-as-a-game), «Il mining come gioco», tratta il protocollo stesso come un meccanismo, e si chiede se seguirlo sia un equilibrio per un miner.

<!-- simulation -->

## Letture consigliate

- Roughgarden, T. (2016). *Twenty Lectures on Algorithmic Game Theory*. Cambridge University Press. Lezioni 3 (il lemma di Myerson), 4 (progettazione algoritmica dei meccanismi; il principio di rivelazione), 5 (aste che massimizzano il ricavo), 7 (meccanismi con più parametri: il VCG).
- Nisan, N., Roughgarden, T., Tardos, É. e Vazirani, V. V. (a cura di) (2007). *Algorithmic Game Theory*. Cambridge University Press. Cap. 9 (introduzione alla progettazione dei meccanismi).
- Krishna, V. (2010). *Auction Theory*, 2ª ed. Academic Press. Cap. 5 (progettazione dei meccanismi, VCG, scambio bilaterale).
- Tadelis, S. (2013). *Game Theory: An Introduction*. Princeton University Press. Cap. 14 (progettazione dei meccanismi).
- Shoham, Y. e Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Cap. 10 (progettazione dei meccanismi; 10.4.5 sui difetti del VCG).
- Gibbard, A. (1973). Manipulation of voting schemes: a general result. *Econometrica* 41, 587–601.
- Myerson, R. B. (1979). Incentive compatibility and the bargaining problem. *Econometrica* 47, 61–73.
- Dasgupta, P., Hammond, P. e Maskin, E. (1979). The implementation of social choice rules: some general results on incentive compatibility. *Review of Economic Studies* 46, 185–216.
- Myerson, R. B. (1981). Optimal auction design. *Mathematics of Operations Research* 6, 58–73.
- Vickrey, W. (1961). Counterspeculation, auctions, and competitive sealed tenders. *Journal of Finance* 16, 8–37.
- Clarke, E. H. (1971). Multipart pricing of public goods. *Public Choice* 11, 17–33.
- Groves, T. (1973). Incentives in teams. *Econometrica* 41, 617–631.
- Myerson, R. B. e Satterthwaite, M. A. (1983). Efficient mechanisms for bilateral trading. *Journal of Economic Theory* 29, 265–281.
- Chatterjee, K. e Samuelson, W. (1983). Bargaining under incomplete information. *Operations Research* 31, 835–851.
- Edelman, B., Ostrovsky, M. e Schwarz, M. (2007). Internet advertising and the generalized second-price auction: selling billions of dollars worth of keywords. *American Economic Review* 97, 242–259.
- Varian, H. R. (2007). Position auctions. *International Journal of Industrial Organization* 25, 1163–1178.
- Ausubel, L. M. e Milgrom, P. (2006). The lovely but lonely Vickrey auction. In Cramton, P., Shoham, Y. e Steinberg, R. (a cura di), *Combinatorial Auctions*. MIT Press. Cap. 1.
- Yokoo, M., Sakurai, Y. e Matsubara, S. (2004). The effect of false-name bids in combinatorial auctions: new fraud in internet auctions. *Games and Economic Behavior* 46, 174–188.
- Babaioff, M., Dobzinski, S., Oren, S. e Zohar, A. (2012). On Bitcoin and red balloons. *ACM Conference on Electronic Commerce (EC 2012)*, 56–73.
- Roughgarden, T. (2021). Transaction fee mechanism design. *ACM Conference on Economics and Computation (EC 2021)*; versione su rivista *Journal of the ACM* 71 (2024).
- Chung, H. e Shi, E. (2023). Foundations of transaction fee mechanism design. *ACM-SIAM Symposium on Discrete Algorithms (SODA 2023)*, 3856–3899.
