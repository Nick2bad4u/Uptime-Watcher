import type { Site } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import { MONITOR_START_CONCURRENCY } from "../../../constants";
import {
    autoStartMonitoringIfAppropriateOperation,
    autoStartNewMonitorsOperation,
} from "../../../managers/monitorManager/autoStartMonitoring";
import { describe, expect, it, vi } from "vitest";

function createLogger(): Logger {
    return {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    } as unknown as Logger;
}

function createMonitor(id: string): Site["monitors"][number] {
    return {
        checkInterval: 5000,
        history: [],
        id,
        monitoring: true,
        responseTime: 0,
        retryAttempts: 3,
        status: "pending",
        timeout: 5000,
        type: "http",
        url: `https://example.com/${id}`,
    };
}

async function expectBoundedStarts(
    run: (
        startMonitoringForSite: (
            siteIdentifier: string,
            monitorId: string
        ) => Promise<boolean>
    ) => Promise<void>,
    expectedStarts: number
): Promise<void> {
    let active = 0;
    let maxActive = 0;
    const startMonitoringForSite = vi.fn(async () => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        await new Promise((resolve) => {
            setTimeout(resolve, 1);
        });
        active -= 1;
        return true;
    });

    await run(startMonitoringForSite);

    expect(startMonitoringForSite).toHaveBeenCalledTimes(expectedStarts);
    expect(maxActive).toBeLessThanOrEqual(MONITOR_START_CONCURRENCY);
}

describe("autoStartMonitoring", () => {
    it("bounds monitor startup fanout for loaded sites", async () => {
        const monitors = Array.from(
            { length: MONITOR_START_CONCURRENCY + 3 },
            (_, index) => createMonitor(`monitor-${index}`)
        );
        const site: Site = {
            identifier: "site-1",
            monitoring: true,
            monitors,
            name: "Site 1",
        };

        await expectBoundedStarts(
            async (startMonitoringForSite) => {
                await autoStartMonitoringIfAppropriateOperation({
                    logger: createLogger(),
                    site,
                    startMonitoringForSite,
                });
            },
            monitors.length
        );
    });

    it("bounds monitor startup fanout for newly added monitors", async () => {
        const newMonitors = Array.from(
            { length: MONITOR_START_CONCURRENCY + 3 },
            (_, index) => createMonitor(`monitor-${index}`)
        );

        await expectBoundedStarts(
            async (startMonitoringForSite) => {
                await autoStartNewMonitorsOperation({
                    logger: createLogger(),
                    newMonitors,
                    siteIdentifier: "site-1",
                    startMonitoringForSite,
                });
            },
            newMonitors.length
        );
    });
});
