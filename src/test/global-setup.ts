/**
 * Global setup for Vitest frontend tests Runs once before all tests across all
 * test files
 */

import { beforeAll, afterAll } from "vitest";
import fc from "fast-check";
import { resolveFastCheckEnvOverrides } from "@shared/test/utils/fastCheckEnv";

import { EventEmitter } from "node:events";

// Set max listeners to prevent memory leak warnings in tests
const MAX_LISTENERS = 200; // Higher threshold for test environment

// Set default max listeners for all EventEmitter instances
EventEmitter.defaultMaxListeners = MAX_LISTENERS;

// Set max listeners specifically for the process object
process.setMaxListeners(MAX_LISTENERS);

// Configure fast-check for property-based testing
const current = fc.readConfigureGlobal() ?? {};
const baseNumRuns = (current as { numRuns?: number }).numRuns ?? 10;
const fastCheckOverrides = resolveFastCheckEnvOverrides(baseNumRuns);

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
    ...fastCheckOverrides,

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

beforeAll(async () => {
    // Global setup that runs once before all tests
    console.log("🚀 Starting Vitest test suite...");

    // Set up global test environment
    process.env["NODE_ENV"] = "test";
    process.env["VITEST"] = "true";

    // Mock performance.now if not available
    if (typeof performance === "undefined") {
        globalThis.performance = { now: () => Date.now() } as Performance;
    }

    // Ensure fetch is available (for Node.js environments)
    if (typeof fetch === "undefined") {
        // In a real environment, you'd install and use node-fetch or similar
        globalThis.fetch = async () => new Response("{}", { status: 200 });
    }
});

afterAll(async () => {
    // Global cleanup that runs once after all tests
    console.log("✅ Vitest test suite completed.");

    // Clean up any global resources
    if (typeof performance !== "undefined" && performance.clearMarks) {
        performance.clearMarks();
    }

    if (typeof performance !== "undefined" && performance.clearMeasures) {
        performance.clearMeasures();
    }
});
