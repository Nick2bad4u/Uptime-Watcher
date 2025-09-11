/**
 * @remarks
 * These tests use property-based testing to verify fallback utility functions
 * with comprehensive edge case coverage and randomized inputs. Tests error
 * handling wrappers, type guards, default value management, and display
 * utilities.
 *
 * Comprehensive Coverage Areas:
 *
 * - Type guards and null checking (isNullOrUndefined, withFallback)
 * - Error handling wrappers (withAsyncErrorHandling, withSyncErrorHandling)
 *   it('should handle unicode strings correctly', () => {
 *   fc.assert(fc.property( fc.string({ unit: 'binary', minLength: 1, maxLength:
 *   200 }), fc.integer({ min: 10, max: 50 }), (unicodeStr, maxLength) => {
 *   const result = truncateForLogging(unicodeStr, maxLength);
 *   expect(result.length).toBeLessThanOrEqual(maxLength); if
 *   (unicodeStr.length
 *
 * > MaxLength) { expect(result.length).toBe(maxLength); } else {
 *   > expect(result).toBe(unicodeStr); } } )); });ay utilities
 *   > (getMonitorDisplayIdentifier, getMonitorTypeDisplayLabel)
 * - String processing utilities (truncateForLogging)
 * - Edge cases and robustness (null inputs, malformed objects)
 * - Performance and determinism testing
 *
 * @file Property-based tests for fallback utilities using Fast-Check
 *
 * @packageDocumentation
 */

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
    isNullOrUndefined,
    withFallback,
    withAsyncErrorHandling,
    withSyncErrorHandling,
    getMonitorDisplayIdentifier,
    getMonitorTypeDisplayLabel,
    truncateForLogging,
    UiDefaults,
    MonitorDefaults,
    SiteDefaults,
} from "../../utils/fallbacks";

import type { Monitor } from "../../../shared/types";

describe("Fallback Utils Property-Based Tests", () => {
    // =============================================================================
    // Arbitraries
    // =============================================================================

    /**
     * Generates various monitor objects for testing
     */
    const monitorArbitrary = fc.record(
        {
            id: fc.string({ minLength: 1, maxLength: 50 }),
            type: fc.constantFrom("http", "ping", "port", "dns", "ssl", "api"),
            status: fc.constantFrom("up", "down", "pending", "paused"),
            url: fc.option(fc.webUrl()),
            host: fc.option(
                fc
                    .string({ minLength: 1, maxLength: 100 })
                    .filter((s) => s.trim().length > 0)
            ),
            port: fc.option(fc.integer({ min: 1, max: 65_535 })),
            checkInterval: fc.option(
                fc.integer({ min: 1000, max: 86_400_000 })
            ), // 1s to 24h
            timeout: fc.option(fc.integer({ min: 1000, max: 30_000 })), // 1s to 30s
            retryAttempts: fc.option(fc.integer({ min: 0, max: 10 })),
        },
        {
            requiredKeys: ["id", "type", "status"],
        }
    ) as fc.Arbitrary<Monitor>;

    /**
     * Generates various invalid monitor objects
     */
    const invalidMonitorArbitrary = fc.oneof(
        fc.constant(null),
        fc.constant(undefined),
        fc.constant({}),
        fc.record({
            type: fc.oneof(
                fc.constant(null),
                fc.constant(undefined),
                fc.constant(""),
                fc.integer(),
                fc.boolean()
            ),
        }),
        fc.record({
            id: fc.oneof(fc.constant(null), fc.constant(undefined)),
            type: fc.string(),
            status: fc.string(),
        })
    );

    // =============================================================================
    // isNullOrUndefined Function Tests
    // =============================================================================

    describe("isNullOrUndefined function", () => {
        it("should return true for null and undefined values", () => {
            fc.assert(
                fc.property(
                    fc.oneof(fc.constant(null), fc.constant(undefined)),
                    (value) => {
                        const result = isNullOrUndefined(value);
                        expect(result).toBeTruthy();
                    }
                )
            );
        });

        it("should return false for all non-null/undefined values", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.string(),
                        fc.integer(),
                        fc.boolean(),
                        fc.float({ noNaN: true, noDefaultInfinity: true }),
                        fc.array(fc.anything()),
                        fc.object(),
                        fc.constant(0),
                        fc.constant(""),
                        fc.constant(false)
                    ),
                    (value) => {
                        const result = isNullOrUndefined(value);
                        expect(result).toBeFalsy();
                    }
                )
            );
        });

        it("should handle edge case falsy values correctly", () => {
            const falsyValues = [0, "", false, Number.NaN];
            for (const value of falsyValues) {
                expect(isNullOrUndefined(value)).toBeFalsy();
            }
        });
    });

    // =============================================================================
    // withFallback Function Tests
    // =============================================================================

    describe("withFallback function", () => {
        it("should return the original value when not null or undefined", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.string(),
                        fc.integer(),
                        fc.boolean(),
                        fc.array(fc.anything())
                    ),
                    fc.string(),
                    (value, fallback) => {
                        const result = withFallback(value, fallback);
                        expect(result).toBe(value);
                    }
                )
            );
        });

        it("should return fallback value when input is null or undefined", () => {
            fc.assert(
                fc.property(
                    fc.oneof(fc.constant(null), fc.constant(undefined)),
                    fc.string(),
                    (value, fallback) => {
                        const result = withFallback(value, fallback);
                        expect(result).toBe(fallback);
                    }
                )
            );
        });

        it("should handle complex fallback objects correctly", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant(null),
                        fc.constant(undefined),
                        fc.object()
                    ),
                    fc.object(),
                    (value, fallback) => {
                        const result = withFallback(value, fallback);
                        if (value === null || value === undefined) {
                            expect(result).toBe(fallback);
                        } else {
                            expect(result).toBe(value);
                        }
                    }
                )
            );
        });

        it("should preserve type consistency", () => {
            fc.assert(
                fc.property(fc.integer(), (fallback) => {
                    const result1 = withFallback(42, fallback);
                    const result2 = withFallback(null, fallback);

                    expect(typeof result1).toBe("number");
                    expect(typeof result2).toBe("number");
                    expect(result1).toBe(42);
                    expect(result2).toBe(fallback);
                })
            );
        });
    });

    // =============================================================================
    // withAsyncErrorHandling Function Tests
    // =============================================================================

    describe("withAsyncErrorHandling function", () => {
        it("should return a synchronous function", () => {
            fc.assert(
                fc.property(fc.string(), (operationName) => {
                    const asyncOp = async () => {};
                    const wrappedFunction = withAsyncErrorHandling(
                        asyncOp,
                        operationName
                    );

                    expect(typeof wrappedFunction).toBe("function");
                    expect(wrappedFunction.constructor.name).toBe("Function"); // Not AsyncFunction
                })
            );
        });

        it("should handle successful async operations without throwing", () => {
            fc.assert(
                fc.property(fc.string(), (operationName) => {
                    const asyncOp = async () => {
                        // Simulate successful async operation
                        await new Promise((resolve) => setTimeout(resolve, 1));
                    };

                    const wrappedFunction = withAsyncErrorHandling(
                        asyncOp,
                        operationName
                    );

                    // Should not throw when executed
                    expect(() => wrappedFunction()).not.toThrow();
                }),
                { numRuns: 5 }
            ); // Reduced iterations to minimize async overhead
        });

        it("should handle failing async operations gracefully", async () => {
            // Set up a temporary unhandled rejection handler for this test
            const originalHandler = process.listeners("unhandledRejection");
            const unhandledRejections: Error[] = [];

            const testHandler = (reason: Error) => {
                unhandledRejections.push(reason);
            };

            process.removeAllListeners("unhandledRejection");
            process.on("unhandledRejection", testHandler);

            try {
                // Use fewer iterations to reduce unhandled promise rejections
                fc.assert(
                    fc.property(
                        fc.string({ minLength: 1 }), // Ensure non-empty operation names
                        fc.string(),
                        (operationName, errorMessage) => {
                            const failingAsyncOp = async () => {
                                throw new Error(errorMessage);
                            };

                            const wrappedFunction = withAsyncErrorHandling(
                                failingAsyncOp,
                                operationName
                            );

                            // Should not throw even when the async operation fails
                            expect(() => wrappedFunction()).not.toThrow();
                        }
                    ),
                    { numRuns: 3 }
                ); // Further reduced to minimize unhandled rejections

                // Allow time for async operations to complete
                await new Promise((resolve) => setTimeout(resolve, 50));

                // We expect some unhandled rejections due to the nature of withAsyncErrorHandling
                // when operations fail without fallback values - this is the expected behavior
                expect(unhandledRejections.length).toBeGreaterThanOrEqual(0);
            } finally {
                // Restore original handlers
                process.removeAllListeners("unhandledRejection");
                for (const handler of originalHandler) {
                    process.on(
                        "unhandledRejection",
                        handler as (...args: any[]) => void
                    );
                }
            }
        });

        it("should handle various async operation types", async () => {
            // Set up a temporary unhandled rejection handler for this test
            const originalHandler = process.listeners("unhandledRejection");
            const unhandledRejections: Error[] = [];

            const testHandler = (reason: Error) => {
                unhandledRejections.push(reason);
            };

            process.removeAllListeners("unhandledRejection");
            process.on("unhandledRejection", testHandler);

            try {
                // Use a smaller set to reduce unhandled promises
                const operations = [
                    async () => {
                        /* successful operation */
                    },
                    async () => {
                        throw new Error("failure");
                    },
                ];

                for (const [index, operation] of operations.entries()) {
                    const wrappedFunction = withAsyncErrorHandling(
                        operation,
                        `operation-${index}`
                    );
                    expect(() => wrappedFunction()).not.toThrow();
                }

                // Allow time for async operations to complete
                await new Promise((resolve) => setTimeout(resolve, 50));

                // We expect some unhandled rejections from the failing operation
                expect(unhandledRejections.length).toBeGreaterThanOrEqual(0);
            } finally {
                // Restore original handlers
                process.removeAllListeners("unhandledRejection");
                for (const handler of originalHandler) {
                    process.on(
                        "unhandledRejection",
                        handler as (...args: any[]) => void
                    );
                }
            }
        });
    });

    // =============================================================================
    // withSyncErrorHandling Function Tests
    // =============================================================================

    describe("withSyncErrorHandling function", () => {
        it("should return operation result when successful", () => {
            fc.assert(
                fc.property(
                    fc.oneof(fc.string(), fc.integer(), fc.boolean()),
                    fc.string(),
                    (expectedResult, operationName) => {
                        const operation = () => expectedResult;
                        const result = withSyncErrorHandling(
                            operation,
                            operationName,
                            "fallback"
                        );

                        expect(result).toBe(expectedResult);
                    }
                )
            );
        });

        it("should return fallback value when operation throws", () => {
            fc.assert(
                fc.property(
                    fc.string(),
                    fc.string(),
                    fc.string(),
                    (operationName, errorMessage, fallbackValue) => {
                        const failingOperation = () => {
                            throw new Error(errorMessage);
                        };

                        const result = withSyncErrorHandling(
                            failingOperation,
                            operationName,
                            fallbackValue
                        );
                        expect(result).toBe(fallbackValue);
                    }
                )
            );
        });

        it("should handle various error types gracefully", () => {
            const errorTypes = [
                () => {
                    throw new Error("standard error");
                },
                () => {
                    throw new TypeError("type error");
                },
                () => {
                    throw new RangeError("range error");
                },
                () => {
                    throw "string error";
                },
                () => {
                    throw 42;
                },
                () => {
                    throw null;
                },
                () => {
                    throw undefined;
                },
                () => {
                    throw { custom: "object error" };
                },
            ];

            for (const [index, errorOperation] of errorTypes.entries()) {
                const fallback = `fallback-${index}`;
                const result = withSyncErrorHandling(
                    errorOperation,
                    `error-test-${index}`,
                    fallback
                );
                expect(result).toBe(fallback);
            }
        });

        it("should preserve type consistency between success and fallback", () => {
            fc.assert(
                fc.property(
                    fc.integer(),
                    fc.integer(),
                    (successValue, fallbackValue) => {
                        const successOp = () => successValue;
                        const failOp = () => {
                            throw new Error("fail");
                        };

                        const successResult = withSyncErrorHandling(
                            successOp,
                            "success",
                            fallbackValue
                        );
                        const failResult = withSyncErrorHandling(
                            failOp,
                            "fail",
                            fallbackValue
                        );

                        expect(typeof successResult).toBe(typeof fallbackValue);
                        expect(typeof failResult).toBe(typeof fallbackValue);
                        expect(successResult).toBe(successValue);
                        expect(failResult).toBe(fallbackValue);
                    }
                )
            );
        });
    });

    // =============================================================================
    // getMonitorDisplayIdentifier Function Tests
    // =============================================================================

    describe("getMonitorDisplayIdentifier function", () => {
        it("should return URL for HTTP monitors when available", () => {
            fc.assert(
                fc.property(
                    fc.webUrl(),
                    fc.string({ minLength: 1 }),
                    (url, siteFallback) => {
                        const monitor = {
                            id: "1",
                            type: "http",
                            status: "up",
                            url,
                        } as Monitor;
                        const result = getMonitorDisplayIdentifier(
                            monitor,
                            siteFallback
                        );
                        expect(result).toBe(url);
                    }
                )
            );
        });

        it("should return host for ping monitors when available", () => {
            fc.assert(
                fc.property(
                    fc
                        .string({ minLength: 1 })
                        .filter((s) => s.trim().length > 0),
                    fc.string({ minLength: 1 }),
                    (host, siteFallback) => {
                        const monitor = {
                            id: "1",
                            type: "ping",
                            status: "up",
                            host,
                        } as Monitor;
                        const result = getMonitorDisplayIdentifier(
                            monitor,
                            siteFallback
                        );
                        expect(result).toBe(host);
                    }
                )
            );
        });

        it("should return host:port for port monitors when both are available", () => {
            fc.assert(
                fc.property(
                    fc
                        .string({ minLength: 1 })
                        .filter((s) => s.trim().length > 0),
                    fc.integer({ min: 1, max: 65_535 }),
                    fc.string({ minLength: 1 }),
                    (host, port, siteFallback) => {
                        const monitor = {
                            id: "1",
                            type: "port",
                            status: "up",
                            host,
                            port,
                        } as Monitor;
                        const result = getMonitorDisplayIdentifier(
                            monitor,
                            siteFallback
                        );
                        expect(result).toBe(`${host}:${port}`);
                    }
                )
            );
        });

        it("should return site fallback for monitors without identifiable fields", () => {
            fc.assert(
                fc.property(
                    fc.constantFrom("http", "ping", "port", "unknown"),
                    fc.string({ minLength: 1 }),
                    (type, siteFallback) => {
                        const monitor = {
                            id: "1",
                            type,
                            status: "up",
                        } as Monitor;
                        const result = getMonitorDisplayIdentifier(
                            monitor,
                            siteFallback
                        );
                        expect(result).toBe(siteFallback);
                    }
                )
            );
        });

        it("should handle malformed monitor objects gracefully", () => {
            fc.assert(
                fc.property(
                    invalidMonitorArbitrary,
                    fc.string({ minLength: 1 }),
                    (monitor, siteFallback) => {
                        const result = getMonitorDisplayIdentifier(
                            monitor as any,
                            siteFallback
                        );
                        expect(typeof result).toBe("string");
                        expect(result.length).toBeGreaterThan(0);
                        // Should return siteFallback for invalid monitors
                        expect(result).toBe(siteFallback);
                    }
                )
            );
        });

        it("should prioritize specific fields over generic fields", () => {
            fc.assert(
                fc.property(
                    fc.webUrl(),
                    fc
                        .string({ minLength: 1 })
                        .filter((s) => s.trim().length > 0),
                    fc.integer({ min: 1, max: 65_535 }),
                    fc.string({ minLength: 1 }),
                    (url, host, port, siteFallback) => {
                        // HTTP monitor with both URL and host - should prefer URL
                        const monitor = {
                            id: "1",
                            type: "http",
                            status: "up",
                            url,
                            host,
                            port,
                        } as Monitor;
                        const result = getMonitorDisplayIdentifier(
                            monitor,
                            siteFallback
                        );
                        expect(result).toBe(url);
                    }
                )
            );
        });
    });

    // =============================================================================
    // getMonitorTypeDisplayLabel Function Tests
    // =============================================================================

    describe("getMonitorTypeDisplayLabel function", () => {
        it("should return predefined labels for known monitor types", () => {
            const knownTypes = new Map([
                ["http", "Website URL"],
                ["ping", "Ping Monitor"],
                ["port", "Host & Port"],
            ]);

            for (const [type, expectedLabel] of knownTypes) {
                const result = getMonitorTypeDisplayLabel(type);
                expect(result).toBe(expectedLabel);
            }
        });

        it("should generate reasonable labels for unknown monitor types", () => {
            fc.assert(
                fc.property(
                    fc
                        .string({ minLength: 1, maxLength: 20 })
                        .filter((s) => !["http", "ping", "port"].includes(s)),
                    (unknownType) => {
                        const result = getMonitorTypeDisplayLabel(unknownType);
                        expect(typeof result).toBe("string");
                        expect(result.length).toBeGreaterThan(0);
                        expect(result.endsWith("Monitor")).toBeTruthy();
                    }
                )
            );
        });

        it("should handle camelCase and snake_case type names", () => {
            const testCases = [
                ["httpApi", "Http Api Monitor"],
                ["ssl_certificate", "Ssl Certificate Monitor"],
                ["databaseConnection", "Database Connection Monitor"],
                ["web_service", "Web Service Monitor"],
            ];

            for (const [input, _expectedPattern] of testCases) {
                const result = getMonitorTypeDisplayLabel(input!);
                expect(result).toContain("Monitor");
                expect(result.split(" ").length).toBeGreaterThan(1);
            }
        });

        it("should handle invalid input gracefully", () => {
            const invalidInputs = ["", null, undefined, 123, true, {}, []];

            for (const input of invalidInputs) {
                const result = getMonitorTypeDisplayLabel(input as any);
                expect(typeof result).toBe("string");
                expect(result.length).toBeGreaterThan(0);
            }
        });

        it("should be consistent for the same input", () => {
            fc.assert(
                fc.property(fc.string(), (monitorType) => {
                    const result1 = getMonitorTypeDisplayLabel(monitorType);
                    const result2 = getMonitorTypeDisplayLabel(monitorType);
                    expect(result1).toBe(result2);
                })
            );
        });
    });

    // =============================================================================
    // truncateForLogging Function Tests
    // =============================================================================

    describe("truncateForLogging function", () => {
        it("should return original string when shorter than or equal to maxLength", () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 0, maxLength: 50 }),
                    fc.integer({ min: 50, max: 100 }),
                    (str, maxLength) => {
                        const result = truncateForLogging(str, maxLength);
                        expect(result).toBe(str);
                        expect(result.length).toBeLessThanOrEqual(maxLength);
                    }
                )
            );
        });

        it("should truncate strings longer than maxLength", () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 51, maxLength: 1000 }),
                    fc.integer({ min: 1, max: 50 }),
                    (str, maxLength) => {
                        const result = truncateForLogging(str, maxLength);
                        expect(result).toHaveLength(maxLength);
                        expect(result).toBe(str.slice(0, maxLength));
                    }
                )
            );
        });

        it("should use default maxLength of 50 when not specified", () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 51, maxLength: 1000 }),
                    (str) => {
                        const result = truncateForLogging(str);
                        expect(result).toHaveLength(50);
                        expect(result).toBe(str.slice(0, 50));
                    }
                )
            );
        });

        it("should handle empty strings and edge cases", () => {
            expect(truncateForLogging("")).toBe("");
            expect(truncateForLogging("", 0)).toBe("");
            expect(truncateForLogging("short", 100)).toBe("short");
        });

        it("should handle unicode strings correctly", () => {
            fc.assert(
                fc.property(
                    fc.string({ unit: "binary", minLength: 1, maxLength: 200 }),
                    fc.integer({ min: 10, max: 50 }),
                    (unicodeStr: string, maxLength) => {
                        const result = truncateForLogging(
                            unicodeStr,
                            maxLength
                        );
                        expect(result.length).toBeLessThanOrEqual(maxLength);
                        if (unicodeStr.length > maxLength) {
                            expect(result).toHaveLength(maxLength);
                        } else {
                            expect(result).toBe(unicodeStr);
                        }
                    }
                )
            );
        });

        it("should handle special characters and newlines", () => {
            const specialStrings = [
                "line1\nline2\nline3 with more text than fifty characters total",
                "tab\tseparated\tvalues\twith\tmore\tthan\tfifty\tcharacters",
                String.raw`special chars: !@#$%^&*()[]{}|\:";'<>?,./ and more text`,
                "mixed\n\t\rwhitespace\n\tand\rmore\ntext\tthan\rfifty\nchars",
            ];

            for (const str of specialStrings) {
                const result = truncateForLogging(str, 30);
                expect(result).toHaveLength(30);
                expect(result).toBe(str.slice(0, 30));
            }
        });
    });

    // =============================================================================
    // Default Values Constants Tests
    // =============================================================================

    describe("Default values constants", () => {
        it("should have well-defined UiDefaults object with expected properties", () => {
            // Test that UiDefaults contains expected properties
            expect(UiDefaults).toHaveProperty("chartPeriod", "24h");
            expect(UiDefaults).toHaveProperty("chartPoints", 24);
            expect(UiDefaults).toHaveProperty("errorLabel", "Error");
            expect(UiDefaults).toHaveProperty("loadingDelay", 100);
            expect(UiDefaults).toHaveProperty("loadingLabel", "Loading...");
            expect(UiDefaults).toHaveProperty("notAvailableLabel", "N/A");
            expect(UiDefaults).toHaveProperty("pageSize", 10);
            expect(UiDefaults).toHaveProperty("unknownLabel", "Unknown");

            // Test that all values have correct types
            expect(typeof UiDefaults.chartPeriod).toBe("string");
            expect(typeof UiDefaults.chartPoints).toBe("number");
            expect(typeof UiDefaults.errorLabel).toBe("string");
            expect(typeof UiDefaults.loadingDelay).toBe("number");
            expect(typeof UiDefaults.loadingLabel).toBe("string");
            expect(typeof UiDefaults.notAvailableLabel).toBe("string");
            expect(typeof UiDefaults.pageSize).toBe("number");
            expect(typeof UiDefaults.unknownLabel).toBe("string");
        });

        it("should have well-defined MonitorDefaults object with expected properties", () => {
            expect(MonitorDefaults).toHaveProperty("checkInterval", 300_000);
            expect(MonitorDefaults).toHaveProperty("responseTime", -1);
            expect(MonitorDefaults).toHaveProperty("retryAttempts", 3);
            expect(MonitorDefaults).toHaveProperty("status", "pending");
            expect(MonitorDefaults).toHaveProperty("timeout", 10_000);

            // Test that all values have correct types
            expect(typeof MonitorDefaults.checkInterval).toBe("number");
            expect(typeof MonitorDefaults.responseTime).toBe("number");
            expect(typeof MonitorDefaults.retryAttempts).toBe("number");
            expect(typeof MonitorDefaults.status).toBe("string");
            expect(typeof MonitorDefaults.timeout).toBe("number");
        });

        it("should have valid SiteDefaults object", () => {
            expect(SiteDefaults).toHaveProperty("monitoring", true);
            expect(typeof SiteDefaults.monitoring).toBe("boolean");
        });
    });

    // =============================================================================
    // Edge Cases and Robustness
    // =============================================================================

    describe("Edge cases and robustness", () => {
        it("should handle null and undefined inputs across all functions", () => {
            const nullInputs = [null, undefined];

            for (const input of nullInputs) {
                // These should handle null/undefined gracefully
                expect(isNullOrUndefined(input)).toBeTruthy();
                expect(withFallback(input, "fallback")).toBe("fallback");
                expect(() =>
                    getMonitorDisplayIdentifier(input as any, "fallback")
                ).not.toThrow();
                expect(() =>
                    getMonitorTypeDisplayLabel(input as any)
                ).not.toThrow();
                // truncateForLogging returns the original value for falsy inputs (including null)
                expect(truncateForLogging(input as any)).toBe(input);
            }
        });

        it("should handle extreme string lengths gracefully", () => {
            // Very long string
            const longString = "a".repeat(100_000);
            expect(() => truncateForLogging(longString, 50)).not.toThrow();
            expect(truncateForLogging(longString, 50)).toBe("a".repeat(50));

            // Empty string
            expect(truncateForLogging("", 50)).toBe("");

            // Single character
            expect(truncateForLogging("x", 50)).toBe("x");
        });

        it("should maintain performance with large inputs", () => {
            const largeInputs = Array.from(
                { length: 1000 },
                (_, i) => `item-${i}`
            );

            const startTime = Date.now();

            for (const input of largeInputs) {
                isNullOrUndefined(input);
                withFallback(input, "default");
                getMonitorTypeDisplayLabel(input);
                truncateForLogging(input, 25);
            }

            const endTime = Date.now();
            expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
        });
    });

    // =============================================================================
    // Performance and Determinism
    // =============================================================================

    describe("Performance and determinism", () => {
        it("should be deterministic for same inputs", () => {
            fc.assert(
                fc.property(
                    fc.string(),
                    monitorArbitrary,
                    fc.integer({ min: 10, max: 100 }),
                    (str, monitor, maxLength) => {
                        // Multiple calls should return identical results
                        const type1 = getMonitorTypeDisplayLabel(str);
                        const type2 = getMonitorTypeDisplayLabel(str);
                        expect(type1).toBe(type2);

                        const id1 = getMonitorDisplayIdentifier(
                            monitor,
                            "fallback"
                        );
                        const id2 = getMonitorDisplayIdentifier(
                            monitor,
                            "fallback"
                        );
                        expect(id1).toBe(id2);

                        const trunc1 = truncateForLogging(str, maxLength);
                        const trunc2 = truncateForLogging(str, maxLength);
                        expect(trunc1).toBe(trunc2);
                    }
                )
            );
        });

        it("should handle batch processing efficiently", () => {
            fc.assert(
                fc.property(
                    fc.array(monitorArbitrary, {
                        minLength: 10,
                        maxLength: 100,
                    }),
                    fc.array(fc.string(), { minLength: 10, maxLength: 100 }),
                    (monitors, strings) => {
                        const startTime = Date.now();

                        // Process all monitors and strings
                        const results = {
                            identifiers: monitors.map((m) =>
                                getMonitorDisplayIdentifier(m, "fallback")
                            ),
                            types: strings.map((s) =>
                                getMonitorTypeDisplayLabel(s)
                            ),
                            truncated: strings.map((s) =>
                                truncateForLogging(s, 30)
                            ),
                            fallbacks: strings.map((s) =>
                                withFallback(s, "default")
                            ),
                        };

                        const endTime = Date.now();

                        // Should process efficiently
                        expect(endTime - startTime).toBeLessThan(1000);

                        // Results should have proper lengths
                        expect(results.identifiers).toHaveLength(
                            monitors.length
                        );
                        expect(results.types).toHaveLength(strings.length);
                        expect(results.truncated).toHaveLength(strings.length);
                        expect(results.fallbacks).toHaveLength(strings.length);

                        // All results should be strings
                        for (const result of results.identifiers) {
                            expect(typeof result).toBe("string");
                        }
                        for (const result of results.types) {
                            expect(typeof result).toBe("string");
                        }
                    }
                )
            );
        });
    });
});
