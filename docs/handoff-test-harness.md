# Test harness and CI — NOT BUILT, scoped 19 November 2026

> This is a to-do, not a record. Nothing below is built. It is the brief for a
> session that sets up automated tests and CI for this repo.

Read `CLAUDE.md` and `docs/PROJECT_STATUS.md` first, then this.

## The problem

**This repo has zero automated tests and no CI.** The only check that runs on a
pull request is "Vercel Preview Comments", which proves the app built and
deployed and nothing else. `docs/PROJECT_STATUS.md` already says it plainly:

> a green Vercel status is proof the app *built and deployed*, never proof a
> page renders or a query works. Somebody has to open it in a browser.

So today every regression is caught by Karl manually clicking a Vercel preview,
or it is not caught. A maths bug in lead allocation reaches five real trainers
before anybody notices.

Worth knowing what that already cost once: the workbook crash fixed in PR #60
sat live for five weeks. Three faults, all in two small client components, all
of a kind a unit test would have caught the day they landed. It was found by
reading an orphan branch, not by anything automatic.

## There is prior work. Do not merge it

Branch `claude/superpowers-setup-jkjgnn`, two commits, 19 September 2026. It has
sat unmerged for nine weeks and contains:

| What | Where |
|---|---|
| Vitest config | `vitest.config.ts` |
| 82 unit tests | `src/lib/allocation.test.ts`, `countdown.test.ts`, `csv.test.ts`, `validation.test.ts` |
| GitHub Actions CI | `.github/workflows/ci.yml` |
| A `verify-live-state` skill | `.claude/skills/verify-live-state/` plus three reference files |
| Dependency and docs changes | `package.json`, `package-lock.json` (a 2,547-line diff), `CLAUDE.md` |

**Rebuild it on current code rather than merging the branch.** All four modules
under test have changed since September, and the lock file will conflict badly
against nine weeks of drift.

Use the existing test cases as a **specification**, not as files to merge. Read
each one, decide whether it still describes current behaviour, port the ones
that do, and update or drop the ones that do not. Say in the PR which tests you
dropped and why. A test ported without being read is worse than no test: it
goes green and means nothing.

## Scope for this pass

**In:** unit tests for pure logic in `src/lib`, and a CI workflow that runs them
alongside the three checks `CLAUDE.md` already requires before a push:

```
npx tsc --noEmit
npx eslint src
npm run build
```

**Out:** end-to-end and browser tests. Not because they are not worth having,
but because the first pass should be the one that can run anywhere, with no
credentials and no database.

**Your call, and say which way you went:** whether the `verify-live-state` skill
is still worth carrying. It was written before several of the things it checks
changed.

## Two things that will bite you

**1. Cloud sessions clone this repo shallow and without `node_modules`.**

Run `npm install` before you trust any check. Without it `tsc --noEmit` exits 1
on every file in the repo and it reads like a code problem rather than a missing
dependency. This cost real time on 19 November, and two PRs went up that day
reporting a check as clean when it had not run.

If you need accurate merged/unmerged branch counts, `git fetch --unshallow origin`
first. The verification command in `docs/PROJECT_STATUS.md` handles this now, but
anything you write yourself will not.

**2. There are no Supabase credentials in a cloud session.**

Nothing that needs a live database can be exercised from here. Keep this pass to
pure functions. The Supabase MCP is available for read-only schema checks if you
need to confirm a shape, and `docs/DATA_MODEL.md` has the ERD.

## Done looks like

- Tests run locally with a documented command and pass.
- CI runs them on every PR, and you have seen it go green on your own PR.
- You have confirmed CI actually fails on a broken test, by breaking one
  deliberately and watching it go red, then putting it back. A CI job that has
  never failed is not known to work.
- `docs/PROJECT_STATUS.md` records the setup under working practices, including
  how to run the tests locally.
- Pushed to a dedicated branch with a PR open. **Do not merge it yourself.**

## Afterwards

`claude/superpowers-setup-jkjgnn` can be deleted once its useful content is
either ported or deliberately dropped. It is one of the unowned branches the
branch map asks somebody to claim or remove.
