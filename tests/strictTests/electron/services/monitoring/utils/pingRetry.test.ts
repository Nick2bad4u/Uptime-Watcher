/**
 * Integration-focused unit tests for the retry-enabled ping utilities.
 *
 * These tests deliberately exercise both the single-attempt connectivity helper
 * and the retry wrapper to ensure the surrounding orchestration logic is fully
 * covered without hitting real network resources.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const MOCK_RESULT = Object.freeze({
    details: "Connectivity established",
    responseTime: 42,
    status: "up" as const,
});

const MOCK_ERROR = new Error("boom");

describe("pingRetry utilities", () => {
    beforeEach(async () => {
        vi.resetModules();
        vi.clearAllMocks();

        vi.doMock("../../../../../../electron/constants", () => ({
            RETRY_BACKOFF: Object.freeze({
                INITIAL_DELAY: 50,
            }),
        }));

        vi.doMock("../../../../../../electron/electronUtils", () => ({
            isDev: vi.fn(() => false),
        }));

        vi.doMock("../../../../../../electron/utils/logger", () => ({
            logger: {
                debug: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
                error: vi.fn(),
            },
        }));

        vi.doMock("../../../../../../electron/utils/operationalHooks", () => ({
            withOperationalHooks: vi.fn(async (operation: () => Promise<unknown>) => operation()),
        }));

        vi.doMock("../../../../../../electron/services/monitoring/utils/nativeConnectivity", () => ({
            checkConnectivity: vi.fn(() => Promise.resolve(MOCK_RESULT)),
            checkHttpConnectivity: vi.fn(() => Promise.resolve(MOCK_RESULT)),
        }));

        vi.doMock("../../../../../../electron/services/monitoring/utils/pingErrorHandling", () => ({
            handlePingCheckError: vi.fn((error: unknown, context: unknown) => ({
                error,
                context,
                status: "down" as const,
            })),
        }));
    });

    it("routes HTTP URLs through checkHttpConnectivity", async () => {
        const module = await import("../../../../../../electron/services/monitoring/utils/pingRetry");
        const { performSinglePingCheck } = module;

        const result = await performSinglePingCheck("https://api.example.com", 1000);

        const connectivity = vi.mocked(
            await import("../../../../../../electron/services/monitoring/utils/nativeConnectivity")
        );

        expect(connectivity.checkHttpConnectivity).toHaveBeenCalledTimes(1);
        expect(connectivity.checkHttpConnectivity).toHaveBeenCalledWith("https://api.example.com", 1000);
        expect(connectivity.checkConnectivity).not.toHaveBeenCalled();
        expect(result).toEqual(MOCK_RESULT);
    });

    it("routes non-HTTP hosts through checkConnectivity", async () => {
        const module = await import("../../../../../../electron/services/monitoring/utils/pingRetry");
        const { performSinglePingCheck } = module;

        const result = await performSinglePingCheck("example.com", 2500);

        const connectivity = vi.mocked(
            await import("../../../../../../electron/services/monitoring/utils/nativeConnectivity")
        );

        expect(connectivity.checkConnectivity).toHaveBeenCalledWith("example.com", {
            retries: 0,
            timeout: 2500,
        });
        expect(connectivity.checkHttpConnectivity).not.toHaveBeenCalled();
        expect(result).toEqual(MOCK_RESULT);
    });

    it("wraps connectivity failures with a descriptive error", async () => {
        const connectivity = vi.mocked(
            await import("../../../../../../electron/services/monitoring/utils/nativeConnectivity")
        );
        connectivity.checkConnectivity.mockRejectedValueOnce(MOCK_ERROR);

        const module = await import("../../../../../../electron/services/monitoring/utils/pingRetry");
        const { performSinglePingCheck } = module;

        await expect(performSinglePingCheck("unlucky", 10)).rejects.toThrowError(
            /Connectivity check failed: boom/
        );
    });

    it("delegates retry orchestration to withOperationalHooks", async () => {
        const hooks = vi.mocked(
            await import("../../../../../../electron/utils/operationalHooks")
        );
        const connectivity = vi.mocked(
            await import("../../../../../../electron/services/monitoring/utils/nativeConnectivity")
        );
        const module = await import("../../../../../../electron/services/monitoring/utils/pingRetry");
        const { performPingCheckWithRetry } = module;

        connectivity.checkConnectivity.mockImplementationOnce(async () => ({
            ...MOCK_RESULT,
            responseTime: 99,
        }));

        const outcome = await performPingCheckWithRetry("example.org", 3000, 2);

        expect(hooks.withOperationalHooks).toHaveBeenCalledTimes(1);
        expect(hooks.withOperationalHooks).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({
                initialDelay: 50,
                maxRetries: 2,
                operationName: "connectivity-check",
            })
        );
        expect(outcome).toEqual({
            ...MOCK_RESULT,
            responseTime: 99,
        });
    });

    it("logs debug details in development mode", async () => {
        const { isDev } = vi.mocked(
            await import("../../../../../../electron/electronUtils")
        );
        const { logger } = await import("../../../../../../electron/utils/logger");
        isDev.mockReturnValueOnce(true);

        const module = await import("../../../../../../electron/services/monitoring/utils/pingRetry");
        const { performPingCheckWithRetry } = module;

        await performPingCheckWithRetry("dev.example", 500, 1);

        expect(logger.debug).toHaveBeenCalledWith("Starting connectivity check with retry", {
            host: "dev.example",
            maxRetries: 1,
            timeout: 500,
        });
    });

    it("returns standardized failures when operational hooks throw", async () => {
        const hooks = vi.mocked(
            await import("../../../../../../electron/utils/operationalHooks")
        );
        const errorHandling = await import(
            "../../../../../../electron/services/monitoring/utils/pingErrorHandling"
        );
        hooks.withOperationalHooks.mockRejectedValueOnce(MOCK_ERROR);

        const module = await import("../../../../../../electron/services/monitoring/utils/pingRetry");
        const { performPingCheckWithRetry } = module;

        const outcome = await performPingCheckWithRetry("faulty.example", 750, 3);

        expect(errorHandling.handlePingCheckError).toHaveBeenCalledWith(MOCK_ERROR, {
            host: "faulty.example",
            maxRetries: 3,
            timeout: 750,
        });
        expect(outcome).toEqual({
            context: {
                host: "faulty.example",
                maxRetries: 3,
                timeout: 750,
            },
            error: MOCK_ERROR,
            status: "down",
        });
    });
});
