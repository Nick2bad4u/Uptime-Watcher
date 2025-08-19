/**
 * Test utilities for creating mock objects that match actual type definitions.
 *
 * @remarks
 * This module provides factory functions for creating mock data objects used in
 * testing. The mock objects are designed to match the actual application type
 * definitions while providing sensible defaults that can be easily overridden
 * for specific test scenarios.
 *
 * Key features:
 *
 * - Type-safe mock object creation
 * - Sensible default values for all properties
 * - Easy customization through partial override objects
 * - Consistent structure matching production types
 * - Useful for unit tests, integration tests, and story books
 *
 * @example
 *
 * ```typescript
 * // Create a mock monitor with defaults
 * const monitor = createMockMonitor();
 *
 * // Create a mock monitor with custom properties
 * const customMonitor = createMockMonitor({
 *     status: "down",
 *     responseTime: 5000,
 *     type: "port",
 * });
 *
 * // Create a mock site with custom monitors
 * const site = createMockSite({
 *     name: "Test Site",
 *     monitors: [monitor, customMonitor],
 * });
 * ```
 *
 * @packageDocumentation
 */

/**
 * Complete site interface for testing purposes.
 *
 * @remarks
 * Represents a site with all required properties for comprehensive testing.
 * This interface includes the core site properties used throughout the
 * application.
 *
 * @public
 */
export interface CompleteSite {
    /** Unique identifier for the site */
    identifier: string;
    /** Whether the site is actively being monitored */
    monitoring: boolean;
    /** Array of monitors associated with this site */
    monitors: CompleteMonitor[];
    /** Human-readable name for the site */
    name: string;
}

/**
 * Complete monitor interface for testing purposes.
 *
 * @remarks
 * Represents a monitor with all properties that might be encountered in testing
 * scenarios. This includes both required and optional properties to ensure
 * comprehensive test coverage.
 *
 * @public
 */
export interface CompleteMonitor {
    /** Active operations currently running on this monitor */
    activeOperations?: string[];
    /** Interval between checks in milliseconds */
    checkInterval: number;
    /** History of monitoring check results */
    history: {
        /** Additional details about the check result */
        details?: string;
        /** Response time for the check in milliseconds */
        responseTime: number;
        /** Status result of the check */
        status: "down" | "up";
        /** Timestamp when the check was performed */
        timestamp: number;
    }[];
    /** Host address for port-based monitors */
    host?: string;
    /** Unique identifier for the monitor */
    id: string;
    /** Timestamp of the last check performed */
    lastChecked?: Date;
    /** Whether this monitor is currently active */
    monitoring: boolean;
    /** Port number for port-based monitors */
    port?: number;
    /** Last recorded response time in milliseconds */
    responseTime: number;
    /** Number of retry attempts before marking as failed */
    retryAttempts: number;
    /** Current status of the monitor */
    status: "up" | "down" | "pending" | "paused";
    /** Timeout for checks in milliseconds */
    timeout: number;
    /** Type of monitor (determines monitoring strategy) */
    type: "http" | "port";
    /** URL for HTTP-based monitors */
    url?: string;
}

/**
 * Creates a mock monitor object with default values.
 *
 * @remarks
 * Generates a monitor object with sensible defaults for testing purposes. All
 * properties can be overridden by providing a partial object with the desired
 * values.
 *
 * @example
 *
 * ```typescript
 * // Create with defaults
 * const monitor = createMockMonitor();
 *
 * // Create with custom status
 * const downMonitor = createMockMonitor({ status: "down" });
 * ```
 *
 * @param overrides - Partial monitor object to override default values
 *
 * @returns Complete monitor object suitable for testing
 *
 * @public
 */
export const createMockMonitor = (
    overrides: Partial<CompleteMonitor> = {}
): CompleteMonitor => ({
    id: "monitor-1",
    type: "http",
    url: "https://example.com",
    checkInterval: 300_000,
    timeout: 30_000,
    retryAttempts: 3,
    monitoring: true,
    history: [],
    status: "up",
    responseTime: 150,
    ...overrides,
});

/**
 * Creates a mock site object with default values.
 *
 * @remarks
 * Generates a site object with sensible defaults for testing purposes. The
 * default site includes one HTTP monitor, but this can be overridden to create
 * sites with different monitor configurations.
 *
 * @example
 *
 * ```typescript
 * // Create with defaults (includes one HTTP monitor)
 * const site = createMockSite();
 *
 * // Create with custom name and multiple monitors
 * const customSite = createMockSite({
 *     name: "Production Site",
 *     monitors: [
 *         createMockMonitor({ type: "http" }),
 *         createMockMonitor({ type: "port", port: 443 }),
 *     ],
 * });
 * ```
 *
 * @param overrides - Partial site object to override default values
 *
 * @returns Complete site object suitable for testing
 *
 * @public
 */
export const createMockSite = (
    overrides: Partial<CompleteSite> = {}
): CompleteSite => ({
    identifier: "site-1",
    name: "Test Site",
    monitoring: true,
    monitors: [createMockMonitor()],
    ...overrides,
});
