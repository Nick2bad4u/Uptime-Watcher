/**
 * System Domain API - Auto-generated preload bridge for system operations
 *
 * @remarks
 * This module provides type-safe IPC communication for system-level operations
 * such as external application launching. As a thin wrapper over the bridge
 * factory, exceptions are intentionally propagated to the frontend for handling
 * at the UI level.
 *
 * @packageDocumentation
 */

/* eslint-disable ex/no-unhandled -- Domain APIs are thin wrappers that don't handle exceptions */

import { ipcRenderer } from "electron";

import { createTypedInvoker } from "../core/bridgeFactory";

/**
 * Interface defining the system domain API operations
 */
export interface SystemApiInterface {
    /**
     * Opens an external URL in the default browser
     *
     * @param url - URL to open externally
     *
     * @returns Promise resolving to true if URL was opened successfully
     */
    openExternal: (...args: unknown[]) => Promise<boolean>;

    /**
     * Quits the application and installs a pending update
     *
     * @remarks
     * This method triggers the app to quit and automatically install a
     * downloaded update. This is typically called after the user confirms they
     * want to install an available update.
     */
    quitAndInstall: () => void;
}

/**
 * System domain API providing system-level operations
 */
export const systemApi: SystemApiInterface = {
    /**
     * Opens an external URL in the default browser
     *
     * @param url - URL to open externally
     *
     * @returns Promise resolving to true if URL was opened successfully
     */
    openExternal: createTypedInvoker<boolean>("open-external") satisfies (
        ...args: unknown[]
    ) => Promise<boolean>,

    /**
     * Quits the application and installs a pending update
     *
     * @remarks
     * This method triggers the app to quit and automatically install a
     * downloaded update. This is typically called after the user confirms they
     * want to install an available update.
     */
    quitAndInstall: (): void => {
        ipcRenderer.send("quit-and-install");
    },
} as const;

export type SystemApi = SystemApiInterface;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
