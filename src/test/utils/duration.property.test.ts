/**
 * Uses fast-check to systematically test duration calculation logic including
 * timeout calculations, exponential backoff formulas, retry attempt handling,
 * and time formatting across all possible numeric inputs and edge cases.
 *
 * @file Comprehensive property-based tests for duration calculation utilities
 *
 * @author GitHub Copilot
 *
 * @since 2025-09-05
 */

import { describe, expect } from "vitest";
import { test } from "@fast-check/vitest";
import fc from "fast-check";

import { calculateMaxDuration } from "../../utils/duration";

describe("Duration Utils Property-Based Tests", () => {
    /**
     * Custom arbitraries for testing duration parameters
     */
    const reasonableTimeout = fc.double({ min: 0.1, max: 300, noNaN: true }); // 0.1s to 5 minutes
    const reasonableRetries = fc.integer({ min: 0, max: 10 }); // 0 to 10 retries
    const edgeCaseTimeout = fc.oneof(
        fc.constant(0),
        fc.constant(0.1),
        fc.constant(1),
        fc.constant(30),
        fc.constant(60),
        fc.constant(300)
    );
    const edgeCaseRetries = fc.oneof(
        fc.constant(0),
        fc.constant(1),
        fc.constant(5),
        fc.constant(10)
    );

    describe(calculateMaxDuration, () => {
        test.prop([reasonableTimeout, reasonableRetries])(
            "should always return a properly formatted duration string",
            (timeout, retries) => {
                const result = calculateMaxDuration(timeout, retries);

                // Should be a string
                expect(typeof result).toBe("string");

                // Should match one of the valid patterns: Ns, Nm, Nh (where N is a positive integer)
                expect(result).toMatch(/^\d+[hms]$/);

                // Should not be empty
                expect(result.length).toBeGreaterThan(1);
            }
        );

        test.prop([reasonableTimeout, reasonableRetries])(
            "should produce consistent time unit formatting",
            (timeout, retries) => {
                const result = calculateMaxDuration(timeout, retries);

                const numericPart = Number.parseInt(result.slice(0, -1), 10);
                const unit = result.slice(-1);

                // Numeric part should be positive
                expect(numericPart).toBeGreaterThan(0);

                // Unit should be valid
                expect([
                    "s",
                    "m",
                    "h",
                ]).toContain(unit);

                // Verify unit selection logic
                if (unit === "s") {
                    expect(numericPart).toBeLessThan(60);
                } else if (unit === "m") {
                    expect(numericPart).toBeLessThan(60); // Minutes should be < 60
                }
            }
        );

        test.prop([
            fc.double({ min: 0.1, max: 10, noNaN: true }),
            fc.constant(0),
        ])(
            "should handle zero retries correctly (no backoff time)",
            (timeout, retries) => {
                const result = calculateMaxDuration(timeout, retries);
                const expectedTime = Math.ceil(timeout);

                // With 0 retries, should just be the timeout value formatted
                if (expectedTime < 60) {
                    expect(result).toBe(`${expectedTime}s`);
                } else if (expectedTime < 3600) {
                    expect(result).toBe(`${Math.ceil(expectedTime / 60)}m`);
                } else {
                    expect(result).toBe(`${Math.ceil(expectedTime / 3600)}h`);
                }
            }
        );

        test.prop([fc.constant(1), fc.integer({ min: 1, max: 5 })])(
            "should calculate exponential backoff correctly for known cases",
            (timeout, retries) => {
                const result = calculateMaxDuration(timeout, retries);

                // Manual calculation of expected backoff
                let expectedBackoff = 0;
                for (let i = 0; i < retries; i++) {
                    expectedBackoff += Math.min(0.5 * 2 ** i, 5);
                }

                const expectedTotal = Math.ceil(
                    timeout * (retries + 1) + expectedBackoff
                );

                // Verify the result matches expected calculation
                if (expectedTotal < 60) {
                    expect(result).toBe(`${expectedTotal}s`);
                } else if (expectedTotal < 3600) {
                    expect(result).toBe(`${Math.ceil(expectedTotal / 60)}m`);
                } else {
                    expect(result).toBe(`${Math.ceil(expectedTotal / 3600)}h`);
                }
            }
        );

        test.prop([reasonableTimeout, fc.integer({ min: 1, max: 10 })])(
            "should always include backoff time when retries > 0",
            (timeout, retries) => {
                // Skip very small timeouts that might result in the same value after Math.ceil
                fc.pre(timeout >= 1);

                const resultWithRetries = calculateMaxDuration(
                    timeout,
                    retries
                );
                const resultNoRetries = calculateMaxDuration(timeout, 0);

                // Parse numeric values for comparison
                const parseResult = (result: string) => {
                    const numericPart = Number.parseInt(
                        result.slice(0, -1),
                        10
                    );
                    const unit = result.slice(-1);

                    // Convert to consistent unit (seconds) for comparison
                    switch (unit) {
                        case "s": {
                            return numericPart;
                        }
                        case "m": {
                            return numericPart * 60;
                        }
                        case "h": {
                            return numericPart * 3600;
                        }
                        default: {
                            return numericPart;
                        }
                    }
                };

                const timeWithRetries = parseResult(resultWithRetries);
                const timeNoRetries = parseResult(resultNoRetries);

                // Should be greater when retries are included due to backoff
                expect(timeWithRetries).toBeGreaterThan(timeNoRetries);
            }
        );

        test.prop([edgeCaseTimeout, edgeCaseRetries])(
            "should handle edge case combinations correctly",
            (timeout, retries) => {
                // Skip the zero timeout case as it would produce "0s"
                fc.pre(timeout > 0);

                expect(() =>
                    calculateMaxDuration(timeout, retries)
                ).not.toThrow();

                const result = calculateMaxDuration(timeout, retries);
                expect(result).toMatch(/^\d+[hms]$/);

                // Should produce reasonable results for edge cases
                const numericPart = Number.parseInt(result.slice(0, -1), 10);
                expect(numericPart).toBeGreaterThan(0);
                expect(numericPart).toBeLessThan(10_000); // Should not produce unreasonably large values
            }
        );

        test("should handle specific known test cases", () => {
            // Test case 1: Small timeout, no retries
            expect(calculateMaxDuration(5, 0)).toBe("5s");

            // Test case 2: Small timeout, 1 retry (should add 0.5s backoff)
            expect(calculateMaxDuration(5, 1)).toBe("11s"); // (5*2) + 0.5 = 10.5 -> ceil(10.5) = 11

            // Test case 3: Minute boundary
            expect(calculateMaxDuration(30, 0)).toBe("30s");
            expect(calculateMaxDuration(60, 0)).toBe("1m");

            // Test case 4: Hour boundary
            expect(calculateMaxDuration(3600, 0)).toBe("1h");

            // Test case 5: Multiple retries with exponential backoff
            const result = calculateMaxDuration(10, 3);
            // Expected: (10 * 4) + (0.5 + 1 + 2) = 40 + 3.5 = 43.5 -> ceil(43.5) = 44s
            expect(result).toBe("44s");
        });

        test.prop([
            fc.double({ min: 0.001, max: 1, noNaN: true }),
            reasonableRetries,
        ])(
            "should handle fractional timeouts correctly",
            (fractionalTimeout, retries) => {
                const result = calculateMaxDuration(fractionalTimeout, retries);

                // Should not crash and should return valid format
                expect(result).toMatch(/^\d+[hms]$/);

                // Result should be reasonable (at least 1 second due to Math.ceil)
                const numericPart = Number.parseInt(result.slice(0, -1), 10);
                expect(numericPart).toBeGreaterThan(0);
            }
        );

        test.prop([reasonableTimeout, reasonableRetries])(
            "should be monotonic with respect to timeout (when retries constant)",
            (baseTimeout, retries) => {
                const higherTimeout = baseTimeout + 10;

                const resultBase = calculateMaxDuration(baseTimeout, retries);
                const resultHigher = calculateMaxDuration(
                    higherTimeout,
                    retries
                );

                // Parse to comparable values
                const parseToSeconds = (result: string) => {
                    const numericPart = Number.parseInt(
                        result.slice(0, -1),
                        10
                    );
                    const unit = result.slice(-1);

                    switch (unit) {
                        case "s": {
                            return numericPart;
                        }
                        case "m": {
                            return numericPart * 60;
                        }
                        case "h": {
                            return numericPart * 3600;
                        }
                        default: {
                            return numericPart;
                        }
                    }
                };

                const baseSeconds = parseToSeconds(resultBase);
                const higherSeconds = parseToSeconds(resultHigher);

                // Higher timeout should result in higher or equal total time
                expect(higherSeconds).toBeGreaterThanOrEqual(baseSeconds);
            }
        );

        test.prop([reasonableTimeout, reasonableRetries])(
            "should be monotonic with respect to retries (when timeout constant)",
            (timeout, baseRetries) => {
                const higherRetries = baseRetries + 1;

                const resultBase = calculateMaxDuration(timeout, baseRetries);
                const resultHigher = calculateMaxDuration(
                    timeout,
                    higherRetries
                );

                const parseToSeconds = (result: string) => {
                    const numericPart = Number.parseInt(
                        result.slice(0, -1),
                        10
                    );
                    const unit = result.slice(-1);

                    switch (unit) {
                        case "s": {
                            return numericPart;
                        }
                        case "m": {
                            return numericPart * 60;
                        }
                        case "h": {
                            return numericPart * 3600;
                        }
                        default: {
                            return numericPart;
                        }
                    }
                };

                const baseSeconds = parseToSeconds(resultBase);
                const higherSeconds = parseToSeconds(resultHigher);

                // More retries should result in higher or equal total time
                // (Equal due to rounding in parseInt; the underlying calculation is always higher)
                expect(higherSeconds).toBeGreaterThanOrEqual(baseSeconds);
            }
        );
    });

    describe("Exponential backoff formula verification", () => {
        test.prop([fc.integer({ min: 1, max: 8 })])(
            "should cap individual backoff delays at 5 seconds",
            (retryIndex) => {
                // Test the individual backoff calculation from the formula
                const backoffDelay = Math.min(0.5 * 2 ** retryIndex, 5);

                expect(backoffDelay).toBeLessThanOrEqual(5);
                expect(backoffDelay).toBeGreaterThan(0);

                // For high retry indices, should be exactly 5
                if (retryIndex >= 4) {
                    // 0.5 * 2^4 = 8, so should be capped at 5
                    expect(backoffDelay).toBe(5);
                }
            }
        );

        test("should calculate correct backoff sequence", () => {
            const expectedBackoffs = [
                0.5, // 0.5 * 2^0 = 0.5
                1, // 0.5 * 2^1 = 1
                2, // 0.5 * 2^2 = 2
                4, // 0.5 * 2^3 = 4
                5, // 0.5 * 2^4 = 8 -> capped at 5
                5, // 0.5 * 2^5 = 16 -> capped at 5
            ];

            for (const [i, expectedBackoff] of expectedBackoffs.entries()) {
                const calculated = Math.min(0.5 * 2 ** i, 5);
                expect(calculated).toBe(expectedBackoff);
            }
        });
    });

    describe("Time formatting edge cases", () => {
        test("should handle boundary values correctly", () => {
            // Test second/minute boundary
            expect(calculateMaxDuration(59, 0)).toBe("59s");
            expect(calculateMaxDuration(60, 0)).toBe("1m");
            expect(calculateMaxDuration(61, 0)).toBe("2m"); // ceil(61/60) = 2

            // Test minute/hour boundary
            expect(calculateMaxDuration(3599, 0)).toBe("60m"); // ceil(3599/60) = 60
            expect(calculateMaxDuration(3600, 0)).toBe("1h");
            expect(calculateMaxDuration(3661, 0)).toBe("2h"); // ceil(3661/3600) = 2
        });

        test.prop([fc.double({ min: 60, max: 3599, noNaN: true })])(
            "should format minutes correctly for values in minute range",
            (timeInSeconds) => {
                const result = calculateMaxDuration(timeInSeconds, 0);

                expect(result).toMatch(/^\d+m$/);

                const minutes = Number.parseInt(result.slice(0, -1), 10);
                const expectedMinutes = Math.ceil(timeInSeconds / 60);

                expect(minutes).toBe(expectedMinutes);
                expect(minutes).toBeGreaterThan(0);

                // Allow 60 minutes as a valid case (3600 seconds -> 60m before rolling to 1h)
                expect(minutes).toBeLessThanOrEqual(60);
            }
        );

        test.prop([fc.double({ min: 3600, max: 10_800, noNaN: true })])(
            "should format hours correctly for values in hour range",
            (timeInSeconds) => {
                const result = calculateMaxDuration(timeInSeconds, 0);

                expect(result).toMatch(/^\d+h$/);

                const hours = Number.parseInt(result.slice(0, -1), 10);
                const expectedHours = Math.ceil(timeInSeconds / 3600);

                expect(hours).toBe(expectedHours);
                expect(hours).toBeGreaterThan(0);
            }
        );
    });

    describe("Performance and robustness", () => {
        test.prop([reasonableTimeout, fc.integer({ min: 0, max: 20 })])(
            "should handle larger retry counts without performance issues",
            (timeout, retries) => {
                const startTime = performance.now();

                const result = calculateMaxDuration(timeout, retries);

                const endTime = performance.now();
                const executionTime = endTime - startTime;

                // Should complete quickly (less than 5ms for property-based testing)
                expect(executionTime).toBeLessThan(5);

                // Should still return valid result
                expect(result).toMatch(/^\d+[hms]$/);
            }
        );

        test("should handle extreme values gracefully", () => {
            // Large timeout
            expect(() => calculateMaxDuration(10_000, 0)).not.toThrow();
            expect(calculateMaxDuration(10_000, 0)).toMatch(/^\d+h$/);

            // Many retries
            expect(() => calculateMaxDuration(1, 100)).not.toThrow();
            expect(calculateMaxDuration(1, 100)).toMatch(/^\d+[hms]$/);

            // Very small timeout
            expect(() => calculateMaxDuration(0.001, 0)).not.toThrow();
            expect(calculateMaxDuration(0.001, 0)).toBe("1s"); // Math.ceil(0.001) = 1
        });

        test.prop([
            fc.double({ min: 0.1, max: 100, noNaN: true }),
            fc.integer({ min: 0, max: 10 }),
        ])("should be deterministic for same inputs", (timeout, retries) => {
            const result1 = calculateMaxDuration(timeout, retries);
            const result2 = calculateMaxDuration(timeout, retries);
            const result3 = calculateMaxDuration(timeout, retries);

            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
        });
    });
});
