/**
 * Standardized abort/cancellation errors.
 *
 * @remarks
 * Cancellation happens across multiple subsystems (IPC, monitoring, retries,
 * rate limiting). To make cancellation consistently detectable we standardize
 * on:
 *
 * - `error.name === "AbortError"`
 * - `error.code === "ERR_CANCELED"`
 *
 * This aligns with common cancellation semantics (Axios) and is relied upon by
 * utilities such as `isCancellationError` in the monitoring layer.
 */

/**
 * A standardized abort error.
 */
export type AbortError = Error & {
    /** Optional cancellation code (used by some integrations). */
    readonly code?: string;
};

/**
 * Creates a standardized abort error.
 */
export function createAbortError(args?: {
    readonly cause?: unknown;
    readonly message?: string;
}): AbortError {
    const message = args?.message ?? "Operation was aborted";
    const error = new Error(message, args?.cause ? { cause: args.cause } : {});
    error.name = "AbortError";
    Reflect.set(error, "code", "ERR_CANCELED");
    return error;
}

/**
 * Checks whether an unknown value is a standardized abort error.
 */
export function isAbortError(value: unknown): value is AbortError {
    if (!(value instanceof Error)) {
        return false;
    }

    if (value.name === "AbortError") {
        return true;
    }

    const codeCandidate: unknown = Reflect.get(value, "code");
    return codeCandidate === "ERR_CANCELED";
}
