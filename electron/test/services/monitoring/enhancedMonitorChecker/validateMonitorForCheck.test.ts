import type { Monitor, Site } from "@shared/types";

import { describe, expect, it, vi } from "vitest";

import { validateMonitorForCheck } from "../../../../services/monitoring/enhancedMonitorChecker/validateMonitorForCheck";

const createSite = (identifier: string): Site => ({
    identifier,
    monitoring: true,
    monitors: [],
    name: "Example",
});

const createMonitor = (id: string): Monitor => ({
    activeOperations: [],
    checkInterval: 30_000,
    history: [],
    id,
    monitoring: true,
    responseTime: 0,
    retryAttempts: 0,
    status: "pending",
    timeout: 5000,
    type: "http",
    url: "https://example.com",
});

describe(validateMonitorForCheck, () => {
    const rawMonitorId =
        "https://monitor.example/check?token=monitor-token#private-monitor";
    const rawSiteIdentifier =
        "https://user:site-secret@example.com/path?access_token=site-token#private-site";

    it("redacts URL-shaped identifiers when the monitor is missing", () => {
        const logger = { error: vi.fn() };

        expect(
            validateMonitorForCheck(
                logger as never,
                undefined,
                createSite(rawSiteIdentifier),
                rawMonitorId
            )
        ).toBeFalsy();

        const logPayload = JSON.stringify(logger.error.mock.calls);
        expect(logPayload).toContain("https://example.com/path");
        expect(logPayload).toContain("https://monitor.example/check");
        expect(logPayload).not.toContain("site-secret");
        expect(logPayload).not.toContain("site-token");
        expect(logPayload).not.toContain("private-site");
        expect(logPayload).not.toContain("monitor-token");
        expect(logPayload).not.toContain("private-monitor");
    });

    it("redacts URL-shaped site identifiers when the monitor id is missing", () => {
        const logger = { error: vi.fn() };

        expect(
            validateMonitorForCheck(
                logger as never,
                createMonitor(""),
                createSite(rawSiteIdentifier),
                rawMonitorId
            )
        ).toBeFalsy();

        const logPayload = JSON.stringify(logger.error.mock.calls);
        expect(logPayload).toContain("https://example.com/path");
        expect(logPayload).not.toContain("site-secret");
        expect(logPayload).not.toContain("site-token");
        expect(logPayload).not.toContain("private-site");
    });
});
