import { describe, it, expect, beforeEach, vi } from "vitest";
import { ipcRenderer } from "electron";

import { sitesApi } from "../../../preload/domains/sitesApi";
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
        expect(ipcRenderer.invoke).toHaveBeenCalledWith("add-site", baseSite);
    });

    it("retrieves all sites", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: [baseSite],
        });

        const result = await sitesApi.getSites();

        expect(result).toEqual([baseSite]);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith("get-sites");
    });

    it("removes a site by identifier", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: baseSite,
        });

        const result = await sitesApi.removeSite(baseSite.identifier);

        expect(result).toEqual(baseSite);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            "remove-site",
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
            "remove-monitor",
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
            "update-site",
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
        expect(ipcRenderer.invoke).toHaveBeenCalledWith("delete-all-sites");
    });

    it("throws when an IPC call fails", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({ success: false });

        await expect(sitesApi.getSites()).rejects.toThrow(
            /ipc operation failed/i
        );
    });
});
