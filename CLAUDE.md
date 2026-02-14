# CLAUDE.md

## Project Overview

Astro site with a welcome page on `/` linking to sub-projects at
`/projects/[name]/`.

- Projects default to `@12col/cyberpunk-ui` — shared Lit web components and
  design tokens in `packages/cyberpunk-ui/`.
- Projects *can* be fully standalone if they need a different visual direction.
- Everything bundles into one deployable Astro project.

## Commands

Never waste tokens on formatting. Run `pnpm format` or `pnpm format:check`
from the root. Supports `--staged` and `--changed` flags.

## Context Files

Read these based on the task at hand:

| File | When to read |
|------|-------------|
| `.claude/architecture.md` | Creating/modifying projects, routes, layouts, components, or adding dependencies |
| `.claude/css.md` | Writing or modifying styles |
| `.claude/testing.md` | Writing, running, or debugging tests |

## References

TBA
