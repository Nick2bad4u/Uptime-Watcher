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
        it("should return the input when within valid range", () => {
            const validTimeout = 30_000; // 30 seconds
            expect(clampTimeoutMs(validTimeout)).toBe(validTimeout);
        });

        it("should clamp to minimum when below range", () => {
            const belowMin = TIMEOUT_CONSTRAINTS_MS.MIN - 1000;
            expect(clampTimeoutMs(belowMin)).toBe(TIMEOUT_CONSTRAINTS_MS.MIN);
        });

        it("should clamp to maximum when above range", () => {
            const aboveMax = TIMEOUT_CONSTRAINTS_MS.MAX + 1000;
            expect(clampTimeoutMs(aboveMax)).toBe(TIMEOUT_CONSTRAINTS_MS.MAX);
        });

        it("should handle edge values", () => {
            expect(clampTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MIN)).toBe(
                TIMEOUT_CONSTRAINTS_MS.MIN
            );
            expect(clampTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MAX)).toBe(
                TIMEOUT_CONSTRAINTS_MS.MAX
            );
        });

        it("should handle zero and negative values", () => {
            expect(clampTimeoutMs(0)).toBe(TIMEOUT_CONSTRAINTS_MS.MIN);
            expect(clampTimeoutMs(-5000)).toBe(TIMEOUT_CONSTRAINTS_MS.MIN);
        });

        it("should handle fractional values", () => {
            const fractional = 15_000.5;
            expect(clampTimeoutMs(fractional)).toBe(fractional);
        });
    });

    describe("clampTimeoutSeconds", () => {
        it("should return the input when within valid range", () => {
            const validTimeout = 30; // 30 seconds
            expect(clampTimeoutSeconds(validTimeout)).toBe(validTimeout);
        });

        it("should clamp to minimum when below range", () => {
            const belowMin = TIMEOUT_CONSTRAINTS.MIN - 1;
            expect(clampTimeoutSeconds(belowMin)).toBe(TIMEOUT_CONSTRAINTS.MIN);
        });

        it("should clamp to maximum when above range", () => {
            const aboveMax = TIMEOUT_CONSTRAINTS.MAX + 1;
            expect(clampTimeoutSeconds(aboveMax)).toBe(TIMEOUT_CONSTRAINTS.MAX);
        });

        it("should handle edge values", () => {
            expect(clampTimeoutSeconds(TIMEOUT_CONSTRAINTS.MIN)).toBe(
                TIMEOUT_CONSTRAINTS.MIN
            );
            expect(clampTimeoutSeconds(TIMEOUT_CONSTRAINTS.MAX)).toBe(
                TIMEOUT_CONSTRAINTS.MAX
            );
        });

        it("should handle zero and negative values", () => {
            expect(clampTimeoutSeconds(0)).toBe(TIMEOUT_CONSTRAINTS.MIN);
            expect(clampTimeoutSeconds(-5)).toBe(TIMEOUT_CONSTRAINTS.MIN);
        });

        it("should handle fractional values", () => {
            const fractional = 15.5;
            expect(clampTimeoutSeconds(fractional)).toBe(fractional);
        });
    });

    describe("getTimeoutSeconds", () => {
        it("should convert monitor timeout from ms to seconds", () => {
            const timeoutMs = 15_000; // 15 seconds
            expect(getTimeoutSeconds(timeoutMs)).toBe(15);
        });

        it("should return default when monitor timeout is undefined", () => {
            expect(getTimeoutSeconds()).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
            expect(getTimeoutSeconds(undefined)).toBe(
                DEFAULT_REQUEST_TIMEOUT_SECONDS
            );
        });

        it("should handle zero timeout", () => {
            expect(getTimeoutSeconds(0)).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
        });

        it("should handle fractional milliseconds", () => {
            expect(getTimeoutSeconds(1500)).toBe(1.5);
        });

        it("should handle large timeout values", () => {
            expect(getTimeoutSeconds(60_000)).toBe(60);
        });
    });

    describe("isValidTimeoutMs", () => {
        it("should return true for valid timeout values", () => {
            expect(isValidTimeoutMs(5000)).toBe(true);
            expect(isValidTimeoutMs(30_000)).toBe(true);
            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MIN)).toBe(true);
            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MAX)).toBe(true);
        });

        it("should return false for values below minimum", () => {
            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MIN - 1)).toBe(
                false
            );
            expect(isValidTimeoutMs(0)).toBe(false);
            expect(isValidTimeoutMs(-1000)).toBe(false);
        });

        it("should return false for values above maximum", () => {
            expect(isValidTimeoutMs(TIMEOUT_CONSTRAINTS_MS.MAX + 1)).toBe(
                false
            );
            expect(isValidTimeoutMs(Number.MAX_SAFE_INTEGER)).toBe(false);
        });

        it("should handle edge cases", () => {
            expect(isValidTimeoutMs(Number.POSITIVE_INFINITY)).toBe(false);
            expect(isValidTimeoutMs(Number.NEGATIVE_INFINITY)).toBe(false);
            expect(isValidTimeoutMs(Number.NaN)).toBe(false);
        });

        it("should handle fractional values", () => {
            const fractionalValid = TIMEOUT_CONSTRAINTS_MS.MIN + 0.5;
            expect(isValidTimeoutMs(fractionalValid)).toBe(true);
        });
    });

    describe("isValidTimeoutSeconds", () => {
        it("should return true for valid timeout values", () => {
            expect(isValidTimeoutSeconds(5)).toBe(true);
            expect(isValidTimeoutSeconds(30)).toBe(true);
            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MIN)).toBe(true);
            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MAX)).toBe(true);
        });

        it("should return false for values below minimum", () => {
            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MIN - 1)).toBe(
                false
            );
            expect(isValidTimeoutSeconds(0)).toBe(false);
            expect(isValidTimeoutSeconds(-1)).toBe(false);
        });

        it("should return false for values above maximum", () => {
            expect(isValidTimeoutSeconds(TIMEOUT_CONSTRAINTS.MAX + 1)).toBe(
                false
            );
            expect(isValidTimeoutSeconds(Number.MAX_SAFE_INTEGER)).toBe(false);
        });

        it("should handle edge cases", () => {
            expect(isValidTimeoutSeconds(Number.POSITIVE_INFINITY)).toBe(false);
            expect(isValidTimeoutSeconds(Number.NEGATIVE_INFINITY)).toBe(false);
            expect(isValidTimeoutSeconds(Number.NaN)).toBe(false);
        });

        it("should handle fractional values", () => {
            const fractionalValid = TIMEOUT_CONSTRAINTS.MIN + 0.5;
            expect(isValidTimeoutSeconds(fractionalValid)).toBe(true);
        });
    });

    describe("timeoutMsToSeconds", () => {
        it("should convert milliseconds to seconds correctly", () => {
            expect(timeoutMsToSeconds(1000)).toBe(1);
            expect(timeoutMsToSeconds(5000)).toBe(5);
            expect(timeoutMsToSeconds(30_000)).toBe(30);
        });

        it("should handle zero", () => {
            expect(timeoutMsToSeconds(0)).toBe(0);
        });

        it("should handle fractional milliseconds", () => {
            expect(timeoutMsToSeconds(1500)).toBe(1.5);
            expect(timeoutMsToSeconds(2750)).toBe(2.75);
        });

        it("should handle large values", () => {
            expect(timeoutMsToSeconds(60_000)).toBe(60);
            expect(timeoutMsToSeconds(300_000)).toBe(300);
        });

        it("should preserve precision for small values", () => {
            expect(timeoutMsToSeconds(1)).toBe(0.001);
            expect(timeoutMsToSeconds(100)).toBe(0.1);
        });

        it("should handle edge cases", () => {
            expect(timeoutMsToSeconds(Number.MAX_SAFE_INTEGER)).toBe(
                Number.MAX_SAFE_INTEGER / 1000
            );
            expect(timeoutMsToSeconds(Number.MIN_VALUE)).toBe(
                Number.MIN_VALUE / 1000
            );
        });
    });

    describe("timeoutSecondsToMs", () => {
        it("should convert seconds to milliseconds correctly", () => {
            expect(timeoutSecondsToMs(1)).toBe(1000);
            expect(timeoutSecondsToMs(5)).toBe(5000);
            expect(timeoutSecondsToMs(30)).toBe(30_000);
        });

        it("should handle zero", () => {
            expect(timeoutSecondsToMs(0)).toBe(0);
        });

        it("should handle fractional seconds", () => {
            expect(timeoutSecondsToMs(1.5)).toBe(1500);
            expect(timeoutSecondsToMs(2.75)).toBe(2750);
        });

        it("should handle large values", () => {
            expect(timeoutSecondsToMs(60)).toBe(60_000);
            expect(timeoutSecondsToMs(300)).toBe(300_000);
        });

        it("should preserve precision for small values", () => {
            expect(timeoutSecondsToMs(0.001)).toBe(1);
            expect(timeoutSecondsToMs(0.1)).toBe(100);
        });

        it("should handle edge cases", () => {
            expect(timeoutSecondsToMs(Number.MAX_SAFE_INTEGER)).toBe(
                Number.MAX_SAFE_INTEGER * 1000
            );
            expect(timeoutSecondsToMs(Number.MIN_VALUE)).toBe(
                Number.MIN_VALUE * 1000
            );
        });
    });

    describe("Conversion consistency", () => {
        it("should maintain round-trip conversion accuracy", () => {
            const originalMs = 15_000;
            const convertedSeconds = timeoutMsToSeconds(originalMs);
            const backToMs = timeoutSecondsToMs(convertedSeconds);
            expect(backToMs).toBe(originalMs);
        });

        it("should maintain round-trip conversion for fractional values", () => {
            const originalSeconds = 15.5;
            const convertedMs = timeoutSecondsToMs(originalSeconds);
            const backToSeconds = timeoutMsToSeconds(convertedMs);
            expect(backToSeconds).toBe(originalSeconds);
        });
    });

    describe("Integration with constants", () => {
        it("should work correctly with constraint constants", () => {
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

        it("should work correctly with default timeout constant", () => {
            expect(getTimeoutSeconds()).toBe(DEFAULT_REQUEST_TIMEOUT_SECONDS);
            expect(isValidTimeoutSeconds(DEFAULT_REQUEST_TIMEOUT_SECONDS)).toBe(
                true
            );
        });
    });
});
