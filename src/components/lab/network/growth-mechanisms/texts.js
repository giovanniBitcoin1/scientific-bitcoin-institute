// Module 06 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/network-lab/growth-mechanisms.<lang>.md.
//
// Every number below is one the page shows with its default seeds;
// scripts/lab/check-network-06.mjs prints them (lines starting with INFO) and
// pins them ("quoted on the page"). Rerun it, and update these texts, if the
// presets or the seeds change.

export const observe = {
  history: {
    en: `
1. Start with the defaults: α = 1, A = 0, m = 2, N = 5,000. In run 1 the biggest hub is the very first node, with 210 links: it is linked to 4.2% of the network. The CCDF follows the dashed line of slope −2 (γ = 3), and the degrees against birth order scatter around the mean-field line: old nodes are big on average, not one by one.
2. The bottom chart follows the leader as the network grows. In run 1 it changes hands a few times while the network is small, and from a size of 75 nodes it never changes again.
3. Press **Rerun 20 times**. The twenty CCDFs lie on top of one another. The biggest hub is born among the first ten nodes in 18 of the 20 runs (median: the 2nd node; range: 1st to 12th), and it is linked to 3.6% of the nodes (from 2.3% to 5.3%). The leader at N/10 = 500 nodes is still the leader at the end in 16 of the 20 runs.
4. Move N to 20,000 and rerun: the share of the biggest hub halves, median 1.8%, because its degree grows like √N while the network grows like N. Still 18 of 20 hubs among the first ten nodes.
5. Back to N = 5,000, set **α = 1.5** and rerun. The biggest hub is now linked to 83.6% of the nodes (median; from 61.1% to 91.5%), it is among the first ten in all 20 runs, and the leader at N/10 is the final leader in all 20. Winner takes all, and the winner is decided early.
6. Set **α = 0.5**. No hub: the median share is 0.8%, and in run 1 the largest degree is 38. The CCDF bends down. The leader is still mostly an old node (19 of 20 among the first ten), but the lead is thin: in run 1 it is settled only at 4,500 nodes, and the leader at N/10 is the final one in 14 runs of 20.
7. Set α = 1 and **A = 3**. The dashed line now has slope −3.5 (γ = 3 + A/m = 4.5) and the points follow it. In run 1 the largest degree is 82: the offset gives every node a share of the new links whatever its degree, and the rich get richer more slowly.
`,
    it: `
1. Parti dai valori iniziali: α = 1, A = 0, m = 2, N = 5.000. Nella corsa 1 l'hub più grande è proprio il primo nodo, con 210 collegamenti: è collegato al 4,2% della rete. La CCDF segue la retta tratteggiata di pendenza −2 (γ = 3), e i gradi in funzione dell'ordine di nascita si disperdono attorno alla retta di campo medio: i nodi vecchi sono grandi in media, non uno per uno.
2. Il grafico in basso segue il leader mentre la rete cresce. Nella corsa 1 cambia di mano qualche volta finché la rete è piccola, e da una dimensione di 75 nodi non cambia più.
3. Premi **Rifai 20 volte**. Le venti CCDF stanno una sopra l'altra. L'hub più grande nasce tra i primi dieci nodi in 18 corse su 20 (mediana: il 2º nodo; intervallo: dal 1º al 12º), ed è collegato al 3,6% dei nodi (dal 2,3% al 5,3%). Il leader a N/10 = 500 nodi è ancora il leader alla fine in 16 corse su 20.
4. Porta N a 20.000 e rifai: la quota dell'hub più grande si dimezza, mediana 1,8%, perché il suo grado cresce come √N mentre la rete cresce come N. Sempre 18 hub su 20 tra i primi dieci nodi.
5. Torna a N = 5.000, imposta **α = 1,5** e rifai. L'hub più grande ora è collegato all'83,6% dei nodi (mediana; dal 61,1% al 91,5%), è tra i primi dieci in tutte le 20 corse, e il leader a N/10 è il leader finale in tutte le 20. Il vincitore prende tutto, e il vincitore si decide presto.
6. Imposta **α = 0,5**. Nessun hub: la quota mediana è 0,8%, e nella corsa 1 il grado massimo è 38. La CCDF piega verso il basso. Il leader è ancora per lo più un nodo vecchio (19 su 20 tra i primi dieci), ma il vantaggio è sottile: nella corsa 1 si assesta solo a 4.500 nodi, e il leader a N/10 è quello finale in 14 corse su 20.
7. Imposta α = 1 e **A = 3**. La retta tratteggiata ora ha pendenza −3,5 (γ = 3 + A/m = 4,5) e i punti la seguono. Nella corsa 1 il grado massimo è 82: lo scostamento dà a ogni nodo una parte dei nuovi collegamenti qualunque sia il suo grado, e i ricchi si arricchiscono più lentamente.
`,
  },
  mechanisms: {
    en: `
1. **Preferential attachment**, the reference, with N = 20,000: largest degree 347, ⟨k²⟩/⟨k⟩ = 14.9, and the kernel measured over the last fifth of the growth is 1.00 ± 0.01. **Uniform attachment**: the CCDF falls off the dashed curve, the largest degree is 28, ⟨k²⟩/⟨k⟩ = 5.5, and the kernel is 0.03 ± 0.02: no preference at all.
2. **Link selection**: largest degree 405, ⟨k²⟩/⟨k⟩ = 15.7, kernel 1.01 ± 0.01. The same curve as the reference, and nobody computed a degree.
3. **Copying**, p = 0.5: the in-degrees follow Price's curve, and the kernel is 1.02 ± 0.01. Theory says the exponent is (2 − p)/(1 − p) = 3; the module-05 recipe gives 2.65 ± 0.05 from q = 8. At **p = 0.8** the theory says 6 and the recipe 3.89 ± 0.13 from q = 11. The rate is proportional to q + a with a = 2 and 8: a power law only where q is much larger than a, and in 20,000 nodes the recipe never gets there. At **p = 0.2** (a = 0.5) the two agree better: 2.25 against 2.18, and the biggest node gets links from 18.0% of the others.
4. **Random walk**, ℓ = 1: the kernel is 1.25, above linear, and one node ends up linked to 25.3% of the network (5,052 links). A one-step walk reaches a node through its neighbours, and a hub surrounded by nodes with few links is reached more often than its degree alone would say. Longer walks come closer to linear: 0.85 at ℓ = 2, 1.08 at ℓ = 3, 0.96 at ℓ = 6. ℓ = 0 is uniform attachment again (largest degree 29).
5. **Optimisation**, 5,000 nodes on the map, m = 1. At δ = 1 every node links to the root: a star. At δ = 2 the root still takes 82% of the nodes, at δ = 4 it takes 21.8% (1,092 links). At δ = 10 the largest degree is 211 and the map shows many local hubs; at δ = 100 it is 19, and at δ = 1,000 it is 11, with ⟨k²⟩/⟨k⟩ = 2.99: every node links to its nearest neighbour.
6. Compare the kernels: link selection, copying at p = 0.5 and long walks measure close to 1; the one-step walk (1.25) and optimisation at δ = 10 (1.38) measure above it. A heavy tail is the outcome of all of them, for different reasons.
`,
    it: `
1. **Aggancio preferenziale**, il riferimento, con N = 20.000: grado massimo 347, ⟨k²⟩/⟨k⟩ = 14,9, e il kernel misurato sull'ultimo quinto della crescita è 1,00 ± 0,01. **Aggancio uniforme**: la CCDF si stacca dalla curva tratteggiata, il grado massimo è 28, ⟨k²⟩/⟨k⟩ = 5,5, e il kernel è 0,03 ± 0,02: nessuna preferenza.
2. **Selezione di un collegamento**: grado massimo 405, ⟨k²⟩/⟨k⟩ = 15,7, kernel 1,01 ± 0,01. La stessa curva del riferimento, e nessuno ha calcolato un grado.
3. **Copia**, p = 0,5: i gradi in entrata seguono la curva di Price, e il kernel è 1,02 ± 0,01. La teoria dice che l'esponente è (2 − p)/(1 − p) = 3; la ricetta del modulo 05 dà 2,65 ± 0,05 da q = 8. Con **p = 0,8** la teoria dice 6 e la ricetta 3,89 ± 0,13 da q = 11. Il tasso è proporzionale a q + a con a = 2 e 8: una legge di potenza solo dove q è molto più grande di a, e in 20.000 nodi la ricetta non ci arriva mai. Con **p = 0,2** (a = 0,5) le due cose vanno più d'accordo: 2,25 contro 2,18, e il nodo più grande riceve collegamenti dal 18,0% degli altri.
4. **Passeggiata aleatoria**, ℓ = 1: il kernel è 1,25, sopra il lineare, e un nodo finisce collegato al 25,3% della rete (5.052 collegamenti). Una passeggiata di un passo raggiunge un nodo attraverso i suoi vicini, e un hub circondato da nodi con pochi collegamenti viene raggiunto più spesso di quanto direbbe il suo grado. Passeggiate più lunghe si avvicinano al lineare: 0,85 con ℓ = 2, 1,08 con ℓ = 3, 0,96 con ℓ = 6. ℓ = 0 è di nuovo l'aggancio uniforme (grado massimo 29).
5. **Ottimizzazione**, 5.000 nodi sulla mappa, m = 1. Con δ = 1 ogni nodo si collega alla radice: una stella. Con δ = 2 la radice prende ancora l'82% dei nodi, con δ = 4 il 21,8% (1.092 collegamenti). Con δ = 10 il grado massimo è 211 e la mappa mostra molti hub locali; con δ = 100 è 19, e con δ = 1.000 è 11, con ⟨k²⟩/⟨k⟩ = 2,99: ogni nodo si collega al vicino più prossimo.
6. Confronta i kernel: selezione di un collegamento, copia con p = 0,5 e passeggiate lunghe misurano vicino a 1; la passeggiata di un passo (1,25) e l'ottimizzazione con δ = 10 (1,38) misurano sopra. Una coda pesante è il risultato di tutti, per ragioni diverse.
`,
  },
  kernel: {
    en: `
1. Defaults: α = 1, first snapshot at 5,000 nodes, 1,000 new nodes, which make 1,919 links to old nodes. On the left Π(k) follows the line of slope 1, with more scatter at large k, where few nodes share a degree.
2. Read the three estimates. The cumulative slope up to k = 21 (the largest degree held by at least 10 nodes) gives 0.97; the same fit over every class, up to k = 210, gives 0.58; maximum likelihood gives 0.99 ± 0.02. Above k = 21 most degrees do not occur at all, κ stops growing between the few that do, and the fitted line flattens.
3. Press **Repeat on 20 networks**: cumulative 0.99 ± 0.04, every class 0.62 ± 0.05, maximum likelihood 1.01 ± 0.02 (from 0.97 to 1.04). The bias of the second readout is not noise: it is in every network.
4. Set α = 0.5 and repeat: maximum likelihood 0.51 ± 0.04, cumulative 0.61 ± 0.03. At α = 0 the cumulative slope still says 0.27, maximum likelihood 0.01: a sum that starts at the smallest degree bends upwards at the start.
5. Set α = 1.5 and repeat: maximum likelihood 1.46 ± 0.02, while the cumulative slope jumps from network to network (1.35 ± 0.46), because one hub has taken most of the links and the classes below it are thin.
6. Change the source: link selection 1.00 ± 0.02 and copying 0.99 ± 0.02 by maximum likelihood, the one-step random walk 1.28 ± 0.02, optimisation at δ = 10 1.40 ± 0.02. Then move **ΔN**: the standard error of maximum likelihood is 0.07 with 100 new nodes, 0.02 with 1,000, 0.01 with 5,000.
`,
    it: `
1. Valori iniziali: α = 1, prima istantanea a 5.000 nodi, 1.000 nodi nuovi, che fanno 1.919 collegamenti verso nodi vecchi. A sinistra Π(k) segue la retta di pendenza 1, con più dispersione per k grande, dove pochi nodi hanno lo stesso grado.
2. Leggi le tre stime. La pendenza cumulativa fino a k = 21 (il grado più grande che abbiano almeno 10 nodi) dà 0,97; lo stesso adattamento su tutte le classi, fino a k = 210, dà 0,58; la massima verosimiglianza dà 0,99 ± 0,02. Sopra k = 21 la maggior parte dei gradi non compare affatto, κ smette di crescere tra i pochi che compaiono, e la retta adattata si appiattisce.
3. Premi **Ripeti su 20 reti**: cumulativa 0,99 ± 0,04, tutte le classi 0,62 ± 0,05, massima verosimiglianza 1,01 ± 0,02 (da 0,97 a 1,04). La distorsione della seconda lettura non è rumore: c'è in ogni rete.
4. Imposta α = 0,5 e ripeti: massima verosimiglianza 0,51 ± 0,04, cumulativa 0,61 ± 0,03. Con α = 0 la pendenza cumulativa dice ancora 0,27, la massima verosimiglianza 0,01: una somma che parte dal grado più piccolo si piega verso l'alto all'inizio.
5. Imposta α = 1,5 e ripeti: massima verosimiglianza 1,46 ± 0,02, mentre la pendenza cumulativa salta da una rete all'altra (1,35 ± 0,46), perché un hub ha preso la maggior parte dei collegamenti e le classi sotto di lui sono povere.
6. Cambia la sorgente: selezione di un collegamento 1,00 ± 0,02 e copia 0,99 ± 0,02 in massima verosimiglianza, la passeggiata di un passo 1,28 ± 0,02, l'ottimizzazione con δ = 10 1,40 ± 0,02. Poi muovi **ΔN**: l'errore standard della massima verosimiglianza è 0,07 con 100 nodi nuovi, 0,02 con 1.000, 0,01 con 5.000.
`,
  },
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: 'Linear preferential attachment, m = 2, grown to 10,000 nodes. In the mean-field approximation, what is the degree of the node born at step 100? When will the node born at step 2,500 reach that degree? What share of the nodes has degree above 20, and which nodes are they? Derive P(K > k) = (m/k)² and hence p_k ≈ 2m²/k³.',
      it: "Aggancio preferenziale lineare, m = 2, fino a 10.000 nodi. Nell'approssimazione di campo medio, qual è il grado del nodo nato al passo 100? Quando il nodo nato al passo 2.500 raggiungerà quel grado? Quale quota dei nodi ha grado sopra 20, e quali nodi sono? Ricava P(K > k) = (m/k)² e da qui p_k ≈ 2m²/k³.",
    },
    solution: {
      en: 'k_i(t) = m (t/t_i)^(1/2). Node 100: 2 × (10,000/100)^(1/2) = 2 × 10 = 20. Node 2,500 reaches 20 when (t/2,500)^(1/2) = 10, that is at t = 250,000: when the network has 250,000 nodes. Degree above 20 at t = 10,000 means (10,000/t_i)^(1/2) > 10, so t_i < 100: the first hundred nodes, 1% of the network. In general k_i(t) > k when t_i < t (m/k)²; birth times are spread evenly between 0 and t, so the share of such nodes is P(K > k) = (m/k)². Differentiating, p_k = −dP/dk = 2m²/k³: γ = 3. In the simulation the node born at step 100 has about 19 links on average over 100 networks, with a standard deviation of about 12: the mean field gets the average right, not the individual node.',
      it: "k_i(t) = m (t/t_i)^(1/2). Nodo 100: 2 × (10.000/100)^(1/2) = 2 × 10 = 20. Il nodo 2.500 arriva a 20 quando (t/2.500)^(1/2) = 10, cioè per t = 250.000: quando la rete ha 250.000 nodi. Grado sopra 20 a t = 10.000 significa (10.000/t_i)^(1/2) > 10, quindi t_i < 100: i primi cento nodi, l'1% della rete. In generale k_i(t) > k quando t_i < t (m/k)²; i tempi di nascita sono distribuiti uniformemente tra 0 e t, quindi la quota di questi nodi è P(K > k) = (m/k)². Derivando, p_k = −dP/dk = 2m²/k³: γ = 3. Nella simulazione il nodo nato al passo 100 ha in media circa 19 collegamenti su 100 reti, con una deviazione standard di circa 12: il campo medio azzecca la media, non il singolo nodo.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: '(a) From p_k = 2m(m+1)/(k(k+1)(k+2)), the exact distribution of the linear model, show that P(K ≥ k) = m(m+1)/(k(k+1)), using 2/(k(k+1)(k+2)) = 1/(k(k+1)) − 1/((k+1)(k+2)). For m = 2, what share of the nodes has at least 10 links, and at least 100? Compare with the mean field (m/k)². (b) Show that Price\'s model with a = c is the undirected model with m = c. (c) With Π ∝ k + A and m = 2, which A gives γ = 2.5, and which γ = 4?',
      it: "(a) Da p_k = 2m(m+1)/(k(k+1)(k+2)), la distribuzione esatta del modello lineare, mostra che P(K ≥ k) = m(m+1)/(k(k+1)), usando 2/(k(k+1)(k+2)) = 1/(k(k+1)) − 1/((k+1)(k+2)). Con m = 2, quale quota dei nodi ha almeno 10 collegamenti, e almeno 100? Confronta con il campo medio (m/k)². (b) Mostra che il modello di Price con a = c è il modello non orientato con m = c. (c) Con Π ∝ k + A e m = 2, quale A dà γ = 2,5, e quale γ = 4?",
    },
    solution: {
      en: '(a) Write p_k = m(m+1) [1/(k(k+1)) − 1/((k+1)(k+2))]. Summing from k to infinity, the terms cancel in pairs and only the first survives: P(K ≥ k) = m(m+1)/(k(k+1)). For m = 2: 6/110 = 0.0545 at k = 10 and 6/10,100 = 0.000594 at k = 100. The mean field gives 0.04 and 0.0004: too low, by a factor 1.36 at k = 10 and 1.49 at k = 100, a factor that tends to (m+1)/m = 1.5. The shape is right, the constant is not. (b) In Price\'s model a paper with q citations is cited with probability ∝ q + a. Ignore the direction of the links: each paper also has its c references, so its total degree is k = q + c. With a = c, q + a = q + c = k: the rate is proportional to the total degree, which is the undirected linear model with m = c. And α = 2 + a/c = 3. (c) γ = 3 + A/m. γ = 2.5 needs A/2 = −0.5, A = −1; γ = 4 needs A = 2. A negative offset makes the rich richer faster; it must stay above −m, so that a new node with m links has a positive rate.',
      it: "(a) Scrivi p_k = m(m+1) [1/(k(k+1)) − 1/((k+1)(k+2))]. Sommando da k all'infinito i termini si elidono a coppie e resta solo il primo: P(K ≥ k) = m(m+1)/(k(k+1)). Con m = 2: 6/110 = 0,0545 per k = 10 e 6/10.100 = 0,000594 per k = 100. Il campo medio dà 0,04 e 0,0004: troppo poco, di un fattore 1,36 per k = 10 e 1,49 per k = 100, un fattore che tende a (m+1)/m = 1,5. La forma è giusta, la costante no. (b) Nel modello di Price un articolo con q citazioni viene citato con probabilità ∝ q + a. Ignora il verso dei collegamenti: ogni articolo ha anche le sue c citazioni in uscita, quindi il suo grado totale è k = q + c. Con a = c, q + a = q + c = k: il tasso è proporzionale al grado totale, che è il modello lineare non orientato con m = c. E α = 2 + a/c = 3. (c) γ = 3 + A/m. γ = 2,5 richiede A/2 = −0,5, A = −1; γ = 4 richiede A = 2. Uno scostamento negativo fa arricchire i ricchi più in fretta; deve restare sopra −m, perché un nodo nuovo con m collegamenti abbia un tasso positivo.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'One hub with 100 links and 1,000 nodes with 2 links each. With Π ∝ k^α, what share of the next link goes to the hub for α = 0.5, 1, 1.5 and 2?',
      it: "Un hub con 100 collegamenti e 1.000 nodi con 2 collegamenti ciascuno. Con Π ∝ k^α, quale quota del prossimo collegamento va all'hub per α = 0,5, 1, 1,5 e 2?",
    },
    solution: {
      en: 'The share is 100^α / (100^α + 1,000 × 2^α). α = 0.5: 10/(10 + 1,414) = 0.007. α = 1: 100/(100 + 2,000) = 0.048. α = 1.5: 1,000/(1,000 + 2,828) = 0.26. α = 2: 10,000/(10,000 + 4,000) = 0.71. With a linear kernel the hub takes its fair share, its 100 links out of 2,100; a little more than linear and it takes a quarter of every new link; at α = 2 most of them. The first live figure lets you try other hubs.',
      it: "La quota è 100^α / (100^α + 1.000 × 2^α). α = 0,5: 10/(10 + 1.414) = 0,007. α = 1: 100/(100 + 2.000) = 0,048. α = 1,5: 1.000/(1.000 + 2.828) = 0,26. α = 2: 10.000/(10.000 + 4.000) = 0,71. Con un kernel lineare l'hub prende la sua giusta parte, i suoi 100 collegamenti su 2.100; un po' più che lineare e prende un quarto di ogni nuovo collegamento; con α = 2 la maggior parte. La prima figura interattiva permette di provare altri hub.",
    },
  },
  {
    type: 'both',
    statement: {
      en: 'In the copying model, show that a node with in-degree q receives a given new link with probability p/t + (1 − p) q/(m t), so that the rate is proportional to q + a with a = mp/(1 − p); hence the exponent (2 − p)/(1 − p). What are the values for p = 0.2, 0.5 and 0.8? Then read "Who needs to know the degrees?" at p = 0.5 and 0.8: what does the module-05 estimate give, and why is it lower?',
      it: "Nel modello di copia, mostra che un nodo con grado in entrata q riceve un dato nuovo collegamento con probabilità p/t + (1 − p) q/(m t), quindi il tasso è proporzionale a q + a con a = mp/(1 − p); da qui l'esponente (2 − p)/(1 − p). Quali sono i valori per p = 0,2, 0,5 e 0,8? Poi leggi «Chi deve conoscere i gradi?» con p = 0,5 e 0,8: che cosa dà la stima del modulo 05, e perché è più bassa?",
    },
    solution: {
      en: 'With probability p the link goes to the node picked, which is our node with probability 1/t. Otherwise it goes to the target of one of the m out-links of the node picked: there are m t such links in all, each equally likely, and q of them point to our node, so (1 − p) q/(m t). The sum is ((1 − p)/(m t)) (q + mp/(1 − p)): proportional to q + a. This is Price\'s model with c = m and a = mp/(1 − p), and α = 2 + a/c = 2 + p/(1 − p) = (2 − p)/(1 − p). p = 0.2: 2.25; p = 0.5: 3; p = 0.8: 6. In the panel, with 20,000 nodes, the recipe gives 2.65 ± 0.05 from q = 8 at p = 0.5 and 3.89 ± 0.13 from q = 11 at p = 0.8. The distribution behaves like (q + a)^(−α), not q^(−α): its slope on log axes at q is about α q/(q + a), which is the full α only for q much larger than a. With a = 8 and q around 10 to 30 the slope is still far from 6. The recipe is right about the data it sees; the data never reach the asymptotic regime.',
      it: "Con probabilità p il collegamento va al nodo scelto, che è il nostro con probabilità 1/t. Altrimenti va alla destinazione di uno degli m collegamenti in uscita del nodo scelto: in tutto ci sono m t collegamenti di questo tipo, ciascuno ugualmente probabile, e q di essi puntano al nostro nodo, quindi (1 − p) q/(m t). La somma è ((1 − p)/(m t)) (q + mp/(1 − p)): proporzionale a q + a. È il modello di Price con c = m e a = mp/(1 − p), e α = 2 + a/c = 2 + p/(1 − p) = (2 − p)/(1 − p). p = 0,2: 2,25; p = 0,5: 3; p = 0,8: 6. Nel pannello, con 20.000 nodi, la ricetta dà 2,65 ± 0,05 da q = 8 con p = 0,5 e 3,89 ± 0,13 da q = 11 con p = 0,8. La distribuzione si comporta come (q + a)^(−α), non come q^(−α): la sua pendenza su assi logaritmici in q è circa α q/(q + a), che vale α pieno solo per q molto più grande di a. Con a = 8 e q tra 10 e 30 la pendenza è ancora lontana da 6. La ricetta ha ragione sui dati che vede; i dati non arrivano mai al regime asintotico.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "Rerun history", with α = 1, m = 2 and N = 5,000, rerun 20 times: in how many runs is the biggest hub among the first ten nodes, and what share of the nodes is it linked to? Then α = 1.5 and α = 0.5.',
      it: "In «Rifai la storia», con α = 1, m = 2 e N = 5.000, rifai 20 volte: in quante corse l'hub più grande è tra i primi dieci nodi, e a quale quota dei nodi è collegato? Poi α = 1,5 e α = 0,5.",
    },
    solution: {
      en: 'α = 1: the biggest hub is among the first ten nodes in 18 runs of 20 and is linked to 3.6% of the nodes (median; from 2.3% to 5.3%). α = 1.5: among the first ten in all 20 runs, linked to 83.6% of the nodes (from 61.1% to 91.5%): one node takes most of the network. α = 0.5: among the first ten in 19 of 20 runs, but linked to only 0.8% (from 0.6% to 1.0%): there is no hub to speak of. In all three cases the leader is an early node; what α changes is how far ahead of the others it ends. Which early node wins is not decided by anything you can see at birth: it changes from run to run.',
      it: "α = 1: l'hub più grande è tra i primi dieci nodi in 18 corse su 20 ed è collegato al 3,6% dei nodi (mediana; dal 2,3% al 5,3%). α = 1,5: tra i primi dieci in tutte le 20 corse, collegato all'83,6% dei nodi (dal 61,1% al 91,5%): un nodo prende la maggior parte della rete. α = 0,5: tra i primi dieci in 19 corse su 20, ma collegato solo allo 0,8% (dallo 0,6% all'1,0%): non c'è un vero hub. In tutti e tre i casi il leader è un nodo dei primi; ciò che α cambia è di quanto finisce davanti agli altri. Quale dei primi nodi vinca non lo decide nulla che si possa vedere alla nascita: cambia da una corsa all'altra.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "Measure the attachment rule", grow networks with α = 0.5, 1 and 1.5, with N1 = 5,000 and ΔN = 2,000, and repeat on 20 networks. What do the cumulative slope and maximum likelihood give, and which is biased? How many new nodes does maximum likelihood need for a standard error of 0.05 at α = 1?',
      it: "In «Misura la regola di aggancio», fai crescere reti con α = 0,5, 1 e 1,5, con N1 = 5.000 e ΔN = 2.000, e ripeti su 20 reti. Che cosa danno la pendenza cumulativa e la massima verosimiglianza, e quale è distorta? Quanti nodi nuovi servono alla massima verosimiglianza per un errore standard di 0,05 con α = 1?",
    },
    solution: {
      en: 'Maximum likelihood: 0.49, 1.00 and 1.47, within a few hundredths of the truth each time. The cumulative slope up to the last class of 10 nodes: 0.60, 0.99 and 1.33, the last one with a spread of 0.33 from network to network; over every class: 0.48, 0.62 and 0.44. The cumulative estimate is the biased one, and the size and even the sign of the bias depend on the range: the start of the sum at the smallest degree pushes it up at small α, the empty classes at large k pull it down. Maximum likelihood uses each link once, with the degrees the old nodes had at the first snapshot. Its standard error falls like 1/√ΔN: 0.066 with 100 new nodes, so 0.05 needs about 100 × (0.066/0.05)² ≈ 170 new nodes, some 340 links.',
      it: "Massima verosimiglianza: 0,49, 1,00 e 1,47, ogni volta a pochi centesimi dal vero. La pendenza cumulativa fino all'ultima classe di 10 nodi: 0,60, 0,99 e 1,33, l'ultima con una dispersione di 0,33 da una rete all'altra; su tutte le classi: 0,48, 0,62 e 0,44. La stima cumulativa è quella distorta, e l'entità e perfino il segno della distorsione dipendono dall'intervallo: l'inizio della somma al grado più piccolo la spinge in su per α piccolo, le classi vuote per k grande la tirano in giù. La massima verosimiglianza usa ogni collegamento una volta, con i gradi che i nodi vecchi avevano nella prima istantanea. Il suo errore standard cala come 1/√ΔN: 0,066 con 100 nodi nuovi, quindi 0,05 richiede circa 100 × (0,066/0,05)² ≈ 170 nodi nuovi, circa 340 collegamenti.",
    },
  },
]
