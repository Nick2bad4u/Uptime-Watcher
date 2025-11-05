/**
 * Shared validation helpers for monitor status changed events.
 *
 * @remarks
 * Provides runtime type guards for the canonical monitor status changed event
 * payload that flows across the backend, preload, and renderer layers.
 *
 * @packageDocumentation
 */

import type { MonitorStatusChangedEventData } from "@shared/types/events";

import { isMonitorStatus } from "@shared/types";

const isUnknownRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

/**
 * Type guard that validates the base monitor status changed event payload.
 *
 * @param payload - Unknown payload received from an event emitter.
 *
 * @returns True when the payload conforms to
 *   {@link MonitorStatusChangedEventData}.
 */
export const isMonitorStatusChangedEventData = (
    payload: unknown
): payload is MonitorStatusChangedEventData => {
    if (!isUnknownRecord(payload)) {
        return false;
    }

    const {
        details,
        monitor,
        monitorId,
        previousStatus,
        responseTime,
        site,
        siteIdentifier,
        status,
        timestamp,
    } = payload;

    if (
        typeof monitorId !== "string" ||
        typeof siteIdentifier !== "string" ||
        typeof status !== "string" ||
        !isMonitorStatus(status) ||
        typeof timestamp !== "string"
    ) {
        return false;
    }

    if (details !== undefined && typeof details !== "string") {
        return false;
    }

    if (
        previousStatus !== undefined &&
        (typeof previousStatus !== "string" || !isMonitorStatus(previousStatus))
    ) {
        return false;
    }

    if (responseTime !== undefined && typeof responseTime !== "number") {
        return false;
    }

    if (!isUnknownRecord(monitor) || !isUnknownRecord(site)) {
        return false;
    }

    return true;
};

/**
 * Type guard that validates enriched monitor status events containing full
 * monitor and site objects.
 *
 * @param payload - Unknown payload received from an event emitter.
 *
 * @returns True when the payload contains complete monitor and site context in
 *   addition to the base monitor status fields.
 */
export const isEnrichedMonitorStatusChangedEventData = (
    payload: unknown
): payload is MonitorStatusChangedEventData & {
    monitor: Record<string, unknown>;
    site: Record<string, unknown>;
} => isMonitorStatusChangedEventData(payload);
