/**
 * Tests for monitor status event validation helpers.
 */

import { describe, expect, it } from "vitest";

import type { Monitor, Site } from "@shared/types";

import {
    isEnrichedMonitorStatusChangedEventData,
    isMonitorStatusChangedEventData,
} from "@shared/validation/monitorStatusEvents";

function createValidHttpMonitor(partial: Partial<Monitor> = {}): Monitor {
    return {
        checkInterval: 30_000,
        history: [],
        id: "m1",
        lastChecked: new Date(),
        monitoring: true,
        responseTime: 100,
        retryAttempts: 3,
        status: "up",
        timeout: 5000,
        type: "http",
        url: "https://example.com",
        ...partial,
    } satisfies Monitor;
}

function createSite(): Site {
    return {
        identifier: "site-1",
        monitoring: true,
        monitors: [createValidHttpMonitor({ id: "m1" })],
        name: "Example",
    } satisfies Site;
}

describe("monitorStatusEvents", () => {
    it("returns false for non-record payloads", () => {
        expect(isMonitorStatusChangedEventData(null)).toBeFalsy();
        expect(isMonitorStatusChangedEventData("no")).toBeFalsy();
    });

    it("accepts a valid status update payload and ignores event metadata keys", () => {
        const monitor = createValidHttpMonitor({ id: "m1" });
        const site = createSite();

        const payload = {
            _meta: { emittedAt: 1 },
            _originalMeta: { source: "test" },
            monitor,
            monitorId: monitor.id,
            site,
            siteIdentifier: site.identifier,
            responseTime: monitor.responseTime,
            status: monitor.status,
            timestamp: new Date("2025-01-01T00:00:00.000Z").toISOString(),
        };

        expect(isMonitorStatusChangedEventData(payload)).toBeTruthy();
        expect(isEnrichedMonitorStatusChangedEventData(payload)).toBeTruthy();
    });

    it("returns false when the inner status update validation fails", () => {
        const payload = {
            monitorId: "",
        };

        expect(isMonitorStatusChangedEventData(payload)).toBeFalsy();
    });
});
