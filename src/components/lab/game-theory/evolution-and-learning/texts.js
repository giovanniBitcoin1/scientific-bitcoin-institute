// Module 07 texts that are not part of the lecture: the "what to observe"
// list of each panel, and the exercises. All markdown, EN and IT.
// Changing the game in Panel C goes back to run no. 1 and the start (0.5, 0.5);
// choosing a preset in Panel A goes back to the start (0.5, 0.3, 0.2).
// The lecture itself is src/content/game-theory-lab/evolution-and-learning.<lang>.md.
// Every number quoted here is pinned by scripts/lab/check-game-theory-07.mjs.

export const observe = {
  rps: {
    en: `
1. The panel opens with a = b = 1 and a trajectory from (0.5, 0.3, 0.2). The product x₁x₂x₃ stays at 0.03 all the way to t = 100: the orbit is a closed cycle around the centre, one turn every 11.4 or so. At t = 100 the point is (0.4179, 0.1774, 0.4047), yet the time average is (0.329, 0.336, 0.334), close to the centre. The eigenvalues ±0.57735i say the same: rotation, neither in nor out.
2. Choose **Win more** (a = 1.5): the eigenvalues are −0.08333 ± 0.72169i and the population spirals in. At t = 100 it sits at (0.3333, 0.3334, 0.3334), and the product has reached 1/27 = 0.03704.
3. Choose **Lose more** (b = 1.5): +0.08333 ± 0.72169i, and the population spirals out. Each strategy in turn nearly takes over; at t = 100 the point is (1.0000, 0.0000, 0.0000) and the product is down to 1.99e-17.
4. Back at a = b, click a few other points: every orbit is a closed cycle of its own, and the small chart of the product is a flat line.
5. Choose **Repeated dilemma**. From (0.5, 0.3, 0.2) always defect dies out and the population ends at (0.0230, 0.0000, 0.9770): Tit for Tat with a few unconditional cooperators. The two rings mark 1/17 on the defect–Tit for Tat edge and 4/9 on the cooperate–Tit for Tat edge. Click near the always-defect corner, say at (0.1, 0.85, 0.05): there always defect takes over.
`,
    it: `
1. Il pannello si apre con a = b = 1 e una traiettoria da (0,5, 0,3, 0,2). Il prodotto x₁x₂x₃ resta a 0,03 fino a t = 100: l'orbita è un ciclo chiuso intorno al centro, un giro ogni 11,4 circa. A t = 100 il punto è (0,4179; 0,1774; 0,4047), eppure la media nel tempo è (0,329; 0,336; 0,334), vicina al centro. Gli autovalori ±0,57735i dicono lo stesso: rotazione, né verso il centro né verso i bordi.
2. Scegli **Vincere di più** (a = 1,5): gli autovalori sono −0,08333 ± 0,72169i e la popolazione spiraleggia verso il centro. A t = 100 sta in (0,3333; 0,3334; 0,3334), e il prodotto è arrivato a 1/27 = 0,03704.
3. Scegli **Perdere di più** (b = 1,5): +0,08333 ± 0,72169i, e la popolazione spiraleggia verso i bordi. Ogni strategia a turno quasi prende il sopravvento; a t = 100 il punto è (1,0000; 0,0000; 0,0000) e il prodotto è sceso a 1,99e-17.
4. Tornato ad a = b, clicca qualche altro punto: ogni orbita è un ciclo chiuso a sé, e il grafico piccolo del prodotto è una retta piatta.
5. Scegli **Dilemma ripetuto**. Da (0,5, 0,3, 0,2) chi defeziona sempre si estingue e la popolazione finisce in (0,0230; 0,0000; 0,9770): Tit for Tat con pochi cooperatori incondizionati. I due anelli segnano 1/17 sul lato tra defeziona sempre e Tit for Tat e 4/9 sul lato tra coopera sempre e Tit for Tat. Clicca vicino all'angolo di chi defeziona sempre, per esempio in (0,1, 0,85, 0,05): lì defeziona sempre prende il sopravvento.
`,
  },
  moran: {
    en: `
1. The panel opens on a mutant of constant fitness r = 1.1 among N = 10: ρ_A = 0.147950, against 0.1 for a neutral one. **Run 10,000 mutants**: run 1 measures 0.1504 (95%: 0.1434–0.1574), and the black bar on the chart covers the curve.
2. Set r = **0.9**: a harmful mutant still takes over with 0.059482. Raise N to **100**: r = 1.1 gives 0.090916, while r = 0.9 falls to 0.000003. Chance protects a bad mutant only in a small population.
3. Choose the **Stag hunt** with N = 50 and w = 0.1: a stag mutant takes over with 0.001284, a hare mutant with 0.018412, 14.34 times more often. The hare is risk dominant (x* = 2/3 for stag). At N = 10 even the stag mutant has 0.057358, below the neutral 0.1.
4. Choose **Coordination** with x* = 0.3, N = 50 and w = **0.01** (weak selection): ρ_A = 0.020207, just above 1/N = 0.02, and the panel answers yes to both questions. Move x* to **0.4**: ρ_A = 0.019455, below 1/N. The one-third rule in numbers.
5. Choose the **Dilemma** with N = 50 and w = 0.1: a single C takes over with 0.000161, a single D with 0.143350. **Hawk and dove**: dove 0.037537 and hawk 0.040252, both above 1/N = 0.02: each invades the other, as in the lecture's mixed ESS.
6. Press **Watch one**: one event per frame on the N dots; the parent is ringed, the replaced one ringed thicker. Most single mutants die out, as ρ says.
`,
    it: `
1. Il pannello si apre su un mutante con fitness costante r = 1,1 tra N = 10: ρ_A = 0,147950, contro 0,1 per uno neutrale. **10.000 mutanti**: la prova 1 misura 0,1504 (95%: 0,1434–0,1574), e la barra nera sul grafico copre la curva.
2. Porta r a **0,9**: un mutante dannoso prende ancora il sopravvento con 0,059482. Alza N a **100**: r = 1,1 dà 0,090916, mentre r = 0,9 scende a 0,000003. Il caso protegge un cattivo mutante solo in una popolazione piccola.
3. Scegli la **Caccia al cervo** con N = 50 e w = 0,1: un mutante cervo prende il sopravvento con 0,001284, un mutante lepre con 0,018412, 14,34 volte più spesso. La lepre è rischio-dominante (x* = 2/3 per il cervo). Con N = 10 anche il mutante cervo ha 0,057358, sotto lo 0,1 neutrale.
4. Scegli **Coordinamento** con x* = 0,3, N = 50 e w = **0,01** (selezione debole): ρ_A = 0,020207, appena sopra 1/N = 0,02, e il pannello risponde sì a entrambe le domande. Porta x* a **0,4**: ρ_A = 0,019455, sotto 1/N. La regola di un terzo in numeri.
5. Scegli il **Dilemma** con N = 50 e w = 0,1: una C sola prende il sopravvento con 0,000161, una D sola con 0,143350. **Falco e colomba**: colomba 0,037537 e falco 0,040252, entrambi sopra 1/N = 0,02: ognuno invade l'altro, come nella ESS mista della lezione.
6. Premi **Guardane uno**: un evento per fotogramma sugli N punti; chi si riproduce è cerchiato, chi viene sostituito cerchiato più spesso. La maggior parte dei mutanti soli si estingue, come dice ρ.
`,
  },
  hedge: {
    en: `
1. The panel opens on chicken, T = 2,000, η = 0.1, start (0.5, 0.5). In run no. 1 the learners end at (0.0000, 1.0000): the row player goes straight and the column player swerves, a pure equilibrium; that cell was played 0.875 of the time. Their average payoffs are 3.674 and 1.147, and each regret is 0.0036, well under the bound 0.0160. Run no. 2 ends at the other pure equilibrium, (1.0000, 0.0000).
2. Choose **Matching pennies**: no settling. Run no. 1 ends at (0.0998, 0.0014), far out near a corner, yet each player played his first action 0.516 and 0.494 of the time and the average payoffs are 0.499 and 0.501: the value 1/2.
3. Set T = **10,000** and press **η for this T** (η = 0.0235): the bound falls to 0.0059 and the regrets are 0.0028 and 0.0026. The gain from switching in the table falls to 0.0031: the frequencies of play approach a correlated equilibrium, here the mixed one.
4. Set T back to **2,000** and η to **0.1**, and choose the **Dilemma**: (D, D) is played 0.972 of the time. The **Stag hunt** from (0.5, 0.5) ends at (hare, hare); click at (0.8, 0.8), and the learners end at (stag, stag): where learning lands depends on where it starts.
5. The **Battle of the sexes** ends at one of its pure equilibria, (Concert, Concert) in run no. 1, played 0.970 of the time.
`,
    it: `
1. Il pannello si apre sul gioco del pollo, T = 2.000, η = 0,1, partenza (0,5; 0,5). Nella prova n. 1 i due finiscono in (0,0000; 1,0000): il giocatore di riga va dritto e quello di colonna sterza, un equilibrio puro; quella cella è stata giocata per lo 0,875 del tempo. I payoff medi sono 3,674 e 1,147, e ciascun regret è 0,0036, ben sotto il limite 0,0160. La prova n. 2 finisce nell'altro equilibrio puro, (1,0000; 0,0000).
2. Scegli **Pari o dispari**: nessun assestamento. La prova n. 1 finisce in (0,0998; 0,0014), lontano, vicino a un angolo, eppure ciascuno ha giocato la sua prima azione per lo 0,516 e lo 0,494 del tempo e i payoff medi sono 0,499 e 0,501: il valore 1/2.
3. Porta T a **10.000** e premi **η per questo T** (η = 0,0235): il limite scende a 0,0059 e i regret sono 0,0028 e 0,0026. Il guadagno dal cambiare nella tabella scende a 0,0031: le frequenze del gioco si avvicinano a un equilibrio correlato, qui quello misto.
4. Riporta T a **2.000** e η a **0,1**, e scegli il **Dilemma**: (D, D) è giocata per lo 0,972 del tempo. La **Caccia al cervo** da (0,5; 0,5) finisce in (lepre, lepre); clicca in (0,8; 0,8), e i due finiscono in (cervo, cervo): dove arriva l'apprendimento dipende da dove parte.
5. La **Battaglia dei sessi** finisce in uno dei suoi equilibri puri, (Concerto, Concerto) nella prova n. 1, giocata per lo 0,970 del tempo.
`,
  },
}

export const exercises = [
  {
    type: 'paper',
    statement: {
      en: 'Module 01\'s chicken as hawk and dove: (3, 3), (1, 4), (4, 1), (0, 0), with D the hawk. Show that neither pure strategy is an ESS, and find the ESS.',
      it: 'Il gioco del pollo del modulo 01 come falco e colomba: (3, 3), (1, 4), (4, 1), (0, 0), con D il falco. Mostra che nessuna delle due strategie pure è una ESS, e trova la ESS.',
    },
    solution: {
      en: 'In a population of doves a hawk earns 4 against a dove\'s 3: 4 > 3, so doves are invaded. In a population of hawks a dove earns 1 against a hawk\'s 0: 1 > 0, so hawks are invaded. Against a share h of hawks a dove earns 3(1 − h) + h and a hawk 4(1 − h): they are equal at h = 1/2. The advantage of the dove, 2h − 1, rises with the share of hawks, so a mutant that plays hawk more often than half does worse than the residents against its own kind: half hawks is the ESS.',
      it: 'In una popolazione di colombe un falco guadagna 4 contro il 3 di una colomba: 4 > 3, quindi le colombe sono invase. In una popolazione di falchi una colomba guadagna 1 contro lo 0 di un falco: 1 > 0, quindi i falchi sono invasi. Contro una quota h di falchi una colomba guadagna 3(1 − h) + h e un falco 4(1 − h): sono uguali per h = 1/2. Il vantaggio della colomba, 2h − 1, cresce con la quota di falchi, quindi un mutante che fa il falco più spesso della metà fa peggio dei residenti contro i suoi simili: metà falchi è la ESS.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Write the replicator equation for the share of C in a (T, S) game. Find the interior rest point and its stability for (4/3, 1/3), for (1/2, −1) and for (2, −1/2). Then check it in Figure F1.',
      it: 'Scrivi l\'equazione del replicatore per la quota di C in un gioco (T, S). Trova il punto di equilibrio interno e la sua stabilità per (4/3, 1/3), per (1/2, −1) e per (2, −1/2). Poi verificalo nella Figura F1.',
    },
    solution: {
      en: 'f_C = x + S(1 − x), f_D = Tx, so ẋ = x(1 − x)[(1 − T)x + S(1 − x)], with the interior point x* = S/(S + T − 1). (4/3, 1/3): x* = (1/3)/(2/3) = 1/2; the bracket falls as x rises (1 − T − S = −2/3 < 0), so it is stable. (1/2, −1): x* = −1/(−3/2) = 2/3; the bracket rises (1 − T − S = 3/2 > 0), so it is unstable: the stag hunt\'s tipping point. (2, −1/2): x* = −1, outside [0, 1]: none, and D takes over.',
      it: 'f_C = x + S(1 − x), f_D = Tx, quindi ẋ = x(1 − x)[(1 − T)x + S(1 − x)], con il punto interno x* = S/(S + T − 1). (4/3, 1/3): x* = (1/3)/(2/3) = 1/2; la parentesi decresce al crescere di x (1 − T − S = −2/3 < 0), quindi è stabile. (1/2, −1): x* = −1/(−3/2) = 2/3; la parentesi cresce (1 − T − S = 3/2 > 0), quindi è instabile: il tipping point della caccia al cervo. (2, −1/2): x* = −1, fuori da [0, 1]: nessuno, e D prende il sopravvento.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Rock, paper, scissors with a win worth a and a loss costing b. Show that the product V = x_R x_P x_S changes at the rate V(a − b)(1 − 3(x_R x_P + x_P x_S + x_S x_R)). What follows for a > b, a = b, a < b? Then check it in Panel A.',
      it: 'Sasso, carta, forbici con una vittoria che vale a e una sconfitta che costa b. Mostra che il prodotto V = x_S x_C x_F cambia con velocità V(a − b)(1 − 3(x_S x_C + x_C x_F + x_F x_S)). Che cosa segue per a > b, a = b, a < b? Poi verificalo nel Pannello A.',
    },
    solution: {
      en: 'V̇/V = Σ ẋᵢ/xᵢ = Σ fᵢ − 3f̄. Each column of the matrix holds 0, a and −b, so Σ fᵢ = a − b; and f̄ = (a − b)(x_R x_P + x_P x_S + x_S x_R), since in each pair one wins a and the other loses b. Hence V̇ = V(a − b)(1 − 3σ), σ the sum of the pairs, which is at most 1/3 (at the centre). For a > b, V rises: in, towards the centre. For a = b it is constant: from (0.5, 0.3, 0.2) it stays 0.03, a closed cycle. For a < b, V falls: out, towards the edges.',
      it: 'V̇/V = Σ ẋᵢ/xᵢ = Σ fᵢ − 3f̄. Ogni colonna della matrice contiene 0, a e −b, quindi Σ fᵢ = a − b; e f̄ = (a − b)(x_S x_C + x_C x_F + x_F x_S), perché in ogni coppia uno vince a e l\'altro perde b. Quindi V̇ = V(a − b)(1 − 3σ), con σ la somma delle coppie, che vale al più 1/3 (nel centro). Per a > b, V cresce: verso il centro. Per a = b è costante: da (0,5, 0,3, 0,2) resta 0,03, un ciclo chiuso. Per a < b, V decresce: verso i bordi.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'In Panel A\'s "Repeated dilemma" (always cooperate, always defect, Tit for Tat; 10 rounds of (3, 0, 5, 1)), above which share does Tit for Tat beat always defect on their edge? On the edge between always cooperate and Tit for Tat, when can always defect invade? Then check it in Panel A.',
      it: 'Nel "Dilemma ripetuto" del Pannello A (coopera sempre, defeziona sempre, Tit for Tat; 10 turni di (3, 0, 5, 1)), sopra quale quota Tit for Tat batte chi defeziona sempre sul loro lato? Sul lato tra coopera sempre e Tit for Tat, quando può invadere chi defeziona sempre? Poi verificalo nel Pannello A.',
    },
    solution: {
      en: 'Against always defect, Tit for Tat loses the first round and then gets 1: 9; always defect against Tit for Tat gets 5 then 1: 14; against each other 10 and 30. With y the share of Tit for Tat: always defect earns 10 + 4y, Tit for Tat 9 + 21y, so Tit for Tat wins when 17y > 1, y > 1/17. On the other edge both residents earn 30. Always defect earns 50 against always cooperate and 14 against Tit for Tat: 14 + 36x with x the share of always cooperate. It invades when 14 + 36x > 30, x > 4/9.',
      it: 'Contro chi defeziona sempre, Tit for Tat perde il primo turno e poi ottiene 1: 9; chi defeziona sempre contro Tit for Tat ottiene 5 e poi 1: 14; tra loro 10 e 30. Con y la quota di Tit for Tat: chi defeziona sempre guadagna 10 + 4y, Tit for Tat 9 + 21y, quindi Tit for Tat vince quando 17y > 1, y > 1/17. Sull\'altro lato entrambi i residenti guadagnano 30. Chi defeziona sempre guadagna 50 contro chi coopera sempre e 14 contro Tit for Tat: 14 + 36x con x la quota di chi coopera sempre. Invade quando 14 + 36x > 30, x > 4/9.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'A mutant with constant fitness r in a population of 10: what is its fixation probability for r = 1.1, 0.9 and 1? In module 02\'s stag hunt with N = 50 and w = 0.1, which lone mutant takes over more often? Then check it in Panel B.',
      it: 'Un mutante con fitness costante r in una popolazione di 10: qual è la sua probabilità di fissazione per r = 1,1, 0,9 e 1? Nella caccia al cervo del modulo 02 con N = 50 e w = 0,1, quale mutante solo prende il sopravvento più spesso? Poi verificalo nel Pannello B.',
    },
    solution: {
      en: 'ρ = (1 − 1/r)/(1 − 1/r^10): r = 1.1 gives 0.0909/0.6145 = 0.148; r = 0.9 gives −0.1111/(−1.868) = 0.059; r = 1 is the neutral case, 1/10 = 0.1. In the stag hunt the formula with the products of f_B/f_A gives 0.0184 for a lone hare hunter and 0.0013 for a lone stag hunter: the hare hunter, about 14 times more often. Hare is the risk-dominant convention.',
      it: 'ρ = (1 − 1/r)/(1 − 1/r^10): r = 1,1 dà 0,0909/0,6145 = 0,148; r = 0,9 dà −0,1111/(−1,868) = 0,059; r = 1 è il caso neutrale, 1/10 = 0,1. Nella caccia al cervo la formula con i prodotti di f_B/f_A dà 0,0184 per un cacciatore di lepri solo e 0,0013 per un cacciatore di cervi solo: il cacciatore di lepri, circa 14 volte più spesso. La lepre è la convenzione rischio-dominante.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Check that the lottery 1/3, 1/3, 1/3 on (swerve, swerve), (swerve, straight), (straight, swerve) is a correlated equilibrium of module 01\'s chicken; compute its payoff and compare it with the mixed equilibrium. In Panel C, with T = 2,000 and η = 0.1, what bound holds for the average regret? Then check it in Figure F2 and Panel C.',
      it: 'Verifica che la lotteria 1/3, 1/3, 1/3 su (sterza, sterza), (sterza, dritto), (dritto, sterza) è un equilibrio correlato del gioco del pollo del modulo 01; calcola il suo payoff e confrontalo con l\'equilibrio misto. Nel Pannello C, con T = 2.000 e η = 0,1, quale limite vale per il regret medio? Poi verificalo nella Figura F2 e nel Pannello C.',
    },
    solution: {
      en: 'Told to swerve, a driver knows the cell is (swerve, swerve) or (swerve, straight), each with 1/2: swerving gives 3·½ + 1·½ = 2, going straight 4·½ + 0·½ = 2, so he obeys. Told to go straight, the cell is (straight, swerve): going straight gives 4, swerving 3. The same holds for the other driver. The payoff is (3 + 1 + 4)/3 = 8/3 ≈ 2.67 each, against 2 in the mixed equilibrium (swerve with 1/2: 3·½ + 1·½). The bound is ln 2/(0.1 × 2,000) + 0.1/8 = ln 2/200 + 0.0125 = 0.0160.',
      it: 'Se gli dice di sterzare, un guidatore sa che la cella è (sterza, sterza) o (sterza, dritto), ciascuna con 1/2: sterzare dà 3·½ + 1·½ = 2, andare dritto 4·½ + 0·½ = 2, quindi obbedisce. Se gli dice di andare dritto, la cella è (dritto, sterza): andare dritto dà 4, sterzare 3. Lo stesso vale per l\'altro guidatore. Il payoff è (3 + 1 + 4)/3 = 8/3 ≈ 2,67 a testa, contro 2 nell\'equilibrio misto (sterza con 1/2: 3·½ + 1·½). Il limite è ln 2/(0,1 × 2.000) + 0,1/8 = ln 2/200 + 0,0125 = 0,0160.',
    },
  },
]
