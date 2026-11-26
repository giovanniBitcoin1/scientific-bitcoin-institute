// Module 09 texts outside the lecture: "What to observe" for each panel and
// the exercises. Every number is pinned by scripts/lab/check-game-theory-09.mjs
// ("quoted on the page").

export const observe = {
  publicgoods: {
    en: `
1. The panel opens on the line of 5. Press **Specialized equilibria**: four sets, {1, 3, 5} with total 3, the only stable one, and {1, 4}, {2, 4}, {2, 5} with total 2. Click {1, 4}: an equilibrium, but not stable, since player 2 has only player 1 working next to her and player 5 only player 4.
2. Press **Best responses**: runs 1 to 4 end at {1, 3, 5}. Run 5 ends at an equilibrium that is not specialized: 0.4470, 0.5530, 0.0000, 0.9149, 0.0851, a total of 2. Over runs 1 to 20 the line ends at {1, 3, 5} 19 times.
3. Choose the **star of 6**: every run ends with the five leaves working and the hub doing nothing, a total of 5, in 2 turns (3 in run 13). The list's other equilibrium, {1}, total 1, is never reached.
4. On the **ring of 6** the runs end at {1, 3, 5} or at {2, 4, 6} (9 and 11 times over runs 1 to 20), never at a pair of opposite players such as {1, 4}: those are equilibria with total 2, but not stable.
5. On the **3 × 3 grid**, run 5 ends at an equilibrium that is not specialized, total 3: player 2 works 1, players 4 and 7 share 0.5427 and 0.4573, players 6 and 9 0.0786 and 0.9214. Over runs 1 to 20 the grid ends at {1, 3, 5, 7, 9} 17 times and never at {2, 4, 6, 8}, which is stable too.
`,
    it: `
1. Il pannello si apre sulla linea di 5. Premi **Equilibri specializzati**: quattro insiemi, {1, 3, 5} con totale 3, l'unico stabile, e {1, 4}, {2, 4}, {2, 5} con totale 2. Clicca su {1, 4}: è un equilibrio, ma non stabile, perché il giocatore 2 ha accanto solo il giocatore 1 che lavora e il giocatore 5 solo il 4.
2. Premi **Migliori risposte**: le prove da 1 a 4 finiscono in {1, 3, 5}. La prova 5 finisce in un equilibrio non specializzato: 0,4470; 0,5530; 0,0000; 0,9149; 0,0851, per un totale di 2. Sulle prove da 1 a 20 la linea finisce in {1, 3, 5} 19 volte.
3. Scegli la **stella di 6**: ogni prova finisce con le cinque foglie che lavorano e l'hub che non fa nulla, per un totale di 5, in 2 giri (3 nella prova 13). L'altro equilibrio dell'elenco, {1}, totale 1, non si raggiunge mai.
4. Sull'**anello di 6** le prove finiscono in {1, 3, 5} o in {2, 4, 6} (9 e 11 volte sulle prove da 1 a 20), mai in una coppia di giocatori opposti come {1, 4}: sono equilibri con totale 2, ma non stabili.
5. Sulla **griglia 3 × 3** la prova 5 finisce in un equilibrio non specializzato, totale 3: il giocatore 2 lavora 1, i giocatori 4 e 7 si dividono 0,5427 e 0,4573, i giocatori 6 e 9 0,0786 e 0,9214. Sulle prove da 1 a 20 la griglia finisce in {1, 3, 5, 7, 9} 17 volte e mai in {2, 4, 6, 8}, che pure è stabile.
`,
  },
  keyplayer: {
    en: `
1. The panel opens on the bridge network at δ = 0.3: λ_max is 2.3475, so δ must stay below 0.4260. Total effort is 26.8779. Player 1 is the most active (4.1655), player 4 the key player (11.3988); by effort the order is 1, 4, 5, 2, 3, 6, 7, 8, 9, by intercentrality 4, 1, 5, 2, 3, 6, 7, 8, 9.
2. Click player 4: the total falls to 15.4791, a drop of 11.3988, exactly her intercentrality. Restore and click player 1: 15.9616, a drop of 10.9163. Removing the more active player costs less.
3. Move δ to **0.1**: player 4 is now both the most active (1.4013) and the key player (1.9038). The most active changes from player 4 to player 1 between 0.26 and 0.27 (at δ = 0.2696); the key player stays player 4 along the whole slider.
4. Move δ to the top, **0.42**: total effort is 517.6051. Close to 1/λ_max the efforts grow without limit.
5. On the **line of 5** at δ = 0.3 the middle player 3 is the key player (4.2994); on the **star of 6** the hub, with 4.5455 against 2.3636 for each leaf and an intercentrality of 11.3636; on the **ring of 6** all six are alike: 2.5 each and 4.9863.
`,
    it: `
1. Il pannello si apre sulla rete a ponte con δ = 0,3: λ_max vale 2,3475, quindi δ deve restare sotto 0,4260. Lo sforzo totale è 26,8779. Il giocatore 1 è il più attivo (4,1655), il 4 il giocatore chiave (11,3988); per sforzo l'ordine è 1, 4, 5, 2, 3, 6, 7, 8, 9, per intercentralità 4, 1, 5, 2, 3, 6, 7, 8, 9.
2. Clicca sul giocatore 4: il totale scende a 15,4791, un calo di 11,3988, esattamente la sua intercentralità. Ripristina e clicca sul giocatore 1: 15,9616, un calo di 10,9163. Togliere il giocatore più attivo costa meno.
3. Porta δ a **0,1**: ora il giocatore 4 è sia il più attivo (1,4013) sia il giocatore chiave (1,9038). Il più attivo passa dal giocatore 4 al giocatore 1 tra 0,26 e 0,27 (in δ = 0,2696); il giocatore chiave resta il 4 su tutto il cursore.
4. Porta δ in cima, a **0,42**: lo sforzo totale è 517,6051. Vicino a 1/λ_max gli sforzi crescono senza limite.
5. Sulla **linea di 5** con δ = 0,3 il giocatore chiave è il 3, quello in mezzo (4,2994); sulla **stella di 6** l'hub, con 4,5455 contro 2,3636 per ogni foglia e un'intercentralità di 11,3636; sull'**anello di 6** i sei sono uguali: 2,5 ciascuno e 4,9863.
`,
  },
  formation: {
    en: `
1. The panel opens with n = 8, δ = 0.5, c = 0.4, the empty network, run no. 1. Press **To the end**: 31 steps and 13 changes (11 links added, 2 cut) end at a pairwise stable network with 9 links, degrees 3, 3, 3, 2, 2, 2, 2, 1, and a total utility of 9.80, against 11.90 for the star, the efficient network.
2. Press **New run** and **To the end** four times: runs 2 to 5 end at 10.50, 9.80, 10.50 and 9.60. Over runs 1 to 20 the end has 8 to 10 links and a total from 9.60 to 10.50, and it is never the star, although the star is pairwise stable here.
3. Set c = **0.2**: from every start the run ends at the complete network, 28 links and 16.80, the efficient total.
4. Set c = **0.6**: from the empty network nothing happens, 0 steps, while the star would give 9.10. From the complete one, run no. 1 cuts all 28 links in 155 steps and ends empty too.
5. Set c = **1.5**: every start ends empty, which is now the efficient network.
6. Back to c = 0.4, set n = **12**: run no. 1 from empty takes 359 steps and ends with 20 links and a total of 26.25, against 29.70 for the star.
`,
    it: `
1. Il pannello si apre con n = 8, δ = 0,5, c = 0,4, la rete vuota, prova n. 1. Premi **Fino alla fine**: 31 passi e 13 cambi (11 collegamenti aggiunti, 2 tagliati) finiscono in una rete stabile a coppie con 9 collegamenti, gradi 3; 3; 3; 2; 2; 2; 2; 1, e un'utilità totale di 9,80, contro 11,90 della stella, la rete efficiente.
2. Premi **Nuova prova** e **Fino alla fine** quattro volte: le prove da 2 a 5 finiscono a 10,50, 9,80, 10,50 e 9,60. Sulle prove da 1 a 20 la rete finale ha da 8 a 10 collegamenti e un totale tra 9,60 e 10,50, e non è mai la stella, benché qui la stella sia stabile a coppie.
3. Porta c a **0,2**: da ogni partenza la prova finisce nella rete completa, 28 collegamenti e 16,80, il totale efficiente.
4. Porta c a **0,6**: dalla rete vuota non succede nulla, 0 passi, mentre la stella darebbe 9,10. Da quella completa, la prova n. 1 taglia tutti i 28 collegamenti in 155 passi e finisce anch'essa vuota.
5. Porta c a **1,5**: ogni partenza finisce vuota, che ora è la rete efficiente.
6. Torna a c = 0,4 e porta n a **12**: la prova n. 1 dalla rete vuota richiede 359 passi e finisce con 20 collegamenti e un totale di 26,25, contro 29,70 della stella.
`,
  },
}

export const exercises = [
  {
    type: 'both',
    statement: {
      en: 'The star with four leaves and best responses x_i = max(0, 1 + δ Σ_j g_ij x_j). Write the hub\'s and a leaf\'s best responses, solve them, and give the efforts at δ = 0.25 and δ = −0.25. Then check them in Figure F1.',
      it: 'La stella con quattro foglie e migliori risposte x_i = max(0, 1 + δ Σ_j g_ij x_j). Scrivi le migliori risposte dell\'hub e di una foglia, risolvile e ricava gli sforzi con δ = 0,25 e δ = −0,25. Poi verificali nella Figura F1.',
    },
    solution: {
      en: 'The hub: h = max(0, 1 + 4δl); a leaf: l = max(0, 1 + δh). If both work, h = 1 + 4δ(1 + δh), so h = (1 + 4δ)/(1 − 4δ²) and l = 1 + δh = (1 + δ)/(1 − 4δ²). At δ = 0.25: h = 2/0.75 = 8/3 and l = 1.25/0.75 = 5/3. At δ = −0.25 the hub\'s formula gives 0: h = 0, and then each leaf works l = 1 + δ × 0 = 1; the hub\'s best response to four leaves at 1 is max(0, 1 − 4 × 0.25) = 0, so this is the equilibrium.',
      it: 'L\'hub: h = max(0, 1 + 4δl); una foglia: l = max(0, 1 + δh). Se lavorano entrambi, h = 1 + 4δ(1 + δh), quindi h = (1 + 4δ)/(1 − 4δ²) e l = 1 + δh = (1 + δ)/(1 − 4δ²). Con δ = 0,25: h = 2/0,75 = 8/3 e l = 1,25/0,75 = 5/3. Con δ = −0,25 la formula dell\'hub dà 0: h = 0, e allora ogni foglia lavora l = 1 + δ × 0 = 1; la miglior risposta dell\'hub a quattro foglie a 1 è max(0, 1 − 4 × 0,25) = 0, quindi questo è l\'equilibrio.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Local public goods, x_i = max(0, 1 − Σ_j g_ij x_j). List the specialized equilibria of the line of 5 (1–2–3–4–5) and of the star of 6 (hub 1), and say which are stable. Then check them in Panel A.',
      it: 'Beni pubblici locali, x_i = max(0, 1 − Σ_j g_ij x_j). Elenca gli equilibri specializzati della linea di 5 (1–2–3–4–5) e della stella di 6 (hub 1), e di\' quali sono stabili. Poi verificali nel Pannello A.',
    },
    solution: {
      en: 'The workers must form a maximal independent set. Line: {1, 3, 5}, {1, 4}, {2, 4}, {2, 5}. Only {1, 3, 5} is stable: there players 2 and 4 each have two working neighbours, while in {1, 4} player 5 has only player 4, in {2, 4} player 1 only player 2, in {2, 5} player 1 only player 2. Star: {1} (total 1), where each leaf has only the hub, so it is not stable, and {2, 3, 4, 5, 6} (total 5), where the hub has five working neighbours: the stable one.',
      it: 'Chi lavora deve formare un insieme indipendente massimale. Linea: {1, 3, 5}, {1, 4}, {2, 4}, {2, 5}. Solo {1, 3, 5} è stabile: lì i giocatori 2 e 4 hanno ciascuno due vicini che lavorano, mentre in {1, 4} il giocatore 5 ha solo il 4, in {2, 4} il giocatore 1 solo il 2, in {2, 5} il giocatore 1 solo il 2. Stella: {1} (totale 1), dove ogni foglia ha solo l\'hub, quindi non è stabile, e {2, 3, 4, 5, 6} (totale 5), dove l\'hub ha cinque vicini che lavorano: quello stabile.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'The ring of 6, players 1 to 6 in order. Which specialized equilibria are there, and which are stable? Then check them in Panel A.',
      it: 'L\'anello di 6, giocatori da 1 a 6 in ordine. Quali equilibri specializzati ci sono e quali sono stabili? Poi verificali nel Pannello A.',
    },
    solution: {
      en: 'The maximal independent sets are {1, 3, 5}, {2, 4, 6} and the three pairs of opposite players {1, 4}, {2, 5}, {3, 6}. In {1, 3, 5} every other player sits between two workers, and likewise in {2, 4, 6}: both are stable. In {1, 4} player 2 has only player 1 working next to her (her other neighbour, 3, does not work), and the same holds for every non-worker: the pairs are equilibria but not stable.',
      it: 'Gli insiemi indipendenti massimali sono {1, 3, 5}, {2, 4, 6} e le tre coppie di giocatori opposti {1, 4}, {2, 5}, {3, 6}. In {1, 3, 5} ogni altro giocatore sta tra due che lavorano, e così in {2, 4, 6}: sono entrambi stabili. In {1, 4} il giocatore 2 ha accanto solo il giocatore 1 che lavora (l\'altro vicino, il 3, non lavora), e lo stesso vale per ogni giocatore che non lavora: le coppie sono equilibri ma non stabili.',
    },
  },
  {
    type: 'sim',
    statement: {
      en: 'In Panel B, the bridge network at δ = 0.1 and at δ = 0.3: who is the most active player and who is the key player? Remove each candidate and compare the drops. At which δ does the most active player change?',
      it: 'Nel Pannello B, la rete a ponte con δ = 0,1 e con δ = 0,3: chi è il giocatore più attivo e chi il giocatore chiave? Togli ciascun candidato e confronta i cali. Con quale δ cambia il giocatore più attivo?',
    },
    solution: {
      en: 'At δ = 0.1 player 4 is both: the most active (1.4013) and the key player (her removal lowers total effort by 1.9038, against 1.8784 for player 1). At δ = 0.3 player 1 is the most active (4.1655 against 4.1241), but removing player 4 lowers total effort by 11.3988, against 10.9163 for player 1. The most active player changes at δ ≈ 0.2696, between the slider\'s 0.26 and 0.27; the key player stays player 4.',
      it: 'Con δ = 0,1 il giocatore 4 è l\'uno e l\'altro: il più attivo (1,4013) e il giocatore chiave (toglierlo fa calare lo sforzo totale di 1,9038, contro 1,8784 per il giocatore 1). Con δ = 0,3 il più attivo è il giocatore 1 (4,1655 contro 4,1241), ma togliere il giocatore 4 fa calare lo sforzo totale di 11,3988, contro 10,9163 per il giocatore 1. Il giocatore più attivo cambia in δ ≈ 0,2696, tra lo 0,26 e lo 0,27 del cursore; il giocatore chiave resta il 4.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'The connections model with n = 6 and δ = 0.5. Compute the three thresholds δ − δ², δ and δ + (n − 2)δ²/2, and find the efficient network at c = 0.2, 0.4, 0.7 and 1.2. Then check it in Figure F2.',
      it: 'Il modello delle connessioni con n = 6 e δ = 0,5. Calcola le tre soglie δ − δ², δ e δ + (n − 2)δ²/2, e trova la rete efficiente con c = 0,2, 0,4, 0,7 e 1,2. Poi verificalo nella Figura F2.',
    },
    solution: {
      en: 'The thresholds are 0.5 − 0.25 = 0.25, 0.5 and 0.5 + 4 × 0.25/2 = 1. The complete network gives 30(0.5 − c), the star 10(0.5 − c) + 20 × 0.25 = 10(0.5 − c) + 5. At c = 0.2: complete, 9 against 8 for the star. At c = 0.4: star, 6 against 3. At c = 0.7: star, 3, but not pairwise stable, since c > δ. At c = 1.2: empty, 0, since the star would give −2.',
      it: 'Le soglie sono 0,5 − 0,25 = 0,25, 0,5 e 0,5 + 4 × 0,25/2 = 1. La rete completa dà 30(0,5 − c), la stella 10(0,5 − c) + 20 × 0,25 = 10(0,5 − c) + 5. Con c = 0,2: completa, 9 contro 8 della stella. Con c = 0,4: stella, 6 contro 3. Con c = 0,7: stella, 3, ma non stabile a coppie, perché c > δ. Con c = 1,2: vuota, 0, perché la stella darebbe −2.',
    },
  },
  {
    type: 'both',
    statement: {
      en: 'Show that when c > δ no pairwise stable network has a player with exactly one link, and that from the empty network nothing ever happens. Then check it in Panel C (for instance δ = 0.5, c = 0.6).',
      it: 'Mostra che quando c > δ nessuna rete stabile a coppie ha un giocatore con un solo collegamento, e che dalla rete vuota non succede mai nulla. Poi verificalo nel Pannello C (per esempio δ = 0,5, c = 0,6).',
    },
    solution: {
      en: 'Let i have one link, to j. Everyone i reaches, she reaches through j, so the link gives j only i herself, at distance 1: a gain of δ for a cost of c > δ. So j gains strictly by cutting it, and the network is not pairwise stable. From the empty network, two isolated players who link would each gain δ − c < 0: no pair wants to add a link, and nothing ever happens.',
      it: 'Sia i un giocatore con un solo collegamento, verso j. Tutti quelli che i raggiunge, li raggiunge attraverso j, quindi il collegamento dà a j solo i stesso, a distanza 1: un guadagno di δ per un costo c > δ. Quindi j guadagna strettamente tagliandolo, e la rete non è stabile a coppie. Dalla rete vuota, due giocatori isolati che si collegano guadagnerebbero ciascuno δ − c < 0: nessuna coppia vuole aggiungere un collegamento, e non succede mai nulla.',
    },
  },
]
