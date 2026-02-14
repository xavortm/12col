# Architecture

Read this when creating projects, modifying project structure, adding
routes, or working with layouts and components.

## Project Structure

```
/
├── packages/
│   └── cyberpunk-ui/                # Shared component & token library
│       ├── src/
│       │   ├── components/          # Lit web components
│       │   └── styles/              # Design tokens (CSS custom properties)
│       └── package.json             # @12col/cyberpunk-ui
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro              # Welcome page
│   │   └── projects/
│   │       └── [name].astro         # Individual project routes
│   └── projects/                    # Sub-projects
│       └── [name]/
│           ├── components/          # Project-specific components
│           ├── scripts/             # TypeScript/JavaScript
│           ├── styles/              # CSS files
│           └── assets/              # Images, fonts, etc.
├── pnpm-workspace.yaml              # Workspace config (packages/*)
└── package.json
```

## Astro Component Format

Astro components use the `.astro` extension:
1. Frontmatter (TypeScript/JavaScript between `---` fences)
2. HTML template with component slots
3. Optional scoped `<style>` tags

## TypeScript

Strict config via `astro/tsconfigs/strict`. Types auto-generated in
`.astro/types.d.ts`.

All generated JS must be proper TypeScript — types, structs, generics. Types
belonging to `@12col/cyberpunk-ui` live in that package; project-specific types
stay within the project.

## Routing

File-based routing — files in `src/pages/` map directly to routes:
- `src/pages/index.astro` → `/`
- `src/pages/projects/[slug].astro` → `/projects/:slug`

## Shared Layout

`src/layouts/Layout.astro` provides minimal shared infrastructure: HTML
boilerplate, meta tags, title prop, and global CSS resets.

**Do NOT include** in the shared layout: project-specific components, styles,
or visual elements.

Projects import the layout and build their own structure inside:
```astro
import Layout from '../../layouts/Layout.astro';
import MyHeader from '../../projects/myproject/components/MyHeader.astro';

<Layout title="My Project"> <MyHeader /> <main>...</main> </Layout>
```

## Packages and Libraries

`@12col/cyberpunk-ui` is the default shared dependency. Import components via
`@12col/cyberpunk-ui/components/*` and tokens via
`@12col/cyberpunk-ui/styles/*`. Theme through CSS custom properties rather than
forking.

Projects can still pull in their own dependencies. Goals:
- Do not use a package unless it's really needed.
- Native browser APIs first.
- A11y is a hard requirement.
- Serve as little JS as possible.
