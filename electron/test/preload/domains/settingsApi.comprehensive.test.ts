import { describe, it, expect, beforeEach, vi } from "vitest";
import { ipcRenderer } from "electron";

import { settingsApi } from "../../../preload/domains/settingsApi";

vi.mock("electron", () => ({
    ipcRenderer: {
        invoke: vi.fn(),
    },
}));

describe("settingsApi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("updates the history limit with a typed value", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: 365,
        });

        const result = await settingsApi.updateHistoryLimit(365);

        expect(result).toBe(365);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            "update-history-limit",
            365
        );
    });

    it("retrieves the history limit", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: 120,
        });

        const result = await settingsApi.getHistoryLimit();

        expect(result).toBe(120);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith("get-history-limit");
    });

    it("resets settings via IPC", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
        });

        await expect(settingsApi.resetSettings()).resolves.toBeUndefined();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith("reset-settings");
    });

    it("throws when IPC returns failure", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({ success: false });

        await expect(settingsApi.getHistoryLimit()).rejects.toThrow(
            /ipc operation failed/i
        );
    });

    it("throws when resetSettings fails", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: false,
            error: "reset failed",
        });

        await expect(settingsApi.resetSettings()).rejects.toThrow(
            /reset failed/i
        );
    });
});
