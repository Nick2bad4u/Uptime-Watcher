/**
 * Structured clone helpers for the Electron main-process event system.
 *
 * @remarks
 * We intentionally keep this in the Electron tree (instead of shared) because
 * eslint's type-aware project setup treats some cross-project generic helpers
 * as "error typed" values.
 */

/** A `structuredClone`-compatible function signature. */
export type StructuredCloneFn = <T>(value: T) => T;

/**
 * Returns a bound `structuredClone` function when available.
 */
export const structuredCloneFn: StructuredCloneFn | undefined =
    typeof globalThis.structuredClone === "function"
        ? globalThis.structuredClone.bind(globalThis)
        : undefined;

/**
 * Attempts to structured-clone a value.
 *
 * @returns The cloned value when `structuredClone` is available and succeeds;
 *   otherwise `undefined`.
 */
export function tryStructuredClone<T>(value: T): T | undefined {
    if (!structuredCloneFn) {
        return undefined;
    }

    try {
        return structuredCloneFn(value);
    } catch {
        return undefined;
    }
}
