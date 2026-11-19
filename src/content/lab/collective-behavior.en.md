<!-- DRAFT: to be reviewed by Adriano -->

## Starlings over Rome

On winter evenings, before they settle for the night, flocks of tens of thousands of starlings wheel over Rome. The cloud thickens, thins, folds over itself and changes direction in a fraction of a second, and no bird is in charge.

In the 2000s a group of physicists in Rome led by Giorgio Parisi, with Andrea Cavagna and Irene Giardina, decided to measure this. In the STARFLAG project they placed synchronised cameras on the roof of Palazzo Massimo, a seat of the Museo Nazionale Romano near Termini station, close to one of the city's large starling roosts, and filmed the flocks in stereo, then reconstructed the position of every bird in three dimensions, thousands at a time. In 2021 Parisi received the Nobel prize in physics for his work on how disorder and fluctuations shape complex physical systems.

## What the starlings showed

Two findings stood out. The first concerns *whom* a starling follows. In a flock that grows denser or sparser, a bird does not track everyone within a fixed distance. It tracks a fixed number of nearest neighbours, about six or seven, however near or far they happen to be (Ballerini and colleagues, 2008). Physicists call this a **topological** interaction, as opposed to a **metric** one. It matters for cohesion: when the flock stretches, a metric rule would leave the birds at the edges with nobody in range, while a topological rule keeps every bird linked to the group.

The second concerns how far information travels. Watch how each bird's velocity differs from the flock's average, and those fluctuations turn out to be correlated across the whole flock, whatever its size (Cavagna and colleagues, 2010). These **scale-free correlations** are a signature of a system poised near a critical point, the theme of Module 08. They are what lets a turn started by a few birds sweep through thousands almost at once, as when a falcon attacks.

## Boids

In 1987 the computer graphics researcher Craig Reynolds wanted to animate flocks without scripting every bird. His "boids" follow three local rules:

1. **separation**: don't crowd your neighbours;
2. **alignment**: steer towards their average heading;
3. **cohesion**: steer towards their average position.

Each boid sees only nearby boids, there is no leader and no global plan, and yet the result looks strikingly alive: flocks form, split around obstacles and merge again. Boids became the ancestor of the crowd and swarm animation used in films and video games.

## The physicist's minimal model

Reynolds' rules were built to look right. In 1995 Tamás Vicsek and colleagues asked a physicist's question: what is the least you need for collective motion? Their answer kept only alignment and added noise. Particles move at constant speed. At every step each one adopts the average heading of the particles within a radius r, then turns by a random angle drawn from an interval of width η.

To measure order they used the **order parameter**

```math
φ = |average velocity| / speed
```

If everyone flies the same way, φ = 1. If headings are random, φ is close to 0; for N particles it is about 1/√N, the size of a random fluctuation. As the noise falls or the density rises, φ climbs from near 0 to near 1. This is a **phase transition**, like a magnet ordering as it cools, but in a system that is constantly moving and constantly fed with energy, far from equilibrium.

That difference turned out to be deep. John Toner and Yuhai Tu showed in 1995 that such "active matter" can have true long-range order in two dimensions. A flat equilibrium system of spins that can point in any direction cannot: thermal fluctuations always destroy order over large distances. Self-propelled particles escape that limit because moving carries information across the group. Moving changes the rules.

## Schools and decisions

Fish schools add more structure. Iain Couzin and colleagues modelled each fish with three nested zones: repulsion close by, orientation further out, attraction beyond (2002). Changing the sizes of the zones switches the group between a loose **swarm**, a rotating **mill** around an empty centre, and **parallel** motion, the same three patterns that real schools show. The group can also keep a "memory" of its recent shape.

In 2005 Couzin and colleagues asked how a moving group decides where to go. A small minority of informed individuals, each with a preferred direction, can steer the whole group, and the larger the group, the smaller the share of informed members it needs. Nobody has to know who the informed ones are, and nobody has to signal: the influence spreads through ordinary alignment.

## Ants and stigmergy

Ants coordinate through what they leave behind. In 1959 the French zoologist Pierre-Paul Grassé, studying how termites rebuild their nests, coined the word **stigmergy** for coordination through traces left in a shared environment rather than through direct communication. A termite responds to the structure built so far, and its work changes the structure the next termite meets.

Pheromone trails are the classic example. In 1989 Simon Goss, Jean-Louis Deneubourg and colleagues offered Argentine ants two bridges of different lengths between their nest and a food source. The colonies soon converged on the shorter one. No ant compares lengths. Ants that happen to take the short path come back sooner, so pheromone builds up faster there, and more ants then choose it: **positive feedback**. Evaporation acts as **negative feedback**, slowly erasing trails that are no longer used. When the short bridge was offered only after the colony had settled on the long one, the ants mostly stayed where they were: the trail had become a habit.

Marco Dorigo, at the Politecnico di Milano in the early 1990s, turned this into **ant colony optimisation**: artificial ants lay artificial pheromone on the edges of a graph, and good routes emerge, for problems such as the travelling salesman or routing traffic in networks.

## What these systems share

Starlings, boids, fish and ants have the same ingredients: many simple agents; local information only; feedback, positive to amplify a small advantage and negative to keep things stable; and no leader. That last point is a strength. A flock with a leader fails when the leader does. A flock in which every bird follows its neighbours keeps working when any of them is lost, and it adapts at once, because the decision is made everywhere at the same time.

## A Bitcoin connection

As an analogy, Bitcoin miners coordinate stigmergically. They do not negotiate with each other about which history is the right one. Each simply extends the valid chain with the most accumulated work, a shared trace that every new block reinforces. Blocks on forks that lose the race are left behind, like a trail that is no longer walked and evaporates.

The network has a topological side too. A starling tracks a fixed number of neighbours whatever their distance; a Bitcoin node keeps a fixed, small number of outbound peers wherever they are on the planet (Module 02). In Bitcoin Core these are eight connections that relay transactions and blocks plus two that relay only blocks. The network is organised by links, not by geography.

<!-- simulation -->

## What to observe

1. In Panel A, set alignment to zero. What happens to the order parameter φ, and to the number of groups?
2. Turn on the predator with metric neighbours, then switch to topological ones. Which flock stays together as the predator stretches it, and what does the number of groups say?
3. With topological neighbours, lower k to 1 or 2. Does the flock still hold together?
4. In the Vicsek experiment, where does φ drop, and does the drop become sharper with more particles? At η = 2π, compare φ with the dashed line.
5. In the double bridge, set the length ratio to 1. Do the ants still pick one branch, and which one? Now set it to 2 and run many colonies.
6. Lower the evaporation to zero and open the short branch late. Do the ants find it? Raise evaporation to 0.05 and try again.

## Further reading

- C. W. Reynolds, "Flocks, herds and schools: a distributed behavioral model", *Computer Graphics* 21(4) (1987) 25–34.
- P.-P. Grassé, "La reconstruction du nid et les coordinations interindividuelles chez *Bellicositermes natalensis* et *Cubitermes* sp.", *Insectes Sociaux* 6 (1959) 41–80.
- S. Goss, S. Aron, J.-L. Deneubourg & J. M. Pasteels, "Self-organized shortcuts in the Argentine ant", *Naturwissenschaften* 76 (1989) 579–581.
- T. Vicsek et al., "Novel type of phase transition in a system of self-driven particles", *Physical Review Letters* 75 (1995) 1226–1229.
- J. Toner & Y. Tu, "Long-range order in a two-dimensional dynamical XY model: how birds fly together", *Physical Review Letters* 75 (1995) 4326–4329.
- M. Dorigo, V. Maniezzo & A. Colorni, "Ant system: optimization by a colony of cooperating agents", *IEEE Transactions on Systems, Man, and Cybernetics B* 26 (1996) 29–41.
- I. D. Couzin et al., "Collective memory and spatial sorting in animal groups", *Journal of Theoretical Biology* 218 (2002) 1–11.
- I. D. Couzin et al., "Effective leadership and decision-making in animal groups on the move", *Nature* 433 (2005) 513–516.
- M. Ballerini et al., "Interaction ruling animal collective behavior depends on topological rather than metric distance", *Proceedings of the National Academy of Sciences* 105 (2008) 1232–1237.
- A. Cavagna et al., "Scale-free correlations in starling flocks", *Proceedings of the National Academy of Sciences* 107 (2010) 11865–11870.
- T. Vicsek & A. Zafeiris, "Collective motion", *Physics Reports* 517 (2012) 71–140.
