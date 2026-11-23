<!-- DRAFT: to be reviewed by Adriano -->

## Links that carry something

Until now a link was either there or not. Real links carry different amounts: passengers between two airports, calls between two people, papers two scientists wrote together, funds in a payment channel. And what moves along them needs routes, meets limits, and often has to find its way knowing only what is nearby. This module takes the three in turn: weights, flows, navigation.

## Weights

Give each link a **weight** `w_ij`. The **strength** of a node is the total weight of its links:

```math
s_i = Σ_j w_ij
```

If weights had nothing to do with structure, strength would simply be proportional to degree. Barrat, Barthélemy, Pastor-Satorras and Vespignani (2004) found that in the world airport network it grows faster, `s ∝ k^β` with β = 1.5 ± 0.1: large airports have more routes and also busier ones. In a network of scientific collaborations they found strength proportional to degree. In the first simulation, weights that follow the degrees of the two ends give β = 1.45, and shuffling the same weights over the links brings it back to 1.01.

Strength says how much, not how it is spread. The **disparity** of a node does:

```math
Y_i = Σ_j (w_ij / s_i)²
```

With the weight spread evenly over k links, Y = 1/k; when one link carries almost all of it, Y is close to 1 (exercise 1).

```figure
strength
```

## The backbone

Often most of the weight sits on a few links, and a drawing of everything shows nothing. Keeping only the links above a fixed weight does not help: it wipes out every small node, whose links are all light on the scale of the whole network. The **disparity filter** of Serrano, Boguñá and Vespignani (2009) asks a local question instead: is this link a larger share of its node's strength than chance would give? Cut the strength of a node with k links into k pieces at random, and a given piece is at least a share p of the total with probability

```math
α_ij = (1 − p_ij)^(k − 1),   p_ij = w_ij / s_i
```

A link is kept when α_ij is below a chosen level for at least one of its two ends. What is left is the **backbone**. On the flights between US airports, at level 0.05, the filter kept 17% of the links, 66% of the airports and more than 80% of the passengers.

## Shortest paths with weights

In [module 01](/network-lab/reading-a-network) the shortest path was the one with the fewest links. When the weight of a link is a cost (a distance, a time, a fee), the best route is the one with the smallest sum, and it may have more links (exercise 2). Dijkstra (1959) showed how to find it: settle the nodes in order of their cost from the source, each time taking the cheapest one not yet settled. No later discovery can improve it, because costs are never negative.

When the weight is a strength, such as traffic or trust, it must first be turned into a cost. 1/w is a common choice but not the only one, and the choice changes the answer. Betweenness, which in [module 03](/network-lab/centrality) counted shortest paths, changes with it. In the first simulation, with the default weights, the cheapest route is longer than the shortest in 68% of the pairs, and the rankings of the nodes by betweenness with and without weights have a Spearman correlation of 0.66. Who is central depends on what the links carry.

## How much can flow

Now let each link have a **capacity**, the most it can carry, and ask how much can go from a source s to a sink t. A single route carries at most its narrowest link. Several routes together carry more, and the limit is set by a **cut**: a set of links whose removal separates s from t. Everything must cross the cut, so no flow exceeds the capacity of any cut. Ford and Fulkerson (1956), and in the same year Elias, Feinstein and Shannon, proved that the bound is reached: the **maximum flow** equals the capacity of the **minimum cut** (exercise 3).

```figure
flow
```

The methods that compute the maximum flow push it along one route after another, and let a later route undo part of an earlier one. Where the minimum cut falls shows where the bottleneck is; the links between the groups of [module 09](/network-lab/communities) are natural candidates.

```box
Lightning: a network of channels
Bitcoin's Lightning Network ([module 01](/network-lab/reading-a-network)) is a network of payment channels. A channel's capacity is public; its split between the two ends is private and changes with every payment. A payment needs a route on which every channel can forward the amount in the right direction: a flow problem under uncertainty, in which the sender learns the balances by trying. Splitting a payment over several routes (multi-part payments) helps, as max-flow min-cut suggests. Pickhardt and Richter (2021) treat every balance as uncertain and look for the flow most likely to succeed; Core Lightning has shipped an experimental plugin built on their method since version 23.08 (August 2023). Studies of the public graph found heavy-tailed degrees (Seres et al. 2020, a snapshot of January 2019) and funds concentrated in few nodes: between January 2018 and July 2019, on average, 10% of the nodes held 80% of the bitcoins (Lin et al. 2020). In the second simulation, a synthetic network, not Lightning data, a single route chosen blind fails half the time at 7% of the sender's balance; with every balance known, half the payments still succeed at 71%. See also [Complexity Lab module 13](/lab/bitcoin-complex-system).
```

## Finding the way

Travers and Milgram (1969) asked 296 people in Nebraska and Boston to get a folder to a stockbroker in Boston, passing it only to someone they knew personally. 217 sent it on and 64 folders arrived, through 5.2 intermediaries on average. Dodds, Muhamad and Watts (2003) repeated the experiment by e-mail with 18 targets in 13 countries: of 24,163 chains only 384 arrived, and the authors estimated a typical length of five to seven steps once the abandoned chains are accounted for. That short paths exist is no longer news. The surprise is that people find them, each knowing only their own contacts.

Kleinberg (2000) showed that short paths are not enough. Put the nodes on a square lattice, link each to its neighbours, and give each node one long-range contact, at lattice distance r with probability ∝ r^(−α). A message is passed **greedily**: each holder hands it to the contact closest to the target. Only at α = 2, the dimension of the lattice, does it arrive in a number of steps that grows like (log N)². For any other α, no rule that uses local knowledge alone can avoid a number of steps that grows like a power of the size. With α = 0 the long links are the random shortcuts of the small-world model ([Complexity Lab module 03](/lab/small-worlds)): they make paths short, but they give no sense of direction. With a large α they are too short to help. Short paths and findable paths are different things.

## What finite networks show

The theorem is about how the number of steps grows, and the third simulation shows how slowly that takes hold. On a torus of 100 × 100 nodes the mean number of steps is 21.3 at α = 0 and 22.8 at α = 2, and the lowest, 19.4, is at α = 1.25. At 400 × 400 the minimum has moved to α = 1.5, and α = 1.5 still beats 2 at 800 × 800, a size only the self-check runs: 85.5, 50.9 and 60.1 steps at α = 0, 1.5 and 2. What changes steadily is the ratio of α = 2 to α = 0: 1.10 at L = 50, 0.95 at L = 200, 0.70 at L = 800. The optimum creeps towards 2 only as the network grows by orders of magnitude.

Real networks are not lattices, yet many can be navigated. Among about 500,000 bloggers in the United States, Liben-Nowell and colleagues (2005) found that the probability of friendship falls as the inverse of rank, the number of people who live closer: a form that keeps greedy routing efficient where the population is uneven. Boguñá, Krioukov and claffy (2009) showed that heterogeneous degrees and strong clustering make a network navigable when its nodes lie in a hidden metric space.

## Next

Routes and flows assume that the links are there. [Module 11](/network-lab/robustness-and-cascades) removes them: failures, attacks and cascades.

<!-- simulation -->

## Further reading

- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Ch. 3 (small worlds).
- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press. Ch. 6 (weighted networks, cut sets) and 8 (shortest paths, maximum flow).
- Latora, V., Nicosia, V. and Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Ch. 10.
- Easley, D. and Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Ch. 20.
- Barrat, A., Barthélemy, M., Pastor-Satorras, R. and Vespignani, A. (2004). The architecture of complex weighted networks. *PNAS* 101, 3747–3752.
- Serrano, M. Á., Boguñá, M. and Vespignani, A. (2009). Extracting the multiscale backbone of complex weighted networks. *PNAS* 106, 6483–6488.
- Dijkstra, E. W. (1959). A note on two problems in connexion with graphs. *Numerische Mathematik* 1, 269–271.
- Ford, L. R. and Fulkerson, D. R. (1956). Maximal flow through a network. *Canadian Journal of Mathematics* 8, 399–404.
- Elias, P., Feinstein, A. and Shannon, C. E. (1956). A note on the maximum flow through a network. *IRE Transactions on Information Theory* 2, 117–119.
- Travers, J. and Milgram, S. (1969). An experimental study of the small world problem. *Sociometry* 32, 425–443.
- Dodds, P. S., Muhamad, R. and Watts, D. J. (2003). An experimental study of search in global social networks. *Science* 301, 827–829.
- Kleinberg, J. M. (2000). Navigation in a small world. *Nature* 406, 845.
- Kleinberg, J. (2000). The small-world phenomenon: an algorithmic perspective. *Proceedings of the 32nd ACM Symposium on Theory of Computing*, 163–170.
- Boguñá, M., Krioukov, D. and claffy, k. c. (2009). Navigability of complex networks. *Nature Physics* 5, 74–80.
- Liben-Nowell, D., Novak, J., Kumar, R., Raghavan, P. and Tomkins, A. (2005). Geographic routing in social networks. *PNAS* 102, 11623–11628.
- Poon, J. and Dryja, T. (2016). The Bitcoin Lightning Network: scalable off-chain instant payments. White paper, draft version 0.5.9.2, 14 January 2016.
- Pickhardt, R. and Richter, S. (2021). Optimally reliable & cheap payment flows on the Lightning Network. arXiv:2107.05322.
- Lin, J.-H., Primicerio, K., Squartini, T., Decker, C. and Tessone, C. J. (2020). Lightning Network: a second path towards centralisation of the Bitcoin economy. *New Journal of Physics* 22, 083022.
- Seres, I. A., Gulyás, L., Nagy, D. A. and Burcsi, P. (2020). Topological analysis of Bitcoin's Lightning Network. In *Mathematical Research for Blockchain Economy*, Springer, 1–12.
