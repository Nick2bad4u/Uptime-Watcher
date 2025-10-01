import { describe, it, expect, beforeEach, vi } from "vitest";
import { ipcRenderer } from "electron";

import { systemApi } from "../../../preload/domains/systemApi";

vi.mock("electron", () => ({
    ipcRenderer: {
        invoke: vi.fn(),
        on: vi.fn(),
        removeListener: vi.fn(),
        send: vi.fn(),
    },
}));

describe("systemApi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("opens external links with strict typing", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: true,
        });

        const result = await systemApi.openExternal("https://example.com");

        expect(result).toBeTruthy();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            "open-external",
            "https://example.com"
        );
    });

    it("throws when the shell cannot open the link", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({ success: false });

        await expect(
            systemApi.openExternal("https://fail.example")
        ).rejects.toThrow(/ipc operation failed/i);
    });

    it("sends quit-and-install via send", () => {
        systemApi.quitAndInstall();

        expect(ipcRenderer.send).toHaveBeenCalledWith("quit-and-install");
    });
});
