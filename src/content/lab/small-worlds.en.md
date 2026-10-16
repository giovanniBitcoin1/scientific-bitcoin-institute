<!-- DRAFT: to be reviewed by Adriano -->

## A chain of acquaintances

How many handshakes separate you from a fisherman in Chile? The idea that the answer is surprisingly small is older than the internet. In 1929 the Hungarian writer Frigyes Karinthy published a short story, "Chains", in which a character bets that he can reach any person on Earth through at most five acquaintances.

In the 1960s the psychologist Stanley Milgram turned the bet into an experiment. He gave letters to volunteers in Nebraska and asked them to get each one to a stockbroker near Boston whom they had never met. Each letter could only be passed to someone the sender knew on first-name terms who seemed a step closer to the target. Of the chains that reached him, the typical number of intermediaries was about five or six. The phrase "six degrees of separation" came later, but the number came from here.

The result deserves some caution. Most letters never arrived, and later critics asked how general a conclusion a few dozen completed chains could support. Yet when Peter Dodds, Roby Muhamad and Duncan Watts repeated the experiment by e-mail in 2003, with tens of thousands of senders and targets in many countries, the chains that did arrive were again short, about five to seven steps.

## The puzzle

Why should this be surprising? Because our social world is local. Most of our friends live or work near us, and many of them know each other. If every person knows only a neighbourhood, a message must cross the world neighbourhood by neighbourhood, and the chain should be very long. It is not.

Two numbers make the puzzle precise.

- The **clustering coefficient** C. For one node, look at all pairs of its neighbours and count the fraction of pairs that are themselves linked; in a friendship network, it is the probability that two of your friends know each other. C is the average over all nodes.
- The **average path length** L: the number of steps on the shortest path between two nodes, averaged over all pairs.

## Two extremes

Start with a **ring lattice**: n nodes on a circle, each linked to its k nearest neighbours, k/2 on each side. Neighbours of a node are also close to each other, so clustering is high:

```math
C = 3(k − 2) / (4(k − 1))
```

which approaches 3/4 as k grows. But distances are long: to reach the opposite side of the ring you advance at most k/2 places per step, so L ≈ n/(2k). With a thousand nodes and ten links each, that is about fifty steps.

At the other extreme is a **random graph** with the same n and k (Module 02). The number of nodes within d steps multiplies by roughly k at each step, so everybody is reached after about

```math
L ≈ ln n / ln k
```

steps: three for our thousand nodes. But two neighbours of a node are linked only by chance, so C ≈ k/n, almost nothing.

Real social networks have both a high C, like the lattice, and a small L, like the random graph. Neither model describes them.

## Watts and Strogatz: a few shortcuts

In 1998 Duncan Watts and Steven Strogatz proposed a bridge between the two. Start from the ring lattice. Visit each edge in turn and, with probability p, detach its far end and reattach it to a node chosen at random. At p = 0 nothing changes; at p = 1 almost every edge is random.

What happens in between is the surprise. With only about one percent of the edges rewired, L has already fallen almost to its random-graph value, while C is still close to that of the lattice. Over a wide range of p, the network is a **small world**: as clustered as a lattice and as short as a random graph.

The reason is an asymmetry. A single shortcut joining two distant parts of the ring shortens the paths of a great many pairs at once: everyone near one end is now close to everyone near the other. Its effect is global. Its damage to clustering is local: it removes one edge from a tightly knit neighbourhood, and only a few triangles disappear. So L collapses long before C notices.

They found the same signature in three very different real networks: film actors linked by appearing in the same film, the power grid of the western United States, and the neural network of the worm *C. elegans*.

## Measuring path lengths

How do we compute L? In an unweighted network, the breadth-first search of Module 02 already does the job: launched from one node, it reaches the others in rings of increasing distance, and the ring in which a node first appears is its distance. Running BFS from every node gives all the shortest paths. When edges carry lengths, such as kilometres of road, Edsger Dijkstra's algorithm of 1959 generalises the idea by always expanding the closest node not yet settled.

The cost of all-pairs BFS grows roughly like n × (n + number of edges). Trivial for a few hundred nodes, heavy for millions: large networks are usually measured by running the search from a random sample of nodes and averaging.

## What kind of explanation is this?

Nobody's friendships form a rewired ring. The model is deliberately unrealistic, and that is its strength: it isolates the one ingredient needed for short paths in a clustered world. You need local structure plus a few long-range ties, and nothing else. The sociologist Mark Granovetter had made a related point in 1973 in "The strength of weak ties": casual acquaintances, who move in circles different from ours, are the bridges through which news and job offers travel.

There is a subtlety. That short paths *exist* does not mean people can *find* them. Milgram's senders knew only their own contacts. In 2000 Jon Kleinberg showed that such decentralised search works efficiently only when long-range links follow a particular distribution of distances, neither too local nor too uniform. Social networks seem to be organised in roughly this way; a randomly rewired ring is not.

## A Bitcoin connection

The Bitcoin peer network is deliberately built to look more like a random graph than a social network. When a node chooses its outbound peers, it spreads them across different parts of the IP address space and avoids having several outbound peers in the same network group. The aim is security: an attacker who controlled all of a node's connections could feed it a false view of the blockchain. This "eclipse attack" was described by Ethan Heilman, Alison Kendler, Aviv Zohar and Sharon Goldberg in 2015. Low clustering costs the network almost nothing, because what matters for spreading transactions and blocks is short paths. With thousands of nodes and around ten random links each, ln n / ln k gives only a handful of hops between any two nodes, which is why a new block can cross the whole network in seconds.

<!-- simulation -->

## What to observe

1. With p = 0, click a node and then the node opposite it on the ring. How many steps apart are they? Now set p = 0.01 and repeat with the same two nodes.
2. In the Watts–Strogatz experiment, find the range of p where C/C₀ is still above 0.8 but L/L₀ is already below 0.3. How many decades of p does it span?
3. Switch to "Rewire one by one" and press Play. Which drops faster in the mini-chart, L or C?
4. Why does the first shortcut matter more than the hundredth? Step through the first few rewirings and watch L/L₀ after each.
5. Compare L at p = 1 with the random-graph reference ln n / ln k, and C with k/n. How close are they, and how does the agreement change with n?
6. Look at the "degrees of separation" chart at p = 0 and at p = 0.05. How does the shape of the distribution change, not just its average?

## Further reading

- S. Milgram, "The small world problem", *Psychology Today* 1 (1967) 61–67.
- J. Travers and S. Milgram, "An experimental study of the small world problem", *Sociometry* 32 (1969) 425–443.
- M. Granovetter, "The strength of weak ties", *American Journal of Sociology* 78 (1973) 1360–1380.
- D. J. Watts and S. H. Strogatz, "Collective dynamics of 'small-world' networks", *Nature* 393 (1998) 440–442.
- J. Kleinberg, "Navigation in a small world", *Nature* 406 (2000) 845.
- P. S. Dodds, R. Muhamad and D. J. Watts, "An experimental study of search in global social networks", *Science* 301 (2003) 827–829.
- E. Heilman, A. Kendler, A. Zohar and S. Goldberg, "Eclipse attacks on Bitcoin's peer-to-peer network", *USENIX Security Symposium* (2015).
