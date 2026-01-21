import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
    MonitoringStartSummary,
    MonitoringStopSummary,
    StatusUpdate,
} from "@shared/types";

const monitoringApi = vi.hoisted(() => ({
    checkSiteNow:
        vi.fn<
            (
                siteIdentifier: string,
                monitorId: string
            ) => Promise<StatusUpdate | undefined>
        >(),
    startMonitoring: vi.fn<() => Promise<MonitoringStartSummary>>(),
    startMonitoringForMonitor:
        vi.fn<
            (siteIdentifier: string, monitorId: string) => Promise<boolean>
        >(),
    startMonitoringForSite:
        vi.fn<(siteIdentifier: string) => Promise<boolean>>(),
    stopMonitoring: vi.fn<() => Promise<MonitoringStopSummary>>(),
    stopMonitoringForMonitor:
        vi.fn<
            (siteIdentifier: string, monitorId: string) => Promise<boolean>
        >(),
    stopMonitoringForSite:
        vi.fn<(siteIdentifier: string) => Promise<boolean>>(),
}));

const ensureInitializedMock = vi.hoisted(() => vi.fn(async () => undefined));

const wrapMock = vi.hoisted(() =>
    vi.fn(
        <TResult, TArgs extends unknown[]>(
            _method: string,
            handler: (
                api: { monitoring: typeof monitoringApi },
                ...args: TArgs
            ) => Promise<TResult>
        ) =>
            async (...args: TArgs): Promise<TResult> =>
                handler({ monitoring: monitoringApi }, ...args)
    )
);

const getHelpersMock = vi.hoisted(() =>
    vi.fn(() => ({
        ensureInitialized: ensureInitializedMock,
        wrap: wrapMock,
    }))
);

vi.mock("../../services/utils/createIpcServiceHelpers", () => ({
    getIpcServiceHelpers: getHelpersMock,
}));

const loggerMock = vi.hoisted(() => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
}));
vi.mock("../../services/logger", () => ({
    logger: loggerMock,
}));

const ensureErrorMock = vi.hoisted(() => vi.fn((error: unknown) => error));
vi.mock("@shared/utils/errorHandling", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("@shared/utils/errorHandling")>();

    return {
        ...actual,
        ensureError: ensureErrorMock,
    };
});

import { MonitoringService } from "../../services/MonitoringService";

describe("MonitoringService edge cases", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        for (const fn of Object.values(monitoringApi)) fn.mockReset();
    });

    it("initializes through ensureInitialized", async () => {
        await MonitoringService.initialize();
        expect(ensureInitializedMock).toHaveBeenCalledTimes(1);
    });

    it("logs partial failures while allowing monitoring to continue", async () => {
        const summary: MonitoringStartSummary = {
            alreadyActive: false,
            attempted: 3,
            failed: 1,
            isMonitoring: true,
            partialFailures: true,
            siteCount: 2,
            skipped: 1,
            succeeded: 2,
        };
        monitoringApi.startMonitoring.mockResolvedValueOnce(summary);

        const result = await MonitoringService.startMonitoring();

        expect(result).toStrictEqual(summary);
        expect(loggerMock.warn).toHaveBeenCalledWith(
            "[MonitoringService] Global monitoring start completed with partial failures",
            summary
        );
        expect(loggerMock.error).not.toHaveBeenCalled();
    });

    it("throws enriched error when startMonitoring fails", async () => {
        const failureSummary: MonitoringStartSummary = {
            alreadyActive: false,
            attempted: 4,
            failed: 3,
            isMonitoring: false,
            partialFailures: false,
            siteCount: 4,
            skipped: 0,
            succeeded: 1,
        };
        monitoringApi.startMonitoring.mockResolvedValueOnce(failureSummary);

        await expect(MonitoringService.startMonitoring()).rejects.toMatchObject(
            {
                code: "RENDERER_SERVICE_BACKEND_OPERATION_FAILED",
                details: expect.objectContaining({
                    summary: failureSummary,
                }),
                message:
                    "[MonitoringService] Failed to start monitoring across all sites: 1/4 monitors activated.",
            }
        );

        expect(loggerMock.error).toHaveBeenCalledWith(
            "[MonitoringService] Global monitoring start failed",
            failureSummary
        );
    });

    it("throws when startMonitoringForMonitor reports backend failure", async () => {
        monitoringApi.startMonitoringForMonitor.mockResolvedValueOnce(false);

        await expect(
            MonitoringService.startMonitoringForMonitor("site-x", "monitor-y")
        ).rejects.toMatchObject({
            code: "RENDERER_SERVICE_BACKEND_OPERATION_FAILED",
            details: expect.objectContaining({
                monitorId: "monitor-y",
                siteIdentifier: "site-x",
            }),
            message:
                "[MonitoringService] Failed to start monitoring for monitor monitor-y of site site-x: backend returned false",
        });
    });

    it("throws when startMonitoringForSite reports backend failure", async () => {
        monitoringApi.startMonitoringForSite.mockResolvedValueOnce(false);

        await expect(
            MonitoringService.startMonitoringForSite("site-z")
        ).rejects.toMatchObject({
            code: "RENDERER_SERVICE_BACKEND_OPERATION_FAILED",
            details: expect.objectContaining({
                siteIdentifier: "site-z",
            }),
            message:
                "[MonitoringService] Failed to start monitoring for site site-z: backend returned false",
        });
    });

    it("warns about partial failures during stopMonitoring", async () => {
        const summary: MonitoringStopSummary = {
            alreadyInactive: false,
            attempted: 5,
            failed: 1,
            isMonitoring: false,
            partialFailures: true,
            siteCount: 5,
            skipped: 0,
            succeeded: 4,
        };
        monitoringApi.stopMonitoring.mockResolvedValueOnce(summary);

        const result = await MonitoringService.stopMonitoring();

        expect(result).toStrictEqual(summary);
        expect(loggerMock.warn).toHaveBeenCalledWith(
            "[MonitoringService] Global monitoring stop completed with partial failures",
            summary
        );
    });

    it("throws when stopMonitoring leaves monitors running", async () => {
        const failureSummary: MonitoringStopSummary = {
            alreadyInactive: false,
            attempted: 3,
            failed: 1,
            isMonitoring: true,
            partialFailures: false,
            siteCount: 3,
            skipped: 0,
            succeeded: 2,
        };
        monitoringApi.stopMonitoring.mockResolvedValueOnce(failureSummary);

        await expect(MonitoringService.stopMonitoring()).rejects.toMatchObject({
            code: "RENDERER_SERVICE_BACKEND_OPERATION_FAILED",
            details: expect.objectContaining({
                summary: failureSummary,
            }),
            message:
                "[MonitoringService] Failed to stop monitoring across all sites: 1/3 monitors remained active.",
        });

        expect(loggerMock.error).toHaveBeenCalledWith(
            "[MonitoringService] Global monitoring stop failed",
            failureSummary
        );
    });

    it("throws when stopMonitoringForMonitor reports backend failure", async () => {
        monitoringApi.stopMonitoringForMonitor.mockResolvedValueOnce(false);

        await expect(
            MonitoringService.stopMonitoringForMonitor(
                "site-err",
                "monitor-err"
            )
        ).rejects.toMatchObject({
            code: "RENDERER_SERVICE_BACKEND_OPERATION_FAILED",
            details: expect.objectContaining({
                monitorId: "monitor-err",
                siteIdentifier: "site-err",
            }),
            message:
                "[MonitoringService] Failed to stop monitoring for monitor monitor-err of site site-err: backend returned false",
        });
    });

    it("throws when stopMonitoringForSite reports backend failure", async () => {
        monitoringApi.stopMonitoringForSite.mockResolvedValueOnce(false);

        await expect(
            MonitoringService.stopMonitoringForSite("site-stop")
        ).rejects.toMatchObject({
            code: "RENDERER_SERVICE_BACKEND_OPERATION_FAILED",
            details: expect.objectContaining({
                siteIdentifier: "site-stop",
            }),
            message:
                "[MonitoringService] Failed to stop monitoring for site site-stop: backend returned false",
        });
    });
});
