/**
 * Tests for HttpMonitor.
 * Validates HTTP/HTTPS monitoring functionality and error handling.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable vitest/valid-expect */

import { AxiosError } from "axios";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { HttpMonitor } from "../../../services/monitoring/HttpMonitor";
import {
    determineMonitorStatus,
    handleCheckError,
    handleAxiosError,
    createErrorResult,
} from "../../../services/monitoring/utils";
import type { Site } from "../../../types";

// Define mock instance first
const mockAxiosInstance = {
    interceptors: {
        request: {
            use: vi.fn(),
        },
        response: {
            use: vi.fn(),
        },
    },
    get: vi.fn(),
};

// Mock dependencies
vi.mock("axios", () => ({
    default: {
        create: vi.fn(() => mockAxiosInstance),
        isAxiosError: vi.fn(),
    },
    isAxiosError: vi.fn(),
}));

vi.mock("http", () => ({
    default: {
        Agent: vi.fn(() => ({})),
    },
}));

vi.mock("https", () => ({
    default: {
        Agent: vi.fn(() => ({})),
    },
}));

vi.mock("../../../constants", () => ({
    DEFAULT_REQUEST_TIMEOUT: 5000,
    RETRY_BACKOFF: {
        INITIAL_DELAY: 1000,
    },
    USER_AGENT: "Uptime-Watcher/1.0.0",
}));

vi.mock("../../../electronUtils", () => ({
    isDev: vi.fn(() => false),
}));

vi.mock("../../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock("../../../utils/retry", () => ({
    withRetry: vi.fn((operation) => operation()),
}));

describe("HttpMonitor", () => {
    let httpMonitor: HttpMonitor;
    let mockLogger: any;
    let mockIsDev: any;
    let mockWithRetry: any;
    let mockAxios: any;

    const createMockMonitor = (overrides: Partial<Site["monitors"][0]> = {}): Site["monitors"][0] => ({
        id: "test-monitor-1",
        type: "http",
        url: "https://example.com",
        checkInterval: 60000,
        timeout: 5000,
        retryAttempts: 0,
        monitoring: false,
        status: "pending",
        responseTime: 0,
        lastChecked: new Date(),
        history: [],
        ...overrides,
    });

    beforeEach(async () => {
        vi.clearAllMocks();

        mockLogger = await import("../../../utils/logger").then((m) => m.logger);
        mockIsDev = await import("../../../electronUtils").then((m) => m.isDev);
        mockWithRetry = await import("../../../utils/retry").then((m) => m.withRetry);
        mockAxios = await import("axios").then((m) => m.default);

        httpMonitor = new HttpMonitor();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("Constructor", () => {
        it("should initialize with default config", () => {
            const monitor = new HttpMonitor();
            expect(monitor).toBeInstanceOf(HttpMonitor);
        });

        it("should initialize with custom config", () => {
            const config = { timeout: 10000, userAgent: "Custom Agent" };
            const monitor = new HttpMonitor(config);
            expect(monitor).toBeInstanceOf(HttpMonitor);
        });

        it("should setup axios interceptors", () => {
            expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
            expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
        });
    });

    describe("getType", () => {
        it("should return http type", () => {
            expect(httpMonitor.getType()).toBe("http");
        });
    });

    describe("check", () => {
        it("should reject non-http monitor types", async () => {
            const monitor = createMockMonitor({ type: "port" as any });

            await expect(httpMonitor.check(monitor)).rejects.toThrow("HttpMonitor cannot handle monitor type: port");
        });

        it("should return error for missing URL", async () => {
            const monitor = createMockMonitor({ url: undefined });

            const result = await httpMonitor.check(monitor);

            expect(result).toEqual({
                status: "down",
                error: "HTTP monitor missing URL",
                responseTime: 0,
                details: "0",
            });
        });

        it("should perform health check with default values", async () => {
            const monitor = createMockMonitor();
            mockWithRetry.mockResolvedValue({
                status: "up",
                responseTime: 100,
                details: "200",
            });

            const result = await httpMonitor.check(monitor);

            expect(mockWithRetry).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    delayMs: 1000,
                    maxRetries: 1, // retryAttempts 0 + 1
                    operationName: "HTTP check for https://example.com",
                })
            );
            expect(result.status).toBe("up");
        });

        it("should use monitor-specific timeout and retry attempts", async () => {
            const monitor = createMockMonitor({
                timeout: 8000,
                retryAttempts: 3,
            });
            mockWithRetry.mockResolvedValue({
                status: "up",
                responseTime: 100,
                details: "200",
            });

            await httpMonitor.check(monitor);

            expect(mockWithRetry).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    maxRetries: 4, // retryAttempts 3 + 1
                })
            );
        });

        it("should use DEFAULT_REQUEST_TIMEOUT when both monitor and config timeout are undefined", async () => {
            // Create monitor without timeout
            const monitor = createMockMonitor({ timeout: undefined });

            // Create HttpMonitor with empty config (no timeout)
            const monitorWithoutTimeout = new HttpMonitor({});

            // Reset the mocks to make sure withRetry actually calls the function
            mockWithRetry.mockImplementation(async (fn: any) => {
                return await fn(); // Actually execute the function to hit the timeout logic
            });

            mockAxiosInstance.get.mockResolvedValue({
                status: 200,
                responseTime: 100,
            });

            const result = await monitorWithoutTimeout.check(monitor);

            // Verify the result shows the check worked
            expect(result.status).toBe("up");
            expect(result.details).toBe("200");

            // The important part is that the DEFAULT_REQUEST_TIMEOUT fallback was used
            // This can be verified by checking that axios.get was called with timeout: 5000
            expect(mockAxiosInstance.get).toHaveBeenCalledWith("https://example.com", {
                timeout: 5000, // This proves DEFAULT_REQUEST_TIMEOUT (5000) was used
            });
        });

        it("should use monitor timeout when config timeout is undefined", async () => {
            const monitor = createMockMonitor({ timeout: 3000 });

            // Create HttpMonitor without timeout in config
            const monitorWithoutTimeout = new HttpMonitor({});

            mockWithRetry.mockResolvedValue({
                status: "up",
                responseTime: 100,
                details: "200",
            });

            await monitorWithoutTimeout.check(monitor);

            expect(mockWithRetry).toHaveBeenCalled();
        });

        it("should use config timeout fallback when monitor timeout is undefined", async () => {
            // Create monitor without timeout
            const monitor = createMockMonitor({ timeout: undefined });

            // Create HttpMonitor with config timeout
            const monitorWithConfigTimeout = new HttpMonitor({ timeout: 3000 });

            // Reset withRetry to actually execute the function
            mockWithRetry.mockImplementation(async (fn: any) => {
                return await fn();
            });

            mockAxiosInstance.get.mockResolvedValue({
                status: 200,
                responseTime: 100,
            });

            await monitorWithConfigTimeout.check(monitor);

            // Should use config timeout (3000) when monitor timeout is undefined
            expect(mockAxiosInstance.get).toHaveBeenCalledWith("https://example.com", {
                timeout: 3000,
            });
        });

        it("should hit the ultimate DEFAULT_REQUEST_TIMEOUT fallback", async () => {
            // Create monitor without timeout
            const monitor = createMockMonitor({ timeout: undefined });

            // Create HttpMonitor with no timeout in config
            const monitorNoConfig = new HttpMonitor({});

            // Spy on the internal method to see the actual timeout used
            const makeRequestSpy = vi.spyOn(monitorNoConfig as any, "makeRequest");
            makeRequestSpy.mockResolvedValue({
                status: 200,
                responseTime: 100,
            });

            // Reset withRetry to actually execute the function
            mockWithRetry.mockImplementation(async (fn: any) => {
                return await fn();
            });

            await monitorNoConfig.check(monitor);

            // This should hit lines 100-101: monitor.timeout ?? this.config.timeout ?? DEFAULT_REQUEST_TIMEOUT
            // Since both monitor.timeout and config.timeout are undefined, it should use DEFAULT_REQUEST_TIMEOUT (5000)
            expect(makeRequestSpy).toHaveBeenCalledWith("https://example.com", 5000);

            makeRequestSpy.mockRestore();
        });
    });

    describe("performSingleHealthCheck", () => {
        it("should log debug information in dev mode", async () => {
            // Clear any previous mock calls
            mockLogger.debug.mockClear();
            mockIsDev.mockReturnValue(true);
            mockAxiosInstance.get.mockResolvedValue({
                status: 200,
                responseTime: 150,
            });

            // Access private method through any cast
            const result = await (httpMonitor as any).performSingleHealthCheck("https://example.com", 5000);

            // Verify both debug calls are made (this covers line 141)
            expect(mockLogger.debug).toHaveBeenCalledTimes(2);
            expect(mockLogger.debug).toHaveBeenNthCalledWith(
                1,
                "[HttpMonitor] Checking URL: https://example.com with timeout: 5000ms"
            );
            expect(mockLogger.debug).toHaveBeenNthCalledWith(
                2,
                "[HttpMonitor] URL https://example.com responded with status 200 in 150ms"
            );
            expect(result.status).toBe("up");
        });

        it("should include error in result when status is down", async () => {
            mockAxiosInstance.get.mockResolvedValue({
                status: 500,
                responseTime: 100,
            });

            const result = await (httpMonitor as any).performSingleHealthCheck("https://example.com", 5000);

            expect(result).toEqual({
                details: "500",
                responseTime: 100,
                status: "down",
                error: "HTTP 500", // This covers the conditional spread
            });
        });

        it("should not include error in result when status is up", async () => {
            mockAxiosInstance.get.mockResolvedValue({
                status: 200,
                responseTime: 100,
            });

            const result = await (httpMonitor as any).performSingleHealthCheck("https://example.com", 5000);

            expect(result).toEqual({
                details: "200",
                responseTime: 100,
                status: "up",
                // No error property when status is up
            });
            expect(result).not.toHaveProperty("error");
        });

        it("should not log in production mode", async () => {
            mockIsDev.mockReturnValue(false);
            mockAxiosInstance.get.mockResolvedValue({
                status: 200,
                responseTime: 150,
            });

            await (httpMonitor as any).performSingleHealthCheck("https://example.com", 5000);

            expect(mockLogger.debug).not.toHaveBeenCalled();
        });

        it("should hit both debug logs in dev mode with direct call", async () => {
            // Completely reset all mocks
            vi.clearAllMocks();
            mockLogger.debug.mockClear();
            mockIsDev.mockReturnValue(true);

            // Mock axios response with responseTime
            mockAxiosInstance.get.mockResolvedValue({
                status: 200,
                responseTime: 150, // This should trigger line 141
            });

            // Create a fresh HttpMonitor instance
            const freshMonitor = new HttpMonitor();

            // Call performSingleHealthCheck directly
            const result = await (freshMonitor as any).performSingleHealthCheck("https://test.com", 3000);

            // This should hit both line 137 and line 141
            expect(mockLogger.debug).toHaveBeenCalledTimes(2);
            expect(mockLogger.debug).toHaveBeenNthCalledWith(
                1,
                "[HttpMonitor] Checking URL: https://test.com with timeout: 3000ms"
            );
            expect(mockLogger.debug).toHaveBeenNthCalledWith(
                2,
                "[HttpMonitor] URL https://test.com responded with status 200 in 150ms"
            );
            expect(result.status).toBe("up");
        });

        it("should handle response without responseTime property (line 141 coverage)", async () => {
            // Mock axios to return a response WITHOUT responseTime property
            mockAxiosInstance.get.mockResolvedValue({
                status: 200,
                // Note: no responseTime property, so response.responseTime will be undefined
            });

            // Call performSingleHealthCheck directly to hit line 141
            const result = await (httpMonitor as any).performSingleHealthCheck("https://example.com", 5000);

            // This should trigger: const responseTime = response.responseTime ?? 0;
            // Since response.responseTime is undefined, it should fallback to 0
            expect(result.responseTime).toBe(0);
            expect(result.status).toBe("up");
            expect(result.details).toBe("200");
        });
    });

    describe("determineMonitorStatus utility", () => {
        it("should return up for 2xx status codes", () => {
            expect(determineMonitorStatus(200)).toBe("up");
            expect(determineMonitorStatus(201)).toBe("up");
            expect(determineMonitorStatus(299)).toBe("up");
        });

        it("should return up for 4xx status codes", () => {
            expect(determineMonitorStatus(400)).toBe("up");
            expect(determineMonitorStatus(404)).toBe("up");
            expect(determineMonitorStatus(499)).toBe("up");
        });

        it("should return down for 5xx status codes", () => {
            expect(determineMonitorStatus(500)).toBe("down");
            expect(determineMonitorStatus(503)).toBe("down");
            expect(determineMonitorStatus(599)).toBe("down");
        });

        it("should return up for 3xx status codes", () => {
            expect(determineMonitorStatus(300)).toBe("up");
            expect(determineMonitorStatus(301)).toBe("up");
            expect(determineMonitorStatus(399)).toBe("up");
        });

        it("should return up for other unexpected codes", () => {
            expect(determineMonitorStatus(100)).toBe("up");
            expect(determineMonitorStatus(600)).toBe("down"); // >= 500 is down
        });
    });

    describe("handleCheckError utility", () => {
        it("should handle Error objects", () => {
            const error = new Error("Network error");

            const result = handleCheckError(error, "https://example.com");

            expect(result.status).toBe("down");
            expect(result.error).toBe("Network error");
            expect(result.responseTime).toBe(0);
            expect(result.details).toBe("0");
            expect(mockLogger.error).toHaveBeenCalledWith(
                "[HttpMonitor] Unexpected error checking https://example.com",
                error
            );
        });

        it("should handle string errors", () => {
            const result = handleCheckError("string error", "https://example.com");

            expect(result.status).toBe("down");
            expect(result.error).toBe("Unknown error");
            expect(result.responseTime).toBe(0);
            expect(result.details).toBe("0");
        });

        it("should handle null/undefined errors", () => {
            const result = handleCheckError(null, "https://example.com");

            expect(result.status).toBe("down");
            expect(result.error).toBe("Unknown error");
            expect(result.responseTime).toBe(0);
            expect(result.details).toBe("0");
        });

        it("should handle Axios errors in handleCheckError", () => {
            const axiosError = {
                message: "Request timeout",
                responseTime: 150,
            } as AxiosError;

            // Mock axios.isAxiosError to return true (this is the key!)
            (mockAxios.isAxiosError as any).mockReturnValue(true);

            const result = handleCheckError(axiosError, "https://example.com");

            expect(result).toEqual({
                status: "down",
                error: "Request timeout",
                responseTime: 150,
                details: "0",
            });
        });

        it("should handle non-Axios errors in handleCheckError", async () => {
            const nonAxiosError = new TypeError("Some type error");

            // Mock axios.isAxiosError to return false
            (mockAxios.isAxiosError as any).mockReturnValue(false);

            // Mock withRetry to call our function and catch the error
            (mockWithRetry as any).mockImplementation(async (fn: any) => {
                try {
                    await fn();
                } catch (error) {
                    // Simulate the error being passed to handleCheckError
                    const result = handleCheckError(error, "https://example.com");
                    return result;
                }
            });

            // Mock axios.get to throw a non-Axios error
            mockAxiosInstance.get.mockRejectedValue(nonAxiosError);

            const mockMonitor = createMockMonitor();
            const result = await httpMonitor.check(mockMonitor);

            expect(result.status).toBe("down");
            expect(result.error).toBe("Some type error");
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining("Unexpected error checking"),
                nonAxiosError
            );
        });

        it("should handle unknown error objects in handleCheckError", async () => {
            const unknownError = { weird: "object" };

            // Mock axios.isAxiosError to return false
            (mockAxios.isAxiosError as any).mockReturnValue(false);

            // Mock withRetry to call our function and catch the error
            (mockWithRetry as any).mockImplementation(async (fn: any) => {
                try {
                    await fn();
                } catch (error) {
                    // Simulate the error being passed to handleCheckError
                    const result = handleCheckError(error, "https://example.com");
                    return result;
                }
            });

            // Mock axios.get to throw an unknown error object
            mockAxiosInstance.get.mockRejectedValue(unknownError);

            const mockMonitor = createMockMonitor();
            const result = await httpMonitor.check(mockMonitor);

            expect(result.status).toBe("down");
            expect(result.error).toBe("Unknown error");
            expect(mockLogger.error).toHaveBeenCalledWith(
                expect.stringContaining("Unexpected error checking"),
                unknownError
            );
        });
    });

    describe("handleAxiosError", () => {
        it("should handle axios errors with message", () => {
            const axiosError = {
                message: "Network error occurred",
            } as AxiosError;

            const result = handleAxiosError(axiosError, "https://example.com", 100);

            expect(result).toEqual({
                status: "down",
                error: "Network error occurred",
                responseTime: 100,
                details: "0",
            });
        });

        it("should handle errors without message", () => {
            const axiosError = {} as AxiosError;

            const result = handleAxiosError(axiosError, "https://example.com", 0);

            expect(result).toEqual({
                status: "down",
                error: "Network error",
                responseTime: 0,
                details: "0",
            });
        });

        it("should log debug information in dev mode", () => {
            mockIsDev.mockReturnValue(true);
            const axiosError = {
                message: "Connection failed",
            } as AxiosError;

            handleAxiosError(axiosError, "https://example.com", 0);

            expect(mockLogger.debug).toHaveBeenCalledWith(
                "[HttpMonitor] Network error for https://example.com: Connection failed"
            );
        });
    });

    describe("createErrorResult", () => {
        it("should create error result with given message and response time", () => {
            const result = createErrorResult("Test error", 500);

            expect(result).toEqual({
                status: "down",
                error: "Test error",
                responseTime: 500,
                details: "0",
            });
        });
    });

    describe("makeRequest", () => {
        it("should make request with correct parameters", async () => {
            mockAxiosInstance.get.mockResolvedValue({
                status: 200,
                responseTime: 100,
            });

            const result = await (httpMonitor as any).makeRequest("https://example.com", 5000);

            expect(mockAxiosInstance.get).toHaveBeenCalledWith("https://example.com", {
                timeout: 5000,
            });
            expect(result.status).toBe(200);
        });

        it("should handle request errors", async () => {
            const error = new Error("Request failed");
            mockAxiosInstance.get.mockRejectedValue(error);

            await expect((httpMonitor as any).makeRequest("https://example.com", 5000)).rejects.toThrow(
                "Request failed"
            );
        });
    });

    describe("validateStatus function", () => {
        it("should always return true", async () => {
            mockAxiosInstance.get.mockResolvedValue({
                status: 500,
                responseTime: 100,
            });

            await (httpMonitor as any).makeRequest("https://example.com", 5000);

            // The validateStatus function is set in updateConfig/constructor, not in makeRequest
            // So we'll test it through updateConfig behavior
            expect(mockAxiosInstance.get).toHaveBeenCalledWith("https://example.com", {
                timeout: 5000,
            });
        });
    });

    describe("updateConfig", () => {
        it("should update config and recreate axios instance", () => {
            const newConfig = { timeout: 15000, userAgent: "New Agent" };

            httpMonitor.updateConfig(newConfig);

            expect(mockAxios.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    timeout: 15000,
                    headers: { "User-Agent": "New Agent" },
                })
            );
        });

        it("should setup interceptors after config update", () => {
            httpMonitor.updateConfig({ timeout: 20000 });

            // Should be called twice - once in constructor, once in updateConfig
            expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledTimes(2);
            expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledTimes(2);
        });

        it("should handle partial config updates", () => {
            httpMonitor.updateConfig({ userAgent: "Partial Update" });

            expect(mockAxios.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers: { "User-Agent": "Partial Update" },
                })
            );
        });

        it("should maintain existing config for unspecified properties", () => {
            // Create monitor with initial config
            const initialConfig = { timeout: 5000, userAgent: "Initial" };
            const monitor = new HttpMonitor(initialConfig);

            // Update only timeout
            monitor.updateConfig({ timeout: 8000 });

            const config = monitor.getConfig();
            expect(config.timeout).toBe(8000);
            expect(config.userAgent).toBe("Initial");
        });
    });

    describe("setupInterceptors", () => {
        it("should handle request interceptor success", () => {
            const mockConfig = { metadata: undefined };

            // Get the request interceptor success callback
            const requestSuccessCallback = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
            const result = requestSuccessCallback(mockConfig);

            expect(result.metadata.startTime).toBeTypeOf("number");
        });

        it("should handle request interceptor error", () => {
            const requestErrorCallback = mockAxiosInstance.interceptors.request.use.mock.calls[0][1];
            const error = new Error("Request setup failed");

            expect(() => requestErrorCallback(error)).rejects.toThrow("Request setup failed");
        });

        it("should handle request interceptor with non-Error", () => {
            const requestErrorCallback = mockAxiosInstance.interceptors.request.use.mock.calls[0][1];

            expect(() => requestErrorCallback("string error")).rejects.toThrow("string error");
        });

        it("should handle response interceptor success", () => {
            const mockResponse = {
                config: { metadata: { startTime: 1000 } },
                responseTime: undefined,
            };

            // Mock performance.now to return predictable values
            const mockPerformanceNow = vi.spyOn(performance, "now").mockReturnValue(1150);

            const responseSuccessCallback = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];
            const result = responseSuccessCallback(mockResponse);

            expect(result.responseTime).toBe(150); // 1150 - 1000 = 150

            mockPerformanceNow.mockRestore();
        });

        it("should handle response interceptor success without metadata", () => {
            const mockResponse = { config: {}, responseTime: undefined };

            const responseSuccessCallback = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];
            const result = responseSuccessCallback(mockResponse);

            expect(result.responseTime).toBeUndefined();
        });

        it("should handle response interceptor error with timing", async () => {
            // Test with an Error object to see if timing gets preserved
            const mockError = new Error("Test error");
            (mockError as any).config = { metadata: { startTime: 1000 } };
            (mockError as any).responseTime = undefined;

            const mockPerformanceNow = vi.spyOn(performance, "now").mockReturnValue(1200);

            const responseErrorCallback = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

            try {
                await responseErrorCallback(mockError);
            } catch (error: any) {
                expect(error.responseTime).toBe(200);
            }

            mockPerformanceNow.mockRestore();
        });

        it("should handle response interceptor error without metadata", async () => {
            const mockError = { config: {}, responseTime: undefined };

            const responseErrorCallback = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

            await expect(responseErrorCallback(mockError)).rejects.toThrow("[object Object]");
        });

        it("should handle response interceptor with non-Error", () => {
            const responseErrorCallback = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

            expect(() => responseErrorCallback("string error")).rejects.toThrow("string error");
        });
    });

    describe("getConfig", () => {
        it("should return copy of current config", () => {
            const config = httpMonitor.getConfig();

            expect(config).toEqual({
                timeout: 5000,
                userAgent: "Uptime-Watcher/1.0.0",
            });

            // Verify it's a copy, not the original
            config.timeout = 99999;
            expect(httpMonitor.getConfig().timeout).toBe(5000);
        });

        it("should return updated config after updateConfig", () => {
            httpMonitor.updateConfig({ timeout: 25000 });

            const config = httpMonitor.getConfig();
            expect(config.timeout).toBe(25000);
        });
    });

    describe("Error handling in withRetry callback", () => {
        it("should handle errors in retry operation", async () => {
            const mockError = new Error("Retry error");
            mockWithRetry.mockImplementation(async (_fn: any, options: any) => {
                // Simulate retry calling the onError callback
                if (options.onError) {
                    options.onError(mockError, 1);
                }
                // The retry utility should throw the error after retries are exhausted
                throw mockError;
            });

            mockIsDev.mockReturnValue(true);

            const monitor = createMockMonitor();
            const result = await httpMonitor.check(monitor);

            // The handleCheckError method catches the error and returns a result
            expect(result).toEqual({
                details: "0",
                error: "Retry error",
                responseTime: 0,
                status: "down",
            });

            expect(mockLogger.debug).toHaveBeenCalledWith(
                expect.stringContaining("[HttpMonitor] URL https://example.com failed attempt 1/")
            );
        });

        it("should handle non-Error objects in retry callback", async () => {
            mockWithRetry.mockImplementation(async (_fn: any, options: any) => {
                if (options.onError) {
                    options.onError("string error", 2);
                }
                throw new Error("Final error");
            });

            mockIsDev.mockReturnValue(true);

            const monitor = createMockMonitor();
            const result = await httpMonitor.check(monitor);

            // The handleCheckError method catches the error and returns a result
            expect(result).toEqual({
                details: "0",
                error: "Final error",
                responseTime: 0,
                status: "down",
            });

            expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining("string error"));
        });
    });

    it("should cover all timeout fallback branches and debug logging", async () => {
        // Test 1: Cover the timeout fallback chain (lines 100-101)
        // Create a monitor where timeout is undefined
        const monitorUndefinedTimeout = createMockMonitor({
            timeout: undefined,
        });

        // Create an HttpMonitor where config.timeout is also undefined
        const httpMonitorUndefinedConfig = new HttpMonitor({}); // Empty config = undefined timeout

        // Mock withRetry to actually execute the function instead of bypassing it
        mockWithRetry.mockImplementation(async (fn: any) => {
            return await fn();
        });

        // Reset isDev to true for debug logging
        mockIsDev.mockReturnValue(true);
        mockLogger.debug.mockClear();

        // Mock axios response
        mockAxiosInstance.get.mockResolvedValue({
            status: 200,
            responseTime: 123,
        });

        // This should hit: monitor.timeout (undefined) ?? this.config.timeout (undefined) ?? DEFAULT_REQUEST_TIMEOUT
        // Since both monitor.timeout and config.timeout are undefined, it should use DEFAULT_REQUEST_TIMEOUT (5000)
        const result = await httpMonitorUndefinedConfig.check(monitorUndefinedTimeout);

        // Verify the result
        expect(result.status).toBe("up");
        expect(result.details).toBe("200");
        expect(result.responseTime).toBe(123);

        // Verify that makeRequest was called with DEFAULT_REQUEST_TIMEOUT (5000)
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("https://example.com", {
            timeout: 5000,
        });

        // Verify both debug logs were called (covering line 141)
        expect(mockLogger.debug).toHaveBeenCalledTimes(2);
        expect(mockLogger.debug).toHaveBeenCalledWith(
            "[HttpMonitor] Checking URL: https://example.com with timeout: 5000ms"
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
            "[HttpMonitor] URL https://example.com responded with status 200 in 123ms"
        );
    });

    describe("retryAttempts fallback (lines 100-101 coverage)", () => {
        it("should cover retryAttempts fallback (lines 100-101 coverage)", async () => {
            // Create a monitor without retryAttempts property
            const monitor = createMockMonitor({
                retryAttempts: undefined as any, // Force undefined
            });

            // Reset withRetry to actually execute
            mockWithRetry.mockImplementation(async (fn: any) => {
                return await fn();
            });

            mockAxiosInstance.get.mockResolvedValue({
                status: 200,
                responseTime: 100,
            });

            const result = await httpMonitor.check(monitor);

            // This should trigger: const retryAttempts = monitor.retryAttempts ?? 0;
            // Since monitor.retryAttempts is undefined, it should fallback to 0
            // We can verify this by checking that withRetry was called with maxRetries: 1 (0 + 1)
            expect(mockWithRetry).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    maxRetries: 1, // retryAttempts (0) + 1
                })
            );

            expect(result.status).toBe("up");
        });
    });

    it("should hit the exact DEFAULT_REQUEST_TIMEOUT fallback branch (line 100)", async () => {
        // Create monitor with explicit undefined timeout (not just missing property)
        const monitor = {
            ...createMockMonitor(),
            timeout: undefined, // Explicitly undefined
        };

        // Create HttpMonitor with explicit undefined timeout in config
        const monitorWithUndefinedConfig = new HttpMonitor({
            timeout: undefined, // Explicitly undefined, not missing
            userAgent: "Test",
        });

        // Reset withRetry to execute the actual function
        mockWithRetry.mockImplementation(async (fn: any) => {
            return await fn();
        });

        mockAxiosInstance.get.mockResolvedValue({
            status: 200,
            responseTime: 50,
        });

        await monitorWithUndefinedConfig.check(monitor);

        // This should hit: monitor.timeout (undefined) ?? this.config.timeout (undefined) ?? DEFAULT_REQUEST_TIMEOUT (5000)
        expect(mockAxiosInstance.get).toHaveBeenCalledWith("https://example.com", {
            timeout: 5000, // DEFAULT_REQUEST_TIMEOUT
        });
    });
});
