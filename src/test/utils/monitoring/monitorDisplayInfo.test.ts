import { describe, expect, it } from "vitest";

import { buildMonitorDisplayInfo } from "../../../utils/monitoring/monitorDisplayInfo";
import { createMockMonitor } from "../../utils/mockFactories";

describe(buildMonitorDisplayInfo, () => {
    it("uses monitor suffix and strips wrapping parentheses", () => {
        const monitor = createMockMonitor({
            host: "api.example.com",
            type: "dns",
            url: "",
        });

        const displayInfo = buildMonitorDisplayInfo({
            fallbackIdentifier: "fallback-id",
            monitor,
        });

        expect(displayInfo.monitorTypeLabel).toBe("DNS Monitor");
        expect(displayInfo.connectionInfo).toBe("api.example.com");
    });

    it("falls back to identifier when suffix is unavailable", () => {
        const monitor = createMockMonitor({
            host: "",
            port: 0,
            type: "port",
            url: "",
        });

        const displayInfo = buildMonitorDisplayInfo({
            fallbackIdentifier: "fallback-id",
            monitor,
        });

        expect(displayInfo.connectionInfo).toBe("fallback-id");
    });

    it("returns mapped monitor type labels", () => {
        const monitor = createMockMonitor({
            type: "ping",
            url: "",
        });

        const displayInfo = buildMonitorDisplayInfo({
            fallbackIdentifier: "fallback-id",
            monitor,
        });

        expect(displayInfo.monitorTypeLabel).toBe("Ping Monitor");
    });
});
