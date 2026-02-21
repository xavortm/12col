# Copilot Instructions

## Commands

```bash
pnpm dev              # Dev server on localhost:4321
pnpm build            # Production build
pnpm test             # Unit tests (watch mode)
pnpm test:run         # Unit tests (single run)
pnpm test:e2e         # E2E tests (Playwright, Chromium)
pnpm format           # Format & lint with Biome (--staged / --changed supported)
pnpm format:check     # Check formatting without writing
```

Run a single unit test: `pnpm vitest run src/projects/cards/scripts/scoring.test.ts`
Run a single e2e test: `pnpm playwright test e2e/cards.spec.ts`

## Architecture

This is a **pnpm monorepo** containing one Astro site that hosts independent sub-projects.

- **Root Astro site** — welcome page at `/`, sub-projects at `/projects/[name]/`
- **`packages/cyberpunk-ui/`** — `@12col/cyberpunk-ui`, a shared library of Lit web components and CSS design tokens. Import components via `@12col/cyberpunk-ui/components/*` and tokens via `@12col/cyberpunk-ui/styles/*`.
- **`src/projects/[name]/`** — each sub-project has its own `components/`, `scripts/`, `styles/`, and `assets/`. Projects are independent of each other.
- **`src/layouts/Layout.astro`** — minimal shared layout (HTML boilerplate, meta, resets). Never put project-specific code here.
- **`src/pages/projects/[name].astro`** — route file per project. Import the layout + project components.

Projects default to `@12col/cyberpunk-ui` but can be fully standalone with their own visual direction.

## Conventions

- **Formatting**: Biome with tabs, indent width 4. Never manually format — run `pnpm format`.
- **TypeScript**: Strict mode (`astro/tsconfigs/strict`). All generated JS must have proper types.
- **CSS**: Use cascade layers for specificity control. Use logical properties naming (`__start`/`__end`, not `__left`/`__right`).
- **Dependencies**: Minimize JS sent to browser. Prefer native browser APIs. No unnecessary packages.
- **A11y**: Hard requirement on all projects.
- **Tests are source of truth**: When tests fail, fix the implementation, not the tests. Only modify tests when UI selectors/structure legitimately changed or new coverage is needed.
- **E2E determinism**: Use `?shuffle=false` URL parameter for predictable card positions in e2e tests.
- **Types location**: Types for `@12col/cyberpunk-ui` live in that package; project-specific types stay within the project.

## CSS Details

Projects can organize CSS using cascade layers for predictable specificity:

```css
@layer normalize, base, layout;

@import url('./vendor/normalize.css');
@import url('./base/colors.css');
@import url('./base/core-styles.css');
@import url('./layout/main.css');
```

Use logical properties terminology for directional class names:
- `__start` / `__end` instead of `__left` / `__right`
- `__block-start` / `__block-end` instead of `__top` / `__bottom`

This aligns with CSS logical properties and supports RTL layouts.

## Cards Project Context

### Scripts
- `game-init.ts` — Initialization, URL state, card rendering
- `cards.ts` — Click handling, score, match detection
- `clock.ts` — Timer
- `victory-modal.ts` — End game modal

### Events
- `game:init` — Reset game state
- `game:complete` — Game won (detail: {score})

### URL Params
- `?shuffle=false` — Deterministic card order
- `?count=8|12|16|24` — Card count
- `?pack=packId` — Card pack

### Testing
- E2E: `e2e/cards.spec.ts`
- Use `?shuffle=false` for predictable tests
- Pairs at positions (i, i + pairCount)

### CSS
When you add a button, just use `.button` class or its variations.
If you need a new component like it, follow the same pattern to reuse.
Do not create new styles unless they don't exist already in another component which can be reused.

### A11y
Follow Web Content Accessibility Guidelines (WCAG) 2.1 rules.
Target AAA level where possible; AA is a requirement.
Only write semantic tags, do not set role where not needed.
