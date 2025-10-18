/**
 * Comprehensive test suite for HttpMonitor
 *
 * @remarks
 * Tests all functionality including HTTP health checks, error handling,
 * configuration management, Axios integration, and retry logic.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AxiosResponse } from "axios";

import type { Site } from "@shared/types";
import type {
    MonitorCheckResult,
    MonitorConfig,
} from "../../../services/monitoring/types";

import { HttpMonitor } from "../../../services/monitoring/HttpMonitor";

// Mock dependencies
vi.mock("../../../constants", () => ({
    DEFAULT_REQUEST_TIMEOUT: 5000,
    RETRY_BACKOFF: { INITIAL_DELAY: 100 },
    USER_AGENT: "UptimeWatcher/1.0",
}));

vi.mock("../../../electronUtils", () => ({
    isDev: vi.fn(() => false),
}));

vi.mock("../../../utils/logger", () => {
    const createLoggerMock = () => ({
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    });
    return {
        logger: createLoggerMock(),
        diagnosticsLogger: createLoggerMock(),
    };
});

vi.mock("../../../utils/operationalHooks", () => ({
    withOperationalHooks: vi.fn(),
}));

vi.mock("../../../services/monitoring/shared/monitorServiceHelpers", () => ({
    createMonitorErrorResult: vi.fn(),
    extractMonitorConfig: vi.fn(),
    validateMonitorUrl: vi.fn(),
}));

vi.mock("../../../services/monitoring/utils/errorHandling", () => ({
    handleCheckError: vi.fn(),
}));

vi.mock("../../../services/monitoring/utils/httpClient", () => ({
    createHttpClient: vi.fn(),
}));

vi.mock("../../../services/monitoring/utils/httpStatusUtils", () => ({
    determineMonitorStatus: vi.fn(),
}));

vi.mock("@shared/utils/logTemplates", () => ({
    interpolateLogTemplate: vi.fn(),
    LOG_TEMPLATES: {
        debug: {
            MONITOR_RESPONSE_TIME:
                "URL {url} responded in {responseTime}ms with status {status}",
        },
    },
}));

describe("HttpMonitor - Comprehensive Coverage", () => {
    let httpMonitor: HttpMonitor;
    let mockAxiosInstance: any;

    beforeEach(async () => {
        vi.clearAllMocks();

        // Mock Axios instance
        mockAxiosInstance = {
            get: vi.fn(),
        };

        const { createHttpClient } = vi.mocked(
            await import("../../../services/monitoring/utils/httpClient")
        );
        createHttpClient.mockReturnValue(mockAxiosInstance);

        httpMonitor = new HttpMonitor();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Constructor", () => {
        it("should create instance with default config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            expect(httpMonitor).toBeDefined();
            expect(httpMonitor).toBeInstanceOf(HttpMonitor);
        });

        it("should create instance with custom config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const config: MonitorConfig = {
                timeout: 10_000,
                userAgent: "Custom/1.0",
            };

            const customMonitor = new HttpMonitor(config);
            expect(customMonitor.getConfig()).toEqual({
                timeout: 10_000,
                userAgent: "Custom/1.0",
            });
        });

        it("should merge config with defaults", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const config: MonitorConfig = { timeout: 8000 };
            const monitor = new HttpMonitor(config);

            const result = monitor.getConfig();
            expect(result.timeout).toBe(8000);
            expect(result.userAgent).toBe("UptimeWatcher/1.0");
        });
    });

    describe("getType", () => {
        it("should return 'http'", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            expect(httpMonitor.getType()).toBe("http");
        });
    });

    describe("getConfig", () => {
        it("should return copy of current config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const config = httpMonitor.getConfig();
            expect(config).toEqual({
                timeout: 5000,
                userAgent: "UptimeWatcher/1.0",
            });
        });

        it("should return shallow copy", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const config1 = httpMonitor.getConfig();
            const config2 = httpMonitor.getConfig();

            expect(config1).not.toBe(config2);
            expect(config1).toEqual(config2);
        });
    });

    describe("updateConfig", () => {
        it("should update timeout config", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Update", "type");

            httpMonitor.updateConfig({ timeout: 15_000 });
            expect(httpMonitor.getConfig().timeout).toBe(15_000);
        });

        it("should update userAgent config", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Update", "type");

            httpMonitor.updateConfig({ userAgent: "NewAgent/2.0" });
            expect(httpMonitor.getConfig().userAgent).toBe("NewAgent/2.0");
        });

        it("should merge partial config", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            httpMonitor.updateConfig({ timeout: 12_000 });
            const config = httpMonitor.getConfig();
            expect(config.timeout).toBe(12_000);
            expect(config.userAgent).toBe("UptimeWatcher/1.0");
        });

        it("should recreate axios instance on config update", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const { createHttpClient } = vi.mocked(
                await import("../../../services/monitoring/utils/httpClient")
            );

            httpMonitor.updateConfig({ timeout: 20_000 });

            expect(createHttpClient).toHaveBeenCalledTimes(2); // Once for constructor, once for update
        });

        it("should throw error for invalid timeout", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => httpMonitor.updateConfig({ timeout: -1000 })).toThrow(
                "Invalid timeout: must be a positive number"
            );
            expect(() => httpMonitor.updateConfig({ timeout: 0 })).toThrow(
                "Invalid timeout: must be a positive number"
            );
            expect(() =>
                httpMonitor.updateConfig({ timeout: "invalid" as any })
            ).toThrow("Invalid timeout: must be a positive number");
        });

        it("should throw error for invalid userAgent", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            expect(() =>
                httpMonitor.updateConfig({ userAgent: 123 as any })
            ).toThrow("Invalid userAgent: must be a string");
        });
    });

    describe("check", () => {
        it("should throw error for non-http monitor type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                type: "ping",
                host: "example.com",
                id: "test",
                checkInterval: 60_000,
                history: [],
                monitoring: true,
                responseTime: 0,
                status: "pending" as const,
                enabled: true,
            } as any;

            await expect(httpMonitor.check(monitor)).rejects.toThrow(
                "HttpMonitor cannot handle monitor type: ping"
            );
        });

        it("should return error result for invalid URL", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const { validateMonitorUrl, createMonitorErrorResult } = vi.mocked(
                await import(
                    "../../../services/monitoring/shared/monitorServiceHelpers"
                )
            );

            validateMonitorUrl.mockReturnValue("Invalid URL");
            createMonitorErrorResult.mockReturnValue({
                status: "down",
                responseTime: 0,
                error: "Invalid URL",
                details: "Invalid URL",
            });

            const monitor: Site["monitors"][0] = {
                type: "http",
                url: "invalid-url",
                id: "test-monitor",
                checkInterval: 60_000,
                history: [],
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
            };

            const result = await httpMonitor.check(monitor);

            expect(validateMonitorUrl).toHaveBeenCalledWith(monitor);
            expect(createMonitorErrorResult).toHaveBeenCalledWith(
                "Invalid URL",
                0
            );
            expect(result.status).toBe("down");
        });

        it("should perform health check with extracted config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const { validateMonitorUrl, extractMonitorConfig } = vi.mocked(
                await import(
                    "../../../services/monitoring/shared/monitorServiceHelpers"
                )
            );
            const { withOperationalHooks: mockWithHooks } = vi.mocked(
                await import("../../../utils/operationalHooks")
            );

            validateMonitorUrl.mockReturnValue(null);
            extractMonitorConfig.mockReturnValue({
                timeout: 8000,
                retryAttempts: 2,
            });

            const mockResult: MonitorCheckResult = {
                status: "up",
                responseTime: 150,
                details: "200",
            };

            mockWithHooks.mockResolvedValue(mockResult);

            const monitor: Site["monitors"][0] = {
                type: "http",
                url: "https://example.com",
                id: "test-monitor-2",
                checkInterval: 60_000,
                history: [],
                monitoring: true,
                responseTime: 150,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
            };

            const result = await httpMonitor.check(monitor);

            expect(extractMonitorConfig).toHaveBeenCalledWith(monitor, 5000);
            expect(mockWithHooks).toHaveBeenCalled();
            expect(result).toEqual(mockResult);
        });

        it("should handle check errors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const { validateMonitorUrl, extractMonitorConfig } = vi.mocked(
                await import(
                    "../../../services/monitoring/shared/monitorServiceHelpers"
                )
            );
            const { withOperationalHooks: mockWithHooks } = vi.mocked(
                await import("../../../utils/operationalHooks")
            );
            const { handleCheckError } = vi.mocked(
                await import("../../../services/monitoring/utils/errorHandling")
            );

            validateMonitorUrl.mockReturnValue(null);
            extractMonitorConfig.mockReturnValue({
                timeout: 5000,
                retryAttempts: 3,
            });

            const error = new Error("Network error");
            mockWithHooks.mockRejectedValue(error);

            const errorResult: MonitorCheckResult = {
                status: "down",
                responseTime: 0,
                error: "Network error",
                details: "Network error",
            };
            handleCheckError.mockReturnValue(errorResult);

            const monitor: Site["monitors"][0] = {
                type: "http",
                url: "https://example.com",
                id: "test-monitor-3",
                checkInterval: 60_000,
                history: [],
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
            };

            const result = await httpMonitor.check(monitor);

            expect(handleCheckError).toHaveBeenCalledWith(
                error,
                "https://example.com"
            );
            expect(result).toEqual(errorResult);
        });
    });

    describe("makeRequest (private method via performSingleHealthCheck)", () => {
        it("should make successful HTTP request", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const { determineMonitorStatus } = vi.mocked(
                await import(
                    "../../../services/monitoring/utils/httpStatusUtils"
                )
            );

            const mockResponse: AxiosResponse = {
                status: 200,
                responseTime: 123,
                data: "OK",
                statusText: "OK",
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);
            determineMonitorStatus.mockReturnValue("up");

            // Access private method through public interface
            const result = await (httpMonitor as any).performSingleHealthCheck(
                "https://example.com",
                5000
            );

            expect(mockAxiosInstance.get).toHaveBeenCalledWith(
                "https://example.com",
                expect.objectContaining({
                    timeout: 5000,
                    signal: expect.any(AbortSignal),
                })
            );
            expect(determineMonitorStatus).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                status: "up",
                responseTime: 123,
                details: "200",
            });
        });

        it("should handle response without responseTime", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const { determineMonitorStatus } = vi.mocked(
                await import(
                    "../../../services/monitoring/utils/httpStatusUtils"
                )
            );

            const mockResponse: AxiosResponse = {
                status: 200,
                data: "OK",
                statusText: "OK",
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);
            determineMonitorStatus.mockReturnValue("up");

            const result = await (httpMonitor as any).performSingleHealthCheck(
                "https://example.com",
                5000
            );

            expect(result.responseTime).toBe(0);
        });

        it("should include error for down status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const { determineMonitorStatus } = vi.mocked(
                await import(
                    "../../../services/monitoring/utils/httpStatusUtils"
                )
            );

            const mockResponse: AxiosResponse = {
                status: 500,
                responseTime: 250,
                data: "Internal Server Error",
                statusText: "Internal Server Error",
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);
            determineMonitorStatus.mockReturnValue("down");

            const result = await (httpMonitor as any).performSingleHealthCheck(
                "https://example.com",
                5000
            );

            expect(result).toEqual({
                status: "down",
                responseTime: 250,
                details: "500",
                error: "HTTP 500",
            });
        });
    });

    describe("Development mode logging", () => {
        it("should log debug messages in dev mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const { isDev } = vi.mocked(await import("../../../electronUtils"));
            const { logger } = vi.mocked(await import("../../../utils/logger"));
            const { determineMonitorStatus } = vi.mocked(
                await import(
                    "../../../services/monitoring/utils/httpStatusUtils"
                )
            );
            const { interpolateLogTemplate, LOG_TEMPLATES } = vi.mocked(
                await import("@shared/utils/logTemplates")
            );

            isDev.mockReturnValue(true);

            const mockResponse: AxiosResponse = {
                status: 200,
                responseTime: 150,
                data: "OK",
                statusText: "OK",
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);
            determineMonitorStatus.mockReturnValue("up");
            interpolateLogTemplate.mockReturnValue(
                "URL https://example.com responded in 150ms with status 200"
            );

            await (httpMonitor as any).performSingleHealthCheck(
                "https://example.com",
                5000
            );

            expect(logger.debug).toHaveBeenCalledWith(
                "[HttpMonitor] Checking URL: https://example.com with timeout: 5000ms"
            );
            expect(interpolateLogTemplate).toHaveBeenCalledWith(
                LOG_TEMPLATES.debug.MONITOR_RESPONSE_TIME,
                {
                    responseTime: 150,
                    status: 200,
                    url: "https://example.com",
                }
            );
            expect(logger.debug).toHaveBeenCalledWith(
                "URL https://example.com responded in 150ms with status 200"
            );
        });

        it("should not log in production mode", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const { isDev } = vi.mocked(await import("../../../electronUtils"));
            const { logger } = vi.mocked(await import("../../../utils/logger"));
            const { determineMonitorStatus } = vi.mocked(
                await import(
                    "../../../services/monitoring/utils/httpStatusUtils"
                )
            );

            isDev.mockReturnValue(false);

            const mockResponse: AxiosResponse = {
                status: 200,
                responseTime: 150,
                data: "OK",
                statusText: "OK",
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);
            determineMonitorStatus.mockReturnValue("up");

            await (httpMonitor as any).performSingleHealthCheck(
                "https://example.com",
                5000
            );

            expect(logger.debug).not.toHaveBeenCalled();
        });
    });

    describe("Integration Tests", () => {
        it("should handle complete workflow with retry logic", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: HttpMonitor", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const { validateMonitorUrl, extractMonitorConfig } = vi.mocked(
                await import(
                    "../../../services/monitoring/shared/monitorServiceHelpers"
                )
            );
            const { withOperationalHooks: mockWithHooks } = vi.mocked(
                await import("../../../utils/operationalHooks")
            );
            const { determineMonitorStatus } = vi.mocked(
                await import(
                    "../../../services/monitoring/utils/httpStatusUtils"
                )
            );

            validateMonitorUrl.mockReturnValue(null);
            extractMonitorConfig.mockReturnValue({
                timeout: 10_000,
                retryAttempts: 1,
            });

            const mockResponse: AxiosResponse = {
                status: 200,
                responseTime: 95,
                data: "Success",
                statusText: "OK",
                headers: {},
                config: {} as any,
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);
            determineMonitorStatus.mockReturnValue("up");

            // Mock withOperationalHooks to call the actual function
            mockWithHooks.mockImplementation(async (fn) => await fn());

            const monitor: Site["monitors"][0] = {
                type: "http",
                url: "https://api.example.com/health",
                id: "mon_123",
                checkInterval: 60_000,
                history: [],
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
            };

            const result = await httpMonitor.check(monitor);

            expect(result).toEqual({
                status: "up",
                responseTime: 95,
                details: "200",
            });

            // Verify retry configuration
            expect(mockWithHooks).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    maxRetries: 2, // RetryAttempts + 1
                    operationName:
                        "HTTP check for https://api.example.com/health",
                })
            );
        });
    });
});
