import type { AxiosInstance } from "axios";

import type { MonitorServiceConfig } from "../types";

import { createHttpClient } from "../utils/httpClient";

/**
 * Runtime state shared by monitor service adapters.
 */
export interface MonitorServiceRuntimeState {
    readonly axiosInstance: AxiosInstance;
    readonly config: MonitorServiceConfig;
}

/**
 * Creates the normalized config + Axios instance used by monitor service
 * adapters.
 *
 * @remarks
 * Several monitor service adapters share the same pattern:
 *
 * - Normalize config with defaults
 * - Create an Axios instance configured with timeout / userAgent
 *
 * Centralizing this prevents drift between adapters.
 */
export function createMonitorServiceRuntimeState(args: {
    readonly config?: Partial<MonitorServiceConfig>;
    readonly defaultTimeoutMs: number;
    readonly defaultUserAgent?: string;
}): MonitorServiceRuntimeState {
    const config: MonitorServiceConfig = {
        timeout: args.defaultTimeoutMs,
        ...(args.defaultUserAgent ? { userAgent: args.defaultUserAgent } : {}),
        ...args.config,
    };

    return {
        axiosInstance: createHttpClient(config),
        config,
    };
}

/**
 * Applies a config update and returns the updated runtime state.
 */
export function updateMonitorServiceRuntimeState(args: {
    readonly currentConfig: MonitorServiceConfig;
    readonly defaultTimeoutMs: number;
    readonly defaultUserAgent?: string;
    readonly update: Partial<MonitorServiceConfig>;
}): MonitorServiceRuntimeState {
    // Treat `undefined` as "not provided" (do not overwrite existing config).
    const update: Partial<MonitorServiceConfig> = { ...args.update };
    if (update.timeout === undefined) {
        delete update.timeout;
    }
    if (update.userAgent === undefined) {
        delete update.userAgent;
    }

    const merged: MonitorServiceConfig = {
        timeout: args.defaultTimeoutMs,
        ...(args.defaultUserAgent ? { userAgent: args.defaultUserAgent } : {}),
        ...args.currentConfig,
        ...update,
    };

    return {
        axiosInstance: createHttpClient(merged),
        config: merged,
    };
}
