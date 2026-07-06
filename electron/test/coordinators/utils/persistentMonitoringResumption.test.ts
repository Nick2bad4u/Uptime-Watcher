import type { Monitor, Site } from "@shared/types";

import { MONITOR_START_CONCURRENCY } from "../../../constants";
import {
    collectMonitorsToResume,
    resumeMonitoringCandidates,
} from "../../../coordinators/utils/persistentMonitoringResumption";
import { describe, expect, it, vi } from "vitest";

function createMonitor(id: string, monitoring = true): Monitor {
    return {
        checkInterval: 5000,
        history: [],
        id,
        monitoring,
        responseTime: 0,
        retryAttempts: 3,
        status: "pending",
        timeout: 5000,
        type: "http",
        url: `https://example.com/${id}`,
    };
}

function createSite(identifier: string, monitors: Monitor[]): Site {
    return {
        identifier,
        monitoring: true,
        monitors,
        name: identifier,
    };
}

describe("persistentMonitoringResumption", () => {
    const rawMonitorId =
        "https://monitor.example/check?token=monitor-token#private-monitor";
    const rawSiteIdentifier =
        "https://user:site-secret@example.com/path?access_token=site-token#private-site";

    it("collects only monitors enabled under enabled sites", () => {
        const enabledSite = createSite("enabled", [
            createMonitor("active"),
            createMonitor("inactive", false),
        ]);
        const disabledSite = {
            ...createSite("disabled", [createMonitor("ignored")]),
            monitoring: false,
        };

        expect(collectMonitorsToResume([enabledSite, disabledSite])).toEqual([
            {
                monitor: enabledSite.monitors[0],
                site: enabledSite,
            },
        ]);
    });

    it("bounds concurrent monitor resume attempts", async () => {
        const candidates = Array.from(
            { length: MONITOR_START_CONCURRENCY + 3 },
            (_, index) => ({
                monitor: createMonitor(`monitor-${index}`),
                site: createSite(`site-${index}`, []),
            })
        );
        let active = 0;
        let maxActive = 0;

        const result = await resumeMonitoringCandidates({
            candidates,
            logger: {
                debug: vi.fn(),
                error: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
            },
            startMonitoringForSite: vi.fn(async () => {
                active += 1;
                maxActive = Math.max(maxActive, active);
                await new Promise((resolve) => {
                    setTimeout(resolve, 1);
                });
                active -= 1;
                return true;
            }),
        });

        expect(result).toEqual({
            attempted: candidates.length,
            succeeded: candidates.length,
        });
        expect(maxActive).toBeLessThanOrEqual(MONITOR_START_CONCURRENCY);
    });

    it.each([
        ["debug", true],
        ["warn", false],
    ] as const)(
        "redacts URL-shaped resume %s log identifiers",
        async (logMethod, isSuccess) => {
            const logger = {
                debug: vi.fn(),
                error: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
            };

            const result = await resumeMonitoringCandidates({
                candidates: [
                    {
                        monitor: createMonitor(rawMonitorId),
                        site: createSite(rawSiteIdentifier, []),
                    },
                ],
                logger,
                startMonitoringForSite: vi.fn().mockResolvedValue(isSuccess),
            });

            expect(result).toEqual({
                attempted: 1,
                succeeded: isSuccess ? 1 : 0,
            });

            const logPayload = JSON.stringify(logger[logMethod].mock.calls);

            expect(logPayload).toContain("https://example.com/path");
            expect(logPayload).toContain("https://monitor.example/check");
            expect(logPayload).not.toContain("site-secret");
            expect(logPayload).not.toContain("site-token");
            expect(logPayload).not.toContain("private-site");
            expect(logPayload).not.toContain("monitor-token");
            expect(logPayload).not.toContain("private-monitor");
        }
    );

    it("redacts URL-shaped resume error log identifiers", async () => {
        const logger = {
            debug: vi.fn(),
            error: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
        };

        const result = await resumeMonitoringCandidates({
            candidates: [
                {
                    monitor: createMonitor(rawMonitorId),
                    site: createSite(rawSiteIdentifier, []),
                },
            ],
            logger,
            startMonitoringForSite: vi
                .fn()
                .mockRejectedValue(new Error("resume failed")),
        });

        expect(result).toEqual({
            attempted: 1,
            succeeded: 0,
        });

        const logPayload = JSON.stringify(logger.error.mock.calls);

        expect(logPayload).toContain("https://example.com/path");
        expect(logPayload).toContain("https://monitor.example/check");
        expect(logPayload).not.toContain("site-secret");
        expect(logPayload).not.toContain("site-token");
        expect(logPayload).not.toContain("private-site");
        expect(logPayload).not.toContain("monitor-token");
        expect(logPayload).not.toContain("private-monitor");
    });
});
