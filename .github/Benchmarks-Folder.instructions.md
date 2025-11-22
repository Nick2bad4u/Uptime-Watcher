---
name: "Benchmarks-Folder-Guidelines"
description: "Guidance for performance benchmarks and supporting utilities under benchmarks/."
applyTo: "benchmarks/**"
---

# Benchmarks (benchmarks/) Guidelines

- Purpose and structure:
  - `benchmarks/` is the canonical home for performance experiments covering renderer, Electron, shared utilities, and service layers.
  - Organize new suites under the existing domain directories (e.g., `analytics/`, `ipc/`, `services/`). Co-locate shared helpers in `benchmarks/shared/` to avoid duplication across suites.
  - Keep file names aligned with the code-under-test (for example, `SiteStore.bench.ts` for `src/stores/sites`).
- Benchmark implementation:
  - Use the Vitest bench API (`import { bench, describe } from "vitest"`) for all scenarios. Avoid bespoke harnesses so the npm scripts (`npm run bench`, `npm run bench:watch`, `npm run bench:compare`) remain effective.
  - Prefer `describe` blocks that mirror the production module structure and provide `bench` names that read as behavioral statements ("serialize snapshot", "emit 1k events") so comparison output is self-explanatory.
  - Hoist expensive fixture generation outside the `bench` callback (for example, create test data once per suite) and keep the measured function as small as possible. Use helper factories in `benchmarks/shared/` when setup needs to be reused.
  - When randomness is unavoidable, seed it deterministically (e.g., via `createSeededRandom()` or fixed data arrays) so repeated runs are comparable. Capture random fixtures ahead of the timed section rather than inside the benchmark loop.
  - Measure asynchronous work with `bench.async` and resolve the returned promise. Never block on timers or network calls—mock them, or precompute the data.
  - Annotate each file with TSDoc `@benchmark`/`@category` metadata and inline comments explaining rationale, especially if benchmarks diverge from production behavior.
- Quality expectations:
  - Benchmarks must compile under `tsconfig.json` and respect the same linting rules (`npm run lint:fix`). Use shared domain types from `@shared/*` instead of hardcoding copies.
  - Keep logging disabled (no `console.log`) except for diagnosis guarded behind environment checks. Excess logging skews results.
  - If a benchmark requires new build tooling or data, document the workflow in `docs/Testing/README.md` under the performance section.
- Workflow integration:
  - Record notable regressions or improvements in CHANGELOG entries tied to the affected module.
  - When adding or modifying suites, run `npm run bench` locally and capture baseline numbers (include them in PR descriptions for reviewer context).
  - Ensure CI-friendly runs by keeping per-benchmark iteration counts reasonable; rely on `npm run bench:compare` for deeper local investigations rather than inflating iteration counts in committed code.
