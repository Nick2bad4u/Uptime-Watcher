/**
 * Shared test data helpers for Playwright suites.
 */

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
    const entropy = `${Date.now().toString(36)}-${Math.floor(Math.random() * 1_000_000)}`;
    return `${prefix} ${entropy}`;
}
