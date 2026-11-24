<!-- DRAFT: to be reviewed by Adriano -->

## Same degrees, different wiring

A degree sequence says how many links each node has, not where they go. Take thirty nodes with given degrees: the hubs can be joined to one another, with the small nodes left to pair among themselves, or each hub can sit at the centre of its own cluster of small nodes. The two networks below have exactly the same degrees.

```figure
wirings
```

Maslov and Sneppen (2002) asked which of the two pictures real networks resemble. They took protein interaction and gene regulation networks and compared them with versions rewired by the swaps of [module 02](/network-lab/what-are-we-measuring), which keep every degree. In the real networks links between highly connected proteins were systematically rarer than in the rewired ones, and links between hubs and poorly connected proteins more common. Newman (2002) measured many networks and found a pattern: social networks tend to be **assortative**, hubs linking to hubs, while technological and biological ones tend to be **disassortative**. His coefficient r, defined below, was 0.363 for coauthorship in physics, 0.208 for film actors and 0.276 for company directors, but −0.189 for the Internet, −0.156 for protein interactions and −0.276 for a freshwater food web.

## How to measure it

The most direct picture is the mean degree of a node's neighbours, k_nn(k), averaged over the nodes of degree k. Without correlations a link end lands on a node in proportion to its degree, whatever the degree at the other end, and

```math
k_nn(k) = ⟨k²⟩ / ⟨k⟩
```

for every k. A rising k_nn(k) is assortative, a falling one disassortative. For the Internet at the level of autonomous systems, Pastor-Satorras, Vázquez and Vespignani (2001) found k_nn ∼ k^(−ν) with ν ≃ 0.5.

Newman condensed the curve into one number: r, the Pearson correlation between the degrees at the two ends of a link, each link counted in both directions. It runs from −1 to 1; a star gives −1 (exercise 1). Its weakness is the heavy tail. A Pearson correlation is dominated by the largest values, and when the third moment of the degree distribution diverges, which for p_k ∝ k^(−γ) happens when γ < 4, r is pulled towards 0 as the network grows. Litvak and van der Hofstad (2013) gave an analytical argument that the most negative value r can take on a given degree sequence then goes to 0 with the size of the network, so that in the limit r cannot be negative however disassortative the wiring is. In two crawls of the British Web, r was −0.65 with 100,000 pages and −0.08 with a million, while a rank correlation, Spearman's ρ, was −0.57 and −0.56. They proposed ρ: the same Pearson formula applied to the ranks of the degrees instead of the degrees.

The growing network of [module 06](/network-lab/growth-mechanisms) shows the problem. In the first simulation, preferential attachment with m = 2 gives a mean r of −0.095, −0.048 and −0.023 at 1,000, 10,000 and 100,000 nodes, while ρ stays at −0.31, −0.30 and −0.31. The network is disassortative at every size: old hubs collect the links of the newcomers, which arrive with degree m. r hides it.

## Hubs run out of hubs

In a simple network, two nodes of degrees k and k′ can share at most one link. Without correlations they would share k k′/(⟨k⟩N) links on average, and that number exceeds 1 when both degrees pass

```math
k_s ≈ (⟨k⟩ N)^(1/2)
```

the **structural cutoff** (Boguñá, Pastor-Satorras and Vespignani 2004). Above k_s the hubs do not have enough other hubs to link to, and part of their links must go to smaller nodes. The natural cutoff of [module 05](/network-lab/heavy-tails-done-right) grows as N^(1/(γ−1)), faster than k_s exactly when γ < 3 (exercise 2). So a configuration model with γ < 3 that forbids repeated links becomes disassortative by itself. In the first simulation, with γ = 2.2 and 10,000 nodes, k_s is 257 and the largest degree 2,220; r is −0.096 and ρ −0.126. At γ = 3 the largest degree, 171, stays below k_s and r is −0.010.

A negative r therefore says little on its own. It means something only when compared with a null model that keeps the degrees and forbids repeated links, as in module 02.

## A rich club?

Do the best-connected nodes form a club? The rich-club coefficient φ(k) is the density of links among the nodes of degree above k: the links among them divided by the pairs. It rises with k even in random networks, simply because nodes with many links have more chances to meet. Zhou and Mondragón (2004) found φ rising in the Internet and spoke of a rich club. Colizza, Flammini, Serrano and Vespignani (2006) divided φ by its mean in degree-preserving randomisations. With that ratio, scientific collaborations showed a strong rich club and air transport a mild one, while the Internet, contrary to the earlier claim, and the protein interaction network showed none: their hubs link to one another less than chance would have them do. In the first simulation the growing network of module 06 gives a ratio of 0.73, 0.63, 0.64 and 0.72 at k = 5, 10, 20 and 40: no club.

## Wiring changes behaviour

Xulvi-Brunet and Sokolov (2004) gave a way to change correlations while keeping every degree. Take two links at random; with probability p order their four ends by degree and join the two largest and the two smallest, otherwise re-pair them at random. Joining the largest with the smallest instead makes the network disassortative. Applied fully to the growing network of 10,000 nodes, the rewiring reaches ρ = 0.963 one way and −0.957 the other, while r reaches only 0.355 and −0.166.

Newman (2002, 2003) found that assortative networks percolate more easily, a giant component appearing at a lower density of links, and are more robust to the removal of their highest-degree nodes: the hubs back one another up. Disassortative networks spread their hubs thinly, each holding together its own patch. In the second simulation, with 10,000 nodes, removing the top 10% of degrees leaves 90% of the nodes in the largest component of the assortative wiring, 65% of the neutral one and 35% of the disassortative one. Under random removal the order is reversed for most of the range: with a fifth of the nodes gone, the assortative giant holds 56%, against 77% and 78%, because its hubs are packed into one core and its small nodes form loose chains. [Module 11](/network-lab/robustness-and-cascades) returns to robustness.

## Like links to like

Degree is one trait; people have many others. **Homophily**, the tendency of similar people to be linked, holds for race and ethnicity, age, religion, education, occupation and gender, and McPherson, Smith-Lovin and Cook (2001) found it remarkably robust across kinds of relation, from marriage to friendship to work. For a trait with categories, the **mixing matrix** e_ij gives the share of link ends that join a node of category i to one of category j, and Newman (2003) defined

```math
r = (Σ_i e_ii − Σ_i a_i²) / (1 − Σ_i a_i²)
```

with a_i = Σ_j e_ij: 1 when every link stays inside its category, 0 when links fall as chance would have them, negative when they prefer to cross. The third simulation grows a network with two groups, where each link stays in its group with probability h. With a minority of about a fifth and h = 0.8, the minority's links stay inside only 59.6% of the time, against 86.2% for the majority: the majority's newcomers keep sending a fifth of their links across.

Homophily has two origins that a snapshot cannot separate: people choose people like themselves, and people become like those they know. Shalizi and Thomas (2011) showed that in observational data the two, together with the effect of traits nobody measured, are generically confounded: separating them needs strong assumptions. Aral, Muchnik and Sundararajan (2009) followed the adoption of a mobile service in an instant-messaging network of 27.4 million users and estimated that homophily explained more than half of what looked like contagion, and that standard methods overstated influence by 300% to 700%. [Complexity Lab module 09](/lab/agent-based-models) shows, with Schelling's model, how a mild preference can produce a strongly divided whole.

## The majority illusion

What you see depends on whom you know. If the hubs share a trait that is rare overall, most nodes may find it among most of their neighbours. Lerman, Yan and Wu (2016) called this the **majority illusion**: in heavy-tailed networks with 5% of the nodes active, they found that 60% to 80% of the nodes could see an active majority around them. The illusion needs heterogeneous degrees, the active nodes among the hubs, and it is strongest in disassortative networks, where each hub serves many small nodes. It is the friendship paradox of [module 02](/network-lab/what-are-we-measuring), applied to opinions.

```figure
illusion
```

In the third simulation, colouring the top 10% of degrees in the growing network shows a coloured majority to 26.2% of the nodes; rewired towards disassortative with the same degrees, to 66.1%.

## Next

Assortativity and homophily are mixing by trait. [Module 09](/network-lab/communities) looks for mixing by group when no trait is given: communities.

<!-- simulation -->

## Further reading

- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Ch. 7.
- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press. Ch. 7 and 10.
- Latora, V., Nicosia, V. and Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Ch. 7.
- Easley, D. and Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Ch. 4.
- Maslov, S. and Sneppen, K. (2002). Specificity and stability in topology of protein networks. *Science* 296, 910–913.
- Newman, M. E. J. (2002). Assortative mixing in networks. *Physical Review Letters* 89, 208701.
- Newman, M. E. J. (2003). Mixing patterns in networks. *Physical Review E* 67, 026126.
- Pastor-Satorras, R., Vázquez, A. and Vespignani, A. (2001). Dynamical and correlation properties of the Internet. *Physical Review Letters* 87, 258701.
- Boguñá, M., Pastor-Satorras, R. and Vespignani, A. (2004). Cut-offs and finite size effects in scale-free networks. *European Physical Journal B* 38, 205–209.
- Litvak, N. and van der Hofstad, R. (2013). Uncovering disassortativity in large scale-free networks. *Physical Review E* 87, 022801.
- Xulvi-Brunet, R. and Sokolov, I. M. (2004). Reshuffling scale-free networks: from random to assortative. *Physical Review E* 70, 066102.
- Zhou, S. and Mondragón, R. J. (2004). The rich-club phenomenon in the Internet topology. *IEEE Communications Letters* 8, 180–182.
- Colizza, V., Flammini, A., Serrano, M. Á. and Vespignani, A. (2006). Detecting rich-club ordering in complex networks. *Nature Physics* 2, 110–115.
- McPherson, M., Smith-Lovin, L. and Cook, J. M. (2001). Birds of a feather: homophily in social networks. *Annual Review of Sociology* 27, 415–444.
- Shalizi, C. R. and Thomas, A. C. (2011). Homophily and contagion are generically confounded in observational social network studies. *Sociological Methods and Research* 40, 211–239.
- Aral, S., Muchnik, L. and Sundararajan, A. (2009). Distinguishing influence-based contagion from homophily-driven diffusion in dynamic networks. *PNAS* 106, 21544–21549.
- Lerman, K., Yan, X. and Wu, X.-Z. (2016). The "majority illusion" in social networks. *PLoS ONE* 11, e0147617.
