/**
 * Tests for HttpMonitor - Basic functionality.
 * Validates HTTP/HTTPS monitoring core functionality.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { HttpMonitor } from "../../../services/monitoring/HttpMonitor";
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
    Agent: vi.fn(() => ({})),
}));

vi.mock("https", () => ({
    Agent: vi.fn(() => ({})),
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

describe("HttpMonitor - Basic", () => {
    let httpMonitor: HttpMonitor;
    let mockWithRetry: any;

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

        mockWithRetry = await import("../../../utils/retry").then((m) => m.withRetry);

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
});
