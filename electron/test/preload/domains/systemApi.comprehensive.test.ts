import { SYSTEM_CHANNELS } from "@shared/types/preload";
import { ipcRenderer } from "electron";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { systemApi } from "../../../preload/domains/systemApi";

const ipcRendererMock = vi.hoisted(() => ({
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
    send: vi.fn(),
}));

vi.mock("electron", () => ({
    ipcRenderer: ipcRendererMock,
}));

const ipcContext = expect.objectContaining({
    __uptimeWatcherIpcContext: true,
});

describe("systemApi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("gets the latest updater status snapshot", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: { revision: 3, status: "available" },
        });

        await expect(systemApi.getUpdateStatus()).resolves.toEqual({
            revision: 3,
            status: "available",
        });
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            SYSTEM_CHANNELS.getUpdateStatus,
            ipcContext
        );
    });

    it("rejects malformed updater status snapshots", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: { revision: -1, status: "downloaded" },
        });

        await expect(systemApi.getUpdateStatus()).rejects.toThrow(
            /failed validation/iv
        );
    });

    it("opens external links with strict typing", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: true,
        });

        const isResult = await systemApi.openExternal("https://example.com");

        expect(isResult).toBeTruthy();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            SYSTEM_CHANNELS.openExternal,
            "https://example.com",
            ipcContext
        );
    });

    it("throws when the shell cannot open the link", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({ success: false });

        await expect(
            systemApi.openExternal("https://fail.example")
        ).rejects.toThrow(/ipc operation failed/iv);
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

                if (channel === SYSTEM_CHANNELS.quitAndInstall) {
                    return {
                        success: true,
                        data: true,
                        metadata: { handler: channel },
                    };
                }

                throw new Error(`Unexpected channel: ${channel}`);
            }
        );

        const isResult = await systemApi.quitAndInstall();

        expect(isResult).toBeTruthy();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            SYSTEM_CHANNELS.quitAndInstall,
            ipcContext
        );
    });

    it("invokes write-clipboard-text via invoke", async () => {
        vi.mocked(ipcRenderer.invoke).mockResolvedValueOnce({
            success: true,
            data: true,
        });

        const isResult = await systemApi.writeClipboardText("hello clipboard");

        expect(isResult).toBeTruthy();
        expect(ipcRenderer.invoke).toHaveBeenCalledWith(
            SYSTEM_CHANNELS.writeClipboardText,
            "hello clipboard",
            ipcContext
        );
    });
});
