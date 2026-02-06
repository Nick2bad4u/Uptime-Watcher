/**
 * IPC-specific error helpers.
 *
 * @remarks
 * Centralizes message normalization and redaction so handler wrappers do not
 * duplicate truncation + sanitization logic.
 */

import { ensureError } from "@shared/utils/errorHandling";
import { normalizeLogValue } from "@shared/utils/loggingContext";
import { isNonEmptyString } from "@shared/validation/validatorUtils";

import { truncateUtfString } from "../diagnosticsLimits";

/** Maximum bytes allowed for IPC error messages returned to the renderer. */
export const MAX_IPC_ERROR_MESSAGE_UTF_BYTES = 4096;

/**
 * Creates a safe error message string for returning to IPC callers.
 */
export function createSafeErrorMessage(error: unknown): string {
    const ensured = ensureError(error);
    return isNonEmptyString(ensured.message)
        ? ensured.message
        : "Unknown error";
}

/**
 * Normalizes an IPC error message for renderer consumption.
 */
export function normalizeIpcErrorMessage(message: string): string {
    // Truncate first to cap redaction work for huge messages.
    const preview = truncateUtfString(
        message,
        MAX_IPC_ERROR_MESSAGE_UTF_BYTES
    ).value;

    const normalized = normalizeLogValue(preview);
    return typeof normalized === "string" ? normalized : preview;
}
