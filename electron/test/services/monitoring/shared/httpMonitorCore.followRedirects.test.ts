/**
 * Follow-redirects behavior tests for the shared HTTP monitor core.
 *
 * @remarks
 * Historically the monitoring HTTP client always followed redirects up to the
 * global Axios default. The UI/shared config exposes a `followRedirects` flag,
 * but the backend did not respect it. These tests ensure per-monitor settings
 * are enforced at the trust boundary.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Monitor } from "@shared/types";

import { HttpMonitor } from "../../../../services/monitoring/HttpMonitor";

const mockAxiosInstance = {
    get: vi.fn(),
};

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
    isDev: () => false,
}));

describe("httpMonitorCore followRedirects", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockAxiosInstance.get.mockResolvedValue({
            config: {},
            data: "ok",
            status: 301,
        });
    });

    it("disables redirects when followRedirects is false", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: httpMonitorCore", "component");
        await annotate("Category: Monitoring", "category");
        await annotate("Type: Redirect Handling", "type");

        const monitor: Monitor = {
            checkInterval: 5000,
            followRedirects: false,
            history: [],
            id: "m1",
            monitoring: true,
            responseTime: -1,
            retryAttempts: 0,
            status: "pending",
            timeout: 1000,
            type: "http",
            url: "https://example.com",
        };

        const service = new HttpMonitor({ timeout: 1000 });
        await service.check(monitor);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
            "https://example.com",
            expect.objectContaining({
                maxRedirects: 0,
                responseType: "stream",
                timeout: 1000,
            })
        );
    });

    it("uses the default redirect policy when followRedirects is true/undefined", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: httpMonitorCore", "component");
        await annotate("Category: Monitoring", "category");
        await annotate("Type: Redirect Handling", "type");

        const monitor: Monitor = {
            checkInterval: 5000,
            history: [],
            id: "m2",
            monitoring: true,
            responseTime: -1,
            retryAttempts: 0,
            status: "pending",
            timeout: 1000,
            type: "http",
            url: "https://example.com",
        };

        const service = new HttpMonitor({ timeout: 1000 });
        await service.check(monitor);

        const call = mockAxiosInstance.get.mock.calls[0];
        expect(call).toBeDefined();
        const requestConfig = call?.[1] as Record<string, unknown>;

        expect(requestConfig).toBeDefined();
        expect(requestConfig["responseType"]).toBe("stream");
        expect(Object.hasOwn(requestConfig, "maxRedirects")).toBeFalsy();
    });
});
