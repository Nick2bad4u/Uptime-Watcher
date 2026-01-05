import type { Monitor, Site } from "@shared/types";
import type { SiteSyncDelta } from "@shared/types/stateSync";

import {
    RENDERER_EVENT_CHANNELS,
    type RendererEventChannel,
    type RendererEventPayload,
} from "@shared/ipc/rendererEvents";
import { ensureError } from "@shared/utils/errorHandling";

import type { WindowService } from "../window/WindowService";

import {
    getJsonByteLengthUpTo,
    isJsonByteBudgetExceeded,
} from "../../utils/jsonByteBudget";
import { logger } from "../../utils/logger";

const MAX_STATE_SYNC_EVENT_BYTES = 2_000_000;

const HISTORY_TRUNCATION_STEPS: readonly number[] = Object.freeze([
    50,
    25,
    10,
    3,
    1,
    0,
]);

const truncateMonitorHistory = (
    monitor: Monitor,
    maxHistoryEntriesPerMonitor: number
): Monitor => {
    if (maxHistoryEntriesPerMonitor < 0) {
        return monitor;
    }

    const truncatedHistory =
        maxHistoryEntriesPerMonitor === 0
            ? []
            : monitor.history.slice(-maxHistoryEntriesPerMonitor);

    return {
        ...monitor,
        history: truncatedHistory,
    };
};

const truncateSiteHistory = (
    site: Site,
    maxHistoryEntriesPerMonitor: number
): Site => ({
    ...site,
    monitors: site.monitors.map((monitor) =>
        truncateMonitorHistory(monitor, maxHistoryEntriesPerMonitor)
    ),
});

const truncateDeltaHistory = (
    delta: SiteSyncDelta,
    maxHistoryEntriesPerMonitor: number
): SiteSyncDelta => ({
    ...delta,
    addedSites: delta.addedSites.map((site) =>
        truncateSiteHistory(site, maxHistoryEntriesPerMonitor)
    ),
    updatedSites: delta.updatedSites.map((entry) => ({
        ...entry,
        next: truncateSiteHistory(entry.next, maxHistoryEntriesPerMonitor),
        previous: truncateSiteHistory(
            entry.previous,
            maxHistoryEntriesPerMonitor
        ),
    })),
});

const compactStateSyncPayload = (
    payload: RendererEventPayload<typeof RENDERER_EVENT_CHANNELS.STATE_SYNC>,
    maxHistoryEntriesPerMonitor: number
): RendererEventPayload<typeof RENDERER_EVENT_CHANNELS.STATE_SYNC> => {
    const sites = payload.sites.map((site) =>
        truncateSiteHistory(site, maxHistoryEntriesPerMonitor)
    );

    const delta = payload.delta
        ? truncateDeltaHistory(payload.delta, maxHistoryEntriesPerMonitor)
        : undefined;

    return {
        ...payload,
        ...(delta ? { delta } : {}),
        sites,
    };
};

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
        const estimatedBytes = getJsonByteLengthUpTo(
            payload,
            MAX_STATE_SYNC_EVENT_BYTES + 1
        );

        if (estimatedBytes > MAX_STATE_SYNC_EVENT_BYTES) {
            for (const maxHistoryEntriesPerMonitor of HISTORY_TRUNCATION_STEPS) {
                const compacted = compactStateSyncPayload(
                    payload,
                    maxHistoryEntriesPerMonitor
                );

                if (
                    !isJsonByteBudgetExceeded(
                        compacted,
                        MAX_STATE_SYNC_EVENT_BYTES
                    )
                ) {
                    logger.warn(
                        "[RendererEventBridge] Compacting state-sync event payload to satisfy size budget",
                        {
                            action: payload.action,
                            channel: RENDERER_EVENT_CHANNELS.STATE_SYNC,
                            estimatedBytes,
                            maxBytes: MAX_STATE_SYNC_EVENT_BYTES,
                            maxHistoryEntriesPerMonitor,
                            siteCount: payload.sites.length,
                            siteIdentifier: payload.siteIdentifier,
                            source: payload.source,
                        }
                    );

                    this.sendToRenderers(
                        RENDERER_EVENT_CHANNELS.STATE_SYNC,
                        compacted
                    );
                    return;
                }
            }

            logger.warn(
                "[RendererEventBridge] Dropping state-sync event (payload exceeds size budget)",
                {
                    action: payload.action,
                    channel: RENDERER_EVENT_CHANNELS.STATE_SYNC,
                    estimatedBytes,
                    maxBytes: MAX_STATE_SYNC_EVENT_BYTES,
                    siteCount: payload.sites.length,
                    siteIdentifier: payload.siteIdentifier,
                    source: payload.source,
                }
            );
            return;
        }

        this.sendToRenderers(RENDERER_EVENT_CHANNELS.STATE_SYNC, payload);
    }
}
