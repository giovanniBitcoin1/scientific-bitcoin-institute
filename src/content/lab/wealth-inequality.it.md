<!-- DRAFT: to be reviewed by Adriano -->

## Una curva, un numero e una domanda

Negli anni Novanta dell'Ottocento Vilfredo Pareto, che abbiamo incontrato nel Modulo 04, studiò i registri fiscali di redditi e patrimoni di diversi paesi e ritrovò sempre la stessa forma: una coda pesante, in cui il numero di persone sopra un certo livello cala come una potenza di quel livello. Nel 1905 l'economista americano Max Lorenz propose un modo per disegnare quanto è diseguale una distribuzione, e nel 1912 lo statistico italiano Corrado Gini condensò quel disegno in un solo numero.

Come nascono disuguaglianze così grandi? E possono dirci qualcosa modelli semplici di agenti che interagiscono, come quelli che questo corso ha usato per stormi e traffico?

## Misurare la disuguaglianza

Metti tutti in fila dal più povero al più ricco. La **curva di Lorenz** mostra, per ogni x, la quota della ricchezza totale posseduta dal x% più povero delle persone. Se tutti avessero lo stesso, il 30% più povero avrebbe il 30%, e la curva sarebbe la diagonale. In una società reale la curva si incurva sotto la diagonale: la metà più povera può possedere solo pochi punti percentuali del totale.

Il **coefficiente di Gini** misura questo avvallamento. È il doppio dell'area tra la curva di Lorenz e la diagonale, quindi vale 0 per l'uguaglianza perfetta e 1 quando una sola persona possiede tutto. Una definizione equivalente: prendi due persone a caso, calcola la differenza media in valore assoluto tra le loro ricchezze e dividila per il doppio della media.

```math
G = Σᵢ Σⱼ |xᵢ − xⱼ| / (2 n² x̄)
```

Più facili da leggere sono le **quote dei più ricchi**, la frazione del totale posseduta dall'1% o dal 10% più ricco.

Due avvertenze. Primo, il **reddito** è un flusso, ciò che guadagni in un anno; la **ricchezza** è uno stock, ciò che possiedi in un dato momento. La ricchezza è quasi sempre molto più concentrata del reddito, anche perché si accumula nel corso della vita. Secondo, un solo numero nasconde molto: curve di Lorenz molto diverse, una con una larga maggioranza povera, un'altra con pochi ricchissimi in cima, possono avere lo stesso coefficiente di Gini.

## Sugarscape

Nel 1996 Joshua Epstein e Robert Axtell costruirono una società artificiale, **Sugarscape**: una griglia con due montagne di zucchero che ricresce dopo essere stato mangiato. Ogni agente ha una **vista**, quanto lontano vede lungo le righe e le colonne della griglia, e un **metabolismo**, quanto zucchero consuma a ogni passo. A ogni passo si sposta sulla cella libera più ricca che riesce a vedere, la raccoglie e paga il suo metabolismo; se la sua scorta scende sotto zero, muore di fame.

Le regole sono uguali per tutti e le differenze nella dotazione sono modeste, eppure la distribuzione dello zucchero accumulato diventa presto asimmetrica. Gli agenti che vedono lontano e consumano poco si stabiliscono sui picchi e continuano ad accumulare; gli altri tirano avanti in pianura o muoiono.

La forma dipende dalla demografia. Se gli agenti vivono per sempre, sopravvivono solo i più efficienti, che continuano ad ammassare zucchero. Se muoiono di vecchiaia e sono sostituiti da nuovi arrivati con una dotazione fresca, la popolazione mescola sempre vecchi e giovani, e la distribuzione acquista una lunga coda di agenti che hanno avuto il tempo di accumulare.

## Scambi come urti

Negli anni Novanta alcuni fisici cominciarono a chiedersi come sarebbe l'economia più semplice possibile, un approccio che prese il nome di **econofisica**. Immagina gli agenti come le molecole di un gas, e ogni scambio come un urto in cui il denaro passa di mano mentre il totale si conserva.

Nel 2000 Adrian Drăgulescu e Victor Yakovenko mostrarono che se coppie di agenti si scambiano somme casuali, senza possibilità di debito, la distribuzione si assesta su un'**esponenziale**, la legge di Boltzmann–Gibbs che descrive l'energia tra le molecole di un gas, con il denaro medio per agente T nel ruolo della temperatura:

```math
P(m) = e^(−m/T) / T
```

Una distribuzione esponenziale ha coefficiente di Gini esattamente ½, e il modello ci arriva da qualunque punto parta, anche se tutti partono con la stessa somma. Nello stesso anno Anirban Chakraborti e Bikas Chakrabarti fecero **risparmiare** a ogni agente una frazione fissa del suo denaro in ogni scambio. Il risparmio restringe la distribuzione, che somiglia allora di più a una campana con una coda, e il coefficiente di Gini scende.

Una regola diversa porta in un posto sorprendente. Nel **modello del mercatino** (yard-sale), reso popolare dal divulgatore Brian Hayes nel 2002, ogni scambio sposta una frazione della ricchezza del partner **più povero**, e una moneta equa decide chi guadagna. Ogni scambio è equo, con guadagno atteso nullo per entrambi, eppure la ricchezza fluisce in sempre meno mani. Le poste sono moltiplicative: un agente che perde il 10% e poi vince il 10% resta con il 99% di ciò che aveva, mentre i ricchi, che mettono in gioco solo la somma del partner più povero, rischiano relativamente poco. Alla lunga un solo agente possiede quasi tutto.

Bruce Boghosian e colleghi aggiunsero un termine che a ogni passo sposta la ricchezza di ogni agente di una piccola frazione verso la media. Un termine di questo tipo ferma la condensazione completa, e il coefficiente di Gini si stabilizza su un valore che dipende dalla sua intensità. Sono modelli stilizzati per isolare dei meccanismi, non descrizioni di economie reali.

## Crescita moltiplicativa

Nel 1931 l'ingegnere francese Robert Gibrat propose che i patrimoni, come le imprese, crescano per **fattori proporzionali casuali**: un anno buono aggiunge una percentuale, un anno cattivo ne toglie una. Moltiplicando molti fattori casuali si ottiene una distribuzione lognormale la cui larghezza cresce per sempre.

Nel 2000 Jean-Philippe Bouchaud e Marc Mézard unirono la crescita moltiplicativa casuale a uno scambio tra agenti, che tira ogni patrimonio un po' verso la media. Nel loro modello di campo medio la distribuzione della ricchezza rispetto alla media diventa stazionaria, con una coda di Pareto il cui esponente dipende dall'intensità J dell'accoppiamento e dalla volatilità σ dei rendimenti:

```math
α ≈ 1 + J / σ²
```

Un accoppiamento forte dà una coda sottile; quando si indebolisce, α si avvicina a 1 e un pugno di individui può possedere una frazione finita di tutta la ricchezza: la **condensazione della ricchezza**.

Un punto collegato, sottolineato da Ole Peters nel 2019: in un processo moltiplicativo la media su molte persone può crescere mentre il patrimonio di un individuo tipico si riduce nel tempo. Il processo è **non ergodico**: la media su una popolazione non è ciò che una singola persona sperimenta nel tempo, e la media è una cattiva guida per il caso tipico.

## Modelli e dati

Le code alte misurate di redditi e patrimoni sono spesso vicine a una legge di Pareto. Le lunghe serie storiche delle quote di reddito dei più ricchi raccolte da Thomas Piketty ed Emmanuel Saez nel 2003 hanno aperto un ampio dibattito su che cosa alimenti la disuguaglianza e su che cosa, eventualmente, si debba fare. Gli economisti non sono d'accordo sulle cause, sui rimedi e sui compromessi, per esempio tra incentivi e crescita da una parte e concentrazione dall'altra. Questo modulo non prova a chiudere quel dibattito. I modelli visti qui chiariscono dei meccanismi (scambio, rendimenti moltiplicativi, eterogeneità, eredità, cicli di vita), ma non dicono quale prevalga in un dato paese o periodo.

## Un collegamento con Bitcoin: che cosa si sta contando?

Si sente spesso dire che il possesso di bitcoin è estremamente concentrato. Affermazioni del genere di solito contano gli **indirizzi**, ma gli indirizzi non sono persone. Un solo exchange può custodire le monete di milioni di clienti in una manciata di indirizzi, mentre una persona può usarne centinaia. Stimare la distribuzione reale richiede di raggruppare gli indirizzi in entità, con grandi incertezze. La lezione vale per ogni statistica sulla disuguaglianza: prima di leggere il numero, chiediti che cosa si sta contando. Il calendario di emissione fisso di Bitcoin, infine, è una questione separata da come le sue monete sono distribuite tra le persone.

<!-- simulation -->

## Che cosa osservare

1. Nel pannello A, fai girare Sugarscape per 200 passi con e senza vita limitata. Come cambiano il coefficiente di Gini e la quota del 10% più ricco? Confronta la media e la mediana.
2. Nel pannello B, avvia lo scambio casuale partendo da ricchezze uguali. Il coefficiente di Gini si avvicina a ½? Passa all'istogramma con y logaritmico: i punti cadono su una retta?
3. Scegli il risparmio con λ = 0,5. Il coefficiente di Gini sale o scende? Prova λ = 0,9.
4. Fai girare il mercatino a lungo, con molti scambi per fotogramma. Che cosa succede alla quota dell'agente più ricco? Poi attiva una piccola redistribuzione χ: il coefficiente di Gini continua a salire?
5. Nel pannello C, metti J = 0 e confronta la media e la mediana nel tempo. Quale delle due descrive un agente tipico?
6. Con J > 0, aspetta che la coda si stabilizzi e confronta l'esponente stimato con 1 + J/σ². Poi dimezza J: che cosa succede alla coda?

## Letture consigliate

- V. Pareto, *Cours d'économie politique* (Rouge, Losanna, 1896–97).
- M. O. Lorenz, "Methods of measuring the concentration of wealth", *Publications of the American Statistical Association* 9 (1905) 209–219.
- C. Gini, *Variabilità e mutabilità* (Bologna, 1912).
- R. Gibrat, *Les inégalités économiques* (Sirey, Parigi, 1931).
- J. M. Epstein & R. Axtell, *Growing Artificial Societies: Social Science from the Bottom Up* (MIT Press, 1996).
- A. Drăgulescu & V. M. Yakovenko, "Statistical mechanics of money", *European Physical Journal B* 17 (2000) 723–729.
- A. Chakraborti & B. K. Chakrabarti, "Statistical mechanics of money: how saving propensity affects its distribution", *European Physical Journal B* 17 (2000) 167–170.
- J.-P. Bouchaud & M. Mézard, "Wealth condensation in a simple model of economy", *Physica A* 282 (2000) 536–545.
- B. Hayes, "Follow the money", *American Scientist* 90 (2002) 400–405.
- T. Piketty & E. Saez, "Income inequality in the United States, 1913–1998", *Quarterly Journal of Economics* 118 (2003) 1–41.
- V. M. Yakovenko & J. B. Rosser, "Colloquium: Statistical mechanics of money, wealth, and income", *Reviews of Modern Physics* 81 (2009) 1703–1725.
- B. M. Boghosian et al., "Oligarchy as a phase transition: the effect of wealth-attained advantage in a Fokker–Planck description of asset exchange", *Physica A* 476 (2017) 15–37.
- O. Peters, "The ergodicity problem in economics", *Nature Physics* 15 (2019) 1216–1221.
