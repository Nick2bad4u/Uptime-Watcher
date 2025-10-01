/**
 * Utility function for generating unique identifiers.
 *
 * @remarks
 * Uses crypto.randomUUID provided by modern Electron/Node.js environments.
 *
 * @packageDocumentation
 */

/**
 * Generate a unique identifier string using crypto.randomUUID.
 *
 * @example
 *
 * ```typescript
 * const id = generateUuid();
 * // Returns: "123e4567-e89b-12d3-a456-426614174000"
 * ```
 *
 * @returns A UUID string in standard format
 */
export function generateUuid(): string {
    if (typeof globalThis.crypto.randomUUID !== "function") {
        throw new TypeError(
            "crypto.randomUUID is unavailable in this environment"
        );
    }

    return globalThis.crypto.randomUUID();
}
