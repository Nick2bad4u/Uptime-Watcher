import type { IpcInvokeChannel } from "@shared/types/ipc";

import { parseNotificationPreferenceUpdate } from "@shared/validation/notifications";

import type { NotificationService } from "../../notifications/NotificationService";
import type { UPDATE_NOTIFICATION_PREFERENCES_CHANNEL } from "../notificationChannelGuards";

import { registerStandardizedIpcHandler } from "../utils";
import { NotificationHandlerValidators } from "../validators";
import { withIgnoredIpcEvent } from "./handlerShared";

interface NormalizedNotificationPreferences {
    readonly enabled: boolean;
    readonly mutedSiteNotificationIdentifiers: readonly string[];
    readonly playSound: boolean;
}

const normalizeNotificationPreferenceUpdate = (
    candidate: unknown
): NormalizedNotificationPreferences => {
    const parsed = parseNotificationPreferenceUpdate(candidate);
    return {
        enabled: parsed.systemNotificationsEnabled,
        mutedSiteNotificationIdentifiers:
            parsed.mutedSiteNotificationIdentifiers ?? [],
        playSound: parsed.systemNotificationsSoundEnabled,
    } satisfies NormalizedNotificationPreferences;
};

/**
 * Dependencies required to register notification preference IPC handlers.
 */
export interface NotificationHandlersDependencies {
    readonly notificationService: NotificationService;
    readonly registeredHandlers: Set<IpcInvokeChannel>;
    readonly updatePreferencesChannel: typeof UPDATE_NOTIFICATION_PREFERENCES_CHANNEL;
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
