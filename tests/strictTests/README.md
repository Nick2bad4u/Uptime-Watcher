# Strict Tests (Property-Based & Cross-Cutting)

This directory contains **strict test suites** that focus on
cross-cutting invariants, property-based tests, and higher-level
contracts across the application.

## Scope

- Cross-layer invariants (e.g., encode/decode pairs, sync events).
- Property-based tests using [`fast-check`](https://github.com/dubzzz/fast-check).
- Additional edge-case tests that would be noisy or overly specific if
  colocated with standard unit tests.

Implementation-specific unit tests should continue to live next to their
modules (e.g., `src/**`, `shared/**`, `electron/**`) or under existing
`src/test/**`, `shared/test/**`, and `electron/test/**` folders. Use this
folder when you need **extra guarantees** beyond normal unit coverage.

## Structure

- `src/**` – strict tests targeting renderer-side utilities and
  services.
- `electron/**` – strict tests targeting Electron main-process code.
- `test-utils/**` – shared testing utilities for strict suites
  (fast-check configuration and related support).

## fast-check Utilities

Use the helpers under `test-utils` when you want consistent configuration
for property-based tests:

- `test-utils/fastcheckConfig.ts` – exports:

  - `defaultFastCheckParameters` – shared defaults for `fc.assert`
    (e.g., `numRuns`).
  - `assertProperty(property, overrides?)` – thin wrapper around
    `fc.assert` that merges shared defaults with per-test overrides.

Tests may still import and use `fast-check` directly when they need custom
arbitraries.

## Naming Conventions

- Use `*.property.test.ts` / `*.property.test.tsx` for primary
  property-based test suites.
- Use `*.edge.test.ts` / `*.edge.test.tsx` for focused edge-case
  example tests.
- Test names should describe the invariant or behavior, for
  example:

  - `"decode(encode(x)) returns x for valid payloads"`
  - `"normalizing twice is idempotent for any non-empty string"`

## Determinism and Seeds

When writing property-based tests:

- Prefer deterministic seeds in CI by passing `{ seed, numRuns }` via
  `assertProperty` or `fc.assert`.
- Mock external I/O (timers, HTTP, filesystem) so properties remain
  fast and deterministic.
- Use constrained arbitraries instead of `fc.pre` where possible to
  reduce rejections and shrink counterexamples effectively.
