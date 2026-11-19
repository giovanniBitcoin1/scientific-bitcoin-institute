<!-- DRAFT: to be reviewed by Adriano -->

## A curve, a number and a question

In the 1890s Vilfredo Pareto, whom we met in Module 04, studied tax records of incomes and property from several countries and found the same shape again and again: a heavy tail, in which the number of people above a given level falls like a power of that level. In 1905 the American economist Max Lorenz proposed a way to draw how unequal a distribution is, and in 1912 the Italian statistician Corrado Gini condensed that drawing into a single number.

How do inequalities this large arise? And can simple models of interacting agents, like those this course used for flocks and traffic, tell us anything about them?

## Measuring inequality

Line everybody up from poorest to richest. The **Lorenz curve** shows, for every x, the share of all wealth held by the poorest x% of people. If everybody held the same, the poorest 30% would hold 30%, and the curve would be the diagonal. In a real society the curve sags below the diagonal: the poorest half may hold only a few per cent of the total.

The **Gini coefficient** measures that sag. It is twice the area between the Lorenz curve and the diagonal, which makes it 0 for perfect equality and 1 when a single person owns everything. An equivalent definition: take two people at random, compute the average absolute difference between their wealth, and divide it by twice the mean.

```math
G = Σᵢ Σⱼ |xᵢ − xⱼ| / (2 n² x̄)
```

Easier to read are **top shares**, the fraction of the total held by the richest 1% or 10%.

Two warnings. First, **income** is a flow, what you earn in a year; **wealth** is a stock, what you own at a given moment. Wealth is almost always far more concentrated than income, partly because it accumulates over a lifetime. Second, a single number hides a lot: very different Lorenz curves, one with a large poor majority, another with a few extremely rich people at the top, can have the same Gini coefficient.

## Sugarscape

In 1996 Joshua Epstein and Robert Axtell built an artificial society, **Sugarscape**: a grid with two mountains of sugar that grows back after it is eaten. Each agent has a **vision**, how far it can see along the rows and columns of the grid, and a **metabolism**, how much sugar it burns at every step. At each step it moves to the richest free cell it can see, harvests it and pays its metabolism; if its stock falls below zero, it starves.

The rules are the same for everyone and the differences in endowment are modest, yet the distribution of accumulated sugar quickly becomes skewed. Agents who see far and burn little settle on the peaks and keep accumulating; others scrape by on the plains or die.

The shape depends on demography. If agents live for ever, only the efficient survive and keep piling up sugar. If they die of old age and are replaced by newcomers with fresh endowments, the population always mixes old and young, and the distribution acquires a long tail of agents who have had time to accumulate.

## Trades as collisions

In the 1990s some physicists began to ask what the simplest possible economy would look like, an approach that became known as **econophysics**. Picture agents as molecules of a gas, and each trade as a collision in which money changes hands while the total is conserved.

In 2000 Adrian Drăgulescu and Victor Yakovenko showed that if pairs of agents exchange random amounts of money, with no debt allowed, the distribution settles into an **exponential**, the Boltzmann–Gibbs law that describes energy among the molecules of a gas, with the average money per agent T in the role of temperature:

```math
P(m) = e^(−m/T) / T
```

An exponential distribution has a Gini coefficient of exactly ½, and the model gets there wherever it starts, even if everybody starts with the same amount. In the same year Anirban Chakraborti and Bikas Chakrabarti let each agent **save** a fixed fraction of its money in every trade. Saving narrows the distribution, which then looks more like a bell with a tail, and the Gini coefficient falls.

A different rule leads somewhere surprising. In the **yard-sale model**, popularised by the writer Brian Hayes in 2002, each trade moves a fraction of the **poorer** partner's wealth, and a fair coin decides who gains. Every trade is fair, with zero expected gain for both, yet wealth flows into fewer and fewer hands. The stakes are multiplicative: an agent who loses 10% and then wins 10% is left with 99% of what it had, while the rich, who stake only the poorer partner's amount, risk relatively little. In the long run one agent holds almost everything.

Bruce Boghosian and colleagues added a term that, at every step, moves each agent's wealth a small fraction of the way towards the mean. A term of this kind stops the full condensation, and the Gini coefficient settles at a stable value that depends on its strength. These are stylised models for isolating mechanisms, not descriptions of real economies.

## Multiplicative growth

In 1931 the French engineer Robert Gibrat proposed that fortunes, like firms, grow by **random proportional factors**: a good year adds a percentage, a bad year takes one away. Multiplying many random factors gives a lognormal distribution whose width grows for ever.

In 2000 Jean-Philippe Bouchaud and Marc Mézard combined random multiplicative growth with exchange between agents, which pulls each fortune a little towards the average. In their mean-field model the distribution of wealth relative to the mean becomes stationary with a Pareto tail, whose exponent depends on the strength J of the coupling and the volatility σ of the returns:

```math
α ≈ 1 + J / σ²
```

Strong coupling gives a thin tail; as it weakens, α approaches 1 and a handful of individuals can own a finite fraction of all wealth: **wealth condensation**.

A related point, stressed by Ole Peters in 2019: in a multiplicative process the average over many people can grow while the fortune of a typical individual shrinks over time. The process is **non-ergodic**: the average across a population is not what a single person experiences over time, and the mean is a poor guide to the typical case.

## Models and data

Measured top tails of income and wealth are often close to Pareto. The long historical series of top income shares compiled by Thomas Piketty and Emmanuel Saez in 2003 started a large debate about what drives inequality and what, if anything, should be done about it. Economists disagree about causes, about remedies and about trade-offs, for example between incentives and growth on the one hand and concentration on the other. This module does not try to settle that debate. The models above clarify mechanisms (exchange, multiplicative returns, heterogeneity, inheritance, life cycles), but they do not tell us which of them dominates in a given country or period.

## A Bitcoin connection: what is being counted?

It is often said that Bitcoin ownership is extremely concentrated. Such claims usually count **addresses**, but addresses are not people. A single exchange may hold the coins of millions of customers in a handful of addresses, while one person may use hundreds of addresses. Estimating the real distribution requires grouping addresses into entities, with large uncertainties. The lesson is the one that applies to every inequality statistic: before reading the number, ask what is being counted. Bitcoin's fixed supply schedule, finally, is a separate question from how its coins are distributed among people.

<!-- simulation -->

## What to observe

1. In Panel A, run Sugarscape for 200 steps with and without finite lifespans. How do the Gini coefficient and the top-10% share change? Compare the mean and the median.
2. In Panel B, run random exchange from equal wealth. Does the Gini coefficient approach ½? Switch to the log-y histogram: do the dots fall on a straight line?
3. Choose saving with λ = 0.5. Does the Gini coefficient go up or down? Try λ = 0.9.
4. Run the yard sale for a long time, with many trades per frame. What happens to the richest agent's share? Then switch on a small redistribution χ: does the Gini coefficient still climb?
5. In Panel C, set J = 0 and compare the mean and the median over time. Which of the two describes a typical agent?
6. With J > 0, wait for the tail to settle and compare the estimated exponent with 1 + J/σ². Then halve J: what happens to the tail?

## Further reading

- V. Pareto, *Cours d'économie politique* (Rouge, Lausanne, 1896–97).
- M. O. Lorenz, "Methods of measuring the concentration of wealth", *Publications of the American Statistical Association* 9 (1905) 209–219.
- C. Gini, *Variabilità e mutabilità* (Bologna, 1912).
- R. Gibrat, *Les inégalités économiques* (Sirey, Paris, 1931).
- J. M. Epstein & R. Axtell, *Growing Artificial Societies: Social Science from the Bottom Up* (MIT Press, 1996).
- A. Drăgulescu & V. M. Yakovenko, "Statistical mechanics of money", *European Physical Journal B* 17 (2000) 723–729.
- A. Chakraborti & B. K. Chakrabarti, "Statistical mechanics of money: how saving propensity affects its distribution", *European Physical Journal B* 17 (2000) 167–170.
- J.-P. Bouchaud & M. Mézard, "Wealth condensation in a simple model of economy", *Physica A* 282 (2000) 536–545.
- B. Hayes, "Follow the money", *American Scientist* 90 (2002) 400–405.
- T. Piketty & E. Saez, "Income inequality in the United States, 1913–1998", *Quarterly Journal of Economics* 118 (2003) 1–41.
- V. M. Yakovenko & J. B. Rosser, "Colloquium: Statistical mechanics of money, wealth, and income", *Reviews of Modern Physics* 81 (2009) 1703–1725.
- B. M. Boghosian et al., "Oligarchy as a phase transition: the effect of wealth-attained advantage in a Fokker–Planck description of asset exchange", *Physica A* 476 (2017) 15–37.
- O. Peters, "The ergodicity problem in economics", *Nature Physics* 15 (2019) 1216–1221.
