# Copilot Instructions

## Commands

```bash
pnpm dev              # Dev server on localhost:4321
pnpm build            # Production build
pnpm format           # Format & lint with Biome
pnpm format:check     # Check formatting without writing
```

## Architecture

This is a **pnpm monorepo** containing one Astro site that hosts independent sub-projects.

- **Root Astro site** — welcome page at `/`, sub-projects at `/projects/[name]/`
- **`packages/cyberpunk-ui/`** — `@12col/cyberpunk-ui`, a shared Lit web components library and CSS design tokens. Import components via `@12col/cyberpunk-ui/components/*` and tokens via `@12col/cyberpunk-ui/styles/*`.
- **`src/projects/[name]/`** — each sub-project has its own `components/`, `scripts/`, `styles/`, and `assets/`. Projects are independent of each other.
- **`src/layouts/Layout.astro`** — minimal shared layout (HTML boilerplate, meta, resets). Never put project-specific code here.
- **`src/pages/projects/[name].astro`** — route file per project. Import the layout + project components.
- **Base URL** — the site deploys to a subpath (`/12col/`). Use `import.meta.env.BASE_URL` for asset/link paths.

Projects default to `@12col/cyberpunk-ui` but can be fully standalone with their own visual direction. To add a project, create `src/pages/projects/foo.astro` and put code in `src/projects/foo/`.

### cyberpunk-ui Components

Lit web components using decorators and Shadow DOM:

```typescript
@customElement("cyber-example")
export class CyberExample extends LitElement {
  @property({ reflect: true }) accessor variant: string = "default";
  static override styles = css`...`;
  override render() { return html`<slot></slot>`; }
}
```

- Use `@property()` with `accessor` keyword for reactive properties
- Compose via named `<slot>` elements
- Theme with CSS custom properties (`--cyber-*` tokens in `tokens.css`)
- Each component declares its tag in `HTMLElementTagNameMap` for type safety
- In Astro, import as side-effect: `import "@12col/cyberpunk-ui/components/cyber-button"`

## Conventions

- **Formatting**: Biome with tabs, indent width 4. Never manually format — run `pnpm format`.
- **TypeScript**: Strict mode (`astro/tsconfigs/strict`). All generated JS must have proper types.
- **CSS**: Use cascade layers (`@layer normalize, base, components, layout`) for specificity control. Use logical properties naming (`__start`/`__end`, not `__left`/`__right`; `__block-start`/`__block-end`, not `__top`/`__bottom`).
- **Dependencies**: Minimize JS sent to browser. Prefer native browser APIs. No unnecessary packages.
- **A11y**: WCAG 2.1 AA minimum, target AAA. Semantic HTML, ARIA labels, keyboard navigation (arrow keys + vim hjkl), live region announcements.
- **State on DOM**: Use `data-*` attributes for element state (e.g., `data-state="default"|"open"|"solved"`) and CSS custom properties for dynamic layout values.
- **Custom events**: Use colon-separated names dispatched on `window` (e.g., `game:init`, `game:complete`).
- **Types location**: Types for `@12col/cyberpunk-ui` live in that package; project-specific types stay within the project.

## Cards Project

### Scripts
- `game-init.ts` — Initialization, URL state parsing, card rendering
- `cards.ts` — Click handling, scoring, match detection, keyboard navigation
- `grid-layout.ts` — Responsive grid calculator via ResizeObserver
- `victory-modal.ts` — End game modal and replay
- `dom.ts` — Shared DOM utilities and selector guards

### URL Params
- `?shuffle=false` — Deterministic card order (for testing)
- `?count=8|12|16|24` — Card count
- `?pack=packId` — Card pack selection

### CSS
Reuse existing classes (e.g., `.button`) before creating new styles.
