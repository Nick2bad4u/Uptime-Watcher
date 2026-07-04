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
        const update: Partial<MonitorServiceConfig> = {
            userAgent: undefined,
        };

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

    it("applies data-backed updates while ignoring undefined fields", () => {
        const state = updateMonitorServiceRuntimeState({
            currentConfig: {
                timeout: 7000,
                userAgent: "CurrentAgent/1.0",
            },
            defaultTimeoutMs: 5000,
            update: {
                timeout: 9000,
                userAgent: undefined,
            },
        });

        expect(state.config).toEqual({
            timeout: 9000,
            userAgent: "CurrentAgent/1.0",
        });
    });
});
