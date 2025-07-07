/**
 * Comprehensive tests for application constants.
 * Verifies that all constants are properly defined and have expected values.
 */

import { describe, expect, it } from "vitest";

import {
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
    ARIA_LABEL,
    TRANSITION_ALL,
    type IntervalOption,
    type StatusType,
} from "../constants";

describe("Constants", () => {
    describe("Font Families", () => {
        it("exports monospace font family", () => {
            expect(FONT_FAMILY_MONO).toBeDefined();
            expect(Array.isArray(FONT_FAMILY_MONO)).toBe(true);
            expect(FONT_FAMILY_MONO.length).toBeGreaterThan(0);
            expect(FONT_FAMILY_MONO).toContain("SF Mono");
            expect(FONT_FAMILY_MONO).toContain("monospace");
        });

        it("exports sans serif font family", () => {
            expect(FONT_FAMILY_SANS).toBeDefined();
            expect(Array.isArray(FONT_FAMILY_SANS)).toBe(true);
            expect(FONT_FAMILY_SANS.length).toBeGreaterThan(0);
            expect(FONT_FAMILY_SANS).toContain("Inter");
            expect(FONT_FAMILY_SANS).toContain("sans-serif");
        });
    });

    describe("Check Intervals", () => {
        it("has a valid array of check intervals", () => {
            expect(CHECK_INTERVALS).toBeDefined();
            expect(Array.isArray(CHECK_INTERVALS)).toBe(true);
            expect(CHECK_INTERVALS.length).toBeGreaterThan(0);
        });

        it("has intervals with required properties", () => {
            CHECK_INTERVALS.forEach((interval: IntervalOption) => {
                expect(interval).toHaveProperty("value");
                expect(interval).toHaveProperty("label");
                expect(typeof interval.value).toBe("number");
                expect(typeof interval.label).toBe("string");
                expect(interval.value).toBeGreaterThan(0);
                expect(interval.label.length).toBeGreaterThan(0);
            });
        });

        it("has intervals in ascending order", () => {
            for (let i = 1; i < CHECK_INTERVALS.length; i++) {
                const current = CHECK_INTERVALS[i];
                const previous = CHECK_INTERVALS[i - 1];
                expect(current?.value).toBeGreaterThan(previous?.value ?? 0);
            }
        });

        it("includes expected short intervals", () => {
            const hasSeconds = CHECK_INTERVALS.some((interval) => interval.label.includes("seconds"));
            const hasMinutes = CHECK_INTERVALS.some((interval) => interval.label.includes("minute"));
            const hasHours = CHECK_INTERVALS.some((interval) => interval.label.includes("hour"));

            expect(hasSeconds).toBe(true);
            expect(hasMinutes).toBe(true);
            expect(hasHours).toBe(true);
        });
    });

    describe("Default Values", () => {
        it("defines default check interval", () => {
            expect(DEFAULT_CHECK_INTERVAL).toBe(300000); // 5 minutes
            expect(typeof DEFAULT_CHECK_INTERVAL).toBe("number");
        });

        it("defines default request timeout", () => {
            expect(DEFAULT_REQUEST_TIMEOUT).toBe(10000); // 10 seconds
            expect(typeof DEFAULT_REQUEST_TIMEOUT).toBe("number");
        });

        it("defines default request timeout in seconds", () => {
            expect(DEFAULT_REQUEST_TIMEOUT_SECONDS).toBe(10);
            expect(typeof DEFAULT_REQUEST_TIMEOUT_SECONDS).toBe("number");
        });

        it("defines default history limit", () => {
            expect(DEFAULT_HISTORY_LIMIT).toBe(500);
            expect(typeof DEFAULT_HISTORY_LIMIT).toBe("number");
        });

        it("has consistent timeout values", () => {
            expect(DEFAULT_REQUEST_TIMEOUT).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS * 1000);
        });
    });

    describe("History Limit Options", () => {
        it("has valid history limit options", () => {
            expect(HISTORY_LIMIT_OPTIONS).toBeDefined();
            expect(Array.isArray(HISTORY_LIMIT_OPTIONS)).toBe(true);
            expect(HISTORY_LIMIT_OPTIONS.length).toBeGreaterThan(0);
        });

        it("has options with required properties", () => {
            HISTORY_LIMIT_OPTIONS.forEach((option: IntervalOption) => {
                expect(option).toHaveProperty("value");
                expect(option).toHaveProperty("label");
                expect(typeof option.value).toBe("number");
                expect(typeof option.label).toBe("string");
                expect(option.value).toBeGreaterThan(0);
            });
        });

        it("includes unlimited option", () => {
            const unlimitedOption = HISTORY_LIMIT_OPTIONS.find((option) => option.label === "Unlimited");
            expect(unlimitedOption).toBeDefined();
            expect(unlimitedOption?.value).toBe(Number.MAX_SAFE_INTEGER);
        });
    });

    describe("Timeout Constraints", () => {
        it("defines timeout constraints", () => {
            expect(TIMEOUT_CONSTRAINTS.MAX).toBe(300);
            expect(TIMEOUT_CONSTRAINTS.MIN).toBe(1);
            expect(TIMEOUT_CONSTRAINTS.STEP).toBe(1);
        });

        it("defines timeout constraints in milliseconds", () => {
            expect(TIMEOUT_CONSTRAINTS_MS.MAX).toBe(300000);
            expect(TIMEOUT_CONSTRAINTS_MS.MIN).toBe(1000);
            expect(TIMEOUT_CONSTRAINTS_MS.STEP).toBe(1000);
        });

        it("has consistent timeout constraints", () => {
            expect(TIMEOUT_CONSTRAINTS_MS.MAX).toBe(TIMEOUT_CONSTRAINTS.MAX * 1000);
            expect(TIMEOUT_CONSTRAINTS_MS.MIN).toBe(TIMEOUT_CONSTRAINTS.MIN * 1000);
            expect(TIMEOUT_CONSTRAINTS_MS.STEP).toBe(TIMEOUT_CONSTRAINTS.STEP * 1000);
        });

        it("has valid constraint ranges", () => {
            expect(TIMEOUT_CONSTRAINTS.MIN).toBeLessThan(TIMEOUT_CONSTRAINTS.MAX);
            expect(TIMEOUT_CONSTRAINTS_MS.MIN).toBeLessThan(TIMEOUT_CONSTRAINTS_MS.MAX);
        });
    });

    describe("Retry Constraints", () => {
        it("defines retry constraints", () => {
            expect(RETRY_CONSTRAINTS.DEFAULT).toBe(0);
            expect(RETRY_CONSTRAINTS.MAX).toBe(10);
            expect(RETRY_CONSTRAINTS.MIN).toBe(0);
            expect(RETRY_CONSTRAINTS.STEP).toBe(1);
        });

        it("has valid retry constraint ranges", () => {
            expect(RETRY_CONSTRAINTS.MIN).toBeLessThanOrEqual(RETRY_CONSTRAINTS.DEFAULT);
            expect(RETRY_CONSTRAINTS.DEFAULT).toBeLessThanOrEqual(RETRY_CONSTRAINTS.MAX);
            expect(RETRY_CONSTRAINTS.MIN).toBeLessThan(RETRY_CONSTRAINTS.MAX);
        });
    });

    describe("UI Delays", () => {
        it("defines loading button delay", () => {
            expect(UI_DELAYS.LOADING_BUTTON).toBe(100);
        });

        it("defines loading overlay delay", () => {
            expect(UI_DELAYS.LOADING_OVERLAY).toBe(100);
        });

        it("has positive delay values", () => {
            for (const delay of Object.values(UI_DELAYS)) {
                expect(delay).toBeGreaterThan(0);
                expect(typeof delay).toBe("number");
            }
        });
    });

    describe("Chart Time Periods", () => {
        it("defines chart time periods", () => {
            expect(CHART_TIME_PERIODS["1h"]).toBe(60 * 60 * 1000);
            expect(CHART_TIME_PERIODS["12h"]).toBe(12 * 60 * 60 * 1000);
            expect(CHART_TIME_PERIODS["24h"]).toBe(24 * 60 * 60 * 1000);
            expect(CHART_TIME_PERIODS["7d"]).toBe(7 * 24 * 60 * 60 * 1000);
            expect(CHART_TIME_PERIODS["30d"]).toBe(30 * 24 * 60 * 60 * 1000);
        });

        it("has periods in ascending order", () => {
            const periods = Object.values(CHART_TIME_PERIODS);
            for (let i = 1; i < periods.length; i++) {
                const current = periods[i];
                const previous = periods[i - 1];
                expect(current).toBeGreaterThan(previous ?? 0);
            }
        });

        it("has valid time period keys", () => {
            const expectedKeys = ["1h", "12h", "24h", "7d", "30d"];
            const actualKeys = Object.keys(CHART_TIME_PERIODS);
            expect(actualKeys).toEqual(expectedKeys);
        });
    });

    describe("Accessibility Constants", () => {
        it("defines ARIA label constant", () => {
            expect(ARIA_LABEL).toBe("aria-label");
        });
    });

    describe("Animation Constants", () => {
        it("defines transition timing", () => {
            expect(TRANSITION_ALL).toBe("all 0.2s ease-in-out");
            expect(typeof TRANSITION_ALL).toBe("string");
        });
    });

    describe("Type Definitions", () => {
        it("StatusType covers expected values", () => {
            const validStatuses: StatusType[] = ["up", "down", "pending", "unknown"];
            for (const status of validStatuses) {
                const testStatus: StatusType = status;
                expect(testStatus).toBe(status);
            }
        });

        it("IntervalOption has correct structure", () => {
            const testOption: IntervalOption = { label: "5 seconds", value: 5000 };
            expect(testOption.value).toBe(5000);
            expect(testOption.label).toBe("5 seconds");
        });
    });

    describe("Constants relationships", () => {
        it("default check interval exists in check intervals", () => {
            const hasDefaultInterval = CHECK_INTERVALS.some((interval) => interval.value === DEFAULT_CHECK_INTERVAL);
            expect(hasDefaultInterval).toBe(true);
        });

        it("default history limit exists in history limit options", () => {
            const hasDefaultLimit = HISTORY_LIMIT_OPTIONS.some((option) => option.value === DEFAULT_HISTORY_LIMIT);
            expect(hasDefaultLimit).toBe(true);
        });

        it("all values are properly typed", () => {
            expect(typeof DEFAULT_CHECK_INTERVAL).toBe("number");
            expect(typeof DEFAULT_REQUEST_TIMEOUT).toBe("number");
            expect(typeof DEFAULT_REQUEST_TIMEOUT_SECONDS).toBe("number");
            expect(typeof DEFAULT_HISTORY_LIMIT).toBe("number");
            expect(typeof ARIA_LABEL).toBe("string");
            expect(typeof TRANSITION_ALL).toBe("string");
        });
    });
});
