<!-- DRAFT: to be reviewed by Adriano -->

## Two roads

Part III is about many players sharing something. Here it is roads. Every driver picks the route that is fastest for himself, and the route he picks slows down everybody else on it. Nobody is wicked and nobody is confused; the trouble is that no one pays for the delay he causes others. How much worse is the outcome than what a planner would choose?

Arthur Pigou (1920) gave the example that still opens the subject. One unit of traffic goes from A to B. The upper road is broad and long: it always takes 1 hour. The lower road is short and narrow: it takes x hours, where x is the share of the drivers on it. For each driver the lower road is never slower than 1 hour, so selfish drivers all take it, and every one of them needs 1 hour.

A planner who sends half the drivers each way does better. Those on the upper road need 1 hour, those on the lower road half an hour, and the average is 3/4. The planner's drivers on the upper road are worse off than the selfish ones were, but the average falls by a quarter.

The ratio between the cost of the selfish outcome and the best one, here 4/3, is the **price of anarchy**. Elias Koutsoupias and Christos Papadimitriou (1999) introduced the idea of measuring an equilibrium against the optimum in this way, as the coordination ratio; the name came soon after (Papadimitriou 2001). With the lower road taking x^p hours the selfish drivers still all take it, while the planner keeps more of them off it as p grows; the ratio grows without limit: 1.626 at p = 2, 2.151 at p = 4, 3.512 at p = 10.

```figure
tworoads
```

## Equal costs, and a hidden objective

What does an equilibrium look like when the drivers are a continuum and each is a drop in the flow? John Wardrop (1952) stated it as a principle: every route in use costs the same, and no unused route costs less.

Martin Beckmann, Bart McGuire and Christopher Winsten (1956) found the objective that selfish drivers minimise without knowing it. Write f_e for the flow on road e and c_e for its cost. The equilibrium is the flow that minimises

```math
Φ(f) = Σ_e ∫_0^{f_e} c_e(x) dx
```

while the planner minimises the total cost

```math
C(f) = Σ_e f_e c_e(f_e)
```

Φ is a **potential**: moving a little traffic from one route to another changes Φ by that amount times the difference between the two routes' costs. The two problems have the same form. The optimum is the equilibrium for the **marginal costs** c_e(x) + x c_e'(x), since the derivative of x c_e(x) is the cost a driver meets plus the delay he adds to all the others.

So a toll equal to x c_e'(x), the delay a driver imposes on the others, makes selfish drivers choose the optimum. This is Pigou's idea of a tax on an **externality**. In his example the toll on the lower road is 1/2 at the planner's split: time plus toll is 1/2 + 1/2 = 1 there, the same as the upper road, so drivers split as the planner wishes. Each still pays 1, in time or in time plus toll, and the 1/4 saved goes to the toll revenue.

## Braess's paradox

Dietrich Braess (1968) found something stranger. One unit of traffic goes from s to t. The road s → v takes x hours and v → t takes 1; s → w takes 1 and w → t takes x, x being the share on that road. Half the drivers go each way, and everyone needs 1.5 hours.

Now add a road v → w that costs nothing. A driver on the upper route can go s → v → w → t: x + 0 + x hours, never more than 2 and, at the old split, only 1. Everyone takes the zigzag, both x roads fill up, and everyone needs 2 hours. No one can do better by leaving: either other route also costs 2. The new road has made every driver slower.

With a shortcut that costs c hours, the equilibrium sends 1 − 2c on the zigzag and c on each of the other two routes, and every route costs 2 − c as long as c < 1/2. Any shortcut faster than half an hour makes things worse, while the planner never uses it: it keeps the old split at 1.5 hours.

```figure
braess
```

The paradox is not about traffic alone. Joel Cohen and Paul Horowitz (1991) built it with springs and strings: a weight hangs from two spring-and-string chains joined by a short string, and cutting that string makes the weight rise.

## How bad can it get?

Pigou's example with x^p already shows that the price of anarchy has no bound in general. Tim Roughgarden and Éva Tardos (2002) showed that it does when the costs are affine, a x + b: then the price of anarchy is at most 4/3, in every network and at every demand. Pigou's two roads are the worst case.

Roughgarden (2003) then showed that this is no accident. For a class of costs, the worst case is always a Pigou-like network of two parallel roads, one with a constant cost; the topology of the network does not matter. So the bound for costs of degree p is Pigou's ratio from the first section: 1.626 for p = 2, 1.896 for p = 3, 2.151 for p = 4.

With no bound on the costs at all, there is still a guarantee of another kind (Roughgarden and Tardos 2002): the equilibrium costs no more than the optimum would with twice the traffic. Selfishness costs no more than doubling the demand. Random networks are usually much better than the worst case: Panel A shows how much.

## Drivers who count

So far each driver was a drop in the flow. With a finite number of drivers, each a noticeable part of the traffic, a driver's switch changes the costs he meets himself. Robert Rosenthal (1973) showed that such **congestion games** still have a potential. Let n_e be the number of drivers on road e, and

```math
Φ = Σ_e (c_e(1) + c_e(2) + ... + c_e(n_e))
```

When one driver switches, Φ changes by exactly his own change in cost: on the roads he leaves the last term disappears, on the roads he joins a term is added, and those terms are what he paid and what he now pays. So switches that help the switcher always lower Φ, the dynamics of best responses cannot cycle, and since Φ takes finitely many values they end at a pure equilibrium. Dov Monderer and Lloyd Shapley (1996) called such games **potential games**.

Different equilibria can now have different costs. Take Braess's network with 10 drivers, the two x roads costing k/10 with k drivers on them, and a costless shortcut. From everyone on the upper route, nine switches end at 1, 1 and 8 drivers on the upper, lower and zigzag routes: 1.82 hours on average, against 1.5 for the planner. Everyone on the zigzag is an equilibrium too, at 2. Panel B runs the switches one by one and checks, at each, that the driver's gain is the drop of Φ.

With affine costs the worst case for drivers who count is 5/2 (Awerbuch, Azar and Epstein 2005; Christodoulou and Koutsoupias 2005), worse than the 4/3 of the drop-sized drivers. Panel B has a network of four drivers that reaches it. And in large games the switches can take very long to end: finding a pure equilibrium of a congestion game is as hard as any local search problem of its class, and best responses can need exponentially many steps (Fabrikant, Papadimitriou and Talwar 2004).

## The best equilibrium

When equilibria differ, one may ask about the best one instead of the worst. The **price of stability** compares the best equilibrium with the optimum.

In **network cost-sharing games** a road has a fixed cost, split equally among the players who use it (Anshelevich, Dasgupta, Kleinberg, Tardos, Wexler and Roughgarden 2004). Now more users make a road cheaper for each of them. The game is still a congestion game, and its potential is

```math
Φ = Σ_e c_e (1 + 1/2 + ... + 1/n_e)
```

Φ is never below the total cost and never above H_k times it, where H_k = 1 + 1/2 + ... + 1/k is the harmonic number and k the number of players. Start the dynamics from the optimum: Φ only falls, so the equilibrium reached costs at most Φ(optimum) ≤ H_k times the optimum. The best equilibrium costs at most H_k times the optimum: 2.93 for 10 players.

The bound is reached. In the hub of Panel C, player i can take his own road to the target, costing 1/i, or a costless road to a hub and then the hub's road, costing 1 + ε, shared. Everyone at the hub costs 1 + ε, the optimum. But there the last player pays (1 + ε)/k, more than his own road's 1/k, so he leaves; then the next one has a reason to leave, and so on. The only equilibrium has everyone on his own road, at H_k. The other extreme shows the price of anarchy: two roads, one costing k and one 1 + ε. Everyone on the cheap road is an equilibrium and the optimum; everyone on the dear one is an equilibrium too, since each pays 1 and alone on the other road would pay 1 + ε. The worst equilibrium costs k/(1 + ε) times the optimum, while the best is the optimum itself.

## Next

Module 09: games played on a network, where each player cares only about her neighbours, and networks that players build for themselves; with a Bitcoin box on the Lightning Network. For shortest paths and flows themselves, see the Network Lab's [module 10](/network-lab/weights-flows-navigation).

<!-- simulation -->

## Further reading

- Roughgarden, T. (2016). *Twenty Lectures on Algorithmic Game Theory*. Cambridge University Press. Lectures 11, 12, 13, 15 and 16.
- Nisan, N., Roughgarden, T., Tardos, É. and Vazirani, V. (eds.) (2007). *Algorithmic Game Theory*. Cambridge University Press. Ch. 17 (the inefficiency of equilibria), 18 (routing games) and 19 (network formation games and the potential function method).
- Shoham, Y. and Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Section 6.4 (congestion games).
- Pigou, A. C. (1920). *The Economics of Welfare*. Macmillan.
- Wardrop, J. G. (1952). Some theoretical aspects of road traffic research. *Proceedings of the Institution of Civil Engineers, Part II* 1, 325–362.
- Beckmann, M., McGuire, C. B. and Winsten, C. B. (1956). *Studies in the Economics of Transportation*. Yale University Press.
- Braess, D. (1968). Über ein Paradoxon aus der Verkehrsplanung. *Unternehmensforschung* 12, 258–268.
- Cohen, J. E. and Horowitz, P. (1991). Paradoxical behaviour of mechanical and electrical networks. *Nature* 352, 699–701.
- Koutsoupias, E. and Papadimitriou, C. (1999). Worst-case equilibria. *STACS 1999*.
- Papadimitriou, C. (2001). Algorithms, games, and the Internet. *STOC 2001*.
- Roughgarden, T. and Tardos, É. (2002). How bad is selfish routing? *Journal of the ACM* 49, 236–259.
- Roughgarden, T. (2003). The price of anarchy is independent of the network topology. *Journal of Computer and System Sciences* 67, 341–364.
- Rosenthal, R. W. (1973). A class of games possessing pure-strategy Nash equilibria. *International Journal of Game Theory* 2, 65–67.
- Monderer, D. and Shapley, L. S. (1996). Potential games. *Games and Economic Behavior* 14, 124–143.
- Awerbuch, B., Azar, Y. and Epstein, A. (2005). The price of routing unsplittable flow. *STOC 2005*.
- Christodoulou, G. and Koutsoupias, E. (2005). The price of anarchy of finite congestion games. *STOC 2005*.
- Fabrikant, A., Papadimitriou, C. and Talwar, K. (2004). The complexity of pure Nash equilibria. *STOC 2004*.
- Anshelevich, E., Dasgupta, A., Kleinberg, J., Tardos, É., Wexler, T. and Roughgarden, T. (2004). The price of stability for network design with fair cost allocation. *FOCS 2004* (journal version: *SIAM Journal on Computing* 38, 2008).
- The Network Lab, [module 10](/network-lab/weights-flows-navigation).
