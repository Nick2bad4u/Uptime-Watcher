import { isDev } from "../../electronUtils";
import { Site } from "../../types";
import { logger } from "../../utils/logger";
import { MIN_CHECK_INTERVAL } from "./constants";

/**
 * Manages scheduling, execution, and lifecycle of monitor checks for sites and their monitors.
 *
 * @remarks
 * Maintains per-monitor interval timers, supports dynamic check intervals, and provides lifecycle management for starting, stopping, and restarting monitoring operations. All monitor checks are triggered via an async callback, and errors during checks are logged without affecting other monitors. Designed for robust, event-driven monitoring orchestration.
 *
 * @example
 * ```typescript
 * const scheduler = new MonitorScheduler();
 * scheduler.setCheckCallback(async (siteId, monitorId) => { ... });
 * scheduler.startSite(siteObj);
 * ```
 *
 * @public
 */
export class MonitorScheduler {
    /**
     * Map of interval keys to active NodeJS.Timeout objects.
     *
     * @remarks
     * Keys are formatted as `${siteIdentifier}|${monitorId}`. Used internally to track all active monitor intervals for efficient management and lookup.
     *
     * @internal
     * @readonly
     */
    private readonly intervals = new Map<string, NodeJS.Timeout>();

    /**
     * Callback invoked to perform a monitor check for a given site and monitor.
     *
     * @remarks
     * Must be set via {@link setCheckCallback} before starting monitoring. The callback should be async and handle timeouts and errors internally. Errors are logged but do not interrupt scheduling.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitorId - Unique identifier for the monitor.
     * @returns Promise resolving when the check completes.
     *
     * @internal
     */
    private onCheckCallback?: (siteIdentifier: string, monitorId: string) => Promise<void>;

    /**
     * Returns the number of currently active monitoring intervals.
     *
     * @returns The number of scheduled monitor intervals.
     *
     * @public
     */
    public getActiveCount(): number {
        return this.intervals.size;
    }

    /**
     * Returns all active monitor interval keys.
     *
     * @returns An array of interval keys in the format `${siteIdentifier}|${monitorId}`.
     *
     * @public
     */
    public getActiveMonitors(): string[] {
        return Array.from(this.intervals.keys());
    }

    /**
     * Determines if a monitor is currently being scheduled and actively monitored.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitorId - Unique identifier for the monitor.
     * @returns `true` if the monitor is actively scheduled; otherwise, `false`.
     *
     * @public
     */
    public isMonitoring(siteIdentifier: string, monitorId: string): boolean {
        const intervalKey = this.createIntervalKey(siteIdentifier, monitorId);
        return this.intervals.has(intervalKey);
    }

    /**
     * Performs an immediate check for a specific monitor by invoking the registered check callback.
     *
     * @remarks
     * Invokes the registered check callback for the specified monitor. Errors are logged and do not interrupt execution. If no callback is set, this method does nothing.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitorId - Unique identifier for the monitor.
     * @returns A promise that resolves when the check completes.
     *
     * @throws Any error thrown by the callback is caught and logged; errors are not re-thrown.
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
     * Stops any existing interval for the monitor, then starts a new one. Useful when monitor settings (such as interval) change. If the monitor has no ID, no action is taken.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitor - Monitor configuration object.
     * @returns `true` if monitoring was restarted; `false` if the monitor has no ID.
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
     * Must be called before starting any monitoring. The callback should be async and handle errors internally. This callback is invoked for every scheduled or immediate monitor check.
     *
     * @param callback - Function to execute for each scheduled monitor check. Receives the site identifier and monitor ID.
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
     * Stops any existing interval for the monitor before starting. Validates and applies the monitor's checkInterval. Triggers an immediate check after starting. Throws if the checkInterval is invalid. If the monitor has no ID, no action is taken.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitor - Monitor configuration object.
     * @returns `true` if monitoring started; `false` if the monitor has no ID.
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
            void (async () => {
                try {
                    await this.performImmediateCheck(siteIdentifier, monitor.id);
                } catch (error) {
                    logger.error(`[MonitorScheduler] Error during immediate check for ${intervalKey}`, error);
                }
            })();
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
     * Only monitors with `monitoring: true` and a valid ID are started. This method is idempotent and safe to call multiple times.
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
     * Stops all monitoring intervals and clears all tracked monitors.
     *
     * @remarks
     * Clears all interval timers and removes all monitors from tracking. Logs an info message when complete. Safe to call even if no monitors are active.
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
     * Clears the interval timer and removes the monitor from tracking. Safe to call even if the monitor is not currently monitored. Logs debug information about the stop operation.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitorId - Unique identifier for the monitor.
     * @returns `true` if monitoring was stopped; `false` if not currently monitored.
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
     * If `monitors` is provided, only those monitors are stopped. Otherwise, all monitors for the site are stopped. Safe to call even if no monitors are active for the site.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitors - Optional array of monitor configurations to stop. If omitted, all monitors for the site are stopped.
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
            const siteIntervals = Array.from(this.intervals.keys()).filter((key) =>
                key.startsWith(`${siteIdentifier}|`)
            );
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
     * Format: `${siteIdentifier}|${monitorId}`. Used internally for consistent lookup and management of monitor intervals.
     *
     * @param siteIdentifier - Unique identifier for the site.
     * @param monitorId - Unique identifier for the monitor.
     * @returns The formatted interval key string.
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
     * Parses an interval key into its site and monitor components.
     *
     * @remarks
     * Returns `null` if the key is invalid or does not match the expected format.
     *
     * @param intervalKey - Interval key string in the format `${siteIdentifier}|${monitorId}`.
     * @returns An object with `siteIdentifier` and `monitorId`, or `null` if invalid.
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
     * Ensures the interval is a positive integer. Warns if the interval is less than 1000ms. Throws if the interval is invalid.
     *
     * @param checkInterval - Interval value in milliseconds.
     * @returns The validated interval value.
     *
     * @throws Error if the interval is not a positive integer.
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
        if (checkInterval < MIN_CHECK_INTERVAL) {
            logger.warn(
                `Check interval ${checkInterval}ms is very short, minimum recommended: ${MIN_CHECK_INTERVAL}ms`
            );
        }

        return checkInterval;
    }
}
