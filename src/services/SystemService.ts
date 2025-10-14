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

import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";

const { ensureInitialized, wrap } = ((): ReturnType<
    typeof getIpcServiceHelpers
> => {
    try {
        return getIpcServiceHelpers("SystemService");
    } catch (error: unknown) {
        throw ensureError(error);
    }
})();

interface SystemServiceContract {
    initialize: () => Promise<void>;
    openExternal: (url: string) => Promise<boolean>;
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
            const opened = await api.system.openExternal(url);

            if (typeof opened !== "boolean") {
                throw new TypeError(
                    `Electron declined to open external URL: ${url} (received ${typeof opened})`
                );
            }

            if (!opened) {
                throw new Error(
                    `Electron declined to open external URL: ${url}`
                );
            }

            return opened;
        }
    ),
};
