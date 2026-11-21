<!-- DRAFT: to be reviewed by Adriano -->

## One question, two answers

In 2019 Anna Broido and Aaron Clauset tested the degree distributions of nearly a thousand networks and concluded that scale-free networks are rare: only 4% gave the strongest evidence of a power law, and 52% the weakest. The same year Ivan Voitalov and colleagues answered that scale-free networks are not rare at all, provided the name is given to any distribution whose tail decays like a power law, whatever the rest of it does. Same kind of data, two verdicts, because the two groups asked different questions.

[Complexity Lab module 04](/lab/scale-free) introduced power laws, the CCDF and the maximum-likelihood estimate. This module builds on it, in two halves: what a heavy tail does to a network, and how to measure one. Throughout, γ is the degree exponent, `p_k ∝ k^(−γ)`; the CCDF then falls with exponent γ − 1.

## What the tail changes

For a power law the moment ⟨k^n⟩ is finite only if n < γ − 1. Between γ = 2 and γ = 3 the mean is finite and the second moment is not: in a real network it is a number that grows with the size of the network.

How large is the largest degree? Call k_max the degree beyond which we expect about one node in N. With `P(K ≥ k) = (k / k_min)^(−(γ−1))` this gives

```math
k_max = k_min · N^(1/(γ−1))
```

the **natural cutoff**. With N = 10⁶ and k_min = 1 it is 100 for γ = 4, 1,000 for γ = 3, 10,000 for γ = 2.5 and about 285,000 for γ = 2.1. A random network with the mean degree of the γ = 2.5 case, just under 2, would have a largest degree of about 12. Below γ = 2 the biggest hub would need more links than there are nodes: a large network without repeated links cannot have such a tail.

```figure
hub
```

Read backwards, the formula says how big a network must be to show its tail. To follow a power law over three decades of k takes N = 10^(3(γ−1)) nodes: a million at γ = 3, a billion at γ = 4. Many real networks are too small to show their tail, whatever it is.

## Ultra-small worlds

Hubs are shortcuts. In a random network with a given degree distribution the average distance grows like ln N when γ > 3, as in the small worlds of [Complexity Lab module 03](/lab/small-worlds); like ln N / ln ln N at γ = 3; and like ln ln N for 2 < γ < 3 (Chung and Lu 2002; Cohen and Havlin 2003). For N = 10⁹ the three expressions are 20.7, 6.8 and 3.0. They say how distances scale, not what the distances are. But the difference is real, and the first simulation shows it: from a hundred nodes to a hundred thousand, the average distance goes from 6.6 to 15.8 at γ = 4, and from 3.0 to 3.5 at γ = 2.2.

## A network with the degrees you want

To see what a degree distribution does, we need networks that have it and nothing else. Give node i exactly k_i half-links, then join the half-links in random pairs. This is the **configuration model**: the null model of module 02, used as a generator.

The pairing does not know that a network should be simple. It creates **self-links**, on average `(⟨k²⟩ − ⟨k⟩) / (2⟨k⟩)` of them, and **repeated links** between the same two nodes, about `((⟨k²⟩ − ⟨k⟩) / ⟨k⟩)² / 4`. When ⟨k²⟩ is finite these are a handful, whatever N. When γ < 3 their number grows with N, and removing them takes links away from the hubs. In the first simulation, with γ = 2.5 and 2,000 nodes, the largest node is dealt 315 half-links and keeps 243 links.

## Follow a link

A random node has k links with probability p_k. The node at the end of a random link is not a random node: it is reached in proportion to its degree. The probability that it has k *other* links is

```math
q_k = (k + 1) p_(k+1) / ⟨k⟩
```

This is the friendship paradox of module 02, now as a whole distribution. Its mean is (⟨k²⟩ − ⟨k⟩) / ⟨k⟩.

```figure
follow
```

Two generating functions keep the books: `G0(x) = Σ p_k x^k` for a random node, and `G1(x) = Σ q_k x^k = G0′(x) / ⟨k⟩` for the end of a link. Let u be the probability that a link does *not* lead to the giant component. For that, all the other links of the node it reaches must fail as well, each with probability u. So

```math
u = G1(u),    S = 1 − G0(u)
```

where S is the share of the nodes in the giant component. A solution with u < 1 exists when G1′(1) > 1, that is when

```math
⟨k²⟩ − 2⟨k⟩ > 0
```

(Molloy and Reed 1995). For a Poisson distribution G0 and G1 are the same function, and the pair collapses into S = 1 − e^(−⟨k⟩S), the equation of [Complexity Lab module 02](/lab/random-networks). For a pure power law starting at k = 1 a giant component exists only below γ = 3.4788 (Aiello, Chung and Lu 2000; Newman, Strogatz and Watts 2001). And for any tail with 2 < γ < 3 it always exists, because ⟨k²⟩ grows without bound. Module 11 turns this into robustness.

## Measuring a tail

So the exponent matters, and it has to be measured. The recipe of Clauset, Shalizi and Newman (2009), in the order in which it is used:

1. **Look** at the CCDF, not at a histogram. And never fit a straight line to a histogram on logarithmic axes: on 2,000 values drawn with γ = 2.5, the third simulation gets 1.49 that way.
2. **Choose where the tail starts.** A power law holds, at best, above some k_min. Take the k_min that minimises the Kolmogorov–Smirnov distance: the largest gap between the CCDF of the data above k_min and that of the fitted law.
3. **Estimate γ** by maximum likelihood on that tail. The standard error is about (γ − 1) / √n_tail, and n_tail may be a small part of the data.
4. **Test the fit.** Generate many synthetic data sets from the fitted model, fit each in the same way, and count how often they fit worse than the data. If that share, the p-value, is 0.1 or less, the power law is ruled out. A large p-value means "not ruled out", not "confirmed".
5. **Compare** with other candidates (a lognormal, an exponential, a power law with a cut-off) by likelihood ratio (Vuong 1989). With few data, several candidates usually survive.

Applied to twenty-four data sets that had been described as power laws, the recipe found some of them consistent with one and ruled the power law out for others; and where it passed, a rival such as the lognormal often could not be excluded.

The recipe has a blind spot. It is free to choose k_min, and it can retreat to a far tail so short that almost anything fits. In the third simulation 2,000 lognormal values pass the test with p = 0.86, on the last 202 of them. So read n_tail and the range of k before the p-value: a fit over a few dozen values, or over less than a decade of k, proves nothing.

There is another tradition. The Hill estimator (Hill 1975) looks only at the j largest values and asks how fast the tail decays, assuming nothing about the rest; plotted against j, it shows whether the answer is stable. Estimators of this kind are the ones Voitalov and colleagues use.

## Why the verdicts differ

Mechanisms rarely give pure power laws. The preferential-attachment model of Complexity Lab module 04 gives exactly

```math
p_k = 2m(m + 1) / (k (k + 1)(k + 2))
```

(Dorogovtsev, Mendes and Samukhin 2000): a power law with γ = 3 only for large k. That is why, on that page, the estimate with k_min = m comes out well below 3. Real networks have cut-offs: nodes age, links cost, capacity runs out (Amaral et al. 2000). And samples bend the small degrees (module 02).

So the useful question is seldom "is it exactly a power law?" but "how heavy is the tail, and over what range?". What a heavy tail does (hubs, short distances, a giant component that will not go away, and later epidemics) depends on ⟨k²⟩ / ⟨k⟩ at the actual N: a number that needs no fit. Report it, with the range of k.

```box
Two things called a power law
A **distribution** says how often values of each size occur: degrees, city sizes, the balances held by Bitcoin addresses, the degrees of Lightning nodes. The recipe of this module is for distributions.

A **scaling relation** says that one quantity is a power of another, `y ∝ x^β`: metabolic rate against body mass, Bitcoin's price against the time since the genesis block ([Complexity Lab module 13](/lab/bitcoin-complex-system)). There the data are one curve, ordered and correlated in time, and the recipe does not carry over as it stands. A test in the same spirit has been built for a power law in time (Santostasi and Perrenod 2026), and the precision of a fitted exponent depends on how the fluctuations around the trend are modelled (Pecere 2026). Both papers are listed under "Further reading" below, and more of the institute's work is on our [Publications page](/research/publications).
```

## What comes next

Module 06 asks where heavy tails come from.

<!-- simulation -->

## Further reading

- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Ch. 4.
- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press. Ch. 10 (section 10.4) and Ch. 12.
- Latora, V., Nicosia, V. and Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Ch. 5.
- Clauset, A., Shalizi, C. R. and Newman, M. E. J. (2009). Power-law distributions in empirical data. *SIAM Review* 51, 661–703.
- Broido, A. D. and Clauset, A. (2019). Scale-free networks are rare. *Nature Communications* 10, 1017.
- Voitalov, I., van der Hoorn, P., van der Hofstad, R. and Krioukov, D. (2019). Scale-free networks well done. *Physical Review Research* 1, 033034.
- Holme, P. (2019). Rare and everywhere: perspectives on scale-free networks. *Nature Communications* 10, 1016.
- Stumpf, M. P. H. and Porter, M. A. (2012). Critical truths about power laws. *Science* 335, 665–666.
- Cohen, R. and Havlin, S. (2003). Scale-free networks are ultrasmall. *Physical Review Letters* 90, 058701.
- Chung, F. and Lu, L. (2002). The average distances in random graphs with given expected degrees. *PNAS* 99, 15879–15882.
- Molloy, M. and Reed, B. (1995). A critical point for random graphs with a given degree sequence. *Random Structures and Algorithms* 6, 161–180.
- Aiello, W., Chung, F. and Lu, L. (2000). A random graph model for massive graphs. *Proceedings of the 32nd ACM Symposium on Theory of Computing*, 171–180.
- Newman, M. E. J., Strogatz, S. H. and Watts, D. J. (2001). Random graphs with arbitrary degree distributions and their applications. *Physical Review E* 64, 026118.
- Dorogovtsev, S. N., Mendes, J. F. F. and Samukhin, A. N. (2000). Structure of growing networks with preferential linking. *Physical Review Letters* 85, 4633–4636.
- Amaral, L. A. N., Scala, A., Barthélemy, M. and Stanley, H. E. (2000). Classes of small-world networks. *PNAS* 97, 11149–11152.
- Hill, B. M. (1975). A simple general approach to inference about the tail of a distribution. *Annals of Statistics* 3, 1163–1174.
- Vuong, Q. H. (1989). Likelihood ratio tests for model selection and non-nested hypotheses. *Econometrica* 57, 307–333.
- Santostasi, G. and Perrenod, S. (2026). A Clauset-in-spirit goodness-of-fit test for a power law in time: application to Bitcoin, 2010–2026. Zenodo. [doi.org/10.5281/zenodo.23105856](https://doi.org/10.5281/zenodo.23105856)
- Pecere, A. (2026). Bitcoin's power-law trend: what the regression identifies, and the four-year oscillation around it. Zenodo. [doi.org/10.5281/zenodo.23933138](https://doi.org/10.5281/zenodo.23933138)
