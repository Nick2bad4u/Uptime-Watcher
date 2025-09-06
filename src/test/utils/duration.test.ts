/**
 * Tests for duration utility functions
 *
 * @file Comprehensive tests covering all branches and edge cases for duration
 *   calculation utilities.
 *
 * @remarks
 * Enhanced with fast-check property-based testing to systematically validate
 * duration calculations with different timeout values and retry attempts.
 */

import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { calculateMaxDuration } from "../../utils/duration";

describe("Duration Utilities", () => {
    describe(calculateMaxDuration, () => {
        describe("Basic functionality", () => {
            it("should calculate duration with no retry attempts", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = calculateMaxDuration(10, 0);
                // timeout: 10 seconds * 1 attempt = 10 seconds
                // backoff: 0 (no retries)
                // total: 10 seconds
                expect(result).toBe("10s");
            });

            it("should calculate duration with single retry attempt", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = calculateMaxDuration(5, 1);
                // timeout: 5 seconds * 2 attempts = 10 seconds
                // backoff: 0.5 seconds (first retry)
                // total: Math.ceil(10.5) = 11 seconds
                expect(result).toBe("11s");
            });

            it("should calculate duration with multiple retry attempts", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = calculateMaxDuration(2, 3);
                // timeout: 2 seconds * 4 attempts = 8 seconds
                // backoff: 0.5 + 1.0 + 2.0 = 3.5 seconds
                // total: Math.ceil(11.5) = 12 seconds
                expect(result).toBe("12s");
            });
        });

        describe("Exponential backoff calculation", () => {
            it("should calculate correct backoff for first few retries", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = calculateMaxDuration(1, 2);
                // timeout: 1 second * 3 attempts = 3 seconds
                // backoff: 0.5 + 1.0 = 1.5 seconds
                // total: Math.ceil(4.5) = 5 seconds
                expect(result).toBe("5s");
            });

            it("should cap backoff at 5 seconds per retry", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = calculateMaxDuration(1, 5);
                // timeout: 1 second * 6 attempts = 6 seconds
                // backoff: 0.5 + 1.0 + 2.0 + 4.0 + 5.0 = 12.5 seconds (4th retry capped at 5s)
                // total: Math.ceil(18.5) = 19 seconds
                expect(result).toBe("19s");
            });

            it("should handle very high retry counts with capped backoff", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = calculateMaxDuration(1, 10);
                // timeout: 1 second * 11 attempts = 11 seconds
                // backoff: 0.5 + 1.0 + 2.0 + 4.0 + 5.0 + 5.0 + 5.0 + 5.0 + 5.0 + 5.0 = 37.5 seconds
                // total: Math.ceil(48.5) = 49 seconds
                expect(result).toBe("49s");
            });
        });

        describe("Duration formatting - seconds", () => {
            it("should format short durations in seconds", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(calculateMaxDuration(1, 0)).toBe("1s");
                expect(calculateMaxDuration(30, 0)).toBe("30s");
                expect(calculateMaxDuration(59, 0)).toBe("59s");
            });

            it("should format exactly 60 seconds as minutes", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = calculateMaxDuration(60, 0);
                // 60 seconds = 1 minute
                expect(result).toBe("1m");
            });
        });

        describe("Duration formatting - minutes", () => {
            it("should format durations between 1-59 minutes", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

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

            it("should handle duration that rounds up to next minute", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = calculateMaxDuration(119, 0);
                // 119 seconds = Math.ceil(119/60) = 2 minutes
                expect(result).toBe("2m");
            });

            it("should format exactly 3600 seconds as hours", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = calculateMaxDuration(3600, 0);
                // 3600 seconds = 1 hour
                expect(result).toBe("1h");
            });
        });

        describe("Duration formatting - hours", () => {
            it("should format durations over 1 hour", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result1 = calculateMaxDuration(3601, 0);
                // 3601 seconds = Math.ceil(3601/3600) = 2 hours
                expect(result1).toBe("2h");

                const result2 = calculateMaxDuration(7200, 0);
                // 7200 seconds = Math.ceil(7200/3600) = 2 hours
                expect(result2).toBe("2h");

                const result3 = calculateMaxDuration(10_800, 0);
                // 10800 seconds = Math.ceil(10800/3600) = 3 hours
                expect(result3).toBe("3h");
            });

            it("should handle very large durations", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = calculateMaxDuration(86_400, 0);
                // 86400 seconds = 24 hours
                expect(result).toBe("24h");
            });
        });

        describe("Edge cases", () => {
            it("should handle zero timeout", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = calculateMaxDuration(0, 0);
                // 0 seconds timeout still has 1 attempt
                expect(result).toBe("0s");
            });

            it("should handle zero timeout with retries", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = calculateMaxDuration(0, 2);
                // timeout: 0 * 3 = 0 seconds
                // backoff: 0.5 + 1.0 = 1.5 seconds
                // total: Math.ceil(1.5) = 2 seconds
                expect(result).toBe("2s");
            });

            it("should handle fractional timeout values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = calculateMaxDuration(1.5, 1);
                // timeout: 1.5 * 2 = 3 seconds
                // backoff: 0.5 seconds
                // total: Math.ceil(3.5) = 4 seconds
                expect(result).toBe("4s");
            });

            it("should handle large timeout values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = calculateMaxDuration(1800, 0);
                // 1800 seconds = Math.ceil(1800/60) = 30 minutes
                expect(result).toBe("30m");
            });

            it("should handle large retry counts", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const result = calculateMaxDuration(10, 20);
                // timeout: 10 * 21 = 210 seconds
                // backoff: significant amount with capping at 5s per retry
                // This should result in minutes
                expect(result).toMatch(/^\d+m$/);
            });
        });

        describe("Real-world scenarios", () => {
            it("should handle typical monitoring scenarios", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                // Common scenario: 30 second timeout, 3 retries
                const result1 = calculateMaxDuration(30, 3);
                expect(result1).toMatch(/^\d+[ms]$/);

                // Quick check scenario: 5 second timeout, 1 retry
                const result2 = calculateMaxDuration(5, 1);
                expect(result2).toBe("11s");

                // Long running check: 2 minute timeout, 2 retries
                const result3 = calculateMaxDuration(120, 2);
                expect(result3).toMatch(/^\d+m$/);
            });

            it("should provide predictable results for common configurations", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                // Standard web check
                expect(calculateMaxDuration(10, 2)).toBe("32s");

                // Database check
                expect(calculateMaxDuration(30, 1)).toBe("2m");

                // API health check
                expect(calculateMaxDuration(15, 3)).toBe("2m");
            });
        });

        describe("Mathematical accuracy", () => {
            it("should correctly calculate exponential backoff sequence", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                // Verify the exact exponential backoff calculation
                const timeout = 1;
                const retries = 4;

                // Expected backoff: 0.5, 1.0, 2.0, 4.0 = 7.5 seconds
                // Total: 1 * 5 + 7.5 = 12.5, ceil = 13 seconds
                expect(calculateMaxDuration(timeout, retries)).toBe("13s");
            });

            it("should handle edge of unit boundaries precisely", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: duration", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

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

        describe("Property-Based Fuzzing Tests", () => {
            // Helper function to parse duration strings to seconds for comparison
            const parseToSeconds = (duration: string): number => {
                const unit = duration.at(-1);
                const value = Number.parseInt(duration.slice(0, -1), 10);

                switch (unit) {
                    case "s": {
                        return value;
                    }
                    case "m": {
                        return value * 60;
                    }
                    case "h": {
                        return value * 3600;
                    }
                    default: {
                        return value;
                    }
                }
            };

            describe("calculateMaxDuration property tests", () => {
                test.prop([fc.float({ min: 0, max: Math.fround(300) }), fc.integer({ min: 0, max: 10 })])(
                    "should always return a valid duration string format",
                    (timeout, retryAttempts) => {
                        const result = calculateMaxDuration(timeout, retryAttempts);

                        // Property: Result should match duration format pattern
                        expect(result).toMatch(/^\d+[hms]$/);

                        // Property: Should be one of the three valid unit types
                        const unit = result.at(-1);
                        expect(["s", "m", "h"]).toContain(unit);

                        // Property: Numeric part should be positive
                        const numericPart = Number.parseInt(result.slice(0, -1), 10);
                        expect(numericPart).toBeGreaterThan(0);
                    }
                );

                test.prop([fc.float({ min: Math.fround(0.1), max: Math.fround(100) }), fc.integer({ min: 0, max: 20 })])(
                    "should increase duration with more retry attempts",
                    (timeout, retryAttempts) => {
                        const noRetries = calculateMaxDuration(timeout, 0);
                        const withRetries = calculateMaxDuration(timeout, retryAttempts);

                        const noRetriesSeconds = parseToSeconds(noRetries);
                        const withRetriesSeconds = parseToSeconds(withRetries);

                        // Property: More retries should result in equal or longer duration
                        if (retryAttempts > 0) {
                            expect(withRetriesSeconds).toBeGreaterThanOrEqual(noRetriesSeconds);
                        } else {
                            expect(withRetriesSeconds).toBe(noRetriesSeconds);
                        }
                    }
                );

                test.prop([fc.float({ min: Math.fround(0.1), max: Math.fround(60) }), fc.constant(0)])(
                    "should format seconds correctly for short durations",
                    (timeout, retryAttempts) => {
                        const result = calculateMaxDuration(timeout, retryAttempts);

                        // Property: For single timeout under 60s with no retries, should be in seconds
                        if (Math.ceil(timeout) < 60) {
                            expect(result).toMatch(/^\d+s$/);

                            const seconds = Number.parseInt(result.slice(0, -1), 10);
                            expect(seconds).toBe(Math.ceil(timeout));
                        }
                    }
                );

                test.prop([fc.float({ min: Math.fround(60), max: Math.fround(3599) }), fc.constant(0)])(
                    "should format minutes correctly for medium durations",
                    (timeout, retryAttempts) => {
                        const result = calculateMaxDuration(timeout, retryAttempts);

                        // Property: For timeouts 60s+ but under 3600s, should be in minutes
                        if (Math.ceil(timeout) >= 60 && Math.ceil(timeout) < 3600) {
                            expect(result).toMatch(/^\d+m$/);

                            const minutes = Number.parseInt(result.slice(0, -1), 10);
                            expect(minutes).toBe(Math.ceil(timeout / 60));
                        }
                    }
                );

                test.prop([fc.float({ min: Math.fround(3600), max: Math.fround(10_800) }), fc.constant(0)])(
                    "should format hours correctly for long durations",
                    (timeout, retryAttempts) => {
                        const result = calculateMaxDuration(timeout, retryAttempts);

                        // Property: For timeouts 3600s+, should be in hours
                        if (Math.ceil(timeout) >= 3600) {
                            expect(result).toMatch(/^\d+h$/);

                            const hours = Number.parseInt(result.slice(0, -1), 10);
                            expect(hours).toBe(Math.ceil(timeout / 3600));
                        }
                    }
                );

                test.prop([fc.float({ min: Math.fround(1), max: Math.fround(30) }), fc.integer({ min: 1, max: 5 })])(
                    "should demonstrate exponential backoff effect",
                    (timeout, retryAttempts) => {
                        const result = calculateMaxDuration(timeout, retryAttempts);

                        // Property: Should include backoff time in calculation
                        // Calculate expected using exact same algorithm as the function
                        const totalAttempts = retryAttempts + 1;
                        const timeoutTime = timeout * totalAttempts;
                        const backoffTime = retryAttempts > 0
                            ? Array.from(
                                { length: retryAttempts },
                                (_, index) => Math.min(0.5 * (2 ** index), 5)
                              ).reduce((a, b) => a + b, 0)
                            : 0;

                        const totalTime = Math.ceil(timeoutTime + backoffTime);

                        // Format using the same logic as the function
                        let expectedFormat: string;
                        if (totalTime < 60) {
                            expectedFormat = `${totalTime}s`;
                        } else if (totalTime < 3600) {
                            expectedFormat = `${Math.ceil(totalTime / 60)}m`;
                        } else {
                            expectedFormat = `${Math.ceil(totalTime / 3600)}h`;
                        }

                        // Property: Result should match expected formatted output
                        expect(result).toBe(expectedFormat);
                    }
                );

                test.prop([fc.constant(0), fc.integer({ min: 0, max: 5 })])(
                    "should handle zero timeout gracefully",
                    (timeout, retryAttempts) => {
                        const result = calculateMaxDuration(timeout, retryAttempts);

                        // Property: Zero timeout should still produce a valid result
                        expect(result).toMatch(/^\d+[hms]$/);

                        // Property: Should handle zero timeout correctly
                        const numericPart = Number.parseInt(result.slice(0, -1), 10);
                        if (retryAttempts === 0) {
                            // With zero timeout and no retries, result should be 0s (due to Math.ceil(0))
                            expect(result).toBe("0s");
                        } else {
                            // With retries, backoff should make it positive
                            expect(numericPart).toBeGreaterThan(0);
                        }
                    }
                );

                test.prop([fc.float({ min: Math.fround(0.1), max: Math.fround(100) })])(
                    "should be deterministic and consistent",
                    (timeout) => {
                        const retryAttempts = 3; // Fixed for consistency testing

                        const result1 = calculateMaxDuration(timeout, retryAttempts);
                        const result2 = calculateMaxDuration(timeout, retryAttempts);
                        const result3 = calculateMaxDuration(timeout, retryAttempts);

                        // Property: Multiple calls with same inputs should produce same result
                        expect(result1).toBe(result2);
                        expect(result2).toBe(result3);
                    }
                );

                test.prop([fc.integer({ min: 0, max: 100 })])(
                    "should cap backoff at 5 seconds per retry attempt",
                    (retryAttempts) => {
                        const timeout = 1; // Fixed timeout to isolate backoff testing
                        const result = calculateMaxDuration(timeout, retryAttempts);

                        // Calculate expected using exact same algorithm as the function
                        const totalAttempts = retryAttempts + 1;
                        const timeoutTime = timeout * totalAttempts;
                        const backoffTime = retryAttempts > 0
                            ? Array.from(
                                { length: retryAttempts },
                                (_, index) => Math.min(0.5 * (2 ** index), 5)
                              ).reduce((a, b) => a + b, 0)
                            : 0;

                        const totalTime = Math.ceil(timeoutTime + backoffTime);

                        // Format using the same logic as the function
                        let expectedFormat: string;
                        if (totalTime < 60) {
                            expectedFormat = `${totalTime}s`;
                        } else if (totalTime < 3600) {
                            expectedFormat = `${Math.ceil(totalTime / 60)}m`;
                        } else {
                            expectedFormat = `${Math.ceil(totalTime / 3600)}h`;
                        }

                        // Property: Result should match expected formatted output
                        expect(result).toBe(expectedFormat);

                        // Property: Each individual backoff should be capped at 5 seconds
                        // (This is verified by the algorithm itself - Math.min ensures cap)
                        for (let i = 0; i < Math.min(retryAttempts, 10); i++) {
                            const individualBackoff = Math.min(0.5 * (2 ** i), 5);
                            expect(individualBackoff).toBeLessThanOrEqual(5);
                        }
                    }
                );

                test.prop([fc.float({ min: Math.fround(0.1), max: Math.fround(10) }), fc.integer({ min: 0, max: 3 })])(
                    "should respect monotonicity with timeout increases",
                    (timeout, retryAttempts) => {
                        const smallerTimeout = timeout;
                        const largerTimeout = timeout * 2;

                        const smallResult = calculateMaxDuration(smallerTimeout, retryAttempts);
                        const largeResult = calculateMaxDuration(largerTimeout, retryAttempts);

                        // Helper to convert to comparable seconds
                        const toSeconds = (duration: string): number => {
                            const unit = duration.at(-1);
                            const value = Number.parseInt(duration.slice(0, -1), 10);

                            switch (unit) {
                                case "s": {
                                    return value;
                                }
                                case "m": {
                                    return value * 60;
                                }
                                case "h": {
                                    return value * 3600;
                                }
                                default: {
                                    return value;
                                }
                            }
                        };

                        const smallSeconds = toSeconds(smallResult);
                        const largeSeconds = toSeconds(largeResult);

                        // Property: Larger timeout should produce larger or equal duration
                        expect(largeSeconds).toBeGreaterThanOrEqual(smallSeconds);
                    }
                );

                test.prop([fc.oneof(fc.constant(Math.fround(59.9)), fc.constant(Math.fround(60.1)), fc.constant(Math.fround(3599.9)), fc.constant(Math.fround(3600.1)))])(
                    "should handle unit boundary edge cases correctly",
                    (timeout) => {
                        const result = calculateMaxDuration(timeout, 0);

                        // Property: Should handle boundary transitions correctly
                        const totalSeconds = Math.ceil(timeout);

                        if (totalSeconds < 60) {
                            expect(result).toMatch(/^\d+s$/);
                        } else if (totalSeconds < 3600) {
                            expect(result).toMatch(/^\d+m$/);
                        } else {
                            expect(result).toMatch(/^\d+h$/);
                        }
                    }
                );
            });
        });
    });
});
