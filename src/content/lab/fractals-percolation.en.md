<!-- DRAFT: to be reviewed by Adriano -->

## How long is a coastline?

Walk a pair of dividers along the coast of Britain on a map, counting steps. Halve their opening and walk again: the total comes out longer, because the shorter ruler follows bays and headlands it used to step across. The English physicist Lewis Fry Richardson collected such measurements for coastlines and borders and found that the measured length keeps growing as the ruler shrinks, as a power of the ruler length. His study appeared after his death, in 1961.

In 1967 Benoît Mandelbrot took up Richardson's data in a short paper in *Science*: "How long is the coast of Britain?". The question, he answered, has no single answer. The length depends on the ruler; what stays fixed is how fast it changes with the ruler, and that rate measures something real about the shape: a dimension that need not be a whole number.

## Dimension as a scaling law

Cover a shape with a grid of square boxes of side ε and count N(ε), the boxes that contain part of it. For a straight segment, halving ε doubles the count: N grows like 1/ε. For a filled square, halving ε quadruples it: N grows like 1/ε². In general

```math
N(ε) ∝ ε^(−D)
```

and the exponent D is the **box-counting dimension**:

```math
D = lim (ε → 0) log N(ε) / log(1/ε)
```

In practice you plot log N against log(1/ε) and measure the slope. Nothing forces it to be a whole number.

The **Koch curve** is the classic example. Cut a segment in thirds and replace the middle third with two sides of an equilateral triangle; repeat on each of the four new segments, forever. The curve is four copies of itself, each a third of the size. Shrinking the boxes by three multiplies the count by four, so D = log 4 / log 3 ≈ 1.262: more than a line, less than an area. The **Sierpiński triangle** is made of three half-size copies of itself, so D = log 3 / log 2 ≈ 1.585. You have already met it: it is the pattern that Rule 90 grows from a single cell in Module 05.

Both shapes are **self-similar**: a piece, magnified, looks like the whole. In mathematical fractals the copies are exact at every scale. In nature the similarity is statistical, a magnified piece looks *like* the whole without being a copy, and it holds only over a limited range of scales. Ferns, river networks, the airways of the lungs and lightning all show it. Mandelbrot gathered these examples in *The Fractal Geometry of Nature* (1982).

## Growing a fractal

Fractals can also grow. In 1981 Thomas Witten and Leonard Sander proposed **diffusion-limited aggregation** (DLA). Fix one particle at the centre. Release another far away, let it wander at random until it touches the first, and freeze it there. Repeat: each new particle wanders until it hits the growing cluster and sticks.

The result is not a compact blob but a branching tree. The reason is **screening**: a wandering particle is far more likely to bump into the tip of a branch than to find its way down a narrow fjord between two branches. Tips grow, so they catch even more, and the inside stays hollow. In two dimensions DLA clusters have D ≈ 1.71, and they look remarkably like mineral dendrites, metal deposited by an electric current, and lightning.

## Percolation

Now a different question. Take a square grid and make each site **open** with probability p and closed otherwise, independently. Open sites that touch along a side form **clusters**. Is there an open cluster that connects the top edge to the bottom one? This is **percolation**, introduced by Simon Broadbent and John Hammersley in 1957 to describe fluid seeping through a random medium.

For small p the open sites form small islands and nothing crosses; for large p almost everything is connected. In between there is a sharp change at a **critical probability** p_c. For site percolation on the square lattice, p_c ≈ 0.5927; its exact value is not known, only computed numerically to many digits. For bond percolation, where the links between sites are open instead of the sites, the square lattice's threshold is exactly 1/2, a result proved by Harry Kesten in 1980.

On a finite grid the change is gradual, but it steepens as the grid grows; on an infinite grid it would be a jump. You have seen this in Module 02, where a giant component appeared when the mean degree of a random graph passed 1 and the transition sharpened with the number of nodes. That giant component *is* percolation, on a network instead of a grid.

## At the critical point

At p_c the spanning cluster is itself a fractal, full of holes at every scale, with D = 91/48 ≈ 1.896 in two dimensions: its mass grows like L^1.896 on a grid of side L. Clusters of all sizes coexist, and their size distribution is a power law, the signature of a system with no characteristic scale.

The exponents that describe this behaviour are **universal**. Change the lattice from square to triangular, or percolate bonds instead of sites, and p_c changes, but the exponents do not: they depend on the dimension of space, not on the details of the model. This is one of the deepest ideas of statistical physics, and it leads to the critical states of Module 08.

## Counting with randomness

How do we know p_c ≈ 0.5927? By **Monte Carlo** simulation: generate many random grids and count how often they span. Done naively, every p needs new grids. In 2000 Mark Newman and Robert Ziff described a better way: open the sites one at a time in random order and track clusters as they merge, with a **union–find** structure that joins two clusters in almost constant time. A single run then passes through every p from 0 to 1. Panel B does this step by step; Panel C repeats it many times for several grid sizes.

## Everywhere you look

Percolation describes oil and water moving through porous rock, and coffee through ground beans. It describes an epidemic spreading through a population, or a fire through a forest (the forest-fire model returns in Module 08), and the conductivity of a mix of conducting and insulating grains. And it describes the robustness of networks: the random-failure versus targeted-attack experiment of Module 04 is percolation on a graph, removing nodes instead of opening them, as Reuven Cohen, Keren Erez, Daniel ben-Avraham and Shlomo Havlin showed in 2000.

## A Bitcoin connection

How many nodes of a peer-to-peer network can fail at random before it falls apart? Consider an idealised network that is a random graph with Poisson degrees and mean degree ⟨k⟩. If a fraction q of the nodes survives, at random, a giant connected component remains as long as

```math
q · ⟨k⟩ > 1
```

Each Bitcoin node keeps several outbound connections, and many also accept inbound ones, so the mean degree is around ten or more. In the idealised model, the network then holds together until roughly nine nodes in ten have failed at random.

Real networks are not Poisson graphs, though, and real failures are rarely independent. A data centre going dark, a country cutting its connections or a cloud provider's outage removes many nodes at once, and such correlated failures are far more dangerous than random ones, much like the targeted attack of Module 04. That is why the diversity of nodes, across places, providers and operators, matters as much as their number.

<!-- simulation -->

## What to observe

1. Measure the Koch curve at iteration 6. How close is your estimate to 1.262? What happens if you fit only the largest boxes, or only the smallest ones?
2. Measure the line and the filled square to check that the method works, then the Sierpiński triangle. Why are the estimates not exactly 1, 2 and 1.585?
3. Grow a DLA cluster with 10,000 particles. Why does the centre stay hollow? Compare the box-counting D̂ and the mass–radius D̂ with each other and with 1.71. Why can two honest methods give different answers on the same finite cluster, and what does that tell you about any fractal dimension quoted from data?
4. Measure a random-walk path of 10³ steps and then 10⁶ steps. How does D̂ change, and why?
5. Set L = 200 and move p slowly across 0.59. What happens to the largest cluster? Pour from the top just below and just above p_c, and compare how far the fluid gets.
6. In the experiment, where do the spanning curves for different L cross? Compare the crossing with p_c ≈ 0.5927, and look at how the largest-cluster curves sharpen as L grows.

## Further reading

- L. F. Richardson, "The problem of contiguity", *General Systems Yearbook* 6 (1961) 139–187.
- B. Mandelbrot, "How long is the coast of Britain? Statistical self-similarity and fractional dimension", *Science* 156 (1967) 636–638.
- B. Mandelbrot, *The Fractal Geometry of Nature* (W. H. Freeman, 1982).
- S. R. Broadbent & J. M. Hammersley, "Percolation processes I", *Proceedings of the Cambridge Philosophical Society* 53 (1957) 629–641.
- H. Kesten, "The critical probability of bond percolation on the square lattice equals 1/2", *Communications in Mathematical Physics* 74 (1980) 41–59.
- T. A. Witten & L. M. Sander, "Diffusion-limited aggregation, a kinetic critical phenomenon", *Physical Review Letters* 47 (1981) 1400–1403.
- D. Stauffer & A. Aharony, *Introduction to Percolation Theory*, 2nd ed. (Taylor & Francis, 1994).
- M. E. J. Newman & R. M. Ziff, "Efficient Monte Carlo algorithm and high-precision results for percolation", *Physical Review Letters* 85 (2000) 4104–4107.
- R. Cohen, K. Erez, D. ben-Avraham & S. Havlin, "Resilience of the Internet to random breakdowns", *Physical Review Letters* 85 (2000) 4626–4628.
