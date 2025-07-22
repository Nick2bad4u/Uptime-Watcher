/**
 * Electron utility functions for common main process operations.
 *
 * @remarks
 * Provides reusable utility functions for environment detection and development helpers.
 *
 * @packageDocumentation
 */

import { app } from "electron";

import { isDevelopment } from "../shared/utils/environment";

/**
 * Determines if the Electron app is running in development mode (unpackaged and NODE_ENV=development).
 *
 * @remarks
 * This function extends `isDevelopment()` by also checking that the Electron app is not packaged.
 * Use this to distinguish between development and production builds in Electron-specific code.
 *
 * @example
 * ```typescript
 * if (isDev()) {
 *   logger.debug("Running in development mode - enabling debug features");
 *   // Enable hot reload, detailed logging, etc.
 * } else {
 *   logger.info("Running in production mode");
 *   // Optimize for performance, reduce logging
 * }
 * ```
 *
 * @returns `true` if running in Electron development mode (unpackaged and NODE_ENV=development), `false` otherwise
 * @public
 */
export function isDev(): boolean {
    // Returns true only if both isDevelopment() and Electron is not packaged
    return isDevelopment() && !app.isPackaged;
}
