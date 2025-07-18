import { Notification } from "electron";

import { Site } from "../../types";
import { logger } from "../../utils/logger";

/**
 * Configuration options for the notification service.
 *
 * @remarks
 * Controls which types of monitor status change notifications are displayed
 * to the user. Both settings can be independently enabled or disabled.
 *
 * @public
 */
export interface NotificationConfig {
    /** Whether to show notifications when monitors go down */
    showDownAlerts: boolean;
    /** Whether to show notifications when monitors come back up */
    showUpAlerts: boolean;
}

/**
 * Service responsible for handling system notifications for monitor status changes.
 *
 * @remarks
 * Manages desktop notifications for monitor status changes using Electron's
 * Notification API. Provides configurable settings for different notification
 * types and handles platform compatibility checks.
 *
 * @public
 *
 * @see {@link NotificationConfig} for configuration options
 * @see {@link Site} for site data structure
 * @see {@link Monitor} for monitor data structure
 *
 * @example
 * ```typescript
 * const notificationService = new NotificationService({
 *   showDownAlerts: true,
 *   showUpAlerts: false
 * });
 *
 * // Show notification when a monitor goes down
 * notificationService.notifyMonitorDown(site, monitorId);
 * ```
 */
export class NotificationService {
    private config: NotificationConfig;

    /**
     * Create a new notification service instance.
     *
     * @param config - Optional configuration for notification behavior
     *
     * @remarks
     * If no configuration is provided, both down and up alerts are enabled by default.
     * The configuration can be updated later using {@link NotificationService.updateConfig}.
     */
    constructor(config?: NotificationConfig) {
        this.config = config ?? { showDownAlerts: true, showUpAlerts: true };
    }

    /**
     * Get the current notification configuration.
     *
     * @returns A copy of the current configuration
     *
     * @remarks
     * Returns a copy to prevent external modification of the internal configuration.
     * Use {@link NotificationService.updateConfig} to modify settings.
     */
    public getConfig(): NotificationConfig {
        return { ...this.config };
    }

    /**
     * Check if system notifications are supported on the current platform.
     *
     * @returns `true` if notifications are supported, `false` otherwise
     *
     * @remarks
     * Uses Electron's built-in platform detection to determine notification support.
     * On unsupported platforms, notification methods will log warnings instead
     * of attempting to display notifications.
     */
    public isSupported(): boolean {
        return Notification.isSupported();
    }

    /**
     * Show a notification when a monitor goes down.
     *
     * @param site - The site containing the monitor that went down
     * @param monitorId - ID of the specific monitor that went down
     *
     * @remarks
     * Displays a critical urgency notification with site name and monitor type.
     * Automatically skipped if down alerts are disabled in configuration or
     * if notifications are not supported on the current platform.
     *
     * The notification includes:
     * - Site name for easy identification
     * - Monitor type (HTTP, port, etc.)
     * - Critical urgency level to ensure visibility
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
     * Show a notification when a monitor comes back up.
     *
     * @param site - The site containing the monitor that came back up
     * @param monitorId - ID of the specific monitor that was restored
     *
     * @remarks
     * Displays a normal urgency notification indicating service restoration.
     * Automatically skipped if up alerts are disabled in configuration or
     * if notifications are not supported on the current platform.
     *
     * The notification includes:
     * - Site name for easy identification
     * - Monitor type (HTTP, port, etc.)
     * - Normal urgency level (less intrusive than down alerts)
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
     * Update the notification configuration.
     *
     * @param config - Partial configuration object with settings to update
     *
     * @remarks
     * Allows runtime modification of notification behavior without creating
     * a new service instance. Only specified properties are updated; others
     * retain their current values.
     *
     * Changes take effect immediately for subsequent notifications.
     */
    public updateConfig(config: Partial<NotificationConfig>): void {
        this.config = {
            ...this.config,
            ...config,
        };
        logger.debug("[NotificationService] Configuration updated", this.config);
    }
}
