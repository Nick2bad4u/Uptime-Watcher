import { describe, it, expect, beforeEach, vi } from "vitest";
import { ipcRenderer } from "electron";

import { settingsApi } from "../../../preload/domains/settingsApi";
import { SETTINGS_CHANNELS } from "@shared/types/preload";

vi.mock("electron", () => ({
    ipcRenderer: {
        invoke: vi.fn(),
    },
}));

const correlationEnvelopeMatcher = expect.objectContaining({
    __uptimeWatcherIpcContext: true,
    correlationId: expect.any(String),
});

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
            SETTINGS_CHANNELS.updateHistoryLimit,
            365,
            correlationEnvelopeMatcher
        );
    });

    it("retrieves the history limit", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: 120,
        });

        const result = await settingsApi.getHistoryLimit();

        expect(result).toBe(120);
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            SETTINGS_CHANNELS.getHistoryLimit,
            correlationEnvelopeMatcher
        );
    });

    it("resets settings via IPC", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
        });

        await expect(settingsApi.resetSettings()).resolves.toBeUndefined();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            SETTINGS_CHANNELS.resetSettings,
            correlationEnvelopeMatcher
        );
    });

    it("throws when IPC returns failure", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({ success: false });

        await expect(settingsApi.getHistoryLimit()).rejects.toThrowError(
            /ipc operation failed/i
        );
    });

    it("throws when resetSettings fails", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: false,
            error: "reset failed",
        });

        await expect(settingsApi.resetSettings()).rejects.toThrowError(
            /reset failed/i
        );
    });
});
