/**
 * Exhaustive coverage for monitor status event validation guards.
 */

import { STATUS_KIND, type Monitor, type Site } from "@shared/types";
import type { MonitorStatusChangedEventData } from "@shared/types/events";
import { describe, expect, it } from "vitest";
import {
    sampleOne,
    siteNameArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";

import {
    isEnrichedMonitorStatusChangedEventData,
    isMonitorStatusChangedEventData,
} from "@shared/validation/monitorStatusEvents";

const createMonitorSnapshot = (): Monitor => ({
    checkInterval: 60_000,
    history: [],
    id: "monitor-1",
    monitoring: true,
    responseTime: 120,
    retryAttempts: 0,
    status: STATUS_KIND.UP,
    timeout: 30_000,
    type: "http",
    url: "https://example.com",
});

const createSiteSnapshot = (monitor: Monitor): Site => ({
    identifier: "site-1",
    monitoring: true,
    monitors: [monitor],
    name: sampleOne(siteNameArbitrary),
});

const createBasePayload = () => {
    const monitor = createMonitorSnapshot();
    const site = createSiteSnapshot(monitor);

    return {
        details: "Status updated",
        monitor,
        monitorId: monitor.id,
        previousStatus: STATUS_KIND.DOWN,
        responseTime: 250,
        site,
        siteIdentifier: site.identifier,
        status: STATUS_KIND.UP,
        timestamp: new Date().toISOString(),
    } satisfies MonitorStatusChangedEventData;
};

describe(isMonitorStatusChangedEventData, () => {
    it("rejects non-object payloads", () => {
        expect(isMonitorStatusChangedEventData(null)).toBeFalsy();
        expect(isMonitorStatusChangedEventData("payload")).toBeFalsy();
    });

    it("accepts canonical payloads", () => {
        const payload = createBasePayload();

        expect(isMonitorStatusChangedEventData(payload)).toBeTruthy();
    });

    it("requires valid identifiers and monitor status", () => {
        const invalidStatusPayload = {
            ...createBasePayload(),
            status: "UNKNOWN",
        };

        expect(
            isMonitorStatusChangedEventData(invalidStatusPayload)
        ).toBeFalsy();

        const invalidIdentifierPayload = {
            ...createBasePayload(),
            monitorId: 42,
        };

        expect(
            isMonitorStatusChangedEventData(invalidIdentifierPayload)
        ).toBeFalsy();
    });

    it("requires optional fields to use the correct types", () => {
        const invalidPreviousStatus = {
            ...createBasePayload(),
            previousStatus: "UNKNOWN",
        };

        const invalidResponseTime = {
            ...createBasePayload(),
            responseTime: "fast",
        };

        const invalidMonitor = {
            ...createBasePayload(),
            monitor: 123,
        };

        const invalidSite = {
            ...createBasePayload(),
            site: "site",
        };

        expect(
            isMonitorStatusChangedEventData(invalidPreviousStatus)
        ).toBeFalsy();
        expect(
            isMonitorStatusChangedEventData(invalidResponseTime)
        ).toBeFalsy();
        expect(isMonitorStatusChangedEventData(invalidMonitor)).toBeFalsy();
        expect(isMonitorStatusChangedEventData(invalidSite)).toBeFalsy();
    });
});

describe(isEnrichedMonitorStatusChangedEventData, () => {
    it("requires both monitor and site records", () => {
        const payload = createBasePayload();

        expect(isEnrichedMonitorStatusChangedEventData(payload)).toBeTruthy();

        const { site: _site, ...withoutSite } = createBasePayload();
        const { monitor: _monitor, ...withoutMonitor } = createBasePayload();

        expect(
            isEnrichedMonitorStatusChangedEventData(withoutSite)
        ).toBeFalsy();
        expect(
            isEnrichedMonitorStatusChangedEventData(withoutMonitor)
        ).toBeFalsy();
    });
});
