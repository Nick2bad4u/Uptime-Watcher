/**
 * Utility function for checking individual monitors.
 * This is extracted from UptimeMonitor to improve modularity and maintainability.
 */

import { EventEmitter } from "events";

import { DEFAULT_REQUEST_TIMEOUT } from "../../constants";
import { HistoryRepository, MonitorRepository, SiteRepository } from "../../services/database";
import { MonitorFactory } from "../../services/monitoring";
import { Site, StatusHistory, StatusUpdate } from "../../types";

type Logger = {
    debug: (message: string, ...args: unknown[]) => void;
    error: (message: string, error?: unknown, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
};

/**
 * Configuration object for monitor checking functions.
 */
export interface MonitorCheckConfig {
    repositories: {
        history: HistoryRepository;
        monitor: MonitorRepository;
        site: SiteRepository;
    };
    sites: Map<string, Site>;
    eventEmitter: EventEmitter;
    logger: Logger;
    historyLimit: number;
    statusUpdateEvent: string;
}

/**
 * Check a specific monitor and update its status.
 *
 * @param config - Configuration object with required dependencies
 * @param site - Site containing the monitor to check
 * @param monitorId - ID of the monitor to check
 * @returns Promise\<StatusUpdate | undefined\> - Status update result or undefined if error
 */
export async function checkMonitor(
    config: MonitorCheckConfig,
    site: Site,
    monitorId: string
): Promise<StatusUpdate | undefined> {
    const monitor = site.monitors.find((m) => String(m.id) === String(monitorId));
    if (!monitor) {
        config.logger.error(`[checkMonitor] Monitor not found for id: ${monitorId} on site: ${site.identifier}`);
        return;
    }
    // Ensure monitor.id is present and valid before proceeding
    if (!monitor.id) {
        config.logger.error(`[checkMonitor] Monitor missing id for ${site.identifier}, skipping history insert.`);
        return;
    }
    config.logger.info(`[checkMonitor] Checking monitor: site=${site.identifier}, id=${monitor.id}`);

    // Use the monitoring service to perform the check
    const getCheckResult = async () => {
        try {
            const monitorService = MonitorFactory.getMonitor(monitor.type, {
                timeout: DEFAULT_REQUEST_TIMEOUT,
            });
            return await monitorService.check(monitor);
        } catch (error) {
            config.logger.error(`[checkMonitor] Error using monitor service for type ${monitor.type}`, error);
            return {
                details: "0",
                error: "Monitor service error",
                responseTime: 0,
                status: "down" as const,
            };
        }
    };

    const checkResult = await getCheckResult();

    const previousStatus = monitor.status;
    const now = new Date();

    // Update monitor with results
    monitor.status = checkResult.status;
    monitor.responseTime = checkResult.responseTime;
    monitor.lastChecked = now;
    // Add to history
    const historyEntry: StatusHistory = {
        responseTime: checkResult.responseTime,
        status: checkResult.status,
        timestamp: now.getTime(),
    };

    try {
        // Add history entry using repository
        await config.repositories.history.addEntry(monitor.id, historyEntry, checkResult.details);

        config.logger.info(
            `[checkMonitor] Inserted history row: monitor_id=${monitor.id}, status=${historyEntry.status}, responseTime=${historyEntry.responseTime}, timestamp=${historyEntry.timestamp}, details=${checkResult.details ?? "undefined"}`
        );
    } catch (err) {
        config.logger.error(`[checkMonitor] Failed to insert history row: monitor_id=${monitor.id}`, err);
    }

    // Trim history if needed using repository
    // Use smart history management for optimal UI experience
    if (config.historyLimit > 0) {
        // Calculate effective limit: ensure we always keep enough for large screen displays
        // This prevents premature pruning that would leave charts looking sparse
        const minRequiredForUI = 60; // Enough for large screens with high DPI
        const effectiveLimit = Math.max(config.historyLimit, minRequiredForUI);
        await config.repositories.history.pruneHistory(monitor.id, effectiveLimit);
    }

    // Update monitor with new status using repository
    await config.repositories.monitor.update(monitor.id, {
        lastChecked: monitor.lastChecked,
        responseTime: monitor.responseTime,
        status: monitor.status,
    });

    // Fetch fresh site data from database to ensure we have the latest history and monitor state
    const freshSiteData = await config.repositories.site.getByIdentifier(site.identifier);
    if (!freshSiteData) {
        config.logger.error(`[checkMonitor] Failed to fetch updated site data for ${site.identifier}`);
        return;
    }

    // Update the in-memory cache with fresh data
    config.sites.set(site.identifier, freshSiteData);

    // Emit StatusUpdate with fresh site data including updated history
    const statusUpdate: StatusUpdate = {
        previousStatus,
        site: freshSiteData,
    };
    config.eventEmitter.emit(config.statusUpdateEvent, statusUpdate);

    // Emit monitor state change events with consistent payload
    if (previousStatus === "up" && checkResult.status === "down") {
        config.eventEmitter.emit("site-monitor-down", {
            monitor: { ...monitor },
            monitorId: monitor.id,
            site: { ...site, monitors: site.monitors.map((m) => ({ ...m })) },
        });
    } else if (previousStatus === "down" && checkResult.status === "up") {
        config.eventEmitter.emit("site-monitor-up", {
            monitor: { ...monitor },
            monitorId: monitor.id,
            site: { ...site, monitors: site.monitors.map((m) => ({ ...m })) },
        });
    }
    return statusUpdate;
}

/**
 * Check a site's monitor manually.
 *
 * @param config - Configuration object with required dependencies
 * @param identifier - Site identifier
 * @param monitorId - Optional monitor ID, uses first monitor if not provided
 * @returns Promise\<StatusUpdate | undefined\> - Status update result or undefined if error
 */
export async function checkSiteManually(
    config: MonitorCheckConfig,
    identifier: string,
    monitorId?: string
): Promise<StatusUpdate | undefined> {
    const site = config.sites.get(identifier);
    if (!site) {
        throw new Error(`Site not found: ${identifier}`);
    }

    // If no monitorId provided, use the first monitor's ID
    const targetMonitorId =
        monitorId ??
        (() => {
            const firstMonitor = site.monitors[0];
            if (!firstMonitor?.id) {
                throw new Error(`No monitors found for site ${identifier}`);
            }
            return String(firstMonitor.id);
        })();

    // Validate the monitor exists
    const monitor = site.monitors.find((m) => String(m.id) === String(targetMonitorId));
    if (!monitor) {
        throw new Error(`Monitor with ID ${targetMonitorId} not found for site ${identifier}`);
    }

    const result = await checkMonitor(config, site, targetMonitorId);
    return result || undefined;
}
