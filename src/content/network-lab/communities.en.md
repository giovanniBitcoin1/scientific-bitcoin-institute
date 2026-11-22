<!-- DRAFT: to be reviewed by Adriano -->

## A club that split

From 1970 to 1972 the anthropologist Wayne Zachary followed a university karate club and recorded which of its 34 members spent time together outside the lessons (Zachary 1977). During that time a dispute between the instructor and one of the officers divided the club, and in the end it split in two. The friendships recorded before the split already contained it: drawn on paper, the network has two lobes, one around each leader.

Girvan and Newman (2002) used the club to test a method. They removed, one at a time, the link with the highest betweenness, the measure of [module 03](/network-lab/centrality) that counts how many shortest paths run along a link. Links between groups carry many paths, because every path from one group to the other must cross them, so they go first. When the network fell into two pieces, the pieces matched the two factions of the real split, with a single member misclassified.

Groups that are denser inside than between them are called **communities**. They are easy to see by eye and surprisingly hard to define: Fortunato (2010) reviews dozens of definitions and methods. This module follows the most used ones, and the ways they fail.

## Modularity

Newman and Girvan (2004) proposed a score for a partition of the nodes into groups. With L links in all, let L_c be the number of links inside group c and d_c the sum of the degrees of its nodes. Then

```math
Q = Σ_c [ L_c/L − (d_c/2L)² ]
```

The first term is the share of links that fall inside the groups. The second is the share that would fall inside them if the same degrees were wired at random: a link end lands in group c with probability d_c/2L, so both ends land there with probability (d_c/2L)². That null model is the configuration model of [module 05](/network-lab/heavy-tails-done-right), and the comparison is the one [module 02](/network-lab/what-are-we-measuring) insists on: not "many links inside", but "more than chance with the same degrees". Q is 0 when everything is one group, it can be negative, and it stays below 1.

```figure
split
```

On the karate club, with the factions as recorded in the repository's data, the factions give Q = 0.358. Search for the highest Q instead and the best partition known has four groups and Q = 0.4198 (exercise 4): the score prefers to cut each faction in two.

## Finding the maximum

The number of partitions grows faster than exponentially with the number of nodes, and Brandes and colleagues (2008) proved that finding the partition of highest Q is NP-hard: no method is known that does it quickly on every network. Practical methods look for a good partition rather than the best.

The most used is the method of Blondel, Guillaume, Lambiotte and Lefebvre (2008), known as **Louvain** after their university. Every node starts in a group of its own. Visiting the nodes in a random order, it moves each to the neighbouring group that raises Q most, and keeps going while any move raises it. Then it merges each group into a single node, keeping the links inside as a weight on that node, and repeats the moves on the smaller network. It stops when a round changes nothing. It is fast and usually reaches a high Q. It has a defect: a node that holds a group together can be moved out of it, leaving the rest in two pieces that are no longer linked to each other. Traag, Waltman and van Eck (2019) found that up to a quarter of the groups Louvain returned were badly connected inside, and up to 16% not connected at all; their **Leiden** method adds a step that guarantees connected groups.

**Label propagation** (Raghavan, Albert and Kumara 2007) is simpler still: every node starts with a label of its own and repeatedly takes the label most common among its neighbours, until no node wants to change. It uses no score at all, and sometimes lets a single label take over the whole network.

## Three warnings

**Random networks score high.** Guimerà, Sales-Pardo and Amaral (2004) showed that modularity can be large where no groups exist: in a sparse random network a partition into many pieces can always be found that puts far more links inside than chance would, because the search itself picks the lucky arrangement. In the first simulation Louvain finds Q = 0.52, 0.32, 0.23 at mean degree 4, 8 and 16 on random networks of 1,000 nodes. A high Q on its own proves nothing; it has to be compared with what the same method finds on randomised versions of the network.

**The resolution limit.** Fortunato and Barthélemy (2007) showed that modularity has a scale of its own. Take a ring of n cliques of s nodes, each clique joined to the next by a single link. Every clique is as obvious a group as one can draw. Yet merging neighbouring cliques in pairs raises Q as soon as n > s(s − 1) + 2 (exercise 2): the expected term is measured against the whole network, and once the network is large enough two cliques joined by one link look, to Q, more connected than chance allows. Groups smaller than about √(2L) links can be invisible.

```figure
ring
```

A **resolution parameter** γ (Reichardt and Bornholdt 2006) weights the expected term: Q_γ = Σ_c [L_c/L − γ (d_c/2L)²]. A larger γ favours smaller groups. In the second simulation a range of γ recovers the cliques, but γ is one more choice, and in a real network there is rarely a single γ that suits every group.

**A flat top.** Good, de Montjoye and Clauset (2010) showed that in many networks the highest values of Q are reached by a large number of very different partitions, all within a hair of the maximum. Running Louvain with different seeds then gives different answers of nearly equal score, and none of them has a special claim to be the communities of the network.

## A model instead of a score

Modularity asks whether a partition beats chance. A different approach asks how a network with groups could have been generated, and then which groups make the observed network most likely. The **stochastic block model** (Holland, Laskey and Leinhardt 1983) does this. Every node belongs to one of q groups, and two nodes are linked with a probability that depends only on their groups: a q × q table of probabilities. Fitting the model by maximum likelihood finds groups of any kind: dense inside, as communities, but also groups that avoid each other, or a core and a periphery. Real networks have hubs, and a plain block model would put all the hubs in one group just because they have many links; the degree-corrected version of Karrer and Newman (2011) gives each node its own propensity to form links, so that hubs can be hubs without forming a group of their own. How many groups to use can then be decided by statistical inference, weighing a better fit against a more complicated model, rather than by maximising a score that always rewards more structure.

## When groups cannot be found

A model also tells us when no method can succeed. Take two equal groups of N/2 nodes and link two nodes with probability c_in/N if they are in the same group and c_out/N if not. Each node then has on average c_in/2 links inside its group and c_out/2 across, and the mean degree is c̄ = (c_in + c_out)/2. Decelle, Krzakala, Moore and Zdeborová (2011) showed that in large sparse networks of this kind no method can place the nodes better than chance unless

```math
c_in − c_out > 2 √c̄
```

and for q equal groups the condition reads c_in − c_out > q √c̄. Below this **detectability threshold** the groups are there, built into how the network was made, but the links carry too little information about them. With c̄ = 3 the threshold is 2√3 ≈ 3.46. A network with c_in = 4.5 and c_out = 1.5, where 75% of every node's links stay inside its group, is below it (exercise 3).

In the third simulation the spectral method splits the nodes by the signs of the leading eigenvector of the modularity matrix. With c̄ = 10 and 4,000 nodes its overlap with the planted groups, 0 for chance and 1 for perfect, is 0.02 at 0.6 times the threshold and 0.93 at twice it. In a finite network the sharp limit is blurred, and this method needs some margin above it. Louvain on the same sparse networks finds many small groups with a high Q, whether or not the planted ones can be detected.

## Checking an answer

A method is tested on networks whose groups are known because they were planted. The benchmark of Girvan and Newman (2002) has 128 nodes in four groups of 32, mean degree 16, and k_out links per node to the other groups. In the first simulation Louvain recovers the groups almost perfectly at low k_out, with NMI 0.98 at k_out = 6 and 0.45 at k_out = 8. The LFR benchmark (Lancichinetti, Fortunato and Radicchi 2008) gives heavy-tailed degrees and group sizes, closer to real networks. Two partitions are compared with the **normalised mutual information** (NMI, Danon et al. 2005), 1 when they are the same up to the names of the groups and near 0 when one says nothing about the other.

One caution. The attributes recorded on the nodes, such as the factions of the club or the department of an employee, are not the true communities. Peel, Larremore and Clauset (2017) showed that a partition that disagrees with them is not thereby wrong: the network may be organised by something else, or by several things at once.

## Next

So far every link has counted the same. [Module 10](/network-lab/weights-flows-navigation) gives links weights and follows what moves along them: routes, flows and navigation.

<!-- simulation -->

## Further reading

- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Ch. 9.
- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press. Ch. 14.
- Latora, V., Nicosia, V. and Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Ch. 9.
- Easley, D. and Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Ch. 3.
- Zachary, W. W. (1977). An information flow model for conflict and fission in small groups. *Journal of Anthropological Research* 33, 452–473.
- Girvan, M. and Newman, M. E. J. (2002). Community structure in social and biological networks. *PNAS* 99, 7821–7826.
- Newman, M. E. J. and Girvan, M. (2004). Finding and evaluating community structure in networks. *Physical Review E* 69, 026113.
- Blondel, V. D., Guillaume, J.-L., Lambiotte, R. and Lefebvre, E. (2008). Fast unfolding of communities in large networks. *Journal of Statistical Mechanics* P10008.
- Traag, V. A., Waltman, L. and van Eck, N. J. (2019). From Louvain to Leiden: guaranteeing well-connected communities. *Scientific Reports* 9, 5233.
- Brandes, U., Delling, D., Gaertler, M., Görke, R., Hoefer, M., Nikoloski, Z. and Wagner, D. (2008). On modularity clustering. *IEEE Transactions on Knowledge and Data Engineering* 20, 172–188.
- Guimerà, R., Sales-Pardo, M. and Amaral, L. A. N. (2004). Modularity from fluctuations in random graphs and complex networks. *Physical Review E* 70, 025101.
- Fortunato, S. and Barthélemy, M. (2007). Resolution limit in community detection. *PNAS* 104, 36–41.
- Reichardt, J. and Bornholdt, S. (2006). Statistical mechanics of community detection. *Physical Review E* 74, 016110.
- Good, B. H., de Montjoye, Y.-A. and Clauset, A. (2010). Performance of modularity maximization in practical contexts. *Physical Review E* 81, 046106.
- Holland, P. W., Laskey, K. B. and Leinhardt, S. (1983). Stochastic blockmodels: first steps. *Social Networks* 5, 109–137.
- Karrer, B. and Newman, M. E. J. (2011). Stochastic blockmodels and community structure in networks. *Physical Review E* 83, 016107.
- Decelle, A., Krzakala, F., Moore, C. and Zdeborová, L. (2011). Asymptotic analysis of the stochastic block model for modular networks and its algorithmic applications. *Physical Review E* 84, 066106.
- Lancichinetti, A., Fortunato, S. and Radicchi, F. (2008). Benchmark graphs for testing community detection algorithms. *Physical Review E* 78, 046110.
- Danon, L., Díaz-Guilera, A., Duch, J. and Arenas, A. (2005). Comparing community structure identification. *Journal of Statistical Mechanics* P09008.
- Raghavan, U. N., Albert, R. and Kumara, S. (2007). Near linear time algorithm to detect community structures in large-scale networks. *Physical Review E* 76, 036106.
- Peel, L., Larremore, D. B. and Clauset, A. (2017). The ground truth about metadata and community detection in networks. *Science Advances* 3, e1602548.
- Fortunato, S. (2010). Community detection in graphs. *Physics Reports* 486, 75–174.
