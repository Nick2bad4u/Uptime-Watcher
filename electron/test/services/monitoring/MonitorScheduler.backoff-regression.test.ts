/**
 * Regression coverage for MonitorScheduler backoff cap behavior.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:crypto", () => ({
    // Choose the midpoint so MonitorScheduler's
    // `randomInt(0, range*2+1) - range` yields 0 jitter.
    randomInt: vi.fn((min: number, max: number) =>
        Math.floor((min + max - 1) / 2)
    ),
}));

vi.unmock("../../../services/monitoring/MonitorScheduler");

import type { Site } from "@shared/types";

import { MonitorScheduler } from "../../../services/monitoring/MonitorScheduler";
import { logger } from "../../../utils/logger";

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
    checkInterval: 20 * 60_000,
    timeout: 5000,
    retryAttempts: 3,
    responseTime: 0,
    status: "up",
    history: [],
    url: "https://example.com",
    ...overrides,
});

describe("MonitorScheduler backoff regressions", () => {
    let scheduler: MonitorScheduler;
    let eventEmitter: { emitTyped: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        eventEmitter = { emitTyped: vi.fn().mockResolvedValue(undefined) };
        scheduler = new MonitorScheduler(logger, eventEmitter as any);
        scheduler.setCheckCallback(vi.fn(async () => {
            throw new Error("fail");
        }));
    });

    afterEach(() => {
        scheduler.stopAll();
        vi.clearAllMocks();
    });

    it("never reduces base interval when applying backoff cap", async () => {
        const baseInterval = 20 * 60_000;
        scheduler.startMonitor(
            "site-1",
            createMonitor({ checkInterval: baseInterval })
        );

        // StartMonitor triggers a fire-and-forget run; wait until the first
        // Schedule update event is emitted.
        let scheduleEvent: readonly unknown[] | undefined;

        for (let attempt = 0; attempt < 20; attempt += 1) {
            await Promise.resolve();

            scheduleEvent = eventEmitter.emitTyped.mock.calls.findLast(
                ([eventName]) => eventName === "monitor:schedule-updated"
            );

            if (scheduleEvent) {
                break;
            }
        }

        expect(scheduleEvent).toBeDefined();

                const payloadCandidate = scheduleEvent?.[1];
                const payload =
                    payloadCandidate && typeof payloadCandidate === "object"
                        ? (payloadCandidate as { delayMs?: unknown })
                        : undefined;

        // After a failure, backoffAttempt=1 so the delay should be ~2x the base
        // Interval (40 minutes), never clamped down below the base.
        expect(payload?.delayMs).toBe(40 * 60_000);
    });
});
