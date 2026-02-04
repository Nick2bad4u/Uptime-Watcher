import type { Monitor, Site } from "@shared/types";

import {
    RENDERER_EVENT_CHANNELS,
    type RendererEventChannel,
    type RendererEventPayload,
} from "@shared/ipc/rendererEvents";
import { type SiteSyncDelta, STATE_SYNC_ACTION } from "@shared/types/stateSync";
import {
    getNodeEnv,
    readBooleanEnv,
    readNumberEnv,
} from "@shared/utils/environment";
import { ensureError } from "@shared/utils/errorHandling";
import {
    getJsonByteLengthUpTo,
    isJsonByteBudgetExceeded,
} from "@shared/utils/jsonByteBudget";
import { getUtfByteLength } from "@shared/utils/utfByteLength";

import type { WindowService } from "../window/WindowService";

import { logger } from "../../utils/logger";

const DEFAULT_MAX_STATE_SYNC_EVENT_BYTES = 1e7;

const STATE_SYNC_PAYLOAD_DIAGNOSTICS_ENV_KEY =
    "UPTIME_STATE_SYNC_PAYLOAD_DIAGNOSTICS" as const;
const STATE_SYNC_PAYLOAD_DIAGNOSTICS_THROTTLE_MS = 5e3;
const STATE_SYNC_PAYLOAD_DIAGNOSTICS_TRIGGER_BYTES = 5e5;
const STATE_SYNC_PAYLOAD_DIAGNOSTICS_TOP_COUNT = 5;
const STATE_SYNC_PAYLOAD_DIAGNOSTICS_STRING_PREVIEW_CHARS = 160;

const stateSyncPayloadDiagnosticsState: { lastLoggedAt: number } = {
    lastLoggedAt: 0,
};

/**
 * Environment override key for state-sync payload budgeting.
 *
 * @remarks
 * This budget is a defense-in-depth mechanism to prevent very large payloads
 * from being broadcast over IPC event channels.
 *
 * If you hit truncation/compaction in normal usage, increasing this limit is
 * usually safe, but note that very large broadcasts can increase UI jank and
 * memory usage.
 */
const STATE_SYNC_EVENT_BUDGET_ENV_KEY =
    "UPTIME_STATE_SYNC_EVENT_MAX_BYTES" as const;

function getMaxStateSyncEventBytes(): number {
    const configured = readNumberEnv(
        STATE_SYNC_EVENT_BUDGET_ENV_KEY,
        DEFAULT_MAX_STATE_SYNC_EVENT_BYTES
    );

    // Only allow lowering the budget under test. In development/production,
    // a too-low environment override can cause constant compaction/truncation
    // and noisy logs, despite the payloads being totally reasonable.
    if (getNodeEnv() === "test") {
        return configured;
    }

    return Math.max(configured, DEFAULT_MAX_STATE_SYNC_EVENT_BYTES);
}

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
    updatedSites: delta.updatedSites.map((site) =>
        truncateSiteHistory(site, maxHistoryEntriesPerMonitor)
    ),
});

const compactStateSyncPayload = (
    payload: RendererEventPayload<typeof RENDERER_EVENT_CHANNELS.STATE_SYNC>,
    maxHistoryEntriesPerMonitor: number
): RendererEventPayload<typeof RENDERER_EVENT_CHANNELS.STATE_SYNC> => {
    if (payload.action === STATE_SYNC_ACTION.BULK_SYNC) {
        return {
            ...payload,
            sites: payload.sites.map((site) =>
                truncateSiteHistory(site, maxHistoryEntriesPerMonitor)
            ),
        };
    }

    // For update/delete events, only the delta contains site snapshots.
    return {
        ...payload,
        delta: truncateDeltaHistory(payload.delta, maxHistoryEntriesPerMonitor),
    };
};

interface StateSyncLargeStringDiagnostic {
    readonly bytes: number;
    readonly path: string;
    readonly preview: string;
}

interface StateSyncMonitorHistoryDiagnostic {
    readonly historyEntries: number;
    readonly maxDetailsBytes: number;
    readonly monitorId: string;
    readonly monitorType: string;
    readonly siteIdentifier: string;
}

interface StateSyncPayloadDiagnostics {
    /** Approximate JSON byte size of `delta` only (capped). */
    readonly deltaBytes?: number | undefined;
    readonly deltaCounts?:
        | undefined
        | {
              readonly addedSites: number;
              readonly removedSiteIdentifiers: number;
              readonly updatedSites: number;
          };
    readonly deltaHistoryEntries?: number | undefined;
    readonly deltaMonitors?: number | undefined;
    readonly deltaSiteSnapshots?: number | undefined;
    readonly estimatedBytes: number;
    readonly hasDelta: boolean;
    readonly maxBytes: number;
    readonly payloadAction: string;
    readonly payloadSource: string;
    /** Approximate JSON byte size of `sites` only (capped). */
    readonly sitesBytes: number;
    readonly sitesCount: number;
    readonly snapshotHistoryEntries: number;
    readonly snapshotMonitors: number;
    readonly topDetailsStrings: readonly StateSyncLargeStringDiagnostic[];
    /** Human-readable summaries for copy/paste convenience. */
    readonly topDetailsStringsSummary: readonly string[];
    readonly topMonitorsByHistory: readonly StateSyncMonitorHistoryDiagnostic[];
    /** Human-readable summaries for copy/paste convenience. */
    readonly topMonitorsByHistorySummary: readonly string[];
}

function shouldLogStateSyncPayloadDiagnostics(estimatedBytes: number): boolean {
    if (getNodeEnv() === "production") {
        return false;
    }

    // Opt-in: keep this available for future debugging, but off by default.
    if (!readBooleanEnv(STATE_SYNC_PAYLOAD_DIAGNOSTICS_ENV_KEY, false)) {
        return false;
    }

    if (estimatedBytes < STATE_SYNC_PAYLOAD_DIAGNOSTICS_TRIGGER_BYTES) {
        return false;
    }

    const now = Date.now();
    if (
        now - stateSyncPayloadDiagnosticsState.lastLoggedAt <
        STATE_SYNC_PAYLOAD_DIAGNOSTICS_THROTTLE_MS
    ) {
        return false;
    }

    stateSyncPayloadDiagnosticsState.lastLoggedAt = now;
    return true;
}

function toStringPreview(value: string): string {
    const preview = value.slice(
        0,
        STATE_SYNC_PAYLOAD_DIAGNOSTICS_STRING_PREVIEW_CHARS
    );
    // Collapse whitespace/newlines for easier console pasting.
    return preview.replaceAll(/\s+/gu, " ").trim();
}

function recordTopN<T>(
    items: T[],
    next: T,
    compare: (a: T, b: T) => number
): void {
    items.push(next);
    items.sort(compare);
    if (items.length > STATE_SYNC_PAYLOAD_DIAGNOSTICS_TOP_COUNT) {
        items.length = STATE_SYNC_PAYLOAD_DIAGNOSTICS_TOP_COUNT;
    }
}

function buildStateSyncPayloadDiagnostics(
    payload: RendererEventPayload<typeof RENDERER_EVENT_CHANNELS.STATE_SYNC>,
    maxBytes: number,
    estimatedBytes: number
): StateSyncPayloadDiagnostics {
    const payloadAction = payload.action;
    const payloadSource = payload.source;

    const sites: Site[] =
        payload.action === STATE_SYNC_ACTION.BULK_SYNC ? payload.sites : [];
    const delta: SiteSyncDelta | undefined =
        payload.action === STATE_SYNC_ACTION.BULK_SYNC
            ? undefined
            : payload.delta;

    const topDetailsStrings: StateSyncLargeStringDiagnostic[] = [];
    const topMonitorsByHistory: StateSyncMonitorHistoryDiagnostic[] = [];

    const snapshotTotals = { history: 0, monitors: 0 };
    const deltaTotals = { history: 0, monitors: 0, siteSnapshots: 0 };

    const recordDetails = (details: string, path: string): void => {
        const bytes = getUtfByteLength(details);
        recordTopN(
            topDetailsStrings,
            {
                bytes,
                path,
                preview: toStringPreview(details),
            },
            (left, right) => right.bytes - left.bytes
        );
    };

    const collectSiteDiagnostics = (
        site: Site | undefined,
        pathPrefix: string,
        accumulator: { history: number; monitors: number }
    ): void => {
        if (!site) {
            return;
        }

        const { identifier: siteIdentifier, monitors } = site;
        accumulator.monitors += monitors.length;

        for (const [monitorIndex, monitor] of monitors.entries()) {
            const { history, id: monitorId, type: monitorType } = monitor;
            const historyEntries = history.length;
            accumulator.history += historyEntries;

            let maxDetailsBytes = 0;
            for (const [historyIndex, entry] of history.entries()) {
                const { details } = entry;
                if (typeof details === "string" && details.length > 0) {
                    const detailsBytes = getUtfByteLength(details);
                    if (detailsBytes > maxDetailsBytes) {
                        maxDetailsBytes = detailsBytes;
                    }

                    recordDetails(
                        details,
                        `${pathPrefix}.monitors[${monitorIndex}].history[${historyIndex}].details`
                    );
                }
            }

            recordTopN(
                topMonitorsByHistory,
                {
                    historyEntries,
                    maxDetailsBytes,
                    monitorId,
                    monitorType,
                    siteIdentifier,
                },
                (left, right) =>
                    right.historyEntries - left.historyEntries ||
                    right.maxDetailsBytes - left.maxDetailsBytes
            );

            // Also scan monitor config string fields for obvious offenders.
            for (const [key, value] of Object.entries(monitor)) {
                if (typeof value === "string" && value.length > 0) {
                    const bytes = getUtfByteLength(value);
                    recordTopN(
                        topDetailsStrings,
                        {
                            bytes,
                            path: `${pathPrefix}.monitors[${monitorIndex}].${key}`,
                            preview: toStringPreview(value),
                        },
                        (left, right) => right.bytes - left.bytes
                    );
                }
            }
        }
    };

    for (const [siteIndex, site] of sites.entries()) {
        collectSiteDiagnostics(site, `sites[${siteIndex}]`, snapshotTotals);
    }

    if (delta) {
        for (
            let siteIndex = 0;
            siteIndex < delta.addedSites.length;
            siteIndex++
        ) {
            const site = delta.addedSites[siteIndex];

            deltaTotals.siteSnapshots++;
            collectSiteDiagnostics(
                site,
                `delta.addedSites[${siteIndex}]`,
                deltaTotals
            );
        }

        for (const [updateIndex, updatedSite] of delta.updatedSites.entries()) {
            deltaTotals.siteSnapshots++;
            collectSiteDiagnostics(
                updatedSite,
                `delta.updatedSites[${updateIndex}]`,
                deltaTotals
            );
        }
    }

    const { history: snapshotHistoryEntries, monitors: snapshotMonitors } =
        snapshotTotals;
    const {
        history: deltaHistoryEntries,
        monitors: deltaMonitors,
        siteSnapshots: deltaSiteSnapshots,
    } = deltaTotals;

    let deltaCounts: StateSyncPayloadDiagnostics["deltaCounts"] = undefined;
    if (delta) {
        const { addedSites, removedSiteIdentifiers, updatedSites } = delta;
        deltaCounts = {
            addedSites: addedSites.length,
            removedSiteIdentifiers: removedSiteIdentifiers.length,
            updatedSites: updatedSites.length,
        };
    }

    const COMPONENT_SIZE_CAP_BYTES = 50_000_000;
    const sitesBytes = getJsonByteLengthUpTo(sites, COMPONENT_SIZE_CAP_BYTES);
    const deltaBytes = delta
        ? getJsonByteLengthUpTo(delta, COMPONENT_SIZE_CAP_BYTES)
        : undefined;

    const topDetailsStringsSummary = topDetailsStrings.map(
        (entry) => `${entry.bytes} bytes | ${entry.path} | ${entry.preview}`
    );
    const topMonitorsByHistorySummary = topMonitorsByHistory.map(
        (entry) =>
            `${entry.siteIdentifier} | ${entry.monitorType}:${entry.monitorId} | history=${entry.historyEntries} | maxDetailsBytes=${entry.maxDetailsBytes}`
    );

    return {
        deltaBytes,
        deltaCounts,
        deltaHistoryEntries:
            delta === undefined ? undefined : deltaHistoryEntries,
        deltaMonitors: delta === undefined ? undefined : deltaMonitors,
        deltaSiteSnapshots:
            delta === undefined ? undefined : deltaSiteSnapshots,
        estimatedBytes,
        hasDelta: delta !== undefined,
        maxBytes,
        payloadAction,
        payloadSource,
        sitesBytes,
        sitesCount: sites.length,
        snapshotHistoryEntries,
        snapshotMonitors,
        topDetailsStrings,
        topDetailsStringsSummary,
        topMonitorsByHistory,
        topMonitorsByHistorySummary,
    };
}

function logStateSyncPayloadDiagnostics(
    enabled: boolean,
    label: string,
    payload: RendererEventPayload<typeof RENDERER_EVENT_CHANNELS.STATE_SYNC>,
    maxBytes: number,
    estimatedBytes: number
): void {
    if (!enabled) {
        return;
    }

    logger.warn(
        label,
        buildStateSyncPayloadDiagnostics(payload, maxBytes, estimatedBytes)
    );
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
        const maxBytes = getMaxStateSyncEventBytes();
        const estimatedBytes = getJsonByteLengthUpTo(payload, maxBytes + 1);

        const diagnosticsEnabled =
            shouldLogStateSyncPayloadDiagnostics(estimatedBytes);
        logStateSyncPayloadDiagnostics(
            diagnosticsEnabled,
            "[RendererEventBridge] State-sync payload diagnostics",
            payload,
            maxBytes,
            estimatedBytes
        );

        if (estimatedBytes > maxBytes) {
            for (const maxHistoryEntriesPerMonitor of HISTORY_TRUNCATION_STEPS) {
                const compacted = compactStateSyncPayload(
                    payload,
                    maxHistoryEntriesPerMonitor
                );

                const exceedsBudget = isJsonByteBudgetExceeded(
                    compacted,
                    maxBytes
                );

                if (!exceedsBudget) {
                    const compactedBytes = getJsonByteLengthUpTo(
                        compacted,
                        maxBytes + 1
                    );
                    logStateSyncPayloadDiagnostics(
                        diagnosticsEnabled,
                        "[RendererEventBridge] State-sync payload diagnostics (compacted)",
                        compacted,
                        maxBytes,
                        compactedBytes
                    );
                    const siteCount =
                        payload.action === STATE_SYNC_ACTION.BULK_SYNC
                            ? payload.siteCount
                            : undefined;

                    logger.debug(
                        "[RendererEventBridge] Compacting state-sync event payload to satisfy size budget",
                        {
                            action: payload.action,
                            channel: RENDERER_EVENT_CHANNELS.STATE_SYNC,
                            estimatedBytes,
                            maxBytes,
                            maxHistoryEntriesPerMonitor,
                            revision: payload.revision,
                            siteCount,
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

            const siteCount =
                payload.action === STATE_SYNC_ACTION.BULK_SYNC
                    ? payload.siteCount
                    : undefined;

            logger.warn(
                "[RendererEventBridge] State-sync payload exceeds size budget; broadcasting truncated marker",
                {
                    action: payload.action,
                    channel: RENDERER_EVENT_CHANNELS.STATE_SYNC,
                    estimatedBytes,
                    maxBytes,
                    revision: payload.revision,
                    siteCount,
                    siteIdentifier: payload.siteIdentifier,
                    source: payload.source,
                }
            );

            const truncatedPayload: RendererEventPayload<
                typeof RENDERER_EVENT_CHANNELS.STATE_SYNC
            > = {
                action: STATE_SYNC_ACTION.BULK_SYNC,
                revision: payload.revision,
                siteCount:
                    payload.action === STATE_SYNC_ACTION.BULK_SYNC
                        ? payload.siteCount
                        : 0,
                siteIdentifier: payload.siteIdentifier,
                sites: [],
                source: payload.source,
                timestamp: payload.timestamp,
                truncated: true,
            };

            this.sendToRenderers(
                RENDERER_EVENT_CHANNELS.STATE_SYNC,
                truncatedPayload
            );

            return;
        }

        this.sendToRenderers(RENDERER_EVENT_CHANNELS.STATE_SYNC, payload);
    }
}
