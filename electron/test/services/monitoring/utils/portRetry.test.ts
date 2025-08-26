/**
 * Test suite for portRetry
 *
 * @module portRetry
 *
 * @file Comprehensive tests for the performPortCheckWithRetry function in the
 *   Uptime Watcher application.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Monitoring Utilities
 *
 * @tags ["test", "monitoring", "port", "retry", "backoff"]
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

vi.mock("../../../../utils/operationalHooks", () => ({
    withOperationalHooks: vi.fn(),
}));

vi.mock("../../../../services/monitoring/utils/portChecker", () => ({
    performSinglePortCheck: vi.fn(),
}));

vi.mock("../../../../services/monitoring/utils/portErrorHandling", () => ({
    handlePortCheckError: vi.fn(),
}));

vi.mock("../../../../constants", () => ({
    RETRY_BACKOFF: {
        INITIAL_DELAY: 500,
        MAX_DELAY: 5000,
    },
}));

// Import after mocks are set up
import { performPortCheckWithRetry } from "../../../../services/monitoring/utils/portRetry";
import { isDev } from "../../../../electronUtils";
import { logger } from "../../../../utils/logger";
import { withOperationalHooks } from "../../../../utils/operationalHooks";
import { performSinglePortCheck } from "../../../../services/monitoring/utils/portChecker";
import { handlePortCheckError } from "../../../../services/monitoring/utils/portErrorHandling";
import { RETRY_BACKOFF } from "../../../../constants";

describe("performPortCheckWithRetry", () => {
    const mockResult = {
        status: "up" as const,
        responseTime: 150,
        details: "Connected successfully",
    };

    const mockErrorResult = {
        status: "down" as const,
        responseTime: 5000,
        error: "Connection timeout",
        details: "80",
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Set up default mocks
        vi.mocked(isDev).mockReturnValue(false);
        vi.mocked(withOperationalHooks).mockResolvedValue(mockResult);
        vi.mocked(performSinglePortCheck).mockResolvedValue(mockResult);
        vi.mocked(handlePortCheckError).mockReturnValue(mockErrorResult);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Basic functionality", () => {
        it("should perform port check with correct parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const host = "example.com";
            const port = 80;
            const timeout = 3000;
            const maxRetries = 2;

            // Act
            const result = await performPortCheckWithRetry(
                host,
                port,
                timeout,
                maxRetries
            );

            // Assert
            expect(result).toEqual(mockResult);
            expect(withOperationalHooks).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
                    maxRetries: 3, // maxRetries + 1 = totalAttempts
                    operationName: "Port check for example.com:80",
                })
            );
        });

        it("should convert maxRetries to totalAttempts correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Test cases: maxRetries -> totalAttempts
            const testCases = [
                { maxRetries: 0, expectedTotal: 1 },
                { maxRetries: 1, expectedTotal: 2 },
                { maxRetries: 3, expectedTotal: 4 },
                { maxRetries: 10, expectedTotal: 11 },
            ];

            for (const { maxRetries, expectedTotal } of testCases) {
                // Arrange
                vi.clearAllMocks();

                // Act
                await performPortCheckWithRetry(
                    "test.com",
                    443,
                    5000,
                    maxRetries
                );

                // Assert
                expect(withOperationalHooks).toHaveBeenCalledWith(
                    expect.any(Function),
                    expect.objectContaining({
                        maxRetries: expectedTotal,
                    })
                );
            }
        });

        it("should pass the correct function to withOperationalHooks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const host = "test.host";
            const port = 443;
            const timeout = 2000;

            // Act
            await performPortCheckWithRetry(host, port, timeout, 1);

            // Assert
            expect(withOperationalHooks).toHaveBeenCalledWith(
                expect.any(Function),
                expect.any(Object)
            );

            // Extract and test the function passed to withOperationalHooks
            const hookFunction =
                vi.mocked(withOperationalHooks).mock.calls[0]![0];
            await hookFunction();

            expect(performSinglePortCheck).toHaveBeenCalledWith(
                host,
                port,
                timeout
            );
        });
    });

    describe("Development mode behavior", () => {
        it("should add debug logging when isDev returns true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDev).mockReturnValue(true);

            // Act
            await performPortCheckWithRetry("dev.example.com", 8080, 1000, 2);

            // Assert
            expect(withOperationalHooks).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
                    maxRetries: 3,
                    operationName: "Port check for dev.example.com:8080",
                    onRetry: expect.any(Function),
                })
            );
        });

        it("should not add debug logging when isDev returns false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDev).mockReturnValue(false);

            // Act
            await performPortCheckWithRetry("prod.example.com", 443, 5000, 1);

            // Assert
            const config = vi.mocked(withOperationalHooks).mock.calls[0]![1];
            expect(config).not.toHaveProperty("onRetry");
        });

        it("should call debug logger with correct message when onRetry is triggered", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDev).mockReturnValue(true);
            const testError = new Error("Connection failed");

            // Act
            await performPortCheckWithRetry("debug.example.com", 9000, 2000, 3);

            // Extract the onRetry function and call it
            const config = vi.mocked(withOperationalHooks).mock.calls[0]![1];
            const onRetryFunction = config.onRetry as (
                attempt: number,
                error: Error
            ) => void;

            onRetryFunction(2, testError);

            // Assert
            expect(logger.debug).toHaveBeenCalledWith(
                "[PortMonitor] Port debug.example.com:9000 failed attempt 2/4: Connection failed"
            );
        });

        it("should handle non-Error objects in onRetry callback", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            vi.mocked(isDev).mockReturnValue(true);

            // Act
            await performPortCheckWithRetry("test.example.com", 3000, 1000, 1);

            // Extract the onRetry function and call it with non-Error
            const config = vi.mocked(withOperationalHooks).mock.calls[0]![1];
            const onRetryFunction = config.onRetry as (
                attempt: number,
                error: Error
            ) => void;

            onRetryFunction(1, "String error" as any);

            // Assert
            expect(logger.debug).toHaveBeenCalledWith(
                "[PortMonitor] Port test.example.com:3000 failed attempt 1/2: String error"
            );
        });
    });

    describe("Error handling", () => {
        it("should handle errors from withOperationalHooks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            const testError = new Error("Operational hooks failed");
            vi.mocked(withOperationalHooks).mockRejectedValue(testError);

            // Act
            const result = await performPortCheckWithRetry(
                "error.example.com",
                80,
                3000,
                2
            );

            // Assert
            expect(result).toEqual(mockErrorResult);
            expect(handlePortCheckError).toHaveBeenCalledWith(
                testError,
                "error.example.com",
                80
            );
        });

        it("should handle different types of errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const testCases = [
                new Error("Network error"),
                new TypeError("Type error"),
                "String error",
                { message: "Object error" },
                null,
                undefined,
            ];

            for (const testError of testCases) {
                // Arrange
                vi.clearAllMocks();
                vi.mocked(withOperationalHooks).mockRejectedValue(testError);

                // Act
                const result = await performPortCheckWithRetry(
                    "test.com",
                    443,
                    1000,
                    1
                );

                // Assert
                expect(result).toEqual(mockErrorResult);
                expect(handlePortCheckError).toHaveBeenCalledWith(
                    testError,
                    "test.com",
                    443
                );
            }
        });

        it("should pass through error results from handlePortCheckError", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            const customErrorResult = {
                status: "down" as const,
                responseTime: 2500,
                error: "Custom error message",
                details: "443",
            };
            vi.mocked(withOperationalHooks).mockRejectedValue(
                new Error("Test error")
            );
            vi.mocked(handlePortCheckError).mockReturnValue(customErrorResult);

            // Act
            const result = await performPortCheckWithRetry(
                "custom.example.com",
                443,
                1000,
                0
            );

            // Assert
            expect(result).toEqual(customErrorResult);
        });
    });

    describe("Parameter validation and edge cases", () => {
        it("should handle zero retries (single attempt)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Act
            await performPortCheckWithRetry("single.example.com", 80, 5000, 0);

            // Assert
            expect(withOperationalHooks).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    maxRetries: 1, // 0 + 1 = 1 total attempt
                })
            );
        });

        it("should handle different host formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const hostFormats = [
                "example.com",
                "sub.example.com",
                "192.168.1.1",
                "::1",
                "localhost",
                "test-host.local",
            ];

            for (const host of hostFormats) {
                // Arrange
                vi.clearAllMocks();

                // Act
                await performPortCheckWithRetry(host, 80, 1000, 1);

                // Assert
                expect(withOperationalHooks).toHaveBeenCalledWith(
                    expect.any(Function),
                    expect.objectContaining({
                        operationName: `Port check for ${host}:80`,
                    })
                );
            }
        });

        it("should handle different port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const ports = [
                22,
                80,
                443,
                3000,
                8080,
                65_535,
            ];

            for (const port of ports) {
                // Arrange
                vi.clearAllMocks();

                // Act
                await performPortCheckWithRetry("test.com", port, 1000, 1);

                // Assert
                expect(withOperationalHooks).toHaveBeenCalledWith(
                    expect.any(Function),
                    expect.objectContaining({
                        operationName: `Port check for test.com:${port}`,
                    })
                );
            }
        });

        it("should handle different timeout values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const timeouts = [
                100,
                1000,
                5000,
                30_000,
            ];

            for (const timeout of timeouts) {
                // Arrange
                vi.clearAllMocks();

                // Act
                await performPortCheckWithRetry("timeout.test", 80, timeout, 0);

                // Extract and call the function to verify timeout is passed correctly
                const hookFunction =
                    vi.mocked(withOperationalHooks).mock.calls[0]![0];
                await hookFunction();

                // Assert
                expect(performSinglePortCheck).toHaveBeenCalledWith(
                    "timeout.test",
                    80,
                    timeout
                );
            }
        });

        it("should handle large retry counts", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Act
            await performPortCheckWithRetry("large.example.com", 80, 1000, 100);

            // Assert
            expect(withOperationalHooks).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    maxRetries: 101, // 100 + 1 = 101 total attempts
                })
            );
        });
    });

    describe("Configuration object composition", () => {
        it("should create base configuration correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            // Arrange
            vi.mocked(isDev).mockReturnValue(false);

            // Act
            await performPortCheckWithRetry("config.test", 8080, 2000, 3);

            // Assert
            expect(withOperationalHooks).toHaveBeenCalledWith(
                expect.any(Function),
                {
                    initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
                    maxRetries: 4,
                    operationName: "Port check for config.test:8080",
                }
            );
        });

        it("should merge onRetry callback in dev mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDev).mockReturnValue(true);

            // Act
            await performPortCheckWithRetry("dev-config.test", 9090, 1500, 2);

            // Assert
            const config = vi.mocked(withOperationalHooks).mock.calls[0]![1];
            expect(config).toEqual({
                initialDelay: RETRY_BACKOFF.INITIAL_DELAY,
                maxRetries: 3,
                operationName: "Port check for dev-config.test:9090",
                onRetry: expect.any(Function),
            });
        });
    });

    describe("Integration scenarios", () => {
        it("should work with successful port checks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const successResult = {
                status: "up" as const,
                responseTime: 120,
                details: "Connection successful",
            };
            vi.mocked(withOperationalHooks).mockResolvedValue(successResult);

            // Act
            const result = await performPortCheckWithRetry(
                "success.example.com",
                443,
                3000,
                2
            );

            // Assert
            expect(result).toEqual(successResult);
            expect(handlePortCheckError).not.toHaveBeenCalled();
        });

        it("should handle concurrent port checks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portRetry", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const results = [
                { status: "up" as const, responseTime: 100 },
                { status: "up" as const, responseTime: 200 },
                {
                    status: "down" as const,
                    responseTime: 5000,
                    error: "Timeout",
                },
            ];

            vi.mocked(withOperationalHooks)
                .mockResolvedValueOnce(results[0])
                .mockResolvedValueOnce(results[1])
                .mockRejectedValueOnce(new Error("Timeout"));

            // Act
            const promises = [
                performPortCheckWithRetry("host1.test", 80, 1000, 1),
                performPortCheckWithRetry("host2.test", 443, 1000, 1),
                performPortCheckWithRetry("host3.test", 8080, 1000, 1),
            ];

            const resolvedResults = await Promise.all(promises);

            // Assert
            expect(resolvedResults[0]).toEqual(results[0]);
            expect(resolvedResults[1]).toEqual(results[1]);
            expect(resolvedResults[2]).toEqual(mockErrorResult); // From handlePortCheckError
        });
    });
});
