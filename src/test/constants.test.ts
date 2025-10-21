/**
 * Comprehensive tests for application constants. Validates all constants used
 * throughout the application.
 */

import { describe, expect, it } from "vitest";
import { test, fc } from "@fast-check/vitest";
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
import { DEFAULT_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";

describe("Application Constants", () => {
    describe("UI Animation Constants", () => {
        it("should export TRANSITION_ALL with correct value", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(TRANSITION_ALL).toBe("all 0.2s ease-in-out");
            expect(typeof TRANSITION_ALL).toBe("string");
        });

        it("should have valid CSS transition timing", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Validate CSS transition syntax
            expect(TRANSITION_ALL).toMatch(/^all\s+[\d.]+s\s+ease-in-out$/);
        });
    });

    describe("Monitor Type Options", () => {
        it("should export FALLBACK_MONITOR_TYPE_OPTIONS", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(FALLBACK_MONITOR_TYPE_OPTIONS).toBeDefined();
            expect(Array.isArray(FALLBACK_MONITOR_TYPE_OPTIONS)).toBeTruthy();
            expect(FALLBACK_MONITOR_TYPE_OPTIONS.length).toBeGreaterThan(0);
        });

        it("should have valid monitor type structure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            for (const option of FALLBACK_MONITOR_TYPE_OPTIONS) {
                expect(option).toHaveProperty("label");
                expect(option).toHaveProperty("value");
                expect(typeof option.label).toBe("string");
                expect(typeof option.value).toBe("string");
                expect(option.label.length).toBeGreaterThan(0);
                expect(option.value.length).toBeGreaterThan(0);
            }
        });

        it("should contain expected monitor types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const values = FALLBACK_MONITOR_TYPE_OPTIONS.map(
                (option) => option.value
            );
            expect(values).toContain("http");
            expect(values).toContain("ping");
            expect(values).toContain("port");
        });

        it("should have descriptive labels", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

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
        it("should export FONT_FAMILY_MONO as array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(FONT_FAMILY_MONO).toBeDefined();
            expect(Array.isArray(FONT_FAMILY_MONO)).toBeTruthy();
            expect(FONT_FAMILY_MONO.length).toBeGreaterThan(0);
        });

        it("should export FONT_FAMILY_SANS as array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(FONT_FAMILY_SANS).toBeDefined();
            expect(Array.isArray(FONT_FAMILY_SANS)).toBeTruthy();
            expect(FONT_FAMILY_SANS.length).toBeGreaterThan(0);
        });

        it("should contain valid font names", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            for (const font of FONT_FAMILY_MONO) {
                expect(typeof font).toBe("string");
                expect(font.length).toBeGreaterThan(0);
            }

            for (const font of FONT_FAMILY_SANS) {
                expect(typeof font).toBe("string");
                expect(font.length).toBeGreaterThan(0);
            }
        });

        it("should include fallback fonts", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(FONT_FAMILY_MONO).toContain("monospace");
            expect(FONT_FAMILY_SANS).toContain("sans-serif");
        });

        it("should have popular fonts", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const lowercaseMonoFonts = FONT_FAMILY_MONO.map((f) =>
                f.toLowerCase()
            );
            expect(
                lowercaseMonoFonts.some((f) => f.includes("mono"))
            ).toBeTruthy();

            const lowercaseSansFonts = FONT_FAMILY_SANS.map((f) =>
                f.toLowerCase()
            );
            expect(
                lowercaseSansFonts.some(
                    (f) => f.includes("inter") || f.includes("system")
                )
            ).toBeTruthy();
        });
    });

    describe("Check Intervals", () => {
        it("should export CHECK_INTERVALS as array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(CHECK_INTERVALS).toBeDefined();
            expect(Array.isArray(CHECK_INTERVALS)).toBeTruthy();
            expect(CHECK_INTERVALS.length).toBeGreaterThan(0);
        });

        it("should have valid interval structure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            for (const interval of CHECK_INTERVALS) {
                expect(interval).toHaveProperty("label");
                expect(interval).toHaveProperty("value");
                expect(typeof interval.label).toBe("string");
                expect(typeof interval.value).toBe("number");
                expect(interval.label.length).toBeGreaterThan(0);
                expect(interval.value).toBeGreaterThan(0);
            }
        });

        it("should have reasonable interval values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const values = CHECK_INTERVALS.map((interval) => interval.value);
            expect(Math.min(...values)).toBeGreaterThanOrEqual(5000); // At least 5 seconds
            expect(Math.max(...values)).toBeLessThanOrEqual(2_592_000_000); // At most 30 days
        });

        it("should have sorted intervals", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const values = CHECK_INTERVALS.map((interval) => interval.value);
            for (let i = 1; i < values.length; i++) {
                const currentValue = values[i];
                const previousValue = values[i - 1];
                if (
                    currentValue !== null &&
                    previousValue !== null &&
                    previousValue !== undefined
                ) {
                    expect(currentValue).toBeGreaterThanOrEqual(previousValue);
                }
            }
        });
    });

    describe("Default Values", () => {
        it("should export DEFAULT_CHECK_INTERVAL", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(DEFAULT_CHECK_INTERVAL).toBeDefined();
            expect(typeof DEFAULT_CHECK_INTERVAL).toBe("number");
            expect(DEFAULT_CHECK_INTERVAL).toBe(
                DEFAULT_MONITOR_CHECK_INTERVAL_MS
            );
        });

        it("should export DEFAULT_REQUEST_TIMEOUT", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(DEFAULT_REQUEST_TIMEOUT).toBeDefined();
            expect(typeof DEFAULT_REQUEST_TIMEOUT).toBe("number");
            expect(DEFAULT_REQUEST_TIMEOUT).toBe(10_000); // 10 seconds
        });

        it("should export DEFAULT_REQUEST_TIMEOUT_SECONDS", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(DEFAULT_REQUEST_TIMEOUT_SECONDS).toBeDefined();
            expect(typeof DEFAULT_REQUEST_TIMEOUT_SECONDS).toBe("number");
            expect(DEFAULT_REQUEST_TIMEOUT_SECONDS).toBe(10);
        });

        it("should export DEFAULT_HISTORY_LIMIT", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(DEFAULT_HISTORY_LIMIT).toBeDefined();
            expect(typeof DEFAULT_HISTORY_LIMIT).toBe("number");
            expect(DEFAULT_HISTORY_LIMIT).toBe(500);
        });

        it("should have consistent timeout values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(DEFAULT_REQUEST_TIMEOUT).toBe(
                DEFAULT_REQUEST_TIMEOUT_SECONDS * 1000
            );
        });
    });

    describe("History Limit Options", () => {
        it("should export HISTORY_LIMIT_OPTIONS as array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(HISTORY_LIMIT_OPTIONS).toBeDefined();
            expect(Array.isArray(HISTORY_LIMIT_OPTIONS)).toBeTruthy();
            expect(HISTORY_LIMIT_OPTIONS.length).toBeGreaterThan(0);
        });

        it("should have valid history limit structure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Configuration", "type");

            for (const option of HISTORY_LIMIT_OPTIONS) {
                expect(option).toHaveProperty("label");
                expect(option).toHaveProperty("value");
                expect(typeof option.label).toBe("string");
                expect(typeof option.value).toBe("number");
                expect(option.label.length).toBeGreaterThan(0);
                expect(option.value).toBeGreaterThan(0);
            }
        });

        it("should include unlimited option", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Configuration", "type");

            const unlimitedOption = HISTORY_LIMIT_OPTIONS.find((opt) =>
                opt.label.toLowerCase().includes("unlimited")
            );
            expect(unlimitedOption).toBeDefined();
            expect(unlimitedOption?.value).toBe(Number.MAX_SAFE_INTEGER);
        });
    });

    describe("Timeout Constraints", () => {
        it("should export TIMEOUT_CONSTRAINTS", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(TIMEOUT_CONSTRAINTS).toBeDefined();
            expect(typeof TIMEOUT_CONSTRAINTS).toBe("object");
            expect(TIMEOUT_CONSTRAINTS).toHaveProperty("MIN");
            expect(TIMEOUT_CONSTRAINTS).toHaveProperty("MAX");
            expect(TIMEOUT_CONSTRAINTS).toHaveProperty("STEP");
        });

        it("should export TIMEOUT_CONSTRAINTS_MS", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(TIMEOUT_CONSTRAINTS_MS).toBeDefined();
            expect(typeof TIMEOUT_CONSTRAINTS_MS).toBe("object");
            expect(TIMEOUT_CONSTRAINTS_MS).toHaveProperty("MIN");
            expect(TIMEOUT_CONSTRAINTS_MS).toHaveProperty("MAX");
            expect(TIMEOUT_CONSTRAINTS_MS).toHaveProperty("STEP");
        });

        it("should have consistent timeout constraint values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should have reasonable timeout constraints", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(TIMEOUT_CONSTRAINTS.MIN).toBeGreaterThanOrEqual(1);
            expect(TIMEOUT_CONSTRAINTS.MAX).toBeLessThanOrEqual(300);
            expect(TIMEOUT_CONSTRAINTS.MIN).toBeLessThan(
                TIMEOUT_CONSTRAINTS.MAX
            );
        });
    });

    describe("Retry Constraints", () => {
        it("should export RETRY_CONSTRAINTS", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(RETRY_CONSTRAINTS).toBeDefined();
            expect(typeof RETRY_CONSTRAINTS).toBe("object");
            expect(RETRY_CONSTRAINTS).toHaveProperty("MIN");
            expect(RETRY_CONSTRAINTS).toHaveProperty("MAX");
            expect(RETRY_CONSTRAINTS).toHaveProperty("DEFAULT");
            expect(RETRY_CONSTRAINTS).toHaveProperty("STEP");
        });

        it("should have reasonable retry constraint values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(RETRY_CONSTRAINTS.MIN).toBe(0);
            expect(RETRY_CONSTRAINTS.MAX).toBe(10);
            expect(RETRY_CONSTRAINTS.DEFAULT).toBe(3);
            expect(RETRY_CONSTRAINTS.STEP).toBe(1);
        });

        it("should have logical retry constraints", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(RETRY_CONSTRAINTS.MIN).toBeLessThanOrEqual(
                RETRY_CONSTRAINTS.DEFAULT
            );
            expect(RETRY_CONSTRAINTS.DEFAULT).toBeLessThanOrEqual(
                RETRY_CONSTRAINTS.MAX
            );
        });
    });

    describe("UI Delays", () => {
        it("should export UI_DELAYS", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(UI_DELAYS).toBeDefined();
            expect(typeof UI_DELAYS).toBe("object");
            expect(UI_DELAYS).toHaveProperty("LOADING_BUTTON");
            expect(UI_DELAYS).toHaveProperty("LOADING_OVERLAY");
            expect(UI_DELAYS).toHaveProperty("STATE_UPDATE_DEFER");
        });

        it("should have reasonable delay values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(UI_DELAYS.LOADING_BUTTON).toBeGreaterThanOrEqual(0);
            expect(UI_DELAYS.LOADING_OVERLAY).toBeGreaterThanOrEqual(0);
            expect(UI_DELAYS.STATE_UPDATE_DEFER).toBeGreaterThanOrEqual(0);

            // Should be reasonable for UI (not too long)
            expect(UI_DELAYS.LOADING_BUTTON).toBeLessThan(1000);
            expect(UI_DELAYS.LOADING_OVERLAY).toBeLessThan(1000);
        });
    });

    describe("Chart Configuration", () => {
        it("should export CHART_TIME_PERIODS", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(CHART_TIME_PERIODS).toBeDefined();
            expect(typeof CHART_TIME_PERIODS).toBe("object");
        });

        it("should have valid chart time periods", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should export CHART_TIME_RANGES", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(CHART_TIME_RANGES).toBeDefined();
            expect(Array.isArray(CHART_TIME_RANGES)).toBeTruthy();
            expect(CHART_TIME_RANGES.length).toBeGreaterThan(0);
        });

        it("should have logical time period progression", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

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
        it("should export ARIA_LABEL", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Export Operation", "type");

            expect(ARIA_LABEL).toBeDefined();
            expect(typeof ARIA_LABEL).toBe("string");
            expect(ARIA_LABEL).toBe("aria-label");
        });
    });

    describe("Type Definitions", () => {
        it("should have valid ChartTimeRange type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should have valid IntervalOption interface usage", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const testInterval: IntervalOption = { label: "Test", value: 1000 };
            expect(testInterval).toHaveProperty("label");
            expect(testInterval).toHaveProperty("value");
            expect(typeof testInterval.label).toBe("string");
            expect(typeof testInterval.value).toBe("number");
        });
    });

    describe("Integration and Consistency", () => {
        it("should have consistent monitor types across configurations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            const fallbackTypes = FALLBACK_MONITOR_TYPE_OPTIONS.map(
                (opt) => opt.value
            );

            // Ensure all fallback types are unique
            const uniqueTypes = Array.from(new Set(fallbackTypes));
            expect(uniqueTypes).toHaveLength(fallbackTypes.length);
        });

        it("should have reasonable animation timing", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Extract timing from TRANSITION_ALL
            const timingMatch = TRANSITION_ALL.match(/(?<timing>[\d.]+)s/);
            expect(timingMatch).not.toBeNull();

            if (timingMatch && timingMatch.groups?.["timing"]) {
                const seconds = Number.parseFloat(timingMatch.groups["timing"]);
                expect(seconds).toBeGreaterThan(0);
                expect(seconds).toBeLessThan(2); // Should be reasonable for UI animations
            }
        });

        it("should have default values within constraint ranges", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

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

        it("should have check interval available in options", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const intervalValues = CHECK_INTERVALS.map(
                (interval) => interval.value
            );
            expect(intervalValues).toContain(DEFAULT_CHECK_INTERVAL);
        });

        it("should have history limit available in options", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Configuration", "type");

            const limitValues = HISTORY_LIMIT_OPTIONS.map(
                (option) => option.value
            );
            expect(limitValues).toContain(DEFAULT_HISTORY_LIMIT);
        });
    });

    describe("Error Handling and Fallbacks", () => {
        it("should handle missing constants gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

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
        it("should have valid transition timing", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(TRANSITION_ALL).toMatch(/^\w+\s+[\d.]+s\s+[\w-]+$/);
        });

        it("should have non-empty monitor type options", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Monitoring", "type");

            expect(FALLBACK_MONITOR_TYPE_OPTIONS.length).toBeGreaterThanOrEqual(
                3
            );
        });

        it("should have at least one font in families", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(FONT_FAMILY_MONO.length).toBeGreaterThanOrEqual(1);
            expect(FONT_FAMILY_SANS.length).toBeGreaterThanOrEqual(1);
        });

        it("should have reasonable default timeout values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(DEFAULT_REQUEST_TIMEOUT).toBeGreaterThan(1000); // At least 1 second
            expect(DEFAULT_REQUEST_TIMEOUT).toBeLessThan(60_000); // Less than 1 minute
        });

        it("should have reasonable default check interval", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: constants", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(DEFAULT_CHECK_INTERVAL).toBeGreaterThan(5000); // At least 5 seconds
            expect(DEFAULT_CHECK_INTERVAL).toBeLessThan(3_600_000); // Less than 1 hour
        });
    });

    describe("Property-based tests for constants validation", () => {
        test.prop([fc.array(fc.integer(), { minLength: 1 })])(
            "should maintain CHECK_INTERVALS ordering properties",
            (_randomNumbers) => {
                // The constant CHECK_INTERVALS should always be sorted
                expect(CHECK_INTERVALS).toBeDefined();
                expect(Array.isArray(CHECK_INTERVALS)).toBeTruthy();

                const sortedIntervals = CHECK_INTERVALS.toSorted(
                    (a, b) => a.value - b.value
                );
                expect(CHECK_INTERVALS).toEqual(sortedIntervals);

                // All intervals should have valid structure
                for (const interval of CHECK_INTERVALS) {
                    expect(interval).toHaveProperty("value");
                    expect(interval).toHaveProperty("label");
                    expect(typeof interval.value).toBe("number");
                    expect(typeof interval.label).toBe("string");
                    expect(interval.value).toBeGreaterThan(0);
                    expect(interval.label.length).toBeGreaterThan(0);
                }
            }
        );

        test.prop([fc.string()])(
            "should have consistent font family structure",
            () => {
                expect(Array.isArray(FONT_FAMILY_MONO)).toBeTruthy();
                expect(Array.isArray(FONT_FAMILY_SANS)).toBeTruthy();

                // All font family entries should be non-empty strings
                for (const font of FONT_FAMILY_MONO) {
                    expect(typeof font).toBe("string");
                    expect(font.length).toBeGreaterThan(0);
                }

                for (const font of FONT_FAMILY_SANS) {
                    expect(typeof font).toBe("string");
                    expect(font.length).toBeGreaterThan(0);
                }
            }
        );

        test.prop([fc.constantFrom("value", "label")])(
            "should have valid monitor type option structure",
            (property) => {
                expect(
                    Array.isArray(FALLBACK_MONITOR_TYPE_OPTIONS)
                ).toBeTruthy();
                expect(FALLBACK_MONITOR_TYPE_OPTIONS.length).toBeGreaterThan(0);

                for (const option of FALLBACK_MONITOR_TYPE_OPTIONS) {
                    expect(option).toHaveProperty(property);
                    expect(typeof option[property as keyof typeof option]).toBe(
                        "string"
                    );
                    expect(
                        (option[property as keyof typeof option] as string)
                            .length
                    ).toBeGreaterThan(0);
                }
            }
        );

        test.prop([fc.constantFrom("MIN", "MAX", "STEP")])(
            "should maintain timeout constraint invariants",
            (constraintType) => {
                expect(TIMEOUT_CONSTRAINTS).toBeDefined();
                expect(TIMEOUT_CONSTRAINTS_MS).toBeDefined();

                // Verify constraints are logically consistent
                expect(TIMEOUT_CONSTRAINTS.MIN).toBeLessThanOrEqual(
                    TIMEOUT_CONSTRAINTS.MAX
                );
                expect(TIMEOUT_CONSTRAINTS_MS.MIN).toBeLessThanOrEqual(
                    TIMEOUT_CONSTRAINTS_MS.MAX
                );

                // All values should be positive
                expect(TIMEOUT_CONSTRAINTS[constraintType]).toBeGreaterThan(0);
                expect(TIMEOUT_CONSTRAINTS_MS[constraintType]).toBeGreaterThan(
                    0
                );

                // MS values should be 1000x the second values (except STEP)
                if (constraintType === "MIN" || constraintType === "MAX") {
                    expect(TIMEOUT_CONSTRAINTS_MS[constraintType]).toBe(
                        TIMEOUT_CONSTRAINTS[constraintType] * 1000
                    );
                }
            }
        );

        test.prop([fc.integer({ min: 1, max: 100 })])(
            "should have consistent history limit options",
            (_multiplier) => {
                expect(Array.isArray(HISTORY_LIMIT_OPTIONS)).toBeTruthy();
                expect(HISTORY_LIMIT_OPTIONS.length).toBeGreaterThan(0);

                // All options should have valid structure
                for (const option of HISTORY_LIMIT_OPTIONS) {
                    expect(typeof option.value).toBe("number");
                    expect(option.value).toBeGreaterThan(0);
                    expect(typeof option.label).toBe("string");
                    expect(option.label.length).toBeGreaterThan(0);
                }

                // Should be sorted in ascending order by value
                const sortedOptions = HISTORY_LIMIT_OPTIONS.toSorted(
                    (a, b) => a.value - b.value
                );
                expect(HISTORY_LIMIT_OPTIONS).toEqual(sortedOptions);

                // Default should be within the available options
                const defaultOption = HISTORY_LIMIT_OPTIONS.find(
                    (option) => option.value === DEFAULT_HISTORY_LIMIT
                );
                expect(defaultOption).toBeDefined();
            }
        );

        test.prop([fc.constantFrom("SUCCESS", "ERROR", "WARNING", "INFO")])(
            "should have valid ARIA_LABEL structure",
            (_level) => {
                expect(ARIA_LABEL).toBeDefined();
                expect(typeof ARIA_LABEL).toBe("string");
                expect(ARIA_LABEL.length).toBeGreaterThan(0);
                expect(ARIA_LABEL).toBe("aria-label");

                // Verify it's a valid HTML attribute name
                expect(ARIA_LABEL).toMatch(/^aria-[a-z]+$/);
            }
        );

        test.prop([fc.constantFrom("retry", "attempts", "delay")])(
            "should maintain retry constraint consistency",
            (_constraintType) => {
                expect(RETRY_CONSTRAINTS).toBeDefined();

                // All retry values should be numbers
                for (const [_key, value] of Object.entries(RETRY_CONSTRAINTS)) {
                    expect(typeof value).toBe("number");
                    expect(value).toBeGreaterThanOrEqual(0); // MIN can be 0
                }

                // Verify specific constraints
                expect(RETRY_CONSTRAINTS.DEFAULT).toBeGreaterThan(0);
                expect(RETRY_CONSTRAINTS.MAX).toBeGreaterThan(
                    RETRY_CONSTRAINTS.DEFAULT
                );
                expect(RETRY_CONSTRAINTS.MIN).toBe(0); // MIN should be exactly 0

                // Max attempts should be reasonable
                expect(RETRY_CONSTRAINTS.MAX).toBeLessThanOrEqual(20);
            }
        );

        test.prop([fc.integer({ min: 1, max: 1000 })])(
            "should have consistent UI delay values",
            (_testValue) => {
                expect(UI_DELAYS).toBeDefined();

                // All UI delays should be numbers and non-negative
                for (const [_key, value] of Object.entries(UI_DELAYS)) {
                    expect(typeof value).toBe("number");
                    expect(value).toBeGreaterThanOrEqual(0); // STATE_UPDATE_DEFER can be 0
                    expect(value).toBeLessThan(10_000); // Should be reasonable for UI
                }

                // Specific validation for known delays
                expect(UI_DELAYS.LOADING_BUTTON).toBeGreaterThan(0);
                expect(UI_DELAYS.LOADING_OVERLAY).toBeGreaterThan(0);
                expect(UI_DELAYS.STATE_UPDATE_DEFER).toBe(0); // Should be exactly 0
            }
        );

        test.prop([fc.constantFrom("hours", "days", "weeks")])(
            "should have valid chart time periods structure",
            (_periodType) => {
                expect(CHART_TIME_PERIODS).toBeDefined();
                expect(CHART_TIME_RANGES).toBeDefined();

                // Chart periods should be numbers (milliseconds)
                for (const [key, period] of Object.entries(
                    CHART_TIME_PERIODS
                )) {
                    expect(typeof key).toBe("string");
                    expect(typeof period).toBe("number");
                    expect(period).toBeGreaterThan(0);
                    expect(key.length).toBeGreaterThan(0);
                }

                // Chart ranges should be valid strings
                for (const range of CHART_TIME_RANGES) {
                    expect(typeof range).toBe("string");
                    expect(range.length).toBeGreaterThan(0);
                    // Should exist in CHART_TIME_PERIODS
                    expect(CHART_TIME_PERIODS).toHaveProperty(range);
                }
            }
        );
    });
});
