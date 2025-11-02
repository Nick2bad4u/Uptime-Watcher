/**
 * Provides complete coverage for shared monitoring interval constants.
 *
 * @file Ensures remediation heuristics remain in sync across application layers
 *   by validating the exported thresholds and helper logic.
 */

import { describe, expect, it } from "vitest";

import {
    DEFAULT_MONITOR_CHECK_INTERVAL_MS,
    MIN_MONITOR_CHECK_INTERVAL_MS,
    shouldRemediateMonitorInterval,
} from "@shared/constants/monitoring";

describe("monitoring interval constants", () => {
    it("expose the documented millisecond thresholds", () => {
        expect(DEFAULT_MONITOR_CHECK_INTERVAL_MS).toBe(300_000);
        expect(MIN_MONITOR_CHECK_INTERVAL_MS).toBe(5000);
        expect(DEFAULT_MONITOR_CHECK_INTERVAL_MS).toBeGreaterThan(
            MIN_MONITOR_CHECK_INTERVAL_MS
        );
    });
});

describe(shouldRemediateMonitorInterval, () => {
    it("flags non-numeric or missing values for remediation", () => {
        expect(shouldRemediateMonitorInterval(undefined)).toBeTruthy();
        expect(shouldRemediateMonitorInterval(Number.NaN)).toBeTruthy();
        expect(
            shouldRemediateMonitorInterval("15" as unknown as number)
        ).toBeTruthy();
    });

    it("flags intervals below the minimum threshold", () => {
        expect(shouldRemediateMonitorInterval(4999)).toBeTruthy();
    });

    it("accepts intervals that satisfy the minimum cadence", () => {
        expect(
            shouldRemediateMonitorInterval(MIN_MONITOR_CHECK_INTERVAL_MS)
        ).toBeFalsy();
        expect(
            shouldRemediateMonitorInterval(
                MIN_MONITOR_CHECK_INTERVAL_MS + 60_000
            )
        ).toBeFalsy();
    });
});
