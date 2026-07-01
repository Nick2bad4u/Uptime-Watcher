# Agents Guide For Repository Tests

## Scope

This file applies to `tests/**`. It covers repository-level test utilities,
strict test support, linting plugin tests, and tooling tests. Renderer,
Electron, shared, and Playwright tests have their own local patterns outside
this directory.

## Test Principles

- Write tests against observable behavior, not implementation details, unless
  the file is explicitly a tooling or mutation-coverage test.
- Keep tests deterministic. Avoid time, filesystem, network, random data, and
  process-global state unless they are controlled by test helpers.
- Prefer typed fixtures, builders, and shared arbitraries over repeating large
  object literals.
- Use focused assertions that explain the behavior being protected. Avoid broad
  snapshots for values that can be asserted structurally.
- Keep property-based tests bounded and reproducible. Reuse shared fast-check
  defaults from `tests/strictTests/test-utils` when working in strict tests.

## Repository Test Areas

- `tests/strictTests/` contains strict and property-based support. Use
  `tests/strictTests/test-utils/arbitraries.ts` and
  `tests/strictTests/test-utils/fastcheckConfig.ts` before inventing new
  generators or fast-check parameters.
- `tests/tooling/` contains tests for documentation, scripts, and project
  tooling. Keep these tests independent of generated output unless the test is
  specifically validating a generator.
- `tests/linting/` covers repository linting plugin behavior. Match the helper
  style already used there and keep parser/config setup centralized.

## Vitest And Fast-Check

- Use Vitest APIs from `vitest`; do not mix Jest globals or legacy assertion
  styles into new tests.
- Prefer `@fast-check/vitest` for property tests when local files already use
  it. Otherwise follow the surrounding file's import pattern.
- Always constrain fast-check domains to meaningful values for the behavior
  under test. Do not use huge arbitrary spaces just to increase apparent
  coverage.
- Capture seeds or failing examples when debugging a property failure, then add
  a targeted regression test for the minimized case.

## Filesystem And Process Safety

- Write temporary files only under test-owned temp directories. Clean them up in
  `afterEach` or use helpers that do it automatically.
- Do not read or mutate the developer's real application data directories.
- Mock process environment changes with scoped setup and restore the original
  values in teardown.
- Avoid shelling out from tests unless the behavior being tested is a CLI or
  script boundary.

## Verification

- For changes in this directory, run the narrow matching Vitest command first.
- Broaden to `npm run test:all` or the relevant aggregate test script when
  shared helpers, arbitraries, or tooling behavior changes.
- Run `npm run type-check:test` when test utility types or strict-test helpers
  change.
