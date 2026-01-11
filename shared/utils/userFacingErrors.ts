import { ERROR_CATALOG } from "./errorCatalog";
import { normalizeLogValue } from "./loggingContext";
import { isRecord } from "./typeHelpers";

/**
 * Extracts a short, user-facing error message from an unknown thrown value.
 *
 * @remarks
 * Intended for UI strings and IPC error payloads where we want a stable message
 * without leaking internal details.
 *
 * - {@link Error} values return `error.message`.
 * - Plain objects with a string `message` property return that message.
 * - Strings and numbers are surfaced as-is.
 * - Everything else falls back to {@link ERROR_CATALOG.system.UNKNOWN_ERROR}.
 */
export function getUserFacingErrorDetail(error: unknown): string {
    if (error instanceof Error) {
        const normalized = normalizeLogValue(error.message);
        return typeof normalized === "string" ? normalized : error.message;
    }

    if (isRecord(error)) {
        const messageCandidate = error["message"];
        if (typeof messageCandidate === "string") {
            const normalized = normalizeLogValue(messageCandidate);
            return typeof normalized === "string" ? normalized : messageCandidate;
        }
    }

    if (typeof error === "string") {
        const normalized = normalizeLogValue(error);
        return typeof normalized === "string" ? normalized : error;
    }

    if (typeof error === "number" || typeof error === "bigint") {
        return String(error);
    }

    return ERROR_CATALOG.system.UNKNOWN_ERROR;
}
