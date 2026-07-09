/**
 * Ensures HTTP monitor logs never include sensitive URL components.
 */

import type { Monitor } from "@shared/types";
import type { withOperationalHooks as withOperationalHooksType } from "../../../../utils/operationalHooks";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { HttpMonitor } from "../../../../services/monitoring/HttpMonitor";

const mockAxiosInstance = vi.hoisted(() => ({
    get: vi.fn(),
}));

const loggerMock = vi.hoisted(() => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
}));

type OperationalHookOptions = Parameters<typeof withOperationalHooksType>[1];

const operationalHookOptions = vi.hoisted((): OperationalHookOptions[] => []);

vi.mock("../../../../services/monitoring/utils/httpClient", () => ({
    createHttpClient: vi.fn(() => mockAxiosInstance),
}));

vi.mock("../../../../services/monitoring/utils/httpRateLimiter", () => ({
    getSharedHttpRateLimiter: () => ({
        schedule: async <T>(_url: string, fn: () => Promise<T>): Promise<T> =>
            fn(),
    }),
}));

vi.mock("../../../../utils/operationalHooks", () => ({
    withOperationalHooks: async <T>(
        fn: () => Promise<T>,
        options: OperationalHookOptions
    ): Promise<T> => {
        operationalHookOptions.push(options);
        return fn();
    },
}));

vi.mock("../../../../electronUtils", () => ({
    isDev: () => true,
}));

vi.mock("../../../../utils/logger", () => ({
    logger: loggerMock,
}));

describe("httpMonitorCore safe URL logging", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        operationalHookOptions.length = 0;

        mockAxiosInstance.get.mockResolvedValue({
            config: {},
            data: "ok",
            status: 200,
        });
    });

    it("redacts query/hash in debug logs", async () => {
        const monitor: Monitor = {
            checkInterval: 5000,
            history: [],
            id: "m1",
            monitoring: true,
            responseTime: -1,
            retryAttempts: 0,
            status: "pending",
            timeout: 1000,
            type: "http",
            url: "https://example.com/path?token=secret#frag",
        };

        const service = new HttpMonitor({ timeout: 1000 });
        await service.check(monitor);

        const checkingLog = loggerMock.debug.mock.calls
            .map((call) => String(call[0]))
            .find((message) => message.includes("Checking URL:"));

        expect(checkingLog).toBeDefined();
        expect(checkingLog).toContain("https://example.com/path");
        expect(checkingLog).not.toContain("token=secret");
        expect(checkingLog).not.toContain("#frag");
    });

    it("redacts query/hash in operation names", async () => {
        const monitor: Monitor = {
            checkInterval: 5000,
            history: [],
            id: "m1",
            monitoring: true,
            responseTime: -1,
            retryAttempts: 0,
            status: "pending",
            timeout: 1000,
            type: "http",
            url: "https://example.com/path?token=secret#frag",
        };

        const service = new HttpMonitor({ timeout: 1000 });
        await service.check(monitor);

        const operationName = operationalHookOptions.at(-1)?.operationName;

        expect(operationName).toBe("HTTP check for https://example.com/path");
        expect(operationName).not.toContain("token=secret");
        expect(operationName).not.toContain("#frag");
    });
});
