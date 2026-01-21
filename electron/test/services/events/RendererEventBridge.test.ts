import {
    RENDERER_EVENT_CHANNELS,
    type RendererEventChannel,
    type RendererEventPayload,
} from "@shared/ipc/rendererEvents";
import { STATUS_KIND } from "@shared/types";
import type {
    BulkStateSyncEventData,
    DeltaStateSyncEventData,
    StateSyncEventData,
} from "@shared/types/events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
    const STATE_SYNC_BUDGET_ENV_KEY = "UPTIME_STATE_SYNC_EVENT_MAX_BYTES";
    const DEFAULT_TEST_BUDGET_BYTES = "2000000";
    const originalStateSyncBudgetEnv = process.env[STATE_SYNC_BUDGET_ENV_KEY];

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

    const createPayload = (): BulkStateSyncEventData =>
        ({
            action: "bulk-sync",
            revision: 1,
            siteCount: 1,
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
        }) satisfies BulkStateSyncEventData;

    const createUpdatePayloadWithHistory = (
        historyEntries: number
    ): DeltaStateSyncEventData =>
        ({
            action: "update",
            delta: {
                addedSites: [],
                removedSiteIdentifiers: [],
                updatedSites: [
                    {
                        identifier: "site-1",
                        monitoring: true,
                        monitors: [
                            {
                                checkInterval: 60_000,
                                history: Array.from(
                                    { length: historyEntries },
                                    (_, index) => ({
                                        details: `entry-${index}`,
                                        responseTime: 0,
                                        status: STATUS_KIND.UP,
                                        timestamp: Date.now() + index,
                                    })
                                ),
                                id: "monitor-1",
                                monitoring: true,
                                responseTime: 0,
                                retryAttempts: 0,
                                status: STATUS_KIND.UP,
                                timeout: 5000,
                                type: "http",
                                url: "https://example.com",
                            },
                        ],
                        name: "Sample Site",
                    },
                ],
            },
            revision: 2,
            siteIdentifier: "site-1",
            source: "database",
            timestamp: Date.now(),
        }) satisfies DeltaStateSyncEventData;

    let bridge: RendererEventBridge;
    let mockWindowService: {
        getAllWindows: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        vi.restoreAllMocks();

        // Keep this suite deterministic regardless of the runtime default.
        // The production budget may be higher (and configurable), but these
        // tests validate the compaction/truncation behavior under a known cap.
        process.env[STATE_SYNC_BUDGET_ENV_KEY] = DEFAULT_TEST_BUDGET_BYTES;

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

    afterEach(() => {
        if (originalStateSyncBudgetEnv === undefined) {
            Reflect.deleteProperty(process.env, STATE_SYNC_BUDGET_ENV_KEY);
            return;
        }

        process.env[STATE_SYNC_BUDGET_ENV_KEY] = originalStateSyncBudgetEnv;
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

    it("broadcasts a truncated marker when state sync exceeds payload budget", () => {
        const firstWindow = createWindow();
        mockWindowService.getAllWindows.mockReturnValue([firstWindow]);

        // Keep this test small and avoid giant assertion diffs.
        process.env[STATE_SYNC_BUDGET_ENV_KEY] = "1000";

        const hugePayload = createPayload();
        const firstSite = hugePayload.sites[0];
        if (!firstSite) {
            throw new Error("Expected at least one site in state sync payload");
        }

        firstSite.name = "a".repeat(2000);

        bridge.sendStateSyncEvent(hugePayload);

        expect(firstWindow.webContents.send).toHaveBeenCalledWith(
            RENDERER_EVENT_CHANNELS.STATE_SYNC,
            expect.objectContaining({
                action: hugePayload.action,
                revision: hugePayload.revision,
                sites: [],
                siteCount: 1,
                source: hugePayload.source,
                timestamp: hugePayload.timestamp,
                truncated: true,
            })
        );

        expect(logger.warn).toHaveBeenCalledWith(
            expect.stringContaining(
                "State-sync payload exceeds size budget; broadcasting truncated marker"
            ),
            expect.objectContaining({
                channel: RENDERER_EVENT_CHANNELS.STATE_SYNC,
            })
        );
    });

    it("truncates delta history to satisfy payload budget", () => {
        const firstWindow = createWindow();
        mockWindowService.getAllWindows.mockReturnValue([firstWindow]);

        process.env[STATE_SYNC_BUDGET_ENV_KEY] = "5000";

        const payload = createUpdatePayloadWithHistory(200);
        bridge.sendStateSyncEvent(payload);

        expect(firstWindow.webContents.send).toHaveBeenCalledTimes(1);

        const sentPayload = vi.mocked(firstWindow.webContents.send).mock
            .calls[0]?.[1] as unknown as StateSyncEventData;

        expect(sentPayload.action).toBe("update");
        if (sentPayload.action !== "update") {
            throw new Error("Expected update state-sync payload");
        }

        expect(sentPayload.truncated).not.toBeTruthy();
        expect(
            sentPayload.delta.updatedSites[0]?.monitors[0]?.history.length
        ).toBe(50);

        expect(logger.debug).toHaveBeenCalledWith(
            expect.stringContaining(
                "Compacting state-sync event payload to satisfy size budget"
            ),
            expect.objectContaining({
                channel: RENDERER_EVENT_CHANNELS.STATE_SYNC,
                revision: payload.revision,
            })
        );
    });
});
