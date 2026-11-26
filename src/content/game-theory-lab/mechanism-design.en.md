
## Turning the question around

In modules 01 to 11 the rules were given, and we asked how to play. Module 11 already compared auctions, but only formats that existed. Here the rules are the unknown. A designer wants an outcome: the object in the hands of whoever values it most, as much revenue as possible, or a trade whenever trading creates value. What stands in the way is that the players know things the designer does not: their values, their costs, their types in the sense of [module 05](/game-theory-lab/incomplete-information-signalling).

A **mechanism** says what each player may report and maps the reports to an outcome and to payments. The designer chooses the mechanism without knowing the players' private information; the players then play the game it defines. An auction is a mechanism, and so is a tax schedule, a voting rule or a procedure for sharing a cost. The question of **mechanism design** is which outcomes can be reached, as equilibria, by some mechanism, and with which one.

Two goals recur. **Efficiency**: each thing goes to whoever values it most, so that the total value created is as large as possible. **Revenue**: the designer, a seller for instance, wants to collect as much as possible. They often pull apart, and a third concern, whether the designer can pay for the mechanism at all, will turn out to decide what is possible.

## The revelation principle

The space of mechanisms looks endless: bids, clocks, rounds, menus, messages of any form. A single observation makes it manageable. Suppose some mechanism has an equilibrium with a given outcome. Build a new one in which each player simply reports her type. For each player, the designer then plays the strategy she would have played in the old mechanism given that type. If the old strategies were an equilibrium, no player gains by misreporting in the new one: a false report only makes the designer play for her a strategy she could have chosen herself, and did not choose. So a **direct mechanism**, in which telling the truth is an equilibrium, gives the same outcome.

This is the **revelation principle**. Allan Gibbard (1973) stated it for dominant strategies; building on his work, several authors found it independently at the end of the 1970s for Bayesian equilibrium, among them Roger Myerson (1979) and Partha Dasgupta, Peter Hammond and Eric Maskin (1979). Thanks to it, the search can be limited to direct mechanisms in which telling the truth pays: those that satisfy **incentive compatibility**. Two kinds will matter. In some, the truth is a **dominant strategy**: best whatever the others report, as in the second-price auction of module 11. In others it is only an equilibrium of the Bayesian game: best given that the others tell the truth.

What the principle does not say matters as much. It does not say that the direct mechanism is simple: reporting a whole type may be impractical, and real mechanisms ask for less. It does not say that truth is the only equilibrium of the direct mechanism: there may be others, worse for the designer. It is a tool for finding what is possible, not a recipe for building it.

## The price is an area

Take the simplest private information: each player has one number, her value per unit of what she gets. What she gets may be a chance of winning an object, a number of clicks on an advertisement, or a probability in a lottery. An **allocation rule** x(b) says how much a player gets when she bids b, the others' bids held fixed.

**Myerson's lemma** (Myerson 1981) answers two questions at once. First, an allocation rule can be paired with payments that make the truth dominant exactly when it is **monotone**: bidding more never gets you less. Second, for a monotone rule the payment is then unique, once a bid of 0 is set to pay 0:

```math
p(b) = b·x(b) − ∫₀ᵇ x(z) dz
```

Figure F1 draws the rule. For a bidder whose value is b, the rectangle b × x(b) is what she gets, measured at her value. The area under the curve from 0 to b is what she keeps, her payoff; the rest of the rectangle, above the curve, is what she pays.

```figure
area
```

For one object the curve is a step at the highest rival bid h: the payment is the rectangle, b, minus the area under the step, b − h, which leaves h. The second price of module 11 is not one good idea among many: it is the only price that makes that rule truthful. For two advertising slots that receive 1 and α2 clicks, with rival bids h1 > h2, the curve has two steps and the top slot costs α2·h2 + (1 − α2)·h1. The **generalized second price** (GSP), used for search advertising, makes each advertiser pay the next bid per click. For the top slot it therefore charges h1, and it is not truthful: an advertiser can gain by bidding low and taking the second slot (Benjamin Edelman, Michael Ostrovsky and Michael Schwarz 2007; Hal Varian 2007). Simulation A shows it.

Myerson also found the auction that earns the most. With values drawn independently from a distribution F with density f, the expected payment of a bidder equals the expected **virtual value** of what she gets:

```math
φ(v) = v − (1 − F(v))/f(v)
```

When φ rises with v, as in the example below, the seller should therefore give the object to the bidder with the highest virtual value, if it is positive, and to nobody otherwise: this is the **optimal auction**. With values uniform between 0 and 100, φ(v) = 2v − 100, positive above 50: the optimal auction is the second-price auction with a reserve of 50, the best reserve already met in module 11.

## Pay for the harm you do

Myerson's lemma covers one number per player. With several objects a player's type is a whole table of values, one for each bundle she might get. William Vickrey (1961), Edward Clarke (1971) and Theodore Groves (1973) gave a mechanism that still makes the truth dominant. The **VCG mechanism** chooses the outcome with the largest total of reported values. Each player then pays the loss her presence imposes on the others: the best total the others could have had without her, minus the total they get with her. It is the **externality** she causes, the idea behind the tolls of [module 08](/game-theory-lab/congestion-price-of-anarchy).

Why the truth is dominant: a player's payoff is her own value plus the others' total, minus a term that does not depend on her report. Her report only moves the outcome, and the mechanism already picks the outcome that maximizes that sum when she tells the truth. Truth is dominant and the outcome is efficient, for any number of objects and any values. With one object it is the second-price auction again: the winner's presence costs the others the second-highest value.

Simulation B runs VCG on two objects, A and B, with bids for each object alone and for both.

## What rules cannot do

VCG looks like the end of the story. It is not. Lawrence Ausubel and Paul Milgrom (2006) listed its weaknesses. Its revenue can be very low, even zero: in Simulation B's "lonely auction" one bidder wants both objects for 4, two others want one object each for 4, and the seller gets nothing. Its revenue can fall when a bidder joins: without the third bidder the same auction earns 4. Losing bidders can collude: two bidders who value A and B at 1 each can both bid 10, win, and pay nothing. And a bidder can gain by bidding under two names, with **false-name bids** (Makoto Yokoo, Yuko Sakurai and Shigeo Matsubara 2004): a bidder who values both objects at 6 pays 4 as one person and nothing as two.

The deepest limit concerns the simplest problem, **bilateral trade**. A seller has an object that costs her c; a buyer values it at v; each knows only her own number. Trade creates value when v ≥ c. Roger Myerson and Mark Satterthwaite (1983) showed that, when the possible values and costs overlap, no rule has four properties at once. It cannot be efficient, truthful, voluntary (neither side expects to lose by taking part: **individual rationality**) and balanced (the designer neither pays nor keeps money: **budget balance**).

Figure F2 puts numbers on this, with values and costs uniform between 0 and 100. Trading whenever v ≥ c creates 16.67 on average. VCG achieves it, truthfully and voluntarily, but the buyer pays c while the seller receives v, and the designer pays the difference: all of it, 16.67 on average. A posted price of 50, at which each side accepts or refuses, is truthful, voluntary and balanced, but creates only 12.5. Splitting the difference between two bids, a **double auction** (Kalyan Chatterjee and William Samuelson 1983), creates 14.06 in its linear equilibrium, in which the two trade only when the value exceeds the cost by 25 or more. Myerson and Satterthwaite showed that 14.06 is the most any balanced, voluntary rule can create here: of the four properties, a rule can have at most three.

```figure
trade
```

```box
Who runs the auction?
**Passing transactions on.** A node that knows of a transaction competes for its fee with every node it tells. Moshe Babaioff, Shahar Dobzinski, Sigal Oren and Aviv Zohar (2012) found that the protocol as implemented rewarded keeping transactions to oneself. They proposed rewards for relaying nodes that cost little and resist fake identities (they are Sybil-proof): under them, passing on without cloning oneself is what survives iterated removal of dominated strategies. They also showed that no reward scheme makes this a dominant strategy.

**The auctioneer bids.** The miner runs the fee auction and keeps the fees: it can add its own transactions or strike deals with users off the chain. Tim Roughgarden (2021) asked three things of a fee rule: users do best by bidding their value (incentive compatibility for users), the miner gains nothing by departing from the rule (myopic miner incentive compatibility), and no deal between the miner and users beats it (OCA-proofness). Pay your bid passes the second and the third, not the first; a uniform price comes close to the first but fails the second. In Simulation C, with 20 users and 10 slots, the honest uniform price earns 476.19, one fake bid 523.81 and the best cheating about 547; the users' total payoff falls from 261.90 to about 153.5. With room for all 20 users the honest miner earns 0, and the cheating one about 579. EIP-1559, adopted by Ethereum on 5 August 2021, burns a base fee and, in Roughgarden's analysis, passes all three except in a sudden demand spike. Hao Chung and Elaine Shi (2023) showed that with a block of finite size no non-trivial rule makes the truth dominant for users and also resists a deal between the miner and a single user.

**A hypothesis, not a description.** One reading of Bitcoin's choice: it keeps pay your bid, which the miner cannot game with fake bids, at the cost of making users guess what to bid. It is a statement about incentives, not about how miners behave.
```

## Next

[Module 13](/game-theory-lab/mining-as-a-game), "Mining as a game", treats the protocol itself as a mechanism, and asks whether following it is an equilibrium for a miner.

<!-- simulation -->

## Further reading

- Roughgarden, T. (2016). *Twenty Lectures on Algorithmic Game Theory*. Cambridge University Press. Lectures 3 (Myerson's lemma), 4 (algorithmic mechanism design; the revelation principle), 5 (revenue-maximizing auctions), 7 (multi-parameter mechanism design: VCG).
- Nisan, N., Roughgarden, T., Tardos, É. and Vazirani, V. V. (eds.) (2007). *Algorithmic Game Theory*. Cambridge University Press. Ch. 9 (introduction to mechanism design).
- Krishna, V. (2010). *Auction Theory*, 2nd ed. Academic Press. Ch. 5 (mechanism design, VCG, bilateral trade).
- Tadelis, S. (2013). *Game Theory: An Introduction*. Princeton University Press. Ch. 14 (mechanism design).
- Shoham, Y. and Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Ch. 10 (mechanism design; 10.4.5 on the drawbacks of VCG).
- Gibbard, A. (1973). Manipulation of voting schemes: a general result. *Econometrica* 41, 587–601.
- Myerson, R. B. (1979). Incentive compatibility and the bargaining problem. *Econometrica* 47, 61–73.
- Dasgupta, P., Hammond, P. and Maskin, E. (1979). The implementation of social choice rules: some general results on incentive compatibility. *Review of Economic Studies* 46, 185–216.
- Myerson, R. B. (1981). Optimal auction design. *Mathematics of Operations Research* 6, 58–73.
- Vickrey, W. (1961). Counterspeculation, auctions, and competitive sealed tenders. *Journal of Finance* 16, 8–37.
- Clarke, E. H. (1971). Multipart pricing of public goods. *Public Choice* 11, 17–33.
- Groves, T. (1973). Incentives in teams. *Econometrica* 41, 617–631.
- Myerson, R. B. and Satterthwaite, M. A. (1983). Efficient mechanisms for bilateral trading. *Journal of Economic Theory* 29, 265–281.
- Chatterjee, K. and Samuelson, W. (1983). Bargaining under incomplete information. *Operations Research* 31, 835–851.
- Edelman, B., Ostrovsky, M. and Schwarz, M. (2007). Internet advertising and the generalized second-price auction: selling billions of dollars worth of keywords. *American Economic Review* 97, 242–259.
- Varian, H. R. (2007). Position auctions. *International Journal of Industrial Organization* 25, 1163–1178.
- Ausubel, L. M. and Milgrom, P. (2006). The lovely but lonely Vickrey auction. In Cramton, P., Shoham, Y. and Steinberg, R. (eds.), *Combinatorial Auctions*. MIT Press. Ch. 1.
- Yokoo, M., Sakurai, Y. and Matsubara, S. (2004). The effect of false-name bids in combinatorial auctions: new fraud in internet auctions. *Games and Economic Behavior* 46, 174–188.
- Babaioff, M., Dobzinski, S., Oren, S. and Zohar, A. (2012). On Bitcoin and red balloons. *ACM Conference on Electronic Commerce (EC 2012)*, 56–73.
- Roughgarden, T. (2021). Transaction fee mechanism design. *ACM Conference on Economics and Computation (EC 2021)*; journal version *Journal of the ACM* 71 (2024).
- Chung, H. and Shi, E. (2023). Foundations of transaction fee mechanism design. *ACM-SIAM Symposium on Discrete Algorithms (SODA 2023)*, 3856–3899.
