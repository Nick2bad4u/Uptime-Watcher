/**
 * Electron utility functions for common main process operations.
 *
 * @remarks
 * Provides reusable utility functions for environment detection and development helpers.
 *
 * @packageDocumentation
 */

import { app } from "electron";

/**
 * Determines if the application is running in development mode.
 *
 * @returns `true` if running in development mode, `false` for production
 *
 * @remarks
 * Uses NODE_ENV and Electron's packaging state to detect runtime environment.
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
 * @public
 */
export function isDev(): boolean {
    return process.env.NODE_ENV === "development" || !app.isPackaged;
}
