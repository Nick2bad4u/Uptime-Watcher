import type { IpcInvokeChannel } from "@shared/types/ipc";

import { parseNotificationPreferenceUpdate } from "@shared/validation/notifications";

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
    const parsed = parseNotificationPreferenceUpdate(candidate);
    return {
        enabled: parsed.systemNotificationsEnabled,
        playSound: parsed.systemNotificationsSoundEnabled,
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
