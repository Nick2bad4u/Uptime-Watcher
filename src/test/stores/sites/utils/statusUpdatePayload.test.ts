import { describe, expect, it } from "vitest";

import { buildMonitoringLifecycleTelemetry } from "../../../../stores/sites/utils/statusUpdatePayload";

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
