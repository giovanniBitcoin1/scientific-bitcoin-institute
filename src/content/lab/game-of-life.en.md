<!-- DRAFT: to be reviewed by Adriano -->

## A game nobody plays

In October 1970 Martin Gardner's "Mathematical Games" column in *Scientific American* described a strange game invented by the Cambridge mathematician John Horton Conway. It had no players, no moves and no winner: you set up a pattern of counters on a board and then simply watched what the rules did with it. Conway's "Life" soon became one of the most studied objects in recreational mathematics and in early computing.

## The rules

Life is a cellular automaton, like those of Module 05, but in two dimensions. The board is a grid of square cells, each **alive** or **dead**. Every cell has eight neighbours, the cells that touch it along a side or at a corner (the **Moore neighbourhood**). All cells are updated together, one generation at a time:

- a dead cell with exactly 3 live neighbours comes alive (**birth**);
- a live cell with 2 or 3 live neighbours stays alive (**survival**);
- every other cell dies, or stays dead.

Rules of this family are written **B3/S23**: the numbers after B give birth, those after S survival. The rule is **totalistic**: it looks only at how many neighbours are alive, never at which ones.

Conway chose these numbers with care. He wanted rules under which a pattern could not easily be shown to grow forever, yet some simple patterns would do surprising things. With more generous birth conditions almost everything explodes; with stricter ones almost everything dies. B3/S23 sits in a narrow band between the two.

## A zoo of patterns

**Still lifes** never change: every live cell has two or three live neighbours and no dead cell has exactly three. The **block** (a 2 × 2 square), the **beehive**, the **loaf** and the **boat** are the most common.

**Oscillators** return to their starting shape after a fixed number of generations, the period. The **blinker**, three cells in a row, flips between horizontal and vertical with period 2, and so do the **toad** and the **beacon**. The **pulsar** has period 3 and the **pentadecathlon** period 15.

**Spaceships** return to their shape in a new position. The **glider**, five cells, moves one cell diagonally every 4 generations; the **lightweight spaceship** moves two cells sideways in the same time.

Then there are the **methuselahs**: tiny patterns that take a very long time to settle. The **R-pentomino**, five cells, churns for 1103 generations before it calms into scattered still lifes, oscillators and escaping gliders. The **acorn**, seven cells, needs 5206.

## Fifty dollars and a gun

Conway asked whether any finite pattern can grow without limit, and offered $50 for an answer. He suspected not. In November 1970 a group at MIT led by Bill Gosper proved him wrong with the **glider gun**: a pattern that every 30 generations rebuilds itself and fires a new glider, forever. Its population climbs by five cells each period. **Puffer trains**, which move and leave debris behind them, soon followed.

## A computer made of gliders

A stream of gliders can carry information: a glider is a 1, a gap is a 0. Collisions can destroy gliders, deflect them or create new ones, and with the right arrangements they behave like logic gates. In *Winning Ways* (1982) Elwyn Berlekamp, Conway and Richard Guy showed that Life can compute anything a computer can: it is **universal**, like Rule 110 in Module 05. In 2000 Paul Rendell built an explicit Turing machine inside Life, and in 2006 the "OTCA metapixel" made it possible to simulate Life within Life itself, each large block of cells playing the part of a single cell.

## Is a glider real?

None of a glider's cells survive for long: four generations later it is made of entirely different cells. Yet it moves, it collides, it carries a signal. Is it a thing, or only a way of looking at the grid?

The philosopher Daniel Dennett used Life to frame an answer in his essay "Real Patterns" (1991). Someone who tracks every cell can predict the grid perfectly, but slowly. Someone who says "a glider is heading north-east and will hit that block" predicts the same events far more cheaply, and almost always correctly. On Dennett's view a pattern is real to the extent that describing the world in its terms buys this kind of predictive power. It is the same reason we speak of hurricanes, waves, species and persons rather than of molecules. It is one influential view among others, and Life is its standard illustration.

## Beyond B3/S23

Any choice of birth and survival numbers gives a "Life-like" rule. **HighLife** (B36/S23) behaves much like Life but also has a small **replicator**, a pattern that makes copies of itself. **Seeds** (B2/S) has no survival at all: every cell lives for one generation, and most patterns explode. **Day & Night** (B3678/S34678) treats live and dead cells symmetrically, so a dark island in a live sea behaves like a live island in a dead one. **Life without Death** (B3/S012345678) never kills anything and grows crystal-like structures.

Try a few rules at random and most are boring: they freeze, die out or boil into featureless noise. Rules as rich as Life are rare, which echoes Langton's edge of chaos from Module 05.

## Langton's ant

In 1986 Christopher Langton studied an even simpler world: a single moving **ant** on a grid of white and black cells. On a white cell it turns right, on a black cell it turns left; then it flips the colour of the cell and steps forward. From an empty grid the ant first draws small symmetric shapes, then wanders chaotically for about 10,000 steps. Then, abruptly, it starts building a **highway**: a cycle of 104 steps that moves it two cells diagonally, repeated forever.

It has been proved that the ant's path is always unbounded, but nobody has proved that it always ends up building a highway from every finite starting pattern. Giving the cells more colours, each with its own turn, produces **turmites**: some draw symmetric patterns, some stay chaotic, some build highways of their own.

## Order in the ash

Fill a grid at random and let Life run. The early generations boil; then activity dies down, and what is left is a scattering of blocks, beehives, blinkers and other small pieces that players call **ash**. In the experiment of Panel C, the density of the ash depends only weakly on the starting density over a wide range. This regularity is not written in the rules; it appears at a level above them.

In 1989 Per Bak, Kan Chen and Michael Creutz went further and suggested that Life sits close to a critical state, with disturbances that die out after avalanches of activity of every size. Later work questioned how close it really is, but the idea leads straight to Module 08.

## A Bitcoin connection

A glider is a persistent pattern, not a fixed collection of cells. Bitcoin is like that too. The machines running it come and go, the software is rewritten release after release, the people taking part change; yet the ledger and its rules persist, kept alive by local interactions among many independent nodes, with no one in charge. Asking "what is Bitcoin, really?" is a version of Dennett's question.

<!-- simulation -->

## What to observe

1. Stamp a glider and press Step: how many generations does it need to return to its shape, and where has it moved? Rotate it and stamp four gliders heading in different directions.
2. Load the Gosper gun, switch the boundary to Finite and watch the population chart. What shape does it have? Now try the torus: what happens when the gliders come back around?
3. Load the R-pentomino and then the acorn on a finite grid, and note the generation at which the status reports a cycle. Why can it be later than the 1103 and 5206 quoted in the lecture?
4. Switch to HighLife and load the replicator. Then run the same pattern under Life: what is different?
5. Run Langton's ant at maximum speed: at which step does the highway begin? Then try LLRR and LRRRRRLLR.
6. In the soup experiment, does the final density depend on the initial one? Over which range does it hardly matter, and what happens at the extremes?

## Further reading

- M. Gardner, "Mathematical Games: The fantastic combinations of John Conway's new solitaire game 'life'", *Scientific American* 223 (October 1970) 120–123.
- E. R. Berlekamp, J. H. Conway & R. K. Guy, *Winning Ways for your Mathematical Plays*, vol. 2 (Academic Press, 1982).
- C. G. Langton, "Studying artificial life with cellular automata", *Physica D* 22 (1986) 120–149.
- P. Bak, K. Chen & M. Creutz, "Self-organized criticality in the 'Game of Life'", *Nature* 342 (1989) 780–782.
- D. C. Dennett, "Real Patterns", *Journal of Philosophy* 88 (1991) 27–51.
- A. Gajardo, A. Moreira & E. Goles, "Complexity of Langton's ant", *Discrete Applied Mathematics* 117 (2002) 41–50.
