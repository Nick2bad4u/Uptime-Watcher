import type { IpcInvokeChannel, IpcInvokeChannelParams } from "@shared/types/ipc";

import { SETTINGS_CHANNELS } from "@shared/types/preload";

import type { UptimeOrchestrator } from "../../../UptimeOrchestrator";

import { createStandardizedIpcRegistrar } from "../utils";
import { SettingsHandlerValidators } from "../validators/settings";

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
    const register = createStandardizedIpcRegistrar(registeredHandlers);

    register(
        SETTINGS_CHANNELS.updateHistoryLimit,
        async (
            historyLimit: IpcInvokeChannelParams<
                typeof SETTINGS_CHANNELS.updateHistoryLimit
            >[0]
        ) => {
            await uptimeOrchestrator.setHistoryLimit(historyLimit);
            return uptimeOrchestrator.getHistoryLimit();
        },
        SettingsHandlerValidators.updateHistoryLimit
    );

    register(
        SETTINGS_CHANNELS.getHistoryLimit,
        () => uptimeOrchestrator.getHistoryLimit(),
        SettingsHandlerValidators.getHistoryLimit
    );

    register(
        SETTINGS_CHANNELS.resetSettings,
        async (): Promise<undefined> => {
            await uptimeOrchestrator.resetSettings();
            return undefined;
        },
        SettingsHandlerValidators.resetSettings
    );
}
