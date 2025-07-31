/**
 * Test suite for ping error handling utilities.
 *
 * @remarks
 * Tests the error handling functionality for ping operations,
 * including error formatting, logging, and result standardization.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { handlePingCheckError, PingOperationContext } from "../../../../services/monitoring/utils/pingErrorHandling";
import * as loggerModule from "../../../../utils/logger";

// Mock the logger
vi.mock("../../../../utils/logger");
const mockLogger = loggerModule.logger as any;

describe("pingErrorHandling", () => {
    const defaultContext: PingOperationContext = {
        host: "example.com",
        timeout: 5000,
        maxRetries: 3,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockLogger.error = vi.fn();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("handlePingCheckError", () => {
        it("should handle Error objects correctly", () => {
            const error = new Error("Network unreachable");

            const result = handlePingCheckError(error, defaultContext);

            expect(result).toEqual({
                status: "down",
                responseTime: 0,
                details: "Ping failed: Network unreachable",
                error: "Network unreachable",
            });
        });

        it("should handle string errors", () => {
            const error = "Connection timeout";

            const result = handlePingCheckError(error, defaultContext);

            expect(result).toEqual({
                status: "down",
                responseTime: 0,
                details: "Ping failed: Connection timeout",
                error: "Connection timeout",
            });
        });

        it("should handle non-string, non-Error objects", () => {
            const error = { code: "ENOTFOUND", message: "Host not found" };

            const result = handlePingCheckError(error, defaultContext);

            expect(result).toEqual({
                status: "down",
                responseTime: 0,
                details: "Ping failed: [object Object]",
                error: "[object Object]",
            });
        });

        it("should handle null errors", () => {
            const error = null;

            const result = handlePingCheckError(error, defaultContext);

            expect(result).toEqual({
                status: "down",
                responseTime: 0,
                details: "Ping failed: null",
                error: "null",
            });
        });

        it("should handle undefined errors", () => {
            const error = undefined;

            const result = handlePingCheckError(error, defaultContext);

            expect(result).toEqual({
                status: "down",
                responseTime: 0,
                details: "Ping failed: undefined",
                error: "undefined",
            });
        });

        it("should log error with context information", () => {
            const error = new Error("Network unreachable");
            const context: PingOperationContext = {
                host: "test.example.com",
                timeout: 10_000,
                maxRetries: 5,
            };

            handlePingCheckError(error, context);

            expect(mockLogger.error).toHaveBeenCalledWith("Ping check failed", {
                error: "Network unreachable",
                host: "test.example.com",
                timeout: 10_000,
                maxRetries: 5,
            });
        });

        it("should always return status 'down'", () => {
            const testCases = [
                new Error("Network error"),
                "String error",
                { custom: "object" },
                42,
                true,
                null,
                undefined,
            ];

            for (const error of testCases) {
                const result = handlePingCheckError(error, defaultContext);
                expect(result.status).toBe("down");
            }
        });

        it("should always return responseTime 0", () => {
            const testCases = [new Error("Network error"), "String error", { custom: "object" }];

            for (const error of testCases) {
                const result = handlePingCheckError(error, defaultContext);
                expect(result.responseTime).toBe(0);
            }
        });

        it("should handle common ping error scenarios", () => {
            const commonErrors = [
                {
                    error: new Error("ping: cannot resolve example.com"),
                    expectedMessage: "ping: cannot resolve example.com",
                },
                {
                    error: new Error("Request timeout for icmp_seq 1"),
                    expectedMessage: "Request timeout for icmp_seq 1",
                },
                { error: new Error("Network is unreachable"), expectedMessage: "Network is unreachable" },
                { error: new Error("Permission denied"), expectedMessage: "Permission denied" },
                { error: "Host unreachable", expectedMessage: "Host unreachable" },
                { error: "100% packet loss", expectedMessage: "100% packet loss" },
            ];

            for (const testCase of commonErrors) {
                const result = handlePingCheckError(testCase.error, defaultContext);

                expect(result.status).toBe("down");
                expect(result.error).toBe(testCase.expectedMessage);
                expect(result.details).toBe(`Ping failed: ${testCase.expectedMessage}`);
            }
        });

        it("should handle errors with different context values", () => {
            const contexts: PingOperationContext[] = [
                { host: "google.com", timeout: 1000, maxRetries: 0 },
                { host: "192.168.1.1", timeout: 30_000, maxRetries: 10 },
                { host: "localhost", timeout: 5000, maxRetries: 3 },
                { host: "2001:db8::1", timeout: 8000, maxRetries: 1 },
            ];

            const error = new Error("Test error");

            for (const context of contexts) {
                const result = handlePingCheckError(error, context);

                expect(result).toEqual({
                    status: "down",
                    responseTime: 0,
                    details: "Ping failed: Test error",
                    error: "Test error",
                });

                expect(mockLogger.error).toHaveBeenCalledWith("Ping check failed", {
                    error: "Test error",
                    ...context,
                });
            }
        });

        it("should preserve error details for debugging", () => {
            const detailedError = new Error("ICMP socket error: Operation not permitted (you may need to run as root)");

            const result = handlePingCheckError(detailedError, defaultContext);

            expect(result.error).toBe("ICMP socket error: Operation not permitted (you may need to run as root)");
            expect(result.details).toBe(
                "Ping failed: ICMP socket error: Operation not permitted (you may need to run as root)"
            );
        });

        it("should handle empty string errors", () => {
            const error = "";

            const result = handlePingCheckError(error, defaultContext);

            expect(result).toEqual({
                status: "down",
                responseTime: 0,
                details: "Ping failed: ",
                error: "",
            });
        });

        it("should handle errors with special characters", () => {
            const error = new Error("Error with émojis 🚫 and spéciàl chars: 漢字");

            const result = handlePingCheckError(error, defaultContext);

            expect(result.error).toBe("Error with émojis 🚫 and spéciàl chars: 漢字");
            expect(result.details).toBe("Ping failed: Error with émojis 🚫 and spéciàl chars: 漢字");
        });
    });

    describe("context validation", () => {
        it("should accept all required context properties", () => {
            const completeContext: PingOperationContext = {
                host: "example.com",
                timeout: 5000,
                maxRetries: 3,
            };

            const error = new Error("Test error");

            expect(() => {
                handlePingCheckError(error, completeContext);
            }).not.toThrow();
        });

        it("should work with minimal context", () => {
            const minimalContext: PingOperationContext = {
                host: "localhost",
                timeout: 1000,
                maxRetries: 0,
            };

            const error = new Error("Test error");
            const result = handlePingCheckError(error, minimalContext);

            expect(result.status).toBe("down");
            expect(mockLogger.error).toHaveBeenCalledWith("Ping check failed", expect.objectContaining(minimalContext));
        });

        it("should handle edge case context values", () => {
            const edgeCaseContext: PingOperationContext = {
                host: "",
                timeout: 0,
                maxRetries: 999,
            };

            const error = new Error("Test error");

            expect(() => {
                handlePingCheckError(error, edgeCaseContext);
            }).not.toThrow();

            expect(mockLogger.error).toHaveBeenCalledWith(
                "Ping check failed",
                expect.objectContaining(edgeCaseContext)
            );
        });
    });
});
