
## What a group can do

In every module so far a promise was worth only the incentive to keep it. The firms of a cartel could agree on a price, but nothing stopped one of them from undercutting the others the next morning, and every equilibrium had to hold up by itself. This module drops that restriction. The players can now sign agreements that will be enforced, by a court or by a contract. The question is no longer what each player does on her own, but what groups can achieve and how they divide it.

A **coalitional game** has a set of players N and, for every coalition S (any group of players), a number v(S): its **worth**, what the members of S can get on their own, whatever the others do. The function v is the **characteristic function**; the empty coalition is worth 0. We keep to **transferable utility**: the worth is money, or something like it, that the members can pass between themselves one for one, so a coalition cares only about its total.

A running example. Three partners, A, B and C, can take on projects. Alone each makes 0. A and B together can earn 70, A and C 60, B and C 40, and all three 100. Will all three work together? And if they do, how should they split the 100? The first question is easy here: the three together make more than any pair, and more than any pair plus the partner left out. The second is the subject of this module.

## Divisions nobody walks away from

A division x = (x_A, x_B, x_C) of the 100 is safe if no group can do better by leaving. A and B would leave if together they received less than 70, since they can make 70 without C. So a safe division needs

```math
x_A + x_B ≥ 70,   x_A + x_C ≥ 60,   x_B + x_C ≥ 40,   x_i ≥ 0
```

with x_A + x_B + x_C = 100. These divisions form the **core**, introduced by Donald Gillies and by Lloyd Shapley in 1952–53 and published by Gillies (1959): the divisions in which every coalition gets at least its worth. Since the three shares add up to 100, each pair's condition caps the partner outside it: x_C ≤ 100 − 70 = 30, x_B ≤ 40, x_A ≤ 60. The core of the partners is the triangle with corners (60, 40, 0), (60, 10, 30) and (30, 40, 30).

The core can be empty. Suppose that any two partners could make 100 without the third. Adding the three pairs' conditions gives 2(x_A + x_B + x_C) ≥ 300: the pairs need 150 when there is 100 to share. Whatever division is proposed, some pair gets less than it could make alone and has a reason to walk away; the partner left behind can then offer one of the two a better deal, and so on, with no resting point.

For three players worth 0 alone the test is short: the core is nonempty exactly when no pair is worth more than v(N) and the three pairs' worths add up to at most 2v(N). For the partners the sum is 170, below 200. In general the test is **balancedness**. Olga Bondareva (1963) and Shapley (1967) showed, independently, that the core is nonempty exactly when the game is **balanced** (the Bondareva–Shapley theorem). A game is balanced when no way of dividing each player's time among coalitions earns more in total than v(N). Figure F1 draws the triangle of the divisions: move the pairs' worths to see the core shrink to a point and vanish, and drag a division to see which pairs object to it.

```figure
core
```

## A fair share

The core says which divisions are safe, not which one to choose, and it may contain many or none. Shapley (1953) asked another question: what is each player's fair share? Let the players arrive one at a time, in a random order, and pay each one what she adds to the group already there, her **marginal contribution**. If C arrives first she adds 0; after A alone she adds 60; after B alone, 40; last, 100 − 70 = 30. Her **Shapley value** is her average over all the orders.

In its modern form, Shapley's result says that the value is the only rule with four properties: it gives out exactly v(N); it treats alike two players who add the same to every coalition; it gives 0 to a **null player**, who adds nothing to any coalition; and in the sum of two games each player's share is the sum of her shares. For three players worth 0 alone the average works out as

```math
φ_A = (2v(N) + v(AB) + v(AC) − 2v(BC)) / 6
```

The partners get 125/3, 95/3 and 80/3, that is 41.67, 31.67 and 26.67: a point inside the core. But fairness and stability can conflict. If A and B could make 90, the Shapley value becomes 45, 35 and 20, outside the core: together A and B would get 80, and they could make 90 on their own. In **convex** games, where a player adds more to a larger group, the two never conflict: the Shapley value is always in the core (Shapley 1971).

Simulation A computes the Shapley value from all the orders and tests the core with a linear programme. It includes two classics. In the **glove market** two players own a left glove and one a right glove, and only a complete pair sells, for 1. The Shapley value gives each left glove 1/6 and the right glove 2/3. The core is harsher: its only division is (0, 0, 1), everything to the right glove, because each left glove can be replaced by the other. In the **airport game** (Stephen Littlechild and Guillermo Owen 1973) planes of different sizes share a runway, and a coalition pays for the longest runway it needs. Its Shapley value has a simple form: each stretch of the runway is paid in equal parts by the planes that need it.

## Power is not weight

In a **weighted voting game** each player has a weight, and a coalition wins if its weights reach a **quota**; a winning coalition is worth 1 and a losing one 0. The **Shapley–Shubik index** (Shapley and Martin Shubik 1954) is the Shapley value of this game: the share of the orders in which a player is the **pivot**, the one who turns a losing group into a winning one. The **Banzhaf index** (John Banzhaf 1965, anticipated by Lionel Penrose 1946) counts instead the coalitions in which a player's vote is decisive: they win with her and lose without her.

The Council of the first European Communities, from 1958, is the textbook case. France, Germany and Italy had 4 votes each, Belgium and the Netherlands 2, Luxembourg 1, and an act proposed by the Commission needed 12 of the 17. Under that rule Luxembourg's vote never decided anything: every other weight was even, and so was the quota, so its single vote never turned a losing total into a winning one. Figure F2 gives both indices at every quota from 9 to 17: Luxembourg's power is 0 at every even quota.

```figure
votes
```

Weight can mislead the other way too. Take three parties with 49, 49 and 2 seats and a majority of 51: any two of them win and none wins alone, so all three have the same power, 1/3 each. Simulation B computes both indices for up to 30 players.

## An estate that cannot pay

A man dies owing his three wives, under their marriage contracts, 100, 200 and 300. The Babylonian Talmud (Ketubot 93a) divides what he leaves: an estate of 100 equally; an estate of 200 as 50, 75 and 75; an estate of 300 as 50, 100 and 150. The first and the last look like familiar rules, equal shares and shares in proportion to the claims. The middle one puzzled commentators for a long time.

Robert Aumann and Michael Maschler (1985) solved the puzzle, reading it as a **bankruptcy problem**: the claims add up to more than the estate. Take the game in which a coalition is worth what is left for it once everyone outside it has been paid in full, or 0 if nothing is left. All three divisions are the **nucleolus** of this game (David Schmeidler 1969): the division that makes the worst-treated coalition as well off as possible, then the next worst, and so on. They also showed that the same rule follows from another passage of the Talmud (Bava Metzia 2a), on two people holding a garment. One claims all of it, the other half; the second concedes to the first the half she does not claim, the disputed half is split equally, and the shares are 3/4 and 1/4. The Talmud's divisions are the only ones that split what any two creditors receive together in this way.

Other rules give other answers. At 200, proportional division gives 33.33, 66.67 and 100. The Shapley value of the same game gives 33.33, 83.33 and 83.33: it is the average over random orders of arrival, each creditor paid in full while money remains (Barry O'Neill 1982). Simulation C compares five rules at any estate.

```box
Mining pools: who gets the reward?
**Why pools exist: variance.** A miner with a share α of the hash rate finds on average a fraction α of the blocks. In late November 2026 the network ran at about 1 ZH/s, 10²¹ hashes a second (a 30-day average of 1,019 EH/s on 23 November, according to Hashrate Index). At 1 ZH/s a miner with 1 PH/s has a share of one in a million: with 52,560 blocks a year (one every ten minutes), she finds one every 19 years on average, and may find none for much longer. A pool pays its members for partial proofs of work, called shares, which are far easier to find, and turns a lottery into a steady income.

**How pools split.** In proportion to the shares of the round; per share, at a fixed price (the pool bears the risk); or over the last N shares. Meni Rosenfeld (2011) described these schemes and showed why a proportional pool can be gamed by hopping between pools: a share early in a round is worth more than one late in it. Bahar Can, Jens Leth Hougaard and Mohsen Pourpouneh (2022) study the split as an allocation problem with fairness properties, and characterize the proportional scheme.

**The coalitional view.** Yoad Lewenberg, Yoram Bachrach, Yonatan Sompolinsky, Aviv Zohar and Jeffrey Rosenschein (2015) modelled pools as a coalitional game. For some network parameters, in particular when blocks carry many transactions, a stable split of the rewards may not exist, and some miners always gain by moving to another pool.

**Power.** In Simulation B's illustrative pools, a pool with 26% of the hash rate holds about 30% of the power to form a majority, and splitting it into two pools of 13% lowers their combined power to about 26%. Real shares change from week to week, and a pool is not its miners: they can leave it, and an attack is not a ballot. Reading pools as voters is a hypothesis, not a description.
```

## Next

Part IV turns from playing games to designing them. [Module 11](/game-theory-lab/auctions): auctions, with a Bitcoin box on the fee market.

<!-- simulation -->

## Further reading

- Osborne, M. J. (2004). *An Introduction to Game Theory*. Oxford University Press. Ch. 8 (coalitional games and the core).
- Shoham, Y. and Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Ch. 12 (coalitional game theory).
- Jackson, M. O. (2008). *Social and Economic Networks*. Princeton University Press. Ch. 12 (allocation rules and cooperative games), for the link with [module 09](/game-theory-lab/games-on-networks).
- Gillies, D. B. (1959). Solutions to general non-zero-sum games. In *Contributions to the Theory of Games IV*, 47–85.
- Bondareva, O. N. (1963). Some applications of linear programming methods to the theory of cooperative games. *Problemy Kibernetiki* 10, 119–139 (in Russian).
- Shapley, L. S. (1967). On balanced sets and cores. *Naval Research Logistics Quarterly* 14, 453–460.
- Shapley, L. S. (1953). A value for n-person games. In *Contributions to the Theory of Games II*, 307–317.
- Shapley, L. S. (1971). Cores of convex games. *International Journal of Game Theory* 1, 11–26.
- Littlechild, S. C. and Owen, G. (1973). A simple expression for the Shapley value in a special case. *Management Science* 20, 370–372.
- Shapley, L. S. and Shubik, M. (1954). A method for evaluating the distribution of power in a committee system. *American Political Science Review* 48, 787–792.
- Banzhaf, J. F. (1965). Weighted voting doesn't work: a mathematical analysis. *Rutgers Law Review* 19, 317–343.
- Penrose, L. S. (1946). The elementary statistics of majority voting. *Journal of the Royal Statistical Society* 109, 53–57.
- Schmeidler, D. (1969). The nucleolus of a characteristic function game. *SIAM Journal on Applied Mathematics* 17, 1163–1170.
- O'Neill, B. (1982). A problem of rights arbitration from the Talmud. *Mathematical Social Sciences* 2, 345–371.
- Aumann, R. J. and Maschler, M. (1985). Game theoretic analysis of a bankruptcy problem from the Talmud. *Journal of Economic Theory* 36, 195–213.
- Rosenfeld, M. (2011). Analysis of Bitcoin pooled mining reward systems. arXiv:1112.4980.
- Lewenberg, Y., Bachrach, Y., Sompolinsky, Y., Zohar, A. and Rosenschein, J. S. (2015). Bitcoin mining pools: a cooperative game theoretic analysis. *AAMAS 2015*, 919–927.
- Can, B., Hougaard, J. L. and Pourpouneh, M. (2022). On reward sharing in blockchain mining pools. *Games and Economic Behavior* 136, 274–298.
