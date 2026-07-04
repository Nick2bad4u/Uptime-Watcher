import type { MonitorServiceConfig } from "../../../../services/monitoring/types";

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    createMonitorServiceRuntimeState,
    updateMonitorServiceRuntimeState,
} from "../../../../services/monitoring/shared/monitorServiceRuntimeState";
import { createHttpClient } from "../../../../services/monitoring/utils/httpClient";

vi.mock("../../../../services/monitoring/utils/httpClient", () => ({
    createHttpClient: vi.fn((config: MonitorServiceConfig) => ({
        config,
    })),
}));

describe("monitorServiceRuntimeState", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("does not invoke accessor-backed initial config fields", () => {
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

        const state = createMonitorServiceRuntimeState({
            config,
            defaultTimeoutMs: 5000,
            defaultUserAgent: "DefaultAgent/1.0",
        });

        expect(timeoutGetter).not.toHaveBeenCalled();
        expect(state.config).toEqual({
            timeout: 5000,
            userAgent: "CustomAgent/1.0",
        });
        expect(createHttpClient).toHaveBeenCalledWith(state.config);
    });

    it("does not invoke accessor-backed update config fields", () => {
        const timeoutGetter = vi.fn(() => {
            throw new Error("timeout getter should not run");
        });
        const update: Partial<MonitorServiceConfig> = {};
        Object.defineProperty(update, "userAgent", {
            enumerable: true,
            value: undefined,
        });

        Object.defineProperty(update, "timeout", {
            enumerable: true,
            get: timeoutGetter,
        });

        const state = updateMonitorServiceRuntimeState({
            currentConfig: {
                timeout: 7000,
                userAgent: "CurrentAgent/1.0",
            },
            defaultTimeoutMs: 5000,
            defaultUserAgent: "DefaultAgent/1.0",
            update,
        });

        expect(timeoutGetter).not.toHaveBeenCalled();
        expect(state.config).toEqual({
            timeout: 7000,
            userAgent: "CurrentAgent/1.0",
        });
        expect(createHttpClient).toHaveBeenCalledWith(state.config);
    });

    it("drops reserved prototype keys from initial config", () => {
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

        const state = createMonitorServiceRuntimeState({
            config,
            defaultTimeoutMs: 5000,
            defaultUserAgent: "DefaultAgent/1.0",
        });

        expect(Object.getPrototypeOf(state.config)).toBe(Object.prototype);
        expect(Object.hasOwn(state.config, "__proto__")).toBe(false);
        expect(Object.hasOwn(state.config, "constructor")).toBe(false);
        expect(Object.hasOwn(state.config, "prototype")).toBe(false);
        expect(state.config).toEqual({
            timeout: 5000,
            userAgent: "CustomAgent/1.0",
        });
        expect(createHttpClient).toHaveBeenCalledWith(state.config);
    });

    it("drops reserved prototype keys from runtime config updates", () => {
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

        const state = updateMonitorServiceRuntimeState({
            currentConfig: {
                timeout: 7000,
                userAgent: "CurrentAgent/1.0",
            },
            defaultTimeoutMs: 5000,
            defaultUserAgent: "DefaultAgent/1.0",
            update,
        });

        expect(Object.getPrototypeOf(state.config)).toBe(Object.prototype);
        expect(Object.hasOwn(state.config, "__proto__")).toBe(false);
        expect(Object.hasOwn(state.config, "constructor")).toBe(false);
        expect(Object.hasOwn(state.config, "prototype")).toBe(false);
        expect(state.config).toEqual({
            timeout: 7000,
            userAgent: "UpdatedAgent/1.0",
        });
        expect(createHttpClient).toHaveBeenCalledWith(state.config);
    });

    it("applies data-backed updates while ignoring undefined fields", () => {
        const update: Partial<MonitorServiceConfig> = {
            timeout: 9000,
        };
        Object.defineProperty(update, "userAgent", {
            enumerable: true,
            value: undefined,
        });

        const state = updateMonitorServiceRuntimeState({
            currentConfig: {
                timeout: 7000,
                userAgent: "CurrentAgent/1.0",
            },
            defaultTimeoutMs: 5000,
            update,
        });

        expect(state.config).toEqual({
            timeout: 9000,
            userAgent: "CurrentAgent/1.0",
        });
    });
});
