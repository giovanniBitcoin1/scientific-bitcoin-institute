<!-- DRAFT: to be reviewed by Adriano -->

## No one in charge

On a winter evening, thousands of starlings wheel over a city as one dark shape that stretches, folds and splits, yet never collides with itself. On a motorway, traffic slows to a crawl and then clears, and at the bottleneck there is nothing: no accident, just a wave of braking drifting backwards. A stock market drops ten per cent in minutes with no news to explain it. And every ten minutes or so, thousands of independent computers agree on the next block of the Bitcoin ledger.

Each scene shows behaviour coordinated on a large scale, and in each no one is coordinating it. No starling sees the flock; no driver plans the jam; no server runs Bitcoin. The order comes from below.

## What makes a system complex

There is no single agreed definition, but complex systems tend to share a few ingredients:

- **Many components:** birds, drivers, traders, nodes.
- **Local interactions:** each component reacts mostly to its neighbours, not to the whole.
- **Feedback loops:** effects act back on their causes. A falling price triggers selling, which pushes the price further down.
- **Nonlinearity:** responses are not proportional to causes. Doubling the input may change nothing, or everything.
- **Adaptation:** components learn, imitate or evolve, so the rules themselves shift.

Together these produce **emergence**: the whole has properties that none of its parts has. A water molecule is not wet, a neuron does not think, and an ant has no idea its colony is farming fungus.

*Complex* is not the same as *complicated*. A jet engine is complicated: many parts, each with a designed role, so an engineer can take it apart and understand every piece. An ant colony or an economy is complex: simple parts whose interactions produce behaviour no blueprint describes, and taking it apart destroys exactly what you wanted to study.

## A different way of doing science

Classical physics triumphed with systems of few parts and solvable equations. A planet and its star follow orbits that can be written down exactly: ellipses, valid for all time. Add a third body and everything changes. At the end of the nineteenth century Henri Poincaré showed that the general three-body problem has no such closed-form solution, and in studying it he caught the first glimpse of what we now call chaos.

Complexity science starts from that lesson. Instead of seeking a master formula, it builds **simple models** (discrete time steps, grids of cells, networks, agents following a few rules, some randomness) and runs them on a computer. When no shortcut exists, the only way to know what a system does is to run it and watch. Simulation is not a substitute for theory here; it is the experiment.

## Nonlinearity and the limits of prediction

Consider animals that breed once a year, and measure the population as a fraction x (between 0 and 1) of the maximum the environment can support. Next year's population grows in proportion to this year's, but is held back as it nears the limit:

```math
x(n+1) = r · x(n) · (1 − x(n))
```

This is the **logistic map**, which the ecologist Robert May presented in 1976 as a warning that even the simplest nonlinear models can behave in astonishing ways. The single parameter r sets the growth rate. Here is what happens as you turn it up:

- **r < 1:** each generation is smaller than the last and the population dies out.
- **1 < r < 3:** the population settles on a stable value, the fixed point `x* = 1 − 1/r`. The fixed point is stable as long as the slope of the map there, `f′(x*) = 2 − r`, is less than 1 in absolute value, which is exactly the condition 1 < r < 3.
- **r = 3:** the equilibrium loses stability and the population starts to alternate between two values, a cycle of period 2. Near r ≈ 3.449 each branch splits again, giving period 4, then 8, 16 and so on.
- **The doublings accelerate.** Each new splitting arrives sooner than the previous one, and the ratio between successive intervals approaches a fixed number, Feigenbaum's constant δ ≈ 4.669, which turns out to be the same for a whole family of different maps.
- **r beyond about 3.5699:** the cascade has run its course and the motion becomes **chaotic**, never repeating. Chaos is interrupted by narrow windows of order; the widest begins near r ≈ 3.83, where a cycle of period 3 suddenly appears.

There is no randomness in this rule: given x(0) and r, every future value is fixed. Yet in the chaotic regime two starting points a millionth apart drift until they bear no relation to each other. This is **sensitive dependence on initial conditions**, which Edward Lorenz stumbled on in 1963 with a simplified weather model, later nicknamed the butterfly effect. Since real measurements have finite precision, long-term prediction is impossible in practice, even though the system is perfectly deterministic.

The rate of that divergence is measured by the **Lyapunov exponent** λ. A small initial error grows roughly as

```math
|δx(n)| ≈ |δx(0)| · e^(λ·n)
```

and for the logistic map λ is the long-run average of `ln|r · (1 − 2x(n))|`. When λ is negative, errors shrink and the motion is predictable; when λ is positive, errors grow exponentially and the motion is chaotic. The simulation below lets you explore all of this directly.

## Where the course goes from here

**Networks (Modules 02–04).** How a giant cluster appears abruptly in random networks, why a few shortcuts make the world small, and how preferential attachment produces hubs and power laws.

**Cellular automata and patterns (Modules 05–07).** Grids of cells with local rules generate order, randomness and lifelike structures; fractals and percolation show how geometry itself can become critical.

**Criticality and power laws (Module 08).** Systems that drive themselves to the edge of instability, where events of every size occur.

**Agents, cooperation and economies (Modules 09–12).** Simple individual behaviours that add up to segregation, phantom jams, flocks, cooperation and unequal wealth.

**Bitcoin (Module 13).** The course ends by applying these tools to Bitcoin.

## Why this matters at SBI

The Scientific Bitcoin Institute studies Bitcoin as a complex adaptive system: a network of interacting agents (miners, nodes, holders, markets), none of them in control, whose adoption and price show power-law regularities. Explaining why such regularities emerge requires exactly the ideas in this course. Read our current work in the [preprint on our Publications page](/research/publications#preprint).

<!-- simulation -->

## What to observe

1. Set r = 2.8 and move x₀ around. Does the final value depend on where you start? Compare it with `1 − 1/r`.
2. Increase r slowly from 2.9 to 3.6 and count the branches in the time series and in the cobweb. Where does the number of values double?
3. At r = 3.2, press Reset and then Step in the cobweb diagram. How does the staircase turn into a closed square loop?
4. At r = 3.9, turn on the twin trajectory with ε = 10⁻⁶. After how many steps do the two curves disagree completely? What happens to that number if you make ε a hundred times smaller?
5. Find the period-3 window in the bifurcation diagram (drag to zoom around r ≈ 3.83). What does the period counter report there, and what is the sign of λ?
6. Watch the Lyapunov exponent as you sweep r from 3.4 to 4. Where does it cross zero, and how do those points line up with the bifurcation diagram?

## Further reading

- R. M. May, "Simple mathematical models with very complicated dynamics", *Nature* 261 (1976).
- E. N. Lorenz, "Deterministic nonperiodic flow", *Journal of the Atmospheric Sciences* 20 (1963).
- M. J. Feigenbaum, "Quantitative universality for a class of nonlinear transformations", *Journal of Statistical Physics* 19 (1978).
- M. Mitchell, *Complexity: A Guided Tour* (Oxford University Press, 2009).
