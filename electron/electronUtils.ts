/**
 * Utility functions for Electron main process operations.
 *
 * @remarks
 * Provides helpers for environment detection and development-mode checks
 * specific to the Electron main process.
 *
 * @packageDocumentation
 */

import { isDevelopment } from "@shared/utils/environment";
import { app } from "electron";

/**
 * Determines if the Electron app is running in development mode.
 *
 * @remarks
 * This function returns `true` only if both:
 *
 * - The `NODE_ENV` environment variable is set to `"development"` (as determined
 *   by `isDevelopment()`), and - The Electron app is not packaged
 *   (`app.isPackaged` is `false`).
 *
 * Use this to distinguish between development and production builds in
 * Electron-specific code, such as enabling hot reload or verbose logging only
 * during development.
 *
 * @example
 *
 * ```typescript
 * if (isDev()) {
 *     logger.debug(
 *         "Running in development mode - enabling debug features"
 *     );
 *     // Enable hot reload, detailed logging, etc.
 * } else {
 *     logger.info("Running in production mode");
 *     // Optimize for performance, reduce logging
 * }
 * ```
 *
 * @returns `true` if running in Electron development mode (unpackaged and
 *   `NODE_ENV=development`), otherwise `false`.
 */
export function isDev(): boolean {
    return isDevelopment() && !app.isPackaged;
}
