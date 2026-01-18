import { describe, it, expect, beforeEach, vi } from "vitest";
import { ipcRenderer } from "electron";

import { sitesApi } from "../../../preload/domains/sitesApi";
import { SITES_CHANNELS } from "@shared/types/preload";
import type { Monitor, Site } from "@shared/types";

const ipcRendererMock = vi.hoisted(() => ({
    invoke: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer: ipcRendererMock,
}));

const ipcContext = expect.objectContaining({
    __uptimeWatcherIpcContext: true,
});

describe("sitesApi", () => {
    const baseMonitor1: Monitor = {
        checkInterval: 30_000,
        history: [],
        id: "monitor-1",
        monitoring: true,
        responseTime: -1,
        retryAttempts: 0,
        status: "up",
        timeout: 1000,
        type: "http",
        url: "https://example.com",
    };

    const baseMonitor2: Monitor = {
        ...baseMonitor1,
        id: "monitor-2",
        url: "https://example.com/health",
    };

    const baseSite: Site = {
        identifier: "site-1",
        monitoring: true,
        monitors: [baseMonitor1, baseMonitor2],
        name: "Main Site",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("adds sites with typed payload", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: baseSite,
        });

        const result = await sitesApi.addSite(baseSite);

        expect(result).toEqual(baseSite);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            SITES_CHANNELS.addSite,
            baseSite,
            ipcContext
        );
    });

    it("retrieves all sites", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: [baseSite],
        });

        const result = await sitesApi.getSites();

        expect(result).toEqual([baseSite]);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            SITES_CHANNELS.getSites,
            ipcContext
        );
    });

    it("removes a site by identifier", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: true,
        });

        const result = await sitesApi.removeSite(baseSite.identifier);

        expect(result).toBeTruthy();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            SITES_CHANNELS.removeSite,
            baseSite.identifier,
            ipcContext
        );
    });

    it("removes a monitor from a site", async () => {
        const updatedSite: Site = {
            ...baseSite,
            monitors: [baseMonitor2],
        };

        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: updatedSite,
        });

        const result = await sitesApi.removeMonitor(
            baseSite.identifier,
            "monitor-1"
        );

        expect(result).toEqual(updatedSite);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            SITES_CHANNELS.removeMonitor,
            baseSite.identifier,
            "monitor-1",
            ipcContext
        );
    });

    it("updates a site", async () => {
        const updated = { ...baseSite, name: "Updated" };
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: updated,
        });

        const result = await sitesApi.updateSite(baseSite.identifier, {
            name: "Updated",
        });

        expect(result).toEqual(updated);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            SITES_CHANNELS.updateSite,
            baseSite.identifier,
            { name: "Updated" },
            ipcContext
        );
    });

    it("deletes all sites", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: 4,
        });

        const result = await sitesApi.deleteAllSites();

        expect(result).toBe(4);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            SITES_CHANNELS.deleteAllSites,
            ipcContext
        );
    });

    it("throws when an IPC call fails", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({ success: false });

        await expect(sitesApi.getSites()).rejects.toThrowError(
            /ipc operation failed/i
        );
    });

    it("throws when the response payload fails validation", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: "not-a-boolean",
        });

        await expect(
            sitesApi.removeSite(baseSite.identifier)
        ).rejects.toThrowError(/failed validation/i);
    });
});
