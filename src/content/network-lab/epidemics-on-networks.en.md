<!-- DRAFT: to be reviewed by Adriano -->

## One number

Suppose everyone meets everyone, and each infected person passes the infection to R0 others, on average, before recovering. Below R0 = 1 each generation of cases is smaller than the last and the outbreak dies; above it the outbreak grows, at first exponentially. Kermack and McKendrick (1927) worked out what follows. In the **SIR** model people are susceptible, then infected, then recovered and immune, and the outbreak ends by itself before it has reached everyone. The share S that was ever infected solves

```math
S = 1 − e^(−R0 S)
```

which gives 80% for R0 = 2 (exercise 2). In the **SIS** model recovery brings no immunity, and above the threshold the infection settles at a steady level instead of ending. Either way one number decides, and it is an average. On a network an average is the wrong thing to look at.

## On a network

Let an infected node pass the infection along each of its links with probability T, the **transmissibility**. A node reached along a link is not a typical node. It is found in proportion to its degree, and it has on average (⟨k²⟩ − ⟨k⟩)/⟨k⟩ other links along which to pass the infection on: the excess degree of [module 05](/network-lab/heavy-tails-done-right). So

```math
R0 = T (⟨k²⟩ − ⟨k⟩) / ⟨k⟩
```

and an outbreak can grow when T exceeds T_c = ⟨k⟩/(⟨k²⟩ − ⟨k⟩) (Newman 2002). This is the formula of [module 11](/network-lab/robustness-and-cascades) read the other way (exercise 1), and for a reason. Mark each link as one that would transmit, with probability T: the nodes an outbreak reaches are the component of its seed among the marked links. A SIR epidemic is percolation. Above T_c there is a giant component, its size is the size of a large outbreak, and the generating functions of module 05 give it: if u solves u = G1(1 − T + Tu) and w = 1 − T + Tu, the final share is 1 − G0(w).

In the first simulation a random network with ⟨k⟩ = 4 has T_c = 0.250, and at T = 0.5 the largest component holds 0.796 of its 10,000 nodes, where the formula says 0.797. A network of the same size and mean degree grown by preferential attachment has T_c = 0.075.

## The threshold that vanishes

With a power-law tail of exponent γ ≤ 3, ⟨k²⟩ grows without bound as the network grows, and T_c goes to zero: in a large enough network an infection can spread however weakly it is transmitted. Pastor-Satorras and Vespignani (2001) found this for the SIS model, whose threshold in their theory is ⟨k⟩/⟨k²⟩. They started from a puzzle about computer viruses. Those that spread at all lingered for a long time on a tiny fraction of machines, which a model with a threshold explains only if every virus happens to sit just above it. Without a threshold, a low and lasting prevalence is what one expects. Castellano and Pastor-Satorras (2010) later showed that a power law is not needed: the largest hub is enough to keep an SIS infection alive and to feed it to the rest, so the threshold vanishes in any network whose largest degree grows with its size.

A finite network always has a threshold, only a low one. Averaged over 20 networks, the formula gives T_c = 0.100, 0.073 and 0.060 for preferential attachment with 1,000, 10,000 and 100,000 nodes, and 0.069, 0.024 and 0.012 for a power law with γ = 2.5. For random networks it stays at 0.250.

## Chance and superspreaders

Above the threshold, not every introduction succeeds. The links around the first case may all fail, and the outbreak ends after a handful of cases. A seed with k links starts a large outbreak with probability 1 − w^k, since each of its links must separately fail to lead to one (exercise 3). In a random network with ⟨k⟩ = 4 and T = 0.5 that is 0.40 for a node with one link and 0.99 for a node with ten.

```figure
seed
```

Real transmission is as uneven as that. Lloyd-Smith, Schreiber, Kopp and Getz (2005) fitted the number of secondary cases per case for several diseases and found it far more dispersed than an average suggests. For SARS in Singapore the dispersion parameter was about 0.16: by their estimate 73% of the cases were expected to infect fewer than one other person, and 6% more than eight. Outbreaks of such a disease usually fizzle, and the ones that do not are explosive.

## Hubs first

Who is infected early? Whoever is easy to reach. In a heterogeneous network the infection climbs to the hubs within a few steps and then works its way down the degrees, reaching the nodes with few links last (Barthélemy, Barrat, Pastor-Satorras and Vespignani 2004). The same paper gives the time scale of the early growth,

```math
τ = ⟨k⟩ / (β (⟨k²⟩ − ⟨k⟩))
```

with β the rate of infection along a link: the spread of the degrees sets the pace, not their mean. In the second simulation the nodes infected at the first step in a preferential-attachment network have 11.7 links on average, against a mean degree of 4, and half the network is infected after 13.0 steps. The random network with the same number of links takes 20.0. Even there the early cases have about 5 links, not 4: they are the friends of [module 02](/network-lab/what-are-we-measuring).

## Whom to vaccinate

With everyone mixing, immunising a share 1 − 1/R0 of the population brings each case below one successor. On a network, immunise a share g at random and the percolation argument gains one factor, 1 − g. The outbreak is stopped above

```math
g_c = 1 − T_c / T
```

which is close to everyone when T_c is close to zero (exercise 4). Random vaccination spends nearly all its doses on nodes that matter little. Immunising the hubs works with few doses (Pastor-Satorras and Vespignani 2002), but supposes that the degrees are known. Cohen, Havlin and ben-Avraham (2003) removed that condition: ask people chosen at random to name an acquaintance, and immunise the acquaintance. By the friendship paradox of module 02, the person named has more links than the person asked.

In the third simulation, at T = 0.5 on preferential attachment, a large outbreak falls below 1% of the network when 74% of the nodes are immunised at random, 24% by acquaintance and 8% by degree. On the random network the three figures are 54%, 44% and 22%: where there are no hubs there is less to gain.

## Not always exponential

Exponential growth needs every case to find fresh contacts at the same rate. Where contacts are local it cannot last: an infection that advances at constant speed across a surface has reached the area inside its front, which grows as t². And where groups are reached one after another, a power of time can replace the exponential altogether. Cumulative AIDS cases in the United States grew as t³, and Colgate, Stanley, Hyman, Layne and Qualls (1989) proposed a model that gives the cube: a population divided by risk behaviour, in which the infection saturates the small group at highest risk first and then ever larger groups at lower risk, each later than the one before (exercise 5).

```figure
growth
```

Viboud, Simonsen and Chowell (2016) fitted the early phase of 20 outbreaks and concluded that growth slower than exponential is common, especially for infections that are not airborne.

```box
Is adoption an epidemic?
Adoption is often drawn as an S-curve: an epidemic that starts exponentially and saturates. The count of Bitcoin addresses with a non-zero balance did not grow that way. It is close to a power law of time, N ∝ t^3.046 (Santostasi and Perrenod 2026, the Institute's preprint; see [Complexity Lab module 13](/lab/bitcoin-complex-system) and our [Publications page](/research/publications#preprint)). The authors relate the cubic law to epidemic spreading on a heterogeneous network, citing the saturation wave of Colgate and colleagues; the section above and exercise 5 show how a power of time can arise.

Two cautions. An address is not a user: one person may hold many, and an exchange holds one for many people (the entity graph of [module 01](/network-lab/reading-a-network)). And the exponent has not been constant: fitted by sub-period it was 3.37 (2011–15), 3.00 (2016–19), 1.93 (2020–22) and 1.01 (2023–26) (Pecere 2026, supplement, section S2). Whether that is a pause, a slowdown or a count that no longer sees the newcomers is an open question.
```

## Next

An infection needs one contact. Much of what spreads between people needs more: a habit, a tool or a belief is often taken up only when enough neighbours already have it. [Module 13](/network-lab/social-contagion-network-effects) turns to social contagion and network effects.

<!-- simulation -->

## Further reading

- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Ch. 10.
- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press. Ch. 16.
- Latora, V., Nicosia, V. and Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press.
- Easley, D. and Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Ch. 21.
- Kermack, W. O. and McKendrick, A. G. (1927). A contribution to the mathematical theory of epidemics. *Proceedings of the Royal Society A* 115, 700–721.
- Newman, M. E. J. (2002). Spread of epidemic disease on networks. *Physical Review E* 66, 016128.
- Pastor-Satorras, R. and Vespignani, A. (2001). Epidemic spreading in scale-free networks. *Physical Review Letters* 86, 3200–3203.
- Pastor-Satorras, R. and Vespignani, A. (2002). Immunization of complex networks. *Physical Review E* 65, 036104.
- Castellano, C. and Pastor-Satorras, R. (2010). Thresholds for epidemic spreading in networks. *Physical Review Letters* 105, 218701.
- Lloyd-Smith, J. O., Schreiber, S. J., Kopp, P. E. and Getz, W. M. (2005). Superspreading and the effect of individual variation on disease emergence. *Nature* 438, 355–359.
- Barthélemy, M., Barrat, A., Pastor-Satorras, R. and Vespignani, A. (2004). Velocity and hierarchical spread of epidemic outbreaks in scale-free networks. *Physical Review Letters* 92, 178701.
- Cohen, R., Havlin, S. and ben-Avraham, D. (2003). Efficient immunization strategies for computer networks and populations. *Physical Review Letters* 91, 247901.
- Colgate, S. A., Stanley, E. A., Hyman, J. M., Layne, S. P. and Qualls, C. (1989). Risk behavior-based model of the cubic growth of acquired immunodeficiency syndrome in the United States. *PNAS* 86, 4793–4797.
- Viboud, C., Simonsen, L. and Chowell, G. (2016). A generalized-growth model to characterize the early ascending phase of infectious disease outbreaks. *Epidemics* 15, 27–37.
- Pastor-Satorras, R., Castellano, C., Van Mieghem, P. and Vespignani, A. (2015). Epidemic processes in complex networks. *Reviews of Modern Physics* 87, 925–979.
- Santostasi, G. and Perrenod, S. (2026). A Mechanistic Derivation of the Bitcoin Price Power Law: Network Adoption Dynamics and Generalised Metcalfe Scaling. Zenodo. [doi.org/10.5281/zenodo.19387099](https://doi.org/10.5281/zenodo.19387099)
- Pecere, A. (2026). Bitcoin's power-law trend: what the regression identifies, and the four-year oscillation around it. Zenodo. [doi.org/10.5281/zenodo.23933138](https://doi.org/10.5281/zenodo.23933138)
