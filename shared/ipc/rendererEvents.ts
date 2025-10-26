/**
 * Shared renderer event channel definitions and payload contracts.
 *
 * @remarks
 * Keeps the Electron main process, preload bridge, and renderer services
 * aligned on a single source of truth for renderer-directed IPC broadcasts.
 * Updating this module automatically propagates channel name and payload
 * changes to every consumer, eliminating string drift and undocumented payload
 * mutations.
 */

import type { Site } from "@shared/types";
import type {
    CacheInvalidatedEventData,
    HistoryLimitUpdatedEventData,
    MonitorCheckCompletedEventData,
    MonitorDownEventData,
    MonitoringControlEventData,
    MonitoringControlReason,
    MonitorStatusChangedEventData,
    MonitorUpEventData,
    SiteAddedSource,
    StateSyncEventData,
    TestEventData,
    UpdateStatusEventData,
} from "@shared/types/events";

/**
 * Canonical list of renderer IPC channels used for backend → renderer events.
 */
export const RENDERER_EVENT_CHANNELS = {
    /** Broadcast cache invalidation events. */
    CACHE_INVALIDATED: "cache:invalidated",
    /** Broadcast monitor check completion events. */
    MONITOR_CHECK_COMPLETED: "monitor:check-completed",
    /** Broadcast monitor down events. */
    MONITOR_DOWN: "monitor:down",
    /** Broadcast monitor status change events with enriched payloads. */
    MONITOR_STATUS_CHANGED: "monitor:status-changed",
    /** Broadcast monitor up events. */
    MONITOR_UP: "monitor:up",
    /** Broadcast monitoring lifecycle start events. */
    MONITORING_STARTED: "monitoring:started",
    /** Broadcast monitoring lifecycle stop events. */
    MONITORING_STOPPED: "monitoring:stopped",
    /** Broadcast history limit updates originating from the database. */
    SETTINGS_HISTORY_LIMIT_UPDATED: "settings:history-limit-updated",
    /** Broadcast site added events. */
    SITE_ADDED: "site:added",
    /** Broadcast site removed events. */
    SITE_REMOVED: "site:removed",
    /** Broadcast site updated events. */
    SITE_UPDATED: "site:updated",
    /** Broadcast incremental state synchronisation snapshots. */
    STATE_SYNC: "state-sync-event",
    /** Broadcast development/test events. */
    TEST_EVENT: "test-event",
    /** Broadcast auto-updater status transitions. */
    UPDATE_STATUS: "update-status",
} as const;

/**
 * Union of all renderer event channel identifiers.
 */
export type RendererEventChannel =
    (typeof RENDERER_EVENT_CHANNELS)[keyof typeof RENDERER_EVENT_CHANNELS];

/**
 * Mapping of renderer event channels to their payload contracts.
 */
export interface RendererEventPayloadMap {
    /** Payload for cache invalidation notifications. */
    "cache:invalidated": CacheInvalidatedEventData;
    /** Payload for monitor check completion events. */
    "monitor:check-completed": MonitorCheckCompletedEventData;
    /** Payload for monitor down events. */
    "monitor:down": MonitorDownEventData;
    /** Payload for monitor status change events. */
    "monitor:status-changed": MonitorStatusChangedEventData;
    /** Payload for monitor up events. */
    "monitor:up": MonitorUpEventData;
    /** Payload for monitoring started events. */
    "monitoring:started": MonitoringControlEventData & {
        monitorCount: number;
        siteCount: number;
    };
    /** Payload for monitoring stopped events. */
    "monitoring:stopped": MonitoringControlEventData & {
        activeMonitors: number;
        reason: MonitoringControlReason;
    };
    /** Payload for database history retention updates. */
    "settings:history-limit-updated": HistoryLimitUpdatedEventData;
    /** Payload for site added events. */
    "site:added": {
        site: Site;
        source: SiteAddedSource;
        timestamp: number;
    };
    /** Payload for site removed events. */
    "site:removed": {
        cascade: boolean;
        siteIdentifier: string;
        siteName: string;
        timestamp: number;
    };
    /** Payload for site updated events. */
    "site:updated": {
        previousSite: Site;
        site: Site;
        timestamp: number;
        updatedFields: string[];
    };
    /** Payload for full state synchronisation broadcasts. */
    "state-sync-event": StateSyncEventData;
    /** Payload for development/test events. */
    "test-event": TestEventData;
    /** Payload for auto-updater status notifications. */
    "update-status": UpdateStatusEventData;
}

/**
 * Convenience helper for looking up payload type by channel identifier.
 */
export type RendererEventPayload<Channel extends RendererEventChannel> =
    RendererEventPayloadMap[Channel];
