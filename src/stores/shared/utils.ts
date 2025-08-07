/**
 * Simple logging function to break circular dependencies.
 */

import { isDevelopment } from "../../../shared/utils/environment";
import logger from "../../services/logger";

/**
 * Log store actions for debugging.
 */
export function logStoreAction(
    storeName: string,
    action: string,
    payload?: unknown
): void {
    if (isDevelopment()) {
        if (payload !== undefined) {
            logger.debug(`[${storeName}] ${action}`, payload);
        } else {
            logger.debug(`[${storeName}] ${action}`);
        }
    }
}
