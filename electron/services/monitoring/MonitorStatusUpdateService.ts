/**
 * Monitor status update service with operation correlation support.
 *
 * @remarks
 * This service ensures that status updates from monitoring operations
 * are only applied if the operation is still valid and the monitor
 * is actively monitoring. Prevents race conditions between state changes
 * and delayed check results.
 *
 * @packageDocumentation
 */

import { Monitor } from "../../../shared/types";
import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "../../../shared/utils/logTemplates";
import { Site } from "../../types";
import { StandardizedCache } from "../../utils/cache/StandardizedCache";
import { monitorLogger as logger } from "../../utils/logger";
import { MonitorRepository } from "../database/MonitorRepository";
import { MonitorOperationRegistry } from "./MonitorOperationRegistry";

/**
 * Unified monitor check result interface for status updates.
 *
 * @remarks
 * This interface combines operation correlation fields with monitor check results.
 * Used by the status update service to validate and apply status changes.
 * Includes all fields from both registry and service interfaces.
 */
export interface StatusUpdateMonitorCheckResult {
    /** Optional human-readable details */
    details?: string;
    /** Optional error message */
    error?: string;
    /** Monitor that was checked */
    monitorId: string;
    /** Links to operation for validation */
    operationId: string;
    /** Response time in milliseconds */
    responseTime: number;
    /** Check result status */
    status: "down" | "up";
    /** When check completed */
    timestamp: Date;
}

/**
 * Service for conditionally updating monitor status based on operation correlation.
 *
 * @remarks
 * Validates operations before applying status updates to prevent race conditions
 * between monitor state changes and delayed check results.
 *
 * @public
 */
export class MonitorStatusUpdateService {
    /**
     * Creates a new MonitorStatusUpdateService.
     *
     * @param operationRegistry - Registry for validating operations
     * @param monitorRepository - Repository for monitor operations
     * @param sites - Site cache for updating cached monitor states
     */
    constructor(
        private readonly operationRegistry: MonitorOperationRegistry,
        private readonly monitorRepository: MonitorRepository,
        private readonly sites: StandardizedCache<Site>
    ) {}

    /**
     * Update monitor status only if the operation is still valid.
     *
     * @param result - Check result with operation correlation
     * @returns Promise resolving to true if update was applied, false if ignored
     */
    async updateMonitorStatus(
        result: StatusUpdateMonitorCheckResult
    ): Promise<boolean> {
        // Validate operation is still valid
        if (!this.operationRegistry.validateOperation(result.operationId)) {
            logger.debug(`Ignoring cancelled operation ${result.operationId}`);
            return false;
        }

        try {
            // Get current monitor state
            const monitor = await this.monitorRepository.findByIdentifier(
                result.monitorId
            );
            if (!monitor) {
                logger.warn(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.warnings.MONITOR_NOT_FOUND_CACHE,
                        {
                            monitorId: result.monitorId,
                        }
                    )
                );
                this.operationRegistry.completeOperation(result.operationId);
                return false;
            }

            // Only update if monitor is still actively monitoring
            if (!monitor.monitoring) {
                logger.debug(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.warnings.MONITOR_NOT_MONITORING,
                        {
                            monitorId: result.monitorId,
                        }
                    )
                );
                this.operationRegistry.completeOperation(result.operationId);
                return false;
            }

            // Update status atomically
            const updates: Partial<Monitor> = {
                lastChecked: result.timestamp,
                responseTime: result.responseTime,
                status: result.status === "up" ? "up" : "down",
            };

            // Remove operation from active operations
            const updatedActiveOperations = (
                monitor.activeOperations ?? []
            ).filter((op) => op !== result.operationId);
            updates.activeOperations = updatedActiveOperations;

            await this.monitorRepository.update(result.monitorId, updates);

            // Refresh the site cache to ensure UI shows updated monitor status
            await this.refreshSiteCacheForMonitor(result.monitorId);

            this.operationRegistry.completeOperation(result.operationId);
            logger.debug(
                `Updated monitor ${result.monitorId} status to ${result.status}`
            );
            return true;
        } catch (error) {
            logger.error(
                `Failed to update monitor status for ${result.monitorId}`,
                error
            );
            this.operationRegistry.completeOperation(result.operationId);
            return false;
        }
    }

    /**
     * Refreshes the site cache for the site containing the given monitor.
     *
     * @param monitorId - ID of the monitor whose site cache should be refreshed
     */
    private async refreshSiteCacheForMonitor(monitorId: string): Promise<void> {
        try {
            // Find the site containing this monitor
            const sites = this.sites.getAll();
            const site = sites.find((s) =>
                s.monitors.some((m) => m.id === monitorId)
            );

            if (!site) {
                logger.warn(
                    `Site not found for monitor ${monitorId}, cannot refresh cache`
                );
                return;
            }

            // Get fresh monitor data from database
            const freshMonitor =
                await this.monitorRepository.findByIdentifier(monitorId);
            if (!freshMonitor) {
                logger.warn(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.warnings.MONITOR_FRESH_DATA_MISSING,
                        { monitorId }
                    )
                );
                return;
            }

            // Update the cached site with fresh monitor data
            const updatedSite = {
                ...site,
                monitors: site.monitors.map((m) =>
                    m.id === monitorId ? freshMonitor : m
                ),
            };

            this.sites.set(site.identifier, updatedSite);
            logger.debug(
                `Refreshed site cache for monitor ${monitorId} in site ${site.identifier}`
            );
        } catch (error) {
            logger.warn(
                `Failed to refresh site cache for monitor ${monitorId}`,
                error
            );
            // Don't throw - cache refresh failure shouldn't break monitor updates
        }
    }
}
