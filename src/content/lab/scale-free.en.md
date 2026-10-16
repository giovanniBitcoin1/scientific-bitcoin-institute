<!-- DRAFT: to be reviewed by Adriano -->

## Typical and untypical

Line up a thousand adults by height. Nobody will be ten times taller than anybody else, and the mean height tells you roughly what to expect of the next person you meet.

Now line them up by wealth. Some own almost nothing, and one or two may own more than all the others together. The same happens with city populations, earthquake energies, citations of scientific papers and links pointing to web pages. For quantities of this kind the "average" person, city or paper tells you almost nothing: a handful of giants drags the mean far from the typical case.

## Bell curves and heavy tails

Height follows something close to a Gaussian, the bell curve, whose tail falls off like `exp(−x²)`: each extra standard deviation makes an observation enormously rarer. The exponential distribution, for instance of waiting times between independent random events, decays more slowly, like `exp(−x)`, but still fast enough that huge values practically never occur.

A power law is different. Write its tail as the probability of exceeding x:

```math
P(X > x) = (x / x_min)^(−α),   x ≥ x_min
```

Rescale x by any factor λ and the power law is only multiplied by `λ^(−α)`: the shape of the curve does not change. There is no characteristic size, no point where "large" begins, which is why such distributions are called **scale-free**. With logarithmic axes a power law becomes a straight line of slope −α.

Three consequences follow. Extreme values are not outliers to discard; they belong to the distribution. Averages may not exist: for α ≤ 2 the variance is infinite, for α ≤ 1 even the mean, and the sample mean never settles because each new giant pushes it up again. And a small fraction of the population holds a large fraction of the total. Vilfredo Pareto found, in work published from 1896, that income and property were spread this way; the version usually quoted is that about 20% of Italians owned about 80% of the land. A power-law tail with α near 1.16 produces exactly this 80/20 split.

## Zipf's law

In the 1930s and 1940s the linguist George Kingsley Zipf ranked the words of long texts by frequency. The frequency of the r-th most common word fell roughly as `r^(−s)` with s close to 1: the second word about half as often as the first, the third about a third as often.

Zipf's ranked list and Pareto's tail are one thing seen from two sides. Take N values from a power law. The value of rank r, call it x_r, is exceeded by about r of them, so r ≈ N · P(X > x_r) = N (x_r / x_min)^(−α). Solving for x_r:

```math
x_r ≈ x_min · (r / N)^(−1/α)
```

so the rank exponent is s = 1/α. Zipf's s ≈ 1 means α ≈ 1, right at the edge where the mean stops existing.

## How to recognise a power law honestly

A straight line on a log–log plot is necessary but not sufficient: many curves look straight over two or three decades. And the ordinary histogram is the worst place to look, because in the tail most bins hold zero or one observation and the plot dissolves into noise exactly where it matters. Use bins that grow geometrically (logarithmic binning) or, better, the **complementary cumulative distribution** (CCDF), the fraction of observations at least as large as x: it needs no bins, and for a power law it is a straight line of slope −α.

Do not estimate the exponent by fitting a line to a histogram, which gives biased answers. With x_min known, the maximum-likelihood estimate is

```math
α̂ = N / Σ ln(x_i / x_min)
```

The density of this distribution falls as `x^(−(α+1))`; written for that exponent, the same estimate becomes 1 + N / Σ ln(x_i / x_min), the form used by Aaron Clauset, Cosma Shalizi and Mark Newman (2009). They also insist on comparing the power law with alternatives: a lognormal, whose logarithm is Gaussian, can look straight over several decades.

## Networks with hubs

In Module 02 the degrees of a random graph followed a Poisson distribution: a node with ten times the mean degree is practically impossible. In 1999 Albert-László Barabási and Réka Albert measured the degree distributions of the World Wide Web, of film actors linked by appearing together, and of other networks, and found heavy tails instead, roughly `P(k) ∝ k^(−γ)`. A few **hubs** had vastly more links than the typical node.

Their model has two ingredients. **Growth**: nodes arrive one at a time. **Preferential attachment**: each newcomer brings m links and attaches to an existing node i with probability proportional to its degree k_i. The rich get richer. The result is a degree distribution with γ = 3, whose CCDF has slope −2. Drop either ingredient and the power law disappears: with growth but uniform attachment, the tail becomes exponential.

The mechanism is older than the name: Udny Yule used it in 1925 for the sizes of biological genera, Herbert Simon generalised it in 1955, Derek de Solla Price called it "cumulative advantage" for citations in 1976, and Robert Merton had named a version of it the "Matthew effect" in 1968.

## Consequences of hubs

Hubs change how a network behaves. Paths become ultra-short, since almost every node is near a hub. Albert, Hawoong Jeong and Barabási showed in 2000 that scale-free networks are **robust to random failures**, because a node picked at random is almost always a minor one, but **fragile to targeted attacks**: remove the few largest hubs and the network falls apart. And anything that spreads, from rumours to viruses, spreads fast, because hubs catch it early and pass it on widely.

So we have two explanations for the small world of Module 03: local clusters plus weak ties, or hubs. Science chooses between them not by asking which story sounds better but by deriving predictions that differ. Watts–Strogatz networks have a narrow degree distribution and no hubs; scale-free networks have hubs and a very different response to attack. Measurement decides which mechanism dominates in a given network.

## Healthy scepticism

Enthusiasm was followed by re-examination. In 2019 Anna Broido and Aaron Clauset applied rigorous statistical tests to nearly a thousand real networks and found strong evidence of a strict power-law degree distribution in only a small minority. Many are better described as heavy-tailed with a cut-off, or by a lognormal. The idea of heavy tails remains central; the exact exponent, and even the label "scale-free", must be earned with data.

## A Bitcoin connection

Bitcoin meets these ideas twice. The first is a design choice. Hubs give an attacker obvious targets, so the Bitcoin peer network avoids them on purpose: Bitcoin Core caps the number of connections a node keeps (125 by default) and picks its outbound peers at random among the addresses it knows. No node gathers a share of the links whose loss, or capture, would split the network.

The second is research. Bitcoin's price, as a function of the time elapsed since the genesis block, follows a power law with exponent β = 5.69 ± 0.05 (R² = 0.961 over 5,696 daily observations). This is a power-law relation between two quantities rather than a distribution, but the same discipline applies: a straight line on log–log axes is where the argument starts, not where it ends. The Institute's preprint takes the next step and derives the law mechanistically, from the dynamics of network adoption and a generalised Metcalfe scaling of network value. Read it on our [Publications page](/research/publications#preprint).

<!-- simulation -->

## What to observe

1. Grow a network with preferential attachment (n = 400, m = 2), then switch to uniform attachment with the same seed. What happens to the biggest hub, and to the share of edge ends held by the top 1%?
2. Press Play and watch the orange hubs as the network grows. Are the biggest hubs the oldest nodes or the newest? Why?
3. Compare the two degree CCDFs in Panel A. Over how many decades does each one extend, and which bends down sharply? Now raise k_min: how does γ̂ move, and what does that tell you about choosing k_min?
4. In Panel B, draw 100 and then 100,000 samples from a Pareto with α = 1.5: does the sample mean settle down? Repeat with α = 3, then with the Gaussian.
5. Select the lognormal and look at its CCDF. Over how wide a range could you mistake it for a straight line?
6. In the robustness experiment, which network survives random failures better, and which collapses first under targeted attack? At roughly what fraction f does the BA network fall apart once its hubs are targeted?

## Further reading

- V. Pareto, *Cours d'économie politique* (Lausanne, 1896–1897).
- G. K. Zipf, *Human Behavior and the Principle of Least Effort* (Addison-Wesley, 1949).
- H. A. Simon, "On a class of skew distribution functions", *Biometrika* 42 (1955) 425–440.
- D. de S. Price, "A general theory of bibliometric and other cumulative advantage processes", *Journal of the American Society for Information Science* 27 (1976) 292–306.
- A.-L. Barabási and R. Albert, "Emergence of scaling in random networks", *Science* 286 (1999) 509–512.
- R. Albert, H. Jeong and A.-L. Barabási, "Error and attack tolerance of complex networks", *Nature* 406 (2000) 378–382.
- M. E. J. Newman, "Power laws, Pareto distributions and Zipf's law", *Contemporary Physics* 46 (2005) 323–351.
- A. Clauset, C. R. Shalizi and M. E. J. Newman, "Power-law distributions in empirical data", *SIAM Review* 51 (2009) 661–703.
- A. D. Broido and A. Clauset, "Scale-free networks are rare", *Nature Communications* 10 (2019) 1017.
- Scientific Bitcoin Institute, preprint on Bitcoin's power law, on our [Publications page](/research/publications#preprint).
