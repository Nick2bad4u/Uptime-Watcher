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

import { isRecord } from "@shared/utils/typeHelpers";

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
export interface ExtractIpcResponseDataOptions {
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
// eslint-disable-next-line etc/no-misused-generics, @typescript-eslint/no-unnecessary-type-parameters -- The caller provides the expected data type.
export function extractIpcResponseData<T>(
    response: unknown,
    options: ExtractIpcResponseDataOptions = {}
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- IPC envelope validation ensures structure but not the data payload.
    return response.data as T;
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
    options: ExtractIpcResponseDataOptions = {}
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
