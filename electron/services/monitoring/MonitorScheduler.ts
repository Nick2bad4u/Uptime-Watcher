import { isDev } from "../../electronUtils";
import { Site } from "../../types";
import { logger } from "../../utils/logger";

/**
 * Manages scheduling and execution of monitor checks for sites.
 *
 * @remarks
 * - Maintains per-monitor interval timers, allowing different check frequencies.
 * - Provides lifecycle management for starting, stopping, and restarting monitoring operations.
 * - All monitor checks are triggered via an async callback.
 * - Errors during checks are logged and do not affect other monitors.
 *
 * @public
 */
export class MonitorScheduler {
    /**
     * Map of interval keys to active NodeJS.Timeout objects.
     *
     * @remarks
     * Keys are formatted as `${siteIdentifier}|${monitorId}`.
     *
     * @internal
     * @readonly
     */
    private readonly intervals = new Map<string, NodeJS.Timeout>();

    /**
     * Callback invoked to perform a monitor check.
     *
     * @remarks
     * - Must be set via {@link setCheckCallback} before starting monitoring.
     * - Should be async and handle timeouts internally.
     * - Errors are logged but do not interrupt scheduling.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitorId - Unique identifier for the monitor.
     * @returns Promise resolving when the check completes.
     *
     * @internal
     */
    private onCheckCallback?: (siteIdentifier: string, monitorId: string) => Promise<void>;

    /**
     * Returns the number of active monitoring intervals.
     *
     * @returns Number of currently scheduled monitor intervals.
     *
     * @public
     */
    public getActiveCount(): number {
        return this.intervals.size;
    }

    /**
     * Returns all active monitor interval keys.
     *
     * @returns Array of interval keys in the format `${siteIdentifier}|${monitorId}`.
     *
     * @public
     */
    public getActiveMonitors(): string[] {
        return [...this.intervals.keys()];
    }

    /**
     * Determines if a monitor is currently being scheduled.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitorId - Unique identifier for the monitor.
     * @returns True if the monitor is actively scheduled; otherwise, false.
     *
     * @public
     */
    public isMonitoring(siteIdentifier: string, monitorId: string): boolean {
        const intervalKey = this.createIntervalKey(siteIdentifier, monitorId);
        return this.intervals.has(intervalKey);
    }

    /**
     * Performs an immediate check for a monitor.
     *
     * @remarks
     * - Invokes the registered check callback for the specified monitor.
     * - Errors are logged and do not interrupt execution.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitorId - Unique identifier for the monitor.
     * @returns Promise resolving when the check completes.
     *
     * @throws Any error thrown by the callback is caught and logged.
     *
     * @public
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
     * Restarts monitoring for a specific monitor.
     *
     * @remarks
     * - Stops any existing interval for the monitor, then starts a new one.
     * - Useful when monitor settings (e.g., interval) change.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitor - Monitor configuration object.
     * @returns True if monitoring was restarted; false if monitor has no ID.
     *
     * @example
     * ```typescript
     * scheduler.restartMonitor("siteA", monitorObj);
     * ```
     *
     * @public
     */
    public restartMonitor(siteIdentifier: string, monitor: Site["monitors"][0]): boolean {
        if (!monitor.id) {
            return false;
        }

        this.stopMonitor(siteIdentifier, monitor.id);
        return this.startMonitor(siteIdentifier, monitor);
    }

    /**
     * Registers the callback to execute when a monitor check is scheduled.
     *
     * @remarks
     * - Must be called before starting any monitoring.
     * - The callback should be async and handle errors internally.
     *
     * @param callback - Function to execute for each scheduled monitor check.
     *
     * @example
     * ```typescript
     * scheduler.setCheckCallback(async (siteId, monitorId) => { ... });
     * ```
     *
     * @public
     */
    public setCheckCallback(callback: (siteIdentifier: string, monitorId: string) => Promise<void>): void {
        this.onCheckCallback = callback;
    }

    /**
     * Starts monitoring for a specific monitor with its own interval.
     *
     * @remarks
     * - Stops any existing interval for the monitor before starting.
     * - Validates and applies the monitor's checkInterval.
     * - Triggers an immediate check after starting.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitor - Monitor configuration object.
     * @returns True if monitoring started; false if monitor has no ID.
     *
     * @throws Error if checkInterval is invalid.
     *
     * @example
     * ```typescript
     * scheduler.startMonitor("siteA", monitorObj);
     * ```
     *
     * @public
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
     * Starts monitoring for all monitors in a site.
     *
     * @remarks
     * - Only monitors with `monitoring: true` and a valid ID are started.
     *
     * @param site - Site configuration object containing monitors.
     *
     * @example
     * ```typescript
     * scheduler.startSite(siteObj);
     * ```
     *
     * @public
     */
    public startSite(site: Site): void {
        for (const monitor of site.monitors) {
            if (monitor.monitoring && monitor.id) {
                this.startMonitor(site.identifier, monitor);
            }
        }
    }

    /**
     * Stops all monitoring intervals.
     *
     * @remarks
     * - Clears all interval timers and removes all monitors from tracking.
     * - Logs an info message when complete.
     *
     * @example
     * ```typescript
     * scheduler.stopAll();
     * ```
     *
     * @public
     */
    public stopAll(): void {
        for (const interval of this.intervals.values()) {
            clearInterval(interval);
        }
        this.intervals.clear();
        logger.info("[MonitorScheduler] Stopped all monitoring intervals");
    }

    /**
     * Stops monitoring for a specific monitor.
     *
     * @remarks
     * - Clears the interval timer and removes the monitor from tracking.
     * - Safe to call even if monitor is not currently monitored.
     * - Logs debug information about the stop operation.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitorId - Unique identifier for the monitor.
     * @returns True if monitoring was stopped; false if not currently monitored.
     *
     * @example
     * ```typescript
     * scheduler.stopMonitor("siteA", "monitor123");
     * ```
     *
     * @public
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
     * Stops monitoring for all monitors in a site.
     *
     * @remarks
     * - If `monitors` is provided, only those monitors are stopped.
     * - Otherwise, all monitors for the site are stopped.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitors - Optional array of monitor configurations to stop.
     *
     * @example
     * ```typescript
     * scheduler.stopSite("siteA");
     * scheduler.stopSite("siteA", [monitorObj1, monitorObj2]);
     * ```
     *
     * @public
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
     * Creates a standardized interval key for monitor tracking.
     *
     * @remarks
     * - Format: `${siteIdentifier}|${monitorId}`.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitorId - Unique identifier for the monitor.
     * @returns Formatted interval key string.
     *
     * @example
     * ```typescript
     * const key = scheduler.createIntervalKey("siteA", "monitor123");
     * ```
     *
     * @internal
     */
    private createIntervalKey(siteIdentifier: string, monitorId: string): string {
        return `${siteIdentifier}|${monitorId}`;
    }

    /**
     * Parses an interval key into its components.
     *
     * @remarks
     * - Returns null if the key is invalid.
     *
     * @param intervalKey - Interval key string in the format `${siteIdentifier}|${monitorId}`.
     * @returns Object with `siteIdentifier` and `monitorId`, or null if invalid.
     *
     * @example
     * ```typescript
     * const parsed = scheduler.parseIntervalKey("siteA|monitor123");
     * // parsed = { siteIdentifier: "siteA", monitorId: "monitor123" }
     * ```
     *
     * @internal
     */
    private parseIntervalKey(intervalKey: string): null | { monitorId: string; siteIdentifier: string } {
        const parts = intervalKey.split("|");
        if (parts.length !== 2) return null;

        const [siteIdentifier, monitorId] = parts;
        if (!siteIdentifier || !monitorId) return null;

        return { monitorId, siteIdentifier };
    }

    /**
     * Validates a monitor's check interval value.
     *
     * @remarks
     * - Ensures the interval is a positive integer.
     * - Warns if interval is less than 1000ms.
     * - Throws if interval is invalid.
     *
     * @param checkInterval - Interval value in milliseconds.
     * @returns Validated interval value.
     *
     * @throws Error if interval is not a positive integer.
     *
     * @example
     * ```typescript
     * const interval = scheduler.validateCheckInterval(5000);
     * ```
     *
     * @internal
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
