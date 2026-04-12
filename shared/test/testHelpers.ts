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

import { webcrypto } from "node:crypto";

/**
 * Resolve the Web Crypto API used by shared test helpers.
 *
 * @returns Crypto implementation exposing `getRandomValues`.
 */
const getCryptoForTests = (): Crypto => {
    if (typeof globalThis.crypto?.getRandomValues === "function") {
        return globalThis.crypto;
    }

    if (typeof webcrypto.getRandomValues === "function") {
        return webcrypto;
    }

    throw new TypeError(
        "Web Crypto getRandomValues is unavailable in the current test environment."
    );
};

/**
 * Generate a cryptographically strong floating-point number in the range
 * `[0, 1)`.
 *
 * @returns Secure pseudo-random floating-point number.
 */
export const secureRandomFloat = (): number => {
    const values = new Uint32Array(1);

    getCryptoForTests().getRandomValues(values);

    return (values[0] ?? 0) / 0x1_00_00_00_00;
};

/**
 * Generate a cryptographically strong integer in the range
 * `[0, maxExclusive)`.
 *
 * @param maxExclusive - Exclusive upper bound.
 *
 * @returns Secure pseudo-random integer.
 */
export const secureRandomInt = (maxExclusive: number): number => {
    if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
        throw new RangeError(
            "secureRandomInt requires a positive integer maxExclusive value."
        );
    }

    return Math.floor(secureRandomFloat() * maxExclusive);
};

/**
 * Generate a cryptographically strong boolean using the provided true
 * probability.
 *
 * @param trueProbability - Probability of returning true in the range `[0, 1]`.
 *
 * @returns Secure pseudo-random boolean.
 */
export const secureRandomBoolean = (trueProbability = 0.5): boolean => {
    if (!Number.isFinite(trueProbability)) {
        throw new TypeError(
            "secureRandomBoolean requires a finite probability value."
        );
    }

    if (trueProbability < 0 || trueProbability > 1) {
        throw new RangeError(
            "secureRandomBoolean requires a probability between 0 and 1."
        );
    }

    return secureRandomFloat() < trueProbability;
};

/**
 * Generates a stable monitor identifier matching the expected test format.
 *
 * @returns Monitor identifier in the form `test-monitor-XXXXXXXXX` where X is
 *   lowercase alphanumeric.
 */
const generateMonitorIdentifier = (): string => {
    const values = new Uint8Array(6);

    getCryptoForTests().getRandomValues(values);

    const randomSegment = Array.from(
        values,
        (value) => value.toString(36).padStart(2, "0")
    )
        .join("")
        .slice(0, 9);
    const normalizedSegment =
        randomSegment.length >= 9
            ? randomSegment.slice(0, 9)
            : randomSegment.padEnd(9, "0");

    return `test-monitor-${normalizedSegment}`;
};

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
    id: generateMonitorIdentifier(),
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
