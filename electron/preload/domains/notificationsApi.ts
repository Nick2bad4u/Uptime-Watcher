/**
 * Notification preference API - typed preload bridge for notification updates.
 *
 * @remarks
 * Provides a focused IPC surface for synchronizing renderer notification
 * preferences with the Electron main process.
 */

import type {
    AppNotificationRequest,
    NotificationPreferenceUpdate,
} from "@shared/types/notifications";

import { NOTIFICATION_CHANNELS } from "@shared/types/preload";
import { ensureError } from "@shared/utils/errorHandling";

import { createVoidInvoker } from "../core/bridgeFactory";
import {
    acceptUnusedPreloadArguments,
    createPreloadDomain,
} from "../utils/preloadDomainFactory";

/**
 * Renderer-facing notification API exposed via the preload bridge.
 *
 * @public
 */
export interface NotificationsApiInterface {
    /**
     * Requests a generic app notification from the main process.
     *
     * @remarks
     * Intended for user-initiated operations (e.g. cloud backup/sync actions).
     * The main process applies user preferences and platform support checks.
     */
    notifyAppEvent: (request: AppNotificationRequest) => Promise<void>;

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
function createNotificationsApi(): NotificationsApiInterface {
    try {
        return {
            notifyAppEvent: createVoidInvoker(
                NOTIFICATION_CHANNELS.notifyAppEvent
            ),
            updatePreferences: createVoidInvoker(
                NOTIFICATION_CHANNELS.updatePreferences
            ),
        } as const;
    } catch (error) {
        throw ensureError(error);
    }
}

const createNotificationsApiFallback = (
    unavailableError: Error
): NotificationsApiInterface =>
    ({
        notifyAppEvent: (
            ...args: Parameters<NotificationsApiInterface["notifyAppEvent"]>
        ) => {
            acceptUnusedPreloadArguments(...args);
            return Promise.reject(unavailableError);
        },
        updatePreferences: (
            ...args: Parameters<NotificationsApiInterface["updatePreferences"]>
        ) => {
            acceptUnusedPreloadArguments(...args);
            return Promise.reject(unavailableError);
        },
    }) as const;

export const notificationsApi: NotificationsApiInterface = createPreloadDomain({
    create: createNotificationsApi,
    createFallback: createNotificationsApiFallback,
    domain: "notificationsApi",
});
