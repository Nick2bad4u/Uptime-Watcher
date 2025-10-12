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

import type { MonitorTypesDomainBridge } from "@shared/types/preload";

import { createTypedInvoker } from "../core/bridgeFactory";

/**
 * Interface defining the monitor types domain API operations.
 *
 * @public
 */
export interface MonitorTypesApiInterface extends MonitorTypesDomainBridge {
    /**
     * Gets all available monitor types and their configurations
     *
     * @returns Promise resolving to monitor types registry
     */
    getMonitorTypes: MonitorTypesDomainBridge["getMonitorTypes"];
}

/**
 * Monitor types domain API providing monitor type registry operations.
 *
 * @public
 */
export const monitorTypesApi: MonitorTypesApiInterface = {
    /**
     * Gets all available monitor types and their configurations
     *
     * @returns Promise resolving to monitor types registry
     */
    getMonitorTypes: createTypedInvoker("get-monitor-types"),
} as const;

/**
 * Type alias for the monitor types domain preload bridge.
 *
 * @public
 */
export type MonitorTypesApi = MonitorTypesDomainBridge;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
