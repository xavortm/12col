# Plan: Viewport-Fitted Card Grid

## Goal

The card grid must **always fill and fit the viewport exactly** — no scrollbar, no wasted space. The cards scale dynamically based on viewport dimensions, card count, and the presence of the header/footer. The aspect ratio of cards may be adjusted to achieve a perfect fit.

---

## Current State

### Layout Structure (top → bottom)

```
<html> / <body>             → 100% height (set in Layout.astro)
  <div.site-container>      → ❌ No height constraint, no flex layout
    <header.site-header>    → Intrinsic height (~80–100px, two rows)
    <div.site-container__main>
      <main>
        <Container>         → Max-width wrapper (--site-width: 87.5rem, centered)
          <div.controls>    → Currently empty
          <CardGrid>        → flex: 1 on .cards-grid, but parent isn't flex
    <footer.site-footer>    → Intrinsic height (~40–50px)
```

### Current Grid Logic (`grid-layout.ts`)

- Uses `ResizeObserver` on `.cards-grid` to recalculate columns.
- `calculateOptimalColumns()` iterates divisible column counts and picks the first one where total grid height ≤ container height.
- Card height is derived from width via `--card-aspect-ratio`.
- Gap is hardcoded at `16px` (1rem).
- Sets `--cards-per-row` CSS variable; CSS uses `grid-template-columns: repeat(var(--cards-per-row), 1fr)`.
- `align-content: start` — grid does **not** stretch to fill vertical space.

### Problems

1. **`.site-container` has no flex/height layout** — `.cards-grid`'s `flex: 1` has no effect because the parent isn't a flex container with a constrained height. The grid doesn't know how tall it's allowed to be.
2. **Container wrapper imposes max-width** but no height pass-through.
3. **Gap is 2rem in CSS** (`cards.astro`) but **1rem (16px) in JS** — mismatch.
4. **`align-content: start`** — cards pile up at the top instead of centering/stretching vertically.
5. **No vertical centering** — when cards are smaller than the available space, there's dead space at the bottom.
6. **No mobile gap adjustment** — gap stays 2rem at all sizes.

---

## Design

### Principle

The entire page is a **vertical flex column** stretching exactly `100dvh`. Header and footer take their intrinsic size. The remaining space belongs to the card grid. The JS algorithm calculates the optimal column count **and** overrides the aspect ratio so cards fill the space completely.

### Layout Chain (CSS)

Every element from `<body>` down to `.cards-grid` must participate in a flex column that passes remaining height downward:

```
body
  └─ .site-container          → display: flex; flex-direction: column; height: 100dvh
       ├─ header.site-header   → flex: 0 0 auto  (intrinsic)
       ├─ .site-container__main → flex: 1 1 0; min-height: 0; display: flex
       │    └─ main             → flex: 1; display: flex; min-height: 0
       │         └─ .container  → flex: 1; display: flex; flex-direction: column; min-height: 0
       │              ├─ .controls → flex: 0 0 auto (intrinsic, currently empty)
       │              └─ .cards-grid → flex: 1; min-height: 0
       │                   └─ .cards-grid__inner → grid, height: 100%
       └─ footer.site-footer   → flex: 0 0 auto  (intrinsic)
```

Key details:

- `100dvh` (dynamic viewport height) avoids mobile address-bar issues.
- `min-height: 0` on every flex child prevents flex items from overflowing due to content sizing.
- The `Container` component already sets `inline-size: min(...)` and `margin-inline: auto`, which is fine — it just also needs to flex-grow and pass height down.
- `overflow: hidden` on `.site-container` as a safety net to guarantee zero scrollbar.

### Grid Algorithm (JS) — Enhanced `grid-layout.ts`

The current `calculateOptimalColumns()` already does the right thing directionally. The enhancements:

#### 1. Fix the gap mismatch

Read the gap value from CSS at runtime instead of hardcoding:

```ts
const computedGap = parseFloat(getComputedStyle(grid).gap) || 16;
```

This way, when CSS changes the gap (e.g., on mobile), JS automatically picks it up.

#### 2. Compute optimal columns + adjusted aspect ratio

The current algorithm finds the first column count where cards fit. But it only checks perfect divisors, and cards may not fill the height. We need to:

a. **Allow non-divisor column counts** — accept layouts with an incomplete last row. The card count options (8, 12, 16, 24) have many divisors, but we should still consider all reasonable column counts.

b. **After choosing columns, adjust the aspect ratio** so the grid fills the vertical space exactly:

```ts
function calculateFittedLayout(
    containerWidth: number,
    containerHeight: number,
    cardCount: number,
    baseAspectRatio: number,
    gapPx: number
): { columns: number; adjustedAspectRatio: number }
```

Algorithm:

```
for each candidate column count (from smallest to largest):
    rows = ceil(cardCount / columns)
    cardWidth = (containerWidth - gap * (columns - 1)) / columns
    cardHeight = (containerHeight - gap * (rows - 1)) / rows

    // The aspect ratio this layout would need:
    neededAR = cardWidth / cardHeight

    // Accept if the needed AR is within a reasonable tolerance of the base AR
    // (e.g., 0.5 ≤ neededAR / baseAR ≤ 2.0)
    // Among valid layouts, pick the one where neededAR is closest to baseAR
```

The key insight: **we size cards to perfectly fill both axes**, which means the aspect ratio becomes a dependent variable, not an input.

However, we should constrain how far the aspect ratio can deviate from the pack's natural ratio. Cards stretched too much horizontally or vertically look bad.

**Tolerance bounds:**

- Minimum aspect ratio: `baseAR * 0.55` (cards can be ~45% taller than natural)
- Maximum aspect ratio: `baseAR * 1.8` (cards can be ~80% wider than natural)

This keeps cards recognizable while allowing enough flex to fill screens from ultrawide to portrait mobile.

#### 3. Scoring candidates

For each valid column count, compute a score:

```ts
// How far is the needed AR from the base AR? Lower is better.
const arDeviation = Math.abs(Math.log(neededAR / baseAR));

// Prefer layouts with complete rows (no orphans)
const orphanPenalty = (cardCount % columns === 0) ? 0 : 0.1;

const score = arDeviation + orphanPenalty;
```

Pick the column count with the lowest score. This balances visual fidelity with clean grids.

#### 4. Apply results

```ts
grid.style.setProperty('--cards-per-row', String(columns));
grid.style.setProperty('--card-aspect-ratio', String(adjustedAspectRatio));
```

The CSS will use these:

```css
.cards-grid__inner {
    grid-template-columns: repeat(var(--cards-per-row), 1fr);
    /* Card .inner already uses aspect-ratio: var(--card-aspect-ratio, 1) */
}
```

#### 5. Vertical alignment

Change `align-content: start` → `align-content: center` on `.cards-grid__inner`. This vertically centers the grid when there's any sub-pixel rounding error. The algorithm should produce near-zero dead space, but centering any remainder looks better than top-aligning.

Alternatively, `place-content: center` could work but we already have the template columns set, so `align-content: center` with the existing column template is cleaner.

### Responsive Gap

Use CSS custom property with a media query:

```css
.cards-grid__inner {
    --grid-gap: 1rem;
    gap: var(--grid-gap);
}

@media (min-width: 768px) {
    .cards-grid__inner {
        --grid-gap: 1.25rem;
    }
}

@media (min-width: 1200px) {
    .cards-grid__inner {
        --grid-gap: 2rem;
    }
}
```

JS reads the computed value at runtime, so no hardcoded sync needed.

### Mobile Considerations

On small screens (< 768px):

- Smaller gap (1rem vs 2rem) gives cards more room.
- The algorithm will naturally pick fewer columns (e.g., 3–4 columns for 24 cards on a phone in portrait).
- In landscape mobile, more columns with shorter cards.
- `100dvh` correctly accounts for the mobile browser chrome.

### Ideal Card Counts by Viewport

The default count of **24** works well because it has many divisors: 1, 2, 3, 4, 6, 8, 12, 24. This gives the algorithm many clean grid configurations:

| Viewport | Likely Layout (24 cards) | Columns × Rows |
|----------|--------------------------|-----------------|
| Desktop (landscape, ≥1200px) | 6×4 or 8×3 | depends on aspect ratio |
| Tablet landscape | 6×4 | 6 cols |
| Tablet portrait | 4×6 | 4 cols |
| Mobile landscape | 6×4 or 4×6 | depends on height |
| Mobile portrait | 4×6 or 3×8 | 3–4 cols |

**Recommendation:** Keep **24 as default**. It's the sweet spot — enough pairs for a challenge, and the divisor-rich count ensures clean grids across viewports. The other valid counts:
- **8** (2×4, 4×2): Good for quick games, very large cards.
- **12** (3×4, 4×3, 6×2): Medium game.
- **16** (4×4, 8×2): The 4×4 square is classic.

Consider adding **20** (4×5, 5×4) to the valid counts — it fills screens well and has clean grid options.

---

## File Changes

### 1. `src/pages/projects/cards.astro`

Add styles for `.site-container` and `.site-container__main` to create the full-height flex layout:

```css
.site-container {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    overflow: hidden;
}

.site-container__main {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
}
```

Also ensure `<main>` is a flex child that stretches:

```css
main {
    flex: 1;
    display: flex;
    min-height: 0;
}
```

### 2. `src/projects/main/components/Container.astro`

The `.container` needs to participate in flex layout when inside the cards page. The cleanest approach is to make `.container` always able to flex-grow when its parent is a flex container (it already has `inline-size` set, so we just add):

```css
.container {
    /* existing */
    inline-size: min(calc(100% - var(--site-gutter, 2rem)), var(--site-width, 1200px));
    margin-inline: auto;
    /* new: allow flex growth when parent is flex */
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}
```

**Risk:** This component is shared across pages. Adding `flex: 1` and `display: flex` could affect other pages. Two mitigations:

- **Option A (preferred):** Scope via a CSS class on `cards.astro`'s usage: `.site-container__main .container { ... }`. Do this in the `cards.astro` page styles.
- **Option B:** Add these properties directly in `Container.astro` — since it's a simple wrapper, `display: flex; flex-direction: column` is reasonable as a default (its children already work whether the parent is flow or flex).

**Decision: Option A** — scope it in cards.astro to avoid side effects:

```css
/* In cards.astro <style> */
.site-container__main .container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}
```

### 3. `src/projects/cards/components/cards.astro`

Update the `.cards-grid__inner` styles:

```css
.cards-grid__inner {
    --card-flip-duration: 800ms;
    --cards-per-row: 4;
    --grid-gap: 1rem;

    display: grid;
    gap: var(--grid-gap);
    grid-template-columns: repeat(var(--cards-per-row), 1fr);
    height: 100%;
    align-content: center;
}

@media (min-width: 768px) {
    .cards-grid__inner {
        --grid-gap: 1.25rem;
    }
}

@media (min-width: 1200px) {
    .cards-grid__inner {
        --grid-gap: 2rem;
    }
}
```

### 4. `src/projects/cards/scripts/grid-layout.ts`

Major refactor of the algorithm:

```ts
export interface FittedLayout {
    columns: number;
    adjustedAspectRatio: number;
}

export function calculateFittedLayout(
    containerWidth: number,
    containerHeight: number,
    cardCount: number,
    baseAspectRatio: number,
    gapPx: number,
): FittedLayout {
    if (cardCount === 0) return { columns: 1, adjustedAspectRatio: baseAspectRatio };

    const minAR = baseAspectRatio * 0.55;
    const maxAR = baseAspectRatio * 1.8;

    let bestScore = Infinity;
    let bestLayout: FittedLayout = { columns: 1, adjustedAspectRatio: baseAspectRatio };

    for (let cols = 1; cols <= cardCount; cols++) {
        const rows = Math.ceil(cardCount / cols);

        const cardWidth = (containerWidth - gapPx * (cols - 1)) / cols;
        const cardHeight = (containerHeight - gapPx * (rows - 1)) / rows;

        if (cardWidth <= 0 || cardHeight <= 0) continue;

        const neededAR = cardWidth / cardHeight;

        if (neededAR < minAR || neededAR > maxAR) continue;

        const arDeviation = Math.abs(Math.log(neededAR / baseAspectRatio));
        const orphanPenalty = (cardCount % cols === 0) ? 0 : 0.15;

        const score = arDeviation + orphanPenalty;

        if (score < bestScore) {
            bestScore = score;
            bestLayout = { columns: cols, adjustedAspectRatio: neededAR };
        }
    }

    return bestLayout;
}
```

Update `updateGridLayout()`:

```ts
function updateGridLayout(): void {
    if (!container || !grid) return;

    const cardCount = Array.from(grid.children).filter(
        (child) => !child.classList.contains("is-hidden"),
    ).length;
    if (cardCount === 0) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Read base aspect ratio from CSS variable (set by game-init based on pack)
    const aspectRatioVar = grid.style.getPropertyValue("--card-aspect-ratio");
    const baseAspectRatio = aspectRatioVar
        ? Number.parseFloat(aspectRatioVar)
        : 1;

    // Read gap from computed styles (responsive via CSS)
    const computedGap = parseFloat(getComputedStyle(grid).rowGap) || 16;

    const { columns, adjustedAspectRatio } = calculateFittedLayout(
        rect.width,
        rect.height,
        cardCount,
        baseAspectRatio,
        computedGap,
    );

    grid.style.setProperty("--cards-per-row", String(columns));
    grid.style.setProperty("--card-aspect-ratio", String(adjustedAspectRatio));
}
```

**Important:** `game-init.ts` currently sets `--card-aspect-ratio` to the pack's base ratio on every re-render. That's fine — it sets the base value, then `grid-layout.ts` overrides it after the ResizeObserver fires. But we should store the base aspect ratio separately to avoid overwriting the pack's value permanently:

- Store the base aspect ratio on a `data-` attribute instead: `grid.dataset.baseAspectRatio = String(pack.aspectRatio)`.
- In `grid-layout.ts`, read from `grid.dataset.baseAspectRatio`.
- `--card-aspect-ratio` becomes purely the *computed/adjusted* value set by grid-layout.

### 5. `src/projects/cards/scripts/game-init.ts`

Change the aspect ratio storage from CSS variable to data attribute:

```ts
// Before:
grid.style.setProperty("--card-aspect-ratio", String(pack.aspectRatio));

// After:
grid.dataset.baseAspectRatio = String(pack.aspectRatio);
```

### 6. `src/projects/cards/scripts/grid-layout.ts` — Read base AR from data attribute

```ts
const baseAspectRatio = Number.parseFloat(grid.dataset.baseAspectRatio || "1");
```

---

## Edge Cases

### Very few cards (e.g., 8)

With 8 cards, the best layout is likely 4×2 or 2×4. On a landscape screen, 4×2 works perfectly — cards will be quite large. The algorithm handles this naturally.

### Portrait mobile with 24 cards

24 = 3×8 or 4×6. On a 390×844 phone (iPhone 14), with ~120px for header+footer, available area is ~390×724. With 3rem total gutters:

- 4 columns: cardWidth ≈ (390 - 48 - 3*16) / 4 ≈ 73px, 6 rows: cardHeight ≈ (724 - 5*16) / 6 ≈ 107px → AR ≈ 0.68
- 3 columns: cardWidth ≈ (390 - 48 - 2*16) / 3 ≈ 103px, 8 rows: cardHeight ≈ (724 - 7*16) / 8 ≈ 76px → AR ≈ 1.35

For shapes (base AR = 1): 3×8 gives AR 1.35 (deviation 0.30), 4×6 gives AR 0.68 (deviation 0.39). Algorithm picks 3×8. Both are plausible; 4×6 with slightly taller cards might look nicer depending on preference. The scoring handles this correctly — both are within tolerance.

### Ultrawide monitors

On a 3440×1440 display, the `--site-width: 87.5rem` (1400px) container max-width constrains the grid width. With 24 cards at 1400px wide: 8×3 or 6×4 will likely win. Cards will be generously sized.

### Window resize

`ResizeObserver` on `.cards-grid` fires on resize, recalculating everything. The transition on `.inner` (for card flip) won't interfere since we're only changing CSS variables and grid columns.

---

## Testing Notes

### Unit Tests (`grid-layout.ts`)

Update or add tests for the new `calculateFittedLayout()` function:

- **Perfect fit:** Given exact dimensions, returns expected columns and AR.
- **Tolerance bounds:** AR deviation outside bounds returns fallback.
- **24 cards, landscape container:** Expect 6 or 8 columns.
- **24 cards, portrait container:** Expect 3 or 4 columns.
- **8 cards, square container:** Expect 4×2 or 2×4.
- **Orphan penalty:** When 24 cards with 5 columns (non-divisor), score is higher than 6 columns.

### E2E Tests

- Verify no scrollbar appears at any card count (8, 12, 16, 24).
- Verify cards are visible and clickable.
- `?shuffle=false` determinism still works.
- Check on mobile viewport (Playwright `viewport` config).

---

## Sequence of Implementation

1. **CSS layout chain** — Set up the flex column from `.site-container` down to `.cards-grid`. This alone will make `.cards-grid` know its true available height.
2. **Responsive gap** — Update gap CSS with responsive breakpoints, remove hardcoded JS gap.
3. **Base AR on data attribute** — Change `game-init.ts` to store on `data-base-aspect-ratio`.
4. **New algorithm** — Replace `calculateOptimalColumns` with `calculateFittedLayout` in `grid-layout.ts`.
5. **Vertical centering** — Change `align-content` to `center`.
6. **Test & tune** — Adjust AR tolerance bounds and orphan penalty weight based on visual testing across viewports.

---

## Summary

| What | Before | After |
|------|--------|-------|
| Page height | Uncontrolled (scrollbar possible) | Exactly `100dvh`, no scrollbar |
| Grid sizing | Fits width, ignores overflow | Fills both axes perfectly |
| Aspect ratio | Fixed per pack | Adjusted within tolerance per viewport |
| Gap | 2rem CSS / 16px JS (mismatch) | Responsive CSS variable, read by JS |
| Vertical alignment | `start` (dead space at bottom) | `center` (balanced) |
| Mobile | Same gap, same logic | Smaller gap, same algorithm adapts |
