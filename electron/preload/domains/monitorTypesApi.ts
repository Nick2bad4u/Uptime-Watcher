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

import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { ValidationResult } from "@shared/types/validation";

import { isMonitorTypeConfig } from "@shared/types/monitorTypes";
import {
    MONITOR_TYPES_CHANNELS,
    type MonitorTypesDomainBridge,
} from "@shared/types/preload";
import { isValidationResult } from "@shared/types/validation";
import { ensureError } from "@shared/utils/errorHandling";

import {
    createValidatedInvoker,
    type SafeParseLike,
    safeParseStringResult,
} from "../core/bridgeFactory";
import {
    acceptUnusedPreloadArguments,
    createPreloadDomain,
} from "../utils/preloadDomainFactory";

function safeParseValidationResult(
    candidate: unknown
): SafeParseLike<ValidationResult> {
    if (!isValidationResult(candidate)) {
        return {
            error: new Error(
                `Expected ValidationResult response payload, received ${
                    Array.isArray(candidate) ? "array" : typeof candidate
                }`
            ),
            success: false,
        };
    }

    return { data: candidate, success: true };
}

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
function createMonitorTypesApi(): MonitorTypesApiInterface {
    try {
        return {
            /**
             * Formats monitor detail information for display.
             */
            formatMonitorDetail: createValidatedInvoker(
                MONITOR_TYPES_CHANNELS.formatMonitorDetail,
                safeParseStringResult,
                {
                    domain: "monitorTypesApi",
                    guardName: "safeParseStringResult",
                }
            ),

            /**
             * Formats monitor title suffix for display.
             */
            formatMonitorTitleSuffix: createValidatedInvoker(
                MONITOR_TYPES_CHANNELS.formatMonitorTitleSuffix,
                safeParseStringResult,
                {
                    domain: "monitorTypesApi",
                    guardName: "safeParseStringResult",
                }
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
            validateMonitorData: createValidatedInvoker(
                MONITOR_TYPES_CHANNELS.validateMonitorData,
                safeParseValidationResult,
                {
                    domain: "monitorTypesApi",
                    guardName: "safeParseValidationResult",
                }
            ),
        } as const;
    } catch (error) {
        throw ensureError(error);
    }
}

const createMonitorTypesApiFallback = (
    unavailableError: Error
): MonitorTypesApiInterface => ({
        formatMonitorDetail: (
            ...args: Parameters<
                MonitorTypesApiInterface["formatMonitorDetail"]
            >
        ) => {
            acceptUnusedPreloadArguments(...args);
            return Promise.reject(unavailableError);
        },
        formatMonitorTitleSuffix: (
            ...args: Parameters<
                MonitorTypesApiInterface["formatMonitorTitleSuffix"]
            >
        ) => {
            acceptUnusedPreloadArguments(...args);
            return Promise.reject(unavailableError);
        },
        getMonitorTypes: (
            ...args: Parameters<MonitorTypesApiInterface["getMonitorTypes"]>
        ) => {
            acceptUnusedPreloadArguments(...args);
            return Promise.reject(unavailableError);
        },
        validateMonitorData: (
            ...args: Parameters<
                MonitorTypesApiInterface["validateMonitorData"]
            >
        ) => {
            acceptUnusedPreloadArguments(...args);
            return Promise.reject(unavailableError);
        },
    } as const);

export const monitorTypesApi: MonitorTypesApiInterface = createPreloadDomain({
    create: createMonitorTypesApi,
    createFallback: createMonitorTypesApiFallback,
    domain: "monitorTypesApi",
});

/**
 * Type alias for the monitor types domain preload bridge.
 *
 * @public
 */
export type MonitorTypesApi = MonitorTypesDomainBridge;
