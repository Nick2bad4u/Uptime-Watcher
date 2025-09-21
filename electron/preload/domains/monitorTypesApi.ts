/**
 * Monitor Types Domain API - Auto-generated preload bridge for monitor type
 * operations
 *
 * @remarks
 * This module provides type-safe IPC communication for monitor type registry
 * operations. As a thin wrapper over the bridge factory, exceptions are
 * intentionally propagated to the frontend for handling at the UI level.
 *
 * @packageDocumentation
 */

/* eslint-disable ex/no-unhandled -- Domain APIs are thin wrappers that don't handle exceptions */

import { createTypedInvoker } from "../core/bridgeFactory";

/**
 * Interface defining the monitor types domain API operations
 */
export interface MonitorTypesApiInterface {
    /**
     * Gets all available monitor types and their configurations
     *
     * @returns Promise resolving to monitor types registry
     */
    getMonitorTypes: (...args: unknown[]) => Promise<unknown>;
}

/**
 * Monitor types domain API providing monitor type registry operations
 */
export const monitorTypesApi: MonitorTypesApiInterface = {
    /**
     * Gets all available monitor types and their configurations
     *
     * @returns Promise resolving to monitor types registry
     */
    getMonitorTypes: createTypedInvoker<unknown>(
        "get-monitor-types"
    ) satisfies (...args: unknown[]) => Promise<unknown>,
} as const;

export type MonitorTypesApi = MonitorTypesApiInterface;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
