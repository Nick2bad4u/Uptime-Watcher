/**
 * Vitest setup hook for custom test context injection
 *
 * This file configures Vitest's test environment for frontend tests. Uses
 * Vitest's built-in task and annotate properties.
 */

import { resolveFastCheckEnvOverrides } from "@shared/test/utils/fastCheckEnv";
import fc from "fast-check";
import { EventEmitter } from "node:events";
import { safeCastTo } from "ts-extras";
import { beforeEach } from "vitest";

// Set max listeners to prevent memory leak warnings in tests
const MAX_LISTENERS = 200; // Higher threshold for test environment

// Set default max listeners for all EventEmitter instances
EventEmitter.defaultMaxListeners = MAX_LISTENERS;

// Set max listeners specifically for the process object
process.setMaxListeners(MAX_LISTENERS);

// Configure fast-check for property-based testing
const current = fc.readConfigureGlobal() ?? {};
const baseNumRuns = safeCastTo<{ numRuns?: number }>(current).numRuns ?? 10;
const fastCheckOverrides = resolveFastCheckEnvOverrides(baseNumRuns);

// Optional: example custom reporter (uncomment + adapt if you want structured output)
// const jsonReporter = (runDetails: any) => {
//   // e.g., write to a log file or console as JSON for CI parsing
//   // import appendFileSync from node:fs at module scope if file output is needed.
//   // appendFileSync("fc-report.json", `${JSON.stringify(runDetails)}\n`);
//   if (runDetails.failed) {
//     // default behavior is to throw; you can customize here if you prefer
//     throw new Error(`Property failed: seed=${runDetails.seed} path=${runDetails.path}`);
//   }
// };

fc.configureGlobal({
    ...current,
    ...fastCheckOverrides,

    // Failure and time limits
    endOnFailure: true, // Stop on first property failure
    includeErrorInReport: true, // Include the original error text (helps many runners)

    interruptAfterTimeLimit: 5 * 60 * 1000, // Overall cap for a run (ms)
    markInterruptAsFailure: true, // Treat interrupts as failures (good for CI)
    // Duplicate handling and skipping
    maxSkipsPerRun: 100, // Tolerance for preconditions / filters
    skipAllAfterTimeLimit: 60 * 1000, // Cap time spent on skipping/shrinking (ms)
    timeout: 20_000, // Per-case async timeout (ms) - increased to 20000ms to handle complex DOM operations and fuzzing tests

    // Reporting / debugging helpers
    verbose: 2, // 0 = quiet, 1 = medium, 2 = most verbose
    // skipEqualValues: true, // skip duplicates while still achieving numRuns

    // Examples and sampling
    // examples: [],          // add any concrete inputs you want always tested
    // unbiased: false,    // keep default biasing unless you need unbiased generators

    // RNG / reproducibility seed: undefined,    // set a specific number to reproduce runs randomType: 'xorshift128plus', // default; change if you need a different generator

    // Replace reporter if you want custom behavior:
    // reporter: jsonReporter,
    // asyncReporter: async (runDetails) => { /* async reporting */ },
});

// No custom context injection needed - Vitest provides task and annotate automatically
beforeEach(() => {
    // Setup can be used for other test environment configuration if needed
});
