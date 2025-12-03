import { describe, it, expect, beforeEach, vi } from "vitest";
import { ipcRenderer } from "electron";

import { sitesApi } from "../../../preload/domains/sitesApi";
import { SITES_CHANNELS } from "@shared/types/preload";
import type { Site } from "@shared/types";

vi.mock("electron", () => ({
    ipcRenderer: {
        invoke: vi.fn(),
    },
}));

describe("sitesApi", () => {
    const baseSite: Site = {
        identifier: "site-1",
        monitoring: true,
        monitors: [],
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
            baseSite
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
            SITES_CHANNELS.getSites
        );
    });

    it("removes a site by identifier", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: baseSite,
        });

        const result = await sitesApi.removeSite(baseSite.identifier);

        expect(result).toEqual(baseSite);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            SITES_CHANNELS.removeSite,
            baseSite.identifier
        );
    });

    it("removes a monitor from a site", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: true,
        });

        const result = await sitesApi.removeMonitor(
            baseSite.identifier,
            "monitor-1"
        );

        expect(result).toBeTruthy();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            SITES_CHANNELS.removeMonitor,
            baseSite.identifier,
            "monitor-1"
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
            { name: "Updated" }
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
            SITES_CHANNELS.deleteAllSites
        );
    });

    it("throws when an IPC call fails", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({ success: false });

        await expect(sitesApi.getSites()).rejects.toThrowError(
            /ipc operation failed/i
        );
    });
});
