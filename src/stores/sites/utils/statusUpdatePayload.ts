/**
 * Helpers for constructing status update payloads and telemetry objects.
 */

import type { RendererEventPayloadMap } from "@shared/ipc/rendererEvents";
import type { Site, StatusUpdate } from "@shared/types";

import { isDefined, isFinite as isFiniteNumber } from "ts-extras";

import type { SitesTelemetryPayload } from "./operationHelpers";
import type { MonitorStatusChangedEvent } from "./statusUpdateMerge";

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
        timestamp: new Date(event.timestamp).toISOString(),
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

function resolveFiniteNumber(value: unknown): number | undefined {
    return typeof value === "number" && isFiniteNumber(value)
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

    const monitorCount = resolveFiniteNumber(monitorCountValue);
    const siteCount = resolveFiniteNumber(siteCountValue);
    const timestamp = resolveFiniteNumber(timestampValue);
    const resolvedActiveMonitors = resolveFiniteNumber(activeMonitors);

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
