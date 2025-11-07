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

import { createTypedInvoker } from "../core/bridgeFactory";

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
    openExternal: createTypedInvoker(SYSTEM_CHANNELS.openExternal),

    /**
     * Quits the application and installs a pending update
     *
     * @remarks
     * This method triggers the app to quit and automatically install a
     * downloaded update. This is typically called after the user confirms they
     * want to install an available update.
     */
    quitAndInstall: createTypedInvoker(SYSTEM_CHANNELS.quitAndInstall),
} as const;

/**
 * Public system API surface exposed via the preload bridge.
 *
 * @public
 */
export type SystemApi = SystemDomainBridge;

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
