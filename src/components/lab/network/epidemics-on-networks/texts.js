// Module 12 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/network-lab/epidemics-on-networks.<lang>.md.
//
// Every number below is one the page shows with its default seeds;
// scripts/lab/check-network-12.mjs prints them (lines starting with INFO) and
// pins them ("quoted on the page"). Rerun it, and update these texts, if the
// presets or the seeds change.

export const observe = {
  threshold: {
    en: `
1. **Default**, random network, 10,000 nodes: ⟨k²⟩ = 19.98 and T_c = 0.250. The measured curve stays near zero up to the mark and then follows the dashed one: 0.319 at T = 0.3 (theory 0.313) and 0.796 at T = 0.5 (theory 0.797). Below the threshold it is small but not zero, 0.008 at T = 0.2: the largest of many small components.
2. **Preferential attachment**, same mean degree: ⟨k²⟩ = 57.03 and T_c = 0.075. At T = 0.2, where the random network has nothing, the largest component holds 0.188 of the nodes. At T = 0.5 it holds 0.776, a little less than in the random network. Hubs lower the threshold; they do not make a large outbreak larger.
3. **Power law**, γ = 2.5: ⟨k²⟩ = 127.62, T_c = 0.035, and the curve leaves zero almost at once: 0.086 at T = 0.1, as the theory says. Now move N. With 1,000, 10,000 and 20,000 nodes the networks of this panel give T_c = 0.026, 0.035 and 0.011: not in order, because ⟨k²⟩ of one heavy-tailed network depends on the largest hub it happened to draw. The means over 20 networks quoted in the lecture do fall.
4. Back to the random network at T = 0.5, press **Run 1,000 seeds**. 0.801 of the outbreaks are large (theory 0.797), with mean size 0.796; the others reach 1.68 nodes on average and never more than 10. Two kinds of outcome, and nothing in between. By degree of the seed the dots follow 1 − w^k: 0.68 with two links, 0.86 with four, 1.00 from seven up. With one link the panel shows 0.25, from only 64 seeds, where the formula gives 0.40; the self-check, with 1,000 seeds of each degree, finds 0.394.
5. Press **Run the SIS sweep** on each network. The prevalence passes 1% from β/μ = 0.24 on the random network (the line is at 0.200), from 0.10 under preferential attachment (0.070) and from 0.06 on the power law (0.034). Lower with hubs, each time a little above the line, and never zero: that last step needs a network without end.
`,
    it: `
1. **Valori iniziali**, rete casuale, 10.000 nodi: ⟨k²⟩ = 19,98 e T_c = 0,250. La curva misurata resta vicina a zero fino al segno e poi segue quella tratteggiata: 0,319 con T = 0,3 (teoria 0,313) e 0,796 con T = 0,5 (teoria 0,797). Sotto la soglia è piccola ma non nulla, 0,008 con T = 0,2: la più grande di molte piccole componenti.
2. **Aggancio preferenziale**, stesso grado medio: ⟨k²⟩ = 57,03 e T_c = 0,075. Con T = 0,2, dove la rete casuale non ha nulla, la componente più grande contiene lo 0,188 dei nodi. Con T = 0,5 ne contiene lo 0,776, un po' meno che nella rete casuale. Gli hub abbassano la soglia; non rendono più grande un grande focolaio.
3. **Legge di potenza**, γ = 2,5: ⟨k²⟩ = 127,62, T_c = 0,035, e la curva lascia lo zero quasi subito: 0,086 con T = 0,1, come dice la teoria. Ora sposta N. Con 1.000, 10.000 e 20.000 nodi le reti di questo pannello danno T_c = 0,026, 0,035 e 0,011: non in ordine, perché ⟨k²⟩ di una singola rete a coda pesante dipende dall'hub più grande che le è capitato. Le medie su 20 reti citate nella lezione invece scendono.
4. Torna alla rete casuale con T = 0,5 e premi **Lancia 1.000 semi**. Lo 0,801 dei focolai è grande (teoria 0,797), con dimensione media 0,796; gli altri raggiungono in media 1,68 nodi e mai più di 10. Due tipi di esito, e niente in mezzo. Al variare del grado del seme i punti seguono 1 − w^k: 0,68 con due collegamenti, 0,86 con quattro, 1,00 da sette in su. Con un collegamento il pannello mostra 0,25, da soli 64 semi, dove la formula dà 0,40; lo script di controllo, con 1.000 semi per ogni grado, trova 0,394.
5. Premi **Lancia la scansione SIS** su ciascuna rete. La prevalenza supera l'1% da β/μ = 0,24 nella rete casuale (la linea è a 0,200), da 0,10 con l'aggancio preferenziale (0,070) e da 0,06 con la legge di potenza (0,034). Più bassa con gli hub, ogni volta un po' sopra la linea, e mai zero: per quell'ultimo passo serve una rete senza fine.
`,
  },
  hubs: {
    en: `
1. **Default**, SI with β = 0.2. Steps to reach 1%, 10% and 50% of the nodes: 7.3, 9.8 and 13.0 under preferential attachment; 10.3, 15.5 and 20.0 in the random network; 19.3, 54.8 and 116.3 on the lattice. Three networks with 10,000 nodes and about 20,000 links each.
2. On the semi-log chart the two networks rise along straight lines until about a tenth of the nodes are infected, the heavy-tailed one more steeply, and the lattice bends: exponential growth, and not. On the log-log chart it is the lattice that is straight, with slope 2.13: a little above 2, because the front takes some steps to form.
3. The third chart shows who is infected when. Under preferential attachment the nodes infected at step 1 have 11.7 links on average and those at step 2 have 14.0; then the degree falls, to 7.6 at step 5, 4.8 at step 10 and 2.7 at step 20. In the random network it stays near 5 for the first ten steps, which is ⟨k²⟩/⟨k⟩ = 5.00 and not ⟨k⟩ = 4, and is 4.3 at step 20. On the lattice it is 4.0 until the infection reaches the edge.
4. **SIR** with d = 4: T = 0.590, and 17, 18 and 19 of the 20 runs become large on the random network, under preferential attachment and on the lattice. Half the nodes are reached after 21.4, 13.9 and 136.4 steps: recovery slows everything a little and leaves the order as it was.
5. Lower β to 0.10: T = 0.344. Nothing spreads on the lattice, where percolation needs T above 0.5. The random network has 13 large runs of 20, and preferential attachment only 7, although its threshold is far lower: most of its seeds have two links, and a large outbreak must first get past them.
`,
    it: `
1. **Valori iniziali**, SI con β = 0,2. Passi per raggiungere l'1%, il 10% e il 50% dei nodi: 7,3, 9,8 e 13,0 con l'aggancio preferenziale; 10,3, 15,5 e 20,0 nella rete casuale; 19,3, 54,8 e 116,3 sul reticolo. Tre reti con 10.000 nodi e circa 20.000 collegamenti ciascuna.
2. Nel grafico semilogaritmico le due reti salgono lungo rette finché è infetto circa un decimo dei nodi, quella a coda pesante più ripida, e il reticolo si piega: crescita esponenziale, e no. Nel grafico log-log è il reticolo a essere una retta, con pendenza 2,13: un po' sopra 2, perché il fronte impiega qualche passo a formarsi.
3. Il terzo grafico mostra chi viene infettato quando. Con l'aggancio preferenziale i nodi infettati al passo 1 hanno in media 11,7 collegamenti e quelli al passo 2 ne hanno 14,0; poi il grado scende, a 7,6 al passo 5, 4,8 al passo 10 e 2,7 al passo 20. Nella rete casuale resta vicino a 5 per i primi dieci passi, cioè ⟨k²⟩/⟨k⟩ = 5,00 e non ⟨k⟩ = 4, ed è 4,3 al passo 20. Sul reticolo è 4,0 finché l'infezione non raggiunge il bordo.
4. **SIR** con d = 4: T = 0,590, e 17, 18 e 19 delle 20 simulazioni diventano grandi nella rete casuale, con l'aggancio preferenziale e sul reticolo. Metà dei nodi è raggiunta dopo 21,4, 13,9 e 136,4 passi: la guarigione rallenta tutto un poco e lascia l'ordine com'era.
5. Abbassa β a 0,10: T = 0,344. Sul reticolo non si diffonde nulla, perché lì la percolazione richiede T sopra 0,5. La rete casuale ha 13 simulazioni grandi su 20, e l'aggancio preferenziale solo 7, benché la sua soglia sia molto più bassa: quasi tutti i suoi semi hanno due collegamenti, e un grande focolaio deve prima superarli.
`,
  },
  vaccinate: {
    en: `
1. **Default**, random network, T = 0.5, g = 0.20. With nobody immune a large outbreak reaches 0.800 of the nodes. With a fifth immunised it reaches 0.511 if they are chosen at random, 0.435 by acquaintance and 0.012 by degree. The mean degree of the immunised is 4.02, 4.89 and 6.99.
2. The formula gives g_c = 0.499 for immunisation at random, and the black curve falls below 1% of N at g = 0.54: a finite network blurs the threshold a little. By acquaintance the outbreak is over at 0.44, by degree at 0.22.
3. **Preferential attachment**: g_c = 0.846. At g = 0.20 the outbreak is 0.500 at random, 0.023 by acquaintance and 0.001 by degree, and the immunised have 4.07, 7.83 and 9.96 links on average. The curves fall below 1% of N at 0.74, 0.24 and 0.08. (At random that is before g_c, because the size is a share of all N nodes and three quarters of them are already out.)
4. Still preferential attachment, g = 0.05: those immunised by degree have 21.01 links on average, by acquaintance 11.70, at random 4.16, and the outbreak is 0.074, 0.574 and 0.711. Asking for an acquaintance finds nodes almost three times as connected as a random choice, without knowing any degree; knowing the degrees does better still.
5. Set T = 1.00, an infection that passes along every link. On the random network immunisation at random needs g_c = 0.749 (measured 0.75), acquaintance 0.62 and degree 0.42. Under preferential attachment g_c = 0.923 and the three curves fall below 1% at 0.84, 0.40 and 0.18.
`,
    it: `
1. **Valori iniziali**, rete casuale, T = 0,5, g = 0,20. Senza nessun immune un grande focolaio raggiunge lo 0,800 dei nodi. Con un quinto di immunizzati ne raggiunge lo 0,511 se sono scelti a caso, lo 0,435 tra i conoscenti e lo 0,012 per grado. Il grado medio degli immunizzati è 4,02, 4,89 e 6,99.
2. La formula dà g_c = 0,499 per l'immunizzazione a caso, e la curva nera scende sotto l'1% di N a g = 0,54: una rete finita sfuma un poco la soglia. Con i conoscenti il focolaio finisce a 0,44, per grado a 0,22.
3. **Aggancio preferenziale**: g_c = 0,846. Con g = 0,20 il focolaio è 0,500 a caso, 0,023 con i conoscenti e 0,001 per grado, e gli immunizzati hanno in media 4,07, 7,83 e 9,96 collegamenti. Le curve scendono sotto l'1% di N a 0,74, 0,24 e 0,08. (A caso questo avviene prima di g_c, perché la dimensione è una quota di tutti gli N nodi e tre quarti sono già fuori.)
4. Ancora aggancio preferenziale, g = 0,05: gli immunizzati per grado hanno in media 21,01 collegamenti, i conoscenti 11,70, quelli a caso 4,16, e il focolaio è 0,074, 0,574 e 0,711. Chiedere un conoscente trova nodi quasi tre volte più connessi di una scelta a caso, senza conoscere alcun grado; conoscere i gradi fa ancora meglio.
5. Poni T = 1,00, un'infezione che passa lungo ogni collegamento. Nella rete casuale all'immunizzazione a caso serve g_c = 0,749 (misurato 0,75), ai conoscenti 0,62 e al grado 0,42. Con l'aggancio preferenziale g_c = 0,923 e le tre curve scendono sotto l'1% a 0,84, 0,40 e 0,18.
`,
  },
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: 'Find the threshold T_c, and R0 at T = 0.3, for a random network with ⟨k⟩ = 4 and for a network with ⟨k⟩ = 4 and ⟨k²⟩ = 100.',
      it: 'Trova la soglia T_c, e R0 con T = 0,3, per una rete casuale con ⟨k⟩ = 4 e per una rete con ⟨k⟩ = 4 e ⟨k²⟩ = 100.',
    },
    solution: {
      en: 'Random network: the degrees are Poisson, so ⟨k²⟩ = ⟨k⟩² + ⟨k⟩ = 20, and T_c = 4/(20 − 4) = 0.25, which is 1/⟨k⟩; R0 = 0.3 × 16/4 = 1.2. Second network: T_c = 4/(100 − 4) = 0.0417 and R0 = 0.3 × 96/4 = 7.2. The same transmissibility, the same mean degree, and a reproduction number six times as large. Compare module 11, exercise 1: the critical fractions there were 0.75 and 0.958, which are 1 − T_c.',
      it: 'Rete casuale: i gradi sono di Poisson, quindi ⟨k²⟩ = ⟨k⟩² + ⟨k⟩ = 20, e T_c = 4/(20 − 4) = 0,25, cioè 1/⟨k⟩; R0 = 0,3 × 16/4 = 1,2. Seconda rete: T_c = 4/(100 − 4) = 0,0417 e R0 = 0,3 × 96/4 = 7,2. Stessa trasmissibilità, stesso grado medio, e un numero di riproduzione sei volte più grande. Confronta con l\'esercizio 1 del modulo 11: lì le frazioni critiche erano 0,75 e 0,958, cioè 1 − T_c.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'For a random network the final share of a large outbreak solves S = 1 − e^(−RS) with R = T⟨k⟩. Find S for R = 1.2, 2 and 3.',
      it: 'Per una rete casuale la dimensione finale di un grande focolaio risolve S = 1 − e^(−RS) con R = T⟨k⟩. Trova S per R = 1,2, 2 e 3.',
    },
    solution: {
      en: 'Iterate S → 1 − e^(−RS) from S = 1 until it stops moving: 0.314, 0.797 and 0.940. For Poisson degrees G0 and G1 are the same function, e^(⟨k⟩(x − 1)), and the equations of the lecture reduce to this one, which is also the equation of Kermack and McKendrick: a random network behaves like a population that mixes. Just above the threshold the outbreak is modest, a third of the nodes at R = 1.2; it never reaches everyone, and at R = 3 it still misses 6%.',
      it: 'Itera S → 1 − e^(−RS) da S = 1 finché non si ferma: 0,314, 0,797 e 0,940. Per gradi di Poisson G0 e G1 sono la stessa funzione, e^(⟨k⟩(x − 1)), e le equazioni della lezione si riducono a questa, che è anche l\'equazione di Kermack e McKendrick: una rete casuale si comporta come una popolazione che si mescola. Appena sopra la soglia il focolaio è modesto, un terzo dei nodi con R = 1,2; non raggiunge mai tutti, e con R = 3 ne manca ancora il 6%.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Random network, ⟨k⟩ = 4, T = 0.5. What is the probability that a seed with 1, 4 and 10 links starts a large outbreak? Then run 1,000 seeds in "Threshold or no threshold" and compare.',
      it: 'Rete casuale, ⟨k⟩ = 4, T = 0,5. Qual è la probabilità che un seme con 1, 4 e 10 collegamenti avvii un grande focolaio? Poi lancia 1.000 semi in «Soglia o niente soglia» e confronta.',
    },
    solution: {
      en: 'With Poisson degrees G1(x) = e^(4(x − 1)), so u = e^(4T(u − 1)) = e^(2(u − 1)): u = 0.2032, and w = 1 − T + Tu = 0.6016. A link fails to lead to a large outbreak with probability w, so the answers are 1 − w = 0.398, 1 − w⁴ = 0.869 and 1 − w¹⁰ = 0.994. In the panel, 172 of the 201 seeds with four links started a large outbreak (0.86) and 16 of the 64 with one link (0.25); only 5 seeds had ten links, too few to show, and all 5 did. With 1,000 seeds of each degree the self-check finds 0.394 and 0.863 for one and four links.',
      it: 'Con gradi di Poisson G1(x) = e^(4(x − 1)), quindi u = e^(4T(u − 1)) = e^(2(u − 1)): u = 0,2032, e w = 1 − T + Tu = 0,6016. Un collegamento non porta a un grande focolaio con probabilità w, quindi le risposte sono 1 − w = 0,398, 1 − w⁴ = 0,869 e 1 − w¹⁰ = 0,994. Nel pannello, 172 dei 201 semi con quattro collegamenti hanno avviato un grande focolaio (0,86) e 16 dei 64 con un collegamento (0,25); solo 5 semi avevano dieci collegamenti, troppo pochi per essere mostrati, e tutti e 5 ci sono riusciti. Con 1.000 semi per ogni grado lo script di controllo trova 0,394 e 0,863 per uno e quattro collegamenti.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'Which share must be immunised at random to stop an outbreak: with homogeneous mixing and R0 = 3; at T = 0.5 on the random network of exercise 1; at T = 0.5 on the heavy-tailed one?',
      it: 'Quale quota va immunizzata a caso per fermare un focolaio: con mescolamento omogeneo e R0 = 3; con T = 0,5 nella rete casuale dell\'esercizio 1; con T = 0,5 in quella a coda pesante?',
    },
    solution: {
      en: '1 − 1/R0 = 0.667. On the networks g_c = 1 − T_c/T: 1 − 0.25/0.5 = 0.5, and 1 − 0.0417/0.5 = 0.917. The two formulas are one: T/T_c is the network\'s R0 (2 and 12 here), so g_c = 1 − 1/R0 again. What the network changes is R0 itself, through ⟨k²⟩: eleven nodes in twelve have to be immunised at random in the second network, with the same mean degree and the same transmissibility as the first.',
      it: '1 − 1/R0 = 0,667. Sulle reti g_c = 1 − T_c/T: 1 − 0,25/0,5 = 0,5, e 1 − 0,0417/0,5 = 0,917. Le due formule sono una sola: T/T_c è l\'R0 della rete (qui 2 e 12), quindi di nuovo g_c = 1 − 1/R0. Ciò che la rete cambia è R0 stesso, attraverso ⟨k²⟩: nella seconda rete vanno immunizzati a caso undici nodi su dodici, con lo stesso grado medio e la stessa trasmissibilità della prima.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Groups of size m₀aᵏ are reached at times t₀bᵏ, for k = 0, 1, 2, … Show that the cumulative number reached grows like a power of time, and find the exponent. Which is it for a = 8, b = 2, and for a = 4, b = 2? Why does an infection moving at constant speed across a surface give t²? Check the first two in the figure "Exponential or power law?".',
      it: 'Gruppi di dimensione m₀aᵏ sono raggiunti ai tempi t₀bᵏ, per k = 0, 1, 2, … Mostra che il numero cumulato di raggiunti cresce come una potenza del tempo, e trova l\'esponente. Quanto vale per a = 8, b = 2, e per a = 4, b = 2? Perché un\'infezione che si muove a velocità costante su una superficie dà t²? Controlla i primi due nella figura «Esponenziale o legge di potenza?».',
    },
    solution: {
      en: 'At time t = t₀bᵏ the groups 0 … k have been reached: N = m₀(aᵏ⁺¹ − 1)/(a − 1), which is close to a constant times aᵏ. Since k = ln(t/t₀)/ln b, aᵏ = (t/t₀)^(ln a/ln b): N grows as t to the power ln a/ln b. For a = 8, b = 2 the exponent is 3, and for a = 4, b = 2 it is 2; multiplying the time by b multiplies N by a, whatever the time. The curve is a power law only on average: between one group and the next it flattens and then jumps, a ripple that repeats in the logarithm of time. On a surface the front is at distance vt from the start, and the cases are everything inside it: an area π(vt)², which is t². With the ladder in the figure the dashed lines have slopes 3.00 and 2.00, and the lattice gives a fitted slope of 2.14.',
      it: 'Al tempo t = t₀bᵏ sono stati raggiunti i gruppi 0 … k: N = m₀(aᵏ⁺¹ − 1)/(a − 1), che è vicino a una costante per aᵏ. Poiché k = ln(t/t₀)/ln b, aᵏ = (t/t₀)^(ln a/ln b): N cresce come t elevato a ln a/ln b. Per a = 8, b = 2 l\'esponente è 3, e per a = 4, b = 2 è 2; moltiplicare il tempo per b moltiplica N per a, qualunque sia il tempo. La curva è una legge di potenza solo in media: tra un gruppo e il successivo si appiattisce e poi salta, un\'ondulazione che si ripete nel logaritmo del tempo. Su una superficie il fronte è a distanza vt dall\'inizio, e i casi sono tutto ciò che sta dentro: un\'area π(vt)², cioè t². Con la scala della figura le linee tratteggiate hanno pendenza 3,00 e 2,00, e il reticolo dà una pendenza stimata di 2,14.',
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "Whom to vaccinate", with T = 0.5 and N = 10,000, read the size of a large outbreak with g = 5%, 10%, 20%, 30% and 50% immunised by each of the three strategies, on the random network and under preferential attachment.',
      it: 'In «Chi vaccinare», con T = 0,5 e N = 10.000, leggi la dimensione di un grande focolaio con g = 5%, 10%, 20%, 30% e 50% di immunizzati secondo ciascuna delle tre strategie, nella rete casuale e con l\'aggancio preferenziale.',
    },
    solution: {
      en: 'Random network. At random: 0.728, 0.655, 0.511, 0.346, 0.023. By degree: 0.644, 0.444, 0.012, 0.003, 0.001. Acquaintance: 0.705, 0.623, 0.435, 0.204, 0.004. Preferential attachment. At random: 0.711, 0.638, 0.500, 0.377, 0.149. By degree: 0.074, 0.004, 0.001, 0.000, 0.000. Acquaintance: 0.574, 0.388, 0.023, 0.004, 0.001. At random the two networks look alike until almost half the nodes are immune, and then the heavy-tailed one keeps its outbreak far longer (0.149 against 0.023 at 50%). Aimed at the hubs, 5% is nearly enough under preferential attachment, where the random network needs 20%. Acquaintance sits between the two, much closer to the hubs where there are hubs: 20% there leaves what 50% chosen at random leaves in the random network, 0.023. Values near a threshold move from one network to the next: ten other networks in the self-check give between 0.041 and 0.102 where this one gives 0.074.',
      it: 'Rete casuale. A caso: 0,728, 0,655, 0,511, 0,346, 0,023. Per grado: 0,644, 0,444, 0,012, 0,003, 0,001. Conoscenti: 0,705, 0,623, 0,435, 0,204, 0,004. Aggancio preferenziale. A caso: 0,711, 0,638, 0,500, 0,377, 0,149. Per grado: 0,074, 0,004, 0,001, 0,000, 0,000. Conoscenti: 0,574, 0,388, 0,023, 0,004, 0,001. A caso le due reti si somigliano finché quasi metà dei nodi è immune, e poi quella a coda pesante conserva il suo focolaio molto più a lungo (0,149 contro 0,023 al 50%). Mirando agli hub, il 5% quasi basta con l\'aggancio preferenziale, dove alla rete casuale serve il 20%. I conoscenti stanno tra le due, molto più vicino agli hub dove gli hub ci sono: lì il 20% lascia ciò che nella rete casuale lascia il 50% scelto a caso, 0,023. I valori vicini a una soglia cambiano da una rete all\'altra: altre dieci reti nello script di controllo danno tra 0,041 e 0,102 dove questa dà 0,074.',
    },
  },
]
