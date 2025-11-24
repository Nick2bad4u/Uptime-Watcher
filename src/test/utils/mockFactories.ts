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

import { vi, type Mock } from "vitest";
import type { PartialDeep, SetOptional } from "type-fest";

import type { MonitorStatus, MonitorType, StatusHistory } from "@shared/types";
import {
    monitorIdArbitrary,
    sampleOne,
    siteIdentifierArbitrary,
    siteNameArbitrary,
    siteUrlArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";

/**
 * Create a strongly typed Vitest mock for a given function signature.
 *
 * @typeParam Fn - Function signature the mock should adhere to.
 *
 * @param implementation - Optional implementation executed by the mock.
 *
 * @returns A Vitest mock constrained to the supplied signature.
 */
export function createMockFunction<Fn extends (...args: any[]) => any>(
    implementation?: Fn
): Mock<Fn> {
    if (implementation !== undefined) {
        return vi.fn<Fn>(implementation);
    }

    return vi.fn<Fn>();
}

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
    history: StatusHistory[];
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
    status: MonitorStatus;
    /** Timeout for checks in milliseconds */
    timeout: number;
    /** Type of monitor (determines monitoring strategy) */
    type: MonitorType;
    /** URL for HTTP-based monitors */
    url?: string;
}

/**
 * Creates a mock monitor object with default values using deep partial type
 * safety.
 *
 * @remarks
 * Enhanced version of createMockMonitor that supports deep partial overrides
 * for nested objects, providing better type safety for complex test scenarios.
 *
 * @example
 *
 * ```typescript
 * // Create with deep partial overrides
 * const monitor = createMockMonitorDeep({
 *     history: [
 *         {
 *             responseTime: 200,
 *         },
 *     ],
 * });
 * ```
 *
 * @param overrides - Deep partial monitor object to override default values
 *
 * @returns Complete monitor object suitable for testing
 *
 * @public
 */
export const createMockMonitorDeep = (
    overrides: PartialDeep<CompleteMonitor> = {}
): CompleteMonitor => {
    const base = createMockMonitor();
    return Object.assign(base, overrides) as CompleteMonitor;
};

/**
 * Creates a mock monitor object with optional fields made truly optional.
 *
 * @remarks
 * Creates a monitor where normally required fields can be omitted for testing
 * invalid/incomplete data scenarios.
 *
 * @example
 *
 * ```typescript
 * // Create monitor without required fields for testing validation
 * const incompleteMonitor = createMockMonitorOptional({
 *     // id and type are optional, allowing testing of validation logic
 *     url: "https://example.com",
 * });
 * ```
 *
 * @param overrides - Monitor data with some fields optional
 *
 * @returns Monitor object with optional fields
 *
 * @public
 */
export const createMockMonitorOptional = (
    overrides: Partial<SetOptional<CompleteMonitor, "id" | "type">> = {}
): SetOptional<CompleteMonitor, "id" | "type"> => {
    const base = createMockMonitor();
    return { ...base, ...overrides };
};
export const createMockMonitor = (
    overrides: Partial<CompleteMonitor> = {}
): CompleteMonitor => ({
    id: sampleOne(monitorIdArbitrary),
    type: "http",
    url: sampleOne(siteUrlArbitrary),
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
    identifier: sampleOne(siteIdentifierArbitrary),
    name: sampleOne(siteNameArbitrary),
    monitoring: true,
    monitors: [createMockMonitor()],
    ...overrides,
});
