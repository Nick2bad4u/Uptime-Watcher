import { DEFAULT_CHECK_INTERVAL } from "../../constants";
import { isDev } from "../../electronUtils";
import { Site } from "../../types";
import { logger } from "../../utils/logger";

/**
 * Service for managing monitor scheduling and intervals.
 * Handles per-monitor interval timers and scheduling logic.
 */
export class MonitorScheduler {
    private readonly intervals: Map<string, NodeJS.Timeout> = new Map();
    private onCheckCallback?: (siteIdentifier: string, monitorId: string) => Promise<void>;

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

        // Use monitor-specific checkInterval, fallback to default (5 minutes)
        const checkInterval = monitor.checkInterval ?? DEFAULT_CHECK_INTERVAL;

        if (isDev()) {
            logger.debug(
                `[MonitorScheduler] Monitor checkInterval: ${monitor.checkInterval}, using: ${checkInterval}ms for ${siteIdentifier}|${monitor.id}`
            );
        }

        const interval = setInterval(async () => {
            if (this.onCheckCallback) {
                try {
                    await this.onCheckCallback(siteIdentifier, monitor.id);
                } catch (error) {
                    logger.error(`[MonitorScheduler] Error during scheduled check for ${intervalKey}`, error);
                }
            }
        }, checkInterval);

        this.intervals.set(intervalKey, interval);

        if (isDev()) {
            logger.debug(`[MonitorScheduler] Started monitoring for ${intervalKey} with interval ${checkInterval}ms`);
        }
        return true;
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
            const siteIntervals = Array.from(this.intervals.keys()).filter((key) =>
                key.startsWith(`${siteIdentifier}|`)
            );
            for (const intervalKey of siteIntervals) {
                const [, monitorId] = intervalKey.split("|");
                this.stopMonitor(siteIdentifier, monitorId);
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
     * Check if a monitor is currently being monitored.
     */
    public isMonitoring(siteIdentifier: string, monitorId: string): boolean {
        const intervalKey = `${siteIdentifier}|${monitorId}`;
        return this.intervals.has(intervalKey);
    }

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
        return Array.from(this.intervals.keys());
    }
}
