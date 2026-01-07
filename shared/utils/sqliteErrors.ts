import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { ensureError } from "@shared/utils/errorHandling";

/**
 * Returns true when an error represents an SQLite busy/locked condition.
 *
 * @remarks
 * SQLite lock errors can surface as explicit `code` values (e.g. `SQLITE_BUSY`)
 * or as message strings (e.g. "database is locked"). This helper centralizes
 * the heuristics so services can make consistent retry / fallback decisions.
 */
export function isSqliteLockedError(error: unknown): boolean {
    const code = tryGetErrorCode(error);
    if (code === "SQLITE_BUSY" || code === "SQLITE_LOCKED") {
        return true;
    }

    const normalized = ensureError(error);
    const message = normalized.message.toLowerCase();

    return (
        message.includes("database is locked") ||
        message.includes("sqlite_busy") ||
        message.includes("sqlite_locked")
    );
}
