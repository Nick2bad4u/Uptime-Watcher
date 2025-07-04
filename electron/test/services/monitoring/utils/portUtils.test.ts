/**
 * Tests for port monitoring utilities.
 * Comprehensive tests for port checking, error handling, and retry logic.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { performSinglePortCheck } from "../../../../services/monitoring/utils/portChecker";
import {
    handlePortCheckError,
    PortCheckError,
    PORT_NOT_REACHABLE,
} from "../../../../services/monitoring/utils/portErrorHandling";
import { performPortCheckWithRetry } from "../../../../services/monitoring/utils/portRetry";

// Mock dependencies
vi.mock("is-port-reachable", () => ({
    default: vi.fn(),
}));

vi.mock("../../../../electronUtils", () => ({
    isDev: vi.fn(),
}));

vi.mock("../../../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
    },
}));

vi.mock("../../../../utils/retry", () => ({
    withRetry: vi.fn(),
}));

vi.mock("../../../../constants", () => ({
    RETRY_BACKOFF: {
        INITIAL_DELAY: 1000,
    },
}));

describe("Port Monitoring Utils", () => {
    let mockIsPortReachable: any;
    let mockIsDev: any;
    let mockLogger: any;
    let mockWithRetry: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.useFakeTimers();

        mockIsPortReachable = vi.mocked((await import("is-port-reachable")).default);
        mockIsDev = vi.mocked((await import("../../../../electronUtils")).isDev);
        mockLogger = vi.mocked((await import("../../../../utils/logger")).logger);
        mockWithRetry = vi.mocked((await import("../../../../utils/retry")).withRetry);

        mockIsDev.mockReturnValue(false);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("performSinglePortCheck", () => {
        it("should return success result when port is reachable", async () => {
            // Arrange
            mockIsPortReachable.mockResolvedValue(true);
            const host = "localhost";
            const port = 80;
            const timeout = 5000;

            // Act
            const result = await performSinglePortCheck(host, port, timeout);

            // Assert
            expect(result).toEqual({
                details: "80",
                responseTime: expect.any(Number),
                status: "up",
            });
            expect(mockIsPortReachable).toHaveBeenCalledWith(port, {
                host,
                timeout,
            });
        });

        it("should throw PortCheckError when port is not reachable", async () => {
            // Arrange
            mockIsPortReachable.mockResolvedValue(false);
            const host = "localhost";
            const port = 80;
            const timeout = 5000;

            // Act & Assert
            await expect(performSinglePortCheck(host, port, timeout)).rejects.toThrow(PortCheckError);
            await expect(performSinglePortCheck(host, port, timeout)).rejects.toThrow(PORT_NOT_REACHABLE);
        });

        it("should log debug info when in dev mode", async () => {
            // Arrange
            mockIsDev.mockReturnValue(true);
            mockIsPortReachable.mockResolvedValue(true);
            const host = "localhost";
            const port = 80;
            const timeout = 5000;

            // Act
            await performSinglePortCheck(host, port, timeout);

            // Assert
            expect(mockLogger.debug).toHaveBeenCalledWith(
                expect.stringContaining(`[PortMonitor] Checking port: ${host}:${port}`)
            );
            expect(mockLogger.debug).toHaveBeenCalledWith(
                expect.stringContaining(`[PortMonitor] Port ${host}:${port} is reachable`)
            );
        });

        it("should not log debug info when not in dev mode", async () => {
            // Arrange
            mockIsDev.mockReturnValue(false);
            mockIsPortReachable.mockResolvedValue(true);
            const host = "localhost";
            const port = 80;
            const timeout = 5000;

            // Act
            await performSinglePortCheck(host, port, timeout);

            // Assert
            expect(mockLogger.debug).not.toHaveBeenCalled();
        });
    });

    describe("PortCheckError", () => {
        it("should create error with response time", () => {
            // Arrange
            const message = "Test error";
            const responseTime = 1000;

            // Act
            const error = new PortCheckError(message, responseTime);

            // Assert
            expect(error.message).toBe(message);
            expect(error.responseTime).toBe(responseTime);
            expect(error.name).toBe("PortCheckError");
        });

        it("should extend Error class", () => {
            // Arrange
            const message = "Test error";
            const responseTime = 1000;

            // Act
            const error = new PortCheckError(message, responseTime);

            // Assert
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(PortCheckError);
        });
    });

    describe("handlePortCheckError", () => {
        it("should handle PortCheckError with response time", () => {
            // Arrange
            const error = new PortCheckError(PORT_NOT_REACHABLE, 1500);
            const host = "localhost";
            const port = 80;

            // Act
            const result = handlePortCheckError(error, host, port);

            // Assert
            expect(result).toEqual({
                details: "80",
                error: PORT_NOT_REACHABLE,
                responseTime: 1500,
                status: "down",
            });
        });

        it("should handle generic Error", () => {
            // Arrange
            const error = new Error("Generic error");
            const host = "localhost";
            const port = 80;

            // Act
            const result = handlePortCheckError(error, host, port);

            // Assert
            expect(result).toEqual({
                details: "80",
                error: "Generic error",
                responseTime: 0,
                status: "down",
            });
        });

        it("should handle unknown error", () => {
            // Arrange
            const error = "String error";
            const host = "localhost";
            const port = 80;

            // Act
            const result = handlePortCheckError(error, host, port);

            // Assert
            expect(result).toEqual({
                details: "80",
                error: "Unknown error",
                responseTime: 0,
                status: "down",
            });
        });

        it("should log debug info when in dev mode", () => {
            // Arrange
            mockIsDev.mockReturnValue(true);
            const error = new Error("Test error");
            const host = "localhost";
            const port = 80;

            // Act
            handlePortCheckError(error, host, port);

            // Assert
            expect(mockLogger.debug).toHaveBeenCalledWith(
                expect.stringContaining(`[PortMonitor] Final error for ${host}:${port}`)
            );
        });

        it("should not log debug info when not in dev mode", () => {
            // Arrange
            mockIsDev.mockReturnValue(false);
            const error = new Error("Test error");
            const host = "localhost";
            const port = 80;

            // Act
            handlePortCheckError(error, host, port);

            // Assert
            expect(mockLogger.debug).not.toHaveBeenCalled();
        });
    });

    describe("performPortCheckWithRetry", () => {
        it("should perform port check with retry logic", async () => {
            // Arrange
            const host = "localhost";
            const port = 80;
            const timeout = 5000;
            const maxRetries = 2;
            const expectedResult = {
                details: "80",
                responseTime: 100,
                status: "up" as const,
            };

            mockWithRetry.mockResolvedValue(expectedResult);

            // Act
            const result = await performPortCheckWithRetry(host, port, timeout, maxRetries);

            // Assert
            expect(result).toEqual(expectedResult);
            expect(mockWithRetry).toHaveBeenCalledWith(expect.any(Function), {
                delayMs: 1000,
                maxRetries: 3, // maxRetries + 1
                onError: expect.any(Function),
                operationName: `Port check for ${host}:${port}`,
            });
        });

        it("should handle retry failure", async () => {
            // Arrange
            const host = "localhost";
            const port = 80;
            const timeout = 5000;
            const maxRetries = 2;
            const error = new PortCheckError(PORT_NOT_REACHABLE, 1000);

            mockWithRetry.mockRejectedValue(error);

            // Act
            const result = await performPortCheckWithRetry(host, port, timeout, maxRetries);

            // Assert
            expect(result).toEqual({
                details: "80",
                error: PORT_NOT_REACHABLE,
                responseTime: 1000,
                status: "down",
            });
        });

        it("should log debug info on retry attempts when in dev mode", async () => {
            // Arrange
            mockIsDev.mockReturnValue(true);
            const host = "localhost";
            const port = 80;
            const timeout = 5000;
            const maxRetries = 2;
            const expectedResult = {
                details: "80",
                responseTime: 100,
                status: "up" as const,
            };

            mockWithRetry.mockImplementation(async (_fn: any, options: any) => {
                // Simulate retry with error callback
                const error = new Error("Test error");
                options.onError?.(error, 1);
                return expectedResult;
            });

            // Act
            await performPortCheckWithRetry(host, port, timeout, maxRetries);

            // Assert
            expect(mockLogger.debug).toHaveBeenCalledWith(
                expect.stringContaining(`[PortMonitor] Port ${host}:${port} failed attempt 1/3`)
            );
        });

        it("should not log debug info on retry attempts when not in dev mode", async () => {
            // Arrange
            mockIsDev.mockReturnValue(false);
            const host = "localhost";
            const port = 80;
            const timeout = 5000;
            const maxRetries = 2;
            const expectedResult = {
                details: "80",
                responseTime: 100,
                status: "up" as const,
            };

            mockWithRetry.mockImplementation(async (_fn: any, options: any) => {
                // Simulate retry with error callback
                const error = new Error("Test error");
                options.onError?.(error, 1);
                return expectedResult;
            });

            // Act
            await performPortCheckWithRetry(host, port, timeout, maxRetries);

            // Assert
            expect(mockLogger.debug).not.toHaveBeenCalled();
        });
    });
});
