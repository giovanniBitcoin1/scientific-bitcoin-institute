<!-- DRAFT: to be reviewed by Adriano -->

## How people find jobs

Around 1970 Mark Granovetter interviewed people in a suburb of Boston who had recently changed job: professionals, technicians, managers. Many had heard of the new job from someone they knew, and he asked those how often they were seeing that person at the time. Often, meaning at least twice a week: 16.7%. Occasionally: 55.6%. Rarely, meaning once a year or less: 27.8% (Granovetter 1973). Five out of six had got the news from somebody they did not see often: an old colleague, a former classmate.

That looks backwards. The people closest to you are the ones most willing to help. But they move in the same circles as you, read the same notices and hear the same rumours: what they know, you mostly know already. News comes from further away. To see why "further away" and "weak" go together we have to look at what stands around a link, and the smallest thing that can stand around a link is a triangle.

## Triangles close

If A knows B and A knows C, then B and C are more likely to meet than two strangers are. Rapoport (1953) built this bias into a model of how information spreads, and three plain reasons stand behind it. B and C have an opportunity: both spend time with A. They have a reason to trust each other: A vouches for both. And often all three share a context, a school or an office, that would have brought them together anyway.

The effect can be watched. Kossinets and Watts (2006) followed a year of e-mail among some 43,000 students and staff of a university. Two people who had never written to each other were more likely to start, the more correspondents they had in common.

This is called **triadic closure**: an open triple, two links that meet at a node, tends to become a triangle. The clustering coefficient and the transitivity of module 01 are the footprint it leaves. In the first simulation half of the new links close a triangle, and the transitivity ends at 0.167, five times that of a random network with the same nodes and links (0.033).

## Bridges

Now the opposite of a triangle. A **bridge** is a link whose removal splits the network in two. Real bridges are rare, because in a large network there is nearly always another way round. A weaker notion is more useful: a **local bridge** is a link whose two ends have no neighbour in common. Remove it, and its ends are at least three steps apart.

Between "no neighbour in common" and "all neighbours in common" there is a scale. The **neighbourhood overlap** of a link is the number of neighbours its two ends share, divided by the number of nodes that are neighbours of at least one of them (the two ends themselves left out):

```math
O_ij = n_ij / (k_i − 1 + k_j − 1 − n_ij)
```

Here `n_ij` is the number of common neighbours and `k_i`, `k_j` are the two degrees. The overlap is 0 on a local bridge and 1 when the two ends have exactly the same friends.

```figure
overlap
```

In the figure, b and c share a and d, and between them they have one more neighbour, e: overlap 2/3. The link f–g has overlap 0, and so have h–j and i–k, which are local bridges without being bridges.

Granovetter's argument needs one assumption. Call a tie strong or weak, and suppose that two strong ties from the same person always come with some tie, strong or weak, between the other two: if you are close to two people, they at least know each other. Then take a local bridge A–B, where A has some other strong tie, to C. If A–B were strong too, B and C would have to know each other, and C would be a common neighbour of A and B. A local bridge has none. So a local bridge is a weak tie.

The assumption is too rigid to be literally true, but the conclusion survives in a softer form: the links that lead out of your own circle are, for the most part, weak ones. And the links that lead out are the ones that carry news you have not heard.

## A test on millions

For thirty years the argument could be tested only on small samples. Onnela and colleagues (2007) had the calls of a mobile phone operator over 18 weeks: about 4.6 million people and 7 million links, a link being two people who had called each other, and its strength the time they spent talking. Two results stand out.

First, overlap grows with strength for the great majority of the links. The people you talk to most are the ones whose friends are your friends.

Second, they took the network apart. Removing the weakest ties first makes it fall to pieces all at once, when a certain share of the links is gone. Removing the strongest ties first only shrinks it, with no collapse. The strong ties sit inside groups, where there are plenty of other paths; the weak ties are what joins the groups to each other. The second simulation repeats the experiment on eight groups of 25. With the weakest links removed first, the largest piece falls below half of the network when 6% of the links are gone; with the strongest first it holds until 90%.

Two later studies follow the idea to its consequences. Burt (2004) studied the managers of a large company: those whose contacts spanned separate groups, who sat at the gaps between them, proposed the ideas that senior managers rated best. And Rajkumar and colleagues (2022) report a randomised experiment on more than 20 million members of LinkedIn, in which the site's suggestions of new contacts were varied at random for five years. Weak ties did help people to change job more than strong ones. Measured by the number of contacts two people share, the most useful ties were the moderately weak, not the weakest of all.

## From triangles to motifs

So far links had no direction. Give them one, and three nodes can be joined in many more ways. Counting only the patterns in which the three nodes hang together, and treating as one those that differ only in the names of the nodes, there are thirteen.

```figure
patterns
```

Which of them does a network use? Milo and colleagues (2002) proposed a procedure. Count how many times each pattern occurs. Then build many randomised versions of the network in which every node keeps its number of incoming links, of outgoing links and of mutual links, and nothing else is kept: the null model of module 02, adapted to directions. Count again in each. A **motif** is a pattern that occurs far more often in the real network than in the randomised ones, and the distance is measured as before:

```math
z = (N_real − ⟨N_rand⟩) / σ_rand
```

Their best known example is the network through which the genes of the bacterium *E. coli* switch one another on and off, in which Shen-Orr and colleagues (2002) had first picked out the pattern. X regulates Y, and both regulate Z: the **feed-forward loop**. It occurs 40 times, against 7 ± 3 in the randomised networks.

It also has a job. In its most common form Z needs both X and Y, and Y takes time to build up. A brief pulse of X ends before Y is ready, and nothing happens; a lasting signal gets through, after a delay. The circuit ignores brief signals and answers lasting ones (Mangan and Alon 2003).

Networks of different kinds prefer different patterns. Most food webs have the chain and few feed-forward loops; one family of electronic circuits has the three-node cycle. Milo and colleagues (2004) compared the whole profile of z-scores across many networks and found that these fall into a few families.

In the third simulation a network with feed-forward loops built in shows 39 of them against 15.8 ± 3.3 in its randomised versions: z = 7.0.

## A caution

It is tempting to read every motif as a purpose. Artzy-Randrup and colleagues (2004) scattered nodes on a grid and linked them with a probability that falls with distance, with no selection of any kind. The feed-forward loop came out as a motif all the same, as it does among the neurons of a worm, simply because near neighbours of the same node are near each other. A pattern that beats the null model has not thereby been shown to do something. It has been shown to be something that this null model does not explain.

So the lesson of module 02 returns. The null model is a choice, and the answer depends on it. Geometry, growth and degrees can each produce "motifs". Function has to be shown separately, as Mangan and Alon did, by working out what the circuit does.

## What comes next

Triangles and motifs are local structure. Module 05 goes back to the degrees, and to a claim made far too often: heavy tails, done right.

<!-- simulation -->

## Further reading

- Easley, D. and Kleinberg, J. (2010). *Networks, Crowds, and Markets*. Cambridge University Press. Ch. 3.
- Latora, V., Nicosia, V. and Russo, G. (2017). *Complex Networks: Principles, Methods and Applications*. Cambridge University Press. Ch. 8.
- Newman, M. E. J. (2018). *Networks*, 2nd ed. Oxford University Press. Ch. 7.
- Granovetter, M. S. (1973). The strength of weak ties. *American Journal of Sociology* 78, 1360–1380.
- Rapoport, A. (1953). Spread of information through a population with socio-structural bias: I. Assumption of transitivity. *Bulletin of Mathematical Biophysics* 15, 523–533.
- Kossinets, G. and Watts, D. J. (2006). Empirical analysis of an evolving social network. *Science* 311, 88–90.
- Onnela, J.-P. et al. (2007). Structure and tie strengths in mobile communication networks. *PNAS* 104, 7332–7336.
- Burt, R. S. (2004). Structural holes and good ideas. *American Journal of Sociology* 110, 349–399.
- Rajkumar, K. et al. (2022). A causal test of the strength of weak ties. *Science* 377, 1304–1310.
- Milo, R. et al. (2002). Network motifs: simple building blocks of complex networks. *Science* 298, 824–827.
- Shen-Orr, S. S., Milo, R., Mangan, S. and Alon, U. (2002). Network motifs in the transcriptional regulation network of *Escherichia coli*. *Nature Genetics* 31, 64–68.
- Mangan, S. and Alon, U. (2003). Structure and function of the feed-forward loop network motif. *PNAS* 100, 11980–11985.
- Milo, R. et al. (2004). Superfamilies of evolved and designed networks. *Science* 303, 1538–1542.
- Artzy-Randrup, Y., Fleishman, S. J., Ben-Tal, N. and Stone, L. (2004). Comment on "Network motifs: simple building blocks of complex networks" and "Superfamilies of evolved and designed networks". *Science* 305, 1107.
