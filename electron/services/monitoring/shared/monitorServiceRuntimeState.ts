import type { AxiosInstance } from "axios";

import { safeObjectOmit } from "@shared/utils/objectSafety";
import { isDefined } from "ts-extras";

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
    const configOverrides = safeObjectOmit(args.config, []);
    const config: MonitorServiceConfig = {
        timeout: args.defaultTimeoutMs,
        ...(args.defaultUserAgent && { userAgent: args.defaultUserAgent }),
        ...configOverrides,
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
    const currentConfig = safeObjectOmit(args.currentConfig, []);
    const update: Partial<MonitorServiceConfig> = safeObjectOmit(
        args.update,
        []
    );
    if (!isDefined(update.timeout)) {
        delete update.timeout;
    }
    if (!isDefined(update.userAgent)) {
        delete update.userAgent;
    }

    const merged: MonitorServiceConfig = {
        timeout: args.defaultTimeoutMs,
        ...(args.defaultUserAgent && { userAgent: args.defaultUserAgent }),
        ...currentConfig,
        ...update,
    };

    return {
        axiosInstance: createHttpClient(merged),
        config: merged,
    };
}
