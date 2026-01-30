# Cards Project Context

## Scripts
- `game-init.ts` - Initialization, URL state, card rendering
- `cards.ts` - Click handling, score, match detection
- `clock.ts` - Timer
- `victory-modal.ts` - End game modal

## Events
- `game:init` - Reset game state
- `game:complete` - Game won (detail: {score})

## URL Params
- `?shuffle=false` - Deterministic card order
- `?count=8|12|16|24` - Card count
- `?pack=packId` - Card pack

## Testing
- E2E: `e2e/cards.spec.ts`
- Use `?shuffle=false` for predictable tests
- Pairs at positions (i, i + pairCount)

## CSS
When you add a button, just use .button class or it's variations.
If you need a new component like it, follow the same pattern to reuse.
Do not create new styles unless they don't exist already in another component which can be reused.
