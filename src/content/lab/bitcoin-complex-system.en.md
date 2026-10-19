<!-- DRAFT: to be reviewed by Adriano -->

## A system with no one in charge

Bitcoin has no CEO, no headquarters and no central bank. Since its first block was mined on 3 January 2009 it has been kept running by tens of thousands of independent nodes, by miners competing for each new block, and by millions of users, none of whom can give orders to the others. Each follows a handful of local rules: check that a transaction is valid, relay it, build on the chain with the most work. Out of these rules come a shared ledger, a price and a market for block space.

This course has studied, one at a time, networks, cellular automata, criticality, agents, flocks, games and inequality. In Bitcoin they all appear at once. This last module looks at it through the toolkit we have built.

## What makes Bitcoin a complex adaptive system

Recall the ingredients from Module 01. There are **many heterogeneous agents**: users, holders, traders, miners, node operators, developers and exchanges, with very different goals, time horizons and resources.

They interact through **local rules**, the protocol, which every node enforces for itself. There is **no central control**: no participant can change the rules for the others, and a node that breaks them is simply ignored.

The interesting quantities are **emergent aggregates** that nobody sets: the price, the total hash rate, the level of fees, the degree of decentralisation. They are linked by **feedback loops**. A higher price raises mining revenue, which attracts more hash rate; more hash rate makes an attack more expensive, which can raise confidence, adoption and, in turn, the price. That loop is positive, and like every positive loop it can also run in reverse. Other loops are negative and stabilise the system, as we will see in a moment.

Finally, the system **adapts**. The software changes through upgrades that the network adopts or rejects, such as SegWit (2017) and Taproot (2021); miners move to cheaper electricity; users change their habits as fees rise and fall.

## Negative feedback in the protocol

The clearest feedback loop is written into the code. Every 2016 blocks, each node compares how long those blocks took with the intended two weeks, one block every ten minutes, and rescales the **difficulty** of the puzzle accordingly. If blocks came too fast, mining gets harder; if too slow, easier. To stop wild swings, the change at each adjustment is limited to a factor of four in either direction.

This is negative feedback of the kind a thermostat uses, with one important feature: it acts only once per period, on the average of the past two weeks. In mid-2021, when a large share of the world's hash rate went offline as mining was banned in China, blocks slowed down markedly. The next adjustments lowered the difficulty in large steps, the largest a drop of about 28%, until the ten-minute rhythm returned. Panel C lets you replay a shock of this kind and see why recovery takes more than one period.

## The issuance schedule

New bitcoins enter circulation as the **block subsidy** paid to the miner of each block. It started at 50 BTC and halves every 210,000 blocks, roughly every four years; since April 2024 it has been 3.125 BTC. Because the subsidy is a geometric series, the total supply approaches 21 million but never exceeds it; since amounts are counted in whole satoshi (a hundred-millionth of a bitcoin), it stops just short.

This is a fixed rule, not a decision: nobody votes on next year's issuance. As the subsidy shrinks towards zero, miners are paid more and more by transaction fees.

## How networks grow

New technologies tend to spread in a recognisable way. In 1962 the sociologist Everett Rogers described how innovations pass from innovators to early adopters, to the majority and finally to laggards, so that the cumulative number of adopters follows an **S-shaped curve**. In 1969 Frank Bass turned this into a model with two forces: some people adopt on their own, at a rate p, while others imitate those who already have, at a rate q proportional to how many there are. Early growth accelerates, then slows as the market saturates.

What is a network worth? In the 1980s Robert Metcalfe, a co-inventor of Ethernet, argued that the value of a communication network grows like the number of possible connections between its users, about n². This **Metcalfe's law** was later criticised as too optimistic: not every connection is equally valuable. In 2006 Bob Briscoe, Andrew Odlyzko and Benjamin Tilly proposed that value grows more like n log n. A common compromise is a generalised law, value ∝ n^k, with k left to be measured.

Put the two ideas together. If adoption grows as a power of time, n ∝ t^a, and value grows as a power of users, V ∝ n^k, then

```math
V ∝ (t^a)^k = t^(a·k)
```

and value is a straight line of slope a·k on log–log axes. This is the general logic behind the phrase "network adoption dynamics and generalised Metcalfe scaling". Panel B lets you play with it and see what happens when adoption saturates instead.

The Institute's preprint, *A Mechanistic Derivation of the Bitcoin Price Power Law: Network Adoption Dynamics and Generalised Metcalfe Scaling* (Santostasi & Perrenod), follows this route with measured exponents. As summarised on our [Publications page](/research/publications#preprint), the number of Bitcoin addresses with a non-zero balance grows as N(t) ∝ t^3.046, a cubic law that the authors relate to epidemic spreading on heterogeneous scale-free networks (Module 04), and price scales with that count as P ∝ N^1.838. Their composition, 3.046 × 1.838 ≈ 5.60, falls within 1.6% of the exponent measured directly on the price. For the derivation itself, read the paper.

## The power law in the data

Plot Bitcoin's price against the time elapsed since the genesis block, with logarithmic axes on both, and the long-run trend is close to a straight line: a power law in time, price ∝ t^β. The Institute's analysis gives **β = 5.69 ± 0.05**, with **R² = 0.961** over **5,696 daily observations** from July 2010 to February 2026. <!-- Reproduced with Coin Metrics daily PriceUSD: t = days since 2009-01-03 (genesis = day 0), OLS of log10 price on log10 t, 18 Jul 2010 – 28 Feb 2026 → β = 5.690, R² = 0.9613, N = 5,705 (published N 5,696). --> The convention is the simplest one: time t is counted in days since the genesis block of 3 January 2009, which is day 0, and the line is an ordinary least-squares fit of log price against log t. In Panel A you can fit such a line yourself, on the real daily prices, starting from the same window.

This is educational material, not investment advice. A good fit to past data does not guarantee future prices.

## How to read such a fit honestly

Module 04 taught that a straight line on log–log axes is where the argument starts, not where it ends. Here are the questions to ask.

**What kind of power law is it?** A power law in a time series, price as a function of time, is not a power-law distribution like the degree distributions of Module 04. Different tools apply.

**How stable is the exponent?** Move the start or the end of the fitting window and fit again. An exponent that wanders a lot is telling you that the line is not as straight as it looks, or that the early data weigh heavily.

**What do the residuals look like?** The deviations of the price from the line are large, often a factor of two or more, and **correlated in time**: if the price is above the trend today, it was almost certainly above it yesterday. This matters, because the textbook error bar of a least-squares fit assumes independent residuals, and five thousand correlated days carry far less information than five thousand independent ones. The day-to-day changes are also **heavy-tailed**, one of the "stylised facts" of Module 08. Note, too, that a high R² is easy to obtain for any series that grows by orders of magnitude; it does not by itself single out a power law.

**Does it predict?** Fit on data up to some date and check what happens afterwards. An out-of-sample test is much harder to pass than an in-sample fit.

**Against what alternative?** Compare the power law with other growth models on the same data: an exponential, which is a straight line on semi-log axes, or a saturating curve such as the logistic. Panel A shows the R² of an exponential fit on the same window.

The strength of a **mechanistic** model is that it does more than fit. It explains why the exponent takes the value it does and makes predictions that could fail: here, that the exponents of adoption and of value, measured separately, should multiply to the exponent of price.

## Open questions

These are the kind of questions SBI studies.

Do the fluctuations around the trend behave like **avalanches in a self-organized critical system** (Module 08), with bursts of all sizes and no characteristic scale, or are they better described in another way?

How **heterogeneous** and how **concentrated** is real ownership, once addresses are grouped into the entities that control them (Module 12)?

How robust are the peer network and the mining ecosystem to **correlated failures**, a region going offline or a large provider failing, as opposed to random ones (Modules 04 and 07)?

## The course in one sentence per thread

Feedback and nonlinearity (Module 01) are why small causes can have large effects and why prediction has limits. Random graphs, small worlds and scale-free networks (Modules 02–04) explain how a few random links per node connect a global network, and why hubs are a vulnerability to avoid. Cellular automata and the Game of Life (Modules 05–06) show complex behaviour, and persistent identity, emerging from simple deterministic rules. Fractals, percolation and criticality (Modules 07–08) describe thresholds, robustness and heavy tails. Agent-based models, flocks and games (Modules 09–11) show how aggregates, coordination and cooperation arise from local decisions and incentives. Inequality (Module 12) reminds us to ask what is being counted.

Complexity is not a single theory. It is a toolkit for systems where the whole behaves differently from its parts, and Bitcoin, open, global, fully recorded since its first day, is a remarkable laboratory in which to use it.

<!-- simulation -->

## What to observe

1. In Panel A, move the start of the fitting window forward by a few years. How much does β̂ move? Compare its change with the textbook error bar, and with the robust one in the note under the numbers.
2. Look at the residuals over time. Are they independent from one day to the next? What does the 1-day autocorrelation tell you about the textbook error bar?
3. Switch Panel A to semi-log axes. Why does the exponential fit, a straight line here, miss the data at both ends? Compare the two values of R².
4. In Panel B, switch adoption from a power law to an S-curve. What happens to the straight line, and to the local slope, as the ceiling is approached? Can you choose parameters for which the S-curve looks straight over a decade?
5. In Panel C, remove half of the hash rate with no recovery. How many adjustment periods pass before blocks return to ten minutes, and why is it not immediate? Then try an 80% drop: what does the ×4 limit do?
6. In Panel D, find the current subsidy and the share of the 21 million already issued. Roughly when will 99% have been issued?

## The course in one table

| Module | Idea | Where it shows up in Bitcoin |
|---|---|---|
| 01 Complex systems | feedback, nonlinearity, no one in charge | price, hash rate and security feed back on each other |
| 02 Random networks | connectivity threshold ln n / n | ~10 outbound peers keep the peer network connected |
| 03 Small worlds | short paths without clustering | peers spread across network groups; blocks cross the network in seconds |
| 04 Scale-free networks | hubs, power laws, honest fitting | no hubs by design; the price power law, tested with care |
| 05 Cellular automata | randomness from deterministic rules | SHA-256 and the avalanche effect |
| 06 Game of Life | persistent patterns | the ledger and its rules outlast every machine and participant |
| 07 Fractals and percolation | percolation threshold, q⟨k⟩ > 1 | resilience to random versus correlated node failures |
| 08 Self-organized criticality | heavy tails, no special cause | heavy-tailed returns and volatility clustering |
| 09 Agent-based models | jams from local rules | mempool congestion and sudden fee spikes |
| 10 Collective behaviour | stigmergy | miners extend the chain with the most work |
| 11 Cooperation | incentive design | honest mining as equilibrium, selfish mining as a limit |
| 12 Wealth and inequality | what is being counted | addresses versus entities |

## Further reading

- S. Nakamoto, "Bitcoin: A Peer-to-Peer Electronic Cash System" (2008).
- E. M. Rogers, *Diffusion of Innovations* (Free Press, New York, 1962).
- F. M. Bass, "A new product growth for model consumer durables", *Management Science* 15 (1969) 215–227.
- B. Briscoe, A. Odlyzko & B. Tilly, "Metcalfe's law is wrong", *IEEE Spectrum* 43(7) (2006) 34–39.
- R. Cont, "Empirical properties of asset returns: stylized facts and statistical issues", *Quantitative Finance* 1 (2001) 223–236.
- A. Narayanan, J. Bonneau, E. Felten, A. Miller & S. Goldfeder, *Bitcoin and Cryptocurrency Technologies* (Princeton University Press, 2016).
- G. Santostasi & S. Perrenod, "A Mechanistic Derivation of the Bitcoin Price Power Law: Network Adoption Dynamics and Generalised Metcalfe Scaling", Scientific Bitcoin Institute preprint (2026), DOI [10.5281/zenodo.19387099](https://doi.org/10.5281/zenodo.19387099); see our [Publications page](/research/publications#preprint).
