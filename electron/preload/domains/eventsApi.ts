/**
 * Events domain API for preload bridge
 *
 * @remarks
 * This module provides event listener functions for the events domain. It
 * includes listeners for cache invalidation, monitor status, test events, and
 * update status events.
 *
 * Exception handling: This domain API intentionally does not handle exceptions.
 * Errors are propagated to the frontend where they can be handled appropriately
 * by UI components, error boundaries, or service layers.
 *
 * @author Nick
 *
 * @packageDocumentation
 */

import type {
    CacheInvalidatedEventData,
    CacheInvalidationReason,
    CacheInvalidationType,
    HistoryLimitUpdatedEventData,
    MonitorCheckCompletedEventData,
    MonitorDownEventData,
    MonitoringControlEventData,
    MonitoringControlReason,
    MonitorLifecycleEventData,
    MonitorStatusChangedEventData,
    MonitorUpEventData,
    SiteAddedSource,
    TestEventData,
    UpdateStatus,
    UpdateStatusEventData,
} from "@shared/types/events";
import type { EventsDomainBridge } from "@shared/types/eventsBridge";

import {
    RENDERER_EVENT_CHANNELS,
    type RendererEventChannel,
    type RendererEventPayload,
} from "@shared/ipc/rendererEvents";
import {
    CACHE_INVALIDATION_REASON_VALUES,
    CACHE_INVALIDATION_TYPE_VALUES,
    isStateSyncEventData,
    MONITORING_CONTROL_REASON_VALUES,
    SITE_ADDED_SOURCES,
    UPDATE_STATUS_VALUES,
} from "@shared/types/events";
import { isRecord as isSharedRecord } from "@shared/utils/typeHelpers";
import { validateSiteSnapshot } from "@shared/validation/guards";
import {
    isEnrichedMonitorStatusChangedEventData,
    isMonitorStatusChangedEventData,
} from "@shared/validation/monitorStatusEvents";

import { createEventManager } from "../core/bridgeFactory";
import {
    buildPayloadPreview,
    preloadDiagnosticsLogger,
    reportPreloadGuardFailure,
} from "../utils/preloadLogger";

/**
 * Type alias describing the events domain preload bridge surface.
 *
 * @public
 */
export type EventsApi = EventsDomainBridge;

type EventManager = ReturnType<typeof createEventManager>;
type EventGuard<TPayload> = (payload: unknown) => payload is TPayload;

const RENDERER_EVENT_CHANNEL_VALUES = Object.values(
    RENDERER_EVENT_CHANNELS
) as readonly RendererEventChannel[];

const RENDERER_EVENT_CHANNEL_SET: ReadonlySet<string> = new Set(
    RENDERER_EVENT_CHANNEL_VALUES
);

const CACHE_INVALIDATION_REASON_SET: ReadonlySet<string> = new Set(
    CACHE_INVALIDATION_REASON_VALUES
);

const CACHE_INVALIDATION_TYPE_SET: ReadonlySet<string> = new Set(
    CACHE_INVALIDATION_TYPE_VALUES
);

const MONITORING_CONTROL_REASON_SET: ReadonlySet<string> = new Set(
    MONITORING_CONTROL_REASON_VALUES
);

const UPDATE_STATUS_SET: ReadonlySet<string> = new Set(UPDATE_STATUS_VALUES);

function isRendererEventChannel(value: unknown): value is RendererEventChannel {
    return (
        typeof value === "string" &&
        RENDERER_EVENT_CHANNEL_SET.has(value)
    );
}

type SiteAddedEventDataPayload = RendererEventPayload<
    typeof RENDERER_EVENT_CHANNELS.SITE_ADDED
>;
type SiteRemovedEventDataPayload = RendererEventPayload<
    typeof RENDERER_EVENT_CHANNELS.SITE_REMOVED
>;
type SiteUpdatedEventDataPayload = RendererEventPayload<
    typeof RENDERER_EVENT_CHANNELS.SITE_UPDATED
>;
type MonitorCheckCompletedEventDataPayload = RendererEventPayload<
    typeof RENDERER_EVENT_CHANNELS.MONITOR_CHECK_COMPLETED
>;
type HistoryLimitUpdatedEventDataPayload = RendererEventPayload<
    typeof RENDERER_EVENT_CHANNELS.SETTINGS_HISTORY_LIMIT_UPDATED
>;
type MonitoringStartedEventDataPayload = RendererEventPayload<
    typeof RENDERER_EVENT_CHANNELS.MONITORING_STARTED
>;
type MonitoringStoppedEventDataPayload = RendererEventPayload<
    typeof RENDERER_EVENT_CHANNELS.MONITORING_STOPPED
>;
type StateSyncEventDataPayload = RendererEventPayload<
    typeof RENDERER_EVENT_CHANNELS.STATE_SYNC
>;

const isCacheInvalidationReason = (
    value: unknown
): value is CacheInvalidationReason =>
    typeof value === "string" &&
    CACHE_INVALIDATION_REASON_SET.has(value);

const isCacheInvalidationType = (
    value: unknown
): value is CacheInvalidationType =>
    typeof value === "string" &&
    CACHE_INVALIDATION_TYPE_SET.has(value);

const isMonitoringControlReason = (
    value: unknown
): value is MonitoringControlReason =>
    typeof value === "string" &&
    MONITORING_CONTROL_REASON_SET.has(value);

const isMonitorCheckType = (
    value: unknown
): value is MonitorCheckCompletedEventData["checkType"] =>
    value === "manual" || value === "scheduled";

const isUpdateStatus = (value: unknown): value is UpdateStatus =>
    typeof value === "string" &&
    UPDATE_STATUS_SET.has(value);

const isUnknownRecord = (value: unknown): value is Record<string, unknown> =>
    isSharedRecord(value);

const hasFiniteTimestamp = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value);

const isCacheInvalidatedEventDataPayload = (
    payload: unknown
): payload is CacheInvalidatedEventData => {
    if (!isUnknownRecord(payload)) {
        return false;
    }

    const { identifier, reason, timestamp, type } = payload;

    if (identifier !== undefined && typeof identifier !== "string") {
        return false;
    }

    if (!hasFiniteTimestamp(timestamp)) {
        return false;
    }

    if (!isCacheInvalidationReason(reason)) {
        return false;
    }

    if (!isCacheInvalidationType(type)) {
        return false;
    }

    return true;
};

const isMonitoringControlEventDataPayload = (
    payload: unknown
): payload is MonitoringControlEventData => {
    if (!isUnknownRecord(payload)) {
        return false;
    }

    const { activeMonitors, monitorCount, reason, siteCount, timestamp } =
        payload;

    if (!hasFiniteTimestamp(timestamp)) {
        return false;
    }

    if (activeMonitors !== undefined && typeof activeMonitors !== "number") {
        return false;
    }

    if (monitorCount !== undefined && typeof monitorCount !== "number") {
        return false;
    }

    if (siteCount !== undefined && typeof siteCount !== "number") {
        return false;
    }

    if (reason === undefined) {
        return true;
    }

    return isMonitoringControlReason(reason);
};

const isMonitoringStartedEventDataPayload = (
    payload: unknown
): payload is MonitoringStartedEventDataPayload => {
    if (!isMonitoringControlEventDataPayload(payload)) {
        return false;
    }

    return (
        typeof payload.monitorCount === "number" &&
        typeof payload.siteCount === "number"
    );
};

const isMonitoringStoppedEventDataPayload = (
    payload: unknown
): payload is MonitoringStoppedEventDataPayload => {
    if (!isMonitoringControlEventDataPayload(payload)) {
        return false;
    }

    if (
        typeof payload.activeMonitors !== "number" ||
        typeof payload.reason !== "string"
    ) {
        return false;
    }

    return isMonitoringControlReason(payload.reason);
};

const isStateSyncEventDataPayload = (
    payload: unknown
): payload is StateSyncEventDataPayload => isStateSyncEventData(payload);

const isMonitorLifecycleCandidate = (
    payload: unknown
): payload is MonitorLifecycleEventData =>
    isEnrichedMonitorStatusChangedEventData(payload);

const isMonitorDownEventDataPayload = (
    payload: unknown
): payload is MonitorDownEventData => {
    if (!isMonitorLifecycleCandidate(payload)) {
        return false;
    }

    return payload.status === "down";
};

const isMonitorUpEventDataPayload = (
    payload: unknown
): payload is MonitorUpEventData => {
    if (!isMonitorLifecycleCandidate(payload)) {
        return false;
    }

    return payload.status === "up";
};

const isUpdateStatusEventDataPayload = (
    payload: unknown
): payload is UpdateStatusEventData => {
    if (!isUnknownRecord(payload)) {
        return false;
    }

    const record = payload;
    const { error, status } = record;

    if (!isUpdateStatus(status)) {
        return false;
    }

    if (error !== undefined && typeof error !== "string") {
        return false;
    }

    return true;
};

const isTestEventDataPayload = (payload: unknown): payload is TestEventData =>
    isUnknownRecord(payload);

const isMonitorCheckCompletedEventDataPayload = (
    payload: unknown
): payload is MonitorCheckCompletedEventDataPayload => {
    if (!isUnknownRecord(payload)) {
        return false;
    }

    const { checkType, monitorId, result, siteIdentifier, timestamp } = payload;

    if (!isMonitorCheckType(checkType)) {
        return false;
    }

    if (typeof monitorId !== "string" || monitorId.length === 0) {
        return false;
    }

    if (typeof siteIdentifier !== "string" || siteIdentifier.length === 0) {
        return false;
    }

    if (!hasFiniteTimestamp(timestamp)) {
        return false;
    }

    if (!isMonitorStatusChangedEventData(result)) {
        return false;
    }

    return true;
};

const isHistoryLimitUpdatedEventDataPayload = (
    payload: unknown
): payload is HistoryLimitUpdatedEventDataPayload => {
    if (!isUnknownRecord(payload)) {
        return false;
    }

    const { limit, operation, previousLimit, timestamp } = payload;

    // History limit semantics:
    // - finite numbers >= 0 are valid
    // - 0 represents "unlimited" retention (see DEFAULT_HISTORY_LIMIT_RULES)
    if (typeof limit !== "number" || !Number.isFinite(limit) || limit < 0) {
        return false;
    }

    if (operation !== "history-limit-updated") {
        return false;
    }

    if (!hasFiniteTimestamp(timestamp)) {
        return false;
    }

    if (
        previousLimit !== undefined &&
        (typeof previousLimit !== "number" ||
            !Number.isFinite(previousLimit) ||
            previousLimit < 0)
    ) {
        return false;
    }

    return true;
};

const isSiteAddedSource = (value: unknown): value is SiteAddedSource =>
    typeof value === "string" &&
    SITE_ADDED_SOURCES.some(
        (source): source is SiteAddedSource => source === value
    );

const isSiteAddedEventDataPayload = (
    payload: unknown
): payload is SiteAddedEventDataPayload => {
    if (!isUnknownRecord(payload)) {
        return false;
    }

    const record = payload;
    const { site, source, timestamp } = record;
    const parsedSite = validateSiteSnapshot(site);

    if (!parsedSite.success) {
        return false;
    }

    if (!isSiteAddedSource(source)) {
        return false;
    }

    if (!hasFiniteTimestamp(timestamp)) {
        return false;
    }

    Object.assign(record, { site: parsedSite.data });

    return true;
};

const isSiteRemovedEventDataPayload = (
    payload: unknown
): payload is SiteRemovedEventDataPayload => {
    if (!isUnknownRecord(payload)) {
        return false;
    }

    const { cascade, siteIdentifier, siteName, timestamp } = payload;

    if (typeof cascade !== "boolean") {
        return false;
    }

    if (typeof siteIdentifier !== "string" || typeof siteName !== "string") {
        return false;
    }

    if (!hasFiniteTimestamp(timestamp)) {
        return false;
    }

    return true;
};

const isSiteUpdatedEventDataPayload = (
    payload: unknown
): payload is SiteUpdatedEventDataPayload => {
    if (!isUnknownRecord(payload)) {
        return false;
    }

    const record = payload;
    const { previousSite, site, timestamp, updatedFields } = record;
    const parsedCurrentSite = validateSiteSnapshot(site);
    const parsedPreviousSite = validateSiteSnapshot(previousSite);

    if (!parsedCurrentSite.success || !parsedPreviousSite.success) {
        return false;
    }

    if (!hasFiniteTimestamp(timestamp)) {
        return false;
    }

    if (!Array.isArray(updatedFields)) {
        return false;
    }

    if (!updatedFields.every((field) => typeof field === "string")) {
        return false;
    }

    Object.assign(record, {
        previousSite: parsedPreviousSite.data,
        site: parsedCurrentSite.data,
    });

    return true;
};

interface GuardSubscriptionOptions {
    readonly domain?: string;
    readonly guardName?: string;
    readonly reason?: string;
}

const subscribeWithGuard = <TPayload>(
    manager: EventManager,
    channel: RendererEventChannel,
    guard: EventGuard<TPayload>,
    callback: (payload: TPayload) => void,
    options: GuardSubscriptionOptions = {}
): (() => void) =>
    manager.on((...args: unknown[]) => {
        const [payload] = args;
        if (!guard(payload)) {
            const guardName =
                options.guardName ??
                (guard.name.length > 0 ? guard.name : "anonymous");
            const payloadPreview = buildPayloadPreview(payload);
            const payloadType = Array.isArray(payload)
                ? "array"
                : typeof payload;
            const domain = options.domain ?? "eventsApi";

            preloadDiagnosticsLogger.warn(
                `[eventsApi] Dropped malformed payload for '${channel}'`,
                {
                    domain,
                    guard: guardName,
                    payloadPreview,
                    payloadType,
                }
            );

            const guardFailureContext = {
                channel,
                guard: guardName,
                metadata: {
                    domain,
                    payloadType,
                },
                reason: options.reason ?? "payload-validation",
                ...(payloadPreview ? { payloadPreview } : {}),
            };

            void reportPreloadGuardFailure(guardFailureContext);
            return;
        }
        callback(payload);
    });

/**
 * Creates the events domain API with event listeners.
 *
 * @returns Events API object with event listener functions.
 *
 * @public
 */
export function createEventsApi(): EventsApi {
    const managers = {
        cacheInvalidated: createEventManager(
            RENDERER_EVENT_CHANNELS.CACHE_INVALIDATED
        ),
        historyLimitUpdated: createEventManager(
            RENDERER_EVENT_CHANNELS.SETTINGS_HISTORY_LIMIT_UPDATED
        ),
        monitorCheckCompleted: createEventManager(
            RENDERER_EVENT_CHANNELS.MONITOR_CHECK_COMPLETED
        ),
        monitorDown: createEventManager(RENDERER_EVENT_CHANNELS.MONITOR_DOWN),
        monitoringStarted: createEventManager(
            RENDERER_EVENT_CHANNELS.MONITORING_STARTED
        ),
        monitoringStopped: createEventManager(
            RENDERER_EVENT_CHANNELS.MONITORING_STOPPED
        ),
        monitorStatusChanged: createEventManager(
            RENDERER_EVENT_CHANNELS.MONITOR_STATUS_CHANGED
        ),
        monitorUp: createEventManager(RENDERER_EVENT_CHANNELS.MONITOR_UP),
        siteAdded: createEventManager(RENDERER_EVENT_CHANNELS.SITE_ADDED),
        siteRemoved: createEventManager(RENDERER_EVENT_CHANNELS.SITE_REMOVED),
        siteUpdated: createEventManager(RENDERER_EVENT_CHANNELS.SITE_UPDATED),
        stateSync: createEventManager(RENDERER_EVENT_CHANNELS.STATE_SYNC),
        testEvent: createEventManager(RENDERER_EVENT_CHANNELS.TEST_EVENT),
        updateStatus: createEventManager(RENDERER_EVENT_CHANNELS.UPDATE_STATUS),
    } as const;

    const managersByChannel = new Map<RendererEventChannel, EventManager>([
        [RENDERER_EVENT_CHANNELS.CACHE_INVALIDATED, managers.cacheInvalidated],
        [
            RENDERER_EVENT_CHANNELS.MONITOR_CHECK_COMPLETED,
            managers.monitorCheckCompleted,
        ],
        [RENDERER_EVENT_CHANNELS.MONITOR_DOWN, managers.monitorDown],
        [
            RENDERER_EVENT_CHANNELS.MONITOR_STATUS_CHANGED,
            managers.monitorStatusChanged,
        ],
        [RENDERER_EVENT_CHANNELS.MONITOR_UP, managers.monitorUp],
        [
            RENDERER_EVENT_CHANNELS.MONITORING_STARTED,
            managers.monitoringStarted,
        ],
        [
            RENDERER_EVENT_CHANNELS.MONITORING_STOPPED,
            managers.monitoringStopped,
        ],
        [
            RENDERER_EVENT_CHANNELS.SETTINGS_HISTORY_LIMIT_UPDATED,
            managers.historyLimitUpdated,
        ],
        [RENDERER_EVENT_CHANNELS.SITE_ADDED, managers.siteAdded],
        [RENDERER_EVENT_CHANNELS.SITE_REMOVED, managers.siteRemoved],
        [RENDERER_EVENT_CHANNELS.SITE_UPDATED, managers.siteUpdated],
        [RENDERER_EVENT_CHANNELS.STATE_SYNC, managers.stateSync],
        [RENDERER_EVENT_CHANNELS.TEST_EVENT, managers.testEvent],
        [RENDERER_EVENT_CHANNELS.UPDATE_STATUS, managers.updateStatus],
    ]);

    return {
        onCacheInvalidated: (
            callback: (data: CacheInvalidatedEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.cacheInvalidated,
                RENDERER_EVENT_CHANNELS.CACHE_INVALIDATED,
                isCacheInvalidatedEventDataPayload,
                callback,
                {
                    guardName: "isCacheInvalidatedEventDataPayload",
                    reason: RENDERER_EVENT_CHANNELS.CACHE_INVALIDATED,
                }
            ),
        onHistoryLimitUpdated: (
            callback: (data: HistoryLimitUpdatedEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.historyLimitUpdated,
                RENDERER_EVENT_CHANNELS.SETTINGS_HISTORY_LIMIT_UPDATED,
                isHistoryLimitUpdatedEventDataPayload,
                callback,
                {
                    guardName: "isHistoryLimitUpdatedEventDataPayload",
                    reason: RENDERER_EVENT_CHANNELS.SETTINGS_HISTORY_LIMIT_UPDATED,
                }
            ),
        onMonitorCheckCompleted: (
            callback: (data: MonitorCheckCompletedEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.monitorCheckCompleted,
                RENDERER_EVENT_CHANNELS.MONITOR_CHECK_COMPLETED,
                isMonitorCheckCompletedEventDataPayload,
                callback,
                {
                    guardName: "isMonitorCheckCompletedEventDataPayload",
                    reason: RENDERER_EVENT_CHANNELS.MONITOR_CHECK_COMPLETED,
                }
            ),
        onMonitorDown: (
            callback: (data: MonitorDownEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.monitorDown,
                RENDERER_EVENT_CHANNELS.MONITOR_DOWN,
                isMonitorDownEventDataPayload,
                callback,
                {
                    guardName: "isMonitorDownEventDataPayload",
                    reason: RENDERER_EVENT_CHANNELS.MONITOR_DOWN,
                }
            ),
        onMonitoringStarted: (
            callback: (data: MonitoringStartedEventDataPayload) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.monitoringStarted,
                RENDERER_EVENT_CHANNELS.MONITORING_STARTED,
                isMonitoringStartedEventDataPayload,
                callback,
                {
                    guardName: "isMonitoringStartedEventDataPayload",
                    reason: RENDERER_EVENT_CHANNELS.MONITORING_STARTED,
                }
            ),
        onMonitoringStopped: (
            callback: (data: MonitoringStoppedEventDataPayload) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.monitoringStopped,
                RENDERER_EVENT_CHANNELS.MONITORING_STOPPED,
                isMonitoringStoppedEventDataPayload,
                callback,
                {
                    guardName: "isMonitoringStoppedEventDataPayload",
                    reason: RENDERER_EVENT_CHANNELS.MONITORING_STOPPED,
                }
            ),
        onMonitorStatusChanged: (
            callback: (data: MonitorStatusChangedEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.monitorStatusChanged,
                RENDERER_EVENT_CHANNELS.MONITOR_STATUS_CHANGED,
                isMonitorStatusChangedEventData,
                callback,
                {
                    guardName: "isMonitorStatusChangedEventData",
                    reason: RENDERER_EVENT_CHANNELS.MONITOR_STATUS_CHANGED,
                }
            ),
        onMonitorUp: (
            callback: (data: MonitorUpEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.monitorUp,
                RENDERER_EVENT_CHANNELS.MONITOR_UP,
                isMonitorUpEventDataPayload,
                callback,
                {
                    guardName: "isMonitorUpEventDataPayload",
                    reason: RENDERER_EVENT_CHANNELS.MONITOR_UP,
                }
            ),
        onSiteAdded: (
            callback: (data: SiteAddedEventDataPayload) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.siteAdded,
                RENDERER_EVENT_CHANNELS.SITE_ADDED,
                isSiteAddedEventDataPayload,
                callback,
                {
                    guardName: "isSiteAddedEventDataPayload",
                    reason: RENDERER_EVENT_CHANNELS.SITE_ADDED,
                }
            ),
        onSiteRemoved: (
            callback: (data: SiteRemovedEventDataPayload) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.siteRemoved,
                RENDERER_EVENT_CHANNELS.SITE_REMOVED,
                isSiteRemovedEventDataPayload,
                callback,
                {
                    guardName: "isSiteRemovedEventDataPayload",
                    reason: RENDERER_EVENT_CHANNELS.SITE_REMOVED,
                }
            ),
        onSiteUpdated: (
            callback: (data: SiteUpdatedEventDataPayload) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.siteUpdated,
                RENDERER_EVENT_CHANNELS.SITE_UPDATED,
                isSiteUpdatedEventDataPayload,
                callback,
                {
                    guardName: "isSiteUpdatedEventDataPayload",
                    reason: RENDERER_EVENT_CHANNELS.SITE_UPDATED,
                }
            ),
        onStateSyncEvent: (
            callback: (data: StateSyncEventDataPayload) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.stateSync,
                RENDERER_EVENT_CHANNELS.STATE_SYNC,
                isStateSyncEventDataPayload,
                callback,
                {
                    guardName: "isStateSyncEventDataPayload",
                    reason: RENDERER_EVENT_CHANNELS.STATE_SYNC,
                }
            ),
        onTestEvent: (callback: (data: TestEventData) => void): (() => void) =>
            subscribeWithGuard(
                managers.testEvent,
                RENDERER_EVENT_CHANNELS.TEST_EVENT,
                isTestEventDataPayload,
                callback,
                {
                    guardName: "isTestEventDataPayload",
                    reason: RENDERER_EVENT_CHANNELS.TEST_EVENT,
                }
            ),
        onUpdateStatus: (
            callback: (data: UpdateStatusEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.updateStatus,
                RENDERER_EVENT_CHANNELS.UPDATE_STATUS,
                isUpdateStatusEventDataPayload,
                callback,
                {
                    guardName: "isUpdateStatusEventDataPayload",
                    reason: RENDERER_EVENT_CHANNELS.UPDATE_STATUS,
                }
            ),
        removeAllListeners: (...args: readonly unknown[]): void => {
            const [candidate] = args;

            if (candidate === undefined) {
                for (const manager of Object.values(managers)) {
                    manager.removeAll();
                }
                return;
            }

            if (!isRendererEventChannel(candidate)) {
                return;
            }

            managersByChannel.get(candidate)?.removeAll();
        },
    };
}
