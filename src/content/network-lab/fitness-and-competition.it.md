<!-- DRAFT: to be reviewed by Adriano -->

## L'ultimo arrivato

Nel [modulo 06](/network-lab/growth-mechanisms) l'ordine di nascita decideva il posto in classifica, e un nodo nato tardi poteva solo sperare nella fortuna. Non sempre è così. Il manuale di Barabási racconta i motori di ricerca del Web: alla fine degli anni Novanta AltaVista e Inktomi, partiti presto, dominavano il mercato, eppure Google, arrivato dopo, divenne presto il motore di ricerca principale, e nel 2000 era anche l'hub più grande del Web. Kong, Sarshar e Roychowdhury (2008) hanno seguito milioni di pagine Web per un anno: in poco meno della metà dei sorpassi vinceva la pagina più giovane e più "dotata".

Bianconi e Barabási (2001) aggiunsero l'ingrediente mancante. Ogni nodo i riceve una **fitness** η_i, un numero fisso che rappresenta la sua qualità: quanto è utile una pagina, quanto è buono un articolo. Un nodo nuovo si collega al nodo i con probabilità proporzionale a η_i k_i. Il grado aiuta ancora; la qualità lo moltiplica.

## I più adatti si arricchiscono

Nel quadro di campo medio del modulo 06, un nodo di fitness η nato al tempo t_i cresce come

```math
k_i(t) = m (t / t_i)^(η_i / C)
```

L'esponente non è più 1/2 per tutti: è proporzionale alla fitness del nodo. La costante C, fissata dal conto dei collegamenti, dipende solo dalla distribuzione ρ(η) della fitness:

```math
∫ ρ(η) η / (C − η) dη = 1
```

Se tutti i nodi hanno la stessa fitness, η = 1, la condizione diventa 1/(C − 1) = 1, quindi C = 2, l'esponente è 1/2 e γ = 3: di nuovo il modulo 06. Se la fitness è uniforme tra 0 e 1, la condizione diventa C ln(C/(C − 1)) = 2, la cui soluzione è C = 1,255 (esercizio 1). La distribuzione dei gradi decresce allora come k^(−2,255) diviso per ln k: una legge di potenza con una correzione logaritmica.

Quando un ultimo arrivato più adatto sorpassa un nodo molto più vecchio? Si uguaglino le due leggi di crescita. Le costanti m e C si elidono, e la risposta dipende solo dai tempi di nascita e dalle fitness:

```math
ln t* = (η₂ ln t₂ − η₁ ln t₁) / (η₂ − η₁)
```

```figure
race
```

Un veterano nato per primo con fitness 0,5 viene sorpassato da un ultimo arrivato di fitness 1 nato al passo 1.000 solo quando la rete ha 10⁶ nodi. Se la fitness del veterano è 0,8, la data si sposta a 10¹⁵ (esercizio 2). Piccole differenze di qualità si colmano in tempi astronomici: il vantaggio dell'ultimo arrivato sta nell'esponente, quello del veterano nel logaritmo del tempo.

Lo mostra la prima simulazione. Con fitness uniforme su [0, 1] e 10.000 nodi, su 20 corse il leader finale non è mai stato il nodo più adatto: tra 169 e 2.302 nodi erano più adatti di lui. In 17 corse era uno dei dieci nodi più vecchi. Vince un nodo dei primi con fitness alta, che somma i due vantaggi; il più adatto di tutti, di solito nato tardi, non fa in tempo a mostrare quanto vale. Nella corsa 1 il leader è il 6º nodo, fitness 0,95, con 764 collegamenti; il 79º nodo, di fitness 1,00, ne ha 135.

## Leggere la fitness dalla crescita

In logaritmi, ln k_i cresce come (η_i/C) ln t. La pendenza della storia di un nodo su assi logaritmici misura la sua fitness, a meno della costante C. Kong, Sarshar e Roychowdhury l'hanno fatto per il Web. Su 13 rilevazioni mensili, da giugno 2006 a giugno 2007, ciascuna di oltre 22 milioni di pagine, hanno misurato quanto in fretta ogni pagina riceveva collegamenti in entrata. La distribuzione della fitness è risultata esponenziale, con poca dispersione. Conclusione: gran parte delle grandi differenze di grado nel Web nasce dalla crescita, che amplifica modeste differenze di qualità.

Sulle reti della prima simulazione la stessa lettura funziona in media ed è rumorosa nodo per nodo. Per i nodi nati prima del passo 100 in reti di 20.000 nodi, la pendenza divisa per η/C vale 1,00 in media su dieci reti, e la correlazione tra le due è 0,80.

Per le citazioni serve un ingrediente in più: gli articoli invecchiano. Wang, Song e Barabási (2013) descrivono la storia delle citazioni di un articolo con tre numeri: una fitness λ, un'immediatezza μ che fissa quando le citazioni raggiungono il picco, e una longevità σ che fissa con che rapidità si spengono. Nel loro modello un articolo raccoglierà in tutto m(e^λ − 1) citazioni, con m = 30: dipende solo dalla fitness.

Entrambi gli studi usavano storie. Un'istantanea mostra che un nodo ha molti collegamenti; non dice se è vecchio o bravo. Una storia sì.

## Quando il vincitore prende tutto

Bianconi e Barabási (2001) tradussero poi il modello in un gas di bosoni. Ogni nodo diventa un livello di energia, ε = −ln η in unità opportune, così i nodi più adatti stanno più in basso. Ogni collegamento diventa particelle sui livelli dei due nodi che unisce; la figura, come i loro diagrammi, mostra solo quella sul livello del nodo a cui il collegamento punta. Ogni nodo nuovo aggiunge un livello e, con i suoi collegamenti, particelle.

```figure
energy
```

L'equazione per C è la condizione perché le particelle trovino posto sui livelli. Se

```math
∫ ρ(η) η / (η_max − η) dη < 1
```

non ha soluzione, e le particelle in eccesso si accumulano sul livello più basso, come in un condensato di Bose–Einstein: il nodo più adatto conserva una quota finita di tutti i collegamenti, per quanto grande diventi la rete. Invece di una gerarchia di hub, un hub con i suoi raggi. Bianconi e Barabási citarono come esempio il predominio di Microsoft nei sistemi operativi.

Un caso pulito: un nodo di fitness 1 e tutti gli altri uniformi tra 0 e b. L'integrale è I(b) = −1 − ln(1 − b)/b. Sotto b ≈ 0,797 è minore di 1, e il nodo più adatto conserva una quota 1 − I dei collegamenti: 0,614 per b = 0,5 (esercizio 3). Nella seconda simulazione, con b = 0,5 e 20.000 nodi, la media su dieci corse è 0,622. Con b = 0,9 non dovrebbe esserci alcun condensato, eppure la quota è ancora 0,135 a 20.000 nodi. Le reti finite ricordano a lungo il loro inizio.

A differenza di quello del kernel superlineare del modulo 06, questo vincitore lo sceglie la qualità, non l'età. Il rigore aggiunge una cautela. Borgs, Chayes, Daskalakis e Roch (2007) hanno dimostrato che il modello ha tre fasi, un vantaggio del primo arrivato, una fase in cui i più adatti si arricchiscono e una in cui l'innovazione paga, e che nella fase di condensazione una frazione costante dei collegamenti continua a spostarsi verso fitness sempre più alte. Dereich, Mailler e Mörters (2017) hanno mostrato, per alberi con un collegamento per nodo nuovo e fitness continua fino al suo massimo, che nessun singolo nodo conserva una frazione positiva dei collegamenti: il condensato esiste, ma è uno sforzo collettivo di nodi sempre più adatti, nessuno dei quali lo regge da solo. Un solo nodo con una quota fissa si ha quando sta in disparte da tutti gli altri, come nel caso pulito.

## Età e costo

I nodi sbiadiscono: attori in pensione, articoli superati, pagine invecchiate. Dorogovtsev e Mendes (2000) fecero calare il tasso di aggancio con l'età τ:

```math
Π ∝ k τ^(−ν)
```

Un ν negativo favorisce i vecchi e abbassa γ, verso 2 quando ν va a −∞. Un ν positivo lo alza; γ cresce senza limite quando ν si avvicina a 1, e sopra 1 la legge di potenza scompare. Nella terza simulazione, con 10.000 nodi, la ricetta del [modulo 05](/network-lab/heavy-tails-done-right) dà 2,42 con ν = −1, 3,98 con ν = 0,5 e 4,60 con ν = 0,8, contro 2,73 con ν = 0, dove la teoria dà esattamente 3. A questa dimensione la ricetta legge basso, quindi conviene confrontare i quattro numeri tra loro. Anche capacità e costo tagliano la coda: Amaral e colleghi (2000) hanno trovato reti, come gli aeroporti del mondo, dove i gradi si fermano prima: un nodo non regge collegamenti oltre la sua capacità.

## Le reti diventano più dense

Finora ogni nodo nuovo portava m collegamenti, e il grado medio restava fisso. Leskovec, Kleinberg e Faloutsos (2005) hanno trovato altro. Nelle reti di citazioni, di brevetti e di Internet il numero di collegamenti E cresce più in fretta del numero di nodi N, come E ∝ N^a con a tra 1 e 2: 1,68 per una rete di citazioni di arXiv, 1,66 per i brevetti, 1,18 per Internet a livello di sistemi autonomi. E il diametro effettivo si accorcia mentre la rete cresce.

Se l'n-esimo nodo nuovo porta m₀ n^θ collegamenti, in tutto E ∝ N^(1+θ), quindi a = 1 + θ, e il calcolo di campo medio del modulo 06 dà

```math
γ = 3 + 2θ / (1 − θ)
```

come nel manuale di Barabási (esercizio 4). Nella terza simulazione, con θ = 0,3, i collegamenti crescono con pendenza 1,301 rispetto a N, e la ricetta dà γ = 3,60, sotto il 3,86 previsto, per la ragione del modulo 05. Le distanze però non si accorciano. La distanza media sale lentamente da 2,48 a 100 nodi a 3,03 a 10.000; la densificazione rallenta soltanto la sua crescita. Per accorciarle, Leskovec e colleghi ricorsero a un altro meccanismo, il modello *forest fire* ("incendio boschivo"): il nodo nuovo si collega a un nodo e poi, come un fuoco che si propaga, ad alcuni dei suoi vicini e dei vicini di questi.

## Che cosa un'istantanea non può dire

La stessa coda pesante può venire dall'età (modulo 06), dalla fitness, da entrambe o da nessuna delle due, come ha mostrato l'ottimizzazione del modulo 06. Una sola istantanea dei gradi non può distinguerle. La storia dei nodi sì: chi è arrivato quando, e quanto in fretta è cresciuto.

## Che cosa viene dopo

Finora ci siamo chiesti quanti collegamenti riceve un nodo. Il modulo 08 chiede chi si collega a chi: se gli hub si collegano agli hub, e il simile al simile.

<!-- simulation -->

## Letture consigliate

- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Cap. 6.
- Newman, M. E. J. (2018). *Networks*, 2ª ed. Oxford University Press. Cap. 13.
- Latora, V., Nicosia, V. e Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Cap. 6.
- Bianconi, G. e Barabási, A.-L. (2001). Competition and multiscaling in evolving networks. *Europhysics Letters* 54, 436–442.
- Bianconi, G. e Barabási, A.-L. (2001). Bose-Einstein condensation in complex networks. *Physical Review Letters* 86, 5632–5635.
- Krapivsky, P. L. e Redner, S. (2002). Statistics of changes in lead node in connectivity-driven networks. *Physical Review Letters* 89, 258703.
- Borgs, C., Chayes, J., Daskalakis, C. e Roch, S. (2007). First to market is not everything: an analysis of preferential attachment with fitness. *Proceedings of the 39th ACM Symposium on Theory of Computing (STOC 2007)*, 135–144.
- Dereich, S., Mailler, C. e Mörters, P. (2017). Nonextensive condensation in reinforced branching processes. *Annals of Applied Probability* 27, 2539–2568.
- Kong, J. S., Sarshar, N. e Roychowdhury, V. P. (2008). Experience versus talent shapes the structure of the Web. *PNAS* 105, 13724–13729.
- Wang, D., Song, C. e Barabási, A.-L. (2013). Quantifying long-term scientific impact. *Science* 342, 127–132.
- Dorogovtsev, S. N. e Mendes, J. F. F. (2000). Evolution of networks with aging of sites. *Physical Review E* 62, 1842–1845.
- Dorogovtsev, S. N. e Mendes, J. F. F. (2001). Effect of the accelerating growth of communications networks on their structure. *Physical Review E* 63, 025101.
- Leskovec, J., Kleinberg, J. e Faloutsos, C. (2005). Graphs over time: densification laws, shrinking diameters and possible explanations. *Proceedings of the 11th ACM SIGKDD Conference (KDD 2005)*, 177–187.
- Amaral, L. A. N., Scala, A., Barthélemy, M. e Stanley, H. E. (2000). Classes of small-world networks. *PNAS* 97, 11149–11152.
