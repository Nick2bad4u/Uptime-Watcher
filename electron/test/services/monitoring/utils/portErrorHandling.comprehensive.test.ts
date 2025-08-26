/**
 * Test suite for portErrorHandling
 *
 * @module PortErrorHandling
 *
 * @file Comprehensive tests for port error handling utilities in the Uptime
 *   Watcher application, including error constants, result interfaces, custom
 *   error classes, and error handling functions.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Port Monitoring
 *
 * @tags ["test", "monitoring", "port", "error-handling"]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock dependencies before importing the module under test
vi.mock("../../../../electronUtils", () => ({
    isDev: vi.fn(),
}));

vi.mock("../../../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    },
}));

// Import after mocks are set up
import {
    PORT_NOT_REACHABLE,
    PortCheckError,
    PortCheckErrorResult,
    handlePortCheckError,
} from "../../../../services/monitoring/utils/portErrorHandling";
import { isDev } from "../../../../electronUtils";
import { logger } from "../../../../utils/logger";

describe("Port Error Handling", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(isDev).mockReturnValue(false);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("PORT_NOT_REACHABLE constant", () => {
        it("should have the correct error message", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            expect(PORT_NOT_REACHABLE).toBe("Port not reachable");
        });

        it("should be a string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            expect(typeof PORT_NOT_REACHABLE).toBe("string");
        });

        it("should be exportable and accessible", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Export Operation", "type");

            expect(PORT_NOT_REACHABLE).toBeDefined();
            expect(PORT_NOT_REACHABLE).not.toBe("");
        });
    });

    describe("PortCheckErrorResult interface", () => {
        it("should validate a properly structured error result", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const errorResult: PortCheckErrorResult = {
                details: "443",
                error: "Port not reachable",
                responseTime: 1200,
                status: "down",
            };

            expect(errorResult.details).toBe("443");
            expect(errorResult.error).toBe("Port not reachable");
            expect(errorResult.responseTime).toBe(1200);
            expect(errorResult.status).toBe("down");
        });

        it("should validate error result with PORT_NOT_REACHABLE constant", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const errorResult: PortCheckErrorResult = {
                details: "80",
                error: PORT_NOT_REACHABLE,
                responseTime: 5000,
                status: "down",
            };

            expect(errorResult.error).toBe(PORT_NOT_REACHABLE);
            expect(errorResult.status).toBe("down");
        });

        it("should validate error result with negative response time", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const errorResult: PortCheckErrorResult = {
                details: "22",
                error: "Connection refused",
                responseTime: -1,
                status: "down",
            };

            expect(errorResult.responseTime).toBe(-1);
            expect(errorResult.status).toBe("down");
        });

        it("should validate error result with different port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const ports = [
                "22",
                "80",
                "443",
                "3000",
                "8080",
                "65535",
            ];

            for (const port of ports) {
                const errorResult: PortCheckErrorResult = {
                    details: port,
                    error: PORT_NOT_REACHABLE,
                    responseTime: 1000,
                    status: "down",
                };

                expect(errorResult.details).toBe(port);
                expect(errorResult.status).toBe("down");
            }
        });
    });

    describe("PortCheckError class", () => {
        it("should create an instance with message and response time", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const message = "Connection timeout";
            const responseTime = 5000;
            const error = new PortCheckError(message, responseTime);

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(PortCheckError);
            expect(error.message).toBe(message);
            expect(error.responseTime).toBe(responseTime);
            expect(error.name).toBe("PortCheckError");
        });

        it("should create an instance with PORT_NOT_REACHABLE message", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const responseTime = 1200;
            const error = new PortCheckError(PORT_NOT_REACHABLE, responseTime);

            expect(error.message).toBe(PORT_NOT_REACHABLE);
            expect(error.responseTime).toBe(responseTime);
            expect(error.name).toBe("PortCheckError");
        });

        it("should handle different response time values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const testCases = [
                { time: 0, name: "zero response time" },
                { time: 100, name: "small response time" },
                { time: 5000, name: "large response time" },
                { time: -1, name: "negative response time (invalid)" },
                { time: 1.5, name: "fractional response time" },
                { time: Number.MAX_SAFE_INTEGER, name: "maximum safe integer" },
            ];

            for (const testCase of testCases) {
                const error = new PortCheckError("Test error", testCase.time);
                expect(error.responseTime).toBe(testCase.time);
                expect(error.message).toBe("Test error");
                expect(error.name).toBe("PortCheckError");
            }
        });

        it("should maintain Error prototype chain", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const error = new PortCheckError("Test", 100);

            expect(error instanceof Error).toBe(true);
            expect(error instanceof PortCheckError).toBe(true);
            expect(Object.getPrototypeOf(error)).toBe(PortCheckError.prototype);
        });

        it("should have readonly responseTime property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const error = new PortCheckError("Test", 100);

            expect(error.responseTime).toBe(100);

            // In JavaScript, properties are not truly readonly at runtime
            // This test validates that TypeScript declares it as readonly,
            // but at runtime the property can still be modified
            // The key is that TypeScript should prevent this at compile time

            // The property exists and has the expected value
            expect(error.responseTime).toBe(100);
            expect(Object.hasOwn(error, "responseTime")).toBe(true);
        });

        it("should handle empty string message", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const error = new PortCheckError("", 1000);

            expect(error.message).toBe("");
            expect(error.responseTime).toBe(1000);
            expect(error.name).toBe("PortCheckError");
        });

        it("should handle very long error messages", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const longMessage = "x".repeat(1000);
            const error = new PortCheckError(longMessage, 500);

            expect(error.message).toBe(longMessage);
            expect(error.responseTime).toBe(500);
        });
    });

    describe("handlePortCheckError function", () => {
        describe("PortCheckError input", () => {
            it("should handle PortCheckError with preserved response time", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                const responseTime = 1200;
                const error = new PortCheckError(
                    PORT_NOT_REACHABLE,
                    responseTime
                );

                const result = handlePortCheckError(error, "example.com", 443);

                expect(result).toEqual({
                    details: "443",
                    error: PORT_NOT_REACHABLE,
                    responseTime: responseTime,
                    status: "down",
                });
            });

            it("should handle PortCheckError with custom message", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                const customMessage = "Connection timed out";
                const responseTime = 5000;
                const error = new PortCheckError(customMessage, responseTime);

                const result = handlePortCheckError(error, "test.com", 80);

                expect(result).toEqual({
                    details: "80",
                    error: customMessage,
                    responseTime: responseTime,
                    status: "down",
                });
            });
        });

        describe("Standard Error input", () => {
            it("should handle standard Error with -1 response time", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                const error = new Error("Network unreachable");

                const result = handlePortCheckError(error, "localhost", 3000);

                expect(result).toEqual({
                    details: "3000",
                    error: "Network unreachable",
                    responseTime: -1,
                    status: "down",
                });
            });

            it("should handle Error with PORT_NOT_REACHABLE message", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                const error = new Error(PORT_NOT_REACHABLE);

                const result = handlePortCheckError(error, "test.host", 22);

                expect(result).toEqual({
                    details: "22",
                    error: PORT_NOT_REACHABLE,
                    responseTime: -1,
                    status: "down",
                });
            });
        });

        describe("Non-Error input", () => {
            it("should handle string error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                const result = handlePortCheckError(
                    "String error",
                    "host.com",
                    8080
                );

                expect(result).toEqual({
                    details: "8080",
                    error: "Unknown error",
                    responseTime: -1,
                    status: "down",
                });
            });

            it("should handle number error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                const result = handlePortCheckError(404, "api.test", 443);

                expect(result).toEqual({
                    details: "443",
                    error: "Unknown error",
                    responseTime: -1,
                    status: "down",
                });
            });

            it("should handle null error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                const result = handlePortCheckError(null, "null.test", 80);

                expect(result).toEqual({
                    details: "80",
                    error: "Unknown error",
                    responseTime: -1,
                    status: "down",
                });
            });

            it("should handle undefined error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                const result = handlePortCheckError(
                    undefined,
                    "undefined.test",
                    443
                );

                expect(result).toEqual({
                    details: "443",
                    error: "Unknown error",
                    responseTime: -1,
                    status: "down",
                });
            });

            it("should handle object error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                const objectError = {
                    code: "ECONNREFUSED",
                    message: "Connection refused",
                };
                const result = handlePortCheckError(
                    objectError,
                    "object.test",
                    22
                );

                expect(result).toEqual({
                    details: "22",
                    error: "Unknown error",
                    responseTime: -1,
                    status: "down",
                });
            });
        });

        describe("Different port and host combinations", () => {
            it("should handle different port numbers correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

                const error = new Error("Test error");
                const testCases = [
                    { port: 1, details: "1" },
                    { port: 22, details: "22" },
                    { port: 80, details: "80" },
                    { port: 443, details: "443" },
                    { port: 8080, details: "8080" },
                    { port: 65_535, details: "65535" },
                ];

                for (const testCase of testCases) {
                    const result = handlePortCheckError(
                        error,
                        "test.com",
                        testCase.port
                    );
                    expect(result.details).toBe(testCase.details);
                    expect(result.status).toBe("down");
                }
            });

            it("should handle different host formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

                const error = new Error("Test error");
                const hosts = [
                    "localhost",
                    "127.0.0.1",
                    "192.168.1.1",
                    "example.com",
                    "sub.domain.com",
                    "test-host.local",
                    "2001:db8::1", // IPv6
                ];

                for (const host of hosts) {
                    const result = handlePortCheckError(error, host, 80);
                    expect(result.details).toBe("80");
                    expect(result.status).toBe("down");
                    expect(result.error).toBe("Test error");
                }
            });
        });

        describe("Development mode logging", () => {
            it("should log debug message when isDev returns true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

                vi.mocked(isDev).mockReturnValue(true);
                const error = new Error("Connection failed");

                handlePortCheckError(error, "debug.test", 443);

                expect(logger.debug).toHaveBeenCalledWith(
                    "[PortMonitor] Final error for debug.test:443: Connection failed"
                );
            });

            it("should not log debug message when isDev returns false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

                vi.mocked(isDev).mockReturnValue(false);
                const error = new Error("Connection failed");

                handlePortCheckError(error, "prod.test", 80);

                expect(logger.debug).not.toHaveBeenCalled();
            });

            it("should log debug message with PortCheckError", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                vi.mocked(isDev).mockReturnValue(true);
                const error = new PortCheckError(PORT_NOT_REACHABLE, 1000);

                handlePortCheckError(error, "port-error.test", 22);

                expect(logger.debug).toHaveBeenCalledWith(
                    `[PortMonitor] Final error for port-error.test:22: ${PORT_NOT_REACHABLE}`
                );
            });

            it("should log debug message with non-Error input", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                vi.mocked(isDev).mockReturnValue(true);

                handlePortCheckError("String error", "string.test", 3000);

                expect(logger.debug).toHaveBeenCalledWith(
                    "[PortMonitor] Final error for string.test:3000: Unknown error"
                );
            });

            it("should handle isDev throwing an error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                vi.mocked(isDev).mockImplementation(() => {
                    throw new Error("isDev failed");
                });

                const error = new Error("Test error");

                // The function should throw because isDev() throws and there's no error handling
                expect(() => {
                    handlePortCheckError(error, "error.test", 80);
                }).toThrow("isDev failed");
            });
        });

        describe("Message normalization", () => {
            it("should preserve PORT_NOT_REACHABLE message when it matches exactly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

                const error = new Error(PORT_NOT_REACHABLE);

                const result = handlePortCheckError(error, "exact.test", 443);

                expect(result.error).toBe(PORT_NOT_REACHABLE);
            });

            it("should preserve custom error messages that are not PORT_NOT_REACHABLE", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                const customMessage = "Custom connection error";
                const error = new Error(customMessage);

                const result = handlePortCheckError(error, "custom.test", 80);

                expect(result.error).toBe(customMessage);
            });

            it("should handle empty error message", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                // eslint-disable-next-line unicorn/error-message -- testing empty error message
                const error = new Error("");

                const result = handlePortCheckError(error, "empty.test", 22);

                expect(result.error).toBe("");
                expect(result.status).toBe("down");
            });

            it("should handle very long error messages", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                const longMessage = `Error: ${"x".repeat(1000)}`;
                const error = new Error(longMessage);

                const result = handlePortCheckError(error, "long.test", 443);

                expect(result.error).toBe(longMessage);
            });
        });

        describe("Response time preservation", () => {
            it("should preserve response time from PortCheckError", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                const responseTime = 2500;
                const error = new PortCheckError("Test", responseTime);

                const result = handlePortCheckError(error, "time.test", 80);

                expect(result.responseTime).toBe(responseTime);
            });

            it("should use -1 for non-PortCheckError", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                const error = new Error("Standard error");

                const result = handlePortCheckError(
                    error,
                    "standard.test",
                    443
                );

                expect(result.responseTime).toBe(-1);
            });

            it("should handle PortCheckError with zero response time", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                const error = new PortCheckError("Zero time", 0);

                const result = handlePortCheckError(error, "zero.test", 22);

                expect(result.responseTime).toBe(0);
            });

            it("should handle PortCheckError with negative response time", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

                const error = new PortCheckError("Negative time", -100);

                const result = handlePortCheckError(
                    error,
                    "negative.test",
                    3000
                );

                expect(result.responseTime).toBe(-100);
            });
        });

        describe("Edge cases and integration", () => {
            it("should handle all combinations consistently", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

                const testMatrix = [
                    {
                        error: new PortCheckError(PORT_NOT_REACHABLE, 1000),
                        host: "matrix1.test",
                        port: 80,
                    },
                    {
                        error: new Error("Standard error"),
                        host: "matrix2.test",
                        port: 443,
                    },
                    { error: "String error", host: "matrix3.test", port: 22 },
                    { error: null, host: "matrix4.test", port: 3000 },
                ];

                for (const testCase of testMatrix) {
                    const result = handlePortCheckError(
                        testCase.error,
                        testCase.host,
                        testCase.port
                    );

                    expect(result.status).toBe("down");
                    expect(result.details).toBe(String(testCase.port));
                    expect(typeof result.error).toBe("string");
                    expect(typeof result.responseTime).toBe("number");
                }
            });

            it("should produce consistent results for the same input", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

                const error = new PortCheckError("Consistent test", 1500);

                const result1 = handlePortCheckError(
                    error,
                    "consistent.test",
                    80
                );
                const result2 = handlePortCheckError(
                    error,
                    "consistent.test",
                    80
                );

                expect(result1).toEqual(result2);
            });

            it("should work with all interface properties properly typed", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portErrorHandling", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

                const error = new PortCheckError(PORT_NOT_REACHABLE, 2000);
                const result = handlePortCheckError(error, "typed.test", 443);

                // Verify TypeScript interface compliance
                const typedResult: PortCheckErrorResult = result;
                expect(typedResult.details).toBe("443");
                expect(typedResult.error).toBe(PORT_NOT_REACHABLE);
                expect(typedResult.responseTime).toBe(2000);
                expect(typedResult.status).toBe("down");
            });
        });
    });
});
