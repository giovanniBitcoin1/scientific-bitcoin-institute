<!-- DRAFT: to be reviewed by Adriano -->

## A shell and a line of code

The cone snail *Conus textile* carries on its shell a dense pattern of brown and white triangles, small and large, crowded together without ever quite repeating. Run a one-line rule on a computer, starting from a single dark dot, and a strikingly similar picture appears. Coincidence, or can simple local rules really generate this much complexity?

## Rows of cells

John von Neumann and Stanisław Ulam invented cellular automata in the 1940s. Von Neumann wanted to know whether a machine could build a copy of itself, and Ulam suggested asking the question in a simplified universe of cells on a grid.

A **cellular automaton** (CA) is a row, or a grid, of cells, each in one of a finite number of states. Time moves in discrete steps, and at each step every cell is updated at the same moment by the same rule, which looks only at a small neighbourhood around the cell. There is no central control: everything that happens is the sum of local decisions.

## Elementary automata and their numbers

The simplest interesting case has one dimension and two states, 0 and 1, and a cell's neighbourhood is the cell and its two neighbours. Three cells with two states give 2³ = 8 possible neighbourhoods; a rule says what each one becomes, and eight yes-or-no choices give 2⁸ = 256 rules, the **elementary cellular automata**.

Stephen Wolfram named them compactly. List the neighbourhoods in the order 111, 110, …, 000, write under each the state it produces, and read the eight outputs as a binary number. For the rule "the new cell is the exclusive OR (XOR) of its two neighbours":

```math
111 110 101 100 011 010 001 000
 0   1   0   1   1   0   1   0     →  01011010₂ = 90
```

That is Rule 90.

Draw each row under the previous one and you get a **space–time diagram**, space across and time running down. Since a cell hears only from its neighbours, information travels at most one cell per step: whatever happens at one point can influence, after t steps, only the cells within distance t. Every cell has a **light cone**, as in relativity, with one cell per step as the speed of light.

## Four kinds of behaviour

In 1983–84 Wolfram ran all 256 rules from random rows and sorted what he saw into four classes.

- **Class I**: everything dies out or becomes uniform.
- **Class II**: stable or periodic structures, separate blocks that stay put or blink.
- **Class III**: apparently random patterns. Rule 30 from a single cell grows a triangle with regular stripes on its left side and a disorderly scatter of triangles of every size inside: the picture that resembles the shell.
- **Class IV**: localised structures that move across a regular background and interact when they collide, as in Rule 110.

Between repetition and randomness there is also **nesting**. Rule 90 from a single cell draws the **Sierpiński triangle**, triangles inside triangles; its rows are Pascal's triangle with the odd numbers dark. A fractal from a rule that is nothing but an XOR. From a random row, though, Rule 90 looks disordered, and Wolfram counted it in class III: the classes describe typical starts, not special ones. They are a description, not a theorem, and some rules sit between two of them.

## Randomness from determinism

Rule 30 is fully deterministic, yet the column of cells below the starting dot passes many statistical tests of randomness; *Mathematica* used it as its random-number generator.

Every **pseudo-random generator** is like this: a deterministic machine with a finite state, which must eventually revisit a state and repeat. A good one has an astronomically long cycle and output that no practical test can tell apart from coin tosses. A bad one hides regularities that the right test, or the right picture, exposes. The simulation compares Rule 30 with a well-tested generator and with a deliberately weak one.

## Machines that compute

In 1936 Alan Turing described an abstract machine that reads and writes symbols on a tape following a finite table of instructions, and showed that a **universal** machine can imitate any other when given its table as input. The **Church–Turing thesis** states that whatever can be computed by a step-by-step procedure can be computed by a Turing machine.

Wolfram conjectured that Rule 110 is universal in this sense, and Matthew Cook proved it in a paper published in 2004. In principle Rule 110 can compute anything any computer can, if its initial row is prepared with great care: moving structures, the **gliders**, carry signals, and their collisions act as logic gates. The construction is hopelessly slow; the point is how little universality needs.

## The edge of chaos

In 1990 Christopher Langton characterised rules by a parameter λ, the fraction of neighbourhoods sent to a non-quiescent state; for elementary automata, the share of the eight output bits equal to 1. Rules with small λ tend to freeze, rules near 1/2 tend to look chaotic, and Langton argued that complex, computation-capable behaviour sits near the transition between order and chaos: the **edge of chaos**.

The idea has been influential and is still debated. In 1993 Melanie Mitchell, Peter Hraber and James Crutchfield re-examined an experiment that seemed to support it and could not reproduce its result; and λ is a crude summary that groups very different rules together.

## Deterministic, yet unpredictable

The first row of a CA fixes everything that follows. Yet for many rules nobody knows a shortcut: to learn row one million of Rule 30 you seem to have to compute every row before it. Wolfram calls this **computational irreducibility**. It is a cousin of the chaos of Module 01: there, tiny errors in the initial condition grew exponentially; here, even with an exact start, the only way to the answer may be to run the system.

## A road made of cells

Rule 184 reads as traffic: 1 is a car, 0 empty road, and a car moves one cell forward if the cell ahead is empty. Cars are never created or destroyed; below half occupancy traffic flows freely, above it jams form and drift backwards. Module 09 returns to traffic.

## What is this a model of?

Some CAs are genuine physical models. Hans Meinhardt explained shell pigmentation with activator–inhibitor systems, continuous relatives of CAs with the same essential structure: a line of cells at the growing edge of the shell laying down one new row at each step. Traffic rules, and lattice gases of hopping, colliding particles that simulate fluids, are others. Many rules model nothing in particular: they are mathematical objects, valuable because they reveal what simple rules can do. A simple model explains by showing which few ingredients are **sufficient** for a behaviour: if eight bits can draw the triangles of a shell, the snail need not encode each triangle.

## A Bitcoin connection

Bitcoin's proof of work rests on SHA-256, a deterministic function built from additions and simple bitwise operations on 32-bit words. Its output looks random, and flipping one input bit changes about half of the output bits: the **avalanche effect**, the same phenomenon you can watch with "flip one cell" in a class III automaton.

But looking random is not being secure. In 1985 Wolfram proposed Rule 30 as a stream cipher, and in 1991 Willi Meier and Othmar Staffelbach showed how to break it by recovering the key from the output. Cryptography needs much more than statistical randomness: it must withstand an adversary who knows exactly how the function works and hunts for any structure to exploit.

<!-- simulation -->

## What to observe

1. Load Rule 90 from a single cell: which fractal appears? Now start from a random row. What is left of the triangles?
2. Start Rule 30 and then Rule 110 from a random row and turn on "Flip one cell". In which does the difference spread, and how fast does its edge move? Can it ever beat one cell per step?
3. In the gallery, find three rules of each of Wolfram's four classes. Then filter by λ: where do most class III rules sit, and are there exceptions?
4. Load Rule 184 with a random row and periodic boundary. Move the density from 0.3 to 0.7: when do jams appear, and which way do they move?
5. Look at the weak generator's scatter plot: what pattern gives it away? Find the smallest N at which the simple counts catch it too.
6. Starting from Rule 30, toggle one output bit at a time with the neighbourhood icons. How often does a single bit move a rule into another class?

## Further reading

- J. von Neumann, *Theory of Self-Reproducing Automata*, edited and completed by A. W. Burks (University of Illinois Press, 1966).
- S. Wolfram, "Statistical mechanics of cellular automata", *Reviews of Modern Physics* 55 (1983) 601–644.
- S. Wolfram, "Universality and complexity in cellular automata", *Physica D* 10 (1984) 1–35.
- C. G. Langton, "Computation at the edge of chaos: phase transitions and emergent computation", *Physica D* 42 (1990) 12–37.
- M. Cook, "Universality in elementary cellular automata", *Complex Systems* 15 (2004) 1–40.
- H. Meinhardt, *The Algorithmic Beauty of Sea Shells* (Springer, 1995).
- S. Wolfram, *A New Kind of Science* (Wolfram Media, 2002).
