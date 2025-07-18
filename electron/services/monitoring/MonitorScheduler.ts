import { isDev } from "../../electronUtils";
import { Site } from "../../types";
import { logger } from "../../utils/logger";

/**
 * Service for managing monitor scheduling and intervals.
 * Handles per-monitor interval timers and scheduling logic.
 */
export class MonitorScheduler {
    private readonly intervals = new Map<string, NodeJS.Timeout>();
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
        const intervalKey = `${siteIdentifier}|${monitorId}`;
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
                logger.error(
                    `[MonitorScheduler] Error during immediate check for ${siteIdentifier}|${monitorId}`,
                    error
                );
            }
        }
    }

    /**
     * Restart monitoring for a specific monitor (useful when interval changes).
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

        const intervalKey = `${siteIdentifier}|${monitor.id}`;

        // Stop existing interval if any
        this.stopMonitor(siteIdentifier, monitor.id);

        // Use monitor-specific checkInterval
        const checkInterval = monitor.checkInterval;

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
     */
    public stopMonitor(siteIdentifier: string, monitorId: string): boolean {
        const intervalKey = `${siteIdentifier}|${monitorId}`;
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
                const [, monitorId] = intervalKey.split("|");
                if (monitorId) {
                    this.stopMonitor(siteIdentifier, monitorId);
                }
            }
        }
    }
}
