/**
 * Global setup for Vitest frontend tests Runs once before all tests across all
 * test files
 */

import { beforeAll, afterAll } from "vitest";

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
