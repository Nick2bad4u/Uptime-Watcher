import type { Monitor, Site } from "@shared/types";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    applyStatusUpdateSnapshot,
    type StatusUpdateSnapshotPayload,
} from "../../../../stores/sites/utils/statusUpdateSnapshot";
import type { MonitorStatusChangedEvent } from "../../../../stores/sites/utils/statusUpdateMerge";

const mergeMonitorStatusChangeMock = vi.hoisted(() =>
    vi.fn((sites: Site[], _event: MonitorStatusChangedEvent) => sites)
);

vi.mock("../../../../services/logger", () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock("../../../../stores/sites/utils/statusUpdateMerge", () => ({
    mergeMonitorStatusChange: mergeMonitorStatusChangeMock,
}));

const createMonitor = (overrides: Partial<Monitor> = {}): Monitor => ({
    checkInterval: overrides.checkInterval ?? 60_000,
    history: overrides.history ?? [],
    id: overrides.id ?? "monitor-timestamp",
    lastChecked: overrides.lastChecked ?? new Date("2026-07-03T00:00:00.000Z"),
    monitoring: overrides.monitoring ?? true,
    responseTime: overrides.responseTime ?? 100,
    retryAttempts: overrides.retryAttempts ?? 3,
    status: overrides.status ?? "up",
    timeout: overrides.timeout ?? 30_000,
    type: overrides.type ?? "http",
    url: overrides.url ?? "https://status.example.com",
    ...overrides,
});

const createSite = (monitor: Monitor): Site => ({
    identifier: "site-timestamp",
    monitors: [monitor],
    monitoring: true,
    name: "Timestamp Site",
});

function createPayload(
    timestamp: StatusUpdateSnapshotPayload["timestamp"]
): StatusUpdateSnapshotPayload {
    const monitor = createMonitor();

    return {
        monitor,
        monitorId: monitor.id,
        site: createSite(monitor),
        siteIdentifier: "site-timestamp",
        status: "down",
        timestamp,
    };
}

function getMergedEvent(): MonitorStatusChangedEvent {
    const event = mergeMonitorStatusChangeMock.mock.calls[0]?.[1];
    expect(event).toBeDefined();

    if (!event) {
        throw new Error(
            "Expected mergeMonitorStatusChange to receive an event"
        );
    }

    return event;
}

function getPayloadSite(payload: StatusUpdateSnapshotPayload): Site {
    expect(payload.site).toBeDefined();

    if (!payload.site) {
        throw new Error("Expected payload site to be defined");
    }

    return payload.site;
}

describe(applyStatusUpdateSnapshot, () => {
    const fallbackNow = new Date("2026-07-03T09:30:00.000Z");

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(fallbackNow);
        mergeMonitorStatusChangeMock.mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("preserves finite Date timestamps", () => {
        const timestamp = new Date("2026-07-03T09:15:00.000Z");
        const payload = createPayload(timestamp);

        applyStatusUpdateSnapshot([getPayloadSite(payload)], payload);

        expect(getMergedEvent().timestamp).toBe(timestamp.toISOString());
    });

    it("falls back for impossible ISO-like timestamp strings", () => {
        const payload = createPayload("2026-02-30T00:00:00.000Z");

        applyStatusUpdateSnapshot([getPayloadSite(payload)], payload);

        expect(getMergedEvent().timestamp).toBe(fallbackNow.toISOString());
    });

    it("falls back for loose timestamp strings", () => {
        const payload = createPayload("July 3, 2026");

        applyStatusUpdateSnapshot([getPayloadSite(payload)], payload);

        expect(getMergedEvent().timestamp).toBe(fallbackNow.toISOString());
    });
});
