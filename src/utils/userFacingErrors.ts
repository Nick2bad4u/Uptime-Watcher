/**
 * User-facing error formatting helpers.
 *
 * @remarks
 * Renderer UI code frequently needs to surface a short, human-readable
 * description of an unknown error value.
 *
 * We intentionally keep this logic separate from logging helpers:
 *
 * - Logging should prefer {@link ensureError} and structured metadata
 * - UI messages should prioritize the best available human message and fall
 *   back to a stable catalog message.
 *
 * @packageDocumentation
 */

import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
import { isRecord } from "@shared/utils/typeHelpers";

/**
 * Extracts a user-facing error detail from an unknown thrown value.
 *
 * @remarks
 * Semantics are intentionally conservative:
 *
 * - {@link Error} values return `error.message`.
 * - Plain objects with a string `message` property return that message.
 * - Everything else falls back to {@link ERROR_CATALOG.system.UNKNOWN_ERROR}.
 */
export function getUserFacingErrorDetail(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (isRecord(error)) {
        const messageCandidate = error["message"];
        if (typeof messageCandidate === "string") {
            return messageCandidate;
        }
    }

    if (typeof error === "string") {
        return error;
    }

    if (typeof error === "number" || typeof error === "bigint") {
        return String(error);
    }

    return ERROR_CATALOG.system.UNKNOWN_ERROR;
}
