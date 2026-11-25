<!-- DRAFT: to be reviewed by Adriano -->

## A game with no stable cell

In matching pennies each player shows a coin. The row player wins if the two faces match, the column player if they differ. Take any cell of the table: one of the two players would rather be somewhere else. [Module 02](/game-theory-lab/nash-equilibrium) ended on this game as the smallest one with no equilibrium.

A penalty kick has the same shape. The kicker shoots to one side, the keeper dives to one side, and the ball is too fast for the keeper to wait and see. If the kicker always chose the same side, the keeper would go there; if the keeper always dived the same way, the kicker would aim at the other. Whatever fixed choice one of them makes, the other has an answer to it. In such a game the mistake is not a bad choice but a predictable one.

## Mixing

A **mixed strategy** is a probability for each strategy: shoot left with probability 0.4 and right with 0.6, say. A strategy chosen for sure is now called **pure**. When the players mix, the payoff of each one becomes an average, the **expected payoff**: the payoff of each cell weighted by how often that cell occurs.

One thing changes. In [module 01](/game-theory-lab/what-is-a-game) only the order of the payoffs mattered: a best response stays a best response if every payoff is doubled or shifted. With mixing the sizes matter too, because averages compare a sure payoff with a gamble.

## The indifference rule

Suppose I mix between two strategies in an equilibrium. Then both must pay me the same against what you do. If one paid more, I would play it every time and drop the other. So a mixed equilibrium rests on **indifference**: your mix is the one that leaves me indifferent between my strategies, and my mix is the one that leaves you indifferent between yours.

This has a strange consequence. My probabilities are fixed by your payoffs, not by mine. In matching pennies the answer is easy: the row player is indifferent only if the column player shows heads half of the time, and the other way round. Each plays 1/2.

In the game of exercise 1 the row player mixes 3/4 and 1/4, the column player 1/2 and 1/2. Now raise the row player's payoff in the top-left cell from 3 to 5. The row player's mix does not move: it is still 3/4, because it is set by the column player's payoffs. It is the column player who changes, to 1/3 on the first column, so as to keep the row player indifferent.

Now the penalty kick with realistic numbers. Ignacio Palacios-Huerta (2003) studied 1,417 penalties of professional football, from 1995 to 2000, and named the sides, by convention, from the kicker's point of view: R is the kicker's natural side (left for a right-footed kicker), L the other. Scoring rates of the size he measured are:

| | keeper L | keeper R |
|---|---|---|
| kicker L | 58.30 | 94.97 |
| kicker R | 92.91 | 69.92 |

The keeper must make the kicker indifferent between L and R, and the kicker must make the keeper indifferent too. Solving the two conditions, the kicker shoots L 38.5% of the time and the keeper dives L 42.0% of the time, and the kick then scores 79.6% of the time whatever either of them does alone.

```figure
square
```

If the kicker trains and the R/R rate rises to 80, both mixes move: the kicker shoots L only 26.0% of the time and the keeper dives L 30.2%. Here the rule does not isolate one player, because this game is one of pure conflict: what the kicker gains in a cell, the keeper loses in the same cell, so a change of the kicker's payoff is also a change of the keeper's (exercise 3).

## Pure conflict

In a **zero-sum** game one player's gain is exactly the other's loss; in a **constant-sum** game the two payoffs always add up to the same number, as the scoring rate and its complement do in the penalty kick. Nothing is gained by cooperating, so there is a second, cautious way to choose: take the mix whose worst case is best. This is the **best worst case**, or maxmin.

John von Neumann proved in 1928 that in these games the two cautious answers meet. The best that the kicker can guarantee against any keeper and the least that the keeper can concede against any kicker are the same number, the **value of the game**. This is the **minimax theorem**.

```figure
minimax
```

Always shooting L guarantees the kicker 58.3%, always R 69.9%, the right mix 79.6%. The consequences sound odd in words. A player who uses the right mix loses nothing by announcing it, since the other can do no better than the value against it. No spy helps the opponent. And if a game of pure conflict has several equilibria, they all give the same value.

## Do people play like this?

Professionals come surprisingly close. In Palacios-Huerta's data the scoring rates of the kicks to the two sides are statistically the same, as indifference requires, and the choices show no pattern from one kick to the next. Mark Walker and John Wooders (2001) looked at the serves of top tennis players at Wimbledon: the points won by serving to the left and to the right were equal too, but the players switched sides a little too often to be truly random.

Ordinary people, asked to write down a random sequence, do much worse. They avoid long runs and alternate more than chance does (Wagenaar 1972 reviewed the early studies; Falk and Konold 1997). A predictable pattern is all a simple program needs. The machine of Simulation C remembers what you did after each pair of moves and guesses that you will do it again. Against a player who changes side 60% of the time it wins 59.5% of 2,000 rounds; against one who says heads 60% of the time, 59.7%; against a fair coin, 50.0%. A coin cannot be read.

## Mixing outside pure conflict

Mixed equilibria are not only for games of conflict. Every two-by-two game with two stable cells has a third, mixed equilibrium. In the stag hunt of module 02 it is exactly q* = 2/3: each hunts the stag with probability 2/3, and expects 8/3, less than the 4 of the stag equilibrium. The tipping point is an equilibrium, but an unstable one: a little more confidence and everyone goes for the stag, a little less and everyone goes for the hare.

In the battle of the sexes the mixed equilibrium is worse for both than either pure one. Each goes to the preferred event with probability 2/3, so they meet only 4 times in 9 and each expects 2/3, against 1 or 2 in the pure equilibria.

Simulation A finds every equilibrium of a table, pure and mixed. In random games their number is almost always odd: 1, 3, 5… At two by two, seven games in eight have one and one in eight has three; at four by four, 54% have one, 38% three and 8% five or more. Games with an even number exist, but only where payoffs tie exactly; a random table never shows one.

## Dominated by a mixture

Mixing also sharpens the elimination of module 01. Let the row player's payoffs against the columns L and R be:

| | L | R |
|---|---|---|
| U | 4 | 0 |
| M | 1 | 1 |
| D | 0 | 4 |

Neither U nor D dominates M: U pays less against R, D against L. But half U and half D pays 2 against either column, more than M's 1. M is dominated by a mixture, and a rational player never plays it. Any weight between 1/4 and 3/4 on U does the job (exercise 5).

## Nash's theorem and learning

John Nash showed in 1950 that once mixing is allowed, every game with finitely many players and strategies has at least one equilibrium. In the square of Figure F1 the reason can be seen. The row player's best-response line runs from one side of the square to the other, and so does the column player's, across it: two such lines must cross, and a crossing is an equilibrium. In general the argument is a **fixed-point theorem**, Kakutani's: the map that sends each pair of mixes to the best responses to it must leave some pair where it is, and that pair is an equilibrium.

How would players find the mix without solving equations? George Brown proposed **fictitious play** in 1951: each player looks at how often the other has played each strategy so far and plays the best response to those frequencies. Julia Robinson proved in the same year that in games of pure conflict this works in the long run: what the frequencies guarantee approaches the value. Yet the play itself never settles; it keeps switching from cell to cell in longer and longer **runs**. In Simulation B, the largest gap between the frequencies and the equilibrium of matching pennies is 0.05 after 100 rounds and 0.0016 after 100,000.

Outside pure conflict there is no such promise. Lloyd Shapley (1964) built a three-by-three game whose only equilibrium is a third for each strategy, but where fictitious play goes round and round: each run is about one and a half times as long as the last, there are only 28 runs in 100,000 rounds, and the gap stays near 0.25 forever. Module 07 comes back to learning. Module 04 lets the players move one after the other.

<!-- simulation -->

## Further reading

- Osborne, M. J. (2004). *An Introduction to Game Theory*. Oxford University Press. Ch. 4 and 11.
- Tadelis, S. (2013). *Game Theory: An Introduction*. Princeton University Press. Ch. 6.
- Shoham, Y. and Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Ch. 3 and 4.
- Roughgarden, T. (2016). *Twenty Lectures on Algorithmic Game Theory*. Cambridge University Press. Lecture 18.
- von Neumann, J. (1928). Zur Theorie der Gesellschaftsspiele. *Mathematische Annalen* 100, 295–320.
- Nash, J. F. (1950). Equilibrium points in n-person games. *Proceedings of the National Academy of Sciences* 36, 48–49.
- Brown, G. W. (1951). Iterative solution of games by fictitious play. In Koopmans, T. C. (ed.), *Activity Analysis of Production and Allocation*. Wiley, 374–376.
- Robinson, J. (1951). An iterative method of solving a game. *Annals of Mathematics* 54, 296–301.
- Shapley, L. S. (1964). Some topics in two-person games. In Dresher, M., Shapley, L. S. and Tucker, A. W. (eds), *Advances in Game Theory*. Princeton University Press, 1–28.
- Wilson, R. (1971). Computing equilibria of N-person games. *SIAM Journal on Applied Mathematics* 21, 80–87.
- Harsanyi, J. C. (1973). Oddness of the number of equilibrium points: a new proof. *International Journal of Game Theory* 2, 235–250.
- Palacios-Huerta, I. (2003). Professionals play minimax. *Review of Economic Studies* 70, 395–415.
- Chiappori, P.-A., Levitt, S. and Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. *American Economic Review* 92, 1138–1151.
- Walker, M. and Wooders, J. (2001). Minimax play at Wimbledon. *American Economic Review* 91, 1521–1538.
- Wagenaar, W. A. (1972). Generation of random sequences by human subjects: a critical survey of literature. *Psychological Bulletin* 77, 65–72.
- Falk, R. and Konold, C. (1997). Making sense of randomness: implicit encoding as a basis for judgment. *Psychological Review* 104, 301–318.
