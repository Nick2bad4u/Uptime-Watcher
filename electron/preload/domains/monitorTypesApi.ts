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

import {
    MONITOR_TYPES_CHANNELS,
    type MonitorTypesDomainBridge,
} from "@shared/types/preload";

import { createTypedInvoker } from "../core/bridgeFactory";

/**
 * Interface defining the monitor types domain API operations.
 *
 * @public
 */
export interface MonitorTypesApiInterface extends MonitorTypesDomainBridge {
    /**
     * Formats monitor detail information for display.
     */
    formatMonitorDetail: MonitorTypesDomainBridge["formatMonitorDetail"];
    /**
     * Formats monitor title suffix for display.
     */
    formatMonitorTitleSuffix: MonitorTypesDomainBridge["formatMonitorTitleSuffix"];
    /**
     * Gets all available monitor types and their configurations
     *
     * @returns Promise resolving to monitor types registry
     */
    getMonitorTypes: MonitorTypesDomainBridge["getMonitorTypes"];
    /**
     * Validates monitor configuration data.
     */
    validateMonitorData: MonitorTypesDomainBridge["validateMonitorData"];
}

/**
 * Monitor types domain API providing monitor type registry operations.
 *
 * @public
 */
export const monitorTypesApi: MonitorTypesApiInterface = {
    /**
     * Formats monitor detail information for display.
     */
    formatMonitorDetail: createTypedInvoker(
        MONITOR_TYPES_CHANNELS.formatMonitorDetail
    ),

    /**
     * Formats monitor title suffix for display.
     */
    formatMonitorTitleSuffix: createTypedInvoker(
        MONITOR_TYPES_CHANNELS.formatMonitorTitleSuffix
    ),

    /**
     * Gets all available monitor types and their configurations
     *
     * @returns Promise resolving to monitor types registry
     */
    getMonitorTypes: createTypedInvoker(MONITOR_TYPES_CHANNELS.getMonitorTypes),

    /**
     * Validates monitor configuration data.
     */
    validateMonitorData: createTypedInvoker(
        MONITOR_TYPES_CHANNELS.validateMonitorData
    ),
} as const;

/**
 * Type alias for the monitor types domain preload bridge.
 *
 * @public
 */
export type MonitorTypesApi = MonitorTypesDomainBridge;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
