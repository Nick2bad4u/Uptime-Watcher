/**
 * Parameter validators for notification preference IPC handlers.
 */

import type { IpcParameterValidator } from "../types";

import {
    validateNotificationPreferences,
    validateNotifyAppEvent,
} from "./shared";

/**
 * Interface for notification handler validators.
 */
interface NotificationHandlerValidatorsInterface {
    notifyAppEvent: IpcParameterValidator;
    updatePreferences: IpcParameterValidator;
}

export const NotificationHandlerValidators: NotificationHandlerValidatorsInterface =
    {
        notifyAppEvent: validateNotifyAppEvent,
        updatePreferences: validateNotificationPreferences,
    } as const;
