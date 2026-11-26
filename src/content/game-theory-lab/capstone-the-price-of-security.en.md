<!-- DRAFT: to be reviewed by Adriano -->

## What security buys

A blockchain is safe while rewriting it costs more than rewriting it brings. Nothing in the protocol forbids a rewrite: whoever produces the longest chain decides the history, and [module 13](/game-theory-lab/mining-as-a-game) showed that the rules hold only as long as following them pays. This module asks what it costs to keep them paying, and who bears the cost.

Three kinds of attacker are worth keeping apart.

- **The double spender** pays a merchant, waits until the merchant hands over the goods, then publishes a longer chain in which the payment never happened (Narayanan and coauthors 2016, section 2.3). She wants her money back, so she attacks only if it is profitable.
- **The saboteur** wants Bitcoin to fail, whatever it costs her: a rival, a government, someone short on the currency. Joshua Kroll, Ian Davey and Edward Felten (2013) named this the **Goldfinger attack**, after the villain who wanted to make the gold of Fort Knox worthless rather than steal it. Profit is not her objective, so a model built on profit does not bound her.
- **The renter** does not buy machines at all. Joseph Bonneau (2016) asked "why buy when you can rent?": hash rate can be hired on a market, or miners can be paid to mine on the attacker's branch (**bribery**), even through a mining pool that pays more than it earns.

Module 13's deviations bent the rules: a selfish miner still builds valid blocks and only chooses when to show them. This module is about breaking them.

## Three equations

Eric Budish (2025; first version 2018) reduced the question to three equations. Let N* be the honest computing power ("trust support" in his words), c its cost per block for each unit, and p_block what miners are paid for one block, the subsidy and the fees.

**Zero profit.** Mining is open to anyone, so honest miners enter until they spend what they earn:

```math
N*·c = p_block                         (1)
```

**Incentive compatibility.** An attacker with A times the honest computing power must keep mining for t(A) blocks on average before her secret chain overtakes the honest one. The attack must cost her more than the V_attack it brings:

```math
A·N*·c·t(A) > V_attack                 (2)
```

This is the **gross** cost. She also earns the rewards of the blocks on her new chain, which are left out; Budish's Theorem 2 shows that, with no frictions, no change of difficulty and no fall in the price, those rewards repay her exactly, so the net cost is zero.

**Together.** Put (1) into (2), with the attacker choosing the A that makes A·t(A) smallest, A*:

```math
p_block > V_attack / (A*·t(A*))         (3)
```

The left side is a **flow**, paid in every block for as long as the chain exists. The right side is a **stock**, a one-off gain. Equation (3) says the flow must be large against the stock, and that it grows in proportion to it: securing twice the value costs twice as much, for ever.

How long does an attack last? Budish lets the merchant wait for e blocks of **escrow** after the attacker's transaction is in a block, and k counts the blocks in which the attacker places her transactions. When the honest chain has n = k + e blocks, the attacker's private chain has m blocks with a negative binomial probability; if she is short, her lead grows on average by A − 1 for each honest block, so closing a gap of i blocks and getting one ahead takes (i + 1)/(A − 1) more. His base case is an hour of each, k + e = 12: then A* = 1.43, a 59% share of all computing power (a **majority attack**, the "51% attack", with room to spare), and t(A*) = 13.99 blocks. So every block must pay about 5.00% of the value at stake, 720% of it a day. Deterring a $1 billion attack this way would cost about $2.63 trillion a year. Figure F1 recomputes his table of t(A) and draws the cost against A.

```figure
flow
```

## Today's numbers

The **subsidy** is 3.125 BTC a block. Fees averaged 0.0201 BTC a block in the week to 23 November 2026, 0.64% of what miners earned (Hashrate Index). At $60,374, CoinGecko's close of 25 November 2026, a block pays p_block = $189,882. With k + e = 12, A*·t(A*) is 20.0, so the flow deters attacks worth up to about 20 times p_block: $3.80 million. If everyone waited a week, k + e = 1,008, the multiple would be 1,099, and attacks up to $208.68 million would be deterred.

That is Budish's point. Bitcoin moves far larger sums than these every day, so if his model described the world, someone would already have attacked. Panel A starts from these dated defaults; every figure has its source under its field.

## The objections

Each objection is a game met earlier in the course.

- **Hash rate cannot be rented at that scale.** On 25–26 November 2026, NiceHash offered 8.85 EH/s for SHA-256, 0.87% of a network of 1,019 EH/s (30-day average, Hashrate Index, 23 November). An attacker who needs 143% of the network must own the machines. At 1.43 times the network and $18.28 per TH/s (Luxor's price index for machines under 14 J per TH, 24 November 2026; the value has not moved since August and may be stale), that is $26.62 billion of hardware, against 45.85 GWh of energy for the attack itself, $2.29 million at 13.5 J per TH and $0.05 per kWh. Only the hardware is a serious barrier.
- **The attack destroys what she owns.** If a visible attack makes Bitcoin's price collapse, her machines, good for nothing else, and her coins lose their value: she pays a stock as well as the flow. Budish computes that the required payment then falls by a factor of about 2,500. His answer is that this protection rests on the possibility of collapse, and that collapse invites the saboteur: whoever wants the harm itself is not deterred by it. "Collapse risk does not seem like a plausible foundation for a novel economic system." This is the logic of [module 04](/game-theory-lab/sequential-games-commitment): a threat is worth what it costs the one who carries it out.
- **The victim strikes back.** Daniel Moroz, Daniel Aronoff, Neha Narula and David Parkes (2020) let the victim of a double spend counterattack, rewriting the chain again to undo the attack. The two then fight a **war of attrition**, each paying to stay in, and the threat of it leads to a subgame perfect equilibrium in which nobody attacks at all. As in [module 06](/game-theory-lab/repeated-games-reputation), a punishment that is credible need never be used; their result assumes that each new round costs more and that the victim cares about its reputation.
- **Merchants can wait.** More confirmations raise k + e, and with it A*·t(A*): from 20.0 to 1,099 in the numbers above. Waiting buys security, but slowly, and only for those who wait.
- **Users may refuse an attacking chain.** Exchanges, merchants and node operators could agree that a chain which reverses hours of history is not Bitcoin. That is a coordination game outside every model here, and it is the hardest one to put numbers on.

## When the subsidy falls

The subsidy halves every 210,000 blocks, about four years: 3.125 BTC since April 2024, 1.5625 in 2028. After 33 halvings, the last of which ends it, the total issued will be 20,999,999.9769 BTC. To keep today's 3.145 BTC per block (the subsidy plus 0.02 of fees), fees would have to be 79 times today's in 2028 and 118 times in 2032. Figure F2 shows the clock, and how fast fees would have to grow.

```figure
clock
```

Can fees take over? Raphael Auer (2019) argues that they cannot, on their own: each user pays for her own transaction, but benefits from the security that all the others' fees buy, so she free-rides on them, and the fees offered fall short of what security needs.

Miles Carlsten, Harry Kalodner, Matthew Weinberg and Arvind Narayanan (2016) showed what changes when fees are the whole reward. With blocks found at random times and fees flowing in steadily, a block's reward depends on how long it has been since the last one, so rewards vary as much as the gaps. A block that happens to be rich becomes worth forking, to take its fees for oneself (**undercutting**). Selfish mining pays for a miner of any size. And just after a block, when few fees are waiting, it may pay to switch the machines off until fees build up again: a **mining gap**. Panel B draws these rewards. Gur Huberman, Jacob Leshno and Ciamac Moallemi (2021) connect the fee market of [module 11](/game-theory-lab/auctions) to this question: fees are high only when blocks are full, so the users' willingness to wait is what sets the miners' revenue.

## Do the sum yourself

Every number in this module depends on assumptions: a price, a hash rate, a cost of hardware, how long a merchant waits, what an attacker wants. Panel C is a worksheet. Each input has a field for its source and its date, and the result is a sentence of the form "under these assumptions an attack worth V is, or is not, deterred". It is never a verdict on Bitcoin, only on a model with your numbers in it.

## What the lab has shown

Fourteen modules have built one tool kit. Equilibrium ([module 02](/game-theory-lab/nash-equilibrium)) asks whether anyone wants to deviate. Credible threats (module 04) ask whether a punishment would be carried out. Repeated play (module 06) shows how the shadow of the future holds a cartel, or a chain, together. Coalitions ([module 10](/game-theory-lab/coalitions-sharing)) ask who joins whom, and auctions and mechanisms (module 11 and [module 12](/game-theory-lab/mechanism-design)) how rules shape what people report and pay. Mining (module 13) put them together.

Bitcoin is a game that has to stay an equilibrium, block after block, with no one in charge. Budish's equations are one way to price that, and the objections are reasons to think the price may be lower, or paid in other ways. Which of them holds is open: a set of hypotheses to test with numbers, not a conclusion to sell.

<!-- simulation -->

## Further reading

- Budish, E. (2025). Trust at scale: the economic limits of cryptocurrencies and blockchains. *Quarterly Journal of Economics* 140(1), 1–62. Sections III (the three equations, Theorems 1 and 2), IV (the double-spending attack, Proposition 3, Tables II and III) and V (specific capital and collapse). First version: The economic limits of Bitcoin and the blockchain, NBER Working Paper 24717 (2018).
- Carlsten, M., Kalodner, H., Weinberg, S. M. and Narayanan, A. (2016). On the instability of Bitcoin without the block reward. *ACM CCS 2016*, 154–167.
- Kroll, J. A., Davey, I. C. and Felten, E. W. (2013). The economics of Bitcoin mining, or Bitcoin in the presence of adversaries. *Workshop on the Economics of Information Security (WEIS 2013)*.
- Bonneau, J. (2016). Why buy when you can rent? Bribery attacks on Bitcoin-style consensus. *Financial Cryptography 2016 Workshops*, LNCS 9604, 19–26.
- Moroz, D. J., Aronoff, D. J., Narula, N. and Parkes, D. C. (2020). Double-spend counterattacks: threat of retaliation in proof-of-work systems. *Cryptoeconomic Systems 2020*; arXiv:2002.10736.
- Auer, R. (2019). Beyond the doomsday economics of "proof-of-work" in cryptocurrencies. BIS Working Paper 765.
- Huberman, G., Leshno, J. D. and Moallemi, C. (2021). Monopoly without a monopolist: an economic analysis of the Bitcoin payment system. *Review of Economic Studies* 88(6), 3011–3040.
- Nakamoto, S. (2008). Bitcoin: a peer-to-peer electronic cash system. Sections 6 (incentive) and 11 (calculations).
- Narayanan, A., Bonneau, J., Felten, E., Miller, A. and Goldfeder, S. (2016). *Bitcoin and Cryptocurrency Technologies*. Princeton University Press. Ch. 2 (2.3, consensus without identity: the double spend) and ch. 5 (5.5, mining incentives and strategies: bribery, Goldfinger).
