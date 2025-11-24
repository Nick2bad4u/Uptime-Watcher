/**
 * Factory helpers for constructing canonical site monitoring fixtures.
 */

import {
    STATUS_KIND,
    type Monitor,
    type Site,
    type StatusHistory,
} from "@shared/types";
import {
    sampleOne,
    siteNameArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";

/**
 * Deterministic timestamp used across shared tests.
 */
export const FIXED_STATUS_TIMESTAMP: number = Date.UTC(2024, 0, 1, 0, 0, 0, 0);

/**
 * Builds a monitor history entry populated with sensible defaults.
 */
export const createStatusHistoryEntry = (
    overrides?: Partial<StatusHistory>
): StatusHistory => ({
    details: "check completed successfully",
    responseTime: 120,
    status: STATUS_KIND.UP,
    timestamp: FIXED_STATUS_TIMESTAMP,
    ...overrides,
});

/**
 * Builds a monitor snapshot populated with canonical defaults.
 */
export const createMonitorSnapshot = (
    overrides?: Partial<Monitor>
): Monitor => ({
    activeOperations: [],
    checkInterval: 60_000,
    history: [createStatusHistoryEntry()],
    id: "monitor-ping-1",
    monitoring: true,
    responseTime: 95,
    retryAttempts: 0,
    status: STATUS_KIND.UP,
    timeout: 30_000,
    type: "ping",
    host: "example.com",
    ...overrides,
});

/**
 * Builds a complete site snapshot populated with canonical defaults.
 */
export const createSiteSnapshot = (overrides?: Partial<Site>): Site => ({
    identifier: "site-1",
    monitoring: true,
    monitors: [createMonitorSnapshot()],
    name: sampleOne(siteNameArbitrary),
    ...overrides,
});
