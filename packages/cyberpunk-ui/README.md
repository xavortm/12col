# @12col/cyberpunk-ui

Cyberpunk-themed web component library built with [Lit](https://lit.dev). Ships as TypeScript source — Astro's Vite bundler handles transpilation.

## Usage

Import a component's side-effect module in a `<script>` tag:

```astro
<cyber-dot count="3"></cyber-dot>

<script>
  import '@12col/cyberpunk-ui/components/cyber-dot';
</script>
```

Optionally import design tokens for consistent theming:

```css
@import '@12col/cyberpunk-ui/styles/tokens';
```

## Components

Each component lives in its own folder under `src/components/` with a co-located `.md` file documenting attributes, custom properties, and usage.

## Design Tokens

All components use CSS custom properties with built-in fallbacks. Override them to theme components without touching internals:

```css
--cyber-text           /* Text color (#0ff) */
--cyber-text-hover     /* Text hover color (#fff) */
--cyber-bg             /* Background (transparent) */
--cyber-bg-hover       /* Background on hover */
--cyber-border         /* Border color (#0ff) */
--cyber-border-hover   /* Border hover color (#fff) */
--cyber-glow           /* Glow color for box-shadow */
--cyber-glow-hover     /* Glow color on hover */
--cyber-dot-color      /* Dot fill color (falls back to --cyber-text) */
--cyber-dot-glow       /* Dot glow color (falls back to --cyber-glow) */
--cyber-font           /* Font family */
--cyber-radius         /* Border radius (2px) */
--cyber-transition     /* Transition duration (150ms ease) */
```

## Development

This package lives in the pnpm workspace. No separate build step — source is resolved directly by Vite. Run from the repo root:

```sh
pnpm build        # Verify it compiles
pnpm format       # Format with Biome
pnpm test:run     # Run unit tests
```
