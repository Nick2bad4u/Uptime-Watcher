import type { MonitorServiceConfig } from "../../../../services/monitoring/types";

import { describe, expect, it, vi } from "vitest";

import {
    assertPositiveTimeoutConfigUpdate,
    copyMonitorServiceConfig,
    createDefaultMonitorServiceConfig,
    mergeMonitorServiceConfig,
} from "../../../../services/monitoring/shared/monitorServiceConfigMerging";

function getFirstHistoryEntry(
    history: NonNullable<MonitorServiceConfig["history"]>
): NonNullable<MonitorServiceConfig["history"]>[number] {
    const firstEntry = history[0];
    if (!firstEntry) {
        throw new Error("Expected history fixture to contain an entry");
    }

    return firstEntry;
}

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
        const update: Partial<MonitorServiceConfig> = {};
        Object.defineProperty(update, "timeout", {
            enumerable: true,
            value: undefined,
        });
        Object.defineProperty(update, "userAgent", {
            enumerable: true,
            value: undefined,
        });

        const result = mergeMonitorServiceConfig({
            currentConfig: {
                timeout: 7000,
                userAgent: "CurrentAgent/1.0",
            },
            update,
        });

        expect(result).toEqual({
            timeout: 7000,
            userAgent: "CurrentAgent/1.0",
        });
    });

    it("copies mutable config values while creating defaults", () => {
        const history: MonitorServiceConfig["history"] = [
            {
                responseTime: 100,
                status: "up",
                timestamp: 1,
            },
        ];
        const lastChecked = new Date("2026-01-01T00:00:00.000Z");

        const result = createDefaultMonitorServiceConfig({
            config: {
                activeOperations: ["operation-1"],
                history,
                lastChecked,
            },
            defaultTimeoutMs: 5000,
        });

        history.push({
            responseTime: 200,
            status: "down",
            timestamp: 2,
        });
        getFirstHistoryEntry(history).responseTime = 999;
        lastChecked.setUTCFullYear(2030);

        expect(result.history).toEqual([
            {
                responseTime: 100,
                status: "up",
                timestamp: 1,
            },
        ]);
        expect(result.lastChecked).toEqual(
            new Date("2026-01-01T00:00:00.000Z")
        );
    });

    it("copies mutable config values while merging updates", () => {
        const activeOperations = ["operation-1"];
        const history: MonitorServiceConfig["history"] = [
            {
                responseTime: 100,
                status: "up",
                timestamp: 1,
            },
        ];

        const result = mergeMonitorServiceConfig({
            currentConfig: {
                activeOperations,
                history,
                timeout: 7000,
            },
            update: {
                timeout: 8000,
            },
        });

        activeOperations.push("operation-2");
        getFirstHistoryEntry(history).status = "down";

        expect(result.activeOperations).toEqual(["operation-1"]);
        expect(result.history).toEqual([
            {
                responseTime: 100,
                status: "up",
                timestamp: 1,
            },
        ]);
    });

    it("copies mutable config values for public snapshots", () => {
        const history: MonitorServiceConfig["history"] = [
            {
                responseTime: 100,
                status: "up",
                timestamp: 1,
            },
        ];
        const lastChecked = new Date("2026-01-01T00:00:00.000Z");
        const config: MonitorServiceConfig = {
            history,
            lastChecked,
            timeout: 7000,
        };

        const result = copyMonitorServiceConfig(config);

        getFirstHistoryEntry(history).responseTime = 999;
        lastChecked.setUTCFullYear(2030);

        expect(result).toEqual({
            history: [
                {
                    responseTime: 100,
                    status: "up",
                    timestamp: 1,
                },
            ],
            lastChecked: new Date("2026-01-01T00:00:00.000Z"),
            timeout: 7000,
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
