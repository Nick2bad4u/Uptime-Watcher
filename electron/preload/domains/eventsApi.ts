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
    MonitorDownEventData,
    MonitoringControlEventData,
    MonitorLifecycleEventData,
    MonitorStatusChangedEventData,
    MonitorUpEventData,
    TestEventData,
    UpdateStatusEventData,
} from "@shared/types/events";
import type { EventsDomainBridge } from "@shared/types/eventsBridge";

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

const CACHE_INVALIDATION_REASON_VALUES = [
    "delete",
    "expiry",
    "manual",
    "update",
] as const satisfies ReadonlyArray<CacheInvalidatedEventData["reason"]>;
const CACHE_INVALIDATION_TYPE_VALUES = [
    "all",
    "monitor",
    "site",
] as const satisfies ReadonlyArray<CacheInvalidatedEventData["type"]>;
const MONITORING_CONTROL_REASON_VALUES = [
    "error",
    "shutdown",
    "user",
] as const satisfies ReadonlyArray<
    NonNullable<MonitoringControlEventData["reason"]>
>;
const UPDATE_STATUS_VALUES = [
    "available",
    "checking",
    "downloaded",
    "downloading",
    "error",
    "idle",
] as const satisfies ReadonlyArray<UpdateStatusEventData["status"]>;

const CACHE_INVALIDATION_REASONS = new Set<string>(
    CACHE_INVALIDATION_REASON_VALUES
);
const CACHE_INVALIDATION_TYPES = new Set<string>(
    CACHE_INVALIDATION_TYPE_VALUES
);
const MONITORING_CONTROL_REASONS = new Set<string>(
    MONITORING_CONTROL_REASON_VALUES
);
const UPDATE_STATUS_SET = new Set<string>(UPDATE_STATUS_VALUES);
const isCacheInvalidationReason = (
    value: unknown
): value is CacheInvalidatedEventData["reason"] =>
    typeof value === "string" && CACHE_INVALIDATION_REASONS.has(value);

const isCacheInvalidationType = (
    value: unknown
): value is CacheInvalidatedEventData["type"] =>
    typeof value === "string" && CACHE_INVALIDATION_TYPES.has(value);

const isMonitoringControlReason = (
    value: unknown
): value is NonNullable<MonitoringControlEventData["reason"]> =>
    typeof value === "string" && MONITORING_CONTROL_REASONS.has(value);

const isUpdateStatus = (
    value: unknown
): value is UpdateStatusEventData["status"] =>
    typeof value === "string" && UPDATE_STATUS_SET.has(value);

const isUnknownRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

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

interface GuardSubscriptionOptions {
    readonly domain?: string;
    readonly guardName?: string;
    readonly reason?: string;
}

const subscribeWithGuard = <TPayload>(
    manager: EventManager,
    channel: string,
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
        cacheInvalidated: createEventManager("cache:invalidated"),
        monitorDown: createEventManager("monitor:down"),
        monitoringStarted: createEventManager("monitoring:started"),
        monitoringStopped: createEventManager("monitoring:stopped"),
        monitorStatusChanged: createEventManager("monitor:status-changed"),
        monitorUp: createEventManager("monitor:up"),
        testEvent: createEventManager("test-event"),
        updateStatus: createEventManager("update-status"),
    } as const;

    return {
        onCacheInvalidated: (
            callback: (data: CacheInvalidatedEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.cacheInvalidated,
                "cache:invalidated",
                isCacheInvalidatedEventDataPayload,
                callback
            ),
        onMonitorDown: (
            callback: (data: MonitorDownEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.monitorDown,
                "monitor:down",
                isMonitorDownEventDataPayload,
                callback
            ),
        onMonitoringStarted: (
            callback: (data: MonitoringControlEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.monitoringStarted,
                "monitoring:started",
                isMonitoringControlEventDataPayload,
                callback
            ),
        onMonitoringStopped: (
            callback: (data: MonitoringControlEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.monitoringStopped,
                "monitoring:stopped",
                isMonitoringControlEventDataPayload,
                callback
            ),
        onMonitorStatusChanged: (
            callback: (data: MonitorStatusChangedEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.monitorStatusChanged,
                "monitor:status-changed",
                isMonitorStatusChangedEventData,
                callback
            ),
        onMonitorUp: (
            callback: (data: MonitorUpEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.monitorUp,
                "monitor:up",
                isMonitorUpEventDataPayload,
                callback
            ),
        onTestEvent: (callback: (data: TestEventData) => void): (() => void) =>
            subscribeWithGuard(
                managers.testEvent,
                "test-event",
                isTestEventDataPayload,
                callback
            ),
        onUpdateStatus: (
            callback: (data: UpdateStatusEventData) => void
        ): (() => void) =>
            subscribeWithGuard(
                managers.updateStatus,
                "update-status",
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
