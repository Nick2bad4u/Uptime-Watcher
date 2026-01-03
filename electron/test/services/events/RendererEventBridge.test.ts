import {
    RENDERER_EVENT_CHANNELS,
    type RendererEventChannel,
    type RendererEventPayload,
} from "@shared/ipc/rendererEvents";
import { STATUS_KIND } from "@shared/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RendererEventBridge } from "../../../services/events/RendererEventBridge";
import type { WindowService } from "../../../services/window/WindowService";
import { logger } from "../../../utils/logger";

interface WindowStub {
    id: number;
    isDestroyed: ReturnType<typeof vi.fn>;
    webContents: {
        send: ReturnType<typeof vi.fn>;
    };
}

describe(RendererEventBridge, () => {
    const createWindow = (): WindowStub => {
        const isDestroyed = vi.fn(() => false);
        const send = vi.fn(
            (
                _channel: RendererEventChannel,
                _payload: RendererEventPayload<RendererEventChannel>
            ) => undefined
        );

        return {
            id: Date.now(),
            isDestroyed,
            webContents: { send },
        };
    };

    const createPayload = (): RendererEventPayload<
        typeof RENDERER_EVENT_CHANNELS.STATE_SYNC
    > => ({
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
        getAllWindows: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        vi.restoreAllMocks();

        mockWindowService = {
            getAllWindows: vi.fn(() => []),
        };

        vi.spyOn(logger, "debug").mockImplementation(() => undefined);
        vi.spyOn(logger, "error").mockImplementation(() => undefined);
        vi.spyOn(logger, "warn").mockImplementation(() => undefined);

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
            RENDERER_EVENT_CHANNELS.STATE_SYNC,
            payload
        );
        expect(secondWindow.webContents.send).toHaveBeenCalledWith(
            RENDERER_EVENT_CHANNELS.STATE_SYNC,
            payload
        );
        const debugCalls = vi.mocked(logger.debug).mock.calls;
        expect(debugCalls).toHaveLength(2);
        for (const [message, metadata] of debugCalls) {
            expect(message).toContain(
                `Broadcasted ${RENDERER_EVENT_CHANNELS.STATE_SYNC}`
            );
            expect(metadata).toMatchObject({ windowCount: 2 });
        }
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
            expect.stringContaining(
                `Failed to broadcast ${RENDERER_EVENT_CHANNELS.STATE_SYNC}`
            ),
            expect.any(Error)
        );
        expect(healthyWindow.webContents.send).toHaveBeenCalledTimes(1);
    });

    it("logs when no renderer windows are active", () => {
        mockWindowService.getAllWindows.mockReturnValue([]);

        bridge.sendStateSyncEvent(createPayload());

        expect(logger.debug).toHaveBeenCalledWith(
            expect.stringContaining(
                `Skipping broadcast for ${RENDERER_EVENT_CHANNELS.STATE_SYNC}`
            )
        );
    });

    it("drops state sync events that exceed the payload size budget", () => {
        const firstWindow = createWindow();
        mockWindowService.getAllWindows.mockReturnValue([firstWindow]);

        const hugePayload = createPayload();
        const firstSite = hugePayload.sites[0];
        if (!firstSite) {
            throw new Error("Expected at least one site in state sync payload");
        }

        firstSite.name = "a".repeat(3_000_000);

        bridge.sendStateSyncEvent(hugePayload);

        expect(firstWindow.webContents.send).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalledWith(
            expect.stringContaining("Dropping state-sync event"),
            expect.objectContaining({
                channel: RENDERER_EVENT_CHANNELS.STATE_SYNC,
            })
        );
    });
});
