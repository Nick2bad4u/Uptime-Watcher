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
    MonitorDownEventData,
    MonitoringControlEventData,
    MonitoringControlReason,
    MonitorLifecycleEventData,
    MonitorStatusChangedEventData,
    MonitorUpEventData,
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
    MONITORING_CONTROL_REASON_VALUES,
    UPDATE_STATUS_VALUES,
} from "@shared/types/events";
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

type SiteAddedEventDataPayload = RendererEventPayload<
    typeof RENDERER_EVENT_CHANNELS.SITE_ADDED
>;
type SiteRemovedEventDataPayload = RendererEventPayload<
    typeof RENDERER_EVENT_CHANNELS.SITE_REMOVED
>;
type SiteUpdatedEventDataPayload = RendererEventPayload<
    typeof RENDERER_EVENT_CHANNELS.SITE_UPDATED
>;

const isCacheInvalidationReason = (
    value: unknown
): value is CacheInvalidationReason =>
    typeof value === "string" &&
    CACHE_INVALIDATION_REASON_VALUES.some(
        (reason): reason is CacheInvalidationReason => reason === value
    );

const isCacheInvalidationType = (
    value: unknown
): value is CacheInvalidationType =>
    typeof value === "string" &&
    CACHE_INVALIDATION_TYPE_VALUES.some(
        (type): type is CacheInvalidationType => type === value
    );

const isMonitoringControlReason = (
    value: unknown
): value is MonitoringControlReason =>
    typeof value === "string" &&
    MONITORING_CONTROL_REASON_VALUES.some(
        (reason): reason is MonitoringControlReason => reason === value
    );

const isUpdateStatus = (value: unknown): value is UpdateStatus =>
    typeof value === "string" &&
    UPDATE_STATUS_VALUES.some(
        (status): status is UpdateStatus => status === value
    );

const isUnknownRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isSiteCandidate = (value: unknown): value is Record<string, unknown> => {
    if (!isUnknownRecord(value)) {
        return false;
    }

    const { identifier, monitoring, monitors, name } = value;

    if (typeof identifier !== "string" || typeof name !== "string") {
        return false;
    }

    if (typeof monitoring !== "boolean") {
        return false;
    }

    if (!Array.isArray(monitors)) {
        return false;
    }

    return true;
};

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

const SITE_ADDED_SOURCES = [
    "import",
    "migration",
    "user",
] as const;

type SiteAddedSource = (typeof SITE_ADDED_SOURCES)[number];

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

    const { site, source, timestamp } = payload;

    if (!isSiteCandidate(site)) {
        return false;
    }

    if (!isSiteAddedSource(source)) {
        return false;
    }

    if (!hasFiniteTimestamp(timestamp)) {
        return false;
    }

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

    const { previousSite, site, timestamp, updatedFields } = payload;

    if (!isSiteCandidate(previousSite) || !isSiteCandidate(site)) {
        return false;
    }

    if (!hasFiniteTimestamp(timestamp)) {
        return false;
    }

    if (!Array.isArray(updatedFields)) {
        return false;
    }

    return updatedFields.every((field) => typeof field === "string");
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

            void reportPreloadGuardFailure({
                channel,
                guard: guardName,
                metadata: {
                    domain,
                    payloadType,
                },
                payloadPreview,
                reason: options.reason ?? "payload-validation",
            });
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
        testEvent: createEventManager(RENDERER_EVENT_CHANNELS.TEST_EVENT),
        updateStatus: createEventManager(RENDERER_EVENT_CHANNELS.UPDATE_STATUS),
    } as const;

    return {
        onCacheInvalidated: (
            callback: (data: CacheInvalidatedEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.cacheInvalidated,
                RENDERER_EVENT_CHANNELS.CACHE_INVALIDATED,
                isCacheInvalidatedEventDataPayload,
                callback
            ),
        onMonitorDown: (
            callback: (data: MonitorDownEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.monitorDown,
                RENDERER_EVENT_CHANNELS.MONITOR_DOWN,
                isMonitorDownEventDataPayload,
                callback
            ),
        onMonitoringStarted: (
            callback: (data: MonitoringControlEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.monitoringStarted,
                RENDERER_EVENT_CHANNELS.MONITORING_STARTED,
                isMonitoringControlEventDataPayload,
                callback
            ),
        onMonitoringStopped: (
            callback: (data: MonitoringControlEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.monitoringStopped,
                RENDERER_EVENT_CHANNELS.MONITORING_STOPPED,
                isMonitoringControlEventDataPayload,
                callback
            ),
        onMonitorStatusChanged: (
            callback: (data: MonitorStatusChangedEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.monitorStatusChanged,
                RENDERER_EVENT_CHANNELS.MONITOR_STATUS_CHANGED,
                isMonitorStatusChangedEventData,
                callback
            ),
        onMonitorUp: (
            callback: (data: MonitorUpEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.monitorUp,
                RENDERER_EVENT_CHANNELS.MONITOR_UP,
                isMonitorUpEventDataPayload,
                callback
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
                    reason: "site-added",
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
                    reason: "site-removed",
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
                    reason: "site-updated",
                }
            ),
        onTestEvent: (callback: (data: TestEventData) => void): (() => void) =>
            subscribeWithGuard(
                managers.testEvent,
                RENDERER_EVENT_CHANNELS.TEST_EVENT,
                isTestEventDataPayload,
                callback
            ),
        onUpdateStatus: (
            callback: (data: UpdateStatusEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.updateStatus,
                RENDERER_EVENT_CHANNELS.UPDATE_STATUS,
                isUpdateStatusEventDataPayload,
                callback
            ),
        removeAllListeners: (): void => {
            for (const manager of Object.values(managers)) {
                manager.removeAll();
            }
        },
    };
}
