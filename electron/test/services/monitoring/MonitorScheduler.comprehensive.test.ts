import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:crypto", () => ({
    randomInt: vi.fn().mockReturnValue(0),
}));

vi.unmock("../../../services/monitoring/MonitorScheduler");

import type { Site } from "@shared/types";

import { DEFAULT_CHECK_INTERVAL } from "../../../constants";
import { MonitorScheduler } from "../../../services/monitoring/MonitorScheduler";
import { MONITOR_TIMEOUT_BUFFER_MS } from "../../../services/monitoring/constants";
import { isDev } from "../../../electronUtils";
import { logger } from "../../../utils/logger";

vi.mock("../../../electronUtils");
vi.mock("../../../utils/logger", () => {
    const createLoggerMock = () => ({
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
    });

    return {
        logger: createLoggerMock(),
        dbLogger: createLoggerMock(),
        monitorLogger: createLoggerMock(),
        diagnosticsLogger: createLoggerMock(),
    };
});

const createMonitor = (
    overrides: Partial<Site["monitors"][0]> = {}
): Site["monitors"][0] => ({
    id: overrides.id ?? "monitor-1",
    type: "http",
    monitoring: true,
    checkInterval: DEFAULT_CHECK_INTERVAL,
    timeout: 5000,
    retryAttempts: 3,
    responseTime: 0,
    status: "up",
    history: [],
    url: "https://example.com",
    ...overrides,
});

const flushAsync = async (): Promise<void> => {
    await Promise.resolve();
    await Promise.resolve();
};

type MonitorCheckCallback = (
    siteIdentifier: string,
    monitorId: string
) => Promise<void>;

const createCheckCallbackMock = () => vi.fn<MonitorCheckCallback>();

const expectDelayWithinTolerance = (actual: number, expected: number): void => {
    const tolerance = Math.ceil(expected * 0.1) + 100;
    expect(actual).toBeGreaterThanOrEqual(Math.max(0, expected - tolerance));
    expect(actual).toBeLessThanOrEqual(expected + tolerance);
};

describe("MonitorScheduler – comprehensive", () => {
    const FIXED_NOW = 2_000_000_000;
    let scheduler: MonitorScheduler;
    let eventEmitter: { emitTyped: ReturnType<typeof vi.fn> };
    let mockCheckCallback: ReturnType<typeof createCheckCallbackMock>;
    let mathRandomSpy: ReturnType<typeof vi.spyOn>;
    let dateNowSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.useFakeTimers();
        mathRandomSpy = vi.spyOn(Math, "random").mockReturnValue(0.5);
        dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(FIXED_NOW);
        eventEmitter = { emitTyped: vi.fn().mockResolvedValue(undefined) };
        scheduler = new MonitorScheduler(logger, eventEmitter as any);
        mockCheckCallback =
            createCheckCallbackMock().mockResolvedValue(undefined);
        scheduler.setCheckCallback(mockCheckCallback);
        (isDev as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
    });

    afterEach(() => {
        scheduler.stopAll();
        vi.useRealTimers();
        mathRandomSpy.mockRestore();
        dateNowSpy.mockRestore();
        vi.clearAllMocks();
    });

    it("applies exponential backoff, emits telemetry, and resets after success", async () => {
        mockCheckCallback = createCheckCallbackMock()
            .mockRejectedValueOnce(new Error("boom"))
            .mockResolvedValueOnce(undefined);
        scheduler.setCheckCallback(mockCheckCallback);

        const baseInterval = 60_000;
        scheduler.startMonitor(
            "site-1",
            createMonitor({ checkInterval: baseInterval })
        );
        await flushAsync();

        const backoffEvent = eventEmitter.emitTyped.mock.calls.find(
            ([eventName]) => eventName === "monitor:backoff-applied"
        );

        const backoffPayload = backoffEvent?.[1] as
            | {
                  backoffAttempt: number;
                  delayMs: number;
                  monitorId: string;
                  siteIdentifier: string;
                  timestamp: number;
              }
            | undefined;
        expect(backoffPayload).toMatchObject({
            backoffAttempt: 1,
            monitorId: "monitor-1",
            siteIdentifier: "site-1",
            timestamp: FIXED_NOW,
        });
        expectDelayWithinTolerance(backoffPayload!.delayMs, baseInterval * 2);

        await vi.advanceTimersByTimeAsync(baseInterval * 2);
        await flushAsync();

        const jobAfterSecondRun = scheduler
            .getJobsForTesting()
            .get("site-1|monitor-1");
        scheduler.stopMonitor("site-1", "monitor-1");

        expect(mockCheckCallback).toHaveBeenCalledTimes(2);
        expect(jobAfterSecondRun?.backoffAttempt).toBe(0);
    });

    it("caps exponential backoff to five minutes", async () => {
        const baseInterval = 90_000;
        mockCheckCallback = createCheckCallbackMock().mockRejectedValue(
            new Error("fail")
        );
        scheduler.setCheckCallback(mockCheckCallback);
        scheduler.startMonitor(
            "site-1",
            createMonitor({ checkInterval: baseInterval })
        );

        const expectedDelays = [
            baseInterval * 2,
            300_000,
            300_000,
        ];

        for (const expectedDelay of expectedDelays) {
            await flushAsync();
            const latestBackoff = eventEmitter.emitTyped.mock.calls.findLast(
                ([eventName]) => eventName === "monitor:backoff-applied"
            );

            const payload = latestBackoff?.[1] as
                | {
                      delayMs: number;
                      monitorId: string;
                      timestamp: number;
                  }
                | undefined;
            expect(payload).toMatchObject({
                monitorId: expect.any(String),
                timestamp: FIXED_NOW,
            });
            expectDelayWithinTolerance(payload!.delayMs, expectedDelay);

            await vi.advanceTimersByTimeAsync(expectedDelay);
        }
    });

    it("emits monitor:timeout when a check exceeds its timeout guard", async () => {
        const timeoutMs = 120;
        mockCheckCallback = createCheckCallbackMock().mockReturnValue(
            new Promise<void>(() => {})
        );
        scheduler.setCheckCallback(mockCheckCallback);

        scheduler.startMonitor("site-1", createMonitor({ timeout: timeoutMs }));
        await flushAsync();

        const guardDuration = timeoutMs + MONITOR_TIMEOUT_BUFFER_MS;
        await vi.advanceTimersByTimeAsync(guardDuration);
        await flushAsync();

        const timeoutEvent = eventEmitter.emitTyped.mock.calls.find(
            ([eventName]) => eventName === "monitor:timeout"
        );

        expect(timeoutEvent?.[1]).toMatchObject({
            monitorId: "monitor-1",
            siteIdentifier: "site-1",
            timeoutMs: guardDuration,
            timestamp: FIXED_NOW,
        });
        expect(
            scheduler.getJobsForTesting().get("site-1|monitor-1")
                ?.backoffAttempt
        ).toBe(1);
    });

    it("stopSite removes only the targeted site's jobs", () => {
        scheduler.startMonitor("site-1", createMonitor());
        scheduler.startMonitor("site-1", createMonitor({ id: "monitor-2" }));
        scheduler.startMonitor("site-2", createMonitor({ id: "monitor-3" }));

        expect(scheduler.getActiveCount()).toBe(3);
        scheduler.stopSite("site-1");

        expect(scheduler.getActiveMonitors()).toEqual(["site-2|monitor-3"]);
    });

    it("startSite schedules only monitors flagged for monitoring", async () => {
        const site: Site = {
            identifier: "site-1",
            name: "Site",
            monitoring: true,
            monitors: [
                createMonitor({ id: "monitor-1", monitoring: true }),
                createMonitor({ id: "monitor-2", monitoring: false }),
            ],
        };

        scheduler.startSite(site);
        await flushAsync();

        expect(scheduler.getActiveMonitors()).toEqual(["site-1|monitor-1"]);
    });

    it("stopAll clears every scheduled job", () => {
        scheduler.startMonitor("site-1", createMonitor());
        scheduler.startMonitor("site-2", createMonitor({ id: "monitor-2" }));

        scheduler.stopAll();

        expect(scheduler.getActiveCount()).toBe(0);
        expect(scheduler.getActiveMonitors()).toEqual([]);
    });
});
