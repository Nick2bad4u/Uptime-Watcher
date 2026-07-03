import type { Monitor, Site } from "@shared/types";

import { describe, expect, it, vi } from "vitest";

import {
    buildMonitoringLifecycleTelemetry,
    buildStatusUpdatePayload,
} from "../../../../stores/sites/utils/statusUpdatePayload";
import type { MonitorStatusChangedEvent } from "../../../../stores/sites/utils/statusUpdateMerge";

const createMonitor = (overrides: Partial<Monitor> = {}): Monitor => ({
    checkInterval: 60_000,
    history: [],
    id: "monitor-1",
    monitoring: true,
    responseTime: 100,
    retryAttempts: 3,
    status: "up",
    timeout: 30_000,
    type: "http",
    url: "https://example.com",
    ...overrides,
});

const createSite = (monitor: Monitor): Site => ({
    identifier: "site-1",
    monitoring: true,
    monitors: [monitor],
    name: "Site 1",
});

const createStatusChangedEvent = (
    overrides: Partial<MonitorStatusChangedEvent> = {}
): MonitorStatusChangedEvent => {
    const monitor = createMonitor();
    const site = createSite(monitor);

    return {
        monitor,
        monitorId: monitor.id,
        site,
        siteIdentifier: site.identifier,
        status: "down",
        timestamp: "2026-07-03T00:00:00.000Z",
        ...overrides,
    };
};

describe(buildStatusUpdatePayload, () => {
    it("trims valid ISO timestamps", () => {
        const event = createStatusChangedEvent({
            timestamp: "  2026-07-03T00:00:00.000Z  ",
        });

        const payload = buildStatusUpdatePayload({
            event,
            site: event.site,
        });

        expect(payload.timestamp).toBe("2026-07-03T00:00:00.000Z");
    });

    it("falls back to the current time for impossible timestamp strings", () => {
        const fallback = new Date("2026-07-03T09:10:00.000Z");
        vi.useFakeTimers();

        try {
            vi.setSystemTime(fallback);
            const event = createStatusChangedEvent({
                timestamp: "2026-02-30T00:00:00.000Z",
            });

            const payload = buildStatusUpdatePayload({
                event,
                site: event.site,
            });

            expect(payload.timestamp).toBe(fallback.toISOString());
        } finally {
            vi.useRealTimers();
        }
    });
});

describe(buildMonitoringLifecycleTelemetry, () => {
    it("omits non-finite numeric telemetry fields", () => {
        const payload = buildMonitoringLifecycleTelemetry({
            event: {
                activeMonitors: Infinity,
                monitorCount: Number.NaN,
                siteCount: -Infinity,
                timestamp: Infinity,
            },
            phase: "stopped",
        });

        expect(payload).toEqual({
            phase: "stopped",
        });
    });

    it("keeps finite numeric telemetry fields", () => {
        const payload = buildMonitoringLifecycleTelemetry({
            event: {
                activeMonitors: 1,
                monitorCount: 2,
                reason: "user",
                siteCount: 3,
                timestamp: 1_719_000_000_000,
            },
            phase: "stopped",
        });

        expect(payload).toEqual({
            activeMonitors: 1,
            monitorCount: 2,
            phase: "stopped",
            reason: "user",
            siteCount: 3,
            timestamp: 1_719_000_000_000,
        });
    });
});
