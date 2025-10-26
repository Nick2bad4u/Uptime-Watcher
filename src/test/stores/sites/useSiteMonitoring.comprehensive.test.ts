/**
 * Comprehensive tests for site monitoring operations. Tests all monitoring
 * lifecycle operations for sites and monitors.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

import { createSiteMonitoringActions } from "../../../stores/sites/useSiteMonitoring";
import type { Site, StatusUpdate } from "@shared/types";

// Mock electron API
const mockElectronAPI = {
    monitoring: {
        checkSiteNow: vi.fn().mockResolvedValue(undefined),
        startMonitoringForMonitor: vi.fn().mockResolvedValue(true),
        startMonitoringForSite: vi.fn().mockResolvedValue(true),
        stopMonitoringForMonitor: vi.fn().mockResolvedValue(true),
        stopMonitoringForSite: vi.fn().mockResolvedValue(true),
    },
    sites: {},
};

Object.defineProperty(globalThis, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

// Mock error store
vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: {
        getState: vi.fn(() => ({
            clearStoreError: vi.fn(),
            setStoreError: vi.fn(),
            setOperationLoading: vi.fn(),
        })),
    },
}));

// Mock store utils
vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
    withErrorHandling: vi.fn(async (fn) => await fn()),
    waitForElectronAPI: vi.fn().mockResolvedValue(true),
}));

describe("useSiteMonitoring", () => {
    let actions: ReturnType<typeof createSiteMonitoringActions>;
    let currentSites: Site[];
    let mockGetSites: ReturnType<typeof vi.fn>;
    let mockSetSites: ReturnType<typeof vi.fn>;
    let mockApplyStatusUpdate: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        currentSites = [];
        mockGetSites = vi.fn(() => currentSites);
        mockSetSites = vi.fn((sites: Site[]) => {
            currentSites = sites;
        });
        mockApplyStatusUpdate = vi.fn(() => currentSites);
        const monitoringService = {
            checkSiteNow: vi.fn(
                async (siteIdentifier: string, monitorId: string) =>
                    mockElectronAPI.monitoring.checkSiteNow(
                        siteIdentifier,
                        monitorId
                    )
            ),
            startMonitoringForMonitor: vi.fn(
                async (siteIdentifier: string, monitorId: string) =>
                    mockElectronAPI.monitoring.startMonitoringForMonitor(
                        siteIdentifier,
                        monitorId
                    )
            ),
            startMonitoringForSite: vi.fn(async (siteIdentifier: string) =>
                mockElectronAPI.monitoring.startMonitoringForSite(
                    siteIdentifier
                )
            ),
            stopMonitoringForMonitor: vi.fn(
                async (siteIdentifier: string, monitorId: string) =>
                    mockElectronAPI.monitoring.stopMonitoringForMonitor(
                        siteIdentifier,
                        monitorId
                    )
            ),
            stopMonitoringForSite: vi.fn(async (siteIdentifier: string) =>
                mockElectronAPI.monitoring.stopMonitoringForSite(siteIdentifier)
            ),
        };

        actions = createSiteMonitoringActions({
            monitoringService,
            getSites: mockGetSites,
            setSites: mockSetSites,
            applyStatusUpdate: mockApplyStatusUpdate,
        });
    });

    describe("checkSiteNow", () => {
        it("should trigger manual check for site monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitoring", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const siteIdentifier = "site-1";
            const monitorId = "monitor-1";

            await actions.checkSiteNow(siteIdentifier, monitorId);

            expect(
                mockElectronAPI.monitoring.checkSiteNow
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
            expect(mockApplyStatusUpdate).not.toHaveBeenCalled();
            expect(mockSetSites).not.toHaveBeenCalled();
        });
    });

    it("should apply optimistic update when status update is returned", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useSiteMonitoring", "component");
        await annotate("Category: Store", "category");
        await annotate("Type: Monitoring", "type");

        const site: Site = {
            identifier: "site-1",
            monitoring: true,
            monitors: [
                {
                    activeOperations: [],
                    checkInterval: 60_000,
                    history: [],
                    id: "monitor-1",
                    monitoring: true,
                    responseTime: 1_200,
                    retryAttempts: 0,
                    status: "down",
                    timeout: 30_000,
                    type: "http",
                    url: "https://example.com",
                },
            ],
            name: "Example Site",
        };

        const statusUpdate: StatusUpdate = {
            details: "Manual check successful",
            monitor: site.monitors[0],
            monitorId: site.monitors[0].id,
            previousStatus: "down",
            responseTime: 456,
            site,
            siteIdentifier: site.identifier,
            status: "up",
            timestamp: new Date().toISOString(),
        };

        const updatedSites: Site[] = [
            {
                ...site,
                monitors: [
                    {
                        ...site.monitors[0],
                        status: "up",
                        responseTime: statusUpdate.responseTime ?? 0,
                    },
                ],
            },
        ];

        currentSites = [site];
        mockApplyStatusUpdate.mockReturnValue(updatedSites);
        mockElectronAPI.monitoring.checkSiteNow.mockResolvedValueOnce(
            statusUpdate
        );

        await actions.checkSiteNow(site.identifier, site.monitors[0].id);

        expect(mockApplyStatusUpdate).toHaveBeenCalledWith(
            [site],
            statusUpdate
        );
        expect(mockSetSites).toHaveBeenCalledWith(updatedSites);
    });

    describe("startSiteMonitoring", () => {
        it("should start monitoring for all site monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitoring", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const siteIdentifier = "site-1";

            await actions.startSiteMonitoring(siteIdentifier);

            expect(
                mockElectronAPI.monitoring.startMonitoringForSite
            ).toHaveBeenCalledWith(siteIdentifier);
        });
    });

    describe("startSiteMonitorMonitoring", () => {
        it("should start monitoring for specific site monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitoring", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const siteIdentifier = "site-1";
            const monitorId = "monitor-1";

            await actions.startSiteMonitorMonitoring(siteIdentifier, monitorId);

            expect(
                mockElectronAPI.monitoring.startMonitoringForMonitor
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
        });
    });

    describe("stopSiteMonitoring", () => {
        it("should stop monitoring for all site monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitoring", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const siteIdentifier = "site-1";

            await actions.stopSiteMonitoring(siteIdentifier);

            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).toHaveBeenCalledWith(siteIdentifier);
        });
    });

    describe("stopSiteMonitorMonitoring", () => {
        it("should stop monitoring for specific site monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useSiteMonitoring", "component");
            await annotate("Category: Store", "category");
            await annotate("Type: Monitoring", "type");

            const siteIdentifier = "site-1";
            const monitorId = "monitor-1";

            await actions.stopSiteMonitorMonitoring(siteIdentifier, monitorId);

            expect(
                mockElectronAPI.monitoring.stopMonitoringForMonitor
            ).toHaveBeenCalledWith(siteIdentifier, monitorId);
        });
    });
});
