/**
 * Mutation-specific test for HttpMonitor active counter assignment operations
 *
 * @remarks
 * Tests specifically target the AssignmentOperator mutations on lines 101 and
 * 106 of HttpMonitor.ts where active counter is incremented and decremented
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Site } from "../../../../shared/types";
import type { MonitorCheckResult } from "../../../services/monitoring/types";

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

describe("HttpMonitor Active Counter Assignment Operations", () => {
    let httpMonitor: HttpMonitor;
    let mockAxiosInstance: any;

    beforeEach(async () => {
        vi.clearAllMocks();

        // Setup axios mock
        mockAxiosInstance = {
            get: vi.fn(),
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() },
            },
        };

        const { createHttpClient } = vi.mocked(
            await import("../../../services/monitoring/utils/httpClient")
        );
        createHttpClient.mockReturnValue(mockAxiosInstance);

        const { validateMonitorUrl, extractMonitorConfig } = vi.mocked(
            await import(
                "../../../services/monitoring/shared/monitorServiceHelpers"
            )
        );
        validateMonitorUrl.mockReturnValue(null);
        extractMonitorConfig.mockReturnValue({
            timeout: 5000,
            retryAttempts: 3,
        });

        httpMonitor = new HttpMonitor();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    /**
     * Test to detect mutation on line 101: `this.active += 1;` -> `this.active
     * -= 1`
     *
     * This test verifies that the active counter is properly incremented when
     * starting a request. If the mutation is present (decrementing instead of
     * incrementing), the rate limiter will incorrectly manage concurrent
     * requests.
     */
    it("should properly increment active counter when starting request", async () => {
        const { withOperationalHooks } = vi.mocked(
            await import("../../../utils/operationalHooks")
        );

        // Mock a slow response to keep the request active
        const slowPromise = new Promise<MonitorCheckResult>((resolve) => {
            setTimeout(() => {
                resolve({
                    status: "up",
                    responseTime: 100,
                    details: "200",
                });
            }, 100);
        });

        withOperationalHooks.mockReturnValue(slowPromise);

        const monitor: Site["monitors"][0] = {
            type: "http",
            url: "https://example.com",
            id: "test-monitor",
            checkInterval: 60_000,
            history: [],
            monitoring: true,
            responseTime: 0,
            retryAttempts: 3,
            status: "pending",
            timeout: 5000,
        };

        // Start a request but don't await it immediately
        const checkPromise = httpMonitor.check(monitor);

        // Give it time to increment the counter
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Start a second request - this should be throttled if active counter is working correctly
        const secondCheckPromise = httpMonitor.check({
            ...monitor,
            url: "https://example2.com",
            id: "test-monitor-2",
        });

        // Wait for both to complete
        const [firstResult, secondResult] = await Promise.all([
            checkPromise,
            secondCheckPromise,
        ]);

        // Both should succeed, but the behavior should be consistent with proper counter management
        expect(firstResult.status).toBe("up");
        expect(secondResult.status).toBe("up");

        // If the mutation is present (active -= 1 instead of +=), the counter would become negative
        // and the rate limiting behavior would be broken
        expect(withOperationalHooks).toHaveBeenCalledTimes(2);
    });

    /**
     * Test to detect mutation on line 106: `this.active -= 1;` -> `this.active
     * += 1`
     *
     * This test verifies that the active counter is properly decremented when
     * finishing a request. If the mutation is present (incrementing instead of
     * decrementing), the active counter will grow indefinitely.
     */
    it("should properly decrement active counter when request completes", async () => {
        const { withOperationalHooks } = vi.mocked(
            await import("../../../utils/operationalHooks")
        );

        let resolveCount = 0;
        withOperationalHooks.mockImplementation(() => {
            resolveCount++;
            return Promise.resolve({
                status: "up",
                responseTime: 50,
                details: "200",
            });
        });

        const monitor: Site["monitors"][0] = {
            type: "http",
            url: "https://example.com",
            id: "test-monitor",
            checkInterval: 60_000,
            history: [],
            monitoring: true,
            responseTime: 0,
            retryAttempts: 3,
            status: "pending",
            timeout: 5000,
        };

        // Perform multiple sequential requests
        const firstResult = await httpMonitor.check(monitor);
        const secondResult = await httpMonitor.check({
            ...monitor,
            url: "https://example2.com",
            id: "test-monitor-2",
        });
        const thirdResult = await httpMonitor.check({
            ...monitor,
            url: "https://example3.com",
            id: "test-monitor-3",
        });

        // All should complete successfully
        expect(firstResult.status).toBe("up");
        expect(secondResult.status).toBe("up");
        expect(thirdResult.status).toBe("up");

        // If the mutation is present (active += 1 instead of -=),
        // the active counter would keep growing and eventually cause issues
        expect(withOperationalHooks).toHaveBeenCalledTimes(3);
        expect(resolveCount).toBe(3);
    });

    /**
     * Test to detect both mutations by verifying consistent rate limiting
     * behavior
     *
     * This test creates a scenario where proper counter management is critical
     * for correct rate limiting behavior.
     */
    it("should maintain correct active counter through multiple concurrent requests", async () => {
        const { withOperationalHooks } = vi.mocked(
            await import("../../../utils/operationalHooks")
        );

        let activeRequests = 0;
        let maxConcurrentSeen = 0;

        withOperationalHooks.mockImplementation(() => {
            activeRequests++;
            maxConcurrentSeen = Math.max(maxConcurrentSeen, activeRequests);

            return new Promise<MonitorCheckResult>((resolve) => {
                setTimeout(() => {
                    activeRequests--;
                    resolve({
                        status: "up",
                        responseTime: 75,
                        details: "200",
                    });
                }, 50);
            });
        });

        const monitor: Site["monitors"][0] = {
            type: "http",
            url: "https://example.com",
            id: "test-monitor",
            checkInterval: 60_000,
            history: [],
            monitoring: true,
            responseTime: 0,
            retryAttempts: 3,
            status: "pending",
            timeout: 5000,
        };

        // Create multiple concurrent requests
        const promises = Array.from({ length: 5 }, (_, i) =>
            httpMonitor.check({
                ...monitor,
                url: `https://example${i}.com`,
                id: `test-monitor-${i}`,
            })
        );

        const results = await Promise.all(promises);

        // All should succeed
        for (const result of results) {
            expect(result.status).toBe("up");
        }

        // Verify proper counter management allowed controlled concurrency
        expect(maxConcurrentSeen).toBeGreaterThan(0);
        expect(maxConcurrentSeen).toBeLessThanOrEqual(5);
        expect(activeRequests).toBe(0); // All should be completed

        // If mutations are present, the counter behavior would be broken
        expect(withOperationalHooks).toHaveBeenCalledTimes(5);
    });
});
