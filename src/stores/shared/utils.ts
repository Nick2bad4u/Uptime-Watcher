/**
 * Simple logging function to break circular dependencies.
 */

import { isDevelopment } from "../../../shared/utils/environment";

/**
 * Log store actions for debugging.
 */
export function logStoreAction(storeName: string, action: string, payload?: unknown): void {
    if (isDevelopment()) {
        console.log(`[${storeName}] ${action}`, payload ?? "");
    }
}
