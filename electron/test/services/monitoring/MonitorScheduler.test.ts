import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.unmock("../../../services/monitoring/MonitorScheduler");

import type { Site } from "@shared/types";

import { DEFAULT_CHECK_INTERVAL } from "../../../constants";
import { MonitorScheduler } from "../../../services/monitoring/MonitorScheduler";
import {
    DEFAULT_MONITOR_TIMEOUT_SECONDS,
    MIN_CHECK_INTERVAL,
    MONITOR_TIMEOUT_BUFFER_MS,
    SECONDS_TO_MS_MULTIPLIER,
} from "../../../services/monitoring/constants";
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
    id: "monitor-1",
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

describe(MonitorScheduler, () => {
    const FIXED_NOW = 1_700_000_000;
    let scheduler: MonitorScheduler;
    let mockCheckCallback: ReturnType<typeof createCheckCallbackMock>;
    let eventEmitter: { emitTyped: ReturnType<typeof vi.fn> };
    let mathRandomSpy: ReturnType<typeof vi.spyOn>;
    let dateNowSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        vi.useFakeTimers();
        mathRandomSpy = vi.spyOn(Math, "random").mockReturnValue(0.5);
        dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(FIXED_NOW);
        eventEmitter = {
            emitTyped: vi.fn().mockResolvedValue(undefined),
        };
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

    it("returns false when attempting to start a monitor without an ID", () => {
        const result = scheduler.startMonitor(
            "site-1",
            createMonitor({ id: "" })
        );

        expect(result).toBeFalsy();
    });

    it("clamps short intervals to the minimum, runs immediately, and emits schedule telemetry", async () => {
        const shortInterval = MIN_CHECK_INTERVAL - 250;
        scheduler.startMonitor(
            "site-1",
            createMonitor({ checkInterval: shortInterval })
        );

        await flushAsync();

        const jobs = scheduler.getJobsForTesting();
        const job = jobs.get("site-1|monitor-1");

        expect(job?.baseIntervalMs).toBe(MIN_CHECK_INTERVAL);
        expect(mockCheckCallback).toHaveBeenCalledWith("site-1", "monitor-1");

        const scheduleEvent = eventEmitter.emitTyped.mock.calls.find(
            ([eventName]) => eventName === "monitor:schedule-updated"
        );
        const schedulePayload = scheduleEvent?.[1] as
            | {
                  backoffAttempt: number;
                  delayMs: number;
                  monitorId: string;
                  siteIdentifier: string;
                  timestamp: number;
              }
            | undefined;
        expect(schedulePayload).toMatchObject({
            backoffAttempt: 0,
            monitorId: "monitor-1",
            siteIdentifier: "site-1",
            timestamp: FIXED_NOW,
        });
        expectDelayWithinTolerance(
            schedulePayload!.delayMs,
            MIN_CHECK_INTERVAL
        );
    });

    it("uses the default interval when monitor checkInterval requests automatic determination", () => {
        scheduler.startMonitor("site-1", createMonitor({ checkInterval: 0 }));

        const job = scheduler.getJobsForTesting().get("site-1|monitor-1");
        expect(job?.baseIntervalMs).toBe(DEFAULT_CHECK_INTERVAL);
    });

    it("derives timeout guard from default constants when monitor timeout is zero", () => {
        scheduler.startMonitor("site-1", createMonitor({ timeout: 0 }));

        const job = scheduler.getJobsForTesting().get("site-1|monitor-1");
        const expectedTimeout =
            DEFAULT_MONITOR_TIMEOUT_SECONDS * SECONDS_TO_MS_MULTIPLIER +
            MONITOR_TIMEOUT_BUFFER_MS;
        expect(job?.timeoutMs).toBe(expectedTimeout);
    });

    it("pre-empts the scheduled job when performing a manual check and resets backoff", async () => {
        mockCheckCallback = createCheckCallbackMock()
            .mockRejectedValueOnce(new Error("boom"))
            .mockResolvedValue(undefined);
        scheduler.setCheckCallback(mockCheckCallback);

        scheduler.startMonitor("site-1", createMonitor());
        await flushAsync();

        const jobKey = "site-1|monitor-1";
        expect(scheduler.getJobsForTesting().get(jobKey)?.backoffAttempt).toBe(
            1
        );

        eventEmitter.emitTyped.mockClear();
        await scheduler.performImmediateCheck("site-1", "monitor-1");
        await flushAsync();

        const manualEvent = eventEmitter.emitTyped.mock.calls.find(
            ([eventName]) => eventName === "monitor:manual-check-started"
        );

        expect(manualEvent?.[1]).toMatchObject({
            correlationId: expect.any(String),
            monitorId: "monitor-1",
            siteIdentifier: "site-1",
            timestamp: FIXED_NOW,
        });
        const jobAfterManual = scheduler.getJobsForTesting().get(jobKey);
        expect(jobAfterManual?.backoffAttempt).toBe(0);
        expect(jobAfterManual?.hasTimer).toBeTruthy();
    });

    it("removes jobs when stopMonitor is called", () => {
        scheduler.startMonitor("site-1", createMonitor());
        expect(scheduler.getActiveCount()).toBe(1);

        const stopped = scheduler.stopMonitor("site-1", "monitor-1");

        expect(stopped).toBeTruthy();
        expect(scheduler.getActiveCount()).toBe(0);
        expect(scheduler.getActiveMonitors()).toEqual([]);
    });

    it("stopSite only clears jobs for the given site", () => {
        scheduler.startMonitor("site-1", createMonitor());
        scheduler.startMonitor("site-2", createMonitor({ id: "monitor-2" }));

        scheduler.stopSite("site-1");

        expect(scheduler.isMonitoring("site-1", "monitor-1")).toBeFalsy();
        expect(scheduler.isMonitoring("site-2", "monitor-2")).toBeTruthy();
    });
});
