/**
 * Utility function for generating unique identifiers.
 *
 * @remarks
 * Uses crypto.randomUUID provided by modern Electron/Node.js environments.
 * Falls back to a timestamp-based ID when crypto is unavailable.
 *
 * @packageDocumentation
 */

/**
 * Generate a unique identifier string using crypto.randomUUID.
 *
 * @remarks
 * When crypto.randomUUID is available, returns a standard UUID. When
 * unavailable, falls back to a custom ID format: `site-{random}-{timestamp}`.
 *
 * @example
 *
 * ```typescript
 * const id = generateUuid();
 * // Returns: "123e4567-e89b-12d3-a456-426614174000" (when crypto is available)
 * // or: "site-abc123-1234567890123" (fallback)
 * ```
 *
 * @returns A UUID string in standard format or fallback format
 */
export function generateUuid(): string {
    // Check if crypto and randomUUID are available
    // Use try-catch for runtime environment detection
    try {
        if (typeof globalThis.crypto.randomUUID === "function") {
            return globalThis.crypto.randomUUID();
        }
    } catch {
        // Crypto is not available, fall through to fallback
    }

    // Fallback: Generate a custom ID using timestamp and random string
    // Note: Math.random is acceptable for non-cryptographic IDs
    /* eslint-disable sonarjs/pseudo-random -- Safe for non-security purposes (IDs, not cryptographic keys) */
    const randomPart =
        Math.random().toString(36).slice(2, 8) +
        Math.random().toString(36).slice(2, 8);
    const timestampPart =
        Date.now().toString() +
        Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0");
    /* eslint-enable sonarjs/pseudo-random -- Re-enable check */

    return `site-${randomPart}-${timestampPart}`;
}
