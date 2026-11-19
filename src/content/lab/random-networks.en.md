<!-- DRAFT: to be reviewed by Adriano -->

## Who is connected to whom

A rumour sweeps through a school in an afternoon; a virus crosses a continent or burns out in one village; a new block of Bitcoin transactions reaches thousands of computers within seconds. In each case the outcome depends less on the individuals than on the pattern of contacts between them: who is connected to whom. To reason about that pattern we need a language, and that language is the theory of networks.

## Graphs: the bare bones of a network

Mathematicians call a network a **graph**. The word has nothing to do with a chart of data: a graph is simply a set of **nodes** (also called vertices) joined by **edges** (also called links). Nodes can be people, computers, cities or proteins; an edge records that two of them interact.

Edges can be **undirected**, like a friendship, or **directed**, like a one-way street or "A follows B". They can also be **weighted**, carrying a number such as a distance or a cost.

A few words recur throughout the course:

- The **degree** of a node is the number of edges touching it.
- A **path** is a sequence of nodes, each linked to the next; a **cycle** is a path that returns to where it started.
- A graph is **connected** if a path exists between every pair of nodes. Otherwise it splits into **connected components**: maximal groups of nodes that can all reach each other.
- In a **complete graph** every pair of nodes is linked, so each of the n nodes has degree n − 1.

## The power of abstraction

Once a problem is stripped down to nodes and edges, very different questions turn out to be the same question. Finding the shortest drive between two towns is a shortest-path problem: towns are nodes, roads are edges weighted by their length.

Now take a chain of events, where each step from one state to the next happens with some probability p. Which chain from A to B is the most likely? Give each edge the length −log p. Since the logarithm turns products into sums, adding lengths along a path is the same as multiplying probabilities, and the shortest path is exactly the most probable chain. One algorithm, two worlds.

## The simplest random network

What does a "typical" network look like when nothing special shapes it? The cleanest answer is the **Erdős–Rényi model**, written G(n, p). Take n nodes. There are n(n − 1)/2 possible pairs; for each one, flip a biased coin and draw the edge with probability p, independently of all the others.

Each node has n − 1 potential partners, so its average number of links is

```math
⟨k⟩ = p · (n − 1)
```

For large n and moderate ⟨k⟩, the degree of a node follows approximately a **Poisson distribution** centred on ⟨k⟩. That distribution is narrow: almost every node has roughly the average number of links, and nodes with many times the average are so rare that they practically never occur. A random graph is democratic; it has no **hubs**.

> **Erdős and Rényi.** Paul Erdős (1913–1996) was a Hungarian mathematician who lived out of a suitcase, moving from colleague to colleague and writing papers with more than 500 co-authors; mathematicians still quote their "Erdős number", their co-authorship distance from him. With Alfréd Rényi he founded random graph theory in papers of 1959 and 1960. (Strictly, they fixed the number of edges; the coin-flip version is due to Edgar Gilbert, also in 1959. For large n the two agree.)

## Exploring a graph: breadth-first search

Which nodes can a given node reach? The standard tool is **breadth-first search** (BFS). Put the starting node in a queue and mark it. Then, repeatedly, take the node at the front of the queue and append its unmarked neighbours to the back, marking them. The search spreads outward in rings (neighbours, then neighbours of neighbours) until the queue is empty.

Each node enters the queue once and each edge is examined at most twice, so the cost is proportional to nodes plus edges. The marked nodes are exactly the connected component of the start; restarting from an unmarked node finds the next component, until all are found.

## Two phase transitions

Now imagine adding edges one at a time, at random, so that ⟨k⟩ grows slowly from zero. The network does not change gradually. It goes through two abrupt transitions.

**1. The giant component.** While ⟨k⟩ < 1, the graph is a dust of small fragments: isolated nodes, pairs, short chains, small trees. The largest piece is tiny compared with n. At ⟨k⟩ = 1 something qualitative happens: a **giant component** appears, and for ⟨k⟩ > 1 it holds a finite fraction S of all nodes. That fraction solves

```math
S = 1 − e^(−⟨k⟩·S)
```

The equation has a simple reading: a node lies outside the giant component only if none of its neighbours lies inside it, and with Poisson degrees that probability is `e^(−⟨k⟩·S)`. Below ⟨k⟩ = 1 the only solution is S = 0; above it, a positive solution appears and grows quickly towards 1.

**2. Full connectivity.** A giant component is not the whole network. Even when S is close to 1, a few nodes remain isolated because none of their coin flips came up heads. The last of them disappear only when ⟨k⟩ approaches ln n, that is, when

```math
p* ≈ ln(n) / n
```

This transition becomes sharper as n grows. If p = (ln n + c)/n, the probability that the whole graph is connected tends, for large n, to `exp(−e^(−c))`: almost zero for negative c, almost one for positive c, with a window of width of order 1/n in p.

These are **phase transitions**, mathematical cousins of water freezing or a magnet magnetising as it cools: a small change in one parameter changes the whole system qualitatively. The idea returns as percolation in Module 07 and as criticality in Module 08.

## Where the model falls short

G(n, p) is a baseline, not a portrait. Real social and technological networks are far more **clustered** (two of your friends are much more likely to know each other than two random people) and many contain **hubs**, nodes with vastly more links than average, which a Poisson distribution forbids. Modules 03 and 04 tackle these features.

## A Bitcoin connection

Bitcoin nodes form a peer-to-peer network in which each node opens a small number of outbound connections, on the order of ten, to peers chosen largely at random. Random-graph theory gives a yardstick: for tens of thousands of nodes, ln n is about 10, so a mean degree around ten is where a random network becomes connected. The peer network sits comfortably above that threshold, and since every node opens its own connections, none starts out isolated, which removes exactly the last obstacle to connectivity. That is one reason a new block can reach the whole network within seconds. The real network is not an Erdős–Rényi graph, but the model shows why a handful of random links per node is enough.

<!-- simulation -->

## What to observe

1. Set n = 200 and raise ⟨k⟩ slowly from 0.5 to 1.5. What happens to the orange cluster, and to the "largest component" fraction S, as you cross ⟨k⟩ = 1?
2. Switch to "Add edges gradually" and press Play. Watch how the giant component grows: mostly by swallowing small fragments, or by adding nodes one at a time?
3. Compare the simulated giant-component curves with the theoretical one. Where do they disagree, and why does the gap shrink for larger n?
4. With n = 100 and ⟨k⟩ = 3, count the isolated nodes. Why are isolated nodes the last obstacle to connectivity, even when the giant component already contains nearly everything?
5. Look at the connectivity experiment for n = 20, 100 and 500. Which curve is steepest, and how does each sit relative to its own ln n line?
6. Click a node outside the giant component and run BFS, then do the same from a node inside it. How does the number of levels compare with the number of nodes reached?

## Further reading

- P. Erdős and A. Rényi, "On random graphs I", *Publicationes Mathematicae Debrecen* 6 (1959) 290–297.
- P. Erdős and A. Rényi, "On the evolution of random graphs", *Publications of the Mathematical Institute of the Hungarian Academy of Sciences* 5 (1960) 17–61.
- A.-L. Barabási, *Network Science* (Cambridge University Press, 2016), chapter 3, free online at [networksciencebook.com](http://networksciencebook.com/).
- M. E. J. Newman, *Networks* (Oxford University Press, 2nd ed., 2018).
