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
});
