---
name: test
description: Run tests and fix failures
user-invocable: true
---

# Test Management Skill

Use this skill to run tests and fix failures. Invoke with `/test`.

## Core Principle: Tests Are the Source of Truth

**CRITICAL:** Tests define expected behavior. When tests fail:
1. **Fix the implementation** to match the test expectations
2. **DO NOT modify tests** to match broken implementations

Tests should only be modified when:
- Selectors changed in the actual UI (class names, IDs, data attributes)
- HTML structure legitimately changed as part of a feature
- Test was genuinely incorrect from the start (rare)
- New feature requires new test coverage

## Commands

Run all tests:
```bash
pnpm test:run && pnpm test:e2e
```

Run unit tests only:
```bash
pnpm test:run
```

Run E2E tests only:
```bash
pnpm test:e2e
```

Run E2E tests in headed mode (visible browser):
```bash
pnpm test:e2e --headed
```

Run E2E tests in UI mode (interactive debugger):
```bash
pnpm test:e2e --ui
```

## Workflow for Test Failures

1. **Run the tests** to identify failures
2. **Read the failing test** to understand expected behavior
3. **Investigate the implementation** to find the bug
4. **Fix the implementation** - not the test
5. **Re-run tests** to verify the fix

## When Test Modification Is Required

If a test legitimately needs updating (e.g., selector changed), you MUST:

1. Explain WHY the test needs to change
2. Show what changed in the implementation that necessitates this
3. Get explicit user confirmation before modifying any test file
4. Make minimal changes - only update what's necessary

## Test File Locations

- Unit tests: `src/**/*.test.ts`
- E2E tests: `e2e/*.spec.ts`
- Vitest config: `vitest.config.ts`
- Playwright config: `playwright.config.ts`

## Deterministic Testing

For predictable E2E tests, use `?shuffle=false` URL parameter:
- Cards appear in order: pairs at positions `(i, i + pairCount)`
- Useful for testing game completion scenarios
