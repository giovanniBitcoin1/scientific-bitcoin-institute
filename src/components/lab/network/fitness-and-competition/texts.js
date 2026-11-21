// Module 07 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/network-lab/fitness-and-competition.<lang>.md.
//
// Every number below is one the page shows with its default seeds;
// scripts/lab/check-network-07.mjs prints them (lines starting with INFO) and
// pins them ("quoted on the page"). Rerun it, and update these texts, if the
// presets or the seeds change.

export const observe = {
  fit: {
    en: `
1. Start with the defaults: fitness uniform on [0, 1], N = 10,000, so C = 1.255. In run 1 the final leader is the 6th node, with fitness 0.95 and 764 links. The fittest node of all, node 9,696, still has its 2 links; 488 nodes are fitter than the leader. The lead changed hands 5 times.
2. Follow the six tracked nodes. Each grows roughly along its dashed mean-field line, steeper the fitter it is: node 2 (η 0.83) ends with 555 links, node 1 (η 0.57) with 194, node 3 (η 0.18) with 14. Node 79 has fitness 1.00, one of the steepest lines, but started late and has 135.
3. The CCDF bends below the line of slope −1.255: the module-05 recipe gives 2.64 ± 0.03 from k = 3, against the 2.255 of the theory. The 1/ln k correction steepens the curve over the range a finite network can show.
4. Fitness read from growth: over the 1,152 nodes in the chart the correlation between the slope and η/C is 0.48; for the nodes born before step 100, which had time to collect many links, it is 0.70. Many slopes sit at 0: nodes with a handful of links that gained none in the second half. The reading needs many links to be sharp.
5. Press **Rerun 20 times**. The leader is never the fittest node; it is one of the ten oldest in 17 runs, and in all 20 it is one of the first 22 nodes. A median of 976 nodes are fitter than the leader (from 169 to 2,302). The lead changes hands a median of 6 times (from 0 to 19).
6. **All equal**: C = 2, module 06 again, and the leader is one of the ten oldest in all 20 runs; the lead changes a median of 5 times. Krapivsky and Redner (2002) showed that the number of lead changes grows only like ln N.
7. **Exponential**, scale 0.2: C is barely above 1, and fitness matters more than age. The leader is one of the ten oldest in only 6 runs of 20, one is the 108th node, and a median of 152 nodes are fitter than it. With scale 1 the fitnesses are closer together and age wins again: 15 runs of 20.
8. **Two values**, 10% of the nodes at η = 1 and the rest at 0.5: the leader has the top fitness in all 20 runs, and is one of the ten oldest in 10: among the fittest, age decides again.
`,
    it: `
1. Parti dai valori iniziali: fitness uniforme su [0, 1], N = 10.000, quindi C = 1,255. Nella corsa 1 il leader finale è il 6º nodo, con fitness 0,95 e 764 collegamenti. Il nodo più adatto di tutti, il nodo 9.696, ha ancora i suoi 2 collegamenti; 488 nodi sono più adatti del leader. Il leader è cambiato 5 volte.
2. Segui i sei nodi tracciati. Ognuno cresce più o meno lungo la sua retta tratteggiata di campo medio, più ripida quanto più è adatto: il nodo 2 (η 0,83) finisce con 555 collegamenti, il nodo 1 (η 0,57) con 194, il nodo 3 (η 0,18) con 14. Il nodo 79 ha fitness 1,00, una delle rette più ripide, ma è partito tardi e ne ha 135.
3. La CCDF piega sotto la retta di pendenza −1,255: la ricetta del modulo 05 dà 2,64 ± 0,03 da k = 3, contro il 2,255 della teoria. La correzione 1/ln k rende la curva più ripida nell'intervallo che una rete finita può mostrare.
4. La fitness letta dalla crescita: sui 1.152 nodi del grafico la correlazione tra la pendenza e η/C è 0,48; per i nodi nati prima del passo 100, che hanno avuto il tempo di raccogliere molti collegamenti, è 0,70. Molte pendenze stanno a 0: nodi con pochi collegamenti che nella seconda metà non ne hanno ricevuto nessuno. La lettura è precisa solo con molti collegamenti.
5. Premi **Rifai 20 volte**. Il leader non è mai il nodo più adatto; è uno dei dieci più vecchi in 17 corse, e in tutte le 20 è uno dei primi 22 nodi. Una mediana di 976 nodi è più adatta del leader (da 169 a 2.302). Il leader cambia una mediana di 6 volte (da 0 a 19).
6. **Tutti uguali**: C = 2, di nuovo il modulo 06, e il leader è uno dei dieci più vecchi in tutte le 20 corse; il leader cambia una mediana di 5 volte. Krapivsky e Redner (2002) hanno mostrato che il numero di cambi di leader cresce solo come ln N.
7. **Esponenziale**, scala 0,2: C è appena sopra 1, e la fitness conta più dell'età. Il leader è uno dei dieci più vecchi solo in 6 corse su 20, uno è il 108º nodo, e una mediana di 152 nodi è più adatta di lui. Con scala 1 le fitness sono più vicine tra loro e l'età torna a vincere: 15 corse su 20.
8. **Due valori**, il 10% dei nodi con η = 1 e gli altri con 0,5: il leader ha la fitness massima in tutte le 20 corse, ed è uno dei dieci più vecchi in 10: tra i più adatti, decide di nuovo l'età.
`,
  },
  condensation: {
    en: `
1. Defaults: b = 0.5, 20,000 nodes, ten runs. I(b) = 0.386, so node 0 should keep 0.614 of all the links; the mean of the ten runs is 0.622 at 20,000 nodes, and the runs end between 0.58 and 0.65. At 100 nodes they are spread far apart; as the network grows they close in on the limit.
2. The particle picture of run 1: node 0, alone on the level ε = 0, holds 63.6% of the links. Every other node has η ≤ 0.5, so ε ≥ 0.69, and the rest of the particles spread over the levels above; the band from ε = 0.8 to 1.2 holds 17.2%.
3. Set **b = 0.7**: the limit is 0.280, the mean at 20,000 nodes is 0.358, and at **50,000** it is 0.346. Still far, and closing slowly.
4. Set **b = 0.9**, above the threshold 0.797: there should be no condensate at all. Yet the mean share is 0.135 at 20,000 nodes and 0.118 at 50,000, and the runs differ widely, from 0.00 to 0.25. At **b = 1**, where node 0 is no fitter than the best of the others, the mean is still 0.091.
5. A finite network holds on to its start: node 0 is also the oldest node, and the share predicted for an infinite network is approached only over decades of growth.
`,
    it: `
1. Valori iniziali: b = 0,5, 20.000 nodi, dieci corse. I(b) = 0,386, quindi il nodo 0 dovrebbe conservare 0,614 di tutti i collegamenti; la media delle dieci corse è 0,622 a 20.000 nodi, e le corse finiscono tra 0,58 e 0,65. A 100 nodi sono molto distanti tra loro; mentre la rete cresce si stringono attorno al limite.
2. Il quadro delle particelle della corsa 1: il nodo 0, da solo sul livello ε = 0, ha il 63,6% dei collegamenti. Ogni altro nodo ha η ≤ 0,5, quindi ε ≥ 0,69, e le altre particelle si distribuiscono sui livelli sopra; la fascia da ε = 0,8 a 1,2 ne ha il 17,2%.
3. Imposta **b = 0,7**: il limite è 0,280, la media a 20.000 nodi è 0,358, e a **50.000** è 0,346. Ancora lontano, e si avvicina lentamente.
4. Imposta **b = 0,9**, sopra la soglia 0,797: non dovrebbe esserci alcun condensato. Eppure la quota media è 0,135 a 20.000 nodi e 0,118 a 50.000, e le corse sono molto diverse, da 0,00 a 0,25. Con **b = 1**, dove il nodo 0 non è più adatto del migliore degli altri, la media è ancora 0,091.
5. Una rete finita resta legata al suo inizio: il nodo 0 è anche il nodo più vecchio, e la quota prevista per una rete infinita viene raggiunta solo dopo decenni di crescita.
`,
  },
  age: {
    en: `
1. **Ageing**, ν = 0, 10,000 nodes: module 06 with m = 1. The recipe gives γ = 2.73, short of 3 for the reason of module 05, and the largest degree is 114.
2. Make ν negative: the old are favoured. At ν = −1 the recipe gives 2.42 and the 2nd node collects 861 links, 8.6% of the network; at ν = −2 it gives 2.37 and the hub, again the 2nd node, is linked to 20.4%. Not a star: τ² hardly tells the oldest nodes apart, so the oldest group shares the links. Dorogovtsev and Mendes found γ falling towards 2 as ν goes to −∞.
3. Make ν positive: the young are favoured. At ν = 0.5 the recipe gives 3.98 ± 0.26 from k = 10 and the largest degree is 36; at ν = 0.8, 4.60 and 17. Near ν = 0 the paper gives γ ≈ 3 + 1.23ν, which is 3.61 at ν = 0.5; the measured change from ν = 0 is larger, but the tails are short and the errors large.
4. At ν = 1 the largest degree is 14, and at ν = 2 it is 8: no hubs, since each newcomer links mostly to one of the last few nodes.
5. **Accelerating growth**, θ = 0.3, 10,000 nodes: 121,907 links, and the slope of links against nodes is 1.301, on the line 1 + θ. The recipe gives γ = 3.60 against 3.86. At θ = 0.6 the slope is 1.601 and γ = 5.86 against 6.00; at θ = 0.2, 3.27 against 3.50; at θ = 0.5, 4.81 against 5.00. All short, as module 05 warned.
6. Distances do not shrink. Without acceleration (θ = 0, a tree) the average distance grows from 4.53 at 100 nodes to 9.04 at 10,000; at θ = 0.2 from 3.14 to 3.71; at θ = 0.3 from 2.48 to 3.03; at θ = 0.6 from 1.79 to 1.97. Densification slows the growth of distances almost to a stop, but the shrinking that Leskovec and colleagues measured needs another mechanism.
`,
    it: `
1. **Invecchiamento**, ν = 0, 10.000 nodi: il modulo 06 con m = 1. La ricetta dà γ = 2,73, sotto 3 per la ragione del modulo 05, e il grado massimo è 114.
2. Rendi ν negativo: i vecchi sono favoriti. Con ν = −1 la ricetta dà 2,42 e il 2º nodo raccoglie 861 collegamenti, l'8,6% della rete; con ν = −2 dà 2,37 e l'hub, di nuovo il 2º nodo, è collegato al 20,4%. Non è una stella: τ² distingue appena i nodi più vecchi tra loro, quindi il gruppo dei più vecchi si divide i collegamenti. Dorogovtsev e Mendes hanno trovato γ che scende verso 2 quando ν va a −∞.
3. Rendi ν positivo: i giovani sono favoriti. Con ν = 0,5 la ricetta dà 3,98 ± 0,26 da k = 10 e il grado massimo è 36; con ν = 0,8, 4,60 e 17. Vicino a ν = 0 l'articolo dà γ ≈ 3 + 1,23ν, cioè 3,61 con ν = 0,5; la variazione misurata rispetto a ν = 0 è più grande, ma le code sono corte e gli errori grandi.
4. Con ν = 1 il grado massimo è 14, e con ν = 2 è 8: niente hub, perché ogni nodo nuovo si collega per lo più a uno degli ultimi arrivati.
5. **Crescita accelerata**, θ = 0,3, 10.000 nodi: 121.907 collegamenti, e la pendenza dei collegamenti rispetto ai nodi è 1,301, sulla retta 1 + θ. La ricetta dà γ = 3,60 contro 3,86. Con θ = 0,6 la pendenza è 1,601 e γ = 5,86 contro 6,00; con θ = 0,2, 3,27 contro 3,50; con θ = 0,5, 4,81 contro 5,00. Tutti sotto, come avvertiva il modulo 05.
6. Le distanze non si accorciano. Senza accelerazione (θ = 0, un albero) la distanza media cresce da 4,53 a 100 nodi a 9,04 a 10.000; con θ = 0,2 da 3,14 a 3,71; con θ = 0,3 da 2,48 a 3,03; con θ = 0,6 da 1,79 a 1,97. La densificazione rallenta la crescita delle distanze fin quasi a fermarla, ma l'accorciamento misurato da Leskovec e colleghi richiede un altro meccanismo.
`,
  },
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: 'Show that for fitness uniform on [0, 1] the condition ∫ ρ(η) η/(C − η) dη = 1 becomes C ln(C/(C − 1)) = 2, and check that C = 1.255 solves it. What is the degree exponent? Show that equal fitness, η = 1 for every node, gives C = 2.',
      it: 'Mostra che per una fitness uniforme su [0, 1] la condizione ∫ ρ(η) η/(C − η) dη = 1 diventa C ln(C/(C − 1)) = 2, e verifica che C = 1,255 la risolve. Qual è l\'esponente dei gradi? Mostra che una fitness uguale, η = 1 per ogni nodo, dà C = 2.',
    },
    solution: {
      en: 'Write η/(C − η) = −1 + C/(C − η). Then ∫₀¹ η/(C − η) dη = −1 + C [−ln(C − η)]₀¹ = −1 + C ln(C/(C − 1)). Setting this equal to 1 gives C ln(C/(C − 1)) = 2. At C = 1.255: C/(C − 1) = 1.255/0.255 = 4.922, ln 4.922 = 1.594, and 1.255 × 1.594 = 2.000. A node of fitness η has P(k_η > k) ∝ k^(−C/η); adding up the fitnesses, the nodes with η close to 1 dominate the tail, which falls like k^(−(1 + C)) with a 1/ln k correction from the range of η near 1: γ = 2.255. With η = 1 for everyone the integral is 1/(C − 1) = 1, so C = 2, the growth exponent 1/C = 1/2 and γ = 1 + C = 3, as in module 06.',
      it: 'Scrivi η/(C − η) = −1 + C/(C − η). Allora ∫₀¹ η/(C − η) dη = −1 + C [−ln(C − η)]₀¹ = −1 + C ln(C/(C − 1)). Ponendolo uguale a 1 si ottiene C ln(C/(C − 1)) = 2. Per C = 1,255: C/(C − 1) = 1,255/0,255 = 4,922, ln 4,922 = 1,594, e 1,255 × 1,594 = 2,000. Un nodo di fitness η ha P(k_η > k) ∝ k^(−C/η); sommando sulle fitness, la coda è dominata dai nodi con η vicino a 1 e decresce come k^(−(1 + C)), con una correzione 1/ln k dovuta all\'intervallo di η vicino a 1: γ = 2,255. Con η = 1 per tutti l\'integrale è 1/(C − 1) = 1, quindi C = 2, l\'esponente di crescita 1/C = 1/2 e γ = 1 + C = 3, come nel modulo 06.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'A node born at t₁ = 1 with fitness 0.5, and a latecomer born at t₂ = 1,000 with fitness 1. When does the latecomer overtake? And if the incumbent\'s fitness is 0.8? Why do C and m not matter?',
      it: "Un nodo nato a t₁ = 1 con fitness 0,5, e un ultimo arrivato nato a t₂ = 1.000 con fitness 1. Quando sorpassa l'ultimo arrivato? E se la fitness del veterano è 0,8? Perché C e m non contano?",
    },
    solution: {
      en: 'The curves meet when m (t/t₁)^(η₁/C) = m (t/t₂)^(η₂/C). Take logarithms and multiply by C: η₁ (ln t − ln t₁) = η₂ (ln t − ln t₂). The m is gone after the logarithm and the C after the multiplication, and ln t* = (η₂ ln t₂ − η₁ ln t₁)/(η₂ − η₁). With η₁ = 0.5: ln t* = (ln 1,000 − 0)/0.5 = 2 ln 1,000, so t* = 1,000² = 10⁶: when the network has a million nodes. With η₁ = 0.8: ln t* = ln 1,000/0.2 = 5 ln 1,000, t* = 1,000⁵ = 10¹⁵, never in practice. The gap in fitness sits in the denominator: halve it and the exponent of t* doubles. The first live figure lets you try other races.',
      it: "Le curve si incontrano quando m (t/t₁)^(η₁/C) = m (t/t₂)^(η₂/C). Prendi i logaritmi e moltiplica per C: η₁ (ln t − ln t₁) = η₂ (ln t − ln t₂). La m sparisce col logaritmo e la C con la moltiplicazione, e ln t* = (η₂ ln t₂ − η₁ ln t₁)/(η₂ − η₁). Con η₁ = 0,5: ln t* = (ln 1.000 − 0)/0,5 = 2 ln 1.000, quindi t* = 1.000² = 10⁶: quando la rete ha un milione di nodi. Con η₁ = 0,8: ln t* = ln 1.000/0,2 = 5 ln 1.000, t* = 1.000⁵ = 10¹⁵, in pratica mai. La differenza di fitness sta al denominatore: dimezzala e l'esponente di t* raddoppia. La prima figura interattiva permette di provare altre gare.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: '(a) For ρ(η) = (1 + ζ)(1 − η)^ζ on [0, 1], show that ∫ ρ(η) η/(1 − η) dη = 1/ζ, so that condensation needs ζ > 1 (use B(2, ζ) = 1/(ζ(ζ + 1))). (b) One node of fitness 1, the others uniform on [0, b]: show that I(b) = −1 − ln(1 − b)/b. For b = 0.5, what share of the links does the fittest node keep in the limit, and above which b does it keep none?',
      it: '(a) Per ρ(η) = (1 + ζ)(1 − η)^ζ su [0, 1], mostra che ∫ ρ(η) η/(1 − η) dη = 1/ζ, quindi la condensazione richiede ζ > 1 (usa B(2, ζ) = 1/(ζ(ζ + 1))). (b) Un nodo di fitness 1, gli altri uniformi su [0, b]: mostra che I(b) = −1 − ln(1 − b)/b. Per b = 0,5, quale quota dei collegamenti conserva nel limite il nodo più adatto, e sopra quale b non ne conserva nessuna?',
    },
    solution: {
      en: '(a) (1 + ζ) ∫₀¹ η (1 − η)^(ζ − 1) dη = (1 + ζ) B(2, ζ) = (1 + ζ)/(ζ(ζ + 1)) = 1/ζ. Condensation needs the integral at C = η_max = 1 to be below 1: 1/ζ < 1, ζ > 1. The fitness must thin out fast enough near its maximum that the fittest nodes are rare. (b) The bulk has density 1/b on [0, b]; the single node of fitness 1 has no weight in the integral, but it sets η_max = 1. I(b) = (1/b) ∫₀^b η/(1 − η) dη = (1/b) [−η − ln(1 − η)]₀^b = −1 − ln(1 − b)/b. For b = 0.5: I = −1 + 2 ln 2 = 0.386, and the fittest node keeps 1 − I = 0.614 of the links. I(b) = 1 when −ln(1 − b) = 2b, which happens at b ≈ 0.797; above it the equation for C has a solution and the node keeps no finite share.',
      it: "(a) (1 + ζ) ∫₀¹ η (1 − η)^(ζ − 1) dη = (1 + ζ) B(2, ζ) = (1 + ζ)/(ζ(ζ + 1)) = 1/ζ. La condensazione richiede che l'integrale in C = η_max = 1 sia sotto 1: 1/ζ < 1, ζ > 1. La fitness deve diradarsi abbastanza in fretta vicino al suo massimo da rendere rari i nodi più adatti. (b) Il grosso dei nodi ha densità 1/b su [0, b]; il singolo nodo di fitness 1 non pesa nell'integrale, ma fissa η_max = 1. I(b) = (1/b) ∫₀^b η/(1 − η) dη = (1/b) [−η − ln(1 − η)]₀^b = −1 − ln(1 − b)/b. Per b = 0,5: I = −1 + 2 ln 2 = 0,386, e il nodo più adatto conserva 1 − I = 0,614 dei collegamenti. I(b) = 1 quando −ln(1 − b) = 2b, cioè per b ≈ 0,797; sopra, l'equazione per C ha soluzione e il nodo non conserva alcuna quota finita.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'The n-th newcomer brings m₀ n^θ links. Show that E ∝ N^(1+θ). For θ = 0.2 and 0.5, what are the densification exponent and the degree exponent 3 + 2θ/(1 − θ)? Derive that exponent from the mean field of module 06.',
      it: "L'n-esimo nodo nuovo porta m₀ n^θ collegamenti. Mostra che E ∝ N^(1+θ). Per θ = 0,2 e 0,5, quali sono l'esponente di densificazione e l'esponente dei gradi 3 + 2θ/(1 − θ)? Ricava quell'esponente dal campo medio del modulo 06.",
    },
    solution: {
      en: 'E = Σ m₀ n^θ ≈ m₀ ∫₀^N n^θ dn = m₀ N^(1+θ)/(1 + θ), so a = 1 + θ: 1.2 for θ = 0.2, 1.5 for θ = 0.5. At time t the m₀ t^θ new links go to node i with probability k_i/(2E), so dk_i/dt = m₀ t^θ k_i (1 + θ)/(2 m₀ t^(1+θ)) = ((1 + θ)/2) k_i/t, and k_i(t) = m₀ t_i^θ (t/t_i)^((1+θ)/2). Nodes with more than k links are those born before a time proportional to k^(−2/(1−θ)), so P(K > k) ∝ k^(−2/(1−θ)) and γ = 1 + 2/(1 − θ) = 3 + 2θ/(1 − θ). θ = 0.2: 3.5; θ = 0.5: 5. In "Age and density", with 10,000 nodes, the slope of links against nodes is 1.201 and 1.501, and the recipe gives 3.27 and 4.81: the densification exponent is exact, the degree exponent falls short.',
      it: "E = Σ m₀ n^θ ≈ m₀ ∫₀^N n^θ dn = m₀ N^(1+θ)/(1 + θ), quindi a = 1 + θ: 1,2 per θ = 0,2, 1,5 per θ = 0,5. Al tempo t gli m₀ t^θ nuovi collegamenti vanno al nodo i con probabilità k_i/(2E), quindi dk_i/dt = m₀ t^θ k_i (1 + θ)/(2 m₀ t^(1+θ)) = ((1 + θ)/2) k_i/t, e k_i(t) = m₀ t_i^θ (t/t_i)^((1+θ)/2). I nodi con più di k collegamenti sono quelli nati prima di un tempo proporzionale a k^(−2/(1−θ)), quindi P(K > k) ∝ k^(−2/(1−θ)) e γ = 1 + 2/(1 − θ) = 3 + 2θ/(1 − θ). θ = 0,2: 3,5; θ = 0,5: 5. In «Età e densità», con 10.000 nodi, la pendenza dei collegamenti rispetto ai nodi è 1,201 e 1,501, e la ricetta dà 3,27 e 4,81: l'esponente di densificazione è esatto, quello dei gradi resta sotto.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "The fit get rich", with uniform fitness and 10,000 nodes, rerun 20 times. How often is the final leader the fittest node, and how often one of the ten oldest? How many nodes are fitter than the leader, as a median?',
      it: "In «I più adatti si arricchiscono», con fitness uniforme e 10.000 nodi, rifai 20 volte. Quante volte il leader finale è il nodo più adatto, e quante volte uno dei dieci più vecchi? Quanti nodi sono più adatti del leader, in mediana?",
    },
    solution: {
      en: 'Never the fittest: in none of the 20 runs. One of the ten oldest in 17 runs, and always one of the first 22 nodes. A median of 976 nodes are fitter than the leader, from 169 to 2,302. The leader is an early node of high fitness: it combines a head start with a steep growth exponent. The fittest node of all is born, on average, half way through the growth, and by the race of exercise 2 it would need a network many orders of magnitude larger to catch up.',
      it: "Mai il più adatto: in nessuna delle 20 corse. Uno dei dieci più vecchi in 17 corse, e sempre uno dei primi 22 nodi. Una mediana di 976 nodi è più adatta del leader, da 169 a 2.302. Il leader è un nodo dei primi con fitness alta: somma il vantaggio di partenza a un esponente di crescita ripido. Il nodo più adatto di tutti nasce in media a metà della crescita, e secondo la gara dell'esercizio 2 gli servirebbe una rete più grande di molti ordini di grandezza per recuperare.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "One node above the rest", read the mean share held by node 0 at about 1,000, 5,000 and 20,000 nodes for b = 0.5, 0.7 and 0.9, and compare with the limit. Which have converged?',
      it: "In «Un nodo sopra tutti», leggi la quota media del nodo 0 a circa 1.000, 5.000 e 20.000 nodi per b = 0,5, 0,7 e 0,9, e confrontala con il limite. Quali sono arrivate a convergenza?",
    },
    solution: {
      en: 'Mean of the ten runs at 1,000, 5,000 and 20,000 nodes. b = 0.5: 0.635, 0.628, 0.622, against a limit of 0.614: close, and approaching from above. b = 0.7: 0.408, 0.377, 0.358, against 0.280: falling, but far. b = 0.9: 0.211, 0.165, 0.135, against 0: falling, and far from zero. Only b = 0.5 has more or less converged. The further b is from the threshold 0.797 on the condensed side, the faster the approach; near and above it, node 0 keeps for a long time the lead it took as the oldest node. With 50,000 nodes the three means are 0.619, 0.346 and 0.118.',
      it: "Media delle dieci corse a 1.000, 5.000 e 20.000 nodi. b = 0,5: 0,635, 0,628, 0,622, contro un limite di 0,614: vicino, e ci arriva dall'alto. b = 0,7: 0,408, 0,377, 0,358, contro 0,280: in calo, ma lontano. b = 0,9: 0,211, 0,165, 0,135, contro 0: in calo, e lontano da zero. Solo b = 0,5 è più o meno a convergenza. Più b è lontano dalla soglia 0,797 dalla parte della condensazione, più rapido è l'avvicinamento; vicino alla soglia e oltre, il nodo 0 conserva a lungo il vantaggio preso come nodo più vecchio. Con 50.000 nodi le tre medie sono 0,619, 0,346 e 0,118.",
    },
  },
]
