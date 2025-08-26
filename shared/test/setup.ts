/**
 * Vitest setup hook for custom test context injection in shared tests
 *
 * This file configures Vitest's test environment for shared tests.
 * Uses Vitest's built-in task and annotate properties.
 */

import { beforeEach } from 'vitest';

// No custom context injection needed - Vitest provides task and annotate automatically
beforeEach(() => {
    // Setup can be used for other test environment configuration if needed
});
