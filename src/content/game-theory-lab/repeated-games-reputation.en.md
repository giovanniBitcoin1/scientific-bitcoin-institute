<!-- DRAFT: to be reviewed by Adriano -->

## Playing again

The prisoner's dilemma of [module 01](/game-theory-lab/what-is-a-game) has one equilibrium, and it is bad for both players. But two firms in the same market, two neighbours, two mining pools do not meet once. They meet every day, and what each does today is seen and remembered tomorrow. This module asks what the future can do to the present.

The same game, now called the **stage game**, is played round after round. A player's payoffs form a stream u₀, u₁, u₂, …, and a payoff t rounds away is weighted by δᵗ. The number δ, between 0 and 1, is the **discount factor**, or **patience**. It can also be read as the chance that there is another round at all: then the expected number of rounds is 1/(1 − δ), which is 10 at δ = 0.9. To put a stream on the scale of a single round we use its **average payoff**:

```math
(1 − δ)(u₀ + δ u₁ + δ² u₂ + …)
```

A stream of 3 in every round has average 3. A strategy is now much richer than in module 01: it says what to do after every possible history of play.

## The patience threshold

Take module 01's dilemma, with R = 3 for mutual cooperation, S = 0 for the sucker, T = 5 for the temptation and P = 1 for mutual defection. Consider **grim trigger**: cooperate as long as nobody has defected; once someone has, defect for ever.

If both follow it, each gets 3 on average. A player who defects today gets 5 now and 1 in every later round, an average of (1 − δ)5 + δ. Cooperation holds when 3 is at least that much, which is when

```math
δ ≥ (T − R) / (T − P) = 1/2
```

```figure
patience
```

The punishment is credible. Once it starts, both play the stage game's equilibrium for ever, and against a defector defecting is the best reply: cooperating once would give 0 instead of 1 and would not stop the punishment. So the profile is subgame perfect, in the sense of [module 04](/game-theory-lab/sequential-games-commitment).

How can we be sure no cleverer deviation pays, say defecting twice and then apologizing? The **one-shot deviation principle**, which comes from dynamic programming (Blackwell 1965), says that with discounting it is enough to check deviations of a single round followed by a return to the strategy. If no such deviation pays, no longer one does. This is the arithmetic behind the "shadow of the future" of the Complexity Lab's [module 11](/lab/cooperation), which told the story of Axelrod's tournaments and Tit for Tat.

## Almost anything can last

Cooperation is not the only thing patience can hold together. Call a pair of average payoffs **feasible** if the players can reach it by letting a public lottery choose one of the four cells each round, with fixed weights. A player can never be pushed below 1: by defecting every round he gets at least that, whatever the other does. That 1 is his **minmax**, and a feasible pair that gives each player more than his minmax is **individually rational**.

The **folk theorem** says that every feasible, individually rational pair is the average payoff of some subgame perfect equilibrium when δ is close enough to 1. The name records that the result was known among game theorists in the 1950s, passed on by word of mouth, before anyone published it. James Friedman (1971) proved a version in which deviations are punished by a return to a stage equilibrium; Drew Fudenberg and Eric Maskin (1986) proved it in general.

```figure
folk
```

Figure F2 shows how much patience each point needs with the simplest scheme: the lottery picks a cell, both play it, and whoever disobeys is punished with defection for ever. One result is a surprise. Taking turns at being exploited, (2.5, 2.5), needs only δ ≥ 0.4, less than mutual cooperation, which needs 0.5. The player who is exploited this round gives up 1 by obeying (he could get 1 instead of 0); a cooperator facing a cooperator gives up 2 (5 instead of 3).

The folk theorem says how cooperation can last, not which of the many equilibria will be played. Module 02's problem, which equilibrium to expect, comes back larger than before.

## Collusion without a contract

Back to module 02's market, a = 10, c = 1. Two firms producing 2.25 each, half the monopoly output, earn 10.125 each against Cournot's 9. A firm that cheats once produces 3.375, its best reply, and earns 11.390625. If cheating is answered by Cournot for ever, the cartel holds when δ ≥ 9/17 ≈ 0.529.

More firms make it harder. With n firms the threshold is

```math
δ* = (n + 1)² / (n² + 6n + 1)
```

which gives 0.571 for 3 firms, 0.643 for 5 and 0.752 for 10. With prices instead of quantities (Bertrand, identical goods) a cheat undercuts by a hair and takes the whole market, and the threshold is (n − 1)/n: 0.5, 0.667, 0.8 and 0.9 for 2, 3, 5 and 10 firms.

Below the threshold a Cournot cartel is not lost altogether. It can still hold a smaller cut in output: with two firms the most it can hold is

```math
q(δ) = (27 − 15δ) / (9 − δ)
```

which is 2.586, with a profit of 9.899, at δ = 0.3. With prices it is all or nothing.

This is **tacit collusion**: no agreement is needed, only the expectation of the others' reaction. Few firms, frequent meetings and prices that everyone can see all make it easier, which is why competition authorities watch for them. Explicit cartels, of course, are illegal.

```box
Bitcoin: the miner's dilemma
Pools pay their members for partial proofs of work. A pool can send some of its miners into another pool, where they submit partial proofs but throw away any full block they find: **block withholding**. The attacker takes a share of the victim's rewards and adds nothing to them. Ittay Eyal (2015) studied pools that attack each other this way.

**The model.** Two pools, the rest of the network mining honestly; pool i has power mᵢ and sends xᵢ into the other. Pool i's miners earn rᵢ per unit of power, 1 when nobody attacks, and each pool chooses xᵢ to maximize its own rᵢ. With two pools of 25%, a pool that attacks alone sends 15.8% of its power: its miners earn 1.9% more, the victim's 10.1% less, everyone else 4.1% more. In equilibrium both attack, with 14.9% each, and both earn 8.1% less, while everyone else earns 8.1% more. As a two-by-two game the payoffs are (1, 1), (1.019, 0.904), (0.904, 1.019) and (0.919, 0.919): a prisoner's dilemma.

**Patience is not the problem.** Grim trigger needs δ ≥ 0.19 only, and pools can react every day. Seeing is: Eyal notes that a pool may notice that it is being attacked, but not which of its miners are the infiltrators. With many pools the attacker is anonymous, which is the problem of the next section.

**A hypothesis.** Eyal observed that such attacks are rarely reported, and suggested that pools may have an agreement, perhaps unspoken, not to attack: fragile, because any pool can attack unseen. These are numbers of a model, not measurements; fees, payout schemes and the real number of pools are left out.
```

## Price wars without cheating

Edward Green and Robert Porter (1984) asked what happens when firms see the price but not each other's output, and demand is noisy: **imperfect monitoring**. A low price can be the sign of a cheat or just of bad luck. The firms cannot tell, so they agree on a rule: when the price falls below a **trigger price** p̄, a price war (Cournot play) breaks out for L rounds, and then the cartel resumes.

In equilibrium nobody cheats, and still wars break out, from bad luck alone. Panel B uses a simplified version: a firm that cheats produces 3.375, the best reply to 2.25 (in Green and Porter firms may choose any quantity, and a small cheat is even harder to see). With noise of spread σ = 0.5, p̄ = 4.5, L = 5 and δ = 0.9, a false alarm happens in 2.3% of the quiet rounds and a cheat is caught 60% of the time. Cheating does not pay, and in the long run about one round in ten is a war (the share of peace is 0.898). With wars of only L = 2 rounds, cheating pays.

The noisier the price, the more patience a cartel needs. The least δ for which some trigger works rises from 9/17 ≈ 0.53 without noise to 0.54 at σ = 0.25, 0.64 at 0.5, 0.75 at 0.75 and 0.83 at 1. Robert Porter (1983) found wars of this kind in the Joint Executive Committee, the railway cartel that set the rates for grain shipped from Chicago to the East Coast in 1880–1886.

## When the end is known

All of this needs a future. With a known last round, the dilemma unravels: in the last round nobody has a reason to cooperate, so in the round before nobody does either, and so on back to the first. This is backward induction, as in module 04.

Reinhard Selten (1978) found a sharper version, the **chain-store paradox**. A chain store is present in 20 towns and meets one newcomer per town, in turn, with module 04's payoffs, written (newcomer, chain): stay out (0, 4), enter and share (2, 2), enter and fight (−1, 0). Backward induction says that every newcomer enters and the chain shares all 20 times. Yet "fight the first ones to scare the rest" sounds like exactly what a real chain would do. Selten called the gap a paradox.

## A reputation is a belief

David Kreps and Robert Wilson (1982), and Paul Milgrom and John Roberts (1982), resolved it with module 05's types. With probability t the incumbent is **tough**: it prefers fighting, 3 against 2. The newcomers watch what it does. A **weak** incumbent now has a reason to fight early: to look tough.

The equilibrium has a clear shape. Let w be a fought newcomer's payoff (−1 here) and b = 2/(2 − w), module 05's threshold (2/3 at w = −1); let k be the number of markets still to go, this one included, and let p be the newcomers' belief that the incumbent is tough. The newcomer stays out if p ≥ bᵏ and enters if p < bᵏ. After an entry a weak incumbent fights for sure if p ≥ bᵏ⁻¹; otherwise it fights with exactly the probability that makes the belief after a fight equal to bᵏ⁻¹. In the last market it shares.

With t = 0.05 and 20 markets, the first 13 newcomers stay out. Entry can happen only in the last 7 markets, and that 7 does not depend on how many markets there are. The weak incumbent earns 66, against 40 without the doubt. A little doubt and a long horizon are enough. Kreps, Milgrom, Roberts and Wilson (1982) showed that the same logic keeps cooperation going in a finitely repeated prisoner's dilemma until near the end, if there is a chance that a player simply plays Tit for Tat.

Module 05 ended on the promise that a reputation is a type that the others learn about. Here it is: a reputation is a belief, and it is worth paying for.

## Next

In [module 07](/game-theory-lab/evolution-and-learning) the players stop calculating. Strategies spread because they do well, and players learn the game by playing it.

<!-- simulation -->

## Further reading

- Osborne, M. J. (2004). *An Introduction to Game Theory*. Oxford University Press. Ch. 14 and 15 (repeated games), and the chain-store game in ch. 7.
- Tadelis, S. (2013). *Game Theory: An Introduction*. Princeton University Press. Ch. 10 (repeated games, tacit collusion, the folk theorem) and ch. 17 (building a reputation).
- Mailath, G. J. and Samuelson, L. (2006). *Repeated Games and Reputations: Long-Run Relationships*. Oxford University Press.
- Blackwell, D. (1965). Discounted dynamic programming. *Annals of Mathematical Statistics* 36, 226–235.
- Friedman, J. W. (1971). A non-cooperative equilibrium for supergames. *Review of Economic Studies* 38, 1–12.
- Fudenberg, D. and Maskin, E. (1986). The folk theorem in repeated games with discounting or with incomplete information. *Econometrica* 54, 533–554.
- Green, E. J. and Porter, R. H. (1984). Noncooperative collusion under imperfect price information. *Econometrica* 52, 87–100.
- Porter, R. H. (1983). A study of cartel stability: the Joint Executive Committee, 1880–1886. *Bell Journal of Economics* 14, 301–314.
- Selten, R. (1978). The chain store paradox. *Theory and Decision* 9, 127–159.
- Kreps, D. M. and Wilson, R. (1982). Reputation and imperfect information. *Journal of Economic Theory* 27, 253–279.
- Milgrom, P. and Roberts, J. (1982). Predation, reputation, and entry deterrence. *Journal of Economic Theory* 27, 280–312.
- Kreps, D. M., Milgrom, P., Roberts, J. and Wilson, R. (1982). Rational cooperation in the finitely repeated prisoners' dilemma. *Journal of Economic Theory* 27, 245–252.
- Eyal, I. (2015). The miner's dilemma. *IEEE Symposium on Security and Privacy*, 89–103 (arXiv:1411.7099).
- The Complexity Lab, [module 11](/lab/cooperation).
