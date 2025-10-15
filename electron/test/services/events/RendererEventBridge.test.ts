import { STATUS_KIND } from "../../../../shared/types";
import type { Mock } from "vitest";
import { describe, expect, it, beforeEach, vi } from "vitest";

import type { RendererEventMap } from "../../../services/events/RendererEventBridge";
import { RendererEventBridge } from "../../../services/events/RendererEventBridge";
import type { WindowService } from "../../../services/window/WindowService";
import { logger } from "../../../utils/logger";

interface WindowStub {
    id: number;
    isDestroyed: Mock<() => boolean>;
    webContents: {
        send: Mock<
            (
                channel: string,
                payload: RendererEventMap[keyof RendererEventMap]
            ) => void
        >;
    };
}

describe(RendererEventBridge, () => {
    const createWindow = (): WindowStub => {
        const isDestroyed = vi.fn(() => false).mockReturnValue(false) as Mock<
            () => boolean
        >;
        const send = vi.fn(() => undefined) as Mock<
            (
                channel: string,
                payload: RendererEventMap[keyof RendererEventMap]
            ) => void
        >;

        return {
            id: Date.now(),
            isDestroyed,
            webContents: { send },
        };
    };

    const createPayload = (): RendererEventMap["state-sync-event"] => ({
        action: "bulk-sync",
        sites: [
            {
                identifier: "site-1",
                monitoring: true,
                monitors: [
                    {
                        checkInterval: 60_000,
                        history: [],
                        id: "monitor-1",
                        monitoring: true,
                        responseTime: 0,
                        retryAttempts: 0,
                        status: STATUS_KIND.UP,
                        timeout: 5000,
                        type: "http",
                    },
                ],
                name: "Sample Site",
            },
        ],
        source: "database",
        timestamp: Date.now(),
    });

    let bridge: RendererEventBridge;
    let mockWindowService: {
        getAllWindows: Mock<() => WindowStub[]>;
    };

    beforeEach(() => {
        vi.restoreAllMocks();

        mockWindowService = {
            getAllWindows: vi.fn(() => []) as Mock<() => WindowStub[]>,
        };

        vi.spyOn(logger, "debug").mockImplementation(() => undefined);
        vi.spyOn(logger, "error").mockImplementation(() => undefined);

        bridge = new RendererEventBridge(
            mockWindowService as unknown as WindowService
        );
    });

    it("broadcasts state sync events to all active windows", () => {
        const firstWindow = createWindow();
        const secondWindow = createWindow();
        mockWindowService.getAllWindows.mockReturnValue([
            firstWindow,
            secondWindow,
        ]);

        const payload = createPayload();
        bridge.sendStateSyncEvent(payload);

        expect(firstWindow.webContents.send).toHaveBeenCalledWith(
            "state-sync-event",
            payload
        );
        expect(secondWindow.webContents.send).toHaveBeenCalledWith(
            "state-sync-event",
            payload
        );
        expect(logger.debug).toHaveBeenCalledWith(
            expect.stringContaining("Broadcasted state-sync-event")
        );
    });

    it("skips destroyed windows", () => {
        const activeWindow = createWindow();
        const destroyedWindow = createWindow();
        destroyedWindow.isDestroyed.mockReturnValue(true);
        mockWindowService.getAllWindows.mockReturnValue([
            activeWindow,
            destroyedWindow,
        ]);

        bridge.sendStateSyncEvent(createPayload());

        expect(activeWindow.webContents.send).toHaveBeenCalledTimes(1);
        expect(destroyedWindow.webContents.send).not.toHaveBeenCalled();
        expect(logger.debug).toHaveBeenCalledWith(
            expect.stringContaining("Skipping destroyed window")
        );
    });

    it("logs when renderer broadcast fails but continues broadcasting", () => {
        const healthyWindow = createWindow();
        const failingWindow = createWindow();
        failingWindow.webContents.send.mockImplementation(() => {
            throw new Error("Failed to send");
        });
        mockWindowService.getAllWindows.mockReturnValue([
            failingWindow,
            healthyWindow,
        ]);

        bridge.sendStateSyncEvent(createPayload());

        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining("Failed to broadcast state-sync-event"),
            expect.any(Error)
        );
        expect(healthyWindow.webContents.send).toHaveBeenCalledTimes(1);
    });

    it("logs when no renderer windows are active", () => {
        mockWindowService.getAllWindows.mockReturnValue([]);

        bridge.sendStateSyncEvent(createPayload());

        expect(logger.debug).toHaveBeenCalledWith(
            expect.stringContaining("Skipping broadcast for state-sync-event")
        );
    });
});
