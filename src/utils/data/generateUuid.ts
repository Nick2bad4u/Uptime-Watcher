/**
 * Utility function for generating unique identifiers.
 * Uses crypto.randomUUID in modern Electron/Node.js environments.
 */

/**
 * Generate a unique identifier string using the modern crypto.randomUUID API.
 *
 * @returns A UUID string in standard format
 *
 * @remarks
 * Uses the native crypto.randomUUID() method which is available in modern
 * Node.js (14.17.0+) and Electron environments. Since we target modern
 * environments, no fallback is needed.
 *
 * @example
 * ```typescript
 * const id = generateUuid();
 * // Returns: "123e4567-e89b-12d3-a456-426614174000"
 * ```
 */
export function generateUuid(): string {
    return crypto.randomUUID();
}
