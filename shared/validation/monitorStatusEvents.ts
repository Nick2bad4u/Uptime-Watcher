/**
 * Shared validation helpers for monitor status changed events.
 *
 * @remarks
 * Provides runtime type guards for the canonical monitor status changed event
 * payload that flows across the backend, preload, and renderer layers.
 *
 * @packageDocumentation
 */

import type { Monitor, Site } from "@shared/types";
import type { MonitorStatusChangedEventData } from "@shared/types/events";
import type { UnknownRecord } from "type-fest";

import { validateStatusUpdate } from "./guards";

const isUnknownRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const stripEventMetadata = (value: UnknownRecord): UnknownRecord => {
    if (!Reflect.has(value, "_meta") && !Reflect.has(value, "_originalMeta")) {
        return value;
    }

    const sanitizedRecord: UnknownRecord = { ...value };

    if (Reflect.has(sanitizedRecord, "_meta")) {
        Reflect.deleteProperty(sanitizedRecord, "_meta");
    }

    if (Reflect.has(sanitizedRecord, "_originalMeta")) {
        Reflect.deleteProperty(sanitizedRecord, "_originalMeta");
    }

    return sanitizedRecord;
};

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

    const sanitizedCandidate = stripEventMetadata(payload);
    const validationResult = validateStatusUpdate(sanitizedCandidate);

    return validationResult.success;
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
    monitor: Monitor;
    site: Site;
} => isMonitorStatusChangedEventData(payload);
