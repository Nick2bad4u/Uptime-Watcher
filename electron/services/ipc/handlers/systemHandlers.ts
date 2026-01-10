import type { IpcInvokeChannel } from "@shared/types/ipc";

import {
    getElectronErrorCodeSuffix,
    openExternalOrThrow,
} from "@electron/services/shell/openExternalUtils";
import { SYSTEM_CHANNELS } from "@shared/types/preload";
import { validateExternalOpenUrlCandidate } from "@shared/utils/urlSafety";
import { clipboard } from "electron";

import type { AutoUpdaterService } from "../../updater/AutoUpdaterService";

import { createStandardizedIpcRegistrar } from "../utils";
import { SystemHandlerValidators } from "../validators/system";

/**
 * Dependencies required to register system-level IPC handlers.
 */
export interface SystemHandlersDependencies {
    readonly autoUpdaterService: AutoUpdaterService;
    readonly registeredHandlers: Set<IpcInvokeChannel>;
}

/**
 * Registers IPC handlers for system actions such as openExternal and updates.
 */
export function registerSystemHandlers({
    autoUpdaterService,
    registeredHandlers,
}: SystemHandlersDependencies): void {
    const register = createStandardizedIpcRegistrar(registeredHandlers);

    register(
        SYSTEM_CHANNELS.openExternal,
        async (url): Promise<boolean> => {
            const validation = validateExternalOpenUrlCandidate(url);

            if ("reason" in validation) {
                const { reason, safeUrlForLogging } = validation;
                throw new TypeError(
                    `Rejected unsafe openExternal URL: ${safeUrlForLogging} (reason ${reason})`
                );
            }

            const { normalizedUrl, safeUrlForLogging } = validation;

            await openExternalOrThrow({
                failureMessagePrefix: "Failed to open external URL",
                normalizedUrl,
                safeUrlForLogging,
            });

            return true;
        },
        SystemHandlerValidators.openExternal
    );

    register(
        SYSTEM_CHANNELS.writeClipboardText,
        (text): boolean => {
            try {
                clipboard.writeText(text);
                return true;
            } catch (error: unknown) {
                const codeSuffix = getElectronErrorCodeSuffix(error);

                // Never include clipboard contents in thrown errors/logs.
                throw new Error(`Failed to write clipboard text${codeSuffix}`, {
                    cause: error,
                });
            }
        },
        SystemHandlerValidators.writeClipboardText
    );

    register(
        SYSTEM_CHANNELS.quitAndInstall,
        (): boolean => {
            autoUpdaterService.quitAndInstall();
            return true;
        },
        SystemHandlerValidators.quitAndInstall
    );
}
