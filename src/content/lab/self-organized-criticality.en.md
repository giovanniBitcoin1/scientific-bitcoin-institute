<!-- DRAFT: to be reviewed by Adriano -->

## Many small, a few huge

Most earthquakes are too weak to feel; a few destroy cities. In 1944 Beno Gutenberg and Charles Richter counted the earthquakes of California and found that all of them obey one simple rule: each step of one unit up the magnitude scale makes an earthquake about ten times rarer. Since each unit of magnitude multiplies the energy released by about thirty, this is a power law in energy, with no typical size, as in Module 04.

Similar statistics appear in solar flares, forest fires and landslides. In 2003 John Beggs and Dietmar Plenz recorded slices of rat cortex on grids of electrodes and saw bursts of activity spreading across them: **neuronal avalanches**, whose sizes also followed a power law.

## A puzzle

Module 07 also produced power laws and fractals, but only at p_c. Move p a little and a characteristic size comes back. Ordinary critical points work the same way: water and steam become indistinguishable at a single temperature and pressure, a magnet loses its magnetisation exactly at the Curie temperature, and fluctuations of every size appear there and nowhere else. Somebody has to set the knob to the right value.

Nobody tunes the Earth's crust, the Sun or the brain. How can nature be critical so often, if criticality needs fine-tuning?

## The sandpile

In 1987 Per Bak, Chao Tang and Kurt Wiesenfeld proposed an answer: some systems drive themselves to a critical state. They called it **self-organized criticality** and illustrated it with a toy model, the sandpile.

Take a square grid in which each site holds a number of grains z, its height. Add grains one at a time, each on a site chosen at random. When a site reaches z = 4 it **topples**: it loses four grains and gives one to each of its four neighbours. Grains pushed over the edge are lost. A toppling can raise a neighbour to 4, which topples in turn, and so on: an **avalanche**, which ends when every site is below 4 again. Only then is the next grain added.

Three ingredients matter: a slow **drive** (each avalanche ends before the next grain arrives), a local **threshold**, and **dissipation** at the boundary, the only place where sand leaves. From any starting configuration the pile settles into a stationary state in which, on average, the sand added equals the sand lost, and avalanche sizes s, counted in topplings, follow a power law

```math
P(s) ∝ s^(−τ)
```

cut off only by the size of the grid. Nothing was tuned. A pile with less sand would have small avalanches and would accumulate grains; a pile with more would shed it in big avalanches. The critical state is where the dynamics leads, and where it stays.

## What can be computed exactly

The sandpile looks like a game, but it has hidden structure. In 1990 Deepak Dhar showed that it is **abelian**: when several sites are unstable, the order in which they topple changes neither the final configuration nor how many times each site topples. That made parts of the model exactly solvable. In 1994 Vyatcheslav Priezzhev computed the probabilities of the four stable heights in the stationary state of an infinite square grid. With heights from 0 to 3, as here, their mean is 17/8 = 2.125: a value conjectured from his results and proved exact only in 2011. Other quantities have resisted. The avalanche exponent τ in two dimensions is around 1.2 and is still debated, because the model shows subtle multiscaling: avalanches of different sizes do not all rescale in the same way.

## 1/f noise

The 1987 paper was titled "Self-organized criticality: an explanation of 1/f noise". Any signal in time can be decomposed into oscillations of different frequencies (Fourier analysis; the fast Fourier transform makes it cheap), and its power spectrum S(f) says how much of its variance sits at frequency f. **White noise**, a sequence of independent values, has the same power at every frequency. The **brown noise** of a random walk, where each value is the previous one plus a random step, has S(f) ∝ 1/f²: slow wanderings dominate. Between them lies **1/f noise**, or pink noise, with equal power in every octave. It appears in electronic devices, river flows and heartbeats, and in 1975 Richard Voss and John Clarke found it in the loudness and pitch of music and speech.

Explaining it was the original motivation: avalanches of all sizes and durations should produce fluctuations on all time scales. Later work, beginning with Henrik Jensen, Kim Christensen and Hans Fogedby in 1989, showed that the original sandpile does not straightforwardly produce 1/f noise: when it is driven slowly its activity spectrum is closer to 1/f², and the measured slope shifts with the driving rate and with how finely time is resolved. It is an honest example of a beautiful idea outgrowing its first justification.

## Other self-organized models

In 1992 Barbara Drossel and Franz Schwabl introduced a **forest-fire model**. On a grid, trees grow on empty sites with probability p per step, and lightning strikes a tree with a much smaller probability f, burning its whole connected cluster. Fire sizes become heavy-tailed, though later work found corrections to simple scaling. The same year Zeev Olami, Hans Jacob Feder and Kim Christensen published an earthquake model in which a fault is a grid of blocks joined by springs. It is non-conservative, since part of the stress released at each slip is lost, and its events still show power-law sizes.

Do real sandpiles behave like the model? Mostly not: momentum and friction matter. But in 1996 Vidar Frette and colleagues let rice pile up between two glass plates and found power-law avalanches when the grains were elongated, so that friction held them in place.

## Why a toy?

Why should grains on a grid explain earthquakes? The physicist's answer is **universality**, met in Module 07: near a critical point, behaviour at large scales depends on a few general features, not on microscopic details. Here those features are a slow drive, local thresholds, transport to neighbours and dissipation. A model is a member of a class; if a real system belongs to the same class, it shares the class's statistics, whatever its grains are made of.

## Prediction

In a self-organized critical system the grain that triggers a giant avalanche is no different from the one that triggers a tiny one. Large events need no special cause; what can be forecast is their statistics, not their timing. That is a sobering message for anyone hoping to predict the next big event, and a useful one for risk management: plan for the whole distribution of sizes, not for a date.

## A Bitcoin connection

In 1963 Benoît Mandelbrot studied cotton prices and found that their changes had far heavier tails than a Gaussian. In 2001 Rama Cont collected such regularities, found in market after market, as "stylised facts": heavy tails, and volatility that clusters in bursts. Bitcoin's daily returns show these features strongly. The Institute's research finds that Bitcoin's long-run price trend follows a power law in time; read the preprint on our [Publications page](/research/publications#preprint). Whether the fluctuations around that trend behave like avalanches in a self-organized critical system is an open question. It is exactly the kind of question the tools of this course are built to test, with the caution of Module 04: a straight line on log–log axes is where the argument starts, not where it ends.

<!-- simulation -->

## What to observe

1. Start from an empty grid in "Run" mode and watch the mean-height chart. Where does it settle, and how close is it to 2.125? Try the random and the overloaded starts: do they end up in the same place?
2. Switch to "One grain" and drop grains one at a time. Are most avalanches small? Watch a large one wave by wave: was there anything special about the grain that started it?
3. Collect statistics and read τ̂ from the CCDF. Then change the grid size L and collect again: what happens to the largest avalanches, and to the slope in the middle range? Move s_min and see how much the estimate depends on it.
4. In Panel B, listen to white, pink and brown noise. Which sounds most "natural"? Compare the fitted slopes β̂ with 0, −1 and −2.
5. Select "Sandpile activity". Is its spectrum closer to 1/f or to 1/f²?
6. In the forest-fire model, raise p/f from 100 to 10,000. What happens to the tree density, and to the largest fires? When do fires start to wrap around the whole torus?

## Further reading

- B. Gutenberg & C. F. Richter, "Frequency of earthquakes in California", *Bulletin of the Seismological Society of America* 34 (1944) 185–188.
- B. B. Mandelbrot, "The variation of certain speculative prices", *Journal of Business* 36 (1963) 394–419.
- R. F. Voss & J. Clarke, "'1/f noise' in music and speech", *Nature* 258 (1975) 317–318.
- P. Bak, C. Tang & K. Wiesenfeld, "Self-organized criticality: an explanation of 1/f noise", *Physical Review Letters* 59 (1987) 381–384.
- D. Dhar, "Self-organized critical state of sandpile automaton models", *Physical Review Letters* 64 (1990) 1613–1616.
- Z. Olami, H. J. S. Feder & K. Christensen, "Self-organized criticality in a continuous, nonconservative cellular automaton modeling earthquakes", *Physical Review Letters* 68 (1992) 1244–1247.
- B. Drossel & F. Schwabl, "Self-organized critical forest-fire model", *Physical Review Letters* 69 (1992) 1629–1632.
- V. Frette et al., "Avalanche dynamics in a pile of rice", *Nature* 379 (1996) 49–52.
- P. Bak, *How Nature Works: The Science of Self-Organized Criticality* (Copernicus, 1996).
- R. Cont, "Empirical properties of asset returns: stylized facts and statistical issues", *Quantitative Finance* 1 (2001) 223–236.
- J. M. Beggs & D. Plenz, "Neuronal avalanches in neocortical circuits", *Journal of Neuroscience* 23 (2003) 11167–11177.
- G. Pruessner, *Self-Organised Criticality: Theory, Models and Characterisation* (Cambridge University Press, 2012).
- Scientific Bitcoin Institute, preprint on Bitcoin's power law, on our [Publications page](/research/publications#preprint).
