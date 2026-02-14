# cyber-text

Lit web component that renders decorative uppercase text in a cyberpunk style.

Source: `cyber-text.ts`

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `size` | `"small" \| "default" \| "large"` | `"default"` | Text size — small `8px`, default `10px`, large `12px` |
| `variant` | `"default" \| "vivid"` | `"default"` | Color variant — default is muted gray (`#6c757d`), vivid is bright (`#d9d9d9`) |

## CSS Custom Properties

All properties are optional. Private `--_` tokens resolve internally.

| Property | Default | What it controls |
|----------|---------|-----------------|
| `--cyber-text-color` | `#6c757d` (default) / `#d9d9d9` (vivid) | Text color (overrides variant when set) |
| `--cyber-text-font` | `var(--cyber-font, "Courier New", Courier, monospace)` | Font family |
| `--cyber-text-weight` | `600` | Font weight |
| `--cyber-text-tracking` | `0.05em` | Letter spacing |
| `--cyber-text-size` | `10px` | Font size (overrides size attribute when set) |

## Internal Structure

- Host: `display: inline` with uppercase text-transform.
- Uses `<slot>` for content projection.
- Size variants use `:host([size="…"])` selectors to set `--_size`.
- Color variants use `:host([variant="…"])` selectors to set `--_color`.

## Usage

```html
<!-- basic (muted gray) -->
<cyber-text>Status: Online</cyber-text>

<!-- vivid (bright, more visible) -->
<cyber-text variant="vivid">Grid Mode: 12-Column</cyber-text>

<!-- small decorative label -->
<cyber-text size="small">System Load: Nominal</cyber-text>

<!-- custom color -->
<cyber-text style="--cyber-text-color: #f0f;">Warning</cyber-text>
```
