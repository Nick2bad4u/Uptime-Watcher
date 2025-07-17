/**
 * Simple logging function to break circular dependencies.
 */

/**
 * Log store actions for debugging.
 */
export function logStoreAction(storeName: string, action: string, payload?: unknown): void {
    if (process.env.NODE_ENV === "development") {
        console.log(`[${storeName}] ${action}`, payload ?? "");
    }
}
