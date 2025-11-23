---
schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Zero Coverage Audit Workflow"
summary: "How to use the zero-coverage Vitest helper to identify test files that execute but never touch instrumented source code, and how to triage the results."
created: "2025-11-21"
last_reviewed: "2025-11-17"
category: "guide"
author: "Nick2bad4u"
tags:
  - "testing"
  - "coverage"
  - "vitest"
  - "uptime-watcher"
---

# Zero coverage audit workflow

Older test files occasionally survive refactors and end up exercising no executable code. The `test:zero-coverage` helper runs each Vitest file in isolation with coverage enabled, highlights the ones that never touch instrumented source lines, and leaves the final deletion decision to humans.

## Overview

1. The script enumerates candidate test files via `vitest list --filesOnly --json`, which produces a machine-readable array of paths suitable for automation ([Vitest CLI docs](https://vitest.dev/guide/cli.html#list)).
2. Each file runs through `vitest run <file> --coverage --reporter=json`, and we read the emitted `coverageMap` payload. Vitest v3+ includes the map in the JSON reporter output when coverage is enabled ([Reporter reference](https://vitest.dev/guide/reporters.html#json-reporter)).
3. Any run whose coverage map is empty or whose statement/branch/function/line counts stay at zero is flagged as a likely orphan.

The process is deterministic, serial, and repeatable. It does not mutate your workspace beyond generating coverage artifacts.

## Usage

```bash
# Default audit using config/testing/vitest.zero-coverage.config.ts
npm run test:zero-coverage

# Inspect files without executing them (useful for sanity-checking filters)
npm run test:zero-coverage -- --dry-run

# Target a different Vitest config (for example, shared module or Electron)
npm run test:zero-coverage -- --config vitest.shared.config.ts

# Focus on a subset of files (regex applied to absolute paths)
npm run test:zero-coverage -- --pattern apps/core/ --max-files 10

# Persist JSON reports to coverage/zero-coverage-reports for inspection
npm run test:zero-coverage -- --keep-reports
```

The dedicated zero-coverage Vitest configuration now writes to isolated cache directories (rooted at `.cache/vite-zero-coverage`, with Vitest artifacts under its `vitest/` subfolder) so `--dry-run` and regular runs stay responsive even when the main dev server holds the default cache on Windows.

You can also pass explicit file paths instead of relying on discovery:

```bash
npm run test:zero-coverage -- src/features/foo/foo.test.tsx src/utils/bar.test.ts
```

## Output

Each executed file prints its relative path and a short status:

```text
Analyzing src/features/core/foo.test.tsx... 128 statements covered
Analyzing src/utils/archive/obsolete.test.ts... no coverage
```

The summary section provides totals plus a ranked list of the top coverage-producing specs, which is handy when verifying that the run behaved as expected.

## Triage guidelines

- Double-check zero-coverage candidates before removal; repeated failures indicate that helpers or mocks stub out the interesting parts.
- If a file intentionally asserts runtime behavior without hitting instrumented code (for example, type-only tests), consider removing it or moving the assertions into a smoke test that does execute logic.
- Keep the generated JSON reports (`--keep-reports`) when you want to diff coverage maps or inspect the raw Istanbul data.

## Fast-check considerations

Fast-check based fuzzers often rely on helper utilities and still touch application code. If a fuzz test lands in the zero-coverage list, ensure that any property functions still import the modules they were meant to exercise.

## When to rerun

- After large refactors to ensure obsolete tests are cleaned up promptly.
- Before pruning the test suite to verify that removal candidates truly provide no coverage.
- On branches that introduce major module moves to catch tests that no longer import the correct entry points.
