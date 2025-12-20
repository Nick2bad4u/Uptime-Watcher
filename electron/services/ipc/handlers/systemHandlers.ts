import type { IpcInvokeChannel } from "@shared/types/ipc";

import { SYSTEM_CHANNELS } from "@shared/types/preload";
import { ensureError } from "@shared/utils/errorHandling";
import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { getSafeUrlForLogging, isAllowedExternalOpenUrl } from "@shared/utils/urlSafety";
import { isValidUrl } from "@shared/validation/validatorUtils";
import { clipboard, shell  } from "electron";

import type { AutoUpdaterService } from "../../updater/AutoUpdaterService";

import { logger } from "../../../utils/logger";
import { registerStandardizedIpcHandler } from "../utils";
import { SystemHandlerValidators } from "../validators";
import { withIgnoredIpcEvent } from "./handlerShared";

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
    registerStandardizedIpcHandler(
        SYSTEM_CHANNELS.openExternal,
        withIgnoredIpcEvent(async (url) => {
            const urlForLog = getSafeUrlForLogging(url);

            if (
                !isValidUrl(url, {
                    disallowAuth: true,
                })
            ) {
                throw new TypeError(
                    `Rejected unsafe openExternal URL: ${urlForLog}`
                );
            }

            if (!isAllowedExternalOpenUrl(url)) {
                throw new Error(
                    `Blocked external URL: ${getSafeUrlForLogging(url)}`
                );
            }

            try {
                await shell.openExternal(url);
            } catch (error: unknown) {
                const resolved = ensureError(error);
                const { code } = resolved as Error & { code?: unknown };
                const codeSuffix =
                    typeof code === "string" && code.length > 0
                        ? ` (${code})`
                        : "";

                // Do not allow errors to echo the full URL (queries may include
                // tokens); keep logs and renderer error messages redacted.
                throw new Error(
                    `Failed to open external URL: ${urlForLog}${codeSuffix}`,
                    { cause: error }
                );
            }
            return true;
        }),
        SystemHandlerValidators.openExternal,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        SYSTEM_CHANNELS.quitAndInstall,
        withIgnoredIpcEvent(() => {
            logger.info(LOG_TEMPLATES.services.UPDATER_QUIT_INSTALL);
            autoUpdaterService.quitAndInstall();
            return true;
        }),
        SystemHandlerValidators.quitAndInstall,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        SYSTEM_CHANNELS.writeClipboardText,
        withIgnoredIpcEvent((text: string) => {
            try {
                clipboard.writeText(text);
            } catch (error: unknown) {
                throw new Error("Failed to write clipboard text", {
                    cause: error,
                });
            }

            return true;
        }),
        SystemHandlerValidators.writeClipboardText,
        registeredHandlers
    );
}
