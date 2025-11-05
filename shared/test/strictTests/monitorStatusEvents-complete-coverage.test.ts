/**
 * Exhaustive coverage for monitor status event validation guards.
 */

import { STATUS_KIND } from "@shared/types";
import { describe, expect, it } from "vitest";

import {
    isEnrichedMonitorStatusChangedEventData,
    isMonitorStatusChangedEventData,
} from "@shared/validation/monitorStatusEvents";

const createBasePayload = () => ({
    details: "Status updated",
    monitor: {
        id: "monitor-1",
        status: STATUS_KIND.UP,
    },
    monitorId: "monitor-1",
    previousStatus: STATUS_KIND.DOWN,
    responseTime: 250,
    site: {
        identifier: "site-1",
        name: "Example Site",
    },
    siteIdentifier: "site-1",
    status: STATUS_KIND.UP,
    timestamp: new Date().toISOString(),
});

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
        const payload = {
            ...createBasePayload(),
            monitor: { id: "monitor-1" },
            site: { identifier: "site-1" },
        };

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
