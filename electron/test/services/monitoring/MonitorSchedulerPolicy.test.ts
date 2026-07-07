import { describe, expect, it } from "vitest";

import { MIN_CHECK_INTERVAL } from "../../../services/monitoring/constants";
import { computeMonitorSchedulerDelay } from "../../../services/monitoring/MonitorSchedulerPolicy";

const midpointRandomInt = (min: number, max: number): number =>
    Math.floor((min + max - 1) / 2);

describe("MonitorSchedulerPolicy", () => {
    it("does not reduce user intervals that exceed the global backoff cap", () => {
        const baseIntervalMs = 90 * 60_000;

        expect(
            computeMonitorSchedulerDelay(
                {
                    backoffAttempt: 1,
                    baseIntervalMs,
                },
                midpointRandomInt
            )
        ).toBe(baseIntervalMs);
    });

    it("caps exponential backoff at sixty minutes for shorter intervals", () => {
        expect(
            computeMonitorSchedulerDelay(
                {
                    backoffAttempt: 8,
                    baseIntervalMs: 60_000,
                },
                midpointRandomInt
            )
        ).toBe(60 * 60_000);
    });

    it("clamps non-positive base intervals to the minimum interval", () => {
        expect(
            computeMonitorSchedulerDelay(
                {
                    backoffAttempt: 0,
                    baseIntervalMs: 0,
                },
                midpointRandomInt
            )
        ).toBe(MIN_CHECK_INTERVAL);
        expect(
            computeMonitorSchedulerDelay(
                {
                    backoffAttempt: 0,
                    baseIntervalMs: -1,
                },
                midpointRandomInt
            )
        ).toBe(MIN_CHECK_INTERVAL);
    });
});
