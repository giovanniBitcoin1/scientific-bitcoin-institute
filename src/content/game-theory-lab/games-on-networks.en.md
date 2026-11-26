<!-- DRAFT: to be reviewed by Adriano -->

## Who you are next to

In the games of modules 01 to 08 everyone met everyone, or at least shared the same roads. Most people do not live like that. A researcher works with a handful of coauthors, a farmer borrows tools from the farms next door, a shop watches the shops on its own street. Each player meets only her **neighbours**, and the shape of the network decides much of what happens.

Michael Kearns, Michael Littman and Satinder Singh (2001) proposed the model now called **graphical games**: the players sit on the nodes of a network and each one's payoff depends only on her own choice and on her neighbours' choices. The network is not decoration. It says who can affect whom.

Here is the simplest version, which this module uses throughout. Each player i chooses an effort x_i ≥ 0. Write g_ij = 1 if i and j are neighbours and 0 otherwise. Her payoff is

```math
u_i = x_i − x_i²/2 + δ x_i Σ_j g_ij x_j
```

The first two terms are what she gets from her own effort: a return of 1 per unit, at a cost that grows with the square. The last term is the interaction. Setting the derivative to zero, and remembering that effort cannot be negative, gives her best reply:

```math
x_i = max(0, 1 + δ Σ_j g_ij x_j)
```

With δ > 0 efforts are **strategic complements**: the more my neighbours do, the more I want to do, as when studying with friends who study. With δ < 0 they are **strategic substitutes**: the more my neighbours do, the less I need to, as when a neighbour's dog already guards the street.

Take a star: a hub with four leaves. With complements, the hub has four neighbours pushing her up and each leaf only one, so the hub works most. Solving the two best replies, the hub works (1 + 4δ)/(1 − 4δ²) and each leaf (1 + δ)/(1 − 4δ²): at δ = 0.25, 8/3 against 5/3. With substitutes the order flips. The hub feels four neighbours' efforts and cuts back the most; from δ = −0.25 down she does nothing at all, and each leaf, with no help from her, works 1. Position alone, not talent or taste, decides who works. Figure F1 lets you move δ and watch the efforts change; near δ = ±0.5 the formulas blow up, and the figure stops just before.

```figure
star
```

## Who does the work?

Push substitutes to the limit, δ = −1, and own effort and the neighbours' are perfect substitutes:

```math
x_i = max(0, 1 − Σ_j g_ij x_j)
```

This is a model of **local public goods** (Yann Bramoullé and Rachel Kranton 2007): information gathered by one is shared with the people next to her, a tool bought by one is lent to her neighbours. A player is satisfied as soon as the total effort in her neighbourhood, hers included, reaches 1.

Among the equilibria, the simplest are **specialized**: some players work 1 and the others nothing. For this to be an equilibrium, no two workers can be neighbours (each would then want to stop), and every non-worker must have a working neighbour (otherwise she would want to start). In the language of graph theory, the workers form a **maximal independent set**: no two of them linked, and no one else can join without breaking that. A network usually has many such sets, and so many equilibria, with very different totals.

Not all of them survive a small shock. Bramoullé and Kranton show that a specialized equilibrium is stable when every non-worker has at least two working neighbours. The reason is simple: if a worker's effort slips a little, a non-worker with only that one working neighbour has a reason to start, and the profile drifts away; with two, the other one still covers her. On a star of six the hub alone working, a total of 1, is an equilibrium, but each leaf relies on her alone. The stable one has the five leaves working and the hub riding on them: a total of 5. Panel A lists every specialized equilibrium of four small networks and runs best responses from random starts.

With weaker substitutes there may be just one equilibrium. Bramoullé, Kranton and Martin D'Amours (2014) showed that it is unique when |δ| is below 1/|λ_min|, where λ_min is the lowest eigenvalue of the network's adjacency matrix. F1's star has λ_min = −2: that is why its equilibrium is unique on the whole slider.

## The key player

Now complements. Coralio Ballester, Antoni Calvó-Armengol and Yves Zenou (2006) showed that when δ is below 1/λ_max, λ_max being the largest eigenvalue, the equilibrium is unique and

```math
x = (I − δG)^(−1) 1
```

Expand the inverse as 1 + δG + δ²G² + …: G^k counts the walks of length k, so each player's effort counts the walks that start from her, those of length k weighted by δ^k. This is her **Katz–Bonacich centrality**, the Katz centrality the Network Lab measured in its [module 03](/network-lab/centrality). In this game, centrality is not just a description: it is how hard people work.

Which player's removal would lower total effort most? Removing player i takes away her own effort and what she brought out in others. Ballester and coauthors found the exact answer: total effort falls by

```math
b_i² / m_ii
```

where b_i is her centrality and m_ii the i-th diagonal entry of (I − δG)^(−1); they called it her **intercentrality**. The **key player**, the one with the highest intercentrality, need not be the most active. In Panel B's bridge network, at δ = 0.3, the most active is player 1 in the triangle, with 4.1655; but the key player is player 4, the bridge between the triangle and the rest, whose removal lowers total effort by 11.3988 against 10.9163 for player 1. Player 1's effort is inflated by the triangle's walks that loop back to her; player 4 holds the network together. The working paper behind the article spoke of crime networks: if the police can remove one person, whom should they pick?

## Coordination on a network

When each link is a coordination game, the question changes: not how much to do, but which option to use. Stephen Morris (2000) showed that a new option spreads through the whole network only if, at every stage, the players who have not switched yet each have enough neighbours who already did. The Network Lab's [module 13](/network-lab/social-contagion-network-effects) runs these cascades; we do not repeat them here.

## Building the network

So far the network was given. Who would build it? Matthew Jackson and Asher Wolinsky (1996) proposed the **connections model**. Each link costs c to each of its two ends. A player gets δ^d from every other player at distance d, with 0 < δ < 1: friends are worth δ, friends of friends δ², and so on. The network is **pairwise stable** if no player gains by cutting one of her links, and no two players would both gain, one of them strictly, by adding a link between them.

Which network has the largest total? The **efficient network** is the complete one when c < δ − δ²: a direct link beats the distance of 2 it replaces. It is the star when δ − δ² < c < δ + (n − 2)δ²/2: the star connects everyone at distance at most 2 with the fewest links. Above, it is the empty one.

Which networks are pairwise stable? When c < δ − δ² the complete network is the only one: any two players not linked would gain by linking. When δ − δ² < c < δ the star is stable, but not the only stable network. When c > δ no stable network has a player with a single link: her partner gets only δ from that link and pays c. The empty network is then stable.

So between δ and δ + (n − 2)δ²/2 the efficient network, the star, is not stable. Its hub pays c for each leaf and gets back only δ, the value of that leaf; the leaf's own gain, reaching everyone through the hub, is far larger, but in this model she cannot pay the hub to keep the link. Figure F2 draws the four regions.

```figure
formation
```

Jackson and Alison Watts (2002) let pairs of players add and cut links one at a time, chosen at random, and asked where the process ends: Panel C runs it. Venkatesh Bala and Sanjeev Goyal (2000) let a single player pay for a link on her own, as in a phone call that one side pays for; in their model a star, with the hub paying for every link, comes back as an equilibrium. The Network Lab's [module 05](/network-lab/growth-mechanisms) showed another way hubs arise: by growth.

```box
Lightning: who opens the channels?
A Lightning channel is a link between two nodes. Opening one locks funds and costs an on-chain fee; it brings reachability, and to the nodes in the middle of many routes it brings routing fees.

**Models.** Georgia Avarikioti, Rolf Scheuner and Roger Wattenhofer (2019) modelled channel networks as network creation games and found that the star is a Nash equilibrium when the owners of each channel may set its fee as they wish. Zeta Avarikioti, Lioba Heimbach, Yuyi Wang and Wattenhofer (2020) used betweenness centrality as a measure of the fees a node can expect and gave bounds on the price of anarchy and of stability.

**The data.** Jian-Hong Lin, Kevin Primicerio, Tiziano Squartini, Christian Decker and Claudio Tessone (2020) followed the network for 18 months, from January 2018 to July 2019, when it had 8,216 users and 122,517 active channels. On average over the period, 10% of the nodes held 80% of the bitcoins at stake, the structure became more and more core–periphery, and removing its hubs split it into many pieces.

**A reading.** In the connections model stars are efficient when links cost something but not too much, and a hub keeps its links only if each is worth its cost to the hub: routing fees are one way to pay it. Since one side opens and funds a channel, Bala and Goyal's one-sided links are a closer fit than Jackson and Wolinsky's. This is a hypothesis, not a description: real channels differ in capacity, fees change, and the network has grown and changed since 2019.
```

## Next

[Module 10](/game-theory-lab/coalitions-sharing): when players can sign binding agreements, which coalitions form and how they share what they make together; with a Bitcoin box on mining pools.

<!-- simulation -->

## Further reading

- Jackson, M. O. (2008). *Social and Economic Networks*. Princeton University Press. Ch. 6 (strategic network formation), 9 (decisions, behavior and games on networks) and 11 (game-theoretic modeling of network formation).
- Nisan, N., Roughgarden, T., Tardos, É. and Vazirani, V. (eds.) (2007). *Algorithmic Game Theory*. Cambridge University Press. Ch. 19 (network formation games and the potential function method) and 24 (cascading behavior in networks).
- Kearns, M., Littman, M. L. and Singh, S. (2001). Graphical models for game theory. *UAI 2001*.
- Bramoullé, Y. and Kranton, R. (2007). Public goods in networks. *Journal of Economic Theory* 135, 478–494.
- Bramoullé, Y., Kranton, R. and D'Amours, M. (2014). Strategic interaction and networks. *American Economic Review* 104, 898–930.
- Ballester, C., Calvó-Armengol, A. and Zenou, Y. (2006). Who's who in networks. Wanted: the key player. *Econometrica* 74, 1403–1417.
- Morris, S. (2000). Contagion. *Review of Economic Studies* 67, 57–78.
- Jackson, M. O. and Wolinsky, A. (1996). A strategic model of social and economic networks. *Journal of Economic Theory* 71, 44–74.
- Jackson, M. O. and Watts, A. (2002). The evolution of social and economic networks. *Journal of Economic Theory* 106, 265–295.
- Bala, V. and Goyal, S. (2000). A noncooperative model of network formation. *Econometrica* 68, 1181–1229.
- Avarikioti, G., Scheuner, R. and Wattenhofer, R. (2019). Payment networks as creation games. *CBT 2019* (arXiv:1908.00436).
- Avarikioti, Z., Heimbach, L., Wang, Y. and Wattenhofer, R. (2020). Ride the Lightning: the game theory of payment channels. *Financial Cryptography 2020*, 264–283 (arXiv:1912.04797).
- Lin, J.-H., Primicerio, K., Squartini, T., Decker, C. and Tessone, C. J. (2020). Lightning Network: a second path towards centralisation of the Bitcoin economy. *New Journal of Physics* 22, 083022.
- The Network Lab, [module 03](/network-lab/centrality), [module 05](/network-lab/growth-mechanisms) and [module 13](/network-lab/social-contagion-network-effects).
