---
name: "Tests-Folder-Guidelines"
description: "Guidance for unit, integration, and strict tests under test folders."
applyTo: "tests/**, src/test/**, shared/test/**, electron/test/**"
---

# Tests (tests/, src/test/, shared/test/, electron/test/) Guidelines

- Treat test folders as **verification only**:
  - Do not introduce new production-only logic here; import from `src/`, `electron/`, or `shared/` instead.
  - Keep tests focused on observable behaviour and public APIs.
- Test styles by area:
  - Use Vitest-based unit and integration tests for React and shared code (see `Vite-FastCheck-Typescript.instructions.md`).
  - Use stricter "branch/behavioural" tests in `tests/strictTests/**` to validate edge cases and invariants.
- Tooling alignment:
  - Run the targeted npm scripts (`npm run test`, `npm run test:electron`, `npm run test:shared`, etc.) locally before committing. For full coverage, run `npm run test:all:coverage`.
- Fast-Check and property tests:
  - Prefer property-based tests for core utilities and critical invariants; keep generators local to the domain under test.
- Structure and naming:
  - Co-locate tests near implementation (`src/foo.ts` → `src/test/foo.test.ts` or `src/foo.test.ts`), or mirror structure under `tests/` where that pattern is already in place.
  - Use descriptive test names and `describe` blocks that reflect the domain concept, not just the filename.
- Isolation and determinism:
  - Avoid hidden global state between tests; use `beforeEach/afterEach` to reset.
  - Make tests deterministic—no unseeded randomness, no real network or filesystem access unless explicitly testing integration layers.
