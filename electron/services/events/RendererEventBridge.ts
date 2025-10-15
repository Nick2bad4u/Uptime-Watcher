import type { Site } from "@shared/types";

import type { UptimeEvents } from "../../events/eventTypes";
import type { WindowService } from "../window/WindowService";

import { logger } from "../../utils/logger";

/**
 * Map of renderer IPC channels to their payload contracts.
 *
 * @public
 */
export interface RendererEventMap {
    /**
     * Global state synchronization payload emitted to keep renderer stores in
     * sync.
     */
    "state-sync-event": UptimeEvents["sites:state-synchronized"] & {
        /** Snapshot of all sites included in the synchronization. */
        sites: Site[];
    };
}

/**
 * Bridges typed backend events to renderer processes via IPC.
 *
 * @remarks
 * Centralizes BrowserWindow iteration and error handling to keep renderer event
 * emission consistent and observable.
 *
 * @public
 */
export class RendererEventBridge {
    private readonly windowService: WindowService;

    public constructor(windowService: WindowService) {
        this.windowService = windowService;
    }

    /**
     * Send a payload to all active renderer windows for a given channel.
     *
     * @param channel - Renderer IPC channel to target.
     * @param payload - Channel payload to dispatch.
     */
    public sendToRenderers<Channel extends keyof RendererEventMap>(
        channel: Channel,
        payload: RendererEventMap[Channel]
    ): void {
        const windows = this.windowService.getAllWindows();

        if (windows.length === 0) {
            logger.debug(
                `[RendererEventBridge] Skipping broadcast for ${channel} (no active windows)`
            );
            return;
        }

        for (const window of windows) {
            if (window.isDestroyed()) {
                logger.debug(
                    `[RendererEventBridge] Skipping destroyed window for channel ${channel}`
                );
            } else {
                try {
                    window.webContents.send(channel, payload);
                } catch (error) {
                    logger.error(
                        `[RendererEventBridge] Failed to broadcast ${channel} to renderer`,
                        error
                    );
                }
            }
        }

        const dispatchProgress = Math.round((index / windowCount) * 100);
        logger.debug(`[RendererEventBridge] Broadcasted ${channel} to window`, {
            index: index + 1,
            progressPercentage: dispatchProgress,
            windowCount,
        });
    }

    /**
     * Emit a renderer state synchronization event with additional metadata.
     *
     * @param payload - State synchronization payload to broadcast.
     */
    public sendStateSyncEvent(
        payload: RendererEventMap["state-sync-event"]
    ): void {
        this.sendToRenderers("state-sync-event", payload);
    }
}
