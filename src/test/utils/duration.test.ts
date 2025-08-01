/**
 * Tests for duration utility functions
 *
 * @fileoverview Comprehensive tests covering all branches and edge cases
 * for duration calculation utilities.
 */

import { describe, it, expect } from "vitest";
import { calculateMaxDuration } from "../../utils/duration";

describe("Duration Utilities", () => {
    describe("calculateMaxDuration", () => {
        describe("Basic functionality", () => {
            it("should calculate duration with no retry attempts", () => {
                const result = calculateMaxDuration(10, 0);
                // timeout: 10 seconds * 1 attempt = 10 seconds
                // backoff: 0 (no retries)
                // total: 10 seconds
                expect(result).toBe("10s");
            });

            it("should calculate duration with single retry attempt", () => {
                const result = calculateMaxDuration(5, 1);
                // timeout: 5 seconds * 2 attempts = 10 seconds
                // backoff: 0.5 seconds (first retry)
                // total: Math.ceil(10.5) = 11 seconds
                expect(result).toBe("11s");
            });

            it("should calculate duration with multiple retry attempts", () => {
                const result = calculateMaxDuration(2, 3);
                // timeout: 2 seconds * 4 attempts = 8 seconds
                // backoff: 0.5 + 1.0 + 2.0 = 3.5 seconds
                // total: Math.ceil(11.5) = 12 seconds
                expect(result).toBe("12s");
            });
        });

        describe("Exponential backoff calculation", () => {
            it("should calculate correct backoff for first few retries", () => {
                const result = calculateMaxDuration(1, 2);
                // timeout: 1 second * 3 attempts = 3 seconds
                // backoff: 0.5 + 1.0 = 1.5 seconds
                // total: Math.ceil(4.5) = 5 seconds
                expect(result).toBe("5s");
            });

            it("should cap backoff at 5 seconds per retry", () => {
                const result = calculateMaxDuration(1, 5);
                // timeout: 1 second * 6 attempts = 6 seconds
                // backoff: 0.5 + 1.0 + 2.0 + 4.0 + 5.0 = 12.5 seconds (4th retry capped at 5s)
                // total: Math.ceil(18.5) = 19 seconds
                expect(result).toBe("19s");
            });

            it("should handle very high retry counts with capped backoff", () => {
                const result = calculateMaxDuration(1, 10);
                // timeout: 1 second * 11 attempts = 11 seconds
                // backoff: 0.5 + 1.0 + 2.0 + 4.0 + 5.0 + 5.0 + 5.0 + 5.0 + 5.0 + 5.0 = 37.5 seconds
                // total: Math.ceil(48.5) = 49 seconds
                expect(result).toBe("49s");
            });
        });

        describe("Duration formatting - seconds", () => {
            it("should format short durations in seconds", () => {
                expect(calculateMaxDuration(1, 0)).toBe("1s");
                expect(calculateMaxDuration(30, 0)).toBe("30s");
                expect(calculateMaxDuration(59, 0)).toBe("59s");
            });

            it("should format exactly 60 seconds as minutes", () => {
                const result = calculateMaxDuration(60, 0);
                // 60 seconds = 1 minute
                expect(result).toBe("1m");
            });
        });

        describe("Duration formatting - minutes", () => {
            it("should format durations between 1-59 minutes", () => {
                const result1 = calculateMaxDuration(61, 0);
                // 61 seconds = Math.ceil(61/60) = 2 minutes
                expect(result1).toBe("2m");

                const result2 = calculateMaxDuration(120, 0);
                // 120 seconds = Math.ceil(120/60) = 2 minutes
                expect(result2).toBe("2m");

                const result3 = calculateMaxDuration(3540, 0);
                // 3540 seconds = Math.ceil(3540/60) = 59 minutes
                expect(result3).toBe("59m");
            });

            it("should handle duration that rounds up to next minute", () => {
                const result = calculateMaxDuration(119, 0);
                // 119 seconds = Math.ceil(119/60) = 2 minutes
                expect(result).toBe("2m");
            });

            it("should format exactly 3600 seconds as hours", () => {
                const result = calculateMaxDuration(3600, 0);
                // 3600 seconds = 1 hour
                expect(result).toBe("1h");
            });
        });

        describe("Duration formatting - hours", () => {
            it("should format durations over 1 hour", () => {
                const result1 = calculateMaxDuration(3601, 0);
                // 3601 seconds = Math.ceil(3601/3600) = 2 hours
                expect(result1).toBe("2h");

                const result2 = calculateMaxDuration(7200, 0);
                // 7200 seconds = Math.ceil(7200/3600) = 2 hours
                expect(result2).toBe("2h");

                const result3 = calculateMaxDuration(10800, 0);
                // 10800 seconds = Math.ceil(10800/3600) = 3 hours
                expect(result3).toBe("3h");
            });

            it("should handle very large durations", () => {
                const result = calculateMaxDuration(86400, 0);
                // 86400 seconds = 24 hours
                expect(result).toBe("24h");
            });
        });

        describe("Edge cases", () => {
            it("should handle zero timeout", () => {
                const result = calculateMaxDuration(0, 0);
                // 0 seconds timeout still has 1 attempt
                expect(result).toBe("0s");
            });

            it("should handle zero timeout with retries", () => {
                const result = calculateMaxDuration(0, 2);
                // timeout: 0 * 3 = 0 seconds
                // backoff: 0.5 + 1.0 = 1.5 seconds
                // total: Math.ceil(1.5) = 2 seconds
                expect(result).toBe("2s");
            });

            it("should handle fractional timeout values", () => {
                const result = calculateMaxDuration(1.5, 1);
                // timeout: 1.5 * 2 = 3 seconds
                // backoff: 0.5 seconds
                // total: Math.ceil(3.5) = 4 seconds
                expect(result).toBe("4s");
            });

            it("should handle large timeout values", () => {
                const result = calculateMaxDuration(1800, 0);
                // 1800 seconds = Math.ceil(1800/60) = 30 minutes
                expect(result).toBe("30m");
            });

            it("should handle large retry counts", () => {
                const result = calculateMaxDuration(10, 20);
                // timeout: 10 * 21 = 210 seconds
                // backoff: significant amount with capping at 5s per retry
                // This should result in minutes
                expect(result).toMatch(/^\d+m$/);
            });
        });

        describe("Real-world scenarios", () => {
            it("should handle typical monitoring scenarios", () => {
                // Common scenario: 30 second timeout, 3 retries
                const result1 = calculateMaxDuration(30, 3);
                expect(result1).toMatch(/^\d+[sm]$/);

                // Quick check scenario: 5 second timeout, 1 retry
                const result2 = calculateMaxDuration(5, 1);
                expect(result2).toBe("11s");

                // Long running check: 2 minute timeout, 2 retries
                const result3 = calculateMaxDuration(120, 2);
                expect(result3).toMatch(/^\d+m$/);
            });

            it("should provide predictable results for common configurations", () => {
                // Standard web check
                expect(calculateMaxDuration(10, 2)).toBe("32s");

                // Database check
                expect(calculateMaxDuration(30, 1)).toBe("2m");

                // API health check
                expect(calculateMaxDuration(15, 3)).toBe("2m");
            });
        });

        describe("Mathematical accuracy", () => {
            it("should correctly calculate exponential backoff sequence", () => {
                // Verify the exact exponential backoff calculation
                const timeout = 1;
                const retries = 4;

                // Expected backoff: 0.5, 1.0, 2.0, 4.0 = 7.5 seconds
                // Total: 1 * 5 + 7.5 = 12.5, ceil = 13 seconds
                expect(calculateMaxDuration(timeout, retries)).toBe("13s");
            });

            it("should handle edge of unit boundaries precisely", () => {
                // Test exactly at 60 seconds boundary
                const result1 = calculateMaxDuration(59, 0);
                expect(result1).toBe("59s");

                const result2 = calculateMaxDuration(60, 0);
                expect(result2).toBe("1m");

                // Test exactly at 3600 seconds boundary
                const result3 = calculateMaxDuration(3599, 0);
                expect(result3).toBe("60m");

                const result4 = calculateMaxDuration(3600, 0);
                expect(result4).toBe("1h");
            });
        });
    });
});
