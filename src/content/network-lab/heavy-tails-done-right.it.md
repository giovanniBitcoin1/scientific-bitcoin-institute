<!-- DRAFT: to be reviewed by Adriano -->

## Una domanda, due risposte

Nel 2019 Anna Broido e Aaron Clauset esaminarono le distribuzioni dei gradi di quasi mille reti e conclusero che le reti a invarianza di scala sono rare: solo il 4% dava la prova più forte di una legge di potenza, e il 52% la più debole. Lo stesso anno Ivan Voitalov e colleghi risposero che non sono affatto rare, purché si chiami così ogni distribuzione la cui coda decresce come una legge di potenza, qualunque cosa faccia il resto. Dati dello stesso tipo, due verdetti, perché i due gruppi avevano posto domande diverse.

Il [modulo 04 del Complexity Lab](/lab/scale-free) ha introdotto le leggi di potenza, la CCDF e la stima di massima verosimiglianza. Questo modulo parte da lì, in due metà: che cosa fa una coda pesante a una rete, e come la si misura. Ovunque γ è l'esponente dei gradi, `p_k ∝ k^(−γ)`; la CCDF decresce allora con esponente γ − 1.

## Che cosa cambia la coda

Per una legge di potenza il momento ⟨k^n⟩ è finito solo se n < γ − 1. Tra γ = 2 e γ = 3 la media è finita e il momento secondo no: in una rete reale è un numero che cresce con la dimensione della rete.

Quanto è grande il grado massimo? Chiamiamo k_max il grado oltre il quale ci aspettiamo circa un nodo su N. Con `P(K ≥ k) = (k / k_min)^(−(γ−1))` si ottiene

```math
k_max = k_min · N^(1/(γ−1))
```

il **cutoff naturale**. Con N = 10⁶ e k_min = 1 vale 100 per γ = 4, 1.000 per γ = 3, 10.000 per γ = 2,5 e circa 285.000 per γ = 2,1. Una rete casuale con il grado medio del caso γ = 2,5, poco meno di 2, avrebbe un grado massimo di circa 12. Sotto γ = 2 l'hub più grande avrebbe bisogno di più collegamenti di quanti sono i nodi: una rete grande senza collegamenti ripetuti non può avere una coda simile.

```figure
hub
```

Letta al contrario, la formula dice quanto deve essere grande una rete per mostrare la sua coda. Per seguire una legge di potenza su tre decadi di k servono N = 10^(3(γ−1)) nodi: un milione con γ = 3, un miliardo con γ = 4. Molte reti reali sono troppo piccole per mostrare la loro coda, qualunque essa sia.

## Mondi ultra-piccoli

Gli hub sono scorciatoie. In una rete casuale con una data distribuzione dei gradi la distanza media cresce come ln N quando γ > 3, come nelle reti small-world del [modulo 03 del Complexity Lab](/lab/small-worlds); come ln N / ln ln N con γ = 3; e come ln ln N per 2 < γ < 3 (Chung e Lu 2002; Cohen e Havlin 2003), i mondi «ultra-piccoli» (*ultra-small worlds*). Per N = 10⁹ le tre espressioni valgono 20,7, 6,8 e 3,0. Dicono come scalano le distanze, non quanto valgono. Ma la differenza è reale, e la prima simulazione la mostra: da cento a centomila nodi la distanza media passa da 6,6 a 15,8 con γ = 4, e da 3,0 a 3,5 con γ = 2,2.

## Una rete con i gradi che vuoi

Per vedere che cosa fa una distribuzione dei gradi servono reti che abbiano quella e nient'altro. Si danno al nodo i esattamente k_i mezzi collegamenti, poi si uniscono i mezzi collegamenti a coppie, a caso. È il **modello di configurazione**: il modello nullo del modulo 02, usato come generatore.

L'accoppiamento non sa che una rete dovrebbe essere semplice. Crea **cappi**, cioè collegamenti di un nodo con sé stesso, in media `(⟨k²⟩ − ⟨k⟩) / (2⟨k⟩)`, e **collegamenti ripetuti** tra gli stessi due nodi, circa `((⟨k²⟩ − ⟨k⟩) / ⟨k⟩)² / 4`. Quando ⟨k²⟩ è finito sono una manciata, qualunque sia N. Quando γ < 3 il loro numero cresce con N, e rimuoverli toglie collegamenti agli hub. Nella prima simulazione, con γ = 2,5 e 2.000 nodi, il nodo più grande riceve 315 mezzi collegamenti e conserva 243 collegamenti.

## Segui un collegamento

Un nodo a caso ha k collegamenti con probabilità p_k. Il nodo in fondo a un collegamento a caso non è un nodo a caso: lo si raggiunge in proporzione al suo grado. La probabilità che abbia k *altri* collegamenti è

```math
q_k = (k + 1) p_(k+1) / ⟨k⟩
```

È il paradosso dell'amicizia del modulo 02, ora come distribuzione intera. La sua media è (⟨k²⟩ − ⟨k⟩) / ⟨k⟩.

```figure
follow
```

Due funzioni generatrici tengono i conti: `G0(x) = Σ p_k x^k` per un nodo a caso, e `G1(x) = Σ q_k x^k = G0′(x) / ⟨k⟩` per il nodo in fondo a un collegamento. Sia u la probabilità che un collegamento *non* porti alla componente gigante. Perché accada, devono fallire anche tutti gli altri collegamenti del nodo raggiunto, ciascuno con probabilità u. Quindi

```math
u = G1(u),    S = 1 − G0(u)
```

dove S è la quota dei nodi nella componente gigante. Una soluzione con u < 1 esiste quando G1′(1) > 1, cioè quando

```math
⟨k²⟩ − 2⟨k⟩ > 0
```

(Molloy e Reed 1995). Per una distribuzione di Poisson G0 e G1 sono la stessa funzione, e la coppia si riduce a S = 1 − e^(−⟨k⟩S), l'equazione del [modulo 02 del Complexity Lab](/lab/random-networks). Per una legge di potenza pura che parte da k = 1 la componente gigante esiste solo sotto γ = 3,4788 (Aiello, Chung e Lu 2000; Newman, Strogatz e Watts 2001). E per qualunque coda con 2 < γ < 3 esiste sempre, perché ⟨k²⟩ cresce senza limite. Il modulo 11 ne farà una questione di robustezza.

## Misurare una coda

L'esponente dunque conta, e va misurato. La ricetta di Clauset, Shalizi e Newman (2009), nell'ordine in cui si usa:

1. **Guarda** la CCDF, non un istogramma. E non adattare mai una retta a un istogramma su assi logaritmici: su 2.000 valori estratti con γ = 2,5, la terza simulazione ottiene così 1,49.
2. **Scegli dove comincia la coda.** Una legge di potenza vale, al più, sopra un certo k_min. Prendi il k_min che rende minima la distanza di Kolmogorov–Smirnov: il massimo scarto tra la CCDF dei dati sopra k_min e quella della legge adattata.
3. **Stima γ** con la massima verosimiglianza su quella coda. L'errore standard è circa (γ − 1) / √n_tail, e n_tail può essere una piccola parte dei dati.
4. **Verifica la bontà dell'adattamento.** Genera molti insiemi di dati sintetici dal modello adattato, adatta ciascuno allo stesso modo e conta quante volte si adattano peggio dei dati. Se quella quota, il valore p, è 0,1 o meno, la legge di potenza è esclusa. Un valore p grande significa «non esclusa», non «confermata».
5. **Confronta** con altri candidati (una lognormale, un'esponenziale, una legge di potenza con taglio) tramite il rapporto di verosimiglianza (Vuong 1989). Con pochi dati, di solito sopravvivono più candidati.

Applicata a ventiquattro insiemi di dati che erano stati descritti come leggi di potenza, la ricetta ne trovò alcuni compatibili con una legge di potenza e per altri la escluse; e dove la legge passava, spesso non si poteva escludere una rivale come la lognormale.

La ricetta ha un punto cieco. È libera di scegliere k_min, e può ritirarsi in una coda estrema così corta che vi si adatta quasi qualunque cosa. Nella terza simulazione 2.000 valori lognormali superano il test con p = 0,86, sugli ultimi 202. Quindi leggi n_tail e l'intervallo di k prima del valore p: un adattamento su poche decine di valori, o su meno di una decade di k, non dimostra nulla.

C'è un'altra tradizione. Lo stimatore di Hill (Hill 1975) guarda solo i j valori più grandi e chiede quanto in fretta decresce la coda, senza supporre nulla sul resto; tracciato al variare di j, mostra se la risposta è stabile. Stimatori di questo tipo sono quelli usati da Voitalov e colleghi.

## Perché i verdetti differiscono

I meccanismi danno di rado leggi di potenza pure. Il modello ad aggancio preferenziale del modulo 04 del Complexity Lab dà esattamente

```math
p_k = 2m(m + 1) / (k (k + 1)(k + 2))
```

(Dorogovtsev, Mendes e Samukhin 2000): una legge di potenza con γ = 3 solo per k grandi. Ecco perché, in quella pagina, la stima con k_min = m risulta ben sotto 3. Le reti reali hanno tagli: i nodi invecchiano, i collegamenti costano, la capacità si esaurisce (Amaral et al. 2000). E i campioni piegano i gradi piccoli (modulo 02).

Perciò la domanda utile è di rado «è esattamente una legge di potenza?», ma «quanto è pesante la coda, e su quale intervallo?». Ciò che una coda pesante fa (hub, distanze brevi, una componente gigante che non se ne va, e nel [modulo 12](/network-lab/epidemics-on-networks) le epidemie) dipende da ⟨k²⟩ / ⟨k⟩ all'N effettivo: un numero che non richiede alcun adattamento. Riportalo, insieme all'intervallo di k.

```box
Due cose chiamate legge di potenza
Una **distribuzione** dice quanto spesso compaiono valori di ciascuna grandezza: i gradi, le dimensioni delle città, i saldi degli indirizzi Bitcoin, i gradi dei nodi Lightning. La ricetta di questo modulo vale per le distribuzioni.

Una **relazione di scala** dice che una quantità è una potenza di un'altra, `y ∝ x^β`: il metabolismo rispetto alla massa corporea, il prezzo di Bitcoin rispetto al tempo trascorso dal blocco genesi ([modulo 13 del Complexity Lab](/lab/bitcoin-complex-system)). Lì i dati sono un'unica curva, ordinata e correlata nel tempo, e la ricetta non si trasferisce così com'è. Un test nello stesso spirito è stato costruito per una legge di potenza nel tempo (Santostasi e Perrenod 2026), e la precisione di un esponente stimato dipende da come si modellano le fluttuazioni attorno alla tendenza (Pecere 2026). Entrambi gli articoli sono elencati più sotto, in «Letture consigliate», e altri lavori dell'Istituto sono nella nostra [pagina delle pubblicazioni](/research/publications).
```

## Che cosa viene dopo

Il modulo 06 chiede da dove vengono le code pesanti.

<!-- simulation -->

## Letture consigliate

- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Cap. 4.
- Newman, M. E. J. (2018). *Networks*, 2ª ed. Oxford University Press. Cap. 10 (sezione 10.4) e 12.
- Latora, V., Nicosia, V. e Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Cap. 5.
- Clauset, A., Shalizi, C. R. e Newman, M. E. J. (2009). Power-law distributions in empirical data. *SIAM Review* 51, 661–703.
- Broido, A. D. e Clauset, A. (2019). Scale-free networks are rare. *Nature Communications* 10, 1017.
- Voitalov, I., van der Hoorn, P., van der Hofstad, R. e Krioukov, D. (2019). Scale-free networks well done. *Physical Review Research* 1, 033034.
- Holme, P. (2019). Rare and everywhere: perspectives on scale-free networks. *Nature Communications* 10, 1016.
- Stumpf, M. P. H. e Porter, M. A. (2012). Critical truths about power laws. *Science* 335, 665–666.
- Cohen, R. e Havlin, S. (2003). Scale-free networks are ultrasmall. *Physical Review Letters* 90, 058701.
- Chung, F. e Lu, L. (2002). The average distances in random graphs with given expected degrees. *PNAS* 99, 15879–15882.
- Molloy, M. e Reed, B. (1995). A critical point for random graphs with a given degree sequence. *Random Structures and Algorithms* 6, 161–180.
- Aiello, W., Chung, F. e Lu, L. (2000). A random graph model for massive graphs. *Proceedings of the 32nd ACM Symposium on Theory of Computing*, 171–180.
- Newman, M. E. J., Strogatz, S. H. e Watts, D. J. (2001). Random graphs with arbitrary degree distributions and their applications. *Physical Review E* 64, 026118.
- Dorogovtsev, S. N., Mendes, J. F. F. e Samukhin, A. N. (2000). Structure of growing networks with preferential linking. *Physical Review Letters* 85, 4633–4636.
- Amaral, L. A. N., Scala, A., Barthélemy, M. e Stanley, H. E. (2000). Classes of small-world networks. *PNAS* 97, 11149–11152.
- Hill, B. M. (1975). A simple general approach to inference about the tail of a distribution. *Annals of Statistics* 3, 1163–1174.
- Vuong, Q. H. (1989). Likelihood ratio tests for model selection and non-nested hypotheses. *Econometrica* 57, 307–333.
- Santostasi, G. e Perrenod, S. (2026). A Clauset-in-spirit goodness-of-fit test for a power law in time: application to Bitcoin, 2010–2026. Zenodo. [doi.org/10.5281/zenodo.23105856](https://doi.org/10.5281/zenodo.23105856)
- Pecere, A. (2026). Bitcoin's power-law trend: what the regression identifies, and the four-year oscillation around it. Zenodo. [doi.org/10.5281/zenodo.23933138](https://doi.org/10.5281/zenodo.23933138)
