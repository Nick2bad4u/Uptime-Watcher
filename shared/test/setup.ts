/**
 * Vitest setup hook for custom test context injection in shared tests
 *
 * This file configures Vitest's test environment for shared tests. Uses
 * Vitest's built-in task and annotate properties.
 */

import { beforeEach } from "vitest";
import fc from "fast-check";

// Configure fast-check for property-based testing
fc.configureGlobal({ numRuns: 10 });

// No custom context injection needed - Vitest provides task and annotate automatically
beforeEach(() => {
    // Setup can be used for other test environment configuration if needed
});
