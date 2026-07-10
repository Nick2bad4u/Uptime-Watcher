/**
 * Events domain API for preload bridge
 *
 * @remarks
 * This module provides event listener functions for the events domain. It
 * includes listeners for cache invalidation, monitor status, state sync, and
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
    HistoryLimitUpdatedEventData,
    MonitorCheckCompletedEventData,
    MonitoringControlEventData,
    MonitorStatusChangedEventData,
    UpdateStatusEventData,
} from "@shared/types/events";
import type { EventsDomainBridge } from "@shared/types/eventsBridge";
import type { UnknownArray } from "type-fest";

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
} from "@shared/types/events";
import { isNonNegativeSafeInteger } from "@shared/utils/typeGuards";
import { safeParseUpdateStatusEventData } from "@shared/validation/updateStatusSchemas";
import { isMonitorStatusChangedEventData } from "@shared/validation/monitorStatusEvents";
import { monitorIdSchema } from "@shared/validation/monitorFieldSchemas";
import { siteIdentifierSchema } from "@shared/validation/siteFieldSchemas";
import { isDefined, objectValues } from "ts-extras";

import { createEventManager } from "../core/bridgeFactory";
import {
    createStringUnionGuard,
    hasFiniteTimestamp,
    isUnknownRecord,
} from "../utils/eventsGuardHelpers";
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
type EventPayloadMapper<TPayload> = (payload: unknown) => TPayload | undefined;

const RENDERER_EVENT_CHANNEL_VALUES: readonly RendererEventChannel[] =
    objectValues(RENDERER_EVENT_CHANNELS);

const isRendererEventChannel = createStringUnionGuard(
    RENDERER_EVENT_CHANNEL_VALUES
);

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

const isCacheInvalidationReason = createStringUnionGuard(
    CACHE_INVALIDATION_REASON_VALUES
);

const isCacheInvalidationType = createStringUnionGuard(
    CACHE_INVALIDATION_TYPE_VALUES
);

const isMonitoringControlReason = createStringUnionGuard(
    MONITORING_CONTROL_REASON_VALUES
);

const isMonitorCheckType = (
    value: unknown
): value is MonitorCheckCompletedEventData["checkType"] =>
    value === "manual" || value === "scheduled";

const isCacheInvalidatedEventDataPayload = (
    payload: unknown
): payload is CacheInvalidatedEventData => {
    if (!isUnknownRecord(payload)) {
        return false;
    }

    const { identifier, reason, timestamp, type } = payload;

    if (isDefined(identifier) && typeof identifier !== "string") {
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

    if (!isDefined(identifier)) {
        return true;
    }

    if (type === "site") {
        return siteIdentifierSchema.safeParse(identifier).success;
    }

    if (type === "monitor") {
        return monitorIdSchema.safeParse(identifier).success;
    }

    return true;
};

const mapCacheInvalidatedEventDataPayload = (
    payload: unknown
): CacheInvalidatedEventData | undefined => {
    if (!isCacheInvalidatedEventDataPayload(payload)) {
        return undefined;
    }

    return isDefined(payload.identifier)
        ? {
              identifier: payload.identifier,
              reason: payload.reason,
              timestamp: payload.timestamp,
              type: payload.type,
          }
        : {
              reason: payload.reason,
              timestamp: payload.timestamp,
              type: payload.type,
          };
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

    if (
        isDefined(activeMonitors) &&
        !isNonNegativeSafeInteger(activeMonitors)
    ) {
        return false;
    }

    if (isDefined(monitorCount) && !isNonNegativeSafeInteger(monitorCount)) {
        return false;
    }

    if (isDefined(siteCount) && !isNonNegativeSafeInteger(siteCount)) {
        return false;
    }

    if (!isDefined(reason)) {
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
        isNonNegativeSafeInteger(payload.monitorCount) &&
        isNonNegativeSafeInteger(payload.siteCount)
    );
};

const isMonitoringStoppedEventDataPayload = (
    payload: unknown
): payload is MonitoringStoppedEventDataPayload => {
    if (!isMonitoringControlEventDataPayload(payload)) {
        return false;
    }

    if (
        !isNonNegativeSafeInteger(payload.activeMonitors) ||
        typeof payload.reason !== "string"
    ) {
        return false;
    }

    return isMonitoringControlReason(payload.reason);
};

const isStateSyncEventDataPayload = (
    payload: unknown
): payload is StateSyncEventDataPayload => isStateSyncEventData(payload);

const isUpdateStatusEventDataPayload = (
    payload: unknown
): payload is UpdateStatusEventData =>
    safeParseUpdateStatusEventData(payload).success;

const mapUpdateStatusEventDataPayload = (
    payload: unknown
): UpdateStatusEventData | undefined => {
    if (!isUpdateStatusEventDataPayload(payload)) {
        return undefined;
    }

    return isDefined(payload.error)
        ? {
              error: payload.error,
              ...(isDefined(payload.revision) && {
                  revision: payload.revision,
              }),
              status: payload.status,
          }
        : {
              ...(isDefined(payload.revision) && {
                  revision: payload.revision,
              }),
              status: payload.status,
          };
};

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

    const parsedMonitorId = monitorIdSchema.safeParse(monitorId);
    if (!parsedMonitorId.success) {
        return false;
    }

    const parsedSiteIdentifier = siteIdentifierSchema.safeParse(siteIdentifier);
    if (!parsedSiteIdentifier.success) {
        return false;
    }

    if (!hasFiniteTimestamp(timestamp)) {
        return false;
    }

    if (!isMonitorStatusChangedEventData(result)) {
        return false;
    }

    return (
        parsedMonitorId.data === result.monitorId &&
        parsedSiteIdentifier.data === result.siteIdentifier
    );
};

const mapMonitorCheckCompletedEventDataPayload = (
    payload: unknown
): MonitorCheckCompletedEventDataPayload | undefined => {
    if (!isMonitorCheckCompletedEventDataPayload(payload)) {
        return undefined;
    }

    return {
        checkType: payload.checkType,
        monitorId: payload.monitorId,
        result: payload.result,
        siteIdentifier: payload.siteIdentifier,
        timestamp: payload.timestamp,
    };
};

const isHistoryLimitUpdatedEventDataPayload = (
    payload: unknown
): payload is HistoryLimitUpdatedEventDataPayload => {
    if (!isUnknownRecord(payload)) {
        return false;
    }

    const { limit, operation, previousLimit, timestamp } = payload;

    // History limit event values are emitted after shared normalization:
    // nonnegative safe integers, with 0 representing unlimited retention.
    if (!isNonNegativeSafeInteger(limit)) {
        return false;
    }

    if (operation !== "history-limit-updated") {
        return false;
    }

    if (!hasFiniteTimestamp(timestamp)) {
        return false;
    }

    return !isDefined(previousLimit) || isNonNegativeSafeInteger(previousLimit);
};

const mapHistoryLimitUpdatedEventDataPayload = (
    payload: unknown
): HistoryLimitUpdatedEventDataPayload | undefined => {
    if (!isHistoryLimitUpdatedEventDataPayload(payload)) {
        return undefined;
    }

    return isDefined(payload.previousLimit)
        ? {
              limit: payload.limit,
              operation: payload.operation,
              previousLimit: payload.previousLimit,
              timestamp: payload.timestamp,
          }
        : {
              limit: payload.limit,
              operation: payload.operation,
              timestamp: payload.timestamp,
          };
};

interface GuardSubscriptionOptions<TPayload> {
    readonly domain?: string;
    readonly guardName?: string;
    readonly mapPayload?: EventPayloadMapper<TPayload>;
}

const subscribeWithGuard = <TPayload>(
    manager: EventManager,
    channel: RendererEventChannel,
    guard: EventGuard<TPayload>,
    callback: (payload: TPayload) => void,
    options: GuardSubscriptionOptions<TPayload> = {}
): (() => void) =>
    manager.on((...args: unknown[]) => {
        const [payload] = args;
        const validatedPayload = (() => {
            try {
                if (options.mapPayload) {
                    return options.mapPayload(payload);
                }

                return guard(payload) ? payload : undefined;
            } catch {
                return undefined;
            }
        })();

        if (validatedPayload === undefined) {
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
                reason: "payload-validation",
                ...(payloadPreview && { payloadPreview }),
            };

            void reportPreloadGuardFailure(guardFailureContext);
            return;
        }
        callback(validatedPayload);
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
        monitoringStarted: createEventManager(
            RENDERER_EVENT_CHANNELS.MONITORING_STARTED
        ),
        monitoringStopped: createEventManager(
            RENDERER_EVENT_CHANNELS.MONITORING_STOPPED
        ),
        monitorStatusChanged: createEventManager(
            RENDERER_EVENT_CHANNELS.MONITOR_STATUS_CHANGED
        ),
        stateSync: createEventManager(RENDERER_EVENT_CHANNELS.STATE_SYNC),
        updateStatus: createEventManager(RENDERER_EVENT_CHANNELS.UPDATE_STATUS),
    } as const;

    const managersByChannel = new Map<RendererEventChannel, EventManager>([
        [RENDERER_EVENT_CHANNELS.CACHE_INVALIDATED, managers.cacheInvalidated],
        [
            RENDERER_EVENT_CHANNELS.MONITOR_CHECK_COMPLETED,
            managers.monitorCheckCompleted,
        ],
        [
            RENDERER_EVENT_CHANNELS.MONITOR_STATUS_CHANGED,
            managers.monitorStatusChanged,
        ],
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
        [RENDERER_EVENT_CHANNELS.STATE_SYNC, managers.stateSync],
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
                    mapPayload: mapCacheInvalidatedEventDataPayload,
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
                    mapPayload: mapHistoryLimitUpdatedEventDataPayload,
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
                    mapPayload: mapMonitorCheckCompletedEventDataPayload,
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
                    mapPayload: mapUpdateStatusEventDataPayload,
                }
            ),
        removeAllListeners: (...args: Readonly<UnknownArray>): void => {
            const [candidate] = args;

            if (!isDefined(candidate)) {
                for (const manager of objectValues(managers)) {
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
