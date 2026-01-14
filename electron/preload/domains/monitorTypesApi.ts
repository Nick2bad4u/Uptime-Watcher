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

import type { MonitorTypeConfig } from "@shared/types/monitorTypes";

import { isMonitorTypeConfig } from "@shared/types/monitorTypes";
import {
    MONITOR_TYPES_CHANNELS,
    type MonitorTypesDomainBridge,
} from "@shared/types/preload";

import {
    createTypedInvoker,
    createValidatedInvoker,
    type SafeParseLike,
} from "../core/bridgeFactory";

function safeParseMonitorTypeConfigs(
    candidate: unknown
): SafeParseLike<MonitorTypeConfig[]> {
    if (!Array.isArray(candidate)) {
        return {
            error: new Error(
                `Expected monitor type configuration array, received ${typeof candidate}`
            ),
            success: false,
        };
    }

    const typedConfigs = candidate.filter(isMonitorTypeConfig);
    if (typedConfigs.length !== candidate.length) {
        return {
            error: new Error(
                "Monitor type configuration array contained invalid entries"
            ),
            success: false,
        };
    }

    return {
        data: typedConfigs,
        success: true,
    };
}

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
    getMonitorTypes: createValidatedInvoker(
        MONITOR_TYPES_CHANNELS.getMonitorTypes,
        safeParseMonitorTypeConfigs,
        {
            domain: "monitorTypesApi",
            guardName: "safeParseMonitorTypeConfigs",
        }
    ),

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
