/**
 * Filesystem-related utilities used by {@link CloudService}.
 */

import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { ensureError } from "@shared/utils/errorHandling";

/**
 * Execute an async operation and ignore ENOENT errors.
 */
export async function ignoreENOENT(fn: () => Promise<void>): Promise<void> {
    try {
        await fn();
    } catch (error) {
        if (tryGetErrorCode(error) === "ENOENT") {
            return;
        }
        throw ensureError(error);
    }
}
