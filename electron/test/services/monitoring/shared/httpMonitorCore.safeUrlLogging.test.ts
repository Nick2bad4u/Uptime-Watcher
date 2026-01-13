/**
 * Ensures HTTP monitor logs never include sensitive URL components (auth,
 * query, hash).
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Monitor } from "@shared/types";

const mockAxiosInstance = vi.hoisted(() => ({
    get: vi.fn(),
}));

const loggerMock = vi.hoisted(() => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
}));

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
        _options: unknown
    ): Promise<T> => fn(),
}));

vi.mock("../../../../electronUtils", () => ({
    isDev: () => true,
}));

vi.mock("../../../../utils/logger", () => ({
    logger: loggerMock,
}));

import { HttpMonitor } from "../../../../services/monitoring/HttpMonitor";

describe("httpMonitorCore safe URL logging", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockAxiosInstance.get.mockResolvedValue({
            config: {},
            data: "ok",
            status: 200,
        });
    });

    it("redacts query/hash/auth in debug logs", async () => {
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
            url: "https://user:pass@example.com/path?token=secret#frag",
        };

        const service = new HttpMonitor({ timeout: 1000 });
        await service.check(monitor);

        const checkingLog = loggerMock.debug.mock.calls
            .map((call) => String(call[0]))
            .find((message) => message.includes("Checking URL:"));

        expect(checkingLog).toBeDefined();
        expect(checkingLog).toContain("https://example.com/path");
        expect(checkingLog).not.toContain("token=secret");
        expect(checkingLog).not.toContain("user:pass");
        expect(checkingLog).not.toContain("#frag");
    });
});
