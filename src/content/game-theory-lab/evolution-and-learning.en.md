<!-- DRAFT: to be reviewed by Adriano -->

## A population of strategies

In modules 01 to 06 the players reason, some of them a great deal. Here they do not. In the first half of this module a strategy spreads in a population because it pays; in the second, players adjust by trial and error, without even knowing the game. Where do such blind processes end up?

Picture a large population whose members, each with a fixed strategy, meet at random in pairs and play a symmetric game. The payoff is now a number of offspring, or the chance of being imitated. The Complexity Lab's [module 11](/lab/cooperation) told this story in words, with bats and hawks; here it gets its formulas.

John Maynard Smith and George Price (1973) asked when a population is safe from invasion, and Maynard Smith (1982) developed the answer into a theory. Write u(x, y) for what strategy x earns against y. A strategy x is **evolutionarily stable** (an **ESS**) if, for every mutant strategy y ≠ x, either

```math
u(x, x) > u(y, x),   or   u(x, x) = u(y, x) and u(x, y) > u(y, y)
```

The mutants are rare, so they meet residents almost always: they must not do better there, and if they tie, the residents must do better in the rare meetings between mutants. The first condition makes every ESS a symmetric Nash equilibrium. The converse fails: in the stag hunt of [module 02](/game-theory-lab/nash-equilibrium) the mixed equilibrium is not an ESS, because a mutant who leans a little towards either side does better than the residents against its own kind.

Take module 01's chicken read as hawk and dove: (3, 3), (1, 4), (4, 1), (0, 0), with D the hawk. A population of doves is invaded by hawks, since 4 > 3. A population of hawks is invaded by doves, since 1 > 0. Neither pure strategy is stable; the ESS is half hawks, half doves.

## The replicator equation

Now let the shares move. If xᵢ is the share of strategy i, fᵢ its average payoff in the current population and f̄ the population's average, the **replicator equation** (Taylor and Jonker 1978) says

```math
ẋᵢ = xᵢ (fᵢ − f̄)
```

A strategy grows at the rate by which its payoff beats the average. For two strategies on module 01's (T, S) map, with R = 1, P = 0 and x the share of C, it becomes one equation:

```math
ẋ = x(1 − x) [(1 − T)x + S(1 − x)]
```

The four regions of module 01's map are four fates. In harmony C takes over; in the dilemma D does. In chicken the bracket changes sign at x* = S/(S + T − 1), which is 1/2 with module 01's numbers: the two strategies **coexist** there, whatever the start. In the stag hunt the same point, 2/3 with module 02's numbers, is the tipping point q* of module 02: above it everyone ends up hunting stag, below it everyone hunts hare.

```figure
fates
```

The rest points of the dynamics and the ESS are closely related. Every ESS is an asymptotically stable rest point of the replicator equation (Taylor and Jonker 1978; Hofbauer, Schuster and Sigmund 1979). With two strategies the converse holds too, as the figure shows. With three or more it can fail: a rest point can attract the population without being an ESS.

## Rock, paper, scissors

Three strategies are enough for something new. Let each beat the next in a ring, as in [module 03](/game-theory-lab/mixed-strategies-zero-sum): a win pays a, a loss costs b, a tie pays 0. The only rest point inside the triangle is the centre (1/3, 1/3, 1/3), and the product V = x_R x_P x_S tells where the population goes:

```math
V̇ = V (a − b) [1 − 3(x_R x_P + x_P x_S + x_S x_R)]
```

The bracket is never negative, and zero only at the centre. When a > b, V rises: the population spirals in, and the centre is an ESS. When a = b, V is constant: the orbits are closed cycles, and along each one the time average of the shares is exactly the centre (Hofbauer and Sigmund 1998). When a < b, V falls: the population spirals out towards the edges, where one strategy after another nearly takes over and then collapses.

Barry Sinervo and Curtis Lively (1996) described the males of the side-blotched lizard, which come in three throat colours with three mating tactics, each beating one of the others; the frequencies of the three colours cycle over a few years.

Panel A's last preset brings back module 06. The three strategies are always cooperate, always defect and Tit for Tat, playing 10 rounds of module 01's dilemma. On the edge between always defect and Tit for Tat, Tit for Tat takes over once it is above 1/17 ≈ 0.059. On the edge between always cooperate and Tit for Tat nothing moves. But where always cooperate is more than 4/9 of that mix, always defect can invade. Drifting towards naive cooperation opens the door to defectors.

## One mutant in a finite population

Real populations are finite, and chance matters. Patrick Moran (1958) proposed the simplest model: N individuals; at each step one is chosen to reproduce, with probability proportional to its fitness, and its offspring replaces one chosen at random. A single mutant either takes over, **fixation**, or dies out. If it is neutral, with the same fitness as everyone else, its chance is 1/N. With a constant relative fitness r it is

```math
ρ = (1 − 1/r) / (1 − 1/r^N)
```

which is 0.148 for r = 1.1 and N = 10, and still 0.059 for a harmful mutant with r = 0.9. Chance can carry a worse strategy to the top.

With games, fitness depends on whom one meets: 1 − w + w × (average payoff), where w is the **intensity of selection**. Martin Nowak, Akira Sasaki, Christine Taylor and Drew Fudenberg (2004) found a simple rule for coordination games with weak selection and a large population. A single A mutant fixes more often than a neutral one when the unstable point x* is below 1/3, the **one-third rule**. And A replaces B more easily than B replaces A exactly when A is risk dominant (x* < 1/2), module 02's notion.

Module 02's stag hunt has x* = 2/3 for stag. With N = 50 and w = 0.1, a lone hare hunter takes over with probability 0.0184, a lone stag hunter with 0.0013, 14 times less. Michihiro Kandori, George Mailath and Rafael Rob (1993) and Peyton Young (1993) reached the same verdict in a different model, with rare random mistakes: in the long run a population spends almost all of its time at the risk-dominant convention.

## Learning without knowing the game

Now take a single player who repeats a game and sees only her own payoffs, not the others', nor whether they are learning too.

Her **regret** after T rounds is how much more the best single action would have earned, against what the others actually did, than what she earned. A rule has no regret if the average regret goes to zero whatever the others do. James Hannan (1957) found the first such rule. A simple one is **multiplicative weights**, or Hedge (Littlestone and Warmuth 1994; Freund and Schapire 1997): each round, every action's weight is multiplied by e^(η·payoff), and she plays each action with probability proportional to its weight. The number η is the learning rate.

With payoffs scaled to [0, 1] and n actions, her average regret, measured with her own probabilities, is at most

```math
ln n / (ηT) + η/8
```

whatever the others do. With η tuned to T it is at most √(ln n/(2T)): 0.0186 at T = 1,000 with two actions. [Module 03](/game-theory-lab/mixed-strategies-zero-sum)'s fictitious play is the other learning rule of the course: it best-replies to the frequencies of the others' past actions, while Hedge only reweights its own. In a zero-sum game the average play of two such learners gives the value of module 03 (Freund and Schapire 1999).

## Where learning lands

Robert Aumann (1974) defined an equilibrium with a mediator. A mediator draws a cell of the table with known probabilities and tells each player only his own part; it is a **correlated equilibrium** if nobody gains by disobeying.

In module 01's chicken, let the mediator choose (swerve, swerve), (swerve, go) and (go, swerve), each with probability 1/3. Told to swerve, a driver thinks the other swerves with probability 1/2, and is indifferent: 3·½ + 1·½ = 4·½ + 0·½. Told to go, he knows the other swerves, and going is best. Each gets 8/3 ≈ 2.67, more than the mixed equilibrium (2) and more than a coin that only picks who goes (2.5). It is a traffic light that tells each driver something private.

```figure
traffic
```

When every player's regret vanishes, the frequencies of play approach the set of **coarse correlated equilibria**, where nobody would rather have committed in advance to a single action. With a stronger notion of regret, **swap regret**, which asks whether replacing each action by another every time it was played would have paid (the regret matching of Hart and Mas-Colell 2000 has none), they approach the correlated equilibria. Every Nash equilibrium is correlated, and every correlated one is coarse correlated (Roughgarden, lecture 13); with two actions each the last two sets coincide.

Panel C lets two Hedge learners loose on module 01's games. In chicken they settle on one of the two pure equilibria. In matching pennies they never settle: their mixed strategies spiral out towards the corners (Bailey and Piliouras 2018), yet their average play is 1/2 and 1/2 and their payoff the value. Blind processes land on the earlier modules' equilibria, on cycles, or on something new.

## Next

Part III, living together. In module 08 many drivers share one road network, each choosing a route for himself, and we ask how much their selfishness costs: the price of anarchy.

<!-- simulation -->

## Further reading

- Nowak, M. A. (2006). *Evolutionary Dynamics: Exploring the Equations of Life*. Harvard University Press. Ch. 4 (evolutionary games), 6 and 7 (finite populations).
- Osborne, M. J. (2004). *An Introduction to Game Theory*. Oxford University Press. Ch. 13 (evolutionary equilibrium).
- Shoham, Y. and Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Ch. 7 (learning and teaching).
- Nisan, N., Roughgarden, T., Tardos, É. and Vazirani, V. (eds.) (2007). *Algorithmic Game Theory*. Cambridge University Press. Ch. 4 (learning, regret minimization and equilibria).
- Roughgarden, T. (2016). *Twenty Lectures on Algorithmic Game Theory*. Cambridge University Press. Lectures 13, 17 and 18.
- Hofbauer, J. and Sigmund, K. (1998). *Evolutionary Games and Population Dynamics*. Cambridge University Press.
- Maynard Smith, J. and Price, G. R. (1973). The logic of animal conflict. *Nature* 246, 15–18.
- Maynard Smith, J. (1982). *Evolution and the Theory of Games*. Cambridge University Press.
- Taylor, P. D. and Jonker, L. B. (1978). Evolutionary stable strategies and game dynamics. *Mathematical Biosciences* 40, 145–156.
- Hofbauer, J., Schuster, P. and Sigmund, K. (1979). A note on evolutionary stable strategies and game dynamics. *Journal of Theoretical Biology* 81, 609–612.
- Sinervo, B. and Lively, C. M. (1996). The rock–paper–scissors game and the evolution of alternative male strategies. *Nature* 380, 240–243.
- Moran, P. A. P. (1958). Random processes in genetics. *Mathematical Proceedings of the Cambridge Philosophical Society* 54, 60–71.
- Nowak, M. A., Sasaki, A., Taylor, C. and Fudenberg, D. (2004). Emergence of cooperation and evolutionary stability in finite populations. *Nature* 428, 646–650.
- Kandori, M., Mailath, G. J. and Rob, R. (1993). Learning, mutation, and long run equilibria in games. *Econometrica* 61, 29–56.
- Young, H. P. (1993). The evolution of conventions. *Econometrica* 61, 57–84.
- Hannan, J. (1957). Approximation to Bayes risk in repeated play. *Contributions to the Theory of Games III*, 97–139.
- Littlestone, N. and Warmuth, M. K. (1994). The weighted majority algorithm. *Information and Computation* 108, 212–261.
- Freund, Y. and Schapire, R. E. (1997). A decision-theoretic generalization of on-line learning and an application to boosting. *Journal of Computer and System Sciences* 55, 119–139.
- Freund, Y. and Schapire, R. E. (1999). Adaptive game playing using multiplicative weights. *Games and Economic Behavior* 29, 79–103.
- Aumann, R. J. (1974). Subjectivity and correlation in randomized strategies. *Journal of Mathematical Economics* 1, 67–96.
- Hart, S. and Mas-Colell, A. (2000). A simple adaptive procedure leading to correlated equilibrium. *Econometrica* 68, 1127–1150.
- Bailey, J. P. and Piliouras, G. (2018). Multiplicative weights update in zero-sum games. *ACM Conference on Economics and Computation*, 321–338.
- The Complexity Lab, [module 11](/lab/cooperation), and modules [02](/game-theory-lab/nash-equilibrium) and [03](/game-theory-lab/mixed-strategies-zero-sum) of this lab.
