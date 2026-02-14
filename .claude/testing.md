# Testing

Read this when writing, running, or debugging tests.

## Commands

- `pnpm test` — Unit tests in watch mode
- `pnpm test:run` — Unit tests once
- Use `/test` skill to run tests and handle failures.

## Core Principle: Tests Are the Source of Truth

**CRITICAL:** When tests fail, fix the implementation — NOT the tests.

Tests should only be modified when:
- Selectors changed in the UI (class names, IDs, data attributes)
- HTML structure legitimately changed as part of a feature
- New feature requires new test coverage

## Structure

- **Unit tests** (`src/**/*.test.ts`): Pure functions
- **E2E tests** (`e2e/*.spec.ts`): Browser interactions

## Deterministic E2E

Use `?shuffle=false` URL parameter for predictable card positions in tests.
Cards appear in order with pairs at positions `(i, i + pairCount)`.
