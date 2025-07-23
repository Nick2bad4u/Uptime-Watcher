import { isDev } from "../../electronUtils";
import { Site } from "../../types";
import { logger } from "../../utils/logger";

/**
 * Service for managing monitor scheduling and intervals.
 * Handles per-monitor interval timers and scheduling logic.
 *
 * @remarks
 * Manages individual timer intervals for each monitor, allowing different
 * check frequencies per monitor. Provides lifecycle management for starting,
 * stopping, and restarting monitoring operations.
 */
export class MonitorScheduler {
    private readonly intervals = new Map<string, NodeJS.Timeout>();

    /**
     * Callback function executed when a monitor check is scheduled.
     *
     * @remarks
     * This callback is responsible for performing the actual monitor check.
     * It should handle all monitor types and return appropriate results.
     *
     * Error handling:
     * - Errors are logged but don't stop the scheduling
     * - Critical startup errors may be re-thrown
     * - Failed checks don't affect other monitors
     *
     * Contract:
     * - Must be async and handle timeouts internally
     * - Should not throw for normal monitoring failures
     * - Should complete within reasonable time to avoid overlap
     *
     * @param siteIdentifier - Unique identifier for the site
     * @param monitorId - Unique identifier for the monitor
     * @returns Promise that resolves when check completes
     */
    private onCheckCallback?: (siteIdentifier: string, monitorId: string) => Promise<void>;

    /**
     * Get the number of active monitoring intervals.
     */
    public getActiveCount(): number {
        return this.intervals.size;
    }

    /**
     * Get all active monitoring keys.
     */
    public getActiveMonitors(): string[] {
        return [...this.intervals.keys()];
    }

    /**
     * Check if a monitor is currently being monitored.
     */
    public isMonitoring(siteIdentifier: string, monitorId: string): boolean {
        const intervalKey = this.createIntervalKey(siteIdentifier, monitorId);
        return this.intervals.has(intervalKey);
    }

    /**
     * Perform an immediate check for a monitor (used when starting monitoring).
     */
    public async performImmediateCheck(siteIdentifier: string, monitorId: string): Promise<void> {
        if (this.onCheckCallback) {
            try {
                await this.onCheckCallback(siteIdentifier, monitorId);
            } catch (error) {
                const intervalKey = this.createIntervalKey(siteIdentifier, monitorId);
                logger.error(`[MonitorScheduler] Error during immediate check for ${intervalKey}`, error);
            }
        }
    }

    /**
     * Restart monitoring for a specific monitor.
     *
     * @param siteIdentifier - Site identifier
     * @param monitor - Monitor configuration
     * @returns True if monitoring was successfully restarted, false if monitor has no ID
     *
     * @remarks
     * Stops existing monitoring for the monitor and starts fresh with current configuration.
     * Useful when monitor settings (like check interval) have changed.
     *
     * Return value semantics:
     * - true: Monitor was successfully stopped and restarted
     * - false: Monitor has no ID and cannot be monitored
     */
    public restartMonitor(siteIdentifier: string, monitor: Site["monitors"][0]): boolean {
        if (!monitor.id) {
            return false;
        }

        this.stopMonitor(siteIdentifier, monitor.id);
        return this.startMonitor(siteIdentifier, monitor);
    }

    /**
     * Set the callback function to execute when a monitor check is scheduled.
     */
    public setCheckCallback(callback: (siteIdentifier: string, monitorId: string) => Promise<void>): void {
        this.onCheckCallback = callback;
    }

    /**
     * Start monitoring for a specific monitor with its own interval.
     */
    public startMonitor(siteIdentifier: string, monitor: Site["monitors"][0]): boolean {
        if (!monitor.id) {
            logger.warn(`[MonitorScheduler] Cannot start monitoring for monitor without ID: ${siteIdentifier}`);
            return false;
        }

        const intervalKey = this.createIntervalKey(siteIdentifier, monitor.id);

        // Stop existing interval if any
        this.stopMonitor(siteIdentifier, monitor.id);

        // Validate and use monitor-specific checkInterval
        const checkInterval = this.validateCheckInterval(monitor.checkInterval);

        if (isDev()) {
            logger.debug(
                `[MonitorScheduler] Monitor checkInterval: ${monitor.checkInterval}, using: ${checkInterval}ms for ${siteIdentifier}|${monitor.id}`
            );
        }

        // Start interval immediately
        const interval = setInterval(() => {
            void (async () => {
                if (this.onCheckCallback) {
                    try {
                        await this.onCheckCallback(siteIdentifier, monitor.id);
                    } catch (error) {
                        logger.error(`[MonitorScheduler] Error during scheduled check for ${intervalKey}`, error);
                    }
                }
            })();
        }, checkInterval);

        this.intervals.set(intervalKey, interval);

        // Perform immediate check when starting (without waiting for interval)
        if (this.onCheckCallback) {
            this.performImmediateCheck(siteIdentifier, monitor.id).catch((error) => {
                logger.error(`[MonitorScheduler] Error during immediate check for ${intervalKey}`, error);
            });
        }

        if (isDev()) {
            logger.debug(
                `[MonitorScheduler] Started monitoring for ${intervalKey} with interval ${checkInterval}ms (immediate check triggered)`
            );
        }
        return true;
    }

    /**
     * Start monitoring for all monitors in a site.
     */
    public startSite(site: Site): void {
        for (const monitor of site.monitors) {
            if (monitor.monitoring && monitor.id) {
                this.startMonitor(site.identifier, monitor);
            }
        }
    }

    /**
     * Stop all monitoring intervals.
     */
    public stopAll(): void {
        for (const interval of this.intervals.values()) {
            clearInterval(interval);
        }
        this.intervals.clear();
        logger.info("[MonitorScheduler] Stopped all monitoring intervals");
    }

    /**
     * Stop monitoring for a specific monitor.
     *
     * @param siteIdentifier - Site identifier
     * @param monitorId - Monitor ID to stop
     * @returns True if monitoring was stopped, false if not currently monitoring
     *
     * @remarks
     * Clears the interval timer and removes the monitor from active tracking.
     * Safe to call even if monitor is not currently being monitored.
     *
     * Side effects:
     * - Clears associated interval timer
     * - Removes monitor from internal tracking
     * - Logs debug information about the stop operation
     */
    public stopMonitor(siteIdentifier: string, monitorId: string): boolean {
        const intervalKey = this.createIntervalKey(siteIdentifier, monitorId);
        const interval = this.intervals.get(intervalKey);

        if (interval) {
            clearInterval(interval);
            this.intervals.delete(intervalKey);
            logger.debug(`[MonitorScheduler] Stopped monitoring for ${intervalKey}`);
            return true;
        }

        return false;
    }

    /**
     * Stop monitoring for all monitors in a site.
     */
    public stopSite(siteIdentifier: string, monitors?: Site["monitors"]): void {
        if (monitors) {
            // Stop specific monitors
            for (const monitor of monitors) {
                if (monitor.id) {
                    this.stopMonitor(siteIdentifier, monitor.id);
                }
            }
        } else {
            // Stop all monitors for this site
            const siteIntervals = [...this.intervals.keys()].filter((key) => key.startsWith(`${siteIdentifier}|`));
            for (const intervalKey of siteIntervals) {
                const parsed = this.parseIntervalKey(intervalKey);
                if (parsed) {
                    this.stopMonitor(parsed.siteIdentifier, parsed.monitorId);
                }
            }
        }
    }

    /**
     * Create standardized interval key.
     *
     * @param siteIdentifier - Site identifier
     * @param monitorId - Monitor ID
     * @returns Formatted interval key
     */
    private createIntervalKey(siteIdentifier: string, monitorId: string): string {
        return `${siteIdentifier}|${monitorId}`;
    }

    /**
     * Parse interval key into components.
     *
     * @param intervalKey - Formatted interval key
     * @returns Parsed components or null if invalid
     */
    private parseIntervalKey(intervalKey: string): null | { monitorId: string; siteIdentifier: string } {
        const parts = intervalKey.split("|");
        if (parts.length !== 2) return null;

        const [siteIdentifier, monitorId] = parts;
        if (!siteIdentifier || !monitorId) return null;

        return { monitorId, siteIdentifier };
    }

    /**
     * Validate monitor check interval.
     *
     * @param checkInterval - Interval value to validate
     * @returns Validated interval or throws error
     *
     * @remarks
     * Ensures check interval is a positive number to prevent setInterval issues.
     * Very short intervals (\< 1000ms) generate warnings for performance.
     */
    private validateCheckInterval(checkInterval: number): number {
        if (!Number.isInteger(checkInterval) || checkInterval <= 0) {
            throw new Error(`Invalid check interval: ${checkInterval}. Must be a positive integer.`);
        }

        // Minimum interval to prevent excessive CPU usage
        const MIN_INTERVAL = 1000; // 1 second
        if (checkInterval < MIN_INTERVAL) {
            logger.warn(`Check interval ${checkInterval}ms is very short, minimum recommended: ${MIN_INTERVAL}ms`);
        }

        return checkInterval;
    }
}
