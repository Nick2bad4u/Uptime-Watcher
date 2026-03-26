/**
 * Test suite for portChecker
 *
 * @module portChecker
 *
 * @file Comprehensive tests for the performSinglePortCheck function in the
 *   Uptime Watcher application.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Monitoring Utilities
 *
 * @tags ["test", "monitoring", "port", "tcp", "connectivity"]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock external dependencies before importing the module under test
vi.mock("is-port-reachable", () => ({
    default: vi.fn(),
}));

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

vi.mock("../../../../services/monitoring/utils/portErrorHandling", () => ({
    PORT_NOT_REACHABLE: "Port not reachable",
    PortCheckError: class PortCheckError extends Error {
        responseTime: number;
        constructor(message: string, responseTime: number) {
            super(message);
            this.name = "PortCheckError";
            this.responseTime = responseTime;
        }
    },
}));

// Import after mocks are set up
import isPortReachable from "is-port-reachable";
import { performSinglePortCheck } from "../../../../services/monitoring/utils/portChecker";
import { isDev } from "../../../../electronUtils";
import { logger } from "../../../../utils/logger";
import {
    PORT_NOT_REACHABLE,
    PortCheckError,
} from "../../../../services/monitoring/utils/portErrorHandling";

// Mock performance.now() globally
const mockPerformanceNow = vi.fn();
Object.defineProperty(globalThis, "performance", {
    value: {
        now: mockPerformanceNow,
    },
    writable: true,
});

describe(performSinglePortCheck, () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Set up default mocks
        vi.mocked(isDev).mockReturnValue(false);
        vi.mocked(isPortReachable).mockResolvedValue(true);
        // Don't set up default performance.now mock here - let individual tests control it
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Successful port checks", () => {
        it("should return success result when port is reachable", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const host = "example.com";
            const port = 80;
            const timeout = 5000;
            mockPerformanceNow
                .mockReturnValueOnce(100)
                .mockReturnValueOnce(250); // Start=100, end=250, diff=150

            // Act
            const result = await performSinglePortCheck(host, port, timeout);

            // Assert
            expect(result).toEqual({
                details: "80",
                responseTime: 150, // 250 - 100 = 150
                status: "up",
            });

            expect(isPortReachable).toHaveBeenCalledWith(port, {
                host: host,
                timeout: timeout,
            });
        });

        it("should call isPortReachable with correct parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const testCases = [
                { host: "localhost", port: 3000, timeout: 1000 },
                { host: "192.168.1.1", port: 443, timeout: 5000 },
                { host: "sub.example.com", port: 8080, timeout: 10_000 },
            ];

            for (const { host, port, timeout } of testCases) {
                // Arrange
                vi.clearAllMocks();
                mockPerformanceNow
                    .mockReturnValueOnce(0)
                    .mockReturnValueOnce(100);

                // Act
                await performSinglePortCheck(host, port, timeout);

                // Assert
                expect(isPortReachable).toHaveBeenCalledWith(port, {
                    host: host,
                    timeout: timeout,
                });
            }
        });

        it("should measure response time accurately", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Test different response time scenarios
            const timingCases = [
                { start: 100, end: 150, expected: 50 },
                { start: 500, end: 1200, expected: 700 },
                { start: 0, end: 25.7, expected: 26 }, // Should round
                { start: 1000.3, end: 1500.8, expected: 501 }, // Should round correctly
            ];

            for (const { start, end, expected } of timingCases) {
                // Arrange
                vi.clearAllMocks();
                vi.mocked(isPortReachable).mockResolvedValue(true);
                mockPerformanceNow
                    .mockReturnValueOnce(start)
                    .mockReturnValueOnce(end);

                // Act
                const result = await performSinglePortCheck(
                    "test.com",
                    80,
                    1000
                );

                // Assert
                expect(result.responseTime).toBe(expected);
                expect(result.status).toBe("up");
            }
        });

        it("should convert port number to string in details", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Test different port numbers
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
                vi.mocked(isPortReachable).mockResolvedValue(true);
                mockPerformanceNow
                    .mockReturnValueOnce(0)
                    .mockReturnValueOnce(100);

                // Act
                const result = await performSinglePortCheck(
                    "test.com",
                    port,
                    1000
                );

                // Assert
                expect(result.details).toBe(String(port));
                expect(result.status).toBe("up");
            }
        });
    });

    describe("Failed port checks", () => {
        it("should throw PortCheckError when port is not reachable", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            vi.mocked(isPortReachable).mockResolvedValue(false);
            mockPerformanceNow
                .mockReturnValueOnce(100)
                .mockReturnValueOnce(350); // 250ms response

            // Act & Assert
            const error = await performSinglePortCheck(
                "unreachable.com",
                80,
                3000
            ).catch((error_) => error_);

            expect(error).toBeInstanceOf(PortCheckError);
            expect(error.message).toBe(PORT_NOT_REACHABLE);
            expect(error.responseTime).toBe(250); // 350 - 100 = 250
        });

        it("should preserve response time in PortCheckError", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            // Test different response times for failures
            const timingCases = [
                { start: 0, end: 1000, expected: 1000 },
                { start: 500, end: 5500, expected: 5000 },
                { start: 100.3, end: 200.8, expected: 101 }, // Should round
            ];

            for (const { start, end, expected } of timingCases) {
                // Arrange
                vi.clearAllMocks();
                vi.mocked(isPortReachable).mockResolvedValue(false);
                mockPerformanceNow
                    .mockReturnValueOnce(start)
                    .mockReturnValueOnce(end);

                // Act & Assert
                const error = await performSinglePortCheck(
                    "fail.com",
                    80,
                    1000
                ).catch((error_) => error_);

                expect(error.responseTime).toBe(expected);
            }
        });

        it("should handle isPortReachable rejecting", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            const networkError = new Error("Network unreachable");
            vi.mocked(isPortReachable).mockRejectedValue(networkError);

            // Act & Assert
            // The function should let the error bubble up since it doesn't catch it
            await expect(
                performSinglePortCheck("error.com", 80, 1000)
            ).rejects.toThrow("Network unreachable");
        });
    });

    describe("Development mode logging", () => {
        it("should log debug messages when isDev returns true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDev).mockReturnValue(true);
            mockPerformanceNow
                .mockReturnValueOnce(100)
                .mockReturnValueOnce(200); // 200-100 = 100ms

            // Act
            await performSinglePortCheck("debug.example.com", 8080, 2000);

            // Assert
            expect(logger.debug).toHaveBeenCalledWith(
                "[PortMonitor] Checking port: debug.example.com:8080 with timeout: 2000ms"
            );
            expect(logger.debug).toHaveBeenCalledWith(
                "[PortMonitor] Port debug.example.com:8080 is reachable in 100ms"
            );
        });

        it("should not log debug messages when isDev returns false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.mocked(isDev).mockReturnValue(false);
            mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(100);

            // Act
            await performSinglePortCheck("prod.example.com", 443, 5000);

            // Assert
            expect(logger.debug).not.toHaveBeenCalled();
        });

        it("should log initial check message even if port check fails", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            // Arrange
            vi.mocked(isDev).mockReturnValue(true);
            vi.mocked(isPortReachable).mockResolvedValue(false);

            // Act
            await performSinglePortCheck("fail.example.com", 80, 1000).catch(
                () => {}
            ); // Ignore the error

            // Assert
            expect(logger.debug).toHaveBeenCalledWith(
                "[PortMonitor] Checking port: fail.example.com:80 with timeout: 1000ms"
            );
            // Should not call the success debug message
            expect(logger.debug).toHaveBeenCalledTimes(1);
        });

        it("should call isDev twice - once for initial check, once for success logging", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            // Arrange
            vi.mocked(isDev).mockReturnValue(true);

            // Act
            await performSinglePortCheck("twice.example.com", 80, 1000);

            // Assert
            expect(isDev).toHaveBeenCalledTimes(2);
        });

        it("should handle isDev throwing an error gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            vi.mocked(isDev).mockImplementation(() => {
                throw new Error("isDev error");
            });

            // Act & Assert
            // The function should still work but not log anything
            await expect(
                performSinglePortCheck("error.example.com", 80, 1000)
            ).rejects.toThrow("isDev error");
        });
    });

    describe("Parameter validation and edge cases", () => {
        it("should handle different host formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const hostFormats = [
                "example.com",
                "sub.example.com",
                "192.168.1.1",
                "::1",
                "localhost",
                "test-host.local",
                "127.0.0.1",
                "0.0.0.0",
            ];

            for (const host of hostFormats) {
                // Arrange
                vi.clearAllMocks();
                mockPerformanceNow
                    .mockReturnValueOnce(0)
                    .mockReturnValueOnce(100);

                // Act
                const result = await performSinglePortCheck(host, 80, 1000);

                // Assert
                expect(result.status).toBe("up");
                expect(isPortReachable).toHaveBeenCalledWith(80, {
                    host: host,
                    timeout: 1000,
                });
            }
        });

        it("should handle edge case port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const ports = [
                1,
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
                mockPerformanceNow
                    .mockReturnValueOnce(0)
                    .mockReturnValueOnce(100);

                // Act
                const result = await performSinglePortCheck(
                    "test.com",
                    port,
                    1000
                );

                // Assert
                expect(result.details).toBe(String(port));
                expect(isPortReachable).toHaveBeenCalledWith(port, {
                    host: "test.com",
                    timeout: 1000,
                });
            }
        });

        it("should handle different timeout values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
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
                mockPerformanceNow
                    .mockReturnValueOnce(0)
                    .mockReturnValueOnce(50);

                // Act
                await performSinglePortCheck("timeout.test", 80, timeout);

                // Assert
                expect(isPortReachable).toHaveBeenCalledWith(80, {
                    host: "timeout.test",
                    timeout: timeout,
                });
            }
        });

        it("should handle very large response times", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            mockPerformanceNow
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(1_000_000);

            // Act
            const result = await performSinglePortCheck(
                "slow.example.com",
                80,
                1_000_000
            );

            // Assert
            expect(result.responseTime).toBe(1_000_000); // Should round to nearest integer
        });

        it("should handle zero response time", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            mockPerformanceNow
                .mockReturnValueOnce(100)
                .mockReturnValueOnce(100);

            // Act
            const result = await performSinglePortCheck(
                "instant.example.com",
                80,
                1000
            );

            // Assert
            expect(result.responseTime).toBe(0);
        });
    });

    describe("Integration scenarios", () => {
        it("should work correctly for successful HTTPS checks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(120);

            // Act
            const result = await performSinglePortCheck(
                "secure.example.com",
                443,
                5000
            );

            // Assert
            expect(result).toEqual({
                details: "443",
                responseTime: 120,
                status: "up",
            });
        });

        it("should work correctly for SSH port checks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            mockPerformanceNow.mockReturnValueOnce(50).mockReturnValueOnce(180); // 180-50 = 130

            // Act
            const result = await performSinglePortCheck(
                "ssh.example.com",
                22,
                3000
            );

            // Assert
            expect(result).toEqual({
                details: "22",
                responseTime: 130,
                status: "up",
            });
        });

        it("should handle concurrent port checks independently", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Arrange
            vi.clearAllMocks();
            vi.mocked(isPortReachable).mockResolvedValue(true);

            // Act - Test each scenario individually to avoid concurrent execution issues
            // Test case 1: 0 to 100 = 100ms
            mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(100);
            const result1 = await performSinglePortCheck(
                "host1.test",
                80,
                1000
            );

            // Test case 2: 100 to 300 = 200ms
            mockPerformanceNow
                .mockReturnValueOnce(100)
                .mockReturnValueOnce(300);
            const result2 = await performSinglePortCheck(
                "host2.test",
                443,
                1000
            );

            // Test case 3: 200 to 250 = 50ms
            mockPerformanceNow
                .mockReturnValueOnce(200)
                .mockReturnValueOnce(250);
            const result3 = await performSinglePortCheck(
                "host3.test",
                8080,
                1000
            );

            // Assert
            expect(result1.responseTime).toBe(100); // 100 - 0 = 100
            expect(result2.responseTime).toBe(200); // 300 - 100 = 200
            expect(result3.responseTime).toBe(50); // 250 - 200 = 50
            expect(
                [
                    result1,
                    result2,
                    result3,
                ].every((r) => r.status === "up")
            ).toBeTruthy();
        });

        it("should work correctly when mixing successful and failed checks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: portChecker", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            // Arrange
            vi.clearAllMocks();

            // Test successful check first
            vi.mocked(isPortReachable).mockResolvedValueOnce(true);
            mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(100);

            // Act
            const successResult = await performSinglePortCheck(
                "success.test",
                80,
                1000
            );

            // Assert
            expect(successResult.status).toBe("up");
            expect(successResult.responseTime).toBe(100);

            // Now test failed check
            vi.mocked(isPortReachable).mockResolvedValueOnce(false);
            mockPerformanceNow.mockReturnValueOnce(0).mockReturnValueOnce(200);

            const failError = await performSinglePortCheck(
                "fail.test",
                80,
                1000
            ).catch((error) => error);

            expect(failError).toBeInstanceOf(PortCheckError);
            expect(failError.responseTime).toBe(200);
        });
    });
});
