/**
 * Comprehensive tests for site monitoring operations.
 * Tests all monitoring lifecycle operations for sites and monitors.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

import { createSiteMonitoringActions } from "../../../stores/sites/useSiteMonitoring";

// Mock electron API
const mockElectronAPI = {
    sites: {
        checkSiteNow: vi.fn(),
    },
    monitoring: {
        startMonitoringForSite: vi.fn(),
        stopMonitoringForSite: vi.fn(),
    },
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
}));

describe("useSiteMonitoring", () => {
    let actions: ReturnType<typeof createSiteMonitoringActions>;

    beforeEach(() => {
        vi.clearAllMocks();
        actions = createSiteMonitoringActions();
    });

    describe("checkSiteNow", () => {
        it("should trigger manual check for site monitor", async () => {
            const siteId = "site-1";
            const monitorId = "monitor-1";

            await actions.checkSiteNow(siteId, monitorId);

            expect(mockElectronAPI.sites.checkSiteNow).toHaveBeenCalledWith(
                siteId,
                monitorId
            );
        });
    });

    describe("startSiteMonitoring", () => {
        it("should start monitoring for all site monitors", async () => {
            const siteId = "site-1";

            await actions.startSiteMonitoring(siteId);

            expect(
                mockElectronAPI.monitoring.startMonitoringForSite
            ).toHaveBeenCalledWith(siteId);
        });
    });

    describe("startSiteMonitorMonitoring", () => {
        it("should start monitoring for specific site monitor", async () => {
            const siteId = "site-1";
            const monitorId = "monitor-1";

            await actions.startSiteMonitorMonitoring(siteId, monitorId);

            expect(
                mockElectronAPI.monitoring.startMonitoringForSite
            ).toHaveBeenCalledWith(siteId, monitorId);
        });
    });

    describe("stopSiteMonitoring", () => {
        it("should stop monitoring for all site monitors", async () => {
            const siteId = "site-1";

            await actions.stopSiteMonitoring(siteId);

            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).toHaveBeenCalledWith(siteId);
        });
    });

    describe("stopSiteMonitorMonitoring", () => {
        it("should stop monitoring for specific site monitor", async () => {
            const siteId = "site-1";
            const monitorId = "monitor-1";

            await actions.stopSiteMonitorMonitoring(siteId, monitorId);

            expect(
                mockElectronAPI.monitoring.stopMonitoringForSite
            ).toHaveBeenCalledWith(siteId, monitorId);
        });
    });
});
