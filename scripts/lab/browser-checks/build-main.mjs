// Builds another branch (default: main) into .main-dist/, for compare-main.mjs.
//
//   node build-main.mjs [--ref main]
//
// How: a temporary git worktree at .main-wt/ INSIDE this folder, so that Node
// finds the repo's own node_modules by walking up the tree. No junction or
// symlink to node_modules is created, so there is nothing that a recursive
// delete could follow into the real node_modules. The worktree is removed
// with `git worktree remove` at the end; both folders are git-ignored.
//
// (If you ever do build a worktree elsewhere through a junction to
// node_modules: remove the junction itself first, then the worktree. Never
// delete recursively through it.)
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, lstatSync, rmSync } from 'node:fs'
import path from 'node:path'
import { parseArgs, HERE, REPO } from './lib.mjs'

const { opt } = parseArgs()
const ref = typeof opt.ref === 'string' ? opt.ref : 'main'
const WT = path.join(HERE, '.main-wt')
const OUT = path.join(HERE, '.main-dist')
const git = (...args) => execFileSync('git', args, { cwd: REPO, stdio: 'inherit' })

function removeWorktree() {
  if (!existsSync(WT)) return
  // Safety: the worktree must not contain a link to node_modules.
  const nm = path.join(WT, 'node_modules')
  if (existsSync(nm) && lstatSync(nm).isSymbolicLink())
    throw new Error(`${nm} is a link. Remove the link itself by hand, then run again.`)
  git('worktree', 'remove', '--force', WT)
}

removeWorktree()
git('worktree', 'prune')
git('worktree', 'add', '--detach', WT, ref)
try {
  execFileSync(process.execPath, [path.join(REPO, 'node_modules/vite/bin/vite.js'), 'build'], { cwd: WT, stdio: 'inherit' })
  rmSync(OUT, { recursive: true, force: true })
  cpSync(path.join(WT, 'dist'), OUT, { recursive: true })
  console.log(`\nBuilt ${ref} into ${OUT}`)
} finally {
  removeWorktree()
}
