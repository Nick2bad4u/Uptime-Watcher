/**
 * Vitest setup hook for custom test context injection in shared tests
 *
 * This file configures Vitest's test environment for shared tests. Uses
 * Vitest's built-in task and annotate properties.
 */

import { beforeEach } from "vitest";
import fc from "fast-check";

// Increase Node.js process listener limits for tests to prevent MaxListenersExceededWarning
process.setMaxListeners(200);

// Configure fast-check for property-based testing
const current = fc.readConfigureGlobal() ?? {};

// Optional: example custom reporter (uncomment + adapt if you want structured output)
// const jsonReporter = (runDetails: any) => {
//   // e.g., write to a log file or console as JSON for CI parsing
//   // require('fs').appendFileSync('fc-report.json', JSON.stringify(runDetails) + '\n');
//   if (runDetails.failed) {
//     // default behavior is to throw; you can customize here if you prefer
//     throw new Error(`Property failed: seed=${runDetails.seed} path=${runDetails.path}`);
//   }
// };

fc.configureGlobal({
    ...current,
    // Required by you:
    numRuns: 10,

    // Reporting / debugging helpers
    verbose: 2, // 0 = quiet, 1 = medium, 2 = most verbose
    includeErrorInReport: true, // Include the original error text (helps many runners)

    // Failure and time limits
    endOnFailure: true, // Stop on first property failure
    timeout: 1000, // Per-case async timeout (ms)
    interruptAfterTimeLimit: 5 * 60 * 1000, // Overall cap for a run (ms)
    markInterruptAsFailure: true, // Treat interrupts as failures (good for CI)
    skipAllAfterTimeLimit: 60 * 1000, // Cap time spent on skipping/shrinking (ms)

    // Duplicate handling and skipping
    maxSkipsPerRun: 100, // Tolerance for preconditions / filters
    // skipEqualValues: true, // skip duplicates while still achieving numRuns

    // Examples and sampling
    // examples: [],          // add any concrete inputs you want always tested
    // unbiased: false,    // keep default biasing unless you need unbiased generators

    // RNG / reproducibility
    // seed: undefined,    // set a specific number to reproduce runs
    // randomType: 'xorshift128plus', // default; change if you need a different generator

    // Replace reporter if you want custom behavior:
    // reporter: jsonReporter,
    // asyncReporter: async (runDetails) => { /* async reporting */ },
});

// No custom context injection needed - Vitest provides task and annotate automatically
beforeEach(() => {
    // Setup can be used for other test environment configuration if needed
});
