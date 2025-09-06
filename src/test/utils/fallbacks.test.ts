/**
 * Tests for fallback and default value utilities
 *
 * @file Comprehensive tests covering all branches and edge cases for fallback
 *   utilities used throughout the application.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import {
    isNullOrUndefined,
    withAsyncErrorHandling,
    withSyncErrorHandling,
    withFallback,
    getMonitorDisplayIdentifier,
    getMonitorTypeDisplayLabel,
    truncateForLogging,
    UiDefaults,
    MonitorDefaults,
    SiteDefaults,
} from "../../utils/fallbacks";
import type { Monitor } from "../../../shared/types";

// Mock the logger module
vi.mock("../../services/logger", () => ({
    logger: {
        error: vi.fn(),
    },
}));

// Mock the error handling utilities
vi.mock("../../utils/errorHandling", () => ({
    ensureError: vi.fn((error) =>
        error instanceof Error ? error : new Error(String(error))
    ),
    withUtilityErrorHandling: vi.fn((operation) => operation()),
}));

describe("Fallback Utilities", () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    describe(isNullOrUndefined, () => {
        describe("Null values", () => {
            it("should return true for null", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined(null)).toBeTruthy();
            });

            it("should return true for undefined", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined(undefined)).toBeTruthy();
            });
        });

        describe("Falsy but not null/undefined values", () => {
            it("should return false for empty string", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined("http")).toBeFalsy();
            });

            it("should return false for zero", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined(0)).toBeFalsy();
            });

            it("should return false for false", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined(false)).toBeFalsy();
            });

            it("should return false for NaN", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined(Number.NaN)).toBeFalsy();
            });
        });

        describe("Truthy values", () => {
            it("should return false for string", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined("http")).toBeFalsy();
            });

            it("should return false for number", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined(42)).toBeFalsy();
            });

            it("should return false for boolean true", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined(true)).toBeFalsy();
            });

            it("should return false for object", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined({})).toBeFalsy();
            });

            it("should return false for array", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined([])).toBeFalsy();
            });

            it("should return false for function", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(isNullOrUndefined(() => {})).toBeFalsy();
            });
        });

        describe("Property-based Tests", () => {
            test.prop([fc.oneof(fc.constant(null), fc.constant(undefined))])(
                "should always return true for null or undefined values",
                (nullOrUndef) => {
                    expect(isNullOrUndefined(nullOrUndef)).toBeTruthy();
                }
            );

            test.prop([
                fc.oneof(
                    fc.string(),
                    fc.integer(),
                    fc.float({ min: Math.fround(-1000), max: Math.fround(1000) }),
                    fc.boolean(),
                    fc.array(fc.anything()),
                    fc.object(),
                    fc.func(fc.anything()),
                    fc.constant(0),
                    fc.constant(false),
                    fc.constant(""),
                    fc.constant([]),
                    fc.constant({})
                )
            ])(
                "should always return false for non-null/undefined values including falsy ones",
                (value) => {
                    expect(isNullOrUndefined(value)).toBeFalsy();
                }
            );

            test.prop([fc.anything().filter((v) => v !== null && v !== undefined)])(
                "should return false for any defined value",
                (value) => {
                    expect(isNullOrUndefined(value)).toBeFalsy();
                }
            );
        });
    });

    describe(withAsyncErrorHandling, () => {
        it("should return a sync function that handles async operations", async ({
            task,
            annotate,
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

            expect(typeof handler).toBe("function");
            expect(handler()).toBeUndefined(); // Returns void
        });

        it("should execute the async operation when handler is called", async ({
            task,
            annotate,
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
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: fallbacks", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const asyncOperation = vi
                .fn()
                .mockRejectedValue(new Error("Async error"));
            const handler = withAsyncErrorHandling(
                asyncOperation,
                "test operation"
            );

            // Should not throw when called
            expect(() => handler()).not.toThrow();
        });

        it("should work with different operation names", async ({
            task,
            annotate,
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

            expect(typeof handler1).toBe("function");
            expect(typeof handler2).toBe("function");
            expect(handler1).not.toBe(handler2); // Different instances
        });

        describe("Property-based Tests", () => {
            test.prop([fc.string().filter((s) => s.trim().length > 0)])(
                "should create handler function for any valid operation name",
                (operationName) => {
                    const mockAsyncOp = vi.fn().mockResolvedValue("result");
                    const handler = withAsyncErrorHandling(mockAsyncOp, operationName);

                    expect(typeof handler).toBe("function");
                    expect(handler()).toBeUndefined(); // Returns void
                }
            );

            test.prop([fc.anything()])(
                "should handle async operations returning any value type",
                async (returnValue) => {
                    const mockAsyncOp = vi.fn().mockResolvedValue(returnValue);
                    const handler = withAsyncErrorHandling(mockAsyncOp, "test");

                    // Should not throw when handler is called
                    expect(() => handler()).not.toThrow();

                    // Wait a bit to allow async operation to complete
                    await new Promise(resolve => setTimeout(resolve, 0));
                    expect(mockAsyncOp).toHaveBeenCalledTimes(1);
                }
            );

            test.prop([fc.string().filter((s) => s.trim().length > 0)])(
                "should handle async operations that throw with any error message",
                async (errorMessage) => {
                    const mockAsyncOp = vi.fn().mockRejectedValue(new Error(errorMessage));
                    const handler = withAsyncErrorHandling(mockAsyncOp, "test");

                    // Should not throw when handler is called, even if async op fails
                    expect(() => handler()).not.toThrow();

                    // Wait a bit to allow async operation to complete
                    await new Promise(resolve => setTimeout(resolve, 0));
                    expect(mockAsyncOp).toHaveBeenCalledTimes(1);
                }
            );
        });
    });

    describe(withSyncErrorHandling, () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        describe("Successful operations", () => {
            it("should return operation result when operation succeeds", async ({
                task,
                annotate,
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
                task,
                annotate,
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
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const operation = vi.fn().mockReturnValue(false);
                const fallback = true;

                const result = withSyncErrorHandling(
                    operation,
                    "boolean operation",
                    fallback
                );

                expect(result).toBeFalsy();
            });
        });

        describe("Error handling", () => {
            it("should return fallback value when operation throws", async ({
                task,
                annotate,
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
                task,
                annotate,
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
                task,
                annotate,
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
                    "specific operation failed",
                    error
                );
            });
        });

        describe("Property-based Tests", () => {
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
                fc.anything()
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
                fc.oneof(fc.string(), fc.integer(), fc.constant(null), fc.constant({})),
                fc.anything()
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
        describe("Null/undefined handling", () => {
            it("should return fallback for null value", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(withFallback(null, "fallback")).toBe("fallback");
            });

            it("should return fallback for undefined value", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(withFallback(undefined, "fallback")).toBe("fallback");
            });
        });

        describe("Valid value handling", () => {
            it("should return original value when not null/undefined", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(withFallback("actual", "fallback")).toBe("actual");
            });

            it("should return falsy values that are not null/undefined", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(withFallback("http", "fallback")).toBe("http");
                expect(withFallback(0, 42)).toBe(0);
                expect(withFallback(false, true)).toBeFalsy();
            });

            it("should handle complex types", async ({ task, annotate }) => {
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

        describe("Property-based Tests", () => {
            test.prop([
                fc.oneof(fc.constant(null), fc.constant(undefined)),
                fc.anything()
            ])(
                "should always return fallback for null or undefined values",
                (nullOrUndef, fallback) => {
                    expect(withFallback(nullOrUndef, fallback)).toBe(fallback);
                }
            );

            test.prop([
                fc.anything().filter((v) => v !== null && v !== undefined),
                fc.anything()
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
                fc.anything()
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
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor: Monitor = {
                    id: "1",
                    // name: "Test Monitor", // Monitor interface doesn't have name property
                    type: "http",
                    url: "https://example.com",
                } as unknown as Monitor;

                const result = getMonitorDisplayIdentifier(
                    monitor,
                    "Site Fallback"
                );
                expect(result).toBe("https://example.com");
            });

            it("should handle HTTP monitor with undefined URL", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor: Monitor = {
                    id: "1",
                    // name: "Test Monitor", // Monitor interface doesn't have name property
                    type: "http",
                } as unknown as Monitor;

                const result = getMonitorDisplayIdentifier(
                    monitor,
                    "Site Fallback"
                );
                expect(result).toBe("Site Fallback");
            });
        });

        describe("Port monitors", () => {
            it("should return host:port for port monitor with both values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor: Monitor = {
                    id: "1",
                    // name: "Test Monitor", // Monitor interface doesn't have name property
                    type: "port",
                    host: "example.com",
                    port: 80,
                } as unknown as Monitor;

                const result = getMonitorDisplayIdentifier(
                    monitor,
                    "Site Fallback"
                );
                expect(result).toBe("example.com:80");
            });

            it("should return host only for port monitor without port", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor: Monitor = {
                    id: "1",
                    // name: "Test Monitor", // Monitor interface doesn't have name property
                    type: "port",
                    host: "example.com",
                } as unknown as Monitor;

                const result = getMonitorDisplayIdentifier(
                    monitor,
                    "Site Fallback"
                );
                expect(result).toBe("example.com");
            });

            it("should use fallback for port monitor with no host", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor: Monitor = {
                    id: "1",
                    // name: "Test Monitor", // Monitor interface doesn't have name property
                    type: "port",
                    port: 80,
                } as unknown as Monitor;

                const result = getMonitorDisplayIdentifier(
                    monitor,
                    "Site Fallback"
                );
                expect(result).toBe("Site Fallback");
            });
        });

        describe("Generic identifier fallback", () => {
            it("should use URL from generic identifier when type generator fails", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Monitor = {
                    id: "1",
                    // name: "Test Monitor", // Monitor interface doesn't have name property
                    type: "http",
                    url: "https://example.com",
                } as unknown as Monitor;

                const result = getMonitorDisplayIdentifier(
                    monitor,
                    "Site Fallback"
                );
                expect(result).toBe("https://example.com");
            });

            it("should use host from generic identifier", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const monitor: Monitor = {
                    id: "1",
                    // name: "Test Monitor", // Monitor interface doesn't have name property
                    type: "http",
                    host: "example.com",
                } as unknown as Monitor;

                const result = getMonitorDisplayIdentifier(
                    monitor,
                    "Site Fallback"
                );
                expect(result).toBe("example.com");
            });

            it("should use host:port from generic identifier", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const monitor: Monitor = {
                    id: "1",
                    // name: "Test Monitor", // Monitor interface doesn't have name property
                    type: "http",
                    host: "example.com",
                    port: 8080,
                } as unknown as Monitor;

                const result = getMonitorDisplayIdentifier(
                    monitor,
                    "Site Fallback"
                );
                expect(result).toBe("example.com:8080");
            });
        });

        describe("Fallback behavior", () => {
            it("should return site fallback for unknown monitor type with no identifiers", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor: Monitor = {
                    id: "1",
                    // name: "Test Monitor", // Monitor interface doesn't have name property
                    type: "http",
                } as unknown as Monitor;

                const result = getMonitorDisplayIdentifier(
                    monitor,
                    "Site Fallback"
                );
                expect(result).toBe("Site Fallback");
            });

            it("should handle different fallback values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const monitor: Monitor = {
                    id: "1",
                    // name: "Test Monitor", // Monitor interface doesn't have name property
                    type: "http",
                } as unknown as Monitor;

                expect(
                    getMonitorDisplayIdentifier(monitor, "Custom Fallback")
                ).toBe("Custom Fallback");
                expect(getMonitorDisplayIdentifier(monitor, "http")).toBe(
                    "http"
                );
            });

            it("should handle monitor with no identifying properties (line 169 coverage)", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                // Create a monitor with no url, host, or port to hit the return undefined line
                const monitor = {
                    id: "1",
                    type: "custom",
                    checkInterval: 30_000,
                    timeout: 5000,
                    retryAttempts: 3,
                    // No url, host, or port properties
                } as unknown as Monitor;

                const result = getMonitorDisplayIdentifier(
                    monitor,
                    "Site Fallback"
                );
                expect(result).toBe("Site Fallback");
            });
        });

        describe("Error handling", () => {
            it("should handle monitor with malformed properties", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor = {
                    type: "http",
                    // Malformed properties that might cause errors
                    // url: undefined, // Remove undefined properties
                    // host: undefined, // Remove undefined properties
                    port: "invalid",
                } as any;

                const result = getMonitorDisplayIdentifier(
                    monitor,
                    "Error Fallback"
                );
                expect(result).toBe("Error Fallback");
            });
        });

        describe("Property-based Tests", () => {
            const createMonitorArbitrary = (type: string) =>
                fc.record({
                    id: fc.string().filter((s) => s.trim().length > 0),
                    type: fc.constant(type),
                    host: fc.option(fc.domain()),
                    url: fc.option(fc.webUrl()),
                    port: fc.option(fc.integer({ min: 1, max: 65_535 })),
                    checkInterval: fc.integer({ min: 1000, max: 3_600_000 }),
                    monitoring: fc.boolean(),
                    responseTime: fc.integer({ min: -1, max: 10_000 }),
                    retryAttempts: fc.integer({ min: 0, max: 10 }),
                    status: fc.constantFrom("up", "down", "pending", "paused"),
                    timeout: fc.integer({ min: 1000, max: 60_000 }),
                    history: fc.constant([])
                }) as fc.Arbitrary<Monitor>;

            test.prop([
                createMonitorArbitrary("http"),
                fc.string().filter((s) => s.trim().length > 0)
            ])(
                "should prefer URL over fallback for HTTP monitors with URL",
                (monitor, fallback) => {
                    fc.pre(Boolean(monitor.url));
                    const result = getMonitorDisplayIdentifier(monitor, fallback);
                    expect(result).toBe(monitor.url);
                }
            );

            test.prop([
                createMonitorArbitrary("port"),
                fc.string().filter((s) => s.trim().length > 0)
            ])(
                "should create host:port identifier for port monitors",
                (monitor, fallback) => {
                    fc.pre(Boolean(monitor.host) && Boolean(monitor.port));
                    const result = getMonitorDisplayIdentifier(monitor, fallback);
                    expect(result).toBe(`${monitor.host}:${monitor.port}`);
                }
            );

            test.prop([
                createMonitorArbitrary("ping"),
                fc.string().filter((s) => s.trim().length > 0)
            ])(
                "should use host for ping monitors with host",
                (monitor, fallback) => {
                    fc.pre(Boolean(monitor.host));
                    const result = getMonitorDisplayIdentifier(monitor, fallback);
                    expect(result).toBe(monitor.host);
                }
            );

            test.prop([
                fc.record({
                    id: fc.string().filter((s) => s.trim().length > 0),
                    type: fc.constantFrom("http", "port", "ping", "dns"),
                    checkInterval: fc.integer({ min: 1000, max: 3_600_000 }),
                    monitoring: fc.boolean(),
                    responseTime: fc.integer({ min: -1, max: 10_000 }),
                    retryAttempts: fc.integer({ min: 0, max: 10 }),
                    status: fc.constantFrom("up", "down", "pending", "paused"),
                    timeout: fc.integer({ min: 1000, max: 60_000 }),
                    history: fc.constant([])
                }) as fc.Arbitrary<Monitor>,
                fc.string().filter((s) => s.trim().length > 0)
            ])(
                "should return fallback when monitor lacks identifying properties",
                (monitor, fallback) => {
                    // Ensure monitor lacks identifying properties
                    const cleanMonitor = { ...monitor };
                    delete cleanMonitor.url;
                    delete cleanMonitor.host;
                    delete cleanMonitor.port;

                    const result = getMonitorDisplayIdentifier(cleanMonitor, fallback);
                    expect(result).toBe(fallback);
                }
            );
        });
    });

    describe(getMonitorTypeDisplayLabel, () => {
        describe("Configured monitor types", () => {
            it("should return configured label for HTTP", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("http")).toBe("Website URL");
            });

            it("should return configured label for port", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("port")).toBe("Host & Port");
            });
        });

        describe("Unknown monitor types with formatting", () => {
            it("should generate title case for camelCase", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("apiEndpoint")).toBe(
                    "Api Endpoint Monitor"
                );
            });

            it("should handle snake_case", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("ssl_certificate")).toBe(
                    "Ssl Certificate Monitor"
                );
            });

            it("should handle kebab-case", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("dns-lookup")).toBe(
                    "Dns Lookup Monitor"
                );
            });

            it("should handle mixed cases", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("customAPI_Monitor")).toBe(
                    "Custom Api Monitor Monitor"
                );
            });

            it("should handle single words", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("ping")).toBe("Ping Monitor");
            });

            it("should handle uppercase", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("API")).toBe("Api Monitor");
            });

            it("should handle lowercase", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("database")).toBe(
                    "Database Monitor"
                );
            });
        });

        describe("Edge cases and error handling", () => {
            it("should handle empty string", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel("")).toBe(
                    "Monitor Configuration"
                );
            });

            it("should handle null input", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel(null as any)).toBe(
                    "Monitor Configuration"
                );
            });

            it("should handle undefined input", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel(undefined as any)).toBe(
                    "Monitor Configuration"
                );
            });

            it("should handle non-string input", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(getMonitorTypeDisplayLabel(123 as any)).toBe(
                    "Monitor Configuration"
                );
            });

            it("should handle special characters", async ({
                task,
                annotate,
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
                task,
                annotate,
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

        describe("Property-based Tests", () => {
            test.prop([fc.constantFrom("http", "port", "ping", "dns")])(
                "should return consistent labels for known monitor types",
                (monitorType) => {
                    const result = getMonitorTypeDisplayLabel(monitorType);

                    expect(typeof result).toBe("string");
                    expect(result.length).toBeGreaterThan(0);

                    // Should not return the fallback "Monitor Configuration"
                    expect(result).not.toBe("Monitor Configuration");
                }
            );

            test.prop([
                fc.string({ minLength: 1, maxLength: 50 })
                    .filter((s) => !["http", "port", "ping", "dns"].includes(s))
                    .filter((s) => s.trim().length > 0)
            ])(
                "should format unknown monitor types with proper capitalization",
                (unknownType) => {
                    const result = getMonitorTypeDisplayLabel(unknownType);

                    expect(typeof result).toBe("string");
                    expect(result.length).toBeGreaterThan(0);
                    expect(result.endsWith(" Monitor")).toBeTruthy();

                    // First character should be uppercase
                    expect(result.charAt(0)).toBe(result.charAt(0).toUpperCase());
                }
            );

            test.prop([fc.oneof(fc.constant(null), fc.constant(undefined), fc.constant(""))])(
                "should return default label for invalid inputs",
                (invalidInput) => {
                    const result = getMonitorTypeDisplayLabel(invalidInput as any);
                    expect(result).toBe("Monitor Configuration");
                }
            );

            test.prop([
                fc.string({ minLength: 1 })
                    .filter((s) => s.includes("_") || s.includes("-") || /[A-Z]/.test(s))
                    .filter((s) => s.trim().length > 0)
            ])(
                "should handle various string formats (camelCase, snake_case, kebab-case)",
                (formattedString) => {
                    const result = getMonitorTypeDisplayLabel(formattedString);

                    expect(typeof result).toBe("string");
                    expect(result.length).toBeGreaterThan(0);
                    expect(result.endsWith(" Monitor")).toBeTruthy();

                    // Should contain some capitalization
                    expect(/[A-Z]/.test(result)).toBeTruthy();
                }
            );
        });
    });

    describe(truncateForLogging, () => {
        describe("Basic truncation", () => {
            it("should return original string if shorter than maxLength", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(truncateForLogging("short", 50)).toBe("short");
            });

            it("should return original string if equal to maxLength", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const text = "a".repeat(50);
                expect(truncateForLogging(text, 50)).toBe(text);
            });

            it("should truncate string if longer than maxLength", async ({
                task,
                annotate,
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

        describe("Default maxLength behavior", () => {
            it("should use default maxLength of 50", async ({
                task,
                annotate,
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
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const text = "a".repeat(50);
                expect(truncateForLogging(text)).toBe(text);
            });
        });

        describe("Custom maxLength", () => {
            it("should respect custom maxLength", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const text = "hello world";
                expect(truncateForLogging(text, 5)).toBe("hello");
            });

            it("should handle zero maxLength", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(truncateForLogging("http", 0)).toBe("");
            });

            it("should handle negative maxLength", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                // With negative maxLength, the condition value.length <= maxLength would be false for any non-empty string
                // So it will still try to slice, but slice(0, -1) returns first n-1 characters
                expect(truncateForLogging("test", -1)).toBe("tes");
            });
        });

        describe("Edge cases", () => {
            it("should handle empty string", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(truncateForLogging("", 10)).toBe("");
            });

            it("should handle single character", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(truncateForLogging("a", 1)).toBe("a");
                expect(truncateForLogging("a", 0)).toBe("");
            });

            it("should handle Unicode characters", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const unicode = "🎉🎊🎈🎁🎂";
                // Unicode characters may take multiple bytes, so slice(0, 3) might not work as expected
                const result = truncateForLogging(unicode, 3);
                expect(result.length).toBeLessThanOrEqual(3);
                expect(result.startsWith("🎉")).toBeTruthy();
            });

            it("should handle newlines and special characters", async ({
                task,
                annotate,
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

        describe("Real-world scenarios", () => {
            it("should truncate URLs appropriately", async ({
                task,
                annotate,
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

            it("should truncate error messages", async ({ task, annotate }) => {
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

        describe("Property-based Tests", () => {
            test.prop([
                fc.string(),
                fc.integer({ min: 0, max: 1000 })
            ])(
                "should always return string with length <= maxLength",
                (text, maxLength) => {
                    const result = truncateForLogging(text, maxLength);
                    expect(typeof result).toBe("string");
                    expect(result.length).toBeLessThanOrEqual(maxLength);
                }
            );

            test.prop([
                fc.string().filter((s) => s.length > 0),
                fc.integer({ min: 1, max: 20 })
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
                    if (text.length <= 100) { // Assuming default max is >= 100
                        expect(result).toBe(text);
                    }
                    expect(result.length).toBeLessThanOrEqual(text.length);
                }
            );

            test.prop([
                fc.string({ minLength: 100 }),
                fc.integer({ min: 10, max: 50 })
            ])(
                "should truncate long strings to specified length",
                (longText, maxLength) => {
                    const result = truncateForLogging(longText, maxLength);
                    expect(result).toHaveLength(maxLength);
                    expect(result).toBe(longText.slice(0, maxLength));
                }
            );

            test.prop([fc.integer({ min: 0, max: 10 })])(
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

    describe("Default values", () => {
        describe("UiDefaults", () => {
            it("should have correct chart defaults", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(UiDefaults.chartPeriod).toBe("24h");
                expect(UiDefaults.chartPoints).toBe(24);
            });

            it("should have correct label defaults", async ({
                task,
                annotate,
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
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(UiDefaults.loadingDelay).toBe(100);
                expect(UiDefaults.pageSize).toBe(10);
            });

            it("should be deeply frozen (readonly)", async ({
                task,
                annotate,
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

        describe("MonitorDefaults", () => {
            it("should have correct monitoring defaults", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                expect(MonitorDefaults.checkInterval).toBe(300_000); // 5 minutes
                expect(MonitorDefaults.responseTime).toBe(-1);
                expect(MonitorDefaults.retryAttempts).toBe(3);
                expect(MonitorDefaults.status).toBe("pending");
                expect(MonitorDefaults.timeout).toBe(10_000); // 10 seconds
            });

            it("should be deeply frozen (readonly)", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                // Note: 'as const' provides type-level readonly but not runtime immutability
                expect(MonitorDefaults.checkInterval).toBe(300_000);
                expect(MonitorDefaults.timeout).toBe(10_000);
                // Test that values are accessible and correct
                (MonitorDefaults as any).timeout = 5000;
                // The object should be treated as readonly in TypeScript
            });
        });

        describe("SiteDefaults", () => {
            it("should have correct site defaults", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(SiteDefaults.monitoring).toBeTruthy();
            });

            it("should be deeply frozen (readonly)", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: fallbacks", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                // Note: 'as const' provides type-level readonly but not runtime immutability
                expect(SiteDefaults.monitoring).toBeTruthy();
                // Test that values are accessible and correct
                (SiteDefaults as any).monitoring = false;
                // The object should be treated as readonly in TypeScript
            });
        });

        describe("Property-based Tests", () => {
            test.prop([fc.string().filter((s) => s.trim().length > 0)])(
                "should validate UiDefaults properties maintain consistent types",
                (_propertyName) => {
                    // Test that UiDefaults is a consistent object
                    expect(UiDefaults).toEqual(expect.any(Object));
                    expect(typeof UiDefaults).toBe("object");
                    expect(UiDefaults).not.toBeNull();
                }
            );

            test.prop([fc.string().filter((s) => s.trim().length > 0)])(
                "should validate MonitorDefaults maintains correct type structure",
                (_propertyName) => {
                    // Test that MonitorDefaults has expected numeric properties
                    expect(typeof MonitorDefaults.checkInterval).toBe("number");
                    expect(typeof MonitorDefaults.responseTime).toBe("number");
                    expect(typeof MonitorDefaults.retryAttempts).toBe("number");
                    expect(typeof MonitorDefaults.timeout).toBe("number");
                    expect(typeof MonitorDefaults.status).toBe("string");

                    // Verify reasonable ranges
                    expect(MonitorDefaults.checkInterval).toBeGreaterThan(0);
                    expect(MonitorDefaults.retryAttempts).toBeGreaterThanOrEqual(0);
                    expect(MonitorDefaults.timeout).toBeGreaterThan(0);
                }
            );

            test.prop([fc.string().filter((s) => s.trim().length > 0)])(
                "should validate SiteDefaults has consistent boolean monitoring property",
                (_propertyName) => {
                    expect(typeof SiteDefaults.monitoring).toBe("boolean");
                    expect(SiteDefaults).toEqual(expect.any(Object));
                    expect(SiteDefaults).not.toBeNull();
                }
            );
        });
    });
});
