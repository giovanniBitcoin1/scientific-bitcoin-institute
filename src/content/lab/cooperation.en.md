<!-- DRAFT: to be reviewed by Adriano -->

## Blood for a stranger

A vampire bat that fails to find a meal on two nights in a row can starve. In the 1980s the biologist Gerald Wilkinson watched vampire bats in Costa Rica and saw how they avoid this. A bat that fed well regurgitates some blood for a roost-mate that came home hungry. The help is not given at random: bats tend to feed those that fed them before, and a bat that helps is more likely to be helped later (Wilkinson, 1984).

Natural selection rewards whatever leaves more descendants, and giving away food costs the giver. Why would evolution, a contest of self-interest, produce such generosity?

## The language of games

A **game** has players, each with a set of **strategies**, and **payoffs**: what each player gets for every combination of choices. The key idea is the one John Nash proposed in 1950. A **Nash equilibrium** is a set of strategies, one per player, in which no player can do better by changing strategy while the others keep theirs. It need not be a good outcome for anyone.

## The Prisoner's Dilemma

The most famous game was devised around 1950 at the RAND Corporation by Merrill Flood and Melvin Dresher; Albert Tucker gave it the story of two prisoners questioned separately. Each player can **cooperate** (C) or **defect** (D). Mutual cooperation pays both a reward R; mutual defection pays both a punishment P; a defector facing a cooperator collects the temptation T while the cooperator gets the sucker's payoff S. The dilemma requires

```math
T > R > P > S  and  2R > T + S
```

The second condition means that taking turns at exploiting each other pays less than steady cooperation.

Now reason like a player. If the other cooperates, defecting earns T instead of R. If the other defects, defecting earns P instead of S. Whatever the other does, defecting pays more, so two rational players both defect and each receives P, although both would have preferred R. Mutual defection is the only Nash equilibrium. Individual rationality and collective rationality collide.

## The shadow of the future

When the same two players meet again and again, today's betrayal can be punished tomorrow. Robert Axelrod called this "the shadow of the future": when it is long enough, cooperation can pay.

Around 1980 Axelrod, a political scientist, ran two computer tournaments of the repeated game. Game theorists, economists, biologists and others submitted strategies, and each played every other. Both tournaments were won by one of the simplest programs entered, Anatol Rapoport's **Tit for Tat**: cooperate on the first move, then copy whatever the opponent did last.

Tit for Tat never beats anyone in a single match: at best it ties. It wins by doing well enough against everyone. Axelrod's diagnosis of successful strategies was that they are **nice** (never the first to defect), **retaliatory** (they answer a defection), **forgiving** (they return to cooperation when the other does) and **clear** (easy for the opponent to read). In 1981 he and the biologist W. D. Hamilton showed how the same logic can explain cooperation between organisms that cannot reason at all.

## Mistakes

Tit for Tat has a weak spot. Suppose two Tit-for-Tat players meet and one of them defects by mistake. The other answers with a defection, the first answers back, and the pair are trapped in an echo of retaliation that only another mistake can break. In a noisy world, strategies that forgive do better. **Generous Tit for Tat** sometimes lets a defection pass. **Win-Stay, Lose-Shift**, also called Pavlov, keeps its last move when it scored well (T or R) and switches when it scored badly (P or S): after a mistake between two Pavlov players, both defect once and then both return to cooperation. Martin Nowak and Karl Sigmund showed in 1993 that in evolving populations Pavlov can outperform Tit for Tat.

## Evolution instead of reason

Bats do not compute equilibria. In 1973 John Maynard Smith and George Price brought game theory into biology by replacing rational choice with selection. A payoff becomes reproductive success, and a strategy spreads when it earns more than the population's average; this rule is now written as the **replicator dynamics**. A strategy is **evolutionarily stable** if, once everyone plays it, a rare mutant playing something else cannot invade. In the hawk–dove game that grew out of this work, hawks fight for a prize and doves back down; when injury costs more than the prize is worth, neither is stable alone and the population settles on a mix.

## Space helps cooperators

In 1992 Martin Nowak and Robert May placed cooperators and defectors on a grid, like the cellular automata of Modules 05 and 06. Each cell plays the one-shot game with its neighbours and then copies the most successful one among them. In clusters, cooperators mostly meet each other and earn well, while defectors feed only on the cluster's edge. For a range of temptations the two coexist for ever in shifting patches. Start from a single defector in a sea of cooperators, and it grows into an ever-changing, perfectly symmetric pattern that the authors called a **kaleidoscope**.

## Five routes to cooperation

In 2006 Nowak summarised five mechanisms that let cooperation evolve: **kin selection**, helping relatives who share your genes; **direct reciprocity**, I help you because you may help me, like Tit for Tat; **indirect reciprocity**, I help you and others see it, so my reputation brings help from third parties; **network reciprocity**, where structure keeps cooperators together, as on the grid; and **group selection**, where groups of cooperators outcompete groups of defectors.

## Many players

With many players the dilemma becomes the **tragedy of the commons**, popularised by Garrett Hardin in 1968: each herder gains by adding one more animal to a shared pasture, and together they ruin it. Elinor Ostrom, Nobel prize in economics in 2009, studied fisheries, forests and irrigation systems and found that communities often manage shared resources well for centuries, with their own rules, mutual monitoring and graduated sanctions. In experiments, people pay out of their own pocket to punish free riders, and this keeps cooperation going (Ernst Fehr and Simon Gächter, 2002).

A different many-player game is Andreas Diekmann's **volunteer's dilemma** (1985). Someone must pay a cost so that everyone benefits: call the ambulance, report the bug. If each player volunteers at random with the equilibrium probability, a striking result follows: the larger the group, the more likely it is that **nobody** volunteers. It is a simple model of the bystander effect.

## A Bitcoin connection

Bitcoin is an exercise in incentive design. In section 6 of the 2008 white paper, Satoshi Nakamoto argues that an attacker able to gather more computing power than all honest nodes together should find it more profitable to play by the rules, collecting new coins, than to undermine the system on which the value of those coins depends. Security rests not on everyone being good, but on honesty being the best strategy.

Game theory also shows the limits of this argument. In 2014 Ittay Eyal and Emin Gün Sirer described **selfish mining**: a pool that keeps the blocks it finds secret and releases them strategically can earn more than its fair share once its hash rate passes a threshold, about a third in their basic model and lower if the pool's blocks spread faster than its rivals'. Designing a protocol means designing a game whose equilibrium is the behaviour you want.

<!-- simulation -->

## What to observe

1. Run the tournament with the default payoffs and no noise. Where does Tit for Tat finish? Pick it against each opponent in the head-to-head view: does it ever win a match?
2. Set the noise to 0.05 and run again. Which strategies move up the ranking, and which fall? Look at two Tit-for-Tat players head to head.
3. In Panel B, with no noise, why does Always Defect shrink from the first generation? Now run the tournament with noise 0.05 and let evolution go for a few hundred generations: which strategy takes over first, and why does Always Defect then rise and fall?
4. In Panel C, load the kaleidoscope with b = 1.85 and watch its symmetry. Change b slightly, to 1.75 or 1.95: does the pattern survive?
5. Start the grid from a random mix with b between 1.8 and 2. Does the share of cooperators settle near the dashed line, whatever the initial share?
6. In the volunteer's dilemma, double the group size. Is everyone safer? What happens to each player's chance of volunteering, and to the chance that nobody does?

## Further reading

- J. F. Nash, "Equilibrium points in n-person games", *Proceedings of the National Academy of Sciences* 36 (1950) 48–49.
- G. Hardin, "The tragedy of the commons", *Science* 162 (1968) 1243–1248.
- J. Maynard Smith & G. R. Price, "The logic of animal conflict", *Nature* 246 (1973) 15–18.
- R. Axelrod & W. D. Hamilton, "The evolution of cooperation", *Science* 211 (1981) 1390–1396.
- R. Axelrod, *The Evolution of Cooperation* (Basic Books, 1984).
- G. S. Wilkinson, "Reciprocal food sharing in the vampire bat", *Nature* 308 (1984) 181–184.
- A. Diekmann, "Volunteer's dilemma", *Journal of Conflict Resolution* 29 (1985) 605–610.
- E. Ostrom, *Governing the Commons* (Cambridge University Press, 1990).
- M. A. Nowak & R. M. May, "Evolutionary games and spatial chaos", *Nature* 359 (1992) 826–829.
- M. Nowak & K. Sigmund, "A strategy of win-stay, lose-shift that outperforms tit-for-tat in the Prisoner's Dilemma game", *Nature* 364 (1993) 56–58.
- E. Fehr & S. Gächter, "Altruistic punishment in humans", *Nature* 415 (2002) 137–140.
- M. A. Nowak, "Five rules for the evolution of cooperation", *Science* 314 (2006) 1560–1563.
- S. Nakamoto, "Bitcoin: A Peer-to-Peer Electronic Cash System" (2008).
- I. Eyal & E. G. Sirer, "Majority is not enough: Bitcoin mining is vulnerable", *Financial Cryptography and Data Security 2014*, LNCS 8437, 436–454.
