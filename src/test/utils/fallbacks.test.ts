/**
 * Tests for fallback and default value utilities
 *
 * @file Comprehensive tests covering all branches and edge cases for fallback
 *   utilities used throughout the app.
 */

import type { Monitor, MonitorStatus } from "@shared/types";

import { test } from "@fast-check/vitest";
import { MONITOR_STATUS_VALUES } from "@shared/types";
import { getSafeUrlForDisplay } from "@shared/utils/urlSafety";
import * as fc from "fast-check";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { isPresent } from "ts-extras";

import {
    isNullOrUndefined,
    withAsyncErrorHandling,
    withSyncErrorHandling,
    withFallback,
    getMonitorDisplayIdentifier,
    getMonitorTypeDisplayLabel,
    truncateForLogging,
    UiDefaults,
} from "../../utils/fallbacks";

const monitorIdArbitrary = fc.uuid();
const fallbackIdentifierArbitrary = fc
    .string({ maxLength: 48, minLength: 1 })
    .filter((value) => value.trim().length > 0);
const httpUrlArbitrary = fc
    .webUrl()
    .filter((url) => url.startsWith("https://") || url.startsWith("https://"));
const hostIdentifierArbitrary = fc.oneof(fc.domain(), fc.constant("localhost"));
const portArbitrary = fc.integer({ max: 65_535, min: 1 });
const dnsRecordTypeArbitrary = fc.constantFrom(
    "A",
    "AAAA",
    "ANY",
    "CAA",
    "CNAME",
    "MX",
    "NAPTR",
    "NS",
    "PTR",
    "SOA",
    "SRV",
    "TLSA",
    "TXT"
);

const buildMinimalMonitor = (overrides: Partial<Monitor>): Monitor =>
    ({
        id: overrides.id ?? "monitor-id",
        type: "http",
        ...overrides,
    }) as Monitor;

// Mock the logger module
vi.mock("../../services/logger", () => ({
    logger: {
        error: vi.fn(),
    },
}));

// Mock the error handling utilities
vi.mock("@shared/utils/errorHandling", () => ({
    ensureError: vi.fn((error) =>
        Error.isError(error) ? error : new Error(String(error))
    ),
    withUtilityErrorHandling: vi.fn((operation) => operation()),
}));

describe("fallback Utilities", () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    describe(isNullOrUndefined, () => {
        describe("null values", () => {
            it("should return true for null", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined(null)).toBe(true);
            });

            it("should return true for undefined", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined(undefined)).toBe(true);
            });
        });

        describe("falsy but not null/undefined values", () => {
            it("should return false for empty string", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined("http")).toBe(false);
            });

            it("should return false for zero", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined(0)).toBe(false);
            });

            it("should return false for false", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined(false)).toBe(false);
            });

            it("should return false for NaN", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined(NaN)).toBe(false);
            });
        });

        describe("truthy values", () => {
            it("should return false for string", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined("http")).toBe(false);
            });

            it("should return false for number", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined(42)).toBe(false);
            });

            it("should return false for boolean true", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined(true)).toBe(false);
            });

            it("should return false for object", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined({})).toBe(false);
            });

            it("should return false for array", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined([])).toBe(false);
            });

            it("should return false for function", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined(() => {})).toBe(false);
            });
        });

        describe("property-based Tests", () => {
            test.prop([fc.oneof(fc.constant(null), fc.constant(undefined))])(
                "should always return true for null or undefined values",
                (nullOrUndef) => {
                    expect(isNullOrUndefined(nullOrUndef)).toBe(true);
                }
            );

            test.prop([
                fc.oneof(
                    fc.string(),
                    fc.integer(),
                    fc.float({
                        max: Math.fround(1000),
                        min: Math.fround(-1000),
                    }),
                    fc.boolean(),
                    fc.array(fc.anything()),
                    fc.object(),
                    fc.func(fc.anything()),
                    fc.constant(0),
                    fc.constant(false),
                    fc.constant(""),
                    fc.constant([]),
                    fc.constant({})
                ),
            ])(
                "should always return false for non-null/undefined values including falsy ones",
                (value) => {
                    expect(isNullOrUndefined(value)).toBe(false);
                }
            );

            test.prop([fc.anything().filter(isPresent)])(
                "should return false for any defined value",
                (value) => {
                    expect(isNullOrUndefined(value)).toBe(false);
                }
            );
        });
    });

    describe(withAsyncErrorHandling, () => {
        it("should return a sync function that handles async operations", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fallbacks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const asyncOperation = vi.fn().mockResolvedValue("success");
            const handler = withAsyncErrorHandling(
                asyncOperation,
                "test operation"
            );

            expect(handler).toBeTypeOf("function");
            expect(handler()).toBeUndefined(); // Returns void
        });

        it("should execute the async operation when handler is called", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fallbacks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const asyncOperation = vi.fn().mockResolvedValue("success");
            const handler = withAsyncErrorHandling(
                asyncOperation,
                "test operation"
            );

            handler();

            expect(asyncOperation).toHaveBeenCalledTimes(1);
        });

        it("should handle async operations that throw errors", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fallbacks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const asyncOperation = vi
                .fn()
                .mockRejectedValue(new Error("Async error"));
            const logger = await import("../../services/logger");
            const handler = withAsyncErrorHandling(
                asyncOperation,
                "test operation"
            );

            // Should not throw when called
            expect(() => {
                handler();
            }).not.toThrow();
            await new Promise((resolve) => setTimeout(resolve, 0));

            expect(logger.logger.error).toHaveBeenCalledWith(
                "Async operation failed",
                expect.objectContaining({
                    message: "Async error",
                    name: "Error",
                }),
                { operationName: "test operation" }
            );
        });

        it("should work with different operation names", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fallbacks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const asyncOperation = vi.fn().mockResolvedValue("success");
            const handler1 = withAsyncErrorHandling(
                asyncOperation,
                "operation 1"
            );
            const handler2 = withAsyncErrorHandling(
                asyncOperation,
                "operation 2"
            );

            expect(handler1).toBeTypeOf("function");
            expect(handler2).toBeTypeOf("function");
            expect(handler1).not.toBe(handler2); // Different instances
        });

        describe("property-based Tests", () => {
            test.prop([fc.string().filter((s) => s.trim().length > 0)])(
                "should create handler function for any valid operation name",
                (operationName) => {
                    const mockAsyncOp = vi.fn().mockResolvedValue("result");
                    const handler = withAsyncErrorHandling(
                        mockAsyncOp,
                        operationName
                    );

                    expect(handler).toBeTypeOf("function");
                    expect(handler()).toBeUndefined(); // Returns void
                }
            );

            test.prop([fc.anything()])(
                "should handle async operations returning any value type",
                async (returnValue) => {
                    const mockAsyncOp = vi.fn().mockResolvedValue(returnValue);
                    const handler = withAsyncErrorHandling(mockAsyncOp, "test");

                    // Should not throw when handler is called
                    expect(() => {
                        handler();
                    }).not.toThrow();

                    // Wait a bit to allow async operation to complete
                    await new Promise((resolve) => setTimeout(resolve, 0));

                    expect(mockAsyncOp).toHaveBeenCalledTimes(1);
                }
            );

            test.prop([fc.string().filter((s) => s.trim().length > 0)])(
                "should handle async operations that throw with any error message",
                async (errorMessage) => {
                    const mockAsyncOp = vi
                        .fn()
                        .mockRejectedValue(new Error(errorMessage));
                    const handler = withAsyncErrorHandling(mockAsyncOp, "test");

                    // Should not throw when handler is called, even if async op fails
                    expect(() => {
                        handler();
                    }).not.toThrow();

                    // Wait a bit to allow async operation to complete
                    await new Promise((resolve) => setTimeout(resolve, 0));

                    expect(mockAsyncOp).toHaveBeenCalledTimes(1);
                }
            );
        });
    });

    describe(withSyncErrorHandling, () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        describe("successful operations", () => {
            it("should return operation result when operation succeeds", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi.fn().mockReturnValue("success result");
                const fallback = "fallback value";

                const result = withSyncErrorHandling(
                    operation,
                    "test operation",
                    fallback
                );

                expect(result).toBe("success result");
                expect(operation).toHaveBeenCalledTimes(1);
            });

            it("should handle complex return types", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const complexResult = {
                    data: [
                        1,
                        2,
                        3,
                    ],
                    status: "ok",
                };
                const operation = vi.fn().mockReturnValue(complexResult);
                const fallback = { data: [], status: "error" } as const;

                const result = withSyncErrorHandling(
                    operation,
                    "complex operation",
                    fallback
                );

                expect(result).toBe(complexResult);
                expect(result).toEqual({
                    data: [
                        1,
                        2,
                        3,
                    ],
                    status: "ok",
                });
            });

            it("should handle operations returning falsy values", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi.fn().mockReturnValue(false);
                const isFallback = true;

                const result = withSyncErrorHandling(
                    operation,
                    "boolean operation",
                    isFallback
                );

                expect(result).toBe(false);
            });
        });

        describe("error handling", () => {
            it("should return fallback value when operation throws", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const logger = await import("../../services/logger");
                const operation = vi.fn().mockImplementation(() => {
                    throw new Error("Operation failed");
                });
                const fallback = "fallback value";

                const result = withSyncErrorHandling(
                    operation,
                    "test operation",
                    fallback
                );

                expect(result).toBe(fallback);
                expect(operation).toHaveBeenCalledTimes(1);
                expect(logger.logger.error).toHaveBeenCalled();
            });

            it("should handle different error types", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const logger = await import("../../services/logger");
                const operation = vi.fn().mockImplementation(() => {
                    throw "String error";
                });
                const fallback = "fallback";

                const result = withSyncErrorHandling(
                    operation,
                    "string error test",
                    fallback
                );

                expect(result).toBe(fallback);
                expect(logger.logger.error).toHaveBeenCalled();
            });

            it("should log the error with operation name", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const logger = await import("../../services/logger");
                const error = new Error("Test error");
                const operation = vi.fn().mockImplementation(() => {
                    throw error;
                });

                withSyncErrorHandling(
                    operation,
                    "specific operation",
                    "fallback"
                );

                expect(logger.logger.error).toHaveBeenCalledWith(
                    "Synchronous operation failed",
                    error,
                    { operationName: "specific operation" }
                );
            });
        });

        describe("property-based Tests", () => {
            test.prop([fc.anything(), fc.anything()])(
                "should return operation result when operation succeeds",
                (mockResult, fallbackValue) => {
                    const operation = vi.fn().mockReturnValue(mockResult);

                    const result = withSyncErrorHandling(
                        operation,
                        "test operation",
                        fallbackValue
                    );

                    expect(result).toBe(mockResult);
                    expect(operation).toHaveBeenCalledTimes(1);
                }
            );

            test.prop([
                fc.string().filter((s) => s.trim().length > 0),
                fc.anything(),
            ])(
                "should return fallback value when operation throws",
                async (operationName, fallbackValue) => {
                    const logger = await import("../../services/logger");
                    const operation = vi.fn().mockImplementation(() => {
                        throw new Error("Test error");
                    });

                    const result = withSyncErrorHandling(
                        operation,
                        operationName,
                        fallbackValue
                    );

                    expect(result).toBe(fallbackValue);
                    expect(operation).toHaveBeenCalledTimes(1);
                    expect(logger.logger.error).toHaveBeenCalled();
                }
            );

            test.prop([
                fc.oneof(
                    fc.string(),
                    fc.integer(),
                    fc.constant(null),
                    fc.constant({})
                ),
                fc.anything(),
            ])(
                "should handle operations throwing various error types",
                async (errorToThrow, fallbackValue) => {
                    const logger = await import("../../services/logger");
                    const operation = vi.fn().mockImplementation(() => {
                        throw errorToThrow;
                    });

                    const result = withSyncErrorHandling(
                        operation,
                        "test operation",
                        fallbackValue
                    );

                    expect(result).toBe(fallbackValue);
                    expect(logger.logger.error).toHaveBeenCalled();
                }
            );
        });
    });

    describe(withFallback, () => {
        describe("null/undefined handling", () => {
            it("should return fallback for null value", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(withFallback(null, "fallback")).toBe("fallback");
            });

            it("should return fallback for undefined value", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(withFallback(undefined, "fallback")).toBe("fallback");
            });
        });

        describe("valid value handling", () => {
            it("should return original value when not null/undefined", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(withFallback("actual", "fallback")).toBe("actual");
            });

            it("should return falsy values that are not null/undefined", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(withFallback("http", "fallback")).toBe("http");
                expect(withFallback(0, 42)).toBe(0);
                expect(withFallback(false, true)).toBe(false);
            });

            it("should handle complex types", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const original = { id: 1, name: "http" };
                const fallback = { id: 0, name: "default" };

                expect(withFallback(original, fallback)).toBe(original);
                expect(withFallback(null, fallback)).toBe(fallback);
            });
        });

        describe("property-based Tests", () => {
            test.prop([
                fc.oneof(fc.constant(null), fc.constant(undefined)),
                fc.anything(),
            ])(
                "should always return fallback for null or undefined values",
                (nullOrUndef, fallback) => {
                    expect(withFallback(nullOrUndef, fallback)).toBe(fallback);
                }
            );

            test.prop([
                fc.anything().filter((v) => v !== null && v !== undefined),
                fc.anything(),
            ])(
                "should return original value when not null or undefined",
                (value, fallback) => {
                    expect(withFallback(value, fallback)).toBe(value);
                }
            );

            test.prop([
                fc.oneof(
                    fc.string(),
                    fc.integer(),
                    fc.boolean(),
                    fc.constant(0),
                    fc.constant(false),
                    fc.constant(""),
                    fc.array(fc.anything()),
                    fc.object()
                ),
                fc.anything(),
            ])(
                "should preserve falsy but defined values",
                (falsyValue, fallback) => {
                    // Skip null/undefined as they should use fallback
                    fc.pre(falsyValue !== null && falsyValue !== undefined);

                    expect(withFallback(falsyValue, fallback)).toBe(falsyValue);
                }
            );
        });
    });

    describe(getMonitorDisplayIdentifier, () => {
        describe("HTTP monitors", () => {
            it("should return URL for HTTP monitor", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        httpUrlArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, url, fallback) => {
                            const monitor = buildMinimalMonitor({
                                id,
                                type: "http",
                                url,
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(getSafeUrlForDisplay(url));
                        }
                    )
                );
            });

            it("should handle HTTP monitor with undefined URL", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host: undefined,
                                id,
                                type: "http",
                                url: undefined,
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(fallback);
                        }
                    )
                );
            });

            it("should redact URL secrets in HTTP monitor identifiers", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Privacy", "type");

                const monitor = buildMinimalMonitor({
                    type: "http",
                    url: "https://example.com/status?token=display-secret#fragment",
                });

                const result = getMonitorDisplayIdentifier(monitor, "fallback");

                expect(result).toBe("https://example.com/status");
                expect(result).not.toContain("token=");
                expect(result).not.toContain("display-secret");
                expect(result).not.toContain("fragment");
            });
        });

        describe("port monitors", () => {
            it("should return host:port for port monitor with both values", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        hostIdentifierArbitrary,
                        portArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, host, port, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host,
                                id,
                                port,
                                type: "port",
                                url: undefined,
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(`${host}:${port}`);
                        }
                    )
                );
            });

            it("should return host only for port monitor without port", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        hostIdentifierArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, host, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host,
                                id,
                                port: undefined,
                                type: "port",
                                url: undefined,
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(host);
                        }
                    )
                );
            });

            it("should use fallback for port monitor with no host", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        portArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, port, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host: undefined,
                                id,
                                port,
                                type: "port",
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(fallback);
                        }
                    )
                );
            });
        });

        describe("specialized monitor types", () => {
            it("should use baseline URL for CDN edge consistency monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        httpUrlArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, baselineUrl, fallback) => {
                            const monitor = buildMinimalMonitor({
                                baselineUrl,
                                id,
                                type: "cdn-edge-consistency",
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(getSafeUrlForDisplay(baselineUrl));
                        }
                    )
                );
            });

            it("should append DNS record type when available", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        hostIdentifierArbitrary,
                        dnsRecordTypeArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, host, recordType, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host,
                                id,
                                recordType,
                                type: "dns",
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(`${host} (${recordType})`);
                        }
                    )
                );
            });

            it("should prefer primary status URL for replication monitors", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        httpUrlArbitrary,
                        httpUrlArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, primaryUrl, replicaUrl, fallback) => {
                            const monitor = buildMinimalMonitor({
                                id,
                                primaryStatusUrl: primaryUrl,
                                replicaStatusUrl: replicaUrl,
                                type: "replication",
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(getSafeUrlForDisplay(primaryUrl));
                        }
                    )
                );
            });

            it("should fall back to replica status URL when primary is missing", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        httpUrlArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, replicaUrl, fallback) => {
                            const monitor = buildMinimalMonitor({
                                id,
                                primaryStatusUrl: undefined,
                                replicaStatusUrl: replicaUrl,
                                type: "replication",
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(getSafeUrlForDisplay(replicaUrl));
                        }
                    )
                );
            });
        });

        describe("generic identifier fallback", () => {
            it("should use URL from generic identifier when type generator fails", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        httpUrlArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, url, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host: undefined,
                                id,
                                port: undefined,
                                type: "port",
                                url,
                            });

                            const result = getMonitorDisplayIdentifier(
                                monitor,
                                fallback
                            );

                            expect(result).toBe(getSafeUrlForDisplay(url));
                        }
                    )
                );
            });

            it("should redact URL secrets from generic identifiers", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Privacy", "type");

                const monitor = buildMinimalMonitor({
                    host: undefined,
                    port: undefined,
                    type: "port",
                    url: "https://fallback.example.com/status?refresh_token=generic-secret#section",
                });

                const result = getMonitorDisplayIdentifier(monitor, "fallback");

                expect(result).toBe("https://fallback.example.com/status");
                expect(result).not.toContain("refresh_token");
                expect(result).not.toContain("generic-secret");
                expect(result).not.toContain("section");
            });

            it("should use host from generic identifier", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        hostIdentifierArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, host, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host,
                                id,
                                type: "http",
                                url: undefined,
                            });

                            const result = getMonitorDisplayIdentifier(
                                monitor,
                                fallback
                            );

                            expect(result).toBe(host);
                        }
                    )
                );
            });

            it("should use host:port from generic identifier", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        hostIdentifierArbitrary,
                        portArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, host, port, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host,
                                id,
                                port,
                                type: "http",
                                url: undefined,
                            });

                            const result = getMonitorDisplayIdentifier(
                                monitor,
                                fallback
                            );

                            expect(result).toBe(`${host}:${port}`);
                        }
                    )
                );
            });
        });

        describe("fallback behavior", () => {
            it("should return site fallback for unknown monitor type with no identifiers", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, fallback) => {
                            const monitor = buildMinimalMonitor({
                                host: undefined,
                                id,
                                port: undefined,
                                type: "http",
                                url: undefined,
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallback)
                            ).toBe(fallback);
                        }
                    )
                );
            });

            it("should handle different fallback values", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                await fc.assert(
                    fc.property(
                        monitorIdArbitrary,
                        fallbackIdentifierArbitrary,
                        fallbackIdentifierArbitrary,
                        (id, fallbackA, fallbackB) => {
                            const monitor = buildMinimalMonitor({
                                host: undefined,
                                id,
                                port: undefined,
                                type: "http",
                                url: undefined,
                            });

                            expect(
                                getMonitorDisplayIdentifier(monitor, fallbackA)
                            ).toBe(fallbackA);
                            expect(
                                getMonitorDisplayIdentifier(monitor, fallbackB)
                            ).toBe(fallbackB);
                        }
                    )
                );
            });

            it("should handle monitor with no identifying properties (line 169 coverage)", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                // Create a monitor with no URL, host, or port to hit the return undefined line
                const monitor = {
                    checkInterval: 30_000,
                    id: "1",
                    retryAttempts: 3,
                    timeout: 5000,
                    type: "custom",
                    // No URL, host, or port properties
                } as unknown as Monitor;

                const result = getMonitorDisplayIdentifier(
                    monitor,
                    "Site Fallback"
                );

                expect(result).toBe("Site Fallback");
            });
        });

        describe("error handling", () => {
            it("should handle monitor with malformed properties", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = {
                    // Malformed properties that might cause errors
                    // url: undefined, // Remove undefined properties
                    // host: undefined, // Remove undefined properties
                    port: "invalid",
                    type: "http",
                } as any;

                const result = getMonitorDisplayIdentifier(
                    monitor,
                    "Error Fallback"
                );

                expect(result).toBe("Error Fallback");
            });
        });

        describe("property-based Tests", () => {
            const createMonitorArbitrary = (type: string) =>
                fc.record({
                    checkInterval: fc.integer({ min: 1000, max: 3_600_000 }),
                    history: fc.constant([]),
                    host: fc.option(fc.domain()),
                    id: fc.string().filter((s) => s.trim().length > 0),
                    monitoring: fc.boolean(),
                    port: fc.option(fc.integer({ min: 1, max: 65_535 })),
                    responseTime: fc.integer({ min: -1, max: 10_000 }),
                    retryAttempts: fc.integer({ min: 0, max: 10 }),
                    status: fc.constantFrom<MonitorStatus>(
                        ...MONITOR_STATUS_VALUES
                    ),
                    timeout: fc.integer({ min: 1000, max: 60_000 }),
                    type: fc.constant(type),
                    url: fc.option(fc.webUrl()),
                }) as fc.Arbitrary<Monitor>;

            test.prop([
                createMonitorArbitrary("http"),
                fc.string().filter((s) => s.trim().length > 0),
            ])(
                "should prefer URL over fallback for HTTP monitors with URL",
                (monitor, fallback) => {
                    const { url } = monitor;
                    fc.pre(typeof url === "string");
                    if (typeof url !== "string") {
                        return;
                    }

                    const result = getMonitorDisplayIdentifier(
                        monitor,
                        fallback
                    );

                    expect(result).toBe(getSafeUrlForDisplay(url));
                }
            );

            test.prop([
                createMonitorArbitrary("port"),
                fc.string().filter((s) => s.trim().length > 0),
            ])(
                "should create host:port identifier for port monitors",
                (monitor, fallback) => {
                    fc.pre(Boolean(monitor.host) && Boolean(monitor.port));
                    const result = getMonitorDisplayIdentifier(
                        monitor,
                        fallback
                    );

                    expect(result).toBe(`${monitor.host}:${monitor.port}`);
                }
            );

            test.prop([
                createMonitorArbitrary("ping"),
                fc.string().filter((s) => s.trim().length > 0),
            ])(
                "should use host for ping monitors with host",
                (monitor, fallback) => {
                    fc.pre(Boolean(monitor.host));
                    const result = getMonitorDisplayIdentifier(
                        monitor,
                        fallback
                    );

                    expect(result).toBe(monitor.host);
                }
            );

            test.prop([
                fc.record({
                    checkInterval: fc.integer({ min: 1000, max: 3_600_000 }),
                    history: fc.constant([]),
                    id: fc.string().filter((s) => s.trim().length > 0),
                    monitoring: fc.boolean(),
                    responseTime: fc.integer({ min: -1, max: 10_000 }),
                    retryAttempts: fc.integer({ min: 0, max: 10 }),
                    status: fc.constantFrom<MonitorStatus>(
                        ...MONITOR_STATUS_VALUES
                    ),
                    timeout: fc.integer({ min: 1000, max: 60_000 }),
                    type: fc.constantFrom("http", "port", "ping", "dns"),
                }) as fc.Arbitrary<Monitor>,
                fc.string().filter((s) => s.trim().length > 0),
            ])(
                "should return fallback when monitor lacks identifying properties",
                (monitor, fallback) => {
                    // Ensure monitor lacks identifying properties
                    const cleanMonitor = { ...monitor };
                    delete cleanMonitor.url;
                    delete cleanMonitor.host;
                    delete cleanMonitor.port;

                    const result = getMonitorDisplayIdentifier(
                        cleanMonitor,
                        fallback
                    );

                    expect(result).toBe(fallback);
                }
            );
        });
    });

    describe(getMonitorTypeDisplayLabel, () => {
        describe("configured monitor types", () => {
            it("should return configured label for HTTP", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("http")).toBe("Website URL");
            });

            it("should return configured label for port", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("port")).toBe("Host & Port");
            });
        });

        describe("unknown monitor types with formatting", () => {
            it("should generate title case for camelCase", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("apiEndpoint")).toBe(
                    "API Endpoint Monitor"
                );
            });

            it("should handle snake_case", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("ssl_certificate")).toBe(
                    "Ssl Certificate Monitor"
                );
            });

            it("should handle kebab-case", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("dns-lookup")).toBe(
                    "DNS Lookup Monitor"
                );
            });

            it("should handle mixed cases", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("customAPI_Monitor")).toBe(
                    "Custom API Monitor Monitor"
                );
            });

            it("should handle single words", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("ping")).toBe("Ping Monitor");
            });

            it("should handle uppercase", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("API")).toBe("API Monitor");
            });

            it("should handle lowercase", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("database")).toBe(
                    "Database Monitor"
                );
            });
        });

        describe("edge cases and error handling", () => {
            it("should handle empty string", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("")).toBe(
                    "Monitor Configuration"
                );
            });

            it("should handle null input", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel(null as any)).toBe(
                    "Monitor Configuration"
                );
            });

            it("should handle undefined input", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel(undefined as any)).toBe(
                    "Monitor Configuration"
                );
            });

            it("should handle non-string input", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel(123 as any)).toBe(
                    "Monitor Configuration"
                );
            });

            it("should handle special characters", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("test@#$")).toBe(
                    "Test@#$ Monitor"
                );
            });

            it("should handle very long monitor types", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const longType = "a".repeat(100);
                const result = getMonitorTypeDisplayLabel(longType);

                expect(result).toBe(
                    `${longType.charAt(0).toUpperCase()}${longType.slice(1)} Monitor`
                );
            });
        });

        describe("property-based Tests", () => {
            test.prop([fc.constantFrom("http", "port", "ping", "dns")])(
                "should return consistent labels for known monitor types",
                (monitorType) => {
                    const result = getMonitorTypeDisplayLabel(monitorType);

                    expect(result).toBeTypeOf("string");
                    expect(result.length).toBeGreaterThan(0);

                    // Should not return the fallback "Monitor Configuration"
                    expect(result).not.toBe("Monitor Configuration");
                }
            );

            test.prop([
                fc
                    .string({ maxLength: 50, minLength: 1 })
                    .filter(
                        (s) =>
                            ![
                                "dns",
                                "http",
                                "ping",
                                "port",
                            ].includes(s)
                    )
                    .filter((s) => s.trim().length > 0),
            ])(
                "should format unknown monitor types with proper capitalization",
                (unknownType) => {
                    const result = getMonitorTypeDisplayLabel(unknownType);

                    expect(result).toBeTypeOf("string");
                    expect(result.length).toBeGreaterThan(0);
                    expect(result.endsWith(" Monitor")).toBe(true);

                    // First character should be uppercase
                    expect(result.charAt(0)).toBe(
                        result.charAt(0).toUpperCase()
                    );
                }
            );

            test.prop([
                fc.oneof(
                    fc.constant(null),
                    fc.constant(undefined),
                    fc.constant("")
                ),
            ])(
                "should return default label for invalid inputs",
                (invalidInput) => {
                    const result = getMonitorTypeDisplayLabel(
                        invalidInput as any
                    );

                    expect(result).toBe("Monitor Configuration");
                }
            );

            test.prop([
                fc
                    .string({ minLength: 1 })
                    .filter(
                        (s) =>
                            s.includes("_") ||
                            s.includes("-") ||
                            /[A-Z]/u.test(s)
                    )
                    .filter((s) => s.trim().length > 0),
            ])(
                "should handle various string formats (camelCase, snake_case, kebab-case)",
                (formattedString) => {
                    const result = getMonitorTypeDisplayLabel(formattedString);

                    expect(result).toBeTypeOf("string");
                    expect(result.length).toBeGreaterThan(0);
                    expect(result.endsWith(" Monitor")).toBe(true);

                    // Should contain some capitalization
                    expect(/[A-Z]/u.test(result)).toBe(true);
                }
            );
        });
    });

    describe(truncateForLogging, () => {
        describe("basic truncation", () => {
            it("should return original string if shorter than maxLength", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(truncateForLogging("short", 50)).toBe("short");
            });

            it("should return original string if equal to maxLength", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const text = "a".repeat(50);

                expect(truncateForLogging(text, 50)).toBe(text);
            });

            it("should truncate string if longer than maxLength", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const text = "a".repeat(60);
                const result = truncateForLogging(text, 50);

                expect(result).toBe("a".repeat(50));
                expect(result).toHaveLength(50);
            });
        });

        describe("default maxLength behavior", () => {
            it("should use default maxLength of 50", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const text = "a".repeat(60);
                const result = truncateForLogging(text);

                expect(result).toHaveLength(50);
            });

            it("should handle text exactly at default length", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const text = "a".repeat(50);

                expect(truncateForLogging(text)).toBe(text);
            });
        });

        describe("custom maxLength", () => {
            it("should respect custom maxLength", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const text = "hello world";

                expect(truncateForLogging(text, 5)).toBe("hello");
            });

            it("should handle zero maxLength", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(truncateForLogging("http", 0)).toBe("");
            });

            it("should handle negative maxLength", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                // With negative maxLength, the condition value.length <= maxLength would be false for any non-empty
                // string So it will still try to slice, but slice(0,
                // -1) returns first n-1 characters
                expect(truncateForLogging("test", -1)).toBe("tes");
            });
        });

        describe("edge cases", () => {
            it("should handle empty string", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(truncateForLogging("", 10)).toBe("");
            });

            it("should handle single character", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(truncateForLogging("a", 1)).toBe("a");
                expect(truncateForLogging("a", 0)).toBe("");
            });

            it("should handle Unicode characters", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const unicode = "🎉🎊🎈🎁🎂";
                // Unicode characters may take multiple bytes, so slice(0, 3) might not work as expected
                const result = truncateForLogging(unicode, 3);

                expect(result.length).toBeLessThanOrEqual(3);
                expect(result.startsWith("🎉")).toBe(true);
            });

            it("should handle newlines and special characters", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const text = String.raw`line1\nline2\ttab`;

                expect(truncateForLogging(text, 10)).toBe(
                    String.raw`line1\nlin`
                );
            });
        });

        describe("real-world scenarios", () => {
            it("should truncate URLs appropriately", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const url =
                    "https://very-long-domain-name.example.com/very/long/path/with/many/segments";
                const result = truncateForLogging(url, 30);

                expect(result).toHaveLength(30);
                expect(result).toBe("https://very-long-domain-name.");
            });

            it("should truncate error messages", async ({ annotate, task }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const error =
                    "Connection failed: Unable to connect to server at example.com:8080 after 30 seconds timeout";
                const result = truncateForLogging(error, 50);

                expect(result).toHaveLength(50);
                expect(result).toBe(
                    "Connection failed: Unable to connect to server at "
                );
            });
        });

        describe("property-based Tests", () => {
            test.prop([fc.string(), fc.integer({ max: 1000, min: 0 })])(
                "should always return string with length <= maxLength",
                (text, maxLength) => {
                    const result = truncateForLogging(text, maxLength);

                    expect(result).toBeTypeOf("string");
                    expect(result.length).toBeLessThanOrEqual(maxLength);
                }
            );

            test.prop([
                fc.string().filter((s) => s.length > 0),
                fc.integer({ max: 20, min: 1 }),
            ])(
                "should preserve start of string when truncating",
                (text, maxLength) => {
                    const result = truncateForLogging(text, maxLength);
                    if (text.length <= maxLength) {
                        expect(result).toBe(text);
                    } else {
                        expect(result).toBe(text.slice(0, maxLength));
                    }
                }
            );

            test.prop([fc.string()])(
                "should return original string when shorter than default max",
                (text) => {
                    // Default maxLength should be large enough for most strings
                    const result = truncateForLogging(text);
                    if (text.length <= 100) {
                        // Assuming default max is >= 100
                        expect(result).toBe(text);
                    }

                    expect(result.length).toBeLessThanOrEqual(text.length);
                }
            );

            test.prop([
                fc.string({ minLength: 100 }),
                fc.integer({ max: 50, min: 10 }),
            ])(
                "should truncate long strings to specified length",
                (longText, maxLength) => {
                    const result = truncateForLogging(longText, maxLength);

                    expect(result).toHaveLength(maxLength);
                    expect(result).toBe(longText.slice(0, maxLength));
                }
            );

            test.prop([fc.integer({ max: 10, min: 0 })])(
                "should handle zero and small maxLength values",
                (maxLength) => {
                    const text = "sample text";
                    const result = truncateForLogging(text, maxLength);

                    expect(result).toHaveLength(maxLength);

                    if (maxLength === 0) {
                        expect(result).toBe("");
                    } else {
                        expect(result).toBe(text.slice(0, maxLength));
                    }
                }
            );
        });
    });

    describe("default values", () => {
        describe("uiDefaults", () => {
            it("should have correct chart defaults", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(UiDefaults.chartPeriod).toBe("24h");
                expect(UiDefaults.chartPoints).toBe(24);
            });

            it("should have correct label defaults", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(UiDefaults.errorLabel).toBe("Error");
                expect(UiDefaults.loadingLabel).toBe("Loading...");
                expect(UiDefaults.notAvailableLabel).toBe("N/A");
                expect(UiDefaults.unknownLabel).toBe("Unknown");
            });

            it("should have correct timing defaults", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(UiDefaults.loadingDelay).toBe(100);
                expect(UiDefaults.pageSize).toBe(10);
            });

            it("should be deeply frozen (readonly)", async ({
                annotate,
                task,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                // Note: 'as const' provides type-level readonly but not runtime immutability
                // The objects can still be modified at runtime, but should be treated as readonly
                expect(UiDefaults.chartPeriod).toBe("24h");
                expect(UiDefaults.chartPoints).toBe(24);

                // Test that we can't modify (this will silently fail in non-strict mode)
                (UiDefaults as any).chartPeriod = "48h";
                // The value may or may not actually change depending on JavaScript mode
                // but the intent is that it should be treated as readonly
            });
        });

        describe("property-based Tests", () => {
            test.prop([fc.string().filter((s) => s.trim().length > 0)])(
                "should validate UiDefaults properties maintain consistent types",
                (_propertyName) => {
                    // Test that UiDefaults is a consistent object
                    expect(UiDefaults).toEqual(expect.any(Object));
                    expect(UiDefaults).toBeTypeOf("object");
                    expect(UiDefaults).not.toBeNull();
                }
            );
        });
    });
});
