import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import type { Site, StatusUpdate } from "@shared/types";
import type { StatusUpdateSnapshotPayload } from "../../../stores/sites/utils/statusUpdateHandler";

import {
    createSiteMonitoringActions,
    type SiteMonitoringDependencies,
} from "../../../stores/sites/useSiteMonitoring";

const ensureErrorMock = vi.hoisted(() =>
    vi.fn((error: unknown) =>
        error instanceof Error ? error : new Error(String(error))));

vi.mock("@shared/utils/errorHandling", () => ({
    ensureError: ensureErrorMock,
    withErrorHandling: vi.fn(
        async (operation: () => Promise<void>) => await operation()
    ),
}));

const logStoreActionMock = vi.hoisted(() => vi.fn());
vi.mock("../../../stores/utils", () => ({
    logStoreAction: logStoreActionMock,
}));

const loggerMock = vi.hoisted(() => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
}));
vi.mock("../../../services/logger", () => ({
    logger: loggerMock,
}));

interface MonitoringServiceMock {
    checkSiteNow: ReturnType<
        typeof vi.fn<
            (
                siteIdentifier: string,
                monitorId: string
            ) => Promise<StatusUpdate | undefined>
        >
    >;
    startMonitoringForMonitor: ReturnType<typeof vi.fn>;
    startMonitoringForSite: ReturnType<typeof vi.fn>;
    stopMonitoringForMonitor: ReturnType<typeof vi.fn>;
    stopMonitoringForSite: ReturnType<typeof vi.fn>;
}

const createMonitoringService = (): MonitoringServiceMock &
    SiteMonitoringDependencies["monitoringService"] => {
    const service: MonitoringServiceMock = {
        checkSiteNow: vi.fn(
            async (): Promise<StatusUpdate | undefined> => undefined
        ),
        startMonitoringForMonitor: vi.fn(async () => undefined),
        startMonitoringForSite: vi.fn(async () => undefined),
        stopMonitoringForMonitor: vi.fn(async () => undefined),
        stopMonitoringForSite: vi.fn(async () => undefined),
    };

    return service as MonitoringServiceMock &
        SiteMonitoringDependencies["monitoringService"];
};

describe("useSiteMonitoring edge cases", () => {
    let monitoringService: ReturnType<typeof createMonitoringService>;
    let getSites: Mock<() => Site[]>;
    let setSites: Mock<(sites: Site[]) => void>;
    let applyStatusUpdate: Mock<
        (sites: Site[], update: StatusUpdateSnapshotPayload) => Site[]
    >;

    beforeEach(() => {
        vi.clearAllMocks();
        monitoringService = createMonitoringService();
        getSites = vi.fn(() => []);
        setSites = vi.fn();
        applyStatusUpdate = vi.fn((sites: Site[]) => sites);
    });

    it("propagates monitoring errors with normalized context", async () => {
        const actions = createSiteMonitoringActions({
            applyStatusUpdate,
            getSites,
            monitoringService,
            setSites,
        });
        const failure = new Error("manual check failed");
        monitoringService.checkSiteNow.mockRejectedValueOnce(failure);

        await expect(
            actions.checkSiteNow("site-edge", "monitor-edge")
        ).rejects.toThrowError(failure);

        expect(ensureErrorMock).toHaveBeenCalledWith(failure);
        expect(logStoreActionMock).toHaveBeenCalledWith(
            "SitesStore",
            "checkSiteNow",
            expect.objectContaining({
                monitorId: "monitor-edge",
                siteIdentifier: "site-edge",
                status: "failure",
                success: false,
            })
        );
        expect(setSites).not.toHaveBeenCalled();
    });

    it("logs errors produced by optimistic update handling", async () => {
        const site: Site = {
            identifier: "site-edge",
            monitoring: true,
            monitors: [],
            name: "Edge Site",
        };

        const statusUpdate: StatusUpdate = {
            details: "Optimistic result",
            monitor: {
                activeOperations: [],
                checkInterval: 60_000,
                history: [],
                id: "monitor-opt",
                monitoring: true,
                responseTime: 0,
                retryAttempts: 0,
                status: "pending",
                timeout: 10_000,
                type: "http",
                url: "https://example.com",
            },
            monitorId: "monitor-opt",
            previousStatus: "down",
            site,
            siteIdentifier: site.identifier,
            status: "up",
            timestamp: new Date().toISOString(),
        };

        const optimisticFailure = new Error("apply failed");
        getSites.mockReturnValueOnce([site]);
        applyStatusUpdate.mockImplementation(() => {
            throw optimisticFailure;
        });
        monitoringService.checkSiteNow.mockResolvedValueOnce(statusUpdate);

        const actions = createSiteMonitoringActions({
            applyStatusUpdate,
            getSites,
            monitoringService,
            setSites,
        });

        await actions.checkSiteNow(site.identifier, "monitor-opt");

        expect(ensureErrorMock).toHaveBeenCalledWith(optimisticFailure);
        expect(loggerMock.error).toHaveBeenCalledWith(
            "[SitesStore] Failed applying optimistic manual check result",
            optimisticFailure
        );
        expect(setSites).not.toHaveBeenCalled();
    });

    it("applies optimistic monitoring updates for site-wide operations", async () => {
        vi.useFakeTimers();
        try {
            const site: Site = {
                identifier: "site-optimistic",
                monitoring: false,
                monitors: [
                    {
                        activeOperations: [],
                        checkInterval: 60_000,
                        history: [],
                        id: "monitor-one",
                        monitoring: false,
                        responseTime: 0,
                        retryAttempts: 0,
                        status: "up",
                        timeout: 10_000,
                        type: "http",
                        url: "https://example.com",
                    },
                    {
                        activeOperations: [],
                        checkInterval: 60_000,
                        history: [],
                        id: "monitor-two",
                        monitoring: false,
                        responseTime: 0,
                        retryAttempts: 0,
                        status: "up",
                        timeout: 10_000,
                        type: "http",
                        url: "https://status.example.com",
                    },
                ],
                name: "Optimistic Site",
            } satisfies Site;

            let currentSites: Site[] = [structuredClone(site)];
            const getSites = vi.fn(() => currentSites);
            const setSites = vi.fn((sites: Site[]) => {
                currentSites = sites;
            });
            const registerMonitoringLock = vi.fn();
            const clearOptimisticMonitoringLocks = vi.fn();

            monitoringService.startMonitoringForSite.mockResolvedValueOnce(
                undefined
            );

            const actions = createSiteMonitoringActions({
                applyStatusUpdate,
                clearOptimisticMonitoringLocks,
                getSites,
                monitoringService,
                registerMonitoringLock,
                setSites,
            });

            const pending = actions.startSiteMonitoring(site.identifier);
            await vi.advanceTimersByTimeAsync(75);

            expect(setSites).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        identifier: site.identifier,
                        monitors: expect.arrayContaining([
                            expect.objectContaining({
                                id: "monitor-one",
                                monitoring: true,
                            }),
                            expect.objectContaining({
                                id: "monitor-two",
                                monitoring: true,
                            }),
                        ]),
                    }),
                ])
            );

            await pending;

            expect(registerMonitoringLock).toHaveBeenCalledWith(
                site.identifier,
                expect.arrayContaining(["monitor-one", "monitor-two"]),
                true,
                expect.any(Number)
            );
            expect(clearOptimisticMonitoringLocks).not.toHaveBeenCalled();
        } finally {
            vi.useRealTimers();
        }
    });

    it("reverts optimistic updates and clears locks when the service fails", async () => {
        vi.useFakeTimers();
        try {
            const site: Site = {
                identifier: "site-revert",
                monitoring: true,
                monitors: [
                    {
                        activeOperations: [],
                        checkInterval: 60_000,
                        history: [],
                        id: "monitor-revert",
                        monitoring: true,
                        responseTime: 0,
                        retryAttempts: 0,
                        status: "up",
                        timeout: 10_000,
                        type: "http",
                        url: "https://monitor.example.com",
                    },
                ],
                name: "Revert Site",
            } satisfies Site;

            let currentSites: Site[] = [structuredClone(site)];
            const getSites = vi.fn(() => currentSites);
            const setSites = vi.fn((sites: Site[]) => {
                currentSites = sites;
            });
            const registerMonitoringLock = vi.fn();
            const clearOptimisticMonitoringLocks = vi.fn();

            const failure = new Error("stop failed");
            monitoringService.stopMonitoringForMonitor.mockRejectedValueOnce(
                failure
            );

            const actions = createSiteMonitoringActions({
                applyStatusUpdate,
                clearOptimisticMonitoringLocks,
                getSites,
                monitoringService,
                registerMonitoringLock,
                setSites,
            });

            const pending = actions.stopSiteMonitorMonitoring(
                site.identifier,
                "monitor-revert"
            );

            await vi.advanceTimersByTimeAsync(75);

            await expect(pending).rejects.toThrowError(failure);

            expect(registerMonitoringLock).toHaveBeenCalledWith(
                site.identifier,
                ["monitor-revert"],
                false,
                expect.any(Number)
            );
            expect(clearOptimisticMonitoringLocks).toHaveBeenCalledWith(
                site.identifier,
                ["monitor-revert"]
            );
            expect(setSites).toHaveBeenCalledTimes(2);
            expect(
                currentSites[0]?.monitors.find(
                    (monitor) => monitor.id === "monitor-revert"
                )?.monitoring
            ).toBeTruthy();
        } finally {
            vi.useRealTimers();
        }
    });

    it("applies optimistic updates for individual monitor operations", async () => {
        vi.useFakeTimers();
        try {
            const site: Site = {
                identifier: "site-individual",
                monitoring: true,
                monitors: [
                    {
                        activeOperations: [],
                        checkInterval: 60_000,
                        history: [],
                        id: "monitor-individual",
                        monitoring: true,
                        responseTime: 0,
                        retryAttempts: 0,
                        status: "up",
                        timeout: 10_000,
                        type: "http",
                        url: "https://monitor.example.com",
                    },
                ],
                name: "Individual Monitor",
            } satisfies Site;

            let currentSites: Site[] = [structuredClone(site)];
            const getSites = vi.fn(() => currentSites);
            const setSites = vi.fn((sites: Site[]) => {
                currentSites = sites;
            });

            const registerMonitoringLock = vi.fn();

            monitoringService.stopMonitoringForMonitor.mockResolvedValueOnce(
                undefined
            );

            const actions = createSiteMonitoringActions({
                applyStatusUpdate,
                getSites,
                monitoringService,
                registerMonitoringLock,
                setSites,
            });

            const pending = actions.stopSiteMonitorMonitoring(
                site.identifier,
                "monitor-individual"
            );

            await vi.advanceTimersByTimeAsync(75);
            await pending;

            expect(
                currentSites[0]?.monitors.find(
                    (monitor) => monitor.id === "monitor-individual"
                )?.monitoring
            ).toBeFalsy();
            expect(registerMonitoringLock).toHaveBeenCalledWith(
                site.identifier,
                ["monitor-individual"],
                false,
                expect.any(Number)
            );
        } finally {
            vi.useRealTimers();
        }
    });
});
