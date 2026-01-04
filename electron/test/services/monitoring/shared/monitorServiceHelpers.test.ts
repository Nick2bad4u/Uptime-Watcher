import { describe, expect, it } from "vitest";

import { STATUS_KIND, type Monitor } from "@shared/types";

import { validateMonitorUrl } from "../../../../services/monitoring/shared/monitorServiceHelpers";

function createMonitorWithUrl(url: string): Monitor {
    return {
        checkInterval: 60_000,
        history: [],
        id: "m-test",
        monitoring: true,
        responseTime: 0,
        retryAttempts: 0,
        status: STATUS_KIND.UP,
        timeout: 10_000,
        type: "http",
        url,
    };
}

describe(validateMonitorUrl, () => {
    it("accepts http/https URLs", () => {
        expect(validateMonitorUrl(createMonitorWithUrl("https://example.com")))
            .toBeNull();
        expect(
            validateMonitorUrl(
                createMonitorWithUrl("http://localhost:1234/health")
            )
        ).toBeNull();
    });

    it("rejects non-http protocols", () => {
        expect(validateMonitorUrl(createMonitorWithUrl("ftp://example.com")))
            .not.toBeNull();
    });
});
