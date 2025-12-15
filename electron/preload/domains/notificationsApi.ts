/**
 * Notification preference API - typed preload bridge for notification updates.
 *
 * @remarks
 * Provides a focused IPC surface for synchronizing renderer notification
 * preferences with the Electron main process.
 */

/* eslint-disable ex/no-unhandled -- Preload bridges propagate errors to the caller */

import type { NotificationPreferenceUpdate } from "@shared/types/notifications";

import { NOTIFICATION_CHANNELS } from "@shared/types/preload";

import { createVoidInvoker } from "../core/bridgeFactory";

/**
 * Renderer-facing notification API exposed via the preload bridge.
 *
 * @public
 */
export interface NotificationsApiInterface {
    /**
     * Updates the system notification preferences stored in the main process.
     *
     * @param preferences - Notification preference payload.
     */
    updatePreferences: (
        preferences: NotificationPreferenceUpdate
    ) => Promise<void>;
}

/**
 * Typed preload bridge implementation for notification preferences.
 *
 * @public
 */
export const notificationsApi: NotificationsApiInterface = {
    updatePreferences: createVoidInvoker(
        NOTIFICATION_CHANNELS.updatePreferences
    ),
} as const;

/* eslint-enable ex/no-unhandled -- Re-enable lint rule for other modules */
