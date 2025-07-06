/**
 * @file useSiteMonitoring.test.ts
 * @description Test suite for useSiteMonitoring module
 * This module handles monitoring start/stop operations and manual checks.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSiteMonitoringActions, type SiteMonitoringDependencies } from "../../../stores/sites/useSiteMonitoring";

// Mock dependencies
vi.mock("../../../stores/sites/services", () => ({
    SiteService: {
        checkSiteNow: vi.fn(),
    },
    MonitoringService: {
        startMonitoring: vi.fn(),
        stopMonitoring: vi.fn(),
    },
}));

vi.mock("../../../stores/utils", () => ({
    logStoreAction: vi.fn(),
    withErrorHandling: vi.fn(
        async (
            fn: () => Promise<void>,
            store: { setError: (error: string) => void; setLoading: (loading: boolean) => void; clearError: () => void }
        ) => {
            try {
                return await fn();
            } catch (error) {
                store.setError(error instanceof Error ? error.message : String(error));
                // Don't rethrow in tests to allow testing error handling
                return undefined;
            }
        }
    ),
}));

// Import mocked services
import { SiteService, MonitoringService } from "../../../stores/sites/services";
import { logStoreAction } from "../../../stores/utils";

describe("useSiteMonitoring", () => {
    let mockDependencies: SiteMonitoringDependencies;
    let monitoringActions: ReturnType<typeof createSiteMonitoringActions>;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup mock dependencies
        mockDependencies = {
            syncSitesFromBackend: vi.fn(),
        };

        monitoringActions = createSiteMonitoringActions(mockDependencies);
    });

    describe("startSiteMonitorMonitoring", () => {
        it("should start monitoring for a site monitor", async () => {
            const siteId = "example.com";
            const monitorId = "monitor-1";

            vi.mocked(MonitoringService.startMonitoring).mockResolvedValue(undefined);

            await monitoringActions.startSiteMonitorMonitoring(siteId, monitorId);

            expect(MonitoringService.startMonitoring).toHaveBeenCalledWith(siteId, monitorId);
            expect(mockDependencies.syncSitesFromBackend).toHaveBeenCalledTimes(1);
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "startSiteMonitorMonitoring", {
                monitorId,
                siteId,
            });
        });

        it("should handle errors when starting monitoring", async () => {
            const siteId = "example.com";
            const monitorId = "monitor-1";
            const error = new Error("Start monitoring failed");

            vi.mocked(MonitoringService.startMonitoring).mockRejectedValue(error);

            // The withErrorHandling mock should allow the promise to resolve without throwing
            await expect(monitoringActions.startSiteMonitorMonitoring(siteId, monitorId)).resolves.toBeUndefined();

            expect(MonitoringService.startMonitoring).toHaveBeenCalledWith(siteId, monitorId);
            expect(mockDependencies.syncSitesFromBackend).not.toHaveBeenCalled();
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "startSiteMonitorMonitoring", {
                monitorId,
                siteId,
            });
        });
    });

    describe("stopSiteMonitorMonitoring", () => {
        it("should stop monitoring for a site monitor", async () => {
            const siteId = "example.com";
            const monitorId = "monitor-1";

            vi.mocked(MonitoringService.stopMonitoring).mockResolvedValue(undefined);

            await monitoringActions.stopSiteMonitorMonitoring(siteId, monitorId);

            expect(MonitoringService.stopMonitoring).toHaveBeenCalledWith(siteId, monitorId);
            expect(mockDependencies.syncSitesFromBackend).toHaveBeenCalledTimes(1);
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "stopSiteMonitorMonitoring", {
                monitorId,
                siteId,
            });
        });

        it("should handle errors when stopping monitoring", async () => {
            const siteId = "example.com";
            const monitorId = "monitor-1";
            const error = new Error("Stop monitoring failed");

            vi.mocked(MonitoringService.stopMonitoring).mockRejectedValue(error);

            // The withErrorHandling mock should allow the promise to resolve without throwing
            await expect(monitoringActions.stopSiteMonitorMonitoring(siteId, monitorId)).resolves.toBeUndefined();

            expect(MonitoringService.stopMonitoring).toHaveBeenCalledWith(siteId, monitorId);
            expect(mockDependencies.syncSitesFromBackend).not.toHaveBeenCalled();
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "stopSiteMonitorMonitoring", {
                monitorId,
                siteId,
            });
        });
    });

    describe("checkSiteNow", () => {
        it("should perform a manual check for a site", async () => {
            const siteId = "example.com";
            const monitorId = "monitor-1";

            vi.mocked(SiteService.checkSiteNow).mockResolvedValue(undefined);

            await monitoringActions.checkSiteNow(siteId, monitorId);

            expect(SiteService.checkSiteNow).toHaveBeenCalledWith(siteId, monitorId);
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "checkSiteNow", {
                monitorId,
                siteId,
            });
        });

        it("should handle errors when checking site manually", async () => {
            const siteId = "example.com";
            const monitorId = "monitor-1";
            const error = new Error("Manual check failed");

            vi.mocked(SiteService.checkSiteNow).mockRejectedValue(error);

            // The withErrorHandling mock should allow the promise to resolve without throwing
            await expect(monitoringActions.checkSiteNow(siteId, monitorId)).resolves.toBeUndefined();

            expect(SiteService.checkSiteNow).toHaveBeenCalledWith(siteId, monitorId);
            expect(logStoreAction).toHaveBeenCalledWith("SitesStore", "checkSiteNow", {
                monitorId,
                siteId,
            });
        });

        it("should not sync after manual check (backend emits status update)", async () => {
            const siteId = "example.com";
            const monitorId = "monitor-1";

            vi.mocked(SiteService.checkSiteNow).mockResolvedValue(undefined);

            await monitoringActions.checkSiteNow(siteId, monitorId);

            // Manual checks don't trigger sync as backend will emit 'status-update'
            expect(mockDependencies.syncSitesFromBackend).not.toHaveBeenCalled();
        });
    });

    describe("action logging", () => {
        it("should log all actions with correct parameters", async () => {
            const siteId = "test-site";
            const monitorId = "test-monitor";

            vi.mocked(MonitoringService.startMonitoring).mockResolvedValue(undefined);
            vi.mocked(MonitoringService.stopMonitoring).mockResolvedValue(undefined);
            vi.mocked(SiteService.checkSiteNow).mockResolvedValue(undefined);

            await monitoringActions.startSiteMonitorMonitoring(siteId, monitorId);
            await monitoringActions.stopSiteMonitorMonitoring(siteId, monitorId);
            await monitoringActions.checkSiteNow(siteId, monitorId);

            expect(logStoreAction).toHaveBeenCalledTimes(3);
            expect(logStoreAction).toHaveBeenNthCalledWith(1, "SitesStore", "startSiteMonitorMonitoring", {
                monitorId,
                siteId,
            });
            expect(logStoreAction).toHaveBeenNthCalledWith(2, "SitesStore", "stopSiteMonitorMonitoring", {
                monitorId,
                siteId,
            });
            expect(logStoreAction).toHaveBeenNthCalledWith(3, "SitesStore", "checkSiteNow", {
                monitorId,
                siteId,
            });
        });
    });

    describe("service integration", () => {
        it("should call MonitoringService for start/stop operations", async () => {
            const siteId = "example.com";
            const monitorId = "monitor-1";

            vi.mocked(MonitoringService.startMonitoring).mockResolvedValue(undefined);
            vi.mocked(MonitoringService.stopMonitoring).mockResolvedValue(undefined);

            await monitoringActions.startSiteMonitorMonitoring(siteId, monitorId);
            await monitoringActions.stopSiteMonitorMonitoring(siteId, monitorId);

            expect(MonitoringService.startMonitoring).toHaveBeenCalledWith(siteId, monitorId);
            expect(MonitoringService.stopMonitoring).toHaveBeenCalledWith(siteId, monitorId);
        });

        it("should call SiteService for manual checks", async () => {
            const siteId = "example.com";
            const monitorId = "monitor-1";

            vi.mocked(SiteService.checkSiteNow).mockResolvedValue(undefined);

            await monitoringActions.checkSiteNow(siteId, monitorId);

            expect(SiteService.checkSiteNow).toHaveBeenCalledWith(siteId, monitorId);
        });

        it("should sync after start/stop monitoring operations", async () => {
            const siteId = "example.com";
            const monitorId = "monitor-1";

            vi.mocked(MonitoringService.startMonitoring).mockResolvedValue(undefined);
            vi.mocked(MonitoringService.stopMonitoring).mockResolvedValue(undefined);

            await monitoringActions.startSiteMonitorMonitoring(siteId, monitorId);
            await monitoringActions.stopSiteMonitorMonitoring(siteId, monitorId);

            expect(mockDependencies.syncSitesFromBackend).toHaveBeenCalledTimes(2);
        });
    });
});
