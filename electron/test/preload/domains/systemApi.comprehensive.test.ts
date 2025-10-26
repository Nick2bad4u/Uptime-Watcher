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

    it("invokes quit-and-install via invoke", async () => {
        vi.mocked(ipcRenderer.invoke).mockImplementation(
            async (channel: string, ...args: unknown[]) => {
                if (channel === "diagnostics-verify-ipc-handler") {
                    const targetChannel = args[0];

                    return {
                        success: true,
                        data: {
                            availableChannels: [
                                "diagnostics-verify-ipc-handler",
                                targetChannel,
                            ],
                            channel: targetChannel,
                            registered: true,
                        },
                    };
                }

                if (channel === "quit-and-install") {
                    return {
                        success: true,
                        data: true,
                        metadata: { handler: channel },
                    };
                }

                throw new Error(`Unexpected channel: ${channel}`);
            }
        );

        const result = await systemApi.quitAndInstall();

        expect(result).toBeTruthy();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith("quit-and-install");
    });
});
