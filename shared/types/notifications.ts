/**
 * Shared notification preference types exchanged between renderer and main.
 *
 * @remarks
 * Used to keep the renderer's alert preference toggles in sync with the
 * Electron main process notification service.
 */

/**
 * Payload for updating system notification preferences.
 *
 * @public
 */
export interface NotificationPreferenceUpdate {
    /**
     * Whether operating-system notifications should be displayed for monitor
     * status changes.
     */
    systemNotificationsEnabled: boolean;
    /**
     * Whether operating-system notifications are allowed to emit a sound when
     * supported by the host platform.
     */
    systemNotificationsSoundEnabled: boolean;
}
