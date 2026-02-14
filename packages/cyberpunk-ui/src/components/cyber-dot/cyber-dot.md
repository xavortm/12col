# cyber-dot

Lit web component that renders a row of glowing circular dots.

Source: `cyber-dot.ts`

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `count` | `number` | `1` | Number of dots to render (clamped to non-negative integer) |
| `size` | `"small" \| "default" \| "large"` | `"default"` | Dot diameter — small `0.3em`, default `0.5em`, large `0.75em` |
| `animate` | `"pulse" \| "wave" \| "heartbeat"` | none | Animation mode (omit to disable) |

## Animation Modes

- **pulse** — all dots fade in/out together.
- **wave** — dots fade and scale with staggered delays (supports up to 5 dots
  natively; extra dots share the last delay).
- **heartbeat** — each dot has a `::after` pseudo-element ring that scales
  outward and fades to transparent.

All animations are disabled when `prefers-reduced-motion: reduce` is active.

## CSS Custom Properties

All properties are optional. Private `--_` tokens resolve internally.

| Property | Default | What it controls |
|----------|---------|-----------------|
| `--cyber-dot-color` | `var(--cyber-text, #0ff)` | Dot fill and heartbeat ring border |
| `--cyber-dot-glow` | `var(--cyber-glow, rgba(0,255,255,0.6))` | Box-shadow glow |
| `--cyber-dot-gap` | `0.4em` | Spacing between dots |
| `--cyber-dot-duration` | `1.5s` | Animation duration (all modes) |
| `--cyber-dot-wave-delay` | `0.15s` | Per-dot stagger in wave mode (nth-child uses `calc(delay * n)`) |
| `--cyber-dot-heartbeat-scale` | `2.8` | Max scale of heartbeat ring |

## Internal Structure

- Host: `display: inline-flex` with gap.
- Each dot is a `<span>` with border-radius 50%.
- Heartbeat mode adds `position: relative` to spans and uses `::after` for
  the ring.
- Size variants use `:host([size="…"]) span` selectors.
- Animation variants use `:host([animate="…"]) span` selectors.

## Usage

```html
<!-- basic -->
<cyber-dot></cyber-dot>

<!-- multiple dots, wave animation -->
<cyber-dot count="5" animate="wave"></cyber-dot>

<!-- large heartbeat with custom speed -->
<cyber-dot count="2" size="large" animate="heartbeat"
  style="--cyber-dot-duration: 2.5s;">
</cyber-dot>

<!-- custom color -->
<cyber-dot count="3"
  style="--cyber-dot-color: #f0f; --cyber-dot-glow: rgba(255,0,255,0.6);">
</cyber-dot>
```
