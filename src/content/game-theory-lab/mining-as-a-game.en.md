<!-- DRAFT: to be reviewed by Adriano -->

## A miner's four choices

[Module 12](/game-theory-lab/mechanism-design) asked how to write rules that the players want to follow. Bitcoin's protocol is such a set of rules, with an unusual feature: nobody runs it. There is no auctioneer who collects the reports and enforces the outcome. Each miner decides alone, on her own machines, what to do, and the rules hold only as long as following them serves her. In the language of module 12, the protocol is a mechanism with no designer at the controls.

Narayanan and his coauthors (2016, section 5.5) list four decisions that every miner makes, and the default that the reference implementation takes for each:

1. **Which transactions to include.** By default, every transaction that pays a fee above some minimum.
2. **Which block to build on.** By default, the end of the longest valid chain.
3. **Which of two blocks at the same height to follow.** By default, the one heard first.
4. **When to announce a block she has found.** By default, at once.

Each default can be changed with a few lines of code, and each change is another strategy. The first decision is the fee market of [module 11](/game-theory-lab/auctions) and of module 12's box. The second is where punitive and feather forking come in: threats to refuse a chain that contains certain transactions, examined in the box of [module 04](/game-theory-lab/sequential-games-commitment). This module is about the third and the fourth: what happens when a miner keeps a block to herself.

## Is following the protocol an equilibrium?

Joshua Kroll, Ian Davey and Edward Felten (2013) modelled mining as a game in which each miner chooses which block to extend. They showed that there is a Nash equilibrium in which every miner behaves as the reference implementation does, and also infinitely many others in which they behave otherwise. If everyone else extends the longest chain, extending it too is a best response; but if everyone followed some other rule, following them would be a best response as well. They explain the longest chain as a focal point, in the sense of [module 02](/game-theory-lab/nash-equilibrium), of a coordination problem that nobody negotiates.

Two limits of this result matter here. In their model a block cannot be kept secret: withholding is not among the strategies. And a Nash equilibrium speaks of one player at a time. It says that no one gains by deviating alone, given that the others follow the protocol. It does not say that every miner is too small to gain. A miner with a third of the hash rate is a single player, but a large one, and the question becomes whether her best response to an honest network is to be honest too.

## Hide and release

Ittay Eyal and Emin Gün Sirer (2014) found a deviation that pays for a large miner, and called it **selfish mining**. A miner with a share α of the hash rate keeps the blocks she finds secret and builds a private branch. While she is ahead, the others work on a chain she is about to replace. When they are about to catch up, she publishes enough of her branch to win. The honest miners waste work on blocks that end up orphaned, and her share of the chain that survives can be larger than her share of the work.

The strategy, which later authors call SM1, has four rules:

- With no lead, a block she finds stays secret: her lead is 1.
- If the others find a block while she leads by 1, she publishes hers, and two blocks of the same height compete: a **race**. A share γ of the honest miners build on her block, the rest on theirs, and the next block decides.
- If the others find a block while she leads by 2, she publishes both and wins: their block is orphaned.
- With a larger lead, each block the others find makes her publish one of hers; her lead falls by one, and their block will be orphaned when she wins.

Count one step for each block found, hers with probability α. Her lead is then a **Markov chain** on the states 0, 0′ (a race under way), 1, 2, 3 and so on, drawn in Figure F1. Its **stationary distribution**, the share of a long run spent in each state, has a closed form. From it come r_A and r_H, her blocks and the others' that end in the chain per block found, and her share of the chain, R = r_A/(r_A + r_H):

```math
R(α, γ) = [α(1 − α)²(4α + γ(1 − 2α)) − α³] / [1 − α(1 + (2 − α)α)]
```

```figure
chain
```

## When does it pay?

R is larger than α exactly when

```math
α > (1 − γ) / (3 − 2γ)
```

The threshold is a third if she loses every race (γ = 0), a quarter if she wins half of them (γ = 1/2), and zero if she wins them all (γ = 1): then a miner of any size gains. Figure F2 draws R against α for several γ. With α = 0.4 and γ = 0 her share is 0.4837, and 29.5 of every 100 blocks found are orphaned, 23.6 of them the others'. She loses blocks too, 5.9 of every 100, but the others lose four times as many.

```figure
threshold
```

Eyal and Sirer concluded that the Bitcoin protocol is not incentive compatible. Felten replied within days (7 November 2013) with a game-theoretic objection: a coalition of miners pooling their hash rate to do this would not hold together. Each member would gain by cheating on the others: mining with the group while it is ahead, and honestly otherwise ("fair-weather mining"). It is the logic of the cartel in [module 06](/game-theory-lab/repeated-games-reputation). A further point is ours, not Felten's: a share above α makes selfish mining a deviation that pays for a large miner against an honest network; it does not make it a dominant strategy, best whatever the others do. Module 06's box treated another kind of withholding, aimed at a rival pool rather than at the chain.

## The difficulty catches up

R is a share, not an income. Selfish mining orphans blocks, so the chain grows by only G = r_A + r_H blocks per block found: 43/61, about 0.705, at α = 0.4 and γ = 0. Bitcoin adjusts its difficulty every 2016 blocks, about two weeks, so that blocks come every ten minutes on average (Nakamoto 2008, section 4). Until the next adjustment, blocks are still found at one per ten minutes. The selfish miner earns r_A per ten minutes where honest mining would pay α: at α = 0.4 and γ = 0, 85.25% of the honest income, for 14/G = 19.86 days. Then the difficulty falls to match the slower chain, the chain grows at one block per ten minutes again, and her income becomes R per ten minutes: 120.93% of honest. She makes up the loss on day 33.86, when the two cumulative rewards meet (T₁ = 14/G is the day of the first adjustment):

```math
T_even = T₁ · (R − r_A) / (R − α)
```

Cyril Grunspan and Ricardo Pérez-Marco (2018) showed more: no strategy is more profitable than honest mining before a difficulty adjustment, so selfish mining is an attack on the adjustment rule, and the gain comes only after it. Panel B draws both expected rewards and one simulated path.

## The best deviation

SM1 is one strategy among many: the attacker could publish less, wait longer, give up later. Ayelet Sapirshtein, Yonatan Sompolinsky and Aviv Zohar (2016) wrote her problem as a **Markov decision process**. The state is (a, h, fork): a blocks on her private branch and h on the public one since they parted. The label fork says whether the last block was hers (*irrelevant*) or an honest one she could match now (*relevant*), or whether a race is under way (*active*). She has four actions: *adopt* (give up her branch and mine on theirs), *override* (publish h + 1 blocks and win, possible when a > h), *match* (publish h blocks and start a race) and *wait* (keep mining in private). Her objective, the share of the chain, is a ratio. They turn it into a family of ordinary average-reward problems: for a guess ρ, maximize (1 − ρ)·r_A − ρ·r_H. The best value is zero exactly when ρ is the best share, and a search on ρ finds it.

The best policy earns more than SM1. With γ = 0 their table gives 0.37077 at α = 0.35, against SM1's 0.3665, and it pays from about α = 0.329 instead of a third (our computation, truncated at 40 blocks: 0.3294). The best attacker does not give up as soon as she falls one block behind: one or two blocks behind she keeps mining in private, trying to catch up. When she wins some races she matches an honest block where SM1 would publish everything. From γ of about 0.2 on, the two thresholds coincide (a quarter at γ = 1/2), although above them the best policy still earns more. With delays in the network, they argue, the threshold disappears altogether: even small miners gain by deviating now and then.

## Why has it not been seen?

There is no public evidence of selfish mining on Bitcoin. The reasons below are hypotheses, not findings.

- **Size.** With γ near 0 it does not pay below about a third of the hash rate. Sapirshtein and his coauthors suggest that this may partly explain why it has not been observed.
- **Cost.** The first weeks cost money. At α = 0.4 an attacker earns 85.25% of the honest income for almost 20 days before any gain, and must trust that nothing changes in the meantime.
- **Visibility.** A jump in orphaned blocks would be noticed. Measured rates have been small: 0.41% of blocks were stale in February 2016 (Gervais and coauthors, 2016), while SM1 with α = 0.4 would orphan 29.5 of every 100 blocks found.
- **Pools and prices.** A pool that did it could lose its miners, who choose their pool ([module 10](/game-theory-lab/coalitions-sharing)), and it would hold coins whose value the attack puts at risk (module 14).

None of these settles the question; each says only that the payoffs in the model may not be the ones a real miner faces.

## Next

[Module 14](/game-theory-lab/capstone-the-price-of-security), the capstone: how much security costs, and who pays for it when the block reward falls.

<!-- simulation -->

## Further reading

- Narayanan, A., Bonneau, J., Felten, E., Miller, A. and Goldfeder, S. (2016). *Bitcoin and Cryptocurrency Technologies*. Princeton University Press. Ch. 5 (Bitcoin mining; 5.5, mining incentives and strategies).
- Nakamoto, S. (2008). Bitcoin: a peer-to-peer electronic cash system. Sections 4 (proof-of-work), 6 (incentive) and 11 (calculations).
- Kroll, J. A., Davey, I. C. and Felten, E. W. (2013). The economics of Bitcoin mining, or Bitcoin in the presence of adversaries. *Workshop on the Economics of Information Security (WEIS 2013)*.
- Eyal, I. and Sirer, E. G. (2014). Majority is not enough: Bitcoin mining is vulnerable. *Financial Cryptography 2014*, LNCS 8437, 436–454.
- Felten, E. W. (2013). Bitcoin isn't so broken after all. *Freedom to Tinker* (CITP, Princeton), 7 November 2013.
- Sapirshtein, A., Sompolinsky, Y. and Zohar, A. (2016). Optimal selfish mining strategies in Bitcoin. *Financial Cryptography 2016*, LNCS 9603 (2017), 515–532; arXiv:1507.06183.
- Grunspan, C. and Pérez-Marco, R. (2018). On profitability of selfish mining. arXiv:1805.08281 (preprint).
- Nayak, K., Kumar, S., Miller, A. and Shi, E. (2016). Stubborn mining: generalizing selfish mining and combining with an eclipse attack. *IEEE European Symposium on Security and Privacy (EuroS&P 2016)*, 305–320.
- Gervais, A., Karame, G. O., Wüst, K., Glykantzis, V., Ritzdorf, H. and Capkun, S. (2016). On the security and performance of proof of work blockchains. *ACM CCS 2016*, 3–16.
