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

import { waitForElectronAPI } from "../stores/utils";
import { logger } from "./logger";

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
export const SystemService = {
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
    async initialize(): Promise<void> {
        try {
            await waitForElectronAPI();
        } catch (error) {
            logger.error(
                "Failed to initialize SystemService:",
                ensureError(error)
            );
            throw error;
        }
    },

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
     * @throws If the electron API is unavailable or the operation fails.
     */
    async openExternal(url: string): Promise<void> {
        await this.initialize();
        window.electronAPI.system.openExternal(url);
    },

    /**
     * Quits the application and installs a pending update.
     *
     * @remarks
     * Only effective when an update has been downloaded and is ready to
     * install. This will close the application and start the update installer.
     *
     * @throws If the electron API is unavailable.
     */
    async quitAndInstall(): Promise<void> {
        await this.initialize();
        window.electronAPI.system.quitAndInstall();
    },
};
