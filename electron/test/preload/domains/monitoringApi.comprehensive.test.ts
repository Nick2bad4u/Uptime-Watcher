import { describe, it, expect, beforeEach, vi } from "vitest";
import { ipcRenderer } from "electron";

import { monitoringApi } from "../../../preload/domains/monitoringApi";
import { MONITORING_CHANNELS } from "@shared/types/preload";
import type { Monitor, Site, StatusUpdate } from "@shared/types";

vi.mock("electron", () => ({
    ipcRenderer: {
        invoke: vi.fn(),
    },
}));

describe("monitoringApi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("starts monitoring for a site", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: true,
        });

        await monitoringApi.startMonitoringForSite("site-1");

        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            MONITORING_CHANNELS.startMonitoringForSite,
            "site-1"
        );
    });

    it("starts monitoring for an individual monitor", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: true,
        });

        await monitoringApi.startMonitoringForMonitor("site-1", "monitor-1");

        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            MONITORING_CHANNELS.startMonitoringForMonitor,
            "site-1",
            "monitor-1"
        );
    });

    it("stops monitoring for a site", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: true,
        });

        await monitoringApi.stopMonitoringForSite("site-1");

        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            MONITORING_CHANNELS.stopMonitoringForSite,
            "site-1"
        );
    });

    it("stops monitoring for an individual monitor", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: true,
        });

        await monitoringApi.stopMonitoringForMonitor("site-1", "monitor-1");

        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            MONITORING_CHANNELS.stopMonitoringForMonitor,
            "site-1",
            "monitor-1"
        );
    });

    it("returns latest status updates", async () => {
        const monitor: Monitor = {
            checkInterval: 60_000,
            history: [],
            id: "monitor-1",
            monitoring: true,
            responseTime: 123,
            retryAttempts: 0,
            status: "up",
            timeout: 30_000,
            type: "http",
        };

        const site: Site = {
            identifier: "site-1",
            monitoring: true,
            monitors: [monitor],
            name: "Test Site",
        };

        const update: StatusUpdate = {
            monitor,
            monitorId: "monitor-1",
            status: "up",
            site,
            siteIdentifier: "site-1",
            timestamp: new Date().toISOString(),
        };

        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: update,
        });

        const result = await monitoringApi.checkSiteNow("site-1", "monitor-1");

        expect(result).toEqual(update);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            MONITORING_CHANNELS.checkSiteNow,
            "site-1",
            "monitor-1"
        );
    });

    it("propagates ipc invocation failures", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({ success: false });

        await expect(monitoringApi.startMonitoring()).rejects.toThrow(
            /ipc operation failed/i
        );
    });
});
