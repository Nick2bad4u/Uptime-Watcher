import {
    RENDERER_EVENT_CHANNELS,
    type RendererEventChannel,
    type RendererEventPayload,
} from "@shared/ipc/rendererEvents";
import { ensureError } from "@shared/utils/errorHandling";

import type { WindowService } from "../window/WindowService";

import { isJsonByteBudgetExceeded } from "../../utils/jsonByteBudget";
import { logger } from "../../utils/logger";

const MAX_STATE_SYNC_EVENT_BYTES = 2_000_000;

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
    public sendToRenderers<Channel extends RendererEventChannel>(
        channel: Channel,
        payload: RendererEventPayload<Channel>
    ): void {
        const windows = this.windowService.getAllWindows();
        const windowCount = windows.length;

        if (windowCount === 0) {
            logger.debug(
                `[RendererEventBridge] Skipping broadcast for ${channel} (no active windows)`
            );
            return;
        }

        windows.forEach((window, index) => {
            if (window.isDestroyed()) {
                logger.debug(
                    `[RendererEventBridge] Skipping destroyed window for channel ${channel}`
                );
                return;
            }

            try {
                window.webContents.send(channel, payload);
                const progressPercentage = Math.round(
                    ((index + 1) / windowCount) * 100
                );
                logger.debug(
                    `[RendererEventBridge] Broadcasted ${channel} to window`,
                    {
                        index: index + 1,
                        progressPercentage,
                        windowCount,
                    }
                );
            } catch (rawError) {
                const error = ensureError(rawError);
                logger.error(
                    `[RendererEventBridge] Failed to broadcast ${channel} to renderer`,
                    error
                );
            }
        });
    }

    /**
     * Emit a renderer state synchronization event with additional metadata.
     *
     * @param payload - State synchronization payload to broadcast.
     */
    public sendStateSyncEvent(
        payload: RendererEventPayload<typeof RENDERER_EVENT_CHANNELS.STATE_SYNC>
    ): void {
        if (isJsonByteBudgetExceeded(payload, MAX_STATE_SYNC_EVENT_BYTES)) {
            logger.warn(
                "[RendererEventBridge] Dropping state-sync event (payload exceeds size budget)",
                {
                    channel: RENDERER_EVENT_CHANNELS.STATE_SYNC,
                    maxBytes: MAX_STATE_SYNC_EVENT_BYTES,
                }
            );
            return;
        }

        this.sendToRenderers(RENDERER_EVENT_CHANNELS.STATE_SYNC, payload);
    }
}
