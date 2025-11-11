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
const UPDATE_NOTIFICATION_PREFERENCES_CHANNEL =
    "update-notification-preferences";

const runtimeEnvironment = process.env["NODE_ENV"];
const updateChannelCandidate = Reflect.get(
    NOTIFICATION_CHANNELS,
    "updatePreferences"
);

if (typeof updateChannelCandidate !== "string") {
    throw new TypeError(
        "Notification channel constant is not a string at build time"
    );
}

const registeredUpdateChannel = updateChannelCandidate;

const channelMismatchDetected =
    registeredUpdateChannel.localeCompare(
        UPDATE_NOTIFICATION_PREFERENCES_CHANNEL
    ) !== 0;

if (runtimeEnvironment !== "production" && channelMismatchDetected) {
    throw new Error(
        "Notification channel constant mismatch detected at build time"
    );
}

export const notificationsApi: NotificationsApiInterface = {
    updatePreferences: createVoidInvoker(
        UPDATE_NOTIFICATION_PREFERENCES_CHANNEL
    ),
} as const;

/* eslint-enable ex/no-unhandled -- Re-enable lint rule for other modules */
