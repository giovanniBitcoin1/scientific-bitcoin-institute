<!-- DRAFT: to be reviewed by Adriano -->

## A threat

A firm has a market to itself. A newcomer is thinking of entering, and the firm lets it be known: come in and I will start a price war that ruins us both. Should the newcomer believe it?

The tables of [module 01](/game-theory-lab/what-is-a-game) cannot answer: there the players choose at the same time. Here the newcomer decides first, and the firm after seeing what it did. The answer lies in the order of the moves.

## Trees

A game in time is drawn as a **tree**. Each **node** is a point where one player must choose; each branch leaving it is a **move**; each path ends in a leaf with the payoffs of the players. Here every player sees all the earlier moves.

A strategy now has to be a complete **plan**: a move for every node where the player might have to choose, even nodes that the plan itself prevents from ever being reached. This sounds pedantic, but it is what makes a threat a strategy. "If they enter, I fight" is a plan of the firm, and it is a plan even if, because of it, nobody ever enters.

## Solve it from the end

Solve a tree from the leaves: at each last node the mover picks the move that pays it most; replace the node by those payoffs and repeat one level up, up to the root. This is **backward induction**. Ernst Zermelo asked in 1913 whether one side can force a win in chess, and gave the first mathematical treatment of such a question; the method of solving from the end, often credited to him, is not the argument he used.

Take the entry game with these payoffs, written (newcomer, firm). If the newcomer stays out it gets 0 and the firm keeps 4. If it enters, the firm can share the market, 2 each, or fight: −1 for the newcomer and 0 for the firm. Start at the end. After entry the firm compares 2 with 0 and shares. So the newcomer compares 0 for staying out with 2 for entering, and enters.

```figure
entry
```

The threat is not believed because, once entry has happened, carrying it out would hurt the firm. Move the slider f, the firm's payoff from fighting, above 2 and everything changes: then fighting is what the firm would do anyway, the threat is **credible** and the newcomer stays out.

## An equilibrium that rests on an empty threat

Write the same game as a table. The newcomer has two plans, stay out or enter; the firm has two, share or fight. There are two Nash equilibria. One is (enter, share). The other is (stay out, fight): if the firm is going to fight, staying out is right for the newcomer; and if the newcomer stays out, the firm's plan costs it nothing, because it is never put to the test. The second equilibrium rests on an **empty threat**.

Reinhard Selten proposed in 1965 to rule out such equilibria; the name came later. Every node of a tree with perfect information starts a smaller game, a **subgame**. An equilibrium must remain an equilibrium in every subgame, including those that are never reached: a **subgame perfect equilibrium**. In a finite tree with no ties, backward induction finds exactly one, and it is the only one.

How common is the problem? Simulation A draws random trees in which each player has two moves, the first player and then the second. Of 20,000 such trees, 75% have a Nash equilibrium that is not subgame perfect, and in 33% that equilibrium gives a different outcome. The table has one, two or three equilibria in shares close to 1/4, 1/2 and 1/4, which are exact.

## The value of tying your hands

Give the firm a move before the game. It can make sharing impossible, at a cost k: capacity useful only in a price war, a contract that punishes sharing, a public promise too costly to break. After this **commitment** the firm can only fight. So the newcomer stays out, and the firm earns 4 − k instead of 2. It pays whenever k < 2.

The firm gains by destroying its own best reply. Thomas Schelling made this the centre of *The Strategy of Conflict* (1960): the general who burns the bridge behind his army, the negotiator who cannot be reached, the threat that leaves something to chance because nobody fully controls what will happen. Deterrence between states runs on the same logic: troops placed where an attack would draw them in, whatever their government might then prefer. Two things make a commitment work. It must be seen: a hidden commitment changes nothing. And it must be impossible to undo: a commitment that can be bought back is only a threat again.

```box
Bitcoin: a threat with 20% of the hash rate
A miner with a share α of the hash rate wants certain transactions kept out of the chain. Narayanan et al. (2016, ch. 5) discuss two threats.

**Punitive forking:** "I will never build on a block that contains one." Below half the hash rate it is empty: the miner would cut itself off from the longest chain, and the transactions go in anyway.

**Feather forking:** "I will try to orphan such a block, and give up after one confirmation." That needs the next two blocks: a chance of α², 4% with α = 0.2. Another miner then risks its block for one fee: including the transaction pays only if the fee exceeds α²/(1 − α²) of the block's value, 4.2% here. Others may comply unasked.

**Is it credible?** An attempt costs the attacker α(1 − α) of a block on average, 0.16 here, so afterwards it would not try: on a one-shot tree the threat is empty too. It can work through commitment (software that forks automatically, announced in public) or a reputation built over many blocks (module 06). A hypothesis about incentives, not an observation of the chain.
```

## Who moves first

Heinrich von Stackelberg (1934) let one firm in Cournot's market choose its quantity first. Take the market of [module 02](/game-theory-lab/nash-equilibrium), with a = 10 and c = 1. The follower answers any quantity q1 with (9 − q1)/2, and the leader, knowing this, picks the best point on that line. The leader makes 4.5 and the follower 2.25; the price is 3.25 and the profits are 10.125 and 5.06, against 9 each when they choose together.

The leader's 4.5 is not a best response to the follower's 2.25: that would be 3.375. Once the follower has produced, the leader would like to cut back. Its quantity pays only because it cannot be taken back. Moving first is commitment by another name.

It is not always an advantage. In matching pennies the second mover sees the coin and wins every time. Simulation A plays random two-by-two games both ways: the first player does better by moving first than by moving second in 15% of them, worse in 12%, and the same in the rest. And when the simultaneous game has a pure equilibrium, the leader never does worse than in the best of them: it can always choose that row and let the follower answer.

## Do people reason backwards?

In the centipede game of Robert Rosenthal (1981) two players take turns at a pot that grows with every pass; each can take the larger share or pass. Backward induction unravels from the last move: the first player takes at once, though both would do better by passing. In the experiment of Richard McKelvey and Thomas Palfrey (1992), only 7% of the four-move games ended at the first move.

The ultimatum game of Werner Güth, Rolf Schmittberger and Bernd Schwarze (1982) is shorter still. One player proposes how to split a sum; the other accepts, or both get nothing. Backward induction says that the responder accepts anything positive, so the proposer should offer almost nothing. Real proposers usually offer 40 to 50%. In the comparison of Joseph Henrich and colleagues (2001), the most frequent offer in industrialised societies was half, and offers below 20% were refused 40 to 60% of the time.

Refusing money is not backward induction, but it changes what a proposer who cares only about money should do. In Simulation C each responder refuses offers below a threshold of its own, spread evenly between 0 and m. The proposer then expects (1 − x) x/m from an offer x, and the best offer is m itself: with m = 0.4, an offer of 0.4, worth 0.6, while an offer of 0.1 earns only 0.225. A selfish proposer offers a lot.

## Bargaining

Let a refusal be followed by a counter-offer, and let the pie shrink by a **discount factor** δ at every round: the cost of arguing. With one round the proposer takes everything. With two, the proposer must leave the other what that player would get by refusing and proposing next, δ of the pie, and keeps 1 − δ. With more, the shares swing and settle.

```figure
pie
```

With no last round at all, Ariel Rubinstein (1982) showed that there is a single subgame perfect equilibrium. The first proposer offers the other just what it would get as the next proposer, a fraction δ of the proposer's own share x, so x = 1 − δx:

```math
x = 1 / (1 + δ)
```

With δ = 0.9 this is 0.526, a little more than half. The offer is accepted at once, so nothing is wasted, yet the split is decided by rounds that are never played. When the two players have different discount factors δ₁ and δ₂, the first proposer gets (1 − δ₂)/(1 − δ₁δ₂): 0.714 if it is the more patient one, with 0.9 against 0.8, and 0.357 if it is the less patient. Patience is bargaining power.

Here the players always knew whom they faced. In module 05 a player does not know the other's payoffs and must read them from what the other does.

<!-- simulation -->

## Further reading

- Osborne, M. J. (2004). *An Introduction to Game Theory*. Oxford University Press. Ch. 5, 6, 7 and 16.
- Tadelis, S. (2013). *Game Theory: An Introduction*. Princeton University Press. Ch. 7, 8 and 11.
- Shoham, Y. and Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Ch. 5.
- Schelling, T. C. (1960). *The Strategy of Conflict*. Harvard University Press.
- Zermelo, E. (1913). Über eine Anwendung der Mengenlehre auf die Theorie des Schachspiels. *Proceedings of the Fifth International Congress of Mathematicians*, vol. 2, 501–504.
- Schwalbe, U. and Walker, P. (2001). Zermelo and the early history of game theory. *Games and Economic Behavior* 34, 123–137.
- Selten, R. (1965). Spieltheoretische Behandlung eines Oligopolmodells mit Nachfrageträgheit. *Zeitschrift für die gesamte Staatswissenschaft* 121, 301–324 and 667–689.
- von Stackelberg, H. (1934). *Marktform und Gleichgewicht*. Springer.
- Dixit, A. (1980). The role of investment in entry-deterrence. *Economic Journal* 90, 95–106.
- Rosenthal, R. W. (1981). Games of perfect information, predatory pricing and the chain-store paradox. *Journal of Economic Theory* 25, 92–100.
- McKelvey, R. D. and Palfrey, T. R. (1992). An experimental study of the centipede game. *Econometrica* 60, 803–836.
- Güth, W., Schmittberger, R. and Schwarze, B. (1982). An experimental analysis of ultimatum bargaining. *Journal of Economic Behavior and Organization* 3, 367–388.
- Henrich, J., Boyd, R., Bowles, S., Camerer, C., Fehr, E., Gintis, H. and McElreath, R. (2001). In search of Homo economicus: behavioral experiments in 15 small-scale societies. *American Economic Review* 91 (2), 73–78.
- Rubinstein, A. (1982). Perfect equilibrium in a bargaining model. *Econometrica* 50, 97–109.
- Narayanan, A., Bonneau, J., Felten, E., Miller, A. and Goldfeder, S. (2016). *Bitcoin and Cryptocurrency Technologies*. Princeton University Press. Ch. 5.
