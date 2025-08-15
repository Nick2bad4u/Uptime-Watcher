/**
 * @file Comprehensive tests for calculateMaxDuration utility function Testing
 *   duration calculations, retry logic, and formatting
 */

import { describe, expect, it } from "vitest";
import { calculateMaxDuration } from "../../utils/duration";

describe("calculateMaxDuration", () => {
    describe("Basic Calculations", () => {
        it("should calculate duration correctly with no retries", () => {
            // Act & Assert
            expect(calculateMaxDuration(10, 0)).toBe("10s");
            expect(calculateMaxDuration(30, 0)).toBe("30s");
            expect(calculateMaxDuration(5, 0)).toBe("5s");
        });

        it("should calculate duration correctly with single retry", () => {
            // Arrange
            const timeout = 10;
            const retryAttempts = 1;

            // Expected: 10 * 2 attempts + 0.5s backoff = 20.5s -> 21s

            // Act
            const result = calculateMaxDuration(timeout, retryAttempts);

            // Assert
            expect(result).toBe("21s");
        });

        it("should calculate duration correctly with multiple retries", () => {
            // Arrange
            const timeout = 5;
            const retryAttempts = 3;

            // Expected: 5 * 4 attempts + backoff (0.5 + 1 + 2) = 20 + 3.5 = 23.5s -> 24s

            // Act
            const result = calculateMaxDuration(timeout, retryAttempts);

            // Assert
            expect(result).toBe("24s");
        });
    });

    describe("Exponential Backoff Logic", () => {
        it("should apply exponential backoff correctly for first few retries", () => {
            // Test individual backoff calculations
            // Retry 0: 0.5 * 2^0 = 0.5s
            // Retry 1: 0.5 * 2^1 = 1s
            // Retry 2: 0.5 * 2^2 = 2s
            // Retry 3: 0.5 * 2^3 = 4s

            // Test with timeout=0 to isolate backoff calculation
            expect(calculateMaxDuration(0, 1)).toBe("1s"); // 0 + 0.5 -> 1s
            expect(calculateMaxDuration(0, 2)).toBe("2s"); // 0 + 0.5 + 1 -> 2s
            expect(calculateMaxDuration(0, 3)).toBe("4s"); // 0 + 0.5 + 1 + 2 -> 4s
        });

        it("should cap backoff time at 5 seconds per retry", () => {
            // Arrange
            const timeout = 1;
            const retryAttempts = 10; // This would normally give very large backoff times

            // Expected backoff: 0.5 + 1 + 2 + 4 + 5 + 5 + 5 + 5 + 5 + 5 = 37.5s
            // Total: 1 * 11 + 37.5 = 48.5s -> 49s

            // Act
            const result = calculateMaxDuration(timeout, retryAttempts);

            // Assert
            expect(result).toBe("49s");
        });

        it("should handle zero retry attempts correctly", () => {
            // Act & Assert
            expect(calculateMaxDuration(15, 0)).toBe("15s");
            expect(calculateMaxDuration(45, 0)).toBe("45s");
        });
    });

    describe("Time Unit Formatting", () => {
        it("should format seconds correctly", () => {
            // Act & Assert
            expect(calculateMaxDuration(1, 0)).toBe("1s");
            expect(calculateMaxDuration(30, 0)).toBe("30s");
            expect(calculateMaxDuration(59, 0)).toBe("59s");
        });

        it("should format minutes correctly", () => {
            // Act & Assert
            expect(calculateMaxDuration(60, 0)).toBe("1m"); // Exactly 60s -> 1m
            expect(calculateMaxDuration(90, 0)).toBe("2m"); // 90s -> 2m (rounded up)
            expect(calculateMaxDuration(119, 0)).toBe("2m"); // 119s -> 2m (rounded up)
            expect(calculateMaxDuration(120, 0)).toBe("2m"); // Exactly 120s -> 2m
        });

        it("should format hours correctly", () => {
            // Act & Assert
            expect(calculateMaxDuration(3600, 0)).toBe("1h"); // Exactly 3600s -> 1h
            expect(calculateMaxDuration(3661, 0)).toBe("2h"); // 3661s -> 2h (rounded up)
            expect(calculateMaxDuration(7200, 0)).toBe("2h"); // Exactly 7200s -> 2h
            expect(calculateMaxDuration(7199, 0)).toBe("2h"); // 7199s -> 2h (rounded up)
        });

        it("should round up fractional units correctly", () => {
            // Test minute rounding
            expect(calculateMaxDuration(61, 0)).toBe("2m"); // 61s -> 2m
            expect(calculateMaxDuration(90, 0)).toBe("2m"); // 90s -> 2m
            expect(calculateMaxDuration(121, 0)).toBe("3m"); // 121s -> 3m

            // Test hour rounding
            expect(calculateMaxDuration(3601, 0)).toBe("2h"); // 3601s -> 2h
            expect(calculateMaxDuration(5400, 0)).toBe("2h"); // 5400s (1.5h) -> 2h
        });
    });

    describe("Edge Cases", () => {
        it("should handle zero timeout", () => {
            // Act & Assert
            expect(calculateMaxDuration(0, 0)).toBe("0s");
            expect(calculateMaxDuration(0, 1)).toBe("1s"); // Just backoff time
            expect(calculateMaxDuration(0, 2)).toBe("2s"); // 0.5 + 1 -> 2s
        });

        it("should handle zero retry attempts", () => {
            // Act & Assert
            expect(calculateMaxDuration(10, 0)).toBe("10s");
            expect(calculateMaxDuration(100, 0)).toBe("2m");
            expect(calculateMaxDuration(4000, 0)).toBe("2h");
        });

        it("should handle large timeout values", () => {
            // Act & Assert
            expect(calculateMaxDuration(1000, 0)).toBe("17m"); // 1000s -> 17m
            expect(calculateMaxDuration(10_000, 0)).toBe("3h"); // 10000s -> 3h
        });

        it("should handle large retry counts", () => {
            // Arrange
            const timeout = 5;
            const retryAttempts = 20;

            // Expected backoff capped at 5s per retry after initial exponential growth

            // Act
            const result = calculateMaxDuration(timeout, retryAttempts);

            // Assert
            expect(result).toBeTruthy();
            expect(result).toMatch(/^\d+[hms]$/); // Should be valid format
        });

        it("should handle fractional timeouts", () => {
            // Act & Assert
            expect(calculateMaxDuration(0.5, 0)).toBe("1s"); // 0.5s -> 1s (rounded up)
            expect(calculateMaxDuration(1.7, 0)).toBe("2s"); // 1.7s -> 2s (rounded up)
            expect(calculateMaxDuration(2.9, 0)).toBe("3s"); // 2.9s -> 3s (rounded up)
        });

        it("should handle negative inputs gracefully", () => {
            // These are edge cases that shouldn't normally happen,
            // but the function should not crash

            // Act & Assert
            expect(() => calculateMaxDuration(-5, 0)).not.toThrow();
            expect(() => calculateMaxDuration(5, -1)).not.toThrow();
            expect(() => calculateMaxDuration(-5, -1)).not.toThrow();
        });
    });

    describe("Real-world Scenarios", () => {
        it("should calculate correct duration for typical HTTP timeout scenarios", () => {
            // Typical HTTP timeout with retries
            expect(calculateMaxDuration(30, 2)).toBe("2m"); // 30 * 3 + 1.5 = 91.5s -> 2m
            expect(calculateMaxDuration(10, 3)).toBe("44s"); // 10 * 4 + 3.5 = 43.5s -> 44s
        });

        it("should calculate correct duration for ping monitoring", () => {
            // Typical ping timeout scenarios
            expect(calculateMaxDuration(5, 1)).toBe("11s"); // 5 * 2 + 0.5 = 10.5s -> 11s
            expect(calculateMaxDuration(3, 2)).toBe("11s"); // 3 * 3 + 1.5 = 10.5s -> 11s
        });

        it("should calculate correct duration for database connection timeouts", () => {
            // Database connection scenarios
            expect(calculateMaxDuration(60, 1)).toBe("3m"); // 60 * 2 + 0.5 = 120.5s -> 3m
            expect(calculateMaxDuration(120, 0)).toBe("2m"); // 120s -> 2m
        });

        it("should calculate correct duration for long-running tasks", () => {
            // Long-running background tasks
            expect(calculateMaxDuration(300, 1)).toBe("11m"); // 300 * 2 + 0.5 = 600.5s -> 11m
            expect(calculateMaxDuration(1800, 0)).toBe("30m"); // 1800s -> 30m
        });
    });

    describe("Mathematical Properties", () => {
        it("should always increase duration with more retries", () => {
            // Arrange
            const timeout = 10;

            // Act
            const duration0 = calculateMaxDuration(timeout, 0);
            const duration1 = calculateMaxDuration(timeout, 1);
            const duration2 = calculateMaxDuration(timeout, 2);
            const duration3 = calculateMaxDuration(timeout, 3);

            // Convert back to numbers for comparison (remove unit)
            const value0 = Number.parseInt(duration0);
            const value1 = Number.parseInt(duration1);
            const value2 = Number.parseInt(duration2);
            const value3 = Number.parseInt(duration3);

            // Assert
            expect(value1).toBeGreaterThan(value0);
            expect(value2).toBeGreaterThan(value1);
            expect(value3).toBeGreaterThan(value2);
        });

        it("should always increase duration with higher timeout", () => {
            // Arrange
            const retryAttempts = 2;

            // Act
            const duration5 = calculateMaxDuration(5, retryAttempts);
            const duration10 = calculateMaxDuration(10, retryAttempts);
            const duration15 = calculateMaxDuration(15, retryAttempts);

            // Convert back to numbers for comparison
            const value5 = Number.parseInt(duration5);
            const value10 = Number.parseInt(duration10);
            const value15 = Number.parseInt(duration15);

            // Assert
            expect(value10).toBeGreaterThan(value5);
            expect(value15).toBeGreaterThan(value10);
        });

        it("should maintain consistent backoff calculation", () => {
            // Test that backoff calculation is deterministic
            const timeout = 1;
            const retries = 5;

            // Run multiple times to ensure consistency
            const result1 = calculateMaxDuration(timeout, retries);
            const result2 = calculateMaxDuration(timeout, retries);
            const result3 = calculateMaxDuration(timeout, retries);

            // Assert all results are identical
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
        });
    });

    describe("Return Value Format", () => {
        it("should always return a string", () => {
            // Act & Assert
            expect(typeof calculateMaxDuration(10, 0)).toBe("string");
            expect(typeof calculateMaxDuration(100, 5)).toBe("string");
            expect(typeof calculateMaxDuration(0, 0)).toBe("string");
        });

        it("should always return a valid time format", () => {
            // Arrange
            const timeFormatRegex = /^\d+[hms]$/;

            // Act & Assert
            expect(calculateMaxDuration(5, 0)).toMatch(timeFormatRegex);
            expect(calculateMaxDuration(65, 1)).toMatch(timeFormatRegex);
            expect(calculateMaxDuration(4000, 2)).toMatch(timeFormatRegex);
        });

        it("should never return zero time with positive inputs", () => {
            // Act & Assert
            expect(calculateMaxDuration(1, 0)).not.toBe("0s");
            expect(calculateMaxDuration(0.1, 0)).not.toBe("0s");
            expect(calculateMaxDuration(0, 1)).not.toBe("0s");
        });

        it("should return consistent format for similar values", () => {
            // Values that should all be in seconds
            expect(calculateMaxDuration(30, 0)).toMatch(/^\d+s$/);
            expect(calculateMaxDuration(45, 0)).toMatch(/^\d+s$/);
            expect(calculateMaxDuration(59, 0)).toMatch(/^\d+s$/);

            // Values that should all be in minutes
            expect(calculateMaxDuration(60, 0)).toMatch(/^\d+m$/);
            expect(calculateMaxDuration(120, 0)).toMatch(/^\d+m$/);
            expect(calculateMaxDuration(1800, 0)).toMatch(/^\d+m$/);

            // Values that should all be in hours
            expect(calculateMaxDuration(3600, 0)).toMatch(/^\d+h$/);
            expect(calculateMaxDuration(7200, 0)).toMatch(/^\d+h$/);
        });
    });
});
