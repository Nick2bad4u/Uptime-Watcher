/**
 * Helpers for constructing status update payloads and telemetry objects.
 */

import type { RendererEventPayloadMap } from "@shared/ipc/rendererEvents";
import type { Site, StatusUpdate } from "@shared/types";

import { safeParseIsoTimestamp } from "@shared/validation/statusUpdateSchemas";
import { isDefined, isFinite as isFiniteNumber, isInteger } from "ts-extras";

import type { SitesTelemetryPayload } from "./siteTelemetryTypes";
import type { MonitorStatusChangedEvent } from "./statusUpdateMerge";

function normalizeStatusUpdateTimestamp(timestamp: string): string {
    const result = safeParseIsoTimestamp(timestamp);
    return result.success ? result.data : new Date().toISOString();
}

/**
 * Builds a {@link StatusUpdate} payload from a monitor status change event.
 */
export function buildStatusUpdatePayload(args: {
    event: MonitorStatusChangedEvent;
    site: Site;
}): StatusUpdate {
    const { event, site } = args;

    const payload: StatusUpdate = {
        monitor: event.monitor,
        monitorId: event.monitorId,
        site,
        siteIdentifier: event.siteIdentifier,
        status: event.status,
        timestamp: normalizeStatusUpdateTimestamp(event.timestamp),
    };

    if (isDefined(event.details)) {
        payload.details = event.details;
    }

    if (isDefined(event.previousStatus)) {
        payload.previousStatus = event.previousStatus;
    }

    if (isDefined(event.responseTime)) {
        payload.responseTime = event.responseTime;
    }

    return payload;
}

type MonitoringLifecycleEvent =
    | RendererEventPayloadMap["monitoring:started"]
    | RendererEventPayloadMap["monitoring:stopped"];

function resolveNonnegativeInteger(value: unknown): number | undefined {
    return typeof value === "number" &&
        isFiniteNumber(value) &&
        isInteger(value) &&
        value >= 0
        ? value
        : undefined;
}

/**
 * Builds a telemetry payload for monitoring lifecycle events.
 */
export function buildMonitoringLifecycleTelemetry(args: {
    event: MonitoringLifecycleEvent;
    phase: "started" | "stopped";
}): SitesTelemetryPayload {
    const { event, phase } = args;

    const monitorCountValue = event.monitorCount;
    const siteCountValue = event.siteCount;
    const timestampValue = event.timestamp;
    const { activeMonitors, reason } = event;

    const monitorCount = resolveNonnegativeInteger(monitorCountValue);
    const siteCount = resolveNonnegativeInteger(siteCountValue);
    const timestamp = resolveNonnegativeInteger(timestampValue);
    const resolvedActiveMonitors = resolveNonnegativeInteger(activeMonitors);

    return {
        phase,
        ...(isDefined(timestamp) && { timestamp }),
        ...(isDefined(monitorCount) && { monitorCount }),
        ...(isDefined(siteCount) && { siteCount }),
        ...(isDefined(resolvedActiveMonitors) && {
            activeMonitors: resolvedActiveMonitors,
        }),
        ...(typeof reason === "string" && { reason }),
    } satisfies SitesTelemetryPayload;
}
