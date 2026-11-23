<!-- DRAFT: to be reviewed by Adriano -->

## Two verdicts

Is a network with hubs robust or fragile? Both, and the answer depends on who is asking. Albert, Jeong and Barabási (2000) took two model networks of 10,000 nodes and 20,000 links, one random and one grown by preferential attachment, and removed nodes in two ways: at random, as components fail, and most connected first, as an attacker would. In the heavy-tailed network 5% of random failures left the average distance between the remaining nodes unchanged; the same 5% taken from the top doubled it. Pushed further, the random network fell to pieces at about 28% removed, in much the same way under failures and under attack. The heavy-tailed one fell at about 18% under attack, and maps of the Internet (6,209 autonomous systems) and of a sample of the Web (325,729 pages) at about 3% and 7%.

```figure
fail
```

The same tail that protects against accidents exposes the network to intent. The rest of this module asks how much, whether it can be helped, and what changes when a failure moves load onto other nodes or onto another network.

## Random failure is percolation

Remove a fraction f of the nodes at random. A node that survives keeps each of its links with probability 1 − f, so the criterion of [module 05](/network-lab/heavy-tails-done-right) for a giant component applies with one more factor: it survives while (1 − f)(⟨k²⟩/⟨k⟩ − 1) > 1. The **critical fraction** is

```math
f_c = 1 − 1 / (⟨k²⟩/⟨k⟩ − 1)
```

(Cohen, Erez, ben-Avraham and Havlin 2000; Callaway, Newman, Strogatz and Watts 2000). For a random network ⟨k²⟩/⟨k⟩ = ⟨k⟩ + 1 and f_c = 1 − 1/⟨k⟩: with four links per node, three quarters of the nodes must go (exercise 1). With a power-law tail of exponent γ < 3 the second moment grows without bound as the network grows, and f_c tends to 1: almost every node has to be removed before the giant component disappears. Cohen and colleagues estimated that more than 99% of the Internet's nodes would have to fail.

In a finite network the natural cutoff of module 05 keeps ⟨k²⟩ finite and f_c below 1. In the first simulation the formula gives 0.905 for 1,000 nodes grown by preferential attachment and 0.932 for 10,000, against 0.75 for a random network with the same number of links. Before the threshold the giant component shrinks steadily in both; f_c says when it is gone, not how much is left on the way.

## Attack

Now remove the hubs first. Each removal takes away many links, and what is left is a network whose tail has been cut and whose links have been thinned: Cohen, Erez, ben-Avraham and Havlin (2001) showed that a heavy-tailed network then breaks after a modest fraction, a few per cent in their figures. In the first simulation, with 10,000 nodes and four links per node on average, removing half the nodes at random leaves a largest component of 0.399 of the nodes in the random network and 0.389 under preferential attachment. Removing one fifth, highest degree first, leaves 0.687 in the random network and 0.006 under preferential attachment.

An attacker can do better than a list drawn up in advance. Holme, Kim, Yoon and Han (2002) compared removal by degree and by betweenness, each computed once on the intact network or again after every removal, and found the recomputed versions often more harmful: taking out a hub changes who the next hub is. And degrees are not everything. [Module 08](/network-lab/who-connects-to-whom) showed that one degree sequence wired in different ways resists attack very differently.

## Can a network be made robust?

Schneider, Moreira, Andrade, Havlin and Herrmann (2011) turned that remark into a design method. The point where the network finally collapses says little about the damage on the way, so they measured the whole curve:

```math
R = (1/N) Σ_{Q=1..N} s(Q)
```

where s(Q) is the share of the nodes in the largest component after Q removals, the degrees being recomputed as the attack proceeds. R runs from 1/N for a star to 0.5 for a complete network (exercise 3). They then swapped pairs of links, which keeps every degree, and kept a swap only when R rose. For the European power grid and for a map of the Internet they report gains of 45% and 55% with about 5% of the links changed. The networks that come out have a recognisable shape, which they called an **onion**: the hubs joined to one another in a core, surrounded by layers of nodes of decreasing degree, each layer linked within itself. When the core is removed the layers still hold.

The first simulation repeats this. On the default network 20,000 attempted swaps raise R from 0.097 to 0.221, and Spearman's ρ of module 08 from −0.32 to 0.31. The gain has a price: under random removal R falls from 0.416 to 0.386.

## Cascades of overload

So far a removed node took only its own links with it. In a network that carries something ([module 10](/network-lab/weights-flows-navigation)), what it carried must go elsewhere. Motter and Lai (2002) gave the simplest model. The **load** of a node is the number of shortest paths passing through it. Its capacity is its load in the intact network times 1 + α, where the **tolerance** α is the spare margin the builder paid for. Remove one node: paths are rerouted, loads change, every node now above its capacity fails, and the loads are computed again, until nothing is overloaded. In heavy-tailed networks of about 5,000 nodes the removal of the single most loaded node still cut the largest component by more than 20% at α = 1, while random removals did almost nothing; a network in which every node had the same degree did not cascade even at α = 0.05.

The second simulation shows the same: with 400 nodes and α = 0.2, removing the most loaded node of a preferential-attachment network leaves a largest component of 0.070 of the nodes; removing a random one leaves 0.996. In a random network with as many links the most loaded node takes down far less: 0.930 is left. Real blackouts have this domino character: on 14 August 2003 the loss of a few lines in Ohio spread, that same afternoon, to an area with some 50 million people in the United States and Canada (U.S.–Canada Power System Outage Task Force 2004).

## Networks that depend on networks

Power stations need the computers that control them, and the computers need power. Buldyrev, Parshani, Paul, Stanley and Havlin (2010) started from the Italian blackout of 28 September 2003, in which the shutdown of power stations brought down nodes of the communication network, which in turn brought down more stations. Their model has two networks, A and B, with every node of one depending on a partner in the other. Remove some nodes of A. Their partners in B stop; B breaks, and only its largest component still works; the partners of what B lost stop in A; and so on, back and forth.

```figure
cascade
```

What survives is the **mutual giant component**: a set of nodes connected in both networks at once. For two random networks of mean degree ⟨k⟩, with a fraction p of the nodes kept, its share x of the nodes solves

```math
x = p (1 − e^(−⟨k⟩x))²
```

and a solution other than zero exists only for p > 2.4554/⟨k⟩. At that point x does not start from zero: it jumps to 1.2564/⟨k⟩, about 31% of the nodes when ⟨k⟩ = 4 (exercise 2). A single network needs only p > 1/⟨k⟩ and grows from nothing. One fades; the pair works, and then does not. In the third simulation (10,000 nodes, ⟨k⟩ = 4) keeping 62% of the nodes leaves a mutual giant component of 0.365; keeping 61% leaves nothing, after 31 steps of the cascade. The long cascade is the warning sign: close to the threshold each step removes little, and the collapse takes many steps to arrive.

The first lesson of this module is reversed here. A broader degree distribution, which protects a single network from random failures, makes a coupled pair more fragile: a hub in one network may depend on a node with a single link in the other. Two power-law networks in the third simulation, of mean degree 4.40, need p = 0.68, where two random networks of that mean degree would need 0.558.

```box
Bitcoin's networks under attack
The peer-to-peer network that carries Bitcoin's transactions and blocks is built with the attacks of this module in mind. A node does not accept the neighbours it is given: by default Bitcoin Core opens 8 full-relay and 2 block-relay-only outbound connections ([module 01](/network-lab/reading-a-network)) to addresses it picks from its own tables. A node whose connections all led to one attacker would see only what the attacker shows it: an **eclipse**. Heilman, Kendler, Zohar and Goldberg (2015) showed how to fill those tables with the attacker's addresses; Bitcoin Core adopted three of their countermeasures in version 0.10.1, and later feeler connections (0.13.1) and test-before-evict (0.17.0). Apostolaki, Zohar and Vanbever (2017) studied attacks from below, at the level of Internet routing: in November 2015, 13 autonomous systems hosted 30% of the nodes. On a Lightning snapshot of 1 February 2019, Rohrer, Malliaris and Tschorsch (2019) found that removing the best-connected nodes sharply cut the share of payments that found a route, while random failures split off little. Exercise 4 does the arithmetic of an eclipse.
```

## Next

A failure that spreads is a kind of contagion. [Module 12](/network-lab/epidemics-on-networks) takes up contagion itself: epidemics on networks, and why hubs remove the threshold.

<!-- simulation -->

## Further reading

- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Ch. 8.
- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press. Ch. 15.
- Latora, V., Nicosia, V. and Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press.
- Albert, R., Jeong, H. and Barabási, A.-L. (2000). Error and attack tolerance of complex networks. *Nature* 406, 378–382.
- Callaway, D. S., Newman, M. E. J., Strogatz, S. H. and Watts, D. J. (2000). Network robustness and fragility: percolation on random graphs. *Physical Review Letters* 85, 5468–5471.
- Cohen, R., Erez, K., ben-Avraham, D. and Havlin, S. (2000). Resilience of the Internet to random breakdowns. *Physical Review Letters* 85, 4626–4628.
- Cohen, R., Erez, K., ben-Avraham, D. and Havlin, S. (2001). Breakdown of the Internet under intentional attack. *Physical Review Letters* 86, 3682–3685.
- Holme, P., Kim, B. J., Yoon, C. N. and Han, S. K. (2002). Attack vulnerability of complex networks. *Physical Review E* 65, 056109.
- Schneider, C. M., Moreira, A. A., Andrade, J. S., Havlin, S. and Herrmann, H. J. (2011). Mitigation of malicious attacks on networks. *PNAS* 108, 3838–3841.
- Motter, A. E. and Lai, Y.-C. (2002). Cascade-based attacks on complex networks. *Physical Review E* 66, 065102.
- U.S.–Canada Power System Outage Task Force (2004). *Final Report on the August 14, 2003 Blackout in the United States and Canada: Causes and Recommendations*.
- Buldyrev, S. V., Parshani, R., Paul, G., Stanley, H. E. and Havlin, S. (2010). Catastrophic cascade of failures in interdependent networks. *Nature* 464, 1025–1028.
- Heilman, E., Kendler, A., Zohar, A. and Goldberg, S. (2015). Eclipse attacks on Bitcoin's peer-to-peer network. *24th USENIX Security Symposium*, 129–144.
- Apostolaki, M., Zohar, A. and Vanbever, L. (2017). Hijacking Bitcoin: routing attacks on cryptocurrencies. *IEEE Symposium on Security and Privacy*, 375–392.
- Rohrer, E., Malliaris, J. and Tschorsch, F. (2019). Discharged payment channels: quantifying the Lightning Network's resilience to topology-based attacks. *IEEE European Symposium on Security and Privacy Workshops*, 347–356.
