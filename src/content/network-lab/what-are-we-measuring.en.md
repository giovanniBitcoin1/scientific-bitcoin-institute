<!-- DRAFT: to be reviewed by Adriano -->

## A map made by asking for directions

In the late 1990s nobody had a map of the Internet, so researchers drew one by asking for directions. A tool called traceroute reports the routers a packet crosses on its way to a destination. Run it from a few computers towards many destinations, join up the routes, and a network appears. Its degree distribution was heavy-tailed, with a few routers holding a large share of the links (Faloutsos, Faloutsos and Faloutsos 1999).

The result was real; what it meant was less clear. Lakhina and colleagues (2003) ran the same procedure on a computer-generated random network, which has no hubs at all, and the map that came back looked heavy-tailed. Achlioptas and colleagues (first in 2005, in full in 2009) proved why. A set of routes from one source is a shortest-path tree, and a tree shows almost every link close to its source and very few elsewhere. Nodes near the source appear with nearly all their links, distant ones with one or two.

The Internet may well be heavy-tailed. That measurement, alone, could not establish it. A network dataset is a measurement, and the way it was made leaves its mark on every number computed from it.

## Three decisions before the first number

Module 01 began with a choice: what the nodes and links stand for. Turning that choice into data takes three more decisions.

- **What counts as a node.** A person or a household, a router or a whole provider, an address or its owner.
- **What counts as a link.** Two people who phoned each other once, or at least five times? In one week, or in one year? Most links are a threshold set on a strength, inside a window of time.
- **Where the network ends.** One school, one city, one platform. Every link that crosses the boundary is cut.

None of these has a correct answer, but each changes the result. Move the threshold and the same contacts give a different network.

```figure
threshold
```

## Four ways to be wrong

Once the definitions are fixed, the data can still depart from them in four ways.

- **Missing links.** A friendship nobody mentioned, an interaction no experiment tested.
- **Spurious links.** A false positive in the laboratory, a call to a wrong number.
- **Split nodes.** One author under two spellings becomes two nodes, each with part of the links.
- **Merged nodes.** Two different people called "M. Rossi" become one node with the links of both.

The entity graph of module 01, built by guessing which addresses share an owner, is a network made entirely of decisions to merge.

A pair nobody measured is not a pair known to be unconnected. Most datasets record the links that were found, and silently treat everything else as absent.

The errors are not symmetric. In the small-world network of the first simulation, the average distance is 6.7 steps. Add 2% of spurious links between random pairs, and it falls to 6.0: each one is a shortcut, like those of [Complexity Lab module 03](/lab/small-worlds). Remove 2% of the true links instead, and it rises only to 6.8. Merged nodes do something worse: they create hubs that do not exist, and bridges between regions that have nothing to do with each other.

Current practice is to stop treating the data as the network. One writes a model of the measurement, with a rate of false positives and a rate of false negatives, and estimates the network together with those rates from repeated or independent observations (Butts 2003; Newman 2018). The result is a probability for each link, not a yes or a no.

## Sampling changes the answer

Even without errors, we rarely see a whole network. What a sample does to a number depends on how the sample was taken.

**Keep each node with probability p, with the links among the kept nodes.** A link survives only if both its ends do, so the average degree becomes p⟨k⟩. A triangle needs three surviving nodes, and so does a connected triple: both shrink by p³, and the transitivity, their ratio, is unchanged on average.

**Keep every node, and each link with probability q.** The average degree becomes q⟨k⟩. But now a triple has two links and survives with probability q², while a triangle has three and survives with q³:

```math
T_observed = q × T_true
```

Same fraction kept, different answer. A sample that keeps half of the nodes reports the true transitivity; a sample that keeps half of the links reports half of it.

**Sampling is percolation.** As nodes are removed at random, the large connected component shrinks and then falls apart. For a network with a given degree distribution this happens at

```math
p_c = ⟨k⟩ / (⟨k²⟩ − ⟨k⟩)
```

which for a random network is 1/⟨k⟩. Below `p_c` a sample is a dust of small pieces, and nothing about distances can be read from it. Hubs make ⟨k²⟩ large and `p_c` small: a network with hubs holds together under sparser sampling.

**The degree distribution is thinned.** If each node keeps each of its links with probability p, a node of degree k is left with a binomial number of them. A Poisson distribution stays a Poisson, with mean p⟨k⟩: the sample looks like a smaller copy of the truth. A power law does not. Its tail keeps its exponent, but the small degrees bend: with an exponent of 2.5 and p = 0.2, the slope between degrees 1 and 2 reads 3.2. A sample of a scale-free network does not have the same form as the network (Stumpf, Wiuf and May 2005).

```figure
thinning
```

## Following links finds hubs

Choose a link at random and look at the node at one of its ends. A node of degree k sits at the end of k links, so it is k times as likely to be found this way as a node of degree 1. The mean degree at the end of a random link is therefore

```math
⟨k²⟩ / ⟨k⟩ = ⟨k⟩ + variance / ⟨k⟩
```

which is never less than ⟨k⟩, and equal to it only when all degrees are the same. Your friends have, on average, more friends than you do (Feld 1991). There is nothing wrong with you: popular people are, by definition, on many lists of friends.

So every method that reaches nodes by following links over-represents hubs. A snowball sample starts from a seed and takes its neighbours, then theirs. A random walk moves from node to random neighbour, and in the long run it visits each node in proportion to its degree. The plain average of the degrees it meets converges to ⟨k²⟩/⟨k⟩, not to ⟨k⟩.

Because the bias is known, it can be undone. Weight each visit by 1/k, which amounts to taking the harmonic mean of the degrees met, and the estimate converges to ⟨k⟩. This is the idea behind respondent-driven sampling, used to study populations that have no list to sample from (Heckathorn 1997).

The bias is also a tool. Christakis and Fowler (2010) followed two groups of students through a flu outbreak at Harvard College in late 2009: students chosen at random, and friends named by them. The epidemic ran about two weeks ahead among the friends (13.9 days). And vaccinating a random friend of a random person protects a network far better than vaccinating the random person (Cohen, Havlin and ben-Avraham 2003): module 12 takes this up.

## Compared to what?

The karate club has transitivity 0.26. Is that high? A number means something only against a baseline, and a **null model** is a way to produce one: a family of random networks that share some features of the real one and are otherwise arbitrary.

**Null model 1: same N and L.** The links are placed on random pairs. Its transitivity is about the density, 0.14 for the karate club: the real value is nearly twice as large.

**Null model 2: same degrees.** Every node keeps its degree and only the wiring is randomised. Take two links, a–b and c–d, and swap their ends to get a–d and c–b; refuse the swap if it would create a self-link or a double link; repeat many times (Maslov and Sneppen 2002). A close relative, the **configuration model**, cuts every link in two and joins the ends at random, allowing self-links and repeated links (Molloy and Reed 1995).

The distance between observation and baseline is measured in standard deviations of the null model:

```math
z = (observed − null mean) / null standard deviation
```

Against the second null model, the transitivity of the karate club is no longer remarkable: the null mean is 0.22 and z is about 1.2. Its degrees, two hubs above all, already account for most of its triangles. Degrees alone explain a lot. A small network with a few hubs is even forced to be disassortative, since the hubs have hardly anyone to link to but low-degree nodes: with the karate club's degrees, a randomly wired network has assortativity −0.30.

The null model is a choice too, and with or without self-links, with labelled or unlabelled link ends, it gives different baselines (Fosdick et al. 2018). Module 04 uses it to find motifs.

## Four questions

Ask them of any number about a network.

1. How were the nodes and the links defined?
2. What could be missing, and what could be spurious?
3. How was the network sampled?
4. Compared to what?

## What comes next

With numbers we can trust, we can ask the first real question about a network: who matters in it. Module 03 is about centrality.

<!-- simulation -->

## Further reading

- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press. Ch. 9 and 12.
- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Ch. 4 (section 4.8).
- Latora, V., Nicosia, V. and Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Ch. 5.
- Faloutsos, M., Faloutsos, P. and Faloutsos, C. (1999). On power-law relationships of the Internet topology. *Computer Communication Review* 29(4), 251–262.
- Lakhina, A., Byers, J. W., Crovella, M. and Xie, P. (2003). Sampling biases in IP topology measurements. *IEEE INFOCOM 2003*, 332–341.
- Achlioptas, D., Clauset, A., Kempe, D. and Moore, C. (2009). On the bias of traceroute sampling. *Journal of the ACM* 56(4), 21.
- Stumpf, M. P. H., Wiuf, C. and May, R. M. (2005). Subnets of scale-free networks are not scale-free. *PNAS* 102, 4221–4224.
- Feld, S. L. (1991). Why your friends have more friends than you do. *American Journal of Sociology* 96, 1464–1477.
- Heckathorn, D. D. (1997). Respondent-driven sampling. *Social Problems* 44, 174–199.
- Christakis, N. A. and Fowler, J. H. (2010). Social network sensors for early detection of contagious outbreaks. *PLoS ONE* 5, e12948.
- Cohen, R., Havlin, S. and ben-Avraham, D. (2003). Efficient immunization strategies for computer networks and populations. *Physical Review Letters* 91, 247901.
- Maslov, S. and Sneppen, K. (2002). Specificity and stability in topology of protein networks. *Science* 296, 910–913.
- Molloy, M. and Reed, B. (1995). A critical point for random graphs with a given degree sequence. *Random Structures and Algorithms* 6, 161–180.
- Fosdick, B. K., Larremore, D. B., Nishimura, J. and Ugander, J. (2018). Configuring random graph models with fixed degree sequences. *SIAM Review* 60, 315–355.
- Newman, M. E. J. (2018). Network structure from rich but noisy data. *Nature Physics* 14, 542–545.
- Butts, C. T. (2003). Network inference, error, and informant (in)accuracy. *Social Networks* 25, 103–140.
