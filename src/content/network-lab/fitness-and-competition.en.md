<!-- DRAFT: to be reviewed by Adriano -->

## The latecomer

In [module 06](/network-lab/growth-mechanisms) birth order set the rank, and a node born late could only hope for luck. Real networks do not always behave this way. Barabási tells the story of the Web search engines in his textbook: by the late nineties AltaVista and Inktomi, early starters, dominated the market, yet Google, a latecomer, soon became the leading search engine, and by 2000 it was also the biggest hub of the Web. On a larger scale, Kong, Sarshar and Roychowdhury (2008) followed millions of Web pages for a year and found that in slightly less than half of the cases where one page outgrew another, the winner was the younger, more "talented" one.

Bianconi and Barabási (2001) added the missing ingredient. Each node i gets a **fitness** η_i, a fixed number that stands for its quality: how useful a page is, how good a paper is. A newcomer links to node i with probability proportional to η_i k_i. Degree still helps; quality multiplies it.

## The fit get rich

In the mean-field picture of module 06, a node of fitness η born at time t_i grows as

```math
k_i(t) = m (t / t_i)^(η_i / C)
```

The exponent is no longer 1/2 for everyone: it is proportional to the node's fitness. The constant C follows from the requirement that the links add up, and it depends only on the distribution ρ(η) of the fitness:

```math
∫ ρ(η) η / (C − η) dη = 1
```

If every node has the same fitness, η = 1, the condition reads 1/(C − 1) = 1, so C = 2, the exponent is 1/2 and γ = 3: module 06 again. If fitness is uniform between 0 and 1, the condition becomes C ln(C/(C − 1)) = 2, whose solution is C = 1.255 (exercise 1). The degree distribution then falls like k^(−2.255) divided by ln k: a power law with a logarithmic correction.

Two nodes born far apart: when does the fitter latecomer overtake? Set the two growth laws equal. The constants m and C cancel, and the answer depends only on the birth times and the fitnesses:

```math
ln t* = (η₂ ln t₂ − η₁ ln t₁) / (η₂ − η₁)
```

```figure
race
```

An incumbent born first with fitness 0.5 is overtaken by a latecomer of fitness 1 born at step 1,000 only when the network has 10⁶ nodes. If the incumbent's fitness is 0.8, the date moves to 10¹⁵ (exercise 2). Small gaps in quality take astronomically long to close, because the latecomer's advantage is in the exponent, and the incumbent's head start is in the logarithm of time.

The first simulation shows the consequence. With fitness uniform on [0, 1] and 10,000 nodes, over 20 runs the final leader was never the fittest node: between 169 and 2,302 nodes were fitter than it. In 17 runs it was one of the ten oldest nodes. The winner is an early node of high fitness, which combines both advantages; the fittest node of all, usually born late, has no time to show what it is worth. In run 1 the leader is the 6th node, fitness 0.95, with 764 links; the 79th node, of fitness 1.00, has 135.

## Reading fitness from growth

Take logarithms of the growth law: ln k_i grows like (η_i/C) ln t. The slope of a node's history on log axes measures its fitness, up to the constant C. Kong, Sarshar and Roychowdhury did exactly this for the Web. They used 13 monthly crawls, from June 2006 to June 2007, each holding more than 22 million pages, and measured how fast each page gained incoming links. The fitness distribution came out exponential, with little spread. Their conclusion: most of the large differences in degree on the Web come from growth amplifying modest differences in quality.

On the networks of the first simulation the same reading works on average and is noisy node by node. For the nodes born before step 100 in networks of 20,000 nodes, the slope divided by η/C is 1.00 on average over ten networks, and the correlation between the two is 0.80.

Citations need one more ingredient, because papers age. Wang, Song and Barabási (2013) describe the citation history of a paper by three numbers: a fitness λ, an immediacy μ that sets when the citations peak, and a longevity σ that sets how fast they fade. In their model the total number of citations a paper will ever collect is m(e^λ − 1), with m = 30: it depends on the fitness alone.

Both studies needed histories. A snapshot of a network shows that a node has many links; it cannot say whether the node is old or good. A history can.

## When the winner takes all

Bianconi and Barabási (2001) then mapped the model onto a gas of bosons. Each node becomes an energy level, ε = −ln η in suitable units, so the fittest nodes sit lowest. Each link becomes particles on the levels of the two nodes it joins; the figure below follows their own diagrams and shows only the particle on the level of the node the link points to. A new node adds a level, and its links add particles.

```figure
energy
```

The equation for C is the condition that the particles fit in the levels. If

```math
∫ ρ(η) η / (η_max − η) dη < 1
```

it has no solution, and the leftover particles pile up on the lowest level, as in a Bose–Einstein condensate: the fittest node keeps a finite share of all the links, however large the network grows. The network becomes a hub with spokes instead of a hierarchy of hubs. Bianconi and Barabási offered the persistence of Microsoft in the market for operating systems as a possible example.

A clean case: one node of fitness 1 and all the others uniform between 0 and b. The integral is I(b) = −1 − ln(1 − b)/b. Below b ≈ 0.797 it is less than 1, and the fittest node keeps a share 1 − I of the links: 0.614 for b = 0.5 (exercise 3). In the second simulation, with b = 0.5 and 20,000 nodes, the mean over ten runs is 0.622. With b = 0.9 there should be no condensate at all, yet the share is still 0.135 at 20,000 nodes and falls only slowly. Finite networks remember their beginning for a long time.

Unlike the winner of module 06's superlinear kernel, this winner is chosen by quality, not by age. The rigorous work adds a caution. Borgs, Chayes, Daskalakis and Roch (2007) proved that the model has three phases, a first-mover advantage, a phase where the fit get richer, and one where innovation pays off, and that in the condensation phase a constant fraction of the links keeps moving to ever higher fitness. Dereich, Mailler and Mörters (2017) showed, for trees with one link per newcomer and fitness spread continuously up to its maximum, that no single node keeps a positive fraction of the links: the condensate exists, but it is a collective effort of ever fitter nodes, none of which holds it alone. One node keeping a fixed share is what happens when it stands apart from all the others, as in the clean case.

## Age and cost

Nodes fade. Actors retire, papers are superseded, pages go stale. Dorogovtsev and Mendes (2000) let the attachment rate fall with age τ:

```math
Π ∝ k τ^(−ν)
```

A negative ν favours the old and lowers γ, towards 2 as ν goes to −∞. A positive ν raises it; γ grows without bound as ν approaches 1, and above 1 the power law is gone. In the third simulation, with 10,000 nodes, the recipe of [module 05](/network-lab/heavy-tails-done-right) gives 2.42 at ν = −1, 3.98 at ν = 0.5 and 4.60 at ν = 0.8, against 2.73 at ν = 0. Capacity and cost cut the tail as well: Amaral and colleagues (2000) found networks such as the world's airports whose degrees stop short, because a node cannot take links beyond what it can carry.

## Networks get denser

In every model so far each newcomer brings m links, so the mean degree stays fixed. Leskovec, Kleinberg and Faloutsos (2005) found otherwise. In citation, patent and Internet networks the number of links E grows faster than the number of nodes N, as E ∝ N^a with a between 1 and 2: 1.68 for one arXiv citation network, 1.66 for patents, 1.18 for the Internet at the level of autonomous systems. And the effective diameter shrinks as the network grows.

If the n-th newcomer brings m₀ n^θ links, the links add up to E ∝ N^(1+θ), so a = 1 + θ, and the mean-field calculation of module 06 gives

```math
γ = 3 + 2θ / (1 − θ)
```

as in Barabási's textbook (exercise 4). In the third simulation, at θ = 0.3, the links grow with slope 1.301 against N, and the recipe gives γ = 3.60, short of the predicted 3.86, for the reason of module 05: the tail is cut before it settles. Distances do not shrink, though. The average distance creeps up from 2.48 at 100 nodes to 3.03 at 10,000; densification only slows its growth. To make distances shrink, Leskovec and colleagues needed another mechanism, their "forest fire" model, in which a newcomer links to one node and then, like a fire spreading, to some of its neighbours, and to some of theirs.

## What a snapshot cannot tell

The same heavy tail can come from age (module 06), from fitness, from both, or from neither, as module 06's optimisation showed. A single snapshot of the degrees cannot tell them apart. The history of the nodes can: who arrived when, and how fast each one grew.

## What comes next

So far we asked how many links a node gets. Module 08 asks who connects to whom: whether hubs link to hubs, and like to like.

<!-- simulation -->

## Further reading

- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Ch. 6.
- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press. Ch. 13.
- Latora, V., Nicosia, V. and Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Ch. 6.
- Bianconi, G. and Barabási, A.-L. (2001). Competition and multiscaling in evolving networks. *Europhysics Letters* 54, 436–442.
- Bianconi, G. and Barabási, A.-L. (2001). Bose-Einstein condensation in complex networks. *Physical Review Letters* 86, 5632–5635.
- Krapivsky, P. L. and Redner, S. (2002). Statistics of changes in lead node in connectivity-driven networks. *Physical Review Letters* 89, 258703.
- Borgs, C., Chayes, J., Daskalakis, C. and Roch, S. (2007). First to market is not everything: an analysis of preferential attachment with fitness. *Proceedings of the 39th ACM Symposium on Theory of Computing (STOC 2007)*, 135–144.
- Dereich, S., Mailler, C. and Mörters, P. (2017). Nonextensive condensation in reinforced branching processes. *Annals of Applied Probability* 27, 2539–2568.
- Kong, J. S., Sarshar, N. and Roychowdhury, V. P. (2008). Experience versus talent shapes the structure of the Web. *PNAS* 105, 13724–13729.
- Wang, D., Song, C. and Barabási, A.-L. (2013). Quantifying long-term scientific impact. *Science* 342, 127–132.
- Dorogovtsev, S. N. and Mendes, J. F. F. (2000). Evolution of networks with aging of sites. *Physical Review E* 62, 1842–1845.
- Dorogovtsev, S. N. and Mendes, J. F. F. (2001). Effect of the accelerating growth of communications networks on their structure. *Physical Review E* 63, 025101.
- Leskovec, J., Kleinberg, J. and Faloutsos, C. (2005). Graphs over time: densification laws, shrinking diameters and possible explanations. *Proceedings of the 11th ACM SIGKDD Conference (KDD 2005)*, 177–187.
- Amaral, L. A. N., Scala, A., Barthélemy, M. and Stanley, H. E. (2000). Classes of small-world networks. *PNAS* 97, 11149–11152.
