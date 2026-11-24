<!-- DRAFT: to be reviewed by Adriano -->

## One network, every question

This module adds no theory. It takes one real network, the airports of the world and the routes between them, and asks of it the questions of the whole course, in order, with the code of modules 01 to 13. Each step names its tool, gives a number, and says what the number does not show.

## 1. What is this network?

The data come from the OpenFlights databases: a list of airports and a list of routes as they stood in June 2014, when the route file stopped being updated. It is a snapshot, and an old one. We draw a link between two airports when at least one airline flies between them, in either direction; the weight of the link is the number of airlines that do. The weight counts airlines: not flights, not seats, not passengers. These are the choices of [module 01](/network-lab/reading-a-network), and someone else made half of them: whoever compiled the file decided what a route is ([module 02](/network-lab/what-are-we-measuring)).

The result has 3,214 airports and 18,858 links, in 7 components: one of 3,188 airports and six islands of 2 to 10. Everything below is measured on the large one.

```figure
map
```

Look at the raw data before computing anything. Show the ten longest links: the third is Sydney–Dallas, 13,808 km. The first two are 16,082 and 15,937 km long, between small airports, flown by one airline. One record of the airport file carries the name and the coordinates of an airfield in California with the city and country of Solwezi, in Zambia. Its two routes, to Lusaka and Ndola, are real and short; the map draws them across an ocean. We leave the record as it is.

## 2. Is it a small world?

Two airports are on average 3.96 flights apart, and the mean clustering is 0.49. Against what? The null model of module 02 keeps every airport's number of routes and rewires them at random: over ten rewirings clustering falls to 0.09. So this is a small world, with far more triangles than its degrees explain.

But the rewired networks are smaller still: 3.24 flights against 3.96. Geography has a cost. Most routes are short, the median link being 1,155 km long, and a random rewiring pays no such cost. The habit to keep is the comparison itself: a number means little until a null model says what chance alone would give.

## 3. Is it scale-free?

The tail is heavy: the median airport has 3 routes, 22.1% have one, and the largest has 248. Whether it is a power law is a question for the recipe of [module 05](/network-lab/heavy-tails-done-right), and the answer is no. The fitted exponent moves with the lower cut-off: 1.71 at k_min = 2, 1.80 at 5, 1.90 at 10, 2.14 at 20, 2.40 at 30. A power law has one exponent; a drift like this is the sign of a tail that bends. The test rejects the fit (p below 0.005), and a lognormal and a power law with a cut-off both fit better. Guimerà and colleagues (2005) reached the same verdict on the air network of November 2000, counted by cities: a truncated power law.

What a snapshot cannot show is how the network grew ([modules 06](/network-lab/growth-mechanisms) and [07](/network-lab/fitness-and-competition)).

## 4. Who is central?

By number of routes: Amsterdam, Frankfurt, Paris. By betweenness ([module 03](/network-lab/centrality)): Paris, Los Angeles and Anchorage. Anchorage has 34 routes; 283 airports have more.

```figure
outliers
```

Degree and betweenness agree on the whole (rank correlation 0.82), and 45.8% of the airports lie between no two others. The interesting airports are those out of line. Guimerà and colleagues found the same anomaly in their data, and named Anchorage. Why it is there is a question for step 6.

## 5. Who connects to whom?

The assortativity of [module 08](/network-lab/who-connects-to-whom) is r = −0.02, which looks like no pattern at all. But the rewired networks give −0.10: with hubs this large, chance alone makes hubs link to small airports. Against that baseline the real network is more assortative than expected, by more than ten standard deviations. Its hubs form a rich club: airports with more than 100 routes are about 1.2 times as densely linked to each other as in the rewirings, and the eight largest about 1.3 times. Colizza and colleagues (2006) found a mild rich club in air transport with the same normalisation. One number, r, hid all of it.

## 6. Communities

Louvain ([module 09](/network-lab/communities)) gives a modularity near 0.66, and between 18 and 25 groups over ten runs: there is no single answer. The groups are regions of the world, and they agree only in part with the time-zone regions of the file, with a normalised mutual information between 0.62 and 0.66. The labels are not the truth about the groups, and the groups are not the truth about the labels (Peel and colleagues 2017).

In nine of the ten runs one group is Alaska: 131 airports, all in the United States, with Anchorage as its hub. That explains step 4. Anchorage is not a large airport; it is the way out of a region. In the tenth run Alaska falls into several small groups, and Anchorage goes with Atlanta: the same method, another answer. Close it alone, and 87 airports are cut off from the rest.

## 7. Weights

The strength of an airport, the sum of its weights, grows as its degree to the power 1.12 ([module 10](/network-lab/weights-flows-navigation)). Barrat and colleagues (2004) found 1.5 on the airports of 2002, with weights equal to the seats on offer. Our weight is a poorer measure of traffic: 55.6% of the links have one airline, and the largest weight is 20. Before asking what the weights say, ask what was weighed.

## 8. Robust or fragile?

Remove 10% of the airports at random and 86% of the network is still in one piece ([module 11](/network-lab/robustness-and-cascades)). Remove the 10% with most routes and 14% is. Early on, betweenness is the sharper order: with 5% removed, 59% is left, against 77% by degree. The formula gives a critical fraction of 0.984 for random failures. Robust against what, then? Against accidents, not against a plan.

## 9. What spreads?

For a germ ([module 12](/network-lab/epidemics-on-networks)) the threshold is T_c = 0.016: almost any transmissible disease can travel this network. In a simulation from Atlanta, the time of arrival at an airport follows its distance in flights (rank correlation 0.71) and its size (−0.87), and hardly its distance in kilometres (0.09). Brockmann and Helbing (2013) showed on real epidemics that an effective distance built from traffic predicts arrival times where geographic distance does not.

For a fashion ([module 13](/network-lab/social-contagion-network-effects)) that needs 18% of one's neighbours, only 1.6% of the airports can start a global cascade, and 2 of the 20 largest hubs. The same network is open to a germ and closed to a fashion.

## 10. The method

Ten questions to ask of any network, one per step.

1. What is a node, what is a link, and who recorded them?
2. Have you looked at the raw data?
3. Compared with which null model?
4. What is the distribution, before the average?
5. Which question does this centrality answer?
6. What does one number hide about mixing?
7. Which method gave these communities, and what would another give?
8. What do the weights measure, and whom do they change?
9. Robust against what?
10. Which process runs on it? It matters as much as the network.

```box
The same questions for Bitcoin
Bitcoin is several networks at once ([module 01](/network-lab/reading-a-network)): transactions and addresses, the peer-to-peer network, payment channels, and the people who hold it. The course met each with one tool: heavy tails and their test ([05](/network-lab/heavy-tails-done-right)), flows in channels ([10](/network-lab/weights-flows-navigation)), eclipse and robustness ([11](/network-lab/robustness-and-cascades)), adoption ([12](/network-lab/epidemics-on-networks)), value and users ([13](/network-lab/social-contagion-network-effects), and [Complexity Lab module 13](/lab/bitcoin-complex-system)).

The method of this module applies to all of them, and its first line matters most. An address is not a user. A public channel does not show its balance. A crawler sees only the nodes that accept connections.

The workbench below accepts your own network: for example the channel graph as your own Lightning node sees it, the output of `lncli describegraph`. Nothing leaves the browser.
```

## The end of the course

The course ends here. The fourteen modules are on the [index of the Network Lab](/network-lab); the [Complexity Lab](/lab) takes the same ideas towards dynamics.

<!-- simulation -->

## Further reading

- OpenFlights. Airport and route databases. https://openflights.org/data (routes as of June 2014; Open Database License).
- Guimerà, R., Mossa, S., Turtschi, A. and Amaral, L. A. N. (2005). The worldwide air transportation network: anomalous centrality, community structure, and cities' global roles. *PNAS* 102, 7794–7799.
- Barrat, A., Barthélemy, M., Pastor-Satorras, R. and Vespignani, A. (2004). The architecture of complex weighted networks. *PNAS* 101, 3747–3752.
- Colizza, V., Flammini, A., Serrano, M. Á. and Vespignani, A. (2006). Detecting rich-club ordering in complex networks. *Nature Physics* 2, 110–115.
- Colizza, V., Barrat, A., Barthélemy, M. and Vespignani, A. (2006). The role of the airline transportation network in the prediction and predictability of global epidemics. *PNAS* 103, 2015–2020.
- Brockmann, D. and Helbing, D. (2013). The hidden geometry of complex, network-driven contagion phenomena. *Science* 342, 1337–1342.
- Peel, L., Larremore, D. B. and Clauset, A. (2017). The ground truth about metadata and community detection in networks. *Science Advances* 3, e1602548.
- Barabási, A.-L. (2016). *Network Science*. Cambridge University Press.
- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press.
- Latora, V., Nicosia, V. and Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press.
- Easley, D. and Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press.
