# Projects Guide

This document explains how to create and manage standalone sub-projects in the 12col repository.

## Overview

Each project under `/projects/[name]` is completely standalone with zero shared code. Projects are self-contained experiments, mini-games, infographics, or interactive experiences that all build together via Astro.

## Architecture

### Individual Route Files Pattern

Each project uses its own route file for maximum simplicity and isolation:

```
src/
├── pages/
│   └── projects/
│       ├── sliders.astro      # Route: /projects/sliders
│       └── asteroid.astro     # Route: /projects/asteroid
├── projects/
│   ├── sliders/
│   │   ├── components/
│   │   ├── scripts/
│   │   ├── styles/
│   │   └── assets/
│   └── asteroid/
│       ├── components/
│       ├── scripts/
│       ├── styles/
│       └── assets/
```

## Creating a New Project

### Step 1: Create Project Directory

```bash
mkdir -p src/projects/your-project-name/{components,scripts,styles,assets}
```

### Step 2: Create Route File

Create `src/pages/projects/your-project-name.astro`:

```astro
---
// Route: /projects/your-project-name
import Layout from '../../layouts/Layout.astro';
import YourComponent from '../../projects/your-project-name/components/YourComponent.astro';
import '../../projects/your-project-name/styles/main.css';
---

<Layout>
	<div class="your-project-page">
		<header>
			<a href="/">← Back to Home</a>
			<h1>Your Project Title</h1>
			<p>Your project description</p>
		</header>

		<main>
			<YourComponent />
		</main>
	</div>
</Layout>

<script>
	import '../../projects/your-project-name/scripts/main.ts';
</script>

<style>
	/* Page-level styles */
	.your-project-page {
		min-height: 100vh;
	}
</style>
```

### Step 3: Build Your Project

Create components, scripts, and styles in your project directory:

**Components**: `src/projects/your-project-name/components/`
- Astro components specific to this project
- Each component should be self-contained with scoped styles

**Scripts**: `src/projects/your-project-name/scripts/`
- TypeScript/JavaScript for interactivity
- All logic should be project-specific

**Styles**: `src/projects/your-project-name/styles/`
- CSS files for project-wide styles
- Use scoped styles in components when possible

**Assets**: `src/projects/your-project-name/assets/`
- Images, fonts, icons, etc.
- Processed and optimized by Astro

### Step 4: Test

```bash
pnpm dev
# Visit http://localhost:4321/projects/your-project-name
```

## Code Isolation Rules

**✅ DO:**
- Import only from your own project directory
- Use scoped styles in `.astro` components
- Keep all project code self-contained
- Use namespace/prefix for CSS classes (e.g., `.myproject-button`)

**❌ DON'T:**
- Import from `src/components/` (root components)
- Import from other projects
- Share code between projects
- Use global styles that affect other projects

## Project Structure Example

Here's the complete structure for the "sliders" project:

```
src/projects/sliders/
├── components/
│   ├── SliderControl.astro    # Slider UI controls
│   └── SliderDisplay.astro    # Visual display
├── scripts/
│   └── sliders.ts             # Interactive logic
├── styles/
│   └── sliders.css            # Project styles
└── assets/
    └── (project images)
```

## Adding Project Links

To link to your project from the welcome page, edit `src/components/Welcome.astro`:

```astro
<a href="/projects/your-project-name">Your Project</a>
```

## Using Different Technologies

Each project can use different tech stacks:

### Canvas/WebGL Games
```typescript
// src/projects/asteroid/scripts/game.ts
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
// ... game logic
```

### Interactive Visualizations
```astro
---
// src/projects/data-viz/components/Chart.astro
import * as d3 from 'd3'; // Add to package.json if needed
---
<svg id="chart"></svg>
```

### Static Infographics
```astro
---
// src/projects/infographic/components/Timeline.astro
---
<div class="timeline">
	<!-- Pure HTML/CSS infographic -->
</div>
```

## Installing Project-Specific Dependencies

If a project needs external libraries:

```bash
# Install at root level
pnpm add library-name

# Import in your project
import { thing } from 'library-name';
```

Note: Dependencies are shared at the package level, but imports should only be used within the specific project that needs them.

## Build Process

The build process is simple:

```bash
pnpm build
```

Astro automatically:
- Compiles all routes in `src/pages/projects/*.astro`
- Bundles project-specific scripts and styles
- Optimizes assets
- Outputs to `dist/projects/[name]/index.html`

## Best Practices

1. **Keep Projects Simple**: Each project should focus on one concept or experience
2. **Document Inline**: Add comments explaining complex logic within your project
3. **Test Standalone**: Ensure your project works independently
4. **Optimize Assets**: Compress images and minimize bundle sizes
5. **Mobile-First**: Consider responsive design for each project
6. **Accessibility**: Use semantic HTML and proper ARIA labels

## Examples in This Repository

### Sliders (`/projects/sliders`)
Interactive slider controls with real-time visual feedback. Demonstrates:
- Component composition
- TypeScript interactivity
- Scoped styling
- Real-time updates

## Troubleshooting

**Problem**: Route not found
- Check that route file exists: `src/pages/projects/[name].astro`
- Verify file name matches URL path

**Problem**: Imports not working
- Use correct relative paths: `../../projects/[name]/...`
- Check file extensions (`.astro`, `.ts`, `.css`)

**Problem**: Styles not applied
- Ensure CSS import in route file: `import '../../projects/.../styles/main.css';`
- Use scoped `<style>` tags in components
- Check for CSS specificity conflicts

**Problem**: Scripts not running
- Verify script import in `<script>` tag
- Check browser console for errors
- Ensure DOM elements exist before accessing them

## Questions?

Refer to the main [CLAUDE.md](./CLAUDE.md) for overall project structure and commands.
