/**
 * Service layer for handling all system-related operations. Provides a clean
 * abstraction over electron API calls for system management.
 *
 * @remarks
 * All methods ensure the electron API is available before making calls. All
 * backend communication is performed via IPC and follows strict typing with
 * automatic error handling and logging.
 *
 * @packageDocumentation
 */

import { ensureError } from "@shared/utils/errorHandling";
import {
    getSafeUrlForLogging,
    validateExternalOpenUrlCandidate,
} from "@shared/utils/urlSafety";

import type { ElectronAPI } from "../types";

import { logger } from "./logger";
import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";

const { ensureInitialized, wrap } = ((): ReturnType<
    typeof getIpcServiceHelpers
> => {
    try {
        return getIpcServiceHelpers("SystemService", {
            bridgeContracts: [
                {
                    domain: "system",
                    methods: [
                        "openExternal",
                        "quitAndInstall",
                        "writeClipboardText",
                    ],
                },
            ],
        });
    } catch (error: unknown) {
        throw ensureError(error);
    }
})();

interface SystemServiceContract {
    initialize: () => Promise<void>;
    openExternal: (url: string) => Promise<boolean>;
    quitAndInstall: () => Promise<void>;
    writeClipboardText: (text: string) => Promise<void>;
}

/**
 * Service for managing system operations through Electron IPC.
 *
 * @remarks
 * Provides a comprehensive interface for system-level operations including
 * external browser navigation and application update management with automatic
 * service initialization and type-safe IPC communication.
 *
 * @public
 */
export const SystemService: SystemServiceContract = {
    /**
     * Ensures the electron API is available before making backend calls.
     *
     * @remarks
     * This method should be called before any backend operation.
     *
     * @returns A promise that resolves when the electron API is ready.
     *
     * @throws If the electron API is not available.
     */
    initialize: ensureInitialized,

    /**
     * Opens a URL in the user's default external browser.
     *
     * @example
     *
     * ```typescript
     * await SystemService.openExternal("https://example.com");
     * ```
     *
     * @param url - The URL to open in the external browser.
     *
     * @returns `true` when Electron successfully delegates the request.
     *
     * @throws If the electron API is unavailable, the underlying operation
     *   fails, or Electron declines to open the target URL.
     */
    openExternal: wrap(
        "openExternal",
        async (api, url: string): Promise<boolean> => {
            const validation = validateExternalOpenUrlCandidate(url);
            const urlForMessage = getSafeUrlForLogging(url);

            if ("reason" in validation) {
                const error = new TypeError(
                    `Invalid URL provided to SystemService.openExternal: ${validation.safeUrlForLogging}`
                );

                logger.error(
                    "Rejected unsafe URL for external navigation",
                    error,
                    {
                        reason: validation.reason,
                        url: validation.safeUrlForLogging,
                    }
                );

                throw error;
            }

            const opened = await api.system.openExternal(
                validation.normalizedUrl
            );

            if (typeof opened !== "boolean") {
                throw new TypeError(
                    `Electron declined to open external URL: ${urlForMessage} (received ${typeof opened})`
                );
            }

            if (!opened) {
                throw new Error(
                    `Electron declined to open external URL: ${urlForMessage}`
                );
            }

            return opened;
        }
    ),

    /**
     * Quits the application and installs a pending update.
     *
     * @remarks
     * Delegates to the preload system bridge which triggers the main-process
     * auto-updater service. Resolves when the quit/install request has been
     * forwarded successfully. The promise rejects if the underlying bridge is
     * unavailable or the main-process handler reports failure.
     */
    quitAndInstall: wrap("quitAndInstall", async (api): Promise<void> => {
        const result = await api.system.quitAndInstall();

        if (typeof result !== "boolean") {
            throw new TypeError(
                `Invalid response received from quitAndInstall: ${typeof result}`
            );
        }

        if (!result) {
            throw new Error(
                "Electron declined to execute quitAndInstall request"
            );
        }
    }),

    /**
     * Writes text to the OS clipboard.
     *
     * @remarks
     * Uses the Electron main-process clipboard API via IPC to avoid
     * `navigator.clipboard` permission failures in Electron (common when the
     * renderer is not treated as a secure browsing context).
     */
    writeClipboardText: wrap(
        "writeClipboardText",
        async (api: ElectronAPI, text: string): Promise<void> => {
            const result = await api.system.writeClipboardText(text);

            if (typeof result !== "boolean") {
                throw new TypeError(
                    `Invalid response received from writeClipboardText: ${typeof result}`
                );
            }

            if (!result) {
                throw new Error("Electron declined to write clipboard text");
            }
        }
    ),
};
