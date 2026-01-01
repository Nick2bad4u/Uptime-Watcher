/**
 * Test suite for HttpKeywordMonitor service.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "@shared/types";
import type { MonitorCheckResult } from "../../../services/monitoring/types";

import { HttpKeywordMonitor } from "../../../services/monitoring/HttpKeywordMonitor";

const {
    axiosGetMock,
    createMonitorConfigMock,
    createMonitorErrorResultMock,
    handleCheckErrorMock,
    scheduleMock,
    validateMonitorUrlMock,
    withOperationalHooksMock,
} = vi.hoisted(() => {
    const schedule = vi.fn(
        async (_url: string, operation: () => Promise<MonitorCheckResult>) =>
            operation()
    );
    const createMonitorConfig = vi.fn();
    const createMonitorErrorResult = vi.fn();
    const validateMonitorUrl = vi.fn();
    const handleCheckError = vi.fn();
    const axiosGet = vi.fn();
    const withOperationalHooks = vi.fn(async <T>(operation: () => Promise<T>) =>
        operation()
    );

    return {
        axiosGetMock: axiosGet,
        createMonitorConfigMock: createMonitorConfig,
        createMonitorErrorResultMock: createMonitorErrorResult,
        handleCheckErrorMock: handleCheckError,
        scheduleMock: schedule,
        validateMonitorUrlMock: validateMonitorUrl,
        withOperationalHooksMock: withOperationalHooks,
    };
});

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
    withOperationalHooks: withOperationalHooksMock,
}));

vi.mock("../../../services/monitoring/shared/monitorServiceHelpers", () => ({
    createMonitorConfig: createMonitorConfigMock,
    createMonitorErrorResult: createMonitorErrorResultMock,
    validateMonitorUrl: validateMonitorUrlMock,
}));

vi.mock("../../../services/monitoring/utils/errorHandling", () => ({
    handleCheckError: handleCheckErrorMock,
    isCancellationError: vi.fn(() => false),
}));

vi.mock("../../../services/monitoring/utils/httpClient", () => ({
    createHttpClient: vi.fn(() => ({
        get: axiosGetMock,
    })),
}));

vi.mock("../../../services/monitoring/utils/httpRateLimiter", () => ({
    getSharedHttpRateLimiter: vi.fn(() => ({
        schedule: scheduleMock,
    })),
}));

vi.mock("../../../../shared/utils/logTemplates", () => ({
    interpolateLogTemplate: vi.fn(),
    LOG_TEMPLATES: {
        debug: {
            MONITOR_RESPONSE_TIME:
                "URL {url} responded in {responseTime}ms with status {status}",
        },
    },
}));

describe(HttpKeywordMonitor, () => {
    let monitorService: HttpKeywordMonitor;
    let monitor: Site["monitors"][0];

    beforeEach(() => {
        vi.clearAllMocks();

        createMonitorErrorResultMock.mockReturnValue({
            details: "Invalid keyword",
            responseTime: 0,
            status: "down",
        });
        createMonitorConfigMock.mockReturnValue({
            retryAttempts: 0,
            timeout: 5000,
        });
        validateMonitorUrlMock.mockReturnValue(null);
        withOperationalHooksMock.mockImplementation(
            async <T>(operation: () => Promise<T>) => operation()
        );
        handleCheckErrorMock.mockReturnValue({
            details: "request error",
            responseTime: 0,
            status: "down",
        });

        monitorService = new HttpKeywordMonitor();
        monitor = {
            activeOperations: [],
            bodyKeyword: "success",
            checkInterval: 60_000,
            history: [],
            id: "monitor-1",
            monitoring: true,
            responseTime: 0,
            retryAttempts: 0,
            status: "pending",
            timeout: 5000,
            type: "http-keyword",
            url: "https://example.com/health",
        } as Site["monitors"][0];
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("returns up when the keyword is present", async () => {
        axiosGetMock.mockResolvedValue({
            data: "service success",
            responseTime: 150,
            status: 200,
        });

        const result = await monitorService.check(monitor);

        expect(result.status).toBe("up");
        expect(result.responseTime).toBe(150);
        expect(result.details).toContain('Keyword "success" found');
        expect(scheduleMock).toHaveBeenCalledWith(
            "https://example.com/health",
            expect.any(Function)
        );
        expect(withOperationalHooksMock).toHaveBeenCalled();
    });

    it("returns degraded when the keyword is missing", async () => {
        axiosGetMock.mockResolvedValue({
            data: "service failure",
            responseTime: 200,
            status: 200,
        });

        const result = await monitorService.check(monitor);

        expect(result.status).toBe("degraded");
        expect(result.details).toContain("not found");
    });

    it("returns error result when keyword configuration is invalid", async () => {
        const invalidMonitor = { ...monitor } as Site["monitors"][0];
        Reflect.deleteProperty(invalidMonitor, "bodyKeyword");

        const result = await monitorService.check(invalidMonitor);

        expect(result).toEqual({
            details: "Invalid keyword",
            responseTime: 0,
            status: "down",
        });
        expect(createMonitorErrorResultMock).toHaveBeenCalledWith(
            "Monitor missing or invalid keyword",
            0
        );
        expect(scheduleMock).not.toHaveBeenCalled();
    });

    it("delegates to handleCheckError when the HTTP request fails", async () => {
        const error = new Error("Request failed");
        axiosGetMock.mockRejectedValue(error);

        const result = await monitorService.check(monitor);

        expect(handleCheckErrorMock).toHaveBeenCalledWith(error, monitor.url);
        expect(result.status).toBe("down");
        expect(result.details).toBe("request error");
    });
});
