/**
 * Electron utility functions.
 * Provides common helpers for electron main process operations.
 */

import { app } from "electron";

/**
 * Determines if the application is running in development mode.
 *
 * Checks both NODE_ENV environment variable and Electron's isPackaged property
 * to accurately detect development vs production builds.
 *
 * @returns True if running in development mode, false for production
 *
 * @example
 * ```typescript
 * if (isDev()) {
 *   logger.debug("Running in development mode");
 * }
 * ```
 */
export function isDev(): boolean {
    return process.env.NODE_ENV === "development" || !app.isPackaged;
}
