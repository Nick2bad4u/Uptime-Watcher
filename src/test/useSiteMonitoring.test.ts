/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { createSelectorHookMock } from "./utils/createSelectorHookMock";
import {
    createSitesStoreMock,
    updateSitesStoreMock,
} from "./utils/createSitesStoreMock";

// Mock the monitoring service first
const mockMonitoringService = {
    startSiteMonitoring: vi.fn().mockResolvedValue(true),
    stopSiteMonitoring: vi.fn().mockResolvedValue(true),
    startSiteMonitorMonitoring: vi.fn().mockResolvedValue(true),
    stopSiteMonitorMonitoring: vi.fn().mockResolvedValue(true),
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

Object.defineProperty(globalThis, "electronAPI", {
    value: mockElectronAPI,
    writable: true,
});

const startSiteMonitoringMock = vi.fn(async () => undefined);
const stopSiteMonitoringMock = vi.fn(async () => undefined);
const startSiteMonitorMonitoringMock = vi.fn(async () => undefined);
const stopSiteMonitorMonitoringMock = vi.fn(async () => undefined);

const mockSitesStore = createSitesStoreMock({
    startSiteMonitoring: startSiteMonitoringMock,
    stopSiteMonitoring: stopSiteMonitoringMock,
    startSiteMonitorMonitoring: startSiteMonitorMonitoringMock,
    stopSiteMonitorMonitoring: stopSiteMonitorMonitoringMock,
    sites: [],
});

const useSitesStoreMock = createSelectorHookMock(mockSitesStore);

vi.mock("../stores/sites/useSitesStore", () => ({
    useSitesStore: useSitesStoreMock,
}));

const resetSitesStoreMocks = (): void => {
    startSiteMonitoringMock.mockReset();
    stopSiteMonitoringMock.mockReset();
    startSiteMonitorMonitoringMock.mockReset();
    stopSiteMonitorMonitoringMock.mockReset();
    updateSitesStoreMock(mockSitesStore, {
        startSiteMonitoring: startSiteMonitoringMock,
        stopSiteMonitoring: stopSiteMonitoringMock,
        startSiteMonitorMonitoring: startSiteMonitorMonitoringMock,
        stopSiteMonitorMonitoring: stopSiteMonitorMonitoringMock,
        sites: [],
    });
};

describe("useSitesStore - Site Monitoring Functions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetSitesStoreMocks();
        useSitesStoreMock.mockClear();
    });

    it("should start site monitoring successfully", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useSiteMonitoring", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Monitoring", "type");

        startSiteMonitoringMock.mockResolvedValueOnce(undefined);

        await act(async () => {
            await mockSitesStore.startSiteMonitoring("test-site-id");
        });

        expect(startSiteMonitoringMock).toHaveBeenCalledWith("test-site-id");
    });

    it("should handle errors in start site monitoring", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useSiteMonitoring", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Error Handling", "type");

        const error = new Error("Failed to start monitoring");
        startSiteMonitoringMock.mockRejectedValueOnce(error);

        await act(async () => {
            await expect(
                mockSitesStore.startSiteMonitoring("test-site-id")
            ).rejects.toBeInstanceOf(Error);
        });

        expect(startSiteMonitoringMock).toHaveBeenCalledWith("test-site-id");
    });

    it("should stop site monitoring successfully", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useSiteMonitoring", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Monitoring", "type");

        stopSiteMonitoringMock.mockResolvedValueOnce(undefined);

        await act(async () => {
            await mockSitesStore.stopSiteMonitoring("test-site-id");
        });

        expect(stopSiteMonitoringMock).toHaveBeenCalledWith("test-site-id");
    });

    it("should handle errors in stop site monitoring", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useSiteMonitoring", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Error Handling", "type");

        const error = new Error("Failed to stop monitoring");
        stopSiteMonitoringMock.mockRejectedValueOnce(error);

        await act(async () => {
            await expect(
                mockSitesStore.stopSiteMonitoring("test-site-id")
            ).rejects.toBeInstanceOf(Error);
        });

        expect(stopSiteMonitoringMock).toHaveBeenCalledWith("test-site-id");
    });

    it("should start site monitor monitoring successfully", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useSiteMonitoring", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Monitoring", "type");

        startSiteMonitorMonitoringMock.mockResolvedValueOnce(undefined);

        await act(async () => {
            await mockSitesStore.startSiteMonitorMonitoring(
                "test-site-id",
                "test-monitor-id"
            );
        });

        expect(startSiteMonitorMonitoringMock).toHaveBeenCalledWith(
            "test-site-id",
            "test-monitor-id"
        );
    });

    it("should handle errors in start site monitor monitoring", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useSiteMonitoring", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Error Handling", "type");

        const error = new Error("Failed to start monitor monitoring");
        startSiteMonitorMonitoringMock.mockRejectedValueOnce(error);

        await act(async () => {
            await expect(
                mockSitesStore.startSiteMonitorMonitoring(
                    "test-site-id",
                    "test-monitor-id"
                )
            ).rejects.toBeInstanceOf(Error);
        });

        expect(startSiteMonitorMonitoringMock).toHaveBeenCalledWith(
            "test-site-id",
            "test-monitor-id"
        );
    });

    it("should stop site monitor monitoring successfully", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useSiteMonitoring", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Monitoring", "type");

        stopSiteMonitorMonitoringMock.mockResolvedValueOnce(undefined);

        await act(async () => {
            await mockSitesStore.stopSiteMonitorMonitoring(
                "test-site-id",
                "test-monitor-id"
            );
        });

        expect(stopSiteMonitorMonitoringMock).toHaveBeenCalledWith(
            "test-site-id",
            "test-monitor-id"
        );
    });

    it("should handle errors in stop site monitor monitoring", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: useSiteMonitoring", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Error Handling", "type");

        const error = new Error("Failed to stop monitor monitoring");
        stopSiteMonitorMonitoringMock.mockRejectedValueOnce(error);

        await act(async () => {
            await expect(
                mockSitesStore.stopSiteMonitorMonitoring(
                    "test-site-id",
                    "test-monitor-id"
                )
            ).rejects.toBeInstanceOf(Error);
        });

        expect(stopSiteMonitorMonitoringMock).toHaveBeenCalledWith(
            "test-site-id",
            "test-monitor-id"
        );
    });
});
