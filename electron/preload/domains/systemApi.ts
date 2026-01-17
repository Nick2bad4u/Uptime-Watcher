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

import {
    SYSTEM_CHANNELS,
    type SystemDomainBridge,
} from "@shared/types/preload";

import {
    createValidatedInvoker,
    safeParseBooleanResult,
} from "../core/bridgeFactory";

/**
 * Type alias defining the system domain API operations.
 *
 * @public
 */
export type SystemApiInterface = SystemDomainBridge;

/**
 * System domain API providing system-level operations.
 *
 * @public
 */
export const systemApi: SystemApiInterface = {
    /**
     * Opens an external URL in the default browser
     *
     * @param url - URL to open externally
     *
     * @returns Promise resolving to true if URL was opened successfully
     */
    openExternal: createValidatedInvoker(
        SYSTEM_CHANNELS.openExternal,
        safeParseBooleanResult,
        {
            domain: "systemApi",
            guardName: "safeParseBooleanResult",
        }
    ),

    /**
     * Quits the application and installs a pending update
     *
     * @remarks
     * This method triggers the app to quit and automatically install a
     * downloaded update. This is typically called after the user confirms they
     * want to install an available update.
     */
    quitAndInstall: createValidatedInvoker(
        SYSTEM_CHANNELS.quitAndInstall,
        safeParseBooleanResult,
        {
            domain: "systemApi",
            guardName: "safeParseBooleanResult",
        }
    ),

    /**
     * Writes the provided string to the OS clipboard.
     *
     * @remarks
     * Uses Electron's main-process clipboard API to avoid browser clipboard
     * permission issues in hardened Electron contexts.
     */
    writeClipboardText: createValidatedInvoker(
        SYSTEM_CHANNELS.writeClipboardText,
        safeParseBooleanResult,
        {
            domain: "systemApi",
            guardName: "safeParseBooleanResult",
        }
    ),
} as const;

/**
 * Public system API surface exposed via the preload bridge.
 *
 * @public
 */
export type SystemApi = SystemDomainBridge;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
