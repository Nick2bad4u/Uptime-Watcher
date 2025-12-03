import type { IpcInvokeChannel } from "@shared/types/ipc";

import { SYSTEM_CHANNELS } from "@shared/types/preload";
import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { shell } from "electron";

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
            await shell.openExternal(url);
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
}
