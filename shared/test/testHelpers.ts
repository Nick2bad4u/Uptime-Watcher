/**
 * Shared test utilities for creating mock objects and test helpers.
 *
 * @file This module provides reusable test utilities for creating valid mock
 *   objects that conform to the strict TypeScript interface requirements across
 *   all test files in the project.
 */

import type {
    Monitor,
    MonitorStatus,
    MonitorType,
    StatusHistory,
} from "../types";

/**
 * Creates a complete Monitor object with all required properties filled.
 *
 * @example
 *
 * ```typescript
 * const monitor = createValidMonitor({ url: "https://example.com" });
 * const downMonitor = createValidMonitor({ status: "down" });
 * ```
 *
 * @param partial - Partial Monitor properties to override defaults
 *
 * @returns Complete Monitor object with all required properties
 */
export const createValidMonitor = (
    partial: Partial<Monitor> = {}
): Monitor => ({
    activeOperations: [],
    checkInterval: 30_000,
    history: [],
    host: "example.com",
    id: `test-monitor-${Math.random().toString(36).slice(2, 11)}`,
    lastChecked: new Date(),
    monitoring: true,
    port: 80,
    responseTime: 100,
    retryAttempts: 3,
    status: "up" as MonitorStatus,
    timeout: 5000,
    type: "http" as MonitorType,
    url: "https://example.com",
    ...partial,
});

/**
 * Creates a complete StatusHistory object for testing.
 *
 * @param partial - Partial StatusHistory properties to override defaults
 *
 * @returns Complete StatusHistory object
 */
export const createValidStatusHistory = (
    partial: Partial<StatusHistory> = {}
): StatusHistory => ({
    timestamp: Date.now(),
    status: "up" as const,
    responseTime: 100,
    ...partial,
});

/**
 * Creates multiple Monitor objects for testing list scenarios.
 *
 * @param count - Number of monitors to create
 * @param basePartial - Base partial properties to apply to all monitors
 *
 * @returns Array of complete Monitor objects
 */
export const createValidMonitors = (
    count: number,
    basePartial: Partial<Monitor> = {}
): Monitor[] =>
    Array.from({ length: count }, (_, index) =>
        createValidMonitor({
            ...basePartial,
            id: `test-monitor-${index}`,
            url: `https://example-${index}.com`,
        })
    );
