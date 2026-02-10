import type { Site } from "@shared/types";

import { LOG_TEMPLATES } from "@shared/utils/logTemplates";

import type { MonitoringConfig } from "../../services/database/interfaces";
import type { IMonitoringOperations } from "../SiteManager.types";

import { logger } from "../../utils/logger";

/**
 * Creates the monitoring configuration wrapper used by {@link electron/managers/SiteManager#SiteManager}.
 *
 * @remarks
 * Extracted to keep `SiteManager.ts` smaller. This wrapper exists to provide a
 * stable contract to lower-level services while centralizing the
 * "monitoringOperations required" checks and error logging.
 */
export function createSiteMonitoringConfig(options: {
    readonly monitoringOperations: IMonitoringOperations | undefined;
}): MonitoringConfig {
    const { monitoringOperations } = options;

    return {
        setHistoryLimit: async (limit: number): Promise<void> => {
            if (!monitoringOperations) {
                throw new Error(
                    "MonitoringOperations not available but required for setHistoryLimit"
                );
            }

            try {
                await monitoringOperations.setHistoryLimit(limit);
            } catch (error) {
                logger.error(
                    LOG_TEMPLATES.errors.SITE_HISTORY_LIMIT_FAILED,
                    error
                );
                throw error;
            }
        },
        setupNewMonitors: async (
            site: Site,
            newMonitorIds: string[]
        ): Promise<void> => {
            if (!monitoringOperations) {
                throw new Error(
                    "MonitoringOperations not available but required for setupNewMonitors"
                );
            }

            await monitoringOperations.setupNewMonitors(site, newMonitorIds);
        },
        startMonitoring: async (
            identifier: string,
            monitorId: string
        ): Promise<boolean> => {
            if (!monitoringOperations) {
                throw new Error(
                    "MonitoringOperations not available but required for startMonitoring"
                );
            }

            return monitoringOperations.startMonitoringForSite(
                identifier,
                monitorId
            );
        },
        stopMonitoring: async (
            identifier: string,
            monitorId: string
        ): Promise<boolean> => {
            if (!monitoringOperations) {
                throw new Error(
                    "MonitoringOperations not available but required for stopMonitoring"
                );
            }

            return monitoringOperations.stopMonitoringForSite(
                identifier,
                monitorId
            );
        },
    };
}
