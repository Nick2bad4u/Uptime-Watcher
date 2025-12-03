import type { IpcInvokeChannel } from "@shared/types/ipc";

import { SETTINGS_CHANNELS } from "@shared/types/preload";

import type { UptimeOrchestrator } from "../../../UptimeOrchestrator";

import { registerStandardizedIpcHandler } from "../utils";
import { SettingsHandlerValidators } from "../validators";
import { withIgnoredIpcEvent } from "./handlerShared";

/**
 * Dependencies required to register settings IPC handlers.
 */
export interface SettingsHandlersDependencies {
    readonly registeredHandlers: Set<IpcInvokeChannel>;
    readonly uptimeOrchestrator: UptimeOrchestrator;
}

/**
 * Registers IPC handlers for settings and history limit management.
 */
export function registerSettingsHandlers({
    registeredHandlers,
    uptimeOrchestrator,
}: SettingsHandlersDependencies): void {
    registerStandardizedIpcHandler(
        SETTINGS_CHANNELS.updateHistoryLimit,
        withIgnoredIpcEvent(async (historyLimit) => {
            await uptimeOrchestrator.setHistoryLimit(historyLimit);
            return uptimeOrchestrator.getHistoryLimit();
        }),
        SettingsHandlerValidators.updateHistoryLimit,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        SETTINGS_CHANNELS.getHistoryLimit,
        withIgnoredIpcEvent(() => uptimeOrchestrator.getHistoryLimit()),
        SettingsHandlerValidators.getHistoryLimit,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        SETTINGS_CHANNELS.resetSettings,
        withIgnoredIpcEvent(async (): Promise<undefined> => {
            await uptimeOrchestrator.resetSettings();
            return undefined;
        }),
        SettingsHandlerValidators.resetSettings,
        registeredHandlers
    );
}
