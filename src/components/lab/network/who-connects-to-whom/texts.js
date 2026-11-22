// Module 08 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/network-lab/who-connects-to-whom.<lang>.md.
//
// Every number below is one the page shows with its default seeds;
// scripts/lab/check-network-08.mjs prints them (lines starting with INFO) and
// pins them ("quoted on the page"). Rerun it, and update these texts, if the
// presets or the seeds change.

export const observe = {
  hubs: {
    en: `
1. **As built**, preferential attachment with 10,000 nodes: r = −0.056 and ρ = −0.307. The neighbours of small nodes have higher degrees than the neighbours of hubs: k_nn(k) falls with slope −0.23 from k = 3, below the flat line of no correlations. The largest degree, 190, is just under k_s = 200.
2. Press **Grow N**. The mean r goes from −0.095 at 1,000 nodes to −0.048 at 10,000 and −0.023 at 100,000; ρ stays at −0.307, −0.301 and −0.307. The wiring has not changed, only the size: r shrinks because the hubs dominate it.
3. **Power law** with γ = 2.2: the largest degree is 2,220, far above k_s = 257, and the network is disassortative with no rule asking for it, r = −0.096 and ρ = −0.126. At γ = 3 the largest degree, 171, is below k_s = 177, and r = −0.010. **Poisson**: r = 0.005 and a flat k_nn.
4. The rich club of the growing network: the ratio to the randomisations is 0.73, 0.63, 0.64 and 0.72 at k = 5, 10, 20 and 40. φ rises with k, but less than chance would make it rise: no club. Rewired towards assortative with p = 1 the ratio is 3.74, 6.13 and 6.20 at k = 10, 20 and 40; towards disassortative, 0 at all three: the hubs no longer touch.
5. Rewire with **p = 1**: towards assortative ρ reaches 0.963 and r only 0.355; towards disassortative ρ = −0.957 and r = −0.166. The k_nn slope goes to 1.23 and −0.74. Lower p and both measures move back towards 0, ρ much more steeply.
6. **Power law** at γ = 2.5, as built, against its own randomisations: the ratio climbs to 1.20 for the 20 nodes of highest degree. The two null models differ: erasing the repeated links of a configuration model leaves the hubs a little more tightly linked than the swaps, which choose evenly among the simple networks with the same degrees. Only the second is the null model of module 02.
`,
    it: `
1. **Come costruita**, aggancio preferenziale con 10.000 nodi: r = −0,056 e ρ = −0,307. I vicini dei nodi piccoli hanno gradi più alti dei vicini degli hub: k_nn(k) scende con pendenza −0,23 da k = 3, sotto la retta piatta dell'assenza di correlazioni. Il grado massimo, 190, sta appena sotto k_s = 200.
2. Premi **Fai crescere N**. L'r medio va da −0,095 a 1.000 nodi a −0,048 a 10.000 e −0,023 a 100.000; ρ resta a −0,307, −0,301 e −0,307. Il cablaggio non è cambiato, solo la dimensione: r si restringe perché gli hub lo dominano.
3. **Legge di potenza** con γ = 2,2: il grado massimo è 2.220, molto sopra k_s = 257, e la rete è disassortativa senza che alcuna regola lo chieda, r = −0,096 e ρ = −0,126. Con γ = 3 il grado massimo, 171, è sotto k_s = 177, e r = −0,010. **Poisson**: r = 0,005 e k_nn piatto.
4. Il rich club della rete che cresce: il rapporto con le randomizzazioni è 0,73, 0,63, 0,64 e 0,72 per k = 5, 10, 20 e 40. φ cresce con k, ma meno di quanto lo farebbe crescere il caso: nessun club. Ricablata verso assortativa con p = 1 il rapporto è 3,74, 6,13 e 6,20 per k = 10, 20 e 40; verso disassortativa, 0 in tutti e tre: gli hub non si toccano più.
5. Ricabla con **p = 1**: verso assortativa ρ arriva a 0,963 e r solo a 0,355; verso disassortativa ρ = −0,957 e r = −0,166. La pendenza di k_nn va a 1,23 e −0,74. Abbassa p e le due misure tornano verso 0, ρ molto più ripidamente.
6. **Legge di potenza** con γ = 2,5, come costruita, contro le sue randomizzazioni: il rapporto sale a 1,20 per i 20 nodi di grado più alto. I due modelli nulli differiscono: cancellare i collegamenti ripetuti di un modello di configurazione lascia gli hub un po' più legati tra loro degli scambi, che scelgono in modo uniforme tra le reti semplici con gli stessi gradi. Solo il secondo è il modello nullo del modulo 02.
`,
  },
  robust: {
    en: `
1. **Preferential attachment**, 10,000 nodes. The three wirings reach r = 0.30, −0.02 and −0.15, and ρ = 0.96, −0.01 and −0.96: ρ uses its whole range, r a small part of it.
2. **Attack**: with the top 10% of degrees removed the largest component holds 0.90 of the nodes in the assortative wiring, 0.65 in the neutral one, 0.35 in the disassortative one. The assortative hubs sit in one core, and taking them out leaves the rest linked through nodes of middle degree; in the disassortative wiring each hub was holding its own patch together.
3. **Random removal** reverses the order: at 20% removed 0.56, 0.77 and 0.78; at 50%, 0.19, 0.36 and 0.41. Packing the hubs together leaves the small nodes of degree 2 in chains of their own, which break easily. The assortative curve passes the disassortative one only beyond 78% removed, when both giants are almost gone.
4. **Power law**, γ = 2.5: even the assortative wiring keeps r below 0, at −0.01, while ρ is 0.91. The hubs are above k_s and must link to smaller nodes. Against attack the disassortative wiring is weaker still: 0.53, 0.34 and 0.18 at 2%, 5% and 10% removed.
`,
    it: `
1. **Aggancio preferenziale**, 10.000 nodi. I tre cablaggi arrivano a r = 0,30, −0,02 e −0,15, e a ρ = 0,96, −0,01 e −0,96: ρ usa tutta la sua scala, r una piccola parte.
2. **Attacco**: tolto il 10% dei gradi più alti, la componente più grande tiene 0,90 dei nodi nel cablaggio assortativo, 0,65 in quello neutro, 0,35 in quello disassortativo. Gli hub assortativi stanno in un unico nucleo, e toglierli lascia il resto collegato attraverso nodi di grado medio; nel cablaggio disassortativo ogni hub teneva insieme un suo pezzo.
3. La **rimozione a caso** inverte l'ordine: tolto il 20%, 0,56, 0,77 e 0,78; tolto il 50%, 0,19, 0,36 e 0,41. Stringere insieme gli hub lascia i nodi piccoli di grado 2 in catene loro, che si spezzano facilmente. La curva assortativa supera quella disassortativa solo oltre il 78% di nodi tolti, quando le due giganti sono quasi sparite.
4. **Legge di potenza**, γ = 2,5: anche il cablaggio assortativo tiene r sotto 0, a −0,01, mentre ρ è 0,91. Gli hub stanno sopra k_s e devono collegarsi a nodi più piccoli. Contro l'attacco il cablaggio disassortativo è ancora più debole: 0,53, 0,34 e 0,18 con il 2%, il 5% e il 10% di nodi tolti.
`,
  },
  groups: {
    en: `
1. **Default**, q = 0.2 and h = 0.8: the minority is 19.2% of the nodes, and the attribute assortativity is 0.458. Both groups follow the same rule, yet 86.2% of the majority's links stay inside against 59.6% of the minority's. The links the minority receives from the majority's newcomers, a fifth of theirs, weigh more on a small group. Coleman's index corrects for size, 0.282 and 0.500, and still differs.
2. **q = 0.5**: at h = 0.5 the assortativity is −0.013, mixing by chance; at h = 0.8 it is 0.569, with 78.5% and 78.4% of the links inside. At **h = 0** every link crosses and the assortativity is −0.999.
3. **q = 0.05, h = 0.8**: the minority keeps only 28.1% of its links inside, Coleman 0.245, and the majority's index is −0.068: with 95% of the nodes it keeps fewer links inside than chance would.
4. **The majority illusion**: colour the top 5%, 10% and 20% of degrees and a coloured majority is seen by 13.7%, 26.2% and 46.3% of the nodes. Colour the same shares at random: 0.1%, 1.1% and 4.4%.
5. Switch on the **disassortative rewiring**, the same degrees and the same coloured nodes: 46.6%, 66.1% and 78.3%. With 10% coloured, two nodes in three see a coloured majority. Colouring at random hardly changes.
`,
    it: `
1. **Valori iniziali**, q = 0,2 e h = 0,8: la minoranza è il 19,2% dei nodi, e l'assortatività per attributo è 0,458. I due gruppi seguono la stessa regola, eppure l'86,2% dei collegamenti della maggioranza resta dentro, contro il 59,6% di quelli della minoranza. I collegamenti che la minoranza riceve dai nuovi arrivati della maggioranza, un quinto dei loro, pesano di più su un gruppo piccolo. L'indice di Coleman corregge per la dimensione, 0,282 e 0,500, e resta diverso.
2. **q = 0,5**: con h = 0,5 l'assortatività è −0,013, mescolamento a caso; con h = 0,8 è 0,569, con il 78,5% e il 78,4% dei collegamenti dentro. Con **h = 0** ogni collegamento attraversa e l'assortatività è −0,999.
3. **q = 0,05, h = 0,8**: la minoranza tiene dentro solo il 28,1% dei suoi collegamenti, Coleman 0,245, e l'indice della maggioranza è −0,068: con il 95% dei nodi tiene dentro meno collegamenti di quanto farebbe il caso.
4. **L'illusione della maggioranza**: colora il 5%, il 10% e il 20% dei gradi più alti e una maggioranza colorata la vede il 13,7%, il 26,2% e il 46,3% dei nodi. Colora le stesse quote a caso: 0,1%, 1,1% e 4,4%.
5. Attiva la **ricablatura disassortativa**, stessi gradi e stessi nodi colorati: 46,6%, 66,1% e 78,3%. Con il 10% colorato, due nodi su tre vedono una maggioranza colorata. Colorare a caso cambia poco.
`,
  },
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: 'Compute r for a star with four leaves and for a path of four nodes.',
      it: 'Calcola r per una stella con quattro foglie e per un cammino di quattro nodi.',
    },
    solution: {
      en: 'Star: every link joins the centre, degree 4, to a leaf, degree 1. Over the 8 link ends the pairs are (4, 1) four times and (1, 4) four times. The mean degree at an end is 2.5, the variance 2.25, and the mean product 4, so the covariance is 4 − 6.25 = −2.25 and r = −2.25/2.25 = −1: perfectly disassortative. Path 1–2–2–1: the 6 ordered pairs are (1, 2), (2, 1), (2, 2), (2, 2), (2, 1), (1, 2). Mean 10/6 = 5/3, mean square 3, mean product 16/6 = 8/3. Covariance 8/3 − 25/9 = −1/9, variance 3 − 25/9 = 2/9, r = −0.5.',
      it: "Stella: ogni collegamento unisce il centro, grado 4, a una foglia, grado 1. Sugli 8 estremi le coppie sono (4, 1) quattro volte e (1, 4) quattro volte. Il grado medio a un estremo è 2,5, la varianza 2,25 e il prodotto medio 4, quindi la covarianza è 4 − 6,25 = −2,25 e r = −2,25/2,25 = −1: perfettamente disassortativa. Cammino 1–2–2–1: le 6 coppie ordinate sono (1, 2), (2, 1), (2, 2), (2, 2), (2, 1), (1, 2). Media 10/6 = 5/3, media dei quadrati 3, prodotto medio 16/6 = 8/3. Covarianza 8/3 − 25/9 = −1/9, varianza 3 − 25/9 = 2/9, r = −0,5.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: "N = 10⁶ and ⟨k⟩ = 4: what is the structural cutoff k_s? What is module 05's natural cutoff, k_min N^(1/(γ − 1)) with k_min = 2, for γ = 2.5 and γ = 3? Show that for large N the natural cutoff exceeds k_s exactly when γ < 3.",
      it: "N = 10⁶ e ⟨k⟩ = 4: quanto vale il cutoff strutturale k_s? Quanto vale il cutoff naturale del modulo 05, k_min N^(1/(γ − 1)) con k_min = 2, per γ = 2,5 e γ = 3? Mostra che per N grande il cutoff naturale supera k_s esattamente quando γ < 3.",
    },
    solution: {
      en: 'k_s = (4 · 10⁶)^(1/2) = 2,000. γ = 2.5: 2 · (10⁶)^(2/3) = 2 · 10⁴ = 20,000, ten times k_s. γ = 3: 2 · (10⁶)^(1/2) = 2,000, equal to k_s. The natural cutoff grows as N^(1/(γ − 1)), k_s as N^(1/2) (⟨k⟩ stays finite for γ > 2). The ratio grows as N^(1/(γ − 1) − 1/2), which goes to infinity when 1/(γ − 1) > 1/2, that is γ < 3, and to 0 when γ > 3. At γ = 3 the two grow alike and the constants decide.',
      it: 'k_s = (4 · 10⁶)^(1/2) = 2.000. γ = 2,5: 2 · (10⁶)^(2/3) = 2 · 10⁴ = 20.000, dieci volte k_s. γ = 3: 2 · (10⁶)^(1/2) = 2.000, uguale a k_s. Il cutoff naturale cresce come N^(1/(γ − 1)), k_s come N^(1/2) (⟨k⟩ resta finito per γ > 2). Il rapporto cresce come N^(1/(γ − 1) − 1/2), che va all\'infinito quando 1/(γ − 1) > 1/2, cioè γ < 3, e a 0 quando γ > 3. Con γ = 3 i due crescono allo stesso modo e decidono le costanti.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: "1,000 people, 700 in group A and 300 in group B, ten friends each; 80% of B's friends are in B. Fill in the mixing matrix as shares of link ends and compute the attribute assortativity, the share of A's links that stay in A, and Coleman's index (H − w)/(1 − w) for each group, where H is the share of the group's links that stay inside and w its share of the people.",
      it: "1.000 persone, 700 nel gruppo A e 300 nel gruppo B, dieci amici ciascuna; l'80% degli amici di B è in B. Compila la matrice di mescolamento come quote di estremi dei collegamenti e calcola l'assortatività per attributo, la quota dei collegamenti di A che restano in A, e l'indice di Coleman (H − w)/(1 − w) di ogni gruppo, dove H è la quota dei collegamenti del gruppo che restano dentro e w la sua quota di persone.",
    },
    solution: {
      en: "There are 10,000 link ends, 7,000 in A and 3,000 in B, so a_A = 0.7 and a_B = 0.3. Of B's 3,000 ends, 80% go to B: e_BB = 0.24, and 20% to A: e_BA = 0.06. The matrix is symmetric, e_AB = 0.06, and e_AA = 0.7 − 0.06 = 0.64. Σ e_ii = 0.88 and Σ a_i² = 0.49 + 0.09 = 0.58, so r = (0.88 − 0.58)/(1 − 0.58) = 0.30/0.42 = 0.714. A keeps 0.64/0.7 = 91.4% of its links inside. Coleman for A: (0.914 − 0.7)/0.3 = 0.714; for B: (0.8 − 0.3)/0.7 = 0.714. With two groups and equal degrees the three numbers coincide; Coleman's index says the bigger group's 91.4% is no more homophilous than the smaller group's 80%.",
      it: "Ci sono 10.000 estremi, 7.000 in A e 3.000 in B, quindi a_A = 0,7 e a_B = 0,3. Dei 3.000 estremi di B l'80% va a B: e_BB = 0,24, e il 20% ad A: e_BA = 0,06. La matrice è simmetrica, e_AB = 0,06, ed e_AA = 0,7 − 0,06 = 0,64. Σ e_ii = 0,88 e Σ a_i² = 0,49 + 0,09 = 0,58, quindi r = (0,88 − 0,58)/(1 − 0,58) = 0,30/0,42 = 0,714. A tiene dentro 0,64/0,7 = 91,4% dei suoi collegamenti. Coleman per A: (0,914 − 0,7)/0,3 = 0,714; per B: (0,8 − 0,3)/0,7 = 0,714. Con due gruppi e gradi uguali i tre numeri coincidono; l'indice di Coleman dice che il 91,4% del gruppo più grande non è più omofilo dell'80% del più piccolo.",
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'A star with five leaves has only its centre coloured. What share of the nodes is coloured, and what share sees a coloured majority among its neighbours? Then build a six-node network with two coloured nodes in which every uncoloured node sees only coloured neighbours.',
      it: 'Una stella con cinque foglie ha colorato solo il centro. Quale quota dei nodi è colorata, e quale quota vede una maggioranza colorata tra i suoi vicini? Poi costruisci una rete di sei nodi con due nodi colorati in cui ogni nodo non colorato vede solo vicini colorati.',
    },
    solution: {
      en: 'One node of six is coloured, 1/6. Each leaf has one neighbour, the centre, so all five leaves see a coloured majority; the centre sees five uncoloured leaves. So 5/6 of the nodes see a majority that is not there. For the second part link each of the two coloured nodes to all four others and add no other link: the complete bipartite network K2,4. Every uncoloured node has exactly the two coloured nodes as neighbours, 2 of 2. A third of the nodes is coloured and two thirds see only colour.',
      it: 'Un nodo su sei è colorato, 1/6. Ogni foglia ha un solo vicino, il centro, quindi tutte e cinque le foglie vedono una maggioranza colorata; il centro vede cinque foglie non colorate. Così 5/6 dei nodi vedono una maggioranza che non c\'è. Per la seconda parte collega ciascuno dei due nodi colorati a tutti e quattro gli altri e non aggiungere altri collegamenti: la rete bipartita completa K2,4. Ogni nodo non colorato ha per vicini esattamente i due nodi colorati, 2 su 2. Un terzo dei nodi è colorato e due terzi vedono solo colore.',
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "Do hubs link to hubs?", press Grow N for preferential attachment: read r and ρ at 1,000, 10,000 and 100,000 nodes. Then choose the power law with γ = 2.2 and press it again.',
      it: 'In «Gli hub si legano agli hub?», premi Fai crescere N con l\'aggancio preferenziale: leggi r e ρ a 1.000, 10.000 e 100.000 nodi. Poi scegli la legge di potenza con γ = 2,2 e premilo di nuovo.',
    },
    solution: {
      en: 'Preferential attachment, mean of three seeds at 1,000, 10,000 and 100,000 nodes: r −0.095, −0.048, −0.023; ρ −0.307, −0.301, −0.307. r halves for every factor of ten in N while ρ stays put, and the wiring rule is the same at every size: r measures the size as much as the wiring. Power law with γ = 2.2, multiple links erased: r −0.146, −0.111, −0.105; ρ −0.146, −0.161, −0.153. Here the disassortativity is structural and does not fade: the hubs are far above k_s, and erasing the repeated links removes mostly links between hubs. r still drifts towards 0, more slowly; ρ does not.',
      it: "Aggancio preferenziale, media di tre semi a 1.000, 10.000 e 100.000 nodi: r −0,095, −0,048, −0,023; ρ −0,307, −0,301, −0,307. r si dimezza per ogni fattore dieci in N mentre ρ resta fermo, e la regola di cablaggio è la stessa a ogni dimensione: r misura la dimensione quanto il cablaggio. Legge di potenza con γ = 2,2, collegamenti multipli cancellati: r −0,146, −0,111, −0,105; ρ −0,146, −0,161, −0,153. Qui la disassortatività è strutturale e non svanisce: gli hub stanno molto sopra k_s, e cancellare i collegamenti ripetuti toglie soprattutto collegamenti tra hub. r scivola comunque verso 0, più lentamente; ρ no.",
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "Mixing and robustness", with preferential attachment, read the share of nodes in the largest component for the three wirings at 20%, 50% and 80% removed at random, and at 2%, 5% and 10% removed by attack. Which wiring is most robust to random removal, and which to attack?',
      it: 'In «Mescolamento e robustezza», con l\'aggancio preferenziale, leggi la quota di nodi nella componente più grande per i tre cablaggi con il 20%, il 50% e l\'80% di nodi tolti a caso, e con il 2%, il 5% e il 10% tolti con un attacco. Quale cablaggio è più robusto alla rimozione a caso, e quale all\'attacco?',
    },
    solution: {
      en: 'Random removal, 20%, 50%, 80%: assortative 0.56, 0.19, 0.02; neutral 0.77, 0.36, 0.04; disassortative 0.78, 0.41, 0.02. Attack, 2%, 5%, 10%: assortative 0.98, 0.95, 0.90; neutral 0.95, 0.86, 0.65; disassortative 0.76, 0.52, 0.35. Against random removal the disassortative and neutral wirings do best, the disassortative one slightly better up to about 65% removed; the assortative one is weakest until the giants have almost vanished. Against attack the order is reversed and the gap is large: the assortative network keeps 90% of its nodes together with the top 10% of degrees gone, the disassortative one 35%. With the same degrees, which failure is to be feared decides which wiring is better.',
      it: "Rimozione a caso, 20%, 50%, 80%: assortativa 0,56, 0,19, 0,02; neutra 0,77, 0,36, 0,04; disassortativa 0,78, 0,41, 0,02. Attacco, 2%, 5%, 10%: assortativa 0,98, 0,95, 0,90; neutra 0,95, 0,86, 0,65; disassortativa 0,76, 0,52, 0,35. Contro la rimozione a caso vanno meglio il cablaggio disassortativo e quello neutro, il disassortativo un poco meglio fino a circa il 65% di nodi tolti; l'assortativo è il più debole finché le giganti non sono quasi sparite. Contro l'attacco l'ordine si inverte e la distanza è grande: la rete assortativa tiene insieme il 90% dei nodi senza il 10% dei gradi più alti, quella disassortativa il 35%. A parità di gradi, quale guasto si teme decide quale cablaggio è migliore.",
    },
  },
]
