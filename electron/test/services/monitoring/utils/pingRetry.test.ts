/**
 * Tests for pingRetry utilities.
 *
 * @remarks
 * These tests ensure that ping retry logic actually retries by throwing on
 * non-"up" results (withOperationalHooks only retries on exceptions) and that
 * AbortSignal is threaded through to the native connectivity helpers.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MonitorCheckResult } from "../../../../services/monitoring/types";

import {
    checkConnectivity,
    checkHttpConnectivity,
} from "../../../../services/monitoring/utils/nativeConnectivity";
import { handlePingCheckError } from "../../../../services/monitoring/utils/pingErrorHandling";
import { performPingCheckWithRetry } from "../../../../services/monitoring/utils/pingRetry";
import { withOperationalHooks } from "../../../../utils/operationalHooks";

// Mock dependencies before importing module under test
vi.mock("../../../../electronUtils", () => ({
    isDev: vi.fn(),
}));

vi.mock("../../../../utils/logger", () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock("../../../../utils/operationalHooks", () => ({
    withOperationalHooks: vi.fn(),
}));

vi.mock("../../../../services/monitoring/utils/nativeConnectivity", () => ({
    checkConnectivity: vi.fn(),
    checkHttpConnectivity: vi.fn(),
}));

vi.mock("../../../../services/monitoring/utils/pingErrorHandling", () => ({
    handlePingCheckError: vi.fn(),
}));

vi.mock("../../../../constants", () => ({
    RETRY_BACKOFF: {
        INITIAL_DELAY: 25,
        MAX_DELAY: 250,
    },
}));

const upResult: MonitorCheckResult = {
    details: "OK",
    responseTime: 10,
    status: "up",
};

const degradedResult: MonitorCheckResult = {
    details: "HTTP 404",
    responseTime: 10,
    status: "degraded",
};

const downResult: MonitorCheckResult = {
    details: "failed",
    error: "Network error",
    responseTime: 10,
    status: "down",
};

describe("pingRetry", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe(performPingCheckWithRetry, () => {
        it("threads AbortSignal into HTTP connectivity checks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: pingRetry", "component");
            await annotate("Category: Monitoring", "category");
            await annotate("Type: Cancellation", "type");

            const abortController = new AbortController();
            vi.mocked(checkHttpConnectivity).mockResolvedValueOnce(upResult);
            vi.mocked(withOperationalHooks).mockImplementationOnce(
                async (operation) => operation()
            );

            await expect(
                performPingCheckWithRetry(
                    "https://example.com/health",
                    1234,
                    0,
                    abortController.signal
                )
            ).resolves.toEqual(upResult);

            expect(checkHttpConnectivity).toHaveBeenCalledWith(
                "https://example.com/health",
                1234,
                abortController.signal
            );
        });

        it("threads AbortSignal into non-URL connectivity checks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: pingRetry", "component");
            await annotate("Category: Monitoring", "category");
            await annotate("Type: Cancellation", "type");

            const abortController = new AbortController();
            vi.mocked(checkConnectivity).mockResolvedValueOnce(upResult);
            vi.mocked(withOperationalHooks).mockImplementationOnce(
                async (operation) => operation()
            );

            await expect(
                performPingCheckWithRetry(
                    "example.com",
                    5000,
                    0,
                    abortController.signal
                )
            ).resolves.toEqual(upResult);

            expect(checkConnectivity).toHaveBeenCalledWith(
                "example.com",
                { retries: 0, timeout: 5000 },
                abortController.signal
            );
        });

        it("returns a standardized failure when connectivity is degraded", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: pingRetry", "component");
            await annotate("Category: Monitoring", "category");
            await annotate("Type: Retry", "type");

            vi.mocked(checkHttpConnectivity).mockResolvedValueOnce(
                degradedResult
            );
            vi.mocked(withOperationalHooks).mockImplementationOnce(
                async (operation) => operation()
            );
            vi.mocked(handlePingCheckError).mockReturnValueOnce(downResult);

            await expect(
                performPingCheckWithRetry("https://example.com", 1000, 0)
            ).resolves.toEqual(downResult);
            expect(handlePingCheckError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringMatching(/connectivity check failed/i),
                }),
                expect.objectContaining({
                    host: "https://example.com/",
                    maxRetries: 0,
                    timeout: 1000,
                })
            );
        });

        it("returns a standardized failure when connectivity is down", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: pingRetry", "component");
            await annotate("Category: Monitoring", "category");
            await annotate("Type: Retry", "type");

            vi.mocked(checkHttpConnectivity).mockResolvedValueOnce(downResult);
            vi.mocked(withOperationalHooks).mockImplementationOnce(
                async (operation) => operation()
            );
            vi.mocked(handlePingCheckError).mockReturnValueOnce(downResult);

            await expect(
                performPingCheckWithRetry("https://example.com", 1000, 0)
            ).resolves.toEqual(downResult);
            expect(handlePingCheckError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringMatching(/connectivity check failed/i),
                }),
                expect.objectContaining({
                    host: "https://example.com/",
                    maxRetries: 0,
                    timeout: 1000,
                })
            );
        });

        it("configures withOperationalHooks with total attempts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: pingRetry", "component");
            await annotate("Category: Monitoring", "category");
            await annotate("Type: Retry", "type");

            vi.mocked(withOperationalHooks).mockResolvedValueOnce(upResult);

            const signal = new AbortController().signal;
            await expect(
                performPingCheckWithRetry("example.com", 5000, 2, signal)
            ).resolves.toEqual(upResult);

            expect(withOperationalHooks).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    initialDelay: 25,
                    maxRetries: 3,
                    operationName: "connectivity-check",
                    signal,
                })
            );
        });
    });
});
