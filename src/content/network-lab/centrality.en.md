<!-- DRAFT: to be reviewed by Adriano -->

## Florence, 1434

In 1434 Cosimo de' Medici returned from exile and took control of Florence, and his family kept it for most of the following three centuries. By the measures a contemporary would have used, the Medici were not the obvious winners. The families of the rival camp were older, and some of them, the Strozzi among them, are usually described as at least as rich and as well represented in the city's councils.

Padgett and Ansell (1993) looked instead at who had married whom. In the network of marriages among the leading families the Medici have six links, the Strozzi and the Guadagni four. That is a lead, not a dominance. The striking number is another one: take any two other families and trace the shortest chains of marriages that join them. The Medici lie on more than half of those chains, 52%. The next family, the Guadagni, is at 25%, the Strozzi at 10%.

The Medici were not much larger than their rivals. They were in a different position: between families that had no other way to reach one another. This module is about turning "position" into numbers, and about why there are several of them.

## Four questions

"Who matters here?" is not one question. Freeman (1979) separated three, and a fourth was already in the literature.

**How many links do you have?** The degree, k. It counts direct contacts and nothing else.

**How near are you to everyone?** Add up the distances from a node to all the others. The closeness is the number of others divided by that sum:

```math
C_i = (N − 1) / Σ_j d(i, j)
```

It is 1 for a node one step from everybody. If the network is in several pieces some distances are infinite and the formula breaks down; the harmonic version averages 1/d instead, counting an unreachable node as zero:

```math
H_i = (1 / (N − 1)) × Σ_j 1 / d(i, j)
```

**How often are you in between?** For every pair of other nodes, take the share of their shortest paths that pass through you, and add the shares up:

```math
B_i = Σ_(s,t) σ_st(i) / σ_st
```

Here σ_st is the number of shortest paths between s and t, and σ_st(i) the number of those through i. Dividing by the number of pairs, (N − 1)(N − 2)/2, gives a value between 0 and 1: the Medici's 0.52. Counting paths for every pair sounds slow, but an algorithm by Brandes (2001) does it with one search from each node.

**How well connected are your connections?** This is eigenvector centrality, and it needs a section of its own.

## Status from neighbours

Suppose a link to an important node is worth more than a link to an obscure one. Then a node's score should grow with the scores of its neighbours:

```math
x_i = (1/λ) × Σ_j A_ij x_j
```

The definition is circular, and the circle is what solves it. Give every node a score of 1. Replace each score by the sum of its neighbours' scores, rescale so that the largest is 1, and repeat. The scores stop moving, and where they stop is the leading eigenvector of the adjacency matrix; λ is its largest eigenvalue.

```figure
scores
```

The measure has two weaknesses. In a directed network, a node that nobody points to receives nothing, so its score is zero; and whoever is pointed to only by such nodes gets zero as well. Whole regions can go dark. And in a network with one very large hub the scores pile up on the hub and its neighbours, leaving almost nothing to tell the other nodes apart (Martin, Zhang and Newman 2014).

Katz (1953) had already proposed a remedy, long before the problem had a name: give every node a small score for free.

```math
x_i = α × Σ_j A_ij x_j + 1
```

The constant α sets how much the neighbours matter, and it must stay below 1/λ. When α is small the neighbours' scores hardly differ from 1, and the ranking is that of degree. When α approaches its limit the free score stops mattering, and the ranking is that of eigenvector centrality. In the karate club of module 01, Katz at one thousandth of the limit never reverses two members with different degrees, and at 0.999 of the limit its ranking is the eigenvector's. One dial runs from one measure to the other (Bonacich 1987 describes a family of this kind).

## The random surfer

On the web, eigenvector centrality has a further flaw: a link from a page that links to everything should not be worth much. Brin and Page (1998) let a page divide its score equally among the pages it points to. Their PageRank has a second reading. Imagine a surfer who clicks on a random link, page after page, for ever. The PageRank of a page is the share of time the surfer spends on it.

Two things can go wrong with the surfer. A page with no outgoing links is a dead end; by convention the surfer then jumps to a page chosen at random. And a group of pages that link only to one another is a trap: once inside, the surfer never leaves, and in the long run every page outside has score zero.

So the surfer gets bored. At each step it follows a link with probability α, and otherwise jumps to a random page:

```math
PR_i = (1 − α)/N + α × Σ_(j → i) PR_j / k_j^out
```

The original choice was α = 0.85: a jump every six or seven steps. The jump is not a detail: in the web of the second simulation, three pages that form a closed loop hold 44% of the PageRank at α = 0.85, and all of it at α = 1.

On an undirected network without jumps there are no traps, and the answer is one you know. The surfer is the walker of module 02, who visits each node in proportion to its links: PageRank is exactly k/2L. With α = 1, the new measure is degree.

## Hubs and authorities

Kleinberg (1999) noticed that on the web there are two ways of being important. Some pages are worth reading. Others are worth consulting because they point to the pages worth reading. He gave every page two scores: a good **authority** is pointed to by good hubs, and a good **hub** points to good authorities. Each score is defined through the other, and the same repeated sums find both. In an undirected network the two coincide with eigenvector centrality; it takes direction to pull them apart. A page nobody links to can be the best hub of all.

## The measures disagree

Krackhardt (1990) drew ten imaginary people in the shape of a kite to make one point.

```figure
kite
```

Diane has the most links, six. Fernando and Garth are the nearest to everyone, although they have fewer links than Diane. Heather has only three links, and lies between more pairs than anybody: every route to Ike and Jane passes through her. Three questions, three winners.

None of them is the right one. Borgatti (2005) put it this way: each measure assumes something about what flows through the network, and how. A parcel travels along a shortest path and is in one place at a time; that is the world of closeness and betweenness. A rumour, or an infection, spreads along every route at once and may come back; that is closer to the world of eigenvector centrality, Katz and PageRank, which count walks of every length. Before choosing a measure, ask what moves along the links.

The same reasoning works for systems that are not social. In a city, betweenness marks the streets that through traffic cannot avoid, and closeness the places that are near to everything; the same measures have been used to compare the street maps of real cities (Crucitti, Latora and Porta 2006).

## A ranking is a measurement too

Module 02 ended with a warning: a network dataset is a measurement. A ranking computed from it inherits every error. How much it moves depends on the measure, on the kind of error and on the network (Costenbader and Valente 2003; Borgatti, Carley and Krackhardt 2006).

The third simulation makes the comparison. On a scale-free network of 300 nodes with 20% of the links missing, degree and PageRank still find about nine of the true top ten, and closeness and eigenvector centrality about eight; the rank correlation with the truth is 0.84 for degree and 0.77 for eigenvector centrality. The hubs are hard to lose. On a small-world network of the same size, where no node stands out, the same error leaves a correlation of 0.48 for degree and 0.36 for eigenvector centrality, and between two and five of the top ten, depending on the measure. A ranking is only as stable as the differences it ranks.

There is no best measure in that table. Degree is robust because it is local; betweenness answers a question that degree cannot ask.

## What comes next

Centrality looks at one node at a time. Module 04 looks at three: triangles, the strength of weak ties, and the small patterns that networks are built from.

<!-- simulation -->

## Further reading

- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press. Ch. 7.
- Latora, V., Nicosia, V. and Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Ch. 2.
- Easley, D. and Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Ch. 14.
- Freeman, L. C. (1979). Centrality in social networks: conceptual clarification. *Social Networks* 1, 215–239.
- Padgett, J. F. and Ansell, C. K. (1993). Robust action and the rise of the Medici, 1400–1434. *American Journal of Sociology* 98, 1259–1319.
- Krackhardt, D. (1990). Assessing the political landscape: structure, cognition, and power in organizations. *Administrative Science Quarterly* 35, 342–369.
- Katz, L. (1953). A new status index derived from sociometric analysis. *Psychometrika* 18, 39–43.
- Bonacich, P. (1987). Power and centrality: a family of measures. *American Journal of Sociology* 92, 1170–1182.
- Brin, S. and Page, L. (1998). The anatomy of a large-scale hypertextual Web search engine. *Computer Networks and ISDN Systems* 30, 107–117.
- Kleinberg, J. M. (1999). Authoritative sources in a hyperlinked environment. *Journal of the ACM* 46, 604–632.
- Brandes, U. (2001). A faster algorithm for betweenness centrality. *Journal of Mathematical Sociology* 25, 163–177.
- Borgatti, S. P. (2005). Centrality and network flow. *Social Networks* 27, 55–71.
- Martin, T., Zhang, X. and Newman, M. E. J. (2014). Localization and centrality in networks. *Physical Review E* 90, 052808.
- Costenbader, E. and Valente, T. W. (2003). The stability of centrality measures when networks are sampled. *Social Networks* 25, 283–307.
- Borgatti, S. P., Carley, K. M. and Krackhardt, D. (2006). On the robustness of centrality measures under conditions of imperfect data. *Social Networks* 28, 124–136.
- Crucitti, P., Latora, V. and Porta, S. (2006). Centrality measures in spatial networks of urban streets. *Physical Review E* 73, 036125.
