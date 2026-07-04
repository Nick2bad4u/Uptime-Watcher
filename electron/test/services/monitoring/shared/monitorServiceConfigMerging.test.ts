import type { MonitorServiceConfig } from "../../../../services/monitoring/types";

import { describe, expect, it, vi } from "vitest";

import {
    assertPositiveTimeoutConfigUpdate,
    createDefaultMonitorServiceConfig,
    mergeMonitorServiceConfig,
} from "../../../../services/monitoring/shared/monitorServiceConfigMerging";

describe("monitorServiceConfigMerging", () => {
    it("creates defaults without invoking accessor-backed config fields", () => {
        const timeoutGetter = vi.fn(() => {
            throw new Error("timeout getter should not run");
        });
        const config: Partial<MonitorServiceConfig> = {
            userAgent: "CustomAgent/1.0",
        };

        Object.defineProperty(config, "timeout", {
            enumerable: true,
            get: timeoutGetter,
        });

        const result = createDefaultMonitorServiceConfig({
            config,
            defaultTimeoutMs: 5000,
            defaultUserAgent: "DefaultAgent/1.0",
        });

        expect(timeoutGetter).not.toHaveBeenCalled();
        expect(result).toEqual({
            timeout: 5000,
            userAgent: "CustomAgent/1.0",
        });
    });

    it("merges updates without invoking accessor-backed fields", () => {
        const timeoutGetter = vi.fn(() => {
            throw new Error("timeout getter should not run");
        });
        const update: Partial<MonitorServiceConfig> = {
            userAgent: "UpdatedAgent/1.0",
        };

        Object.defineProperty(update, "timeout", {
            enumerable: true,
            get: timeoutGetter,
        });

        const result = mergeMonitorServiceConfig({
            currentConfig: {
                timeout: 7000,
                userAgent: "CurrentAgent/1.0",
            },
            update,
        });

        expect(timeoutGetter).not.toHaveBeenCalled();
        expect(result).toEqual({
            timeout: 7000,
            userAgent: "UpdatedAgent/1.0",
        });
    });

    it("ignores undefined data-backed update fields", () => {
        const result = mergeMonitorServiceConfig({
            currentConfig: {
                timeout: 7000,
                userAgent: "CurrentAgent/1.0",
            },
            update: {
                timeout: undefined,
                userAgent: undefined,
            },
        });

        expect(result).toEqual({
            timeout: 7000,
            userAgent: "CurrentAgent/1.0",
        });
    });

    it("validates data-backed timeout updates without invoking accessors", () => {
        const timeoutGetter = vi.fn(() => {
            throw new Error("timeout getter should not run");
        });
        const accessorConfig: Partial<MonitorServiceConfig> = {};

        Object.defineProperty(accessorConfig, "timeout", {
            enumerable: true,
            get: timeoutGetter,
        });

        expect(() =>
            assertPositiveTimeoutConfigUpdate(accessorConfig)
        ).not.toThrow();
        expect(timeoutGetter).not.toHaveBeenCalled();

        expect(() =>
            assertPositiveTimeoutConfigUpdate({ timeout: -1 })
        ).toThrow("Invalid timeout: must be a positive number");
        expect(() =>
            assertPositiveTimeoutConfigUpdate({ timeout: Number.NaN })
        ).toThrow("Invalid timeout: must be a positive number");
        expect(() =>
            assertPositiveTimeoutConfigUpdate({ timeout: "bad" as never })
        ).toThrow("Invalid timeout: must be a positive number");
    });
});
