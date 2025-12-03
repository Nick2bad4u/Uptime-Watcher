import type { IpcInvokeChannel } from "@shared/types/ipc";

import { isRecord } from "@shared/utils/typeHelpers";

import type { NotificationService } from "../../notifications/NotificationService";

import { registerStandardizedIpcHandler } from "../utils";
import { NotificationHandlerValidators } from "../validators";
import { withIgnoredIpcEvent } from "./handlerShared";

interface NormalizedNotificationPreferences {
    readonly enabled: boolean;
    readonly playSound: boolean;
}

const normalizeNotificationPreferenceUpdate = (
    candidate: unknown
): NormalizedNotificationPreferences => {
    if (!isRecord(candidate)) {
        throw new TypeError(
            "Invalid notification preference payload received via IPC"
        );
    }

    const systemNotificationsEnabledValue = Reflect.get(
        candidate,
        "systemNotificationsEnabled"
    );
    const systemNotificationsSoundEnabledValue = Reflect.get(
        candidate,
        "systemNotificationsSoundEnabled"
    );

    if (
        typeof systemNotificationsEnabledValue !== "boolean" ||
        typeof systemNotificationsSoundEnabledValue !== "boolean"
    ) {
        throw new TypeError(
            "Invalid notification preference payload received via IPC"
        );
    }

    return {
        enabled: systemNotificationsEnabledValue,
        playSound: systemNotificationsSoundEnabledValue,
    } satisfies NormalizedNotificationPreferences;
};

/**
 * Dependencies required to register notification preference IPC handlers.
 */
export interface NotificationHandlersDependencies {
    readonly notificationService: NotificationService;
    readonly registeredHandlers: Set<IpcInvokeChannel>;
    readonly updatePreferencesChannel: Extract<
        IpcInvokeChannel,
        "update-notification-preferences"
    >;
}

/**
 * Registers IPC handlers for notification preference updates.
 */
export function registerNotificationHandlers({
    notificationService,
    registeredHandlers,
    updatePreferencesChannel,
}: NotificationHandlersDependencies): void {
    registerStandardizedIpcHandler(
        updatePreferencesChannel,
        withIgnoredIpcEvent((payload): undefined => {
            const preferences = normalizeNotificationPreferenceUpdate(payload);
            notificationService.updateConfig(preferences);
            return undefined;
        }),
        NotificationHandlerValidators.updatePreferences,
        registeredHandlers
    );
}
