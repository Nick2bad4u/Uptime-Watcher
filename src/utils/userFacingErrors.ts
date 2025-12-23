/**
 * User-facing error formatting helpers.
 *
 * @remarks
 * Renderer UI code frequently needs to surface a short, human-readable
 * description of an unknown error value.
 *
 * We intentionally keep this logic separate from logging helpers:
 * - logging should prefer {@link ensureError} and structured metadata
 * - UI messages should prioritize the best available human message and fall
 *   back to `String(error)` to preserve existing branch-coverage semantics
 *   (e.g. `[object Object]`).
 *
 * @packageDocumentation
 */

import { isRecord } from "@shared/utils/typeHelpers";

/**
 * Extracts a user-facing error detail from an unknown thrown value.
 *
 * @remarks
 * Semantics are intentionally conservative to preserve existing behavior in UI
 * tests:
 * - {@link Error} values return `error.message`.
 * - Plain objects with a string `message` property return that message.
 * - Everything else falls back to `String(error)`.
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

    return String(error);
}
