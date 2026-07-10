/**
 * Monitor status update service with operation correlation support.
 *
 * @remarks
 * This service ensures that status updates from monitoring operations are only
 * applied if the operation is still valid and the monitor is actively
 * monitoring. Prevents race conditions between state changes and delayed check
 * results.
 *
 * @packageDocumentation
 */

import type { Monitor, Site } from "@shared/types";

import { getSafeIdentifierForLogging } from "@shared/utils/identifierLogging";
import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import type { StandardizedCache } from "../../utils/cache/StandardizedCache";
import type { MonitorRepository } from "../database/MonitorRepository";
import type { MonitorOperationRegistry } from "./MonitorOperationRegistry";
import type { OperationTimeoutManager } from "./OperationTimeoutManager";

import { monitorLogger as logger } from "../../utils/logger";

const getSafeIdentifier = (identifier: string): string =>
    getSafeIdentifierForLogging(identifier) ?? identifier;

/**
 * Unified monitor check result interface for status updates.
 *
 * @remarks
 * This interface combines operation correlation fields with monitor check
 * results. Used by the status update service to validate and apply status
 * changes. Includes all fields from both registry and service interfaces.
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
    status:
        | "degraded"
        | "down"
        | "up";
    /** When check completed */
    timestamp: Date;
}

/**
 * Service for conditionally updating monitor status based on operation
 * correlation.
 *
 * @remarks
 * Validates operations before applying status updates to prevent race
 * conditions between monitor state changes and delayed check results.
 *
 * @public
 */
export class MonitorStatusUpdateService {
    /**
     * Repository for monitor operations
     */
    private readonly monitorRepository: MonitorRepository;

    /**
     * Registry for validating operations
     */
    private readonly operationRegistry: MonitorOperationRegistry;

    /**
     * Site cache for updating cached monitor states
     */
    private readonly sites: StandardizedCache<Site>;

    /**
     * Timeout manager used to clear operation timers once operations complete.
     */
    private readonly timeoutManager: OperationTimeoutManager;

    /**
     * Creates a new MonitorStatusUpdateService.
     *
     * @param operationRegistry - Registry for validating operations
     * @param monitorRepository - Repository for monitor operations
     * @param sites - Site cache for updating cached monitor states
     */
    public constructor(
        operationRegistry: MonitorOperationRegistry,
        monitorRepository: MonitorRepository,
        sites: StandardizedCache<Site>,
        timeoutManager: OperationTimeoutManager
    ) {
        this.operationRegistry = operationRegistry;
        this.monitorRepository = monitorRepository;
        this.sites = sites;
        this.timeoutManager = timeoutManager;
    }

    /**
     * Update monitor status only if the operation is still valid.
     *
     * @param result - Check result with operation correlation
     *
     * @returns Promise resolving to true if update was applied, false if
     *   ignored
     */
    public async updateMonitorStatus(
        result: StatusUpdateMonitorCheckResult
    ): Promise<boolean> {
        try {
            // Validate operation is still valid. Even when invalid/cancelled,
            // we still want to prune stale activeOperations entries and clear
            // the timeout so we don't accumulate pending timers.
            if (!this.operationRegistry.validateOperation(result.operationId)) {
                logger.debug(
                    `Ignoring cancelled operation ${result.operationId}`
                );

                const monitor = await this.monitorRepository.findByIdentifier(
                    result.monitorId
                );
                if (monitor) {
                    await this.pruneOperationFromMonitor(
                        monitor,
                        result.operationId
                    );
                }

                return false;
            }

            // Get current monitor state
            const monitor = await this.monitorRepository.findByIdentifier(
                result.monitorId
            );
            if (!monitor) {
                const safeMonitorId = getSafeIdentifier(result.monitorId);
                logger.warn(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.warnings.MONITOR_NOT_FOUND_CACHE,
                        {
                            monitorId: safeMonitorId,
                        }
                    )
                );
                return false;
            }

            // Only update if monitor is still actively monitoring
            if (!monitor.monitoring) {
                const safeMonitorId = getSafeIdentifier(result.monitorId);
                logger.debug(
                    interpolateLogTemplate(
                        LOG_TEMPLATES.warnings.MONITOR_NOT_MONITORING,
                        {
                            monitorId: safeMonitorId,
                        }
                    )
                );
                await this.pruneOperationFromMonitor(
                    monitor,
                    result.operationId
                );
                return false;
            }

            // Update status atomically
            const updates: Partial<Monitor> = {
                lastChecked: result.timestamp,
                responseTime: result.responseTime,
                status: result.status,
            };

            // Remove operation from active operations
            const updatedActiveOperations = (
                monitor.activeOperations ?? []
            ).filter((op) => op !== result.operationId);
            updates.activeOperations = updatedActiveOperations;

            await this.monitorRepository.update(result.monitorId, updates);

            // Refresh the site cache to ensure UI shows updated monitor status
            await this.refreshSiteCacheForMonitor(result.monitorId);

            const safeMonitorId = getSafeIdentifier(result.monitorId);
            logger.debug(
                `Updated monitor ${safeMonitorId} status to ${result.status}`
            );
            return true;
        } catch (error) {
            const safeMonitorId = getSafeIdentifier(result.monitorId);
            logger.error(
                `Failed to update monitor status for ${safeMonitorId}`,
                error
            );
            await this.clearPersistedOperationState(result.monitorId);
            return false;
        } finally {
            this.cleanupOperationResources(result.operationId);
        }
    }

    private cleanupOperationResources(operationId: string): void {
        // Clear timer first so the process doesn't retain a pending timeout.
        this.timeoutManager.clearTimeout(operationId);
        this.operationRegistry.completeOperation(operationId);
    }

    private async clearPersistedOperationState(
        monitorId: string
    ): Promise<void> {
        try {
            await this.monitorRepository.clearActiveOperations(monitorId);
        } catch (error) {
            logger.warn(
                "Failed to clear persisted operations after status update failure",
                error,
                { monitorId: getSafeIdentifier(monitorId) }
            );
        }
    }

    private async pruneOperationFromMonitor(
        monitor: Monitor,
        operationId: string
    ): Promise<void> {
        const current = monitor.activeOperations ?? [];
        const updated = current.filter((op) => op !== operationId);

        if (updated.length === current.length) {
            return;
        }

        await this.monitorRepository.update(monitor.id, {
            activeOperations: updated,
        });
    }

    /**
     * Refreshes the site cache for the site containing the given monitor.
     *
     * @param monitorId - ID of the monitor whose site cache should be refreshed
     */
    private async refreshSiteCacheForMonitor(monitorId: string): Promise<void> {
        const safeMonitorId = getSafeIdentifier(monitorId);

        try {
            // Find the site containing this monitor
            const sites = this.sites.getAll();
            const site = sites.find((s) =>
                s.monitors.some((m) => m.id === monitorId)
            );

            if (!site) {
                logger.warn(
                    `Site not found for monitor ${safeMonitorId}, cannot refresh cache`
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
                        { monitorId: safeMonitorId }
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
            const safeSiteIdentifier = getSafeIdentifier(site.identifier);
            logger.debug(
                `Refreshed site cache for monitor ${safeMonitorId} in site ${safeSiteIdentifier}`
            );
        } catch (error) {
            logger.warn(
                `Failed to refresh site cache for monitor ${safeMonitorId}`,
                error
            );
            // Don't throw - cache refresh failure shouldn't break monitor
            // updates
        }
    }
}
