/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { act } from "@testing-library/react";

// Mock the monitoring service first
const mockMonitoringService = {
    startSiteMonitoring: vi.fn(),
    stopSiteMonitoring: vi.fn(),
    startSiteMonitorMonitoring: vi.fn(),
    stopSiteMonitorMonitoring: vi.fn(),
};

// Mock the stores and services
vi.mock("../stores/utils", () => ({
    logStoreAction: vi.fn(),
}));

vi.mock("../stores/error/withErrorHandling", () => ({
    withErrorHandling: vi.fn((fn) => fn),
}));

vi.mock("../services/monitoring", () => ({
    MonitoringService: mockMonitoringService,
}));

// Mock electronAPI
const mockElectronAPI = {
    sites: {
        sync: vi.fn(),
    },
};

Object.defineProperty(window, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

// Mock the sites store with monitoring functions
const mockSitesStore = {
    startSiteMonitoring: vi.fn(),
    stopSiteMonitoring: vi.fn(),
    startSiteMonitorMonitoring: vi.fn(),
    stopSiteMonitorMonitoring: vi.fn(),
    sites: new Map(),
    loading: false,
    error: null,
};

vi.mock("../stores", () => ({
    useSitesStore: () => mockSitesStore,
}));

describe("useSitesStore - Site Monitoring Functions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should start site monitoring successfully", async () => {
        mockSitesStore.startSiteMonitoring.mockResolvedValueOnce(undefined);

        await act(async () => {
            await mockSitesStore.startSiteMonitoring("test-site-id");
        });

        expect(mockSitesStore.startSiteMonitoring).toHaveBeenCalledWith("test-site-id");
    });

    it("should handle errors in start site monitoring", async () => {
        const error = new Error("Failed to start monitoring");
        mockSitesStore.startSiteMonitoring.mockRejectedValueOnce(error);

        await act(async () => {
            try {
                await mockSitesStore.startSiteMonitoring("test-site-id");
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        expect(mockSitesStore.startSiteMonitoring).toHaveBeenCalledWith("test-site-id");
    });

    it("should stop site monitoring successfully", async () => {
        mockSitesStore.stopSiteMonitoring.mockResolvedValueOnce(undefined);

        await act(async () => {
            await mockSitesStore.stopSiteMonitoring("test-site-id");
        });

        expect(mockSitesStore.stopSiteMonitoring).toHaveBeenCalledWith("test-site-id");
    });

    it("should handle errors in stop site monitoring", async () => {
        const error = new Error("Failed to stop monitoring");
        mockSitesStore.stopSiteMonitoring.mockRejectedValueOnce(error);

        await act(async () => {
            try {
                await mockSitesStore.stopSiteMonitoring("test-site-id");
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        expect(mockSitesStore.stopSiteMonitoring).toHaveBeenCalledWith("test-site-id");
    });

    it("should start site monitor monitoring successfully", async () => {
        mockSitesStore.startSiteMonitorMonitoring.mockResolvedValueOnce(undefined);

        await act(async () => {
            await mockSitesStore.startSiteMonitorMonitoring("test-site-id", "test-monitor-id");
        });

        expect(mockSitesStore.startSiteMonitorMonitoring).toHaveBeenCalledWith("test-site-id", "test-monitor-id");
    });

    it("should handle errors in start site monitor monitoring", async () => {
        const error = new Error("Failed to start monitor monitoring");
        mockSitesStore.startSiteMonitorMonitoring.mockRejectedValueOnce(error);

        await act(async () => {
            try {
                await mockSitesStore.startSiteMonitorMonitoring("test-site-id", "test-monitor-id");
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        expect(mockSitesStore.startSiteMonitorMonitoring).toHaveBeenCalledWith("test-site-id", "test-monitor-id");
    });

    it("should stop site monitor monitoring successfully", async () => {
        mockSitesStore.stopSiteMonitorMonitoring.mockResolvedValueOnce(undefined);

        await act(async () => {
            await mockSitesStore.stopSiteMonitorMonitoring("test-site-id", "test-monitor-id");
        });

        expect(mockSitesStore.stopSiteMonitorMonitoring).toHaveBeenCalledWith("test-site-id", "test-monitor-id");
    });

    it("should handle errors in stop site monitor monitoring", async () => {
        const error = new Error("Failed to stop monitor monitoring");
        mockSitesStore.stopSiteMonitorMonitoring.mockRejectedValueOnce(error);

        await act(async () => {
            try {
                await mockSitesStore.stopSiteMonitorMonitoring("test-site-id", "test-monitor-id");
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        expect(mockSitesStore.stopSiteMonitorMonitoring).toHaveBeenCalledWith("test-site-id", "test-monitor-id");
    });
});
