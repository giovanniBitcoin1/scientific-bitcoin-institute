<!-- DRAFT: to be reviewed by Adriano -->

## Coins on a checkerboard

In the late 1960s the economist Thomas Schelling wanted to understand how neighbourhoods sort themselves by group. He used a checkerboard and two kinds of coins, left some squares empty, and moved by hand every coin that was unhappy with its neighbours. His paper "Dynamic models of segregation" appeared in 1971. In 2005 he shared the Nobel prize in economics for work that deepened our understanding of conflict and cooperation.

The checkerboard showed that people who would be happy in a mixed neighbourhood can still end up, all together, in a sharply divided one.

## What an agent-based model is

An **agent-based model** (ABM) is built from many autonomous agents. They can differ from one another, each follows simple rules, each sees only what is near it, and each interacts only with its neighbours. Nobody writes an equation for the whole. The pattern at the large scale is *computed*: you let the agents act and watch what appears.

Many economic models take the opposite route: they replace a whole population with one **representative agent**, an average household or firm, and solve for its best behaviour. That works when the average tells the story, and hides what happens when interactions matter more than the agents themselves, as in the jams and the segregated streets of this module.

The modeller Joshua Epstein summed up the approach as **generative social science**: to explain a pattern, show how it can grow from the bottom up. If you cannot grow it from plausible individual behaviour, you have not yet explained it.

## Schelling's model

Take a square grid with two groups of agents, say A and B, and some empty cells. Each agent looks at the eight cells around it. It is **content** if at least a fraction T of its occupied neighbours belong to its own group. Otherwise it moves to an empty cell. Agents move one after another, and the process repeats until nobody wants to move.

The surprise is how little preference it takes. With T around one third, an agent is happy to be in the minority: two neighbours like itself out of six is enough. Start from a random city, where about half of everyone's neighbours are alike. When it settles, around three quarters are alike. Each move makes one agent content but changes two neighbourhoods: a B agent leaving an A area leaves the other B agents there more isolated, and they move next. Schelling's phrase for this was that **micromotives** do not add up to **macrobehaviour** in any simple way.

Raise T and the city ends up more segregated still, until a threshold is reached where it hardly settles at all. By then the two groups are almost completely apart. Only agents at the borders remain unhappy, and a city at rest would need those borders lined with empty cells. Random moves find such an arrangement slowly or not at all, so agents keep moving. A variant changes the story again: agents also dislike being in a neighbourhood that is *too* homogeneous. With an upper limit as well as a lower one, the strong sorting is held back, at the cost of more agents on the move.

It is important to be clear about what the model shows and what it does not. It shows a possible **mechanism**: strong segregation does not require strong prejudice. It does not tell us the actual causes of segregation in any real city, where discrimination, income, housing policy, lending rules and history all matter, often far more than individual preference. What it can do is warn us that a pattern may be much more extreme than the attitudes behind it.

## A physicist's reading

Watch the simulation and it looks familiar to a physicist. Small clusters of each group appear, merge and grow, and their borders straighten, as when oil and water unmix or an alloy separates into two phases. In 2006 Dejan Vinković and Alan Kirman made this analogy precise. They mapped Schelling's dynamics onto particles that prefer like neighbours, with group boundaries behaving like surfaces under tension. The slow growth of domains is **coarsening**, a process studied for decades in materials. As in Module 07, clusters are what matter. As in Module 08, the details of the agents count for less than the class of dynamics they belong to.

## Traffic

Every driver has met the **phantom jam**: traffic grinds to a halt and speeds up again, with no accident, roadworks or narrowing to explain it. In 1992 Kai Nagel and Michael Schreckenberg built a cellular automaton that produces such jams. Cars sit on a one-lane ring of cells, at most one per cell, each with a speed from 0 to v_max cells per step. At every step, all cars at once:

1. **accelerate** by 1, up to v_max;
2. **slow down** if needed, so as not to hit the car ahead;
3. with probability p, **slow down by 1** more at random;
4. **move** forward by their speed.

Remove the random step and set v_max = 1, and this is Rule 184 of Module 05: a car moves if the cell ahead is empty.

The key plot is the **fundamental diagram**, flow against density, where flow is the number of cars passing a point per step. At low density cars drive at top speed and flow grows in proportion to their number. Beyond a critical density there is no longer room for everyone to drive at v_max, jams take over and flow falls. Without random braking the peak is sharp, at density 1/(v_max + 1). With it, the peak is lower and comes earlier. Jams also appear spontaneously, with no cause other than one driver braking a little too much. And they **drift backwards**, against the traffic: cars leave the front of a jam while new ones join at its back.

In 2008 Yuki Sugiyama and colleagues tested this directly. They put 22 cars on a circular track about 230 metres long and asked the drivers to keep a steady speed. For a while they did; then small fluctuations grew into a stop-and-go wave travelling backwards around the ring, with no bottleneck at all.

## Doing ABMs responsibly

ABMs are easy to build and easy to overtrust. Realistic ones have many parameters, so **calibration** (choosing their values from data), **validation** (checking predictions against data not used to build the model) and **robustness** checks (does the result survive small changes in the rules?) are essential. Simple ABMs like these two explain mechanisms; detailed ones aim at forecasts, of an epidemic or a real motorway. Both need humility about what has been left out.

## A Bitcoin connection

Bitcoin is a natural subject for agent-based models. Miners, holders, traders and node operators each follow their own local rules, and the aggregate (hash rate, fees, adoption) emerges from what they do. One analogy is with traffic. Block space has a fixed capacity: a block weight limit of 4 million weight units (BIP 141), with a block about every ten minutes. When demand stays below capacity, the queue of waiting transactions, the **mempool**, clears. When demand exceeds capacity for a while, the queue grows and fees rise sharply, much as flow saturates and jams form beyond the critical density. This is an analogy, not a model, but it suggests why fee spikes can appear suddenly when demand only grows a little.

<!-- simulation -->

## What to observe

1. Set T = 0.3 and run the city. How segregated does it become, compared with the random start shown under the index?
2. In Panel B, follow T upwards from 0. Where does the final segregation jump, and above which T does the city stop settling within the cap?
3. Turn on the upper threshold ("unhappy if more than U alike") with U around 0.8. What happens to the segregation index and to the share of unhappy agents?
4. Switch the move rule to "the nearest cell that suits them" and raise T above 0.65. Why does the city stop almost at once, and why is it then *less* segregated?
5. In the traffic model, at density 0.15, set p = 0 and then p = 0.2. Where do jams come from, and which way do they move in the space–time diagram?
6. In Panel D, find the density with the highest flow. How does it move when you change v_max in Panel C, and how does random braking change it?

## Further reading

- T. C. Schelling, "Dynamic models of segregation", *Journal of Mathematical Sociology* 1 (1971) 143–186.
- T. C. Schelling, *Micromotives and Macrobehavior* (Norton, 1978).
- K. Nagel & M. Schreckenberg, "A cellular automaton model for freeway traffic", *Journal de Physique I France* 2 (1992) 2221–2229.
- J. M. Epstein & R. Axtell, *Growing Artificial Societies: Social Science from the Bottom Up* (MIT Press, 1996).
- J. M. Epstein, "Agent-based computational models and generative social science", *Complexity* 4(5) (1999) 41–60.
- D. Helbing, "Traffic and related self-driven many-particle systems", *Reviews of Modern Physics* 73 (2001) 1067–1141.
- D. Vinković & A. Kirman, "A physical analogue of the Schelling model", *Proceedings of the National Academy of Sciences* 103 (2006) 19261–19265.
- Y. Sugiyama et al., "Traffic jams without bottlenecks — experimental evidence for the physical mechanism of the formation of a jam", *New Journal of Physics* 10 (2008) 033001.
