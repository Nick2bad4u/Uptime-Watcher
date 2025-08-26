/**
 * Comprehensive tests for timeout utilities. Tests all timeout conversion and
 * validation functions with edge cases.
 */

import { describe, expect, it } from "vitest";

import {
    DEFAULT_REQUEST_TIMEOUT_SECONDS,
    TIMEOUT_CONSTRAINTS,
    TIMEOUT_CONSTRAINTS_MS,
} from "../../constants";
import {
    clampTimeoutMs,
    clampTimeoutSeconds,
    getTimeoutSeconds,
    isValidTimeoutMs,
    isValidTimeoutSeconds,
    timeoutMsToSeconds,
    timeoutSecondsToMs,
} from "../../utils/timeoutUtils";

describe("Timeout Utilities", () => {
    describe("clampTimeoutMs", () => {
        it("should return the input when within valid range", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const validTimeout = 30_000; // 30 seconds
            expect(clampTimeoutMs(validTimeout)).toBe(validTimeout);
        });

        it("should clamp to minimum when below range", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const belowMin = TIMEOUT_CONSTRAINTS_MS.MIN - 1000;
            expect(clampTimeoutMs(belowMin)).toBe(TIMEOUT_CONSTRAINTS_MS.MIN);
        });

        it("should clamp to maximum when above range", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const aboveMax = TIMEOUT_CONSTRAINTS_MS.MAX + 1000;
            expect(clampTimeoutMs(aboveMax)).toBe(TIMEOUT_CONSTRAINTS_MS.MAX);
        });

        it("should handle edge values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(clampTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MIN)).toBe(
                TIMEOUT_CONSTRAINTS_MS.MIN
            );
            expect(clampTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MAX)).toBe(
                TIMEOUT_CONSTRAINTS_MS.MAX
            );
        });

        it("should handle zero and negative values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(clampTimeoutMs(0)).toBe(TIMEOUT_CONSTRAINTS_MS.MIN);
            expect(clampTimeoutMs(-5000)).toBe(TIMEOUT_CONSTRAINTS_MS.MIN);
        });

        it("should handle fractional values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const fractional = 15_000.5;
            expect(clampTimeoutMs(fractional)).toBe(fractional);
        });
    });

    describe("clampTimeoutSeconds", () => {
        it("should return the input when within valid range", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const validTimeout = 30; // 30 seconds
            expect(clampTimeoutSeconds(validTimeout)).toBe(validTimeout);
        });

        it("should clamp to minimum when below range", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const belowMin = TIMEOUT_CONSTRAINTS.MIN - 1;
            expect(clampTimeoutSeconds(belowMin)).toBe(TIMEOUT_CONSTRAINTS.MIN);
        });

        it("should clamp to maximum when above range", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const aboveMax = TIMEOUT_CONSTRAINTS.MAX + 1;
            expect(clampTimeoutSeconds(aboveMax)).toBe(TIMEOUT_CONSTRAINTS.MAX);
        });

        it("should handle edge values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(clampTimeoutSeconds(TIMEOUT_CONSTRAINTS.MIN)).toBe(
                TIMEOUT_CONSTRAINTS.MIN
            );
            expect(clampTimeoutSeconds(TIMEOUT_CONSTRAINTS.MAX)).toBe(
                TIMEOUT_CONSTRAINTS.MAX
            );
        });

        it("should handle zero and negative values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(clampTimeoutSeconds(0)).toBe(TIMEOUT_CONSTRAINTS.MIN);
            expect(clampTimeoutSeconds(-5)).toBe(TIMEOUT_CONSTRAINTS.MIN);
        });

        it("should handle fractional values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const fractional = 15.5;
            expect(clampTimeoutSeconds(fractional)).toBe(fractional);
        });
    });

    describe("getTimeoutSeconds", () => {
        it("should convert monitor timeout from ms to seconds", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const timeoutMs = 15_000; // 15 seconds
            expect(getTimeoutSeconds(timeoutMs)).toBe(15);
        });

        it("should return default when monitor timeout is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            expect(getTimeoutSeconds()).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
            expect(getTimeoutSeconds(undefined)).toBe(
                DEFAULT_REQUEST_TIMEOUT_SECONDS
            );
        });

        it("should handle zero timeout", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getTimeoutSeconds(0)).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
        });

        it("should handle fractional milliseconds", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getTimeoutSeconds(1500)).toBe(1.5);
        });

        it("should handle large timeout values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getTimeoutSeconds(60_000)).toBe(60);
        });
    });

    describe("isValidTimeoutMs", () => {
        it("should return true for valid timeout values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimeoutMs(5000)).toBe(true);
            expect(isValidTimeoutMs(30_000)).toBe(true);
            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MIN)).toBe(true);
            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MAX)).toBe(true);
        });

        it("should return false for values below minimum", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MIN - 1)).toBe(
                false
            );
            expect(isValidTimeoutMs(0)).toBe(false);
            expect(isValidTimeoutMs(-1000)).toBe(false);
        });

        it("should return false for values above maximum", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MAX + 1)).toBe(
                false
            );
            expect(isValidTimeoutMs(Number.MAX_SAFE_INTEGER)).toBe(false);
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimeoutMs(Number.POSITIVE_INFINITY)).toBe(false);
            expect(isValidTimeoutMs(Number.NEGATIVE_INFINITY)).toBe(false);
            expect(isValidTimeoutMs(Number.NaN)).toBe(false);
        });

        it("should handle fractional values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const fractionalValid = TIMEOUT_CONSTRAINTS_MS.MIN + 0.5;
            expect(isValidTimeoutMs(fractionalValid)).toBe(true);
        });
    });

    describe("isValidTimeoutSeconds", () => {
        it("should return true for valid timeout values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimeoutSeconds(5)).toBe(true);
            expect(isValidTimeoutSeconds(30)).toBe(true);
            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MIN)).toBe(true);
            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MAX)).toBe(true);
        });

        it("should return false for values below minimum", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MIN - 1)).toBe(
                false
            );
            expect(isValidTimeoutSeconds(0)).toBe(false);
            expect(isValidTimeoutSeconds(-1)).toBe(false);
        });

        it("should return false for values above maximum", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MAX + 1)).toBe(
                false
            );
            expect(isValidTimeoutSeconds(Number.MAX_SAFE_INTEGER)).toBe(false);
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(isValidTimeoutSeconds(Number.POSITIVE_INFINITY)).toBe(false);
            expect(isValidTimeoutSeconds(Number.NEGATIVE_INFINITY)).toBe(false);
            expect(isValidTimeoutSeconds(Number.NaN)).toBe(false);
        });

        it("should handle fractional values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const fractionalValid = TIMEOUT_CONSTRAINTS.MIN + 0.5;
            expect(isValidTimeoutSeconds(fractionalValid)).toBe(true);
        });
    });

    describe("timeoutMsToSeconds", () => {
        it("should convert milliseconds to seconds correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutMsToSeconds(1000)).toBe(1);
            expect(timeoutMsToSeconds(5000)).toBe(5);
            expect(timeoutMsToSeconds(30_000)).toBe(30);
        });

        it("should handle zero", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutMsToSeconds(0)).toBe(0);
        });

        it("should handle fractional milliseconds", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutMsToSeconds(1500)).toBe(1.5);
            expect(timeoutMsToSeconds(2750)).toBe(2.75);
        });

        it("should handle large values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutMsToSeconds(60_000)).toBe(60);
            expect(timeoutMsToSeconds(300_000)).toBe(300);
        });

        it("should preserve precision for small values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutMsToSeconds(1)).toBe(0.001);
            expect(timeoutMsToSeconds(100)).toBe(0.1);
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutMsToSeconds(Number.MAX_SAFE_INTEGER)).toBe(
                Number.MAX_SAFE_INTEGER / 1000
            );
            expect(timeoutMsToSeconds(Number.MIN_VALUE)).toBe(
                Number.MIN_VALUE / 1000
            );
        });
    });

    describe("timeoutSecondsToMs", () => {
        it("should convert seconds to milliseconds correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(1)).toBe(1000);
            expect(timeoutSecondsToMs(5)).toBe(5000);
            expect(timeoutSecondsToMs(30)).toBe(30_000);
        });

        it("should handle zero", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(0)).toBe(0);
        });

        it("should handle fractional seconds", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(1.5)).toBe(1500);
            expect(timeoutSecondsToMs(2.75)).toBe(2750);
        });

        it("should handle large values", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(60)).toBe(60_000);
            expect(timeoutSecondsToMs(300)).toBe(300_000);
        });

        it("should preserve precision for small values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(0.001)).toBe(1);
            expect(timeoutSecondsToMs(0.1)).toBe(100);
        });

        it("should handle edge cases", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(timeoutSecondsToMs(Number.MAX_SAFE_INTEGER)).toBe(
                Number.MAX_SAFE_INTEGER * 1000
            );
            expect(timeoutSecondsToMs(Number.MIN_VALUE)).toBe(
                Number.MIN_VALUE * 1000
            );
        });
    });

    describe("Conversion consistency", () => {
        it("should maintain round-trip conversion accuracy", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const originalMs = 15_000;
            const convertedSeconds = timeoutMsToSeconds(originalMs);
            const backToMs = timeoutSecondsToMs(convertedSeconds);
            expect(backToMs).toBe(originalMs);
        });

        it("should maintain round-trip conversion for fractional values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const originalSeconds = 15.5;
            const convertedMs = timeoutSecondsToMs(originalSeconds);
            const backToSeconds = timeoutMsToSeconds(convertedMs);
            expect(backToSeconds).toBe(originalSeconds);
        });
    });

    describe("Integration with constants", () => {
        it("should work correctly with constraint constants", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test that MIN/MAX constants work with validation functions
            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MIN)).toBe(true);
            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MAX)).toBe(true);
            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MIN)).toBe(true);
            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MAX)).toBe(true);

            // Test conversion consistency with constants
            expect(timeoutSecondsToMs(TIMEOUT_CONSTRAINTS.MIN)).toBe(
                TIMEOUT_CONSTRAINTS_MS.MIN
            );
            expect(timeoutSecondsToMs(TIMEOUT_CONSTRAINTS.MAX)).toBe(
                TIMEOUT_CONSTRAINTS_MS.MAX
            );
        });

        it("should work correctly with default timeout constant", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: timeoutUtils", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(getTimeoutSeconds()).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
            expect(isValidTimeoutSeconds(DEFAULT_REQUEST_TIMEOUT_SECONDS)).toBe(
                true
            );
        });
    });
});
