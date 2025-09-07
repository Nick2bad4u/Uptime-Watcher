/**
 * Utility function for generating unique identifiers.
 *
 * @remarks
 * Uses crypto.randomUUID in modern Electron/Node.js environments with a
 * fallback to a timestamp-based ID with random characters for older
 * environments. The fallback ensures the function works in all environments.
 *
 * @packageDocumentation
 */

/**
 * Generate a unique identifier string using crypto.randomUUID with fallback.
 *
 * @example
 *
 * ```typescript
 * const id = generateUuid();
 * // Returns: "123e4567-e89b-12d3-a456-426614174000" (native)
 * // Or: "site-abc123def-1643234567890" (fallback)
 * ```
 *
 * @returns A UUID string in standard format or fallback format
 */
export function generateUuid(): string {
    try {
        // Try to use native crypto.randomUUID if available
        if (
            typeof crypto !== "undefined" &&
            typeof crypto.randomUUID === "function"
        ) {
            return crypto.randomUUID();
        }
    } catch {
        // Fall through to fallback
    }

    // Fallback implementation for environments without crypto.randomUUID
    // Generate multiple random components for better uniqueness
    // eslint-disable-next-line sonarjs/pseudo-random -- Math.random() is acceptable for UUID generation fallback; cryptographic randomness is preferred but not required for site IDs
    const randomPart1 = Math.random().toString(36).slice(2, 8); // 6 chars
    // eslint-disable-next-line sonarjs/pseudo-random -- Multiple calls to Math.random() for better entropy
    const randomPart2 = Math.random().toString(36).slice(2, 8); // 6 chars
    const timestamp = Date.now();
    // eslint-disable-next-line sonarjs/pseudo-random -- Additional randomness to prevent timestamp collisions
    const microseconds = Math.floor(Math.random() * 1000); // 0-999 for sub-millisecond uniqueness
    const paddedMicroseconds = microseconds.toString().padStart(3, "0"); // Always 3 digits
    return `site-${randomPart1}${randomPart2}-${timestamp}${paddedMicroseconds}`;
}
