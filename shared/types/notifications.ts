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
     * Optional list of site identifiers for which system notifications should
     * be muted.
     */
    mutedSiteNotificationIdentifiers?: readonly string[] | undefined;
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

/**
 * Payload for requesting a generic app notification.
 *
 * @remarks
 * This is intended for **user-initiated** operations (e.g. "Backup uploaded")
 * and must never include secrets (tokens, passphrases, etc.).
 *
 * System notification eligibility is ultimately controlled by the user's
 * notification settings in the renderer and the main-process notification
 * service configuration.
 *
 * @public
 */
export interface AppNotificationRequest {
    /** Optional body text displayed below the title. */
    body?: string | undefined;
    /** Short title displayed by the operating system notification UI. */
    title: string;
}
