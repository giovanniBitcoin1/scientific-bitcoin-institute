<!-- DRAFT: to be reviewed by Adriano -->

## A network that only grows

A heavy tail needs a cause. [Complexity Lab module 04](/lab/scale-free) gave one: a network that grows, where each newcomer links to existing nodes in proportion to their degree, ends with p_k ∝ k^(−3), while the same growth with uniform choices gives an exponential tail. It also told the history, from Yule and Simon to Merton. Here we ask how general the result is, how the rule can be measured, how it can arise when nobody counts links, and what it decides. Tails are measured with the recipe of [module 05](/network-lab/heavy-tails-done-right).

Citations were the first network studied this way. In 1965 Derek de Solla Price looked at the papers that cite one another and found that, for large n, the number of papers cited n times falls off as an inverse power of n: like n^(−2.5) or n^(−3), he wrote, without choosing between the two. In 1976 he proposed a mechanism. Each new paper cites c earlier ones, and an earlier paper is chosen with probability proportional to q + a, where q is the number of citations it already has. The constant a gives a paper a chance before its first citation. The in-degree distribution then has a power-law tail with exponent

```math
α = 2 + a / c
```

Ignore the direction of the links and the undirected Barabási–Albert model appears as the case a = c = m (exercise 2). An offset can also be added to the undirected model: with an attachment rate Π(k) ∝ k + A, where A is called the **initial attractiveness**, the degree exponent becomes

```math
γ = 3 + A / m
```

(Dorogovtsev, Mendes and Samukhin 2000). A ranges from just above −m upwards, so γ can be anything from 2 up. "Growth plus preferential attachment" does not predict γ = 3. It predicts a family, and 3 is one member of it.

## Age is destiny, on average

In the linear model, treat a node's degree as a smooth quantity growing at the average rate: this is the **mean-field** approximation. At time t there are about 2mt link ends, so node i gains links at the rate m k_i / (2mt) = k_i / (2t), and starting from m at its birth time t_i,

```math
k_i(t) = m (t / t_i)^(1/2)
```

The oldest nodes are the largest, and the spread of birth times alone produces the tail: nodes born before t (m/k)² have more than k links, which gives P(K > k) = (m/k)² and p_k ≈ 2m²/k³ (exercise 1). Price's model makes the same prediction for papers, and Newman (2009) found it in the citation record: in fields that started at a known date, the first papers collected far more citations than later ones, by about as much as the model says. Among 2,407 papers on network science, the first tenth to appear had collected 101 citations each on average, the next tenth 26 and the most recent tenth 0.08. He called it the **first-mover advantage**.

But "on average" matters. Over 100 networks of 10,000 nodes with m = 2, the node born at step 100 ends with about 19 links on average, close to the mean-field 20, with a standard deviation of about 12. Early birth gives an advantage, not a guarantee.

## How fast do the rich get richer?

Why linear? Replace k by k^α, an **attachment kernel** with an exponent (Krapivsky, Redner and Leyvraz 2000). Below α = 1 there are no hubs: the degree distribution is a **stretched exponential**, and the largest degree grows only like a power of ln t. At α = 1 it is a power law. Above α = 1 the advantage feeds on itself: in the limit of a large network one node ends up linked to almost all the others, and above α = 2 all but a finite number of nodes link to it. The **winner takes all**. With α = 1.5 and 5,000 nodes, the first simulation's biggest hub is linked to 84% of them. A pure power law needs the kernel to be exactly linear, a knife edge between two very different worlds.

```figure
rich
```

A hub with 100 links among 1,000 nodes with 2 links each takes 4.8% of the next link when α = 1, which is its fair share. At α = 1.5 it takes 26%, at α = 2 it takes 71%, and the gap widens with every link it gains.

## Measuring the kernel

The kernel can be measured from two **snapshots** of a growing network. For each degree k at the first snapshot, count the links that the old nodes of degree k gained in between and divide by the number of such nodes. The result, links gained per node, estimates Π(k) up to a constant (Jeong, Néda and Barabási 2003; Newman 2001).

```figure
snapshots
```

Π(k) is noisy, because few nodes share any large degree. The usual practice is to sum it, κ(k) = Σ_(k′ ≤ k) Π(k′), and fit κ on log axes: if Π ∝ k^α the slope of κ is α + 1. Measured this way, Jeong and colleagues found α close to 1 for citations (0.95) and for the Internet (1.05), and below it for the collaborations of film actors (0.81) and of neuroscientists (0.79); Newman found 1.04 for co-authorship in biomedicine and 0.89 in physics.

The third simulation adds a caution from our own networks, grown with α = 1 exactly. Fitted from the smallest degree up to the largest degree that at least ten nodes share, the cumulative slope gives α = 0.99 on average over 20 networks; fitted over every degree that occurs, 0.62. Where most degrees do not occur at all, κ stops growing between the few that do. The size of the bias depends on where the sum starts and on the range fitted. Maximum likelihood avoids the sums: each new link chose its target among the old nodes with probability k^α / Σ_j k_j^α, with the degrees of the first snapshot, and the most probable α gives 1.01 ± 0.02 on the same networks.

## Preferential attachment without a plan

No web page, author or protein computes degrees. Yet local rules produce Π ∝ k.

- **Link selection.** Pick a link at random and attach to one of its two ends. A node with k links is at the end of k of them: it is reached in proportion to its degree, which is module 05's "follow a link" again.
- **Copying** (Kleinberg et al. 1999; Kumar et al. 2000). A new web page picks an existing page at random; with probability p it links to that page, otherwise it copies one of that page's links. A page with q incoming links gains a new one at a rate proportional to q + mp/(1 − p): Price's model, with exponent (2 − p)/(1 − p) (exercise 4).
- **Random walks.** Start at a random node, walk ℓ steps along the links, attach where the walk ends (Saramäki and Kaski 2004; in an earlier rule of Vázquez 2003 the newcomer links to the nodes along the walk). A walker that has wandered long enough sits on a node in proportion to its degree. The second simulation uses the simplest version, a fresh walk for every link, and after a single step the walker is not there yet: a one-step walk measures a kernel of 1.25, above linear, and builds a hub linked to a quarter of the network.
- **Gene duplication.** A duplicated gene inherits the protein partners of the original: copying again (Pastor-Satorras, Smith and Solé 2003; Vázquez et al. 2003).

## Or with a plan

Fabrikant, Koutsoupias and Papadimitriou (2002) gave hubs a different origin. Nodes arrive one at a time at random points of a square. Each links to the one existing node j that minimises δ × d + h_j, where d is the distance between them and h_j is the number of hops from j to the first node, the root. When δ is small, distance hardly matters and every node links to the root: they proved that below δ = 1/√2 the network is a star, wherever the root is (our root sits at the centre of the square, and the star lasts a little longer). When δ is of the order of √N or more, every node links to a nearby node and the degrees fall off exponentially. In between they proved that the tail is heavy, and called it a power law. Berger and colleagues (2003) looked closer: in that regime almost all the nodes are leaves with a single link, many hubs share the top, and a power law can hold, at best, for a vanishing fraction of the nodes.

Chance and optimisation can both produce preferential attachment, and in the second simulation optimisation even measures a kernel above 1. A heavy tail does not tell you which of the two was at work.

## Rerun history

The first simulation reruns the same model twenty times, with α = 1 and 5,000 nodes. The twenty degree distributions lie on top of one another. The biggest hub is one of the first ten nodes in 18 runs out of 20, but which one changes from run to run, and the node that leads when the network has 500 nodes is still the leader at the end in 16 runs. The law fixes the shape and gives the old a head start; it does not name the winner.

Salganik, Dodds and Watts (2006) ran this experiment with people. In MusicLab about 14,000 participants could download 48 songs by unknown bands. They were split into nine "worlds" that never met: in eight of them people could see how many times each song had been downloaded by the others in their world, in the ninth they saw no counts at all. Social influence made success more unequal, and less predictable: the same song could do very well in one world and poorly in another. The shape is a law; the names are history.

## What comes next

Here every node was the same, and only its birth date and luck set it apart. Module 07 gives nodes a quality of their own, and lets a latecomer win.

<!-- simulation -->

## Further reading

- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Ch. 5.
- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press. Ch. 13.
- Latora, V., Nicosia, V. and Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Ch. 6.
- Easley, D. and Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Ch. 18.
- Price, D. J. de S. (1965). Networks of scientific papers. *Science* 149, 510–515.
- Price, D. de S. (1976). A general theory of bibliometric and other cumulative advantage processes. *Journal of the American Society for Information Science* 27, 292–306.
- Dorogovtsev, S. N., Mendes, J. F. F. and Samukhin, A. N. (2000). Structure of growing networks with preferential linking. *Physical Review Letters* 85, 4633–4636.
- Krapivsky, P. L., Redner, S. and Leyvraz, F. (2000). Connectivity of growing random networks. *Physical Review Letters* 85, 4629–4632.
- Jeong, H., Néda, Z. and Barabási, A.-L. (2003). Measuring preferential attachment in evolving networks. *Europhysics Letters* 61, 567–572.
- Newman, M. E. J. (2001). Clustering and preferential attachment in growing networks. *Physical Review E* 64, 025102.
- Kleinberg, J. M., Kumar, R., Raghavan, P., Rajagopalan, S. and Tomkins, A. S. (1999). The Web as a graph: measurements, models, and methods. *Computing and Combinatorics (COCOON 1999)*, Lecture Notes in Computer Science 1627, 1–17.
- Kumar, R., Raghavan, P., Rajagopalan, S., Sivakumar, D., Tomkins, A. and Upfal, E. (2000). Stochastic models for the Web graph. *Proceedings of the 41st IEEE Symposium on Foundations of Computer Science*, 57–65.
- Vázquez, A. (2003). Growing network with local rules: preferential attachment, clustering hierarchy, and degree correlations. *Physical Review E* 67, 056104.
- Saramäki, J. and Kaski, K. (2004). Scale-free networks generated by random walkers. *Physica A* 341, 80–86.
- Pastor-Satorras, R., Smith, E. and Solé, R. V. (2003). Evolving protein interaction networks through gene duplication. *Journal of Theoretical Biology* 222, 199–210.
- Vázquez, A., Flammini, A., Maritan, A. and Vespignani, A. (2003). Modeling of protein interaction networks. *ComPlexUs* 1, 38–44.
- Fabrikant, A., Koutsoupias, E. and Papadimitriou, C. H. (2002). Heuristically optimized trade-offs: a new paradigm for power laws in the Internet. *Automata, Languages and Programming (ICALP 2002)*, Lecture Notes in Computer Science 2380, 110–122.
- Berger, N., Bollobás, B., Borgs, C., Chayes, J. and Riordan, O. (2003). Degree distribution of the FKP network model. *Automata, Languages and Programming (ICALP 2003)*, Lecture Notes in Computer Science 2719, 725–738.
- D'Souza, R. M., Borgs, C., Chayes, J. T., Berger, N. and Kleinberg, R. D. (2007). Emergence of tempered preferential attachment from optimization. *PNAS* 104, 6112–6117.
- Newman, M. E. J. (2009). The first-mover advantage in scientific publication. *Europhysics Letters* 86, 68001.
- Salganik, M. J., Dodds, P. S. and Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. *Science* 311, 854–856.
