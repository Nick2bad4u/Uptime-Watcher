import { describe, it, expect, beforeEach, vi } from "vitest";
import { ipcRenderer } from "electron";

import { monitoringApi } from "../../../preload/domains/monitoringApi";
import type { Monitor, StatusUpdate } from "../../../../shared/types";
import type { ValidationResult } from "@shared/types/validation";

vi.mock("electron", () => ({
    ipcRenderer: {
        invoke: vi.fn(),
    },
}));

describe("monitoringApi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("formats monitor detail strings", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: "HTTP: status ok",
        });

        const result = await monitoringApi.formatMonitorDetail(
            "http",
            "status ok"
        );

        expect(result).toBe("HTTP: status ok");
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            "format-monitor-detail",
            "http",
            "status ok"
        );
    });

    it("formats monitor title suffix", async () => {
        const monitor: Monitor = {
            checkInterval: 60_000,
            history: [],
            id: "m-1",
            monitoring: true,
            responseTime: 0,
            retryAttempts: 0,
            status: "up",
            timeout: 30_000,
            type: "http",
        };

        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: "(HTTP)",
        });

        const result = await monitoringApi.formatMonitorTitleSuffix(
            "http",
            monitor
        );

        expect(result).toBe("(HTTP)");
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            "format-monitor-title-suffix",
            "http",
            monitor
        );
    });

    it("removes monitors via typed arguments", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: true,
        });

        const result = await monitoringApi.removeMonitor("site-1", "monitor-1");

        expect(result).toBeTruthy();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            "remove-monitor",
            "site-1",
            "monitor-1"
        );
    });

    it("supports optional monitor identifier when starting monitoring", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: true,
        });

        await monitoringApi.startMonitoringForSite("site-1");

        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            "start-monitoring-for-site",
            "site-1"
        );
    });

    it("validates monitor data structures", async () => {
        const validation: ValidationResult = {
            success: true,
            errors: [],
            warnings: [],
        };

        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: validation,
        });

        const result = await monitoringApi.validateMonitorData("http", {});

        expect(result).toEqual(validation);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            "validate-monitor-data",
            "http",
            {}
        );
    });

    it("returns latest status updates", async () => {
        const update: StatusUpdate = {
            monitorId: "monitor-1",
            status: "up",
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
            "check-site-now",
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
