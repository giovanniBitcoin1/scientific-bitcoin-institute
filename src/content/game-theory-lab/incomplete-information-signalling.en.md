
## Not knowing who is across the table

Until now every player knew every payoff. A buyer looks at a used car and cannot tell whether the engine is sound. An employer cannot see how good a candidate really is. The newcomer of [module 04](/game-theory-lab/sequential-games-commitment) hears the incumbent's threat and does not know whether a price war would hurt the incumbent or please it. In each case the payoffs depend on something that only one side knows.

## Nature moves first

John Harsanyi, in three papers of 1967–68, found a way to bring such games back to the tools we have. Let a move of chance, played by **Nature**, come first and draw each player's **type**: the facts about its payoffs that only it knows. Each player sees its own type and not the others'. The probabilities of the draw are known to all, a **common prior**. Ignorance about the others becomes uncertainty about a move of chance, which expected payoffs can handle.

Two things change. A strategy is now a plan for every type: what I do if I am tough, and what I do if I am weak, even though only one of the two will happen. And a **Bayesian Nash equilibrium** asks each type of each player to best-respond, given its **beliefs** about the types of the others and the plans of every type.

Take the entry game of module 04 with the same numbers, written (newcomer, incumbent): staying out gives (0, 4), entering and sharing (2, 2). Now the incumbent is **tough** with probability t, and a tough incumbent likes a fight: it gets 3 from fighting, more than the 2 of sharing. A **weak** one gets 0 from fighting. A fought newcomer gets −1 either way.

```figure
types
```

Solve each branch from the end, as in module 04. The tough type fights, the weak type shares. The newcomer does not know which branch it is on: its two nodes are joined by a dashed line, one **information set**, so it must choose the same move at both. Entering pays it 2 with probability 1 − t and −1 with probability t, on average 2 − 3t, so it enters only if t is below 2/3. If a fought newcomer gets w, the threshold is 2/(2 − w).

Look at the weak incumbent. When t is high enough it is never tested, and keeps 4 instead of 2, thanks only to the tough types it might be. It would love to be taken for tough. A weak incumbent that keeps fighting, market after market, to look tough is building a **reputation**: that is module 06.

## When the other side knows more

George Akerlof (1970) showed what such ignorance does to a market. A simple version, not his own: used cars have qualities spread evenly from q_min to 1. An owner values a car at its quality; a buyer would value it at 1.5 times its quality, so every sale would make both better off. But buyers cannot see quality: they see only the average of what is on offer, and that is what they pay for.

With q_min = 0.2 the average is 0.6 and the price starts at 0.9. Owners of cars better than 0.9 refuse it and withdraw. The cars left are worse, so the price falls; more owners withdraw, and so on, round after round, down to 0.6. Half of the cars change hands, but only a third of the gains are made, because the cars that leave are the best ones. With q_min = 0 the price falls all the way: nothing is ever sold, although every car is worth more to a buyer than to its owner. This is **adverse selection**: the price itself selects the cars nobody wants, the **lemons**. Akerlof later recalled that two journals turned the paper down as too trivial and a third because, if it were right, economics would be different.

Simulation A runs this market with thousands of cars. What helps: inspections, warranties, dealers with a name to lose, and signals. The 2001 Nobel memorial prize in economics went to Akerlof, Michael Spence and Joseph Stiglitz for their analyses of markets with **asymmetric information**.

## Signals that cost

Spence (1973) asked how the side that knows more could prove it. Workers are of low productivity, 1, or high, 2; a share λ is high. Competing employers pay what they expect a worker to produce, given what they see: education. Suppose, to make the point sharp, that education adds nothing to productivity at all; it only costs. Each unit costs a low type 1 and a high type 1/2.

In a **separating equilibrium** high types take e* units and are paid 2, low types take none and are paid 1. Two conditions hold it up. The low type must not want to copy: 2 − e* is at most 1, so e* is at least 1. The high type must want to pay: 2 − e*/2 is at least 1, so e* is at most 2. Every e* from 1 to 2 works. In a **pooling equilibrium** everyone takes the same e and is paid the average, 1 + λ; nobody wants to drop to 0 if e is at most λ. Every e from 0 to λ works.

Both kinds rest on what employers believe about levels nobody chooses, **off the equilibrium path**: here, that whoever shows up with them is low. What makes the signal work at all is that it costs less to the type it reveals: **single crossing**. Without it, whatever the high type could afford, the low type could afford too.

Cho and Kreps (1987) proposed a test, often called the **intuitive criterion**, that removes most of these equilibria. If a level is one that the low type could never gain from, even if paid 2, while the high type could, then an employer who sees it should conclude that the worker is high. Apply it, and only the cheapest separation, e* = 1, survives.

And the price of it? With λ = 0.8 the high type gets 2 − 1/2 = 1.5 in that equilibrium. If nobody signalled, everyone would be paid the average, 1.8. The low type gets 1 instead of 1.8. The signal makes everyone poorer, yet no one can stop alone. Simulation B tries other costs and shares. In biology Amotz Zahavi (1975) proposed that the peacock's tail works the same way, a **handicap principle**: an ornament is believed because it is costly to carry. Alan Grafen (1990) is widely taken to have given it a formal footing, a reading that has since been debated.

## Words that cost nothing

Can a signal that costs nothing carry information? Crawford and Sobel (1982) studied an **expert** who knows a number θ, spread evenly on 0 to 1, and sends a message to a **decision maker**, who then chooses an action. The decision maker wants the action to equal θ. The expert wants θ + b: it shares the aim, with a **bias** b. Talk here is **cheap talk**, costless and unverifiable: a message is believed only as far as the expert has no reason to lie.

In equilibrium the expert can only name an interval of a **partition** of 0 to 1, and the decision maker takes its midpoint. With b = 0.1 only two messages can be told apart, "below 0.3" and "above 0.3". With b = 0.05 there are three. From b = 1/4 on, none: nothing the expert says can be believed. An expert whose value sits exactly at a boundary must be indifferent between the two neighbouring actions. That makes each interval 4b longer than the one before: an expert who wants the action pushed up is precise about low values and vague about high ones.

The decision maker's expected loss, measured as the squared distance of the action from θ, is 1/12 ≈ 0.083 with no talk and 0.031 with b = 0.1. Letting the expert decide (**delegation**) costs the decision maker only b² = 0.01, since the expert then picks θ + b. Wessel Dessein (2002) showed that delegation beats advice as long as the conflict is not too large; in this model it does so whenever b is below about 0.29, as Simulation C shows.

## A little doubt picks one equilibrium

Take a stag hunt in which hunting the stag pays θ if the other hunts it too and θ − 1 if not, and hunting hare pays 0. If θ is known and lies between 0 and 1, both equilibria of [module 02](/game-theory-lab/nash-equilibrium) exist: both hunt the stag, or both hunt hare.

Now let each hunter see θ only with a small private error: its own **private signal**, θ plus **noise** of spread σ. This is a **global game** (Hans Carlsson and Eric van Damme, 1993). A hunter whose signal is above 1 prefers the stag whatever the other does; one whose signal is below 0 prefers the hare. Then delete what nobody would choose, step by step, as in [module 01](/game-theory-lab/what-is-a-game). A hunter just below 1 knows that the other's signal is likely above 1, so the stag is safe a little lower; from below, the hare becomes certain a little higher. The band of signals where the choice is still open shrinks from both ends to a single point, 1/2.

```figure
doubt
```

One equilibrium is left: hunt the stag if your signal is above 1/2. That is exactly where the stag becomes risk dominant. The smaller the error, the longer the chain of reasoning: the open band becomes narrower than 0.02 after 13 steps with σ = 0.1 and after 56 with σ = 0.02. But it always ends at the same point. Stephen Morris and Hyun Song Shin (1998) used the same argument for currency attacks; it has since been applied to bank runs. With private doubt, the fundamentals decide whether everybody runs.

## Next

In [module 06](/game-theory-lab/repeated-games-reputation) the same game is played many times. A reputation is then a type that the others learn about from what you do.

<!-- simulation -->

## Further reading

- Osborne, M. J. (2004). *An Introduction to Game Theory*. Oxford University Press. Ch. 9 and 10.
- Tadelis, S. (2013). *Game Theory: An Introduction*. Princeton University Press. Ch. 12, 15, 16 and 18.
- Shoham, Y. and Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Ch. 6 and 8.
- Harsanyi, J. C. (1967–68). Games with incomplete information played by "Bayesian" players, I–III. *Management Science* 14, 159–182, 320–334, 486–502.
- Akerlof, G. A. (1970). The market for "lemons": quality uncertainty and the market mechanism. *Quarterly Journal of Economics* 84, 488–500.
- Spence, M. (1973). Job market signaling. *Quarterly Journal of Economics* 87, 355–374.
- Rothschild, M. and Stiglitz, J. (1976). Equilibrium in competitive insurance markets: an essay on the economics of imperfect information. *Quarterly Journal of Economics* 90, 629–649.
- Cho, I.-K. and Kreps, D. M. (1987). Signaling games and stable equilibria. *Quarterly Journal of Economics* 102, 179–221.
- Zahavi, A. (1975). Mate selection: a selection for a handicap. *Journal of Theoretical Biology* 53, 205–214.
- Grafen, A. (1990). Biological signals as handicaps. *Journal of Theoretical Biology* 144, 517–546.
- Crawford, V. P. and Sobel, J. (1982). Strategic information transmission. *Econometrica* 50, 1431–1451.
- Dessein, W. (2002). Authority and communication in organizations. *Review of Economic Studies* 69, 811–838.
- Carlsson, H. and van Damme, E. (1993). Global games and equilibrium selection. *Econometrica* 61, 989–1018.
- Morris, S. and Shin, H. S. (1998). Unique equilibrium in a model of self-fulfilling currency attacks. *American Economic Review* 88, 587–597.
