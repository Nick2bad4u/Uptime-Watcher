/**
 * Notification service for desktop system notifications.
 *
 * @remarks
 * Manages system notifications for monitor status changes, providing user
 * alerts for down/up events with configurable notification preferences.
 */
import type { Site } from "@shared/types";

import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { Notification } from "electron";

import { logger } from "../../utils/logger";

/**
 * Configuration options for the notification service.
 *
 * @remarks
 * Controls which types of monitor status change notifications are displayed to
 * the user. Both settings can be independently enabled or disabled.
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
 * Service responsible for handling system notifications for monitor status
 * changes.
 *
 * @remarks
 * Manages desktop notifications for monitor status changes using Electron's
 * Notification API. Provides configurable settings for different notification
 * types and handles platform compatibility checks.
 *
 * **Thread Safety and Concurrency:** This service is designed to be thread-safe
 * for typical Electron usage patterns: - Safe to call from main process event
 * handlers
 *
 * - Safe to call from IPC message handlers
 * - Safe to call from multiple timer callbacks concurrently
 * - Configuration updates are applied atomically
 * - No shared mutable state between notification calls
 *
 * **Performance Considerations:**
 *
 * - Monitor lookup uses Array.find() - consider caching for high-frequency usage
 * - Notification creation is synchronous but display is asynchronous
 * - Platform support check is cached by Electron
 *
 * **Error Handling:**
 *
 * - Invalid monitor IDs are logged and skipped gracefully
 * - Platform compatibility issues are handled automatically
 * - Invalid input parameters result in warning logs and early returns
 *
 * @example
 *
 * ```typescript
 * const notificationService = new NotificationService({
 *     showDownAlerts: true,
 *     showUpAlerts: false,
 * });
 *
 * // Show notification when a monitor goes down
 * notificationService.notifyMonitorDown(site, monitorId);
 *
 * // Safe to call from multiple contexts concurrently
 * Promise.all([
 *     notificationService.notifyMonitorDown(site1, monitor1),
 *     notificationService.notifyMonitorUp(site2, monitor2),
 * ]);
 * ```
 *
 * @public
 *
 * @see {@link NotificationConfig} for configuration options
 * @see {@link Site} for site data structure
 * @see {@link Monitor} for monitor data structure
 */
export class NotificationService {
    private config: NotificationConfig;

    /**
     * Create a new notification service instance.
     *
     * @remarks
     * If no configuration is provided, both down and up alerts are enabled by
     * default. The configuration can be updated later using
     * {@link NotificationService.updateConfig}.
     *
     * @param config - Optional configuration for notification behavior
     */
    public constructor(config?: NotificationConfig) {
        this.config = config ?? { showDownAlerts: true, showUpAlerts: true };
    }

    /**
     * Get the current notification configuration.
     *
     * @remarks
     * Returns a copy to prevent external modification of the internal
     * configuration. Use {@link NotificationService.updateConfig} to modify
     * settings.
     *
     * @returns A copy of the current configuration
     */
    public getConfig(): NotificationConfig {
        return { ...this.config };
    }

    /**
     * Check if system notifications are supported on the current platform.
     *
     * @remarks
     * Uses Electron's built-in platform detection to determine notification
     * support. On unsupported platforms, notification methods will log warnings
     * instead of attempting to display notifications.
     *
     * @returns `true` if notifications are supported, `false` otherwise
     */
    public isSupported(): boolean {
        return Notification.isSupported();
    }

    /**
     * Show a notification when a monitor goes down.
     *
     * @remarks
     * Displays a critical urgency notification with site name and monitor type.
     * Automatically skipped if down alerts are disabled in configuration or if
     * notifications are not supported on the current platform.
     *
     * The notification includes:
     *
     * - Site name for easy identification
     * - Monitor type (HTTP, port, etc.)
     * - Critical urgency level to ensure visibility
     *
     * Error handling:
     *
     * - Logs warning and skips notification if monitor not found
     * - Validates input parameters before processing
     * - Provides detailed error information for debugging
     *
     * @param site - The site containing the monitor that went down
     * @param monitorId - ID of the specific monitor that went down
     */
    public notifyMonitorDown(site: Site, monitorId: string): void {
        if (!this.config.showDownAlerts) return;

        // Validate monitor ID
        if (!monitorId) {
            logger.error(
                "[NotificationService] Cannot notify down: monitorId is invalid"
            );
            return;
        }

        const monitor = site.monitors.find((m) => m.id === monitorId);

        // Handle missing monitor
        if (!monitor) {
            logger.warn(
                `[NotificationService] Monitor not found for down notification: ${monitorId} in site ${site.name}`
            );
            return;
        }

        const monitorType = monitor.type;

        logger.warn(
            `[NotificationService] Monitor down alert: ${site.name} [${monitorType}]`
        );

        if (Notification.isSupported()) {
            new Notification({
                body: `${site.name} (${monitorType}) is currently down!`,
                title: "Monitor Down Alert",
                urgency: "critical",
            }).show();

            logger.info(
                `[NotificationService] Notification sent for monitor down: ${site.name} (${monitorType})`
            );
        } else {
            logger.warn(LOG_TEMPLATES.warnings.NOTIFICATIONS_UNSUPPORTED);
        }
    }

    /**
     * Show a notification when a monitor comes back up.
     *
     * @remarks
     * Displays a normal urgency notification indicating service restoration.
     * Automatically skipped if up alerts are disabled in configuration or if
     * notifications are not supported on the current platform.
     *
     * The notification includes:
     *
     * - Site name for easy identification
     * - Monitor type (HTTP, port, etc.)
     * - Normal urgency level (less intrusive than down alerts)
     *
     * Error handling:
     *
     * - Logs warning and skips notification if monitor not found
     * - Validates input parameters before processing
     * - Provides detailed error information for debugging
     *
     * @param site - The site containing the monitor that came back up
     * @param monitorId - ID of the specific monitor that was restored
     */
    public notifyMonitorUp(site: Site, monitorId: string): void {
        if (!this.config.showUpAlerts) return;

        // Validate monitor ID
        if (!monitorId) {
            logger.error(
                "[NotificationService] Cannot notify up: monitorId is invalid"
            );
            return;
        }

        const monitor = site.monitors.find((m) => m.id === monitorId);

        // Handle missing monitor
        if (!monitor) {
            logger.warn(
                `[NotificationService] Monitor not found for up notification: ${monitorId} in site ${site.name}`
            );
            return;
        }

        const monitorType = monitor.type;

        logger.info(
            `[NotificationService] Monitor restored: ${site.name} [${monitorType}]`
        );

        if (Notification.isSupported()) {
            new Notification({
                body: `${site.name} (${monitorType}) is back online!`,
                title: "Monitor Restored",
                urgency: "normal",
            }).show();

            logger.info(
                `[NotificationService] Notification sent for monitor restored: ${site.name} (${monitorType})`
            );
        } else {
            logger.warn(LOG_TEMPLATES.warnings.NOTIFICATIONS_UNSUPPORTED);
        }
    }

    /**
     * Update the notification configuration.
     *
     * @remarks
     * Allows runtime modification of notification behavior without creating a
     * new service instance.
     *
     * **Partial Update Behavior:**
     *
     * - Only properties specified in the config parameter are updated
     * - Omitted properties retain their current values
     * - No properties are reset to default values
     * - Changes take effect immediately for subsequent notifications
     *
     * @example
     *
     * ```typescript
     * // Only update showDownAlerts, showUpAlerts remains unchanged
     * service.updateConfig({ showDownAlerts: false });
     *
     * // Update both properties
     * service.updateConfig({
     *     showDownAlerts: true,
     *     showUpAlerts: false,
     * });
     * ```
     *
     * @param config - Partial configuration object with settings to update
     */
    public updateConfig(config: Partial<NotificationConfig>): void {
        this.config = {
            ...this.config,
            ...config,
        };
        logger.debug(
            "[NotificationService] Configuration updated",
            this.config
        );
    }
}
