import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";
import { describe, expect, it } from "vitest";

import {
    DEFAULT_CHECK_INTERVAL,
    DEFAULT_REQUEST_TIMEOUT,
} from "../../../constants";
import { createMonitorConfig } from "../../../services/monitoring/createMonitorConfig";
import { DEFAULT_RETRY_ATTEMPTS } from "../../../services/monitoring/constants";

describe(createMonitorConfig, () => {
    it("accepts finite integer numeric strings", () => {
        expect(
            createMonitorConfig({
                checkInterval: "60000" as never,
                retryAttempts: "2" as never,
                timeout: "5000" as never,
            })
        ).toEqual({
            checkInterval: 60_000,
            retryAttempts: 2,
            timeout: 5000,
        });
    });

    it("rejects fractional monitor overrides instead of truncating them", () => {
        expect(
            createMonitorConfig(
                {
                    checkInterval: 6000.5,
                    retryAttempts: 2.5,
                    timeout: 5000.5,
                },
                {
                    checkInterval: 70_000,
                    retryAttempts: 4,
                    timeout: 6000,
                }
            )
        ).toEqual({
            checkInterval: 70_000,
            retryAttempts: 4,
            timeout: 6000,
        });
    });

    it("rejects fractional defaults instead of truncating them", () => {
        expect(
            createMonitorConfig(
                {},
                {
                    checkInterval: 70_000.5,
                    retryAttempts: 4.5,
                    timeout: 6000.5,
                }
            )
        ).toEqual({
            checkInterval: DEFAULT_CHECK_INTERVAL,
            retryAttempts: DEFAULT_RETRY_ATTEMPTS,
            timeout: DEFAULT_REQUEST_TIMEOUT,
        });
    });

    it("enforces the minimum check interval for valid low integer overrides", () => {
        expect(createMonitorConfig({ checkInterval: 1 }).checkInterval).toBe(
            MIN_MONITOR_CHECK_INTERVAL_MS
        );
    });
});
