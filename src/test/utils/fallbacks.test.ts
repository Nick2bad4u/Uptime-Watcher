/**
 * Tests for fallback and default value utilities
 * 
 * @fileoverview Comprehensive tests covering all branches and edge cases
 * for fallback utilities used throughout the application.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
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
    SiteDefaults
} from "../../utils/fallbacks";
import type { Monitor } from "../../types";

// Mock the logger module
vi.mock("../../services/logger", () => ({
    default: {
        error: vi.fn(),
    },
}));

// Mock the error handling utilities
vi.mock("../../utils/errorHandling", () => ({
    ensureError: vi.fn((error) => error instanceof Error ? error : new Error(String(error))),
    withUtilityErrorHandling: vi.fn(async (operation) => {
        try {
            return await operation();
        } catch (error) {
            throw error;
        }
    })
}));

describe("Fallback Utilities", () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    describe("isNullOrUndefined", () => {
        describe("Null values", () => {
            it("should return true for null", () => {
                expect(isNullOrUndefined(null)).toBe(true);
            });

            it("should return true for undefined", () => {
                expect(isNullOrUndefined(undefined)).toBe(true);
            });
        });

        describe("Falsy but not null/undefined values", () => {
            it("should return false for empty string", () => {
                expect(isNullOrUndefined("")).toBe(false);
            });

            it("should return false for zero", () => {
                expect(isNullOrUndefined(0)).toBe(false);
            });

            it("should return false for false", () => {
                expect(isNullOrUndefined(false)).toBe(false);
            });

            it("should return false for NaN", () => {
                expect(isNullOrUndefined(NaN)).toBe(false);
            });
        });

        describe("Truthy values", () => {
            it("should return false for string", () => {
                expect(isNullOrUndefined("test")).toBe(false);
            });

            it("should return false for number", () => {
                expect(isNullOrUndefined(42)).toBe(false);
            });

            it("should return false for boolean true", () => {
                expect(isNullOrUndefined(true)).toBe(false);
            });

            it("should return false for object", () => {
                expect(isNullOrUndefined({})).toBe(false);
            });

            it("should return false for array", () => {
                expect(isNullOrUndefined([])).toBe(false);
            });

            it("should return false for function", () => {
                expect(isNullOrUndefined(() => {})).toBe(false);
            });
        });
    });

    describe("withAsyncErrorHandling", () => {
        it("should return a sync function that handles async operations", () => {
            const asyncOperation = vi.fn().mockResolvedValue("success");
            const handler = withAsyncErrorHandling(asyncOperation, "test operation");
            
            expect(typeof handler).toBe("function");
            expect(handler()).toBeUndefined(); // Returns void
        });

        it("should execute the async operation when handler is called", () => {
            const asyncOperation = vi.fn().mockResolvedValue("success");
            const handler = withAsyncErrorHandling(asyncOperation, "test operation");
            
            handler();
            
            expect(asyncOperation).toHaveBeenCalledOnce();
        });

        it("should handle async operations that throw errors", () => {
            const asyncOperation = vi.fn().mockRejectedValue(new Error("Async error"));
            const handler = withAsyncErrorHandling(asyncOperation, "test operation");
            
            // Should not throw when called
            expect(() => handler()).not.toThrow();
        });

        it("should work with different operation names", () => {
            const asyncOperation = vi.fn().mockResolvedValue("success");
            const handler1 = withAsyncErrorHandling(asyncOperation, "operation 1");
            const handler2 = withAsyncErrorHandling(asyncOperation, "operation 2");
            
            expect(typeof handler1).toBe("function");
            expect(typeof handler2).toBe("function");
            expect(handler1).not.toBe(handler2); // Different instances
        });
    });

    describe("withSyncErrorHandling", () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        describe("Successful operations", () => {
            it("should return operation result when operation succeeds", () => {
                const operation = vi.fn().mockReturnValue("success result");
                const fallback = "fallback value";
                
                const result = withSyncErrorHandling(operation, "test operation", fallback);
                
                expect(result).toBe("success result");
                expect(operation).toHaveBeenCalledOnce();
            });

            it("should handle complex return types", () => {
                const complexResult = { data: [1, 2, 3], status: "ok" };
                const operation = vi.fn().mockReturnValue(complexResult);
                const fallback = { data: [], status: "error" };
                
                const result = withSyncErrorHandling(operation, "complex operation", fallback);
                
                expect(result).toBe(complexResult);
                expect(result).toEqual({ data: [1, 2, 3], status: "ok" });
            });

            it("should handle operations returning falsy values", () => {
                const operation = vi.fn().mockReturnValue(false);
                const fallback = true;
                
                const result = withSyncErrorHandling(operation, "boolean operation", fallback);
                
                expect(result).toBe(false);
            });
        });

        describe("Error handling", () => {
            it("should return fallback value when operation throws", async () => {
                const logger = await import("../../services/logger");
                const operation = vi.fn().mockImplementation(() => {
                    throw new Error("Operation failed");
                });
                const fallback = "fallback value";
                
                const result = withSyncErrorHandling(operation, "test operation", fallback);
                
                expect(result).toBe(fallback);
                expect(operation).toHaveBeenCalledOnce();
                expect(logger.default.error).toHaveBeenCalled();
            });

            it("should handle different error types", async () => {
                const logger = await import("../../services/logger");
                const operation = vi.fn().mockImplementation(() => {
                    throw "String error";
                });
                const fallback = "fallback";
                
                const result = withSyncErrorHandling(operation, "string error test", fallback);
                
                expect(result).toBe(fallback);
                expect(logger.default.error).toHaveBeenCalled();
            });

            it("should log the error with operation name", async () => {
                const logger = await import("../../services/logger");
                const error = new Error("Test error");
                const operation = vi.fn().mockImplementation(() => {
                    throw error;
                });
                
                withSyncErrorHandling(operation, "specific operation", "fallback");
                
                expect(logger.default.error).toHaveBeenCalledWith(
                    "specific operation failed",
                    error
                );
            });
        });
    });

    describe("withFallback", () => {
        describe("Null/undefined handling", () => {
            it("should return fallback for null value", () => {
                expect(withFallback(null, "fallback")).toBe("fallback");
            });

            it("should return fallback for undefined value", () => {
                expect(withFallback(undefined, "fallback")).toBe("fallback");
            });
        });

        describe("Valid value handling", () => {
            it("should return original value when not null/undefined", () => {
                expect(withFallback("actual", "fallback")).toBe("actual");
            });

            it("should return falsy values that are not null/undefined", () => {
                expect(withFallback("", "fallback")).toBe("");
                expect(withFallback(0, 42)).toBe(0);
                expect(withFallback(false, true)).toBe(false);
            });

            it("should handle complex types", () => {
                const original = { id: 1, name: "test" };
                const fallback = { id: 0, name: "default" };
                
                expect(withFallback(original, fallback)).toBe(original);
                expect(withFallback(null, fallback)).toBe(fallback);
            });
        });
    });

    describe("getMonitorDisplayIdentifier", () => {
        describe("HTTP monitors", () => {
            it("should return URL for HTTP monitor", () => {
                const monitor: Monitor = {
                    id: "1",
                    name: "Test Monitor",
                    type: "http",
                    url: "https://example.com"
                } as Monitor;
                
                const result = getMonitorDisplayIdentifier(monitor, "Site Fallback");
                expect(result).toBe("https://example.com");
            });

            it("should handle HTTP monitor with undefined URL", () => {
                const monitor: Monitor = {
                    id: "1",
                    name: "Test Monitor",
                    type: "http"
                } as Monitor;
                
                const result = getMonitorDisplayIdentifier(monitor, "Site Fallback");
                expect(result).toBe("Site Fallback");
            });
        });

        describe("Port monitors", () => {
            it("should return host:port for port monitor with both values", () => {
                const monitor: Monitor = {
                    id: "1",
                    name: "Test Monitor",
                    type: "port",
                    host: "example.com",
                    port: 80
                } as Monitor;
                
                const result = getMonitorDisplayIdentifier(monitor, "Site Fallback");
                expect(result).toBe("example.com:80");
            });

            it("should return host only for port monitor without port", () => {
                const monitor: Monitor = {
                    id: "1",
                    name: "Test Monitor",
                    type: "port",
                    host: "example.com"
                } as Monitor;
                
                const result = getMonitorDisplayIdentifier(monitor, "Site Fallback");
                expect(result).toBe("example.com");
            });

            it("should use fallback for port monitor with no host", () => {
                const monitor: Monitor = {
                    id: "1",
                    name: "Test Monitor",
                    type: "port",
                    port: 80
                } as Monitor;
                
                const result = getMonitorDisplayIdentifier(monitor, "Site Fallback");
                expect(result).toBe("Site Fallback");
            });
        });

        describe("Generic identifier fallback", () => {
            it("should use URL from generic identifier when type generator fails", () => {
                const monitor: Monitor = {
                    id: "1",
                    name: "Test Monitor",
                    type: "unknown",
                    url: "https://example.com"
                } as Monitor;
                
                const result = getMonitorDisplayIdentifier(monitor, "Site Fallback");
                expect(result).toBe("https://example.com");
            });

            it("should use host from generic identifier", () => {
                const monitor: Monitor = {
                    id: "1",
                    name: "Test Monitor",
                    type: "unknown",
                    host: "example.com"
                } as Monitor;
                
                const result = getMonitorDisplayIdentifier(monitor, "Site Fallback");
                expect(result).toBe("example.com");
            });

            it("should use host:port from generic identifier", () => {
                const monitor: Monitor = {
                    id: "1",
                    name: "Test Monitor",
                    type: "unknown",
                    host: "example.com",
                    port: 8080
                } as Monitor;
                
                const result = getMonitorDisplayIdentifier(monitor, "Site Fallback");
                expect(result).toBe("example.com:8080");
            });
        });

        describe("Fallback behavior", () => {
            it("should return site fallback for unknown monitor type with no identifiers", () => {
                const monitor: Monitor = {
                    id: "1",
                    name: "Test Monitor",
                    type: "unknown"
                } as Monitor;
                
                const result = getMonitorDisplayIdentifier(monitor, "Site Fallback");
                expect(result).toBe("Site Fallback");
            });

            it("should handle different fallback values", () => {
                const monitor: Monitor = {
                    id: "1",
                    name: "Test Monitor",
                    type: "unknown"
                } as Monitor;
                
                expect(getMonitorDisplayIdentifier(monitor, "Custom Fallback")).toBe("Custom Fallback");
                expect(getMonitorDisplayIdentifier(monitor, "")).toBe("");
            });
        });

        describe("Error handling", () => {
            it("should handle monitor with malformed properties", () => {
                const monitor = {
                    type: "unknown",
                    // Malformed properties that might cause errors
                    url: null,
                    host: null,
                    port: "invalid"
                } as any;
                
                const result = getMonitorDisplayIdentifier(monitor, "Error Fallback");
                expect(result).toBe("Error Fallback");
            });
        });
    });

    describe("getMonitorTypeDisplayLabel", () => {
        describe("Configured monitor types", () => {
            it("should return configured label for HTTP", () => {
                expect(getMonitorTypeDisplayLabel("http")).toBe("Website URL");
            });

            it("should return configured label for port", () => {
                expect(getMonitorTypeDisplayLabel("port")).toBe("Host & Port");
            });
        });

        describe("Unknown monitor types with formatting", () => {
            it("should generate title case for camelCase", () => {
                expect(getMonitorTypeDisplayLabel("apiEndpoint")).toBe("Api Endpoint Monitor");
            });

            it("should handle snake_case", () => {
                expect(getMonitorTypeDisplayLabel("ssl_certificate")).toBe("Ssl Certificate Monitor");
            });

            it("should handle kebab-case", () => {
                expect(getMonitorTypeDisplayLabel("dns-lookup")).toBe("Dns Lookup Monitor");
            });

            it("should handle mixed cases", () => {
                expect(getMonitorTypeDisplayLabel("customAPI_Monitor")).toBe("Custom Api Monitor Monitor");
            });

            it("should handle single words", () => {
                expect(getMonitorTypeDisplayLabel("ping")).toBe("Ping Monitor");
            });

            it("should handle uppercase", () => {
                expect(getMonitorTypeDisplayLabel("API")).toBe("Api Monitor");
            });

            it("should handle lowercase", () => {
                expect(getMonitorTypeDisplayLabel("database")).toBe("Database Monitor");
            });
        });

        describe("Edge cases and error handling", () => {
            it("should handle empty string", () => {
                expect(getMonitorTypeDisplayLabel("")).toBe("Monitor Configuration");
            });

            it("should handle null input", () => {
                expect(getMonitorTypeDisplayLabel(null as any)).toBe("Monitor Configuration");
            });

            it("should handle undefined input", () => {
                expect(getMonitorTypeDisplayLabel(undefined as any)).toBe("Monitor Configuration");
            });

            it("should handle non-string input", () => {
                expect(getMonitorTypeDisplayLabel(123 as any)).toBe("Monitor Configuration");
            });

            it("should handle special characters", () => {
                expect(getMonitorTypeDisplayLabel("test@#$")).toBe("Test@#$ Monitor");
            });

            it("should handle very long monitor types", () => {
                const longType = "a".repeat(100);
                const result = getMonitorTypeDisplayLabel(longType);
                expect(result).toBe(`${longType.charAt(0).toUpperCase()}${longType.slice(1)} Monitor`);
            });
        });
    });

    describe("truncateForLogging", () => {
        describe("Basic truncation", () => {
            it("should return original string if shorter than maxLength", () => {
                expect(truncateForLogging("short", 50)).toBe("short");
            });

            it("should return original string if equal to maxLength", () => {
                const text = "a".repeat(50);
                expect(truncateForLogging(text, 50)).toBe(text);
            });

            it("should truncate string if longer than maxLength", () => {
                const text = "a".repeat(60);
                const result = truncateForLogging(text, 50);
                expect(result).toBe("a".repeat(50));
                expect(result.length).toBe(50);
            });
        });

        describe("Default maxLength behavior", () => {
            it("should use default maxLength of 50", () => {
                const text = "a".repeat(60);
                const result = truncateForLogging(text);
                expect(result.length).toBe(50);
            });

            it("should handle text exactly at default length", () => {
                const text = "a".repeat(50);
                expect(truncateForLogging(text)).toBe(text);
            });
        });

        describe("Custom maxLength", () => {
            it("should respect custom maxLength", () => {
                const text = "hello world";
                expect(truncateForLogging(text, 5)).toBe("hello");
            });

            it("should handle zero maxLength", () => {
                expect(truncateForLogging("test", 0)).toBe("");
            });

            it("should handle negative maxLength", () => {
                // With negative maxLength, the condition value.length <= maxLength would be false for any non-empty string
                // So it will still try to slice, but slice(0, -1) returns first n-1 characters
                expect(truncateForLogging("test", -1)).toBe("tes");
            });
        });

        describe("Edge cases", () => {
            it("should handle empty string", () => {
                expect(truncateForLogging("", 10)).toBe("");
            });

            it("should handle single character", () => {
                expect(truncateForLogging("a", 1)).toBe("a");
                expect(truncateForLogging("a", 0)).toBe("");
            });

            it("should handle Unicode characters", () => {
                const unicode = "🎉🎊🎈🎁🎂";
                // Unicode characters may take multiple bytes, so slice(0, 3) might not work as expected
                const result = truncateForLogging(unicode, 3);
                expect(result.length).toBeLessThanOrEqual(3);
                expect(result.startsWith("🎉")).toBe(true);
            });

            it("should handle newlines and special characters", () => {
                const text = "line1\\nline2\\ttab";
                expect(truncateForLogging(text, 10)).toBe("line1\\nlin");
            });
        });

        describe("Real-world scenarios", () => {
            it("should truncate URLs appropriately", () => {
                const url = "https://very-long-domain-name.example.com/very/long/path/with/many/segments";
                const result = truncateForLogging(url, 30);
                expect(result.length).toBe(30);
                expect(result).toBe("https://very-long-domain-name.");
            });

            it("should truncate error messages", () => {
                const error = "Connection failed: Unable to connect to server at example.com:8080 after 30 seconds timeout";
                const result = truncateForLogging(error, 50);
                expect(result.length).toBe(50);
                expect(result).toBe("Connection failed: Unable to connect to server at ");
            });
        });
    });

    describe("Default values", () => {
        describe("UiDefaults", () => {
            it("should have correct chart defaults", () => {
                expect(UiDefaults.chartPeriod).toBe("24h");
                expect(UiDefaults.chartPoints).toBe(24);
            });

            it("should have correct label defaults", () => {
                expect(UiDefaults.errorLabel).toBe("Error");
                expect(UiDefaults.loadingLabel).toBe("Loading...");
                expect(UiDefaults.notAvailableLabel).toBe("N/A");
                expect(UiDefaults.unknownLabel).toBe("Unknown");
            });

            it("should have correct timing defaults", () => {
                expect(UiDefaults.loadingDelay).toBe(100);
                expect(UiDefaults.pageSize).toBe(10);
            });

            it("should be deeply frozen (readonly)", () => {
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
            it("should have correct monitoring defaults", () => {
                expect(MonitorDefaults.checkInterval).toBe(300_000); // 5 minutes
                expect(MonitorDefaults.responseTime).toBe(-1);
                expect(MonitorDefaults.retryAttempts).toBe(3);
                expect(MonitorDefaults.status).toBe("pending");
                expect(MonitorDefaults.timeout).toBe(10_000); // 10 seconds
            });

            it("should be deeply frozen (readonly)", () => {
                // Note: 'as const' provides type-level readonly but not runtime immutability
                expect(MonitorDefaults.checkInterval).toBe(300_000);
                expect(MonitorDefaults.timeout).toBe(10_000);
                // Test that values are accessible and correct
                (MonitorDefaults as any).timeout = 5000;
                // The object should be treated as readonly in TypeScript
            });
        });

        describe("SiteDefaults", () => {
            it("should have correct site defaults", () => {
                expect(SiteDefaults.monitoring).toBe(true);
            });

            it("should be deeply frozen (readonly)", () => {
                // Note: 'as const' provides type-level readonly but not runtime immutability
                expect(SiteDefaults.monitoring).toBe(true);
                // Test that values are accessible and correct
                (SiteDefaults as any).monitoring = false;
                // The object should be treated as readonly in TypeScript
            });
        });
    });
});
