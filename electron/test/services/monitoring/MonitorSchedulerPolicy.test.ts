import { describe, expect, it } from "vitest";

import {
    applySchedulerJitter,
    computeMonitorSchedulerDelay,
} from "../../../services/monitoring/MonitorSchedulerPolicy";
import { MIN_CHECK_INTERVAL } from "../../../services/monitoring/constants";

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

    it("clamps non-positive jitter targets to the minimum interval", () => {
        expect(applySchedulerJitter(0, midpointRandomInt)).toBe(
            MIN_CHECK_INTERVAL
        );
        expect(applySchedulerJitter(-1, midpointRandomInt)).toBe(
            MIN_CHECK_INTERVAL
        );
    });
});
