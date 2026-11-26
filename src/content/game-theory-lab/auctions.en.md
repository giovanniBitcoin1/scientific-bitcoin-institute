<!-- DRAFT: to be reviewed by Adriano -->

## Four ways to sell one object

Parts I to III took the rules of a game as given and asked how to play it. Part IV turns the question around: someone chooses the rules, and the choice can be studied. Auctions are the oldest designed games. A seller with one object and several interested buyers can sell it in different ways, and each way is a different game.

In an **English auction** the price rises, called by the auctioneer or by the bidders, until only one bidder is left; she takes the object at the last price. In a **Dutch auction** a clock starts high and falls, and the first bidder to call out stops it and buys at that price. In a **sealed-bid auction** each bidder writes down a bid without seeing the others'; the highest bid wins and pays either its own amount (**first price**) or the second-highest bid (**second price**). The second-price auction was analysed by William Vickrey (1961), and it often bears his name.

We assume **private values**: each bidder knows what the object is worth to her, and of the others she knows only how their values are spread. An auction is then a game of incomplete information, a Bayesian game in the sense of [module 05](/game-theory-lab/incomplete-information-signalling): a strategy says what to bid for every possible value. The running example has two bidders whose values are independent and uniform between 0 and 100.

Two of the four formats are the others in disguise. In the Dutch auction the only thing a bidder decides is the price at which she would stop the clock if nobody has stopped it before, and she pays that price if she is first: a first-price sealed bid, written on a clock. In the English auction with private values a bidder stays in while the price is below her value and drops out when it reaches it. The auction ends when the last rival drops out, at that rival's value: the second-highest value, which is what a second-price auction charges when everyone bids her value.

## Telling the truth

In the second-price auction, bidding your value is a weakly dominant strategy. The reason is that your bid decides whether you win, never what you pay: the price is the highest of the other bids, h. Say your value is v. If you bid more than v, the extra changes the outcome only when h lies between v and your bid, and then you win and pay h, more than the object is worth to you. If you bid less than v, the change matters only when h lies between your bid and v, and then you lose a win that would have paid v − h. Bidding v is never worse than any other bid, whatever the others do. Figure F1 draws your payoff against your bid; under the first price the picture changes, because a win now costs your own bid.

```figure
truth
```

A bidder needs to know nothing about the others to bid well, which is rare in game theory. Online auction sites that let you enter a maximum and then bid for you, one step at a time up to that maximum, work like a second-price auction: the winner pays about the second-highest maximum (David Lucking-Reiley 2000).

## Shading

In the first-price auction, bidding your value guarantees a payoff of 0: when you win, you pay all the object is worth to you. So you bid less, and the question is how much less. A lower bid keeps more when it wins, but wins less often.

Take n bidders with values uniform between 0 and 100. In equilibrium each bids (n − 1)/n of her value: half with two bidders. With two bidders and a value of 80 you bid 40. The other bids half her value, so you win when her value is below 80, with probability 0.8, and your expected payoff is 0.8 × 40 = 32. Figure F2 draws the expected payoff of every bid when the others follow the equilibrium.

```figure
shading
```

A general rule stands behind the formula. In equilibrium a bidder bids what she expects the highest of the other values to be, given that it is below her own: whenever she wins, she pays on average what a second-price auction would have charged her. The more bidders, the closer the highest rival is likely to be, and the less room there is to shade: with ten bidders the bid is 90% of the value.

## Same revenue on average

Now the seller's question: which format earns more? With two bidders the second price earns the expected lower value, 33.33. The first price earns half the expected higher value, 66.67/2 = 33.33. The same.

This is no coincidence. **Revenue equivalence** (Vickrey 1961 in special cases; Roger Myerson 1981; John Riley and William Samuelson 1981) says that with independent private values and bidders who care only about their expected payoff, every auction that gives the object to the highest value and leaves nothing to a bidder with the lowest possible value earns the same on average. With n bidders and uniform values that is 100(n − 1)/(n + 1). The **all-pay auction**, in which everyone pays her bid and the highest bid wins, qualifies too: it is the contest of [module 02](/game-theory-lab/nash-equilibrium) in which the highest effort always wins, and it earns the same.

The averages agree; the risks do not. With two bidders the standard deviation of the revenue is 23.57 in the second-price auction, 11.79 in the first-price and 21.08 in the all-pay. The second price rests on the lower value alone, which can be anything; the first price on half the higher value, which varies less.

A **reserve price**, below which the seller keeps the object, raises the average: it loses the sales below the reserve, but makes the winner pay at least the reserve when the second value is lower. With uniform values the best reserve is 50, whatever the number of bidders (Myerson 1981; Riley and Samuelson 1981). With two bidders it earns 41.67 instead of 33.33, at the cost of no sale a quarter of the time, when both values are below 50. Yet one more bidder is worth more than the best reserve (Jeremy Bulow and Paul Klemperer 1996): three bidders and no reserve earn 50. Panel A runs thousands of auctions in each format.

## The winner's curse

Now change the object. An oil field holds the same oil whoever drills it: its value is **common**, the same for everyone, but nobody knows it, and each bidder has an estimate of her own. Edward Capen, Robert Clapp and William Campbell (1971), engineers in the oil industry, blamed the poor returns on offshore oil leases on what they called the **winner's curse**. Max Bazerman and William Samuelson (1983) showed it with jars of coins auctioned to MBA students: each jar held $8, the average estimate was $5.13, and yet the winning bid averaged $10.01.

A model. Each estimate is the value plus an error uniform within ±a. If everyone bids her estimate in a first-price auction, the winner is the bidder with the highest estimate, the one who overestimated the most. She overpays by a(n − 1)/(n + 1) on average: with a = 10, by 3.33 with two bidders, 6.67 with five, 8.18 with ten. The more bidders, the worse.

A careful bidder bids as if her estimate were the highest, since that is the only case in which her bid matters. Away from the ends of the range of values, the equilibrium bid is the estimate minus a in the first-price auction (John Kagel and Dan Levin 1986) and the estimate minus a(n − 2)/n in the second-price auction (Kagel, Levin and Ronald Harstad 1995). With common values the formats no longer earn the same: the second price earns more than the first, and the English auction, in which bidders see the others drop out and learn from it, at least as much as the second price (Paul Milgrom and Robert Weber 1982). Panel B auctions the jar of coins.

## Many units

Now the seller has k identical units and n bidders who want one each. In a **pay-your-bid** (discriminatory) auction the k highest bids win and each winner pays her own bid. In a **uniform-price** auction every winner pays the same price, the highest losing bid. With one unit per bidder the uniform price is the Vickrey auction again: your bid decides whether you win, the others' bids decide the price, and bidding your value is dominant. Under pay-your-bid bidders shade, as in the first-price auction. On average both earn 100 k(n − k)/(n + 1), revenue equivalence once more, and pay-your-bid is far less risky.

When bidders want several units, the uniform price loses its charm: a bid for a second unit can set the price paid for the first, so a bidder gains by asking for fewer units than she wants (**demand reduction**; Vijay Krishna, ch. 13). The question is practical: the US Treasury moved its auctions of government debt from pay-your-bid to a uniform price in 1998. Panel C sells the slots of a block.

```box
Block space: an auction every ten minutes
**What is sold.** Room in the next block: since SegWit (2017), at most 4 million weight units. Each transaction offers a fee, and miners fill the block with the highest fees per unit of weight. Bitcoin sells block space by pay-your-bid, many units at a time, about every ten minutes. Wallets estimate fees by guessing the others' bids, and a sender who bid too little can raise the bid by replacing the transaction (replace-by-fee).

**Fees as a queue.** Gur Huberman, Jacob Leshno and Ciamac Moallemi (2021) model fees as the price of priority in a queue: users who mind waiting pay more. When blocks have room, fees fall towards the minimum that nodes relay. A miner who asked for more would lose the transactions to the others, and entry is open, so fees come from congestion, not from any one miner's choice.

**Another rule.** Ron Lavi, Or Sattath and Aviv Zohar (2019) show that under pay-your-bid a bigger block can lower the miners' revenue. Their monopolistic price, in which every included transaction pays the lowest included fee and the miner chooses how many to include, keeps the revenue as the block grows, resists manipulation by the miner, and makes shading less useful as users grow (Andrew Chi-Chih Yao 2020).

**In Panel C.** With 20 users and 10 slots, pay-your-bid and the uniform price both raise 476.19 on average; with room for all 20, nothing. The monopolistic price raises about 547 with 10 slots and about 579 with 20, serving about 11 users and leaving 9 out.

**A hypothesis, not a description.** Here every user wants one slot and values are uniform; real transactions differ in size and in patience, and can wait for the next block. Whether the miner, who runs the auction, can be trusted is module 12's question.
```

## Next

Module 12: designing the rules, from the revelation principle to Myerson's lemma and the VCG mechanism, and whether an auctioneer who runs the auction for herself, a miner for instance, can be trusted.

<!-- simulation -->

## Further reading

- Krishna, V. (2010). *Auction Theory*, 2nd ed. Academic Press. Ch. 2–3 (private values, revenue equivalence), ch. 6 (interdependent values), ch. 12–13 (many units).
- Tadelis, S. (2013). *Game Theory: An Introduction*. Princeton University Press. Ch. 13 (auctions and competitive bidding).
- Shoham, Y. and Leyton-Brown, K. (2009). *Multiagent Systems*. Cambridge University Press. Ch. 11 (auctions).
- Roughgarden, T. (2016). *Twenty Lectures on Algorithmic Game Theory*. Cambridge University Press. Lecture 2 (mechanism design basics: single-item auctions).
- Vickrey, W. (1961). Counterspeculation, auctions, and competitive sealed tenders. *Journal of Finance* 16, 8–37.
- Myerson, R. B. (1981). Optimal auction design. *Mathematics of Operations Research* 6, 58–73.
- Riley, J. G. and Samuelson, W. F. (1981). Optimal auctions. *American Economic Review* 71, 381–392.
- Milgrom, P. R. and Weber, R. J. (1982). A theory of auctions and competitive bidding. *Econometrica* 50, 1089–1122.
- Bulow, J. and Klemperer, P. (1996). Auctions versus negotiations. *American Economic Review* 86, 180–194.
- Capen, E. C., Clapp, R. V. and Campbell, W. M. (1971). Competitive bidding in high-risk situations. *Journal of Petroleum Technology* 23, 641–653.
- Bazerman, M. H. and Samuelson, W. F. (1983). I won the auction but don't want the prize. *Journal of Conflict Resolution* 27, 618–634.
- Kagel, J. H. and Levin, D. (1986). The winner's curse and public information in common value auctions. *American Economic Review* 76, 894–920.
- Kagel, J. H., Levin, D. and Harstad, R. M. (1995). Comparative static effects of number of bidders and public information on behavior in second-price common value auctions. *International Journal of Game Theory* 24, 293–319.
- Lucking-Reiley, D. (2000). Vickrey auctions in practice: from nineteenth-century philately to twenty-first-century e-commerce. *Journal of Economic Perspectives* 14, 183–192.
- Huberman, G., Leshno, J. D. and Moallemi, C. (2021). Monopoly without a monopolist: an economic analysis of the Bitcoin payment system. *Review of Economic Studies* 88, 3011–3040.
- Lavi, R., Sattath, O. and Zohar, A. (2019). Redesigning Bitcoin's fee market. *The Web Conference (WWW 2019)*, 2950–2956.
- Yao, A. C.-C. (2020). An incentive analysis of some Bitcoin fee designs. *ICALP 2020*, LIPIcs 168, 1:1–1:12.
