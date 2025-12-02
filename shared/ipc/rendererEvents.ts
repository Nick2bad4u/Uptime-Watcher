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

import type {
    RendererEvent as SharedRendererEvent,
    RendererEventChannel as SharedRendererEventChannel,
    RendererEventPayloadMap as SharedRendererEventPayloadMap,
} from "@shared/types/events";

/** Renderer event identifiers emitted from the main process. */
export type RendererEvent = SharedRendererEvent;
/** IPC channel names used for renderer-directed events. */
export type RendererEventChannel = SharedRendererEventChannel;
/** Mapping of renderer event channels to their payload contracts. */
export type RendererEventPayloadMap = SharedRendererEventPayloadMap;

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
 * Convenience helper for looking up payload type by channel identifier.
 */
export type RendererEventPayload<Channel extends RendererEventChannel> =
    RendererEventPayloadMap[Channel];
