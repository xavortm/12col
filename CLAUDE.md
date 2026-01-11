# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro static site project using pnpm as the package manager. The project follows Astro's standard structure with components, layouts, and pages.

This project is a "welcome" starter page on / that links to sub-projects under /projects/[project-name]/.

- Each sub-project is standalone - it shares almost no code with the main site. 
- Each sub-project acts as an experiment, as an infographic or just a fun mini game that works on it's own. 
- The Astro project as a whole only bundles the code in one deployable project.

## Commands

All commands should be run from the project root:

- `pnpm install` - Install dependencies
- `pnpm dev` - Start development server at `localhost:4321`
- `pnpm build` - Build production site to `./dist/`
- `pnpm preview` - Preview production build locally
- `pnpm astro ...` - Run Astro CLI commands (e.g., `pnpm astro add`, `pnpm astro check`)

## Architecture

### Project Structure

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── astro.svg
│   ├── components/
│   │   └── Welcome.astro
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   ├── index.astro              # Welcome page
│   │   └── projects/
│   │       └── [name].astro         # Individual project routes
│   └── projects/                    # 👈 Standalone projects
│       └── [name]/
│           ├── components/          # Project-specific components
│           ├── scripts/             # TypeScript/JavaScript
│           ├── styles/              # CSS files
│           └── assets/              # Images, fonts, etc.
├── PROJECTS.md                      # Guide for creating projects
├── CLAUDE.md                        # Project instructions
└── package.json
```

### Astro Component Format

Astro components use the `.astro` extension with a structure of:
1. Frontmatter (TypeScript/JavaScript between `---` fences)
2. HTML template with component slots
3. Optional scoped `<style>` tags

### TypeScript Configuration

The project uses Astro's strict TypeScript configuration (`astro/tsconfigs/strict`). Type definitions are auto-generated in `.astro/types.d.ts`.

Any generated JS code must be good typescript code - types, structs, generics, anything needed to make it robust.
Any repeated or reusable types can be shared across files in a project, but rarely or never between separate projects.

### Routing

Astro uses file-based routing where files in `src/pages/` map directly to routes:
- `src/pages/index.astro` → `/`
- `src/pages/about.astro` → `/about`
- `src/pages/projects/[slug].astro` → `/projects/:slug` (dynamic routes)

### Shared Layout Pattern

The `src/layouts/Layout.astro` file provides minimal shared infrastructure:
- HTML boilerplate (doctype, html, head, body)
- Common meta tags (charset, viewport, favicon, generator)
- Title prop
- Minimal global CSS resets

**What NOT to include in shared layout:**
- Project-specific components (headers, footers, navigation)
- Project-specific styles
- Any visual or structural elements

Projects import the shared layout and build their own structure inside:
```astro
import Layout from '../../layouts/Layout.astro';
import MyHeader from '../../projects/myproject/components/MyHeader.astro';

<Layout title="My Project">
  <MyHeader />
  <main>...</main>
</Layout>
```

This ensures projects remain isolated while sharing only essential HTML structure.

### CSS Architecture

Projects can organize CSS using cascade layers for predictable specificity:

```css
@layer normalize, base, layout;

@import url('./vendor/normalize.css');   /* Third-party resets */
@import url('./base/colors.css');        /* Design tokens */
@import url('./base/core-styles.css');   /* Base styles */
@import url('./layout/main.css');        /* Layout styles */
```

This pattern:
- Ensures predictable cascade order
- Prevents specificity conflicts
- Makes it clear what each CSS file's purpose is
- Keeps vendor code separate from custom code

### Packages and libraries

Since each project is standalone, we don't worry on compounding packages. Like React and Vue can work together if they are in different /projects/[project]/ folder easily. But there are some goals:

- Do not use a package unless it's really needed.
- Add npm packages carefully, only if they are truly beneficial.
- Approach any problem with native solution first - browser APIs
- A11y is a hard requirement, so never use a package that has bad accessibility.
- We try to serve as little JS as possible and keep pages lightweight.
