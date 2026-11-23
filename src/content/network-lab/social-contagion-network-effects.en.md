<!-- DRAFT: to be reviewed by Adriano -->

## Not a germ

Nobody decides to catch a cold. Taking up a habit, a product or a belief is a decision, and people who decide look at what others have decided. There are two good reasons to do so. The others may know something: a full restaurant is a hint about the food. Or the thing itself may be worth more when others have it: a telephone, a language, a file format. Either way one contact is rarely enough, and the conclusions of [module 12](/network-lab/epidemics-on-networks) change. Outcomes tip, clusters stop a cascade where they used to feed an epidemic, hubs become hard to convince, and long ties stop helping.

## Wrong together

Take the first reason alone. People choose in turn between two options, one of them right. Each has a private signal that is right with probability q, and each sees what the earlier ones chose but not their signals. Banerjee (1992) and Bikhchandani, Hirshleifer and Welch (1992) followed the reasoning through. While the choices are level or one apart, each person's choice reveals their signal. As soon as two more people have chosen one way than the other, the next person's own signal cannot tip the balance: they follow, whatever they privately know. So does everyone after them, and since their choices no longer reveal anything, nothing more is learned. This is an **information cascade**. Each person is acting sensibly, and the crowd may be wrong: with probability

```math
(1 − q)² / (q² + (1 − q)²)
```

which is 0.31 for q = 0.6. The same people deciding alone and voting would do far better: the majority of 25 independent choices is right 85% of the time (exercise 2).

```figure
cascade
```

Salganik, Dodds and Watts (2006) built the experiment. In an artificial music market 14,341 people listened to 48 unknown songs and could download them, either without seeing what others had done or in one of eight separate "worlds" that showed the download counts of earlier participants. Stronger social influence made success both more unequal and less predictable from one world to the next: the best songs rarely did poorly and the worst rarely did well, but anything else could happen.

## Thresholds

Granovetter (1978) put the second ingredient in one number per person: the **threshold**, how many others must already be in before this one joins. A hundred people stand in a square with thresholds 0, 1, 2, … 99. The first starts, which is enough for the second, and so on to the last: a riot of a hundred. Now change the one threshold 1 into a 2. The first starts, nobody follows, and the riot is one person (exercise 1). Two crowds that are almost the same end as differently as two crowds can, so the outcome says little about what the crowd wanted.

```figure
riot
```

In general, if F is the distribution of the thresholds, the outcome is the first r with

```math
r = N F(r)
```

In Granovetter's example the thresholds are normally distributed around 25. As their standard deviation grows the outcome creeps up to about 6 people, and near 12.2 it jumps to nearly 100. The first simulation draws real crowds from that distribution. At a standard deviation of 12, where the smooth curve stops at 4 people, 17% of 200 crowds end with more than half in the riot.

## Worth more when others have it

A good with a **network effect** is worth more to each user the more users it has (Rohlfs 1974; Katz and Shapiro 1985). Let person x value it r(x) f(z) when a share z of the population uses it, and let the price be p. The shares at which nobody wants to change solve

```math
p = r(z) f(z)
```

besides zero, which is always one of them: with no users the good is worth nothing. Typically there are two more. The lower one is unstable, the **tipping point** or **critical mass**: below it the users drift away, above it they multiply up to the higher, stable one (exercise 3). A network good that does not reach its critical mass fails however good it is, and one that passes it is hard to dislodge: **lock-in**.

Seen from outside, adoption draws an S. Bass (1969) wrote it in one line,

```math
dF/dt = (p + qF)(1 − F)
```

with p for those who adopt on their own and q for imitation. A meta-analysis of 213 applications (Sultan, Farley and Lehmann 1990) is usually quoted for averages near p = 0.03 and q = 0.38 a year: imitation does most of the work (exercise 4). The classic case is hybrid corn in Iowa, studied farmer by farmer by Ryan and Gross (1943) and state by state by Griliches (1957). [Complexity Lab module 13](/lab/bitcoin-complex-system) tells that story.

## On a network: clusters

Now let people look only at their neighbours. Each link is a small coordination game: the new option pays a to both ends if both use it, the old one b. A node with a share s of its neighbours on the new option gains by switching when s a ≥ (1 − s) b, that is when

```math
s ≥ q = b / (a + b)
```

(Morris 2000). The better the new option, the lower q. A cascade can cross a single link, the weak tie of [module 04](/network-lab/triangles-weak-ties-motifs), only towards a node for which one neighbour is a share q of all it has. And a set of nodes each of which has more than 1 − q of its links inside the set cannot be entered at all: no member ever sees a share q outside. In the form given by Easley and Kleinberg (2010), such clusters are the only obstacle: a set of first adopters fails to convert everyone exactly when the rest of the network contains one. The communities of [module 09](/network-lab/communities) are where innovations stop (exercise 5).

## The cascade window

Watts (2002) asked when one adopter can start a cascade across a random network of mean degree z in which every node has the same threshold φ. A node with k links falls to a single neighbour only if k ≤ 1/φ: call it **vulnerable**. A **global cascade** needs a giant component of vulnerable nodes, and that exists when

```math
Σ_{k ≤ 1/φ} k(k − 1) p_k / z > 1
```

This holds in a window of z. With too few links nothing is connected; with too many, nobody is vulnerable. For φ = 0.18 the **cascade window** runs from z = 1.02 to 5.76. In the second simulation, at z = 4, 0.875 of 200 random seeds start a global cascade. At z = 5.75 only 0.180 do, and those that do take 0.997 of the nodes: near the upper edge cascades are rare and total. The system looks stable until it is not.

Hubs are hard to convince, since they need many adopting neighbours. Watts found that a more heterogeneous degree distribution makes a network less vulnerable to cascades. Here a network grown by preferential attachment with the same mean degree cascades from 0.285 of random seeds; from one of the 20 largest hubs, both networks cascade every time. Yet Watts and Dodds (2007) concluded that large cascades are driven not by influentials but by a critical mass of easily influenced people.

## Complex contagion

Centola and Macy (2007) called a contagion **complex** when adoption needs more than one adopting neighbour. A single long tie then carries nothing. The shortcuts that make a world small for a disease ([Complexity Lab module 03](/lab/small-worlds)) do not help a behaviour, and too much rewiring destroys the clustering it travels on. In the third simulation simple contagion on a ring crosses 90% of the nodes in 562 steps, and in 19.4 when one link in a hundred is rewired; complex contagion goes from 749 to 685.9. With half the links rewired it reaches 0.005 of the nodes.

Centola (2010) tested this with 1,528 people in an online health community: a behaviour reached 54% of those in clustered networks against 38% in random ones, and spread faster. Ugander, Backstrom, Marlow and Kleinberg (2012) found that the chance of joining Facebook was governed by the number of separate groups among a person's contacts already there, not by the number of contacts. One caution, from [module 08](/network-lab/who-connects-to-whom): friends who behave alike may have been alike before (Aral, Muchnik and Sundararajan 2009; Shalizi and Thomas 2011).

```box
Money as a network good
Money is the purest network good: a medium of exchange is worth holding because others accept it (Menger 1892). Critical mass, tipping and lock-in apply to it as to a telephone network.

The measured version is a generalised Metcalfe law, value ∝ n^k ([Complexity Lab module 13](/lab/bitcoin-complex-system)). For Bitcoin it has been fitted several times: Alabi (2017) and Peterson (2018) with Metcalfe-type laws; Wheatley and colleagues (2019), market capitalisation against active addresses, k = 1.69; Santostasi and Perrenod (2026), price against addresses with a non-zero balance, k = 1.838 (see our [Publications page](/research/publications#preprint)).

Two cautions. An address is not a user (the box of module 12). And two quantities that both grow in time are correlated whatever links them: the fit alone does not show that users make the value. The exponent also depends on the period: by sub-period it was 1.59, 2.64, 3.28 and 6.83 (Pecere 2026, supplement, section S2).

The models of this module say when a network good takes off or fails. They do not say what it is worth.
```

## Next

[Module 14](/network-lab/capstone-a-real-network) is the capstone: every tool of the course on one real network.

<!-- simulation -->

## Further reading

- Easley, D. and Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Ch. 16, 17 and 19.
- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press. Ch. 10.
- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press. Ch. 16.
- Banerjee, A. V. (1992). A simple model of herd behavior. *Quarterly Journal of Economics* 107, 797–817.
- Bikhchandani, S., Hirshleifer, D. and Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. *Journal of Political Economy* 100, 992–1026.
- Salganik, M. J., Dodds, P. S. and Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. *Science* 311, 854–856.
- Granovetter, M. (1978). Threshold models of collective behavior. *American Journal of Sociology* 83, 1420–1443.
- Rohlfs, J. (1974). A theory of interdependent demand for a communications service. *Bell Journal of Economics and Management Science* 5, 16–37.
- Katz, M. L. and Shapiro, C. (1985). Network externalities, competition, and compatibility. *American Economic Review* 75, 424–440.
- Bass, F. M. (1969). A new product growth for model consumer durables. *Management Science* 15, 215–227.
- Sultan, F., Farley, J. U. and Lehmann, D. R. (1990). A meta-analysis of applications of diffusion models. *Journal of Marketing Research* 27, 70–77.
- Ryan, B. and Gross, N. C. (1943). The diffusion of hybrid seed corn in two Iowa communities. *Rural Sociology* 8, 15–24.
- Griliches, Z. (1957). Hybrid corn: an exploration in the economics of technological change. *Econometrica* 25, 501–522.
- Morris, S. (2000). Contagion. *Review of Economic Studies* 67, 57–78.
- Watts, D. J. (2002). A simple model of global cascades on random networks. *PNAS* 99, 5766–5771.
- Watts, D. J. and Dodds, P. S. (2007). Influentials, networks, and public opinion formation. *Journal of Consumer Research* 34, 441–458.
- Centola, D. and Macy, M. (2007). Complex contagions and the weakness of long ties. *American Journal of Sociology* 113, 702–734.
- Centola, D. (2010). The spread of behavior in an online social network experiment. *Science* 329, 1194–1197.
- Ugander, J., Backstrom, L., Marlow, C. and Kleinberg, J. (2012). Structural diversity in social contagion. *PNAS* 109, 5962–5966.
- Shalizi, C. R. and Thomas, A. C. (2011). Homophily and contagion are generically confounded in observational social network studies. *Sociological Methods and Research* 40, 211–239.
- Aral, S., Muchnik, L. and Sundararajan, A. (2009). Distinguishing influence-based contagion from homophily-driven diffusion in dynamic networks. *PNAS* 106, 21544–21549.
- Menger, K. (1892). On the origin of money. *Economic Journal* 2, 239–255.
- Alabi, K. (2017). Digital blockchain networks appear to be following Metcalfe's Law. *Electronic Commerce Research and Applications* 24, 23–29.
- Peterson, T. (2018). Metcalfe's Law as a model for Bitcoin's value. *Alternative Investment Analyst Review* 7(2), 9–18.
- Wheatley, S., Sornette, D., Huber, T., Reppen, M. and Gantner, R. N. (2019). Are Bitcoin bubbles predictable? Combining a generalized Metcalfe's Law and the Log-Periodic Power Law Singularity model. *Royal Society Open Science* 6, 180538.
- Santostasi, G. and Perrenod, S. (2026). A Mechanistic Derivation of the Bitcoin Price Power Law: Network Adoption Dynamics and Generalised Metcalfe Scaling. Zenodo. [doi.org/10.5281/zenodo.19387099](https://doi.org/10.5281/zenodo.19387099)
- Pecere, A. (2026). Bitcoin's power-law trend: what the regression identifies, and the four-year oscillation around it. Zenodo. [doi.org/10.5281/zenodo.23933138](https://doi.org/10.5281/zenodo.23933138)
