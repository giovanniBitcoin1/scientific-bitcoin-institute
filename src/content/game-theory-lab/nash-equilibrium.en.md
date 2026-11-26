<!-- DRAFT: to be reviewed by Adriano -->

## A stable cell with a name

[Module 01](/game-theory-lab/what-is-a-game) ended on a cell of the table that nobody wants to leave alone. In 1950 John Nash, a graduate student at Princeton, gave that idea its general form: first in a note of two pages, then in a doctoral thesis of twenty-seven.

Take any number of players and let each choose one strategy. The choices are a **Nash equilibrium** if no player can get a higher payoff by changing strategy alone, while all the others keep theirs. The stable cell of module 01 is the case of two players.

Iterated elimination never deletes an equilibrium: a strategy played in an equilibrium is a best response to what the others do, so nothing can beat it everywhere. And if elimination leaves a single cell, that cell is the only equilibrium of the game.

## What an equilibrium is not

It is not necessarily good for the players: in the Prisoner's Dilemma the only equilibrium is the one cell that both would gladly exchange for another. It is not necessarily unique. And it is not an account of how the players get there. The definition says that nobody would leave, not that anybody would arrive.

There are two ways to read it. The first: an agreement that enforces itself. If the players had agreed on it beforehand, with no contract and no judge, nobody would want to break their word. The second: a convention in a population. If everyone knows what people usually do, and what they do is an equilibrium, then doing the same is the best choice, and the habit keeps itself alive.

Simulation A measures how much the definition leaves open. In a random game with m strategies each, a cell is an equilibrium when the row player's payoff is the largest of its column and the column player's the largest of its row: a probability of 1/m × 1/m. There are m² cells, so a random game has exactly one equilibrium on average, at every size. One two-by-two game in eight has no equilibrium and one in eight has two; of the eight-by-eight games, 32% have none and 26% have two or more. And if the two players simply take turns to best-respond, they end at an equilibrium from seven starting cells in eight at two by two, but from only 52% of them at eight by eight. From the others they go round in a cycle.

## Several equilibria: which one?

On which side of the road should you drive? Everyone on the left is an equilibrium, and so is everyone on the right. The table cannot choose: the two are the same cell under different names.

In *The Strategy of Conflict* (1960) Thomas Schelling put questions of this kind to people. You have to meet a stranger in New York tomorrow; no place and no time have been agreed, and you cannot talk to each other. Where do you go, and when? More than half of his respondents chose Grand Central Station, and nearly all of them noon. Asked to say heads or tails so as to match a partner they could not see, 36 of 42 said heads. Schelling called such answers **focal points**. What solves the problem is nowhere in the table: it is salience, history, custom.

## Safe or sorry

Coordination is harder when the equilibria are neither equally good nor equally safe. Jean-Jacques Rousseau described the case in 1755: hunters who can take a stag only if each one stays at his post, and a hare running past that any of them can catch alone.

Write a for the payoff when both hunt the stag, b for hunting it alone, c for hunting hare while the other waits for the stag, and d when both hunt hare, with a > c ≥ d > b. Both hunting the stag is an equilibrium, and so is both hunting hare. If the other hunts the stag with probability q, the stag pays `a q + b (1 − q)` and the hare `c q + d (1 − q)`. The stag is the better choice only when q is above

```math
q* = (d − b) / ((a − c) + (d − b))
```

```figure
staghunt
```

With a = 4, b = 0, c = 3 and d = 2 we get q* = 2/3: you must be quite sure of the other. The stag equilibrium is **payoff dominant**, better for both. The hare equilibrium is **risk dominant**: it is the one that needs less confidence in the other player (the terms are from Harsanyi and Selten 1988). When the two criteria disagree, experiments tend to side with safety. In a well-known one (Van Huyck, Battalio and Beil, 1990), groups of 14 to 16 people each chose an effort from 1 to 7 and were paid according to the lowest effort in their group. Everyone choosing 7 was the best equilibrium; from the fourth round on, the lowest effort was 1 in every group.

In Simulation B one player at a time looks at ten others and hunts the stag only if enough of them do. The better convention takes over only where enough people follow it already. The tipping point is at about 0.73 of the population, a little above q*, because a sample of ten must show seven to exceed two thirds. Starting from 70% of stag hunters, everyone ends up hunting the stag about one time in seven; starting from 75%, about four times in five.

## When strategies are numbers

Often a strategy is a number: a quantity, a price, an effort. A table no longer helps, but the definition does not change. In 1838 Augustin Cournot studied two firms that sell the same product. Each chooses how much to produce, q₁ and q₂. The price falls with the total, `p = a − (q₁ + q₂)`, and each unit costs c to make. Firm 1 earns `(a − q₁ − q₂ − c) q₁`, which is largest at

```math
q₁ = (a − c − q₂) / 2
```

This is firm 1's best response to every q₂, and it is a straight line. Firm 2 has its own. The equilibrium is the point where the two lines cross: (a − c)/3 each.

```figure
cournot
```

With n firms each one produces (a − c)/(n + 1). Take a = 10 and c = 1: the price is 5.5 for a monopoly, 4 with two firms, 2.5 with five and 1.82 with ten, and it tends to the cost. Nor can the two firms simply agree to share the monopoly output, because that point lies on neither line: each firm's best response to the cartel is to produce more (exercise 3).

## Same market, other rules

In 1883 Joseph Bertrand reviewed Cournot's book and changed one thing. Let the firms name prices, not quantities, and let the buyers go to the cheaper firm. Now a firm that undercuts its rival by a cent takes the whole market, and the only equilibrium is that both charge the cost (exercise 4). Two firms are enough for a result that Cournot reaches only with very many.

Same firms, same buyers, same costs. What changed is what the players choose, and the price moved from 4 to 1. The rules are part of the game, as in the badminton hall of module 01.

## Contests

In a third kind of rivalry the players spend in order to win a prize. Each chooses an effort, and the chance of winning a prize worth V is one's share of the total effort. Gordon Tullock proposed this contest in 1980 as a model of lobbying; patent races, lawsuits and sport have the same shape. With n equal players and a cost of 1 per unit of effort, each spends V (n − 1)/n² in equilibrium. Together they spend the fraction (n − 1)/n of the prize: half of it with two players, nine tenths with ten.

With unequal costs c_i per unit of effort, the cheap crowd out the dear. Only the m cheapest players stay in, and their chances of winning are

```math
s_i = 1 − c_i (m − 1) / (c_1 + … + c_m)
```

The share of the prize that is spent is `1 − Σ s_i²`. Simulation C lets the players look for all this by trial and error.

```box
Bitcoin: mining as a contest
About every ten minutes one miner wins the block reward, with a chance equal to its share of the total hash rate. With hash rate as effort and the value of the reward as the prize, this is the contest above (Dimitri 2017).

**What the model says.** Spending on mining follows the value of the reward, not the number of transactions, and with free entry profits go to zero. The difficulty adjustment fixes the number of blocks, so more hash rate makes no more coins: all miners would earn more if all halved theirs, and none can do it alone. Small cost differences become large differences in share: costs of 1.0, 1.1, 1.2, 1.5 and 2.0 give shares of 37.5%, 31.3%, 25%, 6.3% and nothing (Arnosti and Weinberg 2022).

**The limits.** It is a one-shot model with a constant cost per unit. Real miners buy machines that last years, the reward's value moves with the price, and miners join pools (module 10). Nor does the model say whether the spending is too much: that depends on what it buys (module 14). A hypothesis with its limits, not a description of the industry.
```

## What comes next

Not every game has an equilibrium to find. One two-by-two game in eight has no stable cell at all, and neither has about a third of the large random games of Simulation A; matching pennies is the smallest of them. [Module 03](/game-theory-lab/mixed-strategies-zero-sum) shows that these games have an equilibrium too, once the players are allowed to mix their strategies at random.

<!-- simulation -->

## Further reading

- Osborne, M. J. (2004). *An Introduction to Game Theory*. Oxford University Press. Ch. 2 and 3.
- Tadelis, S. (2013). *Game Theory: An Introduction*. Princeton University Press. Ch. 5.
- Shoham, Y. and Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Ch. 3.
- Nash, J. F. (1950). Equilibrium points in n-person games. *Proceedings of the National Academy of Sciences* 36, 48–49.
- Nash, J. (1951). Non-cooperative games. *Annals of Mathematics* 54, 286–295.
- Schelling, T. C. (1960). *The Strategy of Conflict*. Harvard University Press.
- Lewis, D. (1969). *Convention: A Philosophical Study*. Harvard University Press.
- Harsanyi, J. C. and Selten, R. (1988). *A General Theory of Equilibrium Selection in Games*. MIT Press.
- Van Huyck, J. B., Battalio, R. C. and Beil, R. O. (1990). Tacit coordination games, strategic uncertainty, and coordination failure. *American Economic Review* 80, 234–248.
- Cournot, A. (1838). *Recherches sur les principes mathématiques de la théorie des richesses*. Hachette.
- Bertrand, J. (1883). Review of Cournot's *Recherches* and of Walras's *Théorie mathématique de la richesse sociale*. *Journal des Savants*, September, 499–508.
- Tullock, G. (1980). Efficient rent seeking. In Buchanan, J. M., Tollison, R. D. and Tullock, G. (eds), *Toward a Theory of the Rent-Seeking Society*. Texas A&M University Press.
- Theocharis, R. D. (1960). On the stability of the Cournot solution on the oligopoly problem. *Review of Economic Studies* 27, 133–134.
- Goldberg, K., Goldman, A. J. and Newman, M. (1968). The probability of an equilibrium point. *Journal of Research of the National Bureau of Standards* 72B, 93–101.
- Dimitri, N. (2017). Bitcoin mining as a contest. *Ledger* 2, 31–37.
- Arnosti, N. and Weinberg, S. M. (2022). Bitcoin: a natural oligopoly. *Management Science* 68, 4755–4771.
- Narayanan, A., Bonneau, J., Felten, E., Miller, A. and Goldfeder, S. (2016). *Bitcoin and Cryptocurrency Technologies*. Princeton University Press. Ch. 5.
- Nakamoto, S. (2008). Bitcoin: a peer-to-peer electronic cash system.
