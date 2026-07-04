import type { AxiosInstance } from "axios";

import type { MonitorServiceConfig } from "../types";

import { createHttpClient } from "../utils/httpClient";
import {
    createDefaultMonitorServiceConfig,
    mergeMonitorServiceConfig,
} from "./monitorServiceConfigMerging";

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
    const config = createDefaultMonitorServiceConfig({
        defaultTimeoutMs: args.defaultTimeoutMs,
        ...(args.config && { config: args.config }),
        ...(args.defaultUserAgent && {
            defaultUserAgent: args.defaultUserAgent,
        }),
    });

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
    const currentConfig = createDefaultMonitorServiceConfig({
        config: args.currentConfig,
        defaultTimeoutMs: args.defaultTimeoutMs,
        ...(args.defaultUserAgent && {
            defaultUserAgent: args.defaultUserAgent,
        }),
    });
    const merged = mergeMonitorServiceConfig({
        currentConfig,
        update: args.update,
    });

    return {
        axiosInstance: createHttpClient(merged),
        config: merged,
    };
}
