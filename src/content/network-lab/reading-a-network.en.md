<!-- DRAFT: to be reviewed by Adriano -->

## Seven bridges

In 1736 Königsberg, in Prussia, was spread over four pieces of land: the two banks of the river Pregel and two islands, joined by seven bridges. Was there a walk through the city that crossed every bridge exactly once? Nobody had found one, and nobody could say why.

Leonhard Euler settled the matter by throwing almost everything away. The length of the bridges, the shape of the islands, the route on dry land: none of it matters, only which pieces of land each bridge joins. Draw a dot for each land mass and a line for each bridge, and the city becomes four dots and seven lines.

A walk that passes through a land mass uses two bridges, one to arrive and one to leave. So every land mass must touch an even number of bridges, except possibly the two where the walk starts and ends: the walk exists only if the network is in one piece and has zero or two dots with an odd number of lines. Königsberg had four, with 5, 3, 3 and 3 bridges. The walk is impossible.

The city is now Kaliningrad, and five bridges stand on the old sites. The counts are 2, 2, 3 and 3: two odd ones, so today the walk exists, but it must start on one island and end on the other. A question about a city had become a question about a graph.

## Nodes and links are a choice

A **network**, or graph, is a set of **nodes** joined by **links**. We write N for the number of nodes and L for the number of links. Links may be **undirected**, like a bridge or a handshake, or **directed**, like a hyperlink or a payment.

Euler's first step is the easiest to overlook: he chose what the nodes and the links were. The system never dictates that choice: it can be drawn as several networks, which answer different questions. Before reading any number off a network, ask what its nodes and links stand for.

```box
One system, several networks
Bitcoin is at least five networks. The **peer-to-peer network**: computers and the connections between them (by default Bitcoin Core opens 8 full-relay and 2 block-relay-only outbound connections). The **transaction graph**: transactions, with a directed link whenever an output of one is spent as an input of another; nothing can be spent before it exists, so it has no cycles. The **address graph**: addresses, joined by directed, weighted payments. The **entity graph**: addresses grouped by heuristics into presumed owners, which makes it an inference, not an observation. The **Lightning Network**: nodes joined by payment channels, with capacities as weights. A statement about "the Bitcoin network" means little until we know which one.
```

## Degree

The **degree** `k_i` of node i is the number of links it has. Every link has two ends, so adding up all the degrees counts each link twice:

```math
k_1 + k_2 + … + k_N = 2L      so      ⟨k⟩ = 2L / N
```

where ⟨k⟩ is the **average degree**. One consequence is immediate: the sum of the degrees is even, so the number of nodes with an odd degree is always even. Euler's count could have come out as zero, two or four odd land masses, but never as one or three.

In a directed network each node has an **in-degree** `k_in`, the links arriving, and an **out-degree** `k_out`, the links leaving. Every link leaves one node and arrives at one, so the two averages coincide: `⟨k_in⟩ = ⟨k_out⟩ = L/N`.

The average hides most of the story: the **degree distribution** `p_k`, the fraction of nodes that have degree k, may be narrow or have a long tail of hubs.

## Three ways to write a network

A drawing is good for the eye and useless for a computer. There are three standard ways to store a network.

- The **adjacency matrix** A is an N × N table with `A_ij = 1` if i and j are linked and 0 otherwise. It is symmetric for an undirected network, and row i sums to `k_i`. Tidy for mathematics, but nearly all of its N² entries are zero.
- The **link list** is the list of the L pairs that are joined: the compact form in which data are usually published.
- The **adjacency list** gives, for each node, the list of its neighbours: what algorithms use, because the neighbours of i are found without searching.

```figure
three-ways
```

## Sparse

With N nodes, the largest possible number of links is one for every pair:

```math
L_max = N(N − 1) / 2
```

The **density** of a network is the fraction of them that exist:

```math
density = L / L_max = ⟨k⟩ / (N − 1)
```

Real networks are **sparse**: they have a tiny fraction of the links they could have.

| Network | N | L | ⟨k⟩ | Density |
|---|---|---|---|---|
| Florentine families (marriages) | 15 | 20 | 2.67 | 0.19 |
| Zachary's karate club | 34 | 78 | 4.59 | 0.14 |
| *C. elegans* neural network | 282 | ≈ 1,970 | 14 | 0.050 |
| Western US power grid | 4,941 | ≈ 6,600 | 2.67 | 5.4 × 10⁻⁴ |
| Film actors | 225,226 | ≈ 6.87 million | 61 | 2.7 × 10⁻⁴ |

*For the last three, N and ⟨k⟩ are those reported by Watts and Strogatz (1998), and L is N⟨k⟩/2.*

The reason is that degree is limited by something local: the time a person has for friends, the cost of a power line. As a network grows, ⟨k⟩ stays roughly where it was and the density falls like 1/N. The Florentine families and the power grid have the same average degree, 2.67, yet their densities differ by a factor of about 350. Density mostly measures size. To compare networks of different sizes, compare ⟨k⟩.

```box
Potential versus actual links
Metcalfe's law values a network by the links it could have, N(N − 1)/2, which grows like N². The links a real network actually has grow roughly like N. That gap is one reason why N² is usually read as an upper bound on a network's value and not as an estimate of it; Briscoe, Odlyzko and Tilly argued that N log N is closer.
```

```figure
sparse
```

## Paths and distance

A **path** is a sequence of nodes in which each is linked to the next; its length is the number of links it uses. A **shortest path** between two nodes is a path of the smallest possible length, and that length is their **distance** d.

Distances are found by **breadth-first search**: mark the neighbours of a starting node with distance 1, their unmarked neighbours with distance 2, and so on. The search spreads like a wavefront, and the step at which the front reaches a node is its distance.

Two numbers summarise the distances of a whole network: the **diameter**, which is the largest distance between any two nodes, and the **average distance** ⟨d⟩ over all pairs. That ⟨d⟩ is surprisingly small in most real networks is the small-world property, the subject of [Complexity Lab module 03](/lab/small-worlds).

The wavefront may stop before reaching everybody. The nodes it reaches form the **component** of the starting node, and a network with a single component is **connected**. Two nodes in different components have no path between them and their distance is infinite, which is why diameter and average distance are normally reported for the **largest component**.

In a directed network a path must follow the arrows, so a path from i to j may exist when none leads back. A set of nodes is **strongly connected** if every node can reach every other along the arrows, and **weakly connected** if that is true only once the directions are ignored.

## Triangles

If two of your friends are friends with each other, the three of you form a triangle. The **local clustering coefficient** measures how often this happens around a node. If node i has `k_i` neighbours, there are `k_i(k_i − 1)/2` pairs of them; if `e_i` of those pairs are linked,

```math
C_i = 2 e_i / (k_i (k_i − 1))
```

It runs from 0 to 1. There are two ways to turn it into one number for the whole network. The **average clustering** ⟨C⟩ is the mean of `C_i` over the nodes. The **transitivity** counts over the whole network at once:

```math
T = 3 × (number of triangles) / (number of connected triples)
```

where a connected triple is a node together with two of its neighbours. The factor 3 is there because every triangle contains three triples.

The two answer different questions. ⟨C⟩ gives every node one vote; T gives every triple one vote, and the hubs own most of the triples. Take a "windmill": n triangles that share one central node. Each of the 2n outer nodes has two neighbours, linked to each other, so its `C_i` is 1. The hub has 2n neighbours and only n links among them. Then

```math
⟨C⟩ = (2n + 1/(2n − 1)) / (2n + 1) → 1          T = 3 / (2n + 1) → 0
```

The same network is almost perfectly clustered by one measure and hardly clustered at all by the other. When a paper reports "the clustering coefficient", check which one it means.

## Weights and two kinds of nodes

Links are often not all equal: a road has a length, a friendship a frequency of contact. In a **weighted** network each link carries a number `w_ij`, and the **strength** of a node is the sum of the weights of its links, `s_i = Σ_j w_ij`.

Many networks have two kinds of nodes, with links only between one kind and the other: papers and their authors, films and their actors, transactions and the addresses they involve. These are **bipartite** networks. We often study a **projection** instead: keep one kind of node, and link two of them whenever they share a neighbour of the other kind, with a weight equal to the number of neighbours they share.

Projections are convenient, and they lose information. A paper with d authors becomes d(d − 1)/2 links: a hundred authors produce 4,950. And a projection cannot be undone: a triangle of three authors may be one paper written by all three, or three papers written in pairs.

## What comes next

These numbers are the alphabet of network science, and the rest of the course is written in it. But a number computed on a network is a measurement, and measurements can mislead. Module 02 asks when they can be trusted.

<!-- simulation -->

## Further reading

- Euler, L. (1741). Solutio problematis ad geometriam situs pertinentis. *Commentarii Academiae Scientiarum Petropolitanae* 8, 128–140.
- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Ch. 2.
- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press. Ch. 6.
- Latora, V., Nicosia, V. and Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Ch. 1.
- Easley, D. and Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Ch. 2.
- Watts, D. J. and Strogatz, S. H. (1998). Collective dynamics of "small-world" networks. *Nature* 393, 440–442.
- Zachary, W. W. (1977). An information flow model for conflict and fission in small groups. *Journal of Anthropological Research* 33, 452–473.
- Padgett, J. F. and Ansell, C. K. (1993). Robust action and the rise of the Medici, 1400–1434. *American Journal of Sociology* 98, 1259–1319.
- Briscoe, B., Odlyzko, A. and Tilly, B. (2006). Metcalfe's law is wrong. *IEEE Spectrum* 43(7), 34–39.
