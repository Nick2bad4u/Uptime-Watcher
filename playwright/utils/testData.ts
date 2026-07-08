/**
 * Shared test data helpers for Playwright suites.
 */

import { randomUUID } from "node:crypto";

/** Default URL used when creating synthetic monitor entries during UI tests. */
export const DEFAULT_TEST_SITE_URL = "https://example.com";

/**
 * Generates a unique site name for the current test execution.
 *
 * @param prefix - Human-readable prefix describing the scenario under test.
 *
 * @returns Deterministic-structure, unique site name string.
 */
export function generateSiteName(prefix: string): string {
    return `${prefix} ${randomUUID()}`;
}
