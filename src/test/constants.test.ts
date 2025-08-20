/**
 * Comprehensive tests for application constants. Validates all constants used
 * throughout the application.
 */

import { describe, expect, it } from "vitest";
import {
    TRANSITION_ALL,
    FALLBACK_MONITOR_TYPE_OPTIONS,
    FONT_FAMILY_MONO,
    FONT_FAMILY_SANS,
    CHECK_INTERVALS,
    DEFAULT_CHECK_INTERVAL,
    DEFAULT_REQUEST_TIMEOUT,
    DEFAULT_REQUEST_TIMEOUT_SECONDS,
    DEFAULT_HISTORY_LIMIT,
    HISTORY_LIMIT_OPTIONS,
    TIMEOUT_CONSTRAINTS,
    TIMEOUT_CONSTRAINTS_MS,
    RETRY_CONSTRAINTS,
    UI_DELAYS,
    CHART_TIME_PERIODS,
    CHART_TIME_RANGES,
    ARIA_LABEL,
    type ChartTimeRange,
    type IntervalOption,
    type ChartTimePeriods,
} from "../constants";

describe("Application Constants", () => {
    describe("UI Animation Constants", () => {
        it("should export TRANSITION_ALL with correct value", () => {
            expect(TRANSITION_ALL).toBe("all 0.2s ease-in-out");
            expect(typeof TRANSITION_ALL).toBe("string");
        });

        it("should have valid CSS transition timing", () => {
            // Validate CSS transition syntax
            expect(TRANSITION_ALL).toMatch(/^all\s+[\d.]+s\s+ease-in-out$/);
        });
    });

    describe("Monitor Type Options", () => {
        it("should export FALLBACK_MONITOR_TYPE_OPTIONS", () => {
            expect(FALLBACK_MONITOR_TYPE_OPTIONS).toBeDefined();
            expect(Array.isArray(FALLBACK_MONITOR_TYPE_OPTIONS)).toBe(true);
            expect(FALLBACK_MONITOR_TYPE_OPTIONS.length).toBeGreaterThan(0);
        });

        it("should have valid monitor type structure", () => {
            for (const option of FALLBACK_MONITOR_TYPE_OPTIONS) {
                expect(option).toHaveProperty("label");
                expect(option).toHaveProperty("value");
                expect(typeof option.label).toBe("string");
                expect(typeof option.value).toBe("string");
                expect(option.label.length).toBeGreaterThan(0);
                expect(option.value.length).toBeGreaterThan(0);
            }
        });

        it("should contain expected monitor types", () => {
            const values = FALLBACK_MONITOR_TYPE_OPTIONS.map(
                (option) => option.value
            );
            expect(values).toContain("http");
            expect(values).toContain("ping");
            expect(values).toContain("port");
        });

        it("should have descriptive labels", () => {
            const httpOption = FALLBACK_MONITOR_TYPE_OPTIONS.find(
                (opt) => opt.value === "http"
            );
            expect(httpOption?.label).toContain("HTTP");

            const pingOption = FALLBACK_MONITOR_TYPE_OPTIONS.find(
                (opt) => opt.value === "ping"
            );
            expect(pingOption?.label).toContain("Ping");

            const portOption = FALLBACK_MONITOR_TYPE_OPTIONS.find(
                (opt) => opt.value === "port"
            );
            expect(portOption?.label).toContain("Port");
        });
    });

    describe("Font Family Constants", () => {
        it("should export FONT_FAMILY_MONO as array", () => {
            expect(FONT_FAMILY_MONO).toBeDefined();
            expect(Array.isArray(FONT_FAMILY_MONO)).toBe(true);
            expect(FONT_FAMILY_MONO.length).toBeGreaterThan(0);
        });

        it("should export FONT_FAMILY_SANS as array", () => {
            expect(FONT_FAMILY_SANS).toBeDefined();
            expect(Array.isArray(FONT_FAMILY_SANS)).toBe(true);
            expect(FONT_FAMILY_SANS.length).toBeGreaterThan(0);
        });

        it("should contain valid font names", () => {
            for (const font of FONT_FAMILY_MONO) {
                expect(typeof font).toBe("string");
                expect(font.length).toBeGreaterThan(0);
            }

            for (const font of FONT_FAMILY_SANS) {
                expect(typeof font).toBe("string");
                expect(font.length).toBeGreaterThan(0);
            }
        });

        it("should include fallback fonts", () => {
            expect(FONT_FAMILY_MONO).toContain("monospace");
            expect(FONT_FAMILY_SANS).toContain("sans-serif");
        });

        it("should have popular fonts", () => {
            const lowercaseMonoFonts = FONT_FAMILY_MONO.map((f) =>
                f.toLowerCase()
            );
            expect(lowercaseMonoFonts.some((f) => f.includes("mono"))).toBe(
                true
            );

            const lowercaseSansFonts = FONT_FAMILY_SANS.map((f) =>
                f.toLowerCase()
            );
            expect(
                lowercaseSansFonts.some(
                    (f) => f.includes("inter") || f.includes("system")
                )
            ).toBe(true);
        });
    });

    describe("Check Intervals", () => {
        it("should export CHECK_INTERVALS as array", () => {
            expect(CHECK_INTERVALS).toBeDefined();
            expect(Array.isArray(CHECK_INTERVALS)).toBe(true);
            expect(CHECK_INTERVALS.length).toBeGreaterThan(0);
        });

        it("should have valid interval structure", () => {
            for (const interval of CHECK_INTERVALS) {
                expect(interval).toHaveProperty("label");
                expect(interval).toHaveProperty("value");
                expect(typeof interval.label).toBe("string");
                expect(typeof interval.value).toBe("number");
                expect(interval.label.length).toBeGreaterThan(0);
                expect(interval.value).toBeGreaterThan(0);
            }
        });

        it("should have reasonable interval values", () => {
            const values = CHECK_INTERVALS.map((interval) => interval.value);
            expect(Math.min(...values)).toBeGreaterThanOrEqual(5000); // At least 5 seconds
            expect(Math.max(...values)).toBeLessThanOrEqual(2_592_000_000); // At most 30 days
        });

        it("should have sorted intervals", () => {
            const values = CHECK_INTERVALS.map((interval) => interval.value);
            for (let i = 1; i < values.length; i++) {
                const currentValue = values[i];
                const previousValue = values[i - 1];
                if (currentValue !== null && previousValue !== null) {
                    expect(currentValue).toBeGreaterThanOrEqual(previousValue);
                }
            }
        });
    });

    describe("Default Values", () => {
        it("should export DEFAULT_CHECK_INTERVAL", () => {
            expect(DEFAULT_CHECK_INTERVAL).toBeDefined();
            expect(typeof DEFAULT_CHECK_INTERVAL).toBe("number");
            expect(DEFAULT_CHECK_INTERVAL).toBe(300_000); // 5 minutes
        });

        it("should export DEFAULT_REQUEST_TIMEOUT", () => {
            expect(DEFAULT_REQUEST_TIMEOUT).toBeDefined();
            expect(typeof DEFAULT_REQUEST_TIMEOUT).toBe("number");
            expect(DEFAULT_REQUEST_TIMEOUT).toBe(10_000); // 10 seconds
        });

        it("should export DEFAULT_REQUEST_TIMEOUT_SECONDS", () => {
            expect(DEFAULT_REQUEST_TIMEOUT_SECONDS).toBeDefined();
            expect(typeof DEFAULT_REQUEST_TIMEOUT_SECONDS).toBe("number");
            expect(DEFAULT_REQUEST_TIMEOUT_SECONDS).toBe(10);
        });

        it("should export DEFAULT_HISTORY_LIMIT", () => {
            expect(DEFAULT_HISTORY_LIMIT).toBeDefined();
            expect(typeof DEFAULT_HISTORY_LIMIT).toBe("number");
            expect(DEFAULT_HISTORY_LIMIT).toBe(500);
        });

        it("should have consistent timeout values", () => {
            expect(DEFAULT_REQUEST_TIMEOUT).toBe(
                DEFAULT_REQUEST_TIMEOUT_SECONDS * 1000
            );
        });
    });

    describe("History Limit Options", () => {
        it("should export HISTORY_LIMIT_OPTIONS as array", () => {
            expect(HISTORY_LIMIT_OPTIONS).toBeDefined();
            expect(Array.isArray(HISTORY_LIMIT_OPTIONS)).toBe(true);
            expect(HISTORY_LIMIT_OPTIONS.length).toBeGreaterThan(0);
        });

        it("should have valid history limit structure", () => {
            for (const option of HISTORY_LIMIT_OPTIONS) {
                expect(option).toHaveProperty("label");
                expect(option).toHaveProperty("value");
                expect(typeof option.label).toBe("string");
                expect(typeof option.value).toBe("number");
                expect(option.label.length).toBeGreaterThan(0);
                expect(option.value).toBeGreaterThan(0);
            }
        });

        it("should include unlimited option", () => {
            const unlimitedOption = HISTORY_LIMIT_OPTIONS.find((opt) =>
                opt.label.toLowerCase().includes("unlimited")
            );
            expect(unlimitedOption).toBeDefined();
            expect(unlimitedOption?.value).toBe(Number.MAX_SAFE_INTEGER);
        });
    });

    describe("Timeout Constraints", () => {
        it("should export TIMEOUT_CONSTRAINTS", () => {
            expect(TIMEOUT_CONSTRAINTS).toBeDefined();
            expect(typeof TIMEOUT_CONSTRAINTS).toBe("object");
            expect(TIMEOUT_CONSTRAINTS).toHaveProperty("MIN");
            expect(TIMEOUT_CONSTRAINTS).toHaveProperty("MAX");
            expect(TIMEOUT_CONSTRAINTS).toHaveProperty("STEP");
        });

        it("should export TIMEOUT_CONSTRAINTS_MS", () => {
            expect(TIMEOUT_CONSTRAINTS_MS).toBeDefined();
            expect(typeof TIMEOUT_CONSTRAINTS_MS).toBe("object");
            expect(TIMEOUT_CONSTRAINTS_MS).toHaveProperty("MIN");
            expect(TIMEOUT_CONSTRAINTS_MS).toHaveProperty("MAX");
            expect(TIMEOUT_CONSTRAINTS_MS).toHaveProperty("STEP");
        });

        it("should have consistent timeout constraint values", () => {
            expect(TIMEOUT_CONSTRAINTS_MS.MIN).toBe(
                TIMEOUT_CONSTRAINTS.MIN * 1000
            );
            expect(TIMEOUT_CONSTRAINTS_MS.MAX).toBe(
                TIMEOUT_CONSTRAINTS.MAX * 1000
            );
            expect(TIMEOUT_CONSTRAINTS_MS.STEP).toBe(
                TIMEOUT_CONSTRAINTS.STEP * 1000
            );
        });

        it("should have reasonable timeout constraints", () => {
            expect(TIMEOUT_CONSTRAINTS.MIN).toBeGreaterThanOrEqual(1);
            expect(TIMEOUT_CONSTRAINTS.MAX).toBeLessThanOrEqual(300);
            expect(TIMEOUT_CONSTRAINTS.MIN).toBeLessThan(
                TIMEOUT_CONSTRAINTS.MAX
            );
        });
    });

    describe("Retry Constraints", () => {
        it("should export RETRY_CONSTRAINTS", () => {
            expect(RETRY_CONSTRAINTS).toBeDefined();
            expect(typeof RETRY_CONSTRAINTS).toBe("object");
            expect(RETRY_CONSTRAINTS).toHaveProperty("MIN");
            expect(RETRY_CONSTRAINTS).toHaveProperty("MAX");
            expect(RETRY_CONSTRAINTS).toHaveProperty("DEFAULT");
            expect(RETRY_CONSTRAINTS).toHaveProperty("STEP");
        });

        it("should have reasonable retry constraint values", () => {
            expect(RETRY_CONSTRAINTS.MIN).toBe(0);
            expect(RETRY_CONSTRAINTS.MAX).toBe(10);
            expect(RETRY_CONSTRAINTS.DEFAULT).toBe(3);
            expect(RETRY_CONSTRAINTS.STEP).toBe(1);
        });

        it("should have logical retry constraints", () => {
            expect(RETRY_CONSTRAINTS.MIN).toBeLessThanOrEqual(
                RETRY_CONSTRAINTS.DEFAULT
            );
            expect(RETRY_CONSTRAINTS.DEFAULT).toBeLessThanOrEqual(
                RETRY_CONSTRAINTS.MAX
            );
        });
    });

    describe("UI Delays", () => {
        it("should export UI_DELAYS", () => {
            expect(UI_DELAYS).toBeDefined();
            expect(typeof UI_DELAYS).toBe("object");
            expect(UI_DELAYS).toHaveProperty("LOADING_BUTTON");
            expect(UI_DELAYS).toHaveProperty("LOADING_OVERLAY");
            expect(UI_DELAYS).toHaveProperty("STATE_UPDATE_DEFER");
        });

        it("should have reasonable delay values", () => {
            expect(UI_DELAYS.LOADING_BUTTON).toBeGreaterThanOrEqual(0);
            expect(UI_DELAYS.LOADING_OVERLAY).toBeGreaterThanOrEqual(0);
            expect(UI_DELAYS.STATE_UPDATE_DEFER).toBeGreaterThanOrEqual(0);

            // Should be reasonable for UI (not too long)
            expect(UI_DELAYS.LOADING_BUTTON).toBeLessThan(1000);
            expect(UI_DELAYS.LOADING_OVERLAY).toBeLessThan(1000);
        });
    });

    describe("Chart Configuration", () => {
        it("should export CHART_TIME_PERIODS", () => {
            expect(CHART_TIME_PERIODS).toBeDefined();
            expect(typeof CHART_TIME_PERIODS).toBe("object");
        });

        it("should have valid chart time periods", () => {
            const expectedPeriods = [
                "1h",
                "12h",
                "24h",
                "7d",
                "30d",
            ];
            for (const period of expectedPeriods) {
                expect(CHART_TIME_PERIODS).toHaveProperty(period);
                expect(
                    typeof CHART_TIME_PERIODS[period as keyof ChartTimePeriods]
                ).toBe("number");
                expect(
                    CHART_TIME_PERIODS[period as keyof ChartTimePeriods]
                ).toBeGreaterThan(0);
            }
        });

        it("should export CHART_TIME_RANGES", () => {
            expect(CHART_TIME_RANGES).toBeDefined();
            expect(Array.isArray(CHART_TIME_RANGES)).toBe(true);
            expect(CHART_TIME_RANGES.length).toBeGreaterThan(0);
        });

        it("should have logical time period progression", () => {
            expect(CHART_TIME_PERIODS["1h"]).toBeLessThan(
                CHART_TIME_PERIODS["12h"]
            );
            expect(CHART_TIME_PERIODS["12h"]).toBeLessThan(
                CHART_TIME_PERIODS["24h"]
            );
            expect(CHART_TIME_PERIODS["24h"]).toBeLessThan(
                CHART_TIME_PERIODS["7d"]
            );
            expect(CHART_TIME_PERIODS["7d"]).toBeLessThan(
                CHART_TIME_PERIODS["30d"]
            );
        });
    });

    describe("Accessibility", () => {
        it("should export ARIA_LABEL", () => {
            expect(ARIA_LABEL).toBeDefined();
            expect(typeof ARIA_LABEL).toBe("string");
            expect(ARIA_LABEL).toBe("aria-label");
        });
    });

    describe("Type Definitions", () => {
        it("should have valid ChartTimeRange type", () => {
            const validRanges: ChartTimeRange[] = [
                "1h",
                "24h",
                "7d",
                "30d",
            ];
            for (const range of validRanges) {
                expect(CHART_TIME_RANGES).toContain(range);
            }
        });

        it("should have valid IntervalOption interface usage", () => {
            const testInterval: IntervalOption = { label: "Test", value: 1000 };
            expect(testInterval).toHaveProperty("label");
            expect(testInterval).toHaveProperty("value");
            expect(typeof testInterval.label).toBe("string");
            expect(typeof testInterval.value).toBe("number");
        });
    });

    describe("Integration and Consistency", () => {
        it("should have consistent monitor types across configurations", () => {
            const fallbackTypes = FALLBACK_MONITOR_TYPE_OPTIONS.map(
                (opt) => opt.value
            );

            // Ensure all fallback types are unique
            const uniqueTypes = [...new Set(fallbackTypes)];
            expect(uniqueTypes.length).toBe(fallbackTypes.length);
        });

        it("should have reasonable animation timing", () => {
            // Extract timing from TRANSITION_ALL
            const timingMatch = TRANSITION_ALL.match(/(?<timing>[\d.]+)s/);
            expect(timingMatch).not.toBeNull();

            if (timingMatch && timingMatch.groups?.timing) {
                const seconds = Number.parseFloat(timingMatch.groups.timing);
                expect(seconds).toBeGreaterThan(0);
                expect(seconds).toBeLessThan(2); // Should be reasonable for UI animations
            }
        });

        it("should have default values within constraint ranges", () => {
            expect(DEFAULT_REQUEST_TIMEOUT_SECONDS).toBeGreaterThanOrEqual(
                TIMEOUT_CONSTRAINTS.MIN
            );
            expect(DEFAULT_REQUEST_TIMEOUT_SECONDS).toBeLessThanOrEqual(
                TIMEOUT_CONSTRAINTS.MAX
            );

            expect(RETRY_CONSTRAINTS.DEFAULT).toBeGreaterThanOrEqual(
                RETRY_CONSTRAINTS.MIN
            );
            expect(RETRY_CONSTRAINTS.DEFAULT).toBeLessThanOrEqual(
                RETRY_CONSTRAINTS.MAX
            );
        });

        it("should have check interval available in options", () => {
            const intervalValues = CHECK_INTERVALS.map(
                (interval) => interval.value
            );
            expect(intervalValues).toContain(DEFAULT_CHECK_INTERVAL);
        });

        it("should have history limit available in options", () => {
            const limitValues = HISTORY_LIMIT_OPTIONS.map(
                (option) => option.value
            );
            expect(limitValues).toContain(DEFAULT_HISTORY_LIMIT);
        });
    });

    describe("Error Handling and Fallbacks", () => {
        it("should handle missing constants gracefully", () => {
            // Test that critical constants are defined
            const criticalConstants = [
                TRANSITION_ALL,
                FALLBACK_MONITOR_TYPE_OPTIONS,
                FONT_FAMILY_MONO,
                FONT_FAMILY_SANS,
                DEFAULT_CHECK_INTERVAL,
                DEFAULT_REQUEST_TIMEOUT,
                CHART_TIME_PERIODS,
            ];

            for (const constant of criticalConstants) {
                expect(constant).toBeDefined();
                expect(constant).not.toBeNull();
            }
        });
    });

    describe("Constant Values Validation", () => {
        it("should have valid transition timing", () => {
            expect(TRANSITION_ALL).toMatch(/^\w+\s+[\d.]+s\s+[\w-]+$/);
        });

        it("should have non-empty monitor type options", () => {
            expect(FALLBACK_MONITOR_TYPE_OPTIONS.length).toBeGreaterThanOrEqual(
                3
            );
        });

        it("should have at least one font in families", () => {
            expect(FONT_FAMILY_MONO.length).toBeGreaterThanOrEqual(1);
            expect(FONT_FAMILY_SANS.length).toBeGreaterThanOrEqual(1);
        });

        it("should have reasonable default timeout values", () => {
            expect(DEFAULT_REQUEST_TIMEOUT).toBeGreaterThan(1000); // At least 1 second
            expect(DEFAULT_REQUEST_TIMEOUT).toBeLessThan(60_000); // Less than 1 minute
        });

        it("should have reasonable default check interval", () => {
            expect(DEFAULT_CHECK_INTERVAL).toBeGreaterThan(5000); // At least 5 seconds
            expect(DEFAULT_CHECK_INTERVAL).toBeLessThan(3_600_000); // Less than 1 hour
        });
    });
});
