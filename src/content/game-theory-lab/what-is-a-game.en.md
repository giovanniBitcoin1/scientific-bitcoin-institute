
## Rules that reward losing

On 31 July 2012, at the London Olympics, spectators booed two women's doubles badminton matches. Serves went into the net and easy shots sailed out, because all four pairs on court were trying to lose. They had already qualified for the knockout round, and a defeat in the last group match would have given them an easier draw. The next day eight players were disqualified: one pair from China, two from South Korea and one from Indonesia.

The players were blamed, but they had done what the rules rewarded. What was best for each pair depended on what the others did, and the organizers had not thought it through.

That is what this course is about. A **game** is any situation in which what is best for me depends on what you do: a penalty kick, a price war, an auction, an arms race, a queue at a motorway exit.

## Three ingredients

A game is described by three things. The **players**. The **strategies**: what each player can choose. The **payoffs**: a number for each player, for every combination of choices.

With two players and a few strategies each, all of this fits in a table, the **normal form** of the game. One player chooses a row, the other a column; each cell holds two numbers, the row player's payoff first.

| | L | R |
|---|---|---|
| **U** | 2, 1 | 0, 0 |
| **D** | 3, 0 | 1, 2 |

Two warnings about words. A payoff is not money. It ranks the outcomes for one player and already contains everything that player cares about: money, risk, fairness, the pleasure of seeing a rival lose. So **rational** means consistent, not greedy: a rational player chooses what ranks highest for her, whatever that is. And **simultaneous** does not mean that the clocks agree. It means that neither player knows the other's choice when making their own.

The first theorem of the subject was proved by John von Neumann in 1928. In 1944, with the economist Oskar Morgenstern, he published *Theory of Games and Economic Behavior*, the book that turned it into a field.

## Strategies you would never play

Look at the table above as the row player. If the column player chooses L, D pays 3 and U pays 2. If the column player chooses R, D pays 1 and U pays 0. D is better either way.

A strategy is **strictly dominated** when another strategy of the same player pays more against every choice of the other player. A strategy that beats all the others in this way is a **dominant strategy**, and it needs no thought about the other player at all.

The most famous game has one for each player.

| | C | D |
|---|---|---|
| **C** | 3, 3 | 0, 5 |
| **D** | 5, 0 | 1, 1 |

D dominates C for both, so both play D and get 1, when both playing C would have given 3. That is the Prisoner's Dilemma. Its story, and what repetition does to it, are in [Complexity Lab module 11](/lab/cooperation); here it is one table among many.

How many? If each player simply ranks the four cells from worst to best, there are 144 different two-by-two games (Simulation A counts them). In a quarter of them both players have a dominant strategy, and usually nobody regrets the result. The Prisoner's Dilemma is the only one of the 144 in which both have a dominant strategy and both end up worse off than in another cell.

## Delete, then look again

In the first table the column player has no dominated strategy: L is better against U, R against D. But the column player can see that the row player will never choose U. Delete that row, and R beats L, 2 against 0. The game is solved: (D, R).

This is **iterated elimination**: delete what is strictly dominated, look at the smaller table, delete again.

```figure
eliminate
```

Each step asks for more. To delete U, the row player only has to be rational. To delete L next, the column player must know that the row player is rational. A third step needs the row player to know that the column player knows it, and so on. The assumption behind the whole procedure is **common knowledge of rationality**: everyone is rational, everyone knows it, everyone knows that everyone knows it, without end.

One reassuring fact: with strict dominance the order of the deletions does not matter. Whichever dominated strategy goes first, the same strategies are left at the end.

## Guess two thirds of the average

Everyone in a room writes down a number from 0 to 100. The winner is the one closest to two thirds of the average.

The average cannot exceed 100, so two thirds of it cannot exceed 66.7. A guess above 66.7 is never better than 66.7 itself and is sometimes worse (this is weak dominance: no better anywhere, worse somewhere). So nobody sensible goes above 66.7. But then the average is at most 66.7 and the target at most 44.4. Repeat the argument and the bound falls to 29.6, 19.8, 13.2… Only 0 survives.

People do not play 0. In Rosemarie Nagel's experiment of 1995 the average first guess was about 37. When three newspapers ran the game, with 7,900 readers in all, the averages were between 19 and 25, with clusters of guesses near 33 and 22.

Those two numbers suggest a model with **levels of reasoning**. A level 0 player guesses at random, 50 on average. A level 1 player expects a crowd of level 0 and answers 33.3. A level 2 player expects level 1 and says 22.2. Level k says

```math
50 × (2/3)^k
```

Most people stop after one or two steps. In Simulation B a crowd of a thousand, mostly levels 1 and 2, has an average of 29.4 in its first round. The target is 19.6, and a level 2 player wins; over a thousand plays level 2 wins 917 times. The player who says 0 is the furthest ahead and almost the furthest from the prize. The winner is one step ahead of the crowd, not ten.

John Maynard Keynes made the same point in 1936 about a newspaper contest in which readers had to pick the faces that most other readers would pick. That is why the guessing game is still usually called the beauty contest.

## When nothing can be deleted

Most games have no dominated strategy, and then elimination has nothing to say. A weaker idea still works. A **best response** to a choice of the other player is a strategy that pays at least as much as any other against that choice. A dominant strategy is a best response to everything; usually the best response changes with what the other player does.

Mark in each column the row player's best response, and in each row the column player's. A cell where the two marks meet is a **stable cell**: each player is doing the best they can given what the other does, so nobody wants to move alone.

## A small atlas

Take a game in which the two players are in the same position. Each can cooperate (C) or defect (D). Fix the payoff of mutual cooperation at R = 1 and of mutual defection at P = 0, with the letters of Complexity Lab module 11. Two numbers are left: the temptation T, for defecting against a player who cooperates, and the sucker's payoff S, for cooperating against a defector.

```figure
atlas
```

The plane of T and S has four regions.

- **Prisoner's Dilemma** (T > 1, S < 0). Defecting is better whatever the other does. The tension is temptation.
- **Stag hunt** (T < 1, S < 0). Cooperating is best if the other cooperates and worst if not. Two stable cells, and the tension is trust.
- **Chicken**, also called snowdrift or hawk–dove (T > 1, S > 0). Each wants to do the opposite of the other. Two stable cells, and the question is who gives way.
- **Harmony** (T < 1, S > 0). Cooperating is dominant and nobody regrets it.

Two classics are not on this map. In the **battle of the sexes** both players want to end up together, but each prefers a different place: coordination with a conflict inside it. In **matching pennies** one player wins if two coins match and the other if they differ: pure conflict, and no stable cell at all.

The count of 144 goes back to Anatol Rapoport and Melvin Guyer, who in 1966 listed 78 games, because they also treated two games as one when the players swap roles. Of the 144, three quarters are solved by dominance and have one stable cell; one eighth have two stable cells, and one eighth have none.

## How far does dominance go?

Two-by-two games flatter dominance. Simulation C draws games at random, with every payoff an independent number between 0 and 1, and deletes all it can. Of 20,000 games of each size, elimination solves 75% of the two-by-two games, 44% of the three-by-three, 8% of the five-by-five and about one in a thousand of the eight-by-eight. The stable cells do not disappear with it: two games in three still have at least one at eight by eight.

So we need an idea that still works when nothing can be deleted. We have already met it. It is the stable cell, and it has a name: **Nash equilibrium**. [Module 02](/game-theory-lab/nash-equilibrium) is about what it means, why a game can have several, and which one gets played.

<!-- simulation -->

## Further reading

- Osborne, M. J. (2004). *An Introduction to Game Theory*. Oxford University Press. Ch. 2 and 12.
- Tadelis, S. (2013). *Game Theory: An Introduction*. Princeton University Press. Ch. 3 and 4.
- Shoham, Y. and Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Ch. 3.
- Roughgarden, T. (2016). *Twenty Lectures on Algorithmic Game Theory*. Cambridge University Press. Lecture 1.
- von Neumann, J. and Morgenstern, O. (1944). *Theory of Games and Economic Behavior*. Princeton University Press.
- Rapoport, A. and Guyer, M. (1966). A taxonomy of 2 × 2 games. *General Systems* 11, 203–214.
- Robinson, D. and Goforth, D. (2005). *The Topology of the 2×2 Games: A New Periodic Table*. Routledge.
- Bernheim, B. D. (1984). Rationalizable strategic behavior. *Econometrica* 52, 1007–1028.
- Pearce, D. G. (1984). Rationalizable strategic behavior and the problem of perfection. *Econometrica* 52, 1029–1050.
- Nagel, R. (1995). Unraveling in guessing games: an experimental study. *American Economic Review* 85, 1313–1326.
- Bosch-Domènech, A., Montalvo, J. G., Nagel, R. and Satorra, A. (2002). One, two, (three), infinity, …: newspaper and lab beauty-contest experiments. *American Economic Review* 92, 1687–1701.
- Camerer, C. F., Ho, T.-H. and Chong, J.-K. (2004). A cognitive hierarchy model of games. *Quarterly Journal of Economics* 119, 861–898.
- Keynes, J. M. (1936). *The General Theory of Employment, Interest and Money*. Macmillan. Ch. 12.
