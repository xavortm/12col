# cyber-progress

Lit web component that renders a decorative progress bar with diagonal tick
marks.

Source: `cyber-progress.ts`

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `progress` | `number` | `0` | Fill percentage (`0`–`100`, clamped) |
| `direction` | `"left" \| "right"` | `"left"` | Side the bar fills from |

## CSS Custom Properties

All properties are optional. Private `--_` tokens resolve internally.

| Property | Default | What it controls |
|----------|---------|-----------------|
| `--cyber-progress-stroke` | `var(--cyber-stroke, #6c757d)` | Border color |
| `--cyber-progress-fill` | `var(--cyber-text, #0ff)` | Fill bar color |
| `--cyber-progress-height` | `10px` | Outer height (border-box) |
| `--cyber-progress-inset` | `3px` | Spacing between border and track |

## Internal Structure

- Host: `display: block`, positioned, with a 1px solid border.
- `.track` — absolutely positioned container inset from the border.
- `.fill` — the colored bar, sized by `inline-size` as a percentage of the
  track. Direction controls which inline side is released (`auto`).
- `.ticks` — full-track overlay with a repeating diagonal SVG pattern.

## Usage

```html
<!-- basic (fills from left) -->
<cyber-progress progress="60"></cyber-progress>

<!-- fills from the right, custom width -->
<cyber-progress progress="40" direction="right"
  style="inline-size: 218px;">
</cyber-progress>

<!-- custom colors and height -->
<cyber-progress progress="75"
  style="--cyber-progress-fill: #f0f; --cyber-progress-stroke: #333; --cyber-progress-height: 14px;">
</cyber-progress>
```
