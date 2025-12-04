import type { IpcInvokeChannel, VoidIpcInvokeChannel } from "@shared/types/ipc";

import { NOTIFICATION_CHANNELS } from "@shared/types/preload";

import { readProcessEnv } from "../../utils/environment";

export const UPDATE_NOTIFICATION_PREFERENCES_CHANNEL =
    "update-notification-preferences" as const;

type UpdatePreferencesChannel = Extract<
    IpcInvokeChannel | VoidIpcInvokeChannel,
    typeof UPDATE_NOTIFICATION_PREFERENCES_CHANNEL
>;

/**
 * Resolves and validates the notification preferences update channel.
 *
 * @remarks
 * Ensures the shared preload channel constant matches the string used by
 * IpcService/notificationsApi. Throws during startup in non-production
 * environments when a mismatch is detected so it is caught early.
 */
export const getUpdateNotificationPreferencesChannel =
    (): UpdatePreferencesChannel => {
        const candidate = Reflect.get(
            NOTIFICATION_CHANNELS,
            "updatePreferences"
        );

        if (typeof candidate !== "string") {
            throw new TypeError(
                "Notification channel constant is not a string at build time"
            );
        }

        const registeredUpdateChannel = candidate;
        const mismatch =
            registeredUpdateChannel.localeCompare(
                UPDATE_NOTIFICATION_PREFERENCES_CHANNEL
            ) !== 0;

        const runtimeEnvironment = readProcessEnv("NODE_ENV");
        if (runtimeEnvironment !== "production" && mismatch) {
            throw new Error(
                "Notification channel mapping mismatch detected at build time"
            );
        }

        return UPDATE_NOTIFICATION_PREFERENCES_CHANNEL;
    };
