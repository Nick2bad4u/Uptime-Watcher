import { Notification } from "electron";

import { Site } from "../../types";
import { logger } from "../../utils/index";

export interface NotificationConfig {
    showDownAlerts: boolean;
    showUpAlerts: boolean;
}

/**
 * Service responsible for handling system notifications.
 * Manages monitor status change notifications with configurable settings.
 */
export class NotificationService {
    private config: NotificationConfig;

    constructor(config: NotificationConfig = { showDownAlerts: true, showUpAlerts: true }) {
        this.config = config;
    }

    /**
     * Show notification when a monitor goes down.
     */
    public notifyMonitorDown(site: Site, monitorId: string): void {
        if (!this.config.showDownAlerts) return;

        const monitor = site.monitors.find((m) => m.id === monitorId);
        const monitorType = monitor?.type ?? "unknown";

        logger.warn(`[NotificationService] Monitor down alert: ${site.name} [${monitorType}]`);

        if (Notification.isSupported()) {
            new Notification({
                body: `${site.name} (${monitorType}) is currently down!`,
                title: "Monitor Down Alert",
                urgency: "critical",
            }).show();

            logger.info(`[NotificationService] Notification sent for monitor down: ${site.name} (${monitorType})`);
        } else {
            logger.warn("[NotificationService] Notifications not supported on this platform");
        }
    }

    /**
     * Show notification when a monitor comes back up.
     */
    public notifyMonitorUp(site: Site, monitorId: string): void {
        if (!this.config.showUpAlerts) return;

        const monitor = site.monitors.find((m) => m.id === monitorId);
        const monitorType = monitor?.type ?? "unknown";

        logger.info(`[NotificationService] Monitor restored: ${site.name} [${monitorType}]`);

        if (Notification.isSupported()) {
            new Notification({
                body: `${site.name} (${monitorType}) is back online!`,
                title: "Monitor Restored",
                urgency: "normal",
            }).show();

            logger.info(`[NotificationService] Notification sent for monitor restored: ${site.name} (${monitorType})`);
        } else {
            logger.warn("[NotificationService] Notifications not supported on this platform");
        }
    }

    /**
     * Update notification configuration.
     */
    public updateConfig(config: Partial<NotificationConfig>): void {
        this.config = { ...this.config, ...config };
        logger.debug("[NotificationService] Configuration updated", this.config);
    }

    /**
     * Get current notification configuration.
     */
    public getConfig(): NotificationConfig {
        return { ...this.config };
    }

    /**
     * Check if notifications are supported on this platform.
     */
    public isSupported(): boolean {
        return Notification.isSupported();
    }
}
