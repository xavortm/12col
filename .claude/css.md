# CSS Conventions

Read this when writing or modifying styles.

## Cascade Layers

Projects can organize CSS using cascade layers for predictable specificity:

```css
@layer normalize, base, layout;

@import url('./vendor/normalize.css');
@import url('./base/colors.css');
@import url('./base/core-styles.css');
@import url('./layout/main.css');
```

This ensures predictable cascade order, prevents specificity conflicts, and
keeps vendor code separate from custom code.

## Naming Conventions

Use logical properties terminology for directional class names:
- `__start` / `__end` instead of `__left` / `__right`
- `__block-start` / `__block-end` instead of `__top` / `__bottom`

This aligns with CSS logical properties and supports RTL layouts.
