/**
 * Vitest setup hook for custom test context injection
 *
 * This file configures Vitest's test environment for frontend tests. Uses
 * Vitest's built-in task and annotate properties.
 */

import { beforeEach } from "vitest";
import fc from "fast-check";

import EventEmitter from "node:events";

// Set max listeners to prevent memory leak warnings in tests
const MAX_LISTENERS = 200; // Higher threshold for test environment

// Set default max listeners for all EventEmitter instances
EventEmitter.defaultMaxListeners = MAX_LISTENERS;

// Set max listeners specifically for the process object
process.setMaxListeners(MAX_LISTENERS);

// Configure fast-check for property-based testing
fc.configureGlobal({ numRuns: 10 });

// No custom context injection needed - Vitest provides task and annotate automatically
beforeEach(() => {
    // Setup can be used for other test environment configuration if needed
});
