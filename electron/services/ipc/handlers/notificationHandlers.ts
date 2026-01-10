import type { IpcInvokeChannel } from "@shared/types/ipc";

import { NOTIFICATION_CHANNELS } from "@shared/types/preload";
import {
    parseAppNotificationRequest,
    parseNotificationPreferenceUpdate,
} from "@shared/validation/notifications";

import type { NotificationService } from "../../notifications/NotificationService";

import { createStandardizedIpcRegistrar } from "../utils";
import { NotificationHandlerValidators } from "../validators/notifications";

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
}

/**
 * Registers IPC handlers for notification preference updates.
 */
export function registerNotificationHandlers({
    notificationService,
    registeredHandlers,
}: NotificationHandlersDependencies): void {
    const register = createStandardizedIpcRegistrar(registeredHandlers);

    register(
        NOTIFICATION_CHANNELS.notifyAppEvent,
        (payload): undefined => {
            const request = parseAppNotificationRequest(payload);
            notificationService.notifyAppEvent(request);
            return undefined;
        },
        NotificationHandlerValidators.notifyAppEvent
    );

    register(
        NOTIFICATION_CHANNELS.updatePreferences,
        (payload): undefined => {
            const preferences = normalizeNotificationPreferenceUpdate(payload);
            notificationService.updateConfig(preferences);
            return undefined;
        },
        NotificationHandlerValidators.updatePreferences
    );
}
