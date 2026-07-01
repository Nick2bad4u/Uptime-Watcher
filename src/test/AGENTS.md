# Agents Guide For Renderer Tests

## Scope

This file applies to `src/test/**`, the renderer-side Vitest test suite for
React components, hooks, services, stores, and frontend utilities.

## Renderer Test Standards

- Use Vitest and the helpers already present in `src/test/**`.
- For React UI, prefer Testing Library queries that match user-visible behavior:
  `getByRole`, `getByLabelText`, `getByText`, and `findBy*` where async UI is
  involved.
- Use `userEvent` for realistic interactions. Use `fireEvent` only when the
  lower-level event is the behavior under test or the surrounding file already
  uses it for a reason.
- Import `@testing-library/jest-dom` in tests that use DOM matchers.
- Keep mocks typed with `vi` helpers and local mock factories. Avoid broad
  `as any` casts.
- Reset stores, timers, local storage, and global mocks between tests. Renderer
  tests must not depend on order.

## Application Boundaries

- Mock Electron access through the exposed preload/window API or renderer
  service layer. Do not import Electron main-process modules into renderer
  tests.
- Test Zustand store behavior through public actions and selectors where
  possible.
- For service tests, validate request/response handling and error mapping at
  the renderer service boundary.
- For validation utilities, include malformed input, boundary values, and
  user-facing error cases.

## Property-Based Tests

- Use fast-check for broad input spaces such as URL validation, timeouts,
  monitor field validation, theme merging, IPC payload shapes, and status
  formatting.
- Keep arbitrary generators constrained to valid domain ranges unless the test
  specifically verifies rejection of invalid values.
- When a property exposes a bug, add a focused regression example for the
  minimized failing case.

## Verification

- Run the narrow matching test file first.
- Run `npm run test:frontend` for renderer behavior changes.
- Run `npm run type-check:src` when test utilities, component props, store
  types, or service contracts change.
- Run Playwright tests when a renderer change affects real user flows or
  Electron integration.
