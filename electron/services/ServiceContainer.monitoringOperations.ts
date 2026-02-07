/**
 * Helper factory for creating the {@link IMonitoringOperations} adapter used by
 * {@link SiteManager}.
 *
 * @remarks
 * `ServiceContainer` must wire `SiteManager` to `MonitorManager` without
 * creating a hard compile-time dependency between the manager implementations.
 * This module centralizes the adapter construction so the container does not
 * need to carry a large inline object literal (and duplicated logging /
 * error-normalization logic) in the middle of its service registration code.
 */

import type { Site } from "@shared/types";

import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";

import type { DatabaseManager } from "../managers/DatabaseManager";
import type { MonitorManager } from "../managers/MonitorManager";
import type { IMonitoringOperations } from "../managers/SiteManager.types";

import { logger } from "../utils/logger";

/**
 * Input for {@link createMonitoringOperations}.
 */
export interface CreateMonitoringOperationsInput {
    /** Enables verbose diagnostics in development/test environments. */
    enableDebugLogging: boolean;
    /** Lazily resolves the {@link DatabaseManager} singleton. */
    getDatabaseManager: () => DatabaseManager;
    /** Lazily resolves the {@link MonitorManager} singleton. */
    getMonitorManager: () => MonitorManager;
}

/**
 * Creates the monitoring operations adapter passed into {@link SiteManager}.
 */
export function createMonitoringOperations(
    input: CreateMonitoringOperationsInput
): IMonitoringOperations {
    const { enableDebugLogging, getDatabaseManager, getMonitorManager } = input;

    return {
        setHistoryLimit: async (limit: number): Promise<void> => {
            try {
                const databaseManager = getDatabaseManager();
                await databaseManager.setHistoryLimit(limit);

                if (enableDebugLogging) {
                    logger.debug(
                        "[ServiceContainer] History limit set to %s via DatabaseManager",
                        limit
                    );
                }
            } catch (error) {
                logger.error("[ServiceContainer] Failed to set history limit", {
                    error: getUserFacingErrorDetail(error),
                    limit,
                });
                throw error;
            }
        },

        setupNewMonitors: async (
            site: Site,
            newMonitorIds: string[]
        ): Promise<void> => {
            const monitorManager = getMonitorManager();
            return monitorManager.setupNewMonitors(site, newMonitorIds);
        },

        startMonitoringForSite: async (
            identifier: string,
            monitorId: string
        ): Promise<boolean> => {
            const monitorManager = getMonitorManager();
            return monitorManager.startMonitoringForSite(identifier, monitorId);
        },

        stopMonitoringForSite: async (
            identifier: string,
            monitorId: string
        ): Promise<boolean> => {
            const monitorManager = getMonitorManager();
            return monitorManager.stopMonitoringForSite(identifier, monitorId);
        },
    };
}
