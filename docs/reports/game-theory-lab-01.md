# Game Theory Lab 01 — report

Prompt 1: the skeleton of the lab and module 01, "What is a game?".
25 November 2026, branch `game-theory-lab`, local commits only, nothing
pushed.

## Commits

| Hash | Message |
|---|---|
| 479e821 | Game Theory Lab: skeleton |
| 7641e52 | Game Theory Lab 01: What is a game? |
| (this file) | Game Theory Lab 01: report |

One WIP checkpoint (`WIP Game Theory Lab 01: logic, self-check, figures,
panels, lectures, texts`) was made and squashed into 7641e52.

## Before starting

Three of the four points held: the tree was clean, local `main` equalled
`origin/main` after the fetch (ddfed85), `network-modules.json` had 14
modules all "ready", and no branch `game-theory-lab` existed.

**One point did not hold as written: the session was on `network-lab`, not
on `main`.** `network-lab` and `main` were the same commit (ddfed85, no
commit apart), so I did not stop: I created the branch from `main` itself
(`git switch -c game-theory-lab main`). Nothing was changed on `network-lab`
or `main`. If you wanted a stop here regardless, this is the place where I
departed from the letter of the prompt.

## What differs from the spec

1. **"Play again" does not reach 1 with the default noise.** The rule of the
   spec (level k says the previous mean × p^k plus normal noise σ, clipped to
   0–100) has a floor: a guess cannot go below 0, so near 0 the noise only
   pushes up. With σ = 2 and the default shares the mean goes 29.37, 17.51,
   10.45, 6.38, 3.86, 2.52, 1.76, 1.40, 1.27, 1.18 and then stays between
   1.06 and 1.34 (rounds 10 to 40); it does not fall below 1 in 200 rounds,
   with the page's seed or with ten others. With σ = 0 the simulation gives
   exactly the rounds of 50 f^t: 8, 22 (p = 0.9), 6 (p = 1/2), 4 (deep
   thinkers). I kept the rule as specified and did not touch the noise: the
   panel says "after n rounds the mean has not fallen below 1", and the
   observe list tells the reader why and asks them to set σ = 0, where round
   8 appears. The self-check pins both facts. (With σ = 2: deep thinkers 4,
   p = 1/2 round 15 with the page's seed and 7 to 20 over twelve seeds,
   p = 0.9 never; with σ = 1 and the default shares, round 8.)
2. **A "10 more rounds" button** next to "Play again" (22 presses for
   p = 0.9 seemed too many).
3. **The slider of p** moves through 0.10, 0.15, …, 0.95 plus 2/3 (an index
   slider), so that 2/3, 1/2 and 0.9 are all reachable. It shows "2/3" and
   "1/2" as fractions.
4. **The reader's own guess** is ranked among the N others ("would have come
   k of N + 1") and does not move the mean.
5. **Panel C opens on 3 × 3**, not 2 × 2 (the spec gave no default); the
   chosen size is surveyed again at every change of m or G, through
   `useExperiment`.
6. **Exercises 3 and 4** are typed "on paper, then in the simulation": each
   ends with a check on the page (the map; "Survey all games"). Exercise 6
   has the same type (the engine has no "simulation, then paper").
7. **The lecture's first table** (section 2) is a small game of my own (U, D
   against L, R, solved in two deletions as (D, R)), used again in sections 3
   and 4; it is pinned by the self-check.
8. **Section 8 adds one sentence**: at eight by eight two games in three
   still have a stable cell (0.678 here).
9. **Figure heights**: F1 is 371 px at 1280 px in English and 409 px in
   Italian (the explanation line wraps once more), F2 367 px; at 375 px, 401
   and 604 px. The Network Lab's guide figure is "about 340 px".
10. **The hub** was left with its two-column grid: the three cards sit two
    and one.

Nothing else differs. No Bitcoin box, no recharts, no canvas (everything is
HTML and SVG, so nothing captures a swipe), no change to the site's
`package.json`, to `config.json`, to the nav, or to any Complexity Lab or
Network Lab lecture or module file.

## Wiring audit (stage 1)

Searched for: `network-lab`, `network-modules`, `LAB_PATHS`, `labId`,
`'network'`, `"network"`, `Network Lab`, `/lab`, `/labs`, `labs`.

**Changed**

| File | Change |
|---|---|
| `src/data/lab/paths.js` | `'game-theory': '/game-theory-lab'`, marked provisional |
| `src/data/lab/game-theory-modules.json` | new: 14 modules, four parts |
| `src/data/lab/registry.js` | the third entry, after the Network Lab |
| `src/pages/lab/loaders.js` | own `import.meta.glob` and loader |
| `src/App.jsx` | one comment (the list of labs); the routes come from `LAB_PATHS` |
| `scripts/lab/browser-checks/lib.mjs` | `LAB_FILES['game-theory']` |
| `scripts/lab/browser-checks/check-index.mjs` | one comment (the lab ids) |
| `scripts/lab/browser-checks/check-links.mjs` | scrolls to the top before clicking "All labs" (see below) |
| `scripts/lab/browser-checks/expect.json` | `game-theory/what-is-a-game` (stage 2) |
| `scripts/lab/browser-checks/README.md` | the new lab, its commands |
| `CLAUDE.md` | the subsection "Game Theory Lab (`/game-theory-lab`)" only |
| `docs/game-theory-lab-status.md` | new |

**Looked at and left alone**

- `src/components/Header.jsx`, `src/data/nav.json`: the dropdown and the
  "current section" mark are built from the registry. The new lab appears by
  itself (checked by `check-links.mjs`).
- `src/pages/lab/LabsHub.jsx`, `LabIndex.jsx`, `LabChapter.jsx`,
  `LabLecture.jsx`: they render any registry entry. `LabChapter` calls
  `loaders[lab.id]`, which works with the hyphenated id.
- `scripts/lab/browser-checks/check-module.mjs`, `shots.mjs`,
  `build-main.mjs`: generic (they take the lab id).
- `scripts/lab/browser-checks/compare-main.mjs`: its default list is
  Complexity Lab pages sharing code with the other labs; no shared file
  changed, so nothing was added. I ran it with extra paths (below).
- `scripts/newsroom/` (`lib/routes.mjs`, `postbuild.mjs`, `check-dist.mjs`,
  `validate.mjs`, browser checks), `src/lib/site.js`,
  `src/lib/staticFallback.js`: no lab route is a static page, in the sitemap
  or in the feed (neither `/lab` nor `/network-lab` is there). The new lab
  follows the same rule: nothing to mirror. `npm run build` wrote the same 9
  static pages and 3 stubs as before.
- `public/404.html`, `index.html`, `public/robots.txt`, `vite.config.js`,
  `package.json`, `.github/`: no lab is named.
- `scripts/lab/check-network-*.mjs`, `build-network-14.mjs`,
  `precompute-network-05.mjs`: Network Lab only.
- Texts that count or list the labs: the hub's intro and `LabsHub` copy name
  no number; `CLAUDE.md` and the README of the browser checks were updated;
  `docs/network-lab-status.md` is the Network Lab's history and was not
  touched.

**A finding of the audit.** `check-links.mjs` failed twice at 1280 px on
"… and it leads back to the hub" for the new lab. Cause: the site does not
reset the scroll position when the route changes. With three cards the hub
has a second row; clicking the third card scrolls the hub by 94 px, the lab
index opens 94 px down, and the "All labs" link sits under the fixed header,
where a click lands on the site title. The link itself works. I made the
check scroll to the top before clicking and did not change the site (it is
not lab code and it would change every page). A visitor on a 900 px tall
window who opens the third card does land slightly scrolled. Options if you
want it fixed: reset the scroll on navigation in the lab pages, or give the
hub three columns on wide screens.

## Checks, stage 1

| Check | Result |
|---|---|
| `npx vite build` | built |
| `check-index.mjs game-theory` | 0 failures of 80 |
| `check-index.mjs network` | 0 of 76 |
| `check-index.mjs complexity` | 0 of 72 |
| `check-links.mjs` | 2 failures of 100, then 0 of 100 after the change above |
| hub | three cards: "13 of 13", "14 of 14", "0 of 14 modules ready" |
| new index, locked and admin, EN and IT, 1280 and 375 px | 4 part headings, 14 cards, 14 "In preparation" / "In preparazione" badges, no horizontal scroll, no console errors (8 of 8 combinations) |
| `npm run build` | validate, build, post-build: 9 static pages, 3 stubs, feed, sitemap |
| `npm run check:dist` | 0 failures of 108 |
| `build-main.mjs`, `compare-main.mjs` (default list) | 0 failures of 144 |
| `compare-main.mjs labs lab network-lab network-lab/reading-a-network` | 16 failures of 108, all on `/labs`: the new card (text, links and page height) in the 8 combinations. Nothing else differs |

`compare-main.mjs` compares the inside of `<main>`, so the new dropdown
entry is not in it; `check-links.mjs` confirms the dropdown lists the three
labs, on desktop and in the mobile menu.

**Home page.** The main bundle (which holds the registry and the module
lists) went from 900,837 to 907,287 bytes: **+6.45 kB** (gzip 258.82 →
260.81 kB, +1.99 kB). After stage 2 it is 907,281 bytes (+6.44 kB).

## Checks, stage 2 (on the build of `npm run build`)

| Check | Result |
|---|---|
| `npx vite build`, `npm run build` | built |
| `node scripts/lab/check-game-theory-01.mjs` | all 98 checks passed |
| `check-index.mjs game-theory` / `network` / `complexity` | 0 of 80 / 0 of 76 / 0 of 72 |
| `check-links.mjs` | 0 of 100 |
| `check-module.mjs game-theory what-is-a-game` | 0 of 56 (locked and admin, EN and IT, 1280 and 375 px) |
| `modules/game-theory-what-is-a-game.mjs` | 0 of 32 (1 failure on the first run, in the check's own selector, which also counted the second figure) |
| `compare-main.mjs` (default list) | 0 of 144 |
| `compare-main.mjs lab network-lab network-lab/reading-a-network network-lab/weights-flows-navigation` | 0 of 108 |
| `npm run check:dist` | 0 of 108 |

`check-network-01` to `14` were not run: no file they use was changed.

## Self-check numbers

**Presets.** Prisoner's Dilemma: C dominated for both, solved at (D, D);
(D, D) is the only cell beaten for both. Stag hunt, battle of the sexes,
pure coordination: nothing dominated, two stable cells on the diagonal.
Chicken: two, off the diagonal. Matching pennies: none.

**F1.** "Four steps": R (L is better), U and M (D), L (C); (D, C) left.
"Stops half-way": R, U; a 2 × 2 game with (M, L) and (D, C). "Nothing to
delete": nothing; (M, C). On 2,000 random games with ties, what is left does
not depend on the order of deletion, the stable cells equal a brute-force
search, and no stable cell is ever deleted.

**Survey.** All as expected: 576 tables; stable cells 72 / 432 / 72;
dominant for both 144, for one 288, for neither 144; solved 432; like the
Prisoner's Dilemma 4; 144 games with strategies renamed (18 / 108 / 18; both
dominant 36; one like the PD); 78 with players swapped (9 / 57 / 12; one
like the PD); 12 symmetric games (24 symmetric tables).

**F2.** The four points fall in the four regions. On the 0.05 grid, the 81
points with T = 1 or S = 0 read "on the border" and the other 1,600 have one
stable cell and a dominant strategy (PD, harmony) or two and none (stag
hunt, chicken).

**Guessing game, exact.** Levels 33.33, 22.22, 14.81, 9.88; f = 0.5963;
default 29.81 and 19.88; deep thinkers 15.56 and 10.37; half at equilibrium
14.26 and 9.51; p = 0.9: 41.55 and 37.39; p = 1/2: 23.125 and 11.5625
(which print as 23.13 and 11.56 or 11.57 depending on rounding; your 23.12
is the same number).

**Guessing game, 1,000 plays (N = 1,000, σ = 2, seed 4200).**

| Setting | Mean, target | Wins (level 0 / 1 / 2 / 3 / eq.) | Ten other seeds |
|---|---|---|---|
| Default | 29.82, 19.88 | 57 / 0 / 917 / 26 / 0 | level 2 894–924, level 0 50–70, level 3 21–46 |
| Deep thinkers | 15.56, 10.37 | 0 / 0 / 0 / 1,000 / 0 | always 1,000 |
| Half at equilibrium | 14.25, 9.50 | 615 / 0 / 0 / 385 / 0 | level 0 565–616, level 3 384–435 |
| Default, p = 0.9 | 41.55, 37.40 | 56 / 2 / 468 / 474 / 0 | level 2 455–502, level 3 439–484 |
| Default, p = 1/2 | 23.13, 11.57 | 27 / 0 / 960 / 13 / 0 | |

Mean distance from the target, default: 34.1 / 13.5 / 2.6 / 5.1 / 19.9.
The round shown when the page loads (seed 4100): mean 29.37, target 19.58,
winning guess 19.58, a level 2 player.

**Whole numbers.** "Everyone says 1" is stable for N from 5 to 100, a tie at
N = 4, not stable at N = 3; moving up to 2…100 never pays.

**Random games, 20,000 per size (seed 5100).**

| m | Dominated | Solved | Cells left | No stable cell | Exactly one | Two or more |
|---|---|---|---|---|---|---|
| 2 | 0.750 | 0.7495 | 1.75 | 0.125 | 0.750 | 0.125 |
| 3 | 0.778 | 0.4377 | 4.07 | 0.212 | 0.579 | 0.208 |
| 4 | 0.729 | 0.2069 | 9.05 | 0.253 | 0.511 | 0.236 |
| 5 | 0.644 | 0.0775 | 17.51 | 0.283 | 0.472 | 0.245 |
| 6 | 0.540 | 0.0214 | 29.17 | 0.294 | 0.454 | 0.252 |
| 7 | 0.425 | 0.0042 | 43.68 | 0.314 | 0.430 | 0.256 |
| 8 | 0.308 | 0.0008 | 60.20 | 0.322 | 0.419 | 0.259 |

**Exercises 1 to 4**: the exact answers, checked by the script.

## "Expected" values that differ from mine

None is outside your limits, and no limit was changed. What differs:

- **Half at equilibrium:** level 0 wins 615 and level 3 385 (you: about 575
  and 425). Over ten other seeds level 0 wins 565 to 616: your value is in
  that range, mine is at its top. The texts quote the page's 615 and 385.
- **Default with p = 0.9:** 468 and 474 (you: about 490 and 460). The two
  are nearly even and the order flips with the seed (455–502 against
  439–484). The observe list says "share the wins almost evenly".
- **Default:** 917 / 57 / 26 (you: about 920 / 60 / 20). Same.
- **At least one dominated strategy at m = 8:** 0.308 (you: 0.321). Inside
  the limit of 0.015 (gap 0.013), but ten other samples of 20,000 games give
  0.307 to 0.316, so 0.321 lies above everything I drew. All the other
  shares agree within 0.010. I could not find a reason in the code (m = 2
  gives the exact 3/4 and 1/8, and every size passes the brute-force checks);
  it may be the sampling of your run, or a small difference in what counts
  as dominated. Worth a second look on your side.
- **Exactly one stable cell at m = 8:** 0.419 (you: 0.426); ten other seeds
  give 0.422–0.427, so here it is my page seed that sits low. No stable
  cell at m = 8: 0.322 (you 0.315; other seeds 0.314–0.321).
- **Cells left:** 1.75, 4.07, 9.05, 17.51, 29.17, 60.20 (you: 1.76, 4.09,
  9.05, 17.45, 29.15, 60.0). You gave no limit; the check uses ±0.25.
- **"Play again":** see point 1 above. Your rounds 8, 22, 6 and 4 are those
  of the formula and of the simulation without noise.

## Exercise answers that differ from yours

- Exercises 1 to 4: none.
- Exercise 5 (my numbers): default mean 29.81 and target 19.88 (yours 29.8
  and 19.9); level 2 wins 917 times, level 0 57, level 3 26 (yours 920, 62,
  18). Deep thinkers 15.56 and 10.37, level 3 always (the same). Half at
  equilibrium 14.26 and 9.51; level 0 wins 615 times and level 3 385 (yours
  575 and 425).
- Exercise 6 (my numbers, 20,000 games): 0.750, 0.438, 0.207, 0.021 (yours
  0.746, 0.440, 0.206, 0.023); no stable cell 0.125 at m = 2 and 0.322 at
  m = 8 (yours 0.125 and 0.315). The solution says that other samples differ
  by about 0.01.
- Exercise 2 adds two things to your answer: the values of the guesses
  (level 9 says 1.30, level 10 0.87; 0.78 at p = 1/2; 0.91 at p = 0.9) and
  that moving up from 1 never pays.

## The numbers behind each "What to observe"

**Panel A.** Prisoner's Dilemma: C dominated for both, (D, D) left and the
only cell beaten for both. Stag hunt and chicken: two stable cells, on and
off the diagonal. Matching pennies: none. With the row player's payoff in
(C, C) raised from 3 to 6: only the column player's C is dominated, and the
game is still solved at (D, D) in two steps. Survey: 576, 432, 72, 144, 78,
4.

**Panel B.** Page round 29.37 / 19.58, level 2; 1,000 plays 917 / 57 / 26,
levels 1 and equilibrium 0; distances 19.9, 13.5, 34.1; deep thinkers 15.56
and 10.37, level 3 always; half at equilibrium, target about 9.5, 615 and
385; "10 more rounds": 29.4, 17.5, 10.5, 6.4, then a little above 1, and
round 8 with σ = 0; p = 0.9: target near 37, 468 and 474; p = 1/2: level 2
wins 960 times.

**Panel C.** Opening state (2,000 games, 3 × 3): dominated 0.788, solved
0.430. With 20,000 games: solved 0.750, 0.438, 0.207, 0.077, 0.021, 0.004,
0.001; no stable cell 0.125 → 0.322; exactly one 0.750 → 0.419; at least
0.66 of the games have a stable cell at every size; 60.2 of 64 cells left at
m = 8.

**Lecture.** 144 and 78; a quarter with a dominant strategy for both (36 of
144); the Prisoner's Dilemma the only one of the 144; three quarters solved,
one eighth with two stable cells, one eighth with none; 66.7, 44.4, 29.6,
19.8, 13.2; 33.3 and 22.2; page round 29.4 and 19.6; 917; 75%, 44%, 8%,
"about one in a thousand" (0.0008; the page shows 0.001; 0.0004 to 0.0009
over ten other seeds); two in three with a stable cell at 8 × 8 (0.678).

## "Check" figures: confirmed and softened

| Claim | Source | Result |
|---|---|---|
| Badminton, London 2012: matches on 31 July, eight players (four pairs) disqualified the next day, one pair from China, two from South Korea, one from Indonesia, for trying to lose group matches after qualifying | AP and other news reports of 1 August 2012 | Confirmed. The lecture says "a defeat … would have given them an easier draw" and gives no detail of whom each pair wanted to avoid |
| von Neumann 1928; von Neumann and Morgenstern 1944 | Reference pages; the book's preface as quoted | Confirmed. The lecture says "the first theorem of the subject" and does not name the minimax theorem (module 03 will) |
| Nagel (1995): mean about 37 | The paper (JSTOR copy, text extracted): first period, p = 2/3, mean 36.73, median 33; p = 1/2 mean 27.05; p = 4/3 mean 60.12; footnote: numbers above 100p are weakly dominated | Confirmed |
| Nagel: "spikes near 33 and 22" | Not found as a sentence in the extracted text of Nagel's paper (the figures did not extract) | **Softened and moved**: the lecture attaches the clusters near 33 and 22 to the newspaper experiments, where the source states it |
| Newspaper contests: thousands of readers, means around 19 to 25 | Bosch-Domènech et al., working-paper version (UPF 438), text extracted: 7,900 participants (3,696 Expansión, 1,476 Financial Times, 2,728 Spektrum der Wissenschaft); averages 25.47, 18.91, 22.08; "Fact 1": the numbers of the steps of reasoning coincide with the peaks observed (33.33, 22.22 and the equilibrium) | Confirmed. "Thousands of readers each" became "7,900 readers in all", since one paper had 1,476 |
| Keynes 1936, ch. 12 | Reference pages quoting the passage | Confirmed |
| Rapoport and Guyer 1966: 78 games | Later papers citing it (78 strictly ordinal games; 144 when the players' positions matter) | Confirmed through secondary sources; the 1966 article itself was not read |

## References I could not confirm

All thirteen stay in "Further reading". Confirmed in this session:
journal, volume and pages of Nagel (1995), Bosch-Domènech et al. (2002) and
Rapoport and Guyer (1966); publisher and year of von Neumann and Morgenstern
(1944); Keynes's chapter 12. **Not checked against a source in this session**
(left as you gave them, which matches what I know of them): the chapter
numbers of Osborne (2 and 12), Tadelis (3 and 4), Shoham and Leyton-Brown
(3) and Roughgarden (Lecture 1); the page ranges of Bernheim (1984) and
Pearce (1984); Camerer, Ho and Chong (2004); Robinson and Goforth (2005).
None looked wrong, but they are unverified here.

Roughgarden's Lecture 1 opens with the same badminton episode. The lecture's
account is four sentences written from the news reports, not from the book.

## Timings and sizes

In headless Chrome on this PC:

- "Play 1,000 times" at N = 5,000: **0.5 s** (328 ms in Node).
- "All sizes" with 2,000 games: **0.3 s** (227 ms in Node). With 20,000
  games the same job takes about 2.1 s in Node, across animation frames.
- Nothing slow runs on load: one round of 1,000 players and 2,000 games of
  size 3 × 3.

Chunks:

| Chunk | Size | Gzip |
|---|---|---|
| Module 01 (`index-CFQZFp4A.js`: code, both lectures, texts, `PayoffTable.jsx`) | 81.5 kB | 29.3 kB |
| `ui-*.js` (`network/ui.jsx`) | 2.32 kB | 1.28 kB |
| `charts-*.js` (`network/charts.jsx`) | 3.14 kB | 1.40 kB |
| `Slider-*.js` | 1.20 kB | 0.67 kB |
| `useExperiment-*.js` | 0.86 kB | 0.42 kB |

`network/ui.jsx` and `network/charts.jsx` were imported unchanged and stay
in the small chunks of their own that the Network Lab already had (same
sizes as on main), requested only when unlocked. `PayoffTable.jsx` has one
user so far and is inside the module's chunk. One side effect of the new
importer: Vite regrouped the shared code, so the `Slider` chunk went from
6.9 kB to 1.2 kB and the file names (hashes) of the Network Lab chunks
changed, with 0.03 to 0.04 kB more each; their pages compare equal to main.

A locked visitor requests none of this: the locked module page asks only for
the main bundle, `LabChapter`, `useLabLang` and `AdminBar`.

## Italian terms

| English | Italian |
|---|---|
| game | gioco |
| player | giocatore (di riga, di colonna) |
| strategy | strategia |
| payoff | payoff |
| normal form | forma normale |
| strictly dominated | strettamente dominata |
| dominant strategy | strategia dominante |
| iterated elimination | eliminazione iterata |
| best response | risposta migliore |
| common knowledge | conoscenza comune (della razionalità) |
| level of reasoning | livello di ragionamento |
| stable cell | cella stabile |
| stag hunt | caccia al cervo |
| chicken | gioco del pollo |
| snowdrift | *snowdrift* (kept in English) |
| harmony | armonia |
| battle of the sexes | battaglia dei sessi |
| matching pennies | *matching pennies* (kept in English) |
| zero-sum | a somma zero |

Also: hawk–dove = falco–colomba; weak dominance = dominanza debole;
temptation = tentazione; sucker's payoff = payoff dell'ingenuo; to defect =
defezionare; target = bersaglio; round = turno; beauty contest = concorso di
bellezza. All are recorded in `docs/game-theory-lab-status.md`. Two to
review: "matching pennies" and "snowdrift" left in English, and "payoff
dell'ingenuo".

## For you to decide

1. Whether "Play again" should keep the noise as specified (the mean then
   stalls just above 1, which the page explains) or shrink it with the
   reference point.
2. The scroll position on navigation (hub, third card).
3. The 0.321 at m = 8.
4. The DRAFT lecture.
