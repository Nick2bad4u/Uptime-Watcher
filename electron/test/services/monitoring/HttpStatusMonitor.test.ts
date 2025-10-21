/**
 * Test suite for HttpStatusMonitor service.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "@shared/types";
import type { MonitorCheckResult } from "../../../services/monitoring/types";

import { HttpStatusMonitor } from "../../../services/monitoring/HttpStatusMonitor";

const {
    axiosGetMock,
    createMonitorErrorResultMock,
    extractMonitorConfigMock,
    handleCheckErrorMock,
    scheduleMock,
    validateMonitorUrlMock,
    withOperationalHooksMock,
} = vi.hoisted(() => {
    const schedule = vi.fn(
        async (_url: string, operation: () => Promise<MonitorCheckResult>) =>
            operation()
    );
    const createMonitorErrorResult = vi.fn();
    const extractMonitorConfig = vi.fn();
    const validateMonitorUrl = vi.fn();
    const handleCheckError = vi.fn();
    const axiosGet = vi.fn();
    const withOperationalHooks = vi.fn(async <T>(operation: () => Promise<T>) =>
        operation()
    );

    return {
        axiosGetMock: axiosGet,
        createMonitorErrorResultMock: createMonitorErrorResult,
        extractMonitorConfigMock: extractMonitorConfig,
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
    createMonitorErrorResult: createMonitorErrorResultMock,
    extractMonitorConfig: extractMonitorConfigMock,
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

describe(HttpStatusMonitor, () => {
    let monitorService: HttpStatusMonitor;
    let monitor: Site["monitors"][0];

    beforeEach(() => {
        vi.clearAllMocks();

        createMonitorErrorResultMock.mockReturnValue({
            details: "Invalid status",
            responseTime: 0,
            status: "down",
        });
        extractMonitorConfigMock.mockReturnValue({
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

        monitorService = new HttpStatusMonitor();
        monitor = {
            activeOperations: [],
            checkInterval: 60_000,
            expectedStatusCode: 200,
            history: [],
            id: "monitor-2",
            monitoring: true,
            responseTime: 0,
            retryAttempts: 0,
            status: "pending",
            timeout: 5000,
            type: "http-status",
            url: "https://example.com/api",
        } as Site["monitors"][0];
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("returns up when status code matches", async () => {
        axiosGetMock.mockResolvedValue({
            data: "ok",
            responseTime: 90,
            status: 200,
        });

        const result = await monitorService.check(monitor);

        expect(result.status).toBe("up");
        expect(result.details).toBe("HTTP 200");
        expect(result.responseTime).toBe(90);
        expect(scheduleMock).toHaveBeenCalledWith(
            "https://example.com/api",
            expect.any(Function)
        );
    });

    it("returns degraded when status code differs", async () => {
        axiosGetMock.mockResolvedValue({
            data: "not found",
            responseTime: 120,
            status: 404,
        });

        const result = await monitorService.check(monitor);

        expect(result.status).toBe("degraded");
        expect(result.details).toBe("Expected 200, received 404");
    });

    it("returns error result when expected status code is invalid", async () => {
        const invalidMonitor = { ...monitor } as Site["monitors"][0];
        Reflect.deleteProperty(invalidMonitor, "expectedStatusCode");

        const result = await monitorService.check(invalidMonitor);

        expect(result).toEqual({
            details: "Invalid status",
            responseTime: 0,
            status: "down",
        });
        expect(createMonitorErrorResultMock).toHaveBeenCalledWith(
            "Monitor missing or invalid expected status code",
            0
        );
        expect(scheduleMock).not.toHaveBeenCalled();
    });

    it("delegates to handleCheckError when the HTTP request fails", async () => {
        const error = new Error("Network error");
        axiosGetMock.mockRejectedValue(error);

        const result = await monitorService.check(monitor);

        expect(handleCheckErrorMock).toHaveBeenCalledWith(error, monitor.url);
        expect(result.status).toBe("down");
        expect(result.details).toBe("request error");
    });
});
