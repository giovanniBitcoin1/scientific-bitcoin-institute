// Module 05 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// The lecture itself is src/content/network-lab/heavy-tails-done-right.<lang>.md.
//
// Every number below is one the page shows with its default seeds;
// scripts/lab/check-network-05.mjs prints them (lines starting with INFO) and
// pins them ("quoted on the page"). Rerun it, and update these texts, if the
// presets or the seeds change.

export const observe = {
  dial: {
    en: `
1. Read the start: γ = 2.5, k_min = 2, 2,000 nodes. The network has 4,351 links, ⟨k⟩ = 4.35 and ⟨k²⟩ = 107.8, so ⟨k²⟩/⟨k⟩ = 24.8. The largest node was dealt 315 half-links, right at the natural cutoff (317), and keeps 243 links. The pairing made 14 self-links (the formula says 15.8) and 130 repeated links (the formula says 250.9: it assumes that repeated links are rare, and overshoots as soon as there are hubs).
2. Press **New network** a few times. Among the first twenty networks the largest degree dealt runs from 94 to 1,180. The natural cutoff is a typical size, not a ceiling: the largest value of a heavy-tailed sample is the least stable number in it.
3. Set **γ = 4**. 2,440 links, largest degree 23 (cutoff 25), 2 self-links and no repeated link, ⟨k²⟩/⟨k⟩ = 3.1, average distance 11.16. No hubs, and long paths.
4. Set **γ = 2.1**. The largest node is dealt 1,548 half-links and keeps 673: the pairing made 127 self-links and 1,529 repeated links, most of them on the hubs. ⟨k²⟩/⟨k⟩ = 83.3 and the average distance is 3.03.
5. Back to γ = 2.5, move **N** to 20,000. ⟨k⟩ goes from 4.35 to 4.62; ⟨k²⟩ from 107.8 to 285.6; the largest degree from 243 to 1,278. The average distance stays at 4.20. At γ = 4 the same step leaves ⟨k²⟩ where it was (7.5, then 7.8) and takes the distance from 11.16 to 13.87.
6. Run the **experiment**. At N = 100,000 the largest degree is 10,994 for γ = 2.2, 1,448 for 2.6, 1,170 for 3, 63 for 4 and 15 for the random network; ⟨k²⟩/⟨k⟩ is 721.9, 38.1, 13.8, 3.1 and 5.2. Average distance: 3.54, 5.16, 7.50, 15.77 and 8.19. From 100 nodes to 100,000 it goes from 2.98 to 3.54 at γ = 2.2 and from 6.59 to 15.77 at γ = 4. The curves are not smooth: even a median of ten networks swings.
`,
    it: `
1. Leggi la situazione iniziale: γ = 2,5, k_min = 2, 2.000 nodi. La rete ha 4.351 collegamenti, ⟨k⟩ = 4,35 e ⟨k²⟩ = 107,8, quindi ⟨k²⟩/⟨k⟩ = 24,8. Il nodo più grande ha ricevuto 315 mezzi collegamenti, proprio al cutoff naturale (317), e conserva 243 collegamenti. L'accoppiamento ha creato 14 cappi (la formula dice 15,8) e 130 collegamenti ripetuti (la formula dice 250,9: suppone che i collegamenti ripetuti siano rari, e sbaglia per eccesso appena ci sono hub).
2. Premi **Nuova rete** qualche volta. Tra le prime venti reti il grado massimo estratto va da 94 a 1.180. Il cutoff naturale è una dimensione tipica, non un tetto: il valore più grande di un campione a coda pesante è il numero meno stabile che contiene.
3. Imposta **γ = 4**. 2.440 collegamenti, grado massimo 23 (cutoff 25), 2 cappi e nessun collegamento ripetuto, ⟨k²⟩/⟨k⟩ = 3,1, distanza media 11,16. Niente hub, e cammini lunghi.
4. Imposta **γ = 2,1**. Il nodo più grande riceve 1.548 mezzi collegamenti e ne conserva 673: l'accoppiamento ha creato 127 cappi e 1.529 collegamenti ripetuti, quasi tutti sugli hub. ⟨k²⟩/⟨k⟩ = 83,3 e la distanza media è 3,03.
5. Torna a γ = 2,5 e porta **N** a 20.000. ⟨k⟩ passa da 4,35 a 4,62; ⟨k²⟩ da 107,8 a 285,6; il grado massimo da 243 a 1.278. La distanza media resta 4,20. Con γ = 4 lo stesso passo lascia ⟨k²⟩ dov'era (7,5, poi 7,8) e porta la distanza da 11,16 a 13,87.
6. Avvia l'**esperimento**. Con N = 100.000 il grado massimo è 10.994 per γ = 2,2, 1.448 per 2,6, 1.170 per 3, 63 per 4 e 15 per la rete casuale; ⟨k²⟩/⟨k⟩ vale 721,9, 38,1, 13,8, 3,1 e 5,2. Distanza media: 3,54, 5,16, 7,50, 15,77 e 8,19. Da 100 a 100.000 nodi passa da 2,98 a 3,54 con γ = 2,2 e da 6,59 a 15,77 con γ = 4. Le curve non sono lisce: anche una mediana di dieci reti oscilla.
`,
  },
  giant: {
    en: `
1. Poisson, ⟨k⟩ = 1.5. Press **Play**: the staircase climbs from u = 0 between the curve and the diagonal and stops where they cross, at u = 0.4172, after 26 steps. Then S = 1 − G0(u) = 0.5828.
2. Set **⟨k⟩ = 0.9**. The curve stays above the diagonal all the way to the corner: the staircase climbs to u = 1 and S = 0. G1′(1) = 0.9, below 1, and ⟨k²⟩ − 2⟨k⟩ = −0.09. At **⟨k⟩ = 1.1** there is a crossing again, at u = 0.8239 (S = 0.1761), but it takes 98 steps to get there: near the threshold everything is slow.
3. On the right, the dots are networks of 20,000 nodes. For Poisson degrees they sit on the curve: 0.794 against 0.7968 at ⟨k⟩ = 2.
4. **Ones and fours**, a quarter of fours: u = 0.5 and S = 0.6094, the answer of exercise 3. Lower the share to 0.10: no giant component (⟨k²⟩ − 2⟨k⟩ = −0.1). At 0.12 it is back, with S = 0.0748. The threshold is 1/9.
5. **Pure power law**, γ = 2.5: S = 0.6136, and G1′(1) "grows without bound". At γ = 3, S = 0.2014; at 3.4, 0.0082; at 3.5 nothing is left, and G1′(1) = 0.947.
6. Here the dots do not sit on the curve. At γ = 2.5 and 3 they are close (0.610 and 0.206, against 0.6136 and 0.2014). At γ = 2.2 they are below it (0.848 against 0.8622): no degree can exceed N − 1, and the repeated links that were merged are missing. Around the threshold they are above it (0.019 against 0.0082 at γ = 3.4; 0.009 against 0 at 3.6): in a finite network the largest component is never exactly nothing.
7. Set **γ = 2**. The mean degree is infinite, every link leads to a hub, u = 0 and S = 1.
`,
    it: `
1. Poisson, ⟨k⟩ = 1,5. Premi **Avvia**: la scala sale da u = 0 tra la curva e la diagonale e si ferma dove si incrociano, a u = 0,4172, dopo 26 passi. Allora S = 1 − G0(u) = 0,5828.
2. Imposta **⟨k⟩ = 0,9**. La curva resta sopra la diagonale fino all'angolo: la scala sale fino a u = 1 e S = 0. G1′(1) = 0,9, sotto 1, e ⟨k²⟩ − 2⟨k⟩ = −0,09. Con **⟨k⟩ = 1,1** c'è di nuovo un incrocio, a u = 0,8239 (S = 0,1761), ma servono 98 passi per arrivarci: vicino alla soglia tutto è lento.
3. A destra, i punti sono reti di 20.000 nodi. Con gradi di Poisson stanno sulla curva: 0,794 contro 0,7968 con ⟨k⟩ = 2.
4. **Uno e quattro**, un quarto di quattro: u = 0,5 e S = 0,6094, la risposta dell'esercizio 3. Abbassa la quota a 0,10: nessuna componente gigante (⟨k²⟩ − 2⟨k⟩ = −0,1). A 0,12 è tornata, con S = 0,0748. La soglia è 1/9.
5. **Legge di potenza pura**, γ = 2,5: S = 0,6136, e G1′(1) «cresce senza limite». Con γ = 3, S = 0,2014; con 3,4, 0,0082; con 3,5 non resta nulla, e G1′(1) = 0,947.
6. Qui i punti non stanno sulla curva. Con γ = 2,5 e 3 sono vicini (0,610 e 0,206, contro 0,6136 e 0,2014). Con γ = 2,2 sono sotto (0,848 contro 0,8622): nessun grado può superare N − 1, e i collegamenti ripetuti che sono stati fusi mancano. Attorno alla soglia sono sopra (0,019 contro 0,0082 con γ = 3,4; 0,009 contro 0 con 3,6): in una rete finita la componente più grande non è mai esattamente nulla.
7. Imposta **γ = 2**. Il grado medio è infinito, ogni collegamento porta a un hub, u = 0 e S = 1.
`,
  },
  recipe: {
    en: `
1. **Pure power law**, 2,000 values, γ = 2.5. The recipe chooses k_min = 1 and gives γ = 2.48 ± 0.03 on all 2,000 values. Press **Run the test**: p = 0.73, not ruled out. Step 4: the exponential is excluded (ratio 618.2), but against the lognormal and the cut-off there is no decision. Even with data that really are a power law, the verdict is "not ruled out", never "confirmed".
2. Read **Four ways to get it wrong** on the same data: 1.49 from a line through the histogram with equal bins, 2.36 with logarithmic bins, 2.46 from a line through the CCDF, 2.48 from maximum likelihood. The histogram with equal bins is off by a whole unit.
3. **Power-law tail, different body**, with n = 20,000. The KS curve has its minimum at k_min = 10, where the tail really starts: γ = 2.52 ± 0.02 on 7,988 values, p = 0.51. Maximum likelihood from k_min = 1 says 1.39: fitting the body together with the tail is the fifth way to get it wrong.
4. **Lognormal**, n = 2,000. The recipe retreats to k_min = 14 and keeps 202 values of 2,000, from 14 to 223; there it finds γ = 2.81 ± 0.13 and p = 0.86. The lognormal passes. Step 4 cannot tell it from a power law either, and the verdict says so. In the self-check, of 20 lognormal samples of 10,000 values only 7 are ruled out.
5. **Exponential**, n = 2,000. The recipe goes as far as k_min = 27, keeps 89 values between 27 and 72, and reports "γ = 5.65 ± 0.49" with p = 0.45. The verdict refuses: the tail covers less than a factor of ten in k. Any curve is a straight line over a range that short.
6. **Power law with a cut-off**: γ = 2.14 ± 0.03 from k_min = 1, and p = 0.02. Ruled out, and step 4 says in favour of what (ratio −12.6 for the cut-off law).
7. **Preferential-attachment network**. With 2,000 nodes: k_min = 2, γ = 2.52 ± 0.03, and p = 0.01: ruled out, rightly, because at small k it is not a power law. With 50,000 nodes the recipe moves to k_min = 8, gives γ = 2.83 ± 0.03 on 4,146 values and p = 0.20. The exponent of the model is 3, reached only for large k.
8. **Power-law network, sampled**, n = 2,000: γ = 2.93 ± 0.04 from k_min = 1, with p = 0.73. A small error bar, a good p-value, and the wrong exponent: the tail has 2.5. With 20,000 values the recipe moves to k_min = 3 and gives 2.61 ± 0.04. A standard error measures the scatter of the estimate, not whether the model is right. The Hill plot of the 20,000 values agrees with the tail: from the 30 largest values to the 200 largest it stays between 2.3 and 2.7.
`,
    it: `
1. **Legge di potenza pura**, 2.000 valori, γ = 2,5. La ricetta sceglie k_min = 1 e dà γ = 2,48 ± 0,03 su tutti i 2.000 valori. Premi **Esegui il test**: p = 0,73, non esclusa. Passo 4: l'esponenziale è esclusa (rapporto 618,2), ma contro la lognormale e la legge con taglio non c'è decisione. Anche con dati che sono davvero una legge di potenza, il verdetto è «non esclusa», mai «confermata».
2. Leggi **Quattro modi di sbagliare** sugli stessi dati: 1,49 da una retta sull'istogramma con classi uguali, 2,36 con classi logaritmiche, 2,46 da una retta sulla CCDF, 2,48 dalla massima verosimiglianza. L'istogramma con classi uguali sbaglia di un'unità intera.
3. **Coda a legge di potenza, corpo diverso**, con n = 20.000. La curva KS ha il minimo a k_min = 10, dove la coda comincia davvero: γ = 2,52 ± 0,02 su 7.988 valori, p = 0,51. La massima verosimiglianza da k_min = 1 dice 1,39: adattare il corpo insieme alla coda è il quinto modo di sbagliare.
4. **Lognormale**, n = 2.000. La ricetta si ritira a k_min = 14 e tiene 202 valori su 2.000, da 14 a 223; lì trova γ = 2,81 ± 0,13 e p = 0,86. La lognormale passa. Nemmeno il passo 4 la distingue da una legge di potenza, e il verdetto lo dice. Nell'autoverifica, su 20 campioni lognormali di 10.000 valori solo 7 vengono esclusi.
5. **Esponenziale**, n = 2.000. La ricetta arriva fino a k_min = 27, tiene 89 valori tra 27 e 72, e riporta «γ = 5,65 ± 0,49» con p = 0,45. Il verdetto si rifiuta: la coda copre meno di un fattore dieci in k. Qualunque curva è una retta su un intervallo così corto.
6. **Legge di potenza con taglio**: γ = 2,14 ± 0,03 da k_min = 1, e p = 0,02. Esclusa, e il passo 4 dice a favore di che cosa (rapporto −12,6 per la legge con taglio).
7. **Rete ad aggancio preferenziale**. Con 2.000 nodi: k_min = 2, γ = 2,52 ± 0,03, e p = 0,01: esclusa, giustamente, perché per k piccoli non è una legge di potenza. Con 50.000 nodi la ricetta passa a k_min = 8, dà γ = 2,83 ± 0,03 su 4.146 valori e p = 0,20. L'esponente del modello è 3, raggiunto solo per k grandi.
8. **Rete a legge di potenza, campionata**, n = 2.000: γ = 2,93 ± 0,04 da k_min = 1, con p = 0,73. Un errore piccolo, un buon valore p, e l'esponente sbagliato: la coda ha 2,5. Con 20.000 valori la ricetta passa a k_min = 3 e dà 2,61 ± 0,04. Un errore standard misura la dispersione della stima, non se il modello è giusto. Il grafico di Hill dei 20.000 valori è d'accordo con la coda: dai 30 ai 200 valori più grandi resta tra 2,3 e 2,7.
`,
  },
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: 'A network has N = 10⁶ nodes and k_min = 2. What is the largest expected degree for γ = 2.5, 3 and 4? How many nodes does a network need for its degrees to span three decades (k_max = 1,000 k_min) at γ = 3, and at γ = 2.5?',
      it: 'Una rete ha N = 10⁶ nodi e k_min = 2. Qual è il grado massimo atteso per γ = 2,5, 3 e 4? Quanti nodi servono a una rete perché i suoi gradi coprano tre decadi (k_max = 1.000 k_min) con γ = 3, e con γ = 2,5?',
    },
    solution: {
      en: 'k_max = k_min N^(1/(γ−1)). For γ = 2.5 the exponent is 1/1.5 = 2/3 and (10⁶)^(2/3) = 10⁴: k_max = 20,000. For γ = 3 it is (10⁶)^(1/2) = 1,000: k_max = 2,000. For γ = 4, (10⁶)^(1/3) = 100: k_max = 200. Three decades means N^(1/(γ−1)) = 1,000, so N = 1,000^(γ−1): one million nodes at γ = 3, and 1,000^1.5 ≈ 32,000 at γ = 2.5. The heavier the tail, the smaller the network that can show it.',
      it: 'k_max = k_min N^(1/(γ−1)). Per γ = 2,5 l\'esponente è 1/1,5 = 2/3 e (10⁶)^(2/3) = 10⁴: k_max = 20.000. Per γ = 3 è (10⁶)^(1/2) = 1.000: k_max = 2.000. Per γ = 4, (10⁶)^(1/3) = 100: k_max = 200. Tre decadi significa N^(1/(γ−1)) = 1.000, quindi N = 1.000^(γ−1): un milione di nodi con γ = 3, e 1.000^1,5 ≈ 32.000 con γ = 2,5. Più pesante è la coda, più piccola è la rete che riesce a mostrarla.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Treat k as continuous, with p(k) ∝ k^(−2.5) from k_min = 2 up to the natural cutoff. What is ⟨k⟩ in a large network? What are ⟨k²⟩ and ⟨k²⟩/⟨k⟩ for N = 10⁶, and by what factor does ⟨k²⟩ grow if N becomes 10⁸? Then set γ = 2.5 and k_min = 2 in "A dial for the exponent" and compare.',
      it: 'Tratta k come continuo, con p(k) ∝ k^(−2,5) da k_min = 2 fino al cutoff naturale. Quanto vale ⟨k⟩ in una rete grande? Quanto valgono ⟨k²⟩ e ⟨k²⟩/⟨k⟩ per N = 10⁶, e di quale fattore cresce ⟨k²⟩ se N diventa 10⁸? Poi imposta γ = 2,5 e k_min = 2 in «Una manopola per l\'esponente» e confronta.',
    },
    solution: {
      en: 'Normalised, p(k) = C k^(−2.5) with C = (γ − 1) k_min^(γ−1) = 1.5 × 2^1.5 = 4.243. Mean: ⟨k⟩ = k_min (γ − 1)/(γ − 2) = 2 × 1.5/0.5 = 6. Second moment: ⟨k²⟩ = C ∫ k^(−0.5) dk = 2C (√k_max − √k_min). For N = 10⁶, k_max = 20,000 and √k_max = 141.4: ⟨k²⟩ = 2 × 4.243 × (141.4 − 1.4) ≈ 1,190, and ⟨k²⟩/⟨k⟩ ≈ 200. For N = 10⁸, k_max = 2 × (10⁸)^(2/3) ≈ 431,000 and √k_max = 656.4: ⟨k²⟩ ≈ 5,560, larger by a factor of about 4.7, close to 100^(1/3) = 4.6. In the panel the degrees are whole numbers, and the mean is lower: the exact value for whole numbers is 4.72, and the networks drawn have 4.35 at N = 2,000 and 4.62 at N = 20,000 (a few links are lost in the cleaning). What carries over is the behaviour: ⟨k⟩ settles, while ⟨k²⟩ keeps growing, from 107.8 to 285.6 for ten times the nodes. The continuous formula predicts a factor 10^(1/3) = 2.2; the panel gives about 2.6, and another network would give another number.',
      it: 'Normalizzata, p(k) = C k^(−2,5) con C = (γ − 1) k_min^(γ−1) = 1,5 × 2^1,5 = 4,243. Media: ⟨k⟩ = k_min (γ − 1)/(γ − 2) = 2 × 1,5/0,5 = 6. Momento secondo: ⟨k²⟩ = C ∫ k^(−0,5) dk = 2C (√k_max − √k_min). Per N = 10⁶, k_max = 20.000 e √k_max = 141,4: ⟨k²⟩ = 2 × 4,243 × (141,4 − 1,4) ≈ 1.190, e ⟨k²⟩/⟨k⟩ ≈ 200. Per N = 10⁸, k_max = 2 × (10⁸)^(2/3) ≈ 431.000 e √k_max = 656,4: ⟨k²⟩ ≈ 5.560, più grande di un fattore circa 4,7, vicino a 100^(1/3) = 4,6. Nel pannello i gradi sono numeri interi, e la media è più bassa: il valore esatto per numeri interi è 4,72, e le reti estratte hanno 4,35 con N = 2.000 e 4,62 con N = 20.000 (qualche collegamento si perde nella pulizia). Ciò che si conserva è il comportamento: ⟨k⟩ si assesta, mentre ⟨k²⟩ continua a crescere, da 107,8 a 285,6 per dieci volte i nodi. La formula continua prevede un fattore 10^(1/3) = 2,2; il pannello dà circa 2,6, e un\'altra rete darebbe un altro numero.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'A quarter of the nodes have four links and the rest have one. Find ⟨k⟩, the distribution q_k, u and S. What share of four-link nodes is needed for a giant component to exist?',
      it: 'Un quarto dei nodi ha quattro collegamenti e gli altri ne hanno uno. Trova ⟨k⟩, la distribuzione q_k, u e S. Quale quota di nodi con quattro collegamenti serve perché esista una componente gigante?',
    },
    solution: {
      en: '⟨k⟩ = 0.75 × 1 + 0.25 × 4 = 1.75. Following a link we reach a one-link node with probability 0.75/1.75 = 3/7 (it has no other link: q_0 = 3/7) and a four-link node with probability 1/1.75 = 4/7 (three other links: q_3 = 4/7). So G1(u) = 3/7 + (4/7) u³, and u = G1(u) becomes 4u³ − 7u + 3 = 0. One root is u = 1; dividing it out leaves 4u² + 4u − 3 = 0, whose positive root is u = 1/2. Then S = 1 − G0(u) = 1 − (0.75 × 1/2 + 0.25 × 1/16) = 1 − 25/64 = 39/64 = 0.609. For a share f of four-link nodes, G1′(1) = 3 q_3 = 12f/(1 + 3f), which is above 1 when 9f > 1: more than one node in nine. The same answer comes from ⟨k²⟩ − 2⟨k⟩ = (1 + 15f) − 2(1 + 3f) = 9f − 1 > 0.',
      it: '⟨k⟩ = 0,75 × 1 + 0,25 × 4 = 1,75. Seguendo un collegamento si arriva a un nodo con un collegamento con probabilità 0,75/1,75 = 3/7 (non ne ha altri: q_0 = 3/7) e a un nodo con quattro con probabilità 1/1,75 = 4/7 (tre altri collegamenti: q_3 = 4/7). Quindi G1(u) = 3/7 + (4/7) u³, e u = G1(u) diventa 4u³ − 7u + 3 = 0. Una radice è u = 1; dividendo resta 4u² + 4u − 3 = 0, la cui radice positiva è u = 1/2. Allora S = 1 − G0(u) = 1 − (0,75 × 1/2 + 0,25 × 1/16) = 1 − 25/64 = 39/64 = 0,609. Per una quota f di nodi con quattro collegamenti, G1′(1) = 3 q_3 = 12f/(1 + 3f), che supera 1 quando 9f > 1: più di un nodo su nove. La stessa risposta viene da ⟨k²⟩ − 2⟨k⟩ = (1 + 15f) − 2(1 + 3f) = 9f − 1 > 0.',
    },
  },
  {
    type: 'paper',
    statement: {
      en: 'The ten largest degrees of a network, all at or above k_min = 10, are 10, 11, 12, 14, 15, 18, 22, 30, 45, 90. Estimate γ with the shortcut formula γ ≈ 1 + n / Σ ln(k_i / (k_min − ½)) and give its standard error. How many nodes in the tail would bring the error down to 0.05?',
      it: 'I dieci gradi più grandi di una rete, tutti pari o superiori a k_min = 10, sono 10, 11, 12, 14, 15, 18, 22, 30, 45, 90. Stima γ con la formula rapida γ ≈ 1 + n / Σ ln(k_i / (k_min − ½)) e dai il suo errore standard. Quanti nodi nella coda porterebbero l\'errore a 0,05?',
    },
    solution: {
      en: 'Divide each value by 9.5 and take logarithms: 0.051, 0.147, 0.234, 0.388, 0.457, 0.639, 0.840, 1.150, 1.555, 2.248. Their sum is 7.709, so γ ≈ 1 + 10/7.709 = 2.30. The standard error is (γ − 1)/√n = 1.30/√10 = 0.41: with ten values the estimate says little more than "between 2 and 3". For an error of 0.05 we need √n = 1.30/0.05 = 26, so n ≈ 670 nodes in the tail (not in the network: in the tail). Here the shortcut is safe, because k_min is 10: exact maximum likelihood gives 2.30 as well. At k_min = 1 it would not be: on samples drawn with γ = 2.5 the shortcut gives 2.02.',
      it: 'Dividi ogni valore per 9,5 e prendi i logaritmi: 0,051, 0,147, 0,234, 0,388, 0,457, 0,639, 0,840, 1,150, 1,555, 2,248. La somma è 7,709, quindi γ ≈ 1 + 10/7,709 = 2,30. L\'errore standard è (γ − 1)/√n = 1,30/√10 = 0,41: con dieci valori la stima dice poco più di «tra 2 e 3». Per un errore di 0,05 serve √n = 1,30/0,05 = 26, quindi n ≈ 670 nodi nella coda (non nella rete: nella coda). Qui la formula rapida è sicura, perché k_min è 10: la massima verosimiglianza esatta dà anch\'essa 2,30. Con k_min = 1 non lo sarebbe: su campioni estratti con γ = 2,5 la formula rapida dà 2,02.',
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "The giant component, by bookkeeping", choose the pure power law. Where does the giant component disappear? What is S at γ = 2.5 and at γ = 3? What do the networks of 20,000 nodes give?',
      it: 'In «La componente gigante, a conti fatti» scegli la legge di potenza pura. Dove scompare la componente gigante? Quanto vale S con γ = 2,5 e con γ = 3? Che cosa danno le reti di 20.000 nodi?',
    },
    solution: {
      en: 'It disappears at γ = 3.4788, where ⟨k²⟩ − 2⟨k⟩ changes sign: on the slider S is 0.0012 at γ = 3.45 and 0 at 3.5. S = 0.6136 at γ = 2.5 and 0.2014 at γ = 3. Both are well below 1 although ⟨k²⟩ is infinite: with k_min = 1 three nodes in four have a single link at γ = 2.5, and many of them hang in pairs or small trees outside the giant component. The networks give 0.610 and 0.206, within their scatter of the theory. Near the threshold they give more than the theory: 0.019 against 0.0082 at γ = 3.4, and 0.009 at γ = 3.6, where the theory says zero. A network of 20,000 nodes has no sharp threshold; it has a largest component that shrinks until it is one small piece among others.',
      it: 'Scompare a γ = 3,4788, dove ⟨k²⟩ − 2⟨k⟩ cambia segno: sul cursore S vale 0,0012 con γ = 3,45 e 0 con 3,5. S = 0,6136 con γ = 2,5 e 0,2014 con γ = 3. Entrambi sono ben sotto 1 benché ⟨k²⟩ sia infinito: con k_min = 1 tre nodi su quattro hanno un solo collegamento con γ = 2,5, e molti stanno in coppie o piccoli alberi fuori dalla componente gigante. Le reti danno 0,610 e 0,206, entro la loro dispersione dalla teoria. Vicino alla soglia danno più della teoria: 0,019 contro 0,0082 con γ = 3,4, e 0,009 con γ = 3,6, dove la teoria dice zero. Una rete di 20.000 nodi non ha una soglia netta; ha una componente più grande che si riduce finché è un piccolo pezzo tra gli altri.',
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In "Is it a power law?", run the recipe on the three mystery samples and give a verdict for each; then press Reveal. Then take the lognormal source: is the power law ruled out with 300 values? With 30,000?',
      it: 'In «È una legge di potenza?» applica la ricetta ai tre campioni misteriosi e dai un verdetto per ciascuno; poi premi Rivela. Poi prendi la sorgente lognormale: la legge di potenza è esclusa con 300 valori? Con 30.000?',
    },
    solution: {
      en: 'Sample 1: k_min = 10, γ = 2.63 ± 0.04 on 1,968 values of 5,000, p = 0.76. Not ruled out. The tail runs from 10 to 8,713, nearly three decades, but only because of its largest value: the next are 3,275 and 2,276, and the largest of so many values is typically near 10 × 1,968^(1/1.6) ≈ 1,100, two decades from the start. It was a power-law tail with γ = 2.6 above a different body. Sample 2: k_min = 15, γ = 2.96 ± 0.13 on 244 values of 3,000, p = 0.70, and no decision against the lognormal (ratio 0.1). The honest verdict is "not ruled out on the last 8% of the data, and a lognormal is not excluded". It was a lognormal. Sample 3: γ = 2.13 ± 0.01 from k_min = 1 and p < 0.005: none of the 200 synthetic sets fitted worse than the data. Ruled out, with a ratio of −46.3 in favour of the cut-off law. It was a power law with a cut-off. Lognormal, 300 values: this sample gives k_min = 4, γ = 2.09 ± 0.10 and p = 0.03, ruled out; but in the self-check only 16 samples of 50 of this size are. With 30,000 values: k_min = 24, γ = 3.08 ± 0.06 on 1,229 values, and p = 0.21: not ruled out. Only step 4 notices something (the cut-off law fits better, ratio −2.7, p = 0.02). At 50,000 values p comes down to 0.10. More data do not settle the matter by themselves, because the recipe answers by moving k_min further out: what it tests is always the last decade or so.',
      it: 'Campione 1: k_min = 10, γ = 2,63 ± 0,04 su 1.968 valori di 5.000, p = 0,76. Non esclusa. La coda va da 10 a 8.713, quasi tre decadi, ma solo per il suo valore più grande: i successivi sono 3.275 e 2.276, e il più grande di tanti valori è di solito vicino a 10 × 1.968^(1/1,6) ≈ 1.100, due decadi dall\'inizio. Era una coda a legge di potenza con γ = 2,6 sopra un corpo diverso. Campione 2: k_min = 15, γ = 2,96 ± 0,13 su 244 valori di 3.000, p = 0,70, e nessuna decisione contro la lognormale (rapporto 0,1). Il verdetto onesto è «non esclusa sull\'ultimo 8% dei dati, e una lognormale non è esclusa». Era una lognormale. Campione 3: γ = 2,13 ± 0,01 da k_min = 1 e p < 0,005: nessuno dei 200 insiemi sintetici si adatta peggio dei dati. Esclusa, con un rapporto di −46,3 a favore della legge con taglio. Era una legge di potenza con taglio. Lognormale, 300 valori: questo campione dà k_min = 4, γ = 2,09 ± 0,10 e p = 0,03, esclusa; ma nell\'autoverifica lo sono solo 16 campioni su 50 di questa dimensione. Con 30.000 valori: k_min = 24, γ = 3,08 ± 0,06 su 1.229 valori, e p = 0,21: non esclusa. Solo il passo 4 nota qualcosa (la legge con taglio si adatta meglio, rapporto −2,7, p = 0,02). Con 50.000 valori p scende a 0,10. Più dati non chiudono la questione da soli, perché la ricetta risponde spostando k_min più in là: ciò che verifica è sempre l\'ultima decade o poco più.',
    },
  },
]
