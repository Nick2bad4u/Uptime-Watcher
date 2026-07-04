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

    it("drops reserved prototype keys while creating defaults", () => {
        const config: Partial<MonitorServiceConfig> = {
            userAgent: "CustomAgent/1.0",
        };
        Object.defineProperty(config, "__proto__", {
            enumerable: true,
            value: { polluted: true },
        });
        Object.defineProperty(config, "constructor", {
            enumerable: true,
            value: "unsafe-constructor",
        });
        Object.defineProperty(config, "prototype", {
            enumerable: true,
            value: "unsafe-prototype",
        });

        const result = createDefaultMonitorServiceConfig({
            config,
            defaultTimeoutMs: 5000,
            defaultUserAgent: "DefaultAgent/1.0",
        });

        expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
        expect(Object.hasOwn(result, "__proto__")).toBe(false);
        expect(Object.hasOwn(result, "constructor")).toBe(false);
        expect(Object.hasOwn(result, "prototype")).toBe(false);
        expect(result).toEqual({
            timeout: 5000,
            userAgent: "CustomAgent/1.0",
        });
    });

    it("drops reserved prototype keys while merging updates", () => {
        const update: Partial<MonitorServiceConfig> = {
            userAgent: "UpdatedAgent/1.0",
        };
        Object.defineProperty(update, "__proto__", {
            enumerable: true,
            value: { polluted: true },
        });
        Object.defineProperty(update, "constructor", {
            enumerable: true,
            value: "unsafe-constructor",
        });
        Object.defineProperty(update, "prototype", {
            enumerable: true,
            value: "unsafe-prototype",
        });

        const result = mergeMonitorServiceConfig({
            currentConfig: {
                timeout: 7000,
                userAgent: "CurrentAgent/1.0",
            },
            update,
        });

        expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
        expect(Object.hasOwn(result, "__proto__")).toBe(false);
        expect(Object.hasOwn(result, "constructor")).toBe(false);
        expect(Object.hasOwn(result, "prototype")).toBe(false);
        expect(result).toEqual({
            timeout: 7000,
            userAgent: "UpdatedAgent/1.0",
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
