/**
 * Shared IPC response envelope helpers.
 *
 * @remarks
 * The application standardizes all request/response style IPC handlers on the
 * {@link IpcResponse} envelope. Historically, both preload and renderer code
 * carried their own small helpers for validating/unwrapping that envelope.
 *
 * This module centralizes that logic so:
 *
 * - Preload typed invokers and any diagnostics tooling share identical semantics,
 * - We avoid divergence between "typed" and "void" invokers,
 * - We do not accidentally treat `data: undefined` as a malformed response (valid
 *   for channels whose result type includes `undefined`).
 *
 * @packageDocumentation
 */

import type { IpcResponse } from "@shared/types/ipc";

import { castUnchecked, isRecord } from "@shared/utils/typeHelpers";

/**
 * Runtime type guard for {@link IpcResponse} envelopes.
 *
 * @remarks
 * This guard is intentionally permissive: it only verifies the presence of the
 * required `success: boolean` discriminator. The optional properties (`data`,
 * `error`, `warnings`, `metadata`) are validated in the extractor functions.
 *
 * Keeping the guard permissive avoids brittle coupling to future metadata
 * fields and matches the fuzzing expectations in the test suite.
 */
export function isIpcResponseEnvelope(value: unknown): value is IpcResponse {
    if (!isRecord(value)) {
        return false;
    }

    return typeof value["success"] === "boolean";
}

/**
 * Options for {@link extractIpcResponseData}.
 */
export interface ExtractIpcResponseDataOptions<T = unknown> {
    /**
     * Optional payload parser/validator.
     *
     * @remarks
     * When provided, the parser is used to convert/validate the raw `data`
     * payload. This makes the extractor genuinely type-safe and also allows
     * TypeScript to infer `T` from the parser.
     */
    readonly parse?: (data: unknown) => T;

    /**
     * When true, `success: true` responses must include a defined `data`
     * payload.
     *
     * @remarks
     * Typed preload invokers expect main-process handlers to always include a
     * payload (even if it is `null`). A missing payload usually indicates a
     * handler bug.
     *
     * Some channels may intentionally return `undefined` (e.g. "optional"
     * lookups). Those callers should set this to `false`.
     *
     * @defaultValue true
     */
    readonly requireData?: boolean;
}

const normalizeFailureMessage = (response: IpcResponse): string => {
    const candidate = response.error;
    return typeof candidate === "string" && candidate.trim().length > 0
        ? candidate
        : "IPC operation failed";
};

/**
 * Extracts `data` from a successful {@link IpcResponse} envelope.
 *
 * @remarks
 * -
 *
 * Throws for invalid envelopes.
 *
 * - Throws for `success: false` envelopes.
 * - Does **not** require `data` to be present. A successful response may
 *   legitimately omit `data` (e.g. `T` includes `undefined`).
 */
export function extractIpcResponseData<T>(
    response: unknown,
    options: ExtractIpcResponseDataOptions<T> = {}
): T {
    if (!isIpcResponseEnvelope(response)) {
        throw new Error("Invalid IPC response format");
    }

    if (!response.success) {
        throw new Error(normalizeFailureMessage(response));
    }

    const { requireData = true } = options;
    if (requireData && response.data === undefined) {
        throw new Error("IPC response missing data field");
    }

    const rawData = response.data;
    const { parse } = options;
    return parse ? parse(rawData) : castUnchecked<T>(rawData);
}

/**
 * Validates an {@link IpcResponse} envelope for void-returning operations.
 */
export function validateVoidIpcResponse(response: unknown): void {
    if (!isIpcResponseEnvelope(response)) {
        throw new Error("Invalid IPC response format");
    }

    if (!response.success) {
        throw new Error(normalizeFailureMessage(response));
    }
}

/**
 * Safe wrapper around {@link extractIpcResponseData}.
 */
export function safeExtractIpcResponseData<T>(
    response: unknown,
    fallback: T,
    options: ExtractIpcResponseDataOptions<T> = {}
): T {
    try {
        return extractIpcResponseData<T>(response, {
            requireData: false,
            ...options,
        });
    } catch {
        return fallback;
    }
}
