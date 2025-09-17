# Fast-Check Fuzzing Coverage Guide

This guide explains how to run our property-based tests powered by fast-check and how to interpret coverage for the fuzzing suites.

## What this does and does not do

- Does: run all tests tagged or named for fuzzing/property-based testing using the Vitest runners already configured in this repo (frontend, electron, shared)
- Does not: guarantee statement/branch coverage = 100% (that’s driven by instrumentation). “100% fast-check fuzzing coverage” means: all fuzzing suites execute and reach their assertions with configured case counts and seeds.

## Where fuzzing tests live

You’ll find fuzzing/property tests across:

- src/test/utils/\*.property.test.ts (and related comprehensive-fuzzing.test.ts)
- src/test/stores/\*\*/input-fuzzing.test.ts
- src/theme/\*\*/input-fuzzing.test.ts
- shared tests under src/test/shared/\*_/_
- electron tests under electron/test/\*_/_ (when applicable)

We also centralize config tweaks in:

- src/test/setup.ts and src/test/vitest-context-setup.ts

## How to run fuzzing tests

- Minimal (dot reporter):
  - npm run fuzz:minimal
- Default runner (no coverage):
  - npm run fuzz
- Detailed reporter:
  - npm run fuzz:detailed
- With coverage:
  - npm run fuzz:coverage
- Electron-only fuzzing:
  - npm run fuzz:electron
- Shared-only fuzzing:
  - npm run fuzz:shared
- Quiet or verbose modes:
  - npm run fuzz:quiet
  - npm run fuzz:verbose

These scripts are already defined in package.json.

## Make fuzzing deterministic (optional)

You can pin the seed for reproducibility with environment variables consumed by fast-check.

Example:

```powershell
$env:FAST_CHECK_SEED=123456
$env:FAST_CHECK_NUM_RUNS=250
npm run fuzz
```

- FAST_CHECK_SEED: fixed seed for deterministic runs
- FAST_CHECK_NUM_RUNS: number of generated cases per property (default in our setup is usually 100)

## Tips for achieving “100% fast-check fuzzing coverage”

- Ensure all `*.property.test.ts` and `*comprehensive-fuzzing.test.ts` files run at least once across the scripts above.
- Avoid excessive retries/timeouts in complex suites; prefer scoped arbitraries to keep runs fast.
- When tests explore external resources (network, fs), mock or gate them to keep fuzzing stable and fast.
- Use @fast-check/vitest’s parametrization to increase runs selectively in CI.

## Troubleshooting

- If a suite gets flaky due to heavy generation, lower FAST_CHECK_NUM_RUNS or restrict arbitraries.
- For long running suites, use the dot reporter (npm run fuzz:minimal) or target a subset with -t "fuzz|fuzzing" patterns.
- If Electron-specific tests need the dev server, please start the Vite dev server in another terminal or use the dedicated Electron fuzz scripts.

## Coverage notes

- Coverage reported by vitest --coverage is statement/branch coverage, not a measurement intrinsic to fast-check. Use fuzz:coverage when you need coverage reports over fuzzing executions.
